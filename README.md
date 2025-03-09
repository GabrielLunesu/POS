# Tasty Station POS System

A modern Point of Sale (POS) system built with Next.js for the frontend and ASP.NET Core for the backend. This application provides a complete solution for managing products, categories, sales, and users in a restaurant or retail environment.

## Features

- **User Authentication**: Secure login with role-based access control (Admin, Manager, Employee)
- **Product Management**: Add, edit, and delete products with details like price, cost, quantity, and category
- **Category Management**: Organize products into categories for easier navigation
- **POS Interface**: Intuitive cashier interface for processing sales
- **Sales History**: View past sales and print receipts
- **User Management**: Admin panel for managing system users and their roles
- **Dashboard**: Overview of sales statistics and recent transactions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- .NET 6 SDK
- SQL Server

### Installation

1. Clone the repository
2. Set up the backend:
   ```
   cd server
   dotnet restore
   dotnet run
   ```
3. Set up the frontend:
   ```
   cd ui
   npm install
   npm run dev
   ```

### Default Admin Account

The system automatically creates an admin account on first run:
- **Username**: admin
- **Password**: Admin123!

## Usage Guide

### Login

1. Navigate to the login page
2. Enter the admin credentials (username: admin, password: Admin123!)
3. You will be redirected to the dashboard

### Dashboard

The dashboard provides an overview of:
- Total revenue
- Total sales
- Total products
- Total categories
- Recent sales with quick access to view receipts

### POS (Point of Sale)

1. Navigate to the POS page
2. Select a category from the left sidebar
3. Click on products to add them to the cart
4. Adjust quantities in the cart as needed
5. Select a payment method and click "Checkout"
6. A receipt will be displayed that can be printed

### Product Management

1. Navigate to the Products page
2. View all products in a table format
3. Click "Add New Product" to create a product
4. Fill in the product details (name, price, cost, quantity, category, etc.)
5. Click "Add Product" to save
6. Use the "Edit" and "Delete" buttons to manage existing products

### Category Management

1. Navigate to the Categories page
2. View all categories in a table format
3. Click "Add New Category" to create a category
4. Fill in the category details (name, description)
5. Click "Add Category" to save
6. Use the "Edit" and "Delete" buttons to manage existing categories

### Sales History

1. Navigate to the Sales page
2. View all sales in a table format
3. Click "View" to see the receipt for a specific sale
4. Admins and Managers can void sales if needed

### User Management (Admin Only)

1. Navigate to the Users page (only visible to Admins)
2. View all users in a table format
3. Click "Add New User" to create a user
4. Fill in the user details (username, email, password, role)
5. Click "Add User" to save
6. Use the "Edit" and "Delete" buttons to manage existing users

## Role Permissions

- **Admin**: Full access to all features, including user management
- **Manager**: Can manage products, categories, and sales, but cannot manage users
- **Employee**: Can use the POS interface and view products and categories, but cannot modify them

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: ASP.NET Core, Entity Framework Core
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)

