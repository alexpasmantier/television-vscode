import { openFilesAtLines } from "../utils";
import { genericHandler } from "./generic";
import * as vscode from "vscode";

const TELEVISION_COMMAND = "tv --no-remote text";

export async function textHandler() {
  const editor = vscode.window.activeTextEditor;
  let command = TELEVISION_COMMAND;

  if (editor) {
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (selectedText && !selection.isEmpty) {
      // Escape for shell inside single quotes: \ -> \\ and ' -> \'
      const escapedQuery = selectedText
        .replace(/\\/g, "\\\\") // Escape backslashes first
        .replace(/'/g, "\\'"); // Escape single quotes

      // Append the input argument and the escaped value, properly quoted
      command = `${TELEVISION_COMMAND} --input '${escapedQuery}'`;
    }
  }

  genericHandler("TV Text", command, openFilesAtLines);
}
