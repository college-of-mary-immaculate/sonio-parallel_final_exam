const ElectionRepository = require("./electionRepository");
const ElectionService = require("./electionService");
const ElectionController = require("./electionController");
const electionRoutes = require("./electionRoutes");

module.exports = (db, middlewares) => {

    const service = new ElectionService(db);

    const routes = require("./electionRoutes")(service, middlewares);

    return {
        service,
        routes
    };
};

