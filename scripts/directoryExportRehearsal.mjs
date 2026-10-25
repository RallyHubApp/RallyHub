import {readFileSync} from 'node:fs';
import {directoryRestoreDryRun} from '../base44/shared/directoryPortableExport.mjs';
const file=process.argv[2];
if(!file){console.error('Usage: node scripts/directoryExportRehearsal.mjs <approved-export.json> (read-only)');process.exitCode=2;}
else {try{const data=JSON.parse(readFileSync(file,'utf8'));const archive=data.archive||data;const report=directoryRestoreDryRun(archive);console.log(JSON.stringify(report,null,2));if(!report.valid)process.exitCode=1;}catch(error){console.error(error.message);process.exitCode=1;}}
