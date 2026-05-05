import { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json();
      setUsers(data.users);
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-6">
        👤 All Users
      </h1>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">

        <table className="w-full text-left">

          <thead className="bg-gray-800 text-gray-300 uppercase text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-b border-gray-800 hover:bg-gray-800 transition"
              >
                <td className="p-4 font-medium">
                  {u.name}
                </td>

                <td className="p-4 text-gray-400">
                  {u.email}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded text-sm ${
                      u.role === "ADMIN"
                        ? "bg-orange-500"
                        : u.role === "DISTRIBUTOR"
                        ? "bg-blue-500"
                        : "bg-gray-700"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}