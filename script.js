// script.js - NyumbaKwetu
var API_URL = "https://nyumbakwetu-backend.vercel.app/api";

var locationInput = document.getElementById("location");
var houseTypeSelect = document.getElementById("houseType");
var priceSelect = document.getElementById("price");
var roomsSelect = document.getElementById("rooms");
var searchButton = document.querySelector(".search-button");
var propertyList = document.querySelector(".property-list");


// ==========================================
// 1. ONYESHA NYUMBA (NA SLIDESHOW)
// ==========================================
function onyeshaNyumba(nyumba) {
  if (!propertyList) return;

  var cards = propertyList.querySelectorAll(".property-card");
  for (var i = 0; i < cards.length; i++) {
    cards[i].remove();
  }

  if (nyumba.length === 0) {
    propertyList.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Hakuna nyumba.</p>';
    return;
  }

  for (var j = 0; j < nyumba.length; j++) {
    var n = nyumba[j];
    var id = n["_id"];

    // Chukua picha zote
    var pichaZote = (n.picha && n.picha.length > 0) ? n.picha : ["Images/house1.jpg"];

    var tag = "KUPANGA";
    var tagClass = "property-tag";
    if (n.lengo === "kuuza") {
      tag = "KUUZA";
      tagClass = "property-tag sale";
    }

    var bei = "TZS " + n.bei.toLocaleString();
    if (n.lengo !== "kuuza") {
      bei = bei + " / mwezi";
    }

    var parking = "";
    if (n.parking === "Ndio") {
      parking = '<span><i class="fa-solid fa-car"></i> Parking</span>';
    }

    var card = document.createElement("article");
    card.className = "property-card";
    card.id = id;
    card.setAttribute("data-type", (n.aina || "").toLowerCase());
    card.setAttribute("data-price", n.bei);
    card.setAttribute("data-rooms", n.vyumba);
    card.setAttribute("data-location", n.mkoa || "");
    card.onclick = (function(cardId) {
      return function() {
        window.location.href = "property-details.html?id=" + cardId;
      };
    })(id);

    // SLIDESHOW HTML
    var slideshowHtml =
      '<div class="slideshow" data-current="0" data-images=\'' + JSON.stringify(pichaZote) + '\'>' +
        '<img src="' + pichaZote[0] + '" class="slide-main" alt="' + n.jina + '">' +
        '<div class="slide-counter">1 / ' + pichaZote.length + '</div>' +
        (pichaZote.length > 1 ?
          '<button class="slide-prev" onclick="event.stopPropagation(); badilishaPicha(this, -1)">&#9668;</button>' +
          '<button class="slide-next" onclick="event.stopPropagation(); badilishaPicha(this, 1)">&#9658;</button>'
          : '') +
        '<div class="slide-dots">' +
          pichaZote.map(function(p, i) {
            return '<span class="dot' + (i === 0 ? ' active' : '') + '" ' +
                   'onclick="event.stopPropagation(); nendaPicha(this, ' + i + ')"></span>';
          }).join('') +
        '</div>' +
      '</div>';

    var html = '';
    html = html + '<div class="property-image">';
    html = html + slideshowHtml;
    html = html + '<span class="' + tagClass + '">' + tag + '</span>';
    html = html + '<button class="favorite-btn" data-id="' + id + '" onclick="event.stopPropagation();">';
    html = html + '<i class="fa-regular fa-heart"></i>';
    html = html + '</button>';
    html = html + '</div>';
    html = html + '<div class="property-info">';
    html = html + '<h3>' + n.jina + '</h3>';
    html = html + '<p class="property-location">';
    html = html + '<i class="fa-solid fa-location-dot"></i> ' + n.eneo + ', ' + n.mkoa;
    html = html + '</p>';
    html = html + '<strong class="property-price">' + bei + '</strong>';
    html = html + '<div class="property-details">';
    html = html + '<span><i class="fa-solid fa-bed"></i> ' + n.vyumba + ' Vyumba</span>';
    html = html + '<span><i class="fa-solid fa-bath"></i> ' + n.bafu + ' Bafu</span>';
    html = html + parking;
    html = html + '</div>';
    html = html + '</div>';

    card.innerHTML = html;
    propertyList.appendChild(card);
  }

  anzishaFavorites();
}


