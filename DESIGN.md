# Design

## Visual World

CyStation uses a modernized “Rarewhere signal stage”: a drenched deep-blue field, oversized authentic character cutouts, a faint monumental station mark, and warm gold navigation cues. Empty blue space groups the interface; panels and enclosing card outlines do not.

## Color Roles

- Deep field `#001B49`: page depth, controls, and shadowed layers.
- Rare blue `#003466`: primary surface.
- Signal gold `#FFCC00`: active project identity and major actions.
- Cream `#FFFFDD`: readable body copy.
- Pale blue `#99CCFF`: links and secondary headings.
- Acid green `#33FF33`: live/on-air confirmation and small active sparks.

## Type and Voice

Use a narrow, heavy sans-serif stack for display labels and project headings, with Arial/Helvetica-family workhorse text for body copy. Labels are compact uppercase, never decorative paragraphs. Voice is clear first and gently cheeky second.

## Composition

The homepage follows a “station front desk, then project switchboard” reading order: CyStation identity, latest release, compact character selector, and directory. The authentic Rareware collage appears once in the shared header, with enough vertical range to preserve both the earlier Bond crop and the lower TJ Combo/Banjo crop. The dedicated `/patches` route gives the selector its full unboxed stage. Three persistent figures occupy front, rear-left, and rear-right slots, with project marks traveling as part of each character identity. The active known figures are dominant and full color; rear figures remain legible as cool-blue shadows, while unrevealed signals use a baked black silhouette.

## Controls and States

Arrow controls are circular signal discs with a minimum 44-pixel target. Hover and active states illuminate from pale blue to gold or green. Focus is always visible. Status language must distinguish released, in development, and archive destinations without relying on color alone.

## Motion

Figures rotate through persistent DOM slots over roughly 640 milliseconds. The incoming figure arcs forward and sharpens, the outgoing figure lifts before receding, and the third figure dips across the rear plane with bounded transform, opacity, and blur. This preserves the sense of a physical spindle rather than swapping images. Reduced-motion users receive an immediate state change without the authored arc.

## Responsive Behavior

Desktop pairs the homepage identity with its release notice, then gives the compact selector a shorter stage; the dedicated project page retains the large foreground render. Mobile stacks the intro and release, may crop rear figures at the selector edges, keeps the active character unobscured, moves project details below, and retains both arrow controls and keyboard behavior. The expanded shared header shows a controlled vertical band of the collage so Bond, TJ Combo, and Banjo-Kazooie remain visible.
