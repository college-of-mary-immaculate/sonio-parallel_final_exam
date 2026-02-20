const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing." });
        }

        const tokenParts = authHeader.split(" ");

        if (tokenParts[0] !== "Bearer" || !tokenParts[1]) {
            return res.status(401).json({ message: "Invalid authorization format." });
        }

        const token = tokenParts[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
};

module.exports = authMiddleware;