import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE_URL } from "../../lib/api";

interface PublicSchool {
  id: string;
  schoolName: string;
  schoolMotto?: string;
  schoolAddress?: string;
  schoolEmail?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: "var(--gold)",
  textTransform: "uppercase",
  letterSpacing: ".12em",
  margin: "0 0 6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1.5px solid var(--border)",
  borderRadius: 12,
  fontSize: 14,
  background: "var(--cream)",
  color: "var(--text)",
};

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "22px 24px",
  boxShadow: "0 8px 24px rgba(11, 32, 24, 0.06)",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const PublicSchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<PublicSchool[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_BASE_URL}/schools/public/schools?search=${encodeURIComponent(search)}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load schools (${response.status})`);
        }
        const payload = await response.json();
        const list = payload?.data || payload || [];
        setSchools(Array.isArray(list) ? list : []);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          setError("Unable to load public schools right now.");
          setSchools([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  useEffect(() => {
    const selectedSchool = schools.find((school) => school.id === selectedSchoolId);

    if (!selectedSchool || !mapRef.current) {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (
      typeof selectedSchool.latitude !== "number" ||
      typeof selectedSchool.longitude !== "number" ||
      !Number.isFinite(selectedSchool.latitude) ||
      !Number.isFinite(selectedSchool.longitude)
    ) {
      return;
    }

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false,
      }).setView([selectedSchool.latitude, selectedSchool.longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = L.marker([
      selectedSchool.latitude,
      selectedSchool.longitude,
    ]).addTo(mapInstance.current);

    markerRef.current.bindPopup(
      `<strong>${selectedSchool.schoolName}</strong><br/>${
        selectedSchool.schoolAddress || "School location"
      }`,
    );

    mapInstance.current.setView(
      [selectedSchool.latitude, selectedSchool.longitude],
      14,
    );
    markerRef.current.openPopup();
  }, [selectedSchoolId, schools]);

  const selectedSchool = schools.find((school) => school.id === selectedSchoolId);

  const hasSchoolCoordinates = schools.some(
    (school) =>
      typeof school.latitude === "number" &&
      typeof school.longitude === "number" &&
      Number.isFinite(school.latitude) &&
      Number.isFinite(school.longitude),
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--sand, #f4efe6)",
        padding: "48px 16px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Link
              to="/"
              style={{
                color: "var(--textMut)",
                textDecoration: "none",
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              ← Back to home
            </Link>
            <p style={eyebStyle}>Discover schools</p>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--serif, system-ui)",
                fontSize: "2rem",
                color: "var(--text, #0f2e22)",
              }}
            >
              Browse public schools
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13.5,
                color: "var(--textMut, #5d665f)",
                maxWidth: 520,
              }}
            >
              Schools that have chosen to appear in this directory are listed
              below. Use the search field to filter by name or address.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "var(--white, #fffaf1)",
            border: "1px solid var(--border, #e4d8c4)",
            borderRadius: 14,
            padding: 18,
            marginBottom: 24,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school name or address"
            style={{ ...inputStyle, maxWidth: 460, flex: "1 1 320px" }}
          />
          <div
            style={{
              fontSize: 12.5,
              color: "var(--textMut, #5d665f)",
              fontWeight: 700,
            }}
          >
            {loading
              ? "Searching..."
              : `${schools.length} school${schools.length === 1 ? "" : "s"} found`}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "var(--dBg, #fde7e3)",
              color: "var(--dText, #a13b2c)",
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            {error}
          </div>
        )}

        {selectedSchool && (
          <div
            style={{
              background: "var(--white, #fffaf1)",
              border: "1px solid var(--border, #e4d8c4)",
              borderRadius: 16,
              padding: 18,
              marginBottom: 20,
              boxShadow: "0 8px 24px rgba(11, 32, 24, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <p style={eyebStyle}>School location</p>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "var(--serif, system-ui)",
                    fontSize: "1.2rem",
                    color: "var(--text, #0f2e22)",
                  }}
                >
                  {selectedSchool.schoolName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchoolId(null)}
                style={{
                  border: "1px solid var(--border, #e4d8c4)",
                  background: "var(--cream, #f8f3ea)",
                  color: "var(--text, #0f2e22)",
                  borderRadius: 999,
                  padding: "9px 14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close map
              </button>
            </div>
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: 360,
                minHeight: 360,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--border, #e4d8c4)",
                background: "#e7f0ee",
              }}
            />
          </div>
        )}

        {loading ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--textMut)",
              padding: 48,
            }}
          >
            Loading schools...
          </p>
        ) : schools.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "var(--textMut)",
              padding: 48,
              background: "var(--white, #fffaf1)",
              border: "1px solid var(--border, #e4d8c4)",
              borderRadius: 14,
            }}
          >
            No public schools available right now.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {schools.map((school) => (
              <article key={school.id} style={cardStyle}>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "var(--serif, system-ui)",
                    fontSize: "1.2rem",
                    color: "var(--text, #0f2e22)",
                    textTransform: "capitalize",
                  }}
                >
                  {school.schoolName}
                </h2>
                {school.schoolMotto && (
                  <p
                    style={{
                      margin: 0,
                      fontStyle: "italic",
                      color: "var(--textMut, #5d665f)",
                      fontSize: 13,
                    }}
                  >
                    “{school.schoolMotto}”
                  </p>
                )}
                {school.schoolAddress && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12.5,
                      color: "var(--textM, #475048)",
                    }}
                  >
                    {school.schoolAddress}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginTop: 6,
                    fontSize: 12.5,
                  }}
                >
                  {school.schoolEmail && (
                    <a
                      href={`mailto:${school.schoolEmail}`}
                      style={{
                        color: "var(--gold, #c9963d)",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      ✉ {school.schoolEmail}
                    </a>
                  )}
                  {school.phoneNumber && (
                    <a
                      href={`tel:${school.phoneNumber}`}
                      style={{
                        color: "var(--gold, #c9963d)",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      ☎ {school.phoneNumber}
                    </a>
                  )}
                  {typeof school.latitude === "number" &&
                    typeof school.longitude === "number" &&
                    Number.isFinite(school.latitude) &&
                    Number.isFinite(school.longitude) && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSchoolId((current) =>
                              current === school.id ? null : school.id,
                            )
                          }
                          style={{
                            marginTop: 8,
                            border: "none",
                            borderRadius: 10,
                            padding: "10px 12px",
                            background: "var(--gold, #c9963d)",
                            color: "#fff",
                            fontWeight: 800,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          {selectedSchoolId === school.id
                            ? "Hide location"
                            : "View location"}
                        </button>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${school.latitude}&mlon=${school.longitude}#map=16/${school.latitude}/${school.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "var(--gold, #c9963d)",
                            fontWeight: 700,
                            textDecoration: "none",
                            marginTop: 4,
                          }}
                        >
                          📍 Open in OpenStreetMap
                        </a>
                      </>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

const eyebStyle: React.CSSProperties = eyebrowStyle;

export default PublicSchoolsPage;
