import bcrypt from 'bcrypt';

const hash = await bcrypt.hash('test', 10);
console.log(hash);