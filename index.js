require("dotenv").config();

const express = require("express");
const path = require("node:path");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const mongoStore = require("connect-mongo");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || "test";
const DB_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

mongoose
    .connect(DB_URI)
    .then(() => {
        console.log("[INFO]: Connected to mongodb.");
    })
    .catch((err) => {
        console.error(`[ERROR]: Mongoose connection error: ${err}`);
        process.exit(1);
    });

const SESSION_SECRET = process.env.SESSION_SECRET || "secret";

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 6000000 },
        store: mongoStore.create({
            mongoUrl: DB_URI,
        }),
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((_req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
});

const indexRouter = require(path.join(__dirname, "routes", "index"));
const authRouter = require(path.join(__dirname, "routes", "auth"));
const dashboardRouter = require(path.join(__dirname, "routes", "dashboard"));

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/dashboard", dashboardRouter);

app.use((_req, res, _next) => {
    res.status(404).render(path.join("pages", "404"));
});

const shutdown = async (status) => {
    if (mongoose.connection.readyState === 1) {
        console.log("\n[INFO]: Disconnecting from Mongodb...");
        await mongoose.disconnect();
    }

    console.log("[INFO]: Shutting down...");
    process.exit(status);
};

process.on("SIGINT", async (_signal) => {
    await shutdown(0);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[INFO]: Listening for requests on port ${PORT}`);
});
