/*
 * system.ts
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

import { getenv } from './environment';
import * as log from './log';
import { LogOptions } from './log-options';

export function initHook() {
  if (process.platform !== 'win32' ) {
    return;
  }

  // TODO: Windows implementation from Win32System.cpp
}

// logger's program identity (this process's binary name)
export let s_programIdentity = "";

// logging options representing the latest state of the logging configuration file
export let s_logOptions: LogOptions;

function initLog() {
  // requires prior synchronization

  Error error = s_logOptions.read();
  if (error)
    return error;

  initializeLogWriters();

  return Success();
}

export function initializeLog(
  programIdentity: string,
  logLevel: log.LogLevel,
  logDir: string,
  enableConfigReload = true
) {
  // create default file logger options
  const options = new log.FileLogOptions(logDir);

  s_logOptions = new LogOptions(programIdentity, logLevel, log.LoggerType.kFile, options);
  s_programIdentity = programIdentity;

  Error error = initLog();
  if (error)
    return error;

  if (enableConfigReload)
    initializeLogConfigReload();

return Success();
}

export function userHomePath(envOverride?: string) {
  return "TODO";
}

export function username() {
  const userVar = process.platform === 'win32' ? 'USERNAME' : 'USER';
  return getenv(userVar);
}