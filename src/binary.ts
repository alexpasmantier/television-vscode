import { exec } from "child_process";
import os from "os";
import * as vscode from "vscode";
import { info, err, warn } from "./logging";

export const MINIMUM_TV_VERSION = "0.13.0";
export const INSTALLATION_DOCS_URL = "https://alexpasmantier.github.io/television/docs/Users/installation/";

export function checkBinaryAvailability() {
  return new Promise((resolve) => {
    const command = os.platform() === "win32" ? "where tv" : "which tv";
    exec(command, (error, stdout) => {
      if (!error && stdout.trim()) {
        info(`Television binary found: ${stdout.trim()}`);
        resolve(true);
      } else {
        warn("Television binary not found in PATH.");
        resolve(false);
      }
    });
  });
}

export function checkBinaryVersion() {
  return new Promise((resolve) => {
    const command = "tv --version";
    exec(command, (error, stdout) => {
      if (error) {
        err("Error checking Television version:", error);
        resolve(false);
        return;
      }
      const version = stdout.trim();
      info(`Television version found: ${version}`);
      info(`Minimum required version: ${MINIMUM_TV_VERSION}`);
      if (compareVersions(version, MINIMUM_TV_VERSION) < 0) {
        warn(
          `Television version ${version} is lower than minimum required version ${MINIMUM_TV_VERSION}.`,
        );
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

export function warnBinaryNotFound() {
  vscode.window
    .showErrorMessage(
      "The television binary doesn't seem to be available. Try installing it by following the installation docs.",
      "Installation docs",
    )
    .then((selection) => {
      if (selection === "Installation docs") {
        vscode.env.openExternal(
          vscode.Uri.parse(
            INSTALLATION_DOCS_URL,
          ),
        );
      }
    });
}

export function warnBinaryNeedsUpdate(min_version: string) {
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
            INSTALLATION_DOCS_URL,
          ),
        );
      }
    });
}

export function compareVersions(version1: string, version2: string) {
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
