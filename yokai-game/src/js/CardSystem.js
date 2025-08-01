/**
 * 요괴의 성 탈출 - 카드 시스템
 * CLAUDE.md 규칙에 따른 클린 코드 구현
 */

/**
 * 게임 상태 열거형
 */
export const CardType = {
    YOKAI: 'yokai',
    GUARDIAN: 'guardian',
    MOVEMENT: 'movement',
    SPECIAL: 'special'
};

/**
 * 카드 시스템 클래스
 * 카드 덱 관리, 카드 생성, 카드 효과 처리를 담당
 */
export class CardSystem {
    constructor() {
        this.yokaiCards = this.initializeYokaiCards();
        this.guardianCards = this.initializeGuardianCards();
        this.movementCards = this.initializeMovementCards();
        this.specialCards = this.initializeSpecialCards();
        
        this.playerHand = [];
        this.usedCards = [];
        
        this.initializeDecks();
    }

    /**
     * 요괴 카드 데이터 초기화
     * @returns {Array} 요괴 카드 배열
     */
    initializeYokaiCards() {
        return [
            {
                id: 'y001',
                name: '화장실 귀신',
                type: CardType.YOKAI,
                weakness: ['빛', '물'],
                description: '어두운 화장실에 숨어있는 요괴',
                power: 3,
                icon: '🚽'
            },
            {
                id: 'y002',
                name: '흡혈귀',
                type: CardType.YOKAI,
                weakness: ['십자가', '마늘'],
                description: '피를 마시는 불멸의 존재',
                power: 5,
                icon: '🧛'
            },
            {
                id: 'y003',
                name: '늑대인간',
                type: CardType.YOKAI,
                weakness: ['은', '달빛'],
                description: '보름달에 변신하는 저주받은 자',
                power: 4,
                icon: '🐺'
            },
            {
                id: 'y004',
                name: '설녀',
                type: CardType.YOKAI,
                weakness: ['불', '열기'],
                description: '차가운 숨결로 얼려버리는 눈의 여인',
                power: 4,
                icon: '❄️'
            },
            {
                id: 'y005',
                name: '저주받은 인형',
                type: CardType.YOKAI,
                weakness: ['가위', '불'],
                description: '밤에 움직이는 공포의 인형',
                power: 3,
                icon: '🪆'
            },
            {
                id: 'y006',
                name: '그림자',
                type: CardType.YOKAI,
                weakness: ['빛', '태양'],
                description: '어둠 속에 숨어있는 형체',
                power: 2,
                icon: '👤'
            },
            {
                id: 'y007',
                name: '망령',
                type: CardType.YOKAI,
                weakness: ['염주', '부적'],
                description: '성불하지 못한 원혼',
                power: 3,
                icon: '👻'
            },
            {
                id: 'y008',
                name: '악마',
                type: CardType.YOKAI,
                weakness: ['성수', '기도'],
                description: '지옥에서 온 사악한 존재',
                power: 6,
                icon: '😈'
            },
            {
                id: 'y009',
                name: '거대거미',
                type: CardType.YOKAI,
                weakness: ['불', '검'],
                description: '거미줄로 먹이를 사냥하는 괴물',
                power: 3,
                icon: '🕷️'
            },
            {
                id: 'y010',
                name: '좀비',
                type: CardType.YOKAI,
                weakness: ['머리공격', '불'],
                description: '되살아난 시체',
                power: 2,
                icon: '🧟'
            },
            {
                id: 'boss',
                name: '대마왕',
                type: CardType.YOKAI,
                weakness: [],
                description: '성의 지배자, 절대 이길 수 없는 존재',
                power: 99,
                icon: '👹'
            }
        ];
    }

