import Navbar from "../components/Navbar";
import ReportForm from "../components/community/ReportForm";

export default function CitizenReport() {
    return (
        <div className="min-h-screen bg-slate-100">

            <Navbar hideMenu />

            <main className="p-6 overflow-auto">

                <div className="max-w-5xl mx-auto">

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-800">
                            Report an Incident
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Submit a safety-related incident to the appropriate
                            authorities.
                        </p>
                    </div>

                    <ReportForm />

                </div>

            </main>

        </div>
    );
}