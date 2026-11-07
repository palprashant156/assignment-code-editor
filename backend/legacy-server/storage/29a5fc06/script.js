// Alex Rivera's Portfolio - Interactive Logic
console.log("Welcome to Alex Rivera's Portfolio!");
console.log("Try modifying this file in CodeCraft Studio to see live changes.");

// Interactive Theme / Particle Surprise Button
const surpriseBtn = document.getElementById('theme-btn');
let clickCount = 0;

if (surpriseBtn) {
  surpriseBtn.addEventListener('click', () => {
    clickCount++;
    console.log("Surprise button clicked! Count:", clickCount);
    
    // Playful background cycle
    const colors = [
      'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)',
      'linear-gradient(135deg, #052e16 0%, #0b0f19 100%)',
      'linear-gradient(135deg, #31103f 0%, #0b0f19 100%)',
      '#0b0f19'
    ];
    document.body.style.background = colors[clickCount % colors.length];
    
    surpriseBtn.innerHTML = '<i class="fas fa-check"></i> Theme Activated #' + clickCount;
  });
}

// Live demo card notification
function openDemo(name) {
  console.log("Demo opened:", name);
  alert("Launching live preview for " + name + " project!");
}

// Contact form handling with validation
const contactForm = document.getElementById('contact-form');
const statusMsg = document.getElementById('status-msg');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    console.log("Form submitted with:", { name, email });
    
    statusMsg.className = 'status-msg success';
    statusMsg.innerText = "Thank you, " + name + "! Your message has been received.";
    contactForm.reset();
  });
}