import * as vscode from "vscode";
import { convertVue } from "@assistant/core";

/**
 * Command: Convert Current Vue File
 *
 * 流程:
 * 1. 取当前 activeTextEditor,校验是 .vue 文件
 * 2. 读取全文 → 调用 core 的 convertVue()
 * 3. 用 WorkspaceEdit 整体替换文档
 *
 * 设计要点:
 * - 不重新实现国际化逻辑,完全委托 @assistant/core
 * - 用 WorkspaceEdit 而非 TextEditor.edit:符合 VSCode 最佳实践,
 *   支持撤销栈、事件广播、未来批量文件改造复用
 * - 非破坏性:无中文时 convertVue 返回原文本,WorkspaceEdit 仍创建
 *   但无实际差异,VSCode 自动忽略空变更
 */
export async function convertCurrentVueFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("没有打开的编辑器");
    return;
  }

  const document = editor.document;

  // 只处理 .vue 文件
  if (document.languageId !== "vue" && !document.fileName.endsWith(".vue")) {
    vscode.window.showWarningMessage("当前文件不是 Vue 单文件组件(.vue)");
    return;
  }

  const source = document.getText();
  const converted = convertVue(source);

  // 无变更时提示并跳过(避免无意义的编辑栈)
  if (converted === source) {
    vscode.window.showInformationMessage("未发现需要国际化的中文");
    return;
  }

  // 用 WorkspaceEdit 整体替换:覆盖整个文档范围
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(source.length)
  );

  const workspaceEdit = new vscode.WorkspaceEdit();
  workspaceEdit.replace(document.uri, fullRange, converted);

  await vscode.workspace.applyEdit(workspaceEdit);

  vscode.window.showInformationMessage("Vue 文件国际化完成");
}