    /**
     * 수호신 카드 데이터 초기화
     * @returns {Array} 수호신 카드 배열
     */
    initializeGuardianCards() {
        return [
            { id: 'g001', name: '빛', type: CardType.GUARDIAN, icon: '💡' },
            { id: 'g002', name: '물', type: CardType.GUARDIAN, icon: '💧' },
            { id: 'g003', name: '십자가', type: CardType.GUARDIAN, icon: '✝️' },
            { id: 'g004', name: '마늘', type: CardType.GUARDIAN, icon: '🧄' },
            { id: 'g005', name: '은', type: CardType.GUARDIAN, icon: '🥈' },
            { id: 'g006', name: '달빛', type: CardType.GUARDIAN, icon: '🌙' },
            { id: 'g007', name: '불', type: CardType.GUARDIAN, icon: '🔥' },
            { id: 'g008', name: '열기', type: CardType.GUARDIAN, icon: '♨️' },
            { id: 'g009', name: '가위', type: CardType.GUARDIAN, icon: '✂️' },
            { id: 'g010', name: '태양', type: CardType.GUARDIAN, icon: '☀️' },
            { id: 'g011', name: '염주', type: CardType.GUARDIAN, icon: '📿' },
            { id: 'g012', name: '부적', type: CardType.GUARDIAN, icon: '🧿' },
            { id: 'g013', name: '성수', type: CardType.GUARDIAN, icon: '💦' },
            { id: 'g014', name: '기도', type: CardType.GUARDIAN, icon: '🙏' },
            { id: 'g015', name: '검', type: CardType.GUARDIAN, icon: '⚔️' },
            { id: 'g016', name: '머리공격', type: CardType.GUARDIAN, icon: '🔨' },
            { id: 'g017', name: '정의', type: CardType.GUARDIAN, icon: '⚖️' },
            { id: 'g018', name: '용기', type: CardType.GUARDIAN, icon: '💪' },
            { id: 'g019', name: '침묵', type: CardType.GUARDIAN, icon: '🤫' },
            { id: 'g020', name: '평화', type: CardType.GUARDIAN, icon: '☮️' },
            { id: 'g021', name: '축복', type: CardType.GUARDIAN, icon: '✨' },
            { id: 'g022', name: '정화', type: CardType.GUARDIAN, icon: '🌊' },
            { id: 'g023', name: '초음파', type: CardType.GUARDIAN, icon: '📢' },
            { id: 'g024', name: '추위', type: CardType.GUARDIAN, icon: '❄️' },
            { id: 'g025', name: '얼음', type: CardType.GUARDIAN, icon: '🧊' },
            { id: 'g026', name: '개', type: CardType.GUARDIAN, icon: '🐕' }
        ];
    }

    /**
     * 이동 카드 데이터 초기화
     * @returns {Array} 이동 카드 배열
     */
    initializeMovementCards() {
        return [
            { id: 'm001', name: '1칸 이동', type: CardType.MOVEMENT, value: 1, count: 10 },
            { id: 'm002', name: '2칸 이동', type: CardType.MOVEMENT, value: 2, count: 8 },
            { id: 'm003', name: '3칸 이동', type: CardType.MOVEMENT, value: 3, count: 6 },
            { id: 'm004', name: '4칸 이동', type: CardType.MOVEMENT, value: 4, count: 4 },
            { id: 'm005', name: '마하', type: CardType.MOVEMENT, value: 6, count: 2 },
            { id: 'm006', name: '엑소시스트', type: CardType.MOVEMENT, value: 'choice', count: 2 },
            { id: 'm007', name: '블랙', type: CardType.MOVEMENT, value: 0, count: 3 }
        ];
    }

    /**
     * 특수 카드 데이터 초기화
     * @returns {Array} 특수 카드 배열
     */
    initializeSpecialCards() {
        return [
            {
                id: 's001',
                name: '히토다마',
                type: CardType.SPECIAL,
                effect: 'death_move',
                description: '죽음의 신이 1칸 이동합니다',
                icon: '🔥'
            },
            {
                id: 's002',
                name: '럭키',
                type: CardType.SPECIAL,
                effect: 'extra_guardian',
                description: '수호신 카드를 2장 더 뽑습니다',
                icon: '🍀'
            }
        ];
    }

    /**
     * 덱 초기화
     */
    initializeDecks() {
        this.yokaiDeck = [...this.yokaiCards.filter(c => c.id !== 'boss')];
        this.guardianDeck = [...this.guardianCards];
        this.movementDeck = this.createMovementDeck();
        
        this.shuffleDeck(this.yokaiDeck);
        this.shuffleDeck(this.guardianDeck);
        this.shuffleDeck(this.movementDeck);
        
        // 특수 카드를 요괴 덱에 섞기
        this.mixSpecialCards();
    }

    /**
     * 이동 카드 덱 생성 (개수 고려)
     * @returns {Array} 생성된 이동 카드 덱
     */
    createMovementDeck() {
        const deck = [];
        this.movementCards.forEach(card => {
            for (let i = 0; i < card.count; i++) {
                deck.push({...card});
            }
        });
        return deck;
    }

    /**
     * 특수 카드를 요괴 덱에 섞기
     */
    mixSpecialCards() {
        this.specialCards.forEach(card => {
            const randomIndex = Math.floor(Math.random() * this.yokaiDeck.length);
            this.yokaiDeck.splice(randomIndex, 0, card);
        });
    }

