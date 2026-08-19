const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const form = document.querySelector('#recommend-form');
const errorMessage = document.querySelector('#error-message');
const loadingMessage = document.querySelector('#loading-message');
const submitButton = form.querySelector('button[type="submit"]');
const resultContainer = document.querySelector('#result-container');
const providerTypeLabels = {
  subscription: '구독',
  rent: '대여',
  buy: '구매',
  free: '무료',
  addon: '추가 채널',
};

function createResultMessage(message) {
  const status = document.createElement('p');
  status.className = 'empty-state';
  status.textContent = message;
  return status;
}

function createPosterPlaceholder(title) {
  const placeholder = document.createElement('div');
  placeholder.className = 'poster-placeholder';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', `${title} 포스터 이미지 없음`);

  const label = document.createElement('span');
  label.textContent = 'POSTER NOT AVAILABLE';
  placeholder.append(label);
  return placeholder;
}

function createMoviePoster(movie) {
  const posterFrame = document.createElement('div');
  posterFrame.className = 'ticket-poster';

  if (typeof movie.poster_url !== 'string' || !movie.poster_url.trim()) {
    posterFrame.append(createPosterPlaceholder(movie.title));
    return posterFrame;
  }

  const poster = document.createElement('img');
  poster.src = movie.poster_url;
  poster.alt = `${movie.title} 영화 포스터`;
  poster.loading = 'lazy';
  poster.addEventListener('error', () => {
    posterFrame.replaceChildren(createPosterPlaceholder(movie.title));
  }, { once: true });
  posterFrame.append(poster);
  return posterFrame;
}

function getSafeExternalUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function renderWatchProviders(providers) {
  const providerArea = document.createElement('div');
  providerArea.className = 'ticket-providers';

  const heading = document.createElement('h4');
  heading.textContent = '대한민국 기준 확인 가능한 시청처';
  providerArea.append(heading);

  if (!Array.isArray(providers) || providers.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'provider-empty';
    empty.textContent = '현재 API에서 확인 가능한 시청처가 없습니다.';
    providerArea.append(empty);
    return providerArea;
  }

  const providerList = document.createElement('ul');
  providers.forEach((provider) => {
    const item = document.createElement('li');
    const name = typeof provider.name === 'string' && provider.name.trim()
      ? provider.name.trim()
      : '시청 서비스';
    const rawType = typeof provider.type === 'string' ? provider.type.trim() : '';
    const typeLabel = providerTypeLabels[rawType.toLowerCase()] || rawType || '이용 정보 확인';
    const label = `${name} · ${typeLabel}`;
    const safeLink = getSafeExternalUrl(provider.link);

    if (safeLink) {
      const link = document.createElement('a');
      link.href = safeLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = label;
      link.setAttribute('aria-label', `${label} 페이지 열기 (새 탭)`);
      item.append(link);
    } else {
      const text = document.createElement('span');
      text.textContent = label;
      item.append(text);
    }

    providerList.append(item);
  });
  providerArea.append(providerList);
  return providerArea;
}

function createMovieTicket(movie, index) {
  const ticket = document.createElement('article');
  ticket.className = 'movie-ticket';
  ticket.dataset.visualMood = movie.visual_mood || '';

  const country = typeof movie.country === 'string' && movie.country.trim()
    ? movie.country.trim().toUpperCase()
    : 'GL';
  const ticketPrefix = country === 'KR' ? 'KR' : 'GL';

  const ticketHeader = document.createElement('header');
  ticketHeader.className = 'ticket-header';

  const ticketNumber = document.createElement('span');
  ticketNumber.className = 'ticket-number';
  ticketNumber.textContent = `${ticketPrefix}-${String(index + 1).padStart(2, '0')}`;

  const score = document.createElement('p');
  score.className = 'ticket-score';
  score.append('AI MATCH ');
  const scoreValue = document.createElement('strong');
  scoreValue.textContent = String(movie.match_score ?? '-');
  score.append(scoreValue);
  ticketHeader.append(ticketNumber, score);

  const ticketBody = document.createElement('div');
  ticketBody.className = 'ticket-body';

  const title = document.createElement('h3');
  title.textContent = movie.title || '제목 정보 없음';

  const originalTitle = document.createElement('p');
  originalTitle.className = 'ticket-original-title';
  originalTitle.textContent = movie.original_title || '';

  const metadata = document.createElement('p');
  metadata.className = 'ticket-metadata';
  metadata.textContent = `${movie.release_year ?? '연도 미상'} · ${country}`;

  const genres = document.createElement('p');
  genres.className = 'ticket-genres';
  genres.textContent = Array.isArray(movie.genres) && movie.genres.length
    ? movie.genres.join(' · ')
    : '장르 정보 없음';

  const reasonLabel = document.createElement('p');
  reasonLabel.className = 'ticket-reason-label';
  reasonLabel.textContent = 'AI CURATOR NOTE';

  const reason = document.createElement('p');
  reason.className = 'ticket-reason';
  reason.textContent = movie.reason || '추천 이유를 준비하지 못했습니다.';

  ticketBody.append(
    title,
    originalTitle,
    metadata,
    genres,
    reasonLabel,
    reason,
    renderWatchProviders(movie.watch_providers),
  );
  ticket.append(ticketHeader, createMoviePoster(movie), ticketBody);
  return ticket;
}

function renderRecommendations(recommendations) {
  const status = document.createElement('p');
  status.className = 'result-success';
  status.textContent = '추천 요청이 정상적으로 처리되었습니다.';

  const ticketGrid = document.createElement('div');
  ticketGrid.className = 'ticket-grid';
  recommendations.forEach((movie, index) => {
    ticketGrid.append(createMovieTicket(movie, index));
  });

  resultContainer.classList.add('has-results');
  resultContainer.replaceChildren(status, ticketGrid);
}

function clearPreviousRecommendations(message) {
  resultContainer.classList.remove('has-results');
  resultContainer.replaceChildren(createResultMessage(message));
}

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
  clearPreviousRecommendations('새 추천 티켓을 준비하고 있습니다.');

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

    if (!Array.isArray(data.recommendations) || data.recommendations.length !== 3) {
      throw new Error('추천 결과 형식이 올바르지 않습니다. 다시 시도해 주세요.');
    }

    renderRecommendations(data.recommendations);
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    clearPreviousRecommendations('추천 결과를 표시할 수 없습니다.');
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
