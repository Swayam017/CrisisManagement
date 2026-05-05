import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";

export default function BookCylinder() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();
 // const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
 const API = "http://localhost:5000";

  // =========================
  // 🔥 FETCH EXISTING BOOKING
  // =========================
  const fetchBooking = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/bookings/my-booking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.booking) {
        setBooking(data.booking);
      }
    } catch (err) {
      console.log(err);
    }
  }, [API]);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 10000);
    return () => clearInterval(interval);
  }, [fetchBooking]);

  // =========================
  // 💳 BOOK + PAYMENT
  // =========================
  const handleBooking = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API}/api/bookings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ address }),
    });

    const data = await res.json();

    console.log("FULL RESPONSE:", data); // 🔥 DEBUG

    // ❌ DO NOT DO THIS
    // alert("Booking successful");

    // ✅ HANDLE ERROR
    if (!res.ok) {
      alert(data.message);
      return;
    }

    // 🚨 IMPORTANT CHECK
   if (!data.payment_session_id) {
  console.log("FULL RESPONSE:", data);
  alert(data.message || "Payment session missing");
  return;
}

    // ✅ START PAYMENT
    const cashfree = await load({ mode: "sandbox" });

    await cashfree.checkout({
      paymentSessionId: data.payment_session_id,
      redirectTarget: "_modal",
    });
    
setTimeout(() => {
  checkPaymentStatus(data.order_id);
}, 3000);

  } catch (err) {
    console.log(err);
    alert("Booking failed");
  }
};

const checkPaymentStatus = async (orderId) => {
  try {
    const res = await fetch(
      `http://localhost:5000/api/bookings/payment-status/${orderId}`
    );

    const data = await res.json();

    console.log("Payment Status:", data);

    if (data.status === "SUCCESS") {
      alert("✅ Payment Successful");
    } else if (data.status === "PENDING") {
      alert("⏳ Payment Pending");
    } else {
      alert("❌ Payment Failed");
    }

  } catch (err) {
    console.error("Status error:", err);
  }
};

  // =========================
  // 🔐 VERIFY OTP
  // =========================
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          otp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Delivery Verified");
        fetchBooking();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("OTP verification failed");
    }
  };

  // =========================
  // 📊 STATUS HELPER
  // =========================
  const isActive = (step) => {
    const order = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "ASSIGNED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    return order.indexOf(booking?.status) >= order.indexOf(step);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white p-6">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-lg shadow-lg">

        <h2 className="text-2xl font-bold text-orange-400 mb-6 text-center">
          🚀 Book LPG Cylinder
        </h2>

        {/* =========================
            🧾 BOOKING FORM
        ========================= */}
        {!booking && (
          <>
            <input
              type="text"
              placeholder="Enter Delivery Address"
              className="w-full p-3 mb-4 rounded bg-gray-900 border border-gray-700"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 p-3 rounded font-semibold"
            >
              {loading ? "Processing..." : "Book & Pay ₹1100"}
            </button>
          </>
        )}

        {/* =========================
            📦 BOOKING DETAILS
        ========================= */}
        {booking && (
          <div className="mt-6">

            <h3 className="text-lg font-semibold mb-3">
              📦 Booking Details
            </h3>

            <p><b>Status:</b> <span className="text-green-400">{booking.status}</span></p>
            <p>📍 {booking.address}</p>

            <p>
              📅 {booking.scheduledDate
                ? new Date(booking.scheduledDate).toDateString()
                : "Not scheduled"}
            </p>

            <p>⏰ {booking.deliverySlot || "-"}</p>

            <p>
              <b>Check:</b>{" "}
              <span className={booking.aiFlag === "FRAUD" ? "text-red-500" : "text-green-400"}>
                {booking.aiFlag}
              </span>
            </p>

            {/* =========================
                📊 TIMELINE
            ========================= */}
            <div className="mt-4 space-y-2 text-sm">

              <div className={isActive("PENDING_PAYMENT") ? "text-green-400" : "text-gray-500"}>
                💳 Payment Pending
              </div>

              <div className={isActive("CONFIRMED") ? "text-green-400" : "text-gray-500"}>
                ✔ Payment Confirmed
              </div>

              <div className={isActive("ASSIGNED") ? "text-green-400" : "text-gray-500"}>
                🚚 Assigned
              </div>

              <div className={isActive("OUT_FOR_DELIVERY") ? "text-green-400" : "text-gray-500"}>
                📦 Out for Delivery
              </div>

              <div className={isActive("DELIVERED") ? "text-green-400" : "text-gray-500"}>
                ✅ Delivered
              </div>

            </div>

            {/* =========================
                🔐 OTP SECTION
            ========================= */}
            {booking.status === "OUT_FOR_DELIVERY" && (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full p-2 mb-2 rounded bg-gray-900"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button
                  onClick={verifyOTP}
                  className="w-full bg-green-600 p-2 rounded"
                >
                  Verify Delivery
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}