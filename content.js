(() => {
  const BUTTON_CLASS = "yt-to-gemini-button";
  const CARD_SELECTORS = [
    "ytd-rich-item-renderer",
    "ytd-video-renderer",
    "ytd-grid-video-renderer",
    "ytd-compact-video-renderer",
    "ytd-playlist-video-renderer"
  ].join(",");

  const LEGACY_DEFAULT_PROMPT =
    "次のYouTube動画の内容を日本語で要約してください。重要なポイントを箇条書きにし、可能ならタイムスタンプも付けてください。";
  const DEFAULT_PROMPT =
    "Summarize the following YouTube video. Respond in {language}, list the key points, and include timestamps when possible.";
  const DEFAULT_SETTINGS = {
    languageMode: "browser",
    targetLanguage: "en",
    promptMode: "default",
    customPrompt: "",
    autoSubmit: false
  };
  const LANGUAGE_NAMES = {
    ar: "Arabic", de: "German", en: "English", es: "Spanish", fr: "French",
    hi: "Hindi", id: "Indonesian", it: "Italian", ja: "Japanese", ko: "Korean",
    nl: "Dutch", pl: "Polish", pt: "Portuguese", ru: "Russian", sv: "Swedish",
    th: "Thai", tr: "Turkish", uk: "Ukrainian", vi: "Vietnamese",
    "zh-CN": "Simplified Chinese", "zh-TW": "Traditional Chinese"
  };
  const BUTTON_MESSAGES = {
    en: {
      summarizeButton: "Summarize",
      summarizeWithGemini: "Summarize with Gemini",
      openedGemini: "Opened Gemini",
      openedShort: "Opened"
    },
    ja: {
      summarizeButton: "要約",
      summarizeWithGemini: "Geminiで要約",
      openedGemini: "Geminiを開きました",
      openedShort: "開きました"
    },
    "zh-CN": {
      summarizeButton: "总结",
      summarizeWithGemini: "使用 Gemini 总结",
      openedGemini: "已打开 Gemini",
      openedShort: "已打开"
    },
    "zh-TW": {
      summarizeButton: "摘要",
      summarizeWithGemini: "使用 Gemini 摘要",
      openedGemini: "已開啟 Gemini",
      openedShort: "已開啟"
    },
    es: {
      summarizeButton: "Resumir",
      summarizeWithGemini: "Resumir con Gemini",
      openedGemini: "Gemini abierto",
      openedShort: "Abierto"
    },
    de: {
      summarizeButton: "Zusammenfassen",
      summarizeWithGemini: "Mit Gemini zusammenfassen",
      openedGemini: "Gemini wurde geöffnet",
      openedShort: "Geöffnet"
    },
    fr: {
      summarizeButton: "Résumer",
      summarizeWithGemini: "Résumer avec Gemini",
      openedGemini: "Gemini ouvert",
      openedShort: "Ouvert"
    }
  };
  let settings = { ...DEFAULT_SETTINGS };

  function youtubeLocale() {
    const locale = (document.documentElement.lang || "en").replace("_", "-");
    if (/^zh-(Hant|TW|HK|MO)/i.test(locale)) return "zh-TW";
    if (/^zh-Hans/i.test(locale)) return "zh-CN";
    if (/^zh/i.test(locale)) return "zh-CN";
    const primary = locale.split("-")[0].toLowerCase();
    return BUTTON_MESSAGES[primary] ? primary : "en";
  }

  const message = (key) => BUTTON_MESSAGES[youtubeLocale()][key] || BUTTON_MESSAGES.en[key];

  chrome.storage.sync.get({ ...DEFAULT_SETTINGS, promptTemplate: "" }).then((stored) => {
    settings = { ...DEFAULT_SETTINGS, ...stored };
    if (stored.promptTemplate && stored.promptTemplate !== LEGACY_DEFAULT_PROMPT && !stored.customPrompt) {
      settings.promptMode = "custom";
      settings.customPrompt = stored.promptTemplate;
    }
    refreshButtonLabels();
  });
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (changes[key]) settings[key] = changes[key].newValue ?? DEFAULT_SETTINGS[key];
    }
    refreshButtonLabels();
  });

  function normalizeLanguage(locale) {
    const normalized = locale.replace("_", "-");
    if (/^zh-(Hant|TW|HK|MO)/i.test(normalized)) return "zh-TW";
    if (/^zh-Hans/i.test(normalized)) return "zh-CN";
    if (/^zh/i.test(normalized)) return "zh-CN";
    const primary = normalized.split("-")[0].toLowerCase();
    return LANGUAGE_NAMES[primary] ? primary : normalized;
  }

  function refreshButtonLabels() {
    document.querySelectorAll(`.${BUTTON_CLASS}:not(.is-sent)`).forEach((button) => {
      button.setAttribute("aria-label", message("summarizeWithGemini"));
      button.title = message("summarizeWithGemini");
      button.querySelector("span").textContent = message("summarizeButton");
    });
  }

  function buildPrompt(video) {
    const languageCode = settings.languageMode === "manual"
      ? settings.targetLanguage
      : normalizeLanguage(chrome.i18n.getUILanguage());
    const language = LANGUAGE_NAMES[languageCode] || languageCode;
    const template = settings.promptMode === "custom" && settings.customPrompt.trim()
      ? settings.customPrompt.trim()
      : DEFAULT_PROMPT;
    let prompt = template
      .replaceAll("{language}", language)
      .replaceAll("{title}", video.title)
      .replaceAll("{url}", video.url);
    // カスタムプロンプトにプレースホルダーがなくても言語設定を必ず適用する。
    if (!template.includes("{language}")) prompt += `\nResponse language: ${language}`;
    if (!template.includes("{title}") && video.title) prompt += `\nTitle: ${video.title}`;
    if (!template.includes("{url}")) prompt += `\nURL: ${video.url}`;
    return prompt;
  }

  function normalizeVideoUrl(href) {
    try {
      const url = new URL(href, location.origin);
      const videoId = url.searchParams.get("v");
      if (!videoId) return null;
      return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    } catch {
      return null;
    }
  }

  function getVideo(card) {
    const anchor = card.querySelector(
      'a#thumbnail[href*="/watch"], a.ytd-thumbnail[href*="/watch"], a[href*="/watch?v="]'
    );
    const url = anchor && normalizeVideoUrl(anchor.href);
    if (!anchor || !url) return null;

    const titleNode = card.querySelector(
      "#video-title, #video-title-link, yt-formatted-string#video-title"
    );
    const title = titleNode?.getAttribute("title") || titleNode?.textContent?.trim() || "";
    return { anchor, url, title };
  }

  function sendToGemini(event, video, button) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    button.disabled = true;
    button.classList.add("is-loading");

    const prompt = buildPrompt(video);

    // Gemini側への自動入力が失敗した場合にも貼り付けられるようコピーする。
    navigator.clipboard.writeText(prompt).catch(() => {
      // Clipboardが拒否されてもGeminiを開く処理は続ける。
    });

    const requestId = crypto.randomUUID();
    chrome.storage.local.set({
      [`geminiRequest:${requestId}`]: {
        prompt,
        autoSubmit: settings.autoSubmit,
        createdAt: Date.now()
      }
    });
    const geminiUrl = `https://gemini.google.com/app?yt2gemini=${encodeURIComponent(requestId)}`;
    window.open(geminiUrl, "_blank", "noopener,noreferrer");

    button.classList.remove("is-loading");
    button.classList.add("is-sent");
    button.setAttribute("aria-label", message("openedGemini"));
    button.querySelector("span").textContent = message("openedShort");
    button.disabled = false;
    setTimeout(() => {
      button.classList.remove("is-sent");
      button.setAttribute("aria-label", message("summarizeWithGemini"));
      button.querySelector("span").textContent = message("summarizeButton");
    }, 1600);
  }

  function createButton(video) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = BUTTON_CLASS;
    button.setAttribute("aria-label", message("summarizeWithGemini"));
    button.title = message("summarizeWithGemini");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 5.2c0-.8.9-1.2 1.5-.8l6.6 4.7c.6.4.6 1.3 0 1.7L5 15.5c-.6.4-1.5 0-1.5-.8V5.2Z"/>
        <path d="M14 6h7v2h-7zM14 11h7v2h-7zM14 16h7v2h-7z"/>
      </svg>
      <span>${message("summarizeButton")}</span>
    `;
    button.addEventListener("click", (event) => sendToGemini(event, video, button));
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    return button;
  }

  function enhanceCard(card) {
    const video = getVideo(card);
    if (!video) return;

    const thumbnail = video.anchor.closest("ytd-thumbnail") || video.anchor;
    // YouTubeはプレビュー開始時などにサムネイル内部を差し替える。
    // カード単位の処理済みフラグではなく、現在のDOMにボタンがあるかを確認する。
    if (thumbnail.querySelector(`.${BUTTON_CLASS}`)) return;
    thumbnail.classList.add("yt-to-gemini-thumbnail");
    thumbnail.appendChild(createButton(video));
  }

  function scan(root = document) {
    if (root.matches?.(CARD_SELECTORS)) enhanceCard(root);
    root.querySelectorAll?.(CARD_SELECTORS).forEach(enhanceCard);
  }

  let scanQueued = false;
  const observer = new MutationObserver((mutations) => {
    if (scanQueued || !mutations.some((mutation) => mutation.addedNodes.length)) return;
    scanQueued = true;
    requestAnimationFrame(() => {
      scanQueued = false;
      scan(document);
    });
  });

  scan();
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // YouTubeの設定から表示言語を変更した場合も、再注入せずラベルを更新する。
  const languageObserver = new MutationObserver(refreshButtonLabels);
  languageObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
})();
