import {
  C as g,
  f as s,
  m as p,
  i as A,
  p as O,
  A as r,
  h as m,
  k as a,
  l as u,
  W as d,
  a0 as P,
  j as f,
} from "./base.esm-e36f3d2a.js";
import { F as S, G as T } from "./index-346e2c9d.js";
import { B as I } from "./baseEvmAdapter.esm-4d4128f0.js";
import { WalletConnectProvider as v } from "./ethereumProvider.esm-db8f2f40.js";
import "./baseProvider.esm-235b097a.js";
import "./browser-1139343c.js";
import "./elliptic-75fd6b2c.js";
import "./commonjs-dynamic-modules-302442b1.js";
import "./url-5da867a5.js";
class b extends S {
  constructor(t, e) {
    super({ cryptoLib: T, connectorOpts: t, pushServerOpts: e });
  }
}
const C = [
  {
    name: "Rainbow",
    chains: [g.EIP155],
    logo: "https://images.web3auth.io/login-rainbow.svg",
    mobile: { native: "rainbow:", universal: "https://rnbwapp.com" },
    desktop: { native: "", universal: "" },
  },
  {
    name: "MetaMask",
    chains: [g.EIP155],
    logo: "https://images.web3auth.io/login-metamask.svg",
    mobile: { native: "metamask:", universal: "https://metamask.app.link" },
    desktop: { native: "", universal: "" },
  },
];
function y(c, t) {
  var e = Object.keys(c);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(c);
    t &&
      (n = n.filter(function (i) {
        return Object.getOwnPropertyDescriptor(c, i).enumerable;
      })),
      e.push.apply(e, n);
  }
  return e;
}
function D(c) {
  for (var t = 1; t < arguments.length; t++) {
    var e = arguments[t] != null ? arguments[t] : {};
    t % 2
      ? y(Object(e), !0).forEach(function (n) {
          s(c, n, e[n]);
        })
      : Object.getOwnPropertyDescriptors
      ? Object.defineProperties(c, Object.getOwnPropertyDescriptors(e))
      : y(Object(e)).forEach(function (n) {
          Object.defineProperty(c, n, Object.getOwnPropertyDescriptor(e, n));
        });
  }
  return c;
}
class q extends I {
  constructor() {
    let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(),
      s(this, "name", p.WALLET_CONNECT_V1),
      s(this, "adapterNamespace", A.EIP155),
      s(this, "currentChainNamespace", g.EIP155),
      s(this, "type", O.EXTERNAL),
      s(this, "adapterOptions", void 0),
      s(this, "status", r.NOT_READY),
      s(this, "adapterData", { uri: "", extensionAdapters: C }),
      s(this, "connector", null),
      s(this, "wcProvider", null),
      s(this, "rehydrated", !1),
      (this.adapterOptions = D({}, t)),
      (this.chainConfig = t.chainConfig || null),
      (this.sessionTime = t.sessionTime || 86400);
  }
  get connected() {
    var t;
    return !!((t = this.connector) !== null && t !== void 0 && t.connected);
  }
  get provider() {
    var t;
    return (
      ((t = this.wcProvider) === null || t === void 0 ? void 0 : t.provider) ||
      null
    );
  }
  set provider(t) {
    throw new Error("Not implemented");
  }
  async init() {
    super.checkInitializationRequirements(),
      this.chainConfig || (this.chainConfig = m(g.EIP155, 1)),
      (this.connector = this.getWalletConnectInstance()),
      (this.wcProvider = new v({
        config: { chainConfig: this.chainConfig },
        connector: this.connector,
      })),
      this.emit(a.READY, p.WALLET_CONNECT_V1),
      (this.status = r.READY),
      u.debug("initializing wallet connect v1 adapter"),
      this.connector.connected &&
        ((this.rehydrated = !0),
        await this.onConnectHandler({
          accounts: this.connector.accounts,
          chainId: this.connector.chainId,
        }));
  }
  async connect() {
    if ((super.checkConnectionRequirements(), !this.connector))
      throw d.notReady("Wallet adapter is not ready yet");
    if (this.connected)
      return (
        await this.onConnectHandler({
          accounts: this.connector.accounts,
          chainId: this.connector.chainId,
        }),
        this.provider
      );
    if (this.status !== r.CONNECTING) {
      var t;
      if (
        (t = this.adapterOptions.adapterSettings) !== null &&
        t !== void 0 &&
        t.qrcodeModal
      ) {
        var e;
        (this.connector = this.getWalletConnectInstance()),
          (this.wcProvider = new v({
            config: {
              chainConfig: this.chainConfig,
              skipLookupNetwork:
                (e = this.adapterOptions.adapterSettings) === null ||
                e === void 0
                  ? void 0
                  : e.skipNetworkSwitching,
            },
            connector: this.connector,
          }));
      }
      await this.createNewSession(),
        (this.status = r.CONNECTING),
        this.emit(a.CONNECTING, { adapter: p.WALLET_CONNECT_V1 });
    }
    return new Promise((n, i) => {
      if (!this.connector)
        return i(d.notReady("Wallet adapter is not ready yet"));
      this.connector.on(
        "modal_closed",
        async () => (
          (this.status = r.READY),
          this.emit(a.READY, p.WALLET_CONNECT_V1),
          i(new Error("User closed modal"))
        )
      );
      try {
        this.connector.on(
          "connect",
          async (o, h) => (
            o && this.emit(a.ERRORED, o),
            u.debug("connected event emitted by web3auth"),
            await this.onConnectHandler(h.params[0]),
            n(this.provider)
          )
        );
      } catch (o) {
        u.error("Wallet connect v1 adapter error while connecting", o),
          (this.status = r.READY),
          (this.rehydrated = !0),
          this.emit(a.ERRORED, o),
          i(
            o instanceof P
              ? o
              : f.connectionError(
                  "Failed to login with wallet connect: ".concat(
                    (o == null ? void 0 : o.message) || ""
                  )
                )
          );
      }
    });
  }
  setAdapterSettings(t) {
    this.status !== r.READY &&
      t != null &&
      t.sessionTime &&
      (this.sessionTime = t.sessionTime);
  }
  async getUserInfo() {
    if (!this.connected)
      throw f.notConnectedError(
        "Not connected with wallet, Please login/connect first"
      );
    return {};
  }
  async disconnect() {
    let t =
      arguments.length > 0 && arguments[0] !== void 0
        ? arguments[0]
        : { cleanup: !1 };
    const { cleanup: e } = t;
    if (!this.connector || !this.connected)
      throw f.notConnectedError("Not connected with wallet");
    await super.disconnect(),
      await this.connector.killSession(),
      (this.rehydrated = !1),
      e
        ? ((this.connector = null),
          (this.status = r.NOT_READY),
          (this.wcProvider = null))
        : (this.status = r.READY),
      this.emit(a.DISCONNECTED);
  }
  async addChain(t) {
    try {
      var e;
      if (!this.wcProvider) throw d.notReady("Wallet adapter is not ready yet");
      const n =
        (e = this.adapterOptions.adapterSettings) === null || e === void 0
          ? void 0
          : e.networkSwitchModal;
      n &&
        (await n.addNetwork({
          chainConfig: t,
          appOrigin: window.location.hostname,
        })),
        await this.wcProvider.addChain(t);
    } catch (n) {
      u.error(n);
    }
  }
  async switchChain(t, e) {
    var n;
    if (!this.wcProvider) throw d.notReady("Wallet adapter is not ready yet");
    const i =
      (n = this.adapterOptions.adapterSettings) === null || n === void 0
        ? void 0
        : n.networkSwitchModal;
    i &&
      (await i.switchNetwork({
        currentChainConfig: e,
        newChainConfig: t,
        appOrigin: window.location.hostname,
      })),
      await this.wcProvider.switchChain({
        chainId: e.chainId,
        lookup: !1,
        addChain: !1,
      });
  }
  async createNewSession() {
    var t, e;
    let n =
      arguments.length > 0 && arguments[0] !== void 0
        ? arguments[0]
        : { forceNewSession: !1 };
    if (!this.connector) throw d.notReady("Wallet adapter is not ready yet");
    if (
      (n.forceNewSession &&
        this.connector.pending &&
        (await this.connector.killSession()),
      (t = this.adapterOptions) !== null &&
        t !== void 0 &&
        (e = t.adapterSettings) !== null &&
        e !== void 0 &&
        e.qrcodeModal)
    ) {
      var i;
      await this.connector.createSession({
        chainId: parseInt(
          ((i = this.chainConfig) === null || i === void 0
            ? void 0
            : i.chainId) || "0x1",
          16
        ),
      });
      return;
    }
    return new Promise((o, h) => {
      var w;
      if (!this.connector)
        return h(d.notReady("Wallet adapter is not ready yet"));
      u.debug("creating new session for web3auth wallet connect"),
        this.connector.on("display_uri", async (l, N) => {
          var E;
          if (l)
            return (
              this.emit(
                a.ERRORED,
                f.connectionError("Failed to display wallet connect qr code")
              ),
              h(l)
            );
          const R = N.params[0];
          return (
            this.updateAdapterData({ uri: R, extensionAdapters: C }),
            (E = this.connector) === null ||
              E === void 0 ||
              E.off("display_uri"),
            o()
          );
        }),
        this.connector
          .createSession({
            chainId: parseInt(
              ((w = this.chainConfig) === null || w === void 0
                ? void 0
                : w.chainId) || "0x1",
              16
            ),
          })
          .catch(
            (l) => (
              u.error("error while creating new wallet connect session", l),
              this.emit(a.ERRORED, l),
              h(l)
            )
          );
    });
  }
  async onConnectHandler(t) {
    if (!this.connector || !this.wcProvider)
      throw d.notReady("Wallet adapter is not ready yet");
    if (!this.chainConfig) throw d.invalidParams("Chain config is not set");
    const { chainId: e } = t;
    if (
      (u.debug("connected chainId in hex"),
      e !== parseInt(this.chainConfig.chainId, 16))
    ) {
      var n, i, o;
      const h = m(g.EIP155, e) || {
          chainId: "0x".concat(e.toString(16)),
          displayName: "Unknown Network",
        },
        w =
          (n = this.adapterOptions.adapterSettings) === null || n === void 0
            ? void 0
            : n.qrcodeModal;
      if (
        !w ||
        (w &&
          !(
            (i = this.adapterOptions) !== null &&
            i !== void 0 &&
            (o = i.adapterSettings) !== null &&
            o !== void 0 &&
            o.skipNetworkSwitching
          ))
      )
        try {
          await this.addChain(this.chainConfig),
            await this.switchChain(h, this.chainConfig),
            (this.connector = this.getWalletConnectInstance());
        } catch (l) {
          u.error("error while chain switching", l),
            await this.createNewSession({ forceNewSession: !0 }),
            this.emit(
              a.ERRORED,
              d.fromCode(
                5e3,
                "Not connected to correct network. Expected: "
                  .concat(this.chainConfig.displayName, ", Current: ")
                  .concat(
                    (h == null ? void 0 : h.displayName) || e,
                    ", Please switch to correct network from wallet"
                  )
              )
            ),
            (this.status = r.READY),
            (this.rehydrated = !0);
          return;
        }
    }
    await this.wcProvider.setupProvider(this.connector),
      this.subscribeEvents(this.connector),
      (this.status = r.CONNECTED),
      this.emit(a.CONNECTED, {
        adapter: p.WALLET_CONNECT_V1,
        reconnected: this.rehydrated,
      });
  }
  subscribeEvents(t) {
    t.on("session_update", async (e) => {
      e && this.emit(a.ERRORED, e);
    });
  }
  getWalletConnectInstance() {
    const t = this.adapterOptions.adapterSettings || {};
    return (
      (t.bridge = t.bridge || "https://bridge.walletconnect.org"), new b(t)
    );
  }
}
export { q as WalletConnectV1Adapter };
