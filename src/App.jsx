import React, { useState } from 'react';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(null);

  const handleDiagnose = () => {
    if (!question || !answer) {
      alert("질문과 답변을 모두 입력해 주세요.");
      return;
    }
    // 더미 점수 계산
    const score = Math.floor(Math.random() * 41) + 60; // 60~100 사이
    setScore(score);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h1>GPT Insight 플랫폼 (MVP)</h1>
      <p>질문과 GPT 답변을 입력하면 간단한 진단 점수가 출력됩니다.</p>
      <textarea
        rows={4}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="질문 입력"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <textarea
        rows={4}
        style={{ width: '100%', marginBottom: '1rem' }}
        placeholder="GPT 답변 입력"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button onClick={handleDiagnose} style={{ padding: '0.5rem 1rem' }}>
        진단 시작
      </button>
      {score !== null && (
        <div style={{ marginTop: '1.5rem', fontSize: '1.2rem' }}>
          ✅ 진단 점수: <strong>{score}점</strong>
        </div>
      )}
    </div>
  );
}

export default App;
