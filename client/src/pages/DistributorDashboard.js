import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DistributorDashboard() {
  const [stock, setStock] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchStock = async () => {
    const res = await fetch(
      "http://localhost:5000/api/distributor-dashboard/stock",
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    );

    const data = await res.json();
    setStock(data.stock);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const updateStock = async () => {
    await fetch(
      "http://localhost:5000/api/distributor-dashboard/stock",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ stock })
      }
    );

    alert("✅ Stock updated");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">
          📦 Distributor Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* STOCK CARD */}
      <div className="bg-gray-800 p-6 rounded-xl mb-6 shadow-lg">
        <h2 className="text-xl mb-4">📦 Manage Stock</h2>

        <p className="mb-2 text-gray-400">
          Current Stock
        </p>

        <p className="text-3xl font-bold mb-4">{stock}</p>

        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="p-2 rounded text-black w-40"
        />

        <button
          onClick={updateStock}
          className="ml-4 bg-green-500 px-4 py-2 rounded"
        >
          Update
        </button>
      </div>

      {/* ACTIONS */}
      <div className="grid md:grid-cols-3 gap-6">

        <button
          onClick={() => navigate("/history")}
          className="bg-purple-500 p-6 rounded-xl"
        >
          📜 View Bookings
        </button>

        <button
          onClick={() => navigate("/track")}
          className="bg-blue-500 p-6 rounded-xl"
        >
          🚚 Track Deliveries
        </button>

        <button
          onClick={() => navigate("/complaint")}
          className="bg-yellow-500 p-6 rounded-xl"
        >
          ⚠ Complaints
        </button>

      </div>

    </div>
  );
}