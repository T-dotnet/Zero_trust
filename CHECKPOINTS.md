# Zero Trust checkpoints

| Checkpoint | Git | Local | Vercel |
|---|---|---|---|
| Original prototype | [`main` · `b6be833`](https://github.com/T-dotnet/Zero_trust/commit/b6be8331842cffc61da7387d1e39df5f1da92f4e) | [Port 3000](http://localhost:3000/) | [Production build](https://zero-trust-az82hjdzl-t-dotnets-projects.vercel.app/) · sign-in required |
| MVP Research Workspace | [`mvp` · `56234c3`](https://github.com/T-dotnet/Zero_trust/commit/56234c3125b48c9c538689cefd448510be2e4b78) | [Port 3001](http://127.0.0.1:3001/) | [MVP preview](https://zero-trust-git-mvp-t-dotnets-projects.vercel.app/) · sign-in required |
| V2 checkpoint | [`codex/v2-design-system-fixes` · `f854b2e`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/f854b2ed8105da8f5f35345aad047ce2a76b72ba) | [Port 3004](http://127.0.0.1:3004/) · [Stakeholder](http://127.0.0.1:3004/stakeholder/) · [Design system](http://127.0.0.1:3004/design-system) | [Earlier production build](https://zero-trust-v2-checkpoint-rkq680b19-t-dotnets-projects.vercel.app/) |
| **Ready UI final** | [`codex/ready-ui-checkpoint` · `63183ca`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/63183ca1d472872aa6e59ad885147ded0e5ab68a) | [Port 3005](http://127.0.0.1:3005/) · [Stakeholder](http://127.0.0.1:3005/stakeholder/) · [Design system](http://127.0.0.1:3005/design-system) | [Production](https://zero-trust-v2-checkpoint.vercel.app/) · [Fixed deployment](https://zero-trust-v2-checkpoint-oc2dv9l2u-t-dotnets-projects.vercel.app/) |
| V2 baseline | [`main` · `acad761`](https://github.com/T-dotnet/zero-trust-v2-checkpoint/commit/acad761710b5fe170400aeb19fff43b01fa5deed) | [Port 3006](http://127.0.0.1:3006/) · [Stakeholder](http://127.0.0.1:3006/stakeholder/) · [Design system](http://127.0.0.1:3006/design-system) | [Earlier production build](https://zero-trust-v2-checkpoint-jnznkyznf-t-dotnets-projects.vercel.app/) |

All five local previews start at macOS sign-in and restart automatically if they exit. They run independently of Codex while the Mac is awake. Port 3004 serves a separately maintained local V2 build. Port 3006 serves the saved V2 baseline and uses its own local database.

The final version uses the design from the [original Ready UI preview](https://zero-trust-v2-checkpoint-emwf6u8ol-t-dotnets-projects.vercel.app/) at `df679f7` and includes the latest readiness and output review changes.
