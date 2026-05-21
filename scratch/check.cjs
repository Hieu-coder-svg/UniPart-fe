const fs = require('fs');
const code = fs.readFileSync('src/app/pages/employer/EmployerApplicants.tsx', 'utf8');

const stack = [];
const lines = code.split('\n');
let inString = false;
let stringChar = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (inString) {
      if (char === stringChar && line[j-1] !== '\\') inString = false;
    } else {
      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
      } else if (char === '{') {
        stack.push({ line: i + 1, char: '{' });
      } else if (char === '}') {
        if (stack.length && stack[stack.length - 1].char === '{') stack.pop();
        else stack.push({ line: i + 1, char: '}' });
      } else if (char === '(') {
        stack.push({ line: i + 1, char: '(' });
      } else if (char === ')') {
        if (stack.length && stack[stack.length - 1].char === '(') stack.pop();
        else stack.push({ line: i + 1, char: ')' });
      }
    }
  }
}
console.log(stack.slice(-10));
