import * as vscode from "vscode";
import { convertCurrentVueFile } from "./commands/convertVue.js";

/**
 * 扩展激活入口。
 *
 * 设计要点:
 * - 只做命令注册,不实现业务逻辑(每个命令独立模块)
 * - 命令 ID 与 package.json contributes.commands 一致
 * - 返回 disposable 供 VSCode 管理生命周期
 */
export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    "vueI18nAssistant.convertCurrentVueFile",
    () => convertCurrentVueFile()
  );

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // 无需显式清理:subscriptions 自动 dispose
}
