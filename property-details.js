// property-details.js — NyumbaKwetu (Dynamic kutoka API)

const API_URL = "https://nyumbakwetu-backend.vercel.app/api";

document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");
  console.log("ID ya nyumba:", id);

  if (!id) {
    document.body.innerHTML =
      "<div style='padding:40px;text-align:center;'>" +
      "<h1>Hakuna nyumba iliyochaguliwa</h1>" +
      "<a href='index.html'>Rudi Nyumbani</a></div>";
    return;
  }

  chukuaNyumba(id);
});


// ==========================================
// 1. CHUKUA NYUMBA KUTOKA API
// ==========================================
async function chukuaNyumba(id) {
  try {
    console.log("Inachukua nyumba...");

    var response = await fetch(API_URL + "/properties/" + id);

    if (!response.ok) {
      throw new Error("Nyumba haipatikani: " + response.status);
    }

    var data = await response.json();
    var nyumba = data.nyumba;

    console.log("Nyumba imepatikana:", nyumba.jina);

    onyeshaNyumba(nyumba);
    anzishaViewingForm(nyumba);

  } catch (error) {
    console.error("Error:", error.message);
    document.body.innerHTML =
      "<div style='padding:40px;text-align:center;'>" +
      "<h1>Nyumba haipatikani</h1>" +
      "<p>" + error.message + "</p>" +
      "<a href='index.html'>Rudi Nyumbani</a></div>";
  }
}


