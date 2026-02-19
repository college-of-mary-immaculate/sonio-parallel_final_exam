require("dotenv").config();

const http      = require("http");
const bootstrap = require("./bootstrap");

async function startServer() {
    try {
        // Create bare http.Server first — Socket.IO needs this reference
        const httpServer = http.createServer();

        await bootstrap(httpServer);

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