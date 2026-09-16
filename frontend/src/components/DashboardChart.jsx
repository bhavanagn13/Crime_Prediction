export default function DashboardChart({
    title,
    children,
    onClick,
    className = ""
}) {
    return (

        <div
            onClick={onClick}
            className={`
                bg-white
                rounded-xl
                shadow-sm
                hover:shadow-lg
                transition
                border
                overflow-hidden
                ${className}
            `}
        >

            {title && (

                <div className="flex justify-between items-center p-5 border-b">

                    <h2 className="text-lg font-semibold text-slate-800">

                        {title}

                    </h2>

                    <button
                        className="
                            text-gray-400
                            hover:text-blue-600
                            text-xl
                        "
                    >
                        ⛶
                    </button>

                </div>

            )}

            {children}

        </div>

    );
}