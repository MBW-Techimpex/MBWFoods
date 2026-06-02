/**
 * Email Templates Module
 * Provides 3 distinct themes for each email category:
 * 1. Theme 1: Sleek Dark / Tech Modern
 * 2. Theme 2: Royal Minimal / Serif Elegance
 * 3. Theme 3: Carbon Dynamic / Vibrant Sporty
 */

// Helper to format currency
const formatVal = (val) => parseFloat(val || 0).toFixed(2);

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CUSTOMER REGISTRATION WELCOME / VERIFICATION TEMPLATES
 * ─────────────────────────────────────────────────────────────────────────────
 */

const registerTheme1 = ({ siteName, brandPrimary, brandAccent, email, password, verificationUrl }) => `
<div style="background-color: #090d16; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; min-height: 100%;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
    <div style="background: linear-gradient(135deg, ${brandPrimary}, #000000); padding: 40px; text-align: center; border-bottom: 1px solid #374151;">
      <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.3em; background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px;">${siteName}</span>
      <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 0 0; font-weight: 800; tracking-tight;">Welcome to the Elite Circle</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
        Hello and welcome. Your secure account for ${siteName} is now initialized. Please confirm your identity using the link below to finalize your registration.
      </p>
      
      <div style="background: #1f2937; border: 1px solid #374151; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <span style="font-size: 9px; font-weight: 900; color: ${brandPrimary}; text-transform: uppercase; letter-spacing: 0.15em; display: block; margin-bottom: 12px;">Security Credentials</span>
        <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Username:</strong> ${email}</p>
        <p style="margin: 6px 0; font-size: 14px; color: #e5e7eb;"><strong>Password:</strong> ${password}</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationUrl}" style="background-color: ${brandPrimary}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 10px 20px ${brandPrimary}33;">Verify My Identity</a>
      </div>

      <p style="font-size: 11px; color: #6b7280; line-height: 1.5; text-align: center; margin: 0;">
        If you did not execute this registration request, please disregard this transmission. This link is for one-time use only.
      </p>
    </div>
    <div style="background: #0b0f19; padding: 24px; text-align: center; border-top: 1px solid #1f2937;">
      <p style="margin: 0; font-size: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em;">© 2026 ${siteName} Secure Portal</p>
    </div>
  </div>
</div>
`;

const registerTheme2 = ({ siteName, brandPrimary, brandAccent, email, password, verificationUrl }) => `
<div style="background-color: #faf8f5; padding: 60px 20px; font-family: 'Playfair Display', Georgia, serif; color: #2c2520;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7dfd5; border-radius: 8px; padding: 50px; box-shadow: 0 4px 20px rgba(44,37,32,0.04);">
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #f2ece4; pb-30;">
      <h2 style="font-size: 14px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.25em; color: #8e7a68; margin: 0 0 10px 0;">${siteName}</h2>
      <h1 style="font-size: 32px; font-weight: 400; font-style: italic; color: #1a1512; margin: 0 0 20px 0;">The Showroom Awaits</h1>
    </div>
    
    <div style="font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.8; color: #5c524a;">
      <p style="margin: 0 0 24px 0;">
        Dear Client,
      </p>
      <p style="margin: 0 0 30px 0;">
        We are pleased to welcome you to ${siteName}. Your account setup is complete. To activate your credentials and access the showroom tools, please verify your email address.
      </p>
      
      <div style="border-left: 2px solid #8e7a68; padding-left: 20px; margin: 30px 0; background: #fdfcfb; padding-top: 10px; padding-bottom: 10px;">
        <p style="margin: 4px 0; font-size: 13px;"><strong>Login Email:</strong> ${email}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Secret Password:</strong> ${password}</p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationUrl}" style="background-color: #1a1512; color: #ffffff; padding: 18px 40px; text-decoration: none; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; display: inline-block;">Activate Account</a>
      </div>

      <p style="font-size: 11px; color: #a89f95; font-style: italic; text-align: center; margin: 40px 0 0 0;">
        If this was not initiated by you, please disregard this communication.
      </p>
    </div>
  </div>
</div>
`;

