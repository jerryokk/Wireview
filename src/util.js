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

export const watchMouseDragMove = ({ clientX, clientY }, callback) => {
  const handleMouseMove = (event) => {
    if ((event.buttons & 1) !== 1) {
      window.removeEventListener("mousemove", handleMouseMove);
      return;
    }
    callback({
      deltaX: event.clientX - clientX,
      deltaY: event.clientY - clientY,
    });
  };

  window.addEventListener("mousemove", handleMouseMove);
};

export const isNullish = (value) => (value ?? null) === null;

export const areArraysEqual = (a, b) => {
  if (a === b) return true;
  if (isNullish(a) || isNullish(b)) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
  return true;
};

export const clamp = (min, num, max) => {
  console.assert(
    min <= max,
    `invalid arguments to clamp - ${min} is larger than ${max}`
  );
  return Math.max(min, Math.min(max, num));
};
