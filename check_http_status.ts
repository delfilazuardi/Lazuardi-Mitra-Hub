import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const gids = ["0", "1734668151", "664877120", "2053519638", "487609980", "1245867784", "233499211", "490538665"];

  for (const gid of gids) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(csvUrl);
    console.log(`GID: ${gid} -> Status: ${res.status}, Type: ${res.headers.get("content-type")}`);
    if (!res.ok) {
      const text = await res.text();
      console.log(`  Preview: ${text.slice(0, 200)}`);
    } else {
      const text = await res.text();
      console.log(`  Lines count: ${text.split("\n").length}, Size: ${text.length}`);
    }
  }
}

run();
