# 🎯 Quiz App - Application Flow

## 📊 System Architecture Overview

```mermaid
graph TB
    Client[React Frontend<br/>Vite + Tailwind CSS]
    Server[Express Backend<br/>Node.js]
    DB[(MongoDB Atlas<br/>Database)]
    Cache[(Redis Cache<br/>Optional)]
    Cloud[Cloudinary<br/>Image Storage]
    Email[Brevo<br/>Email Service]
    OAuth[Google OAuth 2.0]
    
    Client <-->|HTTP/REST API| Server
    Server <-->|Mongoose ODM| DB
    Server <-->|Cache Queries| Cache
    Server <-->|Upload Images| Cloud
    Server <-->|Send Emails| Email
    Client <-->|Social Login| OAuth
    OAuth -->|Verify Token| Server
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant G as Google OAuth
    
    rect rgb(200, 220, 255)
    Note over U,G: Traditional Login
    U->>F: Enter email & password
    F->>B: POST /api/auth/login
    B->>DB: Find user by email
    DB-->>B: User data
    B->>B: Verify password (Bcrypt)
    B-->>F: JWT Token + User data
    F->>F: Store token in localStorage
    F-->>U: Redirect to Dashboard
    end
    
    rect rgb(255, 220, 200)
    Note over U,G: Google OAuth Login
    U->>F: Click "Sign in with Google"
    F->>G: Redirect to Google
    G->>U: Request permissions
    U->>G: Approve
    G->>B: POST /api/auth/google with token
    B->>G: Verify Google token
    G-->>B: User profile data
    B->>DB: Find or create user
    DB-->>B: User data
    B-->>F: JWT Token + User data
    F->>F: Store token in localStorage
    F-->>U: Redirect to Dashboard
    end
```

---

## 📝 Quiz Taking Flow

```mermaid
flowchart TD
    Start([User clicks<br/>Take Quiz]) --> Auth{Is User<br/>Authenticated?}
    Auth -->|No| Login[Redirect to Login]
    Auth -->|Yes| CheckEligibility{Check Quiz<br/>Eligibility}
    
    CheckEligibility -->|Taken within 7 days| ShowError[Show Custom Dialog:<br/>Days/Hours/Minutes<br/>until retake]
    ShowError --> End1([User redirected<br/>to Quiz List])
    
    CheckEligibility -->|Eligible| LoadQuiz[Load Quiz Questions<br/>Start Timer]
    LoadQuiz --> TakeQuiz{User Taking Quiz}
    
    TakeQuiz -->|Answer Questions| Navigation[Previous/Next<br/>Question Navigation]
    Navigation --> TakeQuiz
    
    TakeQuiz -->|Back Button Pressed| ConfirmLeave{Custom Dialog:<br/>Submit & Leave?}
    ConfirmLeave -->|Cancel| TakeQuiz
    ConfirmLeave -->|Confirm| AutoSubmit[Auto-submit Quiz<br/>via SendBeacon API]
    
    TakeQuiz -->|Time Expires| AutoSubmit
    TakeQuiz -->|Click Submit| CheckAnswers{Has Unanswered<br/>Questions?}
    
    CheckAnswers -->|Yes| ConfirmSubmit{Custom Dialog:<br/>Submit Anyway?}
    ConfirmSubmit -->|No| TakeQuiz
    ConfirmSubmit -->|Yes| Submit[Submit Quiz]
    CheckAnswers -->|No| Submit
    
    AutoSubmit --> SubmitAPI[POST /api/result/submit]
    Submit --> SubmitAPI
    
    SubmitAPI --> Backend[Backend:<br/>Calculate Score<br/>Update Progress]
    Backend -->|Contest Quiz| UpdateContest[Update Contest<br/>Leaderboard]
    Backend --> Cache1[Invalidate Cache:<br/>results, contests]
    Cache1 --> Result[Show Result Page<br/>with Score & Answers]
    UpdateContest --> Cache1
    
    Result --> End2([User can view<br/>detailed results])

    style Start fill:#e1f5e1
    style End1 fill:#ffe1e1
    style End2 fill:#e1f5e1
    style ShowError fill:#fff3cd
    style ConfirmLeave fill:#fff3cd
    style Result fill:#d1e7ff
```

---

## 🏆 Contest Flow

