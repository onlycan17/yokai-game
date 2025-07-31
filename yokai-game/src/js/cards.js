// 카드 데이터 및 관리 시스템

// 요괴 카드 데이터
const yokaiCards = [
    {
        id: 'y001',
        name: '구미호',
        type: 'yokai',
        power: 8,
        defense: 6,
        description: '아홉 개의 꼬리를 가진 여우 요괴',
        ability: '매 턴마다 체력 1 회복'
    },
    {
        id: 'y002',
        name: '오니',
        type: 'yokai',
        power: 10,
        defense: 8,
        description: '거대한 뿔을 가진 일본의 악귀',
        ability: '공격력 +2 보너스'
    },
    {
        id: 'y003',
        name: '유키온나',
        type: 'yokai',
        power: 6,
        defense: 7,
        description: '눈의 여인, 차가운 숨결로 공격',
        ability: '상대를 1턴 동결'
    },
    {
        id: 'y004',
        name: '텐구',
        type: 'yokai',
        power: 7,
        defense: 5,
        description: '긴 코를 가진 산의 정령',
        ability: '비행 능력'
    },
    {
        id: 'y005',
        name: '갓파',
        type: 'yokai',
        power: 5,
        defense: 6,
        description: '물에서 사는 거북이 요괴',
        ability: '물 속성 공격 무효'
    },
    {
        id: 'boss',
        name: '대마왕',
        type: 'yokai',
        power: 15,
        defense: 12,
        description: '성의 지배자, 모든 요괴의 왕',
        ability: '모든 속성 공격에 저항'
    }
];

// 아이템 카드 데이터
const itemCards = [
    {
        id: 'i001',
        name: '빨간 열쇠',
        type: 'item',
        description: '빨간 문을 열 수 있는 열쇠',
        effect: 'openRedDoor'
    },
    {
        id: 'i002',
        name: '파란 열쇠',
        type: 'item',
        description: '파란 문을 열 수 있는 열쇠',
        effect: 'openBlueDoor'
    },
    {
        id: 'i003',
        name: '노란 열쇠',
        type: 'item',
        description: '노란 문을 열 수 있는 열쇠',
        effect: 'openYellowDoor'
    },
    {
        id: 'i004',
        name: '체력 물약',
        type: 'item',
        description: '체력을 5 회복한다',
        effect: 'heal',
        value: 5
    },
    {
        id: 'i005',
        name: '보호 부적',
        type: 'item',
        description: '다음 공격을 막아준다',
        effect: 'shield'
    }
];

// 무기 카드 데이터
const weaponCards = [
    {
        id: 'w001',
        name: '퇴마검',
        type: 'weapon',
        power: 3,
        description: '요괴에게 추가 피해를 입힌다',
        special: '요괴에게 +2 추가 피해'
    },
    {
        id: 'w002',
        name: '신성한 활',
        type: 'weapon',
        power: 2,
        description: '원거리 공격 가능',
        special: '선제 공격'
    },
    {
        id: 'w003',
        name: '마법 지팡이',
        type: 'weapon',
        power: 2,
        description: '마법 공격력 증가',
        special: '주사위 +1'
    }
];

// 카드 생성 함수
function createCardElement(cardData) {
    const card = document.createElement('div');
    card.className = `card ${cardData.type}`;
    card.dataset.cardId = cardData.id;
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    let statsHTML = '';
    if (cardData.power !== undefined) {
        statsHTML = `
            <div class="card-stats">
                <div class="stat">
                    <span class="stat-icon">⚔️</span>
                    <span>${cardData.power}</span>
                </div>
                ${cardData.defense !== undefined ? `
                <div class="stat">
                    <span class="stat-icon">🛡️</span>
                    <span>${cardData.defense}</span>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    cardFront.innerHTML = `
        <div class="card-title">${cardData.name}</div>
        <div class="card-image">
            <div class="card-icon">${getCardIcon(cardData)}</div>
        </div>
        ${statsHTML}
        <div class="card-description">${cardData.description}</div>
    `;
    
    card.appendChild(cardFront);
    
    // 카드 뒤집기 이벤트
    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
    });
    
    return card;
}

// 카드 아이콘 생성
function getCardIcon(cardData) {
    const icons = {
        '구미호': '🦊',
        '오니': '👹',
        '유키온나': '❄️',
        '텐구': '👺',
        '갓파': '🐢',
        '대마왕': '👾',
        '빨간 열쇠': '🔴',
        '파란 열쇠': '🔵',
        '노란 열쇠': '🟡',
        '체력 물약': '🧪',
        '보호 부적': '🛡️',
        '퇴마검': '⚔️',
        '신성한 활': '🏹',
        '마법 지팡이': '🔮'
    };
    
    return icons[cardData.name] || '❓';
}

// 카드 덱 초기화
function initializeCardDeck() {
    const cardDeck = document.getElementById('card-deck');
    
    // 카드 뒷면 표시
    const cardBack = document.createElement('div');
    cardBack.className = 'card back';
    cardDeck.appendChild(cardBack);
    
    // 클릭 시 카드 뽑기
    cardBack.addEventListener('click', drawCard);
}

// 카드 뽑기 함수
function drawCard() {
    const allCards = [...yokaiCards, ...itemCards, ...weaponCards];
    const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
    
    const cardElement = createCardElement(randomCard);
    
    // 카드 뽑기 애니메이션
    cardElement.style.transform = 'translateX(200px) rotateY(180deg)';
    document.getElementById('card-deck').appendChild(cardElement);
    
    setTimeout(() => {
        cardElement.style.transform = 'translateX(0) rotateY(0)';
    }, 100);
    
    return randomCard;
}

// 손패 관리
class HandManager {
    constructor() {
        this.hand = [];
        this.maxHandSize = 5;
    }
    
    addCard(card) {
        if (this.hand.length < this.maxHandSize) {
            this.hand.push(card);
            this.updateHandDisplay();
            return true;
        }
        return false;
    }
    
    removeCard(cardId) {
        this.hand = this.hand.filter(card => card.id !== cardId);
        this.updateHandDisplay();
    }
    
    updateHandDisplay() {
        const handArea = document.querySelector('.hand-area');
        if (!handArea) return;
        
        handArea.innerHTML = '';
        this.hand.forEach(card => {
            const cardElement = createCardElement(card);
            handArea.appendChild(cardElement);
        });
    }
}

// 카드 시스템 초기화
const handManager = new HandManager();

export { 
    yokaiCards, 
    itemCards, 
    weaponCards, 
    createCardElement, 
    initializeCardDeck, 
    drawCard,
    handManager 
};