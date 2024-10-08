// This is the response we expect from the OpenAI API. It's a JSON object with a single property, `pairs`, which
// is an array of objects. Each object has a `question` and an `answer` property, and an optional `unsure`
// property. This is the same object we described with a JSON schema above.
export interface QuestionsResponse {
  pairs: Pair[]; // The brackets mean this is an array of objects.
}

export interface Pair {
  question: string;
  answer: string;
  // The question mark means this isn't required (it might not be present).
  unsure?: boolean;
}
