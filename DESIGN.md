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

The homepage follows a “station front desk, then project switchboard” reading order: CyStation identity, latest release, compact character selector, and directory. The authentic TJ Combo/Banjo collage appears once in the shared compact header. The dedicated `/patches` route gives the selector its full unboxed stage. Three persistent figures occupy front, rear-left, and rear-right slots, with project marks traveling as part of each character identity. The active figure is dominant and full color; rear figures remain legible as cool-blue shadows.

## Controls and States

Arrow controls are circular signal discs with a minimum 44-pixel target. Hover and active states illuminate from pale blue to gold or green. Focus is always visible. Status language must distinguish released, in development, and archive destinations without relying on color alone.

## Motion

Figures rotate through persistent DOM slots using transform, opacity, and a bounded color filter over roughly 560 milliseconds. The front figure moves into a rear position while its neighbor advances, preserving the sense of a spindle rather than swapping images. Reduced-motion users receive an immediate state change with a short opacity transition only.

## Responsive Behavior

Desktop pairs the homepage identity with its release notice, then gives the compact selector a shorter stage; the dedicated project page retains the large foreground render. Mobile stacks the intro and release, may crop rear figures at the selector edges, keeps the active character unobscured, moves project details below, and retains both arrow controls and keyboard behavior. The shared compact header uses a controlled lower crop so TJ Combo and Banjo-Kazooie remain visible at both sizes.
