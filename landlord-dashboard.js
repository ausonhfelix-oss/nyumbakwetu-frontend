// landlord-dashboard.js — Weka Nyumba Mpya

document.addEventListener("DOMContentLoaded", function () {

  // ==========================================
  // 1. CHECK LOGIN NA AINA YA MTUMIAJI
  // ==========================================
  var mtumiajiStr = localStorage.getItem("mtumiaji");

  if (!mtumiajiStr) {
    alert("Tafadhali ingia kwanza kuweka nyumba!");
    window.location.href = "login.html";
    return;
  }

  var mtumiaji = JSON.parse(mtumiajiStr);

  if (mtumiaji.aina === "tenant") {
    alert("Wewe ni Mpangaji. Huna ruhusa kuweka nyumba.");
    window.location.href = "tenant-dashboard.html";
    return;
  }

  // ==========================================
  // 2. KUSOMA FOMU
  // ==========================================
  function somaFomu() {
    return {
      aina: document.getElementById("propertyType").value,
      lengo: document.getElementById("propertyPurpose").value,
      matumizi: document.getElementById("propertyUsage").value,
      mkoa: document.getElementById("propertyRegion").value.trim(),
      wilaya: document.getElementById("propertyDistrict").value.trim(),
      eneo: document.getElementById("propertyArea").value.trim(),
      nambaNyumba: document.getElementById("propertyHouseNumber").value.trim(),
      bei: document.getElementById("propertyPrice").value.trim(),
      adaService: document.getElementById("propertyServiceFee").value.trim(),
      amana: document.getElementById("propertyDeposit").value.trim(),
      vyumba: document.getElementById("propertyBedrooms").value,
      sebule: document.getElementById("propertyLivingRoom").value,
      bafu: document.getElementById("propertyBaths").value,
      jikoni: document.getElementById("propertyKitchen").value,
      balcony: document.getElementById("propertyBalcony").value,
      parking: document.getElementById("propertyParking").value,
      security: document.getElementById("propertySecurity").value,
      maelezo: document.getElementById("propertyDescription").value.trim(),
      jinaMmiliki: document.getElementById("ownerName").value.trim(),
      simu: document.getElementById("ownerPhone").value.trim(),
      whatsapp: document.getElementById("ownerWhatsApp").value.trim(),
      email: document.getElementById("ownerEmail").value.trim(),
      eneoRamani: document.getElementById("mapSearchInput").value.trim()
    };
  }

  // ==========================================
  // 3. KAGUA FOMU
  // ==========================================
  function kaguaFomu(data) {
    var makosa = [];
    if (!data.aina) makosa.push("Chagua aina ya nyumba");
    if (!data.lengo) makosa.push("Chagua lengo (kupanga/kuuza)");
    if (!data.mkoa) makosa.push("Chagua mkoa");
    if (!data.eneo) makosa.push("Jaza eneo/mtaa");
    if (!data.bei) makosa.push("Jaza bei");
    if (!data.jinaMmiliki) makosa.push("Jaza jina lako");
    if (!data.simu) makosa.push("Jaza namba ya simu");
    return makosa;
  }

  // ==========================================
  // 4. SAFISHA NAMBA (ondoa comma)
  // ==========================================
  function safishaNamba(value) {
    if (!value) return 0;
    var str = String(value).replace(/,/g, "");
    return parseInt(str) || 0;
  }

  // ==========================================
  // 5. SAFISHA AINA
  // ==========================================
  function safishaAina(aina) {
    if (!aina) return "Nyumba";
    if (aina.indexOf("Apartment") !== -1) return "Apartment";
    if (aina.indexOf("Hosteli") !== -1) return "Hostel";
    if (aina.indexOf("Single") !== -1) return "Single Room";
    if (aina.indexOf("Commercial") !== -1) return "Biashara";
    if (aina.indexOf("Nyumba") !== -1) return "Nyumba";
    return "Nyumba";
  }

  // ==========================================
  // 6. TUMA NYUMBA KWA API
  // ==========================================
  async function hifadhiNyumba(data, hali) {
  var token = localStorage.getItem("token");

  if (!token) {
    alert("Tafadhali ingia kwanza!");
    window.location.href = "login.html";
    return null;
  }

  // ==========================================
  // 1. PAKIA PICHA KWANZA (kama zipo)
  // ==========================================
  var pichaUrls = [];

  if (typeof uploadedPhotos !== "undefined" && uploadedPhotos.length > 0) {
    console.log("Inapakia picha " + uploadedPhotos.length + "...");

    // Tuma kila picha kwa backend
    for (var i = 0; i < uploadedPhotos.length; i++) {
      try {
        var photo = uploadedPhotos[i];

        // Convert dataUrl kuwa Blob
        var blob = await fetch(photo.dataUrl).then(function(r) { return r.blob(); });

        // Tengeneza FormData
        var formData = new FormData();
        formData.append("image", blob, photo.name);

        // Tuma kwa API
        var uploadResponse = await fetch("https://nyumbakwetu-backend.vercel.app/api/upload", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + token
          },
          body: formData
        });

        var uploadResult = await uploadResponse.json();

        if (uploadResponse.ok && uploadResult.picha) {
          pichaUrls.push(uploadResult.picha.url);
          console.log("Picha " + (i+1) + " imepakiwa:", uploadResult.picha.url);
        } else {
          console.error("Picha " + (i+1) + " imeshindikana:", uploadResult.kosa);
        }

      } catch (err) {
        console.error("Error pakia picha:", err.message);
      }
    }

    console.log("Picha zilizopakiwa:", pichaUrls.length);
  }

  // ==========================================
  // 2. TENGA DATA YA NYUMBA
  // ==========================================
  var ainaSafi = safishaAina(data.aina);

  var nyumbaData = {
    jina: ainaSafi + " - " + data.eneo,
    maelezo: data.maelezo || "Nyumba nzuri",
    aina: ainaSafi,
    lengo: data.lengo && data.lengo.indexOf("Kupanga") !== -1 ? "kupanga" : "kuuza",
    bei: safishaNamba(data.bei),
    adaService: safishaNamba(data.adaService),
    amana: safishaNamba(data.amana),
    mkoa: data.mkoa,
    wilaya: data.wilaya,
    eneo: data.eneo,
    nambaNyumba: data.nambaNyumba || "",
    vyumba: parseInt(data.vyumba) || 1,
    sebule: parseInt(data.sebule) || 1,
    bafu: parseInt(data.bafu) || 1,
    jikoni: parseInt(data.jikoni) || 1,
    balcony: parseInt(data.balcony) || 0,
    parking: data.parking || "Hapana",
    security: data.security || "Hapana",
    eneoRamani: data.eneoRamani || "",
    picha: pichaUrls   // ⬅️ Picha URLs hapa!
  };

  console.log("Inatuma nyumba kwa API...", nyumbaData);

  // ==========================================
  // 3. TUMA NYUMBA
  // ==========================================
  var response = await fetch("https://nyumbakwetu-backend.vercel.app/api/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(nyumbaData)
  });

  var result = await response.json();

  if (!response.ok) {
    throw new Error(result.maelezo || result.kosa || "Imeshindikana kutuma nyumba");
  }

  console.log("Nyumba imetumwa:", result);
  return result.nyumba;
}

  // ==========================================
  // 7. BUTTON: TUMA KWA ADMIN
  // ==========================================
  var submitBtn = document.querySelector(".submit-button");

  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      var data = somaFomu();
      var makosa = kaguaFomu(data);

      if (makosa.length > 0) {
        alert("Tafadhali kamilisha:\n\n• " + makosa.join("\n• "));
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Inatuma...';

      try {
        await hifadhiNyumba(data, "Pending");
        alert("Nyumba yako imetumwa kwa Admin!\n\nItaonekana baada ya kuthibitishwa.");
        window.location.href = "index.html";
      } catch (error) {
        alert("Error: " + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Tuma kwa Admin';
      }
    });
  }

  // ==========================================
  // 8. BUTTON: HIFADHI KAMA DRAFT
  // ==========================================
  var draftBtn = document.querySelector(".draft-button");

  if (draftBtn) {
    draftBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var data = somaFomu();

      if (!data.aina && !data.eneo && !data.bei) {
        alert("Jaza angalau taarifa chache kwanza.");
        return;
      }

      var nyumbaZangu = JSON.parse(localStorage.getItem("nyumbaZangu") || "[]");
      var nyumbaMpya = {
        id: Date.now(),
        ...data,
        hali: "Draft",
        tareheIliyowekwa: new Date().toLocaleDateString("sw-TZ")
      };
      nyumbaZangu.push(nyumbaMpya);
      localStorage.setItem("nyumbaZangu", JSON.stringify(nyumbaZangu));
      alert("Imehifadhiwa kama DRAFT!");
    });
  }

