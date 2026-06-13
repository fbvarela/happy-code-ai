// Minimal dependency-free ZIP writer (store / no compression). Enough to
// bundle a handful of small text files preserving their relative paths, so a
// multi-file artifact can be downloaded and unzipped at the repo root.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const u16 = (n) => [n & 0xff, (n >>> 8) & 0xff];
const u32 = (n) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];

/** files: [{ path, content }] (content is a UTF-8 string). Returns a zip Blob. */
export function makeZip(files) {
  const enc = new TextEncoder();
  const body = [];     // local headers + file data
  const central = [];  // central directory records
  let offset = 0;
  const flag = 0x0800; // filenames are UTF-8

  for (const f of files) {
    const name = enc.encode(String(f.path).replace(/^\/+/, ""));
    const data = enc.encode(f.content ?? "");
    const crc = crc32(data);

    const local = Uint8Array.from([
      ...u32(0x04034b50), ...u16(20), ...u16(flag), ...u16(0), // sig, ver, flag, method=store
      ...u16(0), ...u16(0),                                    // mod time, mod date
      ...u32(crc), ...u32(data.length), ...u32(data.length),   // crc, comp size, uncomp size
      ...u16(name.length), ...u16(0),                          // name len, extra len
    ]);
    body.push(local, name, data);

    central.push(Uint8Array.from([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(flag), ...u16(0), // sig, made-by, needed, flag, method
      ...u16(0), ...u16(0),                                    // mod time, mod date
      ...u32(crc), ...u32(data.length), ...u32(data.length),   // crc, comp size, uncomp size
      ...u16(name.length), ...u16(0), ...u16(0),               // name, extra, comment len
      ...u16(0), ...u16(0), ...u32(0),                         // disk, internal attr, external attr
      ...u32(offset),                                          // local header offset
    ]), name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const eocd = Uint8Array.from([
    ...u32(0x06054b50), ...u16(0), ...u16(0),
    ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0),
  ]);

  return new Blob([...body, ...central, eocd], { type: "application/zip" });
}
