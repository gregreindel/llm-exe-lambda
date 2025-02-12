export async function getContentFromUrlAsJson<T extends Record<string, any> = any>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 7500);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.text();
    return JSON.parse(data) as T;
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
