const STORAGE_KEYS = {
  theme: 'logix-theme',
  name: 'logix-name',
  phone: 'logix-phone',
  email: 'logix-email',
  aadhaar: 'logix-aadhaar',
  role: 'logix-role',
  city: 'logix-city',
  token: 'logix-token',
  gstin: 'logix-gstin'
};

const API_BASE = "http://localhost:8000";

const CITY_OPTIONS = [
  'Delhi NCR',
  'Bengaluru',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Chennai'
];

const appState = {
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
  name: localStorage.getItem(STORAGE_KEYS.name) || '',
  phone: localStorage.getItem(STORAGE_KEYS.phone) || '',
  email: localStorage.getItem(STORAGE_KEYS.email) || '',
  aadhaar: localStorage.getItem(STORAGE_KEYS.aadhaar) || '',
  role: localStorage.getItem(STORAGE_KEYS.role) || '',
  city: localStorage.getItem(STORAGE_KEYS.city) || 'Pune',
  token: localStorage.getItem(STORAGE_KEYS.token) || '',
  gstin: localStorage.getItem(STORAGE_KEYS.gstin) || ''
};

let selectedSkill = '';
let currentView = '';
const viewHistory = [];
const skillOptions = [
  'Warehouse Management', 'Inventory Management', 'Supply Chain Management',
  'Route Planning', 'Fleet Management', 'Cold Chain', 'Cargo Handling',
  'Logistics Analytics', 'Data Analytics', 'Digital Documentation', 'WMS',
  'Procurement', 'Transportation Management', 'Excel', 'SQL',
  'AI for Logistics', 'Supply Chain Analytics'
];
const logiskyConfig = { mode: 'mock', endpoint: '/api/logisky' };

const jobData = [
  {
    title: 'Warehouse Associate',
    company: 'UrbanCore Logistics',
    city: 'Pune',
    category: 'Warehouse',
    experience: '1-3 years',
    employment: 'Full time',
    skills: ['WMS', 'Inventory', 'Documentation'],
    match: 94,
    summary: 'Support receiving, dispatch and inventory control for multi-client warehouse operations.',
    responsibilities: [
      'Track inbound and outbound movements with WMS workflows.',
      'Verify storage conditions and inventory accuracy.',
      'Coordinate with dispatch and digital documentation teams.'
    ],
    requirements: [
      'Warehouse operations exposure preferred.',
      'Comfort with digital documentation and barcode scans.',
      'Strong coordination and safety awareness.'
    ]
  },
  {
    title: 'Fleet Operations Executive',
    company: 'MetroRoute Mobility',
    city: 'Mumbai',
    category: 'Fleet',
    experience: '3-5 years',
    employment: 'Full time',
    skills: ['Fleet Management', 'Route Planning', 'Safety'],
    match: 88,
    summary: 'Coordinate fleet performance, vehicle readiness and route optimisation.',
    responsibilities: [
      'Monitor route adherence and fuel performance.',
      'Coordinate maintenance and dispatch scheduling.',
      'Support field teams with daily route adjustments.'
    ],
    requirements: [
      'Fleet operations experience in metro movement environments.',
      'Route planning and dispatch management capability.',
      'Good communication with maintenance and operations teams.'
    ]
  },
  {
    title: 'Inventory Coordinator',
    company: 'Northbridge Supply',
    city: 'Delhi NCR',
    category: 'Inventory',
    experience: '1-3 years',
    employment: 'Full time',
    skills: ['Inventory', 'WMS', 'Documentation'],
    match: 81,
    summary: 'Track stock movement and reconcile WMS data for multi-site inventory control.',
    responsibilities: [
      'Monitor inventory buffers and stock turns.',
      'Resolve mismatches in system and physical stock.',
      'Support warehouse reporting and cycle counts.'
    ],
    requirements: [
      'Working knowledge of inventory management systems.',
      'Strong accuracy and documentation discipline.',
      'Ability to coordinate with warehouse teams.'
    ]
  },
  {
    title: 'Cargo Operations Executive',
    company: 'CargoPulse India',
    city: 'Hyderabad',
    category: 'Logistics',
    experience: '1-3 years',
    employment: 'Contract',
    skills: ['Cargo Handling', 'WMS', 'Route Planning'],
    match: 86,
    summary: 'Manage cargo flow, handoff and logistics coordination for freight operations.',
    responsibilities: [
      'Coordinate cargo dispatch and receipt timings.',
      'Track load conditions and handling readiness.',
      'Support cross-functional movement planning.'
    ],
    requirements: [
      'Cargo handling or freight dispatch experience.',
      'Ability to work in fast-moving logistics operations.',
      'Comfort with SOP-based handoffs.'
    ]
  },
  {
    title: 'Cold Chain Associate',
    company: 'ThermoBridge',
    city: 'Chennai',
    category: 'Warehouse',
    experience: '1-3 years',
    employment: 'Full time',
    skills: ['Cold Chain', 'Cargo Handling', 'WMS'],
    match: 90,
    summary: 'Support cold-chain movement, storage and temperature compliance across logistics nodes.',
    responsibilities: [
      'Handle temperature-controlled goods safely and accurately.',
      'Monitor cold storage compliance and stock movement.',
      'Support documentation and product integrity checks.'
    ],
    requirements: [
      'Experience in chilled or frozen logistics preferred.',
      'Good habits around temperature monitoring and SOP usage.',
      'Understanding of warehouse and route coordination.'
    ]
  },
  {
    title: 'Supply Chain Data Analyst',
    company: 'FlowNest Analytics',
    city: 'Bengaluru',
    category: 'Supply Chain',
    experience: '3-5 years',
    employment: 'Full time',
    skills: ['Data Analytics', 'Supply Chain', 'Inventory'],
    match: 91,
    summary: 'Turn supply chain and demand signals into actionable performance insights.',
    responsibilities: [
      'Build dashboards tracking inventory and dispatch efficiency.',
      'Analyse service level and demand forecast performance.',
      'Recommend process changes using real operational data.'
    ],
    requirements: [
      'Strong analytical mindset and dashboard experience.',
      'Logistics and supply chain exposure preferred.',
      'Excellent reporting and communication skills.'
    ]
  }
];

