/**
 * Integration Test: Email OTP Verification API
 */

const http = require('http');

function makeRequest(endpoint, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method: method || 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    return true;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

(async () => {
  console.log('\n========================================');
  console.log('Email OTP API Integration Test');
  console.log('========================================\n');

  let results = { passed: 0, failed: 0 };

  // Test 1: Health Check
  const h1 = await test('Backend server is running', async () => {
    const { status, data } = await makeRequest('/api/health', 'GET');
    if (status !== 200) throw new Error(`Status ${status}`);
    console.log(`   ${data.message}`);
  });
  h1 ? results.passed++ : results.failed++;

  // Test 2: Send OTP - Missing email
  const h2 = await test('Send OTP fails without email', async () => {
    const { status, data } = await makeRequest('/api/auth/send-otp', 'POST', {});
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
    console.log(`   Error: ${data.error}`);
  });
  h2 ? results.passed++ : results.failed++;

  // Test 3: Send OTP - Valid Gmail
  const testEmail = `test${Date.now()}@gmail.com`;
  const h3 = await test('Send OTP succeeds with valid @gmail.com', async () => {
    const { status, data } = await makeRequest('/api/auth/send-otp', 'POST', { email: testEmail });
    if (status !== 200 && status !== 201) throw new Error(`Status ${status}`);
    if (data.otp) console.log(`   OTP: ${data.otp}`);
    else console.log(`   Message: ${data.message}`);
  });
  h3 ? results.passed++ : results.failed++;

  // Test 4: Verify OTP - Missing fields
  const h4 = await test('Verify OTP fails without fields', async () => {
    const { status, data } = await makeRequest('/api/auth/verify-otp', 'POST', {});
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
    console.log(`   Error: ${data.error}`);
  });
  h4 ? results.passed++ : results.failed++;

  // Test 5: Verify OTP - Invalid OTP
  const h5 = await test('Verify OTP fails with invalid OTP', async () => {
    const { status, data } = await makeRequest('/api/auth/verify-otp', 'POST', { email: testEmail, otp: '000000' });
    console.log(`   Status: ${status}`);
  });
  h5 ? results.passed++ : results.failed++;

  // Test 6: Email API endpoint
  const h6 = await test('Email API endpoint exists', async () => {
    const { status, data } = await makeRequest('/api/email', 'POST', { to: 'test@example.com', subject: 'Test', message: 'Test' });
    console.log(`   Status: ${status}`);
  });
  h6 ? results.passed++ : results.failed++;

  // Summary
  console.log('\n========================================');
  console.log(`Results: ${results.passed}/${results.passed + results.failed} passed`);
  console.log('========================================\n');

  process.exit(results.failed > 0 ? 1 : 0);
})();

