// ============================================================================
// C&R Space Pilot Survey - Main App
// ============================================================================
// 설계 원칙:
// 1. UI 전환은 무조건 즉시 실행 (저장 실패가 UI를 막으면 안 됨)
// 2. 저장은 fire-and-forget + 내부에서 localStorage 즉시 백업
// 3. 모든 이벤트 핸들러는 try/catch로 감싸 예외가 UI를 망치지 않도록 방어
// ============================================================================

import { SURVEY_SLIDES, TOTAL_SLIDES } from './survey-data.js';
import {
  getOrCreateSessionId,
  saveDebounced,
  saveNow,
  loadExistingSession,
  onSaveStatus,
  resetSession,
} from './supabase-client.js';

// ----------------------------------------------------------------------------
// 전역 상태
// ----------------------------------------------------------------------------
const state = {
  current_step: 0,
  respondent_name: '',
  anonymous: false,
  answers: {},
  is_completed: false,
};

// 진단용: 초기화 시점 로그
console.log('[C&R Pilot] main.js loaded');

// ----------------------------------------------------------------------------
// DOM 참조
// ----------------------------------------------------------------------------
const $root = document.getElementById('app');
const $nav = document.getElementById('nav');
const $saveStatus = document.getElementById('save-status');

if (!$root || !$nav) {
  console.error('[C&R Pilot] 필수 DOM 요소 누락:', { $root, $nav });
}

// ----------------------------------------------------------------------------
// HTML escape
// ----------------------------------------------------------------------------
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function multilineHtml(text) {
  if (!text) return '';
  return text.split('\n').map(line => `<p>${esc(line)}</p>`).join('');
}

// ----------------------------------------------------------------------------
// 안전 저장 (에러가 UI 흐름을 막지 않도록)
// ----------------------------------------------------------------------------
function safeSave() {
  try {
    const p = saveNow(state);
    if (p && typeof p.catch === 'function') {
      p.catch(err => console.warn('[C&R Pilot] saveNow promise rejected:', err));
    }
  } catch (err) {
    console.warn('[C&R Pilot] saveNow threw sync:', err);
  }
}

// ----------------------------------------------------------------------------
// 저장 상태 UI
// ----------------------------------------------------------------------------
onSaveStatus((status) => {
  if (!$saveStatus) return;
  const map = {
    idle: '',
    saving: '저장 중...',
    saved: '✓ 저장됨',
    error: '⚠ 저장 실패 (기기에 백업됨)',
  };
  $saveStatus.textContent = map[status] || '';
  $saveStatus.className = `save-status save-status--${status}`;

  if (status === 'saved') {
    setTimeout(() => {
      if ($saveStatus.textContent === '✓ 저장됨') $saveStatus.textContent = '';
    }, 2000);
  }
});

// ----------------------------------------------------------------------------
// 상단 Progress Header
// ----------------------------------------------------------------------------
function renderProgressHeader() {
  return `
    <div class="progress-header">
      <div class="progress-brand">
        <span class="brand-semibold">C&amp;R SPACE</span>
        <span class="brand-medium">PILOT TEST</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="progress-bar"></div>
      </div>
    </div>
  `;
}

// ============================================================================
// 슬라이드 렌더러
// ============================================================================
function renderSlide(slide) {
  switch (slide.type) {
    case 'intro':       return renderIntro(slide);
    case 'respondent':  return renderRespondent(slide);
    case 'guide':       return renderGuide(slide);
    case 'task':        return renderTask(slide);
    case 'notice':      return renderNotice(slide);
    case 'choice':      return renderChoice(slide);
    case 'thanks':      return renderThanks(slide);
    case 'submit_done': return renderThanks(slide);
    default:            return `<div>Unknown slide: ${slide.type}</div>`;
  }
}

