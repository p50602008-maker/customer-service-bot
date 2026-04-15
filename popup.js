// 頁面打開時，讀取之前存過的話
chrome.storage.local.get(['autoReplyMsg'], (result) => {
  if (result.autoReplyMsg) {
    document.getElementById('replyText').value = result.autoReplyMsg;
  }
});

// 點擊儲存按鈕
document.getElementById('saveBtn').addEventListener('click', () => {
  const msg = document.getElementById('replyText').value;
  chrome.storage.local.set({ autoReplyMsg: msg }, () => {
    alert('儲存成功！');
  });
});