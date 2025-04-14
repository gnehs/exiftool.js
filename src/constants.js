// constants.js
// Contains constant definitions for EXIF tags, TIFF tags, GPS tags,
// string value mappings, and camera manufacturer specific information.

/**
 * Standard EXIF Tags (SubIFD)
 * Reference: https://exiftool.org/TagNames/EXIF.html
 */
export const Tags = {
  // version tags
  0x9000: "ExifVersion", // EXIF version
  0xa000: "FlashpixVersion", // Flashpix format version

  // colorspace tags
  0xa001: "ColorSpace", // Color space information tag

  // image configuration
  0xa002: "PixelXDimension", // Valid image width (formerly ExifImageWidth)
  0xa003: "PixelYDimension", // Valid image height (formerly ExifImageHeight)
  0x9101: "ComponentsConfiguration", // Information about channels
  0x9102: "CompressedBitsPerPixel", // Compressed bits per pixel

  // user information
  0x927c: "MakerNote", // Manufacturer specific information (usually points to an offset)
  0x9286: "UserComment", // Comments by user

  // related file
  0xa004: "RelatedSoundFile", // Name of related sound file

  // date and time
  0x9003: "DateTimeOriginal", // Date and time when the original image was generated
  0x9004: "DateTimeDigitized", // Date and time when the image was stored digitally (formerly CreateDate)
  0x9290: "SubSecTime", // Fractions of seconds for DateTime
  0x9291: "SubSecTimeOriginal", // Fractions of seconds for DateTimeOriginal
  0x9292: "SubSecTimeDigitized", // Fractions of seconds for DateTimeDigitized

  // picture-taking conditions
  0x829a: "ExposureTime", // Exposure time (in seconds)
  0x829d: "FNumber", // F number
  0x8822: "ExposureProgram", // Exposure program
  0x8824: "SpectralSensitivity", // Spectral sensitivity
  0x8827: "ISOSpeedRatings", // ISO speed rating (formerly ISO)
  0x8828: "OECF", // Optoelectric conversion factor
  0x8830: "SensitivityType", // Specifies the sensitivity type
  0x8832: "RecommendedExposureIndex", // Recommended exposure index
  0x9201: "ShutterSpeedValue", // Shutter speed (APEX value)
  0x9202: "ApertureValue", // Lens aperture (APEX value)
  0x9203: "BrightnessValue", // Value of brightness (APEX value)
  0x9204: "ExposureBiasValue", // Exposure bias (APEX value, formerly ExposureBias)
  0x9205: "MaxApertureValue", // Smallest F number of lens (APEX value)
  0x9206: "SubjectDistance", // Distance to subject in meters
  0x9207: "MeteringMode", // Metering mode
  0x9208: "LightSource", // Kind of light source
  0x9209: "Flash", // Flash status
  0x9214: "SubjectArea", // Location and area of main subject
  0x920a: "FocalLength", // Focal length of the lens in mm
  0xa20b: "FlashEnergy", // Strobe energy in BCPS
  0xa20c: "SpatialFrequencyResponse", // SFR values
  0xa20e: "FocalPlaneXResolution", // Number of pixels in width direction per FocalPlaneResolutionUnit
  0xa20f: "FocalPlaneYResolution", // Number of pixels in height direction per FocalPlaneResolutionUnit
  0xa210: "FocalPlaneResolutionUnit", // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
  0xa214: "SubjectLocation", // Location of subject in image
  0xa215: "ExposureIndex", // Exposure index selected on camera
  0xa217: "SensingMethod", // Image sensor type
  0xa300: "FileSource", // Image source (e.g., 3 == DSC)
  0xa301: "SceneType", // Scene type (1 == directly photographed)
  0xa302: "CFAPattern", // Color filter array geometric pattern
  0xa401: "CustomRendered", // Special processing
  0xa402: "ExposureMode", // Exposure mode
  0xa403: "WhiteBalance", // White balance mode
  0xa404: "DigitalZoomRatio", // Digital zoom ratio
  0xa405: "FocalLengthIn35mmFilm", // Equivalent focal length assuming 35mm film camera (in mm)
  0xa406: "SceneCaptureType", // Type of scene
  0xa407: "GainControl", // Degree of overall image gain adjustment
  0xa408: "Contrast", // Direction of contrast processing applied by camera
  0xa409: "Saturation", // Direction of saturation processing applied by camera
  0xa40a: "Sharpness", // Direction of sharpness processing applied by camera
  0xa40b: "DeviceSettingDescription", // Information specified by the camera manufacturer
  0xa40c: "SubjectDistanceRange", // Distance to subject

  // other tags
  0xa005: "InteroperabilityIFDPointer", // Pointer to Interoperability IFD
  0xa420: "ImageUniqueID", // Identifier assigned uniquely to each image
  0xa430: "CameraOwnerName", // Owner of the camera
  0xa431: "BodySerialNumber", // Serial number of the camera body (distinct from MakerNote serial)
  0xa432: "LensSpecification", // Lens information (min/max focal length, min/max F number)
  0xa433: "LensMake", // Lens manufacturer
  0xa434: "LensModel", // Lens model name/ID
  0xa435: "LensSerialNumber", // Serial number of the lens

  // XResolution, YResolution, ResolutionUnit moved to TiffTags as they primarily belong to IFD0/IFD1

  0xa500: "Gamma", // Gamma value

  // Padding Tag - Sometimes used, often ignored
  0xea1c: "Padding",

  // Microsoft Padding Tag (used similarly to Padding)
  0xea1d: "OffsetSchema", // Used by Microsoft, indicates offset scheme for some tags, often problematic
};