// ---------- 1. Intro ----------
function renderIntro(slide) {
  const metaHtml = slide.meta.map(m => `
    <div class="meta-item">
      <div class="meta-label">${esc(m.label)}</div>
      <div class="meta-value">${esc(m.value)}</div>
    </div>
  `).join('');

  const subheadingHtml = slide.subheadingLines
    .map(line => `<p>${esc(line)}</p>`)
    .join('');

  return `
    <div class="slide slide--intro">
      <div class="intro-group">
        <div class="intro-text">
          <h1 class="intro-heading">${esc(slide.heading)}</h1>
          <div class="intro-subheading">${subheadingHtml}</div>
          <p class="intro-desc">${esc(slide.description)}</p>
        </div>
        <div class="meta-list">${metaHtml}</div>
      </div>
    </div>
  `;
}

// ---------- 2. Respondent ----------
function renderRespondent(slide) {
  return `
    <div class="slide slide--respondent">
      <div class="respondent-title">${esc(slide.title)}</div>
      <div class="respondent-fields">
        <div class="respondent-input-row">
          <input
            type="text"
            id="respondent_name_input"
            data-field="respondent_name"
            class="underline-input"
            placeholder="${esc(slide.placeholder)}"
            value="${esc(state.respondent_name || '')}"
            ${state.anonymous ? 'disabled' : ''}
          />
        </div>
        <label class="check-row">
          <input
            type="checkbox"
            data-single-check="anonymous"
            ${state.anonymous ? 'checked' : ''}
          />
          <span class="check-box" aria-hidden="true"></span>
          <span class="check-label check-label--bold">${esc(slide.anonymousLabel)}</span>
        </label>
      </div>
    </div>
  `;
}

// ---------- 3. Guide ----------
function renderGuide(slide) {
  const blocksHtml = slide.blocks.map(block => {
    const styleAttr = block.color ? ` style="color: ${block.color}"` : '';
    const linesHtml = block.lines.map(line => {
      if (line.type === 'link') {
        return `
          <p class="guide-line">
            <a href="${esc(line.href)}" target="_blank" rel="noopener noreferrer" class="guide-link">${esc(line.value)}</a>
          </p>
        `;
      }
      return `<p class="guide-line">${esc(line.value)}</p>`;
    }).join('');
    return `<div class="guide-block"${styleAttr}>${linesHtml}</div>`;
  }).join('');

  return `<div class="slide slide--guide">${blocksHtml}</div>`;
}

// ---------- 4~12. Task ----------
function renderTask(slide) {
  const sectionsHtml = slide.sections.map(sec => renderTaskSection(sec)).join('');
  return `
    <div class="slide slide--task">
      <div class="task-head">
        <span class="task-pill">${esc(slide.taskLabel)}</span>
        <div class="task-title">${multilineHtml(slide.title)}</div>
      </div>
      ${sectionsHtml}
    </div>
  `;
}

