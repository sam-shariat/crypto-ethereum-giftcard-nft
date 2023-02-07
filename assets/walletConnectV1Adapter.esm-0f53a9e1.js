import { C as CHAIN_NAMESPACES, f as _defineProperty, m as WALLET_ADAPTERS, i as ADAPTER_NAMESPACES, p as ADAPTER_CATEGORY, A as ADAPTER_STATUS, h as getChainConfig, k as ADAPTER_EVENTS, l as log, W as WalletInitializationError, a0 as Web3AuthError, j as WalletLoginError } from "./base.esm-570dabbe.js";
import { F as Connector, G as cryptoLib } from "./index-f8977440.js";
import { B as BaseEvmAdapter } from "./baseEvmAdapter.esm-f449d957.js";
import { WalletConnectProvider } from "./ethereumProvider.esm-665feb91.js";
import "./baseProvider.esm-dad41c9c.js";
import "./browser-cf62a047.js";
import "./elliptic-f2b24f57.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
import "./url-d0ea8fe9.js";
class WalletConnect extends Connector {
  constructor(connectorOpts, pushServerOpts) {
    super({
      cryptoLib,
      connectorOpts,
      pushServerOpts
    });
  }
}
const WALLET_CONNECT_EXTENSION_ADAPTERS = [{
  name: "Rainbow",
  chains: [CHAIN_NAMESPACES.EIP155],
  logo: "https://images.web3auth.io/login-rainbow.svg",
  mobile: {
    native: "rainbow:",
    universal: "https://rnbwapp.com"
  },
  desktop: {
    native: "",
    universal: ""
  }
}, {
  name: "MetaMask",
  chains: [CHAIN_NAMESPACES.EIP155],
  logo: "https://images.web3auth.io/login-metamask.svg",
  mobile: {
    native: "metamask:",
    universal: "https://metamask.app.link"
  },
  desktop: {
    native: "",
    universal: ""
  }
}];
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
class WalletConnectV1Adapter extends BaseEvmAdapter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super();
    _defineProperty(this, "name", WALLET_ADAPTERS.WALLET_CONNECT_V1);
    _defineProperty(this, "adapterNamespace", ADAPTER_NAMESPACES.EIP155);
    _defineProperty(this, "currentChainNamespace", CHAIN_NAMESPACES.EIP155);
    _defineProperty(this, "type", ADAPTER_CATEGORY.EXTERNAL);
    _defineProperty(this, "adapterOptions", void 0);
    _defineProperty(this, "status", ADAPTER_STATUS.NOT_READY);
    _defineProperty(this, "adapterData", {
      uri: "",
      extensionAdapters: WALLET_CONNECT_EXTENSION_ADAPTERS
    });
    _defineProperty(this, "connector", null);
    _defineProperty(this, "wcProvider", null);
    _defineProperty(this, "rehydrated", false);
    this.adapterOptions = _objectSpread({}, options);
    this.chainConfig = options.chainConfig || null;
    this.sessionTime = options.sessionTime || 86400;
  }
  get connected() {
    var _this$connector;
    return !!((_this$connector = this.connector) !== null && _this$connector !== void 0 && _this$connector.connected);
  }
  get provider() {
    var _this$wcProvider;
    return ((_this$wcProvider = this.wcProvider) === null || _this$wcProvider === void 0 ? void 0 : _this$wcProvider.provider) || null;
  }
  set provider(_) {
    throw new Error("Not implemented");
  }
  async init() {
    super.checkInitializationRequirements();
    if (!this.chainConfig) {
      this.chainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, 1);
    }
    this.connector = this.getWalletConnectInstance();
    this.wcProvider = new WalletConnectProvider({
      config: {
        chainConfig: this.chainConfig
      },
      connector: this.connector
    });
    this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.WALLET_CONNECT_V1);
    this.status = ADAPTER_STATUS.READY;
    log.debug("initializing wallet connect v1 adapter");
    if (this.connector.connected) {
      this.rehydrated = true;
      await this.onConnectHandler({
        accounts: this.connector.accounts,
        chainId: this.connector.chainId
      });
    }
  }
  async connect() {
    super.checkConnectionRequirements();
    if (!this.connector)
      throw WalletInitializationError.notReady("Wallet adapter is not ready yet");
    if (this.connected) {
      await this.onConnectHandler({
        accounts: this.connector.accounts,
        chainId: this.connector.chainId
      });
      return this.provider;
    }
    if (this.status !== ADAPTER_STATUS.CONNECTING) {
      var _this$adapterOptions$;
      if ((_this$adapterOptions$ = this.adapterOptions.adapterSettings) !== null && _this$adapterOptions$ !== void 0 && _this$adapterOptions$.qrcodeModal) {
        var _this$adapterOptions$2;
        this.connector = this.getWalletConnectInstance();
        this.wcProvider = new WalletConnectProvider({
          config: {
            chainConfig: this.chainConfig,
            // network switching can be skipped with custom ui
            skipLookupNetwork: (_this$adapterOptions$2 = this.adapterOptions.adapterSettings) === null || _this$adapterOptions$2 === void 0 ? void 0 : _this$adapterOptions$2.skipNetworkSwitching
          },
          connector: this.connector
        });
      }
      await this.createNewSession();
      this.status = ADAPTER_STATUS.CONNECTING;
      this.emit(ADAPTER_EVENTS.CONNECTING, {
        adapter: WALLET_ADAPTERS.WALLET_CONNECT_V1
      });
    }
    return new Promise((resolve, reject) => {
      if (!this.connector)
        return reject(WalletInitializationError.notReady("Wallet adapter is not ready yet"));
      this.connector.on("modal_closed", async () => {
        this.status = ADAPTER_STATUS.READY;
        this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.WALLET_CONNECT_V1);
        return reject(new Error("User closed modal"));
      });
      try {
        this.connector.on("connect", async (error, payload) => {
          if (error) {
            this.emit(ADAPTER_EVENTS.ERRORED, error);
          }
          log.debug("connected event emitted by web3auth");
          await this.onConnectHandler(payload.params[0]);
          return resolve(this.provider);
        });
      } catch (error) {
        log.error("Wallet connect v1 adapter error while connecting", error);
        this.status = ADAPTER_STATUS.READY;
        this.rehydrated = true;
        this.emit(ADAPTER_EVENTS.ERRORED, error);
        reject(error instanceof Web3AuthError ? error : WalletLoginError.connectionError("Failed to login with wallet connect: ".concat((error === null || error === void 0 ? void 0 : error.message) || "")));
      }
    });
  }
  setAdapterSettings(options) {
    if (this.status === ADAPTER_STATUS.READY)
      return;
    if (options !== null && options !== void 0 && options.sessionTime) {
      this.sessionTime = options.sessionTime;
    }
  }
  async getUserInfo() {
    if (!this.connected)
      throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
    return {};
  }
  async disconnect() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
      cleanup: false
    };
    const {
      cleanup
    } = options;
    if (!this.connector || !this.connected)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    await super.disconnect();
    await this.connector.killSession();
    this.rehydrated = false;
    if (cleanup) {
      this.connector = null;
      this.status = ADAPTER_STATUS.NOT_READY;
      this.wcProvider = null;
    } else {
      this.status = ADAPTER_STATUS.READY;
    }
    this.emit(ADAPTER_EVENTS.DISCONNECTED);
  }
  async addChain(chainConfig) {
    try {
      var _this$adapterOptions$3;
      if (!this.wcProvider)
        throw WalletInitializationError.notReady("Wallet adapter is not ready yet");
      const networkSwitch = (_this$adapterOptions$3 = this.adapterOptions.adapterSettings) === null || _this$adapterOptions$3 === void 0 ? void 0 : _this$adapterOptions$3.networkSwitchModal;
      if (networkSwitch) {
        await networkSwitch.addNetwork({
          chainConfig,
          appOrigin: window.location.hostname
        });
      }
      await this.wcProvider.addChain(chainConfig);
    } catch (error) {
      log.error(error);
    }
  }
  async switchChain(connectedChainConfig, chainConfig) {
    var _this$adapterOptions$4;
    if (!this.wcProvider)
      throw WalletInitializationError.notReady("Wallet adapter is not ready yet");
    const networkSwitch = (_this$adapterOptions$4 = this.adapterOptions.adapterSettings) === null || _this$adapterOptions$4 === void 0 ? void 0 : _this$adapterOptions$4.networkSwitchModal;
    if (networkSwitch) {
      await networkSwitch.switchNetwork({
        currentChainConfig: chainConfig,
        newChainConfig: connectedChainConfig,
        appOrigin: window.location.hostname
      });
    }
    await this.wcProvider.switchChain({
      chainId: chainConfig.chainId,
      lookup: false,
      addChain: false
    });
  }
  async createNewSession() {
    var _this$adapterOptions, _this$adapterOptions$5;
    let opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
      forceNewSession: false
    };
    if (!this.connector)
      throw WalletInitializationError.notReady("Wallet adapter is not ready yet");
    if (opts.forceNewSession && this.connector.pending) {
      await this.connector.killSession();
    }
    if ((_this$adapterOptions = this.adapterOptions) !== null && _this$adapterOptions !== void 0 && (_this$adapterOptions$5 = _this$adapterOptions.adapterSettings) !== null && _this$adapterOptions$5 !== void 0 && _this$adapterOptions$5.qrcodeModal) {
      var _this$chainConfig;
      await this.connector.createSession({
        chainId: parseInt(((_this$chainConfig = this.chainConfig) === null || _this$chainConfig === void 0 ? void 0 : _this$chainConfig.chainId) || "0x1", 16)
      });
      return;
    }
    return new Promise((resolve, reject) => {
      var _this$chainConfig2;
      if (!this.connector)
        return reject(WalletInitializationError.notReady("Wallet adapter is not ready yet"));
      log.debug("creating new session for web3auth wallet connect");
      this.connector.on("display_uri", async (err, payload) => {
        var _this$connector2;
        if (err) {
          this.emit(ADAPTER_EVENTS.ERRORED, WalletLoginError.connectionError("Failed to display wallet connect qr code"));
          return reject(err);
        }
        const uri = payload.params[0];
        this.updateAdapterData({
          uri,
          extensionAdapters: WALLET_CONNECT_EXTENSION_ADAPTERS
        });
        (_this$connector2 = this.connector) === null || _this$connector2 === void 0 ? void 0 : _this$connector2.off("display_uri");
        return resolve();
      });
      this.connector.createSession({
        chainId: parseInt(((_this$chainConfig2 = this.chainConfig) === null || _this$chainConfig2 === void 0 ? void 0 : _this$chainConfig2.chainId) || "0x1", 16)
      }).catch((error) => {
        log.error("error while creating new wallet connect session", error);
        this.emit(ADAPTER_EVENTS.ERRORED, error);
        return reject(error);
      });
    });
  }
  async onConnectHandler(params) {
    if (!this.connector || !this.wcProvider)
      throw WalletInitializationError.notReady("Wallet adapter is not ready yet");
    if (!this.chainConfig)
      throw WalletInitializationError.invalidParams("Chain config is not set");
    const {
      chainId
    } = params;
    log.debug("connected chainId in hex");
    if (chainId !== parseInt(this.chainConfig.chainId, 16)) {
      var _this$adapterOptions$6, _this$adapterOptions2, _this$adapterOptions3;
      const connectedChainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, chainId) || {
        chainId: "0x".concat(chainId.toString(16)),
        displayName: "Unknown Network"
      };
      const isCustomUi = (_this$adapterOptions$6 = this.adapterOptions.adapterSettings) === null || _this$adapterOptions$6 === void 0 ? void 0 : _this$adapterOptions$6.qrcodeModal;
      if (!isCustomUi || isCustomUi && !((_this$adapterOptions2 = this.adapterOptions) !== null && _this$adapterOptions2 !== void 0 && (_this$adapterOptions3 = _this$adapterOptions2.adapterSettings) !== null && _this$adapterOptions3 !== void 0 && _this$adapterOptions3.skipNetworkSwitching)) {
        try {
          await this.addChain(this.chainConfig);
          await this.switchChain(connectedChainConfig, this.chainConfig);
          this.connector = this.getWalletConnectInstance();
        } catch (error) {
          log.error("error while chain switching", error);
          await this.createNewSession({
            forceNewSession: true
          });
          this.emit(ADAPTER_EVENTS.ERRORED, WalletInitializationError.fromCode(5e3, "Not connected to correct network. Expected: ".concat(this.chainConfig.displayName, ", Current: ").concat((connectedChainConfig === null || connectedChainConfig === void 0 ? void 0 : connectedChainConfig.displayName) || chainId, ", Please switch to correct network from wallet")));
          this.status = ADAPTER_STATUS.READY;
          this.rehydrated = true;
          return;
        }
      }
    }
    await this.wcProvider.setupProvider(this.connector);
    this.subscribeEvents(this.connector);
    this.status = ADAPTER_STATUS.CONNECTED;
    this.emit(ADAPTER_EVENTS.CONNECTED, {
      adapter: WALLET_ADAPTERS.WALLET_CONNECT_V1,
      reconnected: this.rehydrated
    });
  }
  subscribeEvents(connector) {
    connector.on("session_update", async (error) => {
      if (error) {
        this.emit(ADAPTER_EVENTS.ERRORED, error);
      }
    });
  }
  getWalletConnectInstance() {
    const walletConnectOptions = this.adapterOptions.adapterSettings || {};
    walletConnectOptions.bridge = walletConnectOptions.bridge || "https://bridge.walletconnect.org";
    return new WalletConnect(walletConnectOptions);
  }
}
export {
  WalletConnectV1Adapter
};
