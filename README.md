# 📸 GramSnap

> A full-stack social media platform inspired by Instagram, featuring image posts, stories, follows, notifications, and real-time chat.

GramSnap is a MERN-based social media application that provides an end-to-end experience for sharing images and stories, discovering users, and communicating in real time. The system is designed with a clear separation of concerns between frontend UI, backend business logic, and realtime communication.

---

## 🚀 High-Level Overview

- **Frontend:** React
- **Backend:** Express.js REST API with MongoDB
- **Realtime:** Socket.IO for chat, presence, and message delivery
- **Auth:** JWT-based authentication using HTTP-only cookies
- **Media:** Image uploads handled via Multer and stored in MongoDB

The goal is to deliver a **lightweight Instagram-like experience** with robust authentication, media handling, feeds, and messaging.

---

## ❓ Problem This Project Solves

GramSnap provides a complete solution for:
- Sharing image posts and short stories
- Following users and generating personalized feeds
- Commenting and liking posts
- Managing notifications
- Real-time messaging and online presence

It abstracts away session handling, media uploads, realtime messaging, and feed logic into a unified platform.

---

## 🎯 Target Users & Use Cases

### End Users
- Post images and stories
- View a personalized feed
- Like, comment, and follow other users
- Chat with followers in real time

### Platforms
- Desktop and mobile web users

### Developers
- Extend features (reels, search ranking, analytics)
- Fix bugs and improve performance
- Scale realtime and storage layers

---

## 🧠 Core Design Philosophy

- **Monorepo structure:** React frontend + Express backend
- **JWT authentication via cookies** (access + refresh tokens)
- **Media stored as binary blobs** in MongoDB and returned as Base64
- **UI logic in React**, business logic in backend controllers
- **Realtime presence & chat via Socket.IO**
- Simple, understandable architecture over premature complexity

---

## 🏗 System Architecture

**Top Level**

