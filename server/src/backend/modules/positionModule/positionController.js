class PositionController {
  constructor(service) {
    this.service = service;
  }

  async getAll(req, res) {
    try {
      const positions = await this.service.getAllPositions();
      res.json(positions);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getById(req, res) {
    try {
      const { positionId } = req.params;
      const position = await this.service.getPositionById(positionId);
      res.json(position);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const position = await this.service.createPosition(req.body);
      res.json(position);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { positionId } = req.params;
      const position = await this.service.updatePosition(positionId, req.body);
      res.json(position);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const { positionId } = req.params;
      const result = await this.service.deletePosition(positionId);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }


}

module.exports = PositionController;
