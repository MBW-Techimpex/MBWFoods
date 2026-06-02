const nodemailer = require('nodemailer');
const Setting = require('../models/Setting');
const SectionSetting = require('../models/SectionSetting');
const { renderEmailTemplate } = require('./emailTemplates');

const getMailerConfig = async (type = 'order') => {
    const fromName = await Setting.findOne({ where: { key: 'mail_from_name' } });
    const adminEmail = await Setting.findOne({ where: { key: 'mail_admin_email' } });
    
    let fromId, appPass;
    if (type === 'register') {
        fromId = await Setting.findOne({ where: { key: 'mail_register_from_id' } });
        appPass = await Setting.findOne({ where: { key: 'mail_register_app_password' } });
    } else {
        fromId = await Setting.findOne({ where: { key: 'mail_order_from_id' } });
        appPass = await Setting.findOne({ where: { key: 'mail_order_app_password' } });
    }

    return {
        user: fromId ? fromId.value : "taskenginembw@gmail.com",
        pass: appPass ? appPass.value : "rgxi vkao aqli pafs",
        fromName: fromName ? fromName.value : "Car Accessories",
        adminEmail: adminEmail ? adminEmail.value : "taskenginembw@gmail.com"
    };
};

const getTransporter = async (type = 'order') => {
    const config = await getMailerConfig(type);
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
};

const sendOrderConfirmation = async (order, customer, items, isNewCustomer = false) => {
    const config = await getMailerConfig('order');
    const transporter = await getTransporter('order');

    const currencySetting = await Setting.findOne({ where: { key: 'currency' } });
    const currency = currencySetting ? currencySetting.value : 'USD';
    const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£', 'INR': '₹', 'CAD': '$', 'AUD': '$', 'SGD': '$', 'AED': 'د.إ' };
    const symbol = symbols[currency] || '$';

    const siteNameSetting = await Setting.findOne({ where: { key: 'site_name' } });
    const siteName = siteNameSetting ? siteNameSetting.value : 'MBW Car Accessories';

    const brandPrimarySetting = await Setting.findOne({ where: { key: 'theme_color' } });
    const brandAccentSetting = await Setting.findOne({ where: { key: 'secondary_color' } });
    const brandPrimary = brandPrimarySetting ? brandPrimarySetting.value : '#4f46e5';
    const brandAccent = brandAccentSetting ? brandAccentSetting.value : '#64748b';

    // Get selected themes
    const customerThemeSetting = await SectionSetting.findOne({ where: { key: 'email_template_order' } });
    const customerThemeNum = customerThemeSetting ? customerThemeSetting.value : '1';

    const adminThemeSetting = await SectionSetting.findOne({ where: { key: 'email_template_admin_order' } });
    const adminThemeNum = adminThemeSetting ? adminThemeSetting.value : '1';

    const data = {
        siteName,
        brandPrimary,
        brandAccent,
        symbol,
        order,
        customer,
        items,
        isNewCustomer
    };

    const customerHtml = renderEmailTemplate('order', customerThemeNum, data);
    const adminHtml = renderEmailTemplate('admin_order', adminThemeNum, data);

    const mailOptions = {
        from: `"${config.fromName}" <${config.user}>`,
        to: order.customer_email,
        subject: `Order Confirmation: #${order.id.split('-')[0].toUpperCase()}`,
        html: customerHtml
    };

    try {
        const enableCustomer = await Setting.findOne({ where: { key: 'mail_enable_order' } });
        const enableAdmin = await Setting.findOne({ where: { key: 'mail_enable_order_admin' } });

        if (enableCustomer && enableCustomer.value === 'true') {
            await transporter.sendMail(mailOptions);
            console.log(`[Email] Order confirmation sent to ${order.customer_email}`);
        }

        // Admin Notification
        if (enableAdmin && enableAdmin.value === 'true') {
            const adminMailOptions = {
                from: `"${config.fromName}" <${config.user}>`,
                to: config.adminEmail,
                subject: `[ADMIN ALERT] New Order Received: #${order.id.split('-')[0].toUpperCase()}`,
                html: adminHtml
            };
            await transporter.sendMail(adminMailOptions);
            console.log(`[Email] Admin notification sent to ${config.adminEmail}`);
        }

    } catch (error) {
        console.error('[Email] Failed to send order confirmation:', error);
    }
};

const sendForgotPasswordEmail = async (email, resetUrl, userName = '', userType = 'customer') => {
    const config = await getMailerConfig('register');
    const transporter = await getTransporter('register');

    const siteNameSetting = await Setting.findOne({ where: { key: 'site_name' } });
    const siteName = siteNameSetting ? siteNameSetting.value : 'MBW Car Accessories';

    const brandPrimarySetting = await Setting.findOne({ where: { key: 'theme_color' } });
    const brandAccentSetting = await Setting.findOne({ where: { key: 'secondary_color' } });
    const brandPrimary = brandPrimarySetting ? brandPrimarySetting.value : '#4f46e5';
    const brandAccent = brandAccentSetting ? brandAccentSetting.value : '#64748b';

    const data = {
        siteName,
        brandPrimary,
        brandAccent,
        resetUrl,
        userName
    };

    const html = renderEmailTemplate('forgot_password', '1', data);

    const mailOptions = {
        from: `"${config.fromName}" <${config.user}>`,
        to: email,
        subject: `Password Reset Request - ${siteName}`,
        html: html
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Password reset link sent to ${email} (${userType})`);
};

module.exports = { sendOrderConfirmation, getMailerConfig, getTransporter, sendForgotPasswordEmail };
