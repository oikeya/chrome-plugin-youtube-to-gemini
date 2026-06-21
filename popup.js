const DEFAULTS = {
  languageMode: "browser",
  targetLanguage: "en",
  promptMode: "default",
  customPrompt: "",
  autoSubmit: false
};
const LANGUAGE_CODES = [
  "ar", "de", "en", "es", "fr", "hi", "id", "it", "ja", "ko", "nl", "pl",
  "pt", "ru", "sv", "th", "tr", "uk", "vi", "zh-CN", "zh-TW"
];

const getMessage = (key) => chrome.i18n.getMessage(key);
const uiLocale = chrome.i18n.getUILanguage();
const displayNames = new Intl.DisplayNames([uiLocale], { type: "language" });
const status = document.querySelector("#status");
const languageSelect = document.querySelector("#target-language");
const customPrompt = document.querySelector("#custom-prompt");
const autoSubmit = document.querySelector("#auto-submit");

document.documentElement.lang = uiLocale;
document.querySelectorAll("[data-i18n]").forEach((element) => {
  element.textContent = getMessage(element.dataset.i18n);
});

for (const code of LANGUAGE_CODES) {
  const option = document.createElement("option");
  option.value = code;
  option.textContent = displayNames.of(code) || code;
  languageSelect.appendChild(option);
}

const detectedCode = uiLocale.toLowerCase().startsWith("zh")
  ? (/-(hant|tw|hk|mo)/i.test(uiLocale) ? "zh-TW" : "zh-CN")
  : uiLocale.split("-")[0];
document.querySelector("#detected-language").textContent =
  `(${displayNames.of(detectedCode) || detectedCode})`;

function selectedRadio(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value;
}

function updateAvailability() {
  languageSelect.disabled = selectedRadio("languageMode") !== "manual";
  customPrompt.disabled = selectedRadio("promptMode") !== "custom";
}

document.querySelectorAll('input[type="radio"]').forEach((input) => {
  input.addEventListener("change", updateAvailability);
});

chrome.storage.sync.get({ ...DEFAULTS, promptTemplate: "" }).then((stored) => {
  const languageMode = ["browser", "manual"].includes(stored.languageMode)
    ? stored.languageMode : "browser";
  document.querySelector(`input[name="languageMode"][value="${languageMode}"]`).checked = true;
  languageSelect.value = LANGUAGE_CODES.includes(stored.targetLanguage)
    ? stored.targetLanguage : "en";

  const legacyCustomPrompt = stored.promptTemplate && !stored.customPrompt &&
    !stored.promptTemplate.startsWith("次のYouTube動画の内容を日本語で要約してください")
      ? stored.promptTemplate
      : "";
  const promptMode = legacyCustomPrompt
    ? "custom"
    : (["default", "custom"].includes(stored.promptMode) ? stored.promptMode : "default");
  document.querySelector(`input[name="promptMode"][value="${promptMode}"]`).checked = true;
  customPrompt.value = legacyCustomPrompt || stored.customPrompt;
  customPrompt.placeholder = getMessage("customPromptPlaceholder");
  autoSubmit.checked = stored.autoSubmit;
  updateAvailability();
});

document.querySelector("#save").addEventListener("click", async () => {
  await chrome.storage.sync.set({
    languageMode: selectedRadio("languageMode"),
    targetLanguage: languageSelect.value,
    promptMode: selectedRadio("promptMode"),
    customPrompt: customPrompt.value.trim(),
    autoSubmit: autoSubmit.checked
  });
  status.textContent = getMessage("saved");
  setTimeout(() => (status.textContent = ""), 1600);
});
