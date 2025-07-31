// 🎮 비동기 게임 컨트롤러 - Worker 기반 병렬 처리로 성능 최적화

import workerManager from './workerManager.js';

class AsyncGameController {
    constructor() {
        this.gameState = {
            currentPlayer: 0,
            players: [],
            gameMode: 'single',
            phase: 'setup',
            isProcessing: false
        };
        
        this.eventQueue = [];
        this.processingQueue = false;
        this.pendingActions = new Map();
        
        // 성능 모니터링
        this.performanceMetrics = {
            eventsProcessed: 0,
            averageEventTime: 0,
            queueLength: 0,
            concurrentActions: 0
        };
        
        this.initialized = false;
        this.eventHandlers = new Map();
        
        this.setupEventHandlers();
    }

    // 시스템 초기화
    async initialize() {
        if (this.initialized) return;
        
        try {
            // WorkerManager 초기화
            await workerManager.initialize();
            
            // 애니메이션 시스템 시작
            workerManager.startAnimationSystem();
            
            // Worker 이벤트 핸들러 등록
            this.setupWorkerEventHandlers();
            
            // 이벤트 큐 처리 시작
            this.startEventQueueProcessing();
            
            this.initialized = true;
            
            console.log('🎮 AsyncGameController 초기화 완료');
            
            return true;
            
        } catch (error) {
            console.error('❌ AsyncGameController 초기화 실패:', error);
            throw error;
        }
    }

    // Worker 이벤트 핸들러 설정
    setupWorkerEventHandlers() {
        // 게임 로직 결과 처리
        workerManager.on('moveCalculated', (data) => {
            this.handleMoveCalculated(data);
        });

        workerManager.on('battleCalculated', (data) => {
            this.handleBattleCalculated(data);
        });

        workerManager.on('aiDecisionCalculated', (data) => {
            this.handleAIDecisionCalculated(data);
        });

        // 애니메이션 이벤트 처리
        workerManager.on('animationUpdate', (data) => {
            this.handleAnimationUpdate(data);
        });

        workerManager.on('animationsCompleted', (data) => {
            this.handleAnimationsCompleted(data);
        });

        // 데이터 처리 이벤트 핸들러
        workerManager.on('deckShuffled', (data) => {
            this.handleDeckShuffled(data);
        });

        workerManager.on('cardsDrawn', (data) => {
            this.handleCardsDrawn(data);
        });

        workerManager.on('cardEffectivenessCalculated', (data) => {
            this.handleCardEffectivenessCalculated(data);
        });

        workerManager.on('pathsCalculated', (data) => {
            this.handlePathsCalculated(data);
        });

        workerManager.on('roomSafetyAnalyzed', (data) => {
            this.handleRoomSafetyAnalyzed(data);
        });

        workerManager.on('batchProcessed', (data) => {
            this.handleBatchProcessed(data);
        });
    }

    // 이벤트 핸들러 설정
    setupEventHandlers() {
        // 플레이어 액션 핸들러
        this.eventHandlers.set('PLAYER_MOVE', this.handlePlayerMove.bind(this));
        this.eventHandlers.set('CARD_DRAW', this.handleCardDraw.bind(this));
        this.eventHandlers.set('BATTLE_START', this.handleBattleStart.bind(this));
        this.eventHandlers.set('GUARDIAN_USE', this.handleGuardianUse.bind(this));
        this.eventHandlers.set('TURN_END', this.handleTurnEnd.bind(this));
        
        // UI 이벤트 핸들러
        this.eventHandlers.set('ROOM_CLICK', this.handleRoomClick.bind(this));
        this.eventHandlers.set('CARD_CLICK', this.handleCardClick.bind(this));
        this.eventHandlers.set('BUTTON_CLICK', this.handleButtonClick.bind(this));
        
        // 시스템 이벤트 핸들러
        this.eventHandlers.set('GAME_START', this.handleGameStart.bind(this));
        this.eventHandlers.set('GAME_END', this.handleGameEnd.bind(this));
        this.eventHandlers.set('STATE_CHANGE', this.handleStateChange.bind(this));
    }

