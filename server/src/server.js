require("dotenv").config();

const http      = require("http");
const express   = require("express");
const bootstrap = require("./bootstrap");

async function startServer() {
    try {
        const app        = express();
        const httpServer = http.createServer(app); // ← pass app here

        await bootstrap(httpServer, app); // ← pass app too

        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();