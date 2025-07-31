// 🚀 Web Workers 성능 벤치마크 및 테스트 시스템
// 병렬 처리 시스템의 성능을 측정하고 최적화 지점을 찾는 도구

import asyncGameController from './asyncGameController.js';
import workerManager from './workerManager.js';

class PerformanceBenchmark {
    constructor() {
        this.benchmarkResults = new Map();
        this.isRunning = false;
        this.currentTest = null;
        
        // 테스트 설정
        this.testConfigs = {
            cardProcessing: {
                name: '카드 처리 성능',
                iterations: 100,
                operations: ['shuffle', 'draw', 'effectiveness'],
                dataSize: [10, 50, 100, 500]
            },
            boardAnalysis: {
                name: '보드 분석 성능',
                iterations: 50,
                operations: ['pathfinding', 'safety', 'strategic'],
                dataSize: [25, 100, 225] // 5x5, 10x10, 15x15 보드
            },
            eventProcessing: {
                name: '이벤트 처리 성능',
                iterations: 200,
                operations: ['single', 'batch', 'parallel'],
                eventCounts: [1, 10, 50, 100]
            },
            animationRendering: {
                name: '애니메이션 렌더링 성능',
                iterations: 60,
                operations: ['simple', 'complex', 'timeline'],
                animationCounts: [1, 5, 10, 20]
            }
        };
        
        // 성능 임계값
        this.performanceThresholds = {
            excellent: { responseTime: 16, throughput: 60 }, // 60fps
            good: { responseTime: 33, throughput: 30 },      // 30fps
            acceptable: { responseTime: 50, throughput: 20 }, // 20fps
            poor: { responseTime: 100, throughput: 10 }      // 10fps
        };
    }

