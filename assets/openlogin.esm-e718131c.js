import { c as commonjsGlobal, r as require$$0, q as loglevel, f as _defineProperty, t as _createClass, u as _classCallCheck, v as safeatob, w as _typeof, x as setupMultiplex, P as PostMessageStream, y as _slicedToArray, z as _inherits, a as _assertThisInitialized, B as createStreamMiddleware, D as pump_1, J as JRPCEngine, F as createIdRemapMiddleware, G as randomId, S as SafeEventEmitter, H as _asyncToGenerator, I as regenerator, K as get, L as jsonToBase64, M as base64url, N as keccak, O as getRpcPromiseCallback, Q as _getPrototypeOf, R as _possibleConstructorReturn, n as merge } from "./base.esm-570dabbe.js";
import { e as elliptic } from "./elliptic-f2b24f57.js";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "https://sam-shariat.github.io/cryptogiftcard/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  if (!deps || deps.length === 0) {
    return baseModule();
  }
  const links = document.getElementsByTagName("link");
  return Promise.all(deps.map((dep) => {
    dep = assetsURL(dep);
    if (dep in seen)
      return;
    seen[dep] = true;
    const isCss = dep.endsWith(".css");
    const cssSelector = isCss ? '[rel="stylesheet"]' : "";
    const isBaseRelative = !!importerUrl;
    if (isBaseRelative) {
      for (let i = links.length - 1; i >= 0; i--) {
        const link2 = links[i];
        if (link2.href === dep && (!isCss || link2.rel === "stylesheet")) {
          return;
        }
      }
    } else if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = isCss ? "stylesheet" : scriptRel;
    if (!isCss) {
      link.as = "script";
      link.crossOrigin = "";
    }
    link.href = dep;
    document.head.appendChild(link);
    if (isCss) {
      return new Promise((res, rej) => {
        link.addEventListener("load", res);
        link.addEventListener("error", () => rej(new Error(`Unable to preload CSS for ${dep}`)));
      });
    }
  })).then(() => baseModule());
};
var getPublic_1;
var EC = elliptic.ec;
var ec = new EC("secp256k1");
var browserCrypto = commonjsGlobal.crypto || commonjsGlobal.msCrypto || {};
var subtle = browserCrypto.subtle || browserCrypto.webkitSubtle;
var nodeCrypto = require$$0;
const EC_GROUP_ORDER = Buffer.from("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", "hex");
const ZERO32 = Buffer.alloc(32, 0);
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}
function isScalar(x) {
  return Buffer.isBuffer(x) && x.length === 32;
}
function isValidPrivateKey(privateKey) {
  if (!isScalar(privateKey)) {
    return false;
  }
  return privateKey.compare(ZERO32) > 0 && // > 0
  privateKey.compare(EC_GROUP_ORDER) < 0;
}
function equalConstTime(b1, b2) {
  if (b1.length !== b2.length) {
    return false;
  }
  var res = 0;
  for (var i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i];
  }
  return res === 0;
}
function randomBytes(size) {
  var arr = new Uint8Array(size);
  if (typeof browserCrypto.getRandomValues === "undefined") {
    return Buffer.from(nodeCrypto.randomBytes(size));
  } else {
    browserCrypto.getRandomValues(arr);
  }
  return Buffer.from(arr);
}
function sha512(msg) {
  return new Promise(function(resolve) {
    var hash = nodeCrypto.createHash("sha512");
    var result = hash.update(msg).digest();
    resolve(new Uint8Array(result));
  });
}
function getAes(op) {
  return function(iv, key, data) {
    return new Promise(function(resolve) {
      if (subtle) {
        var importAlgorithm = { name: "AES-CBC" };
        var keyp = subtle.importKey("raw", key, importAlgorithm, false, [op]);
        return keyp.then(function(cryptoKey) {
          var encAlgorithm = { name: "AES-CBC", iv };
          return subtle[op](encAlgorithm, cryptoKey, data);
        }).then(function(result) {
          resolve(Buffer.from(new Uint8Array(result)));
        });
      } else {
        if (op === "encrypt") {
          var cipher = nodeCrypto.createCipheriv("aes-256-cbc", key, iv);
          let firstChunk = cipher.update(data);
          let secondChunk = cipher.final();
          resolve(Buffer.concat([firstChunk, secondChunk]));
        } else if (op === "decrypt") {
          var decipher = nodeCrypto.createDecipheriv("aes-256-cbc", key, iv);
          let firstChunk = decipher.update(data);
          let secondChunk = decipher.final();
          resolve(Buffer.concat([firstChunk, secondChunk]));
        }
      }
    });
  };
}
var aesCbcEncrypt = getAes("encrypt");
var aesCbcDecrypt = getAes("decrypt");
function hmacSha256Sign(key, msg) {
  return new Promise(function(resolve) {
    var hmac = nodeCrypto.createHmac("sha256", Buffer.from(key));
    hmac.update(msg);
    var result = hmac.digest();
    resolve(result);
  });
}
function hmacSha256Verify(key, msg, sig) {
  return new Promise(function(resolve) {
    var hmac = nodeCrypto.createHmac("sha256", Buffer.from(key));
    hmac.update(msg);
    var expectedSig = hmac.digest();
    resolve(equalConstTime(expectedSig, sig));
  });
}
var getPublic = getPublic_1 = function(privateKey) {
  assert(privateKey.length === 32, "Bad private key");
  assert(isValidPrivateKey(privateKey), "Bad private key");
  return Buffer.from(ec.keyFromPrivate(privateKey).getPublic("arr"));
};
var sign = function(privateKey, msg) {
  return new Promise(function(resolve) {
    assert(privateKey.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKey), "Bad private key");
    assert(msg.length > 0, "Message should not be empty");
    assert(msg.length <= 32, "Message is too long");
    resolve(Buffer.from(ec.sign(msg, privateKey, { canonical: true }).toDER()));
  });
};
var derive = function(privateKeyA, publicKeyB) {
  return new Promise(function(resolve) {
    assert(Buffer.isBuffer(privateKeyA), "Bad private key");
    assert(Buffer.isBuffer(publicKeyB), "Bad public key");
    assert(privateKeyA.length === 32, "Bad private key");
    assert(isValidPrivateKey(privateKeyA), "Bad private key");
    assert(publicKeyB.length === 65 || publicKeyB.length === 33, "Bad public key");
    if (publicKeyB.length === 65) {
      assert(publicKeyB[0] === 4, "Bad public key");
    }
    if (publicKeyB.length === 33) {
      assert(publicKeyB[0] === 2 || publicKeyB[0] === 3, "Bad public key");
    }
    var keyA = ec.keyFromPrivate(privateKeyA);
    var keyB = ec.keyFromPublic(publicKeyB);
    var Px = keyA.derive(keyB.getPublic());
    resolve(Buffer.from(Px.toArray()));
  });
};
var encrypt = function(publicKeyTo, msg, opts) {
  opts = opts || {};
  var iv, ephemPublicKey, ciphertext, macKey;
  return new Promise(function(resolve) {
    var ephemPrivateKey = opts.ephemPrivateKey || randomBytes(32);
    while (!isValidPrivateKey(ephemPrivateKey)) {
      ephemPrivateKey = opts.ephemPrivateKey || randomBytes(32);
    }
    ephemPublicKey = getPublic(ephemPrivateKey);
    resolve(derive(ephemPrivateKey, publicKeyTo));
  }).then(function(Px) {
    return sha512(Px);
  }).then(function(hash) {
    iv = opts.iv || randomBytes(16);
    var encryptionKey = hash.slice(0, 32);
    macKey = hash.slice(32);
    return aesCbcEncrypt(iv, encryptionKey, msg);
  }).then(function(data) {
    ciphertext = data;
    var dataToMac = Buffer.concat([iv, ephemPublicKey, ciphertext]);
    return hmacSha256Sign(macKey, dataToMac);
  }).then(function(mac) {
    return {
      iv,
      ephemPublicKey,
      ciphertext,
      mac
    };
  });
};
var decrypt = function(privateKey, opts) {
  var encryptionKey;
  return derive(privateKey, opts.ephemPublicKey).then(function(Px) {
    return sha512(Px);
  }).then(function(hash) {
    encryptionKey = hash.slice(0, 32);
    var macKey = hash.slice(32);
    var dataToMac = Buffer.concat([
      opts.iv,
      opts.ephemPublicKey,
      opts.ciphertext
    ]);
    return hmacSha256Verify(macKey, dataToMac, opts.mac);
  }).then(function(macGood) {
    assert(macGood, "Bad MAC");
    return aesCbcDecrypt(opts.iv, encryptionKey, opts.ciphertext);
  }).then(function(msg) {
    return Buffer.from(new Uint8Array(msg));
  });
};
var modalDOMElementID = "openlogin-modal";
var storeKey = "openlogin_store";
var UX_MODE = {
  POPUP: "popup",
  REDIRECT: "redirect"
};
var OPENLOGIN_METHOD = {
  LOGIN: "openlogin_login",
  LOGOUT: "openlogin_logout",
  CHECK_3PC_SUPPORT: "openlogin_check_3PC_support",
  SET_PID_DATA: "openlogin_set_pid_data",
  GET_DATA: "openlogin_get_data"
};
var ALLOWED_INTERACTIONS = {
  POPUP: "popup",
  REDIRECT: "redirect",
  JRPC: "jrpc"
};
var OPENLOGIN_NETWORK = {
  MAINNET: "mainnet",
  TESTNET: "testnet",
  CYAN: "cyan",
  DEVELOPMENT: "development",
  SK_TESTNET: "sk_testnet",
  CELESTE: "celeste",
  AQUA: "aqua"
};
var SUPPORTED_KEY_CURVES = {
  SECP256K1: "secp256k1",
  ED25519: "ed25519"
};
var LOGIN_PROVIDER = {
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
  EMAIL_PASSWORDLESS: "email_passwordless",
  WEBAUTHN: "webauthn",
  JWT: "jwt"
};
loglevel.setLevel("error");
var log = loglevel.getLogger("openlogin");
function documentReady() {
  return _documentReady.apply(this, arguments);
}
function _documentReady() {
  _documentReady = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee() {
    return regenerator.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function(resolve) {
              if (document.readyState !== "loading") {
                resolve();
              } else {
                document.addEventListener("DOMContentLoaded", function() {
                  resolve();
                });
              }
            }));
          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _documentReady.apply(this, arguments);
}
var htmlToElement = function htmlToElement2(html) {
  var template = window.document.createElement("template");
  var trimmedHtml = html.trim();
  template.innerHTML = trimmedHtml;
  return template.content.firstChild;
};
function getHashQueryParams() {
  var replaceUrl = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
  var result = {};
  var url = new URL(window.location.href);
  url.searchParams.forEach(function(value, key) {
    if (key !== "result") {
      result[key] = value;
    }
  });
  var queryResult = url.searchParams.get("result");
  if (queryResult) {
    try {
      var queryParams = JSON.parse(safeatob(queryResult));
      Object.keys(queryParams).forEach(function(key) {
        result[key] = queryParams[key];
      });
    } catch (error) {
      log.error(error);
    }
  }
  var hash = url.hash.substring(1);
  var hashUrl = new URL("".concat(window.location.origin, "/?").concat(hash));
  hashUrl.searchParams.forEach(function(value, key) {
    if (key !== "result") {
      result[key] = value;
    }
  });
  var hashResult = hashUrl.searchParams.get("result");
  if (hashResult) {
    try {
      var hashParams = JSON.parse(safeatob(hashResult));
      Object.keys(hashParams).forEach(function(key) {
        result[key] = hashParams[key];
      });
    } catch (error) {
      log.error(error);
    }
  }
  if (replaceUrl) {
    var cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, "", cleanUrl);
  }
  return result;
}
function awaitReq(id, windowRef) {
  return new Promise(function(resolve, reject) {
    if (!windowRef) {
      reject(new Error("Unable to open window"));
      return;
    }
    var closedByHandler = false;
    var closedMonitor = setInterval(function() {
      if (!closedByHandler && windowRef.closed) {
        clearInterval(closedMonitor);
        reject(new Error("user closed popup"));
      }
    }, 500);
    var handler = function handler2(ev) {
      var pid = ev.data.pid;
      if (id !== pid)
        return;
      window.removeEventListener("message", handler2);
      closedByHandler = true;
      clearInterval(closedMonitor);
      windowRef.close();
      if (ev.data.data && ev.data.data.error) {
        reject(new Error(ev.data.data.error));
      } else {
        resolve(ev.data.data);
      }
    };
    window.addEventListener("message", handler);
  });
}
function constructURL(params) {
  var baseURL = params.baseURL, query = params.query, hash = params.hash;
  var url = new URL(baseURL);
  if (query) {
    Object.keys(query).forEach(function(key) {
      url.searchParams.append(key, query[key]);
    });
  }
  if (hash) {
    var h = new URL(constructURL({
      baseURL,
      query: hash
    })).searchParams.toString();
    url.hash = h;
  }
  return url.toString();
}
function storageAvailable(type) {
  var storageExists = false;
  var storageLength = 0;
  var storage;
  try {
    storage = window[type];
    storageExists = true;
    storageLength = storage.length;
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (error) {
    return error && // everything except Firefox
    (error.code === 22 || // Firefox
    error.code === 1014 || // test name field too, because code might not be present
    // everything except Firefox
    error.name === "QuotaExceededErro r" || // Firefox
    error.name === "NS_ERROR_DOM_QUOTA_REACHED") && // acknowledge QuotaExceededError only if there's something already stored
    storageExists && storageLength !== 0;
  }
}
var sessionStorageAvailable = storageAvailable("sessionStorage");
var localStorageAvailable = storageAvailable("localStorage");
function preloadIframe(url) {
  try {
    if (typeof document === "undefined")
      return;
    var openloginIframeHtml = document.createElement("link");
    openloginIframeHtml.href = url;
    openloginIframeHtml.crossOrigin = "anonymous";
    openloginIframeHtml.type = "text/html";
    openloginIframeHtml.rel = "prefetch";
    if (openloginIframeHtml.relList && openloginIframeHtml.relList.supports) {
      if (openloginIframeHtml.relList.supports("prefetch")) {
        document.head.appendChild(openloginIframeHtml);
      }
    }
  } catch (error) {
    log.error(error);
  }
}
function getPopupFeatures() {
  var dualScreenLeft = window.screenLeft !== void 0 ? window.screenLeft : window.screenX;
  var dualScreenTop = window.screenTop !== void 0 ? window.screenTop : window.screenY;
  var w = 1200;
  var h = 700;
  var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
  var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;
  var systemZoom = 1;
  var left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
  var top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
  var features = "titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=".concat(h / systemZoom, ",width=").concat(w / systemZoom, ",top=").concat(top, ",left=").concat(left);
  return features;
}
var handleStream = function handleStream2(handle, eventName, handler) {
  var handlerWrapper = function handlerWrapper2(chunk) {
    handler(chunk);
    handle.removeListener(eventName, handlerWrapper2);
  };
  handle.on(eventName, handlerWrapper);
};
var Modal = /* @__PURE__ */ function() {
  function Modal2(modalUrl) {
    _classCallCheck(this, Modal2);
    _defineProperty(this, "modalUrl", void 0);
    _defineProperty(this, "iframeElem", void 0);
    _defineProperty(this, "initialized", false);
    _defineProperty(this, "modalZIndex", 99999);
    _defineProperty(this, "mux", void 0);
    _defineProperty(this, "verifierStream", void 0);
    this.modalUrl = modalUrl;
  }
  _createClass(Modal2, [{
    key: "init",
    value: function() {
      var _init = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee() {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.initIFrame(this.modalUrl);
              case 2:
                this.setupStream();
              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "setupStream",
    value: function setupStream() {
      if (this.iframeElem === null)
        throw new Error("iframe is null");
      this.mux = setupMultiplex(new PostMessageStream({
        name: "modal_iframe_rpc",
        target: "modal_rpc",
        targetWindow: this.iframeElem.contentWindow,
        targetOrigin: new URL(this.modalUrl).origin
      }));
      this.verifierStream = this.mux.createStream("verifier");
    }
  }, {
    key: "initIFrame",
    value: function() {
      var _initIFrame = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee2(src) {
        var _this = this;
        var documentIFrameElem;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return documentReady();
              case 2:
                documentIFrameElem = document.getElementById(modalDOMElementID);
                if (documentIFrameElem) {
                  documentIFrameElem.remove();
                  log.info("already initialized, removing previous modal iframe");
                }
                this.iframeElem = htmlToElement("<iframe\n        id=".concat(modalDOMElementID, '\n        class="torusIframe"\n        src="').concat(src, '"\n        style="display: none; position: fixed; top: 0; right: 0; width: 100%;\n        height: 100%; border: none; border-radius: 0; z-index: ').concat(this.modalZIndex.toString(), '"\n      ></iframe>'));
                this._hideModal();
                document.body.appendChild(this.iframeElem);
                return _context2.abrupt("return", new Promise(function(resolve) {
                  _this.iframeElem.onload = function() {
                    _this.initialized = true;
                    resolve();
                  };
                }));
              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function initIFrame(_x) {
        return _initIFrame.apply(this, arguments);
      }
      return initIFrame;
    }()
  }, {
    key: "_showModal",
    value: function _showModal() {
      var style = {};
      style.display = "block";
      style.position = "fixed";
      style.width = "100%";
      style.height = "100%";
      style.top = "0px";
      style.right = "0px";
      style.left = "0px";
      style.bottom = "0px";
      style.border = "0";
      style["z-index"] = this.modalZIndex;
      this.iframeElem.setAttribute("style", Object.entries(style).map(function(_ref) {
        var _ref2 = _slicedToArray(_ref, 2), k = _ref2[0], v = _ref2[1];
        return "".concat(k, ":").concat(v);
      }).join(";"));
    }
  }, {
    key: "_hideModal",
    value: function _hideModal() {
      var style = {};
      style.display = "none";
      style.position = "fixed";
      style.width = "100%";
      style.height = "100%";
      style.top = "0px";
      style.right = "0px";
      style.left = "0px";
      style.bottom = "0px";
      style.border = "0";
      style["z-index"] = this.modalZIndex;
      this.iframeElem.setAttribute("style", Object.entries(style).map(function(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2), k = _ref4[0], v = _ref4[1];
        return "".concat(k, ":").concat(v);
      }).join(";"));
    }
  }, {
    key: "_prompt",
    value: function() {
      var _prompt2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee3(clientId, whiteLabel, loginConfig, cb) {
        var _this2 = this;
        var modalHandler;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                this._showModal();
                modalHandler = function modalHandler2(chunk) {
                  _this2._hideModal();
                  cb(chunk);
                };
                handleStream(this.verifierStream, "data", modalHandler);
                this.verifierStream.write({
                  name: "prompt",
                  clientId,
                  whiteLabel,
                  loginConfig
                });
              case 4:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));
      function _prompt(_x2, _x3, _x4, _x5) {
        return _prompt2.apply(this, arguments);
      }
      return _prompt;
    }()
  }, {
    key: "cleanup",
    value: function() {
      var _cleanup = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee4() {
        var documentIFrameElem;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return documentReady();
              case 2:
                documentIFrameElem = document.getElementById(modalDOMElementID);
                if (documentIFrameElem) {
                  documentIFrameElem.remove();
                  this.iframeElem = null;
                }
                this.initialized = false;
              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));
      function cleanup() {
        return _cleanup.apply(this, arguments);
      }
      return cleanup;
    }()
  }]);
  return Modal2;
}();
var MemoryStore = /* @__PURE__ */ function() {
  function MemoryStore2() {
    _classCallCheck(this, MemoryStore2);
    _defineProperty(this, "store", {});
  }
  _createClass(MemoryStore2, [{
    key: "getItem",
    value: function getItem(key) {
      return this.store[key] || null;
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.store[key] = value;
    }
  }]);
  return MemoryStore2;
}();
var OpenLoginStore = /* @__PURE__ */ function() {
  function OpenLoginStore2(storage, _storeKey) {
    _classCallCheck(this, OpenLoginStore2);
    _defineProperty(this, "_storeKey", storeKey);
    _defineProperty(this, "storage", void 0);
    this.storage = storage;
    this._storeKey = _storeKey || storeKey;
    try {
      if (!storage.getItem(_storeKey || storeKey)) {
        this.resetStore();
      }
    } catch (error) {
    }
  }
  _createClass(OpenLoginStore2, [{
    key: "toJSON",
    value: function toJSON() {
      return this.storage.getItem(this._storeKey);
    }
  }, {
    key: "resetStore",
    value: function resetStore() {
      var currStore = this.getStore();
      this.storage.setItem(this._storeKey, JSON.stringify({}));
      return currStore;
    }
  }, {
    key: "getStore",
    value: function getStore() {
      return JSON.parse(this.storage.getItem(this._storeKey));
    }
  }, {
    key: "get",
    value: function get2(key) {
      var store = JSON.parse(this.storage.getItem(this._storeKey));
      return store[key];
    }
  }, {
    key: "set",
    value: function set(key, value) {
      var store = JSON.parse(this.storage.getItem(this._storeKey));
      store[key] = value;
      this.storage.setItem(this._storeKey, JSON.stringify(store));
    }
  }], [{
    key: "getInstance",
    value: function getInstance(storeNamespace) {
      var storageKey = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "local";
      if (!this.instance) {
        var storage = new MemoryStore();
        if (storageKey === "local" && localStorageAvailable) {
          storage = localStorage;
        }
        if (storageKey === "session" && sessionStorageAvailable) {
          storage = sessionStorage;
        }
        var finalStoreKey = storeNamespace ? "".concat(storeKey, "_").concat(storeNamespace) : storeKey;
        this.instance = new this(storage, finalStoreKey);
      }
      return this.instance;
    }
  }]);
  return OpenLoginStore2;
}();
_defineProperty(OpenLoginStore, "instance", void 0);
function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();
  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived), result;
    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;
      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }
    return _possibleConstructorReturn(this, result);
  };
}
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct)
    return false;
  if (Reflect.construct.sham)
    return false;
  if (typeof Proxy === "function")
    return true;
  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
    }));
    return true;
  } catch (e) {
    return false;
  }
}
var Provider = /* @__PURE__ */ function(_SafeEventEmitter) {
  _inherits(Provider2, _SafeEventEmitter);
  var _super = _createSuper(Provider2);
  function Provider2() {
    var _this;
    _classCallCheck(this, Provider2);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "iframeElem", null);
    _defineProperty(_assertThisInitialized(_this), "rpcStream", void 0);
    _defineProperty(_assertThisInitialized(_this), "iframeUrl", void 0);
    _defineProperty(_assertThisInitialized(_this), "rpcEngine", void 0);
    _defineProperty(_assertThisInitialized(_this), "initialized", void 0);
    _defineProperty(_assertThisInitialized(_this), "mux", void 0);
    return _this;
  }
  _createClass(Provider2, [{
    key: "init",
    value: function init(_ref) {
      var iframeElem = _ref.iframeElem, iframeUrl = _ref.iframeUrl;
      this.iframeElem = iframeElem;
      this.iframeUrl = iframeUrl;
      this.setupStream();
      this.initialized = true;
    }
  }, {
    key: "setupStream",
    value: function setupStream() {
      if (this.iframeElem === null)
        throw new Error("iframe is null");
      this.rpcStream = new PostMessageStream({
        name: "embed_rpc",
        target: "iframe_rpc",
        targetWindow: this.iframeElem.contentWindow,
        targetOrigin: new URL(this.iframeUrl).origin
      });
      this.mux = setupMultiplex(this.rpcStream);
      var JRPCConnection = createStreamMiddleware();
      pump_1(JRPCConnection.stream, this.mux.createStream("jrpc"), JRPCConnection.stream, function(error) {
        log.error("JRPC connection broken", error);
      });
      var rpcEngine = new JRPCEngine();
      rpcEngine.push(createIdRemapMiddleware());
      rpcEngine.push(JRPCConnection.middleware);
      this.rpcEngine = rpcEngine;
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      this.iframeElem = null;
      this.initialized = false;
    }
  }, {
    key: "_rpcRequest",
    value: function _rpcRequest(payload, callback) {
      if (!payload.jsonrpc) {
        payload.jsonrpc = "2.0";
      }
      if (!payload.id) {
        payload.id = randomId();
      }
      this.rpcEngine.handle(payload, callback);
    }
  }]);
  return Provider2;
}(SafeEventEmitter);
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
preloadIframe("https://app.openlogin.com/sdk-modal");
var OpenLogin = /* @__PURE__ */ function() {
  function OpenLogin2(options) {
    var _options$no3PC, _options$_startUrl, _options$_popupUrl, _options$redirectUrl, _options$uxMode, _options$replaceUrlOn, _options$originData, _options$whiteLabel, _options$loginConfig, _options$_storageServ, _options$_sessionName, _options$webauthnTran;
    _classCallCheck(this, OpenLogin2);
    _defineProperty(this, "provider", void 0);
    _defineProperty(this, "state", void 0);
    _defineProperty(this, "modal", void 0);
    this.provider = new Proxy(new Provider(), {
      deleteProperty: function deleteProperty() {
        return true;
      }
      // work around for web3
    });
    if (!options._iframeUrl) {
      if (options.network === OPENLOGIN_NETWORK.MAINNET) {
        options._iframeUrl = "https://app.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.CYAN) {
        options._iframeUrl = "https://cyan.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.TESTNET) {
        options._iframeUrl = "https://beta.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.SK_TESTNET) {
        options._iframeUrl = "https://beta-sk.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.CELESTE) {
        options._iframeUrl = "https://celeste.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.AQUA) {
        options._iframeUrl = "https://aqua.openlogin.com";
      } else if (options.network === OPENLOGIN_NETWORK.DEVELOPMENT) {
        options._iframeUrl = "http://localhost:3000";
      }
    }
    if (!options._iframeUrl) {
      throw new Error("unspecified network and iframeUrl");
    }
    this.modal = new Modal("".concat(options._iframeUrl, "/sdk-modal"));
    this.initState(_objectSpread(_objectSpread({}, options), {}, {
      no3PC: (_options$no3PC = options.no3PC) !== null && _options$no3PC !== void 0 ? _options$no3PC : false,
      _iframeUrl: options._iframeUrl,
      _startUrl: (_options$_startUrl = options._startUrl) !== null && _options$_startUrl !== void 0 ? _options$_startUrl : "".concat(options._iframeUrl, "/start"),
      _popupUrl: (_options$_popupUrl = options._popupUrl) !== null && _options$_popupUrl !== void 0 ? _options$_popupUrl : "".concat(options._iframeUrl, "/popup-window"),
      redirectUrl: (_options$redirectUrl = options.redirectUrl) !== null && _options$redirectUrl !== void 0 ? _options$redirectUrl : "".concat(window.location.protocol, "//").concat(window.location.host).concat(window.location.pathname),
      uxMode: (_options$uxMode = options.uxMode) !== null && _options$uxMode !== void 0 ? _options$uxMode : UX_MODE.REDIRECT,
      replaceUrlOnRedirect: (_options$replaceUrlOn = options.replaceUrlOnRedirect) !== null && _options$replaceUrlOn !== void 0 ? _options$replaceUrlOn : true,
      originData: (_options$originData = options.originData) !== null && _options$originData !== void 0 ? _options$originData : _defineProperty({}, window.location.origin, ""),
      whiteLabel: (_options$whiteLabel = options.whiteLabel) !== null && _options$whiteLabel !== void 0 ? _options$whiteLabel : {},
      loginConfig: (_options$loginConfig = options.loginConfig) !== null && _options$loginConfig !== void 0 ? _options$loginConfig : {},
      _storageServerUrl: (_options$_storageServ = options._storageServerUrl) !== null && _options$_storageServ !== void 0 ? _options$_storageServ : "https://broadcast-server.tor.us",
      storageKey: options.storageKey === "session" ? "session" : "local",
      _sessionNamespace: (_options$_sessionName = options._sessionNamespace) !== null && _options$_sessionName !== void 0 ? _options$_sessionName : "",
      webauthnTransports: (_options$webauthnTran = options.webauthnTransports) !== null && _options$webauthnTran !== void 0 ? _options$webauthnTran : ["internal"]
    }));
  }
  _createClass(OpenLogin2, [{
    key: "privKey",
    get: function get2() {
      return this.state.privKey ? this.state.privKey.padStart(64, "0") : "";
    }
  }, {
    key: "coreKitKey",
    get: function get2() {
      return this.state.coreKitKey ? this.state.coreKitKey.padStart(64, "0") : "";
    }
  }, {
    key: "initState",
    value: function initState(options) {
      this.state = {
        uxMode: options.uxMode,
        network: options.network,
        store: OpenLoginStore.getInstance(options._sessionNamespace, options.storageKey),
        iframeUrl: options._iframeUrl,
        startUrl: options._startUrl,
        popupUrl: options._popupUrl,
        clientId: options.clientId,
        redirectUrl: options.redirectUrl,
        replaceUrlOnRedirect: options.replaceUrlOnRedirect,
        originData: options.originData,
        loginConfig: options.loginConfig,
        support3PC: !options.no3PC,
        whiteLabel: options.whiteLabel,
        storageServerUrl: options._storageServerUrl,
        sessionNamespace: options._sessionNamespace,
        webauthnTransports: options.webauthnTransports
      };
    }
  }, {
    key: "init",
    value: function() {
      var _init = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee() {
        var params, res;
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.state.network === OPENLOGIN_NETWORK.TESTNET) {
                  console.log("%c WARNING! You are on testnet. Please set network: 'mainnet' in production", "color: #FF0000");
                }
                _context.next = 3;
                return Promise.all([this.modal.init(), this.updateOriginData()]);
              case 3:
                this.provider.init({
                  iframeElem: this.modal.iframeElem,
                  iframeUrl: this.state.iframeUrl
                });
                params = getHashQueryParams(this.state.replaceUrlOnRedirect);
                if (params.sessionId) {
                  this.state.store.set("sessionId", params.sessionId);
                }
                _context.t0 = this;
                _context.next = 9;
                return this._getData();
              case 9:
                _context.t1 = _context.sent;
                _context.t0._syncState.call(_context.t0, _context.t1);
                if (!this.state.support3PC) {
                  _context.next = 16;
                  break;
                }
                _context.next = 14;
                return this._check3PCSupport();
              case 14:
                res = _context.sent;
                this.state.support3PC = !!res.support3PC;
              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function init() {
        return _init.apply(this, arguments);
      }
      return init;
    }()
  }, {
    key: "updateOriginData",
    value: function() {
      var _updateOriginData = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee2() {
        var filteredOriginData, _yield$Promise$all, _yield$Promise$all2, whitelist, whiteLabel;
        return regenerator.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                filteredOriginData = JSON.parse(JSON.stringify(this.state.originData));
                Object.keys(filteredOriginData).forEach(function(key) {
                  if (filteredOriginData[key] === "")
                    delete filteredOriginData[key];
                });
                _context2.next = 4;
                return Promise.all([this.getWhitelist(), this.getWhiteLabel()]);
              case 4:
                _yield$Promise$all = _context2.sent;
                _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
                whitelist = _yield$Promise$all2[0];
                whiteLabel = _yield$Promise$all2[1];
                this._syncState({
                  originData: _objectSpread(_objectSpread({}, whitelist), filteredOriginData),
                  whiteLabel: _objectSpread(_objectSpread({}, whiteLabel), this.state.whiteLabel)
                });
              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function updateOriginData() {
        return _updateOriginData.apply(this, arguments);
      }
      return updateOriginData;
    }()
  }, {
    key: "getWhitelist",
    value: function() {
      var _getWhitelist = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee3() {
        var clientId, url, res;
        return regenerator.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                clientId = this.state.clientId;
                if (clientId) {
                  _context3.next = 4;
                  break;
                }
                throw new Error("unspecified clientId");
              case 4:
                url = new URL("https://api.developer.tor.us/whitelist");
                url.searchParams.append("project_id", this.state.clientId);
                url.searchParams.append("network", this.state.network);
                _context3.next = 9;
                return get(url.href);
              case 9:
                res = _context3.sent;
                return _context3.abrupt("return", res.signed_urls);
              case 13:
                _context3.prev = 13;
                _context3.t0 = _context3["catch"](0);
                return _context3.abrupt("return", {});
              case 16:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 13]]);
      }));
      function getWhitelist() {
        return _getWhitelist.apply(this, arguments);
      }
      return getWhitelist;
    }()
  }, {
    key: "getWhiteLabel",
    value: function() {
      var _getWhiteLabel = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee4() {
        var clientId, url, res;
        return regenerator.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.prev = 0;
                clientId = this.state.clientId;
                if (clientId) {
                  _context4.next = 4;
                  break;
                }
                throw new Error("unspecified clientId");
              case 4:
                url = new URL("https://api.developer.tor.us/whitelabel");
                url.searchParams.append("project_id", this.state.clientId);
                _context4.next = 8;
                return get(url.href);
              case 8:
                res = _context4.sent;
                return _context4.abrupt("return", res.whiteLabel);
              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](0);
                return _context4.abrupt("return", {});
              case 15:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[0, 12]]);
      }));
      function getWhiteLabel() {
        return _getWhiteLabel.apply(this, arguments);
      }
      return getWhiteLabel;
    }()
  }, {
    key: "login",
    value: function() {
      var _login = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee5(params) {
        return regenerator.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(params !== null && params !== void 0 && params.loginProvider)) {
                  _context5.next = 2;
                  break;
                }
                return _context5.abrupt("return", this._selectedLogin(params));
              case 2:
                return _context5.abrupt("return", this._modal(params));
              case 3:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));
      function login(_x) {
        return _login.apply(this, arguments);
      }
      return login;
    }()
  }, {
    key: "_selectedLogin",
    value: function() {
      var _selectedLogin2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee6(params) {
        var defaultParams, loginParams, res;
        return regenerator.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                defaultParams = {
                  redirectUrl: this.state.redirectUrl
                };
                loginParams = _objectSpread(_objectSpread({
                  loginProvider: params.loginProvider
                }, defaultParams), params);
                _context6.next = 4;
                return this.request({
                  method: OPENLOGIN_METHOD.LOGIN,
                  allowedInteractions: [UX_MODE.REDIRECT, UX_MODE.POPUP],
                  startUrl: this.state.startUrl,
                  popupUrl: this.state.popupUrl,
                  params: [loginParams]
                });
              case 4:
                res = _context6.sent;
                this.state.privKey = res.privKey;
                if (!res.store) {
                  _context6.next = 10;
                  break;
                }
                this._syncState(res);
                _context6.next = 16;
                break;
              case 10:
                if (!(this.state.privKey && this.state.support3PC)) {
                  _context6.next = 16;
                  break;
                }
                _context6.t0 = this;
                _context6.next = 14;
                return this._getData();
              case 14:
                _context6.t1 = _context6.sent;
                _context6.t0._syncState.call(_context6.t0, _context6.t1);
              case 16:
                return _context6.abrupt("return", {
                  privKey: this.privKey
                });
              case 17:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));
      function _selectedLogin(_x2) {
        return _selectedLogin2.apply(this, arguments);
      }
      return _selectedLogin;
    }()
  }, {
    key: "logout",
    value: function() {
      var _logout = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee7() {
        var logoutParams, params, res, _args7 = arguments;
        return regenerator.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                logoutParams = _args7.length > 0 && _args7[0] !== void 0 ? _args7[0] : {};
                params = {};
                params.redirectUrl = this.state.redirectUrl;
                params._clientId = this.state.clientId;
                params.sessionId = this.state.store.get("sessionId");
                if (logoutParams.clientId) {
                  params._clientId = logoutParams.clientId;
                }
                if (logoutParams.redirectUrl !== void 0) {
                  params.redirectUrl = logoutParams.redirectUrl;
                }
                _context7.next = 9;
                return this.request({
                  method: OPENLOGIN_METHOD.LOGOUT,
                  params: [params],
                  startUrl: this.state.startUrl,
                  popupUrl: this.state.popupUrl,
                  allowedInteractions: [ALLOWED_INTERACTIONS.JRPC]
                });
              case 9:
                res = _context7.sent;
                this._syncState({
                  privKey: "",
                  coreKitKey: "",
                  walletKey: "",
                  oAuthPrivateKey: "",
                  tKey: "",
                  store: {
                    name: "",
                    profileImage: "",
                    dappShare: "",
                    idToken: "",
                    oAuthIdToken: "",
                    oAuthAccessToken: "",
                    sessionId: "",
                    sessionNamespace: "",
                    appState: ""
                  }
                });
                return _context7.abrupt("return", res);
              case 12:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));
      function logout() {
        return _logout.apply(this, arguments);
      }
      return logout;
    }()
  }, {
    key: "request",
    value: function() {
      var _request = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee8(args) {
        var _params$0$redirectUrl;
        var pid, params, session, startUrl, popupUrl, method, allowedInteractions, userData, sig, sessionId, u, windowRef, _u, _windowRef;
        return regenerator.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                pid = randomId();
                params = args.params;
                session = {};
                if (!(params.length !== 1)) {
                  _context8.next = 5;
                  break;
                }
                throw new Error("request params array should have only one element");
              case 5:
                startUrl = args.startUrl, popupUrl = args.popupUrl, method = args.method, allowedInteractions = args.allowedInteractions;
                if (!(allowedInteractions.length === 0)) {
                  _context8.next = 8;
                  break;
                }
                throw new Error("no allowed interactions");
              case 8:
                if (this.state.clientId) {
                  session._clientId = this.state.clientId;
                }
                if (this.state.sessionNamespace) {
                  session._sessionNamespace = this.state.sessionNamespace;
                }
                if (!this.privKey) {
                  _context8.next = 18;
                  break;
                }
                userData = {
                  clientId: session._clientId,
                  timestamp: Date.now().toString()
                };
                _context8.next = 14;
                return sign(Buffer.from(this.privKey, "hex"), Buffer.from(keccak("keccak256").update(JSON.stringify(userData)).digest("hex"), "hex"));
              case 14:
                sig = _context8.sent;
                session._user = getPublic_1(Buffer.from(this.privKey, "hex")).toString("hex");
                session._userSig = base64url.encode(sig);
                session._userData = userData;
              case 18:
                session._originData = this.state.originData;
                session._whiteLabelData = this.state.whiteLabel;
                session._loginConfig = this.state.loginConfig;
                session._sessionId = this.state.store.get("sessionId");
                session._webauthnTransports = this.state.webauthnTransports;
                if (!session._sessionId) {
                  sessionId = randomId();
                  session._sessionId = sessionId;
                  this.state.store.set("sessionId", sessionId);
                }
                params = [_objectSpread(_objectSpread({}, session), params[0])];
                if (!allowedInteractions.includes(ALLOWED_INTERACTIONS.JRPC)) {
                  _context8.next = 27;
                  break;
                }
                return _context8.abrupt("return", this._jrpcRequest({
                  method,
                  params
                }));
              case 27:
                params[0]._origin = new URL((_params$0$redirectUrl = params[0].redirectUrl) !== null && _params$0$redirectUrl !== void 0 ? _params$0$redirectUrl : this.state.redirectUrl).origin;
                if (!this.state.support3PC) {
                  _context8.next = 32;
                  break;
                }
                _context8.next = 31;
                return this._setPIDData(pid, params);
              case 31:
                params = [{}];
              case 32:
                if (!(!startUrl || !popupUrl)) {
                  _context8.next = 34;
                  break;
                }
                throw new Error("no url for redirect / popup flow");
              case 34:
                if (!(this.state.uxMode === UX_MODE.REDIRECT)) {
                  _context8.next = 44;
                  break;
                }
                if (!allowedInteractions.includes(ALLOWED_INTERACTIONS.REDIRECT)) {
                  _context8.next = 38;
                  break;
                }
                setTimeout(function() {
                  window.location.href = constructURL({
                    baseURL: startUrl,
                    hash: {
                      b64Params: jsonToBase64(params[0]),
                      _pid: pid,
                      _method: method
                    }
                  });
                }, 50);
                return _context8.abrupt("return", {});
              case 38:
                if (!allowedInteractions.includes(ALLOWED_INTERACTIONS.POPUP)) {
                  _context8.next = 42;
                  break;
                }
                u = new URL(constructURL({
                  baseURL: popupUrl,
                  hash: {
                    b64Params: jsonToBase64(params[0]),
                    _pid: pid,
                    _method: method
                  }
                }));
                windowRef = window.open(u.toString(), "_blank", getPopupFeatures());
                return _context8.abrupt("return", awaitReq(pid, windowRef));
              case 42:
                _context8.next = 51;
                break;
              case 44:
                if (!allowedInteractions.includes(ALLOWED_INTERACTIONS.POPUP)) {
                  _context8.next = 48;
                  break;
                }
                _u = new URL(constructURL({
                  baseURL: popupUrl,
                  hash: {
                    b64Params: jsonToBase64(params[0]),
                    _pid: pid,
                    _method: method
                  }
                }));
                _windowRef = window.open(_u.toString(), "_blank", getPopupFeatures());
                return _context8.abrupt("return", awaitReq(pid, _windowRef));
              case 48:
                if (!allowedInteractions.includes(ALLOWED_INTERACTIONS.REDIRECT)) {
                  _context8.next = 51;
                  break;
                }
                setTimeout(function() {
                  window.location.href = constructURL({
                    baseURL: startUrl,
                    hash: {
                      b64Params: jsonToBase64(params[0]),
                      _pid: pid,
                      _method: method
                    }
                  });
                }, 50);
                return _context8.abrupt("return", null);
              case 51:
                throw new Error("no matching allowed interactions");
              case 52:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));
      function request(_x3) {
        return _request.apply(this, arguments);
      }
      return request;
    }()
  }, {
    key: "_jrpcRequest",
    value: function() {
      var _jrpcRequest2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee9(args) {
        var _this = this;
        var method, params;
        return regenerator.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (!(!args || _typeof(args) !== "object" || Array.isArray(args))) {
                  _context9.next = 2;
                  break;
                }
                throw new Error("invalid request args");
              case 2:
                method = args.method, params = args.params;
                if (!(typeof method !== "string" || method.length === 0)) {
                  _context9.next = 5;
                  break;
                }
                throw new Error("invalid request method");
              case 5:
                if (!(params === void 0 || !Array.isArray(params))) {
                  _context9.next = 7;
                  break;
                }
                throw new Error("invalid request params");
              case 7:
                if (params.length === 0) {
                  params.push({});
                }
                return _context9.abrupt("return", new Promise(function(resolve, reject) {
                  _this.provider._rpcRequest({
                    method,
                    params
                  }, getRpcPromiseCallback(resolve, reject));
                }));
              case 9:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));
      function _jrpcRequest(_x4) {
        return _jrpcRequest2.apply(this, arguments);
      }
      return _jrpcRequest;
    }()
  }, {
    key: "_check3PCSupport",
    value: function() {
      var _check3PCSupport2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee10() {
        return regenerator.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt("return", this._jrpcRequest({
                  method: OPENLOGIN_METHOD.CHECK_3PC_SUPPORT,
                  params: [{
                    _originData: this.state.originData
                  }]
                }));
              case 1:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));
      function _check3PCSupport() {
        return _check3PCSupport2.apply(this, arguments);
      }
      return _check3PCSupport;
    }()
  }, {
    key: "_setPIDData",
    value: function() {
      var _setPIDData2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee11(pid, data) {
        return regenerator.wrap(function _callee11$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                _context11.next = 2;
                return this.request({
                  allowedInteractions: [ALLOWED_INTERACTIONS.JRPC],
                  method: OPENLOGIN_METHOD.SET_PID_DATA,
                  params: [{
                    pid,
                    data: data[0]
                  }]
                });
              case 2:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee11, this);
      }));
      function _setPIDData(_x5, _x6) {
        return _setPIDData2.apply(this, arguments);
      }
      return _setPIDData;
    }()
  }, {
    key: "_getData",
    value: function() {
      var _getData2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee12() {
        return regenerator.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                return _context12.abrupt("return", this.request({
                  allowedInteractions: [ALLOWED_INTERACTIONS.JRPC],
                  method: OPENLOGIN_METHOD.GET_DATA,
                  params: [{}]
                }));
              case 1:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this);
      }));
      function _getData() {
        return _getData2.apply(this, arguments);
      }
      return _getData;
    }()
  }, {
    key: "_syncState",
    value: function _syncState(newState) {
      var _this2 = this;
      if (newState.store) {
        if (_typeof(newState.store) !== "object") {
          throw new Error("expected store to be an object");
        }
        Object.keys(newState.store).forEach(function(key) {
          _this2.state.store.set(key, newState.store[key]);
        });
      }
      var store = this.state.store;
      this.state = _objectSpread(_objectSpread(_objectSpread({}, this.state), newState), {}, {
        store
      });
    }
  }, {
    key: "_modal",
    value: function() {
      var _modal2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee14(params) {
        var _this3 = this;
        return regenerator.wrap(function _callee14$(_context14) {
          while (1) {
            switch (_context14.prev = _context14.next) {
              case 0:
                return _context14.abrupt("return", new Promise(function(resolve, reject) {
                  _this3.modal._prompt(_this3.state.clientId, _this3.state.whiteLabel, _this3.state.loginConfig, /* @__PURE__ */ function() {
                    var _ref2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee13(chunk) {
                      var selectedLoginResponse;
                      return regenerator.wrap(function _callee13$(_context13) {
                        while (1) {
                          switch (_context13.prev = _context13.next) {
                            case 0:
                              if (!chunk.cancel) {
                                _context13.next = 4;
                                break;
                              }
                              reject(new Error("user canceled login"));
                              _context13.next = 14;
                              break;
                            case 4:
                              _context13.prev = 4;
                              _context13.next = 7;
                              return _this3._selectedLogin(merge(params, chunk));
                            case 7:
                              selectedLoginResponse = _context13.sent;
                              resolve(selectedLoginResponse);
                              _context13.next = 14;
                              break;
                            case 11:
                              _context13.prev = 11;
                              _context13.t0 = _context13["catch"](4);
                              reject(_context13.t0);
                            case 14:
                            case "end":
                              return _context13.stop();
                          }
                        }
                      }, _callee13, null, [[4, 11]]);
                    }));
                    return function(_x8) {
                      return _ref2.apply(this, arguments);
                    };
                  }());
                }));
              case 1:
              case "end":
                return _context14.stop();
            }
          }
        }, _callee14);
      }));
      function _modal(_x7) {
        return _modal2.apply(this, arguments);
      }
      return _modal;
    }()
  }, {
    key: "_cleanup",
    value: function() {
      var _cleanup2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee15() {
        return regenerator.wrap(function _callee15$(_context15) {
          while (1) {
            switch (_context15.prev = _context15.next) {
              case 0:
                _context15.next = 2;
                return this.modal.cleanup();
              case 2:
                this.provider.cleanup();
              case 3:
              case "end":
                return _context15.stop();
            }
          }
        }, _callee15, this);
      }));
      function _cleanup() {
        return _cleanup2.apply(this, arguments);
      }
      return _cleanup;
    }()
  }, {
    key: "encrypt",
    value: function() {
      var _encrypt2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee16(message, privateKey) {
        var privKey;
        return regenerator.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                privKey = privateKey;
                if (!privKey) {
                  privKey = this.privKey;
                }
                if (/^[0-9a-fA-f]{64}$/.exec(privKey)) {
                  _context16.next = 8;
                  break;
                }
                if (!(privKey === "" || privKey === void 0)) {
                  _context16.next = 7;
                  break;
                }
                throw new Error("private key cannot be empty");
              case 7:
                throw new Error("invalid private key in encrypt");
              case 8:
                return _context16.abrupt("return", encrypt(getPublic_1(Buffer.from(privKey, "hex")), message));
              case 9:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this);
      }));
      function encrypt$1(_x9, _x10) {
        return _encrypt2.apply(this, arguments);
      }
      return encrypt$1;
    }()
  }, {
    key: "decrypt",
    value: function() {
      var _decrypt2 = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee17(ciphertext, privateKey) {
        var privKey;
        return regenerator.wrap(function _callee17$(_context17) {
          while (1) {
            switch (_context17.prev = _context17.next) {
              case 0:
                privKey = privateKey;
                if (!privKey) {
                  privKey = this.privKey;
                }
                if (/^[0-9a-fA-f]{64}$/.exec(privKey)) {
                  _context17.next = 8;
                  break;
                }
                if (!(privKey === "" || privKey === void 0)) {
                  _context17.next = 7;
                  break;
                }
                throw new Error("private key cannot be empty");
              case 7:
                throw new Error("invalid private key in decrypt");
              case 8:
                return _context17.abrupt("return", decrypt(Buffer.from(privKey, "hex"), ciphertext));
              case 9:
              case "end":
                return _context17.stop();
            }
          }
        }, _callee17, this);
      }));
      function decrypt$1(_x11, _x12) {
        return _decrypt2.apply(this, arguments);
      }
      return decrypt$1;
    }()
  }, {
    key: "getUserInfo",
    value: function() {
      var _getUserInfo = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee18() {
        var storeData, userInfo;
        return regenerator.wrap(function _callee18$(_context18) {
          while (1) {
            switch (_context18.prev = _context18.next) {
              case 0:
                if (!this.privKey) {
                  _context18.next = 4;
                  break;
                }
                storeData = this.state.store.getStore();
                userInfo = {
                  email: storeData.email || "",
                  name: storeData.name || "",
                  profileImage: storeData.profileImage || "",
                  aggregateVerifier: storeData.aggregateVerifier || "",
                  verifier: storeData.verifier || "",
                  verifierId: storeData.verifierId || "",
                  typeOfLogin: storeData.typeOfLogin || "",
                  dappShare: storeData.dappShare || "",
                  idToken: storeData.idToken || "",
                  oAuthIdToken: storeData.oAuthIdToken || "",
                  oAuthAccessToken: storeData.oAuthAccessToken || ""
                };
                return _context18.abrupt("return", userInfo);
              case 4:
                throw new Error("user should be logged in to fetch userInfo");
              case 5:
              case "end":
                return _context18.stop();
            }
          }
        }, _callee18, this);
      }));
      function getUserInfo() {
        return _getUserInfo.apply(this, arguments);
      }
      return getUserInfo;
    }()
  }, {
    key: "getEncodedLoginUrl",
    value: function() {
      var _getEncodedLoginUrl = _asyncToGenerator(/* @__PURE__ */ regenerator.mark(function _callee19(loginParams) {
        var redirectUrl, clientId, dataObject, b64Params, hashParams;
        return regenerator.wrap(function _callee19$(_context19) {
          while (1) {
            switch (_context19.prev = _context19.next) {
              case 0:
                redirectUrl = loginParams.redirectUrl;
                clientId = this.state.clientId;
                if (this.state.originData[origin]) {
                  _context19.next = 5;
                  break;
                }
                _context19.next = 5;
                return this.updateOriginData();
              case 5:
                dataObject = _objectSpread({
                  _clientId: clientId,
                  _origin: new URL(redirectUrl).origin,
                  _originData: this.state.originData,
                  redirectUrl
                }, loginParams);
                b64Params = jsonToBase64(dataObject);
                hashParams = {
                  b64Params,
                  _method: "openlogin_login"
                };
                return _context19.abrupt("return", constructURL({
                  baseURL: "".concat(this.state.iframeUrl, "/start"),
                  hash: hashParams
                }));
              case 9:
              case "end":
                return _context19.stop();
            }
          }
        }, _callee19, this);
      }));
      function getEncodedLoginUrl(_x13) {
        return _getEncodedLoginUrl.apply(this, arguments);
      }
      return getEncodedLoginUrl;
    }()
  }]);
  return OpenLogin2;
}();
export {
  LOGIN_PROVIDER as L,
  OPENLOGIN_NETWORK as O,
  SUPPORTED_KEY_CURVES as S,
  UX_MODE as U,
  __vitePreload as _,
  OpenLogin as a,
  getHashQueryParams as g
};