/**
 * Standard TIFF Tags (IFD0, IFD1)
 * Reference: https://exiftool.org/TagNames/EXIF.html (see TIFF tags section)
 */
export const TiffTags = {
  // Image Data Structure
  0x0100: "ImageWidth",
  0x0101: "ImageHeight",
  0x0102: "BitsPerSample",
  0x0103: "Compression", // 1 = Uncompressed, 6 = JPEG Compression, ...
  0x0106: "PhotometricInterpretation", // 2 = RGB, 6 = YCbCr, ...
  0x0112: "Orientation", // Orientation of image
  0x0115: "SamplesPerPixel",
  0x011c: "PlanarConfiguration", // 1 = Chunky, 2 = Planar
  0x0212: "YCbCrSubSampling",
  0x0213: "YCbCrPositioning", // 1 = Centered, 2 = Co-sited

  // Image Data Offset/Arrangement (Primary image or thumbnail)
  0x0111: "StripOffsets", // For TIFF files using strips
  0x0116: "RowsPerStrip",
  0x0117: "StripByteCounts",
  0x0201: "JPEGInterchangeFormat", // Offset to JPEG SOI (Start Of Image) for thumbnail
  0x0202: "JPEGInterchangeFormatLength", // Length of JPEG thumbnail data

  // Image Resolution
  0x011a: "XResolution",
  0x011b: "YResolution",
  0x0128: "ResolutionUnit", // 1 = None, 2 = Inch, 3 = Centimeter

  // Image Display/Color Information
  0x012d: "TransferFunction",
  0x013e: "WhitePoint",
  0x013f: "PrimaryChromaticities",
  0x0211: "YCbCrCoefficients",
  0x0214: "ReferenceBlackWhite",

  // Document/Image Metadata
  0x010e: "ImageDescription",
  0x010f: "Make", // Camera manufacturer
  0x0110: "Model", // Camera model
  0x0131: "Software", // Software used to process the image
  0x0132: "DateTime", // File modification date and time (also aliased as ModifyDate)
  0x013b: "Artist", // Person who created the image
  0x8298: "Copyright",

  // Pointers to SubIFDs
  0x8769: "ExifIFDPointer", // Pointer to the Exif SubIFD
  0x8825: "GPSInfoIFDPointer", // Pointer to the GPS Info SubIFD
  0xa005: "InteroperabilityIFDPointer", // Pointer to Interoperability IFD (often within Exif SubIFD, but defined in TIFF/EP spec here)

  // Some manufacturers place serial numbers directly in IFD0
  // Using the same names as EXIF SubIFD tags for consistency where applicable
  // These might override values from EXIF SubIFD if present in both and read later.
  // 0xa431: "BodySerialNumber", // Re-using EXIF SubIFD Tag name
  // 0xa435: "LensSerialNumber", // Re-using EXIF SubIFD Tag name

  // Specific Maker Tags sometimes found in IFD0 (like Fujifilm FilmMode)
  0x1401: "FilmMode", // Fujifilm specific
};

/**
 * GPS Tags (GPS Info SubIFD)
 * Reference: https://exiftool.org/TagNames/GPS.html
 */
export const GPSTags = {
  0x0000: "GPSVersionID",
  0x0001: "GPSLatitudeRef", // N or S
  0x0002: "GPSLatitude", // Array of Rational64u: [degrees, minutes, seconds]
  0x0003: "GPSLongitudeRef", // E or W
  0x0004: "GPSLongitude", // Array of Rational64u: [degrees, minutes, seconds]
  0x0005: "GPSAltitudeRef", // 0 = Above sea level, 1 = Below sea level
  0x0006: "GPSAltitude", // Rational64u: Altitude in meters
  0x0007: "GPSTimeStamp", // Array of Rational64u: [hours, minutes, seconds] in UTC
  0x0008: "GPSSatellites", // ASCII: GPS satellites used for measurement
  0x0009: "GPSStatus", // A = Measurement in progress, V = Measurement interoperability
  0x000a: "GPSMeasureMode", // 2 = 2-dimensional measurement, 3 = 3-dimensional measurement
  0x000b: "GPSDOP", // Rational64u: Data degree of precision
  0x000c: "GPSSpeedRef", // K = Kilometers per hour, M = Miles per hour, N = Knots
  0x000d: "GPSSpeed", // Rational64u: Speed of GPS receiver movement
  0x000e: "GPSTrackRef", // T = True direction, M = Magnetic direction
  0x000f: "GPSTrack", // Rational64u: Direction of receiver movement (degrees)
  0x0010: "GPSImgDirectionRef", // T = True direction, M = Magnetic direction
  0x0011: "GPSImgDirection", // Rational64u: Direction of image when captured (degrees)
  0x0012: "GPSMapDatum", // ASCII: Geodetic survey data used
  0x0013: "GPSDestLatitudeRef", // N or S
  0x0014: "GPSDestLatitude", // Array of Rational64u: [degrees, minutes, seconds]
  0x0015: "GPSDestLongitudeRef", // E or W
  0x0016: "GPSDestLongitude", // Array of Rational64u: [degrees, minutes, seconds]
  0x0017: "GPSDestBearingRef", // T = True direction, M = Magnetic direction
  0x0018: "GPSDestBearing", // Rational64u: Bearing to destination point (degrees)
  0x0019: "GPSDestDistanceRef", // K = Kilometers, M = Miles, N = Nautical miles
  0x001a: "GPSDestDistance", // Rational64u: Distance to destination point
  0x001b: "GPSProcessingMethod", // ASCII: Name of the method used for finding location
  0x001c: "GPSAreaInformation", // ASCII: Name of the GPS area
  0x001d: "GPSDateStamp", // ASCII: Date string (YYYY:MM:DD) in UTC
  0x001e: "GPSDifferential", // 0 = No differential correction, 1 = Differential correction applied
  0x001f: "GPSHPositioningError", // Rational64u: Horizontal positioning error in meters
};

