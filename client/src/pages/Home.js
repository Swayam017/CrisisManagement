import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDistributors } from "../services/api";

export default function Home() {
  const [distributors, setDistributors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      const data = await getDistributors();
      setDistributors(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen">

      {/* 🔥 HERO */}
      <section className="text-center py-20 px-6 bg-gradient-to-br from-orange-500 to-red-600">
        <h1 className="text-5xl font-bold mb-4">
          🔥 LPG Smart System
        </h1>

        <p className="text-lg mb-6">
          Transparent & fraud-free LPG distribution 🚀
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/signup")}
            className="border px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Signup
          </button>
        </div>
      </section>

      {/* 🏢 DISTRIBUTORS (VIEW ONLY) */}
      <section className="p-10">
        <h2 className="text-3xl font-semibold mb-6">
          Nearby Distributors
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {distributors.map((d) => (
            <div
              key={d._id}
              className="bg-gray-800 p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-bold text-orange-400">
                {d.name}
              </h3>

              <p className="text-gray-400">{d.location}</p>
              <p className="text-gray-400">📞 {d.contact}</p>

              <p className="mt-4 text-sm text-gray-500">
                Login to register with this distributor
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 💰 PRICE */}
      <section className="p-10 bg-gray-900">
        <h2 className="text-3xl mb-4 font-semibold">
          LPG Price
        </h2>

        <div className="bg-gray-800 p-6 rounded-xl">
          <p className="text-4xl text-green-400 font-bold">
            ₹1100
          </p>
          <p className="text-gray-400">Updated monthly</p>
        </div>
      </section>

      {/* ⚡ FOOTER */}
      <footer className="text-center p-6 bg-gray-900 text-gray-500">
        © 2026 LPG Smart System 🚀
      </footer>
    </div>
  );
}