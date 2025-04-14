// index.js
import { BinaryReader } from "./binary-reader.js";
import { findEXIFinJPEG } from "./parser.js";
import {
  Tags,
  TiffTags,
  GPSTags,
  StringValues,
  MakeInfo,
} from "./constants.js";

// --- Core Parsing Function ---

/**
 * Parses EXIF data from an ArrayBuffer.
 * @param {ArrayBuffer} arrayBuffer The ArrayBuffer containing the JPEG data.
 * @param {number} [maxBufferSize] Optional limit on how much of the buffer to read (bytes). Useful for large files.
 * @returns {Promise<object | false>} A Promise resolving to the parsed EXIF tags object, or false if no EXIF found or error.
 */
async function parse(arrayBuffer, maxBufferSize) {
  return new Promise((resolve, reject) => {
    if (!(arrayBuffer instanceof ArrayBuffer)) {
      return reject(new Error("Input must be an ArrayBuffer."));
    }
    try {
      const bufferLength =
        maxBufferSize && maxBufferSize > 0
          ? Math.min(arrayBuffer.byteLength, maxBufferSize)
          : arrayBuffer.byteLength;

      const reader = new BinaryReader(arrayBuffer, 0, bufferLength);
      const exifData = findEXIFinJPEG(reader);
      resolve(exifData); // Resolves with tags object or false
    } catch (error) {
      console.error("Error parsing EXIF data:", error);
      resolve(false); // Resolve with false on error as per original style, could reject instead.
      // reject(error); // Alternative: reject on error
    }
  });
}

// --- Helper Functions for Common Inputs ---

/**
 * Fetches an image from a URL and parses its EXIF data.
 * Note: Requires appropriate CORS headers on the server if fetching cross-origin.
 * @param {string} url The URL of the image.
 * @param {number} [maxBufferSize] Optional limit for parsing (bytes). Fetches the whole file regardless.
 * @returns {Promise<object | false>} A Promise resolving to the parsed EXIF tags object, or false.
 */
async function parseFromUrl(url, maxBufferSize) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return await parse(arrayBuffer, maxBufferSize);
  } catch (error) {
    console.error(`Error fetching or parsing URL (${url}):`, error);
    return false;
  }
}

/**
 * Parses EXIF data from a File object (e.g., from <input type="file">).
 * @param {File} file The File object.
 * @param {number} [maxBufferSize] Optional limit for parsing (bytes).
 * @returns {Promise<object | false>} A Promise resolving to the parsed EXIF tags object, or false.
 */
async function parseFromFile(file, maxBufferSize) {
  if (!(typeof File !== "undefined" && file instanceof File)) {
    return Promise.reject(new Error("Input must be a File object."));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        if (!(arrayBuffer instanceof ArrayBuffer)) {
          // Should not happen with readAsArrayBuffer, but check anyway
          return reject(new Error("FileReader did not return ArrayBuffer."));
        }
        const result = await parse(arrayBuffer, maxBufferSize);
        resolve(result);
      } catch (error) {
        console.error("Error processing file data:", error);
        resolve(false); // Resolve false on internal parse error
        // reject(error); // Alternative: reject
      }
    };
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      reject(new Error("Error reading file."));
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses EXIF data from a Node.js Buffer.
 * Requires running in a Node.js environment.
 * @param {Buffer} nodeBuffer The Node.js Buffer object.
 * @param {number} [maxBufferSize] Optional limit for parsing (bytes).
 * @returns {Promise<object | false>} A Promise resolving to the parsed EXIF tags object, or false.
 */
async function parseFromNodeBuffer(nodeBuffer, maxBufferSize) {
  // Basic check for Node Buffer (duck typing)
  if (typeof Buffer === "undefined" || !(nodeBuffer instanceof Buffer)) {
    return Promise.reject(
      new Error(
        "Input must be a Node.js Buffer. Ensure you're in a Node environment."
      )
    );
  }
  // Convert Node Buffer to ArrayBuffer without copying if possible
  // .buffer property gives underlying ArrayBuffer, but might be larger than buffer view.
  // Need slice to get the correct view.
  const arrayBuffer = nodeBuffer.buffer.slice(
    nodeBuffer.byteOffset,
    nodeBuffer.byteOffset + nodeBuffer.byteLength
  );
  return await parse(arrayBuffer, maxBufferSize);
}

// --- Exports ---

export {
  // Core function
  parse,

  // Helper functions
  parseFromUrl,
  parseFromFile,
  parseFromNodeBuffer, // Include if Node support is intended

  // Constants (useful for lookup or understanding tags)
  Tags,
  TiffTags,
  GPSTags,
  StringValues,
  MakeInfo, // Expose MakeInfo if users need deep access/customization

  // Underlying classes/functions (optional, for advanced use)
  // BinaryReader,
  // findEXIFinJPEG
};

// Default export (optional, provides a simple entry point)
export default {
  parse,
  parseFromUrl,
  parseFromFile,
  parseFromNodeBuffer,
  Tags,
  TiffTags,
  GPSTags,
  StringValues,
  MakeInfo,
};
