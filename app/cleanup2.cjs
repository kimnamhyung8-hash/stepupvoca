const fs = require('fs');
let code = fs.readFileSync('src/screens/CommunityForumScreen.tsx', 'utf-8');

// remove lines containing expandedGroups and toggleGroup definitions
const lines = code.split('\n');
const newLines = [];
let skipMode = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [expandedGroups, setExpandedGroups] = useState')) {
     continue;
  }
  if (lines[i].includes('const toggleGroup = (groupId: string)') || lines[i].includes('const toggleGroup = (groupId)')) {
     skipMode = true;
     continue;
  }
  if (skipMode) {
     if (lines[i].trim() === '};' || lines[i].trim() === '}') {
        if (!lines[i-1].includes('return next;')) {
           skipMode = false;
        }
     }
     continue;
  }
  newLines.push(lines[i]);
}

fs.writeFileSync('src/screens/CommunityForumScreen.tsx', newLines.join('\n'), 'utf-8');
console.log("Cleanup 2 done!");
