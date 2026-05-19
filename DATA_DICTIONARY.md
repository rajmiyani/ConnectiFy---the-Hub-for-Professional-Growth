# ConnectiFy — Data Dictionary (Database Schema)

This document provides a comprehensive overview of the database tables (models) used in the ConnectiFy project, based on the Prisma schema.

---

## 📑 Summary Overview
- **Total Tables (Models):** 19
- **Database Engine:** PostgreSQL
- **ORM:** Prisma

---

## 🛠️ Global Enums

| Enum Name | Values | Description |
|-----------|--------|-------------|
| **AccountType** | `user`, `employee`, `company`, `admin` | Defines the type of account/role. |
| **Gender** | `male`, `female`, `other` | User gender options. |
| **ProfileVisibility** | `public`, `private` | Controls user profile visibility. |
| **ConnectionStatus** | `PENDING`, `ACCEPTED`, `REJECTED` | Status of connection requests between users. |
| **NotificationType** | `REQUEST`, `ACCEPT`, `LIKE`, `COMMENT`, `MENTION`, `SYSTEM`, `ALERT` | Categories of notifications. |
| **ApplicationStatus** | `PENDING`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `HIRED`, `REJECTED` | Status of a job application. |

---

## 📁 Database Models (Tables)

### 1. User (`users`)
Stores detailed information about individual users, employees, and admins.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `accountType` | AccountType | @default(user) | user, employee, company, admin. |
| `firstName` | String | | User's first name. |
| `lastName` | String | | User's last name. |
| `username` | String | @unique | Unique profile handle. |
| `email` | String | @unique | Unique login email. |
| `phone` | String? | | Optional contact number. |
| `dob` | DateTime? | | Date of birth. |
| `gender` | Gender? | | male, female, other. |
| `headline` | String? | | Professional headline (e.g., "Full Stack Dev"). |
| `bio` | String? | | About section content. |
| `skills` | String? | | Comma-separated or textual skill list. |
| `educationLevel` | String? | | e.g., Bachelors, Masters. |
| `university` | String? | | Name of the current/last university. |
| `courseName` | String? | | Name of the degree/course. |
| `startYear` | String? | | Academic start year. |
| `passingYear` | String? | | Graduation year. |
| `cgpa` | String? | | Academic performance score. |
| `interest` | String? | | Areas of interest. |
| `currentEducation`| Boolean? | @default(false) | If currently studying. |
| `occupation` | String? | | Current job role. |
| `lookingFor` | String? | | job, internship, networking. |
| `linkedin` | String? | | LinkedIn profile URL. |
| `portfolio` | String? | | Personal website/portfolio URL. |
| `resume` | String? | | URL/Path to resume file. |
| `country` | String? | | Resident country. |
| `state` | String? | | Resident state. |
| `city` | String? | | Resident city. |
| `pin` | String? | | Postal code. |
| `password` | String | | Hashed BCrypt password. |
| `profileImg` | String? | | Profile avatar URL. |
| `coverPhoto` | String? | | Profile banner URL. |
| `profileVisibility`| ProfileVisibility| @default(public) | public or private. |
| `refreshTokens` | String[] | | Array of JWT refresh tokens. |
| `isVerified` | Boolean | @default(false) | Verified status (Email/Phone). |
| `isActive` | Boolean | @default(true) | Account active/blocked status. |
| `connections` | Int | @default(0) | Total connection count. |
| `profileViews` | Int | @default(0) | Total profile views. |
| `createdAt` | DateTime | @default(now()) | Account creation date. |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp. |
| `deletedAt` | DateTime? | | Soft delete timestamp. |
| `notificationPrefs`| Json? | | Email/Push preferences. |
| `privacySettings` | Json? | | Detailed privacy controls. |
| `twoFactorEnabled` | Boolean? | @default(false) | 2FA security status. |
| `activityStatus` | Boolean? | @default(true) | Online/Offline status. |

