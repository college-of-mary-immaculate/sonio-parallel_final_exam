const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // ── DEBUG ──────────────────────────────────────────────────────────
        console.log('[authMiddleware] path:', req.path)
        console.log('[authMiddleware] req.cookies:', req.cookies)
        console.log('[authMiddleware] cookie header raw:', req.headers.cookie)
        console.log('[authMiddleware] authorization:', req.headers.authorization)
        // ──────────────────────────────────────────────────────────────────

        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            console.log('[authMiddleware] ❌ no token found anywhere')
            return res.status(401).json({ message: "No token provided." });
        }

        console.log('[authMiddleware] ✅ token found, verifying...')
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        console.log('[authMiddleware] ✅ user verified:', req.user)
        next();
    } catch (error) {
        console.log('[authMiddleware] ❌ error:', error.message)
        return res.status(401).json({ message: "Unauthorized: " + error.message });
    }
};

module.exports = authMiddleware;