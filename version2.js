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

/* ================= INIT ================= */

function bootstrap(){
  const mapEl=document.getElementById("map");
  const searchEl=document.getElementById("searchBox");
  const regionEl=document.getElementById("regionFilter");
  const filterBtn=document.getElementById("filterToggle");

  if(!mapEl || typeof stores==="undefined") return;

  initMap();

  if(searchEl){
    searchEl.addEventListener("input",onSearch);
  }

  if(regionEl){
    regionEl.addEventListener("change",onRegion);
  }

  const eb=document.getElementById("electricBedFilter");
  const pb=document.getElementById("pressureBedFilter");

  if(eb) eb.addEventListener("change",onFilters);
  if(pb) pb.addEventListener("change",onFilters);

  if(filterBtn){
    filterBtn.addEventListener("click",()=>{
      const panel=document.getElementById("filterPanel");
      if(panel) panel.classList.toggle("show");
    });
  }
}

window.addEventListener("DOMContentLoaded",bootstrap);

/* ================= MAP ================= */

function initMap(){
  const mapEl=document.getElementById("map");
  if(!mapEl) return;

  map=new google.maps.Map(mapEl,{
    center:{lat:23.7,lng:121},
    zoom:7
  });

  currentList=stores;

  renderStores(currentList);
  renderMarkers(currentList);
  updateFilterChips();
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

  if(!container) return;

  container.innerHTML="";

  if(count){
    count.textContent=`共 ${list.length} 間門市`;
  }

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

      if(map){
        map.setCenter({lat:store.lat,lng:store.lng});
        map.setZoom(15);
      }

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
    chip.textContent=`${key}:${val}`;

    chip.onclick=()=>{
      if(typeof val==="boolean"){
        filters[key]=false;
        const el=document.getElementById(key+"Filter");
        if(el) el.checked=false;
      }else{
        filters[key]="";

        const search=document.getElementById("searchBox");
        const region=document.getElementById("regionFilter");

        if(key==="keyword" && search) search.value="";
        if(key==="region" && region) region.value="";
      }

      applyFilters();
    };

    chips.appendChild(chip);
  });
}

/* ================= EVENTS ================= */

function onSearch(e){
  filters.keyword=e.target.value;
  applyFilters();
}

function onRegion(e){
  filters.region=e.target.value;
  applyFilters();
}

function onFilters(e){
  if(e.target.id==="electricBedFilter"){
    filters.electricBed=e.target.checked;
  }

  if(e.target.id==="pressureBedFilter"){
    filters.pressureBed=e.target.checked;
  }

  applyFilters();
}