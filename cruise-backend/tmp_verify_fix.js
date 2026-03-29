const http = require('http');

async function getCsrf() {
  return new Promise((resolve) => {
    http.get('http://localhost:3001/api/auth/csrf-token', (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({
        token: JSON.parse(d).csrfToken,
        cookie: res.headers['set-cookie'][0].split(';')[0]
      }));
    });
  });
}

async function login(email, cookie, token) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ email, password: 'Admin1234!' });
    const req = http.request('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Cookie': cookie,
        'X-CSRF-Token': token
      }
    }, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
    req.write(payload);
    req.end();
  });
}

async function test() {
  try {
    const { token, cookie } = await getCsrf();
    
    console.log('--- Testing Mixed Case ---');
    const res1 = await login('ADMIN@CRUISELINE.COM', cookie, token);
    console.log('Status ADMIN@CRUISELINE.COM:', res1.status);

    console.log('--- Testing Padded Email ---');
    const res2 = await login(' admin@cruiseline.com ', cookie, token);
    console.log('Status " admin@cruiseline.com ":', res2.status);
  } catch (err) {
    console.error(err);
  }
}

test();
