export const KEY='identity-hub-v1';
const fields=['name','username','category','url'];
export function normalize(item){
 if(!item||typeof item!=='object'||Array.isArray(item))throw Error('Each account must be an object.');
 if(Object.keys(item).some(k=>!fields.includes(k)))throw Error('Unsupported fields rejected. Import only name, username, category and url; never a password-manager export.');
 const a={};for(const k of fields){if(item[k]!==undefined&&typeof item[k]!=='string')throw Error('Account fields must be text.');a[k]=(item[k]||'').trim();}
 if(!a.name||!a.category||!a.url)throw Error('Name, category and login URL are required.');
 if(a.name.length>100||a.username.length>200||a.category.length>60||a.url.length>1000)throw Error('Account field is too long.');
 const url=new URL(a.url);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('Use an HTTPS login URL without embedded credentials, query parameters or fragments.');
 a.url=url.href;return a;
}
export function parseImport(text){const data=JSON.parse(text);if(!Array.isArray(data)||data.length>2000)throw Error('Import a JSON array of up to 2,000 accounts.');return data.map(normalize);}
export function mergeAccounts(current,incoming){const result=[...current];let added=0;for(const a of incoming){if(!result.some(b=>b.url===a.url&&b.username.toLowerCase()===a.username.toLowerCase())){result.push(a);added++;}}if(result.length>2000)throw Error('Account limit is 2,000.');return {accounts:result,added};}
export function matches(a,q,category){return (!category||a.category===category)&&fields.some(k=>a[k].toLowerCase().includes(q.toLowerCase()));}
