import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_SECONDS = 20;

/*
 * 녹음 훅
 * - 녹음을 멈췄다가 다시 시작해도 타이머가 겹치지 않도록
 *   (1) 시작 전에 이전 타이머·마이크를 항상 정리하고
 *   (2) 녹음마다 번호를 붙여 이전 녹음의 늦은 콜백을 무시하며
 *   (3) 경과 시간은 시작 시각 기준으로 계산합니다.
 */
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
  const sessionRef = useRef(0); // 현재 녹음 번호
  const startingRef = useRef(false); // 마이크 권한 대기 중 중복 클릭 방지
  const urlRef = useRef<string | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseMic = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const setUrl = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setAudioUrl(url);
  };

  const stop = useCallback(() => {
    clearTimer();
    const r = recorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    setIsRecording(false);
  }, []);

  const start = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setError(null);

    // 이전 녹음 정리
    clearTimer();
    const prev = recorderRef.current;
    if (prev && prev.state !== "inactive") {
      prev.onstop = null;
      prev.stop();
    }
    releaseMic();

    const mySession = ++sessionRef.current;
    setBlob(null);
    setUrl(null);
    setSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (mySession !== sessionRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (mySession === sessionRef.current && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (mySession !== sessionRef.current) return; // 이전 녹음의 늦은 콜백 무시
        const b = new Blob(chunksRef.current, { type: recorder.mimeType });
        setBlob(b);
        setUrl(URL.createObjectURL(b));
      };

      recorder.start();
      setIsRecording(true);

      const startedAt = Date.now();
      timerRef.current = window.setInterval(() => {
        const s = Math.min(MAX_SECONDS, Math.floor((Date.now() - startedAt) / 1000));
        setSeconds(s);
        if (s >= MAX_SECONDS) stop();
      }, 250);
    } catch {
      setError("마이크를 사용할 수 없어요. 브라우저에서 마이크 권한을 허용해 주세요.");
      setIsRecording(false);
    } finally {
      startingRef.current = false;
    }
  }, [stop]);

  const reset = useCallback(() => {
    sessionRef.current++;
    clearTimer();
    const r = recorderRef.current;
    if (r && r.state !== "inactive") {
      r.onstop = null;
      r.stop();
    }
    releaseMic();
    setIsRecording(false);
    setBlob(null);
    setUrl(null);
    setSeconds(0);
  }, []);

  useEffect(
    () => () => {
      sessionRef.current++;
      clearTimer();
      releaseMic();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  return { isRecording, seconds, blob, audioUrl, error, start, stop, reset };
}