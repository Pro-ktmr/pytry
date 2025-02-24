import * as editor from './editor.js';
import * as errorTranslator from './error-translator.js';
import * as logger from './logger.js';

let worker, isReady, runButtonId, runCompletedWindowId, runTimeoutWindowId;

/**
 * Python 実行環境の初期化を行う
 * @param {string} _runButtonId 実行ボタンの id
 * @param {string} _runCompletedWindowId 実行完了時に表示するオブジェクトの id
 * @param {string} _runTimeoutWindowId 実行継続時に表示するオブジェクトの id
 */
export function initialize(_runButtonId, _runCompletedWindowId, _runTimeoutWindowId) {
  runButtonId = _runButtonId;
  runCompletedWindowId = _runCompletedWindowId;
  runTimeoutWindowId = _runTimeoutWindowId;
  initializeWorker();
}

function initializeWorker() {
  disableReady();
  console.debug("start runner-worker");
  worker = new Worker('./script/runner-worker.js');
  console.debug("addEventListener runner-worker");
  worker.addEventListener('message', workerListenner);
}

function disableReady() {
  isReady = false;
  document.getElementById(runButtonId).innerHTML = '<div class="loader-inner ball-pulse"><div></div><div></div><div></div></div>';
  document.getElementById(runButtonId).classList.remove('pushable');
}

function enableReady() {
  isReady = true;
  document.getElementById(runButtonId).innerHTML = '実行';
  document.getElementById(runButtonId).classList.add('pushable');
}

function showRunCompletedWindow() {
  const elem = document.getElementById(runCompletedWindowId);
  elem.classList.remove('fade-up');
  window.requestAnimationFrame((time) => {
    window.requestAnimationFrame((time) => {
      elem.classList.add('fade-up');
    });
  });
  elem.addEventListener('animationend', () => {
    elem.classList.remove('fade-up');
  });
}

function showRunTimeoutWindow() {
  const elem = document.getElementById(runTimeoutWindowId);
  elem.classList.remove('fade-up-slow');
  window.requestAnimationFrame((time) => {
    window.requestAnimationFrame((time) => {
      elem.classList.add('fade-up-slow');
    });
  });
  elem.onclick = () => {
    timeout();
  };
}

/**
 * ソースを実行する
 */
export async function run() {
  if (!isReady) return;

  disableReady();

  editor.clearSourceEditorMarker('Error');
  editor.clearSourceEditorDecoration();
  editor.clearOutputEditor();

  showRunTimeoutWindow();

  worker.postMessage({
    source: editor.sourceEditor.getValue(),
    stdin: editor.inputEditor.getValue().replaceAll('\r', '')
  });

  logger.log('run', {});
}

function workerListenner(message) {
  const kind = message.data.kind;
  const content = message.data.content;

  if (kind == 'initialized') {
    enableReady();
  }

  if (kind == 'done') {
    enableReady();
    showRunCompletedWindow();

    const elem = document.getElementById(runTimeoutWindowId);
    window.requestAnimationFrame((time) => {
      window.requestAnimationFrame((time) => {
        window.requestAnimationFrame((time) => {
          elem.classList.remove('fade-up-slow');
        });
      });
    });

    logger.log('run_done', {
      source: editor.sourceEditor.getValue(),
      input: editor.inputEditor.getValue(),
      output: editor.outputEditor.getValue(),
    });
  }

  if (kind == 'stdout') {
    editor.addToOutputEditor(content);
  }

  if (kind == 'error') {
    const translated = errorTranslator.translate(content);
    editor.addToOutputEditor(translated);

    let err = [...translated.matchAll(/プログラムの (\d*) 行目/g)];
    if (err != null && err.length != 0) {
      let lineNumber = Number(err[err.length - 1][1]);
      editor.addSourceEditorMarker(lineNumber, translated, 'Error');
      editor.addSourceEditorDecoration(lineNumber, 'glyphMarginError');

      logger.log('runtime_error', {
        three_lines: logger.getThreeLines(lineNumber),
        line_number: lineNumber,
        error: content,
        translated: translated,
        translate_success: errorTranslator.lastTranslationSuccess,
      });
    }
  }

  if (kind == 'internalError') {
    editor.addToOutputEditor(content);

    enableReady();

    const elem = document.getElementById(runTimeoutWindowId);
    window.requestAnimationFrame((time) => {
      window.requestAnimationFrame((time) => {
        window.requestAnimationFrame((time) => {
          elem.classList.remove('fade-up-slow');
        });
      });
    });

    logger.log('run_ie', {
      source: editor.sourceEditor.getValue(),
      input: editor.inputEditor.getValue(),
      output: editor.outputEditor.getValue(),
    });
  }

  if (kind == "debug") {
    console.debug(content);
  }
}

function timeout() {
  worker.terminate();
  initializeWorker();

  editor.addToOutputEditor(`
実行を強制終了しました
処理がなかなか終わらない主な原因は次の通りです：
1. 無限ループが発生している (while 文の条件式などが間違っていないか確認しましょう)
2. 解法の効率が悪い (時間計算量を見積もりましょう)
`);

  const elem = document.getElementById(runTimeoutWindowId);
  window.requestAnimationFrame((time) => {
    window.requestAnimationFrame((time) => {
      window.requestAnimationFrame((time) => {
        elem.classList.remove('fade-up-slow');
      });
    });
  });

  logger.log('run_timeout', {
    source: editor.sourceEditor.getValue(),
    input: editor.inputEditor.getValue(),
    output: editor.outputEditor.getValue(),
  });
}
