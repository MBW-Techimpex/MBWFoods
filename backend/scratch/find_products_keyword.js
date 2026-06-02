const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');
const { Op } = require('sequelize');

async function check() {
    try {
        const keywords = ["Floor Mats", "Steering", "Roof Rack", "Headlights"];
        const products = await Product.findAll({
            where: {
                name: {
                    [Op.or]: keywords.map(k => ({ [Op.iLike]: `%${k}%` }))
                }
            },
            limit: 20
        });
        console.log('Found Products:', JSON.stringify(products.map(p => ({ id: p.id, name: p.name })), null, 2));
    } catch (e) {
        console.log('Error:', e.message);
    }
}
check();
