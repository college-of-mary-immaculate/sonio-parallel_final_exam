class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);

            res.cookie('token', result.token, {
                httpOnly: true,
                secure: false,       // ← never require HTTPS — works on HTTP localhost
                sameSite: 'lax',     // ← lax works cross-origin (nginx:8080 → backend:3000)
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            });

            res.json({
            accessToken: result.token,
            tokenType: "Bearer",
            user: {
                id: result.user.userId,
                role: result.user.role
            }
        });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };

    me = async (req, res) => {
        try {
            res.json({ user: req.user });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    };

    logout = async (req, res) => {
        res.clearCookie('token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        });
        res.json({ message: 'Logged out' });
    };
}

module.exports = AuthController;