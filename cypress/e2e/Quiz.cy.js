describe ('Quiz Application', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.intercept('GET', '/api/questions/random', { fixture: 'questions.json' }).as('getQuestions');
        //});
    });

    it ('should launch the quiz application with the start quiz button', () => {
        cy.get('button').contains('Start Quiz').should('be.visible');
    //});
        cy.get('button').contains('Start Quiz').click();
        cy.get('h2').should('exist', { timeout: 10000 });
        cy.get('.alert.alert-secondary').should('have.length.at.least', 2);
    });

    it ('should allow you to select an answer and show the next question', () => {
        cy.get('button').contains('Start Quiz').click();
        let firstQuestionText;
        cy.get('h2').invoke('text').then((text) => {
            firstQuestionText = text;
            cy.get('[data-testid="answer-button"]').first().click({ force: true });
            cy.get('h2').should('not.have.text', firstQuestionText);
        });
    });

    it ('should finish the quiz after answering all questions', () => {
        cy.get('button').contains('Start Quiz').click();
        cy.get('h2').should('exist', { timeout: 10000 });
        const allQuestions = () => {
            cy.get('.btn.btn-primary').first().click();
            cy.get('body').then($body => {
                if ($body.find('h2:contains("Quiz Completed")').length === 0) {
                    allQuestions();
                }
            });
        };
        allQuestions();
        cy.get('h2').should('contain', 'Quiz Completed');
        cy.get('.alert.alert-success').should('contain', 'Your score:');
        cy.get('button').contains('Take New Quiz').should('be.visible');
    });

    it ('should reset the quiz when clicking "Take New Quiz"', () => {
        cy.get('button').contains('Start Quiz').click();
        cy.get('h2').should('exist', { timeout: 10000 });
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
        cy.get('h2').should('exist', { timeout: 10000 });
        cy.get('.alert.alert-secondary').should('have.length.at.least', 2);
    });

    it ('should track score correctly', () => {
        cy.intercept('GET', 'api/questions/random').as('getQuestions');
        cy.get('button').contains('Start Quiz').click();
        cy.wait('@getQuestions').then((interception) => {
            // @ts-ignore
            const questions = interception.response.body;
            let correctAnswers = 0;

            const answerTracking = (currentIndex = 0) => {
                if (currentIndex >= questions.length) {
                    cy.get('.alert.alert-success').should('contain', `Your score: ${correctAnswers}/${questions.length}`);
                    return;
                }

                const currentQuestion = questions[currentIndex];

                const correctAnswerIndex = currentQuestion.answers.findIndex((/** @type {{ isCorrect: any; }} */ answer) => answer.isCorrect);
                cy.get('.btn.btn-primary').eq(correctAnswerIndex).click();
                correctAnswers++;

                cy.get('body').then($body => {
                    if ($body.find('h2:contains("Quiz Completed")').length === 0) {
                        answerTracking(currentIndex + 1);
                    } else {
                        cy.get('.alert.alert-success').should('contain', `Your score: ${correctAnswers}/${questions.length}`);
                    }
                });
            };

            answerTracking();
        });
    });

    it ('should handle API errors properly', () => {
        cy.intercept('GET', 'api/questions/random', {
            statusCode: 500,
            body: { error: 'Internal Server Error' }
        }).as('getQuestionsError');

        cy.get('button').contains('Start Quiz').click();
        cy.wait('@getQuestionsError');
    });

    it('should check if each answer button is clickable', () => {
        cy.get('button').contains('Start Quiz').click();
        
        cy.get('h2').should('exist', { timeout: 10000 });
        
        cy.get('.alert.alert-secondary').each(($el, index) => {
          cy.wrap($el).should('be.visible');
          cy.get('.btn.btn-primary').eq(index).should('be.visible');
          cy.get('.btn.btn-primary').eq(index).should('not.be.disabled');
        });
    });
});