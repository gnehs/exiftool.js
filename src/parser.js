// parser.js
import { BinaryReader } from "./binary-reader.js";
import {
  Tags,
  TiffTags,
  GPSTags,
  StringValues,
  MakeInfo,
  MakeInfoMap,
} from "./constants.js";
import {
  tidyString,
  sortObjectByKeys,
  isBlank,
  formatSerialNumber,
  intArrayToHexString,
} from "./utils.js";

/**
 * Finds and parses EXIF data within a JPEG file structure.
 * @param {BinaryReader} fileReader A BinaryReader instance for the file data.
 * @returns {object | false} An object containing EXIF tags, or false if no valid EXIF found.
 */
function findEXIFinJPEG(fileReader) {
  // Check for JPEG SOI marker
  if (fileReader.getByteAt(0) !== 0xff || fileReader.getByteAt(1) !== 0xd8) {
    console.error("Not a valid JPEG file.");
    return false;
  }

  let offset = 2;
  const length = fileReader.getLength();
  let exifData = {};

  while (offset < length - 4) {
    // Need at least 4 bytes for marker and length
    // Check for APPn marker prefix
    if (fileReader.getByteAt(offset) !== 0xff) {
      console.error(
        `Invalid JPEG marker found at offset ${offset}: Expected 0xFF, got 0x${fileReader
          .getByteAt(offset)
          .toString(16)}`
      );
      // Attempt to return whatever was found so far, might be partial
      return Object.keys(exifData).length > 0 ? exifData : false;
    }

    const marker = fileReader.getByteAt(offset + 1);
    const markerLength = fileReader.getShortAt(offset + 2, true); // Length includes the 2 bytes for length itself

    // Check if marker length is plausible
    if (markerLength < 2 || offset + 2 + markerLength > length) {
      console.error(
        `Invalid marker length ${markerLength} at offset ${offset}.`
      );
      return Object.keys(exifData).length > 0 ? exifData : false; // Corrupt data likely
    }

    // 0xE1 is APP1 marker (used for EXIF and XMP)
    if (marker === 0xe1) {
      // Check for "Exif" header
      if (fileReader.getStringAt(offset + 4, 4) === "Exif") {
        // Found EXIF data, parse it
        const exifReader = fileReader.slice(offset + 4, markerLength - 2); // Create reader for EXIF segment
        exifData = readEXIFData(exifReader);
        // Normally, we'd stop after finding the primary EXIF block.
        // If you expect EXIF in multiple APP1 segments (uncommon), remove the 'break'.
        // break;
      }
      // Original code had XMP check here, removed for simplicity.
      // else if (fileReader.getStringAt(offset + 4, 28).includes("http://ns.adobe.com/xap/1.0/")) { ... }
    }

    // Move to the next marker
    offset += 2 + markerLength;
  }

  return Object.keys(exifData).length > 0 ? sortObjectByKeys(exifData) : false; // Return sorted data or false
}

/**
 * Reads the EXIF data structure from the APP1 segment.
 * @param {BinaryReader} exifReader BinaryReader for the EXIF data segment (starting after "Exif\0\0").
 * @returns {object} Parsed EXIF tags.
 */
