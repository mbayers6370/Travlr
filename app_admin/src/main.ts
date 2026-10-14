import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chevronBackOutline,
  chevronDownOutline,
  closeOutline,
  createOutline,
  mailOutline,
  mapOutline,
  openOutline,
  searchOutline,
  statsChartOutline,
  trashOutline
} from 'ionicons/icons';
import { defineCustomElements } from 'ionicons/loader';
import { appConfig } from './app/app.config';
import { App } from './app/app';

addIcons({
  addOutline,
  chevronBackOutline,
  chevronDownOutline,
  closeOutline,
  createOutline,
  mailOutline,
  mapOutline,
  openOutline,
  searchOutline,
  statsChartOutline,
  trashOutline
});
defineCustomElements();

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
