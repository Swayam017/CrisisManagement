import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    fraudBookings: 0,
    delivered: 0,
    revenue: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: "Bearer " + token
        }
      });

      const data = await res.json();
      setStats(data);
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-400">
          📊 Admin Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-gray-800 p-6 rounded-xl">
          <h2>Total Bookings</h2>
          <p className="text-3xl">{stats.totalBookings}</p>
        </div>

        <div className="bg-red-500 p-6 rounded-xl">
          <h2>Fraud Alerts</h2>
          <p className="text-3xl">{stats.fraudBookings}</p>
        </div>

        <div className="bg-green-500 p-6 rounded-xl">
          <h2>Delivered</h2>
          <p className="text-3xl">{stats.delivered}</p>
        </div>

        <div className="bg-blue-500 p-6 rounded-xl">
          <h2>Revenue</h2>
          <p className="text-3xl">₹{stats.revenue}</p>
        </div>

      </div>

      {/* ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <button
          onClick={() => navigate("/admin/bookings")}
          className="bg-purple-500 p-6 rounded-xl"
        >
          📜 All Bookings
        </button>

        <button
          onClick={() => navigate("/complaint")}
          className="bg-yellow-500 p-6 rounded-xl"
        >
          ⚠ Fraud Alerts
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className="bg-gray-700 p-6 rounded-xl"
        >
          👤 User View
        </button>

      </div>

      {/* EMPTY STATE */}
      {stats.totalBookings === 0 && (
        <div className="mt-10 bg-gray-800 p-6 rounded-xl text-center">
          No bookings yet
        </div>
      )}

    </div>
  );
}