// ==========================================
// MODAL: NYUMBA ZANGU (Na Tabs)
// ==========================================
function onyeshaModalNyumbaZangu() {
  var modal = document.getElementById("nyumbaZanguModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "nyumbaZanguModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:650px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Nyumba Zangu</h2>' +
        '<button onclick="document.getElementById(\'nyumbaZanguModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      // Tabs
      '<div style="display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;padding-bottom:8px;">' +

        '<button class="tab-nyumba active" data-filter="zote" ' +
        'style="padding:8px 16px;border-radius:20px;border:none;cursor:pointer;' +
        'font-size:13px;font-weight:600;background:#1a5c2e;color:white;white-space:nowrap;">' +
          'Zote' +
        '</button>' +

        '<button class="tab-nyumba" data-filter="Draft" ' +
        'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
        'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">' +
          'Drafts' +
        '</button>' +

        '<button class="tab-nyumba" data-filter="Pending" ' +
        'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
        'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">' +
          'Zinasubiri' +
        '</button>' +

        '<button class="tab-nyumba" data-filter="Live" ' +
        'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
        'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">' +
          'Live' +
        '</button>' +

      '</div>' +

      '<div id="nyumbaZanguOrodha">' +
        '<p style="text-align:center;padding:40px;color:#888;">Inapakia...</p>' +
      '</div>' +

      '</div>';

    document.body.appendChild(modal);

    // Unganisha tabs
    var tabs = modal.querySelectorAll(".tab-nyumba");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        // Badilisha active
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.style.background = "white";
          t.style.color = "#666";
          t.style.border = "1px solid #ddd";
        });
        tab.classList.add("active");
        tab.style.background = "#1a5c2e";
        tab.style.color = "white";
        tab.style.border = "none";

        // Filter
        var filter = tab.getAttribute("data-filter");
        onyeshaNyumbaZangu(filter);
      });
    });

    // Chukua nyumba
    chukuaNyumbaZangu();
  } else {
    // Kama modal ipo tayari — onyesha upya
    chukuaNyumbaZangu();
  }
}


// ==========================================
// CHUKUA NYUMBA ZANGU KUTOKA API + LOCALSTORAGE
// ==========================================
var nyumbaZanguData = [];
var filterYaSasa = "zote";

