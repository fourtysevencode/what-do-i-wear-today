# AI Wardrobe Stylist 👕

An AI-powered digital wardrobe that analyzes a user's clothing, understands colors and clothing categories, and generates outfits using items they already own.

Instead of simply asking an LLM to generate outfits, the system combines computer vision, color analysis, recommendation algorithms, and an LLM to create personalized outfit recommendations.

## MVP Goal

Build a working application where a user can:

1. Upload photos of their clothes
2. Automatically detect and crop the clothing item
3. Identify the clothing category
4. Extract the dominant colors
5. Store clothing items in a digital wardrobe
6. Select an item to build an outfit around
7. Generate compatible clothing recommendations
8. Find the best matching items from their wardrobe
9. Display the completed outfit in the frontend

## MVP Architecture

```
                         ┌─────────────────┐
                         │      USER       │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │    NEXT.JS UI   │
                         │                 │
                         │ Upload Clothes  │
                         │ View Wardrobe   │
                         │ Generate Outfit │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ FASTAPI BACKEND │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
           ┌────────────────┐          ┌────────────────┐
           │ IMAGE PIPELINE │          │ OUTFIT ENGINE  │
           │                │          │                │
           │ YOLO Detection │          │ LLM            │
           │ Crop Item      │          │ Color Matching │
           │ Color Extract  │          │ Item Ranking   │
           └───────┬────────┘          └───────┬────────┘
                   │                           │
                   └─────────────┬─────────────┘
                                 ▼
                         ┌─────────────────┐
                         │    SUPABASE     │
                         │                 │
                         │ PostgreSQL      │
                         │ Storage         │
                         │ Authentication  │
                         └─────────────────┘
```

## Tech Stack

**Frontend**
- Next.js
- TypeScript
- Tailwind CSS

**Backend**
- Python
- FastAPI

**Computer Vision**
- YOLO
- OpenCV
- K-Means clustering

**AI**
- LLM API with structured JSON output

**Database and Storage**
- Supabase PostgreSQL
- Supabase Storage
- Supabase Auth

## Core Pipeline

```
Upload Image
      ↓
YOLO Detection
      ↓
Find Clothing Bounding Box
      ↓
Crop Clothing Item
      ↓
Extract Dominant Colors
      ↓
Classify Clothing Category
      ↓
Store Item Metadata
      ↓
Add Item to Digital Wardrobe
```

## Outfit Generation Pipeline

```
User Selects Clothing Item
            ↓
Retrieve Item Metadata
            ↓
Send Category + Colors + Context to LLM
            ↓
Receive Structured Outfit Requirements
            ↓
Search User's Wardrobe
            ↓
Calculate Color Distance
            ↓
Rank Compatible Items
            ↓
Select Best Available Matches
            ↓
Return Outfit JSON
            ↓
Render Outfit in Frontend
```

## MVP Roadmap

### Phase 1: Project Setup

**Goal**
Create the basic frontend, backend, and database infrastructure.

**Tasks**
- [ ] Create GitHub repository
- [ ] Create Next.js frontend
- [ ] Create FastAPI backend
- [ ] Create Supabase project
- [ ] Connect FastAPI to Supabase
- [ ] Create environment variable configuration
- [ ] Create basic API health check
- [ ] Create frontend API client

**Expected Result**
The frontend should successfully communicate with the FastAPI backend.

Frontend → `GET /health` → FastAPI

Response:
```json
{
    "status": "ok"
}
```

---

### Phase 2: Clothing Upload System

**Goal**
Allow users to upload clothing images.

**Tasks**
- [ ] Create image upload UI
- [ ] Create FastAPI upload endpoint
- [ ] Validate uploaded images
- [ ] Upload original images to Supabase Storage
- [ ] Store image URL in PostgreSQL
- [ ] Display uploaded images in the frontend

**API**
`POST /clothes/upload`

**Expected Result**
Users can upload clothing images and view them in their digital wardrobe.

---

### Phase 3: Clothing Detection

**Goal**
Automatically detect clothing items inside uploaded images.

