import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSignup = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
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

      alert("Signup successful ✅");

      // 👉 redirect to login
      window.location.href = "/login";

    } catch (err) {
      console.log(err);
      alert("Signup error");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">

      <div className="bg-gray-800 p-8 rounded-xl w-80 shadow-lg">
        <h2 className="text-2xl mb-4 text-center">Create Account</h2>

        <input
          className="w-full p-2 mb-3 text-black rounded"
          placeholder="Name"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="w-full p-2 mb-3 text-black rounded"
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          className="w-full p-2 mb-4 text-black rounded"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button
          onClick={handleSignup}
          className="w-full bg-orange-500 p-2 rounded hover:bg-orange-600 transition"
        >
          Signup
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            className="text-orange-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}