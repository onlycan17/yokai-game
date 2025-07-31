// 주사위 시스템

import { GameImageGenerator } from './imageGenerator.js';

export class DiceSystem {
    constructor() {
        this.isRolling = false;
        this.currentResult = null;
    }
    
    // 주사위 굴리기 애니메이션
    async rollDice(callback) {
        if (this.isRolling) return;
        
        this.isRolling = true;
        
        // 주사위 컨테이너 생성
        const diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        diceContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2000;
            display: flex;
            flex-direction: column;
            align-items: center;
        `;
        
        // 주사위 요소 생성
        const diceElement = document.createElement('div');
        diceElement.className = 'dice-element';
        diceElement.style.cssText = `
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
            transition: transform 0.1s ease;
        `;
        
        // 결과 텍스트
        const resultText = document.createElement('div');
        resultText.className = 'dice-result-text';
        resultText.style.cssText = `
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        diceContainer.appendChild(diceElement);
        diceContainer.appendChild(resultText);
        document.body.appendChild(diceContainer);
        
        // 굴리는 애니메이션
        let rollCount = 0;
        const maxRolls = 15;
        
        const rollAnimation = setInterval(() => {
            const randomNumber = Math.floor(Math.random() * 6) + 1;
            const diceImage = GameImageGenerator.createDice(randomNumber);
            
            diceElement.style.backgroundImage = `url(${diceImage})`;
            diceElement.style.backgroundSize = 'cover';
            diceElement.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.8 + Math.random() * 0.4})`;
            
            rollCount++;
            
            if (rollCount >= maxRolls) {
                clearInterval(rollAnimation);
                this.finalizeDiceRoll(diceElement, resultText, diceContainer, callback);
            }
        }, 100);
    }
    
    // 주사위 결과 확정
    finalizeDiceRoll(diceElement, resultText, container, callback) {
        // 최종 결과 생성
        const finalResult = Math.floor(Math.random() * 6) + 1;
        this.currentResult = finalResult;
        
        // 최종 주사위 이미지 설정
        const finalDiceImage = GameImageGenerator.createDice(finalResult);
        diceElement.style.backgroundImage = `url(${finalDiceImage})`;
        diceElement.style.transform = 'rotate(0deg) scale(1)';
        
        // 결과 텍스트 표시
        resultText.textContent = `${finalResult}`;
        resultText.style.opacity = '1';
        
        // 효과음 (선택사항)
        this.playDiceSound();
        
        // 2초 후 제거하고 콜백 실행
        setTimeout(() => {
            container.remove();
            this.isRolling = false;
            if (callback) callback(finalResult);
        }, 2000);
    }
    
    // 주사위 효과음 (Web Audio API 사용)
    playDiceSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 주사위 굴리는 소리 생성
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('오디오 컨텍스트를 사용할 수 없습니다:', e);
        }
    }
    
    // 간단한 주사위 굴리기 (애니메이션 없음)
    rollSimple() {
        return Math.floor(Math.random() * 6) + 1;
    }
    
    // 여러 주사위 굴리기
    rollMultiple(count = 1) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.rollSimple());
        }
        return results;
    }
}

// 전역 주사위 시스템 인스턴스
export const diceSystem = new DiceSystem();

// 주사위 UI 컴포넌트
export class DiceUI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.setupUI();
    }
    
    setupUI() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="dice-ui">
                <h4>주사위</h4>
                <div class="dice-display">
                    <div id="dice-image" class="dice-image"></div>
                    <div id="dice-result" class="dice-result">-</div>
                </div>
                <button id="roll-dice-btn" class="dice-button">주사위 굴리기</button>
            </div>
        `;
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .dice-ui {
                background: rgba(26, 15, 42, 0.9);
                border: 2px solid #4a1f5f;
                border-radius: 10px;
                padding: 15px;
                text-align: center;
                margin-bottom: 10px;
            }
            
            .dice-ui h4 {
                color: #da70d6;
                margin: 0 0 10px 0;
            }
            
            .dice-display {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .dice-image {
                width: 60px;
                height: 60px;
                background-size: cover;
                background-position: center;
                margin-bottom: 10px;
                border-radius: 8px;
                border: 2px solid rgba(255, 255, 255, 0.2);
            }
            
            .dice-result {
                font-size: 18px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .dice-button {
                background: linear-gradient(135deg, #4a1f5f 0%, #2a0f3f 100%);
                border: 2px solid #6a2f8f;
                color: #e0e0e0;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .dice-button:hover {
                background: linear-gradient(135deg, #5a2f6f 0%, #3a1f4f 100%);
                box-shadow: 0 0 10px rgba(138, 43, 226, 0.6);
            }
            
            .dice-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
        
        // 이벤트 리스너
        const rollButton = document.getElementById('roll-dice-btn');
        rollButton.addEventListener('click', () => this.rollDice());
        
        // 초기 주사위 이미지 설정
        this.updateDiceImage(1);
    }
    
    rollDice() {
        const rollButton = document.getElementById('roll-dice-btn');
        rollButton.disabled = true;
        
        diceSystem.rollDice((result) => {
            this.updateDiceImage(result);
            this.updateResult(result);
            rollButton.disabled = false;
        });
    }
    
    updateDiceImage(number) {
        const diceImage = document.getElementById('dice-image');
        if (diceImage) {
            const image = GameImageGenerator.createDice(number);
            diceImage.style.backgroundImage = `url(${image})`;
        }
    }
    
    updateResult(result) {
        const resultElement = document.getElementById('dice-result');
        if (resultElement) {
            resultElement.textContent = result;
        }
    }
}