// 원본 스타일 보드 구현

import { BOARD_ROOMS, CONNECTIONS, ROOM_EFFECTS, YOKAI_DATA } from './boardData.js';

class YokaiBoard {
    constructor() {
        this.rooms = BOARD_ROOMS;
        this.connections = CONNECTIONS;
        this.currentPlayerPosition = 0;
        this.deathPosition = null; // 죽음의 신 위치
        this.players = [];
    }
    
    // 보드 초기화
    init() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        // 게임 경로 컨테이너 생성
        const gamePath = document.createElement('div');
        gamePath.className = 'game-path';
        board.appendChild(gamePath);
        
        // 연결선 그리기
        this.drawConnections(gamePath);
        
        // 방 생성
        this.createRooms(gamePath);
        
        // 죽음의 다리 영역 표시
        this.createDeathBridge(gamePath);
        
        // 플레이어 말 초기 배치
        this.placePlayer(0);
    }
    
    // 방 생성
    createRooms(container) {
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `board-cell ${room.type}`;
            roomElement.id = `room-${room.id}`;
            roomElement.style.left = room.x + 'px';
            roomElement.style.top = room.y + 'px';
            
            // 방 번호
            const roomNumber = document.createElement('div');
            roomNumber.className = 'room-number';
            roomNumber.textContent = room.id;
            roomElement.appendChild(roomNumber);
            
            // 아이콘
            const icon = document.createElement('div');
            icon.className = 'room-icon';
            
            // 동적으로 이미지 생성기 로드
            import('./imageGenerator.js').then(({ GameImageGenerator }) => {
                const roomIconImage = GameImageGenerator.createRoomIcon(room.type, room.icon);
                icon.style.backgroundImage = `url(${roomIconImage})`;
                icon.style.backgroundSize = 'cover';
                icon.style.width = '30px';
                icon.style.height = '30px';
                icon.style.borderRadius = '50%';
                icon.style.marginBottom = '2px';
            });
            
            roomElement.appendChild(icon);
            
            // 방 이름
            const label = document.createElement('div');
            label.className = 'room-label';
            label.textContent = room.name;
            roomElement.appendChild(label);
            
            // 클릭 이벤트
            roomElement.addEventListener('click', () => this.handleRoomClick(room.id));
            
            container.appendChild(roomElement);
        });
    }
    
    // 연결선 그리기
    drawConnections(container) {
        this.connections.forEach(conn => {
            const fromRoom = this.rooms.find(r => r.id === conn.from);
            const toRoom = this.rooms.find(r => r.id === conn.to);
            
            if (fromRoom && toRoom) {
                const line = document.createElement('div');
                line.className = 'connection-line';
                
                // 좌표 계산
                const x1 = fromRoom.x + 35; // 방 중심
                const y1 = fromRoom.y + 35;
                const x2 = toRoom.x + 35;
                const y2 = toRoom.y + 35;
                
                const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                
                // 수평선
                if (Math.abs(y2 - y1) < 10) {
                    line.classList.add('horizontal');
                    line.style.width = Math.abs(x2 - x1) + 'px';
                    line.style.left = Math.min(x1, x2) + 'px';
                    line.style.top = y1 + 'px';
                }
                // 수직선
                else if (Math.abs(x2 - x1) < 10) {
                    line.classList.add('vertical');
                    line.style.height = Math.abs(y2 - y1) + 'px';
                    line.style.left = x1 + 'px';
                    line.style.top = Math.min(y1, y2) + 'px';
                }
                // 대각선
                else {
                    line.style.width = distance + 'px';
                    line.style.height = '2px';
                    line.style.left = x1 + 'px';
                    line.style.top = y1 + 'px';
                    line.style.transform = `rotate(${angle}deg)`;
                    line.style.transformOrigin = '0 50%';
                }
                
                container.appendChild(line);
            }
        });
    }
    
    // 죽음의 다리 영역 생성
    createDeathBridge(container) {
        const bridge = document.createElement('div');
        bridge.className = 'death-bridge';
        bridge.style.left = '280px';
        bridge.style.top = '130px';
        bridge.style.width = '340px';
        bridge.style.height = '60px';
        container.appendChild(bridge);
    }
    
    // 플레이어 말 배치
    placePlayer(roomId) {
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        // 기존 플레이어 말 제거
        const existingPlayer = document.querySelector('.player-piece');
        if (existingPlayer) {
            existingPlayer.remove();
        }
        
        // 새 플레이어 말 생성
        const player = document.createElement('div');
        player.className = 'player-piece player1';
        
        // 동적으로 이미지 생성기 로드
        import('./imageGenerator.js').then(({ GameImageGenerator }) => {
            const playerImage = GameImageGenerator.createPlayerPiece(1);
            player.style.backgroundImage = `url(${playerImage})`;
            player.style.backgroundSize = 'cover';
            player.style.width = '40px';
            player.style.height = '40px';
            player.style.borderRadius = '50%';
        });
        
        room.appendChild(player);
        
        this.currentPlayerPosition = roomId;
    }
    
    // 죽음의 신 배치
    placeDeathGod(roomId) {
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        // 기존 죽음의 신 제거
        const existingDeath = document.querySelector('.death-piece');
        if (existingDeath) {
            existingDeath.remove();
        }
        
        // 새 죽음의 신 생성
        const death = document.createElement('div');
        death.className = 'death-piece';
        
        // 동적으로 이미지 생성기 로드
        import('./imageGenerator.js').then(({ GameImageGenerator }) => {
            const deathImage = GameImageGenerator.createDeathPiece();
            death.style.backgroundImage = `url(${deathImage})`;
            death.style.backgroundSize = 'cover';
            death.style.width = '50px';
            death.style.height = '50px';
            death.style.borderRadius = '50%';
        });
        
        room.appendChild(death);
        
        this.deathPosition = roomId;
        
        // 플레이어와 인접 체크
        this.checkDeathAdjacent();
    }
    
    // 죽음의 신 이동
    moveDeathGod(steps) {
        if (this.deathPosition === null) return;
        
        // 죽음의 다리 구간에서만 이동
        const bridgeRooms = [20, 21, 22, 23];
        if (!bridgeRooms.includes(this.deathPosition)) return;
        
        let newPosition = this.deathPosition;
        
        // 앞뒤로 이동
        for (let i = 0; i < steps; i++) {
            const direction = Math.random() < 0.5 ? 1 : -1;
            const nextPosition = newPosition + direction;
            
            if (bridgeRooms.includes(nextPosition)) {
                newPosition = nextPosition;
            }
        }
        
        this.placeDeathGod(newPosition);
    }
    
    // 죽음의 신과 인접 체크
    checkDeathAdjacent() {
        if (this.deathPosition === null) return;
        
        // 인접한 방인지 확인
        const adjacentRooms = this.getAdjacentRooms(this.deathPosition);
        if (adjacentRooms.includes(this.currentPlayerPosition)) {
            this.handleDeathCaught();
        }
    }
    
    // 인접한 방 찾기
    getAdjacentRooms(roomId) {
        const adjacent = [];
        
        this.connections.forEach(conn => {
            if (conn.from === roomId) adjacent.push(conn.to);
            if (conn.to === roomId) adjacent.push(conn.from);
        });
        
        return adjacent;
    }
    
    // 죽음의 신에게 잡힘
    handleDeathCaught() {
        alert('죽음의 신에게 잡혔습니다! 게임 오버!');
        window.game.gameOver('죽음의 신에게 잡혔습니다');
    }
    
    // 방 클릭 처리
    handleRoomClick(roomId) {
        console.log(`방 ${roomId} 클릭`);
        
        // 이동 모드일 때만 처리
        if (this.movementMode && this.possibleMoves && this.possibleMoves.includes(roomId)) {
            this.movePlayer(roomId);
            this.clearMovementMode();
        } else if (!this.movementMode && this.canMoveTo(roomId)) {
            // 일반 이동 (디버그용)
            this.movePlayer(roomId);
        }
    }
    
    // 이동 모드 해제
    clearMovementMode() {
        this.movementMode = false;
        this.possibleMoves = null;
        
        // 이동 가능 표시 제거
        document.querySelectorAll('.moveable').forEach(room => {
            room.classList.remove('moveable');
            room.style.boxShadow = '';
        });
    }
    
    // 이동 가능 여부 확인
    canMoveTo(roomId) {
        // 현재 위치에서 연결된 방인지 확인
        const connectedRooms = this.getAdjacentRooms(this.currentPlayerPosition);
        return connectedRooms.includes(roomId);
    }
    
    // 플레이어 이동
    movePlayer(roomId) {
        this.placePlayer(roomId);
        
        // 플레이어 위치 업데이트
        if (this.player) {
            this.player.position = roomId;
        }
        
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // 방 효과 처리
        if (room.type === 'yokai-room') {
            this.handleYokaiRoom(room);
        } else if (room.type === 'special-room') {
            this.handleSpecialRoom(room);
        } else if (room.type === 'boss-room') {
            this.handleBossRoom(room);
        } else if (room.type === 'end') {
            this.handleVictory();
        }
        
        // 죽음의 다리 진입 시 죽음의 신 활성화
        if (roomId === 20 && this.deathPosition === null) {
            this.placeDeathGod(23); // 다리 끝에 배치
        }
        
        // 죽음의 신 이동 (플레이어가 이동할 때마다)
        if (this.deathPosition !== null) {
            this.moveDeathGod(1);
        }
    }
    
    // 요괴 방 처리
    handleYokaiRoom(room) {
        const yokaiInfo = YOKAI_DATA[room.name];
        if (!yokaiInfo) return;
        
        console.log(`${yokaiInfo.name}과(와) 조우!`);
        console.log(`약점: ${yokaiInfo.weakness.join(', ')}`);
        
        // 전투 시작
        window.game.startYokaiBattle(yokaiInfo);
    }
    
    // 특수 방 처리
    handleSpecialRoom(room) {
        const effect = ROOM_EFFECTS[room.name];
        if (!effect) return;
        
        console.log(`${room.name}: ${effect.description}`);
        
        switch (effect.effect) {
            case 'skip_turn':
                window.game.skipNextTurn();
                break;
            case 'move_back':
                this.movePlayerBack(effect.value);
                break;
        }
    }
    
    // 대마왕 방 처리
    handleBossRoom(room) {
        console.log('대마왕과 조우! 절대 이길 수 없습니다!');
        window.game.handleBossEncounter();
    }
    
    // 승리 처리
    handleVictory() {
        window.game.victory();
    }
    
    // 플레이어 뒤로 이동
    movePlayerBack(steps) {
        // 현재 위치에서 steps만큼 뒤로 이동
        let newPosition = Math.max(0, this.currentPlayerPosition - steps);
        this.placePlayer(newPosition);
    }
}

export default YokaiBoard;