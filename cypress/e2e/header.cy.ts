import { releasesPage } from "../objects/releasesPage"

describe('Header tests', () => {
  
  beforeEach(function(){
    
    cy.fixture('data').then((fileData : { name: string }[])=>{
      this.testData = fileData.find(({name}) => name === Cypress.currentTest.title)
    })

    cy.visit('/docs/api/fred/releases.html')
  })


  it('Navbar is displayed and contains correct buttons', function(){
    cy.get(releasesPage.header).eq(0).should('be.visible', {timeout: 10000})

    cy.get(releasesPage.header).find(releasesPage.resourcesLink).should('be.visible')
    cy.get(releasesPage.header).find(releasesPage.accountLink).should('be.visible')
    cy.get(releasesPage.header).find(releasesPage.products).should('be.visible')

  })

  it('Buttons in headers contain correct text', function(){
    let testData = this.testData

    cy.get(releasesPage.header).find(releasesPage.resourcesLink).should('contain', testData.researchText)
    cy.get(releasesPage.header).find(releasesPage.accountLink).should('contain', testData.accountText)
    cy.get(releasesPage.header).find(releasesPage.products).should('contain', testData.productsText)
  })

  it('Open random resources link', function(){
    releasesPage
    .openRandomLink(releasesPage.resourcesLink, releasesPage.resourcesPopover)
  })

  it('All producs are displayed', function(){
    let testData = this.testData

    cy.get(releasesPage.products).click()
    for(let i =0; i<4; i++){
      cy.get(releasesPage.productsList).find('[id^="ham-"]').eq(i).should('contain.text', testData.productNames[i])
    }
    
  })

  it('Log in pop-up is displayed properly', function(){
    releasesPage.verifyLogInPopUp()
  })

  it('Registration form requires correct email', function(){
    let testData = this.testData
    let randomOption = Math.floor(Math.random() * 6) + 1

    cy.get(releasesPage.accountLink).click()

    cy.get(releasesPage.registerTab).click()
    cy.get(releasesPage.registerForm).should('be.visible')

    cy.wait(1000)
    cy.get(releasesPage.emailField).type(testData.email)
    cy.get(releasesPage.registerPassField).type(testData.password)
    cy.get(releasesPage.confirmPassField).type(testData.password)

    cy.get(releasesPage.checkboxes).getAny().click({force:true})

    cy.get(releasesPage.profileSelect).select(randomOption)

    cy.intercept({
      method: 'POST',
      url: '**/login.json/register'
    }).as('login')

    cy.get(releasesPage.submitBtn).click()

    cy.wait('@login').its('response.statusCode').should('eql', 200)

    cy.get('@login').then(async (loginResponse: any)=>{
      await expect(loginResponse.response.body.errors.email).to.contain('Please enter email address (example@mail.com)')
      await expect(loginResponse.response.body.errors).to.haveOwnProperty('recaptcha')
    })

  })
})

describe('Mobile view', function(){

  beforeEach(function(){

    cy.viewport(360,740)

    cy.visit('/docs/api/fred/releases.html')
  })

  it('Search in mobile view', function(){
    cy.get(releasesPage.hamburger).click()
    cy.get(releasesPage.hamburgerMenu).should('be.visible')

    cy.get(releasesPage.searchInput).eq(0).type('Economic')
    cy.get(releasesPage.submitSearch).eq(0).click()

    cy.get(releasesPage.searchResults).getAny().should('contain', 'Economic')
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false
    })
  })
})