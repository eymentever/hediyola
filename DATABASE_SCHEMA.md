# Database Schema (Supabase/PostgreSQL) - Hediyola

We will use Prisma schema notation for modeling the database. The database resides in Supabase (PostgreSQL).

---

## 💾 Prisma Schema Design (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  COUPLE
  ADMIN
}

enum RegistryStatus {
  DRAFT
  ACTIVE
  PAST
}

enum ItemType {
  CATALOG
  CUSTOM
  CASH_FUND
  CHARITY
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  SHIPPED
}

enum PayoutStatus {
  PENDING
  APPROVED
  REJECTED
  PAID
}

// 👤 Profiles Table (extends Supabase Auth Users)
model Profile {
  id         String     @id @default(uuid()) // Maps to auth.users.id
  email      String     @unique
  fullName   String
  role       Role       @default(COUPLE)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  registries Registry[]

  @@map("profiles")
}

// 👰🤵 Registry Table (The Wedding Gift List)
model Registry {
  id              String         @id @default(uuid())
  coupleId        String         @map("couple_id")
  couple          Profile        @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  title           String         // e.g., "Alice & Bob's Wedding Registry"
  weddingDate     DateTime       @map("wedding_date")
  location        String?
  slug            String         @unique // e.g., "alice-bob" -> resolves to hediyola.com/list/alice-bob
  story           String?        @db.Text
  coverImage      String?        @map("cover_image")
  avatarImage     String?        @map("avatar_image")
  passcode        String?        // Password protection for the list if private
  status          RegistryStatus @default(DRAFT)
  deliveryAddress String?        @map("delivery_address") // Hidden from guests
  bankName        String?        @map("bank_name")
  iban            String?        @map("iban")
  payoutName      String?        @map("payout_name") // Account owner name
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  items           RegistryItem[]
  orders          Order[]
  payouts         Payout[]

  @@map("registries")
}

// 📦 Catalog Products (Database of pre-selected items available for all couples)
model Product {
  id          String         @id @default(uuid())
  brand       String
  title       String
  description String?        @db.Text
  price       Decimal        @db.Decimal(10, 2)
  imageUrl    String         @map("image_url")
  category    String
  sku         String         @unique
  inStock     Boolean        @default(true) @map("in_stock")
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  registryItems RegistryItem[]

  @@map("products")
}

// 🏷 Registry Items (Specific items placed on a couple's registry)
model RegistryItem {
  id             String      @id @default(uuid())
  registryId     String      @map("registry_id")
  registry       Registry    @relation(fields: [registryId], references: [id], onDelete: Cascade)
  type           ItemType
  
  // If CATALOG item:
  productId      String?     @map("product_id")
  product        Product?    @relation(fields: [productId], references: [id], onDelete: SetNull)

  // Custom details (For CASH_FUND, CHARITY or CUSTOM links):
  title          String      // Custom fund title or external product name
  description    String?     @db.Text
  price          Decimal     @db.Decimal(10, 2) // Single unit price or incremental cost
  imageUrl       String?     @map("image_url")
  externalLink   String?     @map("external_link") // Scraping reference link

  // Target goals:
  qtyWanted      Int         @default(1) @map("qty_wanted") // 1 for cash funds/custom
  qtyReceived    Int         @default(0) @map("qty_received")
  
  // Cash funding tracking:
  targetAmount   Decimal?    @db.Decimal(10, 2) @map("target_amount") // For honeymoon fund limits
  amountReceived Decimal     @default(0) @db.Decimal(10, 2) @map("amount_received")
  
  isGroupGift    Boolean     @default(false) @map("is_group_gift") // Guest can buy a portion
  
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  orderItems     OrderItem[]

  @@map("registry_items")
}

// 🛒 Orders (Transactions made by Guests)
model Order {
  id              String      @id @default(uuid())
  registryId      String      @map("registry_id")
  registry        Registry    @relation(fields: [registryId], references: [id], onDelete: Cascade)
  guestName       String      @map("guest_name")
  guestEmail      String      @map("guest_email")
  guestMessage    String?     @db.Text @map("guest_message") // Love note
  status          OrderStatus @default(PENDING)
  totalAmount     Decimal     @db.Decimal(10, 2) @map("total_amount")
  paymentGateway  String      @map("payment_gateway") // "stripe" or "iyzico"
  paymentIntentId String      @unique @map("payment_intent_id") // ID from gateway
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]

  @@map("orders")
}

// 📋 Order Items (Specific gifts / fund contributions inside an order)
model OrderItem {
  id             String       @id @default(uuid())
  orderId        String       @map("order_id")
  order          Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)
  registryItemId String       @map("registry_item_id")
  registryItem   RegistryItem @relation(fields: [registryItemId], references: [id], onDelete: Restrict)
  quantity       Int          @default(1)
  amountPaid     Decimal      @db.Decimal(10, 2) @map("amount_paid") // Actual money contributed

  @@map("order_items")
}

// 💰 Payouts (Bank transfers from platform to the couple for cash funds)
model Payout {
  id             String       @id @default(uuid())
  registryId     String       @map("registry_id")
  registry       Registry     @relation(fields: [registryId], references: [id], onDelete: Cascade)
  amount         Decimal      @db.Decimal(10, 2)
  bankName       String       @map("bank_name")
  iban           String
  accountHolder  String       @map("account_holder")
  status         PayoutStatus @default(PENDING)
  rejectionReason String?     @map("rejection_reason")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@map("payouts")
}
```

---

## 🔑 Database Indexes & Triggers
1. **Indexes**:
   - `registries(slug)` - Crucial for fast lookup when guests navigate to a registry.
   - `registry_items(registry_id)` - Speeds up fetching items on a registry page.
   - `orders(registry_id, status)` - For displaying purchased orders in the couple's dashboard.
2. **Triggers**:
   - A Supabase trigger that copies a newly registered user from `auth.users` to the public `profiles` table to maintain integrity.
