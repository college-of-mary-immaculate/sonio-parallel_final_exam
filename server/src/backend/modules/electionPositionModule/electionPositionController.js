class ElectionPositionController {

  constructor(service) {
    this.service = service;
  }

  async add(req, res) {
    try {
      const { electionId, positionId } = req.params;

      const result = await this.service.addPositionToElection(
        electionId,
        positionId
      );

      res.json(result);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async remove(req, res) {
    try {
      const { electionId, positionId } = req.params;

      const result = await this.service.removePositionFromElection(
        electionId,
        positionId
      );

      res.json(result);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getByElection(req, res) {
    try {
      const { electionId } = req.params;

      const result = await this.service.getPositionsForElection(electionId);

      res.json(result);

    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = ElectionPositionController;
