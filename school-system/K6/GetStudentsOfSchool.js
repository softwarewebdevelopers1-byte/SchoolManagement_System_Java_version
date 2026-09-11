import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 25,
  duration: "30s",
};

export default function () {
  const url =
    "http://localhost:8000/api/get/all/students?schoolId=1f1adc67-1829-6bf4-8d47-b7049bc7d8cc";

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxZjFhZGM2OS03YjQ5LTY4MDctOGQ0Ny1iNzA0OWJjN2Q4Y2MiLCJzY2hvb2wiOiIxZjFhZGM2Ny0xODI5LTZiZjQtOGQ0Ny1iNzA0OWJjN2Q4Y2MiLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sImlhdCI6MTc4OTE0NTc3NSwiZXhwIjoxNzkxNTY0OTc1fQ.HGf0sdCQj-J6_lF7a89pfoLP2PF6cPfsrvT0XphBUkA",
    },
  };

  const response = http.get(url, params);

  check(response, {
    "status is 200": (r) => r.status === 200,
  });
}
