export class ReleasesPage{
    
    //selectors
    header : string = '.navbar'
    resourcesLink: string = '#research-resources-link'
    products: string = '#switchProd'
    accountLink : string = '#my-account-link'

    resourcesPopover : string = '#research-resources-popover'
    productsPopover : string = '#switchprod-popover'
    productsList: string = '#switch-prod-list'

    //login popup
    signInModal: string = '#sign-in-modal'
    emailField: string = '#eml'
    passwordField: string = '#pw'
    rememberChexkbox: string = '#stay_logged_in'
    forgottenPasswordLink: string = 'a.sirm-link'
    signInTab: string = '#sign-in-tab'
    registerTab: string = '#register-tab'
    registerForm: string = '#register-form'
    registerPassField: string = '#npass'
    confirmPassField: string = '#rpass'
    checkboxes: string = '.gui-checkbox[type="checkbox"]'
    profileSelect: string = '#profile-type'
    submitBtn : string = 'input[type="submit"]'

    //mobile
    hamburger: string = '#hamburger'
    hamburgerMenu: string = '#hamburger-popover'
    searchInput : string = 'input[type="text"]'
    submitSearch : string = '[class*="search-submit"]'
    searchResults: string = '.search-list-item'

    //methods
    openRandomLink(category : string, popover : string){
        cy.get(category).should('be.visible', {timeout: 7500}).click({force:true})
        cy.get(popover).should('be.visible', {timeout: 7500})

        cy.get(popover).find('li').getAny().find('a').invoke('attr', 'href').as('link')
        cy.get('@link').then((link : any) =>{
            cy.visit(link)
        })
        Cypress.on('uncaught:exception', (err, runnable) => {
            return false
          })
          
        cy.wait(1500)
        cy.window().then(win => {
            win.history.back()
          })

        cy.wait(1500)  
    }

    verifyLogInPopUp(){
        cy.get(this.accountLink).click()
        cy.get(this.signInModal).should('be.visible', {timeout: 10000})

        cy.get(this.emailField).should('be.visible')
        cy.get(this.passwordField).should('be.visible')
        cy.get(this.rememberChexkbox).should('be.visible')
        cy.get(this.forgottenPasswordLink).should('be.visible')
        cy.get(this.signInTab).should('be.visible')
    }


}


export const releasesPage = new ReleasesPage