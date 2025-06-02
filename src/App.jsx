import React, { useState } from 'react';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(null);
  const [details, setDetails] = useState('');

  const extractKeywords = (text) => {
    const stopwords = ['이', '그', '저', '은', '는', '이란', '을', '를', '의', '와', '과', '에', '에서', '하다'];
    return [...new Set(
      text
        .replace(/[^가-힣a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopwords.includes(word))
    )];
  };

  const calculateSimilarity = (a, b) => {
    const wordsA = a.toLowerCase().split(/\s+/);
    const wordsB = b.toLowerCase().split(/\s+/);
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / Math.sqrt(setA.size * setB.size || 1);
  };

  const handleDiagnose = () => {
    if (!question || !answer) {
      alert("질문과 답변을 모두 입력해 주세요.");
      return;
    }

    const keywords = extractKeywords(question);
    const matchCount = keywords.filter(kw => answer.includes(kw)).length;
    const reflectionRate = keywords.length ? matchCount / keywords.length : 0;

    const similarity = calculateSimilarity(question, answer); // 0~1
    const lengthScore = Math.min(answer.length / 300, 1); // 300자 기준

    let baseScore = reflectionRate * 60 + lengthScore * 30;
    if (similarity > 0.85) baseScore -= 10;

    const finalScore = Math.round(Math.min(Math.max(baseScore, 0), 100));

    const resultDetails = `- 핵심 키워드 반영률: ${matchCount}/${keywords.length} (${Math.round(reflectionRate * 100)}%)\n`
      + `- 답변 길이 평가: ${Math.round(lengthScore * 30)}점\n`
      + `- 질문/답변 유사도: ${(similarity * 100).toFixed(1)}%`;

    setScore(finalScore);
    setDetails(resultDetails);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '700px' }}>
      <h1>GPT Insight 플랫폼 (MVP)</h1>
      <p>질문과 GPT 답변을 입력하면 실제 분석 로직 기반 진단 점수가 출력됩니다.</p>
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
        <div style={{ marginTop: '1.5rem', fontSize: '1.2rem', whiteSpace: 'pre-line' }}>
          ✅ 진단 점수: <strong>{score}점</strong>
          <br />
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>{details}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
