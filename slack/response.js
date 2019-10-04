class Response {
    constructor() {
        // Survey Question time tracking
        this.questionTimes = {};
        this.answers = {};

        this.isResponseSubmitted = false;

        // timer to track question time
        this.questionStartTime = null;
    }

    getResponses() {
        const {
            mood, team, company, individual, onWhatTeam,
        } = this;

        return {
            mood, team, company, individual, onWhatTeam,
        };
    }

    isSubmitted() {
        return this.isResponseSubmitted;
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
