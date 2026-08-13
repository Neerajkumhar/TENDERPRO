const app = require('./index');
const http = require('http');

let server;
let port = 5001; // use port 5001 for test runner to avoid conflict
let token = '';
let adminUserId = '';

const testResults = [];

function logResult(endpoint, method, status, expected, details = '') {
  const passed = Array.isArray(expected) ? expected.includes(status) : status === expected;
  testResults.push({
    endpoint,
    method,
    status,
    expected,
    passed,
    details
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${method} ${endpoint} -> Status: ${status} (Expected: ${expected}) ${details ? '| ' + details : ''}`);
}

function makeRequest(path, method = 'GET', body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (authToken || token) {
      options.headers['Authorization'] = `Bearer ${authToken || token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  server = app.listen(port, async () => {
    console.log(`Test server running on port ${port}\n--- STARTING API TESTS ---\n`);
    
    try {
      // 1. Health check & Root
      let res = await makeRequest('/');
      logResult('/', 'GET', res.status, 200, res.data.message);

      res = await makeRequest('/api/health');
      logResult('/api/health', 'GET', res.status, 200, res.data.status);

      // 2. Auth Login
      res = await makeRequest('/api/auth/login', 'POST', {
        email: 'vikash@vagwiin.com',
        password: '12345678'
      });
      logResult('/api/auth/login', 'POST', res.status, 200, res.data.email);
      if (res.status === 200 && res.data.token) {
        token = res.data.token;
        adminUserId = res.data.id;
      }

      // Test login failure
      res = await makeRequest('/api/auth/login', 'POST', {
        email: 'vikash@vagwiin.com',
        password: 'wrongpassword'
      });
      logResult('/api/auth/login (Invalid Pass)', 'POST', res.status, 401);

      // 3. Departments
      res = await makeRequest('/api/departments');
      logResult('/api/departments', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newDeptId = null;
      res = await makeRequest('/api/departments', 'POST', {
        name: 'Test Dept ' + Date.now(),
        description: 'Test Department',
        color: '#ff0000'
      });
      logResult('/api/departments', 'POST', res.status, [200, 201]);
      if (res.data && res.data.id) newDeptId = res.data.id;

      // 4. Clients
      res = await makeRequest('/api/clients');
      logResult('/api/clients', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newClientId = null;
      res = await makeRequest('/api/clients', 'POST', {
        name: 'Test Client ' + Date.now(),
        email: `testclient_${Date.now()}@example.com`,
        phone: '1234567890',
        location: 'Test City',
        industry: 'IT',
        status: 'Active',
        firmType: 'Private'
      });
      logResult('/api/clients', 'POST', res.status, [200, 201]);
      if (res.data && res.data.id) newClientId = res.data.id;

      if (newClientId) {
        res = await makeRequest(`/api/clients/${newClientId}/interactions`, 'POST', {
          type: 'Call',
          text: 'Initial test call with client',
          user: 'Admin'
        });
        logResult(`/api/clients/${newClientId}/interactions`, 'POST', res.status, [200, 201]);
      }

      // 5. Tenders
      res = await makeRequest('/api/tenders');
      logResult('/api/tenders', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newTenderId = null;
      if (newClientId) {
        res = await makeRequest('/api/tenders', 'POST', {
          title: 'Test Tender ' + Date.now(),
          clientId: newClientId,
          reference: 'REF-' + Date.now(),
          category: 'Government',
          bidType: 'Bid',
          submissionDate: '2026-12-31',
          budget: 100000,
          status: 'Active'
        });
        logResult('/api/tenders', 'POST', res.status, [200, 201]);
        if (res.data && res.data.id) newTenderId = res.data.id;
      }

      if (newTenderId) {
        res = await makeRequest(`/api/tenders/${newTenderId}`);
        logResult(`/api/tenders/${newTenderId}`, 'GET', res.status, 200);
      }

      // 6. Assignments
      res = await makeRequest('/api/assignments');
      logResult('/api/assignments', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newAssignmentId = null;
      if (newTenderId && newDeptId && adminUserId) {
        res = await makeRequest('/api/assignments', 'POST', {
          title: 'Test Assignment ' + Date.now(),
          tenderId: newTenderId,
          departmentId: newDeptId,
          assigneeId: adminUserId,
          description: 'Test assignment description for automated testing',
          priority: 'High',
          deadline: '2026-12-01',
          status: 'Pending'
        });
        logResult('/api/assignments', 'POST', res.status, [200, 201]);
        if (res.data && res.data.id) newAssignmentId = res.data.id;
      }

      // 7. Tasks
      res = await makeRequest('/api/tasks');
      logResult('/api/tasks', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newTaskId = null;
      if (newTenderId && newAssignmentId && adminUserId) {
        res = await makeRequest('/api/tasks', 'POST', {
          title: 'Test Task ' + Date.now(),
          tenderId: newTenderId,
          assignmentId: newAssignmentId,
          assigneeId: adminUserId,
          priority: 'Medium',
          deadline: '2026-11-30',
          status: 'In Progress'
        });
        logResult('/api/tasks', 'POST', res.status, [200, 201]);
        if (res.data && res.data.id) newTaskId = res.data.id;
      }

      // 8. Reminders
      res = await makeRequest('/api/reminders');
      logResult('/api/reminders', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      res = await makeRequest('/api/reminders', 'POST', {
        title: 'Test Reminder',
        description: 'Test Description',
        date: '2026-12-01',
        time: '10:00 AM',
        type: 'Event'
      });
      logResult('/api/reminders', 'POST', res.status, [200, 201]);

      // 9. Invoices
      res = await makeRequest('/api/invoices');
      logResult('/api/invoices', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      let newInvoiceId = null;
      if (newTenderId) {
        res = await makeRequest('/api/invoices', 'POST', {
          invoiceNumber: 'INV-TEST-' + Date.now(),
          tenderId: newTenderId,
          date: '2026-08-01',
          client: 'Test Client',
          amount: 50000,
          status: 'Pending',
          dueDate: '2026-09-01'
        });
        logResult('/api/invoices', 'POST', res.status, [200, 201]);
        if (res.data && res.data.id) newInvoiceId = res.data.id;
      }

      // 10. Payments
      res = await makeRequest('/api/payments');
      logResult('/api/payments', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      if (newInvoiceId) {
        res = await makeRequest('/api/payments', 'POST', {
          paymentId: 'PAY-TEST-' + Date.now(),
          invoiceId: newInvoiceId,
          invoiceNumber: 'INV-TEST-001',
          client: 'Test Client',
          amount: 25000,
          date: '2026-08-10',
          method: 'NEFT',
          status: 'RECEIVED'
        });
        logResult('/api/payments', 'POST', res.status, [200, 201]);
      }

      // 11. Expenses
      res = await makeRequest('/api/expenses');
      logResult('/api/expenses', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      res = await makeRequest('/api/expenses', 'POST', {
        id: 'EXP-TEST-' + Date.now(),
        department: 'Finance',
        category: 'Travel',
        vendor: 'Test Taxi',
        date: '2026-08-05',
        description: 'Test Expense',
        amount: 1200,
        status: 'PENDING'
      });
      logResult('/api/expenses', 'POST', res.status, [200, 201]);

      // 12. Delivery Challans & Installation Challans
      res = await makeRequest('/api/delivery-challans');
      logResult('/api/delivery-challans', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      res = await makeRequest('/api/installation-challans');
      logResult('/api/installation-challans', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      // 13. Budgets
      res = await makeRequest('/api/budgets');
      logResult('/api/budgets', 'GET', res.status, 200, `Count: ${Array.isArray(res.data) ? res.data.length : 0}`);

      // 14. Messages & Notifications
      res = await makeRequest(`/api/messages/${adminUserId}/last-messages`);
      logResult(`/api/messages/${adminUserId}/last-messages`, 'GET', res.status, 200);

      res = await makeRequest(`/api/notifications/${adminUserId}?panel=admin`);
      logResult(`/api/notifications/${adminUserId}?panel=admin`, 'GET', res.status, 200);

      // 15. Leave Requests & Doc Requests
      res = await makeRequest('/api/leave-requests');
      logResult('/api/leave-requests', 'GET', res.status, 200);

      res = await makeRequest(`/api/leave-requests/balance/${adminUserId}`);
      logResult(`/api/leave-requests/balance/${adminUserId}`, 'GET', res.status, 200);

      res = await makeRequest('/api/doc-requests');
      logResult('/api/doc-requests', 'GET', res.status, 200);

      // 16. Members
      res = await makeRequest('/api/members');
      logResult('/api/members', 'GET', res.status, 200);

      // Cleanup created test records
      if (newTenderId) await makeRequest(`/api/tenders/${newTenderId}`, 'DELETE');
      if (newClientId) await makeRequest(`/api/clients/${newClientId}`, 'DELETE');
      if (newDeptId) await makeRequest(`/api/departments/${newDeptId}`, 'DELETE');

      const failed = testResults.filter(r => !r.passed);
      console.log('\n--- TEST SUMMARY ---');
      console.log(`Total Endpoints Tested: ${testResults.length}`);
      console.log(`Passed: ${testResults.length - failed.length}`);
      console.log(`Failed: ${failed.length}`);

      server.close(() => {
        process.exit(failed.length > 0 ? 1 : 0);
      });
    } catch (err) {
      console.error('Test execution error:', err);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

runTests();