async function chukuaNyumbaZangu() {
  var container = document.getElementById("nyumbaZanguOrodha");
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Inapakia...</p>';

  var token = localStorage.getItem("token");
  var nyumbaZote = [];

  // 1. Chukua kutoka API (kama token ipo)
  if (token) {
    try {
      var response = await fetch("https://nyumbakwetu-backend.vercel.app/api/properties/zangu/mimi", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      if (response.ok) {
        var data = await response.json();
        var nyumbaAPI = data.nyumba || [];

        nyumbaAPI.forEach(function (n) {
          nyumbaZote.push({
            id: n["_id"],
            jina: n.jina,
            aina: n.aina,
            eneo: n.eneo,
            mkoa: n.mkoa,
            bei: n.bei,
            hali: n.hali,
            picha: (n.picha && n.picha[0]) ? n.picha[0] : "Images/house1.jpg",
            chanzo: "API"
          });
        });
      }
    } catch (error) {
      console.log("API haijafanya kazi, tunatumia localStorage");
    }
  }

  // 2. Chukua drafts kutoka localStorage
  var drafts = JSON.parse(localStorage.getItem("nyumbaZangu") || "[]");

  drafts.forEach(function (d) {
    // Angalia kama tayari ipo (kutoka API)
    var ipoTayari = false;

    // Drafts hazina id sawa na API — tunaongeza tu
    nyumbaZote.push({
      id: d.id || Date.now() + Math.random(),
      jina: (d.aina || "Nyumba") + " - " + (d.eneo || "Bila eneo"),
      aina: d.aina,
      eneo: d.eneo,
      mkoa: d.mkoa,
      bei: d.bei,
      hali: d.hali || "Draft",
      picha: "Images/house1.jpg",
      chanzo: "LocalStorage"
    });
  });

  // 3. Kama hakuna
  if (nyumbaZote.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;">' +
      '<i class="fa-solid fa-house" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
      '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna nyumba bado</h3>' +
      '<p style="margin:0 0 16px 0;color:#999;font-size:14px;">' +
        'Anza kuweka nyumba yako ya kwanza' +
      '</p>' +
      '<a href="#weka-nyumba" onclick="document.getElementById(\'nyumbaZanguModal\').remove()" ' +
      'style="display:inline-block;padding:10px 20px;background:#1a5c2e;color:white;' +
      'text-decoration:none;border-radius:8px;font-size:14px;">' +
        '<i class="fa-solid fa-plus"></i> Weka Nyumba Mpya' +
      '</a>' +
      '</div>';
    return;
  }

  nyumbaZanguData = nyumbaZote;

  // Onyesha
  onyeshaNyumbaZangu(filterYaSasa);
}


// ==========================================
// ONYESHA NYUMBA ZANGU (Na Filter)
// ==========================================
function onyeshaNyumbaZangu(filter) {
  var container = document.getElementById("nyumbaZanguOrodha");
  if (!container) return;

  filterYaSasa = filter;

  // Filter nyumba
  var nyumbaKuonyesha = nyumbaZanguData;

  if (filter !== "zote") {
    nyumbaKuonyesha = nyumbaZanguData.filter(function (n) {
      return n.hali === filter;
    });
  }

  // Kama hakuna kwenye filter hii
  if (nyumbaKuonyesha.length === 0) {
    container.innerHTML =
      '<div style="text-align:center;padding:40px;">' +
      '<i class="fa-solid fa-filter" style="font-size:36px;color:#ccc;margin-bottom:12px;"></i>' +
      '<p style="margin:0;color:#999;font-size:14px;">' +
        'Hakuna nyumba kwenye kundi hili' +
      '</p>' +
      '</div>';
    return;
  }

  // Onyesha
  var html = "";

  nyumbaKuonyesha.forEach(function (n) {
    var haliRangi = "#f59e0b";
    var haliJina = "Inasubiri";
    var haliIcon = "fa-clock";

    if (n.hali === "Live" || n.hali === "Imeidhinishwa") {
      haliRangi = "#16a34a";
      haliJina = "Live";
      haliIcon = "fa-check-circle";
    } else if (n.hali === "Draft") {
      haliRangi = "#6b7280";
      haliJina = "Draft";
      haliIcon = "fa-pen";
    } else if (n.hali === "Pending") {
      haliRangi = "#f59e0b";
      haliJina = "Inasubiri";
      haliIcon = "fa-clock";
    }

    var bei = "TZS " + (n.bei || 0).toLocaleString();

    html +=
      '<div style="background:#f9f9f9;border-radius:12px;padding:14px;' +
      'margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +

      '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">' +
        '<h3 style="margin:0;color:#1a5c2e;font-size:15px;flex:1;">' + n.jina + '</h3>' +
        '<span style="padding:4px 10px;border-radius:20px;color:white;' +
        'font-size:11px;font-weight:600;background:' + haliRangi + ';white-space:nowrap;">' +
          '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
        '</span>' +
      '</div>' +

      '<p style="margin:0 0 4px 0;color:#666;font-size:13px;">' +
        '<i class="fa-solid fa-location-dot"></i> ' + (n.eneo || "") + ', ' + (n.mkoa || "") +
      '</p>' +
      '<p style="margin:0 0 8px 0;color:#1a5c2e;font-weight:600;font-size:14px;">' + bei + '</p>' +

      (n.chanzo === "API" ?
        '<a href="property-details.html?id=' + n.id + '" ' +
        'style="display:inline-block;padding:6px 14px;background:#1a5c2e;color:white;' +
        'text-decoration:none;border-radius:6px;font-size:12px;">' +
          '<i class="fa-solid fa-eye"></i> Ona' +
        '</a>' : '') +

      '</div>';
  });

  container.innerHTML = html;
}


// Unganisha menu ya Nyumba Zangu (sidebar)
var menuNyumbaZangu = document.getElementById("menuNyumbaZangu");
if (menuNyumbaZangu) {
  menuNyumbaZangu.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalNyumbaZangu();
  });
}

// Unganisha menu ya Nyumba Zangu (drawer mobile)
var menuNyumbaZanguMobile = document.getElementById("menuNyumbaZanguMobile");
if (menuNyumbaZanguMobile) {
  menuNyumbaZanguMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalNyumbaZangu();
  });
}

  // ==========================================
  // 10. LOGOUT
  // ==========================================
  var logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("Una uhakika unataka kutoka?")) {
        localStorage.removeItem("token");
        localStorage.removeItem("mtumiaji");
        window.location.href = "login.html";
      }
    });
  }

  // ==========================================
// 11. DRAWER MENU
// ==========================================
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

if (drawerClose && drawerMenu && drawerOverlay) {
  drawerClose.addEventListener("click", function () {
    drawerMenu.classList.remove("open");
    drawerOverlay.classList.remove("open");
  });
}

if (drawerOverlay && drawerMenu) {
  drawerOverlay.addEventListener("click", function () {
    drawerMenu.classList.remove("open");
    drawerOverlay.classList.remove("open");
  });
}

// Logout kwa mobile
var logoutMobile = document.getElementById("logoutMobile");
if (logoutMobile) {
  logoutMobile.addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Una uhakika unataka kutoka?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("mtumiaji");
      window.location.href = "login.html";
    }
  });
}

// Menu Nyumba Zangu kwa mobile
var menuNyumbaZanguMobile = document.getElementById("menuNyumbaZanguMobile");
if (menuNyumbaZanguMobile) {
  menuNyumbaZanguMobile.addEventListener("click", function (e) {
    e.preventDefault();
    drawerMenu.classList.remove("open");
    drawerOverlay.classList.remove("open");
    onyeshaModalNyumbaZangu();
  });
}

// ==========================================
// MODAL: MSAADA
// ==========================================
function onyeshaModalMsaada() {
  var modal = document.getElementById("msaadaModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "msaadaModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:600px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Msaada na Usaidizi</h2>' +
        '<button onclick="document.getElementById(\'msaadaModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      // Contact Info
      '<div style="background:#e8f5e9;padding:16px;border-radius:12px;margin-bottom:20px;">' +
        '<h3 style="margin:0 0 12px 0;color:#1a5c2e;font-size:16px;">Wasiliana Nasi</h3>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
          '<i class="fa-solid fa-phone" style="color:#1a5c2e;font-size:18px;"></i>' +
          '<span style="color:#333;">+255 754 123 456</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">' +
          '<i class="fa-brands fa-whatsapp" style="color:#25D366;font-size:18px;"></i>' +
          '<span style="color:#333;">+255 754 123 456</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;">' +
          '<i class="fa-solid fa-envelope" style="color:#1a5c2e;font-size:18px;"></i>' +
          '<span style="color:#333;">msaada@nyumbakwetu.co.tz</span>' +
        '</div>' +
      '</div>' +

      // FAQ
      '<h3 style="color:#1a5c2e;font-size:16px;margin-bottom:12px;">Maswali Yanayoulizwa Sana</h3>' +

      '<div style="border-bottom:1px solid #eee;padding:12px 0;">' +
        '<strong style="color:#333;">Jinsi ya kuweka nyumba?</strong>' +
        '<p style="margin:6px 0 0 0;color:#666;font-size:14px;">Bonyeza "Weka Nyumba Mpya" — jaza form — bonyeza "Tuma kwa Admin".</p>' +
      '</div>' +

      '<div style="border-bottom:1px solid #eee;padding:12px 0;">' +
        '<strong style="color:#333;">Kwa nini nyumba yangu haionekani?</strong>' +
        '<p style="margin:6px 0 0 0;color:#666;font-size:14px;">Admin anahitaji kuthibitisha kwanza. Subiri dakika 24-48.</p>' +
      '</div>' +

      '<div style="border-bottom:1px solid #eee;padding:12px 0;">' +
        '<strong style="color:#333;">Ninawezaje kubadilisha bei?</strong>' +
        '<p style="margin:6px 0 0 0;color:#666;font-size:14px;">Wasiliana nasi kwa namba iliyo juu — tunabadilisha haraka.</p>' +
      '</div>' +

      '<div style="padding:12px 0;">' +
        '<strong style="color:#333;">Kuna malipo yoyote?</strong>' +
        '<p style="margin:6px 0 0 0;color:#666;font-size:14px;">Kuweka nyumba ni bure. Tunachukua 5% kama nyumba ikipangishwa.</p>' +
      '</div>' +

      // CTA Button
      '<a href="https://wa.me/255754123456" target="_blank" ' +
      'style="display:block;background:#25D366;color:white;text-align:center;' +
      'padding:14px;border-radius:10px;text-decoration:none;margin-top:20px;font-weight:600;">' +
        '<i class="fa-brands fa-whatsapp"></i> Wasiliana kwa WhatsApp' +
      '</a>' +

      '</div>';

    document.body.appendChild(modal);
  }
}

