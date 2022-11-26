const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  // setiap pomodoro 4 kali maka ambil longBreak
  longBreakInterval: 4,
  // sessions= sesi keberapa
  sessions: 0,
};

let interval;

// event listener 
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

function handleMode(event) {
  const { mode } = event.target.dataset;

  // return nothing
  if (!mode) return;

  // kalo else maka masukkan ke function
  switchMode(mode);
  stopTimer();
}
// berpindah mode button switch
// mode = pomodoro, shortbreak, longbreak

function switchMode(mode) {
  timer.mode = mode;
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  };

    document.querySelectorAll('button[data-mode]')
            .forEach(e => e.classList.remove('active'));

    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    // document.body.style.background = ur0);
    
    // menambahkan remaining bar diatas
    document.getElementById('js-progress')
            .setAttribute('max', timer.remainingTime.total);

    updateClock();
  }
  // Panggil fungsi updateClock()
  function updateClock(){
    const {remainingTime} = timer;
  
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');
  
    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    // menambahkan countdown di tab title
    const text = timer.mode === 'pomodoro' ? 'Get back to work' : 'Take a break';
    document.title = `${minutes} :${seconds} - ${text}`;

    // menambahkan remaining bar 
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
  }
  
// menjalankan timer

function getRemainingTime(endTime){
  const currentTime = Date.parse(new Date());
  const difference = endTime - currentTime;

  const total = Number.parseInt(difference / 1000, 10);
  const minutes = Number.parseInt((total / 60) % 60, 10);
  const seconds = Number.parseInt(total % 60, 10);

  return {
    total,
    minutes,
    seconds,
  };
}

const mainButton = document.getElementById('js-btn');
const buttonSound = new Audio ('music/button-sound.mp3');
mainButton.addEventListener('click', ()=> {
  buttonSound.play();
  const {action} = mainButton.dataset;
  if (action === 'start'){
    // memanggil fungsi startTimer = jalankan timer
    startTimer();
  }else{
    stopTimer();
  }
});
function startTimer() {
  let { total } = timer.remainingTime;
  const endTime = Date.parse(new Date()) + total * 1000;

  // menambahkan sessions
  if(timer.mode === 'pomodoro') timer.sessions++;

  mainButton.dataset.action = 'stop';

  mainButton.textContent = 'stop';

  mainButton.classList.add('active');


  interval = setInterval(function() {
    timer.remainingTime = getRemainingTime(endTime);
    updateClock();

    total = timer.remainingTime.total;
    if (total <= 0) {
      clearInterval(interval);

      switch (timer.mode){
        case 'pomodoro':
          if(timer.sessions % timer.longBreakInterval === 0){
            switchMode('longBreak');
          }else{
            switchMode('shortBreak');
          }
          break;
          default:
            switchMode('pomodoro');
      }
      document.querySelector(`[data-sound="${timer.mode}"]`).play();
      if(Notification.permission == 'granted'){
        const text= timer.mode === 'pomodoro' ? 'Get back to work' : 'Take a break!';
        new Notification(text);
      }
      startTimer();
    }
  }, 1000);
}
document.addEventListener('DOMContentLoaded', () => {
  //  cek browser support apa tidak
   if ('Notification' in window) {
    // kondisi jika notif denied atau grantted
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      // menanyakan permission pada user
      Notification.requestPermission().then(function(permission) {
        // kalo user granted
        if (permission === 'granted') {
          // buat sebuah permission
          new Notification(
            'Awesome! You will be notified at the start of each session'
          );
        }
      });
    }
  }
  switchMode('pomodoro');
});
// untuk stop timer
function stopTimer() {
  clearInterval(interval);

  mainButton.dataset.action = 'start';
  mainButton.textContent = 'start';
  mainButton.classList.remove('active');
}