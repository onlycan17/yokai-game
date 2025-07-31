// 🎬 애니메이션 처리 전용 Web Worker
// 복잡한 애니메이션 계산과 타이밍을 메인 스레드와 독립적으로 처리

class AnimationProcessor {
    constructor() {
        this.animations = new Map();
        this.timelines = new Map();
        this.isRunning = false;
        this.frameRate = 60;
        this.frameTime = 1000 / this.frameRate;
        this.lastFrameTime = 0;
        
        // 애니메이션 큐
        this.animationQueue = [];
        this.completedAnimations = [];
        
        // 성능 모니터링
        this.performanceData = {
            framesProcessed: 0,
            averageProcessingTime: 0,
            droppedFrames: 0
        };
    }

    // 애니메이션 시스템 시작
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.processAnimations();
        
        self.postMessage({
            type: 'ANIMATION_SYSTEM_STARTED',
            data: { timestamp: Date.now() }
        });
    }

    // 애니메이션 시스템 중지
    stop() {
        this.isRunning = false;
        
        self.postMessage({
            type: 'ANIMATION_SYSTEM_STOPPED',
            data: { timestamp: Date.now() }
        });
    }

    // 메인 애니메이션 루프
    processAnimations() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // 프레임 레이트 제어
        if (deltaTime >= this.frameTime) {
            const startProcessing = performance.now();
            
            this.updateAnimations(currentTime, deltaTime);
            this.processAnimationQueue();
            
            const processingTime = performance.now() - startProcessing;
            this.updatePerformanceMetrics(processingTime, deltaTime);
            
            this.lastFrameTime = currentTime;
        }
        
        // 다음 프레임 스케줄링
        setTimeout(() => this.processAnimations(), 0);
    }

    // 개별 애니메이션 업데이트
    updateAnimations(currentTime, deltaTime) {
        const animationsToRemove = [];
        
        for (const [id, animation] of this.animations) {
            const updated = this.updateSingleAnimation(animation, currentTime, deltaTime);
            
            if (updated.completed) {
                animationsToRemove.push(id);
                this.completedAnimations.push({
                    id,
                    result: updated.finalState,
                    timestamp: currentTime
                });
            } else {
                // 진행 중인 애니메이션 상태를 메인 스레드로 전송
                self.postMessage({
                    type: 'ANIMATION_UPDATE',
                    data: {
                        id,
                        state: updated.currentState,
                        progress: updated.progress
                    }
                });
            }
        }
        
        // 완료된 애니메이션 제거
        animationsToRemove.forEach(id => this.animations.delete(id));
        
        // 완료된 애니메이션 배치 전송
        if (this.completedAnimations.length > 0) {
            self.postMessage({
                type: 'ANIMATIONS_COMPLETED',
                data: this.completedAnimations.splice(0)
            });
        }
    }

    // 단일 애니메이션 업데이트
    updateSingleAnimation(animation, currentTime, deltaTime) {
        const { id, type, startTime, duration, startState, endState, easing } = animation;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        let currentState;
        
        switch (type) {
            case 'MOVE':
                currentState = this.calculateMoveAnimation(startState, endState, progress, easing);
                break;
                
            case 'FADE':
                currentState = this.calculateFadeAnimation(startState, endState, progress, easing);
                break;
                
            case 'SCALE':
                currentState = this.calculateScaleAnimation(startState, endState, progress, easing);
                break;
                
            case 'ROTATE':
                currentState = this.calculateRotateAnimation(startState, endState, progress, easing);
                break;
                
            case 'COMPLEX':
                currentState = this.calculateComplexAnimation(animation, progress, easing);
                break;
                
            default:
                currentState = this.interpolateValues(startState, endState, progress, easing);
        }
        
        return {
            currentState,
            progress,
            completed: progress >= 1,
            finalState: progress >= 1 ? endState : currentState
        };
    }

    // 이동 애니메이션 계산
    calculateMoveAnimation(startPos, endPos, progress, easing) {
        const easedProgress = this.applyEasing(progress, easing);
        
        return {
            x: this.interpolate(startPos.x, endPos.x, easedProgress),
            y: this.interpolate(startPos.y, endPos.y, easedProgress),
            z: startPos.z !== undefined ? this.interpolate(startPos.z || 0, endPos.z || 0, easedProgress) : undefined
        };
    }

    // 페이드 애니메이션 계산
    calculateFadeAnimation(startOpacity, endOpacity, progress, easing) {
        const easedProgress = this.applyEasing(progress, easing);
        
        return {
            opacity: this.interpolate(startOpacity.opacity, endOpacity.opacity, easedProgress)
        };
    }

    // 스케일 애니메이션 계산
    calculateScaleAnimation(startScale, endScale, progress, easing) {
        const easedProgress = this.applyEasing(progress, easing);
        
        return {
            scaleX: this.interpolate(startScale.scaleX, endScale.scaleX, easedProgress),
            scaleY: this.interpolate(startScale.scaleY, endScale.scaleY, easedProgress),
            scaleZ: startScale.scaleZ !== undefined ? 
                this.interpolate(startScale.scaleZ || 1, endScale.scaleZ || 1, easedProgress) : undefined
        };
    }

    // 회전 애니메이션 계산
    calculateRotateAnimation(startRotation, endRotation, progress, easing) {
        const easedProgress = this.applyEasing(progress, easing);
        
        return {
            rotation: this.interpolateAngle(startRotation.rotation, endRotation.rotation, easedProgress)
        };
    }

    // 복합 애니메이션 계산
    calculateComplexAnimation(animation, progress, easing) {
        const { keyframes } = animation;
        const easedProgress = this.applyEasing(progress, easing);
        
        // 키프레임 간 보간
        const segmentCount = keyframes.length - 1;
        const segmentProgress = easedProgress * segmentCount;
        const currentSegment = Math.floor(segmentProgress);
        const segmentLocalProgress = segmentProgress - currentSegment;
        
        if (currentSegment >= segmentCount) {
            return keyframes[keyframes.length - 1];
        }
        
        const startKeyframe = keyframes[currentSegment];
        const endKeyframe = keyframes[currentSegment + 1];
        
        return this.interpolateKeyframes(startKeyframe, endKeyframe, segmentLocalProgress);
    }

    // 키프레임 간 보간
    interpolateKeyframes(start, end, progress) {
        const result = {};
        
        for (const key in start) {
            if (typeof start[key] === 'number' && typeof end[key] === 'number') {
                result[key] = this.interpolate(start[key], end[key], progress);
            } else if (typeof start[key] === 'object' && typeof end[key] === 'object') {
                result[key] = this.interpolateValues(start[key], end[key], progress, 'linear');
            } else {
                result[key] = progress < 0.5 ? start[key] : end[key];
            }
        }
        
        return result;
    }

    // 이징 함수 적용
    applyEasing(progress, easingType) {
        switch (easingType) {
            case 'linear':
                return progress;
                
            case 'easeInQuad':
                return progress * progress;
                
            case 'easeOutQuad':
                return progress * (2 - progress);
                
            case 'easeInOutQuad':
                return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
                
            case 'easeInCubic':
                return progress * progress * progress;
                
            case 'easeOutCubic':
                return (--progress) * progress * progress + 1;
                
            case 'easeInOutCubic':
                return progress < 0.5 ? 4 * progress * progress * progress : 
                       (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
                
            case 'easeInSine':
                return 1 - Math.cos(progress * Math.PI / 2);
                
            case 'easeOutSine':
                return Math.sin(progress * Math.PI / 2);
                
            case 'easeInOutSine':
                return -(Math.cos(Math.PI * progress) - 1) / 2;
                
            case 'bounce':
                if (progress < 1 / 2.75) {
                    return 7.5625 * progress * progress;
                } else if (progress < 2 / 2.75) {
                    return 7.5625 * (progress -= 1.5 / 2.75) * progress + 0.75;
                } else if (progress < 2.5 / 2.75) {
                    return 7.5625 * (progress -= 2.25 / 2.75) * progress + 0.9375;
                } else {
                    return 7.5625 * (progress -= 2.625 / 2.75) * progress + 0.984375;
                }
                
            default:
                return progress;
        }
    }

    // 선형 보간
    interpolate(start, end, progress) {
        return start + (end - start) * progress;
    }

    // 각도 보간 (최단 경로)
    interpolateAngle(startAngle, endAngle, progress) {
        const diff = endAngle - startAngle;
        const shortestAngle = ((diff % 360) + 540) % 360 - 180;
        return startAngle + shortestAngle * progress;
    }

    // 값 보간 (객체용)
    interpolateValues(start, end, progress, easing) {
        const easedProgress = this.applyEasing(progress, easing);
        const result = {};
        
        for (const key in start) {
            if (typeof start[key] === 'number' && typeof end[key] === 'number') {
                result[key] = this.interpolate(start[key], end[key], easedProgress);
            } else {
                result[key] = easedProgress < 0.5 ? start[key] : end[key];
            }
        }
        
        return result;
    }

    // 애니메이션 추가
    addAnimation(animationData) {
        const { id, type, duration = 1000, easing = 'easeOutQuad', startState, endState } = animationData;
        
        const animation = {
            id,
            type,
            startTime: performance.now(),
            duration,
            startState,
            endState,
            easing,
            ...animationData
        };
        
        this.animations.set(id, animation);
        
        return {
            type: 'ANIMATION_ADDED',
            data: { id, startTime: animation.startTime }
        };
    }

    // 애니메이션 제거
    removeAnimation(id) {
        const removed = this.animations.delete(id);
        
        return {
            type: 'ANIMATION_REMOVED',
            data: { id, removed }
        };
    }

    // 애니메이션 일시정지
    pauseAnimation(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.paused = true;
            animation.pauseTime = performance.now();
        }
        
        return {
            type: 'ANIMATION_PAUSED',
            data: { id, paused: !!animation }
        };
    }

    // 애니메이션 재개
    resumeAnimation(id) {
        const animation = this.animations.get(id);
        if (animation && animation.paused) {
            const pauseDuration = performance.now() - animation.pauseTime;
            animation.startTime += pauseDuration;
            animation.paused = false;
            delete animation.pauseTime;
        }
        
        return {
            type: 'ANIMATION_RESUMED',
            data: { id, resumed: !!animation }
        };
    }

    // 애니메이션 큐 처리
    processAnimationQueue() {
        while (this.animationQueue.length > 0) {
            const queuedAnimation = this.animationQueue.shift();
            this.addAnimation(queuedAnimation);
        }
    }

    // 성능 메트릭 업데이트
    updatePerformanceMetrics(processingTime, deltaTime) {
        this.performanceData.framesProcessed++;
        
        // 평균 처리 시간 계산
        const frameCount = this.performanceData.framesProcessed;
        this.performanceData.averageProcessingTime = 
            (this.performanceData.averageProcessingTime * (frameCount - 1) + processingTime) / frameCount;
        
        // 프레임 드롭 감지
        if (deltaTime > this.frameTime * 1.5) {
            this.performanceData.droppedFrames++;
        }
        
        // 성능 데이터를 주기적으로 전송
        if (frameCount % 60 === 0) { // 1초마다
            self.postMessage({
                type: 'ANIMATION_PERFORMANCE_UPDATE',
                data: { ...this.performanceData }
            });
        }
    }

    // 타임라인 기반 애니메이션 생성
    createTimeline(timelineData) {
        const { id, animations, duration } = timelineData;
        
        const timeline = {
            id,
            totalDuration: duration,
            animations: animations.map(anim => ({
                ...anim,
                startTime: anim.delay || 0,
                endTime: (anim.delay || 0) + anim.duration
            })),
            startTime: performance.now()
        };
        
        this.timelines.set(id, timeline);
        
        return {
            type: 'TIMELINE_CREATED',
            data: { id, duration: timeline.totalDuration }
        };
    }

    // 현재 애니메이션 상태 반환
    getAnimationState() {
        return {
            type: 'ANIMATION_STATE',
            data: {
                activeAnimations: this.animations.size,
                queuedAnimations: this.animationQueue.length,
                activeTimelines: this.timelines.size,
                isRunning: this.isRunning,
                performance: this.performanceData
            }
        };
    }
}

