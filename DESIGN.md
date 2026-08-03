# Design

## Visual World

CyStation uses a modernized Rareware signal stage: a drenched deep-blue field, oversized authentic character cutouts, a faint monumental station mark, and warm gold navigation cues. Empty blue space groups the interface; panels and enclosing card outlines do not.

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

The homepage follows a station-front-desk, then project-shelf reading order: CyStation identity, latest release, compact project gallery, and directory. The authentic Rareware collage appears once in the shared header, with enough vertical range to preserve both the earlier Bond crop and the lower TJ Combo/Banjo crop. The dedicated `/patches` route gives the gallery its full, lightly framed broadcast viewport. One selected project occupies the large art field while a horizontal rail of smaller project images sits below; the active rail item carries the same project signal color as its feature state.

## Controls and States

Arrow controls are circular signal discs with a minimum 44-pixel target. The active thumbnail is marked by a project-color signal bar and an explicit state label. Hover and focus states illuminate from pale blue to the relevant project signal. Status language must distinguish released, in development, and archive destinations without relying on color alone.

## Motion

Changing projects uses a short broadcast-tuning transition: the large art field wipes in the chosen direction with a bounded blur while the project copy settles upward. Thumbnail selection changes immediately and keeps the active indicator continuously legible. Reduced-motion users receive an immediate state change without the authored transition.

## Responsive Behavior

Desktop pairs the homepage identity with its release notice, then gives the compact gallery a shorter art field; the dedicated project page retains the larger viewport. Mobile stacks the art and project copy, makes the thumbnail rail horizontally scrollable, and retains both arrow controls and keyboard behavior. The expanded shared header shows a controlled vertical band of the collage so Bond, TJ Combo, and Banjo-Kazooie remain visible.
