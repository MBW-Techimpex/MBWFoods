const Admin = require('./src/models/Admin');
const sequelize = require('./src/config/database');

async function checkAdmins() {
  try {
    await sequelize.authenticate();
    const admins = await Admin.findAll();
    console.log('--- ADMINS LIST ---');
    admins.forEach(a => {
      console.log(`ID: ${a.id}, Username: ${a.username}, Email: ${a.email}, Role: ${a.role}`);
    });
    console.log('-------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmins();
