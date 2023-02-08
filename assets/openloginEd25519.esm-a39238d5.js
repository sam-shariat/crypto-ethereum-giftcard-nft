import { n as a } from "./nacl-fast-0fea4a07.js";
import "./commonjs-dynamic-modules-302442b1.js";
import "./base.esm-e36f3d2a.js";
const r = a.lowlevel;
function m(e) {
  let f;
  typeof e == "string" ? (f = Buffer.from(e, "hex")) : (f = e);
  const n = new Uint8Array(64),
    i = [r.gf(), r.gf(), r.gf(), r.gf()],
    o = new Uint8Array([...new Uint8Array(f), ...new Uint8Array(32)]),
    s = new Uint8Array(32);
  r.crypto_hash(n, o, 32),
    (n[0] &= 248),
    (n[31] &= 127),
    (n[31] |= 64),
    r.scalarbase(i, n),
    r.pack(s, i);
  for (let t = 0; t < 32; t += 1) o[t + 32] = s[t];
  return { sk: Buffer.from(o), pk: Buffer.from(s) };
}
export { m as getED25519Key };
