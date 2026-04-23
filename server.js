const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); // ✅ FIRST

const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const aiRoutes = require("./routes/aiRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const userRoutes = require("./routes/userRoutes");

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

// ✅ CONNECT DB FIRST
connectDB()
  .then(() => {
    console.log("✅ DB Connected");

    // ✅ THEN start worker
   require("./workers/bookingWorker");
  console.log("🔥 Worker started");

    // ✅ THEN start server
   const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
  });