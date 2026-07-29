import type { ReplaceItem } from "../types";

/**
 * 坐标换算工具:将局部偏移的 ReplaceItem 平移到全局坐标。
 *
 * 设计要点:
 * - 纯函数,不修改输入,返回新数组。
 * - analyzer/generator 产出的 ReplaceItem 偏移基于块 content 局部字符串,
 *   converter 调用此函数叠加 contentStart,得到 SFC 全局偏移,
 *   供 transformer 在整段 SFC 源码上精确修改。
 * - source 字段保留:虽然平移后 source 信息已隐含在坐标中,
 *   但保留它便于调试与未来按块分组处理。
 */
export function shiftReplaceItems(
  items: ReplaceItem[],
  offset: number
): ReplaceItem[] {
  return items.map((item) => ({
    source: item.source,
    start: item.start + offset,
    end: item.end + offset,
    replace: item.replace,
  }));
}
