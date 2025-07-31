// 🚀 Web Worker 관리자 - 메인 스레드와 Worker 간 통신 조율

class WorkerManager {
    constructor() {
        this.workers = new Map();
        this.messageHandlers = new Map();
        this.pendingTasks = new Map();
        this.performanceMetrics = {
            totalTasksProcessed: 0,
            averageResponseTime: 0,
            workerUtilization: {},
            errors: []
        };
        
        this.taskIdCounter = 0;
        this.isInitialized = false;
        
        // 이벤트 에미터 기능
        this.eventListeners = new Map();
    }

    // Worker 시스템 초기화
    async initialize() {
        if (this.isInitialized) return;

        try {
            // 게임 로직 Worker 초기화
            await this.createWorker('gameLogic', '/src/js/workers/gameLogicWorker.js');
            
            // 애니메이션 Worker 초기화
            await this.createWorker('animation', '/src/js/workers/animationWorker.js');
            
            // 데이터 처리 Worker 초기화
            await this.createWorker('dataProcessor', '/src/js/workers/dataProcessor.js');
            
            // 기본 메시지 핸들러 설정
            this.setupDefaultHandlers();
            
            this.isInitialized = true;
            
            this.emit('initialized', {
                workers: Array.from(this.workers.keys()),
                timestamp: Date.now()
            });
            
            console.log('🚀 WorkerManager 초기화 완료:', Array.from(this.workers.keys()));
            
        } catch (error) {
            console.error('❌ WorkerManager 초기화 실패:', error);
            throw error;
        }
    }

