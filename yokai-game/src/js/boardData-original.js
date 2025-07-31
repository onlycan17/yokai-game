// 원본 스크린샷 기반 보드 데이터

// 나선형 보드 레이아웃 - 7x7 그리드 기반
export const SPIRAL_BOARD_LAYOUT = [
    // 시작점
    { id: 0, name: '시작', type: 'start', position: { x: 0, y: 6 }, icon: '🏠', isSafeZone: true },
    
    // 첫 번째 줄 (하단, 왼쪽에서 오른쪽)
    { id: 1, name: '요괴의 화장실', type: 'yokai-room', position: { x: 1, y: 6 }, icon: '🚽' },
    { id: 2, name: '거미의 방', type: 'yokai-room', position: { x: 2, y: 6 }, icon: '🕷️' },
    { id: 3, name: '안전지대', type: 'safe-room', position: { x: 3, y: 6 }, icon: '🛡️', isSafeZone: true },
    { id: 4, name: '절망의 방', type: 'yokai-room', position: { x: 4, y: 6 }, icon: '😱' },
    { id: 5, name: '뱀의 탑', type: 'yokai-room', position: { x: 5, y: 6 }, icon: '🐍' },
    { id: 6, name: '저주의 방', type: 'yokai-room', position: { x: 6, y: 6 }, icon: '💀' },
    
    // 오른쪽 세로줄 (아래에서 위로)
    { id: 7, name: '집승의 방', type: 'yokai-room', position: { x: 6, y: 5 }, icon: '🦇' },
    { id: 8, name: '거미의 방', type: 'yokai-room', position: { x: 6, y: 4 }, icon: '🕷️' },
    { id: 9, name: '악마의 방', type: 'yokai-room', position: { x: 6, y: 3 }, icon: '😈' },
    { id: 10, name: '망령의 방', type: 'yokai-room', position: { x: 6, y: 2 }, icon: '👻' },
    { id: 11, name: '지옥의 방', type: 'yokai-room', position: { x: 6, y: 1 }, icon: '🔥' },
    { id: 12, name: '복권의 방', type: 'special-room', position: { x: 6, y: 0 }, icon: '🎰', effect: 'random_effect' },
    
    // 상단 가로줄 (오른쪽에서 왼쪽)
    { id: 13, name: '폭탄의 방', type: 'yokai-room', position: { x: 5, y: 0 }, icon: '💣' },
    { id: 14, name: '유령의 방', type: 'yokai-room', position: { x: 4, y: 0 }, icon: '👻' },
    { id: 15, name: '수호신의 제단', type: 'guardian-room', position: { x: 3, y: 0 }, icon: '🙏', effect: 'gain_guardian' },
    { id: 16, name: '늑대의 방', type: 'yokai-room', position: { x: 2, y: 0 }, icon: '🐺' },
    { id: 17, name: '독수리의 방', type: 'yokai-room', position: { x: 1, y: 0 }, icon: '🦅' },
    { id: 18, name: '고양이의 방', type: 'yokai-room', position: { x: 0, y: 0 }, icon: '🐈' },
    
    // 왼쪽 세로줄 - 위에서 아래로
    { id: 19, name: '전갈의 방', type: 'yokai-room', position: { x: 0, y: 1 }, icon: '🦂' },
    { id: 20, name: '늑대의 방', type: 'yokai-room', position: { x: 0, y: 2 }, icon: '🐺' },
    { id: 21, name: '축복의 제단', type: 'guardian-room', position: { x: 0, y: 3 }, icon: '🙏', effect: 'gain_guardian' },
    { id: 22, name: '뱀의 방', type: 'yokai-room', position: { x: 0, y: 4 }, icon: '🐍' },
    { id: 23, name: '독수리의 방', type: 'yokai-room', position: { x: 0, y: 5 }, icon: '🦅' },

    // 탈출구 (중앙)
    { id: 24, name: '탈출구', type: 'end', position: { x: 3, y: 3 }, icon: '🚪' }
];

// 각도를 x,y 좌표로 변환하는 함수
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// 연결 정보 (순차적)
export const SPIRAL_CONNECTIONS = [];
for (let i = 0; i < SPIRAL_BOARD_LAYOUT.length - 1; i++) {
    SPIRAL_CONNECTIONS.push({ from: i, to: i + 1 });
}

// 중앙 수호신 카드 영역 데이터
export const GUARDIAN_DECK_LAYOUT = {
    center: { x: 450, y: 350 },
    cardPositions: [
        { id: 'fire', name: '불', position: { x: -60, y: -80 }, icon: '🔥' },
        { id: 'light', name: '빛', position: { x: 60, y: -80 }, icon: '💡' },
        { id: 'peace', name: '평화', position: { x: -60, y: -20 }, icon: '☮️' },
        { id: 'justice', name: '정의', position: { x: 60, y: -20 }, icon: '⚖️' },
        { id: 'purify', name: '정화', position: { x: 0, y: 40 }, icon: '🌊' }
    ]
};

// 특수 방 효과 (원본 기준)
export const ORIGINAL_ROOM_EFFECTS = {
    '뱀의 탑': {
        description: '뱀에게 물려 1턴 쉬어야 합니다',
        effect: 'skip_turn'
    },
    '거울의 방': {
        description: '거울에 비친 자신을 보고 혼란에 빠집니다',
        effect: 'confusion'
    }
};