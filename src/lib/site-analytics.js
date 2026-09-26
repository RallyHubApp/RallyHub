import { base44 } from '@/api/base44Client';

const CONSENT_KEY='rallyhub.analytics.consent.v1';
const VISITOR_KEY='rallyhub.analytics.visitor.v1';
const FIRST_SEEN_KEY='rallyhub.analytics.firstSeen.v1';
const SESSION_KEY='rallyhub.analytics.session.v1';
const CONSENT_VERSION='analytics-v1';
let gaMeasurementId='';
let gaLoading=null;

const randomId=(prefix='id')=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;
export const analyticsConsent=()=>localStorage.getItem(CONSENT_KEY)||'';
export const setAnalyticsConsent=value=>localStorage.setItem(CONSENT_KEY,value==='granted'?'granted':'denied');

function visitorContext(){
  let visitorId=localStorage.getItem(VISITOR_KEY);
  let firstSeen=localStorage.getItem(FIRST_SEEN_KEY);
  let sessionId=sessionStorage.getItem(SESSION_KEY);
  const now=new Date();
  if(!visitorId){visitorId=randomId('v');localStorage.setItem(VISITOR_KEY,visitorId)}
  if(!firstSeen){firstSeen=now.toISOString();localStorage.setItem(FIRST_SEEN_KEY,firstSeen)}
  if(!sessionId){sessionId=randomId('s');sessionStorage.setItem(SESSION_KEY,sessionId)}
  const first=new Date(firstSeen);
  const isReturning=Number.isFinite(first.getTime()) && now.getTime()-first.getTime()>6*60*60*1000;
  return {visitorId,sessionId,isReturning};
}

function trafficContext(){
  const params=new URLSearchParams(window.location.search);
  const utmSource=params.get('utm_source');
  const utmMedium=params.get('utm_medium');
  let referrerDomain='';
  try{referrerDomain=document.referrer?new URL(document.referrer).hostname:''}catch{}
  let trafficSource=utmSource ? `${utmSource}${utmMedium?` / ${utmMedium}`:''}` : referrerDomain || 'Direct / unknown';
  if(/google\./i.test(referrerDomain))trafficSource='Google organic';
  else if(/facebook\.com|fb\.com/i.test(referrerDomain))trafficSource='Facebook referral';
  else if(/instagram\.com/i.test(referrerDomain))trafficSource='Instagram referral';
  return {referrerDomain,trafficSource};
}

export async function loadAnalyticsConfig(){
  if(analyticsConsent()!=='granted') return {ga4Configured:false};
  try{
    const response=await base44.functions.invoke('siteAnalytics',{action:'public_config'});
    const measurementId=response.data?.measurementId||'';
    if(measurementId) await loadGa4(measurementId);
    return response.data||{};
  }catch{return {ga4Configured:false}}
}

export async function loadGa4(measurementId){
  if(!measurementId||analyticsConsent()!=='granted')return;
  gaMeasurementId=measurementId;
  if(window.gtag)return;
  if(gaLoading)return gaLoading;
  gaLoading=new Promise(resolve=>{
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments)};
    window.gtag('js',new Date());
    window.gtag('config',measurementId,{anonymize_ip:true,send_page_view:false});
    const script=document.createElement('script');
    script.async=true;
    script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onload=()=>resolve();script.onerror=()=>resolve();document.head.appendChild(script);
  });
  return gaLoading;
}

export async function trackSiteEvent(eventName,details={}){
  if(typeof window==='undefined'||analyticsConsent()!=='granted')return;
  const {visitorId,sessionId,isReturning}=visitorContext();
  const {referrerDomain,trafficSource}=trafficContext();
  const payload={
    action:'public_track',eventName,visitorId,sessionId,isReturning,
    path:window.location.pathname,pageTitle:document.title,referrerDomain,trafficSource,
    consentVersion:CONSENT_VERSION,...details
  };
  try{base44.functions.invoke('siteAnalytics',payload).catch(()=>{})}catch{}
  if(window.gtag&&gaMeasurementId){
    const gaDetails={...details,page_path:window.location.pathname,page_title:document.title};
    delete gaDetails.metadata;
    window.gtag('event',eventName,gaDetails);
  }
}

export function publicPage(pathname){
  return pathname==='/'||pathname.startsWith('/directory')||pathname.startsWith('/pickleball-clubs/')||pathname.startsWith('/pickleball-venues/')||pathname==='/events'||pathname==='/about'||pathname==='/contact';
}
