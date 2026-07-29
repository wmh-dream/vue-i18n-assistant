/**
 * @assistant/core 包出口。
 *
 * 设计要点:
 * - 只做 re-export,不含任何业务/demo 代码,便于被 packages/vscode、
 *   packages/cli 等消费方稳定 import。
 * - 按职责分组导出,调用方按需引入。
 */

// Parser:解析 SFC / Template
export { parseVue, parseVueDescriptor } from "./parser/vueParser.js";
export type {
  VueSFCResult,
  VueSFCDescriptorResult,
  SFCBlockWithOffset,
} from "./parser/vueParser.js";
export { parseTemplate } from "./parser/templateParser.js";
export { parseScript } from "./parser/scriptParser.js";

// Analyzer:识别中文位置
export { collectChinese } from "./analyzer/collectChinese.js";
export { analyzeAttributes } from "./analyzer/attributes.js";
export { analyzeScript } from "./analyzer/scriptAnalyzer.js";

// Generator:生成 ReplaceItem
export { buildTemplateReplace } from "./generator/templateGenerator.js";
export { buildScriptReplace } from "./generator/scriptGenerator.js";

// Transformer:修改源码
export { applyReplace } from "./transformer/wrapText.js";

// Converter:组织 pipeline
export { convertTemplate } from "./converter/templateConverter.js";
export { convertScript } from "./converter/scriptConverter.js";
export { convertVue } from "./converter/vueConverter.js";

// Types
export type {
  SourceType,
  ChineseCase,
  ChineseSnippet,
  ChineseTextSnippet,
  ChineseAttributeSnippet,
  ChineseScriptLiteralSnippet,
  ReplaceItem,
} from "./types/index.js";

// Utils
export {
  CHINESE_RANGE_REGEX,
  findChineseRanges,
  containsChinese,
  shiftReplaceItems,
  printAST,
  type ChineseRange,
} from "./utils/index.js";
