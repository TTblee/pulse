const express = require('express');

const webApp = express();
webApp.use(express.static(`${__dirname}/public`));

(async () => {
  await webApp.listen(3001);

  // eslint-disable-next-line no-console
  console.log('WebApp listening to 3001');
})();
