/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const events = $root.events = (() => {

    /**
     * Namespace events.
     * @exports events
     * @namespace
     */
    const events = {};

    events.Envelope = (function() {

        /**
         * Properties of an Envelope.
         * @memberof events
         * @interface IEnvelope
         * @property {string|null} [eventType] Envelope eventType
         * @property {Uint8Array|null} [payload] Envelope payload
         */

        /**
         * Constructs a new Envelope.
         * @memberof events
         * @classdesc Represents an Envelope.
         * @implements IEnvelope
         * @constructor
         * @param {events.IEnvelope=} [properties] Properties to set
         */
        function Envelope(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Envelope eventType.
         * @member {string} eventType
         * @memberof events.Envelope
         * @instance
         */
        Envelope.prototype.eventType = "";

        /**
         * Envelope payload.
         * @member {Uint8Array} payload
         * @memberof events.Envelope
         * @instance
         */
        Envelope.prototype.payload = $util.newBuffer([]);

        /**
         * Creates a new Envelope instance using the specified properties.
         * @function create
         * @memberof events.Envelope
         * @static
         * @param {events.IEnvelope=} [properties] Properties to set
         * @returns {events.Envelope} Envelope instance
         */
        Envelope.create = function create(properties) {
            return new Envelope(properties);
        };

        /**
         * Encodes the specified Envelope message. Does not implicitly {@link events.Envelope.verify|verify} messages.
         * @function encode
         * @memberof events.Envelope
         * @static
         * @param {events.IEnvelope} message Envelope message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Envelope.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.eventType != null && Object.hasOwnProperty.call(message, "eventType"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.eventType);
            if (message.payload != null && Object.hasOwnProperty.call(message, "payload"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.payload);
            return writer;
        };

        /**
         * Encodes the specified Envelope message, length delimited. Does not implicitly {@link events.Envelope.verify|verify} messages.
         * @function encodeDelimited
         * @memberof events.Envelope
         * @static
         * @param {events.IEnvelope} message Envelope message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Envelope.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Envelope message from the specified reader or buffer.
         * @function decode
         * @memberof events.Envelope
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {events.Envelope} Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Envelope.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.events.Envelope();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.eventType = reader.string();
                        break;
                    }
                case 2: {
                        message.payload = reader.bytes();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Envelope message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof events.Envelope
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {events.Envelope} Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Envelope.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Envelope message.
         * @function verify
         * @memberof events.Envelope
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Envelope.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                if (!$util.isString(message.eventType))
                    return "eventType: string expected";
            if (message.payload != null && message.hasOwnProperty("payload"))
                if (!(message.payload && typeof message.payload.length === "number" || $util.isString(message.payload)))
                    return "payload: buffer expected";
            return null;
        };

        /**
         * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof events.Envelope
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {events.Envelope} Envelope
         */
        Envelope.fromObject = function fromObject(object) {
            if (object instanceof $root.events.Envelope)
                return object;
            let message = new $root.events.Envelope();
            if (object.eventType != null)
                message.eventType = String(object.eventType);
            if (object.payload != null)
                if (typeof object.payload === "string")
                    $util.base64.decode(object.payload, message.payload = $util.newBuffer($util.base64.length(object.payload)), 0);
                else if (object.payload.length >= 0)
                    message.payload = object.payload;
            return message;
        };

        /**
         * Creates a plain object from an Envelope message. Also converts values to other types if specified.
         * @function toObject
         * @memberof events.Envelope
         * @static
         * @param {events.Envelope} message Envelope
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Envelope.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.eventType = "";
                if (options.bytes === String)
                    object.payload = "";
                else {
                    object.payload = [];
                    if (options.bytes !== Array)
                        object.payload = $util.newBuffer(object.payload);
                }
            }
            if (message.eventType != null && message.hasOwnProperty("eventType"))
                object.eventType = message.eventType;
            if (message.payload != null && message.hasOwnProperty("payload"))
                object.payload = options.bytes === String ? $util.base64.encode(message.payload, 0, message.payload.length) : options.bytes === Array ? Array.prototype.slice.call(message.payload) : message.payload;
            return object;
        };

        /**
         * Converts this Envelope to JSON.
         * @function toJSON
         * @memberof events.Envelope
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Envelope.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Envelope
         * @function getTypeUrl
         * @memberof events.Envelope
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Envelope.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/events.Envelope";
        };

        return Envelope;
    })();

    events.KeyDownEvent = (function() {

        /**
         * Properties of a KeyDownEvent.
         * @memberof events
         * @interface IKeyDownEvent
         * @property {number|null} [note] KeyDownEvent note
         * @property {number|null} [velocity] KeyDownEvent velocity
         */

        /**
         * Constructs a new KeyDownEvent.
         * @memberof events
         * @classdesc Represents a KeyDownEvent.
         * @implements IKeyDownEvent
         * @constructor
         * @param {events.IKeyDownEvent=} [properties] Properties to set
         */
        function KeyDownEvent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * KeyDownEvent note.
         * @member {number} note
         * @memberof events.KeyDownEvent
         * @instance
         */
        KeyDownEvent.prototype.note = 0;

        /**
         * KeyDownEvent velocity.
         * @member {number} velocity
         * @memberof events.KeyDownEvent
         * @instance
         */
        KeyDownEvent.prototype.velocity = 0;

        /**
         * Creates a new KeyDownEvent instance using the specified properties.
         * @function create
         * @memberof events.KeyDownEvent
         * @static
         * @param {events.IKeyDownEvent=} [properties] Properties to set
         * @returns {events.KeyDownEvent} KeyDownEvent instance
         */
        KeyDownEvent.create = function create(properties) {
            return new KeyDownEvent(properties);
        };

        /**
         * Encodes the specified KeyDownEvent message. Does not implicitly {@link events.KeyDownEvent.verify|verify} messages.
         * @function encode
         * @memberof events.KeyDownEvent
         * @static
         * @param {events.IKeyDownEvent} message KeyDownEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyDownEvent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.note);
            if (message.velocity != null && Object.hasOwnProperty.call(message, "velocity"))
                writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.velocity);
            return writer;
        };

        /**
         * Encodes the specified KeyDownEvent message, length delimited. Does not implicitly {@link events.KeyDownEvent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof events.KeyDownEvent
         * @static
         * @param {events.IKeyDownEvent} message KeyDownEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyDownEvent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer.
         * @function decode
         * @memberof events.KeyDownEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {events.KeyDownEvent} KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyDownEvent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.events.KeyDownEvent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.note = reader.uint32();
                        break;
                    }
                case 2: {
                        message.velocity = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof events.KeyDownEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {events.KeyDownEvent} KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyDownEvent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a KeyDownEvent message.
         * @function verify
         * @memberof events.KeyDownEvent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        KeyDownEvent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.note != null && message.hasOwnProperty("note"))
                if (!$util.isInteger(message.note))
                    return "note: integer expected";
            if (message.velocity != null && message.hasOwnProperty("velocity"))
                if (!$util.isInteger(message.velocity))
                    return "velocity: integer expected";
            return null;
        };

        /**
         * Creates a KeyDownEvent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof events.KeyDownEvent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {events.KeyDownEvent} KeyDownEvent
         */
        KeyDownEvent.fromObject = function fromObject(object) {
            if (object instanceof $root.events.KeyDownEvent)
                return object;
            let message = new $root.events.KeyDownEvent();
            if (object.note != null)
                message.note = object.note >>> 0;
            if (object.velocity != null)
                message.velocity = object.velocity >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a KeyDownEvent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof events.KeyDownEvent
         * @static
         * @param {events.KeyDownEvent} message KeyDownEvent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        KeyDownEvent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.note = 0;
                object.velocity = 0;
            }
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            if (message.velocity != null && message.hasOwnProperty("velocity"))
                object.velocity = message.velocity;
            return object;
        };

        /**
         * Converts this KeyDownEvent to JSON.
         * @function toJSON
         * @memberof events.KeyDownEvent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        KeyDownEvent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for KeyDownEvent
         * @function getTypeUrl
         * @memberof events.KeyDownEvent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        KeyDownEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/events.KeyDownEvent";
        };

        return KeyDownEvent;
    })();

    events.KeyUpEvent = (function() {

        /**
         * Properties of a KeyUpEvent.
         * @memberof events
         * @interface IKeyUpEvent
         * @property {number|null} [note] KeyUpEvent note
         */

        /**
         * Constructs a new KeyUpEvent.
         * @memberof events
         * @classdesc Represents a KeyUpEvent.
         * @implements IKeyUpEvent
         * @constructor
         * @param {events.IKeyUpEvent=} [properties] Properties to set
         */
        function KeyUpEvent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * KeyUpEvent note.
         * @member {number} note
         * @memberof events.KeyUpEvent
         * @instance
         */
        KeyUpEvent.prototype.note = 0;

        /**
         * Creates a new KeyUpEvent instance using the specified properties.
         * @function create
         * @memberof events.KeyUpEvent
         * @static
         * @param {events.IKeyUpEvent=} [properties] Properties to set
         * @returns {events.KeyUpEvent} KeyUpEvent instance
         */
        KeyUpEvent.create = function create(properties) {
            return new KeyUpEvent(properties);
        };

        /**
         * Encodes the specified KeyUpEvent message. Does not implicitly {@link events.KeyUpEvent.verify|verify} messages.
         * @function encode
         * @memberof events.KeyUpEvent
         * @static
         * @param {events.IKeyUpEvent} message KeyUpEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyUpEvent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.note != null && Object.hasOwnProperty.call(message, "note"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.note);
            return writer;
        };

        /**
         * Encodes the specified KeyUpEvent message, length delimited. Does not implicitly {@link events.KeyUpEvent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof events.KeyUpEvent
         * @static
         * @param {events.IKeyUpEvent} message KeyUpEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        KeyUpEvent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer.
         * @function decode
         * @memberof events.KeyUpEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {events.KeyUpEvent} KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyUpEvent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.events.KeyUpEvent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.note = reader.uint32();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof events.KeyUpEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {events.KeyUpEvent} KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        KeyUpEvent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a KeyUpEvent message.
         * @function verify
         * @memberof events.KeyUpEvent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        KeyUpEvent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.note != null && message.hasOwnProperty("note"))
                if (!$util.isInteger(message.note))
                    return "note: integer expected";
            return null;
        };

        /**
         * Creates a KeyUpEvent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof events.KeyUpEvent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {events.KeyUpEvent} KeyUpEvent
         */
        KeyUpEvent.fromObject = function fromObject(object) {
            if (object instanceof $root.events.KeyUpEvent)
                return object;
            let message = new $root.events.KeyUpEvent();
            if (object.note != null)
                message.note = object.note >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a KeyUpEvent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof events.KeyUpEvent
         * @static
         * @param {events.KeyUpEvent} message KeyUpEvent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        KeyUpEvent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.note = 0;
            if (message.note != null && message.hasOwnProperty("note"))
                object.note = message.note;
            return object;
        };

        /**
         * Converts this KeyUpEvent to JSON.
         * @function toJSON
         * @memberof events.KeyUpEvent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        KeyUpEvent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for KeyUpEvent
         * @function getTypeUrl
         * @memberof events.KeyUpEvent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        KeyUpEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/events.KeyUpEvent";
        };

        return KeyUpEvent;
    })();

    events.LatencyEvent = (function() {

        /**
         * Properties of a LatencyEvent.
         * @memberof events
         * @interface ILatencyEvent
         * @property {number|null} [pingTime] LatencyEvent pingTime
         * @property {string|null} [peerId] LatencyEvent peerId
         */

        /**
         * Constructs a new LatencyEvent.
         * @memberof events
         * @classdesc Represents a LatencyEvent.
         * @implements ILatencyEvent
         * @constructor
         * @param {events.ILatencyEvent=} [properties] Properties to set
         */
        function LatencyEvent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * LatencyEvent pingTime.
         * @member {number} pingTime
         * @memberof events.LatencyEvent
         * @instance
         */
        LatencyEvent.prototype.pingTime = 0;

        /**
         * LatencyEvent peerId.
         * @member {string} peerId
         * @memberof events.LatencyEvent
         * @instance
         */
        LatencyEvent.prototype.peerId = "";

        /**
         * Creates a new LatencyEvent instance using the specified properties.
         * @function create
         * @memberof events.LatencyEvent
         * @static
         * @param {events.ILatencyEvent=} [properties] Properties to set
         * @returns {events.LatencyEvent} LatencyEvent instance
         */
        LatencyEvent.create = function create(properties) {
            return new LatencyEvent(properties);
        };

        /**
         * Encodes the specified LatencyEvent message. Does not implicitly {@link events.LatencyEvent.verify|verify} messages.
         * @function encode
         * @memberof events.LatencyEvent
         * @static
         * @param {events.ILatencyEvent} message LatencyEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LatencyEvent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.pingTime != null && Object.hasOwnProperty.call(message, "pingTime"))
                writer.uint32(/* id 1, wireType 1 =*/9).double(message.pingTime);
            if (message.peerId != null && Object.hasOwnProperty.call(message, "peerId"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.peerId);
            return writer;
        };

        /**
         * Encodes the specified LatencyEvent message, length delimited. Does not implicitly {@link events.LatencyEvent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof events.LatencyEvent
         * @static
         * @param {events.ILatencyEvent} message LatencyEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        LatencyEvent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a LatencyEvent message from the specified reader or buffer.
         * @function decode
         * @memberof events.LatencyEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {events.LatencyEvent} LatencyEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LatencyEvent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.events.LatencyEvent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.pingTime = reader.double();
                        break;
                    }
                case 2: {
                        message.peerId = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a LatencyEvent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof events.LatencyEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {events.LatencyEvent} LatencyEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        LatencyEvent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a LatencyEvent message.
         * @function verify
         * @memberof events.LatencyEvent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        LatencyEvent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.pingTime != null && message.hasOwnProperty("pingTime"))
                if (typeof message.pingTime !== "number")
                    return "pingTime: number expected";
            if (message.peerId != null && message.hasOwnProperty("peerId"))
                if (!$util.isString(message.peerId))
                    return "peerId: string expected";
            return null;
        };

        /**
         * Creates a LatencyEvent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof events.LatencyEvent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {events.LatencyEvent} LatencyEvent
         */
        LatencyEvent.fromObject = function fromObject(object) {
            if (object instanceof $root.events.LatencyEvent)
                return object;
            let message = new $root.events.LatencyEvent();
            if (object.pingTime != null)
                message.pingTime = Number(object.pingTime);
            if (object.peerId != null)
                message.peerId = String(object.peerId);
            return message;
        };

        /**
         * Creates a plain object from a LatencyEvent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof events.LatencyEvent
         * @static
         * @param {events.LatencyEvent} message LatencyEvent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        LatencyEvent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.pingTime = 0;
                object.peerId = "";
            }
            if (message.pingTime != null && message.hasOwnProperty("pingTime"))
                object.pingTime = options.json && !isFinite(message.pingTime) ? String(message.pingTime) : message.pingTime;
            if (message.peerId != null && message.hasOwnProperty("peerId"))
                object.peerId = message.peerId;
            return object;
        };

        /**
         * Converts this LatencyEvent to JSON.
         * @function toJSON
         * @memberof events.LatencyEvent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        LatencyEvent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for LatencyEvent
         * @function getTypeUrl
         * @memberof events.LatencyEvent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        LatencyEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/events.LatencyEvent";
        };

        return LatencyEvent;
    })();

    events.MetronomeTickEvent = (function() {

        /**
         * Properties of a MetronomeTickEvent.
         * @memberof events
         * @interface IMetronomeTickEvent
         * @property {string|null} [type] MetronomeTickEvent type
         */

        /**
         * Constructs a new MetronomeTickEvent.
         * @memberof events
         * @classdesc Represents a MetronomeTickEvent.
         * @implements IMetronomeTickEvent
         * @constructor
         * @param {events.IMetronomeTickEvent=} [properties] Properties to set
         */
        function MetronomeTickEvent(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MetronomeTickEvent type.
         * @member {string} type
         * @memberof events.MetronomeTickEvent
         * @instance
         */
        MetronomeTickEvent.prototype.type = "";

        /**
         * Creates a new MetronomeTickEvent instance using the specified properties.
         * @function create
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {events.IMetronomeTickEvent=} [properties] Properties to set
         * @returns {events.MetronomeTickEvent} MetronomeTickEvent instance
         */
        MetronomeTickEvent.create = function create(properties) {
            return new MetronomeTickEvent(properties);
        };

        /**
         * Encodes the specified MetronomeTickEvent message. Does not implicitly {@link events.MetronomeTickEvent.verify|verify} messages.
         * @function encode
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {events.IMetronomeTickEvent} message MetronomeTickEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MetronomeTickEvent.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.type);
            return writer;
        };

        /**
         * Encodes the specified MetronomeTickEvent message, length delimited. Does not implicitly {@link events.MetronomeTickEvent.verify|verify} messages.
         * @function encodeDelimited
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {events.IMetronomeTickEvent} message MetronomeTickEvent message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MetronomeTickEvent.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MetronomeTickEvent message from the specified reader or buffer.
         * @function decode
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {events.MetronomeTickEvent} MetronomeTickEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MetronomeTickEvent.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.events.MetronomeTickEvent();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.type = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MetronomeTickEvent message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {events.MetronomeTickEvent} MetronomeTickEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MetronomeTickEvent.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MetronomeTickEvent message.
         * @function verify
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MetronomeTickEvent.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isString(message.type))
                    return "type: string expected";
            return null;
        };

        /**
         * Creates a MetronomeTickEvent message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {events.MetronomeTickEvent} MetronomeTickEvent
         */
        MetronomeTickEvent.fromObject = function fromObject(object) {
            if (object instanceof $root.events.MetronomeTickEvent)
                return object;
            let message = new $root.events.MetronomeTickEvent();
            if (object.type != null)
                message.type = String(object.type);
            return message;
        };

        /**
         * Creates a plain object from a MetronomeTickEvent message. Also converts values to other types if specified.
         * @function toObject
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {events.MetronomeTickEvent} message MetronomeTickEvent
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MetronomeTickEvent.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults)
                object.type = "";
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            return object;
        };

        /**
         * Converts this MetronomeTickEvent to JSON.
         * @function toJSON
         * @memberof events.MetronomeTickEvent
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MetronomeTickEvent.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for MetronomeTickEvent
         * @function getTypeUrl
         * @memberof events.MetronomeTickEvent
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        MetronomeTickEvent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/events.MetronomeTickEvent";
        };

        return MetronomeTickEvent;
    })();

    return events;
})();

export { $root as default };
