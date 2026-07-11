import { knipConfig } from "@adamhl8/configs"

const config = knipConfig({ ignoreBinaries: ["just", "fontforge"] }, { arrays: "replace" })

export default config
