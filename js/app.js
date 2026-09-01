const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const form = document.querySelector('#recommend-form');
const errorMessage = document.querySelector('#error-message');
const loadingMessage = document.querySelector('#loading-message');
const loadingDetail = document.querySelector('#loading-detail');
const loadingRecentNote = document.querySelector('#loading-recent-note');
const submitButton = form.querySelector('button[type="submit"]');
const resultContainer = document.querySelector('#result-container');
let loadingTimerId = null;
let loadingStartedAt = 0;
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
  poster.alt = `${movie.title} 영화 포스터`;
  poster.loading = 'lazy';
  poster.addEventListener('load', () => {
    poster.classList.add('is-loaded');
  }, { once: true });
  poster.addEventListener('error', () => {
    posterFrame.replaceChildren(createPosterPlaceholder(movie.title));
  }, { once: true });
  poster.src = movie.poster_url;
  posterFrame.append(poster);
  if (poster.complete && poster.naturalWidth > 0) {
    poster.classList.add('is-loaded');
  }
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
    const safeLogoUrl = getSafeExternalUrl(provider.logo_url);
    const providerContent = safeLink ? document.createElement('a') : document.createElement('span');
    providerContent.className = 'provider-option';

    if (safeLink) {
      providerContent.href = safeLink;
      providerContent.target = '_blank';
      providerContent.rel = 'noopener noreferrer';
      providerContent.setAttribute('aria-label', `${label} 페이지 열기 (새 탭)`);
    }

    const providerName = document.createElement('span');
    providerName.className = 'provider-name';
    providerName.textContent = name;

    if (safeLogoUrl) {
      const logo = document.createElement('img');
      logo.className = 'provider-logo';
      logo.src = safeLogoUrl;
      logo.alt = `${name} 로고`;
      logo.loading = 'lazy';
      logo.addEventListener('error', () => {
        logo.replaceWith(providerName);
      }, { once: true });
      providerContent.append(logo);
    } else {
      providerContent.append(providerName);
    }

    const typeBadge = document.createElement('span');
    typeBadge.className = 'provider-type';
    typeBadge.textContent = typeLabel;
    providerContent.append(typeBadge);
    item.append(providerContent);
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
  const ticketLabel = country === 'KR' ? 'LOCAL PICK' : 'GLOBAL PICK';

  const ticketHeader = document.createElement('header');
  ticketHeader.className = 'ticket-header';

  const ticketNumber = document.createElement('span');
  ticketNumber.className = 'ticket-number';
  ticketNumber.textContent = `${ticketLabel} ${String(index + 1).padStart(2, '0')}`;

  const score = document.createElement('p');
  score.className = 'ticket-score';
  const scoreLabel = document.createElement('span');
  scoreLabel.className = 'ticket-score-label';
  scoreLabel.textContent = '추천 적합도';
  const scoreValue = document.createElement('strong');
  scoreValue.textContent = `${movie.match_score ?? '-'}점`;
  score.append(scoreLabel, scoreValue);
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

function renderRecommendations(recommendations, showRecentReleaseNotice = false) {
  const status = document.createElement('p');
  status.className = 'result-success sr-only';
  status.textContent = '추천 요청이 정상적으로 처리되었습니다.';

  const resultElements = [status];
  if (showRecentReleaseNotice) {
    const notice = document.createElement('p');
    notice.className = 'recent-release-notice';
    notice.textContent = '최근 2년 개봉작을 우선적으로 찾았지만, 이번 추천에는 포함되지 않았습니다. 취향 적합도를 우선해 다른 작품을 추천했어요.';
    resultElements.push(notice);
  }

  const ticketGrid = document.createElement('div');
  ticketGrid.className = 'ticket-grid';
  recommendations.forEach((movie, index) => {
    ticketGrid.append(createMovieTicket(movie, index));
  });

  resultContainer.classList.add('has-results');
  resultContainer.replaceChildren(...resultElements, ticketGrid);
}

function clearPreviousRecommendations(message) {
  resultContainer.classList.remove('has-results');
  resultContainer.replaceChildren(createResultMessage(message));
}

function getLoadingDetail(elapsedSeconds) {
  if (elapsedSeconds <= 6) {
    return '취향을 살펴보고 있어요.';
  }
  if (elapsedSeconds <= 15) {
    return '어울리는 영화 후보를 고르고 있어요.';
  }
  if (elapsedSeconds <= 29) {
    return '영화 정보와 시청처를 확인하고 있어요.';
  }
  if (elapsedSeconds <= 49) {
    return '좋은 추천을 위해 조금 더 확인하고 있어요. 조금만 더 기다려 주세요.';
  }
  return 'COMING SOON — 오늘의 영화 티켓을 준비하고 있어요. 조금만 더 기다려 주세요. 🎬';
}

function stopLoading() {
  if (loadingTimerId !== null) {
    window.clearInterval(loadingTimerId);
    loadingTimerId = null;
  }
  loadingMessage.hidden = true;
}

function startLoading(includeRecentReleases) {
  stopLoading();
  loadingStartedAt = Date.now();

  const updateLoading = () => {
    const elapsedSeconds = Math.floor((Date.now() - loadingStartedAt) / 1000);
    loadingDetail.textContent = getLoadingDetail(elapsedSeconds);
    loadingRecentNote.hidden = !includeRecentReleases || elapsedSeconds < 13;
  };

  updateLoading();
  loadingMessage.hidden = false;
  loadingTimerId = window.setInterval(updateLoading, 1000);
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
  stopLoading();
  errorMessage.hidden = true;

  if (!form.checkValidity()) {
    errorMessage.textContent = '현재 기분, 선호 장르, 함께 보는 사람과 원하는 분위기를 선택해 주세요.';
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

  startLoading(requestData.include_trending);
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

    const showRecentReleaseNotice = requestData.include_trending
      && data.recent_release_included === false;
    renderRecommendations(data.recommendations, showRecentReleaseNotice);
    document.querySelector('#results').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    clearPreviousRecommendations('추천 결과를 표시할 수 없습니다.');
    errorMessage.textContent = error instanceof TypeError
      ? '서버에 연결할 수 없습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.'
      : error.message || '추천 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    errorMessage.hidden = false;
  } finally {
    stopLoading();
    submitButton.disabled = false;
    form.removeAttribute('aria-busy');
  }
});
