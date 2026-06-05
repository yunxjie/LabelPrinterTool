const { ipcRenderer } = require("electron");

const labelText = document.getElementById("labelText");
const labelWidth = document.getElementById("labelWidth");
const labelHeight = document.getElementById("labelHeight");
const labelPreview = document.getElementById("labelPreview");
const textAlign = document.getElementById("textAlign");
const fontFamily = document.getElementById("fontFamily");
const fontSize = document.getElementById("fontSize");
const printBtn = document.getElementById("printBtn");
const choosePathBtn = document.getElementById("choosePathBtn");
const currentPath = document.getElementById("currentPath");

async function initSavePath() {
  const path = await ipcRenderer.invoke("get-save-path");
  currentPath.innerText = path;
}

function getJustifyContent(align) {
  if (align === "left") return "flex-start";
  if (align === "right") return "flex-end";
  return "center";
}

function updatePreview() {
  const width = labelWidth.value || 60;
  const height = labelHeight.value || 40;
  const align = textAlign.value || "center";
  const font = fontFamily.value || "Microsoft YaHei";
  const size = fontSize.value || 18;

  labelPreview.innerText = labelText.value || "标签预览";

  labelPreview.style.width = width + "mm";
  labelPreview.style.height = height + "mm";
  labelPreview.style.justifyContent = getJustifyContent(align);
  labelPreview.style.textAlign = align;
  labelPreview.style.fontFamily = font;
  labelPreview.style.fontSize = size + "px";
}

labelText.addEventListener("input", updatePreview);
labelWidth.addEventListener("input", updatePreview);
labelHeight.addEventListener("input", updatePreview);
textAlign.addEventListener("change", updatePreview);
fontFamily.addEventListener("change", updatePreview);
fontSize.addEventListener("input", updatePreview);

choosePathBtn.addEventListener("click", async () => {
  const path = await ipcRenderer.invoke("choose-save-path");
  currentPath.innerText = path;
  alert("打印记录保存路径已设置为：\n" + path);
});

printBtn.addEventListener("click", async () => {
  updatePreview();

  const width = labelWidth.value || 60;
  const height = labelHeight.value || 40;
  const align = textAlign.value || "center";
  const font = fontFamily.value || "Microsoft YaHei";
  const size = fontSize.value || 18;
  const content = labelText.value || "";

  if (!content.trim()) {
    alert("请输入标签内容");
    return;
  }

  const safeContent = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>打印标签</title>
      <style>
        @page {
          size: ${width}mm ${height}mm;
          margin: 0;
        }

        html,
        body {
          width: ${width}mm;
          height: ${height}mm;
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: ${font}, sans-serif;
        }

        .print-label {
          width: ${width}mm;
          height: ${height}mm;
          box-sizing: border-box;
          padding: 2mm;
          display: flex;
          align-items: center;
          justify-content: ${getJustifyContent(align)};
          text-align: ${align};
          white-space: pre-wrap;
          word-break: break-word;
          font-family: ${font}, sans-serif;
          font-size: ${size}px;
        }
      </style>
    </head>

    <body>
      <div class="print-label">${safeContent}</div>

      <script>
        window.onload = function () {
          window.print();
          window.close();
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();

  await saveHistory(content, width, height, align, font, size);
});

async function saveHistory(content, width, height, align, font, size) {
  return await ipcRenderer.invoke("save-print-history", {
    content,
    width,
    height,
    align,
    font,
    fontSize: size
  });
}

initSavePath();
updatePreview();