const { exec } = require('child_process');

const cwd = __dirname;

exec(`sh ${cwd}/setupScript.sh`, (error, stdout, stderr) => {
  console.log(stdout);
  console.log(stderr);
  if (error !== null) {
    console.log(`exec error: ${error}`);
  }
});
