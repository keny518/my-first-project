const state = { token: null, selectedWorkoutId: null };

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

function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function setButtonsDisabled(disabled) {
  document.querySelectorAll('button').forEach(b => { b.disabled = disabled; });
}

document.getElementById('register').onclick = async () => {
  try {
    setStatus('Registering account...');
    setButtonsDisabled(true);
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await api('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    if (res.token) {
      state.token = res.token;
      showMain();
      await loadWorkouts();
      await loadGoals();
      setStatus('Registered successfully.');
    }
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
};

document.getElementById('login').onclick = async () => {
  try {
    setStatus('Logging in...');
    setButtonsDisabled(true);
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await api('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.token) {
      state.token = res.token;
      showMain();
      await loadWorkouts();
      await loadGoals();
      runLoginCelebration();
      setStatus('Logged in successfully.');
    }
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
};

document.getElementById('logout').onclick = () => {
  state.token = null;
  state.selectedWorkoutId = null;
  clearWorkoutDetail();
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
    setButtonsDisabled(true);
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
  } finally {
    setButtonsDisabled(false);
  }
};

async function deleteWorkout(workoutId) {
  const confirmed = window.confirm('Delete this workout? This cannot be undone.');
  if (!confirmed) return;

  try {
    setStatus('Deleting workout...');
    setButtonsDisabled(true);
    await api(`/workouts/${workoutId}`, { method: 'DELETE' });
    if (state.selectedWorkoutId === workoutId) {
      state.selectedWorkoutId = null;
      clearWorkoutDetail();
    }
    await loadWorkouts();
    setStatus('Workout deleted.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

async function editWorkout(workoutId) {
  try {
    const workout = await api(`/workouts/${workoutId}`);
    const workout_type = window.prompt('Workout type:', workout.workout_type ?? '');
    if (workout_type === null) return;
    const workout_date = window.prompt('Workout date (YYYY-MM-DD):', workout.workout_date ?? '');
    if (workout_date === null) return;
    const dur = window.prompt('Duration minutes:', String(workout.duration_minutes ?? ''));
    if (dur === null) return;
    const duration_minutes = Number(dur);

    setStatus('Updating workout...');
    setButtonsDisabled(true);
    await api(`/workouts/${workoutId}`, { method: 'PUT', body: JSON.stringify({ workout_type, workout_date, duration_minutes }) });
    await loadWorkouts();
    if (state.selectedWorkoutId === workoutId) {
      await openWorkout(workoutId);
    }
    setStatus('Workout updated.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

function clearWorkoutDetail() {
  document.getElementById('workout_detail_body').textContent = 'Select a workout to view/edit exercises.';
  document.getElementById('exercise_tools').style.display = 'none';
  document.getElementById('exercises').innerHTML = '';
}

async function openWorkout(workoutId) {
  state.selectedWorkoutId = workoutId;
  document.getElementById('exercise_tools').style.display = 'none';
  document.getElementById('workout_detail_body').textContent = 'Loading workout...';
  document.getElementById('exercises').innerHTML = '';

  try {
    const workout = await api(`/workouts/${workoutId}`);
    document.getElementById('workout_detail_body').innerHTML =
      `<div class="stack"><div><strong>${esc(workout.workout_type)}</strong> <span class="small">${esc(workout.workout_date)}</span></div><div class="small">${esc(workout.duration_minutes)} minutes</div></div>`;
    document.getElementById('exercise_tools').style.display = 'block';
    await loadExercisesForWorkout(workoutId);
  } catch (err) {
    document.getElementById('workout_detail_body').textContent = err.message;
  }
}

async function loadExercisesForWorkout(workoutId) {
  const ul = document.getElementById('exercises');
  ul.innerHTML = '';
  const res = await api(`/workouts/${workoutId}/exercises`);
  if (!Array.isArray(res)) return;

  res.forEach(ex => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'stack';
    left.innerHTML = `<div><strong>${esc(ex.exercise_name)}</strong></div><div class="small">${esc(ex.sets)} sets · ${esc(ex.reps)} reps · ${ex.weight === null ? 'BW' : esc(ex.weight)} weight</div><div class="small" id="ex_info_${ex.exercise_id}"></div>`;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const infoBtn = document.createElement('button');
    infoBtn.className = 'ghost';
    infoBtn.textContent = 'Info';
    infoBtn.onclick = () => loadExerciseInfo(ex.exercise_id);

    const editBtn = document.createElement('button');
    editBtn.className = 'secondary';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => editExercise(ex.exercise_id);

    const delBtn = document.createElement('button');
    delBtn.className = 'danger';
    delBtn.textContent = 'Delete';
    delBtn.onclick = () => deleteExercise(ex.exercise_id);

    actions.appendChild(infoBtn);
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    ul.appendChild(li);
  });
}

async function loadExerciseInfo(exerciseId) {
  const target = document.getElementById(`ex_info_${exerciseId}`);
  target.textContent = 'Loading info...';
  try {
    const data = await api(`/public/exercises/${exerciseId}/info`);
    if (!data.match) {
      target.textContent = 'No public API match found.';
      return;
    }
    const desc = (data.match.data && data.match.data.description) ? data.match.data.description : '';
    target.textContent = desc ? desc.slice(0, 180) + (desc.length > 180 ? '…' : '') : 'Found a match (no description).';
  } catch (err) {
    target.textContent = err.message;
  }
}

document.getElementById('create_exercise').onclick = async () => {
  if (!state.selectedWorkoutId) {
    setStatus('Select a workout first.', 'error');
    return;
  }
  try {
    setStatus('Adding exercise...');
    setButtonsDisabled(true);
    const exercise_name = document.getElementById('ex_name').value;
    const sets = Number(document.getElementById('ex_sets').value);
    const reps = Number(document.getElementById('ex_reps').value);
    const weightRaw = document.getElementById('ex_weight').value;
    const weight = weightRaw === '' ? null : Number(weightRaw);
    await api('/exercises', { method: 'POST', body: JSON.stringify({ workout_id: state.selectedWorkoutId, exercise_name, sets, reps, weight }) });
    document.getElementById('ex_name').value = '';
    document.getElementById('ex_sets').value = '';
    document.getElementById('ex_reps').value = '';
    document.getElementById('ex_weight').value = '';
    await loadExercisesForWorkout(state.selectedWorkoutId);
    setStatus('Exercise added.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
};

async function editExercise(exerciseId) {
  try {
    const ex = await api(`/exercises/${exerciseId}`);
    const exercise_name = window.prompt('Exercise name:', ex.exercise_name ?? '');
    if (exercise_name === null) return;
    const sets = Number(window.prompt('Sets:', String(ex.sets ?? '')));
    const reps = Number(window.prompt('Reps:', String(ex.reps ?? '')));
    const w = window.prompt('Weight (blank for BW):', ex.weight === null ? '' : String(ex.weight));
    if (w === null) return;
    const weight = w.trim() === '' ? null : Number(w);

    setStatus('Updating exercise...');
    setButtonsDisabled(true);
    await api(`/exercises/${exerciseId}`, { method: 'PUT', body: JSON.stringify({ exercise_name, sets, reps, weight }) });
    await loadExercisesForWorkout(state.selectedWorkoutId);
    setStatus('Exercise updated.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

async function deleteExercise(exerciseId) {
  const confirmed = window.confirm('Delete this exercise?');
  if (!confirmed) return;
  try {
    setStatus('Deleting exercise...');
    setButtonsDisabled(true);
    await api(`/exercises/${exerciseId}`, { method: 'DELETE' });
    await loadExercisesForWorkout(state.selectedWorkoutId);
    setStatus('Exercise deleted.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
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
        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'ghost';
        label.textContent = `${w.workout_date} — ${w.workout_type || 'N/A'} (${w.duration_minutes || 0}m)`;
        label.onclick = () => openWorkout(w.workout_id);

        const actions = document.createElement('div');
        actions.className = 'item-actions';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'secondary';
        editButton.textContent = 'Edit';
        editButton.onclick = () => editWorkout(w.workout_id);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'delete-workout danger';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteWorkout(w.workout_id);

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        li.appendChild(label);
        li.appendChild(actions);
        ul.appendChild(li);
      });
    }
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

document.getElementById('create_goal').onclick = async () => {
  try {
    setStatus('Creating goal...');
    setButtonsDisabled(true);
    const goal_title = document.getElementById('goal_title').value;
    const target_workouts_per_week = Number(document.getElementById('goal_target').value);
    await api('/goals', { method: 'POST', body: JSON.stringify({ goal_title, target_workouts_per_week }) });
    document.getElementById('goal_title').value = '';
    document.getElementById('goal_target').value = '';
    await loadGoals();
    setStatus('Goal created.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
};

async function loadGoals() {
  const ul = document.getElementById('goals');
  ul.innerHTML = '';
  try {
    const res = await api('/goals');
    if (!Array.isArray(res)) return;
    res.forEach(g => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.className = 'stack';
      left.innerHTML = `<div><strong>${esc(g.goal_title)}</strong></div><div class="small">${esc(g.target_workouts_per_week)} workouts/week</div>`;

      const actions = document.createElement('div');
      actions.className = 'item-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'secondary';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => editGoal(g.goal_id);

      const delBtn = document.createElement('button');
      delBtn.className = 'danger';
      delBtn.textContent = 'Delete';
      delBtn.onclick = () => deleteGoal(g.goal_id);

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(actions);
      ul.appendChild(li);
    });
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

async function editGoal(goalId) {
  try {
    const g = await api(`/goals/${goalId}`);
    const goal_title = window.prompt('Goal title:', g.goal_title ?? '');
    if (goal_title === null) return;
    const target_workouts_per_week = Number(window.prompt('Target workouts/week:', String(g.target_workouts_per_week ?? '')));

    setStatus('Updating goal...');
    setButtonsDisabled(true);
    await api(`/goals/${goalId}`, { method: 'PUT', body: JSON.stringify({ goal_title, target_workouts_per_week }) });
    await loadGoals();
    setStatus('Goal updated.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

async function deleteGoal(goalId) {
  const confirmed = window.confirm('Delete this goal?');
  if (!confirmed) return;
  try {
    setStatus('Deleting goal...');
    setButtonsDisabled(true);
    await api(`/goals/${goalId}`, { method: 'DELETE' });
    await loadGoals();
    setStatus('Goal deleted.');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

showAuth();
