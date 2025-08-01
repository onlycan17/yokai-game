/**
 * 요괴의 성 탈출 - 보드 데이터
 * CLAUDE.md 규칙에 따른 클린 코드 구현
 */

/**
 * 보드 데이터 클래스
 * 게임 보드의 정적 데이터를 관리합니다
 */
export class BoardData {
    constructor() {
        this.rooms = this.initializeRooms();
        this.connections = this.initializeConnections();
        this.guardianDeckLayout = this.initializeGuardianDeck();
        this.roomEffects = this.initializeRoomEffects();
        this.yokaiData = this.initializeYokaiData();
    }

    /**
     * 방 데이터 초기화 (원본 7x7 나선형 레이아웃 기준)
     * @returns {Array} 방 배열
     */
    initializeRooms() {
        return [
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
    }

    /**
     * 연결 데이터 초기화 (순차적 연결)
     * @returns {Array} 연결 배열
     */
    initializeConnections() {
        const connections = [];
        for (let i = 0; i < this.rooms.length - 1; i++) {
            connections.push({ from: i, to: i + 1 });
        }
        return connections;
    }

    /**
     * 수호신 덱 레이아웃 초기화
     * @returns {Object} 수호신 덱 레이아웃
     */
    initializeGuardianDeck() {
        return {
            center: { x: 450, y: 350 },
            cardPositions: [
                { id: 'fire', name: '불', position: { x: -60, y: -80 }, icon: '🔥' },
                { id: 'light', name: '빛', position: { x: 60, y: -80 }, icon: '💡' },
                { id: 'peace', name: '평화', position: { x: -60, y: -20 }, icon: '☮️' },
                { id: 'justice', name: '정의', position: { x: 60, y: -20 }, icon: '⚖️' },
                { id: 'purify', name: '정화', position: { x: 0, y: 40 }, icon: '🌊' }
            ]
        };
    }

    /**
     * 특수 방 효과 초기화
     * @returns {Object} 방 효과 데이터
     */
    initializeRoomEffects() {
        return {
            '뱀의 탑': {
                description: '뱀에게 물려 1턴 쉬어야 합니다',
                effect: 'skip_turn'
            },
            '거울의 방': {
                description: '거울에 비친 자신을 보고 혼란에 빠집니다',
                effect: 'confusion'
            },
            '복권의 방': {
                description: '행운 또는 불운이 찾아옵니다',
                effect: 'random_effect'
            }
        };
    }

    /**
     * 요괴 데이터 초기화
     * @returns {Object} 요괴 데이터
     */
    initializeYokaiData() {
        return {
            '요괴의 화장실': { 
                name: '화장실 귀신', 
                description: '어둠 속에서 당신을 노려보는 축축한 귀신입니다.',
                weakness: ['빛', '물'], 
                attack: 2,
                passingDice: [3, 4, 5, 6], // 통과 가능한 주사위 번호
                icon: '🚽'
            },
            '거미의 방': { 
                name: '거대거미', 
                description: '여덟 개의 다리로 천장을 기어다니는 거대한 거미입니다.',
                weakness: ['불', '검'], 
                attack: 3,
                passingDice: [2, 4, 5, 6],
                icon: '🕷️'
            },
            '절망의 방': { 
                name: '절규령', 
                description: '끔찍한 비명소리를 내며 정신을 공격하는 원령입니다.',
                weakness: ['침묵', '평화'], 
                attack: 4,
                passingDice: [3, 5, 6],
                icon: '😱'
            },
            '뱀의 탑': { 
                name: '독사', 
                description: '치명적인 독을 품은 거대한 뱀이 똬리를 틀고 있습니다.',
                weakness: ['얼음', '독'], 
                attack: 3,
                passingDice: [1, 3, 5],
                icon: '🐍'
            },
            '저주의 방': { 
                name: '저주받은 영혼', 
                description: '오래된 원한으로 가득 찬 저주받은 영혼입니다.',
                weakness: ['축복', '정화'], 
                attack: 5,
                passingDice: [5, 6], // 어려운 방
                icon: '💀'
            },
            '집승의 방': { 
                name: '박쥐 군단', 
                description: '수백 마리의 박쥐가 날카로운 이빨을 드러내고 있습니다.',
                weakness: ['초음파', '빛'], 
                attack: 2,
                passingDice: [2, 3, 4, 5],
                icon: '🦇'
            },
            '악마의 방': { 
                name: '악마', 
                description: '지옥에서 올라온 강력한 악마가 불꽃 속에서 웃고 있습니다.',
                weakness: ['성수', '기도'], 
                attack: 6,
                passingDice: [6], // 매우 어려운 방
                icon: '😈'
            },
            '망령의 방': { 
                name: '망령', 
                description: '원한에 가득 찬 망령이 공중에 떠다니고 있습니다.',
                weakness: ['염주', '부적'], 
                attack: 4,
                passingDice: [2, 4, 6],
                icon: '👻'
            },
            '지옥의 방': { 
                name: '지옥견', 
                description: '세 개의 머리를 가진 지옥의 개가 불을 뿜고 있습니다.',
                weakness: ['얼음', '물'], 
                attack: 5,
                passingDice: [4, 5],
                icon: '🔥'
            },
            '폭탄의 방': { 
                name: '폭발령', 
                description: '언제 터질지 모르는 위험한 폭발 에너지가 가득합니다.',
                weakness: ['물', '평화'], 
                attack: 4,
                passingDice: [1, 2, 3],
                icon: '💣'
            },
            '유령의 방': { 
                name: '유령', 
                description: '창백한 유령이 슬픈 신음소리를 내고 있습니다.',
                weakness: ['빛', '정화'], 
                attack: 3,
                passingDice: [3, 4, 5],
                icon: '👻'
            },
            '늑대의 방': { 
                name: '늑대인간', 
                description: '보름달 아래 변신한 늑대인간이 으르렁거립니다.',
                weakness: ['은', '달빛'], 
                attack: 4,
                passingDice: [2, 5, 6],
                icon: '🐺'
            },
            '독수리의 방': { 
                name: '거대독수리', 
                description: '날카로운 발톱을 가진 거대한 독수리가 날개를 펼칩니다.',
                weakness: ['바람', '화살'], 
                attack: 3,
                passingDice: [1, 3, 4, 6],
                icon: '🦅'
            },
            '고양이의 방': { 
                name: '요괴고양이', 
                description: '두 꼬리를 가진 요괴 고양이가 불길한 빛을 내뿜습니다.',
                weakness: ['개', '물'], 
                attack: 2,
                passingDice: [1, 2, 3, 4, 5], // 쉬운 방
                icon: '🐈'
            },
            '전갈의 방': { 
                name: '거대전갈', 
                description: '독침을 높이 든 거대한 전갈이 위협적으로 다가옵니다.',
                weakness: ['얼음', '독'], 
                attack: 4,
                passingDice: [3, 6],
                icon: '🦂'
            },
            '뱀의 방': { 
                name: '독사왕', 
                description: '모든 뱀의 왕, 거대한 독사가 똬리를 틀고 있습니다.',
                weakness: ['얼음', '독'], 
                attack: 5,
                passingDice: [1, 4],
                icon: '🐍'
            }
        };
    }

    /**
     * 방 데이터 반환
     * @returns {Array} 방 배열
     */
    getRooms() {
        return this.rooms;
    }

    /**
     * 연결 데이터 반환
     * @returns {Array} 연결 배열
     */
    getConnections() {
        return this.connections;
    }

    /**
     * 수호신 덱 레이아웃 반환
     * @returns {Object} 수호신 덱 레이아웃
     */
    getGuardianDeckLayout() {
        return this.guardianDeckLayout;
    }

    /**
     * 특정 방 데이터 반환
     * @param {number} roomId 방 ID
     * @returns {Object|null} 방 데이터
     */
    getRoom(roomId) {
        return this.rooms.find(room => room.id === roomId) || null;
    }

    /**
     * 특정 타입의 방들 반환
     * @param {string} type 방 타입
     * @returns {Array} 해당 타입의 방 배열
     */
    getRoomsByType(type) {
        return this.rooms.filter(room => room.type === type);
    }

    /**
     * 안전지대 방들 반환
     * @returns {Array} 안전지대 방 배열
     */
    getSafeRooms() {
        return this.rooms.filter(room => room.isSafeZone);
    }

    /**
     * 방 효과 데이터 반환
     * @param {string} roomName 방 이름
     * @returns {Object|null} 방 효과 데이터
     */
    getRoomEffect(roomName) {
        return this.roomEffects[roomName] || null;
    }

    /**
     * 요괴 데이터 반환
     * @param {string} roomName 방 이름
     * @returns {Object|null} 요괴 데이터
     */
    getYokaiData(roomName) {
        return this.yokaiData[roomName] || null;
    }

    /**
     * 방 사이의 연결성 확인
     * @param {number} fromRoomId 시작 방 ID
     * @param {number} toRoomId 도착 방 ID
     * @returns {boolean} 연결 여부
     */
    isConnected(fromRoomId, toRoomId) {
        return this.connections.some(conn => 
            (conn.from === fromRoomId && conn.to === toRoomId) ||
            (conn.from === toRoomId && conn.to === fromRoomId)
        );
    }

    /**
     * 인접한 방 ID 배열 반환
     * @param {number} roomId 방 ID
     * @returns {Array} 인접한 방 ID 배열
     */
    getAdjacentRooms(roomId) {
        const adjacent = [];
        
        this.connections.forEach(conn => {
            if (conn.from === roomId) adjacent.push(conn.to);
            if (conn.to === roomId) adjacent.push(conn.from);
        });
        
        return adjacent;
    }
}

// 기본 내보내기
export default BoardData;