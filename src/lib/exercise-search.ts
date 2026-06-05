import exercises from "@/data/exercises.json";

type ExerciseRecord = {
  name: string;
  gif: string;
  muscleGroup?: string | null;
};

type IndexedExercise = ExerciseRecord & {
  normalized: string;
  tokens: string[];
};

const EXERCISES = exercises as ExerciseRecord[];

const indexedExercises: IndexedExercise[] = EXERCISES.map((exercise) => {
  const normalized = normalizeText(exercise.name);
  return {
    ...exercise,
    normalized,
    tokens: normalized.split(" ").filter(Boolean),
  };
});

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a: string, b: string) {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function scoreSimilarity(query: string, candidate: IndexedExercise) {
  if (!query) return 0;
  if (query === candidate.normalized) return 1;

  const queryTokens = query.split(" ").filter(Boolean);
  const tokenMatches = queryTokens.filter((token) =>
    candidate.tokens.includes(token)
  ).length;
  const tokenScore = queryTokens.length
    ? tokenMatches / queryTokens.length
    : 0;

  const distance = levenshteinDistance(query, candidate.normalized);
  const maxLen = Math.max(query.length, candidate.normalized.length) || 1;
  const levenshteinScore = 1 - distance / maxLen;

  return tokenScore * 0.55 + levenshteinScore * 0.45;
}

function pickBestMatch(query: string) {
  let best: IndexedExercise | null = null;
  let bestScore = 0;

  for (const exercise of indexedExercises) {
    const score = scoreSimilarity(query, exercise);
    if (score > bestScore) {
      best = exercise;
      bestScore = score;
    }
  }

  return { exercise: best, score: bestScore };
}

export function searchExercises(query: string, limit = 8) {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const scored = indexedExercises
    .map((exercise) => ({
      exercise,
      score: scoreSimilarity(normalized, exercise),
    }))
    .filter((item) => item.score > 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.exercise);

  return scored;
}

export function findExerciseByName(name: string) {
  const normalized = normalizeText(name);
  if (!normalized) return null;

  const direct = indexedExercises.find(
    (exercise) => exercise.normalized === normalized
  );
  if (direct) return direct;

  const { exercise, score } = pickBestMatch(normalized);
  if (!exercise || score < 0.45) return null;

  return exercise;
}

export function findExerciseInText(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  let best: IndexedExercise | null = null;
  for (const exercise of indexedExercises) {
    if (normalized.includes(exercise.normalized)) {
      if (!best || exercise.normalized.length > best.normalized.length) {
        best = exercise;
      }
    }
  }

  if (best) return best;

  const { exercise, score } = pickBestMatch(normalized);
  if (!exercise || score < 0.45) return null;

  return exercise;
}
