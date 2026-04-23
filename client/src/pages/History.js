import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API}/api/bookings/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings);
      } else {
        alert(data.message);
      }

    } catch (err) {
      console.log(err);
      alert("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Status color
  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "text-green-400";
      case "OTP_SENT": return "text-yellow-400";
      case "OUT_FOR_DELIVERY": return "text-blue-400";
      case "ASSIGNED": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-950 text-white min-h-screen flex items-center justify-center">
        Loading history...
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-400">
          📜 Booking History
        </h1>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-700 px-4 py-2 rounded"
        >
          Back
        </button>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-lg font-bold text-orange-400 mb-2">
                Booking #{b._id.slice(-5)}
              </h3>

              <p className={`font-semibold ${getStatusColor(b.status)}`}>
                {b.status}
              </p>

              <p className="text-gray-400 mt-2">
                📍 {b.address}
              </p>

              <p className="text-gray-400">
                📅 {new Date(b.createdAt).toDateString()}
              </p>

              <p className="text-gray-400">
                💰 ₹{b.amount}
              </p>

              {b.agentId && (
                <p className="text-gray-400">
                  🚚 Agent: {b.agentId.name}
                </p>
              )}

              {b.aiFlag === "FRAUD" && (
                <p className="text-red-400 mt-2">
                  ⚠ Suspicious activity
                </p>
              )}
            </div>
          ))}

        </div>
      )}
    </div>
  );
}