function sendMessageToActiveTab(message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        reject(new Error("No active tab found"));
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadPDF") {
    sendMessageToActiveTab({ action: "getFFLines" })
      .then((response) => {
        if (response && response.ffLines) {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
          const lineHeight = 10;
          const pageHeight = doc.internal.pageSize.height;
          let cursorY = 10;

          response.ffLines.forEach((line, index) => {
            if (cursorY > pageHeight - 20) {
              doc.addPage();
              cursorY = 10;
            }
            doc.text(line, 10, cursorY);
            cursorY += lineHeight;
          });

          const pdfBlob = doc.output("blob");
          const url = URL.createObjectURL(pdfBlob);
          chrome.downloads.download({
            url: url,
            filename: "ff_lines.pdf",
            saveAs: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error.message);
        // Kullanıcıya hata mesajı göstermek için popup'a mesaj gönderebilirsiniz
        chrome.runtime.sendMessage({
          action: "showError",
          message: error.message,
        });
      });
  }
  return true; // Asenkron yanıt için gerekli
});
