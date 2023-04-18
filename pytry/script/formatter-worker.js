importScripts('../modules/pyodide/pyodide.js');

const pyodideReadyPromise = initialize();

async function initialize() {
  const pyodide = await loadPyodide({
    indexURL: new URL('../modules/pyodide', location.href).toString(),
  });

  await pyodide.loadPackage('micropip');
  pyodide.runPython(await (await fetch('./py/formatter-initialize.py')).text());
  await pyodide.runPythonAsync('install_black()');
  pyodide.runPython('import black');

  return pyodide;
}

async function format(source) {
  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set('__code_to_format', source);
    const res = await pyodide.runPython(`format_code()`);
    self.postMessage(res);
  } catch (e) {
    console.log(e);
    self.postMessage(source);
  }
}

self.addEventListener('message', (message) => {
  format(message.data);
});
