/* magpie-cursor: dsh-cursor (MIT, Yanzuo Lu) and @magpie-community/opencode-cursor-auth (MIT) in magpie. */

// src/index.js
import { appendFileSync, mkdirSync as mkdirSync3, renameSync as renameSync3, statSync } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { join as join5 } from "node:path";

// ../dsh-cursor/lib/runtime.js
import { createHash as createHash7, randomUUID as randomUUID4 } from "node:crypto";

// src/dsh-llm.js
var LlmError = class extends Error {
  constructor(message2, code, options) {
    super(message2, options?.cause === void 0 ? void 0 : { cause: options.cause });
    this.name = "LlmError";
    this.code = code;
    if (options?.status !== void 0) this.status = options.status;
    if (options?.offloadImages !== void 0) this.offloadImages = options.offloadImages;
  }
};
var ToolCallId = (id) => id;
var attributionHeaders = () => ({});
function createAssistantMessage({ content, source }) {
  return { role: "assistant", content, ...source ? { source } : {} };
}

// ../dsh-cursor/lib/protocol.js
import { createHash as createHash4, randomBytes, randomUUID as randomUUID3 } from "node:crypto";

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/is-message.js
function isMessage(arg, schema) {
  const isMessage2 = arg !== null && typeof arg == "object" && "$typeName" in arg && typeof arg.$typeName == "string";
  if (!isMessage2) {
    return false;
  }
  if (schema === void 0) {
    return true;
  }
  return schema.typeName === arg.$typeName;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/descriptors.js
var ScalarType;
(function(ScalarType2) {
  ScalarType2[ScalarType2["DOUBLE"] = 1] = "DOUBLE";
  ScalarType2[ScalarType2["FLOAT"] = 2] = "FLOAT";
  ScalarType2[ScalarType2["INT64"] = 3] = "INT64";
  ScalarType2[ScalarType2["UINT64"] = 4] = "UINT64";
  ScalarType2[ScalarType2["INT32"] = 5] = "INT32";
  ScalarType2[ScalarType2["FIXED64"] = 6] = "FIXED64";
  ScalarType2[ScalarType2["FIXED32"] = 7] = "FIXED32";
  ScalarType2[ScalarType2["BOOL"] = 8] = "BOOL";
  ScalarType2[ScalarType2["STRING"] = 9] = "STRING";
  ScalarType2[ScalarType2["BYTES"] = 12] = "BYTES";
  ScalarType2[ScalarType2["UINT32"] = 13] = "UINT32";
  ScalarType2[ScalarType2["SFIXED32"] = 15] = "SFIXED32";
  ScalarType2[ScalarType2["SFIXED64"] = 16] = "SFIXED64";
  ScalarType2[ScalarType2["SINT32"] = 17] = "SINT32";
  ScalarType2[ScalarType2["SINT64"] = 18] = "SINT64";
})(ScalarType || (ScalarType = {}));

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wire/varint.js
function varint64read() {
  const buf = this.buf;
  let pos = this.pos;
  let lo = 0;
  let hi = 0;
  for (let shift = 0; shift < 28; shift += 7) {
    const b = buf[pos++];
    lo |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.pos = pos;
      this.assertBounds();
      this.varint64Lo = lo;
      this.varint64Hi = hi;
      return;
    }
  }
  const middleByte = buf[pos++];
  lo |= (middleByte & 15) << 28;
  hi = (middleByte & 112) >> 4;
  if ((middleByte & 128) == 0) {
    this.pos = pos;
    this.assertBounds();
    this.varint64Lo = lo;
    this.varint64Hi = hi;
    return;
  }
  for (let shift = 3; shift <= 31; shift += 7) {
    const b = buf[pos++];
    hi |= (b & 127) << shift;
    if ((b & 128) == 0) {
      this.pos = pos;
      this.assertBounds();
      this.varint64Lo = lo;
      this.varint64Hi = hi;
      return;
    }
  }
  throw new Error("invalid varint");
}
var TWO_PWR_32_DBL = 4294967296;
function int64FromString(dec) {
  const minus = dec[0] === "-";
  if (minus) {
    dec = dec.slice(1);
  }
  const base = 1e6;
  let lowBits = 0;
  let highBits = 0;
  function add1e6digit(begin, end) {
    const digit1e6 = Number(dec.slice(begin, end));
    highBits *= base;
    lowBits = lowBits * base + digit1e6;
    if (lowBits >= TWO_PWR_32_DBL) {
      highBits = highBits + (lowBits / TWO_PWR_32_DBL | 0);
      lowBits = lowBits % TWO_PWR_32_DBL;
    }
  }
  add1e6digit(-24, -18);
  add1e6digit(-18, -12);
  add1e6digit(-12, -6);
  add1e6digit(-6);
  return minus ? negate(lowBits, highBits) : newBits(lowBits, highBits);
}
function int64ToString(lo, hi) {
  let bits = newBits(lo, hi);
  const negative = bits.hi & 2147483648;
  if (negative) {
    bits = negate(bits.lo, bits.hi);
  }
  const result2 = uInt64ToString(bits.lo, bits.hi);
  return negative ? "-" + result2 : result2;
}
function uInt64ToString(lo, hi) {
  ({ lo, hi } = toUnsigned(lo, hi));
  if (hi <= 2097151) {
    return String(TWO_PWR_32_DBL * hi + lo);
  }
  const low = lo & 16777215;
  const mid = (lo >>> 24 | hi << 8) & 16777215;
  const high = hi >> 16 & 65535;
  let digitA = low + mid * 6777216 + high * 6710656;
  let digitB = mid + high * 8147497;
  let digitC = high * 2;
  const base = 1e7;
  if (digitA >= base) {
    digitB += Math.floor(digitA / base);
    digitA %= base;
  }
  if (digitB >= base) {
    digitC += Math.floor(digitB / base);
    digitB %= base;
  }
  return digitC.toString() + decimalFrom1e7WithLeadingZeros(digitB) + decimalFrom1e7WithLeadingZeros(digitA);
}
function toUnsigned(lo, hi) {
  return { lo: lo >>> 0, hi: hi >>> 0 };
}
function newBits(lo, hi) {
  return { lo: lo | 0, hi: hi | 0 };
}
function negate(lowBits, highBits) {
  highBits = ~highBits;
  if (lowBits) {
    lowBits = ~lowBits + 1;
  } else {
    highBits += 1;
  }
  return newBits(lowBits, highBits);
}
var decimalFrom1e7WithLeadingZeros = (digit1e7) => {
  const partial = String(digit1e7);
  return "0000000".slice(partial.length) + partial;
};
function varint32write(value, bytes2) {
  if (value >>> 0 < 128) {
    bytes2.push(value);
    return;
  }
  if (value >= 0) {
    while (value > 127) {
      bytes2.push(value & 127 | 128);
      value = value >>> 7;
    }
    bytes2.push(value);
  } else {
    for (let i = 0; i < 9; i++) {
      bytes2.push(value & 127 | 128);
      value = value >> 7;
    }
    bytes2.push(1);
  }
}
function varint32read() {
  let b = this.buf[this.pos++];
  if ((b & 128) === 0) {
    this.assertBounds();
    return b;
  }
  let result2 = b & 127;
  b = this.buf[this.pos++];
  result2 |= (b & 127) << 7;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result2;
  }
  b = this.buf[this.pos++];
  result2 |= (b & 127) << 14;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result2;
  }
  b = this.buf[this.pos++];
  result2 |= (b & 127) << 21;
  if ((b & 128) === 0) {
    this.assertBounds();
    return result2;
  }
  b = this.buf[this.pos++];
  result2 |= (b & 15) << 28;
  for (let readBytes = 5; (b & 128) !== 0 && readBytes < 10; readBytes++)
    b = this.buf[this.pos++];
  if ((b & 128) !== 0)
    throw new Error("invalid varint");
  this.assertBounds();
  return result2 >>> 0;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/proto-int64.js
var protoInt64 = /* @__PURE__ */ makeInt64Support();
function makeInt64Support() {
  const dv = new DataView(new ArrayBuffer(8));
  const ok = typeof BigInt === "function" && typeof dv.getBigInt64 === "function" && typeof dv.getBigUint64 === "function" && typeof dv.setBigInt64 === "function" && typeof dv.setBigUint64 === "function" && (!!globalThis.Deno || !!globalThis.Bun || typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1");
  if (ok) {
    const MIN = BigInt("-9223372036854775808");
    const MAX = BigInt("9223372036854775807");
    const UMIN = BigInt("0");
    const UMAX = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: true,
      parse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > MAX || bi < MIN) {
          throw new Error(`invalid int64: ${value}`);
        }
        return bi;
      },
      uParse(value) {
        const bi = typeof value == "bigint" ? value : BigInt(value);
        if (bi > UMAX || bi < UMIN) {
          throw new Error(`invalid uint64: ${value}`);
        }
        return bi;
      },
      enc(value) {
        dv.setBigInt64(0, this.parse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      uEnc(value) {
        dv.setBigInt64(0, this.uParse(value), true);
        return {
          lo: dv.getInt32(0, true),
          hi: dv.getInt32(4, true)
        };
      },
      dec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigInt64(0, true);
      },
      uDec(lo, hi) {
        dv.setInt32(0, lo, true);
        dv.setInt32(4, hi, true);
        return dv.getBigUint64(0, true);
      }
    };
  }
  return {
    zero: "0",
    supported: false,
    parse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return value;
    },
    uParse(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return value;
    },
    enc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertInt64String(value);
      return int64FromString(value);
    },
    uEnc(value) {
      if (typeof value != "string") {
        value = value.toString();
      }
      assertUInt64String(value);
      return int64FromString(value);
    },
    dec(lo, hi) {
      return int64ToString(lo, hi);
    },
    uDec(lo, hi) {
      return uInt64ToString(lo, hi);
    }
  };
}
function assertInt64String(value) {
  if (!/^-?[0-9]+$/.test(value)) {
    throw new Error("invalid int64: " + value);
  }
}
function assertUInt64String(value) {
  if (!/^[0-9]+$/.test(value)) {
    throw new Error("invalid uint64: " + value);
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/scalar.js
function scalarZeroValue(type, longAsString) {
  switch (type) {
    case ScalarType.STRING:
      return "";
    case ScalarType.BOOL:
      return false;
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return 0;
    case ScalarType.INT64:
    case ScalarType.UINT64:
    case ScalarType.SFIXED64:
    case ScalarType.FIXED64:
    case ScalarType.SINT64:
      return longAsString ? "0" : protoInt64.zero;
    case ScalarType.BYTES:
      return new Uint8Array(0);
    default:
      return 0;
  }
}
function isScalarZeroValue(type, value) {
  switch (type) {
    case ScalarType.BOOL:
      return value === false;
    case ScalarType.STRING:
      return value === "";
    case ScalarType.BYTES:
      return value instanceof Uint8Array && !value.byteLength;
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return Object.is(value, 0);
    default:
      return value == 0;
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/unsafe.js
var IMPLICIT = 2;
var unsafeLocal = Symbol.for("reflect unsafe local");
function unsafeOneofCase(target, oneof) {
  const c = target[oneof.localName].case;
  if (c === void 0) {
    return c;
  }
  return oneof.fields.find((f) => f.localName === c);
}
function unsafeIsSet(target, field4) {
  const name = field4.localName;
  if (field4.oneof) {
    return target[field4.oneof.localName].case === name;
  }
  if (field4.presence != IMPLICIT) {
    return target[name] !== void 0 && Object.prototype.hasOwnProperty.call(target, name);
  }
  switch (field4.fieldKind) {
    case "list":
      return target[name].length > 0;
    case "map":
      return Object.keys(target[name]).length > 0;
    case "scalar":
      return !isScalarZeroValue(field4.scalar, target[name]);
    case "enum":
      return target[name] !== field4.enum.values[0].number;
  }
  throw new Error("message field with implicit presence");
}
function unsafeIsSetExplicit(target, localName) {
  return Object.prototype.hasOwnProperty.call(target, localName) && target[localName] !== void 0;
}
function unsafeGet(target, field4) {
  if (field4.oneof) {
    const oneof = target[field4.oneof.localName];
    if (oneof.case === field4.localName) {
      return oneof.value;
    }
    return void 0;
  }
  return target[field4.localName];
}
function unsafeSet(target, field4, value) {
  if (field4.oneof) {
    target[field4.oneof.localName] = {
      case: field4.localName,
      value
    };
  } else {
    target[field4.localName] = value;
  }
}
function unsafeClear(target, field4) {
  const name = field4.localName;
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    if (target[oneofLocalName].case === name) {
      target[oneofLocalName] = { case: void 0 };
    }
  } else if (field4.presence != IMPLICIT) {
    delete target[name];
  } else {
    switch (field4.fieldKind) {
      case "map":
        target[name] = {};
        break;
      case "list":
        target[name] = [];
        break;
      case "enum":
        target[name] = field4.enum.values[0].number;
        break;
      case "scalar":
        target[name] = scalarZeroValue(field4.scalar, field4.longAsString);
        break;
    }
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/guard.js
function isObject(arg) {
  return arg !== null && typeof arg == "object" && !Array.isArray(arg);
}
function isReflectList(arg, field4) {
  var _a, _b, _c, _d;
  if (isObject(arg) && unsafeLocal in arg && "add" in arg && "field" in arg && typeof arg.field == "function") {
    if (field4 !== void 0) {
      const a = field4;
      const b = arg.field();
      return a.listKind == b.listKind && a.scalar === b.scalar && ((_a = a.message) === null || _a === void 0 ? void 0 : _a.typeName) === ((_b = b.message) === null || _b === void 0 ? void 0 : _b.typeName) && ((_c = a.enum) === null || _c === void 0 ? void 0 : _c.typeName) === ((_d = b.enum) === null || _d === void 0 ? void 0 : _d.typeName);
    }
    return true;
  }
  return false;
}
function isReflectMap(arg, field4) {
  var _a, _b, _c, _d;
  if (isObject(arg) && unsafeLocal in arg && "has" in arg && "field" in arg && typeof arg.field == "function") {
    if (field4 !== void 0) {
      const a = field4, b = arg.field();
      return a.mapKey === b.mapKey && a.mapKind == b.mapKind && a.scalar === b.scalar && ((_a = a.message) === null || _a === void 0 ? void 0 : _a.typeName) === ((_b = b.message) === null || _b === void 0 ? void 0 : _b.typeName) && ((_c = a.enum) === null || _c === void 0 ? void 0 : _c.typeName) === ((_d = b.enum) === null || _d === void 0 ? void 0 : _d.typeName);
    }
    return true;
  }
  return false;
}
function isReflectMessage(arg, messageDesc2) {
  return isObject(arg) && unsafeLocal in arg && "desc" in arg && isObject(arg.desc) && arg.desc.kind === "message" && (messageDesc2 === void 0 || arg.desc.typeName == messageDesc2.typeName);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/wrappers.js
function isWrapper(arg) {
  return isWrapperTypeName(arg.$typeName);
}
function isWrapperDesc(messageDesc2) {
  const f = messageDesc2.fields[0];
  return isWrapperTypeName(messageDesc2.typeName) && f !== void 0 && f.fieldKind == "scalar" && f.name == "value" && f.number == 1;
}
function hasCustomJsonRepresentation(desc) {
  switch (desc.typeName) {
    case "google.protobuf.Any":
    case "google.protobuf.Timestamp":
    case "google.protobuf.Duration":
    case "google.protobuf.FieldMask":
    case "google.protobuf.Struct":
    case "google.protobuf.Value":
    case "google.protobuf.ListValue":
      return true;
    default:
      return isWrapperDesc(desc);
  }
}
var wrapperTypeNames = /* @__PURE__ */ new Set([
  "google.protobuf.DoubleValue",
  "google.protobuf.FloatValue",
  "google.protobuf.Int64Value",
  "google.protobuf.UInt64Value",
  "google.protobuf.Int32Value",
  "google.protobuf.UInt32Value",
  "google.protobuf.BoolValue",
  "google.protobuf.StringValue",
  "google.protobuf.BytesValue"
]);
function isWrapperTypeName(name) {
  return wrapperTypeNames.has(name);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/create.js
var EDITION_PROTO3 = 999;
var EDITION_PROTO2 = 998;
var IMPLICIT2 = 2;
function create(schema, init) {
  if (isMessage(init, schema)) {
    return init;
  }
  return compiledCreate(schema)(init);
}
var compiledCreates = /* @__PURE__ */ new WeakMap();
function compiledCreate(desc) {
  let compiled = compiledCreates.get(desc);
  if (compiled === void 0) {
    compiled = compileCreate(desc);
    compiledCreates.set(desc, compiled);
  }
  return compiled;
}
var INIT_SINGULAR = 0;
var INIT_LIST = 1;
var INIT_MAP = 2;
var INIT_ONEOF = 3;
function compileCreate(desc) {
  const typeName = desc.typeName;
  const { properties, prototype } = compileInitMessage(desc);
  return (init) => {
    let message2;
    if (prototype !== void 0) {
      message2 = Object.create(prototype);
      message2.$typeName = typeName;
    } else {
      message2 = { $typeName: typeName };
    }
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const name = property.name;
      const initValue = init === null || init === void 0 ? void 0 : init[name];
      switch (property.kind) {
        case INIT_SINGULAR:
          if (initValue != null) {
            message2[name] = property.convert !== void 0 ? property.convert(initValue) : initValue;
          } else if (property.constant !== void 0) {
            message2[name] = property.constant;
          }
          break;
        case INIT_LIST:
          message2[name] = property.convert !== void 0 && Array.isArray(initValue) ? initValue.map(property.convert) : initValue !== null && initValue !== void 0 ? initValue : [];
          break;
        case INIT_MAP:
          if (property.convert === void 0 || !isObject(initValue)) {
            message2[name] = initValue !== null && initValue !== void 0 ? initValue : {};
          } else {
            const converted = {};
            const keys = Object.keys(initValue);
            for (let k = 0; k < keys.length; k++) {
              converted[keys[k]] = property.convert(initValue[keys[k]]);
            }
            message2[name] = converted;
          }
          break;
        case INIT_ONEOF: {
          const oneofValue = initValue;
          if ((oneofValue === null || oneofValue === void 0 ? void 0 : oneofValue.case) != null) {
            const convert = property.convert.get(oneofValue.case);
            if (convert !== void 0) {
              message2[name] = {
                case: oneofValue.case,
                value: convert(oneofValue.value)
              };
              break;
            }
          }
          message2[name] = { case: void 0 };
          break;
        }
      }
    }
    return message2;
  };
}
function compileInitMessage(desc) {
  var _a, _b;
  const properties = [];
  const prototype = {};
  const usePrototype = needsPrototypeChain(desc);
  for (const member of desc.members) {
    const name = member.localName;
    if (member.kind == "oneof") {
      properties.push({
        name,
        kind: INIT_ONEOF,
        constant: void 0,
        convert: compileConvertOneof(member)
      });
      continue;
    }
    switch (member.fieldKind) {
      case "message": {
        properties.push({
          name,
          kind: INIT_SINGULAR,
          constant: void 0,
          convert: compileConvertMessage(member)
        });
        break;
      }
      case "list": {
        properties.push({
          name,
          kind: INIT_LIST,
          constant: void 0,
          convert: member.listKind == "message" ? (_a = compileConvertMessage(member)) !== null && _a !== void 0 ? _a : ((value) => value) : member.scalar == ScalarType.BYTES ? toU8Arr : void 0
        });
        break;
      }
      case "map": {
        properties.push({
          name,
          kind: INIT_MAP,
          constant: void 0,
          convert: member.mapKind == "message" ? (_b = compileConvertMessage(member)) !== null && _b !== void 0 ? _b : ((value) => value) : member.scalar == ScalarType.BYTES ? toU8Arr : void 0
        });
        break;
      }
      default: {
        const zeroValue = createZeroValue(member);
        properties.push({
          name,
          kind: INIT_SINGULAR,
          constant: member.presence == IMPLICIT2 ? zeroValue : void 0,
          convert: member.fieldKind == "scalar" && member.scalar == ScalarType.BYTES ? toU8Arr : void 0
        });
        if (usePrototype) {
          prototype[name] = zeroValue;
        }
        break;
      }
    }
  }
  return {
    properties,
    prototype: usePrototype ? prototype : void 0
  };
}
function compileConvertOneof(oneof) {
  const converters = /* @__PURE__ */ new Map();
  for (const field4 of oneof.fields) {
    let convert;
    if (field4.fieldKind == "message") {
      convert = compileConvertMessage(field4);
    } else if (field4.fieldKind == "scalar" && field4.scalar == ScalarType.BYTES) {
      convert = toU8Arr;
    }
    converters.set(field4.localName, convert !== null && convert !== void 0 ? convert : ((value) => value));
  }
  return converters;
}
function compileConvertMessage(field4) {
  if (field4.fieldKind == "message" && !field4.oneof && isWrapperDesc(field4.message)) {
    return field4.message.fields[0].scalar == ScalarType.BYTES ? toU8Arr : void 0;
  }
  if (field4.message.typeName == "google.protobuf.Struct" && field4.parent.typeName !== "google.protobuf.Value") {
    return void 0;
  }
  const messageDesc2 = field4.message;
  let compiled;
  return (value) => {
    if (!isObject(value) || isMessage(value, messageDesc2)) {
      return value;
    }
    compiled !== null && compiled !== void 0 ? compiled : compiled = compiledCreate(messageDesc2);
    return compiled(value);
  };
}
function toU8Arr(value) {
  return Array.isArray(value) ? new Uint8Array(value) : value;
}
function needsPrototypeChain(desc) {
  switch (desc.file.edition) {
    case EDITION_PROTO3:
      return false;
    case EDITION_PROTO2:
      return true;
    default:
      return desc.fields.some((f) => f.presence != IMPLICIT2 && f.fieldKind != "message" && !f.oneof);
  }
}
function createZeroValue(field4) {
  const defaultValue = field4.getDefaultValue();
  if (defaultValue !== void 0) {
    return field4.fieldKind == "scalar" && field4.longAsString ? defaultValue.toString() : defaultValue;
  }
  return field4.fieldKind == "scalar" ? scalarZeroValue(field4.scalar, field4.longAsString) : field4.enum.values[0].number;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/error.js
var errorNames = [
  "FieldValueInvalidError",
  "FieldListRangeError",
  "ForeignFieldError"
];
var FieldError = class extends Error {
  constructor(fieldOrOneof, message2, name = "FieldValueInvalidError") {
    super(message2);
    this.name = name;
    this.field = () => fieldOrOneof;
  }
};
function isFieldError(arg) {
  return arg instanceof Error && errorNames.includes(arg.name) && "field" in arg && typeof arg.field == "function";
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wire/text-encoding.js
var te;
function configureTextEncoding(textEncoding) {
  var _a;
  te = Object.assign(Object.assign({}, textEncoding), { encodeUtf8Into: (_a = textEncoding.encodeUtf8Into) !== null && _a !== void 0 ? _a : emulateEncodeInto(textEncoding.encodeUtf8.bind(textEncoding)) });
}
function getTextEncoding() {
  if (!te) {
    const globals = globalThis;
    if (!globals.TextEncoder || !globals.TextDecoder) {
      throw new Error("encoding API missing: install TextEncoder and TextDecoder on globalThis");
    }
    const textEncoder = new globals.TextEncoder();
    const textDecoder = new globals.TextDecoder();
    let textDecoderStrict;
    const config = {
      encodeUtf8(text) {
        return textEncoder.encode(text);
      },
      decodeUtf8(bytes2, strict) {
        if (strict) {
          if (!textDecoderStrict) {
            textDecoderStrict = new globals.TextDecoder("utf-8", {
              fatal: true
            });
          }
          return textDecoderStrict.decode(bytes2);
        }
        return textDecoder.decode(bytes2);
      },
      checkUtf8(text) {
        try {
          encodeURIComponent(text);
          return true;
        } catch (_) {
          return false;
        }
      }
    };
    if (textEncoder.encodeInto) {
      config.encodeUtf8Into = textEncoder.encodeInto.bind(textEncoder);
    }
    const nativeStringIsWellFormed = String.prototype.isWellFormed;
    if (nativeStringIsWellFormed) {
      config.checkUtf8 = (text) => {
        return nativeStringIsWellFormed.call(text);
      };
    }
    configureTextEncoding(config);
  }
  return te;
}
function emulateEncodeInto(encodeUtf8) {
  return (text, dest) => {
    const bytes2 = encodeUtf8(text);
    dest.set(bytes2);
    return { written: bytes2.byteLength };
  };
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wire/binary-encoding.js
var WireType;
(function(WireType2) {
  WireType2[WireType2["Varint"] = 0] = "Varint";
  WireType2[WireType2["Bit64"] = 1] = "Bit64";
  WireType2[WireType2["LengthDelimited"] = 2] = "LengthDelimited";
  WireType2[WireType2["StartGroup"] = 3] = "StartGroup";
  WireType2[WireType2["EndGroup"] = 4] = "EndGroup";
  WireType2[WireType2["Bit32"] = 5] = "Bit32";
})(WireType || (WireType = {}));
var FLOAT32_MAX = 34028234663852886e22;
var FLOAT32_MIN = -34028234663852886e22;
var UINT32_MAX = 4294967295;
var INT32_MAX = 2147483647;
var INT32_MIN = -2147483648;
var BinaryWriter = class {
  constructor(encodeUtf8) {
    this.stackPos = [];
    this.encodeUtf8Into = encodeUtf8 ? emulateEncodeInto(encodeUtf8) : getTextEncoding().encodeUtf8Into;
    this.buffer = EMPTY_BUFFER;
    this.viewCache = EMPTY_VIEW;
    this.pos = 0;
  }
  ensureCapacity(size) {
    const required = this.pos + size;
    if (required > this.buffer.length) {
      let newLen = this.buffer.length || INITIAL_SIZE;
      while (newLen < required)
        newLen *= 2;
      const newBuf = new Uint8Array(newLen);
      if (this.pos > 0)
        newBuf.set(this.buffer);
      this.buffer = newBuf;
    }
  }
  /**
   * The DataView over `buffer`, rebuilt only if the buffer has grown since it
   * was last used.
   */
  view() {
    const bytes2 = this.buffer;
    const view = this.viewCache;
    if (view.byteLength === bytes2.byteLength)
      return view;
    const newView = new DataView(bytes2.buffer);
    this.viewCache = newView;
    return newView;
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    const result2 = this.buffer.slice(0, this.pos);
    this.pos = 0;
    this.stackPos = [];
    return result2;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    this.stackPos.push(this.pos);
    this.ensureCapacity(DEFAULT_LEN_PREFIX_SIZE);
    this.buffer[this.pos++] = 0;
    return this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    const forkPos = this.stackPos.pop();
    if (forkPos === void 0)
      throw new Error("invalid state, fork stack empty");
    const len = this.pos - forkPos - DEFAULT_LEN_PREFIX_SIZE;
    const lenPrefixSize = varint32Size(len);
    if (lenPrefixSize > DEFAULT_LEN_PREFIX_SIZE) {
      this.ensureCapacity(lenPrefixSize - DEFAULT_LEN_PREFIX_SIZE);
      this.buffer.copyWithin(forkPos + lenPrefixSize, forkPos + DEFAULT_LEN_PREFIX_SIZE, this.pos);
    }
    this.pos = forkPos;
    this.uint32(len);
    this.pos += len;
    return this;
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(fieldNo, type) {
    return this.uint32((fieldNo << 3 | type) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(chunk) {
    this.ensureCapacity(chunk.length);
    this.buffer.set(chunk, this.pos);
    this.pos += chunk.length;
    return this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(value) {
    assertUInt32(value);
    this.ensureCapacity(5);
    if (value < 128) {
      this.buffer[this.pos++] = value;
      return this;
    }
    while (value > 127) {
      this.buffer[this.pos++] = value & 127 | 128;
      value >>>= 7;
    }
    this.buffer[this.pos++] = value;
    return this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(value) {
    assertInt32(value);
    if (value >= 0) {
      return this.uint32(value);
    }
    this.ensureCapacity(10);
    for (let i = 0; i < 9; i++) {
      this.buffer[this.pos++] = value & 127 | 128;
      value >>= 7;
    }
    this.buffer[this.pos++] = 1;
    return this;
  }
  /**
   * Write a `bool` value, a varint.
   */
  bool(value) {
    this.ensureCapacity(1);
    this.buffer[this.pos++] = value ? 1 : 0;
    return this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(value) {
    this.uint32(value.byteLength);
    return this.raw(value);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(value) {
    if (typeof value !== "string") {
      value = String(value);
    }
    const len = value.length;
    if (len <= ASCII_MAX_LENGTH) {
      this.ensureCapacity(len + 1);
      const ascii = this.buffer;
      let pos = this.pos;
      ascii[pos++] = len;
      let i = 0;
      for (; i < len; i++) {
        const code = value.charCodeAt(i);
        if (code > 127)
          break;
        ascii[pos++] = code;
      }
      if (i == len) {
        this.pos = pos;
        return this;
      }
    }
    this.ensureCapacity(len * 3 + 5);
    const lenPrefixSizeGuess = varint32Size(len);
    const buf = this.buffer;
    const start = this.pos;
    const { written } = this.encodeUtf8Into(value, buf.subarray(start + lenPrefixSizeGuess));
    const lenPrefixSize = varint32Size(written);
    if (lenPrefixSize != lenPrefixSizeGuess) {
      buf.copyWithin(start + lenPrefixSize, start + lenPrefixSizeGuess, start + lenPrefixSizeGuess + written);
    }
    this.uint32(written);
    this.pos += written;
    return this;
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(value) {
    assertFloat32(value);
    this.ensureCapacity(4);
    this.view().setFloat32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(value) {
    this.ensureCapacity(8);
    this.view().setFloat64(this.pos, value, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(value) {
    assertUInt32(value);
    this.ensureCapacity(4);
    this.view().setUint32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(value) {
    assertInt32(value);
    this.ensureCapacity(4);
    this.view().setInt32(this.pos, value, true);
    this.pos += 4;
    return this;
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(value) {
    assertInt32(value);
    return this.uint32((value << 1 ^ value >> 31) >>> 0);
  }
  /**
   * Write a `sfixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(value) {
    const tc = protoInt64.enc(value);
    this.ensureCapacity(8);
    const view = this.view();
    view.setInt32(this.pos, tc.lo, true);
    view.setInt32(this.pos + 4, tc.hi, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(value) {
    const tc = protoInt64.uEnc(value);
    this.ensureCapacity(8);
    const view = this.view();
    view.setInt32(this.pos, tc.lo, true);
    view.setInt32(this.pos + 4, tc.hi, true);
    this.pos += 8;
    return this;
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(value) {
    const tc = protoInt64.enc(value);
    return this.writeVarint64(tc.lo, tc.hi);
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(value) {
    const tc = protoInt64.enc(value), sign = tc.hi >> 31, lo = tc.lo << 1 ^ sign, hi = (tc.hi << 1 | tc.lo >>> 31) ^ sign;
    return this.writeVarint64(lo, hi);
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(value) {
    const tc = protoInt64.uEnc(value);
    return this.writeVarint64(tc.lo, tc.hi);
  }
  /**
   * Write a 64-bit varint directly into the buffer. Accepts the value as
   * split low/high 32-bit words.
   *
   * Ported from varint64write() to avoid the intermediate number[] buffer.
   * See https://github.com/protocolbuffers/protobuf/blob/8a71927d74a4ce34efe2d8769fda198f52d20d12/js/experimental/runtime/kernel/writer.js#L344
   */
  writeVarint64(lo, hi) {
    this.ensureCapacity(10);
    const buf = this.buffer;
    let pos = this.pos;
    for (let i = 0; i < 28; i = i + 7) {
      const shift = lo >>> i;
      const hasNext = !(shift >>> 7 == 0 && hi == 0);
      buf[pos++] = (hasNext ? shift | 128 : shift) & 255;
      if (!hasNext) {
        this.pos = pos;
        return this;
      }
    }
    const splitBits = lo >>> 28 & 15 | (hi & 7) << 4;
    const hasMoreBits = !(hi >> 3 == 0);
    buf[pos++] = (hasMoreBits ? splitBits | 128 : splitBits) & 255;
    if (!hasMoreBits) {
      this.pos = pos;
      return this;
    }
    for (let i = 3; i < 31; i = i + 7) {
      const shift = hi >>> i;
      const hasNext = !(shift >>> 7 == 0);
      buf[pos++] = (hasNext ? shift | 128 : shift) & 255;
      if (!hasNext) {
        this.pos = pos;
        return this;
      }
    }
    buf[pos++] = hi >>> 31 & 1;
    this.pos = pos;
    return this;
  }
};
var INITIAL_SIZE = 128;
var DEFAULT_LEN_PREFIX_SIZE = 1;
var EMPTY_BUFFER = new Uint8Array(0);
var EMPTY_VIEW = new DataView(EMPTY_BUFFER.buffer);
var ASCII_MAX_LENGTH = 32;
function varint32Size(value) {
  if (value < 128)
    return 1;
  if (value < 16384)
    return 2;
  if (value < 2097152)
    return 3;
  if (value < 268435456)
    return 4;
  return 5;
}
var BinaryReader = class {
  constructor(buf, decodeUtf8 = getTextEncoding().decodeUtf8) {
    this.decodeUtf8 = decodeUtf8;
    this.varint64Lo = 0;
    this.varint64Hi = 0;
    this.varint64 = varint64read;
    this.uint32 = varint32read;
    this.buf = buf;
    this.len = buf.length;
    this.pos = 0;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  /**
   * Reads a tag - field number and wire type. Tags are uint32 varints; values
   * that do not fit in uint32 are rejected.
   */
  tag() {
    const start = this.pos;
    const tag = this.uint32();
    const bytesRead = this.pos - start;
    if (bytesRead > 5 || bytesRead == 5 && this.buf[this.pos - 1] > 15) {
      throw new Error("illegal tag: varint overflows uint32");
    }
    const fieldNo = tag >>> 3;
    const wireType = tag & 7;
    if (fieldNo <= 0 || wireType > 5) {
      throw new Error("illegal tag: field no " + fieldNo + " wire type " + wireType);
    }
    return [fieldNo, wireType];
  }
  /**
   * Skip one element and return the skipped data.
   *
   * When skipping StartGroup, provide the tags field number to check for
   * matching field number in the EndGroup tag. Recursion into nested groups
   * is guarded by the `recursionLimit` argument: When the limit is reached,
   * this method throws.
   */
  skip(wireType, fieldNo, recursionLimit = 100) {
    let start = this.pos;
    switch (wireType) {
      case WireType.Varint:
        while (this.buf[this.pos++] & 128) {
        }
        break;
      // @ts-ignore TS7029: Fallthrough case in switch -- ignore instead of expect-error for compiler settings without noFallthroughCasesInSwitch: true
      case WireType.Bit64:
        this.pos += 4;
      case WireType.Bit32:
        this.pos += 4;
        break;
      case WireType.LengthDelimited:
        let len = this.uint32();
        this.pos += len;
        break;
      case WireType.StartGroup:
        if (recursionLimit <= 0) {
          throw new Error("maximum recursion depth reached");
        }
        for (; ; ) {
          const [fn, wt] = this.tag();
          if (wt === WireType.EndGroup) {
            if (fieldNo !== void 0 && fn !== fieldNo) {
              throw new Error("invalid end group tag");
            }
            break;
          }
          this.skip(wt, fn, recursionLimit - 1);
        }
        break;
      default:
        throw new Error("cant skip wire type " + wireType);
    }
    this.assertBounds();
    return this.buf.subarray(start, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let zze = this.uint32();
    return zze >>> 1 ^ -(zze & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    this.varint64();
    return protoInt64.dec(this.varint64Lo, this.varint64Hi);
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    this.varint64();
    return protoInt64.uDec(this.varint64Lo, this.varint64Hi);
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    this.varint64();
    let lo = this.varint64Lo;
    let hi = this.varint64Hi;
    let s = -(lo & 1);
    lo = (lo >>> 1 | (hi & 1) << 31) ^ s;
    hi = hi >>> 1 ^ s;
    return protoInt64.dec(lo, hi);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    const b = this.buf[this.pos];
    if (b < 128) {
      this.pos++;
      return b !== 0;
    }
    this.varint64();
    return this.varint64Lo !== 0 || this.varint64Hi !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return protoInt64.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return protoInt64.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, true);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, true);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let len = this.uint32(), start = this.pos;
    this.pos += len;
    this.assertBounds();
    return this.buf.subarray(start, start + len);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text. If
   * `strict` is true, throw on invalid UTF-8 instead of substituting U+FFFD.
   */
  string(strict) {
    const bytes2 = this.bytes();
    const len = bytes2.length;
    if (len <= ASCII_MAX_LENGTH) {
      const codes = new Array(len);
      for (let i = 0; i < len; i++) {
        const byte = bytes2[i];
        if (byte > 127) {
          return this.decodeUtf8(bytes2, strict);
        }
        codes[i] = byte;
      }
      return String.fromCharCode.apply(String, codes);
    }
    return this.decodeUtf8(bytes2, strict);
  }
};
function assertInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid int32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > INT32_MAX || arg < INT32_MIN)
    throw new Error("invalid int32: " + arg);
}
function assertUInt32(arg) {
  if (typeof arg == "string") {
    arg = Number(arg);
  } else if (typeof arg != "number") {
    throw new Error("invalid uint32: " + typeof arg);
  }
  if (!Number.isInteger(arg) || arg > UINT32_MAX || arg < 0)
    throw new Error("invalid uint32: " + arg);
}
function assertFloat32(arg) {
  if (typeof arg == "string") {
    const o = arg;
    arg = Number(arg);
    if (Number.isNaN(arg) && o !== "NaN") {
      throw new Error("invalid float32: " + o);
    }
  } else if (typeof arg != "number") {
    throw new Error("invalid float32: " + typeof arg);
  }
  if (Number.isFinite(arg) && (arg > FLOAT32_MAX || arg < FLOAT32_MIN))
    throw new Error("invalid float32: " + arg);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/reflect-check.js
function checkField(field4, value) {
  const check = field4.fieldKind == "list" ? isReflectList(value, field4) : field4.fieldKind == "map" ? isReflectMap(value, field4) : checkSingular(field4, value);
  if (check === true) {
    return void 0;
  }
  let reason;
  switch (field4.fieldKind) {
    case "list":
      reason = `expected ${formatReflectList(field4)}, got ${formatVal(value)}`;
      break;
    case "map":
      reason = `expected ${formatReflectMap(field4)}, got ${formatVal(value)}`;
      break;
    default: {
      reason = reasonSingular(field4, value, check);
    }
  }
  return new FieldError(field4, reason);
}
function checkListItem(field4, index, value) {
  const check = checkSingular(field4, value);
  if (check !== true) {
    return new FieldError(field4, `list item #${index + 1}: ${reasonSingular(field4, value, check)}`);
  }
  return void 0;
}
function checkMapEntry(field4, key, value) {
  const checkKey = checkScalarValue(field4.mapKey)(key);
  if (checkKey !== true) {
    return new FieldError(field4, `invalid map key: ${reasonSingular({ scalar: field4.mapKey }, key, checkKey)}`);
  }
  const checkVal = checkSingular(field4, value);
  if (checkVal !== true) {
    return new FieldError(field4, `map entry ${formatVal(key)}: ${reasonSingular(field4, value, checkVal)}`);
  }
  return void 0;
}
function checkSingular(field4, value) {
  if (field4.scalar !== void 0) {
    return checkScalarValue(field4.scalar)(value);
  }
  if (field4.enum !== void 0) {
    if (field4.enum.open) {
      return checkScalarValue(ScalarType.INT32)(value);
    }
    return field4.enum.values.some((v) => v.number === value);
  }
  return isReflectMessage(value, field4.message);
}
function checkScalarValue(scalar) {
  switch (scalar) {
    case ScalarType.DOUBLE:
      return (value) => typeof value == "number";
    case ScalarType.FLOAT:
      return (value) => {
        if (typeof value != "number") {
          return false;
        }
        if (Number.isNaN(value) || !Number.isFinite(value)) {
          return true;
        }
        if (value > FLOAT32_MAX || value < FLOAT32_MIN) {
          return `${value.toFixed()} out of range`;
        }
        return true;
      };
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      return (value) => {
        if (typeof value !== "number" || !Number.isInteger(value)) {
          return false;
        }
        if (value > INT32_MAX || value < INT32_MIN) {
          return `${value.toFixed()} out of range`;
        }
        return true;
      };
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      return (value) => {
        if (typeof value !== "number" || !Number.isInteger(value)) {
          return false;
        }
        if (value > UINT32_MAX || value < 0) {
          return `${value.toFixed()} out of range`;
        }
        return true;
      };
    case ScalarType.BOOL:
      return (value) => typeof value == "boolean";
    case ScalarType.STRING:
      return (value) => {
        if (typeof value != "string") {
          return false;
        }
        return getTextEncoding().checkUtf8(value) || "invalid UTF8";
      };
    case ScalarType.BYTES:
      return (value) => value instanceof Uint8Array;
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return (value) => {
        if (typeof value == "bigint" || typeof value == "number" || typeof value == "string" && value.length > 0) {
          try {
            protoInt64.parse(value);
            return true;
          } catch (_) {
            return `${value} out of range`;
          }
        }
        return false;
      };
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      return (value) => {
        if (typeof value == "bigint" || typeof value == "number" || typeof value == "string" && value.length > 0) {
          try {
            protoInt64.uParse(value);
            return true;
          } catch (_) {
            return `${value} out of range`;
          }
        }
        return false;
      };
  }
}
function reasonSingular(field4, val, details) {
  details = typeof details == "string" ? `: ${details}` : `, got ${formatVal(val)}`;
  if (field4.scalar !== void 0) {
    return `expected ${scalarTypeDescription(field4.scalar)}` + details;
  }
  if (field4.enum !== void 0) {
    return `expected ${field4.enum.toString()}` + details;
  }
  return `expected ${formatReflectMessage(field4.message)}` + details;
}
function formatVal(val) {
  switch (typeof val) {
    case "object":
      if (val === null) {
        return "null";
      }
      if (val instanceof Uint8Array) {
        return `Uint8Array(${val.length})`;
      }
      if (Array.isArray(val)) {
        return `Array(${val.length})`;
      }
      if (isReflectList(val)) {
        return formatReflectList(val.field());
      }
      if (isReflectMap(val)) {
        return formatReflectMap(val.field());
      }
      if (isReflectMessage(val)) {
        return formatReflectMessage(val.desc);
      }
      if (isMessage(val)) {
        return `message ${val.$typeName}`;
      }
      return "object";
    case "string":
      return val.length > 30 ? "string" : `"${val.split('"').join('\\"')}"`;
    case "boolean":
      return String(val);
    case "number":
      return String(val);
    case "bigint":
      return String(val) + "n";
    default:
      return typeof val;
  }
}
function formatReflectMessage(desc) {
  return `ReflectMessage (${desc.typeName})`;
}
function formatReflectList(field4) {
  switch (field4.listKind) {
    case "message":
      return `ReflectList (${field4.message.toString()})`;
    case "enum":
      return `ReflectList (${field4.enum.toString()})`;
    case "scalar":
      return `ReflectList (${ScalarType[field4.scalar]})`;
  }
}
function formatReflectMap(field4) {
  switch (field4.mapKind) {
    case "message":
      return `ReflectMap (${ScalarType[field4.mapKey]}, ${field4.message.toString()})`;
    case "enum":
      return `ReflectMap (${ScalarType[field4.mapKey]}, ${field4.enum.toString()})`;
    case "scalar":
      return `ReflectMap (${ScalarType[field4.mapKey]}, ${ScalarType[field4.scalar]})`;
  }
}
function scalarTypeDescription(scalar) {
  switch (scalar) {
    case ScalarType.STRING:
      return "string";
    case ScalarType.BOOL:
      return "boolean";
    case ScalarType.INT64:
    case ScalarType.SINT64:
    case ScalarType.SFIXED64:
      return "bigint (int64)";
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return "bigint (uint64)";
    case ScalarType.BYTES:
      return "Uint8Array";
    case ScalarType.DOUBLE:
      return "number (float64)";
    case ScalarType.FLOAT:
      return "number (float32)";
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      return "number (uint32)";
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      return "number (int32)";
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/message.js
var NULL_VALUE = 0;
function localMessageMapper(field4) {
  if (usesJsonRepresentation(field4)) {
    return {
      toMessage: (local) => wktStructToReflect(local),
      toLocal: (message2) => wktStructToLocal(message2)
    };
  }
  if (field4.fieldKind == "message" && !field4.oneof && isWrapperDesc(field4.message)) {
    const wrapperDesc = field4.message;
    const valueLocalName = wrapperDesc.fields[0].localName;
    return {
      toMessage: (local) => {
        const message2 = create(wrapperDesc);
        if (local !== void 0) {
          message2[valueLocalName] = local;
        }
        return message2;
      },
      toLocal: (message2) => message2[valueLocalName]
    };
  }
  const childDesc = field4.message;
  return {
    toMessage: (local) => local === void 0 ? create(childDesc) : local,
    toLocal: (message2) => message2
  };
}
function usesJsonRepresentation(field4) {
  return field4.message.typeName == "google.protobuf.Struct" && field4.parent.typeName != "google.protobuf.Value";
}
function wktStructToReflect(json) {
  const struct = {
    $typeName: "google.protobuf.Struct",
    fields: {}
  };
  if (isObject(json)) {
    for (const k of Object.keys(json)) {
      struct.fields[k] = wktValueToReflect(json[k]);
    }
  }
  return struct;
}
function wktStructToLocal(val) {
  const json = {};
  for (const k of Object.keys(val.fields)) {
    json[k] = wktValueToLocal(val.fields[k]);
  }
  return json;
}
function wktValueToLocal(val) {
  switch (val.kind.case) {
    case "structValue":
      return wktStructToLocal(val.kind.value);
    case "listValue":
      return val.kind.value.values.map(wktValueToLocal);
    case "nullValue":
    case void 0:
      return null;
    default:
      return val.kind.value;
  }
}
function wktValueToReflect(json) {
  const value = {
    $typeName: "google.protobuf.Value",
    kind: { case: void 0 }
  };
  switch (typeof json) {
    case "number":
      value.kind = { case: "numberValue", value: json };
      break;
    case "string":
      value.kind = { case: "stringValue", value: json };
      break;
    case "boolean":
      value.kind = { case: "boolValue", value: json };
      break;
    case "object":
      if (json === null) {
        value.kind = { case: "nullValue", value: NULL_VALUE };
      } else if (Array.isArray(json)) {
        const listValue = {
          $typeName: "google.protobuf.ListValue",
          values: []
        };
        if (Array.isArray(json)) {
          for (const e of json) {
            listValue.values.push(wktValueToReflect(e));
          }
        }
        value.kind = {
          case: "listValue",
          value: listValue
        };
      } else {
        value.kind = {
          case: "structValue",
          value: wktStructToReflect(json)
        };
      }
      break;
  }
  return value;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/reflect.js
function reflect(messageDesc2, message2, check = true) {
  return new ReflectMessageImpl(messageDesc2, message2, check);
}
var messageSortedFields = /* @__PURE__ */ new WeakMap();
var ReflectMessageImpl = class {
  get sortedFields() {
    const cached = messageSortedFields.get(this.desc);
    if (cached) {
      return cached;
    }
    const sortedFields = this.desc.fields.concat().sort((a, b) => a.number - b.number);
    messageSortedFields.set(this.desc, sortedFields);
    return sortedFields;
  }
  constructor(messageDesc2, message2, check = true) {
    this.lists = /* @__PURE__ */ new Map();
    this.maps = /* @__PURE__ */ new Map();
    this.check = check;
    this.desc = messageDesc2;
    this.message = this[unsafeLocal] = message2 !== null && message2 !== void 0 ? message2 : create(messageDesc2);
    this.fields = messageDesc2.fields;
    this.oneofs = messageDesc2.oneofs;
    this.members = messageDesc2.members;
  }
  findNumber(number) {
    if (!this._fieldsByNumber) {
      this._fieldsByNumber = new Map(this.desc.fields.map((f) => [f.number, f]));
    }
    return this._fieldsByNumber.get(number);
  }
  oneofCase(oneof) {
    assertOwn(this.message, oneof);
    return unsafeOneofCase(this.message, oneof);
  }
  isSet(field4) {
    assertOwn(this.message, field4);
    return unsafeIsSet(this.message, field4);
  }
  clear(field4) {
    assertOwn(this.message, field4);
    unsafeClear(this.message, field4);
  }
  get(field4) {
    assertOwn(this.message, field4);
    const value = unsafeGet(this.message, field4);
    switch (field4.fieldKind) {
      case "list":
        let list = this.lists.get(field4);
        if (!list || list[unsafeLocal] !== value) {
          this.lists.set(
            field4,
            // biome-ignore lint/suspicious/noAssignInExpressions: no
            list = new ReflectListImpl(field4, value, this.check)
          );
        }
        return list;
      case "map":
        let map = this.maps.get(field4);
        if (!map || map[unsafeLocal] !== value) {
          this.maps.set(
            field4,
            // biome-ignore lint/suspicious/noAssignInExpressions: no
            map = new ReflectMapImpl(field4, value, this.check)
          );
        }
        return map;
      case "message":
        return messageToReflect(field4, value, this.check);
      case "scalar":
        return value === void 0 ? scalarZeroValue(field4.scalar, false) : longToReflect(field4, value);
      case "enum":
        return value !== null && value !== void 0 ? value : field4.enum.values[0].number;
    }
  }
  set(field4, value) {
    assertOwn(this.message, field4);
    if (this.check) {
      const err = checkField(field4, value);
      if (err) {
        throw err;
      }
    }
    let local;
    if (field4.fieldKind == "message") {
      local = messageToLocal(field4, value);
    } else if (isReflectMap(value) || isReflectList(value)) {
      local = value[unsafeLocal];
    } else {
      local = longToLocal(field4, value);
    }
    unsafeSet(this.message, field4, local);
  }
  getUnknown() {
    return this.message.$unknown;
  }
  setUnknown(value) {
    this.message.$unknown = value;
  }
};
function assertOwn(owner, member) {
  if (member.parent.typeName !== owner.$typeName) {
    throw new FieldError(member, `cannot use ${member.toString()} with message ${owner.$typeName}`, "ForeignFieldError");
  }
}
var ReflectListImpl = class {
  field() {
    return this._field;
  }
  get size() {
    return this._arr.length;
  }
  constructor(field4, unsafeInput, check) {
    this._field = field4;
    this._arr = this[unsafeLocal] = unsafeInput;
    this.check = check;
  }
  get(index) {
    const item = this._arr[index];
    return item === void 0 ? void 0 : listItemToReflect(this._field, item, this.check);
  }
  set(index, item) {
    if (index < 0 || index >= this._arr.length) {
      throw new FieldError(this._field, `list item #${index + 1}: out of range`);
    }
    if (this.check) {
      const err = checkListItem(this._field, index, item);
      if (err) {
        throw err;
      }
    }
    this._arr[index] = listItemToLocal(this._field, item);
  }
  add(item) {
    if (this.check) {
      const err = checkListItem(this._field, this._arr.length, item);
      if (err) {
        throw err;
      }
    }
    this._arr.push(listItemToLocal(this._field, item));
    return void 0;
  }
  clear() {
    this._arr.splice(0, this._arr.length);
  }
  [Symbol.iterator]() {
    return this.values();
  }
  keys() {
    return this._arr.keys();
  }
  *values() {
    for (const item of this._arr) {
      yield listItemToReflect(this._field, item, this.check);
    }
  }
  *entries() {
    for (let i = 0; i < this._arr.length; i++) {
      yield [i, listItemToReflect(this._field, this._arr[i], this.check)];
    }
  }
};
var ReflectMapImpl = class {
  constructor(field4, unsafeInput, check = true) {
    this.obj = this[unsafeLocal] = unsafeInput !== null && unsafeInput !== void 0 ? unsafeInput : {};
    this.check = check;
    this._field = field4;
  }
  field() {
    return this._field;
  }
  set(key, value) {
    if (this.check) {
      const err = checkMapEntry(this._field, key, value);
      if (err) {
        throw err;
      }
    }
    this.obj[mapKeyToLocal(key)] = mapValueToLocal(this._field, value);
    return this;
  }
  delete(key) {
    const k = mapKeyToLocal(key);
    const has = Object.prototype.hasOwnProperty.call(this.obj, k);
    if (has) {
      delete this.obj[k];
    }
    return has;
  }
  clear() {
    for (const key of Object.keys(this.obj)) {
      delete this.obj[key];
    }
  }
  get(key) {
    let val = this.obj[mapKeyToLocal(key)];
    if (val !== void 0) {
      val = mapValueToReflect(this._field, val, this.check);
    }
    return val;
  }
  has(key) {
    return Object.prototype.hasOwnProperty.call(this.obj, mapKeyToLocal(key));
  }
  *keys() {
    for (const objKey of Object.keys(this.obj)) {
      yield mapKeyToReflect(objKey, this._field.mapKey);
    }
  }
  *entries() {
    for (const objEntry of Object.entries(this.obj)) {
      yield [
        mapKeyToReflect(objEntry[0], this._field.mapKey),
        mapValueToReflect(this._field, objEntry[1], this.check)
      ];
    }
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  get size() {
    return Object.keys(this.obj).length;
  }
  *values() {
    for (const val of Object.values(this.obj)) {
      yield mapValueToReflect(this._field, val, this.check);
    }
  }
  forEach(callbackfn, thisArg) {
    for (const mapEntry of this.entries()) {
      callbackfn.call(thisArg, mapEntry[1], mapEntry[0], this);
    }
  }
};
function messageToLocal(field4, value) {
  if (!isReflectMessage(value)) {
    return value;
  }
  if (isWrapper(value.message) && !field4.oneof && field4.fieldKind == "message") {
    return value.message.value;
  }
  if (value.desc.typeName == "google.protobuf.Struct" && field4.parent.typeName != "google.protobuf.Value") {
    return wktStructToLocal(value.message);
  }
  return value.message;
}
function messageToReflect(field4, value, check) {
  if (value !== void 0) {
    if (isWrapperDesc(field4.message) && !field4.oneof && field4.fieldKind == "message") {
      value = {
        $typeName: field4.message.typeName,
        value: longToReflect(field4.message.fields[0], value)
      };
    } else if (field4.message.typeName == "google.protobuf.Struct" && field4.parent.typeName != "google.protobuf.Value" && isObject(value)) {
      value = wktStructToReflect(value);
    }
  }
  return new ReflectMessageImpl(field4.message, value, check);
}
function listItemToLocal(field4, value) {
  if (field4.listKind == "message") {
    return messageToLocal(field4, value);
  }
  return longToLocal(field4, value);
}
function listItemToReflect(field4, value, check) {
  if (field4.listKind == "message") {
    return messageToReflect(field4, value, check);
  }
  return longToReflect(field4, value);
}
function mapValueToLocal(field4, value) {
  if (field4.mapKind == "message") {
    return messageToLocal(field4, value);
  }
  return longToLocal(field4, value);
}
function mapValueToReflect(field4, value, check) {
  if (field4.mapKind == "message") {
    return messageToReflect(field4, value, check);
  }
  return value;
}
function mapKeyToLocal(key) {
  return typeof key == "string" || typeof key == "number" ? key : String(key);
}
function mapKeyToReflect(key, type) {
  switch (type) {
    case ScalarType.STRING:
      return key;
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32: {
      const n = Number.parseInt(key);
      if (Number.isFinite(n)) {
        return n;
      }
      break;
    }
    case ScalarType.BOOL:
      switch (key) {
        case "true":
          return true;
        case "false":
          return false;
      }
      break;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      try {
        return protoInt64.uParse(key);
      } catch (_a) {
      }
      break;
    default:
      try {
        return protoInt64.parse(key);
      } catch (_b) {
      }
      break;
  }
  return key;
}
function longToReflect(field4, value) {
  switch (field4.scalar) {
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if ("longAsString" in field4 && field4.longAsString && typeof value == "string") {
        value = protoInt64.parse(value);
      }
      break;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if ("longAsString" in field4 && field4.longAsString && typeof value == "string") {
        value = protoInt64.uParse(value);
      }
      break;
  }
  return value;
}
function longToLocal(field4, value) {
  switch (field4.scalar) {
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if ("longAsString" in field4 && field4.longAsString) {
        value = String(value);
      } else if (typeof value == "string" || typeof value == "number") {
        value = protoInt64.parse(value);
      }
      break;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if ("longAsString" in field4 && field4.longAsString) {
        value = String(value);
      } else if (typeof value == "string" || typeof value == "number") {
        value = protoInt64.uParse(value);
      }
      break;
  }
  return value;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/clone.js
function clone(schema, message2) {
  return cloneReflect(reflect(schema, message2)).message;
}
function cloneReflect(i) {
  const o = reflect(i.desc);
  for (const f of i.fields) {
    if (!i.isSet(f)) {
      continue;
    }
    switch (f.fieldKind) {
      case "list":
        const list = o.get(f);
        for (const item of i.get(f)) {
          list.add(cloneSingular(f, item));
        }
        break;
      case "map":
        const map = o.get(f);
        for (const entry of i.get(f).entries()) {
          map.set(entry[0], cloneSingular(f, entry[1]));
        }
        break;
      default: {
        o.set(f, cloneSingular(f, i.get(f)));
        break;
      }
    }
  }
  const unknown = i.getUnknown();
  if (unknown && unknown.length > 0) {
    o.setUnknown([...unknown]);
  }
  return o;
}
function cloneSingular(field4, value) {
  if (field4.message !== void 0 && isReflectMessage(value)) {
    return cloneReflect(value);
  }
  if (field4.scalar == ScalarType.BYTES && value instanceof Uint8Array) {
    return value.slice();
  }
  return value;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wire/base64-encoding.js
var nativeSetFromBase64 = Uint8Array.prototype.setFromBase64;
function base64Decode(base64Str) {
  const len = base64Str.length;
  let size = len - (len + 3 >> 2);
  if ((len & 3) == 0 && base64Str[len - 1] == "=") {
    size -= base64Str[len - 2] == "=" ? 2 : 1;
  }
  const bytes2 = new Uint8Array(size);
  let written = -1;
  if (nativeSetFromBase64) {
    try {
      const result2 = nativeSetFromBase64.call(bytes2, base64Str);
      if (result2.read == len) {
        written = result2.written;
      }
    } catch (_a) {
    }
  }
  if (written < 0) {
    written = setFromBase64(bytes2, base64Str);
  }
  return written == size ? bytes2 : bytes2.subarray(0, written);
}
function setFromBase64(bytes2, base64Str) {
  const table = getDecodeTable();
  let bytePos = 0, groupPos = 0, b, p = 0;
  for (let i = 0; i < base64Str.length; i++) {
    b = table[base64Str.charCodeAt(i)];
    if (b === void 0) {
      switch (base64Str[i]) {
        // @ts-ignore TS7029: Fallthrough case in switch -- ignore instead of expect-error for compiler settings without noFallthroughCasesInSwitch: true
        case "=":
          groupPos = 0;
        // reset state when padding found
        case "\n":
        case "\r":
        case "	":
        case " ":
          continue;
        // skip white-space, and padding
        default:
          throw Error("invalid base64 string");
      }
    }
    switch (groupPos) {
      case 0:
        p = b;
        groupPos = 1;
        break;
      case 1:
        bytes2[bytePos++] = p << 2 | (b & 48) >> 4;
        p = b;
        groupPos = 2;
        break;
      case 2:
        bytes2[bytePos++] = (p & 15) << 4 | (b & 60) >> 2;
        p = b;
        groupPos = 3;
        break;
      case 3:
        bytes2[bytePos++] = (p & 3) << 6 | b;
        groupPos = 0;
        break;
    }
  }
  if (groupPos == 1)
    throw Error("invalid base64 string");
  return bytePos;
}
var nativeToBase64 = Uint8Array.prototype.toBase64;
var toBase64OptionsMap = {
  std: { alphabet: "base64", omitPadding: false },
  std_raw: { alphabet: "base64", omitPadding: true },
  url: { alphabet: "base64url", omitPadding: true }
};
function base64Encode(bytes2, encoding = "std") {
  if (nativeToBase64) {
    return nativeToBase64.call(bytes2, toBase64OptionsMap[encoding]);
  }
  const table = getEncodeTable(encoding);
  const pad = encoding == "std";
  let base64 = "", groupPos = 0, b, p = 0;
  for (let i = 0; i < bytes2.length; i++) {
    b = bytes2[i];
    switch (groupPos) {
      case 0:
        base64 += table[b >> 2];
        p = (b & 3) << 4;
        groupPos = 1;
        break;
      case 1:
        base64 += table[p | b >> 4];
        p = (b & 15) << 2;
        groupPos = 2;
        break;
      case 2:
        base64 += table[p | b >> 6];
        base64 += table[b & 63];
        groupPos = 0;
        break;
    }
  }
  if (groupPos) {
    base64 += table[p];
    if (pad) {
      base64 += "=";
      if (groupPos == 1)
        base64 += "=";
    }
  }
  return base64;
}
var encodeTableStd;
var encodeTableUrl;
var decodeTable;
function getEncodeTable(encoding) {
  if (!encodeTableStd) {
    encodeTableStd = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    encodeTableUrl = encodeTableStd.slice(0, -2).concat("-", "_");
  }
  return encoding == "url" ? (
    // biome-ignore lint/style/noNonNullAssertion: TS fails to narrow down
    encodeTableUrl
  ) : encodeTableStd;
}
function getDecodeTable() {
  if (!decodeTable) {
    decodeTable = [];
    const encodeTable = getEncodeTable("std");
    for (let i = 0; i < encodeTable.length; i++)
      decodeTable[encodeTable[i].charCodeAt(0)] = i;
    decodeTable["-".charCodeAt(0)] = encodeTable.indexOf("+");
    decodeTable["_".charCodeAt(0)] = encodeTable.indexOf("/");
  }
  return decodeTable;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/names.js
function protoCamelCase(snakeCase) {
  let capNext = false;
  const b = [];
  for (let i = 0; i < snakeCase.length; i++) {
    let c = snakeCase.charAt(i);
    switch (c) {
      case "_":
        capNext = true;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        b.push(c);
        capNext = false;
        break;
      default:
        if (capNext) {
          capNext = false;
          c = c.toUpperCase();
        }
        b.push(c);
        break;
    }
  }
  return b.join("");
}
function protoSnakeCase(lowerCamelCase) {
  return lowerCamelCase.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase());
}
var reservedObjectProperties = /* @__PURE__ */ new Set([
  // names reserved by JavaScript
  "constructor",
  "toString",
  "toJSON",
  "valueOf"
]);
function safeObjectProperty(name) {
  return reservedObjectProperties.has(name) ? name + "$" : name;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/codegenv2/restore-json-names.js
function restoreJsonNames(message2) {
  for (const f of message2.field) {
    if (!unsafeIsSetExplicit(f, "jsonName")) {
      f.jsonName = protoCamelCase(f.name);
    }
  }
  message2.nestedType.forEach(restoreJsonNames);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wire/text-format.js
function parseTextFormatEnumValue(descEnum, value) {
  const enumValue = descEnum.values.find((v) => v.name === value);
  if (!enumValue) {
    throw new Error(`cannot parse ${descEnum} default value: ${value}`);
  }
  return enumValue.number;
}
function parseTextFormatScalarValue(type, value) {
  switch (type) {
    case ScalarType.STRING:
      return value;
    case ScalarType.BYTES: {
      const u = unescapeBytesDefaultValue(value);
      if (u === false) {
        throw new Error(`cannot parse ${ScalarType[type]} default value: ${value}`);
      }
      return u;
    }
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return protoInt64.parse(value);
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return protoInt64.uParse(value);
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      switch (value) {
        case "inf":
          return Number.POSITIVE_INFINITY;
        case "-inf":
          return Number.NEGATIVE_INFINITY;
        case "nan":
          return Number.NaN;
        default:
          return parseFloat(value);
      }
    case ScalarType.BOOL:
      return value === "true";
    case ScalarType.INT32:
    case ScalarType.UINT32:
    case ScalarType.SINT32:
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
      return parseInt(value, 10);
  }
}
function unescapeBytesDefaultValue(str2) {
  const b = [];
  const input = {
    tail: str2,
    c: "",
    next() {
      if (this.tail.length == 0) {
        return false;
      }
      this.c = this.tail[0];
      this.tail = this.tail.substring(1);
      return true;
    },
    take(n) {
      if (this.tail.length >= n) {
        const r = this.tail.substring(0, n);
        this.tail = this.tail.substring(n);
        return r;
      }
      return false;
    }
  };
  while (input.next()) {
    switch (input.c) {
      case "\\":
        if (input.next()) {
          switch (input.c) {
            case "\\":
              b.push(input.c.charCodeAt(0));
              break;
            case "b":
              b.push(8);
              break;
            case "f":
              b.push(12);
              break;
            case "n":
              b.push(10);
              break;
            case "r":
              b.push(13);
              break;
            case "t":
              b.push(9);
              break;
            case "v":
              b.push(11);
              break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7": {
              const s = input.c;
              const t = input.take(2);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 8);
              if (Number.isNaN(n)) {
                return false;
              }
              b.push(n);
              break;
            }
            case "x": {
              const s = input.c;
              const t = input.take(2);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 16);
              if (Number.isNaN(n)) {
                return false;
              }
              b.push(n);
              break;
            }
            case "u": {
              const s = input.c;
              const t = input.take(4);
              if (t === false) {
                return false;
              }
              const n = parseInt(s + t, 16);
              if (Number.isNaN(n)) {
                return false;
              }
              const chunk = new Uint8Array(4);
              const view = new DataView(chunk.buffer);
              view.setInt32(0, n, true);
              b.push(chunk[0], chunk[1], chunk[2], chunk[3]);
              break;
            }
            case "U": {
              const s = input.c;
              const t = input.take(8);
              if (t === false) {
                return false;
              }
              const tc = protoInt64.uEnc(s + t);
              const chunk = new Uint8Array(8);
              const view = new DataView(chunk.buffer);
              view.setInt32(0, tc.lo, true);
              view.setInt32(4, tc.hi, true);
              b.push(chunk[0], chunk[1], chunk[2], chunk[3], chunk[4], chunk[5], chunk[6], chunk[7]);
              break;
            }
          }
        }
        break;
      default:
        b.push(input.c.charCodeAt(0));
    }
  }
  return new Uint8Array(b);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/reflect/nested-types.js
function* nestedTypes(desc) {
  switch (desc.kind) {
    case "file":
      for (const message2 of desc.messages) {
        yield message2;
        yield* nestedTypes(message2);
      }
      yield* desc.enums;
      yield* desc.services;
      yield* desc.extensions;
      break;
    case "message":
      for (const message2 of desc.nestedMessages) {
        yield message2;
        yield* nestedTypes(message2);
      }
      yield* desc.nestedEnums;
      yield* desc.nestedExtensions;
      break;
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/registry.js
function createFileRegistry(...args) {
  const registry2 = createBaseRegistry();
  if (!args.length) {
    return registry2;
  }
  if ("$typeName" in args[0] && args[0].$typeName == "google.protobuf.FileDescriptorSet") {
    for (const file of args[0].file) {
      addFile(file, registry2);
    }
    return registry2;
  }
  if ("$typeName" in args[0]) {
    let recurseDeps = function(file) {
      const deps = [];
      for (const protoFileName of file.dependency) {
        if (registry2.getFile(protoFileName) != void 0) {
          continue;
        }
        if (seen.has(protoFileName)) {
          continue;
        }
        const dep = resolve(protoFileName);
        if (!dep) {
          throw new Error(`Unable to resolve ${protoFileName}, imported by ${file.name}`);
        }
        if ("kind" in dep) {
          registry2.addFile(dep, false, true);
        } else {
          seen.add(dep.name);
          deps.push(dep);
        }
      }
      return deps.concat(...deps.map(recurseDeps));
    };
    const input = args[0];
    const resolve = args[1];
    const seen = /* @__PURE__ */ new Set();
    for (const file of [input, ...recurseDeps(input)].reverse()) {
      addFile(file, registry2);
    }
  } else {
    for (const fileReg of args) {
      for (const file of fileReg.files) {
        registry2.addFile(file);
      }
    }
  }
  return registry2;
}
function createBaseRegistry() {
  const types = /* @__PURE__ */ new Map();
  const extendees = /* @__PURE__ */ new Map();
  const files = /* @__PURE__ */ new Map();
  return {
    kind: "registry",
    types,
    extendees,
    [Symbol.iterator]() {
      return types.values();
    },
    get files() {
      return files.values();
    },
    addFile(file, skipTypes, withDeps) {
      files.set(file.proto.name, file);
      if (!skipTypes) {
        for (const type of nestedTypes(file)) {
          this.add(type);
        }
      }
      if (withDeps) {
        for (const f of file.dependencies) {
          this.addFile(f, skipTypes, withDeps);
        }
      }
    },
    add(desc) {
      if (desc.kind == "extension") {
        let numberToExt = extendees.get(desc.extendee.typeName);
        if (!numberToExt) {
          extendees.set(
            desc.extendee.typeName,
            // biome-ignore lint/suspicious/noAssignInExpressions: no
            numberToExt = /* @__PURE__ */ new Map()
          );
        }
        numberToExt.set(desc.number, desc);
      }
      types.set(desc.typeName, desc);
    },
    get(typeName) {
      return types.get(typeName);
    },
    getFile(fileName) {
      return files.get(fileName);
    },
    getMessage(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "message" ? t : void 0;
    },
    getEnum(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "enum" ? t : void 0;
    },
    getExtension(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "extension" ? t : void 0;
    },
    getExtensionFor(extendee, no) {
      var _a;
      return (_a = extendees.get(extendee.typeName)) === null || _a === void 0 ? void 0 : _a.get(no);
    },
    getService(typeName) {
      const t = types.get(typeName);
      return (t === null || t === void 0 ? void 0 : t.kind) == "service" ? t : void 0;
    }
  };
}
var EDITION_PROTO22 = 998;
var EDITION_PROTO32 = 999;
var EDITION_UNSTABLE = 9999;
var TYPE_STRING = 9;
var TYPE_GROUP = 10;
var TYPE_MESSAGE = 11;
var TYPE_BYTES = 12;
var TYPE_ENUM = 14;
var LABEL_REPEATED = 3;
var LABEL_REQUIRED = 2;
var JS_STRING = 1;
var IDEMPOTENCY_UNKNOWN = 0;
var EXPLICIT = 1;
var IMPLICIT3 = 2;
var LEGACY_REQUIRED = 3;
var PACKED = 1;
var DELIMITED = 2;
var OPEN = 1;
var VERIFY = 2;
var maximumEdition = 1001;
var featureDefaults = {
  // EDITION_PROTO2
  998: {
    fieldPresence: 1,
    // EXPLICIT,
    enumType: 2,
    // CLOSED,
    repeatedFieldEncoding: 2,
    // EXPANDED,
    utf8Validation: 3,
    // NONE,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 2,
    // LEGACY_BEST_EFFORT,
    enforceNamingStyle: 2,
    // STYLE_LEGACY,
    defaultSymbolVisibility: 1
    // EXPORT_ALL,
  },
  // EDITION_PROTO3
  999: {
    fieldPresence: 2,
    // IMPLICIT,
    enumType: 1,
    // OPEN,
    repeatedFieldEncoding: 1,
    // PACKED,
    utf8Validation: 2,
    // VERIFY,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 1,
    // ALLOW,
    enforceNamingStyle: 2,
    // STYLE_LEGACY,
    defaultSymbolVisibility: 1
    // EXPORT_ALL,
  },
  // EDITION_2023
  1e3: {
    fieldPresence: 1,
    // EXPLICIT,
    enumType: 1,
    // OPEN,
    repeatedFieldEncoding: 1,
    // PACKED,
    utf8Validation: 2,
    // VERIFY,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 1,
    // ALLOW,
    enforceNamingStyle: 2,
    // STYLE_LEGACY,
    defaultSymbolVisibility: 1
    // EXPORT_ALL,
  },
  // EDITION_2024
  1001: {
    fieldPresence: 1,
    // EXPLICIT,
    enumType: 1,
    // OPEN,
    repeatedFieldEncoding: 1,
    // PACKED,
    utf8Validation: 2,
    // VERIFY,
    messageEncoding: 1,
    // LENGTH_PREFIXED,
    jsonFormat: 1,
    // ALLOW,
    enforceNamingStyle: 1,
    // STYLE2024,
    defaultSymbolVisibility: 2
    // EXPORT_TOP_LEVEL,
  }
};
function addFile(proto, reg) {
  var _a, _b;
  const file = {
    kind: "file",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    edition: getFileEdition(proto),
    name: proto.name.replace(/\.proto$/, ""),
    dependencies: findFileDependencies(proto, reg),
    enums: [],
    messages: [],
    extensions: [],
    services: [],
    toString() {
      return `file ${proto.name}`;
    }
  };
  const mapEntriesStore = /* @__PURE__ */ new Map();
  const mapEntries = {
    get(typeName) {
      return mapEntriesStore.get(typeName);
    },
    add(desc) {
      var _a2;
      assert(((_a2 = desc.proto.options) === null || _a2 === void 0 ? void 0 : _a2.mapEntry) === true);
      mapEntriesStore.set(desc.typeName, desc);
    }
  };
  for (const enumProto of proto.enumType) {
    addEnum(enumProto, file, void 0, reg);
  }
  for (const messageProto of proto.messageType) {
    addMessage(messageProto, file, void 0, reg, mapEntries);
  }
  for (const serviceProto of proto.service) {
    addService(serviceProto, file, reg);
  }
  addExtensions(file, reg);
  for (const mapEntry of mapEntriesStore.values()) {
    addFields(mapEntry, reg, mapEntries);
  }
  for (const message2 of file.messages) {
    addFields(message2, reg, mapEntries);
    addExtensions(message2, reg);
  }
  reg.addFile(file, true);
}
function addExtensions(desc, reg) {
  switch (desc.kind) {
    case "file":
      for (const proto of desc.proto.extension) {
        const ext = newField(proto, desc, reg);
        desc.extensions.push(ext);
        reg.add(ext);
      }
      break;
    case "message":
      for (const proto of desc.proto.extension) {
        const ext = newField(proto, desc, reg);
        desc.nestedExtensions.push(ext);
        reg.add(ext);
      }
      for (const message2 of desc.nestedMessages) {
        addExtensions(message2, reg);
      }
      break;
  }
}
function addFields(message2, reg, mapEntries) {
  const allOneofs = message2.proto.oneofDecl.map((proto) => newOneof(proto, message2));
  const oneofsSeen = /* @__PURE__ */ new Set();
  for (const proto of message2.proto.field) {
    const oneof = findOneof(proto, allOneofs);
    const field4 = newField(proto, message2, reg, oneof, mapEntries);
    message2.fields.push(field4);
    message2.field[field4.localName] = field4;
    if (oneof === void 0) {
      message2.members.push(field4);
    } else {
      oneof.fields.push(field4);
      if (!oneofsSeen.has(oneof)) {
        oneofsSeen.add(oneof);
        message2.members.push(oneof);
      }
    }
  }
  for (const oneof of allOneofs.filter((o) => oneofsSeen.has(o))) {
    message2.oneofs.push(oneof);
  }
  for (const child of message2.nestedMessages) {
    addFields(child, reg, mapEntries);
  }
}
function addEnum(proto, file, parent, reg) {
  var _a, _b, _c, _d, _e;
  const sharedPrefix = findEnumSharedPrefix(proto.name, proto.value);
  const desc = {
    kind: "enum",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    parent,
    open: true,
    name: proto.name,
    typeName: makeTypeName(proto, parent, file),
    value: {},
    values: [],
    sharedPrefix,
    toString() {
      return `enum ${this.typeName}`;
    }
  };
  desc.open = isEnumOpen(desc);
  reg.add(desc);
  for (const p of proto.value) {
    const name = p.name;
    desc.values.push(
      // biome-ignore lint/suspicious/noAssignInExpressions: no
      desc.value[p.number] = {
        kind: "enum_value",
        proto: p,
        deprecated: (_d = (_c = p.options) === null || _c === void 0 ? void 0 : _c.deprecated) !== null && _d !== void 0 ? _d : false,
        parent: desc,
        name,
        localName: safeObjectProperty(sharedPrefix == void 0 ? name : name.substring(sharedPrefix.length)),
        number: p.number,
        toString() {
          return `enum value ${desc.typeName}.${name}`;
        }
      }
    );
  }
  ((_e = parent === null || parent === void 0 ? void 0 : parent.nestedEnums) !== null && _e !== void 0 ? _e : file.enums).push(desc);
}
function addMessage(proto, file, parent, reg, mapEntries) {
  var _a, _b, _c, _d;
  const desc = {
    kind: "message",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    parent,
    name: proto.name,
    typeName: makeTypeName(proto, parent, file),
    fields: [],
    field: {},
    oneofs: [],
    members: [],
    nestedEnums: [],
    nestedMessages: [],
    nestedExtensions: [],
    toString() {
      return `message ${this.typeName}`;
    }
  };
  if (((_c = proto.options) === null || _c === void 0 ? void 0 : _c.mapEntry) === true) {
    mapEntries.add(desc);
  } else {
    ((_d = parent === null || parent === void 0 ? void 0 : parent.nestedMessages) !== null && _d !== void 0 ? _d : file.messages).push(desc);
    reg.add(desc);
  }
  for (const enumProto of proto.enumType) {
    addEnum(enumProto, file, desc, reg);
  }
  for (const messageProto of proto.nestedType) {
    addMessage(messageProto, file, desc, reg, mapEntries);
  }
}
function addService(proto, file, reg) {
  var _a, _b;
  const desc = {
    kind: "service",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    file,
    name: proto.name,
    typeName: makeTypeName(proto, void 0, file),
    methods: [],
    method: {},
    toString() {
      return `service ${this.typeName}`;
    }
  };
  file.services.push(desc);
  reg.add(desc);
  for (const methodProto of proto.method) {
    const method = newMethod(methodProto, desc, reg);
    desc.methods.push(method);
    desc.method[method.localName] = method;
  }
}
function newMethod(proto, parent, reg) {
  var _a, _b, _c, _d;
  let methodKind;
  if (proto.clientStreaming && proto.serverStreaming) {
    methodKind = "bidi_streaming";
  } else if (proto.clientStreaming) {
    methodKind = "client_streaming";
  } else if (proto.serverStreaming) {
    methodKind = "server_streaming";
  } else {
    methodKind = "unary";
  }
  const input = reg.getMessage(trimLeadingDot(proto.inputType));
  const output = reg.getMessage(trimLeadingDot(proto.outputType));
  assert(input, `invalid MethodDescriptorProto: input_type ${proto.inputType} not found`);
  assert(output, `invalid MethodDescriptorProto: output_type ${proto.inputType} not found`);
  const name = proto.name;
  return {
    kind: "rpc",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    parent,
    name,
    localName: safeObjectProperty(name.length ? safeObjectProperty(name[0].toLowerCase() + name.substring(1)) : name),
    methodKind,
    input,
    output,
    idempotency: (_d = (_c = proto.options) === null || _c === void 0 ? void 0 : _c.idempotencyLevel) !== null && _d !== void 0 ? _d : IDEMPOTENCY_UNKNOWN,
    toString() {
      return `rpc ${parent.typeName}.${name}`;
    }
  };
}
function newOneof(proto, parent) {
  return {
    kind: "oneof",
    proto,
    deprecated: false,
    parent,
    fields: [],
    name: proto.name,
    localName: safeObjectProperty(protoCamelCase(proto.name)),
    toString() {
      return `oneof ${parent.typeName}.${this.name}`;
    }
  };
}
function newField(proto, parentOrFile, reg, oneof, mapEntries) {
  var _a, _b, _c;
  const isExtension = mapEntries === void 0;
  const field4 = {
    kind: "field",
    proto,
    deprecated: (_b = (_a = proto.options) === null || _a === void 0 ? void 0 : _a.deprecated) !== null && _b !== void 0 ? _b : false,
    name: proto.name,
    number: proto.number,
    scalar: void 0,
    message: void 0,
    enum: void 0,
    presence: getFieldPresence(proto, oneof, isExtension, parentOrFile),
    utf8Validation: isUtf8Validated(proto, parentOrFile),
    listKind: void 0,
    mapKind: void 0,
    mapKey: void 0,
    delimitedEncoding: void 0,
    packed: void 0,
    longAsString: false,
    getDefaultValue: void 0
  };
  let toStr;
  if (isExtension) {
    const file = parentOrFile.kind == "file" ? parentOrFile : parentOrFile.file;
    const parent = parentOrFile.kind == "file" ? void 0 : parentOrFile;
    const typeName = makeTypeName(proto, parent, file);
    field4.kind = "extension";
    field4.file = file;
    field4.parent = parent;
    field4.oneof = void 0;
    field4.typeName = typeName;
    field4.jsonName = `[${typeName}]`;
    toStr = () => `extension ${typeName}`;
    const extendee = reg.getMessage(trimLeadingDot(proto.extendee));
    assert(extendee, `invalid FieldDescriptorProto: extendee ${proto.extendee} not found`);
    field4.extendee = extendee;
  } else {
    const parent = parentOrFile;
    assert(parent.kind == "message");
    field4.parent = parent;
    field4.oneof = oneof;
    field4.localName = oneof ? protoCamelCase(proto.name) : safeObjectProperty(protoCamelCase(proto.name));
    field4.jsonName = proto.jsonName;
    toStr = () => `field ${parent.typeName}.${proto.name}`;
  }
  Object.defineProperty(field4, "toString", {
    value: toStr,
    writable: true,
    enumerable: true,
    configurable: true
  });
  const label = proto.label;
  const type = proto.type;
  const jstype = (_c = proto.options) === null || _c === void 0 ? void 0 : _c.jstype;
  if (label === LABEL_REPEATED) {
    const mapEntry = type == TYPE_MESSAGE ? mapEntries === null || mapEntries === void 0 ? void 0 : mapEntries.get(trimLeadingDot(proto.typeName)) : void 0;
    if (mapEntry) {
      field4.fieldKind = "map";
      const { key, value } = findMapEntryFields(mapEntry);
      field4.mapKey = key.scalar;
      field4.mapKind = value.fieldKind;
      field4.message = value.message;
      field4.delimitedEncoding = false;
      field4.enum = value.enum;
      field4.scalar = value.scalar;
      return field4;
    }
    field4.fieldKind = "list";
    switch (type) {
      case TYPE_MESSAGE:
      case TYPE_GROUP:
        field4.listKind = "message";
        field4.message = reg.getMessage(trimLeadingDot(proto.typeName));
        assert(field4.message);
        field4.delimitedEncoding = isDelimitedEncoding(proto, parentOrFile);
        break;
      case TYPE_ENUM:
        field4.listKind = "enum";
        field4.enum = reg.getEnum(trimLeadingDot(proto.typeName));
        assert(field4.enum);
        break;
      default:
        field4.listKind = "scalar";
        field4.scalar = type;
        field4.longAsString = jstype == JS_STRING;
        break;
    }
    field4.packed = isPackedField(proto, parentOrFile);
    return field4;
  }
  switch (type) {
    case TYPE_MESSAGE:
    case TYPE_GROUP:
      field4.fieldKind = "message";
      field4.message = reg.getMessage(trimLeadingDot(proto.typeName));
      assert(field4.message, `invalid FieldDescriptorProto: type_name ${proto.typeName} not found`);
      field4.delimitedEncoding = isDelimitedEncoding(proto, parentOrFile);
      field4.getDefaultValue = () => void 0;
      break;
    case TYPE_ENUM: {
      const enumeration = reg.getEnum(trimLeadingDot(proto.typeName));
      assert(enumeration !== void 0, `invalid FieldDescriptorProto: type_name ${proto.typeName} not found`);
      field4.fieldKind = "enum";
      field4.enum = reg.getEnum(trimLeadingDot(proto.typeName));
      field4.getDefaultValue = () => {
        return unsafeIsSetExplicit(proto, "defaultValue") ? parseTextFormatEnumValue(enumeration, proto.defaultValue) : void 0;
      };
      break;
    }
    default: {
      field4.fieldKind = "scalar";
      field4.scalar = type;
      field4.longAsString = jstype == JS_STRING;
      field4.getDefaultValue = () => {
        return unsafeIsSetExplicit(proto, "defaultValue") ? parseTextFormatScalarValue(type, proto.defaultValue) : void 0;
      };
      break;
    }
  }
  return field4;
}
function getFileEdition(proto) {
  switch (proto.syntax) {
    case "":
    case "proto2":
      return EDITION_PROTO22;
    case "proto3":
      return EDITION_PROTO32;
    case "editions":
      if (proto.edition === EDITION_UNSTABLE) {
        return maximumEdition;
      }
      if (proto.edition in featureDefaults) {
        return proto.edition;
      }
      throw new Error(`${proto.name}: unsupported edition`);
    default:
      throw new Error(`${proto.name}: unsupported syntax "${proto.syntax}"`);
  }
}
function findFileDependencies(proto, reg) {
  return proto.dependency.map((wantName) => {
    const dep = reg.getFile(wantName);
    if (!dep) {
      throw new Error(`Cannot find ${wantName}, imported by ${proto.name}`);
    }
    return dep;
  });
}
function findEnumSharedPrefix(enumName, values) {
  const prefix = camelToSnakeCase(enumName) + "_";
  for (const value of values) {
    if (!value.name.toLowerCase().startsWith(prefix)) {
      return void 0;
    }
    const shortName = value.name.substring(prefix.length);
    if (shortName.length == 0) {
      return void 0;
    }
    if (/^\d/.test(shortName)) {
      return void 0;
    }
  }
  return prefix;
}
function camelToSnakeCase(camel) {
  return (camel.substring(0, 1) + camel.substring(1).replace(/[A-Z]/g, (c) => "_" + c)).toLowerCase();
}
function makeTypeName(proto, parent, file) {
  let typeName;
  if (parent) {
    typeName = `${parent.typeName}.${proto.name}`;
  } else if (file.proto.package.length > 0) {
    typeName = `${file.proto.package}.${proto.name}`;
  } else {
    typeName = `${proto.name}`;
  }
  return typeName;
}
function trimLeadingDot(typeName) {
  return typeName.startsWith(".") ? typeName.substring(1) : typeName;
}
function findOneof(proto, allOneofs) {
  if (!unsafeIsSetExplicit(proto, "oneofIndex")) {
    return void 0;
  }
  if (proto.proto3Optional) {
    return void 0;
  }
  const oneof = allOneofs[proto.oneofIndex];
  assert(oneof, `invalid FieldDescriptorProto: oneof #${proto.oneofIndex} for field #${proto.number} not found`);
  return oneof;
}
function getFieldPresence(proto, oneof, isExtension, parent) {
  if (proto.label == LABEL_REQUIRED) {
    return LEGACY_REQUIRED;
  }
  if (proto.label == LABEL_REPEATED) {
    return IMPLICIT3;
  }
  if (!!oneof || proto.proto3Optional) {
    return EXPLICIT;
  }
  if (isExtension) {
    return EXPLICIT;
  }
  const resolved2 = resolveFeature("fieldPresence", { proto, parent });
  if (resolved2 == IMPLICIT3 && (proto.type == TYPE_MESSAGE || proto.type == TYPE_GROUP)) {
    return EXPLICIT;
  }
  return resolved2;
}
function isPackedField(proto, parent) {
  if (proto.label != LABEL_REPEATED) {
    return false;
  }
  switch (proto.type) {
    case TYPE_STRING:
    case TYPE_BYTES:
    case TYPE_GROUP:
    case TYPE_MESSAGE:
      return false;
  }
  const o = proto.options;
  if (o && unsafeIsSetExplicit(o, "packed")) {
    return o.packed;
  }
  return PACKED == resolveFeature("repeatedFieldEncoding", {
    proto,
    parent
  });
}
function findMapEntryFields(mapEntry) {
  const key = mapEntry.fields.find((f) => f.number === 1);
  const value = mapEntry.fields.find((f) => f.number === 2);
  assert(key && key.fieldKind == "scalar" && key.scalar != ScalarType.BYTES && key.scalar != ScalarType.FLOAT && key.scalar != ScalarType.DOUBLE && value && value.fieldKind != "list" && value.fieldKind != "map");
  return { key, value };
}
function isEnumOpen(desc) {
  var _a;
  return OPEN == resolveFeature("enumType", {
    proto: desc.proto,
    parent: (_a = desc.parent) !== null && _a !== void 0 ? _a : desc.file
  });
}
function isDelimitedEncoding(proto, parent) {
  if (proto.type == TYPE_GROUP) {
    return true;
  }
  return DELIMITED == resolveFeature("messageEncoding", {
    proto,
    parent
  });
}
function isUtf8Validated(proto, parent) {
  return VERIFY == resolveFeature("utf8Validation", {
    proto,
    parent
  });
}
function resolveFeature(name, ref) {
  var _a, _b;
  const featureSet = (_a = ref.proto.options) === null || _a === void 0 ? void 0 : _a.features;
  if (featureSet) {
    const val = featureSet[name];
    if (val != 0) {
      return val;
    }
  }
  if ("kind" in ref) {
    if (ref.kind == "message") {
      return resolveFeature(name, (_b = ref.parent) !== null && _b !== void 0 ? _b : ref.file);
    }
    const editionDefaults = featureDefaults[ref.edition];
    if (!editionDefaults) {
      throw new Error(`feature default for edition ${ref.edition} not found`);
    }
    return editionDefaults[name];
  }
  return resolveFeature(name, ref.parent);
}
function assert(condition, msg) {
  if (!condition) {
    throw new Error(msg);
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/codegenv2/boot.js
function boot(boot2) {
  const root = bootFileDescriptorProto(boot2);
  root.messageType.forEach(restoreJsonNames);
  const reg = createFileRegistry(root, () => void 0);
  return reg.getFile(root.name);
}
function bootFileDescriptorProto(init) {
  const proto = /* @__PURE__ */ Object.create({
    syntax: "",
    edition: 0
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FileDescriptorProto", dependency: [], publicDependency: [], weakDependency: [], optionDependency: [], service: [], extension: [] }, init), { messageType: init.messageType.map(bootDescriptorProto), enumType: init.enumType.map(bootEnumDescriptorProto) }));
}
function bootDescriptorProto(init) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const proto = /* @__PURE__ */ Object.create({
    visibility: 0
  });
  return Object.assign(proto, {
    $typeName: "google.protobuf.DescriptorProto",
    name: init.name,
    field: (_b = (_a = init.field) === null || _a === void 0 ? void 0 : _a.map(bootFieldDescriptorProto)) !== null && _b !== void 0 ? _b : [],
    extension: [],
    nestedType: (_d = (_c = init.nestedType) === null || _c === void 0 ? void 0 : _c.map(bootDescriptorProto)) !== null && _d !== void 0 ? _d : [],
    enumType: (_f = (_e = init.enumType) === null || _e === void 0 ? void 0 : _e.map(bootEnumDescriptorProto)) !== null && _f !== void 0 ? _f : [],
    extensionRange: (_h = (_g = init.extensionRange) === null || _g === void 0 ? void 0 : _g.map((e) => Object.assign({ $typeName: "google.protobuf.DescriptorProto.ExtensionRange" }, e))) !== null && _h !== void 0 ? _h : [],
    oneofDecl: [],
    reservedRange: [],
    reservedName: []
  });
}
function bootFieldDescriptorProto(init) {
  const proto = /* @__PURE__ */ Object.create({
    label: 1,
    typeName: "",
    extendee: "",
    defaultValue: "",
    oneofIndex: 0,
    jsonName: "",
    proto3Optional: false
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FieldDescriptorProto" }, init), { options: init.options ? bootFieldOptions(init.options) : void 0 }));
}
function bootFieldOptions(init) {
  var _a, _b, _c;
  const proto = /* @__PURE__ */ Object.create({
    ctype: 0,
    packed: false,
    jstype: 0,
    lazy: false,
    unverifiedLazy: false,
    deprecated: false,
    weak: false,
    debugRedact: false,
    retention: 0
  });
  return Object.assign(proto, Object.assign(Object.assign({ $typeName: "google.protobuf.FieldOptions" }, init), { targets: (_a = init.targets) !== null && _a !== void 0 ? _a : [], editionDefaults: (_c = (_b = init.editionDefaults) === null || _b === void 0 ? void 0 : _b.map((e) => Object.assign({ $typeName: "google.protobuf.FieldOptions.EditionDefault" }, e))) !== null && _c !== void 0 ? _c : [], uninterpretedOption: [] }));
}
function bootEnumDescriptorProto(init) {
  const proto = /* @__PURE__ */ Object.create({
    visibility: 0
  });
  return Object.assign(proto, {
    $typeName: "google.protobuf.EnumDescriptorProto",
    name: init.name,
    reservedName: [],
    reservedRange: [],
    value: init.value.map((e) => Object.assign({ $typeName: "google.protobuf.EnumValueDescriptorProto" }, e))
  });
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/codegenv2/message.js
function messageDesc(file, path, ...paths) {
  return paths.reduce((acc, cur) => acc.nestedMessages[cur], file.messages[path]);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/gen/google/protobuf/descriptor_pb.js
var file_google_protobuf_descriptor = /* @__PURE__ */ boot({ "name": "google/protobuf/descriptor.proto", "package": "google.protobuf", "messageType": [{ "name": "FileDescriptorSet", "field": [{ "name": "file", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.FileDescriptorProto" }], "extensionRange": [{ "start": 536e6, "end": 536000001 }] }, { "name": "FileDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "package", "number": 2, "type": 9, "label": 1 }, { "name": "dependency", "number": 3, "type": 9, "label": 3 }, { "name": "public_dependency", "number": 10, "type": 5, "label": 3 }, { "name": "weak_dependency", "number": 11, "type": 5, "label": 3 }, { "name": "option_dependency", "number": 15, "type": 9, "label": 3 }, { "name": "message_type", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto" }, { "name": "enum_type", "number": 5, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto" }, { "name": "service", "number": 6, "type": 11, "label": 3, "typeName": ".google.protobuf.ServiceDescriptorProto" }, { "name": "extension", "number": 7, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "options", "number": 8, "type": 11, "label": 1, "typeName": ".google.protobuf.FileOptions" }, { "name": "source_code_info", "number": 9, "type": 11, "label": 1, "typeName": ".google.protobuf.SourceCodeInfo" }, { "name": "syntax", "number": 12, "type": 9, "label": 1 }, { "name": "edition", "number": 14, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }] }, { "name": "DescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "field", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "extension", "number": 6, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldDescriptorProto" }, { "name": "nested_type", "number": 3, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto" }, { "name": "enum_type", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto" }, { "name": "extension_range", "number": 5, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto.ExtensionRange" }, { "name": "oneof_decl", "number": 8, "type": 11, "label": 3, "typeName": ".google.protobuf.OneofDescriptorProto" }, { "name": "options", "number": 7, "type": 11, "label": 1, "typeName": ".google.protobuf.MessageOptions" }, { "name": "reserved_range", "number": 9, "type": 11, "label": 3, "typeName": ".google.protobuf.DescriptorProto.ReservedRange" }, { "name": "reserved_name", "number": 10, "type": 9, "label": 3 }, { "name": "visibility", "number": 11, "type": 14, "label": 1, "typeName": ".google.protobuf.SymbolVisibility" }], "nestedType": [{ "name": "ExtensionRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.ExtensionRangeOptions" }] }, { "name": "ReservedRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }] }] }, { "name": "ExtensionRangeOptions", "field": [{ "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }, { "name": "declaration", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.ExtensionRangeOptions.Declaration", "options": { "retention": 2 } }, { "name": "features", "number": 50, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "verification", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.ExtensionRangeOptions.VerificationState", "defaultValue": "UNVERIFIED", "options": { "retention": 2 } }], "nestedType": [{ "name": "Declaration", "field": [{ "name": "number", "number": 1, "type": 5, "label": 1 }, { "name": "full_name", "number": 2, "type": 9, "label": 1 }, { "name": "type", "number": 3, "type": 9, "label": 1 }, { "name": "reserved", "number": 5, "type": 8, "label": 1 }, { "name": "repeated", "number": 6, "type": 8, "label": 1 }] }], "enumType": [{ "name": "VerificationState", "value": [{ "name": "DECLARATION", "number": 0 }, { "name": "UNVERIFIED", "number": 1 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "FieldDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "number", "number": 3, "type": 5, "label": 1 }, { "name": "label", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldDescriptorProto.Label" }, { "name": "type", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldDescriptorProto.Type" }, { "name": "type_name", "number": 6, "type": 9, "label": 1 }, { "name": "extendee", "number": 2, "type": 9, "label": 1 }, { "name": "default_value", "number": 7, "type": 9, "label": 1 }, { "name": "oneof_index", "number": 9, "type": 5, "label": 1 }, { "name": "json_name", "number": 10, "type": 9, "label": 1 }, { "name": "options", "number": 8, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions" }, { "name": "proto3_optional", "number": 17, "type": 8, "label": 1 }], "enumType": [{ "name": "Type", "value": [{ "name": "TYPE_DOUBLE", "number": 1 }, { "name": "TYPE_FLOAT", "number": 2 }, { "name": "TYPE_INT64", "number": 3 }, { "name": "TYPE_UINT64", "number": 4 }, { "name": "TYPE_INT32", "number": 5 }, { "name": "TYPE_FIXED64", "number": 6 }, { "name": "TYPE_FIXED32", "number": 7 }, { "name": "TYPE_BOOL", "number": 8 }, { "name": "TYPE_STRING", "number": 9 }, { "name": "TYPE_GROUP", "number": 10 }, { "name": "TYPE_MESSAGE", "number": 11 }, { "name": "TYPE_BYTES", "number": 12 }, { "name": "TYPE_UINT32", "number": 13 }, { "name": "TYPE_ENUM", "number": 14 }, { "name": "TYPE_SFIXED32", "number": 15 }, { "name": "TYPE_SFIXED64", "number": 16 }, { "name": "TYPE_SINT32", "number": 17 }, { "name": "TYPE_SINT64", "number": 18 }] }, { "name": "Label", "value": [{ "name": "LABEL_OPTIONAL", "number": 1 }, { "name": "LABEL_REPEATED", "number": 3 }, { "name": "LABEL_REQUIRED", "number": 2 }] }] }, { "name": "OneofDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "options", "number": 2, "type": 11, "label": 1, "typeName": ".google.protobuf.OneofOptions" }] }, { "name": "EnumDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "value", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumValueDescriptorProto" }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.EnumOptions" }, { "name": "reserved_range", "number": 4, "type": 11, "label": 3, "typeName": ".google.protobuf.EnumDescriptorProto.EnumReservedRange" }, { "name": "reserved_name", "number": 5, "type": 9, "label": 3 }, { "name": "visibility", "number": 6, "type": 14, "label": 1, "typeName": ".google.protobuf.SymbolVisibility" }], "nestedType": [{ "name": "EnumReservedRange", "field": [{ "name": "start", "number": 1, "type": 5, "label": 1 }, { "name": "end", "number": 2, "type": 5, "label": 1 }] }] }, { "name": "EnumValueDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "number", "number": 2, "type": 5, "label": 1 }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.EnumValueOptions" }] }, { "name": "ServiceDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "method", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.MethodDescriptorProto" }, { "name": "options", "number": 3, "type": 11, "label": 1, "typeName": ".google.protobuf.ServiceOptions" }] }, { "name": "MethodDescriptorProto", "field": [{ "name": "name", "number": 1, "type": 9, "label": 1 }, { "name": "input_type", "number": 2, "type": 9, "label": 1 }, { "name": "output_type", "number": 3, "type": 9, "label": 1 }, { "name": "options", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.MethodOptions" }, { "name": "client_streaming", "number": 5, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "server_streaming", "number": 6, "type": 8, "label": 1, "defaultValue": "false" }] }, { "name": "FileOptions", "field": [{ "name": "java_package", "number": 1, "type": 9, "label": 1 }, { "name": "java_outer_classname", "number": 8, "type": 9, "label": 1 }, { "name": "java_multiple_files", "number": 10, "type": 8, "label": 1, "defaultValue": "false", "options": {} }, { "name": "java_generate_equals_and_hash", "number": 20, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "java_string_check_utf8", "number": 27, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "optimize_for", "number": 9, "type": 14, "label": 1, "typeName": ".google.protobuf.FileOptions.OptimizeMode", "defaultValue": "SPEED" }, { "name": "go_package", "number": 11, "type": 9, "label": 1 }, { "name": "cc_generic_services", "number": 16, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "java_generic_services", "number": 17, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "py_generic_services", "number": 18, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 23, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "cc_enable_arenas", "number": 31, "type": 8, "label": 1, "defaultValue": "true" }, { "name": "objc_class_prefix", "number": 36, "type": 9, "label": 1 }, { "name": "csharp_namespace", "number": 37, "type": 9, "label": 1 }, { "name": "swift_prefix", "number": 39, "type": 9, "label": 1 }, { "name": "php_class_prefix", "number": 40, "type": 9, "label": 1 }, { "name": "php_namespace", "number": 41, "type": 9, "label": 1 }, { "name": "php_metadata_namespace", "number": 44, "type": 9, "label": 1 }, { "name": "ruby_package", "number": 45, "type": 9, "label": 1 }, { "name": "features", "number": 50, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "enumType": [{ "name": "OptimizeMode", "value": [{ "name": "SPEED", "number": 1 }, { "name": "CODE_SIZE", "number": 2 }, { "name": "LITE_RUNTIME", "number": 3 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "MessageOptions", "field": [{ "name": "message_set_wire_format", "number": 1, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "no_standard_descriptor_accessor", "number": 2, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "map_entry", "number": 7, "type": 8, "label": 1 }, { "name": "deprecated_legacy_json_field_conflicts", "number": 11, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "features", "number": 12, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "FieldOptions", "field": [{ "name": "ctype", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.CType", "defaultValue": "STRING" }, { "name": "packed", "number": 2, "type": 8, "label": 1 }, { "name": "jstype", "number": 6, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.JSType", "defaultValue": "JS_NORMAL" }, { "name": "lazy", "number": 5, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "unverified_lazy", "number": 15, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "weak", "number": 10, "type": 8, "label": 1, "defaultValue": "false", "options": { "deprecated": true } }, { "name": "debug_redact", "number": 16, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "retention", "number": 17, "type": 14, "label": 1, "typeName": ".google.protobuf.FieldOptions.OptionRetention" }, { "name": "targets", "number": 19, "type": 14, "label": 3, "typeName": ".google.protobuf.FieldOptions.OptionTargetType" }, { "name": "edition_defaults", "number": 20, "type": 11, "label": 3, "typeName": ".google.protobuf.FieldOptions.EditionDefault" }, { "name": "features", "number": 21, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "feature_support", "number": 22, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions.FeatureSupport" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "nestedType": [{ "name": "EditionDefault", "field": [{ "name": "edition", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "value", "number": 2, "type": 9, "label": 1 }] }, { "name": "FeatureSupport", "field": [{ "name": "edition_introduced", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "edition_deprecated", "number": 2, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "deprecation_warning", "number": 3, "type": 9, "label": 1 }, { "name": "edition_removed", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "removal_error", "number": 5, "type": 9, "label": 1 }] }], "enumType": [{ "name": "CType", "value": [{ "name": "STRING", "number": 0 }, { "name": "CORD", "number": 1 }, { "name": "STRING_PIECE", "number": 2 }] }, { "name": "JSType", "value": [{ "name": "JS_NORMAL", "number": 0 }, { "name": "JS_STRING", "number": 1 }, { "name": "JS_NUMBER", "number": 2 }] }, { "name": "OptionRetention", "value": [{ "name": "RETENTION_UNKNOWN", "number": 0 }, { "name": "RETENTION_RUNTIME", "number": 1 }, { "name": "RETENTION_SOURCE", "number": 2 }] }, { "name": "OptionTargetType", "value": [{ "name": "TARGET_TYPE_UNKNOWN", "number": 0 }, { "name": "TARGET_TYPE_FILE", "number": 1 }, { "name": "TARGET_TYPE_EXTENSION_RANGE", "number": 2 }, { "name": "TARGET_TYPE_MESSAGE", "number": 3 }, { "name": "TARGET_TYPE_FIELD", "number": 4 }, { "name": "TARGET_TYPE_ONEOF", "number": 5 }, { "name": "TARGET_TYPE_ENUM", "number": 6 }, { "name": "TARGET_TYPE_ENUM_ENTRY", "number": 7 }, { "name": "TARGET_TYPE_SERVICE", "number": 8 }, { "name": "TARGET_TYPE_METHOD", "number": 9 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "OneofOptions", "field": [{ "name": "features", "number": 1, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "EnumOptions", "field": [{ "name": "allow_alias", "number": 2, "type": 8, "label": 1 }, { "name": "deprecated", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "deprecated_legacy_json_field_conflicts", "number": 6, "type": 8, "label": 1, "options": { "deprecated": true } }, { "name": "features", "number": 7, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "EnumValueOptions", "field": [{ "name": "deprecated", "number": 1, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "features", "number": 2, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "debug_redact", "number": 3, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "feature_support", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.FieldOptions.FeatureSupport" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "ServiceOptions", "field": [{ "name": "features", "number": 34, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "deprecated", "number": 33, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "MethodOptions", "field": [{ "name": "deprecated", "number": 33, "type": 8, "label": 1, "defaultValue": "false" }, { "name": "idempotency_level", "number": 34, "type": 14, "label": 1, "typeName": ".google.protobuf.MethodOptions.IdempotencyLevel", "defaultValue": "IDEMPOTENCY_UNKNOWN" }, { "name": "features", "number": 35, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "uninterpreted_option", "number": 999, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption" }], "enumType": [{ "name": "IdempotencyLevel", "value": [{ "name": "IDEMPOTENCY_UNKNOWN", "number": 0 }, { "name": "NO_SIDE_EFFECTS", "number": 1 }, { "name": "IDEMPOTENT", "number": 2 }] }], "extensionRange": [{ "start": 1e3, "end": 536870912 }] }, { "name": "UninterpretedOption", "field": [{ "name": "name", "number": 2, "type": 11, "label": 3, "typeName": ".google.protobuf.UninterpretedOption.NamePart" }, { "name": "identifier_value", "number": 3, "type": 9, "label": 1 }, { "name": "positive_int_value", "number": 4, "type": 4, "label": 1 }, { "name": "negative_int_value", "number": 5, "type": 3, "label": 1 }, { "name": "double_value", "number": 6, "type": 1, "label": 1 }, { "name": "string_value", "number": 7, "type": 12, "label": 1 }, { "name": "aggregate_value", "number": 8, "type": 9, "label": 1 }], "nestedType": [{ "name": "NamePart", "field": [{ "name": "name_part", "number": 1, "type": 9, "label": 2 }, { "name": "is_extension", "number": 2, "type": 8, "label": 2 }] }] }, { "name": "FeatureSet", "field": [{ "name": "field_presence", "number": 1, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.FieldPresence", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "EXPLICIT", "edition": 900 }, { "value": "IMPLICIT", "edition": 999 }, { "value": "EXPLICIT", "edition": 1e3 }] } }, { "name": "enum_type", "number": 2, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.EnumType", "options": { "retention": 1, "targets": [6, 1], "editionDefaults": [{ "value": "CLOSED", "edition": 900 }, { "value": "OPEN", "edition": 999 }] } }, { "name": "repeated_field_encoding", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.RepeatedFieldEncoding", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "EXPANDED", "edition": 900 }, { "value": "PACKED", "edition": 999 }] } }, { "name": "utf8_validation", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.Utf8Validation", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "NONE", "edition": 900 }, { "value": "VERIFY", "edition": 999 }] } }, { "name": "message_encoding", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.MessageEncoding", "options": { "retention": 1, "targets": [4, 1], "editionDefaults": [{ "value": "LENGTH_PREFIXED", "edition": 900 }] } }, { "name": "json_format", "number": 6, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.JsonFormat", "options": { "retention": 1, "targets": [3, 6, 1], "editionDefaults": [{ "value": "LEGACY_BEST_EFFORT", "edition": 900 }, { "value": "ALLOW", "edition": 999 }] } }, { "name": "enforce_naming_style", "number": 7, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.EnforceNamingStyle", "options": { "retention": 2, "targets": [1, 2, 3, 4, 5, 6, 7, 8, 9], "editionDefaults": [{ "value": "STYLE_LEGACY", "edition": 900 }, { "value": "STYLE2024", "edition": 1001 }] } }, { "name": "default_symbol_visibility", "number": 8, "type": 14, "label": 1, "typeName": ".google.protobuf.FeatureSet.VisibilityFeature.DefaultSymbolVisibility", "options": { "retention": 2, "targets": [1], "editionDefaults": [{ "value": "EXPORT_ALL", "edition": 900 }, { "value": "EXPORT_TOP_LEVEL", "edition": 1001 }] } }], "nestedType": [{ "name": "VisibilityFeature", "enumType": [{ "name": "DefaultSymbolVisibility", "value": [{ "name": "DEFAULT_SYMBOL_VISIBILITY_UNKNOWN", "number": 0 }, { "name": "EXPORT_ALL", "number": 1 }, { "name": "EXPORT_TOP_LEVEL", "number": 2 }, { "name": "LOCAL_ALL", "number": 3 }, { "name": "STRICT", "number": 4 }] }] }], "enumType": [{ "name": "FieldPresence", "value": [{ "name": "FIELD_PRESENCE_UNKNOWN", "number": 0 }, { "name": "EXPLICIT", "number": 1 }, { "name": "IMPLICIT", "number": 2 }, { "name": "LEGACY_REQUIRED", "number": 3 }] }, { "name": "EnumType", "value": [{ "name": "ENUM_TYPE_UNKNOWN", "number": 0 }, { "name": "OPEN", "number": 1 }, { "name": "CLOSED", "number": 2 }] }, { "name": "RepeatedFieldEncoding", "value": [{ "name": "REPEATED_FIELD_ENCODING_UNKNOWN", "number": 0 }, { "name": "PACKED", "number": 1 }, { "name": "EXPANDED", "number": 2 }] }, { "name": "Utf8Validation", "value": [{ "name": "UTF8_VALIDATION_UNKNOWN", "number": 0 }, { "name": "VERIFY", "number": 2 }, { "name": "NONE", "number": 3 }] }, { "name": "MessageEncoding", "value": [{ "name": "MESSAGE_ENCODING_UNKNOWN", "number": 0 }, { "name": "LENGTH_PREFIXED", "number": 1 }, { "name": "DELIMITED", "number": 2 }] }, { "name": "JsonFormat", "value": [{ "name": "JSON_FORMAT_UNKNOWN", "number": 0 }, { "name": "ALLOW", "number": 1 }, { "name": "LEGACY_BEST_EFFORT", "number": 2 }] }, { "name": "EnforceNamingStyle", "value": [{ "name": "ENFORCE_NAMING_STYLE_UNKNOWN", "number": 0 }, { "name": "STYLE2024", "number": 1 }, { "name": "STYLE_LEGACY", "number": 2 }] }], "extensionRange": [{ "start": 1e3, "end": 9995 }, { "start": 9995, "end": 1e4 }, { "start": 1e4, "end": 10001 }] }, { "name": "FeatureSetDefaults", "field": [{ "name": "defaults", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.FeatureSetDefaults.FeatureSetEditionDefault" }, { "name": "minimum_edition", "number": 4, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "maximum_edition", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }], "nestedType": [{ "name": "FeatureSetEditionDefault", "field": [{ "name": "edition", "number": 3, "type": 14, "label": 1, "typeName": ".google.protobuf.Edition" }, { "name": "overridable_features", "number": 4, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }, { "name": "fixed_features", "number": 5, "type": 11, "label": 1, "typeName": ".google.protobuf.FeatureSet" }] }] }, { "name": "SourceCodeInfo", "field": [{ "name": "location", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.SourceCodeInfo.Location" }], "nestedType": [{ "name": "Location", "field": [{ "name": "path", "number": 1, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "span", "number": 2, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "leading_comments", "number": 3, "type": 9, "label": 1 }, { "name": "trailing_comments", "number": 4, "type": 9, "label": 1 }, { "name": "leading_detached_comments", "number": 6, "type": 9, "label": 3 }] }], "extensionRange": [{ "start": 536e6, "end": 536000001 }] }, { "name": "GeneratedCodeInfo", "field": [{ "name": "annotation", "number": 1, "type": 11, "label": 3, "typeName": ".google.protobuf.GeneratedCodeInfo.Annotation" }], "nestedType": [{ "name": "Annotation", "field": [{ "name": "path", "number": 1, "type": 5, "label": 3, "options": { "packed": true } }, { "name": "source_file", "number": 2, "type": 9, "label": 1 }, { "name": "begin", "number": 3, "type": 5, "label": 1 }, { "name": "end", "number": 4, "type": 5, "label": 1 }, { "name": "semantic", "number": 5, "type": 14, "label": 1, "typeName": ".google.protobuf.GeneratedCodeInfo.Annotation.Semantic" }], "enumType": [{ "name": "Semantic", "value": [{ "name": "NONE", "number": 0 }, { "name": "SET", "number": 1 }, { "name": "ALIAS", "number": 2 }] }] }] }], "enumType": [{ "name": "Edition", "value": [{ "name": "EDITION_UNKNOWN", "number": 0 }, { "name": "EDITION_LEGACY", "number": 900 }, { "name": "EDITION_PROTO2", "number": 998 }, { "name": "EDITION_PROTO3", "number": 999 }, { "name": "EDITION_2023", "number": 1e3 }, { "name": "EDITION_2024", "number": 1001 }, { "name": "EDITION_UNSTABLE", "number": 9999 }, { "name": "EDITION_1_TEST_ONLY", "number": 1 }, { "name": "EDITION_2_TEST_ONLY", "number": 2 }, { "name": "EDITION_99997_TEST_ONLY", "number": 99997 }, { "name": "EDITION_99998_TEST_ONLY", "number": 99998 }, { "name": "EDITION_99999_TEST_ONLY", "number": 99999 }, { "name": "EDITION_MAX", "number": 2147483647 }] }, { "name": "SymbolVisibility", "value": [{ "name": "VISIBILITY_UNSET", "number": 0 }, { "name": "VISIBILITY_LOCAL", "number": 1 }, { "name": "VISIBILITY_EXPORT", "number": 2 }] }] });
var FileDescriptorProtoSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_descriptor, 1);
var DescriptorProtoSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_descriptor, 2);
var ExtensionRangeOptions_VerificationState;
(function(ExtensionRangeOptions_VerificationState2) {
  ExtensionRangeOptions_VerificationState2[ExtensionRangeOptions_VerificationState2["DECLARATION"] = 0] = "DECLARATION";
  ExtensionRangeOptions_VerificationState2[ExtensionRangeOptions_VerificationState2["UNVERIFIED"] = 1] = "UNVERIFIED";
})(ExtensionRangeOptions_VerificationState || (ExtensionRangeOptions_VerificationState = {}));
var FieldDescriptorProtoSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_descriptor, 4);
var FieldDescriptorProto_Type;
(function(FieldDescriptorProto_Type2) {
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["DOUBLE"] = 1] = "DOUBLE";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FLOAT"] = 2] = "FLOAT";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["INT64"] = 3] = "INT64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["UINT64"] = 4] = "UINT64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["INT32"] = 5] = "INT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FIXED64"] = 6] = "FIXED64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["FIXED32"] = 7] = "FIXED32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["BOOL"] = 8] = "BOOL";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["STRING"] = 9] = "STRING";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["GROUP"] = 10] = "GROUP";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["MESSAGE"] = 11] = "MESSAGE";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["BYTES"] = 12] = "BYTES";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["UINT32"] = 13] = "UINT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["ENUM"] = 14] = "ENUM";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SFIXED32"] = 15] = "SFIXED32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SFIXED64"] = 16] = "SFIXED64";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SINT32"] = 17] = "SINT32";
  FieldDescriptorProto_Type2[FieldDescriptorProto_Type2["SINT64"] = 18] = "SINT64";
})(FieldDescriptorProto_Type || (FieldDescriptorProto_Type = {}));
var FieldDescriptorProto_Label;
(function(FieldDescriptorProto_Label2) {
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["OPTIONAL"] = 1] = "OPTIONAL";
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["REPEATED"] = 3] = "REPEATED";
  FieldDescriptorProto_Label2[FieldDescriptorProto_Label2["REQUIRED"] = 2] = "REQUIRED";
})(FieldDescriptorProto_Label || (FieldDescriptorProto_Label = {}));
var OneofDescriptorProtoSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_descriptor, 5);
var FileOptions_OptimizeMode;
(function(FileOptions_OptimizeMode2) {
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["SPEED"] = 1] = "SPEED";
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["CODE_SIZE"] = 2] = "CODE_SIZE";
  FileOptions_OptimizeMode2[FileOptions_OptimizeMode2["LITE_RUNTIME"] = 3] = "LITE_RUNTIME";
})(FileOptions_OptimizeMode || (FileOptions_OptimizeMode = {}));
var FieldOptions_CType;
(function(FieldOptions_CType2) {
  FieldOptions_CType2[FieldOptions_CType2["STRING"] = 0] = "STRING";
  FieldOptions_CType2[FieldOptions_CType2["CORD"] = 1] = "CORD";
  FieldOptions_CType2[FieldOptions_CType2["STRING_PIECE"] = 2] = "STRING_PIECE";
})(FieldOptions_CType || (FieldOptions_CType = {}));
var FieldOptions_JSType;
(function(FieldOptions_JSType2) {
  FieldOptions_JSType2[FieldOptions_JSType2["JS_NORMAL"] = 0] = "JS_NORMAL";
  FieldOptions_JSType2[FieldOptions_JSType2["JS_STRING"] = 1] = "JS_STRING";
  FieldOptions_JSType2[FieldOptions_JSType2["JS_NUMBER"] = 2] = "JS_NUMBER";
})(FieldOptions_JSType || (FieldOptions_JSType = {}));
var FieldOptions_OptionRetention;
(function(FieldOptions_OptionRetention2) {
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_UNKNOWN"] = 0] = "RETENTION_UNKNOWN";
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_RUNTIME"] = 1] = "RETENTION_RUNTIME";
  FieldOptions_OptionRetention2[FieldOptions_OptionRetention2["RETENTION_SOURCE"] = 2] = "RETENTION_SOURCE";
})(FieldOptions_OptionRetention || (FieldOptions_OptionRetention = {}));
var FieldOptions_OptionTargetType;
(function(FieldOptions_OptionTargetType2) {
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_UNKNOWN"] = 0] = "TARGET_TYPE_UNKNOWN";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_FILE"] = 1] = "TARGET_TYPE_FILE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_EXTENSION_RANGE"] = 2] = "TARGET_TYPE_EXTENSION_RANGE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_MESSAGE"] = 3] = "TARGET_TYPE_MESSAGE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_FIELD"] = 4] = "TARGET_TYPE_FIELD";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ONEOF"] = 5] = "TARGET_TYPE_ONEOF";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ENUM"] = 6] = "TARGET_TYPE_ENUM";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_ENUM_ENTRY"] = 7] = "TARGET_TYPE_ENUM_ENTRY";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_SERVICE"] = 8] = "TARGET_TYPE_SERVICE";
  FieldOptions_OptionTargetType2[FieldOptions_OptionTargetType2["TARGET_TYPE_METHOD"] = 9] = "TARGET_TYPE_METHOD";
})(FieldOptions_OptionTargetType || (FieldOptions_OptionTargetType = {}));
var MethodOptions_IdempotencyLevel;
(function(MethodOptions_IdempotencyLevel2) {
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["IDEMPOTENCY_UNKNOWN"] = 0] = "IDEMPOTENCY_UNKNOWN";
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["NO_SIDE_EFFECTS"] = 1] = "NO_SIDE_EFFECTS";
  MethodOptions_IdempotencyLevel2[MethodOptions_IdempotencyLevel2["IDEMPOTENT"] = 2] = "IDEMPOTENT";
})(MethodOptions_IdempotencyLevel || (MethodOptions_IdempotencyLevel = {}));
var FeatureSet_VisibilityFeature_DefaultSymbolVisibility;
(function(FeatureSet_VisibilityFeature_DefaultSymbolVisibility2) {
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility2[FeatureSet_VisibilityFeature_DefaultSymbolVisibility2["DEFAULT_SYMBOL_VISIBILITY_UNKNOWN"] = 0] = "DEFAULT_SYMBOL_VISIBILITY_UNKNOWN";
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility2[FeatureSet_VisibilityFeature_DefaultSymbolVisibility2["EXPORT_ALL"] = 1] = "EXPORT_ALL";
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility2[FeatureSet_VisibilityFeature_DefaultSymbolVisibility2["EXPORT_TOP_LEVEL"] = 2] = "EXPORT_TOP_LEVEL";
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility2[FeatureSet_VisibilityFeature_DefaultSymbolVisibility2["LOCAL_ALL"] = 3] = "LOCAL_ALL";
  FeatureSet_VisibilityFeature_DefaultSymbolVisibility2[FeatureSet_VisibilityFeature_DefaultSymbolVisibility2["STRICT"] = 4] = "STRICT";
})(FeatureSet_VisibilityFeature_DefaultSymbolVisibility || (FeatureSet_VisibilityFeature_DefaultSymbolVisibility = {}));
var FeatureSet_FieldPresence;
(function(FeatureSet_FieldPresence2) {
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["FIELD_PRESENCE_UNKNOWN"] = 0] = "FIELD_PRESENCE_UNKNOWN";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["EXPLICIT"] = 1] = "EXPLICIT";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["IMPLICIT"] = 2] = "IMPLICIT";
  FeatureSet_FieldPresence2[FeatureSet_FieldPresence2["LEGACY_REQUIRED"] = 3] = "LEGACY_REQUIRED";
})(FeatureSet_FieldPresence || (FeatureSet_FieldPresence = {}));
var FeatureSet_EnumType;
(function(FeatureSet_EnumType2) {
  FeatureSet_EnumType2[FeatureSet_EnumType2["ENUM_TYPE_UNKNOWN"] = 0] = "ENUM_TYPE_UNKNOWN";
  FeatureSet_EnumType2[FeatureSet_EnumType2["OPEN"] = 1] = "OPEN";
  FeatureSet_EnumType2[FeatureSet_EnumType2["CLOSED"] = 2] = "CLOSED";
})(FeatureSet_EnumType || (FeatureSet_EnumType = {}));
var FeatureSet_RepeatedFieldEncoding;
(function(FeatureSet_RepeatedFieldEncoding2) {
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["REPEATED_FIELD_ENCODING_UNKNOWN"] = 0] = "REPEATED_FIELD_ENCODING_UNKNOWN";
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["PACKED"] = 1] = "PACKED";
  FeatureSet_RepeatedFieldEncoding2[FeatureSet_RepeatedFieldEncoding2["EXPANDED"] = 2] = "EXPANDED";
})(FeatureSet_RepeatedFieldEncoding || (FeatureSet_RepeatedFieldEncoding = {}));
var FeatureSet_Utf8Validation;
(function(FeatureSet_Utf8Validation2) {
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["UTF8_VALIDATION_UNKNOWN"] = 0] = "UTF8_VALIDATION_UNKNOWN";
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["VERIFY"] = 2] = "VERIFY";
  FeatureSet_Utf8Validation2[FeatureSet_Utf8Validation2["NONE"] = 3] = "NONE";
})(FeatureSet_Utf8Validation || (FeatureSet_Utf8Validation = {}));
var FeatureSet_MessageEncoding;
(function(FeatureSet_MessageEncoding2) {
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["MESSAGE_ENCODING_UNKNOWN"] = 0] = "MESSAGE_ENCODING_UNKNOWN";
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["LENGTH_PREFIXED"] = 1] = "LENGTH_PREFIXED";
  FeatureSet_MessageEncoding2[FeatureSet_MessageEncoding2["DELIMITED"] = 2] = "DELIMITED";
})(FeatureSet_MessageEncoding || (FeatureSet_MessageEncoding = {}));
var FeatureSet_JsonFormat;
(function(FeatureSet_JsonFormat2) {
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["JSON_FORMAT_UNKNOWN"] = 0] = "JSON_FORMAT_UNKNOWN";
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["ALLOW"] = 1] = "ALLOW";
  FeatureSet_JsonFormat2[FeatureSet_JsonFormat2["LEGACY_BEST_EFFORT"] = 2] = "LEGACY_BEST_EFFORT";
})(FeatureSet_JsonFormat || (FeatureSet_JsonFormat = {}));
var FeatureSet_EnforceNamingStyle;
(function(FeatureSet_EnforceNamingStyle2) {
  FeatureSet_EnforceNamingStyle2[FeatureSet_EnforceNamingStyle2["ENFORCE_NAMING_STYLE_UNKNOWN"] = 0] = "ENFORCE_NAMING_STYLE_UNKNOWN";
  FeatureSet_EnforceNamingStyle2[FeatureSet_EnforceNamingStyle2["STYLE2024"] = 1] = "STYLE2024";
  FeatureSet_EnforceNamingStyle2[FeatureSet_EnforceNamingStyle2["STYLE_LEGACY"] = 2] = "STYLE_LEGACY";
})(FeatureSet_EnforceNamingStyle || (FeatureSet_EnforceNamingStyle = {}));
var GeneratedCodeInfo_Annotation_Semantic;
(function(GeneratedCodeInfo_Annotation_Semantic2) {
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["NONE"] = 0] = "NONE";
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["SET"] = 1] = "SET";
  GeneratedCodeInfo_Annotation_Semantic2[GeneratedCodeInfo_Annotation_Semantic2["ALIAS"] = 2] = "ALIAS";
})(GeneratedCodeInfo_Annotation_Semantic || (GeneratedCodeInfo_Annotation_Semantic = {}));
var Edition;
(function(Edition2) {
  Edition2[Edition2["EDITION_UNKNOWN"] = 0] = "EDITION_UNKNOWN";
  Edition2[Edition2["EDITION_LEGACY"] = 900] = "EDITION_LEGACY";
  Edition2[Edition2["EDITION_PROTO2"] = 998] = "EDITION_PROTO2";
  Edition2[Edition2["EDITION_PROTO3"] = 999] = "EDITION_PROTO3";
  Edition2[Edition2["EDITION_2023"] = 1e3] = "EDITION_2023";
  Edition2[Edition2["EDITION_2024"] = 1001] = "EDITION_2024";
  Edition2[Edition2["EDITION_UNSTABLE"] = 9999] = "EDITION_UNSTABLE";
  Edition2[Edition2["EDITION_1_TEST_ONLY"] = 1] = "EDITION_1_TEST_ONLY";
  Edition2[Edition2["EDITION_2_TEST_ONLY"] = 2] = "EDITION_2_TEST_ONLY";
  Edition2[Edition2["EDITION_99997_TEST_ONLY"] = 99997] = "EDITION_99997_TEST_ONLY";
  Edition2[Edition2["EDITION_99998_TEST_ONLY"] = 99998] = "EDITION_99998_TEST_ONLY";
  Edition2[Edition2["EDITION_99999_TEST_ONLY"] = 99999] = "EDITION_99999_TEST_ONLY";
  Edition2[Edition2["EDITION_MAX"] = 2147483647] = "EDITION_MAX";
})(Edition || (Edition = {}));
var SymbolVisibility;
(function(SymbolVisibility2) {
  SymbolVisibility2[SymbolVisibility2["VISIBILITY_UNSET"] = 0] = "VISIBILITY_UNSET";
  SymbolVisibility2[SymbolVisibility2["VISIBILITY_LOCAL"] = 1] = "VISIBILITY_LOCAL";
  SymbolVisibility2[SymbolVisibility2["VISIBILITY_EXPORT"] = 2] = "VISIBILITY_EXPORT";
})(SymbolVisibility || (SymbolVisibility = {}));

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/from-binary.js
function makeReadContext(options) {
  return Object.assign(Object.assign({ readUnknownFields: true, recursionLimit: 100 }, options), { depth: 0 });
}
function fromBinary(schema, bytes2, options) {
  const message2 = create(schema);
  compiledReader(schema).read(message2, new BinaryReader(bytes2), makeReadContext(options), bytes2.byteLength);
  return message2;
}
var compiledReaders = /* @__PURE__ */ new WeakMap();
function compiledReader(desc) {
  let compiled = compiledReaders.get(desc);
  if (compiled === void 0) {
    compiled = compileMessage(desc);
  }
  return compiled;
}
function compileMessage(desc) {
  const descString = String(desc);
  const fieldReaders = /* @__PURE__ */ new Map();
  const compiled = {
    read: compileMessageReader(descString, fieldReaders),
    readGroup: compileGroupReader(descString, fieldReaders)
  };
  compiledReaders.set(desc, compiled);
  for (const field4 of desc.fields) {
    fieldReaders.set(field4.number, compileFieldReader(field4));
  }
  return compiled;
}
function compileMessageReader(descString, fieldReaders) {
  return (message2, reader, ctx, length) => {
    var _a;
    if (++ctx.depth > ctx.recursionLimit) {
      throw new Error(`cannot decode ${descString} from binary: maximum recursion depth of ${ctx.recursionLimit} reached`);
    }
    const end = reader.pos + length;
    const unknownFields = (_a = message2.$unknown) !== null && _a !== void 0 ? _a : [];
    while (reader.pos < end) {
      const [fieldNo, wireType] = reader.tag();
      const fieldReader = fieldReaders.get(fieldNo);
      if (fieldReader === void 0) {
        const data = reader.skip(wireType, fieldNo, ctx.recursionLimit - ctx.depth);
        if (ctx.readUnknownFields) {
          unknownFields.push({ no: fieldNo, wireType, data });
        }
        continue;
      }
      fieldReader(message2, reader, ctx, wireType);
    }
    if (unknownFields.length > 0) {
      message2.$unknown = unknownFields;
    }
    ctx.depth--;
  };
}
function compileGroupReader(descString, fieldReaders) {
  return (message2, reader, ctx, fieldNo) => {
    var _a;
    if (++ctx.depth > ctx.recursionLimit) {
      throw new Error(`cannot decode ${descString} from binary: maximum recursion depth of ${ctx.recursionLimit} reached`);
    }
    let recordFieldNo;
    let wireType;
    const unknownFields = (_a = message2.$unknown) !== null && _a !== void 0 ? _a : [];
    while (reader.pos < reader.len) {
      [recordFieldNo, wireType] = reader.tag();
      if (wireType == WireType.EndGroup) {
        break;
      }
      const fieldReader = fieldReaders.get(recordFieldNo);
      if (fieldReader === void 0) {
        const data = reader.skip(wireType, recordFieldNo, ctx.recursionLimit - ctx.depth);
        if (ctx.readUnknownFields) {
          unknownFields.push({ no: recordFieldNo, wireType, data });
        }
        continue;
      }
      fieldReader(message2, reader, ctx, wireType);
    }
    if (wireType != WireType.EndGroup || recordFieldNo !== fieldNo) {
      throw new Error("invalid end group tag");
    }
    if (unknownFields.length > 0) {
      message2.$unknown = unknownFields;
    }
    ctx.depth--;
  };
}
function readField(message2, reader, field4, wireType, ctx) {
  compileFieldReader(field4)(message2[unsafeLocal], reader, ctx, wireType);
}
function compileFieldReader(field4) {
  switch (field4.fieldKind) {
    case "scalar":
      return compileScalarFieldReader(field4);
    case "enum":
      return compileEnumFieldReader(field4);
    case "message":
      return compileMessageFieldReader(field4);
    case "list":
      return compileListFieldReader(field4);
    case "map":
      return compileMapFieldReader(field4);
  }
}
function compileScalarFieldReader(field4) {
  const readScalar = compileScalarReader(field4.scalar, field4.utf8Validation, field4.longAsString);
  const localName = field4.localName;
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (message2, reader) => {
      message2[oneofLocalName] = {
        case: localName,
        value: readScalar(reader)
      };
    };
  }
  return (message2, reader) => {
    message2[localName] = readScalar(reader);
  };
}
function compileEnumFieldReader(field4) {
  var _a;
  const localName = field4.localName;
  const oneofLocalName = (_a = field4.oneof) === null || _a === void 0 ? void 0 : _a.localName;
  if (field4.enum.open) {
    if (oneofLocalName !== void 0) {
      return (message2, reader) => {
        message2[oneofLocalName] = { case: localName, value: reader.int32() };
      };
    }
    return (message2, reader) => {
      message2[localName] = reader.int32();
    };
  }
  const values = field4.enum.values;
  const fieldNo = field4.number;
  return (message2, reader, ctx, wireType) => {
    var _a2;
    const val = reader.int32();
    if (values.some((v) => v.number === val)) {
      if (oneofLocalName !== void 0) {
        message2[oneofLocalName] = { case: localName, value: val };
      } else {
        message2[localName] = val;
      }
    } else if (ctx.readUnknownFields) {
      const bytes2 = [];
      varint32write(val, bytes2);
      const unknownFields = (_a2 = message2.$unknown) !== null && _a2 !== void 0 ? _a2 : [];
      unknownFields.push({
        no: fieldNo,
        wireType,
        data: new Uint8Array(bytes2)
      });
      message2.$unknown = unknownFields;
    }
  };
}
function compileMessageFieldReader(field4) {
  const localName = field4.localName;
  const { toMessage, toLocal } = localMessageMapper(field4);
  const readChild = compileChildReader(field4);
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (message2, reader, ctx) => {
      const oneof = message2[oneofLocalName];
      const child = toMessage(oneof.case === localName ? oneof.value : void 0);
      readChild(child, reader, ctx);
      message2[oneofLocalName] = { case: localName, value: toLocal(child) };
    };
  }
  return (message2, reader, ctx) => {
    const child = toMessage(message2[localName]);
    readChild(child, reader, ctx);
    message2[localName] = toLocal(child);
  };
}
function compileChildReader(field4) {
  const compiledChild = compiledReader(field4.message);
  if (field4.delimitedEncoding) {
    const fieldNo = field4.number;
    return (child, reader, ctx) => compiledChild.readGroup(child, reader, ctx, fieldNo);
  }
  return (child, reader, ctx) => compiledChild.read(child, reader, ctx, reader.uint32());
}
function compileListFieldReader(field4) {
  const localName = field4.localName;
  if (field4.listKind == "message") {
    const { toMessage, toLocal } = localMessageMapper(field4);
    const readChild = compileChildReader(field4);
    return (message2, reader, ctx) => {
      const child = toMessage(void 0);
      readChild(child, reader, ctx);
      message2[localName].push(toLocal(child));
    };
  }
  const scalarType = field4.listKind == "enum" ? ScalarType.INT32 : field4.scalar;
  const longAsString = field4.listKind == "scalar" ? field4.longAsString : false;
  const readScalar = compileScalarReader(scalarType, field4.utf8Validation, longAsString);
  const packedPossible = scalarType != ScalarType.STRING && scalarType != ScalarType.BYTES;
  return (message2, reader, ctx, wireType) => {
    const items = message2[localName];
    if (wireType == WireType.LengthDelimited && packedPossible) {
      const end = reader.uint32() + reader.pos;
      while (reader.pos < end) {
        items.push(readScalar(reader));
      }
    } else {
      items.push(readScalar(reader));
    }
  };
}
function compileMapFieldReader(field4) {
  const localName = field4.localName;
  const readKey = compileScalarReader(field4.mapKey, field4.utf8Validation, false);
  const keyZero = scalarZeroValue(field4.mapKey, false);
  let readValue;
  let valueDefault;
  switch (field4.mapKind) {
    case "scalar": {
      const scalar = field4.scalar;
      const readScalar = compileScalarReader(scalar, field4.utf8Validation, false);
      readValue = (reader) => readScalar(reader);
      if (scalar == ScalarType.BYTES) {
        valueDefault = () => new Uint8Array(0);
      } else {
        const zero2 = scalarZeroValue(scalar, false);
        valueDefault = () => zero2;
      }
      break;
    }
    case "enum": {
      const zero2 = field4.enum.values[0].number;
      readValue = (reader) => reader.int32();
      valueDefault = () => zero2;
      break;
    }
    case "message": {
      const { toMessage, toLocal } = localMessageMapper(field4);
      const readChild = compiledReader(field4.message).read;
      readValue = (reader, ctx) => {
        const child = toMessage(void 0);
        readChild(child, reader, ctx, reader.uint32());
        return toLocal(child);
      };
      valueDefault = () => toLocal(toMessage(void 0));
      break;
    }
  }
  return (message2, reader, ctx) => {
    const record = message2[localName];
    let key;
    let val;
    const len = reader.uint32();
    const end = reader.pos + len;
    while (reader.pos < end) {
      const [fieldNo] = reader.tag();
      switch (fieldNo) {
        case 1:
          key = readKey(reader);
          break;
        case 2:
          val = readValue(reader, ctx);
          break;
      }
    }
    if (key === void 0) {
      key = keyZero;
    }
    if (val === void 0) {
      val = valueDefault();
    }
    record[key] = val;
  };
}
function compileScalarReader(type, utf8Validation, longAsString) {
  switch (type) {
    case ScalarType.STRING:
      return (reader) => reader.string(utf8Validation);
    case ScalarType.BOOL:
      return (reader) => reader.bool();
    case ScalarType.DOUBLE:
      return (reader) => reader.double();
    case ScalarType.FLOAT:
      return (reader) => reader.float();
    case ScalarType.INT32:
      return (reader) => reader.int32();
    case ScalarType.INT64:
      if (longAsString) {
        return (reader) => String(reader.int64());
      }
      return (reader) => reader.int64();
    case ScalarType.UINT64:
      if (longAsString) {
        return (reader) => String(reader.uint64());
      }
      return (reader) => reader.uint64();
    case ScalarType.FIXED64:
      if (longAsString) {
        return (reader) => String(reader.fixed64());
      }
      return (reader) => reader.fixed64();
    case ScalarType.BYTES:
      return (reader) => reader.bytes();
    case ScalarType.FIXED32:
      return (reader) => reader.fixed32();
    case ScalarType.SFIXED32:
      return (reader) => reader.sfixed32();
    case ScalarType.SFIXED64:
      if (longAsString) {
        return (reader) => String(reader.sfixed64());
      }
      return (reader) => reader.sfixed64();
    case ScalarType.SINT64:
      if (longAsString) {
        return (reader) => String(reader.sint64());
      }
      return (reader) => reader.sint64();
    case ScalarType.UINT32:
      return (reader) => reader.uint32();
    case ScalarType.SINT32:
      return (reader) => reader.sint32();
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/codegenv2/file.js
function fileDesc(b64, imports) {
  var _a;
  const root = fromBinary(FileDescriptorProtoSchema, base64Decode(b64));
  root.messageType.forEach(restoreJsonNames);
  root.dependency = (_a = imports === null || imports === void 0 ? void 0 : imports.map((f) => f.proto.name)) !== null && _a !== void 0 ? _a : [];
  const reg = createFileRegistry(root, (protoFileName) => imports === null || imports === void 0 ? void 0 : imports.find((f) => f.proto.name === protoFileName));
  return reg.getFile(root.name);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/gen/google/protobuf/any_pb.js
var file_google_protobuf_any = /* @__PURE__ */ fileDesc("Chlnb29nbGUvcHJvdG9idWYvYW55LnByb3RvEg9nb29nbGUucHJvdG9idWYiJgoDQW55EhAKCHR5cGVfdXJsGAEgASgJEg0KBXZhbHVlGAIgASgMQnYKE2NvbS5nb29nbGUucHJvdG9idWZCCEFueVByb3RvUAFaLGdvb2dsZS5nb2xhbmcub3JnL3Byb3RvYnVmL3R5cGVzL2tub3duL2FueXBiogIDR1BCqgIeR29vZ2xlLlByb3RvYnVmLldlbGxLbm93blR5cGVzYgZwcm90bzM");
var AnySchema = /* @__PURE__ */ messageDesc(file_google_protobuf_any, 0);

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/to-binary.js
var IMPLICIT4 = 2;
var LEGACY_REQUIRED2 = 3;
var writeDefaults = {
  writeUnknownFields: true
};
function makeWriteOptions(options) {
  return options ? Object.assign(Object.assign({}, writeDefaults), options) : writeDefaults;
}
function toBinary(schema, message2, options) {
  const writer = new BinaryWriter();
  compiledWriter(schema)(writer, makeWriteOptions(options), message2);
  return writer.finish();
}
var compiledWriters = /* @__PURE__ */ new WeakMap();
function compiledWriter(desc) {
  let compiled = compiledWriters.get(desc);
  if (compiled === void 0) {
    compiled = compileMessage2(desc);
  }
  return compiled;
}
function compileMessage2(desc) {
  const typeName = desc.typeName;
  const sortedFields = desc.fields.concat().sort((a, b) => a.number - b.number);
  const foreignField = sortedFields[0];
  const fieldWriters = [];
  const compiled = (writer, opts, message2) => {
    if (message2.$typeName !== typeName && foreignField !== void 0) {
      throw new FieldError(foreignField, `cannot use ${foreignField} with message ${message2.$typeName}`, "ForeignFieldError");
    }
    for (let i = 0; i < fieldWriters.length; i++) {
      fieldWriters[i](writer, opts, message2);
    }
    const unknown = message2.$unknown;
    if (unknown !== void 0 && opts.writeUnknownFields) {
      for (let i = 0; i < unknown.length; i++) {
        const { no, wireType, data } = unknown[i];
        writer.tag(no, wireType).raw(data);
      }
    }
  };
  compiledWriters.set(desc, compiled);
  for (const field4 of sortedFields) {
    fieldWriters.push(compileField(field4));
  }
  return compiled;
}
function compileField(field4) {
  switch (field4.fieldKind) {
    case "message":
    case "scalar":
    case "enum":
      return compileSingularField(field4);
    case "list":
      return compileListField(field4);
    case "map":
      return compileMapField(field4);
  }
}
function compileSingularField(field4) {
  const writeValue = compileSingularValue(field4);
  const localName = field4.localName;
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (writer, opts, message2) => {
      const oneof = message2[oneofLocalName];
      if (oneof.case === localName) {
        writeValue(writer, opts, oneof.value);
      }
    };
  }
  if (field4.presence != IMPLICIT4) {
    const requiredError = field4.presence == LEGACY_REQUIRED2 ? `cannot encode ${field4} to binary: required field not set` : void 0;
    return (writer, opts, message2) => {
      const value = message2[localName];
      if (value !== void 0 && Object.prototype.hasOwnProperty.call(message2, localName)) {
        writeValue(writer, opts, value);
      } else if (requiredError !== void 0) {
        throw new Error(requiredError);
      }
    };
  }
  if (field4.fieldKind == "enum") {
    const zero2 = field4.enum.values[0].number;
    return (writer, opts, message2) => {
      const value = message2[localName];
      if (value !== zero2) {
        writeValue(writer, opts, value);
      }
    };
  }
  switch (field4.scalar) {
    case ScalarType.BOOL:
      return (writer, opts, message2) => {
        const value = message2[localName];
        if (value !== false) {
          writeValue(writer, opts, value);
        }
      };
    case ScalarType.STRING:
      return (writer, opts, message2) => {
        const value = message2[localName];
        if (value !== "") {
          writeValue(writer, opts, value);
        }
      };
    case ScalarType.BYTES:
      return (writer, opts, message2) => {
        const value = message2[localName];
        if (!(value instanceof Uint8Array) || value.byteLength > 0) {
          writeValue(writer, opts, value);
        }
      };
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return (writer, opts, message2) => {
        const value = message2[localName];
        if (!Object.is(value, 0)) {
          writeValue(writer, opts, value);
        }
      };
    default:
      return (writer, opts, message2) => {
        const value = message2[localName];
        if (value != 0) {
          writeValue(writer, opts, value);
        }
      };
  }
}
function compileSingularValue(field4) {
  switch (field4.fieldKind) {
    case "message": {
      const { toMessage } = localMessageMapper(field4);
      const writeChild = compileChildWriter(field4);
      return (writer, opts, value) => {
        writeChild(writer, opts, toMessage(value));
      };
    }
    case "scalar":
    case "enum": {
      const scalarType = field4.fieldKind == "enum" ? ScalarType.INT32 : field4.scalar;
      const fieldNo = field4.number;
      const wireType = writeTypeOfScalar(scalarType);
      const writeScalar = compileScalarValue(scalarType, field4.parent.typeName, field4.name);
      return (writer, opts, value) => {
        writer.tag(fieldNo, wireType);
        writeScalar(writer, value);
      };
    }
  }
}
function compileListField(field4) {
  const localName = field4.localName;
  const fieldNo = field4.number;
  switch (field4.listKind) {
    case "message": {
      const { toMessage } = localMessageMapper(field4);
      const writeChild = compileChildWriter(field4);
      return (writer, opts, message2) => {
        const items = message2[localName];
        for (let i = 0; i < items.length; i++) {
          writeChild(writer, opts, toMessage(items[i]));
        }
      };
    }
    case "scalar":
    case "enum": {
      const scalarType = field4.listKind == "enum" ? ScalarType.INT32 : field4.scalar;
      const writeScalar = compileScalarValue(scalarType, field4.parent.typeName, field4.name);
      if (field4.packed) {
        return (writer, opts, message2) => {
          const items = message2[localName];
          if (items.length == 0) {
            return;
          }
          writer.tag(fieldNo, WireType.LengthDelimited).fork();
          for (let i = 0; i < items.length; i++) {
            writeScalar(writer, items[i]);
          }
          writer.join();
        };
      }
      const wireType = writeTypeOfScalar(scalarType);
      return (writer, opts, message2) => {
        const items = message2[localName];
        for (let i = 0; i < items.length; i++) {
          writer.tag(fieldNo, wireType);
          writeScalar(writer, items[i]);
        }
      };
    }
  }
}
function compileMapField(field4) {
  const localName = field4.localName;
  const fieldNo = field4.number;
  const writeKey = compileMapKey(field4);
  if (field4.mapKind == "message") {
    const { toMessage } = localMessageMapper(field4);
    const writeMessage = compiledWriter(field4.message);
    return (writer, opts, message2) => {
      const record = message2[localName];
      const keys = Object.keys(record);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        writer.tag(fieldNo, WireType.LengthDelimited).fork();
        writeKey(writer, key);
        writer.tag(2, WireType.LengthDelimited).fork();
        writeMessage(writer, opts, toMessage(record[key]));
        writer.join();
        writer.join();
      }
    };
  }
  const scalarType = field4.mapKind == "enum" ? ScalarType.INT32 : field4.scalar;
  const valueWireType = writeTypeOfScalar(scalarType);
  const writeScalar = compileScalarValue(scalarType, field4.parent.typeName, field4.name);
  return (writer, opts, message2) => {
    const record = message2[localName];
    const keys = Object.keys(record);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      writer.tag(fieldNo, WireType.LengthDelimited).fork();
      writeKey(writer, key);
      writer.tag(2, valueWireType);
      writeScalar(writer, record[key]);
      writer.join();
    }
  };
}
function compileMapKey(field4) {
  const wireType = writeTypeOfScalar(field4.mapKey);
  const writeScalar = compileScalarValue(field4.mapKey, field4.parent.typeName, field4.name);
  const convertKey = compileMapKeyConverter(field4.mapKey);
  return (writer, key) => {
    writer.tag(1, wireType);
    writeScalar(writer, convertKey(key));
  };
}
function compileMapKeyConverter(type) {
  switch (type) {
    case ScalarType.STRING:
      return (key) => key;
    case ScalarType.BOOL:
      return (key) => key === "true" ? true : key === "false" ? false : key;
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return (key) => {
        try {
          return protoInt64.uParse(key);
        } catch (_a) {
          return key;
        }
      };
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return (key) => {
        try {
          return protoInt64.parse(key);
        } catch (_a) {
          return key;
        }
      };
    default:
      return (key) => {
        const n = Number.parseInt(key);
        return Number.isFinite(n) ? n : key;
      };
  }
}
function compileScalarValue(type, messageName, fieldName) {
  const writeScalar = compileScalarWrite(type);
  return (writer, value) => {
    try {
      writeScalar(writer, value);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`cannot encode field ${messageName}.${fieldName} to binary: ${e.message}`);
      }
      throw e;
    }
  };
}
function compileScalarWrite(type) {
  switch (type) {
    case ScalarType.STRING:
      return (writer, value) => writer.string(value);
    case ScalarType.BOOL:
      return (writer, value) => writer.bool(value);
    case ScalarType.DOUBLE:
      return (writer, value) => writer.double(value);
    case ScalarType.FLOAT:
      return (writer, value) => writer.float(value);
    case ScalarType.INT32:
      return (writer, value) => writer.int32(value);
    case ScalarType.INT64:
      return (writer, value) => writer.int64(value);
    case ScalarType.UINT64:
      return (writer, value) => writer.uint64(value);
    case ScalarType.FIXED64:
      return (writer, value) => writer.fixed64(value);
    case ScalarType.BYTES:
      return (writer, value) => writer.bytes(value);
    case ScalarType.FIXED32:
      return (writer, value) => writer.fixed32(value);
    case ScalarType.SFIXED32:
      return (writer, value) => writer.sfixed32(value);
    case ScalarType.SFIXED64:
      return (writer, value) => writer.sfixed64(value);
    case ScalarType.SINT64:
      return (writer, value) => writer.sint64(value);
    case ScalarType.UINT32:
      return (writer, value) => writer.uint32(value);
    case ScalarType.SINT32:
      return (writer, value) => writer.sint32(value);
  }
}
function writeField(writer, opts, msg, field4) {
  compileField(field4)(writer, opts, msg[unsafeLocal]);
}
function compileChildWriter(field4) {
  const fieldNo = field4.number;
  const writeMessage = compiledWriter(field4.message);
  if (field4.delimitedEncoding) {
    return (writer, opts, child) => {
      writer.tag(fieldNo, WireType.StartGroup);
      writeMessage(writer, opts, child);
      writer.tag(fieldNo, WireType.EndGroup);
    };
  }
  return (writer, opts, child) => {
    writer.tag(fieldNo, WireType.LengthDelimited).fork();
    writeMessage(writer, opts, child);
    writer.join();
  };
}
function writeTypeOfScalar(type) {
  switch (type) {
    case ScalarType.BYTES:
    case ScalarType.STRING:
      return WireType.LengthDelimited;
    case ScalarType.DOUBLE:
    case ScalarType.FIXED64:
    case ScalarType.SFIXED64:
      return WireType.Bit64;
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.FLOAT:
      return WireType.Bit32;
    default:
      return WireType.Varint;
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/any.js
function anyPack(schema, message2, into) {
  let ret = false;
  if (!into) {
    into = create(AnySchema);
    ret = true;
  }
  into.value = toBinary(schema, message2);
  into.typeUrl = typeNameToUrl(message2.$typeName);
  return ret ? into : void 0;
}
function anyIs(any, descOrTypeName) {
  if (any.typeUrl === "") {
    return false;
  }
  const want = typeof descOrTypeName == "string" ? descOrTypeName : descOrTypeName.typeName;
  const got = typeUrlToName(any.typeUrl);
  return want === got;
}
function anyUnpack(any, registryOrMessageDesc) {
  if (any.typeUrl === "") {
    return void 0;
  }
  const desc = registryOrMessageDesc.kind == "message" ? registryOrMessageDesc : registryOrMessageDesc.getMessage(typeUrlToName(any.typeUrl));
  if (!desc || !anyIs(any, desc)) {
    return void 0;
  }
  return fromBinary(desc, any.value);
}
function typeNameToUrl(name) {
  return `type.googleapis.com/${name}`;
}
function typeUrlToName(url) {
  const slash = url.lastIndexOf("/");
  const name = slash >= 0 ? url.substring(slash + 1) : url;
  if (!name.length) {
    throw new Error(`invalid type url: ${url}`);
  }
  return name;
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/gen/google/protobuf/struct_pb.js
var file_google_protobuf_struct = /* @__PURE__ */ fileDesc("Chxnb29nbGUvcHJvdG9idWYvc3RydWN0LnByb3RvEg9nb29nbGUucHJvdG9idWYihAEKBlN0cnVjdBIzCgZmaWVsZHMYASADKAsyIy5nb29nbGUucHJvdG9idWYuU3RydWN0LkZpZWxkc0VudHJ5GkUKC0ZpZWxkc0VudHJ5EgsKA2tleRgBIAEoCRIlCgV2YWx1ZRgCIAEoCzIWLmdvb2dsZS5wcm90b2J1Zi5WYWx1ZToCOAEi6gEKBVZhbHVlEjAKCm51bGxfdmFsdWUYASABKA4yGi5nb29nbGUucHJvdG9idWYuTnVsbFZhbHVlSAASFgoMbnVtYmVyX3ZhbHVlGAIgASgBSAASFgoMc3RyaW5nX3ZhbHVlGAMgASgJSAASFAoKYm9vbF92YWx1ZRgEIAEoCEgAEi8KDHN0cnVjdF92YWx1ZRgFIAEoCzIXLmdvb2dsZS5wcm90b2J1Zi5TdHJ1Y3RIABIwCgpsaXN0X3ZhbHVlGAYgASgLMhouZ29vZ2xlLnByb3RvYnVmLkxpc3RWYWx1ZUgAQgYKBGtpbmQiMwoJTGlzdFZhbHVlEiYKBnZhbHVlcxgBIAMoCzIWLmdvb2dsZS5wcm90b2J1Zi5WYWx1ZSobCglOdWxsVmFsdWUSDgoKTlVMTF9WQUxVRRAAQn8KE2NvbS5nb29nbGUucHJvdG9idWZCC1N0cnVjdFByb3RvUAFaL2dvb2dsZS5nb2xhbmcub3JnL3Byb3RvYnVmL3R5cGVzL2tub3duL3N0cnVjdHBi+AEBogIDR1BCqgIeR29vZ2xlLlByb3RvYnVmLldlbGxLbm93blR5cGVzYgZwcm90bzM");
var StructSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_struct, 0);
var ValueSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_struct, 1);
var ListValueSchema = /* @__PURE__ */ messageDesc(file_google_protobuf_struct, 2);
var NullValue;
(function(NullValue2) {
  NullValue2[NullValue2["NULL_VALUE"] = 0] = "NULL_VALUE";
})(NullValue || (NullValue = {}));

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/extensions.js
function getExtension(message2, extension, options) {
  assertExtendee(extension, message2);
  const ufs = filterUnknownFields(message2.$unknown, extension);
  const [container, field4, get] = createExtensionContainer(extension);
  const ctx = makeReadContext(options);
  for (const uf of ufs) {
    readField(container, new BinaryReader(uf.data), field4, uf.wireType, ctx);
  }
  return get();
}
function setExtension(message2, extension, value) {
  var _a;
  assertExtendee(extension, message2);
  const ufs = ((_a = message2.$unknown) !== null && _a !== void 0 ? _a : []).filter((uf) => uf.no !== extension.number);
  const [container, field4] = createExtensionContainer(extension, value);
  const writer = new BinaryWriter();
  writeField(writer, { writeUnknownFields: true }, container, field4);
  const reader = new BinaryReader(writer.finish());
  while (reader.pos < reader.len) {
    const [no, wireType] = reader.tag();
    const data = reader.skip(wireType, no);
    ufs.push({ no, wireType, data });
  }
  message2.$unknown = ufs;
}
function filterUnknownFields(unknownFields, extension) {
  if (unknownFields === void 0)
    return [];
  if (extension.fieldKind === "enum" || extension.fieldKind === "scalar") {
    for (let i = unknownFields.length - 1; i >= 0; --i) {
      if (unknownFields[i].no == extension.number) {
        return [unknownFields[i]];
      }
    }
    return [];
  }
  return unknownFields.filter((uf) => uf.no === extension.number);
}
function createExtensionContainer(extension, value) {
  const localName = extension.typeName;
  const field4 = Object.assign(Object.assign({}, extension), { kind: "field", parent: extension.extendee, localName });
  const desc = Object.assign(Object.assign({}, extension.extendee), { fields: [field4], members: [field4], oneofs: [] });
  const container = create(desc, value !== void 0 ? { [localName]: value } : void 0);
  return [
    reflect(desc, container),
    field4,
    () => {
      const value2 = container[localName];
      if (value2 === void 0) {
        const desc2 = extension.message;
        if (isWrapperDesc(desc2)) {
          return scalarZeroValue(desc2.fields[0].scalar, desc2.fields[0].longAsString);
        }
        return create(desc2);
      }
      return value2;
    }
  ];
}
function assertExtendee(extension, message2) {
  if (extension.extendee.typeName != message2.$typeName) {
    throw new Error(`extension ${extension.typeName} can only be applied to message ${extension.extendee.typeName}`);
  }
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/wkt/json.js
var timestampMsMin = /* @__PURE__ */ Date.parse("0001-01-01T00:00:00Z");
var timestampMsMax = /* @__PURE__ */ Date.parse("9999-12-31T23:59:59Z");
var durationSecondsMin = -315576e6;
var durationSecondsMax = 315576e6;

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/to-json.js
var LEGACY_REQUIRED3 = 3;
var IMPLICIT5 = 2;
var jsonWriteDefaults = {
  alwaysEmitImplicit: false,
  enumAsInteger: false,
  useProtoFieldName: false
};
function makeWriteOptions2(options) {
  return options ? Object.assign(Object.assign({}, jsonWriteDefaults), options) : jsonWriteDefaults;
}
function toJson(schema, message2, options) {
  return compiledWriter2(schema)(makeWriteOptions2(options), message2);
}
var compiledWriters2 = /* @__PURE__ */ new WeakMap();
function compiledWriter2(desc) {
  let compiled = compiledWriters2.get(desc);
  if (compiled === void 0) {
    compiled = compileMessage3(desc);
  }
  return compiled;
}
function compileMessage3(desc) {
  const typeName = desc.typeName;
  const writeWkt = compileWkt(desc);
  if (writeWkt !== void 0) {
    const foreignField2 = desc.fields[0];
    const compiledWriter4 = (opts, message2) => {
      if (message2.$typeName !== typeName && foreignField2 !== void 0) {
        throw new FieldError(foreignField2, `cannot use ${foreignField2} with message ${message2.$typeName}`, "ForeignFieldError");
      }
      return writeWkt(opts, message2);
    };
    compiledWriters2.set(desc, compiledWriter4);
    return compiledWriter4;
  }
  const sortedFields = desc.fields.concat().sort((a, b) => a.number - b.number);
  const foreignField = sortedFields[0];
  const fieldWriters = [];
  const compiledWriter3 = (opts, message2) => {
    if (message2.$typeName !== typeName && foreignField !== void 0) {
      throw new FieldError(foreignField, `cannot use ${foreignField} with message ${message2.$typeName}`, "ForeignFieldError");
    }
    const json = {};
    for (let i = 0; i < fieldWriters.length; i++) {
      fieldWriters[i](opts, message2, json);
    }
    if (opts.registry) {
      writeExtensions(json, opts, opts.registry, message2, desc);
    }
    return json;
  };
  compiledWriters2.set(desc, compiledWriter3);
  for (const field4 of sortedFields) {
    fieldWriters.push(compileField2(field4));
  }
  return compiledWriter3;
}
function compileWkt(desc) {
  if (!desc.typeName.startsWith("google.protobuf.")) {
    return void 0;
  }
  switch (desc.typeName) {
    case "google.protobuf.Any":
      return (opts, message2) => anyToJson(message2, opts);
    case "google.protobuf.Timestamp":
      return (opts, message2) => timestampToJson(message2);
    case "google.protobuf.Duration":
      return (opts, message2) => durationToJson(message2);
    case "google.protobuf.FieldMask":
      return (opts, message2) => fieldMaskToJson(message2);
    case "google.protobuf.Struct":
      return (opts, message2) => structToJson(message2);
    case "google.protobuf.Value":
      return (opts, message2) => valueToJson(message2);
    case "google.protobuf.ListValue":
      return (opts, message2) => listValueToJson(message2);
    default:
      if (isWrapperDesc(desc)) {
        const valueField = desc.fields[0];
        const localName = valueField.localName;
        const zero2 = scalarZeroValue(valueField.scalar, false);
        const writeScalar = compileScalarValue2(valueField);
        return (opts, message2) => {
          const value = message2[localName];
          return writeScalar(opts, value === void 0 ? zero2 : value);
        };
      }
      return void 0;
  }
}
function compileField2(field4) {
  switch (field4.fieldKind) {
    case "scalar":
    case "enum":
    case "message":
      return compileSingularField2(field4);
    case "list":
    case "map": {
      const writeValue = field4.fieldKind == "list" ? compileListValue(field4) : compileMapValue(field4);
      const protoName = field4.name;
      const jsonKey = field4.jsonName;
      const localName = field4.localName;
      return (opts, message2, json) => {
        const value = writeValue(opts, message2[localName]);
        if (value !== void 0) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = value;
        }
      };
    }
  }
}
function compileSingularField2(field4) {
  const writeValue = compileSingularValue2(field4);
  const protoName = field4.name;
  const jsonKey = field4.jsonName;
  const localName = field4.localName;
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (opts, message2, json) => {
      const oneof = message2[oneofLocalName];
      if (oneof.case === localName) {
        json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, oneof.value);
      }
    };
  }
  if (field4.presence != IMPLICIT5) {
    const requiredError = field4.presence == LEGACY_REQUIRED3 ? `cannot encode ${field4} to JSON: required field not set` : void 0;
    return (opts, message2, json) => {
      const value = message2[localName];
      if (value !== void 0 && Object.prototype.hasOwnProperty.call(message2, localName)) {
        json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
      } else if (requiredError !== void 0) {
        throw new Error(requiredError);
      }
    };
  }
  if (field4.fieldKind == "enum") {
    const zero2 = field4.enum.values[0].number;
    return (opts, message2, json) => {
      const value = message2[localName];
      if (value !== zero2 || opts.alwaysEmitImplicit) {
        json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
      }
    };
  }
  switch (field4.scalar) {
    case ScalarType.BOOL:
      return (opts, message2, json) => {
        const value = message2[localName];
        if (value !== false || opts.alwaysEmitImplicit) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
        }
      };
    case ScalarType.STRING:
      return (opts, message2, json) => {
        const value = message2[localName];
        if (value !== "" || opts.alwaysEmitImplicit) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
        }
      };
    case ScalarType.BYTES:
      return (opts, message2, json) => {
        const value = message2[localName];
        if (!(value instanceof Uint8Array) || value.byteLength > 0 || opts.alwaysEmitImplicit) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
        }
      };
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return (opts, message2, json) => {
        const value = message2[localName];
        if (!Object.is(value, 0) || opts.alwaysEmitImplicit) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
        }
      };
    default:
      return (opts, message2, json) => {
        const value = message2[localName];
        if (value != 0 || opts.alwaysEmitImplicit) {
          json[opts.useProtoFieldName ? protoName : jsonKey] = writeValue(opts, value);
        }
      };
  }
}
function compileFieldValue(field4) {
  switch (field4.fieldKind) {
    case "scalar":
    case "enum":
    case "message":
      return compileSingularValue2(field4);
    case "list":
      return compileListValue(field4);
    case "map":
      return compileMapValue(field4);
  }
}
function compileSingularValue2(field4) {
  switch (field4.fieldKind) {
    case "scalar":
      return compileScalarValue2(field4);
    case "enum":
      return compileEnumValue(field4);
    case "message":
      return compileMessageValue(field4);
  }
}
function compileMessageValue(field4) {
  const { toMessage } = localMessageMapper(field4);
  const writeMessage = compiledWriter2(field4.message);
  return (opts, value) => writeMessage(opts, toMessage(value));
}
function compileListValue(field4) {
  const writeItem = compileListItemValue(field4);
  return (opts, value) => {
    const items = value;
    if (items.length == 0 && !opts.alwaysEmitImplicit) {
      return void 0;
    }
    const jsonArray = [];
    for (let i = 0; i < items.length; i++) {
      jsonArray.push(writeItem(opts, items[i]));
    }
    return jsonArray;
  };
}
function compileListItemValue(field4) {
  switch (field4.listKind) {
    case "scalar":
      return compileScalarValue2(field4);
    case "enum":
      return compileEnumValue(field4);
    case "message":
      return compileMessageValue(field4);
  }
}
function compileMapValue(field4) {
  const writeMapValue = compileMapEntryValue(field4);
  return (opts, value) => {
    const record = value;
    const keys = Object.keys(record);
    if (keys.length == 0 && !opts.alwaysEmitImplicit) {
      return void 0;
    }
    const jsonObject = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      jsonObject[key] = writeMapValue(opts, record[key]);
    }
    return jsonObject;
  };
}
function compileMapEntryValue(field4) {
  switch (field4.mapKind) {
    case "scalar":
      return compileScalarValue2(field4);
    case "enum":
      return compileEnumValue(field4);
    case "message":
      return compileMessageValue(field4);
  }
}
function compileEnumValue(field4) {
  const desc = field4.enum;
  if (desc.typeName == "google.protobuf.NullValue") {
    return (opts, value) => {
      if (typeof value != "number") {
        throw errorEnumValue(desc, value);
      }
      return null;
    };
  }
  return (opts, value) => {
    var _a, _b;
    if (typeof value != "number") {
      throw errorEnumValue(desc, value);
    }
    if (opts.enumAsInteger) {
      return value;
    }
    return (_b = (_a = desc.value[value]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : value;
  };
}
function errorEnumValue(desc, value) {
  return new Error(`cannot encode ${desc} to JSON: expected number, got ${formatVal(value)}`);
}
function compileScalarValue2(field4) {
  switch (field4.scalar) {
    // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
    case ScalarType.INT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
      return (opts, value) => {
        if (typeof value != "number") {
          throw errorScalarValue(field4, value);
        }
        return value;
      };
    // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
    // Either numbers or strings are accepted. Exponent notation is also accepted.
    case ScalarType.FLOAT:
    case ScalarType.DOUBLE:
      return (opts, value) => {
        if (typeof value != "number") {
          throw errorScalarValue(field4, value);
        }
        if (Number.isNaN(value))
          return "NaN";
        if (value === Number.POSITIVE_INFINITY)
          return "Infinity";
        if (value === Number.NEGATIVE_INFINITY)
          return "-Infinity";
        return value;
      };
    // string:
    case ScalarType.STRING:
      return (opts, value) => {
        if (typeof value != "string") {
          throw errorScalarValue(field4, value);
        }
        return value;
      };
    // bool:
    case ScalarType.BOOL:
      return (opts, value) => {
        if (typeof value != "boolean") {
          throw errorScalarValue(field4, value);
        }
        return value;
      };
    // JSON value will be a decimal string. Either numbers or strings are accepted.
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      return (opts, value) => {
        if (typeof value == "bigint" || typeof value == "string" || typeof value == "number" && Number.isInteger(value)) {
          return value.toString();
        }
        throw errorScalarValue(field4, value);
      };
    // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
    // Either standard or URL-safe base64 encoding with/without paddings are accepted.
    case ScalarType.BYTES:
      return (opts, value) => {
        if (value instanceof Uint8Array) {
          return base64Encode(value);
        }
        throw errorScalarValue(field4, value);
      };
  }
}
function errorScalarValue(field4, value) {
  var _a;
  return new Error(`cannot encode ${field4} to JSON: ${(_a = checkField(field4, value)) === null || _a === void 0 ? void 0 : _a.message}`);
}
function writeExtensions(json, opts, registry2, message2, desc) {
  const unknown = message2.$unknown;
  if (unknown === void 0) {
    return;
  }
  const tagSeen = /* @__PURE__ */ new Set();
  for (let i = 0; i < unknown.length; i++) {
    const { no } = unknown[i];
    if (!tagSeen.has(no)) {
      tagSeen.add(no);
      const extension = registry2.getExtensionFor(desc, no);
      if (!extension) {
        continue;
      }
      const value = getExtension(message2, extension);
      const [container, field4] = createExtensionContainer(extension, value);
      const local = container[unsafeLocal];
      const jsonValue = compileFieldValue(field4)(opts, local[field4.localName]);
      if (jsonValue !== void 0) {
        json[extension.jsonName] = jsonValue;
      }
    }
  }
}
function anyToJson(val, opts) {
  if (val.typeUrl === "") {
    return {};
  }
  const { registry: registry2 } = opts;
  let message2;
  let desc;
  if (registry2) {
    message2 = anyUnpack(val, registry2);
    if (message2) {
      desc = registry2.getMessage(message2.$typeName);
    }
  }
  if (!desc || !message2) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: "${val.typeUrl}" is not in the type registry`);
  }
  const json = hasCustomJsonRepresentation(desc) ? {
    value: compiledWriter2(desc)(opts, message2)
  } : compiledWriter2(desc)(opts, message2);
  json["@type"] = val.typeUrl;
  return json;
}
function durationToJson(val) {
  const seconds = Number(val.seconds);
  const nanos = val.nanos;
  if (seconds > durationSecondsMax || seconds < durationSecondsMin) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: value out of range`);
  }
  if (seconds > 0 && nanos < 0 || seconds < 0 && nanos > 0) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: nanos sign must match seconds sign`);
  }
  let text = val.seconds.toString();
  if (nanos !== 0) {
    let nanosStr = Math.abs(nanos).toString();
    nanosStr = "0".repeat(9 - nanosStr.length) + nanosStr;
    if (nanosStr.substring(3) === "000000") {
      nanosStr = nanosStr.substring(0, 3);
    } else if (nanosStr.substring(6) === "000") {
      nanosStr = nanosStr.substring(0, 6);
    }
    text += "." + nanosStr;
    if (nanos < 0 && seconds == 0) {
      text = "-" + text;
    }
  }
  return text + "s";
}
function fieldMaskToJson(val) {
  return val.paths.map((p) => {
    if (protoSnakeCase(protoCamelCase(p)) !== p) {
      throw new Error(`cannot encode message ${val.$typeName} to JSON: lowerCamelCase of path name "${p}" is irreversible`);
    }
    return protoCamelCase(p);
  }).join(",");
}
function structToJson(val) {
  const json = {};
  const keys = Object.keys(val.fields);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    json[key] = valueToJson(val.fields[key]);
  }
  return json;
}
function valueToJson(val) {
  switch (val.kind.case) {
    case "nullValue":
      return null;
    case "numberValue":
      if (!Number.isFinite(val.kind.value)) {
        throw new Error(`${val.$typeName} cannot be NaN or Infinity`);
      }
      return val.kind.value;
    case "boolValue":
      return val.kind.value;
    case "stringValue":
      return val.kind.value;
    case "structValue":
      return structToJson(val.kind.value);
    case "listValue":
      return listValueToJson(val.kind.value);
    default:
      throw new Error(`${val.$typeName} must have a value`);
  }
}
function listValueToJson(val) {
  return val.values.map(valueToJson);
}
function timestampToJson(val) {
  const ms = Number(val.seconds) * 1e3;
  if (ms < timestampMsMin || ms > timestampMsMax) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive`);
  }
  if (val.nanos < 0) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: nanos must not be negative`);
  }
  if (val.nanos > 999999999) {
    throw new Error(`cannot encode message ${val.$typeName} to JSON: nanos must not be greater than 99999999`);
  }
  let z = "Z";
  if (val.nanos > 0) {
    const nanosStr = (val.nanos + 1e9).toString().substring(1);
    if (nanosStr.substring(3) === "000000") {
      z = "." + nanosStr.substring(0, 3) + "Z";
    } else if (nanosStr.substring(6) === "000") {
      z = "." + nanosStr.substring(0, 6) + "Z";
    } else {
      z = "." + nanosStr + "Z";
    }
  }
  return new Date(ms).toISOString().replace(".000Z", z);
}

// ../dsh-cursor/node_modules/.pnpm/@bufbuild+protobuf@2.14.1/node_modules/@bufbuild/protobuf/dist/esm/from-json.js
var IMPLICIT6 = 2;
function makeReadContext2(options) {
  return Object.assign(Object.assign({ ignoreUnknownFields: false, recursionLimit: 100 }, options), { depth: 0 });
}
function fromJson(schema, json, options) {
  const message2 = create(schema);
  readMessage(schema, message2, json, options);
  return message2;
}
function readMessage(schema, message2, json, options) {
  try {
    compiledReader2(schema)(message2, json, makeReadContext2(options));
  } catch (e) {
    if (isFieldError(e)) {
      throw new Error(`cannot decode ${e.field()} from JSON: ${e.message}`, {
        cause: e
      });
    }
    throw e;
  }
}
var compiledReaders2 = /* @__PURE__ */ new WeakMap();
function compiledReader2(desc) {
  let compiled = compiledReaders2.get(desc);
  if (compiled === void 0) {
    compiled = compileMessage4(desc);
  }
  return compiled;
}
function compileMessage4(desc) {
  const descString = String(desc);
  const readWkt = compileWkt2(desc);
  if (readWkt !== void 0) {
    const compiled2 = (message2, json, ctx) => {
      if (++ctx.depth > ctx.recursionLimit) {
        throw new Error(`cannot decode ${descString} from JSON: maximum recursion depth of ${ctx.recursionLimit} reached`);
      }
      readWkt(message2, json, ctx);
      ctx.depth--;
    };
    compiledReaders2.set(desc, compiled2);
    return compiled2;
  }
  const typeName = desc.typeName;
  const fieldsByJsonKey = /* @__PURE__ */ new Map();
  const compiled = (message2, json, ctx) => {
    var _a;
    if (++ctx.depth > ctx.recursionLimit) {
      throw new Error(`cannot decode ${descString} from JSON: maximum recursion depth of ${ctx.recursionLimit} reached`);
    }
    if (json == null || Array.isArray(json) || typeof json != "object") {
      throw new Error(`cannot decode ${descString} from JSON: ${formatVal(json)}`);
    }
    const oneofSeen = /* @__PURE__ */ new Map();
    const fieldSeen = /* @__PURE__ */ new Set();
    const jsonKeys = Object.keys(json);
    for (let i = 0; i < jsonKeys.length; i++) {
      const jsonKey = jsonKeys[i];
      const jsonValue = json[jsonKey];
      const entry = fieldsByJsonKey.get(jsonKey);
      if (entry !== void 0) {
        const field4 = entry.field;
        if (fieldSeen.has(field4)) {
          throw new FieldError(field4, "set multiple times");
        }
        fieldSeen.add(field4);
        if (entry.oneofScalarNullSkip && jsonValue === null) {
          continue;
        }
        if (entry.oneof) {
          const seen = oneofSeen.get(entry.oneof);
          if (seen !== void 0) {
            throw new FieldError(entry.oneof, `oneof set multiple times by ${seen.name} and ${field4.name}`);
          }
          oneofSeen.set(entry.oneof, field4);
        }
        entry.read(message2, jsonValue, ctx);
      } else {
        const extension = jsonKey.startsWith("[") && jsonKey.endsWith("]") ? (_a = ctx.registry) === null || _a === void 0 ? void 0 : _a.getExtension(jsonKey.substring(1, jsonKey.length - 1)) : void 0;
        if ((extension === null || extension === void 0 ? void 0 : extension.extendee.typeName) == typeName) {
          const [container, field4, get] = createExtensionContainer(extension);
          compileFieldReader2(field4)(container[unsafeLocal], jsonValue, ctx);
          setExtension(message2, extension, get());
        }
        if (extension === void 0 && !ctx.ignoreUnknownFields) {
          throw new Error(`cannot decode ${descString} from JSON: key "${jsonKey}" is unknown`);
        }
      }
    }
    ctx.depth--;
  };
  compiledReaders2.set(desc, compiled);
  for (const field4 of desc.fields) {
    const entry = {
      read: compileFieldReader2(field4),
      field: field4,
      oneof: field4.oneof,
      oneofScalarNullSkip: field4.oneof !== void 0 && field4.fieldKind == "scalar"
    };
    fieldsByJsonKey.set(field4.name, entry).set(field4.jsonName, entry);
  }
  return compiled;
}
function compileWkt2(desc) {
  if (!desc.typeName.startsWith("google.protobuf.")) {
    return void 0;
  }
  switch (desc.typeName) {
    case "google.protobuf.Any":
      return (message2, json, ctx) => anyFromJson(message2, json, ctx);
    case "google.protobuf.Timestamp":
      return (message2, json) => timestampFromJson(message2, json);
    case "google.protobuf.Duration":
      return (message2, json) => durationFromJson(message2, json);
    case "google.protobuf.FieldMask":
      return (message2, json) => fieldMaskFromJson(message2, json);
    case "google.protobuf.Struct":
      return (message2, json, ctx) => structFromJson(message2, json, ctx);
    case "google.protobuf.Value":
      return (message2, json, ctx) => valueFromJson(message2, json, ctx);
    case "google.protobuf.ListValue":
      return (message2, json, ctx) => listValueFromJson(message2, json, ctx);
    default:
      if (isWrapperDesc(desc)) {
        const valueField = desc.fields[0];
        const localName = valueField.localName;
        const scalar = valueField.scalar;
        const longAsString = valueField.longAsString;
        const readScalar = compileScalarConverter(valueField);
        return (message2, json) => {
          if (json === null) {
            message2[localName] = scalarZeroValue(scalar, longAsString);
          } else {
            message2[localName] = readScalar(json);
          }
        };
      }
      return void 0;
  }
}
function compileFieldReader2(field4) {
  switch (field4.fieldKind) {
    case "scalar":
      return compileScalarFieldReader2(field4);
    case "enum":
      return compileEnumFieldReader2(field4);
    case "message":
      return compileMessageFieldReader2(field4);
    case "list":
      return compileListFieldReader2(field4);
    case "map":
      return compileMapFieldReader2(field4);
  }
}
function compileScalarFieldReader2(field4) {
  const readScalar = compileScalarConverter(field4);
  const localName = field4.localName;
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (message2, json) => {
      message2[oneofLocalName] = {
        case: localName,
        value: readScalar(json)
      };
    };
  }
  const clear = compileClear(field4);
  return (message2, json) => {
    if (json === null) {
      clear(message2);
    } else {
      message2[localName] = readScalar(json);
    }
  };
}
function compileClear(field4) {
  const localName = field4.localName;
  if (field4.presence != IMPLICIT6) {
    return (message2) => {
      delete message2[localName];
    };
  }
  if (field4.fieldKind == "enum") {
    const zero2 = field4.enum.values[0].number;
    return (message2) => {
      message2[localName] = zero2;
    };
  }
  const scalar = field4.scalar;
  const longAsString = field4.longAsString;
  return (message2) => {
    message2[localName] = scalarZeroValue(scalar, longAsString);
  };
}
function compileEnumFieldReader2(field4) {
  const readEnumValue = compileEnumConverter(field4.enum);
  const checkEnum = compileEnumCheck(field4.enum);
  const localName = field4.localName;
  const nullResets = field4.enum.typeName != "google.protobuf.NullValue";
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (message2, json, ctx) => {
      if (json === null && nullResets) {
        const oneof = message2[oneofLocalName];
        if (oneof.case === localName) {
          message2[oneofLocalName] = { case: void 0 };
        }
        return;
      }
      const value = readEnumValue(json, ctx.ignoreUnknownFields);
      if (value === tokenIgnoredUnknownEnum) {
        return;
      }
      const check = checkEnum(value);
      if (check !== true) {
        throw new FieldError(field4, reasonSingular(field4, value, check));
      }
      message2[oneofLocalName] = { case: localName, value };
    };
  }
  const clear = compileClear(field4);
  return (message2, json, ctx) => {
    if (json === null && nullResets) {
      clear(message2);
      return;
    }
    const value = readEnumValue(json, ctx.ignoreUnknownFields);
    if (value === tokenIgnoredUnknownEnum) {
      return;
    }
    const check = checkEnum(value);
    if (check !== true) {
      throw new FieldError(field4, reasonSingular(field4, value, check));
    }
    message2[localName] = value;
  };
}
function compileMessageFieldReader2(field4) {
  const localName = field4.localName;
  const { toMessage, toLocal } = localMessageMapper(field4);
  const readChild = compiledReader2(field4.message);
  const nullResets = field4.message.typeName != "google.protobuf.Value";
  if (field4.oneof) {
    const oneofLocalName = field4.oneof.localName;
    return (message2, json, ctx) => {
      const oneof = message2[oneofLocalName];
      if (json === null && nullResets) {
        if (oneof.case === localName) {
          message2[oneofLocalName] = { case: void 0 };
        }
        return;
      }
      const child = toMessage(oneof.case === localName ? oneof.value : void 0);
      readChild(child, json, ctx);
      message2[oneofLocalName] = { case: localName, value: toLocal(child) };
    };
  }
  return (message2, json, ctx) => {
    if (json === null && nullResets) {
      delete message2[localName];
      return;
    }
    const child = toMessage(message2[localName]);
    readChild(child, json, ctx);
    message2[localName] = toLocal(child);
  };
}
function compileListFieldReader2(field4) {
  const localName = field4.localName;
  const readItem = compileListItemReader(field4);
  return (message2, json, ctx) => {
    if (json === null) {
      return;
    }
    if (!Array.isArray(json)) {
      throw new FieldError(field4, "expected Array, got " + formatVal(json));
    }
    const items = message2[localName];
    for (let i = 0; i < json.length; i++) {
      const value = readItem(json[i], ctx, items.length);
      if (value !== tokenIgnoredUnknownEnum) {
        items.push(value);
      }
    }
  };
}
function compileListItemReader(field4) {
  switch (field4.listKind) {
    case "scalar": {
      const parseScalar = compileScalarParse(field4);
      const checkValue = checkScalarValue(field4.scalar);
      const toLocal = compileScalarToLocal(field4);
      return (json, ctx, index) => {
        if (json === null) {
          throw new FieldError(field4, "list item must not be null");
        }
        const value = parseScalar(json);
        const check = checkValue(value);
        if (check !== true) {
          throw new FieldError(field4, `list item #${index + 1}: ${reasonSingular(field4, value, check)}`);
        }
        return toLocal(value);
      };
    }
    case "enum": {
      const readEnumValue = compileEnumConverter(field4.enum);
      const checkEnum = compileEnumCheck(field4.enum);
      const nullResets = field4.enum.typeName != "google.protobuf.NullValue";
      return (json, ctx, index) => {
        if (json === null && nullResets) {
          throw new FieldError(field4, "list item must not be null");
        }
        const value = readEnumValue(json, ctx.ignoreUnknownFields);
        if (value === tokenIgnoredUnknownEnum) {
          return value;
        }
        const check = checkEnum(value);
        if (check !== true) {
          throw new FieldError(field4, `list item #${index + 1}: ${reasonSingular(field4, value, check)}`);
        }
        return value;
      };
    }
    case "message": {
      const { toMessage, toLocal } = localMessageMapper(field4);
      const readChild = compiledReader2(field4.message);
      const nullResets = field4.message.typeName != "google.protobuf.Value";
      return (json, ctx) => {
        if (json === null && nullResets) {
          throw new FieldError(field4, "list item must not be null");
        }
        const child = toMessage(void 0);
        readChild(child, json, ctx);
        return toLocal(child);
      };
    }
  }
}
function compileMapFieldReader2(field4) {
  const localName = field4.localName;
  const mapKey = field4.mapKey;
  const parseMapKey = compileMapKeyParse(mapKey);
  const checkMapKey = checkScalarValue(mapKey);
  let parseValue;
  let checkValue;
  let toLocalValue = (value) => value;
  let nullResets = true;
  switch (field4.mapKind) {
    case "scalar": {
      parseValue = compileScalarParse(field4);
      checkValue = checkScalarValue(field4.scalar);
      toLocalValue = compileScalarToLocal(field4);
      break;
    }
    case "enum": {
      const readEnumValue = compileEnumConverter(field4.enum);
      parseValue = (json, ctx) => readEnumValue(json, ctx.ignoreUnknownFields);
      checkValue = compileEnumCheck(field4.enum);
      nullResets = field4.enum.typeName != "google.protobuf.NullValue";
      break;
    }
    case "message": {
      const { toMessage, toLocal } = localMessageMapper(field4);
      const readChild = compiledReader2(field4.message);
      nullResets = field4.message.typeName != "google.protobuf.Value";
      parseValue = (json, ctx) => {
        const child = toMessage(void 0);
        readChild(child, json, ctx);
        return toLocal(child);
      };
      break;
    }
  }
  return (message2, json, ctx) => {
    if (json === null) {
      return;
    }
    if (typeof json != "object" || Array.isArray(json)) {
      throw new FieldError(field4, "expected object, got " + formatVal(json));
    }
    const record = message2[localName];
    const seen = /* @__PURE__ */ new Set();
    const jsonMapKeys = Object.keys(json);
    for (let i = 0; i < jsonMapKeys.length; i++) {
      const jsonMapKey = jsonMapKeys[i];
      const jsonMapValue = json[jsonMapKey];
      const key = parseMapKey(jsonMapKey);
      if (seen.has(key)) {
        throw new FieldError(field4, `duplicate map key "${jsonMapKey}"`);
      }
      seen.add(key);
      if (jsonMapValue === null && nullResets) {
        throw new FieldError(field4, "map value must not be null");
      }
      const value = parseValue(jsonMapValue, ctx);
      if (value === tokenIgnoredUnknownEnum) {
        continue;
      }
      const checkKey = checkMapKey(key);
      if (checkKey !== true) {
        throw new FieldError(field4, `invalid map key: ${reasonSingular({ scalar: mapKey }, key, checkKey)}`);
      }
      if (checkValue !== void 0) {
        const check = checkValue(value);
        if (check !== true) {
          throw new FieldError(field4, `map entry ${formatVal(key)}: ${reasonSingular(field4, value, check)}`);
        }
      }
      record[key] = toLocalValue(value);
    }
  };
}
var tokenIgnoredUnknownEnum = Symbol();
function compileEnumConverter(desc) {
  const zero2 = desc.values[0].number;
  const values = desc.values;
  return (json, ignoreUnknownFields) => {
    if (json === null) {
      return zero2;
    }
    switch (typeof json) {
      case "number":
        if (Number.isInteger(json)) {
          return json;
        }
        break;
      case "string": {
        const value = values.find((ev) => ev.name === json);
        if (value !== void 0) {
          return value.number;
        }
        if (ignoreUnknownFields) {
          return tokenIgnoredUnknownEnum;
        }
        break;
      }
    }
    throw new Error(`cannot decode ${desc} from JSON: ${formatVal(json)}`);
  };
}
function compileEnumCheck(desc) {
  if (desc.open) {
    return checkScalarValue(ScalarType.INT32);
  }
  const values = desc.values;
  return (value) => values.some((v) => v.number === value);
}
function compileScalarConverter(field4) {
  const parseScalar = compileScalarParse(field4);
  const checkValue = checkScalarValue(field4.scalar);
  const toLocal = compileScalarToLocal(field4);
  return (json) => {
    const value = parseScalar(json);
    const check = checkValue(value);
    if (check !== true) {
      throw new FieldError(field4, reasonSingular(field4, value, check));
    }
    return toLocal(value);
  };
}
function compileScalarParse(field4) {
  switch (field4.scalar) {
    // float, double: JSON value will be a number or one of the special string values "NaN", "Infinity", and "-Infinity".
    // Either numbers or strings are accepted. Exponent notation is also accepted.
    case ScalarType.DOUBLE:
    case ScalarType.FLOAT:
      return (json) => {
        if (json === "NaN")
          return NaN;
        if (json === "Infinity")
          return Number.POSITIVE_INFINITY;
        if (json === "-Infinity")
          return Number.NEGATIVE_INFINITY;
        if (typeof json == "number") {
          if (Number.isNaN(json)) {
            throw new FieldError(field4, "unexpected NaN number");
          }
          if (!Number.isFinite(json)) {
            throw new FieldError(field4, "unexpected infinite number");
          }
          return json;
        }
        if (typeof json == "string") {
          if (json === "") {
            return json;
          }
          if (json.trim().length !== json.length) {
            return json;
          }
          const float = Number(json);
          if (!Number.isFinite(float)) {
            return json;
          }
          return float;
        }
        return json;
      };
    // int32, fixed32, uint32: JSON value will be a decimal number. Either numbers or strings are accepted.
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
    case ScalarType.UINT32:
      return int32FromJson;
    // bytes: JSON value will be the data encoded as a string using standard base64 encoding with paddings.
    // Either standard or URL-safe base64 encoding with/without paddings are accepted.
    case ScalarType.BYTES:
      return (json) => {
        if (typeof json == "string") {
          if (json === "") {
            return new Uint8Array(0);
          }
          try {
            return base64Decode(json);
          } catch (e) {
            const message2 = e instanceof Error ? e.message : String(e);
            throw new FieldError(field4, message2);
          }
        }
        return json;
      };
    // int64, sfixed64, sint64, fixed64, uint64: The validation step accepts
    // string and number. string, bool: no conversion.
    default:
      return (json) => json;
  }
}
function compileScalarToLocal(field4) {
  const longAsString = field4.fieldKind !== "map" && field4.longAsString;
  switch (field4.scalar) {
    case ScalarType.INT64:
    case ScalarType.SFIXED64:
    case ScalarType.SINT64:
      if (longAsString) {
        return (value) => String(value);
      }
      return (value) => typeof value == "string" || typeof value == "number" ? protoInt64.parse(value) : value;
    case ScalarType.FIXED64:
    case ScalarType.UINT64:
      if (longAsString) {
        return (value) => String(value);
      }
      return (value) => typeof value == "string" || typeof value == "number" ? protoInt64.uParse(value) : value;
    default:
      return (value) => value;
  }
}
function compileMapKeyParse(type) {
  switch (type) {
    case ScalarType.BOOL:
      return (jsonString) => {
        switch (jsonString) {
          case "true":
            return true;
          case "false":
            return false;
        }
        return jsonString;
      };
    case ScalarType.INT32:
    case ScalarType.FIXED32:
    case ScalarType.UINT32:
    case ScalarType.SFIXED32:
    case ScalarType.SINT32:
      return int32FromJson;
    case ScalarType.INT64:
    case ScalarType.SINT64:
    case ScalarType.SFIXED64:
    case ScalarType.UINT64:
    case ScalarType.FIXED64:
      return (jsonString) => /^-?0+$/.test(jsonString) ? "0" : jsonString.replace(/^(-?)0+(?=\d)/, "$1");
    default:
      return (jsonString) => jsonString;
  }
}
function int32FromJson(json) {
  if (typeof json == "string") {
    if (json === "") {
      return json;
    }
    if (json.trim().length !== json.length) {
      return json;
    }
    const num2 = Number(json);
    if (Number.isNaN(num2)) {
      return json;
    }
    return num2;
  }
  return json;
}
function anyFromJson(any, json, ctx) {
  var _a;
  if (json === null || Array.isArray(json) || typeof json != "object") {
    throw new Error(`cannot decode message ${any.$typeName} from JSON: expected object but got ${formatVal(json)}`);
  }
  if (Object.keys(json).length == 0) {
    return;
  }
  const typeUrl = json["@type"];
  if (typeof typeUrl != "string" || typeUrl == "") {
    throw new Error(`cannot decode message ${any.$typeName} from JSON: "@type" is empty`);
  }
  const typeName = typeUrl.includes("/") ? typeUrl.substring(typeUrl.lastIndexOf("/") + 1) : typeUrl;
  if (!typeName.length) {
    throw new Error(`cannot decode message ${any.$typeName} from JSON: "@type" is invalid`);
  }
  const desc = (_a = ctx.registry) === null || _a === void 0 ? void 0 : _a.getMessage(typeName);
  if (!desc) {
    throw new Error(`cannot decode message ${any.$typeName} from JSON: ${typeUrl} is not in the type registry`);
  }
  const message2 = create(desc);
  if (hasCustomJsonRepresentation(desc) && Object.prototype.hasOwnProperty.call(json, "value")) {
    compiledReader2(desc)(message2, json.value, ctx);
  } else {
    const copy = Object.assign({}, json);
    delete copy["@type"];
    compiledReader2(desc)(message2, copy, ctx);
  }
  anyPack(desc, message2, any);
}
function timestampFromJson(timestamp, json) {
  if (typeof json !== "string") {
    throw new Error(`cannot decode message ${timestamp.$typeName} from JSON: ${formatVal(json)}`);
  }
  const matches = json.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.([0-9]{1,9}))?(?:Z|([+-][0-9][0-9]:[0-9][0-9]))$/);
  if (!matches) {
    throw new Error(`cannot decode message ${timestamp.$typeName} from JSON: invalid RFC 3339 string`);
  }
  const ms = Date.parse(
    // biome-ignore format: want this to read well
    matches[1] + "-" + matches[2] + "-" + matches[3] + "T" + matches[4] + ":" + matches[5] + ":" + matches[6] + (matches[8] ? matches[8] : "Z")
  );
  if (Number.isNaN(ms)) {
    throw new Error(`cannot decode message ${timestamp.$typeName} from JSON: invalid RFC 3339 string`);
  }
  if (ms < timestampMsMin || ms > timestampMsMax) {
    throw new Error(`cannot decode message ${timestamp.$typeName} from JSON: must be from 0001-01-01T00:00:00Z to 9999-12-31T23:59:59Z inclusive`);
  }
  timestamp.seconds = protoInt64.parse(ms / 1e3);
  timestamp.nanos = 0;
  if (matches[7]) {
    timestamp.nanos = parseInt("1" + matches[7] + "0".repeat(9 - matches[7].length)) - 1e9;
  }
}
function durationFromJson(duration, json) {
  if (typeof json !== "string") {
    throw new Error(`cannot decode message ${duration.$typeName} from JSON: ${formatVal(json)}`);
  }
  const match = json.match(/^(-?[0-9]+)(?:\.([0-9]+))?s/);
  if (match === null) {
    throw new Error(`cannot decode message ${duration.$typeName} from JSON: ${formatVal(json)}`);
  }
  const longSeconds = Number(match[1]);
  if (longSeconds > durationSecondsMax || longSeconds < durationSecondsMin) {
    throw new Error(`cannot decode message ${duration.$typeName} from JSON: ${formatVal(json)}`);
  }
  duration.seconds = protoInt64.parse(longSeconds);
  if (typeof match[2] !== "string") {
    return;
  }
  const nanosStr = match[2] + "0".repeat(9 - match[2].length);
  duration.nanos = parseInt(nanosStr);
  if (longSeconds < 0 || Object.is(longSeconds, -0)) {
    duration.nanos = -duration.nanos;
  }
}
function fieldMaskFromJson(fieldMask, json) {
  if (typeof json !== "string") {
    throw new Error(`cannot decode message ${fieldMask.$typeName} from JSON: ${formatVal(json)}`);
  }
  if (json === "") {
    return;
  }
  fieldMask.paths = json.split(",").map((path) => {
    if (path.includes("_")) {
      throw new Error(`cannot decode message ${fieldMask.$typeName} from JSON: path names must be lowerCamelCase`);
    }
    return protoSnakeCase(path);
  });
}
function structFromJson(struct, json, ctx) {
  if (typeof json != "object" || json == null || Array.isArray(json)) {
    throw new Error(`cannot decode message ${struct.$typeName} from JSON ${formatVal(json)}`);
  }
  const keys = Object.keys(json);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const parsedValue = create(ValueSchema);
    valueFromJson(parsedValue, json[key], ctx);
    struct.fields[key] = parsedValue;
  }
}
function valueFromJson(value, json, ctx) {
  if (++ctx.depth > ctx.recursionLimit) {
    throw new Error(`cannot decode ${value.$typeName} from JSON: maximum recursion depth of ${ctx.recursionLimit} reached`);
  }
  switch (typeof json) {
    case "number":
      value.kind = { case: "numberValue", value: json };
      break;
    case "string":
      value.kind = { case: "stringValue", value: json };
      break;
    case "boolean":
      value.kind = { case: "boolValue", value: json };
      break;
    case "object":
      if (json === null) {
        value.kind = { case: "nullValue", value: NullValue.NULL_VALUE };
      } else if (Array.isArray(json)) {
        const listValue = create(ListValueSchema);
        listValueFromJson(listValue, json, ctx);
        value.kind = { case: "listValue", value: listValue };
      } else {
        const struct = create(StructSchema);
        structFromJson(struct, json, ctx);
        value.kind = { case: "structValue", value: struct };
      }
      break;
    default:
      throw new Error(`cannot decode message ${value.$typeName} from JSON ${formatVal(json)}`);
  }
  ctx.depth--;
  return value;
}
function listValueFromJson(listValue, json, ctx) {
  if (!Array.isArray(json)) {
    throw new Error(`cannot decode message ${listValue.$typeName} from JSON ${formatVal(json)}`);
  }
  for (let i = 0; i < json.length; i++) {
    const value = create(ValueSchema);
    valueFromJson(value, json[i], ctx);
    listValue.values.push(value);
  }
}

// ../dsh-cursor/lib/protocol.js
import { createHash } from "node:crypto";
import { createHash as createHash2 } from "node:crypto";
import { randomUUID } from "node:crypto";
import { connect, constants } from "node:http2";
import { gzip, gunzipSync } from "node:zlib";
import { promisify } from "node:util";
import { createHash as createHash3 } from "node:crypto";
import { Agent as HttpsAgent, request as httpsRequest } from "node:https";
import { Agent as HttpAgent, request as httpRequest } from "node:http";
import { randomUUID as randomUUID2 } from "node:crypto";
import { promisify as promisify2 } from "node:util";
import { gzip as gzip2, gunzipSync as gunzipSync2 } from "node:zlib";
import { promisify as promisify3 } from "node:util";
import { createHash as createHash5, randomBytes as randomBytes2 } from "node:crypto";
import { gzip as gzip3, gunzip } from "node:zlib";
var CursorProtocolError = class extends Error {
  constructor(code, message2, status) {
    super(message2);
    this.code = code;
    this.status = status;
    this.name = "CursorProtocolError";
  }
};
function safeError(error, fallback = "Cursor HTTP/2 transport failed") {
  return error instanceof CursorProtocolError ? error : new CursorProtocolError("TRANSPORT", fallback);
}
function httpError(status) {
  const code = status === 401 || status === 403 ? "AUTH" : status === 429 ? "RATE_LIMIT" : status >= 500 ? "SERVER" : "INVALID_REQUEST";
  return new CursorProtocolError(code, `Cursor request returned HTTP ${status}`, status);
}
function serverDetail(text) {
  if (typeof text !== "string" || !text.trim()) return "";
  return text.replace(/bearer\s+\S+/giu, "[redacted]").replace(/[A-Za-z0-9_\-.]{32,}/gu, "[redacted]").replace(/\s+/gu, " ").trim().slice(0, 300);
}
function statusError(code, message2) {
  const known = {
    unauthenticated: "AUTH",
    permission_denied: "AUTH",
    "16": "AUTH",
    "7": "AUTH",
    resource_exhausted: "RATE_LIMIT",
    "8": "RATE_LIMIT",
    canceled: "ABORTED",
    cancelled: "ABORTED",
    "1": "ABORTED",
    deadline_exceeded: "TIMEOUT",
    "4": "TIMEOUT",
    invalid_argument: "INVALID_REQUEST",
    "3": "INVALID_REQUEST"
  };
  const detail2 = serverDetail(message2);
  return new CursorProtocolError(
    known[code] ?? "SERVER",
    `Cursor returned ${code || "an unknown"} error${detail2 ? `: ${detail2}` : ""}`
  );
}
var LIMITS = Object.freeze({
  frameBytes: 16 * 1024 * 1024,
  inflatedBytes: 32 * 1024 * 1024,
  eventBytes: 8 * 1024 * 1024,
  eventCount: 2048,
  blobBytes: 256 * 1024 * 1024,
  blobCount: 65536,
  /** A conversation store above this size is reset and rebuilt from host history. */
  conversationBytes: 192 * 1024 * 1024,
  pendingCalls: 128,
  pendingBytes: 16 * 1024 * 1024,
  seenCalls: 8192,
  toolCount: 2048,
  toolBytes: 16 * 1024 * 1024,
  queuedWriteBytes: 32 * 1024 * 1024,
  queuedWrites: 256,
  handshakeMs: 15e3,
  unaryMs: 3e4,
  idleMs: 12e4,
  terminalDrainMs: 6e3,
  heartbeatMs: 5e3
});
function limitError() {
  return new CursorProtocolError("LIMIT_EXCEEDED", "Cursor protocol buffer limit exceeded");
}
var BlobStore = class {
  #items = /* @__PURE__ */ new Map();
  #bytes = 0;
  get bytes() {
    return this.#bytes;
  }
  get(id) {
    return this.#items.get(Buffer.from(id).toString("hex"));
  }
  put(data) {
    const id = new Uint8Array(createHash("sha256").update(data).digest());
    this.set(id, data);
    return id;
  }
  set(id, data) {
    if (id.byteLength > 128) throw limitError();
    const key = Buffer.from(id).toString("hex");
    const previous = this.#items.get(key);
    const bytes2 = this.#bytes - (previous?.byteLength ?? 0) + data.byteLength;
    if (!previous && this.#items.size >= LIMITS.blobCount || bytes2 > LIMITS.blobBytes) throw limitError();
    this.#items.set(key, Uint8Array.from(data));
    this.#bytes = bytes2;
  }
  entries() {
    return [...this.#items].map(([id, data]) => [new Uint8Array(Buffer.from(id, "hex")), data]);
  }
  clear() {
    this.#items.clear();
    this.#bytes = 0;
  }
};
var RUN_PATH = "/agent.v1.AgentService/Run";
var DEFAULT_ENDPOINT = "https://api2.cursor.sh";
var CLIENT_VERSION = "cli-2026.09.02-c22c1a3";
var compress = promisify(gzip);
var COMPRESS_MIN_BYTES = 1024;
var FORBIDDEN = /* @__PURE__ */ new Set(["connection", "keep-alive", "proxy-connection", "transfer-encoding", "upgrade", "http2-settings", "host", "content-length", "te", "content-type", "connect-protocol-version", "authorization", "x-cursor-agent-allowed-tools"]);
function protocolHeaders(options) {
  const headers2 = {
    "x-cursor-client-type": "cli",
    "x-cursor-client-version": CLIENT_VERSION,
    "x-ghost-mode": "true",
    "x-request-id": randomUUID(),
    "x-dsh-plugin": "dsh-cursor/0.1.0"
  };
  for (const [name, value] of Object.entries(options.headers ?? {})) {
    const field22 = name.toLowerCase();
    if (!field22.startsWith(":") && !FORBIDDEN.has(field22)) headers2[field22] = value;
  }
  for (const [name, value] of Object.entries(attributionHeaders())) headers2[name.toLowerCase()] = value;
  headers2.authorization = `Bearer ${options.accessToken}`;
  headers2["x-cursor-agent-allowed-tools"] = "mcp_tool_call,get_mcp_tools_tool_call";
  return headers2;
}
function validateTransport(options) {
  if (options.proxyUrl !== void 0) throw new CursorProtocolError("UNSUPPORTED_PROXY", "Cursor HTTP/2 proxy transport is not supported");
  if (options.signal?.aborted) throw new CursorProtocolError("ABORTED", "Cursor Run was aborted");
  let endpoint;
  try {
    endpoint = new URL(options.endpoint ?? DEFAULT_ENDPOINT);
  } catch {
    throw new CursorProtocolError("INVALID_REQUEST", "Invalid Cursor endpoint");
  }
  if (!["http:", "https:"].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.pathname !== "/" || endpoint.search || endpoint.hash) {
    throw new CursorProtocolError("INVALID_REQUEST", "Cursor endpoint must be an HTTP(S) origin");
  }
  return endpoint.origin;
}
function nodeCode(error) {
  return error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "unknown";
}
function frameMessage(payload, flags = 0) {
  if (payload.byteLength > LIMITS.frameBytes) throw limitError();
  const frame2 = Buffer.allocUnsafe(payload.byteLength + 5);
  frame2[0] = flags;
  frame2.writeUInt32BE(payload.byteLength, 1);
  frame2.set(payload, 5);
  return frame2;
}
var FrameDecoder = class {
  #header = Buffer.alloc(5);
  #headerUsed = 0;
  #payload;
  #payloadUsed = 0;
  #flags = 0;
  push(chunk) {
    const frames2 = [];
    let offset = 0;
    while (offset < chunk.byteLength) {
      if (!this.#payload) {
        const count2 = Math.min(5 - this.#headerUsed, chunk.byteLength - offset);
        this.#header.set(chunk.subarray(offset, offset + count2), this.#headerUsed);
        this.#headerUsed += count2;
        offset += count2;
        if (this.#headerUsed < 5) break;
        this.#flags = this.#header[0];
        if ((this.#flags & ~3) !== 0) throw new CursorProtocolError("INVALID_RESPONSE", "Unsupported Cursor frame flags");
        const length = this.#header.readUInt32BE(1);
        if (length > LIMITS.frameBytes) throw limitError();
        this.#payload = Buffer.allocUnsafe(length);
        this.#payloadUsed = 0;
      }
      const count = Math.min(this.#payload.length - this.#payloadUsed, chunk.byteLength - offset);
      this.#payload.set(chunk.subarray(offset, offset + count), this.#payloadUsed);
      this.#payloadUsed += count;
      offset += count;
      if (this.#payloadUsed === this.#payload.length) {
        frames2.push({ flags: this.#flags, payload: this.#payload });
        this.#payload = void 0;
        this.#headerUsed = 0;
      }
    }
    return frames2;
  }
  finish() {
    if (this.#headerUsed !== 0 || this.#payload) throw new CursorProtocolError("INVALID_RESPONSE", "Cursor sent an incomplete frame");
  }
};
function terminalError(payload) {
  let result2;
  try {
    result2 = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(payload));
  } catch {
    throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor end-stream envelope");
  }
  if (!result2 || typeof result2 !== "object" || Array.isArray(result2)) throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor end-stream envelope");
  if ("error" in result2 && result2.error !== void 0) {
    const error = result2.error;
    const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" ? error.code : "";
    const message2 = error && typeof error === "object" && "message" in error ? error.message : void 0;
    throw statusError(code, message2);
  }
}
var H2Channel = class {
  session;
  stream;
  ready;
  #readyResolve;
  #readyReject;
  #readySettled = false;
  #handshake;
  #signal;
  #onAbort;
  #failure;
  #closed = false;
  #streaming;
  #trace;
  #writes = 0;
  #writeBytes = 0;
  #writeTail = Promise.resolve();
  #responseHeaders = {};
  #trailers = {};
  constructor(path, options, streaming) {
    const origin = validateTransport(options);
    this.#streaming = streaming;
    this.#trace = options.trace;
    if (!path.startsWith("/") || path.startsWith("//") || /[\r\n?#]/u.test(path)) throw new CursorProtocolError("INVALID_REQUEST", "Invalid Cursor RPC path");
    this.#onAbort = () => this.close(new CursorProtocolError("ABORTED", "Cursor request was aborted"));
    this.#signal = options.signal;
    this.ready = new Promise((resolve, reject) => {
      this.#readyResolve = resolve;
      this.#readyReject = reject;
    });
    void this.ready.catch(() => {
    });
    try {
      this.session = connect(origin);
      this.session.on("error", (error) => this.close(new CursorProtocolError("TRANSPORT", `Cursor HTTP/2 session failed (${nodeCode(error)})`)));
      this.stream = this.session.request({
        ...protocolHeaders(options),
        ":method": "POST",
        ":path": path,
        "content-type": streaming ? "application/connect+proto" : "application/proto",
        "connect-protocol-version": "1",
        ...streaming ? { "connect-accept-encoding": "gzip", "connect-content-encoding": "gzip" } : {},
        te: "trailers"
      });
    } catch {
      this.session?.destroy();
      throw new CursorProtocolError("TRANSPORT", "Cursor HTTP/2 request could not be opened");
    }
    this.stream.on("error", (error) => this.close(new CursorProtocolError("TRANSPORT", `Cursor HTTP/2 stream failed (${nodeCode(error)}, rst ${this.stream.rstCode ?? "none"})`)));
    this.stream.on("response", (headers2) => {
      this.#responseHeaders = headers2;
      const status = Number(headers2[":status"] ?? 0);
      if (status < 200 || status >= 300) {
        this.close(httpError(status));
        return;
      }
      const contentType = String(headers2["content-type"] ?? "").split(";")[0];
      if (contentType !== (streaming ? "application/connect+proto" : "application/proto")) {
        this.close(new CursorProtocolError("INVALID_RESPONSE", "Unexpected Cursor response content type"));
        return;
      }
      this.#settleReady();
    });
    this.stream.on("trailers", (headers2) => {
      this.#trailers = headers2;
    });
    this.stream.once("close", () => {
      if (!this.#readySettled) this.#settleReady(this.#failure ?? new CursorProtocolError("TRANSPORT", "Cursor stream closed before response headers"));
    });
    this.#handshake = setTimeout(() => this.close(new CursorProtocolError("TIMEOUT", "Cursor response header timeout")), LIMITS.handshakeMs);
    this.#handshake.unref();
    this.#signal?.addEventListener("abort", this.#onAbort, { once: true });
    if (this.#signal?.aborted) this.#onAbort();
  }
  #settleReady(error) {
    if (this.#readySettled) return;
    this.#readySettled = true;
    clearTimeout(this.#handshake);
    this.#handshake = void 0;
    if (error) this.#readyReject(error);
    else this.#readyResolve();
  }
  /** Serialized, bounded writes await both the write callback and drain. */
  write(data) {
    if (this.#closed) return Promise.reject(this.#failure ?? new CursorProtocolError("CLOSED", "Cursor connection is closed"));
    if (data.byteLength > LIMITS.queuedWriteBytes || this.#writes >= LIMITS.queuedWrites || this.#writeBytes + data.byteLength > LIMITS.queuedWriteBytes) {
      const error = limitError();
      this.close(error);
      return Promise.reject(error);
    }
    this.#writes++;
    this.#writeBytes += data.byteLength;
    const bytes2 = Buffer.from(data);
    const written = this.#writeTail.then(async () => {
      if (this.#closed) throw this.#failure ?? new CursorProtocolError("CLOSED", "Cursor connection is closed");
      const started = Date.now();
      const frame2 = this.#streaming && bytes2[0] === 0 && bytes2.length - 5 >= COMPRESS_MIN_BYTES ? frameMessage(await compress(bytes2.subarray(5)), 1) : bytes2;
      return new Promise((resolve, reject) => {
        if (this.#closed) {
          reject(this.#failure ?? new CursorProtocolError("CLOSED", "Cursor connection is closed"));
          return;
        }
        let callbackDone = false;
        let drained = false;
        const cleanup = () => {
          this.stream.off("drain", onDrain);
          this.stream.off("close", onClose);
        };
        const finish = () => {
          if (callbackDone && drained) {
            cleanup();
            this.#trace?.("upload", { bytes: bytes2.length, wireBytes: frame2.length, elapsedMs: Date.now() - started });
            resolve();
          }
        };
        const onDrain = () => {
          drained = true;
          finish();
        };
        const onClose = () => {
          cleanup();
          reject(this.#failure ?? new CursorProtocolError("TRANSPORT", "Cursor connection closed during write"));
        };
        this.stream.once("close", onClose);
        try {
          const accepted = this.stream.write(frame2, (error) => {
            if (error) {
              cleanup();
              reject(safeError(error));
              return;
            }
            callbackDone = true;
            finish();
          });
          drained = accepted;
          if (!accepted) this.stream.once("drain", onDrain);
        } catch {
          cleanup();
          reject(new CursorProtocolError("TRANSPORT", "Cursor write failed"));
        }
      });
    }).finally(() => {
      this.#writes--;
      this.#writeBytes -= bytes2.length;
    });
    this.#writeTail = written.catch((error) => {
      this.close(safeError(error));
    });
    return written;
  }
  async *frames() {
    const decoder = new FrameDecoder();
    let ended = false;
    try {
      await this.ready;
      for await (const chunk of this.stream) {
        if (this.#failure) throw this.#failure;
        for (const frame2 of decoder.push(chunk)) {
          if (ended) throw new CursorProtocolError("INVALID_RESPONSE", "Cursor sent data after end-stream");
          if ((frame2.flags & 1) !== 0) {
            if (this.#responseHeaders["connect-content-encoding"] !== "gzip") throw new CursorProtocolError("INVALID_RESPONSE", "Unsupported Cursor frame compression");
            try {
              frame2.payload = gunzipSync(frame2.payload, { maxOutputLength: LIMITS.inflatedBytes });
            } catch {
              throw new CursorProtocolError("LIMIT_EXCEEDED", "Invalid or oversized Cursor compressed frame");
            }
          }
          if ((frame2.flags & 2) !== 0) {
            terminalError(frame2.payload);
            ended = true;
          }
          yield frame2;
        }
      }
      decoder.finish();
      this.checkTrailers();
      if (this.#failure) throw this.#failure;
    } catch (error) {
      throw this.#failure ?? safeError(error, `Invalid Cursor HTTP/2 response (${nodeCode(error)}, rst ${this.stream.rstCode ?? "none"})`);
    }
  }
  get failure() {
    return this.#failure;
  }
  checkTrailers() {
    if (this.#failure) throw this.#failure;
    const status = this.#trailers["grpc-status"];
    if (status !== void 0 && status !== "0") throw statusError(String(status), this.#trailers["grpc-message"]);
  }
  end() {
    if (!this.stream.writableEnded && !this.#closed) this.stream.end();
  }
  close(failure3) {
    if (this.#closed) return;
    this.#closed = true;
    this.#failure = failure3;
    this.#signal?.removeEventListener("abort", this.#onAbort);
    this.#settleReady(failure3 ?? new CursorProtocolError("CLOSED", "Cursor connection is closed"));
    clearTimeout(this.#handshake);
    if (!this.stream.closed && !this.stream.destroyed) this.stream.close(constants.NGHTTP2_CANCEL);
    this.stream.destroy();
    this.session.destroy();
  }
};
var resolved = /* @__PURE__ */ new Map();
async function cursorRunEndpoint(options) {
  if (options.endpoint !== void 0) return options.endpoint;
  const key = createHash2("sha256").update(options.accessToken).digest("hex");
  const known = resolved.get(key);
  if (known) return known;
  const timeout = AbortSignal.timeout(15e3);
  const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
  let response;
  try {
    response = await fetch(`${DEFAULT_ENDPOINT}/aiserver.v1.ServerConfigService/GetServerConfig`, {
      method: "POST",
      signal,
      headers: { ...protocolHeaders(options), "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ telem_enabled: false })
    });
  } catch (error) {
    if (options.signal?.aborted) throw new CursorProtocolError("ABORTED", "Cursor routing request was aborted");
    if (timeout.aborted) throw new CursorProtocolError("TIMEOUT", "Cursor routing request timed out");
    throw safeError(error, "Cursor routing request failed");
  }
  if (!response.ok) throw httpError(response.status);
  let raw;
  try {
    const body = await response.json();
    raw = body.agentUrlConfig?.agentnUrl || body.agentUrlConfig?.agentUrl;
  } catch {
    throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor routing response");
  }
  let url;
  try {
    url = new URL(typeof raw === "string" && !raw.includes("://") ? `https://${raw}` : String(raw));
  } catch {
    throw new CursorProtocolError("INVALID_RESPONSE", "Cursor routing response has no valid agent origin");
  }
  if (url.protocol !== "https:" || !/^([a-z0-9-]+\.)+cursor\.sh$/iu.test(url.hostname) || url.username || url.password) {
    throw new CursorProtocolError("INVALID_RESPONSE", "Cursor routing response has an invalid agent origin");
  }
  resolved.set(key, url.origin);
  if (resolved.size > 64) resolved.delete(resolved.keys().next().value);
  return url.origin;
}
var file_agent = /* @__PURE__ */ fileDesc("CgthZ2VudC5wcm90bxIIYWdlbnQudjEicgoOR2xvYlRvb2xSZXN1bHQSLAoHc3VjY2VzcxgBIAEoCzIZLmFnZW50LnYxLkdsb2JUb29sU3VjY2Vzc0gAEigKBWVycm9yGAIgASgLMhcuYWdlbnQudjEuR2xvYlRvb2xFcnJvckgAQggKBnJlc3VsdCIeCg1HbG9iVG9vbEVycm9yEg0KBWVycm9yGAEgASgJIokBCg9HbG9iVG9vbFN1Y2Nlc3MSDwoHcGF0dGVybhgBIAEoCRIMCgRwYXRoGAIgASgJEg0KBWZpbGVzGAMgAygJEhMKC3RvdGFsX2ZpbGVzGAQgASgFEhgKEGNsaWVudF90cnVuY2F0ZWQYBSABKAgSGQoRcmlwZ3JlcF90cnVuY2F0ZWQYBiABKAgiRgoMR2xvYlRvb2xDYWxsEgwKBGFyZ3MYASABKAwSKAoGcmVzdWx0GAIgASgLMhguYWdlbnQudjEuR2xvYlRvb2xSZXN1bHQibQoRUmVhZExpbnRzVG9vbENhbGwSKQoEYXJncxgBIAEoCzIbLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xBcmdzEi0KBnJlc3VsdBgCIAEoCzIdLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xSZXN1bHQiIgoRUmVhZExpbnRzVG9vbEFyZ3MSDQoFcGF0aHMYASADKAkigQEKE1JlYWRMaW50c1Rvb2xSZXN1bHQSMQoHc3VjY2VzcxgBIAEoCzIeLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xTdWNjZXNzSAASLQoFZXJyb3IYAiABKAsyHC5hZ2VudC52MS5SZWFkTGludHNUb29sRXJyb3JIAEIICgZyZXN1bHQiewoUUmVhZExpbnRzVG9vbFN1Y2Nlc3MSMwoQZmlsZV9kaWFnbm9zdGljcxgBIAMoCzIZLmFnZW50LnYxLkZpbGVEaWFnbm9zdGljcxITCgt0b3RhbF9maWxlcxgCIAEoBRIZChF0b3RhbF9kaWFnbm9zdGljcxgDIAEoBSJpCg9GaWxlRGlhZ25vc3RpY3MSDAoEcGF0aBgBIAEoCRItCgtkaWFnbm9zdGljcxgCIAMoCzIYLmFnZW50LnYxLkRpYWdub3N0aWNJdGVtEhkKEWRpYWdub3N0aWNzX2NvdW50GAMgASgFIqsBCg5EaWFnbm9zdGljSXRlbRIuCghzZXZlcml0eRgBIAEoDjIcLmFnZW50LnYxLkRpYWdub3N0aWNTZXZlcml0eRIoCgVyYW5nZRgCIAEoCzIZLmFnZW50LnYxLkRpYWdub3N0aWNSYW5nZRIPCgdtZXNzYWdlGAMgASgJEg4KBnNvdXJjZRgEIAEoCRIMCgRjb2RlGAUgASgJEhAKCGlzX3N0YWxlGAYgASgIIlUKD0RpYWdub3N0aWNSYW5nZRIhCgVzdGFydBgBIAEoCzISLmFnZW50LnYxLlBvc2l0aW9uEh8KA2VuZBgCIAEoCzISLmFnZW50LnYxLlBvc2l0aW9uIisKElJlYWRMaW50c1Rvb2xFcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJIj0KDE1jcFRvb2xFcnJvchINCgVlcnJvchgBIAEoCRIeChZyZWFkX3Rvb2xfZGVmX3JlbWluZGVyGAIgASgJItIBCg1NY3BUb29sUmVzdWx0EicKB3N1Y2Nlc3MYASABKAsyFC5hZ2VudC52MS5NY3BTdWNjZXNzSAASJwoFZXJyb3IYAiABKAsyFi5hZ2VudC52MS5NY3BUb29sRXJyb3JIABIpCghyZWplY3RlZBgDIAEoCzIVLmFnZW50LnYxLk1jcFJlamVjdGVkSAASOgoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyHS5hZ2VudC52MS5NY3BQZXJtaXNzaW9uRGVuaWVkSABCCAoGcmVzdWx0IoEBCgtNY3BUb29sQ2FsbBIfCgRhcmdzGAEgASgLMhEuYWdlbnQudjEuTWNwQXJncxInCgZyZXN1bHQYAiABKAsyFy5hZ2VudC52MS5NY3BUb29sUmVzdWx0EhgKC2Rlc2NyaXB0aW9uGAMgASgJSACIAQFCDgoMX2Rlc2NyaXB0aW9uIm0KEVNlbVNlYXJjaFRvb2xDYWxsEikKBGFyZ3MYASABKAsyGy5hZ2VudC52MS5TZW1TZWFyY2hUb29sQXJncxItCgZyZXN1bHQYAiABKAsyHS5hZ2VudC52MS5TZW1TZWFyY2hUb29sUmVzdWx0IlMKEVNlbVNlYXJjaFRvb2xBcmdzEg0KBXF1ZXJ5GAEgASgJEhoKEnRhcmdldF9kaXJlY3RvcmllcxgCIAMoCRITCgtleHBsYW5hdGlvbhgDIAEoCSKBAQoTU2VtU2VhcmNoVG9vbFJlc3VsdBIxCgdzdWNjZXNzGAEgASgLMh4uYWdlbnQudjEuU2VtU2VhcmNoVG9vbFN1Y2Nlc3NIABItCgVlcnJvchgCIAEoCzIcLmFnZW50LnYxLlNlbVNlYXJjaFRvb2xFcnJvckgAQggKBnJlc3VsdCI9ChRTZW1TZWFyY2hUb29sU3VjY2VzcxIPCgdyZXN1bHRzGAEgASgJEhQKDGNvZGVfcmVzdWx0cxgCIAMoDCIrChJTZW1TZWFyY2hUb29sRXJyb3ISFQoNZXJyb3JfbWVzc2FnZRgBIAEoCSKCAQoYTGlzdE1jcFJlc291cmNlc1Rvb2xDYWxsEjAKBGFyZ3MYASABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3MSNAoGcmVzdWx0GAIgASgLMiQuYWdlbnQudjEuTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHQifwoXUmVhZE1jcFJlc291cmNlVG9vbENhbGwSLwoEYXJncxgBIAEoCzIhLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUV4ZWNBcmdzEjMKBnJlc3VsdBgCIAEoCzIjLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUV4ZWNSZXN1bHQiWQoNRmV0Y2hUb29sQ2FsbBIhCgRhcmdzGAEgASgLMhMuYWdlbnQudjEuRmV0Y2hBcmdzEiUKBnJlc3VsdBgCIAEoCzIVLmFnZW50LnYxLkZldGNoUmVzdWx0Im4KFFJlY29yZFNjcmVlblRvb2xDYWxsEigKBGFyZ3MYASABKAsyGi5hZ2VudC52MS5SZWNvcmRTY3JlZW5BcmdzEiwKBnJlc3VsdBgCIAEoCzIcLmFnZW50LnYxLlJlY29yZFNjcmVlblJlc3VsdCJ3ChdXcml0ZVNoZWxsU3RkaW5Ub29sQ2FsbBIrCgRhcmdzGAEgASgLMh0uYWdlbnQudjEuV3JpdGVTaGVsbFN0ZGluQXJncxIvCgZyZXN1bHQYAiABKAsyHy5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5SZXN1bHQisQEKC1JlZmxlY3RBcmdzEiIKGnVuZXhwZWN0ZWRfYWN0aW9uX291dGNvbWVzGAEgASgJEh0KFXJlbGV2YW50X2luc3RydWN0aW9ucxgCIAEoCRIZChFzY2VuYXJpb19hbmFseXNpcxgDIAEoCRIaChJjcml0aWNhbF9zeW50aGVzaXMYBCABKAkSEgoKbmV4dF9zdGVwcxgFIAEoCRIUCgx0b29sX2NhbGxfaWQYBiABKAkibwoNUmVmbGVjdFJlc3VsdBIrCgdzdWNjZXNzGAEgASgLMhguYWdlbnQudjEuUmVmbGVjdFN1Y2Nlc3NIABInCgVlcnJvchgCIAEoCzIWLmFnZW50LnYxLlJlZmxlY3RFcnJvckgAQggKBnJlc3VsdCIQCg5SZWZsZWN0U3VjY2VzcyIdCgxSZWZsZWN0RXJyb3ISDQoFZXJyb3IYASABKAkiXwoPUmVmbGVjdFRvb2xDYWxsEiMKBGFyZ3MYASABKAsyFS5hZ2VudC52MS5SZWZsZWN0QXJncxInCgZyZXN1bHQYAiABKAsyFy5hZ2VudC52MS5SZWZsZWN0UmVzdWx0IlkKF1N0YXJ0R3JpbmRFeGVjdXRpb25BcmdzEhgKC2V4cGxhbmF0aW9uGAEgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAIgASgJQg4KDF9leHBsYW5hdGlvbiKTAQoZU3RhcnRHcmluZEV4ZWN1dGlvblJlc3VsdBI3CgdzdWNjZXNzGAEgASgLMiQuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvblN1Y2Nlc3NIABIzCgVlcnJvchgCIAEoCzIiLmFnZW50LnYxLlN0YXJ0R3JpbmRFeGVjdXRpb25FcnJvckgAQggKBnJlc3VsdCIcChpTdGFydEdyaW5kRXhlY3V0aW9uU3VjY2VzcyIpChhTdGFydEdyaW5kRXhlY3V0aW9uRXJyb3ISDQoFZXJyb3IYASABKAkigwEKG1N0YXJ0R3JpbmRFeGVjdXRpb25Ub29sQ2FsbBIvCgRhcmdzGAEgASgLMiEuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvbkFyZ3MSMwoGcmVzdWx0GAIgASgLMiMuYWdlbnQudjEuU3RhcnRHcmluZEV4ZWN1dGlvblJlc3VsdCJYChZTdGFydEdyaW5kUGxhbm5pbmdBcmdzEhgKC2V4cGxhbmF0aW9uGAEgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAIgASgJQg4KDF9leHBsYW5hdGlvbiKQAQoYU3RhcnRHcmluZFBsYW5uaW5nUmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdTdWNjZXNzSAASMgoFZXJyb3IYAiABKAsyIS5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdFcnJvckgAQggKBnJlc3VsdCIbChlTdGFydEdyaW5kUGxhbm5pbmdTdWNjZXNzIigKF1N0YXJ0R3JpbmRQbGFubmluZ0Vycm9yEg0KBWVycm9yGAEgASgJIoABChpTdGFydEdyaW5kUGxhbm5pbmdUb29sQ2FsbBIuCgRhcmdzGAEgASgLMiAuYWdlbnQudjEuU3RhcnRHcmluZFBsYW5uaW5nQXJncxIyCgZyZXN1bHQYAiABKAsyIi5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdSZXN1bHQinAEKCFRhc2tBcmdzEhMKC2Rlc2NyaXB0aW9uGAEgASgJEg4KBnByb21wdBgCIAEoCRItCg1zdWJhZ2VudF90eXBlGAMgASgLMhYuYWdlbnQudjEuU3ViYWdlbnRUeXBlEhIKBW1vZGVsGAQgASgJSACIAQESEwoGcmVzdW1lGAUgASgJSAGIAQFCCAoGX21vZGVsQgkKB19yZXN1bWUiqgEKC1Rhc2tTdWNjZXNzEjYKEmNvbnZlcnNhdGlvbl9zdGVwcxgBIAMoCzIaLmFnZW50LnYxLkNvbnZlcnNhdGlvblN0ZXASFQoIYWdlbnRfaWQYAiABKAlIAIgBARIVCg1pc19iYWNrZ3JvdW5kGAMgASgIEhgKC2R1cmF0aW9uX21zGAQgASgESAGIAQFCCwoJX2FnZW50X2lkQg4KDF9kdXJhdGlvbl9tcyIaCglUYXNrRXJyb3ISDQoFZXJyb3IYASABKAkiZgoKVGFza1Jlc3VsdBIoCgdzdWNjZXNzGAEgASgLMhUuYWdlbnQudjEuVGFza1N1Y2Nlc3NIABIkCgVlcnJvchgCIAEoCzITLmFnZW50LnYxLlRhc2tFcnJvckgAQggKBnJlc3VsdCJWCgxUYXNrVG9vbENhbGwSIAoEYXJncxgBIAEoCzISLmFnZW50LnYxLlRhc2tBcmdzEiQKBnJlc3VsdBgCIAEoCzIULmFnZW50LnYxLlRhc2tSZXN1bHQiTAoRVGFza1Rvb2xDYWxsRGVsdGESNwoSaW50ZXJhY3Rpb25fdXBkYXRlGAEgASgLMhsuYWdlbnQudjEuSW50ZXJhY3Rpb25VcGRhdGUihhQKCFRvb2xDYWxsEjIKD3NoZWxsX3Rvb2xfY2FsbBgBIAEoCzIXLmFnZW50LnYxLlNoZWxsVG9vbENhbGxIABI0ChBkZWxldGVfdG9vbF9jYWxsGAMgASgLMhguYWdlbnQudjEuRGVsZXRlVG9vbENhbGxIABIwCg5nbG9iX3Rvb2xfY2FsbBgEIAEoCzIWLmFnZW50LnYxLkdsb2JUb29sQ2FsbEgAEjAKDmdyZXBfdG9vbF9jYWxsGAUgASgLMhYuYWdlbnQudjEuR3JlcFRvb2xDYWxsSAASMAoOcmVhZF90b29sX2NhbGwYCCABKAsyFi5hZ2VudC52MS5SZWFkVG9vbENhbGxIABI/ChZ1cGRhdGVfdG9kb3NfdG9vbF9jYWxsGAkgASgLMh0uYWdlbnQudjEuVXBkYXRlVG9kb3NUb29sQ2FsbEgAEjsKFHJlYWRfdG9kb3NfdG9vbF9jYWxsGAogASgLMhsuYWdlbnQudjEuUmVhZFRvZG9zVG9vbENhbGxIABIwCg5lZGl0X3Rvb2xfY2FsbBgMIAEoCzIWLmFnZW50LnYxLkVkaXRUb29sQ2FsbEgAEiwKDGxzX3Rvb2xfY2FsbBgNIAEoCzIULmFnZW50LnYxLkxzVG9vbENhbGxIABI7ChRyZWFkX2xpbnRzX3Rvb2xfY2FsbBgOIAEoCzIbLmFnZW50LnYxLlJlYWRMaW50c1Rvb2xDYWxsSAASLgoNbWNwX3Rvb2xfY2FsbBgPIAEoCzIVLmFnZW50LnYxLk1jcFRvb2xDYWxsSAASOwoUc2VtX3NlYXJjaF90b29sX2NhbGwYECABKAsyGy5hZ2VudC52MS5TZW1TZWFyY2hUb29sQ2FsbEgAEj0KFWNyZWF0ZV9wbGFuX3Rvb2xfY2FsbBgRIAEoCzIcLmFnZW50LnYxLkNyZWF0ZVBsYW5Ub29sQ2FsbEgAEjsKFHdlYl9zZWFyY2hfdG9vbF9jYWxsGBIgASgLMhsuYWdlbnQudjEuV2ViU2VhcmNoVG9vbENhbGxIABIwCg50YXNrX3Rvb2xfY2FsbBgTIAEoCzIWLmFnZW50LnYxLlRhc2tUb29sQ2FsbEgAEkoKHGxpc3RfbWNwX3Jlc291cmNlc190b29sX2NhbGwYFCABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzVG9vbENhbGxIABJIChtyZWFkX21jcF9yZXNvdXJjZV90b29sX2NhbGwYFSABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VUb29sQ2FsbEgAEkYKGmFwcGx5X2FnZW50X2RpZmZfdG9vbF9jYWxsGBYgASgLMiAuYWdlbnQudjEuQXBwbHlBZ2VudERpZmZUb29sQ2FsbEgAEj8KFmFza19xdWVzdGlvbl90b29sX2NhbGwYFyABKAsyHS5hZ2VudC52MS5Bc2tRdWVzdGlvblRvb2xDYWxsSAASMgoPZmV0Y2hfdG9vbF9jYWxsGBggASgLMhcuYWdlbnQudjEuRmV0Y2hUb29sQ2FsbEgAEj0KFXN3aXRjaF9tb2RlX3Rvb2xfY2FsbBgZIAEoCzIcLmFnZW50LnYxLlN3aXRjaE1vZGVUb29sQ2FsbEgAEjsKFGV4YV9zZWFyY2hfdG9vbF9jYWxsGBogASgLMhsuYWdlbnQudjEuRXhhU2VhcmNoVG9vbENhbGxIABI5ChNleGFfZmV0Y2hfdG9vbF9jYWxsGBsgASgLMhouYWdlbnQudjEuRXhhRmV0Y2hUb29sQ2FsbEgAEkMKGGdlbmVyYXRlX2ltYWdlX3Rvb2xfY2FsbBgcIAEoCzIfLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VUb29sQ2FsbEgAEkEKF3JlY29yZF9zY3JlZW5fdG9vbF9jYWxsGB0gASgLMh4uYWdlbnQudjEuUmVjb3JkU2NyZWVuVG9vbENhbGxIABI/ChZjb21wdXRlcl91c2VfdG9vbF9jYWxsGB4gASgLMh0uYWdlbnQudjEuQ29tcHV0ZXJVc2VUb29sQ2FsbEgAEkgKG3dyaXRlX3NoZWxsX3N0ZGluX3Rvb2xfY2FsbBgfIAEoCzIhLmFnZW50LnYxLldyaXRlU2hlbGxTdGRpblRvb2xDYWxsSAASNgoRcmVmbGVjdF90b29sX2NhbGwYICABKAsyGS5hZ2VudC52MS5SZWZsZWN0VG9vbENhbGxIABJOCh5zZXR1cF92bV9lbnZpcm9ubWVudF90b29sX2NhbGwYISABKAsyJC5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRUb29sQ2FsbEgAEjoKE3RydW5jYXRlZF90b29sX2NhbGwYIiABKAsyGy5hZ2VudC52MS5UcnVuY2F0ZWRUb29sQ2FsbEgAElAKH3N0YXJ0X2dyaW5kX2V4ZWN1dGlvbl90b29sX2NhbGwYIyABKAsyJS5hZ2VudC52MS5TdGFydEdyaW5kRXhlY3V0aW9uVG9vbENhbGxIABJOCh5zdGFydF9ncmluZF9wbGFubmluZ190b29sX2NhbGwYJCABKAsyJC5hZ2VudC52MS5TdGFydEdyaW5kUGxhbm5pbmdUb29sQ2FsbEgAEjUKEXBpX3JlYWRfdG9vbF9jYWxsGD0gASgLMhguYWdlbnQudjEuUGlSZWFkVG9vbENhbGxIABI1ChFwaV9iYXNoX3Rvb2xfY2FsbBg+IAEoCzIYLmFnZW50LnYxLlBpQmFzaFRvb2xDYWxsSAASNQoRcGlfZWRpdF90b29sX2NhbGwYPyABKAsyGC5hZ2VudC52MS5QaUVkaXRUb29sQ2FsbEgAEjcKEnBpX3dyaXRlX3Rvb2xfY2FsbBhAIAEoCzIZLmFnZW50LnYxLlBpV3JpdGVUb29sQ2FsbEgAEjUKEXBpX2dyZXBfdG9vbF9jYWxsGEEgASgLMhguYWdlbnQudjEuUGlHcmVwVG9vbENhbGxIABI1ChFwaV9maW5kX3Rvb2xfY2FsbBhCIAEoCzIYLmFnZW50LnYxLlBpRmluZFRvb2xDYWxsSAASMQoPcGlfbHNfdG9vbF9jYWxsGEMgASgLMhYuYWdlbnQudjEuUGlMc1Rvb2xDYWxsSAASPQoVY29ubmVjdF9zY21fdG9vbF9jYWxsGEQgASgLMhwuYWdlbnQudjEuQ29ubmVjdFNjbVRvb2xDYWxsSAASTwoec2VhcmNoX2NvbnZlcnNhdGlvbnNfdG9vbF9jYWxsGEUgASgLMiUuYWdlbnQudjEuU2VhcmNoQ29udmVyc2F0aW9uc1Rvb2xDYWxsSAASGQoMdG9vbF9jYWxsX2lkGDkgASgJSAGIAQFCBgoEdG9vbEIPCg1fdG9vbF9jYWxsX2lkIhcKFVRydW5jYXRlZFRvb2xDYWxsQXJncyIaChhUcnVuY2F0ZWRUb29sQ2FsbFN1Y2Nlc3MiJwoWVHJ1bmNhdGVkVG9vbENhbGxFcnJvchINCgVlcnJvchgBIAEoCSKNAQoXVHJ1bmNhdGVkVG9vbENhbGxSZXN1bHQSNQoHc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLlRydW5jYXRlZFRvb2xDYWxsU3VjY2Vzc0gAEjEKBWVycm9yGAIgASgLMiAuYWdlbnQudjEuVHJ1bmNhdGVkVG9vbENhbGxFcnJvckgAQggKBnJlc3VsdCKUAQoRVHJ1bmNhdGVkVG9vbENhbGwSHQoVb3JpZ2luYWxfc3RlcF9ibG9iX2lkGAEgASgMEi0KBGFyZ3MYAiABKAsyHy5hZ2VudC52MS5UcnVuY2F0ZWRUb29sQ2FsbEFyZ3MSMQoGcmVzdWx0GAMgASgLMiEuYWdlbnQudjEuVHJ1bmNhdGVkVG9vbENhbGxSZXN1bHQi0QEKDVRvb2xDYWxsRGVsdGESPQoVc2hlbGxfdG9vbF9jYWxsX2RlbHRhGAEgASgLMhwuYWdlbnQudjEuU2hlbGxUb29sQ2FsbERlbHRhSAASOwoUdGFza190b29sX2NhbGxfZGVsdGEYAiABKAsyGy5hZ2VudC52MS5UYXNrVG9vbENhbGxEZWx0YUgAEjsKFGVkaXRfdG9vbF9jYWxsX2RlbHRhGAMgASgLMhsuYWdlbnQudjEuRWRpdFRvb2xDYWxsRGVsdGFIAEIHCgVkZWx0YSK2AQoQQ29udmVyc2F0aW9uU3RlcBI3ChFhc3Npc3RhbnRfbWVzc2FnZRgBIAEoCzIaLmFnZW50LnYxLkFzc2lzdGFudE1lc3NhZ2VIABInCgl0b29sX2NhbGwYAiABKAsyEi5hZ2VudC52MS5Ub29sQ2FsbEgAEjUKEHRoaW5raW5nX21lc3NhZ2UYAyABKAsyGS5hZ2VudC52MS5UaGlua2luZ01lc3NhZ2VIAEIJCgdtZXNzYWdlIoEEChJDb252ZXJzYXRpb25BY3Rpb24SOgoTdXNlcl9tZXNzYWdlX2FjdGlvbhgBIAEoCzIbLmFnZW50LnYxLlVzZXJNZXNzYWdlQWN0aW9uSAASLwoNcmVzdW1lX2FjdGlvbhgCIAEoCzIWLmFnZW50LnYxLlJlc3VtZUFjdGlvbkgAEi8KDWNhbmNlbF9hY3Rpb24YAyABKAsyFi5hZ2VudC52MS5DYW5jZWxBY3Rpb25IABI1ChBzdW1tYXJpemVfYWN0aW9uGAQgASgLMhkuYWdlbnQudjEuU3VtbWFyaXplQWN0aW9uSAASPAoUc2hlbGxfY29tbWFuZF9hY3Rpb24YBSABKAsyHC5hZ2VudC52MS5TaGVsbENvbW1hbmRBY3Rpb25IABI2ChFzdGFydF9wbGFuX2FjdGlvbhgGIAEoCzIZLmFnZW50LnYxLlN0YXJ0UGxhbkFjdGlvbkgAEjoKE2V4ZWN1dGVfcGxhbl9hY3Rpb24YByABKAsyGy5hZ2VudC52MS5FeGVjdXRlUGxhbkFjdGlvbkgAEloKJGFzeW5jX2Fza19xdWVzdGlvbl9jb21wbGV0aW9uX2FjdGlvbhgIIAEoCzIqLmFnZW50LnYxLkFzeW5jQXNrUXVlc3Rpb25Db21wbGV0aW9uQWN0aW9uSABCCAoGYWN0aW9uIr8BChFVc2VyTWVzc2FnZUFjdGlvbhIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZRIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBIpChxzZW5kX3RvX2ludGVyYWN0aW9uX2xpc3RlbmVyGAMgASgISACIAQFCHwodX3NlbmRfdG9faW50ZXJhY3Rpb25fbGlzdGVuZXIiDgoMQ2FuY2VsQWN0aW9uIkEKDFJlc3VtZUFjdGlvbhIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dCKgAQogQXN5bmNBc2tRdWVzdGlvbkNvbXBsZXRpb25BY3Rpb24SHQoVb3JpZ2luYWxfdG9vbF9jYWxsX2lkGAEgASgJEjAKDW9yaWdpbmFsX2FyZ3MYAiABKAsyGS5hZ2VudC52MS5Bc2tRdWVzdGlvbkFyZ3MSKwoGcmVzdWx0GAMgASgLMhsuYWdlbnQudjEuQXNrUXVlc3Rpb25SZXN1bHQiEQoPU3VtbWFyaXplQWN0aW9uIlQKElNoZWxsQ29tbWFuZEFjdGlvbhItCg1zaGVsbF9jb21tYW5kGAEgASgLMhYuYWdlbnQudjEuU2hlbGxDb21tYW5kEg8KB2V4ZWNfaWQYAiABKAkiggEKD1N0YXJ0UGxhbkFjdGlvbhIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZRIxCg9yZXF1ZXN0X2NvbnRleHQYAiABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBIPCgdpc19zcGVjGAMgASgIIuIBChFFeGVjdXRlUGxhbkFjdGlvbhIxCg9yZXF1ZXN0X2NvbnRleHQYASABKAsyGC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dBItCgRwbGFuGAIgASgLMhouYWdlbnQudjEuQ29udmVyc2F0aW9uUGxhbkgAiAEBEhoKDXBsYW5fZmlsZV91cmkYAyABKAlIAYgBARIeChFwbGFuX2ZpbGVfY29udGVudBgEIAEoCUgCiAEBQgcKBV9wbGFuQhAKDl9wbGFuX2ZpbGVfdXJpQhQKEl9wbGFuX2ZpbGVfY29udGVudCLoAgoLVXNlck1lc3NhZ2USDAoEdGV4dBgBIAEoCRISCgptZXNzYWdlX2lkGAIgASgJEjgKEHNlbGVjdGVkX2NvbnRleHQYAyABKAsyGS5hZ2VudC52MS5TZWxlY3RlZENvbnRleHRIAIgBARIMCgRtb2RlGAQgASgFEh0KEGlzX3NpbXVsYXRlZF9tc2cYBSABKAhIAYgBARIfChJiZXN0X29mX25fZ3JvdXBfaWQYBiABKAlIAogBARIoCht0cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb24YByABKAhIA4gBARIWCglyaWNoX3RleHQYCCABKAlIBIgBAUITChFfc2VsZWN0ZWRfY29udGV4dEITChFfaXNfc2ltdWxhdGVkX21zZ0IVChNfYmVzdF9vZl9uX2dyb3VwX2lkQh4KHF90cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb25CDAoKX3JpY2hfdGV4dCIgChBBc3Npc3RhbnRNZXNzYWdlEgwKBHRleHQYASABKAkiNAoPVGhpbmtpbmdNZXNzYWdlEgwKBHRleHQYASABKAkSEwoLZHVyYXRpb25fbXMYAiABKA0iHwoMU2hlbGxDb21tYW5kEg8KB2NvbW1hbmQYASABKAkiQAoLU2hlbGxPdXRwdXQSDgoGc3Rkb3V0GAEgASgJEg4KBnN0ZGVychgCIAEoCRIRCglleGl0X2NvZGUYAyABKAUiogEKEENvbnZlcnNhdGlvblR1cm4SQgoXYWdlbnRfY29udmVyc2F0aW9uX3R1cm4YASABKAsyHy5hZ2VudC52MS5BZ2VudENvbnZlcnNhdGlvblR1cm5IABJCChdzaGVsbF9jb252ZXJzYXRpb25fdHVybhgCIAEoCzIfLmFnZW50LnYxLlNoZWxsQ29udmVyc2F0aW9uVHVybkgAQgYKBHR1cm4iIAoQQ29udmVyc2F0aW9uUGxhbhIMCgRwbGFuGAEgASgJIr0BChlDb252ZXJzYXRpb25UdXJuU3RydWN0dXJlEksKF2FnZW50X2NvbnZlcnNhdGlvbl90dXJuGAEgASgLMiguYWdlbnQudjEuQWdlbnRDb252ZXJzYXRpb25UdXJuU3RydWN0dXJlSAASSwoXc2hlbGxfY29udmVyc2F0aW9uX3R1cm4YAiABKAsyKC5hZ2VudC52MS5TaGVsbENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmVIAEIGCgR0dXJuIpcBChVBZ2VudENvbnZlcnNhdGlvblR1cm4SKwoMdXNlcl9tZXNzYWdlGAEgASgLMhUuYWdlbnQudjEuVXNlck1lc3NhZ2USKQoFc3RlcHMYAiADKAsyGi5hZ2VudC52MS5Db252ZXJzYXRpb25TdGVwEhcKCnJlcXVlc3RfaWQYAyABKAlIAIgBAUINCgtfcmVxdWVzdF9pZCJtCh5BZ2VudENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmUSFAoMdXNlcl9tZXNzYWdlGAEgASgMEg0KBXN0ZXBzGAIgAygMEhcKCnJlcXVlc3RfaWQYAyABKAlIAIgBAUINCgtfcmVxdWVzdF9pZCJzChVTaGVsbENvbnZlcnNhdGlvblR1cm4SLQoNc2hlbGxfY29tbWFuZBgBIAEoCzIWLmFnZW50LnYxLlNoZWxsQ29tbWFuZBIrCgxzaGVsbF9vdXRwdXQYAiABKAsyFS5hZ2VudC52MS5TaGVsbE91dHB1dCJNCh5TaGVsbENvbnZlcnNhdGlvblR1cm5TdHJ1Y3R1cmUSFQoNc2hlbGxfY29tbWFuZBgBIAEoDBIUCgxzaGVsbF9vdXRwdXQYAiABKAwiJgoTQ29udmVyc2F0aW9uU3VtbWFyeRIPCgdzdW1tYXJ5GAEgASgJIngKGkNvbnZlcnNhdGlvblN1bW1hcnlBcmNoaXZlEhsKE3N1bW1hcml6ZWRfbWVzc2FnZXMYASADKAwSDwoHc3VtbWFyeRgCIAEoCRITCgt3aW5kb3dfdGFpbBgDIAEoDRIXCg9zdW1tYXJ5X21lc3NhZ2UYBCABKAwiQwoYQ29udmVyc2F0aW9uVG9rZW5EZXRhaWxzEhMKC3VzZWRfdG9rZW5zGAEgASgNEhIKCm1heF90b2tlbnMYAiABKA0iXwoJRmlsZVN0YXRlEhQKB2NvbnRlbnQYASABKAlIAIgBARIcCg9pbml0aWFsX2NvbnRlbnQYAiABKAlIAYgBAUIKCghfY29udGVudEISChBfaW5pdGlhbF9jb250ZW50ImgKEkZpbGVTdGF0ZVN0cnVjdHVyZRIUCgdjb250ZW50GAEgASgMSACIAQESHAoPaW5pdGlhbF9jb250ZW50GAIgASgMSAGIAQFCCgoIX2NvbnRlbnRCEgoQX2luaXRpYWxfY29udGVudCI3CgpTdGVwVGltaW5nEhMKC2R1cmF0aW9uX21zGAEgASgEEhQKDHRpbWVzdGFtcF9tcxgCIAEoBCL2BAoRQ29udmVyc2F0aW9uU3RhdGUSIQoZcm9vdF9wcm9tcHRfbWVzc2FnZXNfanNvbhgBIAMoCRIpCgV0dXJucxgIIAMoCzIaLmFnZW50LnYxLkNvbnZlcnNhdGlvblR1cm4SIQoFdG9kb3MYAyADKAsyEi5hZ2VudC52MS5Ub2RvSXRlbRIaChJwZW5kaW5nX3Rvb2xfY2FsbHMYBCADKAkSOQoNdG9rZW5fZGV0YWlscxgFIAEoCzIiLmFnZW50LnYxLkNvbnZlcnNhdGlvblRva2VuRGV0YWlscxIzCgdzdW1tYXJ5GAYgASgLMh0uYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUgAiAEBEi0KBHBsYW4YByABKAsyGi5hZ2VudC52MS5Db252ZXJzYXRpb25QbGFuSAGIAQESQgoPc3VtbWFyeV9hcmNoaXZlGAkgASgLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUFyY2hpdmVIAogBARJACgtmaWxlX3N0YXRlcxgKIAMoCzIrLmFnZW50LnYxLkNvbnZlcnNhdGlvblN0YXRlLkZpbGVTdGF0ZXNFbnRyeRI+ChBzdW1tYXJ5X2FyY2hpdmVzGAsgAygLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3VtbWFyeUFyY2hpdmUaRgoPRmlsZVN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRIiCgV2YWx1ZRgCIAEoCzITLmFnZW50LnYxLkZpbGVTdGF0ZToCOAFCCgoIX3N1bW1hcnlCBwoFX3BsYW5CEgoQX3N1bW1hcnlfYXJjaGl2ZSLHAQoWU3ViYWdlbnRQZXJzaXN0ZWRTdGF0ZRJAChJjb252ZXJzYXRpb25fc3RhdGUYASABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZRIcChRjcmVhdGVkX3RpbWVzdGFtcF9tcxgCIAEoBBIeChZsYXN0X3VzZWRfdGltZXN0YW1wX21zGAMgASgEEi0KDXN1YmFnZW50X3R5cGUYBCABKAsyFi5hZ2VudC52MS5TdWJhZ2VudFR5cGUitwcKGkNvbnZlcnNhdGlvblN0YXRlU3RydWN0dXJlEhEKCXR1cm5zX29sZBgCIAMoDBIhChlyb290X3Byb21wdF9tZXNzYWdlc19qc29uGAEgAygMEg0KBXR1cm5zGAggAygMEg0KBXRvZG9zGAMgAygMEhoKEnBlbmRpbmdfdG9vbF9jYWxscxgEIAMoCRI5Cg10b2tlbl9kZXRhaWxzGAUgASgLMiIuYWdlbnQudjEuQ29udmVyc2F0aW9uVG9rZW5EZXRhaWxzEhQKB3N1bW1hcnkYBiABKAxIAIgBARIRCgRwbGFuGAcgASgMSAGIAQESHwoXcHJldmlvdXNfd29ya3NwYWNlX3VyaXMYCSADKAkSEQoEbW9kZRgKIAEoBUgCiAEBEhwKD3N1bW1hcnlfYXJjaGl2ZRgLIAEoDEgDiAEBEkkKC2ZpbGVfc3RhdGVzGAwgAygLMjQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUuRmlsZVN0YXRlc0VudHJ5Ek4KDmZpbGVfc3RhdGVzX3YyGA8gAygLMjYuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUuRmlsZVN0YXRlc1YyRW50cnkSGAoQc3VtbWFyeV9hcmNoaXZlcxgNIAMoDBIqCgx0dXJuX3RpbWluZ3MYDiADKAsyFC5hZ2VudC52MS5TdGVwVGltaW5nElEKD3N1YmFnZW50X3N0YXRlcxgQIAMoCzI4LmFnZW50LnYxLkNvbnZlcnNhdGlvblN0YXRlU3RydWN0dXJlLlN1YmFnZW50U3RhdGVzRW50cnkSGgoSc2VsZl9zdW1tYXJ5X2NvdW50GBEgASgNEhIKCnJlYWRfcGF0aHMYEiADKAkaMQoPRmlsZVN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRINCgV2YWx1ZRgCIAEoDDoCOAEaUQoRRmlsZVN0YXRlc1YyRW50cnkSCwoDa2V5GAEgASgJEisKBXZhbHVlGAIgASgLMhwuYWdlbnQudjEuRmlsZVN0YXRlU3RydWN0dXJlOgI4ARpXChNTdWJhZ2VudFN0YXRlc0VudHJ5EgsKA2tleRgBIAEoCRIvCgV2YWx1ZRgCIAEoCzIgLmFnZW50LnYxLlN1YmFnZW50UGVyc2lzdGVkU3RhdGU6AjgBQgoKCF9zdW1tYXJ5QgcKBV9wbGFuQgcKBV9tb2RlQhIKEF9zdW1tYXJ5X2FyY2hpdmUiEQoPVGhpbmtpbmdEZXRhaWxzIkgKEUFwaUtleUNyZWRlbnRpYWxzEg8KB2FwaV9rZXkYASABKAkSFQoIYmFzZV91cmwYAiABKAlIAIgBAUILCglfYmFzZV91cmwiSQoQQXp1cmVDcmVkZW50aWFscxIPCgdhcGlfa2V5GAEgASgJEhAKCGJhc2VfdXJsGAIgASgJEhIKCmRlcGxveW1lbnQYAyABKAkiegoSQmVkcm9ja0NyZWRlbnRpYWxzEhIKCmFjY2Vzc19rZXkYASABKAkSEgoKc2VjcmV0X2tleRgCIAEoCRIOCgZyZWdpb24YAyABKAkSGgoNc2Vzc2lvbl90b2tlbhgEIAEoCUgAiAEBQhAKDl9zZXNzaW9uX3Rva2VuIrEDCgxNb2RlbERldGFpbHMSEAoIbW9kZWxfaWQYASABKAkSGAoQZGlzcGxheV9tb2RlbF9pZBgDIAEoCRIUCgxkaXNwbGF5X25hbWUYBCABKAkSGgoSZGlzcGxheV9uYW1lX3Nob3J0GAUgASgJEg8KB2FsaWFzZXMYBiADKAkSOAoQdGhpbmtpbmdfZGV0YWlscxgCIAEoCzIZLmFnZW50LnYxLlRoaW5raW5nRGV0YWlsc0gBiAEBEhUKCG1heF9tb2RlGAcgASgISAKIAQESOgoTYXBpX2tleV9jcmVkZW50aWFscxgIIAEoCzIbLmFnZW50LnYxLkFwaUtleUNyZWRlbnRpYWxzSAASNwoRYXp1cmVfY3JlZGVudGlhbHMYCSABKAsyGi5hZ2VudC52MS5BenVyZUNyZWRlbnRpYWxzSAASOwoTYmVkcm9ja19jcmVkZW50aWFscxgKIAEoCzIcLmFnZW50LnYxLkJlZHJvY2tDcmVkZW50aWFsc0gAQg0KC2NyZWRlbnRpYWxzQhMKEV90aGlua2luZ19kZXRhaWxzQgsKCV9tYXhfbW9kZSK3AgoOUmVxdWVzdGVkTW9kZWwSEAoIbW9kZWxfaWQYASABKAkSEAoIbWF4X21vZGUYAiABKAgSQAoKcGFyYW1ldGVycxgDIAMoCzIsLmFnZW50LnYxLlJlcXVlc3RlZE1vZGVsX01vZGVsUGFyYW1ldGVyYnl0ZXMSOgoTYXBpX2tleV9jcmVkZW50aWFscxgEIAEoCzIbLmFnZW50LnYxLkFwaUtleUNyZWRlbnRpYWxzSAASNwoRYXp1cmVfY3JlZGVudGlhbHMYBSABKAsyGi5hZ2VudC52MS5BenVyZUNyZWRlbnRpYWxzSAASOwoTYmVkcm9ja19jcmVkZW50aWFscxgGIAEoCzIcLmFnZW50LnYxLkJlZHJvY2tDcmVkZW50aWFsc0gAQg0KC2NyZWRlbnRpYWxzIj8KIlJlcXVlc3RlZE1vZGVsX01vZGVsUGFyYW1ldGVyYnl0ZXMSCgoCaWQYASABKAkSDQoFdmFsdWUYAiABKAkiuQQKD0FnZW50UnVuUmVxdWVzdBJAChJjb252ZXJzYXRpb25fc3RhdGUYASABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZRIsCgZhY3Rpb24YAiABKAsyHC5hZ2VudC52MS5Db252ZXJzYXRpb25BY3Rpb24SLQoNbW9kZWxfZGV0YWlscxgDIAEoCzIWLmFnZW50LnYxLk1vZGVsRGV0YWlscxI2Cg9yZXF1ZXN0ZWRfbW9kZWwYCSABKAsyGC5hZ2VudC52MS5SZXF1ZXN0ZWRNb2RlbEgAiAEBEiUKCW1jcF90b29scxgEIAEoCzISLmFnZW50LnYxLk1jcFRvb2xzEhwKD2NvbnZlcnNhdGlvbl9pZBgFIAEoCUgBiAEBEkQKF21jcF9maWxlX3N5c3RlbV9vcHRpb25zGAYgASgLMh4uYWdlbnQudjEuTWNwRmlsZVN5c3RlbU9wdGlvbnNIAogBARIyCg1za2lsbF9vcHRpb25zGAcgASgLMhYuYWdlbnQudjEuU2tpbGxPcHRpb25zSAOIAQESIQoUY3VzdG9tX3N5c3RlbV9wcm9tcHQYCCABKAlIBIgBAUISChBfcmVxdWVzdGVkX21vZGVsQhIKEF9jb252ZXJzYXRpb25faWRCGgoYX21jcF9maWxlX3N5c3RlbV9vcHRpb25zQhAKDl9za2lsbF9vcHRpb25zQhcKFV9jdXN0b21fc3lzdGVtX3Byb21wdCIfCg9UZXh0RGVsdGFVcGRhdGUSDAoEdGV4dBgBIAEoCSJmChVUb29sQ2FsbFN0YXJ0ZWRVcGRhdGUSDwoHY2FsbF9pZBgBIAEoCRIlCgl0b29sX2NhbGwYAiABKAsyEi5hZ2VudC52MS5Ub29sQ2FsbBIVCg1tb2RlbF9jYWxsX2lkGAMgASgJImgKF1Rvb2xDYWxsQ29tcGxldGVkVXBkYXRlEg8KB2NhbGxfaWQYASABKAkSJQoJdG9vbF9jYWxsGAIgASgLMhIuYWdlbnQudjEuVG9vbENhbGwSFQoNbW9kZWxfY2FsbF9pZBgDIAEoCSJvChNUb29sQ2FsbERlbHRhVXBkYXRlEg8KB2NhbGxfaWQYASABKAkSMAoPdG9vbF9jYWxsX2RlbHRhGAIgASgLMhcuYWdlbnQudjEuVG9vbENhbGxEZWx0YRIVCg1tb2RlbF9jYWxsX2lkGAMgASgJIn8KFVBhcnRpYWxUb29sQ2FsbFVwZGF0ZRIPCgdjYWxsX2lkGAEgASgJEiUKCXRvb2xfY2FsbBgCIAEoCzISLmFnZW50LnYxLlRvb2xDYWxsEhcKD2FyZ3NfdGV4dF9kZWx0YRgDIAEoCRIVCg1tb2RlbF9jYWxsX2lkGAQgASgJIiMKE1RoaW5raW5nRGVsdGFVcGRhdGUSDAoEdGV4dBgBIAEoCSI3ChdUaGlua2luZ0NvbXBsZXRlZFVwZGF0ZRIcChR0aGlua2luZ19kdXJhdGlvbl9tcxgBIAEoBSIiChBUb2tlbkRlbHRhVXBkYXRlEg4KBnRva2VucxgBIAEoBSIgCg1TdW1tYXJ5VXBkYXRlEg8KB3N1bW1hcnkYASABKAkiFgoUU3VtbWFyeVN0YXJ0ZWRVcGRhdGUiEQoPSGVhcnRiZWF0VXBkYXRlIhgKFlN1bW1hcnlDb21wbGV0ZWRVcGRhdGUi1wEKFlNoZWxsT3V0cHV0RGVsdGFVcGRhdGUSLQoGc3Rkb3V0GAEgASgLMhsuYWdlbnQudjEuU2hlbGxTdHJlYW1TdGRvdXRIABItCgZzdGRlcnIYAiABKAsyGy5hZ2VudC52MS5TaGVsbFN0cmVhbVN0ZGVyckgAEikKBGV4aXQYAyABKAsyGS5hZ2VudC52MS5TaGVsbFN0cmVhbUV4aXRIABIrCgVzdGFydBgEIAEoCzIaLmFnZW50LnYxLlNoZWxsU3RyZWFtU3RhcnRIAEIHCgVldmVudCIRCg9UdXJuRW5kZWRVcGRhdGUiSAoZVXNlck1lc3NhZ2VBcHBlbmRlZFVwZGF0ZRIrCgx1c2VyX21lc3NhZ2UYASABKAsyFS5hZ2VudC52MS5Vc2VyTWVzc2FnZSIkChFTdGVwU3RhcnRlZFVwZGF0ZRIPCgdzdGVwX2lkGAEgASgEIkAKE1N0ZXBDb21wbGV0ZWRVcGRhdGUSDwoHc3RlcF9pZBgBIAEoBBIYChBzdGVwX2R1cmF0aW9uX21zGAIgASgDIu8HChFJbnRlcmFjdGlvblVwZGF0ZRIvCgp0ZXh0X2RlbHRhGAEgASgLMhkuYWdlbnQudjEuVGV4dERlbHRhVXBkYXRlSAASPAoRcGFydGlhbF90b29sX2NhbGwYByABKAsyHy5hZ2VudC52MS5QYXJ0aWFsVG9vbENhbGxVcGRhdGVIABI4Cg90b29sX2NhbGxfZGVsdGEYDyABKAsyHS5hZ2VudC52MS5Ub29sQ2FsbERlbHRhVXBkYXRlSAASPAoRdG9vbF9jYWxsX3N0YXJ0ZWQYAiABKAsyHy5hZ2VudC52MS5Ub29sQ2FsbFN0YXJ0ZWRVcGRhdGVIABJAChN0b29sX2NhbGxfY29tcGxldGVkGAMgASgLMiEuYWdlbnQudjEuVG9vbENhbGxDb21wbGV0ZWRVcGRhdGVIABI3Cg50aGlua2luZ19kZWx0YRgEIAEoCzIdLmFnZW50LnYxLlRoaW5raW5nRGVsdGFVcGRhdGVIABI/ChJ0aGlua2luZ19jb21wbGV0ZWQYBSABKAsyIS5hZ2VudC52MS5UaGlua2luZ0NvbXBsZXRlZFVwZGF0ZUgAEkQKFXVzZXJfbWVzc2FnZV9hcHBlbmRlZBgGIAEoCzIjLmFnZW50LnYxLlVzZXJNZXNzYWdlQXBwZW5kZWRVcGRhdGVIABIxCgt0b2tlbl9kZWx0YRgIIAEoCzIaLmFnZW50LnYxLlRva2VuRGVsdGFVcGRhdGVIABIqCgdzdW1tYXJ5GAkgASgLMhcuYWdlbnQudjEuU3VtbWFyeVVwZGF0ZUgAEjkKD3N1bW1hcnlfc3RhcnRlZBgKIAEoCzIeLmFnZW50LnYxLlN1bW1hcnlTdGFydGVkVXBkYXRlSAASPQoRc3VtbWFyeV9jb21wbGV0ZWQYCyABKAsyIC5hZ2VudC52MS5TdW1tYXJ5Q29tcGxldGVkVXBkYXRlSAASPgoSc2hlbGxfb3V0cHV0X2RlbHRhGAwgASgLMiAuYWdlbnQudjEuU2hlbGxPdXRwdXREZWx0YVVwZGF0ZUgAEi4KCWhlYXJ0YmVhdBgNIAEoCzIZLmFnZW50LnYxLkhlYXJ0YmVhdFVwZGF0ZUgAEi8KCnR1cm5fZW5kZWQYDiABKAsyGS5hZ2VudC52MS5UdXJuRW5kZWRVcGRhdGVIABIzCgxzdGVwX3N0YXJ0ZWQYECABKAsyGy5hZ2VudC52MS5TdGVwU3RhcnRlZFVwZGF0ZUgAEjcKDnN0ZXBfY29tcGxldGVkGBEgASgLMh0uYWdlbnQudjEuU3RlcENvbXBsZXRlZFVwZGF0ZUgAQgkKB21lc3NhZ2UimgQKEEludGVyYWN0aW9uUXVlcnkSCgoCaWQYASABKA0SQwoYd2ViX3NlYXJjaF9yZXF1ZXN0X3F1ZXJ5GAIgASgLMh8uYWdlbnQudjEuV2ViU2VhcmNoUmVxdWVzdFF1ZXJ5SAASTwoeYXNrX3F1ZXN0aW9uX2ludGVyYWN0aW9uX3F1ZXJ5GAMgASgLMiUuYWdlbnQudjEuQXNrUXVlc3Rpb25JbnRlcmFjdGlvblF1ZXJ5SAASRQoZc3dpdGNoX21vZGVfcmVxdWVzdF9xdWVyeRgEIAEoCzIgLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UXVlcnlIABJDChhleGFfc2VhcmNoX3JlcXVlc3RfcXVlcnkYBSABKAsyHy5hZ2VudC52MS5FeGFTZWFyY2hSZXF1ZXN0UXVlcnlIABJBChdleGFfZmV0Y2hfcmVxdWVzdF9xdWVyeRgGIAEoCzIeLmFnZW50LnYxLkV4YUZldGNoUmVxdWVzdFF1ZXJ5SAASRQoZY3JlYXRlX3BsYW5fcmVxdWVzdF9xdWVyeRgHIAEoCzIgLmFnZW50LnYxLkNyZWF0ZVBsYW5SZXF1ZXN0UXVlcnlIABJFChlzZXR1cF92bV9lbnZpcm9ubWVudF9hcmdzGAggASgLMiAuYWdlbnQudjEuU2V0dXBWbUVudmlyb25tZW50QXJnc0gAQgcKBXF1ZXJ5IsYEChNJbnRlcmFjdGlvblJlc3BvbnNlEgoKAmlkGAEgASgNEkkKG3dlYl9zZWFyY2hfcmVxdWVzdF9yZXNwb25zZRgCIAEoCzIiLmFnZW50LnYxLldlYlNlYXJjaFJlcXVlc3RSZXNwb25zZUgAElUKIWFza19xdWVzdGlvbl9pbnRlcmFjdGlvbl9yZXNwb25zZRgDIAEoCzIoLmFnZW50LnYxLkFza1F1ZXN0aW9uSW50ZXJhY3Rpb25SZXNwb25zZUgAEksKHHN3aXRjaF9tb2RlX3JlcXVlc3RfcmVzcG9uc2UYBCABKAsyIy5hZ2VudC52MS5Td2l0Y2hNb2RlUmVxdWVzdFJlc3BvbnNlSAASSQobZXhhX3NlYXJjaF9yZXF1ZXN0X3Jlc3BvbnNlGAUgASgLMiIuYWdlbnQudjEuRXhhU2VhcmNoUmVxdWVzdFJlc3BvbnNlSAASRwoaZXhhX2ZldGNoX3JlcXVlc3RfcmVzcG9uc2UYBiABKAsyIS5hZ2VudC52MS5FeGFGZXRjaFJlcXVlc3RSZXNwb25zZUgAEksKHGNyZWF0ZV9wbGFuX3JlcXVlc3RfcmVzcG9uc2UYByABKAsyIy5hZ2VudC52MS5DcmVhdGVQbGFuUmVxdWVzdFJlc3BvbnNlSAASSQobc2V0dXBfdm1fZW52aXJvbm1lbnRfcmVzdWx0GAggASgLMiIuYWdlbnQudjEuU2V0dXBWbUVudmlyb25tZW50UmVzdWx0SABCCAoGcmVzdWx0IlwKG0Fza1F1ZXN0aW9uSW50ZXJhY3Rpb25RdWVyeRInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSJNCh5Bc2tRdWVzdGlvbkludGVyYWN0aW9uUmVzcG9uc2USKwoGcmVzdWx0GAEgASgLMhsuYWdlbnQudjEuQXNrUXVlc3Rpb25SZXN1bHQiEQoPQ2xpZW50SGVhcnRiZWF0IsYECg5QcmV3YXJtUmVxdWVzdBItCg1tb2RlbF9kZXRhaWxzGAEgASgLMhYuYWdlbnQudjEuTW9kZWxEZXRhaWxzEjYKD3JlcXVlc3RlZF9tb2RlbBgJIAEoCzIYLmFnZW50LnYxLlJlcXVlc3RlZE1vZGVsSACIAQESHAoPY29udmVyc2F0aW9uX2lkGAIgASgJSAGIAQESQAoSY29udmVyc2F0aW9uX3N0YXRlGAMgASgLMiQuYWdlbnQudjEuQ29udmVyc2F0aW9uU3RhdGVTdHJ1Y3R1cmUSJQoJbWNwX3Rvb2xzGAQgASgLMhIuYWdlbnQudjEuTWNwVG9vbHMSRAoXbWNwX2ZpbGVfc3lzdGVtX29wdGlvbnMYBSABKAsyHi5hZ2VudC52MS5NY3BGaWxlU3lzdGVtT3B0aW9uc0gCiAEBEh8KEmJlc3Rfb2Zfbl9ncm91cF9pZBgGIAEoCUgDiAEBEigKG3RyeV91c2VfYmVzdF9vZl9uX3Byb21vdGlvbhgHIAEoCEgEiAEBEiEKFGN1c3RvbV9zeXN0ZW1fcHJvbXB0GAggASgJSAWIAQFCEgoQX3JlcXVlc3RlZF9tb2RlbEISChBfY29udmVyc2F0aW9uX2lkQhoKGF9tY3BfZmlsZV9zeXN0ZW1fb3B0aW9uc0IVChNfYmVzdF9vZl9uX2dyb3VwX2lkQh4KHF90cnlfdXNlX2Jlc3Rfb2Zfbl9wcm9tb3Rpb25CFwoVX2N1c3RvbV9zeXN0ZW1fcHJvbXB0Ih0KD0V4ZWNTZXJ2ZXJBYm9ydBIKCgJpZBgBIAEoDSJRChhFeGVjU2VydmVyQ29udHJvbE1lc3NhZ2USKgoFYWJvcnQYASABKAsyGS5hZ2VudC52MS5FeGVjU2VydmVyQWJvcnRIAEIJCgdtZXNzYWdlIvgDChJBZ2VudENsaWVudE1lc3NhZ2USMAoLcnVuX3JlcXVlc3QYASABKAsyGS5hZ2VudC52MS5BZ2VudFJ1blJlcXVlc3RIABI6ChNleGVjX2NsaWVudF9tZXNzYWdlGAIgASgLMhsuYWdlbnQudjEuRXhlY0NsaWVudE1lc3NhZ2VIABJJChtleGVjX2NsaWVudF9jb250cm9sX21lc3NhZ2UYBSABKAsyIi5hZ2VudC52MS5FeGVjQ2xpZW50Q29udHJvbE1lc3NhZ2VIABI2ChFrdl9jbGllbnRfbWVzc2FnZRgDIAEoCzIZLmFnZW50LnYxLkt2Q2xpZW50TWVzc2FnZUgAEjsKE2NvbnZlcnNhdGlvbl9hY3Rpb24YBCABKAsyHC5hZ2VudC52MS5Db252ZXJzYXRpb25BY3Rpb25IABI9ChRpbnRlcmFjdGlvbl9yZXNwb25zZRgGIAEoCzIdLmFnZW50LnYxLkludGVyYWN0aW9uUmVzcG9uc2VIABI1ChBjbGllbnRfaGVhcnRiZWF0GAcgASgLMhkuYWdlbnQudjEuQ2xpZW50SGVhcnRiZWF0SAASMwoPcHJld2FybV9yZXF1ZXN0GAggASgLMhguYWdlbnQudjEuUHJld2FybVJlcXVlc3RIAEIJCgdtZXNzYWdlIqIDChJBZ2VudFNlcnZlck1lc3NhZ2USOQoSaW50ZXJhY3Rpb25fdXBkYXRlGAEgASgLMhsuYWdlbnQudjEuSW50ZXJhY3Rpb25VcGRhdGVIABI6ChNleGVjX3NlcnZlcl9tZXNzYWdlGAIgASgLMhsuYWdlbnQudjEuRXhlY1NlcnZlck1lc3NhZ2VIABJJChtleGVjX3NlcnZlcl9jb250cm9sX21lc3NhZ2UYBSABKAsyIi5hZ2VudC52MS5FeGVjU2VydmVyQ29udHJvbE1lc3NhZ2VIABJOCh5jb252ZXJzYXRpb25fY2hlY2twb2ludF91cGRhdGUYAyABKAsyJC5hZ2VudC52MS5Db252ZXJzYXRpb25TdGF0ZVN0cnVjdHVyZUgAEjYKEWt2X3NlcnZlcl9tZXNzYWdlGAQgASgLMhkuYWdlbnQudjEuS3ZTZXJ2ZXJNZXNzYWdlSAASNwoRaW50ZXJhY3Rpb25fcXVlcnkYByABKAsyGi5hZ2VudC52MS5JbnRlcmFjdGlvblF1ZXJ5SABCCQoHbWVzc2FnZSIoChBOYW1lQWdlbnRSZXF1ZXN0EhQKDHVzZXJfbWVzc2FnZRgBIAEoCSIhChFOYW1lQWdlbnRSZXNwb25zZRIMCgRuYW1lGAEgASgJIjIKFkdldFVzYWJsZU1vZGVsc1JlcXVlc3QSGAoQY3VzdG9tX21vZGVsX2lkcxgBIAMoCSJBChdHZXRVc2FibGVNb2RlbHNSZXNwb25zZRImCgZtb2RlbHMYASADKAsyFi5hZ2VudC52MS5Nb2RlbERldGFpbHMiHgocR2V0RGVmYXVsdE1vZGVsRm9yQ2xpUmVxdWVzdCJGCh1HZXREZWZhdWx0TW9kZWxGb3JDbGlSZXNwb25zZRIlCgVtb2RlbBgBIAEoCzIWLmFnZW50LnYxLk1vZGVsRGV0YWlscyIfCh1HZXRBbGxvd2VkTW9kZWxJbnRlbnRzUmVxdWVzdCI3Ch5HZXRBbGxvd2VkTW9kZWxJbnRlbnRzUmVzcG9uc2USFQoNbW9kZWxfaW50ZW50cxgBIAMoCSKXAgoTSWRlRWRpdG9yc1N0YXRlRmlsZRIVCg1yZWxhdGl2ZV9wYXRoGAEgASgJEhUKDWFic29sdXRlX3BhdGgYAiABKAkSIQoUaXNfY3VycmVudGx5X2ZvY3VzZWQYAyABKAhIAIgBARIgChNjdXJyZW50X2xpbmVfbnVtYmVyGAQgASgFSAGIAQESHgoRY3VycmVudF9saW5lX3RleHQYBSABKAlIAogBARIXCgpsaW5lX2NvdW50GAYgASgFSAOIAQFCFwoVX2lzX2N1cnJlbnRseV9mb2N1c2VkQhYKFF9jdXJyZW50X2xpbmVfbnVtYmVyQhQKEl9jdXJyZW50X2xpbmVfdGV4dEINCgtfbGluZV9jb3VudCJTChNJZGVFZGl0b3JzU3RhdGVMaXRlEjwKFXJlY2VudGx5X3ZpZXdlZF9maWxlcxgBIAMoCzIdLmFnZW50LnYxLklkZUVkaXRvcnNTdGF0ZUZpbGUidAoWQXBwbHlBZ2VudERpZmZUb29sQ2FsbBIqCgRhcmdzGAEgASgLMhwuYWdlbnQudjEuQXBwbHlBZ2VudERpZmZBcmdzEi4KBnJlc3VsdBgCIAEoCzIeLmFnZW50LnYxLkFwcGx5QWdlbnREaWZmUmVzdWx0IiYKEkFwcGx5QWdlbnREaWZmQXJncxIQCghhZ2VudF9pZBgBIAEoCSKEAQoUQXBwbHlBZ2VudERpZmZSZXN1bHQSMgoHc3VjY2VzcxgBIAEoCzIfLmFnZW50LnYxLkFwcGx5QWdlbnREaWZmU3VjY2Vzc0gAEi4KBWVycm9yGAIgASgLMh0uYWdlbnQudjEuQXBwbHlBZ2VudERpZmZFcnJvckgAQggKBnJlc3VsdCJOChVBcHBseUFnZW50RGlmZlN1Y2Nlc3MSNQoPYXBwbGllZF9jaGFuZ2VzGAEgAygLMhwuYWdlbnQudjEuQXBwbGllZEFnZW50Q2hhbmdlIukBChJBcHBsaWVkQWdlbnRDaGFuZ2USDAoEcGF0aBgBIAEoCRITCgtjaGFuZ2VfdHlwZRgCIAEoBRIbCg5iZWZvcmVfY29udGVudBgDIAEoCUgAiAEBEhoKDWFmdGVyX2NvbnRlbnQYBCABKAlIAYgBARISCgVlcnJvchgFIAEoCUgCiAEBEh4KEW1lc3NhZ2VfZm9yX21vZGVsGAYgASgJSAOIAQFCEQoPX2JlZm9yZV9jb250ZW50QhAKDl9hZnRlcl9jb250ZW50QggKBl9lcnJvckIUChJfbWVzc2FnZV9mb3JfbW9kZWwiWwoTQXBwbHlBZ2VudERpZmZFcnJvchINCgVlcnJvchgBIAEoCRI1Cg9hcHBsaWVkX2NoYW5nZXMYAiADKAsyHC5hZ2VudC52MS5BcHBsaWVkQWdlbnRDaGFuZ2UiawoTQXNrUXVlc3Rpb25Ub29sQ2FsbBInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzEisKBnJlc3VsdBgCIAEoCzIbLmFnZW50LnYxLkFza1F1ZXN0aW9uUmVzdWx0Io8BCg9Bc2tRdWVzdGlvbkFyZ3MSDQoFdGl0bGUYASABKAkSNQoJcXVlc3Rpb25zGAIgAygLMiIuYWdlbnQudjEuQXNrUXVlc3Rpb25BcmdzX1F1ZXN0aW9uEhEKCXJ1bl9hc3luYxgFIAEoCBIjChthc3luY19vcmlnaW5hbF90b29sX2NhbGxfaWQYBiABKAkigQEKGEFza1F1ZXN0aW9uQXJnc19RdWVzdGlvbhIKCgJpZBgBIAEoCRIOCgZwcm9tcHQYAiABKAkSMQoHb3B0aW9ucxgDIAMoCzIgLmFnZW50LnYxLkFza1F1ZXN0aW9uQXJnc19PcHRpb24SFgoOYWxsb3dfbXVsdGlwbGUYBCABKAgiMwoWQXNrUXVlc3Rpb25BcmdzX09wdGlvbhIKCgJpZBgBIAEoCRINCgVsYWJlbBgCIAEoCSISChBBc2tRdWVzdGlvbkFzeW5jItsBChFBc2tRdWVzdGlvblJlc3VsdBIvCgdzdWNjZXNzGAEgASgLMhwuYWdlbnQudjEuQXNrUXVlc3Rpb25TdWNjZXNzSAASKwoFZXJyb3IYAiABKAsyGi5hZ2VudC52MS5Bc2tRdWVzdGlvbkVycm9ySAASMQoIcmVqZWN0ZWQYAyABKAsyHS5hZ2VudC52MS5Bc2tRdWVzdGlvblJlamVjdGVkSAASKwoFYXN5bmMYBCABKAsyGi5hZ2VudC52MS5Bc2tRdWVzdGlvbkFzeW5jSABCCAoGcmVzdWx0IkoKEkFza1F1ZXN0aW9uU3VjY2VzcxI0CgdhbnN3ZXJzGAEgAygLMiMuYWdlbnQudjEuQXNrUXVlc3Rpb25TdWNjZXNzX0Fuc3dlciJNChlBc2tRdWVzdGlvblN1Y2Nlc3NfQW5zd2VyEhMKC3F1ZXN0aW9uX2lkGAEgASgJEhsKE3NlbGVjdGVkX29wdGlvbl9pZHMYAiADKAkiKQoQQXNrUXVlc3Rpb25FcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJIiUKE0Fza1F1ZXN0aW9uUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIv0FChhCYWNrZ3JvdW5kU2hlbGxTcGF3bkFyZ3MSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRIUCgx0b29sX2NhbGxfaWQYAyABKAkSOwoOcGFyc2luZ19yZXN1bHQYBCABKAsyIy5hZ2VudC52MS5TaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0EjQKDnNhbmRib3hfcG9saWN5GAUgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgAiAEBEiUKHWVuYWJsZV93cml0ZV9zaGVsbF9zdGRpbl90b29sGAYgASgIEhgKC2Rlc2NyaXB0aW9uGAcgASgJSAGIAQESQQoRY2xhc3NpZmllcl9yZXN1bHQYCCABKAsyIS5hZ2VudC52MS5Db21tYW5kQ2xhc3NpZmllclJlc3VsdEgCiAEBEkkKE291dHB1dF9ub3RpZmljYXRpb24YCSABKAsyJy5hZ2VudC52MS5TaGVsbE91dHB1dE5vdGlmaWNhdGlvbkNvbmZpZ0gDiAEBEj0KE3NtYXJ0X21vZGVfYXBwcm92YWwYCiABKAsyGy5hZ2VudC52MS5TbWFydE1vZGVBcHByb3ZhbEgEiAEBEk4KGWhvb2tfYXBwcm92YWxfcmVxdWlyZW1lbnQYCyABKAsyJi5hZ2VudC52MS5TaGVsbEhvb2tBcHByb3ZhbFJlcXVpcmVtZW50SAWIAQESFQoNc2tpcF9hcHByb3ZhbBgMIAEoCBIcCg9jb252ZXJzYXRpb25faWQYDSABKAlIBogBAUIRCg9fc2FuZGJveF9wb2xpY3lCDgoMX2Rlc2NyaXB0aW9uQhQKEl9jbGFzc2lmaWVyX3Jlc3VsdEIWChRfb3V0cHV0X25vdGlmaWNhdGlvbkIWChRfc21hcnRfbW9kZV9hcHByb3ZhbEIcChpfaG9va19hcHByb3ZhbF9yZXF1aXJlbWVudEISChBfY29udmVyc2F0aW9uX2lkIoECChpCYWNrZ3JvdW5kU2hlbGxTcGF3blJlc3VsdBI4CgdzdWNjZXNzGAEgASgLMiUuYWdlbnQudjEuQmFja2dyb3VuZFNoZWxsU3Bhd25TdWNjZXNzSAASNAoFZXJyb3IYAiABKAsyIy5hZ2VudC52MS5CYWNrZ3JvdW5kU2hlbGxTcGF3bkVycm9ySAASKwoIcmVqZWN0ZWQYAyABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASPAoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyHy5hZ2VudC52MS5TaGVsbFBlcm1pc3Npb25EZW5pZWRIAEIICgZyZXN1bHQidQobQmFja2dyb3VuZFNoZWxsU3Bhd25TdWNjZXNzEhAKCHNoZWxsX2lkGAEgASgNEg8KB2NvbW1hbmQYAiABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAyABKAkSEAoDcGlkGAQgASgNSACIAQFCBgoEX3BpZCJWChlCYWNrZ3JvdW5kU2hlbGxTcGF3bkVycm9yEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSDQoFZXJyb3IYAyABKAkiNgoTV3JpdGVTaGVsbFN0ZGluQXJncxIQCghzaGVsbF9pZBgBIAEoDRINCgVjaGFycxgCIAEoCSKHAQoVV3JpdGVTaGVsbFN0ZGluUmVzdWx0EjMKB3N1Y2Nlc3MYASABKAsyIC5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5TdWNjZXNzSAASLwoFZXJyb3IYAiABKAsyHi5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5FcnJvckgAQggKBnJlc3VsdCJdChZXcml0ZVNoZWxsU3RkaW5TdWNjZXNzEhAKCHNoZWxsX2lkGAEgASgNEjEKKXRlcm1pbmFsX2ZpbGVfbGVuZ3RoX2JlZm9yZV9pbnB1dF93cml0dGVuGAIgASgNIiUKFFdyaXRlU2hlbGxTdGRpbkVycm9yEg0KBWVycm9yGAEgASgJIiIKCkNvb3JkaW5hdGUSCQoBeBgBIAEoBRIJCgF5GAIgASgFIlUKD0NvbXB1dGVyVXNlQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkSLAoHYWN0aW9ucxgCIAMoCzIbLmFnZW50LnYxLkNvbXB1dGVyVXNlQWN0aW9uIoEEChFDb21wdXRlclVzZUFjdGlvbhIvCgptb3VzZV9tb3ZlGAEgASgLMhkuYWdlbnQudjEuTW91c2VNb3ZlQWN0aW9uSAASJgoFY2xpY2sYAiABKAsyFS5hZ2VudC52MS5DbGlja0FjdGlvbkgAEi8KCm1vdXNlX2Rvd24YAyABKAsyGS5hZ2VudC52MS5Nb3VzZURvd25BY3Rpb25IABIrCghtb3VzZV91cBgEIAEoCzIXLmFnZW50LnYxLk1vdXNlVXBBY3Rpb25IABIkCgRkcmFnGAUgASgLMhQuYWdlbnQudjEuRHJhZ0FjdGlvbkgAEigKBnNjcm9sbBgGIAEoCzIWLmFnZW50LnYxLlNjcm9sbEFjdGlvbkgAEiQKBHR5cGUYByABKAsyFC5hZ2VudC52MS5UeXBlQWN0aW9uSAASIgoDa2V5GAggASgLMhMuYWdlbnQudjEuS2V5QWN0aW9uSAASJAoEd2FpdBgJIAEoCzIULmFnZW50LnYxLldhaXRBY3Rpb25IABIwCgpzY3JlZW5zaG90GAogASgLMhouYWdlbnQudjEuU2NyZWVuc2hvdEFjdGlvbkgAEjkKD2N1cnNvcl9wb3NpdGlvbhgLIAEoCzIeLmFnZW50LnYxLkN1cnNvclBvc2l0aW9uQWN0aW9uSABCCAoGYWN0aW9uIjsKD01vdXNlTW92ZUFjdGlvbhIoCgpjb29yZGluYXRlGAEgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZSKYAQoLQ2xpY2tBY3Rpb24SLQoKY29vcmRpbmF0ZRgBIAEoCzIULmFnZW50LnYxLkNvb3JkaW5hdGVIAIgBARIOCgZidXR0b24YAiABKAUSDQoFY291bnQYAyABKAUSGgoNbW9kaWZpZXJfa2V5cxgEIAEoCUgBiAEBQg0KC19jb29yZGluYXRlQhAKDl9tb2RpZmllcl9rZXlzIiEKD01vdXNlRG93bkFjdGlvbhIOCgZidXR0b24YASABKAUiHwoNTW91c2VVcEFjdGlvbhIOCgZidXR0b24YASABKAUiQAoKRHJhZ0FjdGlvbhIiCgRwYXRoGAEgAygLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZRIOCgZidXR0b24YAiABKAUinQEKDFNjcm9sbEFjdGlvbhItCgpjb29yZGluYXRlGAEgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZUgAiAEBEhEKCWRpcmVjdGlvbhgCIAEoBRIOCgZhbW91bnQYAyABKAUSGgoNbW9kaWZpZXJfa2V5cxgEIAEoCUgBiAEBQg0KC19jb29yZGluYXRlQhAKDl9tb2RpZmllcl9rZXlzIhoKClR5cGVBY3Rpb24SDAoEdGV4dBgBIAEoCSJMCglLZXlBY3Rpb24SCwoDa2V5GAEgASgJEh0KEGhvbGRfZHVyYXRpb25fbXMYAiABKAVIAIgBAUITChFfaG9sZF9kdXJhdGlvbl9tcyIhCgpXYWl0QWN0aW9uEhMKC2R1cmF0aW9uX21zGAEgASgFIhIKEFNjcmVlbnNob3RBY3Rpb24iFgoUQ3Vyc29yUG9zaXRpb25BY3Rpb24iewoRQ29tcHV0ZXJVc2VSZXN1bHQSLwoHc3VjY2VzcxgBIAEoCzIcLmFnZW50LnYxLkNvbXB1dGVyVXNlU3VjY2Vzc0gAEisKBWVycm9yGAIgASgLMhouYWdlbnQudjEuQ29tcHV0ZXJVc2VFcnJvckgAQggKBnJlc3VsdCL7AQoSQ29tcHV0ZXJVc2VTdWNjZXNzEhQKDGFjdGlvbl9jb3VudBgBIAEoBRITCgtkdXJhdGlvbl9tcxgCIAEoBRIXCgpzY3JlZW5zaG90GAMgASgJSACIAQESEAoDbG9nGAQgASgJSAGIAQESHAoPc2NyZWVuc2hvdF9wYXRoGAUgASgJSAKIAQESMgoPY3Vyc29yX3Bvc2l0aW9uGAYgASgLMhQuYWdlbnQudjEuQ29vcmRpbmF0ZUgDiAEBQg0KC19zY3JlZW5zaG90QgYKBF9sb2dCEgoQX3NjcmVlbnNob3RfcGF0aEISChBfY3Vyc29yX3Bvc2l0aW9uIsABChBDb21wdXRlclVzZUVycm9yEg0KBWVycm9yGAEgASgJEhQKDGFjdGlvbl9jb3VudBgCIAEoBRITCgtkdXJhdGlvbl9tcxgDIAEoBRIQCgNsb2cYBCABKAlIAIgBARIXCgpzY3JlZW5zaG90GAUgASgJSAGIAQESHAoPc2NyZWVuc2hvdF9wYXRoGAYgASgJSAKIAQFCBgoEX2xvZ0INCgtfc2NyZWVuc2hvdEISChBfc2NyZWVuc2hvdF9wYXRoImsKE0NvbXB1dGVyVXNlVG9vbENhbGwSJwoEYXJncxgBIAEoCzIZLmFnZW50LnYxLkNvbXB1dGVyVXNlQXJncxIrCgZyZXN1bHQYAiABKAsyGy5hZ2VudC52MS5Db21wdXRlclVzZVJlc3VsdCJoChJDcmVhdGVQbGFuVG9vbENhbGwSJgoEYXJncxgBIAEoCzIYLmFnZW50LnYxLkNyZWF0ZVBsYW5BcmdzEioKBnJlc3VsdBgCIAEoCzIaLmFnZW50LnYxLkNyZWF0ZVBsYW5SZXN1bHQiOAoFUGhhc2USDAoEbmFtZRgBIAEoCRIhCgV0b2RvcxgCIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtIpYBCg5DcmVhdGVQbGFuQXJncxIMCgRwbGFuGAEgASgJEiEKBXRvZG9zGAIgAygLMhIuYWdlbnQudjEuVG9kb0l0ZW0SEAoIb3ZlcnZpZXcYAyABKAkSDAoEbmFtZRgEIAEoCRISCgppc19wcm9qZWN0GAUgASgIEh8KBnBoYXNlcxgGIAMoCzIPLmFnZW50LnYxLlBoYXNlIooBChBDcmVhdGVQbGFuUmVzdWx0EhAKCHBsYW5fdXJpGAMgASgJEi4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5DcmVhdGVQbGFuU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuQ3JlYXRlUGxhbkVycm9ySABCCAoGcmVzdWx0IhMKEUNyZWF0ZVBsYW5TdWNjZXNzIiAKD0NyZWF0ZVBsYW5FcnJvchINCgVlcnJvchgBIAEoCSJWChZDcmVhdGVQbGFuUmVxdWVzdFF1ZXJ5EiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5DcmVhdGVQbGFuQXJncxIUCgx0b29sX2NhbGxfaWQYAiABKAkiRwoZQ3JlYXRlUGxhblJlcXVlc3RSZXNwb25zZRIqCgZyZXN1bHQYASABKAsyGi5hZ2VudC52MS5DcmVhdGVQbGFuUmVzdWx0IhYKFEN1cnNvclJ1bGVUeXBlR2xvYmFsIigKF0N1cnNvclJ1bGVUeXBlRmlsZUdsb2JzEg0KBWdsb2JzGAEgAygJIjEKGkN1cnNvclJ1bGVUeXBlQWdlbnRGZXRjaGVkEhMKC2Rlc2NyaXB0aW9uGAEgASgJIiAKHkN1cnNvclJ1bGVUeXBlTWFudWFsbHlBdHRhY2hlZCKLAgoOQ3Vyc29yUnVsZVR5cGUSMAoGZ2xvYmFsGAEgASgLMh4uYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGVHbG9iYWxIABI5CgxmaWxlX2dsb2JiZWQYAiABKAsyIS5hZ2VudC52MS5DdXJzb3JSdWxlVHlwZUZpbGVHbG9ic0gAEj0KDWFnZW50X2ZldGNoZWQYAyABKAsyJC5hZ2VudC52MS5DdXJzb3JSdWxlVHlwZUFnZW50RmV0Y2hlZEgAEkUKEW1hbnVhbGx5X2F0dGFjaGVkGAQgASgLMiguYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGVNYW51YWxseUF0dGFjaGVkSABCBgoEdHlwZSLIAQoKQ3Vyc29yUnVsZRIRCglmdWxsX3BhdGgYASABKAkSDwoHY29udGVudBgCIAEoCRImCgR0eXBlGAMgASgLMhguYWdlbnQudjEuQ3Vyc29yUnVsZVR5cGUSDgoGc291cmNlGAQgASgFEh4KEWdpdF9yZW1vdGVfb3JpZ2luGAUgASgJSACIAQESGAoLcGFyc2VfZXJyb3IYBiABKAlIAYgBAUIUChJfZ2l0X3JlbW90ZV9vcmlnaW5CDgoMX3BhcnNlX2Vycm9yIjAKCkRlbGV0ZUFyZ3MSDAoEcGF0aBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAki7QIKDERlbGV0ZVJlc3VsdBIqCgdzdWNjZXNzGAEgASgLMhcuYWdlbnQudjEuRGVsZXRlU3VjY2Vzc0gAEjYKDmZpbGVfbm90X2ZvdW5kGAIgASgLMhwuYWdlbnQudjEuRGVsZXRlRmlsZU5vdEZvdW5kSAASKwoIbm90X2ZpbGUYAyABKAsyFy5hZ2VudC52MS5EZWxldGVOb3RGaWxlSAASPQoRcGVybWlzc2lvbl9kZW5pZWQYBCABKAsyIC5hZ2VudC52MS5EZWxldGVQZXJtaXNzaW9uRGVuaWVkSAASLQoJZmlsZV9idXN5GAUgASgLMhguYWdlbnQudjEuRGVsZXRlRmlsZUJ1c3lIABIsCghyZWplY3RlZBgGIAEoCzIYLmFnZW50LnYxLkRlbGV0ZVJlamVjdGVkSAASJgoFZXJyb3IYByABKAsyFS5hZ2VudC52MS5EZWxldGVFcnJvckgAQggKBnJlc3VsdCJcCg1EZWxldGVTdWNjZXNzEgwKBHBhdGgYASABKAkSFAoMZGVsZXRlZF9maWxlGAIgASgJEhEKCWZpbGVfc2l6ZRgDIAEoAxIUCgxwcmV2X2NvbnRlbnQYBCABKAkiIgoSRGVsZXRlRmlsZU5vdEZvdW5kEgwKBHBhdGgYASABKAkiMgoNRGVsZXRlTm90RmlsZRIMCgRwYXRoGAEgASgJEhMKC2FjdHVhbF90eXBlGAIgASgJIlkKFkRlbGV0ZVBlcm1pc3Npb25EZW5pZWQSDAoEcGF0aBgBIAEoCRIcChRjbGllbnRfdmlzaWJsZV9lcnJvchgCIAEoCRITCgtpc19yZWFkb25seRgDIAEoCCIeCg5EZWxldGVGaWxlQnVzeRIMCgRwYXRoGAEgASgJIi4KDkRlbGV0ZVJlamVjdGVkEgwKBHBhdGgYASABKAkSDgoGcmVhc29uGAIgASgJIioKC0RlbGV0ZUVycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiXAoORGVsZXRlVG9vbENhbGwSIgoEYXJncxgBIAEoCzIULmFnZW50LnYxLkRlbGV0ZUFyZ3MSJgoGcmVzdWx0GAIgASgLMhYuYWdlbnQudjEuRGVsZXRlUmVzdWx0IjUKD0RpYWdub3N0aWNzQXJncxIMCgRwYXRoGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSKvAgoRRGlhZ25vc3RpY3NSZXN1bHQSLwoHc3VjY2VzcxgBIAEoCzIcLmFnZW50LnYxLkRpYWdub3N0aWNzU3VjY2Vzc0gAEisKBWVycm9yGAIgASgLMhouYWdlbnQudjEuRGlhZ25vc3RpY3NFcnJvckgAEjEKCHJlamVjdGVkGAMgASgLMh0uYWdlbnQudjEuRGlhZ25vc3RpY3NSZWplY3RlZEgAEjsKDmZpbGVfbm90X2ZvdW5kGAQgASgLMiEuYWdlbnQudjEuRGlhZ25vc3RpY3NGaWxlTm90Rm91bmRIABJCChFwZXJtaXNzaW9uX2RlbmllZBgFIAEoCzIlLmFnZW50LnYxLkRpYWdub3N0aWNzUGVybWlzc2lvbkRlbmllZEgAQggKBnJlc3VsdCJoChJEaWFnbm9zdGljc1N1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIpCgtkaWFnbm9zdGljcxgCIAMoCzIULmFnZW50LnYxLkRpYWdub3N0aWMSGQoRdG90YWxfZGlhZ25vc3RpY3MYAyABKAUifwoKRGlhZ25vc3RpYxIQCghzZXZlcml0eRgBIAEoBRIeCgVyYW5nZRgCIAEoCzIPLmFnZW50LnYxLlJhbmdlEg8KB21lc3NhZ2UYAyABKAkSDgoGc291cmNlGAQgASgJEgwKBGNvZGUYBSABKAkSEAoIaXNfc3RhbGUYBiABKAgiLwoQRGlhZ25vc3RpY3NFcnJvchIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJIjMKE0RpYWdub3N0aWNzUmVqZWN0ZWQSDAoEcGF0aBgBIAEoCRIOCgZyZWFzb24YAiABKAkiJwoXRGlhZ25vc3RpY3NGaWxlTm90Rm91bmQSDAoEcGF0aBgBIAEoCSIrChtEaWFnbm9zdGljc1Blcm1pc3Npb25EZW5pZWQSDAoEcGF0aBgBIAEoCSJICghFZGl0QXJncxIMCgRwYXRoGAEgASgJEhsKDnN0cmVhbV9jb250ZW50GAYgASgJSACIAQFCEQoPX3N0cmVhbV9jb250ZW50ItYCCgpFZGl0UmVzdWx0EigKB3N1Y2Nlc3MYASABKAsyFS5hZ2VudC52MS5FZGl0U3VjY2Vzc0gAEjQKDmZpbGVfbm90X2ZvdW5kGAIgASgLMhouYWdlbnQudjEuRWRpdEZpbGVOb3RGb3VuZEgAEkQKFnJlYWRfcGVybWlzc2lvbl9kZW5pZWQYAyABKAsyIi5hZ2VudC52MS5FZGl0UmVhZFBlcm1pc3Npb25EZW5pZWRIABJGChd3cml0ZV9wZXJtaXNzaW9uX2RlbmllZBgEIAEoCzIjLmFnZW50LnYxLkVkaXRXcml0ZVBlcm1pc3Npb25EZW5pZWRIABIqCghyZWplY3RlZBgGIAEoCzIWLmFnZW50LnYxLkVkaXRSZWplY3RlZEgAEiQKBWVycm9yGAcgASgLMhMuYWdlbnQudjEuRWRpdEVycm9ySABCCAoGcmVzdWx0IqQCCgtFZGl0U3VjY2VzcxIMCgRwYXRoGAEgASgJEhgKC2xpbmVzX2FkZGVkGAMgASgFSACIAQESGgoNbGluZXNfcmVtb3ZlZBgEIAEoBUgBiAEBEhgKC2RpZmZfc3RyaW5nGAUgASgJSAKIAQESJQoYYmVmb3JlX2Z1bGxfZmlsZV9jb250ZW50GAYgASgJSAOIAQESHwoXYWZ0ZXJfZnVsbF9maWxlX2NvbnRlbnQYByABKAkSFAoHbWVzc2FnZRgIIAEoCUgEiAEBQg4KDF9saW5lc19hZGRlZEIQCg5fbGluZXNfcmVtb3ZlZEIOCgxfZGlmZl9zdHJpbmdCGwoZX2JlZm9yZV9mdWxsX2ZpbGVfY29udGVudEIKCghfbWVzc2FnZSIgChBFZGl0RmlsZU5vdEZvdW5kEgwKBHBhdGgYASABKAkiKAoYRWRpdFJlYWRQZXJtaXNzaW9uRGVuaWVkEgwKBHBhdGgYASABKAkiTQoZRWRpdFdyaXRlUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJEhMKC2lzX3JlYWRvbmx5GAMgASgIIiwKDEVkaXRSZWplY3RlZBIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJiCglFZGl0RXJyb3ISDAoEcGF0aBgBIAEoCRINCgVlcnJvchgCIAEoCRIgChNtb2RlbF92aXNpYmxlX2Vycm9yGAUgASgJSACIAQFCFgoUX21vZGVsX3Zpc2libGVfZXJyb3IiVgoMRWRpdFRvb2xDYWxsEiAKBGFyZ3MYASABKAsyEi5hZ2VudC52MS5FZGl0QXJncxIkCgZyZXN1bHQYAiABKAsyFC5hZ2VudC52MS5FZGl0UmVzdWx0IjEKEUVkaXRUb29sQ2FsbERlbHRhEhwKFHN0cmVhbV9jb250ZW50X2RlbHRhGAEgASgJIjEKDEV4YUZldGNoQXJncxILCgNpZHMYASADKAkSFAoMdG9vbF9jYWxsX2lkGAIgASgJIqIBCg5FeGFGZXRjaFJlc3VsdBIsCgdzdWNjZXNzGAEgASgLMhkuYWdlbnQudjEuRXhhRmV0Y2hTdWNjZXNzSAASKAoFZXJyb3IYAiABKAsyFy5hZ2VudC52MS5FeGFGZXRjaEVycm9ySAASLgoIcmVqZWN0ZWQYAyABKAsyGi5hZ2VudC52MS5FeGFGZXRjaFJlamVjdGVkSABCCAoGcmVzdWx0Ij4KD0V4YUZldGNoU3VjY2VzcxIrCghjb250ZW50cxgBIAMoCzIZLmFnZW50LnYxLkV4YUZldGNoQ29udGVudCIeCg1FeGFGZXRjaEVycm9yEg0KBWVycm9yGAEgASgJIiIKEEV4YUZldGNoUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIlMKD0V4YUZldGNoQ29udGVudBINCgV0aXRsZRgBIAEoCRILCgN1cmwYAiABKAkSDAoEdGV4dBgDIAEoCRIWCg5wdWJsaXNoZWRfZGF0ZRgEIAEoCSJiChBFeGFGZXRjaFRvb2xDYWxsEiQKBGFyZ3MYASABKAsyFi5hZ2VudC52MS5FeGFGZXRjaEFyZ3MSKAoGcmVzdWx0GAIgASgLMhguYWdlbnQudjEuRXhhRmV0Y2hSZXN1bHQiPAoURXhhRmV0Y2hSZXF1ZXN0UXVlcnkSJAoEYXJncxgBIAEoCzIWLmFnZW50LnYxLkV4YUZldGNoQXJncyKjAQoXRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2USPgoIYXBwcm92ZWQYASABKAsyKi5hZ2VudC52MS5FeGFGZXRjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj4KCHJlamVjdGVkGAIgASgLMiouYWdlbnQudjEuRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWRIAEIICgZyZXN1bHQiIgogRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfQXBwcm92ZWQiMgogRXhhRmV0Y2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIlcKDUV4YVNlYXJjaEFyZ3MSDQoFcXVlcnkYASABKAkSDAoEdHlwZRgCIAEoCRITCgtudW1fcmVzdWx0cxgDIAEoBRIUCgx0b29sX2NhbGxfaWQYBCABKAkipgEKD0V4YVNlYXJjaFJlc3VsdBItCgdzdWNjZXNzGAEgASgLMhouYWdlbnQudjEuRXhhU2VhcmNoU3VjY2Vzc0gAEikKBWVycm9yGAIgASgLMhguYWdlbnQudjEuRXhhU2VhcmNoRXJyb3JIABIvCghyZWplY3RlZBgDIAEoCzIbLmFnZW50LnYxLkV4YVNlYXJjaFJlamVjdGVkSABCCAoGcmVzdWx0IkQKEEV4YVNlYXJjaFN1Y2Nlc3MSMAoKcmVmZXJlbmNlcxgBIAMoCzIcLmFnZW50LnYxLkV4YVNlYXJjaFJlZmVyZW5jZSIfCg5FeGFTZWFyY2hFcnJvchINCgVlcnJvchgBIAEoCSIjChFFeGFTZWFyY2hSZWplY3RlZBIOCgZyZWFzb24YASABKAkiVgoSRXhhU2VhcmNoUmVmZXJlbmNlEg0KBXRpdGxlGAEgASgJEgsKA3VybBgCIAEoCRIMCgR0ZXh0GAMgASgJEhYKDnB1Ymxpc2hlZF9kYXRlGAQgASgJImUKEUV4YVNlYXJjaFRvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5FeGFTZWFyY2hBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLkV4YVNlYXJjaFJlc3VsdCI+ChVFeGFTZWFyY2hSZXF1ZXN0UXVlcnkSJQoEYXJncxgBIAEoCzIXLmFnZW50LnYxLkV4YVNlYXJjaEFyZ3MipgEKGEV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZRI/CghhcHByb3ZlZBgBIAEoCzIrLmFnZW50LnYxLkV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj8KCHJlamVjdGVkGAIgASgLMisuYWdlbnQudjEuRXhhU2VhcmNoUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkSABCCAoGcmVzdWx0IiMKIUV4YVNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCIzCiFFeGFTZWFyY2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIiMKFUV4ZWNDbGllbnRTdHJlYW1DbG9zZRIKCgJpZBgBIAEoDSJ+Cg9FeGVjQ2xpZW50VGhyb3cSCgoCaWQYASABKA0SDQoFZXJyb3IYAiABKAkSGAoLc3RhY2tfdHJhY2UYAyABKAlIAIgBARIXCgplcnJvcl9jb2RlGAQgASgJSAGIAQFCDgoMX3N0YWNrX3RyYWNlQg0KC19lcnJvcl9jb2RlIiEKE0V4ZWNDbGllbnRIZWFydGJlYXQSCgoCaWQYASABKA0ivgEKGEV4ZWNDbGllbnRDb250cm9sTWVzc2FnZRI3CgxzdHJlYW1fY2xvc2UYASABKAsyHy5hZ2VudC52MS5FeGVjQ2xpZW50U3RyZWFtQ2xvc2VIABIqCgV0aHJvdxgCIAEoCzIZLmFnZW50LnYxLkV4ZWNDbGllbnRUaHJvd0gAEjIKCWhlYXJ0YmVhdBgDIAEoCzIdLmFnZW50LnYxLkV4ZWNDbGllbnRIZWFydGJlYXRIAEIJCgdtZXNzYWdlIoQBCgtTcGFuQ29udGV4dBIQCgh0cmFjZV9pZBgBIAEoCRIPCgdzcGFuX2lkGAIgASgJEhgKC3RyYWNlX2ZsYWdzGAMgASgNSACIAQESGAoLdHJhY2Vfc3RhdGUYBCABKAlIAYgBAUIOCgxfdHJhY2VfZmxhZ3NCDgoMX3RyYWNlX3N0YXRlIgsKCUFib3J0QXJncyINCgtBYm9ydFJlc3VsdCLaEwoRRXhlY1NlcnZlck1lc3NhZ2USCgoCaWQYASABKA0SDwoHZXhlY19pZBgPIAEoCRIwCgxzcGFuX2NvbnRleHQYEyABKAsyFS5hZ2VudC52MS5TcGFuQ29udGV4dEgBiAEBEikKCnNoZWxsX2FyZ3MYAiABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3NIABIpCgp3cml0ZV9hcmdzGAMgASgLMhMuYWdlbnQudjEuV3JpdGVBcmdzSAASKwoLZGVsZXRlX2FyZ3MYBCABKAsyFC5hZ2VudC52MS5EZWxldGVBcmdzSAASJwoJZ3JlcF9hcmdzGAUgASgLMhIuYWdlbnQudjEuR3JlcEFyZ3NIABInCglyZWFkX2FyZ3MYByABKAsyEi5hZ2VudC52MS5SZWFkQXJnc0gAEiMKB2xzX2FyZ3MYCCABKAsyEC5hZ2VudC52MS5Mc0FyZ3NIABI1ChBkaWFnbm9zdGljc19hcmdzGAkgASgLMhkuYWdlbnQudjEuRGlhZ25vc3RpY3NBcmdzSAASPAoUcmVxdWVzdF9jb250ZXh0X2FyZ3MYCiABKAsyHC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dEFyZ3NIABIlCghtY3BfYXJncxgLIAEoCzIRLmFnZW50LnYxLk1jcEFyZ3NIABIwChFzaGVsbF9zdHJlYW1fYXJncxgOIAEoCzITLmFnZW50LnYxLlNoZWxsQXJnc0gAEkkKG2JhY2tncm91bmRfc2hlbGxfc3Bhd25fYXJncxgQIAEoCzIiLmFnZW50LnYxLkJhY2tncm91bmRTaGVsbFNwYXduQXJnc0gAEkoKHGxpc3RfbWNwX3Jlc291cmNlc19leGVjX2FyZ3MYESABKAsyIi5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3NIABJIChtyZWFkX21jcF9yZXNvdXJjZV9leGVjX2FyZ3MYEiABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VFeGVjQXJnc0gAEikKCmZldGNoX2FyZ3MYFCABKAsyEy5hZ2VudC52MS5GZXRjaEFyZ3NIABI4ChJyZWNvcmRfc2NyZWVuX2FyZ3MYFSABKAsyGi5hZ2VudC52MS5SZWNvcmRTY3JlZW5BcmdzSAASNgoRY29tcHV0ZXJfdXNlX2FyZ3MYFiABKAsyGS5hZ2VudC52MS5Db21wdXRlclVzZUFyZ3NIABI/ChZ3cml0ZV9zaGVsbF9zdGRpbl9hcmdzGBcgASgLMh0uYWdlbnQudjEuV3JpdGVTaGVsbFN0ZGluQXJnc0gAEjAKEnJlZGFjdGVkX3JlYWRfYXJncxgdIAEoCzISLmFnZW50LnYxLlJlYWRBcmdzSAASOQoTbWNwX3N0YXRlX2V4ZWNfYXJncxgkIAEoCzIaLmFnZW50LnYxLk1jcFN0YXRlRXhlY0FyZ3NIABI2ChFleGVjdXRlX2hvb2tfYXJncxgbIAEoCzIZLmFnZW50LnYxLkV4ZWN1dGVIb29rQXJnc0gAEi8KDXN1YmFnZW50X2FyZ3MYHCABKAsyFi5hZ2VudC52MS5TdWJhZ2VudEFyZ3NIABJJChtmb3JjZV9iYWNrZ3JvdW5kX3NoZWxsX2FyZ3MYHiABKAsyIi5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTaGVsbEFyZ3NIABJPCh5mb3JjZV9iYWNrZ3JvdW5kX3N1YmFnZW50X2FyZ3MYHyABKAsyJS5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTdWJhZ2VudEFyZ3NIABI6ChNzdWJhZ2VudF9hd2FpdF9hcmdzGCUgASgLMhsuYWdlbnQudjEuU3ViYWdlbnRBd2FpdEFyZ3NIABJHChpzbWFydF9tb2RlX2NsYXNzaWZpZXJfYXJncxgmIAEoCzIhLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJBcmdzSAASQgoXY2FudmFzX2RpYWdub3N0aWNzX2FyZ3MYKCABKAsyHy5hZ2VudC52MS5DYW52YXNEaWFnbm9zdGljc0FyZ3NIABJNCh1zaGVsbF9hbGxvd2xpc3RfcHJlY2hlY2tfYXJncxgpIAEoCzIkLmFnZW50LnYxLlNoZWxsQWxsb3dsaXN0UHJlY2hlY2tBcmdzSAASSQobbWNwX2FsbG93bGlzdF9wcmVjaGVja19hcmdzGCogASgLMiIuYWdlbnQudjEuTWNwQWxsb3dsaXN0UHJlY2hlY2tBcmdzSAASVAohd2ViX2ZldGNoX2FsbG93bGlzdF9wcmVjaGVja19hcmdzGCsgASgLMicuYWdlbnQudjEuV2ViRmV0Y2hBbGxvd2xpc3RQcmVjaGVja0FyZ3NIABI0ChBnaXRfZGlmZl9yZXF1ZXN0GCwgASgLMhguYWdlbnQudjEuR2V0RGlmZlJlcXVlc3RIABIwCgxwaV9yZWFkX2FyZ3MYLSABKAsyGC5hZ2VudC52MS5QaVJlYWRFeGVjQXJnc0gAEjAKDHBpX2Jhc2hfYXJncxguIAEoCzIYLmFnZW50LnYxLlBpQmFzaEV4ZWNBcmdzSAASMAoMcGlfZWRpdF9hcmdzGC8gASgLMhguYWdlbnQudjEuUGlFZGl0RXhlY0FyZ3NIABIyCg1waV93cml0ZV9hcmdzGDAgASgLMhkuYWdlbnQudjEuUGlXcml0ZUV4ZWNBcmdzSAASMAoMcGlfZ3JlcF9hcmdzGDEgASgLMhguYWdlbnQudjEuUGlHcmVwRXhlY0FyZ3NIABIwCgxwaV9maW5kX2FyZ3MYMiABKAsyGC5hZ2VudC52MS5QaUZpbmRFeGVjQXJnc0gAEiwKCnBpX2xzX2FyZ3MYMyABKAsyFi5hZ2VudC52MS5QaUxzRXhlY0FyZ3NIABI3ChhtaW5pX3N3ZV9hZ2VudF9iYXNoX2FyZ3MYNCABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3NIABJEChhjb252ZXJzYXRpb25fc2VhcmNoX2FyZ3MYNSABKAsyIC5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hBcmdzSAASRQoZYWdlbnRfc3RvcmVfY29uZmxpY3RfYXJncxg2IAEoCzIgLmFnZW50LnYxLkFnZW50U3RvcmVDb25mbGljdEFyZ3NIABIsCh9hY2NlcHRfaG9va19hZGRpdGlvbmFsX2NvbnRleHRzGDcgASgISAKIAQFCCQoHbWVzc2FnZUIPCg1fc3Bhbl9jb250ZXh0QiIKIF9hY2NlcHRfaG9va19hZGRpdGlvbmFsX2NvbnRleHRzIuEUChFFeGVjQ2xpZW50TWVzc2FnZRIKCgJpZBgBIAEoDRIPCgdleGVjX2lkGA8gASgJEi0KDHNoZWxsX3Jlc3VsdBgCIAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SAASLQoMd3JpdGVfcmVzdWx0GAMgASgLMhUuYWdlbnQudjEuV3JpdGVSZXN1bHRIABIvCg1kZWxldGVfcmVzdWx0GAQgASgLMhYuYWdlbnQudjEuRGVsZXRlUmVzdWx0SAASKwoLZ3JlcF9yZXN1bHQYBSABKAsyFC5hZ2VudC52MS5HcmVwUmVzdWx0SAASKwoLcmVhZF9yZXN1bHQYByABKAsyFC5hZ2VudC52MS5SZWFkUmVzdWx0SAASJwoJbHNfcmVzdWx0GAggASgLMhIuYWdlbnQudjEuTHNSZXN1bHRIABI5ChJkaWFnbm9zdGljc19yZXN1bHQYCSABKAsyGy5hZ2VudC52MS5EaWFnbm9zdGljc1Jlc3VsdEgAEkAKFnJlcXVlc3RfY29udGV4dF9yZXN1bHQYCiABKAsyHi5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dFJlc3VsdEgAEikKCm1jcF9yZXN1bHQYCyABKAsyEy5hZ2VudC52MS5NY3BSZXN1bHRIABItCgxzaGVsbF9zdHJlYW0YDiABKAsyFS5hZ2VudC52MS5TaGVsbFN0cmVhbUgAEk0KHWJhY2tncm91bmRfc2hlbGxfc3Bhd25fcmVzdWx0GBAgASgLMiQuYWdlbnQudjEuQmFja2dyb3VuZFNoZWxsU3Bhd25SZXN1bHRIABJOCh5saXN0X21jcF9yZXNvdXJjZXNfZXhlY19yZXN1bHQYESABKAsyJC5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXhlY1Jlc3VsdEgAEkwKHXJlYWRfbWNwX3Jlc291cmNlX2V4ZWNfcmVzdWx0GBIgASgLMiMuYWdlbnQudjEuUmVhZE1jcFJlc291cmNlRXhlY1Jlc3VsdEgAEi0KDGZldGNoX3Jlc3VsdBgUIAEoCzIVLmFnZW50LnYxLkZldGNoUmVzdWx0SAASPAoUcmVjb3JkX3NjcmVlbl9yZXN1bHQYFSABKAsyHC5hZ2VudC52MS5SZWNvcmRTY3JlZW5SZXN1bHRIABI6ChNjb21wdXRlcl91c2VfcmVzdWx0GBYgASgLMhsuYWdlbnQudjEuQ29tcHV0ZXJVc2VSZXN1bHRIABJDChh3cml0ZV9zaGVsbF9zdGRpbl9yZXN1bHQYFyABKAsyHy5hZ2VudC52MS5Xcml0ZVNoZWxsU3RkaW5SZXN1bHRIABI0ChRyZWRhY3RlZF9yZWFkX3Jlc3VsdBgdIAEoCzIULmFnZW50LnYxLlJlYWRSZXN1bHRIABI9ChVtY3Bfc3RhdGVfZXhlY19yZXN1bHQYJCABKAsyHC5hZ2VudC52MS5NY3BTdGF0ZUV4ZWNSZXN1bHRIABI6ChNleGVjdXRlX2hvb2tfcmVzdWx0GBsgASgLMhsuYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXN1bHRIABIzCg9zdWJhZ2VudF9yZXN1bHQYHCABKAsyGC5hZ2VudC52MS5TdWJhZ2VudFJlc3VsdEgAEk0KHWZvcmNlX2JhY2tncm91bmRfc2hlbGxfcmVzdWx0GB4gASgLMiQuYWdlbnQudjEuRm9yY2VCYWNrZ3JvdW5kU2hlbGxSZXN1bHRIABJTCiBmb3JjZV9iYWNrZ3JvdW5kX3N1YmFnZW50X3Jlc3VsdBgfIAEoCzInLmFnZW50LnYxLkZvcmNlQmFja2dyb3VuZFN1YmFnZW50UmVzdWx0SAASPgoVc3ViYWdlbnRfYXdhaXRfcmVzdWx0GCUgASgLMh0uYWdlbnQudjEuU3ViYWdlbnRBd2FpdFJlc3VsdEgAEksKHHNtYXJ0X21vZGVfY2xhc3NpZmllcl9yZXN1bHQYJiABKAsyIy5hZ2VudC52MS5TbWFydE1vZGVDbGFzc2lmaWVyUmVzdWx0SAASRgoZY2FudmFzX2RpYWdub3N0aWNzX3Jlc3VsdBgoIAEoCzIhLmFnZW50LnYxLkNhbnZhc0RpYWdub3N0aWNzUmVzdWx0SAASUQofc2hlbGxfYWxsb3dsaXN0X3ByZWNoZWNrX3Jlc3VsdBgpIAEoCzImLmFnZW50LnYxLlNoZWxsQWxsb3dsaXN0UHJlY2hlY2tSZXN1bHRIABJNCh1tY3BfYWxsb3dsaXN0X3ByZWNoZWNrX3Jlc3VsdBgqIAEoCzIkLmFnZW50LnYxLk1jcEFsbG93bGlzdFByZWNoZWNrUmVzdWx0SAASWAojd2ViX2ZldGNoX2FsbG93bGlzdF9wcmVjaGVja19yZXN1bHQYKyABKAsyKS5hZ2VudC52MS5XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrUmVzdWx0SAASNgoRZ2l0X2RpZmZfcmVzcG9uc2UYLCABKAsyGS5hZ2VudC52MS5HZXREaWZmUmVzcG9uc2VIABI0Cg5waV9yZWFkX3Jlc3VsdBguIAEoCzIaLmFnZW50LnYxLlBpUmVhZEV4ZWNSZXN1bHRIABI0Cg5waV9iYXNoX3Jlc3VsdBgvIAEoCzIaLmFnZW50LnYxLlBpQmFzaEV4ZWNSZXN1bHRIABI0Cg5waV9lZGl0X3Jlc3VsdBgwIAEoCzIaLmFnZW50LnYxLlBpRWRpdEV4ZWNSZXN1bHRIABI2Cg9waV93cml0ZV9yZXN1bHQYMSABKAsyGy5hZ2VudC52MS5QaVdyaXRlRXhlY1Jlc3VsdEgAEjQKDnBpX2dyZXBfcmVzdWx0GDIgASgLMhouYWdlbnQudjEuUGlHcmVwRXhlY1Jlc3VsdEgAEjQKDnBpX2ZpbmRfcmVzdWx0GDMgASgLMhouYWdlbnQudjEuUGlGaW5kRXhlY1Jlc3VsdEgAEjAKDHBpX2xzX3Jlc3VsdBg0IAEoCzIYLmFnZW50LnYxLlBpTHNFeGVjUmVzdWx0SAASSAoaY29udmVyc2F0aW9uX3NlYXJjaF9yZXN1bHQYNSABKAsyIi5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hSZXN1bHRIABJJChthZ2VudF9zdG9yZV9jb25mbGljdF9yZXN1bHQYNiABKAsyIi5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RSZXN1bHRIABI7ChptaW5pX3N3ZV9hZ2VudF9iYXNoX3Jlc3VsdBg3IAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SAASJAoXbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMYJyABKAVIAYgBARJBChhob29rX2FkZGl0aW9uYWxfY29udGV4dHMYLSADKAsyHy5hZ2VudC52MS5Ib29rQWRkaXRpb25hbENvbnRleHRCCQoHbWVzc2FnZUIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMiLgoJRmV0Y2hBcmdzEgsKA3VybBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAkiaQoLRmV0Y2hSZXN1bHQSKQoHc3VjY2VzcxgBIAEoCzIWLmFnZW50LnYxLkZldGNoU3VjY2Vzc0gAEiUKBWVycm9yGAIgASgLMhQuYWdlbnQudjEuRmV0Y2hFcnJvckgAQggKBnJlc3VsdCJXCgxGZXRjaFN1Y2Nlc3MSCwoDdXJsGAEgASgJEg8KB2NvbnRlbnQYAiABKAkSEwoLc3RhdHVzX2NvZGUYAyABKAUSFAoMY29udGVudF90eXBlGAQgASgJIigKCkZldGNoRXJyb3ISCwoDdXJsGAEgASgJEg0KBWVycm9yGAIgASgJIm0KEUdlbmVyYXRlSW1hZ2VBcmdzEhMKC2Rlc2NyaXB0aW9uGAEgASgJEhYKCWZpbGVfcGF0aBgCIAEoCUgAiAEBEh0KFXJlZmVyZW5jZV9pbWFnZV9wYXRocxgFIAMoCUIMCgpfZmlsZV9wYXRoIoEBChNHZW5lcmF0ZUltYWdlUmVzdWx0EjEKB3N1Y2Nlc3MYASABKAsyHi5hZ2VudC52MS5HZW5lcmF0ZUltYWdlU3VjY2Vzc0gAEi0KBWVycm9yGAIgASgLMhwuYWdlbnQudjEuR2VuZXJhdGVJbWFnZUVycm9ySABCCAoGcmVzdWx0Ij0KFEdlbmVyYXRlSW1hZ2VTdWNjZXNzEhEKCWZpbGVfcGF0aBgBIAEoCRISCgppbWFnZV9kYXRhGAIgASgJIiMKEkdlbmVyYXRlSW1hZ2VFcnJvchINCgVlcnJvchgBIAEoCSJxChVHZW5lcmF0ZUltYWdlVG9vbENhbGwSKQoEYXJncxgBIAEoCzIbLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VBcmdzEi0KBnJlc3VsdBgCIAEoCzIdLmFnZW50LnYxLkdlbmVyYXRlSW1hZ2VSZXN1bHQi5gQKCEdyZXBBcmdzEg8KB3BhdHRlcm4YASABKAkSEQoEcGF0aBgCIAEoCUgAiAEBEhEKBGdsb2IYAyABKAlIAYgBARIYCgtvdXRwdXRfbW9kZRgEIAEoCUgCiAEBEhsKDmNvbnRleHRfYmVmb3JlGAUgASgFSAOIAQESGgoNY29udGV4dF9hZnRlchgGIAEoBUgEiAEBEhQKB2NvbnRleHQYByABKAVIBYgBARIdChBjYXNlX2luc2Vuc2l0aXZlGAggASgISAaIAQESEQoEdHlwZRgJIAEoCUgHiAEBEhcKCmhlYWRfbGltaXQYCiABKAVICIgBARIWCgltdWx0aWxpbmUYCyABKAhICYgBARIRCgRzb3J0GAwgASgJSAqIAQESGwoOc29ydF9hc2NlbmRpbmcYDSABKAhIC4gBARIUCgx0b29sX2NhbGxfaWQYDiABKAkSNAoOc2FuZGJveF9wb2xpY3kYDyABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SAyIAQESEwoGb2Zmc2V0GBAgASgFSA2IAQFCBwoFX3BhdGhCBwoFX2dsb2JCDgoMX291dHB1dF9tb2RlQhEKD19jb250ZXh0X2JlZm9yZUIQCg5fY29udGV4dF9hZnRlckIKCghfY29udGV4dEITChFfY2FzZV9pbnNlbnNpdGl2ZUIHCgVfdHlwZUINCgtfaGVhZF9saW1pdEIMCgpfbXVsdGlsaW5lQgcKBV9zb3J0QhEKD19zb3J0X2FzY2VuZGluZ0IRCg9fc2FuZGJveF9wb2xpY3lCCQoHX29mZnNldCJmCgpHcmVwUmVzdWx0EigKB3N1Y2Nlc3MYASABKAsyFS5hZ2VudC52MS5HcmVwU3VjY2Vzc0gAEiQKBWVycm9yGAIgASgLMhMuYWdlbnQudjEuR3JlcEVycm9ySABCCAoGcmVzdWx0IhoKCUdyZXBFcnJvchINCgVlcnJvchgBIAEoCSK0AgoLR3JlcFN1Y2Nlc3MSDwoHcGF0dGVybhgBIAEoCRIMCgRwYXRoGAIgASgJEhMKC291dHB1dF9tb2RlGAMgASgJEkYKEXdvcmtzcGFjZV9yZXN1bHRzGAQgAygLMisuYWdlbnQudjEuR3JlcFN1Y2Nlc3MuV29ya3NwYWNlUmVzdWx0c0VudHJ5EjwKFGFjdGl2ZV9lZGl0b3JfcmVzdWx0GAUgASgLMhkuYWdlbnQudjEuR3JlcFVuaW9uUmVzdWx0SACIAQEaUgoVV29ya3NwYWNlUmVzdWx0c0VudHJ5EgsKA2tleRgBIAEoCRIoCgV2YWx1ZRgCIAEoCzIZLmFnZW50LnYxLkdyZXBVbmlvblJlc3VsdDoCOAFCFwoVX2FjdGl2ZV9lZGl0b3JfcmVzdWx0IqMBCg9HcmVwVW5pb25SZXN1bHQSKgoFY291bnQYASABKAsyGS5hZ2VudC52MS5HcmVwQ291bnRSZXN1bHRIABIqCgVmaWxlcxgCIAEoCzIZLmFnZW50LnYxLkdyZXBGaWxlc1Jlc3VsdEgAEi4KB2NvbnRlbnQYAyABKAsyGy5hZ2VudC52MS5HcmVwQ29udGVudFJlc3VsdEgAQggKBnJlc3VsdCKDAgoPR3JlcENvdW50UmVzdWx0EicKBmNvdW50cxgBIAMoCzIXLmFnZW50LnYxLkdyZXBGaWxlQ291bnQSEwoLdG90YWxfZmlsZXMYAiABKAUSFQoNdG90YWxfbWF0Y2hlcxgDIAEoBRIYChBjbGllbnRfdHJ1bmNhdGVkGAQgASgIEhkKEXJpcGdyZXBfdHJ1bmNhdGVkGAUgASgIEh8KEmhlYWRfbGltaXRfYXBwbGllZBgGIAEoBUgAiAEBEhsKDm9mZnNldF9hcHBsaWVkGAcgASgFSAGIAQFCFQoTX2hlYWRfbGltaXRfYXBwbGllZEIRCg9fb2Zmc2V0X2FwcGxpZWQiLAoNR3JlcEZpbGVDb3VudBIMCgRmaWxlGAEgASgJEg0KBWNvdW50GAIgASgFItIBCg9HcmVwRmlsZXNSZXN1bHQSDQoFZmlsZXMYASADKAkSEwoLdG90YWxfZmlsZXMYAiABKAUSGAoQY2xpZW50X3RydW5jYXRlZBgDIAEoCBIZChFyaXBncmVwX3RydW5jYXRlZBgEIAEoCBIfChJoZWFkX2xpbWl0X2FwcGxpZWQYBSABKAVIAIgBARIbCg5vZmZzZXRfYXBwbGllZBgGIAEoBUgBiAEBQhUKE19oZWFkX2xpbWl0X2FwcGxpZWRCEQoPX29mZnNldF9hcHBsaWVkIowCChFHcmVwQ29udGVudFJlc3VsdBIoCgdtYXRjaGVzGAEgAygLMhcuYWdlbnQudjEuR3JlcEZpbGVNYXRjaBITCgt0b3RhbF9saW5lcxgCIAEoBRIbChN0b3RhbF9tYXRjaGVkX2xpbmVzGAMgASgFEhgKEGNsaWVudF90cnVuY2F0ZWQYBCABKAgSGQoRcmlwZ3JlcF90cnVuY2F0ZWQYBSABKAgSHwoSaGVhZF9saW1pdF9hcHBsaWVkGAYgASgFSACIAQESGwoOb2Zmc2V0X2FwcGxpZWQYByABKAVIAYgBAUIVChNfaGVhZF9saW1pdF9hcHBsaWVkQhEKD19vZmZzZXRfYXBwbGllZCJKCg1HcmVwRmlsZU1hdGNoEgwKBGZpbGUYASABKAkSKwoHbWF0Y2hlcxgCIAMoCzIaLmFnZW50LnYxLkdyZXBDb250ZW50TWF0Y2gibAoQR3JlcENvbnRlbnRNYXRjaBITCgtsaW5lX251bWJlchgBIAEoBRIPCgdjb250ZW50GAIgASgJEhkKEWNvbnRlbnRfdHJ1bmNhdGVkGAMgASgIEhcKD2lzX2NvbnRleHRfbGluZRgEIAEoCCIdCgpHcmVwU3RyZWFtEg8KB3BhdHRlcm4YASABKAkiVgoMR3JlcFRvb2xDYWxsEiAKBGFyZ3MYASABKAsyEi5hZ2VudC52MS5HcmVwQXJncxIkCgZyZXN1bHQYAiABKAsyFC5hZ2VudC52MS5HcmVwUmVzdWx0Ih4KC0dldEJsb2JBcmdzEg8KB2Jsb2JfaWQYASABKAwiNQoNR2V0QmxvYlJlc3VsdBIWCglibG9iX2RhdGEYASABKAxIAIgBAUIMCgpfYmxvYl9kYXRhIjEKC1NldEJsb2JBcmdzEg8KB2Jsb2JfaWQYASABKAwSEQoJYmxvYl9kYXRhGAIgASgMIj4KDVNldEJsb2JSZXN1bHQSIwoFZXJyb3IYASABKAsyDy5hZ2VudC52MS5FcnJvckgAiAEBQggKBl9lcnJvciLLAQoPS3ZTZXJ2ZXJNZXNzYWdlEgoKAmlkGAEgASgNEjAKDHNwYW5fY29udGV4dBgEIAEoCzIVLmFnZW50LnYxLlNwYW5Db250ZXh0SAGIAQESLgoNZ2V0X2Jsb2JfYXJncxgCIAEoCzIVLmFnZW50LnYxLkdldEJsb2JBcmdzSAASLgoNc2V0X2Jsb2JfYXJncxgDIAEoCzIVLmFnZW50LnYxLlNldEJsb2JBcmdzSABCCQoHbWVzc2FnZUIPCg1fc3Bhbl9jb250ZXh0IpABCg9LdkNsaWVudE1lc3NhZ2USCgoCaWQYASABKA0SMgoPZ2V0X2Jsb2JfcmVzdWx0GAIgASgLMhcuYWdlbnQudjEuR2V0QmxvYlJlc3VsdEgAEjIKD3NldF9ibG9iX3Jlc3VsdBgDIAEoCzIXLmFnZW50LnYxLlNldEJsb2JSZXN1bHRIAEIJCgdtZXNzYWdlIq0BCgZMc0FyZ3MSDAoEcGF0aBgBIAEoCRIOCgZpZ25vcmUYAiADKAkSFAoMdG9vbF9jYWxsX2lkGAMgASgJEjQKDnNhbmRib3hfcG9saWN5GAQgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgAiAEBEhcKCnRpbWVvdXRfbXMYBSABKA1IAYgBAUIRCg9fc2FuZGJveF9wb2xpY3lCDQoLX3RpbWVvdXRfbXMisgEKCExzUmVzdWx0EiYKB3N1Y2Nlc3MYASABKAsyEy5hZ2VudC52MS5Mc1N1Y2Nlc3NIABIiCgVlcnJvchgCIAEoCzIRLmFnZW50LnYxLkxzRXJyb3JIABIoCghyZWplY3RlZBgDIAEoCzIULmFnZW50LnYxLkxzUmVqZWN0ZWRIABImCgd0aW1lb3V0GAQgASgLMhMuYWdlbnQudjEuTHNUaW1lb3V0SABCCAoGcmVzdWx0IkcKCUxzU3VjY2VzcxI6ChNkaXJlY3RvcnlfdHJlZV9yb290GAEgASgLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZSL2AgoTTHNEaXJlY3RvcnlUcmVlTm9kZRIQCghhYnNfcGF0aBgBIAEoCRI0Cg1jaGlsZHJlbl9kaXJzGAIgAygLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZRI6Cg5jaGlsZHJlbl9maWxlcxgDIAMoCzIiLmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGVfRmlsZRIfChdjaGlsZHJlbl93ZXJlX3Byb2Nlc3NlZBgEIAEoCBJkCh1mdWxsX3N1YnRyZWVfZXh0ZW5zaW9uX2NvdW50cxgFIAMoCzI9LmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGUuRnVsbFN1YnRyZWVFeHRlbnNpb25Db3VudHNFbnRyeRIRCgludW1fZmlsZXMYBiABKAUaQQofRnVsbFN1YnRyZWVFeHRlbnNpb25Db3VudHNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAU6AjgBInoKGExzRGlyZWN0b3J5VHJlZU5vZGVfRmlsZRIMCgRuYW1lGAEgASgJEjoKEXRlcm1pbmFsX21ldGFkYXRhGAIgASgLMhouYWdlbnQudjEuVGVybWluYWxNZXRhZGF0YUgAiAEBQhQKEl90ZXJtaW5hbF9tZXRhZGF0YSImCgdMc0Vycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiKgoKTHNSZWplY3RlZBIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJHCglMc1RpbWVvdXQSOgoTZGlyZWN0b3J5X3RyZWVfcm9vdBgBIAEoCzIdLmFnZW50LnYxLkxzRGlyZWN0b3J5VHJlZU5vZGUi8QEKEFRlcm1pbmFsTWV0YWRhdGESEAoDY3dkGAEgASgJSACIAQESOQoNbGFzdF9jb21tYW5kcxgCIAMoCzIiLmFnZW50LnYxLlRlcm1pbmFsTWV0YWRhdGFfQ29tbWFuZBIdChBsYXN0X21vZGlmaWVkX21zGAMgASgDSAGIAQESQAoPY3VycmVudF9jb21tYW5kGAQgASgLMiIuYWdlbnQudjEuVGVybWluYWxNZXRhZGF0YV9Db21tYW5kSAKIAQFCBgoEX2N3ZEITChFfbGFzdF9tb2RpZmllZF9tc0ISChBfY3VycmVudF9jb21tYW5kIqcBChhUZXJtaW5hbE1ldGFkYXRhX0NvbW1hbmQSDwoHY29tbWFuZBgBIAEoCRIWCglleGl0X2NvZGUYAiABKAVIAIgBARIZCgx0aW1lc3RhbXBfbXMYAyABKANIAYgBARIYCgtkdXJhdGlvbl9tcxgEIAEoA0gCiAEBQgwKCl9leGl0X2NvZGVCDwoNX3RpbWVzdGFtcF9tc0IOCgxfZHVyYXRpb25fbXMiUAoKTHNUb29sQ2FsbBIeCgRhcmdzGAEgASgLMhAuYWdlbnQudjEuTHNBcmdzEiIKBnJlc3VsdBgCIAEoCzISLmFnZW50LnYxLkxzUmVzdWx0IuACCgdNY3BBcmdzEgwKBG5hbWUYASABKAkSKQoEYXJncxgCIAMoCzIbLmFnZW50LnYxLk1jcEFyZ3MuQXJnc0VudHJ5EhQKDHRvb2xfY2FsbF9pZBgDIAEoCRIbChNwcm92aWRlcl9pZGVudGlmaWVyGAQgASgJEhEKCXRvb2xfbmFtZRgFIAEoCRI9ChNzbWFydF9tb2RlX2FwcHJvdmFsGAYgASgLMhsuYWdlbnQudjEuU21hcnRNb2RlQXBwcm92YWxIAIgBARIgChhzbWFydF9tb2RlX2FwcHJvdmFsX29ubHkYByABKAgSFQoNc2tpcF9hcHByb3ZhbBgIIAEoCBIZChFzZXJ2ZXJfaWRlbnRpZmllchgJIAEoCRorCglBcmdzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgMOgI4AUIWChRfc21hcnRfbW9kZV9hcHByb3ZhbCLjAgoJTWNwUmVzdWx0EicKB3N1Y2Nlc3MYASABKAsyFC5hZ2VudC52MS5NY3BTdWNjZXNzSAASIwoFZXJyb3IYAiABKAsyEi5hZ2VudC52MS5NY3BFcnJvckgAEikKCHJlamVjdGVkGAMgASgLMhUuYWdlbnQudjEuTWNwUmVqZWN0ZWRIABI6ChFwZXJtaXNzaW9uX2RlbmllZBgEIAEoCzIdLmFnZW50LnYxLk1jcFBlcm1pc3Npb25EZW5pZWRIABIzCg50b29sX25vdF9mb3VuZBgFIAEoCzIZLmFnZW50LnYxLk1jcFRvb2xOb3RGb3VuZEgAEjcKEHNlcnZlcl9ub3RfZm91bmQYBiABKAsyGy5hZ2VudC52MS5NY3BTZXJ2ZXJOb3RGb3VuZEgAEikKCGFwcHJvdmVkGAcgASgLMhUuYWdlbnQudjEuTWNwQXBwcm92ZWRIAEIICgZyZXN1bHQiOAoPTWNwVG9vbE5vdEZvdW5kEgwKBG5hbWUYASABKAkSFwoPYXZhaWxhYmxlX3Rvb2xzGAIgAygJImoKDk1jcFRleHRDb250ZW50EgwKBHRleHQYASABKAkSNgoPb3V0cHV0X2xvY2F0aW9uGAIgASgLMhguYWdlbnQudjEuT3V0cHV0TG9jYXRpb25IAIgBAUISChBfb3V0cHV0X2xvY2F0aW9uIjIKD01jcEltYWdlQ29udGVudBIMCgRkYXRhGAEgASgMEhEKCW1pbWVfdHlwZRgCIAEoCSJ7ChhNY3BUb29sUmVzdWx0Q29udGVudEl0ZW0SKAoEdGV4dBgBIAEoCzIYLmFnZW50LnYxLk1jcFRleHRDb250ZW50SAASKgoFaW1hZ2UYAiABKAsyGS5hZ2VudC52MS5NY3BJbWFnZUNvbnRlbnRIAEIJCgdjb250ZW50IlMKCk1jcFN1Y2Nlc3MSMwoHY29udGVudBgBIAMoCzIiLmFnZW50LnYxLk1jcFRvb2xSZXN1bHRDb250ZW50SXRlbRIQCghpc19lcnJvchgCIAEoCCIZCghNY3BFcnJvchINCgVlcnJvchgBIAEoCSIyCgtNY3BSZWplY3RlZBIOCgZyZWFzb24YASABKAkSEwoLaXNfcmVhZG9ubHkYAiABKAgiOQoTTWNwUGVybWlzc2lvbkRlbmllZBINCgVlcnJvchgBIAEoCRITCgtpc19yZWFkb25seRgCIAEoCCI6ChhMaXN0TWNwUmVzb3VyY2VzRXhlY0FyZ3MSEwoGc2VydmVyGAEgASgJSACIAQFCCQoHX3NlcnZlciLGAQoaTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHQSNAoHc3VjY2VzcxgBIAEoCzIhLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNTdWNjZXNzSAASMAoFZXJyb3IYAiABKAsyHy5hZ2VudC52MS5MaXN0TWNwUmVzb3VyY2VzRXJyb3JIABI2CghyZWplY3RlZBgDIAEoCzIiLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNSZWplY3RlZEgAQggKBnJlc3VsdCK9AgomTGlzdE1jcFJlc291cmNlc0V4ZWNSZXN1bHRfTWNwUmVzb3VyY2USCwoDdXJpGAEgASgJEhEKBG5hbWUYAiABKAlIAIgBARIYCgtkZXNjcmlwdGlvbhgDIAEoCUgBiAEBEhYKCW1pbWVfdHlwZRgEIAEoCUgCiAEBEg4KBnNlcnZlchgFIAEoCRJWCgthbm5vdGF0aW9ucxgGIAMoCzJBLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNFeGVjUmVzdWx0X01jcFJlc291cmNlLkFubm90YXRpb25zRW50cnkaMgoQQW5ub3RhdGlvbnNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBQgcKBV9uYW1lQg4KDF9kZXNjcmlwdGlvbkIMCgpfbWltZV90eXBlIl4KF0xpc3RNY3BSZXNvdXJjZXNTdWNjZXNzEkMKCXJlc291cmNlcxgBIAMoCzIwLmFnZW50LnYxLkxpc3RNY3BSZXNvdXJjZXNFeGVjUmVzdWx0X01jcFJlc291cmNlIiYKFUxpc3RNY3BSZXNvdXJjZXNFcnJvchINCgVlcnJvchgBIAEoCSIqChhMaXN0TWNwUmVzb3VyY2VzUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJItEBChdSZWFkTWNwUmVzb3VyY2VFeGVjQXJncxIOCgZzZXJ2ZXIYASABKAkSCwoDdXJpGAIgASgJEhoKDWRvd25sb2FkX3BhdGgYAyABKAlIAIgBARIUCgx0b29sX2NhbGxfaWQYBCABKAkSPQoTc21hcnRfbW9kZV9hcHByb3ZhbBgFIAEoCzIbLmFnZW50LnYxLlNtYXJ0TW9kZUFwcHJvdmFsSAGIAQFCEAoOX2Rvd25sb2FkX3BhdGhCFgoUX3NtYXJ0X21vZGVfYXBwcm92YWwi+gEKGVJlYWRNY3BSZXNvdXJjZUV4ZWNSZXN1bHQSMwoHc3VjY2VzcxgBIAEoCzIgLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZVN1Y2Nlc3NIABIvCgVlcnJvchgCIAEoCzIeLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZUVycm9ySAASNQoIcmVqZWN0ZWQYAyABKAsyIS5hZ2VudC52MS5SZWFkTWNwUmVzb3VyY2VSZWplY3RlZEgAEjYKCW5vdF9mb3VuZBgEIAEoCzIhLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZU5vdEZvdW5kSABCCAoGcmVzdWx0IrIDChZSZWFkTWNwUmVzb3VyY2VTdWNjZXNzEgsKA3VyaRgBIAEoCRIRCgRuYW1lGAIgASgJSAGIAQESGAoLZGVzY3JpcHRpb24YAyABKAlIAogBARIWCgltaW1lX3R5cGUYBCABKAlIA4gBARJGCgthbm5vdGF0aW9ucxgHIAMoCzIxLmFnZW50LnYxLlJlYWRNY3BSZXNvdXJjZVN1Y2Nlc3MuQW5ub3RhdGlvbnNFbnRyeRIaCg1kb3dubG9hZF9wYXRoGAggASgJSASIAQESDgoEdGV4dBgFIAEoCUgAEg4KBGJsb2IYBiABKAxIABI2Cg9vdXRwdXRfbG9jYXRpb24YCSABKAsyGC5hZ2VudC52MS5PdXRwdXRMb2NhdGlvbkgFiAEBGjIKEEFubm90YXRpb25zRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIJCgdjb250ZW50QgcKBV9uYW1lQg4KDF9kZXNjcmlwdGlvbkIMCgpfbWltZV90eXBlQhAKDl9kb3dubG9hZF9wYXRoQhIKEF9vdXRwdXRfbG9jYXRpb24iMgoUUmVhZE1jcFJlc291cmNlRXJyb3ISCwoDdXJpGAEgASgJEg0KBWVycm9yGAIgASgJIjYKF1JlYWRNY3BSZXNvdXJjZVJlamVjdGVkEgsKA3VyaRgBIAEoCRIOCgZyZWFzb24YAiABKAkiJgoXUmVhZE1jcFJlc291cmNlTm90Rm91bmQSCwoDdXJpGAEgASgJIrIBChFNY3BUb29sRGVmaW5pdGlvbhIMCgRuYW1lGAEgASgJEhsKE3Byb3ZpZGVyX2lkZW50aWZpZXIYBCABKAkSEQoJdG9vbF9uYW1lGAUgASgJEhMKC2Rlc2NyaXB0aW9uGAIgASgJEhQKDGlucHV0X3NjaGVtYRgDIAEoDBIeChFpbnB1dF9zY2hlbWFfanNvbhgGIAEoCUgAiAEBQhQKEl9pbnB1dF9zY2hlbWFfanNvbiI6CghNY3BUb29scxIuCgltY3BfdG9vbHMYASADKAsyGy5hZ2VudC52MS5NY3BUb29sRGVmaW5pdGlvbiJXCg9NY3BJbnN0cnVjdGlvbnMSEwoLc2VydmVyX25hbWUYASABKAkSFAoMaW5zdHJ1Y3Rpb25zGAIgASgJEhkKEXNlcnZlcl9pZGVudGlmaWVyGAMgASgJIv0CCg1NY3BEZXNjcmlwdG9yEhMKC3NlcnZlcl9uYW1lGAEgASgJEhkKEXNlcnZlcl9pZGVudGlmaWVyGAIgASgJEhgKC2ZvbGRlcl9wYXRoGAMgASgJSACIAQESJAoXc2VydmVyX3VzZV9pbnN0cnVjdGlvbnMYBCABKAlIAYgBARIqCgV0b29scxgFIAMoCzIbLmFnZW50LnYxLk1jcFRvb2xEZXNjcmlwdG9yEhMKBnBsdWdpbhgHIAEoCUgCiAEBEhgKC21hcmtldHBsYWNlGAggASgJSAOIAQESGQoMcGx1Z2luX2RiX2lkGAkgASgJSASIAQESGwoObWFya2V0cGxhY2VfaWQYCiABKAlIBYgBAUIOCgxfZm9sZGVyX3BhdGhCGgoYX3NlcnZlcl91c2VfaW5zdHJ1Y3Rpb25zQgkKB19wbHVnaW5CDgoMX21hcmtldHBsYWNlQg8KDV9wbHVnaW5fZGJfaWRCEQoPX21hcmtldHBsYWNlX2lkIrgBChFNY3BUb29sRGVzY3JpcHRvchIRCgl0b29sX25hbWUYASABKAkSHAoPZGVmaW5pdGlvbl9wYXRoGAIgASgJSACIAQESGAoLZGVzY3JpcHRpb24YAyABKAlIAYgBARIeChFpbnB1dF9zY2hlbWFfanNvbhgFIAEoCUgCiAEBQhIKEF9kZWZpbml0aW9uX3BhdGhCDgoMX2Rlc2NyaXB0aW9uQhQKEl9pbnB1dF9zY2hlbWFfanNvbiJ4ChRNY3BGaWxlU3lzdGVtT3B0aW9ucxIPCgdlbmFibGVkGAEgASgIEh0KFXdvcmtzcGFjZV9wcm9qZWN0X2RpchgCIAEoCRIwCg9tY3BfZGVzY3JpcHRvcnMYAyADKAsyFy5hZ2VudC52MS5NY3BEZXNjcmlwdG9yIpoBCghSZWFkQXJncxIMCgRwYXRoGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCRITCgZvZmZzZXQYBCABKAVIAIgBARISCgVsaW1pdBgFIAEoDUgBiAEBEhoKDWVuY29kaW5nX2hpbnQYBiABKAlIAogBAUIJCgdfb2Zmc2V0QggKBl9saW1pdEIQCg5fZW5jb2RpbmdfaGludCK4AgoKUmVhZFJlc3VsdBIoCgdzdWNjZXNzGAEgASgLMhUuYWdlbnQudjEuUmVhZFN1Y2Nlc3NIABIkCgVlcnJvchgCIAEoCzITLmFnZW50LnYxLlJlYWRFcnJvckgAEioKCHJlamVjdGVkGAMgASgLMhYuYWdlbnQudjEuUmVhZFJlamVjdGVkSAASNAoOZmlsZV9ub3RfZm91bmQYBCABKAsyGi5hZ2VudC52MS5SZWFkRmlsZU5vdEZvdW5kSAASOwoRcGVybWlzc2lvbl9kZW5pZWQYBSABKAsyHi5hZ2VudC52MS5SZWFkUGVybWlzc2lvbkRlbmllZEgAEjEKDGludmFsaWRfZmlsZRgGIAEoCzIZLmFnZW50LnYxLlJlYWRJbnZhbGlkRmlsZUgAQggKBnJlc3VsdCLKAQoLUmVhZFN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRITCgt0b3RhbF9saW5lcxgDIAEoBRIRCglmaWxlX3NpemUYBCABKAMSEQoJdHJ1bmNhdGVkGAYgASgIEhsKDm91dHB1dF9ibG9iX2lkGAcgASgMSAGIAQESEQoHY29udGVudBgCIAEoCUgAEg4KBGRhdGEYBSABKAxIABIVCg1yYW5nZV9hcHBsaWVkGAggASgIQggKBm91dHB1dEIRCg9fb3V0cHV0X2Jsb2JfaWQiKAoJUmVhZEVycm9yEgwKBHBhdGgYASABKAkSDQoFZXJyb3IYAiABKAkiLAoMUmVhZFJlamVjdGVkEgwKBHBhdGgYASABKAkSDgoGcmVhc29uGAIgASgJIiAKEFJlYWRGaWxlTm90Rm91bmQSDAoEcGF0aBgBIAEoCSIkChRSZWFkUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJIi8KD1JlYWRJbnZhbGlkRmlsZRIMCgRwYXRoGAEgASgJEg4KBnJlYXNvbhgCIAEoCSJeCgxSZWFkVG9vbENhbGwSJAoEYXJncxgBIAEoCzIWLmFnZW50LnYxLlJlYWRUb29sQXJncxIoCgZyZXN1bHQYAiABKAsyGC5hZ2VudC52MS5SZWFkVG9vbFJlc3VsdCJaCgxSZWFkVG9vbEFyZ3MSDAoEcGF0aBgBIAEoCRITCgZvZmZzZXQYAiABKAVIAIgBARISCgVsaW1pdBgDIAEoBUgBiAEBQgkKB19vZmZzZXRCCAoGX2xpbWl0InIKDlJlYWRUb29sUmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5SZWFkVG9vbFN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLlJlYWRUb29sRXJyb3JIAEIICgZyZXN1bHQiMQoJUmVhZFJhbmdlEhIKCnN0YXJ0X2xpbmUYASABKA0SEAoIZW5kX2xpbmUYAiABKA0ijgIKD1JlYWRUb29sU3VjY2VzcxIQCghpc19lbXB0eRgCIAEoCBIWCg5leGNlZWRlZF9saW1pdBgDIAEoCBITCgt0b3RhbF9saW5lcxgEIAEoDRIRCglmaWxlX3NpemUYBSABKA0SDAoEcGF0aBgHIAEoCRIsCgpyZWFkX3JhbmdlGAggASgLMhMuYWdlbnQudjEuUmVhZFJhbmdlSAGIAQESEQoHY29udGVudBgBIAEoCUgAEg4KBGRhdGEYBiABKAxIABIWCgxkYXRhX2Jsb2JfaWQYCSABKAxIABIZCg9jb250ZW50X2Jsb2JfaWQYCiABKAxIAEIICgZvdXRwdXRCDQoLX3JlYWRfcmFuZ2UiJgoNUmVhZFRvb2xFcnJvchIVCg1lcnJvcl9tZXNzYWdlGAEgASgJImoKEFJlY29yZFNjcmVlbkFyZ3MSDAoEbW9kZRgBIAEoBRIUCgx0b29sX2NhbGxfaWQYAiABKAkSHQoQc2F2ZV9hc19maWxlbmFtZRgDIAEoCUgAiAEBQhMKEV9zYXZlX2FzX2ZpbGVuYW1lIokCChJSZWNvcmRTY3JlZW5SZXN1bHQSOwoNc3RhcnRfc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLlJlY29yZFNjcmVlblN0YXJ0U3VjY2Vzc0gAEjkKDHNhdmVfc3VjY2VzcxgCIAEoCzIhLmFnZW50LnYxLlJlY29yZFNjcmVlblNhdmVTdWNjZXNzSAASPwoPZGlzY2FyZF9zdWNjZXNzGAMgASgLMiQuYWdlbnQudjEuUmVjb3JkU2NyZWVuRGlzY2FyZFN1Y2Nlc3NIABIwCgdmYWlsdXJlGAQgASgLMh0uYWdlbnQudjEuUmVjb3JkU2NyZWVuRmFpbHVyZUgAQggKBnJlc3VsdCJnChhSZWNvcmRTY3JlZW5TdGFydFN1Y2Nlc3MSJQodd2FzX3ByaW9yX3JlY29yZGluZ19jYW5jZWxsZWQYASABKAgSJAocd2FzX3NhdmVfYXNfZmlsZW5hbWVfaWdub3JlZBgCIAEoCCKgAQoXUmVjb3JkU2NyZWVuU2F2ZVN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIdChVyZWNvcmRpbmdfZHVyYXRpb25fbXMYAiABKAMSMAojcmVxdWVzdGVkX2ZpbGVfcGF0aF9yZWplY3RlZF9yZWFzb24YAyABKAVIAIgBAUImCiRfcmVxdWVzdGVkX2ZpbGVfcGF0aF9yZWplY3RlZF9yZWFzb24iHAoaUmVjb3JkU2NyZWVuRGlzY2FyZFN1Y2Nlc3MiJAoTUmVjb3JkU2NyZWVuRmFpbHVyZRINCgVlcnJvchgBIAEoCSI2ChNDdXJzb3JQYWNrYWdlUHJvbXB0EgwKBG5hbWUYASABKAkSEQoJZmlsZV9wYXRoGAIgASgJIuIBCg1DdXJzb3JQYWNrYWdlEgwKBG5hbWUYASABKAkSEwoLZGVzY3JpcHRpb24YAiABKAkSEwoLZm9sZGVyX3BhdGgYAyABKAkSDwoHZW5hYmxlZBgEIAEoCBIYCgtwYXJzZV9lcnJvchgFIAEoCUgAiAEBEi4KB3Byb21wdHMYBiADKAsyHS5hZ2VudC52MS5DdXJzb3JQYWNrYWdlUHJvbXB0EhgKEHJlYWRtZV9maWxlX3BhdGgYByABKAkSFAoMcGFja2FnZV90eXBlGAggASgFQg4KDF9wYXJzZV9lcnJvciKrAgoWUmVwb3NpdG9yeUluZGV4aW5nSW5mbxIfChdyZWxhdGl2ZV93b3Jrc3BhY2VfcGF0aBgBIAEoCRITCgtyZW1vdGVfdXJscxgCIAMoCRIUCgxyZW1vdGVfbmFtZXMYAyADKAkSEQoJcmVwb19uYW1lGAQgASgJEhIKCnJlcG9fb3duZXIYBSABKAkSEgoKaXNfdHJhY2tlZBgGIAEoCBIQCghpc19sb2NhbBgHIAEoCBImChlvcnRob2dvbmFsX3RyYW5zZm9ybV9zZWVkGAggASgBSACIAQESFQoNd29ya3NwYWNlX3VyaRgJIAEoCRIbChNwYXRoX2VuY3J5cHRpb25fa2V5GAogASgJQhwKGl9vcnRob2dvbmFsX3RyYW5zZm9ybV9zZWVkIqwCChJSZXF1ZXN0Q29udGV4dEFyZ3MSHQoQbm90ZXNfc2Vzc2lvbl9pZBgCIAEoCUgAiAEBEhkKDHdvcmtzcGFjZV9pZBgDIAEoCUgBiAEBEiYKGXJlYWRfb25seV9waW5uZWRfdHJlZV9zaGEYBCABKAlIAogBARIoChtyZWFkX29ubHlfcGx1Z2luX2NhY2hlX3Jvb3QYBSABKAlIA4gBARIXCgp1c2VfY2FjaGVkGAcgASgISASIAQFCEwoRX25vdGVzX3Nlc3Npb25faWRCDwoNX3dvcmtzcGFjZV9pZEIcChpfcmVhZF9vbmx5X3Bpbm5lZF90cmVlX3NoYUIeChxfcmVhZF9vbmx5X3BsdWdpbl9jYWNoZV9yb290Qg0KC191c2VfY2FjaGVkIroBChRSZXF1ZXN0Q29udGV4dFJlc3VsdBIyCgdzdWNjZXNzGAEgASgLMh8uYWdlbnQudjEuUmVxdWVzdENvbnRleHRTdWNjZXNzSAASLgoFZXJyb3IYAiABKAsyHS5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dEVycm9ySAASNAoIcmVqZWN0ZWQYAyABKAsyIC5hZ2VudC52MS5SZXF1ZXN0Q29udGV4dFJlamVjdGVkSABCCAoGcmVzdWx0IooBChVSZXF1ZXN0Q29udGV4dFN1Y2Nlc3MSMQoPcmVxdWVzdF9jb250ZXh0GAEgASgLMhguYWdlbnQudjEuUmVxdWVzdENvbnRleHQSIwoWc2VydmVkX2Zyb21fZGlza19jYWNoZRgCIAEoCEgAiAEBQhkKF19zZXJ2ZWRfZnJvbV9kaXNrX2NhY2hlIiQKE1JlcXVlc3RDb250ZXh0RXJyb3ISDQoFZXJyb3IYASABKAkiKAoWUmVxdWVzdENvbnRleHRSZWplY3RlZBIOCgZyZWFzb24YASABKAkiwgEKCkltYWdlUHJvdG8SDAoEZGF0YRgBIAEoDBIMCgR1dWlkGAIgASgJEgwKBHBhdGgYAyABKAkSMQoJZGltZW5zaW9uGAQgASgLMh4uYWdlbnQudjEuSW1hZ2VQcm90b19EaW1lbnNpb24SJgoZdGFza19zcGVjaWZpY19kZXNjcmlwdGlvbhgGIAEoCUgAiAEBEhEKCW1pbWVfdHlwZRgHIAEoCUIcChpfdGFza19zcGVjaWZpY19kZXNjcmlwdGlvbiI1ChRJbWFnZVByb3RvX0RpbWVuc2lvbhINCgV3aWR0aBgBIAEoBRIOCgZoZWlnaHQYAiABKAUiaAoLR2l0UmVwb0luZm8SDAoEcGF0aBgBIAEoCRIOCgZzdGF0dXMYAiABKAkSEwoLYnJhbmNoX25hbWUYAyABKAkSFwoKcmVtb3RlX3VybBgEIAEoCUgAiAEBQg0KC19yZW1vdGVfdXJsIpsCChFSZXF1ZXN0Q29udGV4dEVudhISCgpvc192ZXJzaW9uGAEgASgJEhcKD3dvcmtzcGFjZV9wYXRocxgCIAMoCRINCgVzaGVsbBgDIAEoCRIXCg9zYW5kYm94X2VuYWJsZWQYBSABKAgSGAoQdGVybWluYWxzX2ZvbGRlchgHIAEoCRIhChlhZ2VudF9zaGFyZWRfbm90ZXNfZm9sZGVyGAggASgJEicKH2FnZW50X2NvbnZlcnNhdGlvbl9ub3Rlc19mb2xkZXIYCSABKAkSEQoJdGltZV96b25lGAogASgJEhYKDnByb2plY3RfZm9sZGVyGAsgASgJEiAKGGFnZW50X3RyYW5zY3JpcHRzX2ZvbGRlchgMIAEoCSI8Cg9EZWJ1Z01vZGVDb25maWcSEAoIbG9nX3BhdGgYASABKAkSFwoPc2VydmVyX2VuZHBvaW50GAIgASgJIrQBCg9Ta2lsbERlc2NyaXB0b3ISDAoEbmFtZRgBIAEoCRITCgtkZXNjcmlwdGlvbhgCIAEoCRITCgtmb2xkZXJfcGF0aBgDIAEoCRIPCgdlbmFibGVkGAQgASgIEhgKC3BhcnNlX2Vycm9yGAUgASgJSACIAQESGAoQcmVhZG1lX2ZpbGVfcGF0aBgGIAEoCRIUCgxwYWNrYWdlX3R5cGUYByABKAVCDgoMX3BhcnNlX2Vycm9yIkQKDFNraWxsT3B0aW9ucxI0ChFza2lsbF9kZXNjcmlwdG9ycxgBIAMoCzIZLmFnZW50LnYxLlNraWxsRGVzY3JpcHRvciL2CAoOUmVxdWVzdENvbnRleHQSIwoFcnVsZXMYAiADKAsyFC5hZ2VudC52MS5DdXJzb3JSdWxlEigKA2VudhgEIAEoCzIbLmFnZW50LnYxLlJlcXVlc3RDb250ZXh0RW52EjkKD3JlcG9zaXRvcnlfaW5mbxgGIAMoCzIgLmFnZW50LnYxLlJlcG9zaXRvcnlJbmRleGluZ0luZm8SKgoFdG9vbHMYByADKAsyGy5hZ2VudC52MS5NY3BUb29sRGVmaW5pdGlvbhInChpjb252ZXJzYXRpb25fbm90ZXNfbGlzdGluZxgIIAEoCUgAiAEBEiEKFHNoYXJlZF9ub3Rlc19saXN0aW5nGAkgASgJSAGIAQESKAoJZ2l0X3JlcG9zGAsgAygLMhUuYWdlbnQudjEuR2l0UmVwb0luZm8SNgoPcHJvamVjdF9sYXlvdXRzGA0gAygLMh0uYWdlbnQudjEuTHNEaXJlY3RvcnlUcmVlTm9kZRIzChBtY3BfaW5zdHJ1Y3Rpb25zGA4gAygLMhkuYWdlbnQudjEuTWNwSW5zdHJ1Y3Rpb25zEjkKEWRlYnVnX21vZGVfY29uZmlnGA8gASgLMhkuYWdlbnQudjEuRGVidWdNb2RlQ29uZmlnSAKIAQESFwoKY2xvdWRfcnVsZRgQIAEoCUgDiAEBEh8KEndlYl9zZWFyY2hfZW5hYmxlZBgRIAEoCEgEiAEBEjIKDXNraWxsX29wdGlvbnMYEiABKAsyFi5hZ2VudC52MS5Ta2lsbE9wdGlvbnNIBYgBARIuCiFyZXBvc2l0b3J5X2luZm9fc2hvdWxkX3F1ZXJ5X3Byb2QYEyABKAhIBogBARJBCg1maWxlX2NvbnRlbnRzGBQgAygLMiouYWdlbnQudjEuUmVxdWVzdENvbnRleHQuRmlsZUNvbnRlbnRzRW50cnkSIAoTdXNlcl9pbnRlbnRfc3VtbWFyeRgVIAEoCUgHiAEBEjIKEGN1c3RvbV9zdWJhZ2VudHMYFiADKAsyGC5hZ2VudC52MS5DdXN0b21TdWJhZ2VudBJEChdtY3BfZmlsZV9zeXN0ZW1fb3B0aW9ucxgXIAEoCzIeLmFnZW50LnYxLk1jcEZpbGVTeXN0ZW1PcHRpb25zSAiIAQEaMwoRRmlsZUNvbnRlbnRzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIdChtfY29udmVyc2F0aW9uX25vdGVzX2xpc3RpbmdCFwoVX3NoYXJlZF9ub3Rlc19saXN0aW5nQhQKEl9kZWJ1Z19tb2RlX2NvbmZpZ0INCgtfY2xvdWRfcnVsZUIVChNfd2ViX3NlYXJjaF9lbmFibGVkQhAKDl9za2lsbF9vcHRpb25zQiQKIl9yZXBvc2l0b3J5X2luZm9fc2hvdWxkX3F1ZXJ5X3Byb2RCFgoUX3VzZXJfaW50ZW50X3N1bW1hcnlCGgoYX21jcF9maWxlX3N5c3RlbV9vcHRpb25zIrICCg1TYW5kYm94UG9saWN5EgwKBHR5cGUYASABKAUSGwoObmV0d29ya19hY2Nlc3MYAiABKAhIAIgBARIiChphZGRpdGlvbmFsX3JlYWR3cml0ZV9wYXRocxgDIAMoCRIhChlhZGRpdGlvbmFsX3JlYWRvbmx5X3BhdGhzGAQgAygJEh0KEGRlYnVnX291dHB1dF9kaXIYBSABKAlIAYgBARIdChBibG9ja19naXRfd3JpdGVzGAYgASgISAKIAQESHgoRZGlzYWJsZV90bXBfd3JpdGUYByABKAhIA4gBAUIRCg9fbmV0d29ya19hY2Nlc3NCEwoRX2RlYnVnX291dHB1dF9kaXJCEwoRX2Jsb2NrX2dpdF93cml0ZXNCFAoSX2Rpc2FibGVfdG1wX3dyaXRlIu8BCg1TZWxlY3RlZEltYWdlEgwKBHV1aWQYAiABKAkSDAoEcGF0aBgDIAEoCRI0CglkaW1lbnNpb24YBCABKAsyIS5hZ2VudC52MS5TZWxlY3RlZEltYWdlX0RpbWVuc2lvbhIRCgltaW1lX3R5cGUYByABKAkSEQoHYmxvYl9pZBgBIAEoDEgAEg4KBGRhdGEYCCABKAxIABJDChFibG9iX2lkX3dpdGhfZGF0YRgJIAEoCzImLmFnZW50LnYxLlNlbGVjdGVkSW1hZ2VfQmxvYklkV2l0aERhdGFIAEIRCg9kYXRhX29yX2Jsb2JfaWQiPQocU2VsZWN0ZWRJbWFnZV9CbG9iSWRXaXRoRGF0YRIPCgdibG9iX2lkGAEgASgMEgwKBGRhdGEYAiABKAwiOAoXU2VsZWN0ZWRJbWFnZV9EaW1lbnNpb24SDQoFd2lkdGgYASABKAUSDgoGaGVpZ2h0GAIgASgFIkkKEUV4dHJhQ29udGV4dEVudHJ5Eg4KBGRhdGEYASABKAlIABIRCgdibG9iX2lkGAIgASgMSABCEQoPZGF0YV9vcl9ibG9iX2lkIlsKDFNlbGVjdGVkRmlsZRIPCgdjb250ZW50GAEgASgJEgwKBHBhdGgYAiABKAkSGgoNcmVsYXRpdmVfcGF0aBgDIAEoCUgAiAEBQhAKDl9yZWxhdGl2ZV9wYXRoIoQBChVTZWxlY3RlZENvZGVTZWxlY3Rpb24SDwoHY29udGVudBgBIAEoCRIMCgRwYXRoGAIgASgJEhoKDXJlbGF0aXZlX3BhdGgYAyABKAlIAIgBARIeCgVyYW5nZRgEIAEoCzIPLmFnZW50LnYxLlJhbmdlQhAKDl9yZWxhdGl2ZV9wYXRoIl0KEFNlbGVjdGVkVGVybWluYWwSDwoHY29udGVudBgBIAEoCRISCgV0aXRsZRgCIAEoCUgAiAEBEhEKBHBhdGgYAyABKAlIAYgBAUIICgZfdGl0bGVCBwoFX3BhdGgihgEKGVNlbGVjdGVkVGVybWluYWxTZWxlY3Rpb24SDwoHY29udGVudBgBIAEoCRISCgV0aXRsZRgCIAEoCUgAiAEBEhEKBHBhdGgYAyABKAlIAYgBARIeCgVyYW5nZRgEIAEoCzIPLmFnZW50LnYxLlJhbmdlQggKBl90aXRsZUIHCgVfcGF0aCKDAQoOU2VsZWN0ZWRGb2xkZXISDAoEcGF0aBgBIAEoCRIaCg1yZWxhdGl2ZV9wYXRoGAIgASgJSACIAQESNQoOZGlyZWN0b3J5X3RyZWUYAyABKAsyHS5hZ2VudC52MS5Mc0RpcmVjdG9yeVRyZWVOb2RlQhAKDl9yZWxhdGl2ZV9wYXRoIp8BChRTZWxlY3RlZEV4dGVybmFsTGluaxILCgN1cmwYASABKAkSDAoEdXVpZBgCIAEoCRIYCgtwZGZfY29udGVudBgDIAEoCUgAiAEBEhMKBmlzX3BkZhgEIAEoCEgBiAEBEhUKCGZpbGVuYW1lGAUgASgJSAKIAQFCDgoMX3BkZl9jb250ZW50QgkKB19pc19wZGZCCwoJX2ZpbGVuYW1lIjgKElNlbGVjdGVkQ3Vyc29yUnVsZRIiCgRydWxlGAEgASgLMhQuYWdlbnQudjEuQ3Vyc29yUnVsZSIiCg9TZWxlY3RlZEdpdERpZmYSDwoHY29udGVudBgBIAEoCSIyCh9TZWxlY3RlZEdpdERpZmZGcm9tQnJhbmNoVG9NYWluEg8KB2NvbnRlbnQYASABKAkiaQoRU2VsZWN0ZWRHaXRDb21taXQSCwoDc2hhGAEgASgJEg8KB21lc3NhZ2UYAiABKAkSGAoLZGVzY3JpcHRpb24YAyABKAlIAIgBARIMCgRkaWZmGAQgASgJQg4KDF9kZXNjcmlwdGlvbiLdAQoTU2VsZWN0ZWRQdWxsUmVxdWVzdBIOCgZudW1iZXIYASABKAUSCwoDdXJsGAIgASgJEhIKBXRpdGxlGAMgASgJSACIAQESEwoLZm9sZGVyX3BhdGgYBCABKAkSGQoMc3VtbWFyeV9qc29uGAUgASgJSAGIAQESGAoLZGVzY3JpcHRpb24YBiABKAlIAogBARIUCgdibG9iX2lkGAcgASgMSAOIAQFCCAoGX3RpdGxlQg8KDV9zdW1tYXJ5X2pzb25CDgoMX2Rlc2NyaXB0aW9uQgoKCF9ibG9iX2lkIrMBChpTZWxlY3RlZEdpdFBSRGlmZlNlbGVjdGlvbhIOCgZwcl91cmwYASABKAkSEQoJZmlsZV9wYXRoGAIgASgJEhIKCnN0YXJ0X2xpbmUYAyABKAUSEAoIZW5kX2xpbmUYBCABKAUSGQoMZGlmZl9jb250ZW50GAUgASgJSACIAQESFAoHYmxvYl9pZBgGIAEoDEgBiAEBQg8KDV9kaWZmX2NvbnRlbnRCCgoIX2Jsb2JfaWQiNgoVU2VsZWN0ZWRDdXJzb3JDb21tYW5kEgwKBG5hbWUYASABKAkSDwoHY29udGVudBgCIAEoCSI1ChVTZWxlY3RlZERvY3VtZW50YXRpb24SDgoGZG9jX2lkGAEgASgJEgwKBG5hbWUYAiABKAkiMgoQU2VsZWN0ZWRQYXN0Q2hhdBIQCghhZ2VudF9pZBgBIAEoCRIMCgRuYW1lGAIgASgJIqsBCglDYWxsRnJhbWUSGgoNZnVuY3Rpb25fbmFtZRgBIAEoCUgAiAEBEhAKA3VybBgCIAEoCUgBiAEBEhgKC2xpbmVfbnVtYmVyGAMgASgFSAKIAQESGgoNY29sdW1uX251bWJlchgEIAEoBUgDiAEBQhAKDl9mdW5jdGlvbl9uYW1lQgYKBF91cmxCDgoMX2xpbmVfbnVtYmVyQhAKDl9jb2x1bW5fbnVtYmVyImgKClN0YWNrVHJhY2USKAoLY2FsbF9mcmFtZXMYASADKAsyEy5hZ2VudC52MS5DYWxsRnJhbWUSHAoPcmF3X3N0YWNrX3RyYWNlGAIgASgJSACIAQFCEgoQX3Jhd19zdGFja190cmFjZSLkAQoSU2VsZWN0ZWRDb25zb2xlTG9nEg8KB21lc3NhZ2UYASABKAkSEQoJdGltZXN0YW1wGAIgASgBEg0KBWxldmVsGAMgASgJEhMKC2NsaWVudF9uYW1lGAQgASgJEhIKCnNlc3Npb25faWQYBSABKAkSLgoLc3RhY2tfdHJhY2UYBiABKAsyFC5hZ2VudC52MS5TdGFja1RyYWNlSACIAQESHQoQb2JqZWN0X2RhdGFfanNvbhgHIAEoCUgBiAEBQg4KDF9zdGFja190cmFjZUITChFfb2JqZWN0X2RhdGFfanNvbiK6AQoRU2VsZWN0ZWRVSUVsZW1lbnQSDwoHZWxlbWVudBgBIAEoCRINCgV4cGF0aBgCIAEoCRIUCgx0ZXh0X2NvbnRlbnQYAyABKAkSDQoFZXh0cmEYBCABKAkSFgoJY29tcG9uZW50GAUgASgJSACIAQESIQoUY29tcG9uZW50X3Byb3BzX2pzb24YBiABKAlIAYgBAUIMCgpfY29tcG9uZW50QhcKFV9jb21wb25lbnRfcHJvcHNfanNvbiIgChBTZWxlY3RlZFN1YmFnZW50EgwKBG5hbWUYASABKAkiggoKD1NlbGVjdGVkQ29udGV4dBIwCg9zZWxlY3RlZF9pbWFnZXMYASADKAsyFy5hZ2VudC52MS5TZWxlY3RlZEltYWdlEjwKEmludm9jYXRpb25fY29udGV4dBgCIAEoCzIbLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0SACIAQESFQoNZXh0cmFfY29udGV4dBgDIAMoCRI6ChVleHRyYV9jb250ZXh0X2VudHJpZXMYECADKAsyGy5hZ2VudC52MS5FeHRyYUNvbnRleHRFbnRyeRIlCgVmaWxlcxgEIAMoCzIWLmFnZW50LnYxLlNlbGVjdGVkRmlsZRI4Cg9jb2RlX3NlbGVjdGlvbnMYBSADKAsyHy5hZ2VudC52MS5TZWxlY3RlZENvZGVTZWxlY3Rpb24SLQoJdGVybWluYWxzGAYgAygLMhouYWdlbnQudjEuU2VsZWN0ZWRUZXJtaW5hbBJAChN0ZXJtaW5hbF9zZWxlY3Rpb25zGAcgAygLMiMuYWdlbnQudjEuU2VsZWN0ZWRUZXJtaW5hbFNlbGVjdGlvbhIpCgdmb2xkZXJzGAggAygLMhguYWdlbnQudjEuU2VsZWN0ZWRGb2xkZXISNgoOZXh0ZXJuYWxfbGlua3MYCSADKAsyHi5hZ2VudC52MS5TZWxlY3RlZEV4dGVybmFsTGluaxIyCgxjdXJzb3JfcnVsZXMYCiADKAsyHC5hZ2VudC52MS5TZWxlY3RlZEN1cnNvclJ1bGUSMAoIZ2l0X2RpZmYYEiABKAsyGS5hZ2VudC52MS5TZWxlY3RlZEdpdERpZmZIAYgBARJUChxnaXRfZGlmZl9mcm9tX2JyYW5jaF90b19tYWluGAsgASgLMikuYWdlbnQudjEuU2VsZWN0ZWRHaXREaWZmRnJvbUJyYW5jaFRvTWFpbkgCiAEBEjgKD2N1cnNvcl9jb21tYW5kcxgMIAMoCzIfLmFnZW50LnYxLlNlbGVjdGVkQ3Vyc29yQ29tbWFuZBI3Cg5kb2N1bWVudGF0aW9ucxgNIAMoCzIfLmFnZW50LnYxLlNlbGVjdGVkRG9jdW1lbnRhdGlvbhIwCgt1aV9lbGVtZW50cxgOIAMoCzIbLmFnZW50LnYxLlNlbGVjdGVkVUlFbGVtZW50EjIKDGNvbnNvbGVfbG9ncxgPIAMoCzIcLmFnZW50LnYxLlNlbGVjdGVkQ29uc29sZUxvZxIwCgtnaXRfY29tbWl0cxgRIAMoCzIbLmFnZW50LnYxLlNlbGVjdGVkR2l0Q29tbWl0Ei4KCnBhc3RfY2hhdHMYEyADKAsyGi5hZ2VudC52MS5TZWxlY3RlZFBhc3RDaGF0EkQKFmdpdF9wcl9kaWZmX3NlbGVjdGlvbnMYFCADKAsyJC5hZ2VudC52MS5TZWxlY3RlZEdpdFBSRGlmZlNlbGVjdGlvbhI9ChZzZWxlY3RlZF9wdWxsX3JlcXVlc3RzGBUgAygLMh0uYWdlbnQudjEuU2VsZWN0ZWRQdWxsUmVxdWVzdBI2ChJzZWxlY3RlZF9zdWJhZ2VudHMYFiADKAsyGi5hZ2VudC52MS5TZWxlY3RlZFN1YmFnZW50QhUKE19pbnZvY2F0aW9uX2NvbnRleHRCCwoJX2dpdF9kaWZmQh8KHV9naXRfZGlmZl9mcm9tX2JyYW5jaF90b19tYWluIuUBChFJbnZvY2F0aW9uQ29udGV4dBI/CgxzbGFja190aHJlYWQYASABKAsyJy5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9TbGFja1RocmVhZEgAEjkKCWdpdGh1Yl9wchgCIAEoCzIkLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0X0dpdGh1YlBSSAASOQoJaWRlX3N0YXRlGAMgASgLMiQuYWdlbnQudjEuSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVIABIRCgdibG9iX2lkGAogASgMSABCBgoEZGF0YSK7AQodSW52b2NhdGlvbkNvbnRleHRfU2xhY2tUaHJlYWQSDgoGdGhyZWFkGAEgASgJEhkKDGNoYW5uZWxfbmFtZRgCIAEoCUgAiAEBEhwKD2NoYW5uZWxfcHVycG9zZRgDIAEoCUgBiAEBEhoKDWNoYW5uZWxfdG9waWMYBCABKAlIAogBAUIPCg1fY2hhbm5lbF9uYW1lQhIKEF9jaGFubmVsX3B1cnBvc2VCEAoOX2NoYW5uZWxfdG9waWMifAoaSW52b2NhdGlvbkNvbnRleHRfR2l0aHViUFISDQoFdGl0bGUYASABKAkSEwoLZGVzY3JpcHRpb24YAiABKAkSEAoIY29tbWVudHMYAyABKAkSGAoLY2lfZmFpbHVyZXMYBCABKAlIAIgBAUIOCgxfY2lfZmFpbHVyZXMi/gEKGkludm9jYXRpb25Db250ZXh0X0lkZVN0YXRlEkAKDXZpc2libGVfZmlsZXMYASADKAsyKS5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlEkgKFXJlY2VudGx5X3ZpZXdlZF9maWxlcxgCIAMoCzIpLmFnZW50LnYxLkludm9jYXRpb25Db250ZXh0X0lkZVN0YXRlX0ZpbGUSVAoUY3VycmVudGx5X3ZpZXdlZF9wcnMYAyADKAsyNi5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9WaWV3ZWRQdWxsUmVxdWVzdCKOAgofSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVfRmlsZRIMCgRwYXRoGAEgASgJEhoKDXJlbGF0aXZlX3BhdGgYAiABKAlIAIgBARJWCg9jdXJzb3JfcG9zaXRpb24YAyABKAsyOC5hZ2VudC52MS5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlX0N1cnNvclBvc2l0aW9uSAGIAQESEwoLdG90YWxfbGluZXMYBCABKAUSGwoOYWN0aXZlX2NvbW1hbmQYBSABKAlIAogBAUIQCg5fcmVsYXRpdmVfcGF0aEISChBfY3Vyc29yX3Bvc2l0aW9uQhEKD19hY3RpdmVfY29tbWFuZCJMCi5JbnZvY2F0aW9uQ29udGV4dF9JZGVTdGF0ZV9GaWxlX0N1cnNvclBvc2l0aW9uEgwKBGxpbmUYASABKAUSDAoEdGV4dBgCIAEoCSLpAQosSW52b2NhdGlvbkNvbnRleHRfSWRlU3RhdGVfVmlld2VkUHVsbFJlcXVlc3QSDgoGbnVtYmVyGAEgASgFEgsKA3VybBgCIAEoCRISCgV0aXRsZRgDIAEoCUgAiAEBEhgKC2ZvbGRlcl9wYXRoGAQgASgJSAGIAQESGQoMc3VtbWFyeV9qc29uGAUgASgJSAKIAQESGAoLZGVzY3JpcHRpb24YBiABKAlIA4gBAUIICgZfdGl0bGVCDgoMX2ZvbGRlcl9wYXRoQg8KDV9zdW1tYXJ5X2pzb25CDgoMX2Rlc2NyaXB0aW9uIkgKFlNldHVwVm1FbnZpcm9ubWVudEFyZ3MSFwoPaW5zdGFsbF9jb21tYW5kGAIgASgJEhUKDXN0YXJ0X2NvbW1hbmQYAyABKAkiXAoYU2V0dXBWbUVudmlyb25tZW50UmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRTdWNjZXNzSABCCAoGcmVzdWx0IhsKGVNldHVwVm1FbnZpcm9ubWVudFN1Y2Nlc3MigAEKGlNldHVwVm1FbnZpcm9ubWVudFRvb2xDYWxsEi4KBGFyZ3MYASABKAsyIC5hZ2VudC52MS5TZXR1cFZtRW52aXJvbm1lbnRBcmdzEjIKBnJlc3VsdBgCIAEoCzIiLmFnZW50LnYxLlNldHVwVm1FbnZpcm9ubWVudFJlc3VsdCLJAgoZU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBIWCg5wYXJzaW5nX2ZhaWxlZBgBIAEoCBJSChNleGVjdXRhYmxlX2NvbW1hbmRzGAIgAygLMjUuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdF9FeGVjdXRhYmxlQ29tbWFuZBIVCg1oYXNfcmVkaXJlY3RzGAMgASgIEiAKGGhhc19jb21tYW5kX3N1YnN0aXR1dGlvbhgEIAEoCBInChphbGxfcmVkaXJlY3RzX2FyZV9kZXZfbnVsbBgFIAEoCEgAiAEBEj8KCXJlZGlyZWN0cxgGIAMoCzIsLmFnZW50LnYxLlNoZWxsQ29tbWFuZFBhcnNpbmdSZXN1bHRfUmVkaXJlY3RCHQobX2FsbF9yZWRpcmVjdHNfYXJlX2Rldl9udWxsIk0KLlNoZWxsQ29tbWFuZFBhcnNpbmdSZXN1bHRfRXhlY3V0YWJsZUNvbW1hbmRBcmcSDAoEdHlwZRgBIAEoCRINCgV2YWx1ZRgCIAEoCSKWAQorU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdF9FeGVjdXRhYmxlQ29tbWFuZBIMCgRuYW1lGAEgASgJEkYKBGFyZ3MYAiADKAsyOC5hZ2VudC52MS5TaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0X0V4ZWN1dGFibGVDb21tYW5kQXJnEhEKCWZ1bGxfdGV4dBgDIAEoCSL6BwoJU2hlbGxBcmdzEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSDwoHdGltZW91dBgDIAEoBRIUCgx0b29sX2NhbGxfaWQYBCABKAkSFwoPc2ltcGxlX2NvbW1hbmRzGAUgAygJEhoKEmhhc19pbnB1dF9yZWRpcmVjdBgGIAEoCBIbChNoYXNfb3V0cHV0X3JlZGlyZWN0GAcgASgIEjsKDnBhcnNpbmdfcmVzdWx0GAggASgLMiMuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBI+ChhyZXF1ZXN0ZWRfc2FuZGJveF9wb2xpY3kYCSABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SACIAQESKAobZmlsZV9vdXRwdXRfdGhyZXNob2xkX2J5dGVzGAogASgESAGIAQESFQoNaXNfYmFja2dyb3VuZBgLIAEoCBIVCg1za2lwX2FwcHJvdmFsGAwgASgIEhgKEHRpbWVvdXRfYmVoYXZpb3IYDSABKAUSGQoMaGFyZF90aW1lb3V0GA4gASgFSAKIAQESGAoLZGVzY3JpcHRpb24YDyABKAlIA4gBARJBChFjbGFzc2lmaWVyX3Jlc3VsdBgQIAEoCzIhLmFnZW50LnYxLkNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0SASIAQESEwoLY2xvc2Vfc3RkaW4YESABKAgSSQoTb3V0cHV0X25vdGlmaWNhdGlvbhgSIAEoCzInLmFnZW50LnYxLlNoZWxsT3V0cHV0Tm90aWZpY2F0aW9uQ29uZmlnSAWIAQESPQoTc21hcnRfbW9kZV9hcHByb3ZhbBgTIAEoCzIbLmFnZW50LnYxLlNtYXJ0TW9kZUFwcHJvdmFsSAaIAQESTgoZaG9va19hcHByb3ZhbF9yZXF1aXJlbWVudBgUIAEoCzImLmFnZW50LnYxLlNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnRIB4gBARIcCg9jb252ZXJzYXRpb25faWQYFSABKAlICIgBAUIbChlfcmVxdWVzdGVkX3NhbmRib3hfcG9saWN5Qh4KHF9maWxlX291dHB1dF90aHJlc2hvbGRfYnl0ZXNCDwoNX2hhcmRfdGltZW91dEIOCgxfZGVzY3JpcHRpb25CFAoSX2NsYXNzaWZpZXJfcmVzdWx0QhYKFF9vdXRwdXRfbm90aWZpY2F0aW9uQhYKFF9zbWFydF9tb2RlX2FwcHJvdmFsQhwKGl9ob29rX2FwcHJvdmFsX3JlcXVpcmVtZW50QhIKEF9jb252ZXJzYXRpb25faWQi+gMKC1NoZWxsUmVzdWx0EjQKDnNhbmRib3hfcG9saWN5GGUgASgLMhcuYWdlbnQudjEuU2FuZGJveFBvbGljeUgBiAEBEhoKDWlzX2JhY2tncm91bmQYZiABKAhIAogBARIdChB0ZXJtaW5hbHNfZm9sZGVyGGcgASgJSAOIAQESEAoDcGlkGGggASgNSASIAQESKQoHc3VjY2VzcxgBIAEoCzIWLmFnZW50LnYxLlNoZWxsU3VjY2Vzc0gAEikKB2ZhaWx1cmUYAiABKAsyFi5hZ2VudC52MS5TaGVsbEZhaWx1cmVIABIpCgd0aW1lb3V0GAMgASgLMhYuYWdlbnQudjEuU2hlbGxUaW1lb3V0SAASKwoIcmVqZWN0ZWQYBCABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASMAoLc3Bhd25fZXJyb3IYBSABKAsyGS5hZ2VudC52MS5TaGVsbFNwYXduRXJyb3JIABI8ChFwZXJtaXNzaW9uX2RlbmllZBgHIAEoCzIfLmFnZW50LnYxLlNoZWxsUGVybWlzc2lvbkRlbmllZEgAQggKBnJlc3VsdEIRCg9fc2FuZGJveF9wb2xpY3lCEAoOX2lzX2JhY2tncm91bmRCEwoRX3Rlcm1pbmFsc19mb2xkZXJCBgoEX3BpZCIhChFTaGVsbFN0cmVhbVN0ZG91dBIMCgRkYXRhGAEgASgJIiEKEVNoZWxsU3RyZWFtU3RkZXJyEgwKBGRhdGEYASABKAki9wEKD1NoZWxsU3RyZWFtRXhpdBIMCgRjb2RlGAEgASgNEgsKA2N3ZBgCIAEoCRI2Cg9vdXRwdXRfbG9jYXRpb24YAyABKAsyGC5hZ2VudC52MS5PdXRwdXRMb2NhdGlvbkgAiAEBEg8KB2Fib3J0ZWQYBCABKAgSGQoMYWJvcnRfcmVhc29uGAUgASgFSAGIAQESJAoXbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXMYBiABKAVIAogBAUISChBfb3V0cHV0X2xvY2F0aW9uQg8KDV9hYm9ydF9yZWFzb25CGgoYX2xvY2FsX2V4ZWN1dGlvbl90aW1lX21zIlsKEFNoZWxsU3RyZWFtU3RhcnQSNAoOc2FuZGJveF9wb2xpY3kYASABKAsyFy5hZ2VudC52MS5TYW5kYm94UG9saWN5SACIAQFCEQoPX3NhbmRib3hfcG9saWN5ItoBChdTaGVsbFN0cmVhbUJhY2tncm91bmRlZBIQCghzaGVsbF9pZBgBIAEoDRIPCgdjb21tYW5kGAIgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAMgASgJEhAKA3BpZBgEIAEoDUgAiAEBEhcKCm1zX3RvX3dhaXQYBSABKAVIAYgBARI0CgZyZWFzb24YBiABKA4yHy5hZ2VudC52MS5TaGVsbEJhY2tncm91bmRSZWFzb25IAogBAUIGCgRfcGlkQg0KC19tc190b193YWl0QgkKB19yZWFzb24irAMKC1NoZWxsU3RyZWFtEi0KBnN0ZG91dBgBIAEoCzIbLmFnZW50LnYxLlNoZWxsU3RyZWFtU3Rkb3V0SAASLQoGc3RkZXJyGAIgASgLMhsuYWdlbnQudjEuU2hlbGxTdHJlYW1TdGRlcnJIABIpCgRleGl0GAMgASgLMhkuYWdlbnQudjEuU2hlbGxTdHJlYW1FeGl0SAASKwoFc3RhcnQYBCABKAsyGi5hZ2VudC52MS5TaGVsbFN0cmVhbVN0YXJ0SAASKwoIcmVqZWN0ZWQYBSABKAsyFy5hZ2VudC52MS5TaGVsbFJlamVjdGVkSAASPAoRcGVybWlzc2lvbl9kZW5pZWQYBiABKAsyHy5hZ2VudC52MS5TaGVsbFBlcm1pc3Npb25EZW5pZWRIABI5CgxiYWNrZ3JvdW5kZWQYByABKAsyIS5hZ2VudC52MS5TaGVsbFN0cmVhbUJhY2tncm91bmRlZEgAEjgKDGhvb2tfY29udGV4dBgIIAEoCzIgLmFnZW50LnYxLlNoZWxsU3RyZWFtSG9va0NvbnRleHRIAEIHCgVldmVudCJLCg5PdXRwdXRMb2NhdGlvbhIRCglmaWxlX3BhdGgYASABKAkSEgoKc2l6ZV9ieXRlcxgCIAEoAxISCgpsaW5lX2NvdW50GAMgASgDIpgFCgxTaGVsbFN1Y2Nlc3MSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRIRCglleGl0X2NvZGUYAyABKAUSDgoGc2lnbmFsGAQgASgJEg4KBnN0ZG91dBgFIAEoCRIOCgZzdGRlcnIYBiABKAkSFgoOZXhlY3V0aW9uX3RpbWUYByABKAUSNgoPb3V0cHV0X2xvY2F0aW9uGAggASgLMhguYWdlbnQudjEuT3V0cHV0TG9jYXRpb25IAIgBARIVCghzaGVsbF9pZBgJIAEoDUgBiAEBEh8KEmludGVybGVhdmVkX291dHB1dBgKIAEoCUgCiAEBEhAKA3BpZBgLIAEoDUgDiAEBEhcKCm1zX3RvX3dhaXQYDCABKAVIBIgBARIkChdsb2NhbF9leGVjdXRpb25fdGltZV9tcxgNIAEoBUgFiAEBEj8KEWJhY2tncm91bmRfcmVhc29uGA4gASgOMh8uYWdlbnQudjEuU2hlbGxCYWNrZ3JvdW5kUmVhc29uSAaIAQESGAoLb3V0cHV0X2hlYWQYDyABKAlIB4gBARIYCgtvdXRwdXRfdGFpbBgQIAEoCUgIiAEBEhkKDGVsaWRlZF9jaGFycxgRIAEoDUgJiAEBQhIKEF9vdXRwdXRfbG9jYXRpb25CCwoJX3NoZWxsX2lkQhUKE19pbnRlcmxlYXZlZF9vdXRwdXRCBgoEX3BpZEINCgtfbXNfdG9fd2FpdEIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXNCFAoSX2JhY2tncm91bmRfcmVhc29uQg4KDF9vdXRwdXRfaGVhZEIOCgxfb3V0cHV0X3RhaWxCDwoNX2VsaWRlZF9jaGFycyKYBAoMU2hlbGxGYWlsdXJlEg8KB2NvbW1hbmQYASABKAkSGQoRd29ya2luZ19kaXJlY3RvcnkYAiABKAkSEQoJZXhpdF9jb2RlGAMgASgFEg4KBnNpZ25hbBgEIAEoCRIOCgZzdGRvdXQYBSABKAkSDgoGc3RkZXJyGAYgASgJEhYKDmV4ZWN1dGlvbl90aW1lGAcgASgFEjYKD291dHB1dF9sb2NhdGlvbhgIIAEoCzIYLmFnZW50LnYxLk91dHB1dExvY2F0aW9uSACIAQESHwoSaW50ZXJsZWF2ZWRfb3V0cHV0GAkgASgJSAGIAQESGQoMYWJvcnRfcmVhc29uGAogASgFSAKIAQESDwoHYWJvcnRlZBgLIAEoCBIkChdsb2NhbF9leGVjdXRpb25fdGltZV9tcxgMIAEoBUgDiAEBEhgKC291dHB1dF9oZWFkGA0gASgJSASIAQESGAoLb3V0cHV0X3RhaWwYDiABKAlIBYgBARIZCgxlbGlkZWRfY2hhcnMYDyABKA1IBogBAUISChBfb3V0cHV0X2xvY2F0aW9uQhUKE19pbnRlcmxlYXZlZF9vdXRwdXRCDwoNX2Fib3J0X3JlYXNvbkIaChhfbG9jYWxfZXhlY3V0aW9uX3RpbWVfbXNCDgoMX291dHB1dF9oZWFkQg4KDF9vdXRwdXRfdGFpbEIPCg1fZWxpZGVkX2NoYXJzIk4KDFNoZWxsVGltZW91dBIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEhIKCnRpbWVvdXRfbXMYAyABKAUiYAoNU2hlbGxSZWplY3RlZBIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEg4KBnJlYXNvbhgDIAEoCRITCgtpc19yZWFkb25seRgEIAEoCCJnChVTaGVsbFBlcm1pc3Npb25EZW5pZWQSDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRINCgVlcnJvchgDIAEoCRITCgtpc19yZWFkb25seRgEIAEoCCJMCg9TaGVsbFNwYXduRXJyb3ISDwoHY29tbWFuZBgBIAEoCRIZChF3b3JraW5nX2RpcmVjdG9yeRgCIAEoCRINCgVlcnJvchgDIAEoCSJAChJTaGVsbFBhcnRpYWxSZXN1bHQSFAoMc3Rkb3V0X2RlbHRhGAEgASgJEhQKDHN0ZGVycl9kZWx0YRgCIAEoCSJZCg1TaGVsbFRvb2xDYWxsEiEKBGFyZ3MYASABKAsyEy5hZ2VudC52MS5TaGVsbEFyZ3MSJQoGcmVzdWx0GAIgASgLMhUuYWdlbnQudjEuU2hlbGxSZXN1bHQiKwoYU2hlbGxUb29sQ2FsbFN0ZG91dERlbHRhEg8KB2NvbnRlbnQYASABKAkiKwoYU2hlbGxUb29sQ2FsbFN0ZGVyckRlbHRhEg8KB2NvbnRlbnQYASABKAkiiQEKElNoZWxsVG9vbENhbGxEZWx0YRI0CgZzdGRvdXQYASABKAsyIi5hZ2VudC52MS5TaGVsbFRvb2xDYWxsU3Rkb3V0RGVsdGFIABI0CgZzdGRlcnIYAiABKAsyIi5hZ2VudC52MS5TaGVsbFRvb2xDYWxsU3RkZXJyRGVsdGFIAEIHCgVkZWx0YSLtAQoMU3ViYWdlbnRUeXBlEjgKC3Vuc3BlY2lmaWVkGAEgASgLMiEuYWdlbnQudjEuU3ViYWdlbnRUeXBlVW5zcGVjaWZpZWRIABI5Cgxjb21wdXRlcl91c2UYAiABKAsyIS5hZ2VudC52MS5TdWJhZ2VudFR5cGVDb21wdXRlclVzZUgAEi4KBmN1c3RvbRgDIAEoCzIcLmFnZW50LnYxLlN1YmFnZW50VHlwZUN1c3RvbUgAEjAKB2V4cGxvcmUYBCABKAsyHS5hZ2VudC52MS5TdWJhZ2VudFR5cGVFeHBsb3JlSABCBgoEdHlwZSIZChdTdWJhZ2VudFR5cGVVbnNwZWNpZmllZCIZChdTdWJhZ2VudFR5cGVDb21wdXRlclVzZSIVChNTdWJhZ2VudFR5cGVFeHBsb3JlIiIKElN1YmFnZW50VHlwZUN1c3RvbRIMCgRuYW1lGAEgASgJIo0BCg5DdXN0b21TdWJhZ2VudBIRCglmdWxsX3BhdGgYASABKAkSDAoEbmFtZRgCIAEoCRITCgtkZXNjcmlwdGlvbhgDIAEoCRINCgV0b29scxgEIAMoCRINCgVtb2RlbBgFIAEoCRIOCgZwcm9tcHQYBiABKAkSFwoPcGVybWlzc2lvbl9tb2RlGAcgASgFImgKDlN3aXRjaE1vZGVBcmdzEhYKDnRhcmdldF9tb2RlX2lkGAEgASgJEhgKC2V4cGxhbmF0aW9uGAIgASgJSACIAQESFAoMdG9vbF9jYWxsX2lkGAMgASgJQg4KDF9leHBsYW5hdGlvbiKqAQoQU3dpdGNoTW9kZVJlc3VsdBIuCgdzdWNjZXNzGAEgASgLMhsuYWdlbnQudjEuU3dpdGNoTW9kZVN1Y2Nlc3NIABIqCgVlcnJvchgCIAEoCzIZLmFnZW50LnYxLlN3aXRjaE1vZGVFcnJvckgAEjAKCHJlamVjdGVkGAMgASgLMhwuYWdlbnQudjEuU3dpdGNoTW9kZVJlamVjdGVkSABCCAoGcmVzdWx0Ij0KEVN3aXRjaE1vZGVTdWNjZXNzEhQKDGZyb21fbW9kZV9pZBgBIAEoCRISCgp0b19tb2RlX2lkGAIgASgJIiAKD1N3aXRjaE1vZGVFcnJvchINCgVlcnJvchgBIAEoCSIkChJTd2l0Y2hNb2RlUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJImgKElN3aXRjaE1vZGVUb29sQ2FsbBImCgRhcmdzGAEgASgLMhguYWdlbnQudjEuU3dpdGNoTW9kZUFyZ3MSKgoGcmVzdWx0GAIgASgLMhouYWdlbnQudjEuU3dpdGNoTW9kZVJlc3VsdCJAChZTd2l0Y2hNb2RlUmVxdWVzdFF1ZXJ5EiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5Td2l0Y2hNb2RlQXJncyKpAQoZU3dpdGNoTW9kZVJlcXVlc3RSZXNwb25zZRJACghhcHByb3ZlZBgBIAEoCzIsLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UmVzcG9uc2VfQXBwcm92ZWRIABJACghyZWplY3RlZBgCIAEoCzIsLmFnZW50LnYxLlN3aXRjaE1vZGVSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWRIAEIICgZyZXN1bHQiJAoiU3dpdGNoTW9kZVJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCI0CiJTd2l0Y2hNb2RlUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSJ1CghUb2RvSXRlbRIKCgJpZBgBIAEoCRIPCgdjb250ZW50GAIgASgJEg4KBnN0YXR1cxgDIAEoBRISCgpjcmVhdGVkX2F0GAQgASgDEhIKCnVwZGF0ZWRfYXQYBSABKAMSFAoMZGVwZW5kZW5jaWVzGAYgAygJImsKE1VwZGF0ZVRvZG9zVG9vbENhbGwSJwoEYXJncxgBIAEoCzIZLmFnZW50LnYxLlVwZGF0ZVRvZG9zQXJncxIrCgZyZXN1bHQYAiABKAsyGy5hZ2VudC52MS5VcGRhdGVUb2Rvc1Jlc3VsdCJDCg9VcGRhdGVUb2Rvc0FyZ3MSIQoFdG9kb3MYASADKAsyEi5hZ2VudC52MS5Ub2RvSXRlbRINCgVtZXJnZRgCIAEoCCJ7ChFVcGRhdGVUb2Rvc1Jlc3VsdBIvCgdzdWNjZXNzGAEgASgLMhwuYWdlbnQudjEuVXBkYXRlVG9kb3NTdWNjZXNzSAASKwoFZXJyb3IYAiABKAsyGi5hZ2VudC52MS5VcGRhdGVUb2Rvc0Vycm9ySABCCAoGcmVzdWx0Il8KElVwZGF0ZVRvZG9zU3VjY2VzcxIhCgV0b2RvcxgBIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtEhMKC3RvdGFsX2NvdW50GAIgASgFEhEKCXdhc19tZXJnZRgDIAEoCCIhChBVcGRhdGVUb2Rvc0Vycm9yEg0KBWVycm9yGAEgASgJImUKEVJlYWRUb2Rvc1Rvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5SZWFkVG9kb3NBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLlJlYWRUb2Rvc1Jlc3VsdCI5Cg1SZWFkVG9kb3NBcmdzEhUKDXN0YXR1c19maWx0ZXIYASADKAUSEQoJaWRfZmlsdGVyGAIgAygJInUKD1JlYWRUb2Rvc1Jlc3VsdBItCgdzdWNjZXNzGAEgASgLMhouYWdlbnQudjEuUmVhZFRvZG9zU3VjY2Vzc0gAEikKBWVycm9yGAIgASgLMhguYWdlbnQudjEuUmVhZFRvZG9zRXJyb3JIAEIICgZyZXN1bHQiSgoQUmVhZFRvZG9zU3VjY2VzcxIhCgV0b2RvcxgBIAMoCzISLmFnZW50LnYxLlRvZG9JdGVtEhMKC3RvdGFsX2NvdW50GAIgASgFIh8KDlJlYWRUb2Rvc0Vycm9yEg0KBWVycm9yGAEgASgJIksKBVJhbmdlEiEKBXN0YXJ0GAEgASgLMhIuYWdlbnQudjEuUG9zaXRpb24SHwoDZW5kGAIgASgLMhIuYWdlbnQudjEuUG9zaXRpb24iKAoIUG9zaXRpb24SDAoEbGluZRgBIAEoDRIOCgZjb2x1bW4YAiABKA0iGAoFRXJyb3ISDwoHbWVzc2FnZRgBIAEoCSI6Cg1XZWJTZWFyY2hBcmdzEhMKC3NlYXJjaF90ZXJtGAEgASgJEhQKDHRvb2xfY2FsbF9pZBgCIAEoCSKmAQoPV2ViU2VhcmNoUmVzdWx0Ei0KB3N1Y2Nlc3MYASABKAsyGi5hZ2VudC52MS5XZWJTZWFyY2hTdWNjZXNzSAASKQoFZXJyb3IYAiABKAsyGC5hZ2VudC52MS5XZWJTZWFyY2hFcnJvckgAEi8KCHJlamVjdGVkGAMgASgLMhsuYWdlbnQudjEuV2ViU2VhcmNoUmVqZWN0ZWRIAEIICgZyZXN1bHQiRAoQV2ViU2VhcmNoU3VjY2VzcxIwCgpyZWZlcmVuY2VzGAEgAygLMhwuYWdlbnQudjEuV2ViU2VhcmNoUmVmZXJlbmNlIh8KDldlYlNlYXJjaEVycm9yEg0KBWVycm9yGAEgASgJIiMKEVdlYlNlYXJjaFJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSI/ChJXZWJTZWFyY2hSZWZlcmVuY2USDQoFdGl0bGUYASABKAkSCwoDdXJsGAIgASgJEg0KBWNodW5rGAMgASgJImUKEVdlYlNlYXJjaFRvb2xDYWxsEiUKBGFyZ3MYASABKAsyFy5hZ2VudC52MS5XZWJTZWFyY2hBcmdzEikKBnJlc3VsdBgCIAEoCzIZLmFnZW50LnYxLldlYlNlYXJjaFJlc3VsdCI+ChVXZWJTZWFyY2hSZXF1ZXN0UXVlcnkSJQoEYXJncxgBIAEoCzIXLmFnZW50LnYxLldlYlNlYXJjaEFyZ3MipgEKGFdlYlNlYXJjaFJlcXVlc3RSZXNwb25zZRI/CghhcHByb3ZlZBgBIAEoCzIrLmFnZW50LnYxLldlYlNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZEgAEj8KCHJlamVjdGVkGAIgASgLMisuYWdlbnQudjEuV2ViU2VhcmNoUmVxdWVzdFJlc3BvbnNlX1JlamVjdGVkSABCCAoGcmVzdWx0IiMKIVdlYlNlYXJjaFJlcXVlc3RSZXNwb25zZV9BcHByb3ZlZCIzCiFXZWJTZWFyY2hSZXF1ZXN0UmVzcG9uc2VfUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIq0BCglXcml0ZUFyZ3MSDAoEcGF0aBgBIAEoCRIRCglmaWxlX3RleHQYAiABKAkSFAoMdG9vbF9jYWxsX2lkGAMgASgJEicKH3JldHVybl9maWxlX2NvbnRlbnRfYWZ0ZXJfd3JpdGUYBCABKAgSEgoKZmlsZV9ieXRlcxgFIAEoDBIaCg1lbmNvZGluZ19oaW50GAYgASgJSACIAQFCEAoOX2VuY29kaW5nX2hpbnQigAIKC1dyaXRlUmVzdWx0EikKB3N1Y2Nlc3MYASABKAsyFi5hZ2VudC52MS5Xcml0ZVN1Y2Nlc3NIABI8ChFwZXJtaXNzaW9uX2RlbmllZBgDIAEoCzIfLmFnZW50LnYxLldyaXRlUGVybWlzc2lvbkRlbmllZEgAEioKCG5vX3NwYWNlGAQgASgLMhYuYWdlbnQudjEuV3JpdGVOb1NwYWNlSAASJQoFZXJyb3IYBSABKAsyFC5hZ2VudC52MS5Xcml0ZUVycm9ySAASKwoIcmVqZWN0ZWQYBiABKAsyFy5hZ2VudC52MS5Xcml0ZVJlamVjdGVkSABCCAoGcmVzdWx0IooBCgxXcml0ZVN1Y2Nlc3MSDAoEcGF0aBgBIAEoCRIVCg1saW5lc19jcmVhdGVkGAIgASgFEhEKCWZpbGVfc2l6ZRgDIAEoBRIlChhmaWxlX2NvbnRlbnRfYWZ0ZXJfd3JpdGUYBCABKAlIAIgBAUIbChlfZmlsZV9jb250ZW50X2FmdGVyX3dyaXRlIm8KFVdyaXRlUGVybWlzc2lvbkRlbmllZBIMCgRwYXRoGAEgASgJEhEKCWRpcmVjdG9yeRgCIAEoCRIRCglvcGVyYXRpb24YAyABKAkSDQoFZXJyb3IYBCABKAkSEwoLaXNfcmVhZG9ubHkYBSABKAgiHAoMV3JpdGVOb1NwYWNlEgwKBHBhdGgYASABKAkiKQoKV3JpdGVFcnJvchIMCgRwYXRoGAEgASgJEg0KBWVycm9yGAIgASgJIi0KDVdyaXRlUmVqZWN0ZWQSDAoEcGF0aBgBIAEoCRIOCgZyZWFzb24YAiABKAkigwEKF0Jvb3RzdHJhcFN0YXRzaWdSZXF1ZXN0Eh4KEWlnbm9yZV9kZXZfc3RhdHVzGAEgASgISACIAQESHQoQb3BlcmF0aW5nX3N5c3RlbRgCIAEoBUgBiAEBQhQKEl9pZ25vcmVfZGV2X3N0YXR1c0ITChFfb3BlcmF0aW5nX3N5c3RlbSIOCgxQaW5nUmVzcG9uc2UitwEKC0V4ZWNSZXF1ZXN0Eg8KB2NvbW1hbmQYASABKAkSEAoDY3dkGAIgASgJSACIAQESDAoEYXJncxgDIAMoCRI7CgtlbnZpcm9ubWVudBgEIAMoCzImLmFnZW50LnYxLkV4ZWNSZXF1ZXN0LkVudmlyb25tZW50RW50cnkaMgoQRW52aXJvbm1lbnRFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBQgYKBF9jd2QioAEKDEV4ZWNSZXNwb25zZRItCgxzdGRvdXRfZXZlbnQYASABKAsyFS5hZ2VudC52MS5TdGRvdXRFdmVudEgAEi0KDHN0ZGVycl9ldmVudBgCIAEoCzIVLmFnZW50LnYxLlN0ZGVyckV2ZW50SAASKQoKZXhpdF9ldmVudBgDIAEoCzITLmFnZW50LnYxLkV4aXRFdmVudEgAQgcKBWV2ZW50IhsKC1N0ZG91dEV2ZW50EgwKBGRhdGEYASABKAkiGwoLU3RkZXJyRXZlbnQSDAoEZGF0YRgBIAEoCSIeCglFeGl0RXZlbnQSEQoJZXhpdF9jb2RlGAEgASgFIiMKE1JlYWRUZXh0RmlsZVJlcXVlc3QSDAoEcGF0aBgBIAEoCSInChRSZWFkVGV4dEZpbGVSZXNwb25zZRIPCgdjb250ZW50GAEgASgJIjUKFFdyaXRlVGV4dEZpbGVSZXF1ZXN0EgwKBHBhdGgYASABKAkSDwoHY29udGVudBgCIAEoCSIXChVXcml0ZVRleHRGaWxlUmVzcG9uc2UiJQoVUmVhZEJpbmFyeUZpbGVSZXF1ZXN0EgwKBHBhdGgYASABKAkiKQoWUmVhZEJpbmFyeUZpbGVSZXNwb25zZRIPCgdjb250ZW50GAEgASgMIjcKFldyaXRlQmluYXJ5RmlsZVJlcXVlc3QSDAoEcGF0aBgBIAEoCRIPCgdjb250ZW50GAIgASgMIhkKF1dyaXRlQmluYXJ5RmlsZVJlc3BvbnNlIkUKHkdldFdvcmtzcGFjZUNoYW5nZXNIYXNoUmVxdWVzdBIRCglyb290X3BhdGgYASABKAkSEAoIYmFzZV9yZWYYAiABKAkiLwofR2V0V29ya3NwYWNlQ2hhbmdlc0hhc2hSZXNwb25zZRIMCgRoYXNoGAEgASgJIlAKH1JlZnJlc2hHaXRodWJBY2Nlc3NUb2tlblJlcXVlc3QSGwoTZ2l0aHViX2FjY2Vzc190b2tlbhgBIAEoCRIQCghob3N0bmFtZRgCIAEoCSIiCiBSZWZyZXNoR2l0aHViQWNjZXNzVG9rZW5SZXNwb25zZSJXCh1XYXJtUmVtb3RlQWNjZXNzU2VydmVyUmVxdWVzdBIOCgZjb21taXQYASABKAkSDAoEcG9ydBgCIAEoBRIYChBjb25uZWN0aW9uX3Rva2VuGAMgASgJIiAKHldhcm1SZW1vdGVBY2Nlc3NTZXJ2ZXJSZXNwb25zZSIWChRMaXN0QXJ0aWZhY3RzUmVxdWVzdCKKAgoWQXJ0aWZhY3RVcGxvYWRNZXRhZGF0YRIVCg1hYnNvbHV0ZV9wYXRoGAEgASgJEhIKCnNpemVfYnl0ZXMYAiABKAQSGgoSdXBkYXRlZF9hdF91bml4X21zGAMgASgDEg4KBnN0YXR1cxgEIAEoBRIWCg5ieXRlc191cGxvYWRlZBgFIAEoBBISCgpsYXN0X2Vycm9yGAYgASgJEhcKD3VwbG9hZF9hdHRlbXB0cxgHIAEoDRIfChdsYXN0X3N0YXJ0ZWRfYXRfdW5peF9tcxgIIAEoAxIgChhsYXN0X2ZpbmlzaGVkX2F0X3VuaXhfbXMYCSABKAMSEQoJdXBsb2FkX2lkGAogASgJIkwKFUxpc3RBcnRpZmFjdHNSZXNwb25zZRIzCglhcnRpZmFjdHMYASADKAsyIC5hZ2VudC52MS5BcnRpZmFjdFVwbG9hZE1ldGFkYXRhIk4KFlVwbG9hZEFydGlmYWN0c1JlcXVlc3QSNAoHdXBsb2FkcxgBIAMoCzIjLmFnZW50LnYxLkFydGlmYWN0VXBsb2FkSW5zdHJ1Y3Rpb24i1wIKGUFydGlmYWN0VXBsb2FkSW5zdHJ1Y3Rpb24SFQoNYWJzb2x1dGVfcGF0aBgBIAEoCRISCgp1cGxvYWRfdXJsGAIgASgJEg4KBm1ldGhvZBgDIAEoCRJBCgdoZWFkZXJzGAQgAygLMjAuYWdlbnQudjEuQXJ0aWZhY3RVcGxvYWRJbnN0cnVjdGlvbi5IZWFkZXJzRW50cnkSGQoMY29udGVudF90eXBlGAUgASgJSACIAQESHQoQc2xhY2tfdXBsb2FkX3VybBgGIAEoCUgBiAEBEhoKDXNsYWNrX2ZpbGVfaWQYByABKAlIAogBARouCgxIZWFkZXJzRW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4AUIPCg1fY29udGVudF90eXBlQhMKEV9zbGFja191cGxvYWRfdXJsQhAKDl9zbGFja19maWxlX2lkIoQBChxBcnRpZmFjdFVwbG9hZERpc3BhdGNoUmVzdWx0EhUKDWFic29sdXRlX3BhdGgYASABKAkSDgoGc3RhdHVzGAIgASgFEg8KB21lc3NhZ2UYAyABKAkSGgoNc2xhY2tfZmlsZV9pZBgEIAEoCUgAiAEBQhAKDl9zbGFja19maWxlX2lkIlIKF1VwbG9hZEFydGlmYWN0c1Jlc3BvbnNlEjcKB3Jlc3VsdHMYASADKAsyJi5hZ2VudC52MS5BcnRpZmFjdFVwbG9hZERpc3BhdGNoUmVzdWx0IhwKGkdldE1jcFJlZnJlc2hUb2tlbnNSZXF1ZXN0IqUBChtHZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2USUAoOcmVmcmVzaF90b2tlbnMYASADKAsyOC5hZ2VudC52MS5HZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2UuUmVmcmVzaFRva2Vuc0VudHJ5GjQKElJlZnJlc2hUb2tlbnNFbnRyeRILCgNrZXkYASABKAkSDQoFdmFsdWUYAiABKAk6AjgBIqMBCiFVcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1JlcXVlc3QSQQoDZW52GAEgAygLMjQuYWdlbnQudjEuVXBkYXRlRW52aXJvbm1lbnRWYXJpYWJsZXNSZXF1ZXN0LkVudkVudHJ5Eg8KB3JlcGxhY2UYAiABKAgaKgoIRW52RW50cnkSCwoDa2V5GAEgASgJEg0KBXZhbHVlGAIgASgJOgI4ASJGCiJVcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1Jlc3BvbnNlEg8KB2FwcGxpZWQYASABKA0SDwoHcmVtb3ZlZBgCIAEoDSKDAQoSTWNwT0F1dGhTdG9yZWREYXRhEhUKDXJlZnJlc2hfdG9rZW4YASABKAkSEQoJY2xpZW50X2lkGAIgASgJEhoKDWNsaWVudF9zZWNyZXQYAyABKAlIAIgBARIVCg1yZWRpcmVjdF91cmlzGAQgAygJQhAKDl9jbGllbnRfc2VjcmV0Ik4KBUZyYW1lEgoKAmlkGAEgASgJEg4KBm1ldGhvZBgCIAEoCRIMCgRkYXRhGAMgASgMEgwKBGtpbmQYBCABKAUSDQoFZXJyb3IYBSABKAkiBwoFRW1wdHkiIwoNQmlkaVJlcXVlc3RJZBISCgpyZXF1ZXN0X2lkGAEgASgJIoECCgxQaVRydW5jYXRpb24SEQoJdHJ1bmNhdGVkGAEgASgIEhQKDHRydW5jYXRlZF9ieRgCIAEoCRITCgt0b3RhbF9saW5lcxgDIAEoDRIUCgxvdXRwdXRfbGluZXMYBCABKA0SFAoMb3V0cHV0X2J5dGVzGAUgASgNEhYKCW1heF9saW5lcxgGIAEoDUgAiAEBEhYKCW1heF9ieXRlcxgHIAEoDUgBiAEBEiAKGGZpcnN0X2xpbmVfZXhjZWVkc19saW1pdBgIIAEoCBIZChFsYXN0X2xpbmVfcGFydGlhbBgJIAEoCEIMCgpfbWF4X2xpbmVzQgwKCl9tYXhfYnl0ZXMiNwoRUGlFZGl0UmVwbGFjZW1lbnQSEAoIb2xkX3RleHQYASABKAkSEAoIbmV3X3RleHQYAiABKAkiXAoOUGlSZWFkRXhlY0FyZ3MSDAoEcGF0aBgBIAEoCRITCgZvZmZzZXQYAiABKAVIAIgBARISCgVsaW1pdBgDIAEoBUgBiAEBQgkKB19vZmZzZXRCCAoGX2xpbWl0ImMKEVBpUmVhZEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQFCDQoLX3RydW5jYXRpb24iIAoPUGlSZWFkRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpUmVhZEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpUmVhZEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaVJlYWRFeGVjRXJyb3JIAEIICgZyZXN1bHQiQwoOUGlCYXNoRXhlY0FyZ3MSDwoHY29tbWFuZBgBIAEoCRIUCgd0aW1lb3V0GAIgASgBSACIAQFCCgoIX3RpbWVvdXQilwEKEVBpQmFzaEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESHQoQZnVsbF9vdXRwdXRfcGF0aBgDIAEoCUgBiAEBQg0KC190cnVuY2F0aW9uQhMKEV9mdWxsX291dHB1dF9wYXRoIpQBCg9QaUJhc2hFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkSLwoKdHJ1bmNhdGlvbhgCIAEoCzIWLmFnZW50LnYxLlBpVHJ1bmNhdGlvbkgAiAEBEh0KEGZ1bGxfb3V0cHV0X3BhdGgYAyABKAlIAYgBAUINCgtfdHJ1bmNhdGlvbkITChFfZnVsbF9vdXRwdXRfcGF0aCJ4ChBQaUJhc2hFeGVjUmVzdWx0Ei4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5QaUJhc2hFeGVjU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuUGlCYXNoRXhlY0Vycm9ySABCCAoGcmVzdWx0IkoKDlBpRWRpdEV4ZWNBcmdzEgwKBHBhdGgYASABKAkSKgoFZWRpdHMYAiADKAsyGy5hZ2VudC52MS5QaUVkaXRSZXBsYWNlbWVudCJ4ChFQaUVkaXRFeGVjU3VjY2VzcxIOCgZvdXRwdXQYASABKAkSDAoEZGlmZhgCIAEoCRINCgVwYXRjaBgDIAEoCRIfChJmaXJzdF9jaGFuZ2VkX2xpbmUYBCABKA1IAIgBAUIVChNfZmlyc3RfY2hhbmdlZF9saW5lIiAKD1BpRWRpdEV4ZWNFcnJvchINCgVlcnJvchgBIAEoCSIkChJQaUVkaXRFeGVjUmVqZWN0ZWQSDgoGcmVhc29uGAEgASgJIqoBChBQaUVkaXRFeGVjUmVzdWx0Ei4KB3N1Y2Nlc3MYASABKAsyGy5hZ2VudC52MS5QaUVkaXRFeGVjU3VjY2Vzc0gAEioKBWVycm9yGAIgASgLMhkuYWdlbnQudjEuUGlFZGl0RXhlY0Vycm9ySAASMAoIcmVqZWN0ZWQYAyABKAsyHC5hZ2VudC52MS5QaUVkaXRFeGVjUmVqZWN0ZWRIAEIICgZyZXN1bHQiMAoPUGlXcml0ZUV4ZWNBcmdzEgwKBHBhdGgYASABKAkSDwoHY29udGVudBgCIAEoCSIkChJQaVdyaXRlRXhlY1N1Y2Nlc3MSDgoGb3V0cHV0GAEgASgJIiEKEFBpV3JpdGVFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkiJQoTUGlXcml0ZUV4ZWNSZWplY3RlZBIOCgZyZWFzb24YASABKAkirgEKEVBpV3JpdGVFeGVjUmVzdWx0Ei8KB3N1Y2Nlc3MYASABKAsyHC5hZ2VudC52MS5QaVdyaXRlRXhlY1N1Y2Nlc3NIABIrCgVlcnJvchgCIAEoCzIaLmFnZW50LnYxLlBpV3JpdGVFeGVjRXJyb3JIABIxCghyZWplY3RlZBgDIAEoCzIdLmFnZW50LnYxLlBpV3JpdGVFeGVjUmVqZWN0ZWRIAEIICgZyZXN1bHQi5QEKDlBpR3JlcEV4ZWNBcmdzEg8KB3BhdHRlcm4YASABKAkSEQoEcGF0aBgCIAEoCUgAiAEBEhEKBGdsb2IYAyABKAlIAYgBARIYCgtpZ25vcmVfY2FzZRgEIAEoCEgCiAEBEhQKB2xpdGVyYWwYBSABKAhIA4gBARIUCgdjb250ZXh0GAYgASgFSASIAQESEgoFbGltaXQYByABKAVIBYgBAUIHCgVfcGF0aEIHCgVfZ2xvYkIOCgxfaWdub3JlX2Nhc2VCCgoIX2xpdGVyYWxCCgoIX2NvbnRleHRCCAoGX2xpbWl0IrYBChFQaUdyZXBFeGVjU3VjY2VzcxIOCgZvdXRwdXQYASABKAkSLwoKdHJ1bmNhdGlvbhgCIAEoCzIWLmFnZW50LnYxLlBpVHJ1bmNhdGlvbkgAiAEBEiAKE21hdGNoX2xpbWl0X3JlYWNoZWQYAyABKA1IAYgBARIXCg9saW5lc190cnVuY2F0ZWQYBCABKAhCDQoLX3RydW5jYXRpb25CFgoUX21hdGNoX2xpbWl0X3JlYWNoZWQiIAoPUGlHcmVwRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpR3JlcEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpR3JlcEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaUdyZXBFeGVjRXJyb3JIAEIICgZyZXN1bHQiWwoOUGlGaW5kRXhlY0FyZ3MSDwoHcGF0dGVybhgBIAEoCRIRCgRwYXRoGAIgASgJSACIAQESEgoFbGltaXQYAyABKAVIAYgBAUIHCgVfcGF0aEIICgZfbGltaXQinwEKEVBpRmluZEV4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESIQoUcmVzdWx0X2xpbWl0X3JlYWNoZWQYAyABKA1IAYgBAUINCgtfdHJ1bmNhdGlvbkIXChVfcmVzdWx0X2xpbWl0X3JlYWNoZWQiIAoPUGlGaW5kRXhlY0Vycm9yEg0KBWVycm9yGAEgASgJIngKEFBpRmluZEV4ZWNSZXN1bHQSLgoHc3VjY2VzcxgBIAEoCzIbLmFnZW50LnYxLlBpRmluZEV4ZWNTdWNjZXNzSAASKgoFZXJyb3IYAiABKAsyGS5hZ2VudC52MS5QaUZpbmRFeGVjRXJyb3JIAEIICgZyZXN1bHQiSAoMUGlMc0V4ZWNBcmdzEhEKBHBhdGgYASABKAlIAIgBARISCgVsaW1pdBgCIAEoBUgBiAEBQgcKBV9wYXRoQggKBl9saW1pdCKbAQoPUGlMc0V4ZWNTdWNjZXNzEg4KBm91dHB1dBgBIAEoCRIvCgp0cnVuY2F0aW9uGAIgASgLMhYuYWdlbnQudjEuUGlUcnVuY2F0aW9uSACIAQESIAoTZW50cnlfbGltaXRfcmVhY2hlZBgDIAEoDUgBiAEBQg0KC190cnVuY2F0aW9uQhYKFF9lbnRyeV9saW1pdF9yZWFjaGVkIh4KDVBpTHNFeGVjRXJyb3ISDQoFZXJyb3IYASABKAkicgoOUGlMc0V4ZWNSZXN1bHQSLAoHc3VjY2VzcxgBIAEoCzIZLmFnZW50LnYxLlBpTHNFeGVjU3VjY2Vzc0gAEigKBWVycm9yGAIgASgLMhcuYWdlbnQudjEuUGlMc0V4ZWNFcnJvckgAQggKBnJlc3VsdCI8ChFNY3BTZXJ2ZXJOb3RGb3VuZBIMCgRuYW1lGAEgASgJEhkKEWF2YWlsYWJsZV9zZXJ2ZXJzGAIgAygJIg0KC01jcEFwcHJvdmVkIkEKEE1jcFN0YXRlRXhlY0FyZ3MSGgoSc2VydmVyX2lkZW50aWZpZXJzGAEgAygJEhEKCWtpY2tfb25seRgCIAEoCCKHAgoOTWNwU3RhdGVTZXJ2ZXISEwoLc2VydmVyX25hbWUYASABKAkSGQoRc2VydmVyX2lkZW50aWZpZXIYAiABKAkSEwoGcGx1Z2luGAMgASgJSACIAQESGAoLbWFya2V0cGxhY2UYBCABKAlIAYgBARIqCgV0b29scxgFIAMoCzIbLmFnZW50LnYxLk1jcFRvb2xEZWZpbml0aW9uEi8KDGluc3RydWN0aW9ucxgGIAMoCzIZLmFnZW50LnYxLk1jcEluc3RydWN0aW9ucxITCgZzdGF0dXMYByABKAlIAogBAUIJCgdfcGx1Z2luQg4KDF9tYXJrZXRwbGFjZUIJCgdfc3RhdHVzIjwKD01jcFN0YXRlU3VjY2VzcxIpCgdzZXJ2ZXJzGAEgAygLMhguYWdlbnQudjEuTWNwU3RhdGVTZXJ2ZXIiHgoNTWNwU3RhdGVFcnJvchINCgVlcnJvchgBIAEoCSIiChBNY3BTdGF0ZVJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSKmAQoSTWNwU3RhdGVFeGVjUmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5NY3BTdGF0ZVN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLk1jcFN0YXRlRXJyb3JIABIuCghyZWplY3RlZBgDIAEoCzIaLmFnZW50LnYxLk1jcFN0YXRlUmVqZWN0ZWRIAEIICgZyZXN1bHQirQEKKUNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0X0NsYXNzaWZpZWRDb21tYW5kEgwKBG5hbWUYASABKAkSEQoJYXJndW1lbnRzGAIgAygJEiYKGXN1Z2dlc3RlZF9hbGxvd2xpc3RfZW50cnkYAyABKAlIAIgBARIZChFzdWJjb21tYW5kX3Rva2VucxgEIAMoCUIcChpfc3VnZ2VzdGVkX2FsbG93bGlzdF9lbnRyeSLXAQoXQ29tbWFuZENsYXNzaWZpZXJSZXN1bHQSRQoIY29tbWFuZHMYASADKAsyMy5hZ2VudC52MS5Db21tYW5kQ2xhc3NpZmllclJlc3VsdF9DbGFzc2lmaWVkQ29tbWFuZBJWChZzdWdnZXN0ZWRfc2FuZGJveF9tb2RlGAIgASgOMjYuYWdlbnQudjEuQ29tbWFuZENsYXNzaWZpZXJSZXN1bHRfU3VnZ2VzdGVkU2FuZGJveE1vZGUSHQoVY2xhc3NpZmljYXRpb25fZmFpbGVkGAMgASgIIpMBCiJTaGVsbENvbW1hbmRQYXJzaW5nUmVzdWx0X1JlZGlyZWN0EhAKCG9wZXJhdG9yGAEgASgJEhcKD2Rlc3RpbmF0aW9uX2ZkcxgCIAMoDRIYChB0YXJnZXRfbm9kZV90eXBlGAMgASgJEhgKC3RhcmdldF90ZXh0GAQgASgJSACIAQFCDgoMX3RhcmdldF90ZXh0IooCChpTaGVsbEFsbG93bGlzdFByZWNoZWNrQXJncxIPCgdjb21tYW5kGAEgASgJEhkKEXdvcmtpbmdfZGlyZWN0b3J5GAIgASgJEjsKDnBhcnNpbmdfcmVzdWx0GAMgASgLMiMuYWdlbnQudjEuU2hlbGxDb21tYW5kUGFyc2luZ1Jlc3VsdBJBChFjbGFzc2lmaWVyX3Jlc3VsdBgEIAEoCzIhLmFnZW50LnYxLkNvbW1hbmRDbGFzc2lmaWVyUmVzdWx0SACIAQESGQoMdG9vbF9jYWxsX2lkGAUgASgJSAGIAQFCFAoSX2NsYXNzaWZpZXJfcmVzdWx0Qg8KDV90b29sX2NhbGxfaWQiMwocU2hlbGxBbGxvd2xpc3RQcmVjaGVja1Jlc3VsdBITCgthbGxvd2xpc3RlZBgBIAEoCCJ2ChhNY3BBbGxvd2xpc3RQcmVjaGVja0FyZ3MSGwoTcHJvdmlkZXJfaWRlbnRpZmllchgBIAEoCRIRCgl0b29sX25hbWUYAiABKAkSGQoMdG9vbF9jYWxsX2lkGAMgASgJSACIAQFCDwoNX3Rvb2xfY2FsbF9pZCIxChpNY3BBbGxvd2xpc3RQcmVjaGVja1Jlc3VsdBITCgthbGxvd2xpc3RlZBgBIAEoCCJYCh1XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrQXJncxILCgN1cmwYASABKAkSGQoMdG9vbF9jYWxsX2lkGAIgASgJSACIAQFCDwoNX3Rvb2xfY2FsbF9pZCI2Ch9XZWJGZXRjaEFsbG93bGlzdFByZWNoZWNrUmVzdWx0EhMKC2FsbG93bGlzdGVkGAEgASgIIjcKEVNtYXJ0TW9kZUFwcHJvdmFsEhIKCnJlcXVlc3RfaWQYASABKAkSDgoGcmVhc29uGAIgASgJIpwBCh1TaGVsbE91dHB1dE5vdGlmaWNhdGlvbkNvbmZpZxIPCgdwYXR0ZXJuGAEgASgJEg4KBnJlYXNvbhgCIAEoCRIVCghkZWJvdW5jZRgDIAEoAUgAiAEBEh8KEm5vdGlmaWNhdGlvbl9saW1pdBgEIAEoBUgBiAEBQgsKCV9kZWJvdW5jZUIVChNfbm90aWZpY2F0aW9uX2xpbWl0InkKHFNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnQSOQoEa2luZBgBIAEoDjIrLmFnZW50LnYxLlNoZWxsSG9va0FwcHJvdmFsUmVxdWlyZW1lbnRfS2luZBITCgZyZWFzb24YAiABKAlIAIgBAUIJCgdfcmVhc29uIjAKGEZvcmNlQmFja2dyb3VuZFNoZWxsQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkilQEKGkZvcmNlQmFja2dyb3VuZFNoZWxsUmVzdWx0EjQKBnN0YXR1cxgBIAEoDjIkLmFnZW50LnYxLkZvcmNlQmFja2dyb3VuZFNoZWxsU3RhdHVzEjAKDHNoZWxsX3Jlc3VsdBgCIAEoCzIVLmFnZW50LnYxLlNoZWxsUmVzdWx0SACIAQFCDwoNX3NoZWxsX3Jlc3VsdCJBChVIb29rQWRkaXRpb25hbENvbnRleHQSFwoPaG9va19ldmVudF9uYW1lGAEgASgJEg8KB2NvbnRlbnQYAiABKAkiWwoWU2hlbGxTdHJlYW1Ib29rQ29udGV4dBJBChhob29rX2FkZGl0aW9uYWxfY29udGV4dHMYASADKAsyHy5hZ2VudC52MS5Ib29rQWRkaXRpb25hbENvbnRleHQiSwoMU3ViYWdlbnRBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCRIVCg1zdWJhZ2VudF90eXBlGAIgASgJEg4KBnByb21wdBgEIAEoCSLbAQoPU3ViYWdlbnRTdWNjZXNzEhAKCGFnZW50X2lkGAEgASgJEhoKDWZpbmFsX21lc3NhZ2UYAiABKAlIAIgBARIXCg90b29sX2NhbGxfY291bnQYAyABKAUSPQoRYmFja2dyb3VuZF9yZWFzb24YBCABKA4yIi5hZ2VudC52MS5TdWJhZ2VudEJhY2tncm91bmRSZWFzb24SHAoPdHJhbnNjcmlwdF9wYXRoGAUgASgJSAGIAQFCEAoOX2ZpbmFsX21lc3NhZ2VCEgoQX3RyYW5zY3JpcHRfcGF0aCJCCg1TdWJhZ2VudEVycm9yEhUKCGFnZW50X2lkGAEgASgJSACIAQESDQoFZXJyb3IYAiABKAlCCwoJX2FnZW50X2lkInIKDlN1YmFnZW50UmVzdWx0EiwKB3N1Y2Nlc3MYASABKAsyGS5hZ2VudC52MS5TdWJhZ2VudFN1Y2Nlc3NIABIoCgVlcnJvchgCIAEoCzIXLmFnZW50LnYxLlN1YmFnZW50RXJyb3JIAEIICgZyZXN1bHQiOQoRU3ViYWdlbnRBd2FpdEFyZ3MSEAoIYWdlbnRfaWQYASABKAkSEgoKdGltZW91dF9tcxgCIAEoDSKiAQoVU3ViYWdlbnRBd2FpdENvbXBsZXRlEhAKCGFnZW50X2lkGAEgASgJEhwKD3RyYW5zY3JpcHRfcGF0aBgCIAEoCUgAiAEBEhcKD3Rvb2xfY2FsbF9jb3VudBgDIAEoBRIaCg1maW5hbF9tZXNzYWdlGAQgASgJSAGIAQFCEgoQX3RyYW5zY3JpcHRfcGF0aEIQCg5fZmluYWxfbWVzc2FnZSJfChlTdWJhZ2VudEF3YWl0U3RpbGxSdW5uaW5nEhAKCGFnZW50X2lkGAEgASgJEhwKD3RyYW5zY3JpcHRfcGF0aBgCIAEoCUgAiAEBQhIKEF90cmFuc2NyaXB0X3BhdGgiKQoVU3ViYWdlbnRBd2FpdE5vdEZvdW5kEhAKCGFnZW50X2lkGAEgASgJIkcKElN1YmFnZW50QXdhaXRFcnJvchIVCghhZ2VudF9pZBgBIAEoCUgAiAEBEg0KBWVycm9yGAIgASgJQgsKCV9hZ2VudF9pZCL3AQoTU3ViYWdlbnRBd2FpdFJlc3VsdBIzCghjb21wbGV0ZRgBIAEoCzIfLmFnZW50LnYxLlN1YmFnZW50QXdhaXRDb21wbGV0ZUgAEjwKDXN0aWxsX3J1bm5pbmcYAiABKAsyIy5hZ2VudC52MS5TdWJhZ2VudEF3YWl0U3RpbGxSdW5uaW5nSAASNAoJbm90X2ZvdW5kGAMgASgLMh8uYWdlbnQudjEuU3ViYWdlbnRBd2FpdE5vdEZvdW5kSAASLQoFZXJyb3IYBCABKAsyHC5hZ2VudC52MS5TdWJhZ2VudEF3YWl0RXJyb3JIAEIICgZyZXN1bHQiMwobRm9yY2VCYWNrZ3JvdW5kU3ViYWdlbnRBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCSJYCh1Gb3JjZUJhY2tncm91bmRTdWJhZ2VudFJlc3VsdBI3CgZzdGF0dXMYASABKA4yJy5hZ2VudC52MS5Gb3JjZUJhY2tncm91bmRTdWJhZ2VudFN0YXR1cyIYChZQcmVDb21wYWN0UmVxdWVzdFF1ZXJ5IhsKGVN1YmFnZW50U3RhcnRSZXF1ZXN0UXVlcnkiGgoYU3ViYWdlbnRTdG9wUmVxdWVzdFF1ZXJ5IhgKFlByZVRvb2xVc2VSZXF1ZXN0UXVlcnkiGQoXUG9zdFRvb2xVc2VSZXF1ZXN0UXVlcnkiIAoeUG9zdFRvb2xVc2VGYWlsdXJlUmVxdWVzdFF1ZXJ5IiAKHkJlZm9yZVN1Ym1pdFByb21wdFJlcXVlc3RRdWVyeSIgCh5BZnRlckFnZW50UmVzcG9uc2VSZXF1ZXN0UXVlcnkiHwodQWZ0ZXJBZ2VudFRob3VnaHRSZXF1ZXN0UXVlcnkiEgoQU3RvcFJlcXVlc3RRdWVyeSJHChlQcmVDb21wYWN0UmVxdWVzdFJlc3BvbnNlEhkKDHVzZXJfbWVzc2FnZRgBIAEoCUgAiAEBQg8KDV91c2VyX21lc3NhZ2UiqgEKHFN1YmFnZW50U3RhcnRSZXF1ZXN0UmVzcG9uc2USFwoKcGVybWlzc2lvbhgBIAEoCUgAiAEBEhkKDHVzZXJfbWVzc2FnZRgCIAEoCUgBiAEBEh8KEmFkZGl0aW9uYWxfY29udGV4dBgDIAEoCUgCiAEBQg0KC19wZXJtaXNzaW9uQg8KDV91c2VyX21lc3NhZ2VCFQoTX2FkZGl0aW9uYWxfY29udGV4dCKJAQobU3ViYWdlbnRTdG9wUmVxdWVzdFJlc3BvbnNlEh0KEGZvbGxvd3VwX21lc3NhZ2UYASABKAlIAIgBARIfChJhZGRpdGlvbmFsX2NvbnRleHQYAiABKAlIAYgBAUITChFfZm9sbG93dXBfbWVzc2FnZUIVChNfYWRkaXRpb25hbF9jb250ZXh0IoMCChlQcmVUb29sVXNlUmVxdWVzdFJlc3BvbnNlEhcKCnBlcm1pc3Npb24YASABKAlIAIgBARIZCgx1c2VyX21lc3NhZ2UYAiABKAlIAYgBARIaCg1hZ2VudF9tZXNzYWdlGAMgASgJSAKIAQESGgoNdXBkYXRlZF9pbnB1dBgEIAEoCUgDiAEBEh8KEmFkZGl0aW9uYWxfY29udGV4dBgFIAEoCUgEiAEBQg0KC19wZXJtaXNzaW9uQg8KDV91c2VyX21lc3NhZ2VCEAoOX2FnZW50X21lc3NhZ2VCEAoOX3VwZGF0ZWRfaW5wdXRCFQoTX2FkZGl0aW9uYWxfY29udGV4dCJUChpQb3N0VG9vbFVzZVJlcXVlc3RSZXNwb25zZRIfChJhZGRpdGlvbmFsX2NvbnRleHQYASABKAlIAIgBAUIVChNfYWRkaXRpb25hbF9jb250ZXh0IlsKIVBvc3RUb29sVXNlRmFpbHVyZVJlcXVlc3RSZXNwb25zZRIfChJhZGRpdGlvbmFsX2NvbnRleHQYASABKAlIAIgBAUIVChNfYWRkaXRpb25hbF9jb250ZXh0IqsBCiFCZWZvcmVTdWJtaXRQcm9tcHRSZXF1ZXN0UmVzcG9uc2USFQoIY29udGludWUYASABKAhIAIgBARIZCgx1c2VyX21lc3NhZ2UYAiABKAlIAYgBARIfChJhZGRpdGlvbmFsX2NvbnRleHQYAyABKAlIAogBAUILCglfY29udGludWVCDwoNX3VzZXJfbWVzc2FnZUIVChNfYWRkaXRpb25hbF9jb250ZXh0IiMKIUFmdGVyQWdlbnRSZXNwb25zZVJlcXVlc3RSZXNwb25zZSIiCiBBZnRlckFnZW50VGhvdWdodFJlcXVlc3RSZXNwb25zZSJJChNTdG9wUmVxdWVzdFJlc3BvbnNlEh0KEGZvbGxvd3VwX21lc3NhZ2UYASABKAlIAIgBAUITChFfZm9sbG93dXBfbWVzc2FnZSKdBQoSRXhlY3V0ZUhvb2tSZXF1ZXN0EjcKC3ByZV9jb21wYWN0GAEgASgLMiAuYWdlbnQudjEuUHJlQ29tcGFjdFJlcXVlc3RRdWVyeUgAEj0KDnN1YmFnZW50X3N0YXJ0GAIgASgLMiMuYWdlbnQudjEuU3ViYWdlbnRTdGFydFJlcXVlc3RRdWVyeUgAEjsKDXN1YmFnZW50X3N0b3AYAyABKAsyIi5hZ2VudC52MS5TdWJhZ2VudFN0b3BSZXF1ZXN0UXVlcnlIABI4CgxwcmVfdG9vbF91c2UYBCABKAsyIC5hZ2VudC52MS5QcmVUb29sVXNlUmVxdWVzdFF1ZXJ5SAASOgoNcG9zdF90b29sX3VzZRgFIAEoCzIhLmFnZW50LnYxLlBvc3RUb29sVXNlUmVxdWVzdFF1ZXJ5SAASSQoVcG9zdF90b29sX3VzZV9mYWlsdXJlGAYgASgLMiguYWdlbnQudjEuUG9zdFRvb2xVc2VGYWlsdXJlUmVxdWVzdFF1ZXJ5SAASSAoUYmVmb3JlX3N1Ym1pdF9wcm9tcHQYByABKAsyKC5hZ2VudC52MS5CZWZvcmVTdWJtaXRQcm9tcHRSZXF1ZXN0UXVlcnlIABJIChRhZnRlcl9hZ2VudF9yZXNwb25zZRgIIAEoCzIoLmFnZW50LnYxLkFmdGVyQWdlbnRSZXNwb25zZVJlcXVlc3RRdWVyeUgAEkYKE2FmdGVyX2FnZW50X3Rob3VnaHQYCSABKAsyJy5hZ2VudC52MS5BZnRlckFnZW50VGhvdWdodFJlcXVlc3RRdWVyeUgAEioKBHN0b3AYCyABKAsyGi5hZ2VudC52MS5TdG9wUmVxdWVzdFF1ZXJ5SABCCQoHcmVxdWVzdCK9BQoTRXhlY3V0ZUhvb2tSZXNwb25zZRI6CgtwcmVfY29tcGFjdBgBIAEoCzIjLmFnZW50LnYxLlByZUNvbXBhY3RSZXF1ZXN0UmVzcG9uc2VIABJACg5zdWJhZ2VudF9zdGFydBgCIAEoCzImLmFnZW50LnYxLlN1YmFnZW50U3RhcnRSZXF1ZXN0UmVzcG9uc2VIABI+Cg1zdWJhZ2VudF9zdG9wGAMgASgLMiUuYWdlbnQudjEuU3ViYWdlbnRTdG9wUmVxdWVzdFJlc3BvbnNlSAASOwoMcHJlX3Rvb2xfdXNlGAQgASgLMiMuYWdlbnQudjEuUHJlVG9vbFVzZVJlcXVlc3RSZXNwb25zZUgAEj0KDXBvc3RfdG9vbF91c2UYBSABKAsyJC5hZ2VudC52MS5Qb3N0VG9vbFVzZVJlcXVlc3RSZXNwb25zZUgAEkwKFXBvc3RfdG9vbF91c2VfZmFpbHVyZRgGIAEoCzIrLmFnZW50LnYxLlBvc3RUb29sVXNlRmFpbHVyZVJlcXVlc3RSZXNwb25zZUgAEksKFGJlZm9yZV9zdWJtaXRfcHJvbXB0GAcgASgLMisuYWdlbnQudjEuQmVmb3JlU3VibWl0UHJvbXB0UmVxdWVzdFJlc3BvbnNlSAASSwoUYWZ0ZXJfYWdlbnRfcmVzcG9uc2UYCCABKAsyKy5hZ2VudC52MS5BZnRlckFnZW50UmVzcG9uc2VSZXF1ZXN0UmVzcG9uc2VIABJJChNhZnRlcl9hZ2VudF90aG91Z2h0GAkgASgLMiouYWdlbnQudjEuQWZ0ZXJBZ2VudFRob3VnaHRSZXF1ZXN0UmVzcG9uc2VIABItCgRzdG9wGAsgASgLMh0uYWdlbnQudjEuU3RvcFJlcXVlc3RSZXNwb25zZUgAQgoKCHJlc3BvbnNlIkAKD0V4ZWN1dGVIb29rQXJncxItCgdyZXF1ZXN0GAEgASgLMhwuYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXF1ZXN0IkQKEUV4ZWN1dGVIb29rUmVzdWx0Ei8KCHJlc3BvbnNlGAEgASgLMh0uYWdlbnQudjEuRXhlY3V0ZUhvb2tSZXNwb25zZSIlChNTbWFydE1vZGVSaXNrVGFyZ2V0Eg4KBmFjdGlvbhgBIAEoCSJHCiZTbWFydE1vZGVDbGFzc2lmaWVyQ29udmVyc2F0aW9uTWVzc2FnZRIMCgRyb2xlGAEgASgJEg8KB2NvbnRlbnQYAiABKAki7gEKF1NtYXJ0TW9kZUNsYXNzaWZpZXJBcmdzEhQKDHRvb2xfY2FsbF9pZBgBIAEoCRIjChZwYXJlbnRfY29udmVyc2F0aW9uX2lkGAIgASgJSACIAQESLQoGdGFyZ2V0GAMgASgLMh0uYWdlbnQudjEuU21hcnRNb2RlUmlza1RhcmdldBJOChRjb252ZXJzYXRpb25fY29udGV4dBgEIAMoCzIwLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJDb252ZXJzYXRpb25NZXNzYWdlQhkKF19wYXJlbnRfY29udmVyc2F0aW9uX2lkIoEBChpTbWFydE1vZGVDbGFzc2lmaWVyU3VjY2VzcxI3CghkZWNpc2lvbhgBIAEoDjIlLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJEZWNpc2lvbhIZCgxibG9ja19yZWFzb24YAiABKAlIAIgBAUIPCg1fYmxvY2tfcmVhc29uIikKGFNtYXJ0TW9kZUNsYXNzaWZpZXJFcnJvchINCgVlcnJvchgBIAEoCSKTAQoZU21hcnRNb2RlQ2xhc3NpZmllclJlc3VsdBI3CgdzdWNjZXNzGAEgASgLMiQuYWdlbnQudjEuU21hcnRNb2RlQ2xhc3NpZmllclN1Y2Nlc3NIABIzCgVlcnJvchgCIAEoCzIiLmFnZW50LnYxLlNtYXJ0TW9kZUNsYXNzaWZpZXJFcnJvckgAQggKBnJlc3VsdCI7ChVDYW52YXNEaWFnbm9zdGljc0FyZ3MSDAoEcGF0aBgBIAEoCRIUCgx0b29sX2NhbGxfaWQYAiABKAkiUwoYQ2FudmFzRGlhZ25vc3RpY3NTdWNjZXNzEgwKBHBhdGgYASABKAkSKQoLZGlhZ25vc3RpY3MYAiADKAsyFC5hZ2VudC52MS5EaWFnbm9zdGljIjUKFkNhbnZhc0RpYWdub3N0aWNzRXJyb3ISDAoEcGF0aBgBIAEoCRINCgVlcnJvchgCIAEoCSKNAQoXQ2FudmFzRGlhZ25vc3RpY3NSZXN1bHQSNQoHc3VjY2VzcxgBIAEoCzIiLmFnZW50LnYxLkNhbnZhc0RpYWdub3N0aWNzU3VjY2Vzc0gAEjEKBWVycm9yGAIgASgLMiAuYWdlbnQudjEuQ2FudmFzRGlhZ25vc3RpY3NFcnJvckgAQggKBnJlc3VsdCKsAQoVQ29udmVyc2F0aW9uU2VhcmNoSGl0EhcKD2NvbnZlcnNhdGlvbl9pZBgBIAEoCRINCgV0aXRsZRgCIAEoCRIyCgZzb3VyY2UYAyABKA4yIi5hZ2VudC52MS5Db252ZXJzYXRpb25TZWFyY2hTb3VyY2USFQoNdXBkYXRlZF9hdF9tcxgEIAEoAxIUCgdzbmlwcGV0GAUgASgJSACIAQFCCgoIX3NuaXBwZXQiggEKGUNvbnZlcnNhdGlvblNlYXJjaFN1Y2Nlc3MSLQoEaGl0cxgBIAMoCzIfLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEhpdBIRCgl0cnVuY2F0ZWQYAiABKAgSDwoHcGFydGlhbBgDIAEoCBISCgpyZWJ1aWxkaW5nGAQgASgIIigKF0NvbnZlcnNhdGlvblNlYXJjaEVycm9yEg0KBWVycm9yGAEgASgJIlsKFkNvbnZlcnNhdGlvblNlYXJjaEFyZ3MSDQoFcXVlcnkYASABKAkSFAoMdG9vbF9jYWxsX2lkGAIgASgJEhIKBWxpbWl0GAMgASgFSACIAQFCCAoGX2xpbWl0IpABChhDb252ZXJzYXRpb25TZWFyY2hSZXN1bHQSNgoHc3VjY2VzcxgBIAEoCzIjLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaFN1Y2Nlc3NIABIyCgVlcnJvchgCIAEoCzIhLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEVycm9ySABCCAoGcmVzdWx0IlUKGEFnZW50U3RvcmVDb25mbGljdEN1cnNvchIVCg1qb3VybmFsX2Vwb2NoGAEgASgJEgsKA3NlcRgCIAEoBBIVCg1sYXN0X2V2ZW50X2lkGAMgASgJIqUDChdBZ2VudFN0b3JlQ29uZmxpY3RFdmVudBIJCgF2GAEgASgNEhAKCGV2ZW50X2lkGAIgASgJEhUKDWpvdXJuYWxfZXBvY2gYAyABKAkSCwoDc2VxGAQgASgEEg0KBXRzX21zGAUgASgEEgwKBGtpbmQYBiABKAkSFQoIc3RvcmVfaWQYByABKAlIAIgBARIeChFvcmlnaW5hbF9yZWxfcGF0aBgIIAEoCUgBiAEBEh4KEWNvbmZsaWN0X3JlbF9wYXRoGAkgASgJSAKIAQESHgoRb3JpZ2luYWxfYWJzX3BhdGgYCiABKAlIA4gBARIeChFjb25mbGljdF9hYnNfcGF0aBgLIAEoCUgEiAEBEhwKD3ByZXNlcnZlZF9ieXRlcxgMIAEoBEgFiAEBQgsKCV9zdG9yZV9pZEIUChJfb3JpZ2luYWxfcmVsX3BhdGhCFAoSX2NvbmZsaWN0X3JlbF9wYXRoQhQKEl9vcmlnaW5hbF9hYnNfcGF0aEIUChJfY29uZmxpY3RfYWJzX3BhdGhCEgoQX3ByZXNlcnZlZF9ieXRlcyKUAQoZQWdlbnRTdG9yZUNvbmZsaWN0U3VjY2VzcxIxCgZldmVudHMYASADKAsyIS5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RFdmVudBI3CgtuZXh0X2N1cnNvchgCIAEoCzIiLmFnZW50LnYxLkFnZW50U3RvcmVDb25mbGljdEN1cnNvchILCgNnYXAYAyABKAgiKAoXQWdlbnRTdG9yZUNvbmZsaWN0RXJyb3ISDQoFZXJyb3IYASABKAkifgoWQWdlbnRTdG9yZUNvbmZsaWN0QXJncxI3CgZjdXJzb3IYASABKAsyIi5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RDdXJzb3JIAIgBARIUCgdhZHZhbmNlGAIgASgISAGIAQFCCQoHX2N1cnNvckIKCghfYWR2YW5jZSKQAQoYQWdlbnRTdG9yZUNvbmZsaWN0UmVzdWx0EjYKB3N1Y2Nlc3MYASABKAsyIy5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RTdWNjZXNzSAASMgoFZXJyb3IYAiABKAsyIS5hZ2VudC52MS5BZ2VudFN0b3JlQ29uZmxpY3RFcnJvckgAQggKBnJlc3VsdCJ8Cg5GaWxlRGlmZl9DaHVuaxIPCgdjb250ZW50GAEgASgJEg0KBWxpbmVzGAIgAygJEhEKCW9sZF9zdGFydBgDIAEoBRIRCglvbGRfbGluZXMYBCABKAUSEQoJbmV3X3N0YXJ0GAUgASgFEhEKCW5ld19saW5lcxgGIAEoBSKQAgoIRmlsZURpZmYSDQoFYWRkZWQYBCABKAUSDwoHcmVtb3ZlZBgFIAEoBRIMCgRmcm9tGAEgASgJEgoKAnRvGAIgASgJEigKBmNodW5rcxgDIAMoCzIYLmFnZW50LnYxLkZpbGVEaWZmX0NodW5rEiEKFGJlZm9yZV9maWxlX2NvbnRlbnRzGAYgASgJSACIAQESIAoTYWZ0ZXJfZmlsZV9jb250ZW50cxgHIAEoCUgBiAEBEhkKDGlzX2dlbmVyYXRlZBgIIAEoCEgCiAEBQhcKFV9iZWZvcmVfZmlsZV9jb250ZW50c0IWChRfYWZ0ZXJfZmlsZV9jb250ZW50c0IPCg1faXNfZ2VuZXJhdGVkIlsKB0dpdERpZmYSIQoFZGlmZnMYASADKAsyEi5hZ2VudC52MS5GaWxlRGlmZhItCglkaWZmX3R5cGUYAiABKA4yGi5hZ2VudC52MS5HaXREaWZmX0RpZmZUeXBlImgKHUdldERpZmZSZXNwb25zZV9TdWJtb2R1bGVEaWZmEhUKDXJlbGF0aXZlX3BhdGgYASABKAkSHwoEZGlmZhgCIAEoCzIRLmFnZW50LnYxLkdpdERpZmYSDwoHZXJyb3JlZBgDIAEoCCLyAwoOR2V0RGlmZlJlcXVlc3QSCwoDY3dkGAEgASgJEgsKA3JlZhgCIAEoCRIQCghiYXNlX3JlZhgDIAEoCRISCgptZXJnZV9iYXNlGAQgASgIEhQKDHRhcmdldF9wYXRocxgFIAMoCRIiChV1bmlmaWVkX2NvbnRleHRfbGluZXMYBiABKAVIAIgBARIbChNtYXhfdW50cmFja2VkX2ZpbGVzGAcgASgFEh8KF3N1Ym1vZHVsZV9yZWN1cnNlX2RlcHRoGAkgASgFEh0KFWluY2x1ZGVfc3BhY2VfY2hhbmdlcxgKIAEoCBIWCg5jb21taXR0ZWRfb25seRgLIAEoCBIYChBjb21wdXRlX3BhdGNoX2lkGAwgASgIEhwKD3JldHVybl9oZWFkX3NoYRgNIAEoCEgBiAEBEh8KEm1heF9yZXNwb25zZV9ieXRlcxgOIAEoBUgCiAEBEkEKDW91dHB1dF9mb3JtYXQYCCABKA4yJS5hZ2VudC52MS5HZXREaWZmUmVxdWVzdF9PdXRwdXRGb3JtYXRIA4gBAUIYChZfdW5pZmllZF9jb250ZXh0X2xpbmVzQhIKEF9yZXR1cm5faGVhZF9zaGFCFQoTX21heF9yZXNwb25zZV9ieXRlc0IQCg5fb3V0cHV0X2Zvcm1hdCL+AQoPR2V0RGlmZlJlc3BvbnNlEh8KBGRpZmYYASABKAsyES5hZ2VudC52MS5HaXREaWZmEkAKD3N1Ym1vZHVsZV9kaWZmcxgCIAMoCzInLmFnZW50LnYxLkdldERpZmZSZXNwb25zZV9TdWJtb2R1bGVEaWZmEhUKCHBhdGNoX2lkGAMgASgJSACIAQESFQoIaGVhZF9zaGEYBCABKAlIAYgBARIkChdoYXNfdW5jb21taXR0ZWRfY2hhbmdlcxgFIAEoCEgCiAEBQgsKCV9wYXRjaF9pZEILCglfaGVhZF9zaGFCGgoYX2hhc191bmNvbW1pdHRlZF9jaGFuZ2VzImQKDlBpUmVhZFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaVJlYWRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaVJlYWRFeGVjUmVzdWx0ImQKDlBpQmFzaFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUJhc2hFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUJhc2hFeGVjUmVzdWx0ImQKDlBpRWRpdFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUVkaXRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUVkaXRFeGVjUmVzdWx0ImcKD1BpV3JpdGVUb29sQ2FsbBInCgRhcmdzGAEgASgLMhkuYWdlbnQudjEuUGlXcml0ZUV4ZWNBcmdzEisKBnJlc3VsdBgCIAEoCzIbLmFnZW50LnYxLlBpV3JpdGVFeGVjUmVzdWx0ImQKDlBpR3JlcFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUdyZXBFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUdyZXBFeGVjUmVzdWx0ImQKDlBpRmluZFRvb2xDYWxsEiYKBGFyZ3MYASABKAsyGC5hZ2VudC52MS5QaUZpbmRFeGVjQXJncxIqCgZyZXN1bHQYAiABKAsyGi5hZ2VudC52MS5QaUZpbmRFeGVjUmVzdWx0Il4KDFBpTHNUb29sQ2FsbBIkCgRhcmdzGAEgASgLMhYuYWdlbnQudjEuUGlMc0V4ZWNBcmdzEigKBnJlc3VsdBgCIAEoCzIYLmFnZW50LnYxLlBpTHNFeGVjUmVzdWx0IoEBChtTZWFyY2hDb252ZXJzYXRpb25zVG9vbENhbGwSLgoEYXJncxgBIAEoCzIgLmFnZW50LnYxLkNvbnZlcnNhdGlvblNlYXJjaEFyZ3MSMgoGcmVzdWx0GAIgASgLMiIuYWdlbnQudjEuQ29udmVyc2F0aW9uU2VhcmNoUmVzdWx0IjkKGkNvbm5lY3RTY21HaXRodWJSZXBvc2l0b3J5Eg0KBW93bmVyGAEgASgJEgwKBHJlcG8YAiABKAkifgoQQ29ubmVjdFNjbUdpdGh1YhI4CgpyZXBvc2l0b3J5GAEgASgLMiQuYWdlbnQudjEuQ29ubmVjdFNjbUdpdGh1YlJlcG9zaXRvcnkSHAoPZ2hlX2FwcGxpY2F0aW9uGAIgASgJSACIAQFCEgoQX2doZV9hcHBsaWNhdGlvbiJeCg5Db25uZWN0U2NtQXJncxIUCgx0b29sX2NhbGxfaWQYASABKAkSLAoGZ2l0aHViGAIgASgLMhouYWdlbnQudjEuQ29ubmVjdFNjbUdpdGh1YkgAQggKBnRhcmdldCITChFDb25uZWN0U2NtU3VjY2VzcyIgCg9Db25uZWN0U2NtRXJyb3ISDQoFZXJyb3IYASABKAkiJAoSQ29ubmVjdFNjbVJlamVjdGVkEg4KBnJlYXNvbhgBIAEoCSKqAQoQQ29ubmVjdFNjbVJlc3VsdBIuCgdzdWNjZXNzGAEgASgLMhsuYWdlbnQudjEuQ29ubmVjdFNjbVN1Y2Nlc3NIABIqCgVlcnJvchgCIAEoCzIZLmFnZW50LnYxLkNvbm5lY3RTY21FcnJvckgAEjAKCHJlamVjdGVkGAMgASgLMhwuYWdlbnQudjEuQ29ubmVjdFNjbVJlamVjdGVkSABCCAoGcmVzdWx0ImgKEkNvbm5lY3RTY21Ub29sQ2FsbBImCgRhcmdzGAEgASgLMhguYWdlbnQudjEuQ29ubmVjdFNjbUFyZ3MSKgoGcmVzdWx0GAIgASgLMhouYWdlbnQudjEuQ29ubmVjdFNjbVJlc3VsdCqIAQodQXBwbGllZEFnZW50Q2hhbmdlX0NoYW5nZVR5cGUSGwoXQ0hBTkdFX1RZUEVfVU5TUEVDSUZJRUQQABIXChNDSEFOR0VfVFlQRV9DUkVBVEVEEAESGAoUQ0hBTkdFX1RZUEVfTU9ESUZJRUQQAhIXChNDSEFOR0VfVFlQRV9ERUxFVEVEEAMqpAEKC01vdXNlQnV0dG9uEhwKGE1PVVNFX0JVVFRPTl9VTlNQRUNJRklFRBAAEhUKEU1PVVNFX0JVVFRPTl9MRUZUEAESFgoSTU9VU0VfQlVUVE9OX1JJR0hUEAISFwoTTU9VU0VfQlVUVE9OX01JRERMRRADEhUKEU1PVVNFX0JVVFRPTl9CQUNLEAQSGAoUTU9VU0VfQlVUVE9OX0ZPUldBUkQQBSqeAQoPU2Nyb2xsRGlyZWN0aW9uEiAKHFNDUk9MTF9ESVJFQ1RJT05fVU5TUEVDSUZJRUQQABIXChNTQ1JPTExfRElSRUNUSU9OX1VQEAESGQoVU0NST0xMX0RJUkVDVElPTl9ET1dOEAISGQoVU0NST0xMX0RJUkVDVElPTl9MRUZUEAMSGgoWU0NST0xMX0RJUkVDVElPTl9SSUdIVBAEKnAKEEN1cnNvclJ1bGVTb3VyY2USIgoeQ1VSU09SX1JVTEVfU09VUkNFX1VOU1BFQ0lGSUVEEAASGwoXQ1VSU09SX1JVTEVfU09VUkNFX1RFQU0QARIbChdDVVJTT1JfUlVMRV9TT1VSQ0VfVVNFUhACKrwBChJEaWFnbm9zdGljU2V2ZXJpdHkSIwofRElBR05PU1RJQ19TRVZFUklUWV9VTlNQRUNJRklFRBAAEh0KGURJQUdOT1NUSUNfU0VWRVJJVFlfRVJST1IQARIfChtESUFHTk9TVElDX1NFVkVSSVRZX1dBUk5JTkcQAhIjCh9ESUFHTk9TVElDX1NFVkVSSVRZX0lORk9STUFUSU9OEAMSHAoYRElBR05PU1RJQ19TRVZFUklUWV9ISU5UEAQqnAEKDVJlY29yZGluZ01vZGUSHgoaUkVDT1JESU5HX01PREVfVU5TUEVDSUZJRUQQABIiCh5SRUNPUkRJTkdfTU9ERV9TVEFSVF9SRUNPUkRJTkcQARIhCh1SRUNPUkRJTkdfTU9ERV9TQVZFX1JFQ09SRElORxACEiQKIFJFQ09SRElOR19NT0RFX0RJU0NBUkRfUkVDT1JESU5HEAMqkwEKH1JlcXVlc3RlZEZpbGVQYXRoUmVqZWN0ZWRSZWFzb24SMwovUkVRVUVTVEVEX0ZJTEVfUEFUSF9SRUpFQ1RFRF9SRUFTT05fVU5TUEVDSUZJRUQQABI7CjdSRVFVRVNURURfRklMRV9QQVRIX1JFSkVDVEVEX1JFQVNPTl9TTEFTSEVTX05PVF9BTExPV0VEEAEqrQEKC1BhY2thZ2VUeXBlEhwKGFBBQ0tBR0VfVFlQRV9VTlNQRUNJRklFRBAAEh8KG1BBQ0tBR0VfVFlQRV9DVVJTT1JfUFJPSkVDVBABEiAKHFBBQ0tBR0VfVFlQRV9DVVJTT1JfUEVSU09OQUwQAhIdChlQQUNLQUdFX1RZUEVfQ0xBVURFX1NLSUxMEAMSHgoaUEFDS0FHRV9UWVBFX0NMQVVERV9QTFVHSU4QBCp9ChJTYW5kYm94UG9saWN5X1R5cGUSFAoQVFlQRV9VTlNQRUNJRklFRBAAEhYKElRZUEVfSU5TRUNVUkVfTk9ORRABEhwKGFRZUEVfV09SS1NQQUNFX1JFQURXUklURRACEhsKF1RZUEVfV09SS1NQQUNFX1JFQURPTkxZEAMqcQoPVGltZW91dEJlaGF2aW9yEiAKHFRJTUVPVVRfQkVIQVZJT1JfVU5TUEVDSUZJRUQQABIbChdUSU1FT1VUX0JFSEFWSU9SX0NBTkNFTBABEh8KG1RJTUVPVVRfQkVIQVZJT1JfQkFDS0dST1VORBACKnkKEFNoZWxsQWJvcnRSZWFzb24SIgoeU0hFTExfQUJPUlRfUkVBU09OX1VOU1BFQ0lGSUVEEAASIQodU0hFTExfQUJPUlRfUkVBU09OX1VTRVJfQUJPUlQQARIeChpTSEVMTF9BQk9SVF9SRUFTT05fVElNRU9VVBACKqoBChxDdXN0b21TdWJhZ2VudFBlcm1pc3Npb25Nb2RlEi8KK0NVU1RPTV9TVUJBR0VOVF9QRVJNSVNTSU9OX01PREVfVU5TUEVDSUZJRUQQABIrCidDVVNUT01fU1VCQUdFTlRfUEVSTUlTU0lPTl9NT0RFX0RFRkFVTFQQARIsCihDVVNUT01fU1VCQUdFTlRfUEVSTUlTU0lPTl9NT0RFX1JFQURPTkxZEAIqlQEKClRvZG9TdGF0dXMSGwoXVE9ET19TVEFUVVNfVU5TUEVDSUZJRUQQABIXChNUT0RPX1NUQVRVU19QRU5ESU5HEAESGwoXVE9ET19TVEFUVVNfSU5fUFJPR1JFU1MQAhIZChVUT0RPX1NUQVRVU19DT01QTEVURUQQAxIZChVUT0RPX1NUQVRVU19DQU5DRUxMRUQQBCpmCghDbGllbnRPUxIZChVDTElFTlRfT1NfVU5TUEVDSUZJRUQQABIVChFDTElFTlRfT1NfV0lORE9XUxABEhMKD0NMSUVOVF9PU19NQUNPUxACEhMKD0NMSUVOVF9PU19MSU5VWBADKuwBChxBcnRpZmFjdFVwbG9hZERpc3BhdGNoU3RhdHVzEi8KK0FSVElGQUNUX1VQTE9BRF9ESVNQQVRDSF9TVEFUVVNfVU5TUEVDSUZJRUQQABIsCihBUlRJRkFDVF9VUExPQURfRElTUEFUQ0hfU1RBVFVTX0FDQ0VQVEVEEAESLAooQVJUSUZBQ1RfVVBMT0FEX0RJU1BBVENIX1NUQVRVU19SRUpFQ1RFRBACEj8KO0FSVElGQUNUX1VQTE9BRF9ESVNQQVRDSF9TVEFUVVNfU0tJUFBFRF9BTFJFQURZX0lOX1BST0dSRVNTEAMqVwoKRnJhbWVfS2luZBIUChBLSU5EX1VOU1BFQ0lGSUVEEAASEAoMS0lORF9SRVFVRVNUEAESEQoNS0lORF9SRVNQT05TRRACEg4KCktJTkRfRVJST1IQAyqwAgoXQnVnYm90RGVlcGxpbmtFdmVudEtpbmQSKgomQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfVU5TUEVDSUZJRUQQABImCiJCVUdCT1RfREVFUExJTktfRVZFTlRfS0lORF9DTElDS0VEEAESMwovQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfSEFORExFRF9ESUFMT0dfU0hPV04QAhIzCi9CVUdCT1RfREVFUExJTktfRVZFTlRfS0lORF9IQU5ETEVEX0NIQVRfQ1JFQVRFRBADEiQKIEJVR0JPVF9ERUVQTElOS19FVkVOVF9LSU5EX0VSUk9SEAQSMQotQlVHQk9UX0RFRVBMSU5LX0VWRU5UX0tJTkRfSEFORExFRF9GSVhfSU5fV0VCEAUqygEKLENvbW1hbmRDbGFzc2lmaWVyUmVzdWx0X1N1Z2dlc3RlZFNhbmRib3hNb2RlEiYKIlNVR0dFU1RFRF9TQU5EQk9YX01PREVfVU5TUEVDSUZJRUQQABIiCh5TVUdHRVNURURfU0FOREJPWF9NT0RFX1NBTkRCT1gQARIlCiFTVUdHRVNURURfU0FOREJPWF9NT0RFX05PX1NBTkRCT1gQAhInCiNTVUdHRVNURURfU0FOREJPWF9NT0RFX1VOREVURVJNSU5FRBADKpABCiFTaGVsbEhvb2tBcHByb3ZhbFJlcXVpcmVtZW50X0tpbmQSNAowU0hFTExfSE9PS19BUFBST1ZBTF9SRVFVSVJFTUVOVF9LSU5EX1VOU1BFQ0lGSUVEEAASNQoxU0hFTExfSE9PS19BUFBST1ZBTF9SRVFVSVJFTUVOVF9LSU5EX0ZPUkNFX1BST01QVBABKo8BChVTaGVsbEJhY2tncm91bmRSZWFzb24SJwojU0hFTExfQkFDS0dST1VORF9SRUFTT05fVU5TUEVDSUZJRUQQABIjCh9TSEVMTF9CQUNLR1JPVU5EX1JFQVNPTl9USU1FT1VUEAESKAokU0hFTExfQkFDS0dST1VORF9SRUFTT05fVVNFUl9SRVFVRVNUEAIqpAEKGkZvcmNlQmFja2dyb3VuZFNoZWxsU3RhdHVzEi0KKUZPUkNFX0JBQ0tHUk9VTkRfU0hFTExfU1RBVFVTX1VOU1BFQ0lGSUVEEAASKgomRk9SQ0VfQkFDS0dST1VORF9TSEVMTF9TVEFUVVNfQUNDRVBURUQQARIrCidGT1JDRV9CQUNLR1JPVU5EX1NIRUxMX1NUQVRVU19OT1RfRk9VTkQQAirSAQoYU3ViYWdlbnRCYWNrZ3JvdW5kUmVhc29uEioKJlNVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1VOU1BFQ0lGSUVEEAASLAooU1VCQUdFTlRfQkFDS0dST1VORF9SRUFTT05fQUdFTlRfUkVRVUVTVBABEisKJ1NVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1VTRVJfUkVRVUVTVBACEi8KK1NVQkFHRU5UX0JBQ0tHUk9VTkRfUkVBU09OX1FVRVVFRF9GT0xMT1dfVVAQAyqwAQodRm9yY2VCYWNrZ3JvdW5kU3ViYWdlbnRTdGF0dXMSMAosRk9SQ0VfQkFDS0dST1VORF9TVUJBR0VOVF9TVEFUVVNfVU5TUEVDSUZJRUQQABItCilGT1JDRV9CQUNLR1JPVU5EX1NVQkFHRU5UX1NUQVRVU19BQ0NFUFRFRBABEi4KKkZPUkNFX0JBQ0tHUk9VTkRfU1VCQUdFTlRfU1RBVFVTX05PVF9GT1VORBACKqEBChtTbWFydE1vZGVDbGFzc2lmaWVyRGVjaXNpb24SLgoqU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX1VOU1BFQ0lGSUVEEAASKAokU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX0FMTE9XEAESKAokU01BUlRfTU9ERV9DTEFTU0lGSUVSX0RFQ0lTSU9OX0JMT0NLEAIqmAEKGENvbnZlcnNhdGlvblNlYXJjaFNvdXJjZRIqCiZDT05WRVJTQVRJT05fU0VBUkNIX1NPVVJDRV9VTlNQRUNJRklFRBAAEiQKIENPTlZFUlNBVElPTl9TRUFSQ0hfU09VUkNFX0xPQ0FMEAESKgomQ09OVkVSU0FUSU9OX1NFQVJDSF9TT1VSQ0VfQ0xPVURfQ0FDSEUQAirTAQobR2V0RGlmZlJlcXVlc3RfT3V0cHV0Rm9ybWF0Eh0KGU9VVFBVVF9GT1JNQVRfVU5TUEVDSUZJRUQQABIdChlPVVRQVVRfRk9STUFUX05BTUVfU1RBVFVTEAESKQolT1VUUFVUX0ZPUk1BVF9OQU1FX1NUQVRVU19BTkRfTlVNU1RBVBACEhwKGE9VVFBVVF9GT1JNQVRfRklMRV9ESUZGUxADEi0KKU9VVFBVVF9GT1JNQVRfRElGRlNfV0lUSF9CRUZPUkVfQU5EX0FGVEVSEAQqcQoQR2l0RGlmZl9EaWZmVHlwZRIZChVESUZGX1RZUEVfVU5TUEVDSUZJRUQQABIaChZESUZGX1RZUEVfRElGRl9UT19IRUFEEAESJgoiRElGRl9UWVBFX0RJRkZfRlJPTV9CUkFOQ0hfVE9fTUFJThACMocECgxBZ2VudFNlcnZpY2USQQoDUnVuEhwuYWdlbnQudjEuQWdlbnRDbGllbnRNZXNzYWdlGhwuYWdlbnQudjEuQWdlbnRTZXJ2ZXJNZXNzYWdlEj8KBlJ1blNTRRIXLmFnZW50LnYxLkJpZGlSZXF1ZXN0SWQaHC5hZ2VudC52MS5BZ2VudFNlcnZlck1lc3NhZ2USRAoJTmFtZUFnZW50EhouYWdlbnQudjEuTmFtZUFnZW50UmVxdWVzdBobLmFnZW50LnYxLk5hbWVBZ2VudFJlc3BvbnNlElYKD0dldFVzYWJsZU1vZGVscxIgLmFnZW50LnYxLkdldFVzYWJsZU1vZGVsc1JlcXVlc3QaIS5hZ2VudC52MS5HZXRVc2FibGVNb2RlbHNSZXNwb25zZRJoChVHZXREZWZhdWx0TW9kZWxGb3JDbGkSJi5hZ2VudC52MS5HZXREZWZhdWx0TW9kZWxGb3JDbGlSZXF1ZXN0GicuYWdlbnQudjEuR2V0RGVmYXVsdE1vZGVsRm9yQ2xpUmVzcG9uc2USawoWR2V0QWxsb3dlZE1vZGVsSW50ZW50cxInLmFnZW50LnYxLkdldEFsbG93ZWRNb2RlbEludGVudHNSZXF1ZXN0GiguYWdlbnQudjEuR2V0QWxsb3dlZE1vZGVsSW50ZW50c1Jlc3BvbnNlMrUICg5Db250cm9sU2VydmljZRJNCgxSZWFkVGV4dEZpbGUSHS5hZ2VudC52MS5SZWFkVGV4dEZpbGVSZXF1ZXN0Gh4uYWdlbnQudjEuUmVhZFRleHRGaWxlUmVzcG9uc2USUAoNV3JpdGVUZXh0RmlsZRIeLmFnZW50LnYxLldyaXRlVGV4dEZpbGVSZXF1ZXN0Gh8uYWdlbnQudjEuV3JpdGVUZXh0RmlsZVJlc3BvbnNlElMKDlJlYWRCaW5hcnlGaWxlEh8uYWdlbnQudjEuUmVhZEJpbmFyeUZpbGVSZXF1ZXN0GiAuYWdlbnQudjEuUmVhZEJpbmFyeUZpbGVSZXNwb25zZRJWCg9Xcml0ZUJpbmFyeUZpbGUSIC5hZ2VudC52MS5Xcml0ZUJpbmFyeUZpbGVSZXF1ZXN0GiEuYWdlbnQudjEuV3JpdGVCaW5hcnlGaWxlUmVzcG9uc2USbgoXR2V0V29ya3NwYWNlQ2hhbmdlc0hhc2gSKC5hZ2VudC52MS5HZXRXb3Jrc3BhY2VDaGFuZ2VzSGFzaFJlcXVlc3QaKS5hZ2VudC52MS5HZXRXb3Jrc3BhY2VDaGFuZ2VzSGFzaFJlc3BvbnNlEnEKGFJlZnJlc2hHaXRodWJBY2Nlc3NUb2tlbhIpLmFnZW50LnYxLlJlZnJlc2hHaXRodWJBY2Nlc3NUb2tlblJlcXVlc3QaKi5hZ2VudC52MS5SZWZyZXNoR2l0aHViQWNjZXNzVG9rZW5SZXNwb25zZRJrChZXYXJtUmVtb3RlQWNjZXNzU2VydmVyEicuYWdlbnQudjEuV2FybVJlbW90ZUFjY2Vzc1NlcnZlclJlcXVlc3QaKC5hZ2VudC52MS5XYXJtUmVtb3RlQWNjZXNzU2VydmVyUmVzcG9uc2USUAoNTGlzdEFydGlmYWN0cxIeLmFnZW50LnYxLkxpc3RBcnRpZmFjdHNSZXF1ZXN0Gh8uYWdlbnQudjEuTGlzdEFydGlmYWN0c1Jlc3BvbnNlElYKD1VwbG9hZEFydGlmYWN0cxIgLmFnZW50LnYxLlVwbG9hZEFydGlmYWN0c1JlcXVlc3QaIS5hZ2VudC52MS5VcGxvYWRBcnRpZmFjdHNSZXNwb25zZRJiChNHZXRNY3BSZWZyZXNoVG9rZW5zEiQuYWdlbnQudjEuR2V0TWNwUmVmcmVzaFRva2Vuc1JlcXVlc3QaJS5hZ2VudC52MS5HZXRNY3BSZWZyZXNoVG9rZW5zUmVzcG9uc2USdwoaVXBkYXRlRW52aXJvbm1lbnRWYXJpYWJsZXMSKy5hZ2VudC52MS5VcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1JlcXVlc3QaLC5hZ2VudC52MS5VcGRhdGVFbnZpcm9ubWVudFZhcmlhYmxlc1Jlc3BvbnNlMg0KC0V4ZWNTZXJ2aWNlMlEKIlByaXZhdGVXb3JrZXJCcmlkZ2VFeHRlcm5hbFNlcnZpY2USKwoHQ29ubmVjdBIPLmFnZW50LnYxLkZyYW1lGg8uYWdlbnQudjEuRnJhbWUyeAoQTGlmZWN5Y2xlU2VydmljZRIxCg1SZXNldEluc3RhbmNlEg8uYWdlbnQudjEuRW1wdHkaDy5hZ2VudC52MS5FbXB0eRIxCg1SZW5ld0luc3RhbmNlEg8uYWdlbnQudjEuRW1wdHkaDy5hZ2VudC52MS5FbXB0eWIGcHJvdG8z");
var McpToolResultSchema = /* @__PURE__ */ messageDesc(file_agent, 13);
var McpToolCallSchema = /* @__PURE__ */ messageDesc(file_agent, 14);
var ToolCallSchema = /* @__PURE__ */ messageDesc(file_agent, 46);
var ConversationStepSchema = /* @__PURE__ */ messageDesc(file_agent, 53);
var ConversationActionSchema = /* @__PURE__ */ messageDesc(file_agent, 54);
var UserMessageActionSchema = /* @__PURE__ */ messageDesc(file_agent, 55);
var ResumeActionSchema = /* @__PURE__ */ messageDesc(file_agent, 57);
var UserMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 63);
var AssistantMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 64);
var ThinkingMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 65);
var ConversationTurnStructureSchema = /* @__PURE__ */ messageDesc(file_agent, 70);
var AgentConversationTurnStructureSchema = /* @__PURE__ */ messageDesc(file_agent, 72);
var ConversationStateStructureSchema = /* @__PURE__ */ messageDesc(file_agent, 83);
var ModelDetailsSchema = /* @__PURE__ */ messageDesc(file_agent, 88);
var RequestedModelSchema = /* @__PURE__ */ messageDesc(file_agent, 89);
var RequestedModel_ModelParameterbytesSchema = /* @__PURE__ */ messageDesc(file_agent, 90);
var AgentRunRequestSchema = /* @__PURE__ */ messageDesc(file_agent, 91);
var InteractionResponseSchema = /* @__PURE__ */ messageDesc(file_agent, 111);
var ClientHeartbeatSchema = /* @__PURE__ */ messageDesc(file_agent, 114);
var AgentClientMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 118);
var CursorRuleTypeGlobalSchema = /* @__PURE__ */ messageDesc(file_agent, 180);
var CursorRuleTypeSchema = /* @__PURE__ */ messageDesc(file_agent, 184);
var CursorRuleSchema = /* @__PURE__ */ messageDesc(file_agent, 185);
var ExecClientStreamCloseSchema = /* @__PURE__ */ messageDesc(file_agent, 236);
var ExecClientHeartbeatSchema = /* @__PURE__ */ messageDesc(file_agent, 238);
var ExecClientControlMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 239);
var ExecServerMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 243);
var ExecClientMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 244);
var GetBlobResultSchema = /* @__PURE__ */ messageDesc(file_agent, 268);
var SetBlobResultSchema = /* @__PURE__ */ messageDesc(file_agent, 270);
var KvClientMessageSchema = /* @__PURE__ */ messageDesc(file_agent, 272);
var McpArgsSchema = /* @__PURE__ */ messageDesc(file_agent, 284);
var McpResultSchema = /* @__PURE__ */ messageDesc(file_agent, 285);
var McpToolNotFoundSchema = /* @__PURE__ */ messageDesc(file_agent, 286);
var McpTextContentSchema = /* @__PURE__ */ messageDesc(file_agent, 287);
var McpImageContentSchema = /* @__PURE__ */ messageDesc(file_agent, 288);
var McpToolResultContentItemSchema = /* @__PURE__ */ messageDesc(file_agent, 289);
var McpSuccessSchema = /* @__PURE__ */ messageDesc(file_agent, 290);
var McpRejectedSchema = /* @__PURE__ */ messageDesc(file_agent, 292);
var McpToolDefinitionSchema = /* @__PURE__ */ messageDesc(file_agent, 306);
var McpDescriptorSchema = /* @__PURE__ */ messageDesc(file_agent, 309);
var McpToolDescriptorSchema = /* @__PURE__ */ messageDesc(file_agent, 310);
var RequestContextResultSchema = /* @__PURE__ */ messageDesc(file_agent, 336);
var RequestContextSuccessSchema = /* @__PURE__ */ messageDesc(file_agent, 337);
var RequestContextEnvSchema = /* @__PURE__ */ messageDesc(file_agent, 343);
var SelectedImageSchema = /* @__PURE__ */ messageDesc(file_agent, 349);
var SelectedImage_BlobIdWithDataSchema = /* @__PURE__ */ messageDesc(file_agent, 350);
var SelectedImage_DimensionSchema = /* @__PURE__ */ messageDesc(file_agent, 351);
var SelectedContextSchema = /* @__PURE__ */ messageDesc(file_agent, 373);
var McpApprovedSchema = /* @__PURE__ */ messageDesc(file_agent, 525);
var McpStateServerSchema = /* @__PURE__ */ messageDesc(file_agent, 527);
var McpStateSuccessSchema = /* @__PURE__ */ messageDesc(file_agent, 528);
var McpStateExecResultSchema = /* @__PURE__ */ messageDesc(file_agent, 531);
var ShellAllowlistPrecheckResultSchema = /* @__PURE__ */ messageDesc(file_agent, 536);
var McpAllowlistPrecheckResultSchema = /* @__PURE__ */ messageDesc(file_agent, 538);
var WebFetchAllowlistPrecheckResultSchema = /* @__PURE__ */ messageDesc(file_agent, 540);
var ForceBackgroundShellResultSchema = /* @__PURE__ */ messageDesc(file_agent, 545);
var ForceBackgroundSubagentResultSchema = /* @__PURE__ */ messageDesc(file_agent, 559);
function parseArguments(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CursorProtocolError("INVALID_REQUEST", "Cursor tool arguments must be a JSON object");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new CursorProtocolError("INVALID_REQUEST", "Cursor tool arguments must be a JSON object");
  return parsed;
}
function encodeArguments(raw) {
  return Object.fromEntries(Object.entries(parseArguments(raw)).map(([name, value]) => [name, toBinary(ValueSchema, fromJson(ValueSchema, value))]));
}
function decodeArguments(args) {
  try {
    return JSON.stringify(Object.fromEntries(Object.entries(args).map(([name, value]) => [name, toJson(ValueSchema, fromBinary(ValueSchema, value))])));
  } catch {
    throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor MCP argument encoding");
  }
}
function textOf(content) {
  return content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
}
function mcpContent(result2) {
  return create(McpSuccessSchema, {
    isError: result2.isError === true,
    content: result2.content.map((item) => {
      if (item.type === "image") return create(McpToolResultContentItemSchema, {
        content: { case: "image", value: create(McpImageContentSchema, { data: item.data, mimeType: item.mediaType }) }
      });
      if (item.type === "text") return create(McpToolResultContentItemSchema, {
        content: { case: "text", value: create(McpTextContentSchema, { text: item.text }) }
      });
      throw new CursorProtocolError("INVALID_REQUEST", "Cursor tool results support text and image content only");
    })
  });
}
var MCP_PROVIDER = "dsh";
function uuid(seed) {
  const bytes2 = createHash3("sha256").update(seed).digest().subarray(0, 16);
  bytes2[6] = bytes2[6] & 15 | 64;
  bytes2[8] = bytes2[8] & 63 | 128;
  const hex = bytes2.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function wireCallId(id) {
  if (!id) throw new CursorProtocolError("INVALID_REQUEST", "Cursor history tool-call IDs must not be empty");
  return /^[a-zA-Z0-9_-]+$/u.test(id) ? id : `dsh_${createHash3("sha256").update(id).digest("base64url")}`;
}
function asStructuredSelectedImages(content, blobs) {
  return content.flatMap((item) => {
    if (item.type !== "image") return [];
    const blobId = blobs.put(item.data);
    return [create(SelectedImageSchema, {
      uuid: uuid(`image:${Buffer.from(blobId).toString("hex")}`),
      mimeType: item.mediaType,
      dimension: create(SelectedImage_DimensionSchema, { width: item.width, height: item.height }),
      dataOrBlobId: { case: "blobIdWithData", value: create(SelectedImage_BlobIdWithDataSchema, { blobId, data: item.data }) }
    })];
  });
}
function userMessage(messages, blobs, seed) {
  const content = messages.flatMap((message2) => message2.content);
  const selectedImages = asStructuredSelectedImages(content, blobs);
  return create(UserMessageSchema, {
    text: textOf(content),
    messageId: uuid(seed),
    ...selectedImages.length ? { selectedContext: create(SelectedContextSchema, { selectedImages }) } : {}
  });
}
function rootContent(content) {
  return content.map((item) => {
    switch (item.type) {
      case "text":
        return { type: "text", text: item.text };
      case "reasoning":
        return { type: "reasoning", text: item.text };
      case "image":
        return { type: "image", image: `data:${item.mediaType};base64,${Buffer.from(item.data).toString("base64")}`, mediaType: item.mediaType };
      case "tool-call":
        return { type: "tool-call", toolCallId: wireCallId(item.id), toolName: item.name, args: parseArguments(item.arguments) };
    }
  });
}
function rootResult(message2) {
  return message2.content.map((item) => item.type === "image" ? `[${item.mediaType} image, attached below]` : item.type === "text" ? item.text : "").filter(Boolean).join("\n");
}
function activeIndex(messages) {
  if (messages.at(-1)?.role !== "user") return -1;
  let index = messages.length - 1;
  while (index > 0 && messages[index - 1]?.role === "user") index--;
  return index;
}
function sameHead(previous, head) {
  return previous.length >= head.length && head.every((id, index) => Buffer.from(previous[index]).equals(id));
}
function systemPrompts(messages) {
  return messages.filter((message2) => message2.role === "system" || message2.role === "developer").map((message2) => textOf(message2.content).trim()).filter(Boolean);
}
function buildRunRequest(request2, blobs, cached) {
  const active = activeIndex(request2.messages);
  const historyEnd = active < 0 ? request2.messages.length : active;
  const prompts = systemPrompts(request2.messages);
  const systemIds = (prompts.length ? prompts : ["You are a helpful assistant."]).map((content) => blobs.put(new TextEncoder().encode(JSON.stringify({ role: "system", content }))));
  const roots = [];
  const pushRoot = (value) => {
    roots.push(blobs.put(new TextEncoder().encode(JSON.stringify(value))));
  };
  const results = /* @__PURE__ */ new Map();
  const calls = /* @__PURE__ */ new Set();
  for (let index = 0; index < historyEnd; index++) {
    const message2 = request2.messages[index];
    if (message2.role === "tool") {
      if (!message2.toolCallId) throw new CursorProtocolError("INVALID_REQUEST", "Cursor history tool results require toolCallId");
      results.set(message2.toolCallId, message2);
    }
    if (message2.role === "assistant") for (const item of message2.content) {
      if (item.type !== "tool-call") continue;
      if (calls.has(item.id)) throw new CursorProtocolError("INVALID_REQUEST", "Duplicate Cursor history tool-call ID");
      calls.add(item.id);
    }
  }
  let toolImages = [];
  const flushToolImages = () => {
    if (!toolImages.length) return;
    pushRoot({ role: "user", content: rootContent([{ type: "text", text: "Images returned by the preceding tool results:" }, ...toolImages]) });
    toolImages = [];
  };
  for (let index = 0; index < historyEnd; index++) {
    const message2 = request2.messages[index];
    if (message2.role === "system" || message2.role === "developer") continue;
    if (message2.role !== "tool") flushToolImages();
    if (message2.role === "tool") {
      if (!calls.has(message2.toolCallId)) throw new CursorProtocolError("INVALID_REQUEST", "Cursor history contains an unpaired tool result");
      pushRoot({ role: "tool", id: wireCallId(message2.toolCallId), content: [{
        type: "tool-result",
        toolCallId: wireCallId(message2.toolCallId),
        toolName: message2.toolName ?? "",
        result: rootResult(message2),
        ...message2.isError ? { isError: true } : {}
      }] });
      toolImages.push(...message2.content.filter((item) => item.type === "image"));
    } else {
      pushRoot({ role: message2.role, content: rootContent(message2.content) });
    }
  }
  flushToolImages();
  const head = [...systemIds];
  if (roots.length && prompts.length) {
    head.push(blobs.put(new TextEncoder().encode(JSON.stringify({ role: "user", content: `<rules>
${prompts.join("\n\n")}
</rules>` }))));
  }
  roots.unshift(...head);
  const turns = [];
  let current;
  const flushTurn = () => {
    if (!current) return;
    turns.push(blobs.put(toBinary(ConversationTurnStructureSchema, create(ConversationTurnStructureSchema, {
      turn: { case: "agentConversationTurn", value: create(AgentConversationTurnStructureSchema, { userMessage: current.user, steps: current.steps }) }
    }))));
    current = void 0;
  };
  const pushStep = (step) => {
    current?.steps.push(blobs.put(toBinary(ConversationStepSchema, step)));
  };
  for (let index = 0; index < historyEnd; index++) {
    const message2 = request2.messages[index];
    if (message2.role === "user") {
      flushTurn();
      current = { user: blobs.put(toBinary(UserMessageSchema, userMessage([message2], blobs, `${request2.conversationId}:user:${index}`))), steps: [] };
    } else if (message2.role === "assistant") {
      for (const item of message2.content) {
        if (item.type === "text") pushStep(create(ConversationStepSchema, { message: { case: "assistantMessage", value: create(AssistantMessageSchema, { text: item.text }) } }));
        if (item.type === "reasoning") pushStep(create(ConversationStepSchema, { message: { case: "thinkingMessage", value: create(ThinkingMessageSchema, { text: item.text }) } }));
        if (item.type === "tool-call") {
          const result2 = results.get(item.id);
          pushStep(create(ConversationStepSchema, { message: { case: "toolCall", value: create(ToolCallSchema, {
            toolCallId: wireCallId(item.id),
            tool: { case: "mcpToolCall", value: create(McpToolCallSchema, {
              args: create(McpArgsSchema, { name: item.name, toolName: item.name, providerIdentifier: MCP_PROVIDER, toolCallId: wireCallId(item.id), args: encodeArguments(item.arguments) }),
              ...result2 ? { result: create(McpToolResultSchema, { result: { case: "success", value: mcpContent(result2) } }) } : {}
            }) }
          }) } }));
        }
      }
    }
  }
  flushTurn();
  const action = active < 0 ? create(ConversationActionSchema, { action: { case: "resumeAction", value: create(ResumeActionSchema) } }) : create(ConversationActionSchema, { action: { case: "userMessageAction", value: create(UserMessageActionSchema, {
    userMessage: userMessage(request2.messages.slice(active), blobs, `${request2.conversationId}:active:${active}`)
  }) } });
  const conversationState = cached && sameHead(cached.rootPromptMessagesJson, systemIds) ? clone(ConversationStateStructureSchema, cached) : create(ConversationStateStructureSchema);
  conversationState.rootPromptMessagesJson = roots;
  conversationState.turns = turns;
  conversationState.pendingToolCalls = [];
  return create(AgentRunRequestSchema, {
    conversationId: request2.conversationId,
    conversationState,
    action,
    ...modelFields(request2)
  });
}
function modelFields(request2) {
  return {
    modelDetails: create(ModelDetailsSchema, { modelId: request2.selection.wireModelId, maxMode: request2.selection.maxMode }),
    requestedModel: create(RequestedModelSchema, {
      modelId: request2.selection.requestedModelId ?? request2.selection.wireModelId,
      maxMode: request2.selection.maxMode === true,
      parameters: (request2.selection.parameters ?? []).map((parameter) => create(RequestedModel_ModelParameterbytesSchema, { id: parameter.key, value: parameter.value }))
    })
  };
}
function messagesDigest(messages) {
  const hash2 = createHash3("sha256");
  for (const message2 of messages) {
    hash2.update(JSON.stringify([message2.role, message2.toolCallId ?? null, message2.isError === true]));
    for (const item of message2.content) {
      hash2.update(item.type === "image" ? `image:${createHash3("sha256").update(item.data).digest("hex")}` : JSON.stringify(item));
    }
    hash2.update("\0");
  }
  return hash2.digest("hex");
}
function activeUserIndex(messages) {
  return activeIndex(messages);
}
function buildResumeRequest(request2, blobs, checkpoint, active) {
  return create(AgentRunRequestSchema, {
    conversationId: request2.conversationId,
    conversationState: checkpoint,
    action: active < 0 ? create(ConversationActionSchema, { action: { case: "resumeAction", value: create(ResumeActionSchema) } }) : create(ConversationActionSchema, { action: { case: "userMessageAction", value: create(UserMessageActionSchema, {
      userMessage: userMessage(request2.messages.slice(active), blobs, `${request2.conversationId}:active:${request2.messages.length}:${active}`)
    }) } }),
    ...modelFields(request2)
  });
}
var descriptor = clone(FileDescriptorProtoSchema, file_agent.proto);
function addTokenCounters(message2, first2) {
  for (const [index, name] of ["input_tokens", "output_tokens", "cache_read_tokens", "cache_write_tokens", "reasoning_tokens"].entries()) {
    const oneofIndex = message2.oneofDecl.length;
    message2.oneofDecl.push(create(OneofDescriptorProtoSchema, { name: `_${name}` }));
    message2.field.push(create(FieldDescriptorProtoSchema, {
      name,
      jsonName: name.replace(/_([a-z])/gu, (_, letter) => letter.toUpperCase()),
      number: index + first2,
      label: FieldDescriptorProto_Label.OPTIONAL,
      type: FieldDescriptorProto_Type.INT64,
      proto3Optional: true,
      oneofIndex
    }));
  }
}
addTokenCounters(descriptor.messageType.find((message2) => message2.name === "TurnEndedUpdate"), 1);
var modelCall = create(DescriptorProtoSchema, {
  name: "ModelCallCompletedUpdate",
  field: [create(FieldDescriptorProtoSchema, {
    name: "model_call_id",
    jsonName: "modelCallId",
    number: 1,
    label: FieldDescriptorProto_Label.OPTIONAL,
    type: FieldDescriptorProto_Type.STRING
  })]
});
addTokenCounters(modelCall, 2);
descriptor.messageType.push(modelCall);
descriptor.messageType.find((message2) => message2.name === "InteractionUpdate").field.push(create(FieldDescriptorProtoSchema, {
  name: "model_call_completed",
  jsonName: "modelCallCompleted",
  number: 31,
  label: FieldDescriptorProto_Label.OPTIONAL,
  type: FieldDescriptorProto_Type.MESSAGE,
  typeName: ".agent.v1.ModelCallCompletedUpdate",
  oneofIndex: 0
}));
descriptor.messageType.push(create(DescriptorProtoSchema, {
  name: "ToolRequestsListedUpdate",
  field: [create(FieldDescriptorProtoSchema, {
    name: "call_count",
    jsonName: "callCount",
    number: 1,
    label: FieldDescriptorProto_Label.OPTIONAL,
    type: FieldDescriptorProto_Type.UINT32
  })]
}));
descriptor.messageType.find((message2) => message2.name === "InteractionUpdate").field.push(create(FieldDescriptorProtoSchema, {
  name: "tool_requests_listed",
  jsonName: "toolRequestsListed",
  number: 27,
  label: FieldDescriptorProto_Label.OPTIONAL,
  type: FieldDescriptorProto_Type.MESSAGE,
  typeName: ".agent.v1.ToolRequestsListedUpdate",
  oneofIndex: 0
}));
var field = (name, jsonName, number, type, typeName, oneofIndex) => create(FieldDescriptorProtoSchema, { name, jsonName, number, label: FieldDescriptorProto_Label.OPTIONAL, type, ...typeName ? { typeName } : {}, ...oneofIndex === void 0 ? {} : { oneofIndex } });
var { STRING, MESSAGE, INT32, INT64 } = FieldDescriptorProto_Type;
descriptor.messageType.push(
  create(DescriptorProtoSchema, { name: "SystemContextInjection", field: [field("producer", "producer", 1, STRING), field("content", "content", 2, STRING)] }),
  create(DescriptorProtoSchema, { name: "UserContextInjection", field: [
    field("user_message", "userMessage", 1, MESSAGE, ".agent.v1.UserMessage"),
    field("request_context", "requestContext", 2, MESSAGE, ".agent.v1.RequestContext")
  ] }),
  create(DescriptorProtoSchema, { name: "InjectContextAction", field: [
    field("injection_id", "injectionId", 1, STRING),
    field("expected_run_id", "expectedRunId", 2, STRING),
    field("user_context", "userContext", 3, MESSAGE, ".agent.v1.UserContextInjection"),
    field("system_context", "systemContext", 4, MESSAGE, ".agent.v1.SystemContextInjection")
  ] }),
  create(DescriptorProtoSchema, { name: "ContextInjectionDelivered", field: [field("step", "step", 1, INT32), field("delivery_batch_id", "deliveryBatchId", 2, STRING), field("delivered_at_ms", "deliveredAtMs", 3, INT64)] }),
  create(DescriptorProtoSchema, { name: "ContextInjectionRejected", field: [field("reason", "reason", 1, STRING)] }),
  ...["ContextInjectionQueued", "ContextInjectionQueuedForNextTurn", "ContextInjectionCancelled"].map((name) => create(DescriptorProtoSchema, { name })),
  create(DescriptorProtoSchema, { name: "ContextInjectionState", oneofDecl: [create(OneofDescriptorProtoSchema, { name: "state" })], field: [
    field("queued", "queued", 1, MESSAGE, ".agent.v1.ContextInjectionQueued", 0),
    field("delivered", "delivered", 2, MESSAGE, ".agent.v1.ContextInjectionDelivered", 0),
    field("queued_for_next_turn", "queuedForNextTurn", 3, MESSAGE, ".agent.v1.ContextInjectionQueuedForNextTurn", 0),
    field("cancelled", "cancelled", 4, MESSAGE, ".agent.v1.ContextInjectionCancelled", 0),
    field("rejected", "rejected", 5, MESSAGE, ".agent.v1.ContextInjectionRejected", 0)
  ] }),
  create(DescriptorProtoSchema, { name: "ContextInjectionStateUpdate", field: [
    field("injection_id", "injectionId", 1, STRING),
    field("state", "state", 2, MESSAGE, ".agent.v1.ContextInjectionState")
  ] })
);
var message = (name) => descriptor.messageType.find((item) => item.name === name);
message("ConversationAction").field.push(field("inject_context_action", "injectContextAction", 19, MESSAGE, ".agent.v1.InjectContextAction", 0));
message("InteractionUpdate").field.push(field("context_injection_state", "contextInjectionState", 23, MESSAGE, ".agent.v1.ContextInjectionStateUpdate", 0));
message("AgentRunRequest").field.push(field("run_id", "runId", 25, STRING));
message("AgentRunRequest").field.push(field("emit_model_call_usage", "emitModelCallUsage", 37, FieldDescriptorProto_Type.BOOL));
descriptor.messageType.push(create(DescriptorProtoSchema, {
  name: "McpMetaToolOptions",
  field: [
    field("enabled", "enabled", 1, FieldDescriptorProto_Type.BOOL),
    create(FieldDescriptorProtoSchema, {
      name: "mcp_descriptors",
      jsonName: "mcpDescriptors",
      number: 2,
      label: FieldDescriptorProto_Label.REPEATED,
      type: MESSAGE,
      typeName: ".agent.v1.McpDescriptor"
    })
  ]
}));
message("RequestContext").field.push(
  field("mcp_meta_tool_options", "mcpMetaToolOptions", 34, MESSAGE, ".agent.v1.McpMetaToolOptions"),
  field("mcp_info_complete", "mcpInfoComplete", 36, FieldDescriptorProto_Type.BOOL)
);
var registry = createFileRegistry(descriptor, () => void 0);
var WireRequestContextSchema = registry.getMessage("agent.v1.RequestContext");
var WireMcpMetaToolOptionsSchema = registry.getMessage("agent.v1.McpMetaToolOptions");
var WireAgentServerMessageSchema = registry.getMessage("agent.v1.AgentServerMessage");
var WireInteractionUpdateSchema = registry.getMessage("agent.v1.InteractionUpdate");
var WireTurnEndedSchema = registry.getMessage("agent.v1.TurnEndedUpdate");
var WireAgentClientMessageSchema = registry.getMessage("agent.v1.AgentClientMessage");
var DENIALS = {
  shellArgs: "shellResult",
  shellStreamArgs: "shellStream",
  miniSweAgentBashArgs: "miniSweAgentBashResult",
  readArgs: "readResult",
  redactedReadArgs: "redactedReadResult",
  writeArgs: "writeResult",
  deleteArgs: "deleteResult",
  lsArgs: "lsResult",
  grepArgs: "grepResult",
  diagnosticsArgs: "diagnosticsResult",
  backgroundShellSpawnArgs: "backgroundShellSpawnResult",
  writeShellStdinArgs: "writeShellStdinResult",
  fetchArgs: "fetchResult",
  computerUseArgs: "computerUseResult",
  recordScreenArgs: "recordScreenResult",
  subagentArgs: "subagentResult",
  subagentAwaitArgs: "subagentAwaitResult",
  piBashArgs: "piBashResult",
  piReadArgs: "piReadResult",
  piWriteArgs: "piWriteResult",
  piEditArgs: "piEditResult",
  piLsArgs: "piLsResult",
  piFindArgs: "piFindResult",
  piGrepArgs: "piGrepResult",
  canvasDiagnosticsArgs: "canvasDiagnosticsResult",
  conversationSearchArgs: "conversationSearchResult",
  agentStoreConflictArgs: "agentStoreConflictResult",
  smartModeClassifierArgs: "smartModeClassifierResult",
  listMcpResourcesExecArgs: "listMcpResourcesExecResult",
  readMcpResourceExecArgs: "readMcpResourceExecResult"
};
var REASON = "Native execution is not supported by this client. Tools are owned by DeepSeek Harness.";
function execResponse(exec2, message2) {
  return create(AgentClientMessageSchema, {
    message: { case: "execClientMessage", value: create(ExecClientMessageSchema, { id: exec2.id, execId: exec2.execId, message: message2 }) }
  });
}
function toolDefinitions(tools) {
  if (tools.length > LIMITS.toolCount) throw limitError();
  const seen = /* @__PURE__ */ new Set();
  let bytes2 = 0;
  return tools.map((tool) => {
    if (!tool.name || seen.has(tool.name)) throw new CursorProtocolError("INVALID_REQUEST", "Cursor tool names must be unique and nonempty");
    seen.add(tool.name);
    const definition = create(McpToolDefinitionSchema, {
      name: tool.name,
      toolName: tool.name,
      description: tool.description,
      providerIdentifier: MCP_PROVIDER,
      inputSchema: toBinary(ValueSchema, fromJson(ValueSchema, tool.parameters))
    });
    bytes2 += toBinary(McpToolDefinitionSchema, definition).byteLength;
    if (bytes2 > LIMITS.toolBytes) throw limitError();
    return definition;
  });
}
function advertisedName(args, names) {
  if (args.providerIdentifier && args.providerIdentifier !== MCP_PROVIDER) return void 0;
  if (args.serverIdentifier && args.serverIdentifier !== MCP_PROVIDER) return void 0;
  const name = args.toolName || args.name;
  if (!names.has(name)) return void 0;
  return name;
}
function contextResponse(exec2, definitions, cwd, instructions) {
  return execResponse(exec2, { case: "requestContextResult", value: create(RequestContextResultSchema, {
    result: { case: "success", value: create(RequestContextSuccessSchema, {
      requestContext: create(WireRequestContextSchema, {
        mcpInfoComplete: true,
        mcpMetaToolOptions: create(WireMcpMetaToolOptionsSchema, {
          enabled: true,
          mcpDescriptors: definitions.length ? [create(McpDescriptorSchema, {
            serverName: MCP_PROVIDER,
            serverIdentifier: MCP_PROVIDER,
            tools: definitions.map((tool) => create(McpToolDescriptorSchema, { toolName: tool.toolName }))
          })] : []
        }),
        // Cursor's standard instruction carrier. Content is the exact host text,
        // not a provider-authored persona, tool manifest or filesystem rule.
        rules: instructions ? [create(CursorRuleSchema, {
          fullPath: "DSH system instructions",
          content: instructions,
          type: create(CursorRuleTypeSchema, { type: { case: "global", value: create(CursorRuleTypeGlobalSchema) } })
        })] : [],
        ...cwd !== void 0 ? { env: create(RequestContextEnvSchema, { workspacePaths: [cwd] }) } : {}
      })
    }) }
  }) });
}
function mcpStateResponse(exec2, definitions) {
  if (exec2.message.case !== "mcpStateExecArgs") throw new Error("Expected MCP state request");
  const requested = exec2.message.value.serverIdentifiers;
  return execResponse(exec2, { case: "mcpStateExecResult", value: create(McpStateExecResultSchema, {
    result: { case: "success", value: create(McpStateSuccessSchema, {
      servers: requested.length === 0 || requested.includes(MCP_PROVIDER) ? [create(McpStateServerSchema, { serverName: MCP_PROVIDER, serverIdentifier: MCP_PROVIDER, tools: definitions })] : []
    }) }
  }) });
}
function kvResponse(message2, blobs) {
  let response;
  if (message2.message.case === "getBlobArgs") {
    const data = blobs.get(message2.message.value.blobId);
    response = { case: "getBlobResult", value: create(GetBlobResultSchema, data === void 0 ? {} : { blobData: data }) };
  } else if (message2.message.case === "setBlobArgs") {
    blobs.set(message2.message.value.blobId, message2.message.value.blobData);
    response = { case: "setBlobResult", value: create(SetBlobResultSchema) };
  } else throw new CursorProtocolError("UNSUPPORTED_CONTROL", "Unsupported Cursor key-value request");
  return create(AgentClientMessageSchema, { message: { case: "kvClientMessage", value: create(KvClientMessageSchema, { id: message2.id, message: response }) } });
}
function rejectNative(exec2) {
  if (exec2.message.case === "forceBackgroundShellArgs") return execResponse(exec2, {
    case: "forceBackgroundShellResult",
    value: create(ForceBackgroundShellResultSchema, {
      status: 2
      /* NOT_FOUND */
    })
  });
  if (exec2.message.case === "forceBackgroundSubagentArgs") return execResponse(exec2, {
    case: "forceBackgroundSubagentResult",
    value: create(ForceBackgroundSubagentResultSchema, {
      status: 2
      /* NOT_FOUND */
    })
  });
  const responseCase = exec2.message.case ? DENIALS[exec2.message.case] : void 0;
  const result2 = ExecClientMessageSchema.fields.find((field22) => field22.localName === responseCase);
  if (result2?.fieldKind === "message") {
    for (const denial of ["rejected", "error", "failure"]) {
      const field22 = result2.message.fields.find((candidate) => candidate.localName === denial && candidate.oneof !== void 0);
      if (field22?.fieldKind !== "message") continue;
      const reason = field22.message.fields.find((candidate) => ["reason", "error", "errorMessage", "message"].includes(candidate.localName) && candidate.fieldKind === "scalar" && candidate.scalar === 9);
      if (!reason) continue;
      const response = fromJson(ExecClientMessageSchema, {
        id: exec2.id,
        execId: exec2.execId,
        [result2.jsonName]: { [field22.jsonName]: { [reason.jsonName]: REASON } }
      });
      return create(AgentClientMessageSchema, { message: { case: "execClientMessage", value: response } });
    }
  }
  throw new CursorProtocolError("UNSUPPORTED_EXEC", "Unsupported Cursor execution request has no safe denial schema");
}
function rejectInteraction(query) {
  let response;
  if (query.query.case === "askQuestionInteractionQuery") {
    response = { id: query.id, askQuestionInteractionResponse: { result: { rejected: { reason: REASON } } } };
  } else if (query.query.case === "switchModeRequestQuery") {
    response = { id: query.id, switchModeRequestResponse: { rejected: { reason: REASON } } };
  } else if (query.query.case === "createPlanRequestQuery") {
    response = { id: query.id, createPlanRequestResponse: { result: { error: { error: REASON } } } };
  } else {
    throw new CursorProtocolError("UNSUPPORTED_INTERACTION", "Unsupported Cursor interaction query has no safe denial schema");
  }
  return create(AgentClientMessageSchema, { message: { case: "interactionResponse", value: fromJson(InteractionResponseSchema, response) } });
}
var RunEvents = class {
  #queue = [];
  #bytes = 0;
  #ended = false;
  #failure;
  #lease;
  #waiting;
  push(event) {
    if (this.#ended) return;
    const bytes2 = Buffer.byteLength(JSON.stringify(event));
    if (bytes2 > LIMITS.eventBytes) throw limitError();
    if (this.#waiting) {
      const waiting = this.#waiting;
      this.#waiting = void 0;
      waiting.resolve({ done: false, value: event });
      return;
    }
    if (this.#queue.length >= LIMITS.eventCount || this.#bytes + bytes2 > LIMITS.eventBytes) throw limitError();
    this.#queue.push({ event, bytes: bytes2 });
    this.#bytes += bytes2;
  }
  finish(failure3) {
    if (this.#ended) return;
    this.#ended = true;
    this.#failure = failure3;
    if (failure3) {
      this.#queue.length = 0;
      this.#bytes = 0;
    }
    const waiting = this.#waiting;
    this.#waiting = void 0;
    if (waiting) {
      if (failure3) waiting.reject(failure3);
      else waiting.resolve({ done: true, value: void 0 });
    }
  }
  [Symbol.asyncIterator]() {
    if (this.#lease) throw new CursorProtocolError("INVALID_STATE", "Cursor Run already has an active events reader");
    const lease = {};
    this.#lease = lease;
    let returned = false;
    const release = () => {
      returned = true;
      if (this.#lease === lease) this.#lease = void 0;
      if (this.#waiting?.lease === lease) {
        const waiting = this.#waiting;
        this.#waiting = void 0;
        waiting.resolve({ done: true, value: void 0 });
      }
    };
    return {
      next: async () => {
        if (returned) return { done: true, value: void 0 };
        if (this.#waiting) throw new CursorProtocolError("INVALID_STATE", "Concurrent Cursor event reads are not supported");
        const item = this.#queue.shift();
        if (item) {
          this.#bytes -= item.bytes;
          return { done: false, value: item.event };
        }
        if (this.#ended) {
          release();
          if (this.#failure) throw this.#failure;
          return { done: true, value: void 0 };
        }
        return new Promise((resolve, reject) => {
          this.#waiting = { lease, resolve, reject };
        });
      },
      return: async () => {
        release();
        return { done: true, value: void 0 };
      },
      throw: async (error) => {
        release();
        throw error;
      }
    };
  }
};
var compress2 = promisify2(gzip2);
var SPLIT_LIMITS = Object.freeze({ parallel: 16, sequenceWindow: 64, replyBytes: 256 * 1024 });
var RUN_STREAM_PATH = "/agent.v1.AgentService/RunSSE";
var APPEND_PATH = "/aiserver.v1.BidiService/BidiAppend";
function varint(value) {
  const bytes2 = [];
  do {
    const low = value % 128;
    value = Math.floor(value / 128);
    bytes2.push(low | (value ? 128 : 0));
  } while (value);
  return Buffer.from(bytes2);
}
function bytesField(field22, bytes2) {
  return Buffer.concat([varint(field22 * 8 + 2), varint(bytes2.length), bytes2]);
}
function encodeRequestId(id) {
  return bytesField(1, Buffer.from(id));
}
function encodeAppend(id, sequence, payload) {
  return Buffer.concat([
    bytesField(2, encodeRequestId(id)),
    ...sequence ? [Buffer.concat([Buffer.from([24]), varint(sequence)])] : [],
    bytesField(4, payload)
  ]);
}
var SplitChannel = class {
  ready;
  #resolveReady;
  #rejectReady;
  #readySettled = false;
  #response;
  #origin;
  #id = randomUUID2();
  #headers;
  #agent;
  #request;
  #trace;
  #signal;
  #onAbort;
  #closed = false;
  #failure;
  #requests = /* @__PURE__ */ new Set();
  #timers = /* @__PURE__ */ new Set();
  #nextSequence = 0;
  #acknowledgedThrough = 0;
  #acknowledged = /* @__PURE__ */ new Set();
  #pending = /* @__PURE__ */ new Set();
  #waiters = /* @__PURE__ */ new Set();
  #admission = Promise.resolve();
  #writes = 0;
  #bytes = 0;
  constructor(options) {
    this.#origin = validateTransport(options);
    this.#trace = options.trace;
    this.#signal = options.signal;
    const secure = this.#origin.startsWith("https:");
    this.#request = secure ? httpsRequest : httpRequest;
    this.#agent = secure ? new HttpsAgent({ keepAlive: true, maxSockets: SPLIT_LIMITS.parallel + 1 }) : new HttpAgent({ keepAlive: true, maxSockets: SPLIT_LIMITS.parallel + 1 });
    this.#headers = {
      ...protocolHeaders(options),
      "x-request-id": this.#id,
      "x-cursor-streaming": "true",
      "connect-protocol-version": "1"
    };
    this.ready = new Promise((resolve, reject) => {
      this.#resolveReady = resolve;
      this.#rejectReady = reject;
    });
    void this.ready.catch(() => {
    });
    this.#onAbort = () => this.close(new CursorProtocolError("ABORTED", "Cursor Run was aborted"));
    this.#signal?.addEventListener("abort", this.#onAbort, { once: true });
    if (this.#signal?.aborted) {
      this.#onAbort();
      return;
    }
    this.#open();
  }
  #timer(action, ms) {
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      action();
    }, ms);
    timer.unref();
    this.#timers.add(timer);
    return timer;
  }
  #clear(timer) {
    clearTimeout(timer);
    this.#timers.delete(timer);
  }
  #settleReady(error) {
    if (this.#readySettled) return;
    this.#readySettled = true;
    if (error) this.#rejectReady(error);
    else this.#resolveReady();
  }
  #track(request2) {
    this.#requests.add(request2);
    request2.once("close", () => this.#requests.delete(request2));
  }
  #open() {
    const body = frameMessage(encodeRequestId(this.#id));
    const req = this.#request(new URL(RUN_STREAM_PATH, this.#origin), {
      method: "POST",
      agent: this.#agent,
      headers: {
        ...this.#headers,
        "content-type": "application/connect+proto",
        "connect-accept-encoding": "gzip",
        "content-length": String(body.length)
      }
    }, (response) => {
      this.#clear(timer);
      this.#response = response;
      response.on("error", () => this.close(new CursorProtocolError("TRANSPORT", "Cursor split response failed")));
      if (this.#closed) {
        response.destroy();
        return;
      }
      if (response.statusCode !== 200) {
        this.close(httpError(response.statusCode ?? 0));
        return;
      }
      if (!["application/connect+proto", "text/event-stream"].includes(String(response.headers["content-type"]).split(";")[0])) {
        this.close(new CursorProtocolError("INVALID_RESPONSE", "Unexpected Cursor split response content type"));
        return;
      }
      this.#settleReady();
    });
    this.#track(req);
    const timer = this.#timer(() => this.close(new CursorProtocolError("TIMEOUT", "Cursor split response header timeout")), LIMITS.handshakeMs);
    req.on("error", () => this.close(new CursorProtocolError("TRANSPORT", "Cursor split response could not be opened")));
    req.once("close", () => {
      this.#clear(timer);
      if (!this.#readySettled) this.close(new CursorProtocolError("TRANSPORT", "Cursor split response closed before headers"));
    });
    req.end(body);
  }
  /** KV data can pipeline. Tools/actions await their individual delivery acknowledgement. */
  write(frame2, buffered = false) {
    if (this.#closed) return Promise.reject(this.#failure);
    if (frame2.length < 5 || frame2[0] !== 0 || Buffer.from(frame2).readUInt32BE(1) !== frame2.length - 5) {
      throw new Error("SplitChannel requires one uncompressed Connect message");
    }
    if (frame2.length - 5 > LIMITS.frameBytes || this.#writes >= LIMITS.queuedWrites || this.#bytes + frame2.length > LIMITS.queuedWriteBytes) {
      const error = limitError();
      this.close(error);
      return Promise.reject(error);
    }
    const payload = Buffer.from(frame2.subarray(5));
    this.#writes++;
    this.#bytes += frame2.length;
    let delivered;
    const admitted = this.#admission.then(async () => {
      while (!this.#closed && (this.#pending.size >= SPLIT_LIMITS.parallel || this.#nextSequence - this.#acknowledgedThrough >= SPLIT_LIMITS.sequenceWindow)) {
        await new Promise((resolve) => this.#waiters.add(resolve));
      }
      if (this.#closed) throw this.#failure;
      const sequence = this.#nextSequence++;
      const sent = this.#append(sequence, payload).then(() => {
        this.#acknowledged.add(sequence);
        while (this.#acknowledged.delete(this.#acknowledgedThrough)) this.#acknowledgedThrough++;
      }).catch((error) => {
        const failure3 = this.#failure ?? safeError(error, "Cursor append delivery failed");
        this.close(failure3);
        throw failure3;
      });
      delivered = sent.finally(() => {
        this.#pending.delete(delivered);
        this.#writes--;
        this.#bytes -= frame2.length;
        this.#wake();
      });
      this.#pending.add(delivered);
      void delivered.catch(() => {
      });
    }).catch((error) => {
      if (!delivered) {
        this.#writes--;
        this.#bytes -= frame2.length;
      }
      throw error;
    });
    this.#admission = admitted.catch(() => {
    });
    return buffered ? admitted : admitted.then(() => delivered);
  }
  async #append(sequence, payload) {
    const raw = encodeAppend(this.#id, sequence, payload);
    const compressed = raw.length >= 1024;
    const body = compressed ? await compress2(raw) : raw;
    if (this.#closed) throw this.#failure;
    const timeoutMs = 6e4 + Math.ceil(raw.length / 131072 * 1e3);
    const started = Date.now();
    await new Promise((resolve, reject) => {
      const req = this.#request(new URL(APPEND_PATH, this.#origin), {
        method: "POST",
        agent: this.#agent,
        headers: {
          ...this.#headers,
          "content-type": "application/proto",
          "content-length": String(body.length),
          "connect-timeout-ms": String(timeoutMs),
          ...compressed ? { "content-encoding": "gzip" } : {}
        }
      }, (response) => {
        const chunks = [];
        let length = 0;
        response.on("data", (chunk) => {
          length += chunk.length;
          if (length > SPLIT_LIMITS.replyBytes) {
            this.close(limitError());
            return;
          }
          chunks.push(chunk);
        });
        response.on("error", () => reject(this.#failure ?? new CursorProtocolError("TRANSPORT", "Cursor append response failed")));
        response.on("end", () => {
          this.#clear(timer);
          if (this.#closed) {
            reject(this.#failure);
            return;
          }
          if (response.statusCode !== 200) {
            let error = httpError(response.statusCode ?? 0);
            try {
              const detail2 = JSON.parse(Buffer.concat(chunks).toString("utf8"));
              if (typeof detail2.code === "string") error = statusError(detail2.code, detail2.message);
            } catch {
            }
            reject(error);
            return;
          }
          if (String(response.headers["content-type"]).split(";")[0] !== "application/proto" || length !== 0) {
            reject(new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor append acknowledgement"));
            return;
          }
          this.#trace?.("upload", { bytes: payload.length, wireBytes: body.length, elapsedMs: Date.now() - started });
          resolve();
        });
      });
      this.#track(req);
      const timer = this.#timer(() => {
        const error = new CursorProtocolError("TIMEOUT", "Cursor append delivery timeout");
        this.close(error);
        reject(error);
      }, timeoutMs);
      req.on("error", () => reject(this.#failure ?? new CursorProtocolError("TRANSPORT", "Cursor append request failed")));
      req.once("close", () => {
        this.#clear(timer);
        reject(this.#failure ?? new CursorProtocolError("TRANSPORT", "Cursor append closed before acknowledgement"));
      });
      req.end(body);
    });
  }
  async *frames() {
    const decoder = new FrameDecoder();
    let ended = false;
    try {
      await this.ready;
      for await (const chunk of this.#response) {
        if (this.#failure) throw this.#failure;
        for (const frame2 of decoder.push(chunk)) {
          if (ended) throw new CursorProtocolError("INVALID_RESPONSE", "Cursor sent data after end-stream");
          if (frame2.flags & 1) {
            if (this.#response.headers["connect-content-encoding"] !== "gzip") throw new CursorProtocolError("INVALID_RESPONSE", "Unsupported Cursor frame compression");
            try {
              frame2.payload = gunzipSync2(frame2.payload, { maxOutputLength: LIMITS.inflatedBytes });
            } catch {
              throw limitError();
            }
          }
          if (frame2.flags & 2) {
            terminalError(frame2.payload);
            ended = true;
          }
          yield frame2;
        }
      }
      decoder.finish();
      if (this.#failure) throw this.#failure;
    } catch (error) {
      throw this.#failure ?? safeError(error, "Cursor split response failed");
    }
  }
  async flush() {
    await this.#admission;
    await Promise.all(this.#pending);
    if (this.#failure) throw this.#failure;
  }
  #wake() {
    for (const wake of this.#waiters) wake();
    this.#waiters.clear();
  }
  close(error = new CursorProtocolError("CLOSED", "Cursor Run is closed")) {
    if (this.#closed) return;
    this.#closed = true;
    this.#failure = error;
    this.#signal?.removeEventListener("abort", this.#onAbort);
    this.#settleReady(error);
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers.clear();
    this.#wake();
    for (const req of this.#requests) req.destroy();
    this.#response?.destroy();
    this.#agent.destroy();
  }
};
function tokenCounters(counters) {
  const usage2 = {};
  for (const name of ["inputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens", "reasoningTokens"]) {
    const value = counters[name];
    if (value === void 0) continue;
    if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor token count");
    usage2[name] = Number(value);
  }
  if (usage2.inputTokens !== void 0) {
    usage2.inputTokens = Math.max(0, usage2.inputTokens - (usage2.cacheReadTokens ?? 0) - (usage2.cacheWriteTokens ?? 0));
  }
  return usage2;
}
var CursorConnection = class {
  events = new RunEvents();
  #lifetime = new AbortController();
  #channel;
  #blobs;
  #definitions;
  #names;
  #cwd;
  #instructions;
  #pending = /* @__PURE__ */ new Map();
  #pendingBytes = 0;
  #seen = /* @__PURE__ */ new Set();
  #closed = false;
  #failure;
  #heartbeat;
  #execHeartbeat;
  #idle;
  #pump = Promise.resolve();
  #signal;
  #onAbort;
  #usage = { inputTokens: 0, outputTokens: 0 };
  #haveUsage = false;
  #trace;
  #kvGets = 0;
  #firstText = false;
  #firstThinking = false;
  #ended;
  #terminalCheckpoint = false;
  #save;
  #persistence = Promise.resolve();
  #recoveryBarrier = false;
  #stepOutput = [];
  #outputBytes = 0;
  /** Exact host request whose uncommitted output this Run may recover. */
  requestKey = "";
  constructor(request2, options, blobs, definitions) {
    this.#blobs = blobs;
    const conversation2 = request2.conversation;
    const context = conversation2?.contextTokens ?? conversation2?.state?.tokenDetails?.usedTokens;
    if (context !== void 0 && context > 0) this.#usage.contextTokens = context;
    this.#definitions = definitions;
    this.#names = new Set(request2.tools.map((tool) => tool.name));
    this.#cwd = request2.cwd;
    this.#instructions = request2.messages.filter((message2) => message2.role === "system" || message2.role === "developer").map((message2) => message2.content.filter((item) => item.type === "text").map((item) => item.text).join("\n")).filter(Boolean).join("\n\n");
    this.#signal = options.signal;
    this.#trace = options.trace;
    this.#save = request2.onCheckpoint;
    this.#onAbort = () => this.#fail(new CursorProtocolError("ABORTED", "Cursor Run was aborted"));
    const transport = { ...options, signal: this.#lifetime.signal };
    this.#channel = options.runTransport === "split" ? new SplitChannel(transport) : new H2Channel(RUN_PATH, transport, true);
    this.#signal?.addEventListener("abort", this.#onAbort, { once: true });
    if (this.#signal?.aborted) this.#onAbort();
  }
  /** Shared conversation whose checkpoint this Run advances, when one is supplied. */
  conversation;
  /** Anchor of the host history this Run started from. */
  anchor = "";
  /** Text of the current model step, reset when the host answers its tools. */
  #stepText = [];
  /** Whether the latest checkpoint arrived after the latest model output. */
  #checkpointCurrent = false;
  /** Injections Cursor has not yet taken into the turn. */
  #injections = /* @__PURE__ */ new Map();
  /** Identifies this Run to context injections. */
  runId = randomUUID3();
  #persist() {
    if (!this.conversation || !this.#save) return this.#persistence;
    const save = this.#save, conversation2 = this.conversation;
    this.#persistence = this.#persistence.then(() => save(conversation2));
    void this.#persistence.catch(() => {
    });
    return this.#persistence;
  }
  #rememberOutput(type, text) {
    this.#outputBytes += Buffer.byteLength(text);
    if (this.#outputBytes > LIMITS.eventBytes) {
      this.#recoveryBarrier = true;
      if (this.conversation) this.conversation.recovery = void 0;
      this.#stepOutput = [];
      return;
    }
    const last = this.#stepOutput.at(-1);
    if (last?.type === type) last.text += text;
    else this.#stepOutput.push({ type, text });
  }
  replayOutput(output) {
    for (const event of output) {
      this.#rememberOutput(event.type, event.text);
      if (event.type === "text") this.#stepText.push(event.text);
      this.events.push({ ...event });
    }
  }
  async start(request2) {
    Object.assign(request2, { runId: this.runId, emitModelCallUsage: true });
    this.#pump = this.#read().catch((error) => {
      if (!this.#closed) this.#fail(safeError(error, "Invalid Cursor Run response"));
    });
    try {
      await this.#write(create(AgentClientMessageSchema, { message: { case: "runRequest", value: request2 } }));
      this.#trace?.("opening-sent");
      await this.#channel.ready;
      this.#trace?.("headers");
      if (this.#failure) throw this.#failure;
      if (!this.#closed) {
        this.#heartbeat = setInterval(() => {
          void this.#write(create(AgentClientMessageSchema, { message: { case: "clientHeartbeat", value: create(ClientHeartbeatSchema) } })).catch((error) => this.#fail(safeError(error)));
        }, LIMITS.heartbeatMs);
        this.#heartbeat.unref();
        this.#execHeartbeat = setInterval(() => {
          for (const { exec: exec2 } of this.#pending.values()) {
            void this.#write(create(AgentClientMessageSchema, {
              message: { case: "execClientControlMessage", value: create(ExecClientControlMessageSchema, {
                message: { case: "heartbeat", value: create(ExecClientHeartbeatSchema, { id: exec2.id }) }
              }) }
            })).catch((error) => this.#fail(safeError(error)));
          }
        }, 3e3);
        this.#execHeartbeat.unref();
        this.#armIdle();
      }
    } catch (error) {
      const failure3 = this.#failure ?? safeError(error);
      this.#fail(failure3);
      throw failure3;
    }
  }
  async #write(message2) {
    if (this.#closed) throw this.#failure ?? new CursorProtocolError("CLOSED", "Cursor Run is closed");
    const written = this.#channel.write(frameMessage(toBinary(WireAgentClientMessageSchema, message2)), message2.message.case === "kvClientMessage");
    if (message2.message.case === "execClientMessage") {
      const closed = this.#channel.write(frameMessage(toBinary(WireAgentClientMessageSchema, create(AgentClientMessageSchema, {
        message: { case: "execClientControlMessage", value: create(ExecClientControlMessageSchema, {
          message: { case: "streamClose", value: create(ExecClientStreamCloseSchema, { id: message2.message.value.id }) }
        }) }
      }))));
      await Promise.all([written, closed]);
    } else await written;
  }
  #armIdle() {
    if (this.#ended) return;
    clearTimeout(this.#idle);
    this.#idle = void 0;
    if (this.#closed || this.#ended || this.#pending.size) return;
    this.#idle = setTimeout(() => this.#fail(new CursorProtocolError("TIMEOUT", "Cursor Run response timeout")), LIMITS.idleMs);
    this.#idle.unref();
  }
  #dispose() {
    if (this.#closed) return;
    this.#closed = true;
    clearInterval(this.#heartbeat);
    clearInterval(this.#execHeartbeat);
    clearTimeout(this.#idle);
    this.#heartbeat = void 0;
    this.#execHeartbeat = void 0;
    this.#idle = void 0;
    this.#signal?.removeEventListener("abort", this.#onAbort);
    this.#pending.clear();
    this.#pendingBytes = 0;
    this.#seen.clear();
    if (!this.conversation) this.#blobs.clear();
    this.#definitions = [];
    this.#lifetime.abort();
    this.#channel.close();
  }
  #fail(error) {
    if (this.#closed) return;
    this.#failure = error;
    if (error.code === "ABORTED" || error.code === "CLOSED") {
      if (this.conversation) this.conversation.recovery = void 0;
      void this.#persist();
    }
    this.events.finish(error);
    this.#dispose();
  }
  async #read() {
    try {
      for await (const frame2 of this.#channel.frames()) {
        if (this.#closed) return;
        if ((frame2.flags & 2) !== 0) break;
        let message2;
        try {
          message2 = fromBinary(WireAgentServerMessageSchema, frame2.payload);
        } catch {
          throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor protobuf response");
        }
        this.#armIdle();
        await this.#handle(message2);
        if (this.#closed) return;
      }
    } catch (error) {
      if (!this.#ended || !this.#terminalCheckpoint || !(error instanceof CursorProtocolError) || !["TRANSPORT", "TIMEOUT"].includes(error.code)) throw error;
    }
    if (this.#closed) return;
    if (!this.#ended) throw new CursorProtocolError("TRANSPORT", "Cursor stream ended before turnEnded");
    await this.#completeTurn();
  }
  async #completeTurn() {
    if (!this.#ended) throw new Error("Cannot complete an unterminated Cursor turn");
    clearInterval(this.#heartbeat);
    clearInterval(this.#execHeartbeat);
    if (!this.#terminalCheckpoint) await this.#channel.flush?.();
    else {
      try {
        await this.#channel.flush?.();
      } catch (error) {
        if (!(error instanceof CursorProtocolError) || !["TRANSPORT", "TIMEOUT", "CLOSED"].includes(error.code)) throw error;
      }
    }
    if (this.conversation) {
      this.conversation.resume = this.#checkpointCurrent ? { anchor: this.anchor, finalText: textKey([{ type: "text", text: this.#stepText.join("") }]) } : void 0;
      this.conversation.recovery = void 0;
      this.conversation.notes.push(...this.#injections.values());
      this.#injections.clear();
      await this.#persist();
    }
    if (this.#haveUsage || this.#usage.contextTokens !== void 0) this.events.push({ type: "usage", usage: { ...this.#usage } });
    this.events.push({ type: "done", reason: "stop" });
    this.events.finish();
    this.#dispose();
  }
  async #handle(message2) {
    switch (message2.message.case) {
      case "kvServerMessage":
        if (message2.message.value.message.case === "getBlobArgs" && ++this.#kvGets % 100 === 1) this.#trace?.("kv-get", { count: this.#kvGets });
        await this.#write(kvResponse(message2.message.value, this.#blobs));
        return;
      case "execServerMessage":
        await this.#exec(message2.message.value);
        return;
      case "interactionQuery":
        await this.#write(rejectInteraction(message2.message.value));
        return;
      case "conversationCheckpointUpdate": {
        if (this.conversation) {
          const state = message2.message.value;
          this.conversation.state = state;
          if ((state.tokenDetails?.usedTokens ?? 0) > 0) this.conversation.contextTokens = state.tokenDetails.usedTokens;
          this.#checkpointCurrent = true;
          if (this.#ended) {
            this.#terminalCheckpoint = true;
            this.conversation.resume = { anchor: this.anchor, finalText: textKey([{ type: "text", text: this.#stepText.join("") }]) };
            this.conversation.recovery = void 0;
          } else if (!this.#recoveryBarrier && this.#pending.size === 0) {
            const checkpointHash = createHash4("sha256").update(toBinary(ConversationStateStructureSchema, state)).digest("hex");
            const previous = this.conversation.recovery;
            this.conversation.recovery = {
              requestKey: this.requestKey,
              checkpointHash,
              attempts: previous?.checkpointHash === checkpointHash ? previous.attempts : 0,
              output: this.#stepOutput.map((event) => ({ ...event }))
            };
          } else this.conversation.recovery = void 0;
          await this.#persist();
        }
        const used = message2.message.value.tokenDetails?.usedTokens;
        if (used !== void 0 && used > 0) {
          this.#usage.contextTokens = used;
          this.events.push({ type: "usage", usage: { ...this.#usage } });
        }
        return;
      }
      case "interactionUpdate":
        await this.#interaction(message2.message.value);
        return;
      case "execServerControlMessage": {
        if (message2.message.value.message.case !== "abort") throw new CursorProtocolError("UNSUPPORTED_CONTROL", "Unsupported Cursor execution control request");
        const id = message2.message.value.message.value.id;
        if ([...this.#pending.values()].some((pending) => pending.exec.id === id)) throw new CursorProtocolError("ABORTED", "Cursor canceled an outstanding tool request");
        return;
      }
      default:
        throw new CursorProtocolError("UNSUPPORTED_CONTROL", "Unsupported Cursor server message");
    }
  }
  async #exec(exec2) {
    switch (exec2.message.case) {
      case "requestContextArgs":
        this.#trace?.("request-context", { kvGets: this.#kvGets });
        await this.#write(contextResponse(exec2, this.#definitions, this.#cwd, this.#instructions));
        return;
      case "mcpStateExecArgs":
        await this.#write(mcpStateResponse(exec2, this.#definitions));
        return;
      case "mcpAllowlistPrecheckArgs":
        await this.#write(execResponse(exec2, { case: "mcpAllowlistPrecheckResult", value: create(McpAllowlistPrecheckResultSchema, { allowlisted: false }) }));
        return;
      case "shellAllowlistPrecheckArgs":
        await this.#write(execResponse(exec2, { case: "shellAllowlistPrecheckResult", value: create(ShellAllowlistPrecheckResultSchema, { allowlisted: false }) }));
        return;
      case "webFetchAllowlistPrecheckArgs":
        await this.#write(execResponse(exec2, { case: "webFetchAllowlistPrecheckResult", value: create(WebFetchAllowlistPrecheckResultSchema, { allowlisted: false }) }));
        return;
      case "mcpArgs": {
        if (this.#ended) throw new CursorProtocolError("INVALID_RESPONSE", "Cursor requested a tool after turnEnded");
        const args = exec2.message.value;
        const name = advertisedName(args, this.#names);
        if (args.smartModeApprovalOnly) {
          await this.#write(execResponse(exec2, { case: "mcpResult", value: create(McpResultSchema, {
            result: name ? { case: "approved", value: create(McpApprovedSchema) } : { case: "rejected", value: create(McpRejectedSchema, { reason: "The requested tool is not advertised by DeepSeek Harness." }) }
          }) }));
          return;
        }
        if (!name) {
          await this.#write(execResponse(exec2, { case: "mcpResult", value: create(McpResultSchema, {
            result: { case: "toolNotFound", value: create(McpToolNotFoundSchema, { availableTools: [...this.#names] }) }
          }) }));
          return;
        }
        const identity = createHash4("sha256").update(JSON.stringify([exec2.id, exec2.execId])).digest("hex");
        if (this.#seen.has(identity)) throw new CursorProtocolError("INVALID_RESPONSE", "Cursor repeated an MCP execution envelope");
        const bytes2 = toBinary(ExecServerMessageSchema, exec2).byteLength;
        if (this.#pending.size >= LIMITS.pendingCalls || this.#seen.size >= LIMITS.seenCalls || this.#pendingBytes + bytes2 > LIMITS.pendingBytes) throw limitError();
        const argumentsJSON = decodeArguments(args.args);
        const callKey = randomUUID3();
        this.#seen.add(identity);
        this.#pending.set(callKey, { exec: exec2, bytes: bytes2 });
        this.#pendingBytes += bytes2;
        this.#armIdle();
        this.#checkpointCurrent = false;
        this.#recoveryBarrier = true;
        if (this.conversation) this.conversation.recovery = void 0;
        await this.#persist();
        this.events.push({ type: "tool", callKey, name, arguments: argumentsJSON });
        return;
      }
      default:
        await this.#write(rejectNative(exec2));
    }
  }
  async #interaction(update) {
    if (this.#ended && ["textDelta", "thinkingDelta", "toolRequestsListed"].includes(update.message.case ?? "")) {
      throw new CursorProtocolError("INVALID_RESPONSE", "Cursor emitted model output after turnEnded");
    }
    switch (update.message.case) {
      case "textDelta":
        this.#checkpointCurrent = false;
        this.#rememberOutput("text", update.message.value.text);
        this.#stepText.push(update.message.value.text);
        if (!this.#firstText) {
          this.#firstText = true;
          this.#trace?.("first-text", { kvGets: this.#kvGets });
        }
        this.events.push({ type: "text", text: update.message.value.text });
        return;
      case "thinkingDelta":
        this.#checkpointCurrent = false;
        this.#rememberOutput("reasoning", update.message.value.text);
        if (!this.#firstThinking) {
          this.#firstThinking = true;
          this.#trace?.("first-thinking", { kvGets: this.#kvGets });
        }
        this.events.push({ type: "reasoning", text: update.message.value.text });
        return;
      case "tokenDelta": {
        const total = this.#usage.outputTokens + update.message.value.tokens;
        if (update.message.value.tokens < 0 || !Number.isSafeInteger(total)) throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor token count");
        this.#usage.outputTokens = total;
        this.#haveUsage = true;
        return;
      }
      case "contextInjectionState": {
        const state = update.message.value.state?.state;
        if (state?.case === "delivered") this.#injections.delete(update.message.value.injectionId);
        this.#trace?.("injection", { state: state?.case ?? "unknown", ...state?.value?.reason ? { reason: state.value.reason } : {} });
        return;
      }
      case "toolRequestsListed":
        this.events.push({ type: "tools-listed", count: update.message.value.callCount });
        return;
      case "modelCallCompleted": {
        const counters = tokenCounters(update.message.value);
        if (counters.inputTokens !== void 0 || counters.outputTokens !== void 0) {
          this.events.push({ type: "call-usage", usage: { inputTokens: 0, outputTokens: 0, ...counters } });
        }
        return;
      }
      case "turnEnded":
        if (this.#ended || this.#pending.size) throw new CursorProtocolError("INVALID_RESPONSE", "Invalid Cursor terminal turn state");
        this.#ended = update.message.value;
        this.#applyFinalUsage(update.message.value);
        this.#trace?.("turn-usage", { ...this.#usage });
        if (this.conversation) this.conversation.recovery = void 0;
        clearTimeout(this.#idle);
        this.#idle = setTimeout(() => this.#channel.close(new CursorProtocolError("TIMEOUT", "Cursor terminal checkpoint drain timed out")), LIMITS.terminalDrainMs);
        this.#idle.unref();
        await this.#persist();
        return;
      // These are display/status updates, never authority to execute a tool.
      default:
        return;
    }
  }
  #applyFinalUsage(ended) {
    const counters = tokenCounters(ended);
    if (Object.keys(counters).length) this.#haveUsage = true;
    Object.assign(this.#usage, counters);
  }
  async reply(callKey, result2) {
    if (this.#closed) throw this.#failure ?? new CursorProtocolError("CLOSED", "Cursor Run is closed");
    const pending = this.#pending.get(callKey);
    if (!pending) throw new CursorProtocolError("INVALID_CALL_KEY", "Unknown or already answered Cursor tool call");
    this.#stepText = [];
    const response = execResponse(pending.exec, { case: "mcpResult", value: create(McpResultSchema, {
      result: { case: "success", value: mcpContent(result2) }
    }) });
    this.#pending.delete(callKey);
    this.#pendingBytes -= pending.bytes;
    this.#armIdle();
    try {
      await this.#write(response);
    } catch (error) {
      const failure3 = this.#failure ?? safeError(error);
      this.#fail(failure3);
      throw failure3;
    }
  }
  async inject(content) {
    if (this.#closed) throw this.#failure ?? new CursorProtocolError("CLOSED", "Cursor Run is closed");
    const injectionId = randomUUID3();
    this.#recoveryBarrier = true;
    if (this.conversation) this.conversation.recovery = void 0;
    await this.#persist();
    this.#injections.set(injectionId, content);
    const message2 = {
      $typeName: "agent.v1.AgentClientMessage",
      message: { case: "conversationAction", value: { $typeName: "agent.v1.ConversationAction", action: { case: "injectContextAction", value: {
        $typeName: "agent.v1.InjectContextAction",
        injectionId,
        expectedRunId: this.runId,
        userContext: { $typeName: "agent.v1.UserContextInjection", userMessage: userMessage([{ role: "user", content }], this.#blobs, `inject:${injectionId}`) }
      } } } }
    };
    this.#trace?.("inject", { parts: content.length });
    this.#checkpointCurrent = false;
    try {
      await this.#write(message2);
    } catch (error) {
      const failure3 = this.#failure ?? safeError(error);
      this.#fail(failure3);
      throw failure3;
    }
  }
  async cancel(_reason) {
    this.#fail(new CursorProtocolError("ABORTED", "Cursor Run was aborted"));
    await this.#pump;
    await this.#persistence;
  }
  async close() {
    this.#fail(new CursorProtocolError("CLOSED", "Cursor Run was closed"));
    await this.#pump;
    await this.#persistence;
  }
};
var textKey = (content) => content.filter((item) => item.type === "text").map((item) => item.text).join("").replace(/\s+/gu, "").slice(0, 4096);
function anchorOf(messages) {
  const first2 = messages.find((message2) => message2.role !== "system" && message2.role !== "developer");
  return first2 ? messagesDigest([first2]) : "";
}
function resumePlan(conversation2, messages) {
  const rebuild = (reason) => ({ active: -1, reason });
  if (!conversation2) return rebuild("ephemeral");
  if (!conversation2.state) return rebuild("no-checkpoint");
  const resume = conversation2.resume;
  if (!resume) return rebuild("unfinished-turn");
  const active = activeUserIndex(messages);
  if (active < 0) return rebuild("tool-result-tail");
  let last = active - 1;
  while (last >= 0 && messages[last].role !== "assistant") last--;
  if (last < 0) return rebuild("missing-assistant");
  if (messages[last].sourceProvider && messages[last].sourceProvider !== "cursor") return rebuild("foreign-provider");
  if (textKey(messages[last].content) !== resume.finalText) return rebuild("assistant-changed");
  if (anchorOf(messages) !== resume.anchor) return rebuild("history-rewritten");
  return { active, reason: "terminal-checkpoint" };
}
function resetCursorConversation(value) {
  const conversation2 = value;
  Object.assign(conversation2, { blobs: new BlobStore(), state: void 0, contextTokens: void 0, hostHistory: void 0, resume: void 0, recovery: void 0, notes: [] });
}
function createCursorConversation() {
  const store = { kind: "cursor-conversation", id: randomUUID3(), blobEncryptionKey: randomBytes(32).toString("hex"), blobs: new BlobStore(), notes: [] };
  return store;
}
async function openCursorRun(request2, options) {
  validateTransport(options);
  const conversation2 = request2.conversation;
  const definitions = toolDefinitions(request2.tools);
  const requestKey = createHash4("sha256").update(JSON.stringify([messagesDigest(request2.messages), request2.selection, request2.tools, request2.cwd ?? null])).digest("hex");
  const recovery = conversation2?.state && conversation2.recovery?.requestKey === requestKey ? conversation2.recovery : void 0;
  if (recovery && recovery.attempts >= 2) throw new CursorProtocolError("CURSOR_RECOVERY_STALLED", "Cursor checkpoint recovery made no progress");
  const { active, reason } = recovery ? { active: -1, reason: "interrupted-checkpoint" } : resumePlan(conversation2, request2.messages);
  const blobs = new BlobStore();
  let built;
  if (conversation2 && recovery) {
    recovery.attempts++;
    built = buildResumeRequest({ ...request2, conversationId: conversation2.id }, conversation2.blobs, conversation2.state, -1);
  } else if (conversation2 && active >= 0) {
    const notes = conversation2.notes.splice(0);
    const messages = notes.length ? [...request2.messages.slice(0, active), ...notes.map((content) => ({ role: "user", content })), ...request2.messages.slice(active)] : request2.messages;
    built = buildResumeRequest({ ...request2, messages, conversationId: conversation2.id }, conversation2.blobs, conversation2.state, active);
  } else {
    if (conversation2 && (conversation2.state || conversation2.blobs.bytes > LIMITS.conversationBytes)) {
      resetCursorConversation(conversation2);
    }
    built = buildRunRequest(conversation2 ? { ...request2, conversationId: conversation2.id } : request2, conversation2?.blobs ?? blobs);
  }
  const store = conversation2?.blobs ?? blobs;
  const historyBytes = built.conversationState.rootPromptMessagesJson.reduce((total, id) => total + (store.get(id)?.byteLength ?? 0), 0);
  const transport = options.runTransport && options.runTransport !== "auto" ? options.runTransport : historyBytes >= 4 * 1024 * 1024 ? "split" : "http2";
  const blobEncryptionKey = conversation2?.blobEncryptionKey ?? randomBytes(32).toString("hex");
  const headers2 = Object.fromEntries(Object.entries(options.headers ?? {}).filter(([name]) => name.toLowerCase() !== "x-blob-encryption-key"));
  options = {
    ...options,
    headers: { ...headers2, "x-blob-encryption-key": blobEncryptionKey },
    runTransport: transport,
    endpoint: transport === "split" ? options.endpoint ?? DEFAULT_ENDPOINT : await cursorRunEndpoint(options)
  };
  options.trace?.(recovery ? "recover-checkpoint" : active >= 0 ? "resume-checkpoint" : "rebuild-history", { messages: request2.messages.length, reason, transport, historyBytes });
  if (conversation2) {
    conversation2.resume = void 0;
    if (!recovery) conversation2.recovery = void 0;
    await request2.onCheckpoint?.(conversation2);
  }
  if (options.signal?.aborted) throw new CursorProtocolError("ABORTED", "Cursor Run was aborted");
  const connection = new CursorConnection(request2, options, conversation2?.blobs ?? blobs, definitions);
  connection.conversation = conversation2;
  connection.anchor = anchorOf(request2.messages);
  connection.requestKey = requestKey;
  if (recovery) connection.replayOutput(recovery.output);
  await connection.start(built);
  return connection;
}
var compress3 = promisify3(gzip3);
var decompress = promisify3(gunzip);
var blobHashes = /* @__PURE__ */ new WeakMap();
function blobHash(data) {
  let hash2 = blobHashes.get(data);
  if (!hash2) {
    hash2 = createHash5("sha256").update(data).digest("hex");
    blobHashes.set(data, hash2);
  }
  return hash2;
}
function packHash(entries) {
  return createHash5("sha256").update(JSON.stringify(entries.map(([id, data]) => [Buffer.from(id).toString("base64"), blobHash(data)]))).digest("hex");
}
function blobPacks(entries) {
  const packs = [];
  let pack = [], bytes2 = 0;
  for (const entry of entries) {
    if (entry[1].byteLength >= 64 * 1024) {
      if (pack.length) {
        packs.push(pack);
        pack = [];
        bytes2 = 0;
      }
      packs.push([entry]);
      continue;
    }
    if (pack.length && (pack.length >= 64 || bytes2 + entry[1].byteLength > 1024 * 1024)) {
      packs.push(pack);
      pack = [];
      bytes2 = 0;
    }
    pack.push(entry);
    bytes2 += entry[1].byteLength;
  }
  if (pack.length) packs.push(pack);
  return packs;
}
async function snapshotCursorConversation(value, external) {
  const store = value;
  if (!/^[0-9a-f]{64}$/u.test(store.blobEncryptionKey)) throw new Error("Invalid Cursor blob cache key");
  const snapshot = {
    version: external ? 4 : 2,
    id: store.id,
    blobEncryptionKey: store.blobEncryptionKey,
    resume: store.resume,
    recovery: store.recovery,
    contextTokens: store.contextTokens,
    hostHistory: store.hostHistory,
    notes: store.notes.map((content) => content.map((item) => item.type === "image" ? { ...item, data: Uint8Array.from(item.data) } : item)),
    state: store.state ? toBinary(ConversationStateStructureSchema, store.state) : void 0,
    blobs: store.blobs.entries()
  };
  let references;
  if (external) {
    references = [];
    for (const pack of blobPacks(snapshot.blobs)) {
      const hash2 = packHash(pack);
      if (!external.has(hash2)) {
        const json2 = JSON.stringify(pack.map(([id, data]) => [Buffer.from(id).toString("base64"), Buffer.from(data).toString("base64")]));
        await external.put(hash2, (await compress3(json2)).toString("base64"));
      }
      references.push(hash2);
    }
  }
  const json = JSON.stringify({ ...snapshot, ...references ? { blobs: references } : {} }, (_key, item) => item instanceof Uint8Array ? { cursorBytes: Buffer.from(item).toString("base64") } : item);
  return (await compress3(json)).toString("base64");
}
async function restoreCursorConversation(snapshot, external) {
  const bytes2 = await decompress(Buffer.from(snapshot, "base64"), { maxOutputLength: LIMITS.blobBytes * 2 });
  const value = JSON.parse(bytes2.toString("utf8"), (_key, item) => item && typeof item === "object" && typeof item.cursorBytes === "string" && Object.keys(item).length === 1 ? new Uint8Array(Buffer.from(item.cursorBytes, "base64")) : item);
  if (![1, 2, 3, 4].includes(value.version) || typeof value.id !== "string" || !value.id || value.resume !== void 0 && (typeof value.resume.anchor !== "string" || typeof value.resume.finalText !== "string") || value.state !== void 0 && !(value.state instanceof Uint8Array) || value.version === 1 && (!value.resume || !value.state) || value.version >= 2 && (typeof value.blobEncryptionKey !== "string" || !/^[0-9a-f]{64}$/u.test(value.blobEncryptionKey)) || value.contextTokens !== void 0 && (!Number.isSafeInteger(value.contextTokens) || value.contextTokens <= 0) || value.hostHistory !== void 0 && (!Number.isSafeInteger(value.hostHistory.count) || value.hostHistory.count < 0 || typeof value.hostHistory.digest !== "string") || !Array.isArray(value.blobs) || !Array.isArray(value.notes)) {
    throw new Error("Invalid Cursor conversation snapshot");
  }
  if (value.recovery !== void 0) {
    const recovery = value.recovery;
    if (!value.state || value.resume || typeof recovery.requestKey !== "string" || typeof recovery.checkpointHash !== "string" || !Number.isSafeInteger(recovery.attempts) || recovery.attempts < 0 || !Array.isArray(recovery.output) || recovery.output.some((event) => !event || !["text", "reasoning"].includes(String(event.type)) || typeof event.text !== "string")) {
      throw new Error("Invalid Cursor recovery checkpoint");
    }
  }
  const blobs = new BlobStore();
  if (value.version === 4) {
    for (const hash2 of value.blobs) {
      if (typeof hash2 !== "string" || !/^[0-9a-f]{64}$/u.test(hash2)) throw new Error("Invalid Cursor blob pack reference");
      const encoded = external?.get(hash2);
      if (encoded === void 0) throw new Error("Cursor snapshot blob pack is missing");
      const packed = JSON.parse((await decompress(Buffer.from(encoded, "base64"), { maxOutputLength: LIMITS.blobBytes * 2 })).toString("utf8"));
      if (!Array.isArray(packed) || packed.length > 64 || packed.some((entry) => !Array.isArray(entry) || entry.length !== 2 || entry.some((part) => typeof part !== "string"))) throw new Error("Invalid Cursor blob pack");
      const entries = packed.map(([id, data]) => [new Uint8Array(Buffer.from(id, "base64")), new Uint8Array(Buffer.from(data, "base64"))]);
      if (packHash(entries) !== hash2) throw new Error("Cursor blob pack checksum mismatch");
      for (const [id, data] of entries) blobs.set(id, data);
    }
  } else {
    for (const [id, payload] of value.blobs) {
      if (!(id instanceof Uint8Array)) throw new Error("Invalid Cursor snapshot blob id");
      let data = payload;
      if (value.version === 3) {
        if (typeof payload !== "string" || !/^[0-9a-f]{64}$/u.test(payload)) throw new Error("Invalid Cursor snapshot blob reference");
        const encoded = external?.get(payload);
        if (encoded === void 0) throw new Error("Cursor snapshot blob is missing");
        data = new Uint8Array(await decompress(Buffer.from(encoded, "base64"), { maxOutputLength: LIMITS.blobBytes }));
        if (blobHash(data) !== payload) throw new Error("Cursor snapshot blob checksum mismatch");
      }
      if (!(data instanceof Uint8Array)) throw new Error("Invalid Cursor snapshot blob");
      blobs.set(id, data);
    }
  }
  const store = {
    kind: "cursor-conversation",
    id: value.id,
    blobEncryptionKey: value.blobEncryptionKey ?? randomBytes2(32).toString("hex"),
    resume: value.resume,
    recovery: value.recovery,
    contextTokens: value.contextTokens,
    hostHistory: value.hostHistory,
    notes: value.notes,
    blobs,
    state: value.state ? fromBinary(ConversationStateStructureSchema, value.state) : void 0
  };
  return store;
}

// src/projection.js
import { createHash as createHash6 } from "node:crypto";
var INTERRUPTED = "Tool use was interrupted and did not produce a result.";
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object" && !(value instanceof Uint8Array)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}
var sha256 = (data) => createHash6("sha256").update(data).digest("hex");
function requestFingerprint(options) {
  const value = {
    system: options.system,
    messages: (options.messages ?? []).map((message2) => {
      if (message2.role === "assistant") {
        return {
          role: "assistant",
          text: message2.content.filter((block) => block.type === "text").map((block) => block.text).join("").trim(),
          calls: message2.content.filter((block) => block.type === "tool-call").map(({ id, name, arguments: args }) => ({ id: String(id), name, args }))
        };
      }
      return {
        role: message2.role,
        content: message2.content.map((block) => block.type === "image" ? { type: "image", hash: sha256(block.data) } : block),
        ...message2.role === "tool" ? { toolCallId: message2.toolCallId, isError: message2.isError === true } : {}
      };
    })
  };
  return sha256(JSON.stringify(canonical(value)));
}
function wireBlock(block, role) {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "reasoning":
      return { type: "reasoning", text: block.text };
    case "tool-call":
      return role === "assistant" ? { type: "tool-call", id: String(block.id), name: block.name, arguments: block.arguments } : { type: "text", text: JSON.stringify({ type: "tool-call", id: String(block.id), name: block.name, arguments: block.arguments }) };
    case "image":
      if (role !== "user" && role !== "tool") throw new LlmError("Cursor cannot replay image output in this message role.", "UNSUPPORTED_CONTENT");
      return { type: "image", data: block.data, mediaType: block.mediaType, width: block.width, height: block.height };
    default:
      throw new LlmError(`Cursor does not support content block type ${block.type}.`, "UNSUPPORTED_CONTENT");
  }
}
async function projectRequest(options, { signal = options.signal } = {}) {
  signal?.throwIfAborted();
  const names = /* @__PURE__ */ new Map();
  for (const message2 of options.messages ?? []) {
    if (message2.role === "assistant") {
      for (const block of message2.content) if (block.type === "tool-call") names.set(String(block.id), block.name);
    }
  }
  const out = [];
  if (options.system) out.push({ role: "system", content: [{ type: "text", text: options.system }] });
  for (const message2 of options.messages ?? []) {
    const content = message2.content.map((block) => wireBlock(block, message2.role));
    if (message2.role === "tool") {
      out.push({ role: "tool", toolCallId: String(message2.toolCallId), toolName: names.get(String(message2.toolCallId)), isError: message2.isError === true, content });
    } else out.push({ role: message2.role, content });
  }
  return out;
}
async function projectToolResult(message2) {
  if (message2.role !== "tool") throw new LlmError("Cursor continuation requires a tool-role message.", "INVALID_TOOL_RESULT");
  return { content: message2.content.map((block) => wireBlock(block, "tool")), isError: message2.isError === true };
}
function imageSize(data) {
  const b = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (b.length >= 24 && b.readUInt32BE(0) === 2303741511) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 10 && b.toString("ascii", 0, 3) === "GIF") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (b.length >= 30 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const kind = b.toString("ascii", 12, 16);
    if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (kind === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { width: 1 + (bits & 16383), height: 1 + (bits >> 14 & 16383) };
    }
    if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 16383, height: b.readUInt16LE(28) & 16383 };
  }
  if (b.length >= 4 && b[0] === 255 && b[1] === 216) {
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 255) {
        i++;
        continue;
      }
      const marker = b[i + 1];
      if (marker >= 192 && marker <= 207 && ![196, 200, 204].includes(marker)) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  throw new LlmError("Cursor image input must be PNG, JPEG, GIF or WebP.", "UNSUPPORTED_CONTENT");
}
async function imageBlock(url, signal) {
  let data, mediaType;
  const inline = /^data:([^;,]+)(;base64)?,(.*)$/su.exec(url);
  if (inline) {
    mediaType = inline[1];
    data = inline[2] ? Buffer.from(inline[3], "base64") : Buffer.from(decodeURIComponent(inline[3]));
  } else {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new LlmError(`Cursor image input could not be fetched (HTTP ${response.status}).`, "UNSUPPORTED_CONTENT");
    mediaType = (response.headers.get("content-type") ?? "").split(";")[0].trim();
    data = Buffer.from(await response.arrayBuffer());
  }
  const bytes2 = new Uint8Array(data);
  return { type: "image", data: bytes2, mediaType: mediaType || "image/png", ...imageSize(bytes2) };
}
async function contentBlocks(content, signal) {
  if (typeof content === "string") return content ? [{ type: "text", text: content }] : [];
  const blocks = [];
  for (const part of content ?? []) {
    if (part?.type === "text" && part.text) blocks.push({ type: "text", text: part.text });
    else if (part?.type === "image_url") blocks.push(await imageBlock(part.image_url?.url ?? part.image_url, signal));
  }
  return blocks;
}
var textOf2 = (content) => typeof content === "string" ? content : Array.isArray(content) ? content.filter((part) => part?.type === "text").map((part) => part.text ?? "").join("") : "";
var reasoningOf = (message2) => [message2.reasoning_content, message2.reasoning].find((value) => typeof value === "string" && value.trim()) ?? "";
function chatTools(chat) {
  const choice = chat.tool_choice;
  if (choice === "none") return [];
  const only = typeof choice === "object" ? choice?.function?.name : void 0;
  return (chat.tools ?? []).filter((tool) => tool?.type === "function" && tool.function?.name && (!only || tool.function.name === only)).map((tool) => ({
    name: tool.function.name,
    description: tool.function.description ?? "",
    parameters: tool.function.parameters ?? { type: "object", properties: {} }
  }));
}
async function chatMessages(chat, signal) {
  const system = [];
  const messages = [];
  for (const message2 of chat.messages ?? []) {
    switch (message2?.role) {
      case "system":
        if (!messages.length) system.push(textOf2(message2.content));
        else messages.push({ role: "developer", content: [{ type: "text", text: textOf2(message2.content) }] });
        break;
      case "developer":
        messages.push({ role: "developer", content: [{ type: "text", text: textOf2(message2.content) }] });
        break;
      case "user":
        messages.push({ role: "user", content: await contentBlocks(message2.content, signal) });
        break;
      case "assistant": {
        const content = [];
        const reasoning = reasoningOf(message2);
        if (reasoning) content.push({ type: "reasoning", text: reasoning });
        const text = textOf2(message2.content);
        if (text) content.push({ type: "text", text });
        for (const call of message2.tool_calls ?? []) {
          if (call?.type !== "function" && call?.type !== void 0) continue;
          const args = call.function?.arguments;
          content.push({
            type: "tool-call",
            id: String(call.id),
            name: call.function?.name ?? "",
            arguments: typeof args === "string" ? args || "{}" : JSON.stringify(args ?? {})
          });
        }
        const previous = messages.at(-1);
        if (previous?.role === "assistant") previous.content.push(...content);
        else if (content.length) messages.push({ role: "assistant", content });
        break;
      }
      case "tool":
        messages.push({ role: "tool", toolCallId: String(message2.tool_call_id), content: await contentBlocks(message2.content, signal), isError: false });
        break;
      default:
        break;
    }
  }
  const out = [];
  for (let i = 0; i < messages.length; i++) {
    out.push(messages[i]);
    if (messages[i].role !== "assistant") continue;
    const calls = messages[i].content.filter((block) => block.type === "tool-call").map((block) => block.id);
    let j = i + 1;
    const answered = /* @__PURE__ */ new Set();
    for (; j < messages.length && messages[j].role === "tool"; j++) {
      answered.add(messages[j].toolCallId);
      out.push(messages[j]);
    }
    for (const id of calls) {
      if (!answered.has(id)) out.push({ role: "tool", toolCallId: id, content: [{ type: "text", text: INTERRUPTED }], isError: true });
    }
    i = j - 1;
  }
  return { system: system.filter(Boolean).join("\n\n"), messages: out };
}

// ../dsh-cursor/lib/runtime.js
var MAX_QUEUED_EVENTS = 2048;
var MAX_CONVERSATIONS = 64;
var MAX_QUEUED_BYTES = 8 * 1024 * 1024;
var eventBytes = (event) => Buffer.byteLength(event.text ?? event.arguments ?? "") + Buffer.byteLength(event.name ?? "") + 128;
function canonical2(value) {
  if (Array.isArray(value)) return value.map(canonical2);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical2(value[key])]));
  return value;
}
function digest(value) {
  return createHash7("sha256").update(JSON.stringify(canonical2(value))).digest("hex");
}
function failure(message2, code = "CURSOR_CONTEXT_CHANGED", cause) {
  return new LlmError(message2, code, cause === void 0 ? void 0 : { cause });
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function assertOptions(options, auxiliary) {
  if (!auxiliary && options.tools?.some((tool) => tool.deferLoading)) {
    throw failure("Cursor does not expose deferred tool loading in its wire contract", "UNSUPPORTED_OPTION");
  }
}
var CursorRuntime = class {
  constructor(ctx, auth, catalog2, hooks = {}) {
    this.ctx = ctx;
    this.logger = typeof ctx?.logger === "function" ? ctx.logger("cursor") : void 0;
    this.auth = auth;
    this.catalog = catalog2;
    this.openRun = hooks.openCursorRun ?? openCursorRun;
    this.project = hooks.projectRequest ?? projectRequest;
    this.projectResult = hooks.projectToolResult ?? projectToolResult;
    this.fingerprint = hooks.requestFingerprint ?? requestFingerprint;
    this.resolveScope = hooks.resolveScope ?? (() => ({}));
    this.attachments = hooks.attachments;
    this.batchQuietMs = hooks.batchQuietMs ?? 100;
    this.maxScopes = Math.min(hooks.maxScopes ?? 32, 32);
    this.scopes = /* @__PURE__ */ new Map();
    this.conversations = /* @__PURE__ */ new Map();
    this.createConversation = hooks.createCursorConversation ?? createCursorConversation;
    this.conversationCache = hooks.conversationCache;
    this.owned = /* @__PURE__ */ new Set();
    this.resolving = /* @__PURE__ */ new Set();
    this.accountKnown = false;
    this.accountLoginId = void 0;
    this.disposed = false;
  }
  attachmentService() {
    return this.attachments ?? this.ctx?.get?.("attachments");
  }
  projectionOptions(signal) {
    const fs = this.ctx?.get?.("fs");
    return {
      attachments: this.attachmentService(),
      signal,
      ...fs ? { mapHostPath: (hostPath) => fs.processPathFromHostPath(hostPath) } : {}
    };
  }
  snapshotHistory(scope) {
    scope.historyFingerprint = this.fingerprint({ ...scope.initialOptions, messages: scope.expectedMessages });
  }
  attachSignal(scope, signal) {
    if (!signal || scope.listeners.has(signal)) return;
    const abort = () => {
      const error = failure("Cursor run cancelled by the caller", "ABORTED", signal.reason);
      this.stopInBackground(scope, error);
    };
    scope.listeners.set(signal, abort);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  }
  stopInBackground(scope, error) {
    this.closeScope(scope, error, true).catch((cleanupError) => {
      scope.cleanupError = cleanupError;
    });
  }
  makeScope(options, resolved2, key, auxiliary, ephemeral) {
    if (this.owned.size >= this.maxScopes || !ephemeral && this.scopes.size >= this.maxScopes) {
      throw failure("Cursor already owns the maximum number of active conversation scopes", "CURSOR_SCOPE_LIMIT");
    }
    const ready = deferred();
    const expectedMessages = structuredClone(options.messages);
    const scope = {
      key,
      auxiliary,
      sessionId: options.sessionId,
      resolved: resolved2,
      scopeDigest: digest([options.sessionId ?? null, resolved2.cwd ?? null, resolved2.generation ?? null]),
      controller: new AbortController(),
      ready,
      initialOptions: { ...options, messages: expectedMessages },
      expectedMessages,
      baseMessageCount: options.messages.length,
      queue: [],
      queueBytes: 0,
      listeners: /* @__PURE__ */ new Map(),
      pending: /* @__PURE__ */ new Map(),
      seenCallKeys: /* @__PURE__ */ new Set(),
      usage: {},
      modelCalls: [],
      busy: false,
      status: "opening",
      eof: false,
      hadToolActions: false
    };
    this.snapshotHistory(scope);
    this.owned.add(scope);
    if (!ephemeral) this.scopes.set(key, scope);
    return scope;
  }
  binding(options, captured, resolved2, selection, loginId, tools) {
    return digest({
      model: options.model,
      selection,
      loginId,
      settings: captured.settings,
      cwd: resolved2.cwd,
      generation: resolved2.generation,
      tools
    });
  }
  async grant(scope) {
    scope.controller.signal.throwIfAborted();
    const grant = await this.auth.getGrant(scope.controller.signal);
    scope.controller.signal.throwIfAborted();
    if (!grant?.access || !grant.loginId || grant.type !== "oauth") {
      throw failure("An explicit Cursor login is required", "CURSOR_AUTH_REQUIRED");
    }
    if (this.accountKnown && this.accountLoginId !== grant.loginId) {
      throw failure("The Cursor account changed during this user turn");
    }
    if (scope.loginId !== void 0 && scope.loginId !== grant.loginId) {
      throw failure("The Cursor run belongs to a different login");
    }
    this.accountKnown = true;
    this.accountLoginId = grant.loginId;
    scope.loginId = grant.loginId;
    return grant;
  }
  /** Resume terminal state across agent eviction and plugin/process restarts. */
  async conversationFor(scope, loginId, settings) {
    if (scope.auxiliary || !scope.sessionId) return { id: randomUUID4() };
    const { runTransport: _transport, ...identitySettings } = settings;
    const binding = digest([loginId, scope.resolved.cwd ?? null, identitySettings]);
    let entry = this.conversations.get(scope.sessionId);
    if (!entry || entry.binding !== binding) {
      const restored = await this.conversationCache?.load(scope.sessionId, binding);
      scope.controller.signal.throwIfAborted();
      entry = { id: randomUUID4(), loginId, binding, store: restored ?? this.createConversation() };
    }
    scope.conversation = entry;
    scope.controller.signal.throwIfAborted();
    this.conversations.delete(scope.sessionId);
    this.conversations.set(scope.sessionId, entry);
    while (this.conversations.size > MAX_CONVERSATIONS) this.conversations.delete(this.conversations.keys().next().value);
    return entry;
  }
  /** One concise log line per Run milestone: how it opened, first output and injections. */
  traceFor(scope) {
    const logger = this.logger;
    const started = Date.now();
    const session = scope.sessionId ?? "ephemeral";
    const shown = /* @__PURE__ */ new Set(["resume-checkpoint", "recover-checkpoint", "rebuild-history", "first-thinking", "first-text", "inject", "injection"]);
    return (event, detail2) => {
      const elapsedMs = Date.now() - started;
      if (event === "resume-checkpoint" || event === "recover-checkpoint" || event === "rebuild-history") {
        scope.diagnostics = {
          opening: event,
          messages: detail2?.messages,
          ...detail2?.reason ? { reason: detail2.reason } : {},
          ...detail2?.transport ? { transport: detail2.transport, historyBytes: detail2.historyBytes } : {}
        };
      } else if (event === "upload") {
        scope.diagnostics ??= {};
        scope.diagnostics.upload ??= { bytes: 0, wireBytes: 0, lastPayloadMs: 0 };
        scope.diagnostics.upload.bytes += detail2.bytes;
        scope.diagnostics.upload.wireBytes += detail2.wireBytes;
        if (detail2.bytes >= 1024) scope.diagnostics.upload.lastPayloadMs = elapsedMs;
      } else if (event === "first-thinking" || event === "first-text") {
        scope.diagnostics ??= {};
        scope.diagnostics[event === "first-text" ? "firstTextMs" : "firstThinkingMs"] = elapsedMs;
      }
      if (!shown.has(event)) return;
      logger?.warn(`cursor: ${session} ${event} +${elapsedMs}ms ${detail2 ? JSON.stringify(detail2) : ""}`);
    };
  }
  async open(scope, options, captured, selection, tools) {
    const grant = await this.grant(scope);
    scope.binding = this.binding(options, captured, scope.resolved, selection, grant.loginId, tools);
    scope.policyBinding = this.binding(options, captured, scope.resolved, selection, grant.loginId, []);
    scope.toolNames = new Set(tools.map((tool) => tool.name));
    const projectedOptions = scope.auxiliary ? { ...options, tools: [], toolHistory: void 0 } : options;
    const messages = await this.project(projectedOptions, this.projectionOptions(scope.controller.signal));
    if (scope.auxiliary && messages.some((message2) => message2.role === "tool" || message2.content.some((block) => block.type !== "text" && block.type !== "reasoning"))) {
      throw failure("Cursor auxiliary requests require a text-only history projection", "CURSOR_AUXILIARY_TEXT_ONLY");
    }
    scope.controller.signal.throwIfAborted();
    const conversation2 = await this.conversationFor(scope, grant.loginId, captured.settings);
    scope.controller.signal.throwIfAborted();
    if (conversation2.store) {
      const covered = conversation2.store.hostHistory;
      const changed = covered && this.fingerprint({ ...options, messages: options.messages.slice(0, covered.count) }) !== covered.digest;
      if (changed || conversation2.store.resume && !covered) resetCursorConversation(conversation2.store);
    }
    scope.run = await this.openRun({
      conversationId: conversation2.id,
      ...conversation2.store ? { conversation: conversation2.store } : {},
      selection,
      messages,
      tools,
      ...conversation2.store && this.conversationCache ? {
        onCheckpoint: (store) => this.conversationCache.save(scope.sessionId, conversation2.binding, store)
      } : {},
      ...scope.resolved.cwd === void 0 ? {} : { cwd: scope.resolved.cwd }
    }, {
      accessToken: grant.access,
      ...captured.settings,
      signal: scope.controller.signal,
      trace: this.traceFor(scope)
    });
    scope.ready.resolve(scope.run);
    scope.pump = this.pump(scope);
    scope.controller.signal.throwIfAborted();
    scope.status = "draining";
  }
  async pump(scope) {
    try {
      for await (const event of scope.run.events) {
        const bytes2 = eventBytes(event);
        if (scope.queue.length >= MAX_QUEUED_EVENTS || scope.queueBytes + bytes2 > MAX_QUEUED_BYTES) {
          throw failure("Cursor event buffer limit exceeded", "CURSOR_BUFFER_LIMIT");
        }
        scope.queueBytes += bytes2;
        scope.queue.push(event);
        scope.wake?.();
        if (event.type === "done") {
          scope.sawDone = true;
          break;
        }
      }
      if (!scope.sawDone && !scope.controller.signal.aborted) {
        scope.failure ??= failure("Cursor transport ended before completing this user turn", "CURSOR_RUN_LOST");
      }
    } catch (error) {
      if (!scope.controller.signal.aborted) {
        scope.failure ??= !scope.hadToolActions && error instanceof CursorProtocolError ? new LlmError(error.message, error.code, error.status === void 0 ? void 0 : { status: error.status }) : error instanceof LlmError ? error : failure(`Cursor transport was lost (${error?.code ?? "unknown"}: ${error?.message ?? error})`, "CURSOR_RUN_LOST", error);
      }
    } finally {
      scope.eof = true;
      scope.wake?.();
      if (scope.failure && !scope.closing) this.stopInBackground(scope, scope.failure);
    }
  }
  async nextEvent(scope, timeoutMs) {
    const deadline = timeoutMs === void 0 ? void 0 : Date.now() + timeoutMs;
    while (true) {
      if (scope.failure) throw scope.failure;
      scope.controller.signal.throwIfAborted();
      if (scope.queue.length) {
        const event = scope.queue.shift();
        scope.queueBytes -= eventBytes(event);
        return event;
      }
      if (scope.eof) throw failure("Cursor transport ended without a terminal event", "CURSOR_RUN_LOST");
      const remaining = deadline === void 0 ? void 0 : Math.max(0, deadline - Date.now());
      if (remaining === 0) return void 0;
      const timedOut = await new Promise((resolve) => {
        let timer;
        const wake = () => {
          clearTimeout(timer);
          if (scope.wake === wake) scope.wake = void 0;
          resolve(false);
        };
        scope.wake = wake;
        if (remaining !== void 0) timer = setTimeout(() => {
          if (scope.wake === wake) scope.wake = void 0;
          resolve(true);
        }, remaining);
      });
      if (timedOut) return void 0;
    }
  }
  recordUsage(scope, usage2) {
    if (usage2.cacheReadTokens !== void 0) {
      scope.diagnostics ??= {};
      scope.diagnostics.turnUsage = { ...usage2 };
      this.logger?.warn(`cursor: ${scope.sessionId ?? "ephemeral"} turn usage ${JSON.stringify({ input: usage2.inputTokens, cacheRead: usage2.cacheReadTokens, cacheWrite: usage2.cacheWriteTokens, output: usage2.outputTokens, context: usage2.contextTokens })}`);
    }
    if (usage2.outputTokens !== void 0) scope.usage.outputTokens = Math.max(scope.usage.outputTokens ?? 0, usage2.outputTokens);
    if (usage2.contextTokens !== void 0) scope.usage.contextTokens = usage2.contextTokens;
  }
  /**
   * One DSH step reports the context it actually occupied, from Cursor's latest
   * checkpoint. TurnEnded input and cache counters sum every model call of the
   * whole Run, so they would overstate context many times over and trigger
   * needless compaction. Without a checkpoint DSH keeps its own estimate.
   */
  usageChunk(scope) {
    if (scope.usage.contextTokens === void 0) return void 0;
    const outputTokens = Math.max(0, (scope.usage.outputTokens ?? 0) - (scope.reportedOutput ?? 0));
    scope.reportedOutput = scope.usage.outputTokens ?? 0;
    return { type: "usage", usage: { inputTokens: scope.usage.contextTokens, outputTokens } };
  }
  /**
   * Run diagnostics for one finished step, with the billing counters of the
   * model calls this step made, which no later step reports again.
   */
  stepDiagnostics(scope) {
    const calls = scope.modelCalls.splice(0);
    if (!scope.diagnostics && !calls.length) return {};
    return { diagnostics: { ...structuredClone(scope.diagnostics ?? {}), ...calls.length ? { modelCalls: calls } : {} } };
  }
  async collectTools(scope, first2) {
    const tools = [first2];
    const deferredEvents = [];
    let deadline = Date.now() + this.batchQuietMs;
    try {
      while (!scope.listedCount || tools.length < scope.listedCount) {
        const event = await this.nextEvent(scope, Math.max(0, deadline - Date.now()));
        if (!event) break;
        if (event.type === "tool") {
          tools.push(event);
          deadline = Date.now() + this.batchQuietMs;
        } else if (event.type === "tools-listed") {
          scope.listedCount = event.count;
        } else if (event.type === "usage") {
          this.recordUsage(scope, event.usage);
        } else if (event.type === "call-usage") {
          scope.modelCalls.push(event.usage);
        } else {
          deferredEvents.push(event);
          if (event.type === "done") break;
        }
      }
    } finally {
      const bytes2 = deferredEvents.reduce((sum, event) => sum + eventBytes(event), 0);
      if (scope.queue.length + deferredEvents.length > MAX_QUEUED_EVENTS || scope.queueBytes + bytes2 > MAX_QUEUED_BYTES) {
        throw failure("Cursor event buffer limit exceeded", "CURSOR_BUFFER_LIMIT");
      }
      scope.queue.unshift(...deferredEvents);
      scope.queueBytes += bytes2;
      scope.listedCount = void 0;
    }
    if (scope.failure) throw scope.failure;
    return tools;
  }
  validateResults(scope, options) {
    const prefix = options.messages.slice(0, scope.expectedMessages.length);
    if (this.fingerprint({ ...options, messages: prefix }) !== scope.historyFingerprint) {
      throw failure("DSH history changed while a Cursor tool handoff was pending");
    }
    if (scope.pending.size === 0) throw failure("A Cursor user turn is already running without a pending tool handoff", "CURSOR_RUN_BUSY");
    const results = /* @__PURE__ */ new Map();
    const injected = [];
    const suffix = options.messages.slice(scope.expectedMessages.length);
    for (const message2 of suffix) {
      if (message2.role === "user" && typeof scope.run?.inject === "function") {
        injected.push(message2);
        continue;
      }
      if (message2.role !== "tool" || !scope.pending.has(message2.toolCallId)) {
        throw failure("Cursor expected a native tool result with an exact pending toolCallId", "CURSOR_TOOL_RESULT_MISMATCH");
      }
      if (results.has(message2.toolCallId)) {
        throw failure("Cursor received duplicate results for the same pending toolCallId", "CURSOR_TOOL_RESULT_DUPLICATE");
      }
      results.set(message2.toolCallId, message2);
    }
    if (results.size !== scope.pending.size) {
      throw failure("Cursor is missing one or more pending native tool results", "CURSOR_TOOL_RESULT_MISSING");
    }
    return { results, suffix, injected };
  }
  canRebaseCompletedHandoff(scope, options, captured, selection, tools, grant) {
    if (!scope.pending.size || scope.failure || scope.policyBinding !== this.binding(options, captured, scope.resolved, selection, grant.loginId, [])) return false;
    const prefix = options.messages.slice(0, scope.expectedMessages.length);
    const suffix = options.messages.slice(scope.expectedMessages.length);
    const changed = this.fingerprint({ ...options, messages: prefix }) !== scope.historyFingerprint || scope.binding !== this.binding(options, captured, scope.resolved, selection, grant.loginId, tools) || suffix.some((message2) => message2.role === "developer" || message2.role === "system" || message2.role === "user" && typeof scope.run?.inject !== "function");
    if (!changed) return false;
    const results = /* @__PURE__ */ new Set();
    const calls = /* @__PURE__ */ new Set();
    for (const message2 of options.messages) {
      if (message2.role === "tool" && scope.pending.has(message2.toolCallId)) {
        if (results.has(message2.toolCallId)) return false;
        results.add(message2.toolCallId);
      }
      if (message2.role === "assistant") for (const block of message2.content) {
        const pending = block.type === "tool-call" ? scope.pending.get(block.id) : void 0;
        if (pending && pending.name === block.name && pending.arguments === block.arguments) calls.add(block.id);
      }
    }
    return results.size === scope.pending.size && calls.size === scope.pending.size;
  }
  async resume(scope, options, captured, selection, tools, capturedGrant) {
    if (scope.failure) throw scope.failure;
    const grant = capturedGrant ?? await this.grant(scope);
    scope.deliveryStarted = false;
    if (scope.binding !== this.binding(options, captured, scope.resolved, selection, grant.loginId, tools)) {
      throw failure("The model, account, endpoint, workspace generation, or tool schemas changed during a Cursor tool handoff");
    }
    const { results, suffix, injected } = this.validateResults(scope, options);
    await this.project(options, this.projectionOptions(scope.controller.signal));
    const projected = await Promise.all([...scope.pending].map(async ([id, call]) => {
      const message2 = results.get(id);
      const result2 = await this.projectResult(message2, this.projectionOptions(scope.controller.signal));
      return { callKey: call.callKey, result: { ...result2, isError: message2.isError === true } };
    }));
    const injection = injected.length ? (await this.project(
      { ...options, system: void 0, messages: injected, tools: [], toolHistory: void 0 },
      this.projectionOptions(scope.controller.signal)
    )).map((message2) => message2.content) : [];
    scope.deliveryStarted = true;
    for (const { callKey, result: result2 } of projected) {
      scope.controller.signal.throwIfAborted();
      if (scope.failure) throw scope.failure;
      try {
        await scope.run.reply(callKey, result2);
      } catch (error) {
        throw failure("Cursor tool-result delivery was interrupted; recovery requires the committed host history", "CURSOR_RUN_LOST", error);
      }
    }
    if (injection.length) {
      try {
        for (const content of injection) await scope.run.inject(content);
      } catch (error) {
        throw failure("Cursor could not accept a message added during this turn", "CURSOR_RUN_LOST", error);
      }
    }
    scope.pending.clear();
    scope.expectedMessages.push(...structuredClone(suffix));
    this.snapshotHistory(scope);
    scope.status = "draining";
  }
  async *drain(scope, options) {
    const blocks = [];
    let current;
    let index = 0;
    const endBlock = () => {
      if (!current) return void 0;
      const block = { type: current.type, text: current.text };
      const chunk = { type: "block-end", index: current.index, block };
      blocks.push(block);
      current = void 0;
      return chunk;
    };
    while (true) {
      const event = await this.nextEvent(scope);
      if (event.type === "text" || event.type === "reasoning") {
        if (current?.type !== event.type) {
          const ended = endBlock();
          if (ended) yield ended;
          current = { type: event.type, index: index++, text: "" };
          yield { type: "block-start", index: current.index, blockType: event.type };
        }
        current.text += event.text;
        scope.emitted = true;
        yield { type: event.type === "text" ? "text-delta" : "reasoning-delta", index: current.index, text: event.text };
      } else if (event.type === "usage") {
        this.recordUsage(scope, event.usage);
      } else if (event.type === "call-usage") {
        scope.modelCalls.push(event.usage);
      } else if (event.type === "tools-listed") {
        scope.listedCount = event.count;
      } else if (event.type === "tool") {
        const ended = endBlock();
        if (ended) yield ended;
        if (scope.auxiliary) throw failure("Cursor requested a tool in a text-only auxiliary run", "CURSOR_UNEXPECTED_TOOL");
        const calls = await this.collectTools(scope, event);
        for (const call of calls) {
          if (!scope.toolNames.has(call.name)) throw failure("Cursor requested a tool outside this native request schema", "CURSOR_UNEXPECTED_TOOL");
          if (scope.seenCallKeys.has(call.callKey)) throw failure("Cursor repeated an already received execution callKey", "CURSOR_DUPLICATE_CALL");
          scope.seenCallKeys.add(call.callKey);
          const id = ToolCallId(`cursor_${randomUUID4()}`);
          scope.pending.set(id, { callKey: call.callKey, name: call.name, arguments: call.arguments });
          const block = { type: "tool-call", id, name: call.name, arguments: call.arguments };
          const blockIndex = index++;
          blocks.push(block);
          yield { type: "block-start", index: blockIndex, blockType: "tool-call" };
          yield { type: "tool-call-delta", index: blockIndex, id, name: call.name, argumentsDelta: call.arguments };
          yield { type: "block-end", index: blockIndex, block };
        }
        scope.hadToolActions = true;
        scope.expectedMessages.push(createAssistantMessage({
          content: blocks,
          source: { provider: options.provider, model: options.model }
        }));
        this.snapshotHistory(scope);
        const usage2 = this.usageChunk(scope);
        if (usage2) yield usage2;
        scope.status = "parked";
        yield {
          type: "finish",
          reason: { kind: "tool-calls" },
          replayState: { response: {
            version: 1,
            scope: scope.scopeDigest,
            callIds: [...scope.pending.keys()],
            ...this.stepDiagnostics(scope)
          } }
        };
        return;
      } else if (event.type === "done") {
        const ended = endBlock();
        if (ended) yield ended;
        const usage2 = this.usageChunk(scope);
        if (usage2) yield usage2;
        if (scope.conversation) {
          const completed = [...scope.expectedMessages, createAssistantMessage({
            content: blocks,
            source: { provider: options.provider, model: options.model }
          })];
          scope.conversation.store.hostHistory = {
            count: completed.length,
            digest: this.fingerprint({ ...options, messages: completed })
          };
          await this.conversationCache?.save(scope.sessionId, scope.conversation.binding, scope.conversation.store);
        }
        await this.closeScope(scope, void 0, false);
        if (this.scopes.get(scope.key) === scope) this.scopes.delete(scope.key);
        const diagnostics = this.stepDiagnostics(scope);
        yield {
          type: "finish",
          reason: { kind: event.reason },
          ...diagnostics.diagnostics ? { replayState: { response: {
            version: 1,
            scope: scope.scopeDigest,
            ...diagnostics
          } } } : {}
        };
        return;
      }
    }
  }
  async *stream(options, captured) {
    if (this.disposed) throw failure("Cursor runtime has been disposed", "CURSOR_DISPOSED");
    const auxiliary = options.purpose === "compaction" || options.purpose === "session-title";
    assertOptions(options, auxiliary);
    const tools = auxiliary ? [] : structuredClone(options.tools ?? []);
    if (!auxiliary && !options.sessionId && tools.length) {
      throw failure("Native Cursor tool handoff requires GenerateOptions.sessionId", "CURSOR_SESSION_REQUIRED");
    }
    options.signal?.throwIfAborted();
    const ticket = { sessionId: options.sessionId, auxiliary };
    this.resolving.add(ticket);
    let resolved2;
    try {
      resolved2 = await this.resolveScope(options);
    } finally {
      this.resolving.delete(ticket);
    }
    options.signal?.throwIfAborted();
    if (ticket.failure) throw ticket.failure;
    if (this.disposed) throw failure("Cursor runtime has been disposed", "CURSOR_DISPOSED");
    const ephemeral = auxiliary || !options.sessionId;
    const key = ephemeral ? randomUUID4() : JSON.stringify([options.sessionId, resolved2.cwd ?? null, resolved2.generation ?? null]);
    let scope = ephemeral ? void 0 : this.scopes.get(key);
    if (!ephemeral) {
      for (const other of this.scopes.values()) {
        if (other.sessionId === options.sessionId && other.key !== key) {
          const error = failure("The workspace scope of this Cursor user turn changed");
          await this.closeScope(other, error, true);
          throw error;
        }
      }
    }
    if (scope?.failure) {
      await this.closeScope(scope, scope.failure, true);
      if (this.scopes.get(key) === scope) this.scopes.delete(key);
      scope = void 0;
    }
    if (scope?.busy) throw failure("Concurrent model steps cannot consume the same Cursor run", "CURSOR_RUN_BUSY");
    const existing = scope !== void 0;
    scope ??= this.makeScope(options, resolved2, key, auxiliary, ephemeral);
    scope.busy = true;
    this.attachSignal(scope, options.signal);
    try {
      const selection = this.catalog.select(captured.entry, options.reasoningEffort);
      if (existing) {
        const grant = await this.grant(scope);
        if (this.canRebaseCompletedHandoff(scope, options, captured, selection, tools, grant)) {
          await this.closeScope(scope, void 0, true);
          this.scopes.delete(key);
          scope = this.makeScope(options, resolved2, key, auxiliary, ephemeral);
          scope.busy = true;
          this.attachSignal(scope, options.signal);
          await this.open(scope, options, captured, selection, tools);
        } else await this.resume(scope, options, captured, selection, tools, grant);
      } else await this.open(scope, options, captured, selection, tools);
      yield* this.drain(scope, options);
    } catch (error) {
      if (error?.code === "IMAGE_OFFLOAD_REQUIRED" && scope.status === "parked" && !scope.deliveryStarted && !scope.controller.signal.aborted) {
        throw error;
      }
      scope.ready.resolve(scope.run);
      await this.closeScope(scope, error, true);
      if (this.scopes.get(key) === scope) this.scopes.delete(key);
      if (error instanceof CursorProtocolError) {
        throw new LlmError(error.message, error.code, error.status === void 0 ? void 0 : { status: error.status });
      }
      throw error;
    } finally {
      scope.busy = false;
      if (scope.status === "opening" || scope.status === "draining") {
        await this.closeScope(scope, failure("Cursor response consumer stopped", "ABORTED"), true);
        if (this.scopes.get(scope.key) === scope) this.scopes.delete(scope.key);
      }
    }
  }
  closeScope(scope, error, cancel) {
    if (error) scope.failure ??= error;
    if (cancel && !scope.controller.signal.aborted) scope.controller.abort(error);
    scope.wake?.();
    if (scope.closing) return scope.closing;
    scope.closing = (async () => {
      const errors = [];
      const run3 = await scope.ready.promise;
      if (run3) {
        if (cancel) {
          try {
            await run3.cancel(error);
          } catch (cause) {
            errors.push(cause);
          }
        }
        try {
          await run3.close();
        } catch (cause) {
          errors.push(cause);
        }
      }
      await scope.pump;
      for (const [signal, listener] of scope.listeners) signal.removeEventListener("abort", listener);
      scope.listeners.clear();
      scope.queue.length = 0;
      scope.queueBytes = 0;
      scope.status = error ? "lost" : "done";
      this.owned.delete(scope);
      if (errors.length) throw new AggregateError(errors, "Cursor run cleanup failed");
    })();
    return scope.closing;
  }
  async closeTurn(sessionId, reason = "Native turn ended") {
    const error = failure(String(reason), "CURSOR_TURN_CLOSED");
    for (const ticket of this.resolving) if (ticket.sessionId === sessionId && !ticket.auxiliary) ticket.failure = error;
    const matching = new Set([...this.owned, ...this.scopes.values()].filter((scope) => scope.sessionId === sessionId && !scope.auxiliary));
    for (const scope of matching) if (this.scopes.get(scope.key) === scope) this.scopes.delete(scope.key);
    await this.closeMany(matching, error);
  }
  async closeSession(sessionId, reason = "Native session closed") {
    const error = failure(String(reason), "CURSOR_SESSION_CLOSED");
    for (const ticket of this.resolving) if (ticket.sessionId === sessionId) ticket.failure = error;
    const matching = new Set([...this.owned, ...this.scopes.values()].filter((scope) => scope.sessionId === sessionId));
    for (const scope of matching) if (this.scopes.get(scope.key) === scope) this.scopes.delete(scope.key);
    this.conversations.delete(sessionId);
    await this.closeMany(matching, error);
  }
  async invalidateAccount(loginId) {
    if (this.accountKnown && this.accountLoginId === loginId) return;
    this.accountKnown = true;
    this.accountLoginId = loginId;
    const error = failure("The Cursor login changed or was removed");
    for (const [id, entry] of this.conversations) if (entry.loginId !== loginId) this.conversations.delete(id);
    for (const ticket of this.resolving) ticket.failure = error;
    const matching = [...this.owned].filter((scope) => loginId === void 0 || scope.loginId !== loginId);
    await this.closeMany(matching, error);
  }
  async closeMany(scopes, error) {
    const settled = await Promise.allSettled([...scopes].map((scope) => this.closeScope(scope, error, true)));
    const errors = settled.filter((result2) => result2.status === "rejected").map((result2) => result2.reason);
    if (errors.length) throw new AggregateError(errors, "Cursor runtime cleanup failed");
  }
  async dispose() {
    this.disposed = true;
    const all = /* @__PURE__ */ new Set([...this.owned, ...this.scopes.values()]);
    this.scopes.clear();
    this.conversations.clear();
    await this.closeMany(all, failure("Cursor runtime disposed", "CURSOR_DISPOSED"));
  }
};

// ../dsh-cursor/lib/conversation-cache.js
var MAX_AGE_MS = 24 * 60 * 60 * 1e3;
var MAX_RECORDS = 64;
function createConversationCache(records, logger, blobs) {
  const warn = () => logger?.warn("cursor: conversation cache unavailable; continuing with in-memory state");
  let tail = Promise.resolve();
  const enqueue = (action) => {
    const result2 = tail.then(action);
    tail = result2.catch(() => {
    });
    return result2;
  };
  const repository = blobs && {
    has: (hash2) => blobs.get(hash2) !== void 0,
    get: (hash2) => blobs.get(hash2)?.encoded,
    put: (hash2, encoded) => blobs.put(hash2, { encoded })
  };
  async function collect2() {
    const ordered = [...records.entries()].sort((a, b) => b[1].savedAt - a[1].savedAt);
    for (const [index, [id, record]] of ordered.entries()) {
      if (index >= MAX_RECORDS || Date.now() - record.savedAt > MAX_AGE_MS) await records.delete(id);
    }
    if (blobs) {
      const retained = new Set([...records.entries()].flatMap(([, record]) => record.blobRefs ?? []));
      for (const hash2 of blobs.keys()) if (!retained.has(hash2)) await blobs.delete(hash2);
    }
  }
  return {
    load(sessionId, binding) {
      return enqueue(async () => {
        const record = records.get(sessionId);
        if (!record || record.binding !== binding || Date.now() - record.savedAt > MAX_AGE_MS) return void 0;
        try {
          return await restoreCursorConversation(record.snapshot, repository);
        } catch {
          warn();
          return void 0;
        }
      });
    },
    save(sessionId, binding, store) {
      return enqueue(async () => {
        const references = /* @__PURE__ */ new Set();
        let storageFailure;
        const sink = repository && {
          ...repository,
          has: (hash2) => {
            references.add(hash2);
            return repository.has(hash2);
          },
          put: async (hash2, encoded) => {
            try {
              await repository.put(hash2, encoded);
            } catch (error) {
              storageFailure = error;
              throw error;
            }
          }
        };
        let snapshot;
        try {
          snapshot = await snapshotCursorConversation(store, sink);
        } catch (error) {
          if (storageFailure !== error) throw error;
          warn();
          return;
        }
        try {
          const previous = records.get(sessionId);
          const blobRefs = references.size > 0 || previous?.binding !== binding ? [...references] : previous?.blobRefs ?? [];
          await records.put(sessionId, {
            binding,
            savedAt: Date.now(),
            snapshot,
            ...repository ? { blobRefs } : {}
          });
          await collect2();
        } catch {
          warn();
        }
      });
    },
    discard(sessionId) {
      return enqueue(async () => {
        try {
          await records.delete(sessionId);
          await collect2();
        } catch {
          warn();
        }
      });
    },
    flush: () => tail
  };
}

// node_modules/.pnpm/@magpie-community+opencode-cursor-auth@0.2.44/node_modules/@magpie-community/opencode-cursor-auth/native-session.mjs
import { createHash as createHash8, randomBytes as randomBytes3 } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
var NATIVE_LIMITS = {
  resultWait: 12e4,
  lifetime: 15 * 6e4,
  // How much of the lifetime a retained Run must have left to take a tool
  // batch's results and go on; with less, the step starts on a fresh Run
  // from the supplied history. One step can be a long answer: a Pi turn on
  // grok-4.7 went on with 494 s left and was still answering at the
  // deadline (plugins#616, yetone/magpie#4419). At most two thirds of the
  // lifetime, so a short one set in a test still has room to continue.
  continueReserve: 10 * 6e4,
  batchWait: 3e4,
  // How long a stateless step whose calls came waits for Cursor's count of
  // them (update 27) with nothing but heartbeats before it hands the calls
  // that came to the caller (plugins#550). A count comes within ms of the
  // step's last call; a Run that sent calls and then only heartbeats has
  // stopped, and the caller's next request goes on from the calls' results.
  countWait: 6e4,
  drain: 6e3,
  replayWait: 12e4,
  blobBytes: 64 << 20,
  outputBytes: 16 << 20,
  argumentBytes: 1 << 20,
  argumentFields: 1e5,
  argumentDepth: 64,
  outboundBytes: 16 << 20,
  outboundMessages: 256,
  // How long a KV reply waits for room in the outbound queue (Cursor's own
  // flow control taking the writes before it) before the Run fails.
  writeWait: 3e4,
  // How long a Run waits on Cursor before it ends as gone quiet
  // (yetone/magpie#2672): idle, with no message at all, as @cursor/sdk's
  // stall detector ends one (30 s there; Cursor's client retries, this one
  // can't once output went out); quiet, with heartbeats and nothing else,
  // under the 5 minutes magpie keeps a silent reply alive. Only time spent
  // waiting on Cursor counts, never a Run parked for the caller's results.
  idle: 6e4,
  quiet: 24e4,
  perAccount: 8,
  perProcess: 32
};
var HANDLE = /^call_cursor_[a-f0-9]+_\d+_\d+$/;
var hash = (s) => createHash8("sha256").update(s).digest("hex");
var canonical3 = (v) => JSON.stringify(v, (_k, x) => x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, x[k]])) : x);
var bytes = (v) => Buffer.byteLength(canonical3(v));
var later = (fn, ms) => {
  const timer = setTimeout(fn, ms);
  timer.unref?.();
  return timer;
};
var NativeSessionError = class extends Error {
  constructor(status, message2) {
    super(message2);
    this.status = status;
  }
};
var invalid = (message2, status = 409) => {
  throw new NativeSessionError(status, message2);
};
var failureOf = (e) => ({ status: e?.status ?? 502, message: e?.message ?? String(e) });
var UPDATES = {
  1: "text",
  2: "tool call started",
  3: "tool call completed",
  4: "thinking",
  5: "thinking done",
  6: "user message",
  7: "partial tool call",
  8: "token count",
  9: "summary",
  10: "summary started",
  11: "summary done",
  12: "shell output",
  14: "turn end",
  15: "tool call delta",
  16: "step started",
  17: "step done",
  27: "tool count",
  31: "model call completed"
};
var MESSAGES = { 2: "tool call", 3: "checkpoint", 4: "blob request" };
function kindOf(f) {
  if (f.end) return "stream end";
  try {
    const fs = nativeFields(f.data);
    const updates = fs.filter((m) => m.num === 1).flatMap((m) => nativeFields(m.data));
    if (fs.length && fs.every((m) => m.num === 1) && updates.length && updates.every((u2) => u2.num === 13)) return null;
    const u = updates.find((u2) => u2.num !== 13);
    if (u) return UPDATES[u.num] ?? `update #${u.num}`;
    return MESSAGES[fs[0]?.num] ?? `message #${fs[0]?.num}`;
  } catch {
    return "malformed message";
  }
}
var Quiet = class {
  constructor(limits, stop, meta = {}) {
    this.limits = limits;
    this.stop = stop;
    this.heard = 0;
    this.heartbeats = 0;
    this.last = "";
    this.since = null;
    this.paused = false;
    this.waiting = false;
    this.why = "";
    this.checkpoints = 0;
    this.step = 0;
    this.stepCheckpoints = 0;
    this.trail = [];
    this.trace = WireTrace.open(meta);
  }
  arm() {
    clearTimeout(this.timer);
    if (this.paused || !this.waiting || this.why || this.done) return;
    this.since = Date.now();
    this.timer = later(() => this.fire(), Math.max(0, Math.min(this.limits.idle, this.limits.quiet - this.heard)));
  }
  // waited stops the clock: Cursor answered, or the Run paused
  waited() {
    clearTimeout(this.timer);
    if (this.since != null) this.heard += Date.now() - this.since;
    this.since = null;
  }
  fire() {
    const gap = Date.now() - this.since;
    const what = this.heard + gap >= this.limits.quiet ? `${this.heartbeats} heartbeats and nothing else for ${Math.round((this.heard + gap) / 1e3)} s` : `no message for ${Math.round(gap / 1e3)} s`;
    this.why = `Cursor went quiet: ${what}${this.last ? ", its last message " + this.lastSaid() : ""} (try again)`;
    this.trace?.event("quiet", { heard: this.heard + gap, heartbeats: this.heartbeats });
    this.gone?.();
    this.stop({ status: 502, message: this.why });
    this.failed({ status: 502, message: this.why });
  }
  // lastSaid is the last frame's kind as the error names it; a checkpoint
  // with its number, its place in the step and what came before it
  lastSaid() {
    if (this.last !== "checkpoint") return this.last;
    const row = this.trail.at(-1)?.[1] ?? 1;
    const before = this.trail.slice(0, -1).map(([k, n]) => n > 1 ? `${k} \xD7${n}` : k).join(", ");
    const nth = this.stepCheckpoints === 1 ? "the first" : `number ${this.stepCheckpoints}`;
    return `checkpoint #${this.checkpoints} of the Run` + (this.step ? `, ${nth} of step ${this.step}` : "") + (row > 1 ? `, ${row} in a row` : "") + `, after ${before || "nothing else"}`;
  }
  // nextStep is the Run's next model call (NativeSession counts them)
  nextStep(n) {
    this.step = n;
    this.stepCheckpoints = 0;
    this.trace?.event("step", { n });
  }
  // failed is how the Run ended, when it failed: a wire trace, if on, is
  // written then (once)
  failed(error) {
    this.trace?.write(error, this);
  }
  // pause stops the clock while the Run waits on the caller's tool results;
  // resume starts it again from nothing, for Cursor's next model call
  pause() {
    this.waited();
    this.paused = true;
    this.trace?.event("pause");
  }
  resume() {
    this.paused = false;
    this.heard = 0;
    this.heartbeats = 0;
    this.trace?.event("resume");
    this.arm();
  }
  // frames passes on a Run's frames; once Cursor has gone quiet, the read
  // that was waiting ends in its error, whether or not the stream does
  async *frames(stream) {
    const it = (stream[Symbol.asyncIterator] ?? stream[Symbol.iterator]).call(stream);
    try {
      for (; ; ) {
        this.waiting = true;
        this.arm();
        let r;
        try {
          const next = Promise.resolve(it.next());
          next.catch(() => {
          });
          r = await Promise.race([next, new Promise((wake) => {
            this.gone = wake;
          })]);
        } catch (e) {
          if (!this.why) throw e;
        } finally {
          this.gone = null;
          this.waiting = false;
          this.waited();
        }
        if (this.why) throw Object.assign(new NativeSessionError(502, this.why), { quiet: true });
        if (r.done) {
          this.trace?.event("eof");
          return;
        }
        const kind = kindOf(r.value);
        this.trace?.frame("in", r.value, kind);
        if (kind == null) this.heartbeats++;
        else {
          [this.heard, this.heartbeats, this.last] = [0, 0, kind];
          if (kind === "checkpoint") {
            this.checkpoints++;
            this.stepCheckpoints++;
          }
          if (this.trail.at(-1)?.[0] === kind) this.trail.at(-1)[1]++;
          else {
            this.trail.push([kind, 1]);
            if (this.trail.length > 4) this.trail.shift();
          }
        }
        yield r.value;
      }
    } finally {
      this.done = true;
      clearTimeout(this.timer);
      Promise.resolve(it.return?.()).catch(() => {
      });
    }
  }
};
var traceDir = () => "";
function setWireTrace(dir) {
  traceDir = typeof dir === "function" ? dir : () => dir || "";
}
var TRACE_HEAD = 2e3;
var TRACE_TAIL = 3e3;
var TRACE_FILES = 20;
function shape(data, children) {
  return nativeFields(data).map((f) => {
    const own = [f.num, f.wire, f.wire === 0 ? 0 : f.data.length];
    if (!children || f.wire !== 2) return own;
    try {
      return [...own, nativeFields(f.data).map((c) => [c.num, c.wire, c.wire === 0 ? 0 : c.data.length])];
    } catch {
      return own;
    }
  });
}
function scrub(s) {
  return String(s ?? "").replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "<email>").replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, "<id>").replace(/(auth0|user|google-oauth2|github)\|[\w-]+/gi, "<account>").replace(/[A-Za-z0-9_\-+/=.]{24,}/g, "<redacted>").slice(0, 2e3);
}
function detail(data) {
  const out = {};
  for (const m of nativeFields(data)) {
    if (m.num === 1) {
      for (const u of nativeFields(m.data)) {
        if (u.num === 27) out.count = num(nativeFields(u.data), 1);
        else if (u.num === 2 || u.num === 3 || u.num === 7) {
          const tc = field2(nativeFields(u.data), 2);
          const kind = tc && nativeFields(tc.data)[0];
          if (kind) out.tool = kind.wire === 2 ? [kind.num, nativeFields(kind.data)[0]?.num ?? 0] : [kind.num];
        }
      }
    } else if (m.num === 3) out.pending = pendingCalls(m.data);
  }
  return out;
}
var WireTrace = class _WireTrace {
  static open(meta) {
    let dir = "";
    try {
      dir = traceDir();
    } catch {
    }
    return dir ? new _WireTrace(dir, meta) : null;
  }
  constructor(dir, meta = {}) {
    this.dir = dir;
    this.meta = { path: String(meta.path ?? ""), model: String(meta.model ?? "") };
    if (meta.why) this.meta.why = String(meta.why);
    this.started = Date.now();
    this.head = [];
    this.tail = [];
    this.dropped = 0;
  }
  push(entry) {
    if (this.written) return;
    if (this.head.length < TRACE_HEAD) return void this.head.push(entry);
    this.tail.push(entry);
    if (this.tail.length > TRACE_TAIL) {
      this.tail.shift();
      this.dropped++;
    }
  }
  // frame is one frame of the Run: "in" from Cursor ({data} or {end, data}),
  // "out" a message this side sent
  frame(dir, f, kind) {
    const t = Date.now() - this.started;
    const data = dir === "in" ? f.data : f;
    const entry = { t, dir, size: data?.length ?? 0 };
    if (dir === "in") entry.kind = kind ?? "heartbeat";
    if (dir === "in" && f.end) entry.end = true;
    else try {
      entry.fields = shape(data, true);
    } catch {
      entry.malformed = true;
    }
    if (dir === "in" && !f.end) try {
      Object.assign(entry, detail(data));
    } catch {
    }
    this.push(entry);
  }
  event(name, extra = {}) {
    this.push({ t: Date.now() - this.started, event: name, ...extra });
  }
  // write saves the trace once, when the Run failed; a write that fails
  // leaves the Run's error as it was
  write(error, quiet) {
    if (this.written) return;
    this.written = true;
    try {
      const at = new Date(this.started).toISOString().replace(/[:.]/g, "-");
      const body = {
        trace: 1,
        plugin: "@magpie-community/opencode-cursor-auth",
        version: version(),
        ...this.meta,
        started: new Date(this.started).toISOString(),
        ms: Date.now() - this.started,
        error: { status: error?.status ?? 0, message: scrub(error?.message) },
        quiet: quiet ? { last: quiet.last, checkpoints: quiet.checkpoints, step: quiet.step, stepCheckpoints: quiet.stepCheckpoints, heartbeats: quiet.heartbeats, heard: quiet.heard, trail: quiet.trail } : void 0,
        frames: [...this.head, ...this.dropped ? [{ dropped: this.dropped }] : [], ...this.tail]
      };
      mkdirSync(this.dir, { recursive: true });
      const file = join(this.dir, `${at}-${randomBytes3(3).toString("hex")}.json`);
      writeFileSync(file + ".tmp", JSON.stringify(body) + "\n", { mode: 384 });
      renameSync(file + ".tmp", file);
      this.file = file;
      const old = readdirSync(this.dir).filter((n) => n.endsWith(".json")).sort();
      for (const n of old.slice(0, Math.max(0, old.length - TRACE_FILES))) rmSync(join(this.dir, n), { force: true });
    } catch {
    }
    this.head = this.tail = [];
  }
};
function version() {
  try {
    return JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version ?? "";
  } catch {
    return "";
  }
}
function nativeFields(input, maxFields = Infinity) {
  const b = Buffer.from(input);
  const out = [];
  let at = 0;
  const uv = () => {
    let n = 0;
    let scale = 1;
    for (let i = 0; i < 10 && at < b.length; i++) {
      const c = b[at++];
      n += (c & 127) * scale;
      if (c < 128 && Number.isSafeInteger(n)) return n;
      scale *= 128;
    }
    invalid("malformed native protobuf", 502);
  };
  while (at < b.length) {
    const key = uv();
    const num2 = Math.floor(key / 8);
    const wire = key % 8;
    if (!num2 || num2 > 536870911) invalid("malformed native protobuf field", 502);
    let n = 0;
    let data = Buffer.alloc(0);
    if (wire === 0) n = uv();
    else if (wire === 2 || wire === 1 || wire === 5) {
      const size = wire === 2 ? uv() : wire === 1 ? 8 : 4;
      if (at + size > b.length) invalid("truncated native protobuf", 502);
      data = b.subarray(at, at + size);
      at += size;
    } else invalid("unsupported native protobuf wire type", 502);
    if (out.length >= maxFields) invalid("native protobuf field limit reached", 502);
    out.push({ num: num2, wire, n, data });
  }
  return out;
}
function nativeMcpArgs(input, limits = NATIVE_LIMITS) {
  if (input.length > limits.argumentBytes) invalid("native MCP argument byte limit reached", 502);
  let remaining = limits.argumentFields;
  const read = (b) => {
    const fs2 = nativeFields(b, remaining);
    remaining -= fs2.length;
    return fs2;
  };
  const typed = (f, wire) => {
    if (f.wire !== wire) invalid("invalid native MCP argument field type", 502);
  };
  const utf8 = (b) => {
    try {
      return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(b);
    } catch {
      invalid("invalid UTF-8 in native MCP arguments", 502);
    }
  };
  function mapEntry(b, depth) {
    let key = "", value = null;
    for (const f of read(b)) {
      if (f.num === 1) {
        typed(f, 2);
        key = utf8(f.data);
      } else if (f.num === 2) {
        typed(f, 2);
        value = decodeValue(f.data, depth);
      }
    }
    return [key, value];
  }
  function decodeStruct(b, depth) {
    const entries2 = [];
    for (const f of read(b)) if (f.num === 1) {
      typed(f, 2);
      entries2.push(mapEntry(f.data, depth));
    }
    return Object.fromEntries(entries2);
  }
  function decodeValue(b, depth = 0) {
    if (depth > limits.argumentDepth) invalid("native MCP argument nesting limit reached", 502);
    let value = null;
    for (const f of read(b)) {
      if (f.num < 1 || f.num > 6) continue;
      typed(f, [0, 1, 2, 0, 2, 2][f.num - 1]);
      switch (f.num) {
        case 1:
          if (f.n !== 0) invalid("invalid native protobuf NullValue", 502);
          value = null;
          break;
        case 2:
          value = f.data.readDoubleLE(0);
          if (!Number.isFinite(value)) invalid("nonfinite native MCP argument number", 502);
          break;
        case 3:
          value = utf8(f.data);
          break;
        case 4:
          value = f.n !== 0;
          break;
        case 5:
          value = decodeStruct(f.data, depth + 1);
          break;
        case 6:
          value = [];
          for (const item of read(f.data)) if (item.num === 1) {
            typed(item, 2);
            value.push(decodeValue(item.data, depth + 1));
          }
          break;
      }
    }
    return value;
  }
  const fs = read(input), entries = [];
  for (const f of fs) {
    if ([1, 3, 4, 5, 9].includes(f.num)) {
      typed(f, 2);
      utf8(f.data);
    } else if (f.num === 2) {
      typed(f, 2);
      entries.push(mapEntry(f.data, 0));
    } else if (f.num === 6) typed(f, 2);
    else if (f.num === 7) typed(f, 0);
  }
  return { fields: fs, args: Object.fromEntries(entries) };
}
var field2 = (fs, n) => fs.find((f) => f.num === n);
var str = (fs, n) => field2(fs, n)?.data.toString("utf8") ?? "";
var num = (fs, n) => field2(fs, n)?.n ?? 0;
var StepCalls = class {
  constructor(parse) {
    this.parse = parse;
    this.started = /* @__PURE__ */ new Set();
    this.execs = /* @__PURE__ */ new Set();
    this.partial = /* @__PURE__ */ new Set();
    this.byCursor = /* @__PURE__ */ new Set();
    this.listedAfter = false;
  }
  // update takes an InteractionUpdate's own field (num) and its fields; it
  // says whether a call was completed by Cursor: one this step wrote (7)
  // and completed (3) with no start on the client (2) and no exec. A
  // completion of an earlier step's call is never counted again.
  update(n, uf) {
    if (n !== 2 && n !== 3 && n !== 7) return false;
    this.listedAfter = false;
    const id = str(uf, 1);
    if (!id) return false;
    if (n === 2) this.started.add(id);
    if (n === 7) this.partial.add(id);
    if (n !== 3) return false;
    if (!this.partial.has(id) || this.started.has(id) || this.execs.has(id) || this.byCursor.has(id)) return false;
    this.byCursor.add(id);
    return true;
  }
  // exec notes an exec's args, whatever its kind: each kind keeps its
  // tool_call_id at a field of its own (ShellArgs 4, ReadArgs 2, McpArgs 3).
  // If #3 came before its exec, it was not completed by Cursor after all.
  exec(data) {
    this.listedAfter = false;
    try {
      for (const e of this.parse(data)) {
        if (e.wire !== 2 || e.num === 15 || e.num === 19) continue;
        for (const a of this.parse(e.data)) if (a.wire === 2 && a.data.length && a.data.length <= 512) {
          const s = a.data.toString("utf8");
          this.execs.add(s);
          this.byCursor.delete(s);
        }
      }
    } catch {
    }
  }
  listed() {
    this.listedAfter = true;
  }
  get completed() {
    return this.byCursor.size;
  }
  // writing is how many calls the step wrote (7) that are neither started
  // on the client, sent as an exec, nor completed by Cursor: a call of
  // Cursor's own still running, or one still to be sent
  get writing() {
    let n = 0;
    for (const id of this.partial) if (!this.started.has(id) && !this.execs.has(id) && !this.byCursor.has(id)) n++;
    return n;
  }
  // nextStep starts the next step's count
  nextStep() {
    this.partial.clear();
    this.byCursor.clear();
    this.listedAfter = false;
  }
};
function pendingCalls(data, parse = nativeFields) {
  try {
    return parse(data).filter((f) => f.num === 4).length;
  } catch {
    return null;
  }
}
function argsOf(s) {
  try {
    const v = typeof s === "string" ? JSON.parse(s) : s;
    if (v && typeof v === "object" && !Array.isArray(v)) return v;
  } catch {
  }
  invalid("invalid tool arguments in native continuation", 400);
}
function assistantDisplay(message2) {
  const parts = typeof message2.content === "string" ? [{ type: "text", text: message2.content }] : message2.content ?? [];
  if (!Array.isArray(parts) || parts.some((p) => !["text", "reasoning"].includes(p?.type) || typeof p.text !== "string")) invalid("unsupported native assistant display");
  const reasoning = [message2.reasoning_content, message2.reasoning, message2.reasoning_text].find((v) => typeof v === "string" && v.trim()) ?? "";
  return {
    text: parts.filter((p) => p.type === "text").map((p) => p.text).join(""),
    reasoning: reasoning + parts.filter((p) => p.type === "reasoning").map((p) => p.text).join("")
  };
}
function resultParts(message2, limits) {
  const parts = typeof message2.content === "string" ? [{ type: "text", text: message2.content }] : message2.content;
  if (!Array.isArray(parts)) invalid("unsupported native tool result");
  let retained = 0;
  return parts.map((part) => {
    if (part?.type === "text" && typeof part.text === "string") {
      retained += Buffer.byteLength(part.text);
      if (retained > limits.outputBytes) invalid("native tool result limit reached");
      return { text: part.text };
    }
    const url = part?.type === "image_url" ? typeof part.image_url === "string" ? part.image_url : part.image_url?.url : part?.type === "image" && part.source?.type === "base64" ? `data:${part.source.media_type};base64,${part.source.data}` : "";
    const image = /^data:(image\/(?:png|jpeg|gif|webp));base64,([A-Za-z0-9+/]*={0,2})$/.exec(url ?? "");
    if (!image) invalid("unsupported native tool result content");
    const data = Buffer.from(image[2], "base64");
    retained += data.length;
    if (retained > limits.outputBytes) invalid("native tool result limit reached");
    if (!data.length || data.toString("base64").replace(/=+$/, "") !== image[2].replace(/=+$/, "")) invalid("invalid native result image");
    return { data, mimeType: image[1] };
  });
}
function normalizeMessage(m) {
  if (m?.role !== "assistant") return m;
  const { text, reasoning } = assistantDisplay(m);
  const out = { ...m, content: text };
  delete out.reasoning;
  delete out.reasoning_content;
  delete out.reasoning_text;
  if (reasoning) out.reasoning_content = reasoning;
  if (m.tool_calls) out.tool_calls = m.tool_calls.map((c) => ({
    ...c,
    type: c.type ?? "function",
    function: { ...c.function, arguments: argsOf(c.function?.arguments ?? "{}") }
  }));
  return out;
}
var historyDigest = (messages) => hash(canonical3(messages.map(normalizeMessage)));
function controlsOf(chat, selector, tools) {
  const controls = { ...chat };
  for (const k of ["messages", "stream", "stream_options"]) delete controls[k];
  return hash(canonical3({ selector, controls, tools }));
}
var toolAttachment = (m) => m?.role === "user" && Array.isArray(m.content) && m.content.length > 1 && m.content[0]?.type === "text" && m.content[0].text === "Attached image(s) from tool result:" && m.content.slice(1).every((p) => p?.type === "image_url");
function matchResults(batch, messages) {
  if (historyDigest(messages.slice(0, batch.prefixLength)) !== batch.prefixDigest) invalid("native continuation history diverged");
  const suffix = messages.slice(batch.prefixLength);
  const assistants = [];
  while (suffix[assistants.length]?.role === "assistant") assistants.push(suffix[assistants.length]);
  if (!assistants.length) invalid("native continuation is missing its assistant tool calls", 400);
  let content = "";
  let reasoning = "";
  const calls = [];
  for (const m of assistants) {
    const unknown = Object.keys(m).filter((k) => !["role", "content", "tool_calls", "reasoning", "reasoning_content", "reasoning_text"].includes(k));
    if (unknown.length) invalid("unsupported assistant fields in native continuation", 400);
    const display = assistantDisplay(m);
    content += display.text;
    reasoning += display.reasoning;
    for (const c of m.tool_calls ?? []) {
      if (c.type && c.type !== "function") invalid("unsupported native continuation tool call", 400);
      calls.push({ id: c.id, name: c.function?.name, args: argsOf(c.function?.arguments ?? "{}") });
    }
  }
  if (content !== batch.content || reasoning && reasoning !== batch.reasoning) invalid("native continuation assistant output changed");
  const expected = batch.calls.map((c) => ({ id: c.id, name: c.name, args: argsOf(c.args) }));
  const sorted = (v) => [...v].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  if (canonical3(sorted(calls)) !== canonical3(sorted(expected))) invalid("native continuation tool calls changed");
  let results = suffix.slice(assistants.length);
  if (batch.calls.length === 1 && results.length === 2 && results[0]?.role === "tool" && toolAttachment(results[1])) {
    const [result2, attachment] = results;
    const content2 = typeof result2.content === "string" ? [{ type: "text", text: result2.content }] : result2.content;
    if (!Array.isArray(content2)) invalid("unsupported native tool result");
    results = [{ ...result2, content: [...content2, ...attachment.content.slice(1)] }];
  }
  if (results.some((m) => m?.role !== "tool")) invalid("new input cannot be interleaved with pending native results");
  const ids = /* @__PURE__ */ new Set();
  for (const m of results) {
    if (ids.has(m.tool_call_id)) invalid("duplicate native tool result", 400);
    ids.add(m.tool_call_id);
    if (!expected.some((c) => c.id === m.tool_call_id)) invalid("unknown native tool result", 400);
  }
  if (ids.size !== expected.length) invalid("all parallel native tool results must be submitted together", 400);
  return [...results].sort((a, b) => a.tool_call_id.localeCompare(b.tool_call_id));
}
var Segment = class {
  constructor(owner, chat) {
    this.owner = owner;
    this.prefixLength = chat.messages.length;
    this.prefixDigest = historyDigest(chat.messages);
    this.events = [];
    this.calls = [];
    this.answered = 0;
    this.content = "";
    this.reasoning = "";
    this.expected = null;
    this.closed = false;
    this.clean = false;
    this.waiters = /* @__PURE__ */ new Set();
  }
  wake() {
    for (const wake of this.waiters) wake();
    this.waiters.clear();
  }
  emit(e) {
    this.owner.retain(bytes(e));
    if (e.text) this.content += e.text;
    if (e.reasoning) this.reasoning += e.reasoning;
    this.events.push(e);
    this.wake();
  }
  finish(stop) {
    for (const [index, c] of this.calls.entries()) {
      const e = { tool: { index, id: c.id, name: c.name, args: c.args } };
      this.owner.retain(bytes(e));
      this.events.push(e);
    }
    this.owner.retain(bytes(stop));
    this.events.push(stop);
    this.closed = true;
    this.wake();
  }
  fail(error) {
    this.events = [{ error }];
    this.closed = true;
    this.wake();
  }
  iterator({ replay = false } = {}) {
    const segment = this;
    let at = 0;
    let errorSent = false;
    return {
      async next() {
        while (!segment.closed && at >= segment.events.length) await new Promise((r) => segment.waiters.add(r));
        if (!replay && segment.owner.error) {
          if (errorSent) return { done: true };
          errorSent = true;
          return { value: { error: segment.owner.error }, done: false };
        }
        if (at < segment.events.length) {
          const event = segment.events[at++];
          if (replay && event.stop) return { value: { ...event, usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
            prompt_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
            magpie_native: { accounting: "replayed" }
          } }, done: false };
          return { value: event, done: false };
        }
        return { done: true };
      },
      async return() {
        if (!replay) await segment.owner.cancel("the Chat response was cancelled");
        return { done: true };
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
};
var LIFETIME_EXPIRED = "native Run lifetime expired: the Run timed out; retry your request";
var NativeSessionPool = class {
  constructor(limits = NATIVE_LIMITS) {
    this.limits = limits;
    this.entries = /* @__PURE__ */ new Set();
    this.handles = /* @__PURE__ */ new Map();
    this.selectors = /* @__PURE__ */ new Map();
  }
  // selector is conversationID(chat, session): session/cache key AND first
  // user identity. Task subagents sharing a session must not own its parent.
  prepare(tok, chat, selector, tools) {
    const fallback = (reason) => ({ fallback: reason });
    if (!Array.isArray(chat.messages) || bytes(chat) > this.limits.outputBytes) return fallback("history retention limit");
    const account = hash(tok);
    const controls = controlsOf(chat, selector, tools);
    const trailing = [];
    const end = chat.messages.length - (toolAttachment(chat.messages.at(-1)) ? 2 : 1);
    for (let i = end; i >= 0 && chat.messages[i]?.role === "tool"; i--) trailing.push(chat.messages[i].tool_call_id);
    const handles = trailing.filter((id) => typeof id === "string" && HANDLE.test(id));
    if (handles.length) {
      const found = handles.map((id) => this.handles.get(id));
      if (found.some((v) => !v)) return fallback("owner unavailable");
      const { owner, batch } = found[0];
      if (found.some((v) => v.owner !== owner || v.batch !== batch)) return fallback("different native batches");
      if (owner.account !== account || owner.controls !== controls || owner.error) return fallback("owner incompatible or expired");
      try {
        const results = matchResults(batch, chat.messages);
        const encoded = results.map((m) => owner.encodeResult(m));
        const digest2 = hash(canonical3(results));
        if (batch.resultDigest) {
          if (batch.resultDigest !== digest2 || !batch.next?.clean) return fallback("result already submitted or busy");
          return { owner, batch, replay: true, segment: batch.next };
        }
        if (owner.state !== "awaiting-results" || owner.segment !== batch || !batch.clean) return fallback("owner busy");
        const reserve = Math.min(owner.limits.continueReserve, owner.limits.lifetime * 2 / 3);
        if (owner.expiresAt - Date.now() <= reserve) {
          owner.fail({ status: 410, message: "native Run retired before lifetime deadline" }, "expired");
          return fallback("owner near lifetime deadline");
        }
        return { owner, batch, results, encoded, digest: digest2, chat };
      } catch (e) {
        if (!(e instanceof NativeSessionError)) throw e;
        return fallback("history incompatible with retained owner");
      }
    }
    const historical = chat.messages.flatMap((m) => (m?.tool_calls ?? []).filter((c) => HANDLE.test(c?.id ?? "")));
    if (historical.length) {
      const answered = new Set(chat.messages.filter((m) => m?.role === "tool").map((m) => m.tool_call_id));
      const last = chat.messages.at(-1);
      const freshTurn = last?.role === "user" && !toolAttachment(last);
      if (!freshTurn || historical.some((c) => !answered.has(c.id))) return fallback("historical native calls");
    }
    if (selector && this.selectors.has(account + ":" + selector)) {
      if (!historical.length) return fallback("owner busy");
      return { account, selector, controls, selected: false, chat };
    }
    return { account, selector, controls, selected: !!selector, chat };
  }
  create(prepared, resolution, wire) {
    if (prepared.fallback || prepared.selected && this.selectors.has(prepared.account + ":" + prepared.selector)) return null;
    const crowded = () => this.entries.size >= this.limits.perProcess || [...this.entries].filter((e) => e.account === prepared.account).length >= this.limits.perAccount;
    while (crowded()) {
      const accountFull = [...this.entries].filter((e) => e.account === prepared.account).length >= this.limits.perAccount;
      const finished = [...this.entries].find((e) => ["complete", "failed", "cancelled", "expired"].includes(e.state) && (!accountFull || e.account === prepared.account));
      if (!finished) return null;
      this.forget(finished);
    }
    let owner;
    try {
      owner = new NativeSession(this, prepared, resolution, wire);
    } catch (e) {
      if (!(e instanceof NativeSessionError)) throw e;
      return null;
    }
    const at = Date.now();
    for (const e of this.entries) {
      if (e.account !== owner.account || !e.selector || e.selector !== owner.selector) continue;
      e.laterRunAt ??= at;
      if (e.state === "awaiting-results") e.accounting?.handover();
    }
    this.entries.add(owner);
    if (prepared.selected) this.selectors.set(owner.account + ":" + owner.selector, owner);
    return owner;
  }
  release(owner) {
    const key = owner.account + ":" + owner.selector;
    if (this.selectors.get(key) === owner) this.selectors.delete(key);
  }
  forget(owner) {
    owner.accounting?.abandon();
    clearTimeout(owner.replayTimer);
    this.release(owner);
    this.entries.delete(owner);
    for (const [id, h] of this.handles) if (h.owner === owner) this.handles.delete(id);
    owner.blobs.clear();
    owner.checkpoint = null;
    owner.execs.clear();
    owner.nativeCalls.clear();
    owner.stepUsages.clear();
    owner.lastStepUsage = null;
  }
  async clear() {
    await Promise.all([...this.entries].map((e) => e.cancel("native owner removed")));
    for (const e of this.entries) {
      clearTimeout(e.replayTimer);
      this.forget(e);
    }
  }
};
var NativeSession = class {
  constructor(pool, prepared, resolution, wire) {
    Object.assign(this, prepared);
    this.pool = pool;
    this.limits = pool.limits;
    this.resolution = resolution;
    this.wire = wire;
    this.identity = randomBytes3(12).toString("hex");
    this.state = "opening";
    this.ac = new AbortController();
    this.execs = /* @__PURE__ */ new Map();
    this.nativeCalls = /* @__PURE__ */ new Map();
    this.stepCalls = new StepCalls(nativeFields);
    this.blobs = /* @__PURE__ */ new Map();
    this.knownHashes = /* @__PURE__ */ new Set();
    this.blobSize = 0;
    this.retainedBytes = 0;
    this.sequence = 0;
    this.segments = 0;
    this.steps = 1;
    this.stepSaid = 0;
    this.stepUsages = /* @__PURE__ */ new Map();
    this.lastStepUsage = null;
    this.said = 0;
    this.wrote = 0;
    this.terminal = false;
    this.segment = new Segment(this, prepared.chat);
    this.retain(bytes(prepared.chat));
    this.expireIn(this.limits.lifetime);
    this.quiet = new Quiet(this.limits, (e) => this.fail(e), { path: "native", model: resolution?.id });
    this.quiet.nextStep(this.steps);
  }
  // expireIn sets the Run's absolute deadline ms from now: from its start,
  // the whole lifetime; a test brings it in after the first answer
  expireIn(ms) {
    clearTimeout(this.lifetimeTimer);
    this.expiresAt = Date.now() + ms;
    this.lifetimeTimer = later(() => this.fail({ status: 410, message: LIFETIME_EXPIRED }, "expired"), ms);
  }
  retain(n) {
    if (this.retainedBytes + n > this.limits.outputBytes) invalid("native output/history retention limit reached", 503);
    this.retainedBytes += n;
  }
  attach(signal, segment = this.segment) {
    if (signal?.aborted) {
      this.fail({ status: 410, message: "the Chat request was already cancelled" }, "cancelled");
      return;
    }
    const abort = () => this.fail({ status: 410, message: "the Chat request was cancelled" }, "cancelled");
    signal?.addEventListener("abort", abort, { once: true });
    segment.detach = () => signal?.removeEventListener("abort", abort);
  }
  delivered(segment = this.segment) {
    if (this.error) return;
    segment.clean = true;
    segment.detach?.();
    if (this.state === "complete" && segment === this.segment) this.accounting?.delivered();
  }
  closeTransport() {
    if (this.transportClosed) return;
    this.transportClosed = true;
    clearInterval(this.runHeartbeat);
    clearInterval(this.execHeartbeat);
    clearTimeout(this.batchTimer);
    clearTimeout(this.resultTimer);
    clearTimeout(this.drainTimer);
    clearTimeout(this.lifetimeTimer);
    this.quiet.pause();
    this.ac.abort();
    this.transport?.close();
  }
  fail(error, state = "failed") {
    if (this.error || this.state === "complete") return;
    this.error = error;
    this.state = state;
    if (state !== "cancelled") this.quiet.failed(error);
    this.segment.fail(error);
    for (const segment of this.batches ?? []) segment.detach?.();
    this.segment.detach?.();
    this.closeTransport();
    this.pool.forget(this);
  }
  async cancel(message2) {
    this.fail({ status: 410, message: message2 }, "cancelled");
    await this.pumpTask;
  }
  bind(transport, blobs, estimate) {
    if (this.transportClosed || this.error) {
      transport.close();
      return;
    }
    this.transport = transport;
    this.estimate = estimate;
    this.stepEstimate = estimate;
    this.blobs = blobs;
    this.knownHashes = new Set(blobs.keys());
    this.blobSize = [...blobs.values()].reduce((n, b) => n + b.length, 0);
    if (this.blobSize > this.limits.blobBytes) invalid("native bootstrap blob limit reached", 503);
    if (this.error) return this.closeTransport();
    this.state = "running";
    const { pb: pb2 } = this.wire;
    const heartbeat = (message2) => {
      try {
        this.send(message2);
      } catch (e) {
        this.fail(failureOf(e));
      }
    };
    this.runHeartbeat = setInterval(() => heartbeat(pb2().bytes(7, Buffer.alloc(0)).done()), 5e3);
    this.execHeartbeat = setInterval(() => {
      for (const c of this.execs.values()) if (!c.submitted) heartbeat(pb2().bytes(5, pb2().bytes(3, pb2().varint(1, c.requestID))).done());
    }, 3e3);
    this.runHeartbeat.unref?.();
    this.execHeartbeat.unref?.();
  }
  send(message2) {
    if (this.error || this.transportClosed) invalid("native transport is no longer writable", 410);
    this.quiet.trace?.frame("out", message2);
    this.transport.send(message2);
  }
  // reply answers one of Cursor's KV requests once the outbound queue has
  // room. Cursor asks for every history blob at once, hundreds for a long
  // conversation, faster than a slow link takes the replies: the decoder
  // waits for the queue rather than failing the Run (#142).
  async reply(message2) {
    await this.transport.room?.(message2.length + 5);
    this.send(message2);
  }
  execClose(id) {
    this.send(this.wire.pb().bytes(5, this.wire.pb().bytes(1, this.wire.pb().varint(1, id))).done());
  }
  encodeResult(message2) {
    const { pb: pb2 } = this.wire;
    const success = pb2();
    for (const item of resultParts(message2, this.limits)) {
      if (item.text !== void 0) success.bytes(1, pb2().bytes(1, pb2().str(1, item.text)));
      else success.bytes(1, pb2().bytes(2, pb2().bytes(1, item.data).str(2, item.mimeType)));
    }
    if (message2.is_error === true || message2.isError === true) success.varint(2, 1);
    return pb2().bytes(1, success).done();
  }
  resume(prepared, signal) {
    if (prepared.replay) return this.response(prepared.segment, true);
    const batch = prepared.batch;
    if (this.error || this.state !== "awaiting-results" || this.segment !== batch || batch.resultDigest) invalid("native continuation is already reserved");
    const next = new Segment(this, prepared.chat);
    this.attach(signal, next);
    if (this.error) invalid(this.error.message, this.error.status);
    batch.resultDigest = prepared.digest;
    batch.next = next;
    this.segment = next;
    this.state = "submitting";
    this.accounting?.resumed();
    clearTimeout(this.resultTimer);
    clearTimeout(this.batchTimer);
    this.batchTimer = null;
    this.nextStep(prepared.estimate);
    try {
      for (let i = 0; i < prepared.results.length; i++) {
        const call = batch.calls.find((c) => c.id === prepared.results[i].tool_call_id);
        const msg = this.wire.pb().varint(1, call.requestID);
        if (call.execID) msg.str(15, call.execID);
        msg.bytes(11, prepared.encoded[i]);
        this.resultSubmitted = true;
        this.send(this.wire.pb().bytes(2, msg).done());
        call.submitted = true;
        this.execClose(call.requestID);
      }
      this.state = "running";
      this.quiet.resume();
    } catch (e) {
      const error = failureOf(e);
      this.fail({ status: error.status, message: `${error.message}; native result submission failed; its outcome is uncertain and cannot be replayed` });
    }
    return this.response(next);
  }
  response(segment = this.segment, replay = false) {
    return {
      events: segment.iterator({ replay }),
      cancel: () => replay ? Promise.resolve() : this.cancel("the Chat response was cancelled"),
      resolution: this.resolution,
      delivered: () => replay || this.delivered(segment),
      diagnostic: `same-run; bootstrap=imported-history; new-turn=stateless; missing-owner=stateless${replay ? "; replay=true" : ""}`
    };
  }
  acceptCall(call) {
    if (!Number.isInteger(call.requestID)) invalid("native tool call is missing its exec request ID", 502);
    const prior = this.execs.get(call.requestID);
    const digest2 = hash(canonical3({ requestID: call.requestID, execID: call.execID, nativeID: call.nativeID, name: call.name, args: argsOf(call.args) }));
    if (prior) {
      if (prior.digest !== digest2) invalid("native exec identity changed during retransmission", 502);
      return;
    }
    if (this.terminal || this.state === "awaiting-results") invalid("native call arrived after its batch was sealed", 502);
    if (call.nativeID && this.nativeCalls.has(call.nativeID)) invalid("native tool-call ID was reused for another exec", 502);
    call.id = `call_cursor_${this.identity}_${this.segments}_${this.segment.calls.length}`;
    call.digest = digest2;
    this.execs.set(call.requestID, call);
    if (call.nativeID) this.nativeCalls.set(call.nativeID, call);
    this.segment.calls.push(call);
    this.retain(bytes(call));
    this.said += call.args.length;
    this.waitForBatch();
    this.sealBatch();
  }
  // nextStep is Cursor's next model call in the same turn: after the
  // caller's results, or after a step whose calls were all answered here.
  nextStep(estimate) {
    this.steps++;
    this.stepCalls.nextStep();
    this.quiet.nextStep(this.steps);
    this.stepSaid = this.said;
    this.lastStepUsage = null;
    if (estimate != null) this.stepEstimate = estimate;
  }
  modelCallCompleted(fields2) {
    const id = str(fields2, 1);
    const entry = {
      usage: this.wire.usageOf(fields2, 1),
      measuredInput: fields2.some((f) => [2, 4, 5].includes(f.num)),
      measuredOutput: fields2.some((f) => f.num === 3),
      hasReasoning: fields2.some((f) => f.num === 6)
    };
    this.stepUsages.set(id || `step:${this.steps}:${this.stepUsages.size}`, entry);
    this.lastStepUsage = entry;
  }
  // waitForBatch gives the step batchWait from its latest call, answered
  // call, count, text or heartbeat, not from its first. Cursor sends each
  // call once the model has written its arguments, so a step of many long
  // calls arrives over longer than batchWait while never pausing that long
  // (#155), and one long call is written with only heartbeats meanwhile
  // (#377); a heartbeat-only stretch is bounded by quiet. The failure says
  // how much of the batch came, so a stall reads apart from a slow call.
  waitForBatch() {
    clearTimeout(this.batchTimer);
    const since = Date.now();
    this.batchTimer = later(() => {
      const s = this.segment;
      if (s.expected == null && s.calls.length && !this.resultSubmitted) this.missingCount();
      else this.fail({ status: 502, message: `Cursor did not complete its declared native tool batch: ${s.calls.length} of ${s.expected ?? "?"} calls came, ${s.answered} answered here${this.stepCalls.completed ? `, ${this.stepCalls.completed} completed by Cursor` : ""}, none since ${Date.now() - since} ms` });
    }, this.limits.batchWait);
  }
  missingCount() {
    this.fail({ status: 502, message: "Cursor did not declare its native tool batch", retentionIneligible: !this.resultSubmitted });
  }
  // A call of the model's step the bridge answered itself: a refused tool (a
  // name it doesn't serve, Cursor's own tools) or get_mcp_tools. Cursor's
  // count is of every call the step made, so it counts toward the batch;
  // never handed to the caller (#142).
  answeredCall() {
    if (this.terminal || this.state === "awaiting-results") return;
    this.segment.answered++;
    if (this.batchTimer) this.waitForBatch();
    this.sealBatch();
  }
  // A call of the step Cursor completed by itself (plugins#550): in its
  // count, and never sent as an exec.
  completedByCursor() {
    if (this.terminal || this.state === "awaiting-results") return;
    if (this.batchTimer) this.waitForBatch();
    this.sealBatch();
  }
  // A checkpoint whose state waits on just the calls handed to the caller,
  // after the step's count came at the end of the step's calls, is a step
  // Cursor has finished: what more the count says will not come (plugins#550).
  // When the count was sent before or between the step's calls, a mid-batch
  // checkpoint after an early call has only the calls sent so far in
  // pending_tool_calls and must not seal the batch early before the
  // remaining calls arrive.
  waitedOn(data) {
    const s = this.segment;
    if (this.terminal || this.state === "awaiting-results" || s.closed || s.expected == null || !s.calls.length || !this.stepCalls.listedAfter) return;
    if (pendingCalls(data) !== s.calls.length) return;
    s.waitedOn = true;
    this.sealBatch();
  }
  listed(count) {
    if (!Number.isSafeInteger(count) || count < 1) invalid("invalid native tool count", 502);
    if (this.segment.expected != null && this.segment.expected !== count) {
      this.fail({ status: 502, message: "inconsistent native tool count", retentionIneligible: !this.resultSubmitted, continuityReason: "inconsistent-batch-count" });
      return;
    }
    this.segment.expected = count;
    this.stepCalls.listed();
    if (this.state === "awaiting-results") return;
    this.waitForBatch();
    this.sealBatch();
  }
  sealBatch() {
    const segment = this.segment;
    if (segment.expected == null) return;
    const made = segment.calls.length + segment.answered;
    if (made > segment.expected) invalid("native tool batch exceeded its declared count", 502);
    if (made + this.stepCalls.completed < segment.expected && !segment.waitedOn || segment.closed) return;
    if (!segment.calls.length) {
      segment.expected = null;
      segment.answered = 0;
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
      this.nextStep();
      return;
    }
    clearTimeout(this.batchTimer);
    this.batchTimer = null;
    this.state = "awaiting-results";
    this.quiet.pause();
    this.batches ??= [];
    this.batches.push(segment);
    for (const c of segment.calls) this.pool.handles.set(c.id, { owner: this, batch: segment });
    segment.finish({ stop: "tool_calls", usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      prompt_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
      magpie_native: { accounting: "pending" }
    } });
    this.segments++;
    this.resultTimer = later(() => this.fail({ status: 410, message: "native tool-result deadline expired" }, "expired"), this.limits.resultWait);
  }
  store(id, data) {
    if (!id.length) invalid("native blob ID is empty", 502);
    const key = id.toString("hex");
    if (this.knownHashes.has(key) && hash(data) !== key) invalid("native content-addressed bootstrap blob changed", 502);
    const size = this.blobSize - (this.blobs.get(key)?.length ?? 0) + data.length;
    if (size + (this.checkpoint?.bytes.length ?? 0) > this.limits.blobBytes) invalid("native blob retention limit reached", 503);
    this.blobs.set(key, Buffer.from(data));
    this.blobSize = size;
    this.validateCheckpoint();
  }
  checkpointReceived(data) {
    if (data.length + this.blobSize > this.limits.blobBytes) invalid("native checkpoint retention limit reached", 503);
    nativeFields(data);
    this.checkpoint = { bytes: Buffer.from(data), sequence: ++this.sequence, status: "incomplete", terminal: this.terminal };
    this.validateCheckpoint();
  }
  validateCheckpoint() {
    if (!this.checkpoint) return;
    const state = nativeFields(this.checkpoint.bytes);
    const missing = /* @__PURE__ */ new Set();
    let supported = true;
    const get = (id) => {
      const key = id.toString("hex");
      const b = this.blobs.get(key);
      if (!b) missing.add(key);
      return b;
    };
    const refs = /* @__PURE__ */ new Set([1, 3, 6, 7, 11, 13]);
    const known = new Set(Array.from({ length: 34 }, (_, i) => i + 1).filter((n) => n !== 2));
    const complex = /* @__PURE__ */ new Set([3, 6, 7, 11, 12, 13, 15, 16, 20, 24, 29, 30, 31, 32]);
    for (const f of state) {
      if (!known.has(f.num) || complex.has(f.num)) supported = false;
      if (refs.has(f.num) && f.data.length) get(f.data);
      if (f.num !== 8) continue;
      const turn = get(f.data);
      if (!turn) continue;
      const tf = nativeFields(turn);
      const agent = field2(tf, 1);
      if (!agent || tf.some((f2) => f2.num !== 1)) {
        supported = false;
        continue;
      }
      const agentFields = nativeFields(agent.data);
      if (!field2(agentFields, 1)?.data.length) supported = false;
      for (const a of agentFields) {
        if (a.num === 1) {
          const user = get(a.data);
          if (user) nativeFields(user);
        } else if (a.num === 2) {
          const step = get(a.data);
          if (step) {
            const sf = nativeFields(step);
            if (sf.length !== 1 || ![1, 2, 3].includes(sf[0].num)) supported = false;
            else {
              const stepFields = nativeFields(sf[0].data);
              if (sf[0].num === 2 && (stepFields.length !== 1 || stepFields[0].num !== 15)) supported = false;
            }
          }
        } else if (![3, 4, 5, 6].includes(a.num)) supported = false;
      }
    }
    this.checkpoint.missing = missing.size;
    this.checkpoint.status = !supported ? "unsupported" : missing.size ? "incomplete" : "complete";
    this.checkpoint.terminal = this.terminal;
  }
  terminalSeen(fields2) {
    if (this.segment.calls.length) invalid("Cursor ended a turn with unresolved native tool calls", 502);
    this.terminal = true;
    this.state = "finalizing";
    this.usageFields = fields2;
    if (this.checkpoint) this.checkpoint.terminal = true;
    clearTimeout(this.batchTimer);
    this.drainTimer = later(() => {
      Promise.resolve().then(() => this.complete()).catch((e) => this.fail(failureOf(e)));
    }, this.limits.drain);
  }
  complete() {
    if (this.completionTask) return this.completionTask;
    if (this.error || this.state === "complete") return;
    if (!this.terminal) invalid("native Run ended before TurnEnded or a complete final answer", 502);
    const { usageOf: usageOf2 } = this.wire;
    const turnInput = this.usageFields?.some((f) => [1, 3, 4].includes(f.num));
    const turnOutput = this.usageFields?.some((f) => f.num === 2);
    const last = this.lastStepUsage;
    const measuredInput = turnInput || !!last?.measuredInput;
    const measuredOutput = turnOutput || !!last?.measuredOutput;
    const u = usageOf2(this.usageFields ?? []);
    if (!turnInput && last?.measuredInput) Object.assign(u, { input: last.usage.input, cacheRead: last.usage.cacheRead, cacheWrite: last.usage.cacheWrite });
    if (!turnOutput && last?.measuredOutput) Object.assign(u, { output: last.usage.output, reasoning: last.usage.reasoning });
    if (!measuredInput) u.input = this.estimate;
    if (!measuredOutput) u.output = Math.floor((this.said + 3) / 4);
    let earlier = null;
    if (this.steps > 1) {
      if (last && (last.measuredInput || last.measuredOutput)) {
        const prev = [...this.stepUsages.values()].filter((e) => e !== last);
        const sum = (k) => prev.reduce((s, e) => s + e.usage[k], 0);
        const whole2 = u.input + u.cacheRead + u.cacheWrite;
        const share = (total, own2) => total > 0 ? Math.min(1, Math.max(own2, total / this.steps) / total) : 0;
        const fi = share(whole2, turnInput ? this.stepEstimate ?? 0 : whole2);
        const fo = share(u.output, Math.floor((this.said - this.stepSaid + 3) / 4));
        const own = {
          input: last.measuredInput ? last.usage.input : Math.round(u.input * fi),
          cacheRead: last.measuredInput ? last.usage.cacheRead : Math.round(u.cacheRead * fi),
          cacheWrite: last.measuredInput ? last.usage.cacheWrite : Math.round(u.cacheWrite * fi),
          output: last.measuredOutput ? last.usage.output : Math.round(u.output * fo),
          reasoning: last.hasReasoning ? last.usage.reasoning : last.measuredOutput ? Math.min(u.reasoning, last.usage.output) : Math.round(u.reasoning * fo)
        };
        earlier = {
          input: turnInput ? Math.max(0, u.input - own.input) : sum("input"),
          cacheRead: turnInput ? Math.max(0, u.cacheRead - own.cacheRead) : sum("cacheRead"),
          cacheWrite: turnInput ? Math.max(0, u.cacheWrite - own.cacheWrite) : sum("cacheWrite"),
          output: turnOutput ? Math.max(0, u.output - own.output) : sum("output")
        };
        Object.assign(u, own);
      } else {
        const whole2 = u.input + u.cacheRead + u.cacheWrite;
        const share = (total, own2) => total > 0 ? Math.min(1, Math.max(own2, total / this.steps) / total) : 0;
        const fi = share(whole2, measuredInput ? this.stepEstimate ?? 0 : whole2);
        const fo = share(u.output, Math.floor((this.said - this.stepSaid + 3) / 4));
        const own = {
          input: Math.round(u.input * fi),
          cacheRead: Math.round(u.cacheRead * fi),
          cacheWrite: Math.round(u.cacheWrite * fi),
          output: Math.round(u.output * fo),
          reasoning: Math.round(u.reasoning * fo)
        };
        earlier = { input: u.input - own.input, cacheRead: u.cacheRead - own.cacheRead, cacheWrite: u.cacheWrite - own.cacheWrite, output: u.output - own.output };
        Object.assign(u, own);
      }
    }
    const counted2 = this.accounting?.counted?.();
    if (counted2) for (const k of ["input", "cacheRead", "cacheWrite", "output"]) {
      const off = Math.min(earlier?.[k] ?? 0, counted2[k] ?? 0);
      if (earlier) earlier[k] -= off;
      u[k] = Math.max(0, u[k] - ((counted2[k] ?? 0) - off));
    }
    const prompt = u.input + u.cacheRead + u.cacheWrite;
    this.finalUsage = {
      prompt_tokens: prompt,
      completion_tokens: u.output,
      total_tokens: prompt + u.output,
      prompt_tokens_details: { cached_tokens: u.cacheRead, cache_write_tokens: u.cacheWrite },
      ...this.usageFields?.some((f) => f.num === 5) || last?.hasReasoning ? { completion_tokens_details: { reasoning_tokens: u.reasoning } } : {},
      ...!measuredInput || !measuredOutput ? { magpie_native: { accounting: "estimated" } } : {}
    };
    this.state = "finalizing";
    this.closeTransport();
    const finish = (settled) => {
      if (this.error) return;
      const more = earlier && settled ? Object.fromEntries(Object.keys(earlier).map((k) => [k, earlier[k] + settled[k]])) : earlier ?? settled;
      const deferred2 = more && more.input + more.output + more.cacheRead + more.cacheWrite > 0;
      this.segment.finish({ stop: "stop", usage: {
        ...this.finalUsage,
        ...deferred2 ? { magpie_deferred: {
          prompt_tokens: more.input + more.cacheRead + more.cacheWrite,
          completion_tokens: more.output,
          cached_tokens: more.cacheRead,
          cache_write_tokens: more.cacheWrite
        } } : {}
      } });
      this.state = "complete";
      this.pool.release(this);
      this.replayTimer = later(() => this.pool.forget(this), this.limits.replayWait);
    };
    if (!this.accounting) return finish(null);
    this.completionTask = this.accounting.settle().then(finish);
    return this.completionTask;
  }
  async pump(stream) {
    const { pb: pb2, exec: exec2, failure: failure3 } = this.wire;
    try {
      for await (const f of this.quiet.frames(stream)) {
        if (this.error || this.state === "complete") return;
        if (f.end) {
          const e = failure3(200, f.data);
          if (e.status < 200 || e.status > 299) throw new NativeSessionError(e.status, e.message);
          if (this.segment.calls.length && this.segment.expected == null) {
            this.missingCount();
            return;
          }
          if (!this.terminal && !this.segment.calls.length && this.segment.content) this.terminalSeen([]);
          await this.complete();
          return;
        }
        for (const m of nativeFields(f.data)) {
          switch (m.num) {
            case 1:
              for (const u of nativeFields(m.data)) {
                const uf = nativeFields(u.data);
                if (u.num === 1 || u.num === 4) {
                  const text = str(uf, 1);
                  if (this.terminal || this.state === "awaiting-results") invalid("native output arrived outside a running Chat segment", 502);
                  if (text) {
                    this.said += text.length;
                    if (u.num === 1) this.wrote += text.length;
                    this.segment.emit(u.num === 1 ? { text } : { reasoning: text });
                    if (this.batchTimer) this.waitForBatch();
                  }
                } else if (u.num === 14) {
                  if (!this.segment.content && !this.segment.calls.length) invalid("an empty reply (Cursor ended the turn without text or a tool call)", 502);
                  this.terminalSeen(uf);
                } else if (u.num === 31) {
                  this.modelCallCompleted(uf);
                } else if (u.num === 27) {
                  this.listed(num(uf, 1));
                  if (this.error) return;
                } else if (u.num === 13) {
                  if (this.batchTimer && !this.terminal && this.state !== "awaiting-results") this.waitForBatch();
                } else if ((u.num === 2 || u.num === 3 || u.num === 7) && this.stepCalls.update(u.num, uf)) {
                  this.completedByCursor();
                  if (this.error) return;
                }
              }
              break;
            case 2: {
              this.stepCalls.exec(m.data);
              const c = exec2(m.data, this.chatTools, (b) => this.send(b), (id) => this.execClose(id), null, true);
              if (c) this.acceptCall(c);
              else if (!nativeFields(m.data).some((e) => e.num === 10)) this.answeredCall();
              break;
            }
            case 3:
              this.checkpointReceived(m.data);
              this.waitedOn(m.data);
              break;
            case 4: {
              const kv = nativeFields(m.data);
              const id = num(kv, 1);
              for (const k of kv) {
                if (k.num === 2) {
                  const want = field2(nativeFields(k.data), 1)?.data.toString("hex") ?? "";
                  const b = this.blobs.get(want);
                  const res = b ? pb2().bytes(1, b) : pb2().bytes(2, pb2().str(1, "blob not found"));
                  await this.reply(pb2().bytes(3, pb2().varint(1, id).bytes(2, res)).done());
                } else if (k.num === 3) {
                  try {
                    const set = nativeFields(k.data);
                    this.store(field2(set, 1)?.data ?? Buffer.alloc(0), field2(set, 2)?.data ?? Buffer.alloc(0));
                  } catch (e) {
                    this.send(pb2().bytes(3, pb2().varint(1, id).bytes(3, pb2().bytes(1, pb2().str(1, "native blob could not be retained")))).done());
                    throw e;
                  }
                  await this.reply(pb2().bytes(3, pb2().varint(1, id).bytes(3, Buffer.alloc(0))).done());
                }
              }
              break;
            }
            case 5:
              for (const c of nativeFields(m.data)) if (c.num === 1) {
                const id = num(nativeFields(c.data), 1);
                const pending = this.execs.get(id);
                if (pending && !pending.submitted) invalid("Cursor cancelled a pending native tool exec; late results cannot be submitted", 410);
              }
              break;
            case 7:
              invalid("unsupported native interaction query", 502);
          }
        }
      }
      if (!this.error && this.state !== "complete") {
        if (this.terminal) await this.complete();
        else invalid("native reply broke off before completing its turn or tool batch: EOF", 502);
      }
    } catch (e) {
      if (!this.error && this.state !== "complete") this.fail(failureOf(e));
    }
  }
};
var nativeSessions = new NativeSessionPool();

// node_modules/.pnpm/@magpie-community+opencode-cursor-auth@0.2.44/node_modules/@magpie-community/opencode-cursor-auth/index.mjs
import { isDeepStrictEqual } from "node:util";
import http2 from "node:http2";
import { STATUS_CODES } from "node:http";
import { gunzipSync as gunzipSync3 } from "node:zlib";
import { Duplex } from "node:stream";
import { createHash as createHash9, randomBytes as randomBytes4, randomUUID as randomUUID5 } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile, stat, readdir, realpath, writeFile, mkdir, rename } from "node:fs/promises";
import { homedir, platform, tmpdir } from "node:os";
import { basename, dirname, join as join2 } from "node:path";
var ID = "cursor";
var API = "https://api2.cursor.sh";
var WEBSITE = "https://cursor.com";
var AGENT = "https://agentn.global.api5.cursor.sh";
var CHAT = "@ai-sdk/openai-compatible";
var VERSION_FALLBACK = "2026.09.23-86fc751";
var DEFAULT_CONTEXT = 2e5;
var MODELS_KEEP = 10 * 60 * 1e3;
var CALL = "CallDynamicTool";
var NO_RESULT = "Tool use was interrupted and did not produce a result.";
var CLI_MARK = "cursor-agent";
var GOOS = { win32: "windows" }[platform()] ?? platform();
var EMPTY = Buffer.alloc(0);
var enc = new TextEncoder();
var exists = (p) => stat(p).then((s) => !s.isDirectory(), () => false);
function run(file, args, { timeout = 1e4, env: env2 } = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { timeout, env: env2 ?? process.env, maxBuffer: 8 << 20 }, (err, stdout) => resolve({ ok: !err, out: String(stdout ?? ""), code: typeof err?.code === "number" ? err.code : err ? -1 : 0 }));
  });
}
async function cursorExecutable() {
  const dirs = (process.env.PATH ?? "").split(GOOS === "windows" ? ";" : ":").filter(Boolean);
  for (const name of ["cursor-agent", "agent"]) {
    for (const d of dirs) {
      const p = join2(d, GOOS === "windows" ? name + ".exe" : name);
      if (!await exists(p)) continue;
      if (name === "cursor-agent") return p;
      if ((await realpath(p).catch(() => "")).includes("cursor-agent")) return p;
    }
  }
  const home = homedir();
  for (const p of [join2(home, ".local", "bin", "cursor-agent"), "/usr/local/bin/cursor-agent", "/opt/homebrew/bin/cursor-agent"])
    if (await exists(p)) return p;
  return "";
}
var VERSION_RE = /^\d{4}\.\d{2}\.\d{2}-[0-9a-f]+$/;
var versionSaid = "";
async function clientVersion() {
  if (versionSaid) return versionSaid;
  let v = "";
  const exe = await cursorExecutable();
  if (exe) {
    const d = basename(dirname(await realpath(exe).catch(() => exe)));
    if (VERSION_RE.test(d)) v = d;
  }
  if (!v) {
    const dirs = [join2(homedir(), ".local", "share", "cursor-agent", "versions")];
    if (GOOS === "windows") dirs.push(join2(process.env.LOCALAPPDATA ?? "", "cursor-agent", "versions"));
    for (const dir of dirs)
      for (const n of await readdir(dir).catch(() => [])) if (VERSION_RE.test(n) && n > v) v = n;
  }
  versionSaid = "cli-" + (v || VERSION_FALLBACK);
  return versionSaid;
}
function authFile() {
  const home = homedir();
  if (GOOS === "windows") return join2(process.env.APPDATA || join2(home, "AppData", "Roaming"), "Cursor", "auth.json");
  if (GOOS === "darwin") return join2(home, ".cursor", "auth.json");
  return join2(process.env.XDG_CONFIG_HOME || join2(home, ".config"), "cursor", "auth.json");
}
function cliConfigFile() {
  const dir = process.env.CURSOR_CONFIG_DIR?.trim() || (process.env.XDG_CONFIG_HOME?.trim() ? join2(process.env.XDG_CONFIG_HOME, "cursor") : join2(homedir(), ".cursor"));
  return join2(dir, "cli-config.json");
}
function tokenSub(tok) {
  const parts = String(tok ?? "").split(".");
  if (parts.length !== 3) return "";
  try {
    const sub = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))?.sub;
    return typeof sub === "string" ? sub : "";
  } catch {
    return "";
  }
}
var teamOf = (v) => Number.isSafeInteger(v) && v > 0 ? v : void 0;
var TEAM_TTL = 1e4;
var teamRead = { at: 0, info: null };
async function activeTeamId(tok) {
  if (Date.now() - teamRead.at >= TEAM_TTL) {
    try {
      teamRead.info = JSON.parse(await readFile(cliConfigFile(), "utf8"))?.authInfo ?? null;
    } catch (e) {
      if (e?.code === "ENOENT") teamRead.info = null;
    }
    teamRead.at = Date.now();
  }
  const info = teamRead.info;
  if (!info) return void 0;
  if (!info.authId || info.authId !== tokenSub(tok)) return void 0;
  return teamOf(info.activeTeamId);
}
async function teamHeader(tok) {
  const id = await activeTeamId(tok);
  return id ? { "x-cursor-team-id": String(id) } : {};
}
async function teamBody(tok) {
  const id = await activeTeamId(tok);
  return id ? { teamId: id } : {};
}
var TOKEN_TTL = 1e4;
var KEYCHAIN_DENIED = 10 * 6e4;
var keychain = { tok: "", at: 0, ask: 0, busy: null, now: () => Date.now(), read: (args) => run("security", args) };
function keychainToken(fresh = false) {
  const go = async () => {
    const now = keychain.now();
    const ttl = !keychain.tok && now - keychain.ask < KEYCHAIN_DENIED ? KEYCHAIN_DENIED : TOKEN_TTL;
    if (!fresh && now - keychain.at < ttl) return keychain.tok;
    const r = await keychain.read(["find-generic-password", "-s", "cursor-access-token", "-a", "cursor-user", "-w"]);
    keychain.tok = "";
    keychain.at = keychain.now();
    if (r.ok) {
      keychain.tok = r.out.trim();
      keychain.ask = 0;
    } else if (r.code !== 44) {
      keychain.ask = keychain.at;
    } else keychain.ask = 0;
    return keychain.tok;
  };
  const p = (keychain.busy ?? Promise.resolve()).then(go, go);
  keychain.busy = p.catch(() => {
  });
  return p;
}
async function cliToken(fresh = false) {
  if (GOOS === "darwin") {
    const t = await keychainToken(fresh);
    if (t) return t;
  }
  try {
    return JSON.parse(await readFile(authFile(), "utf8"))?.accessToken ?? "";
  } catch {
    return "";
  }
}
function expiry(tok) {
  const parts = String(tok ?? "").split(".");
  if (parts.length !== 3) return 0;
  try {
    const exp = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))?.exp;
    return typeof exp === "number" && exp > 0 ? exp * 1e3 : 0;
  } catch {
    return 0;
  }
}
var SOON = 5 * 60 * 1e3;
var AuthError = class extends Error {
  constructor(msg) {
    super(msg);
    this.status = 401;
  }
};
var cliRefresh = null;
async function cliTokenNow() {
  let tok = await cliToken();
  const exp = expiry(tok);
  if (tok && (!exp || exp - Date.now() > SOON)) return tok;
  const exe = await cursorExecutable();
  if (exe) {
    cliRefresh ??= run(exe, ["status"], { timeout: 3e4 }).finally(() => cliRefresh = null);
    await cliRefresh;
    tok = await cliToken(true);
  }
  if (!tok) throw new AuthError("Cursor isn't signed in; sign in from magpie's Providers page or run `cursor-agent login`");
  const e = expiry(tok);
  if (e && e <= Date.now()) throw new AuthError("Cursor's sign-in has run out; sign in again from magpie's Providers page or run `cursor-agent login`");
  return tok;
}
async function headersFor(tok) {
  return {
    "Content-Type": "application/json",
    "Connect-Protocol-Version": "1",
    ...tok ? { Authorization: `Bearer ${tok}` } : {},
    "x-cursor-client-version": await clientVersion(),
    "x-cursor-client-type": "cli",
    "x-ghost-mode": "true",
    ...await teamHeader(tok)
  };
}
async function unary(base, path, tok, body = {}, timeout = 15e3) {
  const res = await fetch(base + "/" + path, {
    method: "POST",
    headers: await headersFor(tok),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeout)
  });
  const text = await res.text();
  if (!res.ok) {
    const f = failure2(res.status, text);
    const e = new Error(f.message);
    e.status = f.status;
    throw e;
  }
  return JSON.parse(text || "{}");
}
async function whoIs(tok) {
  const [me, plan] = await Promise.allSettled([
    unary(API, "aiserver.v1.DashboardService/GetMe", tok),
    unary(API, "aiserver.v1.DashboardService/GetPlanInfo", tok)
  ]);
  return {
    email: me.status === "fulfilled" ? String(me.value?.email ?? "").trim() : "",
    plan: plan.status === "fulfilled" ? String(plan.value?.planInfo?.planName ?? "").trim() : ""
  };
}
var plans = /* @__PURE__ */ new Map();
var PLAN_TTL = 36e5;
var PERIODS = { INCLUDED_USAGE_PERIOD_WEEKLY: "weekly", INCLUDED_USAGE_PERIOD_MONTHLY: "monthly", 1: "monthly", 2: "weekly" };
async function planOf(tok) {
  const had = plans.get(tok);
  if (had && Date.now() - had.at < PLAN_TTL) return had;
  try {
    const info = await unary(API, "aiserver.v1.DashboardService/GetPlanInfo", tok);
    const plan = String(info?.planInfo?.planName ?? "").trim();
    const got = { plan: plan || had?.plan || "", merged: info?.isMerged === true, period: PERIODS[info?.planInfo?.includedUsagePeriod] ?? "", at: Date.now() };
    if (plan || got.merged) plans.set(tok, got);
    return got;
  } catch {
    return had ?? { plan: "" };
  }
}
var exchanged = /* @__PURE__ */ new Map();
async function keyToken(key) {
  const h = createHash9("sha256").update(key).digest("hex");
  const had = exchanged.get(h);
  if (had && (!had.exp || had.exp - Date.now() > SOON)) return had.tok;
  const res = await fetch(API + "/auth/exchange_user_api_key", {
    method: "POST",
    headers: { ...await headersFor(key), "Connect-Protocol-Version": void 0 },
    body: "{}",
    signal: AbortSignal.timeout(15e3)
  }).catch((e) => {
    throw Object.assign(new Error("couldn't reach Cursor's API: " + e.message), { status: 502 });
  });
  if (res.status >= 500) throw Object.assign(new Error(`exchange_user_api_key: HTTP ${res.status}`), { status: 502 });
  const j = res.ok ? await res.json().catch(() => null) : null;
  if (!j?.accessToken) throw new AuthError("Cursor didn't take this API key");
  exchanged.set(h, { tok: j.accessToken, exp: expiry(j.accessToken) });
  return j.accessToken;
}
async function tokenOf(auth) {
  if (auth?.type === "api" && auth.key) return keyToken(auth.key);
  if (auth?.type !== "oauth") throw new AuthError("Cursor isn't signed in");
  if (auth.refresh === CLI_MARK) return cliTokenNow();
  const exp = auth.expires || expiry(auth.access);
  if (!auth.access) throw new AuthError("Cursor isn't signed in");
  if (exp && exp <= Date.now()) throw new AuthError("Cursor's sign-in has run out; sign in to Cursor again");
  return auth.access;
}
async function browserSignIn() {
  const verifier = randomBytes4(32).toString("base64url");
  const challenge = createHash9("sha256").update(verifier).digest("base64url");
  const uuid2 = randomUUID5();
  const url = new URL("/loginDeepControl", WEBSITE);
  url.searchParams.set("challenge", challenge);
  url.searchParams.set("uuid", uuid2);
  url.searchParams.set("mode", "login");
  url.searchParams.set("redirectTarget", "cli");
  return {
    url: url.toString(),
    instructions: "Sign in to Cursor in the browser; this finishes by itself.",
    method: "auto",
    async callback() {
      const headers2 = { "Content-Type": "application/json", "x-cursor-client-version": await clientVersion(), "x-cursor-client-type": "cli" };
      let errors = 0;
      for (let r = 0; r < 150; r++) {
        const wait = Math.min(1e3 * 1.2 ** r, 1e4);
        let res;
        try {
          res = await fetch(`${API}/auth/poll?uuid=${uuid2}&verifier=${verifier}`, { headers: headers2, signal: AbortSignal.timeout(15e3) });
        } catch {
          if (++errors >= 3) return { type: "failed", error: "couldn't reach Cursor" };
          await sleep(wait);
          continue;
        }
        if (res.status === 404) {
          errors = 0;
          await sleep(wait);
          continue;
        }
        if (!res.ok) {
          if (res.status === 403 || ++errors >= 3) return { type: "failed", error: res.status === 403 ? "Cursor refused the sign-in (403)" : `Cursor's sign-in answered HTTP ${res.status}` };
          await sleep(wait);
          continue;
        }
        const j = await res.json().catch(() => null);
        if (!j?.accessToken || !("refreshToken" in j)) return { type: "failed", error: "Cursor sent back no token" };
        const who = await whoIs(j.accessToken);
        return {
          type: "success",
          access: j.accessToken,
          refresh: j.refreshToken || "none",
          expires: expiry(j.accessToken) || Date.now() + 30 * 24 * 3600 * 1e3,
          ...who.email ? { accountId: who.email } : {},
          ...who.plan ? { plan: who.plan } : {}
        };
      }
      return { type: "failed", error: "the sign-in timed out" };
    }
  };
}
async function cliSignIn() {
  return {
    url: "",
    instructions: "Uses the account `cursor-agent login` signed in to.",
    method: "auto",
    async callback() {
      const tok = await cliToken(true);
      const exp = expiry(tok);
      if (!tok) return { type: "failed", error: "cursor-agent isn't signed in: run `cursor-agent login`" };
      if (exp && exp <= Date.now()) return { type: "failed", error: "cursor-agent's sign-in has run out: run `cursor-agent login` again" };
      const who = await whoIs(tok);
      if (!who.email) return { type: "failed", error: "Cursor couldn't say which account is signed in" };
      return { type: "success", access: "", refresh: CLI_MARK, expires: 0, accountId: who.email, ...who.plan ? { plan: who.plan } : {} };
    }
  };
}
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var statusText = (s) => ({ 413: "Request Entity Too Large", 414: "Request URI Too Long", 416: "Requested Range Not Satisfiable", 418: "I'm a teapot", 509: "" })[s] ?? STATUS_CODES[s] ?? "";
var POOL_VARIANT = /-(fast|none|low|medium|high|xhigh|extra-high|max|thinking)$/;
function poolBase(model) {
  model = String(model).trim().toLowerCase().replace(/@[^@]*$/, "");
  if (model.startsWith("cursor-")) model = model.slice("cursor-".length);
  for (; ; ) {
    const b = model.replace(POOL_VARIANT, "");
    if (b === model) return model;
    model = b;
  }
}
function firstParty(model) {
  model = model.replace(/@[^@]*$/, "");
  if (model.startsWith("cursor-")) model = model.slice("cursor-".length);
  if (model === "default" || model === "composer" || model.startsWith("composer-")) return true;
  return ["grok-4.5", "grok-4.6", "grok-4.7"].some((b) => model === b || model.startsWith(b + "-"));
}
function onDemandOf(data, hard) {
  const s = data?.spendLimitUsage;
  const usedDollars = Number(s?.individualUsed ?? 0) / 100;
  const own = s?.individualLimit === void 0 ? void 0 : Number(s.individualLimit) > 0 ? { kind: "fixed", usedDollars, limitDollars: Number(s.individualLimit) / 100 } : { kind: "disabled", usedDollars };
  if (s?.limitType === "team") {
    if (own) return own;
    if (hard && (hard.noUsageBasedAllowed || !(Number(hard.hardLimit) > 0))) return { kind: "disabled", usedDollars };
    const pool = Number(s.pooledLimit ?? 0);
    if (pool > 0) return { kind: "fixed", usedDollars: Number(s.pooledUsed ?? 0) / 100, limitDollars: pool / 100, mineDollars: usedDollars };
    return hard ? { kind: "unlimited", usedDollars } : { kind: "unavailable", usedDollars };
  }
  if (!hard) return own ?? { kind: "unavailable", usedDollars };
  if (hard.noUsageBasedAllowed) return { kind: "disabled", usedDollars };
  const limit = Number(hard.hardLimit ?? 0);
  if (limit >= 2147483647) return { kind: "unlimited", usedDollars };
  return limit > 0 ? { kind: "fixed", usedDollars, limitDollars: limit } : { kind: "disabled", usedDollars };
}
async function hardLimit(tok) {
  try {
    const res = await fetch(API + "/aiserver.v1.DashboardService/GetHardLimit", {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", "Connect-Protocol-Version": "1", ...await teamHeader(tok) },
      body: "{}",
      signal: AbortSignal.timeout(15e3)
    });
    return res.ok ? await res.json() ?? void 0 : void 0;
  } catch {
    return void 0;
  }
}
var dollars = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
async function creditGrants(tok) {
  try {
    const res = await fetch(API + "/aiserver.v1.DashboardService/GetUsageLimitStatusAndActiveGrants", {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", "Connect-Protocol-Version": "1", ...await teamHeader(tok) },
      body: "{}",
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) return [];
    const g = (await res.json())?.activeGrants;
    return Array.isArray(g) ? g : [];
  } catch {
    return [];
  }
}
var tagOf = (s) => String(s).toLowerCase().replace(/-/g, ".");
function credits(plan, grants, ids, resets, now = Date.now()) {
  const windows = [];
  const covers = /* @__PURE__ */ new Set();
  let all = false;
  const bonus = Number(plan?.bonusSpend ?? 0) / 100;
  if (bonus > 0 || plan?.remainingBonus === true) {
    windows.push({ name: "Free usage", used: 0, display: `+${dollars(bonus)} on us` + (plan?.remainingBonus === true ? ", more left" : ""), ...resets, aside: true });
    if (plan?.remainingBonus === true) all = true;
  }
  for (const g of grants) {
    const total = Number(g?.totalCents ?? 0) / 100;
    const left = Math.max(0, Number(g?.remainingCents ?? 0) / 100);
    if (!(total > 0) || !Number.isFinite(total) || !Number.isFinite(left)) continue;
    const exp = Number(g.expiresAtMs ?? 0);
    if (exp > 0 && exp <= now) continue;
    const clients = (g.allowedClientTypes ?? []).map(String);
    const mine2 = clients.length === 0 || clients.includes("cli");
    const named2 = [...g.allowedModelIds ?? [], ...(g.allowedModelSelections ?? []).map((m) => m?.modelId).filter(Boolean)].map(String);
    const tags = (g.allowedModelTags ?? []).map(String);
    const limited = named2.length > 0 || tags.length > 0;
    const bases = new Set(named2.map((m) => poolBase(m) === "auto" ? "default" : poolBase(m)));
    const fits = (id) => {
      const b = poolBase(id) === "auto" ? "default" : poolBase(id);
      return bases.has(b) || tags.some((t) => tagOf(id).includes(tagOf(t)));
    };
    const matched = limited ? ids.filter(fits) : [];
    const name = (String(g.campaignName ?? "").trim() || "Free credit") + (mine2 ? "" : clients.includes("glass") && !clients.includes("ide") ? " (Cloud Agents only)" : ` (${clients.join(", ")} only)`);
    windows.push({
      name,
      used: Math.max(0, Math.min(100, 100 * (total - left) / total)),
      display: `${dollars(total - left)} / ${dollars(total)}`,
      amount: total - left,
      limit: total,
      unit: "USD",
      ...exp > 0 ? { runsOutAt: new Date(exp).toISOString(), runsOut: left } : {},
      ...limited ? { models: matched.length ? matched : [...named2, ...tags] } : {},
      aside: true
    });
    if (!mine2 || !(left > 0)) continue;
    if (!limited) all = true;
    else for (const id of matched) covers.add(id);
  }
  return { windows, all, covers };
}
var INCLUDED_ONLY = "included_only";
var WIRE_TRACE = "wire_trace";
async function enterpriseUsage(tok, includedOnly = false) {
  try {
    const subject = JSON.parse(Buffer.from(tok.split(".")[1], "base64url").toString()).sub;
    if (typeof subject !== "string") return void 0;
    const user = subject.split("|").filter(Boolean).at(-1);
    if (!user || !/^[a-zA-Z0-9._-]+$/.test(user)) return void 0;
    const res = await fetch(WEBSITE + "/api/usage-summary", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Origin: WEBSITE,
        Cookie: "WorkosCursorSessionToken=" + encodeURIComponent(user + "::" + tok)
      },
      redirect: "error",
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) return void 0;
    const data = await res.json();
    if (String(data?.membershipType).toLowerCase() !== "enterprise") return void 0;
    const overall = data?.individualUsage?.overall;
    if (overall?.enabled !== true) return void 0;
    const { used, limit } = overall;
    if (typeof used !== "number" || !Number.isFinite(used) || used < 0) return void 0;
    if (typeof limit !== "number" || !Number.isFinite(limit) || limit <= 0) return void 0;
    const end = Date.parse(data.billingCycleEnd ?? "");
    const resets = Number.isFinite(end) ? { resetsAt: new Date(end).toISOString() } : {};
    const od = data.teamUsage?.onDemand;
    const spent = typeof od?.used === "number" && Number.isFinite(od.used) && od.used >= 0;
    const unlimited = od?.enabled === true && od.limit === null;
    const fixed = od?.enabled === true && typeof od.limit === "number" && Number.isFinite(od.limit) && od.limit > 0 && spent;
    const aside = !includedOnly && (unlimited || fixed && od.used < od.limit);
    const windows = [{
      name: "Enterprise",
      used: Math.max(0, Math.min(100, 100 * used / limit)),
      display: `${dollars(used / 100)} / ${dollars(limit / 100)}`,
      amount: used / 100,
      limit: limit / 100,
      unit: "USD",
      ...resets,
      ...aside ? { aside: true } : {}
    }];
    if (fixed) windows.push({
      name: "On-demand",
      used: Math.min(100, 100 * od.used / od.limit),
      display: `${dollars(od.used / 100)} / ${dollars(od.limit / 100)}`,
      amount: od.used / 100,
      limit: od.limit / 100,
      unit: "USD",
      ...resets,
      ...includedOnly ? { aside: true } : {}
    });
    else if (unlimited && spent) windows.push({ name: "On-demand", used: 0, display: dollars(od.used / 100), ...resets, aside: true });
    return windows;
  } catch {
    return void 0;
  }
}
async function usage(tok, ids, includedOnly = false, plan = void 0) {
  const [res, hard] = await Promise.all([
    fetch(API + "/aiserver.v1.DashboardService/GetCurrentPeriodUsage", {
      method: "POST",
      headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json", "Connect-Protocol-Version": "1", ...await teamHeader(tok) },
      body: "{}",
      signal: AbortSignal.timeout(15e3)
    }),
    hardLimit(tok)
  ]);
  const grants = creditGrants(tok);
  if (!res.ok) return { error: statusText(res.status), windows: [] };
  const data = await res.json();
  const u = data?.planUsage;
  if (!u) {
    const windows = await enterpriseUsage(tok, includedOnly);
    return { windows: windows ?? [], credits: credits(void 0, await grants, ids, {}).windows };
  }
  const ms = /^[+-]?\d+$/.test(data.billingCycleEnd ?? "") ? Number(data.billingCycleEnd) : 0;
  const resets = ms > 0 ? { resetsAt: new Date(ms).toISOString() } : {};
  const bucket = new Set((data.autoBucketModels ?? []).map(poolBase));
  const inPool = (model) => {
    model = poolBase(model);
    if (model === "auto") model = "default";
    return bucket.has(model) || firstParty(model);
  };
  const asked = ids.flatMap((id) => [id, id.replace(/@[^@]*$/, "")]);
  const pool = [.../* @__PURE__ */ new Set(["auto", ...asked, ...data.autoBucketModels ?? []])].filter(inPool);
  const num2 = (v) => typeof v === "number" ? v : 0;
  const od = onDemandOf(data, hard);
  const free = credits(u, await grants, [...new Set(asked)], resets);
  const pooled = !includedOnly && (od.kind === "fixed" || od.kind === "unlimited" || free.all) ? { aside: true } : {};
  const covers = includedOnly ? /* @__PURE__ */ new Set() : free.covers;
  const onDemand = od.kind === "fixed" ? [{ name: "On-demand", used: Math.max(0, Math.min(100, 100 * od.usedDollars / od.limitDollars)), display: `${dollars(od.usedDollars)} / ${dollars(od.limitDollars)}` + (od.mineDollars === void 0 ? "" : ` (you: ${dollars(od.mineDollars)})`), ...resets, ...includedOnly || free.all ? { aside: true } : {} }] : od.kind === "unlimited" ? [{ name: "On-demand", used: 0, display: dollars(od.usedDollars), ...resets, aside: true }] : [];
  const info = await plan;
  const spent = (used) => covers.size > 0 && !pooled.aside && used >= 100;
  if (info?.merged === true) {
    const weekly = info.period === "weekly";
    const used = num2(u.totalPercentUsed);
    return {
      windows: [
        { name: weekly ? "Weekly" : info.period === "monthly" ? "Monthly" : "Included", used, ...resets, ...weekly ? { span: 604800 } : {}, ...spent(used) ? { notModels: [...covers] } : {}, ...pooled },
        ...onDemand
      ],
      credits: free.windows
    };
  }
  const auto = num2(u.autoPercentUsed), api = num2(u.apiPercentUsed);
  const cursorModels = spent(auto) ? pool.filter((m) => !covers.has(m)) : pool;
  return {
    windows: [
      { name: "Cursor Models", used: auto, ...resets, models: cursorModels.length ? cursorModels : pool, ...cursorModels.length ? pooled : { aside: true } },
      { name: "Other Models", used: api, ...resets, notModels: spent(api) ? [.../* @__PURE__ */ new Set([...pool, ...covers])] : pool, ...pooled },
      ...onDemand,
      { name: "Total", used: num2(u.totalPercentUsed), ...resets, aside: true }
    ],
    credits: free.windows
  };
}
async function botUsage(tok) {
  try {
    const subject = JSON.parse(Buffer.from(tok.split(".")[1], "base64url").toString()).sub;
    if (typeof subject !== "string") return [];
    const user = subject.split("|").filter(Boolean).at(-1);
    if (!user || !/^[a-zA-Z0-9._-]+$/.test(user)) return [];
    const res = await fetch(WEBSITE + "/api/dashboard/get-sand-usage-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: WEBSITE,
        Cookie: "WorkosCursorSessionToken=" + encodeURIComponent(user + "::" + tok)
      },
      body: "{}",
      redirect: "error",
      signal: AbortSignal.timeout(5e3)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const paid = typeof data?.includedLimitZero === "boolean" ? !data.includedLimitZero : data?.hasNonZeroIncludedLimit === true;
    const trial = !paid && typeof data?.sandTrialExpiresAt === "string" && Date.parse(data.sandTrialExpiresAt) > Date.now();
    if (!paid && !trial || typeof data?.usagePercent !== "number" || !Number.isFinite(data.usagePercent)) return [];
    const reset = paid && typeof data.nextResetTimestampUtc === "string" ? Date.parse(data.nextResetTimestampUtc) : NaN;
    return [{
      name: trial ? "Grok Bot (trial)" : "Grok Bot",
      used: Math.max(0, Math.min(100, data.usagePercent)),
      aside: true,
      // Bot exhaustion must not stop Cursor model requests.
      ...Number.isFinite(reset) ? { resetsAt: new Date(reset).toISOString(), span: 604800 } : {}
    }];
  } catch {
    return [];
  }
}
var LEVEL_RANK = ["none", "minimal", "low", "medium", "high", "xhigh", "max"];
var EFFORT_PARAMS = ["effort", "reasoning_effort", "reasoning"];
var ID_EFFORTS = [["extra-high", "xhigh"], ["xhigh", "xhigh"], ["minimal", "minimal"], ["none", "none"], ["low", "low"], ["medium", "medium"], ["high", "high"], ["max", "max"]];
var cut = (s, suffix) => s.endsWith(suffix) && s.length > suffix.length ? s.slice(0, -suffix.length) : null;
function splitID(id) {
  let s = id;
  let fast = false;
  let thinking = false;
  let effort = "";
  let b;
  if ((b = cut(s, "-fast")) !== null) [s, fast] = [b, true];
  if ((b = cut(s, "-thinking")) !== null) [s, thinking] = [b, true];
  for (const [word, level] of ID_EFFORTS) {
    if ((b = cut(s, "-" + word)) !== null) {
      ;
      [s, effort] = [b, level];
      break;
    }
  }
  if (!thinking && (b = cut(s, "-thinking")) !== null) [s, thinking] = [b, true];
  if (thinking) s += "-thinking";
  if (fast) s += "-fast";
  return [s, effort];
}
var PICKER_SKIP = /* @__PURE__ */ new Set(["claude-4.5-haiku", "claude-4.5-haiku-thinking", "gemini-2.5-pro", "gemini-2.5-flash", "claude-haiku-4-5"]);
var clean = (s) => String(s ?? "").replaceAll("\u200B", "").split(/\s+/).filter(Boolean).join(" ");
function tokensOf(value) {
  const m = /^(\d+(?:\.\d+)?)([km])$/i.exec(String(value ?? "").trim());
  return m ? Math.round(Number(m[1]) * (m[2].toLowerCase() === "m" ? 1e6 : 1e3)) : 0;
}
function paramDefs(m) {
  const out = {};
  for (const d of m.parameterDefinitions ?? []) {
    const t = d?.parameterType ?? {};
    const vs = (t.enumParameter ?? t.booleanParameter)?.values ?? [];
    if (d?.id) out[d.id] = vs.map((v) => String(v.value));
  }
  return out;
}
var valuesOf = (v) => Object.fromEntries((v?.parameterValues ?? []).map((p) => [String(p.id), String(p.value)]));
var defaultVariant = (m) => {
  const vs = m?.variants ?? [];
  return vs.find((v) => v.isDefaultNonMaxConfig) ?? vs.find((v) => v.isDefaultMaxConfig) ?? vs[0];
};
var needsMax = (m, v) => m?.supportsNonMaxMode === false || v?.isMaxMode === true;
function effortsOf(defs) {
  const pid = EFFORT_PARAMS.find((p) => defs[p]?.length);
  if (!pid && defs.thinking?.includes("true") && defs.thinking.includes("false")) return { pid: "thinking", levels: { none: "false", high: "true" } };
  if (!pid) return { pid: "", levels: {} };
  const levels = {};
  for (const v of defs[pid]) {
    const l = v === "extra-high" ? "xhigh" : v;
    if (LEVEL_RANK.includes(l)) levels[l] = v;
  }
  return { pid, levels };
}
function served(m, ids) {
  const vs = m.variants ?? [];
  if (!ids) return vs;
  const got = vs.filter((v) => !v.legacySlug || ids.has(v.legacySlug));
  return got.some((v) => v.legacySlug) ? got : vs;
}
function familyOf(id) {
  let [family, effort] = splitID(id);
  const fast = family.endsWith("-fast") && family.length > "-fast".length;
  if (fast) family = family.slice(0, -"-fast".length);
  return { family, effort, fast };
}
function familiesOf(listed) {
  const fams = /* @__PURE__ */ new Map();
  for (const u of listed ?? []) {
    const id = String(u?.modelId ?? "");
    if (!id) continue;
    const { family, effort, fast } = familyOf(id);
    if (!fams.has(family)) fams.set(family, []);
    fams.get(family).push({ id, effort, fast, maxMode: u.maxMode === true, name: clean(u.displayName || id) });
  }
  return fams;
}
function fromUsable(fam, effort, fast) {
  let vs = fam.filter((u) => u.fast === !!fast);
  if (!vs.length) vs = fam;
  if (effort === "off") effort = "none";
  const at = effort ? fitEffort(effort, vs.map((u) => u.effort).filter(Boolean)) : "";
  return at && vs.find((u) => u.effort === at) || vs.find((u) => u.effort === "") || vs.find((u) => u.effort === "medium") || vs[0];
}
var EFFORT_WORDS = { none: ["None"], minimal: ["Minimal"], low: ["Low"], medium: ["Medium"], high: ["High"], xhigh: ["Extra High", "XHigh"], max: ["Max"] };
function usableTitle(u) {
  const ws = u.name.split(" ");
  const cutLast = (phrase) => {
    const p = phrase.toLowerCase().split(" ");
    for (let i = ws.length - p.length; i >= 1; i--) {
      if (p.every((w, k) => ws[i + k].toLowerCase() === w)) {
        ws.splice(i, p.length);
        return true;
      }
    }
    return false;
  };
  for (const p of EFFORT_WORDS[u.effort] ?? []) if (cutLast(p)) break;
  if (u.fast) cutLast("fast");
  return ws.filter((w, i) => i === 0 || !/^\(?1m\)?$/i.test(w)).join(" ") || u.name;
}
function modelsOf(picker, ids, listed = []) {
  const out = [];
  const used = /* @__PURE__ */ new Set();
  const fams = familiesOf(listed);
  const named2 = /* @__PURE__ */ new Set();
  for (const m of picker) {
    if (!m?.name) continue;
    for (const x of [m.name, ...m.legacySlugs ?? [], ...m.idAliases ?? [], ...(m.variants ?? []).map((v) => v.legacySlug)]) if (x) named2.add(x);
  }
  for (const m of picker) {
    if (!m?.name || m.isHidden || m.isChatOnly || m.onlySupportsCmdK || m.supportsAgent === false || PICKER_SKIP.has(m.name)) continue;
    const defs = paramDefs(m);
    const variants = served(m, ids);
    const partial = variants.length < (m.variants ?? []).length;
    const has = (pid2, value) => !partial || !variants.some((v) => pid2 in valuesOf(v)) || variants.some((v) => valuesOf(v)[pid2] === value);
    const def = defaultVariant({ variants });
    const { pid, levels: all } = effortsOf(defs);
    const levels = Object.fromEntries(Object.entries(all).filter(([, value]) => has(pid, value)));
    const own = familyOf(def?.legacySlug || m.name).family;
    const bare = own.replace(/-thinking$/, "");
    const fam = fams.get(own) ?? fams.get(bare) ?? fams.get(bare + "-thinking") ?? [];
    const base = { run: m.name, title: clean(m.clientDisplayName || m.name), pid, levels, fast: !!defs.fast?.length, variants, def, partial, model: m, fam, ids };
    const contexts = (defs.context ?? []).filter((c) => has("context", c));
    if (contexts.length) {
      for (const c of contexts) {
        const id = m.name + "@" + c;
        if (used.has(id)) continue;
        used.add(id);
        out.push({ ...base, id, name: base.title + " @ " + c, context: tokensOf(c) || DEFAULT_CONTEXT, size: c, offersFast: fastAt(variants, c) });
      }
    } else if (!used.has(m.name)) {
      used.add(m.name);
      const limit = needsMax(m, def) ? m.contextTokenLimitForMaxMode || m.contextTokenLimit : m.contextTokenLimit;
      out.push({ ...base, id: m.name === "default" ? "auto" : m.name, name: base.title, context: limit > 0 ? limit : DEFAULT_CONTEXT, size: "", offersFast: fastAt(variants, "") });
    }
  }
  for (const [family, fam] of fams) {
    if (fam.some((u) => named2.has(u.id)) || named2.has(family) || used.has(family)) continue;
    used.add(family);
    const levels = Object.fromEntries(fam.filter((u) => LEVEL_RANK.includes(u.effort)).map((u) => [u.effort, u.effort]));
    const def = fromUsable(fam, "", false);
    out.push({ id: family, run: family, name: usableTitle(def), title: usableTitle(def), pid: "", levels, fast: false, variants: [], def: void 0, partial: false, model: { name: family }, fam, ids, usableOnly: true, context: DEFAULT_CONTEXT, size: "", offersFast: fam.some((u) => u.fast) });
  }
  return out;
}
function slugFor(m, v) {
  if (v.legacySlug) return v.legacySlug;
  const have = valuesOf(v);
  const level = (p) => String(p[EFFORT_PARAMS.find((k) => p[k])] ?? "").replace("extra-high", "xhigh");
  const effort = level(have);
  const slugs = (Array.isArray(m.legacySlugs) ? m.legacySlugs : []).filter((id) => typeof id === "string" && id).map((id) => ({ id, ...familyOf(id) }));
  const says = (s, at) => (at === null || s.effort === at) && (have.thinking === void 0 || s.family.endsWith("-thinking") === (have.thinking === "true")) && (have.fast === void 0 || s.fast === (have.fast === "true"));
  let hits = slugs.filter((s) => says(s, effort || null));
  const def = m.variants.find((x) => x?.isDefaultNonMaxConfig);
  if (!hits.length && effort && level(valuesOf(def)) === effort) hits = slugs.filter((s) => says(s, ""));
  return hits.length === 1 ? hits[0].id : "";
}
var NO_ID = "\0no-id";
function withSlugs(m) {
  const defined = new Set((Array.isArray(m.parameterDefinitions) ? m.parameterDefinitions : []).map((d) => d?.id));
  const vs = (Array.isArray(m.variants) ? m.variants : []).filter((v) => v && typeof v === "object" && Array.isArray(v.parameterValues ?? [])).map((v) => ({ ...v, parameterValues: (v.parameterValues ?? []).filter((p) => defined.has(p?.id)) }));
  const full = { ...m, variants: vs };
  return { ...full, variants: vs.map((v) => v.legacySlug ? v : { ...v, legacySlug: slugFor(full, v) || NO_ID }) };
}
function fromCatalog(picker, catalog2, ids) {
  const have = new Set(picker.map((m) => m?.name));
  const out = [];
  for (const m of Array.isArray(catalog2) ? catalog2 : []) {
    if (!m?.name || have.has(m.name) || m.isHidden || m.name === "default") continue;
    if (m.vendor?.id !== "MODEL_VENDOR_ID_ANTHROPIC") continue;
    if (m.isChatOnly || m.onlySupportsCmdK || m.supportsAgent === false || PICKER_SKIP.has(m.name)) continue;
    const full = withSlugs(m);
    if (full.variants.some((v) => ids.has(v.legacySlug))) out.push(full);
  }
  return out;
}
var fastAt = (variants, size) => variants.some((v) => {
  const have = valuesOf(v);
  return have.fast === "true" && (!size || have.context === void 0 || have.context === size);
});
function nearest(vs, want) {
  let best;
  let most = -1;
  for (const v of vs) {
    const have = valuesOf(v);
    const n = Object.keys(want).filter((k) => have[k] === want[k]).length + (have.context === want.context ? 100 : 0);
    if (n > most) [best, most] = [v, n];
  }
  return best;
}
function pick(entry, effort, fast, seed) {
  if (entry.usableOnly) {
    const u = fromUsable(entry.fam, effort, fast);
    return { id: u.id, params: [], maxMode: u.maxMode };
  }
  const def = entry.def;
  const want = { ...valuesOf(seed ?? def) };
  if (entry.size) want.context = entry.size;
  if (effort === "off") effort = "none";
  if (entry.pid && entry.pid !== "thinking" && effort === "none" && !("none" in entry.levels) && "thinking" in want) {
    want.thinking = "false";
  } else if (entry.pid) {
    const at = effort ? fitEffort(effort, Object.keys(entry.levels)) : "";
    if (at && entry.levels[at]) want[entry.pid] = entry.levels[at];
    if (!seed && entry.pid !== "thinking" && "thinking" in want && at) want.thinking = "true";
  }
  if (entry.fast) want.fast = fast ? "true" : "false";
  const same = (v2) => {
    const have = valuesOf(v2);
    return Object.keys({ ...have, ...want }).every((k) => have[k] === void 0 || want[k] === void 0 || have[k] === want[k]);
  };
  const v = entry.variants.find(same) ?? (seed ? branch(entry, want) : void 0) ?? (entry.partial ? nearest(entry.variants, want) : void 0);
  const params = Object.entries(v ? { ...want, ...valuesOf(v) } : want).map(([id2, value]) => ({ id: id2, value }));
  const maxMode = v ? needsMax(entry.model, v) : needsMax(entry.model, def) || tokensOf(entry.size) > (entry.model.contextTokenLimit || Infinity);
  const id = v?.legacySlug || def?.legacySlug || entry.run;
  if (entry.ids && !entry.ids.has(id) && entry.fam?.length) {
    const level = entry.pid && entry.pid !== "thinking" ? String(want[entry.pid] ?? "").replace("extra-high", "xhigh") : "";
    const u = fromUsable(entry.fam, effort || level, fast);
    return { id: u.id, params: [], maxMode: maxMode || u.maxMode };
  }
  return { id, params, maxMode };
}
function branch(entry, want) {
  if (!entry.pid || entry.pid === "thinking") return void 0;
  const level = (x) => x === "extra-high" ? "xhigh" : x;
  const def = valuesOf(entry.def);
  const named2 = entry.variants.some((v) => level(valuesOf(v)[entry.pid]) === level(want[entry.pid]));
  if (!named2 && Object.keys(want).every((k) => k === entry.pid || k === "context" || def[k] === void 0 || def[k] === want[k])) return void 0;
  const vs = entry.variants.filter((v) => {
    const have = valuesOf(v);
    return entry.pid in have && Object.keys(want).every((k) => k === entry.pid || have[k] === void 0 || have[k] === want[k]);
  });
  const at = fitEffort(level(want[entry.pid]), vs.map((v) => level(valuesOf(v)[entry.pid])));
  return at ? vs.find((v) => level(valuesOf(v)[entry.pid]) === at) : void 0;
}
function fitEffort(want, levels) {
  if (want === "ultra") want = "max";
  if (!levels.length || levels.includes(want)) return want;
  const at = LEVEL_RANK.indexOf(want);
  if (at < 0) return "";
  let best = "";
  let dist = LEVEL_RANK.length;
  for (const l of levels) {
    const i = LEVEL_RANK.indexOf(l);
    if (i < 0 || l === "none") continue;
    const d = Math.abs(i - at);
    if (d < dist || d === dist && i > at) [best, dist] = [l, d];
  }
  return best;
}
var lists = /* @__PURE__ */ new Map();
var listings = /* @__PURE__ */ new Map();
var listFailed = /* @__PURE__ */ new Map();
async function usable(tok) {
  const h = createHash9("sha256").update(tok).digest("hex");
  const had = lists.get(h);
  if (had && Date.now() - had.at < MODELS_KEEP) return had.raw;
  return listing(tok, h);
}
function listing(tok, h) {
  let p = listings.get(h);
  if (p) return p;
  p = (async () => {
    const [j, listed, catalog2] = await Promise.all([
      unary(API, "aiserver.v1.AiService/AvailableModels", tok, { useModelParameters: true, doNotUseMarkdown: true }, 3e4),
      unary(API, "agent.v1.AgentService/GetUsableModels", tok, {}, 8e3).then(
        (u) => Array.isArray(u?.models) ? u.models : [],
        () => []
      ),
      // the full catalog, scope 3: the live models the picker lacks (Claude,
      // on an account Cursor blocks it for); without it the list is the
      // picker's and the usable list's, as before
      unary(API, "aiserver.v1.AiService/AvailableModels", tok, { useModelParameters: true, doNotUseMarkdown: true, scope: 3 }, 8e3).then(
        (c) => Array.isArray(c?.models) ? c.models : [],
        () => []
      )
    ]);
    const ids = new Set(listed.flatMap((m) => [m?.modelId, m?.displayModelId]).filter(Boolean));
    const picker = Array.isArray(j?.models) ? j.models : [];
    const raw = modelsOf(ids.size ? [...picker, ...fromCatalog(picker, catalog2, ids)] : picker, ids.size ? ids : null, listed);
    if (!raw.length) throw new Error("Cursor listed no models");
    lists.set(h, { at: Date.now(), raw });
    listFailed.delete(h);
    return raw;
  })().catch((e) => {
    listFailed.set(h, Date.now());
    throw e;
  }).finally(() => listings.delete(h));
  listings.set(h, p);
  return p;
}
var LIST_RETRY = 5 * 6e4;
async function listFor(tok) {
  const h = createHash9("sha256").update(tok).digest("hex");
  const had = lists.get(h);
  if (had && Date.now() - had.at < MODELS_KEEP) return had.raw;
  if (had) {
    listing(tok, h).catch(() => {
    });
    return had.raw;
  }
  const failed = listFailed.get(h);
  if (failed && Date.now() - failed < LIST_RETRY) return [];
  return listing(tok, h).catch(() => []);
}
function named(raw, id) {
  const models = raw.filter((e, i) => raw.findIndex((x) => x.model === e.model) === i);
  const at = (e, v) => raw.find((x) => x.model === e.model && x.size === (valuesOf(v).context ?? "")) ?? e;
  const as = (e, vs, effort2) => {
    const seed = nearest(vs, valuesOf(e.def));
    return { entry: at(e, seed), seed, effort: effort2, fast: valuesOf(seed).fast === "true" };
  };
  for (const e of models) {
    const vs = e.variants.filter((v) => v.legacySlug === id);
    if (vs.length) return as(e, vs, "");
  }
  const [family, effort] = splitID(id);
  for (const e of models) {
    const vs = e.variants.filter((v) => v.legacySlug && splitID(v.legacySlug)[0] === family);
    if (vs.length) return as(e, vs, effort);
  }
  for (const e of models) {
    const m = e.model;
    if (e.usableOnly) continue;
    if ([m.name, ...m.legacySlugs ?? [], ...m.idAliases ?? []].includes(id)) return { entry: at(e, e.def), seed: void 0, effort: "", fast: false };
  }
  const of = familyOf(id);
  for (const e of models) {
    if (!e.usableOnly) continue;
    const u = e.fam.find((x) => x.id === id);
    if (u) return { entry: e, seed: void 0, effort: u.effort, fast: u.fast };
    if (e.id === of.family) return { entry: e, seed: void 0, effort: of.effort, fast: of.fast };
  }
  const loose = (f) => f.replace(/-thinking$/, "");
  const key = loose(of.family);
  for (const e of models) {
    if (e.usableOnly) {
      if (loose(e.id) === key) return { entry: e, seed: void 0, effort: of.effort, fast: of.fast };
      continue;
    }
    const vs = e.variants.filter((v) => v.legacySlug && loose(familyOf(v.legacySlug).family) === key);
    if (vs.length) return as(e, vs, of.effort);
  }
  const sized = /^(.+)@([^@]+)$/.exec(id);
  if (sized) {
    const want = tokensOf(sized[2]);
    const same = raw.filter((e) => e.run === sized[1] && e.size);
    if (same.length) {
      const near = same.reduce((a, b) => Math.abs(tokensOf(b.size) - want) < Math.abs(tokensOf(a.size) - want) ? b : a);
      return { entry: near, seed: void 0, effort: "", fast: false };
    }
    const old = named(raw, sized[1]);
    if (old) {
      const sizes = raw.filter((e) => e.size && e.model === old.entry.model);
      if (old.entry.size && sizes.length) {
        const near = sizes.reduce((a, b) => Math.abs(tokensOf(b.size) - want) < Math.abs(tokensOf(a.size) - want) ? b : a);
        return { ...old, entry: near };
      }
      return { ...old, max: !old.entry.size && want > old.entry.context };
    }
  }
  return null;
}
function request(raw, model, effort, fast) {
  const entry = raw.find((m) => m.id === model);
  if (entry) return pick(entry, effort, fast);
  const bare = raw.find((m) => m.id === model.replace(/@[^@]*$/, ""));
  if (bare && model !== bare.id && !bare.size) {
    const r = pick(bare, effort, fast);
    return tokensOf(model.split("@").at(-1)) > bare.context ? { ...r, maxMode: true } : r;
  }
  const old = named(raw, model);
  if (old) {
    const r = pick(old.entry, effort || old.effort, fast || old.fast, old.seed);
    return old.max ? { ...r, maxMode: true } : r;
  }
  return { id: model === "auto" ? "default" : model, params: [], maxMode: false };
}
function runtimeModel(m) {
  const efforts = LEVEL_RANK.filter((l) => l in m.levels);
  return {
    id: m.id,
    providerID: ID,
    name: m.name,
    api: { id: m.id, url: AGENT, npm: CHAT },
    status: "active",
    headers: {},
    options: {},
    cost: { input: 0, output: 0, cache: { read: 0, write: 0 } },
    limit: { context: m.context || DEFAULT_CONTEXT, output: 0 },
    capabilities: {
      temperature: false,
      reasoning: efforts.length > 0,
      attachment: true,
      toolcall: true,
      input: { text: true, image: true, audio: false, video: false, pdf: false },
      output: { text: true, image: false, audio: false, video: false, pdf: false },
      interleaved: false
    },
    release_date: "",
    variants: Object.fromEntries(efforts.map((e) => [e, { reasoningEffort: e }])),
    // a request's service_tier priority (or fast) runs it as Cursor's fast
    // variant: magpie offers Fast for the models that have one
    ...m.offersFast ? { fast: true } : {}
  };
}
var PB = class _PB {
  parts = [];
  push(b) {
    this.parts.push(b);
    return this;
  }
  uv(v) {
    const out = [];
    while (v >= 128) {
      out.push(v % 128 | 128);
      v = Math.floor(v / 128);
    }
    out.push(v);
    return this.push(Uint8Array.from(out));
  }
  tag(num2, wire) {
    return this.uv(num2 * 8 + wire);
  }
  varint(num2, v) {
    return this.tag(num2, 0).uv(v);
  }
  bytes(num2, v) {
    const b = v instanceof _PB ? v.done() : v ?? EMPTY;
    return this.tag(num2, 2).uv(b.length).push(b);
  }
  str(num2, s) {
    return this.bytes(num2, Buffer.from(s, "utf8"));
  }
  double(num2, v) {
    const b = Buffer.alloc(8);
    b.writeDoubleLE(v);
    return this.tag(num2, 1).push(b);
  }
  done() {
    return Buffer.concat(this.parts);
  }
};
var pb = () => new PB();
function fields(b) {
  b = Buffer.isBuffer(b) ? b : Buffer.from(b ?? EMPTY);
  const out = [];
  let i = 0;
  const uv = () => {
    let v = 0;
    let m = 1;
    while (i < b.length) {
      const c = b[i++];
      v += (c & 127) * m;
      if (c < 128) return v;
      m *= 128;
    }
    return -1;
  };
  while (i < b.length) {
    const key = uv();
    if (key < 0) break;
    const f = { num: Math.floor(key / 8), wire: key % 8, n: 0, data: EMPTY };
    switch (f.wire) {
      case 0: {
        const v = uv();
        if (v < 0) return out;
        f.n = v;
        break;
      }
      case 1:
        if (i + 8 > b.length) return out;
        f.data = b.subarray(i, i + 8);
        f.n = Number(b.readBigUInt64LE(i));
        i += 8;
        break;
      case 2: {
        const l = uv();
        if (l < 0 || i + l > b.length) return out;
        f.data = b.subarray(i, i + l);
        i += l;
        break;
      }
      case 5:
        if (i + 4 > b.length) return out;
        f.n = b.readUInt32LE(i);
        i += 4;
        break;
      default:
        return out;
    }
    out.push(f);
  }
  return out;
}
var field3 = (fs, num2) => fs.find((f) => f.num === num2);
var pbStr = (fs, num2) => field3(fs, num2)?.data.toString("utf8") ?? "";
var pbNum = (fs, num2) => field3(fs, num2)?.n ?? 0;
function pbValue(v) {
  if (v === null || v === void 0) return pb().varint(1, 0);
  if (typeof v === "number") return pb().double(2, v);
  if (typeof v === "string") return pb().str(3, v);
  if (typeof v === "boolean") return pb().varint(4, v ? 1 : 0);
  if (Array.isArray(v)) {
    const l = pb();
    for (const e of v) l.bytes(1, pbValue(e));
    return pb().bytes(6, l);
  }
  if (typeof v === "object") {
    const st = pb();
    for (const k of Object.keys(v).sort()) st.bytes(1, pb().str(1, k).bytes(2, pbValue(v[k])));
    return pb().bytes(5, st);
  }
  return pb().varint(1, 0);
}
function pbAny(b) {
  for (const f of fields(b)) {
    switch (f.num) {
      case 1:
        return null;
      case 2:
        return f.data.length === 8 ? f.data.readDoubleLE(0) : 0;
      case 3:
        return f.data.toString("utf8");
      case 4:
        return f.n !== 0;
      case 5: {
        const m = {};
        for (const e of fields(f.data)) {
          if (e.num !== 1) continue;
          const kv = fields(e.data);
          const v = field3(kv, 2);
          m[pbStr(kv, 1)] = v ? pbAny(v.data) : null;
        }
        return m;
      }
      case 6:
        return fields(f.data).filter((e) => e.num === 1).map((e) => pbAny(e.data));
    }
  }
  return null;
}
function frame(msg) {
  const head = Buffer.alloc(5);
  head.writeUInt32BE(msg.length, 1);
  return Buffer.concat([head, msg]);
}
async function* frames(body) {
  let buf = EMPTY;
  for await (const chunk of body) {
    buf = buf.length ? Buffer.concat([buf, chunk]) : Buffer.from(chunk);
    while (buf.length >= 5) {
      const n = buf.readUInt32BE(1);
      if (n > 64 << 20) throw new Error("a malformed stream");
      if (buf.length < 5 + n) break;
      const flags = buf[0];
      let data = buf.subarray(5, 5 + n);
      buf = buf.subarray(5 + n);
      if (flags & 1) data = gunzipSync3(data);
      yield { end: (flags & 2) !== 0, data };
    }
  }
  if (buf.length) throw new Error("unexpected EOF");
}
var regional = (msg) => msg.toLowerCase().includes("region");
function failure2(status, text) {
  let e;
  try {
    e = JSON.parse(typeof text === "string" ? text : Buffer.from(text).toString("utf8"));
  } catch {
    return statusOf(status, "", String(text ?? "").trim());
  }
  const f = e?.error && typeof e.error === "object" ? e.error : e ?? {};
  let msg = f.message ?? "";
  for (const d of f.details ?? []) {
    const t = `${d?.debug?.details?.title ?? ""}: ${d?.debug?.details?.detail ?? ""}`.trim();
    if (t !== ":") msg = t.replace(/^[:\s]+|[:\s]+$/g, "");
  }
  if (!msg || msg === "Error") msg = f.code ?? "";
  if (!f.code && status >= 200 && status < 300) return { status, message: msg };
  return statusOf(status, f.code ?? "", msg);
}
function statusOf(status, code, msg) {
  msg ||= statusText(status);
  const low = msg.toLowerCase();
  const out = (status2, message2) => ({ status: status2, message: message2 });
  if (regional(msg)) return out(403, msg + " \u2014 Cursor serves your team only in some regions and turned this request away; signing in again won't change that");
  if (code === "permission_denied") return out(403, msg);
  if (code === "unauthenticated" || status === 401 || low.includes("expired"))
    return out(401, msg + " \u2014 sign in to Cursor again in magpie");
  if (code === "resource_exhausted" || low.includes("quota") || low.includes("rate limit") || low.includes("usage limit"))
    return out(429, "usage limit reached: " + msg);
  if (low.includes("too long") || low.includes("context length") || low.includes("too many tokens"))
    return out(400, "input is too long for the model's context: " + msg);
  if (code === "invalid_argument") return out(400, msg);
  if (code === "unavailable") return out(503, msg);
  if (code) return out(502, msg);
  return out(status, msg);
}
var textOf3 = (c) => typeof c === "string" ? c : Array.isArray(c) ? c.filter((p) => p?.type === "text").map((p) => p.text ?? "").join("") : "";
var reasoningOf2 = (m) => [m.reasoning_content, m.reasoning].find((s) => typeof s === "string" && s.trim()) ?? "";
function joinSplitCalls(msgs) {
  const out = [];
  for (const m of msgs) {
    const prev = out.at(-1);
    if (m?.role === "assistant" && prev?.role === "assistant" && prev.tool_calls?.length) {
      const content = [textOf3(prev.content), textOf3(m.content)].filter(Boolean).join("\n\n");
      const reasoning_content = [reasoningOf2(prev), reasoningOf2(m)].filter(Boolean).join("\n\n");
      out[out.length - 1] = { ...prev, content, reasoning_content, tool_calls: [...prev.tool_calls, ...m.tool_calls ?? []] };
      continue;
    }
    out.push(m);
  }
  return out;
}
function parseArgs(s) {
  if (s && typeof s === "object") return s;
  try {
    const v = JSON.parse(s || "{}");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}
function toolsOf(chat) {
  const choice = chat.tool_choice;
  const only = typeof choice === "object" ? choice?.function?.name : "";
  if (choice === "none") return [];
  return (chat.tools ?? []).filter((t) => t?.type === "function" && t.function?.name && (!only || t.function.name === only)).map((t) => {
    const schema = t.function.parameters ?? { type: "object", properties: {} };
    return { name: t.function.name, description: t.function.description ?? "", schema, schemaText: JSON.stringify(schema) };
  });
}
var NS = "tools";
var NAMESPACES = [NS, "magpie"];
var bareName = (s) => {
  for (const ns of NAMESPACES) if (s.startsWith(ns + "-")) return s.slice(ns.length + 1);
  return s;
};
function catalog(tools) {
  if (!tools.length) return "";
  let s = `

<dynamic_tool_catalog>
The MCP namespace "${NS}" has the tools below. They are reached only through \`${CALL}\`, never as tools of their own. Each entry is the exact call to make; its arguments must match the schema given. The schemas are complete, so there is no need to call \`GetDynamicTools\` first.
`;
  for (const t of tools) s += `<call>${CALL}({"namespace":"${NS}","toolName":"${t.name}","arguments":{...}})
${t.description}
arguments schema: ${t.schemaText}
</call>
`;
  return s + "</dynamic_tool_catalog>";
}
var callID = (id) => id.startsWith("call_") ? id.replace("__fc_", "\nfc_") : id;
function result(id, text, isError) {
  let res = text;
  try {
    res = JSON.parse(text);
  } catch {
  }
  return {
    type: "tool-result",
    toolCallId: callID(id),
    toolName: CALL,
    result: res,
    experimental_content: [{ type: "text", text }],
    ...isError ? { isError: true } : {}
  };
}
function conversation(chat, tools) {
  const out = [];
  const add2 = (m) => out.push(Buffer.from(JSON.stringify(m)));
  let size = 0;
  const system = [];
  let last = ".";
  for (const m of chat.messages ?? [])
    if (m.role === "system" || m.role === "developer") system.push(textOf3(m.content));
  const sys = system.filter(Boolean).join("\n\n") + catalog(tools);
  size += sys.length;
  if (sys) add2({ role: "system", content: sys });
  let pending = [];
  let results = [];
  const answer2 = () => {
    for (const id of pending) results.push(result(id, NO_RESULT, true));
    pending = [];
    if (results.length) add2({ role: "tool", content: results });
    results = [];
  };
  for (const m of joinSplitCalls(chat.messages ?? [])) {
    if (m.role === "system" || m.role === "developer") continue;
    if (m.role === "tool") {
      const id = m.tool_call_id ?? "";
      const i = pending.indexOf(id);
      if (i >= 0) {
        pending.splice(i, 1);
        const text = textOf3(m.content);
        size += text.length;
        results.push(result(id, text, m.is_error === true || m.isError === true));
      }
      continue;
    }
    if (m.role === "assistant") {
      answer2();
      const content2 = [];
      const reasoning = reasoningOf2(m);
      if (reasoning) content2.push({ type: "reasoning", text: reasoning });
      const text = textOf3(m.content);
      if (text) content2.push({ type: "text", text });
      size += reasoning.length + text.length;
      for (const c of m.tool_calls ?? []) {
        if (c?.type && c.type !== "function") continue;
        const args = parseArgs(c.function?.arguments);
        size += (c.function?.arguments ?? "").length + (c.function?.name ?? "").length;
        content2.push({ type: "tool-call", toolCallId: callID(c.id), toolName: CALL, args: { namespace: NS, toolName: c.function?.name, arguments: args } });
        pending.push(c.id);
      }
      if (content2.length) add2({ role: "assistant", content: content2 });
      continue;
    }
    const content = [];
    const parts = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content ?? [];
    let first2 = "";
    for (const p of parts) {
      if (p?.type === "text" && p.text) {
        content.push({ type: "text", text: p.text });
        size += p.text.length;
        first2 ||= p.text;
      } else if (p?.type === "image_url") {
        const u = typeof p.image_url === "string" ? p.image_url : p.image_url?.url ?? "";
        const d = /^data:([^;,]+);base64,(.*)$/s.exec(u);
        if (d) content.push({ type: "image", mimeType: d[1], image: { __type: "Uint8Array", hex: Buffer.from(d[2], "base64").toString("hex") } });
        else content.push({ type: "text", text: `[attachment image: ${u}]` });
      } else if (p?.type === "file") {
        content.push({ type: "text", text: `[attachment ${p.file?.filename ?? "file"}]` });
      }
    }
    answer2();
    if (first2) last = first2;
    if (content.length) add2({ role: "user", content });
  }
  answer2();
  for (const t of tools) size += t.name.length + t.description.length + t.schemaText.length;
  return { msgs: out, last, estimate: Math.floor(size / 4) };
}
function toolDef(t) {
  const d = pb().str(1, t.name);
  if (t.description) d.str(2, t.description);
  d.bytes(3, pbValue(t.schema));
  return d.str(4, NS).str(5, t.name).str(6, t.schemaText).done();
}
var env = () => pb().str(1, GOOS).str(2, tmpdir()).str(10, "UTC");
var SESSION = "x-magpie-cursor-session";
function sessionOf(input) {
  const s = String(input?.sessionID ?? "").trim();
  if (!s || /^magpie-[0-9a-f]{24}$/.test(s)) return "";
  return s.slice(0, 128);
}
function uuidOf(b) {
  b = Buffer.from(b.subarray(0, 16));
  b[6] = b[6] & 15 | 64;
  b[8] = b[8] & 63 | 128;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
function conversationID(chat, session) {
  const key = (typeof chat?.prompt_cache_key === "string" ? chat.prompt_cache_key.trim() : "") || session || "";
  if (!key) return "";
  const msgs = Array.isArray(chat?.messages) ? chat.messages : [];
  const first2 = msgs.find((m) => m?.role === "user") ?? msgs[0];
  const sum = createHash9("sha256").update("cursor conversation\0" + key + "\0" + (first2 === void 0 ? "" : JSON.stringify(first2))).digest();
  return uuidOf(sum);
}
function usageOf(uf, shift = 0) {
  const [inp, cr, cw] = [pbNum(uf, 1 + shift), pbNum(uf, 3 + shift), pbNum(uf, 4 + shift)];
  return { input: Math.max(inp - cr - cw, 0), output: pbNum(uf, 2 + shift), cacheRead: cr, cacheWrite: cw, reasoning: pbNum(uf, 5 + shift) };
}
var STEP_WAIT = { first: 1500, every: 500, until: 6e3, ask: 5e3, skipAfter: 3, retryEvery: 10, owedAt: 5e3, owedFor: 6e5 };
var claimed = /* @__PURE__ */ new Map();
var owed = /* @__PURE__ */ new Map();
var flights = /* @__PURE__ */ new Map();
var unreadable = /* @__PURE__ */ new Map();
var misses = /* @__PURE__ */ new Map();
var tokKey = (tok) => createHash9("sha256").update(tok).digest("hex");
var usageKey = (tok, conv) => tokKey(tok) + "\0" + conv;
function canRead(tok) {
  const at = unreadable.get(tokKey(tok));
  if (at === void 0) return true;
  if (Date.now() - at < STEP_WAIT.owedFor) return false;
  unreadable.delete(tokKey(tok));
  return true;
}
var ZERO = () => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 });
function addUsage(a, b) {
  if (!b) return a;
  if (!a) return { ...b };
  for (const k of Object.keys(a)) a[k] += b[k] ?? 0;
  return a;
}
var DEBT_GROUP_LIMIT = 64;
function owe(key, { since = Date.now(), n = 0, ready = Date.now(), carry = null, before, tag }) {
  for (const [k, d2] of owed) {
    if (d2.groups) {
      d2.groups = d2.groups.filter((g) => Date.now() - g.since <= STEP_WAIT.owedFor && g.tag?.state !== "withdrawn");
      d2.n = d2.groups.reduce((sum, g) => sum + g.n, 0);
      if (Date.now() - d2.since > STEP_WAIT.owedFor) d2.carry = null;
      if (!d2.n && !d2.carry) owed.delete(k);
      else if (d2.groups.length) d2.since = Math.min(...d2.groups.map((g) => g.since));
    } else if (Date.now() - d2.since > STEP_WAIT.owedFor) owed.delete(k);
  }
  if (n <= 0 && !carry) return;
  const d = owed.get(key);
  if (!d && tag) return void owed.set(key, { since, n, ready, carry: carry && { ...carry }, groups: [{ since, n, ready, before, tag }] });
  if (!d) return void owed.set(key, { since, n, ready, carry: carry && { ...carry }, ...before !== void 0 ? { before } : {} });
  if (n > 0 && (d.groups || d.before !== void 0 || before !== void 0 || tag)) {
    const groups = d.groups ?? (d.n > 0 ? [{ since: d.since, n: d.n, ready: d.ready, before: d.before }] : []);
    const same = !tag && groups.find((g) => !g.tag && g.before === before);
    if (same) {
      same.since = Math.min(same.since, since);
      same.n += n;
      same.ready = Math.min(same.ready, ready);
    } else groups.push({ since, n, ready, before, ...tag ? { tag } : {} });
    groups.sort((a, b) => a.since - b.since);
    d.groups = groups.slice(-DEBT_GROUP_LIMIT);
    delete d.before;
    d.n = d.groups.reduce((sum, g) => sum + g.n, 0);
    d.since = Math.min(...d.groups.map((g) => g.since));
  } else {
    d.since = Math.min(d.since, since);
    d.n += n;
  }
  d.ready = Math.min(d.ready, ready);
  d.carry = addUsage(d.carry, carry);
}
function withdraw(key, tag) {
  if (tag.state !== "owed") return;
  tag.state = "withdrawn";
  const d = owed.get(key);
  if (!d?.groups) return;
  d.groups = d.groups.filter((g) => g.tag !== tag);
  d.n = d.groups.reduce((sum, g) => sum + g.n, 0);
  if (!d.n && !d.carry) owed.delete(key);
  else if (d.groups.length) d.since = Math.min(...d.groups.map((g) => g.since));
}
async function usageEvents(tok, conv, since, want, { poll = false, first: first2 = STEP_WAIT.first, signal, before = () => Infinity, groups, abortFetch = false } = {}) {
  const key = usageKey(tok, conv);
  const end = Date.now() + STEP_WAIT.until;
  const wait = (ms) => new Promise((r) => {
    const t = setTimeout(r, ms);
    signal?.addEventListener("abort", () => (clearTimeout(t), r()), { once: true });
  });
  for (const [k, at] of claimed) if (Date.now() - at > 2 * STEP_WAIT.owedFor) claimed.delete(k);
  const num2 = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  let usage2 = null;
  let got = 0;
  const events = [];
  const counts = groups?.map(() => 0);
  if (poll) await wait(first2);
  while (!signal?.aborted) {
    try {
      const res = await fetch(API + "/aiserver.v1.DashboardService/GetFilteredUsageEvents", {
        method: "POST",
        headers: await headersFor(tok),
        body: JSON.stringify({ ...await teamBody(tok), startDate: String(since - 6e4), endDate: String(Date.now() + 6e4), page: 1, pageSize: 50 }),
        signal: abortFetch && signal ? AbortSignal.any([signal, AbortSignal.timeout(STEP_WAIT.ask)]) : AbortSignal.timeout(STEP_WAIT.ask)
      });
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        unreadable.set(tokKey(tok), Date.now());
        return { usage: usage2, events, got, counts, refused: true };
      }
      const evs = res.ok ? (await res.json())?.usageEventsDisplay ?? [] : [];
      const found = evs.filter((e) => e?.conversationId === conv && e.tokenUsage && num2(e.timestamp) >= since - 1e3 && !claimed.has(key + "\0" + e.timestamp)).sort((a, b) => num2(a.timestamp) - num2(b.timestamp));
      for (const ev of found) {
        if (got >= want) break;
        const at = num2(ev.timestamp);
        if (at >= before()) continue;
        const group = groups?.findIndex((g, i) => counts[i] < g.n && g.tag?.state !== "withdrawn" && at >= g.since - 1e3 && at < (g.before ?? Infinity));
        if (groups && group === -1) continue;
        if (groups) counts[group]++;
        claimed.set(key + "\0" + ev.timestamp, Date.now());
        const t = ev.tokenUsage;
        const u = { input: num2(t.inputTokens), output: num2(t.outputTokens), cacheRead: num2(t.cacheReadTokens), cacheWrite: num2(t.cacheWriteTokens), reasoning: 0 };
        const tag = groups?.[group].tag;
        if (tag) {
          tag.state = "collected";
          tag.usage = addUsage(tag.usage, u);
        }
        usage2 = addUsage(usage2 ?? ZERO(), u);
        events.push({ at: num2(ev.timestamp), usage: u });
        got++;
      }
      if (got >= want) break;
    } catch {
    }
    if (!poll || Date.now() + STEP_WAIT.every > end) break;
    await wait(STEP_WAIT.every);
  }
  return { usage: usage2, events, got, counts, refused: false };
}
async function stepUsage(tok, conv, since, signal) {
  return (await usageEvents(tok, conv, since, 1, { poll: true, signal })).usage;
}
function collect(tok, conv, { poll = false, first: first2, signal, over = () => false, abortFetch = false } = {}) {
  const key = usageKey(tok, conv);
  const d = owed.get(key);
  if (!d) return Promise.resolve({ usage: null, carry: null, events: [], short: false });
  owed.delete(key);
  const now = Date.now();
  const held = d.groups?.filter((g) => g.tag?.state === "owed" && g.ready > now) ?? [];
  for (const g of held) owe(key, { since: g.since, n: g.n, ready: g.ready, before: g.before, tag: g.tag });
  const p = (async () => {
    const groups = (d.groups ?? [d]).filter((g) => !held.includes(g) && g.tag?.state !== "withdrawn" && (g.before === void 0 && !d.groups || Date.now() - g.since <= STEP_WAIT.owedFor));
    const want = groups.reduce((sum, g) => sum + g.n, 0);
    let r = { usage: null, events: [], got: 0 };
    if (want > 0 && canRead(tok)) r = await usageEvents(tok, conv, Math.min(...groups.map((g) => g.since)), want, {
      poll,
      first: first2,
      signal,
      abortFetch,
      before: () => d.before ?? Infinity,
      ...d.groups ? { groups } : {}
    }).catch(() => r);
    let short = false;
    for (const [i, g] of groups.entries()) {
      const remaining = g.n - (d.groups ? r.counts?.[i] ?? 0 : r.got);
      if (remaining > 0 && canRead(tok) && g.tag?.state !== "withdrawn") {
        short = true;
        owe(key, { since: g.since, n: remaining, ready: g.ready, before: g.before, tag: g.tag });
      }
    }
    const carry = d.carry && { ...d.carry };
    const usage2 = addUsage(d.carry, r.usage);
    if (!over()) return { usage: usage2, carry, events: r.events ?? [], short };
    owe(key, { carry: usage2 });
    return { usage: null, carry: null, events: [], short };
  })();
  p.debt = d;
  const set = flights.get(key) ?? /* @__PURE__ */ new Set();
  flights.set(key, set.add(p));
  p.finally(() => {
    set.delete(p);
    if (!set.size && flights.get(key) === set) flights.delete(key);
  });
  return p;
}
function ledger(tok, conv, since, signal, kept2, { before } = {}) {
  const key = tokKey(tok);
  const debtKey = usageKey(tok, conv);
  if (kept2 && before !== void 0) {
    const debts = [owed.get(debtKey), ...[...flights.get(debtKey) ?? []].map((p) => p.debt)];
    for (const d of debts) for (const g of d?.groups ?? (d ? [d] : [])) g.before = Math.min(g.before ?? Infinity, before);
  }
  let mine2 = null;
  let theirs = null;
  let over = false;
  const gather = (opts) => collect(tok, conv, { ...opts, over: () => over, abortFetch: before !== void 0 }).then((r) => {
    theirs = addUsage(theirs, r.carry);
    for (const e of r.events ?? []) {
      if (e.at >= since - 1e3) mine2 = addUsage(mine2, e.usage);
      else theirs = addUsage(theirs, e.usage);
    }
    return r;
  });
  const heldUntil = () => {
    const now = Date.now();
    return Math.max(0, ...(owed.get(debtKey)?.groups ?? []).filter((g) => g.tag?.state === "owed" && g.ready > now).map((g) => g.ready));
  };
  let collecting = null;
  const debt = kept2 ? owed.get(debtKey) : void 0;
  const timer = debt ? setTimeout(() => collecting = gather(), Math.max(0, debt.ready - Date.now())) : null;
  timer?.unref?.();
  const sleep2 = (ms) => new Promise((r) => {
    if (signal?.aborted) return r();
    const t = setTimeout(r, ms);
    signal?.addEventListener("abort", () => (clearTimeout(t), r()), { once: true });
  });
  const takeMine = () => {
    const u = mine2;
    mine2 = null;
    return u;
  };
  const take = () => {
    const u = addUsage(theirs, mine2);
    mine2 = theirs = null;
    return u;
  };
  return {
    async own() {
      if (!canRead(tok)) return null;
      const m = misses.get(key) ?? 0;
      const waits = m < STEP_WAIT.skipAfter || m % STEP_WAIT.retryEvery === 0;
      if (!kept2) {
        const r = waits ? await usageEvents(tok, conv, since, 1, { poll: true, signal }).catch(() => ({})) : {};
        if (r.usage) misses.delete(key);
        else if (!r.refused) misses.set(key, m + 1);
        return r.usage ?? null;
      }
      owe(debtKey, { since, n: 1, ready: Date.now() + STEP_WAIT.owedAt });
      if (waits) {
        const r = await gather({ poll: true, signal });
        if (!canRead(tok)) return null;
        if (r.short) misses.set(key, m + 1);
        else misses.delete(key);
      } else misses.set(key, m + 1);
      return takeMine() ?? false;
    },
    async owed(final) {
      if (!kept2) return null;
      if (final) {
        await collecting;
        await Promise.all([...flights.get(debtKey) ?? []]);
        const until = heldUntil();
        if (until) await sleep2(until - Date.now());
        await Promise.all([...flights.get(debtKey) ?? []]);
        if (owed.has(debtKey)) await gather({ poll: owed.get(debtKey).n > 0, first: 0, signal });
      }
      return take();
    },
    // handover: a later Run of the conversation began while this one waits
    // on the caller's results. That Run collects from here on: what this one
    // collected and has not given out goes to it, as does what an ask still
    // going brings. A step that ends this Run after all still collects.
    handover() {
      clearTimeout(timer);
      const give = () => {
        const u = take();
        if (u) owe(debtKey, { carry: u });
      };
      give();
      collecting?.then(give, () => {
      });
    },
    done() {
      over = true;
      clearTimeout(timer);
      const u = take();
      if (u) owe(debtKey, { carry: u });
    }
  };
}
function buildRun(msgs, lastUser, tools, model, conv = "", { maxMode = false, params = [] } = {}) {
  const blobs = /* @__PURE__ */ new Map();
  const put = (b) => {
    const id = createHash9("sha256").update(b).digest();
    blobs.set(id.toString("hex"), b);
    return id;
  };
  const state = pb();
  for (const m of msgs) state.bytes(1, put(m));
  const mid = randomUUID5();
  const user = pb().str(1, lastUser).str(2, mid).varint(4, 1).done();
  const turn = pb().bytes(1, pb().bytes(1, put(user)).str(10, mid)).done();
  state.bytes(8, put(turn)).varint(10, 1).str(22, "cli");
  const defs = tools.map(toolDef);
  const rc = pb().bytes(4, env());
  const mcp = pb();
  for (const d of defs) {
    rc.bytes(7, d);
    mcp.bytes(1, d);
  }
  const action = pb().bytes(2, pb().bytes(2, rc));
  const details = pb().str(1, model).str(3, model).str(4, model);
  const requested = pb().str(1, model);
  if (maxMode) {
    details.varint(7, 1);
    requested.varint(2, 1);
  }
  for (const p of params) requested.bytes(3, pb().str(1, p.id).str(2, p.value));
  const rr = pb().bytes(1, state).bytes(2, action).bytes(3, details).bytes(4, mcp).str(5, conv || randomUUID5()).bytes(9, requested).varint(19, 1).varint(37, 1);
  return { first: pb().bytes(1, rr).done(), blobs };
}
var endpoints = /* @__PURE__ */ new Map();
async function agentURL(tok, fresh) {
  const key = createHash9("sha256").update(tok).digest("hex");
  const had = endpoints.get(key);
  if (!fresh && had && (had.listed || Date.now() - had.at < 6e4)) return had.url;
  let url = AGENT;
  let listed = false;
  try {
    const cfg = await unary(API, "aiserver.v1.ServerConfigService/GetServerConfig", tok, {}, 1e4);
    for (const raw of [cfg?.agentUrlConfig?.agentUrl, cfg?.agentUrlConfig?.agentnUrl]) {
      try {
        const u = new URL(raw);
        if ((u.protocol === "https:" || u.protocol === "http:") && u.host) {
          url = raw.replace(/\/+$/, "");
          listed = true;
          break;
        }
      } catch {
      }
    }
  } catch {
  }
  endpoints.set(key, { url, at: Date.now(), listed });
  return url;
}
var h1Until = 0;
var cancelledOpen = () => ({ error: { status: 410, message: "the request was cancelled" }, h2Failed: false });
async function open(base, headers2, signal, atOnce = H1.atOnce, overlaps) {
  if (signal?.aborted) return cancelledOpen();
  if (Date.now() >= h1Until) {
    const o = await openH2(base, headers2, signal);
    if (signal?.aborted) {
      o.req?.close(http2.constants.NGHTTP2_CANCEL);
      o.session?.destroy();
      return cancelledOpen();
    }
    if (!o.h2Failed) return o;
    if (o.blocked) h1Until = Date.now() + H2.retryAfter;
  }
  if (signal?.aborted) return cancelledOpen();
  return openH1(headers2, signal, atOnce, overlaps);
}
var H2 = {
  wait: 15e3,
  // ms an HTTP/2 Run waits for its response's head
  retryAfter: 10 * 6e4
  // ms the Runs after one found HTTP/2 blocked stay on HTTP/1.1
};
var NET = ["ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ENETUNREACH", "EHOSTUNREACH", "ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "EPIPE"];
function h2Blocked(e) {
  if (e?.h2Timeout) return true;
  const code = String(e?.code ?? "");
  const text = `${code} ${e?.message ?? ""}`;
  if (NET.some((c) => text.includes(c))) return false;
  if (code === "ERR_HTTP2_STREAM_ERROR") return false;
  return code.startsWith("ERR_HTTP2") || /h2 is not supported|alpn|nghttp2|protocol error/i.test(text);
}
function openH2(base, headers2, signal) {
  if (signal?.aborted) return Promise.resolve(cancelledOpen());
  return new Promise((resolve) => {
    const u = new URL(base);
    const session = http2.connect(u.origin);
    let done = false;
    const fail = (e, h2Failed = true) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      session.destroy();
      resolve({ error: { status: h2Failed ? 502 : 410, message: e?.message ?? String(e) }, h2Failed, blocked: h2Failed && h2Blocked(e) });
    };
    const abort = () => fail(new Error("the request was cancelled"), false);
    const timer = setTimeout(() => fail(Object.assign(new Error(`no answer over HTTP/2 in ${H2.wait / 1e3}s`), { h2Timeout: true })), H2.wait);
    session.on("error", fail);
    const req = session.request({
      ":method": "POST",
      ":path": u.pathname.replace(/\/+$/, "") + "/agent.v1.AgentService/Run",
      ...headers2
    });
    req.on("error", fail);
    req.once("close", () => fail(Object.assign(new Error(`the HTTP/2 stream closed before its response (code ${req.rstCode ?? "?"})`), { code: "ERR_HTTP2_STREAM_ERROR" })));
    req.once("response", (h) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      resolve({ session, req, status: Number(h[":status"]) });
    });
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}
var H1 = {
  appendWait: 6e4,
  // ms a BidiAppend may take before the Run fails, as cursor-agent's appendTimeoutMs
  // BidiAppends on their way at once, numbered in order, as cursor-agent
  // keeps them: one at a time, a new Run's history (a blob a message,
  // hundreds for a long conversation, all asked for at once) took a round
  // trip to Cursor each before the model could start. A native session's
  // Run sends only its KV replies that way (kvReply); each of its other
  // messages waits for every append before it, and goes alone (runNative).
  atOnce: 16
};
function kvReply(msg) {
  const b = Buffer.isBuffer(msg) ? msg : Buffer.from(msg ?? EMPTY);
  return b.length > 0 && b[0] === 26;
}
function connectCode(status) {
  return { 400: "invalid_argument", 401: "unauthenticated", 403: "permission_denied", 429: "resource_exhausted" }[status] ?? "unavailable";
}
function openH1(headers2, signal, atOnce = H1.atOnce, overlaps = () => true) {
  if (signal?.aborted) return Promise.resolve(cancelledOpen());
  const ac = new AbortController();
  const id = headers2["x-request-id"];
  const h = { ...headers2, "accept-encoding": "identity", "x-cursor-streaming": "true" };
  let ended = false;
  let seq = 0;
  let reader;
  const going = /* @__PURE__ */ new Set();
  const req = new Duplex({
    read() {
    },
    write(chunk, _enc, cb) {
      const msg = Buffer.from(chunk).subarray(5);
      const go = () => {
        const p = append(msg, seq++);
        going.add(p);
        const gone = () => going.delete(p);
        p.then(gone, gone);
        return p;
      };
      if (!overlaps(msg)) {
        Promise.allSettled([...going]).then(go).then(() => cb(), (e) => cb(e));
        return;
      }
      go();
      if (going.size < atOnce) return cb();
      Promise.race(going).then(() => cb(), (e) => cb(e));
    }
  });
  const cleanup = () => {
    signal?.removeEventListener("abort", close);
    ac.abort();
    reader?.cancel().catch(() => {
    });
  };
  const end = (body) => {
    if (ended || req.destroyed) return;
    ended = true;
    const f = frame(Buffer.from(body));
    f[0] = 2;
    req.push(f);
    req.push(null);
    cleanup();
  };
  const failed = async (res) => {
    const text = await res.text().catch(() => "");
    let e;
    try {
      e = JSON.parse(text);
    } catch {
    }
    end(JSON.stringify({ error: typeof e?.code === "string" ? e : { code: connectCode(res.status), message: text.trim() || `HTTP ${res.status}` } }));
  };
  const append = async (msg, n) => {
    if (ended || ac.signal.aborted) return;
    const body = pb().str(1, msg.toString("hex")).bytes(2, pb().str(1, id).done()).varint(3, n).done();
    const ms = H1.appendWait + Math.ceil(body.length / 65536) * 1e3;
    const deadline = AbortSignal.timeout(ms);
    try {
      const res = await fetch(API + "/aiserver.v1.BidiService/BidiAppend", {
        method: "POST",
        headers: { ...h, "content-type": "application/proto", "connect-protocol-version": "1" },
        body,
        signal: AbortSignal.any([ac.signal, deadline])
      });
      if (ended || ac.signal.aborted) {
        await res.body?.cancel().catch(() => {
        });
        return;
      }
      if (!res.ok) return failed(res);
      await res.arrayBuffer();
    } catch (e) {
      if (ac.signal.aborted) return;
      if (deadline.aborted) return end(JSON.stringify({ error: { code: "deadline_exceeded", message: `BidiAppend got no answer in ${Math.round(ms / 1e3)}s` } }));
      end(JSON.stringify({ error: { code: "unavailable", message: `BidiAppend: ${e?.message ?? e}` } }));
    }
  };
  const close = () => {
    ended = true;
    cleanup();
    req.destroy();
  };
  signal?.addEventListener("abort", close, { once: true });
  if (signal?.aborted) {
    close();
    return Promise.resolve(cancelledOpen());
  }
  ;
  (async () => {
    try {
      const res = await fetch(API + "/agent.v1.AgentService/RunSSE", {
        method: "POST",
        headers: { ...h, "content-type": "application/connect+proto", "connect-protocol-version": "1" },
        body: frame(pb().str(1, id).done()),
        signal: ac.signal
      });
      if (ended || ac.signal.aborted) {
        await res.body?.cancel().catch(() => {
        });
        return;
      }
      if (!res.ok) return failed(res);
      reader = res.body.getReader();
      try {
        while (!ended && !req.destroyed) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!ended && !req.destroyed) req.push(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
        reader = void 0;
      }
      if (!ended && !req.destroyed) {
        ended = true;
        req.push(null);
        cleanup();
      }
    } catch (e) {
      if (!ac.signal.aborted) end(JSON.stringify({ error: { code: "unavailable", message: `RunSSE: ${e?.message ?? e}` } }));
    }
  })();
  return Promise.resolve(signal?.aborted ? cancelledOpen() : { session: { close, destroy: close }, req: Object.assign(req, { close }), status: 200, h1: true });
}
function nativeTransport(req, close, fail, limits = NATIVE_LIMITS) {
  const outbound = { bytes: 0, messages: 0 };
  const queue = [];
  let closed = false, flushing = false, rejectWrite;
  const waiters = /* @__PURE__ */ new Set();
  const spare = (n) => Math.floor(n / 8);
  const fits = (size) => outbound.messages === 0 || outbound.messages + 1 + spare(limits.outboundMessages) <= limits.outboundMessages && outbound.bytes + size + spare(limits.outboundBytes) <= limits.outboundBytes;
  const wake = () => {
    for (const w of waiters) if (closed || fits(w.size)) w.done();
  };
  const flush = async () => {
    if (closed || flushing) return;
    flushing = true;
    try {
      while (!closed && queue.length) {
        const packet = queue.shift();
        await new Promise((resolve, reject) => {
          let written = false, drained = false, started = false, settled = false;
          const finish = (error) => {
            if (settled) return;
            settled = true;
            rejectWrite = void 0;
            req.removeListener("drain", drain);
            req.removeListener("error", failed);
            req.removeListener("close", lost);
            error ? reject(error) : resolve();
          };
          const check = () => {
            if (started && written && drained) finish();
          };
          const drain = () => {
            drained = true;
            check();
          };
          const failed = (e) => finish(e);
          const lost = () => finish(new NativeSessionError(502, "native transport closed during a write; its outcome is uncertain"));
          rejectWrite = finish;
          req.once("drain", drain);
          req.once("error", failed);
          req.once("close", lost);
          try {
            drained = req.write(packet, (e) => {
              if (e) return finish(e);
              written = true;
              check();
            }) || drained;
            started = true;
            if (drained) req.removeListener("drain", drain);
            check();
          } catch (e) {
            finish(e);
          }
        });
        if (!closed) {
          outbound.bytes -= packet.length;
          outbound.messages--;
          wake();
        }
      }
    } catch (e) {
      if (!closed) fail(e);
    } finally {
      flushing = false;
    }
  };
  return {
    outbound,
    send(message2) {
      if (closed || req.destroyed || !req.writable) throw new NativeSessionError(502, "native transport is no longer writable");
      const size = message2.length + 5;
      if (outbound.bytes + size > limits.outboundBytes) throw new NativeSessionError(503, "native outbound bytes limit reached");
      if (outbound.messages + 1 > limits.outboundMessages) throw new NativeSessionError(503, "native outbound messages limit reached");
      outbound.bytes += size;
      outbound.messages++;
      queue.push(frame(message2));
      void flush();
    },
    // room resolves once a message of size fits the queue with the spare
    // kept, and fails the Run when the queue doesn't drain for writeWait.
    room(size) {
      if (closed || fits(size)) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const w = {
          size,
          done() {
            waiters.delete(w);
            clearTimeout(w.timer);
            resolve();
          }
        };
        w.timer = setTimeout(() => {
          waiters.delete(w);
          const which = outbound.bytes + size + spare(limits.outboundBytes) > limits.outboundBytes ? "bytes" : "messages";
          reject(new NativeSessionError(503, `native outbound ${which} limit reached: the queue did not drain for ${Math.round(limits.writeWait / 1e3)}s`));
        }, limits.writeWait);
        w.timer.unref?.();
        waiters.add(w);
      });
    },
    close() {
      if (closed) return;
      closed = true;
      queue.length = 0;
      outbound.bytes = 0;
      outbound.messages = 0;
      wake();
      rejectWrite?.(new NativeSessionError(410, "native transport was cancelled"));
      close();
    }
  };
}
var OWN_KEEP = 40 * 864e5;
var mine = { ids: /* @__PURE__ */ new Map(), read: null, timer: null, file: () => join2(process.env.XDG_DATA_HOME || join2(homedir(), ".local", "share"), "opencode-cursor-auth", "conversations.json") };
function readMine() {
  mine.read ??= readFile(mine.file(), "utf8").then((t) => {
    const kept2 = JSON.parse(t);
    for (const [id, at] of Object.entries(kept2 && typeof kept2 === "object" ? kept2 : {}))
      if (typeof at === "number" && !mine.ids.has(id)) mine.ids.set(id, at);
  }).catch(() => {
  });
  return mine.read;
}
function saveMine() {
  if (mine.timer) return;
  mine.timer = setTimeout(async () => {
    mine.timer = null;
    await readMine();
    const now = Date.now();
    for (const [id, at] of mine.ids) if (now - at > OWN_KEEP) mine.ids.delete(id);
    const file = mine.file();
    try {
      await mkdir(dirname(file), { recursive: true });
      const tmp = file + "." + process.pid + ".tmp";
      await writeFile(tmp, JSON.stringify(Object.fromEntries(mine.ids)));
      await rename(tmp, file);
    } catch {
    }
  }, 1e3);
  mine.timer.unref?.();
}
function ownConversation(cid) {
  mine.ids.set(cid, Date.now());
  saveMine();
}
var mes = /* @__PURE__ */ new Map();
async function meOf(tok) {
  const had = mes.get(tok);
  if (had && Date.now() - had.at < 36e5) return had.id;
  try {
    const me = await unary(API, "aiserver.v1.DashboardService/GetMe", tok);
    const id = me?.userId == null ? "" : String(me.userId);
    mes.set(tok, { id, at: Date.now() });
    return id;
  } catch {
    return had?.id ?? "";
  }
}
var CALLS_PAGE = 100;
var CALLS_PAGES = 50;
async function callsOf(tok, since, signal) {
  await readMine();
  const me = await meOf(tok);
  const num2 = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const out = [];
  const end = Date.now();
  for (let page = 1; page <= CALLS_PAGES; page++) {
    const res = await fetch(API + "/aiserver.v1.DashboardService/GetFilteredUsageEvents", {
      method: "POST",
      headers: await headersFor(tok),
      body: JSON.stringify({ ...await teamBody(tok), startDate: String(since), endDate: String(end), page, pageSize: CALLS_PAGE }),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15e3)]) : AbortSignal.timeout(15e3)
    });
    const text = await res.text();
    if (!res.ok) {
      const f = failure2(res.status, text);
      const e = new Error(f.message);
      e.status = f.status;
      throw e;
    }
    const body = JSON.parse(text || "{}");
    const evs = body?.usageEventsDisplay ?? [];
    for (const ev of evs) {
      const t = ev?.tokenUsage;
      const at = num2(ev?.timestamp);
      if (!t || !at || at < since) continue;
      if (me && ev.owningUser != null && String(ev.owningUser) !== me) continue;
      if (ev.conversationId && mine.ids.has(ev.conversationId)) continue;
      const rid = String(ev.usageEventId ?? "") || `${ev.conversationId ?? ""}:${at}:${ev.model ?? ""}`;
      const cents = t.totalCents ?? ev.chargedCents;
      out.push({
        rid,
        t: at,
        model: String(ev.model ?? ""),
        in: num2(t.inputTokens),
        out: num2(t.outputTokens),
        cache_read: num2(t.cacheReadTokens),
        cache_write: num2(t.cacheWriteTokens),
        ...cents == null ? {} : { cost: num2(cents) / 100 },
        ...ev.conversationId ? { session: String(ev.conversationId) } : {}
      });
    }
    const total = num2(body?.totalUsageEventsCount);
    if (evs.length < CALLS_PAGE || total && page * CALLS_PAGE >= total) break;
  }
  return out.sort((a, b) => a.t - b.t);
}
async function runNative({ tok, base, id, tools, conv, convID, signal, maxMode, params, native }) {
  const cid = convID || randomUUID5();
  ownConversation(cid);
  const since = Date.now();
  const accounting = new AbortController();
  const book = ledger(tok, cid, since, accounting.signal, !!convID, { before: since });
  const debtKey = usageKey(tok, cid);
  let started = false, settled = false, deferred2 = null;
  let handed = null;
  const owes = () => started && native.segments > 0 && !native.finalUsage && convID && canRead(tok);
  native.accounting = {
    started() {
      started = true;
    },
    // A later Run of the conversation began (NativeSessionPool.create) while
    // this one waits on the caller's results. Its step's event is owed now,
    // bounded before that start, for the later Run to collect, rather than
    // when this one is abandoned at resultWait. Cursor stamps a Run's one
    // event at its start and adds each step to it as the step ends.
    handover() {
      if (settled || handed && handed.state !== "withdrawn" || !owes()) return;
      handed = { state: "owed" };
      owe(debtKey, { since, n: 1, ready: Date.now() + STEP_WAIT.owedAt, before: native.laterRunAt, tag: handed });
      book.handover();
    },
    // resumed by its own results after all: a step not collected yet is this
    // Run's to count again, in its final; one collected is counted (below)
    resumed() {
      if (handed?.state === "owed") withdraw(debtKey, handed);
    },
    // what a later Run collected of this Run's event: its final leaves it out
    counted() {
      return handed?.state === "collected" ? handed.usage : null;
    },
    async settle() {
      const more = await book.owed(true);
      if (settled) {
        if (more) owe(debtKey, { carry: more });
        return null;
      }
      deferred2 = more;
      return more;
    },
    delivered() {
      if (settled) return;
      settled = true;
      deferred2 = null;
      book.done();
      accounting.abort();
    },
    abandon() {
      if (settled) return;
      settled = true;
      book.done();
      accounting.abort();
      if (deferred2) owe(debtKey, { carry: deferred2 });
      deferred2 = null;
      if (handed && handed.state !== "withdrawn") return;
      if (owes()) {
        owe(debtKey, { since, n: 1, ready: Date.now() + STEP_WAIT.owedAt, before: native.laterRunAt });
      }
    }
  };
  const { first: first2, blobs } = buildRun(conv.msgs, conv.last, tools, id, cid, { maxMode, params });
  native.chatTools = tools;
  native.attach(signal);
  if (native.error) {
    nativeSessions.forget(native);
    return { error: native.error };
  }
  const o = await open(
    base,
    {
      "content-type": "application/connect+proto",
      "connect-protocol-version": "1",
      authorization: `Bearer ${tok}`,
      "x-cursor-client-version": await clientVersion(),
      "x-cursor-client-type": "cli",
      // else Cursor adds a prompt of its own
      "x-ghost-mode": "true",
      // privacy mode: nothing kept for training
      "x-request-id": randomUUID5(),
      ...await teamHeader(tok),
      // none of Cursor's own tools, only the caller's
      "x-cursor-agent-allowed-tools": "mcp_tool_call,get_mcp_tools_tool_call"
    },
    native.ac.signal,
    // Over HTTP/1.1 the history's blobs go up H1.atOnce at a time, as
    // cursor-agent sends them; one at a time, a Run with a long history
    // waited a round trip to api2 a blob before its first token (ysm119 on
    // Discord: 135 blobs, 37 s against 3 s over HTTP/2). Everything else
    // goes alone, after the appends before it were answered, and counts as
    // written only once Cursor answered it, so a tool result is never
    // uncertain.
    H1.atOnce,
    kvReply
  );
  if (o.error) {
    native.fail(o.error);
    nativeSessions.forget(native);
    return o;
  }
  const { session, req } = o;
  const close = () => {
    try {
      req.close(http2.constants.NGHTTP2_CANCEL);
    } catch {
    }
    session.close();
    session.destroy();
  };
  const transport = nativeTransport(req, close, (e) => native.fail({ status: e.status ?? 502, message: e.message }), native.limits);
  try {
    native.bind(transport, blobs, conv.estimate);
    if (native.error) {
      nativeSessions.forget(native);
      return { error: native.error };
    }
    native.send(first2);
    native.accounting.started();
    if (o.status < 200 || o.status > 299) {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      native.fail(failure2(o.status, Buffer.concat(chunks).toString("utf8").slice(0, 1 << 20)));
      nativeSessions.forget(native);
      return { error: native.error, h1: !!o.h1 };
    }
    native.pumpTask = (async () => {
      await native.pump(frames(req));
    })();
    const response = native.response();
    const it = response.events;
    const head = await it.next();
    if (head.done || head.value.error) {
      const error = head.value?.error ?? { status: 502, message: "an empty reply" };
      await native.cancel(error.message);
      nativeSessions.forget(native);
      return { error, h1: !!o.h1 };
    }
    let firstEvent = head;
    response.events = {
      next() {
        if (firstEvent) {
          const r = firstEvent;
          firstEvent = null;
          return Promise.resolve(r);
        }
        return it.next();
      },
      return: () => it.return(),
      [Symbol.asyncIterator]() {
        return this;
      }
    };
    return response;
  } catch (e) {
    native.fail({ status: e.status ?? 502, message: e.message });
    await native.pumpTask;
    nativeSessions.forget(native);
    return { error: native.error, h1: !!o.h1 };
  }
}
async function runOnce({ tok, base, id, tools, conv, convID, signal, maxMode, params, why }) {
  const cid = convID || randomUUID5();
  ownConversation(cid);
  const since = Date.now();
  const book = ledger(tok, cid, since, signal, !!convID);
  const { first: first2, blobs } = buildRun(conv.msgs, conv.last, tools, id, cid, { maxMode, params });
  const o = await open(
    base,
    {
      "content-type": "application/connect+proto",
      "connect-protocol-version": "1",
      authorization: `Bearer ${tok}`,
      "x-cursor-client-version": await clientVersion(),
      "x-cursor-client-type": "cli",
      // else Cursor adds a prompt of its own
      "x-ghost-mode": "true",
      // privacy mode: nothing kept for training
      "x-request-id": randomUUID5(),
      ...await teamHeader(tok),
      // none of Cursor's own tools, only the caller's
      "x-cursor-agent-allowed-tools": "mcp_tool_call,get_mcp_tools_tool_call"
    },
    signal
  );
  if (o.error) return book.done(), o;
  const { session, req } = o;
  let closed = false;
  let heartbeat;
  const quiet = new Quiet(NATIVE_LIMITS, () => close(), { path: "stateless", model: id, why });
  const send = (msg) => {
    if (!closed && !req.destroyed && req.writable) {
      quiet.trace?.frame("out", msg);
      req.write(frame(msg));
    }
  };
  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    signal?.removeEventListener("abort", close);
    try {
      req.close(http2.constants.NGHTTP2_CANCEL);
    } catch {
    }
    session.close();
    setTimeout(() => session.destroy(), 1e3).unref?.();
  };
  signal?.addEventListener("abort", close, { once: true });
  if (signal?.aborted) {
    close();
    book.done();
    return cancelledOpen();
  }
  heartbeat = setInterval(() => send(pb().bytes(7, EMPTY).done()), 5e3);
  send(first2);
  if (o.status < 200 || o.status > 299) {
    const chunks = [];
    try {
      for await (const c of req) chunks.push(c);
    } catch {
    }
    close();
    book.done();
    return { error: failure2(o.status, Buffer.concat(chunks).toString("utf8").slice(0, 1 << 20)) };
  }
  const it = decode(quiet.frames(frames(req)), {
    send,
    blobs,
    tools,
    estimate: conv.estimate,
    close,
    stepUsage: book.own,
    owedUsage: book.owed,
    note: (name) => quiet.trace?.event(name)
  });
  const wrapped = (async function* () {
    try {
      for await (const v of it) {
        if (v?.error) quiet.failed(v.error);
        yield v;
      }
    } finally {
      close();
      book.done();
    }
  })();
  const head = await wrapped.next();
  if (head.done) return book.done(), { error: { status: 502, message: "an empty reply" } };
  if (head.value.error) {
    await wrapped.return();
    return { error: head.value.error, h1: !!o.h1 };
  }
  return {
    events: (async function* () {
      yield head.value;
      yield* wrapped;
    })()
  };
}
async function* decode(stream, { send, blobs, tools, estimate, close, stepUsage: stepUsage3, owedUsage, note, countWait = NATIVE_LIMITS.countWait }) {
  let calls = 0;
  let answered = 0;
  let ended = false;
  let listed = 0;
  const step = new StepCalls(fields);
  const stepDone = () => {
    if (!listed || calls + answered + step.completed < listed) return false;
    if (calls > 0) return true;
    listed = 0;
    answered = 0;
    step.nextStep();
    return false;
  };
  let said = 0;
  let wrote = 0;
  const seen = { thinking: 0, refused: /* @__PURE__ */ new Map(), updates: /* @__PURE__ */ new Map(), messages: /* @__PURE__ */ new Map() };
  const count = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
  const empty = (how) => ({ error: { status: 502, message: "an empty reply" + emptyWhy(how, seen, ended ? usage2 : null) } });
  let usage2 = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 };
  let counted2 = false;
  const finish = (more) => {
    if (!counted2 && !usage2.output) usage2.output = Math.floor((said + 3) / 4);
    if (!counted2 && !usage2.input && !usage2.cacheRead && !usage2.cacheWrite) usage2.input = estimate;
    const prompt = usage2.input + usage2.cacheRead + usage2.cacheWrite;
    const deferred2 = more && more.input + more.output + more.cacheRead + more.cacheWrite > 0;
    return {
      stop: calls > 0 ? "tool_calls" : "stop",
      usage: {
        prompt_tokens: prompt,
        completion_tokens: usage2.output,
        total_tokens: prompt + usage2.output,
        prompt_tokens_details: { cached_tokens: usage2.cacheRead, cache_write_tokens: usage2.cacheWrite },
        ...usage2.reasoning ? { completion_tokens_details: { reasoning_tokens: usage2.reasoning } } : {},
        ...deferred2 ? {
          magpie_deferred: {
            prompt_tokens: more.input + more.cacheRead + more.cacheWrite,
            completion_tokens: more.output,
            cached_tokens: more.cacheRead,
            cache_write_tokens: more.cacheWrite
          }
        } : {}
      }
    };
  };
  const settled = async () => {
    if (calls > 0 && !ended && !counted2 && stepUsage3) {
      close?.();
      const u = await stepUsage3().catch(() => null);
      if (u) usage2 = u;
      counted2 = u === false || !!u;
    }
    return finish(owedUsage ? await owedUsage(calls === 0).catch(() => null) : null);
  };
  const closeExec = (id) => send(pb().bytes(5, pb().bytes(1, pb().varint(1, id))).done());
  const it = (stream[Symbol.asyncIterator] ?? stream[Symbol.iterator]).call(stream);
  let heardAt = Date.now();
  const read = async () => {
    const next = Promise.resolve(it.next());
    if (!calls || listed || step.writing) return next;
    next.catch(() => {
    });
    let timer;
    const cut2 = new Promise((r) => {
      timer = setTimeout(() => r({ cut: true }), Math.max(0, heardAt + countWait - Date.now()));
      timer.unref?.();
    });
    try {
      return await Promise.race([next, cut2]);
    } finally {
      clearTimeout(timer);
    }
  };
  const beat = (data) => {
    try {
      const ms = fields(data);
      return ms.length > 0 && ms.every((m) => m.num === 1 && fields(m.data).every((u) => u.num === 13));
    } catch {
      return false;
    }
  };
  try {
    for (; ; ) {
      const r = await read();
      if (r.cut) {
        note?.("no count");
        yield await settled();
        return;
      }
      if (r.done) break;
      const f = r.value;
      if (f.end || !beat(f.data)) heardAt = Date.now();
      if (f.end) {
        const e = failure2(200, f.data);
        if (e.status < 200 || e.status > 299) yield { error: e };
        else if (wrote === 0 && calls === 0) yield empty(endFrame(f.data));
        else yield await settled();
        return;
      }
      for (const m of fields(f.data)) {
        switch (m.num) {
          case 1:
            for (const u of fields(m.data)) {
              const uf = fields(u.data);
              switch (u.num) {
                case 1: {
                  const t = pbStr(uf, 1);
                  if (t) {
                    said += t.length;
                    wrote += t.length;
                    yield { text: t };
                  }
                  break;
                }
                case 4: {
                  const t = pbStr(uf, 1);
                  if (t) {
                    said += t.length;
                    seen.thinking += t.length;
                    yield { reasoning: t };
                  }
                  break;
                }
                case 14:
                  usage2 = usageOf(uf);
                  ended = true;
                  if (calls === 0) {
                    yield wrote === 0 ? empty("Cursor ended the turn") : await settled();
                    return;
                  }
                  break;
                case 27:
                  listed = pbNum(uf, 1);
                  step.listed();
                  if (stepDone()) {
                    yield await settled();
                    return;
                  }
                  break;
                case 31:
                  if (!ended && uf.some((f2) => f2.num >= 2 && f2.num <= 6)) {
                    usage2 = usageOf(uf, 1);
                    counted2 = true;
                  }
                  break;
                case 2:
                // a call started on the client
                case 3:
                // a call completed: by Cursor itself when it never started here
                case 7:
                  count(seen.updates, u.num);
                  if (step.update(u.num, uf) && (note?.("completed by Cursor"), stepDone())) {
                    yield await settled();
                    return;
                  }
                  break;
                default:
                  count(seen.updates, u.num);
              }
            }
            break;
          case 2: {
            step.exec(m.data);
            const call = exec(m.data, tools, send, closeExec, seen.refused);
            if (call) {
              said += call.args.length;
              yield { tool: { index: calls++, ...call } };
            } else if (!fields(m.data).some((e) => e.num === 10)) answered++;
            if (stepDone()) {
              yield await settled();
              return;
            }
            break;
          }
          case 3:
            if (listed && step.listedAfter && calls > 0 && pendingCalls(m.data, fields) === calls) {
              note?.("waited on");
              yield await settled();
              return;
            }
            count(seen.messages, m.num);
            break;
          case 4: {
            const kv = fields(m.data);
            const id = pbNum(kv, 1);
            for (const k of kv) {
              if (k.num === 2) {
                const want = field3(fields(k.data), 1)?.data.toString("hex") ?? "";
                const b = blobs.get(want);
                const res = b ? pb().bytes(1, b) : pb().bytes(2, pb().str(1, "blob not found"));
                send(pb().bytes(3, pb().varint(1, id).bytes(2, res)).done());
              } else if (k.num === 3) {
                send(pb().bytes(3, pb().varint(1, id).bytes(3, EMPTY)).done());
              }
            }
            break;
          }
          default:
            count(seen.messages, m.num);
        }
      }
    }
    if (calls > 0) {
      yield await settled();
      return;
    }
    yield { error: { status: 502, message: "the reply broke off: EOF" } };
  } catch (e) {
    if (e?.quiet) {
      const batch = calls || listed ? `; the step's tool count ${listed || "not sent"}: ${calls} calls came, ${answered} answered here, ${step.completed} completed by Cursor` : "";
      yield { error: { status: e.status, message: batch ? e.message.replace(/( \(try again\))?$/, batch + "$1") : e.message } };
      return;
    }
    if (calls > 0 && /EOF/.test(e?.message ?? "")) {
      yield await settled();
      return;
    }
    yield { error: { status: 502, message: "the reply broke off: " + (e?.message ?? e) } };
  } finally {
    Promise.resolve(it.return?.()).catch(() => {
    });
  }
}
function endFrame(data) {
  const t = Buffer.from(data ?? []).toString("utf8").trim();
  if (!t || t === "{}") return "the Run's stream ended (an empty end frame)";
  return `the Run's stream ended (end frame: ${t.length > 300 ? t.slice(0, 300) + "\u2026" : t})`;
}
function emptyWhy(how, seen, usage2) {
  const list = (m) => [...m].map(([k, n]) => n > 1 ? `#${k} \xD7${n}` : `#${k}`).join(", ");
  const parts = [how];
  parts.push(seen.thinking ? `after ${seen.thinking} chars of thinking, no text and no tool call` : "with no thinking, no text and no tool call");
  if (usage2) parts.push(`Cursor counted ${usage2.output} output tokens`);
  if (seen.refused.size) parts.push(`Cursor's own tools asked for and refused: ${list(seen.refused)}`);
  if (seen.updates.size) parts.push(`updates not read: ${list(seen.updates)}`);
  if (seen.messages.size) parts.push(`messages not read: ${list(seen.messages)}`);
  return ` (${parts.join("; ")}; try again)`;
}
function exec(msg, tools, send, closeExec, refused, native = false) {
  const es = native ? nativeFields(msg) : fields(msg);
  if (native && es.some((e) => e.num === 1 && (e.wire !== 0 || !Number.isInteger(e.n) || e.n < 0 || e.n > 4294967295)))
    throw new NativeSessionError(502, "invalid native exec request ID");
  const id = pbNum(es, 1);
  const execID = pbStr(es, 15);
  let nativeCall, nativeUnavailable = false;
  if (native) {
    for (const e of es) if (e.num === 11) {
      if (e.wire !== 2) throw new NativeSessionError(502, "invalid native MCP argument envelope");
      const { fields: a, args } = nativeMcpArgs(e.data);
      const name = pbStr(a, 5) || bareName(pbStr(a, 1));
      const provider2 = pbStr(a, 4);
      const server = pbStr(a, 9);
      if (provider2 && !NAMESPACES.includes(provider2) || server && !NAMESPACES.includes(server)) nativeUnavailable = true;
      if (pbNum(a, 7) || field3(a, 6)) nativeUnavailable = true;
      if (!tools.some((t) => t.name === name)) nativeUnavailable = true;
      if (!pbStr(a, 5) && !NAMESPACES.some((ns) => pbStr(a, 1) === ns + "-" + name)) nativeUnavailable = true;
      const call = { requestID: id, execID, nativeID: pbStr(a, 3), name, args };
      if (nativeCall && !isDeepStrictEqual(nativeCall, call)) throw new NativeSessionError(502, "ambiguous repeated native MCP argument envelopes");
      nativeCall ??= call;
    }
  }
  const answer2 = (num2, res) => {
    send(pb().bytes(2, pb().varint(1, id).str(15, execID).bytes(num2, res)).done());
    closeExec(id);
  };
  const unavailable = () => {
    const kind = es.find((e) => ![1, 15, 19, 55].includes(e.num))?.num ?? 0;
    refused?.set(kind, (refused.get(kind) ?? 0) + 1);
    send(pb().bytes(5, pb().bytes(2, pb().varint(1, id).str(2, "not available"))).done());
    closeExec(id);
    return null;
  };
  if (nativeUnavailable) return unavailable();
  for (const e of es) {
    switch (e.num) {
      case 11: {
        if (native) return { ...nativeCall, args: JSON.stringify(nativeCall.args) };
        const a = fields(e.data);
        const args = {};
        for (const kv of a) {
          if (kv.num !== 2) continue;
          const ef = fields(kv.data);
          const v = field3(ef, 2);
          args[pbStr(ef, 1)] = v ? pbAny(v.data) : null;
        }
        const name = pbStr(a, 5) || bareName(pbStr(a, 1));
        const cid = pbStr(a, 3).replaceAll("\n", "__") || "call_" + randomBytes4(12).toString("hex");
        return { id: cid, name, args: JSON.stringify(args) };
      }
      case 36: {
        const srv = pb().str(1, NS).str(2, NS).str(7, "connected");
        for (const t of tools) srv.bytes(5, toolDef(t));
        answer2(36, pb().bytes(1, pb().bytes(1, srv)));
        return null;
      }
      case 10:
        answer2(10, pb().bytes(1, pb().bytes(1, pb().bytes(4, env()))));
        return null;
    }
  }
  return unavailable();
}
var errorResponse = ({ status, message: message2 }) => new Response(JSON.stringify({ error: { message: message2, type: "cursor_error", code: status } }), {
  status,
  headers: { "Content-Type": "application/json", "X-Magpie-Sign-In": "kept" }
});
function kept(res) {
  if (res.headers.has("X-Magpie-Sign-In")) return res;
  const headers2 = new Headers(res.headers);
  headers2.set("X-Magpie-Sign-In", "kept");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: headers2 });
}
var answer = async (auth, chat, signal, session) => kept(await answerOf(auth, chat, signal, session));
var maxOnly = /* @__PURE__ */ new Set();
var maxRequired = (msg) => /max[ _]mode[ _]required|requires max mode/i.test(String(msg ?? ""));
async function answerOf(auth, chat, signal, session = "") {
  let tok;
  try {
    tok = await tokenOf(auth);
  } catch (e) {
    return errorResponse({ status: e.status ?? 401, message: e.message });
  }
  if (signal?.aborted) return errorResponse({ status: 410, message: "the request was cancelled" });
  const tools = toolsOf(chat);
  const convID = conversationID(chat, session);
  const prepared = nativeSessions.prepare(tok, chat, convID, tools);
  let r;
  if (prepared.owner) r = prepared.owner.resume({ ...prepared, estimate: conversation(chat, tools).estimate }, signal);
  const model = String(chat.model ?? "");
  if (!r) {
    const raw = await listFor(tok);
    const tier = chat.service_tier;
    const fast = tier === "priority" || tier === "fast" ? true : tier ? false : void 0;
    const req = request(raw, model, chat.reasoning_effort ?? "", fast);
    const id = req.id;
    const params = req.params;
    let maxMode = req.maxMode || maxOnly.has(id);
    const conv = conversation(chat, tools);
    let base = await agentURL(tok, false);
    const once = async () => {
      const native = prepared.fallback ? null : nativeSessions.create(prepared, { id, maxMode, params }, { pb, exec, usageOf, failure: failure2 });
      const args = { tok, base, id, tools, conv, convID, signal, maxMode, params };
      let response = native ? await runNative({ ...args, native }) : await runOnce({ ...args, why: prepared.fallback || "retention capacity or reservation unavailable" });
      const rebuild = async () => {
        const why = response.error?.continuityReason || "missing-batch-count";
        const fallback = await runOnce({ ...args, why });
        fallback.diagnostic = "stateless; bootstrap=imported-history; reason=" + why;
        return fallback;
      };
      if (response.error?.retentionIneligible && !signal?.aborted) response = await rebuild();
      else if (native) response.rebuild = rebuild;
      response.diagnostic ??= "stateless; bootstrap=imported-history; reason=" + (prepared.fallback || "retention capacity or reservation unavailable");
      return response;
    };
    r = await once();
    if (r.error && regional(r.error.message)) {
      const viaH1 = !!r.h1;
      h1Until = 0;
      const fresh = await agentURL(tok, true);
      if (fresh !== base || viaH1) {
        base = fresh;
        r = await once();
      }
    }
    if (r.error && !maxMode && maxRequired(r.error.message)) {
      maxMode = true;
      maxOnly.add(id);
      r = await once();
    }
  }
  if (r.error) return errorResponse(r.error);
  const it = r.events;
  let head = await it.next();
  if (head.value?.error) return errorResponse(head.value.error);
  let events = {
    next() {
      if (head) {
        const value = head;
        head = null;
        return Promise.resolve(value);
      }
      return it.next();
    },
    return: () => it.return?.(),
    [Symbol.asyncIterator]() {
      return this;
    }
  };
  const responseHeaders = { "X-Magpie-Cursor-Continuity": r.diagnostic };
  const cid = "chatcmpl-" + randomBytes4(12).toString("hex");
  const created = Math.floor(Date.now() / 1e3);
  if (!chat.stream) {
    while (true) {
      let retry = false;
      const msg = { role: "assistant", content: "" };
      let reasoning = "";
      const calls = [];
      let stop = "stop";
      let usage2;
      for await (const e of events) {
        if (e.error) {
          if (!e.error.retentionIneligible || !r.rebuild || signal?.aborted) return errorResponse(e.error);
          const reason = e.error.continuityReason;
          r = await r.rebuild();
          if (r.error) return errorResponse(r.error);
          if (reason) r.diagnostic = "stateless; bootstrap=imported-history; reason=" + reason;
          events = r.events;
          responseHeaders["X-Magpie-Cursor-Continuity"] = r.diagnostic;
          retry = true;
          break;
        }
        if (e.text) msg.content += e.text;
        if (e.reasoning) reasoning += e.reasoning;
        if (e.tool) calls.push({ id: e.tool.id, type: "function", function: { name: e.tool.name, arguments: e.tool.args } });
        if (e.stop) [stop, usage2] = [e.stop, e.usage];
      }
      if (retry) continue;
      if (reasoning) msg.reasoning_content = reasoning;
      if (calls.length) msg.tool_calls = calls;
      r.delivered?.();
      return Response.json({ id: cid, object: "chat.completion", created, model, choices: [{ index: 0, message: msg, finish_reason: stop }], ...usage2 ? { usage: usage2 } : {} }, { headers: responseHeaders });
    }
  }
  const chunk = (delta, finish_reason = null, extra = {}) => enc.encode(`data: ${JSON.stringify({ id: cid, object: "chat.completion.chunk", created, model, choices: [{ index: 0, delta, finish_reason }], ...extra })}

`);
  let began = false;
  const stream = new ReadableStream({
    async pull(ctl) {
      const next = await events.next();
      if (!began) {
        began = true;
        ctl.enqueue(chunk({ role: "assistant", content: "" }));
      }
      if (next.done) {
        r.delivered?.();
        ctl.enqueue(enc.encode("data: [DONE]\n\n"));
        return ctl.close();
      }
      const e = next.value;
      if (e.text) ctl.enqueue(chunk({ content: e.text }));
      else if (e.reasoning) ctl.enqueue(chunk({ reasoning_content: e.reasoning }));
      else if (e.tool) ctl.enqueue(chunk({ tool_calls: [{ index: e.tool.index, id: e.tool.id, type: "function", function: { name: e.tool.name, arguments: e.tool.args } }] }));
      else if (e.stop) ctl.enqueue(chunk({}, e.stop, e.usage ? { usage: e.usage } : {}));
      else if (e.error) {
        ctl.enqueue(enc.encode(`data: ${JSON.stringify({ error: { message: e.error.message, code: e.error.status } })}

`));
        ctl.close();
      }
    },
    async cancel() {
      await r.cancel?.();
      await events.return();
    }
  });
  return new Response(stream, { status: 200, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", ...responseHeaders } });
}
async function CursorAuthPlugin(input) {
  const includedOnly = () => {
    try {
      return input?.magpie?.option?.(ID, INCLUDED_ONLY) === true;
    } catch {
      return false;
    }
  };
  setWireTrace(() => {
    try {
      return input?.magpie?.option?.(ID, WIRE_TRACE) === true && input.directory ? join2(input.directory, "cursor-traces") : "";
    } catch {
      return "";
    }
  });
  return {
    auth: {
      provider: ID,
      async loader(getAuth) {
        const auth = await getAuth();
        if (!auth || auth.type !== "oauth" && auth.type !== "api") return {};
        return {
          baseURL: AGENT,
          apiKey: "cursor",
          // every chat completion run on Cursor's agent API, with the
          // sign-in as it is now
          async fetch(input2, init = {}) {
            const url = typeof input2 === "string" ? input2 : input2 instanceof URL ? input2.href : input2.url;
            if (!/\/chat\/completions$/.test(new URL(url).pathname))
              return errorResponse({ status: 404, message: "only chat completions are served" });
            let chat;
            try {
              const b = init.body ?? (input2 instanceof Request ? await input2.clone().text() : void 0);
              chat = JSON.parse(typeof b === "string" ? b : new TextDecoder().decode(b));
            } catch {
              return errorResponse({ status: 400, message: "a request that isn't JSON" });
            }
            const session = new Headers(init.headers ?? (input2 instanceof Request ? input2.headers : void 0)).get(SESSION) ?? "";
            return answer(await getAuth() ?? auth, chat, init.signal ?? (input2 instanceof Request ? input2.signal : void 0), session);
          }
        };
      },
      methods: [
        { type: "oauth", label: "Cursor (browser)", authorize: browserSignIn },
        { type: "oauth", label: "cursor-agent's sign-in", authorize: cliSignIn },
        { type: "api", label: "Cursor API key (cursor.com/dashboard \u2192 Integrations)" }
      ],
      // magpie's own switches (input.magpie.option), read at each usage
      // reading
      options: [
        {
          key: INCLUDED_ONLY,
          label: "Included usage only",
          description: "Keeps an account in routing only while its included usage lasts: once an included pool (Cursor Models, Other Models, a newer plan's Weekly) is used up, magpie moves its models to the next account until it resets, even if on-demand or free credit could pay."
        },
        {
          key: WIRE_TRACE,
          label: "Wire trace",
          description: "For a bug report: when a Cursor request fails, saves the shape of what Cursor sent and what was sent back (each frame's kind, field numbers, size and time) to the cursor-traces folder in magpie's folder. No prompt or reply text, tool names or arguments, tokens, headers or account ids are written. The newest 20 are kept."
        }
      ],
      // magpie's: how much of the plan's included usage is gone (the plan
      // is the one the sign-in read). The built-in's read, clean or not,
      // neither marked the account nor cleared it.
      async usage(getAuth, provider2) {
        let tok;
        try {
          tok = await tokenOf(await getAuth());
        } catch (e) {
          return { error: e.message, windows: [], signIn: "kept" };
        }
        const info = planOf(tok);
        const [u, { plan }, bot] = await Promise.all([usage(tok, Object.keys(provider2?.models ?? {}), includedOnly(), info), info, botUsage(tok)]);
        const last = (w) => w.name === "Total" || w.name === "On-demand" && w.aside;
        const { credits: free = [], ...read } = u;
        const windows = [...read.windows.filter((w) => !last(w)), ...bot, ...free, ...read.windows.filter(last)];
        return { ...read, windows, ...plan ? { plan } : {}, signIn: "kept" };
      },
      // magpie's: the account's calls from since (ms) on that didn't go
      // through magpie, for its Usage page (callsOf). A failure is thrown:
      // magpie reads them again from the same time.
      async calls(getAuth, provider2, { since = Date.now() - 30 * 864e5, signal } = {}) {
        const tok = await tokenOf(await getAuth());
        return { calls: await callsOf(tok, Math.max(0, Number(since) || 0), signal) };
      }
    },
    // the session the request is part of, for the conversation_id
    // (conversationID): magpie and OpenCode name it here, and the loader's
    // fetch reads it back. Every plugin's hook sees every provider's
    // requests, so it is put on Cursor's alone.
    async "chat.headers"(input2, output) {
      if (input2?.model?.providerID !== ID && input2?.provider?.info?.id !== ID) return;
      const s = sessionOf(input2);
      if (s) output.headers[SESSION] = s;
    },
    async config(config) {
      config.provider ??= {};
      const was = config.provider[ID] ?? {};
      config.provider[ID] = {
        name: "Cursor",
        npm: CHAT,
        api: AGENT,
        ...was,
        models: {
          auto: { name: "Auto", limit: { context: DEFAULT_CONTEXT, output: 0 }, attachment: true, tool_call: true },
          ...was.models ?? {}
        }
      };
    },
    // the account's list: each picker model once for each context size,
    // with that window
    provider: {
      id: ID,
      async models(provider2, { auth } = {}) {
        if (!auth) return provider2.models;
        const tok = await tokenOf(auth);
        return Object.fromEntries((await usable(tok)).map((m) => [m.id, runtimeModel(m)]));
      }
    }
  };
}
var _internal = { mine, ownConversation, callsOf, slugFor, fromCatalog, credits, kvReply, listFor, lists, keychain, keychainToken, nativeTransport, onDemandOf, resetH1: () => h1Until = 0, onH1: () => Date.now() < h1Until, resetTeam: () => {
  teamRead.at = 0;
  teamRead.info = null;
}, expireTeam: () => teamRead.at = 0, H2, H1, h2Blocked, open, openH1, openH2, STEP_WAIT, stepUsage, usageKey, ledger, owed, flights, misses, unreadable, catalog, usable, request, modelsOf, tokensOf, maxRequired, conversationID, usageOf, sessionOf, SESSION, errorResponse, kept, poolBase, conversation, buildRun, decode, exec, fields, pb, pbValue, pbAny, frame, frames, failure: failure2, toolsOf, expiry };

// src/auth.js
import { execFile as execFile2 } from "node:child_process";
import { createHash as createHash11 } from "node:crypto";
import { readFile as readFile2 } from "node:fs/promises";
import { homedir as homedir2, platform as platform2 } from "node:os";
import { join as join3 } from "node:path";

// ../dsh-cursor/lib/oauth.js
import { createHash as createHash10, randomBytes as randomBytes5, randomUUID as randomUUID6 } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
var LOGIN_URL = "https://cursor.com/loginDeepControl";
var POLL_URL = "https://api2.cursor.sh/auth/poll";
var REFRESH_URL = "https://api2.cursor.sh/oauth/token";
var IDE_CLIENT_ID = "KbZUR41cY7W6zRSdpSUJ7I7mLYBKOCmB";
var MAX_AUTH_RESPONSE_BYTES = 64 * 1024;
function cursorAuthError(code) {
  const messages = {
    AUTH: "\u8BF7\u91CD\u65B0\u767B\u5F55 Cursor",
    CANCELLED: "Cursor \u8BF7\u6C42\u5DF2\u53D6\u6D88",
    TIMEOUT: "Cursor \u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5",
    NETWORK: "\u65E0\u6CD5\u8FDE\u63A5 Cursor\uFF0C\u8BF7\u91CD\u8BD5",
    RATE_LIMIT: "Cursor \u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
    PROVIDER_ERROR: "Cursor \u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
    PROVIDER_RESPONSE: "Cursor \u8FD4\u56DE\u4E86\u65E0\u6548\u54CD\u5E94\uFF0C\u8BF7\u91CD\u8BD5"
  };
  return new LlmError(messages[code] ?? messages.PROVIDER_RESPONSE, code);
}
function checkCursorSignal(signal) {
  if (signal?.aborted) throw cursorAuthError(signal.reason?.name === "TimeoutError" ? "TIMEOUT" : "CANCELLED");
}
async function cursorAbortable(operation, signal) {
  if (signal?.aborted) {
    void Promise.resolve(operation).catch(() => {
    });
    checkCursorSignal(signal);
  }
  if (!signal) return await operation;
  let withdraw2;
  const cancelled = new Promise((resolve, reject) => {
    withdraw2 = () => reject(cursorAuthError(signal.reason?.name === "TimeoutError" ? "TIMEOUT" : "CANCELLED"));
    signal.addEventListener("abort", withdraw2, { once: true });
  });
  try {
    return await Promise.race([operation, cancelled]);
  } catch (error) {
    checkCursorSignal(signal);
    throw error;
  } finally {
    signal.removeEventListener("abort", withdraw2);
  }
}
async function withCursorDeadline(signals, timeoutMs, run3) {
  const controller = new AbortController();
  const signal = AbortSignal.any([...signals.filter(Boolean), controller.signal]);
  const timer = setTimeout(() => controller.abort(new DOMException("Cursor deadline", "TimeoutError")), timeoutMs);
  try {
    checkCursorSignal(signal);
    return await cursorAbortable(Promise.resolve().then(() => run3(signal)), signal);
  } finally {
    clearTimeout(timer);
  }
}
function cursorTokenExpiry(access, now = Date.now()) {
  const parts = access.split(".");
  if (parts.length === 3 && parts[1]) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (typeof payload?.exp === "number" && Number.isFinite(payload.exp) && payload.exp > 0) {
        const expires = payload.exp * 1e3;
        if (Number.isFinite(expires)) return expires;
      }
    } catch {
    }
  }
  return now + 60 * 60 * 1e3;
}
async function fetchAuth(fetchImpl, url, init, signal) {
  try {
    return await cursorAbortable(Promise.resolve().then(() => fetchImpl(url, {
      ...init,
      headers: { ...init.headers, ...attributionHeaders() },
      signal
    })).then((response) => {
      if (signal?.aborted) {
        void discard(response);
        checkCursorSignal(signal);
      }
      return response;
    }), signal);
  } catch (error) {
    checkCursorSignal(signal);
    if (error instanceof LlmError) throw error;
    throw cursorAuthError("NETWORK");
  }
}
async function readAuthJson(response, signal) {
  if (!response.body) throw cursorAuthError("PROVIDER_RESPONSE");
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  let completed = false;
  try {
    while (true) {
      const { done, value: value2 } = await cursorAbortable(reader.read(), signal);
      if (done) break;
      size += value2.byteLength;
      if (size > MAX_AUTH_RESPONSE_BYTES) throw cursorAuthError("PROVIDER_RESPONSE");
      chunks.push(value2);
    }
    completed = true;
    checkCursorSignal(signal);
    const body = Buffer.concat(chunks, size).toString("utf8");
    let value;
    try {
      value = JSON.parse(body);
    } catch {
      throw cursorAuthError("PROVIDER_RESPONSE");
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw cursorAuthError("PROVIDER_RESPONSE");
    return value;
  } catch (error) {
    checkCursorSignal(signal);
    if (error instanceof LlmError) throw error;
    throw cursorAuthError("NETWORK");
  } finally {
    if (!completed) void reader.cancel().catch(() => {
    });
    reader.releaseLock();
  }
}
function httpError2(status) {
  if (status === 401 || status === 403) return cursorAuthError("AUTH");
  if (status === 429) return cursorAuthError("RATE_LIMIT");
  return cursorAuthError(status >= 500 ? "PROVIDER_ERROR" : "PROVIDER_RESPONSE");
}
async function discard(response) {
  if (response.body) void response.body.cancel().catch(() => {
  });
}
function nonempty(value) {
  return typeof value === "string" && value.length > 0 && !/[\r\n]/u.test(value);
}
async function loginCursorOAuth({
  signal,
  notify,
  fetch: fetchImpl = globalThis.fetch,
  timeoutMs = 5 * 60 * 1e3,
  requestTimeoutMs = 15e3,
  pollDelayMs = 1e3
} = {}) {
  return await withCursorDeadline([signal], timeoutMs, async (loginSignal) => {
    const verifier = randomBytes5(32).toString("base64url");
    const challenge = createHash10("sha256").update(verifier).digest("base64url");
    const uuid2 = randomUUID6();
    const params = new URLSearchParams({ challenge, uuid: uuid2, mode: "login", redirectTarget: "cli" });
    notify({ message: "\u8BF7\u624B\u52A8\u6253\u5F00\u94FE\u63A5\u767B\u5F55 Cursor\uFF0C\u5B8C\u6210\u540E\u6B64\u5904\u4F1A\u81EA\u52A8\u7EE7\u7EED", url: `${LOGIN_URL}?${params}` });
    const pollUrl = new URL(POLL_URL);
    pollUrl.search = new URLSearchParams({ uuid: uuid2, verifier }).toString();
    let errors = 0;
    let waitMs = pollDelayMs;
    for (let attempt = 0; attempt < 150; attempt += 1) {
      checkCursorSignal(loginSignal);
      if (attempt > 0) {
        await cursorAbortable(delay(waitMs, void 0, { signal: loginSignal }), loginSignal);
      }
      try {
        const tokens = await withCursorDeadline([loginSignal], requestTimeoutMs, async (requestSignal) => {
          const response = await fetchAuth(fetchImpl, pollUrl, { method: "GET", headers: { accept: "application/json" } }, requestSignal);
          if (response.status === 404) {
            await discard(response);
            return void 0;
          }
          if (!response.ok) {
            await discard(response);
            throw httpError2(response.status);
          }
          const data = await readAuthJson(response, requestSignal);
          if (!nonempty(data.accessToken) || !nonempty(data.refreshToken)) throw cursorAuthError("PROVIDER_RESPONSE");
          return { access: data.accessToken, refresh: data.refreshToken, expires: cursorTokenExpiry(data.accessToken) };
        });
        if (tokens) return tokens;
        errors = 0;
        waitMs = Math.min(waitMs * 1.2, 1e4);
      } catch (error) {
        checkCursorSignal(loginSignal);
        if (!(error instanceof LlmError) || error.code === "AUTH") throw error;
        errors += 1;
        if (errors >= 3) throw error;
      }
    }
    throw cursorAuthError("TIMEOUT");
  });
}
async function refreshCursorOAuth(grant, { signal, fetch: fetchImpl = globalThis.fetch } = {}) {
  return await withCursorDeadline([signal], 15e3, async (requestSignal) => {
    const response = await fetchAuth(fetchImpl, REFRESH_URL, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", client_id: IDE_CLIENT_ID, refresh_token: grant.refresh })
    }, requestSignal);
    if (!response.ok) {
      if (response.status === 400) {
        const data2 = await readAuthJson(response, requestSignal);
        if (data2.error === "invalid_grant") throw cursorAuthError("AUTH");
      } else {
        await discard(response);
      }
      throw httpError2(response.status);
    }
    const data = await readAuthJson(response, requestSignal);
    if (data.shouldLogout === true || data.error === "invalid_grant") throw cursorAuthError("AUTH");
    if (!nonempty(data.access_token)) throw cursorAuthError("PROVIDER_RESPONSE");
    return {
      access: data.access_token,
      refresh: nonempty(data.refresh_token) ? data.refresh_token : grant.refresh,
      expires: cursorTokenExpiry(data.access_token)
    };
  });
}

// src/auth.js
var PROVIDER = "cursor";
var CLI_MARK2 = "cursor-agent";
var API2 = "https://api2.cursor.sh";
var REFRESH_SKEW_MS = 6e4;
var CLI_RENEW_MS = 5 * 6e4;
var CLI_READ_TTL_MS = 1e4;
var run2 = (file, args) => new Promise((resolve) => execFile2(file, args, { timeout: 2e4 }, (error, stdout) => resolve({ ok: !error, out: String(stdout ?? "") })));
var cliRead = { at: 0, token: "" };
async function cliToken2(fresh = false) {
  if (!fresh && Date.now() - cliRead.at < CLI_READ_TTL_MS) return cliRead.token;
  let token = "";
  if (platform2() === "darwin") {
    const result2 = await run2("security", ["find-generic-password", "-s", "cursor-access-token", "-a", "cursor-user", "-w"]);
    if (result2.ok) token = result2.out.trim();
  }
  if (!token) {
    const dir = process.env.XDG_CONFIG_HOME ? join3(process.env.XDG_CONFIG_HOME, "cursor") : join3(homedir2(), ".cursor");
    try {
      token = JSON.parse(await readFile2(join3(dir, "auth.json"), "utf8"))?.accessToken ?? "";
    } catch {
    }
  }
  cliRead = { at: Date.now(), token };
  return token;
}
async function cliGrantToken() {
  let token = await cliToken2();
  if (token && cursorTokenExpiry(token) - Date.now() < CLI_RENEW_MS) {
    for (const file of [join3(homedir2(), ".local", "bin", "cursor-agent"), "cursor-agent"]) {
      if ((await run2(file, ["status"])).ok) break;
    }
    token = await cliToken2(true);
  }
  if (!token) throw new LlmError("cursor-agent isn't signed in: run `cursor-agent login`, or sign in to Cursor again in magpie", "CURSOR_AUTH_REQUIRED");
  if (cursorTokenExpiry(token) <= Date.now()) throw new LlmError("cursor-agent's sign-in has run out: run `cursor-agent login` again", "CURSOR_AUTH_REQUIRED");
  return token;
}
var loginIdOf = (record) => record.accountId || createHash11("sha256").update(record.type === "api" ? record.key : record.refresh ?? "").digest("hex").slice(0, 24);
var exchanged2 = /* @__PURE__ */ new Map();
async function keyToken2(key) {
  const id = createHash11("sha256").update(key).digest("hex");
  const had = exchanged2.get(id);
  if (had && had.expires - Date.now() > CLI_RENEW_MS) return had.access;
  const response = await fetch(`${API2}/auth/exchange_user_api_key`, {
    method: "POST",
    body: "{}",
    signal: AbortSignal.timeout(15e3),
    headers: { "content-type": "application/json", authorization: `Bearer ${key}`, "x-cursor-client-type": "cli", "x-ghost-mode": "true" }
  });
  if (response.status >= 500) throw new LlmError(`Cursor's API key exchange answered HTTP ${response.status}`, "PROVIDER_ERROR", { status: 502 });
  const access = response.ok ? (await response.json().catch(() => null))?.accessToken : void 0;
  if (!access) throw new LlmError("Cursor didn't take this API key", "CURSOR_AUTH_REQUIRED");
  exchanged2.set(id, { access, expires: cursorTokenExpiry(access) });
  return access;
}
async function cursorUnary(path, token, body = {}, signal = AbortSignal.timeout(15e3)) {
  const response = await fetch(`${API2}/${path}`, {
    method: "POST",
    signal,
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${token}`,
      "x-cursor-client-type": "cli",
      "x-ghost-mode": "true"
    }
  });
  if (!response.ok) throw new LlmError(`Cursor ${path} answered HTTP ${response.status}`, "PROVIDER_ERROR", { status: response.status });
  return await response.json();
}
async function whoIs2(token) {
  const [me, plan] = await Promise.allSettled([
    cursorUnary("aiserver.v1.DashboardService/GetMe", token),
    cursorUnary("aiserver.v1.DashboardService/GetPlanInfo", token)
  ]);
  return {
    email: me.status === "fulfilled" ? String(me.value?.email ?? "").trim() : "",
    plan: plan.status === "fulfilled" ? String(plan.value?.planInfo?.planName ?? "").trim() : ""
  };
}
function createCursorAuth(getAuth, client) {
  const renewed = /* @__PURE__ */ new Map();
  let refreshing;
  const current = async () => {
    const record = await getAuth();
    if (record?.type === "api") return record.key ? record : void 0;
    if (record?.type !== "oauth") return void 0;
    return renewed.get(record.refresh) ?? record;
  };
  async function getGrant(signal) {
    const record = await current();
    if (!record) throw new LlmError("Cursor is not signed in: sign in to Cursor in magpie", "CURSOR_AUTH_REQUIRED");
    const loginId = loginIdOf(record);
    if (record.type === "api") return { type: "oauth", loginId, access: await keyToken2(record.key), refresh: "api-key", expires: 0 };
    if (record.refresh === CLI_MARK2) return { type: "oauth", loginId, access: await cliGrantToken(), refresh: CLI_MARK2, expires: 0 };
    if (record.access && (record.expires || cursorTokenExpiry(record.access)) - Date.now() > REFRESH_SKEW_MS) {
      return { type: "oauth", loginId, access: record.access, refresh: record.refresh, expires: record.expires };
    }
    refreshing ??= (async () => {
      const tokens = await refreshCursorOAuth(record, { signal });
      const next2 = { ...record, ...tokens };
      renewed.set(record.refresh, next2);
      renewed.set(next2.refresh, next2);
      await client?.auth?.set?.({ path: { id: PROVIDER }, body: next2 }).catch(() => {
      });
      return next2;
    })().finally(() => {
      refreshing = void 0;
    });
    const next = await refreshing;
    return { type: "oauth", loginId, access: next.access, refresh: next.refresh, expires: next.expires };
  }
  async function metadata() {
    const record = await current();
    return record ? { configured: true, loginId: loginIdOf(record), needsLogin: false } : { configured: false, needsLogin: true };
  }
  return { getGrant, metadata };
}
var signInMethods = [
  {
    type: "oauth",
    label: "Cursor (browser)",
    async authorize() {
      let shown;
      const url = new Promise((resolve) => {
        shown = resolve;
      });
      const login = loginCursorOAuth({ notify: (notice) => shown(notice.url) });
      login.catch(() => shown(""));
      return {
        url: await url,
        instructions: "Sign in to Cursor in the browser; this finishes by itself.",
        method: "auto",
        async callback() {
          try {
            const tokens = await login;
            const who = await whoIs2(tokens.access);
            return {
              type: "success",
              access: tokens.access,
              refresh: tokens.refresh,
              expires: tokens.expires,
              ...who.email ? { accountId: who.email } : {},
              ...who.plan ? { plan: who.plan } : {}
            };
          } catch (error) {
            return { type: "failed", error: error.message };
          }
        }
      };
    }
  },
  {
    type: "oauth",
    label: "cursor-agent's sign-in",
    async authorize() {
      return {
        url: "",
        instructions: "Uses the account `cursor-agent login` signed in to.",
        method: "auto",
        async callback() {
          const token = await cliToken2(true);
          if (!token) return { type: "failed", error: "cursor-agent isn't signed in: run `cursor-agent login`" };
          if (cursorTokenExpiry(token) <= Date.now()) return { type: "failed", error: "cursor-agent's sign-in has run out: run `cursor-agent login` again" };
          const who = await whoIs2(token);
          if (!who.email) return { type: "failed", error: "Cursor couldn't say which account is signed in" };
          return { type: "success", access: "", refresh: CLI_MARK2, expires: 0, accountId: who.email, ...who.plan ? { plan: who.plan } : {} };
        }
      };
    }
  },
  { type: "api", label: "Cursor API key (cursor.com/dashboard \u2192 Integrations)" }
];

// src/chat.js
import { createHash as createHash12, randomUUID as randomUUID7 } from "node:crypto";
var SESSION_HEADER = "x-magpie-cursor-session";
var PARKED_MS = 30 * 6e4;
var HEADER_WAIT_MS = 1e4;
var KEEPALIVE_MS = 15e3;
var REBUILD = /* @__PURE__ */ new Set([
  "CURSOR_CONTEXT_CHANGED",
  "CURSOR_TOOL_RESULT_MISMATCH",
  "CURSOR_TOOL_RESULT_DUPLICATE",
  "CURSOR_TOOL_RESULT_MISSING",
  "CURSOR_RUN_LOST",
  "CURSOR_RUN_BUSY",
  "CURSOR_TURN_CLOSED"
]);
function conversationKey(chat, session, system) {
  const key = (typeof chat.prompt_cache_key === "string" ? chat.prompt_cache_key.trim() : "") || session || "";
  const first2 = (chat.messages ?? []).find((message2) => message2?.role === "user");
  return createHash12("sha256").update(JSON.stringify(["cursor conversation", key, key ? "" : system, first2?.content ?? ""])).digest("hex");
}
function statusOf2(error) {
  if (Number.isInteger(error?.status) && error.status >= 400 && error.status < 600) return error.status;
  switch (error?.code) {
    case "CURSOR_AUTH_REQUIRED":
    case "AUTH":
      return 401;
    case "RATE_LIMIT":
      return 429;
    case "MODEL_NOT_FOUND":
    case "CURSOR_MODEL_UNAVAILABLE":
      return 404;
    case "ABORTED":
    case "CANCELLED":
      return 499;
    case "INVALID_REASONING_EFFORT":
    case "UNSUPPORTED_CONTENT":
    case "UNSUPPORTED_OPTION":
    case "INVALID_TOOL_RESULT":
    case "INVALID_REQUEST":
      return 400;
    default:
      return 502;
  }
}
var headers = { "x-magpie-sign-in": "kept" };
function errorResponse2(error) {
  const status = statusOf2(error);
  return new Response(
    JSON.stringify({ error: { message: error?.message ?? String(error), code: error?.code ?? status } }),
    { status, headers: { ...headers, "content-type": "application/json" } }
  );
}
function counted(usage2) {
  return {
    input: usage2.inputTokens ?? 0,
    output: usage2.outputTokens ?? 0,
    cacheRead: usage2.cacheReadTokens ?? 0,
    cacheWrite: usage2.cacheWriteTokens ?? 0,
    reasoning: usage2.reasoningTokens ?? 0
  };
}
var zero = () => ({ prompt: 0, completion: 0, cacheRead: 0, cacheWrite: 0 });
var add = (sum, part) => {
  for (const key of Object.keys(sum)) sum[key] += part[key];
  return sum;
};
var tally = (call) => ({ prompt: call.input + call.cacheRead + call.cacheWrite, completion: call.output, cacheRead: call.cacheRead, cacheWrite: call.cacheWrite });
function stepUsage2(diagnostics, occupancy, reported, final) {
  const calls = (diagnostics?.modelCalls ?? []).map(counted);
  const deferred2 = zero();
  let main;
  if (calls.length) {
    const last = calls.at(-1);
    main = { ...tally(last), reasoning: last.reasoning };
    for (const call of calls.slice(0, -1)) add(deferred2, tally(call));
  } else if (occupancy) {
    main = { prompt: occupancy.inputTokens, completion: occupancy.outputTokens, cacheRead: 0, cacheWrite: 0, reasoning: 0 };
  }
  if (main) add(reported, { prompt: main.prompt, completion: main.completion, cacheRead: main.cacheRead, cacheWrite: main.cacheWrite });
  add(reported, deferred2);
  if (final && diagnostics?.turnUsage) {
    const turn = tally(counted(diagnostics.turnUsage));
    for (const key of Object.keys(turn)) {
      const rest = Math.max(0, turn[key] - reported[key]);
      deferred2[key] += rest;
      reported[key] += rest;
    }
  }
  if (!main && !deferred2.prompt && !deferred2.completion) return void 0;
  main ??= { prompt: 0, completion: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0 };
  return {
    prompt_tokens: main.prompt,
    completion_tokens: main.completion,
    total_tokens: main.prompt + main.completion,
    prompt_tokens_details: { cached_tokens: main.cacheRead, cache_write_tokens: main.cacheWrite },
    ...main.reasoning ? { completion_tokens_details: { reasoning_tokens: main.reasoning } } : {},
    ...deferred2.prompt || deferred2.completion ? { magpie_deferred: {
      prompt_tokens: deferred2.prompt,
      completion_tokens: deferred2.completion,
      cached_tokens: deferred2.cacheRead,
      cache_write_tokens: deferred2.cacheWrite
    } } : {}
  };
}
var FINISH = { "tool-calls": "tool_calls", stop: "stop", "max-tokens": "length" };
function createChat({ runtime, ready, route, maxRequired: maxRequired2, logger }) {
  const maxOnly2 = /* @__PURE__ */ new Set();
  const parked = /* @__PURE__ */ new Map();
  const reported = /* @__PURE__ */ new Map();
  function unpark(sessionId) {
    clearTimeout(parked.get(sessionId));
    parked.delete(sessionId);
  }
  function park(sessionId) {
    unpark(sessionId);
    const timer = setTimeout(() => {
      parked.delete(sessionId);
      reported.delete(sessionId);
      runtime.closeTurn(sessionId, "Cursor tool results did not come back").catch(() => {
      });
    }, PARKED_MS);
    timer.unref?.();
    parked.set(sessionId, timer);
  }
  async function* step(options, captured) {
    for (let attempt = 0, maxRetried = false; ; attempt++) {
      let emitted = false;
      let occupancy;
      try {
        for await (const chunk of runtime.stream(options, captured)) {
          if (chunk.type === "text-delta") {
            emitted = true;
            yield { delta: { content: chunk.text } };
          } else if (chunk.type === "reasoning-delta") {
            emitted = true;
            yield { delta: { reasoning_content: chunk.text } };
          } else if (chunk.type === "tool-call-delta") {
            emitted = true;
            yield { call: { id: chunk.id, name: chunk.name, arguments: chunk.argumentsDelta } };
          } else if (chunk.type === "usage") occupancy = chunk.usage;
          else if (chunk.type === "finish") {
            const final = chunk.reason.kind !== "tool-calls";
            if (!reported.has(options.sessionId)) reported.set(options.sessionId, zero());
            const usage2 = stepUsage2(chunk.replayState?.response?.diagnostics, occupancy, reported.get(options.sessionId), final);
            if (final) reported.delete(options.sessionId);
            yield { finish: FINISH[chunk.reason.kind] ?? "stop", usage: usage2 };
            return;
          }
        }
        return;
      } catch (error) {
        reported.delete(options.sessionId);
        const selection = captured.entry.defaultSelection;
        if (!emitted && !maxRetried && !selection.maxMode && maxRequired2(error?.message)) {
          maxRetried = true;
          maxOnly2.add(selection.wireModelId);
          captured = { ...captured, entry: { ...captured.entry, defaultSelection: { ...selection, maxMode: true } } };
          continue;
        }
        if (emitted || attempt > 0 || !REBUILD.has(error?.code) || options.signal.aborted) throw error;
        logger?.warn(`cursor: ${options.sessionId} rebuilding from history after ${error.code}`);
        if (options.sessionId) await runtime.closeTurn(options.sessionId, error.message).catch(() => {
        });
      }
    }
  }
  return async function answer2(chat, signal, session) {
    try {
      await ready();
      const model = String(chat.model ?? "");
      const selection = await route(chat);
      if (maxOnly2.has(selection.wireModelId)) selection.maxMode = true;
      const entry = { info: { id: model }, defaultSelection: selection };
      const { system, messages } = await chatMessages(chat, signal);
      const sessionId = conversationKey(chat, session, system);
      unpark(sessionId);
      const lifetime = new AbortController();
      const cancel = () => lifetime.abort(signal.reason);
      if (signal?.aborted) cancel();
      else signal?.addEventListener("abort", cancel, { once: true });
      const options = {
        provider: PROVIDER,
        model,
        sessionId,
        system,
        messages,
        tools: chatTools(chat),
        signal: lifetime.signal
      };
      const events = step(options, { entry, settings: {} });
      const done = (finish) => {
        signal?.removeEventListener("abort", cancel);
        if (finish === "tool_calls") park(sessionId);
      };
      try {
        return chat.stream === false ? await whole(events, model, done) : await streamed(events, model, done);
      } catch (error) {
        done();
        throw error;
      }
    } catch (error) {
      return errorResponse2(error);
    }
  };
}
async function first(events) {
  let timer;
  const waited = new Promise((resolve) => {
    timer = setTimeout(resolve, HEADER_WAIT_MS, "waiting");
  });
  const next = events.next();
  const result2 = await Promise.race([next, waited]);
  clearTimeout(timer);
  return result2 === "waiting" ? { pending: next } : { result: result2 };
}
async function streamed(events, model, done) {
  const id = `chatcmpl-${randomUUID7()}`;
  const created = Math.floor(Date.now() / 1e3);
  const encoder = new TextEncoder();
  const data = (value) => encoder.encode(`data: ${JSON.stringify(value)}

`);
  const chunk = (delta, finish = null, extra = {}) => data({
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [{ index: 0, delta, finish_reason: finish }],
    ...extra
  });
  const opening = await first(events);
  let calls = 0;
  let role = false;
  const encode = (event) => {
    const out = [];
    if (!role && (event.delta || event.call)) {
      role = true;
      out.push(chunk({ role: "assistant" }));
    }
    if (event.delta) out.push(chunk(event.delta));
    else if (event.call) {
      out.push(chunk({ tool_calls: [{
        index: calls++,
        id: event.call.id,
        type: "function",
        function: { name: event.call.name, arguments: event.call.arguments }
      }] }));
    } else if (event.finish) {
      done(event.finish);
      out.push(chunk({}, event.finish, event.usage ? { usage: event.usage } : {}));
    }
    return out;
  };
  const stream = new ReadableStream({
    async start(controller) {
      let keepalive;
      try {
        let next = opening.result;
        if (opening.pending) {
          keepalive = setInterval(() => controller.enqueue(encoder.encode(": keepalive\n\n")), KEEPALIVE_MS);
          next = await opening.pending;
          clearInterval(keepalive);
        }
        while (!next.done) {
          for (const bytes2 of encode(next.value)) controller.enqueue(bytes2);
          next = await events.next();
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        clearInterval(keepalive);
        done();
        controller.enqueue(data({ error: { message: error?.message ?? String(error), code: statusOf2(error) } }));
      }
      controller.close();
    },
    async cancel() {
      await events.return();
    }
  });
  return new Response(stream, { status: 200, headers: { ...headers, "content-type": "text/event-stream", "cache-control": "no-cache" } });
}
async function whole(events, model, done) {
  let content = "", reasoning = "", finish = "stop", usage2;
  const toolCalls = [];
  for await (const event of events) {
    if (event.delta?.content) content += event.delta.content;
    else if (event.delta?.reasoning_content) reasoning += event.delta.reasoning_content;
    else if (event.call) toolCalls.push({ id: event.call.id, type: "function", function: { name: event.call.name, arguments: event.call.arguments } });
    else if (event.finish) ({ finish, usage: usage2 } = event);
  }
  done(finish);
  const message2 = {
    role: "assistant",
    content: content || null,
    ...reasoning ? { reasoning_content: reasoning } : {},
    ...toolCalls.length ? { tool_calls: toolCalls } : {}
  };
  return new Response(
    JSON.stringify({
      id: `chatcmpl-${randomUUID7()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1e3),
      model,
      choices: [{ index: 0, message: message2, finish_reason: finish }],
      ...usage2 ? { usage: usage2 } : {}
    }),
    { status: 200, headers: { ...headers, "content-type": "application/json" } }
  );
}

// src/store.js
import { createHash as createHash13 } from "node:crypto";
import { mkdirSync as mkdirSync2, readFileSync as readFileSync2, readdirSync as readdirSync2, renameSync as renameSync2, rmSync as rmSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join4 } from "node:path";
var fileOf = (key) => createHash13("sha256").update(key).digest("hex") + ".json";
function recordTable(dir) {
  mkdirSync2(dir, { recursive: true });
  const records = /* @__PURE__ */ new Map();
  for (const name of readdirSync2(dir)) {
    if (!name.endsWith(".json")) continue;
    try {
      const { key, value } = JSON.parse(readFileSync2(join4(dir, name), "utf8"));
      if (typeof key === "string") records.set(key, value);
    } catch {
      rmSync2(join4(dir, name), { force: true });
    }
  }
  return {
    get: (key) => records.get(key),
    entries: () => records.entries(),
    keys: () => records.keys(),
    async put(key, value) {
      const file = join4(dir, fileOf(key));
      writeFileSync2(file + ".tmp", JSON.stringify({ key, value }));
      renameSync2(file + ".tmp", file);
      records.set(key, value);
    },
    async delete(key) {
      rmSync2(join4(dir, fileOf(key)), { force: true });
      records.delete(key);
    }
  };
}
function blobTable(dir) {
  mkdirSync2(dir, { recursive: true });
  const path = (hash2) => join4(dir, hash2);
  return {
    get(hash2) {
      try {
        return { encoded: readFileSync2(path(hash2), "utf8") };
      } catch {
        return void 0;
      }
    },
    keys: () => readdirSync2(dir).filter((name) => /^[0-9a-f]{64}$/u.test(name)),
    async put(hash2, { encoded }) {
      writeFileSync2(path(hash2) + ".tmp", encoded);
      renameSync2(path(hash2) + ".tmp", path(hash2));
    },
    async delete(hash2) {
      rmSync2(path(hash2), { force: true });
    }
  };
}

// src/index.js
var API3 = "https://api2.cursor.sh";
var LOG_BYTES = 4 << 20;
var OPTIONS = /* @__PURE__ */ new Set(["included_only"]);
function fileLogger(file) {
  return {
    warn(message2) {
      try {
        if (statSync(file, { throwIfNoEntry: false })?.size > LOG_BYTES) renameSync3(file, file + ".1");
        appendFileSync(file, `${(/* @__PURE__ */ new Date()).toISOString()} ${message2}
`);
      } catch {
      }
    }
  };
}
async function routeFor(auth, chat) {
  const grant = await auth.getGrant();
  const raw = await _internal.listFor(grant.access);
  const model = String(chat.model ?? "");
  const tier = chat.service_tier;
  const fast = tier === "priority" || tier === "fast" ? true : tier ? false : void 0;
  const { id, params, maxMode } = _internal.request(raw, model, chat.reasoning_effort ?? "", fast);
  return {
    wireModelId: id,
    maxMode: maxMode === true,
    ...params.length ? { parameters: params.map(({ id: key, value }) => ({ key, value: String(value) })) } : {}
  };
}
var provider;
async function providerFor(input) {
  if (provider) return provider;
  const dir = process.env.MAGPIE_CURSOR_DATA ?? join5(process.env.XDG_DATA_HOME || join5(homedir3(), ".local", "share"), "magpie-cursor");
  mkdirSync3(dir, { recursive: true });
  const logger = fileLogger(join5(dir, "cursor.log"));
  let getAuth = async () => void 0;
  const auth = createCursorAuth(() => getAuth(), input?.client);
  const conversationCache = createConversationCache(recordTable(join5(dir, "conversations")), logger, blobTable(join5(dir, "blobs")));
  const selections = { select: (entry) => entry.defaultSelection };
  const runtime = new CursorRuntime({ logger: () => logger }, auth, selections, { conversationCache });
  let loginId;
  async function ready() {
    const metadata = await auth.metadata();
    if (metadata.loginId !== loginId) {
      loginId = metadata.loginId;
      await runtime.invalidateAccount(loginId);
    }
  }
  provider = {
    community: await CursorAuthPlugin(input),
    setAuth(next) {
      getAuth = next;
    },
    answer: createChat({ runtime, ready, logger, route: (chat) => routeFor(auth, chat), maxRequired: _internal.maxRequired })
  };
  return provider;
}
async function MagpieCursorPlugin(input) {
  const cursor = await providerFor(input);
  const shown = cursor.community;
  return {
    auth: {
      provider: PROVIDER,
      async loader(getAuth) {
        const record = await getAuth();
        const signedIn = record?.type === "api" ? !!record.key : record?.type === "oauth" && (!!record.access || record.refresh === CLI_MARK2);
        if (!signedIn) return {};
        cursor.setAuth(getAuth);
        return {
          baseURL: API3,
          apiKey: "cursor",
          async fetch(request2, init = {}) {
            const url = typeof request2 === "string" ? request2 : request2 instanceof URL ? request2.href : request2.url;
            if (!/\/chat\/completions$/u.test(new URL(url).pathname)) {
              return errorResponse2(Object.assign(new Error("only chat completions are served"), { status: 404 }));
            }
            let chat;
            try {
              const body = init.body ?? (request2 instanceof Request ? await request2.clone().text() : void 0);
              chat = JSON.parse(typeof body === "string" ? body : new TextDecoder().decode(body));
            } catch {
              return errorResponse2(Object.assign(new Error("a request that isn't JSON"), { status: 400 }));
            }
            const headers2 = new Headers(init.headers ?? (request2 instanceof Request ? request2.headers : void 0));
            const signal = init.signal ?? (request2 instanceof Request ? request2.signal : void 0);
            return cursor.answer(chat, signal, headers2.get(SESSION_HEADER) ?? "");
          }
        };
      },
      methods: signInMethods,
      options: shown.auth.options.filter((option) => OPTIONS.has(option.key)),
      usage: shown.auth.usage,
      calls: shown.auth.calls
    },
    "chat.headers": shown["chat.headers"],
    config: shown.config,
    provider: shown.provider
  };
}
export {
  MagpieCursorPlugin
};
