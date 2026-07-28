import type { ChineseText } from "../analyzer/collectChinese";
import type { ReplaceItem } from "../types/replace";

export function buildTemplateReplace(list: ChineseText[]): ReplaceItem[] {
  return list.map((item) => ({
    start: item.offset,
    end: item.offset + item.text.length,
    replace: `{{ $t('${item.text}') }}`,
  }));
}
