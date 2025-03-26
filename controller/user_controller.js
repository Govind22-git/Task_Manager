// const Signup = require('../model/user');
const Signup = require('../model/user');
// Remove duplicate import
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import JWT
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const { sendEmail } = require('../config/config');
// const jwt = require('jsonwebtoken'); 

// Import JWT
// const jwt = require('jsonwebtoken');
exports.getUser = async (req, res) => {
    try {
        const data = await Signup.find();
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if email already exists
        const existingUser = await Signup.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new Signup({
            firstName,
            lastName,
            phone,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword
        });

        const data = await newUser.save();

        // Send a welcome email
        sendEmail({email, firstName});

        return res.status(201).json({ message: 'User created successfully', user: data });

    } catch (error) {
        console.error('Error creating user:', error);

        // Handle specific errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }

        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if all required fields are present
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Check if email exists
        const user = await Signup.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            'your_secret_key', // Replace with your secret key
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const id = req.body.id;
    const { firstName, lastName, email, phone, promocode } = req.body;

    // Check if ID is provided
    // if (!id) {
    //     return res.status(400).json({ message: 'User ID is required' });
    // }

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Find and update the user
        const updatedUser = await Signup.findByIdAndUpdate(
            id,
            { firstName, lastName, email, phone, promocode },
            { new: true, runValidators: true } // Return the new user after update
        );

        // Check if user exists
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);

        // Handle specific errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', error: error.message });
        }

        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.UpdatePassword = async (req, res) => {
    const { id, oldPassword, newPassword, confirmPassword } = req.body;

    // Check if all required fields are provided
    if (!id || !oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    try {
        // Find the user by ID
        const user = await Signup.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate the old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedNewPassword;
        await user.save();
        console.log(user);


        return res.status(200).json({
            message: 'Password updated successfully',
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
exports.emailverification = async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
    }
    console.log(email, "email");


    try {
        // Check if email exists
        const user = await Signup.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a random token
        const token = Math.random().toString(36).substr(2);

        // Update the user's token
        user.token = token;
        user.tokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send an email with the token
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'upendersingh992004@gmail.com', // Replace with your email
                pass: 'onuq aunn wgkw lluv'
            }
        });

        const mailOptions = {
            from: 'upendersingh992004@gmail.com', // Replace with your email
            to: email,
            subject: '🌟 Email Verification - Welcome to Our Platform! 🌟',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #4CAF50; text-align: center;">Welcome to Our Platform, ${user.firstName}!</h2>
                <p>Thank you for signing up. To complete your registration, please verify your email address by using the token below:</p>
                <div style="text-align: center; margin: 20px 0;">
                <span style="display: inline-block; font-size: 18px; font-weight: bold; color: #4CAF50; background-color: #e8f5e9; padding: 10px 20px; border-radius: 5px; border: 1px solid #4CAF50;">${token}</span>
                </div>
                <p>If you did not sign up for this account, please ignore this email.</p>
                <p style="text-align: center; font-size: 14px; color: #777;">This token will expire in 1 hour.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="text-align: center; font-size: 12px; color: #aaa;">If you have any questions, feel free to contact our support team.</p>
                <p style="text-align: center; font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Our Web Fintech Team</p>
            </div>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending verification email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Verification email sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error during email verification:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.WelcomeMsg = async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
    }

    try {
        // Check if email exists
        const user = await Signup.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send a welcome email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'upendersingh992004@gmail.com', // Replace with your email
                pass: 'onuq aunn wgkw lluv'
            }
        });
        const mailOptions = {
            from: 'upendersingh992004@gmail.com', // Replace with your email
            to: email,
            subject: '🎉 Welcome to Web Fintech! 🎉',
            html: `
            <div style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); position: relative; overflow: hidden;">
            <div style="position: absolute; top: -50px; left: -50px; width: 150px; height: 150px; background-color: #4CAF50; border-radius: 50%; animation: rotate 6s linear infinite;"></div>
            <div style="position: absolute; bottom: -50px; right: -50px; width: 150px; height: 150px; background-color: #4CAF50; border-radius: 50%; animation: rotate 6s linear infinite reverse;"></div>
            <div style="text-align: center; padding: 10px 0;">
                <img src="https://webfintech.in/assets/img/logo.png" alt="Web Fintech Logo" style="width: 100px; border-radius: 50%; animation: bounce 2s infinite;">
            </div>
            <h2 style="color: #4CAF50; text-align: center; font-size: 24px; animation: fadeIn 2s;">Welcome to Web Fintech, ${user.firstName}!</h2>
            <p style="font-size: 16px; text-align: center; animation: fadeIn 2s 0.5s;">We're thrilled to have you join our community. At Web Fintech, we strive to provide you with the best financial solutions and services.</p>
            <div style="text-align: center; margin: 20px 0; animation: fadeIn 2s 1s;">
                <span style="display: inline-block; font-size: 18px; font-weight: bold; color: #ffffff; background-color: #4CAF50; padding: 10px 20px; border-radius: 5px; border: 1px solid #4CAF50; animation: pulse 1.5s infinite;">🌟 You're now part of something amazing! 🌟</span>
            </div>
            <p style="font-size: 16px; text-align: center; animation: fadeIn 2s 1.5s;">If you have any questions or need assistance, feel free to reach out to our support team. We're here to help!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0; animation: fadeIn 2s 2s;">
            <p style="text-align: center; font-size: 14px; color: #777; animation: fadeIn 2s 2.5s;">Thank you for choosing Web Fintech. Let's achieve greatness together!</p>
            <p style="text-align: center; font-size: 12px; color: #aaa; animation: fadeIn 2s 3s;">&copy; ${new Date().getFullYear()} Web Fintech Team</p>
            </div>
            <style>
            @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
            60% {
                transform: translateY(-5px);
            }
            }
            @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
            }
            }
            @keyframes fadeIn {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
            }
            @keyframes rotate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
            }
            </style>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Error sending verification email' });
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({ message: 'Verification email sent successfully' });
            }
        });
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
