# 금광 키우기 (mineral-vault)

앱인토스(Apps in Toss) 미니앱. 방치형 채굴 게임.

## 개발 서버 실행

```bash
pnpm install
pnpm dev
```

## ⚠️ Codespaces(또는 로컬이 아닌 원격 브라우저)에서 흰 화면 + `@toss/tds-mobile은 앱인토스 개발에만 사용할 수 있어요` 오류

### 원인 (SDK 소스로 확인함)

`@toss/tds-mobile`(현재 설치 버전 2.5.1)의 번들(`dist/esm/index.js`, `dist/cjs/index.js`) 맨 앞에는 모듈을 **import하는 순간 바로 실행되는 IIFE**가 있다. 이 코드가 하는 일:

1. `window.location.hostname`을 읽는다(없으면 `document.domain`으로 폴백).
2. 호스트를 `.`으로 나눠 배열 순서를 뒤집고, 각 라벨을 해시한다.
3. 해시 값을 내부에 하드코딩된(난독화된) 허용 목록과 비교한다.
4. 일치하지 않으면 이렇게 throw한다:

   ```
   throw new Error("@toss/tds-mobile은 앱인토스 개발에만 사용할 수 있어요.");
   // 디코드하면: "@toss/tds-mobile은 앱인토스 개발에만 사용할 수 있어요."
   ```

`src/main.tsx`가 최상단에서 `@toss/tds-mobile`을 import하기 때문에, 이 체크를 통과하지 못하면 **모듈 평가 자체가 실패**해서 `createRoot(...).render(...)`가 아예 실행되지 않는다. 그래서 화면은 흰 화면(`#root`가 비어 있음)이 되고, 에러는 콘솔에만 뜬다. React 컴포넌트 트리와는 무관하게, TDS를 import하는 그 시점에 이미 끝나는 문제다.

**직접 재현해서 확인함**(Playwright, `--host-resolver-rules`로 브라우저 프로세스만 fake DNS를 준 것이지 앱 코드나 시스템 설정은 건드리지 않음):
- `http://localhost:5175/` → 통과, TDS 컴포넌트 정상 렌더 (에러 없음)
- 가짜 Codespaces 스타일 호스트(`*.app.github.dev`)로 접속 → **정확히 위 에러가 그대로 재현됨**, `#root` 내용 0글자

### 왜 Vite 자체는 막지 않고 통과시키는가

별개로 Vite 개발 서버에도 자체 호스트 체크(`server.allowedHosts`, Vite 소스 `dist/node/chunks/node.js`에서 확인)가 있다. 이건 HTTP `Host` 헤더를 검사하는 것으로, `localhost`/IP가 아닌 낯선 호스트면 403 `Blocked request. This host ("...") is not allowed.`을 반환한다. 이건 tds-mobile의 체크와 **완전히 다른 레이어**다:

- Vite의 체크: 서버가 받는 HTTP `Host` 헤더 (Codespaces 포워딩 프록시가 내부적으로 `localhost`로 흘려보내면 여기서는 통과할 수 있음)
- tds-mobile의 체크: 브라우저의 `window.location.hostname` (주소창에 실제로 보이는 `*.app.github.dev` 그대로)

그래서 "Vite는 페이지를 정상적으로 서빙했는데 화면은 하얗고 콘솔에만 에러가 뜬다"는 증상이 나온다 — 두 체크가 서로 다른 값을 보고 있어서다.

**⚠️ 확인 필요**: Codespaces의 포트 포워딩 프록시가 실제로 `Host` 헤더를 어떻게 넘기는지(내부적으로 `localhost`로 재작성하는지 등)는 GitHub Codespaces 자체의 동작이라 이 환경에서 직접 검증하지 못했다. Vite 소스에는 `github.dev`/`codespaces`/`gitpod` 같은 특별 처리가 전혀 없는 것은 확인했다(코드에 해당 문자열 자체가 없음) — 즉 Vite가 Codespaces를 자동으로 알아서 허용해주는 게 아니라는 것만은 확실하다.

### 환경 검사 우회는 하지 않음

말씀하신 대로 `window.location`을 패치하거나 해시 테이블을 역산해서 허용 목록에 몰래 추가하는 식의 코드는 넣지 않았다. 이건 SDK가 의도적으로 만들어둔 게이트라 코드로 우회하는 건 이 프로젝트에서 할 일이 아니라고 판단했다.

## devtools가 흉내 낼 수 있는 것 / 없는 것

`@apps-in-toss/devtools`(공식 README 기준)는 **오직 `@apps-in-toss/web-framework`의 native bridge 호출**(Storage, 광고, IAP, 권한 등)만 mock으로 치환한다. `@toss/tds-mobile`은 devtools의 관할 밖이다 — README에 나열된 플러그인 옵션(`panel`, `entryPattern`, `sdkVersion`, `forceEnable`, `mock`, `initialState`, `mcp`) 어디에도 호스트/도메인 관련 옵션이 없다.

devtools의 **Viewport 탭**이 기기 프리셋을 고르면 `navigator.userAgent` · `navigator.platform` · `devicePixelRatio` · `screen.*`을 그 기기 값으로 override하긴 하지만(공식 문서에 명시), 이 목록에 `window.location.hostname`은 없다. 그러니 devtools를 아무리 설정해도 tds-mobile의 이 게이트는 통과되지 않는다 — 완전히 별개의 메커니즘이라서다.

