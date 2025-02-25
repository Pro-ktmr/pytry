importScripts("https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js");

let initializaionCompleted = false;
let stdin_lines = [];
const pyodideReadyPromise = initialize();

async function initialize() {
  let pyodide;
  while (true) {
    try {
      debugLog("start loading pyodide on runner");
      pyodide = await loadPyodide({
        indexURL: new URL(
          "https://cdn.jsdelivr.net/pyodide/v0.21.0/full",
          location.href,
        ).toString(),
      });
      break;
    } catch (e) {
      debugLog(e.name + ": " + e.message + " (on runner)");
    }
  }

  debugLog("start installing micropip on runner");
  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync("import os; os.environ['MPLBACKEND'] = 'agg'");
  await pyodide.loadPackage("matplotlib"); // Python plotting package
  pyodide.runPython(await (await fetch("./py/runner-initialize.py")).text());

  debugLog("start loading packages on runner");

  pyodide.loadPackage("numpy"); // Fundamental package for array computing in Python
  pyodide.loadPackage("scipy"); // Fundamental algorithms for scientific computing in Python
  pyodide.loadPackage("networkx"); // Python package for creating and manipulating graphs and networks
  pyodide.loadPackage("sympy"); // Computer algebra system (CAS) in Python
  pyodide.loadPackage("more-itertools"); // More routines for operating on iterables, beyond itertools
  pyodide.loadPackage("shapely"); // Manipulation and analysis of geometric objects
  pyodide.loadPackage("bitarray"); // efficient arrays of booleans -- C extension
  pyodide.loadPackage("mpmath"); // Python library for arbitrary-precision floating-point arithmetic
  pyodide.loadPackage("pandas"); // Powerful data structures for data analysis, time series, and statistics
  pyodide.loadPackage("scikit-learn"); // A set of python modules for machine learning and data mining

  self.postMessage({
    kind: "initialized",
    content: "",
  });

  initializaionCompleted = true;

  debugLog("initializing done on runner");

  return pyodide;
}

async function run(source, stdin) {
  stdin_lines = stdin.split("\n");

  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set("__code_to_run", source);
    await pyodide.runPython(`exec_code()`);
  } catch (e) {
    if (e instanceof pyodide.PythonError) {
      const reformat_exception = pyodide.globals.get("reformat_exception");
      python_error(reformat_exception());
    } else {
      console.log(e);
      self.postMessage({
        kind: "internalError",
        content: "PyTry 内部でエラーが発生しました",
      });
    }
  }

  self.postMessage({
    kind: "done",
    content: "",
  });
}

function stdin_callback() {
  return stdin_lines.shift();
}

function stdout_callback(message) {
  if (!initializaionCompleted) return; // 初期化時の出力内容を無視

  self.postMessage({
    kind: "stdout",
    content: message,
  });
}

function image_callback(image) {
  self.postMessage({
    kind: "image",
    content: image,
  });
}

function python_error(message) {
  message = message.replaceAll(
    /Traceback \(most recent call last\):\n[\s\S]*  File "<string>", line (\d*).*\n/g,
    `Traceback (most recent call last):
  File "Main.py", line $1
`,
  );

  self.postMessage({
    kind: "error",
    content: message,
  });
}

self.addEventListener("message", (message) => {
  run(message.data.source, message.data.stdin);
});

function debugLog(message) {
  self.postMessage({ kind: "debug", content: message });
}