/**
 * Mappings from numeric tag values to human-readable strings.
 */
export const StringValues = {
  ExposureProgram: {
    0: "Not defined",
    1: "Manual",
    2: "Normal program",
    3: "Aperture priority",
    4: "Shutter priority",
    5: "Creative program (biased toward depth of field)",
    6: "Action program (biased toward fast shutter speed)",
    7: "Portrait mode (for closeup photos with the background out of focus)",
    8: "Landscape mode (for landscape photos with the background in focus)",
  },
  MeteringMode: {
    0: "Unknown",
    1: "Average",
    2: "CenterWeightedAverage",
    3: "Spot",
    4: "MultiSpot",
    5: "Pattern", // Multi-segment
    6: "Partial",
    255: "Other",
  },
  LightSource: {
    0: "Unknown",
    1: "Daylight",
    2: "Fluorescent",
    3: "Tungsten (incandescent light)",
    4: "Flash",
    9: "Fine weather",
    10: "Cloudy weather",
    11: "Shade",
    12: "Daylight fluorescent (D 5700 - 7100K)",
    13: "Day white fluorescent (N 4600 - 5400K)",
    14: "Cool white fluorescent (W 3900 - 4500K)",
    15: "White fluorescent (WW 3200 - 3700K)",
    17: "Standard light A",
    18: "Standard light B",
    19: "Standard light C",
    20: "D55",
    21: "D65",
    22: "D75",
    23: "D50",
    24: "ISO studio tungsten",
    255: "Other",
  },
  Flash: {
    0x0000: "Flash did not fire",
    0x0001: "Flash fired",
    0x0005: "Strobe return light not detected",
    0x0007: "Strobe return light detected",
    0x0009: "Flash fired, compulsory flash mode",
    0x000d: "Flash fired, compulsory flash mode, return light not detected",
    0x000f: "Flash fired, compulsory flash mode, return light detected",
    0x0010: "Flash did not fire, compulsory flash mode",
    0x0018: "Flash did not fire, auto mode",
    0x0019: "Flash fired, auto mode",
    0x001d: "Flash fired, auto mode, return light not detected",
    0x001f: "Flash fired, auto mode, return light detected",
    0x0020: "No flash function",
    0x0041: "Flash fired, red-eye reduction mode",
    0x0045: "Flash fired, red-eye reduction mode, return light not detected",
    0x0047: "Flash fired, red-eye reduction mode, return light detected",
    0x0049: "Flash fired, compulsory flash mode, red-eye reduction mode",
    0x004d:
      "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
    0x004f:
      "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
    0x0059: "Flash fired, auto mode, red-eye reduction mode",
    0x005d:
      "Flash fired, auto mode, return light not detected, red-eye reduction mode",
    0x005f:
      "Flash fired, auto mode, return light detected, red-eye reduction mode",
    0x0065: "Flash fired, red-eye reduction mode",
    0x0069: "Flash fired, compulsory flash mode, red-eye reduction mode",
    0x006d:
      "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
    0x006f:
      "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
    0x0079: "Flash fired, auto mode, red-eye reduction mode",
    0x007d:
      "Flash fired, auto mode, return light not detected, red-eye reduction mode",
    0x007f:
      "Flash fired, auto mode, return light detected, red-eye reduction mode",
  },
  SensingMethod: {
    1: "Not defined",
    2: "One-chip color area sensor",
    3: "Two-chip color area sensor",
    4: "Three-chip color area sensor",
    5: "Color sequential area sensor",
    7: "Trilinear sensor",
    8: "Color sequential linear sensor",
  },
  SceneCaptureType: {
    0: "Standard",
    1: "Landscape",
    2: "Portrait",
    3: "Night scene",
  },
  SceneType: {
    1: "Directly photographed",
  },
  CustomRendered: {
    0: "Normal process",
    1: "Custom process",
  },
  WhiteBalance: {
    0: "Auto white balance",
    1: "Manual white balance",
  },
  GainControl: {
    0: "None",
    1: "Low gain up",
    2: "High gain up",
    3: "Low gain down",
    4: "High gain down",
  },
  Contrast: {
    0: "Normal",
    1: "Soft",
    2: "Hard",
  },
  Saturation: {
    0: "Normal",
    1: "Low saturation",
    2: "High saturation",
  },
  Sharpness: {
    0: "Normal",
    1: "Soft",
    2: "Hard",
  },
  SubjectDistanceRange: {
    0: "Unknown",
    1: "Macro",
    2: "Close view",
    3: "Distant view",
  },
  FileSource: {
    1: "Film Scanner",
    2: "Reflection Print Scanner",
    3: "DSC (Digital Still Camera)",
  },
  ComponentsConfiguration: {
    0: "", // Often 0 indicates it doesn't exist
    1: "Y",
    2: "Cb",
    3: "Cr",
    4: "R",
    5: "G",
    6: "B",
  },
  ColorSpace: {
    1: "sRGB",
    2: "Adobe RGB", // Common but not in original EXIF spec, widely used
    65535: "Uncalibrated", // FF FF
  },
  ResolutionUnit: {
    1: "None",
    2: "inches",
    3: "cm",
  },
  Orientation: {
    1: "Horizontal (normal)",
    2: "Mirror horizontal",
    3: "Rotate 180",
    4: "Mirror vertical",
    5: "Mirror horizontal and rotate 270 CW",
    6: "Rotate 90 CW",
    7: "Mirror horizontal and rotate 90 CW",
    8: "Rotate 270 CW",
  },
  YCbCrPositioning: {
    1: "Centered",
    2: "Co-sited",
  },
  Compression: {
    1: "Uncompressed",
    6: "JPEG (old-style)", // Usually means thumbnail is JPEG
    // Others exist, but these are common in EXIF context
  },
  PhotometricInterpretation: {
    2: "RGB",
    6: "YCbCr",
    // Others exist
  },
  PlanarConfiguration: {
    1: "Chunky format",
    2: "Planar format",
  },
  // Fujifilm specific FilmMode mapping
  FilmMode: {
    0x000: "F0/Standard (Provia)",
    0x100: "F1/Studio Portrait",
    0x110: "F1a/Studio Portrait Enhanced Saturation",
    0x120: "F1b/Studio Portrait Smooth Skin Tone (Astia)",
    0x130: "F1c/Studio Portrait Increased Sharpness",
    0x200: "F2/Fujichrome (Velvia)",
    0x300: "F3/Studio Portrait Ex",
    0x400: "F4/Velvia",
    0x500: "Pro Neg. Std",
    0x501: "Pro Neg. Hi",
    0x600: "Classic Chrome",
    0x700: "Eterna",
    0x800: "Classic Negative",
    0x900: "Bleach Bypass",
    0xa00: "Nostalgic Neg",
    0xb00: "Reala ACE",
  },
  // GPS related string values
  GPSLatitudeRef: {
    N: "North latitude",
    S: "South latitude",
  },
  GPSLongitudeRef: {
    E: "East longitude",
    W: "West longitude",
  },
  GPSAltitudeRef: {
    0: "Above sea level",
    1: "Below sea level",
  },
  GPSStatus: {
    A: "Measurement Active",
    V: "Measurement Void",
  },
  GPSMeasureMode: {
    2: "2-dimensional measurement",
    3: "3-dimensional measurement",
  },
  GPSSpeedRef: {
    K: "km/h",
    M: "mph",
    N: "knots",
  },
  GPSTrackRef: {
    T: "True direction",
    M: "Magnetic direction",
  },
  GPSImgDirectionRef: {
    // Same as GPSTrackRef
    T: "True direction",
    M: "Magnetic direction",
  },
  GPSDestBearingRef: {
    // Same as GPSTrackRef
    T: "True direction",
    M: "Magnetic direction",
  },
  GPSDestDistanceRef: {
    K: "Kilometers",
    M: "Miles",
    N: "Nautical miles",
  },
  GPSDifferential: {
    0: "No differential correction",
    1: "Differential correction applied",
  },
};

