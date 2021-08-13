chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled....');
  listenWebRequest()
});

chrome.runtime.onStartup.addListener(() => {
  console.log('onStartup....');
  listenWebRequest()
});

function listenWebRequest() {
  chrome.webRequest.onCompleted.addListener(
    function (details) {
      if (details.initiator === 'https://www.jw.org' && details.url.match('/media-items') && details.url.match('VIDEO') && details.method === 'GET') {
        sendAPI(details.url)
      }
    },
    { urls: ["<all_urls>"] }
  );
}

function sendAPI(url) {
  fetch(url)
    .then(res => {
      return res.json();
    }).then(result => {
      saveData(result)
    })
}

function saveData(result) {

  let medias = result.media[0]
  let buttons = []
  if (!medias) return
  let data = {}
  medias.files.forEach(element => {
    if (element.subtitles) {
      data.url = element.subtitles.url
    }
  });
  data.title = medias.title
  buttons.unshift(data)
  localStorage.setItem('buttons', JSON.stringify(buttons));
}

chrome.runtime.sendMessage({}, function (response) {
});

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(msg) {
  console.log(msg)
}
