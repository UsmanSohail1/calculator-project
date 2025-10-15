const buttons = document.querySelectorAll("button");
const input = document.getElementById("input");
const output = document.getElementById("output");
const operators = ["+", "-", "*", "/", "^"];
const trignometaryOperators = ["sin(", "cos(", "tan("];
const openBracket = document.getElementById("btn-open-bracket");
const closeBracket = document.getElementById("btn-close-bracket");
const errorField = document.getElementById("error-field");

let bracketStack = [];
let openBracketCounter = 0;
let closeBracketCounter = 0;
const historyDiv = document.getElementById("history");
const clearBtn = document.getElementById("clear-history");

let history = [];

const variables = {}; // { name: value }
const maxVars = 10;

const varNameInput = document.getElementById("var-name");
const varValueInput = document.getElementById("var-value");
const varListDiv = document.getElementById("var-list");
const varStatus = document.getElementById("var-status");
const btnAssign = document.getElementById("btn-assign");

const reservedNames = [
  "=",

  "e",
  "π",
  "sin",
  "cos",
  "tan",
  "sqrt",
  "+",
  "-",
  "*",
  "/",
  "^",
  "(",
  ")",
  ".",
  ",",
  "undefined",
  "NaN",
  "Infinity",
  "-Infinity",
];

btnAssign.addEventListener("click", () => {
  const name = varNameInput.value.trim();
  const value = parseFloat(varValueInput.value);

  if (!name || !varValueInput.value) {
    varStatus.textContent = "Fill both name and value";
    return;
  }

  if (name.length > 5) {
    varStatus.textContent = "Name too long (max 5)";
    return;
  }
  if (/^\d+$/.test(name)) {
    varStatus.textContent = "Name cannot be only numbers";
    return;
  }
  if (/^\d/.test(name)) {
    varStatus.textContent = "Name cannot start with a number";
    return;
  }

  if (/\d$/.test(name)) {
    varStatus.textContent = "Name cannot end with a number";
    return;
  }

  if (reservedNames.includes(name)) {
    varStatus.textContent = `Cannot use reserved name "${name}"`;
    return;
  }

  if (Object.keys(variables).length >= maxVars && !variables[name]) {
    varStatus.textContent = `Max ${maxVars} variables allowed`;
    return;
  }

  variables[name] = value;
  varStatus.textContent = `${name} = ${value} saved`;
  varNameInput.value = "";
  varValueInput.value = "";
  updateVarList();
});
function updateVarList() {
  const varListDiv = document.getElementById("var-list");
  varListDiv.innerHTML = "";

  Object.entries(variables).forEach(([name, value]) => {
    if (value !== null && value !== undefined) {
      const container = document.createElement("div");
      container.className = "d-flex mb-1";

      const btn = document.createElement("button");
      btn.textContent = `${name} = ${value}`;
      btn.className = "btn btn-outline-secondary btn-sm flex-fill text-start";
      btn.addEventListener("click", () => {
        input.value += name;
        input.scrollLeft = input.scrollWidth;
        moveCursorToEnd();
      });

      const delBtn = document.createElement("button");
      delBtn.textContent = "✕";
      delBtn.className = "btn btn-danger btn-sm ms-1";
      delBtn.addEventListener("click", () => {
        delete variables[name];
        updateVarList();
      });

      container.appendChild(btn);
      container.appendChild(delBtn);
      varListDiv.appendChild(container);
    }
  });
}

openBracket.addEventListener("click", () => {
  openBracketCounter++;
  bracketStack.push("(");
});

