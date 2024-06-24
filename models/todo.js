const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        maxLength: [32, "Title cannot be longer than 32 characters."],
    },
    body: {
        type: String,
        required: true,
        maxLength: [512, "Body cannot be longer than 512 characters."],
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