// ==========================================
// 2. CHUKUA NYUMBA KUTOKA API
// ==========================================
async function chukuaNyumba() {
  try {
    var response = await fetch(API_URL + "/properties");
    var data = await response.json();

    if (!data.nyumba || data.nyumba.length === 0) {
      if (propertyList) {
        propertyList.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Hakuna nyumba bado. Weka nyumba yako!</p>';
      }
      return;
    }

    console.log("Nyumba zimepakiwa:", data.nyumba.length);
    onyeshaNyumba(data.nyumba);
  } catch (error) {
    console.error("Error:", error);
    if (propertyList) {
      propertyList.innerHTML = '<p style="color:red;padding:40px;">Imeshindikana kupata nyumba.</p>';
    }
  }
}


// ==========================================
// 3. FILTER PROPERTIES
// ==========================================
function filterProperties() {
  var location = (locationInput ? locationInput.value : "").toLowerCase().trim();
  var houseType = houseTypeSelect ? houseTypeSelect.value : "";
  var maxPrice = priceSelect && priceSelect.value ? parseInt(priceSelect.value) : null;
  var rooms = roomsSelect && roomsSelect.value ? parseInt(roomsSelect.value) : null;

  var cards = document.querySelectorAll(".property-card");
  var zilizoonekana = 0;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var cardLocation = (card.getAttribute("data-location") || "").toLowerCase();
    var cardType = card.getAttribute("data-type") || "";
    var cardPrice = parseInt(card.getAttribute("data-price") || "0");
    var cardRooms = parseInt(card.getAttribute("data-rooms") || "0");

    var matchLocation = !location || cardLocation.indexOf(location) !== -1;
    var matchType = !houseType || cardType === houseType;
    var matchPrice = !maxPrice || cardPrice <= maxPrice;
    var matchRooms = !rooms || cardRooms >= rooms;

    if (matchLocation && matchType && matchPrice && matchRooms) {
      card.style.display = "";
      zilizoonekana++;
    } else {
      card.style.display = "none";
    }
  }

  var noResults = document.getElementById("noResultsMessage");
  if (zilizoonekana === 0) {
    if (!noResults) {
      noResults = document.createElement("p");
      noResults.id = "noResultsMessage";
      noResults.style.cssText = "text-align:center;padding:30px;color:#888;";
      noResults.textContent = "Hakuna nyumba inayolingana.";
      propertyList.appendChild(noResults);
    }
  } else if (noResults) {
    noResults.remove();
  }
}


// ==========================================
// 4. FAVORITES
// ==========================================
function pataFavorites() {
  var saved = localStorage.getItem("nyumbaFavorites");
  return saved ? JSON.parse(saved) : [];
}

function hifadhiFavorites(favorites) {
  localStorage.setItem("nyumbaFavorites", JSON.stringify(favorites));
}

function sasishaMoyo(button, isFavorited) {
  var icon = button.querySelector("i");
  if (!icon) return;
  if (isFavorited) {
    icon.classList.remove("fa-regular");
    icon.classList.add("fa-solid");
    button.classList.add("active");
  } else {
    icon.classList.remove("fa-solid");
    icon.classList.add("fa-regular");
    button.classList.remove("active");
  }
}

function bonyezaMoyo(event) {
  event.stopPropagation();
  event.preventDefault();
  var button = event.currentTarget;
  var id = button.getAttribute("data-id");
  if (!id) return;

  var favorites = pataFavorites();
  var index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
    sasishaMoyo(button, true);
  } else {
    favorites.splice(index, 1);
    sasishaMoyo(button, false);
  }
  hifadhiFavorites(favorites);
}

function anzishaFavorites() {
  var favorites = pataFavorites();
  var buttons = document.querySelectorAll(".favorite-btn");
  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    var id = button.getAttribute("data-id");
    var isFavorited = favorites.indexOf(id) !== -1;
    sasishaMoyo(button, isFavorited);
    button.addEventListener("click", bonyezaMoyo);
  }
}


