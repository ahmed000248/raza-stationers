import { createAPIClient } from '@raza-stationers/api';
import assert from 'assert';

console.log('=== STARTING GATE 1 AUTH & 401 INTERCEPTION TESTS ===');

// Mock global fetch for testing
let lastRequestHeaders = null;
global.fetch = async (url, options) => {
  lastRequestHeaders = options.headers;
  
  if (url.includes('/users/me')) {
    // Return 401 Unauthorized for expired token test
    if (options.headers['Authorization'] === 'Bearer expired_token') {
      return {
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ message: 'Unauthorized' }),
        json: async () => ({ message: 'Unauthorized' })
      };
    }
    // Return 200 OK for valid token
    if (options.headers['Authorization'] === 'Bearer valid_token') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: '1', role: 'admin', name: 'Admin User', mobileNumber: '03001234567' })
      };
    }
  }

  // Fallback
  return {
    ok: false,
    status: 404,
    text: async () => 'Not found'
  };
};

async function testValidToken() {
  let unauthorizedCalled = false;
  const client = createAPIClient({
    baseUrl: 'http://mock-api',
    authToken: 'valid_token',
    onUnauthorized: () => {
      unauthorizedCalled = true;
    }
  });

  const profile = await client.getProfile();
  assert.strictEqual(profile.id, '1');
  assert.strictEqual(unauthorizedCalled, false, 'onUnauthorized should not be called for valid token');
  console.log('[PASS] Valid token retrieves profile successfully');
}

async function testExpiredTokenInterception() {
  let unauthorizedCalled = false;
  const client = createAPIClient({
    baseUrl: 'http://mock-api',
    authToken: 'expired_token',
    onUnauthorized: () => {
      unauthorizedCalled = true;
    }
  });

  try {
    await client.getProfile();
    assert.fail('Request with expired token should throw an error');
  } catch (err) {
    assert.ok(err.message.includes('401'), 'Error message should contain 401');
    assert.strictEqual(unauthorizedCalled, true, 'onUnauthorized callback should be triggered on 401');
    console.log('[PASS] Expired token correctly triggers 401 callback and throws');
  }
}

async function run() {
  try {
    await testValidToken();
    await testExpiredTokenInterception();
    console.log('=== ALL GATE 1 AUTH TESTS PASSED ===');
  } catch (err) {
    console.error('--- GATE 1 AUTH TESTS FAILED ---');
    console.error(err);
    process.exit(1);
  }
}

run();