const registerTheme3 = ({ siteName, brandPrimary, brandAccent, email, password, verificationUrl }) => `
<div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Outfit', sans-serif; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 4px solid #111827; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
    <div style="background: #111827; padding: 30px; text-align: center; position: relative;">
      <span style="color: ${brandPrimary}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; display: block; margin-bottom: 8px;">SYSTEM SECURE ALERT</span>
      <h1 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 900; tracking-wide;">IDENTITY VALIDATION</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0;">Welcome aboard!</p>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0 0 28px 0;">
        You have successfully initiated a registration with <strong>${siteName}</strong>. Use the control button below to verify your email and gain admin dashboard access.
      </p>
      
      <div style="background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 20px; padding: 24px; margin-bottom: 30px;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase;">Username</td>
            <td style="font-size: 14px; font-weight: 700; color: #111827; text-align: right;">${email}</td>
          </tr>
          <tr>
            <td style="font-size: 11px; color: #9ca3af; font-weight: bold; text-transform: uppercase; padding-top: 10px;">Token</td>
            <td style="font-size: 14px; font-weight: 700; color: #111827; text-align: right; padding-top: 10px;">${password}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin: 35px 0;">
        <a href="${verificationUrl}" style="background-color: ${brandPrimary}; color: #ffffff; padding: 18px 36px; border-radius: 100px; text-decoration: none; font-weight: 900; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; border: 3px solid #111827;">Confirm Account Now →</a>
      </div>

      <div style="border-top: 1px solid #f3f4f6; padding-top: 20px; text-align: center;">
        <span style="font-size: 10px; color: #9ca3af; font-weight: 700; uppercase;">SECURITY PROTOCOLS ACTIVE ON THIS TRANSMISSION</span>
      </div>
    </div>
  </div>
</div>
`;


/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CUSTOMER ORDER SUCCESS / CONFIRMATION TEMPLATES
 * ─────────────────────────────────────────────────────────────────────────────
 */

