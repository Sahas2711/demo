# Logging & Monitoring Architecture

## 1. Overview

This document defines the logging and monitoring strategy for the **Inventra Inventory Management System**.

### Objectives

- Ensure **observability** across services  
- Enable efficient **debugging & troubleshooting**  
- Track **system performance & health**  
- Maintain **security audit trails**  

---

## 2. Logging Architecture

### 2.1 Logging Levels

| Level  | Usage |
|--------|------|
| INFO   | Business operations (e.g., invoice created) |
| DEBUG  | Development-level logs |
| WARN   | Unexpected but recoverable states |
| ERROR  | Failures and exceptions |
| AUDIT  | Security-critical actions |

---

### 2.2 Structured Logging

All logs follow a **JSON structured format** to support centralized processing and querying.

#### Example Log

```json
{
  "timestamp": "2026-03-18T10:15:30Z",
  "level": "INFO",
  "service": "billing-service",
  "message": "Invoice created successfully",
  "user_id": "USR123",
  "trace_id": "abc-xyz-123"
}
````

---

### 2.3 Correlation & Traceability

* Every request is assigned a **trace_id**
* Enables **end-to-end tracking** across services
* Helps in debugging distributed flows

---

## 3. Log Storage & Aggregation

### 3.1 Local Logging

* Logs written to:

  * File system
  * STDOUT (Docker containers)

---

### 3.2 Centralized Logging

Logs are aggregated using:

* **ELK Stack**

  * Elasticsearch → Storage & search
  * Logstash → Log processing
  * Kibana → Visualization

---

## 4. Monitoring Architecture

### 4.1 Monitoring Stack

| Tool         | Purpose                 |
| ------------ | ----------------------- |
| Prometheus   | Metrics collection      |
| Grafana      | Dashboard visualization |
| AlertManager | Alert handling          |

---

## 5. Metrics

### 5.1 Application Metrics

* API response time
* Request throughput
* Error rate (4xx / 5xx)

---

### 5.2 System Metrics

* CPU usage
* Memory usage
* Disk I/O
* Network latency

---

### 5.3 Business Metrics

* Daily revenue
* Invoice count
* Top-selling products
* Low stock alerts

---

## 6. Alerting Strategy

### 6.1 Alert Rules

| Condition                   | Severity | Action          |
| --------------------------- | -------- | --------------- |
| API latency > 500 ms        | Medium   | Trigger alert   |
| Error rate > 5%             | High     | Critical alert  |
| Database connection failure | Critical | Immediate alert |
| CPU usage > 80%             | Medium   | Warning alert   |

---

### 6.2 Notification Channels

* Email
* Slack / Teams (optional)
* SMS (for critical alerts)

---

## 7. Distributed Tracing (Optional)

* Implemented using **OpenTelemetry**
* Tracks request flow across services
* Helps identify:

  * Bottlenecks
  * Latency issues

---

## 8. Security Logging

Critical actions are logged for audit purposes:

* User login attempts
* Failed authentication
* Role/permission changes
* Invoice creation/cancellation
* Data modification events

---

## 9. Log Retention Policy

| Storage Type | Duration |
| ------------ | -------- |
| Hot Storage  | 7 days   |
| Archive      | 30 days  |

---

## 10. Best Practices

* Do **not log sensitive data** (passwords, tokens)
* Mask sensitive fields (GSTIN, phone numbers)
* Use structured logging (JSON format)
* Maintain consistent log format across services
* Use correlation IDs for traceability
* Implement log rotation to prevent disk overflow

---

## 11. Future Enhancements

* Distributed tracing for all services
* AI-based anomaly detection
* Real-time alert dashboards
* Integration with cloud monitoring tools (AWS CloudWatch / Azure Monitor)
