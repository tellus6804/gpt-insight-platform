export const MBTI_PROFILES = {
  ISTJ: {
    label: "현실주의자형",
    icon: "🛠️",
    color: "#4B6584",
    description: "체계적이고 책임감이 강한 커뮤니케이션을 선호합니다. 실용성과 사실 기반의 질문을 자주 합니다.",
    tip: "구체적인 사실과 맥락을 제시하면 GPT가 더 잘 이해할 수 있어요."
  },
  ISFJ: {
    label: "수호자형",
    icon: "💚",
    color: "#50E3C2",
    description: "섬세하고 책임감 있는 커뮤니케이션을 선호하며, 상대방의 입장을 고려한 질문을 자주 합니다.",
    tip: "질문에 목적을 간결히 포함하고, 의도를 명확히 전달하면 GPT가 더 잘 반응합니다."
  },
  INFJ: {
    label: "옹호자형",
    icon: "🌌",
    color: "#9B59B6",
    description: "통찰력 있고 목표 지향적인 질문을 선호하며, 의미와 목적을 중요하게 여깁니다.",
    tip: "질문에 의도와 배경을 담아 전달하면 AI가 더 깊이 있게 이해할 수 있습니다."
  },
  INTJ: {
    label: "전략가형",
    icon: "♟️",
    color: "#0A0A0A",
    description: "체계적이고 전략적인 질문을 통해 문제를 분석하고 본질을 파악하려는 경향이 있습니다.",
    tip: "배경 설명과 맥락을 함께 제공하면 AI가 전략을 더 잘 이해합니다."
  },
  ISTP: {
    label: "장인형",
    icon: "🧰",
    color: "#3B3B98",
    description: "논리적이고 유연한 소통을 선호합니다. 문제 해결을 위한 질문을 선호하고 간결하게 표현합니다.",
    tip: "질문을 명확하고 간결하게 구성하면 AI가 더 빠르게 반응할 수 있어요."
  },
  ISFP: {
    label: "모험가형",
    icon: "🎨",
    color: "#F48FB1",
    description: "감성적이고 유연한 커뮤니케이션을 선호하는 스타일입니다. 직접적인 경험을 바탕으로 조용하지만 강한 표현을 합니다.",
    tip: "느낌 위주의 질문도 좋지만, 핵심 목적이나 맥락을 명확히 해주면 GPT가 더 잘 반응합니다."
  },
  INFP: {
    label: "중재자형",
    icon: "🎨",
    color: "#B37DFF",
    description: "감성과 직관에 따라 유연하게 표현을 구성하는 스타일입니다. 언어에 감정을 담는 것을 중요하게 생각합니다.",
    tip: "구체적인 사례나 논리를 보강하면 AI 이해도가 올라갑니다. 너무 시적으로 쓰면 오해할 수도 있어요."
  },
  INTP: {
    label: "논리술사형",
    icon: "🧠",
    color: "#B8E986",
    description: "논리적이고 분석적인 접근을 선호하며, 개념적이고 구조화된 질문을 자주 합니다.",
    tip: "논리를 바탕으로 질문하되, 구체적인 예시를 포함하면 AI가 더 쉽게 맥락을 이해할 수 있어요."
  },
  ESTP: {
    label: "모험가형",
    icon: "🏍️",
    color: "#FF6B6B",
    description: "즉흥적이고 문제 해결 중심의 대화를 선호합니다. 실용성과 직접적인 표현을 중요하게 생각합니다.",
    tip: "직접적인 표현과 문제 중심 질문은 AI의 정확한 반응을 이끌어냅니다."
  },
  ESFP: {
    label: "연예인형",
    icon: "🎤",
    color: "#F8A5C2",
    description: "에너지 넘치고 경험 중심의 질문을 좋아합니다. 현실적이고 사람 중심적인 표현을 자주 합니다.",
    tip: "흥미로운 사례나 생생한 표현을 곁들여 질문하면 GPT가 맥락을 더 잘 파악할 수 있어요."
  },
  ENFP: {
    label: "활동가형",
    icon: "💡",
    color: "#F5A623",
    description: "아이디어가 넘치고 활기찬 커뮤니케이션을 즐기는 활동가형입니다. 새로운 시도나 창의적인 접근을 선호합니다.",
    tip: "핵심 요점을 정리해주는 습관을 길러보세요. GPT가 흐름을 더 잘 따라갈 수 있어요."
  },
  ENTP: {
    label: "변론가형",
    icon: "🧩",
    color: "#00B894",
    description: "호기심 많고 도전적인 커뮤니케이션을 선호합니다. 다양한 관점과 가능성을 탐색합니다.",
    tip: "여러 가능성을 제시하는 질문은 GPT의 창의적 사고를 자극할 수 있어요."
  },
  ESTJ: {
    label: "경영자형",
    icon: "📊",
    color: "#1E90FF",
    description: "명확한 목표와 실행 중심 대화를 선호하는 경영자형입니다. 불필요한 정보보다는 실질적인 결과를 중요시합니다.",
    tip: "‘핵심만 정리해줘’, ‘실행 단계로 알려줘’처럼 요구사항을 명확히 제시해보세요. GPT가 바로 핵심을 파악합니다."
  },
  ESFJ: {
    label: "사교적 수호자형",
    icon: "🌸",
    color: "#7ED321",
    description: "상대방을 배려하고 조화를 중시하는 소통을 선호합니다. 감정과 실용의 균형을 중시하는 성향입니다.",
    tip: "배려 중심의 질문도 좋지만, 구체적 요구사항을 함께 표현하면 AI가 더 명확하게 응답할 수 있어요."
  },
  ENFJ: {
    label: "선도자형",
    icon: "🗣️",
    color: "#E91E63",
    description: "감정과 조직력이 결합된 커뮤니케이션을 선호합니다. 다른 사람과의 상호작용을 중시합니다.",
    tip: "질문에 목적과 영향력을 포함시키면 GPT가 더 적절한 대응을 할 수 있어요."
  },
  ENTJ: {
    label: "지도자형",
    icon: "📈",
    color: "#D0021B",
    description: "목표 지향적이고 추진력 있는 질문으로 대화를 주도합니다. 효율성과 성과 중심의 사고방식을 선호합니다.",
    tip: "목적과 방향을 명확히 하되, 상대방 의견도 유도하는 표현을 곁들여 보세요. GPT가 더 정교하게 반응합니다."
  }
};

