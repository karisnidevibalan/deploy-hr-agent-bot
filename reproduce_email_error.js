
const nodemailer = require('nodemailer');
const dns = require('dns');
require('dotenv').config({ path: '.env.local' });

// Force IPv4
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

async function testEmail() {
    console.log('Testing email connection (Port 465, Secure: true)...');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465, // Try SMTPS port
        secure: true, // Application specific password requires secure true on 465 usually
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        const info = await transporter.verify();
        console.log('✅ Connection verified successfully!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testEmail();
