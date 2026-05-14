import { Link, Outlet } from "react-router-dom";

export default function MainLayout() {
    return(
        <div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/login">Login</Link>
            </nav>
            <hr />
            <Outlet/>
        </div>
    )
}