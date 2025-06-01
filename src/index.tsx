import { Hono } from 'hono'
import { renderer } from './renderer'
import authApp from './auth'

const app = new Hono()

app.use(renderer)
app.route('/', authApp)

app.get('/', (c) => {
  return c.render('');
})

export default app
