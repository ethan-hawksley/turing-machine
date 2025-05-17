"use strict";
import { TuringMachine } from "./modules/turingMachine.js";

const statesInput = document.getElementById("states-input");
const tapeAlphabetSymbolsInput = document.getElementById(
  "tape-alphabet-symbols-input",
);
const blankSymbolInput = document.getElementById("blank-symbol-input");
const inputSymbolsInput = document.getElementById("input-symbols-input");
const initialStateInput = document.getElementById("initial-state-input");

const startButton = document.getElementById("start-button");
const speedSlider = document.getElementById("speed-slider");
const stepButton = document.getElementById("step-button");
const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const loadInput = document.getElementById("load-input");
const showExamplesButton = document.getElementById("show-examples-button");
const examplesDialog = document.getElementById("examples-dialog");

const exampleBusyBeaver = document.getElementById("example-busy-beaver");
const exampleBinaryIncrement = document.getElementById(
  "example-binary-increment",
);
const closeExamplesButton = document.getElementById("close-examples-button");

const errorDiv = document.getElementById("error-div");

const turingMachineGrid = document.getElementById("turing-machine-grid");
const headDiv = document.getElementById("head-div");
const stateIndicator = document.getElementById("state-indicator");
const positionIndicator = document.getElementById("position-indicator");
const tapeContainer = document.getElementById("tape-container");

let turingMachine = null;

function initialiseEventListeners() {
  statesInput.addEventListener("input", () => {
    drawStateGrid();
  });
  statesInput.addEventListener("focus", () => statesInput.select());
  tapeAlphabetSymbolsInput.addEventListener("input", () => {
    drawStateGrid();
  });
  tapeAlphabetSymbolsInput.addEventListener("focus", () =>
    tapeAlphabetSymbolsInput.select(),
  );
  blankSymbolInput.addEventListener("input", () => {
    drawInitialTuringMachine();
  });
  blankSymbolInput.addEventListener("focus", () => blankSymbolInput.select());
  inputSymbolsInput.addEventListener("input", () => {
    drawInitialTuringMachine();
  });
  inputSymbolsInput.addEventListener("focus", () => inputSymbolsInput.select());
  initialStateInput.addEventListener("input", () => {
    drawInitialTuringMachine();
  });
  initialStateInput.addEventListener("focus", () => initialStateInput.select());

  startButton.addEventListener("click", () => {
    if (startButton.textContent === "Start") {
      const errors = validateParameters();
      showErrors(errors);
      if (!errors.length) {
        startTuringMachine();
        cycleTuringMachine();
        startButton.textContent = "Stop";
      }
    } else {
      turingMachine = null;
      startButton.textContent = "Start";
    }
  });

  stepButton.addEventListener("click", () => {
    const errors = validateParameters();
    showErrors(errors);
    if (!errors.length) {
      if (turingMachine === null) {
        startTuringMachine();
      }
      stepTuringMachine();
    }
  });

  resetButton.addEventListener("click", () => {
    turingMachine = null;
    drawInitialTuringMachine();
  });

  saveButton.addEventListener("click", () => {
    console.log("clicked");
    const link = document.createElement("a");
    const instructions = loadInstructions();
    const state = { instructions: instructions };
    state.states = statesInput.value;
    state.tapeAlphabetSymbols = tapeAlphabetSymbolsInput.value;
    state.blankSymbol = blankSymbolInput.value;
    state.inputSymbols = inputSymbolsInput.value;
    state.initialState = initialStateInput.value;
    console.log(state);

    const file = new Blob([JSON.stringify(state)], {
      type: "text/plain",
    });
    link.href = URL.createObjectURL(file);
    link.download = "program.turing";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  loadButton.addEventListener("click", () => {
    loadInput.click();
  });

  loadInput.addEventListener("change", () => {
    const file = loadInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const state = JSON.parse(reader.result);
        writeState(state);
        drawInitialTuringMachine();
        console.log(state);
      };
      reader.readAsText(file);
    }
  });

  showExamplesButton.addEventListener("click", () => {
    examplesDialog.showModal();
  });

  exampleBusyBeaver.addEventListener("click", () => {
    loadExample("busy-beaver");
  });

  exampleBinaryIncrement.addEventListener("click", () => {
    loadExample("binary-increment");
  });

  closeExamplesButton.addEventListener("click", () => {
    examplesDialog.close();
  });
}

function loadExample(example) {
  const promise = fetch(`./examples/${example}.json`);
  promise.then((response) => {
    response.text().then((text) => {
      const state = JSON.parse(text);
      writeState(state);
      drawInitialTuringMachine();
      console.log(state);
    });
  });
  examplesDialog.close();
}

