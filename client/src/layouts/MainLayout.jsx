import { Outlet } from "react-router-dom";

export default function MainLayout() {
    return (
        <div>
            <h1>Voting System</h1>
            <hr />
            <Outlet />
        </div>
    );
}
