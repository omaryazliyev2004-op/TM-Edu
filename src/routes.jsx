import { createBrowserRouter } from "react-router-dom";
import Login from "./layouts/login";
import Dashboard from "./layouts/DashboardLayout";
import Asosiy from "./layouts/Dashboard";
import Oqituvchilar from "./layouts/oqituvchilar";
import Sinflar from "./layouts/Sinflar";
import Sovgalar from "./layouts/Sovg'alar";
import Boshqarish from "./layouts/Boshqarish";
import Talabalar from "./layouts/Talabalar";
import ProtectRoute from "./components/ProtectRoute";
import {
  Kurslar,
  Xonalar,
  Hodimlar,
} from "./layouts/BoshqarishPages";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectRoute>
        <Dashboard />
      </ProtectRoute>
    ),
    children: [
      {
        index: true,
        element: <Asosiy />,
      },
      {
        path: "/dashboard/o'qituvcilar",
        element: <Oqituvchilar />,
      },
      {
        path: "/dashboard/sinflar",
        element: <Sinflar />,
      },
      {
        path: "/dashboard/talabalar",
        element: <Talabalar />,
      },
      {
        path: "/dashboard/sovg'alar",
        element: <Sovgalar />,
      },
      {
        path: "/dashboard/boshqarish",
        element: <Boshqarish />,
        children: [
          { path: "kurslar",  element: <Kurslar /> },
          { path: "xonalar",  element: <Xonalar /> },
          { path: "hodimlar", element: <Hodimlar /> },
        ],
      },
    ],
  },
]);
