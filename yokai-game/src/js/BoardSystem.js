/**
 * 요괴의 성 탈출 - 보드 시스템
 * CLAUDE.md 규칙에 따른 클린 코드 구현
 */

import { BoardData } from './BoardData.js';

/**
 * 보드 시스템 클래스
 * 게임 보드 렌더링, 플레이어 이동, 방 관리를 담당
 */
export class BoardSystem {
    constructor() {
        this.boardData = new BoardData();
        this.rooms = this.boardData.getRooms();
        this.connections = this.boardData.getConnections();
        this.players = [];
        this.centerX = 400;
        this.centerY = 320;
        this.cellSize = 120;
        this.gap = 6;
    }

    /**
     * 보드 시스템 초기화
     */
    init() {
        console.log('보드 시스템 초기화 중...');
        
        const boardElement = document.getElementById('game-board');
        if (!boardElement) {
            console.error('game-board 엘리먼트를 찾을 수 없습니다.');
            return;
        }

        this.clearBoard(boardElement);
        this.createBoardStructure(boardElement);
        this.renderRooms();
        this.renderConnections();
        
        console.log('보드 시스템 초기화 완료');
    }

    /**
     * 보드 클리어
     * @param {HTMLElement} boardElement 보드 엘리먼트
     */
    clearBoard(boardElement) {
        boardElement.innerHTML = '';
    }

    /**
     * 보드 구조 생성
     * @param {HTMLElement} boardElement 보드 엘리먼트
     */
    createBoardStructure(boardElement) {
        // 게임 경로 컨테이너 생성
        const gamePath = document.createElement('div');
        gamePath.className = 'game-path';
        gamePath.id = 'game-path';
        boardElement.appendChild(gamePath);

        // 중앙 수호신 덱 영역 생성
        this.createGuardianDeckArea(gamePath);
    }

    /**
     * 중앙 수호신 덱 영역 생성
     * @param {HTMLElement} container 컨테이너 엘리먼트
     */
    createGuardianDeckArea(container) {
        const deckArea = document.createElement('div');
        deckArea.className = 'guardian-deck-area';
        deckArea.id = 'guardian-deck-area';
        
        const deckLayout = this.boardData.getGuardianDeckLayout();
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        
        deckArea.style.left = (centerX - 100) + 'px';
        deckArea.style.top = (centerY - 100) + 'px';
        deckArea.style.width = '200px';
        deckArea.style.height = '200px';
        
        // 덱 타이틀
        const deckTitle = document.createElement('div');
        deckTitle.className = 'deck-title';
        deckTitle.textContent = '수호신 카드';
        deckArea.appendChild(deckTitle);
        
        // 카드 위치들
        deckLayout.cardPositions.forEach(cardPos => {
            const cardElement = document.createElement('div');
            cardElement.className = 'guardian-deck-card';
            cardElement.id = `deck-card-${cardPos.id}`;
            cardElement.innerHTML = `
                <div class="deck-card-icon">${cardPos.icon}</div>
                <div class="deck-card-name">${cardPos.name}</div>
            `;
            
            cardElement.style.left = (100 + cardPos.position.x) + 'px';
            cardElement.style.top = (100 + cardPos.position.y) + 'px';
            
            deckArea.appendChild(cardElement);
        });
        
        container.appendChild(deckArea);
    }

    /**
     * 방들 렌더링
     */
    renderRooms() {
        const container = document.getElementById('game-path');
        if (!container) return;

        const boardSize = 7; // 7x7 그리드
        const totalSize = (this.cellSize + this.gap) * boardSize;
        const offsetX = (container.offsetWidth - totalSize) / 2;
        const offsetY = (container.offsetHeight - totalSize) / 2;

        this.rooms.forEach(room => {
            const roomElement = this.createRoomElement(room, offsetX, offsetY);
            container.appendChild(roomElement);
        });
    }

