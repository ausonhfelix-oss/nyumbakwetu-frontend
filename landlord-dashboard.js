// landlord-dashboard.js — Weka Nyumba Mpya
var API_URL = "https://nyumbakwetu-backend.vercel.app/api";

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

  // ⭐ Tunamruhusu Landlord, Dalali, na Admin. Tunamzuia Tenant pekee.
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

    var pichaUrls = [];

    if (typeof uploadedPhotos !== "undefined" && uploadedPhotos.length > 0) {
      console.log("Inapakia picha " + uploadedPhotos.length + "...");

      for (var i = 0; i < uploadedPhotos.length; i++) {
        try {
          var photo = uploadedPhotos[i];
          var blob = await fetch(photo.dataUrl).then(function (r) { return r.blob(); });
          var formData = new FormData();
          formData.append("image", blob, photo.name);

          var uploadResponse = await fetch(API_URL + "/upload", {
            method: "POST",
            headers: { "Authorization": "Bearer " + token },
            body: formData
          });

          var uploadResult = await uploadResponse.json();

          if (uploadResponse.ok && uploadResult.picha) {
            pichaUrls.push(uploadResult.picha.url);
          }
        } catch (err) {
          console.error("Error pakia picha:", err.message);
        }
      }
    }

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
      picha: pichaUrls
    };

    var response = await fetch(API_URL + "/properties", {
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
  // MODAL: NYUMBA ZANGU
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
        '<div style="display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;padding-bottom:8px;">' +
          '<button class="tab-nyumba active" data-filter="zote" ' +
          'style="padding:8px 16px;border-radius:20px;border:none;cursor:pointer;' +
          'font-size:13px;font-weight:600;background:#1a5c2e;color:white;white-space:nowrap;">Zote</button>' +
          '<button class="tab-nyumba" data-filter="Draft" ' +
          'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
          'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">Drafts</button>' +
          '<button class="tab-nyumba" data-filter="Pending" ' +
          'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
          'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">Zinasubiri</button>' +
          '<button class="tab-nyumba" data-filter="Live" ' +
          'style="padding:8px 16px;border-radius:20px;border:1px solid #ddd;cursor:pointer;' +
          'font-size:13px;font-weight:600;background:white;color:#666;white-space:nowrap;">Live</button>' +
        '</div>' +
        '<div id="nyumbaZanguOrodha">' +
          '<p style="text-align:center;padding:40px;color:#888;">Inapakia...</p>' +
        '</div>' +
        '</div>';

      document.body.appendChild(modal);

      var tabs = modal.querySelectorAll(".tab-nyumba");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
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

          var filter = tab.getAttribute("data-filter");
          onyeshaNyumbaZangu(filter);
        });
      });

      chukuaNyumbaZangu();
    } else {
      chukuaNyumbaZangu();
    }
  }

  // ==========================================
  // CHUKUA NA ONYESHA NYUMBA ZANGU
  // ==========================================
  var nyumbaZanguData = [];
  var filterYaSasa = "zote";

  async function chukuaNyumbaZangu() {
    var container = document.getElementById("nyumbaZanguOrodha");
    if (!container) return;
    container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Inapakia...</p>';

    var token = localStorage.getItem("token");
    var nyumbaZote = [];

    if (token) {
      try {
        var response = await fetch(API_URL + "/properties/zangu/mimi", {
          headers: { "Authorization": "Bearer " + token }
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
              haliNyumba: n.haliNyumba || "Inapatikana", // ⭐ Muhimu kwa ajili ya kitufe
              picha: (n.picha && n.picha[0]) ? n.picha[0] : "Images/house1.jpg",
              chanzo: "API"
            });
          });
        }
      } catch (error) {
        console.log("API haijafanya kazi, tunatumia localStorage");
      }
    }

    var drafts = JSON.parse(localStorage.getItem("nyumbaZangu") || "[]");
    drafts.forEach(function (d) {
      nyumbaZote.push({
        id: d.id || Date.now() + Math.random(),
        jina: (d.aina || "Nyumba") + " - " + (d.eneo || "Bila eneo"),
        aina: d.aina, eneo: d.eneo, mkoa: d.mkoa, bei: d.bei,
        hali: d.hali || "Draft", haliNyumba: "Inapatikana",
        picha: "Images/house1.jpg", chanzo: "LocalStorage"
      });
    });

    if (nyumbaZote.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-solid fa-house" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i>' +
        '<h3 style="margin:0 0 8px 0;color:#666;">Hakuna nyumba bado</h3>' +
        '<a href="#weka-nyumba" onclick="document.getElementById(\'nyumbaZanguModal\').remove()" ' +
        'style="display:inline-block;padding:10px 20px;background:#1a5c2e;color:white;' +
        'text-decoration:none;border-radius:8px;font-size:14px;margin-top:10px;">' +
        '<i class="fa-solid fa-plus"></i> Weka Nyumba Mpya</a>' +
        '</div>';
      return;
    }

    nyumbaZanguData = nyumbaZote;
    onyeshaNyumbaZangu(filterYaSasa);
  }

  function onyeshaNyumbaZangu(filter) {
    var container = document.getElementById("nyumbaZanguOrodha");
    if (!container) return;

    filterYaSasa = filter;
    var nyumbaKuonyesha = nyumbaZanguData;

    if (filter !== "zote") {
      nyumbaKuonyesha = nyumbaZanguData.filter(function (n) { return n.hali === filter; });
    }

    if (nyumbaKuonyesha.length === 0) {
      container.innerHTML =
        '<div style="text-align:center;padding:40px;">' +
        '<i class="fa-solid fa-filter" style="font-size:36px;color:#ccc;margin-bottom:12px;"></i>' +
        '<p style="margin:0;color:#999;font-size:14px;">Hakuna nyumba kwenye kundi hili</p>' +
        '</div>';
      return;
    }

    var html = "";

    nyumbaKuonyesha.forEach(function (n) {
      var haliRangi = "#f59e0b";
      var haliJina = "Inasubiri";
      var haliIcon = "fa-clock";

      if (n.hali === "Live" || n.hali === "Imeidhinishwa") {
        haliRangi = "#16a34a"; haliJina = "Live"; haliIcon = "fa-check-circle";
      } else if (n.hali === "Draft") {
        haliRangi = "#6b7280"; haliJina = "Draft"; haliIcon = "fa-pen";
      }

      var bei = "TZS " + (n.bei || 0).toLocaleString();
      var haliNyumba = n.haliNyumba || "Inapatikana";

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
        
        '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
          (n.chanzo === "API" ?
            '<a href="property-details.html?id=' + n.id + '" ' +
            'style="display:inline-block;padding:6px 14px;background:#1a5c2e;color:white;' +
            'text-decoration:none;border-radius:6px;font-size:12px;">' +
              '<i class="fa-solid fa-eye"></i> Ona' +
            '</a>' +
            '<button onclick="badilishaHaliNyumba(\'' + n.id + '\', \'' + haliNyumba + '\')" ' +
            'style="padding:6px 14px;background:' + (haliNyumba === 'Imepangishwa' ? '#16a34a' : '#f59e0b') + ';color:white;' +
            'border:none;border-radius:6px;font-size:12px;cursor:pointer;font-weight:600;">' +
              '<i class="fa-solid fa-' + (haliNyumba === 'Imepangishwa' ? 'check-circle' : 'home') + '"></i> ' +
              (haliNyumba === 'Imepangishwa' ? 'Imepangishwa' : 'Weka Imepangishwa') +
            '</button>' 
          : '') +
        '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  }

  // ==========================================
  // BADILISHA HALI YA NYUMBA (Imepangishwa)
  // ==========================================
  window.badilishaHaliNyumba = async function (nyumbaId, haliYaSasa) {
    var haliMpya = haliYaSasa === "Imepangishwa" ? "Inapatikana" : "Imepangishwa";
    var ujumbe = haliMpya === "Imepangishwa"
      ? "Nyumba imepangishwa? Itaondolewa kwenye orodha ya nyumba zinazopatikana."
      : "Kurudisha nyumba kama inapatikana?";

    if (!confirm(ujumbe)) return;

    var token = localStorage.getItem("token");
    try {
      var response = await fetch(API_URL + "/properties/" + nyumbaId + "/hali-nyumba", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ haliNyumba: haliMpya })
      });

      var data = await response.json();
      if (!response.ok) throw new Error(data.kosa || "Imeshindikana");

      alert("✅ Hali imebadilishwa kuwa: " + haliMpya);
      chukuaNyumbaZangu();

    } catch (error) {
      alert("❌ " + error.message);
    }
  };

  // ==========================================
  // 9. LOGOUT & DRAWER MENU
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

  // Menu Nyumba Zangu
  var menuNyumbaZangu = document.getElementById("menuNyumbaZangu");
  if (menuNyumbaZangu) {
    menuNyumbaZangu.addEventListener("click", function (e) {
      e.preventDefault();
      onyeshaModalNyumbaZangu();
    });
  }

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
  // MODALS NYINGINE (Msaada, Arifa, Malipo, Mipangilio, Maombi, Ujumbe)
  // ==========================================
  
  // MSAADA
  function onyeshaModalMsaada() {
    var modal = document.getElementById("msaadaModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "msaadaModal";
      modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
      modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="margin:0;color:#1a5c2e;">Msaada</h2><button onclick="document.getElementById(\'msaadaModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button></div><p style="text-align:center;color:#666;">Wasiliana nasi: 0712345678</p></div>';
      document.body.appendChild(modal);
    }
  }
  var menuMsaada = document.getElementById("menuMsaada");
  if (menuMsaada) menuMsaada.addEventListener("click", (e) => { e.preventDefault(); onyeshaModalMsaada(); });
  var menuMsaadaMobile = document.getElementById("menuMsaadaMobile");
  if (menuMsaadaMobile) menuMsaadaMobile.addEventListener("click", (e) => { e.preventDefault(); drawerMenu.classList.remove("open"); drawerOverlay.classList.remove("open"); onyeshaModalMsaada(); });

  // ARIFA
  function onyeshaModalArifa() {
    var modal = document.getElementById("arifaModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "arifaModal";
      modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
      modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="margin:0;color:#1a5c2e;">Arifa</h2><button onclick="document.getElementById(\'arifaModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button></div><p style="text-align:center;color:#666;">Hakuna arifa mpya.</p></div>';
      document.body.appendChild(modal);
    }
  }
  var menuArifa = document.getElementById("menuArifa");
  if (menuArifa) menuArifa.addEventListener("click", (e) => { e.preventDefault(); onyeshaModalArifa(); });
  var menuArifaMobile = document.getElementById("menuArifaMobile");
  if (menuArifaMobile) menuArifaMobile.addEventListener("click", (e) => { e.preventDefault(); drawerMenu.classList.remove("open"); drawerOverlay.classList.remove("open"); onyeshaModalArifa(); });

  // MALIPO
  function onyeshaModalPayouts() {
    var modal = document.getElementById("payoutsModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "payoutsModal";
      modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
      modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="margin:0;color:#1a5c2e;">Malipo</h2><button onclick="document.getElementById(\'payoutsModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button></div><p style="text-align:center;color:#666;">Hakuna malipo yaliyowekwa bado.</p></div>';
      document.body.appendChild(modal);
    }
  }
  var menuPayouts = document.getElementById("menuPayouts");
  if (menuPayouts) menuPayouts.addEventListener("click", (e) => { e.preventDefault(); onyeshaModalPayouts(); });
  var menuPayoutsMobile = document.getElementById("menuPayoutsMobile");
  if (menuPayoutsMobile) menuPayoutsMobile.addEventListener("click", (e) => { e.preventDefault(); drawerMenu.classList.remove("open"); drawerOverlay.classList.remove("open"); onyeshaModalPayouts(); });

  // MIPANGILIO
  function onyeshaModalMipangilio() {
    var modal = document.getElementById("mipangilioModal");
    if (!modal) {
      var mtumiajiMpya = JSON.parse(localStorage.getItem("mtumiaji") || "{}");
      modal = document.createElement("div");
      modal.id = "mipangilioModal";
      modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;";
      modal.innerHTML = '<div style="background:white;border-radius:16px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="margin:0;color:#1a5c2e;">Mipangilio</h2><button onclick="document.getElementById(\'mipangilioModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button></div><h3 style="color:#1a5c2e;">' + (mtumiajiMpya.jina || "Mtumiaji") + '</h3><p style="color:#666;">' + (mtumiajiMpya.email || "") + '</p></div>';
      document.body.appendChild(modal);
    }
  }
  var menuMipangilio = document.getElementById("menuMipangilio");
  if (menuMipangilio) menuMipangilio.addEventListener("click", (e) => { e.preventDefault(); onyeshaModalMipangilio(); });
  var menuMipangilioMobile = document.getElementById("menuMipangilioMobile");
  if (menuMipangilioMobile) menuMipangilioMobile.addEventListener("click", (e) => { e.preventDefault(); drawerMenu.classList.remove("open"); drawerOverlay.classList.remove("open"); onyeshaModalMipangilio(); });

  // ==========================================
  // MAOMBI / UJUMBE (BACKEND)
  // ==========================================
  async function onyeshaModalUjumbe() {
    var modal = document.getElementById("ujumbeModal");
    if (modal) modal.remove();

    modal = document.createElement("div");
    modal.id = "ujumbeModal";
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;";

    modal.innerHTML =
      '<div style="background:white;border-radius:16px;max-width:650px;width:100%;max-height:85vh;overflow-y:auto;padding:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
          '<h2 style="margin:0;color:#1a5c2e;">Ujumbe / Maombi</h2>' +
          '<button onclick="document.getElementById(\'ujumbeModal\').remove()" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">✕</button>' +
        '</div>' +
        '<div id="ujumbeOrodha"><p style="text-align:center;padding:40px;color:#888;">Inapakia ujumbe...</p></div>' +
      '</div>';

    document.body.appendChild(modal);

    try {
      var token = localStorage.getItem("token");
      if (!token) {
        document.getElementById("ujumbeOrodha").innerHTML = '<p style="text-align:center;padding:40px;color:red;">Tafadhali ingia kwanza.</p>';
        return;
      }

      var response = await fetch(API_URL + "/viewings/nilizopokea", {
        headers: { "Authorization": "Bearer " + token }
      });

      var data = await response.json();
      if (!response.ok) throw new Error(data.kosa || "Imeshindikana kupata ujumbe");

      var maombi = data.maombi || [];
      var container = document.getElementById("ujumbeOrodha");

      if (maombi.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fa-regular fa-comment" style="font-size:48px;color:#ccc;margin-bottom:16px;"></i><h3 style="margin:0 0 8px 0;color:#666;">Hakuna ujumbe bado</h3><p style="margin:0;color:#999;font-size:14px;">Ujumbe wa wateja utaonekana hapa.</p></div>';
        return;
      }

      var html = "";
      maombi.forEach(function (ombi) {
        var haliRangi = "#f59e0b", haliJina = "Inasubiri", haliIcon = "fa-clock";
        if (ombi.hali === "Confirmed" || ombi.hali === "Imethibitishwa") {
          haliRangi = "#16a34a"; haliJina = "Imethibitishwa"; haliIcon = "fa-check-circle";
        } else if (ombi.hali === "Cancelled" || ombi.hali === "Imekataliwa") {
          haliRangi = "#dc2626"; haliJina = "Imekataliwa"; haliIcon = "fa-times-circle";
        }

        var mpangaji = ombi.mpangaji || {};
        var jinaMteja = mpangaji.jina || ombi.jina || "Mteja";
        var simuMteja = mpangaji.simu || ombi.simu || "";
        var emailMteja = mpangaji.email || "";
        var herufi = jinaMteja.charAt(0).toUpperCase();
        var nyumbaJina = (ombi.nyumba && ombi.nyumba.jina) ? ombi.nyumba.jina : "Nyumba";
        var simuSafi = String(simuMteja).replace(/\D/g, "");
        var whatsappSimu = simuSafi.startsWith("0") ? "255" + simuSafi.substring(1) : simuSafi.startsWith("255") ? simuSafi : "255" + simuSafi;

        html +=
          '<div style="background:#f9f9f9;border-radius:12px;padding:16px;margin-bottom:12px;border-left:4px solid ' + haliRangi + ';">' +
            '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px;">' +
              '<div style="display:flex;align-items:center;gap:12px;flex:1;">' +
                '<div style="width:44px;height:44px;border-radius:50%;background:' + haliRangi + ';display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:18px;flex-shrink:0;">' + herufi + '</div>' +
                '<div style="flex:1;min-width:0;">' +
                  '<h4 style="margin:0 0 4px 0;color:#1a5c2e;font-size:15px;">' + jinaMteja + '</h4>' +
                  (simuMteja ? '<a href="tel:' + simuMteja + '" style="color:#666;font-size:13px;text-decoration:none;display:block;"><i class="fa-solid fa-phone"></i> ' + simuMteja + '</a>' : '') +
                  (emailMteja ? '<div style="color:#999;font-size:12px;"><i class="fa-solid fa-envelope"></i> ' + emailMteja + '</div>' : '') +
                '</div>' +
              '</div>' +
              '<span style="padding:4px 10px;border-radius:20px;color:white;font-size:10px;font-weight:600;background:' + haliRangi + ';white-space:nowrap;"><i class="fa-solid ' + haliIcon + '"></i> ' + haliJina + '</span>' +
            '</div>' +
            '<div style="background:white;padding:10px;border-radius:8px;margin-bottom:10px;"><p style="margin:0;color:#1a5c2e;font-size:13px;font-weight:600;"><i class="fa-solid fa-house"></i> ' + nyumbaJina + '</p></div>' +
            '<div style="font-size:13px;color:#666;line-height:1.7;"><div><i class="fa-regular fa-calendar"></i> <strong>Tarehe:</strong> ' + (ombi.tarehe || "") + '</div><div><i class="fa-regular fa-clock"></i> <strong>Muda:</strong> ' + (ombi.muda || "") + '</div></div>' +
            '<div style="display:flex;gap:8px;margin-top:12px;">' +
              (ombi.hali === "Pending" || ombi.hali === "Inasubiri" ?
                '<button onclick="thibitishaOmbi(\'' + ombi._id + '\')" style="flex:1;padding:10px;background:#16a34a;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;"><i class="fa-solid fa-check"></i> Thibitisha</button><button onclick="kataaOmbi(\'' + ombi._id + '\')" style="flex:1;padding:10px;background:#dc2626;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;"><i class="fa-solid fa-times"></i> Kataa</button>' : '') +
              (simuMteja ? '<a href="https://wa.me/' + whatsappSimu + '" target="_blank" style="flex:1;padding:10px;background:#25D366;color:white;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;text-align:center;"><i class="fa-brands fa-whatsapp"></i> WhatsApp</a>' : '') +
            '</div>' +
          '</div>';
      });
      container.innerHTML = html;

    } catch (error) {
      document.getElementById("ujumbeOrodha").innerHTML = '<p style="text-align:center;padding:40px;color:red;">Imeshindikana kupata ujumbe: ' + error.message + '</p>';
    }
  }

  window.thibitishaOmbi = async function (ombiId) {
    if (!confirm("Una uhakika unataka kuthibitisha ombi hili?")) return;
    try {
      var token = localStorage.getItem("token");
      var response = await fetch(API_URL + "/viewings/" + ombiId, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ hali: "Confirmed" })
      });
      var data = await response.json();
      if (!response.ok) throw new Error(data.kosa || "Imeshindikana");
      alert("✅ Ombi limethibitishwa!");
      onyeshaModalUjumbe();
    } catch (error) { alert("❌ " + error.message); }
  };

  window.kataaOmbi = async function (ombiId) {
    if (!confirm("Una uhakika unataka kukataa ombi hili?")) return;
    try {
      var token = localStorage.getItem("token");
      var response = await fetch(API_URL + "/viewings/" + ombiId, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ hali: "Cancelled" })
      });
      var data = await response.json();
      if (!response.ok) throw new Error(data.kosa || "Imeshindikana");
      alert("Ombi limekataliwa.");
      onyeshaModalUjumbe();
    } catch (error) { alert("❌ " + error.message); }
  };

  var menuUjumbe = document.getElementById("menuUjumbe");
  if (menuUjumbe) menuUjumbe.addEventListener("click", (e) => { e.preventDefault(); onyeshaModalUjumbe(); });
  var menuUjumbeMobile = document.getElementById("menuUjumbeMobile");
  if (menuUjumbeMobile) menuUjumbeMobile.addEventListener("click", (e) => { e.preventDefault(); drawerMenu.classList.remove("open"); drawerOverlay.classList.remove("open"); onyeshaModalUjumbe(); });

  // ==========================================
  // PHOTO UPLOAD + PREVIEW
  // ==========================================
  var photoGrid = document.getElementById("photoGrid");
  var photoInput = document.getElementById("propertyImageUpload");
  var uploadedPhotos = [];

  if (photoInput) {
    photoInput.addEventListener("change", function (e) {
      var files = e.target.files;
      Array.from(files).forEach(function (file) {
        if (!file.type.startsWith("image/")) { alert("Faili " + file.name + " si picha!"); return; }
        if (file.size > 5 * 1024 * 1024) { alert("Picha " + file.name + " ni kubwa sana (max 5MB)!"); return; }
        var reader = new FileReader();
        reader.onload = function (event) {
          var photoData = { id: Date.now() + Math.random(), name: file.name, size: file.size, dataUrl: event.target.result };
          uploadedPhotos.push(photoData);
          onyeshaPicha(photoData);
        };
        reader.readAsDataURL(file);
      });
      photoInput.value = "";
    });
  }

  function onyeshaPicha(photo) {
    var housePhoto = document.createElement("div");
    housePhoto.className = "house-photo";
    housePhoto.setAttribute("data-photo-id", photo.id);
    housePhoto.innerHTML = '<img src="' + photo.dataUrl + '" alt="' + photo.name + '"><button class="remove-photo" onclick="ondoaPicha(' + photo.id + ', this)"><i class="fa-solid fa-xmark"></i></button>';
    var uploadLabel = photoGrid.querySelector(".upload-photo");
    photoGrid.insertBefore(housePhoto, uploadLabel);
  }

  window.ondoaPicha = function (photoId, btn) {
    uploadedPhotos = uploadedPhotos.filter(function (p) { return p.id !== photoId; });
    var housePhoto = btn.closest(".house-photo");
    if (housePhoto) {
      housePhoto.style.opacity = "0";
      housePhoto.style.transform = "scale(0.8)";
      housePhoto.style.transition = "all 0.2s";
      setTimeout(function () { housePhoto.remove(); }, 200);
    }
  };

  console.log("✅ landlord-dashboard.js imepakiwa!");
});