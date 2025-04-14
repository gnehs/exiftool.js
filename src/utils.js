// utils.js
// Utility functions for EXIF data processing.

/**
 * Checks if a value is null, undefined, or its string representation consists only of whitespace.
 * @param {*} value The value to check.
 * @returns {boolean} True if the value is considered blank, false otherwise.
 */
export function isBlank(value) {
  if (value === null || typeof value === "undefined") {
    return true;
  }
  // Convert potential non-strings (like numbers 0) safely before testing
  const str = String(value);
  return /^\s*$/.test(str);
}

/**
 * Sorts the properties of an object alphabetically by key.
 * Returns a new object with sorted keys. Does not modify the input object.
 * @param {object} inputObject The object to sort.
 * @returns {object} A new object with keys sorted alphabetically, or the original input if not a valid object.
 */
export function sortObjectByKeys(inputObject) {
  // Ensure it's a non-null object before proceeding
  if (
    !inputObject ||
    typeof inputObject !== "object" ||
    Array.isArray(inputObject)
  ) {
    return inputObject; // Return as is if not a sortable object
  }
  const keys = Object.keys(inputObject).sort();
  const outputObject = {};
  for (const key of keys) {
    outputObject[key] = inputObject[key];
  }
  return outputObject;
}

/**
 * Left-pads a string or number (converted to string) with a specified character
 * until it reaches the desired length.
 * @param {string | number} input The input value to pad.
 * @param {string} padChar The character used for padding (should be a single character).
 * @param {number} length The target total length of the resulting string.
 * @returns {string} The left-padded string.
 */
export function padLeft(input, padChar, length) {
  let str = String(input);
  // Ensure padChar is a single character, default to ' ' if not or empty
  const padding =
    typeof padChar === "string" && padChar.length === 1 ? padChar : " ";
  while (str.length < length) {
    str = padding + str;
  }
  return str;
}

/**
 * Converts an array of byte values (numbers 0-255) to a hexadecimal string.
 * Handles cases where the input might already be a string or not an array.
 * @param {number[] | string} arrayOfInts Array of numbers (0-255) or potentially already a string.
 * @returns {string} The hex string (e.g., "ab01ef"). Returns input if already a string, or empty string for invalid input.
 */
export function intArrayToHexString(arrayOfInts) {
  if (typeof arrayOfInts === "string") {
    return arrayOfInts; // Assume it's already formatted if it's a string
  }
  if (!Array.isArray(arrayOfInts)) {
    console.warn("intArrayToHexString received non-array input:", arrayOfInts);
    return ""; // Return empty string for non-array inputs
  }
  let response = "";
  for (const byte of arrayOfInts) {
    // Ensure the item is a number within the byte range
    if (typeof byte === "number" && byte >= 0 && byte <= 255) {
      response += padLeft(byte.toString(16), "0", 2);
    } else {
      // Handle non-byte values in the array - represent as "??" or skip?
      // Skipping might be safer to avoid corrupting the hex string.
      console.warn("Non-byte value found in intArrayToHexString:", byte);
      // response += '??'; // Alternative: indicate invalid byte
    }
  }
  return response;
}

/**
 * Cleans up a string value derived from EXIF data.
 * - Converts input to string.
 * - Removes characters generally considered non-printable or problematic in standard ASCII/Latin-1 contexts,
 *   while trying to preserve common symbols and punctuation.
 * - Trims leading/trailing whitespace.
 * - Replaces common placeholder strings like "undefined" or "unknown" (case-insensitive) with an empty string.
 * @param {*} value Input value (will be converted to string).
 * @returns {string} The cleaned string. Returns empty string if input is null or undefined.
 */
export function tidyString(value) {
  if (value === null || typeof value === "undefined") {
    return "";
  }
  let str = String(value);

  // Regular expression to keep:
  // \w: Word characters (letters, numbers, underscore)
  // \s: Whitespace characters
  // !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~©: Common punctuation and symbols (add more if needed)
  // Adjust this regex based on desired character preservation.
  // This tries to remove control characters and uncommon symbols.
  str = str.replace(/[^\w\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~©]/g, "");

  str = str.trim(); // Trim leading/trailing whitespace

  // Check for common placeholder values (case-insensitive)
  const lowerStr = str.toLowerCase();
  if (
    lowerStr === "undefined" ||
    lowerStr === "unknown" ||
    lowerStr === "(unknown)"
  ) {
    str = "";
  }
  return str;
}

/**
 * Formats a serial number based on the camera make found in the EXIF tags.
 * This function applies make-specific heuristics and cleaning.
 * @param {object} tags All parsed tags object (must contain 'Make' property for make-specific logic).
 * @param {string | number[]} serial The raw serial number value (can be string or array of char codes).
 * @param {boolean} [isBodySerial=false] Flag indicating if this is the primary body serial number tag (e.g., EXIF BodySerialNumber or MakerNote SerialNumber). Used for some make-specific logic.
 * @returns {string} The formatted and cleaned serial number string. Returns empty string if input is blank or formatting fails.
 */
