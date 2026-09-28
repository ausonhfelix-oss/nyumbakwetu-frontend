// admin-dashboard.js — NyumbaKwetu Admin

var API_URL = "https://nyumbakwetu-backend.vercel.app/api";

var nyumbaZote = [];
var filterYaSasa = "all";

document.addEventListener("DOMContentLoaded", function () {
  var mtumiajiStr = localStorage.getItem("mtumiaji");
  if (!mtumiajiStr) {
    alert("Tafadhali ingia kwanza!");
    window.location.href = "login.html";
    return;
  }

  var mtumiaji = JSON.parse(mtumiajiStr);

  if (mtumiaji.aina !== "admin") {
    alert("Huna ruhusa ya kuingia hapa!");
    window.location.href = "index.html";
    return;
  }

  var adminJina = document.getElementById("adminJina");
  if (adminJina) adminJina.textContent = mtumiaji.jina;

  var tabFilters = document.querySelectorAll(".tab-filter");
  tabFilters.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabFilters.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      filterYaSasa = tab.getAttribute("data-filter");
      onyeshaNyumba();
    });
  });

  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("mtumiaji");
      window.location.href = "login.html";
    });
  }

  chukuaNyumbaZote();
});


async function chukuaNyumbaZote() {
  var token = localStorage.getItem("token");

  try {
    var response = await fetch(API_URL + "/properties/admin/zote", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok) {
      throw new Error("Imeshindikana kupata nyumba: " + response.status);
    }

    var data = await response.json();
    nyumbaZote = data.nyumba;

    console.log("Nyumba zimepakiwa:", nyumbaZote.length);

    sasishaStats();
    onyeshaNyumba();

  } catch (error) {
    console.error("Error:", error.message);
    document.getElementById("orodhaYaNyumbaAdmin").innerHTML =
      "<p style='text-align:center;padding:40px;color:red;'>" +
      "Imeshindikana kupata nyumba: " + error.message + "</p>";
  }
}


function sasishaStats() {
  var pending = 0;
  var live = 0;

  nyumbaZote.forEach(function (n) {
    if (n.hali === "Pending") pending++;
    if (n.hali === "Live") live++;
  });

  document.getElementById("statPending").textContent = pending;
  document.getElementById("statLive").textContent = live;
  document.getElementById("statTotal").textContent = nyumbaZote.length;
}


function onyeshaNyumba() {
  var container = document.getElementById("orodhaYaNyumbaAdmin");
  if (!container) return;

  var nyumbaKuonyesha = nyumbaZote;
  if (filterYaSasa !== "all") {
    nyumbaKuonyesha = nyumbaZote.filter(function (n) {
      return n.hali === filterYaSasa;
    });
  }

  if (nyumbaKuonyesha.length === 0) {
    container.innerHTML =
      "<p style='text-align:center;padding:40px;color:#888;font-size:16px;'>" +
      "Hakuna nyumba kwenye kundi hili.</p>";
    return;
  }

  var html = "";

  nyumbaKuonyesha.forEach(function (n) {
    var id = n["_id"];
    var picha = "images/house1.jpg";
    if (n.picha && n.picha.length > 0 && n.picha[0]) {
      picha = n.picha[0];
    }

    var haliClass = n.hali === "Live" ? "badge-live" : "badge-pending";
    var haliText = n.hali === "Live" ? "Live" : "Inasubiri";

    var mmilikiJina = n.mmiliki ? n.mmiliki.jina : "Haijulikani";
    var mmilikiSimu = n.mmiliki ? (n.mmiliki.simu || "Hakuna simu") : "-";

    var kitufe = "";
    if (n.hali === "Pending") {
      kitufe = '<button class="btn-thibitisha" onclick="thibitishaNyumba(\'' + id + '\')">' +
               '<i class="fa-solid fa-check"></i> Thibitisha</button>';
    }

    html += '<div class="property-admin-card">' +
      '<img src="' + picha + '" alt="Nyumba">' +
      '<div class="property-admin-info">' +
        '<h3>' + n.jina + '</h3>' +
        '<p><i class="fa-solid fa-location-dot"></i> ' + (n.eneo || "") + ', ' + (n.mkoa || "") + '</p>' +
        '<p><i class="fa-solid fa-money-bill"></i> TZS ' + (n.bei || 0).toLocaleString() + '</p>' +
        '<p><i class="fa-solid fa-user"></i> ' + mmilikiJina + ' — ' + mmilikiSimu + '</p>' +
        '<span class="badge-hali ' + haliClass + '">' + haliText + '</span>' +
      '</div>' +
      '<div class="property-admin-actions">' +
        kitufe +
        '<button class="btn-futa" onclick="futaNyumba(\'' + id + '\')">' +
          '<i class="fa-solid fa-trash"></i> Futa' +
        '</button>' +
      '</div>' +
    '</div>';
  });

  container.innerHTML = html;
}


async function thibitishaNyumba(id) {
  if (!confirm("Una uhakika unataka kuthibitisha nyumba hii?")) return;

  var token = localStorage.getItem("token");

  try {
    var response = await fetch(API_URL + "/properties/admin/thibitisha/" + id, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    var result = await response.json();

    if (!response.ok) {
      throw new Error(result.kosa || "Imeshindikana kuthibitisha");
    }

    alert("Nyumba imethibitishwa! Sasa inaonekana kwenye tovuti.");

    chukuaNyumbaZote();

  } catch (error) {
    alert("Error: " + error.message);
  }
}


async function futaNyumba(id) {
  if (!confirm("Una uhakika unataka kufuta nyumba hii?")) return;

  var token = localStorage.getItem("token");

  try {
    var response = await fetch(API_URL + "/properties/admin/futa/" + id, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    var result = await response.json();

    if (!response.ok) {
      throw new Error(result.kosa || "Imeshindikana kufuta");
    }

    alert("Nyumba imefutwa!");

    chukuaNyumbaZote();

  } catch (error) {
    alert("Error: " + error.message);
  }
}


window.thibitishaNyumba = thibitishaNyumba;
window.futaNyumba = futaNyumba;

// ==========================================
// LOGOUT: Mobile
// ==========================================
var logoutBtnMobile = document.getElementById("logoutBtnMobile");

if (logoutBtnMobile) {
  logoutBtnMobile.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Una uhakika unataka kutoka?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("mtumiaji");
      window.location.href = "login.html";
    }
  });
}

console.log("admin-dashboard.js imepakiwa!");