const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const userRoutes = require("./routes/userRoutes");
//require("./scheduler/scheduler");
try {
  require("./workers/bookingWorker");
  console.log("✅ Worker loaded successfully");
} catch (err) {
  console.log("❌ Worker load failed:", err);
}


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", aiRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/distributors", distributorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/complaints", require("./routes/ComplaintRoutes"));


connectDB();
 

app.listen(5000, () => console.log("Server running on port 5000"));