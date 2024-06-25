document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  function showMessage(element, message) {
    element.textContent = message;
    element.classList.remove("hidden");
    setTimeout(() => {
      element.classList.add("hidden");
      element.textContent = "";
    }, 5000);
  }

  function checkContentScript() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error("Aktif sekme bulunamadı"));
          return;
        }
        chrome.tabs.sendMessage(tabs[0].id, { action: "ping" }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    });
  }

  downloadBtn.addEventListener("click", () => {
    downloadBtn.disabled = true;
    downloadBtn.classList.add("opacity-50", "cursor-not-allowed");

    checkContentScript()
      .then(() => {
        chrome.runtime.sendMessage({ action: "downloadPDF" });
        showMessage(successMessage, "PDF indirme işlemi başlatıldı.");
      })
      .catch((error) => {
        console.error("Hata:", error.message);
        showMessage(
          errorMessage,
          "Lütfen sayfayı yenileyin ve tekrar deneyin. Hata: " + error.message
        );
      })
      .finally(() => {
        downloadBtn.disabled = false;
        downloadBtn.classList.remove("opacity-50", "cursor-not-allowed");
      });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showError") {
      showMessage(errorMessage, request.message);
    } else if (request.action === "showSuccess") {
      showMessage(successMessage, request.message);
    }
  });
});
