import type { SourceType } from "./source";

/**
 * Analyzer 的产物:模板中一处中文出现位置。
 *
 * 联合类型:按 case 区分不同 AST 场景,各分支携带该场景所需的位置信息。
 * - text: TextNode 中的中文片段,需精确片段位置(只替换中文,不动空白)
 * - attribute: 静态属性值中的中文,需整个属性节点位置(generator 要加 `:`)
 *
 * 后续新增 interpolation 等场景,在此追加分支,不破坏现有分支。
 */
export interface ChineseTextSnippet {
  source: SourceType;
  case: "text";
  text: string; // 中文片段本身
  start: number; // 中文片段在源码中的绝对偏移
  end: number;
}

export interface ChineseAttributeSnippet {
  source: SourceType;
  case: "attribute";
  attributeName: string; // 属性名,如 "placeholder"
  value: string; // 完整属性值(作为 i18n key),保留原值不 trim
  attrNodeStart: number; // 整个 AttributeNode 起始偏移(属性名起点)
  attrNodeEnd: number; // 整个 AttributeNode 结束偏移(属性值引号后)
}

export type ChineseSnippet = ChineseTextSnippet | ChineseAttributeSnippet;
