// ============================================================================
// C&R Space Pilot Survey - Admin Dashboard
// ============================================================================
// 기능: 응답 집계 카드 / 개별 응답 상세 / CSV 내보내기
// 인증: 비밀번호 SHA-256 해시 비교 (소스 노출되어도 원본 불가역)
// ============================================================================

import { SURVEY_SLIDES } from '../survey-data.js';
import { buildLabelMap, formatAnswer } from './labels.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 비밀번호 SHA-256 해시. 평문을 절대 소스코드에 두지 않음 (번들 소스 노출 대비).
// 변경하려면: node -e "console.log(require('crypto').createHash('sha256').update('새비밀번호').digest('hex'))"
// 현재 비밀번호: cnrcnr123!
const PASSWORD_HASH = '63116efc2897032a5bd3da0d60634929051e74a40a2092f0a9d24a5518574f49';

const LS_AUTH_KEY = 'cnr_admin_auth';

// ============================================================================
// 인증
// ============================================================================
async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checkPassword(input) {
  const hash = await sha256(input);
  return hash === PASSWORD_HASH;
}

function isAuthenticated() {
  return sessionStorage.getItem(LS_AUTH_KEY) === '1';
}

function setAuthenticated() {
  sessionStorage.setItem(LS_AUTH_KEY, '1');
}

// ============================================================================
// 데이터 로드 (Supabase)
// ============================================================================
async function fetchAllResponses() {
  const url = `${SUPABASE_URL}/rest/v1/survey_responses?select=*&order=created_at.desc`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  return await res.json();
}

// ============================================================================
// 집계 계산
// ============================================================================
function computeStats(rows) {
  const total = rows.length;
  const completed = rows.filter(r => r.is_completed).length;
  const inProgress = total - completed;
  const completedWithName = rows.filter(r => r.is_completed && !r.anonymous && r.respondent_name).length;
  const completedAnon = rows.filter(r => r.is_completed && r.anonymous).length;

  // 소요시간: created_at ~ updated_at (완료자만)
  const durations = rows
    .filter(r => r.is_completed && r.created_at && r.updated_at)
    .map(r => (new Date(r.updated_at) - new Date(r.created_at)) / 1000 / 60); // 분
  const avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  return { total, completed, inProgress, completedWithName, completedAnon, avgDuration };
}