function readEXIFData(exifReader) {
  const tiffHeaderOffset = 6; // "Exif\0\0"

  if (exifReader.getLength() < tiffHeaderOffset + 8) {
    console.error("EXIF segment too short for TIFF header.");
    return {};
  }

  // Check TIFF byte order
  let isBigEndian;
  const byteOrder = exifReader.getShortAt(tiffHeaderOffset);
  if (byteOrder === 0x4949) {
    // "II" Intel byte order (little endian)
    isBigEndian = false;
  } else if (byteOrder === 0x4d4d) {
    // "MM" Motorola byte order (big endian)
    isBigEndian = true;
  } else {
    console.error(
      `Invalid TIFF byte order marker: 0x${byteOrder.toString(16)}`
    );
    return {};
  }

  // Check TIFF magic number (0x002A)
  if (exifReader.getShortAt(tiffHeaderOffset + 2, isBigEndian) !== 0x002a) {
    console.error("Invalid TIFF magic number.");
    return {};
  }

  // Get offset to first IFD (Image File Directory)
  const firstIFDOffset = exifReader.getLongAt(
    tiffHeaderOffset + 4,
    isBigEndian
  );
  if (firstIFDOffset < 8 || firstIFDOffset >= exifReader.getLength()) {
    console.error(`Invalid first IFD offset: ${firstIFDOffset}`);
    return {}; // Offset points outside the EXIF segment or within header
  }

  // Read IFD0 (Primary Image Data)
  const tiffTags = readIFD(
    exifReader,
    tiffHeaderOffset,
    firstIFDOffset,
    TiffTags,
    isBigEndian
  );

  let allTags = { ...tiffTags.tags };
  let nextIFDOffset = tiffTags.nextIFDOffset;

  // Read Exif SubIFD if pointer exists
  if (allTags.ExifIFDPointer) {
    const exifTags = readIFD(
      exifReader,
      tiffHeaderOffset,
      allTags.ExifIFDPointer,
      Tags,
      isBigEndian
    );
    // Merge tags, prioritizing specific EXIF tags over generic TIFF tags if conflict
    Object.assign(allTags, exifTags.tags);
  }

  // Read GPS Info IFD if pointer exists
  if (allTags.GPSInfoIFDPointer) {
    const gpsTags = readIFD(
      exifReader,
      tiffHeaderOffset,
      allTags.GPSInfoIFDPointer,
      GPSTags,
      isBigEndian
    );
    Object.assign(allTags, gpsTags.tags);
  }

  // Read Interoperability IFD if pointer exists (often nested in ExifIFD)
  if (allTags.InteroperabilityIFDPointer) {
    const interopTags = readIFD(
      exifReader,
      tiffHeaderOffset,
      allTags.InteroperabilityIFDPointer,
      Tags,
      isBigEndian
    ); // Re-use 'Tags' for common fields
    Object.assign(allTags, interopTags.tags);
  }

  // Read subsequent IFDs (e.g., for thumbnails), IFD1
  // Note: The original code didn't explicitly read IFD1+ for tags other than thumbnail offset/length.
  // We'll follow that for now, but a full implementation might need to traverse this linked list.
  /*
  if (nextIFDOffset) {
      const ifd1Tags = readIFD(exifReader, tiffHeaderOffset, nextIFDOffset, TiffTags, isBigEndian);
      // Decide how to merge thumbnail tags if needed. Usually handled separately.
      // allTags.Thumbnail = ifd1Tags.tags; // Example
      nextIFDOffset = ifd1Tags.nextIFDOffset;
  }
  */

  // Process MakerNote if present
  if (allTags.MakerNoteIFDPointer && allTags.Make) {
    processMakerNote(exifReader, tiffHeaderOffset, allTags, isBigEndian);
  }

  // Final cleanup and formatting
  allTags = formatTagValues(allTags);
  return tidyAndSort(allTags);
}

/**
 * Reads an Image File Directory (IFD).
 * @param {BinaryReader} fileReader Reader for the entire TIFF structure (starting at "Exif\0\0").
 * @param {number} tiffStartOffset Offset of the TIFF header ('II' or 'MM') within fileReader.
 * @param {number} dirStartOffset Offset of this IFD relative to tiffStartOffset.
 * @param {object} tagSet The set of tags to look for (e.g., TiffTags, Tags, GPSTags).
 * @param {boolean} isBigEndian True if data is big-endian.
 * @param {number} [makerNoteOffsetBase=0] Additional offset base for MakerNotes.
 * @param {number} [makerNoteHeaderSize=0] Header size before tags in MakerNotes.
 * @returns {{tags: object, nextIFDOffset: number}} Object containing tags and the offset to the next IFD.
 */
