(() => {
  "use strict";

  const page = document.body.dataset.page || "home";

  const icon = (name) => {
    const icons = {
      bone: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 18a7 7 0 1 1-8-10 7 7 0 0 1 10 8l16 16a7 7 0 1 1 8 10 7 7 0 0 1-10-8L14 18Z"/></svg>',
      shield: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5 41 11v12c0 10-6.7 17.5-17 21C13.7 40.5 7 33 7 23V11L24 5Z"/><path d="m16 24 5 5 11-12"/></svg>',
      pen: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m31 5 12 12M27 9l12 12M7 37l24-24 8 8-24 24H7v-8Z"/><path d="m20 14 14 14M8 32l8 8"/></svg>',
      calendar: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="9" width="36" height="34" rx="6"/><path d="M6 19h36M15 5v9M33 5v9M15 27h.1M24 27h.1M33 27h.1M15 35h.1M24 35h.1"/></svg>',
      check: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="5" width="32" height="38" rx="5"/><path d="M16 16h16M16 24h9M16 32h16"/></svg>',
      help: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19"/><path d="M18 18a6 6 0 1 1 8 5.6c-2 .8-2 2.2-2 4.4M24 35h.1"/></svg>',
      heart: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 42S7 31 7 17a10 10 0 0 1 17-7 10 10 0 0 1 17 7c0 14-17 25-17 25Z"/><path d="M15 24h6l3-7 4 14 3-7h4"/></svg>'
    };
    return icons[name] || icons.heart;
  };

  const header = `
    <header class="site-header">
      <div class="header-main shell">
        <a class="brand" href="./index.html" aria-label="뼈튼튼, 주사안심! 홈">
          <img src="./assets/favicon.svg" alt="" width="46" height="46">
          <span><strong>뼈튼튼, 주사안심!</strong><small>골다공증 환자교육</small></span>
        </a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation"><span aria-hidden="true">☰</span> 메뉴</button>
        <div class="page-tools" aria-label="화면 및 음성 도구">
          <div class="font-tools" aria-label="글자 크기">
            <button type="button" data-font-size="normal" aria-pressed="true">가</button>
            <button type="button" data-font-size="large" aria-pressed="false">가+</button>
            <button type="button" data-font-size="xlarge" aria-pressed="false">가++</button>
          </div>
          <button class="speak-button" id="speak-button" type="button" hidden>현재 내용 읽기</button>
          <button class="speak-button" id="speak-stop" type="button" hidden>읽기 중지</button>
        </div>
      </div>
      <div class="nav-wrap">
        <nav class="primary-nav shell" id="primary-navigation" aria-label="주요 메뉴">
          <a class="nav-home" href="./index.html" data-page-link="home">홈</a>
          <details data-nav-group="bone">
            <summary>골다공증 알아보기</summary>
            <div class="nav-submenu">
              <a href="./osteoporosis.html" data-page-link="osteoporosis">질환 이해하기</a>
              <a href="./risk-check.html" data-page-link="risk-check">3분 위험요인 체크</a>
              <a href="./prevention.html" data-page-link="prevention">예방과 치료</a>
            </div>
          </details>
          <details data-nav-group="medicine">
            <summary>내 주사제 배우기</summary>
            <div class="nav-submenu">
              <a href="./medicine.html" data-page-link="medicine">테리파라타이드란?</a>
              <a href="./products.html" data-page-link="products">내 제품 확인</a>
              <a href="./injection-guide.html" data-page-link="injection-guide">안전한 투여 순서</a>
              <a href="./pen-guide.html" data-page-link="pen-guide">주사기 사용법</a>
            </div>
          </details>
          <details data-nav-group="safety">
            <summary>안전하게 관리하기</summary>
            <div class="nav-submenu">
              <a href="./storage.html" data-page-link="storage">보관과 폐기</a>
              <a href="./reactions.html" data-page-link="reactions">이상반응 관찰</a>
              <a href="./knowledge-check.html" data-page-link="knowledge-check">주사 안전 OX 퀴즈</a>
            </div>
          </details>
          <a href="./journal.html" data-page-link="journal">주사 일정·건강수첩</a>
          <a href="./faq.html" data-page-link="faq">자주 묻는 질문</a>
        </nav>
      </div>
    </header>`;

  const pageHero = (eyebrow, title, text, tone = "blue") => `
    <section class="page-hero page-hero-${tone}" data-speak-title="${title}">
      <div class="shell page-hero-inner">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${text}</p>
      </div>
    </section>`;

  const home = `
    <main id="main-content">
      <section class="home-hero shell" data-speak-title="처음 안내">
        <img class="home-hero-photo" src="./assets/hero-family-v2.webp" alt="햇살 아래에서 함께 미소 짓는 한국인 조부모와 딸, 손녀">
        <div class="home-hero-shade" aria-hidden="true"></div>
        <div class="home-hero-copy">
          <p class="eyebrow">골다공증 환자와 보호자를 위한 쉬운 안내</p>
          <h1>뼈는 <span>튼튼하게</span>,<br>주사는 <em>안심하게</em></h1>
          <p class="hero-lead">질환과 치료를 이해하고, 오늘의 주사를 안전하게 준비해 보세요.</p>
          <div class="hero-actions">
            <a class="button primary" href="./risk-check.html">지금, 뼈 건강 확인하기 <span aria-hidden="true">→</span></a>
            <a class="button glass" href="./journal.html">주사 일정 기록하기</a>
          </div>
        </div>
      </section>

      <section class="quick-links shell" aria-label="빠른 메뉴">
        <a href="./osteoporosis.html"><span class="quick-icon blue">${icon("bone")}</span><strong>뼈 건강 이해</strong><small>질환과 골절 위험</small></a>
        <a href="./risk-check.html"><span class="quick-icon green">${icon("shield")}</span><strong>위험요인 체크</strong><small>BMI와 8가지 항목</small></a>
        <a href="./products.html"><span class="quick-icon purple">${icon("pen")}</span><strong>내 주사제</strong><small>제품별 차이 확인</small></a>
        <a href="./journal.html"><span class="quick-icon orange">${icon("calendar")}</span><strong>주사 일정</strong><small>예정·완료 캘린더</small></a>
        <a href="./injection-guide.html"><span class="quick-icon pink">${icon("check")}</span><strong>안전한 투여</strong><small>순서대로 천천히</small></a>
        <a href="./faq.html"><span class="quick-icon teal">${icon("help")}</span><strong>도움 받기</strong><small>누락·여행·이상반응</small></a>
      </section>

      <section class="home-dashboard shell">
        <article class="feature-story">
          <img src="./assets/injection-calendar-illustration.webp" alt="간호사와 어르신이 주사펜과 캘린더를 함께 확인하는 일러스트">
          <div class="feature-story-copy">
            <span class="pill">● 오늘의 작은 기록</span>
            <h2>매일의 주사를<br><em>잊지 않게</em> 기록해요</h2>
            <p>예정 일정과 실제 투여를 한눈에 보고, 진료 때 보여 줄 기록을 남겨 보세요.</p>
            <a class="button outline" href="./journal.html">내 주사 캘린더 열기 <span aria-hidden="true">→</span></a>
          </div>
        </article>

        <article class="calendar-card home-calendar-card" data-calendar="home">
          <div class="calendar-card-header">
            <div><span class="calendar-kicker">주사 일정 캘린더</span><h2 data-calendar-title>이번 달</h2></div>
            <div class="calendar-nav"><button type="button" data-calendar-prev aria-label="이전 달">‹</button><button type="button" data-calendar-next aria-label="다음 달">›</button></div>
          </div>
          <div class="calendar-weekdays" aria-hidden="true"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div>
          <div class="calendar-grid" data-calendar-grid role="grid" aria-label="주사 일정 캘린더"></div>
          <div class="next-dose" data-next-dose><strong>다음 예정</strong><p>등록된 일정이 없어요.</p></div>
          <a class="calendar-more" href="./journal.html">전체 일정 보기 <span aria-hidden="true">→</span></a>
        </article>
      </section>

      <section class="home-guides shell" data-speak-title="오늘 확인할 안내">
        <div class="section-heading"><p class="eyebrow">오늘 필요한 정보만</p><h2>순서대로 차근차근 확인해요</h2></div>
        <div class="guide-grid">
          <a class="guide-card" href="./products.html"><span>01</span><h3>내 제품 이름 확인</h3><p>같은 성분이어도 펜과 카트리지 조작법은 다를 수 있어요.</p></a>
          <a class="guide-card" href="./injection-guide.html"><span>02</span><h3>새 주사침과 주사부위</h3><p>매번 새 주사침을 쓰고, 이전 부위와 떨어진 곳을 선택해요.</p></a>
          <a class="guide-card" href="./reactions.html"><span>03</span><h3>어지럼증과 응급 증상</h3><p>증상을 기록하고, 호흡곤란·얼굴 부종은 즉시 119에 연락해요.</p></a>
        </div>
      </section>
    </main>`;

  const osteoporosis = `
    <main id="main-content">${pageHero("01 · 골다공증 알아보기", "소리 없이 약해지는 뼈", "증상이 없어도 진행될 수 있어 위험요인 확인과 골밀도 검사가 중요합니다.")}
      <section class="content-section shell" data-speak-title="골다공증 이해하기">
        <div class="definition-grid">
          <div><p class="eyebrow">골다공증이란?</p><h2>뼈의 양과 질이 함께 약해진 상태</h2><p>골다공증은 뼈의 양이 줄고 뼈의 구조가 성글어져, 작은 충격에도 골절되기 쉬운 질환입니다.</p><div class="notice soft"><strong>핵심</strong> 초기에는 특별한 증상이 없는 경우가 많아 골절 전에 미리 확인하는 것이 중요합니다.</div></div>
          <div class="bone-compare" aria-label="건강한 뼈와 골다공증 뼈의 구조 비교"><div><span class="bone-texture dense"></span><strong>건강한 뼈</strong><small>내부 구조가 비교적 촘촘해요</small></div><div><span class="bone-texture porous"></span><strong>골다공증 뼈</strong><small>구조가 성글고 부러지기 쉬워요</small></div></div>
        </div>
        <div class="info-card-grid three"><article><span class="card-number">1</span><h3>주요 골절 부위</h3><p>손목, 척추, 고관절은 골다공증 골절이 자주 생기는 부위입니다.</p></article><article><span class="card-number">2</span><h3>모르고 지나갈 수 있는 신호</h3><p>키가 줄거나 등이 굽고, 갑자기 등·허리 통증이 생기면 상담이 필요할 수 있습니다.</p></article><article><span class="card-number">3</span><h3>골밀도 검사</h3><p>의료진은 골밀도, 골절 이력, 연령, 질환과 약물을 함께 평가합니다.</p></article></div>
        <div class="page-next"><a href="./risk-check.html">다음: 나의 위험요인 확인하기 →</a></div>
      </section>
    </main>`;

  const triState = (name) => `<div class="segmented-control"><label><input type="radio" name="${name}" value="yes"><span>예</span></label><label><input type="radio" name="${name}" value="no"><span>아니오</span></label><label><input type="radio" name="${name}" value="unknown"><span>모르겠음</span></label></div>`;
  const riskCheck = `
    <main id="main-content">${pageHero("나의 뼈 건강 돌아보기", "3분 위험요인 자가체크", "진단이 아니라, 의료진과 상담할 내용을 준비하는 도구입니다.", "mint")}
      <section class="content-section shell" data-speak-title="골다공증 위험요인 자가체크">
        <div class="notice warning"><strong>꼭 알아두세요.</strong> 결과만으로 약물을 시작·중단·변경하지 마세요. 진단은 의료진이 검사와 진료를 통해 합니다.</div>
        <form id="risk-form" class="check-form" novalidate>
          <fieldset class="question-card"><legend><span>1</span> 여성은 60세 이상, 남성은 70세 이상인가요?</legend>${triState("risk-age")}</fieldset>
          <fieldset class="question-card"><legend><span>2</span> 50세 이후 가벼운 낙상이나 충격으로 골절된 적이 있나요?</legend>${triState("risk-fracture")}</fieldset>
          <fieldset class="question-card"><legend><span>3</span> 저체중(BMI 19 미만)에 해당하나요?</legend><div class="bmi-inputs"><label>키 <input id="height-cm" name="height" type="number" min="80" max="250" inputmode="decimal"><span>cm</span></label><label>체중 <input id="weight-kg" name="weight" type="number" min="20" max="300" step="0.1" inputmode="decimal"><span>kg</span></label><output id="bmi-output">BMI —</output></div><p class="field-hint">키와 체중을 모두 입력하면 자동 계산합니다.</p><p class="field-error" id="bmi-error" hidden></p></fieldset>
          <fieldset class="question-card"><legend><span>4</span> 40세 이후 키가 4cm 이상 줄었나요?</legend>${triState("risk-height-loss")}</fieldset>
          <fieldset class="question-card"><legend><span>5</span> 부모님 중 고관절 골절을 겪은 분이 있나요?</legend>${triState("risk-parent")}</fieldset>
          <fieldset class="question-card multi-question"><legend><span>6</span> 다음 질환·상태 중 해당하는 것이 있나요?</legend><div class="checkbox-grid"><label><input type="checkbox" name="risk-condition" value="류마티스관절염">류마티스관절염</label><label><input type="checkbox" name="risk-condition" value="당뇨병">당뇨병</label><label><input type="checkbox" name="risk-condition" value="갑상선·부갑상선 질환">갑상선·부갑상선 질환</label><label><input type="checkbox" name="risk-condition" value="만성 콩팥병">만성 콩팥병</label><label><input type="checkbox" name="risk-condition" value="흡수장애">염증성 장질환 등 흡수장애</label><label><input type="checkbox" name="risk-condition" value="성호르몬 감소">조기폐경·성호르몬 감소</label><label><input type="checkbox" name="risk-condition" value="움직임 제한">장기간 움직임 제한</label><label><input type="checkbox" name="risk-condition" value="반복 낙상">지난 1년간 2회 이상 낙상</label></div><div class="status-options"><label><input type="radio" name="risk-condition-status" value="none">해당 없음</label><label><input type="radio" name="risk-condition-status" value="unknown">모르겠음</label></div></fieldset>
          <fieldset class="question-card multi-question"><legend><span>7</span> 다음 약물 치료를 장기간 받은 적이 있나요?</legend><div class="checkbox-grid"><label><input type="checkbox" name="risk-medication" value="스테로이드">3개월 이상 스테로이드</label><label><input type="checkbox" name="risk-medication" value="호르몬 치료">유방암·전립선암 호르몬 치료</label><label><input type="checkbox" name="risk-medication" value="항경련제">일부 항경련제</label><label><input type="checkbox" name="risk-medication" value="면역억제·항우울제">일부 면역억제·항우울제</label></div><div class="status-options"><label><input type="radio" name="risk-medication-status" value="none">해당 없음</label><label><input type="radio" name="risk-medication-status" value="unknown">모르겠음</label></div></fieldset>
          <fieldset class="question-card"><legend><span>8</span> 현재 흡연 중이거나 하루 3잔 이상의 술을 마시나요?</legend>${triState("risk-lifestyle")}</fieldset>
          <p class="form-error" id="risk-error" role="alert" hidden></p><div class="form-actions"><button class="button primary" type="submit">결과 확인하기</button><button class="button secondary" type="reset">처음부터 다시</button></div>
        </form>
        <div class="result-panel" id="risk-result" tabindex="-1" aria-live="polite" hidden></div>
      </section>
    </main>`;

  const prevention = `
    <main id="main-content">${pageHero("매일의 작은 실천", "치료는 꾸준히, 생활은 안전하게", "약물은 처방대로 사용하고, 영양·운동·낙상 예방을 함께 실천하세요.", "green")}
      <section class="content-section shell" data-speak-title="골다공증 예방과 치료"><div class="info-card-grid four"><article><span class="big-icon">💊</span><h2>처방 지키기</h2><p>스스로 약을 중단하거나 투여 간격을 바꾸지 않습니다.</p></article><article><span class="big-icon">🥛</span><h2>영양 챙기기</h2><p>칼슘·비타민 D 섭취는 의료진과 상의해 나에게 맞게 조절합니다.</p></article><article><span class="big-icon">🚶</span><h2>안전하게 움직이기</h2><p>상태에 맞는 체중부하·근력·균형 운동으로 뼈와 근육을 지킵니다.</p></article><article><span class="big-icon">🏠</span><h2>낙상 줄이기</h2><p>미끄러운 바닥과 문턱을 정리하고 야간 조명을 켜 둡니다.</p></article></div><div class="source-banner"><div><strong>더 자세한 질환 정보가 필요한가요?</strong><p>질병관리청 국가건강정보포털에서 검사·치료·예방 정보를 확인할 수 있습니다.</p></div><a class="button outline" href="https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5833" target="_blank" rel="noopener">공식 정보 보기 ↗</a></div></section>
    </main>`;

  const medicine = `
    <main id="main-content">${pageHero("02 · 내 주사제 배우기", "테리파라타이드는 뼈 형성을 돕는 약", "골절 위험이 높은 환자에게 의료진의 판단에 따라 사용하는 처방 주사제입니다.", "purple")}
      <section class="content-section shell" data-speak-title="테리파라타이드 알아보기"><div class="treatment-flow"><div><span>1</span><strong>대상 확인</strong><p>의료진이 골절 위험과 건강상태를 평가합니다.</p></div><i>→</i><div><span>2</span><strong>사용법 배우기</strong><p>제품별 펜 사용법과 주의사항을 확인합니다.</p></div><i>→</i><div><span>3</span><strong>매일 기록</strong><p>처방대로 투여하고 몸의 변화를 관찰합니다.</p></div></div><div class="notice strong"><strong>꼭 기억하세요.</strong> 일반적인 허가사항은 1일 1회 20μg 피하주사, 총 투여기간은 평생 최대 24개월입니다. 실제 사용은 반드시 나의 처방·제품 설명서·의료진 교육을 우선하세요.</div><div class="page-next"><a href="./products.html">다음: 내 주사제 이름 확인하기 →</a></div></section>
    </main>`;

  const products = `
    <main id="main-content">${pageHero("제품마다 기구와 조작법이 달라요", "내 주사제 이름부터 확인하세요", "같은 성분이어도 펜과 카트리지의 준비·조작 순서는 다를 수 있습니다.", "orange")}
      <section class="content-section shell" data-speak-title="테리파라타이드 제품 구분"><div class="product-grid"><article><figure class="product-photo"><img src="./assets/products/forsteo.png" alt="포스테오주 제품 상자와 펜형 주사기" width="282" height="187"></figure><span class="product-type">완제품 펜형</span><h2>포스테오주</h2><ul><li>테리파라타이드 성분</li><li>제품 전용 펜 사용법 확인</li><li>새 주사침을 매번 사용</li></ul></article><article><figure class="product-photo"><img src="./assets/products/terrosa-cartridge.png" alt="테로사카트리지주 제품 상자와 카트리지" width="340" height="165"></figure><span class="product-type">카트리지 + 펜형</span><h2>테로사카트리지주·테로사펜</h2><ul><li>전용 펜에 카트리지를 결합</li><li>카트리지 교체법을 별도로 확인</li><li>공식 환자 사용법 영상 제공</li></ul><a href="https://www.daewonpharm.com/products/sub02_01_view.jsp?PRD_NO=1343&lang=1&mb=02&mm=22&ms=211" target="_blank" rel="noopener">공식 제품정보·영상 ↗</a></article><article><figure class="product-photo"><img src="./assets/products/terrosa-prefilled-pen.png" alt="테로사프리필드펜 제품 상자와 펜형 주사기" width="340" height="289"></figure><span class="product-type">프리필드 펜형</span><h2>테로사프리필드펜</h2><ul><li>카트리지가 미리 장착된 펜</li><li>제품 전용 사용설명서 확인</li><li>새 주사침을 매번 사용</li></ul><a href="https://www.daewonpharm.com/products/sub02_01_prn.jsp?PRD_NO=1528&lang=1&mb=02&mm=22&ms=211" target="_blank" rel="noopener">공식 제품정보 ↗</a></article></div><div class="notice warning"><strong>모양만 보고 판단하지 마세요.</strong> 제품명이 확실하지 않거나 조작법이 기억나지 않으면 투여 전에 처방 의료기관이나 약사에게 문의하세요.</div></section>
    </main>`;

  const injectionGuide = `
    <main id="main-content">${pageHero("주사 전, 천천히 한 단계씩", "안전한 투여를 위한 6단계", "버튼 조작·대기시간·카트리지 교체는 제품별 공식 설명서와 의료진 교육을 우선하세요.", "pink")}
      <section class="content-section shell" data-speak-title="안전한 주사 순서"><ol class="step-grid"><li><span>01</span><div><h2>손 씻고 준비하기</h2><p>밝고 안전한 장소에서 손을 씻고 필요한 물품을 한곳에 놓습니다.</p></div></li><li><span>02</span><div><h2>제품 상태 확인하기</h2><p>제품명·사용기한·약액 상태를 확인합니다. 이상이 있으면 사용하지 마세요.</p></div></li><li><span>03</span><div><h2>새 주사침 연결하기</h2><p>매 투여마다 새 주사침을 사용하고 다른 사람과 공유하지 않습니다.</p></div></li><li><span>04</span><div><h2>주사 부위 정하기</h2><p>의료진에게 배운 복부 또는 허벅지 부위를 선택하고 매일 부위를 바꿉니다.</p></div></li><li><span>05</span><div><h2>설명서대로 투여하기</h2><p>용량과 투여 완료 표시를 확인합니다. 기억이 나지 않으면 추측하지 마세요.</p></div></li><li><span>06</span><div><h2>침을 분리하고 기록하기</h2><p>사용한 침을 안전용기에 넣고 펜은 즉시 냉장 보관한 뒤 건강수첩에 기록합니다.</p></div></li></ol><div class="notice soft"><strong>처음 몇 차례는 앉거나 누울 수 있는 곳에서</strong> 어지럼증이나 두근거림이 계속되거나 심해지면 의료진에게 알리세요.</div><div class="page-next"><a href="./pen-guide.html">테로사펜 영상과 단계별 사진 보기 →</a></div></section>
    </main>`;

  const penSteps = [
    ["01", "개봉일·유효일 확인하기", "assets/pen-guide/01-check-dates.webp", "테로사펜 라벨의 제품명과 사용기한을 확인하고, 새 카트리지의 첫 투여일을 기록합니다. 사용기한이 지났거나 라벨을 읽기 어렵다면 사용하지 마세요."],
    ["02", "펜과 약액 상태 확인하기", "assets/pen-guide/02-check-medicine.webp", "펜이 손상되지 않았는지 확인하고 약액이 무색투명한지 살펴봅니다. 흐리거나 색이 변했거나 입자가 보이면 사용하지 말고 의료진 또는 약사에게 문의하세요."],
    ["03", "펜 뚜껑 열기", "assets/pen-guide/03-remove-cap.webp", "검은색 펜 뚜껑을 곧게 빼서 카트리지 부분을 드러냅니다. 펜을 떨어뜨렸거나 이상이 보이면 다음 단계로 진행하지 마세요."],
    ["04", "새 주사침 준비하기", "assets/pen-guide/04-new-needle.webp", "매번 새 주사침을 사용합니다. 포장이 뜯어졌거나 손상된 주사침은 버리고 새 제품을 준비하세요."],
    ["05", "주사침 단단히 연결하기", "assets/pen-guide/05-attach-needle.webp", "주사침을 카트리지 홀더에 똑바로 대고 시계 방향으로 돌려 단단히 연결합니다. 무리하게 비스듬히 끼우지 마세요."],
    ["06", "안쪽 주사침 캡 벗기기", "assets/pen-guide/06-remove-inner-cap.webp", "바깥쪽 큰 캡은 주사 후 침을 안전하게 분리할 때 필요하므로 보관하고, 안쪽 작은 캡만 벗겨 폐기합니다."],
    ["07", "1회 용량 맞추기", "assets/pen-guide/07-set-dose.webp", "용량 조절 손잡이를 시계 방향으로 끝까지 돌려 표시창의 화살표가 기준선과 맞는지 확인합니다. 더 돌아가지 않을 때 억지로 힘을 주지 마세요."],
    ["08", "주사 부위 소독하기", "assets/pen-guide/08-clean-site.webp", "의료진에게 교육받은 복부 또는 허벅지 부위를 선택해 알코올 솜으로 닦고 자연 건조합니다. 매일 이전 위치와 떨어진 곳으로 바꾸세요."],
    ["09", "곧게 주사하고 6초 기다리기", "assets/pen-guide/09-inject.webp", "피부를 가볍게 잡고 바늘을 곧게 넣습니다. 버튼을 끝까지 누른 채 표시가 시작 위치로 돌아온 것을 확인하고, 바늘을 피부에 둔 채 6초 더 기다린 뒤 천천히 뺍니다."]
  ];
  const penGuide = `
    <main id="main-content">${pageHero("테로사펜 영상 교육", "영상으로 보고, 사진으로 한 번 더", "이 페이지는 테로사카트리지주·테로사펜 사용자를 위한 보조교육입니다. 처방 의료진의 대면 교육과 제품 설명서를 우선하세요.", "purple")}
      <section class="content-section shell pen-guide-page" data-speak-title="테로사펜 주사기 사용법">
        <div class="video-learning-card">
          <div class="video-learning-copy"><p class="eyebrow">먼저 전체 과정을 보세요</p><h2>테로사펜 자가주사 교육영상</h2><p>약 1분 38초 영상입니다. 재생·일시정지와 전체화면 버튼을 이용해 천천히 확인하세요.</p></div>
          <div class="guide-video-wrap"><video class="guide-video" controls playsinline preload="metadata" poster="./assets/pen-guide/03-remove-cap.webp" aria-label="테로사펜 자가주사 사용방법 교육영상" data-chunked-video data-video-base="./assets/video-parts/terrosa-pen-guide.part" data-video-parts="9">이 브라우저에서는 영상을 재생할 수 없습니다. 아래 단계별 사진과 설명을 확인하세요.</video><p class="video-load-status" data-video-status role="status">영상을 준비하고 있어요.</p></div>
        </div>
        <div class="notice warning pen-guide-warning"><strong>이 영상은 테로사펜용입니다.</strong> 포스테오주나 다른 프리필드펜은 조작법이 다를 수 있습니다. 제품명이 다르면 이 순서를 따라 하지 말고 해당 제품 설명서와 의료진 교육을 확인하세요.</div>
        <div class="section-heading"><p class="eyebrow">한 장씩 다시 보기</p><h2>단계별 사진 교육</h2><p>각 사진의 제목과 설명을 순서대로 읽어 보세요.</p></div>
        <ol class="photo-step-list">${penSteps.map(([number, title, imagePath, description]) => `<li class="photo-step-card"><div class="photo-step-title"><span>${number}</span><h3>${title}</h3></div><img src="./${imagePath}" alt="${title} 장면" width="640" height="360"><p>${description}</p></li>`).join("")}</ol>
        <section class="aftercare-card" aria-labelledby="aftercare-title"><div><p class="eyebrow">주사 직후</p><h2 id="aftercare-title">침 제거와 보관까지 마무리하세요</h2></div><ol><li>보관해 둔 바깥쪽 큰 캡을 조심히 씌웁니다.</li><li>캡을 잡고 반시계 방향으로 돌려 주사침을 분리합니다.</li><li>사용한 침은 뚫리지 않는 전용·단단한 용기에 넣습니다.</li><li>펜 뚜껑을 닫고 주사침을 분리한 상태로 즉시 2–8℃ 냉장 보관합니다.</li></ol></section>
        <div class="notice strong"><strong>용량 표시가 시작 위치로 돌아오지 않았나요?</strong> 같은 날 다시 주사하지 말고 처방 의료기관이나 약사에게 문의하세요.</div>
        <div class="source-banner"><div><strong>제품별 공식 안내를 함께 확인하세요.</strong><p>테로사펜은 올바른 주사방법을 교육받은 뒤 사용해야 하는 전문의약품입니다.</p></div><a class="button outline" href="https://www.daewonpharm.com/products/sub02_01_view.jsp?PRD_NO=1343&lang=1&mb=02&mm=22&ms=211" target="_blank" rel="noopener">대원제약 제품정보 ↗</a></div>
      </section>
    </main>`;

  const storage = `
    <main id="main-content">${pageHero("03 · 안전하게 관리하기", "보관은 차갑고 안전하게, 폐기는 찔리지 않게", "제품별 보관조건은 용기·포장·첨부문서에서 다시 확인하세요.", "mint")}
      <section class="content-section shell" data-speak-title="보관과 폐기"><div class="temperature-card"><strong>2–8℃</strong><span>일반적인 차광 냉장 보관 범위</span></div><div class="info-card-grid four"><article><h2>보관온도 확인</h2><p>제품 설명서에 적힌 보관온도를 우선합니다.</p></article><article><h2>얼리지 않기</h2><p>동결되었거나 보관온도를 벗어난 것이 의심되면 바로 사용하지 마세요.</p></article><article><h2>사용 뒤 즉시 보관</h2><p>주사침을 분리하고 뚜껑을 닫은 뒤 어린이 손에 닿지 않게 보관합니다.</p></article><article><h2>여행 전 문의</h2><p>보냉 방법과 이동 가능 시간은 제품과 상황에 따라 다르므로 약사에게 확인합니다.</p></article></div><div class="disposal-card"><div><p class="eyebrow">사용한 주사침</p><h2>이렇게 처리하세요</h2></div><ol><li>침을 다시 만지거나 재사용하지 않기</li><li>뚫리지 않는 전용·단단한 용기에 넣기</li><li>의료기관·약국에 지역 폐기방법 문의하기</li></ol></div></section>
    </main>`;

  const reactions = `
    <main id="main-content">${pageHero("몸의 변화를 살펴보세요", "어떤 증상에 어떻게 대응할까요?", "새 증상이 생겼거나 평소보다 심해졌다면 투여 시점과 증상을 기록하세요.", "pink")}
      <section class="content-section shell" data-speak-title="이상반응 대응"><div class="reaction-grid"><article class="watch"><span>관찰과 기록</span><h2>비교적 흔할 수 있는 증상</h2><ul><li>어지럼증·두통</li><li>메스꺼움</li><li>팔다리 통증·근육 경련</li><li>주사부위의 가벼운 통증·붉어짐</li></ul><p>휴식 후에도 계속되거나 불편하면 의료진 또는 약사에게 문의하세요.</p></article><article class="contact"><span>빠른 상담</span><h2>그날 알려야 할 증상</h2><ul><li>계속되는 심한 어지럼증·실신 느낌</li><li>심한 두근거림이나 흉부 불편</li><li>지속되거나 악화되는 통증</li><li>보관 이상·잘못된 투여 의심</li></ul><p>추가 투여 여부를 스스로 판단하지 마세요.</p></article><article class="emergency"><span>즉시 119</span><h2>심각한 알레르기 반응 의심</h2><ul><li>갑작스러운 호흡곤란</li><li>얼굴·입술·목의 부종</li><li>전신 두드러기</li><li>의식 저하 또는 심한 흉통</li></ul><p>온라인 정보나 다음 진료를 기다리지 마세요.</p></article></div><div class="source-banner"><div><strong>의약품 이상사례 보고·피해구제 상담</strong><p>한국의약품안전관리원 1644-6223 연결 후 14-3330</p></div><a class="button outline" href="https://kaers.drugsafe.or.kr/main.do" target="_blank" rel="noopener">온라인 보고 안내 ↗</a></div></section>
    </main>`;

  const quizItems = [
    ["주사방법은 의료진에게 배우고 제품 설명서를 먼저 확인해야 한다.", "o", "제품별 조작법은 다를 수 있어 교육과 설명서 확인이 우선입니다.", "injection-guide.html"],
    ["주사침은 상태가 좋아 보이면 여러 번 재사용해도 된다.", "x", "주사침은 매번 새 것을 사용해야 합니다.", "injection-guide.html"],
    ["테리파라타이드 제품은 더 차갑게 보관하려고 냉동실에 둔다.", "x", "일반적으로 2–8℃ 냉장 보관하며 얼리지 않습니다.", "storage.html"],
    ["같은 곳에 반복하지 않고 주사부위를 바꾸어 투여한다.", "o", "이전 부위와 떨어진 곳을 선택하세요.", "injection-guide.html"],
    ["투여를 놓쳤다면 다음번에 두 배 용량을 투여한다.", "x", "두 배로 투여하지 말고 처방 의료기관에 확인하세요.", "faq.html"],
    ["사용한 침은 찔리지 않는 용기에 넣고 안내받은 방법으로 폐기한다.", "o", "전용 또는 단단한 용기에 넣고 지역 폐기방법을 문의하세요.", "storage.html"],
    ["어지럼증이나 두근거림이 계속되거나 심해지면 의료진에게 알린다.", "o", "증상을 기록하고 의료진에게 알리세요.", "reactions.html"],
    ["숨이 차고 얼굴·입술이 붓는 심한 알레르기 증상이면 즉시 119에 연락한다.", "o", "응급 증상은 기다리지 말고 즉시 119에 연락하세요.", "reactions.html"]
  ];
  const knowledgeCheck = `
    <main id="main-content">${pageHero("배운 내용을 가볍게 확인해요", "주사 안전 OX 퀴즈", "8개 문항에 답하면 문항별 설명과 다시 배울 페이지를 볼 수 있습니다.", "purple")}
      <section class="content-section shell" data-speak-title="주사 안전 OX 퀴즈"><form id="knowledge-form" class="quiz-form" novalidate>${quizItems.map((item, index) => `<fieldset data-answer="${item[1]}" data-learn="./${item[3]}"><legend><span>${index + 1}</span> ${item[0]}</legend><div><label><input type="radio" name="quiz-${index + 1}" value="o"><span>O</span></label><label><input type="radio" name="quiz-${index + 1}" value="x"><span>X</span></label></div><p class="quiz-feedback" data-explanation="${item[2]}" hidden></p></fieldset>`).join("")}<p class="form-error" id="quiz-error" role="alert" hidden></p><div class="form-actions"><button class="button primary" type="submit">정답 확인하기</button><button class="button secondary" type="reset">다시 풀기</button></div></form><div class="result-panel" id="quiz-result" tabindex="-1" aria-live="polite" hidden></div></section>
    </main>`;

  const journalForms = `
    <section class="journal-records" aria-labelledby="records-title">
      <div class="journal-toolbar"><div><p class="eyebrow">기억보다 기록</p><h2 id="records-title">건강수첩</h2></div><div class="journal-actions"><button class="button secondary" id="export-journal" type="button">CSV 내보내기</button><button class="button secondary" id="print-journal" type="button">인쇄</button><button class="button danger-ghost" id="clear-journal" type="button">전체 삭제</button></div></div>
      <div class="journal-tabs" role="tablist" aria-label="건강수첩 기록 종류"><button type="button" role="tab" aria-selected="true" data-journal-tab="injections">투약 기록 <span data-count="injections">0</span></button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-journal-tab="reactions">이상반응 <span data-count="reactions">0</span></button><button type="button" role="tab" aria-selected="false" tabindex="-1" data-journal-tab="visits">병원 방문 <span data-count="visits">0</span></button></div>
      <div class="journal-panel" data-journal-panel="injections"><form id="injection-form" class="entry-form"><h3>투약 기록 추가</h3><input type="hidden" name="record-id"><div class="field-row"><label>투약 날짜<input required name="date" type="date"></label><label>시간<input name="time" type="time"></label></div><label>사용한 제품<select required name="product"><option value="">선택하세요</option><option>포스테오주</option><option>테로사카트리지주·테로사펜</option><option>테로사프리필드펜</option><option>기타·모름</option></select></label><label>주사 부위<select required name="site"><option value="">선택하세요</option><option>복부 왼쪽</option><option>복부 오른쪽</option><option>허벅지 왼쪽</option><option>허벅지 오른쪽</option><option>의료진이 지정한 부위</option><option>기록하지 않음</option></select></label><label>메모<textarea name="note" rows="3" maxlength="300"></textarea></label><div class="form-actions"><button class="button primary" type="submit">저장</button><button class="button secondary cancel-edit" type="button" hidden>수정 취소</button></div></form><div><h3>최근 투약 기록</h3><div class="entry-list" id="injection-list"></div></div></div>
      <div class="journal-panel" data-journal-panel="reactions" hidden><form id="reaction-form" class="entry-form"><h3>이상반응 기록 추가</h3><input type="hidden" name="record-id"><label>발생일<input required name="date" type="date"></label><label>증상<input required name="symptom" type="text" maxlength="80"></label><label>정도<select required name="severity"><option value="">선택하세요</option><option>가벼움</option><option>중간</option><option>심함</option></select></label><label>취한 조치<input name="action" type="text" maxlength="100"></label><label>메모<textarea name="note" rows="3" maxlength="300"></textarea></label><div class="form-actions"><button class="button primary" type="submit">저장</button><button class="button secondary cancel-edit" type="button" hidden>수정 취소</button></div></form><div><h3>최근 이상반응</h3><div class="entry-list" id="reaction-list"></div></div></div>
      <div class="journal-panel" data-journal-panel="visits" hidden><form id="visit-form" class="entry-form"><h3>병원 방문 기록 추가</h3><input type="hidden" name="record-id"><label>방문일<input required name="date" type="date"></label><label>방문 목적<input required name="purpose" type="text" maxlength="100"></label><label>확인할 질문<textarea name="question" rows="3" maxlength="300"></textarea></label><label>메모<textarea name="note" rows="3" maxlength="300"></textarea></label><div class="form-actions"><button class="button primary" type="submit">저장</button><button class="button secondary cancel-edit" type="button" hidden>수정 취소</button></div></form><div><h3>최근 방문 기록</h3><div class="entry-list" id="visit-list"></div></div></div>
    </section>`;

  const journal = `
    <main id="main-content">${pageHero("04 · 주사 일정·건강수첩", "예정은 캘린더에, 투여는 건강수첩에", "매일 반복 일정을 만들고, 실제 주사한 날을 완료로 기록할 수 있습니다.", "blue")}
      <section class="content-section shell journal-page" data-speak-title="주사 일정 캘린더와 건강수첩"><div class="privacy-banner"><strong>이 기기에만 저장됩니다.</strong><p>기록은 서버로 전송되지 않지만 암호화되지 않습니다. 공용·공유 기기에서는 사용 후 전체 삭제하세요.</p></div><p class="storage-warning" id="storage-warning" hidden>브라우저 저장소를 사용할 수 없어 현재 접속 중에만 기록이 유지됩니다.</p><p class="sr-only" id="save-status" aria-live="polite"></p>
        <div class="schedule-layout">
          <aside class="schedule-editor"><div><p class="eyebrow">예정 만들기</p><h2>주사 일정 등록</h2><p>처방된 기간과 시간을 기준으로 등록하세요.</p></div><form id="schedule-form" class="entry-form"><input type="hidden" name="record-id"><label>시작일<input required name="startDate" type="date"></label><div class="field-row"><label>예정 시간<input name="time" type="time"></label><label>반복<select required name="repeat"><option value="daily">매일</option><option value="once">한 번만</option></select></label></div><label>종료일 <small>(처방 기간이 있으면)</small><input name="endDate" type="date"></label><label>제품<select required name="product"><option value="">선택하세요</option><option>포스테오주</option><option>테로사카트리지주·테로사펜</option><option>테로사프리필드펜</option><option>기타·모름</option></select></label><label>메모<input name="note" type="text" maxlength="120" placeholder="예: 저녁 식사 후"></label><div class="form-actions"><button class="button primary" type="submit">일정 저장</button><button class="button secondary cancel-schedule-edit" type="button" hidden>수정 취소</button></div></form><div class="schedule-list-wrap"><h3>등록한 일정</h3><div id="schedule-list" class="schedule-list"></div></div></aside>
          <section class="calendar-card calendar-card-large" data-calendar="journal"><div class="calendar-card-header"><div><span class="calendar-kicker">내 주사 캘린더</span><h2 data-calendar-title>이번 달</h2></div><div class="calendar-nav"><button type="button" data-calendar-today>오늘</button><button type="button" data-calendar-prev aria-label="이전 달">‹</button><button type="button" data-calendar-next aria-label="다음 달">›</button></div></div><div class="calendar-legend"><span><i class="dot planned"></i>예정</span><span><i class="dot complete"></i>완료</span><span><i class="dot missed"></i>미기록</span></div><div class="calendar-weekdays" aria-hidden="true"><span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span></div><div class="calendar-grid" data-calendar-grid role="grid" aria-label="주사 일정 캘린더"></div><div class="calendar-day-detail" id="calendar-day-detail"><h3>선택한 날</h3><p>날짜를 누르면 예정과 투여 기록을 볼 수 있어요.</p></div><button class="button outline" id="prefill-injection" type="button">선택한 날 주사 완료 기록</button></section>
        </div>${journalForms}
      </section>
      <dialog id="clear-dialog"><form method="dialog"><h2>건강수첩을 모두 삭제할까요?</h2><p>주사 일정, 투약, 이상반응, 병원 방문 기록이 모두 삭제되며 복구할 수 없습니다.</p><div class="form-actions"><button class="button secondary" value="cancel">취소</button><button class="button danger" value="confirm">전체 삭제</button></div></form></dialog>
    </main>`;

  const faqItems = [
    ["주사 시간을 놓쳤어요. 다음에 두 번 맞아야 하나요?", "놓친 용량을 보충하려고 두 배로 투여하지 마세요. 언제 다시 투여할지는 처방 의료기관이나 약사에게 확인하세요."],
    ["냉장고 밖에 오래 두었거나 얼었을지 모르겠어요.", "바로 사용하지 말고 제품명, 노출 시간과 예상 온도를 메모해 약사 또는 제조사에 문의하세요."],
    ["주사한 뒤 어지러워요.", "앉거나 누워 휴식하고 갑자기 일어나지 마세요. 증상이 계속되거나 심해지면 의료진에게 알리세요."],
    ["주사부위가 빨갛고 아파요.", "가벼운 붉어짐은 관찰할 수 있지만, 부기·통증이 심해지거나 전신 반응이 나타나면 진료를 받으세요."],
    ["여행할 때 주사제는 어떻게 가져가나요?", "보냉 방법과 이동 가능 시간은 제품과 여행 조건에 따라 다릅니다. 출발 전에 약사·제조사·의료진에게 문의하세요."],
    ["주사제가 제대로 들어갔는지 모르겠어요.", "추가로 다시 투여하지 마세요. 제품의 투여 완료 표시를 확인하고 처방 의료기관에 문의하세요."]
  ];
  const faq = `
    <main id="main-content">${pageHero("05 · 자주 묻는 질문", "이럴 때는 어떻게 하나요?", "정답을 추측하지 말고, 제품 설명서와 처방 의료진의 안내를 우선하세요.", "blue")}
      <section class="content-section shell" data-speak-title="자주 묻는 질문"><div class="faq-list">${faqItems.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div><div class="help-banner"><div><strong>도움이 필요하신가요?</strong><p>약물 사용은 처방 의료진 또는 약사에게 문의하세요.</p></div><div><strong>응급 증상은 즉시 119</strong><p>호흡곤란, 얼굴·입술·목 부종, 전신 두드러기, 의식 저하는 기다리지 마세요.</p></div></div></section>
    </main>`;

  const pages = { home, osteoporosis, "risk-check": riskCheck, prevention, medicine, products, "injection-guide": injectionGuide, "pen-guide": penGuide, storage, reactions, "knowledge-check": knowledgeCheck, journal, faq };

  const footer = `
    <footer class="site-footer"><div class="shell footer-grid"><div><a class="footer-brand" href="./index.html"><img src="./assets/favicon.svg" alt="" width="42" height="42"><strong>뼈튼튼, 주사안심!</strong></a><p>환자와 보호자의 이해를 돕는 교육자료이며 진단, 처방, 의료진의 대면 교육을 대신하지 않습니다.</p></div><div><h2>공식 참고자료</h2><ul><li><a href="https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5833" target="_blank" rel="noopener">질병관리청 골다공증 정보 ↗</a></li><li><a href="https://nedrug.mfds.go.kr/" target="_blank" rel="noopener">식약처 의약품안전나라 ↗</a></li><li><a href="https://www.osteoporosis.foundation/sites/iofbonehealth/files/2020-10/OsteoporosisRiskCheck_Leaflet_korean.pdf" target="_blank" rel="noopener">IOF 한국어 위험도 체크 ↗</a></li><li><a href="https://kaers.drugsafe.or.kr/main.do" target="_blank" rel="noopener">의약품 이상사례 보고 ↗</a></li></ul></div></div><div class="shell footer-bottom"><span>콘텐츠 검토일: 2026년 10월 22일</span><span>회원가입·광고·분석·서버 전송 없음</span></div></footer><div class="toast" id="toast" role="status" aria-live="polite" hidden></div>`;

  const shell = document.querySelector("#site-shell");
  if (!pages[page]) {
    shell.innerHTML = `${header}<main id="main-content"><section class="content-section shell"><h1>페이지를 찾을 수 없어요.</h1><p><a href="./index.html">홈으로 돌아가기</a></p></section></main>${footer}`;
  } else {
    shell.innerHTML = `${header}${pages[page]}${footer}`;
  }

  const current = document.querySelector(`[data-page-link="${page}"]`);
  current?.setAttribute("aria-current", "page");
  const pageGroups = { osteoporosis: "bone", "risk-check": "bone", prevention: "bone", medicine: "medicine", products: "medicine", "injection-guide": "medicine", "pen-guide": "medicine", storage: "safety", reactions: "safety", "knowledge-check": "safety" };
  const group = pageGroups[page];
  if (group) document.querySelector(`[data-nav-group="${group}"] > summary`)?.setAttribute("aria-current", "true");
})();
