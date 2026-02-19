class ElectionCandidateController {
  constructor(service) {
    this.service = service;
  }

  // GET /api/elections/:electionId/candidates
  async getByElection(req, res) {
    try {
      const { electionId } = req.params;
      const result = await this.service.getCandidatesForElection(electionId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/elections/:electionId/candidates/positions/:positionId
  async getByPosition(req, res) {
    try {
      const { electionId, positionId } = req.params;
      const result = await this.service.getCandidatesForPosition(electionId, positionId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /api/elections/:electionId/candidates
  // body: { positionId, candidateId }
  async add(req, res) {
    try {
      const { electionId } = req.params;
      const { positionId, candidateId } = req.body;

      if (!positionId || !candidateId) {
        return res.status(400).json({ error: "positionId and candidateId are required" });
      }

      const result = await this.service.addCandidate(electionId, positionId, candidateId);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // DELETE /api/elections/:electionId/candidates/:candidateId/positions/:positionId
  async remove(req, res) {
    try {
      const { electionId, positionId, candidateId } = req.params;
      const result = await this.service.removeCandidate(electionId, positionId, candidateId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = ElectionCandidateController;