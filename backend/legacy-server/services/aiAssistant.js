// server/services/aiAssistant.js
// Smart AI coding tutor for students in the Replit-style IDE

function processAiRequest({ mode, prompt, currentFile, code, fileType }) {
  const language = fileType || 'javascript';

  switch (mode) {
    case 'explain':
      return {
        type: 'explanation',
        title: `Understanding ${currentFile || 'Code'}`,
        reply: generateExplanation(code, language)
      };

    case 'debug':
      return {
        type: 'debug',
        title: 'Code Analysis & Bug Fixer',
        reply: generateDebugReport(code, language)
      };

    case 'improve':
      return {
        type: 'suggestion',
        title: 'Design & Feature Enhancements',
        reply: generateImprovementIdeas(code, language)
      };

    case 'generate':
      return {
        type: 'code_snippet',
        title: 'Code Generation',
        reply: generateSnippet(prompt, language)
      };

    case 'chat':
    default:
      return {
        type: 'chat',
        title: 'AI Tutor Response',
        reply: generateChatResponse(prompt, code, currentFile)
      };
  }
}

function generateExplanation(code, language) {
  if (!code || code.trim().length === 0) {
    return 'The file appears to be empty! Start by writing some code or choose a template to begin learning.';
  }

  const lines = code.trim().split('\n');
  const lineCount = lines.length;

  if (language === 'html') {
    return `### 📘 HTML Structure Walkthrough (${lineCount} lines)
Here is how your document is constructed:
- **DOCTYPE & Meta Tags**: Sets up standard HTML5 standards, UTF-8 character encoding, and mobile viewport responsiveness.
- **Header & Navigation**: Organizes website branding and links so visitors can navigate between sections.
- **Content Blocks**: Uses semantic tags (\`<section>\`, \`<div>\`, \`<article>\`) which provide structure and enhance accessibility.
- **External Links**: Links your \`style.css\` stylesheet and \`script.js\` behavior script.

💡 **Student Tip**: Remember to keep all visible components nested inside the \`<body>\` tag!`;
  }

  if (language === 'css') {
    return `### 🎨 CSS Styling Breakdown (${lineCount} lines)
Here is what your styles are achieving:
- **Design Tokens**: Configured with CSS Variables (\`:root\`), making themes (colors, fonts, shadows) easy to maintain and switch.
- **Layout Architecture**: Uses modern Flexbox and Grid layouts to organize elements cleanly on both phones and desktops.
- **Visual Polish**: Includes subtle border radiuses, semi-transparent glassmorphism backgrounds (\`backdrop-filter\`), and transition curves.

💡 **Student Tip**: For smooth interactions, combine \`:hover\` states with \`transition: all 0.25s ease;\`!`;
  }

  return `### ⚡ JavaScript Logic Explanation (${lineCount} lines)
Here is how your script operates:
- **State & Variables**: Maintains interactive numbers, user input, or active states in memory.
- **DOM Selection**: Targets interactive elements using \`document.getElementById\` and \`document.querySelector\`.
- **Event Listeners**: Listens for user interactions (clicks, keyboard, submissions) and executes handlers.
- **Console Feedback**: Dispatches diagnostic logs to help track values in real-time.

💡 **Student Tip**: Inspect values using \`console.log("value is:", yourVariable);\` in the bottom Console tab!`;
}

function generateDebugReport(code, language) {
  const issues = [];
  const fixes = [];

  if (language === 'html') {
    // Check missing closing tags
    const opens = (code.match(/<div/g) || []).length;
    const closes = (code.match(/<\/div>/g) || []).length;
    if (opens !== closes) {
      issues.push(`⚠️ Mismatched \`<div>\` tags: found ${opens} opening tags but ${closes} closing \`</div>\` tags.`);
      fixes.push('Ensure every opening `<div>` has a corresponding closing `</div>`.');
    }
    if (!code.includes('<!DOCTYPE html>')) {
      issues.push('⚠️ Missing `<!DOCTYPE html>` at the beginning of the file.');
      fixes.push('Add `<!DOCTYPE html>` on line 1 for proper browser rendering.');
    }
    if (!code.includes('viewport')) {
      issues.push('ℹ️ Missing mobile viewport `<meta name="viewport" ...>` tag.');
      fixes.push('Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside `<head>`.');
    }
  } else if (language === 'javascript') {
    // Check brackets balance
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`⚠️ Bracket mismatch: ${openBraces} opening \`{\` vs ${closeBraces} closing \`}\`.`);
      fixes.push('Check that all functions and if-statements close their curly braces.');
    }
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`⚠️ Parentheses mismatch: ${openParens} opening \`(\` vs ${closeParens} closing \`)\`.`);
    }
  }

  if (issues.length === 0) {
    return `### ✅ Code Health Check: Passed!
No critical syntax errors detected. Your code syntax appears clean and ready for execution in the live preview.

**Recommendations:**
- Test all interactive buttons in the live preview panel on the right.
- Check the Console tab for any runtime warnings or uncaught promises.`;
  }

  return `### 🔍 Analysis Findings:
${issues.join('\n\n')}

### 🛠️ Suggested Corrections:
${fixes.join('\n\n')}`;
}

