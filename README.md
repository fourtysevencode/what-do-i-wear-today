# What Do I Wear Today?
> Ever took hours to decide what to wear? So did I. Thats why this exists! Simply uploada a picture of your wardrobe (Mirror selfies, your clothes laid out over your bed, etc) and create a digital wardrobe which you can build outfits with AI based on the temperature and activity you got planned, or try building matching fits with your friends. [Try it out here!](https://wardrobe.ronakbuilds.tech/)

---

## Architecture

The project is split into a `frontend/` and `backend/` directories splitting the deployment for both between vercel (frontend) and huggingface spaces via docker (backend).

The complete working is demonstrated in the flowchart below:

```mermaid
flowchart TB
    %% ───────── Client ─────────
    subgraph Client["Browser"]
        UI["Next.js pages<br/>/ · /login · /signup<br/>/wardrobe · /outfits · /outfits/new · /outfits/match<br/>/friends · /friends/[username] · /account<br/>/status · /fourtysevencode (secret)"]
        CAM["Camera / file upload"]
        TS["Cloudflare Turnstile widget"]
    end

    CF["Cloudflare proxy<br/>wardrobe.ronakbuilds.tech"]

    %% ───────── Vercel ─────────
    subgraph Vercel["Vercel · Next.js 16 (frontend/)"]
        PROXY["proxy.ts<br/>redirects signed-out users away from<br/>/wardrobe /outfits /friends /account"]

        subgraph Server["Server Components + Server Actions"]
            AUTH["(auth)/actions<br/>signup · login · logout"]
            WACT["wardrobe/actions<br/>rename · remove garment · remove colour"]
            FACT["friends actions<br/>request · accept · decline"]
            OACT["outfits/actions<br/>save · delete outfit"]
            ACCT["account actions<br/>change username"]
            ADMIN["fourtysevencode/actions<br/>ADMIN_PASSWORD → wdiwt_admin cookie"]
        end

        subgraph Routes["Route Handlers (app/api)"]
            RG["POST /api/garments<br/>photo → segment → store"]
            RIMG["GET /api/garments/[id]/image<br/>owner/friend check → 302 signed URL"]
            RW["GET /api/weather"]
            RO["POST /api/outfits"]
            RM["POST /api/outfits/match"]
        end

        subgraph Lib["lib/"]
            SESS["session.ts<br/>iron-session cookie wdiwt_session"]
            DAL["dal.ts<br/>getCurrentUser · requireUser"]
            USERS["users.ts · bcrypt"]
            GARM["garments.ts"]
            FRI["friends.ts"]
            OUT["outfits.ts"]
            STOR["storage.ts<br/>S3 client"]
            API["api.ts<br/>backend client + X-API-Token"]
            TURN["turnstile.ts<br/>siteverify"]
        end
    end

    %% ───────── HF Space ─────────
    subgraph HF["Hugging Face Space · FastAPI (backend/) · Docker :7860"]
        H["GET /health"]
        SEG["POST /segment<br/>Removes background & extracts colors"]
        MAT["POST /match<br/>AI outfit matching engine"]
    end

    %% ───────── External Services ─────────
    subgraph External["External Infrastructures"]
        DB[("PostgreSQL Database")]
        S3[("S3 Object Storage")]
        WAPI["OpenWeatherMap API"]
    end

    %% ───────── Connections / Interactions ─────────
    UI --> CF
    CF --> PROXY
    PROXY --> Server
    PROXY --> Routes

    Routes & Server --> Lib
    TURN --> TS
    
    RG --> SEG
    RM --> MAT
    STOR --> S3
    RW --> WAPI
    
    USERS & GARM & FRI & OUT --> DB
```