closeBracket.addEventListener("click", () => {});

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.textContent.trim();
    const id = btn.id;
    const lastChar = input.value.slice(-1);
    const lastChar2 = input.value.slice(-2);
    const lastChar3 = input.value.slice(-3);
    const lastChars4 = input.value.slice(-4);
    const lastChar5 = input.value.slice(-5);

    if (id === "btn-assign" || id === "btn-save") {
      return;
    }

    if (value === "AC") {
      input.value = "";
      output.value = "";

      openBracketCounter = 0;
      closeBracketCounter = 0;
      bracketStack = [];
      resetErrorField();
    } else if (value === "DEL") {
      const varNames = Object.keys(variables);
      for (let name of varNames) {
        const len = name.length;
        const lastChars = input.value.slice(-len);
        if (lastChars === name) {
          input.value = input.value.slice(0, -len);
          return;
        }
      }
      if (trignometaryOperators.includes(lastChars4)) {
        input.value = input.value.slice(0, -4);
      } else if (lastChar2 == "√(") {
        input.value = input.value.slice(0, -2);
      } else {
        if (lastChar == "(") {
          openBracketCounter--;
          bracketStack.pop();
        }
        if (lastChar == ")") {
          bracketStack.push("(");
          closeBracketCounter--;
        }
        if (openBracketCounter === closeBracketCounter) {
          resetErrorField();
        }
        input.value = input.value.slice(0, -1);
      }
    } else if (value === "=") {
      if (!input.value) {
        return;
      }

      if (areBracketsBalanced()) {
        let expression = input.value;
        expression = implicitMultiply(expression);

        const result = calculateExpression(expression);

        if (input.value.includes("/")) {
          handleDivisionByZero();
        }

        if (result && result.toString().includes(".")) {
          fixToFourDecimalPlaces(expression, result);
        } else {
          output.value = result;
          addToHistory(expression, result);
        }
        resetErrorField();
        if (result == "Error") {
          errorField.textContent = "Error";
        }
      } else {
        errorField.textContent = `Balance all brackets. '(' = ${openBracketCounter} and '(' = ${closeBracketCounter}`;
      }
    } else if (id === "btn-history") {
      toggleHistory();
      return;
    } else if (id === "clear-history") {
      historyDiv.innerHTML = `<p class="text-muted text-center mb-0">No history yet</p>`;
      return;
    } else {
      if (input.value === "" && operators.includes(value) && value !== "-")
        return;

      if (operators.includes(value) && operators.includes(lastChar)) {
        if (input.value.length === 1 && input.value === "-") {
          return;
        }
        input.value = input.value.slice(0, -1);
        input.value += value;
        return;
      }
      if (operators.includes(value)) {
        if (lastChar === "(" && value !== "-") {
          errorField.textContent = "Cannot put operator right after '('";
          return;
        }
      }

      if (/[+\-*/^]0$/.test(input.value) && value === "0") {
        return;
      }

      if (input.value === "0" && value === "0") {
        return;
      }

      if (input.value === "0" && /\d/.test(value)) {
        input.value = value;
        return;
      }

      if (value === ".") {
        const parts = input.value.split(/[+\-*/^()]/);
        const lastPart = parts[parts.length - 1];

        if (lastPart.includes(".")) {
          errorField.textContent = "Only one decimal allowed per number";
          return;
        }

        if (!/\d/.test(lastChar)) {
          input.value += "0";
        }

        errorField.textContent = "";
      }

      if (value === ")") {
        if (lastChar === "(") {
          errorField.textContent = "Empty brackets not allowed";
          return;
        }

        if (bracketStack.slice(-1) == "(") {
          bracketStack.pop();
          closeBracketCounter++;
        } else {
          return;
        }
      }

      input.value += value;
      input.scrollLeft = input.scrollWidth;

      if (
        id === "btn-sin" ||
        id === "btn-cos" ||
        id === "btn-tan" ||
        id == "btn-sqrt"
      ) {
        input.value += "(";
        openBracketCounter++;
        bracketStack.push("(");
      }
    }
  });
});

input.addEventListener("focus", moveCursorToEnd);
input.addEventListener("click", moveCursorToEnd);
input.addEventListener("keyup", moveCursorToEnd);
input.addEventListener("mouseup", moveCursorToEnd);

input.addEventListener("selectstart", (e) => e.preventDefault());
input.addEventListener("mousedown", (e) => {
  e.preventDefault();
  input.focus();
});

function moveCursorToEnd() {
  const len = input.value.length;
  requestAnimationFrame(() => input.setSelectionRange(len, len));
}

