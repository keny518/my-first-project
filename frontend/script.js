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

function runLoginCelebration() {
  const banner = document.getElementById('login-celebration');
  const confettiLayer = document.getElementById('confetti-layer');
  const colors = ['#0ea5a4', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#a855f7'];

  banner.classList.add('show');
  window.setTimeout(() => {
    banner.classList.remove('show');
  }, 2600);

  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.7}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    confettiLayer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 4000);
  }
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
      runLoginCelebration();
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

const workoutTypeSelect = document.getElementById('w_type');
const workoutTypeCustomInput = document.getElementById('w_type_custom');
const passwordInput = document.getElementById('password');
const togglePasswordInput = document.getElementById('toggle_password');

togglePasswordInput.onchange = () => {
  passwordInput.type = togglePasswordInput.checked ? 'text' : 'password';
};

workoutTypeSelect.onchange = () => {
  const isCustom = workoutTypeSelect.value === '__custom__';
  workoutTypeCustomInput.style.display = isCustom ? 'block' : 'none';
  if (!isCustom) {
    workoutTypeCustomInput.value = '';
  }
};

document.getElementById('create_workout').onclick = async () => {
  try {
    setStatus('Creating workout...');
    const selectedType = workoutTypeSelect.value;
    const customType = workoutTypeCustomInput.value.trim();
    const workout_type = selectedType === '__custom__' ? customType : selectedType;
    const workout_date = document.getElementById('w_date').value;
    const duration_minutes = parseInt(document.getElementById('w_dur').value, 10);
    if (!workout_type) {
      setStatus('Please select or enter a workout type.', 'error');
      return;
    }
    await api('/workouts', { method: 'POST', body: JSON.stringify({ workout_type, workout_date, duration_minutes }) });
    await loadWorkouts();
    setStatus('Workout created.');
  } catch (err) {
    setStatus(err.message, 'error');
  }
};

async function deleteWorkout(workoutId) {
  const confirmed = window.confirm('Delete this workout? This cannot be undone.');
  if (!confirmed) return;

  try {
    setStatus('Deleting workout...');
    await api(`/workouts/${workoutId}`, { method: 'DELETE' });
    await loadWorkouts();
    setStatus('Workout deleted.');
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

async function loadWorkouts(){
  const ul = document.getElementById('workouts');
  ul.innerHTML = '';

  try {
    const res = await api('/workouts');
    if (Array.isArray(res)){
      res.forEach(w => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = `${w.workout_date} — ${w.workout_type || 'N/A'} (${w.duration_minutes || 0}m)`;

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-workout';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteWorkout(w.workout_id);

        li.appendChild(label);
        li.appendChild(deleteButton);
        ul.appendChild(li);
      });
    }
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

showAuth();
