// database/seeds/seedIndex.js

const userSeed = require("./userSeed");
const positionSeed = require("./positionSeed");
const candidateSeed = require("./candidateSeed");
const electionSeed = require("./electionSeed"); // ✅ added

module.exports = async (db) => {
    await userSeed(db);
    await positionSeed(db);
    await candidateSeed(db);
    await electionSeed(db); 
};
