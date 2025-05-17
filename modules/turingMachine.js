import { Tape } from "./tape.js";

export class TuringMachine {
  #tape;
  #instructions;
  #state;
  #stepCount;

  constructor(instructions, initialState, blankSymbol, inputSymbols) {
    this.#instructions = instructions;
    this.#tape = new Tape(blankSymbol, inputSymbols);
    this.#state = initialState;
    this.#stepCount = 0;
  }

  step() {
    const currentSymbol = this.#tape.read();
    const instruction = this.#instructions[this.#state][currentSymbol];
    this.#tape.write(instruction.writeSymbol);
    if (instruction.moveDirection === "Left") {
      this.#tape.moveLeft();
    } else {
      this.#tape.moveRight();
    }
    this.#state = instruction.nextState;
    this.#stepCount++;
  }

  getSlice(start, end) {
    return this.#tape.getSlice(start, end);
  }

  getState() {
    return this.#state;
  }

  getPosition() {
    return this.#tape.getPosition();
  }

  getStepCount() {
    return this.#stepCount;
  }
}
