// tenant-dashboard.js

document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // KIPENGELE #5: VIEWING REQUESTS
  // ==========================================
  
  var card = document.querySelector(".viewing-card");
  var countEl = document.getElementById("viewingCount");

  if (card) {
    var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");

    if (countEl) {
      countEl.textContent = " (" + maombi.length + ")";
    }

    var oldItems = card.querySelectorAll(".viewing-item");
    oldItems.forEach(function (item) {
      item.remove();
    });

    if (maombi.length === 0) {
      var empty = document.createElement("p");
      empty.className = "no-viewings";
      empty.textContent = "Hakuna maombi ya viewing bado.";
      card.appendChild(empty);
    } else {
      maombi.slice().reverse().forEach(function (ombi) {
        var item = document.createElement("div");
        item.className = "viewing-item";

        var statusClass = "pending";
        var statusText = "Pending";

        if (ombi.hali === "Confirmed" || ombi.hali === "Ime thibitishwa") {
          statusClass = "confirmed";
          statusText = "Ime thibitishwa";
        } else if (ombi.hali === "Cancelled" || ombi.hali === "Ime kataliwa") {
          statusClass = "cancelled";
          statusText = "Ime kataliwa";
        }

        item.innerHTML =
          '<div class="viewing-icon">' +
            '<i class="fa-regular fa-calendar"></i>' +
          '</div>' +
          '<div>' +
            '<h4>' + ombi.nyumbaJina + '</h4>' +
            '<p>' +
              '<i class="fa-regular fa-calendar"></i> ' +
              ombi.tarehe + ' - ' + ombi.muda +
            '</p>' +
          '</div>' +
          '<span class="status ' + statusClass + '">' + statusText + '</span>';

        card.appendChild(item);
      });
    }
  }


  // ==========================================
  // KIPENGELE #8: TAFUTA NYUMBA (MODAL)
  // ==========================================

  var menuTafutaNyumba = document.getElementById("menuTafutaNyumba");

  if (menuTafutaNyumba) {
    menuTafutaNyumba.addEventListener("click", function (e) {
      e.preventDefault();
      funguaModalTafuta();
    });
  }

  function funguaModalTafuta() {
    console.log("Modal inafunguka...");

    var existing = document.getElementById("tafutaModal");
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = "tafutaModal";
    modal.style.cssText =
      "position:fixed; top:0; left:0; width:100%; height:100%; " +
      "background:rgba(0,0,0,0.6); z-index:9999; display:flex; " +
      "align-items:flex-start; justify-content:center; padding:20px; " +
      "overflow-y:auto;";

    modal.innerHTML =
      '<div style="background:white; border-radius:16px; max-width:800px; ' +
      'width:100%; max-height:90vh; overflow-y:auto; padding:24px;">' +

        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">' +
          '<h2 style="margin:0; color:#1a5c2e;">Tafuta Nyumba</h2>' +
          '<button onclick="document.getElementById(\'tafutaModal\').remove()" ' +
          'style="background:none; border:none; font-size:24px; cursor:pointer; color:#888;">X</button>' +
        '</div>' +

        '<div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px; margin-bottom:20px;">' +
          '<input id="tafutaJina" type="text" placeholder="Tafuta kwa jina/eneo..." ' +
          'style="padding:12px; border:1px solid #ccc; border-radius:8px; font-size:15px;">' +
          '<select id="tafutaAina" style="padding:12px; border:1px solid #ccc; border-radius:8px; font-size:15px;">' +
            '<option value="">Aina yote</option>' +
            '<option value="Nyumba">Nyumba</option>' +
            '<option value="Apartment">Apartment</option>' +
          '</select>' +
          '<select id="tafutaBei" style="padding:12px; border:1px solid #ccc; border-radius:8px; font-size:15px;">' +
            '<option value="">Bei yoyote</option>' +
            '<option value="400000">Chini ya 400K</option>' +
            '<option value="600000">Chini ya 600K</option>' +
            '<option value="1000000">Chini ya 1M</option>' +
          '</select>' +
        '</div>' +

        '<div id="tafutaMatokeo"></div>' +

      '</div>';

    document.body.appendChild(modal);

    onyeshaMatokeoYaTafuta();

    document.getElementById("tafutaJina").addEventListener("input", onyeshaMatokeoYaTafuta);
    document.getElementById("tafutaAina").addEventListener("change", onyeshaMatokeoYaTafuta);
    document.getElementById("tafutaBei").addEventListener("change", onyeshaMatokeoYaTafuta);
  }

  function onyeshaMatokeoYaTafuta() {
    if (typeof nyumbaZote === "undefined") {
      document.getElementById("tafutaMatokeo").innerHTML =
        "<p style='text-align:center; padding:40px; color:red;'>Error: data.js haijapakiwa!</p>";
      return;
    }

    var jina = (document.getElementById("tafutaJina")?.value || "").toLowerCase().trim();
    var aina = document.getElementById("tafutaAina")?.value || "";
    var beiMax = document.getElementById("tafutaBei")?.value ? parseInt(document.getElementById("tafutaBei").value) : null;

    var matokeo = nyumbaZote.filter(function (n) {
      var matchJina = !jina || n.jina.toLowerCase().includes(jina) || n.eneo.toLowerCase().includes(jina);
      var matchAina = !aina || n.aina === aina;
      var matchBei = !beiMax || n.bei <= beiMax;
      return matchJina && matchAina && matchBei;
    });

    var container = document.getElementById("tafutaMatokeo");

    if (matokeo.length === 0) {
      container.innerHTML =
        "<p style='text-align:center; padding:40px; color:#888;'>Hakuna nyumba inayolingana.</p>";
      return;
    }

    var html = "";

    matokeo.forEach(function (n) {
      html +=
        '<div onclick="window.location.href=\'property-details.html?id=' + n.id + '\'" ' +
        'style="display:flex; gap:16px; padding:16px; margin-bottom:12px; ' +
        'background:#f9f9f9; border-radius:12px; cursor:pointer;">' +

          '<img src="' + n.picha + '" alt="' + n.jina + '" ' +
          'style="width:120px; height:90px; object-fit:cover; border-radius:8px;">' +

          '<div style="flex:1;">' +
            '<h3 style="margin:0 0 6px 0; color:#1a5c2e;">' + n.jina + '</h3>' +
            '<p style="margin:0 0 4px 0; color:#666; font-size:14px;">' + n.eneo + '</p>' +
            '<p style="margin:0; font-weight:600; color:#1a5c2e;">' + n.beiDisplay + '</p>' +
            '<p style="margin:6px 0 0 0; color:#888; font-size:13px;">' +
              n.vyumba + ' Vyumba | ' + n.bafu + ' Bafu | ' + n.aina +
            '</p>' +
          '</div>' +

        '</div>';
    });

    container.innerHTML = html;
  }


