require("dotenv").config();
const mysql = require("mysql2/promise");
const initModels = require("./models/modelIndex");
const initSeeds = require("./seeds/seedIndex");

(async () => {
    let connection;
    try {
        console.log("Initializing database...");

        // First, connect without specifying a database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });

        // Explicitly create the database (this will be logged to binlog)
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log(`Database '${process.env.DB_NAME}' created or already exists.`);
        
        // Switch to the database
        await connection.query(`USE ${process.env.DB_NAME}`);
        
        await connection.end();

        // Now use the regular pool that connects to the database
        const getPool = require("./db.bootstrap");
        const db = getPool();
        await initModels(db);
        await initSeeds(db);

        console.log("Database ready.");
        process.exit();
    } catch (err) {
        console.error(err);
        if (connection) await connection.end();
        process.exit(1);
    }
})();