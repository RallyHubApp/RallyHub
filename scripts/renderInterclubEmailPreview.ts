import { interclubResultsHtml } from "../base44/functions/interclubResultsEmail/resultsEmailTemplate.ts";
const html=interclubResultsHtml({
  event:{club_a_name:"Clare",club_b_name:"Galway"},
  name:"Brian Moore",
  url:"https://rallyhub.ie/interclub-results/preview-player-results",
  alertsUrl:"https://rallyhub.ie/directory?join=1&utm_source=interclub_results",
  origin:"https://rallyhub.ie"
});
process.stdout.write(Buffer.from(html,"utf8").toString("base64"));