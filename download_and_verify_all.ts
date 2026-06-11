import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  
  const gids = {
    "Reports_664877120": "664877120",
    "Reports_1734668151": "1734668151",
    "Invoices_Renewal_2053519638": "2053519638",
    "Invoices_Jenjang_487609980": "487609980",
    "Requests_1245867784": "1245867784",
    "Users_233499211": "233499211",
    "Schools_490538665": "490538665",
    "KPIs_1884113046": "1884113046",
    "Logs_588392580": "588392580"
  };

  for (const [name, gid] of Object.entries(gids)) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(csvUrl);
    if (res.ok) {
      const text = await res.text();
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      console.log(`\n=== Sheet [${name}] GID: ${gid} ===`);
      console.log(`Total lines: ${lines.length}`);
      console.log("Sample rows:");
      console.log(lines.slice(0, 8).join("\n"));
    } else {
      console.log(`\nFailed to fetch GID ${gid}`);
    }
  }
}

run();
