import Long = require('long');
import type * as $protobuf from 'protobufjs';

/** Namespace audio. */
export namespace audio {

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
        constructor(properties?: audio.IKeyDownEvent);

        /** KeyDownEvent note. */
        public note: number;

        /** KeyDownEvent velocity. */
        public velocity: number;

        /**
         * Creates a new KeyDownEvent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyDownEvent instance
         */
        public static create(properties?: audio.IKeyDownEvent): audio.KeyDownEvent;

        /**
         * Encodes the specified KeyDownEvent message. Does not implicitly {@link audio.KeyDownEvent.verify|verify} messages.
         * @param message KeyDownEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: audio.IKeyDownEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyDownEvent message, length delimited. Does not implicitly {@link audio.KeyDownEvent.verify|verify} messages.
         * @param message KeyDownEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: audio.IKeyDownEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): audio.KeyDownEvent;

        /**
         * Decodes a KeyDownEvent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KeyDownEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): audio.KeyDownEvent;

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
        public static fromObject(object: { [k: string]: any }): audio.KeyDownEvent;

        /**
         * Creates a plain object from a KeyDownEvent message. Also converts values to other types if specified.
         * @param message KeyDownEvent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: audio.KeyDownEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
        constructor(properties?: audio.IKeyUpEvent);

        /** KeyUpEvent note. */
        public note: number;

        /**
         * Creates a new KeyUpEvent instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyUpEvent instance
         */
        public static create(properties?: audio.IKeyUpEvent): audio.KeyUpEvent;

        /**
         * Encodes the specified KeyUpEvent message. Does not implicitly {@link audio.KeyUpEvent.verify|verify} messages.
         * @param message KeyUpEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: audio.IKeyUpEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyUpEvent message, length delimited. Does not implicitly {@link audio.KeyUpEvent.verify|verify} messages.
         * @param message KeyUpEvent message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: audio.IKeyUpEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): audio.KeyUpEvent;

        /**
         * Decodes a KeyUpEvent message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KeyUpEvent
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): audio.KeyUpEvent;

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
        public static fromObject(object: { [k: string]: any }): audio.KeyUpEvent;

        /**
         * Creates a plain object from a KeyUpEvent message. Also converts values to other types if specified.
         * @param message KeyUpEvent
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: audio.KeyUpEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
}