function loadInstructions() {
  let instructions = {};
  const selectors = document.getElementsByClassName("state-data");
  for (const selector of selectors) {
    const state = selector.dataset.state;
    const symbol = selector.dataset.symbol;
    if (!Object.hasOwn(instructions, state)) {
      instructions[state] = {};
    }
    if (!Object.hasOwn(instructions[state], symbol)) {
      instructions[state][symbol] = {};
    }
    if (selector.classList.contains("write-symbol-selector")) {
      instructions[state][symbol].writeSymbol = selector.value;
    } else if (selector.classList.contains("move-direction-selector")) {
      instructions[state][symbol].moveDirection = selector.value;
    } else if (selector.classList.contains("next-state-selector")) {
      instructions[state][symbol].nextState = selector.value;
    } else {
      console.error("invalid selector", selector);
    }
  }
  return instructions;
}

function writeState(state) {
  statesInput.value = state.states;
  tapeAlphabetSymbolsInput.value = state.tapeAlphabetSymbols;
  blankSymbolInput.value = state.blankSymbol;
  inputSymbolsInput.value = state.inputSymbols;
  initialStateInput.value = state.initialState;
  drawStateGrid();

  const instructions = state.instructions;
  const selectors = document.getElementsByClassName("state-data");
  for (const selector of selectors) {
    const state = selector.dataset.state;
    const symbol = selector.dataset.symbol;
    if (selector.classList.contains("write-symbol-selector")) {
      selector.value = instructions[state][symbol].writeSymbol;
    } else if (selector.classList.contains("move-direction-selector")) {
      selector.value = instructions[state][symbol].moveDirection;
    } else if (selector.classList.contains("next-state-selector")) {
      selector.value = instructions[state][symbol].nextState;
    } else {
      console.error("invalid selector", selector);
    }
  }
}

function drawStateGrid() {
  const stateGrid = document.createElement("div");
  stateGrid.id = "state-grid";
  stateGrid.style = `grid-template-columns: repeat(${statesInput.value.length * 3 + 1}, 1fr);`;

  const headerRow = createHeaderRow();
  const subheaderRow = createSubheaderRow();
  const dataRowsContainer = createDataRowsContainer();

  stateGrid.append(headerRow, subheaderRow, dataRowsContainer);
  document.getElementById("state-wrapper").replaceChildren(stateGrid);
}

function createHeaderRow() {
  const headerRow = document.createElement("div");
  headerRow.id = "header-row";

  const tapeSymbolHeader = document.createElement("div");
  tapeSymbolHeader.id = "tape-symbol-header";
  tapeSymbolHeader.className = "state-subheader";
  tapeSymbolHeader.textContent = "Tape Symbol";

  const headersContainer = document.createElement("div");
  headersContainer.id = "headers-container";
  for (const state of statesInput.value) {
    const stateHeader = document.createElement("div");
    stateHeader.className = "state-header";
    stateHeader.textContent = `State ${state}`;
    headersContainer.append(stateHeader);
  }
  headerRow.append(tapeSymbolHeader, headersContainer);
  return headerRow;
}

function createSubheaderRow() {
  const subheaderRow = document.createElement("div");
  subheaderRow.id = "subheader-row";

  for (let i = 0; i < statesInput.value.length; i++) {
    const writeSymbolSubheader = document.createElement("div");
    writeSymbolSubheader.className = "state-subheader";
    writeSymbolSubheader.textContent = "Write Symbol";
    const moveDirectionSubheader = document.createElement("div");
    moveDirectionSubheader.className = "state-subheader";
    moveDirectionSubheader.textContent = "Move Direction";
    const nextStateSubheader = document.createElement("div");
    nextStateSubheader.className = "state-subheader";
    nextStateSubheader.textContent = "Next State";
    subheaderRow.append(
      writeSymbolSubheader,
      moveDirectionSubheader,
      nextStateSubheader,
    );
  }
  return subheaderRow;
}

