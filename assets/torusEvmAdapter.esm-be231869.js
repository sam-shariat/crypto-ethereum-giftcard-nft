import { r as require$$0, d as requireEvents, c as commonjsGlobal, e as buffer, T as inherits_browserExports, U as browser, q as loglevel, S as SafeEventEmitter$1, f as _defineProperty, K as get, V as ObjectMultiplex, D as pump_1, B as createStreamMiddleware, J as JRPCEngine, F as createIdRemapMiddleware, X as dist$1, n as merge, Y as BasePostMessageStream, x as setupMultiplex, Z as eventsExports, $ as setAPIKey, m as WALLET_ADAPTERS, i as ADAPTER_NAMESPACES, C as CHAIN_NAMESPACES, p as ADAPTER_CATEGORY, A as ADAPTER_STATUS, h as getChainConfig, l as log$1, k as ADAPTER_EVENTS, W as WalletInitializationError, a0 as Web3AuthError, j as WalletLoginError } from "./base.esm-570dabbe.js";
import { _ as _objectWithoutPropertiesLoose } from "./objectWithoutPropertiesLoose-8e6f8e69.js";
import { u as util$3, b as browser$1 } from "./browser-cf62a047.js";
import { i as isStream_1, f as fastDeepEqual } from "./index-00c36874.js";
import { B as BaseEvmAdapter } from "./baseEvmAdapter.esm-f449d957.js";
function _objectWithoutProperties(source, excluded) {
  if (source == null)
    return {};
  var target = _objectWithoutPropertiesLoose(source, excluded);
  var key, i;
  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0)
        continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key))
        continue;
      target[key] = source[key];
    }
  }
  return target;
}
var dist = {};
var asStream = {};
Object.defineProperty(asStream, "__esModule", { value: true });
asStream.storeAsStream = void 0;
const stream_1 = require$$0;
class ObservableStoreStream extends stream_1.Duplex {
  constructor(obsStore) {
    super({
      // pass values, not serializations
      objectMode: true
    });
    this.resume();
    this.handler = (state) => this.push(state);
    this.obsStore = obsStore;
    this.obsStore.subscribe(this.handler);
  }
  // emit current state on new destination
  pipe(dest, options) {
    const result = super.pipe(dest, options);
    dest.write(this.obsStore.getState());
    return result;
  }
  // write from incoming stream to state
  _write(chunk, _encoding, callback) {
    this.obsStore.putState(chunk);
    callback();
  }
  // noop - outgoing stream is asking us if we have data we arent giving it
  _read(_size) {
    return void 0;
  }
  // unsubscribe from event emitter
  _destroy(err, callback) {
    this.obsStore.unsubscribe(this.handler);
    super._destroy(err, callback);
  }
}
function storeAsStream(obsStore) {
  return new ObservableStoreStream(obsStore);
}
asStream.storeAsStream = storeAsStream;
var ComposedStore$1 = {};
var ObservableStore$1 = {};
var safeEventEmitter = {};
Object.defineProperty(safeEventEmitter, "__esModule", { value: true });
const events_1 = requireEvents();
function safeApply(handler, context, args) {
  try {
    Reflect.apply(handler, context, args);
  } catch (err) {
    setTimeout(() => {
      throw err;
    });
  }
}
function arrayClone(arr) {
  const n = arr.length;
  const copy = new Array(n);
  for (let i = 0; i < n; i += 1) {
    copy[i] = arr[i];
  }
  return copy;
}
class SafeEventEmitter extends events_1.EventEmitter {
  emit(type, ...args) {
    let doError = type === "error";
    const events = this._events;
    if (events !== void 0) {
      doError = doError && events.error === void 0;
    } else if (!doError) {
      return false;
    }
    if (doError) {
      let er;
      if (args.length > 0) {
        [er] = args;
      }
      if (er instanceof Error) {
        throw er;
      }
      const err = new Error(`Unhandled error.${er ? ` (${er.message})` : ""}`);
      err.context = er;
      throw err;
    }
    const handler = events[type];
    if (handler === void 0) {
      return false;
    }
    if (typeof handler === "function") {
      safeApply(handler, this, args);
    } else {
      const len = handler.length;
      const listeners = arrayClone(handler);
      for (let i = 0; i < len; i += 1) {
        safeApply(listeners[i], this, args);
      }
    }
    return true;
  }
}
safeEventEmitter.default = SafeEventEmitter;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(ObservableStore$1, "__esModule", { value: true });
ObservableStore$1.ObservableStore = void 0;
const safe_event_emitter_1 = __importDefault(safeEventEmitter);
class ObservableStore extends safe_event_emitter_1.default {
  constructor(initState) {
    super();
    if (initState) {
      this._state = initState;
    } else {
      this._state = {};
    }
  }
  // wrapper around internal getState
  getState() {
    return this._getState();
  }
  // wrapper around internal putState
  putState(newState) {
    this._putState(newState);
    this.emit("update", newState);
  }
  updateState(partialState) {
    if (partialState && typeof partialState === "object") {
      const state = this.getState();
      this.putState(Object.assign(Object.assign({}, state), partialState));
    } else {
      this.putState(partialState);
    }
  }
  // subscribe to changes
  subscribe(handler) {
    this.on("update", handler);
  }
  // unsubscribe to changes
  unsubscribe(handler) {
    this.removeListener("update", handler);
  }
  //
  // private
  //
  // read from persistence
  _getState() {
    return this._state;
  }
  // write to persistence
  _putState(newState) {
    this._state = newState;
  }
}
ObservableStore$1.ObservableStore = ObservableStore;
Object.defineProperty(ComposedStore$1, "__esModule", { value: true });
ComposedStore$1.ComposedStore = void 0;
const ObservableStore_1$1 = ObservableStore$1;
class ComposedStore extends ObservableStore_1$1.ObservableStore {
  constructor(children) {
    super({});
    this._children = children || {};
    Object.keys(this._children).forEach((childKey) => {
      const child = this._children[childKey];
      this._addChild(childKey, child);
    });
  }
  _addChild(childKey, child) {
    const updateFromChild = (childValue) => {
      const state = this.getState();
      state[childKey] = childValue;
      this.putState(state);
    };
    child.subscribe(updateFromChild);
    updateFromChild(child.getState());
  }
}
ComposedStore$1.ComposedStore = ComposedStore;
var MergedStore$1 = {};
Object.defineProperty(MergedStore$1, "__esModule", { value: true });
MergedStore$1.MergedStore = void 0;
const ObservableStore_1 = ObservableStore$1;
class MergedStore extends ObservableStore_1.ObservableStore {
  constructor(children = []) {
    super({});
    this._children = children;
    children.forEach((child) => this._addChild(child));
    this._updateWholeState();
  }
  _addChild(child) {
    child.subscribe(() => this._updateWholeState());
  }
  _updateWholeState() {
    const childStates = this._children.map((child) => child.getState());
    const state = Object.assign({}, ...childStates);
    this.putState(state);
  }
}
MergedStore$1.MergedStore = MergedStore;
var transform = {};
var through2Exports = {};
var through2$1 = {
  get exports() {
    return through2Exports;
  },
  set exports(v) {
    through2Exports = v;
  }
};
var readableBrowserExports = {};
var readableBrowser = {
  get exports() {
    return readableBrowserExports;
  },
  set exports(v) {
    readableBrowserExports = v;
  }
};
var processNextickArgsExports = {};
var processNextickArgs = {
  get exports() {
    return processNextickArgsExports;
  },
  set exports(v) {
    processNextickArgsExports = v;
  }
};
if (typeof process === "undefined" || !process.version || process.version.indexOf("v0.") === 0 || process.version.indexOf("v1.") === 0 && process.version.indexOf("v1.8.") !== 0) {
  processNextickArgs.exports = { nextTick };
} else {
  processNextickArgs.exports = process;
}
function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== "function") {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
    case 0:
    case 1:
      return process.nextTick(fn);
    case 2:
      return process.nextTick(function afterTickOne() {
        fn.call(null, arg1);
      });
    case 3:
      return process.nextTick(function afterTickTwo() {
        fn.call(null, arg1, arg2);
      });
    case 4:
      return process.nextTick(function afterTickThree() {
        fn.call(null, arg1, arg2, arg3);
      });
    default:
      args = new Array(len - 1);
      i = 0;
      while (i < args.length) {
        args[i++] = arguments[i];
      }
      return process.nextTick(function afterTick() {
        fn.apply(null, args);
      });
  }
}
var toString = {}.toString;
var isarray = Array.isArray || function(arr) {
  return toString.call(arr) == "[object Array]";
};
var streamBrowser = requireEvents().EventEmitter;
var safeBufferExports = {};
var safeBuffer = {
  get exports() {
    return safeBufferExports;
  },
  set exports(v) {
    safeBufferExports = v;
  }
};
(function(module, exports) {
  var buffer$1 = buffer;
  var Buffer2 = buffer$1.Buffer;
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
    module.exports = buffer$1;
  } else {
    copyProps(buffer$1, exports);
    exports.Buffer = SafeBuffer;
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer2(arg, encodingOrOffset, length);
  }
  copyProps(Buffer2, SafeBuffer);
  SafeBuffer.from = function(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer2(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function(size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer2(size);
    if (fill !== void 0) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer2(size);
  };
  SafeBuffer.allocUnsafeSlow = function(size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer$1.SlowBuffer(size);
  };
})(safeBuffer, safeBufferExports);
var util$2 = {};
function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === "[object Array]";
}
util$2.isArray = isArray;
function isBoolean(arg) {
  return typeof arg === "boolean";
}
util$2.isBoolean = isBoolean;
function isNull(arg) {
  return arg === null;
}
util$2.isNull = isNull;
function isNullOrUndefined(arg) {
  return arg == null;
}
util$2.isNullOrUndefined = isNullOrUndefined;
function isNumber(arg) {
  return typeof arg === "number";
}
util$2.isNumber = isNumber;
function isString(arg) {
  return typeof arg === "string";
}
util$2.isString = isString;
function isSymbol(arg) {
  return typeof arg === "symbol";
}
util$2.isSymbol = isSymbol;
function isUndefined(arg) {
  return arg === void 0;
}
util$2.isUndefined = isUndefined;
function isRegExp(re) {
  return objectToString(re) === "[object RegExp]";
}
util$2.isRegExp = isRegExp;
function isObject(arg) {
  return typeof arg === "object" && arg !== null;
}
util$2.isObject = isObject;
function isDate(d) {
  return objectToString(d) === "[object Date]";
}
util$2.isDate = isDate;
function isError(e) {
  return objectToString(e) === "[object Error]" || e instanceof Error;
}
util$2.isError = isError;
function isFunction(arg) {
  return typeof arg === "function";
}
util$2.isFunction = isFunction;
function isPrimitive(arg) {
  return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
  typeof arg === "undefined";
}
util$2.isPrimitive = isPrimitive;
util$2.isBuffer = buffer.Buffer.isBuffer;
function objectToString(o) {
  return Object.prototype.toString.call(o);
}
var BufferListExports = {};
var BufferList = {
  get exports() {
    return BufferListExports;
  },
  set exports(v) {
    BufferListExports = v;
  }
};
var hasRequiredBufferList;
function requireBufferList() {
  if (hasRequiredBufferList)
    return BufferListExports;
  hasRequiredBufferList = 1;
  (function(module) {
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Buffer2 = safeBufferExports.Buffer;
    var util2 = require$$0;
    function copyBuffer(src, target, offset) {
      src.copy(target, offset);
    }
    module.exports = function() {
      function BufferList2() {
        _classCallCheck(this, BufferList2);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      BufferList2.prototype.push = function push(v) {
        var entry = { data: v, next: null };
        if (this.length > 0)
          this.tail.next = entry;
        else
          this.head = entry;
        this.tail = entry;
        ++this.length;
      };
      BufferList2.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head };
        if (this.length === 0)
          this.tail = entry;
        this.head = entry;
        ++this.length;
      };
      BufferList2.prototype.shift = function shift() {
        if (this.length === 0)
          return;
        var ret = this.head.data;
        if (this.length === 1)
          this.head = this.tail = null;
        else
          this.head = this.head.next;
        --this.length;
        return ret;
      };
      BufferList2.prototype.clear = function clear() {
        this.head = this.tail = null;
        this.length = 0;
      };
      BufferList2.prototype.join = function join(s) {
        if (this.length === 0)
          return "";
        var p = this.head;
        var ret = "" + p.data;
        while (p = p.next) {
          ret += s + p.data;
        }
        return ret;
      };
      BufferList2.prototype.concat = function concat(n) {
        if (this.length === 0)
          return Buffer2.alloc(0);
        if (this.length === 1)
          return this.head.data;
        var ret = Buffer2.allocUnsafe(n >>> 0);
        var p = this.head;
        var i = 0;
        while (p) {
          copyBuffer(p.data, ret, i);
          i += p.data.length;
          p = p.next;
        }
        return ret;
      };
      return BufferList2;
    }();
    if (util2 && util2.inspect && util2.inspect.custom) {
      module.exports.prototype[util2.inspect.custom] = function() {
        var obj = util2.inspect({ length: this.length });
        return this.constructor.name + " " + obj;
      };
    }
  })(BufferList);
  return BufferListExports;
}
var pna = processNextickArgsExports;
function destroy(err, cb) {
  var _this = this;
  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;
  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }
  if (this._readableState) {
    this._readableState.destroyed = true;
  }
  if (this._writableState) {
    this._writableState.destroyed = true;
  }
  this._destroy(err || null, function(err2) {
    if (!cb && err2) {
      pna.nextTick(emitErrorNT, _this, err2);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err2);
    }
  });
  return this;
}
function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }
  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}
