const DeliveryChallan = require('../models/DeliveryChallan');

const initialChallans = [
  {
    challanNumber: 'DEL-2026-001',
    client: 'Acme Corp.',
    project: 'Solar Substation',
    dispatchDate: '2026-05-22',
    transporter: 'Shree Transports',
    vehicleNumber: 'MH02AB1234',
    lrNo: 'LR12345',
    driverName: 'Rajesh Kumar',
    status: 'DELIVERED',
    itemsQty: 32,
    materialValue: 18800,
  },
  {
    challanNumber: 'DEL-2026-002',
    client: 'Global Ltd.',
    project: 'Data Center Retrofit',
    dispatchDate: '2026-05-23',
    transporter: 'Rapid Movers',
    vehicleNumber: 'DL01CD5678',
    lrNo: 'LR22334',
    driverName: 'Amit Singh',
    status: 'IN TRANSIT',
    itemsQty: 18,
    materialValue: 14950,
  },
];

const seedChallans = async () => {
  try {
    const count = await DeliveryChallan.count();
    if (count === 0) {
      await DeliveryChallan.bulkCreate(initialChallans);
      console.log('Seeded initial delivery challans successfully');
    }
  } catch (err) {
    console.error('Failed to seed delivery challans:', err.message);
  }
};

exports.getChallans = async (req, res) => {
  try {
    await seedChallans();
    const challans = await DeliveryChallan.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery challans', error: error.message });
  }
};

exports.getChallan = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Delivery challan not found' });
    }
    res.json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery challan', error: error.message });
  }
};

exports.createChallan = async (req, res) => {
  try {
    const {
      client,
      project,
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
      invoiceRef,
      poRef,
      poDate,
      ewayBill,
      dispatchFrom,
      dispatchTo,
      shippingAddress,
      poAddress,
      materialRows,
      status,
      signedCopy,
      documents
    } = req.body;

    // Auto-generate challan number
    const count = await DeliveryChallan.count();
    const challanNumber = `DEL-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Calculate material value and qty
    const itemsQty = materialRows ? materialRows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0) : 0;
    const materialValue = materialRows ? materialRows.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.rate) || 0)), 0) : 0;

    const challan = await DeliveryChallan.create({
      challanNumber,
      client,
      project,
      dispatchDate: dispatchDate || null,
      deliveryDate: deliveryDate || null,
      transporter: transporter || null,
      vehicleNumber: vehicleNumber || null,
      lrNo: lrNo || null,
      driverName: driverName || null,
      clientGstin: clientGstin || null,
      contactPerson: contactPerson || null,
      contactPhone: contactPhone || null,
      placeOfSupply: placeOfSupply || null,
      invoiceRef: invoiceRef || null,
      poRef: poRef || null,
      poDate: poDate || null,
      ewayBill: ewayBill || null,
      dispatchFrom: dispatchFrom || null,
      dispatchTo: dispatchTo || null,
      shippingAddress: shippingAddress || null,
      poAddress: poAddress || null,
      materialValue: parseFloat(materialValue) || 0,
      itemsQty: itemsQty,
      materialRows: materialRows || [],
      status: status || 'PENDING',
      signedCopy: signedCopy || 'Pending',
      documents: documents || []
    });

    try {
      await require('../models/Notification').create({
        message: `Delivery challan created: ${challan.challanNumber}`,
        type: 'DELIVERY_CHALLAN_CREATED',
        targetPanel: 'both'
      });
    } catch(e) { console.error('Notification error:', e); }

    res.status(201).json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating delivery challan', error: error.message });
  }
};

exports.updateChallan = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Delivery challan not found' });
    }

    const { materialRows, ...updateData } = req.body;

    // Recalculate material value and qty if materialRows provided
    if (materialRows) {
      updateData.itemsQty = materialRows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
      updateData.materialValue = materialRows.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.rate) || 0)), 0);
      updateData.materialRows = materialRows;
    }

    await challan.update(updateData);
    res.json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery challan', error: error.message });
  }
};

exports.deleteChallan = async (req, res) => {
  try {
    const challan = await DeliveryChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Delivery challan not found' });
    }

    await challan.destroy();
    res.json({ message: 'Delivery challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting delivery challan', error: error.message });
  }
};
