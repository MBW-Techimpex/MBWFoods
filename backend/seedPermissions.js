const Permission = require('./src/models/Permission');

async function seedPermissions() {
    try {
        const count = await Permission.count();
        // Force re-seed to match exact sidebar labels
        console.log('Synchronizing permissions with your Admin Sidebar menus...');

        const roles = ['SUPERADMIN', 'Admin', 'Staff', 'Manager'];
        const sections = [
            {
                name: 'General Management',
                perms: [
                    { key: 'dashboard', label: 'Dashboard' },
                    { key: 'dynamic_pages', label: 'Dynamic Pages' },
                    { key: 'media_library', label: 'Media Library' },
                    { key: 'activities_log', label: 'Activities Log' }
                ]
            },
            {
                name: 'Home Page',
                perms: [
                    { key: 'admin_header', label: 'Header' },
                    { key: 'admin_banners', label: 'Main Banner' },
                    { key: 'admin_benefits', label: 'Why Choose Us' },
                    { key: 'admin_categories', label: 'Categories' },
                    { key: 'admin_signature', label: 'Signature Collections' },
                    { key: 'admin_discoveries', label: 'Curated Discoveries' },
                    { key: 'admin_faqs', label: 'FAQs' },
                    { key: 'admin_testimonials', label: 'Testimonials' },
                    { key: 'admin_newsletter', label: 'Newsletter/Subscribers' },
                    { key: 'admin_atelier', label: 'Showroom Info' },
                    { key: 'admin_footer', label: 'Footer' }
                ]
            },
            {
                name: 'Shop Management',
                perms: [
                    { key: 'admin_products', label: 'Products' },
                    { key: 'admin_inventory', label: 'Inventory' },
                    { key: 'admin_orders', label: 'Orders' },
                    { key: 'admin_customers', label: 'Customers' }
                ]
            },
            {
                name: 'Configuration Control',
                perms: [
                    { key: 'settings_general', label: 'General Settings' },
                    { key: 'settings_business', label: 'Business Settings' },
                    { key: 'settings_staff', label: 'Add/Edit Staff' },
                    { key: 'settings_privileges', label: 'User Privileges' }
                ]
            }
        ];

        const allPerms = [];

        for (const role of roles) {
            for (const section of sections) {
                for (const p of section.perms) {
                    allPerms.push({
                        role,
                        section: section.name,
                        permission_key: p.key,
                        label: p.label,
                        is_granted: role === 'Admin' || role === 'SUPERADMIN' // Admins get all by default
                    });
                }
            }
        }

        await Permission.destroy({ where: {}, truncate: true });
        await Permission.bulkCreate(allPerms);
        console.log(`Successfully mapped ${allPerms.length} privileges to your actual studio menus.`);
    } catch (error) {
        console.error('Failed to seed permissions:', error);
    }
}

module.exports = seedPermissions;
