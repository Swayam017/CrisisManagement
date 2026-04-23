import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function KYC() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    phone: "",
    address: "",
    idType: "Aadhar",
    idNumber: ""
  });

  const [loading, setLoading] = useState(false);

  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // ✅ distributor from URL
  const distributorId = searchParams.get("distributorId");

  // 🔥 FULL SAFETY CHECK
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");

      // ❌ Not logged in
      if (!token) {
        navigate("/login");
        return;
      }

      // ❌ No distributor selected
      if (!distributorId) {
        alert("Please select distributor first");
        navigate("/select-distributor");
        return;
      }

      try {
        // ✅ Fetch user profile
        const res = await fetch(`${API}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const user = await res.json();

        // 🔥 IMPORTANT: Already KYC done
        if (user?.kyc?.verified) {
          alert("You are already registered ✅");
          navigate("/dashboard");
        }

      } catch (err) {
        console.log("Profile check error:", err);
      }
    };

    checkUser();
  }, [distributorId, navigate, API]);

  // 🔥 SUBMIT KYC
  const submitKYC = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login first");
      navigate("/login");
      return;
    }

    if (!form.phone || !form.address || !form.idNumber) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/user/kyc`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          distributorId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("KYC Completed ✅");

      navigate("/dashboard");

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">

      <div className="bg-gray-800 w-full max-w-md p-8 rounded-2xl shadow-2xl">

        <h2 className="text-2xl font-bold text-orange-400 text-center mb-2">
          📝 Complete KYC
        </h2>

        <p className="text-gray-400 text-center mb-6 text-sm">
          Verify your identity to activate LPG services
        </p>

        {/* PHONE */}
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full mb-4 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500"
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
        />

        {/* ADDRESS */}
        <input
          type="text"
          placeholder="Address"
          className="w-full mb-4 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500"
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />

        {/* ID TYPE */}
        <select
          className="w-full mb-4 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500"
          onChange={(e) =>
            setForm({ ...form, idType: e.target.value })
          }
        >
          <option value="Aadhar">Aadhar</option>
          <option value="PAN">PAN</option>
        </select>

        {/* ID NUMBER */}
        <input
          type="text"
          placeholder="ID Number"
          className="w-full mb-6 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:ring-2 focus:ring-orange-500"
          onChange={(e) =>
            setForm({ ...form, idNumber: e.target.value })
          }
        />

        {/* BUTTON */}
        <button
          onClick={submitKYC}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 p-3 rounded-lg font-semibold transition"
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>

      </div>
    </div>
  );
}