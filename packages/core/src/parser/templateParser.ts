import { parse, type RootNode } from "@vue/compiler-dom";

/**
 * Parser:将 Template 字符串解析为 Vue Template AST(RootNode)。
 *
 * 设计要点:
 * - 只负责解析,不做任何遍历/分析/输出(遵循「Parser 不负责业务」)。
 * - 返回原生 RootNode,不包装,让 analyzer 直接消费 AST 类型。
 * - whitespace: 'preserve' 至关重要:默认 'condense' 会压缩 TextNode content
 *   中的空白,但 loc.start.offset 仍指向源码原始位置,导致 content 内偏移
 *   与源码偏移错位,后续 analyzer 的精确片段定位会算错。preserve 让 content
 *   与源码逐字对应,offset 计算才可靠。
 */
export function parseTemplate(template: string): RootNode {
  return parse(template, { whitespace: "preserve" });
}
