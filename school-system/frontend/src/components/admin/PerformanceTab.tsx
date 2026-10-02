import React, { useEffect, useState, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api, getSchoolId, normalizeSubjectJoints, request } from "../../lib/api";
import { resolveCbcBand, useCbcGradingBands, type CbcGradingBand } from "../../lib/cbcGrading";
import { Class, Subject } from "./types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { ChartContainer } from "../shared/analytics/ChartContainer";
import {
  analyticsGridProps,
  analyticsLegendProps,
  analyticsTooltipProps,
  analyticsXAxisProps,
  analyticsYAxisProps,
} from "../shared/analytics/chartDefaults";
import { analyticsChartDefaults, analyticsColors } from "../../lib/analyticsTheme";

interface PerformanceTabProps {
  classes: Class[];
  subjects: Subject[];
  subjectJoints?: any[];
  avatar: (name: string, size: number) => string;
  periodRefreshKey?: number;
}

interface ClassPerformanceRow {
  id: string;
  name: string;
  admissionNo: string;
  stream: string;
  marks: Record<string, number | null>;
  total: number;
  points: number;
  scoredSubjects: number;
  average: number;
  rank: number;
}

interface PerformanceSubject {
  id: string;
  name: string;
}

const panelStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
};

const statBoxStyle: React.CSSProperties = {
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px",
  color: "var(--text)",
  verticalAlign: "middle",
};

const tableHeadStyle: React.CSSProperties = {
  ...tableCellStyle,
  color: "var(--textM)",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".04em",
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
};

const computeMarkPercentage = (marks: any): number | null => {
  if (!marks) return null;

  const avgPct = toFiniteNumber(
    typeof marks.avgPercentage === "string"
      ? marks.avgPercentage.replace("%", "").trim()
      : marks.avgPercentage,
  );
  if (avgPct !== null) return Math.min(100, Math.max(0, Math.round(avgPct)));

  const finalScore = toFiniteNumber(marks?.finalScore);
  if (finalScore !== null) return Math.min(100, Math.max(0, Math.round(finalScore)));

  const cats = [marks?.cat1, marks?.cat2, marks?.cat3, marks?.cat4, marks?.cat5];
  const catMaxes = [marks?.cat1Max, marks?.cat2Max, marks?.cat3Max, marks?.cat4Max, marks?.cat5Max];
  const exam = toFiniteNumber(marks?.exam);
  const examMax = toFiniteNumber(marks?.examMax) ?? 100;

  let totalScore = 0;
  let totalMax = 0;

  cats.forEach((cat, i) => {
    const score = toFiniteNumber(cat);
    if (score !== null) {
      totalScore += score;
      totalMax += toFiniteNumber(catMaxes[i]) ?? 40;
    }
  });

  if (exam !== null) {
    totalScore += exam;
    totalMax += examMax;
  }

  return totalMax <= 0 ? null : Math.round((totalScore / totalMax) * 100);
};

