import type { SourceType } from "./source";

/**
 * Analyzer 的产物:一处中文出现位置。
 *
 * 联合类型:按 case 区分不同 AST 场景,各分支携带该场景所需的位置信息。
 * - text: Template TextNode 中的中文片段,需精确片段位置(只替换中文,不动空白)
 * - attribute: Template 静态属性值中的中文,需整个属性节点位置(generator 要加 `:`)
 * - script-literal: Script 中含中文的字符串/模板字面量,需整个字面量位置
 *   (含引号/反引号),generator 要把整段替换为 $t(...) 调用
 *
 * 后续新增场景,在此追加分支,不破坏现有分支。
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

export interface ChineseScriptLiteralSnippet {
  source: SourceType; // 'script' | 'scriptSetup'
  case: "script-literal";
  kind: "string" | "template"; // 普通字符串字面量 / 模板字面量
  text: string; // 字面量的原始文本内容(不含引号/反引号),作为 i18n key
  start: number; // 整个字面量起点(含引号/反引号)
  end: number; // 整个字面量终点(含引号/反引号)
}

export type ChineseSnippet =
  | ChineseTextSnippet
  | ChineseAttributeSnippet
  | ChineseScriptLiteralSnippet;
