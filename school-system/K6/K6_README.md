# k6 Load Testing

This directory contains the [k6](https://k6.io/) load-testing scripts used to evaluate the performance of the School Management System.

## Test Target

Current test endpoint:

```text
POST http://localhost:8000/api/login
```

The test simulates users repeatedly sending login requests to the Spring Boot application.

## Test Script

The main script is:

```text
K6/Test.js
```

Run it from the project root with:

```bash
k6 run K6/Test.js
```

## Current Test Configuration

The current test uses:

- **Virtual Users (VUs):** 25
- **Test duration:** 30 seconds
- **Endpoint:** `POST /api/login`
- **Expected status:** HTTP 200
- **Test type:** Constant concurrent load

## Results

### 10 VUs — Baseline

| Metric | Result |
|---|---:|
| Virtual Users | 10 |
| Requests | 647 |
| Throughput | 21.37 req/s |
| Average response time | 466 ms |
| Median | 482 ms |
| p90 | 739 ms |
| p95 | 822 ms |
| Maximum | 1.10 s |
| HTTP failures | 0% |

### 25 VUs — Run 1

| Metric | Result |
|---|---:|
| Virtual Users | 25 |
| Requests | 699 |
| Throughput | 22.59 req/s |
| Average response time | 1.09 s |
| Median | 1.06 s |
| p90 | 1.86 s |
| p95 | 2.05 s |
| Maximum | 3.64 s |
| HTTP failures | 0% |

### 25 VUs — Run 2

| Metric | Result |
|---|---:|
| Virtual Users | 25 |
| Requests | 660 |
| Throughput | 21.39 req/s |
| Average response time | 1.15 s |
| Median | 1.13 s |
| p90 | 1.71 s |
| p95 | 1.97 s |
| Maximum | 2.73 s |
| HTTP failures | 0% |

### 25 VUs — Run 3

| Metric | Result |
|---|---:|
| Virtual Users | 25 |
| Requests | 682 |
| Throughput | 22.05 req/s |
| Average response time | 1.11 s |
| Median | 1.12 s |
| p90 | 1.84 s |
| p95 | 2.03 s |
| Maximum | 2.80 s |
| HTTP failures | 0% |

### 25 VUs — Run 4

| Metric | Result |
|---|---:|
| Virtual Users | 25 |
| Requests | 693 |
| Throughput | 22.41 req/s |
| Average response time | 1.10 s |
| Median | 1.11 s |
| p90 | 1.86 s |
| p95 | 1.98 s |
| Maximum | 3.51 s |
| HTTP failures | 0% |

## Preliminary Findings

The 10-VU test produced approximately 21.37 requests/second with an average response time of 466 ms.

Increasing the load to 25 VUs increased throughput only slightly, to approximately 22 requests/second, while average response time increased to approximately 1.1 seconds.

This suggests that the application may be approaching a processing bottleneck under the current login workload. The exact bottleneck has **not yet been confirmed**.

Possible areas being investigated include:

- CPU utilization
- Password hashing/authentication
- Database queries
- HikariCP database connection pool
- JVM memory and garbage collection
- Tomcat request-processing threads

## Monitoring

During load tests, application resources can be monitored using Spring Boot Actuator and Linux tools.

### Spring Boot process

Find the application PID:

```bash
pgrep -af 'spring-boot|target/classes'
```

Then monitor the process:

```bash
watch -n 1 "ps -p <PID> -o pid,%cpu,%mem,rss,vsz,etime"
```

For example:

```bash
watch -n 1 "ps -p 40846 -o pid,%cpu,%mem,rss,vsz,etime"
```

### Java threads

To identify CPU-heavy Java threads:

```bash
watch -n 1 "ps -L -p <PID> -o pid,tid,%cpu,comm --sort=-%cpu | head -15"
```

### HikariCP

Active database connections:

```bash
curl -s http://localhost:8000/actuator/metrics/hikaricp.connections.active
```

Pending database connections:

```bash
curl -s http://localhost:8000/actuator/metrics/hikaricp.connections.pending
```

## Important Interpretation

**25 VUs does not mean the application can only support 25 real users.**

The k6 VUs continuously execute the login request. Real users do not normally send login requests continuously.

The current results therefore describe the performance of the **login endpoint under repeated concurrent requests**, not the total number of users the complete system can support.

The current approximate throughput ceiling of 22 requests/second also does not represent the final maximum capacity of the application. More testing and resource monitoring are required before making that conclusion.

## Stress Test

An earlier 1000-VU test was performed as an overload experiment.

| Metric | Result |
|---|---:|
| Maximum VUs | 1000 |
| Requests | 1334 |
| Throughput | 22.20 req/s |
| Average response time | 26.32 s |
| Median | 24.43 s |
| p90 | 51.18 s |
| p95 | 54.97 s |
| Maximum | 59.22 s |
| HTTP failures | 0.29% |

This test caused severe latency and should **not** be treated as a normal operating target.

## Next Tests

The next step is to identify the bottleneck before increasing the load further.

Planned progression:

```text
10 VUs
   ↓
25 VUs
   ↓
50 VUs
   ↓
100 VUs
```

Resource utilization should be monitored during each test.

The objective is to determine:

1. When response latency becomes unacceptable.
2. When errors begin occurring.
3. Whether CPU, memory, database connections, or request threads become saturated.
4. The approximate sustainable throughput of the application.

## Environment

The tests are currently being performed against the local Spring Boot development environment.

```text
OS: Lubuntu
Java: 21.0.12
Build tool: Maven 3.9.16
Application: Spring Boot
Load-testing tool: k6
```

## Get Students of a Specific School

### Test Description

This test evaluates the performance and reliability of the endpoint responsible for retrieving students belonging to a specific school.

The test was performed using **K6** with 25 concurrent virtual users running for 30 seconds.

### Test Configuration

| Parameter           |                  Value |
| ------------------- | ---------------------: |
| Virtual Users (VUs) |                     25 |
| Test Duration       |             30 seconds |
| Total Iterations    |                 11,763 |
| Total HTTP Requests |                 11,763 |
| Maximum VUs         |                     25 |
| Throughput          | 391.59 requests/second |

### Results

| Metric                |    Result |
| --------------------- | --------: |
| Checks                |    11,763 |
| Checks Succeeded      |      100% |
| Checks Failed         |        0% |
| HTTP Requests Failed  |        0% |
| Average Response Time |  63.41 ms |
| Minimum Response Time |   7.03 ms |
| Median Response Time  |  57.29 ms |
| 90th Percentile (p90) |    101 ms |
| 95th Percentile (p95) | 117.71 ms |
| Maximum Response Time | 816.15 ms |

### Observations

The endpoint performed reliably under the tested load of 25 concurrent virtual users. All **11,763 requests returned HTTP 200**, resulting in a **0% failure rate**.

The average response time was **63.41 ms**, while 95% of requests completed within approximately **117.71 ms**. The endpoint achieved an average throughput of approximately **391.59 requests per second** during the test.

The results indicate that the endpoint was responsive and stable under the tested workload.

### Conclusion

The **Get Students of a Specific School** endpoint successfully handled the simulated workload without request failures. The low average response time and 100% successful checks indicate good performance under the tested conditions.

> **Note:** The test demonstrates approximately 391.59 requests per second under 25 concurrent virtual users. This should not be interpreted as 391 users per second because a user can generate multiple HTTP requests.

