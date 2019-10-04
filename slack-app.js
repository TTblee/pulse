const { App } = require('@slack/bolt');
const { Response, ResponseCollection } = require('./slack/response');
const {
    StartSurvey, MoodQuestion, WhatTeamQuestion, CompanyQuestion, TeamQuestion, IndividualQuestion,
} = require('./slack/messages');
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// UserId: Response object
const responseCollection = new ResponseCollection();
const ensureSurveyAnswerExists = (userId) => {
    if (!responseCollection.getResponse(userId)) {
        responseCollection.initializeResponse(userId);
    }
};

const sendSurveyQuestion = async (userId, question, say) => {
    // say the message in slack
    await say(question.getMessage());
    // get user response
    const userResponse = responseCollection.getResponse(userId);
    // start response timer
    userResponse.startResponseTimeForQuestion(question.getId());
};

const setSurveyAnswer = (userId, questionKey, answer) => {
    ensureSurveyAnswerExists(userId);
    const userResponse = responseCollection.getResponse(userId);
    userResponse.submitResponseForQuestion(questionKey, answer);
};

const deletePreviousSurveyQuestion = async (timestamp, channelId) => {
    try {
        await slackApp.client.chat.delete({
            ts: timestamp,
            channel: channelId,
            // USE SLACK BOT TOKEN TO DELETE THE MESSAGE
            token: process.env.SLACK_BOT_TOKEN,
        });
    } catch (error) {
        console.log(error);
    }
};

slackApp.message('hello', async ({ message, say }) => {
    const userId = message.user;

    const startSurvey = new StartSurvey(userId);
    // Handle cases where user has already started a survey, or has already taken it.
    if (responseCollection.hasResponse(userId)) {
        const response = responseCollection.getResponse(userId);
        if (response.isSubmitted()) {
            say(startSurvey.getSurveyAlreadyTakenMessage());
            return;
        }
        say(startSurvey.getSurveyAlreadyStartedMessage());
        return;
    }

    ensureSurveyAnswerExists(userId);
    await say(startSurvey.getEntryMessage());
    setTimeout(async () => {
        await sendSurveyQuestion(userId, startSurvey, say);
    }, 300);
});

slackApp.action(StartSurvey.GetSurveyAction(), async ({
    ack, say, body,
}) => {
    ack();
    await deletePreviousSurveyQuestion(body.container.message_ts, body.channel.id);
    const whatTeamQuestion = new WhatTeamQuestion();
    say(whatTeamQuestion.getMessage());
});

slackApp.action({ action_id: WhatTeamQuestion.GetSurveyAction() }, async ({ ack, say, body }) => {
    ack();
    const userId = body.user.id;
    // Note: only uses body.original_message when it is a callback_id action
    setSurveyAnswer(userId, Response.WHAT_TEAM, body.actions[0].selected_option.value);
    await deletePreviousSurveyQuestion(body.message.ts, body.channel.id);
    const moodQuestion = new MoodQuestion();
    say(moodQuestion.getMessage());
});

slackApp.action({ callback_id: MoodQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.MOOD, body.actions[0].value);
    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);
    const companyQuestion = new CompanyQuestion();
    say(companyQuestion.getMessage());
});

slackApp.action({ callback_id: CompanyQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.COMPANY, body.actions[0].value);
    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    const teamQuestion = new TeamQuestion();
    say(teamQuestion.getMessage());
});

slackApp.action({ callback_id: TeamQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.TEAM, body.actions[0].value);
    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    const individualQuestion = new IndividualQuestion();
    say(individualQuestion.getMessage());
});

slackApp.action({ callback_id: IndividualQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.TEAM, body.actions[0].value);
    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    console.log(responseCollection.getResponse(userId));
    say('You’ve finished the survey!');
});


(async () => {
    await slackApp.start(process.env.PORT || 3000);

    // eslint-disable-next-line no-console
    console.log('⚡️ Bolt app is running!');
})();
