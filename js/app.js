const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const form = document.querySelector('#recommend-form');
const errorMessage = document.querySelector('#error-message');
const loadingMessage = document.querySelector('#loading-message');
const submitButton = form.querySelector('button[type="submit"]');
const resultContainer = document.querySelector('#result-container');

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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;
  loadingMessage.hidden = true;

  if (!form.checkValidity()) {
    errorMessage.textContent = '현재 기분과 선호 장르를 선택해 주세요.';
    errorMessage.hidden = false;
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const genre = formData.get('genre');
  const requestData = {
    mood: formData.get('mood'),
    genres: genre ? [genre] : [],
    companion: formData.get('company'),
    atmosphere: formData.get('tone'),
    interest: formData.get('interests'),
    mbti: formData.get('mbti'),
    include_trending: formData.get('include_trending') === 'on',
  };

  loadingMessage.textContent = '추천 요청을 보내고 있습니다...';
  loadingMessage.hidden = false;
  submitButton.disabled = true;
  form.setAttribute('aria-busy', 'true');

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.');
    }

    if (!response.ok || !data.ok) {
      throw new Error(data.message || '추천 요청을 처리하지 못했습니다.');
    }

    const successMessage = document.createElement('p');
    successMessage.className = 'empty-state';
    successMessage.textContent = '추천 요청이 정상적으로 처리되었습니다.';
    resultContainer.replaceChildren(successMessage);
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    errorMessage.textContent = error instanceof TypeError
      ? '서버에 연결할 수 없습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.'
      : error.message || '추천 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    errorMessage.hidden = false;
  } finally {
    loadingMessage.hidden = true;
    submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
});
