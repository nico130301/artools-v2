const stores = [
  {
    name: "CODEORSA",
    address: "20804, Poas, Alajuela, Costa Rica",
    phone: "+506-24583858",
    email: "info@codeorsa.com",
    lat: 10.03842,
    lng: -84.27151
  },
  {
    name: "TORNILLOS MANGUERAS TOYMAN SA",
    address: "Frente a la Gravilias, Cartago, Costa Rica",
    phone: "+506-25910858",
    email: "tornillostoyman@gmail.com",
    lat: 9.86721,
    lng: -83.92407
  },
  {
    name: "CONFECCIONES ZAE",
    address: "100 m Oeste Cementerio, Escazu, San Jose, Costa Rica",
    phone: "+506-22285197",
    email: "kikescazu@gmail.com",
    lat: 9.92052,
    lng: -84.14633
  },
  {
    name: "DIPROINSUR",
    address: "Frente al Hotel del Sur, Perez Zeledon, Costa Rica",
    phone: "+506-27711066",
    email: "info@diproinsur.com",
    lat: 9.33995,
    lng: -83.67246
  },
  {
    name: "MAZAP TORNILLOS",
    address: "Heredia, Costa Rica",
    phone: "+506-40017427",
    email: "mayzapcr@gmail.com",
    lat: 10.01598,
    lng: -84.12209
  },
  {
    name: "AUTOREPUESTOS REKASA",
    address: "Puntarenas, Costa Rica",
    phone: "+506-26630110",
    email: "repuestosdelpacifico.fe@gmail.com",
    lat: 8.52611,
    lng: -82.83544
  },
  {
    name: "CON-TACTO SA",
    address: "Curridabat, San Jose, Costa Rica",
    phone: "+506-88755180",
    email: "verafarah@contactocr.com",
    lat: 9.93018,
    lng: -84.04027
  },
  {
    name: "FERRETERIA COCORÍ",
    address: "50 m. Norte Escuela Cocorí, Cocorí, Cartago, Costa Rica",
    phone: "+506-85591366",
    email: "Jeisonmiranda10@gmail.com",
    lat: 9.84276,
    lng: -83.92240
  },
  {
    name: "AGROCOMERCIAL CARICOS",
    address: "Frente al Templo Católico, Llano Grande, Cartago, Costa Rica",
    phone: "+506-89633436",
    email: "agrocomercaricos21@gmail.com",
    lat: 9.93994,
    lng: -83.91126
  },
  {
    name: "FERRECOCLES",
    address: "Diagonal a la Plaza de Deportes, Cocles, Talamanca, Limón",
    phone: "+506-27502102",
    email: "informes@ferrecocles.com",
    lat: 9.64461,
    lng: -82.72978
  },
  {
    name: "MERCASA",
    address: "Agua Caliente, Cartago, Costa Rica",
    phone: "+506-25524137",
    email: "ventas@grupomercasa.com",
    lat: 9.84271,
    lng: -83.91537
  },
  {
    name: "ALMACEN Y FERRETERIA GONAR",
    address: "125 m Este del BNCR, Puerto Viejo, Sarapiquí, Heredia",
    phone: "+506-27666196",
    email: "gonar01rg@gmail.com",
    lat: 9.33995,
    lng: -83.67246
  }
];

let isCtrlPressed = false;

const map = L.map('map', {
  scrollWheelZoom: false 
}).setView([9.9281, -84.0907], 8);

// Initialize map centered on Costa Rica
const mapElement = document.getElementById('map');

const overlay = document.createElement('div');
overlay.className = 'map-overlay opacity-0';
overlay.style.cssText = 'position: absolute; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;';
const overlayText = document.createElement('div');
overlayText.className = 'map-overlay-text';
overlayText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(0,0,0,0.7); padding: 1rem; border-radius: 0.5rem;';
overlayText.textContent = 'For zoom, use Ctrl + Scroll';
overlay.appendChild(overlayText);
mapElement.appendChild(overlay);

let overlayTimeout;

mapElement.addEventListener('mouseenter', () => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

mapElement.addEventListener('wheel', (e) => {
  if (!isCtrlPressed) {

    overlay.classList.add('active');
    overlay.style.display = 'flex';
    e.preventDefault();
    

    if (overlayTimeout) {
      clearTimeout(overlayTimeout);
    }
    

    overlayTimeout = setTimeout(() => {
      overlay.classList.remove('active');

      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }, 2000);
  } else {

    map.scrollWheelZoom.enable();
  }
});

function handleKeyDown(e) {
  if (e.ctrlKey) {
    isCtrlPressed = true;
    map.scrollWheelZoom.enable();
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
    if (overlayTimeout) {
      clearTimeout(overlayTimeout);
    }
  }
}

function handleKeyUp(e) {
  if (e.key === 'Control') {
    isCtrlPressed = false;
    map.scrollWheelZoom.disable();
  }
}

document.getElementById('map').setAttribute('tabindex', '0');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const storeList = document.getElementById("storeList");

const orangeIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

stores.forEach((store, index) => {
  const marker = L.marker([store.lat, store.lng], {icon: orangeIcon}).addTo(map)
    .bindPopup(`<b>${store.name}</b><br>${store.address}`);


  const storeItem = document.createElement("div");
  storeItem.className = "border-b pb-4 cursor-pointer hover:bg-gray-50";
  storeItem.innerHTML = `
    <div class="font-bold text-lg">${store.name}</div>
    <div class="text-sm text-gray-700">${store.address}</div>
    <div class="text-sm mt-1">${store.phone}</div>
    <div class="text-sm">${store.email}</div>
`;

  storeItem.addEventListener("click", () => {
    map.setView([store.lat, store.lng], 14);
    marker.openPopup();
  });

  storeList.appendChild(storeItem);
});