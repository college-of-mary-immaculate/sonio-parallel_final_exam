class ElectionTrackingController {
  constructor(service) {
    this.service = service;
  }

  // GET /api/elections/:electionId/tracking/live
  // Full live results: positions → candidates ranked by vote count
  async getLiveResults(req, res) {
    try {
      const { electionId } = req.params;
      const results = await this.service.getLiveResults(electionId);
      res.json(results);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/elections/:electionId/tracking/summary
  // Lightweight: just total votes per position + submission count
  async getVoteSummary(req, res) {
    try {
      const { electionId } = req.params;
      const summary = await this.service.getVoteSummary(electionId);
      res.json(summary);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getFinalResults(req, res) {
    try {
      const { electionId } = req.params;
      const results = await this.service.getFinalResults(electionId);
      res.json(results);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = ElectionTrackingController;