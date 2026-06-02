const sequelize = require('./backend/src/config/database');
const OrderItem = require('./backend/src/models/OrderItem');
const Product = require('./backend/src/models/Product');

async function fixImages() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Find all OrderItems where image is null or empty
    const orderItems = await OrderItem.findAll({
      where: {
        image: null
      }
    });

    console.log(`Found ${orderItems.length} order items with null/missing images.`);

    let updatedCount = 0;
    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id);
      if (product && product.image) {
        item.image = product.image;
        await item.save();
        updatedCount++;
        console.log(`Updated OrderItem #${item.id} ('${item.name}') with image: ${product.image}`);
      } else {
        console.log(`Could not update OrderItem #${item.id} - Product not found or has no image.`);
      }
    }

    console.log(`Successfully updated ${updatedCount} order items.`);
  } catch (error) {
    console.error('Error fixing order images:', error);
  } finally {
    await sequelize.close();
  }
}

fixImages();
