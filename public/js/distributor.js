async function findDistributors() {

  // 🚫 Prevent re-selection
  const kycDone = localStorage.getItem("kycDone");

  if (kycDone === "true") {
    alert("You are already registered with a distributor");
    window.location.href = "booking.html";
    return;
  }

  const address = document.getElementById("address").value;

  if (!address) {
    alert("Enter address");
    return;
  }

  const res = await fetch(`http://localhost:5000/api/distributors?address=${address}`);
  const data = await res.json();

  let html = "<h4>Select Distributor</h4>";

  data.forEach(d => {
    html += `
      <div class="card p-3 mb-2">
        <h5>${d.name}</h5>
        <p>${d.location}</p>
        <p>📞 ${d.contact}</p>

        <button onclick="selectDistributor('${d._id}')"
          class="btn btn-success">
          Select
        </button>
      </div>
    `;
  });

  document.getElementById("distributors").innerHTML = html;
}

function selectDistributor(id) {
  localStorage.setItem("selectedDistributor", id);

  alert("Distributor selected. Complete KYC.");

  window.location.href = "kyc.html";
}