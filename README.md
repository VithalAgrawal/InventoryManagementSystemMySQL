# Inventory Management System

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)

## Introduction

The Inventory Management System is a web-based application developed as part of my industrial training at Hindalco Industries Ltd. This system is designed to efficiently manage the inventory of two systems - P&B and CapEx, which include Small Capex and IT Capex categories. The system provides read and write access to authorized admin users, read access to authenticated users, and restricts unauthenticated users from accessing the system.

## Features

- User authentication and role-based access control (Admin, Authenticated User).
- Adding & updating inventory items.
- Generating various inventory reports (status, transactions, usage).
- User-friendly interface for easy navigation.

## Tech Stack

- Front-end: HTML, CSS, JavaScript
- Back-end: Node.js, Express
- Database: MySQL

## Installation

1. Clone the repository: `git clone https://github.com/VithalAgrawal/InventoryManagementSystemMySQL.git`
2. Navigate to the project directory: `cd InventoryManagementSystemMySQL`
3. Install dependencies: `npm install`

## Usage

1. Configure the MySQL database settings as specified in `Database Structure` folder.
2. Run the application: `npm start`
3. Access the application in your web browser: `http://localhost:3000`
