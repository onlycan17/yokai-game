// 게임 보드 생성 및 관리

// 보드 설정
const BOARD_SIZE = 10;
const BOARD_LAYOUT = {
    start: { row: 9, col: 0 },
    end: { row: 0, col: 9 },
    bossRoom: { startRow: 3, endRow: 6, startCol: 3, endCol: 6 },
    specialRooms: [
        { row: 1, col: 2, type: 'trap', name: '함정의 방' },
        { row: 2, col: 7, type: 'treasure', name: '보물의 방' },
        { row: 7, col: 1, type: 'trap', name: '고난의 미로' },
        { row: 8, col: 6, type: 'treasure', name: '열쇠의 방' },
        { row: 1, col: 5, type: 'special', name: '뱀의 탑' },
        { row: 5, col: 8, type: 'special', name: '유령의 방' }
    ]
};

// 게임 보드 생성
function createGameBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = createBoardCell(row, col);
            board.appendChild(cell);
        }
    }
    
    // 대마왕의 방 생성
    createBossRoom();
    
    // 특수 방 설정
    setupSpecialRooms();
    
    // 통로 연결
    createCorridors();
}

// 보드 칸 생성
function createBoardCell(row, col) {
    const cell = document.createElement('div');
    cell.className = 'board-cell';
    cell.dataset.row = row;
    cell.dataset.col = col;
    cell.id = `cell-${row}-${col}`;
    
    // 시작점과 끝점 설정
    if (row === BOARD_LAYOUT.start.row && col === BOARD_LAYOUT.start.col) {
        cell.classList.add('start');
        cell.innerHTML = '<div class="room-label">시작</div>';
    } else if (row === BOARD_LAYOUT.end.row && col === BOARD_LAYOUT.end.col) {
        cell.classList.add('end');
        cell.innerHTML = '<div class="room-label">탈출구</div>';
    }
    
    // 클릭 이벤트
    cell.addEventListener('click', () => handleCellClick(row, col));
    
    return cell;
}

// 대마왕의 방 생성
function createBossRoom() {
    const { startRow, endRow, startCol, endCol } = BOARD_LAYOUT.bossRoom;
    const bossRoom = document.createElement('div');
    bossRoom.className = 'board-cell boss-room';
    bossRoom.id = 'boss-room';
    bossRoom.style.gridColumn = `${startCol + 1} / ${endCol + 2}`;
    bossRoom.style.gridRow = `${startRow + 1} / ${endRow + 2}`;
    
    bossRoom.innerHTML = `
        <div class="boss-content">
            <div class="boss-icon">👾</div>
            <div class="room-label">대마왕의 방</div>
        </div>
    `;
    
    // 기존 셀들 숨기기
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) cell.style.display = 'none';
        }
    }
    
    document.getElementById('game-board').appendChild(bossRoom);
}

// 특수 방 설정
function setupSpecialRooms() {
    BOARD_LAYOUT.specialRooms.forEach(room => {
        const cell = document.getElementById(`cell-${room.row}-${room.col}`);
        if (cell) {
            cell.classList.add(room.type);
            cell.innerHTML = `<div class="room-label">${room.name}</div>`;
            
            // 열쇠 방에는 열쇠 아이콘 추가
            if (room.name === '열쇠의 방') {
                const keyColors = ['red', 'blue', 'yellow'];
                const randomKey = keyColors[Math.floor(Math.random() * keyColors.length)];
                cell.innerHTML += `<div class="key-icon ${randomKey}"></div>`;
            }
        }
    });
}

