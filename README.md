# 🏠 RealtyFlow – Property Rental & Management Platform

RealtyFlow is a full-stack web application designed to simplify property rental interactions between tenants, property owners, and administrators. The platform provides a centralized system for browsing properties, managing listings, and handling rental applications efficiently.

---

## 🚀 Features

- 🔐 Role-Based Authentication  
  Secure login and signup with support for tenants, property owners, and administrators  

- 🏡 Property Listings  
  Create, view, and manage rental properties  

- 🔍 Search & Filtering  
  Filter properties based on location, budget, and preferences  

- ❤️ Favorites System  
  Save and manage shortlisted properties  

- 📝 Rental Application Workflow  
  Apply for properties directly through the platform  

- 🛠️ Admin Dashboard  
  Monitor users and manage listings  

---

## 🧱 Tech Stack

### Frontend
- React (Next.js – App Router)
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL  
- Supabase (managed database hosting)

### Deployment
- Frontend: Vercel  
- Backend: Render  

---

## 📂 Project Structure

### 🔹 Backend
backend/
│
├── prisma/
│ ├── migrations/
│ ├── seedData/
│ ├── client.ts
│ ├── schema.prisma
│ └── seed.ts
│
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── services/
│ ├── middleware/
│ └── lib/
│
├── index.ts
├── prisma.config.js
├── tsconfig.json
├── .env
└── package.json


---

### 🔹 Frontend
frontend/
│
├── app/
│ ├── (auth)/
│ ├── (main)/
│ ├── admin/
│ ├── auth/
│ ├── login/
│ ├── signup/
│ ├── properties/
│ ├── search/
│ ├── tenants/
│ ├── managers/
│ ├── layout.tsx
│ └── page.tsx
│
├── components/
│ ├── PropertyCard.tsx
│ ├── PropertyDetails.tsx
│ ├── PropertyGallery.tsx
│ ├── FilterModal.tsx
│ ├── BookingWidget.tsx
│ ├── FavoriteButton.tsx
│ ├── Navbar.tsx
│ ├── ProtectedRoute.tsx
│ ├── MapView.tsx
│ └── StickyActionPanel.tsx
│
├── context/
│ └── AuthContext.tsx
│
├── hooks/
│ └── use-mobile.ts
│
├── lib/
│ ├── api.ts
│ ├── utils.ts
│ └── propertyConstants.ts
│
├── state/
│ ├── store.ts
│ └── globalSlice.ts
│
├── amplify/
├── middleware.ts
├── next.config.ts
├── .env.local
└── package.json


---

## ⚙️ Setup Instructions

### 1. Clone the Repository
git clone <YOUR_REPOSITORY_LINK>
cd realtyflow

### 2. Backend 

cd backend
npm install

#### Create a .env file:
DATABASE_URL=your_database_url
PORT=5000

#### Run Prisma migrations:
npx prisma migrate dev
npx prisma generate

#### Start backend server:
npm run dev

### 3. Frontend

cd frontend
npm install





