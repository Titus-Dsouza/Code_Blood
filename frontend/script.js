const STORAGE_KEYS = {
  theme: 'logix-theme'
};

const API_BASE = window.LOGIX_API_BASE || "http://localhost:8000";

const CITY_OPTIONS = [
  'Delhi NCR',
  'Bengaluru',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Chennai'
];

// Remove identity/profile values left behind by older prototype builds.
['logix-aadhaar', 'logix-name', 'logix-phone', 'logix-email', 'logix-role', 'logix-city', 'logix-token', 'logix-gstin']
  .forEach((key) => localStorage.removeItem(key));

const appState = {
  theme: localStorage.getItem(STORAGE_KEYS.theme) || 'light',
  name: '', phone: '', email: '', role: '', city: '', token: '', employeeProfile: null
};

let selectedSkill = '';
let currentView = '';
const viewHistory = [];
let skillOptions = [];
let skillCatalogLoaded = false;
let jobData = [];

let learningData = [];

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
  dateOfBirth: document.getElementById('dateOfBirth'),
  aadhaarNumber: document.getElementById('aadhaarNumber'),
  locationCity: document.getElementById('locationCity'),
  gstinNumber: document.getElementById('gstinNumber'),
  formMessage: document.getElementById('formMessage'),
  otpGroup: document.getElementById('otpGroup'),
  otpCode: document.getElementById('otpCode'),
  otpStatus: document.getElementById('otpStatus'),
  loginSubmit: document.getElementById('loginSubmit'),
  roleButtons: [...document.querySelectorAll('.role-btn')],
  workspaceCards: [...document.querySelectorAll('.workspace-card')],
  logoutBtn: document.getElementById('logoutBtn'),
  profileName: document.getElementById('profileName'),
  profileRole: document.getElementById('profileRole'),
  profilePhone: document.getElementById('profilePhone'),
  profileCity: document.getElementById('profileCity'),
  profileReadiness: document.getElementById('profileReadiness'),
  profileSkillCount: document.getElementById('profileSkillCount'),
  dashboardTitle: document.getElementById('dashboardTitle'),
  dashboardCity: document.getElementById('dashboardCity'),
  employeeDashboard: document.getElementById('employeeDashboard'),
  employerDashboard: document.getElementById('employerDashboard'),
  employeeReadiness: document.getElementById('employeeReadiness'),
  employeeReadinessBar: document.getElementById('employeeReadinessBar'),
  employeeMatchCount: document.getElementById('employeeMatchCount'),
  employeeCredentialCount: document.getElementById('employeeCredentialCount'),
  employeeDashboardGaps: document.getElementById('employeeDashboardGaps'),
  employeeDemand: document.getElementById('employeeDemand'),
  employerRequirementCount: document.getElementById('employerRequirementCount'),
  employerFleetCount: document.getElementById('employerFleetCount'),
  employerGapCount: document.getElementById('employerGapCount'),
  employerDashboardRequirements: document.getElementById('employerDashboardRequirements'),
  employerCandidateCount: document.getElementById('employerCandidateCount'),
  employerDemand: document.getElementById('employerDemand'),
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
  employeeSkills: document.getElementById('employeeSkills'),
  employeeExperience: document.getElementById('employeeExperience'),
  employeeVehicleType: document.getElementById('employeeVehicleType'),
  employeeLicenseType: document.getElementById('employeeLicenseType'),
  employeeWarehouseType: document.getElementById('employeeWarehouseType'),
  employeeCargoType: document.getElementById('employeeCargoType'),
  employeeWorkType: document.getElementById('employeeWorkType'),
  employeeProfileMessage: document.getElementById('employeeProfileMessage'),
  profileSkills: document.getElementById('profileSkills'),
  employerProfileForm: document.getElementById('employerProfileForm'),
  companyName: document.getElementById('companyName'),
  companyGstin: document.getElementById('companyGstin'),
  employerProfileMessage: document.getElementById('employerProfileMessage'),
  hireJobType: document.getElementById('hireJobType'),
  hireMessage: document.getElementById('hireMessage'),
  matchingEmployees: document.getElementById('matchingEmployees'),
  employerHiringRequests: document.getElementById('employerHiringRequests'),
  requirementForm: document.getElementById('requirementForm'),
  requirementTitle: document.getElementById('requirementTitle'),
  requirementJobType: document.getElementById('requirementJobType'),
  requirementCity: document.getElementById('requirementCity'),
  requirementDescription: document.getElementById('requirementDescription'),
  requirementSkills: document.getElementById('requirementSkills'),
  requirementExperience: document.getElementById('requirementExperience'),
  requirementVehicle: document.getElementById('requirementVehicle'),
  requirementLicense: document.getElementById('requirementLicense'),
  requirementWarehouse: document.getElementById('requirementWarehouse'),
  requirementCargo: document.getElementById('requirementCargo'),
  requirementWorkType: document.getElementById('requirementWorkType'),
  requirementMessage: document.getElementById('requirementMessage'),
  hiringRequestsCard: document.getElementById('hiringRequestsCard'),
  hiringRequests: document.getElementById('hiringRequests')
};

