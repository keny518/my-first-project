const state = { token: null };

function setStatus(message, type = 'success') {
  const el = document.getElementById('status');
  if (!message) {
    el.textContent = '';
    el.className = '';
    return;
  }
  el.textContent = message;
  el.className = `show ${type}`;
}

async function api(path, opts = {}){
  const headers = opts.headers || {};
  if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
  headers['Content-Type'] = 'application/json';
  const response = await fetch('/api' + path, Object.assign({}, opts, { headers }));
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

document.getElementById('register').onclick = async () => {
  try {
    setStatus('Registering account...');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await api('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    if (res.token) {
      state.token = res.token;
      showMain();
      await loadWorkouts();
      setStatus('Registered successfully.');
    }
  } catch (err) {
    setStatus(err.message, 'error');
  }
};

document.getElementById('login').onclick = async () => {
  try {
    setStatus('Logging in...');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await api('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.token) {
      state.token = res.token;
      showMain();
      await loadWorkouts();
      setStatus('Logged in successfully.');
    }
  } catch (err) {
    setStatus(err.message, 'error');
  }
};

document.getElementById('logout').onclick = () => {
  state.token = null;
  showAuth();
  setStatus('Logged out.');
};

function showMain(){ document.getElementById('auth').style.display='none'; document.getElementById('main').style.display='block'; }
function showAuth(){ document.getElementById('auth').style.display='block'; document.getElementById('main').style.display='none'; }

document.getElementById('create_workout').onclick = async () => {
  try {
    setStatus('Creating workout...');
    const workout_type = document.getElementById('w_type').value;
    const workout_date = document.getElementById('w_date').value;
    const duration_minutes = parseInt(document.getElementById('w_dur').value, 10);
    await api('/workouts', { method: 'POST', body: JSON.stringify({ workout_type, workout_date, duration_minutes }) });
    await loadWorkouts();
    setStatus('Workout created.');
  } catch (err) {
    setStatus(err.message, 'error');
  }
};

async function loadWorkouts(){
  const ul = document.getElementById('workouts');
  ul.innerHTML = '';

  try {
    const res = await api('/workouts');
    if (Array.isArray(res)){
      res.forEach(w => {
        const li = document.createElement('li');
        li.textContent = `${w.workout_date} — ${w.workout_type || 'N/A'} (${w.duration_minutes || 0}m)`;
        ul.appendChild(li);
      });
    }
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

showAuth();
