const sequelize = require('../src/config/database');
const Order = require('../src/models/Order');
const Customer = require('../src/models/Customer');

async function backfill() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const orphaned = await Order.findAll({ where: { customer_id: null } });
    console.log(`Analyzing ${orphaned.length} orphaned orders...`);

    let linkedCount = 0;

    for (const ord of orphaned) {
      if (!ord.customer_email) continue;

      const customer = await Customer.findOne({ where: { email: ord.customer_email } });
      if (customer) {
        await ord.update({ customer_id: customer.id });
        console.log(`Linked order ${ord.id} to customer ${customer.id} (${ord.customer_email})`);
        linkedCount++;
      }
    }

    console.log(`Finished. Linked ${linkedCount} orders successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('Backfill failed:', err);
    process.exit(1);
  }
}

backfill();
