import type { ChineseCase, SourceType } from "./source";

/**
 * Analyzer 的产物:一段连续中文文本及其在局部源码中的精确位置。
 *
 * 设计要点:
 * - text 为已提取的纯中文片段(非整个 TextNode 内容),
 *   配合「只替换中文片段」的语义,start/end 精确指向该片段本身。
 * - start/end 基于 source 对应块的局部字符串,不涉及 SFC 全局偏移;
 *   全局换算由 converter 负责,保证 analyzer 单一职责。
 */
export interface ChineseSnippet {
  source: SourceType;
  case: ChineseCase;
  text: string;
  start: number;
  end: number;
}