function renderTaskSection(sec) {
  switch (sec.type) {
    case 'description':
      return `<div class="task-description">${multilineHtml(sec.text)}</div>`;
    case 'plain_heading':
      return `<div class="task-plain-heading">${multilineHtml(sec.text)}</div>`;
    case 'heading':
      return `<div class="task-heading-19">${esc(sec.text)}</div>`;
    case 'heading_16':
      return `<div class="task-heading-16">${esc(sec.text)}</div>`;
    case 'footnote':
      return `<div class="task-footnote">${multilineHtml(sec.text)}</div>`;
    case 'checklist':
      return `
        <div class="checklist">
          ${sec.items.map(item => `
            <label class="check-row">
              <input type="checkbox" data-answer="${esc(item.key)}" ${state.answers[item.key] ? 'checked' : ''} />
              <span class="check-box" aria-hidden="true"></span>
              <span class="check-label check-label--semibold-16">${esc(item.label)}</span>
            </label>
          `).join('')}
        </div>
      `;
    case 'checklist_small':
      return `
        <div class="checklist checklist--small">
          ${sec.items.map(item => `
            <label class="check-row">
              <input type="checkbox" data-answer="${esc(item.key)}" ${state.answers[item.key] ? 'checked' : ''} />
              <span class="check-box" aria-hidden="true"></span>
              <span class="check-label check-label--semibold-14">${esc(item.label)}</span>
            </label>
          `).join('')}
        </div>
      `;
    case 'checklist_rich':
      return `
        <div class="checklist">
          ${sec.items.map(item => {
            if (item.parts) {
              const partsHtml = item.parts.map(p => {
                if (p.type === 'badge') {
                  return `<span class="inline-badge inline-badge--${p.color}">${esc(p.value)}</span>`;
                }
                return `<span class="inline-text">${esc(p.value)}</span>`;
              }).join('');
              return `
                <label class="check-row">
                  <input type="checkbox" data-answer="${esc(item.key)}" ${state.answers[item.key] ? 'checked' : ''} />
                  <span class="check-box" aria-hidden="true"></span>
                  <span class="check-label check-label--semibold-16 check-label--inline">${partsHtml}</span>
                </label>
              `;
            } else {
              return `
                <label class="check-row">
                  <input type="checkbox" data-answer="${esc(item.key)}" ${state.answers[item.key] ? 'checked' : ''} />
                  <span class="check-box" aria-hidden="true"></span>
                  <span class="check-label check-label--semibold-16">${esc(item.label)}</span>
                </label>
              `;
            }
          }).join('')}
        </div>
      `;
    case 'checklist_block':
      return `
        <div class="checklist-block">
          ${sec.items.map(item => {
            const color = item.color ? ` style="color:${item.color}"` : '';
            const linesHtml = item.lines.map(l => `<p>${esc(l)}</p>`).join('');
            return `
              <label class="check-block-row">
                <input type="checkbox" data-answer="${esc(item.key)}" ${state.answers[item.key] ? 'checked' : ''} />
                <span class="check-box" aria-hidden="true"></span>
                <div class="check-block-text"${color}>${linesHtml}</div>
              </label>
            `;
          }).join('')}
        </div>
      `;
    case 'policy_note':
      return `
        <div class="policy-note">
          ${sec.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}
        </div>
      `;
    case 'feedback':
      return `
        <div class="feedback-block">
          <div class="feedback-label">${multilineHtml(sec.label)}</div>
          <textarea
            data-answer="${esc(sec.key)}"
            class="textarea-input"
            placeholder="${esc(sec.placeholder)}"
          >${esc(state.answers[sec.key] || '')}</textarea>
        </div>
      `;
    default:
      return '';
  }
}

// ---------- 13. Notice ----------
function renderNotice(slide) {
  return `
    <div class="slide slide--notice">
      <div class="notice-text">
        ${slide.lines.map(l => `<p>${esc(l)}</p>`).join('')}
      </div>
    </div>
  `;
}

// ---------- 14~17. Choice ----------
function renderChoice(slide) {
  const isMulti = slide.choiceKind === 'multi';
  const selected = Array.isArray(state.answers[slide.key]) ? state.answers[slide.key] : [];
  const currentValue = state.answers[slide.key];

  const optionsHtml = slide.options.map(opt => {
    const checked = isMulti
      ? selected.includes(opt.value)
      : currentValue === opt.value;

    const inputAttr = isMulti
      ? `type="checkbox" data-multi-answer="${esc(slide.key)}" value="${esc(opt.value)}"`
      : `type="radio" name="${esc(slide.key)}" data-single-answer="${esc(slide.key)}" value="${esc(opt.value)}"`;

    const boxClass = isMulti ? 'check-box' : 'check-box check-box--round';

    return `
      <label class="check-row">
        <input ${inputAttr} ${checked ? 'checked' : ''} />
        <span class="${boxClass}" aria-hidden="true"></span>
        <span class="check-label check-label--bold-14">${esc(opt.label)}</span>
      </label>
    `;
  }).join('');

  return `
    <div class="slide slide--choice">
      <div class="choice-head">
        <div class="choice-title">${multilineHtml(slide.title)}</div>
        ${slide.hint ? `<p class="choice-hint">${esc(slide.hint)}</p>` : ''}
      </div>
      <div class="choice-options">${optionsHtml}</div>
    </div>
  `;
}

