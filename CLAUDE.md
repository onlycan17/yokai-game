# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "요괴의 성 탈출" (Yokai Castle Escape), a digital board game implementation of a classic 1980s Korean horror board game. The project transforms the original board game into a web-based interactive experience with modern web technologies.

## Development Commands

### Running the Game
```bash
cd yokai-game
python3 -m http.server 8000
# Then open http://localhost:8000 in browser
```

### Using npm scripts
```bash
npm start    # Starts development server on port 8000
npm run dev  # Same as start
```

### Testing
The project uses Playwright for automated testing:
```bash
npx playwright test                    # Run all tests
node simple-test.js                   # Run basic game tests
node full-game-test.js                # Run comprehensive game tests
node performance-test-final.js        # Run performance tests
```

### Development Tools
- Live server required for ES6 modules (cannot run directly from file system)
- Browser dev tools for debugging and performance monitoring
- Performance test files for optimization validation

## Architecture & File Structure

### Core Game Architecture
The game follows a modular ES6 architecture with clear separation of concerns:

- **Game Controller**: `src/js/game-original.js` - Main game state management
- **Board System**: `src/js/board-original.js` - Game board rendering and interaction
- **Card System**: `src/js/cards-new.js` - Card deck and game cards management
- **Board Data**: `src/js/boardData-original.js` - Static game board layout data

### Game State Management
The game uses a finite state machine pattern:
```javascript
const GameState = {
    SETUP: 'setup',
    PLAYING: 'playing', 
    MOVE_PHASE: 'move_phase',
    BATTLE_PHASE: 'battle_phase',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};
```

### Board Layout System
- 25-room spiral layout on a 7x7 grid
- Room types: start, yokai rooms, safe zones, special rooms, escape
- Polar coordinate system for spiral connections
- CSS Grid-based positioning with precise room placement

### Performance Optimization
The project includes a sophisticated performance optimization system:

- **Animation Optimizer**: `src/js/animationOptimizer.js` - GPU-accelerated animations
- **Hardware Acceleration**: CSS transforms with `translateZ(0)` and `will-change`
- **Thread Management**: RequestAnimationFrame-based animation queuing
- **Memory Management**: Automatic performance mode switching based on device capabilities

### Card System Design
- Three card types: Yokai cards, Guardian cards, Item cards
- Weakness-based battle system (yokai have specific weaknesses)
- Visual card rendering with CSS animations
- Drag-and-drop interaction support

## Key Technical Patterns

### ES6 Module System
All JavaScript files use ES6 modules with explicit imports/exports. Always maintain this pattern when adding new functionality.

### CSS Architecture
- **Modular CSS**: Separate files for different game systems
- **CSS Custom Properties**: Used for theming and dynamic values
- **Grid-based Layout**: Board uses CSS Grid for precise positioning
- **Performance-first CSS**: Hardware acceleration applied to animated elements

### Event-Driven Architecture
The game uses custom event dispatching for component communication:
```javascript
// Dispatch game events
this.dispatchEvent(new CustomEvent('gameStateChange', { detail: newState }));
```

### Multiplayer Support
Built-in support for multiple game modes:
- Single player
- VS AI
- Hot-seat multiplayer (2 players)

## Testing Strategy

### Automated Testing
- **Playwright Tests**: Full browser automation for UI testing
- **Performance Tests**: Frame rate and memory usage monitoring
- **Game Flow Tests**: Complete gameplay scenario validation

### Manual Testing
- Visual regression testing using screenshot comparisons
- Cross-browser compatibility testing
- Mobile responsiveness testing

## Important Development Notes

### Performance Considerations
- All animations should use CSS transforms (not position changes)
- Use `will-change` property for elements that will animate
- Implement frame rate monitoring for performance-critical features
- Memory cleanup is essential for long gaming sessions

### Browser Compatibility
- Primary target: Modern browsers with ES6 module support
- Uses Web APIs: requestAnimationFrame, CSS Grid, CSS Custom Properties
- No polyfills included - assumes modern browser environment

