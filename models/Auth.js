const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
    userName: {
        type: String,
        required : true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ["Admin", "Cashier"],
        default: "Cashier"
    }
})

module.exports = mongoose.model("Auth", AuthSchema);

