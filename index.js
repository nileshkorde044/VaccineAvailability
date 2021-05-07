const axios = require('axios');
const format = require('date-fns/format')
const addDays = require('date-fns/addDays')

let count = 0

const parseRespose = (data) => {
  const availabeCenters = data.map(center => {
    const avail = center.sessions.find(session => session.vaccine === 'COVISHIELD' && session.min_age_limit === 45 && session.available_capacity > 0)
    const isAvailable = !!avail
    const { name, address, district_name, block_name } = center
    return {
      name, address, district_name, block_name,
      isAvailable,
      allSessions: JSON.stringify(
        center.sessions.filter(session => session.vaccine === 'COVISHIELD' && session.min_age_limit === 45 && session.available_capacity > 0)
        .map(({ available_capacity, date }) => ({ available_capacity, date }))
        )
    }
  })
  return availabeCenters.filter(cen => cen.isAvailable)
}

const getCalendarByDistrict = (dateParam) => {
  return axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=391&date=${dateParam}`, {
    headers: {
      'accept': 'application/json',
      'Accept-Language': 'en-US',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
    }
  })
    .then(response => parseRespose(response.data.centers))
    .catch(error => console.log(error));
}

async function checkStatus() {
  count++
  console.log('---------------Check status# ' + count + '----------------------')
  const dateParam = format(addDays(new Date(), 1), 'dd-MM-yyyy')
  const dateParam2 = format(addDays(new Date(), 8), 'dd-MM-yyyy')

  console.log(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=391&date=${dateParam}`)
  console.log(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=391&date=${dateParam2}`)

  const [currentWeek, nextWeek] = await Promise.all([getCalendarByDistrict(dateParam), getCalendarByDistrict(dateParam2)])
  console.log(currentWeek.concat(nextWeek))

  if (count === 300) {
    clearInterval(this)
  }
}

checkStatus()
setInterval(checkStatus, 60000);
