const sequelize = require('./config/db');
const Department = require('./models/Department');
const User = require('./models/User');
const Client = require('./models/Client');
const Tender = require('./models/Tender');
const TenderAssignment = require('./models/TenderAssignment');
const Task = require('./models/Task');
const Reminder = require('./models/Reminder');
const Budget = require('./models/Budget');
const Expense = require('./models/Expense');
const Invoice = require('./models/Invoice');
const Payment = require('./models/Payment');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Seed Departments
    console.log('\n--- Seeding Departments ---');
    const departmentsData = [
      { name: 'Tendering & Procurement', color: 'blue', description: 'Handles all tender acquisitions and client bidding activities.' },
      { name: 'Technical', color: '#3b82f6', description: 'Technical design, estimation and engineering department.' },
      { name: 'Finance', color: '#10b981', description: 'Financial planning, accounting, and cash flow management.' },
      { name: 'Operations', color: '#f59e0b', description: 'Project operations, execution, and field logistics.' },
      { name: 'Legal', color: '#6366f1', description: 'Legal and regulatory compliance affairs.' }
    ];

    const departmentMap = {};
    for (const dept of departmentsData) {
      const [d, created] = await Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept
      });
      departmentMap[dept.name] = d;
      console.log(`Department "${d.name}" ${created ? 'created' : 'already exists'} (ID: ${d.id})`);
    }

    // 2. Seed Users
    console.log('\n--- Seeding Users ---');
    const usersData = [
      {
        name: 'Vikash Kumar',
        email: 'vikash@vagwiin.com',
        password: '12345678',
        role: 'Admin',
        departmentId: departmentMap['Tendering & Procurement'].id,
        phone: '9876543210',
        status: 'Active'
      },
      {
        name: 'Finance Manager User',
        email: 'finance@vagwiin.com',
        password: '12345678',
        role: 'Finance Manager',
        departmentId: departmentMap['Finance'].id,
        phone: '9876543211',
        status: 'Active'
      },
      {
        name: 'Tender Manager User',
        email: 'manager@vagwiin.com',
        password: '12345678',
        role: 'Tender Manager',
        departmentId: departmentMap['Tendering & Procurement'].id,
        phone: '9876543212',
        status: 'Active'
      },
      {
        name: 'Mike Ross',
        email: 'mike@example.com',
        password: '12345678',
        role: 'Core Team',
        departmentId: departmentMap['Technical'].id,
        phone: '9876543213',
        status: 'Active'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: '12345678',
        role: 'Tender Manager',
        departmentId: departmentMap['Technical'].id,
        phone: '9876543214',
        status: 'Active'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        password: '12345678',
        role: 'Admin',
        departmentId: departmentMap['Finance'].id,
        phone: '9876543215',
        status: 'Active'
      }
    ];

    const userMap = {};
    for (const uData of usersData) {
      const [u, created] = await User.findOrCreate({
        where: { email: uData.email },
        defaults: uData
      });
      userMap[uData.email] = u;
      if (created) {
        const dept = await Department.findByPk(u.departmentId);
        if (dept) {
          await dept.increment('memberCount');
        }
        console.log(`User "${u.name}" created (Role: ${u.role})`);
      } else {
        console.log(`User "${u.name}" already exists`);
      }
    }

    // 3. Seed Clients
    console.log('\n--- Seeding Clients ---');
    const clientsData = [
      { name: 'Jaipur Development Authority', email: 'jda@rajasthan.gov.in', phone: '0141-2563211', location: 'Jaipur, Rajasthan', industry: 'Infrastructure', status: 'Active', firmType: 'Govt' },
      { name: 'Delhi Metro Rail Corporation', email: 'dmrc@delhimetro.org', phone: '011-23417910', location: 'New Delhi', industry: 'Transportation', status: 'Active', firmType: 'Govt' },
      { name: 'National Highways Authority of India', email: 'nhai@nhai.org', phone: '011-25074100', location: 'New Delhi', industry: 'Infrastructure', status: 'Active', firmType: 'Govt' }
    ];

    const clientMap = {};
    for (const cData of clientsData) {
      const [c, created] = await Client.findOrCreate({
        where: { email: cData.email },
        defaults: cData
      });
      clientMap[cData.name] = c;
      console.log(`Client "${c.name}" ${created ? 'created' : 'already exists'}`);
    }

    // 4. Seed Tenders
    console.log('\n--- Seeding Tenders ---');
    const tendersData = [
      {
        title: 'JDA Smart City Phase II Road Construction',
        clientId: clientMap['Jaipur Development Authority'].id,
        reference: 'TND-2026-001',
        category: 'Government',
        bidType: 'Bid',
        submissionDate: new Date('2026-07-25'),
        scope: 'Construction of 4-lane smart roads with underground utility cabling, smart poles, and street lighting.',
        milestones: '1. Excavation & Subgrade completion (25%)\n2. Asphalt work & drainage (50%)\n3. Utility ducting & cabling (75%)\n4. Streetscape & final handover (100%)',
        techCriteria: 'Class-A contractor license, ISO 9001 certification, minimum average annual turnover of 200M INR over past 3 years.',
        certifications: 'ISO 9001, ISO 14001, OHSAS 18001',
        terms: '20% Mobilization advance against Bank Guarantee, milestone-based running bills within 30 days of submission.',
        budget: 75000000.00,
        tax: '18',
        paymentTerms: 'Milestone-based, 20% advance',
        status: 'Active',
        submissionMode: 'Online Portal',
        submissionURL: 'https://eproc.rajasthan.gov.in',
        teamAssignments: {
          managerId: userMap['manager@vagwiin.com'].id,
          reviewerId: userMap['mike@example.com'].id,
          approverId: userMap['vikash@vagwiin.com'].id
        }
      },
      {
        title: 'DMRC Station Facility Maintenance',
        clientId: clientMap['Delhi Metro Rail Corporation'].id,
        reference: 'TND-2026-002',
        category: 'Government',
        bidType: 'Bid',
        submissionDate: new Date('2026-06-20'),
        scope: 'Comprehensive facility management, electromechanical maintenance, and housekeeping of 12 metro stations.',
        milestones: 'Monthly maintenance inspections and SLA compliance checks.',
        techCriteria: 'Experience in managing facility contracts of public utility spaces (>10,000 sqm area) for at least 5 years.',
        certifications: 'ISO 9001, ISO 45001',
        terms: 'Monthly payment based on invoice submission and compliance report sign-off.',
        budget: 12000000.00,
        tax: '18',
        paymentTerms: 'Monthly invoicing',
        status: 'Won',
        poNumber: 'PO-DMRC-554',
        woNumber: 'WO-DMRC-982',
        submissionMode: 'Online Portal',
        submissionURL: 'https://eprocure.gov.in',
        teamAssignments: {
          managerId: userMap['john@example.com'].id,
          reviewerId: userMap['mike@example.com'].id,
          approverId: userMap['vikash@vagwiin.com'].id
        }
      },
      {
        title: 'NHAI Highway Solar Lighting Installation',
        clientId: clientMap['National Highways Authority of India'].id,
        reference: 'TND-2026-003',
        category: 'Government',
        bidType: 'Bid',
        submissionDate: new Date('2026-05-10'),
        scope: 'Design, supply, installation, testing and commissioning of 500 smart solar-powered streetlights on NH-8.',
        milestones: '1. Material delivery to site (40%)\n2. Foundation & pole installation (70%)\n3. Fixture mounting & testing (100%)',
        techCriteria: 'OEM partnership or direct manufacturing capacity of solar panels & lithium battery storage units.',
        certifications: 'MNRE approval, CE certification, RoHS compliance',
        terms: '100% payment on successful commissioning and handover certification.',
        budget: 8500000.00,
        tax: '18',
        paymentTerms: '100% on completion',
        status: 'Completed',
        poNumber: 'PO-NHAI-112',
        woNumber: 'WO-NHAI-334',
        completionStatus: 'Approved',
        completionRemark: 'All 500 solar streetlights installed, tested, and handed over to NHAI authorities. Performance warranty active.',
        submissionMode: 'Online Portal',
        submissionURL: 'https://etenders.gov.in',
        teamAssignments: {
          managerId: userMap['manager@vagwiin.com'].id,
          reviewerId: userMap['john@example.com'].id,
          approverId: userMap['vikash@vagwiin.com'].id
        }
      }
    ];

    const tenderMap = {};
    for (const tData of tendersData) {
      const [t, created] = await Tender.findOrCreate({
        where: { reference: tData.reference },
        defaults: tData
      });
      if (!created) {
        await t.update({ teamAssignments: tData.teamAssignments });
      }
      tenderMap[tData.reference] = t;
      console.log(`Tender "${t.title}" ${created ? 'created' : 'updated successfully with assignments'}`);
    }

    // 5. Seed TenderAssignments
    console.log('\n--- Seeding TenderAssignments ---');
    const assignmentsData = [
      {
        title: 'Prepare Technical Proposal & Bill of Quantities (BOQ)',
        tenderId: tenderMap['TND-2026-001'].id, // JDA Smart City
        departmentId: departmentMap['Technical'].id,
        assigneeId: userMap['mike@example.com'].id,
        description: 'Complete detail design road cross-sections, prepare BOQ spreadsheet, and draft technical methodology document.',
        priority: 'High',
        deadline: new Date('2026-07-10'),
        status: 'In Progress'
      },
      {
        title: 'Review Bid Security & Prepare BG/EMD',
        tenderId: tenderMap['TND-2026-001'].id, // JDA Smart City
        departmentId: departmentMap['Finance'].id,
        assigneeId: userMap['finance@vagwiin.com'].id,
        description: 'Prepare Earnest Money Deposit (EMD) or obtain Bank Guarantee of 1.5M INR from the bank.',
        priority: 'High',
        deadline: new Date('2026-07-08'),
        status: 'Pending'
      },
      {
        title: 'Mobilize Team for Station Maintenance Operations',
        tenderId: tenderMap['TND-2026-002'].id, // DMRC Station
        departmentId: departmentMap['Operations'].id,
        assigneeId: userMap['john@example.com'].id,
        description: 'Recruit, train, and deploy housekeeping and mechanical staff at the designated 12 DMRC stations.',
        priority: 'Medium',
        deadline: new Date('2026-07-01'),
        status: 'Completed'
      }
    ];

    const assignmentMap = {};
    for (const aData of assignmentsData) {
      const [a, created] = await TenderAssignment.findOrCreate({
        where: {
          tenderId: aData.tenderId,
          departmentId: aData.departmentId,
          title: aData.title
        },
        defaults: aData
      });
      assignmentMap[aData.title] = a;
      console.log(`Assignment "${a.title}" ${created ? 'created' : 'already exists'}`);
    }

    // 6. Seed Tasks
    console.log('\n--- Seeding Tasks ---');
    if (assignmentMap['Prepare Technical Proposal & Bill of Quantities (BOQ)']) {
      const assign = assignmentMap['Prepare Technical Proposal & Bill of Quantities (BOQ)'];
      const tasksData = [
        {
          tenderId: assign.tenderId,
          assignmentId: assign.id,
          assigneeId: userMap['mike@example.com'].id,
          title: 'Draft Civil Structure Bill of Materials',
          description: 'Calculate material requirements for base layer aggregate, asphalt, and concrete curbs.',
          status: 'In Progress',
          priority: 'High',
          deadline: new Date('2026-07-05'),
          creatorId: userMap['manager@vagwiin.com'].id,
          attachments: '[]',
          subtasks: '[]'
        },
        {
          tenderId: assign.tenderId,
          assignmentId: assign.id,
          assigneeId: userMap['mike@example.com'].id,
          title: 'Obtain OEM Authorization Letter for Smart Streetlights',
          description: 'Request signed authorization certificate from smart lighting manufacturer for bidding compliance.',
          status: 'Pending',
          priority: 'Medium',
          deadline: new Date('2026-07-07'),
          creatorId: userMap['manager@vagwiin.com'].id,
          attachments: '[]',
          subtasks: '[]'
        }
      ];

      for (const tData of tasksData) {
        const [task, created] = await Task.findOrCreate({
          where: {
            assignmentId: tData.assignmentId,
            title: tData.title
          },
          defaults: tData
        });
        console.log(`Task "${task.title}" ${created ? 'created' : 'already exists'}`);
      }
    }

    // 7. Seed Reminders
    console.log('\n--- Seeding Reminders ---');
    const remindersData = [
      {
        title: 'JDA Pre-Bid Meeting',
        description: 'Attend online pre-bid query resolution meeting on JDA portal.',
        date: new Date('2026-07-02T11:00:00Z'),
        type: 'Meeting',
        time: '11:00 AM',
        userId: userMap['manager@vagwiin.com'].id
      },
      {
        title: 'Submit Bid Documents for JDA Smart City',
        description: 'Final submission deadline for Smart City Road Project.',
        date: new Date('2026-07-25T15:00:00Z'),
        type: 'Deadline', // ENUM is Event, Meeting, Reminder, Review, but wait...
        type: 'Event', // Safe choice mapping to ENUM
        time: '3:00 PM',
        userId: userMap['vikash@vagwiin.com'].id
      }
    ];

    for (const rData of remindersData) {
      const [r, created] = await Reminder.findOrCreate({
        where: {
          title: rData.title,
          userId: rData.userId
        },
        defaults: rData
      });
      console.log(`Reminder "${r.title}" ${created ? 'created' : 'already exists'}`);
    }

    // 8. Seed Budgets
    console.log('\n--- Seeding Budgets ---');
    const budgetsData = [
      {
        name: 'FY 2026-27 Tendering Budget',
        department: 'Tendering & Procurement',
        allocated: 500000.00,
        status: 'ON TRACK',
        trend: '+2.5%',
        fiscalYear: '2026-27',
        color: 'bg-blue-600',
        threshold: 80,
        description: 'Budget for tender portal subscriptions, document purchase fees, bid security processing, and coordination.'
      },
      {
        name: 'FY 2026-27 Engineering & Design',
        department: 'Technical',
        allocated: 15000000.00,
        status: 'ON TRACK',
        trend: '+5.0%',
        fiscalYear: '2026-27',
        color: 'bg-indigo-600',
        threshold: 85,
        description: 'Budget for site surveys, soil testing, CAD/GIS software licenses, and structural engineering consultancies.'
      },
      {
        name: 'FY 2026-27 Project Operations & Logistics',
        department: 'Operations',
        allocated: 50000000.00,
        status: 'ON TRACK',
        trend: '0.0%',
        fiscalYear: '2026-27',
        color: 'bg-orange-600',
        threshold: 90,
        description: 'Budget for procurement of raw materials, labor hiring, transportation, machinery rentals, and sub-contracts.'
      }
    ];

    for (const bData of budgetsData) {
      const [b, created] = await Budget.findOrCreate({
        where: { name: bData.name },
        defaults: bData
      });
      console.log(`Budget "${b.name}" ${created ? 'created' : 'already exists'}`);
    }

    // 9. Seed Expenses
    console.log('\n--- Seeding Expenses ---');
    const expensesData = [
      {
        id: 'EXP-2026-001',
        department: 'Technical',
        category: 'Materials',
        vendor: 'SolarTech Solutions Pvt Ltd',
        date: '2026-05-15',
        description: 'Procurement of smart lighting controllers and solar panels for NHAI Highway Solar Project.',
        amount: 3500000.00,
        status: 'APPROVED'
      },
      {
        id: 'EXP-2026-002',
        department: 'Operations',
        category: 'Travel',
        vendor: 'Rajasthan Tour & Travels',
        date: '2026-06-05',
        description: 'Field visit taxi hire and hotel stay charges for engineering team survey at Jaipur Smart City site.',
        amount: 45000.00,
        status: 'APPROVED'
      },
      {
        id: 'EXP-2026-003',
        department: 'Tendering & Procurement',
        category: 'Fees',
        vendor: 'Jaipur Development Authority',
        date: '2026-06-25',
        description: 'Purchase fee for tender document and specifications handbook for Smart City Phase II Road Construction.',
        amount: 15000.00,
        status: 'APPROVED'
      }
    ];

    for (const eData of expensesData) {
      const [e, created] = await Expense.findOrCreate({
        where: { id: eData.id },
        defaults: eData
      });
      console.log(`Expense "${e.id}" ${created ? 'created' : 'already exists'}`);
    }

    // 10. Seed Invoices
    console.log('\n--- Seeding Invoices ---');
    const invoicesData = [
      {
        invoiceNumber: 'INV-2026-001',
        tenderId: tenderMap['TND-2026-002'].id, // DMRC Station
        date: '2026-05-25',
        client: 'Delhi Metro Rail Corporation',
        amount: 4000000.00,
        status: 'Paid',
        billingAddress: 'Accounts Branch, Metro Bhawan, Fire Brigade Lane, Barakhamba Road, New Delhi - 110001',
        reference: 'TND-2026-002',
        poNumber: 'PO-DMRC-554',
        dueDate: '2026-06-25',
        amount_due: 0.00,
        paid_amount: 4000000.00,
        paidAt: new Date('2026-06-15'),
        companyName: 'Vagwiin Infrastructure',
        companyAddress: 'Plot 42, Malviya Industrial Area, Jaipur, Rajasthan - 302017',
        companyPhone: '+91 141 4059000',
        companyEmail: 'billing@vagwiin.com',
        companyGSTIN: '08AAAAA1111A1Z1',
        companyPAN: 'AAAAA1111A',
        companyWebsite: 'www.vagwiin.com',
        gstDetails: 'CGST 9% (3,60,000), SGST 9% (3,60,000)',
        bankName: 'State Bank of India',
        accountNumber: '33445566778',
        bankIFSC: 'SBIN0001234',
        bankBranch: 'Malviya Nagar Branch, Jaipur',
        items: [
          { description: 'Electromechanical maintenance services for 12 stations - Month of April 2026', quantity: 1, rate: 3389830.51, amount: 3389830.51 }
        ]
      },
      {
        invoiceNumber: 'INV-2026-002',
        tenderId: tenderMap['TND-2026-003'].id, // NHAI Solar
        date: '2026-06-10',
        client: 'National Highways Authority of India',
        amount: 8500000.00,
        status: 'Pending',
        billingAddress: 'Project Director Office, NHAI, G-5&6, Sector-10, Dwarka, New Delhi - 110075',
        reference: 'TND-2026-003',
        poNumber: 'PO-NHAI-112',
        dueDate: '2026-07-10',
        amount_due: 8500000.00,
        paid_amount: 0.00,
        companyName: 'Vagwiin Infrastructure',
        companyAddress: 'Plot 42, Malviya Industrial Area, Jaipur, Rajasthan - 302017',
        companyPhone: '+91 141 4059000',
        companyEmail: 'billing@vagwiin.com',
        companyGSTIN: '08AAAAA1111A1Z1',
        companyPAN: 'AAAAA1111A',
        companyWebsite: 'www.vagwiin.com',
        gstDetails: 'IGST 18% (12,96,610.17)',
        bankName: 'State Bank of India',
        accountNumber: '33445566778',
        bankIFSC: 'SBIN0001234',
        bankBranch: 'Malviya Nagar Branch, Jaipur',
        items: [
          { description: 'Supply & Commissioning of 500 Smart Solar Streetlights on NH-8 Corridor', quantity: 500, rate: 14406.78, amount: 7203389.83 }
        ]
      }
    ];

    const invoiceMap = {};
    for (const iData of invoicesData) {
      const [inv, created] = await Invoice.findOrCreate({
        where: { invoiceNumber: iData.invoiceNumber },
        defaults: iData
      });
      invoiceMap[iData.invoiceNumber] = inv;
      console.log(`Invoice "${inv.invoiceNumber}" ${created ? 'created' : 'already exists'}`);
    }

    // 11. Seed Payments
    console.log('\n--- Seeding Payments ---');
    const paymentsData = [
      {
        paymentId: 'PAY-2026-001',
        invoiceId: invoiceMap['INV-2026-001'].id,
        invoiceNumber: 'INV-2026-001',
        client: 'Delhi Metro Rail Corporation',
        amount: 4000000.00,
        date: '2026-06-15',
        method: 'NEFT/Bank Transfer',
        status: 'RECEIVED',
        notes: 'Full payment received against INV-2026-001 for station facility maintenance.'
      }
    ];

    for (const pData of paymentsData) {
      const [p, created] = await Payment.findOrCreate({
        where: { paymentId: pData.paymentId },
        defaults: pData
      });
      console.log(`Payment "${p.paymentId}" ${created ? 'created' : 'already exists'}`);
    }

    console.log('\n======================================');
    console.log('Database Seeding finished successfully!');
    console.log('======================================');
    process.exit(0);
  } catch (error) {
    console.error('Database Seeding failed:', error);
    process.exit(1);
  }
}

seed();
