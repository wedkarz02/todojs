const express = require("express");
const path = require("node:path");

const router = express.Router();

router.get("/", (req, res) => {
    if (req.user) {
        res.redirect("/dashboard");
    } else {
        res.status(200).render(path.join("pages", "home"));
    }
});

router.get("/about", (_req, res) => {
    res.status(200).render(path.join("pages", "about"));
});

module.exports = router;
