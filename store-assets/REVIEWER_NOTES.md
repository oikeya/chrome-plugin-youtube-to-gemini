# Chrome Web Store reviewer notes

## Single purpose

Allow a user to select a YouTube video from a visible thumbnail and prepare that video's title, URL, and a configurable summarization prompt in Google Gemini.

## Test instructions

1. Install the extension and open `https://www.youtube.com/`.
2. Confirm that each supported video thumbnail has a **Summarize** button in its lower-right corner.
3. Click **Summarize** on any public video.
4. A new `https://gemini.google.com/` tab opens. The extension inserts a prompt containing the selected video's title and URL.
5. By default, the extension does not send the prompt. Reviewers can manually click Gemini's Send button.
6. Open the extension popup to change the summary language or custom prompt.
7. Optional automation test: enable **Send to Gemini automatically**, return to YouTube, and click Summarize. This setting is off by default and its disclosure explains exactly what is sent.

A Google account may be required by Gemini. No separate test account, paid service, developer server, or extension account is required.

## Permission justifications

### `storage`

Stores the user's summary-language, custom-prompt, and opt-in automatic-send settings. It also stores the assembled prompt briefly in local extension storage to hand it from the user-selected YouTube tab to the newly opened Gemini tab. Pending prompts are removed after insertion or expiration.

### `clipboardWrite`

Copies the assembled prompt to the clipboard only after the user clicks Summarize. This is a fallback so the user can paste it if a Gemini interface change prevents automatic insertion.

### Host access: `https://www.youtube.com/*`

Required to add the visible Summarize button and, after that button is clicked, read only the selected video's public title and URL.

### Host access: `https://gemini.google.com/*`

Required to insert the user-requested prompt into Gemini. The Send button is activated only when the user has explicitly enabled the automatic-send option, which is off by default.

## Remote code

No. The extension does not fetch or execute remote code. All extension logic is packaged in the submitted ZIP.

## Data-use disclosure guidance

Conservatively disclose the following categories in the dashboard because Chrome's policy defines locally handled and directly transmitted data broadly:

- Web history: the URL of the single video explicitly selected by the user.
- Website content: the public title of that selected video.
- User-provided content: the custom prompt and preferences entered in the popup.

The developer receives none of this data. It is processed locally and the selected title, URL, and prompt are disclosed directly to Google Gemini solely for the extension's stated user-facing feature. There is no analytics, advertising, sale, credit use, or human review by the developer.

Select **No, I am not using remote code** and certify all applicable Limited Use statements.

## Affiliation disclosure

This is an unofficial third-party extension. It is not affiliated with, endorsed by, or provided by Google, YouTube, or Gemini. It uses an original icon and does not use Google product logos.