    // 전체 벤치마크 실행
    async runFullBenchmark() {
        if (this.isRunning) {
            console.warn('⚠️ 이미 벤치마크가 실행 중입니다');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Web Workers 성능 벤치마크 시작');
        
        try {
            // Workers 초기화 확인
            await this.ensureWorkersInitialized();
            
            const startTime = Date.now();
            const results = {};

            // 카드 처리 성능 테스트
            console.log('📊 카드 처리 성능 테스트 시작...');
            results.cardProcessing = await this.benchmarkCardProcessing();

            // 보드 분석 성능 테스트
            console.log('📊 보드 분석 성능 테스트 시작...');
            results.boardAnalysis = await this.benchmarkBoardAnalysis();

            // 이벤트 처리 성능 테스트
            console.log('📊 이벤트 처리 성능 테스트 시작...');
            results.eventProcessing = await this.benchmarkEventProcessing();

            // 애니메이션 렌더링 성능 테스트
            console.log('📊 애니메이션 렌더링 성능 테스트 시작...');
            results.animationRendering = await this.benchmarkAnimationRendering();

            const totalTime = Date.now() - startTime;

            // 결과 분석 및 보고서 생성
            const report = this.generatePerformanceReport(results, totalTime);
            
            console.log('✅ 벤치마크 완료');
            console.log(report.summary);

            return report;

        } catch (error) {
            console.error('❌ 벤치마크 실행 실패:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    // Workers 초기화 확인
    async ensureWorkersInitialized() {
        if (!asyncGameController.initialized) {
            console.log('🔧 AsyncGameController 초기화 중...');
            await asyncGameController.initialize();
        }

        // Worker 상태 확인
        const workerStatus = workerManager.getWorkerStatus();
        const requiredWorkers = ['gameLogic', 'animation', 'dataProcessor'];
        
        for (const workerName of requiredWorkers) {
            if (!workerStatus[workerName] || !workerStatus[workerName].isReady) {
                throw new Error(`${workerName} Worker가 준비되지 않음`);
            }
        }

        console.log('✅ 모든 Workers 준비 완료');
    }

    // 카드 처리 성능 벤치마크
    async benchmarkCardProcessing() {
        const config = this.testConfigs.cardProcessing;
        const results = {};

        for (const operation of config.operations) {
            results[operation] = {};
            
            for (const dataSize of config.dataSize) {
                console.log(`  🎴 ${operation} 테스트 (데이터 크기: ${dataSize})`);
                
                const testResults = [];
                
                for (let i = 0; i < config.iterations; i++) {
                    const testData = this.generateCardTestData(dataSize);
                    const startTime = performance.now();
                    
                    try {
                        await this.executeCardOperation(operation, testData);
                        const endTime = performance.now();
                        testResults.push(endTime - startTime);
                    } catch (error) {
                        console.error(`카드 처리 테스트 실패: ${operation}`, error);
                        testResults.push(null);
                    }
                    
                    // 부하 분산을 위한 짧은 대기
                    if (i % 10 === 9) {
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                }
                
                results[operation][dataSize] = this.analyzeTestResults(testResults);
            }
        }

        return results;
    }

    // 보드 분석 성능 벤치마크
    async benchmarkBoardAnalysis() {
        const config = this.testConfigs.boardAnalysis;
        const results = {};

        for (const operation of config.operations) {
            results[operation] = {};
            
            for (const boardSize of config.dataSize) {
                console.log(`  🗺️ ${operation} 테스트 (보드 크기: ${boardSize})`);
                
                const testResults = [];
                
                for (let i = 0; i < config.iterations; i++) {
                    const boardData = this.generateBoardTestData(boardSize);
                    const startTime = performance.now();
                    
                    try {
                        await this.executeBoardOperation(operation, boardData);
                        const endTime = performance.now();
                        testResults.push(endTime - startTime);
                    } catch (error) {
                        console.error(`보드 분석 테스트 실패: ${operation}`, error);
                        testResults.push(null);
                    }
                    
                    if (i % 5 === 4) {
                        await new Promise(resolve => setTimeout(resolve, 20));
                    }
                }
                
                results[operation][boardSize] = this.analyzeTestResults(testResults);
            }
        }

        return results;
    }

    // 이벤트 처리 성능 벤치마크
    async benchmarkEventProcessing() {
        const config = this.testConfigs.eventProcessing;
        const results = {};

        for (const operation of config.operations) {
            results[operation] = {};
            
            for (const eventCount of config.eventCounts) {
                console.log(`  ⚡ ${operation} 테스트 (이벤트 수: ${eventCount})`);
                
                const testResults = [];
                
                for (let i = 0; i < config.iterations; i++) {
                    const events = this.generateEventTestData(eventCount);
                    const startTime = performance.now();
                    
                    try {
                        await this.executeEventOperation(operation, events);
                        const endTime = performance.now();
                        testResults.push(endTime - startTime);
                    } catch (error) {
                        console.error(`이벤트 처리 테스트 실패: ${operation}`, error);
                        testResults.push(null);
                    }
                    
                    if (i % 20 === 19) {
                        await new Promise(resolve => setTimeout(resolve, 5));
                    }
                }
                
                results[operation][eventCount] = this.analyzeTestResults(testResults);
            }
        }

        return results;
    }

    // 애니메이션 렌더링 성능 벤치마크
    async benchmarkAnimationRendering() {
        const config = this.testConfigs.animationRendering;
        const results = {};

        for (const operation of config.operations) {
            results[operation] = {};
            
            for (const animCount of config.animationCounts) {
                console.log(`  🎬 ${operation} 테스트 (애니메이션 수: ${animCount})`);
                
                const testResults = [];
                
                for (let i = 0; i < config.iterations; i++) {
                    const animations = this.generateAnimationTestData(operation, animCount);
                    const startTime = performance.now();
                    
                    try {
                        await this.executeAnimationOperation(operation, animations);
                        const endTime = performance.now();
                        testResults.push(endTime - startTime);
                    } catch (error) {
                        console.error(`애니메이션 테스트 실패: ${operation}`, error);
                        testResults.push(null);
                    }
                    
                    if (i % 15 === 14) {
                        await new Promise(resolve => setTimeout(resolve, 30));
                    }
                }
                
                results[operation][animCount] = this.analyzeTestResults(testResults);
            }
        }

        return results;
    }

    // 테스트 데이터 생성 메서드들
    generateCardTestData(size) {
        const cards = [];
        const cardTypes = ['yokai', 'guardian', 'item'];
        
        for (let i = 0; i < size; i++) {
            cards.push({
                id: `test_${i}`,
                type: cardTypes[i % cardTypes.length],
                power: Math.floor(Math.random() * 5) + 1,
                weakness: cardTypes[(i + 1) % cardTypes.length]
            });
        }
        
        return cards;
    }

    generateBoardTestData(size) {
        const rooms = [];
        const players = [];
        
        // 보드 방 생성
        for (let i = 0; i < size; i++) {
            rooms.push({
                id: i,
                hasYokai: Math.random() < 0.2,
                isSafeZone: Math.random() < 0.15,
                hasSpecialEffect: Math.random() < 0.1
            });
        }
        
        // 플레이어 생성
        const playerCount = Math.min(4, Math.floor(size / 6));
        for (let i = 0; i < playerCount; i++) {
            players.push({
                id: i,
                position: Math.floor(Math.random() * size),
                isAI: i > 0
            });
        }
        
        return { rooms, players };
    }

    generateEventTestData(count) {
        const eventTypes = ['PLAYER_MOVE', 'CARD_DRAW', 'BATTLE_START', 'UI_UPDATE'];
        const events = [];
        
        for (let i = 0; i < count; i++) {
            events.push({
                id: `event_${i}`,
                type: eventTypes[i % eventTypes.length],
                data: { playerId: i % 2, value: Math.random() },
                priority: i % 3 === 0 ? 'high' : 'normal'
            });
        }
        
        return events;
    }

    generateAnimationTestData(type, count) {
        const animations = [];
        
        for (let i = 0; i < count; i++) {
            let animData = {
                id: `anim_${i}`,
                duration: 300 + Math.random() * 700,
                easing: 'easeOutQuad'
            };
            
            switch (type) {
                case 'simple':
                    animData.type = 'MOVE';
                    animData.startState = { x: 0, y: 0 };
                    animData.endState = { x: 100, y: 100 };
                    break;
                    
                case 'complex':
                    animData.type = 'COMPLEX';
                    animData.keyframes = [
                        { opacity: 0, scale: 0.5, rotation: 0 },
                        { opacity: 0.5, scale: 1.2, rotation: 180 },
                        { opacity: 1, scale: 1, rotation: 360 }
                    ];
                    break;
                    
                case 'timeline':
                    animData = {
                        id: `timeline_${i}`,
                        duration: 1000,
                        animations: [
                            { delay: 0, duration: 300, type: 'FADE' },
                            { delay: 200, duration: 400, type: 'SCALE' },
                            { delay: 500, duration: 300, type: 'MOVE' }
                        ]
                    };
                    break;
            }
            
            animations.push(animData);
        }
        
        return animations;
    }

    // 테스트 실행 메서드들
    async executeCardOperation(operation, testData) {
        switch (operation) {
            case 'shuffle':
                return await workerManager.shuffleDeck(testData);
                
            case 'draw':
                // 먼저 덱을 생성하고 카드 뽑기
                const deckId = 'test_deck_' + Date.now();
                return await workerManager.drawCards(deckId, Math.min(5, testData.length));
                
            case 'effectiveness':
                if (testData.length >= 2) {
                    return await workerManager.calculateCardEffectiveness(testData[0], testData[1]);
                }
                break;
        }
    }

    async executeBoardOperation(operation, boardData) {
        switch (operation) {
            case 'pathfinding':
                const startPos = Math.floor(Math.random() * boardData.rooms.length);
                const endPos = Math.floor(Math.random() * boardData.rooms.length);
                return await workerManager.calculateOptimalPaths(startPos, endPos);
                
            case 'safety':
                return await workerManager.analyzeRoomSafety(boardData);
                
            case 'strategic':
                return await workerManager.findStrategicPositions(boardData);
        }
    }

    async executeEventOperation(operation, events) {
        switch (operation) {
            case 'single':
                // 순차 처리
                for (const event of events) {
                    asyncGameController.queueEvent(event.type, event.data, event.priority);
                }
                break;
                
            case 'batch':
                // 배치 처리
                const operations = events.map((event, index) => ({
                    id: `batch_${index}`,
                    category: 'card',
                    type: 'SHUFFLE_DECK',
                    data: { cards: [] }
                }));
                return await workerManager.processBatchOperations(operations);
                
            case 'parallel':
                // 병렬 처리
                const promises = events.map(event => 
                    new Promise(resolve => {
                        asyncGameController.queueEvent(event.type, event.data, event.priority);
                        resolve();
                    })
                );
                return await Promise.all(promises);
        }
    }

    async executeAnimationOperation(operation, animations) {
        switch (operation) {
            case 'simple':
            case 'complex':
                const promises = animations.map(anim => workerManager.addAnimation(anim));
                return await Promise.all(promises);
                
            case 'timeline':
                const timelinePromises = animations.map(timeline => 
                    workerManager.createTimeline(timeline)
                );
                return await Promise.all(timelinePromises);
        }
    }

    // 테스트 결과 분석
    analyzeTestResults(results) {
        const validResults = results.filter(r => r !== null);
        
        if (validResults.length === 0) {
            return {
                avg: 0,
                min: 0,
                max: 0,
                median: 0,
                p95: 0,
                p99: 0,
                successRate: 0,
                throughput: 0
            };
        }
        
        validResults.sort((a, b) => a - b);
        
        const avg = validResults.reduce((sum, val) => sum + val, 0) / validResults.length;
        const min = validResults[0];
        const max = validResults[validResults.length - 1];
        const median = validResults[Math.floor(validResults.length / 2)];
        const p95 = validResults[Math.floor(validResults.length * 0.95)];
        const p99 = validResults[Math.floor(validResults.length * 0.99)];
        const successRate = (validResults.length / results.length) * 100;
        const throughput = avg > 0 ? 1000 / avg : 0;
        
        return {
            avg: Math.round(avg * 100) / 100,
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            median: Math.round(median * 100) / 100,
            p95: Math.round(p95 * 100) / 100,
            p99: Math.round(p99 * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            throughput: Math.round(throughput * 100) / 100
        };
    }

    // 성능 보고서 생성
    generatePerformanceReport(results, totalTime) {
        const report = {
            timestamp: new Date().toISOString(),
            totalExecutionTime: totalTime,
            summary: {},
            details: results,
            recommendations: []
        };

        // 전체 성능 등급 계산
        let overallScore = 0;
        let categoryCount = 0;

        for (const [category, categoryResults] of Object.entries(results)) {
            const categoryScore = this.calculateCategoryScore(categoryResults);
            report.summary[category] = {
                score: categoryScore,
                grade: this.getPerformanceGrade(categoryScore)
            };
            
            overallScore += categoryScore;
            categoryCount++;
        }

        report.summary.overall = {
            score: overallScore / categoryCount,
            grade: this.getPerformanceGrade(overallScore / categoryCount)
        };

        // 추천사항 생성
        report.recommendations = this.generateRecommendations(results);

        // 콘솔 출력용 요약
        report.consoleOutput = this.formatConsoleOutput(report);

        return report;
    }

    calculateCategoryScore(categoryResults) {
        let totalScore = 0;
        let testCount = 0;

        for (const [operation, operationResults] of Object.entries(categoryResults)) {
            for (const [dataSize, testResult] of Object.entries(operationResults)) {
                if (testResult.avg > 0) {
                    // 응답 시간 기반 점수 (낮을수록 좋음)
                    let score = 100;
                    if (testResult.avg > this.performanceThresholds.poor.responseTime) {
                        score = 20;
                    } else if (testResult.avg > this.performanceThresholds.acceptable.responseTime) {
                        score = 50;
                    } else if (testResult.avg > this.performanceThresholds.good.responseTime) {
                        score = 75;
                    }
                    
                    // 성공률 반영
                    score *= (testResult.successRate / 100);
                    
                    totalScore += score;
                    testCount++;
                }
            }
        }

        return testCount > 0 ? totalScore / testCount : 0;
    }

    getPerformanceGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B+';
        if (score >= 60) return 'B';
        if (score >= 50) return 'C';
        return 'D';
    }

    generateRecommendations(results) {
        const recommendations = [];

        // 카드 처리 성능 분석
        if (results.cardProcessing) {
            const cardAvg = this.getAverageResponseTime(results.cardProcessing);
            if (cardAvg > 50) {
                recommendations.push({
                    category: 'cardProcessing',
                    priority: 'high',
                    message: '카드 처리 성능이 저하되었습니다. 카드 데이터 캐싱을 고려하세요.'
                });
            }
        }

        // 보드 분석 성능 분석
        if (results.boardAnalysis) {
            const boardAvg = this.getAverageResponseTime(results.boardAnalysis);
            if (boardAvg > 100) {
                recommendations.push({
                    category: 'boardAnalysis',
                    priority: 'medium',
                    message: '보드 분석이 느립니다. 알고리즘 최적화나 결과 캐싱을 검토하세요.'
                });
            }
        }

        // 메모리 사용량 추천
        recommendations.push({
            category: 'memory',
            priority: 'low',
            message: '정기적으로 Worker 캐시를 정리하여 메모리 사용량을 최적화하세요.'
        });

        return recommendations;
    }

    getAverageResponseTime(categoryResults) {
        let totalTime = 0;
        let count = 0;

        for (const operationResults of Object.values(categoryResults)) {
            for (const testResult of Object.values(operationResults)) {
                if (testResult.avg > 0) {
                    totalTime += testResult.avg;
                    count++;
                }
            }
        }

        return count > 0 ? totalTime / count : 0;
    }

    formatConsoleOutput(report) {
        let output = '\n📊 Web Workers 성능 벤치마크 결과\n';
        output += '='.repeat(50) + '\n\n';

        // 전체 결과
        output += `⏱️  총 실행 시간: ${report.totalExecutionTime}ms\n`;
        output += `🏆 전체 성능 등급: ${report.summary.overall.grade} (${Math.round(report.summary.overall.score)}점)\n\n`;

        // 카테고리별 결과
        for (const [category, summary] of Object.entries(report.summary)) {
            if (category !== 'overall') {
                const config = this.testConfigs[category];
                output += `${this.getCategoryIcon(category)} ${config?.name || category}: ${summary.grade} (${Math.round(summary.score)}점)\n`;
            }
        }

        // 추천사항
        if (report.recommendations.length > 0) {
            output += '\n💡 개선 추천사항:\n';
            report.recommendations.forEach((rec, index) => {
                const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
                output += `   ${priority} ${rec.message}\n`;
            });
        }

        output += '\n' + '='.repeat(50);

        return output;
    }

    getCategoryIcon(category) {
        const icons = {
            cardProcessing: '🎴',
            boardAnalysis: '🗺️',
            eventProcessing: '⚡',
            animationRendering: '🎬'
        };
        return icons[category] || '📊';
    }

    // 실시간 성능 모니터링
    startPerformanceMonitoring(interval = 5000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            const metrics = this.collectRealTimeMetrics();
            console.log('📈 실시간 성능 메트릭:', metrics);
        }, interval);

        console.log(`🔍 실시간 성능 모니터링 시작 (${interval}ms 간격)`);
    }

    stopPerformanceMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('⏹️ 실시간 성능 모니터링 중지');
        }
    }

    collectRealTimeMetrics() {
        const workerMetrics = workerManager.getPerformanceMetrics();
        const gameMetrics = asyncGameController.getPerformanceMetrics();
        
        return {
            workers: workerMetrics,
            eventQueue: gameMetrics.queueLength,
            averageEventTime: gameMetrics.averageEventTime,
            concurrentActions: gameMetrics.concurrentActions,
            timestamp: Date.now()
        };
    }
}

// 전역 인스턴스 생성
const performanceBenchmark = new PerformanceBenchmark();

// 전역 접근을 위한 window 객체에 등록
if (typeof window !== 'undefined') {
    window.performanceBenchmark = performanceBenchmark;
}

export default performanceBenchmark;