const orderTheme1 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #090d16; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; min-height: 100%;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, ${brandPrimary}, #000000); padding: 40px; text-align: center; border-bottom: 1px solid #374151;">
      <span style="font-size: 9px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.25em;">Order Registered</span>
      <h1 style="color: #ffffff; font-size: 26px; margin: 12px 0 0 0; font-weight: 800;">Order Success #${order.id.split('-')[0].toUpperCase()}</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 15px; color: #e5e7eb; font-weight: 600;">Hello ${customer.first_name || 'Client'},</p>
      <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
        We have successfully logged your acquisition. A notification will trigger once the elements dispatch to your designated address.
      </p>

      <div style="margin: 24px 0; border-top: 1px solid #1f2937; border-bottom: 1px solid #1f2937; padding: 12px 0; text-align: center;">
         <a href="${process.env.FRONTEND_URL || '#'}/account" style="color: ${brandPrimary}; font-size: 12px; font-weight: bold; text-decoration: none; margin-right: 15px;">Dossier Status</a>
         <span style="color: #4b5563;">|</span>
         <a href="${process.env.FRONTEND_URL || '#'}/terms-conditions" style="color: ${brandPrimary}; font-size: 12px; font-weight: bold; text-decoration: none; margin-left: 15px;">Policies & Returns</a>
      </div>

      <h3 style="color: #9ca3af; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 16px;">Acquisitions List</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="border-bottom: 1px solid #1f2937;">
            <th style="text-align: left; padding: 12px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase;">Element</th>
            <th style="text-align: center; padding: 12px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase; w-80;">Qty</th>
            <th style="text-align: right; padding: 12px 0; font-size: 11px; color: #9ca3af; text-transform: uppercase;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #1f2937;">
              <td style="padding: 16px 0; font-size: 14px; font-weight: 600; color: #ffffff;">${item.name}</td>
              <td style="padding: 16px 0; font-size: 14px; text-align: center; color: #9ca3af;">${item.quantity}</td>
              <td style="padding: 16px 0; font-size: 14px; text-align: right; font-weight: 600; color: #ffffff;">${symbol}${formatVal(item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="background: #1f2937; border-radius: 16px; padding: 24px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Shipping & Handling</td>
            <td style="padding: 6px 0; color: #ffffff; font-size: 13px; font-weight: 600; text-align: right;">${symbol}${formatVal(order.shipping_amount)}</td>
          </tr>
          ${order.discount_code ? `
          <tr>
            <td style="padding: 6px 0; color: #9ca3af; font-size: 13px;">Promotion</td>
            <td style="padding: 6px 0; color: #10b981; font-size: 13px; font-weight: 600; text-align: right;">-${symbol}${formatVal(order.discount_amount)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 1px solid #374151;">
            <td style="padding: 12px 0 0 0; color: #ffffff; font-size: 14px; font-weight: bold;">Grand Total</td>
            <td style="padding: 12px 0 0 0; color: ${brandPrimary}; font-size: 18px; font-weight: 900; text-align: right;">${symbol}${formatVal(order.total_amount)}</td>
          </tr>
        </table>
      </div>
    </div>
    <div style="background: #0b0f19; padding: 24px; text-align: center; border-top: 1px solid #1f2937;">
      <p style="margin: 0; font-size: 10px; color: #4b5563; text-transform: uppercase;">© 2026 ${siteName}</p>
    </div>
  </div>
</div>
`;

const orderTheme2 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #faf8f5; padding: 60px 20px; font-family: 'Playfair Display', Georgia, serif; color: #2c2520;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7dfd5; padding: 50px; box-shadow: 0 4px 20px rgba(44,37,32,0.04);">
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 1px solid #f2ece4; padding-bottom: 30px;">
      <h2 style="font-size: 12px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.25em; color: #8e7a68; margin-bottom: 12px;">Acquisition Registered</h2>
      <h1 style="font-size: 28px; font-weight: 400; font-style: italic; color: #1a1512; margin: 0;">Receipt Selection #${order.id.split('-')[0].toUpperCase()}</h1>
    </div>

    <div style="font-family: 'Inter', sans-serif; font-size: 14px; color: #5c524a; line-height: 1.8;">
      <p>Dear ${customer.first_name || 'Client'},</p>
      <p>We confirm receipt of order <strong>#${order.id.split('-')[0].toUpperCase()}</strong>. It is currently being reviewed by our workshop artisans.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 40px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #f2ece4;">
            <th style="text-align: left; padding: 12px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #8e7a68;">Specification</th>
            <th style="text-align: center; padding: 12px 0; font-size: 11px; text-transform: uppercase; color: #8e7a68; w-50;">Qty</th>
            <th style="text-align: right; padding: 12px 0; font-size: 11px; text-transform: uppercase; color: #8e7a68;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px solid #fdfbfa;">
              <td style="padding: 16px 0; font-size: 13px; color: #1a1512; font-weight: 500;">${item.name}</td>
              <td style="padding: 16px 0; font-size: 13px; text-align: center;">${item.quantity}</td>
              <td style="padding: 16px 0; font-size: 13px; text-align: right; font-weight: 600; color: #1a1512;">${symbol}${formatVal(item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="border-top: 1px solid #f2ece4; padding-top: 20px; margin-bottom: 30px;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #8e7a68; font-size: 13px;">Shipping Services</td>
            <td style="text-align: right; color: #1a1512; font-weight: 600; font-size: 13px;">${symbol}${formatVal(order.shipping_amount)}</td>
          </tr>
          ${order.discount_code ? `
          <tr>
            <td style="color: #8e7a68; font-size: 13px;">Promotion</td>
            <td style="text-align: right; color: #8e7a68; font-weight: 600; font-size: 13px;">-${symbol}${formatVal(order.discount_amount)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 1px solid #f2ece4;">
            <td style="padding-top: 15px; font-weight: 700; color: #1a1512;">Total Value</td>
            <td style="padding-top: 15px; text-align: right; font-weight: 900; color: #1a1512; font-size: 16px;">${symbol}${formatVal(order.total_amount)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <span style="font-size: 11px; color: #a89f95; font-style: italic;">Thank you for your patronage.</span>
      </div>
    </div>
  </div>
</div>
`;

const orderTheme3 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Outfit', sans-serif; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 4px solid #111827; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
    <div style="background: #111827; padding: 30px; text-align: center;">
      <span style="color: ${brandPrimary}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em;">TRANSACTION COMPLETED</span>
      <h1 style="color: #ffffff; font-size: 24px; margin: 8px 0 0 0; font-weight: 900;">CONFIRMATION #${order.id.split('-')[0].toUpperCase()}</h1>
    </div>
    <div style="padding: 40px;">
      <div style="margin-bottom: 24px;">
        <p style="font-size: 14px; color: #4b5563; margin: 0 0 8px 0;"><strong>Customer Name:</strong> ${customer.first_name} ${customer.last_name}</p>
        <p style="font-size: 14px; color: #4b5563; margin: 0;"><strong>Date:</strong> ${order.delivery_date || 'Standard'}</p>
      </div>

      <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 2px solid #111827; padding-bottom: 8px; margin-bottom: 15px;">Items</h3>
      ${items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e5e7eb;">
          <span style="font-size: 14px; font-weight: 700; color: #111827;">${item.name} <span style="color: #6b7280; font-weight: 400; font-size: 12px;">(x${item.quantity})</span></span>
          <span style="font-size: 14px; font-weight: 900; color: #111827;">${symbol}${formatVal(item.price * item.quantity)}</span>
        </div>
      `).join('')}

      <div style="margin-top: 24px; background: #f9fafb; border-radius: 16px; padding: 20px; border: 2px solid #e5e7eb;">
        <table style="width: 100%;">
          <tr>
            <td style="font-size: 13px; color: #6b7280;">Shipment Charge</td>
            <td style="text-align: right; font-size: 13px; font-weight: 700; color: #111827;">${symbol}${formatVal(order.shipping_amount)}</td>
          </tr>
          ${order.discount_code ? `
          <tr>
            <td style="font-size: 13px; color: #6b7280;">Discount Applied</td>
            <td style="text-align: right; font-size: 13px; font-weight: 700; color: #10b981;">-${symbol}${formatVal(order.discount_amount)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid #111827;">
            <td style="padding-top: 10px; font-weight: 900; color: #111827; font-size: 14px;">Total Charged</td>
            <td style="padding-top: 10px; text-align: right; font-weight: 900; color: ${brandPrimary}; font-size: 18px;">${symbol}${formatVal(order.total_amount)}</td>
          </tr>
        </table>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || '#'}/account" style="background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 12px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">View Full Receipt Status</a>
      </div>
    </div>
  </div>
</div>
`;


/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ADMIN ORDER SUCCESS / ALERT TEMPLATES
 * ─────────────────────────────────────────────────────────────────────────────
 */

const adminOrderTheme1 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #090d16; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; min-height: 100%;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #ef4444; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
    <div style="background: linear-gradient(135deg, #dc2626, #000000); padding: 30px; text-align: center; border-bottom: 1px solid #1f2937;">
      <span style="font-size: 9px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.3em; background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 4px;">ADMIN ALERT</span>
      <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 0 0; font-weight: 800;">New Order Registered</h1>
    </div>
    <div style="padding: 35px;">
      <p style="font-size: 14px; color: #9ca3af; margin: 0 0 20px 0;">
        An acquisition was completed at <strong>${siteName}</strong>. Please find details below for fulfillment.
      </p>

      <div style="background: #1f2937; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
        <p style="margin: 4px 0; font-size: 13px; color: #e5e7eb;"><strong>Order Reference:</strong> #${order.id}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #e5e7eb;"><strong>Client Name:</strong> ${customer.first_name} ${customer.last_name}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #e5e7eb;"><strong>Client Email:</strong> ${customer.email}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #e5e7eb;"><strong>Transaction Total:</strong> ${symbol}${formatVal(order.total_amount)}</p>
      </div>

      <h3 style="color: #9ca3af; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px;">Items Checklist</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        ${items.map(item => `
          <tr style="border-bottom: 1px solid #1f2937;">
            <td style="padding: 12px 0; font-size: 13px; color: #ffffff;"><strong>${item.name}</strong> <span style="color: #9ca3af;">(x${item.quantity})</span></td>
            <td style="padding: 12px 0; font-size: 13px; color: #ffffff; text-align: right;">${symbol}${formatVal(item.price)}</td>
          </tr>
        `).join('')}
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_DOMAIN || '#'}/admin/orders" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase; display: inline-block;">Open Administration Panel</a>
      </div>
    </div>
  </div>
</div>
`;

const adminOrderTheme2 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #faf8f5; padding: 60px 20px; font-family: 'Playfair Display', Georgia, serif; color: #2c2520;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7dfd5; padding: 50px; box-shadow: 0 4px 20px rgba(44,37,32,0.04);">
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 1px solid #f2ece4; padding-bottom: 20px;">
      <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #8e7a68; margin-bottom: 8px;">Concierge Dispatch Notification</h2>
      <h1 style="font-size: 24px; font-weight: 400; font-style: italic; color: #1a1512; margin: 0;">New Acquisition Order</h1>
    </div>

    <div style="font-family: 'Inter', sans-serif; font-size: 13px; color: #5c524a; line-height: 1.8;">
      <p>Administration,</p>
      <p>A new client order has been registered and is pending configuration details.</p>

      <div style="background: #fdfcfb; border: 1px solid #e7dfd5; padding: 20px; margin: 25px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #8e7a68;">Order ID:</td>
            <td style="text-align: right; color: #1a1512; font-weight: 600;">#${order.id.split('-')[0].toUpperCase()}</td>
          </tr>
          <tr>
            <td style="color: #8e7a68;">Client:</td>
            <td style="text-align: right; color: #1a1512; font-weight: 600;">${customer.first_name} ${customer.last_name}</td>
          </tr>
          <tr>
            <td style="color: #8e7a68;">Email:</td>
            <td style="text-align: right; color: #1a1512; font-weight: 600;">${customer.email}</td>
          </tr>
          <tr>
            <td style="color: #8e7a68;">Total Value:</td>
            <td style="text-align: right; color: #1a1512; font-weight: 700;">${symbol}${formatVal(order.total_amount)}</td>
          </tr>
        </table>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="border-bottom: 1px solid #f2ece4;">
            <th style="text-align: left; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #8e7a68;">Item Spec</th>
            <th style="text-align: center; padding: 8px 0; font-size: 11px; text-transform: uppercase; color: #8e7a68; w-40;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr style="border-bottom: 1px dashed #fdfbfa;">
              <td style="padding: 10px 0; color: #1a1512;">${item.name}</td>
              <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_DOMAIN || '#'}/admin/orders" style="background-color: #1a1512; color: #ffffff; padding: 12px 30px; text-decoration: none; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; display: inline-block;">Manage in hPanel</a>
      </div>
    </div>
  </div>
</div>
`;

const adminOrderTheme3 = ({ siteName, brandPrimary, brandAccent, order, customer, items, symbol }) => `
<div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Outfit', sans-serif; color: #1f2937;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 4px solid #ef4444; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);">
    <div style="background: #ef4444; padding: 24px; text-align: center;">
      <span style="color: #ffffff; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em;">NEW ORDER REGISTERED</span>
      <h1 style="color: #ffffff; font-size: 22px; margin: 6px 0 0 0; font-weight: 900;">ADMIN ALERT</h1>
    </div>
    <div style="padding: 35px;">
      <table style="width: 100%; margin-bottom: 25px; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Order reference</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #f3f4f6;">#${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Client name</td>
          <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid #f3f4f6;">${customer.first_name} ${customer.last_name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Grand Total</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 900; color: #ef4444; border-bottom: 1px solid #f3f4f6;">${symbol}${formatVal(order.total_amount)}</td>
        </tr>
      </table>

      <h4 style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 12px;">Items Requested:</h4>
      ${items.map(item => `
        <div style="background: #f9fafb; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 8px;">
          <span style="font-weight: 700; color: #111827;">${item.name}</span>
          <span style="float: right; color: #ef4444; font-weight: 900;">x${item.quantity}</span>
        </div>
      `).join('')}

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.APP_DOMAIN || '#'}/admin/orders" style="background-color: #111827; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 11px; text-transform: uppercase; display: inline-block;">Fulfill Order Now</a>
      </div>
    </div>
  </div>
</div>
`;


const forgotPasswordTheme = ({ siteName, brandPrimary, brandAccent, resetUrl, userName }) => `
<div style="background-color: #090d16; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
    <div style="background: linear-gradient(135deg, ${brandPrimary}, #000000); padding: 40px; text-align: center; border-bottom: 1px solid #374151;">
      <span style="font-size: 10px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: 0.3em; background: rgba(255,255,255,0.1); padding: 6px 12px; border-radius: 8px;">${siteName}</span>
      <h1 style="color: #ffffff; font-size: 28px; margin: 20px 0 0 0; font-weight: 800; tracking-tight;">Password Reset Request</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
        Hello${userName ? ` ${userName}` : ''},
      </p>
      <p style="font-size: 15px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
        We received a request to reset the password associated with your account. Click the button below to set a new password. This link is valid for 1 hour.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" style="background-color: ${brandPrimary}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block; box-shadow: 0 10px 20px ${brandPrimary}33;">Reset Password</a>
      </div>

      <p style="font-size: 11px; color: #6b7280; line-height: 1.5; text-align: center; margin: 0;">
        If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
    <div style="background: #0b0f19; padding: 24px; text-align: center; border-top: 1px solid #1f2937;">
      <p style="margin: 0; font-size: 10px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em;">© 2026 ${siteName} Secure Portal</p>
    </div>
  </div>
</div>
`;


/**
 * Master exporter for template selection
 */
const renderEmailTemplate = (category, themeNum, data) => {
  const num = String(themeNum || '1');
  if (category === 'forgot_password') {
    return forgotPasswordTheme(data);
  }
  if (category === 'register') {
    if (num === '2') return registerTheme2(data);
    if (num === '3') return registerTheme3(data);
    return registerTheme1(data);
  }
  if (category === 'order') {
    if (num === '2') return orderTheme2(data);
    if (num === '3') return orderTheme3(data);
    return orderTheme1(data);
  }
  if (category === 'admin_order') {
    if (num === '2') return adminOrderTheme2(data);
    if (num === '3') return adminOrderTheme3(data);
    return adminOrderTheme1(data);
  }
  return '';
};

module.exports = { renderEmailTemplate };
