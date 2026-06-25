const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

const updateInvoiceTotals = async (invoiceId) => {
  if (!invoiceId) return;
  const invoice = await Invoice.findByPk(invoiceId);
  if (!invoice) return;

  const payments = await Payment.findAll({
    where: { invoiceId, status: 'RECEIVED' }
  });

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const fullAmount = parseFloat(invoice.amount);

  await invoice.update({
    paid_amount: totalPaid,
    amount_due: fullAmount - totalPaid,
    status: totalPaid >= fullAmount ? 'Paid' : (totalPaid > 0 ? 'Pending' : invoice.status)
  });
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { client, invoiceId, invoiceNumber, amount, date, method, status, notes } = req.body;
    
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const maxAllowed = parseFloat(invoice.amount_due !== undefined && invoice.amount_due !== null ? invoice.amount_due : invoice.amount);
    if (parseFloat(amount) > maxAllowed) {
      return res.status(400).json({ message: `Payment amount ₹${parseFloat(amount).toLocaleString('en-IN')} exceeds the invoice amount due of ₹${maxAllowed.toLocaleString('en-IN')}` });
    }

    const count = await Payment.count();
    const paymentId = `PMT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    
    const payment = await Payment.create({
      paymentId,
      invoiceId,
      invoiceNumber,
      client,
      amount: parseFloat(amount),
      date: date || new Date().toISOString().split('T')[0],
      method,
      status: status || 'RECEIVED',
      notes
    });

    if (payment.status === 'RECEIVED') {
      await updateInvoiceTotals(invoiceId);
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const newInvoiceId = req.body.invoiceId || payment.invoiceId;
    const invoice = await Invoice.findByPk(newInvoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const isSameInvoice = payment.invoiceId === newInvoiceId;
    const oldAmount = (isSameInvoice && payment.status === 'RECEIVED') ? parseFloat(payment.amount || 0) : 0;
    const maxAllowed = parseFloat(invoice.amount_due !== undefined && invoice.amount_due !== null ? invoice.amount_due : invoice.amount) + oldAmount;

    if (req.body.amount !== undefined && parseFloat(req.body.amount) > maxAllowed) {
      return res.status(400).json({ message: `Payment amount ₹${parseFloat(req.body.amount).toLocaleString('en-IN')} exceeds the invoice amount due of ₹${maxAllowed.toLocaleString('en-IN')}` });
    }

    const oldInvoiceId = payment.invoiceId;
    await payment.update(req.body);

    if (payment.invoiceId === oldInvoiceId) {
      await updateInvoiceTotals(payment.invoiceId);
    } else {
      await updateInvoiceTotals(oldInvoiceId);
      await updateInvoiceTotals(payment.invoiceId);
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const invoiceId = payment.invoiceId;
    await payment.destroy();
    
    await updateInvoiceTotals(invoiceId);

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};
