const sequelize = require('./src/config/database');
const SettingModel = require('./src/models/Setting');
const SectionSettingModel = require('./src/models/SectionSetting');

async function directUpdate() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');
        
        const sectionUpdates = [
            { key: 'whychooseus_heading', value: 'Why Choose MBW Luxury?' },
            { key: 'whychooseus_tagline', value: 'The MBW Standard' },
            { key: 'explorecategories_heading', value: 'Discover Perfection' },
            { key: 'explorecategories_tagline', value: 'ELITE COLLECTIONS' },
            { key: 'explorecategories_quote', value: '"Redefining automotive luxury through precision engineering."' },
            { key: 'faq_heading', value: 'MBW Intelligence' },
            { key: 'testimonials_heading', value: 'Elite Perspectives.' }
        ];

        for (const item of sectionUpdates) {
            await SectionSettingModel.upsert({ key: item.key, value: item.value });
            console.log(`Updated SectionSetting: ${item.key}`);
        }
        
        await SettingModel.upsert({ 
            group: 'site', 
            key: 'site_name', 
            value: 'MBW Luxury',
            type: 'string'
        });
        
        console.log('Database branding updated successfully.');
        process.exit(0);
    } catch (e) {
        console.error('Update failed:', e);
        process.exit(1);
    }
}

directUpdate();
