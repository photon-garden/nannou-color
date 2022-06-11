// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import ColorProvider from './ColorProvider'
import switchToSnapshot from './switchToSnapshot'

const versionNumber = 8

// This method is called when the extension is activated.
export function activate (context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error).
  // This line of code will only be executed once when the extension is activated.
  console.log(`🎨 Version ${versionNumber} of wind-walk is active.`)

  const colorProvider = new ColorProvider()

  // If you want to change the supported languages, make sure to also update the
  // activationEvents key in package.json.
  let colorDisposable = vscode.languages.registerColorProvider(
    ['rust'],
    colorProvider
  )

  let switchToSnapshotDisposable = vscode.commands.registerCommand('wind-walk.switchToSnapshot', switchToSnapshot)

  context.subscriptions.push(colorDisposable)
  context.subscriptions.push(switchToSnapshotDisposable)
}

// This method is called when the extension is deactivated.
export function deactivate () {}
