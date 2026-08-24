// components/subjectteacher/SubjectTeacherDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
import styles from "./SubjectTeacherDashboard.module.css";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { SubjectsTab } from "./SubjectsTab";
import { MarksTab } from "./MarksTab";
import { AssessmentsTab } from "./AssessmentsTab";
import { ProgressTab } from "./ProgressTab";
import { ResourcesTab } from "./ResourcesTab";
import { TimetableLibrary } from "../shared/TimetableLibrary";
import { Subject, Student, MarksData } from "./types";
import { useDashboardTheme } from "../../lib/useDashboardTheme";
import { api, getSchoolId, normalizeUser, request } from "../../lib/api";

import { initials, avatarColor, avatar, gc } from "../../lib/dashboardHelpers";

type SubjectMarksMap = MarksData[string];
type StudentMarksRow = SubjectMarksMap[string];

const hasRecordedMarkValue = (value: unknown) =>
  value !== null && value !== undefined && value !== "";

const hasStoredMarks = (marks?: StudentMarksRow) =>
  Boolean(
    marks &&
    [
      marks.cat1,
      marks.cat2,
      marks.cat3,
      marks.cat4,
      marks.cat5,
      marks.exam,
      marks.finalScore,
    ].some(hasRecordedMarkValue),
  );

const collectStudentsWithStoredMarks = (subjectMarks?: SubjectMarksMap) =>
  new Set(
    Object.entries(subjectMarks || {})
      .filter(([, marks]) => hasStoredMarks(marks))
      .map(([studentId]) => studentId),
  );

const SUBJECT_TEACHER_TAB_KEY = "edunex.subjectTeacher.activeTab";
const getSubjectTeacherSubjectStorageKey = (user: any) =>
  ["edunex.subjectTeacher.activeSubject", user?.id || "unknown"].join(":");
const subjectTeacherTabs = new Set([
  "subjects",
  "marks",
  "timetable",
  "assessments",
  "progress",
  "resources",
]);

const SubjectTeacherDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeUser(parsed.user || parsed);
      } catch (e) {}
    }
    return null;
  });

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 900);
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(SUBJECT_TEACHER_TAB_KEY);
    return saved && subjectTeacherTabs.has(saved) ? saved : "subjects";
  });
  const subjectStorageKey = getSubjectTeacherSubjectStorageKey(currentUser);
  const [activeSubjectId, setActiveSubjectId] = useState(() => {
    return (
      localStorage.getItem(getSubjectTeacherSubjectStorageKey(currentUser)) ||
      ""
    );
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksData, setMarksData] = useState<MarksData>({});
  const [pushedSubjects, setPushedSubjects] = useState<Set<string>>(new Set());
  const [pushedStudents, setPushedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [term, setTerm] = useState<number>(currentUser?.term || 1);
  const [year, setYear] = useState<number>(currentUser?.year || 2024);
  const [examType, setExamType] = useState<string>(
    currentUser?.examType || "opener",
  );
  const { theme, toggleTheme } = useDashboardTheme();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleChangePassword = () => {
    window.location.href = "/change-password";
  };

  const syncPushState = useCallback(
    (subjectId: string, subjectMarks?: SubjectMarksMap) => {
      const recordedStudents = collectStudentsWithStoredMarks(subjectMarks);

      setPushedStudents(recordedStudents);
      setPushedSubjects((current) => {
        const next = new Set(current);
        if (recordedStudents.size > 0) {
          next.add(subjectId);
        } else {
          next.delete(subjectId);
        }
        return next;
      });
    },
    [],
  );
  const loadAssignments = useCallback(async () => {
    const teacherProfileId =
      currentUser?.teacherProfileId || currentUser?.teacherId;
    if (!currentUser?.id || !teacherProfileId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [data, averages] = await Promise.all([
        request(
          `/subjectJoint?profileId=${encodeURIComponent(teacherProfileId)}&id=${encodeURIComponent(getSchoolId() || "")}`,
        ) as Promise<any[]>,
        api.get(`/marks/averages/teacher/${currentUser.id}`, {
          term: currentUser.term || 1,
          year: currentUser.year || 2024,
          examType: currentUser.examType || "opener",
        }) as Promise<Record<string, number>>,
      ]);
      console.log("new data ", data, "Current user ", currentUser);

      const mapped: Subject[] = (data || []).map((a: any) => {
        const subjectJointId =
          a.subjectJointId || a._id || a.id || a.subjectId;
        const assignedSubject =
          a.subject && typeof a.subject === "object" ? a.subject : {};
        const enrollmentMode = String(
          a.enrollmentMode || a.subjectType || "compulsory",
        ).toUpperCase();
        const subjectEnrollmentMode: Subject["enrollmentMode"] =
          enrollmentMode === "ELECTIVE" ? "elective" : "compulsory";
        return {
          id: String(subjectJointId || ""),
          subjectId:
            assignedSubject._id ||
            assignedSubject.id ||
            a.rawSubjectId ||
            a.subjectId ||
            subjectJointId,
          name: a.subjectName || "Subject",
          grade: `Grade ${a.classGrade} ${a.classStream}`.trim(),
          classGrade: a.classGrade,
          classStream: a.classStream,
          students: a.studentCount || 0,
          avg: averages[subjectJointId] ?? 0,
          pushed: false,
          term: currentUser.term || 1,
          year: currentUser.year || 2024,
          lastAssess: "N/A",
          enrollmentMode: subjectEnrollmentMode,
          sharedSlotId: a.sharedSlotId || a.electiveCode || null,
        };
      }).filter((subject) => subject.id);
      setSubjects(mapped);
      if (mapped.length > 0) {
        const savedSubjectId = localStorage.getItem(subjectStorageKey);
        const nextSubject =
          mapped.find((subject) => subject.id === savedSubjectId) || mapped[0];
        setActiveSubjectId(nextSubject.id);
      }
    } catch (err: any) {
      setMsg({
        text: err?.message || "Unable to load your assigned subjects.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentUser?.id,
    currentUser?.term,
    currentUser?.year,
    currentUser?.examType,
    currentUser?.teacherProfileId,
    currentUser?.teacherId,
    subjectStorageKey,
  ]);

  const refreshUser = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      return;
      const freshUser: any = await api.get(`/users/${currentUser.id}`);
      if (freshUser) {
        let rolesArr = freshUser.roles;
        if (rolesArr && !Array.isArray(rolesArr)) {
          rolesArr = [rolesArr.role1, rolesArr.role2, rolesArr.role3].filter(
            Boolean,
          );
        }
        const updated = {
          ...currentUser,
          ...freshUser,
          id: freshUser._id || freshUser.id,
          roles: rolesArr || currentUser.roles || [],
        };
        const savedItem = localStorage.getItem("user");
        if (savedItem) {
          const parsed = JSON.parse(savedItem || "");
          parsed.user = updated;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
        setCurrentUser(updated);
        setTerm(freshUser.term || 1);
        setYear(freshUser.year || 2024);
        setExamType(freshUser.examType || "opener");
      }
    } catch (e: any) {
      setMsg({
        text: e?.message || "Unable to refresh your profile.",
        type: "error",
      });
    }
  }, [currentUser?.id]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await refreshUser();
    await loadAssignments();
    await loadStudentsAndMarks();
    setLoading(false);
    setMsg({ text: "Dashboard synchronized.", type: "success" });
    setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const loadStudentsAndMarks = useCallback(async () => {
    const currentSubject = subjects.find((s) => s.id === activeSubjectId);
    if (!currentSubject) {
      setStudents([]);
      return;
    }

    try {
      const data = await api.get<any[]>("/marks", {
        subjectJointId: currentSubject.id,
      });

      const mappedStudents = data.map((item) => ({
        id: item.studentId.toString(),
        adm: item.admissionNo,
        name: item.name,
        gender: "N/A",
        marks: item.marks,
        pushed: false,
      }));

      const subjectMarks = data.reduce((acc, item) => {
        const sid = item.studentId.toString();
        acc[sid] = item.marks;
        return acc;
      }, {} as SubjectMarksMap);

      setStudents(mappedStudents);
      syncPushState(activeSubjectId, subjectMarks);

      // Update marksData
      setMarksData((prev) => ({
        ...prev,
        [activeSubjectId]: subjectMarks,
      }));
    } catch (err: any) {
      setStudents([]);
      setPushedStudents(new Set());
      setMsg({
        text:
          err?.message || "Unable to load students and marks for this subject.",
        type: "error",
      });
    }
  }, [activeSubjectId, subjects, term, year, examType, syncPushState]);

  // Clear state when switching period
  useEffect(() => {
    setStudents([]);
    setMarksData({});
  }, [term, year, examType]);

  useEffect(() => {
    if (!activeSubjectId) return;
    setPushedStudents(new Set());
    loadStudentsAndMarks();
  }, [activeSubjectId, loadStudentsAndMarks, term, year, examType]);

  // Clear pushed status when period changes
  useEffect(() => {
    setPushedSubjects(new Set());
    setPushedStudents(new Set());
  }, [term, year, examType]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    } else {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const teacherName = currentUser?.name || "Teacher";
  const teacherInitials = initials(teacherName);
  const teacherAvatarColor = avatarColor(teacherName);

  const handleMarkUpdate = (
    subjectId: string,
    studentId: string,
    key: string,
    value: string,
  ) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      const updatedStudentMarks = {
        ...(updatedSubjectMarks[studentId] || {
          cat1: null,
          cat2: null,
          cat3: null,
          cat4: null,
          cat5: null,
          cat1Max: 40,
          cat2Max: 40,
          cat3Max: 40,
          cat4Max: 40,
          cat5Max: 40,
          exam: null,
          examMax: 100,
          finalScore: null,
        }),
      };

      let n: string | number | null = value;
      if (n === "") {
        n = null;
      } else {
        const num = Number(n);
        if (!isNaN(num)) {
          const maxKey = `${key}Max`;
          const max =
            key === "finalScore"
              ? 100
              : (updatedStudentMarks as any)[maxKey] ||
                (key === "exam" ? 100 : 40);
          if (num > max) {
            n = max;
          } else if (num < 0) {
            n = 0;
          }
        } else {
          n = null;
        }
      }

      (updatedStudentMarks as any)[key] = n;
      updatedSubjectMarks[studentId] = updatedStudentMarks;

      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleConfigUpdate = (
    subjectId: string,
    key: string,
    value: number | string | null,
  ) => {
    setMarksData((prev) => {
      const newData = { ...prev };
      if (!newData[subjectId]) return prev;

      const updatedSubjectMarks = { ...newData[subjectId] };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [key]: value,
        };
      });
      newData[subjectId] = updatedSubjectMarks;
      return newData;
    });
  };

  const handleRemoveCat = (subjectId: string, catIndex: number) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [`cat${catIndex}`]: null,
          [`cat${catIndex}Max`]: 40,
        };
      });
      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleImportMarks = useCallback(
    (
      subjectId: string,
      imported: Record<string, Record<string, string | null>>,
    ) => {
      setMarksData((previous) => ({
        ...previous,
        [subjectId]: {
          ...(previous[subjectId] || {}),
          ...Object.fromEntries(
            Object.entries(imported).map(([studentId, marks]) => [
              studentId,
              { ...(previous[subjectId]?.[studentId] || {}), ...marks },
            ]),
          ),
        },
      }));
      setMsg({ text: "Excel marks loaded. Review and save the subject marks.", type: "success" });
    },
    [],
  );

  const handleSaveMarks = useCallback(
    async (assignmentId: string, catConfigs?: any) => {
      const currentSubject = subjects.find((s) => s.id === assignmentId);
      if (!currentSubject) return;

      const subjectMarks = marksData[assignmentId];
      if (!subjectMarks) return;

      const data = Object.entries(subjectMarks).map(([studentId, marks]) => ({
        studentId,
        ...marks,
      }));

      try {
        await api.post("/marks/save", {
          subjectJointId: currentSubject.id,
          classGrade: currentSubject.classGrade,
          classStream: currentSubject.classStream,
          term: term,
          year: year,
          examType: examType,
          marksData: data,
          catConfigs,
          isElective:
            String(currentSubject.enrollmentMode || "").toLowerCase() ===
            "elective",
          enrollmentCode: currentSubject.sharedSlotId,
        });
        syncPushState(assignmentId, subjectMarks);
        setMsg({ text: "Marks saved successfully!", type: "success" });
        setTimeout(() => setMsg(null), 3000);
        loadStudentsAndMarks();
      } catch (err: any) {
        setMsg({
          text: err?.message || "Failed to save marks.",
          type: "error",
        });
        setTimeout(() => setMsg(null), 3000);
      }
    },
    [
      examType,
      loadStudentsAndMarks,
      marksData,
      subjects,
      syncPushState,
      term,
      year,
    ],
  );

  const handlePushMarks = useCallback(
    async (subjectId: string) => {
      const currentSubject = subjects.find((s) => s.id === subjectId);
      if (!currentSubject) return;

      const subjectMarks = marksData[subjectId];
      if (!subjectMarks) return;

      const data = Object.entries(subjectMarks).map(([studentId, marks]) => ({
        studentId,
        ...marks,
      }));

      try {
        await api.post("/marks/save", {
          subjectJointId: currentSubject.id,
          classGrade: currentSubject.classGrade,
          classStream: currentSubject.classStream,
          term: term,
          year: year,
          examType: examType,
          marksData: data,
          isElective:
            String(currentSubject.enrollmentMode || "").toLowerCase() ===
            "elective",
          enrollmentCode: currentSubject.sharedSlotId,
        });
        syncPushState(subjectId, subjectMarks);
        setMsg({
          text: `Marks saved and pushed for ${currentSubject.grade}`,
          type: "success",
        });
        setTimeout(() => setMsg(null), 3000);
        loadStudentsAndMarks();
      } catch (err: any) {
        setMsg({
          text: err?.message || "Failed to push marks.",
          type: "error",
        });
        setTimeout(() => setMsg(null), 3000);
      }
    },
    [
      examType,
      loadStudentsAndMarks,
      marksData,
      subjects,
      syncPushState,
      term,
      year,
    ],
  );

  const getTabTitle = () => {
    const titles: Record<string, string> = {
      subjects: "My Subjects",
      marks: "Mark Entry",
      timetable: "My Timetable",
      assessments: "Assessments",
      progress: "Student Progress",
      resources: "Resources",
    };
    return titles[activeTab] || "My Subjects";
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    localStorage.setItem(SUBJECT_TEACHER_TAB_KEY, tabId);
    setMobileMenuOpen(false);
  };

  const handleSubjectChange = useCallback(
    (subjectId: string) => {
      setActiveSubjectId(subjectId);
      localStorage.setItem(subjectStorageKey, subjectId);
    },
    [subjectStorageKey],
  );

  const renderContent = () => {
    if (loading)
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          Loading dashboard...
        </div>
      );
    if (subjects.length === 0)
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          No subjects assigned yet.
        </div>
      );

    switch (activeTab) {
      case "subjects":
        return (
          <SubjectsTab
            subjects={subjects}
            onSelectSubject={handleSubjectChange}
            onEnterMarks={(id) => {
              handleSubjectChange(id);
              handleSelectTab("marks");
            }}
            pushedSubjects={pushedSubjects}
            gc={gc}
            term={term}
            year={year}
          />
        );
      case "marks":
        return (
          <MarksTab
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            students={students}
            marksData={marksData}
            pushedSubjects={pushedSubjects}
            pushedStudents={pushedStudents}
            onSubjectChange={handleSubjectChange}
            onMarkUpdate={handleMarkUpdate}
            onSaveMarks={handleSaveMarks}
            onConfigUpdate={handleConfigUpdate}
            onRemoveCat={handleRemoveCat}
            onImportMarks={handleImportMarks}
            onPushMarks={handlePushMarks}
            avatar={avatar}
            term={term}
            year={year}
            examType={examType}
            onTermChange={setTerm}
            onExamTypeChange={setExamType}
          />
        );
      case "timetable":
        return (
          <TimetableLibrary
            fetchPath="/school/timetables/my"
            fetchParams={{ view: "teacher" }}
            title="My Teaching Timetable"
            description="See the classes, days, and time slots assigned to you in the latest published timetable."
            emptyMessage="No teacher timetable has been published for your current cycle yet."
            highlightTeacherId={currentUser?.id}
          />
        );
      case "assessments":
        return <AssessmentsTab assessments={[]} term={term} year={year} />;
      case "progress":
        return (
          <ProgressTab
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            students={students}
            marksData={marksData}
            onSubjectChange={handleSubjectChange}
            avatar={avatar}
            gc={gc}
          />
        );
      case "resources":
        return <ResourcesTab resources={[]} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboard} data-theme={theme}>
      {mobileMenuOpen && isMobile && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <Sidebar
        collapsed={isMobile ? false : collapsed}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        activeTab={activeTab}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSelectTab={handleSelectTab}
        teacherName={teacherName}
        teacherInitials={teacherInitials}
        teacherAvatarColor={teacherAvatarColor}
        streamsCount={subjects.length}
        totalStudents={students.length}
        department={currentUser?.department || "General"}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

      <div className={styles.mainContent}>
        <TopBar
          title={getTabTitle()}
          teacherName={teacherName}
          teacherInitials={teacherInitials}
          teacherAvatarColor={teacherAvatarColor}
          isMobile={isMobile}
          onOpenMenu={() => setMobileMenuOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          user={currentUser}
          onRefresh={handleManualRefresh}
        />
        <div className={styles.contentArea}>
          {msg && (
            <div
              style={{
                padding: "10px 20px",
                marginBottom: 15,
                borderRadius: 8,
                background: msg.type === "success" ? "var(--sBg)" : "var(--dBg)",
                color: msg.type === "success" ? "var(--sText)" : "var(--dText)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {msg.text}
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SubjectTeacherDashboard;
