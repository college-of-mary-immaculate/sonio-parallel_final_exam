Admin Login directly

fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' })
}).then(r => r.json()).then(d => {
  console.log('login result:', d)
  console.log('cookies:', document.cookie)
})


Voter  login 
fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'voter1@gmail.com', password: 'voter1' })
}).then(r => r.json()).then(d => {
  console.log('login result:', d)
  console.log('cookies:', document.cookie)