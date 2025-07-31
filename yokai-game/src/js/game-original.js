// 원본 스크린샷 기반 게임 로직

import OriginalYokaiBoard from './board-original.js';
import { CardDeck, createCardElement } from './cards-new.js';

// 게임 상태
const GameState = {
    SETUP: 'setup',
    PLAYING: 'playing',
    MOVE_PHASE: 'move_phase',
    BATTLE_PHASE: 'battle_phase',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

class OriginalYokaiCastleGame {
    constructor() {
        this.state = GameState.SETUP;
        this.board = new OriginalYokaiBoard();
        this.cardDeck = new CardDeck();
        
        // 멀티플레이어 시스템
        this.gameMode = 'single'; // 'single', 'vs_ai', 'vs_player'
        this.currentPlayerIndex = 0;
        this.players = [
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
        
        this.board.players = this.players;
        this.selectedGuardian = null;
        this.currentBattle = null;
        this.winner = null;
    }
    
    // 현재 플레이어 가져오기
    getCurrentPlayer() {
        if (!this.players || this.players.length === 0) {
            console.error('플레이어 데이터가 없습니다!');
            return null;
        }
        return this.players[this.currentPlayerIndex] || this.players[0];
    }
    
    // 다음 플레이어로 전환
    switchToNextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.selectedGuardian = null;
    }
    
    // 게임 초기화
    init() {
        console.log('요괴의 성 탈출 게임 시작! (원본 스타일)');
        
        // 게임 시작 화면 표시
        this.showStartScreen();
    }
    
    // 게임 시작 화면
    showStartScreen() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <div class="start-screen">
                <div class="start-content">
                    <h1 class="game-title">🏯 요괴의 성 탈출 🏯</h1>
                    <div class="game-description">
                        <p>1980년대 보드게임의 디지털 버전</p>
                        <p>요괴의 성에서 탈출하여 승리하세요!</p>
                    </div>
                    <div class="game-mode-selection">
                        <h3>게임 모드 선택:</h3>
                        <div class="mode-buttons">
                            <button class="mode-btn" data-mode="vs_ai">🤖 컴퓨터와 대전</button>
                            <button class="mode-btn" data-mode="vs_player">👥 2인 대전</button>
                            <button class="mode-btn" data-mode="single">🎮 혼자 플레이</button>
                        </div>
                    </div>
                    <div class="game-rules">
                        <h3>게임 방법:</h3>
                        <ul>
                            <li>🎲 이동 카드를 뽑아 이동하세요</li>
                            <li>👹 요괴를 만나면 수호신 카드로 전투하세요</li>
                            <li>🛡️ 수호신 카드가 모두 떨어지면 체크포인트로 돌아갑니다</li>
                            <li>🏁 먼저 성을 탈출하는 플레이어가 승리합니다!</li>
                        </ul>
                    </div>
                    <button id="start-game-btn" class="start-button" disabled>게임 시작</button>
                </div>
            </div>
        `;
        
        // 시작 화면 스타일 추가
        this.addStartScreenStyles();
        
        // 모드 선택 버튼 이벤트
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 기존 선택 제거
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
                // 새 선택 표시
                e.target.classList.add('selected');
                this.gameMode = e.target.dataset.mode;
                
                // 시작 버튼 활성화
                document.getElementById('start-game-btn').disabled = false;
                
                // 플레이어 설정
                if (this.gameMode === 'single') {
                    // 싱글 플레이어는 1명만 사용
                    this.players = [{
                        id: 1,
                        name: 'Player 1',
                        position: 0,
                        guardianCards: [],
                        skipNextTurn: false,
                        isAlive: true,
                        color: '#ff6b6b',
                        icon: '🎮'
                    }];
                } else if (this.gameMode === 'vs_ai') {
                    this.players[1].name = 'Computer';
                    this.players[1].icon = '🤖';
                } else if (this.gameMode === 'vs_player') {
                    this.players[1].name = 'Player 2';
                    this.players[1].icon = '🎯';
                }
            });
        });
        
        // 시작 버튼 이벤트
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
    }
    
    // 실제 게임 시작
    startGame() {
        // 기존 컨테이너 내용 제거
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <div id="game-board" class="game-board">
                <!-- 게임 보드 컨텐츠 -->
            </div>
            <div id="card-deck" class="card-deck">
                <!-- 카드 덱 영역 -->
            </div>
            <div id="player-area" class="player-area">
                <!-- 플레이어 정보 영역 -->
            </div>
        `;
        
        // 보드 초기화
        this.board.init();
        
        // UI 초기화
        this.setupUI();
        
        // 모든 플레이어에게 초기 수호신 카드 배분 (5장)
        this.players.forEach(player => {
            player.guardianCards = this.cardDeck.drawGuardianCard(5);
        });
        
        // 모든 플레이어를 시작 위치에 배치
        this.players.forEach(player => {
            this.board.placePlayer(0, player.id);
        });
        
        this.updateUI();
        
        // 게임 시작
        this.state = GameState.PLAYING;
        this.currentPlayerIndex = 0;
        this.startTurn();
    }
    
    // UI 설정 (멀티플레이어에 맞게 조정)
    setupUI() {
        const playerArea = document.getElementById('player-area');
        
        if (this.gameMode === 'single') {
            // 싱글 플레이어 UI
            playerArea.innerHTML = this.getSinglePlayerUI();
        } else {
            // 멀티플레이어 UI
            playerArea.innerHTML = this.getMultiPlayerUI();
        }
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 스타일 추가
        this.addOriginalGameStyles();
    }
    
    // 싱글 플레이어 UI
    getSinglePlayerUI() {
        return `
            <div class="original-game-info">
                <h2>요괴의 성 탈출</h2>
                <div class="player-status">
                    <div class="status-item">현재 위치: <span id="player-position">시작</span></div>
                    <div class="status-item">보유 카드: <span id="card-count">0</span>장</div>
                    <div class="status-item">선택된 수호신: <span id="selected-guardian">없음</span></div>
                </div>
                <div class="action-buttons">
                    <button id="draw-movement" class="game-button">이동 카드 뽑기</button>
                    <button id="battle-btn" class="game-button" disabled>전투</button>
                </div>
                <div id="movement-card-display"></div>
            </div>
            <div class="hand-display">
                <h4>보유 수호신 카드</h4>
                <div id="hand-cards"></div>
            </div>
        `;
    }
    
    // 멀티플레이어 UI
    getMultiPlayerUI() {
        const currentPlayer = this.getCurrentPlayer();
        const otherPlayer = this.players.find(p => p.id !== currentPlayer.id);
        
        return `
            <div class="multiplayer-info">
                <h2>요괴의 성 탈출 - 대전 모드</h2>
                <div class="current-turn">
                    <div class="turn-indicator">
                        <span class="player-icon" style="color: ${currentPlayer.color}">${currentPlayer.icon}</span>
                        <strong>${currentPlayer.name}</strong>의 차례
                    </div>
                </div>
            </div>
            
            <div class="players-status">
                ${this.players.map(player => `
                    <div class="player-panel ${player.id === currentPlayer.id ? 'active' : ''}" data-player="${player.id}">
                        <div class="player-header">
                            <span class="player-icon" style="color: ${player.color}">${player.icon}</span>
                            <h4>${player.name}</h4>
                        </div>
                        <div class="player-stats">
                            <div class="stat-item">위치: <span class="player-pos" data-player="${player.id}">시작</span></div>
                            <div class="stat-item">카드: <span class="player-cards" data-player="${player.id}">5</span>장</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="game-actions">
                <div class="action-buttons">
                    <button id="draw-movement" class="game-button">이동 카드 뽑기</button>
                    <button id="battle-btn" class="game-button" disabled>전투</button>
                </div>
                <div id="movement-card-display"></div>
                <div id="selected-guardian-display">선택된 수호신: <span id="selected-guardian">없음</span></div>
            </div>
            
            <div class="hand-display">
                <h4>${currentPlayer.name}의 수호신 카드</h4>
                <div id="hand-cards"></div>
            </div>
        `;
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        document.getElementById('draw-movement').addEventListener('click', () => {
            this.drawMovementCard();
        });
        
        document.getElementById('battle-btn').addEventListener('click', () => {
            this.executeBattle();
        });
    }
    
    // 시작 화면 스타일 추가
    addStartScreenStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .start-screen {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #0a0515 0%, #1a0f2a 50%, #0a0515 100%);
                padding: 20px;
            }
            
            .start-content {
                background: rgba(26, 15, 42, 0.95);
                border: 3px solid #4a1f5f;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 0 50px rgba(138, 43, 226, 0.6);
                max-width: 600px;
                width: 100%;
            }
            
            .game-title {
                color: #da70d6;
                font-size: 2.5em;
                margin-bottom: 20px;
                text-shadow: 0 0 10px rgba(218, 112, 214, 0.5);
                background: linear-gradient(45deg, #da70d6, #8a2b9f);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .game-description {
                color: #e0e0e0;
                font-size: 1.2em;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            
            .game-mode-selection {
                background: rgba(74, 31, 95, 0.4);
                border: 2px solid rgba(78, 205, 196, 0.5);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .game-mode-selection h3 {
                color: #4ecdc4;
                font-size: 1.3em;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .mode-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .mode-btn {
                background: linear-gradient(45deg, #4ecdc4, #44a08d);
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1em;
                font-weight: bold;
                padding: 12px 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }
            
            .mode-btn:hover {
                background: linear-gradient(45deg, #6fcfef, #4ecdc4);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
            }
            
            .mode-btn.selected {
                background: linear-gradient(45deg, #da70d6, #8a2b9f);
                box-shadow: 0 0 15px rgba(218, 112, 214, 0.6);
                transform: scale(1.05);
            }
            
            .game-rules {
                background: rgba(74, 31, 95, 0.3);
                border: 2px solid rgba(138, 43, 226, 0.5);
                border-radius: 15px;
                padding: 20px;
                margin: 30px 0;
                text-align: left;
            }
            
            .game-rules h3 {
                color: #4ecdc4;
                font-size: 1.3em;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .game-rules ul {
                color: #e0e0e0;
                line-height: 1.8;
                padding-left: 20px;
            }
            
            .game-rules li {
                margin-bottom: 8px;
            }
            
            .start-button {
                background: linear-gradient(45deg, #da70d6, #8a2b9f);
                border: none;
                border-radius: 15px;
                color: white;
                font-size: 1.5em;
                font-weight: bold;
                padding: 15px 40px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(138, 43, 226, 0.4);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .start-button:hover {
                background: linear-gradient(45deg, #ff6b9d, #da70d6);
                box-shadow: 0 6px 20px rgba(138, 43, 226, 0.6);
                transform: translateY(-2px);
            }
            
            .start-button:active {
                transform: translateY(0);
                box-shadow: 0 2px 10px rgba(138, 43, 226, 0.4);
            }
            
            .start-button:disabled {
                background: linear-gradient(45deg, #6c757d, #495057);
                cursor: not-allowed;
                opacity: 0.6;
                transform: none;
                box-shadow: none;
            }
            
            .start-button:disabled:hover {
                background: linear-gradient(45deg, #6c757d, #495057);
                transform: none;
                box-shadow: none;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 전투 모달 스타일 추가
    addBattleModalStyles() {
        console.log('=== addBattleModalStyles 시작 ===');
        
        // 이미 스타일이 있는지 다시 확인
        if (document.getElementById('battle-modal-styles')) {
            console.log('battle-modal-styles가 이미 존재함');
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'battle-modal-styles';
        style.textContent = `
            .battle-modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 9999 !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .battle-modal.show {
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .battle-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(3px);
                z-index: -1;
            }
            
            .battle-modal-content {
                position: relative;
                background: linear-gradient(135deg, #2a1f3a 0%, #3a2f4a 100%);
                border: 4px solid #da70d6;
                border-radius: 20px;
                padding: 35px;
                max-width: 500px;
                width: 80%;
                margin-right: 320px;
                box-shadow: 
                    0 0 60px rgba(218, 112, 214, 0.9),
                    inset 0 0 30px rgba(255, 255, 255, 0.1);
                transform: scale(0.8);
                transition: transform 0.3s ease;
                text-align: center;
                backdrop-filter: blur(10px);
                z-index: 1;
            }
            
            .battle-modal.show .battle-modal-content {
                transform: scale(1);
            }
            
            .battle-header h2 {
                color: #ff8a8a;
                font-size: 2.2em;
                margin-bottom: 20px;
                text-shadow: 
                    0 0 15px rgba(255, 138, 138, 0.8),
                    0 2px 4px rgba(0, 0, 0, 0.8);
                animation: battlePulse 2s ease-in-out infinite;
                font-weight: bold;
            }
            
            @keyframes battlePulse {
                0%, 100% { transform: scale(1); text-shadow: 0 0 15px rgba(255, 138, 138, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8); }
                50% { transform: scale(1.05); text-shadow: 0 0 25px rgba(255, 138, 138, 1), 0 2px 6px rgba(0, 0, 0, 0.9); }
            }
            
            .yokai-card {
                background: rgba(74, 31, 95, 0.9);
                border: 3px solid rgba(255, 138, 138, 0.8);
                border-radius: 15px;
                padding: 25px;
                margin: 20px 0;
                box-shadow: 
                    0 0 20px rgba(255, 138, 138, 0.4),
                    inset 0 0 15px rgba(255, 255, 255, 0.1);
            }
            
            .yokai-icon {
                font-size: 4.5em;
                margin-bottom: 15px;
                filter: drop-shadow(0 0 15px rgba(255, 138, 138, 0.8));
                text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
            }
            
            .yokai-card h3 {
                color: #ffaaaa;
                font-size: 1.8em;
                margin-bottom: 20px;
                text-shadow: 
                    0 0 10px rgba(255, 170, 170, 0.8),
                    0 2px 4px rgba(0, 0, 0, 0.8);
                font-weight: bold;
            }
            
            .yokai-stats {
                display: flex;
                justify-content: space-around;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .stat {
                background: rgba(26, 15, 42, 0.8);
                padding: 12px 20px;
                border-radius: 10px;
                color: #ffffff;
                font-size: 1em;
                border: 2px solid rgba(218, 112, 214, 0.6);
                box-shadow: 
                    0 0 10px rgba(218, 112, 214, 0.3),
                    inset 0 0 10px rgba(255, 255, 255, 0.1);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                font-weight: bold;
            }
            
            .battle-instructions {
                margin: 25px 0;
                color: #ffffff;
            }
            
            .battle-instructions p {
                margin: 15px 0;
                font-size: 1.1em;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
                font-weight: 500;
            }
            
            .weakness-hint {
                color: #6fcfef !important;
                font-style: italic;
                font-size: 1em;
                text-shadow: 0 0 8px rgba(111, 207, 239, 0.6);
                font-weight: bold;
            }
            
            .battle-actions {
                display: flex;
                justify-content: center;
                gap: 25px;
                margin-top: 35px;
            }
            
            .battle-btn {
                padding: 15px 30px;
                border: 2px solid transparent;
                border-radius: 12px;
                font-size: 1.2em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
                position: relative;
                overflow: hidden;
            }
            
            .fight-btn {
                background: linear-gradient(45deg, #ff6b6b, #e74c3c);
                color: white;
                border-color: #ff8a8a;
                box-shadow: 
                    0 6px 20px rgba(255, 107, 107, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
            }
            
            .fight-btn:hover {
                background: linear-gradient(45deg, #ff8a8a, #ff6b6b);
                box-shadow: 
                    0 8px 25px rgba(255, 107, 107, 0.7),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4);
                transform: translateY(-3px);
                border-color: #ffaaaa;
            }
            
            .fight-btn:active {
                transform: translateY(-1px);
                box-shadow: 
                    0 4px 15px rgba(255, 107, 107, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            
            .flee-btn {
                background: linear-gradient(45deg, #ff9800, #f57c00);
                color: white;
                border-color: #ff6f00;
                box-shadow: 
                    0 6px 20px rgba(255, 152, 0, 0.4),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
            
            .flee-btn:hover {
                background: linear-gradient(45deg, #ffb74d, #ff9800);
                box-shadow: 
                    0 8px 25px rgba(255, 152, 0, 0.6),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
                transform: translateY(-3px);
                border-color: #ff8f00;
            }
            
            .flee-btn:active {
                transform: translateY(-1px);
                box-shadow: 
                    0 4px 15px rgba(255, 152, 0, 0.5),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            
            .battle-btn:disabled {
                background: linear-gradient(45deg, #999, #777);
                cursor: not-allowed;
                opacity: 0.6;
                transform: none !important;
            }
            
            .battle-btn:disabled:hover {
                background: linear-gradient(45deg, #999, #777);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                transform: none !important;
            }
            
            @media (max-width: 1200px) {
                .battle-modal-content {
                    margin-right: 0;
                    max-width: 550px;
                    width: 90%;
                }
            }
            
            @media (max-width: 600px) {
                .battle-modal-content {
                    padding: 25px;
                    margin: 15px;
                    max-width: 95%;
                    margin-right: 0;
                }
                
                .battle-header h2 {
                    font-size: 1.8em;
                }
                
                .yokai-icon {
                    font-size: 3.5em;
                }
                
                .yokai-card h3 {
                    font-size: 1.5em;
                }
                
                .battle-instructions p {
                    font-size: 1em;
                }
                
                .battle-actions {
                    flex-direction: column;
                    gap: 20px;
                    margin-top: 25px;
                }
                
                .battle-btn {
                    font-size: 1.1em;
                    padding: 12px 25px;
                    min-width: 120px;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('전투 모달 스타일 추가 완료');
        console.log('추가된 스타일 엘리먼트:', document.getElementById('battle-modal-styles'));
    }
    
    // 원본 게임 스타일 추가
    addOriginalGameStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #player-area {
                position: fixed;
                right: 20px;
                top: 20px;
                width: 280px;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
                z-index: 10000;
                background: rgba(26, 15, 42, 0.95);
                border: 3px solid #4a1f5f;
                border-radius: 15px;
                padding: 20px;
                box-shadow: 0 0 30px rgba(138, 43, 226, 0.4);
                z-index: 200;
            }
            
            .original-game-info h2 {
                color: #da70d6;
                text-align: center;
                margin-bottom: 15px;
                font-size: 18px;
                background: linear-gradient(45deg, #da70d6, #8a2b9f);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .status-item {
                background: rgba(74, 31, 95, 0.3);
                padding: 8px 12px;
                margin: 5px 0;
                border-radius: 8px;
                border-left: 3px solid #da70d6;
                font-size: 14px;
                color: #e0e0e0;
            }
            
            .action-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin: 15px 0;
            }
            
            #movement-card-display {
                min-height: 120px;
                background: rgba(0, 0, 0, 0.3);
                border: 2px dashed rgba(138, 43, 226, 0.5);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 10px 0;
            }
            
            #movement-card-display:empty::before {
                content: '이동 카드를 뽑으세요';
                color: rgba(224, 224, 224, 0.5);
                font-style: italic;
            }
            
            .hand-display {
                background: rgba(26, 15, 42, 0.9);
                border: 2px solid #4ecdc4;
                border-radius: 10px;
                padding: 15px;
                margin-top: 15px;
            }
            
            .hand-display h4 {
                color: #4ecdc4;
                margin: 0 0 10px 0;
                text-align: center;
            }
            
            #hand-cards {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            #hand-cards .card {
                width: 100px;
                height: 70px;
                font-size: 9px;
                cursor: pointer;
            }
            
            #hand-cards .card.selected {
                border-color: #ffd700;
                box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            }
            
            /* 스크롤바 스타일링 */
            #hand-cards::-webkit-scrollbar {
                width: 6px;
            }
            
            #hand-cards::-webkit-scrollbar-track {
                background: rgba(26, 15, 42, 0.5);
                border-radius: 3px;
            }
            
            #hand-cards::-webkit-scrollbar-thumb {
                background: #4ecdc4;
                border-radius: 3px;
            }
            
            /* 반응형 조정 */
            @media (max-width: 1200px) {
                #player-area {
                    position: relative;
                    width: 100%;
                    margin-top: 20px;
                    right: auto;
                    top: auto;
                    max-height: none;
                }
                
                .hand-display {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                #hand-cards {
                    grid-template-columns: repeat(4, 1fr);
                }
                
                #game-container {
                    flex-direction: column;
                }
            }
            
            /* 멀티플레이어 UI 스타일 */
            .multiplayer-info {
                background: rgba(26, 15, 42, 0.95);
                border: 3px solid #4a1f5f;
                border-radius: 15px;
                padding: 15px;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .multiplayer-info h2 {
                color: #da70d6;
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .turn-indicator {
                background: rgba(74, 31, 95, 0.6);
                border: 2px solid rgba(218, 112, 214, 0.5);
                border-radius: 10px;
                padding: 8px 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                animation: turnPulse 2s ease-in-out infinite;
            }
            
            @keyframes turnPulse {
                0%, 100% { box-shadow: 0 0 10px rgba(218, 112, 214, 0.3); }
                50% { box-shadow: 0 0 20px rgba(218, 112, 214, 0.6); }
            }
            
            .player-icon {
                font-size: 18px;
                filter: drop-shadow(0 0 5px currentColor);
            }
            
            .players-status {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .player-panel {
                background: rgba(26, 15, 42, 0.7);
                border: 2px solid rgba(108, 117, 125, 0.5);
                border-radius: 10px;
                padding: 12px;
                transition: all 0.3s ease;
            }
            
            .player-panel.active {
                border-color: rgba(218, 112, 214, 0.8);
                background: rgba(74, 31, 95, 0.8);
                box-shadow: 0 0 15px rgba(218, 112, 214, 0.3);
            }
            
            .player-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            .player-header h4 {
                color: #e0e0e0;
                margin: 0;
                font-size: 14px;
            }
            
            .player-stats {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            
            .stat-item {
                color: #c0c0c0;
                font-size: 12px;
            }
            
            .game-actions {
                background: rgba(26, 15, 42, 0.8);
                border: 2px solid rgba(78, 205, 196, 0.5);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            #selected-guardian-display {
                color: #4ecdc4;
                font-size: 12px;
                text-align: center;
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 턴 시작
    startTurn() {
        const currentPlayer = this.getCurrentPlayer();
        
        if (currentPlayer.skipNextTurn) {
            showInfo(`${currentPlayer.name}은(는) 이번 턴을 쉽니다.`);
            currentPlayer.skipNextTurn = false;
            this.endTurn();
            return;
        }
        
        this.state = GameState.MOVE_PHASE;
        this.updateUI();
        
        // AI 플레이어의 턴일 때 자동 진행
        if (this.gameMode === 'vs_ai' && currentPlayer.name === 'Computer') {
            setTimeout(() => {
                this.playAITurn();
            }, 1000);
        }
    }
    
    // AI 턴 실행
    playAITurn() {
        const currentPlayer = this.getCurrentPlayer();
        showInfo(`${currentPlayer.icon} ${currentPlayer.name}의 턴입니다...`);
        
        // AI 사고 시뮬레이션 딜레이
        setTimeout(() => {
            this.drawMovementCard();
        }, 1000);
    }
    
    // AI 자동 이동 선택
    selectAIMovement(possibleMoves) {
        const currentPlayer = this.getCurrentPlayer();
        const currentPos = currentPlayer.position;
        
        // AI 전략: 목표 지점(탈출구)까지 최단 거리 선택
        let bestMove = possibleMoves[0];
        let maxProgress = 0;
        
        possibleMoves.forEach(roomId => {
            // 탈출구(24)에 가까운 움직임 선호
            const progress = roomId;
            
            // 특수 방이나 체크포인트 우선 고려
            const room = this.board.rooms.find(r => r.id === roomId);
            if (room && room.type === 'special-room') {
                // 특수 방은 보너스 점수
                if (progress + 5 > maxProgress) {
                    maxProgress = progress + 5;
                    bestMove = roomId;
                }
            } else if (progress > maxProgress) {
                maxProgress = progress;
                bestMove = roomId;
            }
        });
        
        // AI 이동 실행
        showInfo(`${currentPlayer.icon} ${currentPlayer.name}이(가) ${bestMove}번 방으로 이동합니다.`);
        
        setTimeout(() => {
            this.board.clearMovementMode();
            // 보드의 movePlayer를 직접 호출하여 방 효과가 제대로 처리되도록 함
            this.board.movePlayer(bestMove);
        }, 800);
    }
    
    // 이동 카드 뽑기
    drawMovementCard() {
        if (this.state !== GameState.MOVE_PHASE) return;
        
        const card = this.cardDeck.drawMovementCard();
        console.log(`이동 카드: ${card.name}`);
        
        // 카드 표시
        const cardDisplay = document.getElementById('movement-card-display');
        cardDisplay.innerHTML = '';
        const cardElement = createCardElement(card);
        cardElement.style.width = '80px';
        cardElement.style.height = '100px';
        cardDisplay.appendChild(cardElement);
        
        // 카드 뽑기 효과
        uiEffects.fadeIn(cardElement);
        showInfo(`${card.name} 카드를 뽑았습니다!`);
        
        // 이동 처리
        this.handleMovementCard(card);
        
        // 버튼 비활성화
        document.getElementById('draw-movement').disabled = true;
    }
    
    // 이동 카드 처리
    handleMovementCard(card) {
        if (card.value === 'choice') {
            showInfo('엑소시스트 카드! 1~6칸 중 선택하세요.');
            this.handleExorcistCard();
        } else if (card.value === 0) {
            showError('블랙 카드! 이동할 수 없습니다.');
            this.endTurn();
        } else {
            this.handleMovement(card.value);
        }
    }
    
    // 이동 처리
    handleMovement(steps) {
        const currentPlayer = this.getCurrentPlayer();
        console.log(`${currentPlayer.name}: ${steps}칸 이동 가능`);
        
        // 가능한 이동 위치 계산
        const possibleMoves = this.calculatePossibleMoves(steps);
        
        // 이동할 수 있는 곳이 하나뿐이거나 일반 이동인 경우 자동 이동
        if (possibleMoves.length === 1) {
            showInfo(`${currentPlayer.name}: ${steps}칸 이동합니다.`);
            setTimeout(() => {
                this.board.clearMovementMode();
                this.board.movePlayer(possibleMoves[0]);
            }, 1000);
            return;
        }
        
        // AI 플레이어인 경우 자동 이동
        if (this.gameMode === 'vs_ai' && currentPlayer.name === 'Computer') {
            // 이동 가능 위치 잠시 표시
            possibleMoves.forEach(roomId => {
                const room = document.getElementById(`room-${roomId}`);
                if (room) {
                    room.classList.add('moveable');
                }
            });
            
            // AI가 선택하는 시간 시뮬레이션
            setTimeout(() => {
                this.selectAIMovement(possibleMoves);
            }, 1500);
        } else {
            // 사용자가 직접 선택할 수 있도록 이동 가능 영역 표시
            showInfo(`${currentPlayer.name}: ${steps}칸 이동하세요. 원하는 방을 클릭하세요.`);
            
            // 보드에서 이동 가능 영역 표시
            this.board.showPossibleMoves(currentPlayer.position, steps);
        }
    }
    
    // 애니메이션과 함께 플레이어 이동
    movePlayerWithAnimation(targetRoomId, callback) {
        console.log('movePlayerWithAnimation 시작 - 목표 위치:', targetRoomId);
        const currentPlayer = this.getCurrentPlayer();
        const currentPos = currentPlayer.position;
        console.log('현재 플레이어 위치:', currentPos);
        
        const path = this.calculateMovementPath(currentPos, targetRoomId);
        console.log('이동 경로:', path);
        
        this.animatePlayerMovement(path, 0, callback);
    }
    
    // 이동 경로 계산
    calculateMovementPath(fromRoom, toRoom) {
        if (fromRoom === toRoom) return [toRoom];
        if (fromRoom > toRoom) {
            // 뒤로 이동 (패배시 시작점으로)
            const path = [];
            for (let i = fromRoom; i >= toRoom; i--) {
                path.push(i);
            }
            return path;
        } else {
            // 앞으로 이동
            const path = [];
            for (let i = fromRoom; i <= toRoom; i++) {
                path.push(i);
            }
            return path;
        }
    }
    
    // 플레이어 이동 애니메이션
    animatePlayerMovement(path, index, callback) {
        if (index >= path.length) {
            console.log('이동 애니메이션 완료');
            if (callback) callback();
            return;
        }
        
        const currentPlayer = this.getCurrentPlayer();
        const currentRoomId = path[index];
        console.log(`이동 중: 경로의 ${index}번째, 방 ID: ${currentRoomId}`);
        
        // 카메라 줌 효과
        this.zoomToRoom(currentRoomId);
        
        // 플레이어 이동
        try {
            this.board.placePlayer(currentRoomId, currentPlayer.id);
            currentPlayer.position = currentRoomId;
            console.log('플레이어 위치 업데이트 완료:', currentRoomId);
        } catch (error) {
            console.error('플레이어 이동 중 오류:', error);
        }
        
        this.updateUI();
        
        // 다음 이동 (500ms 후)
        setTimeout(() => {
            this.animatePlayerMovement(path, index + 1, callback);
        }, 500);
    }
    
    // 특정 방으로 카메라 줌
    zoomToRoom(roomId) {
        const room = document.getElementById(`room-${roomId}`);
        const gameBoard = document.getElementById('game-board');
        
        if (room && gameBoard) {
            // 방의 위치 계산
            const roomRect = room.getBoundingClientRect();
            const boardRect = gameBoard.getBoundingClientRect();
            
            // 줌 효과 적용
            gameBoard.style.transition = 'transform 0.3s ease-in-out';
            gameBoard.style.transform = 'scale(1.2)';
            
            // 300ms 후 원래 크기로 복원
            setTimeout(() => {
                gameBoard.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    // 가능한 이동 계산
    calculatePossibleMoves(steps) {
        const currentPlayer = this.getCurrentPlayer();
        const currentPos = currentPlayer.position;
        const maxPosition = Math.min(currentPos + steps, this.board.rooms.length - 1);
        
        const possibleMoves = [];
        for (let i = currentPos + 1; i <= maxPosition; i++) {
            possibleMoves.push(i);
        }
        
        return possibleMoves;
    }
    
    // 엑소시스트 카드 처리
    handleExorcistCard() {
        const currentPlayer = this.getCurrentPlayer();
        const allMoves = [];
        for (let i = 1; i <= 6; i++) {
            this.calculatePossibleMoves(i).forEach(move => {
                if (!allMoves.includes(move)) {
                    allMoves.push(move);
                }
            });
        }
        
        // AI 플레이어인 경우 자동 선택
        if (this.gameMode === 'vs_ai' && currentPlayer.name === 'Computer') {
            // 이동 가능 위치 잠시 표시
            allMoves.forEach(roomId => {
                const room = document.getElementById(`room-${roomId}`);
                if (room) {
                    room.classList.add('moveable');
                }
            });
            
            // AI가 최적의 이동 선택 (가장 멀리)
            setTimeout(() => {
                this.selectAIMovement(allMoves);
            }, 1500);
        } else {
            // 인간 플레이어
            this.board.movementMode = true;
            this.board.possibleMoves = allMoves;
            
            // 이동 가능 위치 표시
            allMoves.forEach(roomId => {
                const room = document.getElementById(`room-${roomId}`);
                if (room) {
                    room.classList.add('moveable');
                }
            });
        }
    }
    
    // 특수 카드 처리
    handleSpecialCard(card) {
        const currentPlayer = this.getCurrentPlayer();
        
        switch(card.effect) {
            case 'teleport':
                showInfo(`${currentPlayer.name}: 텔레포트 카드! 아무 방으로 이동 가능합니다.`);
                // AI인 경우 자동으로 가장 좋은 위치 선택
                if (this.gameMode === 'vs_ai' && currentPlayer.name === 'Computer') {
                    setTimeout(() => {
                        this.movePlayerWithAnimation(23, () => { // 거의 끝 지점으로
                            this.endTurn();
                        });
                    }, 1500);
                } else {
                    // 인간 플레이어는 모든 방 선택 가능
                    this.board.movementMode = true;
                    this.board.possibleMoves = Array.from({length: 24}, (_, i) => i);
                    for (let i = 0; i < 24; i++) {
                        const room = document.getElementById(`room-${i}`);
                        if (room) room.classList.add('moveable');
                    }
                }
                break;
                
            case 'heal':
                showInfo(`${currentPlayer.name}: 치유 카드! 수호신 카드 2장을 받습니다.`);
                const newCards = this.cardDeck.drawGuardianCard(2);
                currentPlayer.guardianCards.push(...newCards);
                this.updateUI();
                setTimeout(() => this.endTurn(), 1500);
                break;
                
            case 'skip':
                showInfo(`${currentPlayer.name}: 저주 카드! 다음 턴을 쉽니다.`);
                currentPlayer.skipNextTurn = true;
                setTimeout(() => this.endTurn(), 1500);
                break;
                
            default:
                setTimeout(() => this.endTurn(), 1000);
        }
    }
    
    // 특수 방 진입
    enterSpecialRoom(room) {
        const currentPlayer = this.getCurrentPlayer();
        const effect = room.effect || 'skip_turn';
        
        switch(effect) {
            case 'skip_turn':
                showInfo(`${currentPlayer.name}: ${room.name}에서 1턴 쉬어야 합니다.`);
                currentPlayer.skipNextTurn = true;
                break;
            case 'confusion':
                showInfo(`${currentPlayer.name}: ${room.name}에서 혼란에 빠졌습니다.`);
                // 추가 효과 구현 가능
                break;
        }
        
        setTimeout(() => this.endTurn(), 1500);
    }
    
    // 수호신 카드 획득 방 진입
    enterGuardianRoom(room) {
        const currentPlayer = this.getCurrentPlayer();
        showInfo(`${currentPlayer.name}: ${room.name}에 도착했습니다!`);
        
        // 수호신 카드 2장 획득
        const newCards = this.cardDeck.drawGuardianCard(2);
        currentPlayer.guardianCards.push(...newCards);
        
        showSuccess(`${currentPlayer.name}: 수호신 카드 2장을 획득했습니다!`);
        this.updateUI();
        
        setTimeout(() => this.endTurn(), 2000);
    }
    
    // 안전지대 진입
    enterSafeRoom(room) {
        const currentPlayer = this.getCurrentPlayer();
        showInfo(`${currentPlayer.name}: ${room.name}에 도착했습니다. 이곳은 안전합니다!`);
        
        // 체력 회복 효과 (수호신 카드 1장 추가)
        const healCard = this.cardDeck.drawGuardianCard(1);
        if (healCard.length > 0) {
            currentPlayer.guardianCards.push(...healCard);
            showSuccess(`${currentPlayer.name}: 휴식을 취하고 수호신 카드 1장을 받았습니다.`);
            this.updateUI();
        }
        
        setTimeout(() => this.endTurn(), 2000);
    }
    
    // 요괴 방 진입
    enterYokaiRoom(room) {
        console.log('요괴 방 진입!', room);
        const currentPlayer = this.getCurrentPlayer();
        
        // 수호신 카드가 없으면 자동으로 도망가기
        if (currentPlayer.guardianCards.length === 0) {
            showError(`${currentPlayer.name}: 수호신 카드가 없어 요괴와 싸울 수 없습니다!`);
            showInfo('전투할 수 있는 카드가 없어 자동으로 도망갑니다.');
            this.returnToStart('수호신 카드가 없어 안전지대로 돌아갑니다.');
            return;
        }
        
        this.state = GameState.BATTLE_PHASE;
        
        // 요괴 카드 뽑기
        const yokaiCard = this.cardDeck.drawYokaiCard();
        console.log('요괴 카드:', yokaiCard);
        
        if (yokaiCard.type === 'special') {
            this.handleSpecialCard(yokaiCard);
            return;
        }
        
        this.currentBattle = {
            yokai: yokaiCard,
            room: room
        };
        
        console.log('현재 플레이어:', currentPlayer.name, '게임 모드:', this.gameMode);
        
        // AI 플레이어면 자동 전투
        if (this.gameMode === 'vs_ai' && currentPlayer.name === 'Computer') {
            this.executeAIBattle(yokaiCard);
        } else {
            // 인간 플레이어는 전투 모달 표시
            console.log('전투 모달 표시 시도');
            this.showBattleModal(yokaiCard);
        }
    }
    
    // AI 자동 전투 실행
    executeAIBattle(yokai) {
        const currentPlayer = this.getCurrentPlayer();
        
        // AI도 수호신 카드가 없으면 체크
        if (currentPlayer.guardianCards.length === 0) {
            showError(`${currentPlayer.name}: 수호신 카드가 없어 안전지대로 돌아갑니다!`);
            showInfo('전투할 수 있는 카드가 없어 자동으로 도망갑니다.');
            this.returnToStart('수호신 카드가 없어 안전지대로 돌아갑니다.');
            return;
        }
        
        showInfo(`${currentPlayer.icon} ${currentPlayer.name}이(가) ${yokai.name}과(와) 전투합니다!`);
        
        // AI 전투 전략
        setTimeout(() => {
            // AI가 최적의 수호신 카드 선택
            const bestGuardian = this.selectBestGuardianForAI(yokai);
            
            if (bestGuardian) {
                this.selectedGuardian = bestGuardian.name;
                showInfo(`AI가 ${bestGuardian.name} 카드를 선택했습니다!`);
                
                setTimeout(() => {
                    const result = this.executeBattle();
                    
                    if (!result) {
                        // 전투 실패 시에도 턴 종료
                        setTimeout(() => {
                            this.endTurn();
                        }, 1500);
                    }
                }, 1000);
            } else {
                // 적절한 카드가 없으면 랜덤 선택
                const randomCard = currentPlayer.guardianCards[Math.floor(Math.random() * currentPlayer.guardianCards.length)];
                this.selectedGuardian = randomCard.name;
                showInfo(`AI가 ${randomCard.name} 카드를 선택했습니다!`);
                
                setTimeout(() => {
                    this.executeBattle();
                    setTimeout(() => {
                        this.endTurn();
                    }, 1500);
                }, 1000);
            }
        }, 1500);
    }
    
    // AI를 위한 최적의 수호신 카드 선택
    selectBestGuardianForAI(yokai) {
        const currentPlayer = this.getCurrentPlayer();
        
        // 요괴의 약점에 맞는 카드 찾기
        for (let card of currentPlayer.guardianCards) {
            if (yokai.weakness.includes(card.name)) {
                return {
                    name: card.name
                };
            }
        }
        
        return null;
    }
    
    // 전투 모달 표시
    showBattleModal(yokai) {
        console.log('=== showBattleModal 시작 ===');
        console.log('요괴 정보:', yokai);
        console.log('현재 게임 상태:', this.state);
        console.log('현재 플레이어:', this.getCurrentPlayer());
        
        const currentPlayer = this.getCurrentPlayer();
        
        // 기존 모달이 있으면 제거
        const existingModal = document.getElementById('battle-modal');
        if (existingModal) {
            console.log('기존 모달 제거');
            existingModal.remove();
        }
        
        // 모달 스타일이 추가되었는지 확인
        const modalStyles = document.getElementById('battle-modal-styles');
        console.log('모달 스타일 존재 여부:', modalStyles ? '있음' : '없음');
        if (!modalStyles) {
            console.log('모달 스타일 추가 시도');
            this.addBattleModalStyles();
        }
        
        // 전투 중에 플레이어 영역 강조
        const playerArea = document.getElementById('player-area');
        if (playerArea) {
            playerArea.style.boxShadow = '0 0 30px rgba(78, 205, 196, 0.8)';
            playerArea.style.border = '3px solid #4ecdc4';
            playerArea.style.zIndex = '10001';
            
            // 수호신 카드 선택 안내 추가
            const handDisplay = playerArea.querySelector('.hand-display');
            if (handDisplay) {
                const title = handDisplay.querySelector('h4');
                if (title) {
                    title.innerHTML = `<span style="color: #ff6b6b; animation: pulse 1s infinite;">⚔️ 전투중!</span> 수호신 카드를 선택하세요`;
                }
            }
        }
        
        const modal = document.createElement('div');
        modal.className = 'battle-modal';
        modal.id = 'battle-modal';
        console.log('모달 엘리먼트 생성됨');
        
        // 모달 HTML 생성 - 오버레이를 먼저 배치
        const modalHTML = `
            <div class="battle-modal-overlay"></div>
            <div class="battle-modal-content">
                <div class="battle-header">
                    <h2>👹 요괴 조우! 👹</h2>
                </div>
                <div class="battle-yokai-info">
                    <div class="yokai-card">
                        <div class="yokai-icon">${yokai.icon || '👹'}</div>
                        <h3>${yokai.name}</h3>
                        <div class="yokai-stats">
                            <div class="stat">공격력: ${yokai.power}</div>
                            <div class="stat">약점: ${yokai.weakness ? yokai.weakness.join(', ') : '없음'}</div>
                        </div>
                    </div>
                </div>
                <div class="battle-instructions">
                    <p>🛡️ <strong>1단계:</strong> 오른쪽 패널에서 수호신 카드를 선택하세요</p>
                    <p>⚔️ <strong>2단계:</strong> 전투 버튼을 클릭하여 싸우세요</p>
                    <p class="weakness-hint">💡 요괴의 약점에 맞는 수호신을 선택하면 승리할 수 있습니다!</p>
                </div>
                <div class="battle-actions">
                    <button id="battle-fight-btn" class="battle-btn fight-btn" ${currentPlayer.guardianCards.length === 0 ? 'disabled' : ''}>
                        ⚔️ 전투 ${currentPlayer.guardianCards.length === 0 ? '(카드 없음)' : ''}
                    </button>
                    <button id="battle-flee-btn" class="battle-btn flee-btn">🏃 도망가기</button>
                </div>
            </div>
        `;
        
        modal.innerHTML = modalHTML;
        console.log('모달 HTML 설정 완료');
        
        // 모달을 game-container에 추가 (body는 overflow:hidden이므로)
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(modal);
            console.log('모달을 game-container에 추가했습니다');
        } else {
            document.body.appendChild(modal);
            console.log('game-container를 찾을 수 없어 body에 추가했습니다');
        }
        console.log('모달 DOM에 추가됨');
        console.log('모달 element:', modal);
        console.log('모달의 computed style:', window.getComputedStyle(modal));
        
        // 전투 모달 스타일이 이미 추가되었는지 확인
        if (!document.getElementById('battle-modal-styles')) {
            console.log('전투 모달 스타일 추가');
            this.addBattleModalStyles();
        } else {
            console.log('전투 모달 스타일 이미 존재');
        }
        
        // 모달이 실제로 DOM에 있는지 확인
        const checkModal = document.getElementById('battle-modal');
        console.log('DOM에서 모달 재확인:', checkModal);
        
        // 모달 애니메이션
        requestAnimationFrame(() => {
            console.log('requestAnimationFrame 실행');
            const modalElement = document.getElementById('battle-modal');
            if (modalElement) {
                modalElement.classList.add('show');
                console.log('show 클래스 추가됨');
                console.log('모달 클래스 리스트:', modalElement.className);
                
                // 모달의 display 속성 확인
                const computedStyle = window.getComputedStyle(modalElement);
                console.log('모달 display:', computedStyle.display);
                console.log('모달 visibility:', computedStyle.visibility);
                console.log('모달 opacity:', computedStyle.opacity);
                console.log('모달 z-index:', computedStyle.zIndex);
                console.log('모달 position:', computedStyle.position);
                console.log('모달 top:', computedStyle.top);
                console.log('모달 left:', computedStyle.left);
                console.log('모달 width:', computedStyle.width);
                console.log('모달 height:', computedStyle.height);
                
                // 부모 요소들의 스타일 확인
                let parent = modalElement.parentElement;
                while (parent && parent !== document.body) {
                    const parentStyle = window.getComputedStyle(parent);
                    console.log(`부모 요소 ${parent.id || parent.className}:`, {
                        overflow: parentStyle.overflow,
                        position: parentStyle.position,
                        zIndex: parentStyle.zIndex,
                        display: parentStyle.display
                    });
                    parent = parent.parentElement;
                }
            } else {
                console.error('모달을 찾을 수 없음!');
            }
        });
        
        // 짧은 딜레이 후 이벤트 리스너 추가
        setTimeout(() => {
            console.log('이벤트 리스너 추가 시작');
            
            const fightBtn = document.getElementById('battle-fight-btn');
            const fleeBtn = document.getElementById('battle-flee-btn');
            const overlay = modal.querySelector('.battle-modal-overlay');
            
            console.log('버튼 요소들:', { fightBtn, fleeBtn, overlay });
            
            if (fightBtn) {
                fightBtn.addEventListener('click', () => {
                    console.log('전투 버튼 클릭됨');
                    this.executeBattleFromModal();
                });
            }
            
            if (fleeBtn) {
                fleeBtn.addEventListener('click', () => {
                    console.log('도망가기 버튼 클릭됨');
                    this.fleeBattle();
                });
            }
            
            // 배경 클릭시 닫기
            if (overlay) {
                overlay.addEventListener('click', () => {
                    console.log('오버레이 클릭됨');
                    this.closeBattleModal();
                });
            }
        }, 100);
        
        console.log('=== showBattleModal 종료 ===');
        
        // 디버그: 모든 CSS 규칙 확인
        setTimeout(() => {
            const modal = document.getElementById('battle-modal');
            if (modal) {
                console.log('=== CSS 규칙 디버그 ===');
                const sheets = document.styleSheets;
                for (let i = 0; i < sheets.length; i++) {
                    try {
                        const rules = sheets[i].cssRules || sheets[i].rules;
                        if (rules) {
                            for (let j = 0; j < rules.length; j++) {
                                const rule = rules[j];
                                if (rule.selectorText && 
                                    (rule.selectorText.includes('.battle-modal') || 
                                     rule.selectorText.includes('#battle-modal'))) {
                                    console.log('CSS 규칙 발견:', rule.selectorText, rule.style.cssText);
                                }
                            }
                        }
                    } catch (e) {
                        // CORS 에러 무시
                    }
                }
            }
        }, 200);
    }
    
    // 전투 모달 닫기
    closeBattleModal() {
        const modal = document.getElementById('battle-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        // 플레이어 영역 스타일 원래대로
        const playerArea = document.getElementById('player-area');
        if (playerArea) {
            playerArea.style.boxShadow = '';
            playerArea.style.border = '3px solid #4a1f5f';
            playerArea.style.zIndex = '10000';
            
            // 수호신 카드 제목 원래대로
            const handDisplay = playerArea.querySelector('.hand-display h4');
            if (handDisplay) {
                const currentPlayer = this.getCurrentPlayer();
                if (currentPlayer) {
                    handDisplay.textContent = `${currentPlayer.name}의 수호신 카드`;
                }
            }
        }
        
        // 전투 상태 초기화
        this.currentBattle = null;
        this.state = GameState.PLAYING;
        this.endTurn();
    }
    
    // 모달에서 전투 실행
    executeBattleFromModal() {
        if (!this.selectedGuardian) {
            showError('수호신 카드를 먼저 선택하세요!');
            return;
        }
        
        const result = this.executeBattle();
        
        // 결과에 따라 모달 닫기
        setTimeout(() => {
            this.closeBattleModal();
        }, 2000);
    }
    
    // 도망가기 처리
    fleeBattle() {
        console.log('도망가기 시작');
        const currentPlayer = this.getCurrentPlayer();
        
        // 전투 모달 닫기
        this.closeBattleModal();
        
        // 도망가기 메시지 표시
        showInfo(`${currentPlayer.name}이(가) 전투에서 도망쳤습니다!`);
        
        // 안전지대로 이동
        this.returnToStart('도망쳤습니다! 가장 가까운 안전지대로 돌아갑니다.');
    }
    
    // 전투 정보 업데이트
    updateBattleInfo(yokai) {
        const cardDisplay = document.getElementById('movement-card-display');
        cardDisplay.innerHTML = `
            <div class="battle-info">
                <div class="yokai-info">
                    <h4>${yokai.name}</h4>
                    <p>공격력: ${yokai.power}</p>
                    <p>약점: ${yokai.weakness.join(', ') || '없음'}</p>
                </div>
                <div class="battle-instruction">
                    수호신 카드를 선택하고<br>전투 버튼을 누르세요
                </div>
            </div>
        `;
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .battle-info {
                text-align: center;
                color: #e0e0e0;
                padding: 10px;
            }
            
            .yokai-info h4 {
                color: #ff6b6b;
                margin: 5px 0;
            }
            
            .yokai-info p {
                margin: 3px 0;
                font-size: 12px;
            }
            
            .battle-instruction {
                margin-top: 10px;
                font-size: 11px;
                color: #ffd700;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 전투 실행
    executeBattle() {
        if (!this.currentBattle || !this.selectedGuardian) {
            showError('수호신 카드를 먼저 선택하세요!');
            return false;
        }
        
        const currentPlayer = this.getCurrentPlayer();
        const yokai = this.currentBattle.yokai;
        const guardianName = this.selectedGuardian; // 이미 이름으로 저장됨
        
        // 약점 확인
        if (yokai.weakness.includes(guardianName)) {
            showSuccess(`${currentPlayer.name}: ${guardianName}(으)로 ${yokai.name}을(를) 물리쳤습니다!`);
            
            // 사용한 수호신 카드 제거
            this.removeGuardianCard(guardianName);
            
            // 전투 종료
            this.endBattle(true);
            return true;
        } else {
            showError(`${currentPlayer.name}: ${guardianName}은(는) ${yokai.name}에게 효과가 없습니다!`);
            
            // 전투 모달 닫기
            this.closeBattleModal();
            
            // 패배 처리 - 이전 안전지대로 이동
            this.endBattle(false);
            return false;
        }
    }
    
    // 수호신 이름 가져오기
    getGuardianName(guardianId) {
        const guardianMap = {
            'fire': '불',
            'light': '빛',
            'peace': '평화',
            'justice': '정의',
            'purify': '정화'
        };
        return guardianMap[guardianId] || guardianId;
    }
    
    // 수호신 카드 제거
    removeGuardianCard(guardianName) {
        const currentPlayer = this.getCurrentPlayer();
        currentPlayer.guardianCards = currentPlayer.guardianCards.filter(
            card => card.name !== guardianName
        );
        this.updateHandDisplay();
    }
    
    // 피해 처리
    takeDamage(amount) {
        const currentPlayer = this.getCurrentPlayer();
        
        // 수호신 카드 잃기
        for (let i = 0; i < amount && currentPlayer.guardianCards.length > 0; i++) {
            currentPlayer.guardianCards.pop();
        }
        
        this.updateHandDisplay();
        
        // 카드가 0개가 되면 자동으로 returnToStart가 호출됨
        // 그렇지 않으면 endBattle(false)에서 returnToStart가 호출됨
    }
    
    // 가장 가까운 이전 안전지대 찾기
    findPreviousSafeZone(currentPosition) {
        console.log('안전지대 찾기 시작 - 현재 위치:', currentPosition);
        console.log('전체 방 목록:', this.board.rooms);
        
        // 현재 위치보다 작은 번호의 안전지대 중 가장 큰 것 찾기
        const safeZones = this.board.rooms.filter(room => room.isSafeZone && room.id < currentPosition);
        console.log('찾은 안전지대들:', safeZones);
        
        if (safeZones.length === 0) {
            console.log('안전지대가 없어서 시작점(0)으로 이동');
            return 0; // 안전지대가 없으면 시작점으로
        }
        
        // 가장 가까운(번호가 큰) 안전지대 반환
        const nearestSafeZone = Math.max(...safeZones.map(room => room.id));
        console.log('가장 가까운 안전지대:', nearestSafeZone);
        return nearestSafeZone;
    }
    
    // 체크포인트로 돌아가기
    returnToStart(message) {
        console.log('returnToStart 호출됨:', message);
        const currentPlayer = this.getCurrentPlayer();
        showError(`${currentPlayer.name}: ${message}`);
        
        // 전투 모달이 열려있으면 닫기
        const battleModal = document.getElementById('battle-modal');
        if (battleModal) {
            battleModal.remove();
        }
        
        setTimeout(() => {
            try {
                // 가장 가까운 이전 안전지대 찾기
                const returnPoint = this.findPreviousSafeZone(currentPlayer.position);
                
                // 돌아갈 위치 메시지
                const returnRoom = this.board.rooms.find(r => r.id === returnPoint);
                console.log('돌아갈 방:', returnRoom);
                
                if (!returnRoom) {
                    console.error('돌아갈 방을 찾을 수 없음:', returnPoint);
                    showError('안전지대를 찾을 수 없습니다!');
                    return;
                }
                
                const returnMessage = returnPoint === 0 ? 
                    '시작 위치로 돌아갑니다!' : 
                    `${returnRoom.name}(으)로 돌아갑니다!`;
                
                showInfo(`${currentPlayer.name}: ${returnMessage}`);
                
                // 플레이어를 체크포인트로 이동
                this.movePlayerWithAnimation(returnPoint, () => {
                // 수호신 카드 5장 다시 배분
                currentPlayer.guardianCards = this.cardDeck.drawGuardianCard(5);
                this.updateUI();
                showInfo(`${currentPlayer.name}이(가) 새로운 수호신 카드 5장을 받았습니다!`);
                
                // 전투 상태 초기화
                this.currentBattle = null;
                this.selectedGuardian = null;
                this.state = GameState.PLAYING;
                
                // 플레이어 영역 스타일 원래대로
                const playerArea = document.getElementById('player-area');
                if (playerArea) {
                    playerArea.style.boxShadow = '';
                    playerArea.style.border = '3px solid #4a1f5f';
                    playerArea.style.zIndex = '10000';
                }
                
                // 턴 종료
                setTimeout(() => this.endTurn(), 1000);
            });
            } catch (error) {
                console.error('returnToStart 중 오류 발생:', error);
                showError('안전지대로 이동 중 오류가 발생했습니다.');
            }
        }, 2000);
    }
    
    // 전투 종료
    endBattle(victory) {
        this.currentBattle = null;
        this.selectedGuardian = null;
        this.state = GameState.PLAYING;
        
        document.getElementById('battle-btn').disabled = true;
        
        // 선택된 수호신 카드 해제
        document.querySelectorAll('.guardian-deck-card').forEach(card => {
            card.style.boxShadow = '';
            card.style.borderColor = '#4ecdc4';
        });
        
        if (victory) {
            this.endTurn();
        } else {
            // 패배시 이전 안전지대로 이동
            this.returnToStart('전투에서 패배했습니다! 이전 안전지대로 돌아갑니다.');
        }
        
        this.updateUI();
    }
    
    // 턴 종료
    endTurn() {
        // 이동 가능 표시 제거
        this.board.clearMovementMode();
        
        // 버튼 상태 초기화
        const drawBtn = document.getElementById('draw-movement');
        const battleBtn = document.getElementById('battle-btn');
        if (drawBtn) drawBtn.disabled = false;
        if (battleBtn) battleBtn.disabled = true;
        
        // 카드 표시 영역 초기화
        const cardDisplay = document.getElementById('movement-card-display');
        if (cardDisplay) cardDisplay.innerHTML = '';
        
        // 멀티플레이어에서 다음 플레이어로 전환
        if (this.gameMode !== 'single') {
            this.switchToNextPlayer();
            
            // UI 새로고침 (새로운 플레이어의 정보 표시)
            if (this.gameMode !== 'single') {
                const playerArea = document.getElementById('player-area');
                if (playerArea) {
                    playerArea.innerHTML = this.getMultiPlayerUI();
                    this.setupEventListeners();
                }
            }
        }
        
        // 다음 턴
        setTimeout(() => this.startTurn(), 1000);
    }
    
    // UI 업데이트
    updateUI() {
        if (this.gameMode === 'single') {
            this.updateSinglePlayerUI();
        } else {
            this.updateMultiPlayerUI();
        }
        
        this.updateHandDisplay();
    }
    
    // 싱글 플레이어 UI 업데이트
    updateSinglePlayerUI() {
        const player = this.players[0];
        const room = this.board.rooms.find(r => r.id === player.position);
        
        const posElement = document.getElementById('player-position');
        const cardElement = document.getElementById('card-count');
        const guardianElement = document.getElementById('selected-guardian');
        
        if (posElement) posElement.textContent = room ? room.name : '알 수 없음';
        if (cardElement) cardElement.textContent = player.guardianCards.length;
        if (guardianElement) guardianElement.textContent = this.selectedGuardian || '없음';
    }
    
    // 멀티플레이어 UI 업데이트
    updateMultiPlayerUI() {
        const currentPlayer = this.getCurrentPlayer();
        
        // 현재 턴 표시 업데이트
        const turnIndicator = document.querySelector('.turn-indicator');
        if (turnIndicator) {
            turnIndicator.innerHTML = `
                <span class="player-icon" style="color: ${currentPlayer.color}">${currentPlayer.icon}</span>
                <strong>${currentPlayer.name}</strong>의 차례
            `;
        }
        
        // 모든 플레이어 상태 업데이트
        this.players.forEach(player => {
            const room = this.board.rooms.find(r => r.id === player.position);
            const posElement = document.querySelector(`.player-pos[data-player="${player.id}"]`);
            const cardElement = document.querySelector(`.player-cards[data-player="${player.id}"]`);
            const panelElement = document.querySelector(`.player-panel[data-player="${player.id}"]`);
            
            if (posElement) posElement.textContent = room ? room.name : '시작';
            if (cardElement) cardElement.textContent = player.guardianCards.length;
            
            // 활성 플레이어 패널 표시
            if (panelElement) {
                panelElement.classList.toggle('active', player.id === currentPlayer.id);
            }
        });
        
        // 선택된 수호신 표시
        const guardianElement = document.getElementById('selected-guardian');
        if (guardianElement) {
            guardianElement.textContent = this.selectedGuardian || '없음';
        }
        
        // 손패 제목 업데이트
        const handTitle = document.querySelector('.hand-display h4');
        if (handTitle) {
            handTitle.textContent = `${currentPlayer.name}의 수호신 카드`;
        }
    }
    
    // 손패 표시 업데이트
    updateHandDisplay() {
        const handArea = document.getElementById('hand-cards');
        if (!handArea) return;
        
        handArea.innerHTML = '';
        
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;
        
        currentPlayer.guardianCards.forEach((card, index) => {
            const cardEl = createCardElement(card);
            cardEl.style.width = '100px';
            cardEl.style.height = '70px';
            cardEl.addEventListener('click', () => this.selectHandCard(index));
            handArea.appendChild(cardEl);
        });
    }
    
    // 손패 카드 선택
    selectHandCard(index) {
        // 기존 선택 제거
        document.querySelectorAll('#hand-cards .card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 새 선택
        const cards = document.querySelectorAll('#hand-cards .card');
        const currentPlayer = this.getCurrentPlayer();
        
        if (cards[index] && currentPlayer && currentPlayer.guardianCards[index]) {
            cards[index].classList.add('selected');
            // 선택한 카드 정보 저장
            const selectedCard = currentPlayer.guardianCards[index];
            this.selectedGuardian = selectedCard.name; // ID 대신 이름 직접 저장
            
            // UI 업데이트
            this.updateUI();
            
            // 전투 버튼 활성화
            const battleBtn = document.getElementById('battle-btn');
            if (battleBtn && this.state === GameState.BATTLE_PHASE) {
                battleBtn.disabled = false;
            }
            
            // 전투 모달의 버튼도 활성화
            const modalBattleBtn = document.getElementById('battle-fight-btn');
            if (modalBattleBtn) {
                modalBattleBtn.disabled = false;
            }
            
            console.log(`수호신 카드 선택됨: ${selectedCard.name}`);
        }
    }
    
    // 수호신 ID 가져오기
    getGuardianIdByName(name) {
        const nameMap = {
            '불': 'fire',
            '빛': 'light',
            '평화': 'peace',
            '정의': 'justice',
            '정화': 'purify'
        };
        return nameMap[name];
    }
    
    // 게임 오버
    gameOver(reason) {
        this.state = GameState.GAME_OVER;
        console.log(`게임 오버: ${reason}`);
        showError(`게임 오버! ${reason}`);
        
        setTimeout(() => {
            if (confirm('다시 시작하시겠습니까?')) {
                location.reload();
            }
        }, 2000);
    }
    
    // 승리 (멀티플레이어 지원)
    victory(winnerId = null) {
        this.state = GameState.VICTORY;
        
        let winnerPlayer;
        if (winnerId) {
            winnerPlayer = this.players.find(p => p.id === winnerId);
        } else {
            // 현재 플레이어가 승리
            winnerPlayer = this.getCurrentPlayer();
        }
        
        this.winner = winnerPlayer;
        
        if (this.gameMode === 'single') {
            console.log('승리! 요괴의 성을 탈출했습니다!');
            showSuccess('축하합니다! 요괴의 성을 무사히 탈출했습니다!');
        } else {
            console.log(`${winnerPlayer.name} 승리!`);
            showSuccess(`🎉 ${winnerPlayer.name}이(가) 먼저 탈출했습니다! 승리! 🎉`);
            
            // 승리 효과
            this.showVictoryEffect(winnerPlayer);
        }
        
        setTimeout(() => {
            if (confirm('다시 시작하시겠습니까?')) {
                location.reload();
            }
        }, 3000);
    }
    
    // 승리 효과 표시
    showVictoryEffect(winner) {
        const winnerPiece = document.querySelector(`.player-piece[data-player="${winner.id}"]`);
        if (winnerPiece) {
            winnerPiece.style.animation = 'victoryBounce 0.6s ease-in-out infinite';
            winnerPiece.style.transform = 'translate(-50%, -50%) scale(1.5)';
            winnerPiece.style.boxShadow = `0 0 20px ${winner.color}`;
        }
        
        // 승리 애니메이션 CSS 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes victoryBounce {
                0%, 100% { transform: translate(-50%, -50%) scale(1.5); }
                50% { transform: translate(-50%, -50%) scale(1.8); }
            }
        `;
        document.head.appendChild(style);
    }
}

// 전역 게임 인스턴스
window.game = new OriginalYokaiCastleGame();

// DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
    window.game.init();
});

// 테스트용: 전투 모달 수동으로 표시
window.testBattleModal = function() {
    console.log('=== 테스트: 전투 모달 수동 표시 ===');
    const game = window.game;
    if (!game) {
        console.error('게임 인스턴스가 없습니다!');
        return;
    }
    
    // 테스트용 요괴 데이터
    const testYokai = {
        id: 'y001',
        name: '화장실 귀신',
        type: 'yokai',
        weakness: ['빛', '물'],
        description: '어두운 화장실에 숨어있는 요괴',
        power: 3,
        icon: '🚽'
    };
    
    console.log('테스트 요괴:', testYokai);
    game.showBattleModal(testYokai);
    
    // 즉시 모달 상태 확인
    setTimeout(() => {
        const modal = document.getElementById('battle-modal');
        if (modal) {
            console.log('=== 모달 디버그 정보 ===');
            console.log('모달이 보이나요?', modal.offsetWidth > 0 && modal.offsetHeight > 0);
            console.log('모달 offset:', {
                width: modal.offsetWidth,
                height: modal.offsetHeight,
                top: modal.offsetTop,
                left: modal.offsetLeft
            });
            
            // 강제로 빨간 배경 추가하여 테스트
            modal.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            console.log('빨간 배경을 추가했습니다. 화면에 빨간색이 보이나요?');
        }
    }, 100);
    
    // 5초 후 모달 상태 확인
    setTimeout(() => {
        const modal = document.getElementById('battle-modal');
        if (modal) {
            const computedStyle = window.getComputedStyle(modal);
            console.log('=== 5초 후 모달 상태 ===');
            console.log('모달 존재:', modal);
            console.log('모달 클래스:', modal.className);
            console.log('모달 display:', computedStyle.display);
            console.log('모달 visibility:', computedStyle.visibility);
            console.log('모달 opacity:', computedStyle.opacity);
            console.log('모달 z-index:', computedStyle.zIndex);
            console.log('모달 position:', computedStyle.position);
            console.log('모달 width:', computedStyle.width);
            console.log('모달 height:', computedStyle.height);
            
            // 모달 내부 컨텐츠 확인
            const content = modal.querySelector('.battle-modal-content');
            if (content) {
                const contentStyle = window.getComputedStyle(content);
                console.log('=== 모달 컨텐츠 상태 ===');
                console.log('컨텐츠 display:', contentStyle.display);
                console.log('컨텐츠 visibility:', contentStyle.visibility);
                console.log('컨텐츠 opacity:', contentStyle.opacity);
                console.log('컨텐츠 transform:', contentStyle.transform);
            }
        } else {
            console.error('모달을 찾을 수 없습니다!');
        }
    }, 5000);
};

// 간단한 테스트 모달
window.testSimpleModal = function() {
    console.log('=== 간단한 테스트 모달 ===');
    
    // 기존 테스트 모달 제거
    const existing = document.getElementById('test-simple-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'test-simple-modal';
    modal.style.cssText = `
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 300px !important;
        height: 200px !important;
        background: red !important;
        z-index: 99999 !important;
        display: block !important;
        color: white !important;
        font-size: 24px !important;
        text-align: center !important;
        padding: 50px !important;
        border: 5px solid yellow !important;
    `;
    modal.textContent = '테스트 모달입니다!';
    
    // 여러 위치에 추가 시도
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.appendChild(modal);
        console.log('game-container에 추가');
    } else {
        document.body.appendChild(modal);
        console.log('body에 추가');
    }
    
    console.log('테스트 모달 추가 완료');
    console.log('모달:', document.getElementById('test-simple-modal'));
    
    // 3초 후 제거
    setTimeout(() => {
        modal.remove();
        console.log('테스트 모달 제거');
    }, 3000);
};

export default OriginalYokaiCastleGame;