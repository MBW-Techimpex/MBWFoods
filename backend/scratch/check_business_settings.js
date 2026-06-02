const sequelize = require('../src/config/database');
sequelize.query('SELECT * FROM settings').then(([r]) => {
    const business = r.filter(s => s.group === 'business');
    console.log(JSON.stringify(business, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
