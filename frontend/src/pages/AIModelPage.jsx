import DashboardLayout from "../layouts/DashboardLayout";
import DashboardChart from "../components/DashboardChart";
// import LSTMPredictionDistribution from "../components/models/LSTMPredictionDistribution";
import GCNMap from "../components/models/GCNMap";
import HawkesHeatmap from "../components/models/HawkesHeatmap";
import HawkesSidebar from "../components/models/HawkesSidebar";

export default function AIModelPage() {

    return (

        <DashboardLayout>

            <div>

                <h1 className="text-4xl font-bold text-slate-800">
                    AI Model Visualizations
                </h1>

                <p className="text-gray-500 mt-3 text-lg">
                    Visualization of individual AI models used for crime prediction.
                </p>

                {/* GCN */}
                <div className="mt-8">

                    <h2 className="text-2xl font-bold mb-4">
                        GCN Crime Network
                    </h2>

                    <DashboardChart className="h-[750px]">
                        <GCNMap />
                    </DashboardChart>

                </div>

                {/* Hawkes */}
                <div className="mt-10">

                    <h2 className="text-2xl font-bold mb-4">
                        Hawkes Process Heatmap
                    </h2>
                    <div className="grid grid-cols-4 gap-4 mb-6">

    <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500 text-sm">Maximum Intensity</p>
        <h2 className="text-3xl font-bold text-red-600">10.00</h2>
    </div>

    <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500 text-sm">Average Intensity</p>
        <h2 className="text-3xl font-bold text-blue-600">2.84</h2>
    </div>

    <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500 text-sm">Active Grids</p>
        <h2 className="text-3xl font-bold text-green-600">2512</h2>
    </div>

    <div className="bg-white rounded-xl shadow p-4">
        <p className="text-gray-500 text-sm">Top Hotspots</p>
        <h2 className="text-3xl font-bold text-orange-600">8</h2>
    </div>

</div>

                    <DashboardChart className="h-[800px]">

    <div className="grid grid-cols-12 gap-5 h-full">

        <div className="col-span-9 h-full">

            <HawkesHeatmap />

        </div>

        <div className="col-span-3 h-full">

            <HawkesSidebar />

        </div>

    </div>

</DashboardChart>
<div className="mt-6 bg-white rounded-xl shadow p-5">

    <h2 className="text-xl font-bold mb-3">
        Intensity Legend
    </h2>

    <div className="flex gap-8 flex-wrap mb-6">

        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-600"></div>
            <span>Very High</span>
        </div>

        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-orange-500"></div>
            <span>High</span>
        </div>

        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-yellow-400"></div>
            <span>Moderate</span>
        </div>

        <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-blue-500"></div>
            <span>Low</span>
        </div>

    </div>


</div>

                </div>

            </div>

        </DashboardLayout>

    );

}