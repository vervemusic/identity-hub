// Large encrypted snapshots belong in IndexedDB, not the 5 MB localStorage bucket.
const KEY='identity-hub-v1';
const VAULT='identity-hub-encrypted-v1', BACKUP='identity-hub-conflict-backup-v1';
const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('identity-hub',1);r.onupgradeneeded=()=>r.result.createObjectStore('snapshots');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
function read(key){return new Promise((resolve,reject)=>{const t=db.transaction('snapshots'),r=t.objectStore('snapshots').get(key);r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);});}
let current=await read(VAULT),plain=await read(KEY);
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('identity-hub-storage'):null;
export const getVault=()=>current;
export const getPlain=()=>plain;
export function writePlain(value){return new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readwrite'),s=t.objectStore('snapshots'),r=s.get(KEY),expected=plain;r.onsuccess=()=>{if((r.result??null)!==expected){t.abort();return;}s.put(value,KEY);};t.oncomplete=()=>{plain=value;channel?.postMessage('changed');resolve();};t.onabort=t.onerror=()=>reject(t.error||Error('Storage changed'));});}

export const refreshVault=async()=>{current=await read(VAULT);plain=await read(KEY);return current;};
export const readBackup=()=>read(BACKUP);
export function writeVault(value,expected=current,backup=false){return new Promise((resolve,reject)=>{const t=db.transaction('snapshots','readwrite'),s=t.objectStore('snapshots'),r=s.get(VAULT);let conflict=false;r.onsuccess=()=>{if((r.result??null)!==expected){conflict=true;t.abort();return;}if(backup&&expected)s.put(expected,BACKUP);s.put(value,VAULT);s.delete(KEY);};t.oncomplete=()=>{current=value;plain=null;channel?.postMessage('changed');resolve();};t.onabort=t.onerror=()=>reject(conflict?Error('Directory changed in another window. Unlock and retry.'):t.error||Error('Storage failed'));});}
// Preserve existing encrypted installations before removing the old copy.
if(!current&&localStorage.getItem(VAULT)){await writeVault(localStorage.getItem(VAULT));}
if(current){localStorage.removeItem(VAULT);localStorage.removeItem(KEY);}else if(!plain&&localStorage.getItem(KEY)){await writePlain(localStorage.getItem(KEY));localStorage.removeItem(KEY);}
export function onVaultChange(callback){if(channel)channel.onmessage=async()=>{await refreshVault();callback();};}
