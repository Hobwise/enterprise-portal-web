import fs from 'fs';
const data = fs.readFileSync('app/api/controllers/dashboard/qrPayment.tsx', 'utf-8');
console.log(data.includes('bankCode'));
