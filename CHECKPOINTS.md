# Zero Trust checkpoints

| Checkpoint | Git | Local | Vercel |
|---|---|---|---|
| Original prototype | [`main` · `b6be833`](https://github.com/T-dotnet/Zero_trust/commit/b6be8331842cffc61da7387d1e39df5f1da92f4e) | [Port 3000](http://localhost:3000/) | [Production build](https://zero-trust-az82hjdzl-t-dotnets-projects.vercel.app/) · sign-in required |
| MVP Research Workspace | [`mvp` · `56234c3`](https://github.com/T-dotnet/Zero_trust/commit/56234c3125b48c9c538689cefd448510be2e4b78) | [Port 3001](http://127.0.0.1:3001/) | [MVP preview](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/) · sign-in required |
| V2 checkpoint | [`codex/v2-design-system-fixes` · `4eccb85`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/4eccb85475e77130b2dc98ae0d5ab5aa6e5c0074) | [Port 3004](http://127.0.0.1:3004/) · [Stakeholder](http://127.0.0.1:3004/stakeholder/) · [Design system](http://127.0.0.1:3004/design-system) | [Production](https://zero-trust-v2-checkpoint.vercel.app/) |
| Ready UI checkpoint | [`codex/ready-ui-checkpoint` · `df679f7`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/df679f7f5a4456873e4960879d094f938ca97756) | [Port 3005](http://127.0.0.1:3005/) · [Stakeholder](http://127.0.0.1:3005/stakeholder/) · [Design system](http://127.0.0.1:3005/design-system) | [Ready UI preview](https://zero-trust-v2-checkpoint-emwf6u8ol-t-dotnets-projects.vercel.app/) · sign-in required |
| V2 baseline | [`main` · `acad761`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/acad761710b5fe170400aeb19fff43b01fa5deed) | [Port 3006](http://127.0.0.1:3006/) · [Stakeholder](http://127.0.0.1:3006/stakeholder/) · [Design system](http://127.0.0.1:3006/design-system) | [Earlier production build](https://zero-trust-v2-checkpoint-jnznkyznf-t-dotnets-projects.vercel.app/) |

All five local previews start at macOS sign-in and restart automatically if they exit. They run independently of Codex while the Mac is awake. Port 3004 serves a separately maintained local V2 build. Port 3006 serves the saved V2 baseline and uses its own local database.
