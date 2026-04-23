import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDistributors } from "../services/api";

export default function SelectDistributor() {
  const [distributors, setDistributors] = useState([]);
  const navigate = useNavigate();

  // ✅ FIX: wrap in useCallback
  const fetchDistributors = useCallback(async () => {
    try {
      const data = await getDistributors();
      setDistributors(data);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]); // ✅ now safe

  const handleSelect = (id) => {
    navigate(`/kyc?distributorId=${id}`);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-10">

      <h2 className="text-3xl mb-6 font-bold">
        Select Your Distributor
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {distributors.map((d) => (
          <div
            key={d._id}
            className="bg-gray-800 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-xl text-orange-400 font-bold">
              {d.name}
            </h3>

            <p className="text-gray-400">{d.location}</p>
            <p className="text-gray-400">📞 {d.contact}</p>

            <button
              onClick={() => handleSelect(d._id)}
              className="mt-4 w-full bg-orange-500 p-2 rounded hover:bg-orange-600"
            >
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}