import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import './css/Global.css';

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
