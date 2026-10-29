# unique-concepts

A method plus four small Node tools for coming up with **genuinely different** 3D / web concepts, filtering them
hard, and turning the best one into a brief that works on a phone and a desktop. It ends with the real mistakes we
made building a 300-concept library, and a `preflight.mjs` that checks for each of them automatically.

```bash
node tools/idea-matrix.mjs --n 10 --invert      # idea cards (seeded, shareable)
node tools/constraint-cards.mjs --n 3           # constraints for the idea you keep
node tools/palette-check.mjs --colors "#F3D9E0,#26341C,#2E9E5E"
node tools/preflight.mjs ../../site/library/n/N020 --root ../../site
node tools/preflight.mjs --text "Here is the link: PLACEHOLDER"   # fails, as it should
```

No dependencies (Node 18+). Read [`SKILL.md`](SKILL.md) for the method, [`checklist.md`](checklist.md) for review,
[`examples/`](examples/) for a worked example and the brief template. Idea sources: [`CREDITS.md`](CREDITS.md).
MIT licence.
