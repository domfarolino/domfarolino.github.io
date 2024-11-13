const path = require('path');
const fs = require('fs');
const ejs = require("ejs");

// Default to `/` so that even on live sub-pages, like `/resume/` (that are not
// part of a PR preview), "relative" URLs (like `href=css/master.css`) are not
// made relative to `/resume/css/master.css`, but are essentially turned into
// absolute URLs.
function renderFile(fileName, base_href_value = '/') {
  ejs.renderFile(path.join(fileName), {partial: false, base_href_value}, function(err, document) {
    if (err) console.log(err);
    const outputFileName = `${fileName.split('.')[0]}.html`;
    fs.writeFileSync(path.join(outputFileName), document, 'utf8');
  });
}

// When generating static files, supply a manual base URL if needed. This is
// only useful for PR preview.
const base_injection = process.argv[2];
renderFile("index.ejs", base_injection)
renderFile("resume/index.ejs", base_injection)
renderFile("public-keys/index.ejs", base_injection)
renderFile("research/index.ejs", base_injection)
