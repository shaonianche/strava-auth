import { Hono } from 'hono'

const REDIRECT_URI = 'https://strava-auth.friendsa.workers.dev'

const authApp = new Hono()

authApp.post('/auth', async (c) => {
    const formData = await c.req.formData();
    console.log('Received FormData keys:', Array.from((formData as any).keys()));

    const clientId = (formData as globalThis.FormData).get('client_id') as string;

    const scopesArray = (formData as globalThis.FormData).getAll('scope') as string[];

    console.log('Scopes from formData.getAll():', scopesArray);
    console.log('Type of scopes from formData.getAll():', typeof scopesArray);
    console.log('Is scopes from formData.getAll() an array?:', Array.isArray(scopesArray));

    let scope = '';
    if (scopesArray && scopesArray.length > 0) {
        scope = scopesArray.filter(s => typeof s === 'string').join(',');
        console.log('Scopes array is valid, joined to:', scope);
    } else {
        const singleScope = (formData as globalThis.FormData).get('scope') as string;
        if (singleScope) {
            scope = singleScope;
            console.log('Scopes array was empty/invalid, used single value from formData.get():', scope);
        } else {
            console.log('No scope found in formData.');
        }
    }
    console.log('Final scope string:', scope);

    if (!clientId) {
        console.error('Client ID is missing from form data');
        return c.text('Client ID is required', 400);
    }
    if (!scope) {
        console.error('Scope is missing from form data');
    }

    const redirectUri = encodeURIComponent(REDIRECT_URI);
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=auto&scope=${scope}`;

    return c.redirect(stravaAuthUrl);
})

authApp.post('/exchange_token', async (c) => {
    const formData = await c.req.formData();
    const clientId = formData.get('client_id') as string;
    const clientSecret = formData.get('client_secret') as string;
    const code = formData.get('code') as string;

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