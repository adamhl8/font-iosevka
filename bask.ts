import { task } from "@adamhl8/bask"

export * from "@adamhl8/configs/bask"

// Regenerates the committed web fonts (`index.css`, `web/`) and the release TTFs in `out/`.
export const buildFonts = task(async ({ sh }) => {
  await sh`bun src/index.ts`
})
