import { q as loglevel, f as _defineProperty, X as dist, O as getRpcPromiseCallback, Y as BasePostMessageStream, S as SafeEventEmitter, V as ObjectMultiplex, D as pump_1, B as createStreamMiddleware, J as JRPCEngine, F as createIdRemapMiddleware, $ as setAPIKey, m as WALLET_ADAPTERS, i as ADAPTER_NAMESPACES, C as CHAIN_NAMESPACES, p as ADAPTER_CATEGORY, A as ADAPTER_STATUS, h as getChainConfig, l as log$1, k as ADAPTER_EVENTS, W as WalletInitializationError, a0 as Web3AuthError, j as WalletLoginError } from "./base.esm-570dabbe.js";
import { P as PublicKey, T as TorusInjectedProvider } from "./solanaProvider.esm-925e36a1.js";
import { C as COMMUNICATION_JRPC_METHODS, P as PROVIDER_JRPC_METHODS, c as createLoggerMiddleware, a as COMMUNICATION_NOTIFICATIONS, b as PROVIDER_NOTIFICATIONS } from "./baseProvider.esm-dad41c9c.js";
import { f as fastDeepEqual, i as isStream_1 } from "./index-00c36874.js";
import { B as BaseSolanaAdapter } from "./baseSolanaAdapter.esm-11c99679.js";
import "./interopRequireDefault-7e6f3c51.js";
import "./index-2c674280.js";
import "./nacl-fast-4fab9055.js";
import "./_commonjs-dynamic-modules-58f2b0ec.js";
import "./browser-cf62a047.js";
import "./elliptic-f2b24f57.js";
var messages = {
  errors: {
    disconnected: () => "Torus: Lost connection to Torus.",
    permanentlyDisconnected: () => "Torus: Disconnected from iframe. Page reload required.",
    unsupportedSync: (method) => "Torus: The Torus Ethereum provider does not support synchronous methods like ".concat(method, " without a callback parameter."),
    invalidDuplexStream: () => "Must provide a Node.js-style duplex stream.",
    invalidOptions: (maxEventListeners) => "Invalid options. Received: { maxEventListeners: ".concat(maxEventListeners, "}"),
    invalidRequestArgs: () => "Expected a single, non-array, object argument.",
    invalidRequestMethod: () => "'args.method' must be a non-empty string.",
    invalidRequestParams: () => "'args.params' must be an object or array if provided.",
    invalidLoggerObject: () => "'args.logger' must be an object if provided.",
    invalidLoggerMethod: (method) => "'args.logger' must include required method '".concat(method, "'.")
  },
  info: {
    connected: (chainId) => 'Torus: Connected to chain with ID "'.concat(chainId, '".')
  },
  warnings: {}
};
const TORUS_BUILD_ENV = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  TESTING: "testing"
};
const BUTTON_POSITION = {
  BOTTOM_LEFT: "bottom-left",
  TOP_LEFT: "top-left",
  BOTTOM_RIGHT: "bottom-right",
  TOP_RIGHT: "top-right"
};
const LOGIN_PROVIDER = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  REDDIT: "reddit",
  DISCORD: "discord",
  TWITCH: "twitch",
  APPLE: "apple",
  LINE: "line",
  GITHUB: "github",
  KAKAO: "kakao",
  LINKEDIN: "linkedin",
  TWITTER: "twitter",
  WEIBO: "weibo",
  WECHAT: "wechat",
  EMAIL_PASSWORDLESS: "email_passwordless"
};
const translations = {
  en: {
    embed: {
      continue: "Continue",
      actionRequired: "Authorization required",
      pendingAction: "Click continue to proceed with your request in a popup",
      cookiesRequired: "Cookies Required",
      enableCookies: "Please enable cookies in your browser preferences to access Torus",
      clickHere: "More Info"
    }
  },
  de: {
    embed: {
      continue: "Fortsetzen",
      actionRequired: "Autorisierung erforderlich",
      pendingAction: "Klicken Sie in einem Popup auf Weiter, um mit Ihrer Anfrage fortzufahren",
      cookiesRequired: "Cookies benötigt",
      enableCookies: "Bitte aktivieren Sie Cookies in Ihren Browsereinstellungen, um auf Torus zuzugreifen",
      clickHere: "Mehr Info"
    }
  },
  ja: {
    embed: {
      continue: "継続する",
      actionRequired: "認証が必要です",
      pendingAction: "続行をクリックして、ポップアップでリクエストを続行します",
      cookiesRequired: "必要なクッキー",
      enableCookies: "Torusにアクセスするには、ブラウザの設定でCookieを有効にしてください。",
      clickHere: "詳しくは"
    }
  },
  ko: {
    embed: {
      continue: "계속하다",
      actionRequired: "승인 필요",
      pendingAction: "팝업에서 요청을 진행하려면 계속을 클릭하십시오.",
      cookiesRequired: "쿠키 필요",
      enableCookies: "브라우저 환경 설정에서 쿠키를 활성화하여 Torus에 액세스하십시오.",
      clickHere: "더 많은 정보"
    }
  },
  zh: {
    embed: {
      continue: "继续",
      actionRequired: "需要授权",
      pendingAction: "单击继续以在弹出窗口中继续您的请求",
      cookiesRequired: "必填Cookie",
      enableCookies: "请在您的浏览器首选项中启用cookie以访问Torus。",
      clickHere: "更多信息"
    }
  }
};
var configuration = {
  supportedVerifierList: [LOGIN_PROVIDER.GOOGLE, LOGIN_PROVIDER.REDDIT, LOGIN_PROVIDER.DISCORD],
  api: "https://api.tor.us",
  translations,
  prodTorusUrl: "",
  localStorageKey: "torus-".concat(window.location.hostname)
};
var log = loglevel.getLogger("solana-embed");
function createErrorMiddleware() {
  return (req, res, next) => {
    if (typeof req.method !== "string" || !req.method) {
      res.error = dist.ethErrors.rpc.invalidRequest({
        message: "The request 'method' must be a non-empty string.",
        data: req
      });
    }
    next((done) => {
      const {
        error
      } = res;
      if (!error) {
        return done();
      }
      log.error("Torus - RPC Error: ".concat(error.message), error);
      return done();
    });
  };
}
function logStreamDisconnectWarning(remoteLabel, error, emitter) {
  let warningMsg = 'Torus: Lost connection to "'.concat(remoteLabel, '".');
  if (error !== null && error !== void 0 && error.stack) {
    warningMsg += "\n".concat(error.stack);
  }
  log.warn(warningMsg);
  if (emitter && emitter.listenerCount("error") > 0) {
    emitter.emit("error", warningMsg);
  }
}
const getWindowId = () => Math.random().toString(36).slice(2);
const getTorusUrl = async (buildEnv) => {
  let torusUrl;
  let logLevel;
  switch (buildEnv) {
    case "testing":
      torusUrl = "https://solana-testing.tor.us";
      logLevel = "debug";
      break;
    case "development":
      torusUrl = "http://localhost:8080";
      logLevel = "debug";
      break;
    default:
      torusUrl = "https://solana.tor.us";
      logLevel = "error";
      break;
  }
  return {
    torusUrl,
    logLevel
  };
};
const getUserLanguage = () => {
  let userLanguage = window.navigator.language || "en-US";
  const userLanguages = userLanguage.split("-");
  userLanguage = Object.prototype.hasOwnProperty.call(configuration.translations, userLanguages[0]) ? userLanguages[0] : "en";
  return userLanguage;
};
const FEATURES_PROVIDER_CHANGE_WINDOW = {
  height: 660,
  width: 375
};
const FEATURES_DEFAULT_WALLET_WINDOW = {
  height: 740,
  width: 1315
};
const FEATURES_DEFAULT_POPUP_WINDOW = {
  height: 700,
  width: 1200
};
const FEATURES_CONFIRM_WINDOW = {
  height: 600,
  width: 400
};
function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e && // everything except Firefox
    (e.code === 22 || // Firefox
    e.code === 1014 || // test name field too, because code might not be present
    // everything except Firefox
    e.name === "QuotaExceededError" || // Firefox
    e.name === "NS_ERROR_DOM_QUOTA_REACHED") && // acknowledge QuotaExceededError only if there's something already stored
    storage && storage.length !== 0;
  }
}
function getPopupFeatures(_ref) {
  let {
    width: w,
    height: h
  } = _ref;
  const dualScreenLeft = window.screenLeft !== void 0 ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== void 0 ? window.screenTop : window.screenY;
  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;
  const systemZoom = 1;
  const left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
  const top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
  const features = "titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=".concat(h / systemZoom, ",width=").concat(w / systemZoom, ",top=").concat(top, ",left=").concat(left);
  return features;
}
class BaseProvider extends SafeEventEmitter {
  /**
   * Indicating that this provider is a Torus provider.
   */
  constructor(connectionStream, _ref) {
    let {
      maxEventListeners = 100,
      jsonRpcStreamName = "provider"
    } = _ref;
    super();
    _defineProperty(this, "isTorus", void 0);
    _defineProperty(this, "_rpcEngine", void 0);
    _defineProperty(this, "jsonRpcConnectionEvents", void 0);
    _defineProperty(this, "_state", void 0);
    if (!isStream_1.duplex(connectionStream)) {
      throw new Error(messages.errors.invalidDuplexStream());
    }
    this.isTorus = true;
    this.setMaxListeners(maxEventListeners);
    this._handleConnect = this._handleConnect.bind(this);
    this._handleDisconnect = this._handleDisconnect.bind(this);
    this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this);
    this._rpcRequest = this._rpcRequest.bind(this);
    this._initializeState = this._initializeState.bind(this);
    this.request = this.request.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
    const mux = new ObjectMultiplex();
    pump_1(connectionStream, mux, connectionStream, this._handleStreamDisconnect.bind(this, "Torus"));
    mux.ignoreStream("phishing");
    const jsonRpcConnection = createStreamMiddleware();
    pump_1(jsonRpcConnection.stream, mux.createStream(jsonRpcStreamName), jsonRpcConnection.stream, this._handleStreamDisconnect.bind(this, "Torus RpcProvider"));
    const rpcEngine = new JRPCEngine();
    rpcEngine.push(createIdRemapMiddleware());
    rpcEngine.push(createErrorMiddleware());
    rpcEngine.push(createLoggerMiddleware({
      origin: location.origin
    }));
    rpcEngine.push(jsonRpcConnection.middleware);
    this._rpcEngine = rpcEngine;
    this.jsonRpcConnectionEvents = jsonRpcConnection.events;
  }
  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   */
  async request(args) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw dist.ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args
      });
    }
    const {
      method,
      params
    } = args;
    if (typeof method !== "string" || method.length === 0) {
      throw dist.ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args
      });
    }
    if (params !== void 0 && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
      throw dist.ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestParams(),
        data: args
      });
    }
    return new Promise((resolve, reject) => {
      this._rpcRequest({
        method,
        params
      }, getRpcPromiseCallback(resolve, reject));
    });
  }
  /**
   * Submits an RPC request per the given JSON-RPC request object.
   */
  send(payload, callback) {
    this._rpcRequest(payload, callback);
  }
  /**
   * Submits an RPC request per the given JSON-RPC request object.
   */
  sendAsync(payload) {
    return new Promise((resolve, reject) => {
      this._rpcRequest(payload, getRpcPromiseCallback(resolve, reject));
    });
  }
  /**
   * Called when connection is lost to critical streams.
   *
   * emits TorusInpageProvider#disconnect
   */
  _handleStreamDisconnect(streamName, error) {
    logStreamDisconnectWarning(streamName, error, this);
    this._handleDisconnect(false, error ? error.message : void 0);
  }
}
const handleEvent = function(handle, eventName, handler) {
  for (var _len = arguments.length, handlerArgs = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    handlerArgs[_key - 3] = arguments[_key];
  }
  const handlerWrapper = () => {
    handler(...handlerArgs);
    handle.removeEventListener(eventName, handlerWrapper);
  };
  handle.addEventListener(eventName, handlerWrapper);
};
async function documentReady() {
  return new Promise((resolve) => {
    if (document.readyState !== "loading") {
      resolve();
    } else {
      handleEvent(document, "DOMContentLoaded", resolve);
    }
  });
}
const htmlToElement = (html) => {
  const template = window.document.createElement("template");
  const trimmedHtml = html.trim();
  template.innerHTML = trimmedHtml;
  return template.content.firstChild;
};
class PopupHandler extends SafeEventEmitter {
  constructor(_ref) {
    let {
      url,
      target,
      features
    } = _ref;
    super();
    _defineProperty(this, "url", void 0);
    _defineProperty(this, "target", void 0);
    _defineProperty(this, "features", void 0);
    _defineProperty(this, "window", void 0);
    _defineProperty(this, "windowTimer", void 0);
    _defineProperty(this, "iClosedWindow", void 0);
    this.url = url;
    this.target = target || "_blank";
    this.features = features || getPopupFeatures(FEATURES_DEFAULT_POPUP_WINDOW);
    this.window = void 0;
    this.windowTimer = void 0;
    this.iClosedWindow = false;
    this._setupTimer();
  }
  _setupTimer() {
    this.windowTimer = Number(setInterval(() => {
      if (this.window && this.window.closed) {
        clearInterval(this.windowTimer);
        if (!this.iClosedWindow) {
          this.emit("close");
        }
        this.iClosedWindow = false;
        this.window = void 0;
      }
      if (this.window === void 0)
        clearInterval(this.windowTimer);
    }, 500));
  }
  open() {
    var _this$window;
    this.window = window.open(this.url.href, this.target, this.features);
    if ((_this$window = this.window) !== null && _this$window !== void 0 && _this$window.focus)
      this.window.focus();
    return Promise.resolve();
  }
  close() {
    this.iClosedWindow = true;
    if (this.window)
      this.window.close();
  }
  redirect(locationReplaceOnRedirect) {
    if (locationReplaceOnRedirect) {
      window.location.replace(this.url.href);
    } else {
      window.location.href = this.url.href;
    }
  }
}
function ownKeys$2(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$2(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$2(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
class TorusCommunicationProvider extends BaseProvider {
  constructor(connectionStream, _ref) {
    let {
      maxEventListeners = 100,
      jsonRpcStreamName = "provider"
    } = _ref;
    super(connectionStream, {
      maxEventListeners,
      jsonRpcStreamName
    });
    _defineProperty(this, "embedTranslations", void 0);
    _defineProperty(this, "torusUrl", void 0);
    _defineProperty(this, "dappStorageKey", void 0);
    _defineProperty(this, "windowRefs", void 0);
    _defineProperty(this, "tryWindowHandle", void 0);
    _defineProperty(this, "torusAlertContainer", void 0);
    _defineProperty(this, "torusIframe", void 0);
    this._state = _objectSpread$2({}, TorusCommunicationProvider._defaultState);
    this.torusUrl = "";
    this.dappStorageKey = "";
    const languageTranslations = configuration.translations[getUserLanguage()];
    this.embedTranslations = languageTranslations.embed;
    this.windowRefs = {};
    this.on("connect", () => {
      this._state.isConnected = true;
    });
    const notificationHandler = (payload) => {
      const {
        method,
        params
      } = payload;
      if (method === COMMUNICATION_NOTIFICATIONS.IFRAME_STATUS) {
        const {
          isFullScreen,
          rid
        } = params;
        this._displayIframe({
          isFull: isFullScreen,
          rid
        });
      } else if (method === COMMUNICATION_NOTIFICATIONS.CREATE_WINDOW) {
        const {
          windowId,
          url
        } = params;
        this._createPopupBlockAlert(windowId, url);
      } else if (method === COMMUNICATION_NOTIFICATIONS.CLOSE_WINDOW) {
        this._handleCloseWindow(params);
      } else if (method === COMMUNICATION_NOTIFICATIONS.USER_LOGGED_IN) {
        const {
          currentLoginProvider
        } = params;
        this._state.isLoggedIn = true;
        this._state.currentLoginProvider = currentLoginProvider;
      } else if (method === COMMUNICATION_NOTIFICATIONS.USER_LOGGED_OUT) {
        this._state.isLoggedIn = false;
        this._state.currentLoginProvider = null;
        this._displayIframe();
      }
    };
    this.jsonRpcConnectionEvents.on("notification", notificationHandler);
  }
  get isLoggedIn() {
    return this._state.isLoggedIn;
  }
  get isIFrameFullScreen() {
    return this._state.isIFrameFullScreen;
  }
  /**
   * Returns whether the inPage provider is connected to Torus.
   */
  isConnected() {
    return this._state.isConnected;
  }
  async _initializeState(params) {
    try {
      const {
        torusUrl,
        dappStorageKey,
        torusAlertContainer,
        torusIframe
      } = params;
      this.torusUrl = torusUrl;
      this.dappStorageKey = dappStorageKey;
      this.torusAlertContainer = torusAlertContainer;
      this.torusIframe = torusIframe;
      this.torusIframe.addEventListener("load", () => {
        if (!this._state.isIFrameFullScreen)
          this._displayIframe();
      });
      const {
        currentLoginProvider,
        isLoggedIn
      } = await this.request({
        method: COMMUNICATION_JRPC_METHODS.GET_PROVIDER_STATE,
        params: []
      });
      this._handleConnect(currentLoginProvider, isLoggedIn);
    } catch (error) {
      log.error("Torus: Failed to get initial state. Please report this bug.", error);
    } finally {
      log.info("initialized communication state");
      this._state.initialized = true;
      this.emit("_initialized");
    }
  }
  _handleWindow(windowId) {
    let {
      url,
      target,
      features
    } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const finalUrl = new URL(url || "".concat(this.torusUrl, "/redirect?windowId=").concat(windowId));
    if (this.dappStorageKey) {
      if (finalUrl.hash)
        finalUrl.hash += "&dappStorageKey=".concat(this.dappStorageKey);
      else
        finalUrl.hash = "#dappStorageKey=".concat(this.dappStorageKey);
    }
    const handledWindow = new PopupHandler({
      url: finalUrl,
      target,
      features
    });
    handledWindow.open();
    if (!handledWindow.window) {
      this._createPopupBlockAlert(windowId, finalUrl.href);
      return;
    }
    this.windowRefs[windowId] = handledWindow;
    this.request({
      method: COMMUNICATION_JRPC_METHODS.OPENED_WINDOW,
      params: {
        windowId
      }
    });
    handledWindow.once("close", () => {
      delete this.windowRefs[windowId];
      this.request({
        method: COMMUNICATION_JRPC_METHODS.CLOSED_WINDOW,
        params: {
          windowId
        }
      });
    });
  }
  _displayIframe() {
    let {
      isFull = false,
      rid = ""
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const style = {};
    if (!isFull) {
      style.display = this._state.torusWidgetVisibility ? "block" : "none";
      style.height = "70px";
      style.width = "70px";
      switch (this._state.buttonPosition) {
        case BUTTON_POSITION.TOP_LEFT:
          style.top = "0px";
          style.left = "0px";
          style.right = "auto";
          style.bottom = "auto";
          break;
        case BUTTON_POSITION.TOP_RIGHT:
          style.top = "0px";
          style.right = "0px";
          style.left = "auto";
          style.bottom = "auto";
          break;
        case BUTTON_POSITION.BOTTOM_RIGHT:
          style.bottom = "0px";
          style.right = "0px";
          style.top = "auto";
          style.left = "auto";
          break;
        case BUTTON_POSITION.BOTTOM_LEFT:
        default:
          style.bottom = "0px";
          style.left = "0px";
          style.top = "auto";
          style.right = "auto";
          break;
      }
    } else {
      style.display = "block";
      style.width = "100%";
      style.height = "100%";
      style.top = "0px";
      style.right = "0px";
      style.left = "0px";
      style.bottom = "0px";
    }
    Object.assign(this.torusIframe.style, style);
    this._state.isIFrameFullScreen = isFull;
    this.request({
      method: COMMUNICATION_JRPC_METHODS.IFRAME_STATUS,
      params: {
        isIFrameFullScreen: isFull,
        rid
      }
    });
  }
  hideTorusButton() {
    this._state.torusWidgetVisibility = false;
    this._displayIframe();
  }
  showTorusButton() {
    this._state.torusWidgetVisibility = true;
    this._displayIframe();
  }
  /**
   * Internal RPC method. Forwards requests to background via the RPC engine.
   * Also remap ids inbound and outbound
   */
  _rpcRequest(payload, callback) {
    const cb = callback;
    const _payload = payload;
    if (!Array.isArray(_payload)) {
      if (!_payload.jsonrpc) {
        _payload.jsonrpc = "2.0";
      }
    }
    this.tryWindowHandle(_payload, cb);
  }
  /**
   * When the provider becomes connected, updates internal state and emits
   * required events. Idempotent.
   *
   * @param currentLoginProvider - The login Provider
   * emits TorusInpageProvider#connect
   */
  _handleConnect(currentLoginProvider, isLoggedIn) {
    if (!this._state.isConnected) {
      this._state.isConnected = true;
      this.emit("connect", {
        currentLoginProvider,
        isLoggedIn
      });
      log.debug(messages.info.connected(currentLoginProvider));
    }
  }
  /**
   * When the provider becomes disconnected, updates internal state and emits
   * required events. Idempotent with respect to the isRecoverable parameter.
   *
   * Error codes per the CloseEvent status codes as required by EIP-1193:
   * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
   *
   * @param isRecoverable - Whether the disconnection is recoverable.
   * @param errorMessage - A custom error message.
   * emits TorusInpageProvider#disconnect
   */
  _handleDisconnect(isRecoverable, errorMessage) {
    if (this._state.isConnected || !this._state.isPermanentlyDisconnected && !isRecoverable) {
      this._state.isConnected = false;
      let error;
      if (isRecoverable) {
        error = new dist.EthereumRpcError(
          1013,
          // Try again later
          errorMessage || messages.errors.disconnected()
        );
        log.debug(error);
      } else {
        error = new dist.EthereumRpcError(
          1011,
          // Internal error
          errorMessage || messages.errors.permanentlyDisconnected()
        );
        log.error(error);
        this._state.currentLoginProvider = null;
        this._state.isLoggedIn = false;
        this._state.torusWidgetVisibility = false;
        this._state.isIFrameFullScreen = false;
        this._state.isPermanentlyDisconnected = true;
      }
      this.emit("disconnect", error);
    }
  }
  // Called if the iframe wants to close the window cause it is done processing the request
  _handleCloseWindow(params) {
    const {
      windowId
    } = params;
    if (this.windowRefs[windowId]) {
      this.windowRefs[windowId].close();
      delete this.windowRefs[windowId];
    }
  }
  async _createPopupBlockAlert(windowId, url) {
    const logoUrl = this.getLogoUrl();
    const torusAlert = htmlToElement('<div id="torusAlert" class="torus-alert--v2">' + '<div id="torusAlert__logo"><img src="'.concat(logoUrl, '" /></div>') + "<div>" + '<h1 id="torusAlert__title">'.concat(this.embedTranslations.actionRequired, "</h1>") + '<p id="torusAlert__desc">'.concat(this.embedTranslations.pendingAction, "</p>") + "</div></div>");
    const successAlert = htmlToElement('<div><a id="torusAlert__btn">'.concat(this.embedTranslations.continue, "</a></div>"));
    const btnContainer = htmlToElement('<div id="torusAlert__btn-container"></div>');
    btnContainer.appendChild(successAlert);
    torusAlert.appendChild(btnContainer);
    const bindOnLoad = () => {
      successAlert.addEventListener("click", () => {
        this._handleWindow(windowId, {
          url,
          target: "_blank",
          features: getPopupFeatures(FEATURES_CONFIRM_WINDOW)
        });
        torusAlert.remove();
        if (this.torusAlertContainer.children.length === 0)
          this.torusAlertContainer.style.display = "none";
      });
    };
    const attachOnLoad = () => {
      this.torusAlertContainer.appendChild(torusAlert);
    };
    await documentReady();
    attachOnLoad();
    bindOnLoad();
    this.torusAlertContainer.style.display = "block";
  }
  getLogoUrl() {
    const logoUrl = "".concat(this.torusUrl, "/images/torus_icon-blue.svg");
    return logoUrl;
  }
}
_defineProperty(TorusCommunicationProvider, "_defaultState", {
  buttonPosition: "bottom-left",
  currentLoginProvider: null,
  isIFrameFullScreen: false,
  hasEmittedConnection: false,
  torusWidgetVisibility: false,
  initialized: false,
  isLoggedIn: false,
  isPermanentlyDisconnected: false,
  isConnected: false
});
function ownKeys$1(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$1(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$1(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
class TorusInPageProvider extends BaseProvider {
  /**
   * The chain ID of the currently connected Solana chain.
   * See [chainId.network]{@link https://chainid.network} for more information.
   */
  /**
   * The user's currently selected Solana address.
   * If null, Torus is either locked or the user has not permitted any
   * addresses to be viewed.
   */
  constructor(connectionStream, _ref) {
    let {
      maxEventListeners = 100,
      jsonRpcStreamName = "provider"
    } = _ref;
    super(connectionStream, {
      maxEventListeners,
      jsonRpcStreamName
    });
    _defineProperty(this, "chainId", void 0);
    _defineProperty(this, "selectedAddress", void 0);
    _defineProperty(this, "tryWindowHandle", void 0);
    this._state = _objectSpread$1({}, TorusInPageProvider._defaultState);
    this.selectedAddress = null;
    this.chainId = null;
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
    this._handleChainChanged = this._handleChainChanged.bind(this);
    this._handleUnlockStateChanged = this._handleUnlockStateChanged.bind(this);
    this.on("connect", () => {
      this._state.isConnected = true;
    });
    const jsonRpcNotificationHandler = (payload) => {
      const {
        method,
        params
      } = payload;
      if (method === PROVIDER_NOTIFICATIONS.ACCOUNTS_CHANGED) {
        this._handleAccountsChanged(params);
      } else if (method === PROVIDER_NOTIFICATIONS.UNLOCK_STATE_CHANGED) {
        this._handleUnlockStateChanged(params);
      } else if (method === PROVIDER_NOTIFICATIONS.CHAIN_CHANGED) {
        this._handleChainChanged(params);
      }
    };
    this.jsonRpcConnectionEvents.on("notification", jsonRpcNotificationHandler);
  }
  /**
   * Returns whether the inpage provider is connected to Torus.
   */
  isConnected() {
    return this._state.isConnected;
  }
  // Private Methods
  //= ===================
  /**
   * Constructor helper.
   * Populates initial state by calling 'wallet_getProviderState' and emits
   * necessary events.
   */
  async _initializeState() {
    try {
      const {
        accounts,
        chainId,
        isUnlocked
      } = await this.request({
        method: PROVIDER_JRPC_METHODS.GET_PROVIDER_STATE,
        params: []
      });
      this.emit("connect", {
        chainId
      });
      this._handleChainChanged({
        chainId
      });
      this._handleUnlockStateChanged({
        accounts,
        isUnlocked
      });
      this._handleAccountsChanged(accounts);
    } catch (error) {
      log.error("Torus: Failed to get initial state. Please report this bug.", error);
    } finally {
      log.info("initialized provider state");
      this._state.initialized = true;
      this.emit("_initialized");
    }
  }
  /**
   * Internal RPC method. Forwards requests to background via the RPC engine.
   * Also remap ids inbound and outbound
   */
  _rpcRequest(payload, callback) {
    let isInternal = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    let cb = callback;
    const _payload = payload;
    if (!Array.isArray(_payload)) {
      if (!_payload.jsonrpc) {
        _payload.jsonrpc = "2.0";
      }
      if (_payload.method === "solana_accounts" || _payload.method === "solana_requestAccounts") {
        cb = (err, res) => {
          this._handleAccountsChanged(res.result || [], _payload.method === "solana_accounts", isInternal);
          callback(err, res);
        };
      } else if (_payload.method === "wallet_getProviderState") {
        this._rpcEngine.handle(payload, cb);
        return;
      }
    }
    this.tryWindowHandle(_payload, cb);
  }
  /**
   * When the provider becomes connected, updates internal state and emits
   * required events. Idempotent.
   *
   * @param chainId - The ID of the newly connected chain.
   * emits TorusInpageProvider#connect
   */
  _handleConnect(chainId) {
    if (!this._state.isConnected) {
      this._state.isConnected = true;
      this.emit("connect", {
        chainId
      });
      log.debug(messages.info.connected(chainId));
    }
  }
  /**
   * When the provider becomes disconnected, updates internal state and emits
   * required events. Idempotent with respect to the isRecoverable parameter.
   *
   * Error codes per the CloseEvent status codes as required by EIP-1193:
   * https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
   *
   * @param isRecoverable - Whether the disconnection is recoverable.
   * @param errorMessage - A custom error message.
   * emits TorusInpageProvider#disconnect
   */
  _handleDisconnect(isRecoverable, errorMessage) {
    if (this._state.isConnected || !this._state.isPermanentlyDisconnected && !isRecoverable) {
      this._state.isConnected = false;
      let error;
      if (isRecoverable) {
        error = new dist.EthereumRpcError(
          1013,
          // Try again later
          errorMessage || messages.errors.disconnected()
        );
        log.debug(error);
      } else {
        error = new dist.EthereumRpcError(
          1011,
          // Internal error
          errorMessage || messages.errors.permanentlyDisconnected()
        );
        log.error(error);
        this.chainId = null;
        this._state.accounts = null;
        this.selectedAddress = null;
        this._state.isUnlocked = false;
        this._state.isPermanentlyDisconnected = true;
      }
      this.emit("disconnect", error);
    }
  }
  /**
   * Called when accounts may have changed.
   */
  _handleAccountsChanged(accounts) {
    let isEthAccounts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    let isInternal = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    let finalAccounts = accounts;
    if (!Array.isArray(finalAccounts)) {
      log.error("Torus: Received non-array accounts parameter. Please report this bug.", finalAccounts);
      finalAccounts = [];
    }
    for (const account of accounts) {
      if (typeof account !== "string") {
        log.error("Torus: Received non-string account. Please report this bug.", accounts);
        finalAccounts = [];
        break;
      }
    }
    if (!fastDeepEqual(this._state.accounts, finalAccounts)) {
      if (isEthAccounts && Array.isArray(this._state.accounts) && this._state.accounts.length > 0 && !isInternal) {
        log.error('Torus: "solana_accounts" unexpectedly updated accounts. Please report this bug.', finalAccounts);
      }
      this._state.accounts = finalAccounts;
      this.emit("accountsChanged", finalAccounts);
    }
    if (this.selectedAddress !== finalAccounts[0]) {
      this.selectedAddress = finalAccounts[0] || null;
    }
  }
  /**
   * Upon receipt of a new chainId and networkVersion, emits corresponding
   * events and sets relevant public state.
   * Does nothing if neither the chainId nor the networkVersion are different
   * from existing values.
   *
   * emits TorusInpageProvider#chainChanged
   * @param networkInfo - An object with network info.
   */
  _handleChainChanged() {
    let {
      chainId
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!chainId) {
      log.error("Torus: Received invalid network parameters. Please report this bug.", {
        chainId
      });
      return;
    }
    if (chainId === "loading") {
      this._handleDisconnect(true);
    } else {
      this._handleConnect(chainId);
      if (chainId !== this.chainId) {
        this.chainId = chainId;
        if (this._state.initialized) {
          this.emit("chainChanged", this.chainId);
        }
      }
    }
  }
  /**
   * Upon receipt of a new isUnlocked state, sets relevant public state.
   * Calls the accounts changed handler with the received accounts, or an empty
   * array.
   *
   * Does nothing if the received value is equal to the existing value.
   * There are no lock/unlock events.
   *
   * @param opts - Options bag.
   */
  _handleUnlockStateChanged() {
    let {
      accounts,
      isUnlocked
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (typeof isUnlocked !== "boolean") {
      log.error("Torus: Received invalid isUnlocked parameter. Please report this bug.", {
        isUnlocked
      });
      return;
    }
    if (isUnlocked !== this._state.isUnlocked) {
      this._state.isUnlocked = isUnlocked;
      this._handleAccountsChanged(accounts || []);
    }
  }
}
_defineProperty(TorusInPageProvider, "_defaultState", {
  accounts: null,
  isConnected: false,
  isUnlocked: false,
  initialized: false,
  isPermanentlyDisconnected: false,
  hasEmittedConnection: false
});
function imgExists(url) {
  return new Promise((resolve, reject) => {
    try {
      const img = document.createElement("img");
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } catch (e) {
      reject(e);
    }
  });
}
const getSiteName = (window2) => {
  const {
    document: document2
  } = window2;
  const siteName = document2.querySelector('head > meta[property="og:site_name"]');
  if (siteName) {
    return siteName.content;
  }
  const metaTitle = document2.querySelector('head > meta[name="title"]');
  if (metaTitle) {
    return metaTitle.content;
  }
  if (document2.title && document2.title.length > 0) {
    return document2.title;
  }
  return window2.location.hostname;
};
async function getSiteIcon(window2) {
  try {
    const {
      document: document2
    } = window2;
    let icon = document2.querySelector('head > link[rel="shortcut icon"]');
    if (icon && await imgExists(icon.href)) {
      return icon.href;
    }
    icon = Array.from(document2.querySelectorAll('head > link[rel="icon"]')).find((_icon) => Boolean(_icon.href));
    if (icon && await imgExists(icon.href)) {
      return icon.href;
    }
    return "";
  } catch (error) {
    return "";
  }
}
const getSiteMetadata = async () => ({
  name: getSiteName(window),
  icon: await getSiteIcon(window)
});
function ownKeys$3(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread$3(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys$3(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$3(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
const {
  version
} = require("../package.json");
const PROVIDER_UNSAFE_METHODS = ["send_transaction", "sign_transaction", "sign_all_transactions", "sign_message", "connect"];
const COMMUNICATION_UNSAFE_METHODS = [COMMUNICATION_JRPC_METHODS.SET_PROVIDER];
const isLocalStorageAvailable = storageAvailable("localStorage");
(async function preLoadIframe() {
  try {
    if (typeof document === "undefined")
      return;
    const torusIframeHtml = document.createElement("link");
    const {
      torusUrl
    } = await getTorusUrl("production");
    torusIframeHtml.href = "".concat(torusUrl, "/frame");
    torusIframeHtml.crossOrigin = "anonymous";
    torusIframeHtml.type = "text/html";
    torusIframeHtml.rel = "prefetch";
    if (torusIframeHtml.relList && torusIframeHtml.relList.supports) {
      if (torusIframeHtml.relList.supports("prefetch")) {
        document.head.appendChild(torusIframeHtml);
      }
    }
  } catch (error) {
    log.warn(error);
  }
})();
class Torus {
  constructor() {
    let {
      modalZIndex = 99999
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _defineProperty(this, "isInitialized", void 0);
    _defineProperty(this, "torusAlert", void 0);
    _defineProperty(this, "modalZIndex", void 0);
    _defineProperty(this, "alertZIndex", void 0);
    _defineProperty(this, "requestedLoginProvider", void 0);
    _defineProperty(this, "provider", void 0);
    _defineProperty(this, "communicationProvider", void 0);
    _defineProperty(this, "dappStorageKey", void 0);
    _defineProperty(this, "torusAlertContainer", void 0);
    _defineProperty(this, "torusUrl", void 0);
    _defineProperty(this, "torusIframe", void 0);
    _defineProperty(this, "styleLink", void 0);
    this.torusUrl = "";
    this.isInitialized = false;
    this.requestedLoginProvider = null;
    this.modalZIndex = modalZIndex;
    this.alertZIndex = modalZIndex + 1e3;
    this.dappStorageKey = "";
  }
  get isLoggedIn() {
    if (!this.communicationProvider)
      return false;
    return this.communicationProvider.isLoggedIn;
  }
  async init() {
    let {
      buildEnv = TORUS_BUILD_ENV.PRODUCTION,
      enableLogging = false,
      network,
      showTorusButton = false,
      useLocalStorage = false,
      buttonPosition = BUTTON_POSITION.BOTTOM_LEFT,
      apiKey = "torus-default",
      extraParams = {}
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (this.isInitialized)
      throw new Error("Already initialized");
    setAPIKey(apiKey);
    const {
      torusUrl,
      logLevel
    } = await getTorusUrl(buildEnv);
    log.enableAll();
    log.info(torusUrl, "url loaded");
    log.info("Solana Embed Version :".concat(version));
    this.torusUrl = torusUrl;
    log.setDefaultLevel(logLevel);
    if (enableLogging)
      log.enableAll();
    else
      log.disableAll();
    const dappStorageKey = this.handleDappStorageKey(useLocalStorage);
    const torusIframeUrl = new URL(torusUrl);
    if (torusIframeUrl.pathname.endsWith("/"))
      torusIframeUrl.pathname += "frame";
    else
      torusIframeUrl.pathname += "/frame";
    const hashParams = new URLSearchParams();
    if (dappStorageKey)
      hashParams.append("dappStorageKey", dappStorageKey);
    hashParams.append("origin", window.location.origin);
    torusIframeUrl.hash = hashParams.toString();
    this.torusIframe = htmlToElement('<iframe\n        id="torusIframe"\n        class="torusIframe"\n        src="'.concat(torusIframeUrl.href, '"\n        style="display: none; position: fixed; top: 0; right: 0; width: 100%;\n        height: 100%; border: none; border-radius: 0; z-index: ').concat(this.modalZIndex.toString(), '"\n      ></iframe>'));
    this.torusAlertContainer = htmlToElement('<div id="torusAlertContainer" style="display:none; z-index: '.concat(this.alertZIndex.toString(), '"></div>'));
    this.styleLink = htmlToElement('<link href="'.concat(torusUrl, '/css/widget.css" rel="stylesheet" type="text/css">'));
    const handleSetup = async () => {
      return new Promise((resolve, reject) => {
        try {
          window.document.head.appendChild(this.styleLink);
          window.document.body.appendChild(this.torusIframe);
          window.document.body.appendChild(this.torusAlertContainer);
          this.torusIframe.addEventListener("load", async () => {
            const dappMetadata = await getSiteMetadata();
            this.torusIframe.contentWindow.postMessage({
              buttonPosition,
              apiKey,
              network,
              dappMetadata,
              extraParams
            }, torusIframeUrl.origin);
            await this._setupWeb3({
              torusUrl
            });
            if (showTorusButton)
              this.showTorusButton();
            else
              this.hideTorusButton();
            this.isInitialized = true;
            window.torus = this;
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    };
    await documentReady();
    await handleSetup();
  }
  async login() {
    let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!this.isInitialized)
      throw new Error("Call init() first");
    try {
      this.requestedLoginProvider = params.loginProvider || null;
      if (!this.requestedLoginProvider) {
        this.communicationProvider._displayIframe({
          isFull: true
        });
      }
      const res = await new Promise((resolve, reject) => {
        this.provider._rpcRequest({
          method: "solana_requestAccounts",
          params: [this.requestedLoginProvider, params.login_hint]
        }, getRpcPromiseCallback(resolve, reject));
      });
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
      throw new Error("Login failed");
    } catch (error) {
      log.error("login failed", error);
      throw error;
    } finally {
      if (this.communicationProvider.isIFrameFullScreen)
        this.communicationProvider._displayIframe();
    }
  }
  async loginWithPrivateKey(loginParams) {
    if (!this.isInitialized)
      throw new Error("Call init() first");
    const {
      privateKey,
      userInfo
    } = loginParams;
    const {
      success
    } = await this.communicationProvider.request({
      method: "login_with_private_key",
      params: {
        privateKey,
        userInfo
      }
    });
    if (!success)
      throw new Error("Login Failed");
  }
  async logout() {
    if (!this.communicationProvider.isLoggedIn)
      throw new Error("Not logged in");
    await this.communicationProvider.request({
      method: COMMUNICATION_JRPC_METHODS.LOGOUT,
      params: []
    });
    this.requestedLoginProvider = null;
  }
  async cleanUp() {
    if (this.communicationProvider.isLoggedIn) {
      await this.logout();
    }
    this.clearInit();
  }
  clearInit() {
    function isElement(element) {
      return element instanceof Element || element instanceof Document;
    }
    if (isElement(this.styleLink) && window.document.body.contains(this.styleLink)) {
      this.styleLink.remove();
      this.styleLink = void 0;
    }
    if (isElement(this.torusIframe) && window.document.body.contains(this.torusIframe)) {
      this.torusIframe.remove();
      this.torusIframe = void 0;
    }
    if (isElement(this.torusAlertContainer) && window.document.body.contains(this.torusAlertContainer)) {
      this.torusAlert = void 0;
      this.torusAlertContainer.remove();
      this.torusAlertContainer = void 0;
    }
    this.isInitialized = false;
  }
  hideTorusButton() {
    this.communicationProvider.hideTorusButton();
  }
  showTorusButton() {
    this.communicationProvider.showTorusButton();
  }
  async setProvider(params) {
    await this.communicationProvider.request({
      method: COMMUNICATION_JRPC_METHODS.SET_PROVIDER,
      params: _objectSpread$3({}, params)
    });
  }
  async showWallet(path) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const instanceId = await this.communicationProvider.request({
      method: COMMUNICATION_JRPC_METHODS.WALLET_INSTANCE_ID,
      params: []
    });
    const finalPath = path ? "/".concat(path) : "";
    const finalUrl = new URL("".concat(this.torusUrl, "/wallet").concat(finalPath));
    finalUrl.searchParams.append("instanceId", instanceId);
    Object.keys(params).forEach((x) => {
      finalUrl.searchParams.append(x, params[x]);
    });
    if (this.dappStorageKey) {
      finalUrl.hash = "#dappStorageKey=".concat(this.dappStorageKey);
    }
    const walletWindow = new PopupHandler({
      url: finalUrl,
      features: getPopupFeatures(FEATURES_DEFAULT_WALLET_WINDOW)
    });
    walletWindow.open();
  }
  async getUserInfo() {
    const userInfoResponse = await this.communicationProvider.request({
      method: COMMUNICATION_JRPC_METHODS.USER_INFO,
      params: []
    });
    return userInfoResponse;
  }
  async initiateTopup(provider, params) {
    if (!this.isInitialized)
      throw new Error("Torus is not initialized");
    const windowId = getWindowId();
    this.communicationProvider._handleWindow(windowId);
    const topupResponse = await this.communicationProvider.request({
      method: COMMUNICATION_JRPC_METHODS.TOPUP,
      params: {
        provider,
        params,
        windowId
      }
    });
    return topupResponse;
  }
  // Solana specific API
  async getAccounts() {
    const response = await this.provider.request({
      method: "getAccounts",
      params: []
    });
    return response;
  }
  async sendTransaction(transaction) {
    const response = await this.provider.request({
      method: "send_transaction",
      params: {
        message: transaction.serialize({
          requireAllSignatures: false
        }).toString("hex")
      }
    });
    return response;
  }
  async signTransaction(transaction) {
    const response = await this.provider.request({
      method: "sign_transaction",
      params: {
        message: transaction.serializeMessage().toString("hex"),
        messageOnly: true
      }
    });
    const parsed = JSON.parse(response);
    const signature = {
      publicKey: new PublicKey(parsed.publicKey),
      signature: Buffer.from(parsed.signature, "hex")
    };
    transaction.addSignature(signature.publicKey, signature.signature);
    return transaction;
  }
  async signAllTransactions(transactions) {
    const encodedMessage = transactions.map((tx) => {
      return tx.serializeMessage().toString("hex");
    });
    const responses = await this.provider.request({
      method: "sign_all_transactions",
      params: {
        message: encodedMessage,
        messageOnly: true
      }
    });
    const signatures = responses.map((item) => {
      const parsed = JSON.parse(item);
      return {
        publicKey: new PublicKey(parsed.publicKey),
        signature: Buffer.from(parsed.signature, "hex")
      };
    });
    transactions.forEach((tx, idx) => {
      tx.addSignature(signatures[idx].publicKey, signatures[idx].signature);
      return tx;
    });
    return transactions;
  }
  async signMessage(data) {
    const response = await this.provider.request({
      method: "sign_message",
      params: {
        data
      }
    });
    return response;
  }
  async getGaslessPublicKey() {
    const response = await this.provider.request({
      method: "get_gasless_public_key",
      params: []
    });
    return response;
  }
  // async connect(): Promise<boolean> {
  //   const response = (await this.provider.request({
  //     method: "connect",
  //     params: {},
  //   })) as boolean;
  //   return response;
  // }
  handleDappStorageKey(useLocalStorage) {
    let dappStorageKey = "";
    if (isLocalStorageAvailable && useLocalStorage) {
      const storedKey = window.localStorage.getItem(configuration.localStorageKey);
      if (storedKey)
        dappStorageKey = storedKey;
      else {
        const generatedKey = "torus-app-".concat(getWindowId());
        window.localStorage.setItem(configuration.localStorageKey, generatedKey);
        dappStorageKey = generatedKey;
      }
    }
    this.dappStorageKey = dappStorageKey;
    return dappStorageKey;
  }
  async _setupWeb3(providerParams) {
    log.info("setupWeb3 running");
    const providerStream = new BasePostMessageStream({
      name: "embed_torus",
      target: "iframe_torus",
      targetWindow: this.torusIframe.contentWindow
    });
    const communicationStream = new BasePostMessageStream({
      name: "embed_communication",
      target: "iframe_communication",
      targetWindow: this.torusIframe.contentWindow
    });
    const inPageProvider = new TorusInPageProvider(providerStream, {});
    const communicationProvider = new TorusCommunicationProvider(communicationStream, {});
    inPageProvider.tryWindowHandle = (payload, cb) => {
      const _payload = payload;
      if (!Array.isArray(_payload) && PROVIDER_UNSAFE_METHODS.includes(_payload.method)) {
        if (!this.communicationProvider.isLoggedIn)
          throw new Error("User Not Logged In");
        const windowId = getWindowId();
        communicationProvider._handleWindow(windowId, {
          target: "_blank",
          features: getPopupFeatures(FEATURES_CONFIRM_WINDOW)
        });
        _payload.windowId = windowId;
      }
      inPageProvider._rpcEngine.handle(_payload, cb);
    };
    communicationProvider.tryWindowHandle = (payload, cb) => {
      const _payload = payload;
      if (!Array.isArray(_payload) && COMMUNICATION_UNSAFE_METHODS.includes(_payload.method)) {
        const windowId = getWindowId();
        communicationProvider._handleWindow(windowId, {
          target: "_blank",
          features: getPopupFeatures(FEATURES_PROVIDER_CHANGE_WINDOW)
          // todo: are these features generic for all
        });
        _payload.params.windowId = windowId;
      }
      communicationProvider._rpcEngine.handle(_payload, cb);
    };
    const detectAccountRequestPrototypeModifier = (m) => {
      const originalMethod = inPageProvider[m];
      const self = this;
      inPageProvider[m] = function providerFunc(request, cb) {
        const {
          method,
          params = []
        } = request;
        if (method === "solana_requestAccounts") {
          if (!cb)
            return self.login({
              loginProvider: params[0]
            });
          self.login({
            loginProvider: params[0]
          }).then((res) => cb(null, res)).catch((err) => cb(err));
        }
        return originalMethod.apply(this, [request, cb]);
      };
    };
    detectAccountRequestPrototypeModifier("request");
    detectAccountRequestPrototypeModifier("sendAsync");
    detectAccountRequestPrototypeModifier("send");
    const proxiedInPageProvider = new Proxy(inPageProvider, {
      // straight up lie that we deleted the property so that it doesn't
      // throw an error in strict mode
      deleteProperty: () => true
    });
    const proxiedCommunicationProvider = new Proxy(communicationProvider, {
      // straight up lie that we deleted the property so that it doesn't
      // throw an error in strict mode
      deleteProperty: () => true
    });
    this.provider = proxiedInPageProvider;
    this.communicationProvider = proxiedCommunicationProvider;
    await Promise.all([inPageProvider._initializeState(), communicationProvider._initializeState(_objectSpread$3(_objectSpread$3({}, providerParams), {}, {
      dappStorageKey: this.dappStorageKey,
      torusAlertContainer: this.torusAlertContainer,
      torusIframe: this.torusIframe
    }))]);
    log.debug("Torus - injected provider");
  }
}
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
class SolanaWalletAdapter extends BaseSolanaAdapter {
  constructor() {
    let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super();
    _defineProperty(this, "name", WALLET_ADAPTERS.TORUS_SOLANA);
    _defineProperty(this, "adapterNamespace", ADAPTER_NAMESPACES.SOLANA);
    _defineProperty(this, "currentChainNamespace", CHAIN_NAMESPACES.SOLANA);
    _defineProperty(this, "type", ADAPTER_CATEGORY.EXTERNAL);
    _defineProperty(this, "status", ADAPTER_STATUS.NOT_READY);
    _defineProperty(this, "torusInstance", null);
    _defineProperty(this, "torusWalletOptions", void 0);
    _defineProperty(this, "initParams", void 0);
    _defineProperty(this, "loginSettings", {});
    _defineProperty(this, "solanaProvider", null);
    _defineProperty(this, "rehydrated", false);
    this.torusWalletOptions = params.adapterSettings || {};
    this.initParams = params.initParams || {};
    this.loginSettings = params.loginSettings || {};
    this.chainConfig = params.chainConfig || null;
    this.sessionTime = params.sessionTime || 86400;
  }
  get provider() {
    if (this.status === ADAPTER_STATUS.CONNECTED && this.solanaProvider) {
      var _this$solanaProvider;
      return ((_this$solanaProvider = this.solanaProvider) === null || _this$solanaProvider === void 0 ? void 0 : _this$solanaProvider.provider) || null;
    }
    return null;
  }
  set provider(_) {
    throw new Error("Not implemented");
  }
  async init(options) {
    super.checkInitializationRequirements();
    let network;
    if (!this.chainConfig) {
      this.chainConfig = getChainConfig(CHAIN_NAMESPACES.SOLANA, "0x1");
      const {
        blockExplorer,
        displayName,
        ticker,
        tickerName,
        rpcTarget,
        chainId
      } = this.chainConfig;
      network = {
        chainId,
        rpcTarget,
        blockExplorerUrl: blockExplorer,
        displayName,
        ticker,
        tickerName,
        logo: ""
      };
    } else {
      const {
        chainId,
        blockExplorer,
        displayName,
        rpcTarget,
        ticker,
        tickerName
      } = this.chainConfig;
      network = {
        chainId,
        rpcTarget,
        blockExplorerUrl: blockExplorer,
        displayName,
        tickerName,
        ticker,
        logo: ""
      };
    }
    this.torusInstance = new Torus(this.torusWalletOptions);
    log$1.debug("initializing torus solana adapter init");
    await this.torusInstance.init(_objectSpread(_objectSpread({
      showTorusButton: false
    }, this.initParams), {}, {
      network
    }));
    this.solanaProvider = new TorusInjectedProvider({
      config: {
        chainConfig: this.chainConfig
      }
    });
    this.status = ADAPTER_STATUS.READY;
    this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.TORUS_SOLANA);
    try {
      log$1.debug("initializing torus solana adapter");
      if (options.autoConnect) {
        this.rehydrated = true;
        await this.connect();
      }
    } catch (error) {
      log$1.error("Failed to connect with cached torus solana provider", error);
      this.emit(ADAPTER_EVENTS.ERRORED, error);
    }
  }
  async connect() {
    super.checkConnectionRequirements();
    if (!this.torusInstance)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    if (!this.solanaProvider)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    this.status = ADAPTER_STATUS.CONNECTING;
    this.emit(ADAPTER_EVENTS.CONNECTING, {
      adapter: WALLET_ADAPTERS.TORUS_SOLANA
    });
    try {
      await this.torusInstance.login(this.loginSettings);
      try {
        const torusInpageProvider = this.torusInstance.provider;
        torusInpageProvider.sendTransaction = this.torusInstance.sendTransaction.bind(this.torusInstance);
        torusInpageProvider.signAllTransactions = this.torusInstance.signAllTransactions.bind(this.torusInstance);
        torusInpageProvider.signMessage = this.torusInstance.signMessage.bind(this.torusInstance);
        torusInpageProvider.signTransaction = this.torusInstance.signTransaction.bind(this.torusInstance);
        await this.solanaProvider.setupProvider(torusInpageProvider);
      } catch (error) {
        if (error instanceof Web3AuthError && error.code === 5010) {
          const {
            chainId,
            blockExplorer,
            displayName,
            rpcTarget,
            ticker,
            tickerName
          } = this.chainConfig;
          const network = {
            chainId,
            rpcTarget,
            blockExplorerUrl: blockExplorer,
            displayName,
            tickerName,
            ticker,
            logo: ""
          };
          await this.torusInstance.setProvider(network);
        } else {
          throw error;
        }
      }
      this.status = ADAPTER_STATUS.CONNECTED;
      this.torusInstance.showTorusButton();
      this.emit(ADAPTER_STATUS.CONNECTED, {
        adapter: WALLET_ADAPTERS.TORUS_SOLANA,
        reconnected: this.rehydrated
      });
      return this.provider;
    } catch (error) {
      this.status = ADAPTER_STATUS.READY;
      this.rehydrated = false;
      this.emit(ADAPTER_EVENTS.ERRORED, error);
      throw WalletLoginError.connectionError("Failed to login with torus solana wallet");
    }
  }
  async disconnect() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
      cleanup: false
    };
    if (!this.torusInstance)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    await super.disconnect();
    await this.torusInstance.logout();
    if (options.cleanup) {
      this.status = ADAPTER_STATUS.NOT_READY;
      this.torusInstance = null;
      this.solanaProvider = null;
    } else {
      this.status = ADAPTER_STATUS.READY;
    }
    this.emit(ADAPTER_EVENTS.DISCONNECTED);
  }
  async getUserInfo() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    if (!this.torusInstance)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    const userInfo = await this.torusInstance.getUserInfo();
    return userInfo;
  }
  setAdapterSettings(options) {
    if (this.status === ADAPTER_STATUS.READY)
      return;
    if (options !== null && options !== void 0 && options.sessionTime) {
      this.sessionTime = options.sessionTime;
    }
  }
}
export {
  SolanaWalletAdapter
};