### 2. Company (`companies`)
Stores corporate profile and recruiter data.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `companyName` | String | | Formal name of organization. |
| `email` | String | @unique | Corporate contact email. |
| `phone` | String? | | Company contact number. |
| `website` | String? | | Official website URL. |
| `industry` | String | | Sector (e.g., Tech, Finance). |
| `companySize` | String? | | Employee count range. |
| `foundedYear` | String? | | Year established. |
| `recruiterName` | String | | Registered recruiter's name. |
| `recruiterEmail` | String | | Recruiter's contact email. |
| `recruiterPhone` | String | | Recruiter's contact phone. |
| `recruiterRole` | String? | | Title of the recruiter. |
| `country` | String | | Operations country. |
| `state` | String | | Operations state. |
| `city` | String | | Operations city. |
| `address` | String | | Full registered address. |
| `pincode` | String? | | Postal code. |
| `password` | String | | Hashed password. |
| `profileImg` | String? | | Company logo URL. |
| `coverPhoto` | String? | | Company banner URL. |
| `isVerified` | Boolean | @default(false) | Corporate verification status. |
| `isActive` | Boolean | @default(true) | Account status. |
| `tagline` | String? | | Short company motto. |
| `about` | String? | | Detailed company description. |
| `mission` | String? | | Company mission statement. |
| `vision` | String? | | Company vision statement. |
| `services` | String? | | List of products/services. |
| `techStack` | String? | | Technologies used (JSON string). |
| `createdAt` | DateTime | @default(now()) | Registration timestamp. |
| `updatedAt` | DateTime | @updatedAt | Last update timestamp. |

### 3. Post (`posts`)
User-generated feed content and articles.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | Author user ID. |
| `content` | String? | | Body text of the post. |
| `mediaType` | String? | | image, video, article. |
| `mediaUrls` | String[] | | Array of media file URLs. |
| `title` | String? | | Title for article-type posts. |
| `articleContent` | String? | | Detailed text for articles. |
| `isActive` | Boolean | @default(true) | Visibility status for moderation. |
| `createdAt` | DateTime | @default(now()) | Creation timestamp. |
| `updatedAt` | DateTime | @updatedAt | Last updated timestamp. |

### 4. Job (`jobs`)
Employment opportunities posted by companies or users.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String? | @relation, FK | Individual poster ID (if any). |
| `companyId` | String? | @relation, FK | Company poster ID (if any). |
| `title` | String | | Designation title. |
| `companyName` | String? | | Cached company name. |
| `location` | String | | Job work location. |
| `type` | String | @default("Full-time")| Full-time, Part-time, Internship, etc. |
| `workMode` | String? | @default("Onsite") | Onsite, Remote, Hybrid. |
| `experience` | String? | | Required years of experience. |
| `salary` | String? | | Remuneration details. |
| `openings` | Int? | @default(1) | Number of vacant positions. |
| `applyDeadline` | DateTime? | | Application closing date. |
| `skills` | String? | | Required skills (comma-separated). |
| `description` | String? | | Detailed job JD. |
| `benefits` | String? | | Perks and benefits. |
| `status` | String | @default("Active") | Active, Draft, Closed. |
| `logo` | String? | | Job/Company logo URL. |
| `createdAt` | DateTime | @default(now()) | Posting date. |
| `updatedAt` | DateTime | @updatedAt | Last update date. |

### 5. Application (`applications`)
Tracks candidates applying for jobs.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `jobId` | String | @relation, FK | Target job ID. |
| `userId` | String | @relation, FK | Applicant user ID. |
| `resumeUrl` | String? | | Link to the submitted resume. |
| `fullName` | String? | | Applicant's name override. |
| `email` | String? | | Applicant's email override. |
| `phone` | String? | | Applicant's phone override. |
| `coverLetter` | String? | | Why the user is applying. |
| `status` | ApplicationStatus | @default(PENDING)| PENDING, SHORTLISTED, etc. |
| `createdAt` | DateTime | @default(now()) | Submission date. |
| `updatedAt` | DateTime | @updatedAt | Status update date. |
| `@@unique` | | `[jobId, userId]` | One application per user per job. |

### 6. Connection (`connections`)
User-to-user professional network relationships.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `senderId` | String | @relation, FK | Request initiator. |
| `receiverId` | String | @relation, FK | Request recipient. |
| `status` | ConnectionStatus | @default(PENDING) | PENDING, ACCEPTED, REJECTED. |
| `createdAt` | DateTime | @default(now()) | Request date. |
| `updatedAt` | DateTime | @updatedAt | Acceptance/Rejection date. |
| `@@unique` | | `[senderId, receiverId]`| Unique request pair. |

### 7. Notification (`notifications`)
User and Company alerts for various activities.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `recipientId` | String | | Legacy ID. |
| `recipientType`| AccountType | @default(user) | user or company. |
| `senderId` | String? | | Legacy sender ID. |
| `senderType` | AccountType? | | user or company sender. |
| `type` | NotificationType | | Category of notification. |
| `content` | String | | Alert message text. |
| `postId` | String? | | Related post ID (if any). |
| `isRead` | Boolean | @default(false) | Seen/Unseen status. |
| `recipientUserId`| String? | @relation, FK | Explicit User recipient. |
| `recipientCompanyId`| String? | @relation, FK | Explicit Company recipient. |
| `senderUserId` | String? | @relation, FK | Explicit User sender. |
| `senderCompanyId`| String? | @relation, FK | Explicit Company sender. |
| `createdAt` | DateTime | @default(now()) | notification time. |

