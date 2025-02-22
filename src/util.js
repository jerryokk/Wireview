export const calculateFontSize = (height) => {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "0";
  div.style.opacity = "0";
  div.innerHTML = "[|]";
  div.style.fontFamily = getComputedStyle(document.body).getPropertyValue(
    "--ws-font-family-monospace"
  );
  document.body.appendChild(div);
  for (let h = height; h; --h) {
    div.style.fontSize = h + "px";
    const metrics = div.getBoundingClientRect();
    if (metrics.height <= height) {
      document.body.removeChild(div);
      return h;
    }
  }
};

export const toHexColor = (number, fallbackHex = "f00") =>
  `#${number?.toString(16)?.padStart(6, "0") ?? fallbackHex}`;
