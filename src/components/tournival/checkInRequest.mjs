export async function checkInRequest(invoke,registrationId,checkedIn,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))){
 for(let attempt=0;;attempt++){
  try{
   const result=await invoke({action:'tournival_check_in',registrationId,checkedIn});
   if(!result.success||result.checkedIn!==checkedIn)throw Error('Check-in not confirmed; refresh before retrying');
   return result;
  }catch(error){
   const status=Number(error?.response?.status??error?.status);
   if(status!==429||attempt>=2)throw error;
   const header=error?.response?.headers?.['retry-after']??error?.response?.headers?.get?.('retry-after');
   const seconds=Number(header);
   const delay=header==null?0:Number.isFinite(seconds)?seconds*1000:Date.parse(header)-Date.now();
   if(delay>15000)throw error;
   await wait(Math.max(1000*2**attempt,Number.isFinite(delay)?delay:0));
  }
 }
}