```mermaid
flowchart TD
    AdminStart([Admin creates<br/>Contest]) --> CreateContest[POST /api/contests/create]
    CreateContest --> SetDetails[Set Contest Details:<br/>- Title & Description<br/>- Quiz Selection<br/>- Start/End Time<br/>- Max Participants<br/>- Prize Info]
    
    SetDetails --> SaveDB[(Save to MongoDB)]
    SaveDB --> InvalidateCache1[Invalidate Cache:<br/>cache:/api/contests*]
    InvalidateCache1 --> ContestLive{Contest Status}
    
    ContestLive -->|Upcoming| Waiting[Contest Visible<br/>Users can Join]
    ContestLive -->|Live| Active[Contest Active<br/>Users can Take Quiz]
    ContestLive -->|Completed| Ended[Contest Ended<br/>Show Final Rankings]
    
    Waiting --> UserJoin[User clicks Join]
    UserJoin --> CheckFull{Is Contest Full?}
    CheckFull -->|Yes| ShowFullError[Show Error:<br/>Contest Full]
    CheckFull -->|No| JoinContest[POST /api/contests/:id/join]
    JoinContest --> AddParticipant[Add to Participants List]
    AddParticipant --> InvalidateCache2[Invalidate Cache]
    InvalidateCache2 --> StatusChange{Status becomes Live?}
    
    StatusChange -->|Yes| Active
    StatusChange -->|No| Waiting
    
    Active --> TakeQuiz[User Takes Quiz<br/>with contestId param]
    TakeQuiz --> SubmitResult[Submit Quiz Result]
    SubmitResult --> UpdateLeaderboard[Update Contest Leaderboard:<br/>- Score<br/>- Completion Time<br/>- Rank]
    
    UpdateLeaderboard --> InvalidateCache3[Invalidate Cache:<br/>contests & results]
    InvalidateCache3 --> Leaderboard[GET /api/contests/:id/leaderboard]
    Leaderboard --> ShowRankings[Display Rankings:<br/>Auto-refresh every 30s]
    
    ShowRankings --> Ended
    Ended --> FinalResults[Show Final Rankings<br/>with Prizes]
    
    style AdminStart fill:#e1f5e1
    style FinalResults fill:#d1e7ff
    style ShowFullError fill:#ffe1e1
    style Leaderboard fill:#fff3cd
```

---

## 🔄 Data Caching Strategy

```mermaid
flowchart LR
    Request[Client Request] --> Cache{Is Redis<br/>Available?}
    Cache -->|No| DirectDB[Query MongoDB<br/>Directly]
    Cache -->|Yes| CheckCache{Data in<br/>Cache?}
    
    CheckCache -->|Cache HIT| GetCache[Retrieve from Redis<br/>5-15ms response]
    CheckCache -->|Cache MISS| QueryDB[Query MongoDB<br/>100-500ms response]
    
    QueryDB --> StoreCache[Store in Redis<br/>with TTL]
    StoreCache --> ReturnData[Return to Client]
    GetCache --> ReturnData
    DirectDB --> ReturnData
    
    Mutation[Data Mutation:<br/>Create/Update/Delete] --> InvalidatePattern[Invalidate Cache Pattern<br/>cache:/api/contests*<br/>cache:/api/quiz*<br/>cache:/api/result*]
    InvalidatePattern --> NextRequest[Next Request<br/>fetches fresh data]
    
    style GetCache fill:#d1e7ff
    style QueryDB fill:#fff3cd
    style Mutation fill:#ffe1e1
    style ReturnData fill:#e1f5e1
```

### Cache Durations:
- **Contest Leaderboards**: 30 seconds (live data)
- **Contest List/Details**: 1 minute (semi-live)
- **Quiz List/Details**: 5 minutes (semi-static)
- **Results & Statistics**: 1-2 minutes (dynamic)
- **Categories**: 10 minutes (static)

---

## 👤 User Journey Map

```mermaid
journey
    title User Journey - From Registration to Quiz Mastery
    section Registration
      Sign Up: 5: User
      Email Verification: 3: User
      Login: 5: User
    section First Quiz
      Browse Quizzes: 5: User
      View Quiz Details: 4: User
      Take First Quiz: 3: User
      Submit & View Results: 4: User
    section Progress
      View Statistics: 5: User
      Check Leaderboard: 4: User
      Track Progress: 5: User
    section Contests
      Browse Contests: 5: User
      Join Contest: 4: User
      Take Contest Quiz: 2: User
      View Contest Rankings: 5: User
    section Retake & Improve
      Wait 7 Days: 1: User
      Retake Quiz: 4: User
      Improve Score: 5: User
```

