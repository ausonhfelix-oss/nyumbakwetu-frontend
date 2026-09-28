// property-details.js — NyumbaKwetu (Dynamic kutoka API)

const API_URL = "http://127.0.0.1:5000/api";

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


function onyeshaNyumba(n) {
  // 1. Picha
  var img = document.querySelector(".property-image-section img");
  if (img) {
    var picha = "images/house1.jpg";
    if (n.picha && n.picha.length > 0 && n.picha[0]) {
      picha = n.picha[0];
    }
    img.src = picha;
    img.alt = n.jina;
  }

  // 2. Tag
  var tag = document.querySelector(".property-image-section .property-tag");
  if (tag) {
    var tagText = "KUPANGA";
    if (n.lengo === "kuuza") {
      tagText = "KUUZA";
      tag.classList.add("sale");
    }
    tag.textContent = tagText;
  }

  // 3. Jina
  var jina = document.querySelector(".property-details h1");
  if (jina) jina.textContent = n.jina;

  // 4. Eneo
  var eneo = document.querySelector(".property-location");
  if (eneo) {
    eneo.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + n.eneo + ", " + n.mkoa;
  }

  // 5. Bei
  var bei = document.querySelector(".property-price");
  if (bei) {
    var beiText = "TZS " + n.bei.toLocaleString();
    if (n.lengo !== "kuuza") {
      beiText = beiText + " / mwezi";
    }
    bei.textContent = beiText;
  }

  // 6. Features
  var features = document.querySelectorAll(".property-features > div");
  if (features.length >= 3) {
    features[0].querySelector("span").textContent = n.vyumba + " Vyumba";
    features[1].querySelector("span").textContent = n.bafu + " Bafu";
    features[2].querySelector("span").textContent = n.aina || "Nyumba";
  }

  // 7. Maelezo
  var maelezo = document.querySelector(".description p");
  if (maelezo) {
    maelezo.textContent = n.maelezo || "Nyumba hii ina mazingira mazuri.";
  }

  // 8. Title
  document.title = n.jina + " - NyumbaKwetu";

  console.log("Property details zimepakiwa!");
}


// ==========================================
// VIEWING FORM
// ==========================================
function anzishaViewingForm(nyumba) {
  var requestBtn = document.getElementById("requestViewingBtn");
  var viewingForm = document.getElementById("viewingForm");
  var submitBtn = document.getElementById("submitViewing");

  // 1. Bonyeza button → onyesha/ficha form
  if (requestBtn && viewingForm) {
    requestBtn.addEventListener("click", function () {
      if (viewingForm.style.display === "block") {
        viewingForm.style.display = "none";
        requestBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Omba Kuiona Nyumba';
      } else {
        viewingForm.style.display = "block";
        requestBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Funga Fomu';
      }
    });
  }

  // 2. Tuma ombi
  if (submitBtn) {
    submitBtn.addEventListener("click", function (e) {
      e.preventDefault();

      var jina = document.getElementById("viewerName").value.trim();
      var simu = document.getElementById("viewerPhone").value.trim();
      var tarehe = document.getElementById("viewingDate").value;
      var muda = document.getElementById("viewingTime").value;

      if (!jina || !simu || !tarehe || !muda) {
        alert("Tafadhali jaza sehemu zote!");
        return;
      }

      var ombi = {
        id: Date.now(),
        nyumbaId: nyumba["_id"],
        nyumbaJina: nyumba.jina,
        jina: jina,
        simu: simu,
        tarehe: tarehe,
        muda: muda,
        hali: "Pending",
        tareheYaOmbi: new Date().toLocaleDateString("sw-TZ")
      };

      var maombi = JSON.parse(localStorage.getItem("maombiYaViewing") || "[]");
      maombi.push(ombi);
      localStorage.setItem("maombiYaViewing", JSON.stringify(maombi));

      console.log("Ombi limetumwa:", ombi);
      alert("Ombi lako limetumwa! Tutawasiliana nawe hivi karibuni.");

      document.getElementById("viewerName").value = "";
      document.getElementById("viewerPhone").value = "";
      document.getElementById("viewingDate").value = "";
      document.getElementById("viewingTime").value = "";

      viewingForm.style.display = "none";
      requestBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Omba Kuiona Nyumba';
    });
  }
}

console.log("property-details.js imepakiwa!");