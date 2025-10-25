# Frontend API Integration Guide

## 📚 Overview

This guide provides comprehensive documentation for Frontend developers to integrate with the **Coffee Shop Revenue Management Backend**.

**Complete API Reference**: See `FRONTEND_API_REFERENCE.json` for detailed endpoint specifications, TypeScript interfaces, and implementation examples.

**Interactive Documentation**: Access Swagger UI at [http://localhost:3000/api](http://localhost:3000/api)

---

## 🚀 Quick Start

### 1. Setup TypeScript Types

Copy the enums and interfaces from `FRONTEND_API_REFERENCE.json` to your project:

**Create `src/types/enums.ts`:**
```typescript
export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer'
}
```

**Create `src/types/api.ts`:**
See the complete interfaces in `FRONTEND_API_REFERENCE.json` → `implementationGuide.typescript.interfaces.content`

### 2. Install Dependencies

```bash
npm install axios
```

### 3. Create API Service

**Create `src/services/api.ts`:**
See the complete API service implementation in `FRONTEND_API_REFERENCE.json` → `implementationGuide.apiService.content`

### 4. Configure Environment

```bash
# .env
REACT_APP_API_URL=http://localhost:3000
```

### 5. Use in Components

```typescript
import { apiService } from './services/api';
import type { Product } from './types/api';

// Fetch products
const products = await apiService.getProducts();

// Create order
const order = await apiService.createOrder({
  customerName: 'Nguyễn Văn A',
  paymentMethod: PaymentMethod.CASH,
  orderDetails: [
    { productId: 1, quantity: 2, unitPrice: 45000 }
  ]
});
```

---

## 📡 API Endpoints Summary

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Configure via environment variable

### Total Endpoints: 17

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Categories** | 5 | Manage product categories |
| **Products** | 5 | Manage products with soft delete |
| **Orders** | 5 | Manage orders with lifecycle |
| **Revenue** | 2 | Generate revenue reports |

---

## 🗂️ Modules Overview

### 1. Categories Module (`/categories`)

**Endpoints:**
- `POST /categories` - Create category
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category (soft delete)

**Example:**
```typescript
// Create category
const category = await apiService.createCategory({
  name: 'Coffee',
  description: 'All types of coffee beverages'
});

// Get all categories
const categories = await apiService.getCategories();
```

### 2. Products Module (`/products`)

**Endpoints:**
- `POST /products` - Create product
- `GET /products?categoryId=1` - Get all products (with optional filter)
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Soft delete product

**Key Features:**
- Products are **eager-loaded** with their category
- Soft-deleted products are **excluded** from GET queries
- Filter by `categoryId` query parameter

**Example:**
```typescript
// Create product
const product = await apiService.createProduct({
  name: 'Cappuccino',
  description: 'Classic Italian coffee',
  price: 45000,
  categoryId: 1,
  status: ProductStatus.ACTIVE
});

// Get products by category
const coffeeProducts = await apiService.getProducts(1);
```

### 3. Orders Module (`/orders`)

**Endpoints:**
- `POST /orders` - Create order with order details
- `GET /orders?customerName=Nguyễn` - Get all orders (with optional filter)
- `GET /orders/:id` - Get order by ID with details
- `PATCH /orders/:id` - Update order status
- `DELETE /orders/:id` - Delete order (cascade delete)

**Order Lifecycle:**
```
pending_payment → paid
pending_payment → cancelled (requires reason)
paid → cancelled (requires reason)
```

**Example:**
```typescript
// Create order
const order = await apiService.createOrder({
  customerName: 'Nguyễn Văn A',
  paymentMethod: PaymentMethod.CASH,
  orderDetails: [
    { productId: 1, quantity: 2, unitPrice: 45000 },
    { productId: 2, quantity: 1, unitPrice: 50000 }
  ]
});

// Update order status to paid
await apiService.updateOrder(order.id, {
  status: OrderStatus.PAID
});

// Cancel order
await apiService.updateOrder(order.id, {
  status: OrderStatus.CANCELLED,
  cancellationReason: 'Customer requested cancellation'
});
```

### 4. Revenue Module (`/revenue`)

**Endpoints:**
- `GET /revenue/daily?date=2024-01-15` - Get daily revenue report
- `GET /revenue/range?startDate=2024-01-01&endDate=2024-01-31` - Get revenue range

**Key Features:**
- Only counts **paid orders**
- Breakdown by payment method (cash, bank_transfer)
- Date format: `YYYY-MM-DD`

**Example:**
```typescript
// Get today's revenue
const todayRevenue = await apiService.getDailyRevenue();

// Get revenue for specific date
const revenue = await apiService.getDailyRevenue('2024-01-15');

// Get revenue range
const monthlyRevenue = await apiService.getRevenueRange(
  '2024-01-01',
  '2024-01-31'
);
```

---

## 🔧 TypeScript Interfaces

### Core Entities

```typescript
interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  status: ProductStatus;
  categoryId: number;
  category: Category;  // Eager loaded
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  id: number;
  customerName: string;
  userId?: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  cancellationReason?: string;
  orderDetails: OrderDetail[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrderDetail {
  id: number;
  orderId: number;
  productId: number;
  product: Product;  // Eager loaded
  quantity: number;
  unitPrice: number;
  subtotal: number;  // Auto-calculated
}

interface RevenueReportDto {
  date: string;  // YYYY-MM-DD
  totalOrders: number;
  totalRevenue: number;
  paymentMethodBreakdown: {
    cash: number;
    bank_transfer: number;
  };
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

### Common Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 400 | Bad Request - Validation failed | Missing required fields |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Database error |

### Error Handling Example

```typescript
try {
  const product = await apiService.getProductById(1);
} catch (error: any) {
  if (error.response) {
    const { statusCode, message } = error.response.data;
    
    if (statusCode === 404) {
      console.log('Product not found');
    } else if (statusCode === 400) {
      console.log('Validation error:', message);
    }
  } else {
    console.log('Network error:', error.message);
  }
}
```

---

## 💡 Best Practices

### 1. Order Creation
- Calculate `subtotal = quantity * unitPrice` on frontend
- Validate products exist before creating order
- Use current product price as `unitPrice` to preserve historical pricing
- Ensure at least one order detail is provided

### 2. Date Formatting
- Use `YYYY-MM-DD` format for revenue endpoints
- Example: `new Date().toISOString().split('T')[0]`

### 3. Product Filtering
```typescript
// Get all products
const allProducts = await apiService.getProducts();

// Get products by category
const coffeeProducts = await apiService.getProducts(1);
```

### 4. Order Status Updates
- Always provide `cancellationReason` when status is `cancelled`
- Follow the order lifecycle transitions

---

## 📊 Data Relationships

```
Category (1) ←→ (Many) Product
Product (1) ←→ (Many) OrderDetail
Order (1) ←→ (Many) OrderDetail
```

**Eager Loading:**
- `Product.category` - Category is automatically loaded with product
- `OrderDetail.product` - Product (with category) is automatically loaded with order detail

---

## 🧪 Testing with Swagger

Access the interactive API documentation at:
**http://localhost:3000/api**

Features:
- Try out all endpoints directly in the browser
- View request/response schemas
- See example payloads
- Test validation rules

---

## 📦 Complete Reference

For detailed information including:
- Complete TypeScript interfaces
- Full API service implementation
- React component examples
- All endpoint specifications
- Request/response examples

**See**: `FRONTEND_API_REFERENCE.json`

---

## 🎯 Next Steps

1. ✅ Copy TypeScript types to your project
2. ✅ Install axios
3. ✅ Create API service
4. ✅ Configure environment variables
5. ✅ Test endpoints using Swagger UI
6. ✅ Implement components using the API service

---

**Last Updated**: 2025-10-25
**Backend Version**: 1.0.0

