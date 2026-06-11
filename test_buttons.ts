import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
  
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    console.log("Searching for sheet buttons...");
    const matches = html.match(/id="sheet-button-\d+"/g) || [];
    console.log("Matched id=sheet-button-:", matches);

    const matches2 = html.match(/sheet-button-\d+/g) || [];
    console.log("Matched sheet-button-:", [...new Set(matches2)]);

    // Let's also check for any occurrence of 'sheetId' or '"id"' in JSON.
    // Let's look for "title:" in JSON to see if there are list items
    const matches3 = html.match(/sheetId:\s*\d+/gi) || [];
    console.log("Matched sheetId:", [...new Set(matches3)]);

    const matches4 = html.match(/&quot;sheetId&quot;:\s*\d+/gi) || [];
    console.log("Matched quot;sheetIdquot;:", [...new Set(matches4)]);

    // Let's print out standard script tag sources or chunks that look like sheet tab array
    // E.g. [,, "Sheet Name", 0]
    // Let's search if "Invoice" is found, and see its exact line
    const lines = html.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("Invoice")) {
        console.log(`\nLine ${i} contains 'Invoice' (first 300 chars):`);
        console.log(lines[i].slice(0, 300));
      }
    }
  } catch (err: any) {
    console.error(err);
  }
}

run();
