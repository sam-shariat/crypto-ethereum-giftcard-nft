import { O as OPENLOGIN_NETWORK, U as UX_MODE, g as getHashQueryParams, a as OpenLogin, _ as __vitePreload, S as SUPPORTED_KEY_CURVES } from "./openlogin.esm-e718131c.js";
import { h as getChainConfig, a1 as BaseAdapter, f as _defineProperty, m as WALLET_ADAPTERS, i as ADAPTER_NAMESPACES, p as ADAPTER_CATEGORY, A as ADAPTER_STATUS, C as CHAIN_NAMESPACES, l as log, W as WalletInitializationError, k as ADAPTER_EVENTS, j as WalletLoginError, n as merge } from "./base.esm-570dabbe.js";
import { i as CommonPrivateKeyProvider } from "./baseProvider.esm-dad41c9c.js";
import "./elliptic-f2b24f57.js";
import "./browser-cf62a047.js";
const getOpenloginDefaultOptions = (chainNamespace, chainId) => {
  return {
    adapterSettings: {
      network: OPENLOGIN_NETWORK.MAINNET,
      clientId: "",
      uxMode: UX_MODE.POPUP
    },
    chainConfig: chainNamespace ? getChainConfig(chainNamespace, chainId) : null,
    loginSettings: {}
  };
};
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
class OpenloginAdapter extends BaseAdapter {
  constructor(params) {
    var _params$chainConfig, _params$chainConfig2, _params$chainConfig3;
    super();
    _defineProperty(this, "name", WALLET_ADAPTERS.OPENLOGIN);
    _defineProperty(this, "adapterNamespace", ADAPTER_NAMESPACES.MULTICHAIN);
    _defineProperty(this, "type", ADAPTER_CATEGORY.IN_APP);
    _defineProperty(this, "openloginInstance", null);
    _defineProperty(this, "status", ADAPTER_STATUS.NOT_READY);
    _defineProperty(this, "currentChainNamespace", CHAIN_NAMESPACES.EIP155);
    _defineProperty(this, "openloginOptions", void 0);
    _defineProperty(this, "loginSettings", {});
    _defineProperty(this, "privKeyProvider", null);
    log.debug("const openlogin adapter", params);
    const defaultOptions = getOpenloginDefaultOptions((_params$chainConfig = params.chainConfig) === null || _params$chainConfig === void 0 ? void 0 : _params$chainConfig.chainNamespace, (_params$chainConfig2 = params.chainConfig) === null || _params$chainConfig2 === void 0 ? void 0 : _params$chainConfig2.chainId);
    this.openloginOptions = _objectSpread(_objectSpread({
      clientId: "",
      network: OPENLOGIN_NETWORK.MAINNET
    }, defaultOptions.adapterSettings), params.adapterSettings || {});
    this.loginSettings = _objectSpread(_objectSpread({}, defaultOptions.loginSettings), params.loginSettings);
    this.sessionTime = this.loginSettings.sessionTime || 86400;
    if ((_params$chainConfig3 = params.chainConfig) !== null && _params$chainConfig3 !== void 0 && _params$chainConfig3.chainNamespace) {
      var _params$chainConfig4;
      this.currentChainNamespace = (_params$chainConfig4 = params.chainConfig) === null || _params$chainConfig4 === void 0 ? void 0 : _params$chainConfig4.chainNamespace;
      const defaultChainIdConfig = defaultOptions.chainConfig ? defaultOptions.chainConfig : {};
      this.chainConfig = _objectSpread(_objectSpread({}, defaultChainIdConfig), params === null || params === void 0 ? void 0 : params.chainConfig);
      log.debug("const openlogin chainConfig", this.chainConfig);
      if (!this.chainConfig.rpcTarget && params.chainConfig.chainNamespace !== CHAIN_NAMESPACES.OTHER) {
        throw WalletInitializationError.invalidParams("rpcTarget is required in chainConfig");
      }
    }
  }
  get chainConfigProxy() {
    return this.chainConfig ? _objectSpread({}, this.chainConfig) : null;
  }
  get provider() {
    var _this$privKeyProvider;
    return ((_this$privKeyProvider = this.privKeyProvider) === null || _this$privKeyProvider === void 0 ? void 0 : _this$privKeyProvider.provider) || null;
  }
  set provider(_) {
    throw new Error("Not implemented");
  }
  async init(options) {
    var _this$openloginOption;
    super.checkInitializationRequirements();
    if (!((_this$openloginOption = this.openloginOptions) !== null && _this$openloginOption !== void 0 && _this$openloginOption.clientId))
      throw WalletInitializationError.invalidParams("clientId is required before openlogin's initialization");
    if (!this.chainConfig)
      throw WalletInitializationError.invalidParams("chainConfig is required before initialization");
    let isRedirectResult = false;
    if (this.openloginOptions.uxMode === UX_MODE.REDIRECT) {
      const redirectResult = getHashQueryParams();
      if (Object.keys(redirectResult).length > 0 && redirectResult._pid) {
        isRedirectResult = true;
      }
    }
    this.openloginOptions = _objectSpread(_objectSpread({}, this.openloginOptions), {}, {
      replaceUrlOnRedirect: isRedirectResult
    });
    this.openloginInstance = new OpenLogin(this.openloginOptions);
    log.debug("initializing openlogin adapter init");
    await this.openloginInstance.init();
    this.status = ADAPTER_STATUS.READY;
    this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.OPENLOGIN);
    try {
      log.debug("initializing openlogin adapter");
      if (this.openloginInstance.privKey && (options.autoConnect || isRedirectResult)) {
        await this.connect();
      }
    } catch (error) {
      log.error("Failed to connect with cached openlogin provider", error);
      this.emit("ERRORED", error);
    }
  }
  async connect(params) {
    super.checkConnectionRequirements();
    this.status = ADAPTER_STATUS.CONNECTING;
    this.emit(ADAPTER_EVENTS.CONNECTING, _objectSpread(_objectSpread({}, params), {}, {
      adapter: WALLET_ADAPTERS.OPENLOGIN
    }));
    try {
      await this.connectWithProvider(params);
      return this.provider;
    } catch (error) {
      log.error("Failed to connect with openlogin provider", error);
      this.status = ADAPTER_STATUS.READY;
      this.emit(ADAPTER_EVENTS.ERRORED, error);
      if (error !== null && error !== void 0 && error.message.includes("user closed popup")) {
        throw WalletLoginError.popupClosed();
      }
      throw WalletLoginError.connectionError("Failed to login with openlogin");
    }
  }
  async disconnect() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
      cleanup: false
    };
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    if (!this.openloginInstance)
      throw WalletInitializationError.notReady("openloginInstance is not ready");
    await this.openloginInstance.logout();
    if (options.cleanup) {
      this.status = ADAPTER_STATUS.NOT_READY;
      this.openloginInstance = null;
      this.privKeyProvider = null;
    } else {
      this.status = ADAPTER_STATUS.READY;
    }
    this.emit(ADAPTER_EVENTS.DISCONNECTED);
  }
  async authenticateUser() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
    const userInfo = await this.getUserInfo();
    return {
      idToken: userInfo.idToken
    };
  }
  async getUserInfo() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    if (!this.openloginInstance)
      throw WalletInitializationError.notReady("openloginInstance is not ready");
    const userInfo = await this.openloginInstance.getUserInfo();
    return userInfo;
  }
  // should be called only before initialization.
  setAdapterSettings(adapterSettings) {
    if (this.status === ADAPTER_STATUS.READY)
      return;
    const defaultOptions = getOpenloginDefaultOptions();
    this.openloginOptions = _objectSpread(_objectSpread(_objectSpread({}, defaultOptions.adapterSettings), this.openloginOptions || {}), adapterSettings);
    if (adapterSettings.sessionTime) {
      this.loginSettings = _objectSpread(_objectSpread({}, this.loginSettings), {}, {
        sessionTime: adapterSettings.sessionTime
      });
    }
  }
  // should be called only before initialization.
  setChainConfig(customChainConfig) {
    super.setChainConfig(customChainConfig);
    this.currentChainNamespace = customChainConfig.chainNamespace;
  }
  async connectWithProvider(params) {
    if (!this.chainConfig)
      throw WalletInitializationError.invalidParams("chainConfig is required before initialization");
    if (!this.openloginInstance)
      throw WalletInitializationError.notReady("openloginInstance is not ready");
    if (this.currentChainNamespace === CHAIN_NAMESPACES.SOLANA) {
      const {
        SolanaPrivateKeyProvider
      } = await __vitePreload(() => import("./solanaProvider.esm-925e36a1.js").then((n) => n.s), true ? ["assets/solanaProvider.esm-925e36a1.js","assets/base.esm-570dabbe.js","assets/baseProvider.esm-dad41c9c.js","assets/browser-cf62a047.js","assets/elliptic-f2b24f57.js","assets/interopRequireDefault-7e6f3c51.js","assets/index-2c674280.js","assets/nacl-fast-4fab9055.js","assets/_commonjs-dynamic-modules-58f2b0ec.js"] : void 0);
      this.privKeyProvider = new SolanaPrivateKeyProvider({
        config: {
          chainConfig: this.chainConfig
        }
      });
    } else if (this.currentChainNamespace === CHAIN_NAMESPACES.EIP155) {
      const {
        EthereumPrivateKeyProvider
      } = await __vitePreload(() => import("./ethereumProvider.esm-665feb91.js"), true ? ["assets/ethereumProvider.esm-665feb91.js","assets/base.esm-570dabbe.js","assets/baseProvider.esm-dad41c9c.js","assets/browser-cf62a047.js","assets/elliptic-f2b24f57.js","assets/_commonjs-dynamic-modules-58f2b0ec.js","assets/url-d0ea8fe9.js"] : void 0);
      this.privKeyProvider = new EthereumPrivateKeyProvider({
        config: {
          chainConfig: this.chainConfig
        }
      });
    } else if (this.currentChainNamespace === CHAIN_NAMESPACES.OTHER) {
      this.privKeyProvider = new CommonPrivateKeyProvider();
    } else {
      throw new Error("Invalid chainNamespace: ".concat(this.currentChainNamespace, " found while connecting to wallet"));
    }
    if (!this.openloginInstance.privKey && params) {
      var _params$extraLoginOpt;
      if (!this.loginSettings.curve) {
        this.loginSettings.curve = this.currentChainNamespace === CHAIN_NAMESPACES.SOLANA ? SUPPORTED_KEY_CURVES.ED25519 : SUPPORTED_KEY_CURVES.SECP256K1;
      }
      await this.openloginInstance.login(merge(this.loginSettings, {
        loginProvider: params.loginProvider
      }, {
        extraLoginOptions: _objectSpread(_objectSpread({}, params.extraLoginOptions || {}), {}, {
          login_hint: params.login_hint || ((_params$extraLoginOpt = params.extraLoginOptions) === null || _params$extraLoginOpt === void 0 ? void 0 : _params$extraLoginOpt.login_hint)
        })
      }));
    }
    let finalPrivKey = this.openloginInstance.privKey;
    if (finalPrivKey) {
      if (this.currentChainNamespace === CHAIN_NAMESPACES.SOLANA) {
        const {
          getED25519Key
        } = await __vitePreload(() => import("./openloginEd25519.esm-3d74e3a9.js"), true ? ["assets/openloginEd25519.esm-3d74e3a9.js","assets/nacl-fast-4fab9055.js","assets/_commonjs-dynamic-modules-58f2b0ec.js","assets/base.esm-570dabbe.js"] : void 0);
        finalPrivKey = getED25519Key(finalPrivKey).sk.toString("hex");
      }
      await this.privKeyProvider.setupProvider(finalPrivKey);
      this.status = ADAPTER_STATUS.CONNECTED;
      this.emit(ADAPTER_EVENTS.CONNECTED, {
        adapter: WALLET_ADAPTERS.OPENLOGIN,
        reconnected: !params
      });
    }
  }
}
export {
  OpenloginAdapter,
  getOpenloginDefaultOptions
};