input.addEventListener("keydown", (e) => {
  const allowedKeys = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "-",
    "*",
    "/",
    "^",
    ".",
    "(",
    ")",
    "t",
    "c",
    "s",
    "Backspace",
    "Enter",
    "Shift",
  ];
  if (e.key === "Enter") {
    e.preventDefault();
    input.focus();
    moveCursorToEnd();
    document.getElementById("btn-equal").click();
  }
  if (e.key === "Backspace") {
    const lastChar = input.value.slice(-1);
    const lastChars2 = input.value.slice(-2);
    const lastChars4 = input.value.slice(-4);

    if (trignometaryOperators.includes(lastChars4)) {
      input.value = input.value.slice(0, -4);
      return;
    }

    if (lastChars2 === "√(") {
      input.value = input.value.slice(0, -2);
      return;
    }

    const varNames = Object.keys(variables);
    for (let name of varNames) {
      const len = name.length;
      const lastChars = input.value.slice(-len);
      if (lastChars === name) {
        input.value = input.value.slice(0, -(len - 1));
        return;
      }
    }

    if (lastChar === "(") {
      openBracketCounter--;
      bracketStack.pop();
    }

    if (lastChar === ")") {
      bracketStack.push("(");
      closeBracketCounter--;
    }
  }

  if (!allowedKeys.includes(e.key)) {
    e.preventDefault();
    errorField.textContent = "Invalid key pressed";
    return;
  }
  if (e.key === "t") {
    e.preventDefault();
    input.value += "tan(";
    bracketStack.push("(");
    openBracketCounter++;
    return;
  }

  if (e.key === "c") {
    e.preventDefault();
    input.value += "cos(";
    bracketStack.push("(");
    openBracketCounter++;
    return;
  }

  if (e.key === "s") {
    e.preventDefault();
    input.value += "sin(";
    bracketStack.push("(");
    openBracketCounter++;
    return;
  }

  const lastChar = input.value.slice(-1);
  if (/[+\-*/^]/.test(lastChar) && /[+\-*/^]/.test(e.key)) {
    e.preventDefault();
    errorField.textContent = "Cannot enter two operators in a row";
    return;
  }
  if (e.key === "(") {
    bracketStack.push("(");
    openBracketCounter++;
    return;
  }

  if (e.key === ")") {
    const value = input.value;
    if (!bracketStack.includes("(") || value.slice(-1) === "(") {
      if (value.slice(-1) === "(") {
        errorField.textContent = "Empty brackets not allowed";
      }
      e.preventDefault();
      return;
    }

    bracketStack.pop();
    closeBracketCounter++;
  }

  if (e.key === ".") {
    const parts = input.value.split(/[+\-*/^()]/);
    const lastPart = parts[parts.length - 1];

    if (lastPart.includes(".")) {
      e.preventDefault();
      errorField.textContent = "Only one decimal allowed per number";
      return;
    }
    const lastChar = input.value.slice(-1);
    if (!/\d/.test(lastChar)) {
      e.preventDefault();
      input.value += "0.";
      return;
    }
  }

  const current = input.value + e.key;

  resetErrorField();
});
function calculateExpression(expression) {
  try {
    for (const [name, value] of Object.entries(variables)) {
      if (value !== null && value !== undefined) {
        const regex = new RegExp(`\\b${name}\\b`, "g");
        expression = expression.replace(regex, value);
      }
    }

    expression = expression
      .replace(/π/g, Math.PI)
      .replace(/\be\b/g, Math.E)
      .replace(/√/g, "Math.sqrt")
      .replace(/\^/g, "**")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan");

    return Function(`"use strict"; return (${expression})`)();
  } catch {
    return "Error";
  }
}

function addToHistory(expression, result) {
  history.push({ input: expression, output: result });
  if (history.length > 10) {
    history.shift();
  }
  updateHistoryUI();
}
function updateHistoryUI() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = [...history]
    .reverse()
    .map(
      (h, index) => `
        <button class="btn btn-outline-secondary btn-sm w-100 text-start mb-1" data-index="${
          history.length - 1 - index
        }">
          <span class="fw-bold"> ${index + 1})</span>
          <span class="fw-semibold">${h.input}</span>
          <br />
          <small class="text-muted">= ${h.output}</small>
        </button>
      `
    )
    .join("");
  const buttons = historyDiv.querySelectorAll("button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.getAttribute("data-index");
      input.value = history[index].input;
      output.value = history[index].output;
      resetErrorField();
    });
  });
}