const learningData = [
  {
    platform: 'Skill India Digital',
    type: 'Government / Public',
    title: 'Warehouse Operations Foundation',
    description: 'Learn warehouse handling, process workflows and safety requirements for modern logistics operations.',
    skills: 'WMS, Warehouse Operations',
    difficulty: 'Beginner',
    url: 'https://skillindiadigital.gov.in/'
  },
  {
    platform: 'NSDC',
    type: 'Government / Public',
    title: 'Logistics and Supply Chain Essentials',
    description: 'Build workforce readiness in inventory control, movement planning and supply chain fundamentals.',
    skills: 'Inventory Management, Supply Chain Analytics',
    difficulty: 'Intermediate',
    url: 'https://nsdcindia.org/'
  },
  {
    platform: 'eSkill India',
    type: 'Government / Public',
    title: 'Cold Chain Handling Basics',
    description: 'Understand cold-chain protocols, documentation and handling of temperature-sensitive cargo.',
    skills: 'Cold Chain, Cargo Handling',
    difficulty: 'Intermediate',
    url: 'https://eskillindia.org/'
  },
  {
    platform: 'SWAYAM',
    type: 'Government / Public',
    title: 'Digital Documentation for Logistics',
    description: 'Improve process documentation, digital records and operational compliance skills.',
    skills: 'Digital Documentation, Warehouse Operations',
    difficulty: 'Beginner',
    url: 'https://swayam.gov.in/'
  },
  {
    platform: 'NPTEL',
    type: 'Government / Public',
    title: 'Introduction to Logistics Management',
    description: 'Get an applied introduction to logistics planning, route efficiency and delivery flow.',
    skills: 'Route Planning, Fleet Management',
    difficulty: 'Intermediate',
    url: 'https://nptel.ac.in/'
  },
  {
    platform: 'Microsoft Learn',
    type: 'Industry / Professional',
    title: 'Data Analytics for Operations',
    description: 'Learn data-driven decision making for fleet, warehouse and inventory operations.',
    skills: 'Data Analytics, Inventory Analytics',
    difficulty: 'Intermediate',
    url: 'https://learn.microsoft.com/'
  },
  {
    platform: 'IBM SkillsBuild',
    type: 'Industry / Professional',
    title: 'Supply Chain Operations and Planning',
    description: 'Explore supply chain planning, service levels and digital operations best practices.',
    skills: 'Supply Chain Planning, Inventory Management',
    difficulty: 'Intermediate',
    url: 'https://www.ibm.com/training/'
  },
  {
    platform: 'Google Skills',
    type: 'Industry / Professional',
    title: 'Spreadsheet and Data Skills for Operations',
    description: 'Strengthen data analysis, dashboards and operational reporting for logistics teams.',
    skills: 'Data Analytics, Digital Documentation',
    difficulty: 'Beginner',
    url: 'https://grow.google/'
  },
  {
    platform: 'AWS Skill Builder',
    type: 'Industry / Professional',
    title: 'Cloud and Digital Operations Fundamentals',
    description: 'Build digital and cloud literacy relevant to modern warehouse and fleet systems.',
    skills: 'WMS, Digital Documentation',
    difficulty: 'Intermediate',
    url: 'https://aws.amazon.com/training/'
  },
  {
    platform: 'SAP Learning',
    type: 'Industry / Professional',
    title: 'Warehouse Management System (WMS) Essentials',
    description: 'Explore WMS workflows, transactions and operational process control in logistics networks.',
    skills: 'WMS, Warehouse Operations',
    difficulty: 'Intermediate',
    url: 'https://training.sap.com/'
  },
  {
    platform: 'Coursera',
    type: 'Industry / Professional',
    title: 'Practical Logistics and Supply Chain Solutions',
    description: 'Learn from real-world logistics case studies covering planning, shipping and warehouse performance.',
    skills: 'Route Planning, Fleet Management',
    difficulty: 'Intermediate',
    url: 'https://www.coursera.org/'
  }
];