### Game Balance
- Card deck composition is carefully balanced in `cards-new.js`
- Room distribution follows the original board game design
- Combat system uses weakness matching for strategy

## File Naming Conventions
- Original/legacy files: `-original.js` or `-original.css` suffix
- New/updated files: `-new.js` suffix or no suffix
- Test files: `*-test.js` or descriptive names like `simple-test.js`

## Visual Design System
- **Theme**: 1980s horror board game aesthetic with dark purple color scheme
- **Typography**: Korean language support required
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Animations**: Smooth CSS transitions with hardware acceleration

## Debugging & Troubleshooting
- Game state is accessible via `window.game` for console debugging
- Performance metrics available through AnimationOptimizer class
- Detailed bug reports available in `GAME_BUG_REPORT.md`
- Optimization documentation in `OPTIMIZATION_SUMMARY.md`

## Production Considerations
- Static file serving (no backend required)
- Optimized for CDN deployment
- Memory management for extended play sessions
- Performance monitoring and automatic optimization


- 시니어 풀스택 개발자로서 신중하고 상세한 답변을 제공해 주세요.
- Always respond in 한글
  
1. 사전 분석 단계
🔍 프로젝트 심층 분석 (필수 우선 실행)
RULE: 코드 작성 전 반드시 다음을 수행하라
1.1 프로젝트 구조 파악
디렉토리 구조와 파일 명명 규칙 분석
기존 아키텍처 패턴 식별 (MVC, Clean Architecture 등)
의존성 관리 방식 확인 (package.json, requirements.txt 등)

1.2 코딩 컨벤션 확인

기존 코드의 스타일 가이드 추출
변수명, 함수명 패턴 분석
들여쓰기, 괄호 스타일 등 포맷팅 규칙 파악

1.3 기술 스택 이해

사용 중인 프레임워크와 라이브러리 목록 작성
버전 호환성 및 제약사항 확인
외부 API 및 데이터베이스 연동 방식 파악

2. 코드 작성 원칙
💎 DRY 원칙과 SOLID 원칙, 가독성 우선
RULE: 중복 코드 제거와 가독성을 동시에 추구하라
2.1 함수/메서드 설계

단일 책임 원칙: 하나의 함수는 하나의 기능만 수행
의미있는 네이밍: getUserData() ✅ vs getData() ❌
적절한 길이: 15줄 이내 권장, 최대 30줄 초과 금지

2.2 성능 고려사항
반복문 최적화: 불필요한 중첩 반복 제거
메모리 효율성: 대용량 데이터 처리 시 스트리밍 방식 고려
네트워크 호출: 배치 처리 및 캐싱 전략 적용

3. 구조화 및 설계
🏗️ 모듈화와 폴더 구조
RULE: 기능별 폴더 분리와 모듈화를 강제하라

3.1 의존성 관리
높은 의존성 코드 분리: 외부 API, 데이터베이스 연결 등
인터페이스 활용: 의존성 주입을 통한 느슨한 결합
환경별 설정 분리: development, staging, production

4. 품질 보증
✅ 코드 품질 검증
RULE: 작성 중 실시간 품질 검증을 수행하라
4.1 실시간 검증 항목

문법 오류 및 타입 오류 즉시 탐지
사용하지 않는 변수/함수 식별
잠재적 보안 취약점 스캔 (SQL 인젝션, XSS 등)

4.2 코드 복잡도 관리

순환 복잡도(Cyclomatic Complexity) 10 이하 유지
중첩 깊이 3단계 이하 권장
함수 매개변수 5개 이하 제한

5. 문서화 및 주석
📝 의미있는 문서화
RULE: 코드가 '무엇을'이 아닌 '왜'를 설명하라

6. 테스트 및 검증
🧪 테스트 주도 개발
RULE: 핵심 비즈니스 로직은 테스트 코드로 검증하라
7.1 테스트 작성 우선순위