// ==========================================
// KIPENGELE #9: ZILIZOHIFADHIWA
// ==========================================

var menuZilizohifadhiwa = document.getElementById("menuZilizohifadhiwa");

if (menuZilizohifadhiwa) {
  menuZilizohifadhiwa.addEventListener("click", function (e) {
    e.preventDefault();
    funguaModalZilizohifadhiwa();
  });
}

function funguaModalZilizohifadhiwa() {
  console.log("Modal ya Zilizohifadhiwa inafunguka...");

  var existing = document.getElementById("zilizohifadhiwaModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "zilizohifadhiwaModal";
  modal.style.cssText =
    "position:fixed; top:0; left:0; width:100%; height:100%; " +
    "background:rgba(0,0,0,0.6); z-index:9999; display:flex; " +
    "align-items:flex-start; justify-content:center; padding:20px; " +
    "overflow-y:auto;";

  modal.innerHTML =
    '<div style="background:white; border-radius:16px; max-width:700px; ' +
    'width:100%; max-height:90vh; overflow-y:auto; padding:24px;">' +

      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">' +
        '<h2 style="margin:0; color:#1a5c2e;">❤️ Zilizohifadhiwa</h2>' +
        '<button onclick="document.getElementById(\'zilizohifadhiwaModal\').remove()" ' +
        'style="background:none; border:none; font-size:24px; cursor:pointer; color:#888;">X</button>' +
      '</div>' +

      '<div id="zilizohifadhiwaMatokeo"></div>' +

    '</div>';

  document.body.appendChild(modal);

  onyeshaZilizohifadhiwa();
}

function onyeshaZilizohifadhiwa() {
  if (typeof nyumbaZote === "undefined") {
    document.getElementById("zilizohifadhiwaMatokeo").innerHTML =
      "<p style='text-align:center; padding:40px; color:red;'>Error: data.js haijapakiwa!</p>";
    return;
  }

  var favorites = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");
  var container = document.getElementById("zilizohifadhiwaMatokeo");

  if (favorites.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; padding:40px; color:#888; font-size:15px;'>" +
      "💔 Bado hujahifadhi nyumba yoyote.<br><br>" +
      "Rudi <a href='index.html' style='color:#1a5c2e; font-weight:600;'>Nyumbani</a> " +
      "na bonyeza moyo ❤️ kuongeza." +
      "</p>";
    return;
  }

  // Chukua nyumba zote ambazo ID zake zipo kwenye favorites
  var nyumbaZilizohifadhiwa = nyumbaZote.filter(function (n) {
    return favorites.includes(String(n.id));
  });

  if (nyumbaZilizohifadhiwa.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; padding:40px; color:#888;'>" +
      "Nyumba ulizohifadhi hazipatikani.</p>";
    return;
  }

  var html = "";

  nyumbaZilizohifadhiwa.forEach(function (n) {
    html +=
      '<div style="display:flex; gap:16px; padding:16px; margin-bottom:12px; ' +
      'background:#f9f9f9; border-radius:12px; align-items:center;">' +

        '<img src="' + n.picha + '" alt="' + n.jina + '" ' +
        'onclick="window.location.href=\'property-details.html?id=' + n.id + '\'" ' +
        'style="width:120px; height:90px; object-fit:cover; border-radius:8px; cursor:pointer;">' +

        '<div style="flex:1; cursor:pointer;" ' +
        'onclick="window.location.href=\'property-details.html?id=' + n.id + '\'">' +
          '<h3 style="margin:0 0 6px 0; color:#1a5c2e;">' + n.jina + '</h3>' +
          '<p style="margin:0 0 4px 0; color:#666; font-size:14px;">' + n.eneo + '</p>' +
          '<p style="margin:0; font-weight:600; color:#1a5c2e;">' + n.beiDisplay + '</p>' +
        '</div>' +

        '<button onclick="ondoaKutokaFavorites(' + n.id + ')" ' +
        'style="background:none; border:none; font-size:22px; cursor:pointer; color:#e63946;" ' +
        'title="Ondoa">❤️</button>' +

      '</div>';
  });

  container.innerHTML = html;
}

// Ondoa kutoka favorites
window.ondoaKutokaFavorites = function (id) {
  var favorites = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");
  var idStr = String(id);

  var index = favorites.indexOf(idStr);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem("nyumbaFavorites", JSON.stringify(favorites));
  }

  // Sasisha modal
  onyeshaZilizohifadhiwa();
  console.log("Nyumba " + id + " imeondolewa kutoka favorites.");
};
// ==========================================
// KIPENGELE #10: ARIFA (NOTIFICATIONS)
// ==========================================

