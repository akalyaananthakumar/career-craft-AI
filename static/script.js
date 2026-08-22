
const form=document.getElementById("chatForm");
const input=document.getElementById("message");
const chat=document.getElementById("chat");
const send=document.getElementById("send");
const newChat=document.getElementById("newChat");

function addMessage(text, role, typing=false){
  const row=document.createElement("div");
  row.className=`message ${role}`;
  row.innerHTML=`<div class="avatar">${role==="user"?"You":"AI"}</div><div class="bubble ${typing?"typing":""}"></div>`;
  row.querySelector(".bubble").textContent=text;
  chat.appendChild(row); chat.scrollTop=chat.scrollHeight;
  return row;
}
function resetWelcome(){
  const w=document.querySelector(".welcome");
  if(w) w.remove();
}
document.querySelectorAll(".suggestion").forEach(btn=>{
  btn.addEventListener("click",()=>{input.value=btn.dataset.text; input.focus();});
});
newChat.addEventListener("click",()=>{
  chat.innerHTML="";
  const w=document.createElement("div");
  w.className="welcome";
  w.innerHTML=`<h1>Start a new conversation</h1><p>Ask anything related to this chatbot's domain.</p>`;
  chat.appendChild(w);
});
input.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}
});
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const text=input.value.trim(); if(!text||send.disabled)return;
  resetWelcome(); addMessage(text,"user"); input.value=""; send.disabled=true;
  const typing=addMessage("Thinking...","assistant",true);
  try{
    const res=await fetch("/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text})});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||"Request failed");
    typing.remove(); addMessage(data.reply||"I couldn't generate a response.","assistant");
  }catch(err){
    typing.remove(); addMessage("Sorry, something went wrong. Please check your API key and try again.","assistant");
  }finally{send.disabled=false;input.focus();}
});
