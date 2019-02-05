const cron = require('node-cron');

//              # ┌────────────── second (optional)
//              # │ ┌──────────── minute
//              # │ │ ┌────────── hour
//              # │ │ │ ┌──────── day of month
//              # │ │ │ │ ┌────── month
//              # │ │ │ │ │ ┌──── day of week
//              # │ │ │ │ │ │
//              # │ │ │ │ │ │
//              # * * * * * *
const schedule = '*/1 * * * *'

cron.schedule(schedule, () => {
  console.log('5');
});