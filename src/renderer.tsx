import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, ViteClient } from 'vite-ssr-components/hono'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
        <script type="module" src="/ui.js"></script>
      </head>
      <body>
        <div id="container" style={{ margin: '2rem' }}>
          <h2>Strava OAuth Authentication</h2>
          <form id="auth-form" method="post" action="/auth">
            <div>
              <label>Client ID: <input type="text" name="client_id" required /></label>
            </div>
            <div>
              <label>Client Secret: <input type="password" name="client_secret" required /></label>
            </div>
            <div>
              <div className="callback-tip"> Change your Authorize Callback Domain: strava-auth.friendsa.workers.dev </div>
              <img src="/callback-domain.png" alt="callback" className="callback-domain-img" />
            </div>
            <div>
              <label>Scope:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em', margin: '0.5em 0 1em 0' }}>
                <label><input type="checkbox" name="scope" value="read_all" checked /> read_all</label>
                <label><input type="checkbox" name="scope" value="activity:read_all" checked /> activity:read_all</label>
                <label><input type="checkbox" name="scope" value="activity:write" checked /> activity:write</label>
              </div>
            </div>
            <button id="auth-btn" type="submit">Start Authorization</button>
            <div id="waiting" style={{ display: 'none', marginTop: '1em', color: '#888' }}>Waiting for redirect...</div>
            <div id="auth-result" style={{ display: 'none', marginTop: '1em' }}></div>
          </form>
        </div>
        {children}
      </body>
    </html>
  )
})
