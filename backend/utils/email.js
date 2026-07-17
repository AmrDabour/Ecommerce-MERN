const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || 'placeholder',
      pass: process.env.EMAIL_PASS || 'placeholder',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Luxe Store <support@luxestore.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
