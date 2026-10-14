const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const path = require('node:path');

const databaseName = `travlr_auth_test_${Date.now()}`;
const environment = {
  ...process.env,
  MONGODB_URI: `mongodb://127.0.0.1:27017/${databaseName}`,
  JWT_SECRET: 'integration-test-secret-only',
  JWT_EXPIRES_IN: '1h',
  ADMIN_NAME: 'Integration Admin',
  ADMIN_EMAIL: 'admin.integration@example.test',
  ADMIN_PASSWORD: 'integration-test-password'
};

const run = async () => {
  const root = path.join(__dirname, '..');
  const firstSeed = execFileSync(process.execPath, ['bin/seedAdmin'], { cwd: root, env: environment, encoding: 'utf8' });
  const secondSeed = execFileSync(process.execPath, ['bin/seedAdmin'], { cwd: root, env: environment, encoding: 'utf8' });
  assert.match(firstSeed, /Created admin account/);
  assert.match(secondSeed, /already exists; password was not changed/);

  Object.assign(process.env, environment);
  const mongoose = require('mongoose');
  const app = require('../app');
  const server = http.createServer(app);
  await mongoose.connection.asPromise();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const request = (path, options = {}) => fetch(`${baseUrl}${path}`, options);
  let uploadedImagePath;

  try {
    const publicTrips = await request('/api/trips');
    assert.notEqual(publicTrips.status, 401, 'public browsing must not require a token');

    assert.equal((await request('/api/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: environment.ADMIN_EMAIL, password: 'wrong-password' })
    })).status, 401);

    const registration = await request('/api/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Standard User', email: 'user.integration@example.test', password: 'another-test-password', role: 'admin' })
    });
    assert.equal(registration.status, 201);
    const standardUser = await registration.json();
    assert.equal(standardUser.user.role, 'user', 'registration must not grant the submitted admin role');

    const trip = {
      code: 'AUTH-TEST', name: 'Authentication Test Trip', length: '3 nights',
      start: '2030-01-01', resort: 'Test Resort', perPerson: '$999',
      image: 'test.jpg', description: 'Temporary integration-test record.'
    };
    const jsonHeaders = { 'Content-Type': 'application/json' };
    assert.equal((await request('/api/trips', { method: 'POST', headers: jsonHeaders, body: JSON.stringify(trip) })).status, 401);
    assert.equal((await request('/api/trips/upload', { method: 'POST' })).status, 401);
    assert.equal((await request('/api/trips', {
      method: 'POST', headers: { ...jsonHeaders, Authorization: `Bearer ${standardUser.token}` }, body: JSON.stringify(trip)
    })).status, 403);

    const expiredToken = jwt.sign({ sub: standardUser.user.id, role: 'user' }, environment.JWT_SECRET, { expiresIn: -1 });
    assert.equal((await request('/api/trips', {
      method: 'POST', headers: { ...jsonHeaders, Authorization: `Bearer ${expiredToken}` }, body: JSON.stringify(trip)
    })).status, 401);
    assert.equal((await request('/api/trips', {
      method: 'POST', headers: { ...jsonHeaders, Authorization: 'Bearer not-a-valid-jwt' }, body: JSON.stringify(trip)
    })).status, 401);

    const publicMessage = await request('/api/messages', {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ kind: 'contact', name: 'Test Guest', email: 'guest@example.test', message: 'Test message.' })
    });
    assert.equal(publicMessage.status, 201);
    const submittedMessage = await publicMessage.json();
    assert.equal((await request('/api/messages')).status, 401);
    assert.equal((await request('/api/messages', {
      headers: { Authorization: `Bearer ${standardUser.token}` }
    })).status, 403);

    const login = await request('/api/login', {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ email: environment.ADMIN_EMAIL, password: environment.ADMIN_PASSWORD })
    });
    assert.equal(login.status, 200);
    const admin = await login.json();
    assert.equal(admin.user.role, 'admin');
    const adminHeaders = { ...jsonHeaders, Authorization: `Bearer ${admin.token}` };

    const uploadForm = new FormData();
    uploadForm.append('image', new Blob(['test image'], { type: 'image/png' }), 'auth-test.png');
    const upload = await request('/api/trips/upload', { method: 'POST', headers: { Authorization: `Bearer ${admin.token}` }, body: uploadForm });
    assert.equal(upload.status, 201);
    const uploadedImage = await upload.json();
    uploadedImagePath = path.join(root, 'public/images', uploadedImage.filename);
    await fs.access(uploadedImagePath);

    assert.equal((await request('/api/trips', { method: 'POST', headers: adminHeaders, body: JSON.stringify(trip) })).status, 201);
    assert.equal((await request('/api/trips/AUTH-TEST', {
      method: 'PUT', headers: adminHeaders, body: JSON.stringify({ name: 'Updated Authentication Test Trip' })
    })).status, 200);
    assert.equal((await request('/api/trips/AUTH-TEST', { method: 'DELETE', headers: adminHeaders })).status, 200);

    const messages = await request('/api/messages', { headers: adminHeaders });
    assert.equal(messages.status, 200);
    assert.ok((await messages.json()).some((message) => message._id === submittedMessage._id));
    assert.equal((await request(`/api/messages/${submittedMessage._id}/read`, {
      method: 'PATCH', headers: adminHeaders, body: JSON.stringify({ isRead: true })
    })).status, 200);

    const preflight = await request('/api/trips', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:4200', 'Access-Control-Request-Headers': 'authorization,content-type' }
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-headers') || '', /Authorization/i);
    console.log('Authentication flow checks passed.');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (uploadedImagePath) await fs.rm(uploadedImagePath, { force: true });
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