function readIFD(
  fileReader,
  tiffStartOffset,
  dirStartOffset,
  tagSet,
  isBigEndian,
  makerNoteOffsetBase = 0,
  makerNoteHeaderSize = 0
) {
  const absoluteDirStart = tiffStartOffset + dirStartOffset;
  const entryCount = fileReader.getShortAt(
    absoluteDirStart + makerNoteHeaderSize,
    isBigEndian
  );
  const tags = {};
  const entriesStartOffset = absoluteDirStart + makerNoteHeaderSize + 2;
  const entryLength = 12; // Each IFD entry is 12 bytes

  // Safety check for entry count
  if (
    entryCount * entryLength + 4 >
    fileReader.getLength() - entriesStartOffset
  ) {
    console.warn(
      `IFD entry count ${entryCount} seems too large for available data at offset ${absoluteDirStart}. Reading cautiously.`
    );
    // Avoid reading potentially huge number of entries if count is corrupt
    // Limit entry count based on available data size
    const maxPossibleEntries = Math.floor(
      (fileReader.getLength() - entriesStartOffset - 4) / entryLength
    );
    if (entryCount > maxPossibleEntries) {
      console.error(
        `Corrected entry count from ${entryCount} to ${maxPossibleEntries}`
      );
      entryCount = maxPossibleEntries;
    }
  }

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = entriesStartOffset + i * entryLength;
    if (entryOffset + entryLength > fileReader.getLength()) {
      console.warn(
        `Stopping IFD read early: entry ${
          i + 1
        }/${entryCount} goes out of bounds.`
      );
      break; // Stop if reading this entry would go past the end of the reader's data
    }

    const tagId = fileReader.getShortAt(entryOffset, isBigEndian);
    const tagName = tagSet[tagId];

    if (tagName) {
      try {
        tags[tagName] = readTagValue(
          fileReader,
          entryOffset,
          tiffStartOffset,
          isBigEndian,
          makerNoteOffsetBase,
          dirStartOffset // Pass IFD start for IFD pointer calculation
        );
      } catch (e) {
        console.warn(
          `Error reading tag ${tagName} (0x${tagId.toString(16)}):`,
          e.message
        );
      }
    }
    // else { console.log(`Unknown tag ID: 0x${tagId.toString(16)} in IFD at offset ${dirStartOffset}`); }
  }

  // Get offset to the next IFD
  const nextIFDOffsetPtr = entriesStartOffset + entryCount * entryLength;
  let nextIFDOffset = 0;
  if (nextIFDOffsetPtr + 4 <= fileReader.getLength()) {
    nextIFDOffset = fileReader.getLongAt(nextIFDOffsetPtr, isBigEndian);
  } else {
    console.warn("Could not read next IFD offset pointer: out of bounds.");
  }

  return { tags, nextIFDOffset };
}

/**
 * Reads the value of a single tag from an IFD entry.
 * @param {BinaryReader} fileReader Reader for the entire TIFF structure.
 * @param {number} entryOffset Offset of the start of the 12-byte IFD entry.
 * @param {number} tiffStartOffset Offset of the TIFF header ('II' or 'MM') within fileReader.
 * @param {boolean} isBigEndian True if data is big-endian.
 * @param {number} [makerNoteOffsetBase=0] Additional offset base for MakerNotes.
 * @param {number} [dirStartOffset=0] Start offset of the current IFD (needed for IFD pointers).
 * @returns {*} The parsed tag value.
 */
