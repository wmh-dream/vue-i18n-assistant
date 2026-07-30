import {
  NodeTypes,
  type AttributeNode,
  type ElementNode,
} from "@vue/compiler-dom";
import { containsChinese } from "../utils/index.js";
import type { ChineseAttributeSnippet } from "../types/index.js";

/**
 * Analyzer:从 ElementNode 的 props 中收集需要 i18n 的静态属性。
 *
 * 设计要点:
 * - 只处理 NodeTypes.ATTRIBUTE(静态属性,如 placeholder="请输入"),
 *   不处理 DIRECTIVE(v-bind/v-on 等):指令的值是 JS 表达式,
 *   由 directiveAnalyzer 独立处理(解析表达式内部字面量)。
 * - 不用白名单:中文 UI 文案辨识度高,只要静态属性值含中文就翻译,
 *   覆盖 text/description/confirm-text 等任意属性名,避免频繁扩展白名单。
 *   动态绑定(:attr)和纯英文属性天然不受影响。
 * - 不处理 value 为空或非字符串的属性。
 * - 用 containsChinese 过滤:value 无中文则跳过,避免无意义 snippet。
 * - 产出 ChineseAttributeSnippet,携带整个 AttributeNode 的位置区间,
 *   供 generator 覆盖整个属性(含属性名)以加 `:` 前缀。
 *
 * 不使用正则:遍历 AST props,通过 NodeTypes 判类型,通过 loc 取位置。
 */
export function analyzeAttributes(
  element: ElementNode
): ChineseAttributeSnippet[] {
  const result: ChineseAttributeSnippet[] = [];

  for (const prop of element.props) {
    // 只处理静态属性节点
    if (prop.type !== NodeTypes.ATTRIBUTE) continue;

    const attr = prop as AttributeNode;
    const name = attr.name;

    // 静态属性值必为 TextNode 或 null(无值属性如 disabled)
    if (attr.value === null || attr.value === undefined) continue;
    if (attr.value.type !== NodeTypes.TEXT) continue;

    const value = attr.value.content;
    if (!containsChinese(value)) continue;

    result.push({
      source: "template",
      case: "attribute",
      attributeName: name,
      value, // 保留原值(含内部空白),作为 i18n key
      attrNodeStart: attr.loc.start.offset,
      attrNodeEnd: attr.loc.end.offset,
    });
  }

  return result;
}
