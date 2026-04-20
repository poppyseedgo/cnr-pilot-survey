// ============================================================================
// survey-data.js로부터 answer key → 한글 라벨 자동 추출
// ----------------------------------------------------------------------------
// 설계 원칙: 별도 라벨 매핑 파일을 만들지 않음. 설문 데이터가 바뀌면
// 자동으로 라벨도 따라가도록 survey-data의 구조를 직접 파싱.
// ============================================================================

import { SURVEY_SLIDES } from '../survey-data.js';

/**
 * 모든 answer key에 대한 메타 정보를 추출
 * 반환 구조:
 * {
 *   t1_login_success: {
 *     taskLabel: 'Task 1',
 *     taskTitle: 'Microsoft 365 로그인',
 *     questionLabel: '로그인 성공',
 *     type: 'checkbox',
 *   },
 *   q_policy_effect: {
 *     taskLabel: null,
 *     taskTitle: '정책 효과 평가',
 *     questionLabel: '체크인 / 자동취소 / 조기반납 정책이...',
 *     type: 'multi',
 *     options: { very_helpful: '매우 도움이 될 것 같다', ... }
 *   },
 *   ...
 * }
 */
export function buildLabelMap() {
  const map = {};

  for (const slide of SURVEY_SLIDES) {
    if (slide.type === 'task') {
      const taskLabel = slide.taskLabel || '';
      const taskTitle = (slide.title || '').replace(/\n/g, ' ');

      for (const sec of slide.sections || []) {
        // 체크리스트 (일반)
        if (sec.type === 'checklist' || sec.type === 'checklist_small') {
          for (const item of sec.items || []) {
            map[item.key] = {
              taskLabel,
              taskTitle,
              questionLabel: item.label || '',
              type: 'checkbox',
            };
          }
        }
        // 체크리스트 (인라인 뱃지 있는 rich)
        else if (sec.type === 'checklist_rich') {
          for (const item of sec.items || []) {
            let label = item.label || '';
            if (!label && item.parts) {
              // parts 배열을 평문으로 합침
              label = item.parts.map(p => p.value || '').join(' ');
            }
            map[item.key] = {
              taskLabel,
              taskTitle,
              questionLabel: label,
              type: 'checkbox',
            };
          }
        }
        // 체크리스트 (5-1, 5-2 여러 줄 블록)
        else if (sec.type === 'checklist_block') {
          for (const item of sec.items || []) {
            const label = (item.lines || []).join(' ');
            map[item.key] = {
              taskLabel,
              taskTitle,
              questionLabel: label,
              type: 'checkbox',
            };
          }
        }
        // 피드백 (textarea)
        else if (sec.type === 'feedback') {
          map[sec.key] = {
            taskLabel,
            taskTitle,
            questionLabel: (sec.label || '').replace(/\n/g, ' '),
            type: 'text',
          };
        }
      }
    }
    // 객관식 (choice 14,15,16,17)
    else if (slide.type === 'choice') {
      const optMap = {};
      for (const opt of slide.options || []) {
        optMap[opt.value] = opt.label;
      }
      map[slide.key] = {
        taskLabel: null,
        taskTitle: '최종 평가',
        questionLabel: (slide.title || '').replace(/\n/g, ' '),
        type: slide.choiceKind === 'multi' ? 'multi' : 'single',
        options: optMap,
      };
    }
  }

  return map;
}

/**
 * 특정 answer key와 응답값을 "사람이 읽을 수 있는 형태"로 변환
 */
export function formatAnswer(key, value, labelMap) {
  const meta = labelMap[key];
  if (!meta) return String(value);

  if (meta.type === 'checkbox') {
    return value === true ? '✓' : '';
  }
  if (meta.type === 'text') {
    return value || '';
  }
  if (meta.type === 'single') {
    return meta.options?.[value] || String(value);
  }
  if (meta.type === 'multi') {
    if (!Array.isArray(value)) return '';
    return value.map(v => meta.options?.[v] || v).join(', ');
  }
  return String(value);
}
