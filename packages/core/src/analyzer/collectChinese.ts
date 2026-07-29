import {
  NodeTypes,
  type RootNode,
  type TemplateChildNode,
  type ElementNode,
  type TextNode,
  type InterpolationNode,
} from "@vue/compiler-dom";
import { findChineseRanges } from "../utils/index.js";
import { analyzeAttributes } from "./attributes.js";
import type { ChineseSnippet } from "../types/index.js";

/**
 * Analyzer:遍历 Template AST,产出 ChineseSnippet 列表。
 *
 * 设计要点:
 * - 只负责「找出中文及其精确位置」,不生成替换文本(generator 职责)。
 * - TextNode:用 findChineseRanges 枚举每段连续中文,逐段输出 snippet,
 *   精确指向中文本身,不触碰前后空白。
 * - ElementNode:除了递归 children,还分析 props 中的静态属性(白名单),
 *   由 analyzeAttributes 独立模块承担,collectChinese 只做组织。
 * - source 固定为 'template':analyzer 输出局部坐标 + 源标识,
 *   全局换算由 converter 负责。
 */
export function collectChinese(root: RootNode): ChineseSnippet[] {
  const result: ChineseSnippet[] = [];

  function visit(node: TemplateChildNode) {
    switch (node.type) {
      case NodeTypes.ELEMENT:
        visitElement(node);
        break;

      case NodeTypes.TEXT:
        visitText(node);
        break;

      case NodeTypes.INTERPOLATION:
        visitInterpolation(node);
        break;
    }
  }

  function visitElement(node: ElementNode) {
    // 属性分析与子节点遍历是并行的两个维度,互不依赖
    result.push(...analyzeAttributes(node));
    node.children.forEach(visit);
  }

  function visitText(node: TextNode) {
    const ranges = findChineseRanges(node.content);

    for (const range of ranges) {
      // TextNode content 内偏移 + 节点起始偏移 = 源码绝对偏移
      const absoluteStart = node.loc.start.offset + range.start;

      result.push({
        source: "template",
        case: "text",
        text: range.text,
        start: absoluteStart,
        end: absoluteStart + range.text.length,
      });
    }
  }

  function visitInterpolation(_node: InterpolationNode) {
    // 预留:{{ }} 表达式中的中文字符串字面量,后续实现
  }

  root.children.forEach(visit);

  return result;
}

