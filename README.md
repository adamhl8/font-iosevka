# font-iosevka

Custom [Iosevka](https://github.com/be5invis/Iosevka) fonts, patched with [Nerd Fonts](https://github.com/ryanoasis/nerd-fonts) glyphs.

Two families are built from the build plans in this repo (`Iosevka` and `IosevkaTerminal`), and every generated TTF is patched with the Nerd Fonts font-patcher. Each release ships in two forms:

- **Desktop install**: the 8 Nerd Font TTFs are attached to the [GitHub release](https://github.com/adamhl8/font-iosevka/releases/latest). TTF is the format macOS, Windows, and terminal emulators install. `woff2` is not installable as a system font.
- **Web**: the `@adamhl8/font-iosevka` npm package ships the four plain `Iosevka` faces as `woff2` plus an `index.css`.

## Desktop install

Download the TTFs you want from the [latest release](https://github.com/adamhl8/font-iosevka/releases/latest) and install them.

| Family name                 | Files                           | Spacing      |
| --------------------------- | ------------------------------- | ------------ |
| `Iosevka Nerd Font`         | `IosevkaNerdFont-*.ttf`         | proportional |
| `IosevkaTerminal Nerd Font` | `IosevkaTerminalNerdFont-*.ttf` | terminal     |

Each comes in Regular, Italic, Bold, and BoldItalic. Use the family name (not the filename) when configuring a terminal or editor.

The unpatched `Iosevka` and `IosevkaTerminal` TTFs are built but not released. They only exist as patcher input, and plain `Iosevka` reaches the web as `woff2` below.

## Web usage

```sh
npm install @adamhl8/font-iosevka
```

Only the plain `Iosevka` family is published as a web font. With [Astro's Fonts API](https://docs.astro.build/en/reference/experimental-flags/fonts/):

```ts
import { fontProviders } from "astro/config"

fonts: [
  {
    provider: fontProviders.npm(),
    name: "Iosevka", // must match the font-family in the package's index.css
    cssVariable: "--font-iosevka",
    options: { package: "@adamhl8/font-iosevka" },
  },
]
```

Astro's npm provider rewrites the `src` URLs to jsDelivr and fetches the `woff2` at build time, so the package version you install must be published to npm.

Outside Astro, import the stylesheet directly:

```ts
import "@adamhl8/font-iosevka/index.css"
```

The package intentionally has no `exports` map, so font files stay resolvable by path (for example `@adamhl8/font-iosevka/web/Iosevka-Regular.woff2`, which is how `fontProviders.local()` reads them).

## Building

The fonts are built by CI on release, so you only need this to regenerate the committed web fonts (after bumping `IOSEVKA_REF` in `src/index.ts`, say).

The following must be available on `PATH`:

- `git`
- `curl`
- `unzip`
- `fontforge`
- `ttfautohint`
- `uv`

```sh
just build-fonts
```

Everything happens in the current working directory: the Iosevka repo is cloned and built there, fonts are patched, and the intermediate directories (`Iosevka/`, `font-patcher/`, `in/`) are cleaned up afterwards. It writes the 8 Nerd Font TTFs to `out/`, and the web fonts to `index.css` and `web/` (both of which are committed, since the npm publish job has no font toolchain).

## License

The build script is [MIT](./LICENSE). The fonts it produces are Iosevka, licensed under the [SIL Open Font License 1.1](./OFL.txt).
