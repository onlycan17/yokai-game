// 🧠 게임 로직 처리 전용 Web Worker
// 메인 스레드와 독립적으로 게임 상태 계산 및 로직 처리

// 게임 상태 관리
class GameLogicProcessor {
    constructor() {
        this.gameState = {
            currentPlayer: 0,
            players: [],
            boardState: null,
            turnPhase: 'move',
            battleData: null
        };
        
        this.processingQueue = [];
        this.isProcessing = false;
    }

    // 게임 상태 초기화
    initializeGame(gameData) {
        this.gameState = {
            ...this.gameState,
            ...gameData
        };
        
        return {
            type: 'GAME_INITIALIZED',
            data: this.gameState
        };
    }

    // 플레이어 이동 로직 계산
    calculatePlayerMove(playerId, currentPosition, cardValue) {
        const startTime = performance.now();
        
        // 이동 가능한 위치 계산
        const possibleMoves = this.calculatePossibleMoves(currentPosition, cardValue);
        
        // 각 이동의 위험도 계산 (AI용)
        const moveRisks = possibleMoves.map(position => ({
            position,
            risk: this.calculateRiskScore(position),
            rewards: this.calculateRewards(position)
        }));

        const processingTime = performance.now() - startTime;
        
        return {
            type: 'MOVE_CALCULATED',
            data: {
                playerId,
                possibleMoves,
                moveRisks,
                processingTime
            }
        };
    }

    // 이동 가능한 위치 계산
    calculatePossibleMoves(currentPosition, steps) {
        const moves = [];
        
        // 나선형 보드에서 가능한 이동 계산
        for (let i = 1; i <= steps; i++) {
            const newPosition = (currentPosition + i) % 25;
            moves.push(newPosition);
        }
        
        return moves;
    }

    // 위험도 점수 계산
    calculateRiskScore(position) {
        // 요괴 방의 위험도를 계산
        const yokaiRooms = [3, 7, 11, 15, 19]; // 예시 요괴 방 위치
        const safeRooms = [5, 10, 20]; // 안전한 방
        
        if (yokaiRooms.includes(position)) {
            return 0.8; // 높은 위험
        } else if (safeRooms.includes(position)) {
            return 0.1; // 낮은 위험
        }
        
        return 0.4; // 보통 위험
    }

    // 보상 계산
    calculateRewards(position) {
        // 특별한 방의 보상 계산
        const rewardRooms = {
            5: { type: 'guardian_card', value: 1 },
            10: { type: 'skip_turn', value: 1 },
            15: { type: 'extra_move', value: 1 },
            20: { type: 'safe_zone', value: 2 }
        };
        
        return rewardRooms[position] || { type: 'none', value: 0 };
    }

    // 전투 결과 계산
    calculateBattleResult(yokaiCard, guardianCard) {
        const startTime = performance.now();
        
        // 상성표 기반 전투 계산
        const effectiveness = this.getEffectiveness(guardianCard.type, yokaiCard.weakness);
        
        let result = {
            victory: false,
            damage: 0,
            guardianUsed: false
        };

        if (effectiveness >= 1.0) {
            result.victory = true;
            result.guardianUsed = true;
        } else if (effectiveness >= 0.5) {
            result.victory = Math.random() > 0.3; // 70% 승률
            result.guardianUsed = true;
        } else {
            result.victory = Math.random() > 0.7; // 30% 승률
            result.damage = Math.floor(Math.random() * 2) + 1;
        }

        const processingTime = performance.now() - startTime;
        
        return {
            type: 'BATTLE_CALCULATED',
            data: {
                result,
                effectiveness,
                processingTime
            }
        };
    }

    // 상성 효과 계산
    getEffectiveness(guardianType, yokaiWeakness) {
        const effectiveness = {
            'light': { 'darkness': 2.0, 'shadow': 1.5, 'curse': 1.0 },
            'water': { 'fire': 2.0, 'earth': 1.5, 'metal': 1.0 },
            'earth': { 'water': 2.0, 'wind': 1.5, 'lightning': 1.0 },
            'fire': { 'ice': 2.0, 'plant': 1.5, 'darkness': 1.0 },
            'wind': { 'earth': 2.0, 'fire': 1.5, 'water': 1.0 }
        };
        
        return effectiveness[guardianType]?.[yokaiWeakness] || 0.5;
    }

    // AI 결정 계산
    calculateAIDecision(gameState, difficulty = 'normal') {
        const startTime = performance.now();
        
        const aiPlayer = gameState.players.find(p => p.isAI);
        if (!aiPlayer) return null;

        // 현재 상황 분석
        const situationAnalysis = this.analyzeSituation(aiPlayer, gameState);
        
        // 최적의 행동 결정
        const decision = this.makeOptimalDecision(situationAnalysis, difficulty);
        
        const processingTime = performance.now() - startTime;
        
        return {
            type: 'AI_DECISION_CALCULATED',
            data: {
                playerId: aiPlayer.id,
                decision,
                analysis: situationAnalysis,
                processingTime
            }
        };
    }

