const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://3c90b9cd9e6d426ac7d9848f2bb110fa@o4511141177655296.ingest.us.sentry.io/4511746096234496",
  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});
