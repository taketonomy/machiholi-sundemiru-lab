'use strict';
/* Vercel Node function: POST /api/owner-draft {city, text}. Logic in server/owner-draft.cjs. */
module.exports=require('../server/owner-draft.cjs').createHandler();
