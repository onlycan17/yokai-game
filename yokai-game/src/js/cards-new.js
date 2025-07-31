// 원본 게임 카드 시스템

// 요괴 카드 데이터 (약점 포함)
export const YOKAI_CARDS = [
    // 일반 요괴들
    {
        id: 'y001',
        name: '화장실 귀신',
        type: 'yokai',
        weakness: ['빛', '물'],
        description: '어두운 화장실에 숨어있는 요괴',
        power: 3
    },
    {
        id: 'y002',
        name: '흡혈귀',
        type: 'yokai',
        weakness: ['십자가', '마늘'],
        description: '피를 마시는 불멸의 존재',
        power: 5
    },
    {
        id: 'y003',
        name: '늑대인간',
        type: 'yokai',
        weakness: ['은', '달빛'],
        description: '보름달에 변신하는 저주받은 자',
        power: 4
    },
    {
        id: 'y004',
        name: '설녀',
        type: 'yokai',
        weakness: ['불', '열기'],
        description: '차가운 숨결로 얼려버리는 눈의 여인',
        power: 4
    },
    {
        id: 'y005',
        name: '저주받은 인형',
        type: 'yokai',
        weakness: ['가위', '불'],
        description: '밤에 움직이는 공포의 인형',
        power: 3
    },
    {
        id: 'y006',
        name: '그림자',
        type: 'yokai',
        weakness: ['빛', '태양'],
        description: '어둠 속에 숨어있는 형체',
        power: 2
    },
    {
        id: 'y007',
        name: '망령',
        type: 'yokai',
        weakness: ['염주', '부적'],
        description: '성불하지 못한 원혼',
        power: 3
    },
    {
        id: 'y008',
        name: '악마',
        type: 'yokai',
        weakness: ['성수', '기도'],
        description: '지옥에서 온 사악한 존재',
        power: 6
    },
    {
        id: 'y009',
        name: '거대거미',
        type: 'yokai',
        weakness: ['불', '검'],
        description: '거미줄로 먹이를 사냥하는 괴물',
        power: 3
    },
    {
        id: 'y010',
        name: '좀비',
        type: 'yokai',
        weakness: ['머리공격', '불'],
        description: '되살아난 시체',
        power: 2
    },
    {
        id: 'boss',
        name: '대마왕',
        type: 'yokai',
        weakness: [], // 약점 없음
        description: '성의 지배자, 절대 이길 수 없는 존재',
        power: 99
    }
];

// 수호신 카드 (요괴의 약점에 대응)
export const GUARDIAN_CARDS = [
    { id: 'g001', name: '빛', type: 'guardian', icon: '💡' },
    { id: 'g002', name: '물', type: 'guardian', icon: '💧' },
    { id: 'g003', name: '십자가', type: 'guardian', icon: '✝️' },
    { id: 'g004', name: '마늘', type: 'guardian', icon: '🧄' },
    { id: 'g005', name: '은', type: 'guardian', icon: '🥈' },
    { id: 'g006', name: '달빛', type: 'guardian', icon: '🌙' },
    { id: 'g007', name: '불', type: 'guardian', icon: '🔥' },
    { id: 'g008', name: '열기', type: 'guardian', icon: '♨️' },
    { id: 'g009', name: '가위', type: 'guardian', icon: '✂️' },
    { id: 'g010', name: '태양', type: 'guardian', icon: '☀️' },
    { id: 'g011', name: '염주', type: 'guardian', icon: '📿' },
    { id: 'g012', name: '부적', type: 'guardian', icon: '🧿' },
    { id: 'g013', name: '성수', type: 'guardian', icon: '💦' },
    { id: 'g014', name: '기도', type: 'guardian', icon: '🙏' },
    { id: 'g015', name: '검', type: 'guardian', icon: '⚔️' },
    { id: 'g016', name: '머리공격', type: 'guardian', icon: '🔨' },
    { id: 'g017', name: '정의', type: 'guardian', icon: '⚖️' },
    { id: 'g018', name: '용기', type: 'guardian', icon: '💪' },
    { id: 'g019', name: '침묵', type: 'guardian', icon: '🤫' },
    { id: 'g020', name: '평화', type: 'guardian', icon: '☮️' },
    { id: 'g021', name: '축복', type: 'guardian', icon: '✨' },
    { id: 'g022', name: '정화', type: 'guardian', icon: '🌊' },
    { id: 'g023', name: '초음파', type: 'guardian', icon: '📢' },
    { id: 'g024', name: '추위', type: 'guardian', icon: '❄️' },
    { id: 'g025', name: '얼음', type: 'guardian', icon: '🧊' },
    { id: 'g026', name: '개', type: 'guardian', icon: '🐕' }
];

// 이동 카드
export const MOVEMENT_CARDS = [
    { id: 'm001', name: '1칸 이동', type: 'movement', value: 1, count: 10 },
    { id: 'm002', name: '2칸 이동', type: 'movement', value: 2, count: 8 },
    { id: 'm003', name: '3칸 이동', type: 'movement', value: 3, count: 6 },
    { id: 'm004', name: '4칸 이동', type: 'movement', value: 4, count: 4 },
    { id: 'm005', name: '마하', type: 'movement', value: 6, count: 2 },
    { id: 'm006', name: '엑소시스트', type: 'movement', value: 'choice', count: 2 },
    { id: 'm007', name: '블랙', type: 'movement', value: 0, count: 3 }
];

