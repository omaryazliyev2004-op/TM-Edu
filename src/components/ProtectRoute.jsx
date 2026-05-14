import { Navigate } from "react-router-dom"

export default function ProtectRoute({children}) {
    const token = window.localStorage.getItem("token")

    if(!token){
        return <Navigate to="/"/>
    }
    return  children
}