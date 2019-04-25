
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const TOC = makeTOC();
  sendResponse(TOC);
});

const getHeaderLevel = h => {
  return parseInt(h.slice(1));
};

const getMarkdownDiv = cell => {
  return cell.querySelector('div.markdown');
};

const isMarkdownCell = cell => {
  return getMarkdownDiv(cell) !== null;
};

const getHeaders = cell => {
  return getMarkdownDiv(cell).querySelectorAll('h1, h2, h3, h4, h5, h6');
};

const hasHeader = cell => {
  return getHeaders(cell).length > 0;
};

const getCellHref = cell => {
  return cell.querySelector('a.command-number').getAttribute('href');
};


const makeTOC = () => {
  const cells = document.querySelectorAll('div.command-with-number');
  const markdownCells = [...cells].filter(c => isMarkdownCell(c) && hasHeader(c)).slice(1);
  const topHeader = getHeaders(markdownCells[0])[0];
  const topHeaderLevel = getHeaderLevel(topHeader.tagName);
  const sections = [];

  markdownCells.forEach(markdownCell => {
    const cellHref = getCellHref(markdownCell);
    const header = getHeaders(markdownCell)[0];
    const headerLevel = getHeaderLevel(header.tagName);
    const indent = '  '.repeat(headerLevel - topHeaderLevel);
    const section = `${indent}- [${header.textContent}](${cellHref})`;
    sections.push(section);
    }
  );
  return sections.join('\n');
}
