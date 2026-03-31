// Script to compile Ink story to JavaScript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const inklecateBin = path.join(__dirname, 'node_modules/inklecate/bin/inklecate');

const stories = [
  { ink: 'public/ink/72Hours.ink',    js: 'public/ink/72Hours.js',    varName: 'storyContent' },
  { ink: 'public/ink/72Hours_et.ink', js: 'public/ink/72Hours_et.js', varName: 'storyContentET' },
];

for (const { ink, js, varName } of stories) {
  const inkFile = path.join(__dirname, ink);
  const jsonOutputFile = inkFile.replace(/\.ink$/, '.json');
  const jsOutputFile = path.join(__dirname, js);

  if (!fs.existsSync(inkFile)) {
    console.log(`Skipping ${ink} (file not found)`);
    continue;
  }

  try {
    execSync(`"${inklecateBin}" -o "${jsonOutputFile}" "${inkFile}"`, {
      encoding: 'utf8',
      cwd: __dirname
    });

    let jsonContent = fs.readFileSync(jsonOutputFile, 'utf8');
    if (jsonContent.charCodeAt(0) === 0xFEFF) {
      jsonContent = jsonContent.slice(1);
    }
    const jsContent = 'var ' + varName + ' = ' + jsonContent + ';';
    fs.writeFileSync(jsOutputFile, jsContent);

    fs.unlinkSync(jsonOutputFile);

    console.log(`Successfully compiled ${ink} to ${js}`);
  } catch (error) {
    console.error(`Error compiling ${ink}:`, error.message);
    process.exit(1);
  }
}
