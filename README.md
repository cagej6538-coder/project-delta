# Tasty Crib website

A standalone, responsive coffee-house website. No Higgsfield, paid service, build step, framework, remote font, or remote image is required.

## Open it

1. Extract the ZIP first (do not open the HTML inside the ZIP viewer).
2. Open `tasty-crib/index.html` in Chrome, Edge, Firefox or Safari.
3. Keep `index.html`, `styles.css`, `config.js`, `app.js` and the `assets` folder together.

For XAMPP: copy the `tasty-crib` folder into `C:\xampp\htdocs`, start Apache, and visit `http://localhost/tasty-crib/`. MySQL is not needed.

## What works

- Responsive desktop and mobile layouts; self-contained CSS coffee illustrations.
- Real WebGL 3D cup geometry with a wrapping label, lighting, automatic rotation, drag rotation, and keyboard-accessible rotation buttons.
- Scroll through the opening section to rotate the cup, raise the lid, separate the sleeve and reassemble it. The Open cup button also lets you inspect it without scrolling.
- Pause motion control, reduced-motion support, and an illustrated fallback if WebGL is unavailable.
- Menu category filtering and search.
- Product dialogs, size selection and calculated prices.
- Bag quantities, removal, subtotal and local browser persistence where allowed.
- Keyboard-operable dialogs and FAQ accordions.
- Optional WhatsApp order-message handoff after configuration.

This version uses a procedural 3D model rendered locally by WebGL. It is stylised rather than photorealistic, and is not a video scrub or a frame-for-frame copy of the reel. No external library or model download is needed.

## Update your existing GitHub Pages site

Extract the ZIP and upload the contents of the `tasty-crib` folder to the same GitHub folder that currently contains your `index.html`. Replace `index.html`, `styles.css`, and `app.js`, and add the new `coffee-3d.js` and `coffee-3d.css` files. Keep the `assets` folder. Preserve your existing `config.js` if you have already customised products or contact details.

Do not upload only the ZIP and do not add an extra nested `tasty-crib` folder inside the website root. Commit the uploaded files, wait for GitHub Pages to finish publishing, then refresh the live page with Ctrl+F5 on Windows (or reload in a new private tab on mobile). The HTML includes versioned animation URLs to reduce stale caching.

You should see Rotate, Open cup and Pause motion buttons under the cup. If you still see only the old illustration and no controls, verify that BOTH new coffee-3d files were uploaded beside index.html. If the browser reports that 3D is unavailable, enable browser hardware acceleration if supported or try another browser. Devices with reduced motion enabled show a still 3D cup until you use the controls.

## Personalise

Edit `config.js` in VS Code. The products array holds names, descriptions, categories, prices and Large surcharges. Categories are `hot`, `iced`, `bakery`. Artwork kinds are `latte`, `iced`, `espresso`, `roll`, `mocha`, `cold`. Product IDs must be unique.

The existing catalogue and prices are SAMPLE content, not confirmed business information. Confirm them before opening orders. Add the actual address and hours; do not invent them.

To enable WhatsApp ordering:

1. Put the business's international WhatsApp number in `whatsapp`, using digits only. For Nigeria use `234` and omit the phone number's initial `0`.
2. Confirm the products, prices and contact details, then change `demoMode: true` to `demoMode: false`.
3. Test the handoff yourself. Visitors must review and send the message in WhatsApp. The page does not automatically send messages or confirm orders.
4. Adjust the footer's sample-menu wording in `index.html` after replacing all sample content.

Change colours at the top of `styles.css`; edit headings in `index.html`. All illustrated visuals are built in CSS, so no image downloads can break. You can replace illustration markup with your own product photos and appropriate alt text.

## Hosting

Upload the CONTENTS of `tasty-crib` to your static hosting directory, keeping `index.html` at its root. These files support static hosting, including GitHub Pages. There is no PHP to execute, no npm install, and no database import.

## Honest limitations

This is a static front end, not a backend commerce system. It has no payment processing, inventory tracking, admin login, customer accounts, server-side orders, shipping calculation or email service. The bag is saved on the visitor's device, not in a database. Browser storage may be unavailable in private mode or for local files; browsing and the current bag still work for that session. Never store secret keys in public JavaScript. Real online payments would require a separate secured integration.

Use a current browser with native HTML dialog support. Images are illustrative, not photos of actual products.