function readTagValue(
  fileReader,
  entryOffset,
  tiffStartOffset,
  isBigEndian,
  makerNoteOffsetBase = 0,
  dirStartOffset = 0
) {
  const type = fileReader.getShortAt(entryOffset + 2, isBigEndian);
  const numValues = fileReader.getLongAt(entryOffset + 4, isBigEndian);
  const valueOffsetBytes = entryOffset + 8; // Location of value or pointer to value

  // Calculate total bytes needed for the value based on type
  let valueBytes = 0;
  switch (type) {
    case 1: // BYTE (8-bit unsigned)
    case 2: // ASCII (8-bit byte)
    case 6: // SBYTE (8-bit signed)
    case 7: // UNDEFINED (8-bit byte)
      valueBytes = numValues;
      break;
    case 3: // SHORT (16-bit unsigned)
    case 8: // SSHORT (16-bit signed)
      valueBytes = numValues * 2;
      break;
    case 4: // LONG (32-bit unsigned)
    case 9: // SLONG (32-bit signed)
    case 11: // FLOAT (32-bit)
    case 13: // IFD Pointer (32-bit unsigned)
      valueBytes = numValues * 4;
      break;
    case 5: // RATIONAL (2x LONG unsigned)
    case 10: // SRATIONAL (2x SLONG signed)
      valueBytes = numValues * 8;
      break;
    case 12: // DOUBLE (64-bit)
      valueBytes = numValues * 8;
      break;
    default:
      throw new Error(`Unknown TIFF tag type: ${type}`);
  }

  let valuePtr;
  // If the value fits within 4 bytes, it's stored directly in the offset bytes.
  // Otherwise, the offset bytes contain a pointer relative to tiffStartOffset.
  if (valueBytes > 4) {
    valuePtr = fileReader.getLongAt(valueOffsetBytes, isBigEndian);
    valuePtr += tiffStartOffset + makerNoteOffsetBase; // Absolute position in fileReader
    // Sanity check pointer
    if (valuePtr < 0 || valuePtr + valueBytes > fileReader.getLength()) {
      throw new Error(
        `Tag value pointer 0x${(
          valuePtr -
          tiffStartOffset -
          makerNoteOffsetBase
        ).toString(
          16
        )} (abs: ${valuePtr}) + ${valueBytes} bytes out of bounds (length: ${fileReader.getLength()}). Type=${type}, Num=${numValues}`
      );
    }
  } else {
    valuePtr = valueOffsetBytes; // Value is stored directly here
  }

  // Read the actual value(s)
  const vals = [];
  for (let i = 0; i < numValues; i++) {
    let elementOffset = valuePtr;
    switch (type) {
      case 1: // BYTE
        elementOffset = valueBytes > 4 ? valuePtr + i : valuePtr + i;
        vals.push(fileReader.getByteAt(elementOffset));
        break;
      case 2: // ASCII String
        // Handled separately below as it reads the whole block
        break;
      case 3: // SHORT
        elementOffset = valueBytes > 4 ? valuePtr + i * 2 : valuePtr + i * 2;
        vals.push(fileReader.getShortAt(elementOffset, isBigEndian));
        break;
      case 4: // LONG
        elementOffset = valuePtr + i * 4;
        vals.push(fileReader.getLongAt(elementOffset, isBigEndian));
        break;
      case 5: // RATIONAL (unsigned)
        elementOffset = valuePtr + i * 8;
        const num = fileReader.getLongAt(elementOffset, isBigEndian);
        const den = fileReader.getLongAt(elementOffset + 4, isBigEndian);
        vals.push(den === 0 ? 0 : num / den); // Avoid division by zero
        break;
      case 6: // SBYTE
        elementOffset = valueBytes > 4 ? valuePtr + i : valuePtr + i;
        vals.push(fileReader.getSByteAt(elementOffset));
        break;
      case 7: // UNDEFINED
        // Treat as byte array, might need specific interpretation later
        elementOffset = valueBytes > 4 ? valuePtr + i : valuePtr + i;
        vals.push(fileReader.getByteAt(elementOffset));
        break;
      case 8: // SSHORT
        elementOffset = valueBytes > 4 ? valuePtr + i * 2 : valuePtr + i * 2;
        vals.push(fileReader.getSShortAt(elementOffset, isBigEndian));
        break;
      case 9: // SLONG
        elementOffset = valuePtr + i * 4;
        vals.push(fileReader.getSLongAt(elementOffset, isBigEndian));
        break;
      case 10: // SRATIONAL
        elementOffset = valuePtr + i * 8;
        const sNum = fileReader.getSLongAt(elementOffset, isBigEndian);
        const sDen = fileReader.getSLongAt(elementOffset + 4, isBigEndian);
        vals.push(sDen === 0 ? 0 : sNum / sDen); // Avoid division by zero
        break;
      // FLOAT (11) and DOUBLE (12) were not in original, would need DataView getFloat32/64
      case 13: // IFD Pointer
        elementOffset = valuePtr + i * 4;
        // The value is an offset relative to tiffStartOffset
        vals.push(fileReader.getLongAt(elementOffset, isBigEndian));
        break;
      default: // Should have been caught earlier
        console.warn(`Unhandled tag type ${type} in readTagValue`);
        return null;
    }
    if (type === 2) break; // ASCII handled below
  }

  // Handle ASCII strings specifically (read the whole block)
  if (type === 2) {
    // Ensure numValues includes the null terminator if present, but don't read past buffer end
    const readLength = Math.min(numValues, fileReader.getLength() - valuePtr);
    const asciiString = fileReader.getStringAt(valuePtr, readLength);
    // Remove null terminator and potentially trailing spaces (common issue)
    return asciiString.replace(/\0.*/, "").trimEnd();
  }

  // Return single value if only one, otherwise the array
  return numValues === 1 ? vals[0] : vals;
}

/**
 * Processes the MakerNote tag if found.
 * @param {BinaryReader} fileReader Reader for the entire TIFF structure.
 * @param {number} tiffStartOffset Offset of the TIFF header within fileReader.
 * @param {object} allTags The object holding all parsed tags so far (will be modified).
 * @param {boolean} isTiffBigEndian The endianness of the main TIFF structure.
 */
