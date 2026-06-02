const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');
const { Op } = require('sequelize');

async function check() {
    try {
        const titles = [
            "Carbon Fiber Steering Wheel",
            "7D Premium Floor Mats",
            "Sleek Roof Rack System",
            "Matrix LED Headlights"
        ];
        const products = await Product.findAll({
            where: {
                name: {
                    [Op.iLike]: { [Op.any]: titles.map(t => `%${t}%`) }
                }
            }
        });
        console.log('Found Products:', JSON.stringify(products.map(p => ({ id: p.id, name: p.name })), null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
