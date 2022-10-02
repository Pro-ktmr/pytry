var terminal;

window.addEventListener('load', (event) => {
    document.getElementById('toggle_interactive').addEventListener('change', (event) => {
        const checkbox = document.getElementById('toggle_interactive');
        const inout_editor = document.getElementById('right-column');
        const interactive_editor = document.getElementById('right-column-interactive');
        if (checkbox.checked) {
            inout_editor.style = 'display: none;';
            interactive_editor.style = '';
        }
        else {
            inout_editor.style = '';
            interactive_editor.style = 'display: none;';
        }
    });

    terminal = new Terminal();
    document.getElementById('right-column-interactive').appendChild(terminal.html);
    terminal.print('実行ボタンを押してください');
});
