import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import DocumentList from "../pages/DocumentList/DocumentList";
import VersionHistory from "../pages/VersionHistory/VersionHistory";
import Layout from "../components/Layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import ProviderManager from "../pages/ProviderManager/ProviderManager";

const Routes = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "", element: <Home /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            {
                path: "documents",
                element: (
                    <ProtectedRoute>
                        <DocumentList />
                    </ProtectedRoute>
                ),
            },
            {
                path: "documents/:id",
                element: (
                    <ProtectedRoute>
                        <ProviderManager />
                    </ProtectedRoute>
                ),
            },
            {
                path: "documents/:id/history",
                element: (
                    <ProtectedRoute>
                        <VersionHistory />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default Routes;
