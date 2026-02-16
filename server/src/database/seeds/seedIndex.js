// database/seeds/seedIndex.js

const userSeed = require("./userSeed");
const positionSeed = require("./positionSeed");
const candidateSeed = require("./candidateSeed");

module.exports = async (db) => {
    await userSeed(db);
    await positionSeed(db);
    await candidateSeed(db);
};
