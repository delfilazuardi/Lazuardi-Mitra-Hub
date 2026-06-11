import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
  
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    console.log("HTML length:", html.length);
    
    // In Google Sheets, there is a JS array with sheet names and GIDs
    // Let's search for sheet list structures or JSON items in script tags
    // e.g. [,1734668151,"Laporan Monitoring",,,] or similar
    const rxSheet = /\[\s*(null|\d+)\s*,\s*(\d{7,11})\s*,\s*"([^"]+)"/g;
    let m;
    const sheetsMap = new Map<string, string>();
    while ((m = rxSheet.exec(html)) !== null) {
      sheetsMap.set(m[2], m[3]);
    }
    
    // Second pattern: {"id":..., "title":...} or similar
    const rxJSON = /"sheetId"\s*:\s*(\d+)\s*,\s*"title"\s*:\s*"([^"]+)"/g;
    while ((m = rxJSON.exec(html)) !== null) {
      sheetsMap.set(m[1], m[2]);
    }

    const rxJSONReverse = /"title"\s*:\s*"([^"]+)"\s*,\s*"sheetId"\s*:\s*(\d+)/g;
    while ((m = rxJSONReverse.exec(html)) !== null) {
      sheetsMap.set(m[2], m[1]);
    }

    // Google Sheets often represents sheet objects as: [gid, "Title", [cols], colors, etc.]
    // Let's search inside the HTML for some known terms to find sheet titles
    const terms = ["Laporan", "Monitoring", "User", "Invoice", "Iuran", "Pengajuan", "Request"];
    for (const term of terms) {
      const rxTerm = new RegExp(`\\[\\s*(\\d{7,11})\\s*,\\s*"(${term}[^"]*)"`, "gi");
      while ((m = rxTerm.exec(html)) !== null) {
        sheetsMap.set(m[1], m[2]);
      }
    }

    // Let's also check for explicit gids mentioned in URL or data
    const gidsInPage = Array.from(html.matchAll(/gid=(\d+)/g)).map(m => m[1]);
    gidsInPage.forEach(gid => {
      if (!sheetsMap.has(gid)) {
        sheetsMap.set(gid, "Unknown Sheet GID " + gid);
      }
    });

    // Also the default sheet is always 0
    sheetsMap.set("0", "Sheet Utama (Default / Users)");

    console.log("Discovered Sheets:");
    for (const [gid, title] of sheetsMap.entries()) {
      console.log(`- GID: ${gid} -> Title: ${title}`);
    }

    console.log("\n=== LOADING HEADERS FOR ALL DISCOVERED GIDs ===");
    const promises = Array.from(sheetsMap.keys()).map(async (gid) => {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
      try {
        const csvRes = await fetch(csvUrl);
        if (!csvRes.ok) return { gid, ok: false };
        const text = await csvRes.text();
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        const header = lines[0] || "";
        const rowOne = lines[1] || "";
        const rowsCount = lines.length;
        return { gid, ok: true, name: sheetsMap.get(gid), header, rowOne, rowsCount };
      } catch (e: any) {
        return { gid, ok: false, error: e.message };
      }
    });

    const results = await Promise.all(promises);
    results.forEach((res) => {
      if (res.ok) {
        console.log(`\nSheet [${res.name}] (GID: ${res.gid}):`);
        console.log(`  - Row count: ${res.rowsCount}`);
        console.log(`  - Header: ${res.header}`);
        console.log(`  - Sample Row 1: ${res.rowOne}`);
      } else {
        console.log(`Sheet GID ${res.gid} is not extractable as CSV.`);
      }
    });

  } catch (err: any) {
    console.error("Main execution error:", err.message);
  }
}

run();
