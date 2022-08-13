importScripts('./pyodide/pyodide.js');

let initializaionCompleted = false;

async function load() {
  const pyodide = await loadPyodide({
    indexURL: location.href.slice(0, location.href.length - '/worker-pyodide.js'.length) + '/pyodide',
    stdin: stdin_callback,
    stdout: stdout_callback,
    stderr: stdout_callback,
  });

  await pyodide.loadPackage('numpy');
  await pyodide.loadPackage('micropip');

  pyodide.runPython(`
import sys, traceback
def reformat_exception():
    return ''.join(
        traceback.format_exception(sys.last_type, sys.last_value, sys.last_traceback)
    )
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
  if (message == '<eof>') return;

  if (message.length > 5 && message.slice(message.length - 5) == '<eof>') {
    self.postMessage({
      kind: 'stdout',
      content: message.slice(0, message.length - 5),
    });
  }
  else {
    self.postMessage({
      kind: 'stdout',
      content: message + '\n',
    });
  }
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
    await pyodide.runPython(`exec(__code_to_run, {})`);
    await pyodide.runPython(`print('<eof>')`);
    await pyodide.runPython(`print('<eof>', file=sys.stderr)`);
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
