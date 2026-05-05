require("dotenv").config(); // ✅ load env

const bookingQueue = require("./queues/bookingQueue");

async function clear() {
  try {
    await bookingQueue.obliterate({ force: true });
    console.log("🔥 Queue cleared successfully");
  } catch (err) {
    console.error("❌ Error clearing queue:", err.message);
  } finally {
    process.exit(0);
  }
}

clear();