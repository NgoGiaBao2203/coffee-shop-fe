// The browser gives no reliable "print dialog closed" event for a PDF frame, so the frame is
// removed after this delay (or when the next file is printed)
const FRAME_CLEANUP_MS = 60_000;

let activeFrame: HTMLIFrameElement | null = null;
let activeUrl: string | null = null;
let cleanupTimer: ReturnType<typeof setTimeout> | undefined;

function removePrintFrame() {
  clearTimeout(cleanupTimer);
  activeFrame?.remove();
  if (activeUrl) URL.revokeObjectURL(activeUrl);
  activeFrame = null;
  activeUrl = null;
}

// Open the print dialog for a file received from the API (e.g. a PDF receipt) through a hidden iframe
export function printFile(blob: Blob) {
  removePrintFrame();

  const url = URL.createObjectURL(blob);
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.src = url;
  frame.onload = () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
  };

  document.body.appendChild(frame);
  activeFrame = frame;
  activeUrl = url;
  cleanupTimer = setTimeout(removePrintFrame, FRAME_CLEANUP_MS);
}
