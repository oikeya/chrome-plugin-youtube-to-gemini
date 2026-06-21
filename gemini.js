(() => {
  // GeminiがURLを書き換える前に、YouTubeタブから渡されたIDを確保する。
  const requestId = new URL(location.href).searchParams.get("yt2gemini");
  if (!requestId) return;

  const storageKey = `geminiRequest:${requestId}`;
  const INPUT_SELECTORS = [
    'rich-textarea .ql-editor[contenteditable="true"]',
    '.ql-editor[contenteditable="true"]',
    '[contenteditable="true"][role="textbox"]',
    'textarea[placeholder]',
    'textarea'
  ].join(',');
  const SEND_SELECTORS = [
    'button[aria-label="Send message"]',
    'button[aria-label="メッセージを送信"]',
    'button[aria-label="送信"]',
    'button[data-test-id="send-button"]',
    'button.send-button',
    '.send-button-container button'
  ].join(',');

  const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  async function readRequest() {
    // 新しいタブの起動とstorage書き込みの競合を吸収する。
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const stored = await chrome.storage.local.get(storageKey);
      const request = stored[storageKey];
      if (request?.prompt && Date.now() - request.createdAt < 60_000) return request;
      if (request && Date.now() - request.createdAt >= 60_000) {
        await chrome.storage.local.remove(storageKey);
        return null;
      }
      await sleep(100);
    }
    return null;
  }

  function isUsable(element) {
    return element && element.getClientRects().length > 0 && !element.disabled;
  }

  async function waitForElement(selectors, timeout = 30_000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const element = [...document.querySelectorAll(selectors)].find(isUsable);
      if (element) return element;
      await sleep(200);
    }
    return null;
  }

  function insertPrompt(editor, prompt) {
    editor.focus();

    if (editor instanceof HTMLTextAreaElement || editor instanceof HTMLInputElement) {
      const prototype = editor instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(editor, prompt);
      editor.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: prompt
      }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const selection = getSelection();
    const range = document.createRange();
    range.selectNodeContents(editor);
    selection.removeAllRanges();
    selection.addRange(range);

    const inserted = document.execCommand('insertText', false, prompt);
    if (!inserted || !editor.textContent.trim()) {
      editor.textContent = prompt;
      editor.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        inputType: 'insertText',
        data: prompt
      }));
    }
  }

  function showNotice(message) {
    if (!document.body) {
      setTimeout(() => showNotice(message), 200);
      return;
    }
    const notice = document.createElement('div');
    notice.textContent = message;
    Object.assign(notice.style, {
      position: 'fixed',
      zIndex: '2147483647',
      right: '20px',
      bottom: '20px',
      padding: '12px 16px',
      borderRadius: '12px',
      color: '#fff',
      background: 'rgba(32, 33, 36, .94)',
      boxShadow: '0 4px 18px rgba(0, 0, 0, .3)',
      font: '14px/1.4 Arial, sans-serif'
    });
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 5000);
  }

  async function run() {
    const request = await readRequest();
    if (!request) return;
    const message = (key) => chrome.i18n.getMessage(key);

    const editor = await waitForElement(INPUT_SELECTORS);
    if (!editor) {
      await chrome.storage.local.remove(storageKey);
      showNotice(message('inputNotFound'));
      return;
    }

    insertPrompt(editor, request.prompt);
    await chrome.storage.local.remove(storageKey);

    const cleanUrl = new URL(location.href);
    cleanUrl.searchParams.delete('yt2gemini');
    history.replaceState(history.state, '', cleanUrl);

    if (!request.autoSubmit) {
      showNotice(message('promptInserted'));
      return;
    }

    // 開発者モードの場合のみ、UIが送信可能になるまで待って押下する。
    const sendButton = await waitForElement(SEND_SELECTORS, 5_000);
    if (sendButton) {
      sendButton.click();
    } else {
      showNotice(message('sendNotFound'));
    }
  }

  run().catch(async () => {
    await chrome.storage.local.remove(storageKey);
    showNotice(chrome.i18n.getMessage('automationFailed'));
  });
})();
