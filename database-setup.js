const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect();
client.query('CREATE SCHEMA IF NOT EXISTS survey;', (err) => {
    client.query('CREATE TABLE survey.responses(id serial PRIMARY KEY, which_team VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, mood varchar(255), company varchar(255), team varchar(255), individual varchar(255), total_survey_time float8, which_team_time float8, mood_time float8, company_time float8, team_time float8, individual_time float8);', (err, res) => {
        if (err) throw err;
        client.end();
    });
});