// 특수 카드
export const SPECIAL_CARDS = [
    {
        id: 's001',
        name: '히토다마',
        type: 'special',
        effect: 'death_move',
        description: '죽음의 신이 1칸 이동합니다'
    },
    {
        id: 's002',
        name: '럭키',
        type: 'special',
        effect: 'extra_guardian',
        description: '수호신 카드를 2장 더 뽑습니다'
    }
];

// 카드 덱 관리 클래스
export class CardDeck {
    constructor() {
        this.yokaiDeck = [];
        this.guardianDeck = [];
        this.movementDeck = [];
        this.specialDeck = [];
        this.initializeDecks();
    }
    
    // 덱 초기화
    initializeDecks() {
        // 요괴 덱 (대마왕 제외)
        this.yokaiDeck = [...YOKAI_CARDS.filter(c => c.id !== 'boss')];
        this.shuffleDeck(this.yokaiDeck);
        
        // 수호신 덱
        this.guardianDeck = [...GUARDIAN_CARDS];
        this.shuffleDeck(this.guardianDeck);
        
        // 이동 카드 덱 (개수만큼 복사)
        this.movementDeck = [];
        MOVEMENT_CARDS.forEach(card => {
            for (let i = 0; i < card.count; i++) {
                this.movementDeck.push({...card});
            }
        });
        this.shuffleDeck(this.movementDeck);
        
        // 특수 카드는 요괴 덱에 섞음
        SPECIAL_CARDS.forEach(card => {
            this.yokaiDeck.splice(
                Math.floor(Math.random() * this.yokaiDeck.length),
                0,
                card
            );
        });
    }
    
    // 덱 섞기 (Fisher-Yates)
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    // 요괴 카드 뽑기
    drawYokaiCard() {
        if (this.yokaiDeck.length === 0) {
            // 덱이 비면 대마왕 카드 반환
            return YOKAI_CARDS.find(c => c.id === 'boss');
        }
        return this.yokaiDeck.pop();
    }
    
    // 수호신 카드 뽑기
    drawGuardianCard(count = 1) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            if (this.guardianDeck.length > 0) {
                cards.push(this.guardianDeck.pop());
            }
        }
        return cards;
    }
    
    // 이동 카드 뽑기
    drawMovementCard() {
        if (this.movementDeck.length === 0) {
            this.initializeMovementDeck();
        }
        return this.movementDeck.pop();
    }
    
    // 이동 카드 덱 재초기화
    initializeMovementDeck() {
        this.movementDeck = [];
        MOVEMENT_CARDS.forEach(card => {
            for (let i = 0; i < card.count; i++) {
                this.movementDeck.push({...card});
            }
        });
        this.shuffleDeck(this.movementDeck);
    }
}

// 카드 UI 생성 함수
export function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.type}`;
    cardEl.dataset.cardId = card.id;
    
    // 동적으로 이미지 생성기 로드
    import('./imageGenerator.js').then(({ GameImageGenerator }) => {
        let backgroundImage;
        
        if (card.type === 'yokai') {
            const iconEmoji = getYokaiIcon(card.name);
            backgroundImage = GameImageGenerator.createYokaiCard(card.name, iconEmoji);
        } else if (card.type === 'guardian') {
            backgroundImage = GameImageGenerator.createGuardianCard(card.name, card.icon);
        } else if (card.type === 'movement') {
            backgroundImage = GameImageGenerator.createMovementCard(card.name, card.value);
        }
        
        if (backgroundImage) {
            cardEl.style.backgroundImage = `url(${backgroundImage})`;
            cardEl.style.backgroundSize = 'cover';
            cardEl.style.backgroundPosition = 'center';
        }
    });
    
    if (card.type === 'yokai') {
        cardEl.innerHTML = `
            <div class="card-content">
                <div class="card-title">${card.name}</div>
                <div class="card-power">공격력: ${card.power}</div>
                <div class="card-weakness">
                    약점: ${card.weakness.length > 0 ? card.weakness.join(', ') : '없음'}
                </div>
                <div class="card-description">${card.description}</div>
            </div>
        `;
    } else if (card.type === 'guardian') {
        cardEl.innerHTML = `
            <div class="card-content">
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.name}</div>
                <div class="card-type">수호신</div>
            </div>
        `;
    } else if (card.type === 'movement') {
        const valueText = card.value === 'choice' ? '선택' : 
                         card.value === 0 ? '이동 불가' : 
                         `${card.value}칸`;
        cardEl.innerHTML = `
            <div class="card-content">
                <div class="card-title">${card.name}</div>
                <div class="card-value">${valueText}</div>
            </div>
        `;
    } else if (card.type === 'special') {
        cardEl.innerHTML = `
            <div class="card-content">
                <div class="card-title">${card.name}</div>
                <div class="card-description">${card.description}</div>
            </div>
        `;
    }
    
    return cardEl;
}

// 요괴 아이콘 매핑
function getYokaiIcon(yokaiName) {
    const iconMap = {
        '화장실 귀신': '🚽',
        '흡혈귀': '🧛',
        '늑대인간': '🐺',
        '설녀': '❄️',
        '저주받은 인형': '🪆',
        '그림자': '👤',
        '망령': '👻',
        '악마': '😈',
        '거대거미': '🕷️',
        '좀비': '🧟',
        '대마왕': '👹'
    };
    return iconMap[yokaiName] || '👻';
}