const ui = {
  body: document.body,
  mainNav: document.getElementById('mainNav'),
  navLinks: [...document.querySelectorAll('.nav-link')],
  themeToggle: document.getElementById('themeToggle'),
  profileThemeToggle: document.getElementById('profileThemeToggle'),
  pages: [...document.querySelectorAll('.page')],
  loginForm: document.getElementById('loginForm'),
  fullName: document.getElementById('fullName'),
  phoneNumber: document.getElementById('phoneNumber'),
  emailAddress: document.getElementById('emailAddress'),
  aadhaarNumber: document.getElementById('aadhaarNumber'),
  locationCity: document.getElementById('locationCity'),
  gstinNumber: document.getElementById('gstinNumber'),
  formMessage: document.getElementById('formMessage'),
  roleButtons: [...document.querySelectorAll('.role-btn')],
  workspaceCards: [...document.querySelectorAll('.workspace-card')],
  logoutBtn: document.getElementById('logoutBtn'),
  profileName: document.getElementById('profileName'),
  profileRole: document.getElementById('profileRole'),
  profilePhone: document.getElementById('profilePhone'),
  profileCity: document.getElementById('profileCity'),
  dashboardTitle: document.getElementById('dashboardTitle'),
  dashboardCity: document.getElementById('dashboardCity'),
  employeeDashboard: document.getElementById('employeeDashboard'),
  employerDashboard: document.getElementById('employerDashboard'),
  jobsList: document.getElementById('jobsList'),
  learningList: document.getElementById('learningList'),
  skillSearch: document.getElementById('skillSearch'),
  popularSkills: document.getElementById('popularSkills'),
  skillResults: document.getElementById('skillResults'),
  skillResultsTitle: document.getElementById('skillResultsTitle'),
  skillCourseList: document.getElementById('skillCourseList'),
  clearSkill: document.getElementById('clearSkill'),
  skillProviderFilter: document.getElementById('skillProviderFilter'),
  skillLevelFilter: document.getElementById('skillLevelFilter'),
  filterCity: document.getElementById('filterCity'),
  filterCategory: document.getElementById('filterCategory'),
  filterExperience: document.getElementById('filterExperience'),
  filterSkill: document.getElementById('filterSkill'),
  filterEmployment: document.getElementById('filterEmployment'),
  jobModal: document.getElementById('jobModal'),
  jobModalTitle: document.getElementById('jobModalTitle'),
  jobModalMeta: document.getElementById('jobModalMeta'),
  jobResponsibilities: document.getElementById('jobResponsibilities'),
  jobRequirements: document.getElementById('jobRequirements'),
  courseModal: document.getElementById('courseModal'),
  modalCloseButtons: [...document.querySelectorAll('.modal-close')],
  modalBackdrop: [...document.querySelectorAll('.modal-backdrop')],
  logiskyToggle: document.getElementById('logiskyToggle'),
  logiskyPanel: document.getElementById('logiskyPanel'),
  logiskyClose: document.getElementById('logiskyClose'),
  logiskyForm: document.getElementById('logiskyForm'),
  logiskyInput: document.getElementById('logiskyInput'),
  logiskyMessages: document.getElementById('logiskyMessages'),
  employeeProfileForm: document.getElementById('employeeProfileForm'),
  employeeName: document.getElementById('employeeName'),
  employeePhone: document.getElementById('employeePhone'),
  employeeJobPreference: document.getElementById('employeeJobPreference'),
  employeeProfileMessage: document.getElementById('employeeProfileMessage'),
  employerProfileForm: document.getElementById('employerProfileForm'),
  companyName: document.getElementById('companyName'),
  companyGstin: document.getElementById('companyGstin'),
  employerProfileMessage: document.getElementById('employerProfileMessage'),
  hireJobType: document.getElementById('hireJobType'),
  hireMessage: document.getElementById('hireMessage'),
  matchingEmployees: document.getElementById('matchingEmployees'),
  hiringRequestsCard: document.getElementById('hiringRequestsCard'),
  hiringRequests: document.getElementById('hiringRequests')
};

function saveState() {
  localStorage.setItem(STORAGE_KEYS.theme, appState.theme);
  localStorage.setItem(STORAGE_KEYS.name, appState.name || '');
  localStorage.setItem(STORAGE_KEYS.phone, appState.phone || '');
  localStorage.setItem(STORAGE_KEYS.email, appState.email || '');
  localStorage.setItem(STORAGE_KEYS.aadhaar, appState.aadhaar || '');
  localStorage.setItem(STORAGE_KEYS.role, appState.role || '');
  localStorage.setItem(STORAGE_KEYS.city, appState.city || 'Pune');
  localStorage.setItem(STORAGE_KEYS.token, appState.token || '');
  localStorage.setItem(STORAGE_KEYS.gstin, appState.gstin || '');
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (appState.token) headers.Authorization = `Bearer ${appState.token}`;
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = body.detail;
      const message = typeof detail === 'object' ? detail.message : detail;
      const labels = { 400: 'Invalid request', 401: 'Authentication required', 403: 'Unauthorized', 404: 'Not found', 409: 'This action conflicts with existing data', 422: 'Invalid input', 429: 'Too many requests', 500: 'Server error', 503: 'Service unavailable' };
      throw new Error(message || labels[response.status] || 'Request failed');
    }
    return body;
  } catch (error) {
    if (error instanceof TypeError) throw new Error('Unable to connect to Logix server. Please make sure the backend is running.');
    throw error;
  }
}

function applyTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  ui.body.setAttribute('data-theme', resolvedTheme);
  if (ui.themeToggle) {
    ui.themeToggle.innerHTML = resolvedTheme === 'dark' ? '<span class="toggle-icon">🌙</span>' : '<span class="toggle-icon">☀️</span>';
  }
  if (ui.profileThemeToggle) {
    ui.profileThemeToggle.setAttribute('data-mode', resolvedTheme);
    const knob = ui.profileThemeToggle.querySelector('.switch-knob');
    if (knob && resolvedTheme === 'dark') {
      knob.style.transform = 'translateX(20px)';
    } else if (knob) {
      knob.style.transform = 'translateX(0)';
    }
  }
  appState.theme = resolvedTheme;
  localStorage.setItem(STORAGE_KEYS.theme, resolvedTheme);
}

function showView(viewName, options = {}) {
  if (currentView && currentView !== viewName && options.pushHistory !== false) {
    viewHistory.push(currentView);
  }
  currentView = viewName;

  ui.pages.forEach((page) => {
    const matches = page.dataset.view === viewName;
    page.classList.toggle('hidden', !matches);
    page.classList.toggle('active', matches);
  });

  ui.navLinks.forEach((link) => {
    const active = link.dataset.view === viewName;
    link.classList.toggle('active', active);
    if (link.classList.contains('employee-only')) {
      link.hidden = appState.role !== 'employee';
    }
    if (link.classList.contains('employer-only')) {
      link.hidden = appState.role !== 'employer';
    }
  });

  if (options.replaceUrl !== false && window.location.hash !== `#${viewName}`) {
    window.history.pushState({ view: viewName }, '', `#${viewName}`);
  }
}

function goBack() {
  const fallback = appState.role === 'employer' ? 'employer-workspace' : 'employee-workspace';
  showView(viewHistory.pop() || fallback, { pushHistory: false });
}

function applyRoleMode() {
  ui.body.classList.toggle('employee-mode', appState.role === 'employee');
  ui.body.classList.toggle('employer-mode', appState.role === 'employer');
}

async function loadEmployeeProfile() {
  const profile = await api('/api/employee/profile');
  appState.name = profile.name;
  appState.phone = profile.phone;
  saveState();
  return profile;
}

async function loadEmployerProfile() {
  const profile = await api('/api/employer/profile');
  appState.name = profile.company_name;
  appState.gstin = profile.gstin;
  saveState();
  return profile;
}

async function loadHiringRequests() {
  if (appState.role !== 'employee' || !ui.hiringRequests) return;
  try {
    const requests = await api('/api/employee/hiring-requests');
    ui.hiringRequestsCard.classList.remove('hidden');
    ui.hiringRequests.innerHTML = requests.length ? requests.map((request) => `
      <article class="request-card"><strong>${request.company_name || 'Logix employer'}</strong><span>${request.job_type}</span><em class="tag-status">${request.status}</em>
      ${request.status === 'pending' ? `<div class="button-row"><button class="primary-btn request-action" data-request="${request.id}" data-status="accepted">Accept</button><button class="secondary-btn request-action" data-request="${request.id}" data-status="rejected">Reject</button></div>` : ''}
      </article>`).join('') : '<p class="muted">No hiring requests yet.</p>';
    ui.hiringRequests.querySelectorAll('.request-action').forEach((button) => button.addEventListener('click', async () => {
      try { await api(`/api/employee/hiring-requests/${button.dataset.request}`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.status }) }); await loadHiringRequests(); }
      catch (error) { alert(error.message); }
    }));
  } catch (error) { console.warn(error.message); }
}

function toggleNavVisibility(isLoggedIn) {
  ui.mainNav.hidden = !isLoggedIn;
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return '+91 •••••••••';
  return `+91 ••••••${phone.slice(-3)}`;
}

function renderProfile() {
  if (!ui.profileName || !ui.profileRole || !ui.profilePhone || !ui.profileCity) return;

  ui.profileName.textContent = appState.name || 'Logix User';
  ui.profileRole.textContent = appState.role ? appState.role.charAt(0).toUpperCase() + appState.role.slice(1) : 'Employee';
  ui.profilePhone.textContent = maskPhone(appState.phone);
  ui.profileCity.textContent = appState.city || 'Pune';
  const dashboardName = appState.name || 'Team Member';
  ui.dashboardTitle.textContent = `Good to see you, ${dashboardName}.`;
  loadHiringRequests();
}

