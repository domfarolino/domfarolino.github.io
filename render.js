const path = require('path'), fs = require('fs'), ejs = require("ejs");

function renderFile(fileName) {
  ejs.renderFile(path.join(fileName), {partial: false}, function(err, document) {
    console.log(err);
    const outputFileName = `${fileName.split('.')[0]}.html`;
    fs.writeFileSync(path.join(outputFileName), document, 'utf8');
  });
}

renderFile("index.ejs")
renderFile("resume/index.ejs")
renderFile("public-keys/index.ejs")