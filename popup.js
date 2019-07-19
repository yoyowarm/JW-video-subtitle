window.addEventListener("load", function() {
  console.log("POPUP: OnLoad");
  var link = document.getElementById('res');
  link.addEventListener('click', function() {
    reload()
  });
}, false);
var bg = chrome.extension.getBackgroundPage();
function getBG() {
  return chrome.extension.getBackgroundPage();
}


function generateBtn (items) {
  items = JSON.parse(items)
  let medias = items.category.media
  let title = items.name
  let buttons = []
  let noData = document.getElementById("nodata");
  if (buttons.length > 0) { noData.innerHTML = '目前沒有資料'} else { noData.innerHTML = ''}
  medias.map( media => {
    let data = {}
    data.title = media.title
    data.url = media.files[0].subtitles.url
    buttons.push(data)
  }) 
  
  buttons.map( button => {
    let currentDiv = document.getElementById("container");
    let newText = document.createTextNode(`${button.title}`); 
    let newDiv = document.createElement('div')
    let newLink = document.createElement('a')
    let newIcon = document.createElement('img')
    newIcon.setAttribute('src', 'download.png')

    newLink.appendChild(newText)
    newDiv.appendChild(newIcon)
    newLink.setAttribute("data-url", button.url)
    // newLink.setAttribute("target", '_blank')
    newLink.onclick =function(newLink) {
      download(newLink)
    }
    newDiv.setAttribute("class", 'column')
    newDiv.appendChild(newLink)
    currentDiv.appendChild(newDiv)
    // document.body.insertBefore(newDiv, currentDiv); 
  })
    
}
var currentTab;
var version = "1.0";
var query = { active: true, currentWindow: true };
function reload () {
  chrome.tabs.query(
    query,
    function(tabArray) {
      chrome.tabs.update(tabArray[0].id, {url: tabArray[0].url});
        currentTab = tabArray[0];
        chrome.debugger.attach({
            tabId: currentTab.id
        }, version, onAttach.bind(null, currentTab.id));
    }
)
}

reload()
function download (e) {
  let url = e.path[0].dataset['url']
  var request = new XMLHttpRequest();
  request.open('GET', `${url}`, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
    var blob = new Blob([request.responseText], {type: "text/plain;charset=utf-8"});
        saveAs(blob, `${e.path[0].innerHTML}.vtt`)
      // Success!

    }
  };
  request.send();
}
function onAttach(tabId) {
  chrome.debugger.sendCommand({
      tabId: tabId
  }, "Network.enable");

  chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
  if (currentTab.id != debuggeeId.tabId) {
      return;
  }

  if (message == "Network.responseReceived") {
    chrome.debugger.sendCommand({
        tabId: debuggeeId.tabId
    }, "Network.getResponseBody", {
        "requestId": params.requestId
    }, function(response) {
      try {
        if (response.body && JSON.parse(response.body) && JSON.parse(response.body).category && JSON.parse(response.body).pagination) {
          generateBtn(response.body)
        }
      } catch {
      }
    });
  }
}