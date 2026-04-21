// 🔥 AUTO REDIRECT IF KYC ALREADY DONE
window.onload = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/user/profile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const user = await res.json();

    // ✅ If already KYC done → skip page
    if (user.kyc && user.kyc.verified) {
      alert("You are already registered ✅");
      window.location.href = "booking.html";
    }

  } catch (err) {
    console.error("Profile check failed:", err);
  }
};


// 🔥 SUBMIT KYC
async function submitKYC() {
  const token = localStorage.getItem("token");
  const distributorId = localStorage.getItem("selectedDistributor");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const idType = document.getElementById("idType").value;
  const idNumber = document.getElementById("idNumber").value;

  if (!phone || !address || !idNumber) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/user/kyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        phone,
        address,
        idType,
        idNumber,
        distributorId
      })
    });

    const data = await res.json();

    // 🔥 HANDLE BOTH CASES
    if (!res.ok) {
      alert(data.message);

      // ✅ Already completed → redirect
      if (data.message.toLowerCase().includes("already")) {
        window.location.href = "booking.html";
      }

      return;
    }

    alert("KYC Completed Successfully ✅");

    window.location.href = "booking.html";

  } catch (err) {
    console.error(err);
    alert("Error submitting KYC");
  }
}