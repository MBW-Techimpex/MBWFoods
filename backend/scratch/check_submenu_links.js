const { SubMenu } = require('../src/models/Menu');

async function checkSubMenuLinks() {
    try {
        console.log('Checking sub-menu links for INTERIOR ACCESSORIES...');
        const subs = await SubMenu.findAll({
            where: { name: 'Car Perfumes' }
        });
        
        subs.forEach(s => {
            console.log(`Submenu: ${s.name}, Link: ${s.link}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSubMenuLinks();
