const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')

const DOCKER_CLIENT = '/client'
const LOCAL_CLIENT = path.resolve(__dirname, '../../client')

const CLIENT_ROOT = fs.existsSync(path.join(DOCKER_CLIENT, 'dist/index.html'))
  ? DOCKER_CLIENT
  : LOCAL_CLIENT

console.log('[SSR] CLIENT_ROOT resolved to:', CLIENT_ROOT)

const isProd = process.env.NODE_ENV === 'production'
const API_BASE = `http://localhost:${process.env.PORT || 3000}`

// ─── Read and verify the cookie from the SSR request ────────────────────────
function getUserFromRequest(req) {
  try {
    const token = req.cookies?.token
    if (!token) return null
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return null
  }
}

// ─── Fetch SSR data — public and protected routes ────────────────────────────
async function fetchSSRData(url, req) {
  try {
    const cleanUrl = url.split('?')[0]

    // ── PUBLIC ROUTES (no auth needed) ──────────────────────────────────────

    if (cleanUrl === '/' || cleanUrl === '') {
      const res = await fetch(`${API_BASE}/api/elections/public`)
      if (!res.ok) return {}
      const elections = await res.json()
      return { elections }
    }

    if (cleanUrl === '/elections') {
      const res = await fetch(`${API_BASE}/api/elections/public`)
      if (!res.ok) return {}
      const elections = await res.json()
      return { elections }
    }

    // ── PROTECTED ROUTES (need cookie) ───────────────────────────────────────
    // Forward the cookie from the browser request to the internal API call

    const cookie = req.headers.cookie || ''   // e.g. "token=abc123"

    // Admin elections list
    if (cleanUrl === '/admin/elections') {
      const user = getUserFromRequest(req)
      if (!user || user.role !== 'admin') return {}

      const res = await fetch(`${API_BASE}/api/elections`, {
        headers: { Cookie: cookie },
      })
      if (!res.ok) return {}
      const elections = await res.json()
      return { elections }
    }

    // Admin election detail
    const adminElectionMatch = cleanUrl.match(/^\/admin\/elections\/([^/]+)$/)
    if (adminElectionMatch) {
      const user = getUserFromRequest(req)
      if (!user || user.role !== 'admin') return {}

      const id = adminElectionMatch[1]
      const res = await fetch(`${API_BASE}/api/elections/${id}`, {
        headers: { Cookie: cookie },
      })
      if (!res.ok) return {}
      const election = await res.json()
      return { election }
    }

    // Voter ballot page
    const ballotMatch = cleanUrl.match(/^\/vote\/([^/]+)$/)
    if (ballotMatch) {
      const user = getUserFromRequest(req)
      if (!user || user.role !== 'voter') return {}

      const id = ballotMatch[1]
      const res = await fetch(`${API_BASE}/api/elections/${id}/positions/voter`, {
        headers: { Cookie: cookie },
      })
      if (!res.ok) return {}
      const positions = await res.json()
      return { positions }
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
      throw new Error(`[SSR] SSR bundle not found at ${ssrBundle} — did you run 'npm run build'?`)
    }
    if (!fs.existsSync(indexHtml)) {
      throw new Error(`[SSR] index.html not found at ${indexHtml} — did you run 'npm run build'?`)
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

      // 1. Fetch data — pass req so protected routes can read the cookie
      const ssrData = await fetchSSRData(url, req)

      // 2. Render the full React tree to HTML string with data already in it
      const { html: appHtml } = await renderFn(url, ssrData)

      // 3. Embed data for client hydration — no re-fetch needed
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