// ==========================================
// 2. ONYESHA NYUMBA (NA SLIDESHOW)
// ==========================================
function onyeshaNyumba(n) {
  console.log("=== ONYESHA NYUMBA ===");
  console.log("Jina la nyumba:", n.jina);
  console.log("Picha zilizopokelewa:", n.picha);

  // ==========================================
  // 1. PICHA - SLIDESHOW
  // ==========================================
  var imageSection = document.querySelector(".property-image-section");

  if (!imageSection) {
    console.error("KOSA: .property-image-section haipatikani!");
    return;
  }

  // ⭐ BADGE YA IMEPANGISHWA
  if (n.haliNyumba === "Imepangishwa") {
    var existingBadge = imageSection.querySelector(".badge-imepangishwa");
    if (existingBadge) existingBadge.remove();

    imageSection.insertAdjacentHTML("beforeend",
      '<div class="badge-imepangishwa" style="position:absolute;top:15px;left:15px;' +
      'background:#16a34a;color:white;padding:8px 16px;border-radius:20px;' +
      'font-weight:700;font-size:13px;z-index:10;box-shadow:0 4px 12px rgba(0,0,0,0.2);">' +
        '<i class="fa-solid fa-check-circle"></i> IMEPANGISHWA' +
      '</div>');
  }

  // Chukua picha zote
  var pichaZote = (n.picha && n.picha.length > 0) ? n.picha : ["Images/house1.jpg"];

  // Futa picha ya zamani (static) na slideshow ya zamani
  var oldImg = imageSection.querySelector("img");
  if (oldImg) oldImg.remove();

  var oldSlideshow = imageSection.querySelector(".slideshow");
  if (oldSlideshow) oldSlideshow.remove();

  // Tengeneza slideshow mpya
  var slideshowHtml =
    '<div class="slideshow" data-current="0" data-images=\'' + JSON.stringify(pichaZote) + '\'>' +
      '<img src="' + pichaZote[0] + '" class="slide-main" alt="' + n.jina + '">' +
      '<div class="slide-counter">1 / ' + pichaZote.length + '</div>' +
      (pichaZote.length > 1 ?
        '<button class="slide-prev" onclick="badilishaPicha(this, -1)">&#9668;</button>' +
        '<button class="slide-next" onclick="badilishaPicha(this, 1)">&#9658;</button>'
        : '') +
      '<div class="slide-dots">' +
        pichaZote.map(function(p, i) {
          return '<span class="dot' + (i === 0 ? ' active' : '') + '" ' +
                 'onclick="nendaPicha(this, ' + i + ')"></span>';
        }).join('') +
      '</div>' +
    '</div>';

  // Ingiza slideshow mwanzo wa section
  imageSection.insertAdjacentHTML("afterbegin", slideshowHtml);

  // ==========================================
  // 2. TAG (KUPANGA / KUUZA)
  // ==========================================
  var tag = document.querySelector(".property-image-section .property-tag");
  if (tag) {
    var tagText = "KUPANGA";
    if (n.lengo === "kuuza") {
      tagText = "KUUZA";
      tag.classList.add("sale");
    }
    tag.textContent = tagText;
  }

  // ==========================================
  // 3. JINA
  // ==========================================
  var jina = document.querySelector(".property-details h1");
  if (jina) jina.textContent = n.jina;

  // ==========================================
  // 4. ENEO
  // ==========================================
  var eneo = document.querySelector(".property-location");
  if (eneo) {
    eneo.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + n.eneo + ", " + n.mkoa;
  }

  // ==========================================
  // 5. BEI
  // ==========================================
  var bei = document.querySelector(".property-price");
  if (bei) {
    var beiText = "TZS " + n.bei.toLocaleString();
    if (n.lengo !== "kuuza") {
      beiText = beiText + " / mwezi";
    }
    bei.textContent = beiText;
  }

  // ==========================================
  // ⭐ 6. VIDEO YA NYUMBA (MPYA)
  // ==========================================
  var videoSection = document.getElementById("videoSection");
  var videoPlayer = document.getElementById("propertyVideoPlayer");
  
  if (videoSection && videoPlayer) {
    if (n.video && n.video !== "") {
      videoSection.style.display = "block";
      videoPlayer.querySelector("source").src = n.video;
      videoPlayer.load(); // Hii inasoma video mpya
    } else {
      videoSection.style.display = "none";
    }
  }

  // ==========================================
  // ⭐ 7. FEATURES (IMEREKEBISHWA KWA AJILI YA VIWANJA)
  // ==========================================
  var featuresContainer = document.querySelector(".property-features");
  if (featuresContainer) {
    var isKiwanja = n.aina && (n.aina.toLowerCase().includes("kiwanja") || n.aina.toLowerCase().includes("viwanja") || n.aina.toLowerCase().includes("shamba"));

    if (isKiwanja) {
      // Kama ni Kiwanja, ficha vyumba na bafu
      featuresContainer.innerHTML =
        '<div><i class="fa-solid fa-ruler-combined"></i> <span>' + (n.aina || "Kiwanja") + '</span></div>' +
        '<div><i class="fa-solid fa-location-dot"></i> <span>' + (n.eneo || "") + '</span></div>';
    } else {
      // Kama ni Nyumba ya kawaida, onyesha vyumba, bafu n.k.
      var parking = n.parking === "Ndio" ? '<div><i class="fa-solid fa-car"></i> <span>Parking</span></div>' : '';
      featuresContainer.innerHTML =
        '<div><i class="fa-solid fa-bed"></i> <span>' + (n.vyumba || 0) + ' Vyumba</span></div>' +
        '<div><i class="fa-solid fa-bath"></i> <span>' + (n.bafu || 0) + ' Bafu</span></div>' +
        '<div><i class="fa-solid fa-house"></i> <span>' + (n.aina || "Nyumba") + '</span></div>' +
        parking;
    }
  }

  // ==========================================
  // 8. MAELEZO
  // ==========================================
  var maelezo = document.querySelector(".description p");
  if (maelezo) {
    maelezo.textContent = n.maelezo || "Nyumba hii ina mazingira mazuri.";
  }

  // ==========================================
  // 9. SEO: TITLE NA DESCRIPTION
  // ==========================================
  document.title = n.jina + " - " + (n.eneo || "") + " | NyumbaKwetu";
  
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content",
      "Tafuta " + n.jina + " iliyopo " + n.eneo + ", " + n.mkoa +
      " Bei ni TZS " + n.bei.toLocaleString() + ". Nyumba bora, maisha bora."
    );
  }

  console.log("Property details zimepakiwa!");
}


// ==========================================
// 3. SLIDESHOW FUNCTIONS
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

  var dots = slideshow.querySelectorAll(".dot");
  dots.forEach(function(dot, i) {
    dot.classList.toggle("active", i === next);
  });
};

