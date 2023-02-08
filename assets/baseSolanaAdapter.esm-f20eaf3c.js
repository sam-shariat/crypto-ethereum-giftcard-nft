import{a1 as S,j as C,A as b,a2 as M,a3 as k,a4 as x,a5 as z,a6 as I,a7 as D}from"./base.esm-e36f3d2a.js";function O(w){if(w.length>=255)throw new TypeError("Alphabet too long");for(var n=new Uint8Array(256),v=0;v<n.length;v++)n[v]=255;for(var p=0;p<w.length;p++){var c=w.charAt(p),A=c.charCodeAt(0);if(n[A]!==255)throw new TypeError(c+" is ambiguous");n[A]=p}var l=w.length,E=w.charAt(0),T=Math.log(l)/Math.log(256),u=Math.log(256)/Math.log(l);function m(e){if(e instanceof Uint8Array||(ArrayBuffer.isView(e)?e=new Uint8Array(e.buffer,e.byteOffset,e.byteLength):Array.isArray(e)&&(e=Uint8Array.from(e))),!(e instanceof Uint8Array))throw new TypeError("Expected Uint8Array");if(e.length===0)return"";for(var t=0,g=0,a=0,o=e.length;a!==o&&e[a]===0;)a++,t++;for(var s=(o-a)*u+1>>>0,r=new Uint8Array(s);a!==o;){for(var h=e[a],f=0,i=s-1;(h!==0||f<g)&&i!==-1;i--,f++)h+=256*r[i]>>>0,r[i]=h%l>>>0,h=h/l>>>0;if(h!==0)throw new Error("Non-zero carry");g=f,a++}for(var d=s-g;d!==s&&r[d]===0;)d++;for(var y=E.repeat(t);d<s;++d)y+=w.charAt(r[d]);return y}function U(e){if(typeof e!="string")throw new TypeError("Expected String");if(e.length===0)return new Uint8Array;for(var t=0,g=0,a=0;e[t]===E;)g++,t++;for(var o=(e.length-t)*T+1>>>0,s=new Uint8Array(o);e[t];){var r=n[e.charCodeAt(t)];if(r===255)return;for(var h=0,f=o-1;(r!==0||h<a)&&f!==-1;f--,h++)r+=l*s[f]>>>0,s[f]=r%256>>>0,r=r/256>>>0;if(r!==0)throw new Error("Non-zero carry");a=h,t++}for(var i=o-a;i!==o&&s[i]===0;)i++;for(var d=new Uint8Array(g+(o-i)),y=g;i!==o;)d[y++]=s[i++];return d}function N(e){var t=U(e);if(t)return t;throw new Error("Non-base"+l+" character")}return{encode:m,decodeUnsafe:U,decode:N}}var R=O;const q=R,B="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";var F=q(B);class V extends S{async authenticateUser(){var n;if(!this.provider||!((n=this.chainConfig)!==null&&n!==void 0&&n.chainId))throw C.notConnectedError();const{chainNamespace:v,chainId:p}=this.chainConfig;if(this.status!==b.CONNECTED)throw C.notConnectedError("Not connected with wallet, Please login/connect first");const c=await this.provider.request({method:"getAccounts"});if(c&&c.length>0){const A=M(c[0],this.name);if(A&&!k(A))return{idToken:A};const l={domain:window.location.origin,uri:window.location.href,address:c[0],chainId:parseInt(p,16),version:"1",nonce:Math.random().toString(36).slice(2),issuedAt:new Date().toISOString()},E=await x(l,v),T=new TextEncoder().encode(E),u=await this.provider.request({method:"signMessage",params:{message:T,display:"utf8"}}),m=await z(v,F.encode(u),E,this.name,this.sessionTime);return I(c[0],this.name,m),{idToken:m}}throw C.notConnectedError("Not connected with wallet, Please login/connect first")}async disconnect(){if(this.status!==b.CONNECTED)throw C.disconnectionError("Not connected with wallet");const n=await this.provider.request({method:"getAccounts"});n&&n.length>0&&D(n[0],this.name)}}export{V as B};
