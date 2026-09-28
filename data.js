// data.js — Nyumba zote za NyumbaKwetu (mock data)

const nyumbaZote = [
  {
    id: 1,
    jina: "Nyumba ya kisasa Mlimani City",
    eneo: "Dodoma",
    bei: 350000,
    beiDisplay: "TZS 350,000 / mwezi",
    aina: "Nyumba",
    tag: "KUPANGA",
    vyumba: 2,
    bafu: 1,
    parking: "Parking",
    picha: "Images/house1.jpg",
    maelezo: "Nyumba hii ina mazingira mazuri na inafaa kwa familia. Ipo katika eneo lenye huduma muhimu zinazopatikana kwa urahisi."
  },
  {
    id: 2,
    jina: "Apartment Mbezi Beach",
    eneo: "Dar es Salaam",
    bei: 600000,
    beiDisplay: "TZS 600,000 / mwezi",
    aina: "Apartment",
    tag: "KUPANGA",
    vyumba: 3,
    bafu: 2,
    parking: "Parking",
    picha: "Images/house2.jpg",
    maelezo: "Apartment ya kisasa karibu na ufukwe wa Mbezi. Ina vyumba 3 vya kulala, sebule kubwa, na mazingira tulivu."
  },
  {
    id: 3,
    jina: "Nyumba ya kifahari Goba",
    eneo: "Dodoma",
    bei: 120000000,
    beiDisplay: "TZS 120,000,000",
    aina: "Nyumba",
    tag: "KUUZA",
    vyumba: 4,
    bafu: 3,
    parking: "Garage",
    picha: "Images/house3.jpg",
    maelezo: "Nyumba ya kifahari inauzwa Goba, Dodoma. Ina vyumba 4 vya kulala, bafu 3 za kisasa, na garage kubwa."
  },
  {
    id: 4,
    jina: "Nyumba ya familia Njiro",
    eneo: "Arusha",
    bei: 450000,
    beiDisplay: "TZS 450,000 / mwezi",
    aina: "Nyumba",
    tag: "KUPANGA",
    vyumba: 3,
    bafu: 2,
    parking: "Parking",
    picha: "Images/house4.jpg",
    maelezo: "Nyumba nzuri ya familia iliyopo Njiro, Arusha. Ina vyumba 3, bafu 2, na mazingira ya kuvutia."
  }
];

// Kazi ya kutafuta nyumba kwa id
function pataNyumbaKwaId(id) {
  return nyumbaZote.find(n => n.id === parseInt(id));
}