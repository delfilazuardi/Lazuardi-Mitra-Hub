import fetch from "node-fetch";

async function run() {
  const sId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${sId}/edit?usp=sharing`;
  
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    console.log("HTML length:", html.length);
    
    // Search for patterns like:
    // {"sheetId":1734668151,"title":"Laporan Monitoring"...}
    // "id":1734668151,"title"
    // [,1734668151,"Laporan Monitoring",,,]
    
    // Let's search for sheet list variables
    const bootstrapMatch = html.match(/class="docs-sheet-tab-name"[^>]*>([^<]+)</g);
    if (bootstrapMatch) {
      console.log("docs-sheet-tab-name elements:", bootstrapMatch);
    }
    
    // Find all 9/10 digit numbers
    const numSet = new Set<string>();
    const rx = /\b\d{9,10}\b/g;
    let m;
    while ((m = rx.exec(html)) !== null) {
      numSet.add(m[0]);
    }
    console.log("All 9/10 digit numbers found in HTML:", Array.from(numSet));

    // Also let's extract block around bootstrapData
    const bDataIndex = html.indexOf("bootstrapData");
    if (bDataIndex !== -1) {
      console.log("bootstrapData found! Outputting next 400 chars:");
      console.log(html.slice(bDataIndex, bDataIndex + 1400));
    }

  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

run();
