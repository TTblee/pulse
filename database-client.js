const { Client } = require('pg');
const { Response } = require('./slack-components/response');

class DatabaseClient {
    constructor() {
        this.client = process.env.NODE_ENV === 'production'
            ? new Client({
                connectionString: process.env.DATABASE_URL,
            })
            : new Client({
                host: 'localhost',
                database: 'pulse',
                port: 5432,
            });

        this.client.connect();

        this.surveyResponseTableName = 'survey.responses';
    }

    async writeResponse(response) {
        response.setSubmit();
        const { answers, questionTimes } = response;
        await this.client.query({
            text: `INSERT INTO ${this.surveyResponseTableName}(which_team, mood, company, team, individual, total_survey_time, which_team_time, mood_time, company_time, team_time, individual_time) 
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            values: [
                answers[Response.WHAT_TEAM],
                answers[Response.MOOD],
                answers[Response.COMPANY],
                answers[Response.TEAM],
                answers[Response.INDIVIDUAL],
                response.totalSurveyElapsedTime,
                questionTimes[Response.WHAT_TEAM],
                questionTimes[Response.MOOD],
                questionTimes[Response.COMPANY],
                questionTimes[Response.TEAM],
                questionTimes[Response.INDIVIDUAL],
            ],
        });
    }
}

module.exports = DatabaseClient;