/**
 * Manufacturer specific information for parsing MakerNotes.
 * Keys should match the exact string found in the 'Make' tag.
 */
export const MakeInfo = {
  // Canon
  Canon: {
    MakerNoteTags: {
      0x0001: "CanonCameraSettings", // Pointer to another IFD
      0x0002: "CanonFocalLength", // FocalLength related info
      0x0004: "CanonShotInfo", // Pointer to another IFD
      0x0006: "CanonImageType", // e.g., "IMG:EOS D30 JPEG"
      0x0007: "CanonFirmwareVersion",
      0x000c: "SerialNumber", // Sometimes here in older models
      0x0010: "CanonFileLength",
      0x0015: "SerialNumberFormat", // Indicates format of serial number
      0x0028: "ImageUniqueID", // Canon specific unique ID
      0x0093: "CanonFlashInfo",
      0x0095: "OwnerName",
      0x0096: "InternalSerialNumber", // Camera internal serial number
      0x00a0: "CanonExposureInfo",
      0xa431: "SerialNumber", // Body serial number, more common location now
    },
    // Canon MakerNotes are usually relative to TIFF header start
    // Endianness usually matches TIFF header
  },

  // Eastman Kodak
  "EASTMAN KODAK COMPANY": {
    MakerNoteTags: {
      // Kodak MakerNotes often start directly with data, not a standard IFD header.
      // Tags depend heavily on the model. Example tag:
      0x0009: "KodakImageWidth", // Example
      0x000a: "KodakImageHeight", // Example
      // Serial number might be at the very start
    },
    SerialFoundAtStartOfMakerNotes: true,
    InvalidSerialStart: "KDK", // Some Kodak serials start with this and are invalid/generic
    MinimumBelievableLength: 12, // Heuristic minimum length for a valid serial
    // Endianness and structure vary greatly by Kodak model.
  },

  // Fujifilm
  FUJIFILM: {
    MakerNoteTags: {
      0x0000: "FujifilmVersion",
      0x0010: "InternalSerialNumber", // Often includes date/time/sequence
      0x1000: "Quality",
      0x1001: "Sharpness",
      0x1002: "WhiteBalance", // Fujifilm specific WB codes
      0x1003: "ColorSaturation", // (Renamed from 'Color' for clarity)
      0x1004: "Tone", // (Renamed from 'Contrast' for clarity)
      0x1005: "ColorTemperature",
      0x1006: "Contrast", // May differ from standard Contrast tag
      0x100a: "WhiteBalanceFineTune",
      0x100b: "NoiseReduction",
      0x1010: "FujiFlashMode",
      0x1011: "FlashExposureComp",
      0x1020: "Macro",
      0x1021: "FocusMode",
      0x1023: "FocusPixel",
      0x1030: "SlowSync",
      0x1031: "PictureMode", // e.g., Auto, Manual, Scene modes
      0x1032: "ExposureCount",
      0x1100: "MotorOrBracket",
      0x1210: "ColorMode",
      0x1300: "BlurWarning",
      0x1301: "FocusWarning",
      0x1302: "ExposureWarning",
      0x1400: "DynamicRange",
      0x1401: "FilmMode", // Important for Fujifilm simulations
      0x1402: "DynamicRangeSetting",
      0x1403: "DevelopmentDynamicRange",
      0x1404: "MinFocalLength", // Lens info
      0x1405: "MaxFocalLength", // Lens info
      0x1406: "MaxApertureAtMinFocal", // Lens info
      0x1407: "MaxApertureAtMaxFocal", // Lens info
      0x1422: "FileSource", // Where the file came from (e.g., camera internal processing)
      0x1436: "FacesDetected",
      // 0x1445: Face positions are complex structures, often skipped
      0x3820: "LensModel", // Sometimes Fujifilm lens model is here
      0x4100: "AutoBracketing",
    },
    MakerNoteByteAlign: 0x4949, // Always Intel byte align ('II') for Fujifilm MakerNotes
    HeaderString: "FUJIFILM",
    HeaderSize: {
      FUJIFILM: 12, // Length of "FUJIFILM" + 4 bytes for offset info
    },
    UseMakernoteOffsetAsBase: {
      FUJIFILM: true, // Offsets within are relative to the start of the MakerNote section
    },
    MinimumBelievableLength: 34, // Heuristic based on original code observation for serial
  },

  // Nikon
  "NIKON CORPORATION": {
    // Covers "NIKON" as well
    MakerNoteTags: {
      // Tags depend heavily on Nikon model (Type 1, 2, 3 MakerNotes)
      // Examples (mostly from Type 3):
      0x0001: "NikonVersion",
      0x0002: "ISOSpeed", // Often more precise than standard ISO
      0x0003: "ColorMode",
      0x0004: "Quality",
      0x0005: "WhiteBalance", // Nikon specific WB codes
      0x0006: "Sharpening",
      0x0007: "FocusMode",
      0x0008: "FlashSetting",
      0x000a: "WhiteBalanceBias",
      0x000b: "WhiteBalanceRBcoeffs",
      0x000c: "ProgramShift",
      0x000d: "ExposureDifference",
      0x0011: "PreviewIFDPointer", // Pointer to Preview image IFD
      0x0012: "FlashExposureComp",
      0x0013: "ISOSetting", // Requested ISO
      0x0016: "ImageBoundary",
      0x0017: "ExternalFlashExposureComp",
      0x0018: "FlashExposureBracketValue",
      0x001b: "CropHiSpeed", // High-speed crop info
      0x001d: "SerialNumber", // Older models might have it here (encrypted?)
      0x001e: "ColorSpace", // Nikon specific colorspace setting
      0x001f: "VRInfo", // Vibration Reduction info
      0x0022: "ActiveDLighting",
      0x0023: "PictureControlData", // Pointer to Picture Control settings
      0x0024: "WorldTime",
      0x002a: "ContrastDetectAF",
      0x0080: "ImageAuthentication",
      0x0082: "ActiveDLighting", // (Duplicate?)
      0x0083: "VignetteControl",
      0x0084: "DistortionControl",
      0x0087: "ExposureTime", // Sometimes fractional exposure time is here
      0x0089: "LensType", // e.g., G, D type lens
      0x008a: "LensMinMaxFocalMaxAperture", // Lens details
      0x008b: "LensData", // Detailed lens data, requires specific parsing
      0x0093: "RetouchHistory",
      0x0096: "ExposureMode", // (Nikon specific?)
      0x0097: "ShutterCount",
      0x0098: "FlashInfo", // Pointer to Flash info structure
      0x009b: "ImageDataArea", // Non-distorted image area
      0x00a0: "SerialNumber", // Newer models, often encrypted
      0x00a2: "ImageAuthentication", // (Duplicate?)
      0x00a6: "FileInfo", // Pointer to File Info structure
      0x00a7: "AFInfo", // Pointer to AF Info structure (complex)
      0x00a8: "ShootingMode", // e.g., Continuous, Single
      0x00a9: "LensDataVersion",
      0x00ab: "SerialNumberFormat", // (From original code, check validity)
      0x00b1: "NEFCompression", // NEF specific
      0x00b7: "NoiseReduction",
      0x0100: "ShotInfo", // Pointer to Shot Info structure (Type 3)
      0x0103: "NEFLinearizationTable", // NEF specific
      // ... many more Nikon tags exist
    },
    HeaderString: "Nikon",
    HeaderSize: {
      Nikon: 18, // Standard header: "Nikon\0\x02\0\0\0" + Endian (MM/II) + "*" + Offset (10 bytes) + Version (e.g., \x02\x10\0\0) = 18 bytes
    },
    MakerNoteByteAlignHeaderOffset: 10, // Position of 'II' or 'MM' after "Nikon\0..." header part
    UseMakernoteOffsetAsBase: {
      Nikon: true, // Offsets are relative to the start of the MakerNote section
    },
    AdjustOffsetBase: {
      Nikon: 10, // Need to adjust offset base by the size of the part before endianness marker
    },
  },

  // Olympus
  "OLYMPUS IMAGING CORP.": {
    // Covers "OLYMPUS CORPORATION", etc.
    MakerNoteTags: {
      0x0100: "ThumbnailImage", // May contain thumbnail data directly
      0x0200: "OlympusVersion", // e.g., "OLYMPUS DIGITAL CAMERA"
      0x1000: "DataDump", // Often contains a lot of settings data
      0x2010: "EquipmentIFDPointer", // Pointer to Equipment Info IFD (often contains serials)
      0x2020: "CameraSettingsIFDPointer", // Pointer to Camera Settings IFD
      0x2030: "RawDevelopment", // Raw development parameters
      0x2040: "ImageProcessingIFDPointer", // Pointer to Image Processing IFD
      0x2050: "FocusInfo", // Focus related information
      0x3000: "RawInfo", // Pointer to Raw file info
      // ... many more Olympus specific IFDs and tags
    },
    HeaderString: "OLYMP", // Can be "OLYMP\0" or "OLYMPUS\0"
    HeaderSize: {
      OLYMP: 8, // "OLYMP\0" + II/MM + version bytes (often \x01\0)
      OLYMPUS: 12, // "OLYMPUS\0" + II/MM + version bytes
    },
    MakerNoteByteAlignHeaderOffset: 8, // After "OLYMPUS\0" or "OLYMP\0" string part
    UseMakernoteOffsetAsBase: {
      OLYMP: false, // Older style, offsets relative to TIFF start
      OLYMPUS: true, // Newer style, offsets relative to MakerNote start
    },
    AdjustOffsetBase: {
      OLYMP: 0,
      OLYMPUS: 0, // Usually no extra adjustment needed here
    },
    // Where to find serial numbers within nested IFDs
    SerialWithinIFD: "EquipmentIFDPointer", // Often in the IFD pointed to by 0x2010
    SerialWithinIFDHeaderSize: 0, // Usually no extra header inside the Equipment IFD
    SerialWithinIFDTags: {
      0x0100: "EquipmentVersion",
      0x0101: "InternalSerialNumber", // Often Body serial
      0x0102: "SerialNumber", // Can sometimes be body or other serial
      0x0103: "LensSerialNumber", // Lens serial if attached and identifiable
      0x0104: "FlashSerialNumber", // External flash serial
    },
  },

  "OLYMPUS OPTICAL CO.,LTD": {
    // Older Olympus models, often simpler structure
    MakerNoteTags: {
      0x0008: "OlympusVersion", // (Check offset)
      0x101a: "SerialNumber", // Common location in older models
      0x0f05: "CameraSettings", // Might contain settings data
      //... other potential older tags
    },
    HeaderString: "OLYMP",
    HeaderSize: {
      OLYMP: 8, // Common header for older models
    },
    // Often behaves like the 'OLYMP' case for newer models (relative to TIFF start)
    UseMakernoteOffsetAsBase: { OLYMP: false },
    AdjustOffsetBase: { OLYMP: 0 },
    MakerNoteByteAlignHeaderOffset: 8,
  },

  // Panasonic
  Panasonic: {
    MakerNoteTags: {
      // Panasonic MakerNotes often contain many settings tags
      0x0001: "QualityMode", // e.g., RAW, Fine JPEG, Standard JPEG
      0x0002: "FirmwareVersion",
      0x0003: "WhiteBalance", // Panasonic specific WB codes
      0x0007: "FocusMode",
      0x000f: "AFPointPosition", // (Renamed from 'AF Area Mode')
      0x001a: "ImageStabilization",
      0x001c: "MacroMode",
      0x001f: "ShootingMode", // Panasonic specific shooting modes
      0x0025: "InternalSerialNumber", // Often contains date + sequence number
      0x0026: "Audio", // Audio recording status
      0x0028: "WhiteBalanceBias",
      0x0029: "FlashBias",
      0x002e: "ColorEffect",
      0x002f: "TimeSincePowerOn",
      0x0030: "BurstMode",
      0x0031: "SequenceNumber",
      0x0032: "ContrastMode",
      0x0033: "NoiseReduction",
      0x0034: "SelfTimer",
      0x0036: "ImageRotation",
      0x0037: "AFAssistLamp",
      0x0039: "ColorMode", // e.g., Standard, Vivid, B&W
      0x003a: "BabyAge", // Special feature
      0x003b: "OpticalZoomMode",
      0x003c: "LensType", // Often description of attached or internal lens
      0x003d: "Geotag", // GPS info if available
      0x003f: "FaceDetectionInfo", // Pointer to face detection data
      0x0040: "Transform", // e.g., for aspect ratio conversion
      0x0041: "IntelligentExposure",
      0x0046: "FlashWarning",
      0x0051: "Title", // User assigned title
      0x0059: "TextStamp", // Date/Time stamp overlay setting
      0x005d: "ProgramISO", // ISO set by the program mode
      0x005f: "AdvancedSceneType",
      0x0061: "FacesRecognized", // Info about recognized faces
      0x0079: "FlashFired", // More specific flash info?
      0x0086: "SceneMode", // Detailed scene mode info
      0x0089: "FilmMode", // Photo style or film simulation
      0x008a: "ColorTempKelvin",
      0x008b: "BracketSettings",
      0x008c: "WBShiftAB", // White Balance Shift Amber/Blue
      0x008d: "WBShiftGM", // White Balance Shift Green/Magenta
      0x0096: "IntelligentResolution",
      0x00a3: "ShutterType", // Mechanical or Electronic
      0x00b0: "InternalNDFilter", // ND Filter setting
      0x00b2: "HDR", // High Dynamic Range setting
      0x00c0: "VideoBurstMode",
      // ... many more Panasonic tags
    },
    MakerNoteByteAlign: 0x4949, // Usually Intel byte order ('II')
    HeaderString: "Panasoni", // Note the missing 'c'
    HeaderSize: {
      Panasoni: 12, // Length of "Panasonic\0\0\0"
    },
    // Panasonic MakerNotes are usually relative to the TIFF header start
    UseMakernoteOffsetAsBase: { Panasoni: false },
    AdjustOffsetBase: { Panasoni: 0 },
    // Serial number formatting needs specific parsing (see utils.js)
  },

  // Pentax / Asahi
  "PENTAX Corporation": {
    // Covers "PENTAX" and potentially "ASAHI OPTICAL CO.,LTD."
    MakerNoteTags: {
      // Pentax tags depend on the model and firmware version
      0x0001: "CaptureMode", // e.g., Manual, Av, Tv, P, Green mode
      0x0002: "Quality", // Resolution/Compression level
      0x0003: "FocusMode", // AF-S, AF-C, Manual
      0x0004: "FlashMode",
      0x0005: "WhiteBalance", // Pentax specific WB codes
      0x0007: "DigitalZoom",
      0x0008: "Sharpness",
      0x0009: "Contrast",
      0x000a: "Saturation",
      0x000b: "ISOSpeed", // ISO setting (can differ from standard tag)
      0x000c: "Color", // e.g., B&W, Sepia filter effects
      0x0016: "ImageTone", // (Renamed from 'Print Image Matching')
      0x0017: "ColorSpace", // sRGB or AdobeRGB
      0x0019: "Time Zone",
      0x001a: "Daylight Savings",
      0x001c: "FrameNumber",
      0x0200: "PictureMode", // Similar to CaptureMode but more detailed?
      0x0201: "DriveMode", // Single, Continuous, Timer, Remote
      0x0207: "FocusPoint", // Selected AF point
      0x020b: "ExposureCompensation",
      0x0215: "CameraInfo", // Often an array containing serial and other IDs (requires specific parsing)
      0x0229: "SerialNumber", // Sometimes directly available, sometimes in CameraInfo
      // ... more Pentax tags exist
    },
    InternalSerialWithinIFDArray: "CameraInfo", // Serial often found inside this array tag
    InternalSerialWithinIFDArrayElement: 4, // Index within the CameraInfo array (heuristic, may vary)
    DefaultHeaderSize: 6, // Common headers are "AOC\0" (Asahi Optical Co.) or "PENTAX" + alignment
    HeaderString: ["AOC\0", "PENTAX"], // Can have different headers
    MakerNoteByteAlignHeaderOffset: 4, // After "AOC\0" or "PENTAX" string part
    FixMakernotesOffset: true, // Pentax MakerNote offsets often require calculation/correction
    // Endianness usually follows the header alignment bytes
    // Offsets are typically relative to TIFF header start
  },
  PENTAX: {
    // Alias for "PENTAX Corporation"
    // Inherit settings from "PENTAX Corporation"
    MakerNoteTags: {
      0x0001: "CaptureMode",
      0x0002: "Quality",
      0x0215: "CameraInfo",
      0x0229: "SerialNumber",
    }, // Example subset
    InternalSerialWithinIFDArray: "CameraInfo",
    InternalSerialWithinIFDArrayElement: 4,
    DefaultHeaderSize: 6,
    HeaderString: ["AOC\0", "PENTAX"],
    MakerNoteByteAlignHeaderOffset: 4,
    FixMakernotesOffset: true,
  },
  "ASAHI OPTICAL CO.,LTD.": {
    // Older Pentax name
    // Inherit settings from "PENTAX Corporation"
    MakerNoteTags: {
      0x0001: "CaptureMode",
      0x0002: "Quality",
      0x0215: "CameraInfo",
      0x0229: "SerialNumber",
    }, // Example subset
    InternalSerialWithinIFDArray: "CameraInfo",
    InternalSerialWithinIFDArrayElement: 4,
    DefaultHeaderSize: 6,
    HeaderString: ["AOC\0", "PENTAX"],
    MakerNoteByteAlignHeaderOffset: 4,
    FixMakernotesOffset: true,
  },

  // Sony
  SONY: {
    // Covers various Sony entities like "Sony Ericsson"
    MakerNoteTags: {
      // Sony MakerNotes are complex and often contain encrypted data or pointers to other structures.
      // Tags are highly model dependent. Examples:
      0x0001: "SonyCameraInfo", // Often points to primary info block
      0x0010: "PreviewImage", // Offset/length of preview image
      0x0102: "FocusMode", // Sony specific focus modes
      0x0104: "AFAreaMode",
      0x0105: "AFPointSelected",
      0x0114: "LensMount", // E-mount, A-mount
      0x0115: "LensType", // ID for the attached lens
      0x011b: "ImageStabilization", // Setting for SteadyShot
      0x0127: "ElectronicFrontCurtainShutter",
      0x2000: "PrintIM", // Print Image Matching info
      0x2001: "SonyModelID", // Internal model ID
      0x2005: "SceneMode", // Sony scene modes
      0x2006: "ZoneMatching",
      0x2007: "DynamicRangeOptimizer", // DRO settings
      0x2009: "ColorMode", // Creative Style / Look
      0x200a: "ColorTemperature", // WB Kelvin setting
      0x2010: "ThumbnailImage", // May contain thumbnail
      0xb000: "SerialNumber", // Sometimes found here
      0xb020: "LensSpecFeatures", // Detailed Lens info (requires specific parsing)
      0xb023: "AFMicroAdjValue", // AF Micro Adjustment
      0xb027: "PictureEffect",
      0xb028: "SoftSkinEffect",
      0xb040: "HDR", // HDR settings
      0xb041: "ShutterCount", // Sometimes available
      0xb04e: "FileFormat", // e.g., RAW, JPEG, RAW+JPEG
      0xb054: "LensSpec", // Pointer to detailed lens specification IFD
      // Many more tags, especially related to video, AF, specific features
    },
    // Sony structure varies a lot. Header might be "SONY CAM", "SONY DSC", etc.
    // Endianness usually matches TIFF header.
    // Offsets are often relative to TIFF header start.
    // Some data might be encrypted or require model-specific decryption keys/algorithms.
    HeaderString: ["SONY CAM", "SONY DSC"], // Example possible headers
    // Need specific HeaderSize, ByteAlignOffset etc. based on identified header and model.
    // Serial number location can vary.
  },
  // Add other manufacturers like Minolta, Ricoh, Samsung, etc. following similar patterns
  // MINOLTA: { ... },
  // RICOH: { ... },
  // SAMSUNG: { ... },
};

