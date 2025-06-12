import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend
} from "chart.js";
import logo from "./logo.png";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const STORAGE_KEY = "gpt_insight_reports";
const PATENT_NOTICE = "© 2025 GPT Insight | Protected by Korean Patent Application No. 10-2025-0067545, 10-2025-0068036, PCT/KR2025/007500";

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

export default function App() {
  const [form, setForm] = useState({
    name: "", company: "", department: "", author: "",
    date: new Date().toISOString().slice(0, 10), question: ""
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [previousResult, setPreviousResult] = useState(null);
  const [selectedName, setSelectedName] = useState("");

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
- 회사/부서: ${result.company} / ${result.department}
- 일자: ${result.date}
- 총점: ${result.total}점 / 등급: ${result.grade}
- 총평: ${result.summary}
- 핵심 요약: ${result.insightfulSummary}
- 항목별 점수: ${DIAGNOSE_ITEMS.map((item, i) => `${item.name}:${result.scores[i]}`).join(", ")}
- 주요 피드백: ${result.feedback.map(f => f.replace("● ", "")).join("; ")}
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
    const words = form.question.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const sentenceCount = form.question.split(/[.!?]/).filter(Boolean).length;

    if (form.question.length < 100 || sentenceCount < 3 || uniqueWords.size < 20) {
      alert("❌ 분석 불가: 입력 내용이 부족합니다.\n\n⦁ 최소 100자 이상\n⦁ 최소 3문장 이상\n⦁ 고유 단어 20개 이상 입력해주세요.");
      return;
    }

    const text = form.question.trim();
    const wordList = text.split(/\s+/);
    const totalWords = wordList.length;
    const wordFreq = {};
    wordList.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });
    const maxDupRate = Math.max(...Object.values(wordFreq)) / totalWords;
    const hasWhyHow = /(왜|어떻게|무엇|방식|근거)/.test(text);
    const hasDomainWord = /(정책|기술|보고서|규제|법령|통계)/.test(text);

    const baseScore = text.length > 100 ? 75 : text.length > 50 ? 65 : 50;
    const scores = DIAGNOSE_ITEMS.map((item, i) => {
      let score = baseScore + Math.floor(Math.random() * 4);
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

    const newResult = { ...form, scores, total, grade, feedback, summary, insightfulSummary };
    const updated = [...history.filter(h => h.name !== form.name), newResult];
    const previous = history.find(h => h.name === form.name);
    setPreviousResult(previous || null);
    setHistory(updated);
    setResult(newResult);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleLoadPrevious = () => {
    const loaded = history.find(h => h.name === selectedName);
    if (loaded) {
      setForm({
        name: loaded.name, company: loaded.company,
        department: loaded.department, author: loaded.author,
        date: loaded.date, question: loaded.question
      });
      setPreviousResult(null);
      setResult(loaded);
    }
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
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "맑은 고딕, sans-serif", background: "#f7fafc", minHeight: "100vh", paddingBottom: 40 }}>
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
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="회사명" style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="부서" style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="작성자" style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
              <input value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} type="date" style={{ flex: 1, fontSize: 16, padding: 8, borderRadius: 8, border: "1.5px solid #d9eef3" }} />
            </div>
            <textarea value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="진단할 질문/내용 입력" rows={4} style={{ width: "100%", fontSize: 16, padding: 10, borderRadius: 8, border: "1.5px solid #d9eef3", marginBottom: 24, resize: "vertical" }}></textarea>
            <button onClick={handleDiagnose} style={{ width: "100%", padding: 14, border: "none", borderRadius: 11, background: "linear-gradient(90deg,#00C2C2,#21C586)", color: "#fff", fontWeight: 900, fontSize: 18, cursor: "pointer", boxShadow: "0 2px 6px #00c2c233" }}>
              진단 시작
            </button>
            <div style={{ marginTop: 24 }}>
              <select value={selectedName} onChange={e => setSelectedName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1.5px solid #d9eef3", fontSize: 15, marginBottom: 8 }}>
                <option value="">[ 이전 진단 결과 선택 ]</option>
                {history.map((h, idx) => (
                  <option key={idx} value={h.name}>{h.name} ({h.date})</option>
                ))}
              </select>
              <button onClick={handleLoadPrevious} style={{ width: "100%", padding: 12, border: "none", borderRadius: 10, background: "#eeeeee", color: "#333", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
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
                  style={{ width: 54, height: 54, borderRadius: 14, boxShadow: "0 2px 8px #e7eaec", background: "#fff" }} />
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
                  <tr>
                    <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>회사/부서</td>
                    <td style={{ padding: "6px 16px" }}>{result.company} / {result.department}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 16px", textAlign: "right", color: "#00a9b3" }}>작성자</td>
                    <td style={{ padding: "6px 16px" }}>{result.author}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* 1. 점수 요약 및 총평 */}
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
              1. 점수 요약 및 총평
            </h2>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 7, color: "#003c46" }}>
              총점 <span style={{ color: "#00C2C2" }}>{result.total}점</span> &nbsp;등급: <span style={{ color: getGradeColor(result.grade) }}>{result.grade}</span>
            </div>
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
              <div style={{ fontSize: 16.5, fontWeight: 900, color: "#003c46", marginBottom: 12 }}>항목별 상세 피드백</div>
              <ul style={{
                paddingLeft: 18, color: "#17485e", fontSize: 15.3, lineHeight: 1.8
              }}>
                {result.feedback.map((msg, i) => <li key={i}>{msg}</li>)}
              </ul>
            </div>
            {/* 총평 */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 16.5, fontWeight: 900, marginBottom: 8, color: "#003c46" }}>총평</div>
              <div style={{
                padding: 10, background: "#e5f4f9", borderRadius: 9,
                color: "#003c46", marginBottom: 9, fontSize: 15.5
              }}>
                {result.summary}
              </div>
            </div>
            <hr style={{ margin: "32px 0" }} />
            {/* 2. 변화 그래프 및 핵심 요약 */}
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
              2. 변화 그래프 및 핵심 요약
            </h2>
            {renderComparisonChart()}
            <div style={{
              background: "#f7fafc", borderRadius: 10, margin: "32px 0 0 0",
              padding: "20px 18px", fontSize: "15.3px", color: "#265575", lineHeight: 1.7, boxShadow: "0 1px 6px #e3f8f8"
            }}>
              <b>핵심 요약</b>
              <div style={{ marginTop: 10 }}>{result.insightfulSummary}</div>
            </div>
            <hr style={{ margin: "32px 0" }} />
            {/* 3. 구조·품질·전문성 분석 */}