**Tasks**
- [ ] Set up YOLO
- [ ] Find a suitable pretrained clothing detection model
- [ ] Run inference on uploaded images
- [ ] Retrieve clothing bounding boxes
- [ ] Select the primary clothing item
- [ ] Crop the detected clothing
- [ ] Save the processed image

**Pipeline**
```
Original Image
      ↓
YOLO
      ↓
Bounding Box
      ↓
Crop Clothing Item
      ↓
Processed Image
```

**Expected Result**
Given an image containing clothing, the backend returns:
```json
{
  "category": "shirt",
  "confidence": 0.91,
  "bounding_box": {
    "x1": 120,
    "y1": 80,
    "x2": 640,
    "y2": 720
  }
}
```

---

### Phase 4: Color Extraction

**Goal**
Determine the dominant colors of each clothing item.

**Tasks**
- [ ] Load cropped clothing image
- [ ] Resize image for faster processing
- [ ] Convert pixels into RGB data
- [ ] Run K-Means clustering
- [ ] Find dominant colors
- [ ] Convert RGB colors into HEX
- [ ] Store colors in the database

**Example Output**
```json
{
  "primary_color": "#426B9A",
  "dominant_colors": [
    "#426B9A",
    "#314E67",
    "#A3B4C2"
  ]
}
```

**Important Improvement**
The background should not influence color extraction.

Possible solutions:
- use the YOLO segmentation mask
- remove the background before color extraction
- only analyze pixels inside the clothing mask

For the MVP, segmentation is preferable to a plain bounding box if a suitable model is available.

---

### Phase 5: Digital Wardrobe

**Goal**
Store and display all processed clothing items.

**Database Schema**

`clothing_items`
- id
- user_id
- image_url
- processed_image_url
- category
- primary_color
- dominant_colors
- created_at

**Tasks**
- [ ] Create clothing items table
- [ ] Save processed clothing metadata
- [ ] Create wardrobe API endpoint
- [ ] Fetch all user clothing
- [ ] Create wardrobe grid
- [ ] Filter clothes by category
- [ ] Allow clothing deletion

**API**
`GET /wardrobe`

**Expected Result**
The user sees something like:

```
MY WARDROBE

TOPS
[Blue Shirt] [Black T-Shirt] [White Hoodie]

BOTTOMS
[Beige Pants] [Blue Jeans] [Black Trousers]

SHOES
[White Sneakers] [Black Shoes]
```

---

### Phase 6: LLM Outfit Recommendations

**Goal**
Generate outfit requirements based on a selected clothing item.

**Input**
```json
{
  "category": "shirt",
  "primary_color": "#426B9A",
  "color_name": "muted blue"
}
```

**LLM Output**
The LLM must return structured JSON.

```json
{
  "recommendations": [
    {
      "category": "pants",
      "preferred_colors": [
        "#D8C3A5",
        "#F5F5DC",
        "#36454F"
      ]
    },
    {
      "category": "shoes",
      "preferred_colors": [
        "#FFFFFF",
        "#6F4E37"
      ]
    }
  ]
}
```

**Tasks**
- [ ] Create LLM prompt
- [ ] Define structured output schema
- [ ] Send clothing metadata to LLM
- [ ] Validate returned JSON
- [ ] Handle invalid responses
- [ ] Return recommendations to outfit engine

---

### Phase 7: Wardrobe Matching Algorithm

**Goal**
Find real clothing items matching the LLM recommendations.

**Basic Algorithm**
```
LLM recommends:
Beige Pants
        ↓
Query wardrobe:
category = pants
        ↓
Calculate color distance
        ↓
Rank pants from closest → furthest
        ↓
Return best match
```

**Tasks**
- [ ] Filter wardrobe by clothing category
- [ ] Convert HEX colors into LAB color space
- [ ] Calculate color difference
- [ ] Rank clothing items
- [ ] Return closest available item
- [ ] Fall back to second-best match when necessary

**Recommendation**
Use CIELAB + Delta E instead of basic RGB Euclidean distance.

RGB distance:
```
sqrt(
    (R1 - R2)² +
    (G1 - G2)² +
    (B1 - B2)²
)
```

works, but it does not accurately represent how humans perceive color differences.

For the actual matching engine:
```
HEX
 ↓
RGB
 ↓
CIELAB
 ↓
Delta E
 ↓
Similarity Score
```

