import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs-extra'

export default async function switchToSnapshot() {
    const paths = getPaths()
    console.log("Switching to snapshot.")

    if (paths == null) {
        return
    }

    const { pathToExampleFolder, pathToSrcFolder, pathToSrcFolderBackup, pathToExampleSeedFileAfterCopying } = paths

    console.log("Backing up src folder.")
    console.log("Original location:", pathToSrcFolder)
    console.log("Backup location:", pathToSrcFolderBackup)

    // Make sure the backup folder exists.
    await fs.ensureDir(pathToSrcFolderBackup)

    await fs.move(pathToSrcFolder, pathToSrcFolderBackup, {
        overwrite: true
    })

    // Copy the example into the src folder.
    try {
        console.log("Copying example folder.")
        console.log("Original location:", pathToExampleFolder)
        console.log("Backup location:", pathToSrcFolder)
        await fs.copy(pathToExampleFolder, pathToSrcFolder)
    } catch (error) {
        console.error(error)
        if (error instanceof Error) {
            vscode.window.showErrorMessage("Error copying the example to the src folder:" + error.message)
        } else {
            vscode.window.showErrorMessage("Unknown error. Maybe stringifying it works: " + JSON.stringify(error))
        }

        console.log("Hit an error. Moving src files back out of their backup location.")
        // Move the contents of the src folder back since we hit an error.
        await fs.move(pathToSrcFolder, pathToSrcFolder)
    }

    // Delete the seed.
    // await fs.remove(pathToExampleSeedFileAfterCopying)

    // Sometimes VS Code doesn't notice that we've created a new folder,
    // so prompt it to take a look and update the file explorer.
    const uriToSrcFolderBackup = vscode.Uri.file(pathToSrcFolderBackup)
    vscode.workspace.fs.stat(uriToSrcFolderBackup)
}

function getPaths(): Paths | undefined {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
        vscode.window.showInformationMessage("Focus a text editor then run the command again :)")
        return
    }

    // e.g. /Users/monet/san_giorgio/examples/talented_querulous_burdock/main.rs
    const documentPath = editor.document.uri.fsPath

    const documentPathIsAbsolute = documentPath[0] === path.sep

    // e.g. ['Users', 'monet', 'san_giorgio', 'examples', 'talented_querulous_burdock', 'main.rs']
    const segments = splitPath(documentPath)

    // e.g. 3
    const exampleIndex = findLastIndex(segments, segment => segment === 'examples')

    if (exampleIndex < 0) {
        vscode.window.showInformationMessage("Focus a text editor in the examples folder :)")
        return
    }

    // e.g. talented_querulous_burdock
    const exampleName = segments[exampleIndex + 1]

    if (exampleName == null) {
        vscode.window.showInformationMessage("Focus a file in the examples folder :)")
        return
    }

    // e.g. ['Users', 'monet', 'san_giorgio', 'examples', 'talented_querulous_burdock']
    // The segment argument to slice is exclusive, which is why we add 2 instead of 1.
    const segmentsToExample = segments.slice(0, exampleIndex + 2)

    // e.g. /Users/monet/san_giorgio/examples/talented_querulous_burdock
    const pathToExampleFolder = path.join(...segmentsToExample)

    // e.g. ['Users', 'monet', 'san_giorgio']
    const segmentsToProjectRoot = segments.slice(0, exampleIndex)
    const segmentsToProjectSrc = [...segmentsToProjectRoot, 'src']
    const pathToSrcFolder = path.join(...segmentsToProjectSrc)

    const segmentsToPreviousSrcFolder = [...segmentsToProjectRoot, 'examples', 'src_backup'] 
    const pathToSrcFolderBackup = path.join(...segmentsToPreviousSrcFolder)

    const segmentsToExampleSeedFileAfterCopying = [...segmentsToProjectSrc, 'seed']
    const pathToExampleSeedFileAfterCopying = path.join(...segmentsToExampleSeedFileAfterCopying)

    const paths = {
        pathToExampleFolder,
        pathToSrcFolder,
        pathToSrcFolderBackup,
        pathToExampleSeedFileAfterCopying,
    }

    if (documentPathIsAbsolute) {
        // Make all of our paths absolute.
        for(const [key, value] of Object.entries(paths)) {
            paths[key as keyof Paths] = path.sep + value
        }
    }

    return paths
}

function splitPath(pat: string): string[] {
    return pat.split(path.sep)
}

// let letters = ['a', 'b', 'c', 'd']
//
// letters.length is 4
// Forward indexes: 0 1 2 3
// Backward indexes: 3 2 1 0
// 
// If we're looking for 'c', its backward index
// is 1. We want its forward index, 2. To get
// that, do:
//
// const lastForwardIndex = letters.length - 1
// lastForwardIndex - backwardIndex
//
// 
function findLastIndex<Element>(elements: Element[], match: Predicate<Element>): number {
    const reversed = [...elements].reverse()
    const indexInReversed = reversed.findIndex(match)

    const lastForwardIndex = elements.length - 1

    return lastForwardIndex - indexInReversed
}

type Predicate<Arg> = (arg: Arg) => boolean

interface Paths {
    pathToExampleFolder: string
    pathToSrcFolder: string
    pathToSrcFolderBackup: string
    pathToExampleSeedFileAfterCopying: string
}

