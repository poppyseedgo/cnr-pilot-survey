// ============================================================================
// C&R Space Pilot Survey - Main App (Figma 100% 반영 renderer)
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

// ----------------------------------------------------------------------------
// DOM 참조
// ----------------------------------------------------------------------------
const $root = document.getElementById('app');
const $nav = document.getElementById('nav');
const $progressBar = document.getElementById('progress-bar');
const $saveStatus = document.getElementById('save-status');

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

// 줄바꿈 텍스트를 <p> 여러 개로 (Figma의 line break 재현)
function multilineHtml(text) {
  if (!text) return '';
  return text.split('\n').map(line => `<p>${esc(line)}</p>`).join('');
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
// 프로그레스 바 (데이터에서 직접 progressPct 읽음)
// ----------------------------------------------------------------------------
function updateProgress(slide) {
  const pct = typeof slide.progressPct === 'number' ? slide.progressPct : 0;
  $progressBar.style.width = `${pct}%`;
}

// ----------------------------------------------------------------------------
// 상단 Progress Header (모든 슬라이드 공통, Intro 제외)
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
        // 새 창 열기 + 보안 (rel="noopener noreferrer"로 window.opener 공격 차단)
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

  return `
    <div class="slide slide--guide">
      ${blocksHtml}
    </div>
  `;
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
      // Task 3 - 14px SemiBold
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
      // Task 2-1 인라인 뱃지 포함
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
      // Task 5-1 / 5-2: 체크박스 위, 여러 줄 텍스트 아래
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

// ---------- 13. Notice (마무리 안내) ----------
function renderNotice(slide) {
  return `
    <div class="slide slide--notice">
      <div class="notice-text">
        ${slide.lines.map(l => `<p>${esc(l)}</p>`).join('')}
      </div>
    </div>
  `;
}

// ---------- 14~17. Choice (단일/다중) ----------
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

// ---------- 18. Thanks ----------
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
  const isLast = state.current_step === TOTAL_SLIDES - 1;

  // Intro 화면은 단일 primary 버튼
  if (slide.type === 'intro') {
    return {
      modifier: 'nav--single',
      html: `<button type="button" id="btn-next" class="btn btn--primary">${esc(slide.nextLabel || '다음')}</button>`,
    };
  }

  // Thanks 화면: 단일 "닫기" (secondary 스타일 — Figma: bg #fff border #787878)
  if (slide.type === 'thanks') {
    return {
      modifier: 'nav--single',
      html: `<button type="button" id="btn-close" class="btn btn--secondary">${esc(slide.closeLabel || '닫기')}</button>`,
    };
  }

  // 일반: 이전 + 다음
  return {
    modifier: 'nav--dual',
    html: `
      <button type="button" id="btn-prev" class="btn btn--secondary" ${isFirst ? 'disabled' : ''}>이전</button>
      <button type="button" id="btn-next" class="btn btn--primary">${isLast ? '제출' : '다음'}</button>
    `,
  };
}

// ============================================================================
// 전체 render
// ============================================================================
function render() {
  const slide = SURVEY_SLIDES[state.current_step];

  // Intro는 프로그레스 헤더 없음, 나머지는 있음
  const hasHeader = slide.type !== 'intro';
  const headerHtml = hasHeader ? renderProgressHeader() : '';

  $root.innerHTML = `
    ${headerHtml}
    <div class="slide-body">${renderSlide(slide)}</div>
  `;

  // 헤더 있을 때는 progress bar 찾아서 업데이트
  if (hasHeader) {
    const bar = $root.querySelector('#progress-bar');
    if (bar) bar.style.width = `${slide.progressPct || 0}%`;
  }

  // Nav 주입
  const navData = renderNav(slide);
  $nav.innerHTML = navData.html;
  $nav.className = `nav ${navData.modifier}`;

  bindSlideEvents(slide);
  $root.scrollTo({ top: 0, behavior: 'instant' });
}

