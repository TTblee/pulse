const fs = require('fs');

class Response {
    constructor() {
        // Survey Question time tracking
        this.questionTimes = {};
        this.answers = {};

        this.isResponseSubmitted = false;

        // timer to track question time
        this.questionStartTime = null;
    }

    getAnswers() {
        return this.answers;
    }

    getQuestionTimes() {
        return this.questionTimes;
    }

    isSubmitted() {
        return this.isResponseSubmitted;
    }

    async submit() {
        this.isResponseSubmitted = true;
        this.questionStartTime = undefined;

        const startSurveyElapsedTime = this.questionTimes[Response.START_SURVEY];
        const questionTimesList = Object.values(this.questionTimes);
        const totalInteractionElapsedTime = questionTimesList
            .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

        const totalSurveyElapsedTime = totalInteractionElapsedTime - startSurveyElapsedTime;

        Object.assign(this, {
            total_interaction_elapsed_time: totalInteractionElapsedTime,
            total_survey_elapsed_time: totalSurveyElapsedTime,
        });

        try {
            fs.appendFileSync('response.txt', `${JSON.stringify(this)}\n`);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    startResponseTimeForQuestion(questionKey) {
        this.questionTimes[questionKey] = 'user is on this question';
        this.questionStartTime = new Date().getTime();
    }

    submitResponseForQuestion(questionKey, answer) {
        const questionEndTime = new Date().getTime();
        this.questionTimes[questionKey] = questionEndTime - this.questionStartTime;

        this.answers[questionKey] = answer;
    }
}

Response.MOOD = 'mood';
Response.WHAT_TEAM = 'on_what_team';
Response.TEAM = 'team';
Response.COMPANY = 'company';
Response.INDIVIDUAL = 'individual';
Response.START_SURVEY = 'start_survey';

class ResponseCollection {
    constructor() {
        this.collection = {};
    }

    initializeResponse(userId) {
        this.collection[userId] = new Response();
    }

    getResponse(userId) {
        return this.collection[userId];
    }

    hasResponse(userId) {
        return Boolean(this.collection[userId]);
    }
}

module.exports = { Response, ResponseCollection };
