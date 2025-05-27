document.querySelectorAll('.countryButton').forEach(button => {
  button.addEventListener('click', () => {
    const cities = button.nextElementSibling;
    cities.classList.toggle('hidden');
  });
});


document.querySelectorAll('.cityButton').forEach(button => {
  button.addEventListener('click', () => {
    const distributors = button.nextElementSibling;
    distributors.classList.toggle('hidden');
  });
});

const stores = [
  {
    name: "Distribuidor San José",
    address: "San José, Costa Rica",
    phone: "123-456-789",
    email: "sanjose@distribuidor.com",
    lat: 9.9281,
    lng: -84.0907,
    hours: "8:00–17:00"
  },
  {
    name: "Distribuidor Alajuela",
    address: "Alajuela, Costa Rica",
    phone: "123-456-788",
    email: "alajuela@distribuidor.com",
    lat: 10.0159,
    lng: -84.2145,
    hours: "8:00–17:00"
  },
  {
    name: "Distribuidor Caracas",
    address: "Caracas, Venezuela",
    phone: "123-456-787",
    email: "caracas@distribuidor.com",
    lat: 10.4806,
    lng: -66.9036,
    hours: "8:00–17:00"
  },
  {
    name: "Distribuidor Caracas2",
    address: "Caracas, Venezuela",
    phone: "123-456-787",
    email: "caracas@distribuidor.com",
    lat: 10.4856,
    lng: -66.9036,
    hours: "8:00–17:00"
  },
  {
    name: "Distribuidor Caracas3",
    address: "Caracas, Venezuela",
    phone: "123-456-787",
    email: "caracas@distribuidor.com",
    lat: 10.4810,
    lng: -66.9066,
    hours: "8:00–17:00"
  },
  {
    name: "Distribuidor Caracas4",
    address: "Caracas, Venezuela",
    phone: "123-456-787",
    email: "caracas@distribuidor.com",
    lat: 10.4800,
    lng: -66.886,
    hours: "8:00–17:00"
  }
];

let isCtrlPressed = false;

const map = L.map('map', {
  scrollWheelZoom: false  // Disable scroll wheel zoom by default
}).setView([9.9281, -84.0907], 6);

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

// Update the event listeners
mapElement.addEventListener('mouseenter', () => {
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
});

mapElement.addEventListener('wheel', (e) => {
  if (!isCtrlPressed) {
    // Show overlay when scrolling without Ctrl
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    e.preventDefault();
    
    // Clear any existing timeout
    if (overlayTimeout) {
      clearTimeout(overlayTimeout);
    }
    
    // Set new timeout to hide overlay after 2 seconds
    overlayTimeout = setTimeout(() => {
      overlay.classList.remove('active');
      // Wait for transition to complete before hiding
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300); // This should match the duration in the CSS transition
    }, 2000);
  } else {
    // When Ctrl is pressed, allow the map zoom
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

// Make sure map container is focusable
document.getElementById('map').setAttribute('tabindex', '0');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const storeList = document.getElementById("storeList");

stores.forEach((store, index) => {
  const marker = L.marker([store.lat, store.lng]).addTo(map)
    .bindPopup(`<b>${store.name}</b><br>${store.address}`);

  const storeItem = document.createElement("div");
  storeItem.className = "border-b pb-4 cursor-pointer hover:bg-gray-50";
  storeItem.innerHTML = `
    <div class="font-bold text-lg">${store.name}</div>
    <div class="text-sm text-gray-700">${store.address}</div>
    <div class="text-sm mt-1">${store.phone}</div>
    <div class="text-sm">${store.email}</div>
    <div class="text-sm text-gray-600">Program : ${store.hours}</div>
  `;

  storeItem.addEventListener("click", () => {
    map.setView([store.lat, store.lng], 14);
    marker.openPopup();
  });

  storeList.appendChild(storeItem);
});