// Unganisha menu ya Msaada (sidebar)
var menuMsaada = document.getElementById("menuMsaada");
if (menuMsaada) {
  menuMsaada.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalMsaada();
  });
}

// Unganisha menu ya Msaada (drawer mobile)
var menuMsaadaMobile = document.getElementById("menuMsaadaMobile");
if (menuMsaadaMobile) {
  menuMsaadaMobile.addEventListener("click", function (e) {
    e.preventDefault();

    // Funga drawer
    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    // Fungua modal
    onyeshaModalMsaada();
  });
}

// ==========================================
// MODAL: ARIFA
// ==========================================
function onyeshaModalArifa() {
  var modal = document.getElementById("arifaModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "arifaModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    // Chukua arifa kutoka localStorage
    var arifa = JSON.parse(localStorage.getItem("arifaZangu") || "[]");

    var arifaHtml = "";

    // Kama hakuna arifa
    if (arifa.length === 0) {
      // Onyesha arifa za mfano (default)
      arifa = [
        {
          jina: "Karibu NyumbaKwetu!",
          maelezo: "Asante kwa kujiunga. Anza kuweka nyumba zako sasa.",
          muda: "Leo",
          aina: "habari"
        },
        {
          jina: "Weka Nyumba Yako ya Kwanza",
          maelezo: "Bonyeza 'Weka Nyumba Mpya' ili kuanza.",
          muda: "Leo",
          aina: "ushauri"
        }
      ];
    }

    arifa.slice().reverse().forEach(function (a) {
      var rangi = "#3b82f6";
      var icon = "fa-bell";

      if (a.aina === "habari") {
        rangi = "#16a34a";
        icon = "fa-check-circle";
      } else if (a.aina === "ushauri") {
        rangi = "#f59e0b";
        icon = "fa-lightbulb";
      } else if (a.aina === "maombi") {
        rangi = "#8b5cf6";
        icon = "fa-clipboard";
      }

      arifaHtml +=
        '<div style="display:flex;gap:14px;padding:14px;margin-bottom:10px;' +
        'background:#f9f9f9;border-radius:12px;border-left:4px solid ' + rangi + ';">' +

        '<div style="width:40px;height:40px;border-radius:50%;' +
        'background:' + rangi + '22;display:flex;align-items:center;' +
        'justify-content:center;flex-shrink:0;">' +
          '<i class="fa-solid ' + icon + '" style="color:' + rangi + ';font-size:16px;"></i>' +
        '</div>' +

        '<div style="flex:1;">' +
          '<h4 style="margin:0 0 4px 0;color:#1a5c2e;font-size:15px;">' +
            a.jina +
          '</h4>' +
          '<p style="margin:0 0 6px 0;color:#555;font-size:14px;">' +
            a.maelezo +
          '</p>' +
          '<small style="color:#999;font-size:12px;">' + a.muda + '</small>' +
        '</div>' +

        '</div>';
    });

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:600px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Arifa</h2>' +
        '<button onclick="document.getElementById(\'arifaModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      '<div id="arifaOrodha">' + arifaHtml + '</div>' +

      '</div>';

    document.body.appendChild(modal);
  }
}

// Unganisha menu ya Arifa (sidebar)
var menuArifa = document.getElementById("menuArifa");
if (menuArifa) {
  menuArifa.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalArifa();
  });
}

// Unganisha menu ya Arifa (drawer mobile)
var menuArifaMobile = document.getElementById("menuArifaMobile");
if (menuArifaMobile) {
  menuArifaMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalArifa();
  });
}

