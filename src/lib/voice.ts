/*
 * 목소리 재생
 * - 녹음 파일(src)이 있으면 그 파일을 재생합니다.
 * - 파일이 없으면 기기의 합성음(TTS)으로 문장을 읽어 줍니다. (실제 사투리 발음 아님)
 */
let current: HTMLAudioElement | null = null;

export function stopVoice() {
  if (current) {
    current.pause();
    current = null;
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export async function playVoice(src: string | null, fallbackText: string): Promise<"file" | "tts"> {
  stopVoice();
  if (src) {
    try {
      const audio = new Audio(src);
      current = audio;
      await audio.play();
      return "file";
    } catch {
      current = null;
    }
  }
  await speak(fallbackText);
  return "tts";
}