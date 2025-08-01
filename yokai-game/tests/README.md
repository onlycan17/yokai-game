# 요괴의 성 탈출 - 테스트 디렉토리

이 디렉토리는 '요괴의 성 탈출' 게임의 모든 테스트 파일들을 체계적으로 관리합니다.

## 디렉토리 구조

```
tests/
├── unit/          # 단위 테스트 - 개별 함수 및 모듈 테스트
├── integration/   # 통합 테스트 - 모듈 간 상호작용 테스트
├── e2e/          # End-to-End 테스트 - 전체 게임 플로우 테스트
├── performance/   # 성능 테스트 - 렌더링 및 메모리 사용량 테스트
├── fixtures/      # 테스트 데이터 및 HTML 테스트 페이지
└── docs/         # 테스트 관련 문서
```

## 테스트 실행 방법

### 모든 테스트 실행
```bash
npm test
```

### 개별 테스트 타입 실행
```bash
npm run test:unit        # 단위 테스트만 실행
npm run test:integration # 통합 테스트만 실행
npm run test:e2e        # E2E 테스트만 실행
npm run test:performance # 성능 테스트만 실행
```

## 테스트 파일 설명

### E2E 테스트 (e2e/)
- `gameplay-test.js` - 전체 게임 플레이 시나리오 테스트
- `playwright-test.js` - Playwright를 사용한 브라우저 자동화 테스트

### 통합 테스트 (integration/)
- `turn-system-test.js` - 턴 시스템과 게임 상태 관리 테스트

### 성능 테스트 (performance/)
- `performance-test.js` - 게임 성능 및 메모리 사용량 테스트

### 테스트 픽스처 (fixtures/)
- `test-basic-game.html` - 기본 게임 테스트를 위한 HTML 페이지
- `test-performance.html` - 성능 테스트를 위한 HTML 페이지

### 문서 (docs/)
- `TURN_SYSTEM_TEST_GUIDE.md` - 턴 시스템 테스트 가이드

## 새로운 테스트 추가

새로운 테스트를 추가할 때는 다음 가이드라인을 따르세요:

1. 테스트 파일명은 `[기능명]-test.js` 형식으로 작성
2. 적절한 디렉토리에 배치
3. 테스트 설명과 예상 결과를 명확히 문서화
4. 독립적으로 실행 가능하도록 작성