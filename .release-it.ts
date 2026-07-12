import { releaseItConfig } from "@adamhl8/configs"

const config = releaseItConfig({
  hooks: {
    "after:bump": ["just build-fonts"],
  },
  github: {
    assets: ["out/*.ttf"],
  },
})

export default config
