const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const CLIENT_EMAIL = 'olabiyijuliusakinwumi@gmail.com';
const COMPANY_NAME = 'Beacons Agro and Industrial Engineering Ltd';

/**
 * Send email notification when a new quote inquiry is submitted.
 */
const sendInquiryNotification = async (inquiry) => {
  const serviceMap = {
    'general-contracting': 'General Contracting',
    'general-merchandise': 'General Merchandise',
    fabrication: 'Fabrication',
    'agricultural-machines': 'Agricultural Machine Sales & Maintenance',
    'irrigation-systems': 'Irrigation Systems',
    'drying-heating-systems': 'Driers, Kilns, Furnaces, Ovens & Heating Systems',
  };

  const subject = `[New Quote Request] ${inquiry.name} — ${serviceMap[inquiry.serviceNeeded] || 'General'}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0F3D2E; padding: 20px 30px;">
        <h1 style="color: #C79A3D; margin: 0; font-size: 20px;">${COMPANY_NAME}</h1>
        <p style="color: #FAF8F2; margin: 4px 0 0; font-size: 14px;">New Quote Request Received</p>
      </div>
      <div style="padding: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38; width: 140px;">Name</td><td style="padding: 8px 0;">${inquiry.name}</td></tr>
          ${inquiry.companyName ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Company/Farm</td><td style="padding: 8px 0;">${inquiry.companyName}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Email</td><td style="padding: 8px 0;"><a href="mailto:${inquiry.email}">${inquiry.email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Phone</td><td style="padding: 8px 0;"><a href="tel:${inquiry.phone}">${inquiry.phone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Service</td><td style="padding: 8px 0;">${serviceMap[inquiry.serviceNeeded] || 'Not specified'}</td></tr>
          ${inquiry.location ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Location</td><td style="padding: 8px 0;">${inquiry.location}</td></tr>` : ''}
          ${inquiry.budgetRange ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Budget Range</td><td style="padding: 8px 0;">${inquiry.budgetRange}</td></tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #FAF8F2; border-left: 4px solid #C79A3D; border-radius: 4px;">
          <strong style="color: #3A3F38;">Project Description:</strong>
          <p style="margin: 8px 0 0; color: #3A3F38;">${inquiry.projectDescription}</p>
        </div>
        ${inquiry.referenceImageUrl ? `<p style="margin-top: 16px;"><strong>Reference Image:</strong> <a href="${inquiry.referenceImageUrl}">View Image</a></p>` : ''}
        <div style="margin-top: 24px; padding: 16px; background: #0F3D2E; border-radius: 6px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/admin/inquiries" style="color: #C79A3D; font-weight: bold; text-decoration: none;">View in Admin Dashboard →</a>
        </div>
      </div>
      <div style="padding: 16px 30px; background: #12140F; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">${COMPANY_NAME} · RC 9585582 · Akure, Ondo State</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
    to: CLIENT_EMAIL,
    subject,
    html,
  });
};

/**
 * Send email notification when a new contact message is submitted.
 */
const sendContactNotification = async (message) => {
  const subject = `[New Contact Message] ${message.name}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #0F3D2E; padding: 20px 30px;">
        <h1 style="color: #C79A3D; margin: 0; font-size: 20px;">${COMPANY_NAME}</h1>
        <p style="color: #FAF8F2; margin: 4px 0 0; font-size: 14px;">New Contact Message</p>
      </div>
      <div style="padding: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38; width: 80px;">Name</td><td style="padding: 8px 0;">${message.name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Email</td><td style="padding: 8px 0;"><a href="mailto:${message.email}">${message.email}</a></td></tr>
          ${message.phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #3A3F38;">Phone</td><td style="padding: 8px 0;"><a href="tel:${message.phone}">${message.phone}</a></td></tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #FAF8F2; border-left: 4px solid #C79A3D; border-radius: 4px;">
          <strong style="color: #3A3F38;">Message:</strong>
          <p style="margin: 8px 0 0; color: #3A3F38;">${message.message}</p>
        </div>
        <div style="margin-top: 24px; padding: 16px; background: #0F3D2E; border-radius: 6px; text-align: center;">
          <a href="${process.env.FRONTEND_URL}/admin/messages" style="color: #C79A3D; font-weight: bold; text-decoration: none;">View in Admin Dashboard →</a>
        </div>
      </div>
      <div style="padding: 16px 30px; background: #12140F; text-align: center;">
        <p style="color: #888; font-size: 12px; margin: 0;">${COMPANY_NAME} · RC 9585582 · Akure, Ondo State</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${COMPANY_NAME}" <${process.env.EMAIL_USER}>`,
    to: CLIENT_EMAIL,
    subject,
    html,
  });
};

module.exports = { sendInquiryNotification, sendContactNotification };
