import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

export default function AdminManagement() {

    const [police, setPolice] = useState([]);
    const [citizens, setCitizens] = useState([]);
    const [stations, setStations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showAddForm, setShowAddForm] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        police_station: ""
    });


    // ==========================================================
    // LOAD POLICE OFFICERS + STATIONS
    // ==========================================================

    const loadData = async () => {

        setLoading(true);
        setError("");

        try {

            const [
    policeResponse,
    stationResponse,
    citizenResponse
] = await Promise.all([
    api.get("/auth/admin/police"),
    api.get("/police-stations"),
    api.get("/auth/admin/citizens")
]);

setPolice(
    Array.isArray(policeResponse.data)
        ? policeResponse.data
        : []
);

setStations(
    stationResponse.data?.stations || []
);

setCitizens(
    Array.isArray(citizenResponse.data)
        ? citizenResponse.data
        : []
);

            setPolice(
                Array.isArray(policeResponse.data)
                    ? policeResponse.data
                    : []
            );

            setStations(
                stationResponse.data?.stations || []
            );

        } catch (err) {

            console.error(
                "Failed to load admin management data:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to load management data."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    // ==========================================================
    // FORM CHANGE
    // ==========================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // ==========================================================
    // CREATE POLICE ACCOUNT
    // ==========================================================

    const handleCreatePolice = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        if (!form.name.trim()) {
            setError("Officer name is required.");
            return;
        }

        if (!form.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (form.password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (!form.police_station) {
            setError(
                "Please select a police station."
            );
            return;
        }

        setSaving(true);

        try {

            await api.post(
                "/auth/admin/police",
                {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password,
                    police_station: form.police_station
                }
            );

            setMessage(
                "Police officer account created successfully."
            );

            setForm({
                name: "",
                email: "",
                password: "",
                police_station: ""
            });

            setShowAddForm(false);

            await loadData();

        } catch (err) {

            console.error(
                "Failed to create police account:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to create police account."
            );

        } finally {

            setSaving(false);

        }
    };


    // ==========================================================
    // ACTIVATE / DEACTIVATE
    // ==========================================================

    const handleStatusChange = async (officer) => {

        const nextStatus = !officer.is_active;

        const action = nextStatus
            ? "activate"
            : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${officer.name}'s account?`
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {

            await api.patch(
                `/auth/admin/police/${officer.user_id}/status`,
                {
                    is_active: nextStatus
                }
            );

            setMessage(
                `${officer.name}'s account has been ${nextStatus ? "activated" : "deactivated"}.`
            );

            await loadData();

        } catch (err) {

            console.error(
                "Failed to update account status:",
                err
            );

            setError(
                err.response?.data?.error ||
                "Unable to update account status."
            );

        }
    };

    const handleCitizenStatusChange = async (citizen) => {

    const nextStatus = !citizen.is_active;

    const action = nextStatus
        ? "activate"
        : "deactivate";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} ${citizen.name}'s account?`
    );

    if (!confirmed) {
        return;
    }

    setMessage("");
    setError("");

    try {

        await api.patch(
            `/auth/admin/citizens/${citizen.user_id}/status`,
            {
                is_active: nextStatus
            }
        );

        setMessage(
            `${citizen.name}'s account has been ${
                nextStatus
                    ? "activated"
                    : "deactivated"
            }.`
        );

        await loadData();

    } catch (err) {

        console.error(
            "Failed to update citizen account:",
            err
        );

        setError(
            err.response?.data?.error ||
            "Unable to update citizen account."
        );
    }
};
    // ==========================================================
    // STATISTICS
    // ==========================================================

    const totalOfficers = police.length;

    const activeOfficers =
        police.filter(
            (officer) => officer.is_active
        ).length;

    const inactiveOfficers =
        police.filter(
            (officer) => !officer.is_active
        ).length;
    const totalCitizens = citizens.length;

const activeCitizens =
    citizens.filter(
        (citizen) => citizen.is_active
    ).length;

const inactiveCitizens =
    citizens.filter(
        (citizen) => !citizen.is_active
    ).length;

    return (

        <DashboardLayout>

            <div className="space-y-8">


                {/* ================================================= */}
                {/* HEADER                                            */}
                {/* ================================================= */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                        <h1 className="text-4xl font-bold text-slate-800">
                            Admin Management
                        </h1>

                        <p className="text-slate-500 mt-2">
                            Manage police officers and their system access.
                        </p>

                    </div>


                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setMessage("");
                            setError("");
                        }}
                        className="
                            px-5 py-3
                            rounded-xl
                            bg-blue-600
                            text-white
                            font-semibold
                            hover:bg-blue-700
                            transition
                            shadow-sm
                        "
                    >
                        {showAddForm
                            ? "Cancel"
                            : "+ Add Police Officer"}
                    </button>

                </div>


                {/* ================================================= */}
                {/* MESSAGES                                          */}
                {/* ================================================= */}

                {message && (

                    <div className="
                        bg-green-50
                        border border-green-200
                        text-green-700
                        rounded-xl
                        px-5 py-4
                    ">
                        {message}
                    </div>

                )}


                {error && (

                    <div className="
                        bg-red-50
                        border border-red-200
                        text-red-700
                        rounded-xl
                        px-5 py-4
                    ">
                        {error}
                    </div>

                )}


                {/* ================================================= */}
                {/* STATISTICS                                        */}
                {/* ================================================= */}

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-5
                ">

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <p className="text-sm text-slate-500">
                            Total Police Officers
                        </p>

                        <p className="text-3xl font-bold text-slate-800 mt-2">
                            {totalOfficers}
                        </p>

                    </div>


                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <p className="text-sm text-slate-500">
                            Active Accounts
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {activeOfficers}
                        </p>

                    </div>


                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <p className="text-sm text-slate-500">
                            Inactive Accounts
                        </p>

                        <p className="text-3xl font-bold text-red-600 mt-2">
                            {inactiveOfficers}
                        </p>

                    </div>

                </div>


                {/* ================================================= */}
                {/* ADD POLICE OFFICER FORM                          */}
                {/* ================================================= */}

                {showAddForm && (

                    <div className="
                        bg-white
                        rounded-2xl
                        border
                        shadow-sm
                        p-6
                    ">

                        <h2 className="text-xl font-bold text-slate-800">
                            Create Police Officer Account
                        </h2>

                        <p className="text-sm text-slate-500 mt-1 mb-6">
                            Create login credentials and assign the officer to a police station.
                        </p>


                        <form
                            onSubmit={handleCreatePolice}
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-5
                            "
                        >

                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Officer Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter officer name"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-slate-200
                                        rounded-xl
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="officer@example.com"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-slate-200
                                        rounded-xl
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Minimum 8 characters"
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-slate-200
                                        rounded-xl
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Police Station
                                </label>

                                <select
                                    name="police_station"
                                    value={form.police_station}
                                    onChange={handleChange}
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-slate-200
                                        rounded-xl
                                        bg-white
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-500
                                    "
                                >

                                    <option value="">
                                        Select Police Station
                                    </option>

                                    {stations.map((station) => (

                                        <option
                                            key={station}
                                            value={station}
                                        >
                                            {station}
                                        </option>

                                    ))}

                                </select>

                            </div>


                            <div className="md:col-span-2 flex justify-end">

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        px-6
                                        py-3
                                        rounded-xl
                                        bg-blue-600
                                        text-white
                                        font-semibold
                                        hover:bg-blue-700
                                        disabled:opacity-50
                                    "
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Account"}
                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* ================================================= */}
                {/* POLICE OFFICERS TABLE                            */}
                {/* ================================================= */}

                <div className="
                    bg-white
                    rounded-2xl
                    border
                    shadow-sm
                    overflow-hidden
                ">

                    <div className="
                        px-6
                        py-5
                        border-b
                        border-slate-100
                    ">

                        <h2 className="text-xl font-bold text-slate-800">
                            Police Officers
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            View and manage police officer accounts.
                        </p>

                    </div>


                    {loading ? (

                        <div className="p-8 text-center text-slate-500">
                            Loading police officers...
                        </div>

                    ) : police.length === 0 ? (

                        <div className="p-8 text-center text-slate-500">
                            No police officer accounts found.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Officer
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Email
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Police Station
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Last Login
                                        </th>

                                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                            Status
                                        </th>

                                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {police.map((officer) => (

                                        <tr
                                            key={officer.user_id}
                                            className="hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4">

                                                <div className="font-semibold text-slate-800">
                                                    {officer.name}
                                                </div>

                                                <div className="text-xs text-slate-400">
                                                    ID: {officer.user_id}
                                                </div>

                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {officer.email}
                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {officer.police_station || "Not assigned"}
                                            </td>


                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {officer.last_login
                                                    ? new Date(
                                                        officer.last_login
                                                    ).toLocaleString()
                                                    : "Never"}
                                            </td>


                                            <td className="px-6 py-4">

                                                <span
                                                    className={`
                                                        inline-flex
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-xs
                                                        font-semibold
                                                        ${
                                                            officer.is_active
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-red-100 text-red-700"
                                                        }
                                                    `}
                                                >
                                                    {officer.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>


                                            <td className="px-6 py-4 text-right">

                                                <button
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            officer
                                                        )
                                                    }
                                                    className={`
                                                        px-4
                                                        py-2
                                                        rounded-lg
                                                        text-sm
                                                        font-medium
                                                        transition
                                                        ${
                                                            officer.is_active
                                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                                        }
                                                    `}
                                                >
                                                    {officer.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* ================================================= */}
{/* CITIZEN ACCOUNTS                                  */}
{/* ================================================= */}

<div className="
    bg-white
    rounded-2xl
    border
    shadow-sm
    overflow-hidden
">

    <div className="
        px-6
        py-5
        border-b
        border-slate-100
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-3
    ">

        <div>

            <h2 className="text-xl font-bold text-slate-800">
                Citizen Accounts
            </h2>

            <p className="text-sm text-slate-500 mt-1">
                View and manage registered citizen accounts.
            </p>

        </div>


        <div className="flex gap-3 text-sm">

            <span className="
                px-3
                py-2
                rounded-lg
                bg-slate-100
                text-slate-600
            ">
                Total: {totalCitizens}
            </span>

            <span className="
                px-3
                py-2
                rounded-lg
                bg-green-50
                text-green-700
            ">
                Active: {activeCitizens}
            </span>

            <span className="
                px-3
                py-2
                rounded-lg
                bg-red-50
                text-red-700
            ">
                Inactive: {inactiveCitizens}
            </span>

        </div>

    </div>


    {loading ? (

        <div className="
            p-8
            text-center
            text-slate-500
        ">
            Loading citizen accounts...
        </div>

    ) : citizens.length === 0 ? (

        <div className="
            p-8
            text-center
            text-slate-500
        ">
            No citizen accounts found.
        </div>

    ) : (

        <div className="overflow-x-auto">

            <table className="w-full">

                <thead className="bg-slate-50">

                    <tr>

                        <th className="
                            text-left
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Citizen
                        </th>

                        <th className="
                            text-left
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Email
                        </th>

                        <th className="
                            text-left
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Registered
                        </th>

                        <th className="
                            text-left
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Last Login
                        </th>

                        <th className="
                            text-left
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Status
                        </th>

                        <th className="
                            text-right
                            px-6
                            py-4
                            text-sm
                            font-semibold
                            text-slate-600
                        ">
                            Action
                        </th>

                    </tr>

                </thead>


                <tbody className="
                    divide-y
                    divide-slate-100
                ">

                    {citizens.map((citizen) => (

                        <tr
                            key={citizen.user_id}
                            className="hover:bg-slate-50"
                        >

                            <td className="px-6 py-4">

                                <div className="
                                    font-semibold
                                    text-slate-800
                                ">
                                    {citizen.name}
                                </div>

                                <div className="
                                    text-xs
                                    text-slate-400
                                ">
                                    ID: {citizen.user_id}
                                </div>

                            </td>


                            <td className="
                                px-6
                                py-4
                                text-sm
                                text-slate-600
                            ">
                                {citizen.email}
                            </td>


                            <td className="
                                px-6
                                py-4
                                text-sm
                                text-slate-500
                            ">
                                {citizen.created_at
                                    ? new Date(
                                        citizen.created_at
                                    ).toLocaleDateString("en-IN")
                                    : "—"}
                            </td>


                            <td className="
                                px-6
                                py-4
                                text-sm
                                text-slate-500
                            ">
                                {citizen.last_login
                                    ? new Date(
                                        citizen.last_login
                                    ).toLocaleString("en-IN")
                                    : "Never"}
                            </td>


                            <td className="px-6 py-4">

                                <span
                                    className={`
                                        inline-flex
                                        px-3
                                        py-1
                                        rounded-full
                                        text-xs
                                        font-semibold
                                        ${
                                            citizen.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                        }
                                    `}
                                >
                                    {citizen.is_active
                                        ? "Active"
                                        : "Inactive"}
                                </span>

                            </td>


                            <td className="
                                px-6
                                py-4
                                text-right
                            ">

                                <button
                                    onClick={() =>
                                        handleCitizenStatusChange(
                                            citizen
                                        )
                                    }
                                    className={`
                                        px-4
                                        py-2
                                        rounded-lg
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            citizen.is_active
                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                : "bg-green-50 text-green-600 hover:bg-green-100"
                                        }
                                    `}
                                >
                                    {citizen.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )}

</div>

            </div>

        </DashboardLayout>

    );
}