    // 상황 분석
    analyzeSituation(player, gameState) {
        return {
            playerPosition: player.position,
            guardiansCount: player.guardianCards.length,
            opponentPositions: gameState.players.filter(p => p.id !== player.id).map(p => p.position),
            nearEndGame: player.position > 20,
            dangerLevel: this.calculateRiskScore(player.position)
        };
    }

    // 최적 결정 생성
    makeOptimalDecision(analysis, difficulty) {
        const decisions = ['move_safe', 'move_aggressive', 'use_guardian', 'skip_turn'];
        
        // 난이도에 따른 가중치
        const weights = {
            easy: [0.6, 0.2, 0.1, 0.1],
            normal: [0.4, 0.3, 0.2, 0.1],
            hard: [0.2, 0.4, 0.3, 0.1]
        };
        
        const difficultyWeights = weights[difficulty] || weights.normal;
        
        // 가중치 기반 랜덤 선택
        const randomValue = Math.random();
        let accumulated = 0;
        
        for (let i = 0; i < decisions.length; i++) {
            accumulated += difficultyWeights[i];
            if (randomValue <= accumulated) {
                return decisions[i];
            }
        }
        
        return decisions[0];
    }

    // 큐 기반 비동기 처리
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        
        while (this.processingQueue.length > 0) {
            const task = this.processingQueue.shift();
            
            try {
                const result = await this.processTask(task);
                self.postMessage(result);
            } catch (error) {
                self.postMessage({
                    type: 'ERROR',
                    data: { error: error.message, task }
                });
            }
            
            // 다음 프레임까지 양보
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        this.isProcessing = false;
    }

    // 개별 작업 처리
    async processTask(task) {
        switch (task.type) {
            case 'CALCULATE_MOVE':
                return this.calculatePlayerMove(task.playerId, task.position, task.cardValue);
            
            case 'CALCULATE_BATTLE':
                return this.calculateBattleResult(task.yokaiCard, task.guardianCard);
            
            case 'CALCULATE_AI':
                return this.calculateAIDecision(task.gameState, task.difficulty);
            
            case 'ANALYZE_BOARD':
                return this.analyzeBoardState(task.boardData);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    // 보드 상태 분석
    analyzeBoardState(boardData) {
        const startTime = performance.now();
        
        const analysis = {
            playerDistribution: this.analyzePlayerDistribution(boardData.players),
            riskAreas: this.identifyRiskAreas(boardData.rooms),
            gameProgression: this.calculateGameProgression(boardData.players),
            strategicPositions: this.findStrategicPositions(boardData.rooms)
        };
        
        const processingTime = performance.now() - startTime;
        
        return {
            type: 'BOARD_ANALYZED',
            data: {
                analysis,
                processingTime
            }
        };
    }

    // 플레이어 분포 분석
    analyzePlayerDistribution(players) {
        return players.map(player => ({
            id: player.id,
            position: player.position,
            progress: (player.position / 24) * 100,
            leadStatus: this.calculateLeadStatus(player, players)
        }));
    }

    // 리드 상태 계산
    calculateLeadStatus(player, allPlayers) {
        const otherPlayers = allPlayers.filter(p => p.id !== player.id);
        const averagePosition = otherPlayers.reduce((sum, p) => sum + p.position, 0) / otherPlayers.length;
        
        if (player.position > averagePosition + 3) return 'leading';
        if (player.position < averagePosition - 3) return 'behind';
        return 'even';
    }

    // 위험 지역 식별
    identifyRiskAreas(rooms) {
        return rooms.filter(room => room.hasYokai || room.isTrap)
                   .map(room => ({
                       position: room.position,
                       riskLevel: room.hasYokai ? 'high' : 'medium',
                       description: room.description
                   }));
    }

    // 게임 진행도 계산
    calculateGameProgression(players) {
        const maxPosition = Math.max(...players.map(p => p.position));
        const averagePosition = players.reduce((sum, p) => sum + p.position, 0) / players.length;
        
        return {
            overall: (averagePosition / 24) * 100,
            leader: (maxPosition / 24) * 100,
            phase: maxPosition > 20 ? 'endgame' : maxPosition > 12 ? 'midgame' : 'early'
        };
    }

    // 전략적 위치 찾기
    findStrategicPositions(rooms) {
        return rooms.filter(room => room.hasSpecialEffect || room.isSafeZone)
                   .map(room => ({
                       position: room.position,
                       benefit: room.specialEffect || 'safe_zone',
                       priority: room.isSafeZone ? 'high' : 'medium'
                   }));
    }
}

// Worker 인스턴스 생성
const gameLogicProcessor = new GameLogicProcessor();

// 메시지 핸들러
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'INIT_GAME':
            const initResult = gameLogicProcessor.initializeGame(data);
            self.postMessage(initResult);
            break;
            
        case 'QUEUE_TASK':
            gameLogicProcessor.processingQueue.push(data);
            gameLogicProcessor.processQueue();
            break;
            
        case 'PROCESS_IMMEDIATE':
            gameLogicProcessor.processTask(data).then(result => {
                self.postMessage(result);
            }).catch(error => {
                self.postMessage({
                    type: 'ERROR',
                    data: { error: error.message }
                });
            });
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
    data: { workerType: 'gameLogic', timestamp: Date.now() }
});