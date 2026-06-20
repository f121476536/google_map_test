let map;
let markers = [];

const stores = [
  {
    name: "台中新光三越店",
    address: "台中市西屯區台灣大道三段301號",
    lat: 24.1579,
    lng: 120.6467
  },
  {
    name: "高雄漢神巨蛋店",
    address: "高雄市左營區博愛二路777號",
    lat: 22.6693,
    lng: 120.3026
  },
  {
    name: "新竹SOGO店",
    address: "新竹市東區中央路",
    lat: 24.8047,
    lng: 120.9686
  },
  {
    name: "新北板橋門市",
    address: "新北市板橋區懷德街181巷7號",
    lat: 25.0236,
    lng: 121.4685
  }
];

function initMap() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 23.7, lng: 121 },
    zoom: 7
  });

  renderStores(stores);
  renderMarkers(stores);
}

function renderStores(list) {
  const container = document.getElementById("storeList");
  container.innerHTML = "";

  list.forEach((store, index) => {
    const div = document.createElement("div");
    div.className = "store";
    div.innerHTML = `<b>${store.name}</b><br>${store.address}`;

    div.onclick = () => {
      map.setCenter({ lat: store.lat, lng: store.lng });
      map.setZoom(15);
    };

    container.appendChild(div);
  });
}

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
      content: `<b>${store.name}</b><br>${store.address}`
    });

    marker.addListener("click", () => {
      info.open(map, marker);
    });

    markers.push(marker);
  });
}

// search
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

window.initMap = initMap;