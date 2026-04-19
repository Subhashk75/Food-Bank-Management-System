const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "kumawatsubhash388@gmail.com",
    pass: "utdl hrcn ojwx wjhs", // Consider using environment variables
  },
});

// Email sending function
const sendMail = async (email, verificationCode) => {
  try {
    const info = await transporter.sendMail({
      from: '"Food Bank System" <kumawatsubhash388@gmail.com>',
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${verificationCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Food Bank System Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${verificationCode}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p style="font-size: 12px; color: #7f8c8d;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Message sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = sendMail;