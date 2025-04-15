"use strict";

var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });

var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });

var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();

Object.defineProperty(exports, "__esModule", { value: true });

exports.activate = activate;

exports.deactivate = deactivate;

const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));

function log(message, ...args) {
  const now = new Date().toISOString();
  console.log(`[TV] ${now} - ${message}`, ...args);
}

function maybe_close_terminal(terminal) {
  if (terminal) {
    log("Found existing terminal, closing it");
    terminal.dispose();
    return true;
  }
  return false;
}

const TV_TEMP_FILE_NAME = "tv_selection";

function launchTvTerminal(tv_command, cwd) {
  const TV_TEMP_FILE = path.join(os.tmpdir(), TV_TEMP_FILE_NAME);
  const terminal = vscode.window.createTerminal({
    name: "TV Finder",
    shellPath: "sh",
    shellArgs: ["-c", tv_command + " | tee " + TV_TEMP_FILE],
    location: vscode.TerminalLocation.Editor,
    cwd: cwd,
  });
  log("Terminal created");
  terminal.show();
  return { terminal, tvFile: TV_TEMP_FILE };
}

async function readTvFile(tvFile) {
  const data = await vscode.workspace.fs.readFile(vscode.Uri.file(tvFile));
  const lines = new TextDecoder()
    .decode(data)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  log("TV file parsed lines:", lines);
  return lines;
}

async function openFiles(paths, workspaceFolder) {
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
    maybe_close_terminal(
      vscode.window.terminals.find((t) => t.name === "TV Finder"),
    )
  ) {
    return;
  }
  // launch TV in new terminal
  const { terminal, tvFile } = launchTvTerminal("tv", workspaceFolder);
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

async function activate(context) {
  log("Activating Television");
  // ensure tv is installed and available in PATH by checking version
  if (!(await checkBinaryAvailability())) {
    warn_binary_not_found();
  }
  log("Registering ToggleFileFinder command");
  let disposable = vscode.commands.registerCommand(
    "television.ToggleFileFinder",
    toggleFileFinderHandler,
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

function checkBinaryAvailability() {
  return new Promise((resolve) => {
    const command = os.platform() === "win32" ? "where tv" : "which tv";
    (0, child_process_1.exec)(command, (error, stdout) => {
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

function warn_binary_not_found() {
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
