CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE shelter_verification_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);

create table "user" (
    "id" text not null primary key,
    "name" text not null,
    "email" text not null unique,
    "emailVerified" boolean not null,
    "image" text,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null,
    "role" text,
    "banned" boolean,
    "banReason" text,
    "banExpires" timestamptz
);

create table "session" (
    "id" text not null primary key,
    "expiresAt" timestamptz not null,
    "token" text not null unique,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz not null,
    "ipAddress" text,
    "userAgent" text,
    "userId" text not null references "user" ("id") on delete cascade,
    "impersonatedBy" text
);

create table "account" (
    "id" text not null primary key,
    "accountId" text not null,
    "providerId" text not null,
    "userId" text not null references "user" ("id") on delete cascade,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamptz,
    "refreshTokenExpiresAt" timestamptz,
    "scope" text,
    "password" text,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz not null
);

create table "verification" (
    "id" text not null primary key,
    "identifier" text not null,
    "value" text not null,
    "expiresAt" timestamptz not null,
    "createdAt" timestamptz default CURRENT_TIMESTAMP not null,
    "updatedAt" timestamptz default CURRENT_TIMESTAMP not null
);

CREATE TABLE IF NOT EXISTS shelters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL UNIQUE REFERENCES "user" (id) ON DELETE CASCADE,
    verification_status shelter_verification_status NOT NULL DEFAULT 'PENDING',
    location GEOGRAPHY (Point, 4326) NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS 
$$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER update_shelters_updated_at
BEFORE UPDATE ON shelters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

create index "session_userId_idx" on "session" ("userId");

create index "account_userId_idx" on "account" ("userId");

create index "verification_identifier_idx" on "verification" ("identifier");

CREATE INDEX shelters_location_idx ON shelters USING GIST (location);