### 8. Message (`messages`)
Individual chat entries.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `conversationId`| String | @relation, FK | Parent conversation ID. |
| `senderId` | String | | Logic ID. |
| `senderType` | AccountType | @default(user) | user or company sender. |
| `senderUserId` | String? | @relation, FK | Explicit user sender. |
| `senderCompanyId`| String? | @relation, FK | Explicit company sender. |
| `content` | String | | The message text. |
| `mediaUrl` | String? | | Attached file/image URL. |
| `mediaType` | String? | | image, pdf, etc. |
| `createdAt` | DateTime | @default(now()) | Sent timestamp. |

### 9. Conversation (`conversations`)
Sessions regrouping chat participants.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `lastMessage` | String? | | Preview of the last message. |
| `createdAt` | DateTime | @default(now()) | Creation date. |
| `updatedAt` | DateTime | @updatedAt | Last activity date. |

### 10. Like (`likes`)
Post engagement tracking.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User who liked. |
| `postId` | String | @relation, FK | Post being liked. |
| `createdAt` | DateTime | @default(now()) | Like timestamp. |
| `@@unique` | | `[userId, postId]` | One like per post per user. |

### 11. Comment (`comments`)
Post feedback tracking.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | Commenter ID. |
| `postId` | String | @relation, FK | Parent post ID. |
| `content` | String | | Comment text. |
| `createdAt` | DateTime | @default(now()) | Comment date. |
| `updatedAt` | DateTime | @updatedAt | Last edit date. |

### 12. SavedPost (`saved_posts`)
User bookmarks for posts.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User ID. |
| `postId` | String | @relation, FK | Post ID. |
| `createdAt` | DateTime | @default(now()) | Save date. |
| `@@unique` | | `[userId, postId]` | Unique bookmark. |

### 13. SavedJob (`saved_jobs`)
User bookmarks for jobs.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User ID. |
| `jobId` | String | @relation, FK | Job ID. |
| `createdAt` | DateTime | @default(now()) | Save date. |
| `@@unique` | | `[userId, jobId]` | Unique bookmark. |

### 14. Event (`events`)
Community meetups and events.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | Organizer User ID. |
| `title` | String | | Event title. |
| `description` | String? | | Detailed event info. |
| `date` | DateTime | | Event date/time. |
| `location` | String? | | Venue or meeting link. |
| `mediaUrl` | String? | | Event banner/image URL. |
| `createdAt` | DateTime | @default(now()) | Creation date. |
| `updatedAt` | DateTime | @updatedAt | Last update date. |

### 15. Experience (`experiences`)
User professional history.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User's record. |
| `role` | String | | Job title. |
| `company` | String | | Company name. |
| `duration` | String? | | e.g. "2 years". |
| `description` | String? | | Task/Roles description. |
| `createdAt` | DateTime | @default(now()) | Record creation. |
| `updatedAt` | DateTime | @updatedAt | Record update. |

### 16. EducationDetail (`education_details`)
User academic history.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User's record. |
| `institution` | String | | School/College name. |
| `degree` | String? | | Degree/Level. |
| `year` | String? | | Graduation/Year. |
| `description` | String? | | Academic details. |
| `createdAt` | DateTime | @default(now()) | Record creation. |
| `updatedAt` | DateTime | @updatedAt | Record update. |

### 17. Certificate (`certificates`)
Professional certifications.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User's record. |
| `title` | String | | Certificate name. |
| `issuer` | String | | Organization name. |
| `createdAt` | DateTime | @default(now()) | Record creation. |
| `updatedAt` | DateTime | @updatedAt | Record update. |

### 18. Award (`awards`)
Achievements and honors.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `userId` | String | @relation, FK | User's record. |
| `title` | String | | Award name. |
| `description` | String? | | Achievement details. |
| `createdAt` | DateTime | @default(now()) | Record creation. |
| `updatedAt` | DateTime | @updatedAt | Record update. |

### 19. Interview (`interviews`)
Scheduled job interviews.

| Field Name | Datatype | Constraints | Description |
|------------|----------|-------------|-------------|
| `id` | String | @id, UUID() | Primary key. |
| `applicationId`| String | @relation, FK | Parent application ID. |
| `scheduledAt` | DateTime | | Date and time. |
| `type` | String | @default("Online") | Online, In-person. |
| `location` | String? | | Link or address. |
| `notes` | String? | | Meeting instructions. |
| `createdAt` | DateTime | @default(now()) | Record creation. |
| `updatedAt` | DateTime | @updatedAt | Record update. |
