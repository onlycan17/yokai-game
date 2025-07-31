// 이미지 생성 및 관리 모듈

// SVG 기반 게임 요소 생성
export class GameImageGenerator {
    
    // 보드판 배경 텍스처 생성
    static createBoardTexture() {
        const svg = `
            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="woodTexture" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#2a1a0a"/>
                        <path d="M0,10 Q10,5 20,10 T40,10" stroke="#3a2a1a" stroke-width="0.5" fill="none"/>
                        <path d="M0,15 Q15,12 20,15" stroke="#4a3a2a" stroke-width="0.3" fill="none"/>
                    </pattern>
                    <filter id="shadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <rect width="100" height="100" fill="url(#woodTexture)"/>
                <rect x="5" y="5" width="90" height="90" fill="none" stroke="#6a4a2a" stroke-width="2" filter="url(#shadow)"/>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 요괴 카드 이미지 생성
    static createYokaiCard(yokaiName, iconEmoji) {
        const svg = `
            <svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#3a1f4a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1a0f2a;stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- 카드 배경 -->
                <rect width="120" height="180" rx="10" fill="url(#cardBg)" stroke="#6a3f8a" stroke-width="2"/>
                
                <!-- 카드 테두리 장식 -->
                <rect x="5" y="5" width="110" height="170" rx="8" fill="none" stroke="#8a5faa" stroke-width="1" opacity="0.5"/>
                
                <!-- 상단 장식 -->
                <path d="M20,15 Q60,5 100,15 L95,25 Q60,20 25,25 Z" fill="#4a2f5a" opacity="0.8"/>
                
                <!-- 아이콘 영역 -->
                <circle cx="60" cy="60" r="25" fill="#2a1f3a" stroke="#6a3f8a" stroke-width="2"/>
                <text x="60" y="75" text-anchor="middle" font-size="30" fill="#da70d6">${iconEmoji}</text>
                
                <!-- 제목 -->
                <text x="60" y="100" text-anchor="middle" font-size="12" fill="#da70d6" font-weight="bold">${yokaiName}</text>
                
                <!-- 하단 장식선 -->
                <line x1="20" y1="110" x2="100" y2="110" stroke="#6a3f8a" stroke-width="1"/>
                
                <!-- 카드 타입 표시 -->
                <text x="60" y="130" text-anchor="middle" font-size="10" fill="#aa7fca" opacity="0.8">요괴</text>
                
                <!-- 하단 문양 -->
                <path d="M40,150 Q60,140 80,150 Q60,160 40,150" fill="none" stroke="#6a3f8a" stroke-width="1" opacity="0.6"/>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 수호신 카드 이미지 생성
    static createGuardianCard(guardianName, iconEmoji) {
        const svg = `
            <svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="guardianBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1f3a4a;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0f1a2a;stop-opacity:1" />
                    </linearGradient>
                    <radialGradient id="lightGlow" cx="50%" cy="30%" r="50%">
                        <stop offset="0%" style="stop-color:#4ecdc4;stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:0" />
                    </radialGradient>
                </defs>
                
                <!-- 카드 배경 -->
                <rect width="120" height="180" rx="10" fill="url(#guardianBg)" stroke="#3f6a8a" stroke-width="2"/>
                
                <!-- 빛 효과 -->
                <ellipse cx="60" cy="60" rx="50" ry="60" fill="url(#lightGlow)"/>
                
                <!-- 카드 테두리 장식 -->
                <rect x="5" y="5" width="110" height="170" rx="8" fill="none" stroke="#5f8aaa" stroke-width="1" opacity="0.5"/>
                
                <!-- 상단 장식 -->
                <path d="M20,15 L100,15 L95,25 L25,25 Z" fill="#2f4a5a" opacity="0.8"/>
                
                <!-- 아이콘 영역 -->
                <circle cx="60" cy="60" r="25" fill="#1f2a3a" stroke="#3f6a8a" stroke-width="2"/>
                <circle cx="60" cy="60" r="20" fill="none" stroke="#4ecdc4" stroke-width="1" opacity="0.5"/>
                <text x="60" y="75" text-anchor="middle" font-size="28" fill="#4ecdc4">${iconEmoji}</text>
                
                <!-- 제목 -->
                <text x="60" y="100" text-anchor="middle" font-size="12" fill="#4ecdc4" font-weight="bold">${guardianName}</text>
                
                <!-- 하단 장식선 -->
                <line x1="20" y1="110" x2="100" y2="110" stroke="#3f6a8a" stroke-width="1"/>
                
                <!-- 카드 타입 표시 -->
                <text x="60" y="130" text-anchor="middle" font-size="10" fill="#6faaca" opacity="0.8">수호신</text>
                
                <!-- 하단 문양 -->
                <circle cx="60" cy="150" r="8" fill="none" stroke="#3f6a8a" stroke-width="1" opacity="0.6"/>
                <circle cx="60" cy="150" r="12" fill="none" stroke="#3f6a8a" stroke-width="0.5" opacity="0.4"/>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 이동 카드 이미지 생성
    static createMovementCard(cardName, value) {
        const displayValue = value === 'choice' ? '?' : value === 0 ? 'X' : value.toString();
        const color = value === 0 ? '#8a3f3f' : value === 'choice' ? '#8a5f3f' : '#6a6a3f';
        
        const svg = `
            <svg width="120" height="180" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="moveBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#1a1a0f;stop-opacity:1" />
                    </linearGradient>
                </defs>
                
                <!-- 카드 배경 -->
                <rect width="120" height="180" rx="10" fill="url(#moveBg)" stroke="${color}" stroke-width="2"/>
                
                <!-- 카드 테두리 장식 -->
                <rect x="5" y="5" width="110" height="170" rx="8" fill="none" stroke="#aaaa5f" stroke-width="1" opacity="0.5"/>
                
                <!-- 상단 장식 -->
                <polygon points="20,15 100,15 90,25 30,25" fill="${color}aa"/>
                
                <!-- 중앙 숫자 -->
                <circle cx="60" cy="90" r="30" fill="#2a2a1f" stroke="${color}" stroke-width="3"/>
                <text x="60" y="105" text-anchor="middle" font-size="36" fill="#ffd93d" font-weight="bold">${displayValue}</text>
                
                <!-- 제목 -->
                <text x="60" y="40" text-anchor="middle" font-size="11" fill="#ffd93d" font-weight="bold">${cardName}</text>
                
                <!-- 하단 장식 -->
                <path d="M30,140 L90,140 M35,145 L85,145" stroke="${color}" stroke-width="1" opacity="0.6"/>
                
                <!-- 카드 타입 표시 -->
                <text x="60" y="160" text-anchor="middle" font-size="10" fill="#ccaa5f" opacity="0.8">이동</text>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 플레이어 말 이미지 생성
    static createPlayerPiece(playerId) {
        const colors = {
            1: { primary: '#ff6b6b', secondary: '#cc5555' },
            2: { primary: '#4ecdc4', secondary: '#3ca39c' },
            3: { primary: '#ffe66d', secondary: '#ccb855' },
            4: { primary: '#a8e6cf', secondary: '#86b8a6' }
        };
        
        const color = colors[playerId] || colors[1];
        
        const svg = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="playerGrad${playerId}" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:${color.primary};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color.secondary};stop-opacity:1" />
                    </radialGradient>
                    <filter id="playerShadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.4"/>
                    </filter>
                </defs>
                
                <!-- 그림자 -->
                <ellipse cx="20" cy="35" rx="15" ry="3" fill="rgba(0,0,0,0.3)"/>
                
                <!-- 본체 -->
                <circle cx="20" cy="20" r="16" fill="url(#playerGrad${playerId})" stroke="white" stroke-width="2" filter="url(#playerShadow)"/>
                
                <!-- 중앙 아이콘 -->
                <text x="20" y="27" text-anchor="middle" font-size="18" fill="white">🎮</text>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 죽음의 신 이미지 생성
    static createDeathPiece() {
        const svg = `
            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="deathGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#800000;stop-opacity:1" />
                    </radialGradient>
                    <filter id="deathGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                <!-- 외부 오오라 -->
                <circle cx="25" cy="25" r="23" fill="rgba(255,0,0,0.2)" filter="url(#deathGlow)"/>
                
                <!-- 본체 -->
                <circle cx="25" cy="25" r="18" fill="url(#deathGrad)" stroke="#ff0000" stroke-width="2"/>
                
                <!-- 내부 그림자 -->
                <circle cx="25" cy="25" r="15" fill="rgba(0,0,0,0.3)"/>
                
                <!-- 해골 아이콘 -->
                <text x="25" y="32" text-anchor="middle" font-size="24" fill="white">💀</text>
                
                <!-- 펄스 효과를 위한 외곽선 -->
                <circle cx="25" cy="25" r="18" fill="none" stroke="rgba(255,0,0,0.6)" stroke-width="1">
                    <animate attributeName="r" values="18;22;18" dur="1.5s" repeatCount="indefinite"/>
                    <animate attributeName="stroke-opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
                </circle>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 주사위 이미지 생성
    static createDice(number) {
        const dotPositions = {
            1: [[50, 50]],
            2: [[25, 25], [75, 75]],
            3: [[25, 25], [50, 50], [75, 75]],
            4: [[25, 25], [75, 25], [25, 75], [75, 75]],
            5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
            6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
        };
        
        const dots = dotPositions[number] || dotPositions[1];
        
        const svg = `
            <svg width="60" height="60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="diceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
                    </linearGradient>
                    <filter id="diceShadow">
                        <feDropShadow dx="3" dy="3" stdDeviation="2" flood-opacity="0.4"/>
                    </filter>
                </defs>
                
                <!-- 주사위 본체 -->
                <rect x="10" y="10" width="80" height="80" rx="8" fill="url(#diceGrad)" stroke="#333" stroke-width="2" filter="url(#diceShadow)"/>
                
                <!-- 하이라이트 -->
                <rect x="15" y="15" width="25" height="25" rx="4" fill="rgba(255,255,255,0.3)"/>
                
                <!-- 점들 -->
                ${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#333"/>`).join('')}
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
    
    // 방 아이콘 생성 (더 상세한 버전)
    static createRoomIcon(roomType, iconEmoji) {
        const colors = {
            'start': { bg: '#2a5f2a', border: '#4a8f4a' },
            'end': { bg: '#5f2a2a', border: '#8f4a4a' },
            'yokai-room': { bg: '#3a1f4a', border: '#6a3f8a' },
            'special-room': { bg: '#4a3f1a', border: '#8a7f3a' },
            'boss-room': { bg: '#4a0f5f', border: '#8a2b9f' },
            'bridge': { bg: '#2a2a2a', border: '#5a5a5a' }
        };
        
        const color = colors[roomType] || colors['yokai-room'];
        
        const svg = `
            <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="roomGrad_${roomType}" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" style="stop-color:${color.bg}aa;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color.bg};stop-opacity:1" />
                    </radialGradient>
                </defs>
                
                <!-- 배경 원 -->
                <circle cx="15" cy="15" r="12" fill="url(#roomGrad_${roomType})" stroke="${color.border}" stroke-width="1"/>
                
                <!-- 아이콘 -->
                <text x="15" y="20" text-anchor="middle" font-size="16" fill="white">${iconEmoji}</text>
            </svg>
        `;
        // UTF-8 문자를 포함한 SVG를 안전하게 인코딩
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }
}

// 이미지 캐시 관리
export class ImageCache {
    constructor() {
        this.cache = new Map();
    }
    
    get(key) {
        return this.cache.get(key);
    }
    
    set(key, value) {
        this.cache.set(key, value);
        return value;
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    clear() {
        this.cache.clear();
    }
}

// 전역 이미지 캐시 인스턴스
export const imageCache = new ImageCache();