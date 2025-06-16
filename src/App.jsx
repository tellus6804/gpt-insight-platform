import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import logo from "./logo.png";
import loadingImg from "./assets/loading.png";
import {
  analyzeUserCommunicationStyle,
  extractUserSpeechOnly
} from "./modules/userAnalysis";
import bannerImg from "./assets/banner.png";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
const STORAGE_KEY = "gpt_insight_reports";
const PATENT_NOTICE = "© 2025 GPT Insight | Protected by Korean Patent Application No. 10-2025-0067545, 10-2025-0068036, PCT/KR2025/007500";
const MBTI_PROFILES = {
  ISTJ: {
    color: "#4A90E2",
    icon: "📘",
    tip: "구체적인 예시나 데이터 기반 설명을 추가하면 신뢰도가 더욱 높아집니다."
  },
  ISFJ: {
    color: "#1A73E8",
    icon: "💚",
    tip: "의도를 더 명확히 전달하기 위해 질문에 목적을 간결하게 포함하세요."
  },
  INFJ: {
    color: "#9013FE",
    icon: "🔮",
    tip: "직관에 의존한 질문이 많다면, 구체적인 근거나 사례를 덧붙이면 설득력이 높아집니다."
  },
  INTJ: {
    color: "#0A0A0A",
    icon: "♟️",
    tip: "전략적 질문은 훌륭하지만, 상대방의 이해를 돕기 위해 배경 설명도 함께 제시하세요."
  },
  INTP: {
    color: "#B8E986",
    icon: "🧠",
    tip: "논리적인 질문 외에도 실제 적용 사례를 함께 제시하면 효과적입니다."
  },
  ENFP: {
    color: "#F5A623",
    icon: "💡",
    tip: "아이디어는 많지만 흐름이 산만해질 수 있으므로 핵심을 요약하는 습관을 길러보세요."
  },
  ENTJ: {
    color: "#D0021B",
    icon: "📊",
    tip: "질문이 너무 빠르게 결론으로 향할 수 있으니, 상대의 의견을 유도하는 표현도 고려해보세요."
  },
  ESFJ: {
    color: "#7ED321",
    icon: "🌸",
    tip: "배려 중심 질문은 좋지만, 구체적인 요구사항을 함께 포함시키면 더 명확해집니다."
  },
  // 나머지 유형도 동일한 방식으로 추가 가능
};

const DIAGNOSE_ITEMS = [
  { name: "반복률", icon: "🔁" },
  { name: "환각 가능성", icon: "🦄" },
  { name: "명확성", icon: "🔎" },
  { name: "반영성", icon: "📥" },
  { name: "전문성", icon: "🎓" },
  { name: "논리성", icon: "🔗" },
  { name: "다양성", icon: "🌈" },
  { name: "정중함", icon: "🤝" },
  { name: "오타율", icon: "✏️" },
  { name: "적합성", icon: "✅" }
];

const getGrade = score => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
};

const getGradeColor = grade => {
  switch (grade) {
    case "A": return "#00C2C2";
    case "B": return "#21C586";
    case "C": return "#FFD500";
    case "D": return "#FF914D";
    default: return "#FF3B3B";
  }
};

const getHashScore = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 100);
};

