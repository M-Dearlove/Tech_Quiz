import { mount } from 'cypress/react18';
import Quiz from '../../client/src/components/Quiz';

describe('Quiz Component', () => {
    beforeEach(() => {
        // Stub the API call to return mock questions
        cy.intercept('GET', '/api/questions/random', { fixture: 'questions.json' }).as('getQuestions');
    });

    // Display start button test
    it('should display the start quiz button on page load', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').should('be.visible');
    });

    //start the quiz on start click test
    it('should display the quiz question with answers when the start button is clicked', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').click();
        cy.wait('@getQuestions', { timeout: 10000 });
        cy.get('h2').should('exist');
        cy.get('.alert.alert-secondary').should('have.length.at.least', 2);
        cy.get('h2').invoke('text').as('firstQuestionText');
    });

    // select answer test
    it('should allow you to select an answer', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').click();
        cy.get('.btn.btn-primary').first().click();
    });

    // check next question test
    it('should display the next question when an answer is selected', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').click();
        cy.wait('@getQuestions');
        let firstQuestionText;
        cy.get('h2').invoke('text').then((text) => {
            firstQuestionText = text;
            cy.get('[data-testid="answer-button"]').first().click({ force: true });
            cy.get('h2').should('not.have.text', firstQuestionText);
        });
    });

    // finish quiz test
    it('should finish the quiz after answering all questions', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').click();
        cy.get('h2').should('exist', { timeout: 10000 });
        cy.get('.alert.alert-secondary').then($answers => {
            const allQuestions = () => {
                cy.get('.btn.btn-primary').first().click();
                cy.get('body').then($body => {
                    if ($body.find('h2:contains("Quiz Completed")').length === 0) {
                        allQuestions();
                    }
                });
            };
            allQuestions();
        });

        cy.get('h2').should('contain', 'Quiz Completed');
        cy.get('.alert.alert-success').should('contain', 'Your score:');
        cy.get('button').contains('Take New Quiz').should('be.visible');
    });

    // reset quiz test
    it('should reset the quiz when the "Take New Quiz" button is clicked', () => {
        mount(<Quiz />);
        cy.get('button').contains('Start Quiz').click();
        cy.get('h2').should('exist', { timeout: 10000 });
        cy.get('.alert.alert-secondary').then($answers => {
            const allQuestions = () => {
                cy.get('.btn.btn-primary').first().click();
                cy.get('body').then($body => {
                    if ($body.find('h2:contains("Quiz Completed")').length === 0) {
                        allQuestions();
                    }
                });
            };
            allQuestions();

            cy.get('button').contains('Take New Quiz').click();
            cy.get('h2').should('exist');
            cy.get('.alert.alert-secondary').should('have.length.at.least', 2);
        });
    });
});