# Backend Assessment Solution

## Overview

This is a backend task that ingests JSON datasets from AWS S3 buckets, stores them efficiently in MongoDB, and exposes the data via a filterable REST API. The solution is built using TypeScript, NestJS, and MongoDB, with a focus on scalability, maintainability, and extensibility.

## Features

* **Data Ingestion**: Ingests JSON files (\~200KB to \~150MB, scalable to 1GB) from S3 at regular intervals (every 12 hours).
* **Data Storage**: Stores data in a unified MongoDB schema with indexing for efficient querying.
* **API**: Single endpoint (`GET /listings`) with filtering (partial text, numeric ranges), sorting, and pagination.
* **Extensibility**: Supports new JSON sources via configuration, with unmapped fields stored in a metadata field.

## Prerequisites

* **Node.js**: Version 20 or higher.
* **MongoDB**: A running instance (MongoDB Atlas).
* **AWS Credentials**: Access to the S3 bucket (`buenro-tech-assessment-materials`) with read permissions.
* **Git**: For cloning the repository.

## Setup Instructions

### Clone the Repository

```bash
git clone <https://github.com/Youngprinnce/Data-ingestion-service
cd Data-ingestion-service
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory with the following:

```env
APP_PORT=3000
PROCESS_ENABLED=true
DATABASE_URL="mongodb+srv://dev:admin@cluster0.6y15mry.mongodb.net/buenro?retryWrites=true&w=majority"
BASE_URL='https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com'
PROCESS_ENABLED=true
```

### Run the Application

```bash
npm run start:dev
```

The app will start on [http://localhost:3000](http://localhost:3000) (or the configured `APP_PORT`).

## Access the API

* **Swagger Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
* **Listings Endpoint**: `GET http://localhost:3000/listings`

---

## API Usage

### Endpoint: `GET /listings`

Retrieves listings with flexible filtering, sorting, and pagination.

### Query Parameters

| Parameter          | Type    | Description                                                 |
| ------------------ | ------- | ----------------------------------------------------------- |
| `search`           | String  | Partial, case-insensitive search on name, city, or country. |
| `priceSegment`     | Enum    | Filter by price segment (`low`, `medium`, `high`).          |
| `isAvailable`      | Boolean | Filter by availability (`true`, `false`).                   |
| `pricePerNightMin` | Integer | Minimum price per night.                                    |
| `pricePerNightMax` | Integer | Maximum price per night.                                    |
| `page`             | Integer | Page number (default: `1`).                                 |
| `limit`            | Integer | Items per page (default: `20`, max: `50`).                  |
| `sortBy`           | String  | Field to sort by (`name`, `city`, `country`, etc.).         |
| `sortOrder`        | Enum    | Sort order (`asc`, `desc`, default: `asc`).                 |

### Example Request

```bash
curl "http://localhost:3000/listings?search=Paris&pricePerNightMin=100&priceSegment=high&limit=20&page=1&sortBy=pricePerNight&sortOrder=desc"
```

### Example Response

```json
{
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  },
  "data": [
    {
      "name": "Luxury Paris Loft",
      "city": "Paris",
      "country": "France",
      "pricePerNight": 150,
      "priceSegment": "high",
      "isAvailable": true
    }
  ]
}
```

---

## Extending for New JSON Sources

### 1. Add a New Source to `ingestion-config.json`

Update `src/ingestion/ingestion-config.json`:

```json
{
  "sourceId": "source3",
  "url": "https://<s3-bucket>/<new-json-file>.json",
  "strategy": "stream",
  "fieldMapping": {
    "id": "uniqueId",
    "title": "name",
    "location.city": "city",
    "location.country": "country",
    "available": "isAvailable",
    "price": "pricePerNight"
  }
}
```

### 2. Handle Unmapped Fields

Update `src/ingestion/utils/field-mapper.utils.ts`:

You can decide to update the mapper with how it should handle different object keys otherwise

Fields not mapped in fieldMapping are stored in the metadata field of the Listing model (type: Json).

Example: If the new JSON has a description field not mapped, it’s stored as metadata.description.

### 3. Restart the Application

New sources will be ingested automatically on the next cron run (every 12 hours) or manually.

---

## Technical Architecture

The system is designed for scalability, maintainability, and extensibility.

### Architecture Diagram (Textual)

```
+------------------------------------+
| AWS S3                             |
| - structured_generated_data.json   |
| - large_generated_data.json        |
+------------------------------------+
          | HTTP GET (JSON)
          v
+------------------------------------+
| NestJS Application                 |
| +-------------------------------+  |
| | Ingestion Module              |  |
| | - DataIngestionJob (Cron)     |  |
| | - IngestionService            |  |
| | - SimpleFetchStrategy         |  |
| | - StreamJsonStrategy          |  |
| | - FieldMapper                 |  |
| +-------------------------------+  |
| +-------------------------------+  |
| | Listings Module               |  |
| | - ListingsController          |  |
| | - ListingsService             |  |
| | - QueryListingsDto            |  |
| | - QueryParserUtils            |  |
| +-------------------------------+  |
| +-------------------------------+  |
| | Prisma Module                 |  |
| | - PrismaService               |  |
| +-------------------------------+  |
| +-------------------------------+  |
| | Config Module                 |  |
| | - ingestion-config.json       |  |
| +-------------------------------+  |
+------------------------------------+
          | MongoDB Queries
          v
+------------------------------------+
| MongoDB                            |
| - Listing Collection               |
|   - Indexes: name, city, country,  |
|              pricePerNight, etc.   |
|   - Fields: sourceId, name, city,  |
|             pricePerNight, metadata|
+------------------------------------+
          | REST API (GET /listings)
          v
+------------------------------------+
| Clients (Browser, Postman, etc.)   |
| - Query with filters, pagination   |
| - Receive JSON response            |
+------------------------------------+
```

---

## Component Interactions

### Ingestion

* `DataIngestionJob` runs every 12 hours.
* `IngestionService` selects a strategy based on file size (`SimpleFetchStrategy` or `StreamJsonStrategy`).
* `FieldMapper` applies the field mapping to normalize fields.
* Data is saved to MongoDB using `PrismaService` with batch upserts.

### Storage

* MongoDB stores listings in a `Listing` collection with indexes and flexible schema (`metadata`).

### API

* `ListingsController` handles incoming requests.
* `QueryListingsDto` validates inputs.
* `QueryParserUtils` builds filters.
* `PrismaService` executes the database query.


---

## Scalability Features

* **Streaming**: Handles large files efficiently.
* **Batching**: Reduces memory usage.
* **Indexing**: Fast queries.
* **Config-Driven**: Supports multiple sources without code changes.

## Development Notes

* **Error Handling**: Logs and skips invalid records.
* **Extensibility**: Metadata and strategy pattern support different formats.
* **Performance**: Uses streaming, batching, and indexing effectively.

## Future Improvements

* Add ingestion queue with BullMQ.
* Use MongoDB `bulkWrite` for performance.
* Allow metadata field querying.
* Integrate Elasticsearch for advanced search.
* Integrate Redis for faster querying.

## Troubleshooting

* **Ingestion Failures**: Check AWS credentials and `ingestion-config.json`.
* **MongoDB Errors**: Ensure correct `DATABASE_URL` and MongoDB instance.
* **API Issues**: Validate parameters via Swagger at `/docs`.

---

For further assistance, contact the repository maintainer.
