CREATE TABLE "Profile"(
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NULL,
    "created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updated" DATE NOT NULL
);
ALTER TABLE
    "Profile" ADD PRIMARY KEY("id");
ALTER TABLE
    "Profile" ADD CONSTRAINT "profile_username_unique" UNIQUE("username");
CREATE TABLE "Settings"(
    "id" BIGINT NOT NULL,
    "profile" BIGINT NOT NULL,
    "settings" jsonb NOT NULL,
    "updated" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
);
ALTER TABLE
    "Settings" ADD PRIMARY KEY("id");
CREATE TABLE "Themes"(
    "id" BIGINT NOT NULL,
    "profile" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NULL,
    "theme" jsonb NOT NULL,
    "likes" INTEGER NULL,
    "downloads" INTEGER NULL,
    "public" BOOLEAN NOT NULL,
    "created" TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
    "updated" DATE NOT NULL
);
ALTER TABLE
    "Themes" ADD PRIMARY KEY("id");
CREATE TABLE "Likes"(
    "id" BIGINT NOT NULL,
    "account" BIGINT NOT NULL,
    "theme" BIGINT NOT NULL,
    "updated" DATE NOT NULL
);
ALTER TABLE
    "Likes" ADD PRIMARY KEY("id");
ALTER TABLE
    "Likes" ADD CONSTRAINT "likes_account_unique" UNIQUE("account");
ALTER TABLE
    "Themes" ADD CONSTRAINT "themes_profile_foreign" FOREIGN KEY("profile") REFERENCES "Profile"("id");
ALTER TABLE
    "Settings" ADD CONSTRAINT "settings_profile_foreign" FOREIGN KEY("profile") REFERENCES "Profile"("id");
ALTER TABLE
    "Likes" ADD CONSTRAINT "likes_theme_foreign" FOREIGN KEY("theme") REFERENCES "Themes"("likes");
ALTER TABLE
    "Profile" ADD CONSTRAINT "profile_id_foreign" FOREIGN KEY("id") REFERENCES "Likes"("account");