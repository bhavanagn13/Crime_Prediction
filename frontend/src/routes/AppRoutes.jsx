import { Routes, Route } from "react-router-dom";

import AdminDashboard from "../pages/AdminDashboard";
import PoliceDashboard from "../pages/PoliceDashboard";
import Prediction from "../pages/Prediction";
import Patrol from "../pages/Patrol";
import CitizenReport from "../pages/CitizenReport";
import CommunityReports from "../pages/CommunityReports";
import CitizenDashboard from "../pages/CitizenDashboard";
import CitizenCommunityReports from "../pages/CitizenCommunityReports";
import MyReports from "../pages/MyReports";
import AdminManagement from "../pages/AdminManagement";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";


export default function AppRoutes() {

    return (
        <Routes>

            {/* ================================================= */}
            {/* PUBLIC ROUTES                                    */}
            {/* ================================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/unauthorized"
                element={<Unauthorized />}
            />


            {/* ================================================= */}
            {/* ADMIN                                             */}
            {/* ================================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["ADMIN"]}
                    />
                }
            >
                <Route
                    path="/"
                    element={<AdminDashboard />}
                />

                <Route
    path="/admin-management"
    element={<AdminManagement />}
/>
            </Route>


            {/* ================================================= */}
            {/* POLICE + ADMIN                                    */}
            {/* ================================================= */}

            <Route
                element={
                    <ProtectedRoute
                        allowedRoles={["POLICE", "ADMIN"]}
                    />
                }
            >

                <Route
                    path="/police"
                    element={<PoliceDashboard />}
                />

                <Route
                    path="/prediction"
                    element={<Prediction />}
                />

                <Route
                    path="/patrol"
                    element={<Patrol />}
                />

                <Route
                    path="/reports"
                    element={<CommunityReports />}
                />

            </Route>


           {/* ================================================= */}
{/* CITIZEN                                           */}
{/* ================================================= */}

<Route
    element={
        <ProtectedRoute
            allowedRoles={["CITIZEN"]}
        />
    }
>
    <Route
        path="/citizen"
        element={<CitizenDashboard  />}
    />


<Route
  path="/community-reports"
  element={<CitizenCommunityReports />}
/>

<Route
  path="/citizen/my-reports"
  element={<MyReports />}
/>

<Route
  path="/citizen-report"
  element={<CitizenReport />}
/>
</Route>


        </Routes>
    );
}