const stores = [
  {
    name: "Tornillos Toyman",
    address: "Frente a Las Gravilias, Cartago, Costa Rica",
    phone: "+506-25910858",
    email: "tornillostoyman@gmail.com",
    lat: 9.9000,
    lng: -84.0833
  },
  {
    name: "Codeorsa",
    address: "20804, Poas, Alajuela, Costa Rica",
    phone: "+506-24583858",
    email: "info@codeorsa.com",
    lat: 10.0170,
    lng: -84.2740
  },
  {
    name: "Confecciones Zae",
    address: "101 m Oeste Cementerio, Escazu, San Jose, Costa Rica",
    phone: "+506-22285197",
    email: "kikescazu@gmail.com",
    lat: 9.9207,
    lng: -84.1462
  },
  {
    name: "DIPROINSUR",
    address: "Frente al Hotel del Sur, Perez Zeledon, Costa Rica",
    phone: "+506-27711066",
    email: "info@diproinsur.com",
    lat: 9.3395,
    lng: -83.6711
  },
  {
    name: "Mayzap Tornillos",
    address: "Heredia, Costa Rica",
    phone: "+506-40017427",
    email: "mayzapcr@gmail.com",
    lat: 10.0024,
    lng: -84.1165
  },
  {
    name: "Autorepuestos Rekasa",
    address: "Puntarenas, Costa Rica",
    phone: "+506-26630110",
    email: "repuestosdelpacifico.fe@gmail.com",
    lat: 9.9769,
    lng: -84.8384
  },
  {
    name: "CON-TACTO SA",
    address: "Curridabat, San Jose, Costa Rica",
    phone: "+506-88755180",
    email: "verafarah@contactocr.com",
    lat: 9.9163,
    lng: -84.0283
  },
  {
    name: "Taller Federico Meza",
    address: "Barrio Paez, San Rafael, Cartago, Costa Rica",
    phone: "+506-88428859",
    email: "fmr-mecanik@hotmail.com",
    lat: 9.8702,
    lng: -83.8951
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