function renderDashboard() {
  const employeeVisible = appState.role === 'employee';
  if (ui.employeeDashboard) {
    ui.employeeDashboard.classList.toggle('hidden', !employeeVisible);
  }
  if (ui.employerDashboard) {
    ui.employerDashboard.classList.toggle('hidden', employeeVisible);
  }
  if (ui.dashboardCity) {
    ui.dashboardCity.value = appState.city || 'Pune';
  }
}

function renderJobs() {
  const filteredJobs = jobData.filter((job) => {
    const cityMatch = ui.filterCity.value === 'All' || job.city === ui.filterCity.value;
    const categoryMatch = ui.filterCategory.value === 'All' || job.category === ui.filterCategory.value;
    const experienceMatch = ui.filterExperience.value === 'All' || job.experience === ui.filterExperience.value;
    const skillMatch = ui.filterSkill.value === 'All' || job.skills.includes(ui.filterSkill.value);
    const employmentMatch = ui.filterEmployment.value === 'All' || job.employment === ui.filterEmployment.value;
    return cityMatch && categoryMatch && experienceMatch && skillMatch && employmentMatch;
  });

  if (!ui.jobsList) return;

  ui.jobsList.innerHTML = filteredJobs.map((job) => `
    <article class="job-card">
      <div class="job-header">
        <h3>${job.title}</h3>
        <span class="company-tag">${job.company}</span>
      </div>
      <div class="job-meta">
        <span>${job.city}</span>
        <span>${job.employment}</span>
        <span>${job.experience}</span>
      </div>
      <div class="job-skills">
        ${job.skills.map((skill) => `<span class="skill-pill">${skill}</span>`).join('')}
      </div>
      <div class="job-actions">
        <span class="match-badge">${job.match}% Match</span>
        <div class="button-row">
          <button class="secondary-btn view-job" data-job-title="${job.title}" type="button">View Details</button>
          <button class="primary-btn apply-job" type="button">Apply</button>
        </div>
      </div>
    </article>
  `).join('');

  ui.jobsList.querySelectorAll('.view-job').forEach((button) => {
    button.addEventListener('click', (event) => {
      const title = event.currentTarget.dataset.jobTitle;
      openJobModal(title);
    });
  });
}

function openJobModal(title) {
  const job = jobData.find((item) => item.title === title);
  if (!job || !ui.jobModal) return;

  ui.jobModalTitle.textContent = job.title;
  ui.jobModalMeta.innerHTML = `
    <span>${job.company}</span>
    <span>${job.city}</span>
    <span>${job.experience}</span>
    <span>${job.employment}</span>
    <span>${job.match}% Match</span>
  `;
  ui.jobResponsibilities.innerHTML = job.responsibilities.map((item) => `<li>${item}</li>`).join('');
  ui.jobRequirements.innerHTML = job.requirements.map((item) => `<li>${item}</li>`).join('');
  ui.jobModal.classList.remove('hidden');
  ui.jobModal.setAttribute('aria-hidden', 'false');
}

function closeModal(targetModal) {
  if (!targetModal) return;
  targetModal.classList.add('hidden');
  targetModal.setAttribute('aria-hidden', 'true');
}

function renderLearning() {
  if (!ui.learningList) return;
  ui.learningList.innerHTML = learningData.map((item) => `
    <article class="learning-card">
      <div class="learning-header">
        <div>
          <span class="badge">${item.type}</span>
          <h3>${item.platform}</h3>
        </div>
        <span class="type-tag">${item.difficulty}</span>
      </div>
      <p class="description">${item.description}</p>
      <div class="learning-meta">
        <span>Skill: ${item.skills}</span>
      </div>
      <div class="learning-actions">
        <span class="skill-pill">${item.title}</span>
        <a class="primary-btn" href="${item.url}" target="_blank" rel="noreferrer">View Course</a>
      </div>
    </article>
  `).join('');
}

function courseMatchesSkill(item, skill) {
  const normalized = skill.toLowerCase();
  const searchable = `${item.title} ${item.skills} ${item.description}`.toLowerCase();
  const aliases = {
    'warehouse management': ['warehouse', 'wms'],
    'inventory management': ['inventory'],
    'supply chain management': ['supply chain'],
    'logistics analytics': ['analytics', 'data'],
    'supply chain analytics': ['analytics', 'data', 'supply chain'],
    'data analytics': ['analytics', 'data'],
    'digital documentation': ['documentation', 'digital'],
    'transportation management': ['route', 'fleet', 'transport'],
    procurement: ['supply chain'],
    excel: ['spreadsheet', 'data'],
    sql: ['data', 'analytics'],
    'ai for logistics': ['digital', 'analytics']
  };
  return (aliases[normalized] || [normalized]).some((term) => searchable.includes(term));
}

