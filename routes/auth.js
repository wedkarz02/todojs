const express = require("express");
const mongoose = require("mongoose");
const path = require("node:path");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const router = express.Router();

const User = require(path.join("..", "models", "user")).User;

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return done(null, false, { message: "Username not found" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false, { message: "Password incorrect" });
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true
}));

router.post("/register", async (req, res) => {
    try {
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
        await User.create({
            username: req.body.username,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch (err) {
        if (err.name === "ValidationError") {
            const msg = Object.values(err.errors).map(error => error.message)[0];
            res.status(400).render(path.join("pages", "register"), { message: msg });
        } else {
            if (err.code === 11000) {
                res.status(400).render(
                    path.join("pages", "register"),
                    { message: "Username already exists." }
                );
            } else {
                console.error(err);
                res.status(500).render(path.join("pages", "error"), { error: err });
            }
        }
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).render(path.join("pages", "error"), {
                error: "Failed to log out",
            });
        } else {
            res.redirect("/");
        }
    });
});

module.exports = router;
