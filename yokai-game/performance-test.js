const { chromium } = require('playwright');

async function performanceTest() {
    console.log('🚀 성능 분석 및 애니메이션 최적화 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100,
        args: [
            '--enable-gpu-rasterization',
            '--enable-oop-rasterization', 
            '--enable-accelerated-video-decode',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding'
        ]
    });
    
    const page = await browser.newPage();
    
    // 성능 메트릭 수집
    await page.evaluateOnNewDocument(() => {
        window.performanceMetrics = {
            frameDrops: 0,
            longTasks: [],
            memoryUsage: [],
            animationFrames: []
        };
        
        // 프레임 드롭 감지
        let lastTime = performance.now();
        const frameChecker = () => {
            const now = performance.now();
            const delta = now - lastTime;
            if (delta > 20) { // 16.67ms 초과 시 프레임 드롭
                window.performanceMetrics.frameDrops++;
            }
            lastTime = now;
            requestAnimationFrame(frameChecker);
        };
        requestAnimationFrame(frameChecker);
        
        // Long Task 감지
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.duration > 50) {
                        window.performanceMetrics.longTasks.push({
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    }
                });
            }).observe({entryTypes: ['longtask']});
        }
        
        // 메모리 사용량 모니터링
        setInterval(() => {
            if (performance.memory) {
                window.performanceMetrics.memoryUsage.push({
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: performance.now()
                });
            }
        }, 1000);
    });
    
    try {
        // 페이지 로드 및 게임 시작
        console.log('📄 게임 로딩...');
        await page.goto('http://localhost:8001');
        await page.waitForTimeout(2000);
        
        // 게임 시작
        const singleModeBtn = await page.$('button[data-mode="single"]');
        if (singleModeBtn) {
            await singleModeBtn.click();
            await page.waitForTimeout(500);
        }
        
        const startBtn = await page.$('#start-game-btn');
        if (startBtn) {
            await startBtn.click();
            await page.waitForTimeout(3000);
        }
        
        console.log('🔍 애니메이션 성능 분석 중...');
        
        // 5초간 성능 데이터 수집
        await page.waitForTimeout(5000);
        
        // 성능 데이터 수집
        const metrics = await page.evaluate(() => {
            const animatedElements = [];
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.animation !== 'none' || style.animationName !== 'none') {
                    const rect = el.getBoundingClientRect();
                    animatedElements.push({
                        tag: el.tagName,
                        class: el.className,
                        animation: style.animation,
                        animationName: style.animationName,
                        animationDuration: style.animationDuration,
                        transform: style.transform,
                        willChange: style.willChange,
                        compositing: style.transform !== 'none' || style.opacity !== '1',
                        visible: rect.width > 0 && rect.height > 0,
                        area: rect.width * rect.height
                    });
                }
            });
            
            return {
                ...window.performanceMetrics,
                animatedElements,
                totalElements: document.querySelectorAll('*').length,
                fps: Math.round(1000 / (performance.now() / window.performanceMetrics.frameDrops || 60))
            };
        });
        
        console.log('\n📊 성능 분석 결과:');
        console.log(`- 총 DOM 요소: ${metrics.totalElements}개`);
        console.log(`- 애니메이션 요소: ${metrics.animatedElements.length}개`);
        console.log(`- 프레임 드롭: ${metrics.frameDrops}회`);
        console.log(`- 장시간 작업: ${metrics.longTasks.length}개`);
        console.log(`- 평균 FPS: ~${60 - Math.min(metrics.frameDrops / 5, 30)}`);
        
        // 메모리 사용량
        if (metrics.memoryUsage.length > 0) {
            const latestMemory = metrics.memoryUsage[metrics.memoryUsage.length - 1];
            console.log(`- 메모리 사용량: ${(latestMemory.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // 성능 문제가 있는 애니메이션 식별
        const problematicAnimations = metrics.animatedElements.filter(el => 
            !el.compositing || el.area > 50000 || el.willChange === 'auto'
        );
        
        console.log(`\n⚠️ 최적화 필요한 애니메이션: ${problematicAnimations.length}개`);
        problematicAnimations.forEach((el, i) => {
            console.log(`${i + 1}. ${el.tag}.${el.class}: ${el.animationName}`);
            console.log(`   - GPU 가속: ${el.compositing ? '✅' : '❌'}`);
            console.log(`   - will-change: ${el.willChange}`);
            console.log(`   - 크기: ${Math.round(el.area)}px²`);
        });
        
        // Long tasks 분석
        if (metrics.longTasks.length > 0) {
            console.log(`\n🐌 장시간 작업 (50ms+):`);
            metrics.longTasks.forEach((task, i) => {
                console.log(`${i + 1}. ${task.name}: ${task.duration.toFixed(2)}ms`);
            });
        }
        
        return metrics;
        
    } catch (error) {
        console.error('❌ 성능 테스트 실패:', error);
    }
    
    await browser.close();
}

performanceTest().catch(console.error);