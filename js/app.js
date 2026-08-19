const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const form = document.querySelector('#recommend-form');
const errorMessage = document.querySelector('#error-message');
const loadingMessage = document.querySelector('#loading-message');

navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navMenu.classList.toggle('is-open', !isOpen);
});

navMenu.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  loadingMessage.hidden = true;

  if (!form.checkValidity()) {
    errorMessage.textContent = '현재 기분과 선호 장르를 선택해 주세요.';
    errorMessage.hidden = false;
    form.reportValidity();
    return;
  }

  loadingMessage.textContent = '입력 준비가 완료되었습니다. 실제 추천 API는 다음 단계에서 연결됩니다.';
  loadingMessage.hidden = false;
  document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });

  // 다음 단계에서 아래와 같은 형태로 API를 연결합니다.
  // fetch('/api/recommend', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) })
});
