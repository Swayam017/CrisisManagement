import { useEffect, useState, useCallback } from "react";

export default function TrackDelivery() {
  const [booking, setBooking] = useState(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ==============================
  // 🔥 FETCH BOOKING
  // ==============================
  const fetchBooking = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await fetch(`${API}/api/bookings/my-booking`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setBooking(data.booking);
      }

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchBooking();

    // 🔥 AUTO REFRESH (every 5 sec)
    const interval = setInterval(fetchBooking, 5000);

    return () => clearInterval(interval);
  }, [fetchBooking]);

  // ==============================
  // 🔐 VERIFY OTP
  // ==============================
  const verifyOTP = async () => {
    const token = localStorage.getItem("token");

    if (!otp) {
      alert("Enter OTP");
      return;
    }

    try {
      const res = await fetch(`${API}/api/bookings/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          otp
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("✅ Delivery verified");
      fetchBooking();

    } catch (err) {
      console.log(err);
    }
  };

  // ==============================
  // 🎯 STATUS UI HELPER
  // ==============================
  const isActive = (step) => {
    const order = [
      "BOOKED",
      "ASSIGNED",
      "OUT_FOR_DELIVERY",
      "OTP_SENT",
      "DELIVERED"
    ];

    return order.indexOf(booking?.status) >= order.indexOf(step);
  };

  // ==============================
  // 🔥 LOADING
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <h2 className="animate-pulse">Loading tracking...</h2>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <h2>No active booking</h2>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================
  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold text-orange-400 mb-6">
        📍 Track Delivery
      </h1>

      {/* 📦 DETAILS */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6">
        <p><b>Status:</b> {booking.status}</p>
        <p><b>📍 Address:</b> {booking.address}</p>
        <p>
          <b>📅 Delivery Date:</b>{" "}
          {booking.scheduledDate
            ? new Date(booking.scheduledDate).toDateString()
            : "Not scheduled"}
        </p>
        <p><b>⏰ Slot:</b> {booking.deliverySlot || "-"}</p>
      </div>

      {/* 🚀 TIMELINE */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6">

        <h2 className="mb-4 text-xl">📦 Delivery Timeline</h2>

        <div className="space-y-3">

          <Step label="Booked" active={isActive("BOOKED")} />
          <Step label="Assigned" active={isActive("ASSIGNED")} />
          <Step label="Out for Delivery" active={isActive("OUT_FOR_DELIVERY")} />
          <Step label="OTP Sent" active={isActive("OTP_SENT")} />
          <Step label="Delivered" active={isActive("DELIVERED")} />

        </div>
      </div>

      {/* 🔐 OTP */}
      {booking.status === "OTP_SENT" && (
        <div className="bg-gray-800 p-6 rounded-xl">

          <h2 className="mb-4">🔐 Verify Delivery</h2>

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full p-3 mb-4 bg-gray-900 border border-gray-700 rounded"
          />

          <button
            onClick={verifyOTP}
            className="bg-green-500 px-6 py-2 rounded hover:bg-green-600"
          >
            Verify OTP
          </button>
        </div>
      )}

    </div>
  );
}


// ==============================
// 🔥 STEP COMPONENT
// ==============================
function Step({ label, active }) {
  return (
    <div className={`p-3 rounded-lg ${
      active ? "bg-green-600" : "bg-gray-700"
    }`}>
      {active ? "✔ " : "⏳ "} {label}
    </div>
  );
}