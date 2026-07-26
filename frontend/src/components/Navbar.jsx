export default function Navbar() {
  return (
    <header className="bg-white shadow px-8 py-5 flex justify-between items-center">

      <div>

        <h2 className="text-2xl font-semibold">

          Crime Intelligence Dashboard

        </h2>

        <p className="text-gray-500">

          AI-Based Predictive Crime Analysis

        </p>

      </div>

      <div className="text-right">

        <div className="font-semibold">

          Administrator

        </div>

        <div className="text-sm text-gray-500">

          Bengaluru City Police

        </div>

      </div>

    </header>
  );
}