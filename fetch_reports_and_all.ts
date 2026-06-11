import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  
  console.log("=== DUMPING GID = 0 (Users / Sheet Utama) ===");
  const res0 = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`);
  const text0 = await res0.text();
  console.log(text0);

  console.log("\n=== DUMPING GID = 1734668151 (Laporan / Report Monitoring) ===");
  const res1 = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=1734668151`);
  const text1 = await res1.text();
  console.log(text1);

  // Let's also look for other worksheets by guessing or checking if we can query them
  // What other sheets/tabs are there?
  // Let's fetch the html and use a regex to look at the list of sheets in "tt_sheet_list" or similar
  const editRes = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`);
  const html = await editRes.text();
  
  // Look for occurrences of "gid=" or similar inside Javascript strings or JSON
  console.log("\n=== DISCOVERING GIDs AND TITLES ===");
  const matches = [...html.matchAll(/"sheetId"\s*:\s*(\d+)/gi)];
  console.log("Found raw sheetId matches in text:", matches.map(m => m[1]));
}

run();
