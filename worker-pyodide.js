importScripts('./pyodide/pyodide.js');

let initializaionCompleted = false;

async function load() {
  const pyodide = await loadPyodide({
    indexURL: location.href.slice(0, location.href.length - '/worker-pyodide.js'.length) + '/pyodide',
  });

  await pyodide.loadPackage('numpy');
  await pyodide.loadPackage('micropip');

  pyodide.runPython(`
import js, sys, traceback
from pyodide.console import PyodideConsole


def reformat_exception():
    return "".join(
        traceback.format_exception(sys.last_type, sys.last_value, sys.last_traceback)
    )


async def exec_code():
    pyconsole = PyodideConsole(
        filename="<console>", globals={"__code_to_run": __code_to_run}
    )
    pyconsole.stdin_callback = js.stdin_callback
    pyconsole.stdout_callback = js.stdout_callback
    pyconsole.stderr_callback = js.stdout_callback
    await pyconsole.push("exec(__code_to_run, {})")
`);

  self.postMessage({
    kind: 'ready',
    content: '',
  });

  initializaionCompleted = true;

  return pyodide;
}
const pyodideReadyPromise = load();

let stdin_lines = [];
function stdin_callback() {
  return stdin_lines.shift();
}

function stdout_callback(message) {
  if (!initializaionCompleted) return;

  self.postMessage({
    kind: 'stdout',
    content: message,
  });
}

function python_error(message) {
  message = message.replaceAll(
    /Traceback \(most recent call last\):\n[\s\S]*  File "<string>", line (\d*).*\n/g,
    `Traceback (most recent call last):
  File "Main.py", line $1
`);

  self.postMessage({
    kind: 'error',
    content: message,
  });
}

async function run(source, input) {
  stdin_lines = input.split('\n');

  const pyodide = await pyodideReadyPromise;
  try {
    pyodide.globals.set('__code_to_run', source);
    await pyodide.runPython(`exec_code()`);
  } catch (e) {
    if (e instanceof pyodide.PythonError) {
      const reformat_exception = pyodide.globals.get('reformat_exception');
      python_error(reformat_exception());
    }
    else {
      console.log(e);
      self.postMessage({
        kind: 'internal_error',
        content: 'PyTry 内部でエラーが発生しました',
      });
    }
  }

  self.postMessage({
    kind: 'done',
    content: '',
  });
}

self.addEventListener('message', (msg) => {
  run(msg.data[0], msg.data[1]);
});
