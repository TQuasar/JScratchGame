// @JSratchGame Engine by TQuasar https://github.com/TQuasar.

// MIT License

// Copyright (c) 2026 Quasar

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

"use strict";
const scratchVM = vm;
if (!scratchVM.JScratchMounter) scratchVM.JScratchMounter = {};

const mounter = scratchVM.JScratchMounter;

try {
class JScratchError extends Error {
    /**
     * @param {string} message 
     */
    constructor(message) {
        super(message);
    }

    static IdError = class extends JScratchError {
        /**
         * @param {string} message 
         */
        constructor(message) {
            super(message);
        }
    };

    static VMError = class extends JScratchError {
        /**
         * @param {string} message 
         */
        constructor(message) {
            super(message);
        }
    };

    static EntityError = class extends JScratchError {
        /**
         * @param {string} message 
         */
        constructor(message) {
            super(message);
        }
    };

    static EventError = class extends JScratchError {
        /**
         * @param {string} message 
         */
        constructor(message) {
            super(message);
        }
    };


}

class Terminal {
    /**
     * Log messages.
     * @param  {...any} data Messages to print.
     */
    static log(...data) {
        // eslint-disable-next-line no-console
        console.log(...data);
    };
    /**
     * Info messages.
     * @param  {...any} data Messages to print.
     */
    static info(...data) {
        // eslint-disable-next-line no-console
        console.info(...data);
    };
    /**
     * Warn messages.
     * @param  {...any} data Messages to print.
     */
    static warn(...data) {
        // eslint-disable-next-line no-console
        console.warn(...data);
    };
    /**
     * Error messages.
     * @param  {...any} data Messages to print.
     */
    static error(...data) {
        // eslint-disable-next-line no-console
        console.error(...data);
    };
    /**
     * Debug messages.
     * @param  {...any} data Messages to print.
     */
    static debug(...data) {
        // eslint-disable-next-line no-console
        console.debug(...data);
    };
}

class Musician {
    #audioContext;
    /**@type {Map<string, AudioBuffer>} */
    #loadedSounds = new Map();
    /**@type {Map<number, AudioBufferSourceNode>} */
    #playingList = new Map();
    /**@type {Map<string, (()=>void)[]>} */
    #waitSound = new Map();

    #playCounter = 0;

    constructor() {
        this.#audioContext = new window.AudioContext(); 
    }

    /**
     * The function to postprocess after loadind.
     * @param {string} name The name of sound.
     */
    #loaded(name) {
        Terminal.log(`Musician loads:${name} successfully.`);
        if (this.#waitSound.has(name)) {
            this.#waitSound.get(name)?.forEach(resolve => resolve());
            this.#waitSound.delete(name);
        }
    }

    /**
     * Load a sound from the uint8Array.
     * @param {string} name The name of sound.
     * @param {Uint8Array} uint8Array The buffer of sound.
     */
    async loadFromUint8Array(name, uint8Array) {  
        const arrayBuffer = uint8Array.buffer.slice(
            uint8Array.byteOffset, 
            uint8Array.byteOffset + uint8Array.byteLength
        );

        try {
            const decodeBuffer = await this.#audioContext.decodeAudioData(arrayBuffer);
            this.#loadedSounds.set(name, decodeBuffer);
            this.#loaded(name);
        } catch (err) {
            Terminal.error('Failed to load sound from uint8array.', err);
        }
    }

    /**
     * Get the new AudioBufferSourceNode from the loaded music.
     * @param {string} name The name of music.
     * @returns {AudioBufferSourceNode}
     */
    #get(name) {
        if (!this.has(name)) throw new Error(`Sound ${name} is undefined.`);

        const source = this.#audioContext.createBufferSource();
        source.buffer = this.#loadedSounds.get(name);
        source.connect(this.#audioContext.destination);

        return source;
    }

    /**
     * Check the music is loaded or not.
     * @param {string} name The name of the music.
     * @returns {boolean}
     */
    has(name) {
        return this.#loadedSounds.has(name);
    }

    get sounds() {
        return Array.from(this.#loadedSounds.keys());
    }

    /**
     * Play a loaded sound and return its id.
     * @param {string} name The name of sound.
     * @param {number} when The time when the sound starts playing, in seconds.
     * @param {number} offset An offset, specified as the number of seconds in the same time coordinate system as the AudioContext, to the time within the audio buffer that playback should begin.
     * @param {number} detune A k-rate AudioParam whose value indicates the detuning of oscillation in cents.
     * @param {boolean} loop The loop property of the AudioBufferSourceNode interface is a Boolean indicating if the audio asset must be replayed when the end of the AudioBuffer is reached.
     * @param {number} loopStart The loopStart property of the AudioBufferSourceNode interface is a floating-point value indicating, in seconds, where in the AudioBuffer the restart of the play must happen.
     * @param {number} loopEnd The loopEnd property of the AudioBufferSourceNode interface specifies is a floating point number specifying, in seconds, at what offset into playing the AudioBuffer playback should loop back to the time indicated by the loopStart property. This is only used if the loop property is true.
     * @param {number} playBackRate The playbackRate property of the AudioBufferSourceNode interface Is a k-rate AudioParam that defines the speed at which the audio asset will be played.
     * @returns {number}
     */
    play(name, when = 0, offset = 0, detune = 0, loop = false, loopStart = 0, loopEnd = 0, playBackRate = 1.0) {
        const node = this.#get(name);
        node.detune.value = detune;
        node.loop = loop;
        node.loopEnd = loopEnd;
        node.loopStart = loopStart;
        node.playbackRate.value = playBackRate;

        node.start(this.#audioContext.currentTime+when, offset);
        node.addEventListener("ended", () => this.#playingList.delete(this.#playCounter));

        this.#playingList.set(this.#playCounter, node);

        return this.#playCounter++;
    }

    /**
     * Pause the playing music.
     * @param {number} id The id of the playing music.
     */
    pause(id) {
        this.#playingList.get(id)?.stop();
    }

    /**
     * Stop and delete the playing music.
     * @param {number} id The id of the playing music.
     */
    stop(id) {
        this.pause(id);
        this.#playingList.delete(id);
    }

    /**
     * Continue play the stopping music.
     * @param {number} id The id of the playing music.
     */
    regret(id) {
        this.#playingList.get(id)?.start();
    }

    /**
     * Wait the music loads and resolve the promise.
     * @param {string} name The name of the playing music.
     * @returns {Promise<undefined>}
     */
    waitSound(name) {
        if (this.#loadedSounds.has(name)) {
            return new Promise((resolve) => resolve(undefined));
        }

        return new Promise((resolve) => {
            if (!this.#waitSound.has(name)) this.#waitSound.set(name, []);
            this.#waitSound.get(name)?.push(() => {
                resolve(undefined);
            });
        });
    }

    stopAll() {
        this.#playingList.forEach((node) => {
            node.stop();
        });
        this.#playingList.clear();
    }

    pauseAll() {
        this.#playingList.forEach((node) => {
            node.pause();
        });
    }

    regretAll() {
        this.#playingList.forEach((node) => {
            node.regret();
        });
    }
}

class KeysListener {
    static mouseX = 0;
    static mouseY = 0;

