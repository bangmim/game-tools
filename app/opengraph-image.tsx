import { ImageResponse } from "next/og";

export const alt = "게임 도구 — 신작 모바일 게임 뽑기 확률 계산기 · 쿠폰 모음";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          background:
            "linear-gradient(135deg, #3442c4 0%, #4958db 60%, #6b78ea 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            color: "#ffc83d",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Game Tools
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.1,
            marginTop: 24,
          }}
        >
          뽑기 10만원 쓰기 전,
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            lineHeight: 1.1,
            color: "#ffc83d",
          }}
        >
          1분 확인
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 36,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          신작 모바일 게임 확률 계산기 · 쿠폰 모음
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#1c1f4a",
              color: "#ffc83d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            GT
          </div>
          <span>gameting.netlify.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
