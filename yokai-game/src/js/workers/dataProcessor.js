// 📦 데이터 처리 전용 Web Worker
// 카드 데이터, 보드 상태, 게임 데이터를 병렬로 처리하여 성능 최적화

class DataProcessor {
    constructor() {
        this.cardDatabase = new Map();
        this.boardCache = new Map();
        this.processingQueue = [];
        this.isProcessing = false;
        
        // 성능 메트릭
        this.performanceMetrics = {
            totalOperations: 0,
            averageProcessingTime: 0,
            cacheHitRate: 0,
            memoryUsage: 0
        };
        
        // 카드 타입 정의
        this.cardTypes = {
            YOKAI: 'yokai',
            GUARDIAN: 'guardian', 
            ITEM: 'item',
            SPECIAL: 'special'
        };
        
        this.initializeCardDatabase();
    }

    // 카드 데이터베이스 초기화
    initializeCardDatabase() {
        // 요괴 카드 데이터
        const yokaiCards = [
            { id: 'y001', name: '그림자 요괴', weakness: 'light', power: 3, type: 'shadow' },
            { id: 'y002', name: '불꽃 요괴', weakness: 'water', power: 4, type: 'fire' },
            { id: 'y003', name: '얼음 요괴', weakness: 'fire', power: 3, type: 'ice' },
            { id: 'y004', name: '바람 요괴', weakness: 'earth', power: 2, type: 'wind' },
            { id: 'y005', name: '독 요괴', weakness: 'light', power: 5, type: 'poison' },
            { id: 'y006', name: '저주 요괴', weakness: 'light', power: 4, type: 'curse' },
            { id: 'y007', name: '물 요괴', weakness: 'earth', power: 3, type: 'water' },
            { id: 'y008', name: '번개 요괴', weakness: 'earth', power: 4, type: 'lightning' }
        ];

        // 수호신 카드 데이터
        const guardianCards = [
            { id: 'g001', name: '빛의 수호신', type: 'light', power: 4, effectiveness: ['darkness', 'shadow', 'curse'] },
            { id: 'g002', name: '물의 수호신', type: 'water', power: 3, effectiveness: ['fire', 'poison'] },
            { id: 'g003', name: '땅의 수호신', type: 'earth', power: 3, effectiveness: ['wind', 'lightning', 'water'] },
            { id: 'g004', name: '불의 수호신', type: 'fire', power: 4, effectiveness: ['ice', 'darkness'] },
            { id: 'g005', name: '바람의 수호신', type: 'wind', power: 2, effectiveness: ['poison', 'fire'] }
        ];

        // 아이템 카드 데이터
        const itemCards = [
            { id: 'i001', name: '행운의 주사위', effect: 'reroll', power: 0, uses: 1 },
            { id: 'i002', name: '순간이동 부적', effect: 'teleport', power: 0, uses: 1 },
            { id: 'i003', name: '방어막 부적', effect: 'shield', power: 2, uses: 2 },
            { id: 'i004', name: '치유 물약', effect: 'heal', power: 3, uses: 1 },
            { id: 'i005', name: '투명 망토', effect: 'stealth', power: 0, uses: 1 }
        ];

        // 카드 데이터베이스에 저장
        [...yokaiCards, ...guardianCards, ...itemCards].forEach(card => {
            this.cardDatabase.set(card.id, card);
        });

        console.log(`📦 카드 데이터베이스 초기화 완료: ${this.cardDatabase.size}장`);
    }

    // 카드 데이터 처리
    async processCardData(operation, data) {
        const startTime = performance.now();
        let result;

        switch (operation) {
            case 'SHUFFLE_DECK':
                result = await this.shuffleDeck(data.cards);
                break;
                
            case 'DRAW_CARDS':
                result = await this.drawCards(data.deckId, data.count);
                break;
                
            case 'CALCULATE_CARD_EFFECTIVENESS':
                result = await this.calculateCardEffectiveness(data.guardianCard, data.yokaiCard);
                break;
                
            case 'FILTER_CARDS':
                result = await this.filterCards(data.cards, data.criteria);
                break;
                
            case 'SORT_CARDS':
                result = await this.sortCards(data.cards, data.sortBy);
                break;
                
            case 'VALIDATE_CARD_COMBINATION':
                result = await this.validateCardCombination(data.cards);
                break;
                
            default:
                throw new Error(`알 수 없는 카드 작업: ${operation}`);
        }

        const processingTime = performance.now() - startTime;
        this.updatePerformanceMetrics(processingTime);

        return {
            type: `${operation}_RESULT`,
            data: {
                result,
                processingTime,
                operation
            }
        };
    }

