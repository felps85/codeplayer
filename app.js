const panelIds = ["html", "css", "javascript", "output"];
const grid = document.getElementById("bodyContainer");

const editors = {
  html: CodeMirror(document.getElementById("htmlEditor"), {
    mode: "htmlmixed",
    theme: "material-darker",
    lineNumbers: true,
    tabSize: 2,
    value: '<p id="paragraph">Hello world</p>',
  }),
  css: CodeMirror(document.getElementById("cssEditor"), {
    mode: "css",
    theme: "material-darker",
    lineNumbers: true,
    tabSize: 2,
    value: "p {\n  color: #7fcfff;\n}",
  }),
  javascript: CodeMirror(document.getElementById("javascriptEditor"), {
    mode: "javascript",
    theme: "material-darker",
    lineNumbers: true,
    tabSize: 2,
    value: 'document.getElementById("paragraph").textContent = "Hello you";',
  }),
};

function visiblePanels() {
  return panelIds.filter((id) => !document.getElementById(`${id}Panel`).classList.contains("hidden"));
}

function refreshEditors() {
  Object.values(editors).forEach((editor) => editor.refresh());
}

function refreshGridColumns() {
  const count = visiblePanels().length;
  let columns = count;

  if (window.innerWidth < 700) {
    columns = 1;
  } else if (window.innerWidth < 1100) {
    columns = Math.min(count, 2);
  }

  grid.style.gridTemplateColumns = `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`;
}

function refreshLayout() {
  refreshGridColumns();
  refreshEditors();
}

function updateOutput() {
  const iframe = document.getElementById("previewFrame");
  const html = editors.html.getValue();
  const css = editors.css.getValue();
  const js = editors.javascript.getValue();

  const source = `<!doctype html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}<\/script>
</body>
</html>`;

  iframe.srcdoc = source;
}

panelIds.forEach((id) => {
  const button = document.getElementById(id);
  const panel = document.getElementById(`${id}Panel`);

  button.addEventListener("click", () => {
    button.classList.toggle("active");
    panel.classList.toggle("hidden");

    if (visiblePanels().length === 0) {
      panel.classList.remove("hidden");
      button.classList.add("active");
    }

    refreshLayout();
  });
});

async function toggleFullscreen(panelId, triggerButton) {
  const panel = document.getElementById(`${panelId}Panel`);
  const isFullscreen = document.fullscreenElement === panel;

  if (isFullscreen) {
    await document.exitFullscreen();
    return;
  }

  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }

  await panel.requestFullscreen();
  triggerButton.focus();
}

function syncFullscreenButtons() {
  const fullscreenElement = document.fullscreenElement;
  document.querySelectorAll(".panelAction").forEach((button) => {
    const panel = document.getElementById(`${button.dataset.fullscreen}Panel`);
    const active = fullscreenElement === panel;
    button.textContent = active ? "Close full screen" : "Full screen";
    button.classList.toggle("active", active);
  });

  refreshEditors();
}

document.querySelectorAll(".panelAction").forEach((button) => {
  button.addEventListener("click", () => {
    toggleFullscreen(button.dataset.fullscreen, button).catch(() => {});
  });
});

Object.values(editors).forEach((editor) => {
  editor.on("change", updateOutput);
});

document.addEventListener("fullscreenchange", syncFullscreenButtons);
window.addEventListener("resize", refreshLayout);

refreshLayout();
syncFullscreenButtons();
updateOutput();
