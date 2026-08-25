export const localDate=(at:Date,timeZone:string)=>new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
export const dateAdd=(d:string,n:number)=>{const x=new Date(`${d}T12:00:00Z`);x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
export const weekKey=(d:string)=>{const x=new Date(`${d}T12:00:00Z`),day=(x.getUTCDay()+6)%7;x.setUTCDate(x.getUTCDate()-day);return x.toISOString().slice(0,10)};
export const labelDate=(d:string)=>new Intl.DateTimeFormat('en',{day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${d}T12:00:00Z`));
