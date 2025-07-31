// 🚀 애니메이션 성능 최적화 관리자

class AnimationOptimizer {
    constructor() {
        this.isPerformanceMode = true; // 기본적으로 성능 모드 활성화
        this.animationQueue = [];
        this.rafId = null;
        this.frameTime = 16.67; // 60fps 기준
        this.lastFrameTime = 0;
        
        // 성능 모니터링
        this.performanceData = {
            frameDrops: 0,
            avgFrameTime: 16.67,
            memoryUsage: 0
        };
        
        this.init();
    }
    
    init() {
        // 성능 모드 기본 활성화
        this.enablePerformanceMode();
        
        // 애니메이션 루프 시작
        this.startAnimationLoop();
        
        // 성능 모니터링 시작
        this.startPerformanceMonitoring();
        
        console.log('🚀 AnimationOptimizer 초기화 완료 (성능 모드 활성화)');
    }
    
    // 성능 필요성 감지
    detectPerformanceNeed() {
        // 디바이스 성능 체크
        const deviceMemory = navigator.deviceMemory || 4;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        
        // 저사양 디바이스 감지
        if (deviceMemory <= 2 || hardwareConcurrency <= 2) {
            this.enablePerformanceMode();
        }
        
        // 배터리 상태 확인 (모바일)
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (!battery.charging && battery.level < 0.2) {
                    this.enablePerformanceMode();
                }
            });
        }
    }
    
    // 성능 모드 활성화
    enablePerformanceMode() {
        this.isPerformanceMode = true;
        document.body.classList.add('performance-mode');
        console.log('⚡ 성능 모드 활성화됨');
        
        // 애니메이션 축소
        this.reduceAnimations();
    }
    
    // 성능 모드 비활성화
    disablePerformanceMode() {
        this.isPerformanceMode = false;
        document.body.classList.remove('performance-mode');
        console.log('🎨 일반 모드로 전환됨');
    }
    
    // 애니메이션 축소 - 모든 애니메이션 제거, 말 움직임만 유지
    reduceAnimations() {
        const style = document.createElement('style');
        style.id = 'performance-reduction';
        style.textContent = `
            .performance-mode * {
                animation: none !important;
                transition: none !important;
            }
            /* 말 움직임 애니메이션만 유지 */
            .performance-mode .player-piece {
                transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            }
            .performance-mode .player-piece.focused {
                animation: playerFocusPulse 0.5s ease-in-out 1 !important;
            }
            .performance-mode .board-room {
                animation: none !important;
            }
            .performance-mode .spiral-connection {
                animation: none !important;
                opacity: 0.6 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 최적화된 애니메이션 루프
    startAnimationLoop() {
        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastFrameTime;
            
            // 프레임 드롭 감지
            if (deltaTime > this.frameTime * 1.5) {
                this.performanceData.frameDrops++;
                
                // 연속 프레임 드롭 시 성능 모드 활성화
                if (this.performanceData.frameDrops > 10 && !this.isPerformanceMode) {
                    this.enablePerformanceMode();
                }
            }
            
            // 애니메이션 큐 처리
            this.processAnimationQueue();
            
            this.lastFrameTime = currentTime;
            this.rafId = requestAnimationFrame(animate);
        };
        
        this.rafId = requestAnimationFrame(animate);
    }
    
    // 애니메이션 큐 처리
    processAnimationQueue() {
        if (this.animationQueue.length === 0) return;
        
        // 성능 모드에서는 애니메이션 수 제한
        const maxAnimations = this.isPerformanceMode ? 3 : 10;
        const animationsToProcess = this.animationQueue.splice(0, maxAnimations);
        
        animationsToProcess.forEach(animation => {
            this.executeAnimation(animation);
        });
    }
    
    // 애니메이션 실행
    executeAnimation(animation) {
        const { element, properties, duration, easing } = animation;
        
        if (!element || !element.isConnected) return;
        
        // GPU 가속 적용
        if (properties.transform) {
            element.style.willChange = 'transform';
            element.style.transform = properties.transform;
        }
        
        if (properties.opacity !== undefined) {
            element.style.willChange += ', opacity';
            element.style.opacity = properties.opacity;
        }
        
        // 애니메이션 완료 후 will-change 제거
        setTimeout(() => {
            if (element.isConnected) {
                element.style.willChange = 'auto';
            }
        }, duration || 300);
    }
    
    // 성능 모니터링
    startPerformanceMonitoring() {
        setInterval(() => {
            // 메모리 사용량 체크
            if (performance.memory) {
                this.performanceData.memoryUsage = performance.memory.usedJSHeapSize;
                
                // 메모리 사용량이 높으면 성능 모드 활성화
                const memoryMB = this.performanceData.memoryUsage / 1024 / 1024;
                if (memoryMB > 100 && !this.isPerformanceMode) {
                    console.warn('⚠️ 높은 메모리 사용량 감지:', memoryMB.toFixed(2) + 'MB');
                    this.enablePerformanceMode();
                }
            }
            
            // 프레임 드롭 리셋
            if (this.performanceData.frameDrops > 0) {
                this.performanceData.frameDrops *= 0.9; // 점진적 감소
            }
        }, 5000);
    }
    
    // 애니메이션 큐에 추가
    queueAnimation(element, properties, duration = 300, easing = 'ease') {
        this.animationQueue.push({
            element,
            properties,
            duration,
            easing,
            timestamp: performance.now()
        });
    }
    
    // 플레이어 이동 애니메이션 최적화 - 핵심 기능만 유지
    animatePlayerMove(playerElement, targetPosition, callback) {
        if (!playerElement) return;
        
        const targetElement = document.getElementById(`room-${targetPosition}`);
        if (!targetElement) return;
        
        // 성능 모드에서는 즉시 이동, 일반 모드에서는 짧은 애니메이션
        if (this.isPerformanceMode) {
            // 즉시 이동
            targetElement.appendChild(playerElement);
            if (callback) callback();
        } else {
            // 부드러운 이동 (성능 최적화된 짧은 애니메이션)
            const startPos = playerElement.getBoundingClientRect();
            const targetPos = targetElement.getBoundingClientRect();
            const deltaX = targetPos.left - startPos.left;
            const deltaY = targetPos.top - startPos.top;
            
            playerElement.style.willChange = 'transform';
            playerElement.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            requestAnimationFrame(() => {
                playerElement.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
                
                setTimeout(() => {
                    playerElement.style.willChange = 'auto';
                    playerElement.style.transition = '';
                    playerElement.style.transform = '';
                    targetElement.appendChild(playerElement);
                    
                    if (callback) callback();
                }, 400);
            });
        }
    }
    
    // 카메라 포커스 최적화
    optimizedFocusOnPlayer(roomId, playerId = 1) {
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        const roomRect = room.getBoundingClientRect();
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        const roomCenterX = roomRect.left + roomRect.width / 2;
        const roomCenterY = roomRect.top + roomRect.height / 2;
        
        const scrollX = roomCenterX - viewportCenterX;
        const scrollY = roomCenterY - viewportCenterY;
        
        // 성능 모드에서는 즉시 스크롤
        if (this.isPerformanceMode) {
            window.scrollTo({
                left: window.scrollX + scrollX,
                top: window.scrollY + scrollY,
                behavior: 'auto'
            });
        } else {
            // 일반 모드에서는 부드러운 스크롤
            window.scrollTo({
                left: window.scrollX + scrollX,
                top: window.scrollY + scrollY,
                behavior: 'smooth'
            });
        }
        
        // 플레이어 강조 효과
        this.highlightPlayerOptimized(roomId, playerId);
    }
    
    // 최적화된 플레이어 강조
    highlightPlayerOptimized(roomId, playerId) {
        // 기존 강조 제거
        document.querySelectorAll('.player-piece.focused').forEach(piece => {
            piece.classList.remove('focused');
        });
        
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        const playerPiece = room.querySelector(`.player-piece[data-player="${playerId}"]`);
        if (!playerPiece) return;
        
        // GPU 가속 강조 효과
        playerPiece.style.willChange = 'transform, filter';
        playerPiece.classList.add('focused');
        
        // 3초 후 정리
        setTimeout(() => {
            if (playerPiece.isConnected) {
                playerPiece.classList.remove('focused');
                playerPiece.style.willChange = 'auto';
            }
        }, 3000);
    }
    
    // 성능 데이터 반환
    getPerformanceData() {
        return {
            ...this.performanceData,
            isPerformanceMode: this.isPerformanceMode,
            queueLength: this.animationQueue.length
        };
    }
    
    // 정리
    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        
        // 성능 모드 스타일 제거
        const performanceStyle = document.getElementById('performance-reduction');
        if (performanceStyle) {
            performanceStyle.remove();
        }
        
        document.body.classList.remove('performance-mode');
    }
}

// 전역 애니메이션 최적화 인스턴스
window.animationOptimizer = new AnimationOptimizer();

export default AnimationOptimizer;