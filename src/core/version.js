// version.js — which version of the game and of its content made a record.
//
// Every event in the learning record carries both, so a future version can
// tell which stage names (and which rules) an old record was made with and
// migrate it (see migrations.js).
//   APP_VERSION      the game's code: raise it when the engine changes
//   CONTENT_VERSION  the date the courses/units/stages were last reorganised
//                    or renamed: change it whenever a stage id changes, and add
//                    the old → new ids to migrations.js at the same time.
export const APP_VERSION = "0.7.0";
export const CONTENT_VERSION = "2026-09-27";
