// 원본 게임 메인 로직

import YokaiBoard from './board-new.js';
import { CardDeck, createCardElement } from './cards-new.js';
import { DiceUI, diceSystem } from './diceSystem.js';
import { uiEffects, showSuccess, showError, showInfo } from './uiEffects.js';

// 게임 상태
const GameState = {
    SETUP: 'setup',
    PLAYING: 'playing',
    MOVE_PHASE: 'move_phase',
    BATTLE_PHASE: 'battle_phase',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

class YokaiCastleGame {
    constructor() {
        this.state = GameState.SETUP;
        this.board = new YokaiBoard();
        this.cardDeck = new CardDeck();
        this.player = {
            position: 0,
            guardianCards: [],
            skipNextTurn: false,
            isAlive: true
        };
        this.board.player = this.player; // 보드에 플레이어 참조 추가
        this.deathGodActive = false;
        this.currentBattle = null;
    }
    
    // 게임 초기화
    init() {
        console.log('요괴의 성 탈출 게임 시작!');
        
        // 보드 초기화
        this.board.init();
        
        // UI 초기화
        this.setupUI();
        
        // 초기 수호신 카드 배분 (5장)
        this.player.guardianCards = this.cardDeck.drawGuardianCard(5);
        this.updateHandDisplay();
        
        // 게임 시작
        this.state = GameState.PLAYING;
        this.startTurn();
    }
    
    // UI 설정
    setupUI() {
        const playerArea = document.getElementById('player-area');
        playerArea.innerHTML = `
            <div class="game-info">
                <h2>요괴의 성 탈출</h2>
                <div class="player-status">
                    <div class="status-item">위치: <span id="player-position">시작</span></div>
                    <div class="status-item">수호신 카드: <span id="card-count">0</span>장</div>
                </div>
                <button id="draw-movement" class="game-button">이동 카드 뽑기</button>
                <div id="movement-card-area"></div>
                <div id="dice-ui-container"></div>
            </div>
            <div class="guardian-hand">
                <h3>수호신 카드</h3>
                <div id="guardian-cards"></div>
            </div>
        `;
        
        // 이벤트 리스너
        document.getElementById('draw-movement').addEventListener('click', () => {
            this.drawMovementCard();
        });
        
        // 주사위 UI 초기화
        this.diceUI = new DiceUI('dice-ui-container');
        
        // 스타일 추가
        this.addGameStyles();
    }
    
    // 게임 스타일 추가
    addGameStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-info {
                background: rgba(26, 15, 42, 0.9);
                border: 2px solid #4a1f5f;
                border-radius: 10px;
                padding: 20px;
                margin-bottom: 20px;
            }
            
            .game-info h2 {
                color: #da70d6;
                text-align: center;
                margin-bottom: 15px;
            }
            
            .player-status {
                margin-bottom: 15px;
            }
            
            .status-item {
                color: #e0e0e0;
                margin-bottom: 5px;
            }
            
            .guardian-hand {
                background: rgba(26, 15, 42, 0.9);
                border: 2px solid #4a1f5f;
                border-radius: 10px;
                padding: 15px;
            }
            
            .guardian-hand h3 {
                color: #4ecdc4;
                margin-bottom: 10px;
            }
            
            #guardian-cards {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            #guardian-cards .card {
                width: 80px;
                height: 100px;
                font-size: 10px;
                padding: 5px;
            }
            
            #guardian-cards .card-icon {
                font-size: 24px;
                margin-bottom: 5px;
            }
            
            #movement-card-area {
                margin-top: 15px;
                display: flex;
                justify-content: center;
            }
            
            #movement-card-area .card {
                width: 100px;
                height: 120px;
            }
            
            .battle-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .battle-content {
                background: linear-gradient(135deg, #2a0f3f 0%, #0a0515 100%);
                border: 3px solid #8a2b9f;
                border-radius: 20px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
            }
            
            .battle-yokai {
                text-align: center;
                margin-bottom: 20px;
            }
            
            .battle-yokai h3 {
                color: #ff6b6b;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .yokai-weakness {
                color: #ffd700;
                margin-bottom: 20px;
            }
            
            .guardian-selection {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .guardian-selection .card {
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .guardian-selection .card:hover {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
            }
            
            .guardian-selection .card.selected {
                border-color: #4ecdc4;
                box-shadow: 0 0 20px rgba(78, 205, 196, 0.8);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 턴 시작
    startTurn() {
        if (this.player.skipNextTurn) {
            console.log('이번 턴은 쉬어야 합니다.');
            this.player.skipNextTurn = false;
            return;
        }
        
        this.state = GameState.MOVE_PHASE;
        this.updateUI();
    }
    
    // 이동 카드 뽑기
    drawMovementCard() {
        if (this.state !== GameState.MOVE_PHASE) return;
        
        const card = this.cardDeck.drawMovementCard();
        console.log(`이동 카드: ${card.name}`);
        
        // 카드 표시
        const cardArea = document.getElementById('movement-card-area');
        cardArea.innerHTML = '';
        const cardElement = createCardElement(card);
        cardArea.appendChild(cardElement);
        
        // 카드 뽑기 효과
        uiEffects.fadeIn(cardElement);
        showInfo(`${card.name} 카드를 뽑았습니다!`);
        
        // 이동 처리
        if (card.value === 'choice') {
            // 엑소시스트 카드 - 선택 이동
            this.handleExorcistCard();
        } else if (card.value === 0) {
            // 블랙 카드 - 이동 불가
            console.log('이동할 수 없습니다!');
            this.endTurn();
        } else {
            // 일반 이동
            this.handleMovement(card.value);
        }
        
        // 버튼 비활성화
        document.getElementById('draw-movement').disabled = true;
    }
    
    // 이동 처리
    handleMovement(steps) {
        console.log(`${steps}칸 이동 가능`);
        
        // 가능한 이동 위치 계산
        const possibleMoves = this.calculatePossibleMoves(steps);
        
        // 보드에 이동 가능 위치 표시
        possibleMoves.forEach(roomId => {
            const room = document.getElementById(`room-${roomId}`);
            if (room) {
                room.classList.add('moveable');
                room.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
            }
        });
        
        // 보드에 이동 모드 설정
        this.board.movementMode = true;
        this.board.possibleMoves = possibleMoves;
    }
    
    // 가능한 이동 계산
    calculatePossibleMoves(steps) {
        const visited = new Set();
        const queue = [{position: this.player.position, steps: 0}];
        const possibleMoves = new Set();
        
        while (queue.length > 0) {
            const {position, steps: currentSteps} = queue.shift();
            
            if (currentSteps === steps) {
                possibleMoves.add(position);
                continue;
            }
            
            const adjacent = this.board.getAdjacentRooms(position);
            adjacent.forEach(roomId => {
                const key = `${roomId}-${currentSteps + 1}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({position: roomId, steps: currentSteps + 1});
                }
            });
        }
        
        return Array.from(possibleMoves);
    }
    
    // 엑소시스트 카드 처리
    handleExorcistCard() {
        console.log('엑소시스트 카드! 1~6칸 중 선택하세요.');
        // 1~6 모든 이동 가능
        const allMoves = new Set();
        for (let i = 1; i <= 6; i++) {
            this.calculatePossibleMoves(i).forEach(move => allMoves.add(move));
        }
        this.board.movementMode = true;
        this.board.possibleMoves = Array.from(allMoves);
        
        // 이동 가능 위치 표시
        allMoves.forEach(roomId => {
            const room = document.getElementById(`room-${roomId}`);
            if (room) {
                room.classList.add('moveable');
                room.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.8)';
            }
        });
    }
    
    // 요괴 전투 시작
    startYokaiBattle(yokaiInfo) {
        this.state = GameState.BATTLE_PHASE;
        
        // 요괴 카드 뽑기
        const yokaiCard = this.cardDeck.drawYokaiCard();
        
        if (yokaiCard.type === 'special') {
            // 특수 카드 처리
            this.handleSpecialCard(yokaiCard);
            return;
        }
        
        this.currentBattle = {
            yokai: yokaiCard,
            roomYokai: yokaiInfo
        };
        
        // 전투 UI 표시
        this.showBattleUI(yokaiCard);
    }
    
    // 전투 UI 표시
    showBattleUI(yokaiCard) {
        const battleOverlay = document.createElement('div');
        battleOverlay.className = 'battle-overlay';
        battleOverlay.innerHTML = `
            <div class="battle-content">
                <div class="battle-yokai">
                    <h3>${yokaiCard.name}</h3>
                    <p class="yokai-weakness">약점: ${yokaiCard.weakness.join(', ') || '없음'}</p>
                    <p>공격력: ${yokaiCard.power}</p>
                </div>
                <div class="guardian-selection" id="guardian-selection"></div>
                <div class="battle-actions">
                    <button id="battle-fight" class="game-button" disabled>전투</button>
                    <button id="battle-flee" class="game-button">도망</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(battleOverlay);
        
        // 수호신 카드 표시
        const selection = document.getElementById('guardian-selection');
        this.player.guardianCards.forEach((card, index) => {
            const cardEl = createCardElement(card);
            cardEl.dataset.index = index;
            cardEl.addEventListener('click', () => this.selectGuardianCard(index));
            selection.appendChild(cardEl);
        });
        
        // 전투 버튼 이벤트
        document.getElementById('battle-fight').addEventListener('click', () => {
            this.resolveBattle();
        });
        
        document.getElementById('battle-flee').addEventListener('click', () => {
            this.fleeBattle();
        });
    }
    
    // 수호신 카드 선택
    selectGuardianCard(index) {
        // 이전 선택 제거
        document.querySelectorAll('.guardian-selection .card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 새 선택
        const cards = document.querySelectorAll('.guardian-selection .card');
        cards[index].classList.add('selected');
        
        this.selectedGuardianIndex = index;
        document.getElementById('battle-fight').disabled = false;
    }
    
    // 전투 해결
    resolveBattle() {
        const guardian = this.player.guardianCards[this.selectedGuardianIndex];
        const yokai = this.currentBattle.yokai;
        
        // 약점 확인
        if (yokai.weakness.includes(guardian.name)) {
            console.log(`${guardian.name}(으)로 ${yokai.name}을(를) 물리쳤습니다!`);
            
            // 사용한 수호신 카드 제거
            this.player.guardianCards.splice(this.selectedGuardianIndex, 1);
            
            // 전투 종료
            this.endBattle(true);
        } else {
            console.log(`${guardian.name}은(는) ${yokai.name}에게 효과가 없습니다!`);
            
            // 피해 입음
            this.takeDamage(yokai.power);
        }
    }
    
    // 도망
    fleeBattle() {
        console.log('도망쳤습니다! 2칸 뒤로 이동합니다.');
        this.board.movePlayerBack(2);
        this.endBattle(false);
    }
    
    // 전투 종료
    endBattle(victory) {
        document.querySelector('.battle-overlay').remove();
        this.currentBattle = null;
        this.state = GameState.PLAYING;
        
        if (victory) {
            this.endTurn();
        }
        
        this.updateUI();
    }
    
    // 피해 처리
    takeDamage(amount) {
        console.log(`${amount}의 피해를 입었습니다!`);
        
        // 수호신 카드 잃기
        for (let i = 0; i < amount && this.player.guardianCards.length > 0; i++) {
            this.player.guardianCards.pop();
        }
        
        // 카드가 없으면 게임 오버
        if (this.player.guardianCards.length === 0) {
            this.gameOver('수호신 카드를 모두 잃었습니다');
        } else {
            this.endBattle(false);
        }
    }
    
    // 특수 카드 처리
    handleSpecialCard(card) {
        console.log(`특수 카드: ${card.name}`);
        
        switch (card.effect) {
            case 'death_move':
                // 죽음의 신 이동
                if (this.board.deathPosition !== null) {
                    this.board.moveDeathGod(1);
                }
                break;
            case 'extra_guardian':
                // 수호신 카드 추가
                const newCards = this.cardDeck.drawGuardianCard(2);
                this.player.guardianCards.push(...newCards);
                console.log('수호신 카드 2장을 획득했습니다!');
                break;
        }
        
        this.updateHandDisplay();
        this.endTurn();
    }
    
    // 대마왕 조우
    handleBossEncounter() {
        console.log('대마왕과의 조우! 절대 이길 수 없습니다!');
        
        // 무조건 패배
        this.takeDamage(5);
    }
    
    // 턴 종료
    endTurn() {
        // 이동 가능 표시 제거
        document.querySelectorAll('.moveable').forEach(room => {
            room.classList.remove('moveable');
            room.style.boxShadow = '';
        });
        
        // 버튼 활성화
        document.getElementById('draw-movement').disabled = false;
        
        // 다음 턴
        this.startTurn();
    }
    
    // 다음 턴 스킵
    skipNextTurn() {
        this.player.skipNextTurn = true;
    }
    
    // UI 업데이트
    updateUI() {
        const room = this.board.rooms.find(r => r.id === this.player.position);
        document.getElementById('player-position').textContent = room ? room.name : '알 수 없음';
        document.getElementById('card-count').textContent = this.player.guardianCards.length;
        
        this.updateHandDisplay();
    }
    
    // 손패 표시 업데이트
    updateHandDisplay() {
        const handArea = document.getElementById('guardian-cards');
        handArea.innerHTML = '';
        
        this.player.guardianCards.forEach(card => {
            handArea.appendChild(createCardElement(card));
        });
    }
    
    // 게임 오버
    gameOver(reason) {
        this.state = GameState.GAME_OVER;
        console.log(`게임 오버: ${reason}`);
        
        alert(`게임 오버!\n${reason}`);
    }
    
    // 승리
    victory() {
        this.state = GameState.VICTORY;
        console.log('축하합니다! 요괴의 성을 탈출했습니다!');
        
        alert('승리!\n요괴의 성을 무사히 탈출했습니다!');
    }
}

// 전역 게임 인스턴스
window.game = new YokaiCastleGame();

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});

export default YokaiCastleGame;