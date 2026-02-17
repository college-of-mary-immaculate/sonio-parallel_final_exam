const mysql = require("mysql2/promise");

const slaveHosts = [
    process.env.DB_SLAVE1_HOST || "mysql_slave1",
    process.env.DB_SLAVE2_HOST || "mysql_slave2"
];

let slavePools = [];

function initSlavePools() {
    if (slavePools.length === 0) {
        slavePools = slaveHosts.map(host =>
            mysql.createPool({
                host,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10
            })
        );
    }
}

function getSlavePool() {
    initSlavePools();
    // 🎯 simple round-robin
    const pool = slavePools.shift();
    slavePools.push(pool);
    return pool;
}

module.exports = {
    getSlavePool
};
