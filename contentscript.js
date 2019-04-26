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

const makeSectionLink = (mdCell, topHeaderLevel) => {
  const cellHref = getCellHref(mdCell);
  const header = getHeaders(mdCell)[0];
  const headerLevel = getHeaderLevel(header.tagName);
  const numIndent = Math.max(0, headerLevel - topHeaderLevel);
  const indent = '  '.repeat(numIndent);
  const sectionLink = `${indent}- [${header.textContent}](${cellHref})`;
  return sectionLink;
}

const makeTOC = () => {
  const cells = document.querySelectorAll('div.command-with-number');
  const mdCells = [...cells].filter(c => isMarkdownCell(c) && hasHeader(c)).slice(1);
  const topHeader = getHeaders(mdCells[0])[0];
  const topHeaderLevel = getHeaderLevel(topHeader.tagName);
  const sectionLinks = mdCells.map(mdCell => makeSectionLink(mdCell, topHeaderLevel));
  return sectionLinks.join('\n');
};

const getCellByHref = href => {
  return document.querySelectorAll(`a[href='${href}'].command-number`)[0];
}

const mdCellExists = () => {
  return document.querySelector('div.markdown') !== null;
}

const enableScrollToSection = () => {
  if (!mdCellExists()) return
  const topMarkdownCell = document.querySelector('div.markdown');
  const sectionLinks = topMarkdownCell.querySelectorAll("a[href^='#notebook']");
  sectionLinks.forEach(sectionLink => {
    sectionLink.style.fontWeight = 'bold';
    sectionLink.addEventListener('click', event => {
      event.preventDefault();
      const href = event.target.getAttribute('href');
      const targetCell = getCellByHref(href);
      targetCell.scrollIntoView();
    });
  });
};

const waitFor = (conditionFunc, funcToExecute) => {
  return () => {
    const callback = () => {
      if (conditionFunc()) {
        clearInterval(handle);
        funcToExecute();
      }
    }
    const handle = setInterval(callback, 100);
  };
};

window.addEventListener('load', waitFor(mdCellExists, enableScrollToSection));
document.addEventListener('mousedown', enableScrollToSection);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse(makeTOC());
});

