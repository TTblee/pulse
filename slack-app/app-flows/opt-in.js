const slackApp = require('../slack-app');
const DatabaseClientSingleton = require('../database-client');
const { OptInWhatTeamQuestion } = require('../components/messages');
const { OPT_IN_WHAT_TEAM_ACTION_ID } = require('../components/actions');

slackApp.message('opt-in', async ({ say, payload: { user } }) => {
    const question = new OptInWhatTeamQuestion();
    const databaseClient = DatabaseClientSingleton.getDatabaseClient();

    const userSlackId = user;
    const isUserOptedIn = await databaseClient.isUserOptedIn(userSlackId);

    if (isUserOptedIn) {
        say('You are already opted into the survey!');
        return;
    }

    await say(question.getMessage());
});

slackApp.action({ action_id: OPT_IN_WHAT_TEAM_ACTION_ID }, async ({
    say, payload, ack, body,
}) => {
    ack();
    const slackId = body.user.id;
    const team = payload.selected_option.value;

    const databaseClient = DatabaseClientSingleton.getDatabaseClient();

    await databaseClient.addUser({
        slackId, team,
    });

    say('You have opted into the Pulse survey!');
});
