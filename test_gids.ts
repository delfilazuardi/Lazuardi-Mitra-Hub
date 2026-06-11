import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  
  // Test both potential interpretations:
  // Option A (first number is GID): 514397480, etc.
  // Option B (second number in string is GID): 2053519638, etc.
  
  const testGids = [
    "514397480", "2053519638", "233499211", "1245867784", "487609980", 
    "664877120", "490538665", "1884113046", "588392580", "1418267258", "1686070163"
  ];
  
  for (const gid of testGids) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    const res = await fetch(csvUrl);
    console.log(`GID: ${gid} -> HTTP Status: ${res.status}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`  Lines count: ${text.split("\n").length}`);
      console.log(`  Header row: ${text.split("\n")[0]}`);
      console.log(`  First row : ${text.split("\n")[1]}`);
    }
  }
}

run();
