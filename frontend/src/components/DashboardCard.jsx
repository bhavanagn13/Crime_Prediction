import {
    FaThLarge,
    FaExclamationTriangle,
    FaExclamationCircle,
    FaCheckCircle
} from "react-icons/fa";

const iconMap = {
    "Total Grids": <FaThLarge className="text-blue-600 text-xl" />,
    "High Risk": <FaExclamationCircle className="text-red-600 text-xl" />,
    "Medium Risk": <FaExclamationTriangle className="text-orange-500 text-xl" />,
    "Low Risk": <FaCheckCircle className="text-green-600 text-xl" />
};

export default function DashboardCard({
    title,
    value,
    color
}) {

    return (

        <div
            className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition"
            style={{ borderColor: color }}
        >

            <div className="flex items-center justify-between">

                <p className="text-gray-500 font-medium">

                    {title}

                </p>

                {iconMap[title]}

            </div>

            <h2 className="text-4xl font-bold mt-5">

                {value}

            </h2>

        </div>

    );

}