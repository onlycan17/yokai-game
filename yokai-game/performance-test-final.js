// 🚀 최종 성능 테스트 및 벤치마크
// 쓰레드 최적화와 애니메이션 성능 개선 검증

const { chromium } = require('playwright');

class PerformanceTestSuite {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            beforeOptimization: {},
            afterOptimization: {},
            threadUtilization: {},
            animationPerformance: {}
        };
    }

    async init() {
        console.log('🚀 성능 테스트 초기화...');
        
        this.browser = await chromium.launch({
            headless: false,
            args: [
                '--enable-gpu',
                '--enable-gpu-compositing',
                '--enable-accelerated-2d-canvas',
                '--enable-webgl',
                '--force-gpu-mem-available-mb=1024'
            ]
        });
        
        this.page = await this.browser.newPage();
        
        // 성능 모니터링 활성화
        await this.page.addInitScript(() => {
            window.performanceMetrics = {
                frameDrops: 0,
                animationFrames: 0,
                gpuMemoryUsed: 0,
                cpuUsage: [],
                threadActivity: []
            };
            
            // 프레임 측정
            let lastFrameTime = performance.now();
            const frameCallback = (currentTime) => {
                const deltaTime = currentTime - lastFrameTime;
                window.performanceMetrics.animationFrames++;
                
                if (deltaTime > 16.67 * 1.5) { // 60fps 기준 프레임 드롭
                    window.performanceMetrics.frameDrops++;
                }
                
                lastFrameTime = currentTime;
                requestAnimationFrame(frameCallback);
            };
            requestAnimationFrame(frameCallback);
            
            // CPU 사용량 모니터링
            setInterval(() => {
                if (performance.memory) {
                    window.performanceMetrics.gpuMemoryUsed = performance.memory.usedJSHeapSize;
                }
                
                // 메인 스레드 활동 측정
                const start = performance.now();
                setTimeout(() => {
                    const threadLatency = performance.now() - start;
                    window.performanceMetrics.threadActivity.push(threadLatency);
                }, 0);
            }, 100);
        });
    }

    async loadGame() {
        console.log('🎮 게임 로딩...');
        await this.page.goto('file://' + process.cwd() + '/index.html');
        await this.page.waitForSelector('#game-board', { timeout: 10000 });
        
        // 게임 초기화 대기
        await this.page.waitForFunction(() => {
            return window.game && window.animationOptimizer;
        }, { timeout: 10000 });
        
        console.log('✅ 게임 로딩 완료');
    }

    async measureBaselinePerformance() {
        console.log('📊 기준 성능 측정 시작...');
        
        // 성능 모드 비활성화로 원래 성능 측정
        await this.page.evaluate(() => {
            if (window.animationOptimizer) {
                window.animationOptimizer.disablePerformanceMode();
            }
        });
        
        await this.page.waitForTimeout(2000); // 안정화 대기
        
        // 성능 메트릭 초기화
        await this.page.evaluate(() => {
            window.performanceMetrics.frameDrops = 0;
            window.performanceMetrics.animationFrames = 0;
            window.performanceMetrics.threadActivity = [];
        });
        
        // 애니메이션 집약적 작업 수행
        await this.simulateGameplay();
        
        const baselineMetrics = await this.page.evaluate(() => {
            return {
                frameDrops: window.performanceMetrics.frameDrops,
                totalFrames: window.performanceMetrics.animationFrames,
                frameDropRate: window.performanceMetrics.frameDrops / window.performanceMetrics.animationFrames,
                memoryUsage: window.performanceMetrics.gpuMemoryUsed,
                avgThreadLatency: window.performanceMetrics.threadActivity.reduce((a, b) => a + b, 0) / window.performanceMetrics.threadActivity.length
            };
        });
        
        this.testResults.beforeOptimization = baselineMetrics;
        console.log('📋 기준 성능:', baselineMetrics);
    }

    async measureOptimizedPerformance() {
        console.log('⚡ 최적화된 성능 측정 시작...');
        
        // 성능 모드 활성화
        await this.page.evaluate(() => {
            if (window.animationOptimizer) {
                window.animationOptimizer.enablePerformanceMode();
            }
        });
        
        await this.page.waitForTimeout(2000); // 안정화 대기
        
        // 성능 메트릭 초기화
        await this.page.evaluate(() => {
            window.performanceMetrics.frameDrops = 0;
            window.performanceMetrics.animationFrames = 0;
            window.performanceMetrics.threadActivity = [];
        });
        
        // 동일한 애니메이션 작업 수행
        await this.simulateGameplay();
        
        const optimizedMetrics = await this.page.evaluate(() => {
            return {
                frameDrops: window.performanceMetrics.frameDrops,
                totalFrames: window.performanceMetrics.animationFrames,
                frameDropRate: window.performanceMetrics.frameDrops / window.performanceMetrics.animationFrames,
                memoryUsage: window.performanceMetrics.gpuMemoryUsed,
                avgThreadLatency: window.performanceMetrics.threadActivity.reduce((a, b) => a + b, 0) / window.performanceMetrics.threadActivity.length,
                animationQueueLength: window.animationOptimizer ? window.animationOptimizer.getPerformanceData().queueLength : 0
            };
        });
        
        this.testResults.afterOptimization = optimizedMetrics;
        console.log('🚀 최적화 성능:', optimizedMetrics);
    }

    async simulateGameplay() {
        console.log('🎲 게임플레이 시뮬레이션...');
        
        // 플레이어 이동 시뮬레이션 (애니메이션 집약적)
        for (let i = 0; i < 10; i++) {
            // 랜덤 방으로 이동
            const roomId = Math.floor(Math.random() * 48) + 1;
            
            await this.page.evaluate((roomId) => {
                if (window.game && window.game.board) {
                    // 플레이어 이동 애니메이션 실행
                    window.game.board.placePlayer(roomId, 1);
                }
            }, roomId);
            
            await this.page.waitForTimeout(500); // 애니메이션 완료 대기
        }
        
        // 카메라 포커스 애니메이션 테스트
        for (let i = 0; i < 5; i++) {
            const roomId = Math.floor(Math.random() * 48) + 1;
            
            await this.page.evaluate((roomId) => {
                if (window.game && window.game.board) {
                    window.game.board.focusOnPlayer(roomId, 1);
                }
            }, roomId);
            
            await this.page.waitForTimeout(800);
        }
        
        // 수호신 카드 애니메이션 테스트
        await this.page.evaluate(() => {
            const cards = document.querySelectorAll('.guardian-deck-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.dispatchEvent(new Event('mouseenter'));
                    setTimeout(() => {
                        card.dispatchEvent(new Event('mouseleave'));
                    }, 200);
                }, index * 100);
            });
        });
        
        await this.page.waitForTimeout(2000);
        
        console.log('✅ 게임플레이 시뮬레이션 완료');
    }

    async measureThreadUtilization() {
        console.log('🧵 스레드 활용도 측정...');
        
        const threadMetrics = await this.page.evaluate(() => {
            const hardwareConcurrency = navigator.hardwareConcurrency || 4;
            const deviceMemory = navigator.deviceMemory || 4;
            
            // 애니메이션 최적화 상태 확인
            const optimizerState = window.animationOptimizer ? {
                isPerformanceMode: window.animationOptimizer.isPerformanceMode,
                queueLength: window.animationOptimizer.animationQueue.length,
                frameDrops: window.animationOptimizer.performanceData.frameDrops
            } : null;
            
            return {
                availableCores: hardwareConcurrency,
                availableMemory: deviceMemory,
                optimizerActive: !!window.animationOptimizer,
                optimizerState: optimizerState,
                gpuAcceleration: {
                    webgl: !!window.WebGLRenderingContext,
                    webgl2: !!window.WebGL2RenderingContext
                }
            };
        });
        
        this.testResults.threadUtilization = threadMetrics;
        console.log('🔧 스레드 활용도:', threadMetrics);
    }

    async generateReport() {
        console.log('📊 성능 리포트 생성 중...');
        
        const improvementRate = {
            frameDropReduction: ((this.testResults.beforeOptimization.frameDropRate - this.testResults.afterOptimization.frameDropRate) / this.testResults.beforeOptimization.frameDropRate * 100).toFixed(2),
            memoryImprovement: ((this.testResults.beforeOptimization.memoryUsage - this.testResults.afterOptimization.memoryUsage) / this.testResults.beforeOptimization.memoryUsage * 100).toFixed(2),
            threadLatencyImprovement: ((this.testResults.beforeOptimization.avgThreadLatency - this.testResults.afterOptimization.avgThreadLatency) / this.testResults.beforeOptimization.avgThreadLatency * 100).toFixed(2)
        };
        
        const report = `
🚀 요괴의 성 탈출 게임 성능 최적화 결과 리포트
=====================================================

📊 기준 성능 (최적화 전)
- 프레임 드롭률: ${(this.testResults.beforeOptimization.frameDropRate * 100).toFixed(2)}%
- 평균 스레드 지연시간: ${this.testResults.beforeOptimization.avgThreadLatency.toFixed(2)}ms
- 메모리 사용량: ${(this.testResults.beforeOptimization.memoryUsage / 1024 / 1024).toFixed(2)}MB

⚡ 최적화된 성능 (최적화 후)
- 프레임 드롭률: ${(this.testResults.afterOptimization.frameDropRate * 100).toFixed(2)}%
- 평균 스레드 지연시간: ${this.testResults.afterOptimization.avgThreadLatency.toFixed(2)}ms
- 메모리 사용량: ${(this.testResults.afterOptimization.memoryUsage / 1024 / 1024).toFixed(2)}MB
- 애니메이션 큐 길이: ${this.testResults.afterOptimization.animationQueueLength}

📈 성능 개선율
- 프레임 드롭 감소: ${improvementRate.frameDropReduction}%
- 메모리 사용량 개선: ${improvementRate.memoryImprovement}%
- 스레드 지연시간 개선: ${improvementRate.threadLatencyImprovement}%

🧵 스레드 활용 현황
- 사용 가능한 CPU 코어: ${this.testResults.threadUtilization.availableCores}개
- 사용 가능한 메모리: ${this.testResults.threadUtilization.availableMemory}GB
- 애니메이션 최적화 활성화: ${this.testResults.threadUtilization.optimizerActive ? '✅' : '❌'}
- WebGL 가속: ${this.testResults.threadUtilization.gpuAcceleration.webgl ? '✅' : '❌'}
- WebGL2 가속: ${this.testResults.threadUtilization.gpuAcceleration.webgl2 ? '✅' : '❌'}

🎯 최적화 적용 기술
✅ GPU 하드웨어 가속 (transform: translate3d)
✅ CSS Containment (contain: layout style paint)
✅ will-change 속성 최적화
✅ 애니메이션 큐잉 시스템
✅ 성능 모니터링 및 적응형 렌더링
✅ 메모리 사용량 기반 성능 모드 전환
✅ 프레임 드롭 감지 및 대응

📝 권장사항
${improvementRate.frameDropReduction > 30 ? '✅ 프레임 드롭이 크게 개선되었습니다!' : '⚠️  추가 최적화가 필요할 수 있습니다.'}
${improvementRate.memoryImprovement > 0 ? '✅ 메모리 사용량이 최적화되었습니다!' : '⚠️  메모리 사용량 추가 확인이 필요합니다.'}
${this.testResults.threadUtilization.optimizerActive ? '✅ 애니메이션 최적화가 정상 작동합니다!' : '❌ 애니메이션 최적화 시스템을 확인하세요.'}

최종 평가: ${improvementRate.frameDropReduction > 20 && improvementRate.threadLatencyImprovement > 10 ? '🎉 최적화 성공!' : '🔧 추가 튜닝 권장'}
`;
        
        console.log(report);
        
        // 리포트 파일 저장
        const fs = require('fs');
        fs.writeFileSync('performance-report.txt', report);
        
        return report;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// 테스트 실행
(async () => {
    const tester = new PerformanceTestSuite();
    
    try {
        await tester.init();
        await tester.loadGame();
        
        console.log('🔄 성능 테스트 시작...\n');
        
        await tester.measureBaselinePerformance();
        await tester.measureOptimizedPerformance();
        await tester.measureThreadUtilization();
        
        console.log('\n📊 최종 리포트 생성...');
        await tester.generateReport();
        
        console.log('\n✅ 성능 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await tester.cleanup();
    }
})();