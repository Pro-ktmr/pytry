importScripts('https://cdn.jsdelivr.net/pyodide/v0.21.0/full/pyodide.js');

const pyodideReadyPromise = initialize();

async function initialize() {
  let pyodide;
  while (true) {
    try {
      debugLog("start loading pyodide on formatter");
      pyodide = await loadPyodide({
        indexURL: new URL('https://cdn.jsdelivr.net/pyodide/v0.21.0/full', location.href).toString(),
      });
      break;
    }
    catch (e) {
      debugLog(e.name + ": " + e.message + " (on formatter)");
    }
  }

  debugLog("start installing micropip on formatter");
  await pyodide.loadPackage('micropip');
  pyodide.runPython(await (await fetch('./py/formatter-initialize.py')).text());
  debugLog("start installing black on formatter");
  await pyodide.runPythonAsync('install_black()');
  pyodide.runPython('import black');
  debugLog("initializing done on formatter");

  return pyodide;
}

async function format(source) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set('__code_to_format', source);
    const res = await pyodide.runPython(`format_code()`);
    self.postMessage({ kind: "result", content: res });
  } catch (e) {
    console.log(e);
    self.postMessage(source);
  }
}

self.addEventListener('message', (message) => {
  format(message.data);
});

function debugLog(message) {
  self.postMessage({ kind: "debug", content: message });
}
