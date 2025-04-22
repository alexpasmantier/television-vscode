import * as vscode from "vscode";
import { info } from "./logging";

export async function openFiles(paths: string[], workspaceFolder: vscode.Uri) {
  await Promise.all(
    paths.map(async (filePath, _) => {
      const fileUri = vscode.Uri.joinPath(workspaceFolder, filePath);
      info("Opening file:", fileUri.fsPath);
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Active, // Opens in a new tab instead of replacing
        preview: false, // Ensures the tab stays open
      });
    }),
  );
}

export async function openFilesAtLines(
  paths: string[],
  workspaceFolder: vscode.Uri,
) {
  // open each file in a new tab at the given line
  await Promise.all(
    paths.map(async (filePath, _) => {
      const [file, line] = filePath.split(":");
      const fileUri = vscode.Uri.joinPath(workspaceFolder, file);
      info("Opening file:", fileUri.fsPath);
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Active,
        preview: false,
      });
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const position = new vscode.Position(parseInt(line) - 1, 0);
        editor.revealRange(new vscode.Range(position, position));
        editor.selection = new vscode.Selection(position, position);
      }
    }),
  );
}
