let map;
let markers=[];
let markerMap={};
let userMarker;

let currentList=[];
let activeStoreName=null;

let filters={
  keyword:"",
  region:"",
  electricBed:false,
  pressureBed:false
};

function initMap(){
  map=new google.maps.Map(document.getElementById("map"),{
    center:{lat:23.7,lng:121},
    zoom:7
  });

  currentList=stores;

  renderStores(currentList);
  renderMarkers(currentList);
  updateFilterChips();
//   getUserLocation();
}

/* ================= MARKERS ================= */

function renderMarkers(list){
  markers.forEach(m=>m.setMap(null));
  markers=[];
  markerMap={};

  list.forEach(store=>{
    const marker=new google.maps.Marker({
      position:{lat:store.lat,lng:store.lng},
      map,
      title:store.name
    });

    const info=new google.maps.InfoWindow({
      content:`<b>${store.name}</b><br>${store.address}<br>${store.phone||""}`
    });

    marker.addListener("click",()=>info.open(map,marker));

    markers.push(marker);
    markerMap[store.name]=marker;
  });
}

/* ================= STORE LIST ================= */

function renderStores(list){
  const container=document.getElementById("storeList");
  const count=document.getElementById("resultCount");
  const chips=document.getElementById("filterChips");

  container.innerHTML="";
  if(count) count.textContent=`共 ${list.length} 間門市`;
  if(chips) chips.innerHTML="";

  if(list.length===0){
    container.innerHTML=`<div style="color:#999;font-size:13px;padding:10px;">沒有符合條件的門市</div>`;
    return;
  }

  list.forEach(store=>{
    const div=document.createElement("div");
    div.className="store";
    div.dataset.name=store.name;

    div.innerHTML=`
      <div class="store-name">${store.name}</div>
      <div class="store-meta">📍 ${store.address}</div>

      <details class="store-more">
        <summary>更多資訊</summary>
        <div>📞 ${store.phone||"-"}</div>
        <div>🕒 ${store.hours||"-"}</div>
        <div>ℹ️ ${store.note||"-"}</div>

        <div style="margin-top:6px;">
          <a target="_blank" rel="noopener noreferrer"
          href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}">
          🚗 如何前往
          </a>
        </div>
      </details>
    `;

    div.addEventListener("click",e=>{
      if(e.target.tagName==="SUMMARY"||e.target.tagName==="A") return;

      activeStoreName=store.name;

      map.setCenter({lat:store.lat,lng:store.lng});
      map.setZoom(15);

      updateActiveState();
    });

    container.appendChild(div);
  });

  updateActiveState();
}

/* ================= ACTIVE ================= */

function updateActiveState(){
  document.querySelectorAll(".store").forEach(el=>{
    el.classList.toggle("active",el.dataset.name===activeStoreName);
  });
}

/* ================= FILTER ================= */

function applyFilters(){
  currentList=stores.filter(store=>{
    if(filters.keyword && !(store.name.includes(filters.keyword)||store.address.includes(filters.keyword))) return false;
    if(filters.region && !store.address.includes(filters.region)) return false;
    if(filters.electricBed && !(store.note||"").includes("電動床")) return false;
    if(filters.pressureBed && !(store.note||"").includes("防褥瘡")) return false;
    return true;
  });

  renderStores(currentList);
  renderMarkers(currentList);
  syncInputs();
  updateFilterChips();
}

/* ================= CHIPS ================= */

function updateFilterChips(){
  const chips=document.getElementById("filterChips");
  if(!chips) return;

  chips.innerHTML="";

  Object.keys(filters).forEach(key=>{
    const val=filters[key];

    if(val===false || val==="" || val===null) return;

    const chip=document.createElement("div");
    chip.style.cssText="font-size:12px;background:#eef5ff;padding:4px 8px;border-radius:999px;cursor:pointer;";

    let label="";

    if(typeof val==="boolean"){
      label=`${key}:${val}`;
    }else{
      label=`${key}:${val}`;
    }

    chip.textContent=label;

    chip.onclick=()=>{
      if(typeof val==="boolean"){
        filters[key]=false;
        const el=document.getElementById(key+"Filter");
        if(el) el.checked=false;
      }else{
        filters[key]="";
        const el=document.getElementById(key+"Filter") || document.getElementById("regionFilter") || document.getElementById("searchBox");
        if(el && el.tagName==="INPUT") el.value="";
        if(el && el.tagName==="SELECT") el.value="";
      }

      applyFilters();
    };

    chips.appendChild(chip);
  });
}

/* ================= EVENTS ================= */

document.addEventListener("input",e=>{
  if(e.target.id==="searchBox"){
    filters.keyword=e.target.value;
    applyFilters();
  }

  if(e.target.id==="electricBedFilter"){
    filters.electricBed=e.target.checked;
    applyFilters();
  }

  if(e.target.id==="pressureBedFilter"){
    filters.pressureBed=e.target.checked;
    applyFilters();
  }
});

document.getElementById("regionFilter").addEventListener("change",e=>{
  filters.region=e.target.value;
  applyFilters();
});

document.getElementById("filterToggle").addEventListener("click",()=>{
  document.getElementById("filterPanel").classList.toggle("show");
});

/* ================= GEO ================= */

function getUserLocation(){
  if(!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(pos=>{
    const userPos={lat:pos.coords.latitude,lng:pos.coords.longitude};

    map.setCenter(userPos);
    map.setZoom(12);

    userMarker=new google.maps.Marker({
      position:userPos,
      map,
      title:"目前位置"
    });
  });
}

function syncInputs(){
  const search=document.getElementById("searchBox");
  if(search) search.value=filters.keyword;

  const region=document.getElementById("regionFilter");
  if(region) region.value=filters.region;
}

window.initMap=initMap;