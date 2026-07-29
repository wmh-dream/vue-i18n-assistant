import type { ReplaceItem } from "../types";

// 临时适配旧结构:analyzer 仍输出 ChineseText,这里做字段映射
// 待 analyzer 切换到 ChineseSnippet 后,移除本函数,直接返回 list
interface LegacyChineseText {
  text: string;
  offset: number;
  type: "text";
}

export function buildTemplateReplace(
  list: LegacyChineseText[]
): ReplaceItem[] {
  return list.map((item) => ({
    source: "template",
    start: item.offset,
    end: item.offset + item.text.length,
    replace: `{{ $t('${item.text}') }}`,
  }));
}
