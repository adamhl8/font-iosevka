import { releaseItConfig } from "@adamhl8/configs"

const config = releaseItConfig({
  hooks: {
    "after:bump": ["bask build-fonts"],
  },
  github: {
    assets: ["out/*.ttf"],
  },
})

export default config
