import os from "os";
import path from "path";
import * as vscode from "vscode";
import { info } from "./logging";

export function maybeCloseTerminal(terminal: vscode.Terminal | undefined) {
  if (terminal) {
    info("Found existing terminal, closing it");
    terminal.dispose();
    return true;
  }
  return false;
}

const TV_TEMP_FILE_NAME = "tv_selection";

export function launchTvTerminal(tv_command: string, cwd: vscode.Uri) {
  const TV_TEMP_FILE = path.join(os.tmpdir(), TV_TEMP_FILE_NAME);
  const terminal = vscode.window.createTerminal({
    name: "TV Finder",
    shellPath: "sh",
    shellArgs: ["-c", tv_command + " | tee " + TV_TEMP_FILE],
    location: vscode.TerminalLocation.Editor,
    cwd: cwd,
  });
  info("Terminal created");
  terminal.show(); // This is supposed to also focus on the terminal, but occasionally fails
  // Explicitly focus the editor group to mitigate focus race conditions
  vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
  return { terminal, tvFile: TV_TEMP_FILE };
}

export async function readTvFile(tvFile: string) {
  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(tvFile));
  const lines = new TextDecoder()
    .decode(data)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  info("TV file parsed lines:", lines);
  return lines;
}
