import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

export default function CrimeTrendChart({ data }) {

    return (

        <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="week" />

                <YAxis />

                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="crime_count"
                    stroke="#2563EB"
                    strokeWidth={3}
                />

            </LineChart>

        </ResponsiveContainer>

    );

}