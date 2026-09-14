import { useCallback, useEffect, useState, useSyncExternalStore, type SetStateAction } from "react";
import { getSchoolId, request } from "./api";

export interface CbcGradingBand {
  bandId?: string;
  minScore: number;
  maxScore: number;
  grade: string;
  points: number;
  sortOrder?: number;
}

export const normalizeCbcBands = (bands: CbcGradingBand[]) =>
  [...bands].sort((left, right) => {
    const order = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    return order || right.minScore - left.minScore;
  });

export const resolveCbcBand = (
  marks: number | null | undefined,
  bands: CbcGradingBand[],
) => {
  if (typeof marks !== "number" || !Number.isFinite(marks)) {
    return { cbcBand: "-", points: 0 };
  }

  const roundedMarks = Math.max(0, Math.min(100, Math.round(marks)));
  const band = normalizeCbcBands(bands).find(
    (candidate) =>
      roundedMarks >= candidate.minScore && roundedMarks <= candidate.maxScore,
  );

  return band
    ? { cbcBand: band.grade, points: Number(band.points) || 0 }
    : { cbcBand: "Unconfigured", points: 0 };
};

export const resolveCbcBandByPoints = (
  points: number | null | undefined,
  bands: CbcGradingBand[],
) => {
  if (typeof points !== "number" || !Number.isFinite(points)) {
    return { cbcBand: "-", points: 0 };
  }

  const roundedPoints = Math.max(0, Math.round(points));
  const band = normalizeCbcBands(bands).find(
    (candidate) => Number(candidate.points) === roundedPoints,
  );

  return band
    ? { cbcBand: band.grade, points: Number(band.points) || 0 }
    : { cbcBand: "Unconfigured", points: roundedPoints };
};

export const cbcBandColor = (band: string) => {
  const prefix = String(band || "")
    .slice(0, 2)
    .toUpperCase();
  if (prefix === "EE") return "#1D9E75";
  if (prefix === "ME") return "#185FA5";
  if (prefix === "AE") return "#BA7517";
  if (prefix === "BE") return "#993C1D";
  return "#5d665f";
};

export const cbcBandBg = (band: string) => {
  const prefix = String(band || "")
    .slice(0, 2)
    .toUpperCase();
  if (prefix === "EE") return "#eaf7f1";
  if (prefix === "ME") return "#edf5fc";
  if (prefix === "AE") return "#fff7e7";
  if (prefix === "BE") return "#faece7";
  return "#f3f4f3";
};

type CbcGradingState = {
  bands: CbcGradingBand[];
  gradeScalerId?: string;
  loading: boolean;
  error: string;
  updatedAt: number;
};

const CBC_CACHE_TTL_MS = 60_000;
const emptyCbcState: CbcGradingState = {
  bands: [],
  gradeScalerId: undefined,
  loading: true,
  error: "",
  updatedAt: 0,
};
const cbcStates = new Map<string, CbcGradingState>();
const cbcListeners = new Map<string, Set<() => void>>();
const cbcPending = new Map<string, Promise<CbcGradingState>>();

const cbcStateFor = (schoolId: string) => cbcStates.get(schoolId) || emptyCbcState;
const notifyCbc = (schoolId: string) =>
  cbcListeners.get(schoolId)?.forEach((listener) => listener());
const setCbcState = (schoolId: string, state: CbcGradingState) => {
  cbcStates.set(schoolId, state);
  notifyCbc(schoolId);
};

const loadCbcBands = (schoolId: string, force = false): Promise<CbcGradingState> => {
  const current = cbcStateFor(schoolId);
  if (!force && current.updatedAt && Date.now() - current.updatedAt < CBC_CACHE_TTL_MS) {
    return Promise.resolve(current);
  }
  const pending = cbcPending.get(schoolId);
  if (pending) return pending;

  setCbcState(schoolId, { ...current, loading: true, error: "" });
  const requestPromise = request<any>(
    `/create/grading-scale/${encodeURIComponent(schoolId)}`,
  )
    .then((response) => {
      const next = {
        bands: normalizeCbcBands(response?.gradeBandDTOs || []),
        gradeScalerId: response?.gradeScaleId,
        loading: false,
        error: "",
        updatedAt: Date.now(),
      };
      setCbcState(schoolId, next);
      return next;
    })
    .catch((err: unknown) => {
      const next = {
        ...cbcStateFor(schoolId),
        loading: false,
        error: err instanceof Error ? err.message : "Unable to load CBC grading configuration.",
      };
      setCbcState(schoolId, next);
      throw err;
    })
    .finally(() => cbcPending.delete(schoolId));
  cbcPending.set(schoolId, requestPromise);
  return requestPromise;
};

export const invalidateCbcGradingBands = (schoolId = getSchoolId()) => {
  if (!schoolId) return;
  const current = cbcStateFor(schoolId);
  setCbcState(schoolId, { ...current, updatedAt: 0 });
};

export const useCbcGradingBands = () => {
  const schoolId = getSchoolId();
  const [draftBands, setDraftBands] = useState<CbcGradingBand[] | null>(null);
  const subscribe = useCallback((listener: () => void) => {
    if (!schoolId) return () => undefined;
    const listeners = cbcListeners.get(schoolId) || new Set<() => void>();
    listeners.add(listener);
    cbcListeners.set(schoolId, listeners);
    return () => listeners.delete(listener);
  }, [schoolId]);
  const getSnapshot = useCallback(
    () => (schoolId ? cbcStateFor(schoolId) : emptyCbcState),
    [schoolId],
  );
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const reload = useCallback(async () => {
    if (!schoolId) return;
    setDraftBands(null);
    await loadCbcBands(schoolId, true);
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    void loadCbcBands(schoolId).catch(() => undefined);
  }, [schoolId]);

  const setBands = useCallback(
    (next: SetStateAction<CbcGradingBand[]>) => {
      setDraftBands((current) => {
        const base = current ?? state.bands;
        return typeof next === "function" ? next(base) : next;
      });
    },
    [state.bands],
  );

  return {
    bands: draftBands ?? state.bands,
    setBands,
    loading: state.loading,
    error: state.error,
    reload,
    gradeScalerId: state.gradeScalerId,
  };
};

export const totalPointsForMarks = (
  marks: Record<string, number>,
  bands: CbcGradingBand[],
) =>
  Object.values(marks || {}).reduce(
    (sum, mark) => sum + resolveCbcBand(mark, bands).points,
    0,
  );
