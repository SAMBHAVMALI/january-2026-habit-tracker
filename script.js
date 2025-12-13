        
window.addEventListener("load",()=>{

/* Screen control */
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* Quotes */
const QUOTES=[
 "Small habits create big results.",
 "Discipline beats motivation.",
 "Consistency builds success.",
 "Your habits shape your future.",
 "Focus on systems, not goals."
];
quoteText.textContent=QUOTES[Math.floor(Math.random()*QUOTES.length)];

/* Splash → Quote → App */
show("splash");
setTimeout(()=>{
  show("quoteScreen");
  setTimeout(()=>show("app"),2500);
},1000);

/* Pastel palette (from your image) */
const PALETTES=[
 "#97C1A9","#B7CFB7","#CCE2CB","#C7DBDA",
 "#FFE1E9","#FFD7C2","#F6EAC2",
 "#FFB8B1","#FFDACC","#F5D2D3",
 "#9AB7D3","#A3E1DC","#55CBCD","#DFCCF1"
];
function habitColor(name){
  let h=0;
  for(let c of name) h=c.charCodeAt(0)+((h<<5)-h);
  return PALETTES[Math.abs(h)%PALETTES.length];
}

/* State */
const habits=[];

/* Render */
function render(){
  habitsEl.innerHTML="";
  habits.forEach((h,i)=>{
    const card=document.createElement("div");
    card.className="habit"+(h.done?" done":"");

    card.innerHTML=`
      <div class="habit-inner" style="background:${habitColor(h.name)}">
        <span>${h.name}</span>
        <div class="actions">
          <button onclick="toggleDone(${i},true)">✓</button>
          <button onclick="toggleDone(${i},false)">✕</button>
          <span class="menu">
            <button onclick="toggleMenu(this)">⋮</button>
            <div class="menu-options">
              <button onclick="deleteHabit(${i})">Delete</button>
            </div>
          </span>
        </div>
      </div>
    `;
    habitsEl.appendChild(card);
  });
}

/* Actions */
window.toggleDone=(i,val)=>{
  habits[i].done=val;
  render();
};

window.toggleMenu=(btn)=>{
  document.querySelectorAll(".menu").forEach(m=>m.classList.remove("open"));
  btn.parentElement.classList.toggle("open");
};

window.deleteHabit=(i)=>{
  habits.splice(i,1);
  render();
};

/* Add habit */
addHabitBtn.onclick=()=>modal.classList.remove("hidden");
saveHabit.onclick=()=>{
  if(!habitName.value.trim()) return;
  habits.push({name:habitName.value,done:false});
  habitName.value="";
  modal.classList.add("hidden");
  render();
};

});
