
# FarmTrust Backend Architecture Document

## 1. Overview
FarmTrust is a technology-driven, borderless marketplace designed to empower African farmers by connecting **farmers**, **buyers**, and **sellers**. The backend is built as a **monolithic system** using **Node.js/Express** for simplicity, rapid development, and maintainability. It integrates **Supabase** for structured data and real-time subscriptions, **MongoDB** for unstructured data, and **Hedera** for blockchain-based certifications and payments. Authentication supports three methods: **Hedera wallet** (via HashConnect), **email/phone verification** (using one-time codes sent via SendGrid for email or Twilio for SMS), and **traditional email/password registration/login**. Payments include **HBAR** (Hedera) and **fiat** (via Paystack). The system explicitly supports farmers (producers), buyers (consumers), and sellers (intermediaries or farmers selling directly) with tailored functionality.

This document outlines the architecture, structure, workflow, and database design using Supabase and MongoDB, presented for stakeholders to understand the system's design and implementation strategy.

---

## 2. System Architecture Design
FarmTrust’s backend is a **monolithic architecture** implemented in a single Node.js/Express application, simplifying deployment and maintenance while supporting scalability through containerization and load balancing. Supabase handles structured data, real-time features, and file storage, while MongoDB manages unstructured data. Hedera supports blockchain operations, and external services (Twilio, SendGrid, Paystack) enhance authentication and payments.

### 2.1 High-Level Architecture

- **Backend** (Node.js/Express Monolith):
  - Handles all functionality: user management, marketplace, payments, logistics, verification, analytics, sustainability, and community.
  - Organized into modular routes and controllers within a single application.
- **Databases**:
  - **Supabase (PostgreSQL-based)**:
    - Structured data: User profiles (farmers, buyers, sellers), transactions, orders, shipments.
    - Semi-structured data: JSONB for certifications, product metadata.
    - Storage: Images (product photos), documents (certifications).
    - Real-time: WebSocket subscriptions for order updates, transaction status.
  - **MongoDB**: Unstructured data for product listings, community posts, analytics results, and IoT sensor data.

- **Authentication**:
  - **Hedera Wallet**: HashConnect for blockchain-based login and payments.
  - **Email/Phone Verification**: One-time codes (OTCs) sent via SendGrid (email) or Twilio (SMS), managed by Supabase Auth.
  - **Email/Password**: Traditional registration/login with password hashing, stored in Supabase Auth.
- **Payment Integration**:
  - **Hedera SDK**: HBAR/HTS payments for low-cost transactions.
  - **Fiat**: Paystack for mobile money and card payments, common in African markets.
- **Message Queue**: RabbitMQ for asynchronous tasks (e.g., sending OTCs, notifications).
- **API Gateway**: Kong for routing, security, and load balancing.
- **External Integrations**:
  - **Twilio**: SMS for phone verification.
  - **SendGrid**: Email for verification codes and registration/login notifications.
  - **Paystack**: Fiat payments.
  - **Logistics APIs**: Route tracking and optimization.
  - **Weather APIs**: Crop and market insights.

### 2.2 Architectural Principles
- **Monolithic Design**: A single Express application simplifies development, testing, and deployment while maintaining modularity through organized routes and controllers.
- **Role-Specific Functionality**:
  - **Farmers**: List produce, access microloans, track sustainability metrics.
  - **Buyers**: Browse products, place orders, make payments.
  - **Sellers**: List produce (own or sourced), manage sales, coordinate logistics.
- **Data Distribution**:
  - Supabase: Structured data, real-time subscriptions, and file storage for user profiles, transactions, and orders.
  - MongoDB: Unstructured data for flexible schemas (e.g., product descriptions, community posts).
- **Authentication Accessibility**:
  - Email/password for traditional users, enhancing accessibility.
  - Email/phone verification for users without crypto wallets.
  - Hedera wallet for blockchain-native users and payments.
- **Scalability**: The monolith scales via containerization (Docker) and load balancing; Supabase auto-scales, and MongoDB supports sharding.
- **Security**: Supabase Row-Level Security (RLS), JWT for session management, HTTPS, password hashing (bcrypt), and OTC expiration.
- **Real-Time**: Supabase WebSocket subscriptions for live updates (e.g., order status, transaction confirmations).

### 2.3 Database Roles
| Database | Role | Data Types | Use Cases |
|----------|------|------------|-----------|
| **Supabase** | Primary structured + storage | Structured (tables), semi-structured (JSONB), files | Users (farmers, buyers, sellers), transactions, orders, shipments, images, real-time updates, authentication data |
| **MongoDB** | Unstructured | Unstructured (JSON documents) | Product listings, community posts, analytics results, IoT data |

---

## 3. Backend Structure
The monolithic backend is a single Node.js/Express application with modular routes and controllers, designed to handle all functionality while maintaining separation of concerns. The structure integrates Supabase for structured data and authentication, MongoDB for unstructured data, and external services for enhanced functionality.

### 3.1 Directory Structure
```

farmtrust-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js            # User authentication (email/password, email/phone OTC, Hedera)
│   │   ├── products.js        # Product listings and orders
│   │   ├── payments.js        # Payment processing (HBAR, fiat)
│   │   ├── logistics.js       # Shipment tracking and routing
│   │   ├── verification.js    # Certifications and credibility scores
│   │   ├── analytics.js       # AI-driven pricing and forecasting
│   │   ├── sustainability.js  # Environmental metrics
│   │   └── community.js       # Forums and knowledge sharing
│   ├── models/
│   │   ├── user.js            # MongoDB user schema
│   │   ├── product.js         # MongoDB product schema
│   │   ├── transaction.js     # MongoDB transaction schema
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── productController.js # Marketplace logic
│   │   ├── paymentController.js # Payment logic
│   │   └── ...                # Other controllers
│   ├── config/
│   │   ├── db.js             # Supabase and MongoDB connections
│   ├── middleware/
│   │   ├── authenticateJWT.js # JWT verification
│   ├── utils/
│   │   ├── hedera.js         # Hedera blockchain utilities
│   │   ├── email.js          # SendGrid email utilities
│   │   ├── sms.js            # Twilio SMS utilities
│   └── index.js              # Main Express app
├── package.json
├── Dockerfile
├── docker-compose.yml
├── .env
└── README.md

```

---

## 4. Workflow
1. **User Registration/Login**
2. **Product Listing**
3. **Browsing and Ordering**
4. **Payment Processing**
5. **Logistics**
6. **Verification**
7. **Sustainability**
8. **Community**

(See detailed workflow in the full doc above.)

---

## 5. Architecture Diagram (Text-Based)
```

