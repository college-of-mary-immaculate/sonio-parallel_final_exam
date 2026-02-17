const mysql = require("mysql2/promise");

let masterPool;

function getMasterPool() {
    if (!masterPool) {
        masterPool = mysql.createPool({
            host: process.env.DB_MASTER_HOST || "mysql_master",
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10
        });
    }
    return masterPool;
}

module.exports = getMasterPool;
