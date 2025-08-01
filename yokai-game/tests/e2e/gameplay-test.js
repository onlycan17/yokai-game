const { chromium } = require('playwright');

async function testGameplayFeatures() {
    console.log('🎮 게임 기능 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // 게임 페이지 로드
        console.log('📄 게임 페이지 로딩...');
        await page.goto('http://localhost:3001');
        await page.waitForTimeout(2000);
        
        // 시작 화면에서 싱글 플레이 선택
        console.log('🎯 싱글 플레이 모드 선택...');
        const singleBtn = await page.locator('[data-mode="single"]').isVisible();
        if (singleBtn) {
            await page.click('[data-mode="single"]');
            await page.waitForTimeout(2000);
            console.log('✅ 게임 화면으로 전환됨');
            
            // 게임 화면 스크린샷
            await page.screenshot({ path: 'gameplay-start.png', fullPage: true });
            console.log('📸 게임 시작 화면 저장됨');
        }
        
        // 1. 주사위 굴리기 테스트
        console.log('\n🎲 주사위 굴리기 테스트...');
        const rollDiceBtn = await page.locator('#roll-dice').isVisible();
        if (rollDiceBtn) {
            // 주사위 굴리기 전 상태 확인
            const diceBefore = await page.locator('#dice-result').textContent();
            console.log(`  주사위 굴리기 전: ${diceBefore}`);
            
            await page.click('#roll-dice');
            await page.waitForTimeout(1500);
            
            // 주사위 굴리기 후 상태 확인
            const diceAfter = await page.locator('#dice-result').textContent();
            console.log(`  주사위 굴리기 후: ${diceAfter}`);
            
            const diceChanged = diceBefore !== diceAfter;
            console.log(`  주사위 변경: ${diceChanged ? '✅' : '❌'}`);
            
            await page.screenshot({ path: 'gameplay-dice.png', fullPage: true });
            console.log('  📸 주사위 굴리기 스크린샷 저장됨');
        }
        
        // 2. 이동하기 버튼 테스트
        console.log('\n🚶 이동하기 버튼 테스트...');
        const moveBtn = await page.locator('#move-player').isVisible();
        if (moveBtn) {
            // 플레이어 위치 확인
            const positionBefore = await page.locator('#player-position').textContent();
            console.log(`  이동 전 위치: ${positionBefore}`);
            
            await page.click('#move-player');
            await page.waitForTimeout(2000);
            
            const positionAfter = await page.locator('#player-position').textContent();
            console.log(`  이동 후 위치: ${positionAfter}`);
            
            await page.screenshot({ path: 'gameplay-move.png', fullPage: true });
            console.log('  📸 이동 후 스크린샷 저장됨');
        }
        
        // 3. 카드 사용 버튼 테스트
        console.log('\n🃏 카드 사용 버튼 테스트...');
        const useCardBtn = await page.locator('#use-card').isVisible();
        if (useCardBtn) {
            // 손패 카드 수 확인
            const cardsBefore = await page.locator('#player-cards').textContent();
            console.log(`  카드 사용 전: ${cardsBefore}`);
            
            await page.click('#use-card');
            await page.waitForTimeout(1500);
            
            const cardsAfter = await page.locator('#player-cards').textContent();
            console.log(`  카드 사용 후: ${cardsAfter}`);
            
            await page.screenshot({ path: 'gameplay-card.png', fullPage: true });
            console.log('  📸 카드 사용 스크린샷 저장됨');
        }
        
        // 4. 턴 종료 버튼 테스트
        console.log('\n⏭️ 턴 종료 버튼 테스트...');
        const endTurnBtn = await page.locator('#end-turn').isVisible();
        if (endTurnBtn) {
            // 현재 플레이어 확인
            const playerBefore = await page.locator('#current-player').textContent();
            console.log(`  턴 종료 전: ${playerBefore}`);
            
            await page.click('#end-turn');
            await page.waitForTimeout(1500);
            
            const playerAfter = await page.locator('#current-player').textContent();
            console.log(`  턴 종료 후: ${playerAfter}`);
            
            await page.screenshot({ path: 'gameplay-endturn.png', fullPage: true });
            console.log('  📸 턴 종료 스크린샷 저장됨');
        }
        
        // 5. 게임 일시정지 버튼 테스트
        console.log('\n⏸️ 게임 일시정지 버튼 테스트...');
        const pauseBtn = await page.locator('#pause-game').isVisible();
        if (pauseBtn) {
            await page.click('#pause-game');
            await page.waitForTimeout(1000);
            
            console.log('  ✅ 게임 일시정지 버튼 클릭됨');
            
            await page.screenshot({ path: 'gameplay-pause.png', fullPage: true });
            console.log('  📸 게임 일시정지 스크린샷 저장됨');
        }
        
        // 6. 방 클릭 테스트
        console.log('\n🏠 방 클릭 상호작용 테스트...');
        const rooms = await page.locator('.board-room').count();
        console.log(`  총 방 개수: ${rooms}`);
        
        if (rooms > 0) {
            // 첫 번째 방 클릭
            await page.locator('.board-room').first().click();
            await page.waitForTimeout(1000);
            console.log('  ✅ 방 클릭 성공');
            
            await page.screenshot({ path: 'gameplay-room.png', fullPage: true });
            console.log('  📸 방 클릭 스크린샷 저장됨');
        }
        
        // 7. 게임 로그 확인
        console.log('\n📝 게임 로그 확인...');
        const logEntries = await page.locator('.game-log .log-entry').count();
        console.log(`  게임 로그 항목 수: ${logEntries}`);
        
        if (logEntries > 0) {
            const firstLog = await page.locator('.game-log .log-entry').first().textContent();
            console.log(`  첫 번째 로그: ${firstLog}`);
        }
        
        // 콘솔 에러 모니터링
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        // 최종 결과 요약
        console.log('\n📋 게임 기능 테스트 결과:');
        console.log(`  - 주사위 굴리기: ${rollDiceBtn ? '✅' : '❌'}`);
        console.log(`  - 이동하기: ${moveBtn ? '✅' : '❌'}`);
        console.log(`  - 카드 사용: ${useCardBtn ? '✅' : '❌'}`);
        console.log(`  - 턴 종료: ${endTurnBtn ? '✅' : '❌'}`);
        console.log(`  - 게임 일시정지: ${pauseBtn ? '✅' : '❌'}`);
        console.log(`  - 방 개수: ${rooms}`);
        console.log(`  - 게임 로그: ${logEntries}개 항목`);
        console.log(`  - 콘솔 에러: ${errors.length}개`);
        
        if (errors.length > 0) {
            console.log('\n❌ 발견된 에러들:');
            errors.slice(0, 5).forEach((error, index) => {
                console.log(`  ${index + 1}. ${error.substring(0, 100)}...`);
            });
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
    }
    
    await page.waitForTimeout(3000);
    await browser.close();
    console.log('🎯 게임 기능 테스트 완료!');
}

testGameplayFeatures().catch(console.error);