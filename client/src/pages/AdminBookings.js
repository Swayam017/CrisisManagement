import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      setBookings(data.bookings);
    };

    fetchBookings();
  }, []);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-6">
        📦 All Bookings
      </h1>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">

        <table className="w-full text-left">

          {/* HEADER */}
          <thead className="bg-gray-800 text-gray-300 uppercase text-sm">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Address</th>
              <th className="p-4">Status</th>
              <th className="p-4">Fraud</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {bookings.map((b, index) => (
              <tr
                key={b._id}
                className={`border-b border-gray-800 hover:bg-gray-800 transition ${
                  b.aiFlag === "FRAUD" ? "bg-red-500/20" : ""
                }`}
              >
                <td className="p-4 font-medium">
                  {b.userId?.name}
                </td>

                <td className="p-4 text-gray-400">
                  {b.address}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded bg-green-600 text-sm">
                    {b.status}
                  </span>
                </td>

                <td className="p-4">
                  {b.aiFlag === "FRAUD" ? (
                    <span className="text-red-400 font-bold">
                      🚨 FRAUD
                    </span>
                  ) : (
                    <span className="text-green-400">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}