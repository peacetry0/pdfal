chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "ready" });
  } else if (request.action === "getFFLines") {
    const ffLines = Array.from(document.querySelectorAll("span.ff_line"))
      .map((span) => span.textContent.trim())
      .filter((text) => text.length > 0);
    sendResponse({ ffLines: ffLines });
  }
  return true; // Asenkron yanıt için gerekli
});