That tiny detail makes the project considerably more technically interesting. Apparently even comparing two colors requires humanity to invent several coordinate systems.

---

### Phase 8: Outfit Generation API

**Goal**
Combine the complete recommendation pipeline.

**API**
`POST /outfits/generate`

**Request**
```json
{
  "selected_item_id": "item_123"
}
```

**Backend Process**
```
Retrieve Selected Item
        ↓
Generate LLM Recommendations
        ↓
Retrieve Candidate Items
        ↓
Calculate Color Compatibility
        ↓
Rank Items
        ↓
Build Outfit
        ↓
Return Results
```

**Response**
```json
{
  "outfit": {
    "top": {
      "id": "item_123",
      "image_url": "..."
    },
    "bottom": {
      "id": "item_456",
      "image_url": "..."
    },
    "shoes": {
      "id": "item_789",
      "image_url": "..."
    }
  },
  "score": 0.87
}
```

---

### Phase 9: Outfit Frontend

**Goal**
Display generated outfits.

**Tasks**
- [ ] Create item selection UI
- [ ] Add Generate Outfit button
- [ ] Create loading state
- [ ] Send request to backend
- [ ] Receive generated outfit
- [ ] Display clothing images together
- [ ] Show recommendation explanation
- [ ] Add Regenerate button

**Expected UI**
```
YOUR OUTFIT

        [Blue Shirt]
        [Beige Pants]
        [White Sneakers]

Compatibility Score: 87%

Why it works:
The neutral beige balances the muted blue top,
while white sneakers keep the outfit cohesive.
```

---

## Recommended Project Structure

```
ai-wardrobe-stylist/
├── frontend/
│   ├── app/
│   ├── components/
│   │   ├── UploadClothing.tsx
│   │   ├── WardrobeGrid.tsx
│   │   ├── ClothingCard.tsx
│   │   └── OutfitDisplay.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── clothes.py
│   │   │   └── outfits.py
│   │   │
│   │   ├── services/
│   │   │   ├── detection.py
│   │   │   ├── color_extraction.py
│   │   │   ├── llm.py
│   │   │   └── recommendation.py
│   │   │
│   │   ├── models/
│   │   └── schemas/
│   │
│   └── requirements.txt
│
├── README.md
├── .gitignore
└── .env.example
```

## MVP Definition of Done

The MVP is complete when:

- [ ] A user can upload a clothing photo
- [ ] The system detects the clothing item
- [ ] The clothing item is cropped or segmented
- [ ] Dominant colors are extracted
- [ ] The clothing category and colors are stored
- [ ] The user can view their digital wardrobe
- [ ] The user can select an item
- [ ] The LLM generates compatible clothing requirements
- [ ] The backend searches the user's actual wardrobe
- [ ] The closest color matches are ranked
- [ ] A complete outfit is returned
- [ ] The frontend visually displays the generated outfit

## Post-MVP Features

Do not build these until the MVP works. Feature creep is where promising projects go to die wearing a half-finished React dashboard.

- CLIP embeddings for style similarity
- Weather-based recommendations
- Occasion selection
- User likes/dislikes
- Personalized recommendation weights
- Outfit history
- Multiple outfit generation
- Accessories
- Clothing segmentation improvements
- Automatic color naming
- Style profiles
- Recommendation learning
- Mobile app
- Social outfit sharing

## Development Order

1. FastAPI + Next.js Setup
2. Image Upload
3. YOLO Detection
4. Clothing Crop / Segmentation
5. Color Extraction
6. Supabase Storage
7. Digital Wardrobe UI
8. LLM Structured Recommendations
9. Delta E Color Matching
10. Outfit Generation API
11. Outfit Results UI
12. Testing + Deployment

**One important architectural decision:** Skip CLIP entirely for the first MVP. The core idea is already strong enough with YOLO/segmentation → color extraction → LLM color recommendations → Delta E wardrobe retrieval → frontend composition. Get that pipeline working end-to-end first. Then CLIP becomes a meaningful v2 improvement for matching style, rather than another impressive-sounding dependency sitting in requirements.txt doing absolutely nothing.
