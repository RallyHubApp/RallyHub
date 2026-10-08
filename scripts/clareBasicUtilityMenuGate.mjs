import fs from 'node:fs';
const src=fs.readFileSync('base44/functions/kotcResultsShare/entry.ts','utf8');
const must=(ok,msg)=>{if(!ok){console.error('FAIL clareBasicUtilityMenuGate:',msg);process.exit(1)}};
must(src.includes("['View My Results',playerLink,true]"),'View My Results link missing');
for(const label of ['Facebook','Instagram','ClarePickleball.ie','RallyHub Directory','Events','Feedback']) must(src.includes(`['${label}'`)||src.includes(`,[ '${label}'`),`${label} missing`);
must(src.includes('const utility=basicUtilityBlock(brandKit,root,playerLink,isClare);'),'basic KOTC must insert Clare utility row');
must(src.includes('font-size:10px;line-height:18px'),'utility row must stay visually lightweight');
console.log('PASS clareBasicUtilityMenuGate: slim Clare utility row is present below the basic signature');
