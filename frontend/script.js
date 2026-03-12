const state = { token: null };

function api(path, opts={}){
  const headers = opts.headers || {};
  if (state.token) headers['Authorization'] = 'Bearer ' + state.token;
  headers['Content-Type'] = 'application/json';
  return fetch('/api' + path, Object.assign({}, opts, { headers })).then(r => r.json());
}

document.getElementById('register').onclick = async () => {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await api('/users/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  if (res.token) { state.token = res.token; showMain(); loadWorkouts(); }
  else alert(JSON.stringify(res));
}

document.getElementById('login').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await api('/users/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (res.token) { state.token = res.token; showMain(); loadWorkouts(); }
  else alert(JSON.stringify(res));
}

document.getElementById('logout').onclick = () => { state.token=null; showAuth(); }

function showMain(){ document.getElementById('auth').style.display='none'; document.getElementById('main').style.display='block'; }
function showAuth(){ document.getElementById('auth').style.display='block'; document.getElementById('main').style.display='none'; }

document.getElementById('create_workout').onclick = async () => {
  const workout_type = document.getElementById('w_type').value;
  const workout_date = document.getElementById('w_date').value;
  const duration_minutes = parseInt(document.getElementById('w_dur').value) || null;
  await api('/workouts', { method: 'POST', body: JSON.stringify({ workout_type, workout_date, duration_minutes }) });
  loadWorkouts();
}

async function loadWorkouts(){
  const res = await api('/workouts');
  const ul = document.getElementById('workouts');
  ul.innerHTML='';
  if (Array.isArray(res)){
    res.forEach(w => {
      const li = document.createElement('li');
      li.textContent = `${w.workout_date} — ${w.workout_type || 'N/A'} (${w.duration_minutes || 0}m)`;
      ul.appendChild(li);
    });
  } else {
    ul.innerHTML = JSON.stringify(res);
  }
}

showAuth();
