import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import AppWrapper from './AppWrapper'

export function render(url, context = {}) {
  const html = renderToString(
    <StaticRouter location={url}>
      <AppWrapper ssrContext={context} />
    </StaticRouter>
  )
  return { html }
}