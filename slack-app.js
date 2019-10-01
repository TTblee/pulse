const { App } = require('@slack/bolt');
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  await slackApp.start(process.env.PORT || 3000);

  // eslint-disable-next-line no-console
  console.log('⚡️ Bolt app is running!');
})();
