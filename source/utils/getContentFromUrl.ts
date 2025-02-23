export async function getContentFromUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 7500);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.text();
    return data.trim();
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
