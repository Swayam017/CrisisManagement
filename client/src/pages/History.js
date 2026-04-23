import { useEffect, useState, useCallback } from "react";

export default function History() {
  const [bookings, setBookings] = useState([]);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ FIXED (useCallback)
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(`${API}/api/bookings/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings || []);
      }

    } catch (err) {
      console.log(err);
    }
  }, [API]);

  // ✅ FIXED dependency
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold text-orange-400 mb-6">
        📜 Booking History
      </h1>

      {bookings.length === 0 ? (
        <p className="text-gray-400">No bookings yet</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-gray-800 p-4 rounded-lg shadow"
            >
              <p>
                <b>Status:</b>{" "}
                <span className="text-green-400">
                  {b.status}
                </span>
              </p>

              <p>📍 {b.address}</p>

              <p>
                📅{" "}
                {b.scheduledDate
                  ? new Date(b.scheduledDate).toDateString()
                  : "Not scheduled"}
              </p>

              <p className="text-sm text-gray-400">
                {new Date(b.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}