import * as editor from "./editor.js";
import * as hintFinder from "./hint-finder.js";
import * as compiler from "./compiler.js";
import * as formatter from "./formatter.js";
import * as runner from "./runner.js";
import * as logger from "./logger.js";

window.addEventListener("load", (event) => {
  editor.initialize("source-editor", "input-editor", "output-editor");
  hintFinder.initialize();
  compiler.initialize();
  formatter.initialize();
  runner.initialize("run", "run-completed", "run-timeout");

  logger.initizalize();

  document
    .getElementById("copy_from_source")
    .addEventListener("click", editor.copy_from_source);
  document
    .getElementById("paste_to_input")
    .addEventListener("click", editor.paste_to_input);
  document.getElementById("insert-buttons").addEventListener("wheel", (e) => {
    if (e.deltaX == 0 && e.deltaY != 0) {
      document.getElementById("insert-buttons").scrollBy({
        top: 0,
        left: (40 * e.deltaY) / Math.abs(e.deltaY),
        behavior: "auto",
      });
    }
  });
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
    document.getElementById("matplotlib-result-div").style = "display: none;";
    await formatter.formatAndUpdateEditor(editor.sourceEditor);
    runner.run();
  });

  document
    .getElementById("matplotlib-result-delete-button")
    .addEventListener("click", () => {
      document.getElementById("matplotlib-result-div").style = "display: none;";
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
