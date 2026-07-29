import type {
  ChineseSnippet,
  ChineseTextSnippet,
  ChineseAttributeSnippet,
  ReplaceItem,
} from "../types";

/**
 * Generator:将 ChineseSnippet 转换为 ReplaceItem。
 *
 * 设计要点:
 * - 只负责「决定替换文本长什么样」,不读取/修改源码(transformer 职责)。
 * - 按 case 分支处理,类型自动收窄,各场景互不干扰。
 * - text: TextNode 中文片段包成 {{ $t('...') }}
 * - attribute: 整个属性节点替换为 :attr="$t('...')"
 *   (必须覆盖属性名+等号+值,才能在属性名前加 `:`,否则 $t 会被当字符串字面量)
 *
 * 后续新增 interpolation 等场景,在此追加 case 分支,analyzer/transformer 无需改动。
 */
export function buildTemplateReplace(list: ChineseSnippet[]): ReplaceItem[] {
  const result: ReplaceItem[] = [];

  for (const snippet of list) {
    switch (snippet.case) {
      case "text":
        result.push(buildTextReplace(snippet));
        break;

      case "attribute":
        result.push(buildAttributeReplace(snippet));
        break;
    }
  }

  return result;
}

function buildTextReplace(snippet: ChineseTextSnippet): ReplaceItem {
  return {
    source: snippet.source,
    start: snippet.start,
    end: snippet.end,
    replace: `{{ $t('${snippet.text}') }}`,
  };
}

function buildAttributeReplace(snippet: ChineseAttributeSnippet): ReplaceItem {
  // 覆盖整个属性节点(属性名=值),替换为 :attr="$t('value')"
  // value 作为 i18n key,保留原值不 trim(如 "请输入姓名" 整体作 key)
  return {
    source: snippet.source,
    start: snippet.attrNodeStart,
    end: snippet.attrNodeEnd,
    replace: `:${snippet.attributeName}="$t('${snippet.value}')"`,
  };
}
