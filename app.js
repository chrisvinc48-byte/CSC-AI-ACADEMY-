 let lastEbookText = "";
let recordedBlob = null;

async function generate(){
  const apiKey = document.getElementById('apiKey').value.trim();
  const idea = document.getElementById('idea').value.trim();
  const type = document.getElementById('type').value;
  const myUrl = document.getElementById('myUrl').value.trim();
  const out = document.getElementById('output');

  if(!apiKey){ alert("Paste Groq API Key (gsk_...)"); return; }
  if(!idea){ alert("Enter business idea"); return; }

  out.innerText = "⏳ Generating...";
  let prompt = "";
  if(type==="ebook") prompt=`Write a detailed practical ebook about: ${idea}. 5 chapters, for Nigerians.`;
  if(type==="cover") prompt=`Create cover design prompt for: ${idea}. Colors black and cyan #00e5ff`;
  if(type==="selar") prompt=`Write high-converting Selar sales page for ebook about: ${idea}. Headline, benefits, FAQ.`;
  if(type==="video") prompt=`Write 60-sec viral TikTok script to sell ebook about: ${idea}. Hook, 3 benefits, CTA.`;

  try{
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
      body: JSON.stringify({model:"llama-3.3-70b-versatile", messages:[{role:"user", content:prompt}], temperature:0.7})
    });
    const data = await res.json();
    if(data.error){ out.innerText="❌ "+data.error.message; return; }
    let result = data.choices[0].message.content;
    if(myUrl) result+=`\n\n🔗 GET IT HERE:\n${myUrl}`;
    out.innerText = result;
    lastEbookText = result;
  }catch(e){ out.innerText="❌ "+e.message; }
}

async function generateVideoAd(){
  if(!lastEbookText){ alert("Generate ebook/sales page first!"); return; }
  const idea = document.getElementById('idea').value || "My Ebook";
  const video = document.getElementById('adVideo');
  const downloadBtn = document.getElementById('downloadBtn');

  // Create canvas video
  const canvas = document.createElement('canvas');
  canvas.width = 720; canvas.height = 1280; // TikTok size
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {mimeType:'video/webm'});
  let chunks = [];
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = ()=>{
    recordedBlob = new Blob(chunks, {type:'video/webm'});
    video.src = URL.createObjectURL(recordedBlob);
    video.style.display = 'block';
    downloadBtn.style.display = 'block';
  };

  recorder.start();
  let i=0;
  const slides = [
    `🔥 ${idea.toUpperCase()} 🔥`,
    "New Ebook Alert!",
    lastEbookText.substring(0,120)+"...",
    "Learn Everything Step by Step",
    "Ready for Nigerians",
    "GET YOUR COPY NOW!",
    document.getElementById('myUrl').value || "Link in Bio"
  ];

  const interval = setInterval(()=>{
    // Background black cyan gradient
    const grad = ctx.createLinearGradient(0,0,0,1280);
    grad.addColorStop(0,"#000000");
    grad.addColorStop(1,"#00343a");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,720,1280);

    // Glow circle
    ctx.beginPath();
    ctx.arc(360, 400, 180, 0, Math.PI*2);
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 4;
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 30;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Text
    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 42px Inter";
    ctx.textAlign = "center";
    ctx.fillText("CSC AI ACADEMY", 360, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px Inter";
    const words = slides[i%slides.length];
    wrapText(ctx, words, 360, 650, 600, 50);

    i++;
    if(i>21){ clearInterval(interval); recorder.stop(); }
  }, 700);

  document.getElementById('output').innerText = "🎬 Creating your video advert... 15 seconds...";
}

function wrapText(context, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  let posY = y;
  for(let n=0;n<words.length;n++){
    let testLine = line + words[n] + ' ';
    let metrics = context.measureText(testLine);
    if(metrics.width > maxWidth && n>0){
      context.fillText(line, x, posY);
      line = words[n] + ' ';
      posY += lineHeight;
    }else{ line = testLine; }
  }
  context.fillText(line, x, posY);
}

function downloadVideo(){
  if(!recordedBlob) return;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(recordedBlob);
  a.download = "CSC_Ebook_Ad.webm";
  a.click();
}

function shareResult(){
  const text = document.getElementById('output').innerText;
  if(!text || text.includes("Your result")){ alert("Generate first!"); return; }
  window.open("https://wa.me/?text="+encodeURIComponent(text), "_blank");
}