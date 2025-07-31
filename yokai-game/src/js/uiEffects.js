// UI 효과 및 애니메이션 시스템

export class UIEffects {
    constructor() {
        this.notifications = [];
        this.tooltips = new Map();
        this.setupTooltipSystem();
    }
    
    // 알림 표시
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 아이콘 추가
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        if (icons[type]) {
            notification.innerHTML = `${icons[type]} ${message}`;
        }
        
        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => notification.classList.add('show'), 100);
        
        // 자동 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        this.notifications.push(notification);
        return notification;
    }
    
    // 로딩 스피너 표시
    showLoading(element, text = '로딩 중...') {
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-container';
        loadingEl.innerHTML = `
            <div class="loading-spinner"></div>
            <span class="loading-text">${text}</span>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .loading-container {
                display: flex;
                align-items: center;
                gap: 10px;
                justify-content: center;
                padding: 10px;
                color: #8a2b9f;
            }
            
            .loading-text {
                font-size: 14px;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        
        element.appendChild(loadingEl);
        return loadingEl;
    }
    
    // 로딩 제거
    hideLoading(element) {
        const loading = element.querySelector('.loading-container');
        if (loading) {
            loading.remove();
        }
    }
    
    // 툴팁 시스템 설정
    setupTooltipSystem() {
        document.addEventListener('mouseover', (e) => {
            const tooltipText = e.target.dataset.tooltip;
            if (tooltipText) {
                this.showTooltip(e.target, tooltipText);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.dataset.tooltip) {
                this.hideTooltip(e.target);
            }
        });
    }
    
    // 툴팁 표시
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        // 위치 계산
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = rect.left + (rect.width - tooltipRect.width) / 2 + 'px';
        tooltip.style.top = rect.top - tooltipRect.height - 10 + 'px';
        
        // 화면 경계 체크
        if (tooltip.offsetLeft < 0) {
            tooltip.style.left = '10px';
        }
        if (tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
            tooltip.style.left = (window.innerWidth - tooltip.offsetWidth - 10) + 'px';
        }
        
        setTimeout(() => tooltip.classList.add('show'), 100);
        
        this.tooltips.set(element, tooltip);
    }
    
    // 툴팁 숨기기
    hideTooltip(element) {
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.classList.remove('show');
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
            this.tooltips.delete(element);
        }
    }
    
    // 카드 뒤집기 애니메이션
    flipCard(cardElement, newContent) {
        return new Promise((resolve) => {
            cardElement.style.transform = 'rotateY(90deg)';
            
            setTimeout(() => {
                if (newContent) {
                    cardElement.innerHTML = newContent;
                }
                cardElement.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => resolve(), 300);
            }, 300);
        });
    }
    
    // 카드 흔들기 효과
    shakeElement(element, duration = 500) {
        element.style.animation = `shake ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.animation = '';
        }, duration);
    }
    
    // 펄스 효과
    pulseElement(element, color = '#8a2b9f', duration = 1000) {
        const originalBoxShadow = element.style.boxShadow;
        
        element.style.animation = `pulse-${color.replace('#', '')} ${duration}ms ease-in-out`;
        
        // 동적 키프레임 생성
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-${color.replace('#', '')} {
                0%, 100% { box-shadow: 0 0 5px ${color}40; }
                50% { box-shadow: 0 0 20px ${color}80, 0 0 30px ${color}60; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            element.style.animation = '';
            element.style.boxShadow = originalBoxShadow;
            document.head.removeChild(style);
        }, duration);
    }
    
    // 요소 부드럽게 나타내기
    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    }
    
    // 요소 부드럽게 사라지기
    fadeOut(element, duration = 500) {
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = '0';
        
        return new Promise((resolve) => {
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }
    
    // 타이핑 효과
    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;
        
        return new Promise((resolve) => {
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }
    
    // 파티클 효과
    createParticleEffect(x, y, count = 10, color = '#8a2b9f') {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: all 1s ease-out;
            `;
            
            document.body.appendChild(particle);
            
            // 랜덤 방향으로 이동
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 100;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;
            
            setTimeout(() => {
                particle.style.left = endX + 'px';
                particle.style.top = endY + 'px';
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0)';
            }, 10);
            
            // 제거
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    // 화면 흔들기 효과
    shakeScreen(intensity = 10, duration = 500) {
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;
        
        let startTime = Date.now();
        const originalTransform = gameContainer.style.transform;
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const offsetX = (Math.random() - 0.5) * intensity * (1 - progress);
                const offsetY = (Math.random() - 0.5) * intensity * (1 - progress);
                
                gameContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                requestAnimationFrame(shake);
            } else {
                gameContainer.style.transform = originalTransform;
            }
        };
        
        shake();
    }
    
    // 모든 효과 정리
    cleanup() {
        this.notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        this.tooltips.forEach(tooltip => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        this.notifications = [];
        this.tooltips.clear();
    }
}

// 전역 UI 효과 인스턴스
export const uiEffects = new UIEffects();

// 편의 함수들
export const showSuccess = (message) => uiEffects.showNotification(message, 'success');
export const showError = (message) => uiEffects.showNotification(message, 'error');
export const showInfo = (message) => uiEffects.showNotification(message, 'info');
export const showWarning = (message) => uiEffects.showNotification(message, 'warning');

// CSS 키프레임 추가
const effectsStyle = document.createElement('style');
effectsStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(effectsStyle);