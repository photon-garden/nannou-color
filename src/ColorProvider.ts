import * as vscode from 'vscode'

export default class ColorProvider implements vscode.DocumentColorProvider {
  provideColorPresentations (
    color: vscode.Color,
    context: ProvideColorPresentationsContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.ColorPresentation[]> {
    console.debug('Translating colors into source code.')

    const representationInSourceCode = this.toColorLiteral(color)
    const label = representationInSourceCode

    const colorPresentation = new vscode.ColorPresentation(label)

    // If your label and your source code representation are different, uncomment the code below.
    //
    // colorPresentation.textEdit = new vscode.TextEdit(
    //   context.range,
    //   representationInSourceCode
    // )

    return [colorPresentation]
  }

  provideDocumentColors (
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.ColorInformation[]> {
    console.debug('Searching document for color literals.')

    const text = document.getText()

    return this.findAllColorLiterals(text).map(match => {
      const { matchedString, startIndex, endIndex } = match

      console.debug('Found a match:', matchedString)
      console.debug('Starting index:', startIndex)
      console.debug('Ending index:', endIndex)

      const startPosition = document.positionAt(startIndex)
      const endPosition = document.positionAt(endIndex)
      const range = new vscode.Range(startPosition, endPosition)
      console.debug('Range:', range)

      const color = this.parseColorLiteral(matchedString)
      console.debug('RGBA:', color.red, color.green, color.blue, color.alpha)

      console.debug('')

      return new vscode.ColorInformation(range, color)
    })
  }

  findAllColorLiterals (text: string): Match[] {
    // Matches strings like color_picker(255, 255, 255, 255).
    const regex = /color_picker\(\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*\,\s*\d+\.?\d*\s*\)/gi
    return this.findAllMatches(text, regex)
  }

  findAllMatches (text: string, regex: RegExp): Match[] {
    const matches = text.matchAll(regex)

    return Array.from(matches).map(match => {
      const matchedString = match[0]

      const startIndex = match.index!
      const endIndex = startIndex + matchedString.length

      return {
        matchedString,
        startIndex,
        endIndex
      }
    })
  }

  parseColorLiteral (string: string): vscode.Color {
    const [r, g, b, a] = string
      .replace('color_picker(', '')
      .replace(')', '')
      .split(',')
      .map(component => component.trim())
      .map(component => Number.parseInt(component))
      .map(component => component / 255)

    return new vscode.Color(r, g, b, a)
  }

  toColorLiteral (color: vscode.Color): string {
    const red = Math.round(color.red * 255)
    const green = Math.round(color.green * 255)
    const blue = Math.round(color.blue * 255)
    const alpha = Math.round(color.alpha * 255)

    const components = [red, green, blue, alpha].join(', ')

    return 'color_picker(' + components + ')'
  }
}

interface ProvideColorPresentationsContext {
  document: vscode.TextDocument
  range: vscode.Range
}

interface Match {
  matchedString: string
  startIndex: number
  endIndex: number
}