    // Worker 생성
    async createWorker(name, scriptPath) {
        return new Promise((resolve, reject) => {
            try {
                const worker = new Worker(scriptPath);
                
                // Worker 메시지 핸들러 설정
                worker.onmessage = (e) => this.handleWorkerMessage(name, e);
                worker.onerror = (error) => this.handleWorkerError(name, error);
                
                // Worker 준비 대기
                const readyHandler = (e) => {
                    if (e.data.type === 'WORKER_READY') {
                        worker.removeEventListener('message', readyHandler);
                        
                        this.workers.set(name, {
                            worker,
                            isReady: true,
                            tasksInProgress: 0,
                            totalTasksProcessed: 0,
                            averageResponseTime: 0,
                            lastActiveTime: Date.now()
                        });
                        
                        console.log(`✅ ${name} Worker 준비 완료`);
                        resolve(worker);
                    }
                };
                
                worker.addEventListener('message', readyHandler);
                
                // 타임아웃 설정
                setTimeout(() => {
                    if (!this.workers.has(name)) {
                        worker.removeEventListener('message', readyHandler);
                        worker.terminate();
                        reject(new Error(`${name} Worker 초기화 타임아웃`));
                    }
                }, 5000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    // Worker 메시지 처리
    handleWorkerMessage(workerName, event) {
        const { type, data } = event.data;
        const workerInfo = this.workers.get(workerName);
        
        if (!workerInfo) return;
        
        // 작업 완료 시 메트릭 업데이트
        if (data && data.taskId) {
            this.updateTaskMetrics(workerName, data.taskId);
        }
        
        // 타입별 핸들러 실행
        const handler = this.messageHandlers.get(`${workerName}:${type}`);
        if (handler) {
            try {
                handler(data, workerName);
            } catch (error) {
                console.error(`Handler error for ${workerName}:${type}:`, error);
                this.recordError(workerName, type, error);
            }
        }
        
        // 일반 핸들러 실행
        const generalHandler = this.messageHandlers.get(type);
        if (generalHandler) {
            try {
                generalHandler(data, workerName);
            } catch (error) {
                console.error(`General handler error for ${type}:`, error);
                this.recordError(workerName, type, error);
            }
        }
        
        // 이벤트 발생
        this.emit(`${workerName}:${type}`, data);
        this.emit(type, { data, workerName });
    }

    // Worker 에러 처리
    handleWorkerError(workerName, error) {
        console.error(`❌ ${workerName} Worker 에러:`, error);
        
        this.recordError(workerName, 'WORKER_ERROR', error);
        this.emit('workerError', { workerName, error });
        
        // Worker 재시작 시도
        this.restartWorker(workerName);
    }

    // Worker 재시작
    async restartWorker(workerName) {
        const workerInfo = this.workers.get(workerName);
        if (!workerInfo) return;
        
        try {
            // 기존 Worker 종료
            workerInfo.worker.terminate();
            this.workers.delete(workerName);
            
            // 새 Worker 생성
            const scriptPaths = {
                'gameLogic': '/src/js/workers/gameLogicWorker.js',
                'animation': '/src/js/workers/animationWorker.js',
                'dataProcessor': '/src/js/workers/dataProcessor.js'
            };
            
            if (scriptPaths[workerName]) {
                await this.createWorker(workerName, scriptPaths[workerName]);
                console.log(`🔄 ${workerName} Worker 재시작 완료`);
                
                this.emit('workerRestarted', { workerName });
            }
            
        } catch (error) {
            console.error(`❌ ${workerName} Worker 재시작 실패:`, error);
            this.emit('workerRestartFailed', { workerName, error });
        }
    }

    // 작업 전송 (Promise 기반)
    async sendTask(workerName, taskType, taskData, options = {}) {
        const workerInfo = this.workers.get(workerName);
        if (!workerInfo || !workerInfo.isReady) {
            throw new Error(`${workerName} Worker가 준비되지 않음`);
        }

        const taskId = this.generateTaskId();
        const { timeout = 5000, priority = 'normal' } = options;
        
        const task = {
            type: taskType,
            data: {
                ...taskData,
                taskId,
                priority,
                timestamp: Date.now()
            }
        };

        return new Promise((resolve, reject) => {
            // 태스크 추적
            this.pendingTasks.set(taskId, {
                workerName,
                taskType,
                startTime: Date.now(),
                resolve,
                reject,
                timeout: setTimeout(() => {
                    this.pendingTasks.delete(taskId);
                    reject(new Error(`${workerName}:${taskType} 작업 타임아웃`));
                }, timeout)
            });

            // 핸들러 등록
            const responseHandler = (data) => {
                if (data.taskId === taskId) {
                    const pendingTask = this.pendingTasks.get(taskId);
                    if (pendingTask) {
                        clearTimeout(pendingTask.timeout);
                        this.pendingTasks.delete(taskId);
                        resolve(data);
                    }
                }
            };

            this.once(`${workerName}:${taskType}_RESULT`, responseHandler);
            this.once(`${workerName}:ERROR`, (data) => {
                if (data.taskId === taskId) {
                    const pendingTask = this.pendingTasks.get(taskId);
                    if (pendingTask) {
                        clearTimeout(pendingTask.timeout);
                        this.pendingTasks.delete(taskId);
                        reject(new Error(data.error));
                    }
                }
            });

            // Worker에 작업 전송
            workerInfo.worker.postMessage(task);
            workerInfo.tasksInProgress++;
            workerInfo.lastActiveTime = Date.now();
        });
    }

    // 작업 전송 (Fire and Forget)
    sendTaskAsync(workerName, taskType, taskData) {
        const workerInfo = this.workers.get(workerName);
        if (!workerInfo || !workerInfo.isReady) {
            console.warn(`${workerName} Worker가 준비되지 않음`);
            return false;
        }

        const task = {
            type: taskType,
            data: {
                ...taskData,
                timestamp: Date.now()
            }
        };

        workerInfo.worker.postMessage(task);
        return true;
    }

    // 게임 로직 작업들
    async calculatePlayerMove(playerId, position, cardValue) {
        return this.sendTask('gameLogic', 'PROCESS_IMMEDIATE', {
            type: 'CALCULATE_MOVE',
            playerId,
            position,
            cardValue
        });
    }

    async calculateBattle(yokaiCard, guardianCard) {
        return this.sendTask('gameLogic', 'PROCESS_IMMEDIATE', {
            type: 'CALCULATE_BATTLE',
            yokaiCard,
            guardianCard
        });
    }

    async calculateAIDecision(gameState, difficulty = 'normal') {
        return this.sendTask('gameLogic', 'PROCESS_IMMEDIATE', {
            type: 'CALCULATE_AI',
            gameState,
            difficulty
        });
    }

    async analyzeBoardState(boardData) {
        return this.sendTask('gameLogic', 'PROCESS_IMMEDIATE', {
            type: 'ANALYZE_BOARD',
            boardData
        });
    }

    // 애니메이션 작업들
    startAnimationSystem() {
        this.sendTaskAsync('animation', 'START_ANIMATION_SYSTEM', {});
    }

    stopAnimationSystem() {
        this.sendTaskAsync('animation', 'STOP_ANIMATION_SYSTEM', {});
    }

    async addAnimation(animationData) {
        return this.sendTask('animation', 'ADD_ANIMATION', animationData);
    }

    async createTimeline(timelineData) {
        return this.sendTask('animation', 'CREATE_TIMELINE', timelineData);
    }

    removeAnimation(animationId) {
        this.sendTaskAsync('animation', 'REMOVE_ANIMATION', { id: animationId });
    }

    pauseAnimation(animationId) {
        this.sendTaskAsync('animation', 'PAUSE_ANIMATION', { id: animationId });
    }

    resumeAnimation(animationId) {
        this.sendTaskAsync('animation', 'RESUME_ANIMATION', { id: animationId });
    }

    // 데이터 처리 작업들
    async shuffleDeck(cards) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'SHUFFLE_DECK',
            data: { cards }
        });
    }

    async drawCards(deckId, count) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'DRAW_CARDS',
            data: { deckId, count }
        });
    }

    async calculateCardEffectiveness(guardianCard, yokaiCard) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'CALCULATE_CARD_EFFECTIVENESS',
            data: { guardianCard, yokaiCard }
        });
    }

    async filterCards(cards, criteria) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'FILTER_CARDS',
            data: { cards, criteria }
        });
    }

    async sortCards(cards, sortBy) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'SORT_CARDS',
            data: { cards, sortBy }
        });
    }

    async validateCardCombination(cards) {
        return this.sendTask('dataProcessor', 'PROCESS_CARD_DATA', {
            operation: 'VALIDATE_CARD_COMBINATION',
            data: { cards }
        });
    }

    async calculateOptimalPaths(startPosition, endPosition) {
        return this.sendTask('dataProcessor', 'PROCESS_BOARD_DATA', {
            operation: 'CALCULATE_PATHS',
            data: { startPosition, endPosition }
        });
    }

    async analyzeRoomSafety(boardState) {
        return this.sendTask('dataProcessor', 'PROCESS_BOARD_DATA', {
            operation: 'ANALYZE_ROOM_SAFETY',
            data: { boardState }
        });
    }

    async findStrategicPositions(boardState) {
        return this.sendTask('dataProcessor', 'PROCESS_BOARD_DATA', {
            operation: 'FIND_STRATEGIC_POSITIONS',
            data: { boardState }
        });
    }

    async calculateDistances(positions) {
        return this.sendTask('dataProcessor', 'PROCESS_BOARD_DATA', {
            operation: 'CALCULATE_DISTANCES',
            data: { positions }
        });
    }

    async processBatchOperations(operations) {
        return this.sendTask('dataProcessor', 'PROCESS_BATCH', {
            operations
        });
    }

    // 배치 처리
    async processBatch(workerName, tasks) {
        const results = await Promise.allSettled(
            tasks.map(task => this.sendTask(workerName, task.type, task.data, task.options))
        );
        
        return results.map((result, index) => ({
            taskIndex: index,
            status: result.status,
            data: result.status === 'fulfilled' ? result.value : result.reason
        }));
    }

    // 기본 핸들러 설정
    setupDefaultHandlers() {
        // 게임 로직 핸들러
        this.on('gameLogic:MOVE_CALCULATED', (data) => {
            this.emit('moveCalculated', data);
        });

        this.on('gameLogic:BATTLE_CALCULATED', (data) => {
            this.emit('battleCalculated', data);
        });

        this.on('gameLogic:AI_DECISION_CALCULATED', (data) => {
            this.emit('aiDecisionCalculated', data);
        });

        // 애니메이션 핸들러
        this.on('animation:ANIMATION_UPDATE', (data) => {
            this.emit('animationUpdate', data);
        });

        this.on('animation:ANIMATIONS_COMPLETED', (data) => {
            this.emit('animationsCompleted', data);
        });

        this.on('animation:ANIMATION_PERFORMANCE_UPDATE', (data) => {
            this.emit('animationPerformanceUpdate', data);
        });

        // 데이터 처리 핸들러
        this.on('dataProcessor:SHUFFLE_DECK_RESULT', (data) => {
            this.emit('deckShuffled', data);
        });

        this.on('dataProcessor:DRAW_CARDS_RESULT', (data) => {
            this.emit('cardsDrawn', data);
        });

        this.on('dataProcessor:CALCULATE_CARD_EFFECTIVENESS_RESULT', (data) => {
            this.emit('cardEffectivenessCalculated', data);
        });

        this.on('dataProcessor:CALCULATE_PATHS_RESULT', (data) => {
            this.emit('pathsCalculated', data);
        });

        this.on('dataProcessor:ANALYZE_ROOM_SAFETY_RESULT', (data) => {
            this.emit('roomSafetyAnalyzed', data);
        });

        this.on('dataProcessor:BATCH_PROCESSED', (data) => {
            this.emit('batchProcessed', data);
        });
    }

    // 메트릭 업데이트
    updateTaskMetrics(workerName, taskId) {
        const workerInfo = this.workers.get(workerName);
        const pendingTask = this.pendingTasks.get(taskId);
        
        if (workerInfo && pendingTask) {
            const responseTime = Date.now() - pendingTask.startTime;
            
            workerInfo.tasksInProgress = Math.max(0, workerInfo.tasksInProgress - 1);
            workerInfo.totalTasksProcessed++;
            
            // 평균 응답 시간 계산
            const totalTasks = workerInfo.totalTasksProcessed;
            workerInfo.averageResponseTime = 
                (workerInfo.averageResponseTime * (totalTasks - 1) + responseTime) / totalTasks;
            
            // 전체 메트릭 업데이트
            this.performanceMetrics.totalTasksProcessed++;
            this.performanceMetrics.averageResponseTime = 
                (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalTasksProcessed - 1) + responseTime) / this.performanceMetrics.totalTasksProcessed;
        }
    }

    // 에러 기록
    recordError(workerName, taskType, error) {
        this.performanceMetrics.errors.push({
            workerName,
            taskType,
            error: error.message || error,
            timestamp: Date.now()
        });
        
        // 에러 기록 제한 (최대 100개)
        if (this.performanceMetrics.errors.length > 100) {
            this.performanceMetrics.errors = this.performanceMetrics.errors.slice(-50);
        }
    }

    // 작업 ID 생성
    generateTaskId() {
        return `task_${++this.taskIdCounter}_${Date.now()}`;
    }

    // 성능 메트릭 반환
    getPerformanceMetrics() {
        const workerMetrics = {};
        
        for (const [name, info] of this.workers) {
            workerMetrics[name] = {
                tasksInProgress: info.tasksInProgress,
                totalTasksProcessed: info.totalTasksProcessed,
                averageResponseTime: info.averageResponseTime,
                lastActiveTime: info.lastActiveTime,
                utilization: info.tasksInProgress > 0 ? 100 : 0
            };
        }
        
        return {
            ...this.performanceMetrics,
            workers: workerMetrics,
            pendingTasks: this.pendingTasks.size
        };
    }

    // Worker 상태 반환
    getWorkerStatus() {
        const status = {};
        
        for (const [name, info] of this.workers) {
            status[name] = {
                isReady: info.isReady,
                tasksInProgress: info.tasksInProgress,
                isIdle: info.tasksInProgress === 0,
                lastActiveTime: info.lastActiveTime
            };
        }
        
        return status;
    }

    // 이벤트 에미터 기능
    on(event, listener) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(listener);
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            listener(...args);
            this.off(event, onceWrapper);
        };
        this.on(event, onceWrapper);
    }

    off(event, listener) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error(`Event listener error for ${event}:`, error);
            }
        });
    }

    // 정리
    destroy() {
        // 모든 대기 중인 작업 취소
        for (const [taskId, pendingTask] of this.pendingTasks) {
            clearTimeout(pendingTask.timeout);
            pendingTask.reject(new Error('WorkerManager destroyed'));
        }
        this.pendingTasks.clear();

        // 모든 Worker 종료
        for (const [name, info] of this.workers) {
            info.worker.terminate();
        }
        this.workers.clear();

        // 이벤트 리스너 정리
        this.eventListeners.clear();

        this.isInitialized = false;
        
        console.log('🗑️ WorkerManager 정리 완료');
    }
}

// 전역 WorkerManager 인스턴스
const workerManager = new WorkerManager();

// 전역 접근을 위한 window 객체에 등록
if (typeof window !== 'undefined') {
    window.workerManager = workerManager;
}

export default workerManager;