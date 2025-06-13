window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll<HTMLInputElement>('input[type=checkbox][name=scope]').forEach(cb => cb.checked = true);
    }, 0);

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const waiting = document.getElementById('waiting') as HTMLElement | null;
    const result = document.getElementById('auth-result') as HTMLElement | null;
    let errorBlock = document.getElementById('auth-error') as HTMLElement | null;
    if (!errorBlock) {
        errorBlock = document.createElement('div');
        errorBlock.id = 'auth-error';
        errorBlock.style.display = 'none';
        if (result && result.parentElement) {
            result.parentElement.appendChild(errorBlock);
        }
    }

    function showError(msg: string, jsonObj?: any) {
        if (result) {
            result.classList.add('error-mode');
            let message = (jsonObj && jsonObj.message) ? jsonObj.message : (msg || 'Error');
            result.innerHTML =
                (code ? '<div class="auth-block"><span class="auth-label">Code</span><span class="auth-code-value">' + code + '</span></div>' : '') +
                '<div class="auth-block error"><span class="auth-label">Refresh Token</span>' +
                '<span class="auth-refresh-error">' + message + '</span></div>';
            result.style.display = 'block';
        }
        if (errorBlock) errorBlock.style.display = 'none';
    }
    function hideError() {
        if (result) result.classList.remove('error-mode');
        if (errorBlock) errorBlock.style.display = 'none';
    }

    if (code) {
        if (waiting) waiting.style.display = 'none';
        if (result) {
            result.classList.remove('error-mode');
            result.innerHTML =
                '<div class="auth-block"><span class="auth-label">Code</span><span class="auth-code-value">' + code + '</span></div>' +
                '<div class="auth-block"><span class="auth-label">Refresh Token</span><span class="auth-refresh-value">正在获取...</span></div>';
            result.style.display = 'block';
            hideError();
            const clientId = localStorage.getItem('client_id') || '';
            const clientSecret = localStorage.getItem('client_secret') || '';
            if (clientId && clientSecret) {
                fetch('/exchange_token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code=${encodeURIComponent(code)}`
                })
                    .then(res => res.json())
                    .then((data: any) => {
                        if (data.refresh_token && data.access_token) {
                            result.classList.remove('error-mode');
                            result.innerHTML =
                                '<div class="auth-block"><span class="auth-label">Code</span><span class="auth-code-value">' + code + '</span></div>' +
                                '<div class="auth-block success"><span class="auth-label">Access Token</span><span class="auth-refresh-value">' + data.access_token + '</span></div>' +
                                '<div class="auth-block success"><span class="auth-label">Refresh Token</span><span class="auth-refresh-value">' + data.refresh_token + '</span></div>';
                            hideError();
                        } else {
                            showError('Missing token in response', data);
                        }
                    })
                    .catch((err: any) => {
                        showError('ERROR: ' + err);
                    });
            } else {
                result.innerHTML = '<div class="auth-block error"><span class="auth-label">Refresh Token</span><span class="auth-refresh-error">请先输入 Client ID 和 Client Secret</span></div>';
                result.style.display = 'block';
                hideError();
            }
        }
    } else {
        if (result) result.style.display = 'none';
        hideError();
    }

    const form = document.getElementById('auth-form') as HTMLFormElement | null;
    const button = document.getElementById('auth-btn') as HTMLButtonElement | null;
    if (form) {
        form.onsubmit = function () {
            if (button) button.disabled = true;
            if (waiting) waiting.style.display = 'block';
        }
    }
    const clientIdInput = document.getElementsByName('client_id')[0] as HTMLInputElement | undefined;
    const clientSecretInput = document.getElementsByName('client_secret')[0] as HTMLInputElement | undefined;
    if (clientIdInput && localStorage.getItem('client_id')) {
        clientIdInput.value = localStorage.getItem('client_id')!;
    }
    if (clientSecretInput && localStorage.getItem('client_secret')) {
        clientSecretInput.value = localStorage.getItem('client_secret')!;
    }
    if (clientIdInput) {
        clientIdInput.addEventListener('input', e => localStorage.setItem('client_id', (e.target as HTMLInputElement).value));
    }
    if (clientSecretInput) {
        clientSecretInput.addEventListener('input', e => localStorage.setItem('client_secret', (e.target as HTMLInputElement).value));
    }
});