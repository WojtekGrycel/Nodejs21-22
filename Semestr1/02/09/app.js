// node app.js --name=Jan --lastName=Kochanowski
// rezultat w konsoli:
// wcześniej zapisany użytkownik Adam

const fs = require('fs');
const argv = require('yargs').argv;

const user = {
    name: argv.name,
    lastName: argv.lastName
};

const userData = JSON.stringify(user);

let data = fs.readFileSync('user.json', 'utf-8');
const userFromFile = JSON.parse(data);
console.log('wcześniej zapisany użytkownik', userFromFile.name);

fs.writeFileSync('user.json', userData);
