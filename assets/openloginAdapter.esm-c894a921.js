import {
  O as N,
  U as P,
  g as w,
  a as y,
  _ as E,
  S as v,
} from "./openlogin.esm-3de162c4.js";
import {
  h as m,
  a1 as A,
  f as a,
  m as u,
  i as T,
  p as _,
  A as r,
  C as c,
  l as g,
  W as h,
  k as p,
  j as d,
  n as R,
} from "./base.esm-e36f3d2a.js";
import { i as S } from "./baseProvider.esm-235b097a.js";
import "./elliptic-75fd6b2c.js";
import "./browser-1139343c.js";
const C = (s, i) => ({
  adapterSettings: { network: N.MAINNET, clientId: "", uxMode: P.POPUP },
  chainConfig: s ? m(s, i) : null,
  loginSettings: {},
});
function O(s, i) {
  var n = Object.keys(s);
  if (Object.getOwnPropertySymbols) {
    var t = Object.getOwnPropertySymbols(s);
    i &&
      (t = t.filter(function (o) {
        return Object.getOwnPropertyDescriptor(s, o).enumerable;
      })),
      n.push.apply(n, t);
  }
  return n;
}
function e(s) {
  for (var i = 1; i < arguments.length; i++) {
    var n = arguments[i] != null ? arguments[i] : {};
    i % 2
      ? O(Object(n), !0).forEach(function (t) {
          a(s, t, n[t]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(s, Object.getOwnPropertyDescriptors(n))
      : O(Object(n)).forEach(function (t) {
          Object.defineProperty(s, t, Object.getOwnPropertyDescriptor(n, t));
        });
  }
  return s;
}
class U extends A {
  constructor(i) {
    var n, t, o;
    super(),
      a(this, "name", u.OPENLOGIN),
      a(this, "adapterNamespace", T.MULTICHAIN),
      a(this, "type", _.IN_APP),
      a(this, "openloginInstance", null),
      a(this, "status", r.NOT_READY),
      a(this, "currentChainNamespace", c.EIP155),
      a(this, "openloginOptions", void 0),
      a(this, "loginSettings", {}),
      a(this, "privKeyProvider", null),
      g.debug("const openlogin adapter", i);
    const l = C(
      (n = i.chainConfig) === null || n === void 0 ? void 0 : n.chainNamespace,
      (t = i.chainConfig) === null || t === void 0 ? void 0 : t.chainId
    );
    if (
      ((this.openloginOptions = e(
        e({ clientId: "", network: N.MAINNET }, l.adapterSettings),
        i.adapterSettings || {}
      )),
      (this.loginSettings = e(e({}, l.loginSettings), i.loginSettings)),
      (this.sessionTime = this.loginSettings.sessionTime || 86400),
      (o = i.chainConfig) !== null && o !== void 0 && o.chainNamespace)
    ) {
      var f;
      this.currentChainNamespace =
        (f = i.chainConfig) === null || f === void 0
          ? void 0
          : f.chainNamespace;
      const I = l.chainConfig ? l.chainConfig : {};
      if (
        ((this.chainConfig = e(e({}, I), i == null ? void 0 : i.chainConfig)),
        g.debug("const openlogin chainConfig", this.chainConfig),
        !this.chainConfig.rpcTarget && i.chainConfig.chainNamespace !== c.OTHER)
      )
        throw h.invalidParams("rpcTarget is required in chainConfig");
    }
  }
  get chainConfigProxy() {
    return this.chainConfig ? e({}, this.chainConfig) : null;
  }
  get provider() {
    var i;
    return (
      ((i = this.privKeyProvider) === null || i === void 0
        ? void 0
        : i.provider) || null
    );
  }
  set provider(i) {
    throw new Error("Not implemented");
  }
  async init(i) {
    var n;
    if (
      (super.checkInitializationRequirements(),
      !((n = this.openloginOptions) !== null && n !== void 0 && n.clientId))
    )
      throw h.invalidParams(
        "clientId is required before openlogin's initialization"
      );
    if (!this.chainConfig)
      throw h.invalidParams("chainConfig is required before initialization");
    let t = !1;
    if (this.openloginOptions.uxMode === P.REDIRECT) {
      const o = w();
      Object.keys(o).length > 0 && o._pid && (t = !0);
    }
    (this.openloginOptions = e(
      e({}, this.openloginOptions),
      {},
      { replaceUrlOnRedirect: t }
    )),
      (this.openloginInstance = new y(this.openloginOptions)),
      g.debug("initializing openlogin adapter init"),
      await this.openloginInstance.init(),
      (this.status = r.READY),
      this.emit(p.READY, u.OPENLOGIN);
    try {
      g.debug("initializing openlogin adapter"),
        this.openloginInstance.privKey &&
          (i.autoConnect || t) &&
          (await this.connect());
    } catch (o) {
      g.error("Failed to connect with cached openlogin provider", o),
        this.emit("ERRORED", o);
    }
  }
  async connect(i) {
    super.checkConnectionRequirements(),
      (this.status = r.CONNECTING),
      this.emit(p.CONNECTING, e(e({}, i), {}, { adapter: u.OPENLOGIN }));
    try {
      return await this.connectWithProvider(i), this.provider;
    } catch (n) {
      throw (
        (g.error("Failed to connect with openlogin provider", n),
        (this.status = r.READY),
        this.emit(p.ERRORED, n),
        n != null && n.message.includes("user closed popup")
          ? d.popupClosed()
          : d.connectionError("Failed to login with openlogin"))
      );
    }
  }
  async disconnect() {
    let i =
      arguments.length > 0 && arguments[0] !== void 0
        ? arguments[0]
        : { cleanup: !1 };
    if (this.status !== r.CONNECTED)
      throw d.notConnectedError("Not connected with wallet");
    if (!this.openloginInstance)
      throw h.notReady("openloginInstance is not ready");
    await this.openloginInstance.logout(),
      i.cleanup
        ? ((this.status = r.NOT_READY),
          (this.openloginInstance = null),
          (this.privKeyProvider = null))
        : (this.status = r.READY),
      this.emit(p.DISCONNECTED);
  }
  async authenticateUser() {
    if (this.status !== r.CONNECTED)
      throw d.notConnectedError(
        "Not connected with wallet, Please login/connect first"
      );
    return { idToken: (await this.getUserInfo()).idToken };
  }
  async getUserInfo() {
    if (this.status !== r.CONNECTED)
      throw d.notConnectedError("Not connected with wallet");
    if (!this.openloginInstance)
      throw h.notReady("openloginInstance is not ready");
    return await this.openloginInstance.getUserInfo();
  }
  setAdapterSettings(i) {
    if (this.status === r.READY) return;
    const n = C();
    (this.openloginOptions = e(
      e(e({}, n.adapterSettings), this.openloginOptions || {}),
      i
    )),
      i.sessionTime &&
        (this.loginSettings = e(
          e({}, this.loginSettings),
          {},
          { sessionTime: i.sessionTime }
        ));
  }
  setChainConfig(i) {
    super.setChainConfig(i), (this.currentChainNamespace = i.chainNamespace);
  }
  async connectWithProvider(i) {
    if (!this.chainConfig)
      throw h.invalidParams("chainConfig is required before initialization");
    if (!this.openloginInstance)
      throw h.notReady("openloginInstance is not ready");
    if (this.currentChainNamespace === c.SOLANA) {
      const { SolanaPrivateKeyProvider: o } = await E(
        () => import("./solanaProvider.esm-6550f866.js").then((l) => l.s),
        [
          "assets/solanaProvider.esm-6550f866.js",
          "assets/base.esm-e36f3d2a.js",
          "assets/baseProvider.esm-235b097a.js",
          "assets/browser-1139343c.js",
          "assets/elliptic-75fd6b2c.js",
          "assets/interopRequireDefault-a67edd7c.js",
          "assets/index-2a7c4012.js",
          "assets/nacl-fast-0fea4a07.js",
          "assets/commonjs-dynamic-modules-302442b1.js",
        ]
      );
      this.privKeyProvider = new o({
        config: { chainConfig: this.chainConfig },
      });
    } else if (this.currentChainNamespace === c.EIP155) {
      const { EthereumPrivateKeyProvider: o } = await E(
        () => import("./ethereumProvider.esm-db8f2f40.js"),
        [
          "assets/ethereumProvider.esm-db8f2f40.js",
          "assets/base.esm-e36f3d2a.js",
          "assets/baseProvider.esm-235b097a.js",
          "assets/browser-1139343c.js",
          "assets/elliptic-75fd6b2c.js",
          "assets/commonjs-dynamic-modules-302442b1.js",
          "assets/url-5da867a5.js",
        ]
      );
      this.privKeyProvider = new o({
        config: { chainConfig: this.chainConfig },
      });
    } else if (this.currentChainNamespace === c.OTHER)
      this.privKeyProvider = new S();
    else
      throw new Error(
        "Invalid chainNamespace: ".concat(
          this.currentChainNamespace,
          " found while connecting to wallet"
        )
      );
    if (!this.openloginInstance.privKey && i) {
      var n;
      this.loginSettings.curve ||
        (this.loginSettings.curve =
          this.currentChainNamespace === c.SOLANA ? v.ED25519 : v.SECP256K1),
        await this.openloginInstance.login(
          R(
            this.loginSettings,
            { loginProvider: i.loginProvider },
            {
              extraLoginOptions: e(
                e({}, i.extraLoginOptions || {}),
                {},
                {
                  login_hint:
                    i.login_hint ||
                    ((n = i.extraLoginOptions) === null || n === void 0
                      ? void 0
                      : n.login_hint),
                }
              ),
            }
          )
        );
    }
    let t = this.openloginInstance.privKey;
    if (t) {
      if (this.currentChainNamespace === c.SOLANA) {
        const { getED25519Key: o } = await E(
          () => import("./openloginEd25519.esm-a39238d5.js"),
          [
            "assets/openloginEd25519.esm-a39238d5.js",
            "assets/nacl-fast-0fea4a07.js",
            "assets/commonjs-dynamic-modules-302442b1.js",
            "assets/base.esm-e36f3d2a.js",
          ]
        );
        t = o(t).sk.toString("hex");
      }
      await this.privKeyProvider.setupProvider(t),
        (this.status = r.CONNECTED),
        this.emit(p.CONNECTED, { adapter: u.OPENLOGIN, reconnected: !i });
    }
  }
}
export { U as OpenloginAdapter, C as getOpenloginDefaultOptions };
