import { useState, useEffect, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════
   ISS STANDARD COLOR PALETTE
   Primary:   ISS Dark Blue #003055 | White #ffffff
   Secondary: ISS Persian Blue #153a7c | ISS Azure #0084ff
   Neutral:   ISS Sand #DECFB9 | ISS Grey #858585
═══════════════════════════════════════════════════ */
const C = {
  darkBlue:  "#003055",
  midBlue:   "#004b8d",
  azureBlue: "#0084ff",
  persBlue:  "#153a7c",
  white:     "#ffffff",
  sand:      "#DECFB9",
  sand2:     "#ede8e0",
  grey:      "#858585",
  greyLight: "#c8c8c8",
  greyDark:  "#333333",
  bg:        "#f5f3ef",
  panel:     "#ffffff",
  border:    "#d4cec6",
  text:      "#1a2535",
  textSub:   "#5a6878",
  green:     "#1a7a4a", greenBg:"#e6f4ed",
  orange:    "#c4620a", orangeBg:"#fdf0e6",
  red:       "#b91c1c", redBg:"#fde8e8",
  purple:    "#6d28d9", purpleBg:"#ede9fe",
  blue:      "#1d4ed8", blueBg:"#dbeafe",
};

const SC  = s => ({Active:"#1a7a4a",Maintenance:"#c4620a",Retired:"#5a6878",Decommissioned:"#b91c1c","In Progress":"#1d4ed8",Open:"#c4620a",Resolved:"#1a7a4a",Closed:"#5a6878",Pending:"#6d28d9",Overdue:"#b91c1c",Completed:"#1a7a4a"}[s]||"#5a6878");
const SCbg= s => ({Active:"#e6f4ed",Maintenance:"#fdf0e6",Retired:"#f0f0f0",Decommissioned:"#fde8e8","In Progress":"#dbeafe",Open:"#fdf0e6",Resolved:"#e6f4ed",Closed:"#f0f0f0",Pending:"#ede9fe",Overdue:"#fde8e8",Completed:"#e6f4ed"}[s]||"#f0f0f0");
const PC  = p => ({Low:"#1d4ed8",Medium:"#c4620a",High:"#b91c1c",Critical:"#7f1d1d"}[p]||"#5a6878");
const PCbg= p => ({Low:"#dbeafe",Medium:"#fdf0e6",High:"#fde8e8",Critical:"#fee2e2"}[p]||"#f0f0f0");
const CI  = c => ({Server:"🖥",Network:"🔗",Laptop:"💻",Printer:"🖨",Power:"⚡",Mobile:"📱",Software:"📦",Storage:"💾",Furniture:"🪑",Vehicle:"🚗",HVAC:"❄️","Fire Safety":"🔥",Other:"📋"}[c]||"📋");

/* ═══════════════════════════════════════════════════
   SEED DATA
═══════════════════════════════════════════════════ */
const SPACE_LEVELS=["Account","Country","Region","State","City","Building","Wing/Tower","Floor","Space Name"];
const FREQUENCIES =["Daily","Weekly","Monthly","Quarterly","Half Yearly","Yearly"];

const INIT_SPACES=[
  {id:"S1",level:"Account",    name:"NEXUS Corp",   parent:null},
  {id:"S2",level:"Country",    name:"India",        parent:"S1"},
  {id:"S3",level:"Region",     name:"APAC",         parent:"S2"},
  {id:"S4",level:"State",      name:"Tamil Nadu",   parent:"S3"},
  {id:"S5",level:"City",       name:"Chennai",      parent:"S4"},
  {id:"S6",level:"Building",   name:"XXX Building", parent:"S5"},
  {id:"S7",level:"Wing/Tower", name:"B Wing",       parent:"S6"},
  {id:"S8",level:"Floor",      name:"2nd Floor",    parent:"S7"},
  {id:"S9",level:"Space Name", name:"UPS Room",     parent:"S8"},
  {id:"S10",level:"Space Name",name:"Server Room",  parent:"S8"},
  {id:"S11",level:"Wing/Tower",name:"A Wing",       parent:"S6"},
  {id:"S12",level:"Floor",     name:"1st Floor",    parent:"S11"},
  {id:"S13",level:"Space Name",name:"Admin Office", parent:"S12"},
  {id:"S14",level:"Floor",     name:"2nd Floor",    parent:"S11"},
  {id:"S15",level:"Space Name",name:"IT Office",    parent:"S14"},
];

const INIT_USERS=[
  {id:"U1",name:"Admin User",   email:"admin@ams.local",  role:"admin",     dept:"IT",          spaceScope:"S1", phone:"+91-9001",active:true, vendor:false},
  {id:"U2",name:"Arjun Kumar",  email:"arjun@ams.local",  role:"resolver",  dept:"IT Ops",      spaceScope:"S6", phone:"+91-9002",active:true, vendor:false},
  {id:"U3",name:"Priya Sharma", email:"priya@ams.local",  role:"raiser",    dept:"Engineering", spaceScope:"S15",phone:"+91-9003",active:true, vendor:false},
  {id:"U4",name:"Deepa Nair",   email:"deepa@ams.local",  role:"viewer",    dept:"Admin",       spaceScope:"S13",phone:"+91-9004",active:true, vendor:false},
  {id:"U5",name:"Ravi Tech",    email:"ravi@vendor.com",  role:"technician",dept:"External",    spaceScope:"S6", phone:"+91-9005",active:true, vendor:true, vendorName:"VendorXYZ"},
  {id:"U6",name:"Sundar Singh", email:"sundar@ams.local", role:"technician",dept:"Facilities",  spaceScope:"S6", phone:"+91-9006",active:true, vendor:false},
];
const INIT_GROUPS=[
  {id:"G1",name:"IT Operations Team",members:["U2","U6"],description:"Internal IT maintenance team"},
  {id:"G2",name:"Facilities Crew",   members:["U5","U6"],description:"Facilities & external vendor group"},
  {id:"G3",name:"All Technicians",   members:["U2","U5","U6"],description:"All available technicians"},
];
const INIT_ROLES=[
  {id:"admin",     label:"Administrator",    color:C.red,      perms:{dashboard:true,assets:"edit", tickets:"resolve",users:"edit", admin:true, ppm:"admin"}},
  {id:"resolver",  label:"Ticket Resolver",  color:C.orange,   perms:{dashboard:true,assets:"view", tickets:"resolve",users:"view", admin:false,ppm:"execute"}},
  {id:"raiser",    label:"Ticket Raiser",    color:C.azureBlue,perms:{dashboard:true,assets:"view", tickets:"raise",  users:false,  admin:false,ppm:false}},
  {id:"technician",label:"Technician/Vendor",color:C.purple,   perms:{dashboard:true,assets:"view", tickets:"resolve",users:false,  admin:false,ppm:"execute"}},
  {id:"viewer",    label:"Viewer",           color:C.green,    perms:{dashboard:true,assets:"view", tickets:false,    users:false,  admin:false,ppm:false}},
];
const INIT_FIELDS=[
  {id:"f_name", label:"Asset Name",     type:"text",   required:true, builtin:true},
  {id:"f_cat",  label:"Category",       type:"select", required:true, builtin:true, options:["Server","Network","Laptop","Printer","Power","Mobile","Software","Storage","Furniture","Vehicle","HVAC","Fire Safety","Other"]},
  {id:"f_status",label:"Status",        type:"select", required:true, builtin:true, options:["Active","Maintenance","Retired","Decommissioned"]},
  {id:"f_space",label:"Location",       type:"space",  required:true, builtin:true},
  {id:"f_assign",label:"Assigned To",   type:"user",   required:false,builtin:true},
  {id:"f_cost", label:"Asset Cost (₹)", type:"decimal",required:false,builtin:true},
  {id:"f_pdate",label:"Purchase Date",  type:"date",   required:false,builtin:true},
  {id:"f_warr", label:"Warranty Until", type:"date",   required:false,builtin:true},
  {id:"f_serial",label:"Serial Number", type:"text",   required:false,builtin:false},
  {id:"f_make", label:"Make/Brand",     type:"text",   required:false,builtin:false},
  {id:"f_model",label:"Model",          type:"text",   required:false,builtin:false},
];
const INIT_ASSETS_RAW=[
  {_seq:1,f_name:"Dell PowerEdge R740",f_cat:"Server", f_status:"Active",      f_space:"S10",f_assign:"U2",f_cost:1050000,f_pdate:"2022-03-15",f_warr:"2025-03-15",f_serial:"SRV-001",f_make:"Dell",  f_model:"PowerEdge R740",tags:["critical"]},
  {_seq:2,f_name:"Cisco Catalyst 9300",f_cat:"Network",f_status:"Active",      f_space:"S10",f_assign:"U2",f_cost:739700, f_pdate:"2021-07-20",f_warr:"2024-07-20",f_serial:"NET-001",f_make:"Cisco", f_model:"Catalyst 9300", tags:["core"]},
  {_seq:1,f_name:"APC Smart UPS 3000", f_cat:"Power",  f_status:"Active",      f_space:"S9", f_assign:"U2",f_cost:199200, f_pdate:"2023-02-28",f_warr:"2026-02-28",f_serial:"UPS-001",f_make:"APC",   f_model:"Smart-UPS 3000",tags:["critical"]},
  {_seq:1,f_name:"HP LaserJet E600",   f_cat:"Printer",f_status:"Maintenance", f_space:"S13",f_assign:"U4",f_cost:149400, f_pdate:"2020-05-12",f_warr:"2023-05-12",f_serial:"PRT-001",f_make:"HP",    f_model:"LaserJet E600", tags:["shared"]},
  {_seq:1,f_name:"MacBook Pro M3",     f_cat:"Laptop", f_status:"Active",      f_space:"S15",f_assign:"U3",f_cost:265600, f_pdate:"2024-01-10",f_warr:"2027-01-10",f_serial:"LAP-001",f_make:"Apple", f_model:"MacBook Pro M3",tags:["employee"]},
];
const INIT_PROCEDURES=[
  {id:"PR001",name:"UPS Monthly Inspection",
   guidelines:"## Safety First\n1. Wear appropriate PPE (insulated gloves, safety shoes)\n2. Do NOT proceed if visible damage or burning smell\n3. Notify supervisor before starting\n4. Keep fire extinguisher accessible\n\n## Scope\nMonthly inspection of APC Smart-UPS units including battery health, bypass test, and load assessment.\n\n## Required Tools\n- Multimeter\n- Battery tester\n- Load bank (if available)",
   checklistItems:[
     {id:"ci1",label:"Input voltage within range (220-240V)",    type:"decimal",required:true, unit:"V"},
     {id:"ci2",label:"Output voltage stable",                     type:"decimal",required:true, unit:"V"},
     {id:"ci3",label:"Battery backup time test (min 10 min)",    type:"yesno",  required:true},
     {id:"ci4",label:"UPS alarm/fault indicators",                type:"select", required:true, options:["None","Warning","Fault"]},
     {id:"ci5",label:"Battery health indicator",                  type:"select", required:true, options:["Good","Replace Soon","Replace Immediately"]},
     {id:"ci6",label:"Load percentage reading",                   type:"decimal",required:true, unit:"%"},
     {id:"ci7",label:"Physical inspection – casing & connectors", type:"yesno",  required:true},
     {id:"ci8",label:"Technician observations / remarks",         type:"text",   required:false},
   ]},
  {id:"PR002",name:"Server Quarterly Health Check",
   guidelines:"## Pre-checks\n1. Inform IT team before starting\n2. Wear anti-static wrist strap\n\n## Scope\nQuarterly physical and firmware health check of rack-mounted servers.",
   checklistItems:[
     {id:"ci1",label:"CPU temperature (°C)",              type:"decimal",required:true, unit:"°C"},
     {id:"ci2",label:"Memory usage at time of check",     type:"decimal",required:true, unit:"%"},
     {id:"ci3",label:"Fan operation – all fans spinning",  type:"yesno", required:true},
     {id:"ci4",label:"Dust/debris inside chassis",         type:"yesno", required:true},
     {id:"ci5",label:"RAID status",                        type:"select",required:true, options:["Optimal","Degraded","Failed"]},
     {id:"ci6",label:"Firmware version noted",             type:"text",  required:false},
     {id:"ci7",label:"Cable management – OK",              type:"yesno", required:true},
     {id:"ci8",label:"Observations",                       type:"text",  required:false},
   ]},
];
// Schedule asset refs use _assetIdx (0-based index into INIT_ASSETS_RAW) resolved at startup
const INIT_SCHEDULES_RAW=[
  {id:"SCH001",name:"UPS Monthly PM",   _assetIdx:2,procedureId:"PR001",frequency:"Monthly",  type:"Internal",assignTo:{kind:"group",id:"G1"},active:true,nextDue:"2026-05-10",lastRun:null},
  {id:"SCH002",name:"Server Quarterly", _assetIdx:0,procedureId:"PR002",frequency:"Quarterly",type:"External",assignTo:{kind:"user", id:"U5"},active:true,nextDue:"2026-06-01",lastRun:null},
];

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
const uid   = p=>(p||"")+(Date.now().toString(36)+Math.random().toString(36).slice(2,5)).toUpperCase();
const fmt   = n=>n?"₹"+Number(n).toLocaleString("en-IN"):"—";
const isExp = d=>d&&new Date(d)<new Date();
const dLeft = d=>Math.ceil((new Date(d)-new Date())/86400000);
const freqDays=f=>({Daily:1,Weekly:7,Monthly:30,Quarterly:90,"Half Yearly":182,Yearly:365}[f]||30);
const freqCount=f=>({Daily:30,Weekly:8,Monthly:3,Quarterly:2,"Half Yearly":2,Yearly:1}[f]||3);

/* ── Asset Number Generator ────────────────────────
   Format: <SpaceInitials>-<5-digit-seq>
   e.g. space path "NEXUS Corp › India › APAC › Tamil Nadu › Chennai › XXX Building › B Wing › 2nd Floor › UPS Room"
   → initials: N-I-A-TN-C-XXX-BW-2F-UR → "NIATN-CXXXBW2FUR-00001"
   Simplified: first letter of each space node + zero-padded counter
   e.g. NC-IN-AP-TN-CH-XX-BW-2F-UR-00001 → truncated to readable form
   Final format: <BUILDING_INITIALS><FLOOR_INITIALS><SPACE_INITIALS>-<SEQ5>
   Example: XXXBW2FUR-00001
*/
function getSpaceInitials(spaceId, spaces) {
  const path = [];
  let cur = spaces.find(s => s.id === spaceId);
  while (cur) { path.unshift(cur); cur = spaces.find(s => s.id === cur.parent); }
  // Take initials of each node: first letter of each word, max 2 chars per node
  const initials = path.map(node => {
    const words = node.name.trim().split(/[\s\-\/]+/).filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.map(w => w[0]).join("").toUpperCase().slice(0, 3);
  });
  // Use last 3 nodes (e.g. Building, Floor, Space) for brevity, join with no separator
  const relevant = initials.slice(-3).join("");
  return relevant || "AST";
}

function generateAssetNumber(spaceId, spaces, existingAssets) {
  const initials = getSpaceInitials(spaceId, spaces);
  // Find highest seq number for this prefix
  const prefix = initials + "-";
  const existing = existingAssets
    .map(a => a.id)
    .filter(id => id && id.startsWith(prefix))
    .map(id => parseInt(id.slice(prefix.length), 10))
    .filter(n => !isNaN(n));
  const nextSeq = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return prefix + String(nextSeq).padStart(5, "0");
}

// Compute proper IDs for seed assets based on their spaces
function computeSeedAssetId(spaceId, spaces, seqNum) {
  const initials = getSpaceInitials(spaceId, spaces);
  return initials + "-" + String(seqNum).padStart(5, "0");
}

function spacePath(id,spaces){
  const p=[]; let c=spaces.find(s=>s.id===id);
  while(c){p.unshift(c.name);c=spaces.find(s=>s.id===c.parent);}
  return p.join(" › ");
}
function descendants(id,spaces){
  const r=[id];
  spaces.filter(s=>s.parent===id).forEach(c=>r.push(...descendants(c.id,spaces)));
  return r;
}
function assignLabel(at,users,groups){
  if(!at) return "Unassigned";
  if(at.kind==="user")  return users.find(u=>u.id===at.id)?.name||"Unknown";
  if(at.kind==="group") return groups.find(g=>g.id===at.id)?.name||"Unknown";
  return "Unassigned";
}
function canSeeTicket(t,user,spaces,groups){
  if(!user) return false;
  if(user.role==="admin") return true;
  if(t.raisedBy===user.id) return true;
  if(t.assignTo?.kind==="user"&&t.assignTo.id===user.id) return true;
  if(t.assignTo?.kind==="group"){const g=groups.find(g=>g.id===t.assignTo.id);if(g?.members?.includes(user.id))return true;}
  const allowed=descendants(user.spaceScope||"S1",spaces);
  return allowed.includes(t.spaceId||"");
}
function getOptions(item){
  if(!item?.options) return [];
  if(Array.isArray(item.options)) return item.options;
  return String(item.options).split(",").map(o=>o.trim()).filter(Boolean);
}

/* Generate PPM tickets from a schedule (appears in main tickets list) */
function genPPMTickets(sch,asset,proc,now=new Date()){
  const days=freqDays(sch.frequency);
  const count=freqCount(sch.frequency);
  return Array.from({length:count},(_,i)=>{
    const due=new Date(now.getTime()+i*days*86400000);
    const dueStr=due.toISOString().slice(0,10);
    const label=due.toLocaleDateString("en-IN",{month:"short",year:"numeric"});
    return {
      id:uid("PM"),scheduleId:sch.id,assetId:sch.assetId,
      title:`[PPM] ${proc.name} – ${label}`,
      type:"Preventive Maintenance",isPPM:true,priority:"Medium",
      status:i===0?"Pending":"Pending",
      assignTo:sch.assignTo,raisedBy:"U1",
      created:now.toISOString().slice(0,10),dueDate:dueStr,
      procedureId:sch.procedureId,spaceId:asset.f_space,
      desc:`Auto-generated PPM ticket for ${sch.name}. Frequency: ${sch.frequency}.`,
      comments:[],responses:{},guidelineAgreed:false,photoUrl:null,
      observations:"",corrective:false,
    };
  });
}

/* CSV / Excel-compatible export */
function exportCSV(rows,cols,filename){
  const hdr=cols.map(c=>c.label).join(",");
  const body=rows.map(r=>cols.map(c=>{
    const v=typeof c.val==="function"?c.val(r):(r[c.key]??""  );
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(",")).join("\n");
  const blob=new Blob([hdr+"\n"+body],{type:"text/csv"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=filename;a.click();
}

/* ═══════════════════════════════════════════════════════════════
   QR CODE MODEL 2 — Full Implementation (Version 1-4, ECC Level M)
   Supports byte mode encoding. Generates a real, scannable QR code.
═══════════════════════════════════════════════════════════════ */

// GF(256) arithmetic for Reed-Solomon
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(()=>{
  let x=1;
  for(let i=0;i<255;i++){
    GF_EXP[i]=x; GF_LOG[x]=i;
    x<<=1; if(x&256) x^=285;
  }
  for(let i=255;i<512;i++) GF_EXP[i]=GF_EXP[i-255];
})();
const gfMul=(a,b)=>a&&b?GF_EXP[GF_LOG[a]+GF_LOG[b]]:0;
const gfPoly=(deg)=>{
  let p=[1];
  for(let i=0;i<deg;i++){
    const np=new Array(p.length+1).fill(0);
    for(let j=0;j<p.length;j++){
      np[j]^=gfMul(p[j],GF_EXP[i]);
      np[j+1]^=p[j];
    }
    p=np;
  }
  return p;
};
const rsEncode=(data,nEcc)=>{
  const gen=gfPoly(nEcc);
  const msg=[...data,...new Array(nEcc).fill(0)];
  for(let i=0;i<data.length;i++){
    const c=msg[i];
    if(c) for(let j=0;j<gen.length;j++) msg[i+j]^=gfMul(gen[j],c);
  }
  return msg.slice(data.length);
};

// QR version capacity/ecc table [version]: {totalCodewords, eccPerBlock, blocks, dataCodewords}
const QR_PARAMS={
  1:{total:26, ecc:10, blocks:1, data:16},  // M
  2:{total:44, ecc:16, blocks:1, data:28},
  3:{total:70, ecc:26, blocks:2, data:44},  // split 2 blocks
  4:{total:100,ecc:36, blocks:2, data:64},
};

// Alignment pattern positions per version
const ALIGN_POS={2:[6,18],3:[6,22],4:[6,26]};

function buildQR(text){
  // 1) Encode data in byte mode
  const bytes=[];
  for(let i=0;i<text.length;i++) bytes.push(text.charCodeAt(i)&0xff);

  // 2) Pick smallest version that fits
  let ver=1;
  for(let v=1;v<=4;v++){
    if(QR_PARAMS[v].data>=bytes.length+3){ ver=v; break; }
    ver=v;
  }
  const p=QR_PARAMS[ver];
  const size=17+4*ver;

  // 3) Build bitstream
  const bits=[];
  const pushBits=(val,n)=>{ for(let i=n-1;i>=0;i--) bits.push((val>>i)&1); };
  pushBits(0b0100,4);           // byte mode indicator
  pushBits(bytes.length,8);     // character count
  bytes.forEach(b=>pushBits(b,8));
  // Terminator + padding
  for(let i=0;i<4&&bits.length<p.data*8;i++) bits.push(0);
  while(bits.length%8!==0) bits.push(0);
  const padBytes=[0xEC,0x11];
  let pi=0;
  while(bits.length<p.data*8){ pushBits(padBytes[pi%2],8); pi++; }

  // 4) Convert bits to codewords
  const codewords=[];
  for(let i=0;i<bits.length;i+=8){
    let b=0;
    for(let j=0;j<8;j++) b=(b<<1)|(bits[i+j]||0);
    codewords.push(b);
  }

  // 5) Reed-Solomon ECC
  // Split into blocks if needed
  const numBlocks=p.blocks;
  const dataPerBlock=Math.floor(p.data/numBlocks);
  const eccPerBlock=Math.floor(p.ecc/numBlocks);
  const blocks=[];
  let ci=0;
  for(let b=0;b<numBlocks;b++){
    const len=(b<numBlocks-1)?dataPerBlock:p.data-dataPerBlock*(numBlocks-1);
    const dBlock=codewords.slice(ci,ci+len);
    ci+=len;
    blocks.push({data:dBlock,ecc:rsEncode(dBlock,eccPerBlock)});
  }

  // Interleave data then ECC
  const finalCW=[];
  const maxD=Math.max(...blocks.map(b=>b.data.length));
  for(let i=0;i<maxD;i++) blocks.forEach(b=>{if(i<b.data.length)finalCW.push(b.data[i]);});
  const maxE=Math.max(...blocks.map(b=>b.ecc.length));
  for(let i=0;i<maxE;i++) blocks.forEach(b=>{if(i<b.ecc.length)finalCW.push(b.ecc[i]);});

  // 6) Build matrix
  const mat=Array.from({length:size},()=>new Array(size).fill(-1)); // -1=empty
  const func=Array.from({length:size},()=>new Array(size).fill(false)); // functional modules

  const setMod=(r,c,v,isFunc=false)=>{
    if(r<0||r>=size||c<0||c>=size) return;
    mat[r][c]=v; if(isFunc) func[r][c]=true;
  };

  // Finder pattern (7x7) + separator
  const addFinder=(tr,tc)=>{
    for(let r=0;r<7;r++) for(let c=0;c<7;c++){
      const v=(r===0||r===6||c===0||c===6)?1:(r>=2&&r<=4&&c>=2&&c<=4)?1:0;
      setMod(tr+r,tc+c,v,true);
    }
    // Separator (white border)
    for(let i=-1;i<=7;i++){
      setMod(tr-1,tc+i,0,true); setMod(tr+7,tc+i,0,true);
      setMod(tr+i,tc-1,0,true); setMod(tr+i,tc+7,0,true);
    }
  };
  addFinder(0,0); addFinder(0,size-7); addFinder(size-7,0);

  // Timing patterns
  for(let i=8;i<size-8;i++){
    setMod(6,i,i%2===0?1:0,true);
    setMod(i,6,i%2===0?1:0,true);
  }

  // Dark module
  setMod(4*ver+9,8,1,true);

  // Alignment patterns (ver>=2)
  if(ver>=2){
    const pos=ALIGN_POS[ver];
    for(let r=0;r<pos.length;r++) for(let c=0;c<pos.length;c++){
      const pr=pos[r],pc=pos[c];
      if(func[pr][pc]) continue;
      for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
        const v=(Math.abs(dr)===2||Math.abs(dc)===2)?1:(dr===0&&dc===0)?1:0;
        setMod(pr+dr,pc+dc,v,true);
      }
    }
  }

  // Format info placeholders (mark as functional)
  const fmtPos=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],
                [7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  fmtPos.forEach(([r,c])=>{ func[r][c]=true; func[c][r]=true; });
  // Mirror positions
  for(let i=0;i<7;i++){ func[size-1-i][8]=true; func[8][size-1-i]=true; }

  // 7) Place data bits (zigzag)
  const cwBits=[];
  finalCW.forEach(cw=>{ for(let i=7;i>=0;i--) cwBits.push((cw>>i)&1); });
  // Remainder bits
  const remBits=[0,7,7,7];
  for(let i=0;i<remBits[ver];i++) cwBits.push(0);

  let bi=0;
  let goingUp=true;
  let col=size-1;
  while(col>0){
    if(col===6) col--; // skip timing column
    for(let rowIdx=0;rowIdx<size;rowIdx++){
      const r=goingUp?size-1-rowIdx:rowIdx;
      for(let dc=0;dc<2;dc++){
        const c=col-dc;
        if(!func[r][c]&&bi<cwBits.length){
          mat[r][c]=cwBits[bi++];
        }
      }
    }
    goingUp=!goingUp;
    col-=2;
  }

  // 8) Apply mask pattern 0: (r+c)%2===0
  const MASK=0; // mask 000
  for(let r=0;r<size;r++) for(let c=0;c<size;c++){
    if(!func[r][c]&&mat[r][c]!==-1){
      if((r+c)%2===0) mat[r][c]^=1;
    }
  }

  // 9) Format information (ECC Level M = 00, Mask = 000 → format = 0b00000)
  // Format string for M+mask0 = 101010000010010
  // Precomputed: M=01, mask=000, format bits with BCH = 100111011111000 XOR 101010000010010
  // Standard value for ECC=M, mask=0: 0x5412 = 0101 0100 0001 0010
  const FMT_M0=0x5412; // ECC Level M, Mask pattern 0
  const fmtBits=[];
  for(let i=14;i>=0;i--) fmtBits.push((FMT_M0>>i)&1);

  // Place format info around top-left finder
  const fmt1=[[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  fmt1.forEach(([r,c],i)=> setMod(r,c,fmtBits[i]));
  // Top-right and bottom-left copies
  for(let i=0;i<7;i++) setMod(size-1-i,8,fmtBits[i]);
  for(let i=7;i<15;i++) setMod(8,size-15+i,fmtBits[i]);

  return {mat,size};
}

function QRGrid({text,size=80}){
  const {mat,sz} = useMemo(()=>{
    try {
      const {mat,size:sz}=buildQR(text);
      return {mat,sz};
    } catch(e){
      // Fallback: simple placeholder if encoding fails
      return {mat:null,sz:21};
    }
  },[text]);

  const quiet=4; // quiet zone modules
  const totalMods=sz+quiet*2;
  const mod=size/totalMods;

  if(!mat){
    // Fallback plain box
    return <svg width={size} height={size}><rect width={size} height={size} fill="#fff"/><rect x={4} y={4} width={size-8} height={size-8} fill="none" stroke="#ccc" strokeWidth={1}/><text x={size/2} y={size/2} textAnchor="middle" fontSize={8} fill="#aaa">QR</text></svg>;
  }

  const modules=[];
  for(let r=0;r<sz;r++){
    for(let c=0;c<sz;c++){
      if(mat[r][c]===1){
        modules.push(
          <rect key={`${r}-${c}`}
            x={(c+quiet)*mod} y={(r+quiet)*mod}
            width={mod} height={mod}
            fill={C.darkBlue}/>
        );
      }
    }
  }

  return(
    <svg width={size} height={size} style={{display:"block",flexShrink:0,borderRadius:2}}
      viewBox={`0 0 ${size} ${size}`}>
      {/* White background including quiet zone */}
      <rect width={size} height={size} fill="#ffffff"/>
      {modules}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   SHARED UI PRIMITIVES
═══════════════════════════════════════════════════ */
function Badge({s,small}){
  return <span style={{fontSize:small?9:10,color:SC(s),background:SCbg(s),border:`1px solid ${SC(s)}40`,padding:small?"1px 6px":"2px 9px",borderRadius:20,fontWeight:700,whiteSpace:"nowrap"}}>{s}</span>;
}
function PBadge({p}){
  return <span style={{fontSize:10,color:PC(p),background:PCbg(p),padding:"2px 8px",borderRadius:20,fontWeight:700}}>● {p}</span>;
}
function Btn({children,onClick,color,sm,danger,outline,disabled,style={}}){
  const bg =disabled?"#e0ddd8":danger?C.red:outline?"transparent":color||C.darkBlue;
  const fg =disabled?C.grey:outline?(color||C.darkBlue):"#fff";
  const bd =outline?`1.5px solid ${color||C.darkBlue}`:`1.5px solid ${bg}`;
  return(
    <button onClick={disabled?undefined:onClick}
      style={{background:bg,color:fg,border:bd,padding:sm?"4px 12px":"8px 18px",borderRadius:4,fontSize:sm?11:12,fontWeight:600,fontFamily:"inherit",cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.6:1,letterSpacing:"0.03em",transition:"all .15s",...style}}>
      {children}
    </button>
  );
}
function Lbl({children,req}){
  return <div style={{fontSize:10,color:C.textSub,marginBottom:5,letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600}}>{children}{req&&<span style={{color:C.red,marginLeft:3}}>*</span>}</div>;
}
function FRow({label,req,children}){return <div><Lbl req={req}>{label}</Lbl>{children}</div>;}
function Inp({value,onChange,type="text",placeholder,disabled,style={},onKeyDown}){
  return <input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} onKeyDown={onKeyDown}
    style={{background:disabled?"#f5f3ef":C.white,color:disabled?C.grey:C.text,border:`1.5px solid ${C.border}`,borderRadius:4,padding:"7px 10px",fontFamily:"inherit",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",...style}}/>;
}
function Sel({value,onChange,children,disabled,style={}}){
  return <select value={value??""} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{background:C.white,color:C.text,border:`1.5px solid ${C.border}`,borderRadius:4,padding:"7px 10px",fontFamily:"inherit",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",...style}}>
    {children}
  </select>;
}
function Tarea({value,onChange,rows=3,placeholder}){
  return <textarea value={value??""} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
    style={{background:C.white,color:C.text,border:`1.5px solid ${C.border}`,borderRadius:4,padding:"7px 10px",fontFamily:"inherit",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",resize:"vertical"}}/>;
}
function Modal({title,subtitle,onClose,width=560,children}){
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,48,85,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:C.white,borderRadius:8,width:"100%",maxWidth:width,maxHeight:"92vh",overflow:"auto",boxShadow:"0 8px 40px rgba(0,48,85,.3)",animation:"fadeIn .2s ease"}}>
        <div style={{background:C.darkBlue,padding:"16px 22px",borderRadius:"8px 8px 0 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:C.white,letterSpacing:"0.08em",textTransform:"uppercase"}}>{title}</div>
            {subtitle&&<div style={{fontSize:10,color:"rgba(255,255,255,.55)",marginTop:2}}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{color:"rgba(255,255,255,.6)",background:"none",border:"none",fontSize:20,cursor:"pointer",lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:22}}>{children}</div>
      </div>
    </div>
  );
}
function Card({children,style={}}){
  return <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:8,padding:20,boxShadow:"0 1px 4px rgba(0,48,85,.06)",...style}}>{children}</div>;
}
function Sec({title,action,children}){
  return(
    <div style={{marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:6,borderBottom:`2px solid ${C.sand}`}}>
        <span style={{fontSize:10,color:C.textSub,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}
function KPI({label,value,sub,color}){
  return(
    <Card>
      <Lbl>{label}</Lbl>
      <div style={{fontSize:28,fontWeight:800,color:color||C.darkBlue,marginBottom:2}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:C.textSub}}>{sub}</div>}
    </Card>
  );
}
function Tog({value,onChange,label}){
  return(
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:C.textSub}}>
      <div onClick={()=>onChange(!value)} style={{width:36,height:20,borderRadius:10,background:value?C.azureBlue:C.greyLight,position:"relative",transition:"background .2s",cursor:"pointer",flexShrink:0}}>
        <div style={{width:14,height:14,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:value?19:3,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
      </div>
      {label}
    </label>
  );
}
function TblHead({cols,style={}}){
  return(
    <div style={{display:"grid",gridTemplateColumns:cols.map(c=>c.w).join(" "),background:C.darkBlue,padding:"10px 16px",gap:8,...style}}>
      {cols.map(c=><div key={c.h} style={{fontSize:9,color:"rgba(255,255,255,.7)",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>{c.h}</div>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SPACE SELECTOR (cascading dropdowns)
═══════════════════════════════════════════════════ */
function SpaceSelector({value,onChange,spaces}){
  const [path,setPath]=useState([]);
  useEffect(()=>{
    if(value){
      const p=[]; let cur=spaces.find(s=>s.id===value);
      while(cur){p.unshift(cur.id);cur=spaces.find(s=>s.id===cur.parent);}
      setPath(p);
    }
  },[value]);
  const dropdowns=[];
  let parentId=null;
  for(let i=0;i<SPACE_LEVELS.length;i++){
    const opts=spaces.filter(s=>s.level===SPACE_LEVELS[i]&&s.parent===parentId);
    if(!opts.length) break;
    const idx=i;
    dropdowns.push(
      <FRow key={i} label={SPACE_LEVELS[i]}>
        <Sel value={path[i]||""} onChange={v=>{
          const np=[...path.slice(0,idx),v];
          setPath(np);onChange(v||null);
        }}>
          <option value="">— Select {SPACE_LEVELS[i]} —</option>
          {opts.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </Sel>
      </FRow>
    );
    parentId=path[i]||null;
    if(!path[i]) break;
  }
  return <div style={{display:"grid",gap:8}}>{dropdowns}</div>;
}

/* ═══════════════════════════════════════════════════
   ASSIGN SELECTOR
═══════════════════════════════════════════════════ */
function AssignSelector({value,onChange,users,groups,label="Assign To",required}){
  const [kind,setKind]=useState(value?.kind||"group");
  const [id,setId]=useState(value?.id||"");
  const update=(k,i)=>{setKind(k);setId(i);onChange(i?{kind:k,id:i}:null);};
  return(
    <div>
      <Lbl req={required}>{label}</Lbl>
      <div style={{display:"flex",gap:6,marginBottom:6}}>
        {["group","user"].map(k=>(
          <Btn key={k} sm onClick={()=>update(k,"")} color={kind===k?C.azureBlue:undefined} outline={kind!==k} style={{flex:1}}>
            {k==="group"?"👥 User Group":"👤 Individual"}
          </Btn>
        ))}
      </div>
      <Sel value={id} onChange={i=>update(kind,i)}>
        <option value="">{required?"— Required —":"— Optional —"}</option>
        {kind==="user"
          ?users.filter(u=>["resolver","technician","admin"].includes(u.role)).map(u=><option key={u.id} value={u.id}>{u.name}{u.vendor?" (Vendor)":""}</option>)
          :groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)
        }
      </Sel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════ */
function Sidebar({view,setView,currentUser,roles,openTickets,ppmDue}){
  const role=roles.find(r=>r.id===currentUser.role);
  const p=role?.perms||{};
  const isTech=currentUser.role==="technician";
  const items=[
    ...(p.dashboard&&!isTech?[{id:"dashboard",icon:"⊞",label:"Dashboard"}]:[]),
    ...((isTech||p.ppm==="execute"||p.ppm==="admin")?[{id:"ppm_exec",icon:"🔧",label:"My PPM Tasks",badge:ppmDue,bc:C.purple}]:[]),
    ...(!isTech&&p.assets?[{id:"assets",icon:"◻",label:"Assets"}]:[]),
    ...(!isTech&&p.tickets?[{id:"tickets",icon:"◆",label:"Tickets",badge:openTickets,bc:C.orange}]:[]),
    ...(p.ppm==="admin"?[{id:"ppm",icon:"📅",label:"PPM Schedules"}]:[]),
    ...(p.users?[{id:"users",icon:"👤",label:"Users & Groups"}]:[]),
    ...(p.admin?[{id:"reports",icon:"📊",label:"Reports & Export"}]:[]),
    ...(p.admin?[{id:"admin",icon:"⚙",label:"Admin Config"}]:[]),
  ];
  return(
    <div style={{width:218,background:C.darkBlue,display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
          <div style={{width:32,height:32,background:C.white,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:11,fontWeight:800,color:C.darkBlue,letterSpacing:"-1px"}}>ISS</span>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.white,letterSpacing:"-0.02em"}}>AssetCore</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,.4)",letterSpacing:"0.12em"}}>ENTERPRISE EAM</div>
          </div>
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>v5.1 · Enterprise PPM</div>
      </div>
      <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
        {items.map(item=>{
          const active=view===item.id;
          return(
            <button key={item.id} onClick={()=>setView(item.id)}
              style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:6,
                background:active?"rgba(255,255,255,.15)":"transparent",
                color:active?C.white:"rgba(255,255,255,.5)",
                fontSize:12,fontFamily:"inherit",fontWeight:active?700:400,marginBottom:2,
                border:active?"1px solid rgba(255,255,255,.2)":"1px solid transparent",
                textAlign:"left",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:14}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge>0&&<span style={{background:item.bc||C.orange,color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:10,fontWeight:800}}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"12px 14px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{fontSize:11,color:C.white,fontWeight:600}}>{currentUser.name}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,.45)",marginTop:2}}>{role?.label}{currentUser.vendor?" · Vendor":""}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
function Dashboard({assets,tickets,spaces,users,groups,currentUser,setView}){
  const vis=tickets.filter(t=>canSeeTicket(t,currentUser,spaces,groups));
  const open=vis.filter(t=>["Open","In Progress","Pending"].includes(t.status));
  const ppmPending=vis.filter(t=>t.isPPM&&t.status==="Pending");
  const crit=vis.filter(t=>t.priority==="Critical"&&!["Resolved","Closed","Completed"].includes(t.status));
  const totalVal=assets.reduce((s,a)=>s+(Number(a.f_cost)||0),0);
  const byCat=assets.reduce((acc,a)=>{acc[a.f_cat]=(acc[a.f_cat]||0)+1;return acc},{});
  const maxCat=Math.max(...Object.values(byCat),1);
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:20,fontWeight:800,color:C.darkBlue}}>Good day, {currentUser.name.split(" ")[0]} 👋</div>
        <div style={{fontSize:11,color:C.textSub,marginTop:3}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="Total Assets"    value={assets.length}    sub={`${assets.filter(a=>a.f_status==="Active").length} active`}  color={C.darkBlue}/>
        <KPI label="Portfolio Value" value={fmt(totalVal)}    sub="all assets"                                                   color={C.persBlue}/>
        <KPI label="Open Tickets"   value={open.length}       sub={`${crit.length} critical`}                                   color={crit.length?C.red:C.orange}/>
        <KPI label="PPM Due"        value={ppmPending.length} sub="preventive tasks pending"                                    color={C.purple}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:14}}>
        <Card>
          <Sec title="Recent Open Tickets" action={<Btn sm onClick={()=>setView("tickets")}>View All →</Btn>}>
            {open.slice(0,6).map(t=>(
              <div key={t.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.sand}`,alignItems:"center"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:PC(t.priority),flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                  <div style={{fontSize:10,color:C.textSub}}>{t.id} {t.isPPM?"· PPM":""} · {assignLabel(t.assignTo,users,groups)}</div>
                </div>
                <Badge s={t.status} small/>
              </div>
            ))}
            {open.length===0&&<div style={{fontSize:12,color:C.textSub,textAlign:"center",padding:"16px 0"}}>No open tickets ✓</div>}
          </Sec>
        </Card>
        <Card>
          <Sec title="Asset Categories">
            {Object.entries(byCat).map(([cat,count])=>(
              <div key={cat} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <span style={{color:C.text}}>{CI(cat)} {cat}</span>
                  <span style={{color:C.textSub,fontWeight:700}}>{count}</span>
                </div>
                <div style={{height:4,background:C.sand,borderRadius:2}}>
                  <div style={{height:4,width:`${(count/maxCat)*100}%`,background:C.azureBlue,borderRadius:2,transition:"width .5s"}}/>
                </div>
              </div>
            ))}
          </Sec>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ASSETS
═══════════════════════════════════════════════════ */
function Assets({assets,setAssets,fields,spaces,users,groups,currentUser,roles,tickets,notify}){
  const [search,setSearch]=useState("");
  const [catF,setCatF]=useState("All");
  const [statF,setStatF]=useState("");
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [showImport,setShowImport]=useState(false);
  const [importTxt,setImportTxt]=useState("");
  const [showQR,setShowQR]=useState(null);
  const role=roles.find(r=>r.id===currentUser.role);
  const canEdit=role?.perms?.assets==="edit";
  const cats=["All",...new Set(getOptions(fields.find(f=>f.id==="f_cat")))];

  let filtered=assets;
  if(search) filtered=filtered.filter(a=>(a.f_name||"").toLowerCase().includes(search.toLowerCase())||a.id.toLowerCase().includes(search.toLowerCase()));
  if(catF!=="All") filtered=filtered.filter(a=>a.f_cat===catF);
  if(statF) filtered=filtered.filter(a=>a.f_status===statF);

  const saveAsset=data=>{
    if(data.id) {
      setAssets(p=>p.map(a=>a.id===data.id?data:a));
    } else {
      // Generate unique asset number from space hierarchy
      const newId = generateAssetNumber(data.f_space, spaces, assets);
      setAssets(p=>[{...data, id:newId, tags:[]},...p]);
    }
    notify(data.id?"Asset updated":"Asset registered");setShowNew(false);setSelected(null);
  };
  const doImport=()=>{
    try{
      const lines=importTxt.trim().split("\n").filter(Boolean);
      const hdrs=lines[0].split(",").map(h=>h.trim());
      const newA=lines.slice(1).map(l=>{const v=l.split(",").map(x=>x.trim());const o={id:uid("A"),tags:[]};hdrs.forEach((h,i)=>o[h]=v[i]||"");return o;});
      setAssets(p=>[...newA,...p]);notify(`${newA.length} assets imported`);setShowImport(false);setImportTxt("");
    }catch{notify("Import failed – check CSV format","error");}
  };
  const exportFn=()=>exportCSV(filtered,[
    {label:"Asset ID",key:"id"},{label:"Name",key:"f_name"},{label:"Category",key:"f_cat"},
    {label:"Status",key:"f_status"},{label:"Cost (₹)",key:"f_cost"},{label:"Serial No",key:"f_serial"},
    {label:"Make",key:"f_make"},{label:"Model",key:"f_model"},
    {label:"Purchase Date",key:"f_pdate"},{label:"Warranty Until",key:"f_warr"},
    {label:"Location",val:r=>spacePath(r.f_space,spaces)},
    {label:"Assigned To",val:r=>users.find(u=>u.id===r.f_assign)?.name||""},
  ],"assets_export.csv");

  const cols=["80px","1fr","90px","88px","160px","100px","68px","72px"];
  const hdrs=["ID","Name / Category","Status","Cost","Location","Assigned","Warranty",""];
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <Inp value={search} onChange={setSearch} placeholder="Search assets…" style={{maxWidth:220}}/>
        <Sel value={catF} onChange={setCatF} style={{width:130}}>{cats.map(c=><option key={c}>{c}</option>)}</Sel>
        <Sel value={statF} onChange={setStatF} style={{width:130}}>
          <option value="">All Statuses</option>
          {["Active","Maintenance","Retired","Decommissioned"].map(s=><option key={s}>{s}</option>)}
        </Sel>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn sm onClick={exportFn} color={C.persBlue} outline>⬇ Export CSV</Btn>
          <Btn sm onClick={()=>setShowImport(true)} color={C.azureBlue} outline>📥 Bulk Import</Btn>
          {canEdit&&<Btn sm onClick={()=>setShowNew(true)}>+ New Asset</Btn>}
        </div>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <TblHead cols={hdrs.map((h,i)=>({h,w:cols[i]}))}/>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:C.textSub,fontSize:12}}>No assets match filters</div>}
        {filtered.map(asset=>{
          const u=users.find(u=>u.id===asset.f_assign);
          const ws=asset.f_warr;
          const wExp=ws&&isExp(ws); const wSoon=ws&&!wExp&&dLeft(ws)<90;
          return(
            <div key={asset.id} style={{display:"grid",gridTemplateColumns:cols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",gap:8,cursor:"pointer"}}
              onClick={()=>setSelected(asset)} className="row-hover">
              <div style={{color:C.azureBlue,fontWeight:700,fontSize:10}}>{asset.id}</div>
              <div>
                <div style={{color:C.text,fontSize:12,fontWeight:500}}>{CI(asset.f_cat)} {asset.f_name}</div>
                <div style={{color:C.textSub,fontSize:9,marginTop:1}}>{asset.f_cat}{asset.f_serial?` · ${asset.f_serial}`:""}</div>
              </div>
              <Badge s={asset.f_status} small/>
              <div style={{color:C.textSub}}>{asset.f_cost?fmt(asset.f_cost):"—"}</div>
              <div style={{color:C.textSub,fontSize:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{spacePath(asset.f_space,spaces)||"—"}</div>
              <div style={{color:C.textSub,fontSize:10}}>{u?.name||"—"}</div>
              <div style={{fontSize:9,color:wExp?C.red:wSoon?C.orange:C.textSub,fontWeight:wExp||wSoon?700:400}}>
                {ws?(wExp?"EXPIRED":dLeft(ws)+"d"):"—"}
              </div>
              <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:4}}>
                <button title="QR Code" onClick={()=>setShowQR(asset)} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.persBlue,padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:11}}>⊞</button>
                {canEdit&&<button title="Edit" onClick={()=>{setSelected(asset);}} style={{background:C.bg,border:`1px solid ${C.border}`,color:C.orange,padding:"3px 7px",borderRadius:3,cursor:"pointer",fontSize:11}}>✎</button>}
              </div>
            </div>
          );
        })}
      </Card>
      <div style={{fontSize:10,color:C.textSub,marginTop:6,textAlign:"right"}}>{filtered.length}/{assets.length} assets</div>

      {(showNew||selected)&&
        <AssetModal asset={selected} fields={fields} spaces={spaces} users={users} onSave={saveAsset}
          onClose={()=>{setShowNew(false);setSelected(null);}} canEdit={canEdit} tickets={tickets} groups={groups} allAssets={assets}/>}

      {showQR&&<Modal title={`QR Code · ${showQR.id}`} subtitle={showQR.f_name} onClose={()=>setShowQR(null)} width={320}>
        <div style={{textAlign:"center",padding:"10px 0"}}>
          <div style={{display:"inline-block",padding:16,background:C.bg,borderRadius:8,marginBottom:14,border:`1px solid ${C.border}`}}>
            <QRGrid text={showQR.id} size={160}/>
          </div>
          <div style={{fontSize:18,fontWeight:800,color:C.darkBlue,fontFamily:"monospace",letterSpacing:"0.05em"}}>{showQR.id}</div>
          <div style={{fontSize:11,color:C.textSub,marginTop:4}}>{showQR.f_name}</div>
          <div style={{fontSize:10,color:C.grey,marginTop:4}}>{spacePath(showQR.f_space,spaces)}</div>
          <div style={{fontSize:10,color:C.textSub,marginTop:10,fontStyle:"italic",background:C.bg,borderRadius:4,padding:"8px 12px"}}>
            Scan this QR code to access asset details &amp; PPM tasks.<br/>Asset number encodes the location hierarchy.
          </div>
          <div style={{marginTop:16}}><Btn sm onClick={()=>setShowQR(null)}>Close</Btn></div>
        </div>
      </Modal>}

      {showImport&&<Modal title="Bulk Import Assets (CSV)" onClose={()=>setShowImport(false)} width={520}>
        <div style={{display:"grid",gap:12}}>
          <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,padding:12,fontSize:11,color:C.textSub,lineHeight:1.7}}>
            First row = column headers. Supported keys:<br/>
            <code style={{color:C.persBlue,fontSize:10}}>f_name, f_cat, f_status, f_space, f_cost, f_serial, f_make, f_model, f_pdate, f_warr</code>
          </div>
          <FRow label="Paste CSV Data">
            <Tarea value={importTxt} onChange={setImportTxt} rows={8} placeholder={"f_name,f_cat,f_status,f_cost\nDell Server,Server,Active,150000"}/>
          </FRow>
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setShowImport(false)} outline color={C.grey}>Cancel</Btn>
            <Btn onClick={doImport} color={C.azureBlue}>Import Assets</Btn>
          </div>
        </div>
      </Modal>}
    </div>
  );
}

function AssetModal({asset,fields,spaces,users,onSave,onClose,canEdit,tickets,groups,allAssets}){
  const [form,setForm]=useState(asset||{f_status:"Active"});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const isNew=!asset?.id;
  // Preview what the asset number will be
  const previewId = isNew && form.f_space ? generateAssetNumber(form.f_space, spaces, allAssets||[]) : null;
  const save=()=>{if(!form.f_name||!form.f_space)return alert("Asset Name and Location are required");onSave(form);};
  const relT=tickets.filter(t=>t.assetId===asset?.id);
  return(
    <Modal title={isNew?"Register New Asset":`Asset · ${asset?.id}`} subtitle={asset?.f_name} onClose={onClose} width={680}>
      {isNew && form.f_space && (
        <div style={{background:C.blueBg,border:`1.5px solid ${C.azureBlue}40`,borderRadius:6,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:11,color:C.textSub}}>Asset Number will be assigned:</div>
          <div style={{fontSize:16,fontWeight:800,color:C.persBlue,fontFamily:"monospace",letterSpacing:"0.05em"}}>{previewId}</div>
          <div style={{fontSize:10,color:C.textSub,marginLeft:"auto"}}>Based on location hierarchy</div>
        </div>
      )}
      {!isNew && (
        <div style={{display:"flex",alignItems:"center",gap:14,background:C.bg,borderRadius:6,padding:"10px 14px",marginBottom:14}}>
          <QRGrid text={asset.id} size={58}/>
          <div>
            <div style={{fontSize:10,color:C.textSub,marginBottom:2}}>Asset Number (unique)</div>
            <div style={{fontSize:18,fontWeight:800,color:C.persBlue,fontFamily:"monospace",letterSpacing:"0.05em"}}>{asset.id}</div>
            <div style={{fontSize:10,color:C.textSub,marginTop:2}}>{spacePath(asset.f_space,spaces)}</div>
          </div>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        {fields.filter(f=>f.id!=="f_space"&&f.id!=="f_assign").map(f=>(
          <div key={f.id}>
            <FRow label={f.label} req={f.required}>
              {f.type==="text"    &&<Inp value={form[f.id]} onChange={v=>set(f.id,v)} disabled={!canEdit&&!isNew}/>}
              {f.type==="decimal" &&<Inp type="number" value={form[f.id]} onChange={v=>set(f.id,v)} disabled={!canEdit&&!isNew}/>}
              {f.type==="date"    &&<Inp type="date" value={form[f.id]} onChange={v=>set(f.id,v)} disabled={!canEdit&&!isNew}/>}
              {f.type==="select"  &&<Sel value={form[f.id]||""} onChange={v=>set(f.id,v)}>
                <option value="">— Select —</option>
                {getOptions(f).map(o=><option key={o}>{o}</option>)}
              </Sel>}
            </FRow>
          </div>
        ))}
        <div style={{gridColumn:"1/-1"}}>
          <FRow label="Location" req><SpaceSelector value={form.f_space} onChange={v=>set("f_space",v)} spaces={spaces}/></FRow>
        </div>
        <div>
          <FRow label="Assigned To">
            <Sel value={form.f_assign||""} onChange={v=>set("f_assign",v)}>
              <option value="">— None —</option>
              {users.filter(u=>u.active).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </Sel>
          </FRow>
        </div>
        {asset?.id&&(
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:10,color:C.textSub}}>QR Code ready for scanning</div>
          </div>
        )}
      </div>
      {asset?.id&&relT.length>0&&(
        <Sec title={`Related Tickets (${relT.length})`}>
          {relT.slice(0,5).map(t=>(
            <div key={t.id} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center"}}>
              <span style={{color:t.isPPM?C.purple:C.azureBlue,fontWeight:700,fontSize:10,minWidth:70}}>{t.id}</span>
              {t.isPPM&&<span style={{fontSize:9,background:C.purpleBg,color:C.purple,padding:"1px 5px",borderRadius:2,fontWeight:700}}>PPM</span>}
              <span style={{flex:1,color:C.text}}>{t.title}</span>
              <Badge s={t.status} small/><PBadge p={t.priority}/>
            </div>
          ))}
        </Sec>
      )}
      {canEdit&&<div style={{display:"flex",gap:8,marginTop:8}}>
        <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
        <Btn onClick={save}>{isNew?"Register Asset":"Save Changes"}</Btn>
      </div>}
      {!canEdit&&<Btn onClick={onClose} outline color={C.grey} style={{marginTop:8}}>Close</Btn>}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   TICKETS  (regular + PPM combined in one list)
═══════════════════════════════════════════════════ */
function Tickets({tickets,setTickets,assets,spaces,users,groups,currentUser,roles,notify}){
  const [search,setSearch]=useState("");
  const [stF,setStF]=useState("");
  const [prF,setPrF]=useState("");
  const [typeF,setTypeF]=useState("");
  const [selected,setSelected]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const role=roles.find(r=>r.id===currentUser.role);
  const perms=role?.perms||{};
  const canRaise=["raise","resolve"].includes(perms.tickets);
  const canResolve=perms.tickets==="resolve";

  const visible=tickets.filter(t=>canSeeTicket(t,currentUser,spaces,groups));
  let filtered=visible;
  if(search) filtered=filtered.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())||t.id.toLowerCase().includes(search.toLowerCase()));
  if(stF)    filtered=filtered.filter(t=>t.status===stF);
  if(prF)    filtered=filtered.filter(t=>t.priority===prF);
  if(typeF==="ppm")     filtered=filtered.filter(t=>t.isPPM);
  if(typeF==="regular") filtered=filtered.filter(t=>!t.isPPM);

  const ppmCount=visible.filter(t=>t.isPPM).length;
  const regCount=visible.filter(t=>!t.isPPM).length;

  const save=data=>{
    if(!data.assignTo)return notify("Ticket must be assigned to a user or group","error");
    if(data.id) setTickets(p=>p.map(t=>t.id===data.id?data:t));
    else setTickets(p=>[{...data,id:uid("T"),created:new Date().toISOString().slice(0,10),comments:[],isPPM:false},...p]);
    notify(data.id?"Ticket updated":"Ticket created");setShowNew(false);setSelected(null);
  };
  const exportFn=()=>exportCSV(filtered,[
    {label:"Ticket ID",key:"id"},{label:"Title",key:"title"},{label:"Type",key:"type"},
    {label:"Is PPM",val:r=>r.isPPM?"Yes":"No"},
    {label:"Priority",key:"priority"},{label:"Status",key:"status"},
    {label:"Asset ID",key:"assetId"},{label:"Asset Name",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||""},
    {label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
    {label:"Raised By",val:r=>users.find(u=>u.id===r.raisedBy)?.name||""},
    {label:"Created",key:"created"},{label:"Due Date",key:"dueDate"},
    {label:"Location",val:r=>spacePath(r.spaceId,spaces)},
    {label:"Observations",key:"observations"},
  ],"tickets_export.csv");

  const cols=["90px","1fr","118px","90px","90px","150px","86px"];
  const hdrs=["ID","Title / Asset","Type","Priority","Status","Assigned To","Due / Created"];
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      {/* Type filter chips */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {[
          {label:`All (${visible.length})`,val:"",      color:C.darkBlue},
          {label:`Regular (${regCount})`,  val:"regular",color:C.azureBlue},
          {label:`PPM Tickets (${ppmCount})`,val:"ppm", color:C.purple},
        ].map(chip=>(
          <button key={chip.val} onClick={()=>setTypeF(chip.val)}
            style={{padding:"5px 14px",borderRadius:20,border:`1.5px solid ${chip.color}`,
              background:typeF===chip.val?chip.color:"transparent",
              color:typeF===chip.val?"#fff":chip.color,
              fontFamily:"inherit",fontSize:11,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>
            {chip.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <Inp value={search} onChange={setSearch} placeholder="Search tickets…" style={{maxWidth:220}}/>
        <Sel value={stF} onChange={setStF} style={{width:132}}>
          <option value="">All Statuses</option>
          {["Open","In Progress","Pending","Resolved","Closed","Completed"].map(s=><option key={s}>{s}</option>)}
        </Sel>
        <Sel value={prF} onChange={setPrF} style={{width:120}}>
          <option value="">All Priorities</option>
          {["Low","Medium","High","Critical"].map(p=><option key={p}>{p}</option>)}
        </Sel>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <Btn sm onClick={exportFn} color={C.persBlue} outline>⬇ Export CSV</Btn>
          {canRaise&&<Btn sm onClick={()=>setShowNew(true)} color={C.orange}>+ New Ticket</Btn>}
        </div>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <TblHead cols={hdrs.map((h,i)=>({h,w:cols[i]}))}/>
        {filtered.length===0&&<div style={{padding:32,textAlign:"center",color:C.textSub,fontSize:12}}>No tickets match filters</div>}
        {filtered.map(t=>{
          const asset=assets.find(a=>a.id===t.assetId);
          return(
            <div key={t.id} onClick={()=>setSelected(t)}
              style={{display:"grid",gridTemplateColumns:cols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",gap:8,cursor:"pointer",background:t.isPPM?"#f8f6ff":"#fff",transition:"background .1s"}}
              className="row-hover">
              <div>
                <div style={{color:t.isPPM?C.purple:C.azureBlue,fontWeight:700,fontSize:10}}>{t.id}</div>
                {t.isPPM&&<span style={{fontSize:8,background:C.purpleBg,color:C.purple,padding:"1px 4px",borderRadius:2,fontWeight:700,display:"inline-block",marginTop:2}}>PPM</span>}
              </div>
              <div>
                <div style={{color:C.text,fontSize:12,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
                <div style={{fontSize:10,color:C.textSub}}>{t.assetId}{asset?` · ${asset.f_name}`:""}</div>
              </div>
              <div style={{fontSize:10,color:t.isPPM?C.purple:C.textSub,fontWeight:t.isPPM?700:400}}>{t.type}</div>
              <PBadge p={t.priority}/>
              <Badge s={t.status} small/>
              <div style={{fontSize:10,color:C.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{assignLabel(t.assignTo,users,groups)}</div>
              <div style={{fontSize:9,color:C.textSub}}>{t.dueDate||t.created}</div>
            </div>
          );
        })}
      </Card>
      <div style={{fontSize:10,color:C.textSub,marginTop:6,textAlign:"right"}}>{filtered.length}/{visible.length} tickets</div>
      {(showNew||selected)&&<TicketModal ticket={selected} assets={assets} spaces={spaces} users={users} groups={groups} currentUser={currentUser} canResolve={canResolve} onSave={save} onClose={()=>{setShowNew(false);setSelected(null);}}/>}
    </div>
  );
}

function TicketModal({ticket,assets,spaces,users,groups,currentUser,canResolve,onSave,onClose}){
  const isNew=!ticket?.id;
  const [form,setForm]=useState(ticket||{priority:"Medium",status:"Open",type:"Incident",raisedBy:currentUser.id,comments:[]});
  const [comment,setComment]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addComment=()=>{
    if(!comment.trim()) return;
    const c={id:uid(),text:comment,by:currentUser.name,time:new Date().toLocaleString()};
    setForm(p=>({...p,comments:[...(p.comments||[]),c]}));setComment("");
  };
  useEffect(()=>{
    if(form.assetId&&!form.spaceId){
      const a=assets.find(a=>a.id===form.assetId);
      if(a?.f_space) set("spaceId",a.f_space);
    }
  },[form.assetId]);
  const isPPM=form.isPPM;
  return(
    <Modal title={isNew?"Create Ticket":`Ticket · ${ticket?.id}`} subtitle={isPPM?"Preventive Maintenance Ticket":ticket?.title} onClose={onClose} width={640}>
      {isPPM&&<div style={{background:C.purpleBg,border:`1px solid ${C.purple}30`,borderRadius:6,padding:12,marginBottom:14,fontSize:11,color:C.purple,fontWeight:600}}>📅 Auto-generated PPM Ticket. Status and assignment can be updated.</div>}
      <div style={{display:"grid",gap:12,marginBottom:14}}>
        {isNew&&<FRow label="Title" req><Inp value={form.title} onChange={v=>set("title",v)} placeholder="Brief description of issue"/></FRow>}
        {!isNew&&<div style={{fontSize:15,fontWeight:700,color:C.darkBlue,marginBottom:4}}>{form.title}</div>}
        {isNew&&<FRow label="Description" req><Tarea value={form.desc} onChange={v=>set("desc",v)} placeholder="Detailed description…"/></FRow>}
        {!isNew&&form.desc&&<div style={{background:C.bg,borderRadius:4,padding:12,fontSize:12,color:C.textSub,lineHeight:1.6,marginBottom:4}}>{form.desc}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {!isPPM&&<FRow label="Asset">
            <Sel value={form.assetId||""} onChange={v=>set("assetId",v)}>
              <option value="">— Select Asset —</option>
              {assets.map(a=><option key={a.id} value={a.id}>{a.id} · {a.f_name}</option>)}
            </Sel>
          </FRow>}
          {!isPPM&&<FRow label="Type">
            <Sel value={form.type||"Incident"} onChange={v=>set("type",v)}>
              {["Incident","Maintenance","Request","Change"].map(t=><option key={t}>{t}</option>)}
            </Sel>
          </FRow>}
          <FRow label="Priority">
            <Sel value={form.priority} onChange={v=>set("priority",v)}>
              {["Low","Medium","High","Critical"].map(p=><option key={p}>{p}</option>)}
            </Sel>
          </FRow>
          <FRow label="Status">
            <Sel value={form.status} onChange={v=>set("status",v)} disabled={!canResolve&&!isNew}>
              {["Open","In Progress","Pending","Resolved","Closed","Completed"].map(s=><option key={s}>{s}</option>)}
            </Sel>
          </FRow>
        </div>
        <AssignSelector value={form.assignTo} onChange={v=>set("assignTo",v)} users={users} groups={groups} label="Assign To" required/>
        {form.assetId&&<FRow label="Location">
          <div style={{fontSize:12,color:C.textSub,padding:"7px 10px",background:C.bg,borderRadius:4,border:`1px solid ${C.border}`}}>
            {spacePath(assets.find(a=>a.id===form.assetId)?.f_space||"",spaces)||"—"}
          </div>
        </FRow>}
      </div>
      {!isNew&&(
        <div style={{borderTop:`1px solid ${C.sand}`,paddingTop:14}}>
          <Lbl>Activity ({form.comments?.length||0})</Lbl>
          <div style={{maxHeight:150,overflowY:"auto",marginBottom:10}}>
            {(form.comments||[]).map(c=>(
              <div key={c.id} style={{background:C.bg,borderRadius:4,padding:10,marginBottom:6}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:4}}>
                  <span style={{color:C.azureBlue,fontWeight:700}}>{c.by}</span>
                  <span style={{color:C.textSub}}>{c.time}</span>
                </div>
                <div style={{fontSize:12,color:C.textSub}}>{c.text}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <Inp value={comment} onChange={setComment} placeholder="Add comment…" style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&addComment()}/>
            <Btn sm onClick={addComment} color={C.azureBlue}>Post</Btn>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginTop:16}}>
        <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
        <Btn onClick={()=>onSave(form)}>{isNew?"Create Ticket":"Save Changes"}</Btn>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   PPM SCHEDULES (Admin view)
═══════════════════════════════════════════════════ */
function PPMSchedules({schedules,setSchedules,procedures,setProcedures,assets,users,groups,tickets,setTickets,notify}){
  const [tab,setTab]=useState("schedules");
  const [showSched,setShowSched]=useState(false);
  const [showProc,setShowProc]=useState(false);
  const [editSched,setEditSched]=useState(null);
  const [editProc,setEditProc]=useState(null);

  const ppmTickets=tickets.filter(t=>t.isPPM);

  const saveSched=d=>{
    if(d.id&&!d._isNew){
      setSchedules(p=>p.map(s=>s.id===d.id?d:s));notify("Schedule updated");
    } else {
      const ns={...d,id:uid("SCH"),active:true,lastRun:null,
        nextDue:new Date(Date.now()+freqDays(d.frequency)*86400000).toISOString().slice(0,10)};
      setSchedules(p=>[...p,ns]);
      const asset=assets.find(a=>a.id===ns.assetId);
      const proc=procedures.find(p=>p.id===ns.procedureId);
      if(asset&&proc){
        const pts=genPPMTickets(ns,asset,proc);
        setTickets(p=>[...pts,...p]);
        notify(`Schedule created. ${pts.length} PPM tickets generated in Tickets list.`);
      } else {
        notify("Schedule created (select asset & procedure to generate tickets)");
      }
    }
    setShowSched(false);setEditSched(null);
  };
  const saveProc=d=>{
    if(d.id&&!d._isNew) setProcedures(p=>p.map(pr=>pr.id===d.id?d:pr));
    else setProcedures(p=>[{...d,id:uid("PR")},...p]);
    notify(d._isNew?"Procedure created":"Procedure updated");
    setShowProc(false);setEditProc(null);
  };
  const exportSchedules=()=>exportCSV(schedules,[
    {label:"ID",key:"id"},{label:"Name",key:"name"},
    {label:"Asset",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||r.assetId},
    {label:"Frequency",key:"frequency"},{label:"Type",key:"type"},
    {label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
    {label:"Next Due",key:"nextDue"},{label:"Active",val:r=>r.active?"Yes":"No"},
  ],"ppm_schedules.csv");
  const exportPPM=()=>exportCSV(ppmTickets,[
    {label:"Ticket ID",key:"id"},{label:"Title",key:"title"},{label:"Status",key:"status"},
    {label:"Asset",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||r.assetId},
    {label:"Due Date",key:"dueDate"},{label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
    {label:"Guideline Agreed",val:r=>r.guidelineAgreed?"Yes":"No"},
    {label:"Observations",key:"observations"},{label:"Corrective",val:r=>r.corrective?"Yes":"No"},
  ],"ppm_tickets.csv");

  const schedCols=["90px","1fr","80px","90px","140px","120px","88px","56px"];
  const schedHdrs=["ID","Name / Asset","Freq","Type","Assigned To","Procedure","Next Due","Active"];
  const ppmCols=["100px","1fr","88px","100px","150px","88px"];
  const ppmHdrs=["Ticket ID","Title","Status","Due Date","Assigned To","Corrective"];
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        {["schedules","procedures","ppm_tickets"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"7px 16px",borderRadius:4,background:tab===t?C.darkBlue:"transparent",
              color:tab===t?C.white:C.textSub,border:`1.5px solid ${tab===t?C.darkBlue:C.border}`,
              fontFamily:"inherit",fontSize:11,fontWeight:tab===t?700:400,cursor:"pointer"}}>
            {t==="schedules"?"Schedules":t==="procedures"?"Procedures":`PPM Tickets (${ppmTickets.length})`}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {tab==="schedules"&&<><Btn sm onClick={exportSchedules} color={C.persBlue} outline>⬇ CSV</Btn><Btn sm onClick={()=>{setEditSched(null);setShowSched(true);}}>+ New Schedule</Btn></>}
          {tab==="procedures"&&<Btn sm onClick={()=>{setEditProc(null);setShowProc(true);}}>+ New Procedure</Btn>}
          {tab==="ppm_tickets"&&<Btn sm onClick={exportPPM} color={C.persBlue} outline>⬇ Export CSV</Btn>}
        </div>
      </div>

      {tab==="schedules"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <TblHead cols={schedHdrs.map((h,i)=>({h,w:schedCols[i]}))}/>
          {schedules.map(s=>{
            const asset=assets.find(a=>a.id===s.assetId);
            const proc=procedures.find(p=>p.id===s.procedureId);
            const tc=ppmTickets.filter(t=>t.scheduleId===s.id).length;
            return(
              <div key={s.id} onClick={()=>{setEditSched({...s,_isNew:false});setShowSched(true);}} className="row-hover"
                style={{display:"grid",gridTemplateColumns:schedCols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",cursor:"pointer",gap:8}}>
                <div style={{color:C.purple,fontWeight:700,fontSize:10}}>{s.id}</div>
                <div>
                  <div style={{color:C.text,fontWeight:500,fontSize:12}}>{s.name}</div>
                  <div style={{fontSize:10,color:C.textSub}}>{asset?.f_name||s.assetId} · {tc} tickets</div>
                </div>
                <div style={{fontSize:10,color:C.textSub}}>{s.frequency}</div>
                <span style={{fontSize:9,background:s.type==="Internal"?C.blueBg:C.purpleBg,color:s.type==="Internal"?C.blue:C.purple,padding:"2px 7px",borderRadius:3,fontWeight:700}}>{s.type}</span>
                <div style={{fontSize:10,color:C.textSub,overflow:"hidden",textOverflow:"ellipsis"}}>{assignLabel(s.assignTo,users,groups)}</div>
                <div style={{fontSize:10,color:C.textSub}}>{proc?.name||"—"}</div>
                <div style={{fontSize:10,color:s.nextDue&&dLeft(s.nextDue)<7?C.red:C.textSub,fontWeight:s.nextDue&&dLeft(s.nextDue)<7?700:400}}>{s.nextDue||"—"}</div>
                <span style={{fontSize:9,color:s.active?C.green:C.grey,background:s.active?C.greenBg:"#f0f0f0",padding:"2px 7px",borderRadius:3,fontWeight:700}}>{s.active?"ON":"OFF"}</span>
              </div>
            );
          })}
          {schedules.length===0&&<div style={{padding:32,textAlign:"center",color:C.textSub,fontSize:12}}>No schedules configured</div>}
        </Card>
      )}

      {tab==="procedures"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <TblHead cols={[{h:"ID",w:"90px"},{h:"Procedure Name",w:"1fr"},{h:"Parameters",w:"110px"},{h:"Actions",w:"80px"}]}/>
          {procedures.map(p=>(
            <div key={p.id} onClick={()=>{setEditProc({...p,_isNew:false});setShowProc(true);}} className="row-hover"
              style={{display:"grid",gridTemplateColumns:"90px 1fr 110px 80px",padding:"12px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",cursor:"pointer",gap:8}}>
              <div style={{color:C.purple,fontWeight:700,fontSize:10}}>{p.id}</div>
              <div style={{color:C.text,fontSize:12,fontWeight:500}}>{p.name}</div>
              <div style={{color:C.textSub}}>{p.checklistItems?.length||0} parameters</div>
              <Btn sm onClick={e=>{e.stopPropagation();setEditProc({...p,_isNew:false});setShowProc(true);}}>Edit</Btn>
            </div>
          ))}
          {procedures.length===0&&<div style={{padding:32,textAlign:"center",color:C.textSub,fontSize:12}}>No procedures defined</div>}
        </Card>
      )}

      {tab==="ppm_tickets"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <TblHead cols={ppmHdrs.map((h,i)=>({h,w:ppmCols[i]}))}/>
          {ppmTickets.map(t=>(
            <div key={t.id} style={{display:"grid",gridTemplateColumns:ppmCols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",gap:8}}>
              <div style={{color:C.purple,fontWeight:700,fontSize:10}}>{t.id}</div>
              <div style={{color:C.text,fontSize:12}}>{t.title}</div>
              <Badge s={t.status} small/>
              <div style={{fontSize:10,color:t.dueDate&&dLeft(t.dueDate)<3?C.red:C.textSub,fontWeight:t.dueDate&&dLeft(t.dueDate)<3?700:400}}>{t.dueDate||"—"}</div>
              <div style={{fontSize:10,color:C.textSub}}>{assignLabel(t.assignTo,users,groups)}</div>
              <div>{t.corrective?<span style={{fontSize:9,background:C.redBg,color:C.red,padding:"2px 6px",borderRadius:3,fontWeight:700}}>YES</span>:<span style={{color:C.textSub,fontSize:10}}>—</span>}</div>
            </div>
          ))}
          {ppmTickets.length===0&&<div style={{padding:32,textAlign:"center",color:C.textSub,fontSize:12}}>No PPM tickets generated yet</div>}
        </Card>
      )}

      {showSched&&<SchedModal sched={editSched} assets={assets} procedures={procedures} users={users} groups={groups} onSave={saveSched} onClose={()=>{setShowSched(false);setEditSched(null);}}/>}
      {showProc&&<ProcModal proc={editProc} onSave={saveProc} onClose={()=>{setShowProc(false);setEditProc(null);}}/>}
    </div>
  );
}

function SchedModal({sched,assets,procedures,users,groups,onSave,onClose}){
  const [form,setForm]=useState(sched||{frequency:"Monthly",type:"Internal",active:true,_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <Modal title={form._isNew?"New PPM Schedule":"Edit Schedule"} onClose={onClose} width={580}>
      <div style={{display:"grid",gap:12}}>
        <FRow label="Schedule Name" req><Inp value={form.name} onChange={v=>set("name",v)} placeholder="e.g. UPS Monthly PM"/></FRow>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <FRow label="Asset" req>
            <Sel value={form.assetId||""} onChange={v=>set("assetId",v)}>
              <option value="">— Select Asset —</option>
              {assets.map(a=><option key={a.id} value={a.id}>{a.id} · {a.f_name}</option>)}
            </Sel>
          </FRow>
          <FRow label="Procedure" req>
            <Sel value={form.procedureId||""} onChange={v=>set("procedureId",v)}>
              <option value="">— Select Procedure —</option>
              {procedures.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
          </FRow>
          <FRow label="Frequency">
            <Sel value={form.frequency||"Monthly"} onChange={v=>set("frequency",v)}>
              {FREQUENCIES.map(f=><option key={f}>{f}</option>)}
            </Sel>
          </FRow>
          <FRow label="Type">
            <Sel value={form.type||"Internal"} onChange={v=>set("type",v)}>
              <option>Internal</option><option>External</option>
            </Sel>
          </FRow>
          <FRow label="Next Due Date"><Inp type="date" value={form.nextDue} onChange={v=>set("nextDue",v)}/></FRow>
        </div>
        <AssignSelector value={form.assignTo} onChange={v=>set("assignTo",v)} users={users} groups={groups} label="Assign To (User or Group)" required/>
        <Tog value={form.active||false} onChange={v=>set("active",v)} label="Schedule Active (auto-generates tickets)"/>
        {form._isNew&&form.frequency&&(
          <div style={{background:C.blueBg,border:`1px solid ${C.azureBlue}30`,borderRadius:6,padding:12,fontSize:11,color:C.blue}}>
            📅 On save, <strong>{freqCount(form.frequency)} PPM tickets</strong> will be auto-generated and appear in the main Tickets list, assigned to the selected user/group.
          </div>
        )}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
          <Btn onClick={()=>{if(!form.name||!form.assetId||!form.procedureId||!form.assignTo)return alert("Fill all required fields");onSave(form);}}>Save Schedule</Btn>
        </div>
      </div>
    </Modal>
  );
}

function ProcModal({proc,onSave,onClose}){
  const [form,setForm]=useState(proc||{name:"",guidelines:"",checklistItems:[],_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>setForm(p=>({...p,checklistItems:[...p.checklistItems,{id:uid("ci"),label:"",type:"text",required:false,unit:"",options:[]}]}));
  const updItem=(idx,k,v)=>setForm(p=>({...p,checklistItems:p.checklistItems.map((c,i)=>i===idx?{...c,[k]:v}:c)}));
  const remItem=idx=>setForm(p=>({...p,checklistItems:p.checklistItems.filter((_,i)=>i!==idx)}));
  const move=(idx,d)=>{
    const arr=[...form.checklistItems]; const ni=idx+d;
    if(ni<0||ni>=arr.length) return;
    [arr[idx],arr[ni]]=[arr[ni],arr[idx]];
    setForm(p=>({...p,checklistItems:arr}));
  };
  return(
    <Modal title={form._isNew?"New Procedure":"Edit Procedure"} subtitle={form.name} onClose={onClose} width={720}>
      <div style={{display:"grid",gap:14}}>
        <FRow label="Procedure Name" req><Inp value={form.name} onChange={v=>set("name",v)} placeholder="e.g. UPS Monthly Inspection"/></FRow>
        <FRow label="Guidelines / Safety Instructions">
          <Tarea value={form.guidelines} onChange={v=>set("guidelines",v)} rows={6} placeholder={"## Safety\n1. Wear PPE...\n\n## Scope\nThis procedure covers..."}/>
        </FRow>
        <Sec title={`Checklist Parameters (${form.checklistItems.length})`} action={<Btn sm onClick={addItem} color={C.azureBlue}>+ Add Parameter</Btn>}>
          {form.checklistItems.map((item,idx)=>(
            <div key={item.id} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:12,marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 100px 90px 80px 60px",gap:8,alignItems:"end"}}>
                <FRow label={`Parameter ${idx+1}`}><Inp value={item.label} onChange={v=>updItem(idx,"label",v)} placeholder="e.g. Input Voltage"/></FRow>
                <FRow label="Type">
                  <Sel value={item.type} onChange={v=>updItem(idx,"type",v)}>
                    <option value="text">Free Text</option>
                    <option value="decimal">Decimal</option>
                    <option value="yesno">Yes / No</option>
                    <option value="select">Dropdown</option>
                  </Sel>
                </FRow>
                <FRow label={item.type==="decimal"?"Unit":"Options"}>
                  {item.type==="decimal"
                    ?<Inp value={item.unit||""} onChange={v=>updItem(idx,"unit",v)} placeholder="V, %, °C"/>
                    :item.type==="select"
                      ?<Inp value={Array.isArray(item.options)?item.options.join(","):(item.options||"")} onChange={v=>updItem(idx,"options",v.split(",").map(s=>s.trim()).filter(Boolean))} placeholder="opt1,opt2"/>
                      :<span style={{fontSize:10,color:C.grey,padding:"7px 0",display:"block"}}>—</span>}
                </FRow>
                <FRow label="Required"><Tog value={item.required||false} onChange={v=>updItem(idx,"required",v)}/></FRow>
                <div style={{display:"flex",gap:4,paddingBottom:2}}>
                  <button onClick={()=>move(idx,-1)} style={{background:"none",border:`1px solid ${C.border}`,color:C.textSub,width:22,height:22,borderRadius:3,cursor:"pointer",fontSize:11}}>↑</button>
                  <button onClick={()=>move(idx,1)}  style={{background:"none",border:`1px solid ${C.border}`,color:C.textSub,width:22,height:22,borderRadius:3,cursor:"pointer",fontSize:11}}>↓</button>
                  <button onClick={()=>remItem(idx)} style={{background:"none",border:`1px solid ${C.red}40`,color:C.red,width:22,height:22,borderRadius:3,cursor:"pointer",fontSize:13}}>✕</button>
                </div>
              </div>
            </div>
          ))}
          {form.checklistItems.length===0&&<div style={{fontSize:11,color:C.textSub,padding:"8px 0"}}>No parameters yet. Click "+ Add Parameter" above.</div>}
        </Sec>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
          <Btn onClick={()=>{
            if(!form.name||!form.guidelines)return alert("Name and guidelines required");
            onSave({...form,checklistItems:form.checklistItems.map(ci=>({
              ...ci,options:ci.type==="select"?(Array.isArray(ci.options)?ci.options:String(ci.options||"").split(",").map(o=>o.trim()).filter(Boolean)):[]
            }))});
          }}>Save Procedure</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   PPM EXECUTION (Technician / Vendor login)
═══════════════════════════════════════════════════ */
function PPMExec({tickets,setTickets,assets,procedures,users,groups,currentUser,notify,spaces}){
  const [execTicket,setExecTicket]=useState(null);   // ticket being executed
  const [scanOpen,setScanOpen]=useState(false);       // QR/asset lookup panel
  const [scanInput,setScanInput]=useState("");        // typed asset ID
  const [foundAsset,setFoundAsset]=useState(null);    // asset found by scan/select
  const [taskPick,setTaskPick]=useState(null);        // if multiple PPM tasks for asset

  const myGroupIds=groups.filter(g=>g.members.includes(currentUser.id)).map(g=>g.id);
  const canSee=t=>{
    if(!t.isPPM) return false;
    if(t.assignTo?.kind==="user"&&t.assignTo.id===currentUser.id) return true;
    if(t.assignTo?.kind==="group"&&myGroupIds.includes(t.assignTo.id)) return true;
    if(["admin","resolver"].includes(currentUser.role)) return true;
    return false;
  };
  const myPPM   = tickets.filter(t=>canSee(t)&&!["Completed","Closed"].includes(t.status));
  const done    = tickets.filter(t=>canSee(t)&& ["Completed","Closed"].includes(t.status));

  // Assets that have pending PPM tasks assigned to this user
  const assetsWithPPM = assets.filter(a=>myPPM.some(t=>t.assetId===a.id));

  const openScan = (preselect=null) => {
    setFoundAsset(preselect);
    setTaskPick(null);
    setScanInput(preselect?.id||"");
    setScanOpen(true);
  };

  const doLookup = (idStr) => {
    const q = (idStr||scanInput).trim().toUpperCase();
    if(!q){ notify("Enter an asset number","error"); return; }
    const asset = assets.find(a=>a.id.toUpperCase()===q || a.id.toUpperCase().includes(q));
    if(!asset){ notify("Asset not found — check the asset number","error"); return; }
    const tasks = myPPM.filter(t=>t.assetId===asset.id);
    if(!tasks.length){ notify("No pending PPM tasks for this asset","error"); return; }
    setFoundAsset(asset);
    setScanInput(asset.id);
    if(tasks.length===1){ startTask(tasks[0]); }
    else { setTaskPick(tasks); }
  };

  const startTask = (ticket) => {
    setScanOpen(false);
    setFoundAsset(null);
    setTaskPick(null);
    setScanInput("");
    setExecTicket(ticket);
  };

  const handleSubmit=(updated,hasObs)=>{
    setTickets(p=>p.map(t=>t.id===updated.id?updated:t));
    if(hasObs){
      const corr={
        id:uid("T"),
        title:`[PM Corrective] ${updated.title.replace("[PPM] ","")}`,
        assetId:updated.assetId,priority:"Medium",status:"Open",
        type:"PM Corrective",isPPM:false,
        assignTo:updated.assignTo,raisedBy:currentUser.id,
        created:new Date().toISOString().slice(0,10),dueDate:null,
        desc:`Corrective action raised from PPM execution:\n${updated.observations}`,
        comments:[],spaceId:updated.spaceId,
      };
      setTickets(p=>[corr,...p]);
      notify("PPM submitted ✓ — Corrective ticket auto-created from observations.");
    } else {
      notify("PPM completed successfully ✓");
    }
    setExecTicket(null);
  };

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:C.darkBlue}}>My PPM Tasks</div>
          <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{myPPM.length} pending · {done.length} completed</div>
        </div>
        <Btn onClick={()=>openScan()} color={C.purple}>⊞ Scan / Find Asset</Btn>
      </div>

      {/* ── QR / Asset Lookup Panel ── */}
      {scanOpen&&(
        <div style={{background:C.purpleBg,border:`2px solid ${C.purple}`,borderRadius:10,padding:22,marginBottom:24}}>
          <div style={{fontSize:14,fontWeight:800,color:C.purple,marginBottom:4}}>⊞ Asset QR Code / Lookup</div>
          <div style={{fontSize:11,color:C.textSub,marginBottom:16}}>Enter the asset number printed on the QR label, or pick from the list below.</div>

          {/* Text / QR input */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <Inp value={scanInput} onChange={v=>{setScanInput(v);setFoundAsset(null);setTaskPick(null);}}
              placeholder="Enter asset number e.g. XXXBW2FUR-00001"
              style={{flex:1,fontFamily:"monospace",fontWeight:600,fontSize:13}}
              onKeyDown={e=>e.key==="Enter"&&doLookup()}/>
            <Btn onClick={()=>doLookup()} color={C.purple}>Look Up</Btn>
            <Btn onClick={()=>{setScanOpen(false);setFoundAsset(null);setTaskPick(null);setScanInput("");}} outline color={C.grey}>Cancel</Btn>
          </div>

          {/* Asset dropdown — shows all assets with pending PPM */}
          <div style={{marginBottom:16}}>
            <Lbl>— or select asset from pending PPM list —</Lbl>
            <div style={{display:"grid",gap:8}}>
              {assetsWithPPM.length===0&&<div style={{fontSize:12,color:C.textSub,fontStyle:"italic"}}>No assets with pending PPM tasks assigned to you.</div>}
              {assetsWithPPM.map(a=>{
                const tasks=myPPM.filter(t=>t.assetId===a.id);
                const overdue=tasks.some(t=>t.dueDate&&dLeft(t.dueDate)<0);
                return(
                  <div key={a.id} onClick={()=>{setScanInput(a.id);setFoundAsset(a);setTaskPick(tasks.length>1?tasks:null);if(tasks.length===1)startTask(tasks[0]);}}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.white,border:`1.5px solid ${overdue?C.red:foundAsset?.id===a.id?C.purple:C.border}`,borderRadius:6,cursor:"pointer",transition:"border-color .15s"}}
                    className="row-hover">
                    <div style={{background:C.bg,padding:6,borderRadius:4,flexShrink:0}}><QRGrid text={a.id} size={40}/></div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"monospace",fontSize:12,fontWeight:800,color:C.persBlue,letterSpacing:"0.04em"}}>{a.id}</div>
                      <div style={{fontSize:12,color:C.text,fontWeight:500}}>{a.f_name}</div>
                      <div style={{fontSize:10,color:C.textSub}}>{spacePath(a.f_space, spaces)||a.f_space}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:10,color:overdue?C.red:C.textSub,fontWeight:overdue?700:400}}>{tasks.length} task{tasks.length>1?"s":""}</div>
                      {overdue&&<div style={{fontSize:9,color:C.red,fontWeight:700}}>OVERDUE</div>}
                    </div>
                    <Btn sm color={C.purple} onClick={e=>{e.stopPropagation();setScanInput(a.id);if(tasks.length===1)startTask(tasks[0]);else{setFoundAsset(a);setTaskPick(tasks);}}}>Select →</Btn>
                  </div>
                );
              })}
            </div>
          </div>

          {/* If multiple tasks for found asset, show task picker */}
          {taskPick&&foundAsset&&(
            <div style={{background:C.white,border:`1.5px solid ${C.purple}`,borderRadius:6,padding:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.purple,marginBottom:10}}>Select PPM Task for {foundAsset.f_name}</div>
              {taskPick.map(t=>{
                const proc=procedures.find(p=>p.id===t.procedureId);
                const overdue=t.dueDate&&dLeft(t.dueDate)<0;
                return(
                  <div key={t.id} onClick={()=>startTask(t)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,marginBottom:6,cursor:"pointer"}} className="row-hover">
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.title}</div>
                      <div style={{fontSize:10,color:C.textSub}}>{proc?.name} · Due: <span style={{color:overdue?C.red:C.textSub,fontWeight:overdue?700:400}}>{t.dueDate}</span></div>
                    </div>
                    <Badge s={t.status} small/>
                    <Btn sm color={C.darkBlue}>Start →</Btn>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Pending PPM Task Cards ── */}
      {myPPM.length===0&&!scanOpen&&(
        <Card style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{fontSize:40,marginBottom:8}}>✓</div>
          <div style={{fontSize:14,color:C.textSub,marginBottom:16}}>No pending PPM tasks assigned to you</div>
          <Btn sm onClick={()=>openScan()} color={C.purple}>⊞ Scan QR to Check</Btn>
        </Card>
      )}

      <div style={{display:"grid",gap:12,marginBottom:24}}>
        {myPPM.map(t=>{
          const asset=assets.find(a=>a.id===t.assetId);
          const proc=procedures.find(p=>p.id===t.procedureId);
          const overdue=t.dueDate&&dLeft(t.dueDate)<0;
          return(
            <Card key={t.id} style={{display:"flex",gap:14,alignItems:"center",border:`1.5px solid ${overdue?C.red:C.border}`,background:overdue?C.redBg:C.white}}>
              <div style={{background:C.bg,borderRadius:6,padding:8,flexShrink:0,cursor:"pointer"}} onClick={()=>openScan(asset)}>
                <QRGrid text={t.assetId} size={52}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.persBlue,letterSpacing:"0.04em",marginBottom:2}}>{t.assetId}</div>
                <div style={{fontSize:13,color:C.darkBlue,fontWeight:700,marginBottom:2}}>{t.title}</div>
                <div style={{fontSize:11,color:C.textSub,marginBottom:6}}>{asset?.f_name} · {proc?.name}</div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <Badge s={t.status} small/>
                  <span style={{fontSize:10,color:overdue?C.red:C.textSub,fontWeight:overdue?700:400}}>{overdue?"⚠ OVERDUE — Due":"Due"}: {t.dueDate}</span>
                  <span style={{fontSize:10,color:C.textSub}}>{assignLabel(t.assignTo,users,groups)}</span>
                </div>
              </div>
              {/* Start PPM → opens scan panel pre-filled with this asset */}
              <Btn color={C.darkBlue} onClick={()=>{ openScan(asset); }}>Start PPM →</Btn>
            </Card>
          );
        })}
      </div>

      {/* ── Completed ── */}
      {done.length>0&&(
        <div>
          <Lbl>Completed ({done.length})</Lbl>
          {done.slice(0,5).map(t=>(
            <div key={t.id} style={{display:"flex",gap:10,padding:"9px 14px",background:C.white,border:`1px solid ${C.border}`,borderRadius:4,marginBottom:6,fontSize:11,alignItems:"center"}}>
              <span style={{fontFamily:"monospace",fontSize:9,color:C.purple,fontWeight:700,minWidth:100}}>{t.assetId}</span>
              <span style={{flex:1,color:C.textSub,fontSize:11}}>{t.title}</span>
              <Badge s={t.status} small/>
              {t.corrective&&<span style={{fontSize:9,background:C.redBg,color:C.red,padding:"2px 6px",borderRadius:3,fontWeight:700}}>CORRECTIVE RAISED</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Execution Modal ── */}
      {execTicket&&<PPMExecModal
        ticket={execTicket} assets={assets} procedures={procedures}
        users={users} groups={groups} currentUser={currentUser}
        notify={notify} onClose={()=>setExecTicket(null)} onSubmit={handleSubmit}/>}
    </div>
  );
}

function PPMExecModal({ticket,assets,procedures,users,groups,currentUser,notify,onClose,onSubmit}){
  const [step,setStep]=useState(ticket.guidelineAgreed?1:0);
  const [agreed,setAgreed]=useState(ticket.guidelineAgreed||false);
  const [responses,setResponses]=useState(ticket.responses||{});
  const [observations,setObservations]=useState(ticket.observations||"");
  const [photo,setPhoto]=useState(ticket.photoUrl||null);
  const proc=procedures.find(p=>p.id===ticket.procedureId);
  const asset=assets.find(a=>a.id===ticket.assetId);

  const renderGuide=text=>(text||"No guidelines configured.").split("\n").map((line,i)=>{
    if(line.startsWith("## ")) return <div key={i} style={{fontSize:13,fontWeight:700,color:C.darkBlue,marginTop:12,marginBottom:4}}>{line.slice(3)}</div>;
    if(line.startsWith("# "))  return <div key={i} style={{fontSize:15,fontWeight:700,color:C.persBlue,marginBottom:6}}>{line.slice(2)}</div>;
    if(/^\d+\./.test(line))    return <div key={i} style={{fontSize:12,color:C.textSub,padding:"2px 0 2px 14px"}}>{line}</div>;
    if(line.trim()==="")       return <div key={i} style={{height:6}}/>;
    return <div key={i} style={{fontSize:12,color:C.textSub}}>{line}</div>;
  });

  const reqItems=(proc?.checklistItems||[]).filter(c=>c.required);
  const allReq=reqItems.length===0||reqItems.every(c=>{const v=responses[c.id];return v!==undefined&&v!==null&&String(v).trim()!=="";});

  const submit=()=>{
    if(!allReq){notify("Please fill all required parameters (marked *)","error");return;}
    const hasObs=observations.trim().length>0;
    onSubmit({...ticket,status:"Completed",guidelineAgreed:true,responses,observations,photoUrl:photo,corrective:hasObs},hasObs);
  };

  const stepLabels=["Guidelines & Safety","Checklist Parameters","Review & Submit"];
  return(
    <Modal title={`PPM Execution · ${ticket.id}`} subtitle={asset?.f_name||ticket.assetId} onClose={onClose} width={700}>
      {/* Asset strip */}
      <div style={{display:"flex",gap:12,alignItems:"center",background:C.bg,borderRadius:6,padding:12,marginBottom:16}}>
        <QRGrid text={ticket.assetId} size={44}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:C.darkBlue}}>{asset?.f_name||ticket.assetId}</div>
          <div style={{fontSize:11,color:C.textSub}}>{proc?.name} · Due: {ticket.dueDate}</div>
        </div>
        <Badge s={ticket.status}/>
      </div>
      {/* Step indicator */}
      <div style={{display:"flex",marginBottom:20,borderRadius:4,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
        {stepLabels.map((s,i)=>(
          <div key={i} style={{flex:1,textAlign:"center",padding:"9px 4px",
            background:step===i?C.darkBlue:step>i?C.azureBlue:C.bg,
            color:step>=i?"#fff":C.textSub,fontSize:10,fontWeight:step===i?700:400,
            borderRight:i<2?`1px solid rgba(255,255,255,.2)`:undefined}}>
            {step>i?"✓ ":""}{s}
          </div>
        ))}
      </div>

      {/* STEP 0 – Guidelines */}
      {step===0&&(
        <div>
          <div style={{background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:6,padding:16,maxHeight:300,overflowY:"auto",marginBottom:14}}>
            {renderGuide(proc?.guidelines)}
          </div>
          <div style={{background:"#fffbeb",border:`1.5px solid ${C.orange}40`,borderRadius:6,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.orange,marginBottom:8}}>⚠ Safety Agreement Required</div>
            <div style={{fontSize:12,color:C.textSub,lineHeight:1.6,marginBottom:12}}>I have read and understood all safety guidelines. I confirm I am qualified to perform this task and have the required PPE and tools ready.</div>
            <Tog value={agreed} onChange={setAgreed} label="I agree to all guidelines and safety instructions above"/>
          </div>
          <Btn onClick={()=>setStep(1)} disabled={!agreed}>Proceed to Checklist →</Btn>
        </div>
      )}

      {/* STEP 1 – Checklist */}
      {step===1&&(
        <div>
          <div style={{maxHeight:380,overflowY:"auto",paddingRight:4,marginBottom:14}}>
            {(proc?.checklistItems||[]).map((item,idx)=>(
              <div key={item.id} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:12,marginBottom:8}}>
                <div style={{fontSize:12,color:C.text,fontWeight:600,marginBottom:8}}>
                  {idx+1}. {item.label}
                  {item.required&&<span style={{color:C.red,marginLeft:4}}>*</span>}
                  {item.unit&&<span style={{color:C.textSub,fontSize:10,fontWeight:400,marginLeft:6}}>({item.unit})</span>}
                </div>
                {item.type==="yesno"&&(
                  <div style={{display:"flex",gap:8}}>
                    {["Yes","No"].map(v=>(
                      <button key={v} onClick={()=>setResponses(p=>({...p,[item.id]:v}))}
                        style={{flex:1,padding:"8px",borderRadius:4,
                          border:`1.5px solid ${responses[item.id]===v?(v==="Yes"?C.green:C.red):C.border}`,
                          background:responses[item.id]===v?(v==="Yes"?C.greenBg:C.redBg):"transparent",
                          color:responses[item.id]===v?(v==="Yes"?C.green:C.red):C.textSub,
                          fontFamily:"inherit",fontSize:12,cursor:"pointer",fontWeight:responses[item.id]===v?700:400}}>
                        {v==="Yes"?"✓ Yes":"✗ No"}
                      </button>
                    ))}
                  </div>
                )}
                {item.type==="decimal"&&<Inp type="number" value={responses[item.id]||""} onChange={v=>setResponses(p=>({...p,[item.id]:v}))} placeholder={`Enter reading${item.unit?` (${item.unit})`:""}`}/>}
                {item.type==="text"&&<Tarea value={responses[item.id]||""} onChange={v=>setResponses(p=>({...p,[item.id]:v}))} rows={2} placeholder="Enter observation…"/>}
                {item.type==="select"&&(
                  <Sel value={responses[item.id]||""} onChange={v=>setResponses(p=>({...p,[item.id]:v}))}>
                    <option value="">— Select —</option>
                    {getOptions(item).map(o=><option key={o}>{o}</option>)}
                  </Sel>
                )}
              </div>
            ))}
            {(proc?.checklistItems||[]).length===0&&<div style={{fontSize:12,color:C.textSub,padding:"12px 0"}}>No checklist parameters defined for this procedure.</div>}
          </div>
          <FRow label="Overall Observations / Remarks (issues found will trigger a corrective ticket)">
            <Tarea value={observations} onChange={setObservations} rows={3} placeholder="Note any issues, abnormal readings, or recommendations…"/>
          </FRow>
          <div style={{marginTop:12}}>
            <FRow label="Upload Asset Photo (optional)">
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <label style={{background:C.bg,border:`1.5px dashed ${C.border}`,borderRadius:4,padding:"9px 16px",cursor:"pointer",fontSize:11,color:C.azureBlue,fontFamily:"inherit",fontWeight:600}}>
                  📷 Choose Photo
                  <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setPhoto(URL.createObjectURL(f));}}/>
                </label>
                {photo&&<img src={photo} alt="asset" style={{height:48,borderRadius:4,border:`1px solid ${C.border}`}}/>}
                {photo&&<button onClick={()=>setPhoto(null)} style={{background:"none",border:"none",color:C.red,cursor:"pointer",fontSize:14}}>✕</button>}
              </div>
            </FRow>
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            <Btn onClick={()=>setStep(0)} outline color={C.grey}>← Back</Btn>
            <Btn onClick={()=>{if(!allReq){notify("Fill all required parameters (marked *)","error");return;}setStep(2);}}>Review & Submit →</Btn>
          </div>
        </div>
      )}

      {/* STEP 2 – Review */}
      {step===2&&(
        <div>
          <div style={{background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:6,padding:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.darkBlue,marginBottom:10}}>Submission Summary</div>
            {(proc?.checklistItems||[]).map(item=>(
              <div key={item.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.sand}`,fontSize:11}}>
                <span style={{color:C.textSub,flex:1}}>{item.label}</span>
                <span style={{color:C.text,fontWeight:600,marginLeft:12}}>{responses[item.id]||"—"} {item.unit||""}</span>
              </div>
            ))}
            {observations&&(
              <div style={{marginTop:10,background:"#fffbeb",border:`1px solid ${C.orange}40`,borderRadius:4,padding:10}}>
                <div style={{fontSize:10,color:C.orange,fontWeight:700,marginBottom:4}}>⚠ OBSERVATIONS (corrective ticket will be created)</div>
                <div style={{fontSize:11,color:C.text}}>{observations}</div>
              </div>
            )}
          </div>
          {photo&&<img src={photo} alt="asset" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:6,marginBottom:12,border:`1px solid ${C.border}`}}/>}
          <div style={{display:"flex",gap:8}}>
            <Btn onClick={()=>setStep(1)} outline color={C.grey}>← Back</Btn>
            <Btn onClick={submit} color={C.green}>✓ Submit PPM</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   USERS & GROUPS
═══════════════════════════════════════════════════ */
function Users({users,setUsers,groups,setGroups,roles,spaces,currentUser,notify}){
  const [tab,setTab]=useState("users");
  const [showUser,setShowUser]=useState(false);
  const [showGroup,setShowGroup]=useState(false);
  const [editUser,setEditUser]=useState(null);
  const [editGroup,setEditGroup]=useState(null);
  const role=roles.find(r=>r.id===currentUser.role);
  const canEdit=role?.perms?.users==="edit";

  const saveUser=d=>{
    if(d.id&&!d._isNew) setUsers(p=>p.map(u=>u.id===d.id?d:u));
    else setUsers(p=>[{...d,id:uid("U")},...p]);
    notify(d._isNew?"User created":"User updated");
    setShowUser(false);setEditUser(null);
  };
  const saveGroup=d=>{
    if(d.id&&!d._isNew) setGroups(p=>p.map(g=>g.id===d.id?d:g));
    else setGroups(p=>[{...d,id:uid("G")},...p]);
    notify(d._isNew?"Group created":"Group updated");
    setShowGroup(false);setEditGroup(null);
  };
  const exportUsers=()=>exportCSV(users,[
    {label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},
    {label:"Role",val:r=>roles.find(x=>x.id===r.role)?.label||r.role},
    {label:"Department",key:"dept"},{label:"Phone",key:"phone"},
    {label:"Vendor",val:r=>r.vendor?"Yes":"No"},
    {label:"Vendor Name",val:r=>r.vendorName||""},
    {label:"Space Scope",val:r=>spaces.find(s=>s.id===r.spaceScope)?.name||"All"},
    {label:"Active",val:r=>r.active?"Yes":"No"},
  ],"users_export.csv");

  const userCols=["80px","1fr","140px","100px","120px","80px","70px"];
  const userHdrs=["ID","Name / Email","Role","Dept","Space Scope","Vendor","Status"];
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
        {["users","groups"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"7px 16px",borderRadius:4,background:tab===t?C.darkBlue:"transparent",
              color:tab===t?C.white:C.textSub,border:`1.5px solid ${tab===t?C.darkBlue:C.border}`,
              fontFamily:"inherit",fontSize:11,fontWeight:tab===t?700:400,cursor:"pointer"}}>
            {t==="users"?`Users (${users.length})`:`User Groups (${groups.length})`}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          {canEdit&&<Btn sm onClick={exportUsers} color={C.persBlue} outline>⬇ Export CSV</Btn>}
          {canEdit&&tab==="users"&&<Btn sm onClick={()=>{setEditUser(null);setShowUser(true);}}>+ New User</Btn>}
          {canEdit&&tab==="groups"&&<Btn sm onClick={()=>{setEditGroup(null);setShowGroup(true);}}>+ New Group</Btn>}
        </div>
      </div>

      {tab==="users"&&(
        <Card style={{padding:0,overflow:"hidden"}}>
          <TblHead cols={userHdrs.map((h,i)=>({h,w:userCols[i]}))}/>
          {users.map(u=>{
            const r=roles.find(r=>r.id===u.role);
            return(
              <div key={u.id} onClick={()=>{if(canEdit){setEditUser({...u,_isNew:false});setShowUser(true);}}} className="row-hover"
                style={{display:"grid",gridTemplateColumns:userCols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",cursor:canEdit?"pointer":"default",gap:8}}>
                <div style={{color:C.azureBlue,fontWeight:700,fontSize:10}}>{u.id}</div>
                <div>
                  <div style={{color:C.text,fontSize:12,fontWeight:500}}>{u.name}</div>
                  <div style={{fontSize:10,color:C.textSub}}>{u.email}</div>
                </div>
                <div><span style={{fontSize:9,background:`${r?.color}22`,color:r?.color,padding:"2px 8px",borderRadius:3,fontWeight:700,border:`1px solid ${r?.color}33`}}>{r?.label||u.role}</span></div>
                <div style={{color:C.textSub,fontSize:11}}>{u.dept}</div>
                <div style={{color:C.textSub,fontSize:10}}>{spaces.find(s=>s.id===u.spaceScope)?.name||"All"}</div>
                <div style={{fontSize:10,color:u.vendor?C.purple:C.textSub,fontWeight:u.vendor?700:400}}>{u.vendor?"Vendor":"Internal"}</div>
                <div><Badge s={u.active?"Active":"Retired"} small/></div>
              </div>
            );
          })}
        </Card>
      )}

      {tab==="groups"&&(
        <div style={{display:"grid",gap:12}}>
          {groups.map(g=>(
            <Card key={g.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:C.darkBlue}}>{g.name}</div>
                  <div style={{fontSize:11,color:C.textSub,marginTop:2}}>{g.description}</div>
                </div>
                {canEdit&&<Btn sm onClick={()=>{setEditGroup({...g,_isNew:false});setShowGroup(true);}}>Edit</Btn>}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {g.members.map(mid=>{
                  const u=users.find(u=>u.id===mid);
                  return u?(
                    <span key={mid} style={{fontSize:11,background:C.bg,border:`1px solid ${C.border}`,padding:"4px 10px",borderRadius:4,color:C.textSub}}>
                      {u.name}{u.vendor?" 🔧":""}
                    </span>
                  ):null;
                })}
                {g.members.length===0&&<span style={{fontSize:11,color:C.textSub,fontStyle:"italic"}}>No members yet</span>}
              </div>
            </Card>
          ))}
          {groups.length===0&&<Card><div style={{textAlign:"center",color:C.textSub,fontSize:12,padding:"20px 0"}}>No groups defined yet</div></Card>}
        </div>
      )}

      {showUser&&<UserModal user={editUser} roles={roles} spaces={spaces} onSave={saveUser} onClose={()=>{setShowUser(false);setEditUser(null);}}/>}
      {showGroup&&<GroupModal group={editGroup} users={users} onSave={saveGroup} onClose={()=>{setShowGroup(false);setEditGroup(null);}}/>}
    </div>
  );
}

function UserModal({user,roles,spaces,onSave,onClose}){
  const [form,setForm]=useState(user||{active:true,vendor:false,role:"raiser",_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <Modal title={form._isNew?"New User":"Edit User"} onClose={onClose} width={520}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <FRow label="Full Name" req><Inp value={form.name} onChange={v=>set("name",v)} placeholder="John Smith"/></FRow>
        <FRow label="Email" req><Inp type="email" value={form.email} onChange={v=>set("email",v)} placeholder="user@company.com"/></FRow>
        <FRow label="Phone"><Inp value={form.phone} onChange={v=>set("phone",v)} placeholder="+91-9000000000"/></FRow>
        <FRow label="Department"><Inp value={form.dept} onChange={v=>set("dept",v)} placeholder="IT, Facilities…"/></FRow>
        <FRow label="Role" req>
          <Sel value={form.role} onChange={v=>set("role",v)}>
            {roles.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}
          </Sel>
        </FRow>
        <FRow label="Space Scope (access boundary)">
          <Sel value={form.spaceScope||""} onChange={v=>set("spaceScope",v)}>
            <option value="">All Spaces</option>
            {spaces.map(s=><option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
          </Sel>
        </FRow>
        {form.vendor&&(
          <div style={{gridColumn:"1/-1"}}>
            <FRow label="Vendor / Company Name"><Inp value={form.vendorName||""} onChange={v=>set("vendorName",v)} placeholder="VendorXYZ Services"/></FRow>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:24,marginBottom:16}}>
        <Tog value={form.active} onChange={v=>set("active",v)} label="Active User"/>
        <Tog value={form.vendor||false} onChange={v=>set("vendor",v)} label="External Vendor"/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
        <Btn onClick={()=>{if(!form.name||!form.email)return alert("Name and email are required");onSave(form);}}>Save User</Btn>
      </div>
    </Modal>
  );
}

function GroupModal({group,users,onSave,onClose}){
  const [form,setForm]=useState(group||{members:[],_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggle=mid=>setForm(p=>({...p,members:p.members.includes(mid)?p.members.filter(m=>m!==mid):[...p.members,mid]}));
  return(
    <Modal title={form._isNew?"New User Group":"Edit Group"} onClose={onClose} width={460}>
      <div style={{display:"grid",gap:12,marginBottom:14}}>
        <FRow label="Group Name" req><Inp value={form.name||""} onChange={v=>set("name",v)} placeholder="e.g. IT Operations Team"/></FRow>
        <FRow label="Description"><Inp value={form.description||""} onChange={v=>set("description",v)} placeholder="Brief description of this group"/></FRow>
        <div>
          <Lbl>Members (select who belongs to this group)</Lbl>
          <div style={{display:"grid",gap:6,maxHeight:260,overflowY:"auto"}}>
            {users.filter(u=>u.active).map(u=>{
              const sel=form.members?.includes(u.id)||false;
              return(
                <label key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:sel?C.blueBg:C.bg,border:`1.5px solid ${sel?C.azureBlue:C.border}`,borderRadius:4,cursor:"pointer",transition:"all .1s"}}>
                  <input type="checkbox" checked={sel} onChange={()=>toggle(u.id)} style={{accentColor:C.azureBlue,width:14,height:14}}/>
                  <div>
                    <div style={{fontSize:12,color:C.text,fontWeight:500}}>{u.name}</div>
                    <div style={{fontSize:10,color:C.textSub}}>{roles_ref?.find?.(r=>r.id===u.role)?.label||u.role} · {u.dept}{u.vendor?" · Vendor":""}</div>
                  </div>
                </label>
              );
            })}
          </div>
          <div style={{fontSize:10,color:C.textSub,marginTop:6}}>{form.members?.length||0} member(s) selected</div>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
        <Btn onClick={()=>{if(!form.name)return alert("Group name is required");onSave(form);}}>Save Group</Btn>
      </div>
    </Modal>
  );
}
// roles reference for GroupModal display (injected via window)
let roles_ref=[];

/* ═══════════════════════════════════════════════════
   REPORTS & EXPORT
═══════════════════════════════════════════════════ */
function Reports({assets,tickets,users,groups,spaces,schedules,procedures}){
  const ppmT=tickets.filter(t=>t.isPPM);
  const regT=tickets.filter(t=>!t.isPPM);
  const resolved=tickets.filter(t=>["Resolved","Closed","Completed"].includes(t.status)).length;
  const resRate=tickets.length?Math.round((resolved/tickets.length)*100):0;
  const totalVal=assets.reduce((s,a)=>s+(Number(a.f_cost)||0),0);
  const corrective=tickets.filter(t=>t.type==="PM Corrective");

  const exports=[
    {label:"All Assets",          desc:"Full asset register with all fields",                  color:C.darkBlue,
     fn:()=>exportCSV(assets,[
       {label:"Asset ID",key:"id"},{label:"Name",key:"f_name"},{label:"Category",key:"f_cat"},
       {label:"Status",key:"f_status"},{label:"Serial No",key:"f_serial"},
       {label:"Make",key:"f_make"},{label:"Model",key:"f_model"},
       {label:"Cost (₹)",key:"f_cost"},{label:"Purchase Date",key:"f_pdate"},{label:"Warranty Until",key:"f_warr"},
       {label:"Location",val:r=>spacePath(r.f_space,spaces)},
       {label:"Assigned To",val:r=>users.find(u=>u.id===r.f_assign)?.name||""},
     ],"report_all_assets.csv")},
    {label:"All Tickets",         desc:"Full ticket register including PPM tickets",            color:C.persBlue,
     fn:()=>exportCSV(tickets,[
       {label:"Ticket ID",key:"id"},{label:"Title",key:"title"},{label:"Type",key:"type"},
       {label:"Is PPM",val:r=>r.isPPM?"Yes":"No"},{label:"Priority",key:"priority"},{label:"Status",key:"status"},
       {label:"Asset ID",key:"assetId"},{label:"Asset Name",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||""},
       {label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
       {label:"Raised By",val:r=>users.find(u=>u.id===r.raisedBy)?.name||""},
       {label:"Created",key:"created"},{label:"Due Date",key:"dueDate"},
       {label:"Location",val:r=>spacePath(r.spaceId,spaces)},
       {label:"Observations",key:"observations"},{label:"Corrective",val:r=>r.corrective?"Yes":"No"},
     ],"report_all_tickets.csv")},
    {label:"PPM Tickets Only",    desc:"All preventive maintenance tickets with outcomes",      color:C.purple,
     fn:()=>exportCSV(ppmT,[
       {label:"Ticket ID",key:"id"},{label:"Title",key:"title"},{label:"Status",key:"status"},
       {label:"Asset",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||r.assetId},
       {label:"Schedule",val:r=>schedules.find(s=>s.id===r.scheduleId)?.name||""},
       {label:"Procedure",val:r=>procedures.find(p=>p.id===r.procedureId)?.name||""},
       {label:"Due Date",key:"dueDate"},{label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
       {label:"Guideline Agreed",val:r=>r.guidelineAgreed?"Yes":"No"},
       {label:"Observations",key:"observations"},{label:"Corrective Raised",val:r=>r.corrective?"Yes":"No"},
     ],"report_ppm_tickets.csv")},
    {label:"PPM Schedules",       desc:"All configured maintenance schedules",                  color:C.orange,
     fn:()=>exportCSV(schedules,[
       {label:"ID",key:"id"},{label:"Name",key:"name"},
       {label:"Asset",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||r.assetId},
       {label:"Frequency",key:"frequency"},{label:"Type",key:"type"},
       {label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
       {label:"Next Due",key:"nextDue"},{label:"Active",val:r=>r.active?"Yes":"No"},
       {label:"PPM Tickets",val:r=>tickets.filter(t=>t.scheduleId===r.id).length},
     ],"report_ppm_schedules.csv")},
    {label:"Corrective Actions",  desc:"PM corrective tickets raised from PPM observations",   color:C.red,
     fn:()=>exportCSV(corrective,[
       {label:"Ticket ID",key:"id"},{label:"Title",key:"title"},{label:"Status",key:"status"},
       {label:"Priority",key:"priority"},
       {label:"Asset",val:r=>assets.find(a=>a.id===r.assetId)?.f_name||r.assetId},
       {label:"Description",key:"desc"},{label:"Created",key:"created"},
       {label:"Assigned To",val:r=>assignLabel(r.assignTo,users,groups)},
     ],"report_corrective_actions.csv")},
    {label:"Users & Groups",      desc:"User register, roles and group memberships",            color:C.green,
     fn:()=>exportCSV(users,[
       {label:"ID",key:"id"},{label:"Name",key:"name"},{label:"Email",key:"email"},
       {label:"Role",val:r=>r.role},{label:"Department",key:"dept"},{label:"Phone",key:"phone"},
       {label:"Vendor",val:r=>r.vendor?"Yes":"No"},{label:"Vendor Name",val:r=>r.vendorName||""},
       {label:"Space Scope",val:r=>spaces.find(s=>s.id===r.spaceScope)?.name||"All"},
       {label:"Active",val:r=>r.active?"Yes":"No"},
     ],"report_users.csv")},
  ];

  const byStatus=["Open","In Progress","Pending","Resolved","Closed","Completed"].map(s=>({s,n:tickets.filter(t=>t.status===s).length}));
  const byPriority=["Critical","High","Medium","Low"].map(p=>({p,n:tickets.filter(t=>t.priority===p).length}));
  const maxStat=Math.max(...byStatus.map(x=>x.n),1);
  const maxPri=Math.max(...byPriority.map(x=>x.n),1);

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KPI label="Total Assets"    value={assets.length}        color={C.darkBlue}/>
        <KPI label="Portfolio Value" value={fmt(totalVal)}        color={C.persBlue}/>
        <KPI label="Total Tickets"   value={tickets.length}       color={C.orange}/>
        <KPI label="Resolution Rate" value={`${resRate}%`}        color={resRate>70?C.green:C.orange}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        <Card>
          <Sec title="Ticket Status">
            {byStatus.filter(x=>x.n>0).map(({s,n})=>(
              <div key={s} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <Badge s={s} small/><span style={{color:C.text,fontWeight:700}}>{n}</span>
                </div>
                <div style={{height:4,background:C.sand,borderRadius:2}}>
                  <div style={{height:4,width:`${(n/maxStat)*100}%`,background:SC(s),borderRadius:2}}/>
                </div>
              </div>
            ))}
          </Sec>
        </Card>
        <Card>
          <Sec title="Ticket Priority">
            {byPriority.filter(x=>x.n>0).map(({p,n})=>(
              <div key={p} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
                  <PBadge p={p}/><span style={{color:C.text,fontWeight:700}}>{n}</span>
                </div>
                <div style={{height:4,background:C.sand,borderRadius:2}}>
                  <div style={{height:4,width:`${(n/maxPri)*100}%`,background:PC(p),borderRadius:2}}/>
                </div>
              </div>
            ))}
          </Sec>
        </Card>
        <Card>
          <Sec title="PPM Summary">
            {[
              {label:"Total PPM Tickets",  val:ppmT.length,                                           color:C.purple},
              {label:"Completed",          val:ppmT.filter(t=>t.status==="Completed").length,         color:C.green},
              {label:"Pending",            val:ppmT.filter(t=>t.status==="Pending").length,           color:C.orange},
              {label:"Corrective Raised",  val:ppmT.filter(t=>t.corrective).length,                  color:C.red},
              {label:"Active Schedules",   val:schedules.filter(s=>s.active).length,                  color:C.azureBlue},
              {label:"Regular Tickets",    val:regT.length,                                           color:C.textSub},
            ].map(({label,val,color})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${C.sand}`,fontSize:11}}>
                <span style={{color:C.textSub}}>{label}</span>
                <span style={{color,fontWeight:800,fontSize:16}}>{val}</span>
              </div>
            ))}
          </Sec>
        </Card>
      </div>

      <Card>
        <Sec title="Export Reports — CSV / Excel Compatible">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {exports.map(ex=>(
              <div key={ex.label} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:6}}>
                <div style={{width:4,alignSelf:"stretch",background:ex.color,borderRadius:2,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>{ex.label}</div>
                  <div style={{fontSize:10,color:C.textSub,marginTop:2}}>{ex.desc}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <Btn sm onClick={ex.fn} color={ex.color}>⬇ CSV</Btn>
                </div>
              </div>
            ))}
          </div>
        </Sec>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ADMIN CONFIG
═══════════════════════════════════════════════════ */
function AdminConfig({fields,setFields,spaces,setSpaces,roles,setRoles,notify}){
  const [tab,setTab]=useState("fields");
  const [showField,setShowField]=useState(false);
  const [editField,setEditField]=useState(null);
  const [showSpace,setShowSpace]=useState(false);
  const [editSpace,setEditSpace]=useState(null);
  const [editRole,setEditRole]=useState(null);

  const saveField=d=>{
    if(d.id&&!d._isNew) setFields(p=>p.map(f=>f.id===d.id?d:f));
    else setFields(p=>[...p,{...d,id:uid("f_"),builtin:false}]);
    notify(d._isNew?"Field added":"Field updated");
    setShowField(false);setEditField(null);
  };
  const saveSpace=d=>{
    if(d.id&&!d._isNew) setSpaces(p=>p.map(s=>s.id===d.id?d:s));
    else setSpaces(p=>[...p,{...d,id:uid("S")}]);
    notify(d._isNew?"Space added":"Space updated");
    setShowSpace(false);setEditSpace(null);
  };

  const fieldCols=["110px","1fr","90px","80px","80px","110px"];
  const fieldHdrs=["Field ID","Label","Type","Required","Built-in","Actions"];
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["fields","spaces","roles"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{padding:"7px 16px",borderRadius:4,background:tab===t?C.darkBlue:"transparent",
              color:tab===t?C.white:C.textSub,border:`1.5px solid ${tab===t?C.darkBlue:C.border}`,
              fontFamily:"inherit",fontSize:11,fontWeight:tab===t?700:400,cursor:"pointer"}}>
            {t==="fields"?"Asset Fields":t==="spaces"?"Space Hierarchy":"Role Permissions"}
          </button>
        ))}
      </div>

      {tab==="fields"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:C.textSub}}>Configure asset fields shown in all asset forms. Built-in fields cannot be deleted.</div>
            <Btn sm onClick={()=>{setEditField(null);setShowField(true);}}>+ Add Custom Field</Btn>
          </div>
          <Card style={{padding:0,overflow:"hidden"}}>
            <TblHead cols={fieldHdrs.map((h,i)=>({h,w:fieldCols[i]}))}/>
            {fields.map(f=>(
              <div key={f.id} style={{display:"grid",gridTemplateColumns:fieldCols.join(" "),padding:"11px 16px",borderBottom:`1px solid ${C.sand}`,fontSize:11,alignItems:"center",gap:8}}>
                <div style={{fontFamily:"monospace",fontSize:9,color:C.textSub,background:C.bg,padding:"2px 6px",borderRadius:3,display:"inline-block"}}>{f.id}</div>
                <div style={{color:C.text,fontSize:12,fontWeight:500}}>{f.label}</div>
                <span style={{fontSize:9,background:C.blueBg,color:C.blue,padding:"2px 7px",borderRadius:3,fontWeight:700}}>{f.type}</span>
                <div style={{fontSize:10,color:f.required?C.green:C.textSub,fontWeight:f.required?700:400}}>{f.required?"Required":"Optional"}</div>
                <div style={{fontSize:10,color:f.builtin?C.purple:C.textSub,fontWeight:f.builtin?700:400}}>{f.builtin?"Built-in":"Custom"}</div>
                <div style={{display:"flex",gap:6}}>
                  <Btn sm onClick={()=>{setEditField({...f,_isNew:false});setShowField(true);}}>Edit</Btn>
                  {!f.builtin&&<Btn sm danger onClick={()=>{setFields(p=>p.filter(x=>x.id!==f.id));notify("Field removed");}}>✕</Btn>}
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {tab==="spaces"&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:C.textSub}}>Define location hierarchy. Each space node must have a parent (except the Account root).</div>
            <Btn sm onClick={()=>{setEditSpace(null);setShowSpace(true);}}>+ Add Space</Btn>
          </div>
          <SpaceTree spaces={spaces} onEdit={s=>{setEditSpace({...s,_isNew:false});setShowSpace(true);}}/>
        </>
      )}

      {tab==="roles"&&(
        <div style={{display:"grid",gap:12}}>
          {roles.map(r=>(
            <Card key={r.id} style={{border:`1.5px solid ${r.color}25`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:12,height:12,borderRadius:"50%",background:r.color}}/>
                  <span style={{fontSize:14,fontWeight:700,color:C.darkBlue}}>{r.label}</span>
                </div>
                <Btn sm onClick={()=>setEditRole(r)}>Edit Permissions</Btn>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.entries(r.perms).map(([k,v])=>(
                  <span key={k} style={{fontSize:10,background:v&&v!==false?C.greenBg:"#f0f0f0",color:v&&v!==false?C.green:C.textSub,border:`1px solid ${v&&v!==false?C.green+"30":C.border}`,padding:"2px 8px",borderRadius:3,fontWeight:600}}>
                    {k}: {v===true?"✓":v===false?"✗":v}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showField&&<FieldModal field={editField} onSave={saveField} onClose={()=>{setShowField(false);setEditField(null);}}/>}
      {showSpace&&<SpaceModal space={editSpace} spaces={spaces} onSave={saveSpace} onClose={()=>{setShowSpace(false);setEditSpace(null);}}/>}
      {editRole&&<RoleModal role={editRole} onSave={d=>{setRoles(p=>p.map(r=>r.id===d.id?d:r));notify("Permissions updated");setEditRole(null);}} onClose={()=>setEditRole(null)}/>}
    </div>
  );
}

function SpaceTree({spaces,onEdit}){
  const roots=spaces.filter(s=>s.level==="Account");
  function renderNode(node,depth=0){
    const children=spaces.filter(s=>s.parent===node.id);
    return(
      <div key={node.id}>
        <div onClick={()=>onEdit(node)} className="row-hover"
          style={{display:"flex",alignItems:"center",gap:8,padding:"8px 16px",paddingLeft:16+depth*20,borderBottom:`1px solid ${C.sand}`,cursor:"pointer",fontSize:11}}>
          {depth>0&&<span style={{color:C.greyLight,fontSize:10}}>└─</span>}
          <span style={{fontSize:9,background:C.blueBg,color:C.blue,padding:"2px 8px",borderRadius:3,fontWeight:700,minWidth:96,textAlign:"center"}}>{node.level}</span>
          <span style={{color:C.text,fontSize:12,fontWeight:500}}>{node.name}</span>
          <span style={{color:C.azureBlue,marginLeft:"auto",fontSize:10}}>✎ Edit</span>
        </div>
        {children.map(c=>renderNode(c,depth+1))}
      </div>
    );
  }
  return <Card style={{padding:0,overflow:"hidden"}}>{roots.map(r=>renderNode(r))}</Card>;
}

function FieldModal({field,onSave,onClose}){
  const [form,setForm]=useState(field||{type:"text",required:false,options:"",_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <Modal title={form._isNew?"Add Custom Field":"Edit Field"} onClose={onClose} width={440}>
      <div style={{display:"grid",gap:12}}>
        <FRow label="Field Label" req><Inp value={form.label||""} onChange={v=>set("label",v)} placeholder="e.g. Insurance Policy No."/></FRow>
        <FRow label="Field Type">
          <Sel value={form.type} onChange={v=>set("type",v)}>
            <option value="text">Text (free input)</option>
            <option value="decimal">Decimal / Number</option>
            <option value="date">Date</option>
            <option value="select">Dropdown (select)</option>
            <option value="yesno">Yes / No</option>
          </Sel>
        </FRow>
        {form.type==="select"&&(
          <FRow label="Options (comma-separated)">
            <Inp value={Array.isArray(form.options)?form.options.join(","):(form.options||"")} onChange={v=>set("options",v)} placeholder="Option 1, Option 2, Option 3"/>
          </FRow>
        )}
        <Tog value={form.required||false} onChange={v=>set("required",v)} label="Required field (must be filled before saving)"/>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
          <Btn onClick={()=>{
            if(!form.label)return alert("Field label is required");
            const d={...form};
            if(d.type==="select") d.options=typeof d.options==="string"?d.options.split(",").map(o=>o.trim()).filter(Boolean):d.options||[];
            else d.options=[];
            onSave(d);
          }}>Save Field</Btn>
        </div>
      </div>
    </Modal>
  );
}

function SpaceModal({space,spaces,onSave,onClose}){
  const [form,setForm]=useState(space||{level:"Space Name",_isNew:true});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const lvlIdx=SPACE_LEVELS.indexOf(form.level);
  const parentLevel=lvlIdx>0?SPACE_LEVELS[lvlIdx-1]:null;
  const parentOpts=parentLevel?spaces.filter(s=>s.level===parentLevel):[];
  return(
    <Modal title={form._isNew?"Add Space Node":"Edit Space"} onClose={onClose} width={420}>
      <div style={{display:"grid",gap:12}}>
        <FRow label="Hierarchy Level">
          <Sel value={form.level} onChange={v=>set("level",v)}>
            {SPACE_LEVELS.map(l=><option key={l}>{l}</option>)}
          </Sel>
        </FRow>
        <FRow label="Space Name" req><Inp value={form.name||""} onChange={v=>set("name",v)} placeholder="e.g. C Wing, 3rd Floor…"/></FRow>
        {parentOpts.length>0&&(
          <FRow label={`Parent ${parentLevel}`}>
            <Sel value={form.parent||""} onChange={v=>set("parent",v)}>
              <option value="">— Select Parent —</option>
              {parentOpts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </Sel>
          </FRow>
        )}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
          <Btn onClick={()=>{if(!form.name)return alert("Space name is required");onSave(form);}}>Save Space</Btn>
        </div>
      </div>
    </Modal>
  );
}

function RoleModal({role,onSave,onClose}){
  const [perms,setPerms]=useState({...role.perms});
  const set=(k,v)=>setPerms(p=>({...p,[k]:v}));
  const rows=[
    {key:"dashboard",label:"Dashboard Access",    opts:[true,false]},
    {key:"assets",   label:"Asset Access",         opts:["edit","view",false]},
    {key:"tickets",  label:"Ticket Access",         opts:["resolve","raise",false]},
    {key:"users",    label:"User Management",       opts:["edit","view",false]},
    {key:"ppm",      label:"PPM Module Access",     opts:["admin","execute",false]},
    {key:"admin",    label:"Admin Config Access",   opts:[true,false]},
  ];
  return(
    <Modal title={`Permissions · ${role.label}`} onClose={onClose} width={520}>
      <div style={{display:"grid",gap:8,marginBottom:16}}>
        {rows.map(({key,label,opts})=>(
          <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:C.bg,borderRadius:4,border:`1px solid ${C.border}`}}>
            <span style={{fontSize:12,color:C.text,fontWeight:500}}>{label}</span>
            <div style={{display:"flex",gap:6}}>
              {opts.map(o=>(
                <button key={String(o)} onClick={()=>set(key,o)}
                  style={{padding:"4px 12px",borderRadius:3,
                    border:`1.5px solid ${perms[key]===o?C.azureBlue:C.border}`,
                    background:perms[key]===o?C.blueBg:"transparent",
                    color:perms[key]===o?C.azureBlue:C.textSub,
                    fontFamily:"inherit",fontSize:11,cursor:"pointer",fontWeight:perms[key]===o?700:400}}>
                  {o===true?"✓ Yes":o===false?"✗ No":o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={onClose} outline color={C.grey}>Cancel</Btn>
        <Btn onClick={()=>onSave({...role,perms})}>Save Permissions</Btn>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════ */
export default function App(){

  // ── Compute seed assets with proper space-based IDs ──
  const INIT_ASSETS = useMemo(()=>{
    // Track seq per space prefix to avoid duplicates
    const seqMap = {};
    return INIT_ASSETS_RAW.map(raw=>{
      const initials = getSpaceInitials(raw.f_space, INIT_SPACES);
      seqMap[initials] = (seqMap[initials]||0) + 1;
      const id = initials + "-" + String(seqMap[initials]).padStart(5,"0");
      const {_seq, ...rest} = raw;
      return {...rest, id};
    });
  },[]);

  // ── Resolve schedule assetIds using computed seed asset IDs ──
  const INIT_SCHEDULES = useMemo(()=>
    INIT_SCHEDULES_RAW.map(s=>({
      ...s,
      assetId: INIT_ASSETS[s._assetIdx]?.id || "",
      _assetIdx: undefined,
    }))
  ,[INIT_ASSETS]);

  // ── Seed PPM tickets (using real asset IDs) ──
  const seedPPM = useMemo(()=>{
    const now = new Date("2026-05-01");
    return INIT_SCHEDULES.flatMap(sch=>{
      const asset = INIT_ASSETS.find(a=>a.id===sch.assetId);
      const proc  = INIT_PROCEDURES.find(p=>p.id===sch.procedureId);
      if(!asset||!proc) return [];
      return genPPMTickets(sch, asset, proc, now);
    });
  },[INIT_ASSETS, INIT_SCHEDULES]);

  // ── Seed regular tickets (using real asset IDs) ──
  const INIT_REGULAR_TICKETS = useMemo(()=>[
    {id:"T001",title:"Server high CPU alert",        assetId:INIT_ASSETS[0]?.id||"",priority:"Critical",status:"Open",       type:"Incident",   isPPM:false,assignTo:{kind:"group",id:"G1"},raisedBy:"U3",created:"2026-04-20",dueDate:null,desc:"CPU>95% for 30 min. Possible runaway process.",       comments:[],spaceId:"S10"},
    {id:"T002",title:"Printer paper jam recurring",  assetId:INIT_ASSETS[3]?.id||"",priority:"Medium", status:"In Progress", type:"Maintenance",isPPM:false,assignTo:{kind:"user",id:"U6"}, raisedBy:"U4",created:"2026-04-18",dueDate:null,desc:"Jam every 20-30 prints. Roller may need replacement.", comments:[],spaceId:"S13"},
    {id:"T003",title:"MacBook battery drain",        assetId:INIT_ASSETS[4]?.id||"",priority:"Low",    status:"Open",        type:"Request",    isPPM:false,assignTo:{kind:"group",id:"G1"},raisedBy:"U3",created:"2026-04-21",dueDate:null,desc:"Battery drains in under 3 hours.",                    comments:[],spaceId:"S15"},
  ],[INIT_ASSETS]);

  const [assets,    setAssets]    = useState(()=>INIT_ASSETS);
  const [tickets,   setTickets]   = useState(()=>[...INIT_REGULAR_TICKETS, ...seedPPM]);
  const [schedules, setSchedules] = useState(()=>INIT_SCHEDULES);
  const [procedures,setProcedures]= useState(INIT_PROCEDURES);
  const [users,     setUsers]     = useState(INIT_USERS);
  const [groups,    setGroups]    = useState(INIT_GROUPS);
  const [spaces,    setSpaces]    = useState(INIT_SPACES);
  const [fields,    setFields]    = useState(INIT_FIELDS);
  const [roles,     setRoles]     = useState(INIT_ROLES);
  const [currentUser,setCurrentUser] = useState(INIT_USERS[0]);
  const [view,      setView]      = useState("dashboard");
  const [notification,setNotification] = useState(null);

  // Keep roles_ref in sync for GroupModal display
  roles_ref = roles;

  const notify=(msg,type="success")=>{
    setNotification({msg,type});
    setTimeout(()=>setNotification(null),3500);
  };

  const roleDef = roles.find(r=>r.id===currentUser.role);

  const openTickets = tickets.filter(t=>
    canSeeTicket(t,currentUser,spaces,groups) &&
    ["Open","In Progress","Pending"].includes(t.status)
  ).length;

  const ppmDue = tickets.filter(t=>{
    if(!t.isPPM||["Completed","Closed"].includes(t.status)) return false;
    const myGids = groups.filter(g=>g.members.includes(currentUser.id)).map(g=>g.id);
    if(t.assignTo?.kind==="user"  && t.assignTo.id===currentUser.id)      return true;
    if(t.assignTo?.kind==="group" && myGids.includes(t.assignTo.id))      return true;
    if(["admin","resolver"].includes(currentUser.role))                    return true;
    return false;
  }).length;

  // Redirect on user switch
  useEffect(()=>{
    if(currentUser.role==="technician" && !["ppm_exec","dashboard"].includes(view))
      setView("ppm_exec");
    if(!["technician","resolver","admin"].includes(currentUser.role) && view==="ppm_exec")
      setView("dashboard");
  },[currentUser.id]);

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,
      fontFamily:"'IBM Plex Sans','Segoe UI',Arial,sans-serif",
      display:"flex",flexDirection:"column"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${C.bg}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        .row-hover:hover{background:${C.sand2}!important;transition:background .1s}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        input[type=number]{-moz-appearance:textfield}
        input:focus,select:focus,textarea:focus{
          outline:none;
          border-color:${C.azureBlue}!important;
          box-shadow:0 0 0 3px ${C.azureBlue}18
        }
        button:focus{outline:none}
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{height:52,background:C.darkBlue,display:"flex",alignItems:"center",
        padding:"0 20px",gap:16,flexShrink:0,
        boxShadow:"0 2px 10px rgba(0,48,85,.35)",zIndex:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:C.white,borderRadius:5,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:12,fontWeight:800,color:C.darkBlue,letterSpacing:"-1px"}}>ISS</span>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:C.white,letterSpacing:"-0.02em"}}>AssetCore EAM</div>
            <div style={{fontSize:8,color:"rgba(255,255,255,.38)",letterSpacing:"0.12em",textTransform:"uppercase"}}>
              Enterprise Asset Management
            </div>
          </div>
        </div>
        <div style={{flex:1,display:"flex",gap:10,alignItems:"center",marginLeft:20}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>Session:</span>
          <select value={currentUser.id}
            onChange={e=>{
              const u=users.find(u=>u.id===e.target.value);
              if(u){setCurrentUser(u);setView("dashboard");}
            }}
            style={{width:240,padding:"4px 8px",fontSize:11,
              background:"rgba(255,255,255,.12)",color:C.white,
              border:"1px solid rgba(255,255,255,.2)",borderRadius:4,
              fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
            {users.filter(u=>u.active).map(u=>(
              <option key={u.id} value={u.id}>
                {u.name} — {roles.find(r=>r.id===u.role)?.label||u.role}
              </option>
            ))}
          </select>
          {roleDef&&(
            <span style={{fontSize:9,background:`${roleDef.color}30`,color:roleDef.color,
              padding:"3px 9px",borderRadius:3,fontWeight:700,
              border:`1px solid ${roleDef.color}50`}}>
              {roleDef.label}
            </span>
          )}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",
            boxShadow:"0 0 6px #4ade80",animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>LIVE</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        <Sidebar view={view} setView={setView} currentUser={currentUser}
          roles={roles} openTickets={openTickets} ppmDue={ppmDue}/>

        <div style={{flex:1,overflow:"auto",padding:24}}>
          {/* Breadcrumb */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18,fontSize:11,color:C.textSub}}>
            <span style={{color:C.darkBlue,fontWeight:700}}>ISS AssetCore</span>
            <span style={{color:C.greyLight}}>›</span>
            <span style={{fontWeight:700,color:C.persBlue}}>
              {({
                dashboard:"Dashboard",assets:"Assets",tickets:"Tickets",
                ppm:"PPM Schedules",ppm_exec:"My PPM Tasks",
                users:"Users & Groups",reports:"Reports & Export",
                admin:"Admin Config"
              })[view]||view}
            </span>
          </div>

          {view==="dashboard" && (
            <Dashboard assets={assets} tickets={tickets} spaces={spaces}
              users={users} groups={groups} currentUser={currentUser} setView={setView}/>
          )}
          {view==="assets" && (
            <Assets assets={assets} setAssets={setAssets} fields={fields}
              spaces={spaces} users={users} groups={groups} currentUser={currentUser}
              roles={roles} tickets={tickets} notify={notify}/>
          )}
          {view==="tickets" && (
            <Tickets tickets={tickets} setTickets={setTickets} assets={assets}
              spaces={spaces} users={users} groups={groups} currentUser={currentUser}
              roles={roles} notify={notify}/>
          )}
          {view==="ppm" && (
            <PPMSchedules schedules={schedules} setSchedules={setSchedules}
              procedures={procedures} setProcedures={setProcedures}
              assets={assets} users={users} groups={groups}
              tickets={tickets} setTickets={setTickets} notify={notify}/>
          )}
          {view==="ppm_exec" && (
            <PPMExec tickets={tickets} setTickets={setTickets} assets={assets}
              procedures={procedures} users={users} groups={groups}
              currentUser={currentUser} notify={notify} spaces={spaces}/>
          )}
          {view==="users" && (
            <Users users={users} setUsers={setUsers} groups={groups} setGroups={setGroups}
              roles={roles} spaces={spaces} currentUser={currentUser} notify={notify}/>
          )}
          {view==="reports" && (
            <Reports assets={assets} tickets={tickets} users={users} groups={groups}
              spaces={spaces} schedules={schedules} procedures={procedures}/>
          )}
          {view==="admin" && (
            <AdminConfig fields={fields} setFields={setFields} spaces={spaces}
              setSpaces={setSpaces} roles={roles} setRoles={setRoles} notify={notify}/>
          )}
        </div>
      </div>

      {/* ── TOAST NOTIFICATION ── */}
      {notification&&(
        <div style={{position:"fixed",bottom:24,right:24,
          background:notification.type==="success"?C.green:C.red,
          color:"#fff",padding:"12px 20px",borderRadius:6,fontSize:12,fontWeight:700,
          zIndex:9999,animation:"fadeIn .2s ease",maxWidth:380,
          boxShadow:"0 4px 20px rgba(0,0,0,.2)",display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:16}}>{notification.type==="success"?"✓":"✗"}</span>
          <span>{notification.msg}</span>
        </div>
      )}
    </div>
  );
}
