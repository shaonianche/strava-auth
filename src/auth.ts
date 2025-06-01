import { Hono } from 'hono'

const REDIRECT_URI = 'https://strava-auth.friendsa.workers.dev'

const authApp = new Hono()

authApp.post('/auth', async (c) => {
    const body = await c.req.parseBody()
    const clientId = body['client_id']
    let scope = body['scope']

    if (Array.isArray(scope)) {
        scope = scope.join(',')
    }

    const redirectUri = encodeURIComponent(REDIRECT_URI)
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=auto&scope=${scope}`

    return c.redirect(stravaAuthUrl)
})

authApp.post('/exchange_token', async (c) => {
    const body = await c.req.parseBody()
    const clientId = body['client_id']
    const clientSecret = body['client_secret']
    const code = body['code']

    const params = new URLSearchParams()
    params.set('client_id', String(clientId))
    params.set('client_secret', String(clientSecret))
    params.set('code', String(code))
    params.set('grant_type', 'authorization_code')
    params.set('redirect_uri', REDIRECT_URI)

    const resp = await fetch('https://www.strava.com/api/v3/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    })
    const data = await resp.json()
    return c.json(data)
})

authApp.get('/callback', (c) => {
    const code = c.req.query('code')
    if (code) {
        return c.text(`Authorization successful! Code: ${code}`)
    } else {
        return c.text('Authorization failed or denied.')
    }
})

export default authApp 