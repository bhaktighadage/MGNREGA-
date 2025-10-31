// -------------------- CONFIG --------------------
const API_KEY = "579b464db66ec23bdd000001af05650ce3c14f694416d9ea6e4685a3";
// Resource ID used for MGNREGA district monthly data (may be updated by admin)
const RESOURCE_ID = "ee03643a-ee4c-48c2-ac30-9f2ff26ab722";
const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=10000`;

// Minimal list of Maharashtra districts (English and Marathi)
const DISTRICTS = [
  { en: "Ahmednagar", mr: "अहमदनगर" },
  { en: "Akola", mr: "अकोला" },
  { en: "Amravati", mr: "अमरावती" },
  { en: "Aurangabad", mr: "औरंगाबाद" },
  { en: "Beed", mr: "बीड" },
  { en: "Bhandara", mr: "भंडारा" },
  { en: "Buldhana", mr: "बुलढाणा" },
  { en: "Chandrapur", mr: "चंद्रपूर" },
  { en: "Dhule", mr: "धुळे" },
  { en: "Gadchiroli", mr: "गडचिरोली" },
  { en: "Gondiya", mr: "गोंदिया" },
  { en: "Hingoli", mr: "हिंगोली" },
  { en: "Jalgaon", mr: "जळगाव" },
  { en: "Jalna", mr: "जालना" },
  { en: "Kolhapur", mr: "कोल्हापूर" },
  { en: "Latur", mr: "लातूर" },
  { en: "Mumbai", mr: "मुंबई" },
  { en: "Mumbai Suburban", mr: "मुंबई उपनगरीय" },
  { en: "Nagpur", mr: "नागपूर" },
  { en: "Nanded", mr: "नांदेड" },
  { en: "Nandurbar", mr: "नंदुरबार" },
  { en: "Nashik", mr: "नाशिक" },
  { en: "Osmanabad", mr: "उस्मानाबाद" },
  { en: "Palghar", mr: "पालघर" },
  { en: "Parbhani", mr: "परभणी" },
  { en: "Pune", mr: "पुणे" },
  { en: "Raigad", mr: "रायगड" },
  { en: "Ratnagiri", mr: "रत्नागिरी" },
  { en: "Sangli", mr: "सांगली" },
  { en: "Satara", mr: "सातारा" },
  { en: "Sindhudurg", mr: "सिंधुदुर्ग" },
  { en: "Solapur", mr: "सोलापूर" },
  { en: "Thane", mr: "ठाणे" },
  { en: "Wardha", mr: "वर्धा" },
  { en: "Washim", mr: "वाशीम" },
  { en: "Yavatmal", mr: "यवतमाळ" }
];

// DOM refs
const districtSelect = document.getElementById("districtSelect");
const loadBtn = document.getElementById("loadBtn");
const status = document.getElementById("status");
const cardsEl = document.getElementById("cards");
const tableBody = document.getElementById("tableBody");
const titleEl = document.getElementById("title");
const subtitleEl = document.getElementById("subtitle");
const districtLabel = document.getElementById("districtLabel");
const langToggle = document.getElementById("langToggle");
const footerText = document.getElementById("footerText");
const thMonth = document.getElementById("thMonth");
const thWorks = document.getElementById("thWorks");
const thPersondays = document.getElementById("thPersondays");
const thExpenditure = document.getElementById("thExpenditure");

let currentLang = "en";
let rawRecords = []; // loaded records
let cachedKey = "mgnrega_maharashtra_cache_v1";
let chartInstance = null;

// Populate districts dropdown (show Marathi label but value is English)
function populateDistricts(){
  districtSelect.innerHTML = `<option value="">-- ${currentLang==='en'?'Select district':'जिल्हा निवडा'} --</option>`;
  DISTRICTS.forEach(d=>{
    const opt = document.createElement("option");
    opt.value = d.en;
    opt.textContent = currentLang==='en' ? d.en : `${d.mr} (${d.en})`;
    districtSelect.appendChild(opt);
  });
}

// Language toggle
function applyLanguage(){
  if(currentLang==='en'){
    titleEl.textContent = "🌿 MGNREGA Dashboard";
    subtitleEl.textContent = "Maharashtra — District Performance";
    districtLabel.textContent = "Select District";
    loadBtn.textContent = "Load";
    status.textContent = "Ready";
    langToggle.textContent = "मराठीत बघा";
    thMonth.textContent = "Month";
    thWorks.textContent = "Works";
    thPersondays.textContent = "Person-days";
    thExpenditure.textContent = "Expenditure";
    footerText.textContent = "Developed by Bhakti Ghadage • Powered by MGNREGA Open API";
  } else {
    titleEl.textContent = "🌿 MGNREGA डॅशबोर्ड";
    subtitleEl.textContent = "महाराष्ट्र — जिल्हा कामगिरी";
    districtLabel.textContent = "जिल्हा निवडा";
    loadBtn.textContent = "प्रदर्शन दाखवा";
    status.textContent = "तयार";
    langToggle.textContent = "View in English";
    thMonth.textContent = "महिना";
    thWorks.textContent = "कामे";
    thPersondays.textContent = "व्यक्ति-दिवस";
    thExpenditure.textContent = "खर्च";
    footerText.textContent = "Developed by Bhakti Ghadage • Powered by MGNREGA Open API";
  }
  populateDistricts();
}

// Try load from cache (localStorage)
function loadCache(){
  try{
    const str = localStorage.getItem(cachedKey);
    if(!str) return false;
    rawRecords = JSON.parse(str);
    status.textContent = currentLang==='en'?'Loaded cached data':'संग्रहित डेटा लोड केला';
    return true;
  }catch(e){
    console.warn("cache read error",e);
    return false;
  }
}

// Save to cache
function saveCache(records){
  try{ localStorage.setItem(cachedKey, JSON.stringify(records)); }catch(e){ console.warn(e); }
}

// Fetch from API
async function fetchFromApi(){
  status.textContent = currentLang==='en' ? 'Fetching latest data...' : 'नवीन डेटा आणला जात आहे...';
  try{
    const res = await fetch(API_URL);
    const data = await res.json();
    if(data.records && data.records.length>0){
      // Filter Maharashtra records - normalize state_name
      rawRecords = data.records.filter(r=> (r.state_name || '').toLowerCase() === 'maharashtra');
      saveCache(rawRecords);
      status.textContent = currentLang==='en' ? 'Live data loaded' : 'नवीन डेटा लोड झाला';
      return true;
    } else {
      status.textContent = currentLang==='en' ? 'No records from API':'API कडून रेकॉर्ड नाही';
      return false;
    }
  }catch(err){
    console.error("API fetch error:",err);
    status.textContent = currentLang==='en' ? 'API unavailable — using cache if present' : 'API अनुपलब्ध — संग्रहित डेटा वापरला जातो आहे';
    return false;
  }
}

// Normalize helper
const norm = s => (s||'').toString().trim().toLowerCase();

// Build summary cards and table + chart
function renderForDistrict(districtEn){
  if(!rawRecords || rawRecords.length===0){
    tableBody.innerHTML = `<tr><td colspan="4">${currentLang==='en' ? 'No data available' : 'डेटा उपलब्ध नाही'}</td></tr>`;
    cardsEl.innerHTML = '';
    if(chartInstance) chartInstance.destroy();
    return;
  }

  // filter records for district — try exact match then fallback includes
  let recs = rawRecords.filter(r => norm(r.district_name) === norm(districtEn));
  if(recs.length===0) recs = rawRecords.filter(r => norm(r.district_name).includes(norm(districtEn)));

  if(recs.length===0){
    tableBody.innerHTML = `<tr><td colspan="4">${districtEn} ${currentLang==='en' ? '— No data' : '— माहिती नाही'}</td></tr>`;
    cardsEl.innerHTML = '';
    if(chartInstance) chartInstance.destroy();
    return;
  }

  // sort by month/year if available (attempt)
  recs.sort((a,b)=>{
    const ma = a.month || a.year_month || '';
    const mb = b.month || b.year_month || '';
    return ma < mb ? 1 : -1;
  });

  // summary numbers (latest record)
  const latest = recs[0];
  const totalWorks = recs.reduce((s,r)=> s + (Number(r.total_works||0) ), 0);
  const totalPersondays = recs.reduce((s,r)=> s + (Number(r.persondays_generated || r.total_persondays || 0) ), 0);
  const totalExpenditure = recs.reduce((s,r)=> s + (Number((r.expenditure || '').toString().replace(/[^0-9.-]+/g,"") || 0) ), 0);

  cardsEl.innerHTML = `
    <div class="card"><h3>${currentLang==='en'?'Latest Month':'ताजाच महिना'}</h3><p>${latest.month|| latest.year_month || 'N/A'}</p></div>
    <div class="card"><h3>${currentLang==='en'?'Total Works':'एकूण कामे'}</h3><p>${totalWorks}</p></div>
    <div class="card"><h3>${currentLang==='en'?'Person-days':'व्यक्ति-दिवस'}</h3><p>${totalPersondays}</p></div>
    <div class="card"><h3>${currentLang==='en'?'Expenditure (₹)':'खर्च (₹)'}</h3><p>${totalExpenditure.toLocaleString()}</p></div>
  `;

  // build table rows (limit to 12 rows)
  tableBody.innerHTML = '';
  recs.slice(0,12).forEach(r=>{
    const month = r.month || r.year_month || '-';
    const works = r.total_works || r.works_completed || '-';
    const pdays = r.persondays_generated || r.total_persondays || '-';
    const exp = r.expenditure || r.total_wages || '-';
    const tr = `<tr>
      <td>${month}</td>
      <td>${works}</td>
      <td>${pdays}</td>
      <td>${exp}</td>
    </tr>`;
    tableBody.insertAdjacentHTML('beforeend', tr);
  });

  // chart data (months reversed to show older→newer left→right)
  const chartMonths = recs.slice(0,12).map(r => r.month || r.year_month || '-').reverse();
  const chartWorks = recs.slice(0,12).map(r => Number(r.total_works||0)).reverse();
  const chartPdays = recs.slice(0,12).map(r => Number(r.persondays_generated || r.total_persondays || 0)).reverse();

  // draw chart (two datasets)
  const ctx = document.getElementById('perfChart').getContext('2d');
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type:'bar',
    data:{
      labels: chartMonths,
      datasets:[
        { label: currentLang==='en'?'Works':'कामे', data: chartWorks, backgroundColor:'rgba(102,187,106,0.8)' },
        { label: currentLang==='en'?'Person-days':'व्यक्ति-दिवस', data: chartPdays, backgroundColor:'rgba(66,165,245,0.7)' }
      ]
    },
    options:{ responsive:true, plugins:{legend:{position:'top'}}}
  });
}

// Initialize: apply language, populate districts, load data (cache → API)
async function init(){
  applyLanguage();
  populateDistricts();

  // try cache first
  const hadCache = loadCache();

  // attempt API fetch in background; if success, re-render later
  const apiOk = await fetchFromApi();
  // if API succeeded, use rawRecords (already set). if not, but had cache, rawRecords is from cache.
  if(!apiOk && !hadCache){
    status.textContent = currentLang==='en' ? 'No data available offline.' : 'ऑफलाइन डेटा उपलब्ध नाही.';
  }

  // Wire up load button
  loadBtn.addEventListener('click', ()=>{
    const sel = districtSelect.value;
    if(!sel){
      status.textContent = currentLang==='en' ? 'Please select a district' : 'कृपया जिल्हा निवडा';
      return;
    }
    status.textContent = currentLang==='en' ? `Showing data for ${sel}` : `${sel} साठी माहिती दर्शविली आहे`;
    renderForDistrict(sel);
  });

  // language toggle
  langToggle.addEventListener('click', ()=>{
    currentLang = currentLang==='en' ? 'mr' : 'en';
    applyLanguage();
  });
}

// Start
init();