function renderSkillCourses() {
  if (!ui.skillCourseList || !selectedSkill) return;
  const provider = ui.skillProviderFilter?.value || 'All';
  const level = ui.skillLevelFilter?.value || 'All';
  const courses = learningData.filter((item) => courseMatchesSkill(item, selectedSkill))
    .filter((item) => provider === 'All' || item.type === provider)
    .filter((item) => level === 'All' || item.difficulty === level);

  ui.skillResultsTitle.textContent = `Courses for ${selectedSkill}`;
  ui.skillCourseList.innerHTML = courses.length ? courses.map((item) => `
    <article class="learning-card">
      <div class="learning-header"><div><span class="badge">${item.type}</span><h3>${item.title}</h3></div><span class="type-tag">${item.difficulty}</span></div>
      <p class="course-trust">${item.platform} · Official provider resource</p>
      <p class="description">${item.description}</p>
      <div class="learning-meta"><span>Skill: ${item.skills}</span><span>Cost and certification: check provider</span></div>
      <div class="learning-actions"><span class="skill-pill">${item.platform}</span><a class="primary-btn" href="${item.url}" target="_blank" rel="noreferrer">View Course</a></div>
    </article>
  `).join('') : '<p class="muted">No matching resources for these filters. Try another provider or level.</p>';
}

function renderSkillOptions(query = '') {
  if (!ui.popularSkills) return;
  const normalizedQuery = query.trim().toLowerCase();
  const options = skillOptions.filter((skill) => skill.toLowerCase().includes(normalizedQuery)).slice(0, 8);
  ui.popularSkills.innerHTML = options.map((skill) => `<button class="skill-chip${skill === selectedSkill ? ' active' : ''}" type="button" data-skill="${skill}">${skill}</button>`).join('');
  ui.popularSkills.querySelectorAll('[data-skill]').forEach((button) => {
    button.addEventListener('click', () => selectSkill(button.dataset.skill));
  });
}

function selectSkill(skill) {
  selectedSkill = skill;
  if (ui.skillSearch) ui.skillSearch.value = skill;
  ui.skillResults?.classList.remove('hidden');
  renderSkillOptions(skill);
  renderSkillCourses();
}

function renderSkills() {
  renderSkillOptions();
  if (selectedSkill) {
    ui.skillResults?.classList.remove('hidden');
    renderSkillCourses();
  }
}

function updateProfileToggle() {
  const isDark = appState.theme === 'dark';
  if (ui.profileThemeToggle) {
    ui.profileThemeToggle.setAttribute('data-mode', isDark ? 'dark' : 'light');
    const knob = ui.profileThemeToggle.querySelector('.switch-knob');
    if (knob) {
      knob.style.transform = isDark ? 'translateX(20px)' : 'translateX(0)';
    }
  }
}

function logout() {
  ['name', 'phone', 'email', 'aadhaar', 'role', 'city', 'token', 'gstin'].forEach((key) => {
    localStorage.removeItem(STORAGE_KEYS[key]);
    appState[key] = key === 'city' ? 'Pune' : '';
  });
  showView('login');
  toggleNavVisibility(false);
  ui.loginForm.reset();
  ui.formMessage.textContent = '';
  viewHistory.length = 0;
  applyRoleMode();
}

function validatePhone(value) {
  return /^\d{10}$/.test(value);
}

function validateAadhaar(value) {
  return /^\d{12}$/.test(value);
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  if (!ui.fullName.value.trim()) {
    ui.formMessage.textContent = 'Please enter your full name.';
    return;
  }
  if (!validatePhone(ui.phoneNumber.value.trim())) {
    ui.formMessage.textContent = 'Please enter a valid 10-digit phone number.';
    return;
  }
  if (!ui.emailAddress.value.trim().toLowerCase().endsWith('@gmail.com')) {
    ui.formMessage.textContent = 'Please enter a valid Gmail address.';
    return;
  }
  if (!validateAadhaar(ui.aadhaarNumber.value.trim())) {
    ui.formMessage.textContent = 'Please enter a valid 12-digit Aadhaar number.';
    return;
  }
  if (!ui.locationCity.value) {
    ui.formMessage.textContent = 'Please select your location.';
    return;
  }
  try {
    const gstin = ui.gstinNumber.value.trim();
    const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone: ui.phoneNumber.value.trim(), email: ui.emailAddress.value.trim(), aadhaar: ui.aadhaarNumber.value.trim(), city: ui.locationCity.value, gstin: gstin || undefined }) });
    appState.name = ui.fullName.value.trim(); appState.phone = ui.phoneNumber.value.trim(); appState.email = ui.emailAddress.value.trim().toLowerCase(); appState.aadhaar = ui.aadhaarNumber.value.trim(); appState.city = ui.locationCity.value; appState.role = result.role; appState.token = result.token; appState.gstin = ui.gstinNumber?.value.trim().toUpperCase() || ''; saveState();
    applyRoleMode(); toggleNavVisibility(true);
    if (appState.role === 'employee') await continueEmployee(); else await continueEmployer();
  } catch (error) { ui.formMessage.textContent = error.message; }
}

