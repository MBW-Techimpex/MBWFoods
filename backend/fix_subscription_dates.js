/**
 * fix_subscription_dates.js
 * One-time migration: fixes subscription order items whose deliveries[] dates
 * were stored as UTC strings (off-by-one in IST/UTC+5:30).
 *
 * Run: node fix_subscription_dates.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function main() {
  await sequelize.authenticate();
  console.log('✅ DB connected');

  // Fetch all order items that have a deliveries array
  const [rows] = await sequelize.query(`
    SELECT oi.id, oi.options, o.delivery_date
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.options->>'isSubscription' = 'true'
      AND jsonb_array_length(oi.options->'deliveries') > 0
    ORDER BY oi.id
  `);

  console.log(`Found ${rows.length} subscription order item(s) to check.`);

  let fixed = 0;

  for (const row of rows) {
    const options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
    const deliveries = options.deliveries || [];

    // Detect bug: duplicate dates in deliveries (sign of UTC off-by-one)
    const dateSet = new Set(deliveries.map(d => d.date));
    const hasDuplicates = dateSet.size < deliveries.length;

    // Also check if any delivery date doesn't match the actual calendar day
    const startDateFromDeliveries = deliveries[0]?.date;
    let needsFix = hasDuplicates;

    if (!needsFix && startDateFromDeliveries) {
      // Verify the dates are sequential with no gaps
      const [sy, sm, sd] = startDateFromDeliveries.split('-').map(Number);
      for (let i = 0; i < deliveries.length; i++) {
        const expected = new Date(sy, sm - 1, sd + i);
        if (localDateStr(expected) !== deliveries[i].date) {
          needsFix = true;
          break;
        }
      }
    }

    if (!needsFix) continue;

    console.log(`\nFixing order_item #${row.id}:`);
    console.log('  Old dates:', deliveries.map(d => d.date).join(', '));

    // Use delivery_date from the order as the canonical start date
    let startStr = row.delivery_date
      ? (typeof row.delivery_date === 'string'
          ? row.delivery_date.split('T')[0]
          : localDateStr(new Date(row.delivery_date)))
      : deliveries[0]?.date;

    if (!startStr) {
      console.log('  ⚠️  No start date found, skipping.');
      continue;
    }

    const [sy, sm, sd] = startStr.split('-').map(Number);
    const newDeliveries = deliveries.map((d, i) => {
      const dt = new Date(sy, sm - 1, sd + i);
      const dateStr = localDateStr(dt);
      const dayName = DAYS[dt.getDay()];
      return {
        ...d,
        date: dateStr,
        dayName,
        dayIndex: i + 1,
      };
    });

    console.log('  New dates:', newDeliveries.map(d => `${d.date}(${d.dayName})`).join(', '));

    const updatedOptions = { ...options, deliveries: newDeliveries };
    await sequelize.query(
      `UPDATE order_items SET options = :opts::jsonb WHERE id = :id`,
      { replacements: { opts: JSON.stringify(updatedOptions), id: row.id } }
    );
    fixed++;
  }

  console.log(`\n✅ Fixed ${fixed} order item(s). Done.`);
  await sequelize.close();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
