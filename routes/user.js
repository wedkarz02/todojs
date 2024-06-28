const express = require("express");
const mongoose = require("mongoose");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const router = express.Router();

const { User, isLoggedIn } = require(path.join("..", "models", "user"));

router.get("/", isLoggedIn, (req, res) => {
    res.status(200).json(req.user);
});

router.delete("/", isLoggedIn, async (req, res) => {
    try {
        await User.findOneAndDelete({ username: req.user.username });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
})

router.put("/", isLoggedIn, async (req, res) => {
    try {
        if (!req.body.username || !req.body.password) {
            throw new Error("Username or password missing.");
        }
        if (req.body.password.length < 8) {
            const error = new mongoose.Error.ValidationError(null);
            error.errors.password = new mongoose.Error.ValidatorError({ 
                message: "Password must be at least 8 characters long.",
                path: "password",
                value: req.body.password
            });
            throw error;
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newBody = {
            username: req.body.username,
            password: hashedPassword
        };
        await User.findOneAndUpdate({ username: req.user.username }, newBody);
        res.status(200).json({ message: "Updated successfully" });
    } catch (err) {
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map(error => error.message)[0];
            res.status(400).json({ message: msg });
        } else {
            if (err.code === 11000) {
                res.status(400).json({ message: "Username already exists" });
            } else {
                console.error(err);
                res.status(500).json({ message: err.message });
            }
        }
    }
});

module.exports = router;
