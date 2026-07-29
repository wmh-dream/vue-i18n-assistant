/**
 * 中文检测与片段提取工具。
 *
 * 设计要点:
 * - 纯字符串工具,不依赖任何 AST,可被 analyzer / generator / 未来 script 处理复用。
 * - CHINESE_RANGE_REGEX 使用全局匹配,matchAll 一次性枚举所有连续中文片段。
 * - 覆盖 CJK 统一表意文字基本区 [\u4e00-\u9fa5],暂不含扩展区(A/B/...),
 *   企业级如需扩展再在此调整,调用方无感。
 */
export const CHINESE_RANGE_REGEX = /[\u4e00-\u9fa5]+/g;

/**
 * 输入字符串中的一段连续中文片段及其相对该字符串的偏移。
 */
export interface ChineseRange {
  text: string;
  start: number;
  end: number;
}

/**
 * 从输入字符串中提取所有连续中文片段及其相对偏移。
 *
 * 例:findChineseRanges("  提交abc保存") =>
 *   [{ text: "提交", start: 2, end: 4 }, { text: "保存", start: 9, end: 11 }]
 *
 * 用于 TextNode / Attribute / 字符串字面量内部的精确片段定位,
 * 配合节点 loc.start.offset 即可换算成源码绝对偏移。
 */
export function findChineseRanges(text: string): ChineseRange[] {
  const ranges: ChineseRange[] = [];

  for (const match of text.matchAll(CHINESE_RANGE_REGEX)) {
    const matchedText = match[0];
    const start = match.index;
    if (start === undefined) continue;

    ranges.push({
      text: matchedText,
      start,
      end: start + matchedText.length,
    });
  }

  return ranges;
}

/**
 * 判断字符串是否包含任意中文字符。
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}
