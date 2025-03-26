require('dotenv').config()
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD // Use environment variable for email password
    }
});

exports.sendEmail = (user) => {
    const mailOptions = {
        from: process.env.EMAIL, // Replace with your email
        to: user?.email,
        subject: 'Welcome to Our Platform',
        text: `Hi ${user?.firstName},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Teams Web Team`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}; 