    /**
     * 덱 섞기 (Fisher-Yates 알고리즘)
     * @param {Array} deck 섞을 덱
     */
    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    /**
     * 요괴 카드 뽑기
     * @returns {Object} 뽑은 요괴 카드
     */
    drawYokaiCard() {
        if (this.yokaiDeck.length === 0) {
            return this.yokaiCards.find(c => c.id === 'boss');
        }
        return this.yokaiDeck.pop();
    }

    /**
     * 수호신 카드 뽑기
     * @param {number} count 뽑을 카드 수
     * @returns {Array} 뽑은 수호신 카드 배열
     */
    drawGuardianCards(count = 1) {
        const cards = [];
        for (let i = 0; i < count && this.guardianDeck.length > 0; i++) {
            cards.push(this.guardianDeck.pop());
        }
        return cards;
    }

    /**
     * 이동 카드 뽑기
     * @returns {Object} 뽑은 이동 카드
     */
    drawMovementCard() {
        if (this.movementDeck.length === 0) {
            this.movementDeck = this.createMovementDeck();
            this.shuffleDeck(this.movementDeck);
        }
        return this.movementDeck.pop();
    }

    /**
     * 카드 DOM 엘리먼트 생성
     * @param {Object} card 카드 데이터
     * @returns {HTMLElement} 카드 DOM 엘리먼트
     */
    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.type}`;
        cardElement.dataset.cardId = card.id;
        
        this.setCardContent(cardElement, card);
        this.addCardEvents(cardElement, card);
        
        return cardElement;
    }

    /**
     * 카드 내용 설정
     * @param {HTMLElement} cardElement 카드 엘리먼트
     * @param {Object} card 카드 데이터
     */
    setCardContent(cardElement, card) {
        switch (card.type) {
            case CardType.YOKAI:
                this.setYokaiCardContent(cardElement, card);
                break;
            case CardType.GUARDIAN:
                this.setGuardianCardContent(cardElement, card);
                break;
            case CardType.MOVEMENT:
                this.setMovementCardContent(cardElement, card);
                break;
            case CardType.SPECIAL:
                this.setSpecialCardContent(cardElement, card);
                break;
        }
    }

    /**
     * 요괴 카드 내용 설정
     * @param {HTMLElement} cardElement 카드 엘리먼트
     * @param {Object} card 카드 데이터
     */
    setYokaiCardContent(cardElement, card) {
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.name}</div>
                <div class="card-power">공격력: ${card.power}</div>
                <div class="card-weakness">
                    약점: ${card.weakness.length > 0 ? card.weakness.join(', ') : '없음'}
                </div>
                <div class="card-description">${card.description}</div>
            </div>
        `;
    }

    /**
     * 수호신 카드 내용 설정
     * @param {HTMLElement} cardElement 카드 엘리먼트
     * @param {Object} card 카드 데이터
     */
    setGuardianCardContent(cardElement, card) {
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.name}</div>
                <div class="card-type">수호신</div>
            </div>
        `;
    }

    /**
     * 이동 카드 내용 설정
     * @param {HTMLElement} cardElement 카드 엘리먼트
     * @param {Object} card 카드 데이터
     */
    setMovementCardContent(cardElement, card) {
        const valueText = this.getMovementValueText(card.value);
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="card-title">${card.name}</div>
                <div class="card-value">${valueText}</div>
            </div>
        `;
    }

    /**
     * 특수 카드 내용 설정
     * @param {HTMLElement} cardElement 카드 엘리먼트
     * @param {Object} card 카드 데이터
     */
    setSpecialCardContent(cardElement, card) {
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.name}</div>
                <div class="card-description">${card.description}</div>
            </div>
        `;
    }

    /**
     * 이동 값 텍스트 반환
     * @param {number|string} value 이동 값
     * @returns {string} 이동 값 텍스트
     */
    getMovementValueText(value) {
        if (value === 'choice') return '선택';
        if (value === 0) return '이동 불가';
        return `${value}칸`;
    }

    /**
     * 카드 이벤트 추가
     * @param {HTMLElement} cardElement 카드 엘리먼트  
     * @param {Object} card 카드 데이터
     */
    addCardEvents(cardElement, card) {
        cardElement.addEventListener('click', () => {
            this.handleCardClick(card);
        });

        cardElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showCardInfo(card);
        });
    }

    /**
     * 카드 클릭 처리
     * @param {Object} card 클릭된 카드
     */
    handleCardClick(card) {
        console.log(`카드 클릭: ${card.name}`);
        
        const event = new CustomEvent('cardClick', {
            detail: { card, cardSystem: this }
        });
        document.dispatchEvent(event);
    }

    /**
     * 카드 정보 표시
     * @param {Object} card 카드 데이터
     */
    showCardInfo(card) {
        const infoHtml = `
            <div class="card-info-popup">
                <h3>${card.icon || ''} ${card.name}</h3>
                <div class="card-type-info">타입: ${this.getCardTypeDescription(card.type)}</div>
                ${card.power ? `<div class="card-power-info">공격력: ${card.power}</div>` : ''}
                ${card.weakness ? `<div class="card-weakness-info">약점: ${card.weakness.join(', ')}</div>` : ''}
                ${card.value !== undefined ? `<div class="card-value-info">이동: ${this.getMovementValueText(card.value)}</div>` : ''}
                ${card.description ? `<div class="card-description-info">${card.description}</div>` : ''}
            </div>
        `;

        if (window.uiEffects) {
            window.uiEffects.showNotification(infoHtml, 'info', 3000);
        }
    }

    /**
     * 카드 타입 설명 반환
     * @param {string} type 카드 타입
     * @returns {string} 타입 설명
     */
    getCardTypeDescription(type) {
        const descriptions = {
            [CardType.YOKAI]: '요괴',
            [CardType.GUARDIAN]: '수호신',
            [CardType.MOVEMENT]: '이동',
            [CardType.SPECIAL]: '특수'
        };
        return descriptions[type] || '알 수 없음';
    }

    /**
     * 요괴와 수호신 카드 전투 처리
     * @param {Object} yokaiCard 요괴 카드
     * @param {Array} guardianCards 수호신 카드 배열
     * @returns {Object} 전투 결과
     */
    processBattle(yokaiCard, guardianCards) {
        if (!yokaiCard || !guardianCards.length) {
            return { victory: false, message: '전투를 할 수 없습니다.' };
        }

        const guardianNames = guardianCards.map(card => card.name);
        const weaknesses = yokaiCard.weakness || [];
        
        const matchingWeaknesses = guardianNames.filter(name => 
            weaknesses.includes(name)
        );

        if (matchingWeaknesses.length > 0) {
            return {
                victory: true,
                message: `${yokaiCard.name}을(를) ${matchingWeaknesses.join(', ')}(으)로 물리쳤습니다!`,
                usedGuardians: matchingWeaknesses
            };
        } else {
            return {
                victory: false,
                message: `${yokaiCard.name}에게 효과적인 수호신 카드가 없습니다.`,
                usedGuardians: []
            };
        }
    }

    /**
     * 플레이어 손패에 카드 추가
     * @param {Object} card 추가할 카드
     */
    addToPlayerHand(card) {
        this.playerHand.push(card);
        this.updateHandDisplay();
    }

    /**
     * 플레이어 손패에서 카드 제거
     * @param {string} cardId 제거할 카드 ID
     */
    removeFromPlayerHand(cardId) {
        this.playerHand = this.playerHand.filter(card => card.id !== cardId);
        this.updateHandDisplay();
    }

    /**
     * 손패 표시 업데이트
     */
    updateHandDisplay() {
        const handContainer = document.getElementById('player-hand');
        if (!handContainer) return;

        handContainer.innerHTML = '';
        this.playerHand.forEach(card => {
            const cardElement = this.createCardElement(card);
            handContainer.appendChild(cardElement);
        });
    }

    /**
     * 사용된 카드를 사용된 카드 더미로 이동
     * @param {Object} card 사용된 카드
     */
    moveToUsedPile(card) {
        this.usedCards.push(card);
        this.removeFromPlayerHand(card.id);
    }

    /**
     * 카드 시스템 리셋
     */
    reset() {
        console.log('카드 시스템 리셋 중...');
        
        this.playerHand = [];
        this.usedCards = [];
        this.initializeDecks();
        
        console.log('카드 시스템 리셋 완료');
    }

    /**
     * 카드 데이터 반환 (디버깅용)
     * @returns {Object} 카드 시스템 데이터
     */
    getDebugInfo() {
        return {
            yokaiDeckSize: this.yokaiDeck.length,
            guardianDeckSize: this.guardianDeck.length,
            movementDeckSize: this.movementDeck.length,
            playerHandSize: this.playerHand.length,
            usedCardsSize: this.usedCards.length
        };
    }
}

// 기본 내보내기
export default CardSystem;