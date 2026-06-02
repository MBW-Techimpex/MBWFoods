const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');
const Admin = require('../models/Admin');
const Permission = require('../models/Permission');
const { getMailerConfig, getTransporter, sendForgotPasswordEmail } = require('../utils/mailer');
const SectionSetting = require('../models/SectionSetting');
const { renderEmailTemplate } = require('../utils/emailTemplates');
const verifyCustomerToken = require('../middleware/auth');

// --- ADMIN ROUTES ---

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const trimmedUsername = username ? username.trim() : '';
  try {
    const admin = await Admin.findOne({ where: { username: trimmedUsername } });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    if (admin.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    const permsList = await Permission.findAll({
      where: { role: admin.role ? admin.role.toUpperCase() : 'STAFF', is_granted: true },
      attributes: ['permission_key']
    });
    const permissions = permsList.map(p => p.permission_key);

    res.json({ 
      admin: { 
        id: admin.id, 
        username: admin.username, 
        role: admin.role,
        permissions: permissions
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Verify Session
router.get('/verify', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    const admin = await Admin.findByPk(decoded.id, {
      attributes: ['id', 'username', 'role']
    });
    if (!admin) return res.status(401).json({ message: 'Invalid token' });

    const permsList = await Permission.findAll({
      where: { role: admin.role ? admin.role.toUpperCase() : 'STAFF', is_granted: true },
      attributes: ['permission_key']
    });
    const permissions = permsList.map(p => p.permission_key);

    res.json({
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        permissions: permissions
      }
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// --- CUSTOMER ROUTES ---

// Customer Register
router.post('/customer/register', async (req, res) => {
  const { email, password, first_name, last_name, phone } = req.body;
  try {
    const existing = await Customer.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const verification_token = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      verification_token,
      is_verified: false
    });

    const siteNameSetting = await Setting.findOne({ where: { key: 'site_name' } });
    const siteName = siteNameSetting ? siteNameSetting.value : 'MBW Car Accessories';

    const brandPrimarySetting = await Setting.findOne({ where: { key: 'brand_primary' } });
    const brandAccentSetting = await Setting.findOne({ where: { key: 'brand_accent' } });
    const brandPrimary = brandPrimarySetting ? brandPrimarySetting.value : '#4f46e5';
    const brandAccent = brandAccentSetting ? brandAccentSetting.value : '#64748b';

      // Send Verification Email
      const enableRegisterMail = await Setting.findOne({ where: { key: 'mail_enable_register' } });
      if (enableRegisterMail && enableRegisterMail.value === 'true') {
        const config = await getMailerConfig('register');
        const transporter = await getTransporter('register');
        const verificationUrl = `${process.env.APP_DOMAIN}/api/auth/customer/verify/${verification_token}`;

        // Get selected register template
        const registerThemeSetting = await SectionSetting.findOne({ where: { key: 'email_template_register' } });
        const registerThemeNum = registerThemeSetting ? registerThemeSetting.value : '1';

        const templateData = {
          siteName,
          brandPrimary,
          brandAccent,
          email,
          password,
          verificationUrl
        };

        const registrationHtml = renderEmailTemplate('register', registerThemeNum, templateData);

        const mailOptions = {
          from: `"${config.fromName}" <${config.user}>`,
          to: email,
          subject: `Verify Your ${siteName} Account`,
          html: registrationHtml
        };

        await transporter.sendMail(mailOptions);

      // Admin Notification for New Registration
      const enableAdminRegisterMail = await Setting.findOne({ where: { key: 'mail_enable_register_admin' } });
      if (enableAdminRegisterMail && enableAdminRegisterMail.value === 'true') {
        const adminMailOptions = {
          from: `"${config.fromName}" <${config.user}>`,
          to: config.adminEmail,
          subject: `[ADMIN ALERT] New Registration: ${first_name} ${last_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background: #fafafa;">
              <h1 style="color: ${brandPrimary}; text-align: center; margin-bottom: 24px;">New Registration Alert</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6;">A new customer has registered at <strong>${siteName}</strong>.</p>
              
              <div style="margin: 24px 0; padding: 20px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
                <p style="margin: 0 0 12px 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #f1f5f9; pb-2;">Customer Details</p>
                <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 8px 0; color: #1e293b; font-size: 14px;"><strong>Phone:</strong> ${phone}</p>
              </div>
              
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">Please log in to the admin panel to manage this account.</p>
            </div>
          `
        };
        await transporter.sendMail(adminMailOptions);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your identity.',
      needsVerification: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering customer', error: error.message });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) return res.status(401).json({ message: 'Invalid credentials' });

    if (!customer.is_verified) {
      return res.status(401).json({
        message: 'Identity not verified. Please check your email.',
        unverified: true
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: customer.id, role: 'customer' },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.cookie('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ customer: { id: customer.id, email: customer.email, first_name: customer.first_name, last_name: customer.last_name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer Logout
router.post('/customer/logout', (req, res) => {
  res.clearCookie('customer_token');
  res.json({ message: 'Logged out successfully' });
});

// Verify Customer Session
router.get('/customer/verify', verifyCustomerToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const customer = await Customer.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone']
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error('[Verify Customer] Server Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer Verify Email (One-time use)
router.get('/customer/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const customer = await Customer.findOne({ where: { verification_token: token } });
    
    if (!customer) {
      const siteNameSetting = await Setting.findOne({ where: { key: 'site_name' } });
      const siteName = siteNameSetting ? siteNameSetting.value : 'MBW Car Accessories';
      const brandPrimarySetting = await Setting.findOne({ where: { key: 'brand_primary' } });
      const brandPrimary = brandPrimarySetting ? brandPrimarySetting.value : '#4f46e5';
      const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://caraccessories.mbwhost.in' : (process.env.FRONTEND_URL || 'http://localhost:5173');
      
      return res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 80px 20px; background: #fafafa; min-height: 100vh;">
          <div style="max-width: 500px; margin: auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
            <div style="width: 64px; hieght: 64px; background: #fff1f2; color: #e11d48; border-radius: 100%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 32px; font-weight: bold; line-height: 64px;">!</div>
            <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 12px;">Link Inactive</h1>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">This verification link has already been used or has expired. Please log in to your account at ${siteName}.</p>
            <a href="${frontendUrl}/account" style="background: ${brandPrimary}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Return to Account</a>
          </div>
        </div>
      `);
    }

    await customer.update({
      is_verified: true,
      verification_token: null // Disable link after one-time use
    });

    const redirectUrl = process.env.NODE_ENV === 'production' 
      ? 'https://caraccessories.mbwhost.in/account?verified=true' 
      : `${process.env.FRONTEND_URL || 'http://localhost:5173'}/account?verified=true`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// --- FORGOT / RESET PASSWORD ROUTES ---

// Admin Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(200).json({ message: 'If that email address exists, a recovery link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await admin.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });

    const appDomain = process.env.APP_DOMAIN || `${req.protocol}://${req.get('host')}`;
    const resetUrl = `${appDomain}/admin/login?token=${token}`;

    // Send email asynchronously so SMTP handshake latency doesn't block API response
    sendForgotPasswordEmail(email, resetUrl, admin.username, 'admin').catch(err => {
      console.error('[Admin Forgot Password] Email send failure:', err);
    });

    res.json({ 
      message: 'If that email address exists, a recovery link has been sent.',
      token // For dev/testing purposes
    });
  } catch (err) {
    console.error('[Admin Forgot Password] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const { Op } = require('sequelize');
    const admin = await Admin.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!admin) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters and include a mix of letters, numbers, and special characters.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    console.error('[Admin Reset Password] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customer Forgot Password
router.post('/customer/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }
    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(200).json({ message: 'If that email address exists, a recovery link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await customer.update({
      resetPasswordToken: token,
      resetPasswordExpires: expires
    });

    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://caraccessories.mbwhost.in' 
      : (process.env.FRONTEND_URL || 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/account?token=${token}`;

    // Send email asynchronously so SMTP handshake latency doesn't block API response
    sendForgotPasswordEmail(email, resetUrl, `${customer.first_name} ${customer.last_name}`.trim(), 'customer').catch(err => {
      console.error('[Customer Forgot Password] Email send failure:', err);
    });

    res.json({ 
      message: 'If that email address exists, a recovery link has been sent.',
      token // For dev/testing purposes
    });
  } catch (err) {
    console.error('[Customer Forgot Password] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Customer Reset Password
router.post('/customer/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    const { Op } = require('sequelize');
    const customer = await Customer.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!customer) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters and include a mix of letters, numbers, and special characters.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await customer.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Password updated successfully. You can now login.' });
  } catch (err) {
    console.error('[Customer Reset Password] Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