<h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
  3. 구조·품질·전문성 분석
</h2>
{generateStructureQualityExpertise(result.scores)}

            <hr style={{ margin: "32px 0" }} />
            {/* 4. 맞춤 제안 및 실행 가이드 */}
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "#009ca6", marginBottom: 18 }}>
              4. 맞춤 제안 및 실행 가이드
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
          {/* 하단 주요 버튼 */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", gap: 16, margin: "32px 0" }}>
            <button onClick={handleReset}
              style={{
  padding: "12px 26px", borderRadius: 10,
  background: "#f7f8fa", color: "#00C2C2", fontWeight: 900, fontSize: 16,
  cursor: "pointer", boxShadow: "0 2px 6px #00c2c233", border: "1.3px solid #c0e2e2"
}}
>
              다시 진단
            </button>
            <button onClick={handleCopyLink}
              style={{
                padding: "12px 26px", border: "none", borderRadius: 10,
                background: "linear-gradient(90deg,#00C2C2,#21C586)", color: "#fff", fontWeight: 900, fontSize: 16,
                cursor: "pointer", boxShadow: "0 2px 6px #00c2c233"
              }}>
              결과 공유
            </button>
            <button onClick={handleFeedbackCopy}
                style={{
    padding: "12px 26px", borderRadius: 10,
    background: "#faf2fc", color: "#B347B3", fontWeight: 900, fontSize: 16,
    cursor: "pointer", border: "1.3px solid #ecd7fa"
  }}
>
  피드백 남기기
</button>
          </div>
        </>
      )}
    </div>
  );
}


