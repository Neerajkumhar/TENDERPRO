const { Sequelize } = require('sequelize');
const Task = require('./models/Task');
const TenderAssignment = require('./models/TenderAssignment');
const Tender = require('./models/Tender');
const sequelize = require('./config/db');

async function run() {
  await sequelize.authenticate();
  
  // Update assignments
  const assignments = await TenderAssignment.findAll();
  for (const assignment of assignments) {
    const tasks = await Task.findAll({ where: { assignmentId: assignment.id } });
    if (tasks.length > 0) {
      const allCompleted = tasks.every(t => ['Completed', 'Done'].includes(t.status));
      const hasStarted = tasks.some(t => ['In Progress', 'Review', 'Completed', 'Done'].includes(t.status));
      
      let newStatus = 'Pending';
      if (allCompleted) newStatus = 'Completed';
      else if (hasStarted) newStatus = 'In Progress';
      
      if (assignment.status !== newStatus) {
        console.log(`Updating assignment ${assignment.id} to ${newStatus}`);
        await assignment.update({ status: newStatus });
      }
    }
  }

  // Update Tenders
  const tenders = await Tender.findAll();
  for (const tender of tenders) {
    const tasks = await Task.findAll({ where: { tenderId: tender.id } });
    if (tasks.length > 0) {
      const allCompleted = tasks.every(t => ['Completed', 'Done'].includes(t.status));
      const hasStarted = tasks.some(t => ['In Progress', 'Review', 'Completed', 'Done'].includes(t.status));
      
      let newStatus = tender.status;
      if (allCompleted) newStatus = 'Completed';
      else if (hasStarted) {
        if (['Draft', 'Registered', 'Completed'].includes(tender.status)) newStatus = 'Active';
      } else {
        if (tender.status === 'Completed') newStatus = 'Active';
      }
      
      if (tender.status !== newStatus) {
        console.log(`Updating tender ${tender.id} to ${newStatus}`);
        await tender.update({ status: newStatus });
      }
    }
  }
  
  console.log("Done syncing statuses");
  process.exit(0);
}
run();