// ---------- 18/19. Thanks / Submit Done ----------
function renderThanks(slide) {
  const blocksHtml = slide.blocks.map(b => {
    const cls = b.emphasis ? 'thanks-block thanks-block--emphasis' : 'thanks-block thanks-block--dim';
    return `<div class="${cls}">${b.lines.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;
  }).join('');

  return `
    <div class="slide slide--thanks">
      <div class="thanks-text">${blocksHtml}</div>
    </div>
  `;
}

// ============================================================================
// 네비게이션 버튼 렌더링
// ============================================================================
function renderNav(slide) {
  const isFirst = state.current_step === 0;

  if (slide.type === 'intro') {
    return {
      modifier: 'nav--single',
      html: `<button type="button" id="btn-next" class="btn btn--primary">${esc(slide.nextLabel || '다음')}</button>`,
    };
  }

  // Submit Done (19) — 이전 + 처음으로
  if (slide.type === 'submit_done') {
    return {
      modifier: 'nav--dual',
      html: `
        <button type="button" id="btn-prev" class="btn btn--secondary">이전</button>
        <button type="button" id="btn-restart" class="btn btn--outline-dark">처음으로</button>
      `,
    };
  }

  // Thanks (18) — 이전 + 다음
  if (slide.type === 'thanks') {
    return {
      modifier: 'nav--dual',
      html: `
        <button type="button" id="btn-prev" class="btn btn--secondary">이전</button>
        <button type="button" id="btn-next" class="btn btn--primary">다음</button>
      `,
    };
  }

  // 일반
  return {
    modifier: 'nav--dual',
    html: `
      <button type="button" id="btn-prev" class="btn btn--secondary" ${isFirst ? 'disabled' : ''}>이전</button>
      <button type="button" id="btn-next" class="btn btn--primary">다음</button>
    `,
  };
}

// ============================================================================
// 전체 render
// ============================================================================
function render() {
  try {
    const slide = SURVEY_SLIDES[state.current_step];
    console.log(`[C&R Pilot] render step=${state.current_step} type=${slide.type}`);

    const hasHeader = slide.type !== 'intro' && !slide.hideHeader;
    const headerHtml = hasHeader ? renderProgressHeader() : '';

    $root.innerHTML = `
      ${headerHtml}
      <div class="slide-body">${renderSlide(slide)}</div>
    `;

    if (hasHeader) {
      const bar = $root.querySelector('#progress-bar');
      if (bar) bar.style.width = `${slide.progressPct || 0}%`;
    }

    const navData = renderNav(slide);
    $nav.innerHTML = navData.html;
    $nav.className = `nav ${navData.modifier}`;

    bindSlideEvents(slide);
    $root.scrollTo({ top: 0, behavior: 'instant' });
  } catch (err) {
    console.error('[C&R Pilot] render error:', err);
  }
}

// ============================================================================
// 이벤트 바인딩 (모든 핸들러는 try/catch로 방어)
// ============================================================================
function bindSlideEvents(slide) {
  // 이름 입력
  const nameInput = $root.querySelector('[data-field="respondent_name"]');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      try {
        state.respondent_name = e.target.value;
        saveDebounced(state);
      } catch (err) { console.error('[C&R Pilot] input error:', err); }
    });
  }

  // 익명 체크박스
  const anonCheck = $root.querySelector('[data-single-check="anonymous"]');
  if (anonCheck) {
    anonCheck.addEventListener('change', (e) => {
      try {
        state.anonymous = e.target.checked;
        const nameIn = $root.querySelector('[data-field="respondent_name"]');
        if (nameIn) nameIn.disabled = state.anonymous;
        safeSave();
      } catch (err) { console.error('[C&R Pilot] anon error:', err); }
    });
  }

  // Task 체크리스트
  $root.querySelectorAll('input[type="checkbox"][data-answer]').forEach(el => {
    el.addEventListener('change', e => {
      try {
        const key = e.target.dataset.answer;
        state.answers[key] = e.target.checked;
        safeSave();
      } catch (err) { console.error('[C&R Pilot] checkbox error:', err); }
    });
  });

  // Feedback textarea
  $root.querySelectorAll('textarea[data-answer]').forEach(el => {
    el.addEventListener('input', e => {
      try {
        const key = e.target.dataset.answer;
        state.answers[key] = e.target.value;
        saveDebounced(state);
      } catch (err) { console.error('[C&R Pilot] textarea error:', err); }
    });
  });

  // 단일 선택
  $root.querySelectorAll('[data-single-answer]').forEach(el => {
    el.addEventListener('change', e => {
      try {
        const key = e.target.dataset.singleAnswer;
        state.answers[key] = e.target.value;
        safeSave();
      } catch (err) { console.error('[C&R Pilot] radio error:', err); }
    });
  });

  // 다중 선택
  $root.querySelectorAll('[data-multi-answer]').forEach(el => {
    el.addEventListener('change', e => {
      try {
        const key = e.target.dataset.multiAnswer;
        const current = Array.isArray(state.answers[key]) ? state.answers[key] : [];
        if (e.target.checked) {
          if (!current.includes(e.target.value)) current.push(e.target.value);
        } else {
          const idx = current.indexOf(e.target.value);
          if (idx > -1) current.splice(idx, 1);
        }
        state.answers[key] = current;
        safeSave();
      } catch (err) { console.error('[C&R Pilot] multi error:', err); }
    });
  });

  // 네비게이션 — 가장 중요, 반드시 동작해야 함
  const $prev = document.getElementById('btn-prev');
  const $next = document.getElementById('btn-next');
  const $restart = document.getElementById('btn-restart');

  console.log('[C&R Pilot] nav bind:', { hasPrev: !!$prev, hasNext: !!$next, hasRestart: !!$restart });

  if ($prev) $prev.addEventListener('click', handlePrev);
  if ($next) $next.addEventListener('click', handleNext);
  if ($restart) $restart.addEventListener('click', handleRestart);
}

// ============================================================================
// 네비게이션 핸들러 (UI 전환은 무조건 실행, 저장 실패가 절대 막지 않음)
// ============================================================================
function handlePrev() {
  console.log('[C&R Pilot] handlePrev clicked, current_step=', state.current_step);
  try {
    if (state.current_step <= 0) return;
    state.current_step -= 1;
    render();           // 1. 화면 먼저 전환
    safeSave();         // 2. 저장은 백그라운드
  } catch (err) {
    console.error('[C&R Pilot] handlePrev error:', err);
  }
}

function handleNext() {
  console.log('[C&R Pilot] handleNext clicked, current_step=', state.current_step);
  try {
    const slide = SURVEY_SLIDES[state.current_step];
    const isLast = state.current_step === TOTAL_SLIDES - 1;
    if (isLast) return;

    // Thanks(18) → Submit Done(19) 전환 시 최종 제출 확정
    if (slide && slide.type === 'thanks') {
      state.is_completed = true;
    }

    state.current_step += 1;
    render();           // 1. 화면 먼저 전환
    safeSave();         // 2. 저장은 백그라운드
  } catch (err) {
    console.error('[C&R Pilot] handleNext error:', err);
  }
}

function handleRestart() {
  console.log('[C&R Pilot] handleRestart clicked');
  try {
    state.current_step = 0;
    render();           // 1. 화면 먼저 전환
    safeSave();         // 2. 저장은 백그라운드
  } catch (err) {
    console.error('[C&R Pilot] handleRestart error:', err);
  }
}

// ============================================================================
// 초기화
// ============================================================================
async function init() {
  try {
    getOrCreateSessionId();
    const existing = await loadExistingSession();
    if (existing) {
      state.respondent_name = existing.respondent_name || '';
      state.anonymous = !!existing.anonymous;
      state.answers = existing.answers || {};
      state.current_step = existing.current_step || 0;
      state.is_completed = !!existing.is_completed;
    }
  } catch (err) {
    console.warn('[C&R Pilot] init load failed, starting fresh:', err);
  }
  render();
}

if (new URLSearchParams(window.location.search).get('reset') === '1') {
  resetSession();
  window.location.replace(window.location.pathname);
} else {
  init();
}