---

## 🛠️ API Architecture

### Backend Routes Structure

```mermaid
graph TD
    Server[Express Server] --> Auth[/api/auth]
    Server --> Quiz[/api/quiz]
    Server --> Result[/api/result]
    Server --> Contest[/api/contests]
    Server --> Category[/api/categories]
    Server --> Profile[/api/profile]
    Server --> Admin[/api/superadmin]
    
    Auth --> Login[POST /login]
    Auth --> Signup[POST /createaccount]
    Auth --> Google[POST /google-auth]
    Auth --> Reset[POST /forgot-password]
    Auth --> Logout[POST /logout]
    
    Quiz --> GetQuizzes[GET /quizzes<br/>🔒 Cache: 5min]
    Quiz --> GetQuiz[GET /quizzes/:id<br/>🔒 Cache: 5min<br/>✓ Eligibility Check]
    Quiz --> CreateQuiz[POST /createquiz<br/>👨‍💼 Admin Only<br/>⚠️ Invalidate Cache]
    Quiz --> UpdateQuiz[PUT /update/:id<br/>👨‍💼 Admin Only<br/>⚠️ Invalidate Cache]
    Quiz --> DeleteQuiz[DELETE /delete/:id<br/>👨‍💼 Admin Only<br/>⚠️ Invalidate Cache]
    
    Result --> Submit[POST /submit<br/>⚠️ Invalidate Cache]
    Result --> GetResults[GET /user<br/>🔒 Cache: 1min]
    Result --> GetStats[GET /user/statistics<br/>🔒 Cache: 2min]
    Result --> GetLeaderboard[GET /leaderboard/:quizId<br/>🔒 Cache: 1min]
    
    Contest --> GetContests[GET /<br/>🔒 Cache: 1min]
    Contest --> GetContest[GET /:id<br/>🔒 Cache: 1min]
    Contest --> JoinContest[POST /:id/join<br/>⚠️ Invalidate Cache]
    Contest --> CreateContest[POST /create<br/>👨‍💼 Admin Only<br/>⚠️ Invalidate Cache]
    Contest --> GetContestLeader[GET /:id/leaderboard<br/>🔒 Cache: 30sec]
    
    style Server fill:#4a90e2
    style Auth fill:#f39c12
    style Quiz fill:#27ae60
    style Result fill:#e74c3c
    style Contest fill:#9b59b6
```

---

## 📱 Frontend Component Hierarchy

```mermaid
graph TB
    App[App.jsx<br/>Router + Auth Context] --> Layout[Layout<br/>Navbar + Footer]
    
    Layout --> Public[Public Pages]
    Layout --> Protected[Protected Pages]
    Layout --> Admin[Admin Pages]
    Layout --> Contest[Contest Pages]
    
    Public --> Login[Login Component]
    Public --> Signup[Signup Component]
    Public --> QuizList[Quiz List<br/>Browse all quizzes]
    
    Protected --> TakeQuiz[Take Quiz Component<br/>- Timer<br/>- Auto-submit<br/>- Back button handler]
    Protected --> Results[Results List<br/>User's quiz history]
    Protected --> ResultDetail[Result Detail<br/>Score & answers]
    Protected --> Stats[User Statistics<br/>Performance analytics]
    Protected --> Progress[Progress Tracking<br/>Learning journey]
    Protected --> Leaderboards[Leaderboards<br/>Rankings per quiz]
    Protected --> Profile[Profile Page<br/>User info & avatar]
    
    Admin --> AdminDash[Admin Dashboard]
    Admin --> CreateQuiz[Create Quiz]
    Admin --> UpdateQuiz[Update Quiz]
    Admin --> SuperAdmin[Super Admin Panel<br/>User management]
    
    Contest --> ContestList[Contest List<br/>Browse contests]
    Contest --> ContestDetail[Contest Detail<br/>Join & info]
    Contest --> ContestLeader[Contest Leaderboard<br/>Live rankings]
    Contest --> MyContests[My Contests<br/>Participated contests]
    Contest --> CreateContest[Create Contest<br/>Admin only]
    
    TakeQuiz --> CustomDialogs[Custom Dialogs:<br/>- Leave Confirmation<br/>- Eligibility Error<br/>- Submit Confirmation]
    
    style App fill:#4a90e2
    style Protected fill:#27ae60
    style Admin fill:#e74c3c
    style Contest fill:#9b59b6
    style CustomDialogs fill:#f39c12
```

