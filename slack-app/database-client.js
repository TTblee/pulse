const { Client } = require('pg');
const { Response } = require('./components/response');

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

        const { client } = this;

        client.query('CREATE SCHEMA IF NOT EXISTS survey;', (err) => {
            if (err) {
                throw err;
            }
            client.query('CREATE TABLE IF NOT EXISTS survey.responses(id serial PRIMARY KEY, which_team VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, mood varchar(255), company varchar(255), team varchar(255), individual varchar(255), total_survey_time float8, which_team_time float8, mood_time float8, company_time float8, team_time float8, individual_time float8);', (err, res) => {
                if (err) throw err;
            });
            client.query('CREATE TABLE IF NOT EXISTS users(slack_id VARCHAR(255) NOT NULL PRIMARY KEY, team VARCHAR(255) NOT NULL)');
        });

        this.surveyResponseTableName = 'survey.responses';
    }

    async performUserOptIn({ slackId, team }) {
        try {
            await this.client.query({
                text: 'INSERT INTO users(slack_id, team) VALUES($1, $2);',
                values: [slackId, team],
            });
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    async performUserOptOut(slackId) {
        try {
            await this.client.query({
                text: 'DELETE FROM users WHERE slack_id = $1',
                values: [slackId],
            });
            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    async isUserOptedIn(slackId) {
        try {
            const result = await this.client.query({
                text: 'SELECT slack_id FROM users WHERE slack_id = $1;',
                values: [slackId],
            });
            const doesUserExist = result.rowCount > 0;
            if (doesUserExist) {
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(error);
        }
    }

    async writeResponse(response) {
        response.setSubmit();
        const { answers, questionTimes } = response;
        await this.client.query({
            text: `INSERT INTO ${this.surveyResponseTableName}(
                which_team, 
                mood, 
                company, 
                team, 
                individual, 
                total_survey_time, 
                which_team_time, 
                mood_time, 
                company_time, 
                team_time, 
                individual_time
                ) 
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

class DatabaseClientSingleton {
    constructor() {
        this.databaseClient = null;
    }

    static getDatabaseClient() {
        if (!this.databaseClient) {
            this.databaseClient = new DatabaseClient();
        }
        return this.databaseClient;
    }
}


module.exports = DatabaseClientSingleton;
