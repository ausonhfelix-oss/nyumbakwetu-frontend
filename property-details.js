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
  
  console.log("Image section ipo?", imageSection ? "NDIO" : "HAPANA");
  
  if (!imageSection) {
    console.error("KOSA: .property-image-section haipatikani!");
    return;
  }

  // Chukua picha zote
  var pichaZote = (n.picha && n.picha.length > 0) ? n.picha : ["Images/house1.jpg"];
  console.log("Picha zote:", pichaZote);

  // Futa picha ya zamani (static)
  var oldImg = imageSection.querySelector("img");
  if (oldImg) {
    console.log("Picha ya zamani imepatikana - inafutwa");
    oldImg.remove();
  }

  // Futa slideshow ya zamani (kama ipo)
  var oldSlideshow = imageSection.querySelector(".slideshow");
  if (oldSlideshow) {
    console.log("Slideshow ya zamani imepatikana - inafutwa");
    oldSlideshow.remove();
  }

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
  
  // Angalia kama imeingizwa
  var newSlideshow = imageSection.querySelector(".slideshow");
  console.log("Slideshow imeingizwa?", newSlideshow ? "NDIO" : "HAPANA");
  console.log("=== MWISHO ONYESHA NYUMBA ===");

  // ==========================================
  // 2. TAG
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
  // 6. FEATURES
  // ==========================================
  var features = document.querySelectorAll(".property-features > div");
  if (features.length >= 3) {
    features[0].querySelector("span").textContent = n.vyumba + " Vyumba";
    features[1].querySelector("span").textContent = n.bafu + " Bafu";
    features[2].querySelector("span").textContent = n.aina || "Nyumba";
  }

  // ==========================================
  // 7. MAELEZO
  // ==========================================
  var maelezo = document.querySelector(".description p");
  if (maelezo) {
    maelezo.textContent = n.maelezo || "Nyumba hii ina mazingira mazuri.";
  }

  // ==========================================
  // 8. TITLE
  // ==========================================
  document.title = n.jina + " - NyumbaKwetu";

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

      if (mtumiaji.aina === "landlord" || mtumiaji.aina === "admin") {
        alert("Wewe ni Mpangishaji. Huna uwezo wa kuomba viewing.\n\nTafuta nyumba kama Mpangaji.");
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

  // 2. Tuma ombi — ⭐ HAPA NDIPO "async" INAHITAJIKA
  if (submitBtn) {
    submitBtn.addEventListener("click", async function (e) {
    //                                   ↑ ASYNC INAHITAJIKA HAPA!
      e.preventDefault();

      var mtumiajiStr = localStorage.getItem("mtumiaji");
      if (!mtumiajiStr) {
        alert("Tafadhali ingia kwanza ili kuomba kuona nyumba.\n\nItakuchukua sekunde 30 tu!");
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

      // TUMA KWA BACKEND
      try {
        var token = localStorage.getItem("token");

        if (!token) {
          alert("Tafadhali ingia kwanza!");
          window.location.href = "login.html";
          return;
        }

        var response = await fetch(API_URL + "/viewings", {
        //              ↑ HAPA inafanya kazi kwa sababu kuna "async" juu
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