    /**
     * 방 엘리먼트 생성
     * @param {Object} room 방 데이터
     * @param {number} offsetX X 오프셋
     * @param {number} offsetY Y 오프셋
     * @returns {HTMLElement} 방 엘리먼트
     */
    createRoomElement(room, offsetX, offsetY) {
        const roomElement = document.createElement('div');
        roomElement.className = `board-room ${this.getRoomTypeClass(room.type)}`;
        roomElement.id = `room-${room.id}`;
        roomElement.dataset.roomId = room.id;

        // 위치 설정
        this.setRoomPosition(roomElement, room, offsetX, offsetY);

        // 방 내용 구성
        this.addRoomContent(roomElement, room);

        // 이벤트 바인딩
        this.bindRoomEvents(roomElement, room);

        return roomElement;
    }

    /**
     * 방 타입에 따른 CSS 클래스 반환
     * @param {string} type 방 타입
     * @returns {string} CSS 클래스명
     */
    getRoomTypeClass(type) {
        const typeMap = {
            'start': 'start-room',
            'yokai-room': 'yokai-room',
            'safe-room': 'safe-room',
            'guardian-room': 'guardian-room',
            'special-room': 'special-room',
            'end': 'end-room'
        };
        return typeMap[type] || 'unknown-room';
    }

    /**
     * 방 위치 설정
     * @param {HTMLElement} roomElement 방 엘리먼트
     * @param {Object} room 방 데이터
     * @param {number} offsetX X 오프셋
     * @param {number} offsetY Y 오프셋
     */
    setRoomPosition(roomElement, room, offsetX, offsetY) {
        if (room.type === 'end') {
            // 탈출구는 중앙 4칸을 차지
            const x = offsetX + (2.5 * (this.cellSize + this.gap));
            const y = offsetY + (2.5 * (this.cellSize + this.gap));
            roomElement.style.left = x + 'px';
            roomElement.style.top = y + 'px';
            roomElement.style.width = (this.cellSize * 2 + this.gap) + 'px';
            roomElement.style.height = (this.cellSize * 2 + this.gap) + 'px';
            roomElement.style.zIndex = '3';
        } else {
            // 일반 방들
            const x = offsetX + (room.position.x * (this.cellSize + this.gap));
            const y = offsetY + (room.position.y * (this.cellSize + this.gap));
            roomElement.style.left = x + 'px';
            roomElement.style.top = y + 'px';
            roomElement.style.width = this.cellSize + 'px';
            roomElement.style.height = this.cellSize + 'px';
        }
    }

    /**
     * 방 내용 추가
     * @param {HTMLElement} roomElement 방 엘리먼트
     * @param {Object} room 방 데이터
     */
    addRoomContent(roomElement, room) {
        // 방 번호
        const roomNumber = document.createElement('div');
        roomNumber.className = 'room-number';
        roomNumber.textContent = room.id;
        roomElement.appendChild(roomNumber);

        // 방 아이콘
        const roomIcon = document.createElement('div');
        roomIcon.className = 'room-icon';
        roomIcon.textContent = room.icon;
        roomElement.appendChild(roomIcon);

        // 방 이름
        const roomName = document.createElement('div');
        roomName.className = 'room-name';
        roomName.textContent = room.name;
        roomElement.appendChild(roomName);

        // 안전지대 표시
        if (room.isSafeZone) {
            roomElement.classList.add('safe-zone');
        }

        // 플레이어 컨테이너
        const playerContainer = document.createElement('div');
        playerContainer.className = 'room-players';
        playerContainer.id = `room-${room.id}-players`;
        console.log(`플레이어 컨테이너 생성: room-${room.id}-players`);
        roomElement.appendChild(playerContainer);
    }