핵심 비즈니스 로직 - 반드시 테스트 작성
에러 처리 로직 - 예외 상황 테스트
외부 연동 부분 - 모킹을 통한 테스트
단순 CRUD - 선택적 테스트

🎯 Roo Code 실행 체크리스트
코드 작성 전 (Pre-coding)

 프로젝트 구조 및 기존 패턴 분석 완료
 요구사항 명확히 이해하고 구현 계획 수립
 필요한 의존성 및 라이브러리 확인

코드 작성 중 (During-coding)

 함수별로 단일 책임 원칙 준수
 의미있는 변수명과 함수명 사용
 주요 로직에 목적 설명 주석 추가
 에러 처리 및 로깅 구현

코드 작성 후 (Post-coding)

 중복 코드 제거 및 리팩토링
 테스트 코드 작성 (핵심 로직)
 코드 품질 검증 (린팅, 타입 체크)
 문서화 및 예제 코드 작성

🚀 주니어 개발자를 위한 팁
1. 코드 작성은 글쓰기와 비슷합니다

문단(함수)별로 하나의 주제만 다루세요
읽는 사람이 이해하기 쉽게 써주세요
중요한 부분에는 설명(주석)을 달아주세요

2. 에러는 친구입니다

에러 메시지를 잘 읽어보세요
사용자에게 도움이 되는 메시지를 제공하세요
로그를 통해 문제 추적이 가능하게 하세요

3. 테스트는 보험입니다

코드가 의도대로 동작하는지 확인해주세요
미래의 자신이 고마워할 거예요


MCP의 AoT(Atom of Thoughts) 를 사용해서 코드를 작성해주세요.


### 생각 정리하기 
"단계별로 차근차근 생각해봅시다."
"답변하기 전에 모든 추론 과정을 보여주세요."
"심호흡을 하고 신중하게 작업해봅시다."
"천천히 논리적으로 접근하면서 각 단계가 타당한지 확인해봅시다."
"심호흡을 하고 정확한 답을 얻기 위해 단계별로 차근차근 해결해봅시다."
"[분야]의 최고 전문가처럼 생각해보세요. 그들이 사용할 모든 관련 요소와 방법론을 고려해봅시다."
"답변의 어떤 부분에 대해 확신이 서지 않는다면, 불확실성을 명확히 밝히고 그 이유를 설명해주세요."
"이 문제를 다각도(예: 경제적, 사회적, 윤리적)에서 분석해봅시다. 각 관점에서의 장단점은 무엇일까요?"
"해결책을 제안하기 전에, 먼저 이 문제의 근본 원인과 전제 가정들을 파악해봅시다."
"[구체적 질문 X]에 답하기 전에, 먼저 [더 넓은 주제 Y]와 관련된 일반적인 원리나 개념들을 살펴봅시다."
"초안 답변을 작성해보세요. 그 다음 잠재적 편향, 부정확성, 개선 영역에 대해 자신의 답변을 비판적으로 검토하세요. 마지막으로 수정되고 개선된 답변을 제공해주세요."
"이것은 복잡한 문제입니다. [3-5]개의 작고 관리 가능한 하위 문제로 나누어봅시다. 각 하위 문제를 체계적으로 해결해봅시다."


# 개발 협업 가이드라인

우리는 함께 프로덕션 수준의 코드를 개발하고 있습니다. 여러분의 역할은 유지보수 가능하고 효율적인 솔루션을 만들면서 잠재적인 문제를 미리 발견하는 것입니다.

제가 복잡하거나 막혀있는 것 같으면 방향을 잡아드릴 것이며, 제 가이드는 여러분이 목표에 집중할 수 있도록 도와줍니다.

## 🚨 자동화된 검사는 필수입니다

**모든 후크(hook) 문제는 차단 대상 - 모든 것이 ✅ 녹색이어야 합니다!**

오류 없음. 포맷팅 문제 없음. 린팅 문제 없음. 절대 용인하지 않습니다.
이는 제안이 아닙니다. 계속 진행하기 전에 모든 문제를 해결하세요.

