// 원본 스크린샷 기반 보드 구현

import { SPIRAL_BOARD_LAYOUT, SPIRAL_CONNECTIONS, GUARDIAN_DECK_LAYOUT, polarToCartesian } from './boardData-original.js';

class OriginalYokaiBoard {
    constructor() {
        this.rooms = SPIRAL_BOARD_LAYOUT;
        this.connections = SPIRAL_CONNECTIONS;
        this.currentPlayerPosition = 0;
        this.deathPosition = null;
        this.centerX = 450;
        this.centerY = 375;
    }
    
    // 보드 초기화
    init() {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        // 게임 경로 컨테이너 생성
        const gamePath = document.createElement('div');
        gamePath.className = 'game-path';
        board.appendChild(gamePath);
        
        // 중앙 수호신 카드 덱 영역 생성
        this.createGuardianDeckArea(gamePath);
        
        // 방 생성 (나선형 배치)
        this.createSpiralRooms(gamePath);
        
        // 연결선 그리기
        this.drawSpiralConnections(gamePath);
        
        // 플레이어 말 초기 배치
        this.placePlayer(0);
    }
    
    // 정사각형 방 생성
    createSpiralRooms(container) {
        const cellSize = 150; // 방 하나의 크기 (증가)
        const gap = 8; // 방 사이 간격 (증가)
        const boardSize = 7; // 7x7 그리드
        const totalSize = (cellSize + gap) * boardSize;
        const offsetX = (container.offsetWidth - totalSize) / 2;
        const offsetY = (container.offsetHeight - totalSize) / 2;
        
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `board-room ${room.type}`;
            roomElement.id = `room-${room.id}`;
            
            // 탈출구는 중앙 4칸을 차지하도록 특별 처리
            if (room.type === 'end') {
                const x = offsetX + (2.5 * (cellSize + gap));
                const y = offsetY + (2.5 * (cellSize + gap));
                roomElement.style.left = x + 'px';
                roomElement.style.top = y + 'px';
                roomElement.style.width = (cellSize * 2 + gap) + 'px';
                roomElement.style.height = (cellSize * 2 + gap) + 'px';
                roomElement.style.zIndex = '3';
            } else {
                // 일반 방들
                const x = offsetX + (room.position.x * (cellSize + gap));
                const y = offsetY + (room.position.y * (cellSize + gap));
                roomElement.style.left = x + 'px';
                roomElement.style.top = y + 'px';
                roomElement.style.width = cellSize + 'px';
                roomElement.style.height = cellSize + 'px';
            }
            
            // 방 번호
            const roomNumber = document.createElement('div');
            roomNumber.className = 'room-number';
            roomNumber.textContent = room.id;
            roomElement.appendChild(roomNumber);
            
            // 방 이름
            const roomName = document.createElement('div');
            roomName.className = 'room-name';
            roomName.textContent = room.name;
            roomElement.appendChild(roomName);
            
            // 아이콘
            const icon = document.createElement('div');
            icon.className = 'room-icon';
            icon.textContent = room.icon;
            roomElement.appendChild(icon);
            
            // 클릭 이벤트 (정보 표시와 이동 처리)
            roomElement.addEventListener('click', () => this.handleRoomClick(room.id));
            
            // 우클릭으로 방 정보 표시
            roomElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showRoomInfo(room.id);
            });
            
            container.appendChild(roomElement);
        });
    }
    
    // 중앙 수호신 카드 덱 영역 생성
    createGuardianDeckArea(container) {
        const cellSize = 150;
        const gap = 8;
        const boardSize = 7;
        const totalSize = (cellSize + gap) * boardSize;
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        
        const deckArea = document.createElement('div');
        deckArea.className = 'guardian-deck-area';
        deckArea.style.cssText = `
            position: absolute;
            left: ${centerX - 180}px;
            top: ${centerY - 220}px;
            width: 360px;
            height: 440px;
            background: 
                radial-gradient(ellipse at center, rgba(26, 15, 42, 0.98) 0%, rgba(10, 5, 21, 0.95) 100%),
                linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, transparent 50%, rgba(138, 43, 226, 0.1) 100%);
            border: 4px solid transparent;
            border-image: linear-gradient(45deg, #4ecdc4, #6fcfef, #8a2be2, #4ecdc4) 1;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 25px;
            box-shadow: 
                0 0 50px rgba(78, 205, 196, 0.7),
                0 0 100px rgba(138, 43, 226, 0.4),
                inset 0 0 50px rgba(0, 0, 0, 0.5);
            z-index: 5;
            backdrop-filter: blur(3px);
            animation: deckPulse 3s ease-in-out infinite;
        `;
        
        // 제목
        const title = document.createElement('div');
        title.className = 'deck-title';
        title.textContent = '🛡️ 수호신 카드';
        title.style.cssText = `
            color: #4ecdc4;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 
                0 0 10px rgba(78, 205, 196, 0.8),
                0 0 20px rgba(78, 205, 196, 0.4);
            animation: titleGlow 2s ease-in-out infinite alternate;
        `;
        deckArea.appendChild(title);
        
        // 카드 그리드
        const cardGrid = document.createElement('div');
        cardGrid.className = 'guardian-card-grid';
        cardGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            gap: 12px;
            width: 100%;
            height: 280px;
        `;
        
        // 수호신 카드들 생성
        GUARDIAN_DECK_LAYOUT.cardPositions.forEach((cardData, index) => {
            const card = document.createElement('div');
            card.className = 'guardian-deck-card';
            card.id = `guardian-${cardData.id}`;
            card.style.cssText = `
                background: 
                    linear-gradient(135deg, #1f3a4a 0%, #2f4a5a 50%, #0f1a2a 100%),
                    radial-gradient(circle at 30% 70%, rgba(78, 205, 196, 0.1) 0%, transparent 70%);
                border: 3px solid transparent;
                border-image: linear-gradient(45deg, #4ecdc4, #6fcfef) 1;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                color: #4ecdc4;
                font-size: 12px;
                padding: 8px;
                box-shadow: 
                    0 4px 8px rgba(0, 0, 0, 0.4),
                    0 0 15px rgba(78, 205, 196, 0.2);
                backdrop-filter: blur(1px);
                animation: cardFloat 2.5s ease-in-out infinite alternate;
                animation-delay: ${index * 0.2}s;
            `;
            
            // 마지막 카드는 전체 너비 차지
            if (index === GUARDIAN_DECK_LAYOUT.cardPositions.length - 1) {
                card.style.gridColumn = '1 / 3';
            }
            
            card.innerHTML = `
                <div style="font-size: 28px; margin-bottom: 5px; filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.4));">${cardData.icon}</div>
                <div style="font-weight: bold; font-size: 13px; text-shadow: 0 0 8px rgba(78, 205, 196, 0.5);">${cardData.name}</div>
                <div style="font-size: 10px; opacity: 0.9; text-shadow: 0 0 5px rgba(78, 205, 196, 0.3);">수호신</div>
            `;
            
            card.addEventListener('click', () => this.selectGuardianCard(cardData.id));
            cardGrid.appendChild(card);
        });
        
        deckArea.appendChild(cardGrid);
        container.appendChild(deckArea);
    }
    
    // 정사각형 연결선 그리기
    drawSpiralConnections(container) {
        const cellSize = 150;
        const gap = 8;
        const boardSize = 7;
        const totalSize = (cellSize + gap) * boardSize;
        const offsetX = (container.offsetWidth - totalSize) / 2;
        const offsetY = (container.offsetHeight - totalSize) / 2;
        
        this.connections.forEach(conn => {
            const fromRoom = this.rooms.find(r => r.id === conn.from);
            const toRoom = this.rooms.find(r => r.id === conn.to);
            
            if (fromRoom && toRoom) {
                const fromX = offsetX + (fromRoom.position.x * (cellSize + gap)) + cellSize / 2;
                const fromY = offsetY + (fromRoom.position.y * (cellSize + gap)) + cellSize / 2;
                const toX = offsetX + (toRoom.position.x * (cellSize + gap)) + cellSize / 2;
                const toY = offsetY + (toRoom.position.y * (cellSize + gap)) + cellSize / 2;
                
                const line = document.createElement('div');
                line.className = 'spiral-connection';
                
                const distance = Math.sqrt(
                    Math.pow(toX - fromX, 2) + 
                    Math.pow(toY - fromY, 2)
                );
                const angle = Math.atan2(
                    toY - fromY, 
                    toX - fromX
                ) * 180 / Math.PI;
                
                line.style.cssText = `
                    position: absolute;
                    left: ${fromX}px;
                    top: ${fromY}px;
                    width: ${distance}px;
                    height: 6px;
                    background: 
                        linear-gradient(90deg, 
                            rgba(138, 43, 226, 0.8) 0%, 
                            rgba(78, 205, 196, 0.8) 25%,
                            rgba(255, 255, 255, 0.6) 50%,
                            rgba(78, 205, 196, 0.8) 75%, 
                            rgba(138, 43, 226, 0.8) 100%);
                    transform-origin: 0 50%;
                    transform: rotate(${angle}deg);
                    z-index: 1;
                    box-shadow: 
                        0 0 15px rgba(138, 43, 226, 0.6),
                        0 0 25px rgba(78, 205, 196, 0.3);
                    border-radius: 3px;
                    animation: connectionPulse 2s ease-in-out infinite;
                `;
                
                container.appendChild(line);
            }
        });
    }
    
    // 플레이어 말 배치 (멀티플레이어 지원)
    placePlayer(roomId, playerId = 1) {
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        // 해당 플레이어의 기존 말 제거
        const existingPlayer = document.querySelector(`.player-piece[data-player="${playerId}"]`);
        if (existingPlayer) {
            existingPlayer.remove();
        }
        
        // 플레이어 정보 가져오기
        const playerData = window.game?.players?.find(p => p.id === playerId) || {
            id: playerId,
            color: playerId === 1 ? '#ff6b6b' : '#4ecdc4',
            icon: playerId === 1 ? '🎮' : '🎯'
        };
        
        // 새 플레이어 말 생성
        const player = document.createElement('div');
        player.className = `player-piece player${playerId}`;
        player.setAttribute('data-player', playerId);
        
        // 여러 플레이어가 같은 방에 있을 때 위치 조정
        const existingPlayers = room.querySelectorAll('.player-piece');
        const offsetX = existingPlayers.length * 8; // 기존 플레이어 수만큼 오프셋
        
        player.style.cssText = `
            position: absolute;
            width: 32px;
            height: 32px;
            background: 
                radial-gradient(circle at 30% 30%, #ffffff 0%, ${playerData.color} 30%, ${this.darkenColor(playerData.color)} 100%),
                radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
            border: 3px solid #fff;
            border-radius: 50%;
            top: 50%;
            left: calc(50% + ${offsetX}px);
            transform: translate(-50%, -50%);
            z-index: ${10 + playerId};
            box-shadow: 
                0 0 15px ${playerData.color}cc,
                0 0 30px ${playerData.color}66,
                0 4px 8px rgba(0, 0, 0, 0.3),
                inset 0 0 10px rgba(255, 255, 255, 0.2);
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            animation: playerGlow 2s ease-in-out infinite alternate;
            cursor: pointer;
        `;
        
        // 플레이어별 추가 스타일
        if (playerId === 1) {
            player.style.animation = 'playerGlow 2s ease-in-out infinite alternate';
        } else {
            player.style.animation = 'playerGlow 2s ease-in-out infinite alternate';
            player.style.animationDelay = '1s';
        }
        player.textContent = playerData.icon;
        
        room.appendChild(player);
        
        // 현재 플레이어 위치 업데이트
        if (window.game?.players) {
            const gamePlayer = window.game.players.find(p => p.id === playerId);
            if (gamePlayer) {
                gamePlayer.position = roomId;
            }
        }
        
        // 플레이어 말에 카메라 포커스
        this.focusOnPlayer(roomId, playerId);
    }
    
    // 플레이어 말에 카메라 포커스
    focusOnPlayer(roomId, playerId = 1) {
        const room = document.getElementById(`room-${roomId}`);
        if (!room) return;
        
        const roomRect = room.getBoundingClientRect();
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        const roomCenterX = roomRect.left + roomRect.width / 2;
        const roomCenterY = roomRect.top + roomRect.height / 2;
        
        const scrollX = roomCenterX - viewportCenterX;
        const scrollY = roomCenterY - viewportCenterY;
        
        window.scrollTo({
            left: window.scrollX + scrollX,
            top: window.scrollY + scrollY,
            behavior: 'smooth'
        });
        
        this.highlightPlayer(roomId, playerId);
    }
    
    
    // 플레이어 말 강조 효과
    highlightPlayer(roomId, playerId) {
        // 기존 강조 효과 제거
        document.querySelectorAll('.player-piece').forEach(piece => {
            piece.classList.remove('focused');
        });
        
        // 현재 플레이어 말 찾기 및 강조
        const room = document.getElementById(`room-${roomId}`);
        if (room) {
            const playerPiece = room.querySelector(`.player-piece[data-player="${playerId}"]`);
            if (playerPiece) {
                playerPiece.classList.add('focused');
                
                // 3초 후 강조 효과 제거
                setTimeout(() => {
                    playerPiece.classList.remove('focused');
                }, 3000);
            }
        }
    }
    
    // 색상 어둡게 만들기
    darkenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // 수호신 카드 선택
    selectGuardianCard(cardId) {
        console.log(`수호신 카드 선택: ${cardId}`);
        
        // 기존 선택 제거
        document.querySelectorAll('.guardian-deck-card').forEach(card => {
            card.style.boxShadow = '';
            card.style.borderColor = '#4ecdc4';
        });
        
        // 새 선택 표시
        const selectedCard = document.getElementById(`guardian-${cardId}`);
        if (selectedCard) {
            selectedCard.style.boxShadow = '0 0 15px rgba(78, 205, 196, 0.8)';
            selectedCard.style.borderColor = '#6fcfef';
        }
        
        if (window.game) {
            window.game.selectedGuardian = cardId;
        }
    }
    
    // 방 클릭 처리
    handleRoomClick(roomId) {
        console.log(`방 ${roomId} 클릭`);
        
        // 이동 모드일 때만 처리
        if (this.movementMode && this.possibleMoves && this.possibleMoves.includes(roomId)) {
            this.movePlayer(roomId);
            this.clearMovementMode();
        }
    }
    
    // 플레이어 이동 (애니메이션 포함)
    movePlayer(roomId) {
        if (window.game) {
            // 게임 인스턴스의 애니메이션 함수 사용
            window.game.movePlayerWithAnimation(roomId, () => {
                const room = this.rooms.find(r => r.id === roomId);
                console.log('이동 완료, 방 정보:', room);
                if (!room) return;
                
                // 방 효과 처리
                if (room.type === 'yokai-room') {
                    console.log('요괴 방 효과 처리 시작');
                    this.handleYokaiRoom(room);
                } else if (room.type === 'special-room') {
                    console.log('특수 방 효과 처리 시작');
                    this.handleSpecialRoom(room);
                } else if (room.type === 'guardian-room') {
                    console.log('수호신 카드 획득 방 진입');
                    this.handleGuardianRoom(room);
                } else if (room.type === 'safe-room') {
                    console.log('안전지대 진입');
                    this.handleSafeRoom(room);
                } else if (room.type === 'end') {
                    console.log('탈출구 도착!');
                    this.handleVictory();
                } else {
                    console.log('일반 방, 턴 종료');
                    // 일반 방인 경우 턴 종료
                    if (window.game) {
                        window.game.endTurn();
                    }
                }
            });
        } else {
            // 백업: 애니메이션 없이 이동
            this.placePlayer(roomId);
            if (this.player) {
                this.player.position = roomId;
            }
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
            room.style.animation = '';
            
            // 이동 표시 텍스트 제거
            const moveIndicator = room.querySelector('.move-indicator');
            if (moveIndicator) {
                moveIndicator.remove();
            }
        });
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
    
    // 이동 가능 여부 확인
    canMoveTo(roomId) {
        const connectedRooms = this.getAdjacentRooms(this.currentPlayerPosition);
        return connectedRooms.includes(roomId);
    }
    
    // 요괴 방 처리
    handleYokaiRoom(room) {
        console.log(`${room.name} 진입!`);
        if (window.game) {
            window.game.enterYokaiRoom(room);
        }
    }
    
    // 특수 방 처리
    handleSpecialRoom(room) {
        console.log(`특수 방 ${room.name} 진입!`);
        if (window.game) {
            // 특수 방 효과를 보드 데이터에서 가져오기
            const roomData = this.rooms.find(r => r.id === room.id);
            if (roomData) {
                room.effect = roomData.effect;
                room.type = roomData.type;
            }
            window.game.enterSpecialRoom(room);
        }
    }
    
    // 수호신 카드 획득 방 처리
    handleGuardianRoom(room) {
        console.log(`수호신의 방 ${room.name} 진입!`);
        if (window.game) {
            window.game.enterGuardianRoom(room);
        }
    }
    
    // 안전지대 처리
    handleSafeRoom(room) {
        console.log(`안전지대 ${room.name} 진입!`);
        if (window.game) {
            window.game.enterSafeRoom(room);
        }
    }
    
    // 승리 처리
    handleVictory() {
        if (window.game) {
            const currentPlayer = window.game.getCurrentPlayer();
            window.game.victory(currentPlayer.id);
        }
    }
    
    // 이동 가능한 영역 표시
    showPossibleMoves(currentPosition, moveSteps) {
        // 기존 이동 가능 표시 제거
        this.clearMovementMode();
        
        this.movementMode = true;
        this.possibleMoves = this.calculatePossibleMoves(currentPosition, moveSteps);
        
        // 이동 가능한 방들에 표시
        this.possibleMoves.forEach(roomId => {
            const roomElement = document.getElementById(`room-${roomId}`);
            if (roomElement) {
                roomElement.classList.add('moveable');
                roomElement.style.boxShadow = '0 0 20px #ffd700, 0 0 40px #ffd700';
                roomElement.style.animation = 'pulse 1.5s ease-in-out infinite';
                
                // 이동 가능 표시 추가
                const moveIndicator = document.createElement('div');
                moveIndicator.className = 'move-indicator';
                moveIndicator.textContent = '이동 가능';
                moveIndicator.style.cssText = `
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ffd700;
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    z-index: 20;
                    animation: bounce 1s ease-in-out infinite;
                `;
                roomElement.appendChild(moveIndicator);
            }
        });
        
        console.log(`이동 가능한 방: ${this.possibleMoves.join(', ')}`);
    }
    
    // 이동 가능한 방 계산
    calculatePossibleMoves(currentPosition, steps) {
        if (!steps || steps <= 0) return [];
        
        const visited = new Set();
        const result = new Set();
        
        const exploreFromPosition = (position, remainingSteps) => {
            if (remainingSteps === 0) {
                if (position !== currentPosition) {
                    result.add(position);
                }
                return;
            }
            
            const adjacentRooms = this.getAdjacentRooms(position);
            
            adjacentRooms.forEach(roomId => {
                const key = `${roomId}_${remainingSteps}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    exploreFromPosition(roomId, remainingSteps - 1);
                }
            });
        };
        
        exploreFromPosition(currentPosition, steps);
        return Array.from(result);
    }
    
    // 방 정보 표시 (요괴 정보 포함)
    showRoomInfo(roomId) {
        const room = this.rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // 기존 정보 창 제거
        const existingInfo = document.querySelector('.room-info-popup');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        // 방 정보 팝업 생성
        const infoPopup = document.createElement('div');
        infoPopup.className = 'room-info-popup';
        infoPopup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(26, 15, 42, 0.95);
            border: 2px solid #4ecdc4;
            border-radius: 10px;
            padding: 15px;
            color: #e0e0e0;
            z-index: 1000;
            min-width: 200px;
            box-shadow: 0 0 20px rgba(78, 205, 196, 0.5);
        `;
        
        let yokaiInfo = '';
        if (room.type === 'yokai-room' && room.yokai) {
            yokaiInfo = `
                <div class="yokai-info">
                    <h4>👹 요괴 정보</h4>
                    <p><strong>이름:</strong> ${room.yokai.name}</p>
                    <p><strong>공격력:</strong> ${room.yokai.attack}</p>
                    <p><strong>설명:</strong> ${room.yokai.description}</p>
                </div>
            `;
        }
        
        infoPopup.innerHTML = `
            <h3>${room.icon} ${room.name}</h3>
            <p><strong>방 번호:</strong> ${room.id}</p>
            <p><strong>타입:</strong> ${this.getRoomTypeText(room.type)}</p>
            ${yokaiInfo}
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 10px;
                background: none;
                border: none;
                color: #ff6b6b;
                cursor: pointer;
                font-size: 18px;
            ">×</button>
        `;
        
        document.body.appendChild(infoPopup);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (infoPopup.parentElement) {
                infoPopup.remove();
            }
        }, 5000);
    }
    
    // 방 타입 텍스트 변환
    getRoomTypeText(type) {
        const typeMap = {
            'start': '시작점',
            'yokai-room': '요괴 방',
            'special-room': '특수 방',
            'guardian-room': '수호신 방',
            'safe-room': '안전지대',
            'end': '탈출구'
        };
        return typeMap[type] || '일반 방';
    }
}

export default OriginalYokaiBoard;