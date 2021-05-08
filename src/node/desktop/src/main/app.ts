/*
 * app.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

const { app } = require('electron');
const DesktopInfo = require('./desktop-info');
const Main = require('./main');

// Where it all begins
app.whenReady().then(() => {

  globalThis.rstudioGlobal = {
    desktopInfo: new DesktopInfo()
  };

  new Main().run();
});

app.on('window-all-closed', () => {
  // Mac apps generally don't close when you close the last window, but RStudio does
  // if (process.platform !== 'darwin') {
    app.quit();
  // }
});