const Product = require('../src/models/Product');

async function manualFix() {
    try {
        console.log('Manually fixing remaining product subcategories...');
        
        await Product.update(
            { sub_category: 'STEERING CONTROLS' },
            { where: { sub_category: 'steering controles' } }
        );
        
        await Product.update(
            { sub_category: 'DRLS' },
            { where: { sub_category: 'DRLs' } }
        );

        console.log('Manual fix complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

manualFix();
