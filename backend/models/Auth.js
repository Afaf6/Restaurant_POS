/**
 * AUTH MODEL
 * Defines the schema for user accounts (Admins and Cashiers).
 */

const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
    // Full name or display name of the user
    userName: {
        type: String,
        required : true,
        trim: true
    },
    // Unique email used for login
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Hashed password
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    // User role determines access permissions
    role: {
        type: String,
        enum: ["Super Admin", "Team Leader", "Cashier"],
        default: "Cashier"
    }
}, {
    // Automatically track creation and update times
    timestamps: true 
});

// Export the model
module.exports = mongoose.model("Auth", AuthSchema);
