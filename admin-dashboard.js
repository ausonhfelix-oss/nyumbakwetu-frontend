// ==========================================
// admin-dashboard.js — NyumbaKwetu Admin (Sahihi)
// ==========================================

var API_URL = "https://nyumbakwetu-backend.vercel.app/api";
var nyumbaZote = [];
var watumiajiWote = [];
var filterYaSasa = "all";
var filterAina = "all";
var tabKu = "nyumba";

document.addEventListener("DOMContentLoaded", function () {
  var mtumiajiStr = localStorage.getItem("mtumiaji");
  if (!mtumiajiStr) {
    alert("Tafadhali ingia kwanza!");
    window.location.href = "login.html";
    return;
  }

  var mtumiaji = JSON.parse(mtumiajiStr);
  if (mtumiaji.aina !== "admin") {
    alert("Huna ruhusa!");
    window.location.href = "index.html";
    return;
  }

  var adminJina = document.getElementById("adminJina");
  if (adminJina) adminJina.textContent = mtumiaji.jina;

  // TABS KUU (Nyumba / Watumiaji)
  var mainTabs = document.querySelectorAll("[data-main]");
  mainTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      mainTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      tabKu = tab.getAttribute("data-main");

      document.getElementById("sehemuYaNyumba").style.display =
        tabKu === "nyumba" ? "block" : "none";
      document.getElementById("sehemuYaWatumiaji").style.display =
        tabKu === "watumiaji" ? "block" : "none";

      if (tabKu === "watumiaji" && watumiajiWote.length === 0) {
        chukuaWatumiaji();
      }
    });
  });

  // TABS ZA NYUMBA
  var tabFilters = document.querySelectorAll("#sehemuYaNyumba [data-filter]");
  tabFilters.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabFilters.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      filterYaSasa = tab.getAttribute("data-filter");
      onyeshaNyumba();
    });
  });

  // TABS ZA WATUMIAJI
  var tabAina = document.querySelectorAll("#sehemuYaWatumiaji [data-aina]");
  tabAina.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabAina.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      filterAina = tab.getAttribute("data-aina");
      onyeshaWatumiaji();
    });
  });

  // LOGOUT
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("mtumiaji");
      window.location.href = "login.html";
    });
  }

  var logoutBtnMobile = document.getElementById("logoutBtnMobile");
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Una uhakika?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("mtumiaji");
        window.location.href = "login.html";
      }
    });
  }

  chukuaNyumbaZote();
});


// ==========================================
// CHUKUA NYUMBA
// ==========================================
async function chukuaNyumbaZote() {
  var token = localStorage.getItem("token");
  try {
    var response = await fetch(API_URL + "/properties/admin/zote", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!response.ok) throw new Error("Status " + response.status);
    var data = await response.json();
    nyumbaZote = data.nyumba || [];
    sasishaStats();
    onyeshaNyumba();
  } catch (error) {
    document.getElementById("orodhaYaNyumbaAdmin").innerHTML =
      "<p style='text-align:center;padding:40px;color:red;'>" +
      "Imeshindikana kupata nyumba: " + error.message + "</p>";
  }
}


// ==========================================
// CHUKUA WATUMIAJI
// ==========================================
async function chukuaWatumiaji() {
  var token = localStorage.getItem("token");
  try {
    var response = await fetch(API_URL + "/admin/users", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!response.ok) throw new Error("Status " + response.status);
    var data = await response.json();
    watumiajiWote = data.watumiaji || [];
    onyeshaWatumiaji();
  } catch (error) {
    document.getElementById("orodhaYaWatumiaji").innerHTML =
      "<p style='text-align:center;padding:40px;color:red;'>" +
      "Imeshindikana kupata watumiaji: " + error.message + "</p>";
  }
}


// ==========================================
// STATS
// ==========================================
function sasishaStats() {
  var pending = 0, live = 0;
  nyumbaZote.forEach(function (n) {
    if (n.hali === "Pending") pending++;
    if (n.hali === "Live") live++;
  });
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statLive").textContent = live;
  document.getElementById("statTotal").textContent = nyumbaZote.length;
}


