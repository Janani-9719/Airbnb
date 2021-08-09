const puppeteer = require('puppeteer')
const eventsEmitter = require('events')
const emitter = new eventsEmitter()
emitter.setMaxListeners(0)

const fs = require('fs/promises')

const express = require('express')
const bodyParser = require('body-parser')
const AirBnb = require('./mongooseConnector')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const dbConfig = require('./DbConnector.js')
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

async function mainPage() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://www.airbnb.com/')

  await page.waitForSelector('._wy1hs1')

  const names = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a._wy1hs1')).map((x) => x.href)
  })

  console.log(names)
  await fs.writeFile('names.txt', names.join('\r\n'))

  await browser.close()
  return names
}
async function hotelPage() {
  const links = await mainPage()
  const hotelLinks = []
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  for (let link of links) {
    await page.goto(link)

    await page.waitForSelector('._mm360j')

    const hotelLink = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a._mm360j')).map(
        (x) => x.href
      )
    })

    for (let hotel of hotelLink) {
      //await console.log(hotel)
      await hotelLinks.push(hotel)
    }
  }
  await browser.close()
  // await fs.writeFile('nameHotels.txt', hotelLinks.join('\r\n'))
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

    await page.goto(link)

    await page.waitForSelector('._fecoyn4', { waitUntil: 'load', timeout: 0 })

    const titles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1._fecoyn4')).map(
        (x) => x.textContent
      )
    })
await page.waitForSelector(' button._1qf7wt4w', {
      waitUntil: 'load',
      timeout: 0,
    })

    const noOfRatings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button._1qf7wt4w')).map(
        (x) => x.textContent
      )
    })
      const dataObj = {
      title: titles[0],
      rating: 5, //ratings[0],
      Reviews: noOfRatings[0],
    }

    const air = new AirBnb(dataObj)
    air.save()
    console.log(dataObj)
    //await data.push(dataObj)
    // await console.log(dataObj)
  }

  await browser.close()
  //await console.log(data)
}
dataPage()

