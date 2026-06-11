import fetch from "node-fetch";
import * as XLSX from "xlsx";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    console.log("SHEET NAMES IN WORKBOOK:", workbook.SheetNames);
    
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      console.log(`\n- Sheet: "${name}"`);
      console.log(`  Rows count: ${rows.length}`);
      if (rows.length > 0) {
        console.log(`  Headers   : ${Object.keys(rows[0]).join(", ")}`);
        console.log(`  Row 1     : ${JSON.stringify(rows[0])}`);
      }
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

run();