// ============================================================================
// 이벤트 바인딩
// ============================================================================
function bindSlideEvents(slide) {
  // 이름 입력
  const nameInput = $root.querySelector('[data-field="respondent_name"]');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      state.respondent_name = e.target.value;
      saveDebounced(state);
    });
  }

  // 익명 체크박스
  const anonCheck = $root.querySelector('[data-single-check="anonymous"]');
  if (anonCheck) {
    anonCheck.addEventListener('change', (e) => {
      state.anonymous = e.target.checked;
      const nameIn = $root.querySelector('[data-field="respondent_name"]');
      if (nameIn) nameIn.disabled = state.anonymous;
      saveNow(state);
    });
  }

  // Task 체크리스트
  $root.querySelectorAll('input[type="checkbox"][data-answer]').forEach(el => {
    el.addEventListener('change', e => {
      const key = e.target.dataset.answer;
      state.answers[key] = e.target.checked;
      saveNow(state);
    });
  });

  // Feedback textarea
  $root.querySelectorAll('textarea[data-answer]').forEach(el => {
    el.addEventListener('input', e => {
      const key = e.target.dataset.answer;
      state.answers[key] = e.target.value;
      saveDebounced(state);
    });
  });

  // 단일 선택 라디오
  $root.querySelectorAll('[data-single-answer]').forEach(el => {
    el.addEventListener('change', e => {
      const key = e.target.dataset.singleAnswer;
      state.answers[key] = e.target.value;
      saveNow(state);
    });
  });

  // 다중 선택
  $root.querySelectorAll('[data-multi-answer]').forEach(el => {
    el.addEventListener('change', e => {
      const key = e.target.dataset.multiAnswer;
      const current = Array.isArray(state.answers[key]) ? state.answers[key] : [];
      if (e.target.checked) {
        if (!current.includes(e.target.value)) current.push(e.target.value);
      } else {
        const idx = current.indexOf(e.target.value);
        if (idx > -1) current.splice(idx, 1);
      }
      state.answers[key] = current;
      saveNow(state);
    });
  });

  // 네비게이션
  const $prev = document.getElementById('btn-prev');
  const $next = document.getElementById('btn-next');
  const $close = document.getElementById('btn-close');
  if ($prev) $prev.addEventListener('click', goPrev);
  if ($next) $next.addEventListener('click', goNext);
  if ($close) $close.addEventListener('click', goClose);
}

// ============================================================================
// 네비게이션
// ============================================================================
async function goPrev() {
  if (state.current_step <= 0) return;
  state.current_step -= 1;
  await saveNow(state);
  render();
}

async function goNext() {
  const isLast = state.current_step === TOTAL_SLIDES - 1;
  if (isLast) {
    state.is_completed = true;
    await saveNow(state);
    return;
  }
  if (state.current_step === TOTAL_SLIDES - 2) {
    state.is_completed = true;
  }
  state.current_step += 1;
  await saveNow(state);
  render();
}

async function goClose() {
  state.is_completed = true;
  await saveNow(state);
  $root.innerHTML = `
    <div class="slide-body">
      <div class="slide slide--thanks">
        <div class="thanks-text">
          <div class="thanks-block thanks-block--emphasis"><p>제출 완료</p></div>
          <div class="thanks-block thanks-block--dim"><p>응답이 안전하게 저장되었습니다.</p><p>이 창을 닫으셔도 됩니다.</p></div>
        </div>
      </div>
    </div>
  `;
  $nav.innerHTML = '';
}

// ============================================================================
// 초기화
// ============================================================================
async function init() {
  getOrCreateSessionId();
  const existing = await loadExistingSession();
  if (existing) {
    state.respondent_name = existing.respondent_name || '';
    state.anonymous = !!existing.anonymous;
    state.answers = existing.answers || {};
    state.current_step = existing.current_step || 0;
    state.is_completed = !!existing.is_completed;
  }
  render();
}

if (new URLSearchParams(window.location.search).get('reset') === '1') {
  resetSession();
  window.location.replace(window.location.pathname);
} else {
  init();
}
