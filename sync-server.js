// Sites dispatch authenticates visitors and strips/replaces identity headers.
// This handler must only be deployed behind that trusted owner-private boundary.
export async function syncHandler(request,env){
 const url=new URL(request.url),headers={'Cache-Control':'no-store','Content-Type':'application/json','X-Content-Type-Options':'nosniff'};
 const reply=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...headers,...extra}});
 const user=request.headers.get('oai-authenticated-user-id');
 if(!user)return reply({error:'Sign in with ChatGPT required'},401);
 if(url.pathname.endsWith('/api/capabilities'))return reply({privateSync:true});
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(user));
 const key='directories/'+Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 if(request.method==='GET'){const object=await env.BUCKET.get(key);if(!object)return reply({empty:true},404);return new Response(object.body,{headers:{...headers,ETag:object.httpEtag}});}
 if(request.method!=='PUT')return reply({error:'Method not allowed'},405,{'Allow':'GET, PUT'});
 if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return reply({error:'Cross-origin writes rejected'},403);
 if(request.headers.get('content-type')!=='application/json')return reply({error:'JSON required'},415);
 const match=request.headers.get('if-match'),none=request.headers.get('if-none-match');
 if(!match&&none!=='*')return reply({error:'Version precondition required'},428);
 if(match&&none)return reply({error:'Ambiguous preconditions'},400);
 if(Number(request.headers.get('content-length')||0)>32000000)return reply({error:'Too large'},413);
 let size=0,chunks=[];const reader=request.body?.getReader();if(!reader)return reply({error:'Body required'},400);
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>32000000){await reader.cancel();return reply({error:'Too large'},413);}chunks.push(value);}
 let text='';const decoder=new TextDecoder();for(const c of chunks)text+=decoder.decode(c,{stream:true});text+=decoder.decode();
 let e;try{e=JSON.parse(text);if(!e||e.format!=='identity-hub-encrypted'||e.version!==1||e.iterations!==600000||Object.keys(e).some(k=>!['format','version','iterations','salt','iv','data'].includes(k))||typeof e.salt!=='string'||typeof e.iv!=='string'||typeof e.data!=='string'||!/^[A-Za-z0-9+/]{22}==$/.test(e.salt)||!/^[A-Za-z0-9+/]{16}$/.test(e.iv)||!/^[A-Za-z0-9+/]+={0,2}$/.test(e.data)||e.data.length<24)throw Error();}catch{return reply({error:'Only encrypted directory envelopes accepted'},400);}
 const conditional=new Headers();if(match)conditional.set('If-Match',match);else conditional.set('If-None-Match','*');
 const stored=await env.BUCKET.put(key,JSON.stringify(e),{onlyIf:conditional,httpMetadata:{contentType:'application/json',cacheControl:'no-store'}});
 if(!stored)return reply({error:'Directory changed on another device'},412);
 return reply({saved:true},200,{ETag:stored.httpEtag});
}
