const fs = require('fs');

const envFile = './.env';
const envFileTemplate = './.env.example';
if (!fs.existsSync(envFile)) {
    // destination will be created or overwritten by default.
    fs.copyFile(envFileTemplate, envFile, (err) => {
        if (err) throw err;
        console.log('Env file has been created from template');
    });
}