const fs = require('fs')
const path = require('path')

const DOCKER_CLIENT = '/client'
const LOCAL_CLIENT = path.resolve(__dirname, '../../client')

const CLIENT_ROOT = fs.existsSync(path.join(DOCKER_CLIENT, 'dist/index.html'))
  ? DOCKER_CLIENT
  : LOCAL_CLIENT

console.log('[SSR] CLIENT_ROOT resolved to:', CLIENT_ROOT)

const isProd = process.env.NODE_ENV === 'production'

// ── Route-level data fetchers ─────────────────────────────────
// Only public routes — auth-gated pages stay as shell SSR
const API_BASE = `http://localhost:${process.env.PORT || 3000}`

async function fetchSSRData(url) {
  try {
    const cleanUrl = url.split('?')[0] // strip query strings

    if (cleanUrl === '/elections') {
      const res = await fetch(`${API_BASE}/api/elections/public`)
      if (!res.ok) return {}
      const elections = await res.json()
      return { elections }
    }
  } catch (err) {
    console.error('[SSR] data fetch error:', err.message)
  }
  return {}
}

async function createSSRMiddleware(app) {
  let vite
  let template
  let renderFn

  if (!isProd) {
    const { createServer } = await import('vite')
    vite = await createServer({
      root: CLIENT_ROOT,
      server: { middlewareMode: true },
      appType: 'custom',
    })
    app.use(vite.middlewares)

  } else {
    const ssrBundle = path.join(CLIENT_ROOT, 'dist/server/entry-server.js')
    const indexHtml = path.join(CLIENT_ROOT, 'dist/index.html')

    console.log('[SSR] ssrBundle:', ssrBundle)
    console.log('[SSR] indexHtml:', indexHtml)
    console.log('[SSR] ssrBundle exists?', fs.existsSync(ssrBundle))
    console.log('[SSR] indexHtml exists?', fs.existsSync(indexHtml))

    if (!fs.existsSync(ssrBundle)) {
      throw new Error(`[SSR] SSR bundle not found at ${ssrBundle} — did you run 'npm run build' in the client?`)
    }
    if (!fs.existsSync(indexHtml)) {
      throw new Error(`[SSR] index.html not found at ${indexHtml} — did you run 'npm run build' in the client?`)
    }

    const compression = require('compression')
    const sirv = require('sirv')
    app.use(compression())
    app.use('/assets', sirv(path.join(CLIENT_ROOT, 'dist/assets'), { gzip: true }))

    renderFn = (await import(ssrBundle)).render
    template = fs.readFileSync(indexHtml, 'utf-8')
  }

  return async function ssrHandler(req, res, next) {
    const url = req.originalUrl

    if (url.startsWith('/api') || url.startsWith('/health') || url.startsWith('/check')) {
      return next()
    }

    try {
      let html

      if (!isProd) {
        html = fs.readFileSync(path.join(CLIENT_ROOT, 'index.html'), 'utf-8')
        html = await vite.transformIndexHtml(url, html)
        const mod = await vite.ssrLoadModule('/src/entry-server.jsx')
        renderFn = mod.render
      } else {
        html = template
      }

      // ✅ Fetch SSR data for this route
      const ssrData = await fetchSSRData(url)

      const { html: appHtml } = await renderFn(url, ssrData)

      // ✅ Embed data into page for client hydration — no re-fetch needed
      const dataScript = `<script>window.__SSR_DATA__ = ${JSON.stringify(ssrData)}</script>`

      const finalHtml = html
        .replace('<!--ssr-outlet-->', appHtml)
        .replace('</head>', `${dataScript}</head>`)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml)

    } catch (err) {
      if (!isProd && vite) vite.ssrFixStacktrace(err)
      console.error('[SSR Error]', err)
      next(err)
    }
  }
}

module.exports = createSSRMiddleware