// ==========================================
// MODAL: PAYOUTS (MALIPO)
// ==========================================
function onyeshaModalPayouts() {
  var modal = document.getElementById("payoutsModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "payoutsModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    // Data ya mfano
    var jumlaIliyopatikana = 0;
    var inayosubiri = 0;
    var imelipwa = 0;

    // Data ya mfano
    var malipo = [
      {
        jina: "Apartment Mlimani City",
        kodi: 600000,
        mwezi: "Septemba 2026",
        hali: "imelipwa",
        tarehe: "05 Sept 2026"
      },
      {
        jina: "Nyumba ya kisasa Goba",
        kodi: 450000,
        mwezi: "Septemba 2026",
        hali: "inasubiri",
        tarehe: "10 Sept 2026"
      },
      {
        jina: "Apartment Nzuguni B",
        kodi: 550000,
        mwezi: "Agosti 2026",
        hali: "imelipwa",
        tarehe: "05 Ago 2026"
      }
    ];

    malipo.forEach(function (m) {
      jumlaIliyopatikana += m.kodi;
      if (m.hali === "imelipwa") imelipwa += m.kodi;
      else inayosubiri += m.kodi;
    });

    var malipoHtml = "";

    malipo.forEach(function (m) {
      var haliRangi = m.hali === "imelipwa" ? "#16a34a" : "#f59e0b";
      var haliJina = m.hali === "imelipwa" ? "Imelipwa" : "Inasubiri";
      var haliIcon = m.hali === "imelipwa" ? "fa-check-circle" : "fa-clock";

      malipoHtml +=
        '<div style="display:flex;justify-content:space-between;align-items:center;' +
        'padding:14px;margin-bottom:10px;background:#f9f9f9;border-radius:12px;' +
        'border-left:4px solid ' + haliRangi + ';">' +

        '<div style="flex:1;">' +
          '<h4 style="margin:0 0 4px 0;color:#1a5c2e;font-size:15px;">' + m.jina + '</h4>' +
          '<p style="margin:0 0 4px 0;color:#666;font-size:13px;">' +
            '<i class="fa-solid fa-calendar"></i> ' + m.mwezi +
          '</p>' +
          '<p style="margin:0;color:#666;font-size:13px;">' +
            '<i class="fa-solid fa-money-bill"></i> TZS ' + m.kodi.toLocaleString() +
          '</p>' +
        '</div>' +

        '<div style="text-align:right;">' +
          '<span style="display:inline-block;padding:4px 12px;border-radius:20px;' +
          'color:white;font-size:12px;font-weight:600;background:' + haliRangi + ';">' +
            '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
          '</span>' +
          '<p style="margin:6px 0 0 0;color:#999;font-size:11px;">' + m.tarehe + '</p>' +
        '</div>' +

        '</div>';
    });

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:650px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Payouts (Malipo)</h2>' +
        '<button onclick="document.getElementById(\'payoutsModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      // Stats
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">' +

      '<div style="background:#e8f5e9;padding:14px;border-radius:12px;text-align:center;">' +
        '<i class="fa-solid fa-money-bill-wave" style="color:#1a5c2e;font-size:20px;"></i>' +
        '<h3 style="margin:8px 0 2px 0;color:#1a5c2e;font-size:18px;">' +
          'TZS ' + (jumlaIliyopatikana / 1000).toFixed(0) + 'K' +
        '</h3>' +
        '<p style="margin:0;color:#666;font-size:11px;">Jumla</p>' +
      '</div>' +

      '<div style="background:#dcfce7;padding:14px;border-radius:12px;text-align:center;">' +
        '<i class="fa-solid fa-check-circle" style="color:#16a34a;font-size:20px;"></i>' +
        '<h3 style="margin:8px 0 2px 0;color:#16a34a;font-size:18px;">' +
          'TZS ' + (imelipwa / 1000).toFixed(0) + 'K' +
        '</h3>' +
        '<p style="margin:0;color:#666;font-size:11px;">Imelipwa</p>' +
      '</div>' +

      '<div style="background:#fef3c7;padding:14px;border-radius:12px;text-align:center;">' +
        '<i class="fa-solid fa-clock" style="color:#f59e0b;font-size:20px;"></i>' +
        '<h3 style="margin:8px 0 2px 0;color:#f59e0b;font-size:18px;">' +
          'TZS ' + (inayosubiri / 1000).toFixed(0) + 'K' +
        '</h3>' +
        '<p style="margin:0;color:#666;font-size:11px;">Inasubiri</p>' +
      '</div>' +

      '</div>' +

      // History
      '<h3 style="color:#1a5c2e;font-size:16px;margin-bottom:12px;">Historia ya Malipo</h3>' +

      '<div>' + malipoHtml + '</div>' +

      // Info
      '<div style="background:#eff6ff;padding:14px;border-radius:10px;margin-top:16px;' +
      'border-left:4px solid #3b82f6;">' +
        '<p style="margin:0;color:#1e40af;font-size:13px;">' +
          '<i class="fa-solid fa-info-circle"></i> ' +
          '<strong>Kumbuka:</strong> Malipo yanafanyika siku ya 5 ya kila mwezi kupitia M-Pesa au Benki.' +
        '</p>' +
      '</div>' +

      '</div>';

    document.body.appendChild(modal);
  }
}

// Unganisha menu ya Payouts (sidebar)
var menuPayouts = document.getElementById("menuPayouts");
if (menuPayouts) {
  menuPayouts.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalPayouts();
  });
}

// Unganisha menu ya Payouts (drawer mobile)
var menuPayoutsMobile = document.getElementById("menuPayoutsMobile");
if (menuPayoutsMobile) {
  menuPayoutsMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalPayouts();
  });
}

// ==========================================
// MODAL: MIPANGILIO
// ==========================================
function onyeshaModalMipangilio() {
  var modal = document.getElementById("mipangilioModal");

  if (!modal) {
    // Chukua taarifa za mtumiaji kutoka localStorage
    var mtumiaji = JSON.parse(localStorage.getItem("mtumiaji") || "{}");

    modal = document.createElement("div");
    modal.id = "mipangilioModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:600px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Mipangilio</h2>' +
        '<button onclick="document.getElementById(\'mipangilioModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      // Profile Picture
      '<div style="text-align:center;margin-bottom:24px;">' +
        '<div style="width:80px;height:80px;border-radius:50%;background:#e8f5e9;' +
        'display:flex;align-items:center;justify-content:center;margin:0 auto 12px auto;">' +
          '<i class="fa-solid fa-user" style="color:#1a5c2e;font-size:32px;"></i>' +
        '</div>' +
        '<h3 style="margin:0;color:#1a5c2e;">' + (mtumiaji.jina || "Mtumiaji") + '</h3>' +
        '<p style="margin:4px 0 0 0;color:#666;font-size:13px;">' + (mtumiaji.email || "") + '</p>' +
      '</div>' +

      // Taarifa Binafsi
      '<h3 style="color:#1a5c2e;font-size:15px;margin-bottom:12px;' +
      'border-bottom:1px solid #eee;padding-bottom:8px;">' +
        '<i class="fa-solid fa-user"></i> Taarifa Binafsi' +
      '</h3>' +

      '<div style="margin-bottom:16px;">' +
        '<label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Jina Kamili</label>' +
        '<input type="text" id="settingJina" value="' + (mtumiaji.jina || "") + '" ' +
        'style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">' +
      '</div>' +

      '<div style="margin-bottom:16px;">' +
        '<label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Email</label>' +
        '<input type="email" id="settingEmail" value="' + (mtumiaji.email || "") + '" ' +
        'style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">' +
      '</div>' +

      '<div style="margin-bottom:16px;">' +
        '<label style="display:block;color:#666;font-size:13px;margin-bottom:6px;">Namba ya Simu</label>' +
        '<input type="tel" id="settingSimu" placeholder="0754123456" ' +
        'style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;">' +
      '</div>' +

      // Arifa
      '<h3 style="color:#1a5c2e;font-size:15px;margin:20px 0 12px 0;' +
      'border-bottom:1px solid #eee;padding-bottom:8px;">' +
        '<i class="fa-regular fa-bell"></i> Arifa' +
      '</h3>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'padding:10px 0;border-bottom:1px solid #f5f5f5;">' +
        '<span style="color:#333;font-size:14px;">Arifa za maombi</span>' +
        '<label style="position:relative;display:inline-block;width:44px;height:24px;">' +
          '<input type="checkbox" checked style="opacity:0;width:0;height:0;">' +
          '<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;' +
          'background:#1a5c2e;border-radius:24px;transition:.3s;"></span>' +
        '</label>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'padding:10px 0;border-bottom:1px solid #f5f5f5;">' +
        '<span style="color:#333;font-size:14px;">Arifa za ujumbe</span>' +
        '<label style="position:relative;display:inline-block;width:44px;height:24px;">' +
          '<input type="checkbox" checked style="opacity:0;width:0;height:0;">' +
          '<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;' +
          'background:#1a5c2e;border-radius:24px;transition:.3s;"></span>' +
        '</label>' +
      '</div>' +

      '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'padding:10px 0;border-bottom:1px solid #f5f5f5;">' +
        '<span style="color:#333;font-size:14px;">Arifa za matangazo</span>' +
        '<label style="position:relative;display:inline-block;width:44px;height:24px;">' +
          '<input type="checkbox" style="opacity:0;width:0;height:0;">' +
          '<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;' +
          'background:#ccc;border-radius:24px;transition:.3s;"></span>' +
        '</label>' +
      '</div>' +

      // Security
      '<h3 style="color:#1a5c2e;font-size:15px;margin:20px 0 12px 0;' +
      'border-bottom:1px solid #eee;padding-bottom:8px;">' +
        '<i class="fa-solid fa-shield-halved"></i> Usalama' +
      '</h3>' +

      '<button style="width:100%;padding:12px;background:#f5f5f5;border:none;' +
      'border-radius:8px;text-align:left;cursor:pointer;font-size:14px;color:#333;' +
      'margin-bottom:8px;">' +
        '<i class="fa-solid fa-lock"></i> Badilisha Password' +
      '</button>' +

      '<button style="width:100%;padding:12px;background:#f5f5f5;border:none;' +
      'border-radius:8px;text-align:left;cursor:pointer;font-size:14px;color:#333;">' +
        '<i class="fa-solid fa-mobile"></i> Weka 2FA (Usalama wa Ziada)' +
      '</button>' +

      // Save Button
      '<button id="saveMipangilio" ' +
      'style="width:100%;padding:14px;background:#1a5c2e;color:white;border:none;' +
      'border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:20px;">' +
        '<i class="fa-solid fa-save"></i> Hifadhi Mabadiliko' +
      '</button>' +

      '</div>';

    document.body.appendChild(modal);

    // Unganisha Save button
    var saveBtn = document.getElementById("saveMipangilio");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var jinaMpya = document.getElementById("settingJina").value;
        var emailMpya = document.getElementById("settingEmail").value;

        // Sasisha localStorage
        var mtumiaji = JSON.parse(localStorage.getItem("mtumiaji") || "{}");
        mtumiaji.jina = jinaMpya;
        mtumiaji.email = emailMpya;
        localStorage.setItem("mtumiaji", JSON.stringify(mtumiaji));

        alert("Mabadiliko yamehifadhiwa!");
        document.getElementById("mipangilioModal").remove();
      });
    }
  }
}

