const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const username = document.getElementById("username");

// UI control only (NO AUTO REDIRECT)
if (token && user) {
  loginBtn.style.display = "none";
  signupBtn.style.display = "none";
  logoutBtn.style.display = "block";

  username.innerText = "👤 " + user.name;
} else {
  logoutBtn.style.display = "none";
}

// Logout
function logout() {
  localStorage.clear();
  alert("Logged out successfully");
  window.location.href = "login.html";
}