## 핵심 워크플로우 - 반드시 이 순서를 따르세요!

### 조사 → 계획 → 구현

**절대로 코딩에 바로 뛰어들지 마세요!** 다음 순서를 항상 따르세요:

1. **조사**: 코드베이스 탐색, 기존 패턴 이해
2. **계획**: 상세한 구현 계획 수립 및 제게 확인 요청
3. **구현**: 검증 지점과 함께 계획 실행

어떤 기능을 구현해야 할 때는 먼저 말씀드립니다: "구현 전에 코드베이스를 조사하고 계획을 세우겠습니다."

복잡한 아키텍처 결정이나 도전적인 문제의 경우, 최대한의 추론 능력을 발휘하기 위해 **"초고도 사고(ultrathink)"**를 사용합니다. "이 아키텍처에 대해 해결책을 제안하기 전에 깊이 생각해보겠습니다."

### 여러 에이전트 활용!

더 나은 결과를 위해 *하위 에이전트를 적극적으로 활용*:

- 코드베이스의 여러 부분을 병렬로 탐색하는 에이전트 생성
- 한 에이전트는 테스트를 작성하고 다른 에이전트는 기능 구현
- 조사 작업 위임: "데이터베이스 스키마를 조사할 에이전트를 보내는 동안 API 구조를 분석하겠습니다"
- 복잡한 리팩토링의 경우: 한 에이전트는 변경 사항 식별, 다른 에이전트는 구현

여러 독립적인 부분이 있는 작업의 경우 "이 문제의 다른 측면을 처리할 에이전트를 생성하겠습니다"라고 말하세요.

### 현실 검증 지점

다음 순간에 **멈추고 검증**:

- 완전한 기능 구현 후
- 새로운 주요 구성 요소 시작 전
- 뭔가 잘못된 것 같을 때
- "완료" 선언 전
- **후크가 오류와 함께 실패할 때** ❌

실행: `make fmt && make test && make lint`

> 이유: 실제로 작동하는 것을 놓칠 수 있습니다. 이러한 검증 지점은 연쇄 실패를 방지합니다.
> 

### 🚨 중요: 후크 실패는 차단됩니다

**후크가 어떤 문제라도 보고하면(종료 코드 2) 반드시 다음을 수행해야 합니다:**

1. **즉시 중단** - 다른 작업 진행 금지
2. **모든 문제 해결** - 모든 ❌ 문제를 해결할 때까지 처리
3. **수정 확인** - 실패한 명령을 다시 실행하여 해결 확인
4. **원래 작업 계속** - 중단 전 하던 작업으로 돌아가기
5. **절대 무시 금지** - 경고 없음, 오직 요구사항만 존재

여기에는 다음이 포함됩니다:

- 포맷팅 문제 (gofmt, black, prettier 등)
- 린팅 위반 (golangci-lint, eslint 등)
- 금지된 패턴 (time.Sleep, panic(), interface{})
- 기타 모든 검사

코드는 100% 깨끗해야 합니다. 예외 없음.

**복구 프로토콜:**

- 후크 실패로 중단된 경우, 원래 작업에 대한 인식 유지
- 모든 문제 해결 및 수정 확인 후, 중단된 지점부터 계속 진행
- TODO 목록을 사용하여 수정 및 원래 작업 추적

## 작업 메모리 관리

### 컨텍스트가 길어질 때:

- [CLAUDE.md](http://claude.md/) 파일 다시 읽기
- [PROGRESS.md](http://progress.md/) 파일에 진행 상황 요약
- 주요 변경 전 현재 상태 문서화

### [TODO.md](http://todo.md/) 유지 관리:

```
## 현재 작업
- [ ] 지금 하고 있는 것

## 완료
- [x] 실제로 완료되고 테스트된 것

## 다음 단계
- [ ] 다음에 할 일

```

## Go 언어 특화 규칙

### 금지 - 절대 하지 마세요:

- **interface{}** 또는 **any{}** 사용 금지 - 구체적인 타입 사용!
- **time.Sleep()** 또는 바쁜 대기 금지 - 동기화에는 채널 사용!
- 구형과 신형 코드를 함께 보관 금지
- 마이그레이션 함수 또는 호환성 계층 금지
- 버전이 붙은 함수 이름 금지 (processV2, handleNew)
- 사용자 정의 오류 구조체 계층 금지
- 최종 코드에 TODO 금지

> 자동화된 집행: 스마트-린트 후크는 이러한 규칙을 위반하는 커밋을 차단합니다.
> 
> 
> `❌ 금지된 패턴`을 보면 즉시 수정해야 합니다!
> 

### 필수 표준:

- 대체 시 이전 코드 삭제
- 의미 있는 이름: `userID`와 같이 사용, `id` 금지
- 중첩 줄이기 위한 조기 반환
- 생성자의 구체적인 타입: `func NewServer() *Server`
- 간단한 오류: `return fmt.Errorf("context: %w", err)`
- 복잡한 로직은 테이블 기반 테스트
- 동기화에 채널 사용: sleep 대신 채널로 준비 신호
- 타임아웃에는 select 사용: sleep 루프 대신 타임아웃 채널과 select 사용

## 구현 표준

### 우리의 코드가 완성된 상태:

- ? 모든 린터 통과 (문제 없음)
- ? 모든 테스트 통과
- ? 엔드투엔드 기능 작동
- ? 이전 코드 삭제
- ? 모든 외부 공개 심볼에 Godoc 작성

### 테스트 전략

- 복잡한 비즈니스 로직? 먼저 테스트 작성
- 단순 CRUD? 이후에 테스트 작성
- 핵심 경로? 벤치마크 추가
- main() 및 간단한 CLI 파싱은 테스트 생략

### 프로젝트 구조

```
cmd/        # 애플리케이션 진입점
internal/   # 비공개 코드 (대부분의 코드가 여기 위치)
pkg/        # 공개 라이브러리 (진정으로 재사용 가능한 경우에만)

```

## 함께 문제 해결하기

막히거나 혼란스러울 때:

1. **멈추기** - 복잡한 해결책으로 빠져들지 마세요
2. **위임** - 병렬 조사를 위한 에이전트 고려
3. **초고도 사고** - 복잡한 문제의 경우 "이 도전을 깊이 생각해야 합니다"라고 말해 더 깊은 추론 유도
4. **뒤로 물러서기** - 요구사항 다시 읽기
5. **단순화** - 대개 간단한 해결책이 정확합니다
6. **질문하기** - "두 가지 접근법을 보았습니다: [A] 대 [B]. 어느 것을 선호하시나요?"

더 나은 접근 방식에 대한 제 통찰을 귀중하게 여깁니다 - 주저 말고 물어보세요!

## 성능 & 보안

### **먼저 측정**:

- 성급한 최적화 금지
- 더 빠르다고 주장하기 전에 벤치마크
- 실제 병목 지점은 pprof 사용

### **보안 최우선**:

- 모든 입력 검증
- 무작위성은 crypto/rand 사용
- SQL에는 prepared statements (절대 문자열 연결 금지!)

## 커뮤니케이션 프로토콜

### 진행 상황 업데이트:

```
✓ 인증 구현 (모든 테스트 통과)
✓ 속도 제한 추가
✗ 토큰 만료 문제 발견 - 조사 중

```

### 개선 제안:

"현재 접근 방식은 작동하지만, [관찰 내용]을 발견했습니다.
[구체적 개선 사항]을 진행하길 원하시나요?"

## 협업 방식

- 항상 기능 브랜치에서 작업 - 이전 버전과의 호환성 불필요
- 확신이 서지 않으면 영리함보다 명확성 선택
- **알림**: 이 파일을 30분 이상 참조하지 않았다면 다시 읽으세요!

복잡한 추상화나 "영리한" 코드는 피하세요. 간단하고 명확한 해결책이 대개 더 좋으며, 제 가이드는 중요한 것에 집중하도록 도와줍니다.