// ============================================================================
// CSV 내보내기
// ============================================================================
function toCsv(rows, labelMap) {
  // 헤더: 응답자 정보 + 모든 질문 키
  const allKeys = Object.keys(labelMap);
  const header = [
    '세션ID',
    '응답자',
    '익명여부',
    '완료여부',
    '진행단계',
    '시작시각',
    '마지막저장',
    ...allKeys.map(k => {
      const m = labelMap[k];
      const prefix = m.taskLabel ? `[${m.taskLabel}] ` : '[최종평가] ';
      return prefix + m.questionLabel;
    }),
  ];

  // 각 행 구성
  const lines = [header.map(csvEscape).join(',')];
  for (const row of rows) {
    const answers = row.answers || {};
    const line = [
      row.session_id,
      row.respondent_name || '',
      row.anonymous ? '익명' : '',
      row.is_completed ? '완료' : '진행중',
      row.current_step,
      formatDate(row.created_at),
      formatDate(row.updated_at),
      ...allKeys.map(k => formatAnswer(k, answers[k], labelMap)),
    ];
    lines.push(line.map(csvEscape).join(','));
  }

  // Excel이 UTF-8 BOM 필요 (한글 깨짐 방지 - 근본 해결)
  return '\uFEFF' + lines.join('\n');
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function downloadCsv(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================================
// 렌더러
// ============================================================================
const $root = document.getElementById('app');
const $nav = document.getElementById('nav');
const $saveStatus = document.getElementById('save-status');

// 관리자 페이지에서는 기존 nav/save-status 숨김
function hideSurveyUI() {
  if ($nav) $nav.style.display = 'none';
  if ($saveStatus) $saveStatus.style.display = 'none';
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ----------------------------------------------------------------------------
// 인증 화면
// ----------------------------------------------------------------------------
function renderLogin() {
  hideSurveyUI();
  $root.innerHTML = `
    <div class="admin admin--login">
      <div class="admin-login-box">
        <h1 class="admin-login-title">C&amp;R SPACE 관리자</h1>
        <p class="admin-login-desc">비밀번호를 입력하세요</p>
        <form id="admin-login-form" class="admin-login-form">
          <input
            type="password"
            id="admin-password-input"
            class="admin-login-input"
            placeholder="비밀번호"
            autocomplete="current-password"
            autofocus
          />
          <button type="submit" class="admin-btn admin-btn--primary">로그인</button>
        </form>
        <p id="admin-login-error" class="admin-login-error"></p>
      </div>
    </div>
  `;

  const form = document.getElementById('admin-login-form');
  const input = document.getElementById('admin-password-input');
  const errorEl = document.getElementById('admin-login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const ok = await checkPassword(input.value);
    if (ok) {
      setAuthenticated();
      renderDashboard();
    } else {
      errorEl.textContent = '비밀번호가 올바르지 않습니다.';
      input.value = '';
      input.focus();
    }
  });
}

// ----------------------------------------------------------------------------
// 대시보드
// ----------------------------------------------------------------------------
let _cachedData = null;
let _labelMap = null;

async function renderDashboard() {
  hideSurveyUI();
  $root.innerHTML = `
    <div class="admin">
      <div class="admin-header">
        <h1 class="admin-title">C&amp;R SPACE 파일럿 응답</h1>
        <div class="admin-header-actions">
          <button id="btn-refresh" class="admin-btn admin-btn--secondary">새로고침</button>
          <button id="btn-csv" class="admin-btn admin-btn--primary">CSV 다운로드</button>
          <button id="btn-logout" class="admin-btn admin-btn--ghost">로그아웃</button>
        </div>
      </div>
      <div id="admin-content" class="admin-content">
        <div class="admin-loading">데이터 로드 중...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-refresh').addEventListener('click', () => loadAndRender(true));
  document.getElementById('btn-csv').addEventListener('click', handleCsv);
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(LS_AUTH_KEY);
    window.location.hash = '';
    window.location.reload();
  });

  _labelMap = buildLabelMap();
  await loadAndRender();
}

async function loadAndRender(forceRefresh = false) {
  const $content = document.getElementById('admin-content');
  $content.innerHTML = '<div class="admin-loading">데이터 로드 중...</div>';

  try {
    if (forceRefresh || !_cachedData) {
      _cachedData = await fetchAllResponses();
    }
    renderStatsAndList(_cachedData);
  } catch (err) {
    console.error('Admin load error:', err);
    $content.innerHTML = `
      <div class="admin-error">
        <p>데이터 로드 실패</p>
        <pre>${esc(err.message || String(err))}</pre>
      </div>
    `;
  }
}

function renderStatsAndList(rows) {
  const stats = computeStats(rows);
  const $content = document.getElementById('admin-content');

  $content.innerHTML = `
    <div class="admin-stats">
      ${statCard('총 응답자', stats.total, null)}
      ${statCard('완료', stats.completed, `${stats.total ? Math.round(stats.completed / stats.total * 100) : 0}%`)}
      ${statCard('진행 중', stats.inProgress, null)}
      ${statCard('기명 완료', stats.completedWithName, null)}
      ${statCard('익명 완료', stats.completedAnon, null)}
      ${statCard('평균 소요(분)', stats.avgDuration, null)}
    </div>

    ${renderChoiceStats(rows)}

    ${renderFeedbackCollection(rows)}

    <div class="admin-list-section">
      <div class="admin-list-head">
        <h2 class="admin-section-title">응답자 목록</h2>
        <span class="admin-list-count">${rows.length}건</span>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>응답자</th>
              <th>상태</th>
              <th>진행 단계</th>
              <th>시작</th>
              <th>마지막 저장</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((r, i) => renderRow(r, i)).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // 각 행 클릭 → 상세
  $content.querySelectorAll('[data-detail-idx]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(e.currentTarget.dataset.detailIdx);
      showDetail(rows[idx]);
    });
  });
}