export default function App() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    department: "",
    author: "",
    date: new Date().toISOString().slice(0, 10),
    question: ""
  });

  const [showBanner, setShowBanner] = useState(true);
    useEffect(() => {
    const timer = setTimeout(() => setShowBanner(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  const modalStyle = {
    position: "fixed",
    top: 0, left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  };
const rawInput = form.question || ""; // 전체 입력값
const userOnlyText = extractUserSpeechOnly(rawInput); // 🔍 사용자 발화만 자동 추출
const userStyleAnalysis = analyzeUserCommunicationStyle(userOnlyText); // 🧠 성향 분석

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(1);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [previousResult, setPreviousResult] = useState(null);
  const [selectedName, setSelectedName] = useState("");
// ✅ 이건 컴포넌트 최상단에!
const [openReasons, setOpenReasons] = useState([]);
useEffect(() => {
  if (result && openReasons.length === 0) {
    setOpenReasons(result.feedback.map(() => false));
  }
}, [result]);

  const handleAutoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("결과 링크가 복사되었습니다!");
  };

  const handleFeedbackCopy = () => {
    if (!result) return;
    const feedbackText = `
[GPT Insight 진단 결과]
- 이름: ${result.name}
- 일자: ${result.date}
- 총점: ${result.total}점 / 등급: ${result.grade}
// 총평 라인 삭제 또는 다른 정보로 대체
- 핵심 요약: ${result.insightfulSummary}
- 항목별 점수: ${DIAGNOSE_ITEMS.map((item, i) => `${item.name}:${result.scores[i]}`).join(", ")}
- 주요 피드백: ${result.feedback.map(f => f.replace(/●\s*/g, "")).join("; ")}
    `;
    navigator.clipboard.writeText(feedbackText);
    alert("진단 결과 요약이 복사되었습니다!\n인스타그램 DM이나 원하는 채널에 붙여넣어 전송하세요.");
    window.open("https://instagram.com/gpt.insight_kr", "_blank");
  };

  const handleReset = () => {
    setResult(null);
    setForm(f => ({ ...f, question: "" }));
  };

const handleDiagnose = () => {
  setLoading(true);
  setLoadingStage(1); // 1단계 로딩 문구

  // 2초 후 2단계 로딩 문구로 전환
  setTimeout(() => {
    setLoadingStage(2);
  }, 2000);

  // 4초 후 진단 로직 실행
  setTimeout(() => {
    const text = form.question.trim();
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const sentenceCount = text.split(/[.!?]/).filter(s => s.trim().length > 0).length;

    if (text.length < 100 || sentenceCount < 3 || uniqueWords.size < 20) {
      alert("❌ 분석 불가: 입력 내용이 부족합니다.\n\n⦁ 최소 100자 이상\n⦁ 최소 3문장 이상\n⦁ 고유 단어 20개 이상 입력해주세요.");
      setLoading(false);
      return;
    }

    const wordList = text.split(/\s+/);
    const totalWords = wordList.length;
    const wordFreq = {};
    wordList.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const maxDupRate = Math.max(...Object.values(wordFreq)) / totalWords;

    const hasWhyHow = /(왜|어떻게|무엇|방식|근거)/.test(text);
    const hasDomainWord = /(정책|기술|보고서|규제|법령|통계)/.test(text);

    const baseScore = getHashScore(text);
    const scores = DIAGNOSE_ITEMS.map((item, i) => {
      let score = baseScore;
      if (item.name === "반복률" && maxDupRate >= 0.1) score -= 20;
      if (item.name === "명확성" && !hasWhyHow) score -= 10;
      if (item.name === "전문성" && hasDomainWord) score += 5;
      return Math.max(0, Math.min(100, score));
    });

    const total = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const grade = getGrade(total);
    const feedback = getItemFeedback(scores);
    const summary = generateSummaryComment({ scores });
    const insightfulSummary = generateInsightfulSummary({ scores });
    const metadata = { maxDupRate, hasWhyHow, hasDomainWord };
    const feedbackReasons = getItemFeedbackReason(scores, metadata);

    const newResult = {
      ...form,
      scores,
      total,
      grade,
      feedback,
      feedbackReasons,
      insightfulSummary
    };

    const updated = [...history.filter(h => h.name !== form.name), newResult];
    const previous = history.find(h => h.name === form.name);
    setPreviousResult(previous || null);
    setHistory(updated);
    setResult(newResult);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setLoading(false); // ✅ 로딩 종료
  }, 4000);
};



const handleLoadPrevious = () => {
  const loaded = history.find(h => h.name === selectedName);
  if (loaded) {
    const currIndex = history.findIndex(h => h.name === selectedName);
    const previous = currIndex > 0 ? history[currIndex - 1] : null;

    setForm({
      name: loaded.name,
      company: loaded.company,
      department: loaded.department,
      author: loaded.author,
      date: loaded.date,
      question: loaded.question
    });

    setPreviousResult(previous); // ✅ 바로 이전 결과 자동 설정
    setResult(loaded);           // 현재 선택된 결과
  }
};

const improvementTemplates = {
  상승: [
    (name, diff) => `🔼 [${name}] 항목이 ${diff}점 상승했습니다. 질문의 맥락 전달이 개선되어 AI의 이해도가 높아진 결과입니다.`,
    (name, diff) => `✅ [${name}] 점수가 +${diff} 올랐습니다. 최근 입력에서 보다 구체적이고 명확한 표현이 사용된 것으로 보입니다.`,
    (name, diff) => `📈 [${name}] 항목이 개선되었습니다. 질문 흐름이나 논리 연결이 강화된 영향일 수 있습니다.`,
    (name, diff) => `🔹 [${name}] 항목이 향상되었습니다. 업무 맥락을 반영한 표현 방식이 긍정적 영향을 준 것으로 판단됩니다.`,
    (name, diff) => `📊 [${name}] +${diff} 상승. AI가 질문을 더욱 명확히 해석할 수 있도록 구성된 질문이 효과적이었습니다.`
  ],
  하락: [
    (name, diff) => `⚠️ [${name}] 항목이 ${Math.abs(diff)}점 하락했습니다. 추상적인 표현이 많아져 AI가 적절히 반응하지 못한 것으로 추정됩니다.`,
    (name, diff) => `🔻 [${name}] 점수가 -${Math.abs(diff)} 감소했습니다. 질문의 핵심 전달이 부족했을 가능성이 높습니다.`,
    (name, diff) => `❗ [${name}] 항목이 하락했습니다. 최근 응답에서 근거나 명확성이 다소 부족했을 수 있습니다.`,
    (name, diff) => `🚫 [${name}] 항목 점수 저하. 질문의 목적이 불분명하거나, 맥락이 흐릿해진 것으로 분석됩니다.`,
    (name, diff) => `🛑 [${name}] -${Math.abs(diff)} 하락. AI가 사용자의 의도를 정확히 파악하지 못했을 가능성이 큽니다.`
  ]
};

const renderComparisonChart = () => {
  if (!result) return null;

  if (!previousResult) {
    return (
      <div style={{ maxWidth: 800, margin: "40px auto" }}>
        <h3 style={{ textAlign: "center", marginBottom: 16 }}>📊 항목별 점수 추이</h3>
        <Line
          data={{
            labels: DIAGNOSE_ITEMS.map(i => i.name),
            datasets: [
              {
                label: "현재 점수",
                data: result.scores,
                fill: false,
                borderColor: "#00C2C2",
                backgroundColor: "#21C586",
                tension: 0.3
              }
            ]
          }}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" }, title: { display: false } }
          }}
        />
      </div>
    );
  }

  const diffs = result.scores.map((score, i) => score - previousResult.scores[i]);

const comparisonInsights = diffs
  .map((diff, i) => {
    const name = DIAGNOSE_ITEMS[i].name;
    if (diff <= -10) {
      const templates = improvementTemplates["하락"];
      const template = templates[Math.floor(Math.random() * templates.length)];
      return template(name, diff);
    } else if (diff >= 5) {
      const templates = improvementTemplates["상승"];
      const template = templates[Math.floor(Math.random() * templates.length)];
      return template(name, diff);
    }
    return null;
  })
  .filter(msg => msg !== null);


  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: 16 }}>📊 항목별 점수 변화</h3>
      <Line
        data={{
          labels: DIAGNOSE_ITEMS.map(i => i.name),
          datasets: [
            {
              label: "이전 점수",
              data: previousResult.scores,
              fill: false,
              borderColor: "#ccc",
              tension: 0.3
            },
            {
              label: "현재 점수",
              data: result.scores,
              fill: false,
              borderColor: "#00C2C2",
              backgroundColor: "#21C586",
              tension: 0.3
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: "top" }, title: { display: false } }
        }}
      />

      {comparisonInsights.length > 0 && (
        <div style={{ marginTop: 28 }}>
                    {comparisonInsights.map((msg, idx) => (
            <p
              key={idx}
              style={{
                fontSize: 15,
                color: msg.startsWith("⚠️") ? "#d02c2c" : "#236943",
                marginBottom: 6
              }}
            >
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};


  return (
    <div style={{ fontFamily: "맑은 고딕, sans-serif", background: "#f7fafc", minHeight: "100vh", paddingBottom: 40 }}>
          {/* ✅ 배너 여기 삽입 */}
    {showBanner && (
      <div style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        background: "#e8fcff",
        padding: "24px 32px",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        zIndex: 9999,
        textAlign: "center"
      }}>
        <img
          src={bannerImg}
          alt="업데이트 안내"
          style={{ width: 450, maxWidth: "90%" }}
        />
      </div>
    )}
      {!result && (
        <>
          <h1 style={{ textAlign: "center", color: "#00C2C2", paddingTop: 36 }}>
            🧠 GPT Insight 진단 시스템
          </h1>
          <section style={{
            maxWidth: 600, margin: "36px auto 0", background: "#fff",
            borderRadius: 22, boxShadow: "0 6px 28px #003c4624", padding: 36, border: "2px solid #e5f4f9"
          }}>
            <input placeholder="이름" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%", marginBottom: 12, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
<input
  type="text"
  value={form.company}
  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
  placeholder="회사"
  style={{ display: "none" }}
/>

<input
  type="text"
  value={form.department}
  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
  placeholder="부서"
  style={{ display: "none" }}
/>

<input
  type="text"
  value={form.author}
  onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
  placeholder="작성자"
  style={{ display: "none" }}
/>

              <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} type="date" style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
            </div>
            <textarea
  value={form.question}
  onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
  onInput={handleAutoResize}
  placeholder="GPT와 실제 대화한 내용을 전체복사하여 붙여 넣어주세요."
  rows={4}
  style={{
    width: "100%",
    fontSize: 16,
    padding: 10,
    borderRadius: 8,
    border: "1.5px solid #d9eef3",
    marginBottom: 24,
    resize: "none",
    overflow: "hidden"
  }}
></textarea>

            <button
  onClick={handleDiagnose}
  style={{
    width: "100%",
    padding: 14,
    borderRadius: 11,
    background: "linear-gradient(90deg,#00C2C2,#21C586)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
    cursor: "pointer",
    boxShadow: "0 2px 6px #00c2c233",
    border: "none" // border 중복 없음
  }}
>
  진단 시작
</button>
{loading && (
  <div style={modalStyle}>
    <div style={{
      textAlign: "center",
      background: "#fff",
      padding: 40,
      borderRadius: 14,
      boxShadow: "0 2px 10px rgba(0,0,0,0.25)"
    }}>
      <img src={loadingImg} alt="로딩 중" style={{ width: 160, marginBottom: 20 }} />
<div style={{ fontSize: 18, fontWeight: 600, color: "#333", textAlign: "center", marginTop: 32 }}>
  {loadingStage === 1 && "🧭 입력 내용을 기반으로 사용자의 표현 패턴을 정밀 분석 중입니다."}
  {loadingStage === 2 && "🔍 AI가 주요 개선 포인트를 도출하고 있습니다."}
</div>

    </div>
  </div>
)}

<div style={{ marginTop: 24 }}>
  <select
    value={selectedName}
    onChange={e => setSelectedName(e.target.value)}
    style={{
      width: "100%",
      padding: 10,
      borderRadius: 8,
      border: "1.5px solid #d9eef3",
      fontSize: 15,
      marginBottom: 8
    }}
  >
    <option value="">[ 이전 진단 결과 선택 ]</option>
    {history.map((h, idx) => (
      <option key={idx} value={h.name}>
        {h.name} ({h.date})
      </option>
    ))}
  </select>
  <button
    onClick={handleLoadPrevious}
    style={{
      width: "100%",
      padding: 12,
      border: "none", // border 중복 없음
      borderRadius: 10,
      background: "#eeeeee",
      color: "#333",
      fontWeight: 800,
      fontSize: 15,
      cursor: "pointer"
    }}
  >
    불러오기
  </button>
</div>
          </section>
          <div style={{
            display: "flex", justifyContent: "center", margin: "46px 0 0 0", width: "100%",
          }}>
            <div style={{
              background: "linear-gradient(104deg, #fff 78%, #f7fafc 100%)",
              borderRadius: 18, border: "1.3px solid #e3eaf1", boxShadow: "0 4px 24px #c3d3dd29",
              maxWidth: 640, minWidth: 320, width: "100%", padding: "36px 38px 20px 38px", textAlign: "center", fontFamily: "맑은 고딕, Pretendard, sans-serif"
            }}>
              <div style={{ fontSize: 17.5, fontWeight: 800, color: "#00b3b3", marginBottom: 2, letterSpacing: -0.3 }}>
                GPT Insight 플랫폼 안내
              </div>
              <div style={{ fontSize: 16.1, color: "#1c3553", fontWeight: 600, margin: "13px 0 10px 0", lineHeight: 1.68 }}>
                <span style={{ color: "#00B6B6", fontWeight: 900 }}>GPT Insight</span>는 조직의 AI 활용 오류·반복·환각 등 리스크를 <b style={{ color: "#21989c" }}>정량 진단</b>하고,<br />
                실시간 개선 가이드와 리포트를 제공하는 <span style={{ color: "#21C586", fontWeight: 700 }}>AI 신뢰성 진단 플랫폼</span>입니다.<br />
                누구나 쉽고 객관적으로 GPT/AI의 활용 수준을 <span style={{ color: "#21989c" }}>수치와 보고서</span>로 확인하세요.
              </div>
              <div style={{
                fontSize: 14.1, color: "#223a53", fontWeight: 500,
                margin: "8px 0 7px 0", lineHeight: 1.62
              }}>
                <b>GPT Insight</b> automatically diagnoses hallucination, repetition, and reflection errors in organizational AI usage,<br />
                providing improvement guides and instant reports.<br />
                <span style={{ color: "#0096A5", fontWeight: 700 }}>
                  Quantify and visualize your GPT/AI performance with objective metrics and reports.
                </span>
              </div>
              <div style={{
                width: "95%", margin: "18px auto 17px auto",
                borderTop: "1px dashed #dae4ef"
              }} />
              <div style={{
                fontSize: 13.5, color: "#52687b", margin: "0 0 2px 0", lineHeight: 1.65,
                fontWeight: 500, letterSpacing: 0.03
              }}>
                <span style={{ fontWeight: 700, color: "#008898" }}>[데이터 안내] </span>
                본 플랫폼에서 입력된 데이터는 진단 품질 개선, 맞춤형 서비스 제공, 통계·기술 개발 목적으로 수집·활용될 수 있습니다.
                데이터는 안전하게 보호되며, 개인정보 관련 법령에 따라 처리됩니다.<br />
                <span style={{ color: "#888" }}>[Notice] User data may be collected for service improvement, personalization, statistics, or legal/technical basis. All data is securely protected and processed in accordance with privacy laws.</span>
              </div>
            </div>
          </div>
          <div style={{
            width: "100%", textAlign: "center", color: "#90a7b1",
            fontSize: 13, margin: "44px 0 0 0", letterSpacing: 0.2, fontWeight: 600
          }}>
            {PATENT_NOTICE}
          </div>
        </>
      )}
{loading && (
  <div style={{ fontSize: 17, marginTop: 40, textAlign: "center", color: "#00C2C2" }}>
    {loadingStage === 1 && "🧭 입력 내용을 기반으로 사용자의 표현 패턴을 정밀 분석 중입니다."}
    {loadingStage === 2 && "🔍 AI가 주요 개선 포인트를 도출하고 있습니다."}
  </div>
)}
      {result && (
        <>
          <section style={{
            maxWidth: "700px", background: "#fff", borderRadius: "24px",
            boxShadow: "0 6px 28px #003c4624", padding: "36px", margin: "32px auto 40px auto",
            border: "2px solid #e5f4f9", position: "relative"
          }}>
            {/* 리포트 헤더 */}
            <div style={{
              display: "flex", alignItems: "center", width: "100%", marginBottom: 30
            }}>
              <div style={{ flex: "none", marginRight: 20 }}>
                <img src={logo} alt="GPT Insight 로고"
                  style={{ width: 90, height: 90, borderRadius: 14, boxShadow: "0 2px 8px #e7eaec", background: "#fff" }} />
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#003c46", letterSpacing: -1, marginBottom: 2 }}>
                  GPT Insight Executive Report
                </div>
                <div style={{ fontSize: 14.5, color: "#21C586", fontWeight: 700, marginTop: 3, letterSpacing: "0.12em" }}>
                </div>
              </div>
            </div>
            {/* 진단 정보 박스 */}
            <div style={{
              display: "flex", justifyContent: "center", marginBottom: 18
            }}>
              <table style={{
                background: "#f6fcfd", borderRadius: 12, boxShadow: "0 1px 6px #e3f8f8", fontSize: 15,
                fontWeight: 600, color: "#234c52", borderCollapse: "collapse", minWidth: 320
              }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>이름</td>
                    <td style={{ padding: "6px 16px" }}>{result.name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>진단일자</td>
                    <td style={{ padding: "6px 16px" }}>{result.date}</td>
                  </tr>
                  
{/* <tr>
  <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>회사/부서</td>
  <td style={{ padding: "6px 16px" }}>{result.company} / {result.department}</td>
</tr>
<tr>
  <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>작성자</td>
  <td style={{ padding: "6px 16px" }}>{result.author}</td>
</tr> */}
                </tbody>
              </table>
            </div>
            
            {/* AI 활용도 진단 요약 및 해석 */}
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
              1. AI 활용도 진단 요약 및 해석
            </h2>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 7, color: "#003c46" }}>
              총점 <span style={{ color: "#00C2C2" }}>{result.total}점</span> &nbsp;등급: <span style={{ color: getGradeColor(result.grade) }}>{result.grade}</span>
            </div>
            <ScoreInterpretation score={result.total} />
            {/* 점수표 */}
            <table
              style={{
                width: "100%", marginTop: 14, borderCollapse: "separate", borderSpacing: 0,
                background: "#f9fcfd", borderRadius: 10, fontSize: "13px", boxShadow: "0 1px 6px #e3f8f8"
              }}>
              <thead>
                <tr style={{ background: "#e5f4f9", fontSize: "14.5px", height: "32px" }}>
                  <th style={{ textAlign: "center", padding: "6px 0" }}>항목</th>
                  <th style={{ textAlign: "center", padding: "6px 0" }}>점수</th>
                  <th style={{ textAlign: "center", padding: "6px 0" }}>설명</th>
                </tr>
              </thead>
              <tbody>
                {DIAGNOSE_ITEMS.map((item, i) => (
                  <tr key={item.name} style={{ height: "20px" }}>
                    <td style={{
                      textAlign: "left", padding: "4px 18px 4px 28px", fontWeight: 700,
                      color: "#003c46", fontSize: "13px", whiteSpace: "nowrap"
                    }}>
                      <span style={{ fontSize: "17px", marginRight: 16 }}>{item.icon}</span>
                      {item.name}
                    </td>
                    <td style={{
                      textAlign: "center", padding: "4px 16px",
                      color:
                        result.scores[i] >= 90 ? "#00C2C2" :
                          result.scores[i] >= 80 ? "#21C586" :
                            result.scores[i] >= 70 ? "#FFD500" :
                              result.scores[i] >= 60 ? "#FF914D" : "#FF3B3B",
                      fontWeight: 800
                    }}>
                      {result.scores[i]}
                    </td>
                    <td style={{
                      textAlign: "left", padding: "4px 24px 4px 32px", color: "#003c46"
                    }}>
                      {
                        ["질문/답변의 반복 여부", "비논리/환각 응답 비율", "답변의 구체성/명확성", "질문 요구사항 반영 정도",
                          "분야 전문성", "논리 구조", "다양한 관점/사례 제시", "언어매너/존중", "오타, 비문 등", "업무/주제 부합성"][i]
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
{/* 항목별 상세 피드백 */}
<div style={{ marginTop: 28, marginBottom: 16 }}>
  <div style={{ fontSize: 16.5, fontWeight: 900, color: "#003c46", marginBottom: 12 }}>
    항목별 상세 피드백
  </div>
  <ul style={{
    paddingLeft: 18,
    color: "#17485e",
    fontSize: 15.3,
    lineHeight: 1.8
  }}>
    {result.feedback.map((msg, i) => (
      <li key={i} style={{ marginBottom: 18 }}>
        <b>{DIAGNOSE_ITEMS[i].name}</b>: {msg.replace(/^●\s*/, '')}

        {/* 💡 왜 이런 평가인가요? 버튼 */}
        {result.feedbackReasons?.[i] && (
          <div
            onClick={() => {
              const updated = [...openReasons];
              updated[i] = !updated[i];
              setOpenReasons(updated);
            }}
            style={{
              marginTop: 6,
              fontSize: 13.5,
              color: "#00a0a0",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            💡 <i>왜 이런 평가인가요?</i> {openReasons[i] ? "▲ 접기" : "▼ 펼치기"}
          </div>
        )}

        {/* 근거 설명 출력 */}
        {openReasons[i] && result.feedbackReasons?.[i] && (
          <div style={{
            marginTop: 8,
            padding: "10px 14px",
            background: "#f2fbfb",
            border: "1px solid #d0eeee",
            borderRadius: 8,
            fontSize: 13.4,
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            color: "#334"
          }}>
            {result.feedbackReasons[i]}
          </div>
        )}
      </li>
    ))}
  </ul>
</div>

<hr style={{ margin: "32px 0" }} />

{/* 2. 변화 그래프 및 핵심 요약 */}
<h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
  2. 변화 그래프 및 핵심 요약
</h2>
<ComparisonAnalysis result={result} previousResult={previousResult} />
{result && (
  <div style={{ marginTop: 36 }}>
    <h3 style={{ fontSize: 17, marginBottom: 14 }}>
      🧩 {previousResult ? "변화 해석" : "현재 상태 해석"}
    </h3>

    {previousResult ? (
      generateComparisonInsights(result.scores, previousResult.scores, DIAGNOSE_ITEMS).map((msg, i) => (
        <p
          key={i}
          style={{
            fontSize: 14.8,
            lineHeight: 1.8,
            color:
              msg.includes("⚠️") ? "#c0392b" :
              msg.includes("✅") ? "#2e7d32" : "#444",
            marginBottom: 12
          }}
          dangerouslySetInnerHTML={{ __html: msg }}
        />
      ))
    ) : (
      <p
        style={{
          fontSize: 14.8,
          lineHeight: 1.8,
          color: "#444",
          marginBottom: 12
        }}
        dangerouslySetInnerHTML={{
          __html: generateCurrentOnlyInsight(result.scores, userStyleAnalysis?.type)
        }}
      />
    )}
  </div>
)}

{userStyleAnalysis && (
  <section style={{ marginTop: 48, padding: "28px 36px", borderRadius: 20, background: "#f0f4f7", border: "2px solid #d8ebf2", fontSize: 17 }}>
    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>🧭 AI 기반 커뮤니케이션 성향 진단</h3>
<p><b>유형:</b>&nbsp;
  <span style={{ fontWeight: 600 }}>
    <span style={{ color: userStyleAnalysis.color }}>
      {userStyleAnalysis.icon}
    </span>&nbsp;
    {userStyleAnalysis.type} ({userStyleAnalysis.label})
  </span>
</p>




    <p><b>특징:</b> {userStyleAnalysis.description}</p>
    <p><b>🤖 GPT랑 더 친해지는 법!</b> {userStyleAnalysis.tip}</p>
  </section>
)}

<hr style={{ margin: "32px 0" }} />

{/* 💡 AI 기반 커뮤니케이션 성향 진단 */}
<h2 style={{
  fontSize: 18,
  fontWeight: 900,
  color: "#00a0a0",
  marginTop: 8,
  marginBottom: 4
}}>
  💡 AI 기반 커뮤니케이션 성향 진단
</h2>
{generateCommunicationProfile(result.scores, DIAGNOSE_ITEMS.map(i => i.name))}

<hr style={{ margin: "32px 0" }} />

{/* 3. 맞춤 제안 및 실행 가이드 */}
<h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
  3. 맞춤 제안 및 실행 가이드
</h2>

            <div style={{
              background: "#f7fcfa", borderRadius: 10, margin: "12px 0 0 0",
              padding: "16px 16px", fontSize: "15.3px", color: "#265575", lineHeight: 1.72, boxShadow: "0 1px 6px #e3f8f8"
            }}>
              <b>실행 가이드:</b>
              <div style={{
                background: "#f6fcfd", borderRadius: 10, marginTop: 22,
                padding: "16px 22px", fontSize: "15.5px", color: "#184a54", lineHeight: 1.85, boxShadow: "0 1px 6px #e0f3ff"
              }}>
                <b>진단 결과를 바탕으로 드리는 맞춤 실행 가이드</b>
                <div style={{ marginTop: 8, marginBottom: 8 }}>
                  이번 진단을 바탕으로, 앞으로의 GPT 활용이 더 풍부해질 수 있도록 작은 팁들을 모아봤습니다.<br />
                  각 항목별 분석과 함께, 실제로 도움이 되는 일상 활용법까지 꼭 참고해주세요.
                </div>
                <ul style={{ margin: "10px 0 0 18px" }}>
                  <li><b>반복률:</b> 전반적으로 안정적입니다. 비슷한 질문이 반복되면 “이전에 한 답변을 다시 보여줘” 등 명확 요청 권장.</li>
                  <li><b>환각 가능성:</b> 출처 없는 답변은 한 번 더 확인, “출처를 알려줘” 요청 추천.</li>
                  <li><b>명확성:</b> 답변이 모호하면, “조금 더 자세히 설명해줘” 식으로 질문 반복 추천.</li>
                  <li><b>반영성:</b> 질문 요구 누락된 부분은 “내 질문 중에 빠진 내용은 없는지” 직접 점검.</li>
                  <li><b>전문성/논리성/다양성/정중함/오타율/적합성:</b> 업무에서 “이유를 설명해줘”, “사례를 들어줘”와 같은 요청 적극 활용.</li>
                </ul>
                <div style={{ marginTop: 18 }}>
                  리포트 결과는 단순 평가표가 아니라,  
                  <b>업무 방식 성장</b>을 위한 안내서입니다.<br /><br />
                  자주 쓰는 질문은 템플릿화, 중요한 의사결정·교육자료는 리포트 개선 포인트 반영 추천.<br /><br />
                  <b>정기적 대화 패턴 리뷰</b>와 챗봇 설정·업무 표준화에 리포트 결과 활용시 <b>AI 협업 효율성</b>이 꾸준히 향상될 것입니다.
                </div>
                <div style={{ marginTop: 15, color: "#b3a4d3", fontSize: 13.5 }}>
                  더 나은 활용법 문의는 피드백 채널로!
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 14, color: "#6c9a9a" }}>
                <b>[보안 안내]</b> 입력 데이터는 AI 진단 품질 개선 및 통계 목적으로만 활용, 개인정보는 안전 보호.
              </div>
              <div style={{ marginTop: 14, fontSize: 14, color: "#b347b3" }}>
                <b>[피드백 남기기]</b> 개선 의견은 “피드백 남기기” 버튼으로 전달!
              </div>
            </div>
            <div style={{
              width: "100%", textAlign: "center", color: "#6aa9a9",
              fontSize: 12.5, marginTop: 35, letterSpacing: 0.1, fontWeight: 600
            }}>
              {PATENT_NOTICE}
            </div>
          </section>
{/* ✅ 피드백 안내 영역 (통합된 하나의 위치로 상단 배치) */}
<div style={{ textAlign: "center", marginTop: 40 }}>
  <p style={{ fontSize: 15, color: "#333", marginBottom: 12 }}>
    여러분의 의견이 GPT Insight를 더 발전시킵니다 💡
  </p>

  {/* 💬 Google Form 버튼 */}
  <a
    href="https://forms.gle/your-google-form-link"  // ← 실제 링크로 교체
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      padding: "12px 28px",
      background: "#B347B3",
      color: "#fff",
      borderRadius: 10,
      fontWeight: 600,
      fontSize: 16,
      textDecoration: "none",
      boxShadow: "0 2px 6px #b347b355",
      marginBottom: 6
    }}
  >
    💬 피드백 남기기
  </a>

  {/* 📷 Instagram 안내 */}
  <p style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
    또는{" "}
    <a
      href="https://instagram.com/your_instagram"
      target="_blank"
      style={{ color: "#557A95", textDecoration: "underline" }}
    >
      Instagram DM
    </a>
    으로 보내주셔도 좋아요!
  </p>

  {/* 🔘 하단 버튼: 다시 진단 / 결과 공유 */}
  <div
    style={{
      marginTop: 28,
      display: "flex",
      justifyContent: "center",
      gap: 12
    }}
  >
    <button
      onClick={handleReset}
      style={{
        padding: "12px 24px",
        borderRadius: 10,
        background: "#E8F0FE",
        color: "#2C73D2",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        border: "1px solid #c6dbff",
        boxShadow: "0 2px 5px #d0e3ff"
      }}
    >
      다시 진단
    </button>

    <button
      onClick={handleCopyLink}
      style={{
        padding: "12px 24px",
        borderRadius: 10,
        background: "#00C2A8",
        color: "#fff",
        fontWeight: 700,
        fontSize: 15,
        cursor: "pointer",
        border: "none",
        boxShadow: "0 2px 5px #00c2a844"
      }}
    >
      결과 공유
    </button>
  </div>
</div>


        </>
      )}
    </div>
  );
}

// === 항목별 상세 피드백 라이브러리 + 피드백 생성 ===
function getItemFeedback(scores) {
  const LIB = [
    [
      "● 반복 표현이 전체 단어의 5% 미만으로 매우 안정적인 흐름을 보여줍니다. 이는 AI가 불필요한 반복 없이 다양하게 응답하도록 유도한 결과입니다.",
      "● 반복 단어 비율이 낮아 정보 전달의 효율성과 자연스러움이 유지되었습니다. GPT는 동일 문장을 반복할 경우 신뢰도에 부정적 영향을 줄 수 있습니다.",
      "● 유사 표현이 일부 관찰되었지만 전체 문장 흐름에는 큰 영향을 주지 않았습니다. 이는 반복률 점수에 다소 영향을 미쳤습니다.",
      "● 중복 단어 비율이 10% 이상으로 나타나 일부 반복된 표현이 흐름을 저해했습니다. GPT가 반복되면 대화의 질이 저하됩니다.",
      "● 중복 단어 비율이 15%를 초과해 과도한 반복이 발생했습니다. 이는 AI의 대화 품질을 떨어뜨리고, 사용자의 정보 신뢰도를 저하시킬 수 있습니다."
    ],
    // 환각 가능성
    [
      "● 출처가 명확하고, 현실 기반 정보로만 구성되어 GPT의 환각 위험 없이 안정적인 응답을 이끌어냈습니다.",
      "● 전체 응답에서 허구적 표현 없이 실제 사실에 기반한 설명이 주를 이루었습니다. AI가 허구를 생성하지 않도록 유도된 결과입니다.",
      "● 일부 정보는 설명 근거가 부족하거나 출처가 애매했으나 전반적인 환각 위험은 낮은 편이었습니다.",
      "● 신뢰되지 않은 정보가 포함되어 환각 가능성이 높아졌습니다. 특히 수치/사례 제시에 정확한 근거가 부족했습니다.",
      "● 응답의 30% 이상이 출처 불분명하거나 실제 존재하지 않는 정보일 가능성이 높아, GPT의 환각 가능성이 큽니다."
    ],
    // 명확성
    [
      "● 질문 내에 '왜', '어떻게', '근거' 등의 키워드가 포함되어 AI가 질문 의도를 명확히 파악할 수 있었습니다.",
      "● 핵심 키워드가 포함되어 구조적이고 구체적인 답변이 가능했습니다. 이는 AI 활용도를 크게 높이는 요소입니다.",
      "● 질문이 비교적 단순하게 구성되어 응답이 다소 추상적으로 흐를 수 있었습니다.",
      "● 핵심 질문어가 누락되어 명확성 점수에 영향을 미쳤습니다. AI는 모호한 질문에 표면적 응답만 제공할 수 있습니다.",
      "● 질문의 구조가 모호하고 목적이 불분명하여 GPT가 정교하게 대응하기 어려웠습니다. 이는 AI 활용 효율을 크게 저해하는 요소입니다."
    ],
    // 반영성
    [
      "● 질문 요구사항을 정확히 반영하여 AI가 기대한 방향대로 응답을 생성했습니다. 이는 업무 자동화에서 매우 이상적인 패턴입니다.",
      "● 주요 요구사항이 대부분 반영되어 AI가 응답 목표를 명확히 이해한 것으로 판단됩니다.",
      "● 일부 요구 요소가 누락되었지만 핵심 흐름은 유지되었습니다.",
      "● 질문의 의도를 부분적으로만 반영하여 응답 품질이 다소 낮아졌습니다.",
      "● 요구 조건 반영률이 낮아 GPT 응답이 핵심에서 벗어나는 경향을 보였습니다. 이는 AI 활용 시 불필요한 재질문을 유발합니다."
    ],
    // 전문성
    [
      "● ‘정책’, ‘기술’, ‘보고서’ 등 도메인 중심 용어가 풍부하게 포함되어 GPT가 전문적 응답을 제공할 수 있었습니다.",
      "● 실무 기반 용어가 적절히 포함되어 전문성과 실현 가능성이 높게 평가됩니다.",
      "● 관련 분야의 개념은 일부 언급되었지만 더 구체적인 용어 사용이 필요합니다.",
      "● 전문 용어나 맥락이 부족하여 GPT가 일반적인 설명에 머무를 수밖에 없었습니다.",
      "● 도메인 특화 정보가 결여되어 AI 응답이 피상적이고 실무 적용이 어려운 수준으로 평가됩니다."
    ],
    // 논리성
    [
      "● 논리적 흐름이 명확하고 주장-근거-결론이 체계적으로 전개되어 GPT 응답이 높은 설득력을 가졌습니다.",
      "● 주제 전개 과정에서 인과 관계가 비교적 잘 유지되며 전체적인 논리 구조가 안정적입니다.",
      "● 전개 과정 중 일부 연결이 느슨했지만 핵심 주장에 대한 논리 흐름은 확보되었습니다.",
      "● 논리 흐름이 분절되거나 근거가 약하게 제시되어 GPT 응답의 설득력에 영향을 미쳤습니다.",
      "● 전개가 불명확하고 논리적 순서가 흐트러져 GPT가 일관성 있게 응답하지 못했습니다. 이는 AI 활용 결과의 신뢰도를 낮춥니다."
    ],
    // 다양성
    [
      "● 다양한 관점과 사례를 제시하여 GPT가 편향 없이 폭넓은 아이디어를 제공할 수 있었습니다.",
      "● 복수 시각이 적절히 포함되어 창의적인 응답 유도에 기여했습니다.",
      "● 단일 시각에 기반한 설명이지만 일정 수준의 정보 다양성은 유지되었습니다.",
      "● 관점의 편중이 발생하여 AI가 특정 방향성만 반복하는 경향이 있습니다.",
      "● 편협한 시각으로 구성되어 GPT가 새로운 대안을 제시하기 어려운 상태였습니다. 이는 AI의 사고 폭을 제한합니다."
    ],
    // 정중함
    [
      "● 존중과 배려가 담긴 표현이 일관되게 사용되어 GPT 응답의 대화 품질을 높였습니다.",
      "● 문장 구성에 예의와 정중함이 반영되어 AI 응답이 부드럽고 안정적으로 느껴집니다.",
      "● 일부 직설적 표현이 있었으나 전체적으로 존중의 태도는 유지되었습니다.",
      "● 일부 표현에서 무례하거나 거친 어조가 나타나 GPT 응답 품질에 부정적 영향을 미쳤습니다.",
      "● 감정적, 무례한 표현이 포함되어 AI 대화의 품격이 현저히 떨어졌습니다."
    ],
    // 오타율
    [
      "● 철자, 띄어쓰기, 문장 구조 모두 정확하여 GPT가 최적의 표현을 제공할 수 있었습니다.",
      "● 오탈자 발생이 드물고 문장이 안정적으로 구성되어 가독성이 높았습니다.",
      "● 일부 오타가 있었으나 문맥 이해에는 큰 영향을 주지 않았습니다.",
      "● 오탈자와 문장 오류가 자주 발생하여 AI 응답의 신뢰도에 부정적 영향을 주었습니다.",
      "● 철자 오류와 문법적 비문이 반복되어 GPT가 올바르게 문맥을 분석하지 못했을 수 있습니다."
    ],
    // 적합성
    [
      "● 응답 내용이 질문 목적과 매우 잘 맞아떨어지며 실무 적용이 용이한 수준으로 구성되었습니다.",
      "● 전체적인 맥락이 질문 의도와 잘 부합되어 활용 가치가 높습니다.",
      "● 질문 목적에는 부합하지만 구체성 측면에서 일부 보완이 요구됩니다.",
      "● 응답이 질문과 부분적으로 일치하지만 핵심에서 벗어난 측면이 존재합니다.",
      "● GPT 응답이 질문 목적과 크게 어긋나며, AI를 실질적으로 활용하기 어려운 결과였습니다."
    ]
  ];


  return scores.map((score, i) => {
    if (score >= 90) return LIB[i][0];
    if (score >= 80) return LIB[i][1];
    if (score >= 70) return LIB[i][2];
    if (score >= 60) return LIB[i][3];
    return LIB[i][4];
  });
}
// === 총평 생성 함수 (강점/약점 2개씩, 자연스러운 문장) ===
function generateSummaryComment({ scores }) {
  const labels = DIAGNOSE_ITEMS.map(i => i.name);
  const top = scores.map((v, i) => [v, labels[i]]).sort((a, b) => b[0] - a[0]).slice(0, 2);
  const low = scores.map((v, i) => [v, labels[i]]).sort((a, b) => a[0] - b[0]).slice(0, 2);
  return `이번 진단에서 강점은 ${top.map(([v, n]) => `${n}(${v}점)`).join(", ")}로 나타났으며, `
    + `취약점은 ${low.map(([v, n]) => `${n}(${v}점)`).join(", ")}입니다. `
    + `실제 적용 시 강점은 적극 활용하고, 약점은 반복 점검·보완하면 전반적 완성도가 향상될 것입니다.`;
}
// === 핵심 요약 생성 함수 ===
function generateInsightfulSummary({ scores }) {
  const labels = DIAGNOSE_ITEMS.map(i => i.name);
  const top = scores.map((v, i) => [v, labels[i]]).sort((a, b) => b[0] - a[0]).slice(0, 2);
  const low = scores.map((v, i) => [v, labels[i]]).sort((a, b) => a[0] - b[0]).slice(0, 3);

  const overview = (
    <>
      이번 진단 결과, <b>{top.map(([v, n]) => `${n}(${v}점)`).join(", ")}</b> 항목에서 매우 우수한 평가를 받았습니다.&nbsp;
      실제 업무 맥락이 잘 반영되어 <b>실무 활용성 및 통찰력</b>에서 강점이 드러납니다.
    </>
  );

  const weakness = (
    <>
      <b>{low.map(([v, n]) => `${n}(${v}점)`).join(", ")}</b> 항목은 상대적으로 낮은 점수를 보였습니다.&nbsp;
      일부 답변에서 <b>근거 부족, 비공식적 표현, 논리적 전개 약점</b>이 함께 관찰되었습니다.
    </>
  );

  const improve = (
    <>
      신뢰도를 높이려면 반드시 <b>출처 기반 정보</b>와 <b>공식 자료</b>를 활용하고, <b>정중한 언어 사용</b>을 꾸준히 점검하세요.&nbsp;
      단계별 논리 구조와 구체 예시를 함께 제시하면 완성도가 향상됩니다.&nbsp;
      <b>정기적 리뷰와 반복 진단</b>을 통해 약점을 관리하면 협업 효율성이 향상될 것입니다.
    </>
  );

  return (
    <div style={{ lineHeight: 1.75 }}>
      <div style={{ fontWeight: 800, color: "#21989c", marginBottom: 3 }}>■ 개요</div>
      <div style={{ marginBottom: 12 }}>{overview}</div>
      <div style={{ fontWeight: 800, color: "#b347b3", marginBottom: 3 }}>■ 주요 약점</div>
      <div style={{ marginBottom: 12 }}>{weakness}</div>
      <div style={{ fontWeight: 800, color: "#009ca6", marginBottom: 3 }}>■ 실전 개선 제안</div>
      <div>{improve}</div>
    </div>
  );
}
// === 항목별 진단 근거 생성 함수 ===
function getItemFeedbackReason(scores, metadata) {
  const { maxDupRate, hasWhyHow, hasDomainWord } = metadata;

  return scores.map((score, i) => {
    const name = DIAGNOSE_ITEMS[i].name;

    if (name === "반복률") {
      const rate = (maxDupRate * 100).toFixed(1);
      if (maxDupRate >= 0.15) {
        return `GPT Insight는 동일 단어의 반복 비율이 ${rate}%로 높게 분석되었으며, 이로 인해 응답의 다양성과 자연스러운 흐름이 제한된 것으로 판단하였습니다.\n이에 따라 반복률 항목은 ${score}점으로 낮게 평가되었습니다.`;
      } else if (maxDupRate >= 0.1) {
        return `GPT Insight는 중복 단어 비율이 ${rate}%로 다소 높게 나타났으며, 일부 유사 표현이 응답 품질에 영향을 준 것으로 분석하였습니다.\n이로 인해 반복률 항목은 ${score}점으로 산정되었습니다.`;
      } else {
        return `GPT Insight는 중복 단어 비율이 ${rate}%로 낮아 응답이 일관되고 매끄럽게 구성된 것으로 분석하였습니다.\n이에 따라 반복률 항목은 ${score}점으로 우수하게 평가되었습니다.`;
      }
    }

    if (name === "환각 가능성") {
      if (score >= 90) {
        return `GPT Insight는 응답이 사실 기반으로 구성되어 환각 가능성이 낮다고 판단하였습니다.\n이에 따라 해당 항목은 ${score}점으로 매우 우수하게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 일부 모호한 설명이 포함되어 있으나, 전체적으로 허위 정보는 제한적이라 판단하였습니다.\n이에 따라 환각 가능성 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 응답 내 비논리적이거나 근거가 부족한 내용이 다수 포함되어 환각 가능성이 높다고 판단하였습니다.\n이로 인해 해당 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "명확성") {
      if (hasWhyHow) {
        return `GPT Insight는 입력된 질문에 ‘왜’, ‘어떻게’ 등 핵심 키워드가 포함되어 명확하게 의도를 전달하고 있다고 판단하였습니다.\n이에 따라 명확성 항목은 ${score}점으로 높게 평가되었습니다.`;
      } else {
        return `GPT Insight는 입력된 질문에 핵심 키워드가 포함되지 않아 명확성이 부족한 것으로 판단하였습니다.\n이는 GPT가 질문 의도를 정확히 해석하기 어렵게 만들며, 이에 따라 명확성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "반영성") {
      if (score >= 90) {
        return `GPT Insight는 질문에 포함된 주요 요구사항이 충실히 반영된 것으로 분석하였습니다.\n이에 따라 반영성 항목은 ${score}점으로 매우 우수하게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 질문 전반에 대한 대응은 이루어졌으나, 일부 세부 항목이 누락된 것으로 판단하였습니다.\n이에 따라 반영성 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 질문에서 요구한 핵심 내용을 GPT가 충분히 반영하지 못한 것으로 분석하였습니다.\n이에 따라 반영성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "전문성") {
      if (hasDomainWord) {
        return `GPT Insight는 입력된 질문과 응답에 도메인 용어나 실무 기반 표현이 포함되어 있어 전문성이 높다고 판단하였습니다.\n이에 따라 전문성 항목은 ${score}점으로 높게 평가되었습니다.`;
      } else {
        return `GPT Insight는 입력된 질문과 응답에서 전문 용어나 실무 기반 표현이 부족하다고 판단하였습니다.\n이에 따라 전문성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "논리성") {
      if (score >= 90) {
        return `GPT Insight는 응답이 인과관계에 기반해 구조화되어 있으며, 주장과 근거의 전개가 자연스럽다고 분석하였습니다.\n이에 따라 논리성 항목은 ${score}점으로 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 전반적인 논리 흐름은 유지되었으나 일부 연결 부위에서 설명의 비약이 있었다고 판단하였습니다.\n이에 따라 논리성 항목은 ${score}점으로 산정되었습니다.`;
      } else {
        return `GPT Insight는 주장과 근거 간 연결이 미흡하거나 비약된 설명이 많아 논리적 완성도가 낮다고 판단하였습니다.\n이에 따라 논리성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "다양성") {
      if (score >= 90) {
        return `GPT Insight는 복수의 시각과 사례가 적절히 조합되어 문제에 대한 다면적 접근이 이루어진 것으로 분석하였습니다.\n이에 따라 다양성 항목은 ${score}점으로 매우 우수하게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 다양한 관점이 일부 반영되었으나 특정 시각에 편중된 경향이 있다고 분석하였습니다.\n이에 따라 다양성 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 유사한 논지의 반복이나 단일 시각에 의존하는 경향이 뚜렷하다고 판단하였습니다.\n이에 따라 다양성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "정중함") {
      if (score >= 90) {
        return `GPT Insight는 사용자의 응답이 전반적으로 정중하고 배려 깊은 표현으로 구성되어 있다고 판단하였습니다.\n이에 따라 정중함 항목은 ${score}점으로 매우 높게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 일부 표현에서 직설적이거나 간결한 어조가 관찰되었지만, 전체적으로 정중한 톤을 유지하려는 노력이 확인되었다고 판단하였습니다.\n이에 따라 정중함 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 응답이 전반적으로 직설적이거나 비격식적인 표현 위주로 구성되어 정중함 측면에서 아쉬움이 있다고 분석하였습니다.\n이에 따라 정중함 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "오타율") {
      if (score >= 90) {
        return `GPT Insight는 사용자 응답 내 오타나 문법적 오류가 거의 발견되지 않아 문서의 전반적인 가독성과 신뢰도가 높다고 판단하였습니다.\n이에 따라 오타율 항목은 ${score}점으로 매우 우수하게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 일부 오타 또는 문장 부호의 미세한 오류가 관찰되었지만 전체적으로 문장 흐름을 방해하지 않는 수준으로 판단하였습니다.\n이에 따라 오타율 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 응답 내에서 반복적인 오타 또는 비문이 다수 확인되어 독해에 혼란을 줄 수 있다고 판단하였습니다.\n이에 따라 오타율 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    if (name === "적합성") {
      if (score >= 90) {
        return `GPT Insight는 입력된 질문과 응답이 매우 높은 일치도를 보이며, 주제와 목적에 정확히 부합하는 내용을 포함하고 있다고 분석하였습니다.\n이에 따라 적합성 항목은 ${score}점으로 매우 우수하게 평가되었습니다.`;
      } else if (score >= 70) {
        return `GPT Insight는 질문의 주제와 응답 간 기본적인 관련성은 확보되었으나, 일부 문맥에서 목적과의 정합성이 부족하다고 판단하였습니다.\n이에 따라 적합성 항목은 ${score}점으로 평가되었습니다.`;
      } else {
        return `GPT Insight는 응답이 질문의 핵심 목적이나 요구사항과 잘 부합하지 않아 실질적 활용이 어렵다고 분석하였습니다.\n이에 따라 적합성 항목은 ${score}점으로 낮게 평가되었습니다.`;
      }
    }

    return `점수 ${score}점에 해당하는 일반적인 응답 품질로 GPT Insight가 평가하였습니다.`;
  });
}
// === 구조·전문성·언어 품질 분석 함수 ===
function generateStructureQualityExpertise(scores) {
  if (!scores) return null;
  const [반복률, 환각, 명확성, 반영성, 전문성, 논리성, 다양성, 정중함, 오타율, 적합성] = scores;

  let structure = "";
  if (논리성 >= 90 && 반영성 >= 85) {
    structure = "답변이 일관되고 흐름이 자연스러우며, 질문의 의도를 잘 반영해 전체적인 구조가 안정적으로 평가됩니다.";
  } else if (논리성 >= 80) {
    structure = "논리적 흐름은 전반적으로 자연스럽지만, 일부 구간에서 근거 연결이 약하거나 질문의 일부 요구가 빠지는 경우가 관찰됩니다.";
  } else {
    structure = "논리 구조와 답변 흐름에서 미흡한 부분이 있어, 설명의 일관성이나 요구 반영 측면에서 보완이 필요합니다.";
  }

  let expertise = "";
  if (전문성 >= 90 && 환각 >= 90) {
    expertise = "분야 전문성 및 팩트 기반 응답이 우수하며, 최신 트렌드와 실무 경험이 잘 녹아 있습니다.";
  } else if (전문성 >= 80) {
    expertise = "전문 지식과 사례 활용이 전반적으로 적절하나, 때때로 근거가 불명확하거나 구체적 설명이 부족할 수 있습니다.";
  } else {
    expertise = "전문성 표현이 다소 부족하거나, 신뢰도 높은 정보 및 사례 제시가 아쉬운 편입니다.";
  }

  let quality = "";
  if (오타율 >= 90 && 정중함 >= 90) {
    quality = "언어 표현이 정확하고, 오타나 비문이 거의 없으며, 정중한 태도를 꾸준히 유지합니다.";
  } else if (오타율 >= 80 && 정중함 >= 80) {
    quality = "전반적으로 언어 품질은 무난하지만, 간혹 오타나 직설적인 표현이 드러날 수 있습니다.";
  } else {
    quality = "문장 오류, 반복적 패턴, 비공식적 언어 등에서 개선의 여지가 있으며, 좀 더 다양한 표현과 친절한 태도가 필요합니다.";
  }


}

function ScoreInterpretation({ score }) {
  let level = "";
  let description = "";

  if (score >= 90) {
    level = "A (탁월)";
    description = "AI 응답이 실제 업무에 매우 신뢰도 높게 활용되었습니다. 핵심 요구사항을 정확히 반영하고, 전문성과 표현 품질이 모두 우수합니다.";
  } else if (score >= 80) {
    level = "B (우수)";
    description = "대체로 정확하고 전문적인 응답으로 업무 활용에 적합합니다. 일부 항목은 보완 여지가 있으나, 전반적으로 신뢰할 수 있습니다.";
  } else if (score >= 70) {
    level = "C (보통)";
    description = "기본적인 응답 구조와 내용은 충실하나, 일부 항목에서 명확성 또는 전문성 부족이 관찰됩니다. 활용 전 검토가 권장됩니다.";
  } else if (score >= 60) {
    level = "D (주의)";
    description = "중복 표현, 비논리적 서술 또는 전문성 부족 등으로 인해 실제 업무 적용에는 제한이 있습니다. 수정 및 재질문이 필요합니다.";
  } else {
    level = "E (위험)";
    description = "응답의 품질이 낮아 업무 적용 시 오용 위험이 큽니다. AI 응답의 신뢰성 확보를 위해 질문 재구성 또는 검토가 요구됩니다.";
  }

  return (
    <div style={{
      background: "#f3f8fa",
      borderLeft: "6px solid #00C2C2",
      padding: "16px 20px",
      marginTop: 32,
      borderRadius: 10,
      lineHeight: 1.7,
      fontSize: 15,
      color: "#223a53",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
    }}>
      <b>📊 AI 활용도 평가: {level}</b><br />
      {description}
    </div>
  );
}
// 전체 App.jsx 코드 또는 비교 분석 관련 코드
function ComparisonAnalysis({ result, previousResult }) {
  if (!result) return null;

  const DIAGNOSE_ITEMS = [
    { name: "반복률" },
    { name: "환각 가능성" },
    { name: "명확성" },
    { name: "반영성" },
    { name: "전문성" },
    { name: "논리성" },
    { name: "다양성" },
    { name: "정중함" },
    { name: "오타율" },
    { name: "적합성" }
  ];


  return (
    <div style={{
      maxWidth: 800,
      margin: "40px auto",
      background: "#ffffff",
      padding: "24px",
      borderRadius: 14,
      boxShadow: "0 1px 6px rgba(0, 0, 0, 0.05)"
    }}>
<h3 style={{ textAlign: "center", marginBottom: 20 }}>
  📊 {previousResult ? "항목별 점수 변화" : "항목별 현재 점수"}
</h3>

<div style={{ position: "relative", height: "280px", marginBottom: 28 }}>
  <Line
    data={{
      labels: DIAGNOSE_ITEMS.map(i => i.name),
      datasets: previousResult
        ? [
            {
              label: "이전 점수",
              data: previousResult.scores,
              borderColor: "#ccc",
              backgroundColor: "#ccc",
              tension: 0.2,
              fill: false
            },
            {
              label: "현재 점수",
              data: result.scores,
              borderColor: "#00C2C2",
              backgroundColor: "#00C2C2",
              tension: 0.2,
              fill: false
            }
          ]
        : [
            {
              label: "현재 점수",
              data: result.scores,
              borderColor: "#00C2C2",
              backgroundColor: "#00C2C2",
              tension: 0.2,
              fill: false
            }
          ]
    }}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" },
        title: { display: false }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { stepSize: 10 }
        }
      }
    }}
  />
</div>




    </div>
  );
}

function calculateMBTI(scores, labels) {
  const mbtiScore = { EI: 0, SN: 0, TF: 0, JP: 0 };

  labels.forEach((label, i) => {
    const score = scores[i];
    switch (label) {
      case "반복률":
        mbtiScore.JP += score >= 75 ? 10 : -10;
        break;
      case "반영성":
        mbtiScore.JP += score >= 75 ? 10 : -10;
        break;
      case "전문성":
      case "명확성":
      case "다양성":
      case "환각 가능성":
        mbtiScore.SN += score >= 75 ? 10 : -10;
        break;
      case "논리성":
        mbtiScore.TF += score >= 75 ? -10 : 10;
        break;
      case "정중함":
        mbtiScore.TF += score >= 75 ? 10 : -10;
        break;
      case "오타율":
        mbtiScore.EI += score >= 75 ? -5 : 5;
        break;
      default:
        break;
    }
  });

  const mbti =
    (mbtiScore.EI >= 0 ? "I" : "E") +
    (mbtiScore.SN >= 0 ? "N" : "S") +
    (mbtiScore.TF >= 0 ? "F" : "T") +
    (mbtiScore.JP >= 0 ? "P" : "J");

  return mbti;
}

function generateMBTIExplanation(type) {
  const descriptions = {
    ISTJ: "논리적이고 신중한 질문 스타일을 가지며, 일관성과 명확성을 중요하게 여깁니다.",
    ISFJ: "섬세하고 책임감 있는 커뮤니케이션을 선호하며, 상대방의 입장을 고려한 질문을 자주 합니다.",
    INFJ: "통찰력 있고 의미 중심의 커뮤니케이션을 선호하며, 깊이 있는 질문을 구성합니다.",
    INTJ: "체계적이고 전략적인 질문을 통해 문제를 분석하고 본질을 파악하려는 경향이 있습니다.",
    ISTP: "객관적이고 분석적인 접근을 중시하며, 간결하고 실용적인 질문을 선호합니다.",
    ISFP: "부드럽고 감성적인 소통을 선호하며, 조화로운 분위기 속에서 질문을 유도합니다.",
    INFP: "이상적이고 가치 중심적인 질문을 자주 구성하며, 상대방의 내면을 이해하려는 성향이 있습니다.",
    INTP: "분석적이고 체계적인 커뮤니케이션을 선호하며, 논리 중심의 질문 구조를 자주 사용합니다.",
    ESTP: "직설적이고 즉흥적인 질문을 선호하며, 실전 감각과 관찰력을 기반으로 소통합니다.",
    ESFP: "밝고 감각적인 커뮤니케이션을 즐기며, 상황에 유연하게 대응하는 질문 방식을 갖습니다.",
    ENFP: "다양한 아이디어와 감성 중심의 접근으로 풍부한 질문을 구성하는 경향이 있습니다.",
    ENTP: "창의적이고 도전적인 질문을 자주 하며, 새로운 관점을 탐색하는 것을 즐깁니다.",
    ESTJ: "실용적이고 명확한 질문을 선호하며, 구조화된 커뮤니케이션에 능숙합니다.",
    ESFJ: "상대방의 감정을 배려하며, 조화로운 분위기 속에서 친근한 질문을 이끌어냅니다.",
    ENFJ: "강한 공감 능력을 바탕으로 의미 있는 질문을 구성하며, 상대방을 이끄는 대화를 추구합니다.",
    ENTJ: "목표 중심의 질문을 통해 핵심을 빠르게 파악하고, 전략적 사고를 기반으로 커뮤니케이션합니다.",
  };

  return descriptions[type] || "이 유형은 현재 설명이 준비 중입니다.";
}

function generateCommunicationProfile(scores, labels) {
  const mbti = calculateMBTI(scores, labels);
  const description = generateMBTIExplanation(mbti);

  // 강점/약점 판별
  const high = [];
  const low = scores
    .map((score, i) => ({ label: labels[i], score }))
    .filter(item => item.score <= 65)
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map(item => item.label);

  scores.forEach((score, i) => {
    if (score >= 85) high.push(labels[i]);
  });

  const strong =
    high.length > 0
      ? `🟢 강점: ${high.join(", ")}`
      : "✅ 분석 결과, 특별히 두드러지는 강점은 나타나지 않았습니다.";

  const weak =
    low.length > 0
      ? `🔴 약점: ${low.join(", ")}`
      : "";
  const profile = MBTI_PROFILES[mbti] || {
  color: "#ccc",
  icon: "❔",
  tip: "이 유형에 대한 구체적인 개선 팁은 곧 추가될 예정입니다."
};

  return (
    <div style={{ lineHeight: "1.7", fontSize: 17, marginTop: 40 }}>
      

<p style={{ marginTop: 14, fontSize: 15.5 }}>
  GPT Insight는 입력된 질문 데이터를 분석하여 사용자의 커뮤니케이션 성향을 진단합니다.  
  이번 분석 결과, 사용자는 <b style={{ color: profile.color }}>{mbti}</b> 유형에 가까운 성향을 보였습니다.  
  {description}
</p>
      <p>{strong}</p>
{(low.includes("명확성") || low.includes("다양성")) && (
  <>
     <p style={{ marginTop: 12, fontSize: 15.5 }}>
      표현의 다양성과 구체성을 보완하기 위해, <b>사례 중심 설명</b> 또는 <b>상대방 입장에서의 질문 재구성</b>을 시도해보는 것이 좋습니다.
    </p>
    <p style={{ marginTop: 12, fontSize: 15.5, color: profile.color }}>
      💬 질문 개선 팁: <b>{profile.tip}</b>
    </p>
  </>
)}

{!(low.includes("명확성") || low.includes("다양성")) && (
  <p style={{ marginTop: 12, fontSize: 15.5 }}>
    💬 질문 개선 팁: <b>{profile.tip}</b>
  </p>
)}
{(low.includes("명확성") || low.includes("다양성")) && (
  <>
    <p style={{ marginTop: 12, fontSize: 15.5 }}>
      표현의 다양성과 구체성을 보완하기 위해, <b>사례 중심 설명</b> 또는 <b>상대방 입장에서의 질문 재구성</b>을 시도해보는 것이 좋습니다.
    </p>
    <p style={{ marginTop: 12, fontSize: 15.5, color: profile.color }}>
      💬 <b>질문 개선 팁:</b> {profile.tip}
    </p>
  </>
)}

<p style={{ marginTop: 12, fontSize: 15.5 }}>
  🧠 <b>실전 개선 요약:</b> 응답의 신뢰도를 높이기 위해서는 <b>출처 기반 정보 활용</b>, <b>정중한 언어 사용</b>, <b>단계적 논리 전개</b>가 핵심입니다.  
  정기적인 피드백 반영과 반복 진단을 통해 AI 활용 효율성과 협업 품질을 함께 향상시킬 수 있습니다.
</p>

    </div>
  );
}
// 변화 해석: 총점이 낮은 경우 구체적 항목 기반 해석 출력
function generateLowScoreInsight(currentScores, diagnoseItems) {
  const totalScore = currentScores.reduce((a, b) => a + b, 0) / currentScores.length;
  const insights = [];

  if (totalScore <= 60) {
    const lowItems = currentScores
      .map((score, i) => ({ score, name: diagnoseItems[i].name }))
      .filter(item => item.score <= 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 3);

    const formatted = lowItems.map(i => `${i.name}(${i.score}점)`).join(", ");
    const examples = lowItems.map(i => `<b>${i.name}(${i.score}점)</b>`).join(", ");

    const criticalTemplates = [
      `🛑 이번 진단의 총점은 <b>${Math.round(totalScore)}점</b>으로 매우 낮았으며, 특히 ${examples} 항목이 GPT 응답 품질 저하의 핵심 원인으로 분석됩니다.`,
      `📉 전체 응답 흐름은 큰 변화 없이 유지됐지만, ${examples} 항목에서의 지속적 저하로 인해 GPT의 이해 정확도와 응답 일관성에 부정적 영향이 있었습니다.`,
      `⚠️ ${examples} 항목은 특히 낮은 수준으로 평가되어, 질문의 구조와 표현 방식에서 근본적인 개선이 필요한 영역으로 보입니다.`,
      `🛑 주요 항목인 ${examples}이(가) 60점 이하로 나타났으며, 이는 질문 명확성 부족 또는 도메인 맥락 미흡 등이 복합적으로 작용한 결과로 해석됩니다.`,
      `📉 이번 응답의 총점은 낮은 편이며, 특히 ${formatted} 항목이 반복적으로 저평가되며 GPT 응답의 신뢰성과 실무 적용 가능성에 제한이 있었습니다.`
    ];

    const randomFrom = arr => arr[Math.floor(Math.random() * arr.length)];
    insights.push(randomFrom(criticalTemplates));
  } else {
    insights.push(`<span style="color:#666">📋 전체적으로 양호한 흐름을 유지하였으며, 특정 항목에서 긍정적 또는 안정적인 성과가 확인되었습니다.</span>`);
  }

  return insights;
}

// 변화 해석: 점수 변화 기반 고도화 분석
function generateComparisonInsights(currentScores, previousScores, diagnoseItems) {
  const insights = [];
  const increased = [];
  const decreased = [];

  for (let i = 0; i < currentScores.length; i++) {
    const name = diagnoseItems[i].name;
    const diff = currentScores[i] - previousScores[i];
    if (diff >= 10) increased.push({ name, diff });
    else if (diff <= -10) decreased.push({ name, diff });
  }

  // 📈 통합 상승 해석
  if (increased.length >= 3) {
    const names = increased.map(i => `<b>${i.name}</b>`).join(", ");
    insights.push(`✅ ${names} 항목에서 고르게 점수 상승이 확인되었습니다. GPT가 질문의 구조와 흐름을 더욱 명확하게 이해하고 있다는 긍정적인 신호로 해석됩니다.`);

    const topIncreased = increased.slice(0, 2);
    topIncreased.forEach(({ name, diff }) => {
      const variations = [
        `📈 <b>${name}</b>: ${diff}점 상승. 질문 흐름 또는 표현 방식의 안정화가 긍정적으로 작용한 결과입니다.`,
        `📈 <b>${name}</b> 항목이 +${diff}점 향상되었습니다. 이는 내용 구조나 구체성이 강화되었음을 시사합니다.`,
        `📈 <b>${name}</b>: GPT가 질문의 목적을 더욱 명확히 파악한 것으로 해석됩니다. (+${diff})`,
        `📈 <b>${name}</b> 항목이 상승했습니다. (${diff}점) 이는 최근 입력의 언어 흐름 개선과 관련이 있습니다.`,
        `📈 <b>${name}</b>: +${diff}점 상승하며 응답의 정확성과 신뢰도가 함께 향상된 것으로 보입니다.`
      ];
      const random = variations[Math.floor(Math.random() * variations.length)];
      insights.push(random);
    });
  }

  // 📈 상승 항목 1~2개 → 자연어 템플릿 해석
  else if (increased.length > 0) {
    const templates = [
      `✅ GPT가 입력 흐름을 더 명확히 이해하며 <b>{item1}</b>(+{diff1}) 항목이 개선되었습니다.`,
      `✅ GPT의 응답 품질이 향상되며 <b>{item1}</b>과(와) <b>{item2}</b> 항목에서 상승이 나타났습니다. (+{diff1}, +{diff2})`,
      `✅ 최근 입력에서 <b>{item1}</b> 항목이 +{diff1}점 향상되며 구조적 개선이 반영된 것으로 분석됩니다.`
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const [item1, diff1] = [increased[0].name, increased[0].diff];
    const [item2, diff2] = increased[1] ? [increased[1].name, increased[1].diff] : ["", ""];
    const naturalSummary = t.replaceAll("{item1}", item1).replaceAll("{diff1}", diff1).replaceAll("{item2}", item2).replaceAll("{diff2}", diff2);
    insights.push(naturalSummary);
  }

  // 📉 통합 하락 해석
  if (decreased.length >= 3) {
    const names = decreased.map(i => `<b>${i.name}</b>`).join(", ");
    insights.push(`⚠️ ${names} 항목에서 일관된 점수 하락이 감지되었습니다. 이는 질문의 명확성, 표현 흐름, 혹은 구체성에서 부족한 점이 영향을 준 것으로 보입니다.`);

    const topDecreased = decreased.slice(0, 2);
    topDecreased.forEach(({ name, diff }) => {
      const variations = [
        `🔻 <b>${name}</b>: ${Math.abs(diff)}점 하락. 질문의 흐름이나 맥락이 다소 모호하게 전달되었을 수 있습니다.`,
        `🔻 <b>${name}</b> 항목이 -${Math.abs(diff)}점 하락했습니다. 이는 목적성 또는 구조적 연결 부족의 신호일 수 있습니다.`,
        `🔻 <b>${name}</b>: GPT가 일부 내용에서 의미를 정확히 파악하지 못했을 가능성이 있습니다. (${diff})`,
        `🔻 <b>${name}</b> 항목이 하락하였습니다. 질문 표현에서 일부 혼란이 있었던 것으로 보입니다.`,
        `🔻 <b>${name}</b>: -${Math.abs(diff)}점 감소. 핵심 메시지 전달이 약해진 영향으로 해석됩니다.`
      ];
      const random = variations[Math.floor(Math.random() * variations.length)];
      insights.push(random);
    });
  }

  // 📋 변화 없음 처리
  if (increased.length === 0 && decreased.length === 0) {
    insights.push(`<span style="color:#666">📋 점수 변화가 거의 없으며, 전체적으로 안정적인 응답 흐름이 유지되었습니다.</span>`);
  }

  return insights;
}

function generateCurrentOnlyInsight(scores, userStyleType) {
  const labels = DIAGNOSE_ITEMS.map(i => i.name);
  const total = scores.reduce((a, b) => a + b, 0); // 총점 계산

  // 총점이 매우 낮을 경우: 단독 메시지 출력
  if (total <= 50) {
    return `현재 응답은 전반적으로 낮은 점수 분포를 보이며, GPT의 해석 정확도나 표현력에서 개선이 필요한 상태입니다. 
질문의 구조, 구체성, 목적성 등을 강화하면 더 나은 분석 결과를 얻을 수 있어요. 각 항목별 피드백을 참고해 차근히 개선해보세요.`;
  }

  const top = scores.map((v, i) => [v, labels[i]]).sort((a, b) => b[0] - a[0]).slice(0, 2);
  const low = scores.map((v, i) => [v, labels[i]]).sort((a, b) => a[0] - b[0]).slice(0, 2);

  const topItems = top.map(([_, name]) => name);
  const lowItems = low.map(([_, name]) => name);

  const isWarmType = ["INFP", "ISFJ", "ESFJ", "ENFP"].includes(userStyleType);

  // 상담형 말투
  const warmTemplates = [
    `잘 구성된 질문이었어요. <b>${topItems[0]}</b>과(와) <b>${topItems[1]}</b> 덕분에 AI가 당신의 의도를 꽤 잘 이해했을 거예요. 다만 <b>${lowItems[0]}</b> 항목은 약간 흐릿하게 느껴질 수도 있었겠네요.`,
    `이번 입력은 전체적으로 차분하고 이해하기 쉬운 스타일이었어요. 특히 <b>${topItems[0]}</b> 항목은 GPT가 좋아하는 흐름이에요. <b>${lowItems[0]}</b>은 살짝만 다듬으면 더 좋을 것 같아요 :)`,
    `정중하고 논리적인 구조가 인상 깊었어요. <b>${topItems[0]}</b>과(와) <b>${topItems[1]}</b>은 특히 잘 구성되어 있었고, <b>${lowItems[0]}</b>는 아마 조금 더 구체화되면 더 좋아질 것 같네요.`,
    `AI 입장에서 보기에도 아주 정돈된 질문이에요. <b>${topItems[0]}</b>이 잘 드러났고, <b>${lowItems[0]}</b>에서는 약간의 모호함이 느껴졌을 수 있어요. 그 부분만 살짝 보완해보세요!`
  ];

  // 전문가/코칭형 말투
  const neutralTemplates = [
    `전체적으로 안정적인 흐름이 잘 유지되었습니다. <b>${topItems[0]}</b>과(와) <b>${topItems[1]}</b> 항목에서 강점을 보였으며, <b>${lowItems[0]}</b> 항목은 보다 구체적인 표현이 추가된다면 완성도가 높아질 것입니다.`,
    `이번 입력은 전반적으로 실용적인 구성을 잘 갖추고 있었습니다. 특히 <b>${topItems[0]}</b> 항목은 매우 우수했고, <b>${lowItems[0]}</b>와(과) <b>${lowItems[1]}</b> 항목은 실무 적용 시 한 번 더 검토해보시면 좋겠습니다.`,
    `<b>${topItems[0]}</b>와(과) <b>${topItems[1]}</b> 항목에서 강한 성과가 보였고, GPT가 문맥을 이해하기 쉬운 구조였습니다. 다만 <b>${lowItems[0]}</b>는 내용 전달력이 다소 약해 보입니다.`,
    `좋은 출발이에요! <b>${topItems[0]}</b>과(와) <b>${topItems[1]}</b> 항목 덕분에 GPT가 훨씬 더 자연스럽게 반응했을 거예요. 다음에는 <b>${lowItems[0]}</b>를 조금 더 구체적으로 다뤄보는 걸 추천합니다.`,
    `전반적으로 안정적인 구성입니다. <b>${topItems[0]}</b>은 아주 잘 표현되었고요, <b>${lowItems[0]}</b> 항목은 "왜", "어떻게" 같은 구조적 키워드를 추가해보세요. 훨씬 명확해질 거예요!`,
    `GPT는 이미 대부분의 문맥을 잘 따라갔어요. 특히 <b>${topItems[0]}</b>과(와) <b>${topItems[1]}</b> 덕분이죠. 다음엔 <b>${lowItems[0]}</b> 항목도 함께 신경 써보면 더 완성도 있는 결과가 나올 수 있습니다.`
  ];

  const templates = isWarmType ? warmTemplates : neutralTemplates;
  return templates[Math.floor(Math.random() * templates.length)];
}


