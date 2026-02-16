require("dotenv").config();
const db = require("./db");
const initModels = require("./models/modelIndex");
const initSeeds = require("./seeds/seedIndex");

(async () => {
    try {
        console.log("Initializing database...");

        await initModels(db);
        await initSeeds(db);

        console.log("Database ready.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
