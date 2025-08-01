const { chromium } = require('playwright');

async function testGameStartScreen() {
    console.log('🚀 게임 시작 화면 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // 게임 페이지 로드
        console.log('📄 게임 페이지 로딩...');
        await page.goto('http://localhost:3001');
        
        // 페이지 로드 대기
        await page.waitForTimeout(2000);
        
        // 시작 화면 확인
        console.log('🔍 시작 화면 확인...');
        
        const startScreen = await page.locator('#start-screen').isVisible();
        console.log(`시작 화면 표시: ${startScreen ? '✅' : '❌'}`);
        
        if (startScreen) {
            // 게임 모드 버튼들 확인
            const singleBtn = await page.locator('[data-mode="single"]').isVisible();
            const aiBtn = await page.locator('[data-mode="vs_ai"]').isVisible();
            const playerBtn = await page.locator('[data-mode="vs_player"]').isVisible();
            
            console.log(`싱글 플레이 버튼: ${singleBtn ? '✅' : '❌'}`);
            console.log(`컴퓨터 대전 버튼: ${aiBtn ? '✅' : '❌'}`);
            console.log(`플레이어 대전 버튼: ${playerBtn ? '✅' : '❌'}`);
            
            // 스크린샷 찍기
            await page.screenshot({ path: 'start-screen-test.png', fullPage: true });
            console.log('📸 시작 화면 스크린샷 저장됨');
            
            // 싱글 플레이 버튼 클릭 테스트
            if (singleBtn) {
                console.log('🎮 싱글 플레이 버튼 클릭...');
                await page.click('[data-mode="single"]');
                await page.waitForTimeout(2000);
                
                // 게임 화면으로 전환되었는지 확인
                const gameBoard = await page.locator('#game-board').isVisible();
                const startScreenAfter = await page.locator('#start-screen').isVisible();
                
                console.log(`게임 보드 표시: ${gameBoard ? '✅' : '❌'}`);
                console.log(`시작 화면 숨김: ${!startScreenAfter ? '✅' : '❌'}`);
                
                // 게임 화면 스크린샷
                await page.screenshot({ path: 'game-screen-test.png', fullPage: true });
                console.log('📸 게임 화면 스크린샷 저장됨');
            }
        }
        
        // 콘솔 에러 확인
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ 콘솔 에러:', msg.text());
            }
        });
        
        // 결과 요약
        console.log('\n📋 테스트 결과:');
        console.log(`- 시작 화면: ${startScreen ? '정상' : '오류'}`);
        console.log(`- 콘솔 에러 수: ${errors.length}`);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
    }
    
    // 5초 후 브라우저 종료
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('🎯 테스트 완료!');
}

testGameStartScreen().catch(console.error);