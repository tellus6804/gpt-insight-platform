// App.jsx – 전기 퍼짐형 배경 이미지 적용 UI
import React, { useState } from "react";
import glowLogo from "./assets/eleclogo.png";
import backgroundGrid from "./assets/background.png"; // 새 전기 퍼짐 배경 이미지

export default function App() {
  const [form, setForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    question: ""
  });
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDiagnose = () => {
    if (!form.name || form.question.length < 20) {
      alert("이름과 충분한 내용을 입력해주세요.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const wordCount = form.question.split(" ").length;
      const baseScore = Math.min(100, 40 + wordCount);
      setScore(baseScore);
      setLoading(false);
    }, 2000);
  };

return (
<div style={{
  position: "relative",
  backgroundImage: `url(${backgroundGrid})`, // backgroundGrid = background.png import된 변수
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center top",
  backgroundColor: "#051e30",
  color: "#E0F7F7",
  fontFamily: "'Orbitron', '맑은 고딕', sans-serif",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingTop: 60,
  paddingBottom: 80,
  overflow: "hidden"
}}>


    {/* 중심 로고 */}
    <div style={{
      position: "relative",
      zIndex: 1,
      width: 220,
      height: 220,
      backgroundImage: `url(${glowLogo})`,
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      marginBottom: 28
    }} />
    {/* 입력 카드 */}
    <div style={{
      position: "relative",
      zIndex: 2,
      background: "#031d31cc",
      padding: 32,
      borderRadius: 22,
      boxShadow: "0 0 28px #3AB4F255",
      width: "90%",
      maxWidth: 480,
      backdropFilter: "blur(5px)",
      border: "1px solid #3ab4f244"
    }}>
      <input
        placeholder="이름"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        style={{
          width: "100%",
          marginBottom: 16,
          fontSize: 16,
          padding: "14px 18px",
          borderRadius: 12,
          background: "#0a2c45",
          color: "#E0F7F7",
          border: "1.5px solid #3AB4F2",
          boxShadow: "inset 0 0 6px #0077cc"
        }}
      />

      <input
        type="date"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        style={{
          width: "100%",
          marginBottom: 16,
          fontSize: 16,
          padding: "14px 18px",
          borderRadius: 12,
          background: "#0a2c45",
          color: "#3AB4F2",
          border: "1.5px solid #3AB4F2",
          boxShadow: "inset 0 0 6px #0077cc"
        }}
      />

      <textarea
        value={form.question}
        onChange={e => setForm({ ...form, question: e.target.value })}
        placeholder="GPT와 산벗 대화한 내용을 전체 복사하여 붙여 넣어주세요."
        rows={4}
        style={{
          width: "100%",
          fontSize: 15,
          padding: 16,
          borderRadius: 12,
          background: "#0a2c45",
          color: "#E0F7F7",
          border: "1.5px solid #3AB4F2",
          marginBottom: 20,
          resize: "none",
          boxShadow: "inset 0 0 8px #0070aa"
        }}
      />

      <button
        onClick={handleDiagnose}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: 16,
          fontWeight: 700,
          background: "linear-gradient(90deg, #1783d3, #3AB4F2)",
          color: "#f2f9ff",
          border: "none",
          borderRadius: 12,
          boxShadow: "0 0 16px #3ab4f288",
          cursor: "pointer",
          marginBottom: 20
        }}
      >
        진단 시작
      </button>

      {loading && <p style={{ textAlign: "center", color: "#3AB4F2" }}>분석 중입니다...</p>}

      {score !== null && !loading && (
        <div style={{
          marginTop: 20,
          padding: 20,
          borderRadius: 12,
          background: "#0e2638",
          boxShadow: "0 0 14px #3ab4f244",
          textAlign: "center",
          fontSize: 18,
          color: "#3AB4F2",
          fontWeight: 600
        }}>
          ✅ 진단 점수: {score}점
        </div>
      )}
    </div>

  </div>
);

}
