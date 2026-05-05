import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import KYC from "./pages/KYC";
import Dashboard from "./pages/Dashboard";
import SelectDistributor from "./pages/SelectDistributor";
import BookCylinder from "./pages/BookCylinder";
import History from "./pages/History";
import Complaint from "./pages/Complaint";
import TrackDelivery from "./pages/TrackDelivery";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";



function App() {
  return (
<Router>
  <Routes>

    {/* 🌐 Public */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* 🔐 Flow */}
    <Route path="/select-distributor" element={<SelectDistributor />} />
    <Route path="/kyc" element={<KYC />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/book" element={<BookCylinder />} />
  
    {/* 📦 Other */}
    <Route path="/history" element={<History />} />
    <Route path="/complaint" element={<Complaint />} />
    <Route path="/track" element={<TrackDelivery />} />

    <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
 

<Route path="/admin/bookings" element={<AdminBookings />} />
<Route path="/admin/users" element={<AdminUsers />} />


<Route
  path="/distributor"
  element={
    <ProtectedRoute allowedRoles={["DISTRIBUTOR"]}>
      <DistributorDashboard />
    </ProtectedRoute>
  }
/>

  </Routes>
</Router>
  );
}

export default App;