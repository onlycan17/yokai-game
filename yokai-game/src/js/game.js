// 메인 게임 로직

import { initializeBoard, rollDice, movePlayer } from './board.js';
import { initializeCardDeck, drawCard, handManager } from './cards.js';

// 게임 상태 관리
const GameState = {
    SETUP: 'setup',
    PLAYING: 'playing',
    BATTLE: 'battle',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

class Game {
    constructor() {
        this.state = GameState.SETUP;
        this.currentPlayer = 1;
        this.players = [
            {
                id: 1,
                name: '플레이어 1',
                health: 20,
                position: { row: 9, col: 0 },
                items: [],
                weapons: [],
                keys: { red: false, blue: false, yellow: false }
            }
        ];
        this.turnCount = 0;
    }
    
    // 게임 초기화
    init() {
        console.log('게임 초기화 중...');
        
        // 보드 초기화
        initializeBoard();
        
        // 카드 덱 초기화
        initializeCardDeck();
        
        // UI 초기화
        this.setupUI();
        
        // 게임 시작
        this.state = GameState.PLAYING;
        this.startTurn();
    }
    
    // UI 설정
    setupUI() {
        // 플레이어 정보 영역 생성
        const playerArea = document.getElementById('player-area');
        playerArea.innerHTML = `
            <div class="player-info">
                <h3>${this.players[0].name}</h3>
                <div class="player-stats">
                    <div class="stat-item">
                        <span class="stat-label">체력:</span>
                        <span id="player-health">${this.players[0].health}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">턴:</span>
                        <span id="turn-count">${this.turnCount}</span>
                    </div>
                </div>
                <div class="key-inventory">
                    <span class="key-item ${this.players[0].keys.red ? 'active' : ''}">🔴</span>
                    <span class="key-item ${this.players[0].keys.blue ? 'active' : ''}">🔵</span>
                    <span class="key-item ${this.players[0].keys.yellow ? 'active' : ''}">🟡</span>
                </div>
            </div>
            <button id="roll-dice-btn" class="game-button">주사위 굴리기</button>
            <button id="draw-card-btn" class="game-button">카드 뽑기</button>
            <div class="hand-area"></div>
        `;
        
        // 버튼 이벤트 연결
        document.getElementById('roll-dice-btn').addEventListener('click', () => {
            this.rollDice();
        });
        
        document.getElementById('draw-card-btn').addEventListener('click', () => {
            this.drawCard();
        });
        
        // 스타일 추가
        this.addPlayerAreaStyles();
    }
    
    // 플레이어 영역 스타일
    addPlayerAreaStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .player-area {
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(26, 15, 42, 0.9);
                border: 2px solid #4a1f5f;
                border-radius: 10px;
                padding: 20px;
                min-width: 200px;
                box-shadow: 0 0 20px rgba(138, 43, 226, 0.3);
            }
            
            .player-info h3 {
                margin: 0 0 15px 0;
                color: #da70d6;
                text-align: center;
            }
            
            .player-stats {
                margin-bottom: 15px;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                color: #e0e0e0;
            }
            
            .key-inventory {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .key-item {
                font-size: 24px;
                opacity: 0.3;
                transition: opacity 0.3s;
            }
            
            .key-item.active {
                opacity: 1;
            }
            
            .game-button {
                width: 100%;
                margin-bottom: 10px;
            }
            
            .hand-area {
                margin-top: 20px;
                display: flex;
                flex-direction: column;
                gap: -40px;
            }
            
            .hand-area .card {
                width: 100px;
                height: 150px;
                transition: all 0.3s ease;
            }
            
            .hand-area .card:hover {
                transform: translateX(20px) scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
    
    // 턴 시작
    startTurn() {
        this.turnCount++;
        this.updateUI();
        console.log(`턴 ${this.turnCount} 시작!`);
    }
    
    // 주사위 굴리기
    rollDice() {
        const btn = document.getElementById('roll-dice-btn');
        btn.disabled = true;
        
        rollDice((result) => {
            console.log(`주사위 결과: ${result}`);
            this.handleDiceResult(result);
            btn.disabled = false;
        });
    }
    
    // 주사위 결과 처리
    handleDiceResult(moves) {
        // 이동 가능한 칸 수 표시
        console.log(`${moves}칸 이동 가능`);
        
        // 실제 이동 로직은 보드 클릭으로 처리
        this.remainingMoves = moves;
    }
    
    // 카드 뽑기
    drawCard() {
        const card = drawCard();
        if (card && handManager.addCard(card)) {
            console.log(`${card.name} 카드를 뽑았습니다!`);
            this.showCardDrawAnimation(card);
        } else {
            console.log('손패가 가득 찼습니다!');
        }
    }
    
    // 카드 뽑기 애니메이션
    showCardDrawAnimation(card) {
        const notification = document.createElement('div');
        notification.className = 'card-notification';
        notification.textContent = `${card.name} 획득!`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(138, 43, 226, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            z-index: 2000;
            animation: fadeInOut 2s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
    
    // 전투 시작
    startBattle(yokai) {
        this.state = GameState.BATTLE;
        console.log(`${yokai.name}과(와) 전투 시작!`);
        
        // 전투 UI 표시
        this.showBattleUI(yokai);
    }
    
    // 전투 UI
    showBattleUI(yokai) {
        const battleUI = document.createElement('div');
        battleUI.id = 'battle-ui';
        battleUI.className = 'battle-ui';
        battleUI.innerHTML = `
            <div class="battle-content">
                <h2>전투!</h2>
                <div class="battle-participants">
                    <div class="player-side">
                        <h3>${this.players[0].name}</h3>
                        <div class="health-bar">
                            <div class="health-fill" style="width: ${(this.players[0].health / 20) * 100}%"></div>
                        </div>
                        <p>체력: ${this.players[0].health}/20</p>
                    </div>
                    <div class="vs">VS</div>
                    <div class="yokai-side">
                        <h3>${yokai.name}</h3>
                        <div class="yokai-icon">${yokai.icon || '👹'}</div>
                        <p>공격력: ${yokai.power} | 방어력: ${yokai.defense}</p>
                    </div>
                </div>
                <div class="battle-actions">
                    <button class="game-button" onclick="game.battleAction('attack')">공격</button>
                    <button class="game-button" onclick="game.battleAction('defend')">방어</button>
                    <button class="game-button" onclick="game.battleAction('item')">아이템 사용</button>
                    <button class="game-button" onclick="game.battleAction('flee')">도망</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(battleUI);
        
        // 전투 UI 스타일
        this.addBattleStyles();
    }
    
    // 전투 스타일
    addBattleStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .battle-ui {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1500;
            }
            
            .battle-content {
                background: linear-gradient(135deg, #2a0f3f 0%, #0a0515 100%);
                border: 3px solid #8a2b9f;
                border-radius: 20px;
                padding: 40px;
                min-width: 600px;
                box-shadow: 0 0 50px rgba(138, 43, 226, 0.5);
            }
            
            .battle-content h2 {
                text-align: center;
                color: #ff6b6b;
                font-size: 36px;
                margin-bottom: 30px;
                text-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
            }
            
            .battle-participants {
                display: flex;
                justify-content: space-around;
                align-items: center;
                margin-bottom: 30px;
            }
            
            .vs {
                font-size: 24px;
                color: #ffd700;
                font-weight: bold;
            }
            
            .health-bar {
                width: 150px;
                height: 20px;
                background: rgba(0, 0, 0, 0.5);
                border: 2px solid #4a8f4a;
                border-radius: 10px;
                overflow: hidden;
                margin: 10px 0;
            }
            
            .health-fill {
                height: 100%;
                background: linear-gradient(90deg, #4a8f4a, #6fcf6f);
                transition: width 0.5s ease;
            }
            
            .yokai-icon {
                font-size: 60px;
                margin: 10px 0;
            }
            
            .battle-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }
            
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 전투 액션
    battleAction(action) {
        console.log(`전투 액션: ${action}`);
        
        switch(action) {
            case 'attack':
                // 공격 로직
                break;
            case 'defend':
                // 방어 로직
                break;
            case 'item':
                // 아이템 사용 로직
                break;
            case 'flee':
                // 도망 로직
                this.endBattle();
                break;
        }
    }
    
    // 전투 종료
    endBattle() {
        const battleUI = document.getElementById('battle-ui');
        if (battleUI) {
            battleUI.remove();
        }
        this.state = GameState.PLAYING;
    }
    
    // UI 업데이트
    updateUI() {
        document.getElementById('player-health').textContent = this.players[0].health;
        document.getElementById('turn-count').textContent = this.turnCount;
        
        // 열쇠 상태 업데이트
        const keys = document.querySelectorAll('.key-item');
        keys[0].classList.toggle('active', this.players[0].keys.red);
        keys[1].classList.toggle('active', this.players[0].keys.blue);
        keys[2].classList.toggle('active', this.players[0].keys.yellow);
    }
    
    // 게임 오버
    gameOver(reason) {
        this.state = GameState.GAME_OVER;
        console.log(`게임 오버: ${reason}`);
        
        // 게임 오버 화면 표시
        this.showGameOverScreen(reason);
    }
    
    // 게임 오버 화면
    showGameOverScreen(reason) {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h1>게임 오버</h1>
                <p>${reason}</p>
                <button class="game-button" onclick="location.reload()">다시 시작</button>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
    }
    
    // 승리
    victory() {
        this.state = GameState.VICTORY;
        console.log('승리!');
        
        // 승리 화면 표시
        this.showVictoryScreen();
    }
    
    // 승리 화면
    showVictoryScreen() {
        const victoryScreen = document.createElement('div');
        victoryScreen.className = 'victory-screen';
        victoryScreen.innerHTML = `
            <div class="victory-content">
                <h1>축하합니다!</h1>
                <p>요괴의 성을 탈출하는데 성공했습니다!</p>
                <p>턴 수: ${this.turnCount}</p>
                <button class="game-button" onclick="location.reload()">다시 시작</button>
            </div>
        `;
        
        document.body.appendChild(victoryScreen);
    }
}

// 게임 인스턴스 생성 및 시작
const game = new Game();
window.game = game; // 전역 접근을 위해

// DOM 로드 후 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});