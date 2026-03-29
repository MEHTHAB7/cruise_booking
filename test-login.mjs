import fs from 'fs';

async function testLogin(email, password, role) {
  try {
    console.log(`Testing ${role} login for ${email}...`);
    
    // 1. Get CSRF token
    const csrfRes = await fetch('http://localhost:3001/api/auth/csrf-token');
    if (!csrfRes.ok) {
        throw new Error('Failed to fetch CSRF token: ' + csrfRes.statusText);
    }
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    
    // Read set-cookie
    const setCookieString = csrfRes.headers.get('set-cookie');
    let cookie = '';
    if (setCookieString) {
        cookie = setCookieString.split(';')[0];
    }
    
    // 2. Login
    // Note: csurf middleware looks for headers:
    // 'csrf-token', 'xsrf-token', 'x-csrf-token', 'x-xsrf-token'
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'cookie': cookie
      },
      body: JSON.stringify({ email, password })
    });
    
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
       console.log(`✅ Success logging in as ${role}! \nUser Role: ${loginData.user?.role}`);
       
       // Optional: Test an admin endpoint to verify the session
       if (role === 'Admin') {
           const newSessionCookie = loginRes.headers.get('set-cookie')?.split(';')[0] || cookie;
           const adminRes = await fetch('http://localhost:3001/api/secure-admin-9f3x/dashboard', {
               headers: {
                   'cookie': newSessionCookie
               }
           });
           if (adminRes.ok) {
               console.log(`✅ Admin Dashboard accessible! Response:`, await adminRes.json());
           } else {
               console.error(`❌ Admin Dashboard failed:`, adminRes.status, await adminRes.text());
           }
       }
    } else {
       console.error(`❌ Failed logging in as ${role}! Status: ${loginRes.status}`, loginData);
    }
  } catch(e) {
    console.error(`❌ Error during ${role} test:`, e);
  }
}

async function main() {
    await testLogin('admin@cruiseline.com', 'Admin1234!', 'Admin');
    console.log('---------------------');
    await testLogin('guest@example.com', 'Guest1234!', 'User');
}

main();
