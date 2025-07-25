// Password Manager App
const app = document.getElementById('app');

// --- State ---
let isAuthenticated = false;
let passwords = [];
let theme = localStorage.getItem('theme') || 'dark';

// --- Default Demo Passwords ---
const defaultPasswords = [
  {
    title: 'GitHub',
    url: 'https://github.com',
    email: 'user@github.com',
    username: 'octocat',
    password: 'ghp_demo123',
  },
  {
    title: 'Gmail',
    url: 'https://mail.google.com',
    email: 'user@gmail.com',
    username: 'user123',
    password: 'gmail_demo123',
  },
  {
    title: 'Facebook',
    url: 'https://facebook.com',
    email: 'user@fb.com',
    username: 'fbuser',
    password: 'fb_demo123',
  },
];

// --- Hardcoded Auth ---
const AUTH = { password: '0008' };

// --- Utils ---
function savePasswords() {
  localStorage.setItem('passwords', JSON.stringify(passwords));
}
function loadPasswords() {
  const data = localStorage.getItem('passwords');
  if (data) {
    passwords = JSON.parse(data);
  } else {
    passwords = [...defaultPasswords];
  }
}
function setTheme(newTheme) {
  theme = newTheme;
  document.body.className = newTheme;
  localStorage.setItem('theme', newTheme);
}

// --- UI Render Functions ---
function renderLogin() {
  app.innerHTML = `
    <div class="flex-center" style="min-height:100vh;">
      <form class="glass fade-in-up" id="login-form" style="padding:2rem 2.5rem; min-width:320px;">
        <h2 style="margin-bottom:1.5rem;">🔐 Password Manager</h2>
        <input type="password" id="login-password" placeholder="Enter Password" required autocomplete="current-password" />
        <button class="btn" type="submit" style="width:100%;margin-top:1rem;">Login</button>
      </form>
    </div>
  `;
  document.getElementById('login-form').onsubmit = (e) => {
    e.preventDefault();
    const pw = document.getElementById('login-password').value;
    if (pw === AUTH.password) {
      isAuthenticated = true;
      renderDashboard();
    } else {
      alert('Incorrect password!');
    }
  };
}

function renderDashboard() {
  loadPasswords();
  app.innerHTML = `
    <div class="fade-in-up" style="display:flex;min-height:100vh;">
      <aside class="glass" style="width:220px;min-height:100vh;padding:2rem 1rem;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <h2 style="margin-bottom:2rem;">🔐 Manager</h2>
          <button class="btn" id="theme-toggle">${theme === 'dark' ? '🌙' : '☀️'} Theme</button>
        </div>
        <button class="btn" id="logout-btn">Logout</button>
      </aside>
      <main style="flex:1;padding:2.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h2>Password Vault</h2>
          <button class="btn" id="add-btn">+ Add Password</button>
        </div>
        <div id="password-list" style="margin-top:2rem;"></div>
      </main>
    </div>
    <div id="modal-root"></div>
  `;
  document.getElementById('logout-btn').onclick = () => {
    isAuthenticated = false;
    renderLogin();
  };
  document.getElementById('theme-toggle').onclick = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    renderDashboard();
  };
  document.getElementById('add-btn').onclick = () => {
    renderAddEditModal();
  };
  renderPasswordList();
}

function renderPasswordList() {
  const list = document.getElementById('password-list');
  if (!passwords.length) {
    list.innerHTML = '<div class="glass" style="padding:2rem;text-align:center;">No passwords saved.</div>';
    return;
  }
  list.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem;">
      ${passwords.map((pw, i) => `
        <div class="glass fade-in-up" style="padding:1.5rem;position:relative;">
          <div style="font-size:1.1rem;font-weight:600;">${pw.title}</div>
          <div style="color:#a5b4fc;">${pw.url}</div>
          <div style="margin:0.5rem 0;">${pw.email}</div>
          <div>User: ${pw.username}</div>
          <div style="margin:0.5rem 0;display:flex;align-items:center;">
            <input type="password" value="${pw.password}" id="pw-${i}" readonly style="flex:1;" />
            <button class="btn" style="margin-left:0.5rem;padding:0.3rem 0.7rem;" onclick="togglePassword(${i})">
              <span id="eye-${i}">👁️</span>
            </button>
          </div>
          <div style="margin-top:1rem;display:flex;gap:0.5rem;">
            <button class="btn" onclick="editPassword(${i})">Edit</button>
            <button class="btn" onclick="deletePassword(${i})">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// --- Modal ---
function renderAddEditModal(editIdx = null) {
  const modalRoot = document.getElementById('modal-root');
  const isEdit = editIdx !== null;
  const data = isEdit ? passwords[editIdx] : { title:'', url:'', email:'', username:'', password:'' };
  modalRoot.innerHTML = `
    <div class="fade-in-up" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(30,32,34,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;">
      <form class="glass fade-in-up" id="modal-form" style="padding:2rem 2.5rem;min-width:320px;max-width:90vw;">
        <h3 style="margin-bottom:1rem;">${isEdit ? 'Edit' : 'Add'} Password</h3>
        <input type="text" id="modal-title" placeholder="Title (e.g. GitHub)" value="${data.title}" required />
        <input type="url" id="modal-url" placeholder="Website URL" value="${data.url}" required />
        <input type="email" id="modal-email" placeholder="Email" value="${data.email}" required />
        <input type="text" id="modal-username" placeholder="Username/User ID" value="${data.username}" required />
        <input type="text" id="modal-password" placeholder="Password" value="${data.password}" required />
        <div style="display:flex;justify-content:flex-end;margin-top:1.2rem;gap:0.5rem;">
          <button type="button" class="btn" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn">${isEdit ? 'Save' : 'Add'}</button>
        </div>
      </form>
    </div>
  `;
  document.getElementById('modal-cancel').onclick = closeModal;
  document.getElementById('modal-form').onsubmit = (e) => {
    e.preventDefault();
    const newData = {
      title: document.getElementById('modal-title').value,
      url: document.getElementById('modal-url').value,
      email: document.getElementById('modal-email').value,
      username: document.getElementById('modal-username').value,
      password: document.getElementById('modal-password').value,
    };
    if (isEdit) {
      passwords[editIdx] = newData;
    } else {
      passwords.push(newData);
    }
    savePasswords();
    closeModal();
    renderPasswordList();
  };
}
function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

// --- Password Actions ---
window.togglePassword = function(idx) {
  const input = document.getElementById('pw-' + idx);
  const eye = document.getElementById('eye-' + idx);
  if (input.type === 'password') {
    input.type = 'text';
    eye.textContent = '🙈';
  } else {
    input.type = 'password';
    eye.textContent = '👁️';
  }
};
window.editPassword = function(idx) {
  renderAddEditModal(idx);
};
window.deletePassword = function(idx) {
  if (confirm('Delete this password?')) {
    passwords.splice(idx, 1);
    savePasswords();
    renderPasswordList();
  }
};

// --- App Init ---
setTheme(theme);
if (isAuthenticated) {
  renderDashboard();
} else {
  renderLogin();
}
