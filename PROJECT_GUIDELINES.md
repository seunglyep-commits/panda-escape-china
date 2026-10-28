# Project Guidelines — 판다 연구소 구출 작전 (중학교 중국어 1~3과 방탈출 게임)

## 프로젝트 식별 정보 (DoRms 연수 규칙 준수)
- **프로젝트 이름**: `panda-escape-china` (판다 연구소 구출 작전 - 미래엔 중학교 중국어 1~3과 협동 방탈출)
- **GitHub 저장소 URL**: `https://github.com/seunglyep-commits/panda-escape-china`
- **Supabase Project Ref**: `eisbuxstuqjqzxokomeq` (`https://eisbuxstuqjqzxokomeq.supabase.co`, Region: `ap-northeast-2`)
- **Vercel Project ID**: `prj_YR0k2q1pgol2PXGnoB9RgqV86iso`
- **Vercel Org ID**: `team_VUFrOfhjrj52Y8NK9isbNQvB` (`seunglyep-5380`)

## 보안 및 데이터 접근 원칙
- `.env.local`, `.vercel`, 인증 정보 및 비밀값은 절대 Git에 커밋하지 않는다.
- 클라이언트에는 공개용 키(`VITE_SUPABASE_PUBLISHABLE_KEY`)만 사용하며, 플레이어 인증 토큰 원본은 서버에서 SHA-256 해시(`player_token_hash`)로만 대조하고 SELECT 권한을 차단(`REVOKE SELECT ON TABLE public.escape_players`)한다.
- 비로그인(코드/토큰 미제공), 본인(일치하는 `player_uid` + `player_token`), 타인(다른 `player_uid`/`player_token`) 접근 통제를 RLS 및 `SECURITY DEFINER` RPC로 검증한다.
