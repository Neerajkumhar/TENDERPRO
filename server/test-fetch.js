const fetch = require('node-fetch'); // If not available, we will use native fetch
async function run() {
  const res = await fetch('http://localhost:5000/api/tenders/25353fb6-dd9d-4abb-9d0e-c002dcad15d9');
  const data = await res.json();
  if (typeof data.completionDocuments === 'string') {
    try { 
      let parsed = JSON.parse(data.completionDocuments); 
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      data.completionDocuments = parsed; 
    } catch(e) { 
      data.completionDocuments = {}; 
    }
  }
  console.log("Parsed keys:", Object.keys(data.completionDocuments));
  console.log("deliveryChallan:", data.completionDocuments.deliveryChallan);
}
run();
