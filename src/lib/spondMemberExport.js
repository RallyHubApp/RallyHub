import ExcelJS from 'exceljs';

// Matches the 24-column Spond Club membertemplate.xlsx supplied 21 Oct 2026.
export const SPOND_HEADERS = ['Member type*','Group','Sub group','Role 1','Role 2','Member first name*','Member last name*','Member email','Member phone number','Guardian 1 first name','Guardian 1 last name','Guardian 1 email','Guardian 1 phone number','Guardian 2 first name','Guardian 2 last name','Guardian 2 email','Guardian 2 phone number','Sign up date','Date of birth','Gender','Address','City','State','School'];
const COUNTRY_CODES = 'ABW,AFG,AGO,AIA,ALA,ALB,AND,ARE,ARG,ARM,ASM,ATA,ATF,ATG,AUS,AUT,AZE,BDI,BEL,BEN,BES,BFA,BGD,BGR,BHR,BHS,BIH,BLM,BLR,BLZ,BMU,BOL,BRA,BRB,BRN,BTN,BVT,BWA,CAF,CAN,CCK,CHE,CHL,CHN,CIV,CMR,COD,COG,COK,COL,COM,CPV,CRI,CUB,CUW,CXR,CYM,CYP,CZE,DEU,DJI,DMA,DNK,DOM,DZA,ECU,EGY,ERI,ESH,ESP,EST,ETH,FIN,FJI,FLK,FRA,FRO,FSM,GAB,GBR,GEO,GGY,GHA,GIB,GIN,GLP,GMB,GNB,GNQ,GRC,GRD,GRL,GTM,GUF,GUM,GUY,HKG,HMD,HND,HRV,HTI,HUN,IDN,IMN,IND,IOT,IRL,IRN,IRQ,ISL,ISR,ITA,JAM,JEY,JOR,JPN,KAZ,KEN,KGZ,KHM,KIR,KNA,KOR,KWT,LAO,LBN,LBR,LBY,LCA,LIE,LKA,LSO,LTU,LUX,LVA,MAC,MAF,MAR,MCO,MDA,MDG,MDV,MEX,MHL,MKD,MLI,MLT,MMR,MNE,MNG,MNP,MOZ,MRT,MSR,MTQ,MUS,MWI,MYS,MYT,NAM,NCL,NER,NFK,NGA,NIC,NIU,NLD,NOR,NPL,NRU,NZL,OMN,PAK,PAN,PCN,PER,PHL,PLW,PNG,POL,PRI,PRK,PRT,PRY,PSE,PYF,QAT,REU,ROU,RUS,RWA,SAU,SDN,SEN,SGP,SGS,SHN,SJM,SLB,SLE,SLV,SMR,SOM,SPM,SRB,SSD,STP,SUR,SVK,SVN,SWE,SWZ,SXM,SYC,SYR,TCA,TCD,TGO,THA,TJK,TKL,TKM,TLS,TON,TTO,TUN,TUR,TUV,TWN,TZA,UGA,UKR,UMI,URY,USA,UZB,VAT,VCT,VEN,VGB,VIR,VNM,VUT,WLF,WSM,YEM,ZAF,ZMB,ZWE'.split(',');
const GROUPS = ['Clare Pickleball Members','Clare Pickleball Waiting List'];
const SUBGROUPS = ['Ennistymon Weds 7pm - 8pm','Ennistymon Weds 8pm - 9pm','Mon Improver and Advanced','Mon Social and Recreational','Thurs Social and Improver','Thurs Social and Recreational','Wednesday daytime Corofin'];
const ROLES = ['Member','Team manager','Coach','Helper','Assistant coach'];
const GENDERS = ['Male','Female','Non-binary'];
const parseDate = v => {const s=String(v||'').slice(0,10);return /^\d{4}-\d\d-\d\d$/.test(s) ? new Date(`${s}T12:00:00Z`) : null;};
export function paidSpondMissing(rows) {
  return (rows || []).filter(m => m.payment_status === 'paid' && m.membership_status === 'paid_active' && m.source_system === 'rallyhub_membership_application' && m.person_id);
}
export async function createSpondMemberWorkbook(members) {
  if (!members?.length) throw new Error('Select at least one paid member to export.');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'RallyHub · Clare Pickleball';
  workbook.subject = 'Spond Club member import';
  const sheet = workbook.addWorksheet('Members');
  const rules = workbook.addWorksheet('Validation rules');
  sheet.addRow(SPOND_HEADERS);
  sheet.getRow(1).font = { bold:true, color:{argb:'FF10294C'} };
  sheet.views = [{state:'frozen',ySplit:1}];
  sheet.columns = SPOND_HEADERS.map((name,i)=>({key:String(i+1),width: i===5||i===6?22:i===7?30:i===20?38:19}));
  const [types, groups, subs, roles, genders, countries] = [['Member','Inactive','Not member','Prospect – Waiting List'],GROUPS,SUBGROUPS,ROLES,GENDERS,COUNTRY_CODES];
  for(let i=0;i<COUNTRY_CODES.length;i++) rules.addRow([types[i]||null,groups[i]||null,subs[i]||null,roles[i]||null,genders[i]||null,countries[i]]);
  for(const member of members) {
    const fullName=String(member.full_name||'').trim().replace(/\s+/g,' ');
    const parts=fullName.split(' ');
    const last=parts.length>1?parts.pop():'';
    const first=parts.join(' ')||fullName;
    // Template has no multiple-group cell. Default to primary member group; subgroup assignment after Spond import.
    const row=sheet.addRow(['Member','Clare Pickleball Members',null,'Member',null,first,last,member.email||null,member.mobile||null,null,null,null,null,null,null,null,null,parseDate(member.join_date||member.created_date),parseDate(member.date_of_birth),GENDERS.find(x=>x.toLowerCase()===String(member.gender||'').toLowerCase())||null,member.address||null,member.city||null,member.county||null,null]);
    row.getCell(9).numFmt='@';
    row.getCell(18).numFmt='dd/mm/yyyy';
    row.getCell(19).numFmt='dd/mm/yyyy';
  }
  const validationRanges=[['A','A',4],['B','B',2],['C','C',7],['D','D',5],['E','D',5],['T','E',3]];
  for(let row=2;row<=Math.max(501,members.length+1);row++) {
    for(const [column,source,count] of validationRanges) {
      sheet.getCell(`${column}${row}`).dataValidation={type:'list',allowBlank:true,formulae:[`'Validation rules'!$${source}$1:$${source}$${count}`]};
    }
  }
  const buffer=await workbook.xlsx.writeBuffer();
  return new Blob([buffer],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
