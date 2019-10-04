const express = require('express');
const path = require('path');
require('dotenv');

const webApp = express();

webApp.use(express.static(path.join(__dirname, 'build')));
// Parse URL-encoded bodies (as sent by HTML forms)
webApp.use(express.urlencoded());
// Parse JSON bodies (as sent by API clients)
webApp.use(express.json());

webApp.use('/send-survey', (req, res) => {
    // Check password field coming from FE
    function sendResponse(isPasswordCorrect) {
        res.status(200).json({
            isPasswordCorrect,
        });
    }
    const enteredPassword = req.body.password;
    if (enteredPassword === process.env.LOGIN_PASSWORD) {
        sendResponse(true);
        return;
    }
    sendResponse(false);
});

webApp.all('*', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'build', 'index.html'));
});
(async () => {
    await webApp.listen(8080);

    // eslint-disable-next-line no-console
    console.log('WebApp listening to 8080');
})();