    // 덱 셔플 (Fisher-Yates 알고리즘)
    async shuffleDeck(cards) {
        const shuffled = [...cards];
        
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            
            // 큰 덱의 경우 중간에 양보
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        return shuffled;
    }

    // 카드 뽑기
    async drawCards(deckId, count) {
        const cacheKey = `deck_${deckId}`;
        let deck = this.boardCache.get(cacheKey);
        
        if (!deck) {
            // 기본 덱 생성
            deck = Array.from(this.cardDatabase.values());
            deck = await this.shuffleDeck(deck);
            this.boardCache.set(cacheKey, deck);
        }
        
        const drawnCards = deck.splice(0, count);
        this.boardCache.set(cacheKey, deck);
        
        return {
            cards: drawnCards,
            remainingCount: deck.length
        };
    }

    // 카드 효과 계산
    async calculateCardEffectiveness(guardianCard, yokaiCard) {
        const guardian = this.cardDatabase.get(guardianCard.id) || guardianCard;
        const yokai = this.cardDatabase.get(yokaiCard.id) || yokaiCard;
        
        const effectiveness = {
            baseEffectiveness: 0,
            typeBonus: 0,
            powerDifference: 0,
            totalEffectiveness: 0,
            winProbability: 0
        };
        
        // 타입 상성 계산
        if (guardian.effectiveness && guardian.effectiveness.includes(yokai.weakness)) {
            effectiveness.typeBonus = 2.0;
        } else if (guardian.type === yokai.weakness) {
            effectiveness.typeBonus = 1.5;
        } else {
            effectiveness.typeBonus = 0.5;
        }
        
        // 파워 차이 계산
        effectiveness.powerDifference = (guardian.power - yokai.power) * 0.1;
        
        // 전체 효과 계산
        effectiveness.totalEffectiveness = effectiveness.typeBonus + effectiveness.powerDifference;
        
        // 승률 계산
        effectiveness.winProbability = Math.min(
            Math.max(effectiveness.totalEffectiveness * 0.4, 0.1), 
            0.95
        );
        
        return effectiveness;
    }

    // 카드 필터링
    async filterCards(cards, criteria) {
        return cards.filter(card => {
            const cardData = this.cardDatabase.get(card.id) || card;
            
            // 타입 필터
            if (criteria.type && cardData.type !== criteria.type) {
                return false;
            }
            
            // 파워 범위 필터
            if (criteria.minPower && cardData.power < criteria.minPower) {
                return false;
            }
            if (criteria.maxPower && cardData.power > criteria.maxPower) {
                return false;
            }
            
            // 효과 필터
            if (criteria.effect && cardData.effect !== criteria.effect) {
                return false;
            }
            
            return true;
        });
    }

    // 카드 정렬
    async sortCards(cards, sortBy) {
        return cards.sort((a, b) => {
            const cardA = this.cardDatabase.get(a.id) || a;
            const cardB = this.cardDatabase.get(b.id) || b;
            
            switch (sortBy) {
                case 'power':
                    return cardB.power - cardA.power;
                case 'name':
                    return cardA.name.localeCompare(cardB.name);
                case 'type':
                    return cardA.type.localeCompare(cardB.type);
                default:
                    return 0;
            }
        });
    }

