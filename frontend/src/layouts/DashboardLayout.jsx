import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setSidebarOpen(false);
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () => window.removeEventListener("keydown", handleEsc);

    }, []);

    return (

        <div className="relative h-screen bg-slate-100 overflow-hidden">

            {/* Floating Sidebar */}

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Overlay */}

            {sidebarOpen && (

                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40"
                />

            )}

            {/* Main Content */}

            <div className="flex h-full flex-col">

                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 overflow-auto p-6">

                    {children}

                </main>

            </div>

        </div>

    );

}