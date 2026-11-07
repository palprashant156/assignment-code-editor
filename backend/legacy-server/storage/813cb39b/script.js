// Student Starter JavaScript
console.log("Playground initialized!");

let count = 0;
const countSpan = document.getElementById('count');
const counterBtn = document.getElementById('counter-btn');
const colorBtn = document.getElementById('color-btn');

counterBtn.addEventListener('click', () => {
  count++;
  countSpan.textContent = count;
  console.log("Count is now:", count);
});

colorBtn.addEventListener('click', () => {
  const hues = [210, 160, 280, 340, 45, 12];
  const randomHue = hues[Math.floor(Math.random() * hues.length)];
  document.body.style.backgroundColor = `hsl(${randomHue}, 40%, 12%)`;
  console.log("Background updated to hue:", randomHue);
});