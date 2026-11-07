// Smart Calculator Logic
let currentInput = '0';
let previousInput = '';
let currentOperation = null;

const currentDisplay = document.getElementById('current-display');
const prevDisplay = document.getElementById('prev-operation');
const historyList = document.getElementById('history-list');

function updateDisplay() {
  currentDisplay.textContent = currentInput;
  if (currentOperation != null) {
    prevDisplay.textContent = `${previousInput} ${currentOperation}`;
  } else {
    prevDisplay.textContent = '';
  }
}

function appendNumber(number) {
  if (number === '.' && currentInput.includes('.')) return;
  if (currentInput === '0' && number !== '.') {
    currentInput = number;
  } else {
    currentInput += number;
  }
  updateDisplay();
}

function chooseOperation(op) {
  if (currentInput === '') return;
  if (previousInput !== '') {
    compute();
  }
  currentOperation = op;
  previousInput = currentInput;
  currentInput = '';
  updateDisplay();
}

function compute() {
  let computation;
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  if (isNaN(prev) || isNaN(current)) return;

  switch (currentOperation) {
    case '+': computation = prev + current; break;
    case '-': computation = prev - current; break;
    case '*': computation = prev * current; break;
    case '/': computation = current === 0 ? 'Error' : prev / current; break;
    default: return;
  }

  addHistory(`${prev} ${currentOperation} ${current} = ${computation}`);
  console.log("Calculated:", prev, currentOperation, current, "=", computation);
  currentInput = computation.toString();
  currentOperation = null;
  previousInput = '';
  updateDisplay();
}

function addHistory(entry) {
  const empty = historyList.querySelector('.empty-hint');
  if (empty) empty.remove();
  const li = document.createElement('li');
  li.textContent = entry;
  historyList.prepend(li);
}

// Button Click Listeners
document.querySelectorAll('.key.num').forEach(btn => {
  btn.addEventListener('click', () => appendNumber(btn.dataset.num));
});

document.querySelectorAll('.key.op').forEach(btn => {
  btn.addEventListener('click', () => chooseOperation(btn.dataset.op));
});

document.querySelector('[data-action="calculate"]').addEventListener('click', compute);

document.querySelector('[data-action="clear"]').addEventListener('click', () => {
  currentInput = '0';
  previousInput = '';
  currentOperation = null;
  updateDisplay();
});

document.querySelector('[data-action="delete"]').addEventListener('click', () => {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  updateDisplay();
});