// Worker 인스턴스 생성
const animationProcessor = new AnimationProcessor();

// 메시지 핸들러
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    let result;
    
    switch (type) {
        case 'START_ANIMATION_SYSTEM':
            animationProcessor.start();
            break;
            
        case 'STOP_ANIMATION_SYSTEM':
            animationProcessor.stop();
            break;
            
        case 'ADD_ANIMATION':
            result = animationProcessor.addAnimation(data);
            self.postMessage(result);
            break;
            
        case 'REMOVE_ANIMATION':
            result = animationProcessor.removeAnimation(data.id);
            self.postMessage(result);
            break;
            
        case 'PAUSE_ANIMATION':
            result = animationProcessor.pauseAnimation(data.id);
            self.postMessage(result);
            break;
            
        case 'RESUME_ANIMATION':
            result = animationProcessor.resumeAnimation(data.id);
            self.postMessage(result);
            break;
            
        case 'QUEUE_ANIMATION':
            animationProcessor.animationQueue.push(data);
            break;
            
        case 'CREATE_TIMELINE':
            result = animationProcessor.createTimeline(data);
            self.postMessage(result);
            break;
            
        case 'GET_ANIMATION_STATE':
            result = animationProcessor.getAnimationState();
            self.postMessage(result);
            break;
            
        default:
            self.postMessage({
                type: 'ERROR',
                data: { error: `Unknown message type: ${type}` }
            });
    }
};

// Worker 준비 완료 알림
self.postMessage({
    type: 'WORKER_READY',
    data: { workerType: 'animation', timestamp: Date.now() }
});