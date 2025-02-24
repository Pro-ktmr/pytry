import * as editor from './editor.js';
import * as errorTranslator from './error-translator.js';
import * as logger from './logger.js';

let worker, timer = null, currentShownError = '';

/**
 * コンパイラの初期化を行う
 */
export function initialize() {
  editor.sourceChangeListenner.push(onDidChangeContent);
  worker = new Worker('./script/compiler-worker.js');
  worker.addEventListener('message', workerListenner);

  timer = setTimeout(timerHandler, 3000);
}

function onDidChangeContent() {
  startCompilation(false);

  if (timer) clearTimeout(timer);
  timer = setTimeout(timerHandler, 200);
}

function timerHandler() {
  startCompilation(true);
  timer = setTimeout(timerHandler, 200);
}

function startCompilation(doesDetectNewError) {
  worker.postMessage({
    source: editor.sourceEditor.getValue(),
    mode: doesDetectNewError,
  });
}

function workerListenner(message) {
  const error = message.data.error;
  const doesDetectNewError = message.data.mode;

  if (!doesDetectNewError) {
    if (error == '' || error != currentShownError) {
      editor.clearSourceEditorMarker('Warning');
      currentShownError = '';
    }
    return;
  }

  if (error == currentShownError) return;

  const translated = errorTranslator.translate(error);
  const err = [...translated.matchAll(/プログラムの (\d*) 行目/g)];
  if (err === null || err.length == 0) return;

  const lineNumber = Number(err[err.length - 1][1]);
  if (lineNumber == logger.getCurrentLineNumber()) return;

  editor.addSourceEditorMarker(lineNumber, translated, 'Warning');
  currentShownError = error;

  logger.log('compile_error', {
    three_lines: logger.getThreeLines(lineNumber),
    line_number: lineNumber,
    error: error,
    translated: translated,
    translate_success: errorTranslator.lastTranslationSuccess,
  });
}
