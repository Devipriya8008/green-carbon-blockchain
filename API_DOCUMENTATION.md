# Blue Carbon Network API Documentation

## Base URL
http://localhost:3001/api

## NGO Endpoints

### 1. Register NGO
POST /ngo/register

Body:
{
  "id": "NGO001",
  "name": "Coastal Conservation India",
  "contactEmail": "contact@example.com",
  "country": "India",
  "projectType": "Mangrove Restoration",
  "description": "Description of the project"
}

### 2. Get NGO Details
GET /ngo/:id

### 3. Get Pending Registrations
GET /ngo/pending

### 4. Approve NGO
POST /ngo/:id/approve

### 5. Reject NGO
POST /ngo/:id/reject

## MRV Endpoints

### 1. Submit MRV Data
POST /mrv/submit

### 2. Get All MRV Data
GET /mrv/all
