
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const toc = makeTOC();
  sendResponse(toc);
});


const makeTOC = () => {
  const cellDivs = document.querySelectorAll('div.command-with-number');
  const sections = [];
  cellDivs.forEach(cellDiv => {
    var markdownDiv = cellDiv.querySelector('div.markdown');
    if (markdownDiv) {
      const cellHref = cellDiv.querySelector('a.command-number').getAttribute('href');
      const headers = markdownDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headers.length > 0) {
        const section = `- [${headers[0].textContent}](${cellHref})`;
        sections.push(section);
      }
    }
  });
  return sections.join('\n');
}




