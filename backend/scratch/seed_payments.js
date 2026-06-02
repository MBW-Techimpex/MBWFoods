const PaymentMethod = require('../src/models/PaymentMethod');
const sequelize = require('../src/config/database');

async function seed() {
  try {
    await sequelize.authenticate();
    await PaymentMethod.sync();
    
    const count = await PaymentMethod.count();
    if (count === 0) {
      const methods = [
        { name: 'Visa', logo: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@master/flat/visa.svg', order: 0 },
        { name: 'MasterCard', logo: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@master/flat/mastercard.svg', order: 1 },
        { name: 'American Express', logo: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@master/flat/amex.svg', order: 2 },
        { name: 'Discover', logo: 'https://cdn.jsdelivr.net/gh/aaronfagan/svg-credit-card-payment-icons@master/flat/discover.svg', order: 3 }
      ];
      
      await PaymentMethod.bulkCreate(methods);
      console.log('Seeded default payment methods.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
