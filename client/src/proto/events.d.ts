import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace events. */
export namespace events {

    /** Properties of an Envelope. */
    interface IEnvelope {

        /** Envelope eventType */
        eventType?: (string|null);

        /** Envelope payload */
        payload?: (Uint8Array|null);
    }

    /** Represents an Envelope. */
    class Envelope implements IEnvelope {

        /**
         * Constructs a new Envelope.
         * @param [properties] Properties to set
         */
        constructor(properties?: events.IEnvelope);

        /** Envelope eventType. */
        public eventType: string;

        /** Envelope payload. */
        public payload: Uint8Array;

        /**
         * Creates a new Envelope instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Envelope instance
         */
        public static create(properties?: events.IEnvelope): events.Envelope;

        /**
         * Encodes the specified Envelope message. Does not implicitly {@link events.Envelope.verify|verify} messages.
         * @param message Envelope message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: events.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Envelope message, length delimited. Does not implicitly {@link events.Envelope.verify|verify} messages.
         * @param message Envelope message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: events.IEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Envelope message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): events.Envelope;

        /**
         * Decodes an Envelope message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Envelope
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): events.Envelope;

        /**
         * Verifies an Envelope message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Envelope message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Envelope
         */
        public static fromObject(object: { [k: string]: any }): events.Envelope;

        /**
         * Creates a plain object from an Envelope message. Also converts values to other types if specified.
         * @param message Envelope
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: events.Envelope, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Envelope to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Envelope
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a KeyDownEvent. */
    interface IKeyDownEvent {

        /** KeyDownEvent note */
        note?: (number|null);

        /** KeyDownEvent velocity */
        velocity?: (number|null);
    }

    /** Represents a KeyDownEvent. */
    class KeyDownEvent implements IKeyDownEvent {

        /**
         * Constructs a new KeyDownEvent.
         * @param [properties] Properties to set
         */
        constructor(properties?: events.IKeyDownEvent);

        /** KeyDownEvent note. */
        public note: number;

        /** KeyDownEvent velocity. */
        public velocity: number;

        /**
         * Creates a new KeyDownEvent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyDownEvent instance
         */
        public static create(properties?: events.IKeyDownEvent): events.KeyDownEvent;

        /**
         * Encodes the specified KeyDownEvent message. Does not implicitly {@link events.KeyDownEvent.verify|verify} messages.
         * @param message KeyDownEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: events.IKeyDownEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyDownEvent message, length delimited. Does not implicitly {@link events.KeyDownEvent.verify|verify} messages.
         * @param message KeyDownEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: events.IKeyDownEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): events.KeyDownEvent;

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): events.KeyDownEvent;

        /**
         * Verifies a KeyDownEvent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KeyDownEvent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KeyDownEvent
         */
        public static fromObject(object: { [k: string]: any }): events.KeyDownEvent;

        /**
         * Creates a plain object from a KeyDownEvent message. Also converts values to other types if specified.
         * @param message KeyDownEvent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: events.KeyDownEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KeyDownEvent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for KeyDownEvent
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a KeyUpEvent. */
    interface IKeyUpEvent {

        /** KeyUpEvent note */
        note?: (number|null);
    }

    /** Represents a KeyUpEvent. */
    class KeyUpEvent implements IKeyUpEvent {

        /**
         * Constructs a new KeyUpEvent.
         * @param [properties] Properties to set
         */
        constructor(properties?: events.IKeyUpEvent);

        /** KeyUpEvent note. */
        public note: number;

        /**
         * Creates a new KeyUpEvent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyUpEvent instance
         */
        public static create(properties?: events.IKeyUpEvent): events.KeyUpEvent;

        /**
         * Encodes the specified KeyUpEvent message. Does not implicitly {@link events.KeyUpEvent.verify|verify} messages.
         * @param message KeyUpEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: events.IKeyUpEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyUpEvent message, length delimited. Does not implicitly {@link events.KeyUpEvent.verify|verify} messages.
         * @param message KeyUpEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: events.IKeyUpEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): events.KeyUpEvent;

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): events.KeyUpEvent;

        /**
         * Verifies a KeyUpEvent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KeyUpEvent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KeyUpEvent
         */
        public static fromObject(object: { [k: string]: any }): events.KeyUpEvent;

        /**
         * Creates a plain object from a KeyUpEvent message. Also converts values to other types if specified.
         * @param message KeyUpEvent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: events.KeyUpEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KeyUpEvent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for KeyUpEvent
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a LatencyEvent. */
    interface ILatencyEvent {

        /** LatencyEvent pingTime */
        pingTime?: (number|null);

        /** LatencyEvent peerId */
        peerId?: (string|null);
    }

    /** Represents a LatencyEvent. */
    class LatencyEvent implements ILatencyEvent {

        /**
         * Constructs a new LatencyEvent.
         * @param [properties] Properties to set
         */
        constructor(properties?: events.ILatencyEvent);

        /** LatencyEvent pingTime. */
        public pingTime: number;

        /** LatencyEvent peerId. */
        public peerId: string;

        /**
         * Creates a new LatencyEvent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns LatencyEvent instance
         */
        public static create(properties?: events.ILatencyEvent): events.LatencyEvent;

        /**
         * Encodes the specified LatencyEvent message. Does not implicitly {@link events.LatencyEvent.verify|verify} messages.
         * @param message LatencyEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: events.ILatencyEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified LatencyEvent message, length delimited. Does not implicitly {@link events.LatencyEvent.verify|verify} messages.
         * @param message LatencyEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: events.ILatencyEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a LatencyEvent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns LatencyEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): events.LatencyEvent;

        /**
         * Decodes a LatencyEvent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns LatencyEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): events.LatencyEvent;

        /**
         * Verifies a LatencyEvent message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a LatencyEvent message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns LatencyEvent
         */
        public static fromObject(object: { [k: string]: any }): events.LatencyEvent;

        /**
         * Creates a plain object from a LatencyEvent message. Also converts values to other types if specified.
         * @param message LatencyEvent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: events.LatencyEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this LatencyEvent to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for LatencyEvent
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
