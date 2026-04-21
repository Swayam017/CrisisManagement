let alreadyBooked = false;
let currentBookingId = null;

// 🔥 BOOK LPG
async function bookLPG() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  if (alreadyBooked) {
    alert("You already booked this month");
    return;
  }

  const address = document.getElementById("address").value;
  const button = document.getElementById("bookBtn");
  const loader = document.getElementById("loader");

  if (!address) {
    alert("Enter address");
    return;
  }

  loader.style.display = "block";
  button.disabled = true;
  button.innerText = "Booking... ⏳";

  try {
    const res = await fetch("http://localhost:5000/api/bookings/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ address })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("result").innerHTML =
        `<p style="color:red;">${data.message}</p>`;
      return;
    }

    alreadyBooked = true;
    currentBookingId = data.booking._id;

    renderBookingUI(data.booking);

    button.innerText = "Already Booked";

  } catch (err) {
    console.error(err);
    alert("Server error");
  } finally {
    loader.style.display = "none";
  }
}

// 🔥 RENDER UI (DYNAMIC)
function renderBookingUI(booking) {

  const showOTP = booking.status === "OTP_SENT";

  document.getElementById("result").innerHTML = `
    <div class="booking-card">

      <h5>📦 Booking Details</h5>

      <p><b>Status:</b> 
        <span class="badge-status">${booking.status}</span>
      </p>

      <p><b>📍 Address:</b> ${booking.address}</p>

      <p><b>📅 Delivery Date:</b> 
        ${booking.scheduledDate ? new Date(booking.scheduledDate).toDateString() : "Not scheduled"}
      </p>

      <p><b>⏰ Time Slot:</b> ${booking.deliverySlot || "-"}</p>

      <p>
        <b>Check:</b> 
        <span style="color:${booking.aiFlag === "FRAUD" ? "red" : "green"}">
          ${booking.aiFlag}
        </span>
      </p>

      <!-- 🔥 TIMELINE -->
      <div class="timeline">

        <div class="timeline-step active-step">✔ Booked</div>

<div class="timeline-step ${
  ["ASSIGNED", "OUT_FOR_DELIVERY", "OTP_SENT", "DELIVERED"].includes(booking.status) ? "active-step" : ""
}">
  🚚 Assigned
</div>

<div class="timeline-step ${
  ["OUT_FOR_DELIVERY", "OTP_SENT", "DELIVERED"].includes(booking.status) ? "active-step" : ""
}">
  📦 Out for Delivery
</div>

        <div class="timeline-step ${
  ["OTP_SENT", "DELIVERED"].includes(booking.status) ? "active-step" : ""
}">
  🔐 OTP Sent
</div>

        <div class="timeline-step ${
          booking.status === "DELIVERED" ? "active-step" : ""
        }">
          ✅ Delivered
        </div>

      </div>

      ${
        showOTP ? `
        <div style="margin-top:15px;">
          <h5>🔐 Enter OTP</h5>
          <input type="text" id="otpInput" class="form-control mb-2" placeholder="Enter OTP"/>
          <button onclick="verifyOTP()" class="btn btn-success w-100">Verify Delivery</button>
        </div>
        ` : ""
      }

    </div>
  `;
}

// 🔐 VERIFY OTP
async function verifyOTP() {
  const otp = document.getElementById("otpInput").value;
  const token = localStorage.getItem("token");

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/bookings/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        bookingId: currentBookingId,
        otp
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Delivery Verified");
      location.reload();
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.error(err);
    alert("Error verifying OTP");
  }
}

// 🔥 CHECK EXISTING BOOKING
async function checkExistingBooking() {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const res = await fetch("http://localhost:5000/api/bookings/my-booking", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data.booking) {
      alreadyBooked = true;
      currentBookingId = data.booking._id;

      const button = document.getElementById("bookBtn");
      button.disabled = true;
      button.innerText = "Already Booked";

      renderBookingUI(data.booking);
    }

  } catch (err) {
    console.error(err);
  }
}

// 🚀 INIT
checkExistingBooking();
setInterval(checkExistingBooking, 10000); // every 10 sec