// auth.js

// ============================================
// API URL
// ============================================
const API_URL = "https://nyumbakwetu-backend.vercel.app/api";

// ============================================
// SIGNUP FORM
// ============================================
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const jina = document.getElementById("jina").value.trim();
    const email = document.getElementById("email").value.trim();
    const simu = document.getElementById("simu").value.trim();
    const password = document.getElementById("password").value;
    const aina = document.querySelector('input[name="aina"]:checked').value;

    const messageEl = document.getElementById("message");
    const button = signupForm.querySelector("button");

    // Validation
    if (password.length < 6) {
      onyeshaMessage("Password inapaswa kuwa na herufi 6 au zaidi", "error");
      return;
    }

    // Disable button
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Inasajili...';

    try {
      const response = await fetch(API_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jina, email, simu, password, aina })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.kosa || "Usajili umeshindikana");
      }

      // Hifadhi token na mtumiaji
      localStorage.setItem("token", data.token);
      localStorage.setItem("mtumiaji", JSON.stringify(data.mtumiaji));

      onyeshaMessage("Usajili umefanikiwa! Tunakupeleka...", "success");

      // Nenda dashboard
      setTimeout(() => {
       if (data.mtumiaji.aina === "admin") {
  window.location.href = "admin-dashboard.html";
} else if (data.mtumiaji.aina === "landlord") {
//  window.location.href = "landlord-dashboard.html";
} else {
 // window.location.href = "tenant-dashboard.html";
}
      }, 1500);

    } catch (error) {
      onyeshaMessage(error.message, "error");
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-user-plus"></i> Jisajili';
    }
  });
}

// ============================================
// LOGIN FORM
// ============================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const messageEl = document.getElementById("message");
    const button = loginForm.querySelector("button");

    // Disable button
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Inaingia...';

    try {
      const response = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.kosa || "Kuingia kumeshindikana");
      }

      // Hifadhi token na mtumiaji
      localStorage.setItem("token", data.token);
      localStorage.setItem("mtumiaji", JSON.stringify(data.mtumiaji));

      onyeshaMessage("Kuingia kumefanikiwa! Tunakupeleka...", "success");

      // Nenda dashboard
      setTimeout(() => {
       if (data.mtumiaji.aina === "admin") {
  window.location.href = "admin-dashboard.html";
} else if (data.mtumiaji.aina === "landlord") {
  window.location.href = "landlord-dashboard.html";
} else {
  window.location.href = "tenant-dashboard.html";
}
      }, 1500);

    } catch (error) {
      onyeshaMessage(error.message, "error");
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Ingia';
    }
  });
}




// Baada ya localStorage.setItem("mtumiaji", JSON.stringify(data.mtumiaji));
var params = new URLSearchParams(window.location.search);
var redirectUrl = params.get("redirect");
if (redirectUrl) {
  window.location.href = redirectUrl;
  return;
}
// endelea na code yako ya kawaida ya kupeleka dashboard

// ============================================
// KAZI YA KUONYESHA MESSAGE
// ============================================
function onyeshaMessage(ujumbe, aina) {
  const messageEl = document.getElementById("message");
  if (!messageEl) return;

  messageEl.textContent = ujumbe;
  messageEl.className = "message " + aina;

  // Futa baada ya sekunde 5
  setTimeout(() => {
    messageEl.className = "message";
  }, 5000);
}

console.log("✅ auth.js imepakiwa!");