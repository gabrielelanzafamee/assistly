export async function tryCatchSafe(fn: (...args: any[]) => any, ...args: any[]) {
  try {
    // Await the result if the function is async, otherwise return the result directly
    const result = await fn(...args);
    return result; // Return the result if successful
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((acc, value, idx) => acc + value * vecB[idx], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, value) => acc + value * value, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, value) => acc + value * value, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function assertion(condition: any, exception: Error) {
	if (!condition) {
		throw exception;
	}
}