// 통로 연결
function createCorridors() {
    // 주요 통로 연결
    const corridors = [
        // 가로 통로
        { start: [9, 0], end: [9, 3], type: 'horizontal' },
        { start: [9, 4], end: [9, 9], type: 'horizontal' },
        { start: [7, 1], end: [7, 4], type: 'horizontal' },
        { start: [7, 5], end: [7, 8], type: 'horizontal' },
        { start: [2, 1], end: [2, 6], type: 'horizontal' },
        { start: [2, 7], end: [2, 9], type: 'horizontal' },
        
        // 세로 통로
        { start: [0, 2], end: [3, 2], type: 'vertical' },
        { start: [6, 2], end: [9, 2], type: 'vertical' },
        { start: [0, 7], end: [2, 7], type: 'vertical' },
        { start: [6, 7], end: [9, 7], type: 'vertical' }
    ];
    
    corridors.forEach(corridor => {
        if (corridor.type === 'horizontal') {
            for (let col = corridor.start[1]; col <= corridor.end[1]; col++) {
                const cell = document.getElementById(`cell-${corridor.start[0]}-${col}`);
                if (cell && !cell.classList.contains('special')) {
                    cell.classList.add('corridor');
                }
            }
        } else {
            for (let row = corridor.start[0]; row <= corridor.end[0]; row++) {
                const cell = document.getElementById(`cell-${row}-${corridor.start[1]}`);
                if (cell && !cell.classList.contains('special')) {
                    cell.classList.add('corridor', 'vertical');
                }
            }
        }
    });
}

// 플레이어 말 생성
function createPlayerPiece(playerId) {
    const piece = document.createElement('div');
    piece.className = `player-piece player${playerId}`;
    piece.id = `player-${playerId}`;
    return piece;
}

// 플레이어 이동
function movePlayer(playerId, row, col) {
    const player = document.getElementById(`player-${playerId}`);
    const targetCell = document.getElementById(`cell-${row}-${col}`);
    
    if (player && targetCell) {
        targetCell.appendChild(player);
        
        // 이동 애니메이션
        player.style.animation = 'none';
        setTimeout(() => {
            player.style.animation = 'bounce 0.5s ease';
        }, 10);
    }
}

// 셀 클릭 처리
function handleCellClick(row, col) {
    console.log(`Clicked cell: ${row}, ${col}`);
    
    // 이동 가능 여부 확인
    if (isValidMove(row, col)) {
        movePlayer(currentPlayerId, row, col);
        checkSpecialRoom(row, col);
    }
}

// 이동 가능 여부 확인
function isValidMove(row, col) {
    // 현재 플레이어 위치 확인
    const player = document.getElementById(`player-${currentPlayerId}`);
    if (!player) return false;
    
    const currentCell = player.parentElement;
    if (!currentCell) return false;
    
    const currentRow = parseInt(currentCell.dataset.row);
    const currentCol = parseInt(currentCell.dataset.col);
    
    // 인접한 칸으로만 이동 가능
    const rowDiff = Math.abs(row - currentRow);
    const colDiff = Math.abs(col - currentCol);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// 특수 방 체크
function checkSpecialRoom(row, col) {
    const cell = document.getElementById(`cell-${row}-${col}`);
    
    if (cell.classList.contains('trap')) {
        console.log('함정에 빠졌습니다!');
        // 함정 이벤트 처리
    } else if (cell.classList.contains('treasure')) {
        console.log('보물을 발견했습니다!');
        // 보물 이벤트 처리
    } else if (cell.classList.contains('end')) {
        console.log('탈출 성공!');
        // 게임 종료 처리
    }
}

// 주사위 굴리기 애니메이션
function rollDice(callback) {
    const dice = document.createElement('div');
    dice.className = 'dice-roll';
    dice.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        background: white;
        border: 2px solid #333;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        font-weight: bold;
        animation: diceRoll 1s ease-in-out;
        z-index: 1000;
    `;
    
    document.body.appendChild(dice);
    
    let count = 0;
    const interval = setInterval(() => {
        dice.textContent = Math.floor(Math.random() * 6) + 1;
        count++;
        
        if (count > 10) {
            clearInterval(interval);
            const result = Math.floor(Math.random() * 6) + 1;
            dice.textContent = result;
            
            setTimeout(() => {
                dice.remove();
                if (callback) callback(result);
            }, 500);
        }
    }, 100);
}

// 전역 변수
let currentPlayerId = 1;

// 보드 초기화
function initializeBoard() {
    createGameBoard();
    
    // 플레이어 말 배치
    const startCell = document.getElementById(`cell-${BOARD_LAYOUT.start.row}-${BOARD_LAYOUT.start.col}`);
    const player1 = createPlayerPiece(1);
    startCell.appendChild(player1);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes diceRoll {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        50% { transform: translate(-50%, -50%) rotate(180deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(style);

export { 
    createGameBoard, 
    movePlayer, 
    rollDice, 
    initializeBoard,
    currentPlayerId 
};