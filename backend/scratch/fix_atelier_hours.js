const sequelize = require('../src/config/database');
const AtelierHour = require('../src/models/AtelierHour');

async function fixAtelierHours() {
  console.log('Starting AtelierHours cleanup...');
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // 1. Truncate/delete all rows from atelierhours table
    console.log('Truncating atelierhours table...');
    await sequelize.query('TRUNCATE TABLE atelierhours RESTART IDENTITY CASCADE;');
    console.log('Atelierhours table truncated.');

    // 2. Seed with exactly 7 correct records
    const hours = [
      { day: 'Mon', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, status: 'Active', position: 1 },
      { day: 'Tue', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, status: 'Active', position: 2 },
      { day: 'Wed', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, status: 'Active', position: 3 },
      { day: 'Thu', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, status: 'Active', position: 4 },
      { day: 'Fri', hours: '7:00 AM - 11:30 AM & 5:00 PM - 10:30 PM', isClosed: false, status: 'Active', position: 5 },
      { day: 'Sat', hours: '7:00 AM - 12:00 PM & 4:30 PM - 11:00 PM', isClosed: false, status: 'Active', position: 6 },
      { day: 'Sun', hours: '7:00 AM - 12:00 PM & 4:30 PM - 11:00 PM', isClosed: false, status: 'Active', position: 7 }
    ];

    console.log('Creating fresh 7-day hours data...');
    await AtelierHour.bulkCreate(hours);
    console.log('Operating hours created successfully!');

    // 3. Output current records to verify
    const currentList = await AtelierHour.findAll({ order: [['position', 'ASC']] });
    console.log('Current hours in database:');
    console.table(currentList.map(item => ({
      id: item.id,
      day: item.day,
      hours: item.hours,
      isClosed: item.isClosed,
      status: item.status,
      position: item.position
    })));

  } catch (err) {
    console.error('Error during AtelierHours cleanup:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixAtelierHours();
