/**
 * Inspired from:
 * https://github.com/jxson/front-matter
 */
const parser = require("js-yaml");
const optionalByteOrderMark = "\\ufeff?";
const platform = typeof process !== "undefined" ? process.platform : "";
const pattern =
  "^(" +
  optionalByteOrderMark +
  "(= yaml =|---)" +
  "$([\\s\\S]*?)" +
  "^(?:\\2|\\.\\.\\.)\\s*" +
  "$" +
  (platform === "win32" ? "\\r?" : "") +
  "(?:\\n)?)";
// NOTE: If this pattern uses the 'g' flag the `regex` variable definition will
// need to be moved down into the functions that use it.
const regex = new RegExp(pattern, "m");

export function parseFrontmatter(str: string = "") {
  var lines = str.split(/(\r?\n)/);
  if (lines[0] && /= yaml =|---/.test(lines[0])) {
    return parse(str);
  } else {
    return {
      attributes: {},
      body: str,
      bodyBegin: 1,
    };
  }
}

export function computeLocation(match: any, body: string) {
  var line = 1;
  var pos = body.indexOf("\n");
  var offset = match.index + match[0].length;

  while (pos !== -1) {
    if (pos >= offset) {
      return line;
    }
    line++;
    pos = body.indexOf("\n", pos + 1);
  }

  return line;
}

export function parse(_str: string) {
  var match = regex.exec(_str);
  if (!match) {
    return {
      attributes: {},
      body: _str,
      bodyBegin: 1,
    };
  }

  var yaml = match[match.length - 1].replace(/^\s+|\s+$/g, "");
  var attributes = parser.load(yaml) || {};
  var body = _str.replace(match[0], "");
  var line = computeLocation(match, _str);

  return {
    attributes: attributes,
    body: body,
    bodyBegin: line,
    frontmatter: yaml,
  };
}
