import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// jsdom's test environment doesn't provide these globals, but jose (used for
// JWT signing/verification) needs them even in unit tests that never touch
// the DOM.
if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;
}

