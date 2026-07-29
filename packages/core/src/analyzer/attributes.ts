import {
  NodeTypes,
  type AttributeNode,
  type ElementNode,
} from "@vue/compiler-dom";
import { containsChinese } from "../utils/index.js";
import type { ChineseAttributeSnippet } from "../types/index.js";

/**
 * 需要做 i18n 的属性白名单。
 *
 * 设计要点:
 * - 业务上「纯展示文案」属性(placeholder/title/label/alt 等)需要 i18n,
 *   而 v-model/disabled/class 等不涉及。用白名单而非黑名单,避免误改。
 * - 用 Set 做 O(1) 查询,且语义明确(集合成员判定)。
 * - 后续新增属性,只改此常量,不改分析逻辑。
 */
const I18N_ATTRIBUTE_NAMES = new Set<string>([
  "placeholder",
  "title",
  "label",
  "alt",
  "empty-text",
  "confirm-button-text",
  "cancel-button-text",
]);

/**
 * Analyzer:从 ElementNode 的 props 中收集需要 i18n 的静态属性。
 *
 * 设计要点:
 * - 只处理 NodeTypes.ATTRIBUTE(静态属性,如 placeholder="请输入"),
 *   不处理 DIRECTIVE(v-bind/v-on 等):指令的值已是表达式,语义不同,
 *   后续如有需求单独分支处理。
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

    // 白名单过滤
    if (!I18N_ATTRIBUTE_NAMES.has(name)) continue;

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
