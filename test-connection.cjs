const { PrismaClient } = require('@prisma/client');
const pc = new PrismaClient({
  datasources: { db: { url: 'postgresql://postgres:postgyus28@localhost:5433/student_commerce' } }
});
pc.$connect()
  .then(() => { console.log('Connected!'); return pc.$disconnect(); })
  .then(() => console.log('Disconnected'))
  .catch(e => console.log('Error:', e.message));
