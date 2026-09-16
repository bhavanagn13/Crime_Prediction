import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // =========================================================
    // LOGIN
    // =========================================================

    const login = async (email, password) => {

        const response = await api.post("/auth/login", {
            email,
            password
        });

        if (!response.data?.user) {
            throw new Error("Login response did not contain user information.");
        }

        setUser(response.data.user);

        return response.data;
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = async () => {

        try {

            await api.post("/auth/logout");

        } catch (error) {

            console.error(
                "Logout request failed:",
                error
            );

        } finally {

            setUser(null);

        }
    };


    // =========================================================
    // CHECK EXISTING FLASK SESSION
    // =========================================================

    const checkSession = async () => {

        try {

            const response = await api.get("/auth/me");

            if (
                response.data?.authenticated &&
                response.data?.user
            ) {

                setUser(response.data.user);

            } else {

                setUser(null);

            }

        } catch (error) {

            /*
             * A 401 simply means there is no valid Flask session.
             * This is expected when the user has not logged in yet.
             */

            if (error.response?.status === 401) {

                setUser(null);

            } else {

                console.error(
                    "Unable to verify authentication session:",
                    error
                );

                setUser(null);
            }

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // INITIAL SESSION CHECK
    // =========================================================

    useEffect(() => {

        checkSession();

    }, []);


    // =========================================================
    // CONTEXT
    // =========================================================

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                isAuthenticated: Boolean(user),
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>
    );
}


// =============================================================
// USE AUTH
// =============================================================

export function useAuth() {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
}