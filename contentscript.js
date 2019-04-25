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

const updateTOC = () => {
  const topMarkdownCell = document.querySelector('div.markdown');
  const sectionLinks = topMarkdownCell.querySelectorAll("a[href^='#notebook']");
  sectionLinks.forEach(sectionLink => {
    sectionLink.addEventListener('click', event => {
      event.preventDefault();
      const href = event.target.getAttribute('href');
      const targetCell = getCellByHref(href);
      targetCell.scrollIntoView();
    });
  });
};

const waitUntilLoaded = func => {
  return () => {
    const callback = () => {
      if (document.querySelector('div.markdown') !== null) {
        clearInterval(handle);
        func();
      }
    }
    const handle = setInterval(callback, 100);
  };
};

window.addEventListener('load', waitUntilLoaded(updateTOC), false);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const TOC = makeTOC();
  sendResponse(TOC);
});

