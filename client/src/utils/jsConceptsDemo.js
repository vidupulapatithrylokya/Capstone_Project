// client/src/utils/jsConceptsDemo.js

/**
 * 1. JavaScript Closures Demonstration:
 * API Request Factory & Debounce utility
 */
export const createDebouncer = (fn, delay = 300) => {
  let timerId = null; // Enclosed private variable maintained in closure scope
  return (...args) => {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

/**
 * 2. JavaScript Event Loop Demonstration:
 * Call stack vs Microtasks (Promises) vs Macrotasks (setTimeout)
 */
export const demonstrateEventLoop = async () => {
  const executionOrder = [];
  executionOrder.push("1. Synchronous Code (Call Stack)");

  setTimeout(() => {
    executionOrder.push("4. Macrotask (setTimeout Callback)");
  }, 0);

  Promise.resolve().then(() => {
    executionOrder.push("3. Microtask (Promise .then)");
  });

  executionOrder.push("2. End of Synchronous Stack");

  await new Promise((resolve) => setTimeout(resolve, 50));
  return executionOrder;
};

/**
 * 3. JavaScript Hoisting Demonstration:
 * Var hoisting vs Function declaration vs let/const Temporal Dead Zone (TDZ)
 */
export const explainHoistingRules = () => {
  // Function Declarations are hoisted completely
  const hoistedFnResult = hoistedFunction();

  function hoistedFunction() {
    return "Function declarations are hoisted to top of scope.";
  }

  return {
    functionHoisting: hoistedFnResult,
    varHoisting: "var declarations are hoisted with initial value of 'undefined'.",
    letConstTDZ: "let/const declarations remain uninitialized in Temporal Dead Zone until execution reaches them.",
  };
};

/**
 * 4. Promises vs Callbacks vs Async/Await Demonstration
 */
export const fetchDataWithCallback = (id, callback) => {
  setTimeout(() => {
    if (!id) callback(new Error("ID required"), null);
    else callback(null, { id, title: "Callback Fetched Course" });
  }, 100);
};

export const fetchDataWithPromise = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!id) reject(new Error("ID required"));
      else resolve({ id, title: "Promise Fetched Course" });
    }, 100);
  });
};

export const fetchDataWithAsyncAwait = async (id) => {
  const data = await fetchDataWithPromise(id);
  return { ...data, method: "Async/Await" };
};
