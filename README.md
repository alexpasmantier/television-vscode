<div align="center">

# 📺  [television-vscode](https://marketplace.visualstudio.com/items?itemName=alexpasmantier.television)
**A fuzzy finder for VSCode based on [television](https://github.com/alexpasmantier/television)**


![GitHub branch check runs](https://img.shields.io/github/check-runs/alexpasmantier/television/main)
![GitHub License](https://img.shields.io/github/license/alexpasmantier/television)

<img width="1463" alt="tv-vscode" src="https://github.com/user-attachments/assets/c03bf1d7-7cbe-47cc-9143-30a716e61af4" />
</div>

## About
`Television` is a cross-platform, fast and extensible fuzzy finder TUI.

It lets you quickly search through any kind of data source (files, git repositories, environment variables, docker
images, you name it) using a fuzzy matching algorithm and is designed to be easily extensible.

It is inspired by the neovim [telescope](https://github.com/nvim-telescope/telescope.nvim) plugin and leverages [tokio](https://github.com/tokio-rs/tokio) and the [nucleo](https://github.com/helix-editor/nucleo) matcher used by the [helix](https://github.com/helix-editor/helix) editor to ensure optimal performance.


## VSCode Extension
[television on the VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=alexpasmantier.television)

This extension integrates `tv` inside of `vscode` to provide a better file picker than the vscode default.

## Open VSX Registry
[television on the Open VSX Registry](https://open-vsx.org/extension/alexpasmantier/television)

## Requirements

The extensions requires [television](https://github.com/alexpasmantier/television) to be installed and available on your
PATH.

Installation instructions may be found [here](https://github.com/alexpasmantier/television/wiki/Installation).

For example,installing on Homebrew can be done as follows:
```bash
brew install television
```

Once installed, run the command below, which will install the `files` and `text` channels that are required by the extension.

```bash
tv update-channels
```

See [television](https://github.com/alexpasmantier/television) for more details.

## Default keybindings

Television comes with the following keybindings:
- <kbd>ctrl+p</kbd>: toggle file finder
- <kbd>ctrl+shift+f</kbd>: toggle text finder (search in files, e.g. `grep`)

These can be overridden by opening `Preferences: Open Keyboard Shortcuts`, and searching for `television`.