---

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ RESULT : submits
    USER ||--o{ QUIZ : creates
    USER ||--o{ CONTEST : creates
    USER }o--o{ CONTEST : participates
    QUIZ ||--o{ RESULT : has
    QUIZ ||--o{ CONTEST : used_in
    CONTEST ||--o{ RESULT : contains
    CATEGORY ||--o{ QUIZ : categorizes
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "user|admin|superadmin"
        string profilePicture
        array progress "Quiz history"
        timestamps created_updated
    }
    
    QUIZ {
        ObjectId _id PK
        string title
        ObjectId category FK
        string difficulty "easy|medium|hard"
        array questions "Question objects"
        number timeLimit "In seconds"
        ObjectId createdBy FK
        boolean isPublished
        timestamps created_updated
    }
    
    RESULT {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId quizId FK
        ObjectId contestId FK "Optional"
        array answers "User answers"
        number score
        number total
        number percentage
        number timeTaken
        timestamps submittedAt
    }
    
    CONTEST {
        ObjectId _id PK
        string title
        ObjectId quiz FK
        date startTime
        date endTime
        string status "upcoming|live|completed"
        array participants "User participation data"
        number maxParticipants
        object prizeInfo
        ObjectId createdBy FK
        timestamps created_updated
    }
    
    CATEGORY {
        ObjectId _id PK
        string name UK
        string description
        timestamps created_updated
    }
```

---

## 🎨 Theme & State Management

```mermaid
flowchart TB
    App[App Component] --> Providers[Context Providers]
    Providers --> AuthContext[AuthContext<br/>- User state<br/>- isAuthenticated<br/>- Login/Logout]
    Providers --> ThemeContext[ThemeContext<br/>- Dark/Light mode<br/>- Toggle theme]
    
    AuthContext --> LocalStorage1[localStorage:<br/>- token<br/>- user data]
    ThemeContext --> LocalStorage2[localStorage:<br/>- theme preference]
    
    Components[All Components] --> UseAuth[useAuth Hook]
    Components --> UseTheme[useTheme Hook]
    
    UseAuth --> Protected[Protected Routes<br/>Require Authentication]
    UseAuth --> Navbar[Navbar<br/>Show user info]
    UseAuth --> Admin[Admin Routes<br/>Check role]
    
    UseTheme --> Styling[Apply Tailwind<br/>dark: classes]
    
    style Providers fill:#4a90e2
    style AuthContext fill:#27ae60
    style ThemeContext fill:#f39c12
```

---

## ⚡ Performance Optimizations

```mermaid
mindmap
    root((Performance<br/>Optimizations))
        Frontend
            React Router lazy loading
            Image optimization with Cloudinary
            Vite build optimization
            Tailwind CSS purging
            Component memoization
            Local state management
        Backend
            Redis caching layer
                30s for live data
                1-5min for semi-static
                10min for static
            Database indexing
                email unique index
                quiz category index
                result userId index
            Rate limiting
                100 requests per 15min
            CORS optimization
            Gzip compression
        API Design
            REST endpoints
            JWT token auth
            Pagination ready
            Error handling
            Response optimization
```

---

## 🔒 Security Features

```mermaid
flowchart TD
    Security[Security Layer] --> Auth[Authentication]
    Security --> Validation[Input Validation]
    Security --> Protection[Route Protection]
    Security --> Storage[Secure Storage]
    
    Auth --> JWT[JWT Tokens<br/>Expires in 7 days]
    Auth --> Bcrypt[Bcrypt Hashing<br/>12 rounds]
    Auth --> OAuth[Google OAuth 2.0]
    Auth --> Session[Express Session]
    
    Validation --> Email[Email Validation]
    Validation --> Password[Password Requirements:<br/>- 8-24 chars<br/>- Uppercase<br/>- Lowercase<br/>- Number<br/>- Special char]
    Validation --> Sanitization[Input Sanitization]
    
    Protection --> Middleware[Auth Middleware<br/>protectRoute]
    Protection --> RoleCheck[Role-based Access:<br/>- User<br/>- Admin<br/>- SuperAdmin]
    Protection --> RateLimit[Rate Limiting<br/>100 req/15min]
    Protection --> CORS[CORS Policy]
    
    Storage --> HTTP[HTTP-only Cookies]
    Storage --> Env[Environment Variables]
    Storage --> NoSQL[MongoDB Security]
    
    style Security fill:#e74c3c
    style Auth fill:#27ae60
    style Protection fill:#f39c12
    style Validation fill:#3498db
```

---

## 📊 Key Application Features

### ✅ Implemented Features

1. **User Management**
   - Registration with email validation
   - Login with JWT authentication
   - Google OAuth 2.0 integration
   - Password reset via email
   - Profile management with image upload
   - Role-based access (User, Admin, SuperAdmin)

2. **Quiz System**
   - Create/Edit/Delete quizzes (Admin)
   - Multiple choice questions
   - Category-based organization
   - Time-limited quiz attempts
   - 7-day retake cooldown with smart display (days/hours/minutes)
   - Automatic scoring
   - Quiz eligibility checks

3. **Contest System**
   - Create contests (Admin)
   - Join contests
   - Live/Upcoming/Completed status
   - Real-time leaderboards with auto-refresh
   - Max participant limits
   - Prize information
   - Contest-specific quizzes

4. **Results & Analytics**
   - Detailed result pages
   - Answer review
   - Personal statistics
   - Progress tracking
   - Quiz leaderboards
   - Contest rankings

5. **UI/UX Enhancements**
   - Dark mode support
   - Custom confirmation dialogs (replace browser alerts)
   - Responsive design (mobile-friendly)
   - Loading states
   - Toast notifications
   - Auto-submit on back button/refresh
   - Smooth animations

6. **Performance**
   - Redis caching (optional)
   - Optimized database queries
   - CDN for images (Cloudinary)
   - Fast API responses
   - Efficient state management

---

## 🚀 Deployment Architecture

```mermaid
flowchart TB
    Dev[Development<br/>localhost:3000<br/>localhost:5000] --> Git[Git Repository<br/>GitHub]
    Git --> CI[CI/CD Pipeline]
    
    CI --> BuildFE[Build Frontend<br/>npm run build<br/>Vite production]
    CI --> BuildBE[Build Backend<br/>npm install<br/>Environment setup]
    
    BuildFE --> DeployFE[Deploy Frontend<br/>Netlify/Vercel<br/>Static hosting]
    BuildBE --> DeployBE[Deploy Backend<br/>Render/Railway<br/>Node.js hosting]
    
    DeployBE --> MongoDB[MongoDB Atlas<br/>Cloud database]
    DeployBE --> Redis[Redis Cloud<br/>Optional caching]
    DeployBE --> Cloudinary[Cloudinary<br/>Image storage]
    DeployBE --> Brevo[Brevo<br/>Email service]
    
    DeployFE --> CDN[CDN Distribution]
    CDN --> Users[End Users]
    
    Users --> DeployFE
    Users --> DeployBE
    
    style Dev fill:#e1f5e1
    style DeployFE fill:#3498db
    style DeployBE fill:#e74c3c
    style Users fill:#f39c12
```

---

## 📈 Future Enhancements (Roadmap)

```mermaid
mindmap
    root((Future<br/>Features))
        User Experience
            Mobile App React Native
            PWA support
            Voice commands
            Accessibility improvements
            Multi-language support
        Quiz Features
            Question difficulty levels
            Multiplayer mode
            Quiz sharing
            Custom quiz creation by users
            Question explanations
            Timed questions individual
        Analytics
            Advanced analytics dashboard
            Performance trends
            Weak area identification
            Personalized recommendations
            Export reports as PDF
        Gamification
            Achievement badges
            Streak tracking
            Daily challenges
            Reward points
            Virtual prizes
        Social Features
            Friend challenges
            Social media sharing
            Comments and discussions
            User profiles public
            Follow system
        Technical
            GraphQL API
            WebSocket for real-time
            Redis Cluster scaling
            Microservices architecture
            Advanced caching strategies
```

---

## 🎯 Summary

This Quiz App is a full-stack MERN application with:

- **Frontend**: React 18.2 + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express 5.1 + MongoDB + Redis (optional)
- **Authentication**: JWT + Google OAuth 2.0
- **Storage**: Cloudinary (images) + MongoDB (data)
- **Performance**: Redis caching with smart invalidation
- **Security**: Bcrypt hashing + JWT tokens + Rate limiting
- **Features**: Quizzes + Contests + Leaderboards + Analytics + User management

The application follows modern best practices with proper separation of concerns, RESTful API design, responsive UI, and scalable architecture.
