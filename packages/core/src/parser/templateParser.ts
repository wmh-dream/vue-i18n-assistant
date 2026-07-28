import {
  parse,
  NodeTypes,
  type RootNode,
  type TemplateChildNode,
} from "@vue/compiler-dom";

export function parseTemplate(template: string): RootNode {
  return parse(template);
}

/**
 * 打印 AST
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
