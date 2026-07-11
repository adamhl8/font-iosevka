import "node_modules/@adamhl8/configs/dist/configs/justfile.base.just"

# regenerates the committed web fonts (index.css + files/) and the release TTFs in ./out/
build-fonts:
    bun src/index.ts
