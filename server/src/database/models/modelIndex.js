const userModel = require("./userModel");
const otpModel = require("./otpModel");
const electionModel = require("./electionModel");
const positionModel = require("./positionModel");
const candidateModel = require("./candidateModel");
const electionPositionModel = require("./electionPositionModel");
const electionCandidateModel = require("./electionCandidateModel");
const voteModel = require("./voteModel");
const voterSubmissionModel = require("./voterSubmissionModel");
const electionResultModel = require("./electionResultModel");

module.exports = async (db) => {
    await userModel(db);
    await otpModel(db);
    await electionModel(db);
    await positionModel(db);
    await candidateModel(db);
    await electionPositionModel(db);
    await electionCandidateModel(db);
    await voteModel(db);
    await voterSubmissionModel(db);
    await electionResultModel(db);
};
