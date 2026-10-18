export const allowedRatingTopics = new Set(['RATING','RATING_SEED']);
export function validRatingEnvelope(data:any,clientId:string){return !!data&&data.clientId===clientId&&allowedRatingTopics.has(data.event)&&typeof data.message?.duprId==='string';}
