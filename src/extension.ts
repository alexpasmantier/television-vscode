import { exec } from "child_process";
import os from "os";
import path from "path";
import * as vscode from "vscode";

function log(message: string, ...args: unknown[]) {
  const now = new Date().toISOString();
  console.log(`[TV] ${now} - ${message}`, ...args);
}

function maybeCloseTerminal(terminal: vscode.Terminal | undefined) {
  if (terminal) {
    log("Found existing terminal, closing it");
    terminal.dispose();
    return true;
  }
  return false;
}

const TV_TEMP_FILE_NAME = "tv_selection";

function launchTvTerminal(tv_command: string, cwd: vscode.Uri) {
  const TV_TEMP_FILE = path.join(os.tmpdir(), TV_TEMP_FILE_NAME);
  const terminal = vscode.window.createTerminal({
    name: "TV Finder",
    shellPath: "sh",
    shellArgs: ["-c", tv_command + " | tee " + TV_TEMP_FILE],
    location: vscode.TerminalLocation.Editor,
    cwd: cwd,
  });
  log("Terminal created");
  terminal.show(); // This is supposed to also focus on the terminal, but occasionally fails
  // Explicitly focus the editor group to mitigate focus race conditions
  vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
  return { terminal, tvFile: TV_TEMP_FILE };
}

async function readTvFile(tvFile: string) {
  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(tvFile));
  const lines = new TextDecoder()
    .decode(data)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  log("TV file parsed lines:", lines);
  return lines;
}

async function openFiles(paths: string[], workspaceFolder: vscode.Uri) {
  await Promise.all(
    paths.map(async (filePath, _) => {
      const fileUri = vscode.Uri.joinPath(workspaceFolder, filePath);
      log("Opening file:", fileUri.fsPath);
      const doc = await vscode.workspace.openTextDocument(fileUri);
      await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.Active, // Opens in a new tab instead of replacing
        preview: false, // Ensures the tab stays open
      });
    }),
  );
}

const TELEVISION_FILES_COMMAND = "tv --no-remote files";

async function toggleFileFinderHandler() {
  // Ensure workspace is open
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showInformationMessage(
      "[Television] - No workspace is open.",
    );
    return;
  }
  const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
  // Try to find an existing terminal with the name "TV Finder"
  if (
    maybeCloseTerminal(
      vscode.window.terminals.find((t) => t.name === "TV Finder"),
    )
  ) {
    return;
  }
  // launch TV in new terminal
  const { terminal, tvFile } = launchTvTerminal(
    TELEVISION_FILES_COMMAND,
    workspaceFolder,
  );
  // Listen for terminal close, but only for this specific terminal
  const closeListener = vscode.window.onDidCloseTerminal(async (t) => {
    if (t === terminal) {
      // Ensure it's our terminal
      log("TV Finder terminal closed");
      if (t.exitStatus && t.exitStatus.code !== undefined) {
        log(`Exit code: ${t.exitStatus.code}`);
        try {
          const lines = await readTvFile(tvFile);
          await openFiles(lines, workspaceFolder);
        } catch (error) {
          log("Error reading or opening file:", error);
          vscode.window.showErrorMessage(`Failed to open files: ${error}`);
        }
      }
      // Cleanup: Remove event listener after terminal is handled
      closeListener.dispose();
    }
  });
}

const MINIMUM_TV_VERSION = "0.11.8";

export async function activate(context: {
  subscriptions: vscode.Disposable[];
}) {
  log("Activating Television");
  // ensure tv is installed and available in PATH
  if (!(await checkBinaryAvailability())) {
    warnBinaryNotFound();
    return;
  }
  // ensure tv version is greater than MINIMUM_TV_VERSION
  if (!(await checkBinaryVersion())) {
    warnBinaryNeedsUpdate(MINIMUM_TV_VERSION);
    return;
  }

  log("Registering ToggleFileFinder command");
  let disposable = vscode.commands.registerCommand(
    "television.ToggleFileFinder",
    toggleFileFinderHandler,
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}

function checkBinaryAvailability() {
  return new Promise((resolve) => {
    const command = os.platform() === "win32" ? "where tv" : "which tv";
    exec(command, (error, stdout) => {
      if (!error && stdout.trim()) {
        console.log(`Television binary found: ${stdout.trim()}`);
        resolve(true);
      } else {
        console.error("Television binary not found in PATH.");
        resolve(false);
      }
    });
  });
}

function checkBinaryVersion() {
  return new Promise((resolve) => {
    const command = "tv --version";
    exec(command, (error, stdout) => {
      if (error) {
        console.error("Error checking Television version:", error);
        resolve(false);
        return;
      }
      const version = stdout.trim();
      console.log(`Television version found: ${version}`);
      console.log(`Minimum required version: ${MINIMUM_TV_VERSION}`);
      if (compareVersions(version, MINIMUM_TV_VERSION) < 0) {
        console.error(
          `Television version ${version} is lower than minimum required version ${MINIMUM_TV_VERSION}.`,
        );
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

function warnBinaryNotFound() {
  vscode.window
    .showErrorMessage(
      "The television binary doesn't seem to be available. Try installing it by following the installation docs.",
      "Installation docs",
    )
    .then((selection) => {
      if (selection === "Installation docs") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "https://github.com/alexpasmantier/television/wiki/Installation",
          ),
        );
      }
    });
}

function warnBinaryNeedsUpdate(min_version: string) {
  vscode.window
    .showErrorMessage(
      "The television binary is outdated (minimum version is: " +
        min_version +
        "). Try updating it by following the installation docs.",
      "Installation docs",
    )
    .then((selection) => {
      if (selection === "Installation docs") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            "https://github.com/alexpasmantier/television/wiki/Installation",
          ),
        );
      }
    });
}

function compareVersions(version1: string, version2: string) {
  const v1parts = version1.split(".").map(Number);
  const v2parts = version2.split(".").map(Number);
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1 = v1parts[i] || 0;
    const v2 = v2parts[i] || 0;
    if (v1 < v2) {
      return -1;
    }
    if (v1 > v2) {
      return 1;
    }
  }
  return 0;
}
