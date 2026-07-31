import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

const secret = "raza-stationers-test-secret-1234567890";

const adminToken = jwt.sign(
  { sub: 'user_admin123', email: 'admin@razastationers.com', role: 'admin' },
  secret,
  { expiresIn: '1h' }
);

async function main() {
  try {
    const form = new FormData();
    const csvPath = path.resolve('data/final/Raza-Stationers-Final-Supabase-Catalogue.csv');
    form.append('file', fs.createReadStream(csvPath), {
      filename: 'Raza-Stationers-Final-Supabase-Catalogue.csv',
      contentType: 'text/csv',
    });

    console.log('Sending real CSV to API...');
    const res = await axios.post('http://localhost:4000/admin/imports/catalogue', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${adminToken}`
      },
      validateStatus: () => true,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.log('Request failed:', e.message);
  }
}

main();