function createDataRowsContainer() {
  const dataRowsContainer = document.createElement("div");
  dataRowsContainer.id = "data-rows-container";
  for (const symbol of tapeAlphabetSymbolsInput.value) {
    const stateDataRow = document.createElement("div");
    stateDataRow.className = "state-data-row";

    const rowSubheader = document.createElement("div");
    rowSubheader.className = "state-subheader";
    rowSubheader.textContent = symbol;
    stateDataRow.append(rowSubheader);

    for (const state of statesInput.value) {
      const writeSymbolSelector = document.createElement("select");
      writeSymbolSelector.className = "state-data write-symbol-selector";
      writeSymbolSelector.dataset.symbol = symbol;
      writeSymbolSelector.dataset.state = state;
      for (const symbol of tapeAlphabetSymbolsInput.value) {
        const option = document.createElement("option");
        option.value = symbol;
        option.textContent = symbol;
        writeSymbolSelector.append(option);
      }

      const moveDirectionSelector = document.createElement("select");
      moveDirectionSelector.className = "state-data move-direction-selector";
      moveDirectionSelector.dataset.symbol = symbol;
      moveDirectionSelector.dataset.state = state;
      const leftOption = document.createElement("option");
      leftOption.value = "Left";
      leftOption.textContent = "Left";
      const rightOption = document.createElement("option");
      rightOption.value = "Right";
      rightOption.textContent = "Right";
      moveDirectionSelector.append(leftOption, rightOption);

      const nextStateSelector = document.createElement("select");
      nextStateSelector.className = "state-data next-state-selector";
      nextStateSelector.dataset.symbol = symbol;
      nextStateSelector.dataset.state = state;
      for (const state of statesInput.value) {
        const option = document.createElement("option");
        option.value = state;
        option.textContent = state;
        nextStateSelector.append(option);
      }
      const haltOption = document.createElement("option");
      haltOption.value = "Halt";
      haltOption.textContent = "Halt";
      nextStateSelector.append(haltOption);

      stateDataRow.append(
        writeSymbolSelector,
        moveDirectionSelector,
        nextStateSelector,
      );
    }
    dataRowsContainer.append(stateDataRow);
  }
  return dataRowsContainer;
}

const VISIBLETAPE = 15; // Should be odd so head can be central
const MIDPOINT = Math.floor((VISIBLETAPE + 1) / 2) - 1; // The midpoint when 0-indexed

function drawInitialTuringMachine() {
  const visibleSlice = Array(MIDPOINT)
    .fill(blankSymbolInput.value)
    .concat([...inputSymbolsInput.value])
    .slice(0, VISIBLETAPE);
  visibleSlice.length = VISIBLETAPE;
  visibleSlice.fill(
    blankSymbolInput.value,
    MIDPOINT + inputSymbolsInput.value.length,
  );
  drawTuringMachine(visibleSlice, initialStateInput.value, 0);
}
function drawTuringMachine(visibleSlice, state, position) {
  turingMachineGrid.style = `grid-template-columns: repeat(${VISIBLETAPE}, 1fr);`;
  headDiv.style = `grid-column: ${MIDPOINT + 1};`;
  stateIndicator.textContent = state;
  positionIndicator.textContent = position;
  const frag = document.createDocumentFragment();
  for (const value of visibleSlice) {
    const tapeDiv = document.createElement("div");
    tapeDiv.className = "tape";
    tapeDiv.textContent = value;
    frag.append(tapeDiv);
  }
  tapeContainer.replaceChildren(frag);
}

function startTuringMachine() {
  const instructions = loadInstructions();
  console.log(instructions);
  turingMachine = new TuringMachine(
    instructions,
    initialStateInput.value,
    blankSymbolInput.value,
    [...inputSymbolsInput.value],
  );
}

function validateParameters() {
  const errors = [];

  if (!tapeAlphabetSymbolsInput.value.includes(blankSymbolInput.value)) {
    errors.push("Blank symbol must be included in tape alphabet");
  }

  if (!statesInput.value.includes(initialStateInput.value)) {
    errors.push("Initial state must be one of the defined states");
  }

  for (const symbol of inputSymbolsInput.value) {
    if (!tapeAlphabetSymbolsInput.value.includes(symbol)) {
      errors.push(`Input symbol '${symbol}' is not in tape alphabet`);
    }
  }

  return errors;
}

function showErrors(errors) {
  const frag = document.createDocumentFragment();
  for (const error of errors) {
    const div = document.createElement("div");
    div.className = "error-message";
    div.textContent = error;
    frag.append(div);
  }
  errorDiv.replaceChildren(frag);
}

function stepTuringMachine() {
  if (turingMachine !== null) {
    turingMachine.step();
    const slice = turingMachine.getSlice(-MIDPOINT, VISIBLETAPE - MIDPOINT - 1);
    const state = turingMachine.getState();
    const position = turingMachine.getPosition();
    drawTuringMachine(slice, state, position);
    if (turingMachine.getState() === "Halt") {
      turingMachine = null;
      startButton.textContent = "Start";
    }
  }
}

function cycleTuringMachine() {
  if (turingMachine && turingMachine.getState() !== "Halt") {
    stepTuringMachine();
    if (turingMachine.getState() === "Halt") {
      turingMachine = null;
    } else {
      setTimeout(
        () => {
          cycleTuringMachine();
        },
        8000 / (speedSlider.value + 3),
      );
    }
  }
}

initialiseEventListeners();
drawStateGrid();
drawInitialTuringMachine();

// tada it made the files
//
//
//
//
// incrementing time
//
// whoopsie it's entirely wrong
// lets fix it
// ok maybe it was correct but binary is stored the other way
//
// hurrah we have a binary incrementer
//
// next up is busy beaver with 3 states
//
// 3 state busy beaver from Peterson
//
// yippie wikipedia had one
