import fetch from "node-fetch";

async function run() {
  const spreadsheetId = "1v0Z9ovWaR6e3B5VrxtIhJ-U9Sgy0ciybYmKxxcBr0HM";
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`;
  
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    const kw = "Nomor Invoice";
    const index = html.indexOf(kw);
    if (index !== -1) {
      console.log("=== Found around 'Nomor Invoice' ===");
      console.log(html.slice(index - 600, index + 800));
    }
  } catch (err: any) {
    console.error(err);
  }
}

run();
