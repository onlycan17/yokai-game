const { chromium } = require('playwright');

async function debugConsole() {
    console.log('🔍 콘솔 메시지 디버깅...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const page = await browser.newPage();
    
    // 모든 콘솔 메시지 캡처
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`브라우저 [${type}]: ${text}`);
    });
    
    // 에러 캡처
    page.on('pageerror', error => {
        console.log('❌ JavaScript 에러:', error.message);
        console.log('스택 트레이스:', error.stack);
    });
    
    // 네트워크 요청 모니터링
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`❌ 네트워크 오류: ${response.url()} - ${response.status()}`);
        }
    });
    
    try {
        await page.goto('http://localhost:8001');
        console.log('✅ 페이지 로드 완료');
        
        // 10초 대기하며 모든 메시지 수집
        await page.waitForTimeout(10000);
        
        // DOM 상태 확인
        const gameBoard = await page.$('#game-board');
        const rooms = await page.$$('.board-room');
        const playerPieces = await page.$$('.player-piece');
        const guardianDeck = await page.$('.guardian-deck-area');
        
        console.log('\n📊 DOM 상태:');
        console.log('- 게임 보드 존재:', !!gameBoard);
        console.log('- 방 개수:', rooms.length);
        console.log('- 플레이어 말 개수:', playerPieces.length);
        console.log('- 수호신 덱 존재:', !!guardianDeck);
        
        // JavaScript 실행 결과 확인
        const gameInstance = await page.evaluate(() => {
            return {
                hasGame: !!window.game,
                gameState: window.game ? window.game.state : null,
                playersCount: window.game ? window.game.players.length : 0,
                boardRoomsCount: window.game ? window.game.board.rooms.length : 0
            };
        });
        
        console.log('\n🎮 게임 인스턴스 상태:');
        console.log('- window.game 존재:', gameInstance.hasGame);
        console.log('- 게임 상태:', gameInstance.gameState);
        console.log('- 플레이어 수:', gameInstance.playersCount);
        console.log('- 보드 방 수:', gameInstance.boardRoomsCount);
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error);
    }
    
    await browser.close();
}

debugConsole().catch(console.error);