class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);

            // Set httpOnly cookie instead of exposing token in response body
            res.cookie('token', result.token, {
                httpOnly: true,                               // JS cannot read this — XSS safe
                secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
                sameSite: 'strict',                           // CSRF protection
                maxAge: 1000 * 60 * 60 * 24 * 7,             // 7 days
            });

            // Still return user info (just not the token)
            res.json({ user: result.user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };

    // New: verify cookie and return user — used by AuthContext on mount
    me = async (req, res) => {
        try {
            // req.user is already set by authMiddleware
            res.json({ user: req.user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };

    logout = async (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        res.json({ message: 'Logged out' });
    };
}

module.exports = AuthController;