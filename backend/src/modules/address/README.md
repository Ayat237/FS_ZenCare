# Address Module

This module provides comprehensive address management functionality for the ZenCare application, allowing users to create, read, update, and delete addresses for patients and doctors.

## Features

- **CRUD Operations**: Create, read, update, and delete addresses
- **User Association**: Link addresses to patients or doctors (mutually exclusive)
- **Geolocation Support**: Store and search by coordinates
- **Nearby Search**: Find addresses within a specified radius
- **Validation**: Comprehensive input validation and error handling
- **Authorization**: Role-based access control

## API Endpoints

### Base URL: `/address`

### 1. Create Address
- **POST** `/`
- **Description**: Create a new address for a patient or doctor
- **Authentication**: Required
- **Authorization**: ADMIN, DOCTOR, PATIENT
- **Body**:
  ```json
  {
    "patientId": "507f1f77bcf86cd799439011", // Optional
    "doctorId": "507f1f77bcf86cd799439012",   // Optional
    "street": "123 Main Street",
    "city": "Cairo",
    "country": "Egypt",
    "buildingNumber": 123,
    "buildingName": "Tower A",
    "neighborhood": "Downtown",
    "coordinates": {
      "longitude": 31.2357,
      "latitude": 30.0444
    }
  }
  ```

### 2. Get Address by User
- **GET** `/user/:userId`
- **Description**: Retrieve address for a specific user
- **Authentication**: Required
- **Authorization**: ADMIN, DOCTOR, PATIENT (users can only access their own address)
- **Params**: `userId` - MongoDB ObjectId

### 3. Update Address
- **PATCH** `/user/:userId`
- **Description**: Update address for a specific user
- **Authentication**: Required
- **Authorization**: ADMIN, DOCTOR, PATIENT (users can only update their own address)
- **Params**: `userId` - MongoDB ObjectId
- **Body**: Any combination of address fields

### 4. Delete Address
- **DELETE** `/user/:userId`
- **Description**: Delete address for a specific user
- **Authentication**: Required
- **Authorization**: ADMIN, DOCTOR, PATIENT (users can only delete their own address)
- **Params**: `userId` - MongoDB ObjectId

### 5. Find Nearby Addresses
- **GET** `/nearby?longitude=31.2357&latitude=30.0444&radius=10`
- **Description**: Find addresses within a specified radius
- **Authentication**: Required
- **Authorization**: ADMIN, DOCTOR, PATIENT
- **Query Parameters**:
  - `longitude` (required): Longitude coordinate (-180 to 180)
  - `latitude` (required): Latitude coordinate (-90 to 90)
  - `radius` (optional): Search radius in kilometers (0.1 to 100, default: 10)

### 6. Get All Addresses (Admin Only)
- **GET** `/?page=1&limit=10&sortBy=createdAt&sortOrder=desc`
- **Description**: Retrieve all addresses with pagination
- **Authentication**: Required
- **Authorization**: ADMIN only
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (1-100, default: 10)
  - `sortBy` (optional): Sort field (createdAt, updatedAt, city, country)
  - `sortOrder` (optional): Sort direction (asc, desc)

## Data Model

```javascript
{
  _id: ObjectId,
  createdBy: ObjectId,        // Reference to User
  patientId: ObjectId,        // Reference to Patient (optional)
  doctorId: ObjectId,         // Reference to Doctor (optional)
  street: String,             // Required
  city: String,               // Required
  country: String,            // Required, default: "Egypt"
  buildingNumber: Number,     // Optional
  buildingName: String,       // Optional
  neighborhood: String,       // Optional
  coordinates: {
    longitude: Number,        // Required (-180 to 180)
    latitude: Number          // Required (-90 to 90)
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Validation Rules

### Create Address
- Either `patientId` or `doctorId` must be provided (not both)
- `street` and `city` are required
- `coordinates` with valid longitude (-180 to 180) and latitude (-90 to 90) are required
- `buildingNumber` must be a positive integer
- All string fields have length limits

### Update Address
- At least one field must be provided
- Same validation rules as create for provided fields

### Coordinates
- Longitude: -180 to 180 degrees
- Latitude: -90 to 90 degrees
- Both must be valid numbers

## Error Handling

The module includes comprehensive error handling for:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Duplicate resource errors (409)
- Server errors (500)

## Utility Functions

The module includes utility functions for:
- Distance calculation using Haversine formula
- Coordinate validation
- Address string formatting
- Bounding box generation for geospatial queries
- Address data validation

## Security Features

- Role-based access control
- Users can only access/modify their own addresses
- Admins have full access to all addresses
- Input validation and sanitization
- Authentication required for all endpoints

## Usage Examples

### Create an address for a patient
```javascript
const addressData = {
  patientId: "507f1f77bcf86cd799439011",
  street: "123 Main Street",
  city: "Cairo",
  country: "Egypt",
  coordinates: {
    longitude: 31.2357,
    latitude: 30.0444
  }
};

const response = await fetch('/address', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(addressData)
});
```

### Find nearby addresses
```javascript
const response = await fetch('/address/nearby?longitude=31.2357&latitude=30.0444&radius=5', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
``` 