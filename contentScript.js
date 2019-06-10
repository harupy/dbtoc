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

const parseHeader = mdCell => {
  const href = getCellHref(mdCell);
  const header = getHeaders(mdCell)[0];
  const level = getHeaderLevel(header.tagName);
  const text = header.textContent;
  return {
    level,
    text,
    href,
  };
};

const makeListItem = ({ level, text, href }, topHeaderLevel) => {
  const indent = '  '.repeat(level - topHeaderLevel);
  return `${indent}- [${text}](${href})`;
};

const makeTOC = () => {
  const cells = document.querySelectorAll('div.command-with-number');
  const mdCells = [...cells].filter(c => isMarkdownCell(c) && hasHeader(c)).slice(1);
  const headers = mdCells.map(parseHeader);
  const topHeaderLevel = Math.min(...headers.map(({ level }) => level));
  const TOC = headers.map(header => makeListItem(header, topHeaderLevel)).join('\n');
  return TOC;
};

const getCellByHref = href => {
  return document.querySelectorAll(`a[href='${href}'].command-number`)[0];
};

const mdCellExists = () => {
  return document.querySelector('div.markdown') !== null;
};

const enableScrollToSection = () => {
  if (!mdCellExists()) return;
  const topMarkdownCell = document.querySelector('div.markdown');
  const sectionLinks = topMarkdownCell.querySelectorAll("a[href^='#notebook']");
  sectionLinks.forEach(sl => {
    sl.style.fontWeight = 'bold';
    sl.addEventListener('click', event => {
      event.preventDefault();
      const href = event.target.getAttribute('href');
      const targetSection = getCellByHref(href);
      targetSection.scrollIntoView();
    });
  });
};

const waitFor = (conditionFunc, func) => {
  return () => {
    const callback = () => {
      if (conditionFunc()) {
        clearInterval(handle);
        func();
      }
    };
    const handle = setInterval(callback, 100);
  };
};

window.addEventListener('load', waitFor(mdCellExists, enableScrollToSection));
document.addEventListener('mousedown', enableScrollToSection);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse(makeTOC());
});
