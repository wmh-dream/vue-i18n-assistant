import MagicString from "magic-string";
import type { ReplaceItem } from "../types";

export function applyReplace(code: string, items: ReplaceItem[]) {
  const s = new MagicString(code);

  [...items]
    .sort((a, b) => b.start - a.start)
    .forEach((item) => {
      s.overwrite(item.start, item.end, item.replace);
    });

  return s.toString();
}