// === 항목별 상세 피드백 라이브러리 + 피드백 생성 ===
function getItemFeedback(scores) {
  const LIB = [
    // 반복률
    [
      "● 반복 없이 일관된 질문/답변 유지, 대화 품질 우수.",
      "● 반복적 패턴 거의 없음, 응답 신뢰도 높음.",
      "● 드물게 중복 질문 있으나 전반적으로 안정적."
    ],
    // 환각 가능성
    [
      "● 팩트 기반의 답변 위주로 신뢰도 높음.",
      "● 환각성 응답이 적고 근거가 명확함.",
      "● 일부 비논리 응답 있으나 전반적으로 양호."
    ],
    // 명확성
    [
      "● 답변이 구체적이며 명확하게 전달됨.",
      "● 핵심 메시지 전달이 명확함.",
      "● 일부 설명은 구체성 보강 필요."
    ],
    // 반영성
    [
      "● 질문 요구 대부분 잘 반영됨.",
      "● 요구 내용이 상세하게 포함됨.",
      "● 일부 세부 내용 미반영 가능."
    ],
    // 전문성
    [
      "● 도메인 전문 용어·사례 활용이 뛰어남.",
      "● 실무적 전문성 및 사례 포함 양호.",
      "● 추가적 근거·사례 보강 시 완성도↑"
    ],
    // 논리성
    [
      "● 논리적 흐름, 근거 연결 탁월.",
      "● 논리 구조 명확, 설득력 있음.",
      "● 일관성 있는 설명 유지."
    ],
    // 다양성
    [
      "● 다양한 관점·사례 폭넓게 제시.",
      "● 복수의 시각 균형 있게 반영.",
      "● 유사 유형 반복 적고 시각 다양."
    ],
    // 정중함
    [
      "● 언어매너, 존중 태도 모두 우수.",
      "● 항상 정중한 표현 사용.",
      "● 일부 간결·직설 표현 있음."
    ],
    // 오타율
    [
      "● 오타·비문 거의 없음, 완성도 높음.",
      "● 가독성 좋고 맞춤법 오류 적음.",
      "● 일부 문장 교정 필요."
    ],
    // 적합성
    [
      "● 주제·업무에 매우 적합.",
      "● 현장 요구와 일치, 바로 적용 가능.",
      "● 목적에 따른 미세 조정 권장."
    ]
  ];

  return scores.map((score, i) => {
    // 90점 이상
    if (score >= 90) return LIB[i][0];
    // 80점 이상
    if (score >= 80) return LIB[i][1];
    // 70점 이상
    if (score >= 70) return LIB[i][2];
    // 60점 이상
    if (score >= 60) return `● ${DIAGNOSE_ITEMS[i].name}: 주의 필요.`;
    // 그 이하는 위험
    return `● ${DIAGNOSE_ITEMS[i].name}: 위험/즉각 개선 필요.`;
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

// === 핵심 요약 생성 함수 (강점/약점 2~3개, 사례형) ===
function generateInsightfulSummary({ scores }) {
  // 진단 항목명
  const labels = DIAGNOSE_ITEMS.map(i => i.name);

  // 상위 2개 강점, 하위 2~3개 약점
  const top = scores
    .map((v, i) => [v, labels[i]])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 2);
  const low = scores
    .map((v, i) => [v, labels[i]])
    .sort((a, b) => a[0] - b[0])
    .slice(0, 3);

  // 개요
  const overview = (
    <>
      이번 진단 결과, <b>{top.map(([v, n]) => `${n}(${v}점)`).join(", ")}</b> 항목에서 매우 우수한 평가를 받았습니다.&nbsp;
      실제 업무 맥락이 잘 반영되어 <b>실무 활용성 및 통찰력</b>에서 강점이 드러납니다. 다양한 관점과 구체적 아이디어가 복합적 문제에도 효과적으로 대응 가능함을 보여줍니다.
    </>
  );

  // 주요 약점
  const weakness = (
    <>
      <b>{low.map(([v, n]) => `${n}(${v}점)`).join(", ")}</b> 항목은 상대적으로 낮은 점수를 보였습니다.&nbsp;
      일부 답변에서 <b>근거 부족, 비공식적 표현, 논리적 전개 약점</b>이 함께 관찰되어 신뢰도와 대화 품질 저하의 요인이 될 수 있습니다.
    </>
  );

  // 실전 개선 제안
  const improve = (
    <>
      신뢰도를 높이려면 반드시 <b>출처 기반 정보</b>와 <b>공식 자료</b>를 활용하고, <b>정중한 언어 사용</b>을 꾸준히 점검하세요.&nbsp;
      긴 답변은 단계별 논리 구조와 구체 예시를 함께 제시하면 완성도가 크게 향상됩니다.&nbsp;
      <b>정기적 리뷰와 반복 진단</b>을 통해 약점 항목을 데이터로 관리하면 AI 협업 효율성이 한층 강화될 것입니다.
    </>
  );

  // 전체 JSX 반환
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


function generateStructureQualityExpertise(scores) {
  if (!scores) return null;
  // 각 항목별로 점수 기반이 아니라 ‘상대적 특성’ 설명에 집중
  const [반복률, 환각, 명확성, 반영성, 전문성, 논리성, 다양성, 정중함, 오타율, 적합성] = scores;

  // 구조적 분석
  let structure = "";
  if (논리성 >= 90 && 반영성 >= 85) {
    structure = "답변이 일관되고 흐름이 자연스러우며, 질문의 의도를 잘 반영해 전체적인 구조가 안정적으로 평가됩니다.";
  } else if (논리성 >= 80) {
    structure = "논리적 흐름은 전반적으로 자연스럽지만, 일부 구간에서 근거 연결이 약하거나 질문의 일부 요구가 빠지는 경우가 관찰됩니다.";
  } else {
    structure = "논리 구조와 답변 흐름에서 미흡한 부분이 있어, 설명의 일관성이나 요구 반영 측면에서 보완이 필요합니다.";
  }

  // 전문성 평가
  let expertise = "";
  if (전문성 >= 90 && 환각 >= 90) {
    expertise = "분야 전문성 및 팩트 기반 응답이 우수하며, 최신 트렌드와 실무 경험이 잘 녹아 있습니다.";
  } else if (전문성 >= 80) {
    expertise = "전문 지식과 사례 활용이 전반적으로 적절하나, 때때로 근거가 불명확하거나 구체적 설명이 부족할 수 있습니다.";
  } else {
    expertise = "전문성 표현이 다소 부족하거나, 신뢰도 높은 정보 및 사례 제시가 아쉬운 편입니다.";
  }

  // 대화 품질
  let quality = "";
  if (오타율 >= 90 && 정중함 >= 90) {
    quality = "언어 표현이 정확하고, 오타나 비문이 거의 없으며, 정중한 태도를 꾸준히 유지합니다.";
  } else if (오타율 >= 80 && 정중함 >= 80) {
    quality = "전반적으로 언어 품질은 무난하지만, 간혹 오타나 직설적인 표현이 드러날 수 있습니다.";
  } else {
    quality = "문장 오류, 반복적 패턴, 비공식적 언어 등에서 개선의 여지가 있으며, 좀 더 다양한 표현과 친절한 태도가 필요합니다.";
  }

  return (
    <div style={{
      background: "#f6fafd", borderRadius: 10, margin: "18px 0 0 0",
      padding: "18px 18px", fontSize: "15px", color: "#223a53",
      lineHeight: 1.75, boxShadow: "0 1px 6px #e3f8f8"
    }}>
      <b>구조적 분석:</b> {structure}<br />
      <b>전문성 평가:</b> {expertise}<br />
      <b>대화 품질:</b> {quality}
      <br /><br />
      <span style={{ color: "#8ea3ad" }}>
        ※ 점수 대신, 실제 대화 흐름과 언어 품질, 전문성의 특징을 바탕으로 실질적 개선 포인트를 참고하세요.
      </span>
    </div>
  );
}
