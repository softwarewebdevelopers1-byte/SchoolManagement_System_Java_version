import { useEffect, useState } from "react";
import { request } from "../../lib/api";
import type { Class } from "./types";
import styles from "./ResultsPublishingTab.module.css";

type Props = { classes: Class[] };
type LinkStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
type SortField = "student" | "createdAt" | "expiresAt" | "status";

type ResultLink = {
  accessId: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  className?: string;
  academicYear: string;
  term: number;
  examType: string;
  status: LinkStatus;
  resultsUrl?: string;
  createdAt?: string;
  expiresAt?: string;
  renewedAt?: string;
};

type ResultLinksPage = {
  content: ResultLink[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

export const ResultsPublishingTab = ({ classes }: Props) => {
  const [classId, setClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [term, setTerm] = useState("1");
  const [examType, setExamType] = useState("ENDTERM");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [links, setLinks] = useState<ResultLinksPage | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linksError, setLinksError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!showLinks || searchInput.trim() === search) return;
    const timeout = window.setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput, search, showLinks]);

  useEffect(() => {
    if (!showLinks) return;
    let cancelled = false;
    const loadLinks = async () => {
      setLoadingLinks(true);
      setLinksError("");
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        sort: sortField,
        direction: sortDirection,
      });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      try {
        const response = await request<ResultLinksPage>(`/admin/results-links?${params.toString()}`);
        if (!cancelled) setLinks(response);
      } catch (error) {
        if (!cancelled) {
          setLinksError(error instanceof Error ? error.message : "Unable to load results links.");
        }
      } finally {
        if (!cancelled) setLoadingLinks(false);
      }
    };
    void loadLinks();
    return () => {
      cancelled = true;
    };
  }, [showLinks, page, search, sortField, sortDirection, status, reloadVersion]);

  const publish = async () => {
    if (!classId) {
      setMessage("Select a class before publishing results.");
      return;
    }
    setPublishing(true);
    setMessage("");
    try {
      const response = await request<{ publishedStudents: number; accessLinks: unknown[] }>(
        "/results/publish",
        {
          method: "POST",
          body: JSON.stringify({
            classId,
            academicYear,
            term: Number(term),
            examType,
          }),
        },
      );
      setMessage(`${response.publishedStudents} student result(s) published. ${response.accessLinks.length} new secure link(s) created.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to publish results.");
    } finally {
      setPublishing(false);
    }
  };

  const toggleLinks = () => {
    setShowLinks((current) => !current);
  };

  const changeSort = (field: SortField) => {
    setPage(0);
    if (sortField === field) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const copyLink = async (link: ResultLink) => {
    if (!link.resultsUrl) {
      setMessage("Unable to copy this results link.");
      return;
    }
    setCopyingId(link.accessId);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link.resultsUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = link.resultsUrl;
        input.setAttribute("readonly", "");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        input.remove();
        if (!copied) throw new Error("Clipboard copy failed");
      }
      setMessage("Link copied.");
    } catch {
      setMessage("Unable to copy this results link.");
    } finally {
      setCopyingId(null);
    }
  };

  const viewLink = (link: ResultLink) => {
    if (!link.resultsUrl) {
      setMessage("Unable to open this results link.");
      return;
    }
    window.open(link.resultsUrl, "_blank", "noopener,noreferrer");
  };

  const renewLink = async (link: ResultLink) => {
    if (!window.confirm("Renew this expired results link? The old link will remain invalid.")) return;
    setRenewingId(link.accessId);
    setMessage("");
    try {
      const renewed = await request<ResultLink>(`/admin/results-links/${link.accessId}/renew`, {
        method: "POST",
      });
      setLinks((current) => current
        ? { ...current, content: current.content.map((item) => item.accessId === renewed.accessId ? renewed : item) }
        : current);
      setMessage("Results link renewed successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to renew the results link.");
    } finally {
      setRenewingId(null);
    }
  };

  const resendResults = async (link: ResultLink) => {
    if (!window.confirm(`Resend ${link.studentName}'s results notification?`)) return;
    setResendingId(link.accessId);
    setMessage("");
    try {
      await request(`/admin/results-links/${link.accessId}/resend`, { method: "POST" });
      setMessage(`Results notification queued for ${link.studentName}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend the results notification.");
    } finally {
      setResendingId(null);
    }
  };

  const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : "Not available";
  const linksContent = links?.content || [];
  const filteredLinks = examTypeFilter
    ? linksContent.filter((link) => link.examType === examTypeFilter)
    : linksContent;
  const totalElements = links?.totalElements || 0;
  const totalPages = links?.totalPages || 0;

  return (
    <section className={styles.panel}>
      <p className={styles.eyebrow}>Academic cycle</p>
      <h2 className={styles.title}>Publish results</h2>
      <p className={styles.intro}>
        Results remain unavailable to parents until this class, term, and examination period are published.
      </p>
      <div className={styles.form}>
        <label className={styles.field}>Class
          <select value={classId} onChange={(event) => setClassId(event.target.value)}>
            <option value="">Select class</option>
            {classes.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>Academic year
          <input value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} />
        </label>
        <label className={styles.field}>Term
          <select value={term} onChange={(event) => setTerm(event.target.value)}>
            <option value="1">Term 1</option><option value="2">Term 2</option><option value="3">Term 3</option>
          </select>
        </label>
        <label className={styles.field}>Exam
          <select value={examType} onChange={(event) => setExamType(event.target.value)}>
            <option value="OPENER">Opener</option><option value="MIDTERM">Midterm</option><option value="ENDTERM">End term</option>
          </select>
        </label>
      </div>
      <div className={styles.actions}>
        <button className={styles.publishButton} type="button" onClick={() => void publish()} disabled={publishing}>
          {publishing ? "Publishing..." : "Publish Results"}
        </button>
        {message && <p className={styles.message} role="status">{message}</p>}
      </div>

      <div className={styles.linksHeader}>
        <div>
          <p className={styles.eyebrow}>Parent access</p>
          <h3 className={styles.linksTitle}>Results links</h3>
        </div>
        <button className={styles.refreshButton} type="button" onClick={toggleLinks}>
          {showLinks ? "Hide Links" : "View Links"}
        </button>
      </div>

      {showLinks && <>
        <div className={styles.linkControls}>
          <input
            className={styles.searchInput}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search student, admission number, or class..."
            aria-label="Search results links"
          />
          <select className={styles.statusFilter} value={status} onChange={(event) => { setPage(0); setStatus(event.target.value); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <select
            className={styles.statusFilter}
            value={examTypeFilter}
            onChange={(event) => { setPage(0); setExamTypeFilter(event.target.value); }}
            aria-label="Filter results links by exam"
          >
            <option value="">All exams</option>
            <option value="OPENER">Opener</option>
            <option value="MIDTERM">Midterm</option>
            <option value="ENDTERM">End term</option>
          </select>
          <button className={styles.refreshButton} type="button" onClick={() => setReloadVersion((current) => current + 1)} disabled={loadingLinks}>
            {loadingLinks ? "Loading..." : "Refresh"}
          </button>
        </div>
        {linksError && <p className={styles.error} role="alert">{linksError}</p>}
        {loadingLinks && !links ? <p className={styles.empty}>Loading results links...</p> : filteredLinks.length === 0 ? (
          <p className={styles.empty}>{search || status || examTypeFilter ? "No results links match your filters." : "No results links found."}</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.linksTable}>
                <thead><tr>
                  <th><button className={styles.sortButton} type="button" onClick={() => changeSort("student")}>Student</button></th>
                  <th>Admission No.</th><th>Class</th><th>Term</th>
                  <th><button className={styles.sortButton} type="button" onClick={() => changeSort("status")}>Status</button></th>
                  <th><button className={styles.sortButton} type="button" onClick={() => changeSort("expiresAt")}>Expires</button></th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>{filteredLinks.map((link) => (
                  <tr key={link.accessId}>
                    <td><strong>{link.studentName}</strong></td>
                    <td>{link.admissionNumber || "Not available"}</td>
                    <td>{link.className || "Not available"}</td>
                    <td>{link.academicYear} · Term {link.term}<small>{link.examType}</small></td>
                    <td><span className={`${styles.status} ${styles[link.status.toLowerCase()]}`}>{link.status}</span></td>
                    <td>{formatDate(link.expiresAt)}</td>
                    <td className={styles.rowActions}>
                      {link.status === "ACTIVE" && link.resultsUrl ? <>
                        <button type="button" className={styles.secondaryButton} onClick={() => viewLink(link)}>View</button>
                        <button type="button" className={styles.primaryButton} disabled={copyingId === link.accessId} onClick={() => void copyLink(link)}>
                          {copyingId === link.accessId ? "Copying..." : "Copy"}
                        </button>
                        {link.status === "ACTIVE" && (
                          <button type="button" className={styles.secondaryButton} disabled={resendingId === link.accessId} onClick={() => void resendResults(link)}>
                            {resendingId === link.accessId ? "Queuing..." : "Resend"}
                          </button>
                        )}
                      </> : (link.status === "EXPIRED" || (link.status === "ACTIVE" && !link.resultsUrl)) ? (
                        <button type="button" className={styles.primaryButton} disabled={renewingId === link.accessId} onClick={() => void renewLink(link)}>
                          {renewingId === link.accessId ? "Renewing..." : link.status === "ACTIVE" ? "Repair Link" : "Renew"}
                        </button>
                      ) : <span className={styles.muted}>Unavailable</span>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className={styles.pagination}>
              <span>{totalElements} link(s)</span>
              <button type="button" className={styles.secondaryButton} disabled={page === 0 || loadingLinks} onClick={() => setPage((current) => current - 1)}>Previous</button>
              <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
              <button type="button" className={styles.secondaryButton} disabled={page + 1 >= totalPages || loadingLinks} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          </>
        )}
      </>}
    </section>
  );
};
