# Documents Module

The Documents module provides comprehensive document management functionality for the HRMS system, allowing users to upload, organize, and access company documents, policies, and resources.

## Features

### Document Management

- **Upload Documents**: Support for various file types (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, images)
- **Document Organization**: Categorize documents by type (policy, handbook, form, contract, notice, procedure, manual, other)
- **Visibility Control**: Configure who can access documents (all, employees, managers, hr, private)
- **Search & Filter**: Find documents by title, type, visibility, and other criteria
- **Document Actions**: View, download, and delete documents (based on permissions)

### File Storage

- **S3 Integration**: Secure file storage using AWS S3 with presigned URLs
- **File Validation**: Client-side and server-side file type and size validation
- **Progress Tracking**: Visual upload progress indicators

### Access Control

- **Role-Based Permissions**: CASL-based authorization for create, read, update, delete operations
- **Visibility-Based Access**: Filter documents based on user role and document visibility settings
- **Secure Operations**: All operations respect user permissions and organization boundaries

### User Interface

- **Modern UI**: Built with Shadcn/UI components and Tailwind CSS
- **Responsive Design**: Works across desktop and mobile devices
- **File Upload**: Drag-and-drop file upload with DiceUI FileUpload component
- **Statistics Dashboard**: View document counts, recent uploads, and type distribution
- **Loading States**: Skeleton loading and proper error handling

## Components

### `DocumentsPage`

Main component for displaying and managing documents.

- Lists all accessible documents in a card-based layout
- Provides filtering and search functionality
- Shows document statistics and metrics
- Handles document deletion with confirmation

### `DocumentUploadDialog`

Modal dialog for uploading new documents.

- File upload with drag-and-drop support
- Document metadata form (title, description, type, visibility)
- S3 integration for secure file storage
- Form validation with Zod schemas

## API Endpoints

### TRPC Router: `documents`

- `create`: Create a new document record
- `update`: Update document metadata
- `list`: Get paginated list of documents with filtering
- `getById`: Get a specific document by ID
- `delete`: Delete a document
- `getStats`: Get document statistics

## Database Schema

### `documents` Table

- `id`: Unique document identifier (UUID)
- `title`: Document title
- `description`: Document description
- `type`: Document type enum
- `visibility`: Document visibility enum
- `url`: Document file URL (S3)
- `uploadedBy`: User who uploaded the document
- `employeeId`: Associated employee (optional)
- `isActive`: Soft delete flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Permissions

### CASL Abilities

- `create Documents`: Can upload new documents
- `read Documents`: Can view and access documents
- `update Documents`: Can modify document metadata
- `delete Documents`: Can delete documents
- `manage Documents`: Full access (typically HR/Admin)

### Visibility Levels

- `all`: Visible to everyone
- `employees`: Visible to all employees
- `managers`: Visible to managers only
- `hr`: Visible to HR staff only
- `private`: Visible to uploader only

## File Upload Configuration

### Supported File Types

- PDF documents
- Microsoft Office files (DOC, DOCX, XLS, XLSX)
- Text files (TXT, CSV)
- Images (JPG, JPEG, PNG, GIF, WEBP)

### File Size Limits

- Maximum file size: 10MB
- Configurable via `FILE_UPLOAD.MAX_SIZE` constant

## Usage

### Accessing Documents

Navigate to `/dashboard/documents` to view and manage documents.

### Uploading Documents

1. Click "Upload Document" button
2. Drag and drop file or click to browse
3. Fill in document metadata (title, description, type, visibility)
4. Click "Upload Document" to save

### Managing Documents

- **View**: Click "View" button to open document in new tab
- **Download**: Click download icon to download file
- **Delete**: Click delete icon (if permitted) to remove document

## Integration

The Documents module integrates with:

- **Authentication**: Better-auth for user authentication
- **Authorization**: CASL for permission-based access control
- **File Storage**: AWS S3 for secure file storage
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Shadcn/UI components and DiceUI FileUpload
- **Validation**: Zod schemas for type-safe validation
