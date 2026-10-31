/** Read-only Base44 query resilience. Never retry mutations or approval actions. */
export const READ_STALE_MS=45_000;
export const READ_GC_MS=5*60_000;
export function shouldRetryRead(failureCount,error){
 const status=Number(error?.response?.status||error?.status||0);
 if([400,401,403,404,409,422].includes(status))return false;
 return failureCount<2;
}
export function readRetryDelay(attemptIndex){return Math.min(1500,400*(attemptIndex+1));}
export function invokeReadWithDeadline(invoke,name,payload,{timeoutMs=25_000,signal}={}){
 if(typeof invoke!=='function')return Promise.reject(new Error('Read service unavailable'));
 return new Promise((resolve,reject)=>{
  let settled=false;
  const done=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener?.('abort',abort);if(error)reject(error);else resolve(value);};
  const abort=()=>done(new Error('Read request cancelled'));
  const timer=setTimeout(()=>done(new Error(name+' did not respond within '+Math.round(timeoutMs/1000)+' seconds')),timeoutMs);
  if(signal?.aborted){abort();return;}
  signal?.addEventListener?.('abort',abort,{once:true});
  Promise.resolve().then(()=>invoke(name,payload)).then(value=>done(null,value),error=>done(error));
 });
}
