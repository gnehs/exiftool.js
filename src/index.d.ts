// index.d.ts

// Import Buffer type for Node.js specific function
// Use `/// <reference types="node" />` for broader compatibility if not using moduleResolution: "nodenext" or similar
import { Buffer } from "node:buffer";

/**
 * Represents the possible types for a parsed EXIF tag value.
 */
export type ExifTagValue =
  | string
  | number
  | number[]
  | string[]
  | null
  | undefined;

/**
 * Represents the successfully parsed EXIF data object.
 * It's a dictionary where keys are tag names (string) and values are of type ExifTagValue.
 */
export interface ParsedExifData {
  [tagName: string]: ExifTagValue;
}

/**
 * Core parsing function. Reads EXIF data from an ArrayBuffer.
 * @param arrayBuffer The ArrayBuffer containing the JPEG data.
 * @param maxBufferSize Optional limit on how much of the buffer to read (bytes). Useful for large files.
 * @returns A Promise resolving to the parsed EXIF tags object, or `false` if no valid EXIF found or an error occurs during parsing.
 */
export declare function parse(
  arrayBuffer: ArrayBuffer,
  maxBufferSize?: number
): Promise<ParsedExifData | false>;

/**
 * Helper function to parse EXIF data from a File object (typically from `<input type="file">`).
 * @param file The File object.
 * @param maxBufferSize Optional limit for parsing (bytes).
 * @returns A Promise resolving to the parsed EXIF tags object, or `false`.
 */
export declare function parseFromFile(
  file: File,
  maxBufferSize?: number
): Promise<ParsedExifData | false>;

/**
 * Helper function to fetch an image from a URL and parse its EXIF data.
 * Note: Requires appropriate CORS headers on the server if fetching cross-origin.
 * @param url The URL of the image.
 * @param maxBufferSize Optional limit for parsing (bytes). Fetches the whole file regardless.
 * @returns A Promise resolving to the parsed EXIF tags object, or `false`.
 */
export declare function parseFromUrl(
  url: string,
  maxBufferSize?: number
): Promise<ParsedExifData | false>;

/**
 * Helper function to parse EXIF data from a Node.js Buffer.
 * Requires running in a Node.js environment.
 * @param nodeBuffer The Node.js Buffer object.
 * @param maxBufferSize Optional limit for parsing (bytes).
 * @returns A Promise resolving to the parsed EXIF tags object, or `false`.
 */
export declare function parseFromNodeBuffer(
  nodeBuffer: Buffer,
  maxBufferSize?: number
): Promise<ParsedExifData | false>;

/**
 * Standard EXIF Tags (SubIFD). Keys are tag IDs (numbers), values are tag names (strings).
 */
export declare const Tags: Record<number, string>;

/**
 * Standard TIFF Tags (IFD0, IFD1). Keys are tag IDs (numbers), values are tag names (strings).
 */
export declare const TiffTags: Record<number, string>;

/**
 * GPS Tags (GPS Info SubIFD). Keys are tag IDs (numbers), values are tag names (strings).
 */
export declare const GPSTags: Record<number, string>;

/**
 * Mappings from numeric tag values to human-readable strings.
 * Outer keys are tag names (string), inner keys are numeric codes (number), inner values are descriptive strings.
 */
export declare const StringValues: Record<
  string,
  Record<number | string, string>
>;

/**
 * Interface describing the structure of an entry within the MakeInfo constant.
 * This defines properties used for parsing manufacturer-specific MakerNotes.
 */
export interface MakeInfoEntry {
  MakerNoteTags?: Record<number, string>;
  SerialFoundAtStartOfMakerNotes?: boolean;
  InvalidSerialStart?: string;
  MinimumBelievableLength?: number;
  MakerNoteByteAlign?: number; // Typically 0x4949 (II) or 0x4D4D (MM)
  HeaderString?: string | string[];
  HeaderSize?: Record<string, number>;
  DefaultHeaderSize?: number;
  UseMakernoteOffsetAsBase?: Record<string, boolean>;
  AdjustOffsetBase?: Record<string, number>;
  MakerNoteByteAlignHeaderOffset?: number;
  FixMakernotesOffset?: boolean; // Indicated original code had complex offset calculation logic
  SerialWithinIFD?: string; // Tag name pointing to another IFD containing serials
  SerialWithinIFDHeaderSize?: number;
  SerialWithinIFDTags?: Record<number, string>; // Tags within the serial IFD
  InternalSerialWithinIFDArray?: string; // Tag name for an array containing serial
  InternalSerialWithinIFDArrayElement?: number; // Index of serial within the array
}

/**
 * Manufacturer specific information for parsing MakerNotes.
 * Keys are manufacturer names (string), values are MakeInfoEntry objects.
 */
export declare const MakeInfo: Record<string, MakeInfoEntry>;

/**
 * Default export combining the primary functions and constants.
 */
declare const exifParserDefault: {
  parse: typeof parse;
  parseFromFile: typeof parseFromFile;
  parseFromUrl: typeof parseFromUrl;
  parseFromNodeBuffer: typeof parseFromNodeBuffer;
  Tags: typeof Tags;
  TiffTags: typeof TiffTags;
  GPSTags: typeof GPSTags;
  StringValues: typeof StringValues;
  MakeInfo: typeof MakeInfo;
};

export default exifParserDefault;
