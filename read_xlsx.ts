import fetch from "node-fetch";
import * as XLSX from "xlsx";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
  
  try {
    console.log("Downloading spreadsheet as XLSX...");
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download spreadsheet: ${res.statusText}`);
    }
    const buffer = await res.arrayBuffer();
    console.log("Downloaded size:", buffer.byteLength, "bytes");

    const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    console.log("\nWorksheets found:", workbook.SheetNames);

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n================================`);
      console.log(`SHEET NAME: ${sheetName}`);
      console.log(`================================`);
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      console.log(`Total rows in ${sheetName}: ${rows.length}`);
      if (rows.length > 0) {
        console.log("Header columns discovered:");
        console.log(Object.keys(rows[0]));
        console.log("Sample Rows (First 5):");
        console.log(JSON.stringify(rows.slice(0, 5), null, 2));
      } else {
        console.log("Empty sheet.");
      }
    }
  } catch (err: any) {
    console.error("XLSX parsing failed:", err.message);
  }
}

run();