```

React Client
↕ HTTP (axios + cookies)
Express API
↕ Socket.IO
MongoDB

````

### Frontend
- React (Create React App)
- MUI for UI components
- axios for REST API calls
- socket.io-client for realtime features

### Backend
- Express routes & controllers
- MongoDB with Mongoose
- JWT authentication stored in cookies
- Multer for multipart image uploads
- Socket.IO server for realtime features

### Realtime
- Tracks online users
- Emits presence updates
- Sends and receives chat messages
- Updates message delivery status

### Architecture Diagram
![Architecture Diagram](public/assets/Images/GramSnapArchitecture.png)

---

## 📦 Major Components & Responsibilities

### Frontend (`/src`)
- **Pages & Components:** Feed, AddPost, Profile, Notifications, Chat, Search, Stories
- **Hooks & Utils:** Socket authentication, config variables, meta updates
- **State Management:** Redux Toolkit + local component state
- **Networking:** axios + socket.io-client

### Backend (`/backend/src`)
- **server.js**
  - Express initialization
  - MongoDB connection
  - CORS & cookie configuration
  - Socket.IO setup
  - Route mounting

- **Routes**
  - Central REST endpoint registry
  - Auth, posts, stories, comments, follow, notifications, chat

- **Controllers**
  - Auth (login, refresh tokens)
  - Posts & comments
  - Stories
  - Profile updates
  - Search & follow logic
  - Notifications

- **Models**
  - User
  - Post
  - Story
  - Comment
  - Message

- **Middleware**
  - JWT authentication guard for protected routes

- **File Uploads**
  - Multer writes files to temporary storage
  - Files converted to binary and saved in MongoDB
  - Temp files deleted after persistence

---

## 🔄 Data Flow

### Post Creation
1. User selects and crops image
2. Frontend sends `multipart/form-data` via axios
3. Multer stores file temporarily
4. Controller reads file, saves binary to MongoDB
5. Temp file deleted
6. Response returned to frontend
7. Feed refreshed

### Authentication
1. User logs in
2. Server validates credentials
3. Generates access + refresh JWTs
4. Tokens stored in HTTP-only cookies
5. Refresh token persisted in user document
6. Protected routes use refresh token for identity

### Realtime Messaging
1. Client connects to Socket.IO
2. Session verified via protected endpoint
3. Client emits `userConnected`
4. Server maps `userId → socketId`
5. Messages saved in DB and emitted to recipients
6. Presence and delivery status updated

---

## 🔗 Key Dependencies

### Frontend
- react
- react-router-dom
- @mui/material & icons
- axios
- socket.io-client
- redux toolkit
- react-cropper

### Backend
- express
- mongoose
- multer
- jsonwebtoken
- bcryptjs
- cookie-parser
- cors
- socket.io
- express-async-handler
- nodemailer
- helmet
- morgan

### Infrastructure
- MongoDB
- Optional deployment: Vercel (frontend), Render (backend)

---

## 📂 Project Structure

```txt
Directory structure:
└── gopi-c-k-gramsnap-fullstack/
    ├── README.md
    ├── package.json
    ├── android-app/
    │   ├── build.gradle.kts
    │   ├── gradle.properties
    │   ├── gradlew
    │   ├── gradlew.bat
    │   ├── settings.gradle.kts
    │   ├── app/
    │   │   ├── build.gradle.kts
    │   │   ├── proguard-rules.pro
    │   │   └── src/
    │   │       ├── androidTest/
    │   │       │   └── java/
    │   │       │       └── com/
    │   │       │           └── example/
    │   │       │               └── myapplication/
    │   │       │                   └── ExampleInstrumentedTest.kt
    │   │       ├── main/
    │   │       │   ├── AndroidManifest.xml
    │   │       │   ├── java/
    │   │       │   │   └── com/
    │   │       │   │       └── example/
    │   │       │   │           └── myapplication/
    │   │       │   │               ├── AddPostActivity.kt
    │   │       │   │               ├── CommonProfileActivity.kt
    │   │       │   │               ├── MainActivity.kt
    │   │       │   │               ├── MessageActivity.kt
    │   │       │   │               ├── MessageListActivity.kt
    │   │       │   │               ├── NotificationActivity.kt
    │   │       │   │               ├── PersistentCookieJar.kt
    │   │       │   │               ├── PostActivity.kt
    │   │       │   │               ├── SearchActivity.kt
    │   │       │   │               ├── SettingsActivity.kt
    │   │       │   │               ├── SignInActivity.kt
    │   │       │   │               ├── SignUpActivity.kt
    │   │       │   │               ├── SockerManager.kt
    │   │       │   │               ├── UserProfile.kt
    │   │       │   │               └── ui/
    │   │       │   │                   └── theme/
    │   │       │   │                       ├── Color.kt
    │   │       │   │                       ├── Theme.kt
    │   │       │   │                       └── Type.kt
    │   │       │   └── res/
    │   │       │       ├── drawable/
    │   │       │       │   ├── baseline_visibility_24.xml
    │   │       │       │   ├── ic_launcher_background.xml
    │   │       │       │   ├── ic_launcher_foreground.xml
    │   │       │       │   └── outline_5g_24.xml
    │   │       │       ├── mipmap-anydpi-v26/
    │   │       │       │   ├── ic_launcher.xml
    │   │       │       │   ├── ic_launcher_logo.xml
    │   │       │       │   ├── ic_launcher_logo_round.xml
    │   │       │       │   └── ic_launcher_round.xml
    │   │       │       ├── mipmap-hdpi/
    │   │       │       │   ├── ic_launcher.webp
    │   │       │       │   ├── ic_launcher_foreground.webp
    │   │       │       │   ├── ic_launcher_logo.webp
    │   │       │       │   ├── ic_launcher_logo_foreground.webp
    │   │       │       │   ├── ic_launcher_logo_round.webp
    │   │       │       │   └── ic_launcher_round.webp
    │   │       │       ├── mipmap-mdpi/
    │   │       │       │   ├── ic_launcher.webp
    │   │       │       │   ├── ic_launcher_foreground.webp
    │   │       │       │   ├── ic_launcher_logo.webp
    │   │       │       │   ├── ic_launcher_logo_foreground.webp
    │   │       │       │   ├── ic_launcher_logo_round.webp
    │   │       │       │   └── ic_launcher_round.webp
    │   │       │       ├── mipmap-xhdpi/
    │   │       │       │   ├── ic_launcher.webp
    │   │       │       │   ├── ic_launcher_foreground.webp
    │   │       │       │   ├── ic_launcher_logo.webp
    │   │       │       │   ├── ic_launcher_logo_foreground.webp
    │   │       │       │   ├── ic_launcher_logo_round.webp
    │   │       │       │   └── ic_launcher_round.webp
    │   │       │       ├── mipmap-xxhdpi/
    │   │       │       │   ├── ic_launcher.webp
    │   │       │       │   ├── ic_launcher_foreground.webp
    │   │       │       │   ├── ic_launcher_logo.webp
    │   │       │       │   ├── ic_launcher_logo_foreground.webp
    │   │       │       │   ├── ic_launcher_logo_round.webp
    │   │       │       │   └── ic_launcher_round.webp
    │   │       │       ├── mipmap-xxxhdpi/
    │   │       │       │   ├── ic_launcher.webp
    │   │       │       │   ├── ic_launcher_foreground.webp
    │   │       │       │   ├── ic_launcher_logo.webp
    │   │       │       │   ├── ic_launcher_logo_foreground.webp
    │   │       │       │   ├── ic_launcher_logo_round.webp
    │   │       │       │   └── ic_launcher_round.webp
    │   │       │       ├── values/
    │   │       │       │   ├── colors.xml
    │   │       │       │   ├── ic_launcher_background.xml
    │   │       │       │   ├── ic_launcher_logo_background.xml
    │   │       │       │   ├── strings.xml
    │   │       │       │   └── themes.xml
    │   │       │       └── xml/
    │   │       │           ├── backup_rules.xml
    │   │       │           ├── data_extraction_rules.xml
    │   │       │           └── file_paths.xml
    │   │       └── test/
    │   │           └── java/
    │   │               └── com/
    │   │                   └── example/
    │   │                       └── myapplication/
    │   │                           └── ExampleUnitTest.kt
    │   └── gradle/
    │       ├── libs.versions.toml
    │       └── wrapper/
    │           └── gradle-wrapper.properties
    ├── backend/
    │   ├── package.json
    │   ├── sample.txt
    │   ├── server.js
    │   └── src/
    │       ├── config/
    │       │   └── db.js
    │       ├── controllers/
    │       │   ├── addPost.js
    │       │   ├── chatControls.js
    │       │   ├── chatList.js
    │       │   ├── fControl.js
    │       │   ├── followRequest.js
    │       │   ├── followRequestAccept.js
    │       │   ├── getProfile.js
    │       │   ├── likePost.js
    │       │   ├── notification.js
    │       │   ├── postRetrival.js
    │       │   ├── profileUpdation.js
    │       │   ├── savePost.js
    │       │   ├── search.js
    │       │   ├── sendOTP.js
    │       │   ├── signIn.js
    │       │   ├── signUp.js
    │       │   ├── suggestion.js
    │       │   ├── userController.js
    │       │   ├── post/
    │       │   │   ├── commentPost.js
    │       │   │   ├── commentRetrieve.js
    │       │   │   ├── retrievePost.js
    │       │   │   └── retrievePostImage.js
    │       │   └── story/
    │       │       ├── createStory.js
    │       │       ├── getStories.js
    │       │       └── getStory.js
    │       ├── middlewares/
    │       │   ├── authMiddleWare.js
    │       │   └── mailSupport.js
    │       ├── models/
    │       │   ├── comment.js
    │       │   ├── msgModel.js
    │       │   ├── post.js
    │       │   ├── story.js
    │       │   └── user.js
    │       └── routes/
    │           ├── chatRoutes.js
    │           ├── storyRoute.js
    │           └── userRoute.js
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── robots.txt
    └── src/
        ├── App.css
        ├── App.js
        ├── App.test.js
        ├── index.css
        ├── index.js
        ├── setupTests.js
        ├── components/
        │   ├── AddPost.js
        │   ├── AddStory.js
        │   ├── dummy.txt
        │   ├── FollowMenu.js
        │   ├── hook.js
        │   ├── Notification.js
        │   ├── PostPage.js
        │   ├── Profile.js
        │   ├── Search.js
        │   ├── Settings.js
        │   ├── SignIn.js
        │   ├── SignUp.js
        │   ├── updateMetaTag.js
        │   ├── UserProfile.js
        │   └── variable.js
        └── hooks/
            └── userSocket.js

````

---

## 🔐 Security Notes

* Authentication via HTTP-only cookies
* JWT refresh strategy for session continuity
* Protected routes via auth middleware
* Temporary file cleanup to prevent disk growth
* Socket.IO uses in-memory online user tracking
  *(Replace with Redis for horizontal scaling)*

---


## 🚧 Future Improvements

* Redis-backed Socket.IO scaling
* CDN / object storage for media
* API versioning
* End-to-end tests
* Feed ranking algorithms
* Mobile app (React Native)

---

## 👤 Author

**[Gopi C K](https://github.com/gopi-c-k)**
Full-Stack Developer


---

⭐ If you find this project useful, consider starring the repository!

```
