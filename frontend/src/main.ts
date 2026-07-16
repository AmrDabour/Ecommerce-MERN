import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from "@sentry/angular";
import { appConfig } from './app/app.config';
import { App } from './app/app';

Sentry.init({
  dsn: "https://1280a88bd16d84cad0400907b9fa38e6@o4511141177655296.ingest.us.sentry.io/4511745905655808",
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
