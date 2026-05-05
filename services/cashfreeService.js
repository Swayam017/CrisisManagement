const { Cashfree, CFEnvironment } = require("cashfree-pg");

// ✅ Environment setup
const env =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX;

// ✅ Initialize instance
const cashfree = new Cashfree(
  env,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET_KEY
);

exports.createOrder = async ({ amount, user }) => {
  try {
    const orderId = "order_" + Date.now();

    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    const request = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,

      customer_details: {
        customer_id: user._id.toString(),
        customer_phone: user.phone || "9999999999" // fallback
      },

      payment_methods: "cc,nb,upi,paylater",

order_meta: {
  notify_url: `${process.env.APP_BASE_URL}/api/webhook`,
 // return_url: `${process.env.APP_BASE_URL}/payment-status?order_id=${orderId}`
},

      order_expiry_time: expiryDate.toISOString()
    };

    const response = await cashfree.PGCreateOrder(request);

    return {
      orderId,
      paymentSessionId: response.data.payment_session_id
    };

  } catch (error) {
    console.error("❌ CASHFREE ERROR:", error.response?.data || error.message);
    throw error;
  }
};
exports.getPaymentStatusFromCF = async (orderId) => {
  try {
    console.log("🔍 Checking payment status for:", orderId);

    const response = await cashfree.PGFetchOrder(orderId);

    const order = response.data;

    console.log("💰 Cashfree Order:", order);

    if (order.order_status === "PAID") {
      return "SUCCESS";
    } else if (order.order_status === "ACTIVE") {
      return "PENDING";
    } else {
      return "FAILED";
    }

  } catch (error) {
    console.error(
      "❌ Payment status error:",
      error.response?.data || error.message
    );
    return "FAILED";
  }
};