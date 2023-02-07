import { b as getDefaultExportFromCjs, f as _defineProperty, i as ADAPTER_NAMESPACES, C as CHAIN_NAMESPACES, p as ADAPTER_CATEGORY, m as WALLET_ADAPTERS, A as ADAPTER_STATUS, W as WalletInitializationError, k as ADAPTER_EVENTS, l as log, h as getChainConfig, j as WalletLoginError } from "./base.esm-570dabbe.js";
import { r as requireDist } from "./index-1b9e19c3.js";
import { B as BaseEvmAdapter } from "./baseEvmAdapter.esm-f449d957.js";
var distExports = requireDist();
const detectEthereumProvider = /* @__PURE__ */ getDefaultExportFromCjs(distExports);
class MetamaskAdapter extends BaseEvmAdapter {
  constructor() {
    let adapterOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super();
    _defineProperty(this, "adapterNamespace", ADAPTER_NAMESPACES.EIP155);
    _defineProperty(this, "currentChainNamespace", CHAIN_NAMESPACES.EIP155);
    _defineProperty(this, "type", ADAPTER_CATEGORY.EXTERNAL);
    _defineProperty(this, "name", WALLET_ADAPTERS.METAMASK);
    _defineProperty(this, "status", ADAPTER_STATUS.NOT_READY);
    _defineProperty(this, "rehydrated", false);
    _defineProperty(this, "metamaskProvider", null);
    this.chainConfig = adapterOptions.chainConfig || null;
    this.sessionTime = adapterOptions.sessionTime || 86400;
  }
  get provider() {
    if (this.status === ADAPTER_STATUS.CONNECTED && this.metamaskProvider) {
      return this.metamaskProvider;
    }
    return null;
  }
  set provider(_) {
    throw new Error("Not implemented");
  }
  async init(options) {
    super.checkInitializationRequirements();
    this.metamaskProvider = await detectEthereumProvider({
      mustBeMetaMask: true
    });
    if (!this.metamaskProvider)
      throw WalletInitializationError.notInstalled("Metamask extension is not installed");
    this.status = ADAPTER_STATUS.READY;
    this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.METAMASK);
    try {
      log.debug("initializing metamask adapter");
      if (options.autoConnect) {
        this.rehydrated = true;
        await this.connect();
      }
    } catch (error) {
      this.emit(ADAPTER_EVENTS.ERRORED, error);
    }
  }
  setAdapterSettings(options) {
    if (this.status === ADAPTER_STATUS.READY)
      return;
    if (options !== null && options !== void 0 && options.sessionTime) {
      this.sessionTime = options.sessionTime;
    }
  }
  async connect() {
    super.checkConnectionRequirements();
    if (!this.chainConfig)
      this.chainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, 1);
    this.status = ADAPTER_STATUS.CONNECTING;
    this.emit(ADAPTER_EVENTS.CONNECTING, {
      adapter: WALLET_ADAPTERS.METAMASK
    });
    if (!this.metamaskProvider)
      throw WalletLoginError.notConnectedError("Not able to connect with metamask");
    try {
      await this.metamaskProvider.request({
        method: "eth_requestAccounts"
      });
      const {
        chainId
      } = this.metamaskProvider;
      if (chainId !== this.chainConfig.chainId) {
        await this.switchChain(this.chainConfig);
      }
      this.status = ADAPTER_STATUS.CONNECTED;
      if (!this.provider)
        throw WalletLoginError.notConnectedError("Failed to connect with provider");
      this.provider.once("disconnect", () => {
        this.disconnect();
      });
      this.emit(ADAPTER_EVENTS.CONNECTED, {
        adapter: WALLET_ADAPTERS.METAMASK,
        reconnected: this.rehydrated
      });
      return this.provider;
    } catch (error) {
      this.status = ADAPTER_STATUS.READY;
      this.rehydrated = false;
      this.emit(ADAPTER_EVENTS.ERRORED, error);
      throw WalletLoginError.connectionError("Failed to login with metamask wallet");
    }
  }
  async disconnect() {
    var _this$provider;
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
      cleanup: false
    };
    await super.disconnect();
    (_this$provider = this.provider) === null || _this$provider === void 0 ? void 0 : _this$provider.removeAllListeners();
    if (options.cleanup) {
      this.status = ADAPTER_STATUS.NOT_READY;
      this.metamaskProvider = null;
    } else {
      this.status = ADAPTER_STATUS.READY;
    }
    this.rehydrated = false;
    this.emit(ADAPTER_EVENTS.DISCONNECTED);
  }
  async getUserInfo() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet, Please login/connect first");
    return {};
  }
  async switchChain(chainConfig) {
    if (!this.metamaskProvider)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    try {
      await this.metamaskProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{
          chainId: chainConfig.chainId
        }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await this.metamaskProvider.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: chainConfig.chainId,
            chainName: chainConfig.displayName,
            rpcUrls: [chainConfig.rpcTarget]
          }]
        });
      } else {
        throw switchError;
      }
    }
  }
}
export {
  MetamaskAdapter
};
