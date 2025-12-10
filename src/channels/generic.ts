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

  // Handle multi-folder workspaces by checking setting or prompting user to select
  let workspaceFolder: vscode.Uri;
  if (vscode.workspace.workspaceFolders.length === 1) {
    workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
  } else {
    // Check for default workspace folder setting
    const config = vscode.workspace.getConfiguration('television');
    const defaultFolderName = config.get<string>('defaultWorkspaceFolder');
    
    if (defaultFolderName) {
      // Try to find the configured folder by name
      const defaultFolder = vscode.workspace.workspaceFolders.find(
        (folder: vscode.WorkspaceFolder) => folder.name === defaultFolderName
      );
      
      if (defaultFolder) {
        workspaceFolder = defaultFolder.uri;
        info(`Using configured default workspace folder: ${defaultFolderName}`);
      } else {
        // Show error if configured folder not found
        const availableFolders = vscode.workspace.workspaceFolders.map((f: vscode.WorkspaceFolder) => f.name).join(', ');
        vscode.window.showErrorMessage(
          `Configured default workspace folder '${defaultFolderName}' not found. Available folders: ${availableFolders}`
        );
        return;
      }
    } else {
      // Show picker to select workspace folder
      const items = vscode.workspace.workspaceFolders.map((folder: vscode.WorkspaceFolder) => ({
        label: folder.name,
        description: folder.uri.fsPath,
        folder: folder,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: "Select a workspace folder to search",
      });

      if (!selected) {
        return; // User cancelled
      }
      workspaceFolder = selected.folder.uri;
    }
  }
  // Try to find an existing terminal with the same name
  if (
    maybeCloseTerminal(vscode.window.terminals.find((t: vscode.Terminal) => t.name === name))
  ) {
    return;
  }
  // launch TV in new terminal
  const { terminal, tvFile } = launchTvTerminal(tv_command, workspaceFolder);
  // Listen for terminal close, but only for this specific terminal
  const closeListener = vscode.window.onDidCloseTerminal(async (t: vscode.Terminal) => {
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
      // Refocus the editor group
      vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
      // Cleanup: Remove event listener after terminal is handled
      closeListener.dispose();
    }
  });
}
