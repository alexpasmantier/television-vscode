import * as vscode from "vscode";
import { info, err } from "../logging";
import { launchTvTerminal, maybeCloseTerminal, readTvFile } from "../terminal";

/**
 * Generic handler for launching a terminal with a command and handling its exit.
 * @param name - The name of the terminal.
 * @param tv_command - The command to run in the terminal.
 * @param on_exit - Callback function to handle tv's output.
 */
export async function genericHandler(
  name: string,
  tv_command: string,
  on_exit: (lines: string[], workspaceFolder: vscode.Uri) => void,
) {
  // Ensure workspace is open
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage(
      `[Television] - No workspace is open.`,
    );
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
  // Try to find an existing terminal with the same name
  if (
    maybeCloseTerminal(vscode.window.terminals.find((t) => t.name === name))
  ) {
    return;
  }
  // launch TV in new terminal
  const { terminal, tvFile } = launchTvTerminal(tv_command, workspaceFolder);
  // Listen for terminal close, but only for this specific terminal
  const closeListener = vscode.window.onDidCloseTerminal(async (t) => {
    if (t === terminal) {
      // Ensure it's our terminal
      info(`${name} terminal closed`);
      if (t.exitStatus && t.exitStatus.code !== undefined) {
        info(`Exit code: ${t.exitStatus.code}`);
        try {
          const lines = await readTvFile(tvFile);
          on_exit(lines, workspaceFolder);
        } catch (error) {
          err("Error reading or opening file:", error);
          vscode.window.showErrorMessage(`Failed to open files: ${error}`);
        }
      }
      // Cleanup: Remove event listener after terminal is handled
      closeListener.dispose();
    }
  });
}
