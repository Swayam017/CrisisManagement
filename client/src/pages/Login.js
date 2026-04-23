import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate(); // ✅ REQUIRED

  const handleLogin = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", data.token);

      alert("Login successful ✅");

      // 🔥 CHECK DISTRIBUTOR FLOW
      const distributorId = localStorage.getItem("selectedDistributor");

      if (distributorId) {
        navigate(`/kyc?distributorId=${distributorId}`);
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.log(err);
      alert("Login error");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">

      <div className="bg-gray-800 p-8 rounded-xl w-80 shadow-lg">
        <h2 className="text-2xl mb-6 font-semibold text-center">
          Login
        </h2>

        <input
          className="w-full p-2 mb-3 rounded text-black"
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full p-2 mb-4 rounded text-black"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleLogin}
          className="w-full bg-orange-500 p-2 rounded font-semibold hover:bg-orange-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}