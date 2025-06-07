window.addEventListener("load", () => {
  if (localStorage.getItem("terms") == null) {
    console.log("Terms not accepted, showing terms dialog.");
    document.getElementById("terms").style.display = "block";
    document.getElementById("terms-button").addEventListener("click", () => {
      localStorage.setItem("terms", "accepted");
      document.getElementById("terms").style.display = "none";
    });
  } else {
    console.log("Terms already accepted, no action needed.");
    document.getElementById("terms").style.display = "none";
  }
});
