const { chromium } = require('playwright');

async function simpleTest() {
    console.log('🔍 간단한 게임 로드 테스트...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const page = await browser.newPage();
    
    // 콘솔 메시지 모니터링
    page.on('console', msg => {
        console.log(`브라우저 콘솔 [${msg.type()}]:`, msg.text());
    });
    
    // 에러 모니터링
    page.on('pageerror', error => {
        console.log('❌ 페이지 에러:', error.message);
    });
    
    try {
        await page.goto('http://localhost:8001');
        console.log('✅ 페이지 로드 완료');
        
        // JavaScript 실행 대기
        await page.waitForTimeout(5000);
        
        // DOM 요소 확인
        const title = await page.title();
        console.log('페이지 제목:', title);
        
        // 게임 컨테이너 확인
        const gameContainer = await page.$('#game-container');
        console.log('게임 컨테이너 존재:', gameContainer !== null);
        
        // 스크린샷 저장
        await page.screenshot({ 
            path: 'simple-test-screenshot.png', 
            fullPage: true 
        });
        console.log('📸 스크린샷 저장됨');
        
        // 10초 대기 (수동 확인용)
        console.log('⏳ 10초 대기 중... (수동 확인용)');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
    }
    
    await browser.close();
}

simpleTest().catch(console.error);