var menuArifa = document.getElementById("menuArifa");

if (menuArifa) {
  menuArifa.addEventListener("click", function (e) {
    e.preventDefault();
    funguaModalArifa();
  });
}

function funguaModalArifa() {
  console.log("Modal ya Arifa inafunguka...");

  var existing = document.getElementById("arifaModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "arifaModal";
  modal.style.cssText =
    "position:fixed; top:0; left:0; width:100%; height:100%; " +
    "background:rgba(0,0,0,0.6); z-index:9999; display:flex; " +
    "align-items:flex-start; justify-content:center; padding:20px; " +
    "overflow-y:auto;";

  modal.innerHTML =
    '<div style="background:white; border-radius:16px; max-width:650px; ' +
    'width:100%; max-height:90vh; overflow-y:auto; padding:24px;">' +

      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">' +
        '<h2 style="margin:0; color:#1a5c2e;">Arifa</h2>' +
        '<button onclick="document.getElementById(\'arifaModal\').remove()" ' +
        'style="background:none; border:none; font-size:24px; cursor:pointer; color:#888;">X</button>' +
      '</div>' +

      '<div id="arifaMatokeo"></div>' +

    '</div>';

  document.body.appendChild(modal);

  onyeshaArifa();
}

function onyeshaArifa() {
  var container = document.getElementById("arifaMatokeo");

  // Kusanya arifa kutoka vyanzo mbalimbali
  var arifa = [];

  // 1. Arifa za maombi ya viewing
  var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");
  maombi.forEach(function (ombi) {
    arifa.push({
      aina: "viewing",
      rangi: "#3b82f6",
      icon: "fa-calendar-check",
      jina: "Ombi la Viewing",
      maelezo: "Uliomba kuona " + ombi.nyumbaJina + " - " + ombi.tarehe,
      muda: ombi.tareheYaOmbi || "Hivi karibuni"
    });
  });

  // 2. Arifa za favorites
  var favorites = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");
  if (favorites.length > 0) {
    arifa.push({
      aina: "favorite",
      rangi: "#e63946",
      icon: "fa-heart",
      jina: "Zilizohifadhiwa",
      maelezo: "Umeweka nyumba " + favorites.length + " kwenye orodha yako ya kupenda",
      muda: "Karibuni"
    });
  }

  // 3. Arifa za nyumba mpya kutoka kwa landlord (mock)
  arifa.push({
    aina: "new",
    rangi: "#16a34a",
    icon: "fa-house-circle-check",
    jina: "Nyumba Mpya Zimewekwa",
    maelezo: "Kuna nyumba 4 mpya zilizowekwa katika eneo lako",
    muda: "Leo"
  });

  // Onyesha
  if (arifa.length === 0) {
    container.innerHTML =
      "<p style='text-align:center; padding:40px; color:#888;'>" +
      "Hakuna arifa kwa sasa.</p>";
    return;
  }

  var html = "";

  arifa.forEach(function (a) {
    html +=
      '<div style="display:flex; gap:14px; padding:14px; margin-bottom:10px; ' +
      'background:#f9f9f9; border-radius:12px; border-left:4px solid ' + a.rangi + ';">' +

        '<div style="width:40px; height:40px; border-radius:50%; background:' + a.rangi + '22; ' +
        'display:flex; align-items:center; justify-content:center; flex-shrink:0;">' +
          '<i class="fa-solid ' + a.icon + '" style="color:' + a.rangi + '; font-size:16px;"></i>' +
        '</div>' +

        '<div style="flex:1;">' +
          '<h4 style="margin:0 0 4px 0; color:#1a5c2e; font-size:15px;">' + a.jina + '</h4>' +
          '<p style="margin:0 0 6px 0; color:#555; font-size:14px;">' + a.maelezo + '</p>' +
          '<small style="color:#999; font-size:12px;">' + a.muda + '</small>' +
        '</div>' +

      '</div>';
  });

  container.innerHTML = html;
}

// Bonus: Sasisha notification count kwenye header
var notifCount = document.querySelector(".notification-icon span");
if (notifCount) {
  var maombiCount = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]").length;
  var favCount = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]").length;
  var total = maombiCount + favCount;

  // Kama 0, ficha; kama zaidi, onyesha
  if (total === 0) {
    notifCount.style.display = "none";
  } else {
    notifCount.style.display = "";
    notifCount.textContent = total;
  }
}
  console.log("tenant-dashboard.js imepakiwa vizuri!");

});