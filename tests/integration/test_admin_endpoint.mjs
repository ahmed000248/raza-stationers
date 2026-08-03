import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import { TEST_API_URL, TEST_JWT_SECRET } from '../helpers/test-environment.mjs';

const secret = TEST_JWT_SECRET;

const adminToken = jwt.sign(
  { sub: 'user_admin123', email: 'admin@razastationers.com', role: 'admin' },
  secret,
  { expiresIn: '1h' }
);

const userToken = jwt.sign(
  { sub: 'user_regular456', email: 'user@razastationers.com', role: 'user' },
  secret,
  { expiresIn: '1h' }
);

async function testAuth(token, role) {
  try {
    const form = new FormData();
    // We create a dummy CSV with wrong headers, so the importer parser will return 0 valid rows
    // and just exit without touching the DB.
    form.append('file', Buffer.from('dummy,csv,data\n,Name,Cat'), {
      filename: 'dummy.csv',
      contentType: 'text/csv',
    });

    const res = await axios.post(`${TEST_API_URL}/admin/imports/catalogue/plan`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      },
      // Do not throw on 4xx/5xx to let us inspect it
      validateStatus: () => true 
    });

    console.log(`[${role}] Status:`, res.status);
    console.log(`[${role}] Data:`, res.data);
  } catch (e) {
    console.log(`[${role}] Request failed:`, e.message);
  }
}

async function main() {
  console.log('Testing Regular User token (should be 403 or 401)...');
  await testAuth(userToken, 'USER');
  
  console.log('\nTesting Admin token (should be 201 or 400 because of invalid CSV)...');
  await testAuth(adminToken, 'ADMIN');
}

main();
