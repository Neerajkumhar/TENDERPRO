const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('tender_db', 'root', 'tony123', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});
const Tender = sequelize.define('Tender', {
  title: { type: DataTypes.STRING },
  completionDocuments: { type: DataTypes.JSON },
  completionStatus: { type: DataTypes.STRING }
});
async function run() {
  const tenders = await Tender.findAll();
  for (let t of tenders) {
    if (t.completionDocuments) {
      console.log('ID:', t.id, 'Docs:', t.completionDocuments, typeof t.completionDocuments);
    }
  }
}
run();
