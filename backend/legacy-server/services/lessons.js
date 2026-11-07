// server/services/lessons.js
// Interactive Curriculum and automated code test runner for students

const lessons = [
  {
    id: 'lesson-1',
    title: 'Level 1: Semantic HTML & Hero Layout',
    description: 'Learn how to structure a clean, modern landing page using semantic HTML5 tags.',
    difficulty: 'Beginner',
    tasks: [
      {
        id: 'task-1-1',
        title: 'Include an <h1> Heading',
        instruction: 'Add an <h1> tag inside your HTML body with your website or project title.',
        test: (html, css, js) => /<h1[^>]*>[\s\S]*?<\/h1>/i.test(html),
        hint: 'Example: <h1>Welcome to My Awesome Website</h1>'
      },
      {
        id: 'task-1-2',
        title: 'Create a Navigation Bar',
        instruction: 'Use a <nav> or <header> element containing at least two links (<a href="...">).',
        test: (html, css, js) => /(<nav|<header)[\s\S]*?<a[\s\S]*?<a/i.test(html),
        hint: 'Wrap your links inside a <nav> tag: <nav><a href="#about">About</a><a href="#projects">Projects</a></nav>'
      },
      {
        id: 'task-1-3',
        title: 'Add a Call-to-Action Button',
        instruction: 'Include an interactive <button> with an id (e.g., id="action-btn" or id="theme-btn").',
        test: (html, css, js) => /<button[^>]*id=["'][^"']+["'][^>]*>[\s\S]*?<\/button>/i.test(html),
        hint: 'Add an id attribute: <button id="my-btn">Click Me</button>'
      }
    ]
  },
  {
    id: 'lesson-2',
    title: 'Level 2: Modern CSS & Flexbox Magic',
    description: 'Style your page with modern CSS variables, flexbox alignment, and smooth hover effects.',
    difficulty: 'Intermediate',
    tasks: [
      {
        id: 'task-2-1',
        title: 'Define CSS Custom Properties (Variables)',
        instruction: 'Define at least one CSS variable inside :root in style.css (e.g., --accent-color or --bg-color).',
        test: (html, css, js) => /:root\s*\{[^}]*--[a-zA-Z0-9_-]+\s*:/i.test(css),
        hint: 'Add this to style.css: :root { --accent-color: #00d2ff; }'
      },
      {
        id: 'task-2-2',
        title: 'Use Flexbox or Grid Layout',
        instruction: 'Apply display: flex or display: grid in your CSS rules to create a responsive container.',
        test: (html, css, js) => /display\s*:\s*(flex|grid)/i.test(css),
        hint: 'Use .container { display: flex; justify-content: center; }'
      },
      {
        id: 'task-2-3',
        title: 'Add a Hover Effect with Transition',
        instruction: 'Use a :hover pseudo-class selector combined with transition or transform for smooth interaction.',
        test: (html, css, js) => /:hover\b[\s\S]*?(transform|background|color|box-shadow|opacity)/i.test(css),
        hint: 'button:hover { transform: translateY(-2px); transition: 0.2s; }'
      }
    ]
  },
  {
    id: 'lesson-3',
    title: 'Level 3: Dynamic JavaScript Interactivity',
    description: 'Bring your website to life by listening to user events and updating the DOM dynamically.',
    difficulty: 'Intermediate',
    tasks: [
      {
        id: 'task-3-1',
        title: 'Select a DOM Element',
        instruction: 'Use document.getElementById() or document.querySelector() in your script.js.',
        test: (html, css, js) => /document\.(getElementById|querySelector|querySelectorAll)\s*\(/i.test(js),
        hint: 'const btn = document.getElementById("my-btn");'
      },
      {
        id: 'task-3-2',
        title: 'Attach an Event Listener',
        instruction: 'Attach an event listener (such as "click" or "keydown") with addEventListener().',
        test: (html, css, js) => /\.addEventListener\s*\(\s*["'](click|keydown|keyup|input|submit|mouseover)["']/i.test(js),
        hint: 'btn.addEventListener("click", () => { ... });'
      },
      {
        id: 'task-3-3',
        title: 'Log Output to the Console',
        instruction: 'Print an informative status or debug message using console.log().',
        test: (html, css, js) => /console\.(log|info|warn|error)\s*\(/i.test(js),
        hint: 'console.log("Button was clicked successfully!");'
      }
    ]
  }
];

function verifyLesson(lessonId, html = '', css = '', js = '') {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const results = lesson.tasks.map(task => {
    let passed = false;
    let error = null;
    try {
      passed = task.test(html, css, js);
    } catch (err) {
      error = err.message;
    }
    return {
      taskId: task.id,
      title: task.title,
      instruction: task.instruction,
      hint: task.hint,
      passed,
      error
    };
  });

  const totalPassed = results.filter(r => r.passed).length;
  const isComplete = totalPassed === lesson.tasks.length;

  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    totalTasks: lesson.tasks.length,
    passedCount: totalPassed,
    isComplete,
    results
  };
}

module.exports = {
  lessons,
  verifyLesson
};
