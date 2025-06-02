import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(null);
  const [grade, setGrade] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const handleDiagnose = () => {
    const lengthScore = Math.min(answer.length / 10, 100);
    const reflectionRate = question && answer ? (
      question.split(" ").filter(word => answer.includes(word)).length / question.split(" ").length * 100
    ) : 0;

    const totalScore = Math.round((lengthScore * 0.3) + (reflectionRate * 0.7));
    setScore(totalScore);

    const gradeMap = totalScore >= 90 ? "A" : totalScore >= 75 ? "B" : totalScore >= 60 ? "C" : totalScore >= 45 ? "D" : "E";
    setGrade(gradeMap);
    setSummary(`GPT 응답의 반영률은 ${reflectionRate.toFixed(1)}%이며, 응답 길이는 ${answer.length}자로 분석되었습니다.`);

    const tempDetails = [
      { title: "반영률", score: reflectionRate.toFixed(1), desc: "사용자 질문에서 핵심 단어가 얼마나 반영되었는지 분석합니다." },
      { title: "응답 길이", score: lengthScore.toFixed(1), desc: "응답이 충분한 길이로 작성되었는지 평가합니다." },
    ];
    setDetails(tempDetails);

    const tempSuggestions = [
      { title: "반영률 향상", current: "일부 핵심 단어가 빠졌습니다.", suggest: "핵심 단어를 다시 언급하거나 강조하여 GPT 응답에 유도해보세요.", effect: "중요 내용이 누락되지 않고 반영됩니다." },
      { title: "응답 길이 조절", current: "응답이 너무 짧습니다.", suggest: "질문을 더 구체적으로 하면 응답이 더 길어질 수 있습니다.", effect: "내용이 풍부해지고 진단 신뢰도가 올라갑니다." },
    ];
    setSuggestions(tempSuggestions);
  };

  const savePDF = () => {
    html2canvas(document.querySelector("#report")).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("GPT_Insight_Report.pdf");
    });
  };

  return (
    <div style={{ backgroundColor: "#121212", color: "#E0E0E0", fontFamily: "Malgun Gothic", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ color: "#00C2C2" }}>GPT Insight 플랫폼 (MVP)</h1>
      <p>질문과 GPT 답변을 입력하면 실제 분석 로직 기반 진단 점수가 출력됩니다.</p>

      <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="GPT에게 어떤 질문을 하셨나요?" rows="4" style={{ width: "100%", marginBottom: "1rem" }} />
      <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="GPT가 어떤 답변을 했나요?" rows="6" style={{ width: "100%", marginBottom: "1rem" }} />
      <button onClick={handleDiagnose} style={{ backgroundColor: "#00C2C2", color: "#121212", padding: "0.5rem 1rem", border: "none", marginBottom: "2rem" }}>
        진단 시작하기
      </button>

      {score !== null && (
        <div id="report">
          <h2>총 점수: {score}점 (등급: {grade})</h2>
          <p>{summary}</p>

          <div>
            {details.map((d, i) => (
              <div key={i}>
                <strong>{d.title}</strong> - {d.score}점
                <p>{d.desc}</p>
              </div>
            ))}
          </div>

          <h3>개선 제안</h3>
          {suggestions.map((s, i) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <strong>[{s.title}]</strong><br/>
              현재 문제: {s.current}<br/>
              개선 제안: {s.suggest}<br/>
              기대 효과: {s.effect}
            </div>
          ))}

          <button onClick={savePDF} style={{ marginTop: "1rem", backgroundColor: "#00C2C2", color: "#121212", padding: "0.5rem 1rem", border: "none" }}>
            PDF 저장하기
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
