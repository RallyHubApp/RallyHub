import fs from "node:fs";
import { interclubResultsHtml } from "../base44/functions/interclubResultsEmail/resultsEmailTemplate.ts";
fs.mkdirSync("public/email-qa",{recursive:true});
const html=interclubResultsHtml({
 event:{club_a_name:"Clare Pickleball",club_b_name:"Galway Pickleball"},
 name:"Mark Test",
 url:"https://rallyhub.ie/interclub-results/qa-player",
 alertsUrl:"https://rallyhub.ie/directory?join=1&utm_source=interclub_results",
 origin:"http://127.0.0.1:4173",
 content:{headerTitle:"Clare v Galway\nINTERCLUB",headerSubtitle:"Your Personal Results"}
});
fs.writeFileSync("public/email-qa/interclub.html",html);
console.log("Rendered public/email-qa/interclub.html");