function processMakerNote(
  fileReader,
  tiffStartOffset,
  allTags,
  isTiffBigEndian
) {
  const makerNotePointer = allTags.MakerNoteIFDPointer; // This is relative to tiffStartOffset
  const make = String(allTags.Make || "")
    .toUpperCase()
    .trim();
  const model = String(allTags.Model || "")
    .toUpperCase()
    .trim(); // Sometimes needed too

  const makeInfo = MakeInfoMap[make] || findMakeInfoHeuristically(make, model);

  if (!makeInfo) {
    console.warn(`No specific MakeInfo found for Make: ${allTags.Make}`);
    // Could attempt a generic read here, but offsets are often problematic without info
    // We might read the first few bytes as a header guess:
    try {
      const genericMakerNoteReader = fileReader.slice(
        tiffStartOffset + makerNotePointer
      );
      allTags.MakerNote = readRawMakerNoteData(genericMakerNoteReader); // Store as raw bytes/string
    } catch (e) {
      console.warn("Failed to read generic MakerNote data:", e.message);
    }
    return;
  }

  let makerNoteEndianess = isTiffBigEndian; // Default to TIFF endianness

  // --- Determine MakerNote specifics (Endianness, Header, Offset Base) ---
  let makerNoteHeaderSize = makeInfo.DefaultHeaderSize || 0;
  let makerNoteOffsetBase = 0; // Offset relative to tiffStartOffset

  // Check for specific header string to determine size/offsets
  // Read potential header (e.g., "Nikon", "OLYMP", "FUJIFILM", "Panasoni")
  let headerString = "";
  const maxHeaderGuess = 12; // Check up to 12 bytes for a known header
  try {
    headerString = fileReader.getStringAt(
      tiffStartOffset + makerNotePointer,
      Math.min(
        maxHeaderGuess,
        fileReader.getLength() - (tiffStartOffset + makerNotePointer)
      )
    );
  } catch (e) {
    console.warn("Could not read MakerNote header string:", e.message);
    return; // Cannot proceed without header if needed
  }

  // Find matching header key in MakeInfo.HeaderSize
  let foundHeaderKey = null;
  if (makeInfo.HeaderSize) {
    for (const key in makeInfo.HeaderSize) {
      if (headerString.startsWith(key)) {
        makerNoteHeaderSize = makeInfo.HeaderSize[key];
        foundHeaderKey = key;
        break;
      }
    }
  }

  // Determine Endianness based on MakeInfo rules
  if (makeInfo.MakerNoteByteAlign) {
    makerNoteEndianess = makeInfo.MakerNoteByteAlign === 0x4d4d;
  } else if (makeInfo.MakerNoteByteAlignHeaderOffset !== undefined) {
    const alignOffset =
      tiffStartOffset +
      makerNotePointer +
      makeInfo.MakerNoteByteAlignHeaderOffset;
    if (alignOffset + 2 <= fileReader.getLength()) {
      const byteAlign = fileReader.getShortAt(alignOffset);
      if (byteAlign === 0x4949) makerNoteEndianess = false;
      else if (byteAlign === 0x4d4d) makerNoteEndianess = true;
      // else keep default
    }
  }

  // Determine Offset Base (relative to tiffStartOffset or MakerNote start)
  if (
    makeInfo.UseMakernoteOffsetAsBase &&
    foundHeaderKey &&
    makeInfo.UseMakernoteOffsetAsBase[foundHeaderKey]
  ) {
    makerNoteOffsetBase = makerNotePointer; // Offsets inside are relative to MakerNote start
  }
  // else: offsets are relative to tiffStartOffset (default behavior)

  // Adjust offset base further if needed (e.g., Nikon)
  if (
    makeInfo.AdjustOffsetBase &&
    foundHeaderKey &&
    makeInfo.AdjustOffsetBase[foundHeaderKey]
  ) {
    makerNoteOffsetBase += makeInfo.AdjustOffsetBase[foundHeaderKey];
  }

  // Apply offset fix calculation if needed (e.g., Pentax, or OffsetSchema tag)
  // Note: The original calculateOffsetBase logic was complex and potentially fragile.
  // A simple implementation might be needed if FixMakernotesOffset is true,
  // or just rely on the structure parsing correctly with the determined base.
  // For simplicity, we'll skip the complex offset calculation for now.
  // if (makeInfo.FixMakernotesOffset || allTags.OffsetSchema) { ... }

  // --- Read MakerNote Tags ---
  try {
    let makerNoteTags = {};

    if (makeInfo.SerialFoundAtStartOfMakerNotes) {
      // Read serial directly from start (e.g., Kodak)
      const serialLength = 16; // Guess typical length
      const serial = tidyString(
        fileReader.getStringAt(tiffStartOffset + makerNotePointer, serialLength)
      );
      if (
        !makeInfo.InvalidSerialStart ||
        !serial.startsWith(makeInfo.InvalidSerialStart)
      ) {
        if (
          makeInfo.MinimumBelievableLength &&
          serial.length >= makeInfo.MinimumBelievableLength
        ) {
          makerNoteTags.SerialNumber = serial; // Assume it's the body serial
        } else if (!makeInfo.MinimumBelievableLength) {
          makerNoteTags.SerialNumber = serial;
        }
      }
    } else if (makeInfo.MakerNoteTags) {
      // Read as a standard IFD structure
      const ifdResult = readIFD(
        fileReader,
        tiffStartOffset,
        makerNotePointer, // Directory starts here
        makeInfo.MakerNoteTags,
        makerNoteEndianess,
        makerNoteOffsetBase,
        makerNoteHeaderSize
      );
      makerNoteTags = ifdResult.tags;

      // Handle nested IFDs for serials (e.g., Olympus EquipmentIFD)
      if (makeInfo.SerialWithinIFD && makerNoteTags[makeInfo.SerialWithinIFD]) {
        const serialIFDPointer = makerNoteTags[makeInfo.SerialWithinIFD];
        if (typeof serialIFDPointer === "number" && serialIFDPointer > 0) {
          const serialIFDResult = readIFD(
            fileReader,
            tiffStartOffset,
            serialIFDPointer, // Use the pointer found
            makeInfo.SerialWithinIFDTags,
            makerNoteEndianess,
            makerNoteOffsetBase, // Assuming same base applies
            makeInfo.SerialWithinIFDHeaderSize || 0
          );
          // Merge serial tags, prioritizing nested ones if names clash
          Object.assign(makerNoteTags, serialIFDResult.tags);
        }
      }

      // Handle serials within arrays (e.g., Pentax CameraInfo)
      if (
        makeInfo.InternalSerialWithinIFDArray &&
        makerNoteTags[makeInfo.InternalSerialWithinIFDArray]
      ) {
        const infoArray = makerNoteTags[makeInfo.InternalSerialWithinIFDArray];
        const serialIndex = makeInfo.InternalSerialWithinIFDArrayElement;
        if (Array.isArray(infoArray) && serialIndex < infoArray.length) {
          // Assume the tag name for this specific serial is 'InternalSerialNumber'
          makerNoteTags.InternalSerialNumber = infoArray[serialIndex];
        }
      }
    } else {
      // If no MakerNoteTags defined, maybe try reading as raw data?
      const makerNoteReader = fileReader.slice(
        tiffStartOffset + makerNotePointer
      );
      allTags.MakerNote = readRawMakerNoteData(makerNoteReader);
    }

    // Merge MakerNote tags into allTags, formatting serials
    for (const tag in makerNoteTags) {
      if (
        tag === "SerialNumber" ||
        tag === "InternalSerialNumber" ||
        tag === "LensSerialNumber"
      ) {
        const formattedSerial = formatSerialNumber(
          allTags,
          makerNoteTags[tag],
          tag === "SerialNumber"
        );
        if (!isBlank(formattedSerial)) {
          // Check minimum length if specified by MakeInfo
          if (
            makeInfo.MinimumBelievableLength &&
            formattedSerial.length < makeInfo.MinimumBelievableLength
          ) {
            // Ignore serial if too short
          } else {
            // Avoid overwriting existing, potentially better formatted serials from standard EXIF/TIFF
            if (isBlank(allTags[tag])) {
              allTags[tag] = formattedSerial;
            }
          }
        }
      } else {
        // Merge other MakerNote tags, avoiding overwrite if already exists from standard IFDs
        if (typeof allTags[tag] === "undefined") {
          allTags[tag] = makerNoteTags[tag];
        }
      }
    }
  } catch (e) {
    console.warn(`Error processing MakerNote for ${allTags.Make}:`, e.message);
    // Attempt to store raw MakerNote data on error?
    try {
      const makerNoteReader = fileReader.slice(
        tiffStartOffset + makerNotePointer
      );
      allTags.MakerNote = readRawMakerNoteData(makerNoteReader); // Store raw bytes on failure
    } catch (rawReadError) {
      console.warn(
        "Could not read raw MakerNote data after parse error:",
        rawReadError.message
      );
    }
  }
}

