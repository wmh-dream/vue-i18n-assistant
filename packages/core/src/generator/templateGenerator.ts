import type { ChineseSnippet, ReplaceItem } from "../types";

/**
 * Generator:将 ChineseSnippet 转换为 ReplaceItem。
 *
 * 设计要点:
 * - 只负责「决定替换文本长什么样」,不读取/修改源码(transformer 职责)。
 * - 当前仅处理 case === 'text':TextNode 中文片段包成 {{ $t('...') }}。
 * - 后续新增 attribute / interpolation 场景时,在此按 case 分支扩展,
 *   analyzer/transformer 无需改动。
 */
export function buildTemplateReplace(list: ChineseSnippet[]): ReplaceItem[] {
  return list
    .filter((item) => item.case === "text")
    .map((item) => ({
      source: item.source,
      start: item.start,
      end: item.end,
      replace: `{{ $t('${item.text}') }}`,
    }));
}
