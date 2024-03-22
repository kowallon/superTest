import { expect } from 'chai';
import request from 'supertest';


var chai = require('chai');
chai.use(require("chai-sorted"))
chai.use(require('chai-xml'))
chai.use(require('chai-datetime'))

const baseUrl = 'https://api.stlouisfed.org/fred/releases?api_key='
const apiKey = '9d8a5db9e0af1309639fae7f166e4acd'
const jsonType = '&file_type=json'


describe('Happy path API Tests', () => {

    it('TC.01 Dane zwracane domyślnie w formacie XML', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get('')
        expect(response.status).to.equal(200)
        expect(response.text).xml.to.be.valid()

    })


    it('TC.02 Dane zwracane w formacie JSON', async () => {

        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)
        
        //zainstaluj npm install chai-json
        expect(response.status).to.equal(200);
        expect(response.body).to.be.a('object')
    });

    it('TC.03 Domyślna data początkowa jest równa dziś', async() =>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)
        let currentDate = new Date();
        let formattedDate = currentDate.toISOString().substring(0, 10);
        expect(response.status).to.equal(200)
        expect(response.body.realtime_start).to.equal(formattedDate)
    })

    it('TC.04 Domyślna data końcowa jest równa dziś', async() =>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)
        let currentDate = new Date();
        let formattedDate = currentDate.toISOString().substring(0, 10);
        expect(response.status).to.equal(200)
        expect(response.body.realtime_end).to.equal(formattedDate)
    })

    it('TC.05 Limit zwróconych wyników jest ograniczony do 1000', async() =>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)
        expect(response.status).to.equal(200)
        expect(response.body.limit).to.equal(1000)
        expect(response.body.releases.length).to.be.greaterThanOrEqual(0).and.lessThanOrEqual(1000)
    })

    it('TC.06 Offset pomija wyniki od początku', async() =>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)
        let first = response.body.releases[0].id
        let second = response.body.releases[1].id
        let third = response.body.releases[2].id
        expect(response.status).to.equal(200)
        
        const response2 = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}&offset=2`)

        let results: Object[] = response2.body.releases
        
        results.forEach((singleResult : any) => {
            expect(singleResult.id).to.not.equal(first)
            expect(singleResult.id).to.not.equal(second)
        });
        expect(response2.status).to.equal(200)

        expect(response2.body.releases[0].id).to.equal(third)
        
    })

    it('TC.07 Wyniki są domyślnie posortowane rosnąco wg. id', async() =>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(jsonType)

        let index = response.body.releases.length

        expect(response.status).to.equal(200)
        for(let i=0; i< index-1; i++){
            let j = i+1
            expect(response.body.releases[i].id).to.be.lessThan(response.body.releases[j].id)
        }
        
    })

    it('TC.08 Wyniki są posortowane po nazwie malejąco', async() =>{


        const response = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}&order_by=name&sort_order=desc`)

        let slicedArray = response.body.releases.slice(0,12)
        
        // console.log(response.body.releases[12].name)
        // console.log(response.body.releases[13].name)
        //expect([{name:'Weekly and Hourly Earnings from the Current Population Survey'}, {name:'Wall Street Journal'}]).to.be.sortedBy("name", {descending: true})

        expect(slicedArray).to.be.sortedBy("name", {descending: true})
        expect(response.status).to.equal(200)

    })

    it('TC.09 Każdy release zawiera odpowiednie dane', async()=>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}`)

        expect(response.status).to.equal(200)

        for(let release of response.body.releases){
            expect(release).to.haveOwnProperty('id')
            expect(release).to.haveOwnProperty('realtime_start')
            expect(release).to.haveOwnProperty('realtime_end')
            expect(release).to.haveOwnProperty('name')

            expect(release).to.haveOwnProperty('press_release')
            expect(release.press_release).to.be.a('boolean')

        }

    })

    it('TC.10 Podanie parametru realtime_start zwróci prawidłowe wyniki od podanej daty', async()=>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}&realtime_start=2000-01-01`)

        expect(response.status).to.equal(200)
        expect(response.body.realtime_start).to.equal('2000-01-01')
        expect(response.body.realtime_end).to.equal('9999-12-31')
    })

    it('TC.11 Podanie parametru realtime_end zwróci prawidłowe wyniki do podanej daty', async()=>{
        const response = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}&realtime_end=2000-01-01`)

        expect(response.status).to.equal(200)
        expect(response.body.realtime_end).to.equal('2000-01-01')
        expect(response.body.realtime_start).to.equal('1776-07-04')
    })

    it('TC.12 Wyniki tylko z danego przedziału czasowego są zwrócone prawidłowo', async()=>{
        //zainstaluj npm install chai-datetime
        let startDateString = '1980-01-01'
        let endDateString = '1989-12-31'

        let startDate = new Date(startDateString)
        let endDate = new Date(endDateString)

        const response = await request(`${baseUrl}${apiKey}`)
        .get(`${jsonType}&realtime_start=${startDateString}&realtime_end=${endDateString}`)

        expect(response.status).to.equal(200)
        expect(response.body.realtime_end).to.equal('1989-12-31')
        expect(response.body.realtime_start).to.equal('1980-01-01')

        
        
        for(let release of response.body.releases){
            let returnedStartTime = new Date(release.realtime_start)
            let returnedEndTime = new Date(release.realtime_end)

            expect(returnedStartTime).to.be.afterOrEqualDate(startDate)
            expect(returnedEndTime).to.be.beforeOrEqualDate(endDate)
        }
    })
});


describe('Handling errors', async()=>{
    it('TC.13 Przy nieprawidłowym kluczu wyniki nie zostaną zwrócone', async()=>{
        const response = await request(`${baseUrl}9d8a5db9e0af1309639fae7f166e4acb`).get(jsonType)

        expect(response.status).to.equal(400)
        expect(response.body.error_message).to.contain('The value for variable api_key is not registered.')
    })

    it('TC.14 Podanie formatu innego niż JSON/XML nie zwróci wyników', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get('&file_type=html')

        expect(response.status).to.equal(400)
    })

    it('TC.15 Podanie realtime_start jako datę przyszłą nie zwróci wyników', async()=>{
        let futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 2)
        let formattedDate = futureDate.toISOString().substring(0, 10)

        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&realtime_start=${formattedDate}`)

        expect(response.status).to.equal(400)
        expect(response.body.error_message).to.contain("Variable realtime_start can not be after today's date")
    })

    it('TC.16 Offset ustawiony jako liczba ujemna', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&offset=-1`)

        expect(response.status).to.equal(400)
    })

    it('TC.17 Podanie realtime_start jako datę wcześniejszą niż 1776-07-04 nie zwróci wyników', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&realtime_start=1776-07-03`)

        expect(response.status).to.equal(400)
    })

    it('TC.18 Podanie realtime_start w nieprawidłowym formacie nie zwróci wyników', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&realtime_start=21-07-2023`)

        expect(response.status).to.equal(400)
    })

    it('TC.19 Podanie limit powyżej 1000 nie zwróci wyników', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&limit=1001`)

        expect(response.status).to.equal(400)
    })

    it('TC.20 Podanie offset = 1000 zwróci pustą tablice releases', async()=>{
        const response = await request(`${baseUrl}${apiKey}`).get(`${jsonType}&offset=1000`)

        expect(response.status).to.equal(200)
        expect(response.body.releases).to.be.empty
    })


})