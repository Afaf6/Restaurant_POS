const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Auth = require('./models/Auth');

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.DB_URL);
        
        const existingAdmin = await Auth.findOne({ email: 'admin@freshbite.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await Auth.create({
            userName: 'Admin User',
            email: 'admin@freshbite.com',
            password: hashedPassword,
            role: 'Admin'
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@freshbite.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
