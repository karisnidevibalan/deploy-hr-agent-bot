
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testEmail() {
    console.log('Testing email connection (IPv4 forced via family: 4)...');

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // @ts-ignore
        family: 4 // Force IPv4 specifically for this connection
    });

    try {
        const info = await transporter.verify();
        console.log('✅ Connection verified successfully!');
    } catch (error: any) {
        console.error('❌ Connection failed:', error.message);
    }
}

testEmail();