export function analyzeUserCommunicationStyle(inputText) {
  if (!inputText || inputText.trim().length === 0) {
    return null;
  }

  const hasFeelWords = /(느낌|감정|생각|마음)/.test(inputText);
  const hasLogicWords = /(근거|논리|사례|정리|단계)/.test(inputText);
  const hasActionWords = /(실행|처리|계획|목표|결과)/.test(inputText);
  const hasSocialWords = /(공감|의사소통|배려|존중|상호)/.test(inputText);

  let score = { EI: 0, SN: 0, TF: 0, JP: 0 };

  if (hasSocialWords) score.EI -= 10; else score.EI += 10;
  if (hasFeelWords) score.SN += 10; else score.SN -= 10;
  if (hasLogicWords) score.TF -= 10; else score.TF += 10;
  if (hasActionWords) score.JP += 10; else score.JP -= 10;

  const mbti =
    (score.EI >= 0 ? "I" : "E") +
    (score.SN >= 0 ? "N" : "S") +
    (score.TF >= 0 ? "F" : "T") +
    (score.JP >= 0 ? "P" : "J");

  const profile = MBTI_PROFILES[mbti] || {
    label: "분석중형",
    icon: "❔",
    color: "#666",
    description: "명확한 분석을 위해 더 많은 데이터가 필요합니다.",
    tip: "질문을 구체적으로 구성하면 GPT가 더 정확하게 진단할 수 있어요."
  };

  return {
    type: mbti,
    icon: profile.icon,
    label: profile.label,
    color: profile.color,
    description: profile.description,
    tip: profile.tip
  };
}
// 🔍 사용자 발화만 추출하는 함수
export function extractUserSpeechOnly(text) {
  if (!text) return "";
  return text
    .split(/\n+/)
    .filter(line =>
      /^사용자\s*:/.test(line) || /^[You|User]\s*:/.test(line)
    )
    .map(line => line.replace(/^사용자\s*:|^User\s*:|^You\s*:/, "").trim())
    .join(" ");
}
