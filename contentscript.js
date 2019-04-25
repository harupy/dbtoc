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
  const indent = '  '.repeat(headerLevel - topHeaderLevel);
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

const enableScroll = () => {
  if (!mdCellExists()) return
  const topMarkdownCell = document.querySelector('div.markdown');
  const sectionLinks = topMarkdownCell.querySelectorAll("a[href^='#notebook']");
  sectionLinks.forEach(sectionLink => {
    sectionLink.addEventListener('click', event => {
      event.preventDefault();
      const anchor = event.target;
      anchor.style.color = 'red';
      const href = anchor.getAttribute('href');
      const targetCell = getCellByHref(href);
      targetCell.scrollIntoView();
    });
  });
};


const waitUntil = (condtionFunc, funcToExecute) => {
  return () => {
    const callback = () => {
      if (condtionFunc()) {
        clearInterval(handle);
        funcToExecute();
      }
    }
    const handle = setInterval(callback, 100);
  };
};

window.addEventListener('load', waitUntil(mdCellExists, enableScroll), false);
document.addEventListener('mousedown', enableScroll, false);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const TOC = makeTOC();
  sendResponse(TOC);
});

