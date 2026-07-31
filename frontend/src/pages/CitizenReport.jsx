import DashboardLayout from "../layouts/DashboardLayout";
import ReportForm from "../components/community/ReportForm";


export default function CitizenReport() {

    return (

        <DashboardLayout>

            <h1 className="text-3xl font-bold mb-6">
                Citizen Report
            </h1>

            <ReportForm/>

        </DashboardLayout>

    );

}