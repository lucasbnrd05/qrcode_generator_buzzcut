# QR Code URL Generator - Browser Extension

## Overview

QR Code URL Generator is a lightweight and user-friendly browser extension that instantly generates a QR code for the URL of your currently active browser tab. It simplifies sharing web pages with mobile devices or any QR code scanners.

The extension features a simple popup interface allowing you to customize the QR code’s foreground color, background color, and size. You can preview the QR code live and download it as a PNG image.

## Features

- **Instant QR Code Generation:** Generate a QR code for the current tab’s URL with one click.
- **Customizable Appearance:**
  - Foreground color (QR code color)
  - Background color
  - Size (pixel dimensions)
- **Live Preview:** See changes reflected immediately in the popup.
- **Download QR Code:** Save the QR code as a PNG file.
- **URL Display:** Shows the URL that was encoded.
- **Settings Persistence:** Saves your customization preferences locally for future use.
- **Cross-Browser Compatibility:** Designed primarily for Firefox using the WebExtensions API, but adaptable for Chrome and Chromium-based browsers.

## Installation

### Firefox

1. Download or clone the repository with all files (`manifest.json`, `popup.html`, `popup.js`, `popup.css`, `qrcode.min.js`, and the `icons` folder) into a single directory.
2. Open Firefox.
3. Navigate to `about:debugging`.
4. Select **This Firefox** in the left menu.
5. Click **Load Temporary Add-on...**
6. Select the `manifest.json` file from the extension directory.
7. The extension icon will appear in the toolbar.

> **Note:** Temporary add-ons are removed when Firefox closes. To install permanently, package and sign the extension.

### Chrome (and Chromium-based browsers)

1. Download or clone the repository with all files into a directory.
2. Open Chrome.
3. Navigate to `chrome://extensions`.
4. Enable **Developer mode** (toggle in top-right corner).
5. Click **Load unpacked**.
6. Select the extension directory.
7. The extension icon will appear in the toolbar.

> You may need to update `manifest.json` for Chrome compatibility (e.g., change `"browser_action"` to `"action"` and API calls from `browser.*` to `chrome.*`).

## How to Use

1. Navigate to any web page you want to generate a QR code for.
2. Click the QR Code URL Generator extension icon.
3. The popup will display:
   - The generated QR code for the current URL.
   - Controls to customize foreground color, background color, and size.
   - The encoded URL.
4. Adjust settings as desired — the preview updates live.
5. Click **Download QR Code** to save the image as a PNG file.
6. Your settings will be saved and applied next time you use the extension.

## File Structure

```text
qr-code-url-generator/
├── manifest.json # Extension manifest
├── popup.html # Popup HTML
├── popup.js # Popup JavaScript logic
├── popup.css # Popup styles
├── qrcode.min.js # QR code generation library
└── icons/
├── icon-48.png
└── icon-96.png
```


## Technical Details

- Permissions:
  - `activeTab` to access the current tab’s URL.
  - `storage` to save user preferences.
  - `downloads` to enable QR code image saving.
- Uses [qrcode.js by davidshimjs](https://github.com/davidshimjs/qrcodejs) for QR code generation.
- Downloads are implemented by converting the QR code canvas to a Blob URL and triggering a download via a temporary `<a>` tag for better compatibility.

## Known Issues

- Downloading can occasionally fail due to browser security policies, especially in strict contexts.
- Generating QR codes for internal browser pages (e.g., `about:addons`, `chrome://extensions`) may not work properly.
- Very long URLs produce dense QR codes which some scanners may struggle to read.

## Future Improvements

- Add option for QR code error correction level.
- Allow copying QR code image directly to clipboard.
- Support encoding custom text or data.
- Localization and internationalization support.
- Enhanced UI/UX and accessibility.
- More robust error handling and user feedback.
- Official packaging for browser stores.
- Integrate `webextension-polyfill` for seamless cross-browser compatibility.

## Contributing

Contributions and bug reports are welcome! Please open issues or pull requests on the GitHub repository.

## License

- **Personal Use:** This project is for personal use and not licensed for redistribution.


