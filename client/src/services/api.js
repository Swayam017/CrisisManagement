const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

// 🔐 Helper
const getHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
});

// =======================
// AUTH
// =======================
export const loginUser = async (data) => {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
};

export const signupUser = async (data) => {
  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
};

// =======================
// DISTRIBUTORS
// =======================
export const getDistributors = async () => {
  const res = await fetch(`${API}/api/distributors`);
  return res.json();
};

// =======================
// KYC
// =======================
export const submitKYC = async (token, data) => {
  const res = await fetch(`${API}/api/user/kyc`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
};

// =======================
// PROFILE
// =======================
export const getProfile = async (token) => {
  const res = await fetch(`${API}/api/user/profile`, {
    headers: getHeaders(token)
  });

  return res.json();
};

// =======================
// BOOKING
// =======================
export const createBooking = async (token, data) => {
  const res = await fetch(`${API}/api/bookings/create`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(data)
  });

  return res.json();
};

export const getMyBooking = async (token) => {
  const res = await fetch(`${API}/api/bookings/my-booking`, {
    headers: getHeaders(token)
  });

  return res.json();
};