const { chromium } = require('playwright');

async function testGame() {
    console.log('🚀 요괴 게임 버그 테스트 시작...');
    
    // 브라우저 실행
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 테스트 속도 조절
    });
    
    const context = await browser.newContext({
        viewport: { width: 1600, height: 1200 }
    });
    
    const page = await context.newPage();
    
    try {
        // 게임 페이지 로드
        console.log('📄 게임 페이지 로딩...');
        await page.goto('http://localhost:8001');
        
        // 페이지 로드 대기
        await page.waitForTimeout(3000);
        
        // 초기 상태 확인
        console.log('🔍 초기 상태 확인...');
        
        // 게임 보드 존재 확인
        const gameBoard = await page.locator('#game-board').isVisible();
        console.log(`게임 보드 표시: ${gameBoard ? '✅' : '❌'}`);
        
        // 플레이어 말 존재 확인
        const playerPiece = await page.locator('.player-piece').first().isVisible();
        console.log(`플레이어 말 표시: ${playerPiece ? '✅' : '❌'}`);
        
        // 수호신 덱 확인
        const guardianDeck = await page.locator('.guardian-deck-area').isVisible();
        console.log(`수호신 덱 표시: ${guardianDeck ? '✅' : '❌'}`);
        
        // 스크린샷 찍기
        await page.screenshot({ path: 'game-initial-state.png', fullPage: true });
        console.log('📸 초기 상태 스크린샷 저장됨');
        
        // 콘솔 에러 모니터링
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
                console.log('❌ 콘솔 에러:', msg.text());
            }
        });
        
        // 플레이어 말 클릭 테스트
        console.log('🎮 플레이어 말 클릭 테스트...');
        const playerPieceElement = page.locator('.player-piece').first();
        if (await playerPieceElement.isVisible()) {
            await playerPieceElement.click();
            console.log('✅ 플레이어 말 클릭 성공');
        }
        
        // 방 클릭 테스트
        console.log('🏠 방 클릭 테스트...');
        const rooms = page.locator('.board-room');
        const roomCount = await rooms.count();
        console.log(`총 방 개수: ${roomCount}`);
        
        if (roomCount > 0) {
            // 첫 번째 방 클릭
            await rooms.first().click();
            console.log('✅ 방 클릭 성공');
            await page.waitForTimeout(1000);
        }
        
        // 카드 덱 확인
        console.log('🎴 카드 덱 확인...');
        const cards = page.locator('.card');
        const cardCount = await cards.count();
        console.log(`표시된 카드 수: ${cardCount}`);
        
        // 수호신 카드 클릭 테스트
        console.log('🛡️ 수호신 카드 클릭 테스트...');
        const guardianCards = page.locator('.guardian-deck-card');
        const guardianCardCount = await guardianCards.count();
        console.log(`수호신 카드 수: ${guardianCardCount}`);
        
        if (guardianCardCount > 0) {
            await guardianCards.first().click();
            console.log('✅ 수호신 카드 클릭 성공');
            await page.waitForTimeout(1000);
        }
        
        // 애니메이션 확인
        console.log('✨ 애니메이션 확인...');
        const animatedElements = await page.$eval('*', () => {
            const elements = document.querySelectorAll('*');
            let animatedCount = 0;
            elements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.animation !== 'none' || style.animationName !== 'none') {
                    animatedCount++;
                }
            });
            return animatedCount;
        });
        console.log(`애니메이션이 적용된 요소 수: ${animatedElements}`);
        
        // 최종 스크린샷
        await page.screenshot({ path: 'game-final-state.png', fullPage: true });
        console.log('📸 최종 상태 스크린샷 저장됨');
        
        // 결과 요약
        console.log('\n📋 테스트 결과 요약:');
        console.log(`- 게임 보드: ${gameBoard ? '정상' : '오류'}`);
        console.log(`- 플레이어 말: ${playerPiece ? '정상' : '오류'}`);
        console.log(`- 수호신 덱: ${guardianDeck ? '정상' : '오류'}`);
        console.log(`- 방 개수: ${roomCount}`);
        console.log(`- 카드 수: ${cardCount}`);
        console.log(`- 수호신 카드 수: ${guardianCardCount}`);
        console.log(`- 애니메이션 요소: ${animatedElements}`);
        console.log(`- 콘솔 에러 수: ${errors.length}`);
        
        if (errors.length > 0) {
            console.log('\n❌ 발견된 에러들:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
    }
    
    // 5초 후 브라우저 종료
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('🎯 테스트 완료!');
}

testGame().catch(console.error);