    /**
     * 방 이벤트 바인딩
     * @param {HTMLElement} roomElement 방 엘리먼트
     * @param {Object} room 방 데이터
     */
    bindRoomEvents(roomElement, room) {
        // 좌클릭: 방 선택/이동
        roomElement.addEventListener('click', () => {
            this.handleRoomClick(room.id);
        });

        // 우클릭: 방 정보 표시
        roomElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showRoomInfo(room.id);
        });

        // 호버 효과
        roomElement.addEventListener('mouseenter', () => {
            this.highlightRoom(room.id, true);
        });

        roomElement.addEventListener('mouseleave', () => {
            this.highlightRoom(room.id, false);
        });
    }

    /**
     * 연결선 렌더링
     */
    renderConnections() {
        const container = document.getElementById('game-board');
        if (!container) return;

        // SVG 요소 생성
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'board-connections');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '1';

        this.connections.forEach(connection => {
            const line = this.createConnectionLine(connection.from, connection.to);
            if (line) {
                svg.appendChild(line);
            }
        });

        container.appendChild(svg);
    }

    /**
     * 연결선 생성
     * @param {number} fromRoomId 시작 방 ID
     * @param {number} toRoomId 도착 방 ID
     * @returns {SVGLineElement} 연결선 SVG 엘리먼트
     */
    createConnectionLine(fromRoomId, toRoomId) {
        const fromRoom = this.getRoom(fromRoomId);
        const toRoom = this.getRoom(toRoomId);
        
        if (!fromRoom || !toRoom) return null;

        const fromElement = document.getElementById(`room-${fromRoomId}`);
        const toElement = document.getElementById(`room-${toRoomId}`);
        
        if (!fromElement || !toElement) return null;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        
        // 방 중심점 계산
        const fromCenter = this.getRoomCenter(fromElement);
        const toCenter = this.getRoomCenter(toElement);
        
        line.setAttribute('x1', fromCenter.x);
        line.setAttribute('y1', fromCenter.y);
        line.setAttribute('x2', toCenter.x);
        line.setAttribute('y2', toCenter.y);
        line.setAttribute('stroke', 'rgba(138, 43, 226, 0.3)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');

        return line;
    }

    /**
     * 방 중심점 계산
     * @param {HTMLElement} roomElement 방 엘리먼트
     * @returns {Object} 중심점 좌표
     */
    getRoomCenter(roomElement) {
        const rect = roomElement.getBoundingClientRect();
        const containerRect = document.getElementById('game-path').getBoundingClientRect();
        
        return {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top
        };
    }

    /**
     * 플레이어 설정
     * @param {Array} players 플레이어 배열
     */
    setPlayers(players) {
        this.players = players;
        console.log('플레이어 설정 중:', players);
        
        // 모든 플레이어를 시작점(0번)에 배치
        this.players.forEach(player => {
            if (player.position === undefined || player.position === null) {
                player.position = 0; // 시작점으로 설정
            }
        });
        
        this.updatePlayersDisplay();
    }

    /**
     * 플레이어 이동
     * @param {number} playerId 플레이어 ID
     * @param {number} targetRoomId 목표 방 ID
     */
    movePlayer(playerId, targetRoomId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) {
            console.error(`플레이어 ${playerId}를 찾을 수 없습니다.`);
            return;
        }

        const previousPosition = player.position;
        player.position = targetRoomId;

        // 이전 위치에서 플레이어 제거
        this.removePlayerFromRoom(playerId, previousPosition);

        // 새 위치에 플레이어 추가
        this.addPlayerToRoom(playerId, targetRoomId);

        // 애니메이션 실행
        this.animatePlayerMovement(playerId, previousPosition, targetRoomId);

        console.log(`플레이어 ${playerId}가 방 ${previousPosition}에서 방 ${targetRoomId}로 이동했습니다.`);
    }

    /**
     * 방에서 플레이어 제거
     * @param {number} playerId 플레이어 ID
     * @param {number} roomId 방 ID
     */
    removePlayerFromRoom(playerId, roomId) {
        const playerElement = document.getElementById(`player-${playerId}`);
        if (playerElement) {
            playerElement.remove();
        }
    }

    /**
     * 방에 플레이어 추가
     * @param {number} playerId 플레이어 ID
     * @param {number} roomId 방 ID
     */
    addPlayerToRoom(playerId, roomId) {
        const player = this.players.find(p => p.id === playerId);
        const roomPlayersContainer = document.getElementById(`room-${roomId}-players`);
        
        console.log(`addPlayerToRoom: 플레이어 ${playerId}를 방 ${roomId}에 추가 시도`);
        console.log('플레이어 객체:', player);
        console.log('방 컨테이너:', roomPlayersContainer);
        
        if (!player) {
            console.error(`플레이어 ${playerId}를 찾을 수 없습니다.`);
            return;
        }
        
        if (!roomPlayersContainer) {
            console.error(`방 ${roomId}의 플레이어 컨테이너를 찾을 수 없습니다.`);
            return;
        }

        const playerElement = document.createElement('div');
        playerElement.className = 'player-piece';
        playerElement.id = `player-${playerId}`;
        playerElement.dataset.player = playerId;
        playerElement.textContent = playerId;
        
        // 플레이어 색상과 아이콘 추가
        if (player.color) {
            playerElement.style.backgroundColor = player.color;
        }
        if (player.icon) {
            playerElement.innerHTML = `<span class="player-icon">${player.icon}</span><span class="player-id">${playerId}</span>`;
        }

        console.log('플레이어 말 생성 완료:', playerElement);
        roomPlayersContainer.appendChild(playerElement);
        console.log('플레이어 말이 방에 추가됨');
    }

    /**
     * 플레이어 이동 애니메이션
     * @param {number} playerId 플레이어 ID
     * @param {number} fromRoomId 시작 방 ID
     * @param {number} toRoomId 도착 방 ID
     */
    animatePlayerMovement(playerId, fromRoomId, toRoomId) {
        const fromRoom = document.getElementById(`room-${fromRoomId}`);
        const toRoom = document.getElementById(`room-${toRoomId}`);
        const playerElement = document.getElementById(`player-${playerId}`);
        
        if (!fromRoom || !toRoom || !playerElement) return;

        // 애니메이션 효과 클래스 추가
        playerElement.classList.add('moving');
        
        // 목표 방 하이라이트
        toRoom.classList.add('target-room');
        
        setTimeout(() => {
            playerElement.classList.remove('moving');
            toRoom.classList.remove('target-room');
        }, 500);
    }

    /**
     * 방 클릭 처리
     * @param {number} roomId 방 ID
     */
    handleRoomClick(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        console.log(`방 ${roomId} (${room.name}) 클릭됨`);
        
        // 커스텀 이벤트 발생
        const event = new CustomEvent('roomClick', {
            detail: { roomId, room }
        });
        document.dispatchEvent(event);
    }

    /**
     * 방 정보 표시
     * @param {number} roomId 방 ID
     */
    showRoomInfo(roomId) {
        const room = this.getRoom(roomId);
        if (!room) return;

        const infoHtml = `
            <div class="room-info-popup">
                <h3>${room.name} (${room.id}번)</h3>
                <div class="room-type">타입: ${this.getRoomTypeDescription(room.type)}</div>
                <div class="room-icon-large">${room.icon}</div>
                ${room.effect ? `<div class="room-effect">효과: ${room.effect}</div>` : ''}
                ${room.isSafeZone ? '<div class="safe-zone-indicator">🛡️ 안전지대</div>' : ''}
            </div>
        `;

        // 팝업 표시 로직 (기존 UI 시스템과 연동)
        if (window.uiEffects) {
            window.uiEffects.showNotification(infoHtml, 'info', 3000);
        }
    }

    /**
     * 방 타입 설명 반환
     * @param {string} type 방 타입
     * @returns {string} 타입 설명
     */
    getRoomTypeDescription(type) {
        const descriptions = {
            'start': '시작점',
            'yokai-room': '요괴 방',
            'safe-room': '안전지대',
            'guardian-room': '수호신 방',
            'special-room': '특수 방',
            'end': '탈출구'
        };
        return descriptions[type] || '알 수 없음';
    }

    /**
     * 방 하이라이트
     * @param {number} roomId 방 ID
     * @param {boolean} highlight 하이라이트 여부
     */
    highlightRoom(roomId, highlight) {
        const roomElement = document.getElementById(`room-${roomId}`);
        if (!roomElement) return;

        if (highlight) {
            roomElement.classList.add('highlighted');
        } else {
            roomElement.classList.remove('highlighted');
        }
    }

    /**
     * 방 데이터 반환
     * @param {number} roomId 방 ID
     * @returns {Object} 방 데이터
     */
    getRoom(roomId) {
        return this.rooms.find(room => room.id === roomId);
    }

    /**
     * 모든 플레이어 표시 업데이트
     */
    updatePlayersDisplay() {
        console.log('플레이어 표시 업데이트 중...', this.players);
        
        // 모든 기존 플레이어 제거
        document.querySelectorAll('.player-piece').forEach(el => {
            console.log('기존 플레이어 제거:', el.id);
            el.remove();
        });

        // 현재 플레이어들 다시 배치
        this.players.forEach(player => {
            console.log(`플레이어 ${player.id}를 ${player.position}번 방에 배치`);
            this.addPlayerToRoom(player.id, player.position);
        });
    }

    /**
     * 화면 표시 업데이트
     */
    updateDisplay() {
        this.updatePlayersDisplay();
    }

    /**
     * 가능한 이동 위치 하이라이트
     * @param {Array} possibleMoves 가능한 이동 위치 배열
     */
    highlightPossibleMoves(possibleMoves) {
        // 기존 하이라이트 제거
        document.querySelectorAll('.possible-move').forEach(el => {
            el.classList.remove('possible-move');
        });

        // 새로운 하이라이트 추가
        possibleMoves.forEach(roomId => {
            const roomElement = document.getElementById(`room-${roomId}`);
            if (roomElement) {
                roomElement.classList.add('possible-move');
            }
        });
    }

    /**
     * 이동 위치 하이라이트 제거
     */
    clearMoveHighlights() {
        document.querySelectorAll('.possible-move').forEach(el => {
            el.classList.remove('possible-move');
        });
    }

    /**
     * 보드 시스템 리셋
     */
    reset() {
        console.log('보드 시스템 리셋 중...');
        
        // 플레이어 초기화
        this.players.forEach(player => {
            player.position = 0;
        });

        // 화면 업데이트
        this.updateDisplay();
        
        console.log('보드 시스템 리셋 완료');
    }

    /**
     * 특정 방 타입의 모든 방 반환
     * @param {string} type 방 타입
     * @returns {Array} 해당 타입의 방 배열
     */
    getRoomsByType(type) {
        return this.rooms.filter(room => room.type === type);
    }

    /**
     * 안전지대 방들 반환
     * @returns {Array} 안전지대 방 배열
     */
    getSafeRooms() {
        return this.rooms.filter(room => room.isSafeZone);
    }

    /**
     * 가장 가까운 안전지대 찾기
     * @param {number} currentPosition 현재 위치
     * @returns {number} 가장 가까운 안전지대 ID
     */
    findNearestSafeRoom(currentPosition) {
        const safeRooms = this.getSafeRooms();
        let nearestRoom = safeRooms[0];
        let minDistance = Math.abs(currentPosition - nearestRoom.id);

        safeRooms.forEach(room => {
            const distance = Math.abs(currentPosition - room.id);
            if (distance < minDistance) {
                minDistance = distance;
                nearestRoom = room;
            }
        });

        return nearestRoom.id;
    }

    /**
     * 방 사이의 거리 계산
     * @param {number} fromRoomId 시작 방 ID
     * @param {number} toRoomId 도착 방 ID
     * @returns {number} 거리
     */
    calculateDistance(fromRoomId, toRoomId) {
        return Math.abs(toRoomId - fromRoomId);
    }

    /**
     * 경로 계산 (방 ID 배열 반환)
     * @param {number} fromRoomId 시작 방 ID
     * @param {number} toRoomId 도착 방 ID
     * @returns {Array} 경로 배열
     */
    calculatePath(fromRoomId, toRoomId) {
        const path = [];
        const step = fromRoomId < toRoomId ? 1 : -1;
        
        for (let i = fromRoomId; i !== toRoomId; i += step) {
            path.push(i);
        }
        path.push(toRoomId);
        
        return path;
    }
}

// 기본 내보내기
export default BoardSystem;