import fs from "node:fs";
import { interclubResultsHtml } from "../base44/functions/interclubResultsEmail/resultsEmailTemplate.ts";
const html=interclubResultsHtml({
 event:{club_a_name:"Clare Pickleball",club_b_name:"Galway Pickleball"},
 name:"Brian Moore",
 url:"https://rallyhub.ie/interclub-results/qa-player",
 alertsUrl:"https://rallyhub.ie/directory?join=1&utm_source=interclub_results",
 origin:"https://rallyhub.ie",
 content:{headerTitle:"Clare v Galway\nINTERCLUB",headerSubtitle:"Your Personal Results"}
});
fs.writeFileSync("public/email-qa/interclub-gmail-test.html",html);
console.log("Rendered Gmail test HTML",html.length);
