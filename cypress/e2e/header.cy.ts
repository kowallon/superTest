import { releasesPage } from "../objects/releasesPage"

describe('Header tests', () => {
  
  beforeEach(function(){
    
    cy.fixture('data').then((fileData : { name: string }[])=>{
      this.testData = fileData.find(({name}) => name === Cypress.currentTest.title)
    })

    cy.visit('/docs/api/fred/releases.html')
  })


  it('passes', function(){
    let testData = this.testData

    cy.get(releasesPage.header).eq(0).should('be.visible', {timeout: 10000})
    console.log(testData)
  })
})