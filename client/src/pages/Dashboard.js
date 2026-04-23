import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const loadDashboard = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 👤 USER
      const userRes = await fetch(`${API}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUser(userData);

      // 📦 BOOKING
      const bookingRes = await fetch(`${API}/api/bookings/my-booking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingData = await bookingRes.json();
      setBooking(bookingData.booking);

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [navigate, API]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // 🔥 SELECT DISTRIBUTOR BUTTON
  const handleSelectDistributor = () => {
    navigate("/select-distributor");
  };

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-400">
          LPG Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* 👤 USER INFO */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6">
        <h2 className="text-xl mb-2">
          👤 Welcome {user?.name}
        </h2>

        <p className="text-gray-400">{user?.email}</p>

        {/* 🔥 DISTRIBUTOR STATUS */}
        {!user?.distributorId ? (
          <div className="mt-4 bg-red-500 p-3 rounded">
            ⚠ Not registered with any distributor

            <button
              onClick={handleSelectDistributor}
              className="mt-3 bg-black px-4 py-2 rounded"
            >
              Select Distributor
            </button>
          </div>
        ) : (
          <p className="mt-2 text-green-400">
            🏢 {user.distributorId.name} ({user.distributorId.location})
          </p>
        )}
      </div>

      {/* 📦 BOOKING */}
      {user?.distributorId && (
        <div className="bg-gray-800 p-6 rounded-xl mb-6">
          <h2 className="text-xl mb-4">📦 Booking Status</h2>

          {booking ? (
            <>
              <p>Status: <span className="text-green-400">{booking.status}</span></p>
              <p>📍 {booking.address}</p>
              <p>
                📅 {booking.scheduledDate
                  ? new Date(booking.scheduledDate).toDateString()
                  : "Not scheduled"}
              </p>
            </>
          ) : (
            <p>No active booking</p>
          )}
        </div>
      )}

      {/* 🚀 ACTIONS */}
      {user?.distributorId && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <button
            onClick={() => navigate("/book")}
            className="bg-green-500 p-6 rounded-xl"
          >
            🚀 Book Cylinder
          </button>

          <button
            onClick={() => navigate("/track")}
            className="bg-blue-500 p-6 rounded-xl"
          >
            📍 Track Delivery
          </button>

          <button
            onClick={() => navigate("/history")}
            className="bg-purple-500 p-6 rounded-xl"
          >
            📜 History
          </button>

          <button
            onClick={() => navigate("/complaint")}
            className="bg-red-500 p-6 rounded-xl"
          >
            ⚠ Complaint
          </button>

        </div>
      )}

      {/* ⚠ ALERT */}
      {booking && (
        <div className="bg-yellow-500 p-4 mt-6 text-black rounded">
          ⚠ {booking.aiFlag === "FRAUD"
            ? "Unusual booking detected"
            : "No alerts"}
        </div>
      )}
    </div>
  );
}