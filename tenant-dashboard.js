// tenant-dashboard.js — Tenant

const API_URL = "https://nyumbakwetu-backend.vercel.app/api";

document.addEventListener("DOMContentLoaded", function () {

  // CHECK LOGIN
  var mtumiajiStr = localStorage.getItem("mtumiaji");
  if (!mtumiajiStr) {
    alert("Tafadhali ingia kwanza!");
    window.location.href = "login.html";
    return;
  }

  var mtumiaji = JSON.parse(mtumiajiStr);

  // UPDATE JINA
  var jina = mtumiaji.jina || "Mtumiaji";
  document.getElementById("headerJina").textContent = jina;
  document.getElementById("sidebarJina").textContent = jina;
  document.getElementById("welcomeJina").textContent = "Karibu tena, " + jina.split(" ")[0] + "! 👋";

  // DRAWER
  var menuToggle = document.getElementById("menuToggle");
  var drawerMenu = document.getElementById("drawerMenu");
  var drawerClose = document.getElementById("drawerClose");
  var drawerOverlay = document.getElementById("drawerOverlay");

  if (menuToggle && drawerMenu && drawerOverlay) {
    menuToggle.addEventListener("click", function () {
      drawerMenu.classList.add("open");
      drawerOverlay.classList.add("open");
    });
  }
  if (drawerClose) {
    drawerClose.addEventListener("click", function () {
      drawerMenu.classList.remove("open");
      drawerOverlay.classList.remove("open");
    });
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", function () {
      drawerMenu.classList.remove("open");
      drawerOverlay.classList.remove("open");
    });
  }

  // ==========================================
  // CHUKUA NYUMBA KUTOKA API
  // ==========================================
  async function chukuaNyumba() {
    try {
      var response = await fetch(API_URL + "/properties");
      var data = await response.json();
      onyeshaNyumba(data.nyumba || []);
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("orodhaYaNyumba").innerHTML =
        "<p style='padding:20px; color:red;'>Imeshindikana kupata nyumba.</p>";
    }
  }

  function onyeshaNyumba(nyumba) {
  var container = document.getElementById("orodhaYaNyumba");
  if (!container) return;

  if (nyumba.length === 0) {
    container.innerHTML = "<p style='padding:20px; color:#888;'>Hakuna nyumba.</p>";
    return;
  }

  var html = "";
  nyumba.slice(0, 4).forEach(function (n) {
    // ⭐ CHUKUA PICHA ZOTE (sio moja tu)
    var pichaZote = (n.picha && n.picha.length > 0)
      ? n.picha
      : ["Images/house1.jpg"];

    var bei = "TZS " + (n.bei || 0).toLocaleString() + " / mwezi";

    // ⭐ TENGENEZA SLIDESHOW HTML
    var slideshowHtml =
      '<div class="slideshow" data-current="0" data-images=\'' +
        JSON.stringify(pichaZote) + '\'>' +
        '<img src="' + pichaZote[0] + '" class="slide-main" alt="' + n.jina + '">' +
        '<div class="slide-counter">1 / ' + pichaZote.length + '</div>' +
        (pichaZote.length > 1
          ? '<button class="slide-prev" onclick="event.stopPropagation(); badilishaPicha(this, -1)">&#9668;</button>' +
            '<button class="slide-next" onclick="event.stopPropagation(); badilishaPicha(this, 1)">&#9658;</button>'
          : '') +
        (pichaZote.length > 1
          ? '<div class="slide-dots">' +
              pichaZote.map(function (p, i) {
                return '<span class="dot' + (i === 0 ? ' active' : '') +
                  '" onclick="event.stopPropagation(); nendaPicha(this, ' + i + ')"></span>';
              }).join('') +
            '</div>'
          : '') +
      '</div>';

    html +=
      '<article class="house-card" onclick="window.location.href=\'property-details.html?id=' + n["_id"] + '\'" style="cursor:pointer;">' +
        '<div class="house-image">' +
          slideshowHtml +   // ← slideshow badala ya picha moja
          '<span class="new-label">MPYA</span>' +
          '<button class="favorite" onclick="event.stopPropagation(); toggleFavorite(\'' + n["_id"] + '\', this)">' +
            '<i class="fa-regular fa-heart"></i>' +
          '</button>' +
        '</div>' +
        '<div class="house-info">' +
          '<h4>' + n.jina + '</h4>' +
          '<p class="location"><i class="fa-solid fa-location-dot"></i> ' + (n.eneo || "") + ', ' + (n.mkoa || "") + '</p>' +
          '<strong class="price">' + bei + '</strong>' +
          '<div class="house-features">' +
            '<span><i class="fa-solid fa-bed"></i> ' + (n.vyumba || 0) + ' Vyumba</span>' +
            '<span><i class="fa-solid fa-bath"></i> ' + (n.bafu || 0) + ' Bafu</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  });
  container.innerHTML = html;
}

  // FAVORITES
  window.toggleFavorite = function (id, btn) {
    var favs = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");
    var idx = favs.indexOf(String(id));
    var icon = btn.querySelector("i");

    if (idx === -1) {
      favs.push(String(id));
      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");
      icon.style.color = "#e63946";
    } else {
      favs.splice(idx, 1);
      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");
      icon.style.color = "";
    }
    localStorage.setItem("nyumbaFavorites", JSON.stringify(favs));
    sasishaSaved();
  };

  // SAVED (Right Sidebar)
  function sasishaSaved() {
    var favs = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");
    var container = document.getElementById("savedItemsContainer");
    var header = document.getElementById("savedCountHeader");
    if (header) header.textContent = "Zilizohifadhiwa (" + favs.length + ")";
    if (!container) return;

    if (favs.length === 0) {
      container.innerHTML = "<p style='padding:20px; text-align:center; color:#888; font-size:12px;'>Hakuna nyumba zilizohifadhiwa.</p>";
      return;
    }

    // Chukua nyumba kutoka API
    fetch(API_URL + "/properties")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var nyumba = data.nyumba || [];
        var zetu = nyumba.filter(function (n) { return favs.includes(n["_id"]); });

        var html = "";
        zetu.slice(0, 3).forEach(function (n) {
          var picha = (n.picha && n.picha[0]) ? n.picha[0] : "Images/house1.jpg";
          html +=
            '<div class="saved-item" onclick="window.location.href=\'property-details.html?id=' + n["_id"] + '\'" style="cursor:pointer;">' +
              '<img src="' + picha + '" alt="' + n.jina + '">' +
              '<div>' +
                '<h4>' + n.jina + '</h4>' +
                '<p><i class="fa-solid fa-location-dot"></i> ' + (n.eneo || "") + '</p>' +
                '<strong>TZS ' + (n.bei || 0).toLocaleString() + '</strong>' +
              '</div>' +
              '<i class="fa-solid fa-heart saved-heart"></i>' +
            '</div>';
        });
        container.innerHTML = html;
      });
  }

  // VIEWING REQUESTS
  function sasishaViewings() {
    var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");
    var count = document.getElementById("viewingCount");
    var container = document.getElementById("viewingItemsContainer");

    if (count) count.textContent = " (" + maombi.length + ")";
    if (!container) return;

    if (maombi.length === 0) {
      container.innerHTML = "<p style='padding:20px; text-align:center; color:#888; font-size:12px;'>Hakuna maombi ya viewing bado.</p>";
      return;
    }

    var html = "";
    maombi.slice().reverse().slice(0, 3).forEach(function (ombi) {
      var statusClass = "pending";
      var statusText = "Inasubiri";
      if (ombi.hali === "Confirmed" || ombi.hali === "Ime thibitishwa") {
        statusClass = "confirmed"; statusText = "Imethibitishwa";
      } else if (ombi.hali === "Cancelled" || ombi.hali === "Ime kataliwa") {
        statusClass = "cancelled"; statusText = "Imekataliwa";
      }

      html +=
        '<div class="viewing-item">' +
          '<div class="viewing-icon"><i class="fa-regular fa-calendar"></i></div>' +
          '<div>' +
            '<h4>' + (ombi.nyumbaJina || "Nyumba") + '</h4>' +
            '<p><i class="fa-regular fa-calendar"></i> ' + (ombi.tarehe || "") + ' - ' + (ombi.muda || "") + '</p>' +
          '</div>' +
          '<span class="status ' + statusClass + '">' + statusText + '</span>' +
        '</div>';
    });
    container.innerHTML = html;
  }

  // ==========================================
  // MODALS
  // ==========================================

  function tengenezaModal(id, title, content) {
    var existing = document.getElementById(id);
    if (existing) existing.remove();

    var modal = document.createElement("div");
    modal.id = id;
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:650px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<h2 style="margin:0;color:#299d38;">' + title + '</h2>' +
      '<button onclick="document.getElementById(\'' + id + '\').remove()" ' +
      'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +
      '<div>' + content + '</div>' +
      '</div>';

    document.body.appendChild(modal);
  }

  // TAFUTA NYUMBA
  function funguaTafuta() {
    var content =
      '<input id="tafutaInput" type="text" placeholder="Tafuta jina au eneo..." ' +
      'style="width:100%;padding:12px;border:1px solid #ccc;border-radius:8px;font-size:15px;margin-bottom:15px;">' +
      '<div id="tafutaMatokeo" style="max-height:400px;overflow-y:auto;">Inapakia...</div>';
    tengenezaModal("tafutaModal", "Tafuta Nyumba", content);

    fetch(API_URL + "/properties")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var nyumba = data.nyumba || [];
        function onyesha(filter) {
          var f = (filter || "").toLowerCase();
          var matokeo = nyumba.filter(function (n) {
            return !f || n.jina.toLowerCase().includes(f) || (n.eneo || "").toLowerCase().includes(f);
          });
          var html = "";
          matokeo.forEach(function (n) {
            var picha = (n.picha && n.picha[0]) ? n.picha[0] : "Images/house1.jpg";
            html +=
              '<div onclick="window.location.href=\'property-details.html?id=' + n["_id"] + '\'" ' +
              'style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:#f9f9f9;border-radius:10px;cursor:pointer;">' +
              '<img src="' + picha + '" style="width:80px;height:60px;object-fit:cover;border-radius:8px;">' +
              '<div><h4 style="margin:0 0 4px 0;color:#299d38;">' + n.jina + '</h4>' +
              '<p style="margin:0;color:#666;font-size:13px;">' + (n.eneo || "") + ', ' + (n.mkoa || "") + '</p>' +
              '<strong style="color:#299d38;font-size:14px;">TZS ' + (n.bei || 0).toLocaleString() + '</strong></div></div>';
          });
          document.getElementById("tafutaMatokeo").innerHTML = html || "<p style='text-align:center;padding:20px;color:#888;'>Hakuna matokeo.</p>";
        }
        onyesha("");
        document.getElementById("tafutaInput").addEventListener("input", function (e) { onyesha(e.target.value); });
      });
  }

  // ZILIZOHIFADHIWA
  function funguaZilizohifadhiwa() {
    var favs = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");

    if (favs.length === 0) {
      tengenezaModal("zilizohifadhiwaModal", "Zilizohifadhiwa",
        "<p style='text-align:center;padding:40px;color:#888;'>Hakuna nyumba zilizohifadhiwa.</p>");
      return;
    }

    fetch(API_URL + "/properties")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var nyumba = (data.nyumba || []).filter(function (n) { return favs.includes(n["_id"]); });
        var html = "";
        nyumba.forEach(function (n) {
          var picha = (n.picha && n.picha[0]) ? n.picha[0] : "Images/house1.jpg";
          html +=
            '<div style="display:flex;gap:12px;padding:12px;margin-bottom:10px;background:#f9f9f9;border-radius:10px;">' +
            '<img src="' + picha + '" style="width:100px;height:75px;object-fit:cover;border-radius:8px;cursor:pointer;" ' +
            'onclick="window.location.href=\'property-details.html?id=' + n["_id"] + '\'">' +
            '<div style="flex:1;"><h4 style="margin:0 0 4px 0;color:#299d38;">' + n.jina + '</h4>' +
            '<p style="margin:0;color:#666;font-size:13px;">' + (n.eneo || "") + ', ' + (n.mkoa || "") + '</p>' +
            '<strong style="color:#299d38;">TZS ' + (n.bei || 0).toLocaleString() + '</strong></div></div>';
        });
        tengenezaModal("zilizohifadhiwaModal", "Zilizohifadhiwa", html);
      });
  }

  // MAOMBI/VIEWING
  // ==========================================
