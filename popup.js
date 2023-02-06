window.addEventListener("load", function () {
  console.log("POPUP: OnLoad")
  let noData = document.getElementById("nodata");
  let buttons = []
  if (localStorage.buttons) {
    buttons = JSON.parse(localStorage.buttons)
    noData.innerHTML = ''
  } else {
    noData.innerHTML = '目前沒有資料'
  }
  chrome.tabs.query({ url: 'https://www.jw.org/*' }, function (e) {
    let active = e.some((el) => { return el.active && el.url.match('mediaitems') })
    if (buttons.length < 1 || !active) {
      document.body.setAttribute("class", 'noData')
      document.body.innerHTML = '<p>subtitle not detected</p>'
    }
  })
  // chrome.runtime.sendMessage({onLoad: true}, function(response) {
  // });
  generateBtn(buttons)
  // chrome.runtime.onMessage.addListener(messageReceived);
  var link = document.getElementById('res')
  const fileName = document.querySelector('#fileName-option')
  const subtitle = document.querySelector('#subtitle-option')
  const subtitleInput = document.querySelector('#subtitle-option > input')

  fileName.addEventListener('change', function (e) {
    if (!e.target.checked) {
      subtitleInput.checked = false
      checkList.removeTimeLine = false
      subtitle.classList.add('active')
    }
    addClass(e, 'downloadTxt')
  })
  subtitle.addEventListener('change', function (e) {
    if (!checkList.downloadTxt && e.target.checked) {
      subtitleInput.checked = false
      checkList.removeTimeLine = false
      subtitle.classList.add('active')
    } else {
      addClass(e, 'removeTimeLine')
    }
  })
  link.addEventListener('click', function () { reload() })
}, false)

function messageReceived(msg) {
  generateBtn(msg, true)
}
let checkList = { downloadTxt: true, removeTimeLine: true }

function addClass(target, type) {
  const fileName = document.querySelector('#fileName-option')
  const subtitle = document.querySelector('#subtitle-option')
  checkList[type] = !checkList[type]
  if (type == 'removeTimeLine') {
    if (!subtitle.className.includes('active')) {
      subtitle.classList.add('active')
    } else { subtitle.classList.remove('active') }
  } else {
    if (!fileName.className.includes('active')) {
      fileName.classList.add('active')
    } else { fileName.classList.remove('active') }
  }
}

function generateBtn(buttons) {
  if (buttons.length < 1) return
  buttons.forEach(button => {
    let currentDiv = document.getElementById("container")
    let newText = document.createTextNode(`${button.title}`)
    let newDiv = document.createElement('div')
    let newLink = document.createElement('a')
    let newIcon = document.createElement('img')
    newIcon.setAttribute('src', 'download.png')
    newLink.appendChild(newText)
    newDiv.appendChild(newIcon)
    newLink.setAttribute("data-url", button.url)
    newLink.onclick = function (newLink) {
      download(newLink)
    }
    newDiv.setAttribute("class", 'column')
    newDiv.setAttribute("class", 'first column')
    newDiv.appendChild(newLink)
    currentDiv.appendChild(newDiv)
  })
}

let currentTab;
let version = "1.0"
let query = { active: true, currentWindow: true }

function reload() {
  chrome.tabs.query(query, function (arrayOfTabs) {
    var code = 'window.location.reload();';
    chrome.tabs.executeScript(arrayOfTabs[0].id, { code: code });
  });
}

function download(e) {
  let url = e.target.dataset['url']
  let request = new XMLHttpRequest()
  request.open('GET', `${url}`, true)
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      let text = request.responseText
      if (checkList.removeTimeLine) {
        text = text.replace(/(\d\d:.+)\s(\d\d:.+)/g, '%s').replace('WEBVTT', '').replace(/\s\s\s/g, '').replace(/%s/g, '')
      }
      let blob = new Blob([text], { type: "text/plain;charset=utf-8" });

      if (checkList.downloadTxt) {
        saveAs(blob, `${e.target.innerHTML}.txt`)
      } else {
        saveAs(blob, `${e.target.innerHTML}.vtt`)
      }
    }
  }
  request.send()
}
