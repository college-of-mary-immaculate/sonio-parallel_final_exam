import { Outlet } from "react-router-dom";
import "../css/MainLayout.css"; // your layout CSS

/**
 * MainLayout can optionally accept a Navbar component
 * @param {React.Component} Navbar - optional navbar component
 */
export default function MainLayout({ Navbar }) {
    return (
        <div className="main-layout">
            {Navbar && <Navbar />} {/* Render navbar only if provided */}
            <div className={`content ${Navbar ? "with-navbar" : ""}`}>
                <Outlet />
            </div>
        </div>
    );
}
