---
description: Add a new UI component to the design system in packages/ui
---

1. Ask the user for the name of the component to add.
2. Determine if the component is a standard library component (like 'button', 'select', 'input') available via shadcn, or a completely custom component.
3. If it is a standard shadcn component:
   - Change directory to `packages/ui`.
     // turbo
   - Run: `bunx --bun shadcn@latest add <component-name>`
4. If it is a custom component:
   - Create a file in `packages/ui/src/components/<component-name>.tsx`.
   - Apply standard styling consistent with `packages/ui/src/styles/globals.css`.
   - Ensure the component is exported or accessible as per `packages/ui/package.json` exports.
