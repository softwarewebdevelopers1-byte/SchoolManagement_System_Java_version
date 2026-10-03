# Archive operations

## Enabling R2 archival

The backend receives the archive settings through `docker-compose.yml`. Archiving
and R2 storage are independently opt-in and both default to disabled:

```dotenv
EDUNEX_ARCHIVE_ENABLED=false
EDUNEX_ARCHIVE_R2_ENABLED=false
EDUNEX_ARCHIVE_CLEANUP_ENABLED=false
EDUNEX_ARCHIVE_R2_ENDPOINT=
EDUNEX_ARCHIVE_R2_REGION=auto
EDUNEX_ARCHIVE_R2_BUCKET=
EDUNEX_ARCHIVE_R2_ACCESS_KEY=
EDUNEX_ARCHIVE_R2_SECRET_KEY=
```

Set both enable flags to `true` and provide the R2 values using a deployment
secret store or the backend host environment. Never put credentials in frontend
configuration or source control. When R2 is enabled without required settings,
backend startup fails with a configuration error that does not include secret
values. When storage is disabled, archive endpoints report that storage is not
configured rather than presenting an empty archive list.

The separate `EDUNEX_ARCHIVE_R2_INTEGRATION_*` variables are only for the
dedicated R2 integration test. Use a non-production bucket and credentials.
That test skips when any required test setting is absent.

## Archive write safety

Result data is frozen in the database when finalization is requested. Workers
generate result JSON and PDFs from that frozen payload. Each worker lease writes
under a unique `attempts/<lease-token>` prefix; lease checks prevent stale workers
from completing an archive. Verified versions are not eligible for retry, and
corrections create a new version while retaining prior artifact metadata.

These are application-level protections. Cloudflare R2 Object Lock or bucket
versioning is not configured or verified here, so storage-level immutability
must not be assumed. Confirm bucket privacy and any retention/object-lock policy
separately in the Cloudflare account.

## Schema and historical data limitations

This project currently uses `spring.jpa.hibernate.ddl-auto=update` and has no
Flyway or Liquibase migration setup. Archive columns and tables therefore rely
on Hibernate schema updates at application startup. Production schema changes
should be reviewed and managed as an infrastructure migration before deployment;
this archive change does not introduce a migration framework.

Attendance archives can report locked sheets, duplicate/missing dates, recorded
students, statuses, and calculated totals. The application has no historical
school-calendar or enrollment-roster source, so it cannot independently prove
that every expected school day or historically enrolled student is present. The
published-result report source currently supplies no historical attendance or
next-term date. Student archive PDFs do not fabricate these values; the
attendance section is omitted when no recorded days are available. Default
teacher/principal remarks are frozen using the same fallback text as the current
official report when no explicit remarks are supplied.
