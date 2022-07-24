var editor, session, inputEditor, inputSession, outputEditor, outputSession;

window.addEventListener('load', (event) => {
  require.config({
    paths: {
      'vs': './monaco-editor/min/vs'
    },
    'vs/nls': {
      availableLanguages: { '*': 'ja' }
    }
  });

  source_text = 'a = int(input())\nb = int(input())\nprint(a + b)\n';
  input_text = '7\n5\n';
  output_text = '';
  if (localStorage.getItem('source_text') != null) {
    source_text = decodeURIComponent(localStorage.getItem('source_text'));
  }
  if (localStorage.getItem('input_text') != null) {
    input_text = decodeURIComponent(localStorage.getItem('input_text'));
  }
  if (localStorage.getItem('output_text') != null) {
    output_text = decodeURIComponent(localStorage.getItem('output_text'));
  }

  require(['vs/editor/editor.main'], function () {
    session = monaco.editor.createModel(source_text, 'python');
    editor = monaco.editor.create(document.getElementById('editor'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      renderIndentGuides: true,
      folding: false,
      'bracketPairColorization.enabled': true,
      lineDecorationsWidth: 30,
    });
    editor.setModel(session);
    session.onDidChangeContent((event) => {
      localStorage.setItem('source_text', encodeURIComponent(editor.getValue()));
    });

    inputSession = monaco.editor.createModel(input_text, 'text');
    inputEditor = monaco.editor.create(document.getElementById('input'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      folding: false,
      lineDecorationsWidth: 30,
      renderIndentGuides: false,
    });
    inputEditor.setModel(inputSession);
    inputSession.onDidChangeContent((event) => {
      localStorage.setItem('input_text', encodeURIComponent(inputEditor.getValue()));
    });

    outputSession = monaco.editor.createModel(output_text, 'text');
    outputEditor = monaco.editor.create(document.getElementById('output'), {
      minimap: { enabled: false },
      automaticLayout: true,
      renderControlCharacters: true,
      fontSize: 20,
      wordWrap: true,
      folding: false,
      lineDecorationsWidth: 30,
      renderIndentGuides: false,
    });
    outputEditor.setModel(outputSession);
    outputSession.onDidChangeContent((event) => {
      localStorage.setItem('output_text', encodeURIComponent(outputEditor.getValue()));
    });
  });
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
  }
});