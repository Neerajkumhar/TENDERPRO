const Tender = require('../models/Tender');
const Client = require('../models/Client');
const User = require('../models/User');
const TenderAssignment = require('../models/TenderAssignment');

// Get all tenders
exports.getTenders = async (req, res) => {
  try {
    const tenders = await Tender.findAll({
      include: [{ model: Client, as: 'client', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(tenders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenders', error: error.message });
  }
};

// Get single tender by ID
exports.getTenderById = async (req, res) => {
  try {
    const { id } = req.params;
    const tender = await Tender.findByPk(id, {
      include: [{ model: Client, as: 'client' }]
    });
    
    if (!tender) {
      return res.status(404).json({ message: 'Tender not found' });
    }

    // Convert to JSON to add extra fields
    const tenderData = tender.toJSON();

    // Fetch team members if assigned
    if (tenderData.teamAssignments) {
      const { managerId, reviewerId, approverId } = tenderData.teamAssignments;
      const userIds = [managerId, reviewerId, approverId].filter(Boolean);
      
      if (userIds.length > 0) {
        const users = await User.findAll({
          where: { id: userIds },
          attributes: ['id', 'name', 'role', 'image', 'email']
        });
        
        // Map users back to roles
        tenderData.teamMembers = {
          manager: users.find(u => u.id === managerId),
          reviewer: users.find(u => u.id === reviewerId),
          approver: users.find(u => u.id === approverId)
        };
      }
    }
    
    res.json(tenderData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tender details', error: error.message });
  }
};

// Create a new tender entry
exports.createTender = async (req, res) => {
  try {
    const tenderData = req.body;
    
    // Clean up empty strings for numeric/date fields
    if (tenderData.budget === '') tenderData.budget = null;
    if (tenderData.submissionDate === '') tenderData.submissionDate = null;
    if (tenderData.clientId === '') tenderData.clientId = null;

    const newTender = await Tender.create(tenderData);
    res.status(201).json(newTender);
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({ message: 'Error creating tender entry', error: error.message });
  }
};

// Update a tender entry
exports.updateTender = async (req, res) => {
  try {
    const { id } = req.params;
    const tender = await Tender.findByPk(id);
    if (!tender) return res.status(404).json({ message: 'Tender not found' });
    
    await tender.update(req.body);
    res.json(tender);
  } catch (error) {
    res.status(500).json({ message: 'Error updating tender entry', error: error.message });
  }
};

// Delete a tender entry
exports.deleteTender = async (req, res) => {
  try {
    const { id } = req.params;
    await Tender.destroy({ where: { id } });
    res.json({ message: 'Tender entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tender entry', error: error.message });
  }
};

// Compile dynamic MySQL reports data
exports.getReports = async (req, res) => {
  try {
    const [tenders, assignments] = await Promise.all([
      Tender.findAll({
        include: [{ model: Client, as: 'client', attributes: ['name', 'email'] }],
        order: [['createdAt', 'DESC']]
      }),
      TenderAssignment.findAll({
        order: [['createdAt', 'DESC']]
      })
    ]);

    // 1. Calculate stats
    const totalTenders = tenders.length;
    const completedCount = tenders.filter(t => t.status === 'Won' || t.status === 'Lost').length;
    const pendingCount = tenders.filter(t => t.status === 'Registered' || t.status === 'Draft' || t.status === 'Active').length;
    
    const totalProjects = assignments.length;
    const completedProjects = assignments.filter(a => a.status === 'Completed').length;
    const pendingProjects = assignments.filter(a => ['Pending', 'In Progress'].includes(a.status)).length;

    const stats = [
      { label: 'Total Tenders', value: totalTenders.toLocaleString() },
      { label: 'Completed Tenders', value: completedCount.toLocaleString() },
      { label: 'Pending Tenders', value: pendingCount.toLocaleString() },
      { label: 'Total Projects', value: totalProjects.toLocaleString() },
      { label: 'Completed Projects', value: completedProjects.toLocaleString() },
      { label: 'Pending Projects', value: pendingProjects.toLocaleString() }
    ];

    // 2. Value by Category
    const categoryTotals = {
      'Government': { count: 0, budget: 0, color: '#3b82f6' },
      'Private': { count: 0, budget: 0, color: '#f59e0b' },
      'PSU': { count: 0, budget: 0, color: '#10b981' },
      'Non-Profit': { count: 0, budget: 0, color: '#8b5cf6' }
    };

    tenders.forEach(t => {
      const cat = t.category || 'Private';
      const budgetVal = t.budget ? parseFloat(t.budget) : 0;
      if (categoryTotals[cat]) {
        categoryTotals[cat].count += 1;
        categoryTotals[cat].budget += budgetVal;
      }
    });

    const pieData = Object.keys(categoryTotals).map(cat => ({
      name: cat,
      value: categoryTotals[cat].budget,
      count: categoryTotals[cat].count,
      color: categoryTotals[cat].color
    }));

    const totalCategoryValue = pieData.reduce((sum, item) => sum + item.value, 0);

    // 3. Deadline Status (Met, Imminent, Missed)
    const now = new Date();
    let metCount = 0;
    let imminentCount = 0;
    let missedCount = 0;

    tenders.forEach(t => {
      const subDate = t.submissionDate ? new Date(t.submissionDate) : null;
      if (['Won', 'Lost', 'Active'].includes(t.status)) {
        metCount += 1;
      } else if (subDate && subDate > now) {
        imminentCount += 1;
      } else if (subDate && subDate < now) {
        missedCount += 1;
      } else {
        imminentCount += 1;
      }
    });

    const barData = [
      { name: 'Met', value: metCount, color: '#10b981' },
      { name: 'Imminent', value: imminentCount, color: '#3b82f6' },
      { name: 'Missed', value: missedCount, color: '#f87171' }
    ];

    // 4. Upcoming Deadlines
    const upcomingTenders = tenders
      .filter(t => t.submissionDate)
      .sort((a, b) => new Date(a.submissionDate) - new Date(b.submissionDate))
      .slice(0, 5)
      .map(t => ({
        label: t.title,
        date: new Date(t.submissionDate).toLocaleDateString('en-US')
      }));

    const upcomingProjects = assignments
      .filter(a => a.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
      .map(a => ({
        label: a.title || 'Unnamed Project',
        date: new Date(a.deadline).toLocaleDateString('en-US')
      }));

    const upcomingDeadlines = {
      tenders: upcomingTenders,
      projects: upcomingProjects
    };

    // 5. Top Categories
    const topCategories = pieData
      .slice()
      .sort((a, b) => b.value - a.value)
      .map(item => ({
        name: item.name,
        value: item.count.toLocaleString()
      }));

    // 6. Master Table Data
    const tenderData = tenders.map(t => {
      const budgetVal = t.budget ? parseFloat(t.budget) : 0;
      return {
        id: t.id.slice(0, 8),
        title: t.title,
        client: t.client?.name || 'N/A',
        value: `₹${budgetVal.toLocaleString('en-IN')}`,
        status: t.status,
        winLoss: t.status === 'Won' ? 'Won' : (t.status === 'Lost' ? 'Lost' : 'Pending'),
        date: t.submissionDate ? new Date(t.submissionDate).toLocaleDateString('en-US') : 'N/A',
        category: t.category || 'Private'
      };
    });

    res.json({
      stats,
      pieData,
      totalCategoryValue,
      barData,
      upcomingDeadlines,
      topCategories,
      tenderData
    });
  } catch (error) {
    console.error('Error compiling reports data:', error);
    res.status(500).json({ message: 'Error compiling reports data', error: error.message });
  }
};
