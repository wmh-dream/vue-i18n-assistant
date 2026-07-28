import { parseTemplate } from "../parser/templateParser";
import { collectChinese } from "../analyzer/collectChinese";
import { wrapText } from "../transformer/wrapText";

export function convertTemplate(template: string) {
  const ast = parseTemplate(template);

  const chinese = collectChinese(ast);

  return wrapText(template, chinese);
}