// ==========================================
// 5. SLIDESHOW FUNCTIONS
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
// 6. NAVIGATION
// ==========================================
if (searchButton) searchButton.addEventListener("click", filterProperties);
if (locationInput) locationInput.addEventListener("input", filterProperties);
if (houseTypeSelect) houseTypeSelect.addEventListener("change", filterProperties);
if (priceSelect) priceSelect.addEventListener("change", filterProperties);
if (roomsSelect) roomsSelect.addEventListener("change", filterProperties);


// ==========================================
// 7. NAVIGATION: Akaunti (Header)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  var headerAkaunti = document.getElementById("headerAkaunti");

  if (headerAkaunti) {
    headerAkaunti.addEventListener("click", function () {
      var mtumiajiStr = localStorage.getItem("mtumiaji");
      if (!mtumiajiStr) {
       // window.location.href = "login.html";
        return;
      }
      var mtumiaji = JSON.parse(mtumiajiStr);
      if (mtumiaji.aina === "admin") {
        window.location.href = "admin-dashboard.html";
      } else if (mtumiaji.aina === "landlord") {
        window.location.href = "landlord-dashboard.html";
      } else {
        window.location.href = "tenant-dashboard.html";
      }
    });
  }
});


// ==========================================
// 8. NAVIGATION: Tafuta
// ==========================================
var navTafuta = document.getElementById("navTafuta");
if (navTafuta) {
  navTafuta.addEventListener("click", function (e) {
    e.preventDefault();
    var searchBox = document.querySelector(".search-box");
    if (searchBox) {
      searchBox.scrollIntoView({ behavior: "smooth" });
      var locationInput = document.getElementById("location");
      if (locationInput) locationInput.focus();
    }
  });
}


// ==========================================
// 9. NAVIGATION: Zilizohifadhiwa
// ==========================================
var navZilizohifadhiwa = document.getElementById("navZilizohifadhiwa");
if (navZilizohifadhiwa) {
  navZilizohifadhiwa.addEventListener("click", function (e) {
    e.preventDefault();
    var mtumiajiStr = localStorage.getItem("mtumiaji");
    if (!mtumiajiStr) {
      
      window.location.href = "login.html";
      return;
    }
    window.location.href = "tenant-dashboard.html#zilizohifadhiwa";
  });
}


// ==========================================
// 10. NAVIGATION: Akaunti (Mobile)
// ==========================================
var navAkaunti = document.getElementById("navAkaunti");
if (navAkaunti) {
  navAkaunti.addEventListener("click", function (e) {
    e.preventDefault();
    var mtumiajiStr = localStorage.getItem("mtumiaji");
    if (!mtumiajiStr) {
      window.location.href = "login.html";
      return;
    }
    var mtumiaji = JSON.parse(mtumiajiStr);
    if (mtumiaji.aina === "admin") {
      window.location.href = "admin-dashboard.html";
    } else if (mtumiaji.aina === "landlord") {
      window.location.href = "landlord-dashboard.html";
    } else {
      window.location.href = "tenant-dashboard.html";
    }
  });
}


// ==========================================
// 11. NAVIGATION: Weka Nyumba
// ==========================================
var navWekaNyumba = document.querySelector(".mobile-bottom-nav .add-button");
if (navWekaNyumba) {
  navWekaNyumba.addEventListener("click", function (e) {
    var mtumiajiStr = localStorage.getItem("mtumiaji");
    if (!mtumiajiStr) {
      e.preventDefault();
      alert("Tafadhali ingia kwanza kuweka nyumba!");
      window.location.href = "login.html";
      return;
    }
    var mtumiaji = JSON.parse(mtumiajiStr);
    if (mtumiaji.aina === "tenant") {
      e.preventDefault();
      alert("Wewe ni Mpangaji. samahani jisajili kama mpangishaji.");
      window.location.href = "login.html";
      return;
    }
  });
}


// ==========================================
// 12. ANZISHA
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
  chukuaNyumba();
});

console.log("script.js imepakiwa!");