const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Try cookie first (SSR requests, browser navigation)
        // 2. Fall back to Authorization header (API clients, mobile)
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({ message: "No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
};

module.exports = authMiddleware;