    static {
        document.addEventListener("mousemove", e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
    };

    /**
     * @typedef {'hold' | 'fall' | 'lift' | 'loosen'} keyState
     */
    static wheelInterval = 50;

    #listeners;
    #targetElement;
    #observe;
    /**
     * @typedef {{state: keyState, press: boolean, timerStart: number, counter: number}} key
     */

    /** @type {Map<string, key>} */
    #keyboard = new Map();

    #leftEdge = 0;
    #rightEdge = 0;
    #topEdge = 0;
    #bottomEdge = 0;

    /**
     * @param element {HTMLElement} The element to listen
     */
    constructor(element) {
        this.#targetElement = element;

        const listeners = {
            "keydown": /**@param {KeyboardEvent} e */ (e) => {
                if (!this.#inBox()) return;

                e.preventDefault();
                this.createKey(e.key);
                if (e.isTrusted) this.#press(e.key, true);
            },
            "keyup": /**@param {KeyboardEvent} e */ (e) => {
                if (!this.#inBox()) return;

                this.createKey(e.key);
                if (e.isTrusted) this.#press(e.key, false);
            },
            "mousedown": /**@param {MouseEvent} e */ (e) => {
                if (!this.#inBox()) return;

                this.createKey("mouseLeft");
                this.createKey("mouseRight");
                this.createKey("mouseMid");
                if (e.isTrusted) {
                    switch (e.button) {
                        case 0: {
                            this.#press("mouseLeft", true);
                            break;
                        }
                        case 1: {
                            this.#press("mouseMid", true);
                            break;
                        }
                        case 2: {
                            e.preventDefault();
                            this.#press("mouseRight", true);
                            break;
                        }
                        default: break;
                    }
                }
            },
            "mouseup": /**@param {MouseEvent} e */ (e) => {
                if (!this.#inBox()) return;

                this.createKey("mouseLeft");
                this.createKey("mouseRight");
                this.createKey("mouseMid");
                if (e.isTrusted) {
                    switch (e.button) {
                        case 0: {
                            this.#press("mouseLeft", false);
                            break;
                        }
                        case 1: {
                            this.#press("mouseMid", false);
                            break;
                        }
                        case 2: {
                            e.preventDefault();
                            this.#press("mouseRight", false);
                            break;
                        }
                        default: break;
                    }
                }
            },
            "wheel": /**@param {WheelEvent} e */ (e) => {
                if (!this.#inBox()) return;

                e.preventDefault();
                this.createKey("wheelUp");
                this.createKey("wheelDown");
                if (e.deltaY < 0) {
                    this.#press("wheelUp", true);
                    this.#press("wheelDown", false);

                    setTimeout(() => this.#press("wheelUp", false), KeysListener.wheelInterval);
                } else {
                    this.#press("wheelDown", true);
                    this.#press("wheelUp", false);

                    setTimeout(() => this.#press("wheelDown", false), KeysListener.wheelInterval);
                }
            }
        };
        this.#listeners = listeners;

        for (const [type, func] of Object.entries(listeners)) {
            document.addEventListener(type, func);
        }

        const observe = new ResizeObserver(() => this.#getBox());
        observe.observe(element);
        this.#getBox();
        this.#observe = observe;
    }

    #inBox() {
        return KeysListener.mouseX >= this.#leftEdge && KeysListener.mouseX <= this.#rightEdge && KeysListener.mouseY <= this.#bottomEdge && KeysListener.mouseY >= this.#topEdge;
    }

    #getBox() {
        const rect = this.#targetElement.getBoundingClientRect();
        this.#leftEdge = rect.left;
        this.#rightEdge = rect.right;
        this.#topEdge = rect.top;
        this.#bottomEdge = rect.bottom;
    }

    /**
     * Set the ture or false to the key.
     * @param {string} keyName The name of key.
     * @param {boolean} state The given key is press or not.
     */
    #press(keyName, state) {
        const key = this.#keyboard.get(keyName);
        key.press = state;
        key.timerStart = Date.now();
    }

    /**
     * Create the item belongs to the given key.
     * @param {string} key The name of key.
     */
    createKey(key) {
        if (!this.#keyboard.has(key)) this.#keyboard.set(key, {
            state: "loosen", press: false, timerStart: 0, counter: 0,
        });
    }

    update() {
        this.#keyboard.forEach((key) => {
            if (key.press) {
                if (key.state === "hold") {
                    key.counter++;
                } else if (key.state === "fall") {
                    key.state = "hold";
                } else {
                    key.state = "fall";
                    key.counter = 0;
                }
            } else {
                if (key.state === "loosen") {
                    key.counter++;
                } else if (key.state === "lift") {
                    key.state = "loosen";
                } else {
                    key.state = "lift";
                    key.counter = 0;
                }
            }
        });
    }

    clear() {
        for (const [type, func] of Object.entries(this.#listeners)) {
            this.#targetElement.removeEventListener(type, func);
        }
        this.#observe.unobserve(this.#targetElement);
        this.#observe = null;
    }

    /**
     * Get the key object.
     * @param {string} key The name of key.
     * @returns {key} The key object.
     */
    #getKey(key) {
        return this.#keyboard.get(key);
    }

    /**
     * Is press the key?
     * @param {string} key The name of key.
     * @returns {boolean}
     */
    isKeyPress(key) {
        this.createKey(key);
        return this.#getKey(key)?.press;
    }

    /**
     * Get the state of the key.
     * @param {string} key The name of key
     * @returns {keyState}
     */
    keyState(key) {
        this.createKey(key);
        return this.#getKey(key).state;
    }

    keyPressTime(key) {
        this.createKey(key);
        return Date.now() - this.#getKey(key).timerStart;
    }

    keyUpdateCount(key) {
        this.createKey(key);
        return this.#getKey(key).counter;
    }
}

class EventBus {
    static Event = class {
        /**@type {number} */
        #creator;
        /**@type {Map<number, ()=>void>} */
        #event = new Map();
        #name;

        /**
         * @param {number} creator The id of producer.
         * @param {string} name The event's name.
         */
        constructor(creator, name) {
            this.#creator = creator;
            this.#name = name;
        }

        /**
         * Does the producer have a function on the Event?
         * @param {number} id The id of a producer.
         * @returns {boolean}
         */
        is_on(id) {
            return this.#event.has(id);
        };
        /**
         * Bind a function to the Event.
         * @param {number} id The id of a producer.
         * @param {() => {}} func The function to bind.
         * @param {boolean} [once=false] If it is true, the function will unbind after it first triggering.
         */
        on(id, func, once = false) {
            if (this.is_on(id)) throw new JScratchError.EventError(`Producer: ${id} has been a function on the Event${this.#name}, please rebind function after unbinding the old function.`);
            if (once) {
                this.#event.set(id, () => {func();this.off(id);});
            } else {
                this.#event.set(id, func);
            }
        }
        /**
         * Unbind the function from the Event.
         * @param {number} id The id of a producer.
         */
        off(id) {
            this.#event.delete(id);
        }
        /**
         * Trigger the Event.
         */
        tick() {
            this.#event.forEach(func => func());
        }

        isCreator(id) {
            return this.#creator === id;
        }
    };

    /**@type {Map<string, typeof EventBus.Event>} */
    #eventBus = new Map();

    /**
     * Create a event with the given name.
     * @param {number} id The id of creator.
     * @param {string} eventName The event name.
     */
    create(id, eventName) {
        this.#eventBus.set(eventName, new EventBus.Event(id, eventName));
    }
    /**
     * Check the event was created or not.
     * @param {string} eventName The event's name
     */
    has(eventName) {
        return this.#eventBus.has(eventName);
    }
    /**
     * Delete the event.
     * @param {string} eventName The event's name
     */
    break(eventName) {
        this.#eventBus.delete(eventName);
    }
    /**
     * Get the event by the giveb name.
     * @param {string} eventName The event's name
     * @returns {typeof EventBus.Event}
     * @throws {JScratchError.EventError} If the event is undefined, it throws the EventError.
     */
    event(eventName) {
        if (!this.has(eventName)) throw new JScratchError.EventError(`Event: ${eventName}is undefined.`);
        return this.#eventBus.get(eventName);
    }
}

class MathPlus {
    /**
     * Converts a value from radians to degrees.
     * @param {number} value - The value in radians.
     * @returns {number} The value in degrees.
     */
    static toDegrees(value) {
        return value * 180 / Math.PI;
    };

    /**
     * Converts a value from degrees to radians.
     * @param {number} value - The value in degrees.
     * @returns {number} The value in radians.
     */
    static toRadians(value) {
        return value * Math.PI / 180;
    };

    /**
     * Calculates the sine of an angle given in degrees.
     * @param {number} value - The angle in degrees.
     * @returns {number} The sine of the angle.
     */
    static sin(value) {
        return Math.sin(this.toRadians(value));
    };

    /**
     * Calculates the cosine of an angle given in degrees.
     * @param {number} value - The angle in degrees.
     * @returns {number} The cosine of the angle.
     */
    static cos(value) {
        return Math.cos(this.toRadians(value));
    };

    /**
     * Calculates the atans of (x, y) and return degrees.
     * @param {number} y The y of point
     * @param {number} x The x of point
     */
    static atan2(y, x) {
        return MathPlus.toDegrees(Math.atan2(y, x));
    }

    /**
     * Clamps a value between a minimum and maximum boundary.
     * @param {number} min - The minimum boundary.
     * @param {number} value - The value to clamp.
     * @param {number} max - The maximum boundary.
     * @returns {number} The clamped value.
     */
    static between(min, value, max) {
        return Math.max(min, Math.min(max, value));
    };

    /**
     * Generates a random integer between min (inclusive) and max (exclusive).
     * @param {number} min - The minimum value (inclusive).
     * @param {number} max - The maximum value (exclusive).
     * @returns {number} A random integer.
     */
    static random(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };

    /**
     * Calculates the Euclidean distance between two 2D points.
     * @param {number} x1 - The x-coordinate of the first point.
     * @param {number} y1 - The y-coordinate of the first point.
     * @param {number} x2 - The x-coordinate of the second point.
     * @param {number} y2 - The y-coordinate of the second point.
     * @returns {number} The distance between the two points.
     */
    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };

    /**
     * Returns the largest number from a list of numbers.
     * @param {...number} number - A list of numbers to evaluate.
     * @returns {number} The maximum value.
     */
    static max(...number) {
        return number.reduce((max, cur) => Math.max(max, cur), -Infinity);
    };

    /**
     * Returns the smallest number from a list of numbers.
     * @param {...number} number - A list of numbers to evaluate.
     * @returns {number} The minimum value.
     */
    static min(...number) {
        return number.reduce((min, cur) => Math.min(min, cur), Infinity);
    };

    static precise(number, precise) {
        return Math.round(number * Math.pow(10, precise)) / Math.pow(10, precise);
    }

    static Matrix = class {
        /**
         * Applies horizontal translation to an x-coordinate.
         * @param {number} x - The original x-coordinate.
         * @param {number} offsetX - The horizontal offset.
         * @returns {number} The translated x-coordinate.
         */
        static translationX(x, offsetX) {
            return x + offsetX;
        }

        /**
         * Applies vertical translation to a y-coordinate.
         * @param {number} y - The original y-coordinate.
         * @param {number} offsetY - The vertical offset.
         * @returns {number} The translated y-coordinate.
         */
        static translationY(y, offsetY) {
            return y + offsetY;
        }

        /**
         * Scales an x-coordinate by a given factor.
         * @param {number} x - The original x-coordinate.
         * @param {number} scale - The scale factor.
         * @returns {number} The scaled x-coordinate.
         */
        static scaleX(x, scale) {
            return x * scale;
        }

        /**
         * Scales a y-coordinate by a given factor.
         * @param {number} y - The original y-coordinate.
         * @param {number} scale - The scale factor.
         * @returns {number} The scaled y-coordinate.
         */
        static scaleY(y, scale) {
            return y * scale;
        }

        /**
         * Rotates an x-coordinate around the origin.
         * @param {number} x - The original x-coordinate.
         * @param {number} y - The original y-coordinate.
         * @param {number} rotate - The rotation angle in degrees.
         * @returns {number} The rotated x-coordinate.
         */
        static rotateX(x, y, rotate) {
            return x * MathPlus.cos(rotate) - y * MathPlus.sin(rotate);
        }

        /**
         * Rotates a y-coordinate around the origin.
         * @param {number} x - The original x-coordinate.
         * @param {number} y - The original y-coordinate.
         * @param {number} rotate - The rotation angle in degrees.
         * @returns {number} The rotated y-coordinate.
         */
        static rotateY(x, y, rotate) {
            return x * MathPlus.sin(rotate) + y * MathPlus.cos(rotate);
        }

        /**
         * Applies a complete 2D transformation: scale, rotate, and translate.
         * @param {number} x - The original x-coordinate.
         * @param {number} y - The original y-coordinate.
         * @param {number} offsetX - The horizontal translation offset.
         * @param {number} offsetY - The vertical translation offset.
         * @param {number} scale - The uniform scale factor.
         * @param {number} rotate - The rotation angle in degrees.
         * @returns {[number, number]} An array containing the transformed [x, y] coordinates.
         */
        static translate(x, y, offsetX, offsetY, scale, rotate) {
            const scaledX = this.scaleX(x, scale);
            const scaledY = this.scaleY(y, scale);

            const rotatedX = this.rotateX(scaledX, scaledY, rotate);
            const rotatedY = this.rotateY(scaledX, scaledY, rotate);

            const finalX = this.translationX(rotatedX, offsetX);
            const finalY = this.translationY(rotatedY, offsetY);

            return [finalX, finalY];
        }

        /**
         * Inverts the complete 2D transformation applied by translate.
         * @param {number} x - The transformed x-coordinate.
         * @param {number} y - The transformed y-coordinate.
         * @param {number} offsetX - The horizontal translation offset used by the forward transform.
         * @param {number} offsetY - The vertical translation offset used by the forward transform.
         * @param {number} scale - The uniform scale factor used by the forward transform.
         * @param {number} rotate - The rotation angle used by the forward transform.
         * @returns {[number, number]} An array containing the original [x, y] coordinates.
         */
        static inverseTranslate(x, y, offsetX, offsetY, scale, rotate) {
            if (scale === 0) return [x - offsetX, y - offsetY];

            const translatedX = x - offsetX;
            const translatedY = y - offsetY;
            const scaledX = translatedX / scale;
            const scaledY = translatedY / scale;

            const rotatedX = this.rotateX(scaledX, scaledY, -rotate);
            const rotatedY = this.rotateY(scaledX, scaledY, -rotate);

            return [rotatedX, rotatedY];
        }
    };
}

class Componentable {
    /**
     * @returns {Componentable}
     */
    clone() {
        throw new TypeError("Componentable's clone must be a valid function.");
    }
}

/**
 * The class LayerManager is responsible for managing layers in the JScratch game engine.
 * Each instance of LayerManager can create and manage multiple layers, which can be used to organize and render different elements in the game.
 * It will provide the class Layer, the class Layer records a layer for entity and the class LayerManager defines all layers.
 */
class LayerManager {
    /**
     * @type {string[]} the levels of the layers, defined by the user (e.g. "background", "midground", "foreground").
     */
    #levels;
    /**
     * @type {Set<string>} a set of levels for quick lookup and validation.
     */
    #levelsSet;

    constructor(...levels) {
        if (levels.length === 0) throw new TypeError("Levels must be a array with length that greater than 0.");
        if (!levels.every(level => typeof level === "string")) {
            throw new TypeError(`All levels must be strings: ${  JSON.stringify(levels)}`);
        }
        this.#levels = levels;
        this.#levelsSet = new Set(levels);

        const superThis = this;

        const Layer = class extends Componentable {
            #level;
            #index;

            constructor(level, index) {
                super();
                if (!superThis.hasLevel(level)) {
                    throw new TypeError("Invalid level");
                }
                if (typeof index !== "number") {
                    throw new TypeError("Index must be a number");
                }
                this.#level = level;
                this.#index = index;
            }

            get level() {
                return this.#level;
            }

            get index() {
                return this.#index;
            }

            set level(level) {
                if (!superThis.hasLevel(level)) throw new TypeError("Undefined level: ", level);
                this.#level = level;
            }

            set index(index) {
                if (typeof index !== "number") throw new TypeError("The index that assign to layer isn't number: ", index);
                this.#index = index;
            }

            /**
             * @param {typeof Layer} other another Layer instance to compare with
             * @returns {number} a positive number if this layer should be rendered before the other layer, a negative number if this layer should be rendered after the other layer, or 0 if they are equal.
             */
            compareTo(other) {
                if (!(other instanceof Layer)) {
                    throw new TypeError("Can only compare with another Layer instance");
                }

                if (this.#level === other.#level) {
                    /* Their levels are the same. */
                    /* If other.#index is greater than this.#index, the other layer will be rendered first that it should return a positive number. */
                    return this.#index - other.#index;
                }

                return superThis.levelOrder(this.#level) - superThis.levelOrder(other.#level); 
            }

            clone() {
                return new Layer(this.#level, this.#index);
            }
        };

        this.Layer = Layer;
    }

    /**
     * Check whether the given level was defined.
     */
    hasLevel(level) {
        return this.#levelsSet.has(level);
    }

    levelOrder(level) {
        if (!this.hasLevel(level)) {
            throw new TypeError(`Invalid level: ${  level}`);
        }
        return this.#levels.indexOf(level);
    }

    /**
     * The class Layer compose of level and index.  
     * Level defined by LayerManager (e.g. "background", "midground", "foreground").  
     * Index should be a number that defines the order of the layer within its level.
     * 
     * For example, if you have three levels: ["foreground", "midground", "background"], the entity within the "foreground" level will be rendered first, followed by the "midground" level, and finally the "background" level.  
     * If two entities are in the same level, the entity with the higher index will be rendered first.  
     * It follows descending order sorting, meaning that the entity with the highest level and index will be rendered first, appearing on top of all other entities.
     * ATTENTION: THE ENTITY RENDERED LATER WILL OVERWRITE THE ENTITY RENDERED EARLIER. SO THE ENTITY WITH THE HIGHEST INDEX WILL BE RENDERED FIRST BUT WILL BE AT THE VERY BOTTOM.
     */
    Layer;

    giveDefaultLayer() {
        return new this.Layer(this.#levels[0], 0);
    }
}

class Component {
    /**
     * @type {string}
     */
    #name;
    /**
     * @type {any}
     */
    #type;

    /**
     * @type {Map<number, any>}
     */
    #entities = new Map();

    /**
     * @param {string} name The name of the component
     * @param {any} type The type of the component (e.g. "string", "number", "boolean", etc.)
     */
    constructor(name, type) {
        if (typeof name !== "string") throw new TypeError("Component name must be a string");
        this.#name = name;
        this.#type = type;
    }

    /**
     * If the given entity ID is not a number, throws a TypeError.
     * @param {number} entityId The ID of the entity
     * @throws {TypeError} If the entity ID is not a number
     */
    #isValidID(entityId) {
        if (typeof entityId !== "number") throw new TypeError(`Entity ID must be a number but get: ${entityId}`);
    }

    /**
     * If the given value is not of the correct type, throws a TypeError.  
     * If the type is a string, uses `typeof` to check the type.  
     * If the type is a constructor function, uses `instanceof` to check the type.
     * @param {any} value The value to validate
     * @throws {TypeError} If the value is not of the correct type
     */
    #isValidValue(value) {
        if (typeof this.#type === "string") {
            if (typeof value !== this.#type) throw new TypeError(`Value must be of type ${this.#type}, but get ${typeof value}`);
        } else {
            if (!(value instanceof this.#type)) throw new TypeError(`Value must be of type ${this.#type}, but get ${typeof value}`);
        }
    }

    /**
     * The getter of name.
     */
    name() {
        return this.#name;
    }

    /**
     * Create or update an entity with the given ID and value.
     * @param {number} entityId The ID of the entity
     * @param {any} value The value of the component for the entity
     * @throws {TypeError} If the entity ID is not a number or if the value is not of the correct type
     */
    setEntity(entityId, value) {
        this.#isValidID(entityId);
        this.#isValidValue(value);
        this.#entities.set(entityId, value);
    }

    /**
     * Add the given value to the component value of entity.
     * @param {number} entityId The id of the entity.
     * @param {number} value The value to add.
     */
    addValue(entityId, value) {
        this.#isValidID(entityId);
        this.#isValidValue(value);
        this.#entities.set(entityId, this.#entities.get(entityId) + value);
    }

    /**
     * Check if an entity with the given ID exists in the component.
     * @param {number} entityId The ID of the entity.
     * @returns {boolean} True if the entity exists, false otherwise.
     */
    hasEntity(entityId) {
        this.#isValidID(entityId);
        return this.#entities.has(entityId);
    }

    /**
     * Get the value of an entity with the given ID in the component.
     * @param {number} entityId The ID of the entity.
     * @returns {any} The value of the entity.
     * @throws {JScratchError.IdError} If the entity does not exist in the component.
     */
    getEntityValue(entityId) {
        this.#isValidID(entityId);
        if (!this.#entities.has(entityId)) throw new JScratchError.IdError(`Entity with ID ${entityId} does not exist in component ${this.#name}`);
        return this.#entities.get(entityId);
    }

    /**
     * Delete an entity with the given ID from the component.
     * @param {number} entityId The ID of the entity.
     * @throws {TypeError} If the entity ID is not a number.
     */
    deleteEntity(entityId) {
        this.#isValidID(entityId);
        this.#entities.delete(entityId);
    }

    /**
     * Clear all entities from the component.
     */
    clearEntities() {
        this.#entities.clear();
    }

    /**
     * Invoke the indicator function with all items, and keep items that return true values.
     * @param {(value: any) => boolean} func The indicator function to return true if keep this item or false.
     * @param {number[] | null} [targets=null] If targets is an array, the test will ignore id that targets exclude.
     * @returns {number[]}
     */
    test(func, targets = null) {
        const result = [];
        const testIds = new Set(Array.from(this.#entities.keys()).concat(targets ?? []));
        this.#entities.forEach((value, id) => {
            if (testIds.has(id) && func(value)) result.push(id);
        });
        return result;
    }
}

class Camera {
    #width;
    #height;
    #leftEdge;
    #rightEdge;
    #topEdge;
    #bottomEdge;

    #cameraX = 0;
    #cameraY = 0;
    #cameraScale = 1;
    #cameraRotate = 0;

    /**
     * Create a instance of Camera.
     * @param {number} width screen width
     * @param {number} height screen height
     */
    constructor(width, height) {
        if (typeof width !== "number") throw TypeError("The stage width must be a number.");
        if (typeof height !== "number") throw TypeError("The stage height must be a number.");
        this.#width = width;
        this.#height = height;

        this.#leftEdge = -width / 2;
        this.#rightEdge = width / 2;
        this.#bottomEdge = -height / 2;
        this.#topEdge = height / 2;
    }

    set cameraX(value) {
        if (typeof value !== "number") throw TypeError("CameraX must be a number");
        this.#cameraX = value;
    }
    get cameraX() {
        return this.#cameraX;
    }

    set cameraY(value) {
        if (typeof value !== "number") throw TypeError("CameraY must be a number");
        this.#cameraY = value;
    }
    get cameraY() {
        return this.#cameraY;
    }
    
    set cameraScale(value) {
        if (typeof value !== "number") throw TypeError("CameraScale must be a number");
        this.#cameraScale = value;
    }
    get cameraScale() {
        return this.#cameraScale;
    }

    set cameraRotate(value) {
        if (typeof value !== "number") throw TypeError("CameraRotate must be a number");
        this.#cameraRotate = value;
    }
    get cameraRotate() {
        return this.#cameraRotate;
    }

    /**
     * Move camera by the given steps.
     * @param {number} step The steps to move.
     */
    moveCamera(step) {
        if (typeof step !== "number") throw TypeError("MoveCamera's step must be a number");
        this.cameraX += MathPlus.cos(this.cameraRotate) * step;
        this.cameraY += MathPlus.sin(this.cameraRotate) * step;
    }

    /**
     * Translate the given point to camera coordinate system.
     * @param {number} x The x of the point to translate.
     * @param {number} y The y of the point to translate.
     * @returns 
     */
    translate(x, y) {
        return MathPlus.Matrix.translate(x, y, -this.#cameraX, -this.#cameraY, this.#cameraScale, -this.#cameraRotate);
    }

    /**
     * Check the given rectangle is in the screen or not.
     * @param {number} x Target x
     * @param {number} y Target y
     * @param {number} width The width of the box.
     * @param {number} height The height of the box.
     * @returns {boolean}
     */
    inScreen(x, y, width = 0, height = 0) {
        return this.#leftEdge + width <= x && this.#rightEdge - width >= x && this.#topEdge - height >= y && this.#bottomEdge + height <= y;
    }

    get ScreenWidth() {
        return this.#width;
    }

    get ScreenHeight() {
        return this.#height;
    }

    get randomX() {
        return MathPlus.random(this.#leftEdge, this.#rightEdge);
    }

    get randomY() {
        return MathPlus.random(this.#bottomEdge, this.#topEdge);
    }
}

class Hitbox extends Componentable {
    /**
     * @typedef {{clone: ()=>Triangle, radius: number}} Triangle
     * @typedef {{clone: ()=>Polygon}} Polygon
     */

    static Triangle = class extends Componentable {
        /**
         * @typedef {[[number, number], [number, number], [number, number]]} triangle
         * @type {triangle}
         */
        #vertexs = [[0, 0], [0, 0], [0, 0]];
        #vertexs_real = [[0, 0], [0, 0], [0, 0]];
        #radius = 0;

        get vertexs() {
            return this.#vertexs_real;
        }

        constructor(x1, y1, x2, y2, x3, y3) {
            super();
            this.#vertexs = [[x1, y1], [x2, y2], [x3, y3]];
            this.#vertexs_real = this.#vertexs;

            this.#radius = MathPlus.precise(MathPlus.max(MathPlus.distance(0, 0, x1, y1), MathPlus.distance(0, 0, x2, y2), MathPlus.distance(0, 0, x3, y3)), 2);
        }

        /**
         * AABB collision detection
         * @param {Hitbox.Triangle} triangle Another triangle
         */
        AABB(triangle) {
            const v1 = this.#vertexs_real;
            const v2 = triangle.vertexs;

            /* current triangle */
            const min1X = Math.min(v1[0][0], v1[1][0], v1[2][0]);
            const max1X = Math.max(v1[0][0], v1[1][0], v1[2][0]);
            const min1Y = Math.min(v1[0][1], v1[1][1], v1[2][1]);
            const max1Y = Math.max(v1[0][1], v1[1][1], v1[2][1]);

            /* target triangle */
            const min2X = Math.min(v2[0][0], v2[1][0], v2[2][0]);
            const max2X = Math.max(v2[0][0], v2[1][0], v2[2][0]);
            const min2Y = Math.min(v2[0][1], v2[1][1], v2[2][1]);
            const max2Y = Math.max(v2[0][1], v2[1][1], v2[2][1]);

            return !(max1X < min2X || min1X > max2X || max1Y < min2Y || min1Y > max2Y);

        }

        /**
         * SAT collision detection
         * @param {Hitbox.Triangle} triangle Another triangle
         */
        SAT(triangle) {
            if (!this.AABB(triangle)) return false;

            const axes = [];
            
            for (let i = 0; i < 3; i++) {
                const p1 = this.#vertexs_real[i];
                const p2 = this.#vertexs_real[(i + 1) % 3];
                const edge = [p2[0] - p1[0], p2[1] - p1[1]];

                const normal = [-edge[1], edge[0]];
                axes.push(normal);
            }
            
            for (let i = 0; i < 3; i++) {
                const p1 = triangle.vertexs[i];
                const p2 = triangle.vertexs[(i + 1) % 3];
                const edge = [p2[0] - p1[0], p2[1] - p1[1]];

                const normal = [-edge[1], edge[0]];
                axes.push(normal);
            }
            
            for (const axis of axes) {
                const length = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1]);
                if (length === 0) continue;
                const normalizedAxis = [axis[0] / length, axis[1] / length];
                
                let min1 = Infinity, max1 = -Infinity;
                for (const point of this.#vertexs_real) {
                    const projection = point[0] * normalizedAxis[0] + point[1] * normalizedAxis[1];
                    min1 = Math.min(min1, projection);
                    max1 = Math.max(max1, projection);
                }
                
                let min2 = Infinity, max2 = -Infinity;
                for (const point of triangle.vertexs) {
                    const projection = point[0] * normalizedAxis[0] + point[1] * normalizedAxis[1];
                    min2 = Math.min(min2, projection);
                    max2 = Math.max(max2, projection);
                }
                
                if (max1 < min2 || max2 < min1) {
                    return false;
                }
            }
            
            return true;
        }

        get radius() {
            return this.#radius;
        }   

        translate(offsetX, offsetY, scale, rotate, followCam, cameraX, cameraY, cameraScale, cameraRotate) {
            this.#vertexs_real = [
                MathPlus.Matrix.translate(this.#vertexs[0][0], this.#vertexs[0][1], offsetX, offsetY, scale, rotate),
                MathPlus.Matrix.translate(this.#vertexs[1][0], this.#vertexs[1][1], offsetX, offsetY, scale, rotate),
                MathPlus.Matrix.translate(this.#vertexs[2][0], this.#vertexs[2][1], offsetX, offsetY, scale, rotate),
            ];

            if (followCam) {
                this.#vertexs_real = [
                    MathPlus.Matrix.translate(this.#vertexs_real[0][0], this.#vertexs_real[0][1], -cameraX, -cameraY, cameraScale, -cameraRotate),
                    MathPlus.Matrix.translate(this.#vertexs_real[1][0], this.#vertexs_real[1][1], -cameraX, -cameraY, cameraScale, -cameraRotate),
                    MathPlus.Matrix.translate(this.#vertexs_real[2][0], this.#vertexs_real[2][1], -cameraX, -cameraY, cameraScale, -cameraRotate),
                ];
            }

            return this;
        }

        clone() {
            return new Hitbox.Triangle(this.#vertexs[0][0], this.#vertexs[0][1], this.#vertexs[1][0], this.#vertexs[1][1], this.#vertexs[2][0], this.#vertexs[2][1]);
        }
    };
    static Polygon = class extends Componentable {
        /**@type {Triangle[]} */
        #triangles = [];
        /**@type {Triangle[]} */
        #triangles_real = [];
        #radius = 0;

        /**
         * @constructor
         * @param  {...Hitbox.Triangle} triangle Triangles
         */
        constructor(...triangle) {
            super();
            this.#triangles = triangle;
            this.#triangles_real = triangle;

            this.#radius = MathPlus.max(...triangle.map(t => t.radius));
        }

        /**
         * Collision detection
         * @param {Hitbox.Polygon} polygon Another polygon
         */
        collision(polygon) {
            for (const tri1 of this.#triangles_real) {
                if (tri1.radius === 0) continue;
                for (const tri2 of polygon.triangles) {
                    if (tri2.radius === 0) continue;
                    if (tri1.SAT(tri2)) return true;
                }
            }

            return false;
        }

        get triangles() {
            return this.#triangles_real;
        }

        get radius() {
            return this.#radius;
        }

        translate(offsetX, offsetY, scale, rotate, followCam, cameraX, cameraY, cameraScale, cameraRotate) {
            this.#triangles_real = this.#triangles.map(tri => tri.translate(offsetX, offsetY, scale, rotate, followCam, cameraX, cameraY, cameraScale, cameraRotate));
            return this;
        }

        clone() {
            return new Hitbox.Polygon(...this.#triangles.map(tri => tri.clone()));
        }
    };

    /**
     * Create a Polygon with 2 Triangles to be a rectangle.
     * @param {number} x The x in the upper left corner.
     * @param {number} y The y in the upper left corner.
     * @param {number} w The width of the rectangle.
     * @param {number} h The height of the rectangle.
     * @returns {typeof Hitbox.Polygon}
     */
    static rectangle(x, y, w, h) {
        return new this.Polygon(
            new this.Triangle(
                x, y,
                x + w, y,
                x, y - h
            ),
            new this.Triangle(
                x + w, y,
                x, y - h, 
                x + w, y - h
            )
        );
    }

    /**
     * Create a Hitbox with 2 Triangles to be a rectangle.
     * @param {number} x The x in the upper left corner.
     * @param {number} y The y in the upper left corner.
     * @param {number} w The width of the rectangle.
     * @param {number} h The height of the rectangle.
     * @returns {Hitbox}
     */
    static rectBox(x, y, w, h) {
        return new Hitbox(this.rectangle(x, y, w, h));
    }

    /** @type {{[name: string]: Polygon}} */
    #boxes = {};
    /**
     * @param {Polygon} defaultHitbox default hitbox
     */
    constructor(defaultHitbox) {
        super();
        if (!defaultHitbox) throw new TypeError("Must declare the default polygon for hitbox.");
        this.setBox("default", defaultHitbox);
    }

    #offsetX = 0;
    #offsetY = 0;
    #scale = 1;
    #rotate = 0;
    #followCam = false;
    #cameraX = 0;
    #cameraY = 0;
    #cameraScale = 1;
    #cameraRotate = 0;

    /**
     * Set a hitbox by name.
     * @param {string} name The name of the hitbox
     * @param {Hitbox.Polygon} polygon The polygon box
     * @returns {this}
     */
    setBox(name, polygon) {
        this.#boxes[name] = polygon;
        return this;
    }

    /**
     * Get a hitbox by name.
     * @param {string} name The name of the hitbox.
     * @returns {Hitbox.Polygon}
     */
    getBox(name) {
        return this.#boxes[name] ?? this.#boxes["default"];
    }

    /**
     * Check this hitbox has the polygon box with the given name.
     * @param {string} name The name of hitbox
     * @returns {boolean}
     */
    hasBox(name) {
        return Object.hasOwn(this.#boxes, name);
    }

    /**
     * Determine if two collision boxes intersect.
     * @param {string} myType The name of hitbox
     * @param {Hitbox} targetHitbox target hitbox
     * @param {string} targetType target name of hitbox
     * @returns {boolean}
     */
    collision(myType, targetHitbox, targetType) {
        return this.getBox(myType).collision(targetHitbox.getBox(targetType));
    }

    /**
     * Translate the polygons that belong to this hitbox.
     * @param {number} offsetX 
     * @param {number} offsetY 
     * @param {number} scale 
     * @param {number} rotate 
     */
    translate(offsetX, offsetY, scale, rotate, followCam, cameraX, cameraY, cameraScale, cameraRotate) {
        if (
            offsetX === this.#offsetX &&
            offsetY === this.#offsetY &&
            scale === this.#scale &&
            rotate === this.#rotate &&
            followCam === this.#followCam &&
            cameraX === this.#cameraX &&
            cameraY === this.#cameraY &&
            cameraScale === this.#cameraScale &&
            cameraRotate === this.#cameraRotate
        ) return;
        for (const [key, polygon] of Object.entries(this.#boxes)) {
            this.#boxes[key] = polygon.translate(offsetX, offsetY, scale, rotate, followCam, cameraX, cameraY, cameraScale, cameraRotate);
        }
        this.#offsetX = offsetX;
        this.#offsetY = offsetY;
        this.#scale = scale;
        this.#rotate = rotate;
        this.#followCam = followCam;
        this.#cameraX = cameraX;
        this.#cameraY = cameraY;
        this.#cameraScale = cameraScale;
        this.#cameraRotate = cameraRotate;
    }

    get boxes() {
        return Object.keys(this.#boxes);
    }

    clone() {
        const hitbox = new Hitbox(this.#boxes["default"]); /* seize a seat */
        for (const [name, polygon] of Object.entries(this.#boxes)) {
            hitbox.setBox(name, polygon.clone());
        }
        return hitbox;
    }
}

class Variable extends Componentable {
    #constants = {};
    #variables = {};

    constructor() {
        super();
    }

    set_constant(name, value) {
        if (Object.hasOwn(this.#constants, name)) throw new SyntaxError(`Cannot assign to constants "${name}".`);
        this.#constants[name] = value;
        return this;
    }

    get_constant(name) {
        if (Object.hasOwn(this.#constants, name)) return this.#constants[name];
        throw new SyntaxError(`Constant ${name} is undefined`);
    }

    set_variable(name, value) {
        this.#variables[name] = value;
        return this;
    }

    get_variable(name) {
        if (Object.hasOwn(this.#variables, name)) return this.#variables[name];
        throw new SyntaxError(`Variables ${name} is undefined`);
    }

    clone() {
        const variable = new Variable();

        for (const [name, constant] of Object.entries(this.#constants)) {
            variable.set_constant(name, constant);
        }
        for (const [name, constant] of Object.entries(this.#variables)) {
            variable.set_variable(name, constant);
        }

        return variable;
    }
}

class Timer {
    #timers = new Map();
    constructor() {}

    hasTimer(name) {
        return this.#timers.has(name);
    }

    startTimer(name) {
        if (this.hasTimer(name)) throw new Error(`Timer ${name} has been created.`);
        this.#timers.set(name, Date.now());
    }

    clearTimer(name) {
        this.#timers.delete(name);
    }

    getTimer(name) {
        return Date.now() - this.#timers.get(name);
    }
}

class ScratchTools {
    /** @type {ScratchTools.ScratchVMLike} */

    /**
     * @param vm {ScratchTools.ScratchVMLike}
     */
    constructor(vm) {
        const scratchVM = vm;

        this.getSounds = class {
            static audioContext = new (window.AudioContext || window.webkitAudioContext)();

            /**
             * Get the specified sprite's sounds.
             * @param {number} index The index of sprite
             * @returns {Promise<{data: Uint8Array, name: string}[]>}
             */
            static async getSounds(index) {
                try {
                    /* Also, we can use vm?.asset to get all media resources, includes img and audio. */
                    return scratchVM?.runtime?.targets?.[index]?.sprite?.sounds?.map(item => ({"data": window.structuredClone(item?.asset?.data), "name": item?.name}));   
                } catch (error) {
                    throw new JScratchError.VMError(error.message);
                }
            }
        };

        this.Mouse = class {
            static get stageWidth() {
                return scratchVM?.runtime?.stageWidth;
            }
            static get stageHeight() {
                return scratchVM?.runtime?.stageHeight;
            }

            static get mouseX() {
                return MathPlus.between(-this.stageWidth / 2, scratchVM?.runtime?.ioDevices?.mouse?._scratchX, this.stageWidth / 2);
            }  

            static get mouseY() {
                return MathPlus.between(-this.stageHeight / 2, scratchVM?.runtime?.ioDevices?.mouse?._scratchY, this.stageHeight / 2);
            }  
        };

        this.Stage = class {
            static get stageWidth() {
                return scratchVM.runtime.stageWidth;
            }
            static get stageHeight() {
                return scratchVM.runtime.stageHeight;
            }
            /**
             * @type {HTMLCanvasElement}
             */
            static get stageCanvas() {
                return scratchVM.renderer.canvas;
            }
            /**
             * @type {HTMLDivElement}
             */
            static get container() {
                return scratchVM.renderer.canvas.parentElement;
            }
        };

        this.Variables = class {
            static globalVariable(name) {
                return Object.values(vm.runtime._stageTarget.variables).filter(value => value.name === name)[0].value;
            }
        };
    }

    getSounds;
    Mouse;
    Stage;
    Variables;

    /**
     * This class is only used to simulate the scratch vm then we can test the JScratch in different environment.
     * It provides all attributes that the class ScratchTools needs. But they are all meaningless.
     * In the future, maybe it can be an API to create a Scratch project fully managed by JavaScript.
     */
    static ScratchVMLike = class {
        constructor() {};

        renderer = {
            canvas: new HTMLCanvasElement(),
        };

        runtime = {
            targets: [
                {
                    sprite: {
                        sounds: []
                    }
                },
                {
                    sprite: {
                        sounds: []
                    }
                },
            ],
            stageWidth: 640,
            stageHeight: 360,
            ioDevices: {
                mouse: {
                    _scratchX: 0,
                    _scratchY: 0,
                }
            }
        };
    };
}

class JScratch {
    /**
     * @type {LayerManager}
     */
    #layerManager;
    /**@type {Camera} */
    #cameraManager;
    /**@type {ScratchTools} */
    #scratchTools;
    #musician;
    /** @type {KeysListener} */
    #keysListener;
    /**@type {EventBus} */
    #eventBus;
    /**@type {Timer} */
    #timers = new Timer();

    #globalVariables = new Variable();

    /**
     * @type {Map<string, Component>} 
     */
    #components = new Map();

    /**@type {Set<Component>} */
    #defaultComponentsSet = new Set();

    #entityCounter = 0;
    #entitiesSet = new Set();

    /* Default to 60 FPS */
    #interval = 1/60;
    #is_initGame = false;
    #is_running = false;
    #timeoutId = null;

    #startTime = 0;
    #lastLoopTime = 0;
    #intervalTime = 1/120;
    /**@type {number[]} */
    #intervalTimeList = [];

    static #default_Entity_Namespace = "default";
    static intervalListLength = 100;

    /**
     * @typedef {object} ActionLike
     * @property {Object<string, Function>} kinds
     * @property {Object<string, Function>} init
     */
    /**@type {{name: ActionLike}} */
    #EntitiesActions = {};

    /**@type {object[]} */
    entitiesData = [];
    /**@type {number[]} */
    hitboxesData = [];

    Action;

    /**
     * @param {typeof ScratchTools.ScratchVMLike} vm
     * @param {Component[]} components An array of Component instances
     * @param {string[]} layers A level list
     * @param {number} interval The interval time between loops.
     * @param {() => void} initFn The function to init the data before playing.
     * @param {() => void} postprocessing The function that execute at the first of a loop.
     * @param {() => void} preprocessing The function that execute at the end of a loop.
     */
    constructor(vm, components, layers, interval, initFn, preprocessing, postprocessing) {
        /* Bind LayerManager */
        this.#layerManager = new LayerManager(...layers);

        /* Bind components */
        if (!Array.isArray(components)) throw new TypeError("Components must be an array");
        const defaultComponents = [
            new Component("klass", "string"),
            new Component("kind", "string"),
            new Component("x", "number"),
            new Component("y", "number"),
            new Component("rotate", "number"),
            new Component("scale", "number"),
            new Component("visible", "boolean"),
            new Component("layer", this.layerManager.Layer),
            new Component("skin", "string"),
            new Component("hitbox", Hitbox),
            new Component("follow", "boolean"),
            new Component("variable", Variable)
        ];

        defaultComponents.forEach(component => {
            this.#components.set(component.name(), component);
            this.#defaultComponentsSet.add(component);
        });

        components.forEach(component => {
            if (!(component instanceof Component)) throw new TypeError("All components must be instances of Component");
            this.#components.set(component.name() ,component);
        });

        /* Bind interval time */
        if (typeof interval !== "number" || interval <= 0) throw new TypeError("Interval must be a positive number");
        this.#interval = interval;

        /* Bind functions */
        if (typeof initFn === "function") this._init = initFn.bind(this);
        if (typeof preprocessing === "function") this._preprocessing = preprocessing.bind(this);
        if (typeof postprocessing === "function") this._postprocessing = postprocessing.bind(this);

        /* Bind Action class */
        const JScratchThis = this;
        const Components = JScratchThis.#components;
        const Action = class {
            /**@type {number} */
            static #bindID;

            /**
             * Bind a specific entity ID as the current action target.
             * @param {number} entityId The entity ID to bind.
             * @throws {TypeError} If entityId is not a number.
             */
            static bindEntity(entityId) {
                Action.throwTypeError(entityId, "number", "bindEntity", "entityId");
                this.#bindID = entityId;
            }

            /** The function that the entity execute each loop. These functions are bound this(Action), so their this is Action.
             * @type {{ [key: string]: () => void }} */
            static kinds = {};
            /** The function that the entity executes when it is created. These functions are called this(Action), so their this is Action.
             * @type {{ [key: string]: () => void }} */
            static init = {};

            static defaultComponents = {
                klass: JScratch.#default_Entity_Namespace,
                kind: JScratch.#default_Entity_Namespace,
                x: 0,
                y: 0,
                rotate: 0,
                scale: 1,
                visible: false,
                layer: JScratchThis.#layerManager.giveDefaultLayer(),
                skin: "null", 
                hitbox: Hitbox.rectBox(0,0,0,0),
                follow: false,
                variable: new Variable()
            };

            /**
             * Resolve the default value for a component name.
             * @param {string} name The component name to resolve.
             * @returns {any} A cloned Componentable or the raw default value.
             * @throws {TypeError} If name is not a string.
             */
            static getDefaultComponent(name) {
                Action.throwTypeError(name, "string", "getDefaultComponent", "name");
                let value;
                if (Object.hasOwn(this.defaultComponents, name)) {
                    value = this.defaultComponents[name];
                } else if (this !== Action) {
                   value = Object.getPrototypeOf(this).getDefaultComponent(name);
                }

                if (value instanceof Componentable) {
                    return value.clone();
                } else {
                    return value;
                }
            }

            /**
             * Validate an input value against a JavaScript type.
             * @param {any} value The value to validate.
             * @param {string} type The expected JavaScript type name.
             * @param {string} path The API path for the error message.
             * @param {string} name The argument name for the error message.
             * @throws {TypeError} If the value does not match the expected type.
             */
            static throwTypeError(value, type, path, name) {
                if (typeof value !== type) throw new TypeError(`Action.${path}'s ${name} must be a ${type}.`);
            };

            static motion = class {
                /**
                 * Move the bound entity forward by a given number of steps.
                 * @param {number} step The step length to move.
                 * @returns {void}
                 * @throws {TypeError} If step is not a number.
                 */
                static move(step) {
                    Action.throwTypeError(step, "number", "motion.move", "step");

                    Action.component.addComponent(Action.#bindID, "x", step * MathPlus.cos(this.myRotate));
                    Action.component.addComponent(Action.#bindID, "y", step * MathPlus.sin(this.myRotate));
                };

                /**
                 * Set the bound entity's rotation to a specific direction.
                 * @param {number} rotate The target rotation in degrees.
                 * @returns {void}
                 * @throws {TypeError} If rotate is not a number.
                 */
                static point(rotate) {
                    Action.throwTypeError(rotate, "number", "motion.point", "rotate");

                    Action.component.setComponent(Action.#bindID, "rotate", rotate);
                };

                /**
                 * Rotate the bound entity toward another entity.
                 * @param {number} entityId The target entity ID.
                 * @returns {void}
                 * @throws {TypeError} If entityId is not a number.
                 * @throws {JScratchError.IdError} If the target entity does not exist.
                 */
                static pointEntity(entityId) {
                    Action.throwTypeError(entityId, "number", "motion.pointEntity", "entityId");
                    
                    Action.component.setComponent(
                        Action.#bindID, 
                        "rotate",
                        MathPlus.atan2(
                            Action.component.getComponent(entityId, "y") - this.myY,
                            Action.component.getComponent(entityId, "x") - this.myX
                        )
                    );
                };

                /**
                 * Rotate the bound entity toward a world-space coordinate.
                 * @param {number} x The target x position.
                 * @param {number} y The target y position.
                 * @returns {void}
                 * @throws {TypeError} If x or y is not a number.
                 */
                static pointXY(x, y) {
                    Action.throwTypeError(x, "number", "motion.pointXY", "x");
                    Action.throwTypeError(y, "number", "motion.pointXY", "y");

                    Action.component.setComponent(
                        Action.#bindID,
                        "rotate", 
                        MathPlus.atan2(
                            y - this.myY,
                            x - this.myX
                        )
                    );
                };

                /**
                 * Rotate the bound entity to face the current mouse position.
                 * @returns {void}
                 */
                static pointMouse() {
                    const playerScreen = JScratchThis.#cameraManager.translate(this.myX, this.myY);
                    const degrees = MathPlus.atan2(
                        Action.sensing.mouseY - playerScreen[1],
                        Action.sensing.mouseX - playerScreen[0]
                    );
                    Action.component.setComponent(Action.#bindID, "rotate", degrees);
                };

                /**
                 * Rotate the bound entity to a random direction.
                 * @returns {void}
                 */
                static pointRandom() {
                    Action.component.setComponent(Action.#bindID, "rotate", MathPlus.random(0, 360));
                };

                /**
                 * Rotate the bound entity by a relative amount.
                 * @param {number} rotate The relative rotation delta in degrees.
                 * @returns {void}
                 * @throws {TypeError} If rotate is not a number.
                 */
                static turn(rotate) {
                    Action.throwTypeError(rotate, "number", "motion.turn", "rotate");
                    Action.component.addComponent(Action.#bindID, "rotate", rotate);
                };

                /**
                 * Add to the bound entity's x position.
                 * @param {number} x The x delta to apply.
                 * @returns {void}
                 * @throws {TypeError} If x is not a number.
                 */
                static changeX(x) {
                    Action.throwTypeError(x, "number", "motion.changeX", "x");
                    Action.component.addComponent(Action.#bindID, "x", x);
                };

                /**
                 * Add to the bound entity's y position.
                 * @param {number} y The y delta to apply.
                 * @returns {void}
                 * @throws {TypeError} If y is not a number.
                 */
                static changeY(y) {
                    Action.throwTypeError(y, "number", "motion.changeY", "y");

                    Action.component.addComponent(Action.#bindID, "y", y);
                };

                /**
                 * Add to the bound entity's position.
                 * @param {number} x The x delta to apply.
                 * @param {number} y The y delta to apply.
                 * @returns {void}
                 * @throws {TypeError} If x or y is not a number.
                 */
                static changePosition(x, y) {
                    Action.throwTypeError(x, "number", "motion.changePosition", "x");
                    Action.throwTypeError(y, "number", "motion.changePosition", "y");

                    Action.component.addComponent(Action.#bindID, "x", x);
                    Action.component.addComponent(Action.#bindID, "y", y);
                };

                /**
                 * Move the bound entity to an absolute position.
                 * @param {number} x The target x position.
                 * @param {number} y The target y position.
                 * @returns {void}
                 * @throws {TypeError} If x or y is not a number.
                 */
                static goto(x, y) {
                    Action.throwTypeError(x, "number", "motion.goto", "x");
                    Action.throwTypeError(y, "number", "motion.goto", "y");

                    Action.component.setComponent(Action.#bindID, "x", x);
                    Action.component.setComponent(Action.#bindID, "y", y);
                };

                /**
                 * Move the bound entity to a random position within the current camera view.
                 * @returns {void}
                 */
                static goRandom() {
                    Action.component.setComponent(Action.#bindID, "x", JScratchThis.#cameraManager.randomX);
                    Action.component.setComponent(Action.#bindID, "y", JScratchThis.#cameraManager.randomY);
                };

                /**
                 * Set the bound entity's x position to an absolute value.
                 * @param {number} x The target x position.
                 * @returns {void}
                 * @throws {TypeError} If x is not a number.
                 */
                static goX(x) {
                    Action.throwTypeError(x, "number", "motion.goX", "x");
                    Action.component.setComponent(Action.#bindID, "x", x);
                };

                /**
                 * Set the bound entity's y position to an absolute value.
                 * @param {number} y The target y position.
                 * @returns {void}
                 * @throws {TypeError} If y is not a number.
                 */
                static goY(y) {
                    Action.throwTypeError(y, "number", "motion.goY", "y");
                    Action.component.setComponent(Action.#bindID, "y", y);
                };

                /**
                 * Get the bound entity's x position.
                 * @returns {number}
                 */
                static get myX() {
                    return Action.component.getComponent(Action.#bindID, "x");
                };

                /**
                 * Get the bound entity's y position.
                 * @returns {number}
                 */
                static get myY() {
                    return Action.component.getComponent(Action.#bindID, "y");
                };

                /**
                 * Get the bound entity's rotation.
                 * @returns {number}
                 */
                static get myRotate() {
                    return Action.component.getComponent(Action.#bindID, "rotate");
                };
            };
            static looks = class {
                /**
                 * Set the bound entity's skin.
                 * @param {string} skin The skin name to apply.
                 * @returns {void}
                 * @throws {TypeError} If skin is not a string.
                 */
                static setSkin(skin) {
                    Action.throwTypeError(skin, "string", "looks.setSkin", "skin");
                    Action.component.setComponent(Action.#bindID, "skin", skin);
                };

                /**
                 * Set the bound entity's scale.
                 * @param {number} scale The new scale value.
                 * @returns {void}
                 * @throws {TypeError} If scale is not a number.
                 */
                static setScale(scale) {
                    Action.throwTypeError(scale, "number", "looks.setScale", "scale");
                    Action.component.setComponent(Action.#bindID, "scale", scale);
                };

                /**
                 * Increase the bound entity's scale by a delta.
                 * @param {number} scale The scale delta to add.
                 * @returns {void}
                 * @throws {TypeError} If scale is not a number.
                 */
                static changeScale(scale) {
                    Action.throwTypeError(scale, "number", "looks.changeScale", "scale");
                    Action.component.addComponent(Action.#bindID, "scale", scale);
                };

                /**
                 * Set the bound entity's visibility state.
                 * @param {boolean} visible Whether the entity should be visible.
                 * @returns {void}
                 * @throws {TypeError} If visible is not a boolean.
                 */
                static visible(visible) {
                    Action.throwTypeError(visible, "boolean", "looks.visible", "visible");
                    Action.component.setComponent(Action.#bindID, "visible", visible);
                };

                /**
                 * Set the bound entity's layer level.
                 * @param {string} level The layer level name.
                 * @returns {void}
                 * @throws {TypeError} If level is not a string.
                 */
                static setLevel(level) {
                    Action.throwTypeError(level, "string", "looks.setLevel", "level");
                    Action.component.getComponent(Action.#bindID, "layer").level = level;
                }

                /**
                 * Set the bound entity's layer index.
                 * @param {number} index The z-index inside the layer.
                 * @returns {void}
                 * @throws {TypeError} If index is not a number.
                 */
                static setZIndex(index) {
                    Action.throwTypeError(index, "number", "looks.setZIndex", "index");
                    Action.component.getComponent(Action.#bindID, "layer").index = index;
                }

                /**
                 * Sort the entity in its layer by its y position.
                 * @returns {void}
                 */
                static sortByY() {
                    this.setZIndex(Action.motion.myY);
                }

                /**
                 * Create a new layer instance with the given level and index.
                 * @param {string} level The layer level name.
                 * @param {number} index The layer index.
                 * @returns {LayerManager.Layer}
                 * @throws {TypeError} If level is not a string or index is not a number.
                 */
                static newLayer(level, index) {
                    Action.throwTypeError(level, "string", "looks.newLayer", "level");
                    Action.throwTypeError(index, "number", "looks.newLayer", "index");
                    return new JScratchThis.#layerManager.Layer(level, index);
                }

                /**
                 * Get the bound entity's skin name.
                 * @returns {string}
                 */
                static get mySkin() {
                    return Action.component.getComponent(Action.#bindID, "skin");
                }

                /**
                 * Get the bound entity's scale.
                 * @returns {number}
                 */
                static get myScale() {
                    return Action.component.getComponent(Action.#bindID, "scale");
                }

                /**
                 * Get the bound entity's visibility state.
                 * @returns {boolean}
                 */
                static get myVisibility() {
                    return Action.component.getComponent(Action.#bindID, "visible");
                }

                /**
                 * Get the bound entity's layer level name.
                 * @returns {string}
                 */
                static get myLevel() {
                    return Action.component.getComponent(Action.#bindID, "layer").level;
                }

                /**
                 * Get the bound entity's layer index.
                 * @returns {number}
                 */
                static get my_zIndex() {
                    return Action.component.getComponent(Action.#bindID, "layer").index;
                }
            };
            static sounds = class {
                /**
                 * Placeholder for future sound preloading logic.
                 * @returns {void}
                 */
                static load() {};

                /**
                 * Play a loaded sound for the current bound entity.
                 * @param {string} name The name of the sound asset.
                 * @param {number} [when=0] Delay before playback starts, in seconds.
                 * @param {number} [offset=0] Offset into the audio buffer, in seconds.
                 * @param {number} [detune=0] Detune in cents.
                 * @param {boolean} [loop=false] Whether the sound should loop.
                 * @param {number} [loopStart=0] Loop start offset in seconds.
                 * @param {number} [loopEnd=0] Loop end offset in seconds.
                 * @param {number} [playBackRate=1.0] Playback speed multiplier.
                 * @returns {Promise<number>}
                 * @throws {TypeError} If any argument has an unexpected type.
                 */
                static async play(name, when = 0, offset = 0, detune = 0, loop = false, loopStart = 0, loopEnd = 0, playBackRate = 1.0) {
                    Action.throwTypeError(name, "string", "sounds.play", "sound's name");
                    Action.throwTypeError(when, "number", "sounds.play", "sound's when");
                    Action.throwTypeError(offset, "number", "sounds.play", "sound's offset");
                    Action.throwTypeError(detune, "number", "sounds.play", "sound's detune");
                    Action.throwTypeError(loop, "boolean", "sounds.play", "sound's loop");
                    Action.throwTypeError(loopStart, "number", "sounds.play", "sound's loopStart");
                    Action.throwTypeError(loopEnd, "number", "sounds.play", "sound's loopEnd");
                    Action.throwTypeError(playBackRate, "number", "sounds.play", "sound's playBackRate");

                    return JScratchThis.#musician.waitSound(name).then(() => {
                        return JScratchThis.#musician.play(name, when, offset, detune, loop, loopStart, loopEnd, playBackRate);
                    });
                };
                /**
                 * Pause a playing sound by its playback ID.
                 * @param {number} id The playback ID returned by play().
                 * @returns {number}
                 * @throws {TypeError} If id is not a number.
                 */
                static pause(id) {
                    Action.throwTypeError(id, "number", "sounds.pause", "sound's id");
                    JScratchThis.#musician.pause(id);
                    return id;
                };
                /**
                 * Stop and remove a playing sound by its playback ID.
                 * @param {number} id The playback ID returned by play().
                 * @returns {void}
                 * @throws {TypeError} If id is not a number.
                 */
                static stop(id) {
                    Action.throwTypeError(id, "number", "sounds.stop", "sound's id");
                    JScratchThis.#musician.stop(id);
                };
                /**
                 * Resume a paused sound by its playback ID.
                 * @param {number} id The playback ID returned by play().
                 * @returns {void}
                 * @throws {TypeError} If id is not a number.
                 */
                static regret(id) {
                    Action.throwTypeError(id, "number", "sounds.regret", "sound's id");
                    JScratchThis.#musician.regret(id);
                };
            };
            static event = class {
                /**
                 * Bind a listener function to an event.
                 * @param {string} event The event name.
                 * @param {() => void} func The listener function.
                 * @param {boolean} [once=false] Whether the listener should be removed after first trigger.
                 * @returns {void}
                 * @throws {TypeError} If event is not a string or func is not a function.
                 */
                static on(event, func, once = false) {
                    JScratchThis.#eventBus.event(event).on(Action.#bindID, func, once);
                };
                /**
                 * Remove the bound listener for the current entity from an event.
                 * @param {string} event The event name.
                 * @returns {void}
                 * @throws {TypeError} If event is not a string.
                 */
                static off(event) {
                    JScratchThis.#eventBus.event(event).off(Action.#bindID);
                };
                /**
                 * Determine whether the current entity has a listener bound to an event.
                 * @param {string} event The event name.
                 * @returns {boolean}
                 * @throws {TypeError} If event is not a string.
                 */
                static isOn(event) {
                    return JScratchThis.#eventBus.event(event).is_on(Action.#bindID);
                };

                /**
                 * Check whether an event exists in the event bus.
                 * @param {string} event The event name.
                 * @returns {boolean}
                 * @throws {TypeError} If event is not a string.
                 */
                static has(event) {
                    return JScratchThis.#eventBus.has(event);
                };
                /**
                 * Create a new event in the event bus.
                 * @param {string} event The event name to create.
                 * @returns {void}
                 * @throws {TypeError} If event is not a string.
                 */
                static create(event) {
                    JScratchThis.#eventBus.create(Action.#bindID, event);
                };
                /**
                 * Delete an event from the event bus.
                 * @param {string} event The event name to delete.
                 * @returns {void}
                 * @throws {TypeError} If event is not a string.
                 */
                static break(event) {
                    JScratchThis.#eventBus.break(event);
                };
            };
            static sensing = class {
                /**
                 * Determine whether the bound entity's hitbox intersects another entity's hitbox.
                 * @param {number} id The target entity ID.
                 * @param {string} type The hitbox type name to compare.
                 * @returns {boolean}
                 * @throws {TypeError} If id is not a number or type is not a string.
                 */
                static touchID(id, type) {
                    Action.throwTypeError(id, "number", "sensing.touchID", "id");
                    Action.throwTypeError(type, "string", "sensing.touchID", "type");
                    return this.myHitbox.collision(type, this.getHitbox(id), type);
                };

                /**
                 * Determine whether the bound entity intersects any entity of a given klass.
                 * @param {string} klass The klass name.
                 * @param {string} type The hitbox type name to compare.
                 * @returns {boolean}
                 * @throws {TypeError} If klass or type is not a string.
                 */
                static touchKlass(klass, type) {
                    Action.throwTypeError(klass, "string", "sensing.touchKlass", "klass");
                    Action.throwTypeError(type, "string", "sensing.touchKlass", "type");
                    const myHitbox = this.myHitbox;
                    for (const id of Action.component.queryByKlass(klass)) {
                        if (myHitbox.collision(type, this.getHitbox(id), type)) return true;
                    }
                    return false;
                };
                /**
                 * Determine whether the bound entity intersects any entity of a given klass and kind.
                 * @param {string} klass The klass name.
                 * @param {string} kind The kind name.
                 * @param {string} type The hitbox type name to compare.
                 * @returns {boolean}
                 * @throws {TypeError} If klass, kind, or type is not a string.
                 */
                static touchKind(klass, kind, type) {
                    Action.throwTypeError(klass, "string", "sensing.touchKind", "klass");
                    Action.throwTypeError(kind, "string", "sensing.touchKind", "kind");
                    Action.throwTypeError(type, "string", "sensing.touchKind", "type");
                    const myHitbox = this.myHitbox;
                    for (const id of Action.component.queryByKind(klass, kind)) {
                        if (myHitbox.collision(type, this.getHitbox(id), type)) return true;
                    }
                    return false;
                };

                /**
                 * Get the current mouse x position in screen coordinates.
                 * @returns {number}
                 */
                static get mouseX() {
                    return JScratchThis.#scratchTools.Mouse.mouseX;
                };

                /**
                 * Get the current mouse y position in screen coordinates.
                 * @returns {number}
                 */
                static get mouseY() {
                    return JScratchThis.#scratchTools.Mouse.mouseY;
                };

                /**
                 * Get the current mouse position converted into the camera's local coordinates.
                 * @returns {number}
                 */
                static get cameraMouseX() {
                    const camera = JScratchThis.#cameraManager;
                    const inverseScale = camera.cameraScale === 0 ? 1 : 1 / camera.cameraScale;
                    return MathPlus.Matrix.translate(this.mouseX, this.mouseY, camera.cameraX, camera.cameraY, inverseScale, camera.cameraRotate)[0];
                };

                /**
                 * Get the current mouse position converted into the camera's local coordinates.
                 * @returns {number}
                 */
                static get cameraMouseY() {
                    const camera = JScratchThis.#cameraManager;
                    const inverseScale = camera.cameraScale === 0 ? 1 : 1 / camera.cameraScale;
                    return MathPlus.Matrix.translate(this.mouseX, this.mouseY, camera.cameraX, camera.cameraY, inverseScale, camera.cameraRotate)[1];
                };

                /**
                 * Get the current mouse position converted into world coordinates.
                 * @returns {number}
                 */
                static get worldMouseX() {
                    const camera = JScratchThis.#cameraManager;
                    return MathPlus.Matrix.inverseTranslate(this.mouseX, this.mouseY, -camera.cameraX, -camera.cameraY, camera.cameraScale, -camera.cameraRotate)[0];
                };

                /**
                 * Get the current mouse position converted into world coordinates.
                 * @returns {number}
                 */
                static get worldMouseY() {
                    const camera = JScratchThis.#cameraManager;
                    return MathPlus.Matrix.inverseTranslate(this.mouseX, this.mouseY, -camera.cameraX, -camera.cameraY, camera.cameraScale, -camera.cameraRotate)[1];
                }
                /**
                 * Check whether a key is currently pressed.
                 * @param {string} key The key name.
                 * @returns {boolean}
                 * @throws {TypeError} If key is not a string.
                 */
                static is_press(key) {
                    Action.throwTypeError(key, "string", "sensing.is_press", "key");
                    return JScratchThis.#keysListener.isKeyPress(key);
                };

                /**
                 * Get the current state of a key.
                 * @param {string} key The key name.
                 * @returns {string}
                 * @throws {TypeError} If key is not a string.
                 */
                static press_state(key) {
                    Action.throwTypeError(key, "string", "sensing.press_state", "key");
                    return JScratchThis.#keysListener.keyState(key);
                };

                /**
                 * Get how long a key has been pressed in milliseconds.
                 * @param {string} key The key name.
                 * @returns {number}
                 * @throws {TypeError} If key is not a string.
                 */
                static press_millisecond(key) {
                    Action.throwTypeError(key, "string", "sensing.press_millisecond", "key");
                    return Date.now() - JScratchThis.#keysListener.keyPressTime(key);
                };

                /**
                 * Get how many update ticks a key has been processed in.
                 * @param {string} key The key name.
                 * @returns {number}
                 * @throws {TypeError} If key is not a string.
                 */
                static press_updateCount(key) {
                    Action.throwTypeError(key, "string", "sensing.press_updateCount", "key");
                    return JScratchThis.#keysListener.keyUpdateCount(key);
                };

                /**
                 * Start a named timer.
                 * @param {string} name The timer name.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static startTimer(name) {
                    Action.throwTypeError(name, "string", "sensing.startTimer", "name");
                    JScratchThis.#timers.startTimer(name);
                };

                /**
                 * Clear a named timer.
                 * @param {string} name The timer name.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static clearTimer(name) {
                    Action.throwTypeError(name, "string", "sensing.clearTimer", "name");
                    JScratchThis.#timers.clearTimer(name);
                };

                /**
                 * Get the elapsed time of a named timer in milliseconds.
                 * @param {string} name The timer name.
                 * @returns {number}
                 * @throws {TypeError} If name is not a string.
                 */
                static getTimer(name) {
                    Action.throwTypeError(name, "string", "sensing.getTimer", "name");
                    return JScratchThis.#timers.getTimer(name);
                };

                /**
                 * Check whether a named timer exists.
                 * @param {string} name The timer name.
                 * @returns {boolean}
                 * @throws {TypeError} If name is not a string.
                 */
                static hasTimer(name) {
                    Action.throwTypeError(name, "string", "sensing.hasTimer", "name");
                    return JScratchThis.#timers.hasTimer(name);
                };

                /**
                 * Get the current bound entity's hitbox.
                 * @returns {Hitbox}
                 */
                static get myHitbox() {
                    return this.getHitbox(Action.#bindID);
                }

                /**
                 * Get the hitbox of a specific entity and ensure it is translated.
                 * @param {number} id The entity ID.
                 * @returns {Hitbox}
                 * @throws {TypeError} If id is not a number.
                 */
                static getHitbox(id) {
                    Action.throwTypeError(id, "number", "sensing.getHitbox", "id");
                    Action.component.translateHitbox(id);
                    return Action.component.getComponent(id, "hitbox");
                }
            };
            static system = class {
                /**
                 * Print messages to the terminal log.
                 * @param {...any} messages Messages to output.
                 * @returns {void}
                 */
                static log(...messages) {
                    Terminal.log(...messages);
                };
                /**
                 * Print warnings to the terminal.
                 * @param {...any} messages Messages to output.
                 * @returns {void}
                 */
                static warn(...messages) {
                    Terminal.warn(...messages);
                };

                /**
                 * Print errors to the terminal.
                 * @param {...any} messages Messages to output.
                 * @returns {void}
                 */
                static error(...messages) {
                    Terminal.error(...messages);
                };

                /**
                 * Print debug messages to the terminal.
                 * @param {...any} messages Messages to output.
                 * @returns {void}
                 */
                static debug(...messages) {
                    Terminal.debug(...messages);
                };

                /**
                 * End the game loop.
                 * @returns {void}
                 */
                static end() {
                    JScratchThis.end();
                };

                /**
                 * Start the game loop.
                 * @returns {void}
                 */
                static start() {
                    JScratchThis.start();
                };

                /**
                 * Execute a callback after a delay with the current entity binding preserved.
                 * @param {() => void} func The callback to run.
                 * @param {number} delay The delay in milliseconds.
                 * @returns {number}
                 * @throws {TypeError} If func is not a function or delay is not a number.
                 */
                static delay(func, delay) {
                    Action.throwTypeError(func, "function", "system.delay", "func");
                    Action.throwTypeError(delay, "number", "system.delay", "delay");
                    const id = Action.#bindID;
                    return setTimeout(() => {
                        const currentId = Action.#bindID;
                        Action.bindEntity(id);
                        func();
                        Action.bindEntity(currentId);
                    }, delay);
                };
            };
            static camera = class {
                /**
                 * Move the camera forward by a given number of units.
                 * @param {number} step The movement distance.
                 * @returns {void}
                 * @throws {TypeError} If step is not a number.
                 */
                static moveCamera(step) {
                    JScratchThis.#cameraManager.moveCamera(step);
                };
                /**
                 * Set the camera position to an absolute world-space coordinate.
                 * @param {number} x The target x.
                 * @param {number} y The target y.
                 * @returns {void}
                 * @throws {TypeError} If x or y is not a number.
                 */
                static cameraGoto(x, y) {
                    JScratchThis.#cameraManager.cameraX = x;
                    JScratchThis.#cameraManager.cameraY = y;
                };
                /**
                 * Set the camera x position.
                 * @param {number} x The target x.
                 * @returns {void}
                 * @throws {TypeError} If x is not a number.
                 */
                static cameraGoX(x) {
                    JScratchThis.#cameraManager.cameraX = x;
                };
                /**
                 * Set the camera y position.
                 * @param {number} y The target y.
                 * @returns {void}
                 * @throws {TypeError} If y is not a number.
                 */
                static cameraGoY(y) {
                    JScratchThis.#cameraManager.cameraY = y;
                };
                /**
                 * Move the camera by a delta.
                 * @param {number} x The x delta.
                 * @param {number} y The y delta.
                 * @returns {void}
                 * @throws {TypeError} If x or y is not a number.
                 */
                static cameraChangePosition(x, y) {
                    JScratchThis.#cameraManager.cameraX += x;
                    JScratchThis.#cameraManager.cameraY += y;
                };
                /**
                 * Move the camera along the x axis.
                 * @param {number} x The x delta.
                 * @returns {void}
                 * @throws {TypeError} If x is not a number.
                 */
                static cameraChangeX(x) {
                    JScratchThis.#cameraManager.cameraX += x;
                };
                /**
                 * Move the camera along the y axis.
                 * @param {number} y The y delta.
                 * @returns {void}
                 * @throws {TypeError} If y is not a number.
                 */
                static cameraChangeY(y) {
                    JScratchThis.#cameraManager.cameraY += y;
                };
                /**
                 * Rotate the camera by a relative angle.
                 * @param {number} degrees The rotation delta in degrees.
                 * @returns {void}
                 * @throws {TypeError} If degrees is not a number.
                 */
                static turnCamera(degrees) {
                    JScratchThis.#cameraManager.cameraRotate += degrees;
                };
                /**
                 * Set the camera rotation to an absolute angle.
                 * @param {number} direction The target rotation in degrees.
                 * @returns {void}
                 * @throws {TypeError} If direction is not a number.
                 */
                static cameraRotate(direction) {
                    JScratchThis.#cameraManager.cameraRotate = direction;
                };
                /**
                 * Set the camera scale to an absolute value.
                 * @param {number} scale The target scale.
                 * @returns {void}
                 * @throws {TypeError} If scale is not a number.
                 */
                static scaleCamera(scale) {
                    JScratchThis.#cameraManager.cameraScale = scale;
                };
                /**
                 * Increase the camera scale by a delta.
                 * @param {number} scale The scale delta.
                 * @returns {void}
                 * @throws {TypeError} If scale is not a number.
                 */
                static addScale(scale) {
                    JScratchThis.#cameraManager.cameraScale += scale;
                };
                /**
                 * Multiply the camera scale by a factor.
                 * @param {number} scale The multiplier.
                 * @returns {void}
                 * @throws {TypeError} If scale is not a number.
                 */
                static mulScale(scale) {
                    JScratchThis.#cameraManager.cameraScale *= scale;
                }
                /**
                 * Set the component follow.
                 * @param {boolean} follow Is to follow camera?
                 * @throws {TypeError} If follow is not a boolean.
                 */
                static followCamera(follow) {
                    Action.throwTypeError(follow, "boolean", "camera.followCamera", "follow");
                    Action.component.setComponent(Action.#bindID, "follow", follow);
                }
                /**
                 * Return the x of camera.
                 * @type {number}
                 */
                static get cameraX() {
                    return JScratchThis.#cameraManager.cameraX;
                };
                /**
                 * Return the y of camera.
                 * @type {number}
                 */
                static get cameraY() {
                    return JScratchThis.#cameraManager.cameraY;
                };
                /**
                 * Return the rotation of camera.
                 * @type {number}
                 */
                static get cameraRotation() {
                    return JScratchThis.#cameraManager.cameraRotate;
                };
                /**
                 * Return the scale of camera.
                 * @type {number}
                 */
                static get cameraScale() {
                    return JScratchThis.#cameraManager.cameraScale;
                };
                /**
                 * Return I am following camera or not.
                 * @type {boolean}
                 */
                static get myFollow() {
                    return Action.component.getComponent(Action.#bindID, "follow");
                }
            };
            static component = class {
                /**
                 * Get the value of a component for a specific entity.
                 * @param {number} entityId Target entity ID.
                 * @param {string} component The component name.
                 * @returns {any}
                 * @throws {TypeError} If entityId is not a number or component is not a string.
                 */
                static getComponent(entityId, component) {
                    return Components.get(component).getEntityValue(entityId);
                };

                /**
                 * Set the value of a component for a specific entity.
                 * @param {number} entityId Target entity ID.
                 * @param {string} component The component name.
                 * @param {any} value The value to assign.
                 * @returns {void}
                 * @throws {TypeError} If entityId is not a number or component is not a string.
                 */
                static setComponent(entityId, component, value) {
                    Components.get(component).setEntity(entityId, value);
                };

                /**
                 * Add a numeric delta to a component value for a specific entity.
                 * @param {number} entityId Target entity ID.
                 * @param {string} component The component name.
                 * @param {number} value The value to add.
                 * @returns {void}
                 * @throws {TypeError} If entityId is not a number, component is not a string, or value is not a number.
                 */
                static addComponent(entityId, component, value) {
                    Components.get(component).addValue(entityId, value);
                };

                /**
                 * The component_translateHitbox translate the hitbox of the given entity.
                 * @param {number} entityId The id of target entity. If this is not a number, the target entity will be the bound entity.
                 */
                static translateHitbox(entityId) {
                    let id = Action.#bindID;
                    if (typeof entityId === "number") id = entityId;
                    JScratchThis.#components.get("hitbox").getEntityValue(id).translate(
                        JScratchThis.#components.get("x").getEntityValue(id),
                        JScratchThis.#components.get("y").getEntityValue(id),
                        JScratchThis.#components.get("scale").getEntityValue(id),
                        JScratchThis.#components.get("rotate").getEntityValue(id),

                        JScratchThis.#components.get("follow").getEntityValue(id),
                        
                        JScratchThis.#cameraManager.cameraX,
                        JScratchThis.#cameraManager.cameraY,
                        JScratchThis.#cameraManager.cameraScale,
                        JScratchThis.#cameraManager.cameraRotate,
                    );
                };

                /**
                 * Query entity IDs by klass.
                 * @param {string} klass The klass name.
                 * @returns {number[]}
                 * @throws {TypeError} If klass is not a string.
                 */
                static queryByKlass(klass) {
                    Action.throwTypeError(klass, "string", "component.queryByKlass", "klass");
                    return this.queryByEquation("klass", klass);
                };

                /**
                 * Query entity IDs by klass and kind.
                 * @param {string} klass The klass name.
                 * @param {string} kind The kind name.
                 * @returns {number[]}
                 * @throws {TypeError} If klass or kind is not a string.
                 */
                static queryByKind(klass, kind) {
                    Action.throwTypeError(klass, "string", "component.queryByKind", "klass");
                    Action.throwTypeError(kind, "string", "component.queryByKind", "kind");
                    const klassItem = this.queryByEquation("klass", klass);
                    const kindItem = this.queryByEquation("kind", kind, klassItem);

                    return kindItem;
                };
                /**
                 * Query entity IDs by comparing a component value.
                 * @param {string} component The component name.
                 * @param {any} targetValue The expected value.
                 * @param {number[] | null} [targets=null] Optional entity ID restriction.
                 * @returns {number[]}
                 * @throws {TypeError} If component is not a string.
                 */
                static queryByEquation(component, targetValue, targets = null) {
                    Action.throwTypeError(component, "string", "component.queryByEquation", "component");
                    return JScratchThis.#components.get(component).test(value => value === targetValue, targets);
                };

                /**
                 * Query entity IDs by a predicate function.
                 * @param {string} component The component name.
                 * @param {(value: any) => boolean} func The predicate.
                 * @param {number[] | null} [targets=null] Optional entity ID restriction.
                 * @returns {number[]}
                 * @throws {TypeError} If component is not a string or func is not a function.
                 */
                static queryByFunc(component, func, targets) {
                    Action.throwTypeError(component, "string", "component.queryByFunc", "component");
                    Action.throwTypeError(func, "function", "component.queryByFunc", "func");
                    return JScratchThis.#components.get(component).test(func, targets);
                };

                /**
                 * Delete an entity from the engine.
                 * @param {number} id The entity ID to delete.
                 * @returns {void}
                 * @throws {TypeError} If id is not a number.
                 */
                static deleteEntity(id) {
                    Action.throwTypeError(id, "number", "component.deleteEntity", "id");
                    JScratchThis.deleteEntity(id);
                };
            };
            static variable = class {
                /**
                 * Get the Variable object that belongs to the bound entity.
                 * @returns {Variable}
                 */
                static get #thisVariable() {
                    return JScratchThis.#components.get("variable").getEntityValue(Action.#bindID);
                };

                /**
                 * Declare an immutable constant on the bound entity.
                 * @param {string} name The constant name.
                 * @param {any} value The constant value.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static set_constant(name, value) {
                    Action.throwTypeError(name, "string", "variable.set_constant", "name");
                    this.#thisVariable.set_constant(name, value);
                };

                /**
                 * Declare or update a mutable variable on the bound entity.
                 * @param {string} name The variable name.
                 * @param {any} value The variable value.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static set_variable(name, value) {
                    Action.throwTypeError(name, "string", "variable.set_variable", "name");
                    this.#thisVariable.set_variable(name, value);
                };

                /**
                 * Get a constant value from the bound entity.
                 * @param {string} name The constant name.
                 * @returns {any}
                 * @throws {TypeError} If name is not a string.
                 */
                static get_constant(name) {
                    Action.throwTypeError(name, "string", "variable.get_constant", "name");
                    return this.#thisVariable.get_constant(name);
                };

                /**
                 * Get a variable value from the bound entity.
                 * @param {string} name The variable name.
                 * @returns {any}
                 * @throws {TypeError} If name is not a string.
                 */
                static get_variable(name) {
                    Action.throwTypeError(name, "string", "variable.get_variable", "name");
                    return this.#thisVariable.get_variable(name);
                };

                /**
                 * Get the global Variable object.
                 * @returns {Variable}
                 */
                static get #globalVariable() {
                    return JScratchThis.#globalVariables;
                };
                /**
                 * Declare an immutable global constant.
                 * @param {string} name The constant name.
                 * @param {any} value The constant value.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static set_globalConstant(name, value) {
                    Action.throwTypeError(name, "string", "variable.set_globalConstant", "name");
                    this.#globalVariable.set_constant(name, value);
                };

                /**
                 * Declare or update a mutable global variable.
                 * @param {string} name The variable name.
                 * @param {any} value The variable value.
                 * @returns {void}
                 * @throws {TypeError} If name is not a string.
                 */
                static set_globalVariable(name, value) {
                    Action.throwTypeError(name, "string", "variable.set_globalVariable", "name");
                    this.#globalVariable.set_variable(name, value);
                };
                /**
                 * Get a global constant value.
                 * @param {string} name The constant name.
                 * @returns {any}
                 * @throws {TypeError} If name is not a string.
                 */
                static get_globalConstant(name) {
                    Action.throwTypeError(name, "string", "variable.get_globalConstant", "name");
                    return this.#globalVariable.get_constant(name);
                };
                /**
                 * Get a global variable value.
                 * @param {string} name The variable name.
                 * @returns {any}
                 * @throws {TypeError} If name is not a string.
                 */
                static get_globalVariable(name) {
                    Action.throwTypeError(name, "string", "variable.get_globalVariable", "name");
                    return this.#globalVariable.get_variable(name);
                };
            };
        };

        this.Action = Action;
        Action.kinds[JScratch.#default_Entity_Namespace] = () => {};
        this.#EntitiesActions[JScratch.#default_Entity_Namespace] = Action;

        /* Bind some tools */
        this.#scratchTools = new ScratchTools(vm);
        this.#cameraManager = new Camera(this.#scratchTools.Mouse.stageWidth, this.#scratchTools.Mouse.stageHeight);
        this.#musician = new Musician();
        this.#eventBus = new EventBus();
        this.#scratchTools.getSounds.getSounds(1).then(sounds => sounds.forEach(async item => await this.#musician.loadFromUint8Array(item.name, item.data)));

        /* Bind listener */
        const canvasContainer = this.#scratchTools.Stage.container;
        this.#keysListener = new KeysListener(canvasContainer);
    };

    _initializeGame() {
        this._init();
        this.#is_initGame = true;
    };

    get layerManager() {
        return this.#layerManager;
    };

    get running() {
        return this.#is_running;
    };

    get intervalTime() {
        return this.#intervalTime;
    };

    get intervalTime_average() {
        return this.#intervalTimeList.reduce((sum, cur) => sum + cur, 0) / this.#intervalTimeList.length;
    };

    get numberOfEntities() {
        return this.#entitiesSet.size;
    };

    /**
     * Mount an action class for the klass entities.
     * @param {string} klass The class name
     * @param {object} Action The action class extended from Action
     */
    mountAction(klass, Action) {
        if (typeof klass !== "string") throw new TypeError("The klass of entity must be a string.");
        if (!Object.prototype.isPrototypeOf.call(this.Action, Action)) throw new TypeError("The action class must extended from JScratch.Action");

        this.#EntitiesActions[klass] = Action;
    };

    /**
     * Creates a new entity with the given initial values for its components.
     * @param {object} initialValues An object containing initial values for the components of the entity. The keys should match the component names, and the values should be of the correct type for each component.
     * @returns {number} The ID of the created entity.
     */
    createEntity(initialValues) {
        const entityId = this.#entityCounter;

        if (!(initialValues.klass && initialValues.kind)) throw new TypeError(`New entity must have klass and kind, ${JSON.stringify(initialValues)}`);
        this.#components.get("klass").setEntity(entityId, initialValues.klass);
        this.#components.get("kind").setEntity(entityId, initialValues.kind);

        /* Must mounted the klass and kind before create the entity. */
        /**@type {string} */
        const klass = this.#components.get("klass").getEntityValue(entityId);
        if (!this.#EntitiesActions[klass]) throw new JScratchError.EntityError(`Cannot find the mounted action klass: ${klass}`);
        /**@type {typeof this.Action} */
        const action = this.#EntitiesActions[klass];

        const kind = this.#components.get("kind").getEntityValue(entityId);
        if (typeof action.kinds[kind] !== "function") throw new JScratchError.EntityError(`The kind ${kind} in klass ${klass} was not defined or not a function.`);
        action.kinds[kind] = action.kinds[kind].bind(action);

        this.#entitiesSet.add(entityId);
        this.#entityCounter++;

        this.#components.forEach(component => {
            const name = component.name();
            if (name !== "klass" && name !== "kind") {
                component.setEntity(entityId, initialValues[name] ?? action.getDefaultComponent(name));
            }
        });

        /* Invoke init function */
        if (action.init[kind]) {
            this.Action.bindEntity(entityId);
            action.component.translateHitbox(entityId);
            action.init[kind].call(action, entityId, klass, kind, this.#components.get("variable").getEntityValue(entityId));
        }

        return this.#entityCounter;
    };

    deleteEntity(id) {
        this.#entitiesSet.delete(id);
        this.#components.forEach(component => component.deleteEntity(id));
    };

    _init() {};
    _preprocessing() {};
    _postprocessing() {};
    
    #trigger() {
        this.#intervalTime = Date.now() - this.#lastLoopTime;
        this.#lastLoopTime = Date.now();
        this.#intervalTimeList.push(this.#intervalTime);
        if (this.#intervalTimeList.length > JScratch.intervalListLength) this.#intervalTimeList.shift();

        this._preprocessing();

        this.#entitiesSet.forEach(entityId => {
            if (this.#is_running) {
                const klass = this.#components.get("klass").getEntityValue(entityId);
                /**@type {typeof this.Action} */
                const action = this.#EntitiesActions[klass];
                /**@type {string} */
                const kind = this.#components.get("kind").getEntityValue(entityId);
                this.Action.bindEntity(entityId);
                action.kinds[kind](entityId, klass, kind, this.#components.get("variable").getEntityValue(entityId));
            }
        });
        if (!this.#is_running) return;
        this._postprocessing();

        this.#keysListener.update();
        this.#swapData();
        this.#timeoutId = setTimeout(() => this.#trigger(), this.#interval * 1000);
    };

    #swapData() {
        const result = [];
        const allHitbox = {};
        this.#entitiesSet.forEach(entityId => {
            if (this.#components.get("visible").getEntityValue(entityId)) {
                let position = [this.#components.get("x").getEntityValue(entityId), this.#components.get("y").getEntityValue(entityId)];
                let scale = this.#components.get("scale").getEntityValue(entityId) * 100;
                let rotate = this.#components.get("rotate").getEntityValue(entityId);

                if (this.#components.get("follow").getEntityValue(entityId)) {
                    /* Follow camera */
                    position = this.#cameraManager.translate(position[0], position[1]);
                    scale *= this.#cameraManager.cameraScale;
                    rotate -= this.#cameraManager.cameraRotate;
                }

                const obj = {
                    x: position[0],
                    y: position[1],
                    rotate: 90 - rotate,
                    scale: scale,
                    layer: this.#components.get("layer").getEntityValue(entityId),
                    skin: this.#components.get("skin").getEntityValue(entityId),
                };

                if (this.#scratchTools.Variables.globalVariable("DRAW HITBOX")) {
                    /** @type {Hitbox} */
                    const hitbox = this.#components.get("hitbox").getEntityValue(entityId);
                    this.Action.component.translateHitbox(entityId);
                    hitbox.boxes.forEach((box) => {
                        if (!allHitbox[box]) allHitbox[box] = [];
                        allHitbox[box].push(...hitbox.getBox(box).triangles.map(tri => tri.vertexs.flat()).flat());
                    });
                }

                result.push(obj);
            }
        });
        result.sort((a, b) => b.layer.compareTo(a.layer));

        this.entitiesData = result;
        this.hitboxesData = allHitbox;
    };

    start() {
        if (!this.#is_initGame) {
            this._initializeGame();
            this.#startTime = Date.now();
        }
        this.#lastLoopTime = this.#startTime;
        this.#is_running = true;
        this.#trigger();
    };
    end() {
        Terminal.log("End the JSrcatch Game.");
        clearTimeout(this.#timeoutId);
        this.#is_running = false;
        this.#musician.stopAll();
        this.#keysListener.clear();
        this.#components = null;
    };
}

mounter.JScratchGame = new JScratch(scratchVM, [], ["UI", "foreground", "midground", "afterview", "background"], 1 / 240, function () {
    /**@type {JScratch} */
    const GAME = this;

    /* 该示例由 AI (Copilot)创作 This example was created by AI (Copilot) */
    /* 没来得及写文档 */

    class System extends GAME.Action {
        static #action_system() {
            const systemId = this.component.queryByKlass("system")[0];
            const systemVariable = this.component.getComponent(systemId, "variable");
            const playerId = this.component.queryByKlass("player")[0];

            if (playerId) {
                const playerX = this.component.getComponent(playerId, "x");
                const playerY = this.component.getComponent(playerId, "y");
                this.camera.cameraGoto(playerX, playerY);
                //this.camera.scaleCamera(MathPlus.precise(1 + systemVariable.get_variable("score") * 0.01, 2));
            }

            if (this.sensing.is_press("wheelUp")) this.camera.mulScale(1.1);
            if (this.sensing.is_press("wheelDown")) this.camera.mulScale(1 / 1.1);

            this.camera.turnCamera(this.sensing.is_press("ArrowLeft") - this.sensing.is_press("ArrowRight"));

            const lives = systemVariable.get_variable("lives");
            const score = systemVariable.get_variable("score");

            if (lives <= 0 && !systemVariable.get_variable("game_over")) {
                systemVariable.set_variable("game_over", true);
                this.system.warn("Game over. The drones won.");
                this.system.end();
                return;
            }

            if (score >= 30 && !systemVariable.get_variable("game_clear")) {
                systemVariable.set_variable("game_clear", true);
                this.system.log("Stage clear! You collected enough stars.");
                this.system.end();
            }
        };

        static #init_system() {
            this.variable.set_variable("score", 0);
            this.variable.set_variable("lives", 3);
            this.variable.set_variable("game_over", false);
            this.variable.set_variable("game_clear", false);
            this.variable.set_variable("spawn_timer", 0);
            this.variable.set_variable("level", 1);

            this.event.create("coin_collected");
            this.event.create("player_hurt");
            this.event.create("game_clear");

            this.system.log("Dream Drift started. Collect 10 stars and avoid the drones.");
            this.system.debug("Event bus ready:", this.event.has("coin_collected"));

            this.camera.scaleCamera(1);

            GAME.createEntity({
                klass: "system",
                kind: "mouse"
            });

            GAME.createEntity({
                klass: "player",
                kind: "player",
                x: 0,
                y: 0,
                visible: true,
                follow: true,
                layer: new GAME.layerManager.Layer("midground", 0),
                hitbox: Hitbox.rectBox(-12, 12, 24, 24),
                skin: "player",
                variable: (new Variable()).set_constant("speed", 2).set_constant("radius", 24)
            });

            const width = 1280;
            const height = 720;

            for (let index = 0; index < 25; index++) {
                GAME.createEntity({
                    klass: "wall",
                    kind: "wall",
                    x: MathPlus.random(-width/2, width/2),
                    y: MathPlus.random(-height/2, height/2),
                    visible: true,
                    follow: true,
                    layer: new GAME.layerManager.Layer("background", index),
                    hitbox: Hitbox.rectBox(-24, 24, 48, 48),
                    skin: "wall"
                });
            }

            for (let index = 0; index < 30; index++) {
                GAME.createEntity({
                    klass: "coin",
                    kind: "coin",
                    x: MathPlus.random(-width/2, width/2),
                    y: MathPlus.random(-height/2, height/2),
                    visible: true,
                    follow: true,
                    layer: new GAME.layerManager.Layer("foreground", index),
                    hitbox: Hitbox.rectBox(-10, 10, 20, 20),
                    skin: "coin",
                    variable: (new Variable()).set_constant("value", 1).set_variable("collected", false)
                });
            }

            for (let index = 0; index < 5; index++) {
                GAME.createEntity({
                    klass: "enemy",
                    kind: "enemy",
                    x: MathPlus.random(-width/2, width/2),
                    y: MathPlus.random(-height/2, height/2),
                    visible: true,
                    follow: true,
                    layer: new GAME.layerManager.Layer("foreground", index + 20),
                    hitbox: Hitbox.rectBox(-14, 14, 28, 28),
                    skin: "enemy",
                    variable: (new Variable()).set_constant("speed", 0.5 + index * 0.2)
                });
            }
        };

        static #action_mouse() {
            this.motion.goto(this.sensing.cameraMouseX, this.sensing.cameraMouseY);
        }

        static #init_mouse() {
            this.looks.setSkin("cursor");
            this.looks.visible(true);
            this.camera.followCamera(true);
        }

        static kinds = {
            "system": this.#action_system,
            "mouse": this.#action_mouse
        };

        static init = {
            "system": this.#init_system,
            "mouse": this.#init_mouse
        };

        static defaultComponents = {
            visible: false,
            follow: false,
            layer: new GAME.layerManager.Layer("UI", 0),
            skin: "null"
        };
    }

    class Player extends GAME.Action {
        static #action_player() {
            const dx = this.sensing.is_press("d") - this.sensing.is_press("a");
            const dy = this.sensing.is_press("w") - this.sensing.is_press("s");
            const gain = MathPlus.distance(0, 0, dx, dy);
            if (gain) {
                const speed = this.variable.get_constant("speed");
                this.motion.changePosition(dx * speed / gain, dy * speed / gain);
            }

            this.motion.pointMouse();
            this.looks.sortByY();
            this.looks.setScale(1 + Math.sin(Date.now() / 300) * 0.02);
            const coinIds = this.component.queryByKlass("coin");
            coinIds.forEach((coinId) => {
                if (!this.component.getComponent(coinId, "visible")) return;
                if (this.sensing.touchID(coinId, "default")) {
                    const coinVariable = this.component.getComponent(coinId, "variable");
                    const systemId = this.component.queryByKlass("system")[0];
                    const systemVariable = this.component.getComponent(systemId, "variable");
                    systemVariable.set_variable("score", systemVariable.get_variable("score") + coinVariable.get_constant("value"));
                    this.component.deleteEntity(coinId);
                    this.sounds.play("coin", 0, 0, 0, false, 0, 0, 1);
                    
                }
            });

            const enemyIds = this.component.queryByKlass("enemy");
            enemyIds.forEach((enemyId) => {
                if (this.sensing.touchID(enemyId, "default")) {
                    const systemId = this.component.queryByKlass("system")[0];
                    const systemVariable = this.component.getComponent(systemId, "variable");
                    systemVariable.set_variable("lives", systemVariable.get_variable("lives") - 1);
                    this.system.warn("Drone hit! Life -1");
                    this.sounds.play("hurt", 0, 0, 0, false, 0, 0, 1);
                    this.motion.goRandom();
                    this.looks.visible(false);
                    this.system.delay(() => this.looks.visible(true), 180);
                }
            });

            const wallIds = this.component.queryByKind("wall", "wall");
            wallIds.forEach((wallId) => {
                if (this.sensing.touchID(wallId, "default")) {
                    this.motion.changePosition(-dx * 0.7, -dy * 0.7);
                }
            });
        };

        static #init_player() {
            this.motion.goRandom();
            this.motion.pointRandom();
            this.looks.setSkin("player");
            this.looks.visible(true);
            this.looks.setScale(1);
            this.event.create("player_spawn");
            this.event.create("player_hit");
            this.event.on("player_spawn", () => {
                this.system.debug("Player spawn event registered.");
            });
            if (this.event.isOn("player_spawn")) {
                this.system.debug("Player event listener ready.");
            }
        };

        static init = {
            "player": this.#init_player
        };

        static kinds = {
            "player": this.#action_player
        };

        static defaultComponents = {
            visible: true,
            follow: true,
            layer: new GAME.layerManager.Layer("midground", 0),
            skin: "player",
            hitbox: Hitbox.rectBox(-12, 12, 24, 24)
        };
    }

    class Coin extends GAME.Action {
        static #action_coin() {
            this.motion.turn(1.2);
            this.looks.changeScale(Math.sin(Date.now() / 350) * 0.01);
        };

        static #init_coin() {
            this.motion.pointRandom();
            this.looks.setSkin("coin");
            this.looks.setScale(0.9);
            this.looks.setLevel("foreground");
            this.variable.set_variable("collected", false);
        };

        static init = {
            "coin": this.#init_coin
        };

        static kinds = {
            "coin": this.#action_coin
        };

        static defaultComponents = {
            visible: true,
            follow: true,
            layer: new GAME.layerManager.Layer("foreground", 0),
            skin: "coin",
            hitbox: Hitbox.rectBox(-10, 10, 20, 20)
        };
    }

    class Enemy extends GAME.Action {
        static #action_enemy() {
            const playerId = this.component.queryByKlass("player")[0];
            if (playerId) {
                this.motion.pointEntity(playerId);
                this.motion.move(this.variable.get_constant("speed"));
            }
            this.looks.setScale(1 + Math.sin(Date.now() / 250) * 0.02);
        };

        static #init_enemy() {
            this.motion.goRandom();
            this.motion.pointRandom();
            this.looks.setSkin("enemy");
            this.looks.setScale(1);
        };

        static init = {
            "enemy": this.#init_enemy
        };

        static kinds = {
            "enemy": this.#action_enemy
        };

        static defaultComponents = {
            visible: true,
            follow: true,
            layer: new GAME.layerManager.Layer("foreground", 10),
            skin: "enemy",
            hitbox: Hitbox.rectBox(-14, 14, 28, 28)
        };
    }

    class Wall extends GAME.Action {
        static #action_wall() {};

        static #init_wall() {
            this.looks.setSkin("wall");
            this.looks.setScale(1);
            this.looks.setLevel("background");
            this.looks.sortByY();
        };

        static init = {
            "wall": this.#init_wall
        };

        static kinds = {
            "wall": this.#action_wall
        };

        static defaultComponents = {
            visible: true,
            follow: true,
            layer: new GAME.layerManager.Layer("background", 0),
            skin: "wall",
            hitbox: Hitbox.rectBox(-24, 24, 48, 48)
        };
    }

    GAME.mountAction("system", System);
    GAME.mountAction("player", Player);
    GAME.mountAction("coin", Coin);
    GAME.mountAction("enemy", Enemy);
    GAME.mountAction("wall", Wall);

    GAME.createEntity({ klass: "system", kind: "system", visible: false, skin: "null" });
}, function () {}, function () {});

mounter.JScratchGame.start();
}
catch (e) {
    mounter.GameError = e;
    // eslint-disable-next-line no-console
    console.error(e);
    throw new e;
}