// ==========================================
// ONYESHA NYUMBA
// ==========================================
function onyeshaNyumba() {
  var container = document.getElementById("orodhaYaNyumbaAdmin");
  if (!container) return;

  var list = nyumbaZote;
  if (filterYaSasa !== "all") {
    list = nyumbaZote.filter(function (n) { return n.hali === filterYaSasa; });
  }

  if (list.length === 0) {
    container.innerHTML =
      "<p style='text-align:center;padding:40px;color:#888;'>Hakuna nyumba hapa.</p>";
    return;
  }

  var html = "";
  list.forEach(function (n) {
    var id = n["_id"];
    var pichaZote = (n.picha && n.picha.length > 0) ? n.picha : ["Images/house1.jpg"];

    var haliClass = n.hali === "Live" ? "badge-live" : "badge-pending";
    var haliText = n.hali === "Live" ? "Live" : "Inasubiri";

    var mmilikiJina = n.mmiliki ? n.mmiliki.jina : "Haijulikani";
    var mmilikiSimu = n.mmiliki ? (n.mmiliki.simu || "Hakuna") : "-";

    // Hali ya nyumba (Inapatikana / Imepangishwa)
    var haliNyumba = n.haliNyumba || "Inapatikana";
    var haliNyumbaColor = haliNyumba === "Imepangishwa" ? "#16a34a" : "#f59e0b";
    var haliNyumbaIcon = haliNyumba === "Imepangishwa" ? "fa-check-circle" : "fa-home";

    var kitufe = "";
    if (n.hali === "Pending") {
      kitufe = '<button class="btn-thibitisha" onclick="thibitishaNyumba(\'' + id + '\')">' +
               '<i class="fa-solid fa-check"></i> Thibitisha</button>';
    }

    var slideshowHtml =
      '<div class="slideshow" data-current="0" data-images=\'' + JSON.stringify(pichaZote) + '\'>' +
        '<img src="' + pichaZote[0] + '" class="slide-main" alt="Nyumba">' +
        '<div class="slide-counter">1 / ' + pichaZote.length + '</div>' +
        (pichaZote.length > 1 ?
          '<button class="slide-prev" onclick="badilishaPicha(this, -1)">&#9668;</button>' +
          '<button class="slide-next" onclick="badilishaPicha(this, 1)">&#9658;</button>' : '') +
        '<div class="slide-dots">' +
          pichaZote.map(function(p, i) {
            return '<span class="dot' + (i === 0 ? ' active' : '') + '" ' +
                   'onclick="nendaPicha(this, ' + i + ')"></span>';
          }).join('') +
        '</div>' +
      '</div>';

    html += '<div class="property-admin-card">' +
      slideshowHtml +
      '<div class="property-admin-info">' +
        '<h3>' + n.jina + '</h3>' +
        '<p><i class="fa-solid fa-location-dot"></i> ' + (n.eneo || "") + ', ' + (n.mkoa || "") + '</p>' +
        '<p><i class="fa-solid fa-money-bill"></i> TZS ' + (n.bei || 0).toLocaleString() + '</p>' +
        '<p><i class="fa-solid fa-user"></i> ' + mmilikiJina + ' — ' + mmilikiSimu + '</p>' +

        '<p style="background:' + haliNyumbaColor + '22;color:' + haliNyumbaColor +
        ';padding:6px 10px;border-radius:6px;font-weight:600;font-size:13px;display:inline-block;margin-top:6px;">' +
          '<i class="fa-solid ' + haliNyumbaIcon + '"></i> ' + haliNyumba +
        '</p>' +

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


// ==========================================
// ONYESHA WATUMIAJI
// ==========================================
function onyeshaWatumiaji() {
  var container = document.getElementById("orodhaYaWatumiaji");
  if (!container) return;

  var list = watumiajiWote;
  if (filterAina !== "all") {
    list = watumiajiWote.filter(function (w) { return w.aina === filterAina; });
  }

  if (list.length === 0) {
    container.innerHTML =
      "<p style='text-align:center;padding:40px;color:#888;'>Hakuna watumiaji hapa.</p>";
    return;
  }

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">';

  list.forEach(function (w) {
    var ainaRangi = "#3b82f6";
    var ainaJina = "Mpangaji";
    var ainaIcon = "fa-user";

    if (w.aina === "landlord") {
      ainaRangi = "#16a34a";
      ainaJina = "Mpangishaji";
      ainaIcon = "fa-user-tie";
    } else if (w.aina === "admin") {
      ainaRangi = "#dc2626";
      ainaJina = "Admin";
      ainaIcon = "fa-user-shield";
    }

    html +=
      '<div style="background:#f9f9f9;border-radius:12px;padding:16px;border-left:4px solid ' + ainaRangi + ';">' +

        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">' +
          '<div style="width:48px;height:48px;border-radius:50%;background:' + ainaRangi + ';' +
          'display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">' +
            '<i class="fa-solid ' + ainaIcon + '"></i>' +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<h4 style="margin:0 0 4px 0;color:#1a5c2e;font-size:15px;overflow:hidden;' +
            'text-overflow:ellipsis;white-space:nowrap;">' + w.jina + '</h4>' +
            '<span style="padding:2px 8px;border-radius:12px;background:' + ainaRangi + '22;' +
            'color:' + ainaRangi + ';font-size:11px;font-weight:600;">' + ainaJina + '</span>' +
          '</div>' +
        '</div>' +

        '<div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:12px;">' +
          '<div><i class="fa-solid fa-envelope" style="width:16px;"></i> ' + (w.email || "-") + '</div>' +
          '<div><i class="fa-solid fa-phone" style="width:16px;"></i> ' + (w.simu || "-") + '</div>' +
          '<div><i class="fa-regular fa-calendar" style="width:16px;"></i> ' +
            'Alijisajili: ' + (w.createdAt ? new Date(w.createdAt).toLocaleDateString("sw-TZ") : "-") + '</div>' +
        '</div>' +

        (w.aina !== "admin" ?
          '<button onclick="futaMtumiaji(\'' + w._id + '\', \'' + w.jina.replace(/'/g, "\\'") + '\')" ' +
          'style="width:100%;padding:10px;background:#dc2626;color:white;border:none;' +
          'border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;">' +
            '<i class="fa-solid fa-trash"></i> Futa Mtumiaji' +
          '</button>' :
          '<p style="margin:0;color:#999;font-size:12px;text-align:center;">Admin hawezi kufutwa</p>'
        ) +

      '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}


// ==========================================
// FUTA MTUMIAJI
// ==========================================
async function futaMtumiaji(id, jina) {
  if (!confirm("Una uhakika unataka kumfuta " + jina + "?\n\nNyumba zote zake na maombi yake pia yatafutwa!")) {
    return;
  }

  var token = localStorage.getItem("token");
  try {
    var response = await fetch(API_URL + "/admin/users/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    });

    var data = await response.json();
    if (!response.ok) throw new Error(data.kosa || "Imeshindikana");

    alert("✅ Mtumiaji amefutwa!");
    watumiajiWote = [];
    chukuaWatumiaji();

  } catch (error) {
    alert("❌ " + error.message);
  }
}


// ==========================================
// THIBITISHA NYUMBA
// ==========================================
async function thibitishaNyumba(id) {
  if (!confirm("Una uhakika?")) return;
  var token = localStorage.getItem("token");
  try {
    var response = await fetch(API_URL + "/properties/admin/thibitisha/" + id, {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token }
    });
    var result = await response.json();
    if (!response.ok) throw new Error(result.kosa || "Imeshindikana");
    alert("✅ Nyumba imethibitishwa!");
    chukuaNyumbaZote();
  } catch (error) {
    alert("❌ " + error.message);
  }
}


// ==========================================
// FUTA NYUMBA
// ==========================================
async function futaNyumba(id) {
  if (!confirm("Una uhakika unataka kufuta nyumba hii?")) return;
  var token = localStorage.getItem("token");
  try {
    var response = await fetch(API_URL + "/properties/admin/futa/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    });
    var result = await response.json();
    if (!response.ok) throw new Error(result.kosa || "Imeshindikana");
    alert("✅ Nyumba imefutwa!");
    chukuaNyumbaZote();
  } catch (error) {
    alert("❌ " + error.message);
  }
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================
window.thibitishaNyumba = thibitishaNyumba;
window.futaNyumba = futaNyumba;
window.futaMtumiaji = futaMtumiaji;


// ==========================================
// SLIDESHOW
// ==========================================
window.badilishaPicha = function(btn, direction) {
  var slideshow = btn.closest(".slideshow");
  var images = JSON.parse(slideshow.dataset.images);
  var current = parseInt(slideshow.dataset.current) || 0;
  var next = current + direction;
  if (next < 0) next = images.length - 1;
  if (next >= images.length) next = 0;
  slideshow.dataset.current = next;
  slideshow.querySelector(".slide-main").src = images[next];
  slideshow.querySelector(".slide-counter").textContent = (next + 1) + " / " + images.length;
  slideshow.querySelectorAll(".dot").forEach(function(dot, i) {
    dot.classList.toggle("active", i === next);
  });
};

window.nendaPicha = function(dot, index) {
  var slideshow = dot.closest(".slideshow");
  var images = JSON.parse(slideshow.dataset.images);
  slideshow.dataset.current = index;
  slideshow.querySelector(".slide-main").src = images[index];
  slideshow.querySelector(".slide-counter").textContent = (index + 1) + " / " + images.length;
  slideshow.querySelectorAll(".dot").forEach(function(d, i) {
    d.classList.toggle("active", i === index);
  });
};

console.log("✅ admin-dashboard.js imepakiwa!");