let map;
let markers = [];
let userMarker;

function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 23.7, lng: 121 },
    zoom: 7
  });

  renderAllStores();

  getUserLocation();
}

// 顯示全部門市
function renderAllStores() {
  renderStores(stores);
  renderMarkers(stores);
}

// marker
function renderMarkers(list) {

  markers.forEach(m => m.setMap(null));
  markers = [];

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
  });
}

// list
function renderStores(list) {

  const container = document.getElementById("storeList");
  container.innerHTML = "";

  list.forEach(store => {

    const div = document.createElement("div");
    div.className = "store";

    div.innerHTML = `
        <div class="store-name">${store.name}</div>

        <div class="store-meta">
          <div> ${store.address}</div>
        </div>

        <details class="store-more">
            <summary>更多資訊</summary>
            <div>📞 ${store.phone || "-"}</div>
            <div>🕒 ${store.hours || "-"}</div>
            <div>ℹ️ ${store.note || "-"}</div>
        </details>
    `;

    div.onclick = () => {
      map.setCenter({ lat: store.lat, lng: store.lng });
      map.setZoom(15);
    };

    container.appendChild(div);
  });
}

// 搜尋
document.addEventListener("input", (e) => {

  if (e.target.id !== "searchBox") return;

  const keyword = e.target.value.toLowerCase();

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(keyword) ||
    s.address.toLowerCase().includes(keyword)
  );

  renderStores(filtered);
  renderMarkers(filtered);
});

// 目前位置
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