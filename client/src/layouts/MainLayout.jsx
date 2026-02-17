import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; // import the navbar

export default function MainLayout() {
    return (
        <div className="main-layout">
            <Navbar /> {/* Always render navbar */}
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}
