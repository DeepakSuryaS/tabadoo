# Tabadoo Extension

Tabadoo is a browser extension for efficiently managing and saving tabs.

## Features

- Save tabs individually or in groups
- Categorize saved tabs by date
- Import and export URLs
- Exclude specific sites from being saved
- Drag and drop to reorder saved tabs

## Development

### Prerequisites

- Node.js (v14 or later recommended)
- npm (v6 or later)

### Setup

1. Clone the repository
2. Run `npm install` to install dependencies

### Build

Run `npm run build` to build the extension. The output will be in the `dist` folder.

### Development with watch mode

Run `npm run watch` to start webpack in watch mode. This will automatically rebuild the extension when files are changed.

### Linting

Run `npm run lint` to lint the JavaScript files using ESLint.

### Testing

Run `npm test` to run the test suite using Jest.

## Loading the extension

### Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file in the `dist` folder

## License

This project is licensed under the MIT License.
