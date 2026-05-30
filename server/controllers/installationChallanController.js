const InstallationChallan = require('../models/InstallationChallan');

const initialChallans = [
  {
    challanNumber: 'INST-2026-001',
    client: 'Acme Corp.',
    project: 'Solar Substation',
    installationDate: '2026-05-02',
    siteEngineer: 'Rajesh Sharma',
    installationType: 'Solar Installation',
    itemsQty: 43,
    estValuation: 12850,
    billingStatus: 'Pending Billing',
  },
  {
    challanNumber: 'INST-2026-002',
    client: 'Global Ltd.',
    project: 'Data Center Retrofit',
    installationDate: '2026-05-08',
    siteEngineer: 'Amit Verma',
    installationType: 'Infrastructure Setup',
    itemsQty: 21,
    estValuation: 9180,
    billingStatus: 'Invoiced',
  },
];

const seedChallans = async () => {
  try {
    const count = await InstallationChallan.count();
    if (count === 0) {
      await InstallationChallan.bulkCreate(initialChallans);
      console.log('Seeded initial installation challans successfully');
    }
  } catch (err) {
    console.error('Failed to seed installation challans:', err.message);
  }
};

exports.getChallans = async (req, res) => {
  try {
    await seedChallans();
    const challans = await InstallationChallan.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching installation challans', error: error.message });
  }
};

exports.getChallan = async (req, res) => {
  try {
    const challan = await InstallationChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Installation challan not found' });
    }
    res.json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching installation challan', error: error.message });
  }
};

exports.createChallan = async (req, res) => {
  try {
    const {
      client,
      project,
      installationDate,
      siteEngineer,
      installationType,
      siteAddress,
      supervisorName,
      contactPerson,
      contactPhone,
      invoiceRef,
      poRef,
      poDate,
      materialRows,
      billingStatus,
      signedCopy,
      documents
    } = req.body;

    // Auto-generate challan number
    const count = await InstallationChallan.count();
    const challanNumber = `INST-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Calculate material qty and valuation
    const itemsQty = materialRows ? materialRows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0) : 0;
    const estValuation = materialRows ? materialRows.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.rate) || 0)), 0) : 0;

    const challan = await InstallationChallan.create({
      challanNumber,
      client,
      project,
      installationDate: installationDate || null,
      siteEngineer: siteEngineer || null,
      installationType: installationType || null,
      siteAddress: siteAddress || null,
      supervisorName: supervisorName || null,
      contactPerson: contactPerson || null,
      contactPhone: contactPhone || null,
      invoiceRef: invoiceRef || null,
      poRef: poRef || null,
      poDate: poDate || null,
      itemsQty: itemsQty,
      estValuation: parseFloat(estValuation) || 0,
      materialRows: materialRows || [],
      billingStatus: billingStatus || 'Draft',
      signedCopy: signedCopy || 'Pending',
      documents: documents || []
    });

    try {
      await require('../models/Notification').create({
        message: `Installation challan created: ${challan.challanNumber}`,
        type: 'INSTALLATION_CHALLAN_CREATED',
        targetPanel: 'both'
      });
    } catch(e) { console.error('Notification error:', e); }

    res.status(201).json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating installation challan', error: error.message });
  }
};

exports.updateChallan = async (req, res) => {
  try {
    const challan = await InstallationChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Installation challan not found' });
    }

    const { materialRows, ...updateData } = req.body;

    // Recalculate material qty and valuation if materialRows provided
    if (materialRows) {
      updateData.itemsQty = materialRows.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
      updateData.estValuation = materialRows.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.rate) || 0)), 0);
      updateData.materialRows = materialRows;
    }

    await challan.update(updateData);
    res.json(challan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating installation challan', error: error.message });
  }
};

exports.deleteChallan = async (req, res) => {
  try {
    const challan = await InstallationChallan.findByPk(req.params.id);
    if (!challan) {
      return res.status(404).json({ message: 'Installation challan not found' });
    }

    await challan.destroy();
    res.json({ message: 'Installation challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting installation challan', error: error.message });
  }
};
