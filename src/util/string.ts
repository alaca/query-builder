const CHARS_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g;
const CHARS_MAP: {
  [key: string]: string
} = {
  '\0': '\\0',
  '\b': '\\b',
  '\t': '\\t',
  '\n': '\\n',
  '\r': '\\r',
  '\x1a': '\\Z',
  '"': '\\"',
  '\'': '\\\'',
  '\\': '\\\\'
};

export function escapeString(val: any) {
  let index: number = CHARS_REGEXP.lastIndex = 0;
  let escaped: string = '';
  let match: RegExpExecArray | null;

  if (val === null || val === undefined) {
    return 'NULL';
  }

  if (Number.isInteger(val)) {
    return val;
  }

  while ((match = CHARS_REGEXP.exec(val))) {
    escaped += val.slice(index, match.index) + CHARS_MAP[match[0]];
    index = CHARS_REGEXP.lastIndex;
  }

  if (index === 0) {
    return `'${val}'`;
  }

  if (index < val.length) {
    return `'${escaped + val.slice(index)}'`;
  }

  return `'${escaped}'`;
}
