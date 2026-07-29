import {
  NodeTypes,
  type TemplateChildNode,
} from "@vue/compiler-dom";

/**
 * 调试工具:打印 Template AST 结构。
 *
 * 从 parser 迁出:打印属于业务/调试,parser 只应负责解析。
 * 放 utils:不依赖 analyzer 状态,是通用 AST 工具。
 */
export function printAST(node: TemplateChildNode, depth = 0) {
  const indent = "  ".repeat(depth);

  switch (node.type) {
    case NodeTypes.ELEMENT:
      console.log(`${indent}<${node.tag}>`);
      node.children.forEach((child) => {
        printAST(child, depth + 1);
      });
      break;

    case NodeTypes.TEXT:
      console.log(`${indent}TEXT: "${node.content}"`);
      break;

    case NodeTypes.INTERPOLATION:
      console.log(`${indent}INTERPOLATION: {{${node.content.content}}}`);
      break;

    default:
      console.log(`${indent}${NodeTypes[node.type]}`);
  }
}
