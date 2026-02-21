const nodemailer = require("nodemailer");
const config = require("../config/config");

/**
 * Create a nodemailer transporter
 * Uses Ethereal (fake SMTP) for dev/testing
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

/**
 * Send an event registration confirmation email
 * Uses async/await and Promises
 */
const sendRegistrationEmail = async (userEmail, userName, eventTitle) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: '"Event Management Platform" <noreply@eventplatform.com>',
      to: userEmail,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <h2>Event Registration Confirmation</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>You have successfully registered for <strong>${eventTitle}</strong>.</p>
        <p>We look forward to seeing you at the event!</p>
        <br/>
        <p>Best regards,</p>
        <p>Virtual Event Management Platform</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${userEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error.message);
    // Don't throw — email failure should not block registration
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendRegistrationEmail,
};
