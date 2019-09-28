chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  const url = tabs[0].url;
  const awsPattern = /https:\/\/.*\.databricks.com\/.*#notebook\/.*/;
  const azurePattern = /https:\/\/.*\.azuredatabricks.net\/.*#notebook\/.*/;
  if (url.match(awsPattern) || url.match(azurePattern)) {
    chrome.tabs.sendMessage(tabs[0].id, 'makeTOC', text => {
      copyToClipboard(text);
    });
  } else {
    const message = document.getElementById('message');
    message.textContent = 'This page is not a Databricks notebook';
    message.style.color = '#ff6347';
  }
});

const copyToClipboard = text => {
  const copyFrom = document.createElement('textarea');
  copyFrom.textContent = text;
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
};
