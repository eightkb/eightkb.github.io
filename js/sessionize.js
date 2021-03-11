const app = document.getElementById('content')

var request = new XMLHttpRequest()
request.open('GET', 'https://sessionize.com/api/v2/jl4ktls0/view/Speakers', true)
request.onload = function() {
  // Begin accessing JSON data here
  var data = JSON.parse(this.response)
  if (request.status >= 200 && request.status < 400) {
    data.forEach(speaker => {
      const container = document.createElement('div')
      container.setAttribute('class', 'container')

      const authorBlock = document.createElement('div')
      authorBlock.setAttribute('class', 'authorBlock')

      const authorOffset = document.createElement('span')
      authorOffset.setAttribute('class','authorOffset')

      const authorFirst = document.createElement('span')
      authorFirst.setAttribute('class','authorFirst')
      authorFirst.textContent = speaker.firstName

      const authorLast = document.createElement('span')
      authorLast.setAttribute('class','authorLast')
      authorLast.textContent = speaker.lastName

      authorOffset.appendChild(authorFirst)
      authorOffset.appendChild(authorLast)
      authorBlock.appendChild(authorOffset)

      container.appendChild(authorBlock)
      app.appendChild(container)
    })
  } else {
    const errorMessage = document.createElement('marquee')
    errorMessage.textContent = `Gah, it's not working!`
    app.appendChild(errorMessage)
  }
}

request.send()