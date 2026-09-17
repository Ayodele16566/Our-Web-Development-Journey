const http = require('http');

function request(method, path, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = http.request({
      host: '127.0.0.1',
      port: 8080,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(path, 'HTTP', res.statusCode, JSON.stringify(parsed));
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          console.log(path, 'HTTP', res.statusCode, data);
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async function main() {
  const signupUser = { name: 'Fresh Server', email: 'fresh@example.com', password: 'secret' };
  const signup = await request('POST', '/api/signup', signupUser);
  const signin = await request('POST', '/api/signin', { email: 'fresh@example.com', password: 'secret' });
  const save = await request('POST', '/api/save-plan', {
    email: 'fresh@example.com',
    goal: 'Eat balanced Nigerian meals',
    meals: ['Chicken Jollof and Plantain', 'Brown Rice and Chicken Stew']
  });

  const db = require('./database.json');
  console.log('users in db:', db.users.length);
  console.log('plans in db:', db.plans.length);
})();
