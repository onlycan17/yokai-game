import { chromium } from 'playwright';

// 테스트 설정
const TEST_URL = 'http://localhost:8000';
const TIMEOUT = 30000;

/**
 * 턴제 시스템 테스트
 */
async function testTurnSystem() {
    console.log('🎮 턴제 시스템 테스트 시작...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 // 동작을 천천히 하여 확인 가능
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 }
        });
        
        const page = await context.newPage();
        
        // 게임 페이지 열기
        console.log('📍 게임 페이지 접속...');
        await page.goto(TEST_URL);
        await page.waitForLoadState('networkidle');
        
        // 2인 플레이 모드 선택
        console.log('📍 2인 플레이 모드 선택...');
        await page.click('[data-mode="vs_player"]');
        await page.waitForTimeout(1000);
        
        // 게임 시작 확인
        console.log('📍 게임 시작 확인...');
        await page.waitForSelector('#game-container', { state: 'visible' });
        
        // 테스트 1: Player 1 턴에서 Player 2가 주사위 굴릴 수 없는지 확인
        console.log('\n🧪 테스트 1: 턴 권한 확인');
        
        // 현재 플레이어 확인
        const currentPlayerText = await page.textContent('.current-player');
        console.log(`현재 플레이어: ${currentPlayerText}`);
        
        // Player 1의 주사위 굴리기
        console.log('Player 1이 주사위를 굴립니다...');
        await page.click('#roll-dice');
        await page.waitForTimeout(1000);
        
        // 주사위 결과 확인
        const diceResult = await page.textContent('#dice-result');
        console.log(`주사위 결과: ${diceResult}`);
        
        // 테스트 2: 액션 진행 중 다른 액션 차단 확인
        console.log('\n🧪 테스트 2: 액션 진행 중 다른 액션 차단');
        
        // 이동 중에 다시 주사위 굴리기 시도
        console.log('이동 중에 다시 주사위 굴리기 시도...');
        await page.click('#roll-dice', { force: true });
        
        // 알림 메시지 확인
        await page.waitForTimeout(500);
        const notifications = await page.$$('.notification');
        if (notifications.length > 0) {
            const lastNotification = notifications[notifications.length - 1];
            const notificationText = await lastNotification.textContent();
            console.log(`알림 메시지: ${notificationText}`);
        }
        
        // 이동 완료 대기
        await page.waitForTimeout(3000);
        
        // 테스트 3: 턴 종료 후 다음 플레이어로 전환 확인
        console.log('\n🧪 테스트 3: 턴 전환 확인');
        
        // 턴 종료 버튼 클릭
        console.log('턴 종료 버튼 클릭...');
        await page.click('#end-turn');
        await page.waitForTimeout(1000);
        
        // 새로운 현재 플레이어 확인
        const newPlayerText = await page.textContent('.current-player');
        console.log(`새로운 현재 플레이어: ${newPlayerText}`);
        
        // Player 2 턴인지 확인
        if (newPlayerText.includes('Player 2')) {
            console.log('✅ Player 2로 정상적으로 턴 전환됨');
        } else {
            console.log('❌ 턴 전환 실패');
        }
        
        // 테스트 4: Player 2가 주사위를 굴릴 수 있는지 확인
        console.log('\n🧪 테스트 4: Player 2 액션 권한 확인');
        
        console.log('Player 2가 주사위를 굴립니다...');
        await page.click('#roll-dice');
        await page.waitForTimeout(1000);
        
        const player2DiceResult = await page.textContent('#dice-result');
        console.log(`Player 2 주사위 결과: ${player2DiceResult}`);
        
        // 테스트 5: 요괴 방에서의 턴 잠금 테스트
        console.log('\n🧪 테스트 5: 요괴 방에서의 턴 잠금');
        
        // 요괴 팝업이 나타나는지 확인
        const yokaiPopup = await page.$('.yokai-popup');
        if (yokaiPopup) {
            console.log('요괴 팝업 발견!');
            
            // 다른 버튼들이 비활성화되는지 확인
            try {
                await page.click('#roll-dice', { timeout: 1000 });
                console.log('❌ 요괴 팝업 중에도 주사위를 굴릴 수 있음 (문제)');
            } catch (e) {
                console.log('✅ 요괴 팝업 중에는 다른 액션 불가 (정상)');
            }
            
            // 도망가기 선택
            await page.click('#yokai-run-away');
            await page.waitForTimeout(2000);
        }
        
        // 스크린샷 저장
        console.log('\n📸 테스트 결과 스크린샷 저장...');
        await page.screenshot({ 
            path: 'turn-system-test-result.png',
            fullPage: true 
        });
        
        console.log('\n✅ 턴제 시스템 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        
        // 오류 스크린샷 저장
        try {
            const page = browser.contexts()[0]?.pages()[0];
            if (page) {
                await page.screenshot({ 
                    path: 'turn-system-test-error.png',
                    fullPage: true 
                });
            }
        } catch (screenshotError) {
            console.error('스크린샷 저장 실패:', screenshotError);
        }
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testTurnSystem().catch(console.error);