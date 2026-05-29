const Invoice = require('../models/Invoice');

const initialInvoices = [
  { invoiceNumber: 'INV-001', date: '2022-05-20', client: 'Acme Corp', amount: 2500.00, status: 'Paid' },
  { invoiceNumber: 'INV-002', date: '2022-08-21', client: 'TechSolutions', amount: 1200.00, status: 'Pending' },
  { invoiceNumber: 'INV-003', date: '2022-10-20', client: 'Global Industries', amount: 3500.00, status: 'Paid' },
  { invoiceNumber: 'INV-004', date: '2022-12-15', client: 'Prime Co.', amount: 1800.00, status: 'Overdue' },
];

const seedInvoices = async () => {
  try {
    const count = await Invoice.count();
    if (count === 0) {
      await Invoice.bulkCreate(initialInvoices);
      console.log('Seeded initial mock invoices successfully');
    }
  } catch (err) {
    console.error('Failed to seed invoices:', err.message);
  }
};

exports.getInvoices = async (req, res) => {
  try {
    await seedInvoices();
    const invoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error: error.message });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      client,
      amount,
      date,
      status,
      billingAddress,
      reference,
      poNumber,
      dueDate,
      amount_due,
      paid_amount,
      bankName,
      accountNumber,
      paidAt,
      sentAt,
      gstDetails,
      poAddress,
      items,
      attachments,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyGSTIN,
      companyPAN,
      companyWebsite,
      companyLogo,
      bankIFSC,
      bankBranch,
      authorizedSignature,
      project,
      invoiceRef,
      poRef,
      poDate,
      ewayBill,
      dispatchDate,
      deliveryDate,
      transporter,
      vehicleNumber,
      lrNo,
      driverName,
      clientGstin,
      contactPerson,
      contactPhone,
      placeOfSupply,
      dispatchFrom,
      dispatchTo,
      shippingAddress,
      notes
    } = req.body;
    
    // Auto-generate unique invoice number
    const count = await Invoice.count();
    const invoiceNumber = `INV-${String(count + 1).padStart(3, '0')}`;
    
    const invoice = await Invoice.create({
      invoiceNumber,
      client,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      status: status || 'Pending',
      billingAddress,
      reference,
      poNumber,
      dueDate: dueDate || null,
      amount_due: amount_due !== undefined ? parseFloat(amount_due) : 0,
      paid_amount: paid_amount !== undefined ? parseFloat(paid_amount) : 0,
      bankName,
      accountNumber,
      paidAt: paidAt || null,
      sentAt: sentAt || null,
      gstDetails,
      poAddress,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyGSTIN,
      companyPAN,
      companyWebsite,
      companyLogo,
      bankIFSC,
      bankBranch,
      authorizedSignature,
      project,
      invoiceRef,
      poRef,
      poDate: poDate || null,
      ewayBill,
      dispatchDate: dispatchDate || null,
      deliveryDate: deliveryDate || null,
      transporter,
      vehicleNumber,
      lrNo,
      driverName,
      clientGstin,
      contactPerson,
      contactPhone,
      placeOfSupply,
      dispatchFrom,
      dispatchTo,
      shippingAddress,
      notes,
      items: typeof items === 'string' ? JSON.parse(items) : items,
      attachments: typeof attachments === 'string' ? JSON.parse(attachments) : attachments
    });
    
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    await seedInvoices();
    const invoices = await Invoice.findAll();
    
    let paidSum = 0;
    let pendingSum = 0;
    let overdueSum = 0;
    
    invoices.forEach(inv => {
      const amt = parseFloat(inv.amount);
      if (inv.status === 'Paid') {
        paidSum += amt;
      } else if (inv.status === 'Pending') {
        pendingSum += amt;
      } else if (inv.status === 'Overdue') {
        overdueSum += amt;
      }
    });

    const totalRevenue = 1250000 + paidSum; 
    const totalExpenses = 850000;
    const netProfit = totalRevenue - totalExpenses;
    const cashFlow = 600000 + paidSum;
    const outstandingDues = 120000 + overdueSum + pendingSum;

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      cashFlow,
      outstandingDues,
      pendingCount: invoices.filter(i => i.status === 'Pending').length,
      paidCount: invoices.filter(i => i.status === 'Paid').length,
      overdueCount: invoices.filter(i => i.status === 'Overdue').length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching financial stats', error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    let invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      invoice = await Invoice.findOne({ where: { invoiceNumber: req.params.id } });
    }
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoice by id', error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      invoice = await Invoice.findOne({ where: { invoiceNumber: req.params.id } });
    }
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const {
      client,
      amount,
      date,
      status,
      billingAddress,
      reference,
      poNumber,
      dueDate,
      amount_due,
      paid_amount,
      bankName,
      accountNumber,
      paidAt,
      sentAt,
      items,
      attachments,
      gstDetails,
      poAddress,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyGSTIN,
      companyPAN,
      companyWebsite,
      companyLogo,
      bankIFSC,
      bankBranch,
      authorizedSignature,
      project,
      invoiceRef,
      poRef,
      poDate,
      ewayBill,
      dispatchDate,
      deliveryDate,
      transporter,
      vehicleNumber,
      lrNo,
      driverName,
      clientGstin,
      contactPerson,
      contactPhone,
      placeOfSupply,
      dispatchFrom,
      dispatchTo,
      shippingAddress,
      notes
    } = req.body;
    await invoice.update({
      client: client ?? invoice.client,
      amount: amount !== undefined ? parseFloat(amount) : invoice.amount,
      date: date || invoice.date,
      status: status || invoice.status,
      billingAddress: billingAddress ?? invoice.billingAddress,
      reference: reference ?? invoice.reference,
      poNumber: poNumber ?? invoice.poNumber,
      dueDate: dueDate || invoice.dueDate,
      amount_due: amount_due !== undefined ? parseFloat(amount_due) : invoice.amount_due,
      paid_amount: paid_amount !== undefined ? parseFloat(paid_amount) : invoice.paid_amount,
      bankName: bankName ?? invoice.bankName,
      accountNumber: accountNumber ?? invoice.accountNumber,
      paidAt: paidAt || invoice.paidAt,
      sentAt: sentAt || invoice.sentAt,
      gstDetails: gstDetails ?? invoice.gstDetails,
      poAddress: poAddress ?? invoice.poAddress,
      companyName: companyName ?? invoice.companyName,
      companyAddress: companyAddress ?? invoice.companyAddress,
      companyPhone: companyPhone ?? invoice.companyPhone,
      companyEmail: companyEmail ?? invoice.companyEmail,
      companyGSTIN: companyGSTIN ?? invoice.companyGSTIN,
      companyPAN: companyPAN ?? invoice.companyPAN,
      companyWebsite: companyWebsite ?? invoice.companyWebsite,
      companyLogo: companyLogo ?? invoice.companyLogo,
      bankIFSC: bankIFSC ?? invoice.bankIFSC,
      bankBranch: bankBranch ?? invoice.bankBranch,
      authorizedSignature: authorizedSignature ?? invoice.authorizedSignature,
      project: project ?? invoice.project,
      invoiceRef: invoiceRef ?? invoice.invoiceRef,
      poRef: poRef ?? invoice.poRef,
      poDate: poDate || invoice.poDate,
      ewayBill: ewayBill ?? invoice.ewayBill,
      dispatchDate: dispatchDate || invoice.dispatchDate,
      deliveryDate: deliveryDate || invoice.deliveryDate,
      transporter: transporter ?? invoice.transporter,
      vehicleNumber: vehicleNumber ?? invoice.vehicleNumber,
      lrNo: lrNo ?? invoice.lrNo,
      driverName: driverName ?? invoice.driverName,
      clientGstin: clientGstin ?? invoice.clientGstin,
      contactPerson: contactPerson ?? invoice.contactPerson,
      contactPhone: contactPhone ?? invoice.contactPhone,
      placeOfSupply: placeOfSupply ?? invoice.placeOfSupply,
      dispatchFrom: dispatchFrom ?? invoice.dispatchFrom,
      dispatchTo: dispatchTo ?? invoice.dispatchTo,
      shippingAddress: shippingAddress ?? invoice.shippingAddress,
      notes: notes ?? invoice.notes,
      items: (typeof items === 'string' ? JSON.parse(items) : items) || invoice.items,
      attachments: (typeof attachments === 'string' ? JSON.parse(attachments) : attachments) || invoice.attachments
    });

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice', error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    let invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
      invoice = await Invoice.findOne({ where: { invoiceNumber: req.params.id } });
    }
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    await invoice.destroy();
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
};