/**
 * Helper map for case-insensitive Make lookup.
 * Maps uppercase make strings to the MakeInfo object.
 */
export const MakeInfoMap = Object.keys(MakeInfo).reduce((map, make) => {
  const upperMake = make.toUpperCase();
  // Handle cases where MakeInfo defines multiple possible header strings
  if (
    MakeInfo[make].HeaderString &&
    Array.isArray(MakeInfo[make].HeaderString)
  ) {
    // Use the primary make string as the key
    map[upperMake] = MakeInfo[make];
    // Potentially add aliases if needed, though lookup usually uses the 'Make' tag value
  } else {
    map[upperMake] = MakeInfo[make];
  }

  // Add common variations or aliases if necessary
  if (upperMake === "NIKON CORPORATION") map["NIKON"] = MakeInfo[make];
  if (upperMake === "OLYMPUS IMAGING CORP.") {
    map["OLYMPUS CORPORATION"] = MakeInfo[make];
    map["OLYMPUS"] = MakeInfo[make]; // Simple alias
  }
  if (upperMake === "PENTAX Corporation") {
    map["PENTAX"] = MakeInfo[make];
    map["ASAHI OPTICAL CO.,LTD."] = MakeInfo[make]; // Link older name
  }
  if (upperMake === "ASAHI OPTICAL CO.,LTD.") {
    map["PENTAX"] = MakeInfo[make]; // Link newer name
    map["PENTAX Corporation"] = MakeInfo[make];
  }
  if (upperMake === "SONY") {
    map["SONY ERICSSON"] = MakeInfo[make]; // Example alias
  }

  return map;
}, {});
