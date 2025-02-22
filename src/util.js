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

export const bytesToHex = (bytes) => {
  let hexString = "";
  for (let i = 0; i < bytes.length; ++i)
    hexString += bytes.charCodeAt(i).toString(16).padStart(2, "0");
  return hexString;
};

export const formatHexString = (hexString) => {
  if (!hexString?.length) return "";
  console.assert(hexString.length % 2 == 0, hexString);
  let result = hexString.substring(0, 2);
  for (let i = 2; i < hexString.length; i += 2)
    result +=
      (i % 32 ? (i % 16 ? " " : "  ") : "\n") + hexString.substring(i, i + 2);
  return result;
};
