const express = require("express");
const mongoose = require("mongoose");
const path = require("node:path");

const router = express.Router();

const { User, isLoggedIn } = require(path.join("..", "..", "models", "user"));
const Todo = require(path.join("..", "..", "models", "todo"));

router.get("/", isLoggedIn, async (req, res) => {
    try {
        const todos = await Todo.aggregate([
            { $sort: { updatedAt: -1 } },
            {
                $match: {
                    user: mongoose.Types.ObjectId.createFromHexString(
                        req.user.id
                    ),
                },
            },
        ]).exec();

        res.json({ todos })
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

router.get("/:id", isLoggedIn, async (req, res) => {
    try {
        const todo = await Todo.findById({ _id: req.params.id })
            .where({ user: req.user.id });

        if (todo) {
            res.json({ todo });
        } else {
            res.json({ message: "Failed to find item" });
        }
    } catch (err) {
        res.json({ message: err.message });
    }
});

router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        await Todo.findOneAndUpdate(
            { _id: req.params.id },
            {
                title: req.body.title,
                body: req.body.body,
                updatedAt: Date.now(),
            },
            {
                runValidators: true,
            }
        ).where({ user: req.user.id });
        res.json({ message: "Item updated successfully" });
    } catch (err) {
        if (err.name === "ValidationError") {
            res.json({ message: err.message });
        } else {
            console.error(err);
            res.json({ message: err.message });
        }
    }
});

router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        await Todo.deleteOne({ _id: req.params.id }).where({
            user: req.user.id,
        });
        res.json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

router.post("/", isLoggedIn, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Todo.create(req.body);
        res.json({ message: "Item added successfully" });
    } catch (err) {
        if (err.name === "ValidationError") {
            res.json({ message: err.message });
        } else {
            console.error(err);
            res.json({ message: err.message });
        }
    }
});

router.post("/search", isLoggedIn, async (req, res) => {
    try {
        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
        const results = await Todo.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
                { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
            ],
        }).where({ user: req.user.id });
        res.json({ results });
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;
