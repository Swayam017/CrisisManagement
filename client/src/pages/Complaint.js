import { useEffect, useState, useCallback } from "react";

export default function Complaint() {
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ==============================
  // 🔥 FETCH COMPLAINTS (FIXED)
  // ==============================
  const fetchComplaints = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(`${API}/api/complaints/my`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setComplaints(data.complaints || []);
      }

    } catch (err) {
      console.log("Fetch error:", err);
    }
  }, [API]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ==============================
  // 🔥 SUBMIT COMPLAINT
  // ==============================
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (!message.trim()) {
      alert("Enter complaint message");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/complaints/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit complaint");
        return;
      }

      alert("✅ Complaint submitted");
      setMessage("");

      // refresh list
      fetchComplaints();

    } catch (err) {
      console.log("Submit error:", err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* 🔥 HEADER */}
      <h1 className="text-3xl font-bold text-orange-400 mb-6">
        ⚠ Raise Complaint
      </h1>

      {/* ==============================
          📝 FORM
      ============================== */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg">

        <textarea
          placeholder="Describe your issue..."
          className="w-full p-3 rounded bg-gray-900 border border-gray-700 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-500 px-6 py-3 rounded font-semibold hover:bg-red-600 transition"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </div>

      {/* ==============================
          📜 HISTORY
      ============================== */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">

        <h2 className="text-xl mb-4 font-semibold">
          📜 Your Complaints
        </h2>

        {complaints.length === 0 ? (
          <p className="text-gray-400">No complaints yet</p>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-gray-900 p-4 rounded-lg border border-gray-700"
              >
                <p className="text-gray-300 mb-2">
                  {c.message}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </p>

                {c.bookingId && (
                  <p className="text-sm text-blue-400 mt-1">
                    📦 Booking Status: {c.bookingId.status}
                  </p>
                )}

                {/* Optional status (future-ready) */}
                {c.status && (
                  <span className="text-xs px-2 py-1 bg-yellow-500 text-black rounded ml-2">
                    {c.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}