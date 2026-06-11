import fetch from "node-fetch";

async function run() {
  const sId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr5HM"; // Wait, the spreadsheet ID is 1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  
  const res = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=1734668151`);
  const text = await res.text();
  const lines = text.split("\n");
  console.log(`Total lines: ${lines.length}`);
  
  let printedCount = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith(",,,,")) {
      console.log(`Line ${i}: ${line}`);
      printedCount++;
      if (printedCount > 30) break;
    }
  }
}

run();
