import { parseTemplate } from "../parser/templateParser";
import { collectChinese } from "../analyzer/collectChinese";
import { buildTemplateReplace } from "../generator/templateGenerator";
import { applyReplace } from "../transformer/wrapText";

export function convertTemplate(template: string) {
  const ast = parseTemplate(template);

  const chinese = collectChinese(ast);

  const replaceItems = buildTemplateReplace(chinese);

  return applyReplace(template, replaceItems);
}
