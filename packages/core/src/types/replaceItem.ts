import type { SourceType } from "./source";

/**
 * Generator 的产物,Transformer 的输入。
 *
 * 设计要点:
 * - 不携带 case 字段:case 是 analyzer/generator 关心的事,
 *   transformer 只需「在某位置贴某字符串」,保持极简。
 * - source 用于 transformer 区分偏移属于哪个 SFC 块,
 *   配合 converter 完成局部 → 全局坐标换算。
 */
export interface ReplaceItem {
  source: SourceType;
  start: number;
  end: number;
  replace: string;
}
