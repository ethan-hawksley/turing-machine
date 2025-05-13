"use strict";

export class Tape {
  #positiveTape;
  #negativeTape;
  #blankSymbol;
  #position;

  constructor(blankSymbol, inputSymbols) {
    if (inputSymbols.length !== 0) {
      this.#positiveTape = inputSymbols;
    } else {
      this.#positiveTape = [blankSymbol];
    }
    this.#negativeTape = [];
    this.#blankSymbol = blankSymbol;
    this.#position = 0;
  }

  read() {
    if (this.#position >= 0) {
      return this.#positiveTape[this.#position];
    } else {
      return this.#negativeTape[this.#position * -1 - 1];
    }
  }

  write(symbol) {
    if (this.#position >= 0) {
      this.#positiveTape[this.#position] = symbol;
    } else {
      this.#negativeTape[this.#position * -1 - 1] = symbol;
    }
  }

  moveLeft() {
    this.#position--;
    if (
      this.#position < 0 &&
      this.#position * -1 - 1 >= this.#negativeTape.length
    ) {
      this.#negativeTape.push(this.#blankSymbol);
    }
  }

  moveRight() {
    this.#position++;
    if (this.#position >= this.#positiveTape.length) {
      this.#positiveTape.push(this.#blankSymbol);
    }
  }

  getSlice(relativeStart, relativeEnd) {
    const start = this.#position + relativeStart;
    const end = this.#position + relativeEnd;

    let result = [];

    // Fill in the slice from start to end
    for (let i = start; i <= end; i++) {
      if (i >= 0) {
        // Position is in positive tape
        if (i < this.#positiveTape.length) {
          result.push(this.#positiveTape[i]);
        } else {
          result.push(this.#blankSymbol);
        }
      } else {
        // Position is in negative tape
        const negIndex = i * -1 - 1;
        if (negIndex < this.#negativeTape.length) {
          result.push(this.#negativeTape[negIndex]);
        } else {
          result.push(this.#blankSymbol);
        }
      }
    }

    return result;
  }

  getPosition() {
    return this.#position;
  }
}
