import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import AppWrapper from './AppWrapper'

export function render(url, ssrData = {}) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AppWrapper ssrData={ssrData} />
    </StaticRouter>
  )
  return { html }
}