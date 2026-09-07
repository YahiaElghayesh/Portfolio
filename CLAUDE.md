# Portfolio site — notes for Claude

## Photo descriptions are ground truth

Every photo the user provides is named descriptively by them (not by Claude) —
the folder name is the project id, the filename describes exactly what the
photo shows (angle, whether it has a background, whether it should be used as
the hero, crop instructions, etc.). See `assets/img/PHOTO_MANIFEST.json` for
the full record of source filename → description → processing decision for
every image currently on the site.

**Before changing any project's photo layout** (`LAYOUTS` in `data.js`),
read the manifest and the actual filenames in `assets/img/projects/<id>/` —
they encode real information (e.g. "closeup on fans" is a detail shot, not a
hero candidate; "use as main" is an explicit hero instruction). Do not
re-derive placement purely from looking at pixels when the filename already
says what it is.

If the user changes a project's description or highlights, re-derive the
`LAYOUTS` entry for that project from the photo descriptions rather than
leaving the old block arrangement in place — the whole point of tracking
descriptions here is to make that re-derivation cheap and accurate.

## Known fragile spot: git history loss

This branch has twice lost locally-committed work to a fast-forward merge
when the user pushes new commits via GitHub Desktop while local unpushed
commits exist on top of the same base. If you have local commits and the
user says they've pushed, use a real merge (or rebase your commits onto the
new remote tip) rather than a plain `git merge` that could fast-forward past
your own commits — verify with `git log --oneline --graph --all` that your
commits are still reachable from HEAD after merging, not just that the merge
"succeeded" with no conflicts.
