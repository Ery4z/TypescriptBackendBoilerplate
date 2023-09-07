import { generateToken } from './jwt.js'; // Replace with the actual path to your file
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please enter a name: ', (name) => {
    const user = {
        _id: null, // No _id provided since it's not given in this context
        userName: name
    };
    
    try {
        const token = generateToken(user);
        console.log(`Generated JWT: ${token}`);
    } catch (err) {
        console.error(`Error generating token: ${err.message}`);
    }
    
    rl.close();
});