function statCard(label, value, sub) {
  return `
    <div class="admin-stat-card">
      <div class="admin-stat-label">${esc(label)}</div>
      <div class="admin-stat-value">${esc(value)}</div>
      ${sub ? `<div class="admin-stat-sub">${esc(sub)}</div>` : ''}
    </div>
  `;
}

// ============================================================================
// 객관식 통계 섹션 (슬라이드 14, 15, 16, 17번)
// ----------------------------------------------------------------------------
// - 단일 선택(single): 한 명당 1표
// - 다중 선택(multi): 한 명당 여러 표 가능 → 응답자 대비 선택률(%) 계산
// - 분모: "해당 질문에 응답한 사람 수" (응답 안 한 사람 제외)
// ============================================================================
function renderChoiceStats(rows) {
  // survey-data에서 choice 타입 슬라이드 추출
  const choiceSlides = SURVEY_SLIDES.filter(s => s.type === 'choice');
  if (choiceSlides.length === 0) return '';

  const sectionsHtml = choiceSlides.map(slide => {
    const key = slide.key;
    const isMulti = slide.choiceKind === 'multi';

    // 해당 질문에 응답한 사람만 필터링
    const respondents = rows.filter(r => {
      const ans = r.answers?.[key];
      if (isMulti) return Array.isArray(ans) && ans.length > 0;
      return ans != null && ans !== '';
    });
    const respondentCount = respondents.length;

    // 각 옵션별 카운트
    const counts = {};
    for (const opt of slide.options) counts[opt.value] = 0;

    for (const r of respondents) {
      const ans = r.answers[key];
      if (isMulti && Array.isArray(ans)) {
        for (const v of ans) {
          if (counts[v] != null) counts[v]++;
        }
      } else if (!isMulti && counts[ans] != null) {
        counts[ans]++;
      }
    }

    // 정렬: 카운트 내림차순
    const sortedOptions = [...slide.options].sort(
      (a, b) => counts[b.value] - counts[a.value]
    );

    // 최대값 (막대 너비 기준)
    const maxCount = Math.max(1, ...Object.values(counts));

    const barsHtml = sortedOptions.map(opt => {
      const count = counts[opt.value];
      const pct = respondentCount > 0 ? Math.round(count / respondentCount * 100) : 0;
      const barWidth = (count / maxCount) * 100;
      return `
        <div class="admin-chart-row">
          <div class="admin-chart-label">${esc(opt.label)}</div>
          <div class="admin-chart-bar-wrap">
            <div class="admin-chart-bar" style="width: ${barWidth}%"></div>
            <span class="admin-chart-value">${count}명 <span class="admin-chart-pct">(${pct}%)</span></span>
          </div>
        </div>
      `;
    }).join('');

    const kindLabel = isMulti ? '복수 선택' : '단일 선택';
    const title = (slide.title || '').replace(/\n/g, ' ');

    return `
      <div class="admin-chart-section">
        <div class="admin-chart-head">
          <h3 class="admin-chart-title">${esc(title)}</h3>
          <div class="admin-chart-meta">
            <span class="admin-chart-kind">${kindLabel}</span>
            <span class="admin-chart-count">응답자 ${respondentCount}명</span>
          </div>
        </div>
        ${respondentCount > 0
          ? `<div class="admin-chart-bars">${barsHtml}</div>`
          : `<div class="admin-muted admin-chart-empty">아직 응답이 없습니다.</div>`}
      </div>
    `;
  }).join('');

  return `
    <div class="admin-section admin-section--choices">
      <div class="admin-section-header">
        <h2 class="admin-section-title">최종 평가 응답 통계</h2>
        <span class="admin-section-sub">문항 14~17 · 전체 응답자 분포</span>
      </div>
      <div class="admin-chart-list">
        ${sectionsHtml}
      </div>
    </div>
  `;
}

