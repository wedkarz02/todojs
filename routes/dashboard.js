const express = require("express");
const path = require("node:path");
const mongoose = require("mongoose");

const router = express.Router();

const Todo = require(path.join("..", "models", "todo"));

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.status(401).render(path.join("pages", "unauthorized"));
    }
};

router.get("/", isLoggedIn, async (req, res) => {
    let perPage = 8;
    let page = req.query.page || 1;

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
            {
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] },
                },
            },
        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Todo.countDocuments();

        res.status(200).render(path.join("pages", "dashboard", "index"), {
            username: req.user.username,
            todos,
            current: page,
            pages: Math.ceil(count / perPage),
        });
    } catch (err) {
        console.error(err);
        res.status(500).render(path.join("pages", "error"), { error: err });
    }
});

router.get("/item/:id", isLoggedIn, async (req, res) => {
    try {
        const todo = await Todo.findById({ _id: req.params.id })
            .where({ user: req.user.id });

        if (todo) {
            res.status(200).render(
                path.join("pages", "dashboard", "view-item"),
                {
                    todoId: req.params.id,
                    todo,
                }
            );
        } else {
            res.status(500).render(path.join("pages", "error"), {
                error: "Failed to find item",
            });
        }
    } catch (err) {
        res.status(500).render(path.join("pages", "error"), { error: err });
    }
});

router.put("/item/:id", isLoggedIn, async (req, res) => {
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
        res.redirect("/dashboard");
    } catch (err) {
        if (err.name === "ValidationError") {
            res.status(400).render(path.join("pages", "error"), {
                error: err.message,
            });
        } else {
            console.error(err);
            res.status(500).render(path.join("pages", "error"), { error: err });
        }
    }
});

router.delete("/item-delete/:id", isLoggedIn, async (req, res) => {
    try {
        await Todo.deleteOne({ _id: req.params.id }).where({
            user: req.user.id,
        });
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.status(500).render(path.join("pages", "error"), { error: err });
    }
});

router.get("/add", isLoggedIn, async (_req, res) => {
    res.status(200).render(path.join("pages", "dashboard", "add"));
});

router.post("/add", isLoggedIn, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Todo.create(req.body);
        res.redirect("/dashboard");
    } catch (err) {
        if (err.name === "ValidationError") {
            res.status(400).render(path.join("pages", "error"), {
                error: err.message,
            });
        } else {
            console.error(err);
            res.status(500).render(path.join("pages", "error"), { error: err });
        }
    }
});

router.get("/search", isLoggedIn, async (_req, res) => {
    res.status(200).render(path.join("pages", "dashboard", "search"), {
        results: "",
    });
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

        res.status(200).render(path.join("pages", "dashboard", "search"), {
            results,
        });
    } catch (err) {
        console.error(err);
        res.status(500).render(path.join("pages", "error"), { error: err });
    }
});

module.exports = router;