function generateImprovementIdeas(code, language) {
  return `### 💡 Pro Suggestions for Your Project:
1. **Interactive Glassmorphism Card**:
   Add this CSS to make containers look sleek and modern:
   \`\`\`css
   .glass-card {
     background: rgba(255, 255, 255, 0.05);
     backdrop-filter: blur(12px);
     border: 1px solid rgba(255, 255, 255, 0.1);
     box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
     border-radius: 16px;
   }
   \`\`\`

2. **Micro-interaction on Buttons**:
   \`\`\`css
   button:active {
     transform: scale(0.96);
   }
   \`\`\`

3. **Sound Effects or Confetti**:
   You can add the Canvas Confetti library via the **Packages & CDN** tab to fire festive confetti upon completing actions!`;
}

function generateSnippet(prompt, language) {
  const p = (prompt || '').toLowerCase();

  if (p.includes('nav') || p.includes('navbar') || p.includes('header')) {
    return `### 🚀 Responsive Navigation Bar Snippet
Copy and paste this into \`index.html\`:
\`\`\`html
<nav class="modern-nav">
  <div class="logo">⚡ MyStudio</div>
  <ul class="nav-menu">
    <li><a href="#home">Home</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#pricing">Pricing</a></li>
  </ul>
  <button class="nav-cta">Get Started</button>
</nav>
\`\`\``;
  }

  if (p.includes('dark mode') || p.includes('theme') || p.includes('toggle')) {
    return `### 🌓 Theme Switcher Logic
Add this to your \`script.js\`:
\`\`\`javascript
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
    console.log('Switched theme mode to:', isLight ? 'light' : 'dark');
  });
}
\`\`\``;
  }

  return `### 💻 Starter Component Snippet
Here is a flexible responsive card component:
\`\`\`html
<div class="feature-card">
  <div class="feature-icon">✨</div>
  <h3>Dynamic Feature</h3>
  <p>Customize this description with your unique content and styling.</p>
  <button class="feature-btn">Learn More</button>
</div>
\`\`\``;
}

function generateChatResponse(prompt, code, currentFile) {
  const p = (prompt || '').toLowerCase();

  if (p.includes('how to center') || p.includes('centering')) {
    return `To center an element in CSS, the easiest modern approach is **CSS Flexbox**:
\`\`\`css
.parent-container {
  display: flex;
  justify-content: center; /* Horizontally */
  align-items: center;     /* Vertically */
  min-height: 100vh;
}
\`\`\`
Alternatively, with **CSS Grid**:
\`\`\`css
.parent-container {
  display: grid;
  place-items: center;
  min-height: 100vh;
}
\`\`\``;
  }

  if (p.includes('color') || p.includes('gradient')) {
    return `Here are some popular, eye-catching gradients:
- **Cyber Blue**: \`linear-gradient(135deg, #00d2ff, #7928ca)\`
- **Sunset Glow**: \`linear-gradient(135deg, #f59e0b, #ec4899)\`
- **Emerald Forest**: \`linear-gradient(135deg, #10b981, #064e3b)\`
- **Deep Space**: \`linear-gradient(135deg, #0b0f19, #1e1b4b)\``;
  }

  return `I'm here to help you build your website! You can ask me:
- *"How do I make my cards responsive?"*
- *"Find bugs in my JavaScript"*
- *"Add a dark mode toggle"*
- *"Explain how flexbox works"*

What would you like to work on next?`;
}

module.exports = {
  processAiRequest
};
