class CandidateController {
  constructor(service) {
    this.service = service;
  }

  // =========================
  // GET ALL
  // =========================
  async getAllCandidates(req, res) {
    try {
      const candidates = await this.service.getAllCandidates();
      res.json(candidates);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // =========================
  // GET ONE
  // =========================
  async getCandidateById(req, res) {
    try {
      const { candidateId } = req.params;
      const candidate = await this.service.getCandidateById(candidateId);
      res.json(candidate);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  // =========================
  // CREATE
  // =========================
  async createCandidate(req, res) {
    try {
      const candidate = await this.service.createCandidate(req.body);
      res.json(candidate);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // =========================
  // UPDATE
  // =========================
  async updateCandidate(req, res) {
    try {
      const { candidateId } = req.params;
      const updated = await this.service.updateCandidate(
        candidateId,
        req.body
      );

      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // =========================
  // DELETE
  // =========================
  async deleteCandidate(req, res) {
    try {
      const { candidateId } = req.params;
      const result = await this.service.deleteCandidate(candidateId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = CandidateController;