function handleRoleSelection(role) {
  // Roles are selected by the verified backend account, never by this UI.
  if (role === appState.role) {
    showView(role === 'employee' ? 'employee-workspace' : 'employer-workspace');
  }
}

async function continueEmployee() {
  try { await loadEmployeeProfile(); renderProfile(); renderDashboard(); showView('employee-workspace'); }
  catch (error) {
    if (error.message === 'Employee profile not found') {
      ui.employeeName.value = appState.name; ui.employeePhone.value = appState.phone; showView('employee-onboarding');
    } else { ui.formMessage.textContent = error.message; }
  }
}

async function continueEmployer() {
  try { await loadEmployerProfile(); renderProfile(); renderDashboard(); showView('employer-workspace'); }
  catch (error) {
    if (error.message === 'Employer profile not found') { ui.companyGstin.value = appState.gstin; showView('employer-onboarding'); }
    else { ui.formMessage.textContent = error.message; }
  }
}

async function submitEmployeeProfile(event) {
  event.preventDefault();
  try {
    await api('/api/employee/profile', { method: 'POST', body: JSON.stringify({ name: ui.employeeName.value.trim(), job_preference: ui.employeeJobPreference.value }) });
    await continueEmployee();
  } catch (error) { ui.employeeProfileMessage.textContent = error.message; }
}

async function submitEmployerProfile(event) {
  event.preventDefault();
  try {
    await api('/api/employer/profile', { method: 'POST', body: JSON.stringify({ company_name: ui.companyName.value.trim(), gstin: appState.gstin }) });
    await continueEmployer();
  } catch (error) { ui.employerProfileMessage.textContent = error.message; }
}

async function findEmployees() {
  const jobType = ui.hireJobType.value;
  if (!jobType) { ui.matchingEmployees.innerHTML = ''; return; }
  try {
    ui.hireMessage.textContent = 'Finding registered employees…';
    const result = await api(`/api/employer/employees?job_type=${encodeURIComponent(jobType)}`);
    ui.hireMessage.textContent = result.count ? `${result.count} matching employee${result.count === 1 ? '' : 's'} found.` : 'No registered employees match this category yet.';
    ui.matchingEmployees.innerHTML = result.results.map((employee) => `<article class="job-card"><h3>${employee.name}</h3><p>${employee.job_preference}</p><div class="job-actions"><span class="match-badge">Registered match</span><button class="primary-btn hire-employee" data-employee="${employee.id}" data-job="${jobType}">Hire</button></div></article>`).join('');
    ui.matchingEmployees.querySelectorAll('.hire-employee').forEach((button) => button.addEventListener('click', async () => {
      try { await api('/api/employer/hiring-requests', { method: 'POST', body: JSON.stringify({ employee_id: Number(button.dataset.employee), job_type: button.dataset.job }) }); button.disabled = true; button.textContent = 'Request sent'; }
      catch (error) { ui.hireMessage.textContent = error.message; }
    }));
  } catch (error) { ui.hireMessage.textContent = error.message; }
}

function handleNavView(viewName) {
  const loggedIn = !!appState.token;
  if (!loggedIn) {
    showView('login');
    return;
  }

  if (viewName === 'dashboard') {
    renderDashboard();
    showView('dashboard');
    return;
  }

  if (viewName === 'profile') {
    renderProfile();
    showView('profile');
    return;
  }

  if (viewName === 'jobs') {
    renderJobs();
    showView('jobs');
    return;
  }

  if (viewName === 'learning') {
    renderLearning();
    showView('learning');
    return;
  }

  if (viewName === 'insights') {
    showView('insights');
    return;
  }

  if (viewName === 'hire') { showView('hire'); return; }

  if (viewName === 'skills') {
    renderSkills();
    showView('skills');
    return;
  }
}

