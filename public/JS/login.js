const $ = el => document.querySelector(el)

const loginForm = $('#login-form')
const loginSpan = $('#login-form span')
const registerForm = $('#register-form')
const registerSpan = $('#register-form span')
const logoutButton = $('#close-session')


loginForm?.addEventListener('submit', e => {
    e.preventDefault()

    const username = $('#login-username').value
    const password = $('#login-password').value

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => {
            if (res.ok) {
                loginSpan.innerText = 'Sesión iniciada. Entrando...'
                loginSpan.style.color = 'green'
                setTimeout(() => { window.location.href = '/menu_principal' }, 2000)
            } else {
                loginSpan.innerText = 'Error al iniciar sesión'
                loginSpan.style.color = 'red'
            }
        })
})

registerForm?.addEventListener('submit', e => {
    e.preventDefault()

    const username = $('#register-username').value
    const email = $('#register-email').value
    const password = $('#register-password').value
    const confirmPassword = $('#register-confirm-password').value

    if (password !== confirmPassword) {
        registerSpan.innerText = 'Las contraseñas no coinciden'
        registerSpan.style.color = 'red'
        return
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    })
        .then(res => {
            if (res.ok) {
                registerSpan.innerText = 'Revisa tu correo para confirmar tu cuenta'
                registerSpan.style.color = 'green'
                setTimeout(() => { registerForm.reset() }, 2000)
            } else {
                return res.text().then(text => {
                    registerSpan.innerText = text
                    registerSpan.style.color = 'red'
                })
            }
        })
})

logoutButton?.addEventListener('click', e => {
    e.preventDefault()
    fetch('/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(res => { window.location.href = '/' })
})

document.getElementById('inicio-btn')?.addEventListener('click', () => {
    fetch('/', { method: 'GET' }).then(() => { window.location.href = '/' })
})

