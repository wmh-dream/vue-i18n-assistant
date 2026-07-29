/**
 * SFC 块标识:所有 offset 均为对应块局部字符串的偏移
 * - template: <template> 块内容
 * - script: <script> 块内容(非 setup)
 * - scriptSetup: <script setup> 块内容
 */
export type SourceType = "template" | "script" | "scriptSetup";

/**
 * 中文出现场景:决定 generator 如何包装替换文本
 * - text: TextNode 中的纯文本
 * - attribute: 元素属性值中的中文(后续支持)
 * - interpolation: {{ }} 表达式中的中文字符串(后续支持)
 */
export type ChineseCase = "text" | "attribute" | "interpolation";
