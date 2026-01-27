import * as editor from "./editor.js";
import * as errorTranslator from "./error-translator.js";
import * as logger from "./logger.js";
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.mjs";

let pyodideReadyPromise, isReady, runButtonId, runTimeoutWindowId;
const interactiveConsole = document.getElementById("interactive-console");

/**
 * Python 実行環境の初期化を行う
 * @param {string} _runButtonId 実行ボタンの id
 * @param {string} _runTimeoutWindowId 実行継続時に表示するオブジェクトの id
 */
export function initialize(_runButtonId, _runTimeoutWindowId) {
  runButtonId = _runButtonId;
  runTimeoutWindowId = _runTimeoutWindowId;
  pyodideReadyPromise = initializeInteractiveMode();
  disableReady();
}

function disableReady() {
  isReady = false;
  document.getElementById(runButtonId).innerHTML =
    '<div class="loader-inner ball-pulse"><div></div><div></div><div></div></div>';
  document.getElementById(runButtonId).classList.remove("pushable");
}

function enableReady() {
  isReady = true;
  document.getElementById(runButtonId).innerHTML = "実行";
  document.getElementById(runButtonId).classList.add("pushable");
}

function showRunTimeoutWindow() {
  const elem = document.getElementById(runTimeoutWindowId);
  elem.classList.remove("fade-up-slow");
  window.requestAnimationFrame((time) => {
    window.requestAnimationFrame((time) => {
      elem.classList.add("fade-up-slow");
    });
  });
  elem.onclick = () => {
    timeout();
  };
}

function removeRunTimeoutWindow() {
  const elem = document.getElementById(runTimeoutWindowId);
  window.requestAnimationFrame((time) => {
    window.requestAnimationFrame((time) => {
      window.requestAnimationFrame((time) => {
        elem.classList.remove("fade-up-slow");
      });
    });
  });
}

/**
 * ソースを実行する
 */
export async function run() {
  if (!isReady) return;

  disableReady();

  editor.clearSourceEditorMarker("Error");
  editor.clearSourceEditorDecoration();

  interactiveConsole.innerHTML = "";

  showRunTimeoutWindow();

  runInInteractiveMode(editor.sourceEditor.getValue());

  logger.log("run", {});
}

function timeout() {
  location.reload();
}

// Interactive mode

let initializaionCompleted = false;
let stdin_lines = [];

async function initializeInteractiveMode() {
  let pyodide;
  while (true) {
    try {
      console.log("start loading pyodide in interactive mode");
      pyodide = await loadPyodide({
        indexURL: new URL(
          "https://cdn.jsdelivr.net/pyodide/v0.21.0/full",
          location.href,
        ).toString(),
      });
      break;
    } catch (e) {
      console.log(e.name + ": " + e.message + " (in interactive mode)");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("start installing micropip in interactive mode");
  await pyodide.loadPackage("micropip");
  await pyodide.runPythonAsync("import os; os.environ['MPLBACKEND'] = 'agg'");
  await pyodide.loadPackage("matplotlib"); // Python plotting package
  await pyodide.runPythonAsync(`
import micropip
await micropip.install("seaborn")
import seaborn
`); // Statistical data visualization
  await pyodide.runPythonAsync(`
await micropip.install("matplotlib-fontja")
import matplotlib_fontja
`); // matplotlibを日本語表示に対応させます。
  pyodide.runPython(
    await (await fetch("./script/py/runner-initialize.py")).text(),
  );

  console.log("start loading packages in interactive mode");

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

  initializaionCompleted = true;

  console.log("initializing done in interactive mode");

  enableReady();

  return pyodide;
}

async function runInInteractiveMode(source) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set("__code_to_run", source);
    globalThis.stdin_callback = stdin_callback;
    globalThis.stdout_callback = stdout_callback;
    globalThis.image_callback = image_callback;
    await pyodide.runPython(`exec_code()`);
  } catch (e) {
    if (e instanceof pyodide.PythonError) {
      const reformat_exception = pyodide.globals.get("reformat_exception");
      python_error(reformat_exception());
    } else {
      console.log(e);
      interactiveConsole.innerHTML += "\nPyTry 内部でエラーが発生しました\n";
    }
  }

  logger.log("run_done", {
    source: editor.sourceEditor.getValue(),
    input: "",
    output: interactiveConsole.innerHTML,
  });

  enableReady();
  removeRunTimeoutWindow();
}

function stdin_callback() {
  const interactiveConsole = document.getElementById("interactive-console");
  const line = prompt(interactiveConsole.innerHTML);
  interactiveConsole.innerHTML += line + "\n";
  return line + "\n";
}

function stdout_callback(message) {
  if (!initializaionCompleted) return; // 初期化時の出力内容を無視

  const interactiveConsole = document.getElementById("interactive-console");
  interactiveConsole.innerHTML += message;

  if (message.endsWith("\n")) {
    alert(interactiveConsole.innerHTML);
  }
}

function image_callback(image) {
  const interactiveConsole = document.getElementById("interactive-console");
  interactiveConsole.innerHTML += image;
}

function python_error(content) {
  content = content.replaceAll(
    /Traceback \(most recent call last\):\n[\s\S]*  File "<string>", line (\d*).*\n/g,
    `Traceback (most recent call last):
  File "Main.py", line $1
`,
  );

  const translated = errorTranslator.translate(content);

  let err = [...translated.matchAll(/プログラムの (\d*) 行目/g)];
  if (err != null && err.length != 0) {
    let lineNumber = Number(err[err.length - 1][1]);
    editor.addSourceEditorMarker(lineNumber, translated, "Error");
    editor.addSourceEditorDecoration(lineNumber, "glyphMarginError");

    logger.log("runtime_error", {
      three_lines: logger.getThreeLines(lineNumber),
      line_number: lineNumber,
      error: content,
      translated: translated,
      translate_success: errorTranslator.lastTranslationSuccess,
    });
  }

  const interactiveConsole = document.getElementById("interactive-console");
  interactiveConsole.innerHTML += translated;
}

// function enterStdinLine(line) {
//   stdin_lines.push(line);
// }
