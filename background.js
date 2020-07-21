chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled....');
  listenWebRequest()
});

chrome.runtime.onStartup.addListener(() => {
  console.log('onStartup....');
  listenWebRequest()
});

function listenWebRequest () {
  chrome.webRequest.onCompleted.addListener(
    function(details) {
      if(details.initiator === 'https://www.jw.org' && details.url.match('/media-items') && details.method === 'GET') {
        sendAPI(details.url)
      }
    },
    {urls: ["<all_urls>"]}
  );
}

function sendAPI (url) {
  fetch(url)
  .then(res => {
    return res.json();
}).then(result => {
  saveData(result)
})
}

function saveData (result) {
  let medias = result.media
  let buttons = []
  if (medias.length < 1) return
  medias.forEach( media => {
    let data = {}
    data.title = media.title
    data.url = media.files[0].subtitles.url

    buttons.unshift(data)
  })
  localStorage.setItem('buttons', JSON.stringify(buttons));
}

chrome.runtime.sendMessage({}, function(response) {
});

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(msg) {
  console.log(msg)
}
