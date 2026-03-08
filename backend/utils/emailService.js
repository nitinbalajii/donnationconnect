const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send email
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `DonationConnect <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Email templates
const emailTemplates = {
    // Welcome email
    welcome: (name) => ({
        subject: 'Welcome to DonationConnect!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Welcome to DonationConnect!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining DonationConnect. Together, we can make a difference in our community!</p>
        <p>Get started by:</p>
        <ul>
          <li>Creating your first donation</li>
          <li>Browsing shelter homes in need</li>
          <li>Becoming a volunteer</li>
        </ul>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Donation accepted
    donationAccepted: (donorName, donationTitle, shelterName) => ({
        subject: 'Your Donation Has Been Accepted!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Donation Accepted!</h1>
        <p>Hi ${donorName},</p>
        <p>Great news! Your donation "<strong>${donationTitle}</strong>" has been accepted by <strong>${shelterName}</strong>.</p>
        <p>A volunteer will be assigned soon to pick up your donation.</p>
        <p>Thank you for making a difference!</p>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Task assigned to volunteer
    taskAssigned: (volunteerName, donationTitle, pickupAddress) => ({
        subject: 'New Delivery Task Assigned',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">New Task Assigned!</h1>
        <p>Hi ${volunteerName},</p>
        <p>You have been assigned a new delivery task:</p>
        <p><strong>Donation:</strong> ${donationTitle}</p>
        <p><strong>Pickup Location:</strong> ${pickupAddress}</p>
        <p>Please log in to your dashboard to view full details and accept the task.</p>
        <p>Thank you for your service!</p>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Donation delivered
    donationDelivered: (donorName, donationTitle, shelterName) => ({
        subject: 'Your Donation Has Been Delivered!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Donation Delivered!</h1>
        <p>Hi ${donorName},</p>
        <p>Your donation "<strong>${donationTitle}</strong>" has been successfully delivered to <strong>${shelterName}</strong>.</p>
        <p>Thank you for your generosity and for making a positive impact in our community!</p>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Shelter verification approved
    shelterVerified: (shelterName) => ({
        subject: 'Your Shelter Has Been Verified!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Shelter Verified!</h1>
        <p>Hi ${shelterName},</p>
        <p>Congratulations! Your shelter has been verified and is now live on DonationConnect.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse and accept donations</li>
          <li>Update your current needs</li>
          <li>Connect with donors and volunteers</li>
        </ul>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Volunteer verification approved
    volunteerVerified: (volunteerName) => ({
        subject: 'You Are Now a Verified Volunteer!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #10B981;">Verified Volunteer!</h1>
        <p>Hi ${volunteerName},</p>
        <p>Congratulations! You are now a verified volunteer on DonationConnect.</p>
        <p>You can now accept delivery tasks and start making a difference in your community!</p>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    }),

    // Password reset
    passwordReset: (name, resetLink) => ({
        subject: 'Password Reset Request',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4F46E5;">Password Reset</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The DonationConnect Team</p>
      </div>
    `
    })
};

// Send specific email types
const sendWelcomeEmail = async (email, name) => {
    const template = emailTemplates.welcome(name);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendDonationAcceptedEmail = async (email, donorName, donationTitle, shelterName) => {
    const template = emailTemplates.donationAccepted(donorName, donationTitle, shelterName);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendTaskAssignedEmail = async (email, volunteerName, donationTitle, pickupAddress) => {
    const template = emailTemplates.taskAssigned(volunteerName, donationTitle, pickupAddress);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendDonationDeliveredEmail = async (email, donorName, donationTitle, shelterName) => {
    const template = emailTemplates.donationDelivered(donorName, donationTitle, shelterName);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendShelterVerifiedEmail = async (email, shelterName) => {
    const template = emailTemplates.shelterVerified(shelterName);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendVolunteerVerifiedEmail = async (email, volunteerName) => {
    const template = emailTemplates.volunteerVerified(volunteerName);
    return await sendEmail({
        to: email,
        ...template
    });
};

const sendPasswordResetEmail = async (email, name, resetLink) => {
    const template = emailTemplates.passwordReset(name, resetLink);
    return await sendEmail({
        to: email,
        ...template
    });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendDonationAcceptedEmail,
    sendTaskAssignedEmail,
    sendDonationDeliveredEmail,
    sendShelterVerifiedEmail,
    sendVolunteerVerifiedEmail,
    sendPasswordResetEmail
};
