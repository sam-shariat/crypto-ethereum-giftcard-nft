import {
  f as o,
  m as u,
  i as A,
  C as p,
  p as v,
  A as e,
  k as l,
  h as C,
  W as m,
  l as f,
  a0 as N,
  j as c,
} from "./base.esm-e36f3d2a.js";
import { B as _ } from "./baseSolanaAdapter.esm-f20eaf3c.js";
import { a as g } from "./solanaProvider.esm-6550f866.js";
import "./baseProvider.esm-235b097a.js";
import "./browser-1139343c.js";
import "./elliptic-75fd6b2c.js";
import "./interopRequireDefault-a67edd7c.js";
import "./index-2a7c4012.js";
import "./nacl-fast-0fea4a07.js";
import "./commonjs-dynamic-modules-302442b1.js";
function E(r, t, i) {
  return new Promise((n, s) => {
    i > 0
      ? setTimeout(async () => {
          const h = await r();
          h && n(h),
            h ||
              E(r, t, i - 1)
                .then((a) => (n(a), a))
                .catch((a) => s(a));
        }, t)
      : n(!1);
  });
}
const P = async function () {
  var r;
  let t =
    arguments.length > 0 && arguments[0] !== void 0
      ? arguments[0]
      : { interval: 1e3, count: 3 };
  return (typeof window < "u" &&
    !!((r = window.solana) !== null && r !== void 0 && r.isPhantom)) ||
    (await E(
      () => {
        var s;
        return (s = window.solana) === null || s === void 0
          ? void 0
          : s.isPhantom;
      },
      t.interval,
      t.count
    ))
    ? window.solana
    : null;
};
class b extends _ {
  constructor() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(),
      o(this, "name", u.PHANTOM),
      o(this, "adapterNamespace", A.SOLANA),
      o(this, "currentChainNamespace", p.SOLANA),
      o(this, "type", v.EXTERNAL),
      o(this, "status", e.NOT_READY),
      o(this, "_wallet", null),
      o(this, "phantomProvider", null),
      o(this, "rehydrated", !1),
      o(this, "_onDisconnect", () => {
        this._wallet &&
          (this._wallet.off("disconnect", this._onDisconnect),
          (this.rehydrated = !1),
          (this.status = this.status === e.CONNECTED ? e.READY : e.NOT_READY),
          this.emit(l.DISCONNECTED));
      }),
      (this.chainConfig = t.chainConfig || null),
      (this.sessionTime = t.sessionTime || 86400);
  }
  get isWalletConnected() {
    var t;
    return !!(
      (t = this._wallet) !== null &&
      t !== void 0 &&
      t.isConnected &&
      this.status === e.CONNECTED
    );
  }
  get provider() {
    var t;
    return (
      ((t = this.phantomProvider) === null || t === void 0
        ? void 0
        : t.provider) || null
    );
  }
  set provider(t) {
    throw new Error("Not implemented");
  }
  setAdapterSettings(t) {
    this.status !== e.READY &&
      t != null &&
      t.sessionTime &&
      (this.sessionTime = t.sessionTime);
  }
  async init(t) {
    if (
      (super.checkInitializationRequirements(),
      this.chainConfig || (this.chainConfig = C(p.SOLANA, "0x1")),
      (this._wallet = await P({ interval: 500, count: 3 })),
      !this._wallet)
    )
      throw m.notInstalled();
    (this.phantomProvider = new g({
      config: { chainConfig: this.chainConfig },
    })),
      (this.status = e.READY),
      this.emit(l.READY, u.PHANTOM);
    try {
      f.debug("initializing phantom adapter"),
        t.autoConnect && ((this.rehydrated = !0), await this.connect());
    } catch (i) {
      f.error("Failed to connect with cached phantom provider", i),
        this.emit("ERRORED", i);
    }
  }
  async connect() {
    var t = this;
    try {
      if (
        (super.checkConnectionRequirements(),
        (this.status = e.CONNECTING),
        this.emit(l.CONNECTING, { adapter: u.PHANTOM }),
        !this._wallet)
      )
        throw m.notInstalled();
      if (this._wallet.isConnected)
        await this.connectWithProvider(this._wallet);
      else {
        const i = this._wallet._handleDisconnect;
        try {
          await new Promise((n, s) => {
            const h = async () => {
              await this.connectWithProvider(this._wallet), n(this.provider);
            };
            if (!this._wallet) return s(m.notInstalled());
            this._wallet.once("connect", h),
              (this._wallet._handleDisconnect = function () {
                s(m.windowClosed());
                for (
                  var a = arguments.length, w = new Array(a), d = 0;
                  d < a;
                  d++
                )
                  w[d] = arguments[d];
                return i.apply(t._wallet, w);
              }),
              this._wallet.connect().catch((a) => {
                s(a);
              });
          });
        } catch (n) {
          throw n instanceof N
            ? n
            : c.connectionError(n == null ? void 0 : n.message);
        } finally {
          this._wallet._handleDisconnect = i;
        }
      }
      if (!this._wallet.publicKey) throw c.connectionError();
      return this._wallet.on("disconnect", this._onDisconnect), this.provider;
    } catch (i) {
      throw (
        ((this.status = e.READY),
        (this.rehydrated = !1),
        this.emit(l.ERRORED, i),
        i)
      );
    }
  }
  async disconnect() {
    let t =
      arguments.length > 0 && arguments[0] !== void 0
        ? arguments[0]
        : { cleanup: !1 };
    await super.disconnect();
    try {
      var i;
      await ((i = this._wallet) === null || i === void 0
        ? void 0
        : i.disconnect()),
        t.cleanup &&
          ((this.status = e.NOT_READY),
          (this.phantomProvider = null),
          (this._wallet = null)),
        this.emit(l.DISCONNECTED);
    } catch (n) {
      this.emit(
        l.ERRORED,
        c.disconnectionError(n == null ? void 0 : n.message)
      );
    }
  }
  async getUserInfo() {
    if (!this.isWalletConnected)
      throw c.notConnectedError(
        "Not connected with wallet, Please login/connect first"
      );
    return {};
  }
  async connectWithProvider(t) {
    if (!this.phantomProvider) throw c.connectionError("No phantom provider");
    return (
      await this.phantomProvider.setupProvider(t),
      (this.status = e.CONNECTED),
      this.emit(l.CONNECTED, {
        adapter: u.PHANTOM,
        reconnected: this.rehydrated,
      }),
      this.provider
    );
  }
}
export { b as PhantomAdapter };
