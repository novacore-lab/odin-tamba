# Mobile navigation update

The GitHub Pages version now includes responsive layout adjustments, a hamburger menu and a floating contact menu.

Updated website files:
- index.html
- main.js
- theme.css

Existing product imagery, gold/navy/cream colors, buying terms and IMEI preparation instructions are preserved. The review section continues to link to Google Maps.

The separate Sites publication has not received these changes because its execution environment was offline. When that environment is available, open its current source with the Sites source helper before merging these website changes. GitHub Pages uses relative asset and reviews.json paths; preserve the Sites deployment's root-relative paths during synchronization.

Validation performed in the connector session:
- JavaScript syntax.
- Navigation IDs and internal anchor targets.
- Hamburger open/close state.
- Escape closes and returns focus.
- A section link closes the menu and focuses its target.
- Outside pointer action closes the menu.
- Switching between mobile and desktop restores the correct navigation state.
- Existing content preserved.

A rendered browser check was not available in this session.
