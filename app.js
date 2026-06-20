let map;
let markers = [];
let markerMap = {};
let userMarker;

let currentList = [];
let activeStoreName = null;

function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 23.7, lng: 121 },
    zoom: 7
  });

  currentList = stores;

  renderStores(currentList);
  renderMarkers(currentList);

  getUserLocation();
}

/* -------------------------
   MARKERS
-------------------------- */
function renderMarkers(list) {

  markers.forEach(m => m.setMap(null));
  markers = [];
  markerMap = {};

  list.forEach(store => {

    const marker = new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map,
      title: store.name
    });

    const info = new google.maps.InfoWindow({
      content: `
        <b>${store.name}</b><br>
        ${store.address}<br>
        ${store.phone || ""}
      `
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });

    markers.push(marker);
    markerMap[store.name] = marker;
  });
}

/* -------------------------
   STORE LIST (ONE TIME RENDER)
-------------------------- */
function renderStores(list) {

  const container = document.getElementById("storeList");
  container.innerHTML = "";

  list.forEach(store => {

    const div = document.createElement("div");

    div.className = "store";
    div.dataset.name = store.name;

    div.innerHTML = `
      <div class="store-name">${store.name}</div>

      <div class="store-meta">
        <div>${store.address}</div>
      </div>

      <details class="store-more">
        <summary>更多資訊</summary>
        <div>📞 ${store.phone || "-"}</div>
        <div>🕒 ${store.hours || "-"}</div>
        <div>ℹ️ ${store.note || "-"}</div>
        <div>
            <a 
                href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}"
                target="_blank"
                rel="noopener noreferrer"
            >
                🚗 如何前往
            </a>
        </div>
      </details>
    `;

    /* click：只改 state，不重畫 DOM */
    div.addEventListener("click", (e) => {

      e.stopPropagation();

      activeStoreName = store.name;

      map.setCenter({ lat: store.lat, lng: store.lng });
      map.setZoom(15);

      updateActiveState();
    });

    /* hover：marker feedback */
    div.addEventListener("mouseenter", () => {

      const marker = markerMap[store.name];
      if (!marker) return;

      marker.setAnimation(google.maps.Animation.BOUNCE);

      setTimeout(() => {
        marker.setAnimation(null);
      }, 700);

      map.panTo(marker.getPosition());
    });

    container.appendChild(div);
  });

  updateActiveState();
}

/* -------------------------
   ACTIVE STATE ONLY
-------------------------- */
function updateActiveState() {

  document.querySelectorAll(".store").forEach(el => {

    if (el.dataset.name === activeStoreName) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

/* -------------------------
   SEARCH (FILTER STATE ONLY)
-------------------------- */
document.addEventListener("input", (e) => {

  if (e.target.id !== "searchBox") return;

  const keyword = e.target.value.toLowerCase();

  currentList = stores.filter(s =>
    s.name.toLowerCase().includes(keyword) ||
    s.address.toLowerCase().includes(keyword)
  );

  renderStores(currentList);
  renderMarkers(currentList);
});

/* -------------------------
   GEOLOCATION
-------------------------- */
function getUserLocation() {

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos => {

    const userPos = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    map.setCenter(userPos);
    map.setZoom(12);

    userMarker = new google.maps.Marker({
      position: userPos,
      map,
      title: "目前位置"
    });

  });
}

window.initMap = initMap;