function toggleHistory() {
  const historyDiv = document.getElementById("history");
  if (historyDiv.classList.contains("d-none")) {
    historyDiv.classList.remove("d-none");
  } else {
    historyDiv.classList.add("d-none");
  }
}
function resetErrorField() {
  if (
    output.value != "Error" &&
    output.value != "NaN" &&
    output.value != "Infinity" &&
    output.value != "-Infinity" &&
    output.value != "undefined"
  ) {
    errorField.textContent = "";
  } else {
    output.value = "";
    errorField.textContent = "Error";
  }
}

// const variables = { a: null, b: null, c: null };
// let selectedVar = null;
// let assigning = false;

// const varStatus = document.getElementById("var-status");
// const inputField = document.getElementById("input");
// const varInput = document.getElementById("var-input");

// document
//   .getElementById("var-a")
//   .addEventListener("click", () => selectVariable("a"));
// document
//   .getElementById("var-b")
//   .addEventListener("click", () => selectVariable("b"));
// document
//   .getElementById("var-c")
//   .addEventListener("click", () => selectVariable("c"));

// document
//   .getElementById("btn-assign")
//   .addEventListener("click", () => startAssign());
// document
//   .getElementById("btn-save")
//   .addEventListener("click", () => saveVariable());

// function selectVariable(v) {
//   selectedVar = v;
//   varStatus.textContent = `Selected variable: ${v}`;
// }

// function startAssign() {
//   if (!selectedVar) {
//     varStatus.textContent = "Select a variable first 🙄";
//     return;
//   }
//   assigning = true;
//   // inputField.value = inputField.value.slice(0,-1);
//   varStatus.textContent = `Assigning value to ${selectedVar} 😁`;
// }

// function saveVariable() {
//   if (!assigning || !selectedVar) {
//     varStatus.textContent = "Press Assign first 🤦‍♂️";
//     return;
//   }
//   const val = parseFloat(varInput.value);
//   if (isNaN(val)) {
//     varStatus.textContent = "Enter a valid number 🤨";
//     return;
//   }

//   variables[selectedVar] = val;
//   varStatus.textContent = `${selectedVar} = ${val} saved 🥳`;
//   assigning = false;
//   varInput.value = "";
// }
function areBracketsBalanced() {
  if (bracketStack.length < 1) {
    return true;
  } else {
    return false;
  }
}
function implicitMultiply(expression) {
  const varNames = Object.keys(variables).sort((a, b) => b.length - a.length);
  const constants = ["π", "e"];
  const functions = ["sin", "cos", "tan", "sqrt"];
  const nonFuncSymbols = [...varNames, ...constants].join("|");

  let prev;
  do {
    prev = expression;

    expression = expression.replace(
      new RegExp(`(\\d)(${nonFuncSymbols})`, "g"),
      "$1*$2"
    );
    expression = expression.replace(
      new RegExp(`(${nonFuncSymbols})(\\d)`, "g"),
      "$1*$2"
    );
    expression = expression.replace(
      new RegExp(`(${nonFuncSymbols})(${nonFuncSymbols})`, "g"),
      "$1*$2"
    );
    expression = expression.replace(
      new RegExp(`(${nonFuncSymbols})\\(`, "g"),
      "$1*("
    );
    expression = expression.replace(
      new RegExp(`\\)(${nonFuncSymbols})`, "g"),
      ")*$1"
    );
    expression = expression.replace(/(\d)\(/g, "$1*(");
    expression = expression.replace(/\)(\d)/g, ")*$1");
    expression = expression.replace(/\)\(/g, ")*(");
  } while (prev !== expression);

  return expression;
}

function handleDivisionByZero() {
  const parts = input.value.split(/\//);
  if (parts[1] == "0") {
    errorField.textContent = "Cannot divide by 0";
  }
}
function fixToFourDecimalPlaces(expression, result) {
  const parts = result.toString().split(/\./);
  const lastPart = parts[1].slice(0, 4);
  output.value = `${parts[0]}.${lastPart}`;
  addToHistory(expression, output.value);
}
