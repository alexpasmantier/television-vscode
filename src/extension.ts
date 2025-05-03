import * as vscode from "vscode";
import { info } from "./logging";
import {
  checkBinaryAvailability,
  checkBinaryVersion,
  MINIMUM_TV_VERSION,
  warnBinaryNeedsUpdate,
  warnBinaryNotFound,
} from "./binary";
import { filesHandler } from "./channels/files";
import { textHandler, textHandlerWithSelection } from "./channels/text";

export async function activate(context: {
  subscriptions: vscode.Disposable[];
}) {
  info("Activating Television");
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

  // register commands and handlers
  // Files
  // -------------------------------------------------------------------------
  info("Registering ToggleFileFinder command");
  let disposable = vscode.commands.registerCommand(
    "television.ToggleFileFinder",
    filesHandler,
  );
  context.subscriptions.push(disposable);
  // Text
  // -------------------------------------------------------------------------
  info("Registering ToggleTextFinder command");
  disposable = vscode.commands.registerCommand(
    "television.ToggleTextFinder",
    textHandler,
  );
  context.subscriptions.push(disposable);
  // Text with Selection
  // -------------------------------------------------------------------------
  info("Registering ToggleTextFinderWithSelection command");
  disposable = vscode.commands.registerCommand(
    "television.ToggleTextFinderWithSelection",
    textHandlerWithSelection,
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