    // 카드 조합 유효성 검증
    async validateCardCombination(cards) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            suggestions: []
        };
        
        // 중복 카드 체크
        const cardIds = cards.map(c => c.id);
        const duplicates = cardIds.filter((id, index) => cardIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            validation.errors.push(`중복 카드: ${duplicates.join(', ')}`);
            validation.isValid = false;
        }
        
        // 카드 수 체크
        if (cards.length > 7) {
            validation.warnings.push('카드가 너무 많습니다 (최대 7장 권장)');
        }
        
        // 타입 균형 체크
        const typeCount = {};
        cards.forEach(card => {
            const cardData = this.cardDatabase.get(card.id);
            if (cardData) {
                typeCount[cardData.type] = (typeCount[cardData.type] || 0) + 1;
            }
        });
        
        if (Object.keys(typeCount).length < 2) {
            validation.suggestions.push('다양한 타입의 카드를 조합해보세요');
        }
        
        return validation;
    }

    // 보드 상태 처리
    async processBoardData(operation, data) {
        const startTime = performance.now();
        let result;

        switch (operation) {
            case 'CALCULATE_PATHS':
                result = await this.calculateOptimalPaths(data.startPosition, data.endPosition);
                break;
                
            case 'ANALYZE_ROOM_SAFETY':
                result = await this.analyzeRoomSafety(data.boardState);
                break;
                
            case 'FIND_STRATEGIC_POSITIONS':
                result = await this.findStrategicPositions(data.boardState);
                break;
                
            case 'CALCULATE_DISTANCES':
                result = await this.calculateDistances(data.positions);
                break;
                
            case 'OPTIMIZE_BOARD_LAYOUT':
                result = await this.optimizeBoardLayout(data.boardData);
                break;
                
            default:
                throw new Error(`알 수 없는 보드 작업: ${operation}`);
        }

        const processingTime = performance.now() - startTime;
        
        return {
            type: `${operation}_RESULT`,
            data: {
                result,
                processingTime,
                operation
            }
        };
    }

    // 최적 경로 계산
    async calculateOptimalPaths(startPos, endPos) {
        const paths = [];
        const maxSteps = 6; // 주사위 최대값
        
        // BFS로 가능한 모든 경로 찾기
        const queue = [{ position: startPos, path: [startPos], steps: 0 }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.position === endPos) {
                paths.push({
                    path: current.path,
                    totalSteps: current.steps,
                    efficiency: current.steps / current.path.length
                });
                continue;
            }
            
            if (current.steps >= 20) continue; // 최대 이동 제한
            
            for (let step = 1; step <= maxSteps; step++) {
                const nextPos = (current.position + step) % 25;
                const key = `${nextPos}_${current.steps + 1}`;
                
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        position: nextPos,
                        path: [...current.path, nextPos],
                        steps: current.steps + 1
                    });
                }
            }
            
            // 큰 연산의 경우 중간에 양보
            if (queue.length % 50 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        // 최적 경로 선별
        return paths
            .sort((a, b) => a.totalSteps - b.totalSteps)
            .slice(0, 5); // 상위 5개 경로만 반환
    }

    // 방 안전도 분석
    async analyzeRoomSafety(boardState) {
        const safetyAnalysis = {};
        
        for (let roomId = 0; roomId < 25; roomId++) {
            let safetyScore = 1.0;
            
            // 요괴 방 체크
            if (this.isYokaiRoom(roomId)) {
                safetyScore *= 0.3;
            }
            
            // 특수 방 체크
            if (this.isSpecialRoom(roomId)) {
                safetyScore *= 1.2;
            }
            
            // 플레이어 근접도 체크
            const nearbyPlayers = this.getNearbyPlayers(roomId, boardState.players);
            safetyScore *= Math.max(0.5, 1 - (nearbyPlayers.length * 0.1));
            
            safetyAnalysis[roomId] = {
                score: safetyScore,
                level: this.getSafetyLevel(safetyScore),
                factors: this.getSafetyFactors(roomId, boardState)
            };
        }
        
        return safetyAnalysis;
    }

    // 전략적 위치 찾기
    async findStrategicPositions(boardState) {
        const strategicPositions = [];
        
        for (let roomId = 0; roomId < 25; roomId++) {
            const position = {
                id: roomId,
                strategicValue: 0,
                advantages: [],
                disadvantages: []
            };
            
            // 안전 지대 보너스
            if (this.isSafeZone(roomId)) {
                position.strategicValue += 2;
                position.advantages.push('안전 지대');
            }
            
            // 특수 효과 보너스
            if (this.hasSpecialEffect(roomId)) {
                position.strategicValue += 1.5;
                position.advantages.push('특수 효과');
            }
            
            // 탈출구 근접 보너스
            if (roomId > 20) {
                position.strategicValue += (roomId - 20) * 0.5;
                position.advantages.push('탈출구 근접');
            }
            
            // 요괴 위험 페널티
            if (this.isYokaiRoom(roomId)) {
                position.strategicValue -= 2;
                position.disadvantages.push('요괴 위험');
            }
            
            if (position.strategicValue > 1) {
                strategicPositions.push(position);
            }
        }
        
        return strategicPositions
            .sort((a, b) => b.strategicValue - a.strategicValue)
            .slice(0, 10);
    }

    // 배치 처리
    async processBatch(operations) {
        const results = [];
        
        for (const operation of operations) {
            try {
                let result;
                
                if (operation.category === 'card') {
                    result = await this.processCardData(operation.type, operation.data);
                } else if (operation.category === 'board') {
                    result = await this.processBoardData(operation.type, operation.data);
                }
                
                results.push({
                    operationId: operation.id,
                    status: 'success',
                    result
                });
                
            } catch (error) {
                results.push({
                    operationId: operation.id,
                    status: 'error',
                    error: error.message
                });
            }
            
            // 배치 처리 중 양보
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        return {
            type: 'BATCH_PROCESSED',
            data: {
                results,
                totalOperations: operations.length,
                successCount: results.filter(r => r.status === 'success').length
            }
        };
    }

    // 헬퍼 메서드들
    isYokaiRoom(roomId) {
        const yokaiRooms = [3, 7, 11, 15, 19];
        return yokaiRooms.includes(roomId);
    }

    isSpecialRoom(roomId) {
        const specialRooms = [5, 10, 20];
        return specialRooms.includes(roomId);
    }

    isSafeZone(roomId) {
        const safeZones = [0, 5, 10, 15, 20, 24];
        return safeZones.includes(roomId);
    }

    hasSpecialEffect(roomId) {
        const effectRooms = [2, 6, 12, 18, 22];
        return effectRooms.includes(roomId);
    }

    getNearbyPlayers(roomId, players) {
        return players.filter(player => 
            Math.abs(player.position - roomId) <= 2
        );
    }

    getSafetyLevel(score) {
        if (score >= 0.8) return 'safe';
        if (score >= 0.5) return 'caution';
        return 'danger';
    }

    getSafetyFactors(roomId, boardState) {
        const factors = [];
        
        if (this.isYokaiRoom(roomId)) factors.push('요괴 존재');
        if (this.isSafeZone(roomId)) factors.push('안전 지대');
        if (this.hasSpecialEffect(roomId)) factors.push('특수 효과');
        
        return factors;
    }

    // 성능 메트릭 업데이트
    updatePerformanceMetrics(processingTime) {
        this.performanceMetrics.totalOperations++;
        
        const totalOps = this.performanceMetrics.totalOperations;
        this.performanceMetrics.averageProcessingTime = 
            (this.performanceMetrics.averageProcessingTime * (totalOps - 1) + processingTime) / totalOps;
    }

    // 캐시 정리
    clearCache() {
        this.boardCache.clear();
        
        return {
            type: 'CACHE_CLEARED',
            data: { timestamp: Date.now() }
        };
    }

    // 상태 반환
    getProcessorState() {
        return {
            type: 'PROCESSOR_STATE',
            data: {
                cardDatabaseSize: this.cardDatabase.size,
                cacheSize: this.boardCache.size,
                queueLength: this.processingQueue.length,
                isProcessing: this.isProcessing,
                performanceMetrics: this.performanceMetrics
            }
        };
    }
}

// Worker 인스턴스 생성
const dataProcessor = new DataProcessor();

// 메시지 핸들러
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    let result;
    
    switch (type) {
        case 'PROCESS_CARD_DATA':
            dataProcessor.processCardData(data.operation, data.data)
                .then(result => self.postMessage(result))
                .catch(error => self.postMessage({
                    type: 'ERROR',
                    data: { error: error.message }
                }));
            break;
            
        case 'PROCESS_BOARD_DATA':
            dataProcessor.processBoardData(data.operation, data.data)
                .then(result => self.postMessage(result))
                .catch(error => self.postMessage({
                    type: 'ERROR', 
                    data: { error: error.message }
                }));
            break;
            
        case 'PROCESS_BATCH':
            dataProcessor.processBatch(data.operations)
                .then(result => self.postMessage(result))
                .catch(error => self.postMessage({
                    type: 'ERROR',
                    data: { error: error.message }
                }));
            break;
            
        case 'CLEAR_CACHE':
            result = dataProcessor.clearCache();
            self.postMessage(result);
            break;
            
        case 'GET_PROCESSOR_STATE':
            result = dataProcessor.getProcessorState();
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
    data: { workerType: 'dataProcessor', timestamp: Date.now() }
});