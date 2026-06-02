require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, port: process.env.DB_PORT, dialect: 'postgres', logging: false
});

const Order = sq.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  status: DataTypes.STRING,
  customer_name: DataTypes.STRING,
  delivery_date: DataTypes.DATEONLY,
}, { tableName: 'orders', underscored: true, timestamps: true });

const OrderItem = sq.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  order_id: DataTypes.INTEGER,
  name: DataTypes.STRING,
  options: DataTypes.JSONB,
}, { tableName: 'order_items', underscored: true, timestamps: true });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

sq.authenticate().then(async () => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem, as: 'items' }],
    order: [['id', 'ASC']]
  });

  const prepDate = '2026-06-01';
  console.log(`\nFiltering for prepDate: ${prepDate}\n`);

  orders.forEach(order => {
    if (order.status?.toLowerCase() === 'cancelled') return;
    (order.items || []).forEach(item => {
      if (item.options?.isSubscription) {
        console.log(`Order #${order.id} | Item #${item.id} | delivery_date: ${order.delivery_date}`);
        const deliveries = item.options.deliveries;
        console.log('  typeof deliveries:', typeof deliveries, '| Array?', Array.isArray(deliveries));
        if (Array.isArray(deliveries)) {
          console.log('  Dates:', deliveries.map(d => d.date));
          const match = deliveries.find(d => d.date === prepDate);
          console.log('  Match for', prepDate, ':', match || 'NOT FOUND');
        }
      }
    });
  });

  await sq.close();
}).catch(e => { console.error(e.message); process.exit(1); });
