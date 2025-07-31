const { chromium } = require('playwright');

async function fullGameTest() {
    console.log('🎮 전체 게임 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const page = await browser.newPage();
    
    // 콘솔 메시지 캡처
    const errors = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`브라우저 [${type}]: ${text}`);
        
        if (type === 'error') {
            errors.push(text);
        }
    });
    
    page.on('pageerror', error => {
        errors.push(error.message);
        console.log('❌ JavaScript 에러:', error.message);
    });
    
    try {
        // 1. 페이지 로드
        console.log('📄 게임 페이지 로딩...');
        await page.goto('http://localhost:8001');
        await page.waitForTimeout(2000);
        
        // 2. 시작 화면 확인
        const startScreen = await page.$('.start-screen');
        console.log('✅ 시작 화면 표시:', !!startScreen);
        
        // 3. 게임 모드 선택 (싱글 플레이)
        console.log('🎮 싱글 플레이 모드 선택...');
        const singleModeBtn = await page.$('button[data-mode="single"]');
        if (singleModeBtn) {
            await singleModeBtn.click();
            console.log('✅ 싱글 플레이 모드 선택됨');
        } else {
            console.log('❌ 싱글 플레이 버튼을 찾을 수 없음');
        }
        
        await page.waitForTimeout(1000);
        
        // 4. 게임 시작 버튼 클릭
        console.log('🚀 게임 시작...');
        const startBtn = await page.$('#start-game-btn');
        if (startBtn) {
            const isDisabled = await startBtn.evaluate(btn => btn.disabled);
            console.log('시작 버튼 비활성화 상태:', isDisabled);
            
            if (!isDisabled) {
                await startBtn.click();
                console.log('✅ 게임 시작 버튼 클릭됨');
            } else {
                console.log('❌ 시작 버튼이 비활성화됨');
            }
        } else {
            console.log('❌ 게임 시작 버튼을 찾을 수 없음');
        }
        
        // 5. 게임 보드 로딩 대기
        console.log('⏳ 게임 보드 로딩 대기...');
        await page.waitForTimeout(5000);
        
        // 6. 게임 상태 확인
        console.log('🔍 게임 상태 확인...');
        
        // DOM 요소 확인
        const gameBoard = await page.$('#game-board');
        const rooms = await page.$$('.board-room');
        const playerPieces = await page.$$('.player-piece');
        const guardianDeck = await page.$('.guardian-deck-area');
        const playerArea = await page.$('#player-area');
        
        console.log('\n📊 게임 요소 상태:');
        console.log('- 게임 보드:', !!gameBoard);
        console.log('- 방 개수:', rooms.length);
        console.log('- 플레이어 말:', playerPieces.length);
        console.log('- 수호신 덱:', !!guardianDeck);
        console.log('- 플레이어 영역:', !!playerArea);
        
        // 게임 인스턴스 상태
        const gameStatus = await page.evaluate(() => {
            return {
                hasGame: !!window.game,
                state: window.game?.state,
                playersCount: window.game?.players?.length,
                currentPlayerIndex: window.game?.currentPlayerIndex,
                boardRoomsCount: window.game?.board?.rooms?.length,
                gameMode: window.game?.gameMode
            };
        });
        
        console.log('\n🎮 게임 인스턴스:');
        console.log('- 게임 존재:', gameStatus.hasGame);
        console.log('- 게임 상태:', gameStatus.state);
        console.log('- 게임 모드:', gameStatus.gameMode);
        console.log('- 플레이어 수:', gameStatus.playersCount);
        console.log('- 현재 플레이어:', gameStatus.currentPlayerIndex);
        console.log('- 보드 방 수:', gameStatus.boardRoomsCount);
        
        // 7. 기본 상호작용 테스트
        if (rooms.length > 0) {
            console.log('\n🏠 방 클릭 테스트...');
            await rooms[0].click();
            await page.waitForTimeout(1000);
        }
        
        if (guardianDeck) {
            console.log('🛡️ 수호신 덱 확인...');
            const guardianCards = await page.$$('.guardian-deck-card');
            console.log('- 수호신 카드 수:', guardianCards.length);
            
            if (guardianCards.length > 0) {
                await guardianCards[0].click();
                console.log('✅ 첫 번째 수호신 카드 클릭됨');
                await page.waitForTimeout(1000);
            }
        }
        
        // 8. 플레이어 조작 테스트
        if (playerArea) {
            console.log('\n🎲 플레이어 조작 테스트...');
            const drawBtn = await page.$('#draw-movement');
            if (drawBtn) {
                await drawBtn.click();
                console.log('✅ 이동 카드 뽑기 버튼 클릭됨');
                await page.waitForTimeout(2000);
            }
        }
        
        // 9. 스크린샷 저장
        await page.screenshot({ 
            path: 'full-game-test-result.png', 
            fullPage: true 
        });
        console.log('📸 최종 상태 스크린샷 저장됨');
        
        // 10. 결과 요약
        console.log('\n📋 테스트 결과 요약:');
        console.log(`✅ 성공 항목:`);
        console.log(`   - 페이지 로드: ${gameBoard ? '성공' : '실패'}`);
        console.log(`   - 게임 보드: ${gameBoard ? '표시됨' : '표시 안됨'}`);
        console.log(`   - 방 생성: ${rooms.length}개`);
        console.log(`   - 플레이어 말: ${playerPieces.length}개`);
        console.log(`   - 수호신 덱: ${guardianDeck ? '표시됨' : '표시 안됨'}`);
        console.log(`   - 게임 상태: ${gameStatus.state}`);
        
        if (errors.length > 0) {
            console.log(`\n❌ 발견된 오류 (${errors.length}개):`);
            errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        } else {
            console.log('\n✅ JavaScript 오류 없음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
    }
    
    // 10초 더 대기 (수동 확인용)
    console.log('\n⏳ 10초 추가 대기 (수동 확인용)...');
    await page.waitForTimeout(10000);
    
    await browser.close();
    console.log('🎯 전체 게임 테스트 완료!');
}

fullGameTest().catch(console.error);