// MODAL: MAOMBI (Kutoka Backend)
// ==========================================
async function funguaMaombi() {
  var existing = document.getElementById("maombiModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "maombiModal";
  modal.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
    "align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;";

  modal.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:650px;' +
    'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#299d38;">Maombi Yangu ya Viewing</h2>' +
        '<button onclick="document.getElementById(\'maombiModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +
      '<div id="maombiOrodha">' +
        '<p style="text-align:center;padding:40px;color:#888;">Inapakia maombi...</p>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  // ==========================================
  // CHUKUA MAOMBI KUTOKA BACKEND
  // ==========================================
  try {
    var token = localStorage.getItem("token");

    if (!token) {
      document.getElementById("maombiOrodha").innerHTML =
        '<p style="text-align:center;padding:40px;color:red;">Tafadhali ingia kwanza.</p>';
      return;
    }

    var response = await fetch(API_URL + "/viewings/zangu", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    var data = await response.json();

    if (!response.ok) {
      throw new Error(data.kosa || "Imeshindikana kupata maombi");
    }

    onyeshaMaombiOrodha(data.maombi || []);

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("maombiOrodha").innerHTML =
      '<p style="text-align:center;padding:40px;color:red;">' +
      'Imeshindikana kupata maombi: ' + error.message + '</p>';
  }
}


// ==========================================
// ONYESHA ORODHA YA MAOMBI
// ==========================================
function onyeshaMaombiOrodha(maombi) {
  var container = document.getElementById("maombiOrodha");
  if (!container) return;

  if (maombi.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-regular fa-calendar" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
        '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna maombi bado</h3>' +
        '<p style="margin:0;color:#999;font-size:14px;">' +
          'Maombi yako ya viewing yataonekana hapa.' +
        '</p>' +
      '</div>';
    return;
  }

  var html = "";

  maombi.forEach(function (ombi) {
    var haliRangi = "#f59e0b";
    var haliJina = "Inasubiri";
    var haliIcon = "fa-clock";

    if (ombi.hali === "Confirmed" || ombi.hali === "Imethibitishwa") {
      haliRangi = "#16a34a";
      haliJina = "Imethibitishwa";
      haliIcon = "fa-check-circle";
    } else if (ombi.hali === "Cancelled" || ombi.hali === "Imekataliwa") {
      haliRangi = "#dc2626";
      haliJina = "Imekataliwa";
      haliIcon = "fa-times-circle";
    }

    var nyumbaJina = (ombi.nyumba && ombi.nyumba.jina)
      ? ombi.nyumba.jina
      : (ombi.nyumbaJina || "Nyumba");

    var nyumbaEneo = (ombi.nyumba && ombi.nyumba.eneo)
      ? ombi.nyumba.eneo
      : "";

    html +=
      '<div style="background:#f9f9f9;border-radius:12px;padding:16px;' +
      'margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +

      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">' +
        '<h4 style="margin:0;color:#299d38;font-size:15px;flex:1;">' +
          '<i class="fa-solid fa-house"></i> ' + nyumbaJina +
        '</h4>' +
        '<span style="padding:4px 10px;border-radius:20px;color:white;' +
        'font-size:11px;font-weight:600;background:' + haliRangi + ';white-space:nowrap;">' +
          '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
        '</span>' +
      '</div>' +

      (nyumbaEneo ?
        '<p style="margin:0 0 8px 0;color:#666;font-size:13px;">' +
          '<i class="fa-solid fa-location-dot"></i> ' + nyumbaEneo +
        '</p>' : '') +

      '<div style="font-size:13px;color:#666;line-height:1.7;">' +
        '<div><i class="fa-regular fa-calendar"></i> ' +
          '<strong>Tarehe:</strong> ' + (ombi.tarehe || "") +
        '</div>' +
        '<div><i class="fa-regular fa-clock"></i> ' +
          '<strong>Muda:</strong> ' + (ombi.muda || "") +
        '</div>' +
      '</div>' +

      (ombi.ujumbeWaMmiliki ?
        '<div style="background:white;padding:10px;border-radius:8px;' +
        'margin-top:10px;border-left:3px solid ' + haliRangi + ';">' +
          '<p style="margin:0;color:#333;font-size:13px;font-style:italic;">' +
            '<i class="fa-solid fa-comment-dots" style="color:' + haliRangi + ';"></i> ' +
            ombi.ujumbeWaMmiliki +
          '</p>' +
        '</div>' : '') +

      '</div>';
  });

  container.innerHTML = html;
}

  // ==========================================
// MODAL: UJUMBE (Majibu ya Maombi ya Tenant)
// ==========================================
function funguaUjumbe() {
  var existing = document.getElementById("ujumbeModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "ujumbeModal";
  modal.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
    "align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;";

  // Chukua maombi ya viewing ya tenant
  var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");

  var ujumbeHtml = "";

  if (maombi.length === 0) {
    ujumbeHtml =
      '<div style="text-align:center;padding:40px;">' +
      '<i class="fa-regular fa-comment" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
      '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna ujumbe bado</h3>' +
      '<p style="margin:0 0 16px 0;color:#999;font-size:14px;">' +
        'Maombi yako ya viewing yataonekana hapa' +
      '</p>' +
      '<a href="index.html" style="display:inline-block;padding:10px 20px;' +
      'background:#299d38;color:white;text-decoration:none;' +
      'border-radius:8px;font-size:14px;">' +
        '<i class="fa-solid fa-search"></i> Tafuta Nyumba' +
      '</a>' +
      '</div>';
  } else {
    ujumbeHtml =
      '<div style="background:#eff6ff;padding:12px;border-radius:10px;' +
      'margin-bottom:16px;border-left:4px solid #3b82f6;">' +
        '<p style="margin:0;color:#1e40af;font-size:13px;">' +
          '<i class="fa-solid fa-info-circle"></i> ' +
          '<strong>Hizi ni taarifa za maombi yako:</strong> ' +
          'Subiri majibu kutoka kwa wamiliki.' +
        '</p>' +
      '</div>';

    maombi.slice().reverse().forEach(function (ombi) {
      // Hali ya ombi
      var haliRangi = "#f59e0b";
      var haliJina = "Inasubiri";
      var haliIcon = "fa-clock";

      if (ombi.hali === "Confirmed" || ombi.hali === "Ime thibitishwa") {
        haliRangi = "#16a34a";
        haliJina = "Imethibitishwa";
        haliIcon = "fa-check-circle";
      } else if (ombi.hali === "Cancelled" || ombi.hali === "Ime kataliwa") {
        haliRangi = "#dc2626";
        haliJina = "Imekataliwa";
        haliIcon = "fa-times-circle";
      }

      // Ujumbe wa landlord (kama upo)
      var ujumbeWaKawaida = "Ombi lako limeshapokelewa. Mmiliki atawasiliana nawe kupitia simu.";
      if (ombi.ujumbeWaMmiliki) {
        ujumbeWaKawaida = ombi.ujumbeWaMmiliki;
      }

      ujumbeHtml +=
        '<div style="background:#f9f9f9;border-radius:12px;padding:16px;' +
        'margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +

        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">' +
          '<h3 style="margin:0;color:#299d38;font-size:15px;flex:1;">' +
            '<i class="fa-solid fa-house"></i> ' + (ombi.nyumbaJina || "Nyumba") +
          '</h3>' +
          '<span style="padding:4px 10px;border-radius:20px;color:white;' +
          'font-size:11px;font-weight:600;background:' + haliRangi + ';white-space:nowrap;">' +
            '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
          '</span>' +
        '</div>' +

        '<div style="font-size:13px;color:#666;line-height:1.8;margin-bottom:10px;">' +
          '<div><i class="fa-regular fa-calendar" style="width:16px;"></i> ' +
            'Tarehe ya Ombi: ' + (ombi.tareheYaOmbi || "Leo") +
          '</div>' +
          '<div><i class="fa-regular fa-clock" style="width:16px;"></i> ' +
            'Muda wa Viewing: ' + (ombi.tarehe || "") + ' - ' + (ombi.muda || "") +
          '</div>' +
        '</div>' +

        '<div style="background:white;padding:12px;border-radius:8px;' +
        'border-left:3px solid ' + haliRangi + ';">' +
          '<p style="margin:0;color:#333;font-size:13px;font-style:italic;">' +
            '<i class="fa-solid fa-comment-dots" style="color:' + haliRangi + ';"></i> ' +
            ujumbeWaKawaida +
          '</p>' +
        '</div>' +

        '</div>';
    });
  }

  modal.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:650px;' +
    'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<h2 style="margin:0;color:#299d38;">Ujumbe Wangu</h2>' +
      '<button onclick="document.getElementById(\'ujumbeModal\').remove()" ' +
      'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
    '</div>' +

    '<div>' + ujumbeHtml + '</div>' +

    '</div>';

  document.body.appendChild(modal);
}

  // ==========================================
// MODAL: ARIFA (Kutoka API + LocalStorage)
// ==========================================
async function funguaArifa() {
  var existing = document.getElementById("arifaModal");
  if (existing) existing.remove();

  var modal = document.createElement("div");
  modal.id = "arifaModal";
  modal.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
    "align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;";

  modal.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:650px;' +
    'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<h2 style="margin:0;color:#299d38;">Arifa</h2>' +
      '<button onclick="document.getElementById(\'arifaModal\').remove()" ' +
      'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
    '</div>' +

    '<div id="arifaOrodha">' +
      '<p style="text-align:center;padding:40px;color:#888;">Inapakia arifa...</p>' +
    '</div>' +

    '</div>';

  document.body.appendChild(modal);

  // Chukua arifa
  try {
    // 1. Nyumba kutoka API
    var response = await fetch(API_URL + "/properties");
    var data = await response.json();
    var nyumbaZote = data.nyumba || [];

    // 2. Maombi yangu
    var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");

    // 3. Favorites zangu
    var favorites = JSON.parse(localStorage.getItem("nyumbaFavorites") || "[]");

    // 4. Nyumba mpya (zilizowekwa hivi karibuni - siku 7 zilizopita)
    var siku7Zilizopita = new Date();
    siku7Zilizopita.setDate(siku7Zilizopita.getDate() - 7);

    var nyumbaMpya = nyumbaZote.filter(function (n) {
      if (!n.createdAt) return false;
      var tarehe = new Date(n.createdAt);
      return tarehe >= siku7Zilizopita;
    });

    // KUSANYA ARIFA
    var arifa = [];

    // Arifa 1: Nyumba mpya kwenye database
    if (nyumbaMpya.length > 0) {
      arifa.push({
        rangi: "#16a34a",
        icon: "fa-house-circle-check",
        jina: "Nyumba Mpya " + nyumbaMpya.length + " Zimewekwa",
        maelezo: "Kuna nyumba " + nyumbaMpya.length + " mpya zilizowekwa katika siku 7 zilizopita",
        muda: "Wiki hii"
      });
    }

    // Arifa 2: Jumla ya nyumba
    arifa.push({
      rangi: "#3b82f6",
      icon: "fa-building",
      jina: "Nyumba " + nyumbaZote.length + " Zinapatikana",
      maelezo: "Kuna nyumba " + nyumbaZote.length + " zinazopatikana kwenye NyumbaKwetu",
      muda: "Sasa hivi"
    });

    // Arifa 3: Maombi ya viewing
    if (maombi.length > 0) {
      arifa.push({
        rangi: "#f59e0b",
        icon: "fa-calendar-check",
        jina: "Maombi Yako ya Viewing (" + maombi.length + ")",
        maelezo: "Umeweka maombi " + maombi.length + " ya viewing",
        muda: "Hivi karibuni"
      });
    }

    // Arifa 4: Favorites
    if (favorites.length > 0) {
      arifa.push({
        rangi: "#e63946",
        icon: "fa-heart",
        jina: "Zilizohifadhiwa (" + favorites.length + ")",
        maelezo: "Una nyumba " + favorites.length + " kwenye orodha yako ya kupenda",
        muda: "Karibuni"
      });
    }

    // Arifa 5: Karibu (kama ni mtumiaji mpya)
    arifa.push({
      rangi: "#8b5cf6",
      icon: "fa-star",
      jina: "Karibu NyumbaKwetu!",
      maelezo: "Asante kwa kutumia huduma zetu. Tafuta nyumba yako kwa urahisi.",
      muda: "Kila wakati"
    });

    // ONYESHA
    var container = document.getElementById("arifaOrodha");

    if (arifa.length === 0) {
      container.innerHTML =
        '<p style="text-align:center;padding:40px;color:#888;">Hakuna arifa kwa sasa.</p>';
      return;
    }

    var html = "";
    arifa.forEach(function (a) {
      html +=
        '<div style="display:flex;gap:14px;padding:14px;margin-bottom:10px;' +
        'background:#f9f9f9;border-radius:12px;border-left:4px solid ' + a.rangi + ';">' +

        '<div style="width:40px;height:40px;border-radius:50%;background:' + a.rangi + '22;' +
        'display:flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          '<i class="fa-solid ' + a.icon + '" style="color:' + a.rangi + ';font-size:16px;"></i>' +
        '</div>' +

        '<div style="flex:1;">' +
          '<h4 style="margin:0 0 4px 0;color:#299d38;font-size:15px;">' + a.jina + '</h4>' +
          '<p style="margin:0 0 6px 0;color:#555;font-size:14px;">' + a.maelezo + '</p>' +
          '<small style="color:#999;font-size:12px;">' + a.muda + '</small>' +
        '</div>' +

        '</div>';
    });

    container.innerHTML = html;

    // Sasisha notification count kwenye header
    var notifCount = document.querySelector(".notification-icon span");
    if (notifCount) {
      var total = nyumbaMpya.length + maombi.length;
      if (total === 0) {
        notifCount.style.display = "none";
      } else {
        notifCount.style.display = "";
        notifCount.textContent = total;
      }
    }

  } catch (error) {
    console.error("Error:", error);
    document.getElementById("arifaOrodha").innerHTML =
      "<p style='text-align:center;padding:40px;color:red;'>Imeshindikana kupata arifa.</p>";
  }
}
  // MALIPO
  function funguaMalipo() {
    var malipo = [
      { jina: "Apartment Mlimani City", kodi: 600000, mwezi: "Septemba 2026", hali: "imelipwa" },
      { jina: "Nyumba Goba", kodi: 450000, mwezi: "Septemba 2026", hali: "inasubiri" }
    ];
    var html = "";
    malipo.forEach(function (m) {
      var rangi = m.hali === "imelipwa" ? "#16a34a" : "#f59e0b";
      var jina = m.hali === "imelipwa" ? "Imelipwa" : "Inasubiri";
      html +=
        '<div style="padding:14px;margin-bottom:10px;background:#f9f9f9;border-radius:12px;border-left:4px solid ' + rangi + ';display:flex;justify-content:space-between;align-items:center;">' +
        '<div><h4 style="margin:0 0 4px 0;color:#299d38;">' + m.jina + '</h4>' +
        '<p style="margin:0;color:#666;font-size:13px;">' + m.mwezi + '</p>' +
        '<p style="margin:4px 0 0 0;font-weight:600;color:#299d38;">TZS ' + m.kodi.toLocaleString() + '</p></div>' +
        '<span style="padding:4px 12px;border-radius:20px;color:white;font-size:11px;font-weight:600;background:' + rangi + ';">' + jina + '</span></div>';
    });
    tengenezaModal("malipoModal", "Malipo", html);
  }

  // MIPANGILIO
  function funguaMipangilio() {
    var html =
      '<div style="margin-bottom:16px;"><label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Jina</label>' +
      '<input type="text" value="' + jina + '" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"></div>' +
      '<div style="margin-bottom:16px;"><label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Email</label>' +
      '<input type="email" value="' + (mtumiaji.email || "") + '" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"></div>' +
      '<div style="margin-bottom:16px;"><label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Namba ya Simu</label>' +
      '<input type="tel" placeholder="0754123456" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;"></div>' +
      '<button style="width:100%;padding:14px;background:#299d38;color:white;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">Hifadhi Mabadiliko</button>';
    tengenezaModal("mipangilioModal", "Mipangilio", html);
  }

  // MSAADA
  function funguaMsaada() {
    var html =
      '<div style="background:#e8f5e9;padding:16px;border-radius:12px;margin-bottom:20px;">' +
      '<h3 style="margin:0 0 12px 0;color:#299d38;font-size:16px;">Wasiliana Nasi</h3>' +
      '<div style="margin-bottom:8px;"><i class="fa-solid fa-phone" style="color:#299d38;"></i> +255 710 768 825</div>' +
      '<div style="margin-bottom:8px;"><i class="fa-brands fa-whatsapp" style="color:#25D366;"></i> +255 710 786 825</div>' +
      '<div><i class="fa-solid fa-envelope" style="color:#299d38;"></i> ausonhfelix@gmail.com</div></div>' +
      '<h3 style="color:#299d38;font-size:15px;margin-bottom:12px;">Maswali</h3>' +
      '<div style="border-bottom:1px solid #eee;padding:12px 0;"><strong>Jinsi ya kuomba viewing?</strong><p style="margin:6px 0 0 0;color:#666;font-size:13px;">Fungua nyumba — bonyeza Omba Kuiona Nyumba.</p></div>' +
      '<div style="border-bottom:1px solid #eee;padding:12px 0;"><strong>Kuna malipo?</strong><p style="margin:6px 0 0 0;color:#666;font-size:13px;">Kuomba viewing ni bure.</p></div>' +
      '<a href="https://wa.me/255710786825" target="_blank" style="display:block;background:#25D366;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;margin-top:20px;font-weight:600;">' +
      '<i class="fa-brands fa-whatsapp"></i> Wasiliana WhatsApp</a>';
    tengenezaModal("msaadaModal", "Msaada", html);
  }

  // ==========================================
  // UNGANISHA MENU ZOTE
  // ==========================================
  var menuMap = {
    "menuTafutaNyumba": funguaTafuta,
    "menuTafutaNyumbaMobile": funguaTafuta,
    "menuZilizohifadhiwa": funguaZilizohifadhiwa,
    "menuZilizohifadhiwaMobile": funguaZilizohifadhiwa,
    "menuMaombi": funguaMaombi,
    "menuMaombiMobile": funguaMaombi,
    "menuUjumbe": funguaUjumbe,
    "menuUjumbeMobile": funguaUjumbe,
    "menuArifa": funguaArifa,
    "menuArifaMobile": funguaArifa,
    "menuMalipo": funguaMalipo,
    "menuMalipoMobile": funguaMalipo,
    "menuMipangilio": funguaMipangilio,
    "menuMipangilioMobile": funguaMipangilio,
    "menuMsaada": funguaMsaada,
    "menuMsaadaMobile": funguaMsaada
  };

  Object.keys(menuMap).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (drawerMenu) drawerMenu.classList.remove("open");
        if (drawerOverlay) drawerOverlay.classList.remove("open");
        menuMap[id]();
      });
    }
  });

  // BOTTOM NAV
  document.getElementById("navTafuta")?.addEventListener("click", function (e) { e.preventDefault(); funguaTafuta(); });
  document.getElementById("navZilizohifadhiwa")?.addEventListener("click", function (e) { e.preventDefault(); funguaZilizohifadhiwa(); });

  // LOGOUT
  ["logoutDesktop", "logoutMobile"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        if (confirm("Una uhakika unataka kutoka?")) {
          localStorage.removeItem("token");
          localStorage.removeItem("mtumiaji");
          window.location.href = "login.html";
        }
      });
    }
  });

  // CTA
  document.getElementById("ctaTafuta")?.addEventListener("click", funguaTafuta);
  document.getElementById("onaSaved")?.addEventListener("click", function (e) { e.preventDefault(); funguaZilizohifadhiwa(); });
  document.getElementById("onaViewings")?.addEventListener("click", function (e) { e.preventDefault(); funguaMaombi(); });

  // ANZISHA
  chukuaNyumba();
  sasishaSaved();
  sasishaViewings();


  // ==========================================
// SLIDESHOW FUNCTIONS
// ==========================================
window.badilishaPicha = function (btn, direction) {
  var slideshow = btn.closest(".slideshow");
  if (!slideshow) return;

  var images = JSON.parse(slideshow.dataset.images);
  var current = parseInt(slideshow.dataset.current) || 0;

  var next = current + direction;
  if (next < 0) next = images.length - 1;
  if (next >= images.length) next = 0;

  slideshow.dataset.current = next;
  slideshow.querySelector(".slide-main").src = images[next];
  slideshow.querySelector(".slide-counter").textContent =
    (next + 1) + " / " + images.length;

  var dots = slideshow.querySelectorAll(".dot");
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("active", i === next);
  }
};

window.nendaPicha = function (dot, index) {
  var slideshow = dot.closest(".slideshow");
  if (!slideshow) return;

  var images = JSON.parse(slideshow.dataset.images);

  slideshow.dataset.current = index;
  slideshow.querySelector(".slide-main").src = images[index];
  slideshow.querySelector(".slide-counter").textContent =
    (index + 1) + " / " + images.length;

  var dots = slideshow.querySelectorAll(".dot");
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle("active", i === index);
  }
};
  console.log("tenant-dashboard.js imepakiwa!");
});