// Unganisha menu ya Mipangilio (sidebar)
var menuMipangilio = document.getElementById("menuMipangilio");
if (menuMipangilio) {
  menuMipangilio.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalMipangilio();
  });
}

// Unganisha menu ya Mipangilio (drawer mobile)
var menuMipangilioMobile = document.getElementById("menuMipangilioMobile");
if (menuMipangilioMobile) {
  menuMipangilioMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalMipangilio();
  });
}

// ==========================================
// MODAL: MAOMBI/REQUESTS
// ==========================================
async function onyeshaModalMaombi() {
  var modal = document.getElementById("maombiModal");

  // Kama modal haipo — tengeneza kwanza
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "maombiModal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:650px;' +
      'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Maombi ya Viewing</h2>' +
        '<button onclick="document.getElementById(\'maombiModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +

      '<div id="maombiOrodha">' +
        '<p style="text-align:center;padding:40px;color:#888;">Inapakia maombi...</p>' +
      '</div>' +

      '</div>';

    document.body.appendChild(modal);
  }

  // Chukua maombi kutoka API
  chukuaMaombi();
}


// ==========================================
// CHUKUA MAOMBI KUTOKA API
// ==========================================
async function chukuaMaombi() {
  var container = document.getElementById("maombiOrodha");
  if (!container) return;

  var token = localStorage.getItem("token");

  if (!token) {
    container.innerHTML =
      '<p style="text-align:center;padding:40px;color:red;">' +
      'Tafadhali ingia kwanza.</p>';
    return;
  }

  try {
    var response = await fetch("https://nyumbakwetu-backend.vercel.app/api/viewings/nilizopokea", {
      headers: {
        "Authorization": "Bearer " + token
      }
    });

    if (!response.ok) {
      throw new Error("Imeshindikana kupata maombi: " + response.status);
    }

    var data = await response.json();

    // Chukua maombi
    var maombi = data.maombi || [];

    // Kama hakuna maombi — chukua kutoka localStorage pia
    if (maombi.length === 0) {
      var maombiLocal = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");

      if (maombiLocal.length > 0) {
        maombi = maombiLocal;
      }
    }

    if (maombi.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-regular fa-clipboard" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
        '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna maombi bado</h3>' +
        '<p style="margin:0;color:#999;font-size:14px;">Maombi ya viewing yataonekana hapa</p>' +
        '</div>';
      return;
    }

    // Onyesha maombi
    var html = "";

    maombi.slice().reverse().forEach(function (ombi) {
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

      var nyumbaJina = ombi.nyumbaJina || (ombi.nyumba ? ombi.nyumba.jina : "Nyumba");
      var jinaMteja = ombi.jina || (ombi.mpangaji ? ombi.mpangaji.jina : "Mteja");
      var simu = ombi.simu || (ombi.mpangaji ? ombi.mpangaji.simu : "");

      html +=
        '<div style="background:#f9f9f9;border-radius:12px;padding:16px;' +
        'margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +

        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">' +
          '<h3 style="margin:0;color:#1a5c2e;font-size:15px;">' + nyumbaJina + '</h3>' +
          '<span style="padding:4px 12px;border-radius:20px;color:white;' +
          'font-size:11px;font-weight:600;background:' + haliRangi + ';">' +
            '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
          '</span>' +
        '</div>' +

        '<div style="font-size:13px;color:#666;line-height:1.8;">' +
          '<div><i class="fa-solid fa-user" style="width:16px;"></i> ' + jinaMteja + '</div>' +
          (simu ? '<div><i class="fa-solid fa-phone" style="width:16px;"></i> ' + simu + '</div>' : '') +
          '<div><i class="fa-regular fa-calendar" style="width:16px;"></i> ' +
            (ombi.tarehe || "") + ' — ' + (ombi.muda || "") + '</div>' +
        '</div>' +

        '<div style="margin-top:12px;display:flex;gap:8px;">' +
          (simu ? '<a href="tel:' + simu + '" style="flex:1;padding:8px;background:#1a5c2e;' +
          'color:white;border-radius:6px;text-align:center;text-decoration:none;' +
          'font-size:13px;"><i class="fa-solid fa-phone"></i> Piga</a>' : '') +

          (simu ? '<a href="https://wa.me/255' + simu.replace(/^0/, '').replace(/\s/g, '') + '" ' +
          'target="_blank" style="flex:1;padding:8px;background:#25D366;color:white;' +
          'border-radius:6px;text-align:center;text-decoration:none;font-size:13px;">' +
          '<i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' : '') +
        '</div>' +

        '</div>';
    });

    container.innerHTML = html;

    console.log("Maombi yamepakiwa:", maombi.length);

  } catch (error) {
    console.error("Error:", error.message);

    // Fallback: Chukua kutoka localStorage
    var maombiLocal = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");

    if (maombiLocal.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-regular fa-clipboard" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
        '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna maombi bado</h3>' +
        '<p style="margin:0;color:#999;font-size:14px;">Maombi ya viewing yataonekana hapa</p>' +
        '</div>';
    } else {
      // Onyesha maombi ya localStorage
      var html = "";
      maombiLocal.slice().reverse().forEach(function (ombi) {
        html +=
          '<div style="background:#f9f9f9;border-radius:12px;padding:16px;' +
          'margin-bottom:12px;border-left:4px solid #f59e0b;">' +
          '<h3 style="margin:0 0 6px 0;color:#1a5c2e;font-size:15px;">' +
            (ombi.nyumbaJina || "Nyumba") + '</h3>' +
          '<p style="margin:3px 0;color:#666;font-size:13px;">' +
            '<i class="fa-solid fa-user"></i> ' + (ombi.jina || "") + '</p>' +
          '<p style="margin:3px 0;color:#666;font-size:13px;">' +
            '<i class="fa-solid fa-phone"></i> ' + (ombi.simu || "") + '</p>' +
          '<p style="margin:3px 0;color:#666;font-size:13px;">' +
            '<i class="fa-regular fa-calendar"></i> ' +
            (ombi.tarehe || "") + ' — ' + (ombi.muda || "") + '</p>' +
          '</div>';
      });
      container.innerHTML = html;
    }
  }
}


