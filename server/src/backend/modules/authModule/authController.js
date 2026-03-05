class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    login = async (req, res) => {
        try {
            const result = await this.authService.login(req.body);

            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                // 'strict' blocks the cookie when origin differs (localhost:8080 → localhost:3000)
                // 'lax' works for cross-origin in dev while still protecting against CSRF
                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            });

            res.json({ user: result.user });
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
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        });
        res.json({ message: 'Logged out' });
    };
}

module.exports = AuthController;