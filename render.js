const path = require('path');
const fs = require('fs');
const ejs = require("ejs");

function renderFile(fileName, base_href_value = '') {
  ejs.renderFile(path.join(fileName), {partial: false, base_href_value}, function(err, document) {
    if (err) console.log(err);
    const outputFileName = `${fileName.split('.')[0]}.html`;
    fs.writeFileSync(path.join(outputFileName), document, 'utf8');
  });
}

const base_injection = process.argv[2];
renderFile("index.ejs", base_injection)
renderFile("resume/index.ejs", base_injection)
renderFile("public-keys/index.ejs", base_injection)
renderFile("research/index.ejs", base_injection)
