const PROBLEM_FEEDBACK_PREFIX = "[PROBLEMA] ";

export function encodeFeedbackComment(comment: string, isProblem?: boolean): string {
  const trimmed = comment.trim();
  if (!trimmed) {
    return trimmed;
  }
  return isProblem ? `${PROBLEM_FEEDBACK_PREFIX}${trimmed}` : trimmed;
}

export function decodeFeedbackComment(rawComment: string) {
  const isProblem = rawComment.startsWith(PROBLEM_FEEDBACK_PREFIX);
  const comment = isProblem
    ? rawComment.slice(PROBLEM_FEEDBACK_PREFIX.length)
    : rawComment;

  return { comment, isProblem };
}

export function isProblemFeedback(comment: string) {
  return decodeFeedbackComment(comment).isProblem;
}

export { PROBLEM_FEEDBACK_PREFIX };
