/**
 * 요괴의 성 탈출 - 메인 게임 컨트롤러
 * CLAUDE.md 규칙에 따른 클린 코드 구현
 */

import { BoardSystem } from './BoardSystem.js';
import { CardSystem } from './CardSystem.js';
import { UIEffects } from './uiEffects.js';

// 게임 상태 열거형
export const GameState = {
    SETUP: 'setup',
    PLAYING: 'playing',
    MOVE_PHASE: 'move_phase',
    BATTLE_PHASE: 'battle_phase',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// 게임 모드 열거형
export const GameMode = {
    SINGLE: 'single',
    VS_AI: 'vs_ai',
    VS_PLAYER: 'vs_player'
};

/**
 * 메인 게임 컨트롤러 클래스
 * 게임의 모든 핵심 로직을 관리
 */
export class GameController {
    constructor() {
        this.state = GameState.SETUP;
        this.gameMode = GameMode.SINGLE;
        this.currentPlayerIndex = 0;
        
        // 시스템 초기화
        this.boardSystem = new BoardSystem();
        this.cardSystem = new CardSystem();
        this.uiEffects = new UIEffects();
        
        // 플레이어 데이터
        this.players = this.initializePlayers();
        
        // 게임 상태
        this.currentBattle = null;
        this.selectedGuardian = null;
        this.deathGodActive = false;
        
        // 턴 잠금 메커니즘
        this.isActionInProgress = false;
        this.currentTurnPlayerId = null;
    }

    /**
     * 플레이어 초기화
     * @returns {Array} 플레이어 배열
     */
    initializePlayers() {
        return [
            {
                id: 1,
                name: 'Player 1',
                position: 0,
                guardianCards: [],
                skipNextTurn: false,
                isAlive: true,
                color: '#ff6b6b',
                icon: '🎮'
            },
            {
                id: 2,
                name: 'Player 2',
                position: 0,
                guardianCards: [],
                skipNextTurn: false,
                isAlive: true,
                color: '#4ecdc4',
                icon: '🎯'
            }
        ];
    }

    /**
     * 현재 플레이어 반환
     * @returns {Object} 현재 플레이어 객체
     */
    getCurrentPlayer() {
        if (!this.players || this.players.length === 0) {
            console.error('No players available');
            return null;
        }
        return this.players[this.currentPlayerIndex];
    }

    /**
     * 다음 플레이어로 전환
     */
    switchToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * 현재 플레이어가 액션을 수행할 수 있는지 확인
     * @returns {boolean} 액션 가능 여부
     */
    canPerformAction() {
        // 게임이 진행 중이 아니면 액션 불가
        if (this.state !== GameState.PLAYING && this.state !== GameState.MOVE_PHASE) {
            return false;
        }
        
        // 다른 액션이 진행 중이면 불가
        if (this.isActionInProgress) {
            console.warn('다른 액션이 진행 중입니다.');
            this.showInfo('다른 액션이 완료될 때까지 기다려주세요.');
            return false;
        }
        
        // 현재 플레이어의 턴이 아니면 불가
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || currentPlayer.id !== this.currentTurnPlayerId) {
            console.warn('현재 플레이어의 턴이 아닙니다.');
            this.showInfo('자신의 턴을 기다려주세요.');
            return false;
        }
        
        return true;
    }

    /**
     * 액션 시작 (잠금)
     * @param {string} actionName 액션 이름
     * @returns {boolean} 액션 시작 가능 여부
     */
    startAction(actionName) {
        if (!this.canPerformAction()) {
            return false;
        }
        
        console.log(`액션 시작: ${actionName}`);
        this.isActionInProgress = true;
        return true;
    }

    /**
     * 액션 종료 (잠금 해제)
     * @param {string} actionName 액션 이름
     */
    endAction(actionName) {
        console.log(`액션 종료: ${actionName}`);
        this.isActionInProgress = false;
    }

    /**
     * 게임 초기화
     */
    init() {
        console.log('요괴의 성 탈출 게임 초기화 중...');
        
        try {
            // 보드 시스템 초기화
            this.boardSystem.init();
            this.boardSystem.setPlayers(this.players);
            console.log('✅ 보드 시스템 초기화 완료');
        } catch (boardError) {
            console.error('❌ 보드 시스템 초기화 실패:', boardError);
            // 보드 초기화가 실패해도 게임을 계속 진행
        }

        try {
            // UI 초기화
            this.setupUI();
            console.log('✅ UI 초기화 완료');
        } catch (uiError) {
            console.error('❌ UI 초기화 실패:', uiError);
        }

        // 시작 화면 표시
        this.showStartScreen();
        console.log('✅ 시작 화면 표시 완료');
    }

    /**
     * 시작 화면 표시
     */
    showStartScreen() {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const startScreen = document.createElement('div');
        startScreen.id = 'start-screen';
        startScreen.innerHTML = this.getStartScreenHTML();
        
        gameContainer.appendChild(startScreen);
        this.addStartScreenStyles();
        this.bindStartScreenEvents();
    }

    /**
     * 시작 화면 HTML 생성
     * @returns {string} HTML 문자열
     */
    getStartScreenHTML() {
        return `
            <div class="start-container">
                <div class="start-content">
                    <div class="game-title">
                        <h1>요괴의 성 탈출</h1>
                        <p class="game-subtitle">Yokai Castle Escape</p>
                    </div>
                    
                    <div class="game-modes">
                        <button class="mode-btn" data-mode="single">
                            <div class="mode-icon">🎮</div>
                            <div class="mode-title">싱글 플레이</div>
                            <div class="mode-desc">혼자서 도전하기</div>
                        </button>
                        
                        <button class="mode-btn" data-mode="vs_ai">
                            <div class="mode-icon">🤖</div>
                            <div class="mode-title">컴퓨터 대전</div>
                            <div class="mode-desc">AI와 대결하기</div>
                        </button>
                        
                        <button class="mode-btn" data-mode="vs_player">
                            <div class="mode-icon">👥</div>
                            <div class="mode-title">플레이어 대전</div>
                            <div class="mode-desc">친구와 함께하기</div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 시작 화면 이벤트 바인딩
     */
    bindStartScreenEvents() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.gameMode = mode;
                this.startGame();
            });
        });
    }

    /**
     * 게임 시작
     */
    startGame() {
        // 시작 화면 제거
        const startScreen = document.getElementById('start-screen');
        if (startScreen) {
            startScreen.remove();
        }

        // 플레이어 설정
        if (this.gameMode === GameMode.SINGLE) {
            this.players = [this.players[0]]; // 첫 번째 플레이어만 사용
        } else if (this.gameMode === GameMode.VS_AI) {
            this.players[1].name = 'Computer';
            this.players[1].icon = '🤖';
        }

        // 초기 카드 배분
        this.players.forEach(player => {
            player.guardianCards = this.cardSystem.drawGuardianCards(5);
        });

        // 보드 시스템에 플레이어 등록
        this.boardSystem.setPlayers(this.players);
        
        // 게임 상태 변경
        this.state = GameState.PLAYING;
        
        // UI 업데이트
        this.updateUI();
        
        // 첫 턴 시작
        this.startTurn();
        
        console.log(`게임 시작! 모드: ${this.gameMode}`);
    }

    /**
     * UI 설정
     */
    setupUI() {
        this.addGameStyles();
        this.setupEventListeners();
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 주사위 굴리기 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'roll-dice' || e.target.closest('#roll-dice')) {
                e.preventDefault();
                this.rollDice();
            }
        });

        // 이동하기 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'move-player' || e.target.closest('#move-player')) {
                e.preventDefault();
                this.showMovementMenu();
            }
        });

        // 카드 사용 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'use-card' || e.target.closest('#use-card')) {
                e.preventDefault();
                this.showCardMenu();
            }
        });

        // 턴 종료 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'end-turn' || e.target.closest('#end-turn')) {
                e.preventDefault();
                this.endTurn();
            }
        });

        // 게임 일시정지 버튼
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pause-game' || e.target.closest('#pause-game')) {
                e.preventDefault();
                this.pauseGame();
            }
        });

        // 카드 선택 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.hand-card')) {
                const index = parseInt(e.target.closest('.hand-card').dataset.index);
                this.selectHandCard(index);
            }
        });

        // 방 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.board-room')) {
                const roomId = parseInt(e.target.closest('.board-room').dataset.roomId);
                this.handleRoomInteraction(roomId);
            }
        });

        // 수호신 카드 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.guardian-deck-card')) {
                const cardIndex = parseInt(e.target.closest('.guardian-deck-card').dataset.index);
                this.selectGuardianCard(cardIndex);
            }
        });
    }

    /**
     * 턴 시작
     */
    startTurn() {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;

        // 현재 턴 플레이어 설정
        this.currentTurnPlayerId = currentPlayer.id;
        this.isActionInProgress = false; // 턴 시작 시 액션 잠금 해제

        console.log(`${currentPlayer.name}의 턴 시작`);

        // 턴 스킵 확인
        if (currentPlayer.skipNextTurn) {
            currentPlayer.skipNextTurn = false;
            this.showInfo(`${currentPlayer.name}은(는) 이번 턴을 건너뜁니다.`);
            this.endTurn();
            return;
        }

        // AI 턴 처리
        if (this.gameMode === GameMode.VS_AI && currentPlayer.name === 'Computer') {
            setTimeout(() => this.playAITurn(), 1000);
            return;
        }

        this.updateUI();
    }

    /**
     * 주사위 굴리기
     * @returns {number} 주사위 결과
     */
    rollDice() {
        // 액션 권한 확인
        if (!this.startAction('주사위 굴리기')) {
            return;
        }

        const result = Math.floor(Math.random() * 6) + 1;
        
        // UI에 주사위 결과 표시
        const diceElement = document.getElementById('dice-result');
        if (diceElement) {
            diceElement.textContent = `🎲 ${result}`;
            diceElement.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                diceElement.style.animation = '';
            }, 500);
        }
        
        this.showInfo(`주사위 결과: ${result}`);
        
        // 이동 처리
        this.handleMovement(result);
        
        return result;
    }

    /**
     * 이동 처리
     * @param {number} steps 이동할 칸 수
     */
    handleMovement(steps) {
        const currentPlayer = this.getCurrentPlayer();
        const possibleMoves = this.calculatePossibleMoves(steps);

        if (possibleMoves.length === 1) {
            this.movePlayer(possibleMoves[0]);
        } else if (possibleMoves.length > 1) {
            this.showMovementOptions(possibleMoves);
        }
    }

    /**
     * 가능한 이동 계산
     * @param {number} steps 이동할 칸 수
     * @returns {Array} 가능한 이동 위치 배열
     */
    calculatePossibleMoves(steps) {
        const currentPlayer = this.getCurrentPlayer();
        const currentPos = currentPlayer.position;
        const possibleMoves = [];

        // 전진
        const forwardPos = Math.min(currentPos + steps, 24);
        if (forwardPos !== currentPos) {
            possibleMoves.push(forwardPos);
        }

        // 후진 (특정 조건에서만)
        if (currentPos > 0) {
            const backwardPos = Math.max(currentPos - steps, 0);
            if (backwardPos !== currentPos) {
                possibleMoves.push(backwardPos);
            }
        }

        return possibleMoves;
    }

    /**
     * 플레이어 이동
     * @param {number} targetPosition 목표 위치
     */
    movePlayer(targetPosition) {
        const currentPlayer = this.getCurrentPlayer();
        const previousPosition = currentPlayer.position;
        
        currentPlayer.position = targetPosition;
        
        // 보드에서 플레이어 이동
        this.boardSystem.movePlayer(currentPlayer.id, targetPosition);
        
        // 현재 위치의 방 정보 가져오기
        const room = this.boardSystem.getRoom(targetPosition);
        
        // 안전지대에 도착하면 기록
        if (room && room.isSafeZone) {
            currentPlayer.lastSafeZone = targetPosition;
            console.log(`안전지대 기록: ${currentPlayer.name} - ${targetPosition}번`);
        }
        
        // 방 입장 처리
        if (room) {
            this.enterRoom(room);
        } else {
            // 특별한 방이 아니면 이동 완료 후 액션 종료
            this.endAction('플레이어 이동');
        }

        this.showInfo(`${currentPlayer.name}이(가) ${previousPosition}번에서 ${targetPosition}번으로 이동했습니다.`);
        this.updateUI();
    }

    /**
     * 방 입장 처리
     * @param {Object} room 방 객체
     */
    enterRoom(room) {
        console.log(`방 입장: ${room.type} (${room.position})`);

        switch (room.type) {
            case 'yokai-room':
                this.enterYokaiRoom(room);
                break;
            case 'safe-room':
                this.enterSafeRoom(room);
                break;
            case 'guardian-room':
                this.enterGuardianRoom(room);
                break;
            case 'special-room':
                this.enterSpecialRoom(room);
                break;
            case 'end':
                this.victory();
                break;
            case 'start':
                // 시작점은 특별한 처리 없음
                break;
            default:
                console.log(`알 수 없는 방 타입: ${room.type}`);
        }
    }

    /**
     * 요괴 방 입장
     * @param {Object} room 방 객체
     */
    enterYokaiRoom(room) {
        const currentPlayer = this.getCurrentPlayer();
        
        // 요괴 데이터 가져오기
        const yokaiData = this.boardSystem.boardData.getYokaiData(room.name);
        if (!yokaiData) {
            console.error('요괴 데이터가 없습니다:', room.name);
            return;
        }

        // 마지막 안전지대 기록
        this.recordSafeZone(currentPlayer);

        // 요괴 팝업 표시
        this.showYokaiPopup(yokaiData, room);
    }

    /**
     * 안전지대 기록
     * @param {Object} player 플레이어 객체
     */
    recordSafeZone(player) {
        const currentRoom = this.boardSystem.getRoom(player.position);
        if (currentRoom && currentRoom.isSafeZone) {
            player.lastSafeZone = player.position;
        } else if (!player.lastSafeZone && player.lastSafeZone !== 0) {
            player.lastSafeZone = 0; // 시작점을 기본 안전지대로
        }
    }

    /**
     * 요괴 팝업 표시
     * @param {Object} yokaiData 요괴 데이터
     * @param {Object} room 방 객체
     */
    showYokaiPopup(yokaiData, room) {
        const overlay = document.createElement('div');
        overlay.className = 'yokai-popup-overlay';
        
        const popup = document.createElement('div');
        popup.className = 'yokai-popup';
        popup.innerHTML = this.getYokaiPopupHTML(yokaiData, room);
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        
        this.bindYokaiPopupEvents(yokaiData, room, overlay, popup);
    }

    /**
     * 요괴 팝업 HTML 생성
     * @param {Object} yokaiData 요괴 데이터
     * @param {Object} room 방 객체
     * @returns {string} HTML 문자열
     */
    getYokaiPopupHTML(yokaiData, room) {
        return `
            <div class="yokai-info">
                <div class="yokai-icon-large">${yokaiData.icon || room.icon}</div>
                <h2 class="yokai-name">${yokaiData.name}</h2>
                <p class="yokai-description">${yokaiData.description}</p>
                
                <div class="yokai-stats">
                    <div class="yokai-stat">
                        <div class="yokai-stat-label">공격력</div>
                        <div class="yokai-stat-value">${yokaiData.attack}</div>
                    </div>
                    <div class="yokai-stat">
                        <div class="yokai-stat-label">약점</div>
                        <div class="yokai-stat-value">${yokaiData.weakness.join(', ')}</div>
                    </div>
                </div>
                
                <div class="yokai-dice-requirement">
                    <div class="yokai-dice-label">통과 가능한 주사위 번호</div>
                    <div class="yokai-dice-numbers">
                        ${yokaiData.passingDice.map(num => `
                            <div class="dice-number">🎲${num}</div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="yokai-action-buttons">
                    <button class="roll-dice-button" id="yokai-roll-dice">
                        🎲 주사위 굴리기
                    </button>
                    <button class="run-away-button" id="yokai-run-away">
                        🏃 도망가기
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 요괴 팝업 이벤트 바인딩
     * @param {Object} yokaiData 요괴 데이터
     * @param {Object} room 방 객체
     * @param {HTMLElement} overlay 오버레이 요소
     * @param {HTMLElement} popup 팝업 요소
     */
    bindYokaiPopupEvents(yokaiData, room, overlay, popup) {
        const rollDiceBtn = popup.querySelector('#yokai-roll-dice');
        const runAwayBtn = popup.querySelector('#yokai-run-away');
        
        rollDiceBtn.addEventListener('click', () => {
            this.handleYokaiDiceRoll(yokaiData, room, overlay, popup);
        });
        
        runAwayBtn.addEventListener('click', () => {
            this.handleYokaiRunAway(overlay, popup);
        });
    }

    /**
     * 요괴 주사위 굴리기 처리
     * @param {Object} yokaiData 요괴 데이터
     * @param {Object} room 방 객체
     * @param {HTMLElement} overlay 오버레이 요소
     * @param {HTMLElement} popup 팝업 요소
     */
    handleYokaiDiceRoll(yokaiData, room, overlay, popup) {
        // 액션 권한 확인
        if (!this.startAction('요괴 주사위 굴리기')) {
            return;
        }

        const rollBtn = popup.querySelector('#yokai-roll-dice');
        rollBtn.disabled = true;
        rollBtn.textContent = '🎲 굴리는 중...';
        
        // 주사위 애니메이션
        const diceDisplay = document.createElement('div');
        diceDisplay.className = 'dice-result-popup dice-rolling';
        diceDisplay.textContent = '🎲';
        document.body.appendChild(diceDisplay);
        
        setTimeout(() => {
            const diceResult = Math.floor(Math.random() * 6) + 1;
            diceDisplay.textContent = diceResult;
            diceDisplay.classList.remove('dice-rolling');
            
            // 성공/실패 판정
            const isSuccess = yokaiData.passingDice.includes(diceResult);
            
            if (isSuccess) {
                diceDisplay.classList.add('dice-success');
                this.showInfo(`성공! 주사위 ${diceResult}로 ${yokaiData.name}을(를) 통과했습니다!`);
                
                setTimeout(() => {
                    this.closeYokaiPopup(overlay, popup, diceDisplay);
                    this.endAction('요괴 주사위 굴리기');
                    this.endTurn();
                }, 1500);
            } else {
                diceDisplay.classList.add('dice-failure');
                this.showError(`실패! 주사위 ${diceResult}로는 통과할 수 없습니다!`);
                
                setTimeout(() => {
                    this.closeYokaiPopup(overlay, popup, diceDisplay);
                    this.returnToSafeZone();
                }, 1500);
            }
        }, 1000);
    }

    /**
     * 요괴에게서 도망가기 처리
     * @param {HTMLElement} overlay 오버레이 요소
     * @param {HTMLElement} popup 팝업 요소
     */
    handleYokaiRunAway(overlay, popup) {
        // 액션 권한 확인
        if (!this.startAction('요괴에게서 도망가기')) {
            return;
        }

        this.showInfo('요괴에게서 도망쳤습니다!');
        this.closeYokaiPopup(overlay, popup);
        this.returnToSafeZone();
    }

    /**
     * 요괴 팝업 닫기
     * @param {HTMLElement} overlay 오버레이 요소
     * @param {HTMLElement} popup 팝업 요소
     * @param {HTMLElement} diceDisplay 주사위 표시 요소 (선택사항)
     */
    closeYokaiPopup(overlay, popup, diceDisplay = null) {
        if (overlay) overlay.remove();
        if (popup) popup.remove();
        if (diceDisplay) {
            setTimeout(() => diceDisplay.remove(), 500);
        }
    }

    /**
     * 안전지대로 복귀
     */
    returnToSafeZone() {
        const currentPlayer = this.getCurrentPlayer();
        const safeZone = currentPlayer.lastSafeZone !== undefined ? currentPlayer.lastSafeZone : 0;
        
        this.showInfo(`안전지대(${safeZone}번)로 돌아갑니다.`);
        this.movePlayer(safeZone);
        
        // 턴 종료는 movePlayer에서 처리하지 않으므로 여기서 처리
        setTimeout(() => {
            this.endAction('안전지대 복귀');
            this.endTurn();
        }, 1000);
    }

    /**
     * 안전 지대 입장
     * @param {Object} room 방 객체
     */
    enterSafeRoom(room) {
        this.showInfo('안전 지대에 도착했습니다. 잠시 휴식을 취합니다.');
        
        // 힐링 카드가 있다면 체력 회복
        const currentPlayer = this.getCurrentPlayer();
        const healCard = currentPlayer.guardianCards.filter(card => card.effect === 'heal');
        
        if (healCard.length > 0) {
            this.showInfo('힐링 카드로 체력을 회복합니다.');
            // 힐링 로직 구현
        }
        
        // 안전지대 입장은 특별한 액션이 없으므로 바로 종료
        this.endAction('안전지대 입장');
    }

    /**
     * 수호신 방 입장
     * @param {Object} room 방 객체
     */
    enterGuardianRoom(room) {
        const currentPlayer = this.getCurrentPlayer();
        const newCard = this.cardSystem.drawGuardianCards(1)[0];
        
        currentPlayer.guardianCards.push(newCard);
        this.showInfo(`새로운 수호신 카드를 획득했습니다: ${newCard.name}`);
        this.updateUI();
        
        // 카드 획득 후 액션 종료
        this.endAction('수호신 방 입장');
    }

    /**
     * 특수 방 입장
     * @param {Object} room 방 객체
     */
    enterSpecialRoom(room) {
        // 특수 방 효과 처리
        const effects = ['skip_turn', 'extra_card', 'teleport', 'curse'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        
        this.handleSpecialEffect(randomEffect);
    }

    /**
     * 특수 효과 처리
     * @param {string} effect 효과 타입
     */
    handleSpecialEffect(effect) {
        const currentPlayer = this.getCurrentPlayer();
        
        switch (effect) {
            case 'skip_turn':
                currentPlayer.skipNextTurn = true;
                this.showInfo('저주에 걸렸습니다! 다음 턴을 건너뜁니다.');
                this.endAction('특수 효과 처리');
                break;
            case 'extra_card':
                const newCard = this.cardSystem.drawGuardianCards(1)[0];
                currentPlayer.guardianCards.push(newCard);
                this.showInfo('행운! 추가 수호신 카드를 얻었습니다.');
                this.endAction('특수 효과 처리');
                break;
            case 'teleport':
                const newPosition = Math.floor(Math.random() * 25);
                this.movePlayer(newPosition);
                this.showInfo('순간이동! 다른 방으로 이동했습니다.');
                // movePlayer에서 액션 종료 처리
                break;
            case 'curse':
                this.takeDamage(1);
                this.showInfo('저주로 인해 카드를 잃었습니다.');
                this.endAction('특수 효과 처리');
                break;
        }
    }

    /**
     * 전투 시작
     * @param {Object} yokai 요괴 객체
     */
    startBattle(yokai) {
        this.state = GameState.BATTLE_PHASE;
        this.currentBattle = yokai;
        
        this.showBattleModal(yokai);
    }

    /**
     * 전투 모달 표시
     * @param {Object} yokai 요괴 객체
     */
    showBattleModal(yokai) {
        const modal = document.createElement('div');
        modal.id = 'battle-modal';
        modal.className = 'battle-modal';
        modal.innerHTML = this.getBattleModalHTML(yokai);
        
        document.body.appendChild(modal);
        this.addBattleModalStyles();
        this.bindBattleModalEvents();
    }

    /**
     * 전투 모달 HTML 생성
     * @param {Object} yokai 요괴 객체
     * @returns {string} HTML 문자열
     */
    getBattleModalHTML(yokai) {
        const currentPlayer = this.getCurrentPlayer();
        
        return `
            <div class="battle-overlay">
                <div class="battle-content">
                    <div class="battle-header">
                        <h2>요괴와의 전투!</h2>
                    </div>
                    
                    <div class="battle-area">
                        <div class="yokai-info">
                            <div class="yokai-icon">${yokai.icon || '👹'}</div>
                            <h3>${yokai.name}</h3>
                            <div class="yokai-stats">
                                <div class="stat">공격력: ${yokai.power}</div>
                                <div class="stat">약점: ${yokai.weakness ? yokai.weakness.join(', ') : '없음'}</div>
                            </div>
                        </div>
                        
                        <div class="vs-indicator">VS</div>
                        
                        <div class="player-info">
                            <div class="player-icon">${currentPlayer.icon}</div>
                            <h3>${currentPlayer.name}</h3>
                            <div class="guardian-count">수호신 카드: ${currentPlayer.guardianCards.length}장</div>
                        </div>
                    </div>
                    
                    <div class="battle-actions">
                        <button id="battle-fight-btn" class="battle-btn fight-btn" ${currentPlayer.guardianCards.length === 0 ? 'disabled' : ''}>
                            전투하기
                        </button>
                        <button id="battle-flee-btn" class="battle-btn flee-btn">
                            도망가기
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 전투 모달 이벤트 바인딩
     */
    bindBattleModalEvents() {
        const fightBtn = document.getElementById('battle-fight-btn');
        const fleeBtn = document.getElementById('battle-flee-btn');
        
        if (fightBtn) {
            fightBtn.addEventListener('click', () => this.executeBattle());
        }
        
        if (fleeBtn) {
            fightBtn.addEventListener('click', () => this.fleeBattle());
        }
    }

    /**
     * 전투 실행
     */
    executeBattle() {
        if (!this.currentBattle || !this.selectedGuardian) {
            // 랜덤 카드 선택
            const currentPlayer = this.getCurrentPlayer();
            if (currentPlayer.guardianCards.length > 0) {
                this.selectedGuardian = currentPlayer.guardianCards[0];
            }
        }

        const result = this.cardSystem.battle(this.selectedGuardian, this.currentBattle);
        
        this.closeBattleModal();
        
        if (result.victory) {
            this.showInfo(`승리! ${this.currentBattle.name}을(를) 물리쳤습니다!`);
            this.endBattle(true);
        } else {
            this.showError(`패배! ${this.selectedGuardian.name} 카드를 잃었습니다.`);
            this.removeGuardianCard(this.selectedGuardian.name);
            this.endBattle(false);
        }
    }

    /**
     * 전투에서 도망
     */
    fleeBattle() {
        this.closeBattleModal();
        this.showInfo('전투에서 도망쳤습니다.');
        
        // 이전 안전지대로 후퇴
        const safePosition = this.findPreviousSafeZone(this.getCurrentPlayer().position);
        this.movePlayer(safePosition);
        
        this.endBattle(false);
    }

    /**
     * 전투 종료
     * @param {boolean} victory 승리 여부
     */
    endBattle(victory) {
        this.state = GameState.PLAYING;
        this.currentBattle = null;
        this.selectedGuardian = null;
        
        if (victory) {
            // 승리 보상
            const rewardCard = this.cardSystem.drawGuardianCards(1)[0];
            this.getCurrentPlayer().guardianCards.push(rewardCard);
            this.showInfo(`보상으로 ${rewardCard.name} 카드를 획득했습니다!`);
        }
        
        this.updateUI();
        this.endTurn();
    }

    /**
     * 손패 카드 선택
     * @param {number} index 카드 인덱스
     */
    selectHandCard(index) {
        const currentPlayer = this.getCurrentPlayer();
        const card = currentPlayer.guardianCards[index];
        
        if (!card) return;
        
        // 이전 선택 해제
        document.querySelectorAll('.hand-card').forEach(el => el.classList.remove('selected'));
        
        // 새로운 선택
        const cardElement = document.querySelector(`.hand-card[data-index="${index}"]`);
        if (cardElement) {
            cardElement.classList.add('selected');
            this.selectedGuardian = card;
            
            this.showInfo(`${card.name} 카드를 선택했습니다.`);
        }
    }

    /**
     * 수호신 카드 제거
     * @param {string} cardName 카드 이름
     */
    removeGuardianCard(cardName) {
        const currentPlayer = this.getCurrentPlayer();
        const cardIndex = currentPlayer.guardianCards.findIndex(card => card.name === cardName);
        
        if (cardIndex !== -1) {
            currentPlayer.guardianCards.splice(cardIndex, 1);
            this.updateUI();
        }
    }

    /**
     * 데미지 받기
     * @param {number} amount 데미지 양
     */
    takeDamage(amount) {
        const currentPlayer = this.getCurrentPlayer();
        
        for (let i = 0; i < amount && currentPlayer.guardianCards.length > 0; i++) {
            const removedCard = currentPlayer.guardianCards.pop();
            this.showInfo(`${removedCard.name} 카드를 잃었습니다.`);
        }
        
        if (currentPlayer.guardianCards.length === 0) {
            this.gameOver('모든 수호신 카드를 잃었습니다.');
        }
        
        this.updateUI();
    }

    /**
     * 이전 안전지대 찾기
     * @param {number} currentPosition 현재 위치
     * @returns {number} 안전지대 위치
     */
    findPreviousSafeZone(currentPosition) {
        const safeZones = [0, 6, 12, 18]; // 안전지대 위치들
        
        for (let i = currentPosition - 1; i >= 0; i--) {
            if (safeZones.includes(i)) {
                return i;
            }
        }
        
        return 0; // 시작점으로 돌아가기
    }

    /**
     * 턴 종료
     */
    endTurn() {
        console.log(`${this.getCurrentPlayer().name}의 턴 종료`);
        
        // 멀티플레이어에서 다음 플레이어로 전환
        if (this.gameMode !== GameMode.SINGLE) {
            this.switchToNextPlayer();
        }
        
        this.updateUI();
        
        // 다음 턴 시작
        setTimeout(() => this.startTurn(), 500);
    }

    /**
     * UI 업데이트
     */
    updateUI() {
        this.updatePlayerInfo();
        this.updateHandDisplay();
        this.updateBoardDisplay();
        this.updatePlayerFocus();
    }

    /**
     * 플레이어 정보 업데이트
     */
    updatePlayerInfo() {
        const currentPlayer = this.getCurrentPlayer();
        
        // 플레이어 위치 업데이트
        const positionElement = document.getElementById('player-position');
        if (positionElement) {
            const positionText = currentPlayer.position === 0 ? '시작점' : 
                                currentPlayer.position === 24 ? '탈출구' : 
                                `${currentPlayer.position}번 방`;
            positionElement.textContent = positionText;
        }
        
        // 카드 수 업데이트
        const cardsElement = document.getElementById('player-cards');
        if (cardsElement) {
            cardsElement.textContent = `${currentPlayer.guardianCards.length}장`;
        }
        
        // 현재 플레이어 표시
        const currentPlayerElement = document.querySelector('.current-player');
        if (currentPlayerElement) {
            currentPlayerElement.textContent = `${currentPlayer.name} 턴`;
        }
    }

    /**
     * 손패 표시 업데이트
     */
    updateHandDisplay() {
        const handContainer = document.getElementById('hand-cards');
        if (!handContainer) return;
        
        const currentPlayer = this.getCurrentPlayer();
        handContainer.innerHTML = '';
        
        if (currentPlayer.guardianCards.length === 0) {
            handContainer.innerHTML = `
                <div class="card-mini">
                    <div class="card-mini-name">카드 없음</div>
                    <div class="card-mini-type">-</div>
                </div>
            `;
            return;
        }
        
        currentPlayer.guardianCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-mini hand-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-mini-name">${card.name}</div>
                <div class="card-mini-type">${card.type}</div>
            `;
            handContainer.appendChild(cardElement);
        });
    }

    /**
     * 보드 표시 업데이트
     */
    updateBoardDisplay() {
        this.boardSystem.updateDisplay();
    }

    /**
     * AI 턴 실행
     */
    playAITurn() {
        console.log('AI 턴 실행 중...');
        
        // 간단한 AI 로직
        const diceResult = this.rollDice();
        
        setTimeout(() => {
            const possibleMoves = this.calculatePossibleMoves(diceResult);
            if (possibleMoves.length > 0) {
                // 가장 앞으로 갈 수 있는 위치 선택
                const bestMove = Math.max(...possibleMoves);
                this.movePlayer(bestMove);
            }
            
            setTimeout(() => this.endTurn(), 1000);
        }, 1500);
    }

    /**
     * 게임 오버
     * @param {string} reason 게임 오버 이유
     */
    gameOver(reason) {
        this.state = GameState.GAME_OVER;
        
        this.showError(`게임 오버: ${reason}`);
        
        // 게임 오버 처리
        setTimeout(() => {
            if (confirm('게임을 다시 시작하시겠습니까?')) {
                this.restart();
            }
        }, 2000);
    }

    /**
     * 승리
     * @param {number} winnerId 승리자 ID
     */
    victory(winnerId = null) {
        this.state = GameState.VICTORY;
        
        const winner = winnerId ? this.players.find(p => p.id === winnerId) : this.getCurrentPlayer();
        
        this.showSuccess(`🎉 ${winner.name} 승리! 요괴의 성에서 탈출했습니다!`);
        
        // 승리 처리
        setTimeout(() => {
            if (confirm('게임을 다시 시작하시겠습니까?')) {
                this.restart();
            }
        }, 3000);
    }

    /**
     * 게임 재시작
     */
    restart() {
        // 상태 초기화
        this.state = GameState.SETUP;
        this.currentPlayerIndex = 0;
        this.currentBattle = null;
        this.selectedGuardian = null;
        
        // 플레이어 초기화
        this.players = this.initializePlayers();
        
        // 시스템 재초기화
        this.boardSystem.reset();
        this.cardSystem.reset();
        
        // 모달 정리
        this.closeBattleModal();
        
        // 시작 화면 표시
        this.showStartScreen();
    }

    /**
     * 전투 모달 닫기
     */
    closeBattleModal() {
        const modal = document.getElementById('battle-modal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * 정보 메시지 표시
     * @param {string} message 메시지
     */
    showInfo(message) {
        console.log('Info:', message);
        
        if (this.uiEffects) {
            this.uiEffects.showNotification(message, 'info');
        }
        
        // 게임 로그에 추가
        this.addToGameLog(message, 'info');
    }

    /**
     * 게임 로그에 메시지 추가
     * @param {string} message 메시지
     * @param {string} type 메시지 타입
     */
    addToGameLog(message, type = 'info') {
        const logElement = document.getElementById('game-log');
        if (!logElement) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        
        // 새 메시지를 맨 위에 추가
        logElement.insertBefore(logEntry, logElement.firstChild);
        
        // 로그가 너무 많으면 오래된 것 제거 (최대 20개 유지)
        while (logElement.children.length > 20) {
            logElement.removeChild(logElement.lastChild);
        }
    }

    /**
     * 성공 메시지 표시
     * @param {string} message 메시지
     */
    showSuccess(message) {
        console.log('Success:', message);
        if (this.uiEffects) {
            this.uiEffects.showNotification(message, 'success');
        }
        this.addToGameLog(message, 'success');
    }

    /**
     * 에러 메시지 표시
     * @param {string} message 메시지
     */
    showError(message) {
        console.error('Error:', message);
        if (this.uiEffects) {
            this.uiEffects.showNotification(message, 'error');
        }
    }

    /**
     * 게임 스타일 추가
     */
    addGameStyles() {
        if (document.getElementById('game-styles')) return;

        const style = document.createElement('style');
        style.id = 'game-styles';
        style.textContent = `
            /* 시작 화면 스타일 */
            #start-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: radial-gradient(ellipse at center, #2a1f3f 0%, #0a0515 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .start-container {
                text-align: center;
                max-width: 600px;
                padding: 40px;
            }

            .game-title h1 {
                font-size: 3rem;
                color: #8a2b9f;
                text-shadow: 0 0 20px rgba(138, 43, 226, 0.8);
                margin-bottom: 10px;
                font-weight: bold;
            }

            .game-subtitle {
                font-size: 1.2rem;
                color: #4ecdc4;
                margin-bottom: 40px;
                opacity: 0.8;
            }

            .game-modes {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .mode-btn {
                background: linear-gradient(135deg, #1a0f2a 0%, #0a0515 100%);
                border: 2px solid rgba(138, 43, 226, 0.5);
                border-radius: 15px;
                padding: 30px 20px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 150px;
                text-align: center;
            }

            .mode-btn:hover {
                border-color: rgba(138, 43, 226, 1);
                box-shadow: 0 0 30px rgba(138, 43, 226, 0.5);
                transform: translateY(-5px);
            }

            .mode-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }

            .mode-title {
                font-size: 1.1rem;
                font-weight: bold;
                margin-bottom: 5px;
                color: #ffd700;
            }

            .mode-desc {
                font-size: 0.9rem;
                color: #b0b0b0;
            }

            /* 전투 모달 스타일 */
            .battle-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2000;
            }

            .battle-overlay {
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .battle-content {
                background: linear-gradient(135deg, #1a0f2a 0%, #0a0515 100%);
                border: 2px solid rgba(138, 43, 226, 0.8);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 0 50px rgba(138, 43, 226, 0.5);
            }

            .battle-header h2 {
                color: #8a2b9f;
                margin-bottom: 20px;
                text-shadow: 0 0 10px rgba(138, 43, 226, 0.8);
            }

            .battle-area {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin: 30px 0;
                gap: 20px;
            }

            .yokai-info, .player-info {
                flex: 1;
                text-align: center;
            }

            .yokai-icon, .player-icon {
                font-size: 3rem;
                margin-bottom: 10px;
            }

            .yokai-stats .stat {
                background: rgba(255, 107, 107, 0.2);
                padding: 5px 10px;
                margin: 5px 0;
                border-radius: 5px;
                font-size: 0.9rem;
            }

            .vs-indicator {
                font-size: 1.5rem;
                font-weight: bold;
                color: #ffd700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            }

            .battle-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
            }

            .battle-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }

            .fight-btn {
                background: linear-gradient(135deg, #ff6b6b 0%, #d63031 100%);
                color: white;
            }

            .fight-btn:hover:not(:disabled) {
                box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
                transform: translateY(-2px);
            }

            .fight-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .flee-btn {
                background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                color: white;
            }

            .flee-btn:hover {
                box-shadow: 0 0 20px rgba(116, 185, 255, 0.5);
                transform: translateY(-2px);
            }

            /* 손패 카드 선택 효과 */
            .hand-card.selected {
                border-color: rgba(255, 215, 0, 0.8) !important;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.5) !important;
                transform: translateX(10px) !important;
            }

            /* 반응형 디자인 */
            @media (max-width: 768px) {
                .game-modes {
                    flex-direction: column;
                    align-items: center;
                }

                .battle-area {
                    flex-direction: column;
                    gap: 15px;
                }

                .battle-actions {
                    flex-direction: column;
                    align-items: center;
                }

                .battle-btn {
                    width: 200px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * 시작 화면 스타일 추가
     */
    addStartScreenStyles() {
        // 이미 addGameStyles에 포함됨
    }

    /**
     * 전투 모달 스타일 추가
     */
    addBattleModalStyles() {
        // 이미 addGameStyles에 포함됨
    }

    /**
     * 이동 메뉴 표시
     */
    showMovementMenu() {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;

        this.showInfo(`${currentPlayer.name}의 현재 위치: ${currentPlayer.position}번`);
        this.showInfo('주사위를 굴려서 이동하세요!');
    }

    /**
     * 카드 메뉴 표시
     */
    showCardMenu() {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.guardianCards || currentPlayer.guardianCards.length === 0) {
            this.showInfo('사용할 수 있는 카드가 없습니다.');
            return;
        }

        this.showInfo(`보유 카드 ${currentPlayer.guardianCards.length}장을 확인하세요.`);
        this.updateHandCards();
    }

    /**
     * 게임 일시정지
     */
    pauseGame() {
        if (this.state === GameState.PLAYING) {
            this.showInfo('게임이 일시정지되었습니다. 아무 버튼이나 클릭하면 계속됩니다.');
        } else {
            this.showInfo('게임을 계속합니다.');
        }
    }

    /**
     * 방 상호작용 처리
     * @param {number} roomId 방 ID
     */
    handleRoomInteraction(roomId) {
        if (this.boardSystem) {
            this.boardSystem.showRoomInfo(roomId);
        }
    }

    /**
     * 수호신 카드 선택
     * @param {number} cardIndex 카드 인덱스
     */
    selectGuardianCard(cardIndex) {
        if (this.cardSystem) {
            const card = this.cardSystem.getGuardianCard(cardIndex);
            if (card) {
                this.showInfo(`수호신 카드 선택: ${card.name}`);
                this.selectedGuardian = card;
            }
        }
    }

    /**
     * 손패 카드 선택
     * @param {number} index 카드 인덱스
     */
    selectHandCard(index) {
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.guardianCards) return;

        if (index >= 0 && index < currentPlayer.guardianCards.length) {
            const card = currentPlayer.guardianCards[index];
            this.showInfo(`카드 선택: ${card.name}`);
            
            // 선택된 카드 하이라이트
            document.querySelectorAll('.hand-card').forEach((el, i) => {
                el.classList.toggle('selected', i === index);
            });
        }
    }

    /**
     * 이동 옵션 표시
     * @param {Array} possibleMoves 가능한 이동 위치 배열
     */
    showMovementOptions(possibleMoves) {
        this.showInfo(`이동 가능한 위치: ${possibleMoves.join(', ')}번`);
        
        // 첫 번째 옵션으로 자동 이동 (단순화)
        if (possibleMoves.length > 0) {
            setTimeout(() => {
                this.movePlayer(possibleMoves[0]);
            }, 1000);
        }
    }

    /**
     * 손패 카드 UI 업데이트
     */
    updateHandCards() {
        const currentPlayer = this.getCurrentPlayer();
        const handCardsElement = document.getElementById('hand-cards');
        
        if (!currentPlayer || !handCardsElement) return;

        handCardsElement.innerHTML = '';
        
        if (!currentPlayer.guardianCards || currentPlayer.guardianCards.length === 0) {
            handCardsElement.innerHTML = '<div class="no-cards">보유 카드 없음</div>';
            return;
        }

        currentPlayer.guardianCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-mini hand-card';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-mini-name">${card.name}</div>
                <div class="card-mini-type">수호신</div>
            `;
            handCardsElement.appendChild(cardElement);
        });
    }

    /**
     * 플레이어 포커스 업데이트
     * 현재 플레이어 말에 활성 효과 적용
     */
    updatePlayerFocus() {
        // 모든 플레이어 말에서 active 클래스 제거
        document.querySelectorAll('.player-piece').forEach(piece => {
            piece.classList.remove('active');
        });

        // 현재 플레이어 말에 active 클래스 추가
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer) {
            const currentPlayerPiece = document.getElementById(`player-${currentPlayer.id}`);
            if (currentPlayerPiece) {
                currentPlayerPiece.classList.add('active');
            }
        }
    }
}

// 기본 내보내기
export default GameController;