// Unganisha menu ya Maombi (sidebar)
var menuMaombi = document.getElementById("menuMaombi");
if (menuMaombi) {
  menuMaombi.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalMaombi();
  });
}

// Unganisha menu ya Maombi (drawer mobile)
var menuMaombiMobile = document.getElementById("menuMaombiMobile");
if (menuMaombiMobile) {
  menuMaombiMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalMaombi();
  });
}

// ==========================================
// MODAL: UJUMBE (Wateja Halisi)
// ==========================================
function onyeshaModalUjumbe() {
  var modal = document.getElementById("ujumbeModal");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.id = "ujumbeModal";
  modal.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;" +
    "background:rgba(0,0,0,0.6);z-index:9999;display:flex;" +
    "align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;";

  // ⭐ PATA LANDLORD ALIYEINGIA
  var landlordStr = localStorage.getItem("mtumiaji");
  var landlordId = null;

  if (landlordStr) {
    try {
      var landlord = JSON.parse(landlordStr);
      landlordId = landlord.id || landlord._id;
    } catch (e) {}
  }

  // ⭐ PATA MAOMBI HALISI
  var viewingsZote = JSON.parse(localStorage.getItem("viewingsZote") || "[]");

  // Chuja — ya landlord huyu pekee
  var maombiYangu = viewingsZote.filter(function (m) {
    // Kama landlordId haipo kwenye ombi, onyesha (fallback)
    if (!m.landlordId) return true;
    return String(m.landlordId) === String(landlordId);
  });

  // ⭐ TENGENEZA HTML
  var ujumbeHtml = "";

  if (maombiYangu.length === 0) {
    ujumbeHtml =
      '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-regular fa-comment" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
        '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna ujumbe bado</h3>' +
        '<p style="margin:0;color:#999;font-size:14px;">' +
          'Ujumbe wa wateja utaonekana hapa wakati waombapo kuona nyumba zako.' +
        '</p>' +
      '</div>';
  } else {
    maombiYangu.slice().reverse().forEach(function (ombi) {
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

      var jinaMteja = ombi.tenantJina || ombi.jina || "Mteja";
      var simuMteja = ombi.tenantSimu || ombi.simu || "";
      var herufi = jinaMteja.charAt(0).toUpperCase();

      ujumbeHtml +=
        '<div style="background:#f9f9f9;border-radius:12px;padding:16px;' +
        'margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +

        // Header
        '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">' +
          '<div style="display:flex;align-items:center;gap:12px;flex:1;">' +
            '<div style="width:44px;height:44px;border-radius:50%;' +
            'background:' + haliRangi + ';display:flex;align-items:center;' +
            'justify-content:center;color:white;font-weight:700;font-size:18px;flex-shrink:0;">' +
              herufi +
            '</div>' +
            '<div style="flex:1;min-width:0;">' +
              '<h4 style="margin:0 0 4px 0;color:#1a5c2e;font-size:15px;">' +
                jinaMteja +
              '</h4>' +
              (simuMteja ?
                '<a href="tel:' + simuMteja + '" ' +
                'style="color:#666;font-size:13px;text-decoration:none;display:block;">' +
                  '<i class="fa-solid fa-phone"></i> ' + simuMteja +
                '</a>' : '') +
            '</div>' +
          '</div>' +
          '<span style="padding:4px 10px;border-radius:20px;color:white;' +
          'font-size:10px;font-weight:600;background:' + haliRangi + ';white-space:nowrap;">' +
            '<i class="fa-solid ' + haliIcon + '"></i> ' + haliJina +
          '</span>' +
        '</div>' +

        // Nyumba
        '<div style="background:white;padding:10px;border-radius:8px;margin-bottom:10px;">' +
          '<p style="margin:0;color:#1a5c2e;font-size:13px;font-weight:600;">' +
            '<i class="fa-solid fa-house"></i> ' + (ombi.nyumbaJina || "Nyumba") +
          '</p>' +
        '</div>' +

        // Tarehe & Muda
        '<div style="font-size:13px;color:#666;line-height:1.7;">' +
          '<div><i class="fa-regular fa-calendar"></i> ' +
            '<strong>Tarehe:</strong> ' + (ombi.tarehe || "") +
          '</div>' +
          '<div><i class="fa-regular fa-clock"></i> ' +
            '<strong>Muda:</strong> ' + (ombi.muda || "") +
          '</div>' +
          '<div><i class="fa-regular fa-paper-plane"></i> ' +
            '<strong>Lilitumwa:</strong> ' + (ombi.tareheYaOmbi || "") +
          '</div>' +
        '</div>' +

        // Buttons
        '<div style="display:flex;gap:8px;margin-top:12px;">' +
          (ombi.hali === "Pending" ?
            '<button onclick="thibitishaOmbiLandlord(' + ombi.id + ')" ' +
            'style="flex:1;padding:10px;background:#16a34a;color:white;border:none;' +
            'border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;">' +
              '<i class="fa-solid fa-check"></i> Thibitisha' +
            '</button>' : '') +
          (simuMteja ?
            '<a href="tel:' + simuMteja + '" ' +
            'style="flex:1;padding:10px;background:#3b82f6;color:white;' +
            'border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;' +
            'text-decoration:none;text-align:center;">' +
              '<i class="fa-solid fa-phone"></i> Piga Simu' +
            '</a>' : '') +
          (simuMteja ?
            '<a href="https://wa.me/255' + simuMteja.replace(/^0/, '').replace(/\s/g, '') + '" ' +
            'target="_blank" ' +
            'style="flex:1;padding:10px;background:#25D366;color:white;' +
            'border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;' +
            'text-decoration:none;text-align:center;">' +
              '<i class="fa-brands fa-whatsapp"></i> WhatsApp' +
            '</a>' : '') +
        '</div>' +

        '</div>';
    });
  }

  modal.innerHTML =
    '<div style="background:white;border-radius:16px;max-width:650px;' +
    'width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h2 style="margin:0;color:#1a5c2e;">Ujumbe (' + maombiYangu.length + ')</h2>' +
        '<button onclick="document.getElementById(\'ujumbeModal\').remove()" ' +
        'style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
      '</div>' +
      '<div style="background:#eff6ff;padding:12px;border-radius:10px;' +
      'margin-bottom:16px;border-left:4px solid #3b82f6;">' +
        '<p style="margin:0;color:#1e40af;font-size:13px;">' +
          '<i class="fa-solid fa-info-circle"></i> ' +
          'Hawa ni wateja waliomba kuona nyumba zako.' +
        '</p>' +
      '</div>' +
      ujumbeHtml +
    '</div>';

  document.body.appendChild(modal);
}


