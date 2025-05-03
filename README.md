Backend Assessment Solution
Overview
This is a backend solution for the senior backend role technical assessment. It ingests JSON datasets from AWS S3 buckets, stores them efficiently in MongoDB, and exposes the data via a filterable REST API. The solution is built using TypeScript, NestJS, and MongoDB, with a focus on scalability, maintainability, and extensibility.
Features

Data Ingestion: Ingests JSON files (~200KB to ~150MB, scalable to 1GB) from S3 at regular intervals (every 12 hours).
Data Storage: Stores data in a unified MongoDB schema with indexing for efficient querying.
API: Single endpoint (GET /listings) with filtering (partial text, numeric ranges), sorting, and pagination.
Extensibility: Supports new JSON sources via configuration, with unmapped fields stored in a metadata field.

Prerequisites

Node.js: Version 18 or higher.
MongoDB: A running instance (local or cloud, e.g., MongoDB Atlas).
AWS Credentials: Access to the S3 bucket (buenro-tech-assessment-materials) with read permissions.
Git: For cloning the repository.

Setup Instructions

Clone the Repository:
git clone <repository-url>
cd <repository-folder>


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the root directory with the following:
# MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/assessment

# Application port
APP_PORT=3000

# Enable cron jobs (set to true to run ingestion jobs)
PROCESS_ENABLED=true

# AWS credentials (optional if using AWS SDK defaults)
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=eu-north-1


Run the Application:
npm run start

The app will start on http://localhost:3000 (or the configured APP_PORT).

Access the API:

Swagger Documentation: http://localhost:3000/docs
Listings Endpoint: GET http://localhost:3000/listings



API Usage
Endpoint: GET /listings
Retrieves listings with flexible filtering, sorting, and pagination.
Query Parameters



Parameter
Type
Description



search
String
Partial, case-insensitive search on name, city, or country.


priceSegment
Enum
Filter by price segment (low, medium, high).


isAvailable
Boolean
Filter by availability (true, false).


pricePerNightMin
Integer
Minimum price per night.


pricePerNightMax
Integer
Maximum price per night.


page
Integer
Page number (default: 1).


limit
Integer
Items per page (default: 20, max: 50).


sortBy
String
Field to sort by (name, city, country, pricePerNight, etc.).


sortOrder
Enum
Sort order (asc, desc, default: asc).


Example Request
curl "http://localhost:3000/listings?search=Paris&pricePerNightMin=100&priceSegment=high&limit=20&page=1&sortBy=pricePerNight&sortOrder=desc"

Example Response
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
    },
    ...
  ]
}

Extending for New JSON Sources
To support new JSON files with different structures, follow these steps:

Add a New Source to ingestion-config.json:Update src/ingestion/ingestion-config.json with a new entry:
{
  "sourceId": "source3",
  "url": "https://<s3-bucket>/<new-json-file>.json",
  "strategy": "stream", // Use "simple" for small files (<1MB), "stream" for large files
  "fieldMapping": {
    "id": "uniqueId",           // Map source field to `sourceId`
    "title": "name",           // Map to `name`
    "location.city": "city",   // Map nested fields with dot notation
    "location.country": "country",
    "available": "isAvailable",
    "price": "pricePerNight"
  }
}


Handle Unmapped Fields:

Fields not mapped in fieldMapping are stored in the metadata field of the Listing model (type: Json).
Example: If the new JSON has a description field not mapped, it’s stored as metadata.description.


Update Filtering (Optional):

To query new fields (e.g., description), extend QueryListingsDto and buildMongoFilters in listings/utils/query-parser.utils.ts.
For metadata fields, add MongoDB JSON queries (e.g., metadata.description: { $eq: "value" }).


Restart the Application:The ingestion job will automatically pick up the new source on the next cron run (every 12 hours) or can be triggered manually.


This approach minimizes code changes and supports diverse JSON structures via configuration.
Technical Architecture
The system is designed for scalability, maintainability, and extensibility, with clear separation of concerns.
Architecture Diagram
Below is a textual representation of the architecture. You can recreate it using tools like Draw.io or Lucidchart.
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

Component Interactions

Ingestion:

DataIngestionJob runs every 12 hours (cron) and reads sources from ingestion-config.json.
IngestionService uses a strategy (SimpleFetchStrategy for small files, StreamJsonStrategy for large files) to fetch JSON from S3.
FieldMapper transforms JSON fields to a unified IngestionResponseDto based on fieldMapping.
Data is saved to MongoDB via PrismaService with batch upserts, ensuring deduplication by sourceId.


Storage:

MongoDB stores data in a Listing collection with a flexible schema (metadata for unmapped fields).
Indexes optimize filtering and sorting.


API:

ListingsController handles GET /listings requests, passing query parameters to ListingsService.
QueryListingsDto validates and sanitizes inputs.
QueryParserUtils builds MongoDB filters for text search, ranges, and enums.
PrismaService executes queries with pagination and sorting, returning results to clients.



Scalability Features

Streaming: StreamJsonStrategy processes large files incrementally to avoid memory issues.
Batching: Ingestion and storage use configurable batch sizes (default: 1000).
Indexing: MongoDB indexes ensure fast queries.
Config-Driven: New sources are added via ingestion-config.json without code changes.

Development Notes

Error Handling: Comprehensive logging and error recovery (e.g., skipping invalid records in streams).
Extensibility: Strategy pattern and metadata field support diverse JSON structures.
Performance: Optimized for large datasets with streaming, batching, and indexing.

Future Improvements

Add a queue (e.g., BullMQ) for concurrent ingestion to prevent resource exhaustion.
Use MongoDB bulkWrite for faster batch upserts.
Enable metadata field querying for new attributes.
Add a text index or Elasticsearch for faster text searches.

Troubleshooting

Ingestion Failures: Check AWS credentials and S3 bucket access. Verify ingestion-config.json for correct URLs and mappings.
MongoDB Errors: Ensure the DATABASE_URL is correct and MongoDB is running.
API Issues: Use Swagger (/docs) to validate query parameters.

For further assistance, contact the repository maintainer.
