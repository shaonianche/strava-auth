import { Hono } from 'hono'
import { renderer } from './renderer'
import authApp from './auth'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use(renderer)
app.route('/', authApp)
app.use('/public/*', serveStatic({ manifest: {} }))

app.get('/', (c) => {
  return c.render('');
})

export default app
