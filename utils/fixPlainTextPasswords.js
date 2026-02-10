import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

/**
 * Migration script to fix plain-text passwords in the database
 * 
 * This script:
 * 1. Connects to the database
 * 2. Finds all users
 * 3. Identifies passwords that are not properly hashed (plain text)
 * 4. Re-hashes these passwords using bcrypt
 * 5. Updates the database
 */

const fixPlainTextPasswords = async () => {
    try {
        // Connect to MongoDB
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to database\n');

        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users in database\n`);

        let fixedCount = 0;
        let alreadyHashedCount = 0;

        for (const user of users) {
            // Check if password is already hashed
            // Bcrypt hashes always start with $2a$, $2b$, or $2y$ and are 60 characters long
            const isHashed = /^\$2[aby]\$\d{2}\$.{53}$/.test(user.password);

            if (isHashed) {
                console.log(`✓ User ${user.name} (${user.phone}) - Password already hashed`);
                alreadyHashedCount++;
            } else {
                console.log(`⚠ User ${user.name} (${user.phone}) - Plain text password detected!`);
                
                // Store the plain text password
                const plainPassword = user.password;
                
                // Hash the password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(plainPassword, salt);
                
                // Update using $set to bypass pre-save middleware (avoid double hashing)
                await User.findByIdAndUpdate(user._id, { 
                    $set: { password: hashedPassword } 
                });
                
                console.log(`  ✓ Fixed! Password has been hashed`);
                fixedCount++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('Migration Complete!');
        console.log('='.repeat(50));
        console.log(`Total users: ${users.length}`);
        console.log(`Already hashed: ${alreadyHashedCount}`);
        console.log(`Fixed (re-hashed): ${fixedCount}`);
        console.log('='.repeat(50) + '\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
};

// Run the migration
fixPlainTextPasswords();
