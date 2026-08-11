# 🎂 CakeDelight

A microservices-based e-commerce platform for ordering cakes online, built with **Node.js/Express, MongoDB, RabbitMQ, and an API Gateway**.

The application can be run using **Docker Compose** or deployed using **Kubernetes**.

---

## 📖 Table of Contents

- [Project Introduction](#-project-introduction)
- [Architecture](#-architecture)
- [Repository Layout](#-repository-layout)
- [API Gateway Routing](#-api-gateway-routing)
- [Per-Service Endpoints](#-per-service-endpoints)
- [Getting Started](#-getting-started)
- [Kubernetes Deployment](#️-kubernetes-deployment)
- [Reliability & Observability](#-reliability--observability)

---

## 🍰 Project Introduction

CakeDelight is a cloud-native application built using independent microservices.

Each service manages its own data and communicates with other services using **HTTP** or **RabbitMQ** where required.

| Component | Responsibility |
|---|---|
| **api-gateway** | Single entry point for client requests |
| **catalog-service** | Manages cakes and catalog data |
| **order-service** | Manages baskets and orders |
| **rating-service** | Manages ratings |
| **notification-service** | Handles notifications using RabbitMQ and email |
| **frontend** | Static HTML/CSS/JavaScript client |

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
 └──────────────┘       └──────────────┘      └──────────────┘
                                │
                                │ order.completed
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
                   ┌─────────────┴─────────────┐
                   │                           │
                   ▼                           ▼
          ┌────────────────┐          ┌────────────────┐
          │ Notification   │          │ Email Service  │
          │ MongoDB        │          │ Credentials    │
          └────────────────┘          └────────────────┘
```

### Service Communication

- **Frontend → API Gateway**: Client requests are sent through the API Gateway.
- **API Gateway → Backend Services**: Routes requests to the appropriate service.
- **Order Service → Catalog Service**: Communicates using HTTP.
- **Rating Service → Order Service**: Communicates using HTTP.
- **Order Service → RabbitMQ**: Publishes `order.completed` events.
- **Notification Service → RabbitMQ**: Consumes order events.
- **Notification Service → MongoDB**: Stores notification data.
- **Notification Service → Email**: Sends email notifications using configured credentials.
- Each service has its own MongoDB database.

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
│   │   ├── deployment.yaml
│   │   ├── notification-secret.yaml
│   │   └── service.yaml
│   │
│   └── infrastructure/
│       ├── catalog-mongo/
│       ├── order-mongo/
│       ├── notification-mongo/
│       ├── rating-mongo/
│       └── rabbitmq/
│
├── .env
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

| Route | Service |
|---|---|
| `/api/catalog/*` | Catalog Service |
| `/api/basket/*` | Order Service |
| `/api/orders/*` | Order Service |
| `/api/ratings/*` | Rating Service |
| `/api/notifications/*` | Notification Service |

Clients should send requests to the **API Gateway** instead of directly calling the backend services.

Example:

```text
http://localhost:8080/api/catalog/cakes/all
```

---

## 🔌 Per-Service Endpoints

### Catalog Service

**Port:** `4001`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/catalog/cakes/` | Get cakes |
| GET | `/api/catalog/cakes/all` | Get all cakes |
| GET | `/api/catalog/cakes/:id` | Get cake by ID |
| POST | `/api/catalog/cakes/` | Create a cake |
| PUT | `/api/catalog/cakes/:id` | Update a cake |
| DELETE | `/api/catalog/cakes/:id` | Delete a cake |

---

### Order Service — Basket

**Port:** `4002`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/basket/:userId` | Get user's basket |
| POST | `/api/basket/:userId/items` | Add item to basket |
| PUT | `/api/basket/:userId/items/:cakeId` | Update item quantity |
| DELETE | `/api/basket/:userId/items/:cakeId` | Remove item from basket |

---

### Order Service — Orders

**Port:** `4002`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders/checkout` | Checkout and create order |
| GET | `/api/orders/detail/:orderId` | Get order by ID |
| GET | `/api/orders/:userId` | Get orders for a user |
| GET | `/api/orders/check-purchase/:userId/:cakeId` | Check whether user purchased a cake |

---

### Rating Service

**Port:** `4003`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ratings/submit` | Submit a rating |
| GET | `/api/ratings/` | Get ratings |
| GET | `/api/ratings/:cakeId/average` | Get average rating for a cake |
| GET | `/api/ratings/:cakeId` | Get ratings for a cake |

---

### Notification Service

**Port:** `4004`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/notifications/:userId` | Get notifications for a user |

---

## 🚀 Getting Started

The project is provided as a ZIP file.

### Docker Compose

1. Extract the ZIP file.
2. Open a terminal inside the `CAKEDELIGHT` folder.
3. Make sure Docker Desktop is running.
4. Run:

```bash
docker compose up -d --build
```

Check the containers:

```bash
docker compose ps
```

Access the application through the API Gateway:

```text
http://localhost:8080
```

Example:

```text
http://localhost:8080/api/catalog/cakes/all
```

Stop the project:

```bash
docker compose down
```

---

# ☸️ Kubernetes Deployment

All Kubernetes configuration files are inside the `k8s/` folder.

The deployment order is:

```text
1. Namespace
       ↓
2. Infrastructure
       ↓
3. Notification Email Secret
       ↓
4. Backend Services
       ↓
5. API Gateway
```

### Prerequisites

- Docker Desktop
- Kubernetes enabled in Docker Desktop
- kubectl

---

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

---

### 2. Deploy Infrastructure

```bash
kubectl apply -f k8s/infrastructure/catalog-mongo/
kubectl apply -f k8s/infrastructure/order-mongo/
kubectl apply -f k8s/infrastructure/notification-mongo/
kubectl apply -f k8s/infrastructure/rating-mongo/
kubectl apply -f k8s/infrastructure/rabbitmq/
```

---

### 3. Deploy Notification Email Secret

The Notification Service requires the Kubernetes Secret:

```text
notification-email-secret
```

Apply the Secret **before deploying the Notification Service**:

```bash
kubectl apply -f k8s/notification/notification-secret.yaml
```

Verify:

```bash
kubectl get secret notification-email-secret -n cake-delight
```

The Secret provides:

```text
EMAIL_USER
EMAIL_PASS
```

---

### 4. Deploy Services

```bash
kubectl apply -f k8s/catalog/
kubectl apply -f k8s/order/
kubectl apply -f k8s/rating/
kubectl apply -f k8s/notification/
```

---

### 5. Deploy API Gateway

```bash
kubectl apply -f k8s/api-gateway/
```

---

### 6. Check the Deployment

```bash
kubectl get pods -n cake-delight
```

```bash
kubectl get svc -n cake-delight
```

```bash
kubectl get deployments -n cake-delight
```

All pods should eventually be in **Running** state and ready.

---

### 7. Access the Application

Check the API Gateway service:

```bash
kubectl get svc api-gateway -n cake-delight
```

For the configured local setup, access the application through:

```text
http://localhost:8080
```

Example:

```text
http://localhost:8080/api/catalog/cakes/all
```

The backend services are accessed through the API Gateway.

---

## 📨 RabbitMQ

RabbitMQ is used for asynchronous communication between the Order Service and Notification Service.

```text
Order Service
      │
      │ order.completed
      ▼
   RabbitMQ
      │
      ▼
Notification Service
      │
      ├── Store notification
      └── Send email
```

RabbitMQ ports:

```text
5672   → AMQP
15672  → Management UI
```

RabbitMQ Management UI:

```text
http://localhost:15672
```

---

## 🔔 Notification Service

The Notification Service handles order notifications.

It:

- Consumes `order.completed` events from RabbitMQ.
- Stores notifications in MongoDB.
- Sends email notifications.

The service uses:

```text
Port: 4004
Database: notification_db
RabbitMQ: rabbitmq
```

Email credentials are provided through:

```text
EMAIL_USER
EMAIL_PASS
```

For Kubernetes, these credentials are stored in:

```text
k8s/notification/notification-secret.yaml
```

---

## 🩺 Reliability & Observability

The project includes the following reliability and observability features:

- Independent microservices
- Separate MongoDB database for each service
- Docker containerization
- Docker Compose orchestration
- Kubernetes Deployments
- Kubernetes Services for service-to-service communication
- RabbitMQ for asynchronous communication
- API Gateway for centralized request routing
- Kubernetes replicas for the API Gateway
- Persistent storage for MongoDB
- Kubernetes Secrets for email credentials
- Service health checks through `/health`
- Resource requests and limits
- Kubernetes namespaces
- PersistentVolumeClaims


---

## 🧪 Basic Application Flow

```text
Frontend
   ↓
API Gateway
   ↓
Catalog / Order / Rating Services
   ↓
MongoDB

Order Completed
   ↓
RabbitMQ
   ↓
Notification Service
   ↓
Notification MongoDB
   ↓
Email
```