export function formatSerialNumber(tags, serial, isBodySerial = false) {
  // 1. Convert input serial to a workable string format
  let rawStringSerial = "";
  if (typeof serial === "string") {
    rawStringSerial = serial;
  } else if (Array.isArray(serial)) {
    try {
      // Attempt to convert array of numbers (char codes) to string
      rawStringSerial = serial
        .map((c) =>
          typeof c === "number" && c >= 0 ? String.fromCharCode(c) : ""
        )
        .join("");
    } catch (e) {
      console.warn("Error converting serial array to string:", e);
      rawStringSerial = String(serial); // Fallback to simple string conversion
    }
  } else if (serial !== null && typeof serial !== "undefined") {
    rawStringSerial = String(serial); // Convert other types (like numbers)
  }

  // 2. Basic cleanup using tidyString
  let returnSerial = tidyString(rawStringSerial);
  if (isBlank(returnSerial)) {
    return ""; // Return early if blank after initial cleanup
  }

  // 3. Apply Make-specific formatting heuristics
  const make = tags?.Make ? String(tags.Make).toUpperCase().trim() : "";

  // --- Canon ---
  if (make.includes("CANON")) {
    if (isBodySerial) {
      // Canon serials are often numeric. Padding rules depend on model/era.
      // Original code checked SerialNumberFormat tag (0x0015 in Canon MakerNote).
      // Without parsing that tag deeply, we rely on heuristics.
      if (/^\d+$/.test(returnSerial)) {
        // Check if purely numeric
        // Common modern lengths are 10 or 12. Older might be 6.
        // This is a rough guess. Real formatting can be complex.
        if (returnSerial.length > 6 && returnSerial.length < 10) {
          returnSerial = padLeft(returnSerial, "0", 10);
        } else if (returnSerial.length <= 6 && returnSerial.length > 0) {
          // Pad shorter numeric serials (potentially very old models)
          returnSerial = padLeft(returnSerial, "0", 6);
        }
        // Leave longer numbers (e.g., 12 digits) as is for now.
      }
      // Non-numeric Canon serials? Less common for body, might exist. Leave as is.
    }
  }
  // --- Fujifilm ---
  else if (make.includes("FUJIFILM")) {
    // Original Fujifilm logic parsed a complex structure including date.
    // "SERIALPART YYYY:MM:DD OTHERPART"
    // This is fragile and format varies. A simple approach is often better.
    // We might just return the tidied string unless a very specific, known format is detected.
    // Example check (highly specific, likely needs adjustment):
    // if (/^.{12}\d{10}.{12}$/.test(returnSerial)) { /* parse date */ }
    // For now, just return the cleaned string.
    // returnSerial = parseFujifilmSerial(returnSerial); // Requires custom implementation
  }
  // --- Panasonic ---
  else if (make.includes("PANASONIC")) {
    // Original code parsed date from specific byte positions assuming array input.
    // Check if the original input was an array and has expected length (e.g., 13 bytes for "(XXX) YYYY:MM:DD No. NNNN" format)
    if (Array.isArray(serial) && serial.length >= 13) {
      try {
        // Extract parts assuming specific byte positions
        const prefix = String.fromCharCode(serial[0], serial[1], serial[2]);
        const year = String.fromCharCode(serial[3], serial[4]);
        const month = String.fromCharCode(serial[5], serial[6]);
        const day = String.fromCharCode(serial[7], serial[8]);
        const num = String.fromCharCode(
          serial[9],
          serial[10],
          serial[11],
          serial[12]
        );

        // Validate extracted date parts
        const iYear = parseInt(year, 10);
        const iMonth = parseInt(month, 10);
        const iDay = parseInt(day, 10);

        if (
          !isNaN(iYear) &&
          !isNaN(iMonth) &&
          !isNaN(iDay) &&
          iYear >= 0 &&
          iYear <= 99 && // Year is 2 digits
          iMonth >= 1 &&
          iMonth <= 12 &&
          iDay >= 1 &&
          iDay <= 31 &&
          /^\d{4}$/.test(num) && // Check if num part looks like 4 digits
          /^[A-Z0-9]+$/.test(prefix) // Check if prefix is somewhat valid
        ) {
          // Format into readable string
          returnSerial = `(${prefix}) 20${year}:${month}:${day} no. ${num}`;
        } else {
          // If validation fails, fallback to the tidied string version of the raw data
          returnSerial = tidyString(
            serial.map((c) => String.fromCharCode(c)).join("")
          );
        }
      } catch (e) {
        // On error during conversion, fallback to tidied string
        console.warn("Error parsing Panasonic serial structure:", e);
        returnSerial = tidyString(
          serial.map((c) => String.fromCharCode(c)).join("")
        );
      }
    } else {
      // If not an array or wrong length, just use the already tidied string
      // returnSerial = returnSerial; // No change needed
    }
  }
  // --- Pentax / Asahi ---
  else if (make.includes("PENTAX") || make.includes("ASAHI")) {
    // Pentax serials are often claimed to be 7-digit numeric.
    // Original code cleared it if not exactly 7 digits. Let's be less strict.
    if (/^\d+$/.test(returnSerial)) {
      // If it's purely numeric, keep it. Maybe log if length is unusual?
      // if (returnSerial.length !== 7) console.warn("Pentax numeric serial length is not 7:", returnSerial);
    } else {
      // If it contains non-digits, keep it as is after tidying.
    }
    // If it was blank initially, it remains blank.
  }
  // --- Sony ---
  else if (make.includes("SONY")) {
    // Sony serials can be complex. Often numeric, varying lengths.
    // Some models might have alphanumeric serials.
    // No simple universal rule. Just return the tidied string for now.
  }

  // Add other make-specific formatting rules here...

  // 4. Final trim and return
  return returnSerial.trim();
}