/**
 * Tries to find MakeInfo if the exact Make string wasn't found.
 * @param {string} make Upper case Make string.
 * @param {string} model Upper case Model string.
 * @returns {object | null} Found MakeInfo or null.
 */
function findMakeInfoHeuristically(make, model) {
  // Simple heuristic: Check if Make contains a known key
  for (const key in MakeInfoMap) {
    if (make.includes(key)) {
      return MakeInfoMap[key];
    }
  }
  // Could add more heuristics based on model name etc. if needed
  return null;
}

/**
 * Reads some initial bytes of MakerNote as potential fallback data.
 * @param {BinaryReader} makerNoteReader Reader starting at the MakerNote data.
 * @returns {string} Hex representation of first ~64 bytes.
 */
function readRawMakerNoteData(makerNoteReader) {
  const maxBytes = Math.min(64, makerNoteReader.getLength());
  const bytes = [];
  for (let i = 0; i < maxBytes; i++) {
    bytes.push(makerNoteReader.getByteAt(i));
  }
  return `Raw Hex: ${intArrayToHexString(bytes)}${
    maxBytes < makerNoteReader.getLength() ? "..." : ""
  }`;
}

/**
 * Applies string lookups and type formatting to tag values.
 * @param {object} tags The raw tags object.
 * @returns {object} The formatted tags object.
 */