    // 이벤트 큐잉 시스템
    queueEvent(eventType, eventData, priority = 'normal') {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            data: eventData,
            priority,
            timestamp: Date.now(),
            retries: 0
        };

        // 우선순위에 따라 큐에 삽입
        if (priority === 'high') {
            this.eventQueue.unshift(event);
        } else {
            this.eventQueue.push(event);
        }

        this.performanceMetrics.queueLength = this.eventQueue.length;
        
        // 즉시 처리 시작
        this.processEventQueue();
        
        return event.id;
    }

    // 이벤트 큐 처리
    async processEventQueue() {
        if (this.processingQueue || this.eventQueue.length === 0) {
            return;
        }

        this.processingQueue = true;

        try {
            // 병렬 처리 가능한 이벤트들을 그룹화
            const eventBatches = this.groupEventsForParallelProcessing();

            for (const batch of eventBatches) {
                await this.processBatch(batch);
            }

        } catch (error) {
            console.error('❌ 이벤트 큐 처리 중 오류:', error);
        } finally {
            this.processingQueue = false;
            
            // 큐에 남은 이벤트가 있으면 다시 처리
            if (this.eventQueue.length > 0) {
                setTimeout(() => this.processEventQueue(), 0);
            }
        }
    }

    // 병렬 처리용 이벤트 그룹화
    groupEventsForParallelProcessing() {
        const batches = [];
        const currentBatch = [];
        
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            
            // 병렬 처리 가능한 이벤트인지 확인
            if (this.canProcessInParallel(event, currentBatch)) {
                currentBatch.push(event);
            } else {
                // 현재 배치가 있으면 저장하고 새 배치 시작
                if (currentBatch.length > 0) {
                    batches.push([...currentBatch]);
                    currentBatch.length = 0;
                }
                currentBatch.push(event);
            }
        }

        // 마지막 배치 추가
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        return batches;
    }

    // 병렬 처리 가능성 확인
    canProcessInParallel(event, currentBatch) {
        if (currentBatch.length === 0) return true;
        
        // 게임 상태를 변경하는 이벤트들은 순차 처리
        const sequentialEvents = ['PLAYER_MOVE', 'TURN_END', 'GAME_START', 'GAME_END'];
        
        if (sequentialEvents.includes(event.type)) {
            return currentBatch.every(e => !sequentialEvents.includes(e.type));
        }
        
        // UI 이벤트들은 병렬 처리 가능
        const parallelEvents = ['ANIMATION_UPDATE', 'CARD_HOVER', 'ROOM_HIGHLIGHT'];
        
        return parallelEvents.includes(event.type);
    }

    // 배치 처리
    async processBatch(batch) {
        const startTime = Date.now();
        
        try {
            // 배치 내 이벤트들을 병렬로 처리
            const promises = batch.map(event => this.processEvent(event));
            const results = await Promise.allSettled(promises);
            
            // 결과 확인 및 재시도 처리
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                const event = batch[i];
                
                if (result.status === 'rejected') {
                    console.error(`❌ 이벤트 처리 실패 ${event.type}:`, result.reason);
                    
                    // 재시도 로직
                    if (event.retries < 3) {
                        event.retries++;
                        this.eventQueue.unshift(event); // 큐 앞쪽에 다시 추가
                    }
                }
            }
            
            // 성능 메트릭 업데이트
            const processingTime = Date.now() - startTime;
            this.updatePerformanceMetrics(batch.length, processingTime);
            
        } catch (error) {
            console.error('❌ 배치 처리 중 오류:', error);
        }
    }

    // 개별 이벤트 처리
    async processEvent(event) {
        const { type, data, id } = event;
        
        try {
            // 이벤트 핸들러 실행
            const handler = this.eventHandlers.get(type);
            if (handler) {
                await handler(data, id);
            } else {
                console.warn(`⚠️ 알 수 없는 이벤트 타입: ${type}`);
            }
            
        } catch (error) {
            console.error(`❌ 이벤트 처리 실패 ${type}:`, error);
            throw error;
        }
    }

    // 이벤트 큐 처리 시작
    startEventQueueProcessing() {
        // 주기적으로 큐 처리 (프레임 기반)
        const processLoop = () => {
            if (this.eventQueue.length > 0 && !this.processingQueue) {
                this.processEventQueue();
            }
            requestAnimationFrame(processLoop);
        };
        
        requestAnimationFrame(processLoop);
    }

    // === 이벤트 핸들러들 ===

    // 플레이어 이동 처리
    async handlePlayerMove(data, eventId) {
        const { playerId, targetPosition } = data;
        
        try {
            // Worker에서 이동 계산
            const moveResult = await workerManager.calculatePlayerMove(
                playerId, 
                this.gameState.players[playerId].position, 
                data.cardValue
            );
            
            // 이동 애니메이션 시작
            const animationId = `move_${playerId}_${Date.now()}`;
            await workerManager.addAnimation({
                id: animationId,
                type: 'MOVE',
                duration: 400,
                startState: this.getPlayerPosition(playerId),
                endState: this.getRoomPosition(targetPosition),
                easing: 'easeOutQuad'
            });
            
            // 게임 상태 업데이트
            this.updatePlayerPosition(playerId, targetPosition);
            
            // 이동 완료 이벤트 큐잉
            this.queueEvent('MOVE_COMPLETED', { 
                playerId, 
                targetPosition, 
                moveResult 
            }, 'high');
            
        } catch (error) {
            console.error('플레이어 이동 처리 실패:', error);
            throw error;
        }
    }

    // 카드 뽑기 처리
    async handleCardDraw(data, eventId) {
        const { playerId, cardType } = data;
        
        try {
            // 카드 뽑기 애니메이션
            const animationId = `card_draw_${Date.now()}`;
            await workerManager.addAnimation({
                id: animationId,
                type: 'COMPLEX',
                duration: 300,
                keyframes: [
                    { opacity: 0, scale: 0.8, rotation: 180 },
                    { opacity: 0.5, scale: 1.1, rotation: 90 },
                    { opacity: 1, scale: 1, rotation: 0 }
                ],
                easing: 'easeOutCubic'
            });
            
            // UI 업데이트
            this.updateCardDisplay(data.cardData);
            
        } catch (error) {
            console.error('카드 뽑기 처리 실패:', error);
            throw error;
        }
    }

    // 전투 시작 처리
    async handleBattleStart(data, eventId) {
        const { playerId, yokaiCard, guardianCard } = data;
        
        try {
            // Worker에서 전투 계산
            const battleResult = await workerManager.calculateBattle(yokaiCard, guardianCard);
            
            // 전투 애니메이션 시작
            const timelineId = `battle_${Date.now()}`;
            await workerManager.createTimeline({
                id: timelineId,
                duration: 2000,
                animations: [
                    {
                        delay: 0,
                        duration: 500,
                        type: 'SCALE',
                        target: 'guardian_card',
                        startState: { scaleX: 1, scaleY: 1 },
                        endState: { scaleX: 1.2, scaleY: 1.2 }
                    },
                    {
                        delay: 500,
                        duration: 500,
                        type: 'FADE',
                        target: 'battle_effect',
                        startState: { opacity: 0 },
                        endState: { opacity: 1 }
                    },
                    {
                        delay: 1000,
                        duration: 500,
                        type: 'SCALE',
                        target: 'guardian_card',
                        startState: { scaleX: 1.2, scaleY: 1.2 },
                        endState: { scaleX: 1, scaleY: 1 }
                    }
                ]
            });
            
            // 전투 결과 처리 이벤트 큐잉 (딜레이)
            setTimeout(() => {
                this.queueEvent('BATTLE_RESULT', {
                    playerId,
                    result: battleResult,
                    timelineId
                }, 'high');
            }, 2000);
            
        } catch (error) {
            console.error('전투 시작 처리 실패:', error);
            throw error;
        }
    }

    // AI 결정 처리
    async handleAIDecisionCalculated(data) {
        const { playerId, decision, analysis } = data;
        
        try {
            // AI 결정에 따른 액션 실행
            switch (decision) {
                case 'move_safe':
                    this.queueEvent('PLAYER_MOVE', {
                        playerId,
                        targetPosition: analysis.safePosition,
                        cardValue: this.getCurrentCardValue()
                    });
                    break;
                    
                case 'move_aggressive':
                    this.queueEvent('PLAYER_MOVE', {
                        playerId,
                        targetPosition: analysis.aggressivePosition,
                        cardValue: this.getCurrentCardValue()
                    });
                    break;
                    
                case 'use_guardian':
                    this.queueEvent('GUARDIAN_USE', {
                        playerId,
                        guardianCard: this.selectBestGuardian(analysis)
                    });
                    break;
                    
                case 'skip_turn':
                    this.queueEvent('TURN_END', { playerId });
                    break;
            }
            
        } catch (error) {
            console.error('AI 결정 처리 실패:', error);
        }
    }

    // === 데이터 처리 핸들러들 ===

    // 덱 셔플 완료 처리
    handleDeckShuffled(data) {
        console.log('🔀 덱 셔플 완료:', data);
        
        // UI 업데이트 이벤트 큐잉
        this.queueEvent('UI_UPDATE', {
            type: 'deck_shuffled',
            result: data.result
        }, 'low');
    }

    // 카드 뽑기 완료 처리
    handleCardsDrawn(data) {
        console.log('🎴 카드 뽑기 완료:', data);
        
        // 뽑힌 카드들을 게임 상태에 반영
        if (data.result && data.result.cards) {
            // UI 카드 표시 이벤트 큐잉
            this.queueEvent('UI_UPDATE', {
                type: 'cards_drawn',
                cards: data.result.cards,
                remainingCount: data.result.remainingCount
            }, 'normal');
        }
    }

    // 카드 효과 계산 완료 처리
    handleCardEffectivenessCalculated(data) {
        console.log('⚔️ 카드 효과 계산 완료:', data);
        
        // 전투 결과 적용
        if (data.result) {
            this.queueEvent('BATTLE_EFFECTIVENESS_CALCULATED', {
                effectiveness: data.result,
                processingTime: data.processingTime
            }, 'high');
        }
    }

    // 경로 계산 완료 처리
    handlePathsCalculated(data) {
        console.log('🗺️ 경로 계산 완료:', data);
        
        // AI 의사결정에 경로 정보 제공
        if (data.result && data.result.length > 0) {
            this.queueEvent('AI_PATH_INFO_UPDATED', {
                optimalPaths: data.result,
                processingTime: data.processingTime
            }, 'normal');
        }
    }

    // 방 안전도 분석 완료 처리
    handleRoomSafetyAnalyzed(data) {
        console.log('🛡️ 방 안전도 분석 완료:', data);
        
        // 안전도 정보를 게임 상태에 반영
        if (data.result) {
            this.gameState.roomSafetyData = data.result;
            
            // UI 안전도 표시 업데이트
            this.queueEvent('UI_UPDATE', {
                type: 'room_safety_updated',
                safetyData: data.result
            }, 'low');
        }
    }

    // 배치 처리 완료 처리
    handleBatchProcessed(data) {
        console.log('📦 배치 처리 완료:', data);
        
        // 배치 결과에 따른 후속 처리
        data.results.forEach(result => {
            if (result.status === 'success') {
                // 성공한 작업들 처리
                this.queueEvent('BATCH_OPERATION_SUCCESS', {
                    operationId: result.operationId,
                    result: result.result
                }, 'low');
            } else {
                // 실패한 작업들 로깅
                console.error(`배치 작업 실패 ${result.operationId}:`, result.error);
            }
        });
    }

    // === 데이터 처리 편의 메서드들 ===

    // 비동기 카드 뽑기
    async drawCardsAsync(deckId, count) {
        try {
            const result = await workerManager.drawCards(deckId, count);
            return result.data.result;
        } catch (error) {
            console.error('카드 뽑기 실패:', error);
            return null;
        }
    }

    // 비동기 카드 효과 계산
    async calculateCardEffectivenessAsync(guardianCard, yokaiCard) {
        try {
            const result = await workerManager.calculateCardEffectiveness(guardianCard, yokaiCard);
            return result.data.result;
        } catch (error) {
            console.error('카드 효과 계산 실패:', error);
            return null;
        }
    }

    // 비동기 경로 계산
    async calculateOptimalPathsAsync(startPosition, endPosition) {
        try {
            const result = await workerManager.calculateOptimalPaths(startPosition, endPosition);
            return result.data.result;
        } catch (error) {
            console.error('경로 계산 실패:', error);
            return [];
        }
    }

    // 비동기 방 안전도 분석
    async analyzeRoomSafetyAsync(boardState) {
        try {
            const result = await workerManager.analyzeRoomSafety(boardState);
            return result.data.result;
        } catch (error) {
            console.error('방 안전도 분석 실패:', error);
            return {};
        }
    }

    // 배치 데이터 처리
    async processBatchDataAsync(operations) {
        try {
            const result = await workerManager.processBatchOperations(operations);
            return result.data;
        } catch (error) {
            console.error('배치 데이터 처리 실패:', error);
            return null;
        }
    }

    // === 헬퍼 메서드들 ===

    // 플레이어 위치 반환
    getPlayerPosition(playerId) {
        const player = this.gameState.players[playerId];
        const roomElement = document.getElementById(`room-${player.position}`);
        const rect = roomElement.getBoundingClientRect();
        
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    // 방 위치 반환
    getRoomPosition(roomId) {
        const roomElement = document.getElementById(`room-${roomId}`);
        const rect = roomElement.getBoundingClientRect();
        
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }

    // 플레이어 위치 업데이트
    updatePlayerPosition(playerId, newPosition) {
        this.gameState.players[playerId].position = newPosition;
        
        // UI 업데이트 이벤트 큐잉
        this.queueEvent('UI_UPDATE', {
            type: 'player_position',
            playerId,
            position: newPosition
        }, 'normal');
    }

    // 성능 메트릭 업데이트
    updatePerformanceMetrics(eventsProcessed, processingTime) {
        this.performanceMetrics.eventsProcessed += eventsProcessed;
        
        const totalEvents = this.performanceMetrics.eventsProcessed;
        this.performanceMetrics.averageEventTime = 
            (this.performanceMetrics.averageEventTime * (totalEvents - eventsProcessed) + processingTime) / totalEvents;
        
        this.performanceMetrics.queueLength = this.eventQueue.length;
        this.performanceMetrics.concurrentActions = this.pendingActions.size;
    }

    // 이벤트 ID 생성
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 성능 메트릭 반환
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            workerMetrics: workerManager.getPerformanceMetrics()
        };
    }

    // 시스템 상태 반환
    getSystemStatus() {
        return {
            initialized: this.initialized,
            gameState: this.gameState,
            eventQueueLength: this.eventQueue.length,
            processingQueue: this.processingQueue,
            pendingActions: this.pendingActions.size,
            workerStatus: workerManager.getWorkerStatus()
        };
    }

    // 정리
    destroy() {
        // 이벤트 큐 정리
        this.eventQueue.length = 0;
        this.pendingActions.clear();
        this.eventHandlers.clear();
        
        // Worker 시스템 정리
        workerManager.stopAnimationSystem();
        workerManager.destroy();
        
        this.initialized = false;
        
        console.log('🗑️ AsyncGameController 정리 완료');
    }
}

// 전역 인스턴스 생성
const asyncGameController = new AsyncGameController();

// 전역 접근을 위한 window 객체에 등록
if (typeof window !== 'undefined') {
    window.asyncGameController = asyncGameController;
}

export default asyncGameController;