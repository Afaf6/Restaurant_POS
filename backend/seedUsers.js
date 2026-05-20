const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const Auth = require('./models/Auth');

const users = [
    { userName: 'Owner',       email: 'owner@freshbite.com',      password: 'owner123',      role: 'Super Admin'  },
    { userName: 'Team Leader', email: 'leader@freshbite.com',     password: 'leader123',     role: 'Team Leader'  },
    { userName: 'Cashier',     email: 'cashier@freshbite.com',    password: 'cashier123',    role: 'Cashier'      },
];

async function seed() {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to DB');

        for (const u of users) {
            const exists = await Auth.findOne({ email: u.email });
            if (exists) {
                console.log(`Already exists: ${u.email}`);
                continue;
            }
            const hashed = await bcrypt.hash(u.password, 10);
            await Auth.create({ ...u, password: hashed });
            console.log(`Created: ${u.role} — ${u.email}`);
        }

        console.log('\nSeed complete.');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