function formatTagValues(tags) {
  const formatted = {};
  for (const tagName in tags) {
    if (!tags.hasOwnProperty(tagName)) continue;

    let value = tags[tagName];
    const stringValuesMap = StringValues[tagName];

    // Apply string lookups
    if (stringValuesMap) {
      if (Array.isArray(value)) {
        // Apply lookup to each element if it's an array
        value = value.map((v) =>
          stringValuesMap[v] !== undefined ? stringValuesMap[v] : v
        );
      } else {
        value =
          stringValuesMap[value] !== undefined ? stringValuesMap[value] : value;
      }
    }

    // Specific formatting based on tag name
    switch (tagName) {
      case "ExifVersion":
      case "FlashpixVersion":
        if (Array.isArray(value) && value.length >= 4) {
          value = String.fromCharCode(value[0], value[1], value[2], value[3]);
        } else if (typeof value === "number") {
          // Sometimes read as LONG, convert back to chars
          value = String.fromCharCode(
            (value >> 24) & 0xff,
            (value >> 16) & 0xff,
            (value >> 8) & 0xff,
            value & 0xff
          );
        }
        break;
      case "ComponentsConfiguration":
        if (Array.isArray(value)) {
          value = value
            .map((v) => StringValues.ComponentsConfiguration[v] || "?")
            .join("");
        }
        break;
      case "GPSVersionID":
        if (Array.isArray(value)) {
          value = value.join(".");
        }
        break;
      case "DateTime":
      case "DateTimeOriginal":
      case "CreateDate": // ModifyDate is alias for DateTime
        // Basic validation/cleanup for date strings
        if (typeof value === "string") {
          value = value.replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3 "); // Replace YYYY:MM:DD
          value = value.trim();
        }
        break;
      case "FocalLength":
        if (typeof value === "number") value = `${value} mm`;
        break;
      case "ImageUniqueID":
        if (Array.isArray(value)) {
          value = intArrayToHexString(value);
        }
        break;
      // Add more specific formatting as needed...
    }

    formatted[tagName] = value;
  }
  return formatted;
}

/**
 * Final cleanup (tidy strings) and sorting of tags.
 * @param {object} tags Formatted tags object.
 * @returns {object} Cleaned and sorted tags object.
 */
function tidyAndSort(tags) {
  const tidyData = {};
  for (const key in tags) {
    if (tags.hasOwnProperty(key)) {
      // Apply final string tidying, except for complex objects/arrays perhaps
      // Though tidyString handles non-strings gracefully now.
      tidyData[key] = tidyString(tags[key]);
      // Remove blank values after tidying? Optional.
      // if (isBlank(tidyData[key])) {
      //     delete tidyData[key];
      // }
    }
  }
  return sortObjectByKeys(tidyData);
}

// Export the main parsing function for JPEG data
export { findEXIFinJPEG };
