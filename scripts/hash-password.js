const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the password to hash: ', (password) => {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('Error generating salt:', err);
      rl.close();
      return;
    }
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        rl.close();
        return;
      }
      console.log('Hashed password:', hash);
      rl.close();
    });
  });
});
