import { useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ReportForm() {

    const { user } = useAuth();

    const [address, setAddress] = useState("");
    const [category, setCategory] = useState("Poor Streetlight");
    const [description, setDescription] = useState("");

    const [phoneNumber, setPhoneNumber] = useState("");

    const [email, setEmail] = useState(
        user?.email || ""
    );

    const [suggestions, setSuggestions] = useState([]);

    const [selectedLocation, setSelectedLocation] =
        useState(null);

    const [searching, setSearching] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);


    // =========================================================
    // LOCATION SEARCH
    // =========================================================

    const searchLocations = async (query) => {

        setAddress(query);

        setSelectedLocation(null);

        if (query.trim().length < 2) {

            setSuggestions([]);

            return;
        }

        try {

            setSearching(true);

            const res = await api.get(
                "/locations/search",
                {
                    params: {
                        q: query
                    }
                }
            );

            setSuggestions(
                res.data || []
            );

        } catch (err) {

            console.error(
                "Location search error:",
                err
            );

            setSuggestions([]);

        } finally {

            setSearching(false);

        }
    };


    // =========================================================
    // SELECT LOCATION
    // =========================================================

    const selectLocation = (item) => {

        setSelectedLocation(item);

        setAddress(
            item.address
        );

        setSuggestions([]);

    };


    // =========================================================
    // SUBMIT REPORT
    // =========================================================

    const submitReport = async () => {

        if (!user) {

            alert(
                "Please login before submitting a report."
            );

            return;
        }

        if (!address.trim()) {

            alert(
                "Please enter an incident location."
            );

            return;
        }

        if (!selectedLocation) {

            alert(
                "Please select a location from the suggestions."
            );

            return;
        }

        if (!description.trim()) {

            alert(
                "Please enter a description."
            );

            return;
        }

        if (!phoneNumber.trim()) {

            alert(
                "Please enter your phone number."
            );

            return;
        }

        if (!email.trim()) {

            alert(
                "Please enter your email address."
            );

            return;
        }

        try {

            setSubmitting(true);

            const res = await api.post(
                "/citizen/report",
                {
                    address:
                        selectedLocation.address,

                    latitude:
                        selectedLocation.latitude,

                    longitude:
                        selectedLocation.longitude,

                    category,

                    description,

                    phone_number:
                        phoneNumber.trim(),

                    email:
                        email.trim()
                }
            );

            alert(
                `Report submitted successfully!\n\nReport ID: ${res.data.report_id}`
            );

            // Reset

            setAddress("");

            setCategory(
                "Poor Streetlight"
            );

            setDescription("");

            setPhoneNumber("");

            setEmail(
                user?.email || ""
            );

            setSuggestions([]);

            setSelectedLocation(null);

        } catch (err) {

            console.error(
                "Submit report error:",
                err
            );

            if (
                err.response?.status === 401
            ) {

                alert(
                    "Your session has expired. Please login again."
                );

            } else {

                alert(
                    err.response?.data?.error ||
                    "Failed to submit report."
                );

            }

        } finally {

            setSubmitting(false);

        }
    };


    return (

        <div className="max-w-4xl">

            <div className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-sm
                overflow-hidden
            ">

                {/* HEADER */}

                <div className="
                    px-8
                    py-7
                    border-b
                    border-slate-200
                ">

                    <h2 className="
                        text-2xl
                        font-bold
                        text-slate-800
                    ">
                        Report an Incident
                    </h2>

                    <p className="
                        mt-2
                        text-slate-500
                    ">
                        Provide the details of the incident so it
                        can be reviewed by the appropriate authorities.
                    </p>

                </div>


                <div className="p-8 space-y-7">

                    {/* ================================================= */}
                    {/* CITIZEN INFORMATION */}
                    {/* ================================================= */}

                    <div>

                        <h3 className="
                            text-sm
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-500
                            mb-4
                        ">
                            Your Information
                        </h3>

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        ">

                            {/* NAME */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">
                                    Name
                                </label>

                                <input
                                    type="text"
                                    value={user?.name || ""}
                                    readOnly
                                    className="
                                        w-full
                                        border
                                        border-slate-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-slate-800
                                        bg-slate-50
                                        outline-none
                                        cursor-not-allowed
                                    "
                                />

                                <p className="
                                    mt-1
                                    text-xs
                                    text-slate-400
                                ">
                                    This is the name associated with
                                    your citizen account.
                                </p>

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email address"
                                    autoComplete="email"
                                    className="
                                        w-full
                                        border
                                        border-slate-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-slate-800
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                        transition
                                    "
                                />

                            </div>


                            {/* PHONE */}

                            <div>

                                <label className="
                                    block
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-2
                                ">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your phone number"
                                    autoComplete="tel"
                                    className="
                                        w-full
                                        border
                                        border-slate-300
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-slate-800
                                        outline-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                        transition
                                    "
                                />

                            </div>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* LOCATION */}
                    {/* ================================================= */}

                    <div className="relative">

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Incident Location
                        </label>

                        <input
                            type="text"
                            value={address}
                            onChange={(e) =>
                                searchLocations(
                                    e.target.value
                                )
                            }
                            placeholder="Search for the incident location..."
                            className="
                                w-full
                                border
                                border-slate-300
                                rounded-xl
                                px-4
                                py-3
                                text-slate-800
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                                transition
                            "
                        />

                        {searching && (

                            <div className="
                                mt-2
                                text-sm
                                text-slate-500
                            ">
                                Searching locations...
                            </div>

                        )}

                        {suggestions.length > 0 && (

                            <div className="
                                absolute
                                left-0
                                right-0
                                top-full
                                mt-2
                                z-50
                                bg-white
                                border
                                border-slate-200
                                rounded-xl
                                shadow-lg
                                overflow-hidden
                                max-h-64
                                overflow-y-auto
                            ">

                                {suggestions.map(
                                    (item, index) => (

                                        <button
                                            key={`${item.address}-${index}`}
                                            type="button"
                                            onClick={() =>
                                                selectLocation(
                                                    item
                                                )
                                            }
                                            className="
                                                w-full
                                                text-left
                                                px-4
                                                py-3
                                                border-b
                                                border-slate-100
                                                last:border-b-0
                                                hover:bg-blue-50
                                                transition
                                            "
                                        >

                                            <div className="
                                                font-medium
                                                text-slate-800
                                            ">
                                                {item.address}
                                            </div>

                                            {item.latitude &&
                                                item.longitude && (

                                                    <div className="
                                                        text-xs
                                                        text-slate-400
                                                        mt-1
                                                    ">
                                                        {item.latitude},{" "}
                                                        {item.longitude}
                                                    </div>

                                                )}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                        {selectedLocation && (

                            <div className="
                                mt-3
                                px-4
                                py-3
                                bg-green-50
                                border
                                border-green-200
                                rounded-xl
                            ">

                                <div className="
                                    text-sm
                                    font-semibold
                                    text-green-700
                                ">
                                    Location selected
                                </div>

                                <div className="
                                    text-sm
                                    text-green-600
                                    mt-1
                                ">
                                    {selectedLocation.address}
                                </div>

                            </div>

                        )}

                    </div>


                    {/* ================================================= */}
                    {/* CATEGORY */}
                    {/* ================================================= */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Incident Category
                        </label>

                        <select
                            value={category}
                            onChange={(e) =>
                                setCategory(
                                    e.target.value
                                )
                            }
                            className="
                                w-full
                                border
                                border-slate-300
                                rounded-xl
                                px-4
                                py-3
                                text-slate-800
                                bg-white
                                outline-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                                transition
                            "
                        >

                            <option>
                                Poor Streetlight
                            </option>

                            <option>
                                Suspicious Activity
                            </option>

                            <option>
                                Illegal Parking
                            </option>

                            <option>
                                Garbage Dumping
                            </option>

                            <option>
                                Traffic Obstruction
                            </option>

                            <option>
                                Drug Activity
                            </option>

                            <option>
                                Abandoned Vehicle
                            </option>

                            <option>
                                Other
                            </option>

                        </select>

                    </div>


                    {/* ================================================= */}
                    {/* DESCRIPTION */}
                    {/* ================================================= */}

                    <div>

                        <label className="
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                            mb-2
                        ">
                            Description
                        </label>

                        <textarea
                            rows={6}
                            value={description}
                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }
                            placeholder="Describe what happened, what you observed, or why you are reporting this incident..."
                            className="
                                w-full
                                border
                                border-slate-300
                                rounded-xl
                                px-4
                                py-3
                                text-slate-800
                                outline-none
                                resize-none
                                focus:border-blue-500
                                focus:ring-2
                                focus:ring-blue-100
                                transition
                            "
                        />

                        <p className="
                            mt-2
                            text-xs
                            text-slate-400
                        ">
                            Please provide clear and relevant information.
                        </p>

                    </div>


                    {/* ================================================= */}
                    {/* SUBMIT */}
                    {/* ================================================= */}

                    <div className="
                        pt-2
                        flex
                        justify-end
                    ">

                        <button
                            type="button"
                            onClick={submitReport}
                            disabled={submitting}
                            className="
                                px-7
                                py-3
                                rounded-xl
                                bg-blue-600
                                text-white
                                font-semibold
                                shadow-sm
                                hover:bg-blue-700
                                disabled:bg-blue-300
                                disabled:cursor-not-allowed
                                transition
                            "
                        >
                            {submitting
                                ? "Submitting..."
                                : "Submit Report →"}
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}