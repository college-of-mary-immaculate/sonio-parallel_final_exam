const express = require("express");
const cors = require("cors");

const buildContainer = require("./backend/di/container");

async function bootstrap() {
    const app = express();

    // =========================
    // CORE MIDDLEWARES
    // =========================
    app.use(cors());
    app.use(express.json());

    // =========================
    // BUILD DI CONTAINER
    // =========================
    const container = await buildContainer();

    // =========================
    // MODULE ROUTES
    // =========================
    app.use(
        "/api/votes",
        container.modules.vote.routes
    );

    // =========================
    // HEALTH CHECK
    // =========================
    app.get("/health", (req, res) => {
        res.json({ status: "OK" });
    });

    return app;
}

module.exports = bootstrap;
