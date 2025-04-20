<div align="center">

# 📺  [television-vscode](https://marketplace.visualstudio.com/items?itemName=alexpasmantier.television)
**A fuzzy finder for VSCode based on [television](https://github.com/alexpasmantier/television).**. 


![GitHub Release](https://img.shields.io/github/v/release/alexpasmantier/television?display_name=tag&color=%23a6a)
![Crates.io Size](https://img.shields.io/crates/size/television)
![docs.rs](https://img.shields.io/docsrs/television-channels)
![GitHub branch check runs](https://img.shields.io/github/check-runs/alexpasmantier/television/main)
![GitHub License](https://img.shields.io/github/license/alexpasmantier/television)
![Crates.io Total Downloads](https://img.shields.io/crates/d/television)

<img width="1463" alt="tv-vscode" src="https://github.com/user-attachments/assets/c03bf1d7-7cbe-47cc-9143-30a716e61af4" />
</div>

## About
`Television` is a cross-platform, fast and extensible fuzzy finder TUI.

It lets you quickly search through any kind of data source (files, git repositories, environment variables, docker
images, you name it) using a fuzzy matching algorithm and is designed to be easily extensible.

It is inspired by the neovim [telescope](https://github.com/nvim-telescope/telescope.nvim) plugin and leverages [tokio](https://github.com/tokio-rs/tokio) and the [nucleo](https://github.com/helix-editor/nucleo) matcher used by the [helix](https://github.com/helix-editor/helix) editor to ensure optimal performance.


## VSCode Extension
[VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=alexpasmantier.television)

This extension integrates `tv` inside of `vscode` to provide a better file picker than the vscode default.

## Requirements

The extensions requires [television](https://github.com/alexpasmantier/television) to be installed and available on your
PATH.

Installation instructions may be found [here](https://github.com/alexpasmantier/television/wiki/Installation).

## Default keybindings

Television comes with the following keybindings:
- <kbd>ctrl+p</kbd>: toggle file finder

These can be overridden by opening `Preferences: Open Keyboard Shortcuts`, and searching for `television`.