window.nendaPicha = function(dot, index) {
  var slideshow = dot.closest(".slideshow");
  var images = JSON.parse(slideshow.dataset.images);

  slideshow.dataset.current = index;
  slideshow.querySelector(".slide-main").src = images[index];
  slideshow.querySelector(".slide-counter").textContent = (index + 1) + " / " + images.length;

  var dots = slideshow.querySelectorAll(".dot");
  dots.forEach(function(d, i) {
    d.classList.toggle("active", i === index);
  });
};


// ==========================================
// 4. VIEWING FORM (Inahitaji Login)
// ==========================================
function anzishaViewingForm(nyumba) {
  var requestBtn = document.getElementById("requestViewingBtn");
  var viewingForm = document.getElementById("viewingForm");
  var submitBtn = document.getElementById("submitViewing");

  // 1. Bonyeza button → angalia login kwanza
  if (requestBtn && viewingForm) {
    requestBtn.addEventListener("click", function () {
      var mtumiajiStr = localStorage.getItem("mtumiaji");

      if (!mtumiajiStr) {
        alert("Tafadhali ingia kwanza ili kuomba kuona nyumba.\n\nItakuchukua sekunde 30 tu!");
        window.location.href = "login.html";
        return;
      }

      var mtumiaji = JSON.parse(mtumiajiStr);

      if (mtumiaji.aina === "landlord" || mtumiaji.aina === "admin" || mtumiaji.aina === "dalali") {
        alert("Wewe ni Mpangishaji/Dalali. Huna uwezo wa kuomba viewing.\n\nTafuta nyumba kama Mpangaji.");
        return;
      }

      if (viewingForm.style.display === "block") {
        viewingForm.style.display = "none";
        requestBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Omba Kuiona Nyumba';
      } else {
        viewingForm.style.display = "block";
        requestBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Funga Fomu';

        var jina = document.getElementById("viewerName");
        var simu = document.getElementById("viewerPhone");

        if (jina && !jina.value && mtumiaji.jina) {
          jina.value = mtumiaji.jina;
        }
        if (simu && !simu.value && mtumiaji.simu) {
          simu.value = mtumiaji.simu;
        }
      }
    });
  }

  // 2. Tuma ombi
  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
      e.preventDefault();

      var mtumiajiStr = localStorage.getItem("mtumiaji");
      if (!mtumiajiStr) {
        alert("Tafadhali ingia kwanza ili kuomba kuona nyumba.");
        window.location.href = "login.html";
        return;
      }

      var mtumiaji = JSON.parse(mtumiajiStr);

      var jina = document.getElementById("viewerName").value.trim();
      var simu = document.getElementById("viewerPhone").value.trim();
      var tarehe = document.getElementById("viewingDate").value;
      var muda = document.getElementById("viewingTime").value;

      if (!jina || !simu || !tarehe || !muda) {
        alert("Tafadhali jaza sehemu zote!");
        return;
      }

      try {
        var token = localStorage.getItem("token");

        if (!token) {
          alert("Tafadhali ingia kwanza!");
          window.location.href = "login.html";
          return;
        }

        var response = await fetch(API_URL + "/viewings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            nyumbaId: nyumba["_id"],
            jina: jina,
            simu: simu,
            tarehe: tarehe,
            muda: muda
          })
        });

        var data = await response.json();

        if (!response.ok) {
          throw new Error(data.kosa || "Imeshindikana kutuma ombi");
        }

        alert("✅ Ombi lako limetumwa! Mmiliki atawasiliana nawe hivi punde.");

        document.getElementById("viewerName").value = "";
        document.getElementById("viewerPhone").value = "";
        document.getElementById("viewingDate").value = "";
        document.getElementById("viewingTime").value = "";

        viewingForm.style.display = "none";
        requestBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Omba Kuiona Nyumba';

      } catch (error) {
        console.error("Error:", error);
        alert("❌ " + error.message);
      }
    });
  }
}

console.log("✅ property-details.js imepakiwa!");