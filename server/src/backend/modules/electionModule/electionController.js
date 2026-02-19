class ElectionController {
  constructor(service) {
    this.service = service;
  }

  async addCandidate(req, res) {
    try {
      const { electionId } = req.params;
      const { positionId, candidateData } = req.body;
      const candidate = await this.service.addCandidate(electionId, positionId, candidateData);
      res.json(candidate);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async removeCandidate(req, res) {
    try {
      const { electionId, positionId, candidateId } = req.params;
      await this.service.removeCandidate(electionId, positionId, candidateId);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getConfig(req, res) {
    try {
      const { electionId } = req.params;
      const config = await this.service.getElectionConfig(electionId);
      res.json(config);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async listElections(req, res) {
    try {
      const elections = await this.service.listElections();
      res.json(elections);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async createElection(req, res) {
    try {
      const election = await this.service.createElection(req.body);
      res.status(201).json(election);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateElection(req, res) {
    try {
      const { electionId } = req.params;
      const updatedData = req.body;
      const election = await this.service.updateElection(electionId, updatedData);
      res.json(election);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


  async deleteElection(req, res) {
    try {
      const { electionId } = req.params;
      await this.service.deleteElection(electionId);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


}

module.exports = ElectionController;
