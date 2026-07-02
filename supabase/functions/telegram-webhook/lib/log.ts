export function logINFO(tag: string, message: string, data?: Record<string, unknown>): void {
  const prefix = `[INFO][${tag}]`;
  if (data) {
    console.log(prefix, message, JSON.stringify(data));
  } else {
    console.log(prefix, message);
  }
}

export function logWARNING(tag: string, message: string, data?: Record<string, unknown>): void {
  const prefix = `[WARNING][${tag}]`;
  if (data) {
    console.warn(prefix, message, JSON.stringify(data));
  } else {
    console.warn(prefix, message);
  }
}
