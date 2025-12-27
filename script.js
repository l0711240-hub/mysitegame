// 전역 변수
let currentClearanceLevel = 3;

// 실시간 시계
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeStr;
}

// 섹션 전환
function switchSection(sectionId, event) {
    event.preventDefault();
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 네비게이션 링크 비활성화
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 선택된 섹션 표시
    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.nav-link').classList.add('active');
    
    // 브레드크럼 업데이트
    const breadcrumbTexts = {
        'overview': '개요',
        'organization': '조직 구조',
        'charter': '헌장 및 규정',
        'world': '지역 정보',
        'fragments': '프래그먼트 목록',
        'timeline': '기관 연혁'
    };
    document.getElementById('breadcrumbCurrent').textContent = breadcrumbTexts[sectionId];
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 숫자 카운트업 애니메이션
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current.toLocaleString();
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// 보안 등급 변경
function updateClearanceLevel() {
    const select = document.getElementById('clearanceLevel');
    currentClearanceLevel = parseInt(select.value);
    
    // 배지 업데이트
    const badge = document.getElementById('clearanceBadge');
    badge.textContent = `보안등급: ${currentClearanceLevel}등급`;
    
    // 개요 텍스트 업데이트
    const overviewText = document.getElementById('overviewClearanceText');
    if (overviewText) {
        overviewText.textContent = `현재 ${currentClearanceLevel}등급 권한으로 접속하였습니다. ${currentClearanceLevel < 9 ? '일부 기밀 정보는 제한될 수 있습니다.' : '최고 등급으로 모든 정보에 접근 가능합니다.'}`;
    }
    
    // 프래그먼트 알림 업데이트
    const fragmentText = document.getElementById('fragmentClearanceText');
    if (fragmentText) {
        fragmentText.textContent = `${currentClearanceLevel}등급 권한으로 ${currentClearanceLevel < 9 ? '제한된 정보만' : '모든 정보를'} 열람 가능합니다.`;
    }
    
    // 프래그먼트 재렌더링
    renderFragments();
}

// 프래그먼트 렌더링
function renderFragments() {
    const container = document.getElementById('fragmentsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 필터 값 가져오기
    const searchTerm = document.getElementById('fragmentSearch')?.value.toLowerCase() || '';
    const dangerFilter = document.getElementById('dangerFilter')?.value || 'all';
    const managementFilter = document.getElementById('managementFilter')?.value || 'all';
    const accessFilter = document.getElementById('accessFilter')?.value || 'all';
    const deptFilter = document.getElementById('deptFilter')?.value || 'all';
    
    // 필터링
    let filteredFragments = fragments.filter(f => {
        // 보안 등급 필터
        if (f.access > currentClearanceLevel) return false;
        
        // 검색어 필터
        if (searchTerm && !f.id.toLowerCase().includes(searchTerm) && !f.name.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // 위험도 필터
        if (dangerFilter !== 'all' && f.danger !== dangerFilter) return false;
        
        // 관리등급 필터
        if (managementFilter !== 'all' && f.management !== parseInt(managementFilter)) return false;
        
        // 접근권한 필터
        if (accessFilter !== 'all' && f.access !== parseInt(accessFilter)) return false;
        
        // 부서 필터
        if (deptFilter !== 'all' && f.dept !== deptFilter) return false;
        
        return true;
    });
    
    // 프래그먼트 카드 생성
    filteredFragments.forEach(f => {
        const card = createFragmentCard(f);
        container.appendChild(card);
    });
    
    // 카운트 표시
    const countEl = document.getElementById('fragmentCount');
    if (countEl) {
        countEl.textContent = `${filteredFragments.length}개의 프래그먼트가 검색되었습니다.`;
    }
    
    // 제한된 프래그먼트 메시지
    const restrictedCount = fragments.filter(f => f.access > currentClearanceLevel).length;
    const restrictedMsg = document.getElementById('restrictedMessage');
    if (restrictedMsg) {
        if (restrictedCount > 0) {
            restrictedMsg.style.display = 'block';
            restrictedMsg.querySelector('.alert-content div:last-child').textContent = 
                `${restrictedCount}개의 프래그먼트는 현재 보안 등급(${currentClearanceLevel}등급)으로 열람할 수 없습니다.`;
        } else {
            restrictedMsg.style.display = 'none';
        }
    }
}

// 프래그먼트 카드 생성
function createFragmentCard(fragment) {
    const card = document.createElement('div');
    card.className = `fragment-card ${fragment.danger}`;
    card.setAttribute('data-danger', fragment.danger);
    card.setAttribute('data-dept', fragment.dept);
    card.setAttribute('data-management', fragment.management);
    card.setAttribute('data-access', fragment.access);
    
    const dangerText = {
        'safe': '안전',
        'caution': '주의',
        'hazard': '위험',
        'catastrophic': '재난'
    };
    
    card.innerHTML = `
        <div class="fragment-header">
            <div class="fragment-id">${fragment.id}</div>
            <div class="fragment-badges">
                <span class="badge badge-${fragment.danger}">${dangerText[fragment.danger]}</span>
                <span class="badge badge-secondary">관리등급 ${fragment.management}</span>
                <span class="badge badge-${fragment.access >= 7 ? 'danger' : fragment.access >= 5 ? 'caution' : 'primary'}">${fragment.access}등급</span>
            </div>
        </div>
        
        <div class="fragment-info-grid">
            <div class="info-item">
                <div class="info-label">명칭</div>
                <div class="info-value">${fragment.name}</div>
            </div>
            <div class="info-item">
                <div class="info-label">관리부서</div>
                <div class="info-value">${fragment.deptName}</div>
            </div>
            <div class="info-item">
                <div class="info-label">발견일시</div>
                <div class="info-value">${fragment.discovered}</div>
            </div>
            <div class="info-item">
                <div class="info-label">보관위치</div>
                <div class="info-value">${fragment.location}</div>
            </div>
        </div>
        
        <div class="fragment-description">
            <h4>📋 취득 경위</h4>
            <p>${fragment.acquisition}</p>
            
            <h4>⚡ 특수 능력</h4>
            <p>${fragment.ability}</p>
            
            <div class="alert alert-${fragment.danger === 'catastrophic' || fragment.danger === 'hazard' ? 'danger' : 'warning'}" style="margin-top: 1rem;">
                <span class="alert-icon">⚠️</span>
                <div class="alert-content">
                    <div class="alert-title">관리 등급 결정 이유</div>
                    ${fragment.reason}
                </div>
            </div>
            
            <h4>🔐 보관 프로토콜</h4>
            <ul style="margin-left: 1.5rem; line-height: 1.8;">
                ${fragment.protocol.split(',').map(p => `<li>${p.trim()}</li>`).join('')}
            </ul>
        </div>
    `;
    
    return card;
}

// 타임라인 렌더링
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    timeline.forEach(item => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        timelineItem.innerHTML = `
            <div class="timeline-dot ${item.major ? 'major' : ''}"></div>
            <div class="timeline-content ${item.major ? 'major' : ''}">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-description">${item.description}</div>
            </div>
        `;
        
        container.appendChild(timelineItem);
    });
}

// 세계 지도 렌더링
function renderWorldMap() {
    const mapContainer = document.getElementById('worldMap');
    if (!mapContainer) return;
    
    // SVG로 간단한 지도 생성
    const svg = `
        <svg viewBox="0 0 800 600" style="width: 100%; height: 100%;">
            <!-- 배경 (바다) -->
            <rect width="800" height="600" fill="#0a0e14"/>
            
            <!-- 북극해 -->
            <text x="400" y="30" text-anchor="middle" font-size="14" fill="#4a9eff" font-weight="600">북극해</text>
            
            <!-- 노르덴 대륙 (북부) -->
            <rect x="300" y="50" width="200" height="80" fill="#1e3a5f" stroke="#4a9eff" stroke-width="2" rx="5"/>
            <text x="400" y="85" text-anchor="middle" font-size="16" font-weight="600" fill="#4a9eff">노르덴</text>
            <text x="400" y="105" text-anchor="middle" font-size="12" fill="#9aa0a6">🏔️ 한랭 기후</text>
            
            <!-- 중앙 해역 -->
            <text x="400" y="180" text-anchor="middle" font-size="14" fill="#4a9eff" font-weight="600">중앙해</text>
            
            <!-- 시벤트 대륙 (서부) -->
            <rect x="50" y="200" width="180" height="100" fill="#1b5e20" stroke="#4caf50" stroke-width="2" rx="5"/>
            <text x="140" y="240" text-anchor="middle" font-size="16" font-weight="600" fill="#66bb6a">시벤트</text>
            <text x="140" y="260" text-anchor="middle" font-size="12" fill="#9aa0a6">⚓ 온대 기후</text>
            
            <!-- 오리엔탈 대륙 (동부) -->
            <rect x="570" y="200" width="180" height="100" fill="#e65100" stroke="#ff9800" stroke-width="2" rx="5"/>
            <text x="660" y="240" text-anchor="middle" font-size="16" font-weight="600" fill="#ffb74d">오리엔탈</text>
            <text x="660" y="260" text-anchor="middle" font-size="12" fill="#9aa0a6">📚 아열대</text>
            
            <!-- 아스트랄 대륙 (중부 남쪽) - 본부 -->
            <rect x="280" y="350" width="240" height="120" fill="#b71c1c" stroke="#f44336" stroke-width="3" rx="5"/>
            <text x="400" y="390" text-anchor="middle" font-size="18" font-weight="700" fill="#ef5350">아스트랄</text>
            <text x="400" y="410" text-anchor="middle" font-size="14" fill="#ef5350">🏜️ 사막 기후</text>
            <text x="400" y="430" text-anchor="middle" font-size="16" font-weight="700" fill="#ffcdd2">★ 모네타 본부</text>
            <text x="400" y="450" text-anchor="middle" font-size="12" fill="#9aa0a6">고파 참사 발생지</text>
            
            <!-- 오스테라 대륙 (최남단) -->
            <rect x="320" y="500" width="160" height="80" fill="#4a148c" stroke="#ab47bc" stroke-width="2" rx="5"/>
            <text x="400" y="535" text-anchor="middle" font-size="16" font-weight="600" fill="#ba68c8">오스테라</text>
            <text x="400" y="555" text-anchor="middle" font-size="12" fill="#9aa0a6">🌋 미지의 대륙</text>
            
            <!-- 연결선 -->
            <line x1="400" y1="130" x2="400" y2="200" stroke="#2d3748" stroke-width="2" stroke-dasharray="5,5"/>
            <line x1="400" y1="300" x2="400" y2="350" stroke="#2d3748" stroke-width="2" stroke-dasharray="5,5"/>
            <line x1="400" y1="470" x2="400" y2="500" stroke="#2d3748" stroke-width="2" stroke-dasharray="5,5"/>
        </svg>
    `;
    
    mapContainer.innerHTML = svg;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 보안 등급 변경
    const clearanceSelect = document.getElementById('clearanceLevel');
    if (clearanceSelect) {
        clearanceSelect.addEventListener('change', updateClearanceLevel);
    }
    
    // 프래그먼트 검색 및 필터
    const fragmentSearch = document.getElementById('fragmentSearch');
    const dangerFilter = document.getElementById('dangerFilter');
    const managementFilter = document.getElementById('managementFilter');
    const accessFilter = document.getElementById('accessFilter');
    const deptFilter = document.getElementById('deptFilter');
    
    if (fragmentSearch) fragmentSearch.addEventListener('input', renderFragments);
    if (dangerFilter) dangerFilter.addEventListener('change', renderFragments);
    if (managementFilter) managementFilter.addEventListener('change', renderFragments);
    if (accessFilter) accessFilter.addEventListener('change', renderFragments);
    if (deptFilter) deptFilter.addEventListener('change', renderFragments);
    
    // URL 해시 처리
    window.addEventListener('hashchange', handleHashChange);
}

// URL 해시 처리
function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const section = document.getElementById(hash);
        if (section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            section.classList.add('active');
            
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + hash) {
                    link.classList.add('active');
                }
            });
            
            const breadcrumbTexts = {
                'overview': '개요',
                'organization': '조직 구조',
                'charter': '헌장 및 규정',
                'world': '지역 정보',
                'fragments': '프래그먼트 목록',
                'timeline': '기관 연혁'
            };
            document.getElementById('breadcrumbCurrent').textContent = breadcrumbTexts[hash] || '개요';
        }
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 시계 시작
    setInterval(updateTime, 1000);
    updateTime();
    
    // 애니메이션 실행
    setTimeout(() => {
        animateValue('fragmentCount', 1500, 1847, 1000);
        animateValue('staffCount', 2800, 3200, 1200);
    }, 300);
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 프래그먼트 렌더링
    renderFragments();
    
    // 타임라인 렌더링
    renderTimeline();
    
    // 세계 지도 렌더링
    renderWorldMap();
    
    // URL 해시 처리
    handleHashChange();
});

// 전역 함수로 노출 (HTML에서 사용)
window.switchSection = switchSection;