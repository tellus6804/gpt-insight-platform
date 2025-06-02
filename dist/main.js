function startDiagnosis() {
  const input = document.getElementById('userInput').value;
  const response = document.getElementById('gptResponse').value;

  // 간단한 점수 계산 로직
  const lengthScore = Math.min(input.length / 10, 100);
  const matchScore = response.includes("네") ? 100 : 50;
  const finalScore = Math.round((lengthScore + matchScore) / 2);

  // 결과 출력
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <h2>총 점수: ${finalScore}점</h2>
    <p>등급: ${getGrade(finalScore)}</p>
    <p>요약 설명: 이 점수는 질문과 답변의 길이 및 일치도를 기반으로 평가된 결과입니다.</p>
  `;
}

function getGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}
