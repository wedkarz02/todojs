const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: [4, "Username must be at least 4 characters long."],
        maxLength: [32, "Username cannot be longer than 32 characters"]
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
