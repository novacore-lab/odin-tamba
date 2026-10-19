# LINE consultation button

The GitHub Pages floating menu now has shipping, phone consultation, and a LINE consultation placeholder. LINE is not connected. The native disabled button is labelled LINE相談（準備中） and does not navigate or open another service. Free cardboard box requests remain available in the shipping instructions and by phone.

When the official LINE account URL is supplied, replace the disabled button in index.html with an anchor to the verified URL, retain the floating-link--line class and chat icon, remove the preparation badge, and add rel="noopener noreferrer" when using target="_blank". No account URL or placeholder external URL is currently configured.

Validation: unique document IDs, existing internal anchors, disabled LINE button, preservation of all other HTML and existing JavaScript syntax. Visual browser testing was unavailable. The original Sites deployment still needs a separate update when its editing environment is available.
