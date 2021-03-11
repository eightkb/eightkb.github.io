function getEventData(dataType) {
  // General purpose function to interact with the data in local storage
  if( ['sessions','speakers','level_count'].includes(dataType) ) {
    return JSON.parse(window.localStorage.getItem('event_data'))[dataType]
  } else {
    console.error(`"${dataType}" is not a valid event data type.`)
  }
}

function getSpeakers(id = "na") {
  // Gets all speakers, or if an id is passed it gets detailed speaker info
  if ( id != "na" ) {
    return getEventData('speakers').filter(speaker => speaker.id == id)
  } else {
    return getEventData('speakers')
  }
}

function getSessionSummary(id = -1) {
  // Gets summary details for all sessions
  if ( id != -1 ) {
    return this.getEventData('sessions').filter(session => session.id == id)
  } else {
    return this.getEventData('sessions')
  }
}

window.onload = function () {
  // This will cache the event data for 24 hours per user, in local storage
  siteStorage = window.localStorage
  var ageOutDate = new Date(this.Date())
  ageOutDate.setMinutes(ageOutDate.getMinutes())
  if (siteStorage.getItem('event_data') === null || new Date(siteStorage.getItem('last_updated')) < ageOutDate ) {
    var request = new XMLHttpRequest()
    request.open('GET', '/data/data.json', false)
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var data = this.response.replace(/(?:\\[rn])+/g, "<br/><br/>")
        siteStorage.setItem('event_data', data)
        siteStorage.setItem('last_updated',new Date())
      } else {
        console.log('Error retrieving event data: ' + request.statusText)
      }
    }

    request.send()
  }

  // Generate the session line-up
  const sessionData = this.getSessionSummary()
  const speakerDataAll = this.getSpeakers()

  if ( document.getElementById('lineUp') ) {
    if ( sessionData.length > 0 ) {
      const lineUp = document.getElementById('lineUp')
      const lineUpHeader = document.createElement('h1')
      lineUpHeader.setAttribute('class','contentHeader')
      lineUpHeader.setAttribute('id','sessionList')
      lineUpHeader.textContent = 'Session schedule'
  
      const tableElement = document.createElement('table')
      tableElement.setAttribute('class','sessionLineUp')
      
      const tbodyElement = document.createElement('tbody')
      const theaderElement = document.createElement('tr')
  
      const headerFields = [
        {
          'name' : 'Start'
        },
        {
          'name' : 'Title'
        },
        {
          'name' : 'Speaker',
          'width' : '25%'
        },
        {
          'name' : 'Level',
          'width' : '15%'
        }
      ]
      
      headerFields.forEach( header => {
        var headerCell = document.createElement('th')
        headerCell.textContent = header.name
        headerCell.setAttribute('class',"session" + header.name)
        if ( header.width ) {
          headerCell.style.minWidth = header.width
        }
        theaderElement.appendChild(headerCell)
      });
  
      tbodyElement.appendChild(theaderElement)

      var i = 1
      sessionData.forEach( session => {
        var sessionRow = document.createElement('tr')
        sessionRow.setAttribute('class','row')
        if ( i % 2 == 0 ) {
          sessionRow.setAttribute('class','odd row')
        }

        var sessionStart = document.createElement('td')
        if ( session.startsAt ) {
          sessionStart.textContent = session.startsAt.substring(11,16)
        }
        var sessionTitle = document.createElement('td')
        if ( session.title == 'Break' || session.title == 'Welcome') {
          sessionTitle.textContent = session.title
          var sessionSpeaker = document.createElement('td')
          var sessionLevel = document.createElement('td')
        } else {
          var sessionLink = document.createElement('a')
          sessionLink.setAttribute('href',`/detail.html?session_id=${session.id}`)
          sessionLink.textContent = session.title
          sessionTitle.appendChild(sessionLink)
        
        
          var sessionSpeaker = document.createElement('td')
          sessionSpeaker.textContent = session.speakerName
          var sessionLevel = document.createElement('td')
          sessionLevel.setAttribute('class',"sessionLevel")
          sessionLevel.textContent = session.level
        }

        sessionRow.appendChild(sessionStart)
        sessionRow.appendChild(sessionTitle)
        sessionRow.appendChild(sessionSpeaker)
        sessionRow.appendChild(sessionLevel)

        tbodyElement.appendChild(sessionRow)
        i++;
      });

      tableElement.appendChild(tbodyElement)

      lineUp.appendChild(lineUpHeader)
      lineUp.appendChild(tableElement)
    }
  }

  // Generate the speaker list
  if ( ! sessionData && document.getElementById('submittedSpeakers') ) {
    var speakerData = []
    var randomIndexes = []
    var randomIndex = -1
    const speakerCount = parseInt(speakerDataAll.length)
    for (let index = 0; index < 5; index++) {
      while ( randomIndexes.includes(randomIndex) || randomIndex == -1 ) {
        var randomIndex = Math.floor(Math.random() * speakerCount);
      }
      randomIndexes.push(randomIndex)
      speakerData.push(speakerDataAll[randomIndex])
      randomIndex = -1
    }

    if ( speakerData.length > 0 ) {
      const speakerElement = document.getElementById('submittedSpeakers')
      const speakerTable = this.document.createElement('div')
      speakerTable.setAttribute('class','speakerTable')

      const speakerHeader = document.createElement('h1')
      speakerHeader.setAttribute('class','contentHeader')
      speakerHeader.textContent = 'Some of the speakers that have submitted'
  
      speakerElement.appendChild(speakerHeader)
      speakerData.forEach(speaker => {
        var speakerRow = document.createElement('div')
        speakerRow.setAttribute('class','speakerRow')

        var speakerImgDiv = document.createElement('div')
        speakerImgDiv.setAttribute('class','speakerImage')
        var speakerImg = document.createElement('img')
        if ( speaker.profileImage ) {
          speakerImg.setAttribute('src',speaker.profileImage)
        } else {
          speakerImg.setAttribute('src','/img/default.png')
        }
        speakerImg.setAttribute('class','speaker')
        speakerImg.setAttribute('alt',`Profile photo of ${speaker.fullName}`)
        speakerImgDiv.appendChild(speakerImg)
        speakerRow.appendChild(speakerImgDiv)
        
        var speakerInfo = document.createElement('div')
        speakerInfo.setAttribute('class','speakerInfo')

        var speakerName = document.createElement('span')
        speakerName.setAttribute('class','speakerName')
        speakerName.textContent = speaker.fullName
        speakerInfo.appendChild(speakerName)
        
        speakerRow.appendChild(speakerInfo)
        speakerTable.appendChild(speakerRow)
        speakerElement.appendChild(speakerTable)
      })
    }
  }

  // Show session/speaker details depending on url parameters
  const urlParams = new URLSearchParams(window.location.search);
  if ( document.getElementById('detail') ) {
    var detailBlock = document.getElementById('detail')

    if ( urlParams.has('session_id') ) {
      const sessionId = urlParams.get('session_id')
      const sessionDetails = this.getSessionSummary(sessionId)[0]
  
      var sessionTitle = document.createElement('h1')
      sessionTitle.textContent = sessionDetails.title

      var sessionLevel = document.createElement('h3')
      sessionLevel.textContent = `Level: ${sessionDetails.level}`
      
      var sessionLength = document.createElement('h3')
      sessionLength.textContent = `Length: ${sessionDetails.length}`

      var sessionStart = document.createElement('h3')
      sessionStart.textContent = `Starts: January 27th @ ${sessionDetails.startsAt.substring(11,16)}`

      var sessionBody = document.createElement('p')
      sessionBody.innerHTML = sessionDetails.description
      
      const speakerDetails = this.getSpeakers(sessionDetails.speakerId)[0]

      var sessionSpeakerBlock = document.createElement('div')
      sessionSpeakerBlock.setAttribute('class','authorBlock')
      var sessionSpeakerName = document.createElement('h2')
      sessionSpeakerName.setAttribute('class','authorName')
      sessionSpeakerName.textContent = sessionDetails.speakerName

      var sessionSpeakerTag = document.createElement('h3')
      sessionSpeakerTag.setAttribute('class','authorTagline')
      sessionSpeakerTag.textContent = speakerDetails.tagLine

      var speakerImgDiv = document.createElement('div')
      speakerImgDiv.setAttribute('class','speakerImage')

      var speakerImg = document.createElement('img')
      if ( speakerDetails.profileImage ) {
        speakerImg.setAttribute('src',speakerDetails.profileImage)
      } else {
        speakerImg.setAttribute('src','/img/default.png')
      }
      speakerImg.setAttribute('class','speaker floatRight')
      speakerImg.setAttribute('alt',`Profile photo of ${sessionDetails.speakerName}`)
      speakerImgDiv.appendChild(speakerImg)

      var sessionSpeakerBio = document.createElement('p')
      sessionSpeakerBio.innerHTML = speakerDetails.bio

      var sessionSpeakerLinks = document.createElement('div')
      sessionSpeakerLinks.setAttribute('class','speakerLinks')
      var sessionSpeakerLinksHeader = document.createElement('h3')
      sessionSpeakerLinksHeader.textContent = 'Speaker links:'
      sessionSpeakerLinks.appendChild(sessionSpeakerLinksHeader);

      speakerDetails.links.forEach(link => {
        var currLink = document.createElement('p')
        var currLinkA = document.createElement('a')
        currLinkA.setAttribute('href',link.url)
        currLinkA.textContent = link.title
        currLink.appendChild(currLinkA)
        sessionSpeakerLinks.appendChild(currLink)
      })

      sessionSpeakerBlock.appendChild(speakerImgDiv);
      sessionSpeakerBlock.appendChild(sessionSpeakerName);
      sessionSpeakerBlock.appendChild(sessionSpeakerTag);
      sessionSpeakerBlock.appendChild(sessionSpeakerBio);
      sessionSpeakerBlock.appendChild(sessionSpeakerLinks);

      detailBlock.appendChild(sessionTitle);
      detailBlock.appendChild(sessionLevel);
      detailBlock.appendChild(sessionLength);
      detailBlock.appendChild(sessionStart);
      detailBlock.appendChild(sessionBody);
      detailBlock.appendChild(sessionSpeakerBlock);
    } else {
      if ( urlParams.has('speaker_id') ) {
        console.log('Test')
      }
    }
  }
}
