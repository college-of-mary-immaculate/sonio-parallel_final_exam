const express = require("express");
const cors = require("cors");

const buildContainer = require("./backend/di/container");

async function bootstrap() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    const container = await buildContainer();

    app.use(
        "/api/votes",
        container.modules.vote.routes
    );

    app.use(
        "/api/users",
        container.modules.users.routes
    );


    app.get("/health", (req, res) => {
        res.json({ status: "OK" });
    });

    app.get("/check", (req, res) => {
        res.json({ instance: process.env.HOSTNAME });
    });


    return app;
}

module.exports = bootstrap;
