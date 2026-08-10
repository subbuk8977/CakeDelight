# 🎂 CakeDelight

A microservices-based e-commerce platform for ordering cakes online, built with **Node.js/Express, MongoDB, RabbitMQ, and an API Gateway**.

The application can be run using **Docker Compose** or deployed using **Kubernetes**.

---

## 📖 Table of Contents

* [Project Introduction](#-project-introduction)
* [Architecture](#-architecture)
* [Repository Layout](#-repository-layout)
* [API Gateway Routing](#-api-gateway-routing)
* [Per-Service Endpoints](#-per-service-endpoints)
* [Getting Started](#-getting-started)
* [Kubernetes Deployment](#-kubernetes-deployment)
* [Reliability & Observability](#-reliability--observability)

---

## 🍰 Project Introduction

CakeDelight is a cloud-native application built using independent microservices.

Each service manages its own data and communicates with other services using **HTTP** or **RabbitMQ** where required.

| Component                | Responsibility                         |
| ------------------------ | -------------------------------------- |
| **api-gateway**          | Single entry point for client requests |
| **catalog-service**      | Manages cakes and catalog data         |
| **order-service**        | Manages baskets and orders             |
| **rating-service**       | Manages ratings                        |
| **notification-service** | Handles notifications using RabbitMQ   |
| **frontend**             | Static HTML/CSS/JavaScript client      |

---

## 🏗 Architecture

```text
                         ┌──────────────┐
                         │   Frontend   │
                         │ HTML/CSS/JS  │
                         └──────┬───────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   API Gateway   │
                       │     :8080       │
                       └────────┬────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
          ▼                     ▼                     ▼
 ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
 │ Catalog Service │    │ Order Service  │    │ Rating Service │
 │     :4001       │    │     :4002      │    │     :4003      │
 └───────┬────────┘    └───────┬────────┘    └───────┬────────┘
         │                      │                     │
         ▼                      ▼                     ▼
 ┌──────────────┐       ┌──────────────┐      ┌──────────────┐
 │ Catalog Mongo │       │  Order Mongo │      │ Rating Mongo │
 │    :27017     │       │    :27018    │      │    :27019    │
 └──────────────┘       └──────────────┘      └──────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  RabbitMQ   │
                         │  :5672      │
                         └──────┬──────┘
                                │
                                ▼
                       ┌───────────────────┐
                       │ Notification      │
                       │ Service :4004     │
                       └─────────┬─────────┘
                                 │
                                 ▼
                         ┌────────────────┐
                         │ Notification   │
                         │ MongoDB :27020 │
                         └────────────────┘
```

### Service Communication

* **API Gateway →** routes requests to all backend services.
* **Order Service → Catalog Service** communicates using HTTP.
* **Order Service → RabbitMQ** publishes order events.
* **Notification Service → RabbitMQ** consumes order events.
* **Rating Service → Order Service** communicates using HTTP.
* Each service has its own MongoDB database.

---

## 📂 Repository Layout

```text
CAKEDELIGHT/
│
├── api-gateway/
├── catalog-service/
├── order-service/
├── rating-service/
├── notification-service/
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── k8s/
│   ├── namespace.yaml
│   │
│   ├── api-gateway/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── catalog/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   ├── order/
│   ├── rating/
│   ├── notification/
│   │
│   └── infrastructure/
│       ├── catalog-mongo/
│       ├── notification-mongo/
│       ├── rating-mongo/
│       └── rabbitmq/
│
├── docker-compose.yaml
└── README.md
```

---

## 🌐 API Gateway Routing

The API Gateway provides a single entry point for the application.

**Gateway Port:**

```text
8080
```

| Route                  | Service              |
| ---------------------- | -------------------- |
| `/api/catalog/*`       | Catalog Service      |
| `/api/basket/*`        | Order Service        |
| `/api/orders/*`        | Order Service        |
| `/api/ratings/*`       | Rating Service       |
| `/api/notifications/*` | Notification Service |

Clients should send requests to the **API Gateway** instead of directly calling the backend services.

Example:

```text
http://localhost:8080/api/catalog/...
```

---

## 🔌 Per-Service Endpoints

### Catalog Service

**Port:** `4001`

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | `/health`              | Health check            |
| ALL    | `/api/catalog/cakes/*` | Cake catalog operations |

---

### Order Service

**Port:** `4002`

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| ALL    | `/api/basket/*` | Basket operations |
| ALL    | `/api/orders/*` | Order operations  |

---

### Rating Service

**Port:** `4003`

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| ALL    | `/api/ratings/*` | Rating operations |

---

### Notification Service

**Port:** `4004`

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| ALL    | `/api/notifications/*` | Notification operations |

---

## 🚀 Getting Started

The project is provided as a ZIP file.

### Docker Compose

1. Extract the ZIP file.
2. Open a terminal inside the `CAKEDELIGHT` folder.
3. Make sure Docker Desktop is running.
4. Run:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

Stop the project:

```bash
docker compose down
```

For complete Docker Compose instructions, see the [Docker Compose section](#-run-with-docker-compose).

---

## ☸️ Kubernetes Deployment

All Kubernetes configuration files are inside the `k8s/` folder.

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Deploy Infrastructure

```bash
kubectl apply -f k8s/infrastructure/catalog-mongo/
kubectl apply -f k8s/infrastructure/notification-mongo/
kubectl apply -f k8s/infrastructure/rating-mongo/
kubectl apply -f k8s/infrastructure/rabbitmq/
```

### 3. Deploy Services

```bash
kubectl apply -f k8s/catalog/
kubectl apply -f k8s/order/
kubectl apply -f k8s/rating/
kubectl apply -f k8s/notification/
```

### 4. Deploy API Gateway

```bash
kubectl apply -f k8s/api-gateway/
```

### 5. Check the Deployment

```bash
kubectl get pods -n cake-delight
```

```bash
kubectl get svc -n cake-delight
```

All pods should be in **Running** state.

### 6. Access the Application

Get the API Gateway service:

```bash
kubectl get svc api-gateway -n cake-delight
```

Use the **EXTERNAL-IP** of the API Gateway to access the application.

The backend services are accessed through the API Gateway.

---

## 📊 Reliability & Observability

The project includes the following reliability and observability features:

* Independent microservices
* Separate MongoDB database for each service
* Docker containerization
* Kubernetes deployments
* Kubernetes Services for service-to-service communication
* RabbitMQ for asynchronous communication
* API Gateway for centralized request routing
* Kubernetes replicas for the API Gateway
* Persistent storage for MongoDB
* Service health check through `/health`

---
