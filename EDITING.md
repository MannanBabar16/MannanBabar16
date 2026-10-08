# Your profile control room

Everything in the custom profile lives in **[profile.json](profile.json)**: your headline, bio, current quest, contact links, project selection, loadout, design principles, colors, and motion preference. README and artwork are generated; edit the config instead of changing those outputs by hand.

## Visual editor — recommended

Install Node.js 22.12 or newer and Git, then clone your personal profile repository:

```sh
git clone https://github.com/MannanBabar16/MannanBabar16.git
cd MannanBabar16
npm ci
npm run edit
```

Open **http://127.0.0.1:4318**. The control room has four sections: Player identity, Project select, Developer loadout, and Visual settings.

1. Edit the fields. Empty optional links are hidden.
2. Click **Save & build** to update `profile.json`, the artwork, README, and local preview. GIF rendering can take a few seconds.
3. Click **Publish to GitHub** when ready. The editor rebuilds, commits those profile files, and pushes to your personal profile repository using your existing Git login.

Export config downloads a portable copy of `profile.json`. The editor runs on your own computer and requires no API key. It only listens on localhost; it does not send your changes anywhere until you click Publish. Sign in through your usual Git credential manager or SSH setup before publishing. Git user name and email must be configured for commits.

The publisher checks that origin is your personal `username/username` repository and that you are on main. It refuses unrelated staged files. It never force-pushes and does not rewrite other repositories, your native GitHub sidebar fields, or pinned projects.

## Edit directly on GitHub

Open [profile.json in GitHub's editor](https://github.com/MannanBabar16/MannanBabar16/edit/main/profile.json), change the values, and commit. **Render profile** in Actions regenerates the README and graphics when runner access is available.

**Current automation status:** GitHub reports “The job was not started because your account is locked due to a billing issue.” The profile itself is already live; this prevents automatic regeneration when you edit the config on GitHub. Use the local control room's Publish button or the commands below; they work without Actions. Automatic web edits can resume after the account issue is resolved in [GitHub billing settings](https://github.com/settings/billing). No billing settings were changed by this project.

## Command-line editing

```sh
npm ci
# Edit profile.json in your text editor.
npm run build
npm run check
npm run publish
```

If a push is rejected because newer commits exist, save your edits, pull the remote changes, resolve any conflict in `profile.json`, rebuild, and publish again. Generated images should be regenerated from the resolved config.

## What you can customize

| Config section | Controls |
| --- | --- |
| `identity` | Name, callsign, headline, location, two-line hero text, bio, status, current quest |
| `links` | GitHub, LinkedIn, portfolio, optional public email |
| `loadout` | Four tool/strength cards |
| `principles` | Three game design statements |
| `projects` | 1–6 tiles, descriptions, repository/play links, artwork choice, accent color |
| `theme` | Background, panels, text, accents, animation on/off |

Keep `links.github` pointing to your own GitHub profile; it controls the generated asset URLs and publisher destination check. Project IDs must be unique lowercase strings using letters, numbers, and hyphens. Fields have length limits so text fits the artwork; the editor and generator validate them. Use six-digit hex colors and full https URLs.

For a motion-free header, set `theme.animation` to `false` and rebuild. A static header is also linked from the profile; reduced-motion visitors get the static image where their browser and GitHub honor the picture source.

GitHub controls its surrounding navigation, contribution grid, native repository cards, avatar, and sidebar bio. This project customizes the profile README at the top of your personal homepage. Change the native bio/avatar in [GitHub profile settings](https://github.com/settings/profile).

## Artwork and provenance

- The orbital world, portal animation, loadout panels, and project illustrations are original code-generated artwork in `scripts/art.mjs`.
- The café tile uses a screenshot of your After Hours Café browser game. The other project tiles are illustrations, not game screenshots.
- Chakra Petch and IBM Plex Mono are bundled under the SIL Open Font License. Their license notices are in `assets/fonts/`.
- Initial identity and project information came from your public GitHub profile and repositories. You supplied the headline “Unity Game Developer Bruv.” LinkedIn blocked automated public access, so no employment or education details were imported or guessed.

There are no statistics widgets, tracking pixels, remote rendering services, or daily activity jobs. Visuals are committed assets served from this repository.