즉: **로컬 브라우저(어떤 호스트든)에서 TDS를 쓰는 화면은 devtools로도 못 띄운다.** devtools의 "로컬 브라우저 개발" 안내(공식 README: "토스 앱도 실기기도 필요 없고 HMR이 그대로 살아 있어 반복 주기가 가장 짧아요")는 `@apps-in-toss/web-framework` API 호출부에만 해당하는 얘기다.

## 폰 샌드박스 앱으로 확인하기

**확인됨** (`.ait` 빌드 → 배포 경로, `@apps-in-toss/cli` 소스로 확인):

1. `pnpm add -D` 상태에서 `ait token add`로 콘솔 API 토큰을 `~/.ait/credentials`에 등록
2. `pnpm build` (내부적으로 `vite build && ait build` 실행 → 프로젝트 루트에 `mineral-vault.ait` 생성)
3. `ait deploy` (또는 `pnpm run deploy`)로 `.ait` 업로드
4. 콘솔에서 QR 발급 → 토스 앱으로 스캔 → 샌드박스 환경에서 실행

**⚠️ 확인 필요** (원문 문서 접근이 막혀 있어 이번에도 확정 못함):

- `vite dev`로 띄운 **HMR 살아있는 로컬 개발 서버**를 매번 `.ait`로 빌드하지 않고 폰 샌드박스 앱에서 바로 열어보는 공식 방법(원래 시안 스펙에 언급된 "같은 Wi-Fi, 스킴" 방식). 짐작가는 형태는 있지만(로컬 IP로 `vite dev --host` 노출 + 토스 앱의 개발자 모드에서 스킴 URL 입력) 정확한 스킴 형식과 절차는 공식 문서 원문 확인이 필요하다.
- Codespaces처럼 로컬 IP가 아예 없는 원격 컨테이너 환경에서는 "같은 Wi-Fi" 방식 자체가 성립하지 않는다. Codespaces의 포워딩된 HTTPS 주소(`*.app.github.dev`)를 폰 토스 앱이 그대로 열 수 있는지, 그리고 그 경우에도 TDS를 쓰는 화면은 위에서 설명한 hostname 게이트에 걸릴지(콘솔이 발급하는 실제 앱인토스 도메인이 아니므로 걸릴 가능성이 높음)도 미확인이다.
- `@apps-in-toss/debugger` / `@apps-in-toss/debug-console` (devtools 패키지 README에 언급됨)는 이미 실행 중인 실기기 WebView에 원격으로 CDP 연결하는 도구로 보이는데, 이게 "빌드 전 로컬 dev 서버를 폰에서 직접 열기"에도 쓰이는 건지, 아니면 실제 SDK 기반으로 이미 열려 있는 미니앱을 디버깅하는 용도인지 확실하지 않다.

이 부분은 실제 콘솔/문서에 접근하실 수 있는 사용자분 쪽에서 확인해주시면 정확한 절차로 채워넣겠습니다.

## TDS 없이 브라우저(Codespaces 포함)에서 미리보기 가능하게 만들기 — 선택 사항

게임 앱이라 TDS는 필수가 아니므로, TDS를 쓰는 부분만 별도로 분리하면 로컬/Codespaces 브라우저에서 즉시 프리뷰가 가능해진다. 현재 TDS를 쓰는 곳은 `src/main.tsx`(`TDSMobileProvider`, `useUserAgent`)와 각 화면의 `Text`/`Button` 컴포넌트뿐이다.

**장점**
- Codespaces를 포함해 어떤 브라우저에서도 즉시 프리뷰 가능 (hostname 게이트 자체가 사라짐)
- HMR 반복 주기가 빨라짐 — 매번 실기기/샌드박스 앱을 거칠 필요 없음
- TDS 번들(5MB+, 결과물 1.2MB 이상)이 빠지므로 빌드가 가벼워짐
- 디자이너·기획자에게 링크 하나로 화면을 보여줄 수 있음(Codespaces 포워딩 URL 그대로)

**단점**
- 토스 네이티브 룩앤필(타이포그래피 스케일, 폰트 두께, 색 토큰, 접근성 폰트 대응)을 직접 재구현해야 해서 실기기와 미묘하게 달라질 수 있음
- "화면 확인"이 두 단계로 늘어남 — 브라우저 프리뷰(대체 컴포넌트)와 실기기(진짜 TDS)를 따로 봐야 최종 확인이 됨, 둘이 어긋나면 놓치기 쉬움
- TDS용 컴포넌트와 브라우저 프리뷰용 대체 컴포넌트를 두 벌 유지하거나, 추상화 레이어(예: `Text`/`Button`을 감싸는 자체 wrapper)를 만들어야 해서 코드가 한 겹 늘어남
- 빌드 설정에 분기(예: `import.meta.env.MODE`나 별도 alias)가 필요해서 설정이 살짝 복잡해짐
- 나중에 정말 TDS를 붙여야 할 시점에 두 버전 간 불일치를 몰아서 고쳐야 할 수 있음

선택은 말씀해주시면 그에 맞춰 진행하겠습니다.
