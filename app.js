let map;
let markers=[];
let markerMap={};
let activeInfoWindow=null;

let currentList=[];
let activeStoreName=null;

let filters={
  keyword:"",
  region:"",
  electricBed:false,
  pressureBed:false
};

/* 篩選標籤的顯示文字；勾選類條件只顯示名稱，不顯示 true/false */
const FILTER_LABELS={
  keyword:v=>`關鍵字：${v}`,
  region:v=>`地區：${v}`,
  electricBed:()=>"電動床陳列",
  pressureBed:()=>"防褥瘡床墊陳列"
};

/* ================= HELPERS ================= */

/* 選填欄位（電話、營業時間、陳列說明）是空的就不顯示 */
function hasValue(v){
  return typeof v==="string" && v.trim()!=="";
}

function telHref(phone){
  return "tel:"+phone.replace(/[^0-9+]/g,"");
}

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

  if(activeInfoWindow){
    activeInfoWindow.close();
    activeInfoWindow=null;
  }

  list.forEach(store=>{
    const marker=new google.maps.Marker({
      position:{lat:store.lat,lng:store.lng},
      map,
      title:store.name
    });

    /* 店名放在 headerContent，樣式由 style.css 的 InfoWindow 區塊覆蓋 */
    const header=document.createElement("div");
    header.textContent=store.name;

    const body=document.createElement("div");
    body.className="iw-body";
    body.innerHTML=`<div>${store.address}</div>`+
      (hasValue(store.phone)
        ? `<div><a href="${telHref(store.phone)}">${store.phone}</a></div>`
        : "");

    const info=new google.maps.InfoWindow({
      headerContent:header,
      content:body
    });

    marker.addListener("click",()=>{
      if(activeInfoWindow) activeInfoWindow.close();
      /* shouldFocus:false：不要把焦點移到電話連結上，否則會出現焦點外框 */
      info.open({map,anchor:marker,shouldFocus:false});
      activeInfoWindow=info;

      activeStoreName=store.name;
      updateActiveState();

      const el=document.querySelector(`.store[data-name="${CSS.escape(store.name)}"]`);
      if(el) el.scrollIntoView({behavior:"smooth",block:"nearest"});
    });

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

    const rows=[];
    if(hasValue(store.phone)) rows.push(`<div>📞 <a href="${telHref(store.phone)}">${store.phone}</a></div>`);
    if(hasValue(store.hours)) rows.push(`<div>🕒 ${store.hours}</div>`);
    if(hasValue(store.note))  rows.push(`<div>ℹ️ ${store.note}</div>`);

    div.innerHTML=`
      <div class="store-name">${store.name}</div>
      <div class="store-meta">📍 ${store.address}</div>

      <details class="store-more">
        <summary>更多資訊</summary>
        ${rows.join("")}

        <div class="store-nav-wrap">
          <a class="store-nav" target="_blank" rel="noopener noreferrer"
          href="https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}">
          🚗 如何前往
          </a>
        </div>
      </details>
    `;

    /* 點卡片等同點地圖標記：開資訊視窗並設為選中；「更多資訊」、電話、如何前往除外 */
    div.addEventListener("click",e=>{
      if(e.target.closest("summary, a")) return;

      if(map){
        map.setCenter({lat:store.lat,lng:store.lng});
        map.setZoom(15);
      }

      const marker=markerMap[store.name];
      if(marker){
        google.maps.event.trigger(marker,"click");
      }else{
        activeStoreName=store.name;
        updateActiveState();
      }
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
    chip.className="chip";
    chip.textContent=`${FILTER_LABELS[key](val)} ✕`;

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
