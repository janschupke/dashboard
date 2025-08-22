const readline = require('readline');

const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the password you want to hash: ', async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('\nHashed password for PASSWORD environment variable:');
    console.log(hashedPassword);
    console.log('\nAdd this to your .env file:');
    console.log(`PASSWORD=${hashedPassword}`);
    console.log('\nAlso add a JWT secret:');
    console.log('JWT_SECRET=your-secret-key-here');

    rl.close();
  } catch (error) {
    console.error('Error hashing password:', error);
    rl.close();
  }
});
