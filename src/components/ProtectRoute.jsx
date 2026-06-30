import { Navigate } from "react-router-dom"
import { getRole, roleHome } from "../api/user.api"

export default function ProtectRoute({ children, role }) {
    const token = window.localStorage.getItem("token")

    if (!token || token === "undefined") {
        return <Navigate to="/" />
    }

    const currentRole = getRole(token)

    // Sahifa muayyan rol uchun bo'lsa va rol mos kelmasa, to'g'ri panelga yo'naltiramiz
    if (role && currentRole !== role) {
        return <Navigate to={roleHome(currentRole)} />
    }

    return children
}
