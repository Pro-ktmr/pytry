import * as editor from "./editor.js";
import * as hintFinder from "./hint-finder.js";
import * as compiler from "./compiler.js";
import * as formatter from "./formatter.js";
import * as runner from "./interactive-runner.js";
import * as logger from "./logger.js";

window.addEventListener("load", (event) => {
  editor.initialize("source-editor", "input-editor", "output-editor", true);
  hintFinder.initialize();
  compiler.initialize();
  formatter.initialize();
  runner.initialize("run", "run-timeout");

  logger.initizalize();

  //   const enterInteractiveLine = async () => {
  //     const interactiveInput = document.getElementById("interactive-input");
  //     const line = interactiveInput.value.trim();
  //     if (line == "") return;
  //     interactiveInput.value = "";
  //     runner.enterStdinLine(line);
  //     const interactiveConsole = document.getElementById("interactive-console");
  //     interactiveConsole.innerHTML += line + "\n";
  //   };
  //   document
  //     .getElementById("interactive-input")
  //     .addEventListener("keydown", (event) => {
  //       if (event.key === "Enter") {
  //         enterInteractiveLine();
  //       }
  //     });
  //   document
  //     .getElementById("interactive-submit")
  //     .addEventListener("click", enterInteractiveLine);

  document
    .getElementById("insert_map_int_input_split")
    .addEventListener("click", editor.insert_map_int_input_split);
  document
    .getElementById("insert_int_input")
    .addEventListener("click", editor.insert_int_input);
  document
    .getElementById("insert_map_int_input_split")
    .addEventListener("click", editor.insert_map_int_input_split);
  document
    .getElementById("insert_input")
    .addEventListener("click", editor.insert_input);
  document
    .getElementById("insert_list_map_int_input_split")
    .addEventListener("click", editor.insert_list_map_int_input_split);

  document.getElementById("run").addEventListener("click", async (event) => {
    logger.log("run_click", {});
    await formatter.formatAndUpdateEditor(editor.sourceEditor);
    runner.run();
  });

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "s") {
      event.preventDefault();
    }
  });

  setInterval(() => {
    document.body.style.padding = "0";
  }, 1000);
});
