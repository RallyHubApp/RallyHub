/** Fail closed: SumUp paid status alone is not proof of correct amount, currency or merchant. */
export function reviewVerifiedEventCheckout(result,{amount,currency,merchantCode,checkoutId}={}){
 const data=result?.raw||{};
 const receivedAmount=Number(data.amount);
 const expectedAmount=Number(amount);
 const receivedCurrency=String(data.currency||'').toUpperCase();
 const expectedCurrency=String(currency||'EUR').toUpperCase();
 const actualMerchant=String(data.merchant_code||result?.merchantAccountId||'');
 const expectedMerchant=String(merchantCode||'');
 const actualCheckout=String(data.id||data.checkout_id||'');
 const issues=[];
 if(result?.normalizedStatus!=='paid')issues.push('provider_not_paid');
 if(!Number.isFinite(receivedAmount)||!Number.isFinite(expectedAmount)||expectedAmount<=0||Math.round(receivedAmount*100)!==Math.round(expectedAmount*100))issues.push('amount_mismatch');
 if(receivedCurrency!==expectedCurrency)issues.push('currency_mismatch');
 if(!expectedMerchant||!actualMerchant||actualMerchant!==expectedMerchant)issues.push('merchant_mismatch');
 if(checkoutId&&actualCheckout&&actualCheckout!==String(checkoutId))issues.push('checkout_mismatch');
 if(!String(result?.transactionId||''))issues.push('transaction_missing');
 return {verified:issues.length===0,issues};
}
