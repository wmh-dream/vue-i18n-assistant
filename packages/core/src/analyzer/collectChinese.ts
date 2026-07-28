import {
  NodeTypes,
  type RootNode,
  type TemplateChildNode,
  type ElementNode,
  type TextNode,
  type InterpolationNode,
} from "@vue/compiler-dom";
export interface ChineseText {
  text: string;
  offset: number;
  type: "text";
}
const chineseReg = /[\u4e00-\u9fa5]/;

export function collectChinese(root: RootNode): string[] {
  const result: ChineseText[] = [];

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
    node.children.forEach(visit);
  }

  function visitText(node: TextNode) {
    const text = node.content.trim();

    if (!text) return;

    if (chineseReg.test(text)) {
      result.push({
        text,
        offset: node.loc.start.offset,
        type: "text",
      });
    }
  }

  function visitInterpolation(node: InterpolationNode) {
    // 暂时先不处理
  }

  root.children.forEach(visit);

  return result;
}
