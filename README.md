# kubevirtbmc.io

Landing page for the KubeVirtBMC project. The how-to guide lives at
[docs.kubevirtbmc.io](https://docs.kubevirtbmc.io)
([source](https://github.com/kubevirtbmc/docs)).

## Layout

| Path | What it holds |
| ---- | ------------- |
| `data/landing.yaml` | Every word on the page. Edit this to change the copy. |
| `layouts/` | The page skeleton and one partial per section. No theme. |
| `assets/css/site.css` | All styles, with the light and dark palettes as tokens at the top. |
| `assets/js/site.js` | Theme switch, menu, copy button, and the host that mounts the figures. |
| `static/js/figures/` | The isometric figures, one file each. |
| `static/vendor/hairline/` | Vendored [Hairline](https://github.com/lucasmarkes/hairline) kernel (MIT). |
| `static/fonts/` | Self-hosted fonts: Ubuntu Bold for titles, IBM Plex for text (see `LICENSES.txt`). |

## Figures

The page draws two isometric line figures, `rack` and `link`, made with
Hairline's `hairline-create` skill on its kernel. `data/landing.yaml` says
which figure goes where.

To change a figure, edit its file in `static/js/figures/`, then check it with
the skill's `look.mjs` against Hairline's ten rules before committing.

## Development

Prerequisites:

- [Hugo](https://gohugo.io/installation/) 0.166.0, the release CI builds and
  deploys with (`HUGO_VERSION` in `.github/workflows`). The standard edition
  is enough; 0.158.0 is the oldest that builds the site. Other versions
  render the same page except for the `generator` meta tag.
- Node.js, for markdownlint.
- curl, to fetch htmltest on first `make test`.

The site has no theme submodule any more. A clone made before that change
keeps the old checkout as untracked files; remove it once:

```sh
rm -rf themes .git/modules/themes
```

| Command | Description |
| ------- | ----------- |
| `make serve` | Start local dev server |
| `make build` | Build the site |
| `make lint` | Lint Markdown files |
| `make test` | Build and validate HTML |
| `make ci` | Run lint + test |
| `make clean` | Remove build artifacts |
| `make update-hairline` | Refresh the vendored Hairline kernel |