const markToPoints = (v: number, bands: CbcGradingBand[]): number => resolveCbcBand(v, bands).points;

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  classes,
  subjectJoints,
  periodRefreshKey = 0,
}) => {
  const { bands: cbcBands } = useCbcGradingBands();
  const [schoolPeriod, setSchoolPeriod] = useState<{
    term?: number;
    year?: number | string;
    examType?: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState(() => {
    const saved = localStorage.getItem("edunex.admin.performanceScope");
    if (!saved) return "";
    try {
      return JSON.parse(saved);
    } catch {
      return "";
    }
  });
  const [performanceRows, setPerformanceRows] = useState<ClassPerformanceRow[]>([]);
  const [performanceSubjects, setPerformanceSubjects] = useState<PerformanceSubject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [rankingMode, setRankingMode] = useState<"total_points" | "total_marks">("total_points");
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [termlyTrend, setTermlyTrend] = useState<any[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [tableLoaded, setTableLoaded] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const performanceRequestId = useRef(0);
  const analyticsRequestId = useRef(0);

  useEffect(() => {
    const schoolId = getSchoolId();
    if (!schoolId) return;

    let ignore = false;
    setSchoolPeriod(null);
    setPerformanceRows([]);
    setPerformanceSubjects([]);
    setChartData([]);
    setTermlyTrend([]);
    setTableLoaded(false);
    setShowTable(false);
    api.get<any>(`/schools/get/term/exam/${encodeURIComponent(schoolId)}`)
      .then((period) => {
        if (!ignore) {
          setSchoolPeriod(period);
        }
      })
      .catch(() => {
        if (!ignore) {
          setSchoolPeriod(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, [periodRefreshKey]);

  const uniqueGrades = useMemo(() => {
    const grades = Array.from(new Set(classes.map(c => c.grade)));
    return grades.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes]);

  useEffect(() => {
    const selectedGrade = selectedId?.startsWith("grade:")
      ? selectedId.replace("grade:", "")
      : "";
    const hasValidSelection =
      (selectedGrade && uniqueGrades.includes(selectedGrade)) ||
      classes.some((currentClass) => currentClass.id === selectedId);

    if ((!selectedId || !hasValidSelection) && classes.length > 0) {
      const nextId = classes[0].id;
      setSelectedId(nextId);
      localStorage.setItem("edunex.admin.performanceScope", JSON.stringify(nextId));
    }
  }, [classes, selectedId, uniqueGrades]);

  const isGradeSelected = selectedId?.startsWith("grade:");
  const currentGrade = isGradeSelected ? selectedId?.replace("grade:", "") : "";
  const currentClass = useMemo(
    () => (!isGradeSelected ? classes.find((c) => c.id === selectedId) || null : null),
    [classes, isGradeSelected, selectedId],
  );

  const targetClasses = useMemo(
    () => (isGradeSelected ? classes.filter((c) => c.grade === currentGrade) : (currentClass ? [currentClass] : [])),
    [classes, currentClass, currentGrade, isGradeSelected],
  );
  const performancePeriod = useMemo(() => {
    const firstClass = targetClasses[0];
    return {
      term: schoolPeriod?.term ?? firstClass?.term ?? 1,
      year: String(schoolPeriod?.year ?? firstClass?.year ?? new Date().getFullYear()),
      examType: schoolPeriod?.examType?.toUpperCase() || firstClass?.examType?.toUpperCase() || "OPENER",
    };
  }, [schoolPeriod, targetClasses]);
  const availableSubjects = performanceSubjects;

  const loadPerformance = async (): Promise<{
    rows: ClassPerformanceRow[];
    subjects: PerformanceSubject[];
  }> => {
    const requestId = ++performanceRequestId.current;
    if (!schoolPeriod) {
      setPerformanceRows([]);
      setPerformanceSubjects([]);
      return { rows: [], subjects: [] };
    }
    if (targetClasses.length === 0) {
      setPerformanceRows([]);
      return { rows: [], subjects: [] };
    }
    setIsLoading(true);
    try {
      const joints = subjectJoints
        ? normalizeSubjectJoints(subjectJoints)
        : await api.get<any[]>("/school/class-subjects");
      const classKeys = new Set(
        targetClasses.map(
          (cls) => `${String(cls.grade || "").trim()}::${String(cls.stream || "").trim()}`,
        ),
      );
      const targetJoints = (joints || []).filter((joint) => {
        const grade = String(joint.classGrade || "").trim();
        const stream = String(joint.classStream || "").trim();
        return classKeys.has(`${grade}::${stream}`) && joint.isOffered !== false;
      });
      const nextSubjects = targetJoints.map((joint) => ({
        id: joint.id || joint.subjectJointId || joint.subjectId,
        name: joint.name || joint.subjectName || "Subject",
      }));
      if (requestId !== performanceRequestId.current) {
        return { rows: [], subjects: [] };
      }
      setPerformanceSubjects(nextSubjects);

      const marksBySubject = new Map<string, Map<string, number | null>>();
      await Promise.all(
        targetJoints.map(async (joint) => {
          const subjectJointId = String(joint.id || joint.subjectJointId || joint.subjectId);
          const query = new URLSearchParams({
            subjectId: subjectJointId,
            year: performancePeriod.year,
            term: String(performancePeriod.term),
            examType: performancePeriod.examType,
            page: "0",
            size: "1000",
          });
          const response = await api.get<any>(`/marks?${query.toString()}`);
          const rows = Array.isArray(response) ? response : response?.data;
          const marks = new Map<string, number | null>();

          (Array.isArray(rows) ? rows : []).forEach((row: any) => {
            marks.set(
              String(row.studentId),
              computeMarkPercentage(row),
            );
          });
          marksBySubject.set(subjectJointId, marks);
        }),
      );

      const dashboards = await Promise.all(targetClasses.map((cls) => {
        const query = new URLSearchParams({
          term: String(performancePeriod.term),
          academicYear: performancePeriod.year,
          examType: performancePeriod.examType,
        });
        return request<any[]>(`/stats/marks/class/${encodeURIComponent(cls.id)}/dashboard?${query.toString()}`);
      }));
      const ranked = dashboards.flat().map((item: any) => ({
        id: String(item.studentId),
        name: item.studentName || "",
        admissionNo: item.admissionNo || "-",
        stream: item.stream || "",
        marks: Object.fromEntries(
          targetJoints.map((joint) => {
            const subjectJointId = String(joint.id || joint.subjectJointId || joint.subjectId);
            return [
              subjectJointId,
              marksBySubject.get(subjectJointId)?.get(String(item.studentId)) ?? null,
            ];
          }),
        ),
        total: Math.round(Number(item.totalMarks) || 0),
        points: Math.round(Number(item.points) || 0),
        scoredSubjects: Number(item.scoredSubjects) || 0,
        average: Math.round(Number(item.average) || 0),
        rank: 0,
      })).sort((a, b) => {
        // Sort strictly by the selected ranking mode only
        let diff = 0;
        if (rankingMode === "total_marks") {
          diff = b.total - a.total;
        } else {
          diff = b.points - a.points;
        }
        return diff || a.name.localeCompare(b.name);
      });

      // Dense ranking: ties share the same rank, next position is consecutive (not skipped)
      let currentRank = 0;
      let prevValue: number | null = null;
      
      ranked.forEach(row => {
        const currentValue = rankingMode === "total_marks" ? row.total : row.points;

        if (currentValue !== prevValue) {
          currentRank += 1;
          prevValue = currentValue;
        }
        row.rank = currentRank;
      });
      if (requestId !== performanceRequestId.current) {
        return { rows: [], subjects: [] };
      }
      setPerformanceRows(ranked);
      return { rows: ranked, subjects: nextSubjects };
    } catch (err: any) {
      if (requestId !== performanceRequestId.current) {
        return { rows: [], subjects: [] };
      }
      setPerformanceSubjects([]);
      setMsg({ text: err.message || "Failed to load performance.", type: "error" });
      return { rows: [], subjects: [] };
    } finally {
      if (requestId === performanceRequestId.current) setIsLoading(false);
    }
  };

  const loadChartData = async (requestId: number) => {
    if (targetClasses.length === 0) {
      setChartData([]);
      return;
    }
    setChartLoading(true);
    try {
      const { term, year, examType } = performancePeriod;
      let data: any = null;
      if (currentClass) {
        const query = new URLSearchParams({ term: String(term), academicYear: year, examType });
        data = await request(`/stats/marks/class/${encodeURIComponent(currentClass.id)}/distribution?${query.toString()}`);
      } else if (currentGrade) {
        const query = new URLSearchParams({ term: String(term), academicYear: year, examType });
        data = await request(`/stats/marks/grade/${encodeURIComponent(currentGrade)}/distribution?${query.toString()}`);
      }
      if (requestId !== analyticsRequestId.current) return;
      const subjects = Array.isArray(data?.subjects) ? data.subjects : [];
      setChartData(subjects);
    } catch (err: any) {
      if (requestId !== analyticsRequestId.current) return;
      setMsg({ text: err.message || "Failed to load analytics.", type: "error" });
      setChartData([]);
    } finally {
      if (requestId === analyticsRequestId.current) setChartLoading(false);
    }
  };

  const loadTermlyTrend = async (requestId: number) => {
    if (targetClasses.length === 0) {
      setTermlyTrend([]);
      return;
    }
    setTrendLoading(true);
    try {
      const year = performancePeriod.year;
      const examType = performancePeriod.examType;
      let data: any[] = [];
      if (currentClass) {
        data = await api.get(`/stats/marks/class/${encodeURIComponent(currentClass.id)}/termly-trend?academicYear=${encodeURIComponent(year)}&examType=${encodeURIComponent(examType)}`);
      } else if (currentGrade) {
        data = await api.get(`/stats/marks/grade/${encodeURIComponent(currentGrade)}/termly-trend?academicYear=${encodeURIComponent(year)}&examType=${encodeURIComponent(examType)}`);
      }
      if (requestId !== analyticsRequestId.current) return;
      setTermlyTrend(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (requestId !== analyticsRequestId.current) return;
      setMsg({ text: err.message || "Failed to load termly trend.", type: "error" });
      setTermlyTrend([]);
    } finally {
      if (requestId === analyticsRequestId.current) setTrendLoading(false);
    }
  };

  useEffect(() => {
    setShowTable(false);
    setTableLoaded(false);
    setPerformanceRows([]);
    setPerformanceSubjects([]);
    setTablePage(0);
    performanceRequestId.current += 1;
    analyticsRequestId.current += 1;
    if (!schoolPeriod) {
      setChartData([]);
      setTermlyTrend([]);
      return;
    }
    const requestId = ++analyticsRequestId.current;
    loadChartData(requestId);
    loadTermlyTrend(requestId);
  }, [selectedId, performancePeriod.term, performancePeriod.year, performancePeriod.examType, schoolPeriod]);

  useEffect(() => {
    if (showTable && !tableLoaded && schoolPeriod) {
      loadPerformance();
      setTableLoaded(true);
    }
  }, [
    showTable,
    tableLoaded,
    schoolPeriod,
    performancePeriod.term,
    performancePeriod.year,
    performancePeriod.examType,
  ]);

  useEffect(() => {
    if (subjectJoints) {
      setTableLoaded(false);
    }
  }, [subjectJoints]);

  const handleSendWhatsappMarks = async () => {
    if (!currentClass) return;

    setIsSendingWhatsapp(true);
    setMsg(null);
    try {
      const response = await api.post<{ message?: string }>("/marks/whatsapp/class", {
        classGrade: currentClass.grade,
        classStream: currentClass.stream || "",
        term: currentClass.term || 1,
        year: currentClass.year || new Date().getFullYear(),
        examType: currentClass.examType || "opener",
      });
      setMsg({
        text: response.message || "WhatsApp marks have been queued.",
        type: "success",
      });
    } catch (err: any) {
      setMsg({
        text: err?.message || "Unable to queue WhatsApp marks.",
        type: "error",
      });
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  const rankingLabel = rankingMode === "total_marks" ? "Total Marks" : "Total Points";

  const handleDownloadExcel = async () => {
    const { rows, subjects } = await loadPerformance();
    if (rows.length === 0) return;
    const XLSX = await import("xlsx");
    const worksheetData = rows.map(row => {
      const data: any = {
        Rank: row.rank,
        Student: row.name,
        "Adm No": row.admissionNo,
        Stream: row.stream
      };
      subjects.forEach(sub => {
        data[sub.name] = row.marks[sub.id] ?? "-";
      });
      data["Total Marks"] = row.total;
      data["Total Points"] = row.points;
      data["Ranked By"] = rankingLabel;
      return data;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance");
    const name = isGradeSelected ? `Grade_${currentGrade}_Combined` : (currentClass?.name || "Class");
    XLSX.writeFile(workbook, `Performance_${name}_${Date.now()}.xlsx`);
    setMsg({ text: "Excel report downloaded successfully.", type: "success" });
  };

  const handleDownloadPDF = async () => {
    const { rows, subjects } = await loadPerformance();
    if (rows.length === 0) return;
    const doc = new jsPDF("landscape");
    const title = isGradeSelected ? `Grade ${currentGrade} (All Streams) Performance Report` : `${currentClass?.name} Performance Report`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    const firstCls = targetClasses[0];
    if (firstCls) {
       doc.text(`Term ${firstCls.term}, ${firstCls.year} (${firstCls.examType?.toUpperCase()}) | Ranked by: ${rankingLabel}`, 14, 22);
    }
    
    autoTable(doc, {
      head: [["Rank", "Student", "Adm No", "Stream", ...subjects.map(s => s.name), "Total Marks", "Total Points"]],
      body: rows.map(row => [
        row.rank,
        row.name,
        row.admissionNo,
        row.stream,
        ...subjects.map(s => row.marks[s.id] ?? "-"),
        row.total,
        row.points
      ]),
      startY: 30,
      theme: "grid",
      styles: { fontSize: 7 },
      headStyles: { fillColor: [201, 150, 61] }
    });
    const name = isGradeSelected ? `Grade_${currentGrade}_Combined` : (currentClass?.name || "Class");
    doc.save(`Performance_${name}.pdf`);
  };

  const scoredRows = performanceRows.filter(r => r.scoredSubjects > 0);
  const topStudent = performanceRows[0] || null;

  const gradeKeys = useMemo(() => {
    if (chartData.length === 0) return [];
    const keys = new Set<string>();
    chartData.forEach((item) => {
      Object.keys(item.gradeDistribution || {}).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [chartData]);

  const gradeColorMap: Record<string, string> = {
    A: analyticsColors.sequential[6],
    "A-": analyticsColors.sequential[5],
    "B+": analyticsColors.sequential[4],
    B: analyticsColors.sequential[3],
    "B-": analyticsColors.sequential[2],
    "C+": analyticsColors.sequential[1],
    C: analyticsColors.qualitative[5],
    "C-": analyticsColors.qualitative[6],
    "D+": analyticsColors.neutral.axis,
    D: analyticsColors.neutral.foreground,
    "D-": analyticsColors.neutral.text,
    E: analyticsColors.neutral.grid,
  };

  const getBandColor = (band: string) => gradeColorMap[band] || analyticsColors.neutral.text;

  const subjectAvgData = useMemo(() => {
    return chartData.map((item) => ({
      name: (item.subjectName || "Subject").slice(0, 20),
      avg: item.avgPercentage || 0,
    }));
  }, [chartData]);

  const gradeDistData = useMemo(() => {
    return chartData.map((item) => {
      const entry: any = { subject: (item.subjectName || "Subject").slice(0, 20) };
      Object.entries(item.gradeDistribution || {}).forEach(([grade, count]) => {
        entry[grade] = count;
      });
      return entry;
    });
  }, [chartData]);

  const termlyData = useMemo(() => {
    return termlyTrend.map((item) => ({
      term: `Term ${item.term}`,
      avg: item.avgPercentage || 0,
    }));
  }, [termlyTrend]);

  const totalTablePages = Math.max(1, Math.ceil(performanceRows.length / 20));
  const tableRows = useMemo(() => {
    const start = tablePage * 20;
    return performanceRows.slice(start, start + 20);
  }, [performanceRows, tablePage]);

  return (
    <div className="anim" style={{ display: "grid", gap: 16 }}>
       <div style={{ display: "grid", gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".09em", margin: 0 }}>
          Analytics
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          Performance & Reports
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textMut)" }}>
          Review performance trends, rankings, and download reports for specific streams or entire grades.
        </p>
      </div>

      <div
        style={{
          ...panelStyle,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
          alignItems: "stretch",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Select Scope</span>
          <select value={selectedId} onChange={e => { setSelectedId(e.target.value); localStorage.setItem("edunex.admin.performanceScope", JSON.stringify(e.target.value)); }} style={inputStyle}>
            <optgroup label="Grade-wide (All Streams)">
              {uniqueGrades.map(g => (
                <option key={`grade:${g}`} value={`grade:${g}`}>Grade {g} - Combined</option>
              ))}
            </optgroup>
            <optgroup label="Specific Streams">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          </select>
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Ranking Mode</span>
          <select value={rankingMode} onChange={(event) => setRankingMode(event.target.value as any)} style={inputStyle}>
            <option value="total_points">Total Points</option>
            <option value="total_marks">Total Marks</option>
          </select>
        </label>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Scored Learners</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{isLoading ? "..." : scoredRows.length}</p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Top Learner</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)", overflowWrap: "anywhere" }}>{isLoading ? "..." : topStudent ? `${topStudent.name} (${topStudent.points} pts)` : "N/A"}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
           <button onClick={handleDownloadExcel} style={{ ...inputStyle, background: "var(--gold)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Download Excel</button>
           <button onClick={handleDownloadPDF} style={{ ...inputStyle, background: "var(--white)", color: "var(--text)", cursor: "pointer", fontWeight: 700 }}>Download PDF</button>
           <button
             onClick={handleSendWhatsappMarks}
             disabled={!currentClass || isLoading || isSendingWhatsapp}
             style={{
               ...inputStyle,
               background: currentClass && !isLoading ? "var(--gold)" : "var(--border)",
               color: "#fff",
               cursor: !currentClass || isLoading || isSendingWhatsapp ? "not-allowed" : "pointer",
               opacity: !currentClass || isLoading || isSendingWhatsapp ? 0.55 : 1,
               fontWeight: 700,
             }}
           >
             {isSendingWhatsapp ? "Queueing..." : "Send WhatsApp marks"}
           </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: msg.type === "success" ? "var(--sBg)" : "var(--dBg)", color: msg.type === "success" ? "var(--sText)" : "var(--dText)", fontSize: 13, fontWeight: 600 }}>
          {msg.text}
        </div>
      )}

      {!showTable ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 14 }}>
          <ChartContainer
            title="Subject averages"
            height={280}
            loading={chartLoading}
            isEmpty={!chartLoading && subjectAvgData.length === 0}
            emptyMessage="No performance data is available for this scope."
          >
            <BarChart data={subjectAvgData} margin={analyticsChartDefaults.margin}>
              <CartesianGrid {...analyticsGridProps} />
              <XAxis
                {...analyticsXAxisProps}
                dataKey="name"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis {...analyticsYAxisProps} domain={[0, 100]} />
              <Tooltip
                {...analyticsTooltipProps}
                formatter={(value: unknown) => [`${value}%`, "Average"]}
              />
              <Bar dataKey="avg" name="Avg %" radius={analyticsChartDefaults.bar.radius}>
                {subjectAvgData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={gradeColorMap[resolveCbcBand(entry.avg, cbcBands).cbcBand] || analyticsColors.accent}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <ChartContainer
            title="Grade distribution"
            height={280}
            loading={chartLoading}
            isEmpty={!chartLoading && gradeDistData.length === 0}
            emptyMessage="No grade distribution is available for this scope."
          >
            <BarChart data={gradeDistData} margin={analyticsChartDefaults.margin}>
              <CartesianGrid {...analyticsGridProps} />
              <XAxis
                {...analyticsXAxisProps}
                dataKey="subject"
                interval={0}
                angle={-25}
                textAnchor="end"
                height={60}
              />
              <YAxis {...analyticsYAxisProps} allowDecimals={false} />
              <Tooltip {...analyticsTooltipProps} />
              <Legend {...analyticsLegendProps} />
              {gradeKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="grades"
                  fill={getBandColor(key)}
                  radius={analyticsChartDefaults.bar.radius}
                />
              ))}
            </BarChart>
          </ChartContainer>
          <ChartContainer
            title="Termly trend"
            height={260}
            loading={trendLoading}
            isEmpty={!trendLoading && termlyData.length === 0}
            emptyMessage="No termly data is available for this scope."
          >
            <LineChart data={termlyData} margin={analyticsChartDefaults.margin}>
              <CartesianGrid {...analyticsGridProps} />
              <XAxis {...analyticsXAxisProps} dataKey="term" />
              <YAxis {...analyticsYAxisProps} domain={[0, 100]} />
              <Tooltip
                {...analyticsTooltipProps}
                formatter={(value: unknown) => [`${value}%`, "Average"]}
              />
              <Legend {...analyticsLegendProps} />
              <Line
                type="monotone"
                dataKey="avg"
                name="Avg %"
                stroke={analyticsColors.accent}
                strokeWidth={analyticsChartDefaults.line.strokeWidth}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
          {chartData.length > 0 && (
            <div style={{ textAlign: "center", gridColumn: "1 / -1" }}>
                <button type="button" onClick={() => { setShowTable(true); setTableLoaded(false); }} style={{ ...inputStyle, background: "var(--gold)", color: "#fff", cursor: "pointer", fontWeight: 700, width: "auto", padding: "10px 22px" }}>
                  View Student Records
                </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ ...panelStyle, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--textMut)" }}>Student records</span>
            <button type="button" onClick={() => setShowTable(false)} style={{ ...secondaryButtonStyle, padding: "6px 14px", fontSize: 12 }}>
              Hide Records
            </button>
          </div>
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse", color: "var(--text)" }}>
            <thead>
              <tr style={{ textAlign: "left", background: "var(--sand)" }}>
                <th style={{ ...tableHeadStyle, position: "sticky", left: 0, top: 0, zIndex: 15, background: "var(--sand)", boxShadow: "2px 0 5px rgba(0,0,0,0.05), inset 0 -1px 0 var(--borderL)" }}>Rank</th>
                <th style={{ ...tableHeadStyle, position: "sticky", left: 60, top: 0, zIndex: 15, background: "var(--sand)", boxShadow: "2px 0 5px rgba(0,0,0,0.05), inset 0 -1px 0 var(--borderL)", minWidth: 180 }}>Student</th>
                <th style={tableHeadStyle}>Adm No</th>
                <th style={tableHeadStyle}>Stream</th>
                <th style={{ ...tableHeadStyle, background: rankingMode === "total_points" ? "var(--gold)" : undefined, color: rankingMode === "total_points" ? "#fff" : undefined, borderRadius: rankingMode === "total_points" ? "6px 6px 0 0" : undefined }}>Points</th>
                <th style={{ ...tableHeadStyle, background: rankingMode === "total_marks" ? "var(--gold)" : undefined, color: rankingMode === "total_marks" ? "#fff" : undefined, borderRadius: rankingMode === "total_marks" ? "6px 6px 0 0" : undefined }}>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ ...tableCellStyle, padding: "40px", textAlign: "center" }}>Loading performance data...</td></tr>
              ) : performanceRows.length === 0 ? (
                <tr><td colSpan={6} style={{ ...tableCellStyle, padding: "40px", textAlign: "center", color: "var(--textMut)" }}>No results found for this scope.</td></tr>
              ) : tableRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ ...tableCellStyle, position: "sticky", left: 0, zIndex: 5, background: "var(--white)", boxShadow: "2px 0 5px rgba(0,0,0,0.05)" }}>{row.rank}</td>
                  <td style={{ ...tableCellStyle, position: "sticky", left: 60, zIndex: 5, background: "var(--white)", boxShadow: "2px 0 5px rgba(0,0,0,0.05)", fontWeight: 600 }}>{row.name}</td>
                  <td style={{ ...tableCellStyle, color: "var(--textMut)" }}>{row.admissionNo}</td>
                  <td style={{ ...tableCellStyle, fontSize: 12 }}>{row.stream}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700, color: "var(--gold)", background: rankingMode === "total_points" ? "var(--goldP)" : undefined }}>{row.points}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 700, background: rankingMode === "total_marks" ? "var(--goldP)" : undefined }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalTablePages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--textMut)" }}>
                Page {tablePage + 1} of {totalTablePages} | {performanceRows.length} learners
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={secondaryButtonStyle} disabled={tablePage === 0 || isLoading} onClick={() => setTablePage((p) => Math.max(0, p - 1))}>
                  Previous
                </button>
                <button style={secondaryButtonStyle} disabled={tablePage >= totalTablePages - 1 || isLoading} onClick={() => setTablePage((p) => Math.min(totalTablePages - 1, p + 1))}>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
