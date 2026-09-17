const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const counters = document.querySelectorAll('[data-counter]');
counters.forEach((counter) => {
  const target = Number(counter.dataset.counter);
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      counter.textContent = target;
      clearInterval(timer);
      return;
    }
    counter.textContent = Math.round(current);
  }, 20);
});

const candidateData = [
  {
    name: 'Amina Yusuf',
    role: 'UI/UX Designer',
    category: 'Design',
    experience: '4 years',
    location: 'Lagos',
    whatsapp: '08031234567',
    summary: 'Creates user-friendly interfaces and brand-focused product designs for startups.',
    skills: ['Figma', 'UX Research', 'Branding'],
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Daniel Okafor',
    role: 'Frontend Developer',
    category: 'Tech',
    experience: '3 years',
    location: 'Abuja',
    whatsapp: '08055567890',
    summary: 'Builds responsive business dashboards and landing pages for growing companies.',
    skills: ['React', 'JavaScript', 'CSS'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Blessing Eze',
    role: 'Sales Executive',
    category: 'Sales',
    experience: '5 years',
    location: 'Port Harcourt',
    whatsapp: '08076544321',
    summary: 'Strong in B2B sales, lead generation, and converting interest into customer retention.',
    skills: ['CRM', 'Negotiation', 'Outbound Sales'],
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Ifeanyi Martins',
    role: 'Operations Coordinator',
    category: 'Operations',
    experience: '6 years',
    location: 'Ibadan',
    whatsapp: '08021987654',
    summary: 'Keeps operations moving with coordination, reporting, and process improvement.',
    skills: ['Operations', 'Process Flow', 'Planning'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Grace Adeyemi',
    role: 'Content Strategist',
    category: 'Design',
    experience: '2 years',
    location: 'Kano',
    whatsapp: '08099887766',
    summary: 'Plans content that connects local brands with wider audiences and stronger customer engagement.',
    skills: ['Copywriting', 'Content', 'Strategy'],
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Tobi Akin',
    role: 'Customer Support Lead',
    category: 'Operations',
    experience: '4 years',
    location: 'Enugu',
    whatsapp: '08033445566',
    summary: 'Helps customers feel supported and connected through sharp service and clear communication.',
    skills: ['Support', 'Customer Care', 'Communication'],
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80'
  }
];

const candidateGrid = document.getElementById('candidateGrid');
const statusText = document.getElementById('authStatus');

function renderCandidates(filter = 'All') {
  if (!candidateGrid) return;

  const filtered = filter === 'All'
    ? candidateData
    : candidateData.filter((candidate) => candidate.category === filter);

  candidateGrid.innerHTML = filtered.map((candidate) => `
    <article class="service-card reveal">
      <img src="${candidate.image}" alt="${candidate.name} profile" />
      <div class="card-body">
        <div class="meta-row">
          <span class="pill ${candidate.category === 'Design' ? 'design' : candidate.category === 'Tech' ? 'tech' : 'home'}">${candidate.category}</span>
          <span class="rating">${candidate.experience}</span>
        </div>
        <h3>${candidate.name}</h3>
        <div class="candidate-meta">${candidate.role} • ${candidate.location}</div>
        <p>${candidate.summary}</p>
        <div class="candidate-skills">
          ${candidate.skills.map((skill) => `<span class="profile-pill">${skill}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="card-btn" type="button">Shortlist</button>
          <a class="secondary-link" href="https://wa.me/${candidate.whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
      </div>
    </article>
  `).join('');

  const revealItems = document.querySelectorAll('.reveal');
  revealItems.forEach((item) => item.classList.remove('visible'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
}

const chips = document.querySelectorAll('.chip');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((item) => item.classList.remove('active'));
    chip.classList.add('active');
    renderCandidates(chip.dataset.filter || 'All');
  });
});

const authTabs = document.querySelectorAll('.auth-tab');
const authPanels = document.querySelectorAll('.auth-panel');
authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    authTabs.forEach((item) => item.classList.toggle('active', item === tab));
    authPanels.forEach((panel) => {
      const shouldShow = panel.id === `${tab.dataset.target}Panel`;
      panel.classList.toggle('active', shouldShow);
    });
  });
});

const employerLoginForm = document.getElementById('employerLoginForm');
if (employerLoginForm) {
  employerLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(employerLoginForm);
    const companyName = formData.get('companyName');
    const email = formData.get('email');
    if (statusText) {
      statusText.textContent = `Employer account ready: ${companyName} (${email}) is logged in.`;
    }
  });
}

const employeeLoginForm = document.getElementById('employeeLoginForm');
if (employeeLoginForm) {
  employeeLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(employeeLoginForm);
    const name = formData.get('name');
    const whatsapp = formData.get('whatsapp');
    if (statusText) {
      statusText.textContent = `Employee profile ready: ${name} can be reached on WhatsApp ${whatsapp}.`;
    }
  });
}

const candidateForm = document.getElementById('candidateForm');
if (candidateForm) {
  candidateForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(candidateForm);
    const newCandidate = {
      name: formData.get('name'),
      role: formData.get('role'),
      category: formData.get('category'),
      experience: formData.get('experience'),
      location: formData.get('location'),
      whatsapp: formData.get('whatsapp'),
      summary: formData.get('summary'),
      skills: ['Profile', 'Experience', 'Availability']
    };

    candidateData.unshift(newCandidate);
    renderCandidates();
    statusText.textContent = `Profile created for ${newCandidate.name}. Employers can contact you on WhatsApp ${newCandidate.whatsapp}.`;
    candidateForm.reset();
  });
}

renderCandidates();

const yearEl = document.querySelector('[data-year]');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
