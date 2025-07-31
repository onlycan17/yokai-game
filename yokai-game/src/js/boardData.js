// 원본 요괴의 성 탈출 보드 데이터

export const BOARD_ROOMS = [
    // 시작점 (안전지대)
    { id: 0, name: '시작', type: 'start', x: 100, y: 650, icon: '🏠', isSafeZone: true },
    
    // 첫 번째 경로 (하단부)
    { id: 1, name: '요괴의 화장실', type: 'yokai-room', x: 200, y: 650, icon: '🚽' },
    { id: 2, name: '피의 방', type: 'yokai-room', x: 300, y: 650, icon: '🩸' },
    { id: 3, name: '고문의 방', type: 'yokai-room', x: 400, y: 650, icon: '⛓️' },
    { id: 4, name: '비명의 방', type: 'yokai-room', x: 500, y: 650, icon: '😱' },
    { id: 5, name: '뱀의 탑', type: 'special-room', x: 600, y: 650, icon: '🐍' },
    { id: 6, name: '저주의 방', type: 'yokai-room', x: 700, y: 650, icon: '💀' },
    
    // 우측 상승 경로
    { id: 7, name: '짐승의 방', type: 'yokai-room', x: 700, y: 550, icon: '🐺' },
    { id: 8, name: '안전지대 1', type: 'safe-room', x: 700, y: 450, icon: '🛡️', isSafeZone: true },
    { id: 9, name: '거미의 방', type: 'yokai-room', x: 700, y: 350, icon: '🕷️' },
    { id: 10, name: '망령의 방', type: 'yokai-room', x: 700, y: 250, icon: '👻' },
    
    // 상단 경로
    { id: 11, name: '지옥의 방', type: 'yokai-room', x: 600, y: 250, icon: '🔥' },
    { id: 12, name: '얼음의 방', type: 'yokai-room', x: 500, y: 250, icon: '❄️' },
    { id: 13, name: '안전지대 2', type: 'safe-room', x: 400, y: 250, icon: '🛡️', isSafeZone: true },
    { id: 14, name: '거울의 방', type: 'special-room', x: 300, y: 250, icon: '🪞' },
    { id: 15, name: '인형의 방', type: 'yokai-room', x: 200, y: 250, icon: '🪆' },
    
    // 좌측 하강 경로
    { id: 16, name: '박쥐의 방', type: 'yokai-room', x: 200, y: 350, icon: '🦇' },
    { id: 17, name: '도마뱀의 방', type: 'yokai-room', x: 200, y: 450, icon: '🦎' },
    { id: 18, name: '안전지대 3', type: 'safe-room', x: 200, y: 550, icon: '🛡️', isSafeZone: true },
    
    // 중앙부 - 대마왕 구역
    { id: 19, name: '대마왕의 방', type: 'boss-room', x: 450, y: 450, icon: '👹' },
    
    // 죽음의 신 다리 구간 (최종 경로)
    { id: 20, name: '죽음의 다리 1', type: 'bridge', x: 300, y: 150, icon: '🌉' },
    { id: 21, name: '죽음의 다리 2', type: 'bridge', x: 400, y: 150, icon: '🌉' },
    { id: 22, name: '죽음의 다리 3', type: 'bridge', x: 500, y: 150, icon: '🌉' },
    { id: 23, name: '죽음의 다리 4', type: 'bridge', x: 600, y: 150, icon: '🌉' },
    
    // 탈출구
    { id: 24, name: '탈출구', type: 'end', x: 100, y: 550, icon: '🚪' }
];

// 방 연결 정보
export const CONNECTIONS = [
    // 시작점에서 첫 경로
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    
    // 우측 상승
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 8, to: 9 },
    { from: 9, to: 10 },
    
    // 상단 경로
    { from: 10, to: 11 },
    { from: 11, to: 12 },
    { from: 12, to: 13 },
    { from: 13, to: 14 },
    { from: 14, to: 15 },
    
    // 좌측 하강
    { from: 15, to: 16 },
    { from: 16, to: 17 },
    { from: 17, to: 18 },
    
    // 대마왕 방 연결 (특수 경로)
    { from: 18, to: 19 },
    { from: 19, to: 20 },
    
    // 죽음의 다리
    { from: 20, to: 21 },
    { from: 21, to: 22 },
    { from: 22, to: 23 },
    { from: 23, to: 24 },
    
    // 탈출구는 시작점 근처
    { from: 24, to: 0 } // 순환 표시용
];

// 특수 방 효과
export const ROOM_EFFECTS = {
    '뱀의 탑': {
        description: '뱀에게 물려 1턴 쉬어야 합니다',
        effect: 'skip_turn'
    },
    '거울의 방': {
        description: '거울에 비친 자신을 보고 2칸 뒤로 갑니다',
        effect: 'move_back',
        value: 2
    },
    '대마왕의 방': {
        description: '대마왕은 절대 이길 수 없습니다',
        effect: 'unbeatable'
    }
};

// 요괴 정보
export const YOKAI_DATA = {
    '요괴의 화장실': { name: '화장실 귀신', weakness: ['빛', '물'] },
    '피의 방': { name: '흡혈귀', weakness: ['십자가', '마늘'] },
    '고문의 방': { name: '고문관', weakness: ['정의', '용기'] },
    '비명의 방': { name: '절규령', weakness: ['침묵', '평화'] },
    '저주의 방': { name: '저주받은 영혼', weakness: ['축복', '정화'] },
    '짐승의 방': { name: '늑대인간', weakness: ['은', '달빛'] },
    '거미의 방': { name: '거대거미', weakness: ['불', '검'] },
    '악마의 방': { name: '악마', weakness: ['성수', '기도'] },
    '망령의 방': { name: '망령', weakness: ['염주', '부적'] },
    '지옥의 방': { name: '지옥견', weakness: ['얼음', '물'] },
    '얼음의 방': { name: '설녀', weakness: ['불', '열기'] },
    '어둠의 방': { name: '그림자', weakness: ['빛', '태양'] },
    '인형의 방': { name: '저주받은 인형', weakness: ['가위', '불'] },
    '박쥐의 방': { name: '흡혈박쥐', weakness: ['초음파', '빛'] },
    '도마뱀의 방': { name: '도마뱀인간', weakness: ['추위', '얼음'] },
    '고양이의 방': { name: '요괴고양이', weakness: ['개', '물'] }
};