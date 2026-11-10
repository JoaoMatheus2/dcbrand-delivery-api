// admin-api/src/jobs/scheduledTasks.js

const cron = require('node-cron');
const emailService = require('../services/emailService');

// Enviar relatório diário às 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('📊 Executando relatório diário às 9:00 AM...');
  await emailService.sendDailySalesReport();
});

console.log('✅ Jobs agendados: Relatório diário em 09:00');

module.exports = {};