window.addEventListener("load", function() {
  console.log("POPUP: OnLoad")
  reload()
  var link = document.getElementById('res')
  link.addEventListener('click', function() {
    reload()
  })
}, false)

function generateBtn (items, single) {
  items = JSON.parse(items)
  let medias 
  let title = items.name
  let buttons = []

  if (single) {
    medias = items.media
  } else {
    medias = items.category.media
  }
  
  let noData = document.getElementById("nodata");
  if (buttons.length > 0) { noData.innerHTML = '目前沒有資料'} else { noData.innerHTML = ''}

  medias.forEach( media => {
    let data = {}
    data.title = media.title
    data.url = media.files[0].subtitles.url
    if (single) {
      buttons.unshift(data)
    } else {
      buttons.push(data)
    }
  }) 
  
  buttons.forEach( button => {
    let currentDiv = document.getElementById("container")
    let newText = document.createTextNode(`${button.title}`)
    let newDiv = document.createElement('div')
    let newLink = document.createElement('a')
    let newIcon = document.createElement('img')
    newIcon.setAttribute('src', 'download.png')

    newLink.appendChild(newText)
    newDiv.appendChild(newIcon)
    newLink.setAttribute("data-url", button.url)
    newLink.onclick =function(newLink) {
      download(newLink)
    }
    newDiv.setAttribute("class", 'column')
    if (single) { newDiv.setAttribute("class", 'first column') }
    newDiv.appendChild(newLink)
    currentDiv.appendChild(newDiv)
  })
}

let currentTab;
let version = "1.0"
let query = { active: true, currentWindow: true }
function reload () {
  chrome.tabs.query(
    query,
    function(tabArray) {
      chrome.tabs.update(tabArray[0].id, {url: tabArray[0].url})
        currentTab = tabArray[0]
        chrome.debugger.attach({
            tabId: currentTab.id
        }, version, onAttach.bind(null, currentTab.id))
    }
  )
}


function download (e) {
  let url = e.path[0].dataset['url']
  let request = new XMLHttpRequest()
  request.open('GET', `${url}`, true)
  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
    let blob = new Blob([request.responseText], {type: "text/plain;charset=utf-8"});
        saveAs(blob, `${e.path[0].innerHTML}.vtt`)
    }
  }
  request.send()
}
function onAttach(tabId) {
  chrome.debugger.sendCommand({
      tabId: tabId
  }, "Network.enable")

  chrome.debugger.onEvent.addListener(allEventHandler);
}

function allEventHandler(debuggeeId, message, params) {
  // console.log({debuggeeId, message, params})
  if (currentTab.id != debuggeeId.tabId) {
      return
  }

  if (message == "Network.responseReceived") {
    chrome.debugger.sendCommand({
        tabId: debuggeeId.tabId
    }, "Network.getResponseBody", {
        "requestId": params.requestId
    }, function(response) {
      try {
        console.log({response})
        if (response.body && JSON.parse(response.body) && JSON.parse(response.body).category && JSON.parse(response.body).pagination) {
          generateBtn(response.body)
          chrome.debugger.detach(debuggeeId)
        }
        if (response.body && JSON.parse(response.body).media.length > 0) {
          generateBtn(response.body, true)
        }
      } catch {
      }
    })
  }
}