function emitErrorNT(self, err) {
  self.emit("error", err);
}
var destroy_1 = {
  destroy,
  undestroy
};
var _stream_writable;
var hasRequired_stream_writable;
function require_stream_writable() {
  if (hasRequired_stream_writable)
    return _stream_writable;
  hasRequired_stream_writable = 1;
  var pna2 = processNextickArgsExports;
  _stream_writable = Writable;
  function CorkedRequest(state) {
    var _this = this;
    this.next = null;
    this.entry = null;
    this.finish = function() {
      onCorkedFinish(_this, state);
    };
  }
  var asyncWrite = !process.browser && ["v0.10", "v0.9."].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna2.nextTick;
  var Duplex2;
  Writable.WritableState = WritableState;
  var util2 = Object.create(util$2);
  util2.inherits = inherits_browserExports;
  var internalUtil = {
    deprecate: browser
  };
  var Stream = streamBrowser;
  var Buffer2 = safeBufferExports.Buffer;
  var OurUint8Array = commonjsGlobal.Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var destroyImpl = destroy_1;
  util2.inherits(Writable, Stream);
  function nop() {
  }
  function WritableState(options, stream) {
    Duplex2 = Duplex2 || require_stream_duplex();
    options = options || {};
    var isDuplex = stream instanceof Duplex2;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var writableHwm = options.writableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
      this.highWaterMark = hwm;
    else if (isDuplex && (writableHwm || writableHwm === 0))
      this.highWaterMark = writableHwm;
    else
      this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.finalCalled = false;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    this.destroyed = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
    this.bufferedRequestCount = 0;
    this.corkedRequestsFree = new CorkedRequest(this);
  }
  WritableState.prototype.getBuffer = function getBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, "buffer", {
        get: internalUtil.deprecate(function() {
          return this.getBuffer();
        }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
      });
    } catch (_) {
    }
  })();
  var realHasInstance;
  if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
    realHasInstance = Function.prototype[Symbol.hasInstance];
    Object.defineProperty(Writable, Symbol.hasInstance, {
      value: function(object) {
        if (realHasInstance.call(this, object))
          return true;
        if (this !== Writable)
          return false;
        return object && object._writableState instanceof WritableState;
      }
    });
  } else {
    realHasInstance = function(object) {
      return object instanceof this;
    };
  }
  function Writable(options) {
    Duplex2 = Duplex2 || require_stream_duplex();
    if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex2)) {
      return new Writable(options);
    }
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
      if (typeof options.write === "function")
        this._write = options.write;
      if (typeof options.writev === "function")
        this._writev = options.writev;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
      if (typeof options.final === "function")
        this._final = options.final;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    this.emit("error", new Error("Cannot pipe, not readable"));
  };
  function writeAfterEnd(stream, cb) {
    var er = new Error("write after end");
    stream.emit("error", er);
    pna2.nextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var valid = true;
    var er = false;
    if (chunk === null) {
      er = new TypeError("May not write null values to stream");
    } else if (typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    if (er) {
      stream.emit("error", er);
      pna2.nextTick(cb, er);
      valid = false;
    }
    return valid;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    var isBuf = !state.objectMode && _isUint8Array(chunk);
    if (isBuf && !Buffer2.isBuffer(chunk)) {
      chunk = _uint8ArrayToBuffer(chunk);
    }
    if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (isBuf)
      encoding = "buffer";
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== "function")
      cb = nop;
    if (state.ended)
      writeAfterEnd(this, cb);
    else if (isBuf || validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    var state = this._writableState;
    state.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === "string")
      encoding = encoding.toLowerCase();
    if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1))
      throw new TypeError("Unknown encoding: " + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
      chunk = Buffer2.from(chunk, encoding);
    }
    return chunk;
  }
  Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
    if (!isBuf) {
      var newChunk = decodeChunk(state, chunk, encoding);
      if (chunk !== newChunk) {
        isBuf = true;
        encoding = "buffer";
        chunk = newChunk;
      }
    }
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = {
        chunk,
        encoding,
        isBuf,
        callback: cb,
        next: null
      };
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) {
      pna2.nextTick(cb, er);
      pna2.nextTick(finishMaybe, stream, state);
      stream._writableState.errorEmitted = true;
      stream.emit("error", er);
    } else {
      cb(er);
      stream._writableState.errorEmitted = true;
      stream.emit("error", er);
      finishMaybe(stream, state);
    }
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state);
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        asyncWrite(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit("drain");
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var l = state.bufferedRequestCount;
      var buffer2 = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;
      var count = 0;
      var allBuffers = true;
      while (entry) {
        buffer2[count] = entry;
        if (!entry.isBuf)
          allBuffers = false;
        entry = entry.next;
        count += 1;
      }
      buffer2.allBuffers = allBuffers;
      doWrite(stream, state, true, state.length, buffer2, "", holder.finish);
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
      state.bufferedRequestCount = 0;
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        state.bufferedRequestCount--;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new Error("_write() is not implemented"));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === "function") {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === "function") {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== void 0)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending && !state.finished)
      endWritable(this, state, cb);
  };
  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }
  function callFinal(stream, state) {
    stream._final(function(err) {
      state.pendingcb--;
      if (err) {
        stream.emit("error", err);
      }
      state.prefinished = true;
      stream.emit("prefinish");
      finishMaybe(stream, state);
    });
  }
  function prefinish2(stream, state) {
    if (!state.prefinished && !state.finalCalled) {
      if (typeof stream._final === "function") {
        state.pendingcb++;
        state.finalCalled = true;
        pna2.nextTick(callFinal, stream, state);
      } else {
        state.prefinished = true;
        stream.emit("prefinish");
      }
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      prefinish2(stream, state);
      if (state.pendingcb === 0) {
        state.finished = true;
        stream.emit("finish");
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        pna2.nextTick(cb);
      else
        stream.once("finish", cb);
    }
    state.ended = true;
    stream.writable = false;
  }
  function onCorkedFinish(corkReq, state, err) {
    var entry = corkReq.entry;
    corkReq.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = corkReq;
    } else {
      state.corkedRequestsFree = corkReq;
    }
  }
  Object.defineProperty(Writable.prototype, "destroyed", {
    get: function() {
      if (this._writableState === void 0) {
        return false;
      }
      return this._writableState.destroyed;
    },
    set: function(value) {
      if (!this._writableState) {
        return;
      }
      this._writableState.destroyed = value;
    }
  });
  Writable.prototype.destroy = destroyImpl.destroy;
  Writable.prototype._undestroy = destroyImpl.undestroy;
  Writable.prototype._destroy = function(err, cb) {
    this.end();
    cb(err);
  };
  return _stream_writable;
}
var _stream_duplex;
var hasRequired_stream_duplex;
function require_stream_duplex() {
  if (hasRequired_stream_duplex)
    return _stream_duplex;
  hasRequired_stream_duplex = 1;
  var pna2 = processNextickArgsExports;
  var objectKeys = Object.keys || function(obj) {
    var keys2 = [];
    for (var key in obj) {
      keys2.push(key);
    }
    return keys2;
  };
  _stream_duplex = Duplex2;
  var util2 = Object.create(util$2);
  util2.inherits = inherits_browserExports;
  var Readable = require_stream_readable();
  var Writable = require_stream_writable();
  util2.inherits(Duplex2, Readable);
  {
    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex2.prototype[method])
        Duplex2.prototype[method] = Writable.prototype[method];
    }
  }
  function Duplex2(options) {
    if (!(this instanceof Duplex2))
      return new Duplex2(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false)
      this.readable = false;
    if (options && options.writable === false)
      this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false)
      this.allowHalfOpen = false;
    this.once("end", onend);
  }
  Object.defineProperty(Duplex2.prototype, "writableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._writableState.highWaterMark;
    }
  });
  function onend() {
    if (this.allowHalfOpen || this._writableState.ended)
      return;
    pna2.nextTick(onEndNT, this);
  }
  function onEndNT(self) {
    self.end();
  }
  Object.defineProperty(Duplex2.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return false;
      }
      return this._readableState.destroyed && this._writableState.destroyed;
    },
    set: function(value) {
      if (this._readableState === void 0 || this._writableState === void 0) {
        return;
      }
      this._readableState.destroyed = value;
      this._writableState.destroyed = value;
    }
  });
  Duplex2.prototype._destroy = function(err, cb) {
    this.push(null);
    this.end();
    pna2.nextTick(cb, err);
  };
  return _stream_duplex;
}
var string_decoder = {};
var hasRequiredString_decoder;
function requireString_decoder() {
  if (hasRequiredString_decoder)
    return string_decoder;
  hasRequiredString_decoder = 1;
  var Buffer2 = safeBufferExports.Buffer;
  var isEncoding = Buffer2.isEncoding || function(encoding) {
    encoding = "" + encoding;
    switch (encoding && encoding.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return true;
      default:
        return false;
    }
  };
  function _normalizeEncoding(enc) {
    if (!enc)
      return "utf8";
    var retried;
    while (true) {
      switch (enc) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return enc;
        default:
          if (retried)
            return;
          enc = ("" + enc).toLowerCase();
          retried = true;
      }
    }
  }
  function normalizeEncoding(enc) {
    var nenc = _normalizeEncoding(enc);
    if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
      throw new Error("Unknown encoding: " + enc);
    return nenc || enc;
  }
  string_decoder.StringDecoder = StringDecoder;
  function StringDecoder(encoding) {
    this.encoding = normalizeEncoding(encoding);
    var nb;
    switch (this.encoding) {
      case "utf16le":
        this.text = utf16Text;
        this.end = utf16End;
        nb = 4;
        break;
      case "utf8":
        this.fillLast = utf8FillLast;
        nb = 4;
        break;
      case "base64":
        this.text = base64Text;
        this.end = base64End;
        nb = 3;
        break;
      default:
        this.write = simpleWrite;
        this.end = simpleEnd;
        return;
    }
    this.lastNeed = 0;
    this.lastTotal = 0;
    this.lastChar = Buffer2.allocUnsafe(nb);
  }
  StringDecoder.prototype.write = function(buf) {
    if (buf.length === 0)
      return "";
    var r;
    var i;
    if (this.lastNeed) {
      r = this.fillLast(buf);
      if (r === void 0)
        return "";
      i = this.lastNeed;
      this.lastNeed = 0;
    } else {
      i = 0;
    }
    if (i < buf.length)
      return r ? r + this.text(buf, i) : this.text(buf, i);
    return r || "";
  };
  StringDecoder.prototype.end = utf8End;
  StringDecoder.prototype.text = utf8Text;
  StringDecoder.prototype.fillLast = function(buf) {
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
    this.lastNeed -= buf.length;
  };
  function utf8CheckByte(byte) {
    if (byte <= 127)
      return 0;
    else if (byte >> 5 === 6)
      return 2;
    else if (byte >> 4 === 14)
      return 3;
    else if (byte >> 3 === 30)
      return 4;
    return byte >> 6 === 2 ? -1 : -2;
  }
  function utf8CheckIncomplete(self, buf, i) {
    var j = buf.length - 1;
    if (j < i)
      return 0;
    var nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self.lastNeed = nb - 1;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0)
        self.lastNeed = nb - 2;
      return nb;
    }
    if (--j < i || nb === -2)
      return 0;
    nb = utf8CheckByte(buf[j]);
    if (nb >= 0) {
      if (nb > 0) {
        if (nb === 2)
          nb = 0;
        else
          self.lastNeed = nb - 3;
      }
      return nb;
    }
    return 0;
  }
  function utf8CheckExtraBytes(self, buf, p) {
    if ((buf[0] & 192) !== 128) {
      self.lastNeed = 0;
      return "�";
    }
    if (self.lastNeed > 1 && buf.length > 1) {
      if ((buf[1] & 192) !== 128) {
        self.lastNeed = 1;
        return "�";
      }
      if (self.lastNeed > 2 && buf.length > 2) {
        if ((buf[2] & 192) !== 128) {
          self.lastNeed = 2;
          return "�";
        }
      }
    }
  }
  function utf8FillLast(buf) {
    var p = this.lastTotal - this.lastNeed;
    var r = utf8CheckExtraBytes(this, buf);
    if (r !== void 0)
      return r;
    if (this.lastNeed <= buf.length) {
      buf.copy(this.lastChar, p, 0, this.lastNeed);
      return this.lastChar.toString(this.encoding, 0, this.lastTotal);
    }
    buf.copy(this.lastChar, p, 0, buf.length);
    this.lastNeed -= buf.length;
  }
  function utf8Text(buf, i) {
    var total = utf8CheckIncomplete(this, buf, i);
    if (!this.lastNeed)
      return buf.toString("utf8", i);
    this.lastTotal = total;
    var end = buf.length - (total - this.lastNeed);
    buf.copy(this.lastChar, 0, end);
    return buf.toString("utf8", i, end);
  }
  function utf8End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + "�";
    return r;
  }
  function utf16Text(buf, i) {
    if ((buf.length - i) % 2 === 0) {
      var r = buf.toString("utf16le", i);
      if (r) {
        var c = r.charCodeAt(r.length - 1);
        if (c >= 55296 && c <= 56319) {
          this.lastNeed = 2;
          this.lastTotal = 4;
          this.lastChar[0] = buf[buf.length - 2];
          this.lastChar[1] = buf[buf.length - 1];
          return r.slice(0, -1);
        }
      }
      return r;
    }
    this.lastNeed = 1;
    this.lastTotal = 2;
    this.lastChar[0] = buf[buf.length - 1];
    return buf.toString("utf16le", i, buf.length - 1);
  }
  function utf16End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed) {
      var end = this.lastTotal - this.lastNeed;
      return r + this.lastChar.toString("utf16le", 0, end);
    }
    return r;
  }
  function base64Text(buf, i) {
    var n = (buf.length - i) % 3;
    if (n === 0)
      return buf.toString("base64", i);
    this.lastNeed = 3 - n;
    this.lastTotal = 3;
    if (n === 1) {
      this.lastChar[0] = buf[buf.length - 1];
    } else {
      this.lastChar[0] = buf[buf.length - 2];
      this.lastChar[1] = buf[buf.length - 1];
    }
    return buf.toString("base64", i, buf.length - n);
  }
  function base64End(buf) {
    var r = buf && buf.length ? this.write(buf) : "";
    if (this.lastNeed)
      return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
    return r;
  }
  function simpleWrite(buf) {
    return buf.toString(this.encoding);
  }
  function simpleEnd(buf) {
    return buf && buf.length ? this.write(buf) : "";
  }
  return string_decoder;
}
var _stream_readable;
var hasRequired_stream_readable;
function require_stream_readable() {
  if (hasRequired_stream_readable)
    return _stream_readable;
  hasRequired_stream_readable = 1;
  var pna2 = processNextickArgsExports;
  _stream_readable = Readable;
  var isArray2 = isarray;
  var Duplex2;
  Readable.ReadableState = ReadableState;
  requireEvents().EventEmitter;
  var EElistenerCount = function(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream = streamBrowser;
  var Buffer2 = safeBufferExports.Buffer;
  var OurUint8Array = commonjsGlobal.Uint8Array || function() {
  };
  function _uint8ArrayToBuffer(chunk) {
    return Buffer2.from(chunk);
  }
  function _isUint8Array(obj) {
    return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
  }
  var util2 = Object.create(util$2);
  util2.inherits = inherits_browserExports;
  var debugUtil = require$$0;
  var debug = void 0;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog("stream");
  } else {
    debug = function() {
    };
  }
  var BufferList2 = requireBufferList();
  var destroyImpl = destroy_1;
  var StringDecoder;
  util2.inherits(Readable, Stream);
  var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
  function prependListener(emitter, event, fn) {
    if (typeof emitter.prependListener === "function")
      return emitter.prependListener(event, fn);
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (isArray2(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
  function ReadableState(options, stream) {
    Duplex2 = Duplex2 || require_stream_duplex();
    options = options || {};
    var isDuplex = stream instanceof Duplex2;
    this.objectMode = !!options.objectMode;
    if (isDuplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var readableHwm = options.readableHighWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    if (hwm || hwm === 0)
      this.highWaterMark = hwm;
    else if (isDuplex && (readableHwm || readableHwm === 0))
      this.highWaterMark = readableHwm;
    else
      this.highWaterMark = defaultHwm;
    this.highWaterMark = Math.floor(this.highWaterMark);
    this.buffer = new BufferList2();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;
    this.destroyed = false;
    this.defaultEncoding = options.defaultEncoding || "utf8";
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = requireString_decoder().StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {
    Duplex2 = Duplex2 || require_stream_duplex();
    if (!(this instanceof Readable))
      return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options) {
      if (typeof options.read === "function")
        this._read = options.read;
      if (typeof options.destroy === "function")
        this._destroy = options.destroy;
    }
    Stream.call(this);
  }
  Object.defineProperty(Readable.prototype, "destroyed", {
    get: function() {
      if (this._readableState === void 0) {
        return false;
      }
      return this._readableState.destroyed;
    },
    set: function(value) {
      if (!this._readableState) {
        return;
      }
      this._readableState.destroyed = value;
    }
  });
  Readable.prototype.destroy = destroyImpl.destroy;
  Readable.prototype._undestroy = destroyImpl.undestroy;
  Readable.prototype._destroy = function(err, cb) {
    this.push(null);
    cb(err);
  };
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    var skipChunkCheck;
    if (!state.objectMode) {
      if (typeof chunk === "string") {
        encoding = encoding || state.defaultEncoding;
        if (encoding !== state.encoding) {
          chunk = Buffer2.from(chunk, encoding);
          encoding = "";
        }
        skipChunkCheck = true;
      }
    } else {
      skipChunkCheck = true;
    }
    return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
  };
  Readable.prototype.unshift = function(chunk) {
    return readableAddChunk(this, chunk, null, true, false);
  };
  function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
    var state = stream._readableState;
    if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else {
      var er;
      if (!skipChunkCheck)
        er = chunkInvalid(state, chunk);
      if (er) {
        stream.emit("error", er);
      } else if (state.objectMode || chunk && chunk.length > 0) {
        if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
          chunk = _uint8ArrayToBuffer(chunk);
        }
        if (addToFront) {
          if (state.endEmitted)
            stream.emit("error", new Error("stream.unshift() after end event"));
          else
            addChunk(stream, state, chunk, true);
        } else if (state.ended) {
          stream.emit("error", new Error("stream.push() after EOF"));
        } else {
          state.reading = false;
          if (state.decoder && !encoding) {
            chunk = state.decoder.write(chunk);
            if (state.objectMode || chunk.length !== 0)
              addChunk(stream, state, chunk, false);
            else
              maybeReadMore(stream, state);
          } else {
            addChunk(stream, state, chunk, false);
          }
        }
      } else if (!addToFront) {
        state.reading = false;
      }
    }
    return needMoreData(state);
  }
  function addChunk(stream, state, chunk, addToFront) {
    if (state.flowing && state.length === 0 && !state.sync) {
      stream.emit("data", chunk);
      stream.read(0);
    } else {
      state.length += state.objectMode ? 1 : chunk.length;
      if (addToFront)
        state.buffer.unshift(chunk);
      else
        state.buffer.push(chunk);
      if (state.needReadable)
        emitReadable(stream);
    }
    maybeReadMore(stream, state);
  }
  function chunkInvalid(state, chunk) {
    var er;
    if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
      er = new TypeError("Invalid non-string/buffer chunk");
    }
    return er;
  }
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = requireString_decoder().StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };
  var MAX_HWM = 8388608;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return 1;
    if (n !== n) {
      if (state.flowing && state.length)
        return state.buffer.head.data.length;
      else
        return state.length;
    }
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length)
      return n;
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }
  Readable.prototype.read = function(n) {
    debug("read", n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;
    if (n !== 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug("read: emitReadable", state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug("need readable", doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug("length less than watermark", doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug("reading or ended", doRead);
    } else if (doRead) {
      debug("do read");
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
      if (!state.reading)
        n = howMuchToRead(nOrig, state);
    }
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = true;
      n = 0;
    } else {
      state.length -= n;
    }
    if (state.length === 0) {
      if (!state.ended)
        state.needReadable = true;
      if (nOrig !== n && state.ended)
        endReadable(this);
    }
    if (ret !== null)
      this.emit("data", ret);
    return ret;
  };
  function onEofChunk(stream, state) {
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    emitReadable(stream);
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug("emitReadable", state.flowing);
      state.emittedReadable = true;
      if (state.sync)
        pna2.nextTick(emitReadable_, stream);
      else
        emitReadable_(stream);
    }
  }
  function emitReadable_(stream) {
    debug("emit readable");
    stream.emit("readable");
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      pna2.nextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug("maybeReadMore read 0");
      stream.read(0);
      if (len === state.length)
        break;
      else
        len = state.length;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    this.emit("error", new Error("_read() is not implemented"));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : unpipe;
    if (state.endEmitted)
      pna2.nextTick(endFn);
    else
      src.once("end", endFn);
    dest.on("unpipe", onunpipe);
    function onunpipe(readable, unpipeInfo) {
      debug("onunpipe");
      if (readable === src) {
        if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
          unpipeInfo.hasUnpiped = true;
          cleanup();
        }
      }
    }
    function onend() {
      debug("onend");
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on("drain", ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug("cleanup");
      dest.removeListener("close", onclose);
      dest.removeListener("finish", onfinish);
      dest.removeListener("drain", ondrain);
      dest.removeListener("error", onerror);
      dest.removeListener("unpipe", onunpipe);
      src.removeListener("end", onend);
      src.removeListener("end", unpipe);
      src.removeListener("data", ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    var increasedAwaitDrain = false;
    src.on("data", ondata);
    function ondata(chunk) {
      debug("ondata");
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (false === ret && !increasedAwaitDrain) {
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug("false write response, pause", src._readableState.awaitDrain);
          src._readableState.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug("onerror", er);
      unpipe();
      dest.removeListener("error", onerror);
      if (EElistenerCount(dest, "error") === 0)
        dest.emit("error", er);
    }
    prependListener(dest, "error", onerror);
    function onclose() {
      dest.removeListener("finish", onfinish);
      unpipe();
    }
    dest.once("close", onclose);
    function onfinish() {
      debug("onfinish");
      dest.removeListener("close", onclose);
      unpipe();
    }
    dest.once("finish", onfinish);
    function unpipe() {
      debug("unpipe");
      src.unpipe(dest);
    }
    dest.emit("pipe", src);
    if (!state.flowing) {
      debug("pipe resume");
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function() {
      var state = src._readableState;
      debug("pipeOnDrain", state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    var unpipeInfo = { hasUnpiped: false };
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit("unpipe", this, unpipeInfo);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0; i < len; i++) {
        dests[i].emit("unpipe", this, unpipeInfo);
      }
      return this;
    }
    var index = indexOf(state.pipes, dest);
    if (index === -1)
      return this;
    state.pipes.splice(index, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit("unpipe", this, unpipeInfo);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === "data") {
      if (this._readableState.flowing !== false)
        this.resume();
    } else if (ev === "readable") {
      var state = this._readableState;
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.emittedReadable = false;
        if (!state.reading) {
          pna2.nextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  function nReadingNextTick(self) {
    debug("readable nexttick read 0");
    self.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug("resume");
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      pna2.nextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    if (!state.reading) {
      debug("resume read 0");
      stream.read(0);
    }
    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream.emit("resume");
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  Readable.prototype.pause = function() {
    debug("call pause flowing=%j", this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug("pause");
      this._readableState.flowing = false;
      this.emit("pause");
    }
    return this;
  };
  function flow(stream) {
    var state = stream._readableState;
    debug("flow", state.flowing);
    while (state.flowing && stream.read() !== null) {
    }
  }
  Readable.prototype.wrap = function(stream) {
    var _this = this;
    var state = this._readableState;
    var paused = false;
    stream.on("end", function() {
      debug("wrapped end");
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          _this.push(chunk);
      }
      _this.push(null);
    });
    stream.on("data", function(chunk) {
      debug("wrapped data");
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === void 0))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = _this.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === void 0 && typeof stream[i] === "function") {
        this[i] = function(method) {
          return function() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    for (var n = 0; n < kProxyEvents.length; n++) {
      stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
    }
    this._read = function(n2) {
      debug("wrapped _read", n2);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return this;
  };
  Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
    // making it explicit this property is not enumerable
    // because otherwise some prototype manipulation in
    // userland will fail
    enumerable: false,
    get: function() {
      return this._readableState.highWaterMark;
    }
  });
  Readable._fromList = fromList;
  function fromList(n, state) {
    if (state.length === 0)
      return null;
    var ret;
    if (state.objectMode)
      ret = state.buffer.shift();
    else if (!n || n >= state.length) {
      if (state.decoder)
        ret = state.buffer.join("");
      else if (state.buffer.length === 1)
        ret = state.buffer.head.data;
      else
        ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      ret = fromListPartial(n, state.buffer, state.decoder);
    }
    return ret;
  }
  function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
      ret = list.head.data.slice(0, n);
      list.head.data = list.head.data.slice(n);
    } else if (n === list.head.data.length) {
      ret = list.shift();
    } else {
      ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
  }
  function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
      var str = p.data;
      var nb = n > str.length ? str.length : n;
      if (nb === str.length)
        ret += str;
      else
        ret += str.slice(0, n);
      n -= nb;
      if (n === 0) {
        if (nb === str.length) {
          ++c;
          if (p.next)
            list.head = p.next;
          else
            list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = str.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function copyFromBuffer(n, list) {
    var ret = Buffer2.allocUnsafe(n);
    var p = list.head;
    var c = 1;
    p.data.copy(ret);
    n -= p.data.length;
    while (p = p.next) {
      var buf = p.data;
      var nb = n > buf.length ? buf.length : n;
      buf.copy(ret, ret.length - n, 0, nb);
      n -= nb;
      if (n === 0) {
        if (nb === buf.length) {
          ++c;
          if (p.next)
            list.head = p.next;
          else
            list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = buf.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    if (state.length > 0)
      throw new Error('"endReadable()" called on non-empty stream');
    if (!state.endEmitted) {
      state.ended = true;
      pna2.nextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit("end");
    }
  }
  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
  return _stream_readable;
}
var _stream_transform = Transform$2;
var Duplex = require_stream_duplex();
var util$1 = Object.create(util$2);
util$1.inherits = inherits_browserExports;
util$1.inherits(Transform$2, Duplex);
function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;
  if (!cb) {
    return this.emit("error", new Error("write callback called multiple times"));
  }
  ts.writechunk = null;
  ts.writecb = null;
  if (data != null)
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}
function Transform$2(options) {
  if (!(this instanceof Transform$2))
    return new Transform$2(options);
  Duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };
  this._readableState.needReadable = true;
  this._readableState.sync = false;
  if (options) {
    if (typeof options.transform === "function")
      this._transform = options.transform;
    if (typeof options.flush === "function")
      this._flush = options.flush;
  }
  this.on("prefinish", prefinish);
}
function prefinish() {
  var _this = this;
  if (typeof this._flush === "function") {
    this._flush(function(er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}
Transform$2.prototype.push = function(chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};
Transform$2.prototype._transform = function(chunk, encoding, cb) {
  throw new Error("_transform() is not implemented");
};
Transform$2.prototype._write = function(chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
      this._read(rs.highWaterMark);
  }
};
Transform$2.prototype._read = function(n) {
  var ts = this._transformState;
  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    ts.needTransform = true;
  }
};
Transform$2.prototype._destroy = function(err, cb) {
  var _this2 = this;
  Duplex.prototype._destroy.call(this, err, function(err2) {
    cb(err2);
    _this2.emit("close");
  });
};
function done(stream, er, data) {
  if (er)
    return stream.emit("error", er);
  if (data != null)
    stream.push(data);
  if (stream._writableState.length)
    throw new Error("Calling transform done when ws.length != 0");
  if (stream._transformState.transforming)
    throw new Error("Calling transform done when still transforming");
  return stream.push(null);
}
var _stream_passthrough = PassThrough;
var Transform$1 = _stream_transform;
var util = Object.create(util$2);
util.inherits = inherits_browserExports;
util.inherits(PassThrough, Transform$1);
function PassThrough(options) {
  if (!(this instanceof PassThrough))
    return new PassThrough(options);
  Transform$1.call(this, options);
}
PassThrough.prototype._transform = function(chunk, encoding, cb) {
  cb(null, chunk);
};
(function(module, exports) {
  exports = module.exports = require_stream_readable();
  exports.Stream = exports;
  exports.Readable = exports;
  exports.Writable = require_stream_writable();
  exports.Duplex = require_stream_duplex();
  exports.Transform = _stream_transform;
  exports.PassThrough = _stream_passthrough;
})(readableBrowser, readableBrowserExports);
var immutable = extend;
var hasOwnProperty = Object.prototype.hasOwnProperty;
function extend() {
  var target = {};
  for (var i = 0; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}
var Transform = readableBrowserExports.Transform, inherits = util$3.inherits, xtend = immutable;
function DestroyableTransform(opts) {
  Transform.call(this, opts);
  this._destroyed = false;
}
inherits(DestroyableTransform, Transform);
DestroyableTransform.prototype.destroy = function(err) {
  if (this._destroyed)
    return;
  this._destroyed = true;
  var self = this;
  process.nextTick(function() {
    if (err)
      self.emit("error", err);
    self.emit("close");
  });
};
function noop(chunk, enc, callback) {
  callback(null, chunk);
}
function through2(construct) {
  return function(options, transform2, flush) {
    if (typeof options == "function") {
      flush = transform2;
      transform2 = options;
      options = {};
    }
    if (typeof transform2 != "function")
      transform2 = noop;
    if (typeof flush != "function")
      flush = null;
    return construct(options, transform2, flush);
  };
}
through2$1.exports = through2(function(options, transform2, flush) {
  var t2 = new DestroyableTransform(options);
  t2._transform = transform2;
  if (flush)
    t2._flush = flush;
  return t2;
});
through2Exports.ctor = through2(function(options, transform2, flush) {
  function Through2(override) {
    if (!(this instanceof Through2))
      return new Through2(override);
    this.options = xtend(options, override);
    DestroyableTransform.call(this, this.options);
  }
  inherits(Through2, DestroyableTransform);
  Through2.prototype._transform = transform2;
  if (flush)
    Through2.prototype._flush = flush;
  return Through2;
});
through2Exports.obj = through2(function(options, transform2, flush) {
  var t2 = new DestroyableTransform(xtend({ objectMode: true, highWaterMark: 16 }, options));
  t2._transform = transform2;
  if (flush)
    t2._flush = flush;
  return t2;
});
Object.defineProperty(transform, "__esModule", { value: true });
transform.storeTransformStream = void 0;
const through2_1 = through2Exports;
function storeTransformStream(syncTransformFn) {
  return through2_1.obj((state, _encoding, cb) => {
    try {
      const newState = syncTransformFn(state);
      cb(null, newState);
      return void 0;
    } catch (err) {
      cb(err);
      return void 0;
    }
  });
}
transform.storeTransformStream = storeTransformStream;
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() {
      return m[k];
    } });
  } : function(o, m, k, k2) {
    if (k2 === void 0)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(asStream, exports);
  __exportStar(ComposedStore$1, exports);
  __exportStar(MergedStore$1, exports);
  __exportStar(ObservableStore$1, exports);
  __exportStar(transform, exports);
})(dist);
const LOGIN_PROVIDER = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  TWITCH: "twitch",
  REDDIT: "reddit",
  DISCORD: "discord"
};
const WALLET_VERIFIERS = {
  GOOGLE: "google",
  FACEBOOK: "facebook",
  TWITCH: "twitch",
  REDDIT: "reddit",
  DISCORD: "discord",
  EMAIL_PASSWORDLESS: "torus-auth0-email-passwordless"
};
const WALLET_OPENLOGIN_VERIFIER_MAP = {
  [WALLET_VERIFIERS.GOOGLE]: "tkey-google",
  [WALLET_VERIFIERS.FACEBOOK]: "tkey-facebook",
  [WALLET_VERIFIERS.TWITCH]: "tkey-twitch",
  [WALLET_VERIFIERS.REDDIT]: "tkey-reddit",
  [WALLET_VERIFIERS.DISCORD]: "tkey-discord",
  [WALLET_VERIFIERS.EMAIL_PASSWORDLESS]: "tkey-auth0-email-passwordless"
};
const PAYMENT_PROVIDER = {
  MOONPAY: "moonpay",
  WYRE: "wyre",
  RAMPNETWORK: "rampnetwork",
  XANPOOL: "xanpool",
  MERCURYO: "mercuryo",
  TRANSAK: "transak",
  BANXA: "banxa"
};
const SUPPORTED_PAYMENT_NETWORK = {
  MAINNET: "mainnet",
  MATIC: "matic",
  BSC_MAINNET: "bsc_mainnet",
  AVALANCHE_MAINNET: "avalanche_mainnet",
  XDAI: "xdai"
};
const TORUS_BUILD_ENV = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  BINANCE: "binance",
  TESTING: "testing",
  LRC: "lrc",
  BETA: "beta",
  BNB: "bnb",
  POLYGON: "polygon"
};
const BUTTON_POSITION = {
  BOTTOM_LEFT: "bottom-left",
  TOP_LEFT: "top-left",
  BOTTOM_RIGHT: "bottom-right",
  TOP_RIGHT: "top-right"
};
const CRYPTO_COMPARE_CURRENCIES = ["ETH", "USDT", "USDC", "TUSD", "EOSDT", "USD", "DAI", "GUSD", "DKKT", "PAX", "ILS", "RUB", "BYN", "EUR", "GBP", "JPY", "KRW", "PLN", "MXN", "AUD", "BRL", "CAD", "CHF", "KPW", "LAK", "LBP", "LKR", "XOF", "CNHT", "DOGE", "UAH", "TRY", "HKD", "XJP", "SGD", "USC", "NZD", "NGN", "RUR", "COP", "GHS", "EGP", "IDR", "BHD", "CRC", "PEN", "AED", "DOP", "PKR", "HUF", "VND", "XAR", "LTC", "RON", "OMR", "MYR", "DKK", "UGX", "ZMW", "SAR", "SEK", "GEL", "RWF", "IRR", "TZS", "CNY", "VEF", "BDT", "HRK", "CLP", "THB", "XAF", "ARS", "UYU", "SZL", "KZT", "NOK", "KES", "PAB", "INR", "CZK", "MAD", "TWD", "PHP", "ZAR", "BOB", "CDF", "DASH", "VES", "ISK", "MWK", "BAM", "TTD", "XRP", "JOD", "RSD", "HNL", "BGN", "GTQ", "BWP", "XMR", "MMK", "QAR", "AOA", "KWD", "MUR", "WUSD", "WEUR", "WAVES", "WTRY", "LRD", "LSL", "LYD", "AWG", "MDL", "BTO", "EURS", "CHFT", "MKD", "MNT", "MOP", "MRO", "MVR", "VOLLAR", "CKUSD", "KHR", "VUV", "BITCNY", "QC", "BBD", "NAD", "NPR", "PGK", "PYG", "BIF", "BMD", "BND", "XLM", "BNB", "SCR", "BAT", "CRO", "HT", "KCS", "LEO", "LINK", "MKR", "NPXS", "OMG", "REP", "ZB", "ZIL", "ZRX", "BCH", "BZD", "CUP", "CVE", "DJF", "DZD", "ERN", "ETB", "FJD", "FKP", "BUSD", "ANCT", "ALL", "AMD", "ANG", "CNYX", "IQD", "UZS", "TND", "GGP", "XAU", "KGS", "GIP", "JMD", "ZEC", "USDP", "BSV", "EMC2", "SNT", "GTO", "POWR", "EUSD", "EURT", "BCY", "BTS", "ATM", "BLOCKPAY", "ARDR", "AMP", "B2X", "BITGOLD", "BITEUR", "ATB", "BITUSD", "AGRS", "DFXT", "HIKEN", "BIX", "KNC", "EOS", "COB", "COSS", "BMH", "NANO", "BDG", "BNT", "XVG", "LKK1Y", "LKK", "USDK", "EURN", "NZDT", "JSE", "GMD", "GNF", "GYD", "YER", "XPF", "HTG", "SLL", "SOS", "WST", "SVC", "SYP", "NEO", "KMF", "JUMP", "AYA", "BLAST", "WGR", "BCN", "BTG", "URALS", "INN", "USDQ", "CNH", "HUSD", "BKRW", "NZDX", "EURX", "CADX", "USDEX", "JPYX", "AUDX", "VNDC", "EON", "GBPX", "CHFX", "USDJ", "IDRT", "USDS", "USDN", "BIDR", "IDK", "BSD", "BTN", "KYD", "NIO", "SBD", "SDG", "SHP", "TOP", "XCD", "XCHF", "CNYT", "GYEN", "ZUSD", "GOLD", "TRX", "TRYB", "PLATC", "STRAX", "UST", "GLM", "VAI", "BRZ", "DDRST", "XAUT", "MIM"];
const PROVIDER_SUPPORTED_FIAT_CURRENCIES = {
  // https://integrations.simplex.com/supported_currencies
  // https://support.moonpay.com/hc/en-gb/articles/360011931457-Which-fiat-currencies-are-supported-
  [PAYMENT_PROVIDER.MOONPAY]: ["AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "COP", "CZK", "DKK", "DOP", "EGP", "EUR", "GBP", "HKD", "HRK", "IDR", "ILS", "JPY", "JOD", "KES", "KRW", "KWD", "LKR", "MAD", "MXN", "MYR", "NGN", "NOK", "NZD", "OMR", "PEN", "PKR", "PLN", "RON", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "USD", "VND", "ZAR"],
  /**
   * https://docs.sendwyre.com/docs/supported-currencies#fiat
   * The ones where credit card is supported
   */
  [PAYMENT_PROVIDER.WYRE]: ["USD", "EUR", "GBP", "AUD", "CAD", "NZD", "ARS", "BRL", "CHF", "CLP", "COP", "CZK", "DKK", "HKD", "ILS", "INR", "ISK", "JPY", "KRW", "MXN", "MYR", "NOK", "PHP", "PLN", "SEK", "THB", "VND", "ZAR"],
  // https://support.ramp.network/en/articles/471-why-am-i-paying-in-usd-eur-gbp
  [PAYMENT_PROVIDER.RAMPNETWORK]: ["USD", "EUR", "GBP"],
  // From https://xanpool.com/ fiat select dropdown
  [PAYMENT_PROVIDER.XANPOOL]: ["SGD", "HKD", "THB", "PHP", "INR", "IDR", "MYR", "AUD", "NZD", "KRW"],
  // https://support.aax.com/en/articles/5295762-mercuryo
  // RUB / UAH currently not supported
  [PAYMENT_PROVIDER.MERCURYO]: ["EUR", "USD", "GBP", "TRY", "JPY", "BRL", "NGN", "VND", "MXN", "KRW"],
  /**
   * https://support.transak.com/hc/en-us/articles/360020615578-Credit-and-Debit-Card-Payments-through-Transak
   * or
   * https://transak.stoplight.io/docs/transak-docs/b3A6OTk1ODQ0-2-get-fiat-currencies
   */
  [PAYMENT_PROVIDER.TRANSAK]: ["ARS", "AUD", "BBD", "BGN", "BMD", "BRL", "CAD", "CHF", "CLP", "CRC", "CZK", "DKK", "DOP", "EUR", "FJD", "FKP", "GBP", "GIP", "HRK", "HUF", "IDR", "ILS", "ISK", "JMD", "JPY", "KES", "KRW", "MDL", "MXN", "MYR", "NOK", "NZD", "PEN", "PHP", "PLN", "PYG", "RON", "SEK", "SGD", "THB", "TRY", "TZS", "USD", "ZAR"],
  [PAYMENT_PROVIDER.BANXA]: ["EUR", "GBP", "USD"]
};
const cryptoCompareCurrenciesSet = new Set(CRYPTO_COMPARE_CURRENCIES);
function supportedFiatCurrencies(provider) {
  const providerSupportedFiatCurrencies = PROVIDER_SUPPORTED_FIAT_CURRENCIES[provider];
  return providerSupportedFiatCurrencies.filter((currency) => cryptoCompareCurrenciesSet.has(currency));
}
const paymentProviders$1 = {
  [PAYMENT_PROVIDER.MOONPAY]: {
    line1: "Credit/ Debit Card/ Apple Pay",
    line2: "4.5% or 5 USD",
    line3: "2,000€/day, 10,000€/mo",
    supportPage: "https://help.moonpay.io/en/",
    minOrderValue: 24.99,
    maxOrderValue: 5e4,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.MOONPAY),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "aave",
        display: "AAVE"
      }, {
        value: "bat",
        display: "BAT"
      }, {
        value: "dai",
        display: "DAI"
      }, {
        value: "eth",
        display: "ETH"
      }, {
        value: "mkr",
        display: "MKR"
      }, {
        value: "matic",
        display: "MATIC"
      }, {
        value: "usdt",
        display: "USDT"
      }, {
        value: "usdc",
        display: "USDC"
      }],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{
        value: "eth_polygon",
        display: "ETH"
      }, {
        value: "matic_polygon",
        display: "MATIC"
      }, {
        value: "usdc_polygon",
        display: "USDC"
      }],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [{
        value: "bnb_bsc",
        display: "BNB"
      }, {
        value: "busd_bsc",
        display: "BUSD"
      }],
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{
        value: "avax_cchain",
        display: "AVAX"
      }]
    },
    includeFees: true,
    api: true,
    enforceMax: false
  },
  [PAYMENT_PROVIDER.WYRE]: {
    line1: "Apple Pay/ Debit/ Credit Card",
    line2: "4.9% + 30¢ or 5 USD",
    line3: "$250/day",
    supportPage: "https://support.sendwyre.com/en/",
    minOrderValue: 5,
    maxOrderValue: 500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.WYRE),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "AAVE",
        display: "AAVE"
      }, {
        value: "BAT",
        display: "BAT"
      }, {
        value: "BUSD",
        display: "BUSD"
      }, {
        value: "DAI",
        display: "DAI"
      }, {
        value: "ETH",
        display: "ETH"
      }, {
        value: "MKR",
        display: "MKR"
      }, {
        value: "UNI",
        display: "UNI"
      }, {
        value: "USDC",
        display: "USDC"
      }, {
        value: "USDT",
        display: "USDT"
      }],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{
        value: "MUSDC",
        display: "USDC"
      }],
      // AVAXC? or AVAX?
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{
        value: "AVAXC",
        display: "AVAXC"
      }]
    },
    includeFees: false,
    api: true,
    enforceMax: false
  },
  [PAYMENT_PROVIDER.RAMPNETWORK]: {
    line1: "Debit Card/ <br>Apple Pay/ Bank transfer",
    line2: "0.49% - 2.9%",
    line3: "5,000€/purchase, 20,000€/mo",
    supportPage: "https://instant.ramp.network/",
    minOrderValue: 50,
    maxOrderValue: 2e4,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.RAMPNETWORK),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "ETH",
        display: "ETH"
      }, {
        value: "DAI",
        display: "DAI"
      }, {
        value: "USDC",
        display: "USDC"
      }, {
        value: "USDT",
        display: "USDT"
      }],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{
        value: "MATIC_DAI",
        display: "DAI"
      }, {
        value: "MATIC_MATIC",
        display: "MATIC"
      }, {
        value: "MATIC_USDC",
        display: "USDC"
      }],
      // what about AVAXC?
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{
        value: "AVAX",
        display: "AVAX"
      }]
      // Temporary unavailable
      // [SUPPORTED_PAYMENT_NETWORK.XDAI]: [{ value: 'XDAI_XDAI', display: 'XDAI' }],
    },
    includeFees: true,
    api: true,
    receiveHint: "walletTopUp.receiveHintRamp",
    enforceMax: false
  },
  [PAYMENT_PROVIDER.XANPOOL]: {
    line1: "PayNow/ InstaPay/ FPS/ GoJekPay/ UPI/ PromptPay/ <br>ViettelPay/ DuitNow",
    line2: "2.5% buying, 3% selling",
    line3: "$2,500 / day",
    supportPage: "mailto:support@xanpool.com",
    minOrderValue: 100,
    maxOrderValue: 2500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.XANPOOL),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "ETH",
        display: "ETH"
      }, {
        value: "USDT",
        display: "USDT"
      }]
    },
    includeFees: true,
    api: true,
    sell: true,
    enforceMax: false
  },
  [PAYMENT_PROVIDER.MERCURYO]: {
    line1: "Credit/ Debit Card/ Apple Pay",
    line2: "3.95% or 4 USD",
    line3: "10,000€/day, 25,000€/mo",
    supportPage: "mailto:support@mercuryo.io",
    minOrderValue: 30,
    maxOrderValue: 5e3,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.MERCURYO),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "ETH",
        display: "ETH"
      }, {
        value: "BAT",
        display: "BAT"
      }, {
        value: "USDT",
        display: "USDT"
      }, {
        value: "DAI",
        display: "DAI"
      }],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [{
        value: "BNB",
        display: "BNB"
      }, {
        value: "BUSD",
        display: "BUSD"
      }, {
        value: "1INCH",
        display: "1INCH"
      }]
    },
    includeFees: true,
    api: true,
    enforceMax: false
  },
  [PAYMENT_PROVIDER.TRANSAK]: {
    line1: "Apple & Google Pay / Credit/Debit Card<br/>Bangkok Bank Mobile & iPay<br/>Bank Transfer (sepa/gbp) / SCB Mobile & Easy",
    line2: "0.99% - 5.5% or 5 USD",
    line3: "$5,000/day, $28,000/mo",
    supportPage: "https://support.transak.com/hc/en-US",
    minOrderValue: 30,
    maxOrderValue: 500,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.TRANSAK),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "AAVE",
        display: "AAVE"
      }, {
        value: "DAI",
        display: "DAI"
      }, {
        value: "ETH",
        display: "ETH"
      }, {
        value: "USDC",
        display: "USDC"
      }, {
        value: "USDT",
        display: "USDT"
      }],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{
        value: "AAVE",
        display: "AAVE"
      }, {
        value: "DAI",
        display: "DAI"
      }, {
        value: "MATIC",
        display: "MATIC"
      }, {
        value: "USDC",
        display: "USDC"
      }, {
        value: "USDT",
        display: "USDT"
      }, {
        value: "WETH",
        display: "WETH"
      }],
      [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [{
        value: "BNB",
        display: "BNB"
      }, {
        value: "BUSD",
        display: "BUSD"
      }],
      [SUPPORTED_PAYMENT_NETWORK.AVALANCHE_MAINNET]: [{
        value: "AVAX",
        display: "AVAX"
      }]
    },
    includeFees: true,
    enforceMax: true
  },
  [PAYMENT_PROVIDER.BANXA]: {
    line1: "Debit Card/ <br>Apple Pay/ Bank transfer",
    line2: "0.49% - 2.9%",
    line3: "5,000€/purchase, 20,000€/mo",
    supportPage: "https://support.banxa.com",
    minOrderValue: 20,
    maxOrderValue: 15e3,
    validCurrencies: supportedFiatCurrencies(PAYMENT_PROVIDER.BANXA),
    validCryptoCurrenciesByChain: {
      [SUPPORTED_PAYMENT_NETWORK.MAINNET]: [{
        value: "ETH",
        display: "ETH"
      }, {
        value: "USDT",
        display: "USDT"
      }, {
        value: "BUSD",
        display: "BUSD"
      }, {
        value: "LINK",
        display: "LINK"
      }, {
        value: "USDC",
        display: "USDC"
      }, {
        value: "CHZ",
        display: "CHZ"
      }, {
        value: "BAT",
        display: "BAT"
      }, {
        value: "MANA",
        display: "MANA"
      }, {
        value: "AAVE",
        display: "AAVE"
      }, {
        value: "COMP",
        display: "COMP"
      }, {
        value: "ENJ",
        display: "ENJ"
      }],
      [SUPPORTED_PAYMENT_NETWORK.MATIC]: [{
        value: "MATIC",
        display: "MATIC"
      }]
      // [SUPPORTED_PAYMENT_NETWORK.BSC_MAINNET]: [{ value: "BNB", display: "BNB" }],
    },
    includeFees: true,
    enforceMax: true
  }
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
  supportedVerifierList: Object.values(WALLET_VERIFIERS),
  paymentProviders: paymentProviders$1,
  api: "https://api.tor.us",
  translations,
  prodTorusUrl: "",
  localStorageKeyPrefix: `torus-`
};
const runOnLoad = (fn) => new Promise((resolve, reject) => {
  if (window.document.body != null) {
    Promise.resolve(fn()).then(resolve).catch(reject);
  } else {
    window.document.addEventListener("DOMContentLoaded", () => {
      Promise.resolve(fn()).then(resolve).catch(reject);
    });
  }
});
const htmlToElement = (html) => {
  const template = window.document.createElement("template");
  const trimmedHtml = html.trim();
  template.innerHTML = trimmedHtml;
  return template.content.firstChild;
};
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
const handleStream = (handle, eventName, handler) => {
  const handlerWrapper = (chunk) => {
    handler(chunk);
    handle.removeListener(eventName, handlerWrapper);
  };
  handle.on(eventName, handlerWrapper);
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
var log = loglevel.getLogger("torus-embed");
var messages = {
  errors: {
    disconnected: () => "Torus: Lost connection to Torus.",
    permanentlyDisconnected: () => "Torus: Disconnected from iframe. Page reload required.",
    sendSiteMetadata: () => "Torus: Failed to send site metadata. This is an internal error, please report this bug.",
    unsupportedSync: (method) => `Torus: The Torus Ethereum provider does not support synchronous methods like ${method} without a callback parameter.`,
    invalidDuplexStream: () => "Must provide a Node.js-style duplex stream.",
    invalidOptions: (maxEventListeners, shouldSendMetadata) => `Invalid options. Received: { maxEventListeners: ${maxEventListeners}, shouldSendMetadata: ${shouldSendMetadata} }`,
    invalidRequestArgs: () => `Expected a single, non-array, object argument.`,
    invalidRequestMethod: () => `'args.method' must be a non-empty string.`,
    invalidRequestParams: () => `'args.params' must be an object or array if provided.`,
    invalidLoggerObject: () => `'args.logger' must be an object if provided.`,
    invalidLoggerMethod: (method) => `'args.logger' must include required method '${method}'.`
  },
  info: {
    connected: (chainId) => `Torus: Connected to chain with ID "${chainId}".`
  },
  warnings: {
    // deprecated methods
    enableDeprecation: 'Torus: ""ethereum.enable()" is deprecated and may be removed in the future. Please use "ethereum.send("eth_requestAccounts")" instead. For more information, see: https://eips.ethereum.org/EIPS/eip-1102',
    sendDeprecation: 'Torus: "ethereum.send(...)" is deprecated and may be removed in the future. Please use "ethereum.sendAsync(...)" or "ethereum.request(...)" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193',
    events: {
      close: 'Torus: The event "close" is deprecated and may be removed in the future. Please use "disconnect" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193',
      data: 'Torus: The event "data" is deprecated and will be removed in the future.Use "message" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193#message',
      networkChanged: 'Torus: The event "networkChanged" is deprecated and may be removed in the future. Please use "chainChanged" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193',
      notification: 'Torus: The event "notification" is deprecated and may be removed in the future. Please use "message" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1193'
    },
    publicConfigStore: 'Torus: The property "publicConfigStore" is deprecated and WILL be removed in the future.'
  }
};
const {
  paymentProviders
} = configuration;
const validatePaymentProvider = (provider, params) => {
  const errors = {};
  if (!provider) {
    return {
      errors,
      isValid: true
    };
  }
  if (provider && !paymentProviders[provider]) {
    errors.provider = "Invalid Provider";
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  }
  const selectedProvider = paymentProviders[provider];
  const selectedParams = params || {};
  if (selectedParams.fiatValue) {
    const requestedOrderAmount = +parseFloat(selectedParams.fiatValue.toString()) || 0;
    if (requestedOrderAmount < selectedProvider.minOrderValue)
      errors.fiatValue = "Requested amount is lower than supported";
    if (requestedOrderAmount > selectedProvider.maxOrderValue && selectedProvider.enforceMax)
      errors.fiatValue = "Requested amount is higher than supported";
  }
  if (selectedParams.selectedCurrency && !selectedProvider.validCurrencies.includes(selectedParams.selectedCurrency)) {
    errors.selectedCurrency = "Unsupported currency";
  }
  if (selectedParams.selectedCryptoCurrency) {
    const validCryptoCurrenciesByChain = Object.values(selectedProvider.validCryptoCurrenciesByChain).flat().map((currency) => currency.value);
    const finalCryptoCurrency = provider === PAYMENT_PROVIDER.MOONPAY ? selectedParams.selectedCryptoCurrency.toLowerCase() : selectedParams.selectedCryptoCurrency;
    if (validCryptoCurrenciesByChain && !validCryptoCurrenciesByChain.includes(finalCryptoCurrency))
      errors.selectedCryptoCurrency = "Unsupported cryptoCurrency";
  }
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};
function createErrorMiddleware() {
  return (req, res, next) => {
    if (typeof req.method !== "string" || !req.method) {
      res.error = dist$1.ethErrors.rpc.invalidRequest({
        message: `The request 'method' must be a non-empty string.`,
        data: req
      });
    }
    next((done2) => {
      const {
        error
      } = res;
      if (!error) {
        return done2();
      }
      log.error(`MetaMask - RPC Error: ${error.message}`, error);
      return done2();
    });
  };
}
function logStreamDisconnectWarning(remoteLabel, error, emitter) {
  let warningMsg = `MetaMask: Lost connection to "${remoteLabel}".`;
  if (error !== null && error !== void 0 && error.stack) {
    warningMsg += `
${error.stack}`;
  }
  log.warn(warningMsg);
  if (emitter && emitter.listenerCount("error") > 0) {
    emitter.emit("error", warningMsg);
  }
}
const getPreopenInstanceId = () => Math.random().toString(36).slice(2);
const getTorusUrl = async (buildEnv, integrity2) => {
  let torusUrl;
  let logLevel;
  const version = "1.38.6";
  let versionUsed = integrity2.version || version;
  try {
    if ((buildEnv === "binance" || buildEnv === "production") && !integrity2.version) {
      let response;
      if (!configuration.prodTorusUrl)
        response = await get(`${configuration.api}/latestversion?name=@toruslabs/torus-embed&version=${version}`, {}, {
          useAPIKey: true
        });
      else
        response = {
          data: configuration.prodTorusUrl
        };
      versionUsed = response.data;
      configuration.prodTorusUrl = response.data;
    }
  } catch (error) {
    log.error(error, "unable to fetch latest version");
  }
  log.info("version used: ", versionUsed);
  switch (buildEnv) {
    case "binance":
      torusUrl = `https://binance.tor.us/v${versionUsed}`;
      logLevel = "info";
      break;
    case "testing":
      torusUrl = "https://testing.tor.us";
      logLevel = "debug";
      break;
    case "bnb":
      torusUrl = "https://bnb.tor.us";
      logLevel = "error";
      break;
    case "polygon":
      torusUrl = "https://polygon.tor.us";
      logLevel = "error";
      break;
    case "lrc":
      torusUrl = "https://lrc.tor.us";
      logLevel = "debug";
      break;
    case "beta":
      torusUrl = "https://beta.tor.us";
      logLevel = "debug";
      break;
    case "development":
      torusUrl = "http://localhost:4050";
      logLevel = "debug";
      break;
    default:
      torusUrl = `https://app.tor.us/v${versionUsed}`;
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
const EMITTED_NOTIFICATIONS = [
  "eth_subscription"
  // per eth-json-rpc-filters/subscriptionManager
];
const NOOP = () => {
};
const FEATURES_PROVIDER_CHANGE_WINDOW = "directories=0,titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=660,width=375";
const FEATURES_DEFAULT_WALLET_WINDOW = "directories=0,titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=740,width=1315";
const FEATURES_CONFIRM_WINDOW = "directories=0,titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=700,width=450";
function getPopupFeatures() {
  const dualScreenLeft = window.screenLeft !== void 0 ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== void 0 ? window.screenTop : window.screenY;
  const w = 1200;
  const h = 700;
  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : window.screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : window.screen.height;
  const systemZoom = 1;
  const left = Math.abs((width - w) / 2 / systemZoom + dualScreenLeft);
  const top = Math.abs((height - h) / 2 / systemZoom + dualScreenTop);
  const features = `titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=${h / systemZoom},width=${w / systemZoom},top=${top},left=${left}`;
  return features;
}
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
SafeEventEmitter$1.defaultMaxListeners = 100;
const getRpcPromiseCallback = function(resolve, reject) {
  let unwrapResult = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
  return (error, response) => {
    if (error || response.error) {
      return reject(error || response.error);
    }
    return !unwrapResult || Array.isArray(response) ? resolve(response) : resolve(response.result);
  };
};
class TorusInpageProvider extends SafeEventEmitter$1 {
  /**
   * The chain ID of the currently connected Ethereum chain.
   * See [chainId.network]{@link https://chainid.network} for more information.
   */
  /**
   * The user's currently selected Ethereum address.
   * If null, MetaMask is either locked or the user has not permitted any
   * addresses to be viewed.
   */
  /**
   * Indicating that this provider is a MetaMask provider.
   */
  constructor(connectionStream) {
    let {
      maxEventListeners = 100,
      shouldSendMetadata = true,
      jsonRpcStreamName = "provider"
    } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    super();
    _defineProperty(this, "chainId", void 0);
    _defineProperty(this, "selectedAddress", void 0);
    _defineProperty(this, "_rpcEngine", void 0);
    _defineProperty(this, "networkVersion", void 0);
    _defineProperty(this, "shouldSendMetadata", void 0);
    _defineProperty(this, "isTorus", void 0);
    _defineProperty(this, "_publicConfigStore", void 0);
    _defineProperty(this, "tryPreopenHandle", void 0);
    _defineProperty(this, "enable", void 0);
    _defineProperty(this, "_state", void 0);
    _defineProperty(this, "_jsonRpcConnection", void 0);
    _defineProperty(this, "_sentWarnings", {
      // methods
      enable: false,
      experimentalMethods: false,
      send: false,
      publicConfigStore: false,
      // events
      events: {
        close: false,
        data: false,
        networkChanged: false,
        notification: false
      }
    });
    if (!isStream_1.duplex(connectionStream)) {
      throw new Error(messages.errors.invalidDuplexStream());
    }
    this.isTorus = true;
    this.setMaxListeners(maxEventListeners);
    this._state = _objectSpread$1({}, TorusInpageProvider._defaultState);
    this.selectedAddress = null;
    this.networkVersion = null;
    this.chainId = null;
    this.shouldSendMetadata = shouldSendMetadata;
    this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
    this._handleChainChanged = this._handleChainChanged.bind(this);
    this._handleUnlockStateChanged = this._handleUnlockStateChanged.bind(this);
    this._handleConnect = this._handleConnect.bind(this);
    this._handleDisconnect = this._handleDisconnect.bind(this);
    this._handleStreamDisconnect = this._handleStreamDisconnect.bind(this);
    this._sendSync = this._sendSync.bind(this);
    this._rpcRequest = this._rpcRequest.bind(this);
    this._warnOfDeprecation = this._warnOfDeprecation.bind(this);
    this._initializeState = this._initializeState.bind(this);
    this.request = this.request.bind(this);
    this.send = this.send.bind(this);
    this.sendAsync = this.sendAsync.bind(this);
    const mux = new ObjectMultiplex();
    pump_1(connectionStream, mux, connectionStream, this._handleStreamDisconnect.bind(this, "MetaMask"));
    this._publicConfigStore = new dist.ObservableStore({
      storageKey: "Metamask-Config"
    });
    pump_1(
      mux.createStream("publicConfig"),
      dist.storeAsStream(this._publicConfigStore),
      // RPC requests should still work if only this stream fails
      logStreamDisconnectWarning.bind(this, "MetaMask PublicConfigStore")
    );
    mux.ignoreStream("phishing");
    this.on("connect", () => {
      this._state.isConnected = true;
    });
    const jsonRpcConnection = createStreamMiddleware();
    pump_1(jsonRpcConnection.stream, mux.createStream(jsonRpcStreamName), jsonRpcConnection.stream, this._handleStreamDisconnect.bind(this, "MetaMask RpcProvider"));
    const rpcEngine = new JRPCEngine();
    rpcEngine.push(createIdRemapMiddleware());
    rpcEngine.push(createErrorMiddleware());
    rpcEngine.push(jsonRpcConnection.middleware);
    this._rpcEngine = rpcEngine;
    jsonRpcConnection.events.on("notification", (payload) => {
      const {
        method,
        params
      } = payload;
      if (method === "wallet_accountsChanged") {
        this._handleAccountsChanged(params);
      } else if (method === "wallet_unlockStateChanged") {
        this._handleUnlockStateChanged(params);
      } else if (method === "wallet_chainChanged") {
        this._handleChainChanged(params);
      } else if (EMITTED_NOTIFICATIONS.includes(payload.method)) {
        this.emit("data", payload);
        this.emit("notification", params.result);
        this.emit("message", {
          type: method,
          data: params
        });
      }
    });
  }
  get publicConfigStore() {
    if (!this._sentWarnings.publicConfigStore) {
      log.warn(messages.warnings.publicConfigStore);
      this._sentWarnings.publicConfigStore = true;
    }
    return this._publicConfigStore;
  }
  /**
   * Returns whether the inpage provider is connected to Torus.
   */
  isConnected() {
    return this._state.isConnected;
  }
  /**
   * Submits an RPC request for the given method, with the given params.
   * Resolves with the result of the method call, or rejects on error.
   *
   * @param args - The RPC request arguments.
   * @returns A Promise that resolves with the result of the RPC method,
   * or rejects if an error is encountered.
   */
  async request(args) {
    if (!args || typeof args !== "object" || Array.isArray(args)) {
      throw dist$1.ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestArgs(),
        data: args
      });
    }
    const {
      method,
      params
    } = args;
    if (typeof method !== "string" || method.length === 0) {
      throw dist$1.ethErrors.rpc.invalidRequest({
        message: messages.errors.invalidRequestMethod(),
        data: args
      });
    }
    if (params !== void 0 && !Array.isArray(params) && (typeof params !== "object" || params === null)) {
      throw dist$1.ethErrors.rpc.invalidRequest({
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
   *
   * @param payload - The RPC request object.
   * @param cb - The callback function.
   */
  sendAsync(payload, callback) {
    this._rpcRequest(payload, callback);
  }
  /**
   * We override the following event methods so that we can warn consumers
   * about deprecated events:
   *   addListener, on, once, prependListener, prependOnceListener
   */
  addListener(eventName, listener) {
    this._warnOfDeprecation(eventName);
    return super.addListener(eventName, listener);
  }
  on(eventName, listener) {
    this._warnOfDeprecation(eventName);
    return super.on(eventName, listener);
  }
  once(eventName, listener) {
    this._warnOfDeprecation(eventName);
    return super.once(eventName, listener);
  }
  prependListener(eventName, listener) {
    this._warnOfDeprecation(eventName);
    return super.prependListener(eventName, listener);
  }
  prependOnceListener(eventName, listener) {
    this._warnOfDeprecation(eventName);
    return super.prependOnceListener(eventName, listener);
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
        isUnlocked,
        networkVersion
      } = await this.request({
        method: "wallet_getProviderState"
      });
      this.emit("connect", {
        chainId
      });
      this._handleChainChanged({
        chainId,
        networkVersion
      });
      this._handleUnlockStateChanged({
        accounts,
        isUnlocked
      });
      this._handleAccountsChanged(accounts);
    } catch (error) {
      log.error("MetaMask: Failed to get initial state. Please report this bug.", error);
    } finally {
      log.info("initialized state");
      this._state.initialized = true;
      this.emit("_initialized");
    }
  }
  /**
   * Internal RPC method. Forwards requests to background via the RPC engine.
   * Also remap ids inbound and outbound.
   *
   * @param payload - The RPC request object.
   * @param callback - The consumer's callback.
   * @param isInternal - false - Whether the request is internal.
   */
  _rpcRequest(payload, callback) {
    let isInternal = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    let cb = callback;
    const _payload = payload;
    if (!Array.isArray(_payload)) {
      if (!_payload.jsonrpc) {
        _payload.jsonrpc = "2.0";
      }
      if (_payload.method === "eth_accounts" || _payload.method === "eth_requestAccounts") {
        cb = (err, res) => {
          this._handleAccountsChanged(res.result || [], _payload.method === "eth_accounts", isInternal);
          callback(err, res);
        };
      } else if (_payload.method === "wallet_getProviderState") {
        this._rpcEngine.handle(payload, cb);
        return;
      }
    }
    this.tryPreopenHandle(_payload, cb);
  }
  send(methodOrPayload, callbackOrArgs) {
    if (!this._sentWarnings.send) {
      log.warn(messages.warnings.sendDeprecation);
      this._sentWarnings.send = true;
    }
    if (typeof methodOrPayload === "string" && (!callbackOrArgs || Array.isArray(callbackOrArgs))) {
      return new Promise((resolve, reject) => {
        try {
          this._rpcRequest({
            method: methodOrPayload,
            params: callbackOrArgs
          }, getRpcPromiseCallback(resolve, reject, false));
        } catch (error) {
          reject(error);
        }
      });
    }
    if (methodOrPayload && typeof methodOrPayload === "object" && typeof callbackOrArgs === "function") {
      return this._rpcRequest(methodOrPayload, callbackOrArgs);
    }
    return this._sendSync(methodOrPayload);
  }
  /**
   * DEPRECATED.
   * Internal backwards compatibility method, used in send.
   */
  _sendSync(payload) {
    let result;
    switch (payload.method) {
      case "eth_accounts":
        result = this.selectedAddress ? [this.selectedAddress] : [];
        break;
      case "eth_coinbase":
        result = this.selectedAddress || null;
        break;
      case "eth_uninstallFilter":
        this._rpcRequest(payload, NOOP);
        result = true;
        break;
      case "net_version":
        result = this.networkVersion || null;
        break;
      default:
        throw new Error(messages.errors.unsupportedSync(payload.method));
    }
    return {
      id: payload.id,
      jsonrpc: payload.jsonrpc,
      result
    };
  }
  /**
   * When the provider becomes connected, updates internal state and emits
   * required events. Idempotent.
   *
   * @param chainId - The ID of the newly connected chain.
   * emits MetaMaskInpageProvider#connect
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
   * emits MetaMaskInpageProvider#disconnect
   */
  _handleDisconnect(isRecoverable, errorMessage) {
    if (this._state.isConnected || !this._state.isPermanentlyDisconnected && !isRecoverable) {
      this._state.isConnected = false;
      let error;
      if (isRecoverable) {
        error = new dist$1.EthereumRpcError(
          1013,
          // Try again later
          errorMessage || messages.errors.disconnected()
        );
        log.debug(error);
      } else {
        error = new dist$1.EthereumRpcError(
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
   * Called when connection is lost to critical streams.
   *
   * emits MetamaskInpageProvider#disconnect
   */
  _handleStreamDisconnect(streamName, error) {
    logStreamDisconnectWarning(streamName, error, this);
    this._handleDisconnect(false, error ? error.message : void 0);
  }
  /**
   * Called when accounts may have changed.
   */
  _handleAccountsChanged(accounts) {
    let isEthAccounts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    let isInternal = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    let finalAccounts = accounts;
    if (!Array.isArray(finalAccounts)) {
      log.error("MetaMask: Received non-array accounts parameter. Please report this bug.", finalAccounts);
      finalAccounts = [];
    }
    for (const account of accounts) {
      if (typeof account !== "string") {
        log.error("MetaMask: Received non-string account. Please report this bug.", accounts);
        finalAccounts = [];
        break;
      }
    }
    if (!fastDeepEqual(this._state.accounts, finalAccounts)) {
      if (isEthAccounts && Array.isArray(this._state.accounts) && this._state.accounts.length > 0 && !isInternal) {
        log.error('MetaMask: "eth_accounts" unexpectedly updated accounts. Please report this bug.', finalAccounts);
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
   * emits MetamaskInpageProvider#chainChanged
   * @param networkInfo - An object with network info.
   */
  _handleChainChanged() {
    let {
      chainId,
      networkVersion
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!chainId || !networkVersion) {
      log.error("MetaMask: Received invalid network parameters. Please report this bug.", {
        chainId,
        networkVersion
      });
      return;
    }
    if (networkVersion === "loading") {
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
      log.error("MetaMask: Received invalid isUnlocked parameter. Please report this bug.", {
        isUnlocked
      });
      return;
    }
    if (isUnlocked !== this._state.isUnlocked) {
      this._state.isUnlocked = isUnlocked;
      this._handleAccountsChanged(accounts || []);
    }
  }
  /**
   * Warns of deprecation for the given event, if applicable.
   */
  _warnOfDeprecation(eventName) {
    if (this._sentWarnings.events[eventName] === false) {
      log.warn(messages.warnings.events[eventName]);
      this._sentWarnings.events[eventName] = true;
    }
  }
}
_defineProperty(TorusInpageProvider, "_defaultState", {
  accounts: null,
  isConnected: false,
  isUnlocked: false,
  initialized: false,
  isPermanentlyDisconnected: false,
  hasEmittedConnection: false
});
const defaults = (options) => ({
  algorithms: options.algorithms || ["sha256"],
  delimiter: options.delimiter || " ",
  full: options.full || false
});
const hashes = (options, data) => {
  const internalHashes = {};
  options.algorithms.forEach((algorithm) => {
    internalHashes[algorithm] = browser$1(algorithm).update(data, "utf8").digest("base64");
  });
  return internalHashes;
};
const integrity = (options, sri) => {
  let output = "";
  output += Object.keys(sri.hashes).map((algorithm) => `${algorithm}-${sri.hashes[algorithm]}`).join(options.delimiter);
  return output;
};
const main = (options, data) => {
  const finalOptions = defaults(options);
  const sri = {
    hashes: hashes(finalOptions, data),
    integrity: void 0
  };
  sri.integrity = integrity(finalOptions, sri);
  return finalOptions.full ? sri : sri.integrity;
};
class PopupHandler extends eventsExports.EventEmitter {
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
    this.features = features || getPopupFeatures();
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
  return null;
}
const getSiteMetadata = async () => ({
  name: getSiteName(window),
  icon: await getSiteIcon(window)
});
async function sendSiteMetadata(engine) {
  try {
    const domainMetadata = await getSiteMetadata();
    engine.handle({
      jsonrpc: "2.0",
      id: getPreopenInstanceId(),
      method: "wallet_sendDomainMetadata",
      params: domainMetadata
    }, NOOP);
  } catch (error) {
    log.error({
      message: messages.errors.sendSiteMetadata(),
      originalError: error
    });
  }
}
const _excluded = ["host", "chainId", "networkName"];
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
const defaultVerifiers = {
  [LOGIN_PROVIDER.GOOGLE]: true,
  [LOGIN_PROVIDER.FACEBOOK]: true,
  [LOGIN_PROVIDER.REDDIT]: true,
  [LOGIN_PROVIDER.TWITCH]: true,
  [LOGIN_PROVIDER.DISCORD]: true
};
const iframeIntegrity = "sha384-rKDzAQGTjTTHTfXsCxsUa85RHvDNSPuZxXAKdVdBqxl8Oad3Fn3uvFruOKq1pLhx";
const expectedCacheControlHeader = "max-age=3600";
const UNSAFE_METHODS = ["eth_sendTransaction", "eth_signTypedData", "eth_signTypedData_v3", "eth_signTypedData_v4", "personal_sign", "eth_getEncryptionPublicKey", "eth_decrypt"];
(async function preLoadIframe() {
  try {
    if (typeof document === "undefined")
      return;
    const torusIframeHtml = document.createElement("link");
    const {
      torusUrl
    } = await getTorusUrl("production", {
      check: false,
      hash: iframeIntegrity,
      version: ""
    });
    torusIframeHtml.href = `${torusUrl}/popup`;
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
      buttonPosition = BUTTON_POSITION.BOTTOM_LEFT,
      buttonSize = 56,
      modalZIndex = 99999,
      apiKey = "torus-default"
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _defineProperty(this, "buttonPosition", BUTTON_POSITION.BOTTOM_LEFT);
    _defineProperty(this, "buttonSize", void 0);
    _defineProperty(this, "torusUrl", void 0);
    _defineProperty(this, "torusIframe", void 0);
    _defineProperty(this, "styleLink", void 0);
    _defineProperty(this, "isLoggedIn", void 0);
    _defineProperty(this, "isInitialized", void 0);
    _defineProperty(this, "torusWidgetVisibility", void 0);
    _defineProperty(this, "torusAlert", void 0);
    _defineProperty(this, "apiKey", void 0);
    _defineProperty(this, "modalZIndex", void 0);
    _defineProperty(this, "alertZIndex", void 0);
    _defineProperty(this, "torusAlertContainer", void 0);
    _defineProperty(this, "isIframeFullScreen", void 0);
    _defineProperty(this, "whiteLabel", void 0);
    _defineProperty(this, "requestedVerifier", void 0);
    _defineProperty(this, "currentVerifier", void 0);
    _defineProperty(this, "embedTranslations", void 0);
    _defineProperty(this, "ethereum", void 0);
    _defineProperty(this, "provider", void 0);
    _defineProperty(this, "communicationMux", void 0);
    _defineProperty(this, "isLoginCallback", void 0);
    _defineProperty(this, "paymentProviders", configuration.paymentProviders);
    _defineProperty(this, "loginHint", "");
    _defineProperty(this, "useWalletConnect", void 0);
    _defineProperty(this, "isCustomLogin", false);
    this.buttonPosition = buttonPosition;
    this.buttonSize = buttonSize;
    this.torusUrl = "";
    this.isLoggedIn = false;
    this.isInitialized = false;
    this.torusWidgetVisibility = true;
    this.requestedVerifier = "";
    this.currentVerifier = "";
    this.apiKey = apiKey;
    setAPIKey(apiKey);
    this.modalZIndex = modalZIndex;
    this.alertZIndex = modalZIndex + 1e3;
    this.isIframeFullScreen = false;
  }
  async init() {
    let {
      buildEnv = TORUS_BUILD_ENV.PRODUCTION,
      enableLogging = false,
      // deprecated: use loginConfig instead
      enabledVerifiers = defaultVerifiers,
      network = {
        host: "mainnet",
        chainId: null,
        networkName: "",
        blockExplorer: "",
        ticker: "",
        tickerName: ""
      },
      loginConfig = {},
      showTorusButton = true,
      integrity: integrity2 = {
        check: false,
        hash: iframeIntegrity,
        version: ""
      },
      whiteLabel,
      skipTKey = false,
      useWalletConnect = false,
      mfaLevel = "default"
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (this.isInitialized)
      throw new Error("Already initialized");
    const {
      torusUrl,
      logLevel
    } = await getTorusUrl(buildEnv, integrity2);
    log.info(torusUrl, "url loaded");
    this.torusUrl = torusUrl;
    this.whiteLabel = whiteLabel;
    this.useWalletConnect = useWalletConnect;
    this.isCustomLogin = !!(loginConfig && Object.keys(loginConfig).length > 0) || !!(whiteLabel && Object.keys(whiteLabel).length > 0);
    log.setDefaultLevel(logLevel);
    if (enableLogging)
      log.enableAll();
    else
      log.disableAll();
    this.torusWidgetVisibility = showTorusButton;
    const torusIframeUrl = new URL(torusUrl);
    if (torusIframeUrl.pathname.endsWith("/"))
      torusIframeUrl.pathname += "popup";
    else
      torusIframeUrl.pathname += "/popup";
    torusIframeUrl.hash = `#isCustomLogin=${this.isCustomLogin}`;
    this.torusIframe = htmlToElement(`<iframe
        id="torusIframe"
        allow=${useWalletConnect ? "camera" : ""}
        class="torusIframe"
        src="${torusIframeUrl.href}"
        style="display: none; position: fixed; top: 0; right: 0; width: 100%; color-scheme: none;
        height: 100%; border: none; border-radius: 0; z-index: ${this.modalZIndex}"
      ></iframe>`);
    this.torusAlertContainer = htmlToElement('<div id="torusAlertContainer"></div>');
    this.torusAlertContainer.style.display = "none";
    this.torusAlertContainer.style.setProperty("z-index", this.alertZIndex.toString());
    const link = window.document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", `${torusUrl}/css/widget.css`);
    this.styleLink = link;
    const {
      defaultLanguage = getUserLanguage(),
      customTranslations = {}
    } = this.whiteLabel || {};
    const mergedTranslations = merge(configuration.translations, customTranslations);
    const languageTranslations = mergedTranslations[defaultLanguage] || configuration.translations[getUserLanguage()];
    this.embedTranslations = languageTranslations.embed;
    const handleSetup = async () => {
      await documentReady();
      return new Promise((resolve, reject) => {
        this.torusIframe.onload = async () => {
          this._setupWeb3();
          const initStream = this.communicationMux.getStream("init_stream");
          initStream.on("data", (chunk) => {
            const {
              name,
              data,
              error
            } = chunk;
            if (name === "init_complete" && data.success) {
              this.isInitialized = true;
              this._displayIframe(this.isIframeFullScreen);
              resolve(void 0);
            } else if (error) {
              reject(new Error(error));
            }
          });
          initStream.write({
            name: "init_stream",
            data: {
              enabledVerifiers,
              loginConfig,
              whiteLabel: this.whiteLabel,
              buttonPosition: this.buttonPosition,
              buttonSize: this.buttonSize,
              torusWidgetVisibility: this.torusWidgetVisibility,
              apiKey: this.apiKey,
              skipTKey,
              network,
              mfaLevel
            }
          });
        };
        window.document.head.appendChild(this.styleLink);
        window.document.body.appendChild(this.torusIframe);
        window.document.body.appendChild(this.torusAlertContainer);
      });
    };
    if (buildEnv === "production" && integrity2.check) {
      const fetchUrl = `${torusUrl}/popup`;
      const resp = await fetch(fetchUrl, {
        cache: "reload"
      });
      if (resp.headers.get("Cache-Control") !== expectedCacheControlHeader) {
        throw new Error(`Unexpected Cache-Control headers, got ${resp.headers.get("Cache-Control")}`);
      }
      const response = await resp.text();
      const calculatedIntegrity = main({
        algorithms: ["sha384"]
      }, response);
      log.info(calculatedIntegrity, "integrity");
      if (calculatedIntegrity === integrity2.hash) {
        await handleSetup();
      } else {
        this.clearInit();
        throw new Error("Integrity check failed");
      }
    } else {
      await handleSetup();
    }
    return void 0;
  }
  login() {
    let {
      verifier = "",
      login_hint: loginHint = ""
    } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (!this.isInitialized)
      throw new Error("Call init() first");
    this.requestedVerifier = verifier;
    this.loginHint = loginHint;
    return this.ethereum.enable();
  }
  logout() {
    return new Promise((resolve, reject) => {
      if (!this.isLoggedIn) {
        reject(new Error("User has not logged in yet"));
        return;
      }
      const logOutStream = this.communicationMux.getStream("logout");
      logOutStream.write({
        name: "logOut"
      });
      const statusStream = this.communicationMux.getStream("status");
      const statusStreamHandler = (status) => {
        if (!status.loggedIn) {
          this.isLoggedIn = false;
          this.currentVerifier = "";
          this.requestedVerifier = "";
          resolve();
        } else
          reject(new Error("Some Error Occured"));
      };
      handleStream(statusStream, "data", statusStreamHandler);
    });
  }
  async cleanUp() {
    if (this.isLoggedIn) {
      await this.logout();
    }
    this.clearInit();
  }
  clearInit() {
    function isElement(element) {
      return element instanceof Element || element instanceof HTMLDocument;
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
    this.torusWidgetVisibility = false;
    this._sendWidgetVisibilityStatus(false);
    this._displayIframe();
  }
  showTorusButton() {
    this.torusWidgetVisibility = true;
    this._sendWidgetVisibilityStatus(true);
    this._displayIframe();
  }
  setProvider(_ref) {
    let {
      host = "mainnet",
      chainId = null,
      networkName = ""
    } = _ref, rest = _objectWithoutProperties(_ref, _excluded);
    return new Promise((resolve, reject) => {
      const providerChangeStream = this.communicationMux.getStream("provider_change");
      const handler = (chunk) => {
        const {
          err,
          success
        } = chunk.data;
        log.info(chunk);
        if (err) {
          reject(err);
        } else if (success) {
          resolve();
        } else
          reject(new Error("some error occured"));
      };
      handleStream(providerChangeStream, "data", handler);
      const preopenInstanceId = getPreopenInstanceId();
      this._handleWindow(preopenInstanceId, {
        target: "_blank",
        features: FEATURES_PROVIDER_CHANGE_WINDOW
      });
      providerChangeStream.write({
        name: "show_provider_change",
        data: {
          network: _objectSpread$2({
            host,
            chainId,
            networkName
          }, rest),
          preopenInstanceId,
          override: false
        }
      });
    });
  }
  showWallet(path) {
    let params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const showWalletStream = this.communicationMux.getStream("show_wallet");
    const finalPath = path ? `/${path}` : "";
    showWalletStream.write({
      name: "show_wallet",
      data: {
        path: finalPath
      }
    });
    const showWalletHandler = (chunk) => {
      if (chunk.name === "show_wallet_instance") {
        const {
          instanceId
        } = chunk.data;
        const finalUrl = new URL(`${this.torusUrl}/wallet${finalPath}`);
        finalUrl.searchParams.append("integrity", "true");
        finalUrl.searchParams.append("instanceId", instanceId);
        Object.keys(params).forEach((x) => {
          finalUrl.searchParams.append(x, params[x]);
        });
        finalUrl.hash = `#isCustomLogin=${this.isCustomLogin}`;
        const walletWindow = new PopupHandler({
          url: finalUrl,
          features: FEATURES_DEFAULT_WALLET_WINDOW
        });
        walletWindow.open();
      }
    };
    handleStream(showWalletStream, "data", showWalletHandler);
  }
  async getPublicAddress(_ref2) {
    let {
      verifier,
      verifierId,
      isExtended = false
    } = _ref2;
    if (!configuration.supportedVerifierList.includes(verifier) || !WALLET_OPENLOGIN_VERIFIER_MAP[verifier])
      throw new Error("Unsupported verifier");
    const walletVerifier = verifier;
    const openloginVerifier = WALLET_OPENLOGIN_VERIFIER_MAP[verifier];
    const url = new URL(`https://api.tor.us/lookup/torus`);
    url.searchParams.append("verifier", openloginVerifier);
    url.searchParams.append("verifierId", verifierId);
    url.searchParams.append("walletVerifier", walletVerifier);
    url.searchParams.append("network", "mainnet");
    url.searchParams.append("isExtended", isExtended.toString());
    return get(url.href, {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    }, {
      useAPIKey: true
    });
  }
  getUserInfo(message) {
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn) {
        const userInfoAccessStream = this.communicationMux.getStream("user_info_access");
        userInfoAccessStream.write({
          name: "user_info_access_request"
        });
        const userInfoAccessHandler = (chunk) => {
          const {
            name,
            data: {
              approved,
              payload,
              rejected,
              newRequest
            }
          } = chunk;
          if (name === "user_info_access_response") {
            if (approved) {
              resolve(payload);
            } else if (rejected) {
              reject(new Error("User rejected the request"));
            } else if (newRequest) {
              const userInfoStream = this.communicationMux.getStream("user_info");
              const userInfoHandler = (handlerChunk) => {
                if (handlerChunk.name === "user_info_response") {
                  if (handlerChunk.data.approved) {
                    resolve(handlerChunk.data.payload);
                  } else {
                    reject(new Error("User rejected the request"));
                  }
                }
              };
              handleStream(userInfoStream, "data", userInfoHandler);
              const preopenInstanceId = getPreopenInstanceId();
              this._handleWindow(preopenInstanceId, {
                target: "_blank",
                features: FEATURES_PROVIDER_CHANGE_WINDOW
              });
              userInfoStream.write({
                name: "user_info_request",
                data: {
                  message,
                  preopenInstanceId
                }
              });
            }
          }
        };
        handleStream(userInfoAccessStream, "data", userInfoAccessHandler);
      } else
        reject(new Error("User has not logged in yet"));
    });
  }
  initiateTopup(provider, params) {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        const {
          errors,
          isValid
        } = validatePaymentProvider(provider, params);
        if (!isValid) {
          reject(new Error(JSON.stringify(errors)));
          return;
        }
        const topupStream = this.communicationMux.getStream("topup");
        const topupHandler = (chunk) => {
          if (chunk.name === "topup_response") {
            if (chunk.data.success) {
              resolve(chunk.data.success);
            } else {
              reject(new Error(chunk.data.error));
            }
          }
        };
        handleStream(topupStream, "data", topupHandler);
        const preopenInstanceId = getPreopenInstanceId();
        this._handleWindow(preopenInstanceId);
        topupStream.write({
          name: "topup_request",
          data: {
            provider,
            params,
            preopenInstanceId
          }
        });
      } else
        reject(new Error("Torus is not initialized yet"));
    });
  }
  async loginWithPrivateKey(loginParams) {
    const {
      privateKey,
      userInfo
    } = loginParams;
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        if (Buffer.from(privateKey, "hex").length !== 32) {
          reject(new Error("Invalid private key, Please provide a 32 byte valid secp25k1 private key"));
          return;
        }
        const loginPrivKeyStream = this.communicationMux.getStream("login_with_private_key");
        const loginHandler = (chunk) => {
          if (chunk.name === "login_with_private_key_response") {
            if (chunk.data.success) {
              resolve(chunk.data.success);
            } else {
              reject(new Error(chunk.data.error));
            }
          }
        };
        handleStream(loginPrivKeyStream, "data", loginHandler);
        loginPrivKeyStream.write({
          name: "login_with_private_key_request",
          data: {
            privateKey,
            userInfo
          }
        });
      } else
        reject(new Error("Torus is not initialized yet"));
    });
  }
  async showWalletConnectScanner() {
    if (!this.useWalletConnect)
      throw new Error("Set `useWalletConnect` as true in init function options to use wallet connect scanner");
    return new Promise((resolve, reject) => {
      if (this.isLoggedIn) {
        const walletConnectStream = this.communicationMux.getStream("wallet_connect_stream");
        const walletConnectHandler = (chunk) => {
          if (chunk.name === "wallet_connect_stream_res") {
            if (chunk.data.success) {
              resolve(chunk.data.success);
            } else {
              reject(new Error(chunk.data.error));
            }
            this._displayIframe();
          }
        };
        handleStream(walletConnectStream, "data", walletConnectHandler);
        walletConnectStream.write({
          name: "wallet_connect_stream_req"
        });
        this._displayIframe(true);
      } else
        reject(new Error("User has not logged in yet"));
    });
  }
  _handleWindow(preopenInstanceId) {
    let {
      url,
      target,
      features
    } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (preopenInstanceId) {
      const windowStream = this.communicationMux.getStream("window");
      const finalUrl = new URL(url || `${this.torusUrl}/redirect?preopenInstanceId=${preopenInstanceId}`);
      if (finalUrl.hash)
        finalUrl.hash += `&isCustomLogin=${this.isCustomLogin}`;
      else
        finalUrl.hash = `#isCustomLogin=${this.isCustomLogin}`;
      const handledWindow = new PopupHandler({
        url: finalUrl,
        target,
        features
      });
      handledWindow.open();
      if (!handledWindow.window) {
        this._createPopupBlockAlert(preopenInstanceId, finalUrl.href);
        return;
      }
      windowStream.write({
        name: "opened_window",
        data: {
          preopenInstanceId
        }
      });
      const closeHandler = (_ref3) => {
        let {
          preopenInstanceId: receivedId,
          close
        } = _ref3;
        if (receivedId === preopenInstanceId && close) {
          handledWindow.close();
          windowStream.removeListener("data", closeHandler);
        }
      };
      windowStream.on("data", closeHandler);
      handledWindow.once("close", () => {
        windowStream.write({
          data: {
            preopenInstanceId,
            closed: true
          }
        });
        windowStream.removeListener("data", closeHandler);
      });
    }
  }
  _setEmbedWhiteLabel(element) {
    const {
      theme
    } = this.whiteLabel || {};
    if (theme) {
      const {
        isDark = false,
        colors = {}
      } = theme;
      if (isDark)
        element.classList.add("torus-dark");
      if (colors.torusBrand1)
        element.style.setProperty("--torus-brand-1", colors.torusBrand1);
      if (colors.torusGray2)
        element.style.setProperty("--torus-gray-2", colors.torusGray2);
    }
  }
  _getLogoUrl() {
    var _this$whiteLabel, _this$whiteLabel$them;
    let logoUrl = `${this.torusUrl}/images/torus_icon-blue.svg`;
    if ((_this$whiteLabel = this.whiteLabel) !== null && _this$whiteLabel !== void 0 && (_this$whiteLabel$them = _this$whiteLabel.theme) !== null && _this$whiteLabel$them !== void 0 && _this$whiteLabel$them.isDark) {
      var _this$whiteLabel2;
      logoUrl = ((_this$whiteLabel2 = this.whiteLabel) === null || _this$whiteLabel2 === void 0 ? void 0 : _this$whiteLabel2.logoLight) || logoUrl;
    } else {
      var _this$whiteLabel3;
      logoUrl = ((_this$whiteLabel3 = this.whiteLabel) === null || _this$whiteLabel3 === void 0 ? void 0 : _this$whiteLabel3.logoDark) || logoUrl;
    }
    return logoUrl;
  }
  _sendWidgetVisibilityStatus(status) {
    const torusWidgetVisibilityStream = this.communicationMux.getStream("torus-widget-visibility");
    torusWidgetVisibilityStream.write({
      data: status
    });
  }
  _displayIframe() {
    let isFull = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    const style = {};
    const size = this.buttonSize + 14;
    if (!isFull) {
      style.display = this.torusWidgetVisibility ? "block" : "none";
      style.height = `${size}px`;
      style.width = `${size}px`;
      switch (this.buttonPosition) {
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
    this.isIframeFullScreen = isFull;
  }
  _setupWeb3() {
    log.info("setupWeb3 running");
    const metamaskStream = new BasePostMessageStream({
      name: "embed_metamask",
      target: "iframe_metamask",
      targetWindow: this.torusIframe.contentWindow,
      targetOrigin: new URL(this.torusUrl).origin
    });
    const communicationStream = new BasePostMessageStream({
      name: "embed_comm",
      target: "iframe_comm",
      targetWindow: this.torusIframe.contentWindow,
      targetOrigin: new URL(this.torusUrl).origin
    });
    const inpageProvider = new TorusInpageProvider(metamaskStream);
    const detectAccountRequestPrototypeModifier = (m) => {
      const originalMethod = inpageProvider[m];
      inpageProvider[m] = function providerFunc(method) {
        if (method && method === "eth_requestAccounts") {
          return inpageProvider.enable();
        }
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        return originalMethod.apply(this, [method, ...args]);
      };
    };
    detectAccountRequestPrototypeModifier("send");
    detectAccountRequestPrototypeModifier("sendAsync");
    inpageProvider.enable = () => {
      return new Promise((resolve, reject) => {
        inpageProvider.sendAsync({
          jsonrpc: "2.0",
          id: getPreopenInstanceId(),
          method: "eth_requestAccounts",
          params: []
        }, (err, response) => {
          const {
            result: res
          } = response || {};
          if (err) {
            setTimeout(() => {
              reject(err);
            }, 50);
          } else if (Array.isArray(res) && res.length > 0) {
            const handleLoginCb = () => {
              if (this.requestedVerifier !== "" && this.currentVerifier !== this.requestedVerifier) {
                const {
                  requestedVerifier
                } = this;
                this.logout().then((_) => {
                  this.requestedVerifier = requestedVerifier;
                  this._showLoginPopup(true, resolve, reject);
                }).catch((error) => reject(error));
              } else {
                resolve(res);
              }
            };
            if (this.isLoggedIn) {
              handleLoginCb();
            } else {
              this.isLoginCallback = handleLoginCb;
            }
          } else {
            this._showLoginPopup(true, resolve, reject);
          }
        });
      });
    };
    inpageProvider.tryPreopenHandle = (payload, cb) => {
      const _payload = payload;
      if (!Array.isArray(_payload) && UNSAFE_METHODS.includes(_payload.method)) {
        const preopenInstanceId = getPreopenInstanceId();
        this._handleWindow(preopenInstanceId, {
          target: "_blank",
          features: FEATURES_CONFIRM_WINDOW
        });
        _payload.preopenInstanceId = preopenInstanceId;
      }
      inpageProvider._rpcEngine.handle(_payload, cb);
    };
    const proxiedInpageProvider = new Proxy(inpageProvider, {
      // straight up lie that we deleted the property so that it doesnt
      // throw an error in strict mode
      deleteProperty: () => true
    });
    this.ethereum = proxiedInpageProvider;
    const communicationMux = setupMultiplex(communicationStream);
    this.communicationMux = communicationMux;
    const windowStream = communicationMux.getStream("window");
    windowStream.on("data", (chunk) => {
      if (chunk.name === "create_window") {
        this._createPopupBlockAlert(chunk.data.preopenInstanceId, chunk.data.url);
      }
    });
    const widgetStream = communicationMux.getStream("widget");
    widgetStream.on("data", (chunk) => {
      const {
        data
      } = chunk;
      this._displayIframe(data);
    });
    const statusStream = communicationMux.getStream("status");
    statusStream.on("data", (status) => {
      if (status.loggedIn) {
        this.isLoggedIn = status.loggedIn;
        this.currentVerifier = status.verifier;
      } else
        this._displayIframe();
      if (this.isLoginCallback) {
        this.isLoginCallback();
        delete this.isLoginCallback;
      }
    });
    this.provider = proxiedInpageProvider;
    if (this.provider.shouldSendMetadata)
      sendSiteMetadata(this.provider._rpcEngine);
    inpageProvider._initializeState();
    log.debug("Torus - injected provider");
  }
  _showLoginPopup(calledFromEmbed, resolve, reject) {
    const loginHandler = (data) => {
      const {
        err,
        selectedAddress
      } = data;
      if (err) {
        log.error(err);
        if (reject)
          reject(err);
      } else if (resolve)
        resolve([selectedAddress]);
      if (this.isIframeFullScreen)
        this._displayIframe();
    };
    const oauthStream = this.communicationMux.getStream("oauth");
    if (!this.requestedVerifier) {
      this._displayIframe(true);
      handleStream(oauthStream, "data", loginHandler);
      oauthStream.write({
        name: "oauth_modal",
        data: {
          calledFromEmbed
        }
      });
    } else {
      handleStream(oauthStream, "data", loginHandler);
      const preopenInstanceId = getPreopenInstanceId();
      this._handleWindow(preopenInstanceId);
      oauthStream.write({
        name: "oauth",
        data: {
          calledFromEmbed,
          verifier: this.requestedVerifier,
          preopenInstanceId,
          login_hint: this.loginHint
        }
      });
    }
  }
  _createPopupBlockAlert(preopenInstanceId, url) {
    const logoUrl = this._getLogoUrl();
    const torusAlert = htmlToElement(`<div id="torusAlert" class="torus-alert--v2"><div id="torusAlert__logo"><img src="${logoUrl}" /></div><div><h1 id="torusAlert__title">${this.embedTranslations.actionRequired}</h1><p id="torusAlert__desc">${this.embedTranslations.pendingAction}</p></div></div>`);
    const successAlert = htmlToElement(`<div><a id="torusAlert__btn">${this.embedTranslations.continue}</a></div>`);
    const btnContainer = htmlToElement('<div id="torusAlert__btn-container"></div>');
    btnContainer.appendChild(successAlert);
    torusAlert.appendChild(btnContainer);
    const bindOnLoad = () => {
      successAlert.addEventListener("click", () => {
        this._handleWindow(preopenInstanceId, {
          url,
          target: "_blank",
          features: FEATURES_CONFIRM_WINDOW
        });
        torusAlert.remove();
        if (this.torusAlertContainer.children.length === 0)
          this.torusAlertContainer.style.display = "none";
      });
    };
    this._setEmbedWhiteLabel(torusAlert);
    const attachOnLoad = () => {
      this.torusAlertContainer.style.display = "block";
      this.torusAlertContainer.appendChild(torusAlert);
    };
    runOnLoad(attachOnLoad);
    runOnLoad(bindOnLoad);
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
class TorusWalletAdapter extends BaseEvmAdapter {
  constructor() {
    let params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super();
    _defineProperty(this, "name", WALLET_ADAPTERS.TORUS_EVM);
    _defineProperty(this, "adapterNamespace", ADAPTER_NAMESPACES.EIP155);
    _defineProperty(this, "currentChainNamespace", CHAIN_NAMESPACES.EIP155);
    _defineProperty(this, "type", ADAPTER_CATEGORY.EXTERNAL);
    _defineProperty(this, "status", ADAPTER_STATUS.NOT_READY);
    _defineProperty(this, "torusInstance", null);
    _defineProperty(this, "torusWalletOptions", void 0);
    _defineProperty(this, "initParams", void 0);
    _defineProperty(this, "loginSettings", {});
    _defineProperty(this, "rehydrated", false);
    this.torusWalletOptions = params.adapterSettings || {};
    this.initParams = params.initParams || {};
    this.loginSettings = params.loginSettings || {};
    this.chainConfig = params.chainConfig || null;
    this.sessionTime = params.sessionTime || 86400;
  }
  get provider() {
    if (this.status === ADAPTER_STATUS.CONNECTED && this.torusInstance) {
      return this.torusInstance.provider;
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
      this.chainConfig = getChainConfig(CHAIN_NAMESPACES.EIP155, 1);
      const {
        blockExplorer,
        displayName,
        chainId,
        ticker,
        tickerName
      } = this.chainConfig;
      network = {
        chainId: Number.parseInt(chainId, 16),
        host: "mainnet",
        blockExplorer,
        networkName: displayName,
        ticker,
        tickerName
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
        chainId: Number.parseInt(chainId, 16),
        host: rpcTarget,
        blockExplorer,
        networkName: displayName,
        ticker,
        tickerName
      };
    }
    this.torusInstance = new Torus(this.torusWalletOptions);
    log$1.debug("initializing torus evm adapter init");
    await this.torusInstance.init(_objectSpread(_objectSpread({
      showTorusButton: false
    }, this.initParams), {}, {
      network
    }));
    this.status = ADAPTER_STATUS.READY;
    this.emit(ADAPTER_EVENTS.READY, WALLET_ADAPTERS.TORUS_EVM);
    try {
      log$1.debug("initializing torus evm adapter");
      if (options.autoConnect) {
        this.rehydrated = true;
        await this.connect();
      }
    } catch (error) {
      log$1.error("Failed to connect with torus evm provider", error);
      this.emit(ADAPTER_EVENTS.ERRORED, error);
    }
  }
  async connect() {
    super.checkConnectionRequirements();
    if (!this.torusInstance)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    this.status = ADAPTER_STATUS.CONNECTING;
    this.emit(ADAPTER_EVENTS.CONNECTING, {
      adapter: WALLET_ADAPTERS.TORUS_EVM
    });
    try {
      await this.torusInstance.login(this.loginSettings);
      const {
        chainId
      } = this.torusInstance.provider;
      if (chainId && parseInt(chainId) !== parseInt(this.chainConfig.chainId, 16)) {
        const {
          chainId: _chainId,
          blockExplorer,
          displayName,
          rpcTarget,
          ticker,
          tickerName
        } = this.chainConfig;
        const network = {
          chainId: Number.parseInt(_chainId, 16),
          host: rpcTarget,
          blockExplorer,
          networkName: displayName,
          tickerName,
          ticker
        };
        await this.torusInstance.setProvider(_objectSpread({}, network));
        const updatedChainID = await this.torusInstance.ethereum.request({
          method: "eth_chainId"
        });
        if (updatedChainID && parseInt(updatedChainID) !== parseInt(this.chainConfig.chainId, 16)) {
          throw WalletInitializationError.fromCode(5e3, "Not connected to correct chainId. Expected: ".concat(this.chainConfig.chainId, ", Current: ").concat(updatedChainID));
        }
      }
      this.status = ADAPTER_STATUS.CONNECTED;
      this.torusInstance.showTorusButton();
      this.emit(ADAPTER_STATUS.CONNECTED, {
        adapter: WALLET_ADAPTERS.TORUS_EVM,
        reconnected: this.rehydrated
      });
      return this.provider;
    } catch (error) {
      this.status = ADAPTER_STATUS.READY;
      this.rehydrated = false;
      this.emit(ADAPTER_STATUS.ERRORED, error);
      throw error instanceof Web3AuthError ? error : WalletLoginError.connectionError("Failed to login with torus wallet");
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
    this.torusInstance.hideTorusButton();
    if (options.cleanup) {
      this.status = ADAPTER_STATUS.NOT_READY;
      this.torusInstance = null;
    } else {
      this.status = ADAPTER_STATUS.READY;
    }
    this.rehydrated = false;
    this.emit(ADAPTER_EVENTS.DISCONNECTED);
  }
  async getUserInfo() {
    if (this.status !== ADAPTER_STATUS.CONNECTED)
      throw WalletLoginError.notConnectedError("Not connected with wallet");
    if (!this.torusInstance)
      throw WalletInitializationError.notReady("Torus wallet is not initialized");
    const userInfo = await this.torusInstance.getUserInfo("");
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
  TorusWalletAdapter
};
