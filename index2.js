const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const EventEmmiter = require('events')
const AirBnbHost = require('./dataScheme')
const emitter = new EventEmmiter()
emitter.setMaxListeners(0)
const readline = require('readline')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const dbConfig = require('./databaseUrl')
const mongoose = require('mongoose')

mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
       console.log('successfully connected')
  })
  .catch((err) => {
    console.log('not connected', err)
    process.exit()
  })
  var filter = ''
const name = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
async function filterData() {
  name.question('enter host name : ', (answer1) => {
    filter = answer1

    name.close()
    dataPage()
  })
}


async function mainPage() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    'https://www.airbnb.com/s/Portugal/homes?place_id=ChIJ1SZCvy0kMgsRQfBOHAlLuCo&refinement_paths%5B%5D=%2Fhomes&adults=0&children=0&infants=0&search_type=AUTOSUGGEST'
  )

  await page.waitForSelector('._wy1hs1')

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a._wy1hs1')).map((x) => x.href)
  })

  console.log(names)
  await browser.close()
  return names
}

async function hotelPage() {
  const links = await mainPage()
  const hotelLinks = []
  //const bedRooms = []
  //const beds = []
  //const baths = []
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  var count = 1
  for (let link of links) {
    await page.goto(link)
    count = count + 1
    await page.waitForSelector('._mm360j')

    const hotelLink = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a._mm360j')).map(
        (x) => x.href
      )
    })

    await page.waitForSelector('div._12oal24')

    const bedRooms = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(3)'
        )
      ).map((x) => x.textContent)
    })

    const beds = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(5)'
        )
      ).map((x) => x.textContent)
    })

    const baths = await page.evaluate(() => {
      return Array.from(
        document.querySelectorAll(
          'div._12oal24 div:nth-child(3) span:nth-child(7)'
        )
      ).map((x) => x.textContent)
    })
    var num = 0
    for (let hotel of hotelLink) {
      const obj = {
        link: hotel,
        beds: beds[num],
        baths: baths[num],
        bedRooms: bedRooms[num],
      }
      await hotelLinks.push(obj)
     
    }
  }
  await browser.close()
  await console.log(hotelLinks)
  return hotelLinks
}

async function dataPage() {
  const links = await hotelPage()
  const title = []
  const rating = []
  const noOfRating = []
  const data = []
  var testId = 0

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)

  for (let link of links) {
    testId = testId + 1
    console.log(testId)

    await page.goto(link.link)

    await page.waitForSelector('._fecoyn4', {
      waitUntil: 'load',
      timeout: 0,
    })

    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1._fecoyn4')).map(
        (x) => x.textContent
      )
    })

    await page.waitForSelector('h2._14i3z6h', {
      waitUntil: 'load',
      timeout: 0,
    })

    const hostNames = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h2._14i3z6h')).map(
        (x) => x.textContent
      )
    })
 
    var host = ''
    var property_num = 1
    var hName = hostNames[0]
    var b = hName.split(' ')
    if (b[0] == 'Meet' || b[0]== 'meet') {
      var c = hName.split('Host, ')
      host = c[1]
      //console.log(c)
    } else {
      var c = hName.split('hosted by')
      var e = c.length
      var d = c[e - 1].split('')
      // console.log(d)
      for (let i = 1; i < d.length; i++) {
        host = host + d[i]
      }
    }
    console.log(host)
   
    

   

    
    if (host == filter) {
      try {
        await page.waitForSelector('div.rgpeg0e', {
          waitUntil: 'load',
          timeout: 50000,
        })
      } catch (err) {
        //console.log('error')
      }
      //console.log('*')
      try {
        await page.waitForSelector(
          '#site-content > div > div:nth-child(1) > div:nth-child(4) > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div.ciubx2o',
          {
            waitUntil: 'load',
            timeout: 50000,
          }
        )
      } catch (err) {
        console.log('error')
      }
      console.log('*')

      const ratings = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.ciubx2o div._1s11ltsf div._bgq2leu span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })


      /*const Cleanliness = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(1) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })
      const Accuracy = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(2) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })
      const Communication = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(3) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })
      const Location = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(4) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })
      const Checkin = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(5) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })
      const Value = await page.evaluate(() => {
        try {
          return Array.from(
            document.querySelectorAll(
              'div.rgpeg0e div:nth-child(6) span._4oybiu'
            )
          ).map((x) => x.textContent)
        } catch (err) {
          console.log('error')
        }
      })*/

      //console.log('Cleanliness : ' + Cleanliness[0])
      //console.log('Accuracy : ' + Accuracy[0])
      //console.log('Communication : ' + Communication[0])
      //console.log('Location : ' + Location[0])
      //console.log('Check-in : ' + Checkin[0])
      //console.log('Value : ' + Value[0])

      const obj = {
        Host_Name: host,
        No: property_num,
        Property_Name: titles[0],
        
        Cleanliness_Ratings: ratings[0],
        Accuracy_Ratings: ratings[1],
        Communication_Ratings: ratings[2],
        Location_Ratings: ratings[3],
        Checkin_Ratings:ratings[4],
        Value_Ratings:ratings[5],
        Beds: link.beds,
        Baths: link.baths,
        BedRooms: link.bedRooms,
      }
      await data.push(obj)
      console.log(obj)
      const air = new AirBnbHost(obj)
      air.save()
      property_num = property_num + 1
    }

    // await console.log(noOfRatings[0])
    //await noOfRating.push(noOfRatings[0])
    /*const dataObj = {
      title: titles[0],
      host: host*/
      //BedRooms: bedRooms[0],
      // Beds: beds[0],
      //Baths: baths[0],

      //rating: 5, //ratings[0],
      //Reviews: noOfRatings[0],

      /*Cleanliness_Ratings: Cleanliness[0],
      Accuracy_Ratings: Accuracy[0],
      Communication_Ratings: Communication[0],
      Location_Ratings: Location[0],
      Checkin_Ratings: Checkin[0],
      Value_Ratings: Value[0],*/
    }

    
    //console.log(dataObj)
    //await data.push(dataObj)
    // await console.log(dataObj)
  

  await browser.close()
  //await console.log(data)
}
filterData()