// ============================================================================
// 서술형 피드백 모음 섹션 (Task 3, 5-1, 6, 7의 feedback textarea)
// ----------------------------------------------------------------------------
// - 공백/null 응답은 제외
// - Task별로 그룹핑하여 카드로 나열
// - 응답자 이름(또는 익명) + 응답 시각 표시
// ============================================================================
function renderFeedbackCollection(rows) {
  // survey-data에서 모든 feedback 섹션 키 + 라벨 추출
  const feedbackMeta = []; // [{key, taskLabel, taskTitle, label}]
  for (const slide of SURVEY_SLIDES) {
    if (slide.type !== 'task') continue;
    for (const sec of slide.sections || []) {
      if (sec.type === 'feedback') {
        feedbackMeta.push({
          key: sec.key,
          taskLabel: slide.taskLabel,
          taskTitle: (slide.title || '').replace(/\n/g, ' '),
          label: (sec.label || '').replace(/\n/g, ' '),
        });
      }
    }
  }

  if (feedbackMeta.length === 0) return '';

  // 각 피드백별로 실제 응답이 있는 항목 수집
  const sectionsHtml = feedbackMeta.map(meta => {
    const entries = [];
    for (const r of rows) {
      const ans = r.answers?.[meta.key];
      if (ans && String(ans).trim()) {
        entries.push({
          name: r.anonymous ? '익명' : (r.respondent_name || '(미입력)'),
          text: String(ans).trim(),
          updated_at: r.updated_at,
        });
      }
    }

    // 최신순 정렬
    entries.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const entriesHtml = entries.length > 0
      ? entries.map(e => `
          <div class="admin-feedback-item">
            <div class="admin-feedback-meta">
              <span class="admin-feedback-name">${esc(e.name)}</span>
              <span class="admin-feedback-time">${esc(formatDate(e.updated_at))}</span>
            </div>
            <div class="admin-feedback-text">${esc(e.text).replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')
      : `<div class="admin-muted admin-feedback-empty">아직 응답이 없습니다.</div>`;

    return `
      <div class="admin-feedback-section">
        <div class="admin-feedback-head">
          <h3 class="admin-feedback-title">
            <span class="admin-feedback-task">${esc(meta.taskLabel)}</span>
            ${esc(meta.taskTitle)}
          </h3>
          <div class="admin-feedback-question">"${esc(meta.label)}"</div>
          <span class="admin-feedback-count">${entries.length}건 응답</span>
        </div>
        <div class="admin-feedback-list">
          ${entriesHtml}
        </div>
      </div>
    `;
  }).join('');

  // 전체 응답 수
  const totalFeedbacks = feedbackMeta.reduce((sum, meta) => {
    return sum + rows.filter(r => {
      const ans = r.answers?.[meta.key];
      return ans && String(ans).trim();
    }).length;
  }, 0);

  return `
    <div class="admin-section admin-section--feedback">
      <div class="admin-section-header">
        <h2 class="admin-section-title">서술형 피드백 모음</h2>
        <span class="admin-section-sub">총 ${totalFeedbacks}건 · Task 3 · 5-1 · 6 · 7</span>
      </div>
      <div class="admin-feedback-sections">
        ${sectionsHtml}
      </div>
    </div>
  `;
}

function renderRow(r, idx) {
  const name = r.anonymous ? '익명' : (r.respondent_name || '(미입력)');
  const status = r.is_completed
    ? '<span class="admin-badge admin-badge--done">완료</span>'
    : '<span class="admin-badge admin-badge--progress">진행중</span>';
  const step = `${r.current_step + 1} / ${SURVEY_SLIDES.length}`;
  return `
    <tr>
      <td>${esc(name)}</td>
      <td>${status}</td>
      <td>${esc(step)}</td>
      <td>${esc(formatDate(r.created_at))}</td>
      <td>${esc(formatDate(r.updated_at))}</td>
      <td><button class="admin-btn admin-btn--mini" data-detail-idx="${idx}">상세</button></td>
    </tr>
  `;
}

// ----------------------------------------------------------------------------
// 상세 모달
// ----------------------------------------------------------------------------
function showDetail(row) {
  const name = row.anonymous ? '익명 응답자' : (row.respondent_name || '(미입력)');
  const answers = row.answers || {};

  // answers를 Task별로 그룹핑
  const groups = {};
  for (const [key, value] of Object.entries(answers)) {
    const meta = _labelMap[key];
    if (!meta) continue;
    const groupKey = meta.taskLabel ? `${meta.taskLabel} · ${meta.taskTitle}` : meta.taskTitle;
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push({ key, value, meta });
  }

  const groupsHtml = Object.entries(groups).map(([gname, items]) => `
    <div class="admin-detail-group">
      <h3 class="admin-detail-group-title">${esc(gname)}</h3>
      <div class="admin-detail-items">
        ${items.map(it => renderDetailItem(it)).join('')}
      </div>
    </div>
  `).join('');

  const modal = document.createElement('div');
  modal.className = 'admin-modal-overlay';
  modal.innerHTML = `
    <div class="admin-modal">
      <div class="admin-modal-head">
        <h2 class="admin-modal-title">${esc(name)}</h2>
        <button class="admin-modal-close" aria-label="닫기">×</button>
      </div>
      <div class="admin-modal-meta">
        <div>상태: ${row.is_completed ? '완료' : `진행중 (${row.current_step + 1}/${SURVEY_SLIDES.length})`}</div>
        <div>시작: ${esc(formatDate(row.created_at))}</div>
        <div>마지막 저장: ${esc(formatDate(row.updated_at))}</div>
        <div>세션 ID: <code>${esc(row.session_id)}</code></div>
      </div>
      <div class="admin-modal-body">
        ${groupsHtml || '<p class="admin-muted">응답 없음</p>'}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.admin-modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  const escHandler = (e) => {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
  };
  document.addEventListener('keydown', escHandler);
}

function renderDetailItem({ key, value, meta }) {
  const label = meta.questionLabel;

  if (meta.type === 'checkbox') {
    const checked = value === true;
    return `
      <div class="admin-detail-item">
        <span class="admin-check-indicator ${checked ? 'admin-check-indicator--checked' : ''}">
          ${checked ? '✓' : ''}
        </span>
        <span class="admin-detail-label">${esc(label)}</span>
      </div>
    `;
  }
  if (meta.type === 'text') {
    const hasValue = value && String(value).trim();
    return `
      <div class="admin-detail-item admin-detail-item--text">
        <div class="admin-detail-label">${esc(label)}</div>
        <div class="admin-detail-text ${hasValue ? '' : 'admin-muted'}">
          ${hasValue ? esc(value).replace(/\n/g, '<br>') : '(응답 없음)'}
        </div>
      </div>
    `;
  }
  if (meta.type === 'single') {
    return `
      <div class="admin-detail-item admin-detail-item--choice">
        <div class="admin-detail-label">${esc(label)}</div>
        <div class="admin-detail-value">→ ${esc(meta.options?.[value] || value)}</div>
      </div>
    `;
  }
  if (meta.type === 'multi') {
    const list = Array.isArray(value) ? value : [];
    return `
      <div class="admin-detail-item admin-detail-item--choice">
        <div class="admin-detail-label">${esc(label)}</div>
        <ul class="admin-detail-list">
          ${list.length
            ? list.map(v => `<li>${esc(meta.options?.[v] || v)}</li>`).join('')
            : '<li class="admin-muted">(선택 없음)</li>'}
        </ul>
      </div>
    `;
  }
  return '';
}

// ----------------------------------------------------------------------------
// CSV 다운로드 핸들러
// ----------------------------------------------------------------------------
function handleCsv() {
  if (!_cachedData || !_labelMap) return;
  const csv = toCsv(_cachedData, _labelMap);
  const ts = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  downloadCsv(csv, `cnr-pilot-responses-${ts}.csv`);
}

// ============================================================================
// 진입점
// ============================================================================
export function bootAdmin() {
  if (isAuthenticated()) {
    renderDashboard();
  } else {
    renderLogin();
  }
}
