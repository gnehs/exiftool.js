# Modern EXIF Parser

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL%202.0-brightgreen.svg)](https://opensource.org/licenses/MPL-2.0)

A modern JavaScript EXIF parsing library for reading metadata from JPEG files. This project is a refactoring of the classic [exif-js](https://github.com/exif-js/exif-js/tree/master), adopting ES Modules, `async/await`, Classes, and a clearer code structure for improved maintainability and use in contemporary web development.

## Features

- **Modern JavaScript:** Built with ES Modules, `async/await`, `const`/`let`, and Classes.
- **Data-Driven API:** Core API operates on `ArrayBuffer`, returning Promises resolving to EXIF tag objects.
- **Dependency Free:** No external dependencies like jQuery.
- **Decoupled from DOM:** Focuses solely on parsing logic, allowing integration into any framework or vanilla JS project.
- **Modular Structure:** Clear separation into constants, binary reader, parser, and utilities.
- **Flexible Input:** Helper functions provided for easy parsing from `File` objects, URLs, or Node.js `Buffer`s.
- **Core Parsing Retained:** Preserves the essential EXIF, TIFF, and GPS tag parsing capabilities of the original `exif-js`.
- **Basic MakerNote Support:** Includes logic based on `MakeInfo` constants to attempt parsing MakerNotes for common manufacturers (Canon, Nikon, Fujifilm, Olympus, Panasonic, Pentax, Sony, etc.).

## Key Differences from Original exif-js

- **Modern API:** Uses ES Module imports and async functions, replacing the global `EXIF` object and jQuery plugins.
- **No XMP Parsing:** This refactoring focuses exclusively on EXIF data and does not include XMP metadata parsing.
- **Simplified MakerNote Offset Calculation:** The complex `calculateOffsetBase` logic from the original, particularly relevant for some older or specific cameras (like certain Pentax models), has been simplified. While basic MakerNote parsing works for many cameras, this simplification might affect accuracy for models heavily reliant on that specific calculation.
- **No jQuery/DOM Integration:** Users are responsible for fetching/reading file data and integrating the parsed results into their application.
- **Legacy Support Removed:** Dropped support for legacy IE features and built-in Base64 handling.
- **Node.js Usage:** Requires reading files into a `Buffer` _before_ passing it to the library, rather than the library accessing the filesystem directly.

## Installation

You can install this package directly from its GitHub repository.

```bash
# Using npm
npm install github:gnehs/exiftool.js
# Or specify a branch/tag/commit:
# npm install github:gnehs/exiftool.js#main

# Using yarn
yarn add github:gnehs/exiftool.js
# Or specify a branch/tag/commit:
# yarn add github:gnehs/exiftool.js#main

# Using pnpm
pnpm add github:gnehs/exiftool.js
# Or specify a branch/tag/commit:
# pnpm add github:gnehs/exiftool.js#main
```

After installation, you can import it using the package name defined in `package.json` (which is currently `@gnehs/exiftool.js`).

## Usage Examples

### Browser (from `<input type="file">`)

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Modern EXIF Reader</title>
  </head>
  <body>
    <input type="file" id="fileInput" accept="image/jpeg" />
    <pre id="output"></pre>

    <script type="module">
      // Import using the installed package name
      import exifParser from "@gnehs/exiftool.js";

      const fileInput = document.getElementById("fileInput");
      const output = document.getElementById("output");

      fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
          output.textContent = "Processing...";
          try {
            // Limit read size for performance (1MB is often enough)
            const maxBufferSize = 1024 * 1024;
            const tags = await exifParser.parseFromFile(file, maxBufferSize);

            if (tags) {
              output.textContent = JSON.stringify(tags, null, 2);
            } else {
              output.textContent = "No EXIF data found or error parsing.";
            }
          } catch (error) {
            console.error("Error parsing file:", error);
            output.textContent = `Error: ${error.message}`;
          }
        }
      });
    </script>
  </body>
</html>
```

### Browser (from URL)

```javascript
// Import using the installed package name
import exifParser from "@gnehs/exiftool.js";

const imageUrl = "https://example.com/image.jpg"; // Replace with your image URL
const outputElement = document.getElementById("output"); // Assume an element for output

async function parseUrl(url) {
  outputElement.textContent = "Fetching and processing...";
  try {
    // Note: Cross-origin requests require correct CORS headers on the server
    const tags = await exifParser.parseFromUrl(url);

    if (tags) {
      outputElement.textContent = JSON.stringify(tags, null, 2);
    } else {
      outputElement.textContent =
        "No EXIF data found or error fetching/parsing.";
    }
  } catch (error) {
    console.error(`Error processing URL ${url}:`, error);
    outputElement.textContent = `Error: ${error.message}`;
  }
}

parseUrl(imageUrl);
```

### Node.js

```javascript
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url"; // To get __dirname in ES Modules

// Import using the installed package name
import exifParser from "@gnehs/exiftool.js";

// Helper to get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readExifNode(filePath) {
  try {
    console.log(`Reading file: ${filePath}`);
    // Read the file into a Buffer
    const buffer = await fs.readFile(filePath);

    // Optionally limit parsing size for large files
    const maxBufferSize = 1 * 1024 * 1024; // 1MB

    console.log(`Parsing EXIF from buffer (up to ${maxBufferSize} bytes)...`);
    const tags = await exifParser.parseFromNodeBuffer(buffer, maxBufferSize);

    if (tags) {
      console.log("EXIF Data Found:");
      console.log(JSON.stringify(tags, null, 2));
      // Example: Access specific tags
      // console.log("Make:", tags.Make);
      // console.log("DateTimeOriginal:", tags.DateTimeOriginal);
    } else {
      console.log("No EXIF data found or error parsing.");
    }
  } catch (error) {
    console.error(`Error reading or parsing file ${filePath}:`, error);
  }
}

// Replace with the path to your JPEG file
const imagePath = path.join(__dirname, "test", "res", "image.jpg"); // Example path
readExifNode(imagePath);
```

## API Overview

The primary export is an object containing the following functions (typically accessed via `exifParser.`):

- `parse(arrayBuffer, [maxBufferSize])`: The core parsing function accepting an `ArrayBuffer`. Returns a Promise resolving to the EXIF tags object or `false`.
- `parseFromFile(file, [maxBufferSize])`: Helper for parsing browser `File` objects.
- `parseFromUrl(url, [maxBufferSize])`: Helper for parsing from a URL (requires CORS).
- `parseFromNodeBuffer(nodeBuffer, [maxBufferSize])`: Helper for parsing Node.js `Buffer` objects.

Constants like `Tags`, `TiffTags`, `GPSTags`, `StringValues`, and `MakeInfo` are also exported, which can be useful for interpreting the results or extending functionality.

## Attribution

This code is a refactoring and modernization of [exif-js](https://github.com/exif-js/exif-js/tree/master), originally developed by Jacob Seidelin. Original copyright belongs to Jacob Seidelin.

## License

This project is licensed under the [Mozilla Public License 2.0 (MPL 2.0)](https://opensource.org/licenses/MPL-2.0), consistent with the original `exif-js` license.
