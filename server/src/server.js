require("dotenv").config();

const bootstrap = require("./bootstrap");

async function startServer() {
    try {
        const app = await bootstrap();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
