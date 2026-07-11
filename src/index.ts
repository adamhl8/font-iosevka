import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"

import { execa, $ } from "execa"

const FACES = [
  { suffix: "Regular", weight: 400, style: "normal" },
  { suffix: "Italic", weight: 400, style: "italic" },
  { suffix: "Bold", weight: 700, style: "normal" },
  { suffix: "BoldItalic", weight: 700, style: "italic" },
] as const

const FONT_PATCHER_DIR = "./font-patcher"
const FONT_PATCHER_SCRIPT = `${FONT_PATCHER_DIR}/font-patcher`
const IOSEVKA_DIR = "./Iosevka"
const IN_DIR = "./in"
const OUT_DIR = "./out"
const WEB_DIR = "./web"

const INTERMEDIATES = [FONT_PATCHER_DIR, IN_DIR, IOSEVKA_DIR]

const rmAll = async (dirs: string[]) => {
  await Promise.all(dirs.map(async (dir) => fs.rm(dir, { recursive: true, force: true })))
}

const iosevkaExeca = execa({ cwd: path.resolve(IOSEVKA_DIR) })

const REQUIRED_TOOLS = ["ttfautohint", "fontforge"]

const assertToolsInstalled = () => {
  for (const tool of REQUIRED_TOOLS) {
    const toolPath = Bun.which(tool)
    if (toolPath) continue

    console.error(`${tool} is not installed`)
    process.exit(1)
  }
}

const downloadFontPatcher = async () => {
  console.info("Downloading font-patcher...")
  const zipPath = "./font-patcher.zip"
  await $`curl -fsSLo ${zipPath} https://github.com/ryanoasis/nerd-fonts/releases/latest/download/FontPatcher.zip`
  await $`unzip ${zipPath} -d ${FONT_PATCHER_DIR}`
  await $`rm ${zipPath}`

  // rewrite the shebang so uv supplies the script's Python environment
  const shebang = `#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["argparse"]
# ///
`
  const scriptSrc = await Bun.file(FONT_PATCHER_SCRIPT).text()
  const scriptBody = scriptSrc.split("\n").slice(1).join("\n") // remove existing shebang
  await Bun.write(FONT_PATCHER_SCRIPT, `${shebang}${scriptBody}`)
}

const buildIosevka = async () => {
  console.info("Cloning Iosevka repository...")
  await $`git clone --depth 1 https://github.com/be5invis/Iosevka.git ${IOSEVKA_DIR}`

  console.info("Installing deps...")
  await iosevkaExeca`npm install`

  const iosevkaToml = path.join(import.meta.dir, "iosevka.toml")
  const iosevkaTerminalToml = path.join(import.meta.dir, "iosevka-terminal.toml")

  await iosevkaExeca`cp ${iosevkaToml} ./private-build-plans.toml`
  console.info("Building Iosevka...")
  await iosevkaExeca`npm run build -- contents::Iosevka`

  await iosevkaExeca`cp ${iosevkaTerminalToml} ./private-build-plans.toml`
  console.info("Building IosevkaTerminal...")
  await iosevkaExeca`npm run build -- ttf::IosevkaTerminal`

  await fs.cp(`${IOSEVKA_DIR}/dist/Iosevka/TTF`, IN_DIR, { recursive: true })
  await fs.cp(`${IOSEVKA_DIR}/dist/IosevkaTerminal/TTF`, IN_DIR, { recursive: true })
}

const generateNerdFonts = async () => {
  console.info("Generating nerd fonts...")
  const fontFileNames = await Array.fromAsync(new Bun.Glob("*").scan(IN_DIR))

  await Promise.all(
    fontFileNames.map(async (fontFileName) => {
      const fontFilePath = path.join(IN_DIR, fontFileName)
      console.info(`Processing '${fontFileName}'...`)
      await $`fontforge -script ${FONT_PATCHER_SCRIPT} ${fontFilePath} --quiet --complete -out ${OUT_DIR}`
      console.info(`Finished processing '${fontFileName}'`)
    }),
  )
}

const cssRule = ({ suffix, weight, style }: (typeof FACES)[number]) =>
  [
    "@font-face {",
    `  font-family: "Iosevka";`,
    `  font-style: ${style};`,
    `  font-weight: ${weight};`,
    "  font-display: swap;",
    `  src: url('${WEB_DIR}/Iosevka-${suffix}.woff2') format('woff2');`,
    "}",
  ].join("\n")

const generateWebFonts = async () => {
  console.info("Generating web fonts...")
  await rmAll([WEB_DIR])
  await fs.mkdir(WEB_DIR, { recursive: true })

  await Promise.all(
    FACES.map(async ({ suffix }) => {
      const fileName = `Iosevka-${suffix}.woff2`
      return fs.copyFile(`${IOSEVKA_DIR}/dist/Iosevka/WOFF2/${fileName}`, `${WEB_DIR}/${fileName}`)
    }),
  )

  await Bun.write("./index.css", `${FACES.map(cssRule).join("\n\n")}\n`)
  console.info("Wrote ./index.css and ./web/")
}

assertToolsInstalled()
await rmAll([...INTERMEDIATES, OUT_DIR])

await downloadFontPatcher()
await buildIosevka()
await generateNerdFonts()
await generateWebFonts()

console.info("Cleaning up...")
await rmAll(INTERMEDIATES)

console.info("Done")
