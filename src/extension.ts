// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import ColorProvider from './ColorProvider'

// let color = 'rgb(0.25098039215686274, 0.7372549019607844, 0.8117647058823529)'

const versionNumber = 6

// This method is called when the extension is activated.
export function activate (context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error).
  // This line of code will only be executed once when the extension is activated.
  console.log(`🎨 Version ${versionNumber} of nannou-color is active.`)

  const colorProvider = new ColorProvider()

  // If you want to change the supported languages, make sure to also update the
  // activationEvents key in package.json.
  let disposable = vscode.languages.registerColorProvider(
    ['rust'],
    colorProvider
  )

  context.subscriptions.push(disposable)
}

// This method is called when the extension is deactivated.
export function deactivate () {}
