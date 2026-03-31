const fs = require('fs');
let code = fs.readFileSync('src/screens/CommunityForumScreen.tsx', 'utf-8');

// Remove ChevronDown import
code = code.replace(/ChevronDown,\s*/g, '');
code = code.replace(/import {[^}]*ChevronDown[^}]*} from 'lucide-react';\n/g, (match) => {
   return match.replace(/ChevronDown,\s*/g, '').replace(/,\s*ChevronDown/g, '').replace(/ChevronDown/g, '');
});

// Remove unused state
code = code.replace(/const \[expandedGroups,\s*setExpandedGroups\] = useState<Set<string>>\(new Set\(\['MAIN_LOUNGE'\]\)\);\n/g, '');

// Remove toggleGroup function
code = code.replace(/const toggleGroup = [^{]*{\s*setExpandedGroups[^{]*{[^}]*}[^}]*}\);\n\s*};\n/g, '');
code = code.replace(/const toggleGroup = \(groupId: string\) => {\n    setExpandedGroups\(prev => {\n      const next = new Set\(prev\);\n      if \(next\.has\(groupId\)\) next\.delete\(groupId\);\n      else next\.add\(groupId\);\n      return next;\n    }\);\n  };\n/g, '');

fs.writeFileSync('src/screens/CommunityForumScreen.tsx', code, 'utf-8');
console.log("Cleanup done!");