function initEvents() {
  ui.themeToggle?.addEventListener('click', () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  ui.profileThemeToggle?.addEventListener('click', () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  ui.profileThemeToggle?.addEventListener('change', () => {
    const nextTheme = appState.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  ui.loginForm?.addEventListener('submit', handleLoginSubmit);
  ui.employeeProfileForm?.addEventListener('submit', submitEmployeeProfile);
  ui.employerProfileForm?.addEventListener('submit', submitEmployerProfile);
  ui.hireJobType?.addEventListener('change', findEmployees);

  ui.roleButtons.forEach((button) => button.addEventListener('click', () => handleRoleSelection(button.dataset.role)));

  ui.workspaceCards.forEach((card) => {
    card.addEventListener('click', () => {
      const target = card.dataset.open;
      if (target === 'profile') {
        renderProfile();
        showView('profile');
        return;
      }
      if (target === 'jobs') {
        renderJobs();
        showView('jobs');
        return;
      }
      if (target === 'learning') {
        renderLearning();
        showView('learning');
        return;
      }
      if (target === 'skills') {
        renderSkills();
        showView('skills');
        return;
      }
      if (target === 'insights') {
        showView('insights');
        return;
      }
      if (target === 'hire') {
        showView('hire');
        return;
      }
      renderDashboard();
      showView('dashboard');
    });
  });

  ui.navLinks.forEach((link) => {
    link.addEventListener('click', () => handleNavView(link.dataset.view));
  });

  ui.dashboardCity?.addEventListener('change', (event) => {
    appState.city = event.target.value;
    saveState();
    renderProfile();
  });

  ui.filterCity?.addEventListener('change', renderJobs);
  ui.filterCategory?.addEventListener('change', renderJobs);
  ui.filterExperience?.addEventListener('change', renderJobs);
  ui.filterSkill?.addEventListener('change', renderJobs);
  ui.filterEmployment?.addEventListener('change', renderJobs);

  ui.modalCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      closeModal(ui.jobModal);
      closeModal(ui.courseModal);
    });
  });

  ui.modalBackdrop.forEach((backdrop) => {
    backdrop.addEventListener('click', () => {
      closeModal(ui.jobModal);
      closeModal(ui.courseModal);
    });
  });

  ui.logoutBtn?.addEventListener('click', logout);

  document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', goBack));

  ui.skillSearch?.addEventListener('input', (event) => renderSkillOptions(event.target.value));
  ui.skillProviderFilter?.addEventListener('change', renderSkillCourses);
  ui.skillLevelFilter?.addEventListener('change', renderSkillCourses);
  ui.clearSkill?.addEventListener('click', () => {
    selectedSkill = '';
    ui.skillSearch.value = '';
    ui.skillResults.classList.add('hidden');
    renderSkillOptions();
  });

  ui.logiskyToggle?.addEventListener('click', () => {
    const isOpen = !ui.logiskyPanel.classList.contains('hidden');
    ui.logiskyPanel.classList.toggle('hidden', isOpen);
    ui.logiskyToggle.setAttribute('aria-expanded', String(!isOpen));
  });
  ui.logiskyClose?.addEventListener('click', () => {
    ui.logiskyPanel.classList.add('hidden');
    ui.logiskyToggle.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.logisky-suggestions button').forEach((button) => {
    button.addEventListener('click', () => answerLogisky(button.dataset.question));
  });
  ui.logiskyForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = ui.logiskyInput.value.trim();
    if (question) answerLogisky(question);
  });

  const dashboardInteractiveCards = [...document.querySelectorAll('.interactive')];
  dashboardInteractiveCards.forEach((card) => {
    card.addEventListener('click', () => {
      const openTarget = card.dataset.open || 'dashboard';
      if (openTarget === 'profile') {
        renderProfile();
        showView('profile');
      } else if (openTarget === 'jobs') {
        renderJobs();
        showView('jobs');
      } else if (openTarget === 'learning') {
        renderLearning();
        showView('learning');
      } else if (openTarget === 'insights') {
        showView('insights');
      } else {
        renderDashboard();
        showView('dashboard');
      }
    });
  });
}

function enforceSession() {
  const loggedIn = !!appState.token;
  toggleNavVisibility(loggedIn);

  if (loggedIn) {
    applyRoleMode();
    if (appState.role === 'employee') continueEmployee();
    else if (appState.role === 'employer') continueEmployer();
    else logout();
    return;
  }

  showView('login');
}

function answerLogisky(question) {
  const normalizedQuestion = question.toLowerCase();
  const logisticsTerms = ['logistics', 'supply chain', 'warehouse', 'fleet', 'transport', 'inventory', 'cargo', 'cold chain', 'route', 'procurement', 'wms', 'analytics', 'career', 'course', 'certification', 'job', 'skill', 'industry', 'ai'];
  const isLogisticsQuestion = logisticsTerms.some((term) => normalizedQuestion.includes(term));
  const response = isLogisticsQuestion
    ? normalizedQuestion.includes('wms') ? 'WMS is a Warehouse Management System that tracks inventory, storage and movement workflows.'
      : normalizedQuestion.includes('warehouse') ? 'Warehouse roles benefit from WMS, inventory control, safety and digital documentation skills.'
        : 'Focus on the skill gap first, then choose a relevant course from a government-backed or professional provider.'
    : 'Invalid Questions';
  const userMessage = document.createElement('div');
  userMessage.className = 'logisky-message user';
  userMessage.textContent = question;
  const assistantMessage = document.createElement('div');
  assistantMessage.className = 'logisky-message assistant';
  assistantMessage.textContent = response;
  ui.logiskyMessages.append(userMessage, assistantMessage);
  ui.logiskyInput.value = '';
  ui.logiskyMessages.scrollTop = ui.logiskyMessages.scrollHeight;
}

function init() {
  applyTheme(appState.theme);
  updateProfileToggle();
  renderProfile();
  renderDashboard();
  renderJobs();
  renderLearning();
  renderSkills();
  initEvents();
  enforceSession();
}

window.addEventListener('popstate', (event) => {
  const viewName = event.state?.view || window.location.hash.slice(1);
  if (viewName) showView(viewName, { pushHistory: false, replaceUrl: false });
});

window.addEventListener('DOMContentLoaded', init);
