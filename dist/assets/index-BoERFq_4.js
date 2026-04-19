(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))r(l);new MutationObserver(l=>{for(const i of l)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function s(l){const i={};return l.integrity&&(i.integrity=l.integrity),l.referrerPolicy&&(i.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?i.credentials="include":l.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(l){if(l.ep)return;l.ep=!0;const i=s(l);fetch(l.href,i)}})();const L=[{id:"s1_intro",type:"intro",title:"C&R SPACE",subtitle:"파일럿 테스트",description:"회의실 예약 시스템 정식 오픈 전, 실사용자 집단의 응답을 수집하는 필수 검증 단계입니다.",meta:[{label:"소요 시간",value:"15 — 20 min"},{label:"총 Task 수",value:"07"},{label:"자동 저장",value:"실시간"}],nextLabel:"테스트 시작하기"},{id:"s2_respondent",type:"form",title:"개인식별 또는 익명 선택",fields:[{key:"respondent_name",type:"text",label:"이름 또는 부서명을 작성해 주세요.",placeholder:"예: 홍길동 / 경영기획팀"},{key:"anonymous",type:"single_checkbox",label:"익명으로 참여할게요"}]},{id:"s2_guide",type:"notice",title:"브라우저에서 cnr-space.pages.dev 접속 후",subtitle:"7개의 Task를 순서대로 수행해 주세요."},{id:"s3_task1",type:"task",taskLabel:"Task 1",title:"Microsoft 365 로그인",description:"회사에서 부여한 C&R Microsoft 365 아이디(@cnrres.com)로 로그인 합니다.",sections:[{heading:"기능이 작동 했다면 체크박스를 모두 체크해주세요!",items:[{key:"t1_login_success",label:"로그인 성공"},{key:"t1_profile_visible",label:"상단 프로필 영역에 내 이름 확인"}]}]},{id:"s3_task2_1",type:"task",taskLabel:"Task 2-1",title:"홈 화면 경험",description:"실시간 회의실 이용 상태를 한눈에 파악할 수 있는지 확인합니다.",sections:[{heading:"홈 화면에서 아래 기능을 확인하세요.",items:[{key:"t2_1_available_room",label:"실시간 현황(홈 화면)에서 [예약가능] 회의실 확인"},{key:"t2_1_in_use_end_time",label:"[사용중] 회의실의 종료 시각 확인"},{key:"t2_1_capacity_6plus",label:"6인 이상 수용 가능한 회의실 확인"}]},{heading:"홈 화면에서 아래 요소들을 확인하세요.",items:[{key:"t2_1_status_filter",label:"회의실 상태 필터 (전체/예약가능/사용중)"},{key:"t2_1_room_info",label:"회의실별 현재 사용 정보와 다음 예약 정보"},{key:"t2_1_floor_filter",label:"층별 필터 (1층~6층)"},{key:"t2_1_search",label:"회의실 검색 기능 작동 확인"},{key:"t2_1_detail_spec",label:"회의실 개별 상세 스펙 및 당일 예약 현황"}]}]},{id:"s3_task2_2",type:"task",taskLabel:"Task 2-2",title:"캘린더 뷰 경험",description:"일 Daily Timeline View / 주 Weekly / 월 Monthly 3종 캘린더 뷰타입 확인",sections:[{heading:"기능이 작동 했다면 체크박스를 체크해주세요!",items:[{key:"t2_2_date_navigation",label:"날짜 이동하며 회의실 별 예약현황 확인"},{key:"t2_2_slot_click_book",label:"비어있는 슬롯(시간) 클릭 하여 바로 예약화면 진입"},{key:"t2_2_my_booking_filter",label:"전체 예약 현황 중 내 예약만 볼 수 있는 기능 확인"}]}]},{id:"s3_task3",type:"task",taskLabel:"Task 3",title:"1분 내 예약 경험",sections:[{heading:"예약 플로우 체크",items:[{key:"t3_entry_point",label:"홈 화면 <예약 버튼> 또는 캘린더 뷰 <빈 시간 슬롯> 선택"},{key:"t3_title_input",label:"회의 제목을 입력"},{key:"t3_today_selected",label:"이미 선택된 오늘 날짜 확인"},{key:"t3_book_complete",label:"예약 가능한 회의실 선택 후 예약완료"}]},{heading:"예약 정책 확인",items:[{key:"t3_hours_7_19",label:"예약 가능 시간 - 오전 7시 ~ 오후 7시"},{key:"t3_15min_unit",label:"15분 단위 예약 가능 (ZOOM 예약 시간 정책과 동일)"},{key:"t3_auto_current_time",label:"현재 시간 기준 자동으로 예약 가능한 시간으로 설정됨"},{key:"t3_auto_filter_rooms",label:"선택 시간대에 예약 가능한 회의실 자동 필터링"},{key:"t3_1month_limit",label:"예약 가능 기간 - 오늘부터 1개월 이내 (선점 예약 방어)"},{key:"t3_email_notify",label:"예약 알림 메일 수신"}]}],openFeedback:{key:"t3_feedback",label:"예약 경험 추가 의견이 있으신가요?",placeholder:"필요하신 기능에 대해 적극적인 의견 부탁드립니다."}},{id:"s3_task4",type:"task",taskLabel:"Task 4",title:"예약 변경 및 취소",sections:[{heading:"예약 수정 플로우",items:[{key:"t4_enter_detail",label:"Task 4에서 생성한 예약 클릭 후 예약상세 진입"},{key:"t4_edit_mode",label:"<변경> 버튼을 눌러 수정 모드로 진입"},{key:"t4_change_time_title",label:"시간 또는 제목을 자유롭게 변경해 봅니다"},{key:"t4_add_attendee",label:"동료에게 동의를 구한 후, 참석자로 동료를 추가해 보세요"},{key:"t4_save",label:"변경 사항을 저장합니다"}]},{heading:"Check!",items:[{key:"t4_change_email",label:"변경 알림 메일 수신"},{key:"t4_attendee_search",label:"참석자 추가시 팀즈와 동일한 이름으로 검색"},{key:"t4_attendee_email",label:"참석자로 추가한 동료에게도 메일 알림"}]}]},{id:"s3_task5_1",type:"task",taskLabel:"Task 5-1 미체크인 노쇼처리",title:"체크인 그리고 노쇼 자동취소 정책 이해",description:"현재 시각 기준 10분 이내 시작되는 예약을 하나 만드세요.",sections:[{heading:"노쇼 처리 플로우",items:[{key:"t5_1_start_email",label:"예약 시간이 시작되면 회의 시작을 알리는 <체크인 하세요> 메일이 수신됩니다."},{key:"t5_1_checkin_active",label:"오늘 내 예약 화면에서 <체크인>버튼이 활성화 됩니다."},{key:"t5_1_ignore_checkin",label:"활성화된 체크인 버튼을 누르지 않고 계속 동안 방치합니다."},{key:"t5_1_pending_label",label:"홈 화면에 내가 예약한 회의실 상태가 <사용중> 상태로, <체크인 대기> 라벨이 표시되고 있음을 확인 합니다."},{key:"t5_1_5min_warning",label:"사용시간 5분이 흐르면 미체크인 경고 메일을 수신합니다."},{key:"t5_1_10min_cancel",label:"사용시간 시작 후 10분 동안 체크인 하지 않으면 해당 예약을 시스템이 자동취소 합니다."},{key:"t5_1_noshow_status",label:"미체크인 예약이 <노쇼> 처리되어 화면에 남습니다."},{key:"t5_1_noshow_email",label:"<노쇼> 되었음을 알리는 메일을 수신합니다."}]}],policyNote:['C&R SPACE는 예약 시작 시각으로부터 10분 이내에 체크인이 없으면 예약을 자동으로 취소합니다. 자동 취소된 회의실은 즉시 다른 동료가 사용할 수 있도록 예약가능 상태로 전환됩니다. 이 정책은 "예약만 하고 사용하지 않는" 사내 회의실 낭비를 줄이기 위한 핵심 장치입니다.',"체크인 누르고 노쇼...할 경우 아이디 정지 및 패널티 부여 정책 검토중"],openFeedback:{key:"t5_1_feedback",label:"체크인 기능과 노쇼 자동취소 기능에 대한 의견이 있으신가요?",placeholder:"필요하신 기능에 대해 적극적인 의견 부탁드립니다."}},{id:"s3_task5_2",type:"task",taskLabel:"Task 5-2 체크인 후 조기반납 하기",title:"조기반납 하기",description:"현재 시각 기준 10분 이내 시작되는 예약을 하나 더 만드세요.",sections:[{heading:"조기반납 플로우",items:[{key:"t5_2_start_email",label:"예약 시간이 시작되면 회의 시작을 알리는 <체크인 하세요> 메일이 수신됩니다."},{key:"t5_2_click_checkin",label:"활성화 된 <체크인>버튼을 누릅니다."},{key:"t5_2_early_end_active",label:"<체크인>을 누르면 <조기 반납>버튼이 활성화 됩니다."},{key:"t5_2_early_end_return",label:"회의를 1분 정도 진행한 뒤, 활성화 된 <조기 반납> 버튼을 클릭하세요. 사용중이던 회의실 예약이 즉시 종료, 바로 시스템으로 반납됩니다."},{key:"t5_2_email_notify",label:"조기 반납 알림 메일 수신"}]}]},{id:"s3_task6",type:"task",taskLabel:"Task 6",title:"에메랄드 승인 요청",sections:[{heading:"승인 예약 플로우",items:[{key:"t6_select_emerald",label:"예약 화면에서 비어있는 시간을 찾아 2F Emerald 선택"},{key:"t6_request_approval",label:"<승인 요청> 버튼 클릭"},{key:"t6_pending_status",label:"<승인 대기>상태로 생성된 예약 확인"},{key:"t6_approved_email",label:"관리자가 승인하면 <승인 완료> 메일 수신"},{key:"t6_status_confirmed",label:"<승인 완료> 변경된 예약상태 확인"}]}],openFeedback:{key:"t6_feedback",label:"에메랄드 룸 승인 기능에 대한 의견을 들려주세요.",placeholder:"필요하신 기능에 대해 적극적인 의견 부탁드립니다."}},{id:"s3_task7",type:"task",taskLabel:"Task 7",title:"MY PAGE 탐색",description:"상단 프로필 클릭 후, My page 진입. 나의 과거, 현재, 미래의 예약을 모두 모아 볼 수 있는 페이지로 현재는 베타버전이 적용되어 있습니다.",sections:[{heading:"현재 구현된 기능 체크",items:[{key:"t7_month_count",label:"이번 달 예약 건수"},{key:"t7_checkin_rate",label:"체크인 율(%)"},{key:"t7_monthly_stats",label:"월별 이용 통계"},{key:"t7_top_room",label:"가장 많이 사용한 회의실"},{key:"t7_date_filter",label:"기간별 예약 조회 및 필터링"},{key:"t7_booking_detail",label:"개별 예약 상세 확인"}]}],openFeedback:{key:"t7_feedback",label:"마이 페이지에 더 원하는 기능이 있다면 상세하게 의견을 남겨주세요!",placeholder:"필요하신 기능에 대해 적극적인 의견 부탁드립니다."}},{id:"s4_wrap_intro",type:"notice",title:"테스트는 다 완료 되었습니다!",subtitle:"몇 가지 간단한 질문만 남았습니다. 응답 부탁드려요!"},{id:"s4_policy_effect",type:"multi_choice",title:"체크인 / 자동취소 / 조기반납 정책이 사내 회의실 가용률 상승에 도움이 될 것이라 생각하시나요?",hint:"모두 선택해 주세요.",key:"q_policy_effect",options:[{value:"very_helpful",label:"매우 도움이 될 것 같다"},{value:"somewhat_helpful",label:"지금보다는 도움이 될거라 예상한다"},{value:"workaround_risk",label:"정책을 피해가는 사람들이 있을 것 같다"},{value:"need_stronger",label:"더 강력한 제재가 필요하다"},{value:"no_effect",label:"효과 없다"}]},{id:"s4_teams_pref",type:"single_choice",title:"회의실 예약 관련 알림을 Teams 메신저로 받는다면 더 편리하다 생각하시나요?",key:"q_teams_preference",options:[{value:"very_convenient",label:"매우 편리할 것 같다"},{value:"normal",label:"보통이다"},{value:"not_convenient",label:"그닥 편리하지 않을 것 같다"},{value:"email_better",label:"메일이 더 편리하다"}]},{id:"s4_favorite",type:"multi_choice",title:"가장 마음에 드는 기능이 있다면?",hint:"모두 선택해 주세요.",key:"q_favorite_features",options:[{value:"realtime_status",label:"홈 화면 실시간 회의실 상태"},{value:"calendar_views",label:"다양한 캘린더 뷰"},{value:"quick_booking",label:"빠른 예약"},{value:"emerald_approval",label:"에메랄드룸 예약 승인 플로우"},{value:"noshow_prevention",label:"노쇼 방지 기능"},{value:"attendee_notify",label:"참석자 추가 및 자동 알림"}]},{id:"s4_satisfaction",type:"single_choice",title:"신규 회의실 서비스 종합 만족도 평가",key:"q_overall_satisfaction",options:[{value:"very_helpful",label:"매우 도움이 될 것 같다"},{value:"helpful",label:"도움이 될 것 같다"},{value:"normal",label:"보통이다"},{value:"not_helpful",label:"별로 도움이 안 될 것 같다"},{value:"no_effect",label:"효과 없다"}]},{id:"s4_thanks",type:"thanks",title:"테스트가 모두 완료되었습니다!",description:"오늘 전달해 주신 의견을 반영하여 4월 22일 수요일 오픈 후 시범 운영 기간동안 더 개선하도록 하겠습니다. ZOOM 예약, 포인터 예약 등 더 확장된 기능도 기대해주세요. 참여해 주셔서 진심으로 감사드립니다.",closeLabel:"닫기"}],m=L.length,A="https://jaogvmlhmxoexurwxqbf.supabase.co",E="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imphb2d2bWxobXhvZXh1cnd4cWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTY1NzgsImV4cCI6MjA5MDE5MjU3OH0.VaPbvEkD6vaBKUjG7VjM4OB_1oiMXFgpK0q45oF0r74",h="cnr_pilot_session_id",$="cnr_pilot_backup";function T(){let e=localStorage.getItem(h);return e||(e=crypto.randomUUID(),localStorage.setItem(h,e)),e}function N(){localStorage.removeItem(h),localStorage.removeItem($)}function C(e){try{localStorage.setItem($,JSON.stringify(e))}catch(n){console.warn("localStorage 백업 실패",n)}}function q(){try{const e=localStorage.getItem($);return e?JSON.parse(e):null}catch{return null}}async function O(e,n,s,r={}){const l=await fetch(`${A}/rest/v1/${n}`,{method:e,headers:{apikey:E,Authorization:`Bearer ${E}`,"Content-Type":"application/json",Prefer:"return=representation",...r},body:s?JSON.stringify(s):void 0});if(!l.ok){const o=await l.text();throw new Error(`Supabase ${l.status}: ${o}`)}const i=await l.text();return i?JSON.parse(i):null}let _=null,v=!1,k=null;const g=new Set;function F(e){return g.add(e),()=>g.delete(e)}function f(e){g.forEach(n=>n(e))}async function w(e){v=!0,f("saving"),C(e);const s={session_id:T(),respondent_name:e.anonymous?null:e.respondent_name||null,anonymous:!!e.anonymous,answers:e.answers||{},current_step:e.current_step||0,is_completed:!!e.is_completed,user_agent:navigator.userAgent.substring(0,500)};try{await O("POST","survey_responses",s,{Prefer:"resolution=merge-duplicates,return=minimal"}),f("saved")}catch(r){console.error("서버 저장 실패 (localStorage 백업은 유지됨)",r),f("error")}finally{if(v=!1,k){const r=k;k=null,w(r)}}}function I(e,n=500){_&&clearTimeout(_),_=setTimeout(()=>{v?k=e:w(e)},n)}function p(e){return _&&(clearTimeout(_),_=null),v?(k=e,Promise.resolve()):w(e)}async function P(){const e=localStorage.getItem(h);if(!e)return null;try{const n=await O("GET",`survey_responses?session_id=eq.${e}&select=*`);if(n&&n.length>0)return n[0]}catch(n){console.warn("세션 복구 실패, localStorage 백업 사용",n)}return q()}const t={current_step:0,respondent_name:"",anonymous:!1,answers:{},is_completed:!1},u=document.getElementById("app"),M=document.getElementById("progress-bar");document.getElementById("progress-label");const y=document.getElementById("save-status");function a(e){return e==null?"":String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}F(e=>{if(!y)return;const n={idle:"",saving:"저장 중...",saved:"✓ 저장됨",error:"⚠ 저장 실패 (기기에 백업됨)"};y.textContent=n[e]||"",y.className=`save-status save-status--${e}`,e==="saved"&&setTimeout(()=>{y.textContent==="✓ 저장됨"&&(y.textContent="")},2e3)});function B(){const e=t.current_step/(m-1)*100;M.style.width=`${e}%`}function j(e){switch(e.type){case"intro":return J(e);case"form":return U(e);case"notice":return H(e);case"task":return R(e);case"single_choice":return Y(e);case"multi_choice":return D(e);case"thanks":return K(e);default:return`<div>Unknown slide: ${e.type}</div>`}}function J(e){const n=e.meta.map(s=>`
    <div class="meta-item">
      <div class="meta-label">${a(s.label)}</div>
      <div class="meta-value">${a(s.value)}</div>
    </div>
  `).join("");return`
    <div class="slide slide--intro">
      <div class="intro-head">
        <h1 class="intro-title">${a(e.title)}</h1>
        <p class="intro-subtitle">${a(e.subtitle)}</p>
      </div>
      <p class="intro-desc">${a(e.description)}</p>
      <div class="meta-list">${n}</div>
    </div>
  `}function U(e){const n=e.fields.map(s=>s.type==="text"?`
        <div class="field">
          <label class="field-label" for="${a(s.key)}">${a(s.label)}</label>
          <input
            type="text"
            id="${a(s.key)}"
            data-field="${a(s.key)}"
            class="text-input"
            placeholder="${a(s.placeholder||"")}"
            value="${a(t.respondent_name||"")}"
            ${t.anonymous?"disabled":""}
          />
        </div>
      `:s.type==="single_checkbox"?`
        <label class="checkbox-row">
          <input
            type="checkbox"
            data-single-check="${a(s.key)}"
            ${t.anonymous?"checked":""}
          />
          <span class="check-box" aria-hidden="true"></span>
          <span class="check-label">${a(s.label)}</span>
        </label>
      `:"").join("");return`
    <div class="slide slide--form">
      <h2 class="slide-title">${a(e.title)}</h2>
      <div class="form-fields">${n}</div>
    </div>
  `}function H(e){return`
    <div class="slide slide--notice">
      <h2 class="notice-title">${a(e.title)}</h2>
      ${e.subtitle?`<p class="notice-subtitle">${a(e.subtitle)}</p>`:""}
    </div>
  `}function R(e){const n=e.sections.map(l=>`
    <div class="task-section">
      <p class="section-heading">${a(l.heading)}</p>
      <div class="checklist">
        ${l.items.map(i=>`
          <label class="checkbox-row">
            <input
              type="checkbox"
              data-answer="${a(i.key)}"
              ${t.answers[i.key]?"checked":""}
            />
            <span class="check-box" aria-hidden="true"></span>
            <span class="check-label">${a(i.label)}</span>
          </label>
        `).join("")}
      </div>
    </div>
  `).join(""),s=e.policyNote?`
    <div class="policy-note">
      ${e.policyNote.map(l=>`<p>${a(l)}</p>`).join("")}
    </div>
  `:"",r=e.openFeedback?`
    <div class="feedback-block">
      <label class="field-label" for="${a(e.openFeedback.key)}">
        ${a(e.openFeedback.label)}
      </label>
      <textarea
        id="${a(e.openFeedback.key)}"
        data-answer="${a(e.openFeedback.key)}"
        data-textarea
        class="textarea-input"
        placeholder="${a(e.openFeedback.placeholder)}"
        rows="4"
      >${a(t.answers[e.openFeedback.key]||"")}</textarea>
    </div>
  `:"";return`
    <div class="slide slide--task">
      <div class="task-head">
        <span class="task-pill">${a(e.taskLabel)}</span>
        <h2 class="task-title">${a(e.title)}</h2>
        ${e.description?`<p class="task-desc">${a(e.description)}</p>`:""}
      </div>
      ${n}
      ${s}
      ${r}
    </div>
  `}function Y(e){const n=e.options.map(s=>`
    <label class="radio-row">
      <input
        type="radio"
        name="${a(e.key)}"
        value="${a(s.value)}"
        data-single-answer="${a(e.key)}"
        ${t.answers[e.key]===s.value?"checked":""}
      />
      <span class="check-box" aria-hidden="true"></span>
      <span class="check-label">${a(s.label)}</span>
    </label>
  `).join("");return`
    <div class="slide slide--choice">
      <h2 class="slide-title">${a(e.title)}</h2>
      ${e.hint?`<p class="slide-hint">${a(e.hint)}</p>`:""}
      <div class="choices">${n}</div>
    </div>
  `}function D(e){const n=Array.isArray(t.answers[e.key])?t.answers[e.key]:[],s=e.options.map(r=>`
    <label class="checkbox-row">
      <input
        type="checkbox"
        data-multi-answer="${a(e.key)}"
        value="${a(r.value)}"
        ${n.includes(r.value)?"checked":""}
      />
      <span class="check-box" aria-hidden="true"></span>
      <span class="check-label">${a(r.label)}</span>
    </label>
  `).join("");return`
    <div class="slide slide--choice">
      <h2 class="slide-title">${a(e.title)}</h2>
      ${e.hint?`<p class="slide-hint">${a(e.hint)}</p>`:""}
      <div class="choices">${s}</div>
    </div>
  `}function K(e){return`
    <div class="slide slide--thanks">
      <h2 class="thanks-title">${a(e.title)}</h2>
      <p class="thanks-desc">${a(e.description)}</p>
    </div>
  `}function z(e){const n=t.current_step===0,s=t.current_step===m-1;return e.type==="intro"?`
      <div class="nav nav--single">
        <button type="button" id="btn-next" class="btn btn--primary">
          ${a(e.nextLabel||"다음")}
        </button>
      </div>
    `:e.type==="thanks"?`
      <div class="nav nav--single">
        <button type="button" id="btn-close" class="btn btn--primary">
          ${a(e.closeLabel||"닫기")}
        </button>
      </div>
    `:`
    <div class="nav nav--dual">
      <button type="button" id="btn-prev" class="btn btn--secondary" ${n?"disabled":""}>
        이전
      </button>
      <button type="button" id="btn-next" class="btn btn--primary">
        ${s?"제출":"다음"}
      </button>
    </div>
  `}function S(){const e=L[t.current_step];u.innerHTML=`
    ${j(e)}
    ${z(e)}
  `,B(),V(),window.scrollTo({top:0,behavior:"instant"})}function V(e){const n=u.querySelector('[data-field="respondent_name"]');n&&n.addEventListener("input",o=>{t.respondent_name=o.target.value,I(t)});const s=u.querySelector('[data-single-check="anonymous"]');s&&s.addEventListener("change",o=>{t.anonymous=o.target.checked;const c=u.querySelector('[data-field="respondent_name"]');c&&(c.disabled=t.anonymous),p(t)}),u.querySelectorAll("[data-answer]:not([data-textarea])").forEach(o=>{o.type==="checkbox"&&o.addEventListener("change",c=>{const d=c.target.dataset.answer;t.answers[d]=c.target.checked,p(t)})}),u.querySelectorAll("textarea[data-answer]").forEach(o=>{o.addEventListener("input",c=>{const d=c.target.dataset.answer;t.answers[d]=c.target.value,I(t)})}),u.querySelectorAll("[data-single-answer]").forEach(o=>{o.addEventListener("change",c=>{const d=c.target.dataset.singleAnswer;t.answers[d]=c.target.value,p(t)})}),u.querySelectorAll("[data-multi-answer]").forEach(o=>{o.addEventListener("change",c=>{const d=c.target.dataset.multiAnswer,b=Array.isArray(t.answers[d])?t.answers[d]:[];if(c.target.checked)b.includes(c.target.value)||b.push(c.target.value);else{const x=b.indexOf(c.target.value);x>-1&&b.splice(x,1)}t.answers[d]=b,p(t)})});const r=document.getElementById("btn-prev"),l=document.getElementById("btn-next"),i=document.getElementById("btn-close");r&&r.addEventListener("click",X),l&&l.addEventListener("click",Z),i&&i.addEventListener("click",G)}async function X(){t.current_step<=0||(t.current_step-=1,await p(t),S())}async function Z(){if(t.current_step===m-1){t.is_completed=!0,await p(t);return}t.current_step===m-2&&(t.is_completed=!0),t.current_step+=1,await p(t),S()}async function G(){t.is_completed=!0,await p(t),u.innerHTML=`
    <div class="slide slide--thanks">
      <h2 class="thanks-title">제출 완료</h2>
      <p class="thanks-desc">응답이 안전하게 저장되었습니다.<br>이 창을 닫으셔도 됩니다.</p>
    </div>
  `}async function W(){T();const e=await P();e&&(t.respondent_name=e.respondent_name||"",t.anonymous=!!e.anonymous,t.answers=e.answers||{},t.current_step=e.current_step||0,t.is_completed=!!e.is_completed),S()}new URLSearchParams(window.location.search).get("reset")==="1"?(N(),window.location.replace(window.location.pathname)):W();