function saveState() {
  localStorage.setItem(STORAGE_KEYS.theme, appState.theme);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = await window.logixFirebase?.getIdToken?.();
  if (token) {
    appState.token = token;
    headers.Authorization = `Bearer ${token}`;
  }
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
  const profile = await api('/api/v1/employee/profile');
  appState.employeeProfile = profile;
  appState.name = profile.name;
  appState.phone = appState.phone || profile.phone || '';
  appState.city = profile.city;
  saveState();
  return profile;
}

async function loadEmployerProfile() {
  const profile = await api('/api/v1/employer/profile');
  appState.name = profile.company_name;
  appState.city = profile.city;
  saveState();
  return profile;
}

async function loadHiringRequests() {
  if (appState.role !== 'employee' || !ui.hiringRequests) return;
  try {
    const requests = await api('/api/v1/employee/hiring-requests');
    ui.hiringRequestsCard.classList.remove('hidden');
    ui.hiringRequests.innerHTML = requests.length ? requests.map((request) => `
      <article class="request-card"><strong>${request.company_name || 'Logix employer'}</strong><span>${request.job_type}</span><em class="tag-status">${request.status}</em>
      ${String(request.status).toUpperCase() === 'PENDING' ? `<div class="button-row"><button class="primary-btn request-action" data-request="${request.id}" data-status="ACCEPTED">Accept</button><button class="secondary-btn request-action" data-request="${request.id}" data-status="REJECTED">Reject</button></div>` : ''}
      </article>`).join('') : '<p class="muted">No hiring requests yet.</p>';
    ui.hiringRequests.querySelectorAll('.request-action').forEach((button) => button.addEventListener('click', async () => {
      try { await api(`/api/v1/employee/hiring-requests/${button.dataset.request}`, { method: 'PATCH', body: JSON.stringify({ status: button.dataset.status }) }); await loadHiringRequests(); }
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
  const skills = appState.employeeProfile?.skills || [];
  if (ui.profileSkillCount) ui.profileSkillCount.textContent = String(skills.length);
  if (ui.profileReadiness) ui.profileReadiness.textContent = appState.employeeProfile ? 'See dashboard' : '—';
  const dashboardName = appState.name || 'Team Member';
  ui.dashboardTitle.textContent = `Good to see you, ${dashboardName}.`;
  if (ui.profileSkills && appState.employeeProfile) {
    const skills = appState.employeeProfile.skills || [];
    ui.profileSkills.innerHTML = skills.length ? skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('') : '<li>Add your logistics skills in your profile setup.</li>';
  } else if (ui.profileSkills) {
    ui.profileSkills.innerHTML = '<li>Skill profiles are available to employee accounts.</li>';
  }
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
  if (employeeVisible) loadEmployeeDashboard();
  else loadEmployerDashboard();
}

async function loadDemand(container) {
  if (!container) return;
  try {
    const result = await api('/api/v1/insights/demand');
    container.innerHTML = result.skills.length ? result.skills.slice(0, 5).map(([skill, count]) =>
      `<div class="demand-item"><span>${escapeHtml(skill)}</span><em class="demand-badge high">${count} requirement${count === 1 ? '' : 's'}</em></div>`
    ).join('') : '<p class="muted">No published employer requirements yet.</p>';
  } catch (error) { container.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
}

async function loadEmployeeDashboard() {
  try {
    const summary = await api('/api/v1/employee/summary');
    const coverage = Number(summary.skill_readiness || 0);
    if (ui.employeeReadiness) ui.employeeReadiness.textContent = `${coverage}%`;
    if (ui.employeeReadinessBar) ui.employeeReadinessBar.style.width = `${coverage}%`;
    if (ui.employeeMatchCount) ui.employeeMatchCount.textContent = String(summary.jobs_available || 0);
    if (ui.employeeCredentialCount) ui.employeeCredentialCount.textContent = String((summary.profile_skills || []).length);
    if (ui.employeeDashboardGaps) ui.employeeDashboardGaps.innerHTML = summary.skill_gaps.length
      ? summary.skill_gaps.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')
      : '<li>No local skill gaps detected from current employer requirements.</li>';
    if (ui.profileReadiness) ui.profileReadiness.textContent = `${coverage}%`;
    if (ui.profileSkillCount) ui.profileSkillCount.textContent = String((summary.profile_skills || []).length);
    await loadDemand(ui.employeeDemand);
  } catch (error) {
    if (ui.employeeDashboardGaps) ui.employeeDashboardGaps.innerHTML = `<li>${escapeHtml(error.message)}</li>`;
  }
}

async function loadEmployerDashboard() {
  try {
    const summary = await api('/api/v1/employer/summary');
    if (ui.employerRequirementCount) ui.employerRequirementCount.textContent = String(summary.active_requirements);
    if (ui.employerFleetCount) ui.employerFleetCount.textContent = String(summary.fleet_requirements);
    if (ui.employerGapCount) ui.employerGapCount.textContent = String(summary.skill_gaps);
    if (ui.employerCandidateCount) ui.employerCandidateCount.textContent = `${summary.candidate_matches} category-matched candidate${summary.candidate_matches === 1 ? '' : 's'} found`;
    if (ui.employerDashboardRequirements) ui.employerDashboardRequirements.innerHTML = summary.requirements.length
      ? summary.requirements.map((requirement) => `<li>${escapeHtml(requirement.title)} · ${escapeHtml(requirement.city)}</li>`).join('')
      : '<li>Publish a requirement to see it here.</li>';
    await loadDemand(ui.employerDemand);
  } catch (error) {
    if (ui.employerDashboardRequirements) ui.employerDashboardRequirements.innerHTML = `<li>${escapeHtml(error.message)}</li>`;
  }
}

async function renderInsights() {
  try {
    const [demand, skills] = await Promise.all([api('/api/v1/insights/demand'), api('/api/v1/skills')]);
    const max = Math.max(1, ...demand.skills.map(([, count]) => count));
    const insightSkills = document.getElementById('insightSkills');
    const insightCities = document.getElementById('insightCities');
    const insightRoles = document.getElementById('insightRoles');
    if (insightSkills) insightSkills.innerHTML = demand.skills.length ? demand.skills.map(([name, count]) => `<div class="chart-row"><span>${escapeHtml(name)}</span><div class="bar-track"><span style="width:${Math.round(count / max * 100)}%"></span></div><strong>${count}</strong></div>`).join('') : '<p class="muted">No employer requirements have been posted yet.</p>';
    if (insightCities) insightCities.innerHTML = demand.cities.length ? demand.cities.map(([city, count]) => `<li><strong>${escapeHtml(city)}</strong> — ${count} open requirement${count === 1 ? '' : 's'}</li>`).join('') : '<li>No regional requirements have been posted yet.</li>';
    if (insightRoles) insightRoles.innerHTML = skills.map((item) => `<span class="role-chip">${escapeHtml(item.name)}</span>`).join('');
  } catch (error) {
    const insightSkills = document.getElementById('insightSkills');
    if (insightSkills) insightSkills.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function renderJobs() {
  if (!ui.jobsList || !appState.token) return;
  ui.jobsList.innerHTML = '<p class="muted">Loading logistics jobs…</p>';
  try {
    if (!skillCatalogLoaded) {
      const skills = await api('/api/v1/skills');
      skillOptions = skills.map((item) => item.name);
      skillCatalogLoaded = true;
      if (ui.filterSkill) ui.filterSkill.innerHTML = `<option value="All">All skills</option>${skillOptions.map((skill) => `<option>${escapeHtml(skill)}</option>`).join('')}`;
    }
    const params = new URLSearchParams();
    if (ui.filterCity?.value && ui.filterCity.value !== 'All') params.set('city', ui.filterCity.value);
    if (ui.filterCategory?.value && ui.filterCategory.value !== 'All') params.set('category', ui.filterCategory.value.toLowerCase());
    jobData = await api(`/api/v1/jobs?${params.toString()}`);
    const filteredJobs = jobData.filter((job) => {
      const experience = Number(job.experience_required || 0);
      const range = ui.filterExperience?.value || 'All';
      const experienceMatch = range === 'All' || (range === '0-1 years' ? experience <= 1 : range === '1-3 years' ? experience >= 1 && experience <= 3 : range === '3-5 years' ? experience >= 3 && experience <= 5 : experience >= 5);
      const skillMatch = ui.filterSkill?.value === 'All' || (job.required_skills || []).some((skill) => skill.toLowerCase() === ui.filterSkill.value.toLowerCase());
      const employmentMatch = ui.filterEmployment?.value === 'All' || job.work_type === ui.filterEmployment.value.toLowerCase();
      return experienceMatch && skillMatch && employmentMatch;
    });
    ui.jobsList.innerHTML = filteredJobs.length ? filteredJobs.map((job) => `
      <article class="job-card">
        <div class="job-header"><h3>${escapeHtml(job.title)}</h3><span class="company-tag">${escapeHtml(job.company_name || 'Logix employer')}</span></div>
        <div class="job-meta"><span>${escapeHtml(job.city)}</span><span>${escapeHtml(job.job_type)}</span><span>${Number(job.experience_required || 0)}+ years experience</span></div>
        <div class="job-skills">${(job.required_skills || []).map((skill) => `<span class="skill-pill">${escapeHtml(skill)}</span>`).join('')}</div>
        <div class="job-actions"><span class="match-badge">${Number(job.match || 0)}% Match</span><div class="button-row">
          <button class="secondary-btn view-job" data-job-id="${escapeHtml(job.id)}" type="button">View Details</button>
          ${appState.role === 'employee' ? `<button class="primary-btn apply-job" data-job-id="${escapeHtml(job.id)}" type="button">Apply</button>` : ''}
        </div></div>
      </article>`).join('') : '<p class="muted">No employer-posted logistics jobs match these filters yet.</p>';
    ui.jobsList.querySelectorAll('.view-job').forEach((button) => button.addEventListener('click', () => openJobModal(button.dataset.jobId)));
    ui.jobsList.querySelectorAll('.apply-job').forEach((button) => button.addEventListener('click', async () => {
      button.disabled = true;
      try { await api(`/api/v1/employee/jobs/${encodeURIComponent(button.dataset.jobId)}/apply`, { method: 'POST' }); button.textContent = 'Applied'; }
      catch (error) { button.disabled = false; button.textContent = error.message; }
    }));
  } catch (error) {
    ui.jobsList.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
  }
}

function openJobModal(jobId) {
  const job = jobData.find((item) => item.id === jobId);
  if (!job || !ui.jobModal) return;

  ui.jobModalTitle.textContent = job.title;
  ui.jobModalMeta.innerHTML = `
    <span>${escapeHtml(job.company_name || 'Logix employer')}</span>
    <span>${escapeHtml(job.city)}</span>
    <span>${Number(job.experience_required || 0)}+ years</span>
    <span>${escapeHtml(job.job_type)}</span>
    <span>${job.match}% Match</span>
  `;
  ui.jobResponsibilities.innerHTML = `<li>${escapeHtml(job.description || 'Logistics work as described by the employer.')}</li>`;
  ui.jobRequirements.innerHTML = (job.required_skills || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
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
  ui.learningList.innerHTML = '<p class="muted">Loading learning resources…</p>';
  api('/api/v1/learning/resources').then(async (resources) => {
    learningData = resources;
    const summary = document.getElementById('skillGapSummary');
    if (summary && appState.role === 'employee') {
      const result = await api('/api/v1/employee/skill-gaps');
      const linkedCourses = learningData.filter((course) => result.gaps.some((gap) => courseMatchesSkill(course, gap)));
      if (linkedCourses.length) learningData = linkedCourses;
      summary.innerHTML = result.gaps.length
        ? `<div class="panel info-panel"><div class="section-header"><h3>Skills requested by local employers</h3></div><p>${result.gaps.slice(0, 8).map(escapeHtml).join(' · ')}</p><p class="muted">${linkedCourses.length ? 'Courses below cover one or more of these gaps.' : 'No curated course is currently tagged to these gaps; all catalogue resources are shown below.'}</p></div>`
        : '<div class="panel info-panel"><p>No skill gaps found from current employer requirements in your city.</p></div>';
    }
    renderLearningCards();
  }).catch((error) => { ui.learningList.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; });
}

function renderLearningCards() {
  if (!ui.learningList) return;
  if (!learningData.length) {
    ui.learningList.innerHTML = '<p class="muted">No learning resources have been added yet. Run the Firestore catalog seed command to load the curated logistics courses.</p>';
    return;
  }
  ui.learningList.innerHTML = learningData.map((item) => `
    <article class="learning-card">
      <div class="learning-header">
        <div>
          <span class="badge">${escapeHtml(item.type)}</span>
          <h3>${escapeHtml(item.platform)}</h3>
        </div>
        <span class="type-tag">${escapeHtml(item.difficulty)}</span>
      </div>
      <p class="description">${escapeHtml(item.description)}</p>
      <div class="learning-meta">
        <span>Skill: ${(item.skills || []).map(escapeHtml).join(', ')}</span>
      </div>
      <div class="learning-actions">
        <span class="skill-pill">${escapeHtml(item.title)}</span>
        <a class="primary-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">View Course</a>
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
      <div class="learning-header"><div><span class="badge">${escapeHtml(item.type)}</span><h3>${escapeHtml(item.title)}</h3></div><span class="type-tag">${escapeHtml(item.difficulty)}</span></div>
      <p class="course-trust">${escapeHtml(item.platform)} · Check current availability with the provider</p>
      <p class="description">${escapeHtml(item.description)}</p>
      <div class="learning-meta"><span>Skill: ${(item.skills || []).map(escapeHtml).join(', ')}</span><span>Cost and certification: check provider</span></div>
      <div class="learning-actions"><span class="skill-pill">${escapeHtml(item.platform)}</span><a class="primary-btn" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">View Course</a></div>
    </article>
  `).join('') : '<p class="muted">No matching resources for these filters. Try another provider or level.</p>';
}

function renderSkillOptions(query = '') {
  if (!ui.popularSkills) return;
  const normalizedQuery = query.trim().toLowerCase();
  const options = skillOptions.filter((skill) => skill.toLowerCase().includes(normalizedQuery)).slice(0, 8);
  ui.popularSkills.innerHTML = options.map((skill) => `<button class="skill-chip${skill === selectedSkill ? ' active' : ''}" type="button" data-skill="${escapeHtml(skill)}">${escapeHtml(skill)}</button>`).join('');
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

async function renderSkills() {
  if (!appState.token) return;
  try {
    const [skills, courses] = await Promise.all([api('/api/v1/skills'), api('/api/v1/learning/resources')]);
    skillOptions = skills.map((skill) => skill.name);
    skillCatalogLoaded = true;
    learningData = courses;
  } catch (error) {
    if (ui.skillCourseList) ui.skillCourseList.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`;
    return;
  }
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
  window.logixFirebase?.signOut?.();
  Object.assign(appState, { name: '', phone: '', email: '', role: '', city: '', token: '', employeeProfile: null });
  showView('login');
  toggleNavVisibility(false);
  ui.loginForm.reset();
  ui.formMessage.textContent = '';
  ui.otpGroup?.classList.add('hidden');
  if (ui.otpCode) ui.otpCode.value = '';
  if (ui.otpStatus) ui.otpStatus.textContent = '';
  if (ui.loginSubmit) ui.loginSubmit.textContent = 'Continue to workspace →';
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
  if (!validatePhone(ui.phoneNumber.value.trim())) {
    ui.formMessage.textContent = 'Please enter a valid 10-digit phone number.';
    return;
  }
  try {
    const phone = ui.phoneNumber.value.trim();
    if (!ui.otpGroup || ui.otpGroup.classList.contains('hidden')) {
      if (!window.logixFirebase?.configured) throw new Error('Firebase Phone Auth needs your Firebase Web App settings. Add apiKey, authDomain, projectId and appId from Firebase Console → Project settings → Your apps to frontend/firebase-config.js.');
      await window.logixFirebase.requestOtp(`+91${phone}`);
      ui.otpGroup?.classList.remove('hidden');
      if (ui.otpStatus) ui.otpStatus.textContent = 'Verification code sent by Firebase. Enter the 6-digit code.';
      if (ui.loginSubmit) ui.loginSubmit.textContent = 'Verify OTP and continue →';
      ui.otpCode?.focus();
      return;
    }
    if (!/^\d{6}$/.test(ui.otpCode?.value.trim() || '')) {
      ui.formMessage.textContent = 'Please enter the 6-digit OTP sent to your phone.';
      return;
    }
    appState.token = await window.logixFirebase.confirmOtp(ui.otpCode.value.trim());
    let profile;
    try {
      profile = await api('/api/v1/account/me');
      if (ui.fullName) ui.fullName.value = profile.name || '';
      if (ui.emailAddress) ui.emailAddress.value = profile.email || '';
      if (ui.locationCity) ui.locationCity.value = profile.city || '';
      if (ui.dateOfBirth) ui.dateOfBirth.value = profile.date_of_birth || '';
    } catch (error) {
      if (!error.message.includes('account has not been created')) throw error;
      if (!ui.fullName.value.trim()) throw new Error('Please enter your name to create your account.');
      if (!ui.emailAddress.value.trim()) throw new Error('Please enter your email address.');
      if (!ui.dateOfBirth.value) throw new Error('Please enter your date of birth.');
      if (!validateAadhaar(ui.aadhaarNumber.value.trim())) throw new Error('Please enter a valid 12-digit Aadhaar number.');
      if (!ui.locationCity.value) throw new Error('Please select your city.');
    profile = (await api('/api/v1/account/signup', { method: 'POST', body: JSON.stringify({
        name: ui.fullName.value.trim(), email: ui.emailAddress.value.trim(), date_of_birth: ui.dateOfBirth.value,
        city: ui.locationCity.value, aadhaar_number: ui.aadhaarNumber.value.trim(), gstin: ui.gstinNumber.value.trim() || null,
      }) })).profile;
      ui.aadhaarNumber.value = '';
    }
    appState.name = profile.name || '';
    appState.phone = profile.phone || `+91${phone}`;
    appState.email = profile.email || '';
    appState.city = profile.city || '';
    // This role is returned by the backend profile; GSTIN never decides a client-side role.
    appState.role = profile.role || '';
    if (!['employee', 'employer'].includes(appState.role)) throw new Error('The backend returned an invalid account role.');
    saveState();
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
    if (error.message === 'Employer profile not found') { ui.companyGstin.value = 'Provided during signup · stored privately'; showView('employer-onboarding'); }
    else { ui.formMessage.textContent = error.message; }
  }
}

async function submitEmployeeProfile(event) {
  event.preventDefault();
  try {
    await api('/api/v1/employee/profile', { method: 'POST', body: JSON.stringify({
      name: ui.employeeName.value.trim(), city: appState.city, job_preference: ui.employeeJobPreference.value,
      skills: ui.employeeSkills.value.split(',').map((skill) => skill.trim()).filter(Boolean),
      experience: Number(ui.employeeExperience.value || 0), vehicle_type: ui.employeeVehicleType.value,
      license_type: ui.employeeLicenseType.value, warehouse_type: ui.employeeWarehouseType.value,
      cargo_type: ui.employeeCargoType.value, work_type: ui.employeeWorkType.value,
    }) });
    await continueEmployee();
  } catch (error) { ui.employeeProfileMessage.textContent = error.message; }
}

async function submitEmployerProfile(event) {
  event.preventDefault();
  try {
    await api('/api/v1/employer/profile', { method: 'POST', body: JSON.stringify({ company_name: ui.companyName.value.trim(), city: appState.city, description: '' }) });
    await continueEmployer();
  } catch (error) { ui.employerProfileMessage.textContent = error.message; }
}

async function submitRequirement(event) {
  event.preventDefault();
  ui.requirementMessage.textContent = 'Saving your requirement…';
  const payload = {
    title: ui.requirementTitle.value.trim(), job_type: ui.requirementJobType.value,
    city: ui.requirementCity.value, description: ui.requirementDescription.value.trim(),
    required_skills: ui.requirementSkills.value.split(',').map((skill) => skill.trim()).filter(Boolean),
    experience_required: Number(ui.requirementExperience.value || 0),
    vehicle_type: ui.requirementVehicle.value.trim() || null,
    license_type: ui.requirementLicense?.value.trim() || null,
    warehouse_type: ui.requirementWarehouse.value.trim() || null,
    cargo_type: ui.requirementCargo.value.trim() || null,
    work_type: ui.requirementWorkType.value.trim() || null,
  };
  try {
    await api('/api/v1/employer/requirements', { method: 'POST', body: JSON.stringify(payload) });
    ui.requirementMessage.textContent = 'Requirement saved and job published.';
    ui.requirementForm.reset();
    await loadEmployerDashboard();
  } catch (error) {
    ui.requirementMessage.textContent = error.message;
  }
}

async function findEmployees() {
  const jobType = ui.hireJobType.value;
  if (!jobType) { ui.matchingEmployees.innerHTML = ''; return; }
  try {
    ui.hireMessage.textContent = 'Finding registered employees…';
    const result = await api(`/api/v1/employer/matches?job_type=${encodeURIComponent(jobType)}`);
    ui.hireMessage.textContent = result.count ? `${result.count} matching employee${result.count === 1 ? '' : 's'} found.` : 'No registered employees match this category yet.';
    ui.matchingEmployees.innerHTML = result.results.map((employee) => `<article class="job-card"><h3>${escapeHtml(employee.name)}</h3><p>${escapeHtml(employee.job_preference)} · ${escapeHtml(employee.city)} · ${employee.experience} years</p><p>Skills: ${(employee.skills || []).map(escapeHtml).join(', ') || 'Not listed'}</p><p>${escapeHtml(employee.match_status)}${employee.skill_gaps?.length ? ` · Gaps: ${employee.skill_gaps.map(escapeHtml).join(', ')}` : ''}</p><div class="job-actions"><span class="match-badge">${employee.match_score}% match</span><button class="primary-btn hire-employee" data-employee="${escapeHtml(employee.id)}" data-job="${escapeHtml(jobType)}">Send hiring request</button></div></article>`).join('') || '<p class="muted">No matching employee profiles found in Firestore yet.</p>';
    ui.matchingEmployees.querySelectorAll('.hire-employee').forEach((button) => button.addEventListener('click', async () => {
      try { await api('/api/v1/employer/hiring-requests', { method: 'POST', body: JSON.stringify({ employee_id: button.dataset.employee, job_type: button.dataset.job }) }); button.disabled = true; button.textContent = 'Request sent'; await loadEmployerHiringRequests(); }
      catch (error) { ui.hireMessage.textContent = error.message; }
    }));
  } catch (error) { ui.hireMessage.textContent = error.message; }
}

async function loadEmployerHiringRequests() {
  if (!ui.employerHiringRequests || appState.role !== 'employer') return;
  try {
    const requests = await api('/api/v1/employer/hiring-requests');
    ui.employerHiringRequests.innerHTML = requests.length ? requests.map((request) => `<article class="request-card"><strong>${escapeHtml(request.employee_name)}</strong><span>${escapeHtml(request.job_type)} · ${escapeHtml(request.city)}</span><em class="tag-status">${escapeHtml(request.status)}</em></article>`).join('') : '<p class="muted">No hiring requests sent yet.</p>';
  } catch (error) { ui.employerHiringRequests.innerHTML = `<p class="muted">${escapeHtml(error.message)}</p>`; }
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
    renderInsights();
    showView('insights');
    return;
  }

  if (viewName === 'hire') { loadEmployerHiringRequests(); showView('hire'); return; }

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
  const updateCategoryFields = (select, selector, dataKey) => {
    const update = () => document.querySelectorAll(selector).forEach((field) => {
      const visible = (field.dataset[dataKey] || '').split(',').includes(select.value);
      field.classList.toggle('hidden', !visible);
      const input = field.querySelector('input');
      if (input) input.required = visible;
      if (!visible) {
        if (input) input.value = '';
      }
    });
    select?.addEventListener('change', update);
    update();
  };
  updateCategoryFields(ui.employeeJobPreference, '[data-employee-category]', 'employeeCategory');
  updateCategoryFields(ui.requirementJobType, '[data-requirement-category]', 'requirementCategory');
  ui.employerProfileForm?.addEventListener('submit', submitEmployerProfile);
  ui.requirementForm?.addEventListener('submit', submitRequirement);
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
        renderInsights();
        showView('insights');
        return;
      }
      if (target === 'hire') {
        loadEmployerHiringRequests();
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
    const city = event.target.value;
    api('/api/v1/account/me', { method: 'PUT', body: JSON.stringify({ city }) }).then(() => {
      appState.city = city;
      if (appState.employeeProfile) appState.employeeProfile.city = city;
      renderProfile();
      renderDashboard();
    }).catch((error) => { ui.formMessage.textContent = error.message; });
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
        renderInsights();
        showView('insights');
      } else {
        renderDashboard();
        showView('dashboard');
      }
    });
  });
}

async function enforceSession() {
  const user = window.logixFirebase?.getCurrentUser?.();
  if (!user) {
    toggleNavVisibility(false);
    showView('login');
    return;
  }
  appState.token = await user.getIdToken();
  try {
    const profile = await api('/api/v1/account/me');
    Object.assign(appState, { name: profile.name || '', phone: profile.phone || user.phoneNumber || '', email: profile.email || '', city: profile.city || '', role: profile.role || '' });
    if (!['employee', 'employer'].includes(appState.role)) throw new Error('Account role is unavailable.');
    toggleNavVisibility(true);
    applyRoleMode();
    if (appState.role === 'employee') await continueEmployee();
    else await continueEmployer();
  } catch (error) {
    toggleNavVisibility(false);
    showView('login');
    if (!error.message.includes('account has not been created')) ui.formMessage.textContent = error.message;
  }
}

async function answerLogisky(question) {
  const userMessage = document.createElement('div');
  userMessage.className = 'logisky-message user';
  userMessage.textContent = question;
  const assistantMessage = document.createElement('div');
  assistantMessage.className = 'logisky-message assistant';
  ui.logiskyMessages.append(userMessage, assistantMessage);
  ui.logiskyInput.value = '';
  try {
    const result = await api('/api/v1/logisky', { method: 'POST', body: JSON.stringify({ question }) });
    assistantMessage.textContent = result.answer === 'Invalid Questions' ? 'Invalid Questions' : result.answer;
  } catch (error) {
    assistantMessage.textContent = error.message;
  }
  ui.logiskyMessages.scrollTop = ui.logiskyMessages.scrollHeight;
}

async function init() {
  applyTheme(appState.theme);
  updateProfileToggle();
  initEvents();
  if (window.logixFirebase?.ready) await window.logixFirebase.ready;
  await enforceSession();
}

window.addEventListener('popstate', (event) => {
  const viewName = event.state?.view || window.location.hash.slice(1);
  if (viewName) showView(viewName, { pushHistory: false, replaceUrl: false });
});

window.addEventListener('DOMContentLoaded', init);