// ==========================================
// THIBITISHA OMBI (Landlord)
// ==========================================
window.thibitishaOmbiLandlord = function (ombiId) {
  var viewings = JSON.parse(localStorage.getItem("viewingsZote") || "[]");
  var index = viewings.findIndex(function (m) { return m.id === ombiId; });

  if (index !== -1) {
    viewings[index].hali = "Imethibitishwa";
    viewings[index].ujumbeWaMmiliki =
      "Ombi lako limethibitishwa. Tutaunganisha nawe kwa simu hivi punde.";
    localStorage.setItem("viewingsZote", JSON.stringify(viewings));

    // Sasisha pia kwa tenant
    var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");
    var idx = maombi.findIndex(function (m) { return m.id === ombiId; });
    if (idx !== -1) {
      maombi[idx].hali = "Imethibitishwa";
      maombi[idx].ujumbeWaMmiliki = viewings[index].ujumbeWaMmiliki;
      localStorage.setItem("maombiYaViewing", JSON.stringify(maombi));
    }

    alert("✅ Ombi limethibitishwa! Mteja atajulishwa.");
    onyeshaModalUjumbe();
  }
};

// ==========================================
// FUNGUA CHAT (baadaye)
// ==========================================
function funguaChat(jina) {
  alert("Chat na " + jina + " — Inakuja hivi karibuni!");
}

window.funguaChat = funguaChat;


// Unganisha menu ya Ujumbe (sidebar)
var menuUjumbe = document.getElementById("menuUjumbe");
if (menuUjumbe) {
  menuUjumbe.addEventListener("click", function (e) {
    e.preventDefault();
    onyeshaModalUjumbe();
  });
}

// Unganisha menu ya Ujumbe (drawer mobile)
var menuUjumbeMobile = document.getElementById("menuUjumbeMobile");
if (menuUjumbeMobile) {
  menuUjumbeMobile.addEventListener("click", function (e) {
    e.preventDefault();

    if (drawerMenu) drawerMenu.classList.remove("open");
    if (drawerOverlay) drawerOverlay.classList.remove("open");

    onyeshaModalUjumbe();
  });
}

// ==========================================
// PHOTO UPLOAD + PREVIEW
// ==========================================
var photoGrid = document.getElementById("photoGrid");
var photoInput = document.getElementById("propertyImageUpload");
var uploadedPhotos = []; // Hifadhi picha zote

// 1. Mtu akibonyeza "Ongeza Picha"
if (photoInput) {
  photoInput.addEventListener("change", function (e) {
    var files = e.target.files;

    // Kwa kila picha iliyochaguliwa
    Array.from(files).forEach(function (file) {
      // Hakiki: picha?
      if (!file.type.startsWith("image/")) {
        alert("Faili " + file.name + " si picha!");
        return;
      }

      // Hakiki: ukubwa (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Picha " + file.name + " ni kubwa sana (max 5MB)!");
        return;
      }

      // Tengeneza URL ya kuonyesha
      var reader = new FileReader();

      reader.onload = function (event) {
        var photoData = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          dataUrl: event.target.result
        };

        uploadedPhotos.push(photoData);
        onyeshaPicha(photoData);
      };

      reader.readAsDataURL(file);
    });

    // Safisha input ili aweze kuongeza tena
    photoInput.value = "";
  });
}

// 2. Onyesha picha kwenye grid
function onyeshaPicha(photo) {
  var housePhoto = document.createElement("div");
  housePhoto.className = "house-photo";
  housePhoto.setAttribute("data-photo-id", photo.id);

  housePhoto.innerHTML =
    '<img src="' + photo.dataUrl + '" alt="' + photo.name + '">' +
    '<button class="remove-photo" onclick="ondoaPicha(' + photo.id + ', this)">' +
      '<i class="fa-solid fa-xmark"></i>' +
    '</button>';

  // Ingiza kabla ya kitufe cha "Ongeza Picha"
  var uploadLabel = photoGrid.querySelector(".upload-photo");
  photoGrid.insertBefore(housePhoto, uploadLabel);
}

// 3. Ondoa picha
window.ondoaPicha = function (photoId, btn) {
  // Ondoa kutoka array
  uploadedPhotos = uploadedPhotos.filter(function (p) {
    return p.id !== photoId;
  });

  // Ondoa kutoka HTML
  var housePhoto = btn.closest(".house-photo");
  if (housePhoto) {
    housePhoto.style.opacity = "0";
    housePhoto.style.transform = "scale(0.8)";
    housePhoto.style.transition = "all 0.2s";

    setTimeout(function () {
      housePhoto.remove();
    }, 200);
  }

  console.log("Picha zilizobaki:", uploadedPhotos.length);
};

// 4. Onyesha idadi ya picha
function sasishaIdadiPicha() {
  // Unaweza kuonyesha idadi kwenye UI baadaye
  console.log("Jumla ya picha:", uploadedPhotos.length);
}
  console.log("landlord-dashboard.js imepakiwa!");
});