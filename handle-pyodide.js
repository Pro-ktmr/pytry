let worker, ready;

function initializeWorker() {
  worker = new Worker('worker-pyodide.js');
  disableReady();
  worker.addEventListener('message', workerListenner);
}
window.addEventListener('load', (event) => {
  initializeWorker();
});

function disableReady() {
  ready = false;
  document.getElementById('run-button').innerHTML = '';
  document.getElementById('run-button').classList.remove('pushable');
}
function enableReady() {
  ready = true;
  document.getElementById('run-button').innerHTML = '実行';
  document.getElementById('run-button').classList.add('pushable');
}

let timer;

function run() {
  if (ready) {
    outputEditor.setValue('');
    disableReady();
    timer = setTimeout(cancelRunning, 10000);
    worker.postMessage([editor.getValue(), inputEditor.getValue()]);
  }
}

function workerListenner(msg) {
  enableReady();
  if (msg.data == 'ready') return;

  clearTimeout(timer);
  let formatedOutput = msg.data[0];
  let output = msg.data[1];
  outputEditor.setValue(formatedOutput);
  outputEditor.revealLine(0);

  sendSubmission(editor.getValue(), inputEditor.getValue(), outputEditor.getValue());

  let err = [...formatedOutput.matchAll(/プログラムの (\d*) 行目/g)];
  if (err != null && err.length != 0) {
    let l = Number(err[err.length - 1][1]);
    editor.markers = [{
      startLineNumber: l,
      startColumn: 1,
      endLineNumber: l,
      endColumn: 1000,
      message: formatedOutput,
      severity: monaco.MarkerSeverity.Error,
    }];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
    outputEditor.setValue(
      formatedOutput
      + '\n=== エラー原文 ===\n'
      + output
      + '==================\n');
  }
  else {
    editor.markers = [];
    monaco.editor.setModelMarkers(editor.getModel(), 'message', editor.markers);
  }
}

function cancelRunning() {
  outputEditor.setValue('実行から 10 秒が経過したため処理を打ち切りました\n次に実行できるようになるまで数秒かかります');
  worker.terminate();
  initializeWorker();
}

function sendSubmission(source, input, output) {
  const param = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      time: getTime(),
      source: JSON.stringify(source.substr(0, 5000)),
      input: JSON.stringify(input.substr(0, 5000)),
      output: JSON.stringify(output.substr(0, 5000)),
    })
  };
  fetch('https://ktmr.vsw.jp/pytry/run.php', param)
    .then(response => response.json())
    .then(json => {
      if (!json.status) {
        console.log(`${json.result}`);
      }
    })
    .catch(error => {
      console.log(`${error}`);
    });
}

function getTime() {
  var date = new Date();
  var y = date.getFullYear();
  var mo = ('00' + (date.getMonth() + 1)).slice(-2);
  var d = ('00' + date.getDate()).slice(-2);
  var h = ('00' + date.getHours()).slice(-2);
  var mi = ('00' + date.getMinutes()).slice(-2);
  var s = ('00' + date.getSeconds()).slice(-2);
  var ms = ('000' + date.getMilliseconds()).slice(-3);
  return y + '-' + mo + '-' + d + '_' + h + '-' + mi + '-' + s + '-' + ms;
}