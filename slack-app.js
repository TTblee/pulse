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

    // TODO uncomment this after make week
    // if (responseCollection.hasResponse(userId)) {
    //     const response = responseCollection.getResponse(userId);
    //     if (response.isSubmitted()) {
    //         say(startSurvey.getSurveyAlreadyTakenMessage());
    //         return;
    //     }
    //     say(startSurvey.getSurveyAlreadyStartedMessage());
    //     return;
    // }

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
    const userId = body.user.id;
    await deletePreviousSurveyQuestion(body.container.message_ts, body.channel.id);
    setSurveyAnswer(userId, Response.START_SURVEY, 'value_does_not_matter');
    const whatTeamQuestion = new WhatTeamQuestion();
    await sendSurveyQuestion(userId, whatTeamQuestion, say);
});

slackApp.action({ action_id: WhatTeamQuestion.GetSurveyAction() }, async ({ ack, say, body }) => {
    ack();
    const userId = body.user.id;
    // Note: only uses body.original_message when it is a callback_id action
    setSurveyAnswer(userId, Response.WHAT_TEAM, body.actions[0].selected_option.value);

    await deletePreviousSurveyQuestion(body.message.ts, body.channel.id);

    const moodQuestion = new MoodQuestion();
    await sendSurveyQuestion(userId, moodQuestion, say);
});

slackApp.action({ callback_id: MoodQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.MOOD, body.actions[0].value);

    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    const companyQuestion = new CompanyQuestion();
    await sendSurveyQuestion(userId, companyQuestion, say);
});

slackApp.action({ callback_id: CompanyQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.COMPANY, body.actions[0].value);

    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    const teamQuestion = new TeamQuestion();
    await sendSurveyQuestion(userId, teamQuestion, say);
});

slackApp.action({ callback_id: TeamQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.TEAM, body.actions[0].value);

    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    const individualQuestion = new IndividualQuestion();
    await sendSurveyQuestion(userId, individualQuestion, say);
});

slackApp.action({ callback_id: IndividualQuestion.GetSurveyAction() }, async ({
    ack, say, body,
}) => {
    ack();
    const userId = body.user.id;
    setSurveyAnswer(userId, Response.INDIVIDUAL, body.actions[0].value);

    await deletePreviousSurveyQuestion(body.original_message.ts, body.channel.id);

    await say('You’ve finished the survey! :tada:');

    const userResponse = responseCollection.getResponse(userId);
    const submission = userResponse.submit();
    if (submission) {
        await say({
            blocks: [{
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `Your response has been saved!\nHere’s the data that we saved from you:\`\`\`\n\n${JSON.stringify(userResponse)}\`\`\``,
                },
                accessory: {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Delete this message',
                    },
                    style: 'danger',
                    action_id: 'delete_message',
                    value: 'delete',
                },
            }],
        });
    }
});

slackApp.action('delete_message', async ({ body, ack }) => {
    ack();
    await deletePreviousSurveyQuestion(body.container.message_ts, body.channel.id);
});

(async () => {
    await slackApp.start(process.env.PORT || 3000);

    // eslint-disable-next-line no-console
    console.log('⚡️ Bolt app is running!');
})();
