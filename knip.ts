import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({ entry: ["src/index.ts"], ignoreBinaries: ["just", "fontforge"] }, { arrays: "replace" })

export default config
