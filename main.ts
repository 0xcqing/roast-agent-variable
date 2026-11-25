import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "My agent spent ten minutes choosing a variable name, rejected six, and shipped data2.";

function fail(message: string): never {
  console.error(`entry generation failed: ${message}`);
  process.exit(1);
}

const charCount = Array.from(LINE).length;
const byteCount = Buffer.byteLength(LINE, "utf8");

if (LINE.trim().length === 0) {
  fail("line is empty after trimming whitespace");
}
if (/[\r\n]/.test(LINE)) {
  fail("line contains an internal carriage return or newline");
}
if (charCount < 1 || charCount > 200) {
  fail(`character count ${charCount} is outside the allowed 1..200 range`);
}
if (byteCount < 1 || byteCount > 200) {
  fail(`byte count ${byteCount} is outside the allowed 1..200 range`);
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || "/output";
mkdirSync(outputDir, { recursive: true });

const entryPath = join(outputDir, "entry.txt");
const payload = `${LINE}\n`;
writeFileSync(entryPath, payload, "utf8");

const readBack = readFileSync(entryPath);
const expected = Buffer.from(payload, "utf8");
if (!readBack.equals(expected)) {
  fail(
    `read-back bytes differ from the bytes written (expected ${expected.length}, got ${readBack.length})`,
  );
}
const readText = readBack.toString("utf8");
if (readText !== `${LINE}\n` || readText.split("\n").length !== 2) {
  fail(
    "read-back text is not exactly the single line plus one trailing newline",
  );
}
if (statSync(entryPath).size !== expected.length) {
  fail(
    `file size on disk differs from the bytes written (expected ${expected.length}, got ${statSync(entryPath).size})`,
  );
}

console.log(`wrote ${entryPath}`);
console.log(`characters: ${charCount}`);
console.log(`bytes: ${byteCount}`);
console.log(`file size: ${readBack.length}`);
console.log(`line: ${LINE}`);
