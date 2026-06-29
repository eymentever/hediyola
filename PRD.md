# Product Requirements Document (PRD) - Hediyola (Prezola Clone)

Hediyola is a premium online wedding registry and gift list platform, designed to replicate and enhance the capabilities of **prezola.com**. It serves three primary groups: couples, wedding guests, and platform administrators.

---

## 👥 1. User Personas & Core Journeys

### A. The Couples (Registry Creators)
Couples create and customize their wedding gift list, choosing from a variety of options including physical catalog items, custom honeymoon funds, cash gifts, and charity contributions.
- **Registration & Setup**: Simple onboarding to enter wedding date, venue, custom URL slug, and a cover photo.
- **Gift Selection**:
  - Add items from the platform's curated physical product catalog.
  - Create custom items (e.g., "Sofa Fund", "Romantic Dinner in Rome") with custom titles, images, and prices.
  - Create cash funds (e.g., Honeymoon Flights, House Downpayment) with flexible guest contribution settings (contribute any amount, or set fixed increments).
- **Personalization**: Write a welcome message, add a photo gallery, set a countdown, and configure a registry password if they want the list to be private.
- **Couple Dashboard**: Track guest purchases in real-time, request payouts for cash contributions, manage the physical gift shipping schedules, and track which guests have been sent thank-you cards.

### B. The Guests (Buyers & Contributors)
Guests visit the registry to find and purchase gifts or contribute to funds.
- **Search Registry**: Search by couple name, wedding date, or custom registry URL (e.g., `hediyola.com/list/john-jane`).
- **Browse & Filter**: View the personalized couple page, browse items, and filter by price, category, and availability (e.g., "Available", "Already Purchased").
- **Cart & Checkout**:
  - Purchase whole physical items.
  - Make partial or full contributions to cash/honeymoon funds.
  - Check out using a unified cart (buying multiple gifts/contributing to multiple funds in a single transaction).
  - Add a custom text message and name to the purchase.
- **Confirmation**: Receive an automated email confirmation of the purchased gifts.

### C. The Platform Administrators
Admins manage the marketplace, couples, physical inventory/catalog, and financial transactions.
- **Catalog Management**: Add, edit, and delete partner brands, categories, and products with images, prices, SKU, and specifications.
- **Registry & Order Monitoring**: View all active registries, track orders, monitor shipping statuses of physical items, and process cash fund payouts.
- **Financial Dashboard**: Monitor platform revenue, transaction fees, and payout approvals.

---

## 🛠 2. Feature Specifications

### 2.1 Couple Registry Onboarding & Management
- **Registry Creation**: Setup wizard collecting:
  - Partner 1 Name, Partner 2 Name.
  - Wedding Date & Venue.
  - Shipping Address (for physical gifts - hidden from guests).
  - Registry Slug (e.g., `/list/alice-bob`).
  - Privacy Settings: Public (searchable) or Private (requires passcode).
- **Customizer Page**: A beautiful drag-and-drop or simple dashboard to upload a cover photo, profile pictures, write their love story, and set a countdown timer.
- **Bank Account Integration**: Secure interface to input IBAN/bank details for cash fund payouts.

### 2.2 Gift Registry Builder
- **Catalog Selector**: A grid view of physical gifts categorized by Room (Kitchen, Bedroom, Living Room), Brand, and Price. Couples can click "Add to List" and specify the desired quantity.
- **Cash Pot / Honeymoon Fund Builder**: Form to create a cash pot:
  - Fund Name (e.g., "Honeymoon in Maldives").
  - Description & Photo.
  - Target Goal (Optional).
  - Contribution Mode: "Any Amount" or "Fixed Increments" (e.g., $50, $100, $250).
- **Custom Gift Creator**: Let couples paste a link to any third-party website, add a title, price, and image to add it to their registry (the guest buys it, and the cash is transferred to the couple to purchase it themselves).

### 2.3 Guest Portal & Registry Page
- **Custom URL Access**: `hediyola.com/list/[slug]` resolves to the couple's registry page.
- **Visual Presentation**: Elegantly styled page matching the couple's customizer settings.
- **Gift Listing**: Grid of gifts displaying:
  - Title, Image, Brand, Price.
  - Status Indicator (e.g., "Group Gift", "1 of 2 purchased", "Fully Purchased").
- **Guest Checkout**:
  - Guests select one or more items/funds.
  - Multi-item cart showing physical gifts + cash fund contributions.
  - Fields for Guest Name, Email, and a personalized message.
  - Secure payments processed via Stripe (for international/credit cards) or Iyzico (for Turkish credit/debit cards).

### 2.4 Couple Dashboard & Order Tracking
- **Overview Stat Cards**: Total registry value, amount received, percentage of list completed.
- **Purchases Feed**: Real-time list of guest purchases (e.g., "Sarah bought Le Creuset Casserole Dish - 'Congratulations!'").
- **Payout Manager**: Dashboard showing total cash contributions. Button to "Request Payout" to their linked bank account.
- **Thank-You Card Tracker**: List of purchased items with a checkbox "Thank You Sent" and guest email.
- **Shipping Manager**: Option to "Ship Now" or "Group & Deliver Later". Since couples might want all gifts shipped together after the wedding, they can trigger shipping for all accumulated physical items.

### 2.5 Mobile App (iOS & Android)
The mobile app is designed primarily for the **Couples** to manage their registry on-the-go.
- **Live Notifications**: Push notifications when a guest buys a gift or contributes to a fund.
- **Add Gifts via Barcode/Camera**: Allow couples to scan barcodes in physical stores to search the database or add the product details immediately.
- **Mobile Share extension**: Share custom gifts directly from a mobile browser (Safari/Chrome) into the Hediyola app to add them to their registry.
- **Real-time Purchases view**: A simple feed of who purchased what with messages.

---

## 🎨 3. UX & UI Design Guidelines

- **Theme**: Warm, romantic, premium, minimalist, and elegant.
- **Color Palette**: Off-white background, pastel accents (blush pink, soft gold, champagne, olive green), deep charcoal/navy for typography.
- **Typography**: Playfair Display or Serif headers for an elegant look, paired with Inter or Roboto for readable body text.
- **Animations**: Subtle, smooth transitions for buttons, card hovers, cart sliding, and step transitions.
- **Mobile Responsiveness**: The guest checkout must be extremely optimized for mobile browsers, as 80%+ of guests will purchase gifts from their phones.
