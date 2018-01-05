const fs = require('fs');
const path = require('path');
const marked = require('marked');

const renderer = new marked.Renderer();
renderer.heading = headingParser;

const toc = [];

const docsMarkdown = readFile('docs.md');
const docsAsHtml = marked(docsMarkdown, { renderer });
const navAsHtml = generateNavigation(toc);

const indexTemplate = readFile('index.tpl.html');
const index = indexTemplate
  .replace('{{content}}', docsAsHtml)
  .replace('{{navigation}}', navAsHtml);


fs.writeFile(path.resolve(__dirname, 'index_docs.html'), index, () => {});


function generateNavigation(toc) {
  return toc
    .filter(item => item.level === 1 || item.level === 2)
    .map(item => `
      <a
        class="nav__item nav__item-${item.level}"
        href="#${item.slug}"
      >
        ${item.text}
      </a>
    `)
    .join('\n');
}

// helper
function readFile(fileName) {
  return fs.readFileSync(path.resolve(__dirname, fileName)).toString();
}

function headingParser(text, level) {
  const slug = text.toLowerCase().replace(/[^\w]+/g, '-');

  toc.push({ level, slug, text });

  return `
    <h${level} id="${slug}">
      <a class="anchor" href="#${slug}">
        ${text}
      </a>
    </h${level}>
  `;
}