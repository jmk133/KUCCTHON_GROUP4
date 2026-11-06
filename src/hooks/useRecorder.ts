import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_SECONDS = 20;

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stop = useCallback(() => {
    clearTimer();
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const b = new Blob(chunksRef.current, { type: recorder.mimeType });
        setBlob(b);
        setAudioUrl(URL.createObjectURL(b));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setBlob(null);
      setAudioUrl(null);
      setSeconds(0);
      setIsRecording(true);
      let s = 0;
      timerRef.current = window.setInterval(() => {
        s += 1;
        setSeconds(s);
        if (s >= MAX_SECONDS) stop();
      }, 1000);
    } catch {
      setError("마이크를 사용할 수 없어요. 권한을 허용하거나 샘플로 체험해 주세요.");
    }
  }, [stop]);

  const reset = useCallback(() => {
    setBlob(null);
    setAudioUrl(null);
    setSeconds(0);
  }, []);

  useEffect(
    () => () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  return { isRecording, seconds, blob, audioUrl, error, start, stop, reset };
}