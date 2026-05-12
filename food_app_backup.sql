--
-- PostgreSQL database dump
--

\restrict d8cNMOZD2OxcAYB1o9EaztHCbeyCaLbhZrg3Jn7heMWsdsBReLlKRzAqzVjJCGl

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ActivityLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ActivityLevel" AS ENUM (
    'SEDENTARY',
    'LIGHT',
    'MODERATE',
    'ACTIVE',
    'VERY_ACTIVE'
);


--
-- Name: Difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Difficulty" AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);


--
-- Name: GoalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GoalType" AS ENUM (
    'WEIGHT_LOSS',
    'WEIGHT_GAIN',
    'MAINTENANCE',
    'MUSCLE_GAIN'
);


--
-- Name: MealType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MealType" AS ENUM (
    'BREAKFAST',
    'LUNCH',
    'DINNER',
    'SNACK'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'INFO',
    'WARNING',
    'SUCCESS',
    'ERROR'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN',
    'MODERATOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    "userId" integer,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" integer,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    "sessionId" integer NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    intent text,
    entities jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_sessions (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title text DEFAULT 'Cuộc trò chuyện mới'::text NOT NULL,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chat_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chat_sessions_id_seq OWNED BY public.chat_sessions.id;


--
-- Name: daily_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_nutrition (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalCalories" integer DEFAULT 0 NOT NULL,
    "totalProtein" double precision DEFAULT 0 NOT NULL,
    "totalFat" double precision DEFAULT 0 NOT NULL,
    "totalCarbs" double precision DEFAULT 0 NOT NULL,
    "totalMeals" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: daily_nutrition_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_nutrition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_nutrition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_nutrition_id_seq OWNED BY public.daily_nutrition.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.favorites (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "foodId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: favorites_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.favorites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: favorites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.favorites_id_seq OWNED BY public.favorites.id;


--
-- Name: food_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_items (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    category text NOT NULL,
    description text,
    "imageUrl" text,
    calories integer NOT NULL,
    protein double precision NOT NULL,
    fat double precision NOT NULL,
    carbs double precision NOT NULL,
    fiber double precision,
    sugar double precision,
    popularity integer DEFAULT 0 NOT NULL,
    "isVegetarian" boolean DEFAULT false NOT NULL,
    "isVegan" boolean DEFAULT false NOT NULL,
    "isGlutenFree" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: food_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.food_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: food_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.food_items_id_seq OWNED BY public.food_items.id;


--
-- Name: meal_plan_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plan_details (
    id integer NOT NULL,
    "mealPlanId" integer NOT NULL,
    "foodId" integer NOT NULL,
    "mealType" public."MealType" NOT NULL,
    "dayOfWeek" integer NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL
);


--
-- Name: meal_plan_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meal_plan_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meal_plan_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meal_plan_details_id_seq OWNED BY public.meal_plan_details.id;


--
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plans (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    name text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: meal_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meal_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meal_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meal_plans_id_seq OWNED BY public.meal_plans.id;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meals (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "foodId" integer NOT NULL,
    "mealType" public."MealType" NOT NULL,
    "eatenAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    quantity double precision DEFAULT 1 NOT NULL,
    calories integer NOT NULL,
    protein double precision NOT NULL,
    fat double precision NOT NULL,
    carbs double precision NOT NULL,
    "imageUrl" text,
    notes text,
    "isFromAI" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: meals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.meals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: meals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.meals_id_seq OWNED BY public.meals.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'INFO'::public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    data jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "tokenHash" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "requestedIp" text,
    "requestedUserAgent" text,
    "usedIp" text,
    "usedUserAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ingredients (
    id integer NOT NULL,
    "recipeId" integer NOT NULL,
    name text NOT NULL,
    amount double precision NOT NULL,
    unit text NOT NULL,
    notes text,
    alternative text,
    "isOptional" boolean DEFAULT false NOT NULL,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_ingredients_id_seq OWNED BY public.recipe_ingredients.id;


--
-- Name: recipe_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_steps (
    id integer NOT NULL,
    "recipeId" integer NOT NULL,
    "stepNumber" integer NOT NULL,
    description text NOT NULL,
    timer integer,
    "imageUrl" text,
    tips text,
    "order" integer DEFAULT 0 NOT NULL
);


--
-- Name: recipe_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_steps_id_seq OWNED BY public.recipe_steps.id;


--
-- Name: recipe_tools; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_tools (
    id integer NOT NULL,
    "recipeId" integer NOT NULL,
    name text NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL
);


--
-- Name: recipe_tools_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_tools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipe_tools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_tools_id_seq OWNED BY public.recipe_tools.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    "foodId" integer NOT NULL,
    title text NOT NULL,
    summary text,
    "prepTime" integer NOT NULL,
    "cookTime" integer NOT NULL,
    "totalTime" integer NOT NULL,
    servings integer NOT NULL,
    difficulty public."Difficulty" NOT NULL,
    tips text,
    "nutritionNotes" text,
    "videoUrl" text,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "cookCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendations (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "foodId" integer NOT NULL,
    reason text NOT NULL,
    score double precision NOT NULL,
    "isViewed" boolean DEFAULT false NOT NULL,
    "isAccepted" boolean,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recommendations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recommendations_id_seq OWNED BY public.recommendations.id;


--
-- Name: review_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_replies (
    id integer NOT NULL,
    "reviewId" integer NOT NULL,
    "userId" integer NOT NULL,
    content text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: review_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.review_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: review_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.review_replies_id_seq OWNED BY public.review_replies.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "foodId" integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    images text[] DEFAULT ARRAY[]::text[],
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: scan_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scan_history (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "imageUrl" text,
    result jsonb NOT NULL,
    confidence double precision NOT NULL,
    "isConfirmed" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: scan_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scan_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: scan_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scan_history_id_seq OWNED BY public.scan_history.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "group" text DEFAULT 'general'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: user_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_goals (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "goalType" public."GoalType" NOT NULL,
    "targetWeight" double precision,
    "targetCalories" integer DEFAULT 2000 NOT NULL,
    "targetProtein" double precision DEFAULT 150 NOT NULL,
    "targetFat" double precision DEFAULT 55 NOT NULL,
    "targetCarbs" double precision DEFAULT 250 NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: user_goals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_goals_id_seq OWNED BY public.user_goals.id;


--
-- Name: user_health_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_health_metrics (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    weight double precision,
    height double precision,
    "bodyFat" double precision,
    "bloodPressure" text,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_health_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_health_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_health_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_health_metrics_id_seq OWNED BY public.user_health_metrics.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "fullName" text,
    avatar text,
    gender text,
    "dateOfBirth" timestamp(3) without time zone,
    height double precision,
    weight double precision,
    "activityLevel" public."ActivityLevel" DEFAULT 'MODERATE'::public."ActivityLevel" NOT NULL,
    "dietaryPref" text[] DEFAULT ARRAY[]::text[],
    allergies text[] DEFAULT ARRAY[]::text[],
    "targetCalories" integer DEFAULT 2000 NOT NULL,
    "targetProtein" double precision DEFAULT 150 NOT NULL,
    "targetFat" double precision DEFAULT 55 NOT NULL,
    "targetCarbs" double precision DEFAULT 250 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "passwordChangedAt" timestamp(3) without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weekly_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_reports (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "weekStart" timestamp(3) without time zone NOT NULL,
    "weekEnd" timestamp(3) without time zone NOT NULL,
    "avgCalories" double precision NOT NULL,
    "avgProtein" double precision NOT NULL,
    "avgFat" double precision NOT NULL,
    "avgCarbs" double precision NOT NULL,
    "reportData" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.weekly_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.weekly_reports_id_seq OWNED BY public.weekly_reports.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: chat_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions ALTER COLUMN id SET DEFAULT nextval('public.chat_sessions_id_seq'::regclass);


--
-- Name: daily_nutrition id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition ALTER COLUMN id SET DEFAULT nextval('public.daily_nutrition_id_seq'::regclass);


--
-- Name: favorites id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites ALTER COLUMN id SET DEFAULT nextval('public.favorites_id_seq'::regclass);


--
-- Name: food_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_items ALTER COLUMN id SET DEFAULT nextval('public.food_items_id_seq'::regclass);


--
-- Name: meal_plan_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_details ALTER COLUMN id SET DEFAULT nextval('public.meal_plan_details_id_seq'::regclass);


--
-- Name: meal_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans ALTER COLUMN id SET DEFAULT nextval('public.meal_plans_id_seq'::regclass);


--
-- Name: meals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals ALTER COLUMN id SET DEFAULT nextval('public.meals_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- Name: recipe_ingredients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients ALTER COLUMN id SET DEFAULT nextval('public.recipe_ingredients_id_seq'::regclass);


--
-- Name: recipe_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_steps ALTER COLUMN id SET DEFAULT nextval('public.recipe_steps_id_seq'::regclass);


--
-- Name: recipe_tools id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_tools ALTER COLUMN id SET DEFAULT nextval('public.recipe_tools_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: recommendations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations ALTER COLUMN id SET DEFAULT nextval('public.recommendations_id_seq'::regclass);


--
-- Name: review_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies ALTER COLUMN id SET DEFAULT nextval('public.review_replies_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: scan_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_history ALTER COLUMN id SET DEFAULT nextval('public.scan_history_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: user_goals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals ALTER COLUMN id SET DEFAULT nextval('public.user_goals_id_seq'::regclass);


--
-- Name: user_health_metrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_health_metrics ALTER COLUMN id SET DEFAULT nextval('public.user_health_metrics_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: weekly_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports ALTER COLUMN id SET DEFAULT nextval('public.weekly_reports_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
194eab9e-8178-4ca0-aac4-16ff12f454e5	0f8a34682e8511d2bd1635a09f690822fbb31c5ba8e9371966e5bb0cc2165315	2026-04-07 03:44:58.802999+00	20260401092855_init	\N	\N	2026-04-07 03:44:58.515378+00	1
f12b254d-35d0-4539-aee9-afe4f3c8998b	d149c7d73d615fde38459fa6d56acef490ec3e50b245b171f5defbe31f7438c1	2026-04-07 03:44:58.834763+00	20260402071717_add_system_settings	\N	\N	2026-04-07 03:44:58.806976+00	1
f4bead98-2ed5-4f49-9ab0-97ef8e6658b0	bd2125df72c68182ad89d1884446d32c4de0bcd5e730677aa9d5491982bdb4d2	2026-04-15 04:01:30.218734+00	20260415093000_add_password_reset_tokens	\N	\N	2026-04-15 04:01:30.124475+00	1
124c8e39-22bf-4fea-b1fa-f92ec3010880	b5a017c381d0cf56d782d0d03bab9f593964a7378260dad8cd571b558dc60924	2026-04-20 02:40:22.278002+00	20260420101500_add_review_replies	\N	\N	2026-04-20 02:40:22.221558+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
1	1	RESET_PASSWORD	FoodItem	4	\N	\N	192.168.1.138	\N	2026-03-08 18:43:32.236
2	1	CREATE_FOOD	UserProfile	84	\N	\N	192.168.1.213	\N	2026-03-08 08:35:52.257
3	1	UPDATE_FOOD	UserProfile	76	\N	\N	192.168.1.166	\N	2026-03-23 17:25:56.415
4	1	RESET_PASSWORD	FoodItem	89	\N	\N	192.168.1.59	\N	2026-03-23 10:27:06.721
5	1	RESET_PASSWORD	FoodItem	39	\N	\N	192.168.1.80	\N	2026-03-29 21:49:29.68
6	1	LOGIN	FoodItem	17	\N	\N	192.168.1.48	\N	2026-04-05 17:58:46.869
7	1	CREATE_FOOD	UserProfile	20	\N	\N	192.168.1.95	\N	2026-03-09 02:58:59.372
8	1	DELETE_USER	UserProfile	62	\N	\N	192.168.1.132	\N	2026-03-11 09:44:29.846
9	1	LOGIN	User	87	{"some": "old"}	\N	192.168.1.70	\N	2026-03-18 12:33:51.953
10	1	UPDATE_ROLE	UserProfile	33	{"some": "old"}	{"some": "new"}	192.168.1.164	\N	2026-03-17 01:29:13.938
11	1	LOGIN	UserProfile	99	\N	\N	192.168.1.19	\N	2026-03-31 03:13:08.902
12	1	UPDATE_ROLE	UserProfile	78	\N	\N	192.168.1.137	\N	2026-03-27 19:32:11.689
13	1	LOGIN	User	98	\N	\N	192.168.1.98	\N	2026-03-21 01:16:39.324
14	1	RESET_PASSWORD	User	44	\N	{"some": "new"}	192.168.1.134	\N	2026-03-12 23:20:10.421
15	1	DELETE_USER	UserProfile	12	\N	{"some": "new"}	192.168.1.159	\N	2026-03-28 14:13:32.332
16	1	TOGGLE_BAN	User	5	\N	{"isActive": true}	\N	\N	2026-04-07 04:04:31.95
17	1	TOGGLE_BAN	User	9	\N	{"isActive": true}	\N	\N	2026-04-07 04:04:37.197
18	1	UPDATE_ROLE	User	15	\N	{"role": "USER"}	\N	\N	2026-04-07 04:05:28.683
19	1	UPDATE_PROFILE	UserProfile	15	\N	{"height": 154.8968099382772, "weight": 96.64895061884066, "targetCalories": 2405}	\N	\N	2026-04-07 04:07:36.329
20	1	UPDATE_FOOD	FoodItem	1	{"name": "Phở bò"}	{"name": "Phở bò"}	\N	\N	2026-04-08 07:07:23.33
21	1	SEND_NOTIFICATION	Notification	80	\N	{"type": "INFO", "title": "Phản hồi đánh giá của bạn cho món Bún chả", "userId": 1, "message": "Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng góp ý của bạn."}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-08 07:40:59.143
22	1	UPDATE_FOOD	FoodItem	2	{"name": "Bún chả"}	{"name": "Bún chả"}	\N	\N	2026-04-08 07:57:38.394
23	1	UPDATE_FOOD	FoodItem	2	{"name": "Bún chả"}	{"name": "Bún chả"}	\N	\N	2026-04-08 08:01:56.149
24	1	UPDATE_FOOD	FoodItem	1	{"name": "Phở bò"}	{"name": "Phở bò"}	\N	\N	2026-04-08 08:20:24.368
25	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-08 08:56:04.785
26	3	LOGIN	User	3	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:21:21.798
27	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:33:41.902
28	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:43:28.069
29	16	REGISTER	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:43:52.699
30	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:45:05.44
31	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:45:19.723
32	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:45:37.638
33	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:53:44.537
34	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:54:47.728
35	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 02:54:59.756
36	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 03:00:59.587
37	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 03:13:08.251
38	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 03:13:23.572
39	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 03:13:34.954
40	1	SEND_NOTIFICATION_MULTIPLE	Notification	\N	\N	{"type": "INFO", "title": "Chào thành viên mới", "message": "Welcome!", "userIds": [16]}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 03:25:41.328
41	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 04:34:18.152
42	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 05:22:54.231
43	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 05:23:12.402
44	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 05:24:47.105
45	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 06:09:28.408
46	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 09:06:07.741
47	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 09:06:17.053
48	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-09 16:02:44.685
49	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-13 01:58:19.907
50	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-13 01:58:58.763
51	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-13 03:41:53.581
52	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-13 03:42:09.444
53	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 01:52:24.283
54	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 01:52:31.473
55	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 07:15:04.307
56	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 07:15:30.872
57	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 07:24:36.761
58	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 08:00:09.448
59	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 08:07:33.286
60	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0	2026-04-14 08:07:41.27
92	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 03:41:17.489
93	1	FORGOT_PASSWORD_REQUEST	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 04:06:33.783
94	1	RESET_PASSWORD	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 04:09:07.327
95	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 04:09:28.363
96	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 04:12:09.497
97	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 04:33:28.246
98	1	BOOTSTRAP_CHATBOT_TRAINING_DEFAULTS	SystemSetting	\N	\N	{"key": "chatbot_training_examples", "total": 200}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 06:15:07.974
99	1	BOOTSTRAP_CHATBOT_TRAINING_DEFAULTS	SystemSetting	\N	\N	{"key": "chatbot_training_examples", "total": 1000}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 06:18:03.401
100	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 08:36:11.637
101	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 08:36:21.315
102	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.7920	2026-04-15 08:39:16.482
103	1	UPDATE_CHATBOT_TRAINING	SystemSetting	\N	\N	{"key": "chatbot_training_examples", "total": 1000}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 09:12:13.448
104	16	UPDATE_PROFILE	UserProfile	17	\N	{"height": 155, "weight": 55, "fullName": "Le Thi Man", "goalType": "MAINTENANCE", "targetFat": 55, "targetCarbs": 250, "targetWeight": 54, "activityLevel": "LIGHT", "targetProtein": 150, "targetCalories": 2000}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 02:04:56.215
105	1	UPDATE_ROLE	User	2	\N	{"role": "USER"}	\N	\N	2026-04-20 03:03:42.786
106	1	CREATE_DB	Db	\N	\N	{"body": {"limit": 100, "query": "SELECT * FROM \\"public\\".\\"users\\" ORDER BY 1 DESC"}, "path": "/api/admin/db/query", "query": {}, "method": "POST", "params": {}, "durationMs": 14, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:25:19.829
107	1	SEND_NOTIFICATION	Notification	82	\N	{"type": "INFO", "title": "Phan hoi danh gia cho mon Phở bò", "userId": 16, "message": "Cam on ban da gui danh gia. Chung toi da ghi nhan va se tiep tuc cai tien."}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:28:41.334
108	16	UPDATE_NOTIFICATION	Notification	82	\N	{"body": {}, "path": "/api/notifications/82/read", "query": {}, "method": "PUT", "params": {"id": "82"}, "durationMs": 28, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:28:51.888
109	16	CREATE_SUPPORT	Support	\N	\N	{"body": {"title": "Ho tro khach hang"}, "path": "/api/support/sessions", "query": {}, "method": "POST", "params": {}, "durationMs": 53, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:51:16.752
110	16	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "HI ban"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 35, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:51:16.89
111	1	CREATE_SUPPORT	Support	\N	\N	{"body": {"title": "Ho tro khach hang"}, "path": "/api/support/sessions", "query": {}, "method": "POST", "params": {}, "durationMs": 19, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:51:22.98
155	1	DELETE_FOOD	FoodItem	33	{"name": "Bun bo Hue"}	\N	\N	\N	2026-04-20 08:51:12.418
112	1	CREATE_SUPPORT	Support	43	\N	{"body": {"content": "alo"}, "path": "/api/support/sessions/43/messages", "query": {}, "method": "POST", "params": {"id": "43"}, "durationMs": 24, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:51:23.032
113	16	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "hi"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 29, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:51:59.806
114	3	CREATE_SUPPORT	Support	\N	\N	{"body": {"title": "Ticket test"}, "path": "/api/support/sessions", "query": {}, "method": "POST", "params": {}, "durationMs": 20, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115	2026-04-20 03:54:27.403
115	3	CREATE_SUPPORT	Support	44	\N	{"body": {"content": "User gui test"}, "path": "/api/support/sessions/44/messages", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 23, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115	2026-04-20 03:54:27.633
116	1	CREATE_SUPPORT	Support	44	\N	{"body": {"content": "Admin phan hoi test"}, "path": "/api/support/sessions/44/messages", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 23, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8115	2026-04-20 03:54:27.692
117	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:57:38.208
118	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:57:51.983
119	16	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "hi"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 41, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:58:04.727
120	1	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "Chao ban! Ban co thac mac gi khong"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 42, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:58:45.798
121	1	UPDATE_SUPPORT	Support	42	\N	{"body": {"status": "SUPPORT_CLOSED"}, "path": "/api/support/sessions/42/status", "query": {}, "method": "PUT", "params": {"id": "42"}, "durationMs": 25, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:59:09.393
122	1	UPDATE_SUPPORT	Support	44	\N	{"body": {"status": "SUPPORT_CLOSED"}, "path": "/api/support/sessions/44/status", "query": {}, "method": "PUT", "params": {"id": "44"}, "durationMs": 17, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:59:17.199
123	1	UPDATE_SUPPORT	Support	43	\N	{"body": {"status": "SUPPORT_CLOSED"}, "path": "/api/support/sessions/43/status", "query": {}, "method": "PUT", "params": {"id": "43"}, "durationMs": 20, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 03:59:20.312
124	16	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "Fixx"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 55, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 04:04:13.938
125	16	CREATE_SUPPORT	Support	42	\N	{"body": {"content": "hii"}, "path": "/api/support/sessions/42/messages", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 53, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 04:11:30.201
126	16	CREATE_MEAL	Meal	\N	\N	{"body": {"foodId": 11, "eatenAt": "2026-04-19T12:00:00", "mealType": "BREAKFAST", "quantity": 0.5}, "path": "/api/meals", "query": {}, "method": "POST", "params": {}, "durationMs": 1201, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:23:12.042
127	16	CREATE_MEAL	Meal	\N	\N	{"body": {"foodId": 3, "eatenAt": "2026-04-19T12:00:00", "mealType": "LUNCH", "quantity": 1}, "path": "/api/meals", "query": {}, "method": "POST", "params": {}, "durationMs": 241, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:23:36.986
128	16	CREATE_MEAL	Meal	\N	\N	{"body": {"foodId": 29, "eatenAt": "2026-04-19T12:00:00", "mealType": "LUNCH", "quantity": 0.5}, "path": "/api/meals", "query": {}, "method": "POST", "params": {}, "durationMs": 74, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:01.565
129	16	CREATE_MEAL	Meal	\N	\N	{"body": {"foodId": 25, "eatenAt": "2026-04-19T12:00:00", "mealType": "DINNER", "quantity": 0.5}, "path": "/api/meals", "query": {}, "method": "POST", "params": {}, "durationMs": 128, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:18.614
130	16	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 23, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:44.586
131	16	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 21, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:44.709
132	16	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 25, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:44.907
133	16	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 28, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 06:24:45.142
134	16	CREATE_CHAT	Chat	41	\N	{"body": {"content": "Tôi muốn giảm cân thì ăn uống như nào?"}, "path": "/api/chat/sessions/41/messages", "query": {}, "method": "POST", "params": {"id": "41"}, "durationMs": 2482, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 07:12:36.895
135	1	CREATE_CHAT	Chat	\N	\N	{"body": {"question": "Toi bi tieu duong type 2, bua toi nen an gi?"}, "path": "/api/chat/quick", "query": {}, "method": "POST", "params": {}, "durationMs": 1869, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 07:13:44.284
136	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:14:22.392
137	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:14:41.904
138	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 283, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:15:50.596
139	2	DELETE_MEALPLAN	MealPlan	6	\N	{"body": {}, "path": "/api/meal-plans/6", "query": {}, "method": "DELETE", "params": {"id": "6"}, "durationMs": 23, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:23:58.04
140	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 115, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:24:01.152
141	2	DELETE_MEALPLAN	MealPlan	7	\N	{"body": {}, "path": "/api/meal-plans/7", "query": {}, "method": "DELETE", "params": {"id": "7"}, "durationMs": 33, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:27:54.073
142	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 156, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:28:00.484
143	2	DELETE_MEALPLAN	MealPlan	8	\N	{"body": {}, "path": "/api/meal-plans/8", "query": {}, "method": "DELETE", "params": {"id": "8"}, "durationMs": 22, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:29:34.346
144	2	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 154, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:29:45.628
145	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 119, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:30:16.355
146	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 107, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:30:30.588
147	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 20, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:30:43.83
148	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 18, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:30:43.986
149	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 25, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:30:44.16
150	2	CREATE_FOODITEM	FoodItem	31	\N	{"body": {}, "path": "/api/foods/31/upload-image", "query": {}, "method": "POST", "params": {"id": "31"}, "durationMs": 337, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:49:11.86
151	1	UPDATE_FOOD	FoodItem	31	{"name": "Pho bo"}	{"name": "Phở bo"}	\N	\N	2026-04-20 08:49:37.774
152	1	DELETE_FOOD	FoodItem	31	{"name": "Phở bo"}	\N	\N	\N	2026-04-20 08:49:43.312
153	2	CREATE_FOODITEM	FoodItem	32	\N	{"body": {}, "path": "/api/foods/32/upload-image", "query": {}, "method": "POST", "params": {"id": "32"}, "durationMs": 245, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 08:50:32.112
154	1	UPDATE_FOOD	FoodItem	32	{"name": "Pho ga"}	{"name": "Phở gà"}	\N	\N	2026-04-20 08:50:49.622
156	1	DELETE_FOOD	FoodItem	34	{"name": "Bun cha"}	\N	\N	\N	2026-04-20 08:51:27.351
157	1	DELETE_FOOD	FoodItem	56	{"name": "Bun rieu"}	\N	\N	\N	2026-04-20 09:09:27.262
158	1	DELETE_FOOD	FoodItem	59	{"name": "Mi tom rau bo"}	\N	\N	\N	2026-04-20 09:12:38.666
159	1	DELETE_FOOD	FoodItem	62	{"name": "Ca salmon ap chao"}	\N	\N	\N	2026-04-20 09:12:45.36
160	1	UPDATE_SUPPORT	Support	42	\N	{"body": {"status": "SUPPORT_CLOSED"}, "path": "/api/support/sessions/42/status", "query": {}, "method": "PUT", "params": {"id": "42"}, "durationMs": 59, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:27:53.877
161	1	UPDATE_FOOD	FoodItem	35	{"name": "Banh mi trung"}	{"name": "Bánh mì trứng"}	\N	\N	2026-04-20 09:32:33.533
162	2	CREATE_FOODITEM	FoodItem	35	\N	{"body": {}, "path": "/api/foods/35/upload-image", "query": {}, "method": "POST", "params": {"id": "35"}, "durationMs": 150, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:32:44.086
163	1	UPDATE_FOOD	FoodItem	36	{"name": "Banh mi ga nuong"}	{"name": "Bánh mì gà nướng"}	\N	\N	2026-04-20 09:33:09.848
164	2	CREATE_FOODITEM	FoodItem	36	\N	{"body": {}, "path": "/api/foods/36/upload-image", "query": {}, "method": "POST", "params": {"id": "36"}, "durationMs": 170, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:33:19.582
165	2	CREATE_FOODITEM	FoodItem	37	\N	{"body": {}, "path": "/api/foods/37/upload-image", "query": {}, "method": "POST", "params": {"id": "37"}, "durationMs": 124, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:33:41.204
166	1	UPDATE_FOOD	FoodItem	37	{"name": "Com tam suon"}	{"name": "Cơm tấm sườn"}	\N	\N	2026-04-20 09:34:01.011
167	1	UPDATE_FOOD	FoodItem	38	{"name": "Com ga luoc"}	{"name": "Cơm gà luộc"}	\N	\N	2026-04-20 09:34:23.453
168	2	CREATE_FOODITEM	FoodItem	38	\N	{"body": {}, "path": "/api/foods/38/upload-image", "query": {}, "method": "POST", "params": {"id": "38"}, "durationMs": 210, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:35:40.151
169	2	CREATE_FOODITEM	FoodItem	39	\N	{"body": {}, "path": "/api/foods/39/upload-image", "query": {}, "method": "POST", "params": {"id": "39"}, "durationMs": 212, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:36:32.156
170	1	UPDATE_FOOD	FoodItem	39	{"name": "Com ga nuong"}	{"name": "Cơm gà nướng"}	\N	\N	2026-04-20 09:36:43.889
171	1	UPDATE_FOOD	FoodItem	40	{"name": "Com bo xao"}	{"name": "Cơm thịt bò xào"}	\N	\N	2026-04-20 09:38:09.574
172	2	CREATE_FOODITEM	FoodItem	40	\N	{"body": {}, "path": "/api/foods/40/upload-image", "query": {}, "method": "POST", "params": {"id": "40"}, "durationMs": 192, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:38:15.323
173	2	CREATE_FOODITEM	FoodItem	41	\N	{"body": {}, "path": "/api/foods/41/upload-image", "query": {}, "method": "POST", "params": {"id": "41"}, "durationMs": 155, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:38:28.313
174	1	UPDATE_FOOD	FoodItem	41	{"name": "Canh chua ca"}	{"name": "Canh chua cá"}	\N	\N	2026-04-20 09:38:45.097
175	2	CREATE_FOODITEM	FoodItem	42	\N	{"body": {}, "path": "/api/foods/42/upload-image", "query": {}, "method": "POST", "params": {"id": "42"}, "durationMs": 201, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:39:04.812
176	1	UPDATE_FOOD	FoodItem	42	{"name": "Canh bi do"}	{"name": "Canh bí đỏ"}	\N	\N	2026-04-20 09:39:14.805
177	1	UPDATE_FOOD	FoodItem	43	{"name": "Canh cai xanh"}	{"name": "Canh cải xanh"}	\N	\N	2026-04-20 09:39:32.793
178	2	CREATE_FOODITEM	FoodItem	43	\N	{"body": {}, "path": "/api/foods/43/upload-image", "query": {}, "method": "POST", "params": {"id": "43"}, "durationMs": 115, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:39:42.67
179	1	UPDATE_FOOD	FoodItem	66	{"name": "Thit bo nuong"}	{"name": "Thịt bò nướng"}	\N	\N	2026-04-20 09:40:17.214
180	2	CREATE_FOODITEM	FoodItem	66	\N	{"body": {}, "path": "/api/foods/66/upload-image", "query": {}, "method": "POST", "params": {"id": "66"}, "durationMs": 123, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:40:24.709
181	1	UPDATE_FOOD	FoodItem	65	{"name": "Thit heo luoc"}	{"name": "Thịt heo luộc"}	\N	\N	2026-04-20 09:40:42.909
182	2	CREATE_FOODITEM	FoodItem	65	\N	{"body": {}, "path": "/api/foods/65/upload-image", "query": {}, "method": "POST", "params": {"id": "65"}, "durationMs": 58, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:40:54.512
183	1	UPDATE_FOOD	FoodItem	64	{"name": "Tom xao bong cai"}	{"name": "Tôm xào bông cải"}	\N	\N	2026-04-20 09:41:26.535
184	2	CREATE_FOODITEM	FoodItem	64	\N	{"body": {}, "path": "/api/foods/64/upload-image", "query": {}, "method": "POST", "params": {"id": "64"}, "durationMs": 205, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:41:33.955
185	1	UPDATE_FOOD	FoodItem	63	{"name": "Tom hap"}	{"name": "Tôm hấp"}	\N	\N	2026-04-20 09:41:51.933
186	2	CREATE_FOODITEM	FoodItem	63	\N	{"body": {}, "path": "/api/foods/63/upload-image", "query": {}, "method": "POST", "params": {"id": "63"}, "durationMs": 120, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:42:00.561
187	1	UPDATE_FOOD	FoodItem	61	{"name": "Ca thu kho"}	{"name": "Cá thu kho"}	\N	\N	2026-04-20 09:42:17.57
188	2	CREATE_FOODITEM	FoodItem	61	\N	{"body": {}, "path": "/api/foods/61/upload-image", "query": {}, "method": "POST", "params": {"id": "61"}, "durationMs": 189, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:42:25.153
190	2	CREATE_FOODITEM	FoodItem	60	\N	{"body": {}, "path": "/api/foods/60/upload-image", "query": {}, "method": "POST", "params": {"id": "60"}, "durationMs": 180, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:42:57.122
193	2	CREATE_FOODITEM	FoodItem	57	\N	{"body": {}, "path": "/api/foods/57/upload-image", "query": {}, "method": "POST", "params": {"id": "57"}, "durationMs": 70, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:43:29.916
195	2	CREATE_FOODITEM	FoodItem	55	\N	{"body": {}, "path": "/api/foods/55/upload-image", "query": {}, "method": "POST", "params": {"id": "55"}, "durationMs": 158, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:44:01.948
197	2	CREATE_FOODITEM	FoodItem	54	\N	{"body": {}, "path": "/api/foods/54/upload-image", "query": {}, "method": "POST", "params": {"id": "54"}, "durationMs": 101, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:44:26.212
199	2	CREATE_FOODITEM	FoodItem	53	\N	{"body": {}, "path": "/api/foods/53/upload-image", "query": {}, "method": "POST", "params": {"id": "53"}, "durationMs": 93, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:45:09.53
201	2	CREATE_FOODITEM	FoodItem	52	\N	{"body": {}, "path": "/api/foods/52/upload-image", "query": {}, "method": "POST", "params": {"id": "52"}, "durationMs": 75, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:45:44.899
189	1	UPDATE_FOOD	FoodItem	60	{"name": "Mi xao hai san"}	{"name": "Mì xào hải sản"}	\N	\N	2026-04-20 09:42:47.811
191	1	DELETE_FOOD	FoodItem	58	{"name": "Mi quang"}	\N	\N	\N	2026-04-20 09:43:10.277
192	1	UPDATE_FOOD	FoodItem	57	{"name": "Bun ca"}	{"name": "Bún cá"}	\N	\N	2026-04-20 09:43:22.884
194	1	UPDATE_FOOD	FoodItem	55	{"name": "Hu tieu nam vang"}	{"name": "Hủ tiếu nam vang"}	\N	\N	2026-04-20 09:43:56.37
196	1	UPDATE_FOOD	FoodItem	54	{"name": "Mien ga"}	{"name": "Miến gà"}	\N	\N	2026-04-20 09:44:19.962
198	1	UPDATE_FOOD	FoodItem	53	{"name": "Com gao lut uc ga"}	{"name": "Cơm gạo lứt ứt gà"}	\N	\N	2026-04-20 09:44:54.132
200	1	UPDATE_FOOD	FoodItem	52	{"name": "Com gao lut ca hoi"}	{"name": "Cơm gạo lứt cá hồi"}	\N	\N	2026-04-20 09:45:36.61
202	1	UPDATE_FOOD	FoodItem	51	{"name": "Khoai tay nuong"}	{"name": "Khoai tây nướng"}	\N	\N	2026-04-20 09:46:23.93
203	2	CREATE_FOODITEM	FoodItem	51	\N	{"body": {}, "path": "/api/foods/51/upload-image", "query": {}, "method": "POST", "params": {"id": "51"}, "durationMs": 106, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:46:34.273
204	1	UPDATE_FOOD	FoodItem	50	{"name": "Khoai lang luoc"}	{"name": "Khoai lang luộc"}	\N	\N	2026-04-20 09:46:56.495
205	2	CREATE_FOODITEM	FoodItem	50	\N	{"body": {}, "path": "/api/foods/50/upload-image", "query": {}, "method": "POST", "params": {"id": "50"}, "durationMs": 54, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:47:08.978
206	1	UPDATE_FOOD	FoodItem	49	{"name": "Chao yach mach"}	{"name": "Cháo yến mạch"}	\N	\N	2026-04-20 09:47:34.927
207	2	CREATE_FOODITEM	FoodItem	49	\N	{"body": {}, "path": "/api/foods/49/upload-image", "query": {}, "method": "POST", "params": {"id": "49"}, "durationMs": 77, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:47:41.557
208	2	CREATE_FOODITEM	FoodItem	48	\N	{"body": {}, "path": "/api/foods/48/upload-image", "query": {}, "method": "POST", "params": {"id": "48"}, "durationMs": 180, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:48:00.745
209	1	UPDATE_FOOD	FoodItem	48	{"name": "Yen mach sua chua"}	{"name": "Sữa chua yến mạch"}	\N	\N	2026-04-20 09:48:35.368
210	1	UPDATE_FOOD	FoodItem	47	{"name": "Salad ca ngu"}	{"name": "Salad cá ngừ"}	\N	\N	2026-04-20 09:49:01.531
211	2	CREATE_FOODITEM	FoodItem	47	\N	{"body": {}, "path": "/api/foods/47/upload-image", "query": {}, "method": "POST", "params": {"id": "47"}, "durationMs": 122, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:49:31.353
212	1	UPDATE_FOOD	FoodItem	46	{"name": "Salad uc ga"}	{"name": "Salad ức gà"}	\N	\N	2026-04-20 09:49:50.362
213	2	CREATE_FOODITEM	FoodItem	46	\N	{"body": {}, "path": "/api/foods/46/upload-image", "query": {}, "method": "POST", "params": {"id": "46"}, "durationMs": 101, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:49:59.722
214	1	UPDATE_FOOD	FoodItem	45	{"name": "Ga hap gung"}	{"name": "Gà hấp gừng"}	\N	\N	2026-04-20 09:50:20.17
215	2	CREATE_FOODITEM	FoodItem	45	\N	{"body": {}, "path": "/api/foods/45/upload-image", "query": {}, "method": "POST", "params": {"id": "45"}, "durationMs": 182, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:50:27.474
216	1	UPDATE_FOOD	FoodItem	44	{"name": "Ga ap chao"}	{"name": "Gà áp chảo"}	\N	\N	2026-04-20 09:50:53.411
217	2	CREATE_FOODITEM	FoodItem	44	\N	{"body": {}, "path": "/api/foods/44/upload-image", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 105, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 09:50:59.818
218	1	UPDATE_FOOD	FoodItem	3	{"name": "Cơm tấm"}	{"name": "Cơm tấm"}	\N	\N	2026-04-20 09:51:50.189
219	1	UPDATE_FOOD	FoodItem	4	{"name": "Bánh mì"}	{"name": "Bánh mì"}	\N	\N	2026-04-20 09:52:04.188
220	1	UPDATE_FOOD	FoodItem	5	{"name": "Gỏi cuốn"}	{"name": "Gỏi cuốn"}	\N	\N	2026-04-20 09:52:24.512
221	1	UPDATE_FOOD	FoodItem	6	{"name": "Bún bò Huế"}	{"name": "Bún bò Huế"}	\N	\N	2026-04-20 09:52:39.475
222	1	UPDATE_FOOD	FoodItem	7	{"name": "Cháo lòng"}	{"name": "Cháo lòng"}	\N	\N	2026-04-20 09:52:55.413
223	1	UPDATE_FOOD	FoodItem	8	{"name": "Xôi xéo"}	{"name": "Xôi xéo"}	\N	\N	2026-04-20 09:53:08.501
224	1	UPDATE_FOOD	FoodItem	20	{"name": "Bánh bột lọc"}	{"name": "Bánh bột lọc"}	\N	\N	2026-04-20 09:53:29.881
225	1	UPDATE_FOOD	FoodItem	19	{"name": "Lẩu Thái"}	{"name": "Lẩu Thái"}	\N	\N	2026-04-20 09:53:50.509
226	1	UPDATE_FOOD	FoodItem	18	{"name": "Cà ri gà"}	{"name": "Cà ri gà"}	\N	\N	2026-04-20 09:54:03.317
227	1	UPDATE_FOOD	FoodItem	10	{"name": "Hủ tiếu"}	{"name": "Hủ tiếu"}	\N	\N	2026-04-20 09:54:17.307
228	1	UPDATE_FOOD	FoodItem	11	{"name": "Bánh cuốn"}	{"name": "Bánh cuốn"}	\N	\N	2026-04-20 09:54:31.298
229	1	UPDATE_FOOD	FoodItem	12	{"name": "Bún riêu"}	{"name": "Bún riêu"}	\N	\N	2026-04-20 09:54:43.278
230	1	UPDATE_FOOD	FoodItem	13	{"name": "Mì Quảng"}	{"name": "Mì Quảng"}	\N	\N	2026-04-20 09:54:58.789
231	1	UPDATE_FOOD	FoodItem	14	{"name": "Cao lầu"}	{"name": "Cao lầu"}	\N	\N	2026-04-20 09:55:28.892
232	1	UPDATE_FOOD	FoodItem	15	{"name": "Bánh canh"}	{"name": "Bánh canh"}	\N	\N	2026-04-20 09:55:46.316
233	1	UPDATE_FOOD	FoodItem	16	{"name": "Chả giò"}	{"name": "Chả giò"}	\N	\N	2026-04-20 09:55:59.266
234	1	UPDATE_FOOD	FoodItem	17	{"name": "Bò kho"}	{"name": "Bò kho"}	\N	\N	2026-04-20 09:56:19.291
235	1	UPDATE_FOOD	FoodItem	18	{"name": "Cà ri gà"}	{"name": "Cà ri gà"}	\N	\N	2026-04-20 09:56:32.098
286	1	UPDATE_FOOD	FoodItem	76	{"name": "Sinh to chuoi"}	{"name": "Sinh tố chuối"}	\N	\N	2026-04-21 06:33:14.555
236	2	UPDATE_NOTIFICATION	Notification	\N	\N	{"body": {}, "path": "/api/notifications/read-all", "query": {}, "method": "PUT", "params": {}, "durationMs": 133, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 10:04:54.968
237	2	CREATE_CHAT	Chat	6	\N	{"body": {"content": "Tôi muốn giảm cân thì nên ăn uống và tập luyện như thế nào"}, "path": "/api/chat/sessions/6/messages", "query": {}, "method": "POST", "params": {"id": "6"}, "durationMs": 3544, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-20 10:25:11.222
238	2	CREATE_CHAT	Chat	6	\N	{"body": {"content": "Goi y bua an giam can hom nay"}, "path": "/api/chat/sessions/6/messages", "query": {}, "method": "POST", "params": {"id": "6"}, "durationMs": 2218, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:06:07.819
239	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 95, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:06:55.239
240	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 25, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:07:05.126
241	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 16, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:07:05.306
242	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 17, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:07:05.466
243	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 14, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:07:05.643
244	2	CREATE_WEEKLYREPORT	WeeklyReport	\N	\N	{"body": {}, "path": "/api/weekly-reports/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 84, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:07:23.681
245	2	CREATE_ANALYZE	Analyze	\N	\N	{"body": {}, "path": "/api/analyze", "query": {}, "method": "POST", "params": {}, "durationMs": 4593, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 02:51:51.847
246	1	DELETE_NOTIFICATION	Notification	62	\N	{"body": {}, "path": "/api/admin/notifications/62", "query": {}, "method": "DELETE", "params": {"id": "62"}, "durationMs": 59, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:23.424
247	1	DELETE_NOTIFICATION	Notification	71	\N	{"body": {}, "path": "/api/admin/notifications/71", "query": {}, "method": "DELETE", "params": {"id": "71"}, "durationMs": 16, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:24.88
248	1	DELETE_NOTIFICATION	Notification	72	\N	{"body": {}, "path": "/api/admin/notifications/72", "query": {}, "method": "DELETE", "params": {"id": "72"}, "durationMs": 18, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:25.736
249	1	DELETE_NOTIFICATION	Notification	74	\N	{"body": {}, "path": "/api/admin/notifications/74", "query": {}, "method": "DELETE", "params": {"id": "74"}, "durationMs": 12, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:26.925
250	1	DELETE_NOTIFICATION	Notification	75	\N	{"body": {}, "path": "/api/admin/notifications/75", "query": {}, "method": "DELETE", "params": {"id": "75"}, "durationMs": 14, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:27.48
251	1	DELETE_NOTIFICATION	Notification	76	\N	{"body": {}, "path": "/api/admin/notifications/76", "query": {}, "method": "DELETE", "params": {"id": "76"}, "durationMs": 14, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:28.061
252	1	DELETE_NOTIFICATION	Notification	69	\N	{"body": {}, "path": "/api/admin/notifications/69", "query": {}, "method": "DELETE", "params": {"id": "69"}, "durationMs": 19, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:28.645
253	1	DELETE_NOTIFICATION	Notification	73	\N	{"body": {}, "path": "/api/admin/notifications/73", "query": {}, "method": "DELETE", "params": {"id": "73"}, "durationMs": 16, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:29.218
254	1	DELETE_NOTIFICATION	Notification	68	\N	{"body": {}, "path": "/api/admin/notifications/68", "query": {}, "method": "DELETE", "params": {"id": "68"}, "durationMs": 16, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:29.817
315	1	UPDATE_FOOD	FoodItem	109	{"name": "Com rong bien ca hoi"}	{"name": "Cơm rong biển cá hồi"}	\N	\N	2026-04-21 06:55:37.394
317	1	UPDATE_FOOD	FoodItem	108	{"name": "Chao ca hoi"}	{"name": "Cháo cá hồi"}	\N	\N	2026-04-21 06:55:59.685
255	1	DELETE_NOTIFICATION	Notification	70	\N	{"body": {}, "path": "/api/admin/notifications/70", "query": {}, "method": "DELETE", "params": {"id": "70"}, "durationMs": 21, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:30.425
256	1	DELETE_NOTIFICATION	Notification	65	\N	{"body": {}, "path": "/api/admin/notifications/65", "query": {}, "method": "DELETE", "params": {"id": "65"}, "durationMs": 15, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:30.981
257	1	DELETE_NOTIFICATION	Notification	66	\N	{"body": {}, "path": "/api/admin/notifications/66", "query": {}, "method": "DELETE", "params": {"id": "66"}, "durationMs": 25, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:31.547
258	1	DELETE_NOTIFICATION	Notification	67	\N	{"body": {}, "path": "/api/admin/notifications/67", "query": {}, "method": "DELETE", "params": {"id": "67"}, "durationMs": 17, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:32.595
259	1	DELETE_NOTIFICATION	Notification	63	\N	{"body": {}, "path": "/api/admin/notifications/63", "query": {}, "method": "DELETE", "params": {"id": "63"}, "durationMs": 17, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 03:52:33.816
260	2	CREATE_WEEKLYREPORT	WeeklyReport	\N	\N	{"body": {}, "path": "/api/weekly-reports/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 412, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 04:01:44.204
261	1	UPDATE_ROLE	User	2	\N	{"role": "MODERATOR"}	\N	\N	2026-04-21 04:39:57.825
262	2	CREATE_FOODITEM	FoodItem	67	\N	{"body": {}, "path": "/api/foods/67/upload-image", "query": {}, "method": "POST", "params": {"id": "67"}, "durationMs": 290, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:12:57.579
263	1	UPDATE_FOOD	FoodItem	67	{"name": "Dau hu sot ca chua"}	{"name": "Đậu hũ sốt cà chua"}	\N	\N	2026-04-21 06:13:22.986
264	1	DELETE_FOOD	FoodItem	81	{"name": "Banh xeo"}	\N	\N	\N	2026-04-21 06:17:11.644
265	1	DELETE_FOOD	FoodItem	80	{"name": "Banh cuon"}	\N	\N	\N	2026-04-21 06:17:14.48
266	1	DELETE_FOOD	FoodItem	89	{"name": "Bun thit nuong"}	\N	\N	\N	2026-04-21 06:19:19.049
267	1	DELETE_FOOD	FoodItem	90	{"name": "Bun mam"}	\N	\N	\N	2026-04-21 06:19:22.228
268	2	CREATE_FOODITEM	FoodItem	68	\N	{"body": {}, "path": "/api/foods/68/upload-image", "query": {}, "method": "POST", "params": {"id": "68"}, "durationMs": 178, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:28:24.129
269	1	UPDATE_FOOD	FoodItem	68	{"name": "Dau hu xao nam"}	{"name": "Đậu hũ xào nấm"}	\N	\N	2026-04-21 06:28:45.598
270	2	CREATE_FOODITEM	FoodItem	69	\N	{"body": {}, "path": "/api/foods/69/upload-image", "query": {}, "method": "POST", "params": {"id": "69"}, "durationMs": 223, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:28:54.865
271	1	UPDATE_FOOD	FoodItem	69	{"name": "Rau muong xao toi"}	{"name": "Rau muốn xào tỏi"}	\N	\N	2026-04-21 06:29:12.97
272	2	CREATE_FOODITEM	FoodItem	70	\N	{"body": {}, "path": "/api/foods/70/upload-image", "query": {}, "method": "POST", "params": {"id": "70"}, "durationMs": 158, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:29:25.416
273	1	UPDATE_FOOD	FoodItem	70	{"name": "Rau cai luoc"}	{"name": "Rau cải luộc"}	\N	\N	2026-04-21 06:29:45.963
274	2	CREATE_FOODITEM	FoodItem	71	\N	{"body": {}, "path": "/api/foods/71/upload-image", "query": {}, "method": "POST", "params": {"id": "71"}, "durationMs": 124, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:29:54.173
275	1	UPDATE_FOOD	FoodItem	71	{"name": "Bong cai hap"}	{"name": "Bông cải hấp"}	\N	\N	2026-04-21 06:30:26.524
276	2	CREATE_FOODITEM	FoodItem	72	\N	{"body": {}, "path": "/api/foods/72/upload-image", "query": {}, "method": "POST", "params": {"id": "72"}, "durationMs": 137, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:30:34.915
277	1	UPDATE_FOOD	FoodItem	72	{"name": "Trung op la"}	{"name": "Trứng ốp la"}	\N	\N	2026-04-21 06:30:51.901
278	2	CREATE_FOODITEM	FoodItem	73	\N	{"body": {}, "path": "/api/foods/73/upload-image", "query": {}, "method": "POST", "params": {"id": "73"}, "durationMs": 62, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:31:01.069
279	1	UPDATE_FOOD	FoodItem	73	{"name": "Trung cuon rau"}	{"name": "Trứng cuộn rau"}	\N	\N	2026-04-21 06:31:30.225
280	2	CREATE_FOODITEM	FoodItem	74	\N	{"body": {}, "path": "/api/foods/74/upload-image", "query": {}, "method": "POST", "params": {"id": "74"}, "durationMs": 148, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:31:39.201
281	1	UPDATE_FOOD	FoodItem	74	{"name": "Sua chua hat chia"}	{"name": "Sữa chua hạt chia"}	\N	\N	2026-04-21 06:32:03.901
282	1	UPDATE_FOOD	FoodItem	74	{"name": "Sữa chua hạt chia"}	{"name": "Sữa chua hạt chia"}	\N	\N	2026-04-21 06:32:08.87
283	2	CREATE_FOODITEM	FoodItem	75	\N	{"body": {}, "path": "/api/foods/75/upload-image", "query": {}, "method": "POST", "params": {"id": "75"}, "durationMs": 67, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:32:16.967
284	1	UPDATE_FOOD	FoodItem	75	{"name": "Sinh to bo"}	{"name": "Sinh tố bơ"}	\N	\N	2026-04-21 06:32:43.893
285	2	CREATE_FOODITEM	FoodItem	76	\N	{"body": {}, "path": "/api/foods/76/upload-image", "query": {}, "method": "POST", "params": {"id": "76"}, "durationMs": 124, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:32:52.674
287	2	CREATE_FOODITEM	FoodItem	77	\N	{"body": {}, "path": "/api/foods/77/upload-image", "query": {}, "method": "POST", "params": {"id": "77"}, "durationMs": 86, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:33:25.209
288	1	UPDATE_FOOD	FoodItem	77	{"name": "Chao ga rau cu"}	{"name": "Cháo gà rau củ"}	\N	\N	2026-04-21 06:33:53.047
289	2	CREATE_FOODITEM	FoodItem	78	\N	{"body": {}, "path": "/api/foods/78/upload-image", "query": {}, "method": "POST", "params": {"id": "78"}, "durationMs": 123, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:34:02.716
290	1	UPDATE_FOOD	FoodItem	78	{"name": "Sup bi do ga"}	{"name": "Súp bí đỏ"}	\N	\N	2026-04-21 06:34:18.171
291	2	CREATE_FOODITEM	FoodItem	79	\N	{"body": {}, "path": "/api/foods/79/upload-image", "query": {}, "method": "POST", "params": {"id": "79"}, "durationMs": 59, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:34:37.539
292	1	UPDATE_FOOD	FoodItem	79	{"name": "Sup rau cu bo"}	{"name": "Súp rau củ"}	\N	\N	2026-04-21 06:34:54.7
293	2	CREATE_FOODITEM	FoodItem	82	\N	{"body": {}, "path": "/api/foods/82/upload-image", "query": {}, "method": "POST", "params": {"id": "82"}, "durationMs": 87, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:36:21.554
294	1	UPDATE_FOOD	FoodItem	82	{"name": "Goi cuon tom thit"}	{"name": "Gỏi cuốn tôm thịt"}	\N	\N	2026-04-21 06:36:41.268
295	2	CREATE_FOODITEM	FoodItem	83	\N	{"body": {}, "path": "/api/foods/83/upload-image", "query": {}, "method": "POST", "params": {"id": "83"}, "durationMs": 76, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:36:55.293
296	1	UPDATE_FOOD	FoodItem	83	{"name": "Goi ga bap cai"}	{"name": "Gỏi gà bắp cải"}	\N	\N	2026-04-21 06:37:15.442
297	2	CREATE_FOODITEM	FoodItem	84	\N	{"body": {}, "path": "/api/foods/84/upload-image", "query": {}, "method": "POST", "params": {"id": "84"}, "durationMs": 84, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:37:27.656
298	1	UPDATE_FOOD	FoodItem	84	{"name": "Ca kho to"}	{"name": "Cá kho tộ"}	\N	\N	2026-04-21 06:37:45.096
299	2	CREATE_FOODITEM	FoodItem	85	\N	{"body": {}, "path": "/api/foods/85/upload-image", "query": {}, "method": "POST", "params": {"id": "85"}, "durationMs": 104, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:38:01.724
300	1	UPDATE_FOOD	FoodItem	85	{"name": "Thit kho tieu"}	{"name": "Thịt kho tiêu"}	\N	\N	2026-04-21 06:38:16.643
301	2	CREATE_FOODITEM	FoodItem	86	\N	{"body": {}, "path": "/api/foods/86/upload-image", "query": {}, "method": "POST", "params": {"id": "86"}, "durationMs": 90, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:38:49.313
302	1	UPDATE_FOOD	FoodItem	86	{"name": "Bo luc lac"}	{"name": "Bò lúc lắc"}	\N	\N	2026-04-21 06:39:04.389
303	2	CREATE_FOODITEM	FoodItem	87	\N	{"body": {}, "path": "/api/foods/87/upload-image", "query": {}, "method": "POST", "params": {"id": "87"}, "durationMs": 37, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:39:17.128
304	1	UPDATE_FOOD	FoodItem	87	{"name": "Com chien duong chau"}	{"name": "Cơm chiên dương châu"}	\N	\N	2026-04-21 06:39:35.937
305	2	CREATE_FOODITEM	FoodItem	88	\N	{"body": {}, "path": "/api/foods/88/upload-image", "query": {}, "method": "POST", "params": {"id": "88"}, "durationMs": 69, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:39:48.948
306	1	UPDATE_FOOD	FoodItem	88	{"name": "Com chien ca man"}	{"name": "Cơm chiên cá mặn"}	\N	\N	2026-04-21 06:40:08.888
307	2	CREATE_FOODITEM	FoodItem	91	\N	{"body": {}, "path": "/api/foods/91/upload-image", "query": {}, "method": "POST", "params": {"id": "91"}, "durationMs": 65, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:40:19.146
308	1	UPDATE_FOOD	FoodItem	91	{"name": "Bun moc"}	{"name": "Bún mọc"}	\N	\N	2026-04-21 06:40:33.446
309	1	UPDATE_FOOD	FoodItem	91	{"name": "Bún mọc"}	{"name": "Bún mọc"}	\N	\N	2026-04-21 06:40:38.881
310	2	CREATE_FOODITEM	FoodItem	111	\N	{"body": {}, "path": "/api/foods/111/upload-image", "query": {}, "method": "POST", "params": {"id": "111"}, "durationMs": 197, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:54:18.586
311	1	UPDATE_FOOD	FoodItem	111	{"name": "Mi trung ga"}	{"name": "Mì trứng gà"}	\N	\N	2026-04-21 06:54:33.269
312	2	CREATE_FOODITEM	FoodItem	110	\N	{"body": {}, "path": "/api/foods/110/upload-image", "query": {}, "method": "POST", "params": {"id": "110"}, "durationMs": 32, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:54:43.292
313	1	UPDATE_FOOD	FoodItem	110	{"name": "Com suon nuong mat ong"}	{"name": "Cơm sườn nướng mật ong"}	\N	\N	2026-04-21 06:55:06.002
314	2	CREATE_FOODITEM	FoodItem	109	\N	{"body": {}, "path": "/api/foods/109/upload-image", "query": {}, "method": "POST", "params": {"id": "109"}, "durationMs": 112, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:55:18.369
316	2	CREATE_FOODITEM	FoodItem	108	\N	{"body": {}, "path": "/api/foods/108/upload-image", "query": {}, "method": "POST", "params": {"id": "108"}, "durationMs": 69, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:55:45.281
318	2	CREATE_FOODITEM	FoodItem	107	\N	{"body": {}, "path": "/api/foods/107/upload-image", "query": {}, "method": "POST", "params": {"id": "107"}, "durationMs": 74, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:56:07.792
320	2	CREATE_FOODITEM	FoodItem	106	\N	{"body": {}, "path": "/api/foods/106/upload-image", "query": {}, "method": "POST", "params": {"id": "106"}, "durationMs": 71, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:56:32.207
322	2	CREATE_FOODITEM	FoodItem	105	\N	{"body": {}, "path": "/api/foods/105/upload-image", "query": {}, "method": "POST", "params": {"id": "105"}, "durationMs": 69, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:56:54.487
325	2	CREATE_FOODITEM	FoodItem	104	\N	{"body": {}, "path": "/api/foods/104/upload-image", "query": {}, "method": "POST", "params": {"id": "104"}, "durationMs": 49, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:57:46.971
326	2	CREATE_FOODITEM	FoodItem	103	\N	{"body": {}, "path": "/api/foods/103/upload-image", "query": {}, "method": "POST", "params": {"id": "103"}, "durationMs": 37, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:57:55.891
328	2	CREATE_FOODITEM	FoodItem	102	\N	{"body": {}, "path": "/api/foods/102/upload-image", "query": {}, "method": "POST", "params": {"id": "102"}, "durationMs": 90, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:58:23.025
331	2	CREATE_FOODITEM	FoodItem	101	\N	{"body": {}, "path": "/api/foods/101/upload-image", "query": {}, "method": "POST", "params": {"id": "101"}, "durationMs": 72, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:59:01.378
332	2	CREATE_FOODITEM	FoodItem	100	\N	{"body": {}, "path": "/api/foods/100/upload-image", "query": {}, "method": "POST", "params": {"id": "100"}, "durationMs": 59, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 06:59:12.432
319	1	UPDATE_FOOD	FoodItem	107	{"name": "Chao tom"}	{"name": "Cháo tôm"}	\N	\N	2026-04-21 06:56:18.252
321	1	UPDATE_FOOD	FoodItem	106	{"name": "Sup cua"}	{"name": "Súp cua"}	\N	\N	2026-04-21 06:56:42.827
323	1	UPDATE_FOOD	FoodItem	105	{"name": "Tom rim"}	{"name": "Tôm rim"}	\N	\N	2026-04-21 06:57:07.542
324	1	UPDATE_FOOD	FoodItem	104	{"name": "Muc xao can"}	{"name": "Mực xào cần"}	\N	\N	2026-04-21 06:57:36.015
327	1	UPDATE_FOOD	FoodItem	103	{"name": "Muc hap gung"}	{"name": "Mực hấp gừng"}	\N	\N	2026-04-21 06:58:10.581
329	1	UPDATE_FOOD	FoodItem	102	{"name": "Lau ca"}	{"name": "Lẩu cá"}	\N	\N	2026-04-21 06:58:36.78
330	1	UPDATE_FOOD	FoodItem	101	{"name": "Lau thai hai san"}	{"name": "Lẩu hải sản"}	\N	\N	2026-04-21 06:58:56.438
333	1	UPDATE_FOOD	FoodItem	100	{"name": "Lau ga la e"}	{"name": "Lẩu gà lá é"}	\N	\N	2026-04-21 06:59:26.615
334	1	UPDATE_FOOD	FoodItem	99	{"name": "Lau nam chay"}	{"name": "Lẩu nấm chay"}	\N	\N	2026-04-21 06:59:46.908
335	2	CREATE_FOODITEM	FoodItem	99	\N	{"body": {}, "path": "/api/foods/99/upload-image", "query": {}, "method": "POST", "params": {"id": "99"}, "durationMs": 47, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:00:16.373
336	2	CREATE_FOODITEM	FoodItem	98	\N	{"body": {}, "path": "/api/foods/98/upload-image", "query": {}, "method": "POST", "params": {"id": "98"}, "durationMs": 96, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:00:33.678
337	1	UPDATE_FOOD	FoodItem	98	{"name": "Thit bam sot dau"}	{"name": "Thịt băm sốt đậu"}	\N	\N	2026-04-21 07:00:53.766
338	2	CREATE_FOODITEM	FoodItem	97	\N	{"body": {}, "path": "/api/foods/97/upload-image", "query": {}, "method": "POST", "params": {"id": "97"}, "durationMs": 50, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:01:06.684
339	1	UPDATE_FOOD	FoodItem	97	{"name": "Bo xao can tay"}	{"name": "Bò xào cần tây"}	\N	\N	2026-04-21 07:01:24.377
340	2	CREATE_FOODITEM	FoodItem	96	\N	{"body": {}, "path": "/api/foods/96/upload-image", "query": {}, "method": "POST", "params": {"id": "96"}, "durationMs": 33, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:01:31.667
341	1	UPDATE_FOOD	FoodItem	96	{"name": "Ga xao sa ot"}	{"name": "gà xào sả ớt"}	\N	\N	2026-04-21 07:01:45.735
342	1	UPDATE_FOOD	FoodItem	96	{"name": "gà xào sả ớt"}	{"name": "Gà xào sả ớt"}	\N	\N	2026-04-21 07:01:50.883
343	2	CREATE_FOODITEM	FoodItem	95	\N	{"body": {}, "path": "/api/foods/95/upload-image", "query": {}, "method": "POST", "params": {"id": "95"}, "durationMs": 89, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:02:00.728
344	1	UPDATE_FOOD	FoodItem	95	{"name": "Ca ngu kho dua"}	{"name": "Cá ngừ kho dưa"}	\N	\N	2026-04-21 07:02:21.836
345	2	CREATE_FOODITEM	FoodItem	94	\N	{"body": {}, "path": "/api/foods/94/upload-image", "query": {}, "method": "POST", "params": {"id": "94"}, "durationMs": 56, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:02:34.613
346	1	UPDATE_FOOD	FoodItem	94	{"name": "Com chay kho quet"}	{"name": "Cơm cháy kho quẹt"}	\N	\N	2026-04-21 07:02:51.918
347	2	CREATE_FOODITEM	FoodItem	93	\N	{"body": {}, "path": "/api/foods/93/upload-image", "query": {}, "method": "POST", "params": {"id": "93"}, "durationMs": 63, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:03:03.76
348	1	UPDATE_FOOD	FoodItem	93	{"name": "Bun chay"}	{"name": "Bún chay"}	\N	\N	2026-04-21 07:03:24.7
349	1	UPDATE_FOOD	FoodItem	92	{"name": "Bun ga nam"}	{"name": "Bún gà nấm"}	\N	\N	2026-04-21 07:03:47.3
350	2	CREATE_FOODITEM	FoodItem	92	\N	{"body": {}, "path": "/api/foods/92/upload-image", "query": {}, "method": "POST", "params": {"id": "92"}, "durationMs": 216, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:04:44.821
351	1	DELETE_FOOD	FoodItem	126	{"name": "Com ca kho"}	\N	\N	\N	2026-04-21 07:25:16.599
352	1	DELETE_FOOD	FoodItem	125	{"name": "Com suon trung"}	\N	\N	\N	2026-04-21 07:25:25.564
353	1	DELETE_FOOD	FoodItem	122	{"name": "Bun dau mam tom"}	\N	\N	\N	2026-04-21 07:25:57.943
354	2	CREATE_FOODITEM	FoodItem	112	\N	{"body": {}, "path": "/api/foods/112/upload-image", "query": {}, "method": "POST", "params": {"id": "112"}, "durationMs": 215, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:31:49.175
355	1	UPDATE_FOOD	FoodItem	112	{"name": "Mi xao bo"}	{"name": "Mì xào bò"}	\N	\N	2026-04-21 07:32:12.582
356	2	CREATE_FOODITEM	FoodItem	113	\N	{"body": {}, "path": "/api/foods/113/upload-image", "query": {}, "method": "POST", "params": {"id": "113"}, "durationMs": 180, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:32:20.646
357	1	UPDATE_FOOD	FoodItem	113	{"name": "Pho xao bo"}	{"name": "Phở xào bò"}	\N	\N	2026-04-21 07:32:34.293
358	1	UPDATE_FOOD	FoodItem	114	{"name": "Nui xao bo"}	{"name": "Nui xào bò"}	\N	\N	2026-04-21 07:32:50.826
359	2	CREATE_FOODITEM	FoodItem	114	\N	{"body": {}, "path": "/api/foods/114/upload-image", "query": {}, "method": "POST", "params": {"id": "114"}, "durationMs": 60, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:32:55.331
360	2	CREATE_FOODITEM	FoodItem	115	\N	{"body": {}, "path": "/api/foods/115/upload-image", "query": {}, "method": "POST", "params": {"id": "115"}, "durationMs": 77, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:33:02.634
361	1	UPDATE_FOOD	FoodItem	115	{"name": "Banh da cua"}	{"name": "Bánh đa cua"}	\N	\N	2026-04-21 07:33:23
363	1	UPDATE_FOOD	FoodItem	116	{"name": "Banh canh cua"}	{"name": "Bánh canh cua"}	\N	\N	2026-04-21 07:33:46.976
364	1	UPDATE_FOOD	FoodItem	117	{"name": "Banh canh gio heo"}	{"name": "Bánh canh giò heo"}	\N	\N	2026-04-21 07:34:08.215
366	1	UPDATE_FOOD	FoodItem	118	{"name": "Banh canh ga"}	{"name": "Bánh canh gà"}	\N	\N	2026-04-21 07:34:29.633
368	1	UPDATE_FOOD	FoodItem	119	{"name": "Xoi ga"}	{"name": "Xôi gà"}	\N	\N	2026-04-21 07:34:52.899
371	1	UPDATE_FOOD	FoodItem	120	{"name": "Xoi dau xanh"}	{"name": "Xôi đậu xanh"}	\N	\N	2026-04-21 07:35:37.628
373	1	UPDATE_FOOD	FoodItem	121	{"name": "Chao long"}	{"name": "Cháo lòngg"}	\N	\N	2026-04-21 07:36:04.671
374	1	DELETE_FOOD	FoodItem	121	{"name": "Cháo lòngg"}	\N	\N	\N	2026-04-21 07:36:11.921
376	1	UPDATE_FOOD	FoodItem	123	{"name": "Bun moc suon"}	{"name": "Bún mọc sườn"}	\N	\N	2026-04-21 07:36:34.691
377	1	UPDATE_FOOD	FoodItem	124	{"name": "Bun suon non"}	{"name": "Bún sườn non"}	\N	\N	2026-04-21 07:36:53.503
362	2	CREATE_FOODITEM	FoodItem	116	\N	{"body": {}, "path": "/api/foods/116/upload-image", "query": {}, "method": "POST", "params": {"id": "116"}, "durationMs": 66, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:33:33.125
365	2	CREATE_FOODITEM	FoodItem	117	\N	{"body": {}, "path": "/api/foods/117/upload-image", "query": {}, "method": "POST", "params": {"id": "117"}, "durationMs": 99, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:34:14.829
367	2	CREATE_FOODITEM	FoodItem	118	\N	{"body": {}, "path": "/api/foods/118/upload-image", "query": {}, "method": "POST", "params": {"id": "118"}, "durationMs": 44, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:34:38.299
369	2	CREATE_FOODITEM	FoodItem	119	\N	{"body": {}, "path": "/api/foods/119/upload-image", "query": {}, "method": "POST", "params": {"id": "119"}, "durationMs": 125, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:34:58.6
370	2	CREATE_FOODITEM	FoodItem	120	\N	{"body": {}, "path": "/api/foods/120/upload-image", "query": {}, "method": "POST", "params": {"id": "120"}, "durationMs": 100, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:35:08.415
372	2	CREATE_FOODITEM	FoodItem	121	\N	{"body": {}, "path": "/api/foods/121/upload-image", "query": {}, "method": "POST", "params": {"id": "121"}, "durationMs": 59, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:35:46.779
375	2	CREATE_FOODITEM	FoodItem	123	\N	{"body": {}, "path": "/api/foods/123/upload-image", "query": {}, "method": "POST", "params": {"id": "123"}, "durationMs": 58, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:36:22.968
378	2	CREATE_FOODITEM	FoodItem	124	\N	{"body": {}, "path": "/api/foods/124/upload-image", "query": {}, "method": "POST", "params": {"id": "124"}, "durationMs": 100, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:36:58.927
379	2	CREATE_FOODITEM	FoodItem	127	\N	{"body": {}, "path": "/api/foods/127/upload-image", "query": {}, "method": "POST", "params": {"id": "127"}, "durationMs": 93, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:37:10.076
380	1	UPDATE_FOOD	FoodItem	127	{"name": "Com tom chien"}	{"name": "Cơm chiên tôm"}	\N	\N	2026-04-21 07:37:23.938
381	2	CREATE_FOODITEM	FoodItem	128	\N	{"body": {}, "path": "/api/foods/128/upload-image", "query": {}, "method": "POST", "params": {"id": "128"}, "durationMs": 65, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:37:47.643
382	1	UPDATE_FOOD	FoodItem	128	{"name": "Com dau hu rau"}	{"name": "Cơm đậu hũ rau"}	\N	\N	2026-04-21 07:37:59.712
383	2	CREATE_FOODITEM	FoodItem	129	\N	{"body": {}, "path": "/api/foods/129/upload-image", "query": {}, "method": "POST", "params": {"id": "129"}, "durationMs": 154, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:38:08.722
384	2	CREATE_FOODITEM	FoodItem	129	\N	{"body": {}, "path": "/api/foods/129/upload-image", "query": {}, "method": "POST", "params": {"id": "129"}, "durationMs": 125, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:38:20.877
385	1	UPDATE_FOOD	FoodItem	129	{"name": "Com chay nam"}	{"name": "Cơm chay nấm"}	\N	\N	2026-04-21 07:38:35.234
386	2	CREATE_FOODITEM	FoodItem	130	\N	{"body": {}, "path": "/api/foods/130/upload-image", "query": {}, "method": "POST", "params": {"id": "130"}, "durationMs": 47, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:38:44.588
387	1	UPDATE_FOOD	FoodItem	130	{"name": "Com ga xoi mo"}	{"name": "Cơm gà xối mỡ"}	\N	\N	2026-04-21 07:39:01.102
388	1	UPDATE_FOOD	FoodItem	37	{"name": "Cơm tấm sườn"}	{"name": "Cơm "}	\N	\N	2026-04-21 07:43:40.889
389	2	CREATE_FOODITEM	FoodItem	37	\N	{"body": {}, "path": "/api/foods/37/upload-image", "query": {}, "method": "POST", "params": {"id": "37"}, "durationMs": 162, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:44:19.645
390	1	UPDATE_RECIPE	Recipe	37	\N	{"body": {"tips": "", "steps": {"create": [], "deleteMany": {}}, "title": "Cơm trắng", "tools": {"create": [{"name": "[TRUNCATED_DEPTH]", "isRequired": "[TRUNCATED_DEPTH]"}, {"name": "[TRUNCATED_DEPTH]", "isRequired": "[TRUNCATED_DEPTH]"}, {"name": "[TRUNCATED_DEPTH]", "isRequired": "[TRUNCATED_DEPTH]"}], "deleteMany": {}}, "summary": "Huong dan nau Com.", "cookTime": 12, "prepTime": 12, "servings": 1, "totalTime": 24, "difficulty": "EASY", "ingredients": {"create": [], "deleteMany": {}}, "nutritionNotes": ""}, "path": "/api/admin/recipes/37", "query": {}, "method": "PUT", "params": {"id": "37"}, "durationMs": 162, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 07:45:06.582
391	2	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 191, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 08:08:01.002
392	2	LOGIN	User	2	\N	\N	::ffff:127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:08:18.143
393	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:08:37.674
394	2	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 147, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:10:10.814
395	3	LOGIN	User	3	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:47:31.598
396	3	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "WEIGHT_LOSS", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 1164, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:48:23.924
397	3	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 241, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:49:24.975
398	3	UPDATE_PROFILE	UserProfile	3	\N	{"height": 159.2294728877467, "weight": 87.54648937443974, "fullName": "Pham Hang Ha", "goalType": "WEIGHT_LOSS", "targetFat": 48, "targetCarbs": 254, "targetWeight": 66.21451449409406, "activityLevel": "VERY_ACTIVE", "targetProtein": 143, "targetCalories": 2097}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:50:06.174
399	3	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 114, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:50:15.711
400	3	CREATE_FAVORITE	Favorite	29	\N	{"body": {}, "path": "/api/favorites/foods/29", "query": {}, "method": "POST", "params": {"foodId": "29"}, "durationMs": 53, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:51:02.327
401	3	CREATE_FAVORITE	Favorite	129	\N	{"body": {}, "path": "/api/favorites/foods/129", "query": {}, "method": "POST", "params": {"foodId": "129"}, "durationMs": 42, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:51:32.029
402	3	CREATE_FAVORITE	Favorite	69	\N	{"body": {}, "path": "/api/favorites/foods/69", "query": {}, "method": "POST", "params": {"foodId": "69"}, "durationMs": 29, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:51:41.027
403	3	DELETE_MEALPLAN	MealPlan	10	\N	{"body": {}, "path": "/api/meal-plans/10", "query": {}, "method": "DELETE", "params": {"id": "10"}, "durationMs": 18, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:51:58.243
404	3	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "WEIGHT_LOSS", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 162, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 09:52:10.999
405	3	DELETE_MEALPLAN	MealPlan	11	\N	{"body": {}, "path": "/api/meal-plans/11", "query": {}, "method": "DELETE", "params": {"id": "11"}, "durationMs": 36, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:08:54.444
406	3	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 151, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:08:57.492
407	3	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 88, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:09:31.74
408	1	UPDATE_SUPPORT	Support	44	\N	{"body": {"status": "SUPPORT_OPEN"}, "path": "/api/support/sessions/44/status", "query": {}, "method": "PUT", "params": {"id": "44"}, "durationMs": 23, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:12:05.657
409	1	CREATE_SUPPORT	Support	44	\N	{"body": {"content": "canh bao bao mat!!!"}, "path": "/api/support/sessions/44/messages", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 61, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:12:16.044
410	3	CREATE_SUPPORT	Support	44	\N	{"body": {"content": "ok"}, "path": "/api/support/sessions/44/messages", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 25, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:12:58.731
411	1	CREATE_SUPPORT	Support	44	\N	{"body": {"content": "ok"}, "path": "/api/support/sessions/44/messages", "query": {}, "method": "POST", "params": {"id": "44"}, "durationMs": 35, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:13:24.682
412	1	UPDATE_SUPPORT	Support	44	\N	{"body": {"status": "SUPPORT_CLOSED"}, "path": "/api/support/sessions/44/status", "query": {}, "method": "PUT", "params": {"id": "44"}, "durationMs": 16, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-21 10:13:25.381
413	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-07 02:27:05.363
414	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 55, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-07 02:28:18.292
415	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-07 03:10:36.706
416	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-07 03:14:07.485
417	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 07:45:42.526
418	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 07:47:11.986
419	2	CREATE_CHAT	Chat	6	\N	{"body": {"content": "goi y bua an giam can hom nay"}, "path": "/api/chat/sessions/6/messages", "query": {}, "method": "POST", "params": {"id": "6"}, "durationMs": 2257, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 07:49:01.06
420	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:01:23.474
421	2	DELETE_MEALPLAN	MealPlan	9	\N	{"body": {}, "path": "/api/meal-plans/9", "query": {}, "method": "DELETE", "params": {"id": "9"}, "durationMs": 33, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:02:11.74
422	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"endDate": "2026-05-10", "activate": true, "startDate": "2026-05-09", "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 325, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:02:34.314
423	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 161, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:02:45.86
424	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 27, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:02:50.801
425	2	CREATE_HEALTH	Health	\N	\N	{"body": {"amountMl": 250}, "path": "/api/health/hydration/log", "query": {}, "method": "POST", "params": {}, "durationMs": 20, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:02:51.09
426	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:19:10.282
427	2	CREATE_ANALYZE	Analyze	\N	\N	{"body": {}, "path": "/api/analyze", "query": {}, "method": "POST", "params": {}, "durationMs": 47112, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:23:24.818
428	2	CREATE_CHAT	Chat	6	\N	{"body": {"content": "thuc don giam can hom nay"}, "path": "/api/chat/sessions/6/messages", "query": {}, "method": "POST", "params": {"id": "6"}, "durationMs": 5228, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:26:16.132
429	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:27:11.468
430	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:28:01.018
431	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-05-09 08:29:36.879
432	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:20:05.458
433	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {"days": 7, "activate": true, "goalTemplate": "AUTO", "includeSnack": true, "macroStrategy": "AUTO"}, "path": "/api/meal-plans/auto-generate", "query": {}, "method": "POST", "params": {}, "durationMs": 285, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:20:42.22
434	2	CREATE_MEALPLAN	MealPlan	\N	\N	{"body": {}, "path": "/api/meal-plans/active/apply-today", "query": {}, "method": "POST", "params": {}, "durationMs": 129, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:20:45.839
435	2	CREATE_ANALYZE	Analyze	\N	\N	{"body": {}, "path": "/api/analyze", "query": {}, "method": "POST", "params": {}, "durationMs": 5180, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:21:58.421
436	2	CREATE_WEEKLYREPORT	WeeklyReport	\N	\N	{"body": {}, "path": "/api/weekly-reports/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 196, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:24:44.393
437	2	CREATE_RECOMMENDATION	Recommendation	\N	\N	{"body": {"limit": 10}, "path": "/api/recommendations/generate", "query": {}, "method": "POST", "params": {}, "durationMs": 125, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:25:34.507
438	1	LOGIN	User	1	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:26:08.039
439	1	DELETE_MEALPLAN	MealPlan	13	\N	{"body": {}, "path": "/api/admin/meal-plans/13", "query": {}, "method": "DELETE", "params": {"id": "13"}, "durationMs": 22, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:27:07.187
440	2	LOGIN	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:29:00.357
441	2	CREATE_SUPPORT	Support	\N	\N	{"body": {"title": "Hỗ trợ khách hàng"}, "path": "/api/support/sessions", "query": {}, "method": "POST", "params": {}, "durationMs": 24, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:29:21.422
442	2	CREATE_SUPPORT	Support	45	\N	{"body": {"content": "Toi bi loi dang nhap"}, "path": "/api/support/sessions/45/messages", "query": {}, "method": "POST", "params": {"id": "45"}, "durationMs": 29, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:29:21.475
443	1	CREATE_SUPPORT	Support	45	\N	{"body": {"content": "co the mieu ta ro hon loi duoc khong a de admin co the ho tro!"}, "path": "/api/support/sessions/45/messages", "query": {}, "method": "POST", "params": {"id": "45"}, "durationMs": 34, "statusCode": 201}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:30:00.102
444	1	CREATE_CHAT	Chat	\N	\N	{"body": {"question": "Toi bi tieu duong type 2, bua toi nen an gi?"}, "path": "/api/chat/quick", "query": {}, "method": "POST", "params": {}, "durationMs": 10824, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:30:33.644
445	1	CREATE_DB	Db	\N	\N	{"body": {"limit": 100, "query": "SELECT * FROM \\"public\\".\\"users\\" ORDER BY 1 DESC"}, "path": "/api/admin/db/query", "query": {}, "method": "POST", "params": {}, "durationMs": 14, "statusCode": 200}	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:36:01.834
446	2	FORGOT_PASSWORD_REQUEST	User	2	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:37:18.913
447	1	RESET_PASSWORD	User	2	\N	{"resetMode": "generated_temp_password"}	\N	\N	2026-05-11 06:38:41.381
448	1	RESET_PASSWORD	User	2	\N	{"resetMode": "generated_temp_password"}	\N	\N	2026-05-11 06:39:09.497
449	16	LOGIN	User	16	\N	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 Edg/148.0.0.0	2026-05-11 06:39:46.187
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_messages (id, "sessionId", role, content, intent, entities, "createdAt") FROM stdin;
1	1	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-02-07 05:12:36.894
2	1	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-26 20:02:51.061
3	1	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-30 16:38:23.449
4	2	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-02 02:39:28.569
5	2	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-18 07:40:23.246
6	2	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-02-28 10:38:11.054
7	2	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-17 15:00:14.834
8	3	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-05 07:28:56.736
9	3	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-04 11:31:37.528
10	3	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-06 08:55:58.296
11	4	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-21 19:41:16.024
12	4	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-21 16:09:47.27
13	4	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-03 23:52:28.477
14	4	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-17 05:19:09.177
15	4	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-31 23:50:18.722
16	5	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-07 01:55:28.808
17	5	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-06 22:32:36.862
18	5	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-06 23:25:04.049
19	6	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-18 03:07:41.018
20	6	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-01 15:46:26.579
21	6	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-08 08:01:23.342
22	6	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-10 11:29:24.237
23	6	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-21 18:27:50.39
24	7	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-31 21:06:19.799
25	7	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-04 11:29:22.665
26	7	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-08 01:54:01.671
27	7	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-06 21:38:16.363
28	7	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-21 12:51:10.107
29	8	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-19 03:18:22.342
30	8	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-06 14:23:27.192
31	8	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-29 04:16:52.62
32	9	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-29 11:06:12.906
33	9	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-01 15:10:00.034
34	9	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-01 13:23:22.501
35	9	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-20 09:31:17.917
36	9	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-02-27 03:47:25.126
37	10	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-22 01:21:12.463
38	10	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-30 20:57:29.605
39	10	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-06 07:45:05.817
40	10	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-16 19:52:44.407
41	10	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-30 15:23:09.656
42	11	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-02-16 01:37:58.007
43	11	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-01-30 15:53:17.823
44	11	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-02-18 04:04:28.873
45	11	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-17 09:18:57.543
46	12	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-31 11:26:36.959
47	12	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-21 04:43:01.905
48	12	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-03 23:53:46.101
49	12	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-18 21:15:56.257
50	13	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-02-15 07:12:52.295
51	13	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-20 03:57:47.48
52	13	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-17 04:46:32.58
53	13	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-08 15:05:32.481
54	13	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-19 04:51:27.901
55	14	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-01 00:18:00.213
56	14	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-13 23:04:50.545
57	14	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-15 01:44:14.523
58	14	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-19 03:33:25.658
59	15	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-01 03:41:32.397
60	15	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-31 17:36:15.967
61	15	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-29 20:41:03.871
62	15	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-04 01:36:51.01
63	15	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-29 01:26:56.36
64	16	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-02-18 05:04:50.029
65	16	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-02 13:58:57.592
66	16	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-15 03:07:12.063
67	16	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-05 23:27:56.302
68	17	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-27 13:02:25.155
69	17	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-26 08:41:06.197
70	17	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-28 14:09:21.451
71	17	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-10 01:05:38.932
72	17	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-04-04 10:35:50.109
73	18	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-31 02:29:37.24
74	18	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-24 14:19:36.753
75	18	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-15 21:02:39.492
76	18	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-26 19:54:20.907
77	18	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-23 08:00:41.482
78	19	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-29 10:59:12.505
79	19	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-19 03:14:21.556
80	19	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-28 14:51:24.886
81	19	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-10 20:01:52.872
82	20	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-28 01:12:23.771
83	20	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-24 12:22:29.867
84	20	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-30 02:38:12.62
85	20	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-02 13:57:51.652
86	21	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-26 17:13:10.971
87	21	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-27 15:41:09.486
88	21	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-31 08:16:00.063
89	21	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-24 23:19:07.74
90	22	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-01 00:57:04.896
91	22	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-28 10:54:07.747
92	22	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-01-19 19:02:03.433
93	23	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-29 05:08:48.943
94	23	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-19 05:24:39.17
95	23	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-06 03:27:35.02
96	24	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-03 03:01:52.536
97	24	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-03 12:22:11.048
98	24	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-05 05:37:33.018
99	24	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-03 07:32:14.369
100	25	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-22 18:57:08.143
101	25	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-16 16:13:31.318
102	25	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-01 23:21:28.228
103	26	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-06 21:43:11.409
104	26	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-03 13:29:33.025
105	26	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-02-01 05:56:22.239
106	26	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-27 00:20:36.334
107	26	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-02 23:07:27.427
108	27	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-07 03:18:35.73
109	27	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-01 22:10:02.893
110	27	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-31 19:13:12.488
111	27	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-01 22:45:39.254
112	28	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-27 22:07:20.957
113	28	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-25 22:05:29.558
114	28	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-26 03:26:10.914
115	28	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-04 23:31:01.576
116	28	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-24 08:33:20.892
117	29	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-02-25 13:13:30.703
118	29	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-27 04:31:25.194
119	29	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-01 00:23:36.649
120	29	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-18 19:34:21.321
121	30	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-03 01:35:34.3
122	30	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-16 01:38:43.4
123	30	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-06 18:45:57.458
124	31	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-07 01:57:14.022
125	31	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-07 02:42:02.524
126	31	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-07 00:03:05.678
127	31	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-06 22:21:05.168
128	31	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-04-06 17:02:27.8
129	32	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-01-30 22:19:30.433
130	32	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-08 00:49:12.17
131	32	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-04 07:20:52.207
132	32	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-02-27 21:25:23.332
133	33	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-04 23:36:52.196
134	33	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-06 11:17:41.424
135	33	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-04-03 07:36:52.254
136	33	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-06 07:17:28.577
137	34	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-01-14 02:52:51.869
138	34	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-09 01:16:38.007
139	34	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-02-05 14:41:40.237
140	34	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-05 02:52:46.484
141	35	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-03-30 09:45:53.756
142	35	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-06 14:52:02.875
143	35	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-13 22:26:56.433
144	35	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-14 20:48:21.624
145	35	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-03-29 00:28:12.504
146	36	USER	Câu hỏi 1 về dinh dưỡng	\N	\N	2026-04-04 11:41:11.006
147	36	ASSISTANT	Trả lời 2: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-04-01 17:48:46.323
148	36	USER	Câu hỏi 3 về dinh dưỡng	\N	\N	2026-03-23 02:11:31.221
149	36	ASSISTANT	Trả lời 4: Bạn nên ăn uống cân bằng, nhiều rau xanh.	\N	\N	2026-03-29 10:39:02.607
150	36	USER	Câu hỏi 5 về dinh dưỡng	\N	\N	2026-04-06 19:28:54.172
172	41	USER	Toi giam can	\N	\N	2026-04-15 09:12:28.976
173	41	ASSISTANT	De giam can ben vung:\n- Tao tham hut nhe 300-500 kcal/ngay.\n- Moi bua uu tien dam nac + rau xanh, giam do ngot va do chien.\n- Duy tri van dong deu (di bo nhanh/tap suc manh).\n- Theo doi can nang 1-2 lan/tuan de dieu chinh khau phan.	\N	\N	2026-04-15 09:12:29.576
174	41	USER	di ung hai san	\N	\N	2026-04-15 09:12:49.823
175	41	ASSISTANT	Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop bo nac; dong thoi du nuoc va snack nhe neu tap lau.\nGoi y bo sung: Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop trung ga; dong thoi du nuoc va snack nhe neu tap lau.\nMuc tieu hien tai cua ban: Duy tri can nang.\nNeu co benh nen hoac dang dung thuoc, uu tien trao doi bac si de ca nhan hoa.	\N	\N	2026-04-15 09:12:50.488
176	41	USER	hi	\N	\N	2026-04-20 01:59:29.93
177	41	ASSISTANT	Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an uc ga + dua leo + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.\nGoi y bo sung: Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.\nMuc tieu hien tai cua ban: Duy tri can nang.\nNeu co benh nen hoac dang dung thuoc, uu tien trao doi bac si de ca nhan hoa.	\N	\N	2026-04-20 01:59:30.832
178	42	USER	HI ban	\N	\N	2026-04-20 03:51:16.869
179	43	ADMIN	alo	\N	\N	2026-04-20 03:51:23.017
180	42	USER	hi	\N	\N	2026-04-20 03:51:59.787
181	44	USER	User gui test	\N	\N	2026-04-20 03:54:27.616
182	44	ADMIN	Admin phan hoi test	\N	\N	2026-04-20 03:54:27.679
183	42	USER	hi	\N	\N	2026-04-20 03:58:04.702
184	42	ADMIN	Chao ban! Ban co thac mac gi khong	\N	\N	2026-04-20 03:58:45.769
185	42	USER	Fixx	\N	\N	2026-04-20 04:04:13.892
186	42	USER	hii	\N	\N	2026-04-20 04:11:30.152
187	41	USER	Tôi muốn giảm cân thì ăn uống như nào?	\N	\N	2026-04-20 07:12:34.433
199	6	ASSISTANT	Dưới đây là một số gợi ý thực đơn giảm cân cho ngày hôm nay:\n\n**Bữa sáng**\n\n* Rau muốn xào tỏi (100g) + 1 quả trứng ốp la (50g) + 1 ly nước ép trái cây (không đường) (khoảng 150 calo)\n* Tổng lượng: P 15g, C 20g, F 5g\n\n**Bữa trưa**\n\n* Cơm chiên cá mặn (100g) + Rau cải luộc (100g) + 1 quả táo (100g) (khoảng 350 calo)\n* Tổng lượng: P 25g, C 40g, F 10g\n\n**Bữa tối**\n\n* Canh chua cá (100g) + Rau muốn xào tỏi (100g) + 1/2 chén cơm gạo lứt (50g) (khoảng 250 calo)\n* Tổng lượng: P 20g, C 30g, F 5g\n\n**Bữa phụ**\n\n* 1 quả chuối (100g) + 1 thìa hạt óc chó (10g) (khoảng 100 calo)\n* Tổng lượng: P 2g, C 20g, F 2g\n\nTổng lượng calo cho ngày hôm nay: khoảng 850 calo\nTổng lượng macro: P 62g, C 130g, F 22g\n\nLưu ý: Calo và macro có thể thay đổi tùy thuộc vào loại thực phẩm và số lượng. Bạn nên điều chỉnh khẩu phần ăn theo nhu cầu và mục tiêu giảm cân của mình. Ngoài ra, bạn cũng nên uống đủ nước và tập luyện thường xuyên để hỗ trợ giảm cân.\n\nMục tiêu calo của bạn là 2210 calo, vì vậy bạn có thể điều chỉnh khẩu phần ăn để đạt được mục tiêu này. Bạn cũng nên theo dõi lượng calo và macro của mình để đảm bảo rằng bạn đang ăn đủ chất dinh dưỡng cần thiết.	\N	\N	2026-05-09 08:26:15.944
188	41	ASSISTANT	Để giảm cân, bạn cần tiêu thụ ít calo hơn so với mức năng lượng mà cơ thể cần. Dưới đây là một số gợi ý về ăn uống để giảm cân:\n\n1. **Giảm calo**: Tiêu thụ khoảng 500-750 calo ít hơn so với mức năng lượng mà cơ thể cần mỗi ngày. Điều này sẽ giúp bạn giảm khoảng 0,5-1 kg mỗi tuần.\n2. **Ăn nhiều rau xanh**: Rau xanh như rau bina, rau cải, rau xà lách... giàu chất xơ, ít calo và giúp bạn cảm thấy no lâu.\n3. **Ăn nhiều protein**: Protein giúp bạn cảm thấy no lâu và hỗ trợ xây dựng cơ bắp. Chọn nguồn protein từ thịt nạc, cá, trứng, đậu...\n4. **Ăn nhiều chất béo tốt**: Chất béo tốt như dầu ô liu, dầu cá, bơ... giúp bạn cảm thấy no lâu và hỗ trợ sức khỏe tim mạch.\n5. **Hạn chế tinh bột và đường**: Tinh bột và đường là nguồn năng lượng nhanh, nhưng chúng cũng có thể làm tăng lượng calo trong cơ thể. Hạn chế ăn bánh mì, mì, gạo trắng, đường...\n6. **Uống nhiều nước**: Uống nhiều nước giúp bạn cảm thấy no lâu và hỗ trợ quá trình trao đổi chất.\n7. **Ăn nhiều bữa nhỏ**: Ăn nhiều bữa nhỏ giúp bạn cảm thấy no lâu và hỗ trợ quá trình trao đổi chất.\n\nVí dụ về thực đơn giảm cân:\n\n* Bữa sáng: Cháo yến mạch với trái cây và hạt\n* Bữa trưa: Cá nướng với rau xanh và khoai lang\n* Bữa tối: Thịt nạc với rau xanh và gạo lứt\n* Bữa phụ: Trái cây, hạt, hoặc sữa chua\n\nLưu ý: Trước khi bắt đầu bất kỳ chương trình giảm cân nào, bạn nên tham khảo ý kiến của bác sĩ hoặc chuyên gia dinh dưỡng để đảm bảo rằng chương trình đó phù hợp với sức khỏe và nhu cầu của bạn.	\N	\N	2026-04-20 07:12:36.844
189	6	USER	Tôi muốn giảm cân thì nên ăn uống và tập luyện như thế nào	\N	\N	2026-04-20 10:25:07.708
190	6	ASSISTANT	Để giảm cân, bạn nên tuân thủ các nguyên tắc sau:\n\n1. **Ăn uống cân bằng**: Đảm bảo cung cấp đủ dinh dưỡng cho cơ thể, bao gồm protein, chất béo, tinh bột, vitamin và khoáng chất. Tuy nhiên, nên giảm lượng calo nạp vào và tăng cường tiêu hao calo qua hoạt động thể chất.\n2. **Giảm calo**: Để giảm cân, bạn cần tạo ra sự thiếu hụt calo trong cơ thể. Điều này có thể đạt được bằng cách giảm lượng calo nạp vào hoặc tăng cường tiêu hao calo qua hoạt động thể chất.\n3. **Tập luyện thường xuyên**: Tập luyện giúp tăng cường tiêu hao calo và xây dựng cơ bắp, từ đó giúp giảm cân và duy trì cân nặng. Bạn nên tập luyện ít nhất 150 phút mỗi tuần, bao gồm cả tập cardio và tập luyện sức mạnh.\n4. **Tăng cường hoạt động thể chất**: Ngoài tập luyện, bạn cũng nên tăng cường hoạt động thể chất hàng ngày, chẳng hạn như đi bộ, leo cầu thang, làm việc nhà, v.v.\n5. **Uống đủ nước**: Uống đủ nước giúp kiểm soát cơn đói và tăng cường quá trình trao đổi chất.\n6. **Ngủ đủ giấc**: Ngủ đủ giấc giúp điều chỉnh hormone đói và no, từ đó giúp kiểm soát cơn đói và giảm cân.\n\nCụ thể, bạn có thể tham khảo các gợi ý sau:\n\n* Ăn 3-5 bữa một ngày, bao gồm cả bữa sáng, trưa, tối và bữa phụ.\n* Chọn thực phẩm giàu dinh dưỡng, ít calo, chẳng hạn như rau xanh, hoa quả, thịt nạc, cá, trứng, sữa nonfat.\n* Hạn chế thực phẩm nhiều calo, nhiều chất béo, chẳng hạn như đồ ăn nhanh, đồ ăn chiên, bánh ngọt, đồ uống có đường.\n* Tập luyện 30-60 phút mỗi ngày, bao gồm cả tập cardio và tập luyện sức mạnh.\n* Tăng cường hoạt động thể chất hàng ngày, chẳng hạn như đi bộ 10.000 bước mỗi ngày.\n\nTuy nhiên, để có kế hoạch giảm cân cụ thể và hiệu quả, bạn nên tham khảo ý kiến của bác sĩ hoặc chuyên gia dinh dưỡng. Họ có thể giúp bạn tạo ra kế hoạch giảm cân phù hợp với nhu cầu và mục tiêu của bạn.	\N	\N	2026-04-20 10:25:11.187
191	6	USER	Goi y bua an giam can hom nay	\N	\N	2026-04-21 02:06:05.62
192	6	ASSISTANT	Để giúp bạn giảm cân, dưới đây là một số gợi ý bữa ăn cho ngày hôm nay:\n\n**Bữa sáng**\n\n* 1 chén cháo yến mạch với hoa quả (chuối, táo, hoặc dâu) và 1 thìa hạt óc chó (khoảng 250 calo)\n* 1 ly sữa không đường hoặc sữa chua không đường (khoảng 100 calo)\n* 1 quả trứng ốp la hoặc trứng luộc (khoảng 70 calo)\n\n**Bữa trưa**\n\n* 1 chén cơm gạo lứt với 100g thịt gà nướng hoặc cá nướng (khoảng 300 calo)\n* 1 chén rau xanh (xà lách, cà chua, dưa chuột) với 1 thìa dầu ô liu (khoảng 50 calo)\n* 1 quả táo hoặc 1 chén hoa quả (khoảng 50 calo)\n\n**Bữa tối**\n\n* 1 chén súp lơ xanh với 100g thịt bò hoặc thịt heo nướng (khoảng 250 calo)\n* 1 chén cơm gạo lứt hoặc khoai lang (khoảng 100 calo)\n* 1 quả trứng ốp la hoặc trứng luộc (khoảng 70 calo)\n\n**Bữa phụ**\n\n* 1 quả táo hoặc 1 chén hoa quả (khoảng 50 calo)\n* 1 thìa hạt óc chó hoặc hạt điều (khoảng 50 calo)\n\nTổng calo cho ngày hôm nay: khoảng 1500-1700 calo\n\nLưu ý: Calo có thể thay đổi tùy thuộc vào loại thực phẩm và số lượng. Bạn nên điều chỉnh khẩu phần ăn theo nhu cầu và mục tiêu giảm cân của mình. Ngoài ra, bạn cũng nên uống đủ nước và tập luyện thường xuyên để hỗ trợ giảm cân.	\N	\N	2026-04-21 02:06:07.794
193	44	ADMIN	canh bao bao mat!!!	\N	\N	2026-04-21 10:12:16.012
194	44	USER	ok	\N	\N	2026-04-21 10:12:58.717
195	44	ADMIN	ok	\N	\N	2026-04-21 10:13:24.659
196	6	USER	goi y bua an giam can hom nay	\N	\N	2026-05-09 07:48:58.823
197	6	ASSISTANT	Để giúp bạn giảm cân, dưới đây là một số gợi ý bữa ăn cho ngày hôm nay:\n\n**Bữa sáng**\n\n* 1 ly sữa chua không đường với 1/2 chén hoa quả (chuối, táo, hoặc dâu) và 1 thìa hạt óc chó (khoảng 200 calo)\n* 2 quả trứng ốp la hoặc trứng luộc (khoảng 140 calo)\n\n**Bữa trưa**\n\n* 100g thịt gà nướng hoặc cá nướng với 1 chén rau xanh (xà lách, cà chua, dưa chuột) và 1 thìa dầu ô liu (khoảng 250 calo)\n* 1/2 chén cơm gạo lứt hoặc khoai lang (khoảng 100 calo)\n\n**Bữa tối**\n\n* 100g thịt bò hoặc thịt heo nướng với 1 chén rau xanh (xà lách, cà chua, dưa chuột) và 1 thìa dầu ô liu (khoảng 250 calo)\n* 1/2 chén cơm gạo lứt hoặc khoai lang (khoảng 100 calo)\n\n**Bữa phụ**\n\n* 1 quả táo hoặc 1 chén hoa quả (khoảng 50 calo)\n* 1 thìa hạt óc chó hoặc hạt điều (khoảng 50 calo)\n\nTổng calo cho ngày hôm nay: khoảng 840 calo\n\nLưu ý: Calo có thể thay đổi tùy thuộc vào loại thực phẩm và số lượng. Bạn nên điều chỉnh khẩu phần ăn theo nhu cầu và mục tiêu giảm cân của mình. Ngoài ra, bạn cũng nên uống đủ nước và tập luyện thường xuyên để hỗ trợ giảm cân.\n\nMục tiêu calo của bạn là 2210 calo, vì vậy bạn có thể điều chỉnh khẩu phần ăn để đạt được mục tiêu này. Bạn cũng nên theo dõi lượng calo và macro của mình để đảm bảo rằng bạn đang ăn đủ chất dinh dưỡng cần thiết.	\N	\N	2026-05-09 07:49:01.039
198	6	USER	thuc don giam can hom nay	\N	\N	2026-05-09 08:26:11.228
200	45	USER	Toi bi loi dang nhap	\N	\N	2026-05-11 06:29:21.457
201	45	ADMIN	co the mieu ta ro hon loi duoc khong a de admin co the ho tro!	\N	\N	2026-05-11 06:30:00.087
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_sessions (id, "userId", title, status, "createdAt", "updatedAt") FROM stdin;
1	1	Tư vấn sức khỏe 1	ACTIVE	2026-01-28 19:34:44.603	2026-04-07 03:48:04.41
2	1	Tư vấn sức khỏe 2	ACTIVE	2026-02-21 19:59:41.947	2026-04-07 03:48:04.428
3	1	Tư vấn sức khỏe 3	ACTIVE	2026-04-03 20:42:04.694	2026-04-07 03:48:04.44
4	2	Tư vấn sức khỏe 1	ACTIVE	2026-03-06 19:34:11.15	2026-04-07 03:48:04.449
5	2	Tư vấn sức khỏe 2	ACTIVE	2026-04-06 20:54:28.872	2026-04-07 03:48:04.461
7	3	Tư vấn sức khỏe 1	ACTIVE	2026-02-11 06:34:38.939	2026-04-07 03:48:04.492
8	3	Tư vấn sức khỏe 2	ACTIVE	2026-01-27 13:02:24.889	2026-04-07 03:48:04.511
9	3	Tư vấn sức khỏe 3	ACTIVE	2026-01-31 16:47:43.37	2026-04-07 03:48:04.524
10	4	Tư vấn sức khỏe 1	ACTIVE	2026-03-08 22:57:42.771	2026-04-07 03:48:04.542
11	4	Tư vấn sức khỏe 2	ACTIVE	2026-01-13 10:34:27.953	2026-04-07 03:48:04.569
12	5	Tư vấn sức khỏe 1	ACTIVE	2026-03-09 19:42:39.49	2026-04-07 03:48:04.592
13	5	Tư vấn sức khỏe 2	ACTIVE	2026-01-14 15:39:33.647	2026-04-07 03:48:04.61
14	6	Tư vấn sức khỏe 1	ACTIVE	2026-01-14 22:45:43.118	2026-04-07 03:48:04.638
15	6	Tư vấn sức khỏe 2	ACTIVE	2026-03-22 06:20:49.739	2026-04-07 03:48:04.661
16	7	Tư vấn sức khỏe 1	ACTIVE	2026-01-14 12:47:55.515	2026-04-07 03:48:04.685
17	7	Tư vấn sức khỏe 2	ACTIVE	2026-02-16 03:03:14.447	2026-04-07 03:48:04.695
18	8	Tư vấn sức khỏe 1	ACTIVE	2026-03-01 07:15:19.875	2026-04-07 03:48:04.715
19	8	Tư vấn sức khỏe 2	ACTIVE	2026-01-11 17:22:43.734	2026-04-07 03:48:04.732
20	9	Tư vấn sức khỏe 1	ACTIVE	2026-02-03 17:40:55.534	2026-04-07 03:48:04.75
21	9	Tư vấn sức khỏe 2	ACTIVE	2026-03-24 18:17:03.595	2026-04-07 03:48:04.763
22	10	Tư vấn sức khỏe 1	ACTIVE	2026-01-15 22:41:07.675	2026-04-07 03:48:04.781
23	10	Tư vấn sức khỏe 2	ACTIVE	2026-01-29 20:34:46.01	2026-04-07 03:48:04.793
24	11	Tư vấn sức khỏe 1	ACTIVE	2026-04-01 12:15:22.029	2026-04-07 03:48:04.804
25	11	Tư vấn sức khỏe 2	ACTIVE	2026-02-28 18:16:09.44	2026-04-07 03:48:04.822
26	11	Tư vấn sức khỏe 3	ACTIVE	2026-01-30 19:58:23.484	2026-04-07 03:48:04.832
27	12	Tư vấn sức khỏe 1	ACTIVE	2026-03-26 15:44:19.149	2026-04-07 03:48:04.851
28	12	Tư vấn sức khỏe 2	ACTIVE	2026-03-16 03:19:27.874	2026-04-07 03:48:04.862
29	13	Tư vấn sức khỏe 1	ACTIVE	2026-02-23 10:36:53.063	2026-04-07 03:48:04.879
30	13	Tư vấn sức khỏe 2	ACTIVE	2026-03-05 01:56:26.396	2026-04-07 03:48:04.892
31	13	Tư vấn sức khỏe 3	ACTIVE	2026-04-06 15:56:38.173	2026-04-07 03:48:04.905
32	14	Tư vấn sức khỏe 1	ACTIVE	2026-01-27 12:43:37.869	2026-04-07 03:48:04.921
33	14	Tư vấn sức khỏe 2	ACTIVE	2026-04-01 05:27:08.585	2026-04-07 03:48:04.935
34	14	Tư vấn sức khỏe 3	ACTIVE	2026-01-07 13:58:48.976	2026-04-07 03:48:04.945
35	15	Tư vấn sức khỏe 1	ACTIVE	2026-03-03 09:38:09.695	2026-04-07 03:48:04.958
36	15	Tư vấn sức khỏe 2	ACTIVE	2026-03-12 20:50:32.665	2026-04-07 03:48:04.97
43	1	Ho tro khach hang	SUPPORT_CLOSED	2026-04-20 03:51:22.967	2026-04-20 03:59:20.298
41	16	Toi giam can	ACTIVE	2026-04-15 08:35:42.88	2026-04-20 07:12:36.873
42	16	Ho tro khach hang	SUPPORT_CLOSED	2026-04-20 03:51:16.713	2026-04-20 09:27:53.818
44	3	Ticket test	SUPPORT_CLOSED	2026-04-20 03:54:27.394	2026-04-21 10:13:25.368
6	2	Tư vấn sức khỏe 3	ACTIVE	2026-02-06 16:37:19.767	2026-05-09 08:26:16.045
45	2	Hỗ trợ khách hàng	SUPPORT_OPEN	2026-05-11 06:29:21.411	2026-05-11 06:30:00.094
\.


--
-- Data for Name: daily_nutrition; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_nutrition (id, "userId", date, "totalCalories", "totalProtein", "totalFat", "totalCarbs", "totalMeals", "createdAt", "updatedAt") FROM stdin;
1	2	2026-01-28 00:00:00	594	8.457777330039063	9.257837347745461	55.432729798229	1	2026-04-07 04:00:31.844	2026-04-07 04:00:31.844
2	2	2026-04-05 00:00:00	939	54.89053804341391	23.87302765697684	74.75568514483989	1	2026-04-07 04:00:31.873	2026-04-07 04:00:31.873
3	2	2026-02-07 00:00:00	298	29.95152739268171	16.99173188623289	57.59909113977252	1	2026-04-07 04:00:31.877	2026-04-07 04:00:31.877
4	2	2026-03-23 00:00:00	291	10.26257226261736	3.179166407441248	13.16286442379183	1	2026-04-07 04:00:31.881	2026-04-07 04:00:31.881
5	2	2026-03-30 00:00:00	825	54.81284040744708	16.821871711251	54.24581102392177	1	2026-04-07 04:00:31.885	2026-04-07 04:00:31.885
6	2	2026-03-25 00:00:00	443	33.24930520223594	11.95047491326741	20.43145710977977	1	2026-04-07 04:00:31.889	2026-04-07 04:00:31.889
7	2	2026-02-12 00:00:00	253	16.838079688353	5.167548594011782	16.66389265709417	1	2026-04-07 04:00:31.893	2026-04-07 04:00:31.893
8	2	2026-01-11 00:00:00	908	31.97943482445962	9.906672744533688	41.01710118789387	1	2026-04-07 04:00:31.897	2026-04-07 04:00:31.897
9	2	2026-03-18 00:00:00	366	36.74548234199663	20.84599479017116	70.66438911922428	1	2026-04-07 04:00:31.9	2026-04-07 04:00:31.9
10	2	2026-03-07 00:00:00	303	17.26640025856707	10.86112274329219	15.03847764455841	1	2026-04-07 04:00:31.902	2026-04-07 04:00:31.902
11	2	2026-02-20 00:00:00	379	13.3512565220963	4.135987074779832	17.12443771312352	1	2026-04-07 04:00:31.905	2026-04-07 04:00:31.905
12	2	2026-03-15 00:00:00	572	37.99133889946485	11.65941090362887	37.59832504878073	1	2026-04-07 04:00:31.907	2026-04-07 04:00:31.907
13	2	2026-01-16 00:00:00	490	19.68639245099062	27.0022815375074	20.2184571118282	1	2026-04-07 04:00:31.91	2026-04-07 04:00:31.91
14	2	2026-02-22 00:00:00	582	49.84688674805415	9.494645094867456	103.6498756189697	1	2026-04-07 04:00:31.912	2026-04-07 04:00:31.912
15	2	2026-01-19 00:00:00	810	41.28586125562794	29.18744037485785	29.18744037485785	1	2026-04-07 04:00:31.914	2026-04-07 04:00:31.914
16	3	2026-03-08 00:00:00	371	15.80604592752175	19.80634150177109	63.02904734061143	1	2026-04-07 04:00:31.916	2026-04-07 04:00:31.916
17	3	2026-03-16 00:00:00	311	20.69698500181169	6.351833328142209	20.48287826041364	1	2026-04-07 04:00:31.918	2026-04-07 04:00:31.918
18	3	2026-03-18 00:00:00	1071	55.11767492789528	52.86834894981723	164.2596984407525	2	2026-04-07 04:00:31.92	2026-04-07 04:00:31.92
19	3	2026-02-10 00:00:00	649	49.23445887003484	12.34672188381679	45.7285995696918	1	2026-04-07 04:00:31.923	2026-04-07 04:00:31.923
20	3	2026-04-03 00:00:00	673	28.29312195098817	22.52281418466821	102.3764281121282	1	2026-04-07 04:00:31.926	2026-04-07 04:00:31.926
21	3	2026-04-02 00:00:00	857	61.54836243292431	17.3854140638455	50.95724811816786	1	2026-04-07 04:00:31.928	2026-04-07 04:00:31.928
22	3	2026-02-18 00:00:00	520	41.52637596575427	23.53161304726075	102.8272166771058	1	2026-04-07 04:00:31.931	2026-04-07 04:00:31.931
23	3	2026-01-12 00:00:00	754	50.06405704428609	15.36448647221194	49.54615300589692	1	2026-04-07 04:00:31.933	2026-04-07 04:00:31.933
24	3	2026-03-10 00:00:00	499	17.6142768160552	20.30822503498129	38.33695542317896	1	2026-04-07 04:00:31.935	2026-04-07 04:00:31.935
25	3	2026-03-26 00:00:00	1273	61.06313444323187	30.5375270986966	98.37213842847483	2	2026-04-07 04:00:31.937	2026-04-07 04:00:31.937
26	3	2026-02-25 00:00:00	834	29.42524952158515	33.925581801357	64.04319013521473	1	2026-04-07 04:00:31.94	2026-04-07 04:00:31.94
27	3	2026-02-11 00:00:00	773	57.99825255315918	20.84574874374417	35.6395059167239	1	2026-04-07 04:00:31.942	2026-04-07 04:00:31.942
28	3	2026-03-03 00:00:00	426	13.93495492254584	8.755591146024374	35.88559188018441	1	2026-04-07 04:00:31.944	2026-04-07 04:00:31.944
29	3	2026-02-07 00:00:00	552	41.44609374053116	14.89656702558222	25.46832426954379	1	2026-04-07 04:00:31.946	2026-04-07 04:00:31.946
30	4	2026-03-16 00:00:00	650	27.30058542925435	21.7327028746038	98.78501306638088	1	2026-04-07 04:00:31.949	2026-04-07 04:00:31.949
31	4	2026-04-03 00:00:00	428	6.315986489151052	16.87270676387495	14.70722568188031	1	2026-04-07 04:00:31.951	2026-04-07 04:00:31.951
32	4	2026-03-11 00:00:00	1344	47.06267729121804	40.56680680838403	122.1187726967247	3	2026-04-07 04:00:31.953	2026-04-07 04:00:31.953
33	4	2026-02-01 00:00:00	487	17.19459889753384	19.82436108186254	37.42353877698542	1	2026-04-07 04:00:31.955	2026-04-07 04:00:31.955
34	4	2026-02-21 00:00:00	508	19.92525976665186	5.92118568537296	46.99353718549968	1	2026-04-07 04:00:31.958	2026-04-07 04:00:31.958
35	4	2026-01-17 00:00:00	689	29.30156436890239	36.71739238819251	116.8445097673515	1	2026-04-07 04:00:31.96	2026-04-07 04:00:31.96
36	4	2026-01-31 00:00:00	556	41.40387222813312	16.21235960740152	45.64402781776121	1	2026-04-07 04:00:31.963	2026-04-07 04:00:31.963
37	4	2026-03-22 00:00:00	336	19.1309088087542	12.03395876679699	16.6624044463343	1	2026-04-07 04:00:31.965	2026-04-07 04:00:31.965
38	4	2026-03-01 00:00:00	798	59.8598246813633	21.51483553764942	36.78342849985223	1	2026-04-07 04:00:31.967	2026-04-07 04:00:31.967
39	4	2026-01-24 00:00:00	359	19.19460549155031	17.99076263842172	11.16898647069304	1	2026-04-07 04:00:31.97	2026-04-07 04:00:31.97
40	4	2026-03-10 00:00:00	753	40.21649550747446	37.69420659062937	23.40123606184054	1	2026-04-07 04:00:31.972	2026-04-07 04:00:31.972
41	4	2026-03-04 00:00:00	383	28.56363386100569	11.18455542750223	31.48882528050627	1	2026-04-07 04:00:31.975	2026-04-07 04:00:31.975
42	4	2026-03-19 00:00:00	401	16.108492476626	22.09475657266945	16.54385713815644	1	2026-04-07 04:00:31.977	2026-04-07 04:00:31.977
43	4	2026-01-10 00:00:00	644	42.772846525505	13.12683910610326	42.33036880282736	1	2026-04-07 04:00:31.979	2026-04-07 04:00:31.979
44	4	2026-03-09 00:00:00	782	39.87346870072706	28.18893574813305	28.18893574813305	1	2026-04-07 04:00:31.981	2026-04-07 04:00:31.981
45	4	2026-02-27 00:00:00	813	31.53063722829823	12.97432919441937	46.31533793821797	1	2026-04-07 04:00:31.983	2026-04-07 04:00:31.983
46	5	2026-02-12 00:00:00	489	17.22305174229441	5.33540189842816	22.09043593033414	1	2026-04-07 04:00:31.986	2026-04-07 04:00:31.986
47	5	2026-02-10 00:00:00	1281	88.73510573539936	38.34628372614517	78.265809659575	2	2026-04-07 04:00:31.988	2026-04-07 04:00:31.988
48	5	2026-02-25 00:00:00	441	17.72101661714271	24.30652954918898	18.19996301220062	1	2026-04-07 04:00:31.99	2026-04-07 04:00:31.99
49	5	2026-04-03 00:00:00	183	14.68513676294823	8.321577499003999	36.36319579396705	1	2026-04-07 04:00:31.993	2026-04-07 04:00:31.993
50	5	2026-01-25 00:00:00	594	20.91503207179642	6.479113196154326	26.82580200513019	1	2026-04-07 04:00:31.995	2026-04-07 04:00:31.995
51	5	2026-01-22 00:00:00	887	31.20653242862339	9.667241024084422	40.02576985410392	1	2026-04-07 04:00:31.997	2026-04-07 04:00:31.997
52	5	2026-01-14 00:00:00	253	12.96537922021158	7.589490275245801	39.68670956430617	1	2026-04-07 04:00:31.999	2026-04-07 04:00:31.999
53	5	2026-03-14 00:00:00	619	46.96715353909695	11.77814067079521	43.62274322516745	1	2026-04-07 04:00:32.001	2026-04-07 04:00:32.001
54	5	2026-01-31 00:00:00	632	26.83779516020225	23.88704281274546	68.71037609077958	1	2026-04-07 04:00:32.003	2026-04-07 04:00:32.003
55	5	2026-01-17 00:00:00	884	48.7762315929383	32.8265893230041	86.23934483162094	1	2026-04-07 04:00:32.006	2026-04-07 04:00:32.006
56	5	2026-01-16 00:00:00	383	23.86324602963966	17.82555727515252	85.53392402190119	1	2026-04-07 04:00:32.008	2026-04-07 04:00:32.008
57	5	2026-02-21 00:00:00	798	60.57104920190873	15.18964391750652	56.25794043520935	1	2026-04-07 04:00:32.01	2026-04-07 04:00:32.01
58	5	2026-04-04 00:00:00	448	27.87916610323464	20.82540118554877	99.9283363338832	1	2026-04-07 04:00:32.012	2026-04-07 04:00:32.012
59	5	2026-04-05 00:00:00	273	20.33852831068394	7.963881567436482	22.42138964370579	1	2026-04-07 04:00:32.015	2026-04-07 04:00:32.015
60	5	2026-03-20 00:00:00	466	46.81472008687913	26.55835081851797	90.02830785938295	1	2026-04-07 04:00:32.017	2026-04-07 04:00:32.017
61	6	2026-01-21 00:00:00	259	20.71707955012315	11.73967841173645	51.29943507649543	1	2026-04-07 04:00:32.019	2026-04-07 04:00:32.019
62	6	2026-02-07 00:00:00	521	26.66982379996767	25.95727125569372	18.93353903356483	1	2026-04-07 04:00:32.022	2026-04-07 04:00:32.022
63	6	2026-02-14 00:00:00	568	28.94667038130075	20.46412961022361	20.46412961022361	1	2026-04-07 04:00:32.025	2026-04-07 04:00:32.025
64	6	2026-04-04 00:00:00	579	29.62691939597051	17.34258696349493	90.6872776632756	1	2026-04-07 04:00:32.027	2026-04-07 04:00:32.027
65	6	2026-03-16 00:00:00	212	21.32138095773849	12.0957834279478	41.00265568795864	1	2026-04-07 04:00:32.03	2026-04-07 04:00:32.03
66	6	2026-03-20 00:00:00	380	18.26734470439362	19.00130051840944	45.83146305298757	1	2026-04-07 04:00:32.032	2026-04-07 04:00:32.032
67	6	2026-02-03 00:00:00	429	34.33077690531566	19.45410691301221	85.00954281316258	1	2026-04-07 04:00:32.034	2026-04-07 04:00:32.034
68	6	2026-03-31 00:00:00	761	45.61085496118116	31.83567793434564	112.0704591766034	2	2026-04-07 04:00:32.036	2026-04-07 04:00:32.036
69	6	2026-01-17 00:00:00	362	27.47020525134672	6.888813081607074	25.51412252447064	1	2026-04-07 04:00:32.039	2026-04-07 04:00:32.039
70	6	2026-01-23 00:00:00	249	19.94910064969253	11.3044903681591	49.39777303733388	1	2026-04-07 04:00:32.041	2026-04-07 04:00:32.041
71	6	2026-03-24 00:00:00	328	34.46454758161897	30.28318702943725	70.82971359604781	1	2026-04-07 04:00:32.043	2026-04-07 04:00:32.043
72	6	2026-02-25 00:00:00	1448	85.94552887849346	48.61482510928151	75.988049667346	2	2026-04-07 04:00:32.045	2026-04-07 04:00:32.045
73	6	2026-04-02 00:00:00	479	41.06544560047309	7.82198963818535	85.39005355019007	1	2026-04-07 04:00:32.048	2026-04-07 04:00:32.048
74	6	2026-03-04 00:00:00	851	36.15876725821045	32.18319598898312	92.57401669772203	1	2026-04-07 04:00:32.05	2026-04-07 04:00:32.05
75	6	2026-03-30 00:00:00	795	46.49463416841606	20.22147581293016	63.32126367698569	1	2026-04-07 04:00:32.052	2026-04-07 04:00:32.052
76	6	2026-04-06 00:00:00	199	17.11185076856685	3.259400146393686	35.58178493146441	1	2026-04-07 04:00:32.055	2026-04-07 04:00:32.055
77	7	2026-03-20 00:00:00	241	14.9976755243592	11.20308292181048	53.75672853610676	1	2026-04-07 04:00:32.057	2026-04-07 04:00:32.057
78	7	2026-01-09 00:00:00	873	64.2252905852374	22.65332649918503	64.52494157983291	2	2026-04-07 04:00:32.06	2026-04-07 04:00:32.06
79	7	2026-03-12 00:00:00	417	16.37232482134961	4.865360678042573	38.61397363525852	1	2026-04-07 04:00:32.063	2026-04-07 04:00:32.063
80	7	2026-01-25 00:00:00	412	22.75746969541844	15.31586363531963	40.23659090634819	1	2026-04-07 04:00:32.065	2026-04-07 04:00:32.065
81	7	2026-03-21 00:00:00	1011	51.75330840821394	50.37058642784181	36.74089833560227	1	2026-04-07 04:00:32.068	2026-04-07 04:00:32.068
82	7	2026-01-16 00:00:00	247	3.646953839935674	9.742576686685299	8.49219251299307	1	2026-04-07 04:00:32.071	2026-04-07 04:00:32.071
83	7	2026-04-06 00:00:00	908	55.14982067481798	41.76200866137699	69.02007837209277	2	2026-04-07 04:00:32.077	2026-04-07 04:00:32.077
84	7	2026-03-11 00:00:00	563	19.8124932844375	6.137565854418139	25.41167616916984	1	2026-04-07 04:00:32.08	2026-04-07 04:00:32.08
85	7	2026-01-28 00:00:00	1477	56.51997041416797	55.39440062572916	162.4873528399846	2	2026-04-07 04:00:32.082	2026-04-07 04:00:32.082
86	7	2026-01-11 00:00:00	660	25.89514703462927	7.695255958403981	61.07345998733318	1	2026-04-07 04:00:32.085	2026-04-07 04:00:32.085
87	7	2026-03-02 00:00:00	684	39.97540314173293	17.38612771561083	54.44269189778864	1	2026-04-07 04:00:32.087	2026-04-07 04:00:32.087
88	7	2026-02-19 00:00:00	487	20.46081785503204	16.28788789775577	74.03585408070803	1	2026-04-07 04:00:32.09	2026-04-07 04:00:32.09
89	7	2026-01-27 00:00:00	857	45.73881914151969	42.87018240093657	26.61457420429891	1	2026-04-07 04:00:32.092	2026-04-07 04:00:32.092
90	7	2026-03-24 00:00:00	779	30.22820598674388	12.43840054956925	44.40219731067163	1	2026-04-07 04:00:32.094	2026-04-07 04:00:32.094
91	8	2026-01-13 00:00:00	317	10.36161681253631	6.510396404336972	26.68345568538112	1	2026-04-07 04:00:32.096	2026-04-07 04:00:32.096
92	8	2026-03-16 00:00:00	901	35.31860535680251	10.4956232899932	83.29859753962857	1	2026-04-07 04:00:32.098	2026-04-07 04:00:32.098
93	8	2026-02-06 00:00:00	229	18.29319453234746	10.36614356833023	45.29743408009847	1	2026-04-07 04:00:32.101	2026-04-07 04:00:32.101
94	8	2026-03-28 00:00:00	156	12.47841997150649	7.071104650520345	30.89894469134941	1	2026-04-07 04:00:32.104	2026-04-07 04:00:32.104
95	8	2026-02-08 00:00:00	170	11.62546636734763	7.117632469804672	20.81907497417867	1	2026-04-07 04:00:32.106	2026-04-07 04:00:32.106
96	8	2026-01-10 00:00:00	257	9.076204586501236	10.46432999384848	19.75409233532622	1	2026-04-07 04:00:32.108	2026-04-07 04:00:32.108
97	8	2026-03-08 00:00:00	485	33.17138320085202	20.30901012297062	59.40385460968907	1	2026-04-07 04:00:32.11	2026-04-07 04:00:32.11
98	8	2026-02-02 00:00:00	775	32.90567646533347	29.28777486443293	84.24542299239825	1	2026-04-07 04:00:32.113	2026-04-07 04:00:32.113
99	8	2026-02-16 00:00:00	254	14.49454025525264	9.117533386368592	12.62427699651036	1	2026-04-07 04:00:32.115	2026-04-07 04:00:32.115
100	8	2026-01-14 00:00:00	325	18.50279300586733	11.63885366498106	16.11533584381993	1	2026-04-07 04:00:32.118	2026-04-07 04:00:32.118
101	8	2026-03-12 00:00:00	866	33.94094228585611	10.08622341513649	80.0493921836229	1	2026-04-07 04:00:32.12	2026-04-07 04:00:32.12
102	8	2026-03-17 00:00:00	365	19.50198980325042	18.2788684915483	11.34784772523631	1	2026-04-07 04:00:32.123	2026-04-07 04:00:32.123
103	8	2026-01-19 00:00:00	1012	59.18939354536769	25.74268862131865	80.61031692369123	1	2026-04-07 04:00:32.125	2026-04-07 04:00:32.125
104	8	2026-02-15 00:00:00	1058	56.45931166298539	52.91830953778073	32.85263082828767	1	2026-04-07 04:00:32.127	2026-04-07 04:00:32.127
105	8	2026-02-21 00:00:00	213	16.16518733010416	4.0538085874255	15.01410587935371	1	2026-04-07 04:00:32.129	2026-04-07 04:00:32.129
106	9	2026-02-24 00:00:00	892	41.08013792261717	30.85148549053967	120.8186450873132	2	2026-04-07 04:00:32.132	2026-04-07 04:00:32.132
107	9	2026-02-28 00:00:00	672	28.58598341475872	35.82070761232112	113.991020283544	1	2026-04-07 04:00:32.134	2026-04-07 04:00:32.134
108	9	2026-02-06 00:00:00	1596	104.0468323172447	43.09458237337612	128.788090905873	2	2026-04-07 04:00:32.137	2026-04-07 04:00:32.137
109	9	2026-03-22 00:00:00	657	27.887805298839	24.82160681048497	71.39862194310089	1	2026-04-07 04:00:32.14	2026-04-07 04:00:32.14
110	9	2026-03-30 00:00:00	433	22.12735557244193	12.95259838386845	67.73129571564544	1	2026-04-07 04:00:32.142	2026-04-07 04:00:32.142
111	9	2026-02-18 00:00:00	575	27.58154360722158	28.68973062715459	69.20012280026128	1	2026-04-07 04:00:32.144	2026-04-07 04:00:32.144
112	9	2026-03-11 00:00:00	528	32.8522815917708	24.5402585384312	117.753659922311	1	2026-04-07 04:00:32.147	2026-04-07 04:00:32.147
113	9	2026-03-10 00:00:00	1454	49.8024257547537	47.49192169329276	115.939006806919	2	2026-04-07 04:00:32.149	2026-04-07 04:00:32.149
114	9	2026-02-01 00:00:00	372	14.93684511142715	20.48769971364669	15.3405436279522	1	2026-04-07 04:00:32.152	2026-04-07 04:00:32.152
115	9	2026-01-17 00:00:00	550	55.18340519041448	31.30597025225437	106.1219330584894	1	2026-04-07 04:00:32.154	2026-04-07 04:00:32.154
116	9	2026-02-27 00:00:00	688	51.25547593538155	20.06991527590241	56.50453069984832	1	2026-04-07 04:00:32.156	2026-04-07 04:00:32.156
117	9	2026-02-14 00:00:00	671	39.25164999939827	17.07135253942083	53.45700904679955	1	2026-04-07 04:00:32.159	2026-04-07 04:00:32.159
118	9	2026-01-21 00:00:00	296	15.80304112938491	14.81190962998098	9.195497800025365	1	2026-04-07 04:00:32.161	2026-04-07 04:00:32.161
119	9	2026-04-03 00:00:00	871	46.48251909263472	43.56723914954264	27.0473194720209	1	2026-04-07 04:00:32.163	2026-04-07 04:00:32.163
120	9	2026-03-20 00:00:00	346	36.43364297167968	32.01338481702737	74.87649419547405	1	2026-04-07 04:00:32.165	2026-04-07 04:00:32.165
121	9	2026-02-07 00:00:00	377	18.12216075568483	18.85028328604717	45.46720689595926	1	2026-04-07 04:00:32.168	2026-04-07 04:00:32.168
122	10	2026-03-14 00:00:00	643	27.34594515072152	34.26683250368191	109.0461763417661	1	2026-04-07 04:00:32.17	2026-04-07 04:00:32.17
123	10	2026-03-03 00:00:00	1061	45.19219905110911	31.86781233774133	88.3381785244897	2	2026-04-07 04:00:32.172	2026-04-07 04:00:32.172
124	10	2026-04-02 00:00:00	625	31.85709950872932	22.5216857332775	22.5216857332775	1	2026-04-07 04:00:32.174	2026-04-07 04:00:32.174
125	10	2026-03-05 00:00:00	296	12.43191887431358	9.896461735473311	44.98391697942414	1	2026-04-07 04:00:32.176	2026-04-07 04:00:32.176
126	10	2026-01-14 00:00:00	775	15.01465535911102	26.76076906920357	36.57432298445248	2	2026-04-07 04:00:32.179	2026-04-07 04:00:32.179
127	10	2026-03-23 00:00:00	365	18.6515141099492	10.91795947899466	57.09182977557622	1	2026-04-07 04:00:32.181	2026-04-07 04:00:32.181
128	10	2026-02-20 00:00:00	785	27.71807422408587	31.95730910541666	60.32757331124573	1	2026-04-07 04:00:32.184	2026-04-07 04:00:32.184
129	10	2026-01-18 00:00:00	667	28.01086651655936	22.29812400331371	101.3551091059714	1	2026-04-07 04:00:32.186	2026-04-07 04:00:32.186
130	10	2026-01-16 00:00:00	680	39.78978749804364	17.30539964200628	54.18990106876419	1	2026-04-07 04:00:32.189	2026-04-07 04:00:32.189
131	10	2026-02-12 00:00:00	719	28.8763911013935	39.60748238907351	29.65683410413386	1	2026-04-07 04:00:32.193	2026-04-07 04:00:32.193
132	10	2026-03-15 00:00:00	411	28.07221123737732	17.18706810451673	50.27217420571143	1	2026-04-07 04:00:32.197	2026-04-07 04:00:32.197
133	10	2026-01-27 00:00:00	882	12.56521894247803	13.75382073433406	82.35312415002491	1	2026-04-07 04:00:32.2	2026-04-07 04:00:32.2
134	10	2026-01-12 00:00:00	579	58.14288692557395	32.98490700585445	111.8132440876422	1	2026-04-07 04:00:32.202	2026-04-07 04:00:32.202
135	10	2026-02-10 00:00:00	763	39.0730865806123	38.02914915288603	27.73890879386981	1	2026-04-07 04:00:32.204	2026-04-07 04:00:32.204
136	10	2026-01-29 00:00:00	615	24.67275924826538	33.84169004998562	25.33959057929957	1	2026-04-07 04:00:32.206	2026-04-07 04:00:32.206
137	10	2026-01-09 00:00:00	591	34.58314524808357	15.04092348884904	47.09895019500905	1	2026-04-07 04:00:32.209	2026-04-07 04:00:32.209
138	10	2026-02-14 00:00:00	514	26.19166932515472	18.51645487089693	18.51645487089693	1	2026-04-07 04:00:32.211	2026-04-07 04:00:32.211
139	11	2026-04-06 00:00:00	648	25.13084775485026	10.34092299960346	36.91469024277048	1	2026-04-07 04:00:32.215	2026-04-07 04:00:32.215
140	11	2026-03-18 00:00:00	426	21.70754094447251	15.34635678492013	15.34635678492013	1	2026-04-07 04:00:32.217	2026-04-07 04:00:32.217
141	11	2026-03-19 00:00:00	753	39.58468602940611	32.25244881331663	97.3304104932826	2	2026-04-07 04:00:32.22	2026-04-07 04:00:32.22
142	11	2026-03-03 00:00:00	129	7.365379526716061	4.633061315192361	6.415007974881731	1	2026-04-07 04:00:32.223	2026-04-07 04:00:32.223
143	11	2026-03-09 00:00:00	465	6.853321883725076	18.30815988937984	15.95844952924553	1	2026-04-07 04:00:32.226	2026-04-07 04:00:32.226
144	11	2026-03-25 00:00:00	265	18.09824187465292	11.0805562497875	32.41062703062845	1	2026-04-07 04:00:32.229	2026-04-07 04:00:32.229
145	11	2026-02-22 00:00:00	727	30.93365160556801	38.76253874031054	123.35270948887	1	2026-04-07 04:00:32.232	2026-04-07 04:00:32.232
146	11	2026-02-24 00:00:00	176	14.05988954007266	7.967270739374507	34.81496457541802	1	2026-04-07 04:00:32.234	2026-04-07 04:00:32.234
147	11	2026-01-14 00:00:00	455	19.32381903685908	17.19921066107877	49.47302360745598	1	2026-04-07 04:00:32.236	2026-04-07 04:00:32.236
148	11	2026-02-15 00:00:00	454	27.16650892555819	14.71889443598541	57.67674194370746	2	2026-04-07 04:00:32.239	2026-04-07 04:00:32.239
149	11	2026-04-04 00:00:00	410	15.90571591530563	6.544935735484615	23.36389849760206	1	2026-04-07 04:00:32.242	2026-04-07 04:00:32.242
150	11	2026-03-28 00:00:00	188	15.04480996672429	8.5253923144771	37.25381515569826	1	2026-04-07 04:00:32.245	2026-04-07 04:00:32.245
151	11	2026-03-06 00:00:00	260	11.05892191272981	9.84301950347679	28.31315610117736	1	2026-04-07 04:00:32.247	2026-04-07 04:00:32.247
152	11	2026-01-26 00:00:00	733	29.42963091257388	40.3663180760304	30.22502634264345	1	2026-04-07 04:00:32.25	2026-04-07 04:00:32.25
153	11	2026-01-29 00:00:00	471	47.30699700212987	26.83762329928521	90.97499423486514	1	2026-04-07 04:00:32.252	2026-04-07 04:00:32.252
154	12	2026-01-26 00:00:00	495	32.8511113218537	10.08189278498269	32.51127223921384	1	2026-04-07 04:00:32.255	2026-04-07 04:00:32.255
155	12	2026-02-04 00:00:00	605	33.70344674987067	20.42187030724624	37.06443965005131	2	2026-04-07 04:00:32.258	2026-04-07 04:00:32.258
156	12	2026-01-14 00:00:00	1028	14.63045055263184	16.01441209139431	95.88876375711405	1	2026-04-07 04:00:32.26	2026-04-07 04:00:32.26
157	12	2026-02-16 00:00:00	342	12.08661791587959	13.93515947948471	26.3061684051497	1	2026-04-07 04:00:32.263	2026-04-07 04:00:32.263
158	12	2026-02-22 00:00:00	329	24.50017505654029	9.593442040211558	27.00922912859562	1	2026-04-07 04:00:32.266	2026-04-07 04:00:32.266
159	12	2026-02-08 00:00:00	392	41.26014297021575	36.25431680103516	84.79566147187722	1	2026-04-07 04:00:32.269	2026-04-07 04:00:32.269
160	12	2026-04-05 00:00:00	274	3.913442127715643	4.283632599256312	25.64891124246063	1	2026-04-07 04:00:32.271	2026-04-07 04:00:32.271
161	12	2026-01-27 00:00:00	524	41.88098128718133	23.73255606273609	103.70528699683	1	2026-04-07 04:00:32.274	2026-04-07 04:00:32.274
162	12	2026-03-25 00:00:00	335	19.10214615081937	12.01586612712831	16.63735309910074	1	2026-04-07 04:00:32.276	2026-04-07 04:00:32.276
163	12	2026-03-11 00:00:00	407	34.90874611450691	6.649284974191793	72.58802763492707	1	2026-04-07 04:00:32.278	2026-04-07 04:00:32.278
164	12	2026-02-17 00:00:00	298	23.81592647106289	13.49569166693564	58.9727703092986	1	2026-04-07 04:00:32.28	2026-04-07 04:00:32.28
165	12	2026-02-21 00:00:00	376	19.1829839399084	13.5615967047704	13.5615967047704	1	2026-04-07 04:00:32.282	2026-04-07 04:00:32.282
166	12	2026-02-02 00:00:00	525	22.07908668064639	17.57611505498825	79.8914320681284	1	2026-04-07 04:00:32.284	2026-04-07 04:00:32.284
167	12	2026-02-14 00:00:00	1040	40.34573731824276	16.60159526013817	59.26383424258626	1	2026-04-07 04:00:32.286	2026-04-07 04:00:32.286
168	12	2026-03-14 00:00:00	191	10.91426612468226	6.865425465525934	9.50597372149745	1	2026-04-07 04:00:32.288	2026-04-07 04:00:32.288
169	12	2026-02-06 00:00:00	651	33.19224570390116	23.46558029616456	23.46558029616456	1	2026-04-07 04:00:32.291	2026-04-07 04:00:32.291
170	12	2026-03-24 00:00:00	436	6.207673449171593	6.794885802471608	40.68542733578679	1	2026-04-07 04:00:32.293	2026-04-07 04:00:32.293
171	12	2026-03-28 00:00:00	368	38.70585694318498	34.00992576993092	79.5462280560309	1	2026-04-07 04:00:32.295	2026-04-07 04:00:32.295
172	13	2026-01-19 00:00:00	865	35.37103137903003	23.00217180610309	77.0369088676374	2	2026-04-07 04:00:32.298	2026-04-07 04:00:32.298
173	13	2026-03-20 00:00:00	667	50.0373001454394	17.98442092183909	30.74755835024102	1	2026-04-07 04:00:32.3	2026-04-07 04:00:32.3
174	13	2026-02-03 00:00:00	494	26.38412140627164	24.72936814734171	15.35243301340545	1	2026-04-07 04:00:32.302	2026-04-07 04:00:32.302
175	13	2026-03-09 00:00:00	505	21.45653442972663	19.09743902122265	54.93322165516398	1	2026-04-07 04:00:32.305	2026-04-07 04:00:32.305
176	13	2026-01-31 00:00:00	1403	96.3278918185806	50.85381161067409	94.25935354240957	3	2026-04-07 04:00:32.307	2026-04-07 04:00:32.307
177	13	2026-03-29 00:00:00	301	15.35984147421946	10.85878902756174	10.85878902756174	1	2026-04-07 04:00:32.309	2026-04-07 04:00:32.309
178	13	2026-03-31 00:00:00	410	41.14603033420442	23.34245951651981	79.12698141193158	1	2026-04-07 04:00:32.312	2026-04-07 04:00:32.312
179	13	2026-02-19 00:00:00	198	12.34575245314265	9.2221283384921	44.25134162421612	1	2026-04-07 04:00:32.314	2026-04-07 04:00:32.314
180	13	2026-04-03 00:00:00	453	38.83037639180651	7.396262169867907	80.74252868772464	1	2026-04-07 04:00:32.317	2026-04-07 04:00:32.317
181	13	2026-01-12 00:00:00	396	16.8279862139159	14.97778877678379	43.08316889321924	1	2026-04-07 04:00:32.32	2026-04-07 04:00:32.32
182	13	2026-02-07 00:00:00	436	18.565622072548	23.26432889337805	74.0332830794198	1	2026-04-07 04:00:32.322	2026-04-07 04:00:32.322
183	13	2026-02-08 00:00:00	334	35.14806764810024	30.88378002902926	72.23444785032366	1	2026-04-07 04:00:32.324	2026-04-07 04:00:32.324
184	13	2026-04-06 00:00:00	779	59.10369766265706	14.821670311688	54.89507522847406	1	2026-04-07 04:00:32.326	2026-04-07 04:00:32.326
185	13	2026-02-15 00:00:00	385	40.51252894146563	35.59740594489075	83.2592046995562	1	2026-04-07 04:00:32.328	2026-04-07 04:00:32.328
186	13	2026-01-24 00:00:00	380	25.2257737890684	7.741702990438234	24.96481750849183	1	2026-04-07 04:00:32.33	2026-04-07 04:00:32.33
187	13	2026-02-05 00:00:00	406	29.20179877854635	8.248560044589391	24.17681392379649	1	2026-04-07 04:00:32.333	2026-04-07 04:00:32.333
188	14	2026-02-20 00:00:00	1214	58.28693754585471	60.6288234293935	146.2377629498676	2	2026-04-07 04:00:32.335	2026-04-07 04:00:32.335
189	14	2026-02-25 00:00:00	689	40.34833115068312	26.65453539735084	71.88102454793642	2	2026-04-07 04:00:32.337	2026-04-07 04:00:32.337
190	14	2026-01-21 00:00:00	462	22.20554203740355	23.09772899426351	55.71211886169998	1	2026-04-07 04:00:32.339	2026-04-07 04:00:32.339
191	14	2026-02-21 00:00:00	448	32.23156399517809	9.104370349287315	26.68522343756627	1	2026-04-07 04:00:32.342	2026-04-07 04:00:32.342
192	14	2026-02-07 00:00:00	435	22.23073134098781	13.01311102887091	68.04772642180416	1	2026-04-07 04:00:32.344	2026-04-07 04:00:32.344
193	14	2026-01-22 00:00:00	589	38.50645757618907	26.73881761886649	83.71178066513366	2	2026-04-07 04:00:32.346	2026-04-07 04:00:32.346
194	14	2026-03-30 00:00:00	229	11.74303465495798	6.87397150534126	35.94514266334701	1	2026-04-07 04:00:32.348	2026-04-07 04:00:32.348
195	14	2026-01-25 00:00:00	510	34.85809899748193	21.34169326376444	62.42445279651101	1	2026-04-07 04:00:32.35	2026-04-07 04:00:32.35
196	14	2026-02-02 00:00:00	686	60.41225304471355	34.25117458094811	134.4365721268586	2	2026-04-07 04:00:32.353	2026-04-07 04:00:32.353
197	14	2026-02-19 00:00:00	870	12.83412706947897	34.28545374275096	29.88518160464389	1	2026-04-07 04:00:32.356	2026-04-07 04:00:32.356
198	14	2026-03-11 00:00:00	297	15.87639877857171	14.88066645099578	9.238183261398866	1	2026-04-07 04:00:32.358	2026-04-07 04:00:32.358
199	14	2026-03-31 00:00:00	264	17.57841072825232	5.39475363729123	17.39656510002902	1	2026-04-07 04:00:32.36	2026-04-07 04:00:32.36
200	14	2026-01-10 00:00:00	528	21.21580619088317	29.10005849154922	21.78920635820434	1	2026-04-07 04:00:32.363	2026-04-07 04:00:32.363
201	14	2026-02-04 00:00:00	336	19.12308140516317	12.02903507744135	16.65558703030341	1	2026-04-07 04:00:32.365	2026-04-07 04:00:32.365
202	14	2026-03-18 00:00:00	692	27.14710290063055	8.067299446885494	64.02618608639281	1	2026-04-07 04:00:32.367	2026-04-07 04:00:32.367
203	14	2026-02-17 00:00:00	823	11.71404266175397	12.82212777840637	76.77446879663074	1	2026-04-07 04:00:32.369	2026-04-07 04:00:32.369
204	15	2026-02-19 00:00:00	627	29.89867418101591	32.30242424472411	115.1109520731951	2	2026-04-07 04:00:32.372	2026-04-07 04:00:32.372
205	15	2026-02-18 00:00:00	729	48.40859676815336	14.85643142195051	47.9078181808966	1	2026-04-07 04:00:32.374	2026-04-07 04:00:32.374
206	15	2026-02-04 00:00:00	347	12.27245639251014	14.14942031136463	26.71064038369854	1	2026-04-07 04:00:32.376	2026-04-07 04:00:32.376
207	15	2026-03-14 00:00:00	445	17.26654289162695	7.104893247272332	25.36281659200705	1	2026-04-07 04:00:32.378	2026-04-07 04:00:32.378
208	15	2026-04-01 00:00:00	542	22.78806605902035	18.14049995487805	82.45681797671838	1	2026-04-07 04:00:32.38	2026-04-07 04:00:32.38
209	15	2026-02-05 00:00:00	291	10.26382123461174	11.83358212931707	22.33890504003732	1	2026-04-07 04:00:32.382	2026-04-07 04:00:32.382
210	15	2026-03-15 00:00:00	870	12.82786191088008	34.26871681906537	29.87059273533506	1	2026-04-07 04:00:32.384	2026-04-07 04:00:32.384
211	15	2026-03-21 00:00:00	854	43.74187073646696	42.57319480075983	31.05338914878953	1	2026-04-07 04:00:32.386	2026-04-07 04:00:32.386
212	15	2026-03-06 00:00:00	457	19.19100020304308	15.27704621426455	69.44111915574798	1	2026-04-07 04:00:32.388	2026-04-07 04:00:32.388
213	15	2026-03-30 00:00:00	334	4.922857162072606	13.15106127582253	11.4632245345405	1	2026-04-07 04:00:32.391	2026-04-07 04:00:32.391
214	15	2026-01-17 00:00:00	711	10.48932612463081	28.02148550437089	24.42514511878318	1	2026-04-07 04:00:32.393	2026-04-07 04:00:32.393
215	15	2026-02-07 00:00:00	399	30.31097186885703	7.601203471756717	28.15260545095081	1	2026-04-07 04:00:32.395	2026-04-07 04:00:32.395
216	15	2026-03-08 00:00:00	507	50.90347109542804	28.87793071759859	97.89129056813084	1	2026-04-07 04:00:32.397	2026-04-07 04:00:32.397
217	15	2026-02-22 00:00:00	424	33.91235568276085	19.21700155356448	83.97345216683638	1	2026-04-07 04:00:32.399	2026-04-07 04:00:32.399
218	1	2026-01-25 00:00:00	808	58.07488646169085	16.40426987716592	48.08148067445184	1	2026-04-07 04:00:32.402	2026-04-07 04:00:32.402
219	1	2026-01-07 00:00:00	619	8.809316630798723	9.642630366144546	57.73673737753216	1	2026-04-07 04:00:32.404	2026-04-07 04:00:32.404
220	1	2026-02-22 00:00:00	671	28.53293188645054	35.75422946265099	113.7794691274509	1	2026-04-07 04:00:32.407	2026-04-07 04:00:32.407
221	1	2026-02-20 00:00:00	955	59.96843179684902	28.03636710798624	80.54987772839404	2	2026-04-07 04:00:32.409	2026-04-07 04:00:32.409
222	1	2026-03-25 00:00:00	367	5.234465980816599	5.729618168191141	34.30697298237906	1	2026-04-07 04:00:32.411	2026-04-07 04:00:32.411
223	1	2026-02-09 00:00:00	714	51.29635902668996	14.48955595883774	42.46938815521408	1	2026-04-07 04:00:32.413	2026-04-07 04:00:32.413
224	1	2026-03-11 00:00:00	211	6.904981145552252	4.338527976408937	17.78185410049297	1	2026-04-07 04:00:32.416	2026-04-07 04:00:32.416
225	1	2026-03-01 00:00:00	420	42.15425240257731	23.91443165146213	81.06587000495637	1	2026-04-07 04:00:32.418	2026-04-07 04:00:32.418
226	1	2026-02-05 00:00:00	382	16.27877993669121	20.39871806881677	64.91414715495384	1	2026-04-07 04:00:32.42	2026-04-07 04:00:32.42
227	1	2026-01-19 00:00:00	450	19.111549929755	17.01028004219032	48.92957023900626	1	2026-04-07 04:00:32.423	2026-04-07 04:00:32.423
228	1	2026-03-21 00:00:00	445	35.56783264259005	20.15510516413436	88.07272844831822	1	2026-04-07 04:00:32.425	2026-04-07 04:00:32.425
229	1	2026-03-14 00:00:00	476	16.81328811641141	19.38473218127433	36.59362707689542	1	2026-04-07 04:00:32.428	2026-04-07 04:00:32.428
230	1	2026-04-06 00:00:00	447	17.54094043260726	5.212637958746498	41.37014252973411	1	2026-04-07 04:00:32.43	2026-04-07 04:00:32.43
231	1	2026-02-17 00:00:00	531	33.02234463942289	24.66729358607493	118.3632232557628	1	2026-04-07 04:00:32.433	2026-04-07 04:00:32.433
232	1	2026-03-12 00:00:00	343	36.08055566741689	31.70313531070822	74.15084786061044	1	2026-04-07 04:00:32.435	2026-04-07 04:00:32.435
233	1	2026-02-23 00:00:00	180	9.208655748888027	5.390432633495431	28.18747064598653	1	2026-04-07 04:00:32.437	2026-04-07 04:00:32.437
234	1	2026-04-08 17:00:00	1884	103	75.19999999999999	126.1	4	2026-04-09 02:46:54.405	2026-04-09 02:47:58.79
238	16	2026-04-08 17:00:00	1806	108.8	60.7	130.6	4	2026-04-09 03:15:33.715	2026-04-09 03:15:56.94
242	16	2026-04-12 17:00:00	2062	138.65	63.05	226.35	4	2026-04-13 03:05:50.814	2026-04-13 03:05:50.814
243	16	2026-04-13 17:00:00	2078	136.85	54.7	139.4	4	2026-04-14 01:53:01.247	2026-04-14 01:53:01.247
244	16	2026-04-14 17:00:00	2096	101.35	80.2	228.05	4	2026-04-15 08:42:29.657	2026-04-15 08:42:29.657
245	16	2026-04-19 17:00:00	2052	124.7	53.85	194.75	4	2026-04-20 02:00:15.563	2026-04-20 02:00:15.563
246	16	2026-04-18 17:00:00	1223	42.6	42.84999999999999	84	4	2026-04-20 06:23:11.693	2026-04-20 06:24:18.57
250	2	2026-04-19 17:00:00	1090	77.9	28.9	77.39999999999999	3	2026-04-20 08:30:30.57	2026-04-20 08:30:30.57
251	2	2026-04-20 17:00:00	1476	92.3	43.8	110.6	3	2026-04-21 02:06:55.226	2026-04-21 02:06:55.226
252	3	2026-04-20 17:00:00	529	45.40000000000001	10.5	45.3	3	2026-04-21 10:09:31.729	2026-04-21 10:09:31.729
253	2	2026-05-06 17:00:00	1404	82.5	23.3	108.7	3	2026-05-07 02:28:18.278	2026-05-07 02:28:18.278
254	2	2026-05-08 17:00:00	1856	128.4	43.59999999999999	195.4	9	2026-05-09 08:02:45.837	2026-05-09 08:02:45.837
255	2	2026-05-10 17:00:00	2157	145.2	43.15	175.9	9	2026-05-11 06:20:45.824	2026-05-11 06:20:45.824
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.favorites (id, "userId", "foodId", "createdAt") FROM stdin;
1	2	25	2026-04-07 04:00:08.573
2	2	14	2026-04-07 04:00:08.59
3	2	28	2026-04-07 04:00:08.595
4	2	6	2026-04-07 04:00:08.599
5	2	15	2026-04-07 04:00:08.603
6	2	22	2026-04-07 04:00:08.607
7	3	12	2026-04-07 04:00:08.634
8	3	3	2026-04-07 04:00:08.639
9	3	16	2026-04-07 04:00:08.644
10	3	23	2026-04-07 04:00:08.651
11	3	6	2026-04-07 04:00:08.658
12	3	22	2026-04-07 04:00:08.663
13	3	8	2026-04-07 04:00:08.666
14	3	28	2026-04-07 04:00:08.669
15	4	19	2026-04-07 04:00:08.692
16	4	29	2026-04-07 04:00:08.697
17	4	21	2026-04-07 04:00:08.7
18	4	25	2026-04-07 04:00:08.705
19	4	17	2026-04-07 04:00:08.71
20	4	7	2026-04-07 04:00:08.716
21	4	24	2026-04-07 04:00:08.719
22	4	4	2026-04-07 04:00:08.726
23	4	11	2026-04-07 04:00:08.73
24	5	15	2026-04-07 04:00:08.755
25	5	8	2026-04-07 04:00:08.759
26	5	22	2026-04-07 04:00:08.763
27	5	12	2026-04-07 04:00:08.766
28	5	10	2026-04-07 04:00:08.77
29	6	3	2026-04-07 04:00:08.808
30	6	25	2026-04-07 04:00:08.819
31	6	29	2026-04-07 04:00:08.828
32	6	7	2026-04-07 04:00:08.834
33	6	20	2026-04-07 04:00:08.841
34	7	26	2026-04-07 04:00:08.868
35	7	17	2026-04-07 04:00:08.875
36	7	27	2026-04-07 04:00:08.884
37	7	9	2026-04-07 04:00:08.893
38	7	7	2026-04-07 04:00:08.897
39	7	14	2026-04-07 04:00:08.901
40	7	3	2026-04-07 04:00:08.906
41	7	2	2026-04-07 04:00:08.911
42	7	28	2026-04-07 04:00:08.915
43	8	4	2026-04-07 04:00:08.947
44	8	21	2026-04-07 04:00:08.952
45	8	1	2026-04-07 04:00:08.959
46	8	18	2026-04-07 04:00:08.963
47	8	25	2026-04-07 04:00:08.967
48	8	27	2026-04-07 04:00:08.971
49	8	3	2026-04-07 04:00:08.976
50	8	6	2026-04-07 04:00:08.98
51	8	19	2026-04-07 04:00:08.984
52	9	6	2026-04-07 04:00:08.999
53	9	21	2026-04-07 04:00:09.004
54	9	20	2026-04-07 04:00:09.014
55	9	16	2026-04-07 04:00:09.021
56	9	26	2026-04-07 04:00:09.031
57	9	13	2026-04-07 04:00:09.04
58	9	25	2026-04-07 04:00:09.048
59	10	26	2026-04-07 04:00:09.07
60	10	11	2026-04-07 04:00:09.077
61	10	10	2026-04-07 04:00:09.082
62	10	3	2026-04-07 04:00:09.093
63	10	6	2026-04-07 04:00:09.098
64	10	17	2026-04-07 04:00:09.103
65	10	7	2026-04-07 04:00:09.109
66	10	24	2026-04-07 04:00:09.115
67	10	9	2026-04-07 04:00:09.119
68	10	8	2026-04-07 04:00:09.124
69	11	7	2026-04-07 04:00:09.143
70	11	21	2026-04-07 04:00:09.152
71	11	4	2026-04-07 04:00:09.163
72	11	25	2026-04-07 04:00:09.168
73	11	23	2026-04-07 04:00:09.174
74	11	18	2026-04-07 04:00:09.18
75	12	28	2026-04-07 04:00:09.199
76	12	24	2026-04-07 04:00:09.203
77	12	5	2026-04-07 04:00:09.211
78	12	16	2026-04-07 04:00:09.215
79	12	14	2026-04-07 04:00:09.219
80	12	23	2026-04-07 04:00:09.228
81	12	21	2026-04-07 04:00:09.232
82	12	27	2026-04-07 04:00:09.237
83	13	25	2026-04-07 04:00:09.26
84	13	14	2026-04-07 04:00:09.264
85	13	23	2026-04-07 04:00:09.268
86	13	12	2026-04-07 04:00:09.274
87	13	3	2026-04-07 04:00:09.28
88	13	15	2026-04-07 04:00:09.284
89	14	10	2026-04-07 04:00:09.314
90	14	20	2026-04-07 04:00:09.318
91	14	11	2026-04-07 04:00:09.325
92	14	9	2026-04-07 04:00:09.329
93	14	14	2026-04-07 04:00:09.333
94	14	26	2026-04-07 04:00:09.337
95	14	22	2026-04-07 04:00:09.342
96	14	18	2026-04-07 04:00:09.346
97	14	25	2026-04-07 04:00:09.35
98	15	28	2026-04-07 04:00:09.382
99	15	18	2026-04-07 04:00:09.387
100	15	2	2026-04-07 04:00:09.395
101	15	23	2026-04-07 04:00:09.399
102	15	10	2026-04-07 04:00:09.403
103	15	6	2026-04-07 04:00:09.409
104	15	7	2026-04-07 04:00:09.413
105	15	30	2026-04-07 04:00:09.418
106	1	26	2026-04-07 04:00:09.449
107	1	17	2026-04-07 04:00:09.454
108	1	23	2026-04-07 04:00:09.463
109	1	24	2026-04-07 04:00:09.467
110	1	14	2026-04-07 04:00:09.472
113	3	29	2026-04-21 09:51:02.298
114	3	129	2026-04-21 09:51:32.015
115	3	69	2026-04-21 09:51:41.013
\.


--
-- Data for Name: food_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.food_items (id, name, slug, category, description, "imageUrl", calories, protein, fat, carbs, fiber, sugar, popularity, "isVegetarian", "isVegan", "isGlutenFree", "createdAt", "updatedAt") FROM stdin;
29	Trái cây dĩa	trái-cây-dĩa	Món nước	Món Trái cây dĩa thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550344779-370250892.jpg	381	16.2	20.3	64.6	\N	\N	271	f	f	f	2026-04-07 03:46:06.131	2026-04-21 09:51:02.316
7	Cháo lòng	cháo-lòng	Cháo	Món Cháo lòng thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550625345-46801753.jpg	541	21.2	6.3	50	\N	\N	218	f	f	f	2026-04-07 03:46:05.831	2026-04-20 09:52:55.408
1	Phở bò	phở-bò	Món nước	Món Phở bò thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550315549-216811785.jpg	517	26.2	18.4	51.8	\N	\N	250	f	f	t	2026-04-07 03:46:05.722	2026-04-15 08:53:37.28
28	Sữa chua	sữa-chua	Món nước	Món Sữa chua thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550359881-190595575.jpg	218	12.4	7.8	10.8	\N	\N	237	f	f	f	2026-04-07 03:46:06.115	2026-04-07 08:25:59.957
27	Chè	chè	Món nước	Món Chè thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550368894-681764692.webp	263	21	11.9	52	\N	\N	59	t	f	f	2026-04-07 03:46:06.098	2026-04-07 08:26:08.904
30	Cà phê sữa đá	cà-phê-sữa-dá	Đồ uống	Món Cà phê sữa đá thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550333416-995670571.jpg	267	16.6	12.4	59.5	\N	\N	10	t	f	f	2026-04-07 03:46:06.145	2026-04-07 08:25:33.462
26	Nem chua	nem-chua	Món nước	Món Nem chua thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550381001-298898557.jpg	321	16.4	9.6	50.2	\N	\N	250	f	f	t	2026-04-07 03:46:06.084	2026-04-07 08:26:21.052
25	Bún đậu mắm tôm	bún-dậu-mắm-tôm	Tráng miệng	Món Bún đậu mắm tôm thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550398678-866233140.jpg	520	7.4	8.1	48.5	\N	\N	105	t	f	f	2026-04-07 03:46:06.072	2026-04-07 08:26:38.772
24	Bún mắm	bún-mắm	Món nước	Món Bún mắm thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550407730-153942670.jpg	467	22.4	23.3	56.2	\N	\N	135	f	t	f	2026-04-07 03:46:06.062	2026-04-07 08:26:47.806
23	Bánh hỏi	bánh-hỏi	Món nước	Món Bánh hỏi thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550418245-135553103.webp	477	26.3	17.7	46.5	\N	\N	60	f	f	f	2026-04-07 03:46:06.05	2026-04-07 08:26:58.25
22	Bánh ướt	bánh-ướt	Món khô	Món Bánh ướt thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550429508-381589817.jpg	482	17	19.6	37	\N	\N	208	f	f	f	2026-04-07 03:46:06.037	2026-04-07 08:27:09.564
21	Bánh bèo	bánh-bèo	Món nước	Món Bánh bèo thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550440484-562316036.jpg	539	31.5	13.7	42.9	\N	\N	67	f	f	f	2026-04-07 03:46:06.029	2026-04-07 08:27:20.6
19	Lẩu Thái	lẩu-thái	Món nước, Lẩu	Món Lẩu Thái thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550465121-566121650.webp	437	29	8.9	28.7	\N	\N	236	f	f	f	2026-04-07 03:46:06.004	2026-04-20 09:53:50.504
10	Hủ tiếu	hủ-tiếu	Hủ tiếu, Món nước	Món Hủ tiếu thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550567001-924819133.jpg	346	11.3	7.1	29.1	\N	\N	45	f	f	f	2026-04-07 03:46:05.888	2026-04-20 09:54:17.301
18	Cà ri gà	cà-ri-gà	Món nước	Món Cà ri gà thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550476086-914650677.webp	368	31.5	6	65.5	\N	\N	39	f	f	f	2026-04-07 03:46:05.997	2026-04-20 09:56:32.092
17	Bò kho	bò-kho	Món nước, Kho	Món Bò kho thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550485113-378825081.jpg	287	19.6	12	35.1	\N	\N	232	f	f	f	2026-04-07 03:46:05.984	2026-04-20 09:56:19.286
16	Chả giò	chả-giò	Đồ khô	Món Chả giò thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550494562-248114193.jpg	362	15.2	12.1	55	\N	\N	167	f	f	f	2026-04-07 03:46:05.973	2026-04-20 09:55:59.261
15	Bánh canh	bánh-canh	Món nước, Mì	Món Bánh canh thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550505951-308431037.webp	460	34.5	12.4	21.2	\N	\N	233	f	f	f	2026-04-07 03:46:05.964	2026-04-20 09:55:46.312
14	Cao lầu	cao-lầu	Mì, Món nước	Món Cao lầu thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550515425-246984637.jpg	259	27.2	23.9	55.9	\N	\N	106	f	f	f	2026-04-07 03:46:05.952	2026-04-20 09:55:28.886
13	Mì Quảng	mì-quảng	Món nước, Mì	Món Mì Quảng thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550529996-325890438.jpg	369	14.8	20.3	15.2	\N	\N	35	f	f	f	2026-04-07 03:46:05.936	2026-04-20 09:54:58.784
12	Bún riêu	bún-riêu	Món nước, Bún	Món Bún riêu thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550539164-568530439.webp	523	18.4	5.7	23.6	\N	\N	84	f	f	f	2026-04-07 03:46:05.922	2026-04-20 09:54:43.273
11	Bánh cuốn	bánh-cuốn	Cuốn	Món Bánh cuốn thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550550038-312998482.webp	475	7	18.7	16.3	\N	\N	66	f	f	f	2026-04-07 03:46:05.908	2026-04-20 09:54:31.293
9	Bánh xèo	bánh-xèo	Món nước	Món Bánh xèo thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550590986-292597408.jpeg	426	32.3	8.1	30	\N	\N	79	f	f	f	2026-04-07 03:46:05.871	2026-04-07 08:29:51.019
20	Bánh bột lọc	bánh-bột-lọc	Ăn nhẹ, Món khô	Món Bánh bột lọc thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550452167-523470570.jpg	446	33.2	13	36.6	\N	\N	189	f	f	f	2026-04-07 03:46:06.016	2026-04-20 09:53:29.873
8	Xôi xéo	xôi-xéo	Món khô, Xôi	Món Xôi xéo thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550612084-817172225.jpg	429	30.8	8.7	25.5	\N	\N	125	f	f	f	2026-04-07 03:46:05.846	2026-04-20 09:53:08.496
6	Bún bò Huế	bún-bò-huế	Bún, Món nước	Món Bún bò Huế thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775547968301-623497345.webp	450	19.1	17	48.9	\N	\N	226	f	f	f	2026-04-07 03:46:05.809	2026-04-20 09:52:39.471
5	Gỏi cuốn	gỏi-cuốn	Món khô, Chấm	Món Gỏi cuốn thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550642091-413074458.webp	538	28.7	26.9	16.7	\N	\N	22	f	f	f	2026-04-07 03:46:05.789	2026-04-20 09:52:24.507
4	Bánh mì	bánh-mì	Ăn nhẹ	Món Bánh mì thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550654642-915270988.webp	311	31.2	17.7	60	\N	\N	72	f	f	f	2026-04-07 03:46:05.77	2026-04-20 09:52:04.179
2	Bún chả	bún-chả	Món nước, Món nướng	Món Bún chả thơm ngon, đậm đà hương vị miền Bắc.	/uploads/1775550684631-23443087.jpg	539	30	25	57.5	\N	\N	193	f	f	f	2026-04-07 03:46:05.748	2026-04-08 08:01:56.132
3	Cơm tấm	cơm-tấm	Cơm, Nướng	Món Cơm tấm thơm ngon, đậm đà hương vị truyền thống.	/uploads/1775550670020-191919052.jpg	536	27.3	19.3	19.3	\N	\N	51	f	f	t	2026-04-07 03:46:05.758	2026-04-20 09:51:50.182
37	Cơm 	cơm-	Cơm	Cơm trắng	/uploads/1776757459510-105458663.webp	130	2.7	0.8	48	4.2	5.6	56	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:44:19.602
69	Rau muốn xào tỏi	rau-muốn-xào-tỏi	Chay, Xào, Rau		/uploads/1776752934710-668931111.jpg	208	19.2	16.6	45.2	6.4	7.2	89	t	t	t	2026-04-20 08:43:38.52	2026-04-21 09:51:41.021
35	Bánh mì trứng	bánh-mì-trứng	Ăn nhẹ		/uploads/1776677563966-470124915.webp	320	24	13	40	2	4	54	f	f	f	2026-04-20 08:43:38.52	2026-04-20 09:32:44.032
36	Bánh mì gà nướng	bánh-mì-gà-nướng	Ăn nhẹ		/uploads/1776677599412-333266685.jpg	348	26.4	14.8	45.2	3.1	4.8	55	f	f	f	2026-04-20 08:43:38.52	2026-04-20 09:33:19.555
38	Cơm gà luộc	cơm-gà-luộc	Cơm		/uploads/1776677740018-200000446.webp	404	31.2	4	55.6	5.3	6.4	57	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:35:40.121
39	Cơm gà nướng	cơm-gà-nướng	Cơm, Nướng		/uploads/1776677791997-544521872.jpg	432	12	5.8	60.8	6.4	7.2	58	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:36:43.876
40	Cơm thịt bò xào	cơm-thịt-bò-xào	Cơm, Xào		/uploads/1776677895151-799895698.jpg	460	14.4	7.6	66	2	0	59	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:38:15.315
41	Canh chua cá	canh-chua-cá	Canh		/uploads/1776677908188-832439491.jpg	488	16.8	9.4	14	3.1	0.8	60	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:38:45.092
42	Canh bí đỏ	canh-bí-dỏ	Canh		/uploads/1776677944645-377866921.jpg	516	19.2	11.2	19.2	4.2	1.6	61	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:39:14.799
43	Canh cải xanh	canh-cải-xanh	Canh		/uploads/1776677982562-616775889.jpg	544	21.6	13	24.4	5.3	2.4	62	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:39:42.657
66	Thịt bò nướng	thịt-bò-nướng	Nướng		/uploads/1776678024599-586854389.jpg	656	12	11.2	29.6	3.1	4.8	85	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:40:24.673
65	Thịt heo luộc	thịt-heo-luộc	Luộc		/uploads/1776678054463-943644998.webp	628	31.2	9.4	24.4	2	4	84	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:40:54.488
64	Tôm xào bông cải	tôm-xào-bông-cải	Xào		/uploads/1776678093800-437943946.webp	600	28.8	7.6	19.2	6.4	3.2	83	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:41:33.926
63	Tôm hấp	tôm-hấp	Hấp		/uploads/1776678120450-677870056.jpg	572	26.4	5.8	14	5.3	2.4	82	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:42:00.545
61	Cá thu kho	cá-thu-kho	Kho		/uploads/1776678144970-828879003.jpg	516	21.6	16.6	60.8	3.1	0.8	80	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:42:25.043
60	Mì xào hải sản	mì-xào-hải-sản	Xào		/uploads/1776678176948-208423889.jpg	488	19.2	14.8	55.6	2	0	79	f	f	f	2026-04-20 08:43:38.52	2026-04-20 09:42:57.111
57	Bún cá	bún-cá	Bún		/uploads/1776678209849-688845911.jpg	404	12	9.4	40	4.2	5.6	76	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:43:29.901
55	Hủ tiếu nam vang	hủ-tiếu-nam-vang	Hủ tiếu		/uploads/1776678241812-78591176.jpg	348	28.8	5.8	29.6	2	4	74	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:44:01.922
54	Miến gà	miến-gà	Miến		/uploads/1776678266132-947430055.jpg	320	26.4	4	24.4	6.4	3.2	73	f	f	f	2026-04-20 08:43:38.52	2026-04-20 09:44:26.195
53	Cơm gạo lứt ứt gà	cơm-gạo-lứt-ứt-gà	Cơm, Giảm cân		/uploads/1776678309445-549530794.webp	292	24	16.6	19.2	5.3	2.4	72	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:45:09.511
52	Cơm gạo lứt cá hồi	cơm-gạo-lứt-cá-hồi	Cơm, Giảm cân		/uploads/1776678344841-577907554.webp	264	21.6	14.8	14	4.2	1.6	71	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:45:44.873
51	Khoai tây nướng	khoai-tây-nướng	Nướng, Chay		/uploads/1776678394172-375951111.jpg	236	19.2	13	66	3.1	0.8	70	t	f	t	2026-04-20 08:43:38.52	2026-04-20 09:46:34.246
50	Khoai lang luộc	khoai-lang-luộc	Luộc, Chay		/uploads/1776678428938-937859299.webp	208	16.8	11.2	60.8	2	0	69	t	f	t	2026-04-20 08:43:38.52	2026-04-20 09:47:08.965
49	Cháo yến mạch	cháo-yến-mạch	Cháo, Bổ dưỡng		/uploads/1776678461486-362566209.jpg	180	14.4	9.4	55.6	6.4	7.2	68	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:47:41.544
48	Sữa chua yến mạch	sữa-chua-yến-mạch	Tráng miệng, Ăn nhẹ, Bổ Dưỡng		/uploads/1776678480585-921044025.jpg	684	12	7.6	50.4	5.3	6.4	67	t	f	t	2026-04-20 08:43:38.52	2026-04-20 09:48:35.362
47	Salad cá ngừ	salad-cá-ngừ	Rau		/uploads/1776678571239-460711212.jpg	656	31.2	5.8	45.2	4.2	5.6	66	t	f	t	2026-04-20 08:43:38.52	2026-04-20 09:49:31.326
46	Salad ức gà	salad-ức-gà	Rau		/uploads/1776678599627-357752058.jpg	628	28.8	4	40	3.1	4.8	65	t	t	t	2026-04-20 08:43:38.52	2026-04-20 09:49:59.705
45	Gà hấp gừng	gà-hấp-gừng	Hấp		/uploads/1776678627367-582759229.jpg	600	26.4	16.6	34.8	2	4	64	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:50:27.459
44	Gà áp chảo	gà-áp-chảo	Xào		/uploads/1776678659731-9342289.jpeg	572	24	14.8	29.6	6.4	3.2	63	f	f	t	2026-04-20 08:43:38.52	2026-04-20 09:50:59.788
74	Sữa chua hạt chia	sữa-chua-hạt-chia	Món uống, Tráng miệng, Giảm cân		/uploads/1776753099097-858161341.jpg	348	31.2	11.2	14	6.4	3.2	93	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:32:08.866
67	Đậu hũ sốt cà chua	dậu-hũ-sốt-cà-chua	Chay, Giảm cân		/uploads/1776751977373-429721645.jpg	684	14.4	13	34.8	4.2	5.6	86	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:13:22.967
68	Đậu hũ xào nấm	dậu-hũ-xào-nấm	Đạm, Chay, Xào		/uploads/1776752904069-105977242.png	180	16.8	14.8	40	5.3	6.4	87	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:28:45.585
70	Rau cải luộc	rau-cải-luộc	Rau, Chay, Giảm Cân		/uploads/1776752965281-640447387.jpg	236	21.6	4	50.4	2	0	89	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:29:45.959
71	Bông cải hấp	bông-cải-hấp	Rau, Chay, Giảm Cân	Mon pho bien #41 trong thu vien thuc don suc khoe.	/uploads/1776752994097-828105313.jpg	264	24	5.8	55.6	3.1	0.8	90	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:30:26.519
72	Trứng ốp la	trứng-ốp-la	Ăn nhẹ, Giảm cân		/uploads/1776753034800-606053700.jpg	292	26.4	7.6	60.8	4.2	1.6	91	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:30:51.896
73	Trứng cuộn rau	trứng-cuộn-rau	Rau, Ăn nhẹ, Giảm cân		/uploads/1776753061028-345832594.webp	320	28.8	9.4	66	5.3	2.4	92	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:31:30.22
99	Lẩu nấm chay	lẩu-nấm-chay	Lẩu, Món nước, Chay		/uploads/1776754816328-965196103.jpg	516	26.4	13	29.6	6.4	7.2	68	t	t	t	2026-04-20 08:43:38.52	2026-04-21 07:00:16.361
96	Gà xào sả ớt	gà-xào-sả-ớt	Xào, Tăng cân		/uploads/1776754891648-594513569.webp	432	19.2	7.6	14	3.1	4.8	65	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:01:50.878
98	Thịt băm sốt đậu	thịt-băm-sốt-dậu	Tăng cân		/uploads/1776754833585-225997564.jpg	488	24	11.2	24.4	5.3	6.4	67	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:00:53.763
97	Bò xào cần tây	bò-xào-cần-tây	Xào, Giảm cân		/uploads/1776754866636-898460646.webp	460	21.6	9.4	19.2	4.2	5.6	66	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:01:24.372
95	Cá ngừ kho dưa	cá-ngừ-kho-dưa	Kho, Giảm cân		/uploads/1776754920640-800309980.jpg	404	16.8	5.8	66	2	4	64	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:02:21.832
94	Cơm cháy kho quẹt	cơm-cháy-kho-quẹt	Cơm, Tăng cân		/uploads/1776754954560-498161694.jpg	376	14.4	4	60.8	6.4	3.2	63	t	t	t	2026-04-20 08:43:38.52	2026-04-21 07:02:51.913
93	Bún chay	bún-chay	Chay, Món khô		/uploads/1776754983702-849544694.jpg	348	12	16.6	55.6	5.3	2.4	62	t	t	t	2026-04-20 08:43:38.52	2026-04-21 07:03:24.696
92	Bún gà nấm	bún-gà-nấm	Bún, Món nước		/uploads/1776755084616-878782663.jpg	320	31.2	14.8	50.4	4.2	1.6	61	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:04:44.812
112	Mì xào bò	mì-xào-bò	Xào, Tăng cân		/uploads/1776756709011-271268664.jpg	348	14.4	7.6	40	4.2	1.6	81	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:32:12.571
113	Phở xào bò	phở-xào-bò	Xào		/uploads/1776756740474-272601113.jpg	376	16.8	9.4	45.2	5.3	2.4	82	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:32:34.288
114	Nui xào bò	nui-xào-bò	Xào		/uploads/1776756775285-340426009.jpg	404	19.2	11.2	50.4	6.4	3.2	83	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:32:55.32
91	Bún mọc	bún-mọc	Bún, Món nước		/uploads/1776753619083-193394290.jpg	292	28.8	13	45.2	3.1	0.8	60	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:40:38.877
75	Sinh tố bơ	sinh-tố-bơ	Chay, Ăn nhẹ, Tráng Miệng		/uploads/1776753136912-443198078.jpg	376	12	13	19.2	2	4	94	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:32:43.89
76	Sinh tố chuối	sinh-tố-chuối	Chay, Ăn nhẹ, Tráng miệng		/uploads/1776753172565-275929561.jpg	404	14.4	14.8	24.4	3.1	4.8	95	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:33:14.55
77	Cháo gà rau củ	cháo-gà-rau-củ	Cháo, Tăng cân		/uploads/1776753205128-510429705.jpg	432	16.8	16.6	29.6	4.2	5.6	96	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:33:53.043
78	Súp bí đỏ	súp-bí-dỏ	Chay, Súp		/uploads/1776753242612-931112190.jpg	460	19.2	4	34.8	5.3	6.4	97	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:34:18.167
79	Súp rau củ	súp-rau-củ	Súp, Giảm cân		/uploads/1776753277493-843610016.webp	488	21.6	5.8	40	6.4	7.2	98	t	t	t	2026-04-20 08:43:38.52	2026-04-21 06:34:54.694
82	Gỏi cuốn tôm thịt	gỏi-cuốn-tôm-thịt	Cuốn, Gỏi		/uploads/1776753381470-848479137.jpg	572	28.8	11.2	55.6	4.2	1.6	51	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:36:41.265
83	Gỏi gà bắp cải	gỏi-gà-bắp-cải	Gỏi, Rau. Giảm cân		/uploads/1776753415218-228732968.jpg	600	31.2	13	60.8	5.3	2.4	52	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:37:15.438
84	Cá kho tộ	cá-kho-tộ	Kho, Tăng cân		/uploads/1776753447585-653228792.jpg	628	12	14.8	66	6.4	3.2	53	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:37:45.091
85	Thịt kho tiêu	thịt-kho-tiêu	Kho		/uploads/1776753481624-422787779.webp	656	14.4	16.6	14	2	4	54	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:38:16.64
86	Bò lúc lắc	bò-lúc-lắc	Tăng cân		/uploads/1776753529222-84330662.jpg	684	16.8	4	19.2	3.1	4.8	55	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:39:04.383
87	Cơm chiên dương châu	cơm-chiên-dương-châu	Cơm, Chiên, Tăng cân		/uploads/1776753557091-769982187.webp	180	19.2	5.8	24.4	4.2	5.6	56	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:39:35.933
88	Cơm chiên cá mặn	cơm-chiên-cá-mặn	Cơm, Chiên, Tăng cân		/uploads/1776753588882-90341423.jpg	208	21.6	7.6	29.6	5.3	6.4	57	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:40:08.884
111	Mì trứng gà	mì-trứng-gà	Ăn nhanh		/uploads/1776754458439-124907640.jpg	320	12	5.8	34.8	3.1	0.8	80	f	f	f	2026-04-20 08:43:38.52	2026-04-21 06:54:33.258
110	Cơm sườn nướng mật ong	cơm-sườn-nướng-mật-ong	Cơm, Nướng, Tăng cân		/uploads/1776754483263-79940108.webp	292	31.2	4	29.6	2	0	79	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:55:05.996
109	Cơm rong biển cá hồi	cơm-rong-biển-cá-hồi	Giảm cân, Cơm		/uploads/1776754518276-902179829.jpg	264	28.8	16.6	24.4	6.4	7.2	78	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:55:37.39
108	Cháo cá hồi	cháo-cá-hồi	Cháo, Tăng cân		/uploads/1776754545224-126106956.jpg	236	26.4	14.8	19.2	5.3	6.4	77	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:55:59.681
107	Cháo tôm	cháo-tôm	Cháo		/uploads/1776754567719-415328464.jpg	208	24	13	14	4.2	5.6	76	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:56:18.249
106	Súp cua	súp-cua	Súp		/uploads/1776754592151-210390389.jpg	180	21.6	11.2	66	3.1	4.8	75	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:56:42.823
105	Tôm rim	tôm-rim	Rim		/uploads/1776754614422-121944458.jpg	684	19.2	9.4	60.8	2	4	74	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:57:07.538
104	Mực xào cần	mực-xào-cần	Xào		/uploads/1776754666923-755085697.jpg	656	16.8	7.6	55.6	6.4	3.2	73	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:57:46.96
103	Mực hấp gừng	mực-hấp-gừng	Hấp, Giảm cân		/uploads/1776754675865-211313117.webp	628	14.4	5.8	50.4	5.3	2.4	72	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:58:10.577
102	Lẩu cá	lẩu-cá	Lẩu, Món nước		/uploads/1776754702938-285970061.jpg	600	12	4	45.2	4.2	1.6	71	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:58:36.775
101	Lẩu hải sản	lẩu-hải-sản	Lẩu, Món nước		/uploads/1776754741310-4414975.jpg	572	31.2	16.6	40	3.1	0.8	70	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:59:01.359
100	Lẩu gà lá é	lẩu-gà-lá-é	Lẩu, Món nước		/uploads/1776754752380-213523328.jpg	544	28.8	14.8	34.8	2	0	69	f	f	t	2026-04-20 08:43:38.52	2026-04-21 06:59:26.612
127	Cơm chiên tôm	cơm-chiên-tôm	Cơm		/uploads/1776757029986-595331756.jpg	236	28.8	5.8	60.8	4.2	5.6	96	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:37:23.934
115	Bánh đa cua	bánh-da-cua	Món nước		/uploads/1776756782564-490117363.jpg	432	21.6	13	55.6	2	4	84	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:33:22.992
116	Bánh canh cua	bánh-canh-cua	Món nước		/uploads/1776756813075-298564124.webp	460	24	14.8	60.8	3.1	4.8	85	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:33:46.973
32	Phở gà	phở-gà	Phở		/uploads/1776675031952-721770209.jpg	236	16.8	7.6	24.4	4.2	1.6	51	f	f	t	2026-04-20 08:43:38.52	2026-04-20 08:50:49.613
117	Bánh canh giò heo	bánh-canh-giò-heo	Món nước		/uploads/1776756854737-571621613.jpg	488	26.4	16.6	66	4.2	5.6	86	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:34:14.817
118	Bánh canh gà	bánh-canh-gà	Món nước		/uploads/1776756878261-423029744.webp	516	28.8	4	14	5.3	6.4	87	f	f	f	2026-04-20 08:43:38.52	2026-04-21 07:34:38.287
119	Xôi gà	xôi-gà	Xôi, Tăng cân		/uploads/1776756898490-441828675.jpg	544	31.2	5.8	19.2	6.4	7.2	88	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:34:58.578
128	Cơm đậu hũ rau	cơm-dậu-hũ-rau	Cơm, Chay		/uploads/1776757067590-875131939.jpg	264	31.2	7.6	66	5.3	6.4	97	t	t	t	2026-04-20 08:43:38.52	2026-04-21 07:37:59.708
120	Xôi đậu xanh	xôi-dậu-xanh	Xôi, Tăng cân		/uploads/1776756908317-628941028.jpg	572	12	7.6	24.4	2	0	89	t	t	t	2026-04-20 08:43:38.52	2026-04-21 07:35:37.623
123	Bún mọc sườn	bún-mọc-sườn	Bún		/uploads/1776756982917-573148996.webp	656	19.2	13	40	5.3	2.4	92	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:36:34.681
124	Bún sườn non	bún-sườn-non	Bún		/uploads/1776757018833-689699314.jpg	684	21.6	14.8	45.2	6.4	3.2	93	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:36:58.91
130	Cơm gà xối mỡ	cơm-gà-xối-mỡ	Cơm, Tăng cân		/uploads/1776757124544-725357438.jpg	320	14.4	11.2	19.2	2	0	99	f	f	t	2026-04-20 08:43:38.52	2026-04-21 07:39:01.098
129	Cơm chay nấm	cơm-chay-nấm	Cơm		/uploads/1776757100758-761591962.jpg	292	12	9.4	14	6.4	7.2	99	t	t	t	2026-04-20 08:43:38.52	2026-04-21 09:51:32.022
\.


--
-- Data for Name: meal_plan_details; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meal_plan_details (id, "mealPlanId", "foodId", "mealType", "dayOfWeek", quantity) FROM stdin;
5	4	26	BREAKFAST	1	1.5
6	4	17	LUNCH	1	2.5
7	4	9	DINNER	1	1.5
8	4	20	SNACK	1	0.5
9	4	1	BREAKFAST	2	1
10	4	15	LUNCH	2	1.5
11	4	19	DINNER	2	1.5
12	4	8	SNACK	2	0.5
13	4	21	BREAKFAST	3	1
14	4	24	LUNCH	3	1.5
15	4	6	DINNER	3	1.5
16	4	16	SNACK	3	0.5
17	4	7	BREAKFAST	4	1
18	4	17	LUNCH	4	2.5
19	4	2	DINNER	4	1
20	4	18	SNACK	4	0.5
21	4	23	BREAKFAST	5	1
22	4	20	LUNCH	5	1.5
23	4	18	DINNER	5	1.5
24	4	4	SNACK	5	0.5
25	4	10	BREAKFAST	6	1.5
26	4	24	LUNCH	6	1.5
27	4	29	DINNER	6	1.5
28	4	13	SNACK	6	0.5
29	4	22	BREAKFAST	0	1
30	4	23	LUNCH	0	1.5
31	4	9	DINNER	0	1.5
32	4	28	SNACK	0	1
33	5	21	BREAKFAST	3	1
34	5	23	LUNCH	3	1.5
35	5	18	DINNER	3	1.5
36	5	20	SNACK	3	0.5
37	5	26	BREAKFAST	4	1.5
38	5	15	LUNCH	4	1.5
39	5	19	DINNER	4	1.5
40	5	16	SNACK	4	0.5
41	5	17	BREAKFAST	5	1.5
42	5	24	LUNCH	5	1.5
43	5	9	DINNER	5	1.5
44	5	6	SNACK	5	0.5
45	5	1	BREAKFAST	6	1
46	5	17	LUNCH	6	2.5
47	5	2	DINNER	6	1
48	5	28	SNACK	6	1
49	5	27	BREAKFAST	0	2
50	5	10	LUNCH	0	2
51	5	18	DINNER	0	1.5
52	5	29	SNACK	0	0.5
53	5	7	BREAKFAST	1	1
54	5	23	LUNCH	1	1.5
55	5	9	DINNER	1	1.5
56	5	4	SNACK	1	0.5
57	5	25	BREAKFAST	2	1
58	5	8	LUNCH	2	1.5
59	5	20	DINNER	2	1.5
60	5	19	SNACK	2	0.5
201	12	20	BREAKFAST	2	0.5
202	12	110	LUNCH	2	0.5
203	12	54	DINNER	2	0.5
204	12	110	BREAKFAST	3	0.5
205	12	108	LUNCH	3	0.5
206	12	74	DINNER	3	1
207	12	77	BREAKFAST	4	0.5
208	12	55	LUNCH	4	0.5
209	12	107	DINNER	4	0.5
210	12	53	BREAKFAST	5	0.5
211	12	9	LUNCH	5	1
212	12	55	DINNER	5	0.5
213	12	15	BREAKFAST	6	1
214	12	54	LUNCH	6	0.5
215	12	74	DINNER	6	1
216	12	109	BREAKFAST	0	0.5
217	12	83	LUNCH	0	0.5
218	12	52	DINNER	0	0.5
219	12	28	BREAKFAST	1	1
220	12	45	LUNCH	1	0.5
221	12	3	DINNER	1	0.5
240	14	55	BREAKFAST	1	0.5
241	14	45	LUNCH	1	0.75
242	14	118	LUNCH	1	1
243	14	37	LUNCH	1	0.5
244	14	88	LUNCH	1	0.5
245	14	110	DINNER	1	0.75
246	14	15	DINNER	1	1
247	14	37	DINNER	1	0.5
248	14	88	DINNER	1	0.5
249	14	110	BREAKFAST	2	0.5
250	14	3	LUNCH	2	0.75
251	14	42	LUNCH	2	1
252	14	37	LUNCH	2	0.5
253	14	69	LUNCH	2	0.5
254	14	70	DINNER	2	0.75
255	14	43	DINNER	2	1
256	14	37	DINNER	2	0.5
257	14	69	DINNER	2	0.5
258	14	54	BREAKFAST	3	0.5
259	14	71	LUNCH	3	0.75
260	14	41	LUNCH	3	1
261	14	37	LUNCH	3	0.5
262	14	69	LUNCH	3	0.5
263	14	65	DINNER	3	0.75
264	14	116	DINNER	3	1
265	14	37	DINNER	3	0.5
266	14	88	DINNER	3	0.5
267	14	110	BREAKFAST	4	0.5
268	14	63	LUNCH	4	0.75
269	14	15	LUNCH	4	1
270	14	37	LUNCH	4	0.5
271	14	69	LUNCH	4	0.5
272	14	38	DINNER	4	0.75
273	14	42	DINNER	4	1
274	14	37	DINNER	4	0.5
275	14	88	DINNER	4	0.5
276	14	20	BREAKFAST	5	0.5
277	14	103	LUNCH	5	0.75
278	14	117	LUNCH	5	1
279	14	37	LUNCH	5	0.5
280	14	69	LUNCH	5	0.5
281	14	39	DINNER	5	0.75
282	14	43	DINNER	5	1
283	14	37	DINNER	5	0.5
284	14	69	DINNER	5	0.5
285	14	32	BREAKFAST	6	0.5
286	14	71	LUNCH	6	0.75
287	14	41	LUNCH	6	1
288	14	37	LUNCH	6	0.5
289	14	88	LUNCH	6	0.5
290	14	3	DINNER	6	0.75
291	14	116	DINNER	6	1
292	14	37	DINNER	6	0.5
293	14	69	DINNER	6	0.5
294	14	53	BREAKFAST	0	0.5
295	14	45	LUNCH	0	0.75
296	14	15	LUNCH	0	1
297	14	37	LUNCH	0	0.5
298	14	69	LUNCH	0	0.5
299	14	36	DINNER	0	0.75
300	14	41	DINNER	0	1
301	14	37	DINNER	0	0.5
302	14	69	DINNER	0	0.5
\.


--
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meal_plans (id, "userId", name, "startDate", "endDate", "isActive", "createdAt") FROM stdin;
2	1	abc	2026-04-09 00:00:00	2026-04-11 00:00:00	t	2026-04-08 06:48:21.184
4	16	Auto Plan 2026-04-13 - 2026-04-19	2026-04-12 17:00:00	2026-04-18 17:00:00	f	2026-04-13 02:49:40.358
5	16	Auto Plan 2026-04-15 - 2026-04-21	2026-04-14 17:00:00	2026-04-20 17:00:00	t	2026-04-15 08:42:36.425
12	3	Auto Plan 2026-04-21 - 2026-04-27	2026-04-20 17:00:00	2026-04-26 17:00:00	t	2026-04-21 10:08:57.443
14	2	Auto Plan 2026-05-11 - 2026-05-17	2026-05-10 17:00:00	2026-05-16 17:00:00	t	2026-05-11 06:20:42.165
\.


--
-- Data for Name: meals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.meals (id, "userId", "foodId", "mealType", "eatenAt", quantity, calories, protein, fat, carbs, "imageUrl", notes, "isFromAI", "createdAt") FROM stdin;
1	2	25	LUNCH	2026-01-28 06:13:33.918	1.142942882437711	594	8.457777330039063	9.257837347745461	55.432729798229	\N	\N	f	2026-04-07 03:59:40.12
2	2	21	BREAKFAST	2026-04-05 09:11:27.312	1.742556763282981	939	54.89053804341391	23.87302765697684	74.75568514483989	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.173
3	2	4	DINNER	2026-02-07 21:12:19.38	0.959984852329542	298	29.95152739268171	16.99173188623289	57.59909113977252	\N	\N	t	2026-04-07 03:59:40.176
4	2	12	BREAKFAST	2026-03-23 14:16:22.925	0.5577484925335523	291	10.26257226261736	3.179166407441248	13.16286442379183	\N	\N	t	2026-04-07 03:59:40.179
5	2	19	BREAKFAST	2026-03-30 10:59:52.326	1.890097945084382	825	54.81284040744708	16.821871711251	54.24581102392177	\N	\N	f	2026-04-07 03:59:40.182
6	2	15	BREAKFAST	2026-03-25 06:12:43.641	0.9637479768764042	443	33.24930520223594	11.95047491326741	20.43145710977977	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.186
7	2	19	DINNER	2026-02-12 19:59:46.938	0.5806234375294137	253	16.838079688353	5.167548594011782	16.66389265709417	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.191
8	2	12	SNACK	2026-01-11 12:16:46.896	1.738012762198893	908	31.97943482445962	9.906672744533688	41.01710118789387	\N	\N	f	2026-04-07 03:59:40.194
9	2	4	LUNCH	2026-03-18 01:06:07.294	1.177739818653738	366	36.74548234199663	20.84599479017116	70.66438911922428	\N	\N	f	2026-04-07 03:59:40.198
10	2	28	LUNCH	2026-03-07 07:22:48.571	1.392451633755408	303	17.26640025856707	10.86112274329219	15.03847764455841	\N	\N	f	2026-04-07 03:59:40.2
11	2	12	LUNCH	2026-02-20 00:42:35.722	0.7256117675052337	379	13.3512565220963	4.135987074779832	17.12443771312352	\N	\N	f	2026-04-07 03:59:40.203
12	2	19	SNACK	2026-03-15 20:31:14.107	1.310046168947064	572	37.99133889946485	11.65941090362887	37.59832504878073	\N	\N	f	2026-04-07 03:59:40.206
13	2	13	SNACK	2026-01-16 21:02:38.411	1.330161652093961	490	19.68639245099062	27.0022815375074	20.2184571118282	\N	\N	f	2026-04-07 03:59:40.209
14	2	18	SNACK	2026-02-22 02:54:34.889	1.582440849144576	582	49.84688674805415	9.494645094867456	103.6498756189697	\N	\N	t	2026-04-07 03:59:40.212
15	2	3	BREAKFAST	2026-01-19 14:07:05.978	1.512302610096262	810	41.28586125562794	29.18744037485785	29.18744037485785	\N	\N	t	2026-04-07 03:59:40.215
16	3	29	LUNCH	2026-03-08 12:26:42.21	0.9756818473778861	371	15.80604592752175	19.80634150177109	63.02904734061143	\N	\N	f	2026-04-07 03:59:40.22
17	3	19	DINNER	2026-03-16 06:52:57.465	0.7136891379935065	311	20.69698500181169	6.351833328142209	20.48287826041364	\N	\N	f	2026-04-07 03:59:40.224
18	3	17	DINNER	2026-03-18 12:22:17.391	1.289667525305854	370	25.27748349599473	15.47601030367024	45.26733013823547	\N	\N	f	2026-04-07 03:59:40.227
19	3	9	SNACK	2026-02-10 08:42:27.516	1.52428665232306	649	49.23445887003484	12.34672188381679	45.7285995696918	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.231
20	3	16	LUNCH	2026-04-03 10:29:54.684	1.861389602038695	673	28.29312195098817	22.52281418466821	102.3764281121282	\N	\N	f	2026-04-07 03:59:40.235
21	3	8	BREAKFAST	2026-04-02 14:25:03.682	1.998323455614426	857	61.54836243292431	17.3854140638455	50.95724811816786	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.239
22	3	27	BREAKFAST	2026-02-18 06:44:53.985	1.977446474559727	520	41.52637596575427	23.53161304726075	102.8272166771058	\N	\N	f	2026-04-07 03:59:40.245
23	3	19	DINNER	2026-01-12 09:06:46.826	1.726346794630555	754	50.06405704428609	15.36448647221194	49.54615300589692	\N	\N	f	2026-04-07 03:59:40.25
24	3	22	DINNER	2026-03-10 20:03:23.604	1.036133930356188	499	17.6142768160552	20.30822503498129	38.33695542317896	\N	\N	t	2026-04-07 03:59:40.255
25	3	17	LUNCH	2026-03-26 02:14:34.312	1.375138134131383	394	26.95270742897511	16.50165760957659	48.26734850801154	\N	\N	f	2026-04-07 03:59:40.26
26	3	22	LUNCH	2026-02-25 10:22:40.244	1.730897030681479	834	29.42524952158515	33.925581801357	64.04319013521473	\N	\N	f	2026-04-07 03:59:40.264
27	3	29	SNACK	2026-03-18 19:40:17.033	1.84198712542596	701	29.84019143190055	37.39233864614699	118.992368302517	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.267
28	3	15	LUNCH	2026-02-11 07:11:02.431	1.681108769656788	773	57.99825255315918	20.84574874374417	35.6395059167239	\N	\N	t	2026-04-07 03:59:40.271
29	3	10	SNACK	2026-03-03 00:08:52.742	1.233181851552729	426	13.93495492254584	8.755591146024374	35.88559188018441	\N	\N	f	2026-04-07 03:59:40.274
30	3	2	BREAKFAST	2026-03-26 09:23:14.797	1.632077847572094	879	34.11042701425676	14.03586948912001	50.10478992046329	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.277
31	3	15	LUNCH	2026-02-07 08:06:10.019	1.201336050450179	552	41.44609374053116	14.89656702558222	25.46832426954379	\N	\N	f	2026-04-07 03:59:40.28
32	4	16	DINNER	2026-03-16 19:27:37.357	1.796091146661471	650	27.30058542925435	21.7327028746038	98.78501306638088	\N	\N	f	2026-04-07 03:59:40.282
33	4	11	LUNCH	2026-04-03 23:35:22.741	0.902283784164436	428	6.315986489151052	16.87270676387495	14.70722568188031	\N	\N	t	2026-04-07 03:59:40.286
34	4	16	LUNCH	2026-03-11 07:44:20.063	0.5215130854377943	188	7.926998898654473	6.310308333797311	28.68321969907868	\N	\N	t	2026-04-07 03:59:40.29
35	4	22	SNACK	2026-02-01 02:14:27.615	1.011446993972579	487	17.19459889753384	19.82436108186254	37.42353877698542	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.293
36	4	7	DINNER	2026-02-21 05:45:12.349	0.9398707437099936	508	19.92525976665186	5.92118568537296	46.99353718549968	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.295
37	4	29	DINNER	2026-01-17 11:57:17.211	1.808738541290271	689	29.30156436890239	36.71739238819251	116.8445097673515	\N	\N	t	2026-04-07 03:59:40.298
38	4	20	DINNER	2026-01-31 15:03:51.899	1.247104585184732	556	41.40387222813312	16.21235960740152	45.64402781776121	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.3
39	4	22	DINNER	2026-03-11 12:06:43.118	1.08389676697389	522	18.42624503855614	21.24437663268825	40.10418037803394	\N	\N	f	2026-04-07 03:59:40.303
40	4	28	BREAKFAST	2026-03-22 05:46:51.881	1.542815226512435	336	19.1309088087542	12.03395876679699	16.6624044463343	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.307
41	4	15	BREAKFAST	2026-03-01 02:34:44.396	1.735067382068501	798	59.8598246813633	21.51483553764942	36.78342849985223	\N	\N	f	2026-04-07 03:59:40.313
42	4	5	SNACK	2026-01-24 19:17:08.35	0.6688015850714395	359	19.19460549155031	17.99076263842172	11.16898647069304	\N	\N	f	2026-04-07 03:59:40.316
43	4	5	BREAKFAST	2026-03-10 09:24:42.592	1.401271620469493	753	40.21649550747446	37.69420659062937	23.40123606184054	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.32
44	4	20	BREAKFAST	2026-03-04 04:08:05.201	0.8603504175001714	383	28.56363386100569	11.18455542750223	31.48882528050627	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.325
45	4	13	SNACK	2026-03-19 01:04:59.792	1.088411653826081	401	16.108492476626	22.09475657266945	16.54385713815644	\N	\N	t	2026-04-07 03:59:40.329
46	4	19	LUNCH	2026-01-10 01:57:26.537	1.474925742258793	644	42.772846525505	13.12683910610326	42.33036880282736	\N	\N	f	2026-04-07 03:59:40.332
47	4	3	SNACK	2026-03-09 15:17:04.47	1.460566619074251	782	39.87346870072706	28.18893574813305	28.18893574813305	\N	\N	f	2026-04-07 03:59:40.335
48	4	10	SNACK	2026-03-11 18:43:14.224	1.832693217168799	634	20.70943335400743	13.01212184189847	53.33137261961205	\N	\N	f	2026-04-07 03:59:40.34
49	4	2	BREAKFAST	2026-02-27 13:27:24.769	1.508642929583647	813	31.53063722829823	12.97432919441937	46.31533793821797	\N	\N	f	2026-04-07 03:59:40.342
50	5	12	SNACK	2026-02-12 05:05:31.675	0.9360354207768702	489	17.22305174229441	5.33540189842816	22.09043593033414	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.345
51	5	15	LUNCH	2026-02-10 23:26:11.718	1.975553050711526	908	68.15658024954766	24.49685782882293	41.88172467508436	\N	\N	f	2026-04-07 03:59:40.347
52	5	13	DINNER	2026-02-25 15:04:59.662	1.197365987644778	441	17.72101661714271	24.30652954918898	18.19996301220062	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.349
53	5	27	BREAKFAST	2026-04-03 13:06:19.563	0.6992922268070587	183	14.68513676294823	8.321577499003999	36.36319579396705	\N	\N	f	2026-04-07 03:59:40.352
54	5	12	LUNCH	2026-01-25 00:56:47.126	1.13668652564111	594	20.91503207179642	6.479113196154326	26.82580200513019	\N	\N	t	2026-04-07 03:59:40.355
55	5	12	SNACK	2026-01-22 10:46:48.942	1.696007197207793	887	31.20653242862339	9.667241024084422	40.02576985410392	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.358
56	5	26	SNACK	2026-01-14 17:31:12.951	0.7905719036714376	253	12.96537922021158	7.589490275245801	39.68670956430617	\N	\N	f	2026-04-07 03:59:40.36
57	5	9	BREAKFAST	2026-03-14 00:37:34.615	1.454091440838915	619	46.96715353909695	11.77814067079521	43.62274322516745	\N	\N	f	2026-04-07 03:59:40.363
58	5	6	BREAKFAST	2026-01-31 03:17:55.738	1.405120165455615	632	26.83779516020225	23.88704281274546	68.71037609077958	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.365
59	5	23	BREAKFAST	2026-01-17 21:49:28.596	1.854609566271418	884	48.7762315929383	32.8265893230041	86.23934483162094	\N	\N	f	2026-04-07 03:59:40.368
60	5	23	LUNCH	2026-02-10 23:31:54.157	0.7824534405266804	373	20.5785254858517	13.84942589732224	36.38408498449064	\N	\N	t	2026-04-07 03:59:40.372
61	5	30	SNACK	2026-01-16 02:29:12.038	1.437544941544558	383	23.86324602963966	17.82555727515252	85.53392402190119	\N	\N	f	2026-04-07 03:59:40.375
62	5	9	SNACK	2026-02-21 15:16:21.73	1.875264681173645	798	60.57104920190873	15.18964391750652	56.25794043520935	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.381
63	5	30	BREAKFAST	2026-04-04 03:30:32.394	1.679467837544255	448	27.87916610323464	20.82540118554877	99.9283363338832	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.385
64	5	20	BREAKFAST	2026-04-05 19:27:31.388	0.6126062744181909	273	20.33852831068394	7.963881567436482	22.42138964370579	\N	\N	f	2026-04-07 03:59:40.391
65	5	4	DINNER	2026-03-20 21:26:03.148	1.500471797656382	466	46.81472008687913	26.55835081851797	90.02830785938295	\N	\N	f	2026-04-07 03:59:40.394
66	6	27	SNACK	2026-01-21 08:30:30.582	0.986527597624912	259	20.71707955012315	11.73967841173645	51.29943507649543	\N	\N	f	2026-04-07 03:59:40.397
67	6	1	SNACK	2026-02-07 13:04:25.351	1.017932206105636	521	26.66982379996767	25.95727125569372	18.93353903356483	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.4
68	6	3	BREAKFAST	2026-02-14 21:41:45.464	1.060317596384643	568	28.94667038130075	20.46412961022361	20.46412961022361	\N	\N	t	2026-04-07 03:59:40.403
69	6	26	LUNCH	2026-04-04 18:53:55.121	1.806519475364055	579	29.62691939597051	17.34258696349493	90.6872776632756	\N	\N	f	2026-04-07 03:59:40.414
70	6	4	BREAKFAST	2026-03-16 06:18:02.71	0.6833775947993107	212	21.32138095773849	12.0957834279478	41.00265568795864	\N	\N	f	2026-04-07 03:59:40.417
71	6	24	SNACK	2026-03-20 18:53:41.958	0.8155064600175724	380	18.26734470439362	19.00130051840944	45.83146305298757	\N	\N	f	2026-04-07 03:59:40.42
72	6	27	SNACK	2026-02-03 21:54:37.873	1.634798900253127	429	34.33077690531566	19.45410691301221	85.00954281316258	\N	\N	f	2026-04-07 03:59:40.424
73	6	30	DINNER	2026-03-31 14:01:36.07	1.606167120620794	428	26.66237420230518	19.91647229569785	95.56694367693726	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.427
74	6	9	LUNCH	2026-01-17 13:39:40.009	0.8504707508156881	362	27.47020525134672	6.888813081607074	25.51412252447064	\N	\N	f	2026-04-07 03:59:40.433
75	6	27	DINNER	2026-01-23 13:03:08.438	0.9499571737948822	249	19.94910064969253	11.3044903681591	49.39777303733388	\N	\N	f	2026-04-07 03:59:40.437
76	6	14	BREAKFAST	2026-03-24 22:43:51.556	1.26707895520658	328	34.46454758161897	30.28318702943725	70.82971359604781	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.443
77	6	3	LUNCH	2026-02-25 22:14:52.257	1.7376349199179	931	47.43743331375867	33.53635395441547	33.53635395441547	\N	\N	f	2026-04-07 03:59:40.447
78	6	18	LUNCH	2026-04-02 17:59:29.484	1.303664939697558	479	41.06544560047309	7.82198963818535	85.39005355019007	\N	\N	f	2026-04-07 03:59:40.451
79	6	6	LUNCH	2026-03-04 06:32:09.049	1.893129175822537	851	36.15876725821045	32.18319598898312	92.57401669772203	\N	\N	f	2026-04-07 03:59:40.456
80	6	21	LUNCH	2026-03-30 06:47:58.179	1.476020132330669	795	46.49463416841606	20.22147581293016	63.32126367698569	\N	\N	t	2026-04-07 03:59:40.461
81	6	18	DINNER	2026-04-06 17:00:07.02	0.543233357732281	199	17.11185076856685	3.259400146393686	35.58178493146441	\N	\N	t	2026-04-07 03:59:40.465
82	6	28	BREAKFAST	2026-03-31 04:54:06.47	1.528103287006127	333	18.94848075887598	11.91920563864779	16.50351549966618	\N	\N	t	2026-04-07 03:59:40.469
83	6	20	BREAKFAST	2026-02-25 14:55:37.654	1.159882396528157	517	38.5080955647348	15.07847115486604	42.45169571293054	\N	\N	f	2026-04-07 03:59:40.473
84	7	30	BREAKFAST	2026-03-20 03:26:10.538	0.9034744291782648	241	14.9976755243592	11.20308292181048	53.75672853610676	\N	\N	f	2026-04-07 03:59:40.478
85	7	20	BREAKFAST	2026-01-09 03:31:16.502	1.245629509531495	555	41.35489971644565	16.19318362390944	45.59004004885273	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.482
86	7	7	DINNER	2026-03-12 16:44:16.061	0.7722794727051704	417	16.37232482134961	4.865360678042573	38.61397363525852	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.487
87	7	23	DINNER	2026-01-25 21:53:44.9	0.8653030302440471	412	22.75746969541844	15.31586363531963	40.23659090634819	\N	\N	t	2026-04-07 03:59:40.491
88	7	1	LUNCH	2026-03-21 01:28:27.737	1.975317114817326	1011	51.75330840821394	50.37058642784181	36.74089833560227	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.496
89	7	11	DINNER	2026-01-16 22:22:43.304	0.5209934057050962	247	3.646953839935674	9.742576686685299	8.49219251299307	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.501
90	7	5	LUNCH	2026-04-06 04:30:17.129	0.8572386877333915	461	24.60275033794834	23.05972070002823	14.31588608514764	\N	\N	f	2026-04-07 03:59:40.507
91	7	12	BREAKFAST	2026-03-11 20:12:32.085	1.076765939371603	563	19.8124932844375	6.137565854418139	25.41167616916984	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.512
92	7	16	LUNCH	2026-01-28 13:18:46.482	1.800982536112516	651	27.37493454891024	21.79188868696144	99.05403948618836	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.517
93	7	7	LUNCH	2026-01-11 15:43:30.602	1.221469199746664	660	25.89514703462927	7.695255958403981	61.07345998733318	\N	\N	f	2026-04-07 03:59:40.522
94	7	17	LUNCH	2026-04-06 21:50:59.294	1.558523996779063	447	30.54707033686964	18.70228796134876	54.70419228694512	\N	\N	f	2026-04-07 03:59:40.526
95	7	21	DINNER	2026-03-02 11:06:09.342	1.269060417197871	684	39.97540314173293	17.38612771561083	54.44269189778864	\N	\N	f	2026-04-07 03:59:40.53
96	7	16	SNACK	2026-02-19 12:59:55.308	1.346106437831055	487	20.46081785503204	16.28788789775577	74.03585408070803	\N	\N	f	2026-04-07 03:59:40.534
97	7	5	SNACK	2026-01-27 14:40:42.827	1.593687078101731	857	45.73881914151969	42.87018240093657	26.61457420429891	\N	\N	t	2026-04-07 03:59:40.539
98	7	8	SNACK	2026-01-09 19:50:07.623	0.7425451580776542	318	22.87039086879175	6.460142875275591	18.93490153098018	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.543
99	7	2	SNACK	2026-03-24 20:04:39.86	1.44632564529875	779	30.22820598674388	12.43840054956925	44.40219731067163	\N	\N	f	2026-04-07 03:59:40.546
100	7	22	LUNCH	2026-01-28 15:34:29.817	1.714413874426925	826	29.14503586525773	33.60251193876773	63.43331335379623	\N	\N	f	2026-04-07 03:59:40.55
101	8	10	DINNER	2026-01-13 20:59:00.232	0.9169572400474609	317	10.36161681253631	6.510396404336972	26.68345568538112	\N	\N	f	2026-04-07 03:59:40.555
102	8	7	SNACK	2026-03-16 08:35:48.047	1.665971950792571	901	35.31860535680251	10.4956232899932	83.29859753962857	\N	\N	f	2026-04-07 03:59:40.558
103	8	27	DINNER	2026-02-06 06:17:15.316	0.8711045015403552	229	18.29319453234746	10.36614356833023	45.29743408009847	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.561
104	8	27	SNACK	2026-03-28 08:22:05.497	0.5942104748336424	156	12.47841997150649	7.071104650520345	30.89894469134941	\N	\N	f	2026-04-07 03:59:40.563
105	8	17	BREAKFAST	2026-02-08 14:14:08.536	0.5931360391503894	170	11.62546636734763	7.117632469804672	20.81907497417867	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.565
106	8	22	DINNER	2026-01-10 07:54:46.642	0.5338943874412492	257	9.076204586501236	10.46432999384848	19.75409233532622	\N	\N	f	2026-04-07 03:59:40.569
107	8	17	LUNCH	2026-03-08 20:20:09.715	1.692417510247552	485	33.17138320085202	20.30901012297062	59.40385460968907	\N	\N	f	2026-04-07 03:59:40.573
108	8	6	LUNCH	2026-02-02 23:01:07.22	1.722810286143114	775	32.90567646533347	29.28777486443293	84.24542299239825	\N	\N	f	2026-04-07 03:59:40.578
109	8	28	BREAKFAST	2026-02-16 02:10:06.633	1.168914536713922	254	14.49454025525264	9.117533386368592	12.62427699651036	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.584
110	8	28	LUNCH	2026-01-14 02:38:28.349	1.492160726279623	325	18.50279300586733	11.63885366498106	16.11533584381993	\N	\N	f	2026-04-07 03:59:40.589
111	8	7	LUNCH	2026-03-12 14:55:54.888	1.600987843672458	866	33.94094228585611	10.08622341513649	80.0493921836229	\N	\N	f	2026-04-07 03:59:40.594
112	8	5	BREAKFAST	2026-03-17 11:47:50.154	0.6795118398345094	365	19.50198980325042	18.2788684915483	11.34784772523631	\N	\N	f	2026-04-07 03:59:40.598
113	8	21	LUNCH	2026-01-19 12:08:44.145	1.879028366519609	1012	59.18939354536769	25.74268862131865	80.61031692369123	\N	\N	f	2026-04-07 03:59:40.602
114	8	5	LUNCH	2026-02-15 13:41:07.522	1.967223402891477	1058	56.45931166298539	52.91830953778073	32.85263082828767	\N	\N	t	2026-04-07 03:59:40.606
115	8	9	BREAKFAST	2026-02-21 08:25:31.505	0.5004701959784569	213	16.16518733010416	4.0538085874255	15.01410587935371	\N	\N	f	2026-04-07 03:59:40.61
116	9	23	LUNCH	2026-02-24 21:48:04.285	0.5718050296292878	272	15.03847227925027	10.12094902443839	26.58893387776188	\N	\N	f	2026-04-07 03:59:40.613
117	9	29	SNACK	2026-02-28 19:17:50.706	1.764566877454242	672	28.58598341475872	35.82070761232112	113.991020283544	\N	\N	t	2026-04-07 03:59:40.616
118	9	20	LUNCH	2026-02-06 02:51:37.879	1.498947022163743	668	49.76504113583628	19.48631128812866	54.861461011193	\N	\N	f	2026-04-07 03:59:40.619
119	9	6	SNACK	2026-03-22 13:06:39.251	1.460094518263822	657	27.887805298839	24.82160681048497	71.39862194310089	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.622
120	9	21	DINNER	2026-02-06 06:42:46.916	1.723231466076457	928	54.28179118140839	23.60827108524746	73.92662989468	\N	\N	f	2026-04-07 03:59:40.626
121	9	26	DINNER	2026-03-30 02:50:33.825	1.34922899831963	433	22.12735557244193	12.95259838386845	67.73129571564544	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.629
122	9	24	SNACK	2026-02-18 07:50:02.16	1.231318911036678	575	27.58154360722158	28.68973062715459	69.20012280026128	\N	\N	f	2026-04-07 03:59:40.632
123	9	30	BREAKFAST	2026-03-11 15:46:03.342	1.979053107938	528	32.8522815917708	24.5402585384312	117.753659922311	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.637
124	9	10	SNACK	2026-03-10 14:35:26.445	1.674586981615357	579	18.92283289225353	11.88956756946903	48.73048116500688	\N	\N	f	2026-04-07 03:59:40.641
125	9	13	DINNER	2026-02-01 17:56:29.399	1.009246291312645	372	14.93684511142715	20.48769971364669	15.3405436279522	\N	\N	f	2026-04-07 03:59:40.648
126	9	4	DINNER	2026-01-17 04:17:36.508	1.768698884308157	550	55.18340519041448	31.30597025225437	106.1219330584894	\N	\N	f	2026-04-07 03:59:40.651
127	9	20	LUNCH	2026-02-27 02:21:49.695	1.543839636607878	688	51.25547593538155	20.06991527590241	56.50453069984832	\N	\N	f	2026-04-07 03:59:40.655
128	9	22	LUNCH	2026-03-10 08:26:41.831	1.816446638970598	875	30.87959286250017	35.60235412382373	67.20852564191213	\N	\N	f	2026-04-07 03:59:40.66
129	9	21	SNACK	2026-02-14 11:52:53.795	1.246084126965024	671	39.25164999939827	17.07135253942083	53.45700904679955	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.663
130	9	5	DINNER	2026-01-21 09:44:50.612	0.550628610779962	296	15.80304112938491	14.81190962998098	9.195497800025365	\N	\N	f	2026-04-07 03:59:40.666
131	9	5	DINNER	2026-04-03 07:30:09.037	1.619599968384485	871	46.48251909263472	43.56723914954264	27.0473194720209	\N	\N	f	2026-04-07 03:59:40.67
132	9	14	SNACK	2026-03-20 07:09:47.84	1.339472168076459	346	36.43364297167968	32.01338481702737	74.87649419547405	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.674
133	9	24	LUNCH	2026-02-07 12:12:42.172	0.8090250337359298	377	18.12216075568483	18.85028328604717	45.46720689595926	\N	\N	f	2026-04-07 03:59:40.677
134	9	16	SNACK	2026-02-24 02:08:23.933	1.713267476537296	620	26.0416656433669	20.73053646610128	94.2297112095513	\N	\N	f	2026-04-07 03:59:40.68
135	10	29	SNACK	2026-03-14 04:45:09.271	1.688021305600094	643	27.34594515072152	34.26683250368191	109.0461763417661	\N	\N	f	2026-04-07 03:59:40.683
136	10	2	BREAKFAST	2026-03-03 19:47:11.8	1.152241502821447	621	24.08184740896824	9.909276924264443	35.37381413661842	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.687
137	10	3	BREAKFAST	2026-04-02 20:36:06.331	1.166926721931477	625	31.85709950872932	22.5216857332775	22.5216857332775	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.69
138	10	16	SNACK	2026-03-05 06:45:53.569	0.8178893996258935	296	12.43191887431358	9.896461735473311	44.98391697942414	\N	\N	f	2026-04-07 03:59:40.693
139	10	11	DINNER	2026-01-14 04:02:01.684	1.211513133050628	575	8.480591931354398	22.65529558804675	19.74766406872524	\N	\N	f	2026-04-07 03:59:40.696
140	10	26	BREAKFAST	2026-03-23 18:29:31.312	1.13728744572861	365	18.6515141099492	10.91795947899466	57.09182977557622	\N	\N	t	2026-04-07 03:59:40.698
141	10	22	DINNER	2026-02-20 11:55:20.099	1.630474954357993	785	27.71807422408587	31.95730910541666	60.32757331124573	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.701
142	10	24	BREAKFAST	2026-03-03 12:05:26.102	0.9424264125955746	440	21.11035164214087	21.95853541347689	52.96436438787129	\N	\N	f	2026-04-07 03:59:40.705
143	10	16	LUNCH	2026-01-18 19:00:43.434	1.842820165563116	667	28.01086651655936	22.29812400331371	101.3551091059714	\N	\N	t	2026-04-07 03:59:40.709
144	10	10	SNACK	2026-01-14 13:06:04.568	0.5782357015713829	200	6.534063427756627	4.105473481156818	16.82665891572724	\N	\N	f	2026-04-07 03:59:40.716
145	10	21	LUNCH	2026-01-16 01:34:57.239	1.263167857080751	680	39.78978749804364	17.30539964200628	54.18990106876419	\N	\N	f	2026-04-07 03:59:40.719
146	10	13	SNACK	2026-02-12 04:49:52.612	1.951107506850912	719	28.8763911013935	39.60748238907351	29.65683410413386	\N	\N	f	2026-04-07 03:59:40.726
147	10	17	SNACK	2026-03-15 17:47:36.914	1.432255675376394	411	28.07221123737732	17.18706810451673	50.27217420571143	\N	\N	t	2026-04-07 03:59:40.73
148	10	25	BREAKFAST	2026-01-27 13:43:46.136	1.698002559794328	882	12.56521894247803	13.75382073433406	82.35312415002491	\N	\N	f	2026-04-07 03:59:40.733
149	10	4	SNACK	2026-01-12 13:39:43.491	1.86355406812737	579	58.14288692557395	32.98490700585445	111.8132440876422	\N	\N	f	2026-04-07 03:59:40.737
150	10	1	LUNCH	2026-02-10 04:50:24.05	1.491339182466119	763	39.0730865806123	38.02914915288603	27.73890879386981	\N	\N	f	2026-04-07 03:59:40.741
151	10	13	SNACK	2026-01-29 00:03:29.767	1.667078327585498	615	24.67275924826538	33.84169004998562	25.33959057929957	\N	\N	f	2026-04-07 03:59:40.744
152	10	21	LUNCH	2026-01-09 05:40:49.298	1.097877626923288	591	34.58314524808357	15.04092348884904	47.09895019500905	\N	\N	f	2026-04-07 03:59:40.747
153	10	3	BREAKFAST	2026-02-14 05:56:41.767	0.9594018067822242	514	26.19166932515472	18.51645487089693	18.51645487089693	\N	\N	f	2026-04-07 03:59:40.75
154	11	2	BREAKFAST	2026-04-06 10:56:32.025	1.202432906930635	648	25.13084775485026	10.34092299960346	36.91469024277048	\N	\N	f	2026-04-07 03:59:40.755
155	11	3	DINNER	2026-03-18 00:44:21.476	0.7951480199440479	426	21.70754094447251	15.34635678492013	15.34635678492013	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.758
156	11	27	DINNER	2026-03-19 04:26:53.108	1.662787611689328	437	34.91853984547588	19.787172579103	86.46495580784504	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.761
157	11	11	LUNCH	2026-03-19 22:53:32.305	0.6665923119900337	316	4.666146183930236	12.46527623421363	10.86545468543755	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.764
158	11	28	BREAKFAST	2026-03-03 18:48:57.697	0.5939822198964565	129	7.365379526716061	4.633061315192361	6.415007974881731	\N	\N	f	2026-04-07 03:59:40.767
159	11	11	DINNER	2026-03-09 01:36:07.506	0.9790459833892965	465	6.853321883725076	18.30815988937984	15.95844952924553	\N	\N	t	2026-04-07 03:59:40.772
160	11	17	LUNCH	2026-03-25 00:58:56.862	0.9233796874822918	265	18.09824187465292	11.0805562497875	32.41062703062845	\N	\N	f	2026-04-07 03:59:40.779
161	11	29	SNACK	2026-02-22 08:48:12.404	1.909484667010371	727	30.93365160556801	38.76253874031054	123.35270948887	\N	\N	t	2026-04-07 03:59:40.782
162	11	27	SNACK	2026-02-24 12:47:26.068	0.6695185495272695	176	14.05988954007266	7.967270739374507	34.81496457541802	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.786
163	11	6	LUNCH	2026-01-14 15:01:35.512	1.011718274181104	455	19.32381903685908	17.19921066107877	49.47302360745598	\N	\N	f	2026-04-07 03:59:40.792
164	11	21	BREAKFAST	2026-02-15 01:40:04.591	0.5670490442429444	305	17.86204489365275	7.768571906128338	24.32640399802231	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.797
165	11	2	SNACK	2026-04-04 21:54:16.73	0.761039039009839	410	15.90571591530563	6.544935735484615	23.36389849760206	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.8
166	11	27	LUNCH	2026-03-28 03:00:07.246	0.7164195222249664	188	15.04480996672429	8.5253923144771	37.25381515569826	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.803
167	11	6	SNACK	2026-03-06 13:25:50.822	0.5790011472633406	260	11.05892191272981	9.84301950347679	28.31315610117736	\N	\N	f	2026-04-07 03:59:40.807
168	11	30	DINNER	2026-02-15 13:50:41.5	0.5605098814400865	149	9.304464031905438	6.950322529857073	33.35033794568515	\N	\N	f	2026-04-07 03:59:40.81
169	11	13	DINNER	2026-01-26 12:33:47.592	1.988488575173911	733	29.42963091257388	40.3663180760304	30.22502634264345	\N	\N	f	2026-04-07 03:59:40.814
170	11	4	DINNER	2026-01-29 23:27:41.47	1.516249903914419	471	47.30699700212987	26.83762329928521	90.97499423486514	\N	\N	f	2026-04-07 03:59:40.818
171	12	19	DINNER	2026-01-26 06:02:38.662	1.132796942132886	495	32.8511113218537	10.08189278498269	32.51127223921384	\N	\N	f	2026-04-07 03:59:40.822
172	12	22	DINNER	2026-02-04 10:36:19.64	0.6158826512711624	296	10.47000507160976	12.07129996491478	22.78765809703301	\N	\N	f	2026-04-07 03:59:40.827
173	12	25	DINNER	2026-01-14 22:41:49.913	1.977087912517816	1028	14.63045055263184	16.01441209139431	95.88876375711405	\N	\N	f	2026-04-07 03:59:40.829
174	12	22	DINNER	2026-02-16 18:32:07.511	0.7109775244635055	342	12.08661791587959	13.93515947948471	26.3061684051497	\N	\N	f	2026-04-07 03:59:40.833
175	12	20	SNACK	2026-02-22 14:29:45.368	0.7379570800162737	329	24.50017505654029	9.593442040211558	27.00922912859562	\N	\N	t	2026-04-07 03:59:40.837
176	12	14	SNACK	2026-02-08 12:22:12.685	1.516917020963814	392	41.26014297021575	36.25431680103516	84.79566147187722	\N	\N	f	2026-04-07 03:59:40.844
177	12	25	LUNCH	2026-04-05 16:08:47.291	0.5288435307723842	274	3.913442127715643	4.283632599256312	25.64891124246063	\N	\N	t	2026-04-07 03:59:40.847
178	12	27	LUNCH	2026-01-27 23:19:06.235	1.99433244224673	524	41.88098128718133	23.73255606273609	103.70528699683	\N	\N	f	2026-04-07 03:59:40.85
179	12	28	BREAKFAST	2026-03-25 05:06:48.388	1.540495657324143	335	19.10214615081937	12.01586612712831	16.63735309910074	\N	\N	f	2026-04-07 03:59:40.854
180	12	18	LUNCH	2026-03-11 02:20:51.417	1.108214162365299	407	34.90874611450691	6.649284974191793	72.58802763492707	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.859
181	12	27	BREAKFAST	2026-02-17 11:00:41.888	1.134091736717281	298	23.81592647106289	13.49569166693564	58.9727703092986	\N	\N	t	2026-04-07 03:59:40.861
182	12	15	LUNCH	2026-02-04 11:19:02.606	0.6734330921235047	309	23.23344167826091	8.350570342331459	14.2767815530183	\N	\N	t	2026-04-07 03:59:40.864
183	12	3	LUNCH	2026-02-21 17:46:51.369	0.7026734043922489	376	19.1829839399084	13.5615967047704	13.5615967047704	\N	\N	f	2026-04-07 03:59:40.866
184	12	16	BREAKFAST	2026-02-02 00:15:46.785	1.452571492147789	525	22.07908668064639	17.57611505498825	79.8914320681284	\N	\N	t	2026-04-07 03:59:40.868
185	12	2	BREAKFAST	2026-02-14 15:50:25.516	1.930418053504438	1040	40.34573731824276	16.60159526013817	59.26383424258626	\N	\N	t	2026-04-07 03:59:40.871
186	12	28	SNACK	2026-03-14 06:11:01.574	0.8801827519905044	191	10.91426612468226	6.865425465525934	9.50597372149745	\N	\N	f	2026-04-07 03:59:40.874
187	12	3	LUNCH	2026-02-06 13:45:56.619	1.215833175967076	651	33.19224570390116	23.46558029616456	23.46558029616456	\N	\N	f	2026-04-07 03:59:40.877
188	12	25	SNACK	2026-03-24 14:06:56.624	0.8388747904285936	436	6.207673449171593	6.794885802471608	40.68542733578679	\N	\N	f	2026-04-07 03:59:40.88
189	12	14	DINNER	2026-03-28 00:44:14.197	1.423009446440624	368	38.70585694318498	34.00992576993092	79.5462280560309	\N	\N	f	2026-04-07 03:59:40.882
190	13	10	BREAKFAST	2026-01-19 22:39:15.256	1.589618743096412	550	17.96269179698946	11.28629307598453	46.25790542410559	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.886
191	13	15	DINNER	2026-03-20 19:39:44.942	1.450356525954765	667	50.0373001454394	17.98442092183909	30.74755835024102	\N	\N	t	2026-04-07 03:59:40.889
192	13	5	SNACK	2026-02-03 10:20:10.011	0.9193073660721827	494	26.38412140627164	24.72936814734171	15.35243301340545	\N	\N	t	2026-04-07 03:59:40.891
193	13	6	LUNCH	2026-03-09 07:03:21.312	1.123378765954274	505	21.45653442972663	19.09743902122265	54.93322165516398	\N	\N	f	2026-04-07 03:59:40.894
194	13	17	DINNER	2026-01-31 06:56:16.69	1.541961215393154	442	30.22243982170582	18.50353458471785	54.12283866029971	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.896
195	13	23	BREAKFAST	2026-01-19 08:11:25.018	0.6619140525490712	315	17.40833958204057	11.71587873011856	30.77900344353181	\N	\N	f	2026-04-07 03:59:40.898
196	13	3	SNACK	2026-03-29 13:28:22.545	0.5626315558322147	301	15.35984147421946	10.85878902756174	10.85878902756174	\N	\N	f	2026-04-07 03:59:40.902
197	13	4	SNACK	2026-03-31 08:05:24.695	1.318783023532193	410	41.14603033420442	23.34245951651981	79.12698141193158	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.908
198	13	30	LUNCH	2026-02-19 04:38:55.462	0.74372002729775	198	12.34575245314265	9.2221283384921	44.25134162421612	\N	\N	f	2026-04-07 03:59:40.912
199	13	15	LUNCH	2026-01-31 15:24:23.005	1.485194449326227	683	51.23920850175484	18.41641117164522	31.48612232571602	\N	Ăn ngon miệng	t	2026-04-07 03:59:40.914
200	13	18	SNACK	2026-04-03 01:37:28.803	1.232710361644651	453	38.83037639180651	7.396262169867907	80.74252868772464	\N	\N	f	2026-04-07 03:59:40.916
201	13	5	DINNER	2026-01-31 08:18:15.81	0.5179875782271757	278	14.86624349511994	13.93386585431102	8.650392556393834	\N	\N	t	2026-04-07 03:59:40.919
202	13	6	DINNER	2026-01-12 14:50:57.324	0.8810463986343403	396	16.8279862139159	14.97778877678379	43.08316889321924	\N	\N	f	2026-04-07 03:59:40.924
203	13	29	DINNER	2026-02-07 23:18:20.149	1.146026053860988	436	18.565622072548	23.26432889337805	74.0332830794198	\N	\N	f	2026-04-07 03:59:40.927
204	13	14	DINNER	2026-02-08 14:23:31.031	1.29220836941545	334	35.14806764810024	30.88378002902926	72.23444785032366	\N	\N	f	2026-04-07 03:59:40.929
205	13	9	BREAKFAST	2026-04-06 02:39:28.446	1.829835840949135	779	59.10369766265706	14.821670311688	54.89507522847406	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.931
206	13	14	DINNER	2026-02-15 15:55:49.545	1.489431211083295	385	40.51252894146563	35.59740594489075	83.2592046995562	\N	\N	f	2026-04-07 03:59:40.933
207	13	19	SNACK	2026-01-24 17:58:36.216	0.8698542685885655	380	25.2257737890684	7.741702990438234	24.96481750849183	\N	\N	f	2026-04-07 03:59:40.936
208	13	8	DINNER	2026-02-05 14:02:47.322	0.9481103499528037	406	29.20179877854635	8.248560044589391	24.17681392379649	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.939
209	14	24	BREAKFAST	2026-02-20 04:38:34.102	0.6805717636172771	317	15.24480750502701	15.85732209228256	38.24813311529098	\N	\N	f	2026-04-07 03:59:40.941
210	14	2	DINNER	2026-02-25 09:38:20.744	0.9010947388583291	485	18.83288004213908	7.74941475418163	27.6636084829507	\N	\N	f	2026-04-07 03:59:40.944
211	14	24	LUNCH	2026-01-21 14:19:08.041	0.9913188409555156	462	22.20554203740355	23.09772899426351	55.71211886169998	\N	\N	f	2026-04-07 03:59:40.946
212	14	24	BREAKFAST	2026-02-20 09:24:42.001	1.92152366253695	897	43.04213004082769	44.77150133711094	107.9896298345766	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.948
213	14	8	SNACK	2026-02-21 08:10:02.483	1.046479350492795	448	32.23156399517809	9.104370349287315	26.68522343756627	\N	\N	t	2026-04-07 03:59:40.95
214	14	26	BREAKFAST	2026-02-07 19:56:32.675	1.35553239884072	435	22.23073134098781	13.01311102887091	68.04772642180416	\N	\N	f	2026-04-07 03:59:40.953
215	14	6	LUNCH	2026-01-22 22:27:00.926	0.7938793251707383	357	15.1630951107611	13.49594852790255	38.8206990008491	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.957
216	14	26	BREAKFAST	2026-03-30 12:24:20.467	0.7160386984730479	229	11.74303465495798	6.87397150534126	35.94514266334701	\N	\N	f	2026-04-07 03:59:40.962
217	14	17	DINNER	2026-01-25 14:49:18.942	1.778474438647037	510	34.85809899748193	21.34169326376444	62.42445279651101	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.964
218	14	27	LUNCH	2026-02-02 12:32:52.704	1.57198087106836	413	33.01159829243557	18.70657236571349	81.74300529555475	\N	\N	f	2026-04-07 03:59:40.967
219	14	11	BREAKFAST	2026-02-19 18:03:13.808	1.833446724211282	870	12.83412706947897	34.28545374275096	29.88518160464389	\N	\N	f	2026-04-07 03:59:40.974
220	14	5	LUNCH	2026-03-11 14:59:59.725	0.5531846264310699	297	15.87639877857171	14.88066645099578	9.238183261398866	\N	\N	f	2026-04-07 03:59:40.977
221	14	19	LUNCH	2026-03-31 20:28:48.677	0.6061520940776662	264	17.57841072825232	5.39475363729123	17.39656510002902	\N	\N	f	2026-04-07 03:59:40.979
222	14	13	BREAKFAST	2026-01-10 02:31:28.052	1.433500418302917	528	21.21580619088317	29.10005849154922	21.78920635820434	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.982
223	14	28	DINNER	2026-02-04 01:58:56.983	1.542183984287352	336	19.12308140516317	12.02903507744135	16.65558703030341	\N	\N	f	2026-04-07 03:59:40.985
224	14	7	LUNCH	2026-03-18 15:57:30.498	1.280523721727856	692	27.14710290063055	8.067299446885494	64.02618608639281	\N	\N	f	2026-04-07 03:59:40.988
225	14	25	SNACK	2026-02-17 14:47:27.889	1.582978738074861	823	11.71404266175397	12.82212777840637	76.77446879663074	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.99
226	14	4	DINNER	2026-02-02 18:11:56.97	0.8782261138550633	273	27.40065475227798	15.54460221523462	52.6935668313038	\N	\N	f	2026-04-07 03:59:40.992
227	14	14	BREAKFAST	2026-02-25 20:28:01.556	0.7910092319317663	204	21.51545110854404	18.90512064316921	44.21741606498573	\N	Ăn ngon miệng	f	2026-04-07 03:59:40.994
228	14	4	LUNCH	2026-01-22 17:36:18.162	0.7481846944047424	232	23.34336246542797	13.24286909096394	44.89108166428455	\N	\N	f	2026-04-07 03:59:40.996
229	15	29	DINNER	2026-02-19 20:02:24.442	1.215846308727574	463	19.6967102013867	24.68168006716976	78.54367154380128	\N	\N	f	2026-04-07 03:59:40.999
230	15	19	LUNCH	2026-02-18 09:40:59.969	1.66926195752253	729	48.40859676815336	14.85643142195051	47.9078181808966	\N	\N	f	2026-04-07 03:59:41.001
231	15	22	LUNCH	2026-02-04 09:12:17.22	0.7219091995594201	347	12.27245639251014	14.14942031136463	26.71064038369854	\N	\N	f	2026-04-07 03:59:41.005
232	15	2	DINNER	2026-03-14 00:29:05.473	0.8261503775898061	445	17.26654289162695	7.104893247272332	25.36281659200705	\N	\N	f	2026-04-07 03:59:41.008
233	15	16	LUNCH	2026-04-01 04:31:12.544	1.499214872303971	542	22.78806605902035	18.14049995487805	82.45681797671838	\N	Ăn ngon miệng	t	2026-04-07 03:59:41.01
234	15	22	BREAKFAST	2026-02-05 12:15:18.504	0.6037541902712789	291	10.26382123461174	11.83358212931707	22.33890504003732	\N	Ăn ngon miệng	t	2026-04-07 03:59:41.013
235	15	11	LUNCH	2026-03-15 07:42:10.916	1.832551701554298	870	12.82786191088008	34.26871681906537	29.87059273533506	\N	\N	f	2026-04-07 03:59:41.015
236	15	1	BREAKFAST	2026-03-21 07:17:02.755	1.669537051010189	854	43.74187073646696	42.57319480075983	31.05338914878953	\N	\N	f	2026-04-07 03:59:41.018
237	15	16	BREAKFAST	2026-03-06 23:31:02.983	1.262565802831781	457	19.19100020304308	15.27704621426455	69.44111915574798	\N	\N	f	2026-04-07 03:59:41.022
238	15	11	BREAKFAST	2026-03-30 15:22:54.954	0.7032653088675153	334	4.922857162072606	13.15106127582253	11.4632245345405	\N	\N	f	2026-04-07 03:59:41.027
239	15	11	LUNCH	2026-01-17 07:00:05.926	1.498475160661545	711	10.48932612463081	28.02148550437089	24.42514511878318	\N	\N	f	2026-04-07 03:59:41.03
240	15	9	LUNCH	2026-02-07 18:10:10.122	0.9384201816983602	399	30.31097186885703	7.601203471756717	28.15260545095081	\N	Ăn ngon miệng	f	2026-04-07 03:59:41.032
241	15	4	DINNER	2026-03-08 05:23:04.385	1.631521509468847	507	50.90347109542804	28.87793071759859	97.89129056813084	\N	\N	t	2026-04-07 03:59:41.034
242	15	30	LUNCH	2026-02-19 04:23:23.765	0.614576143351157	164	10.20196397962921	7.620744177554347	36.56728052939384	\N	\N	f	2026-04-07 03:59:41.038
243	15	27	SNACK	2026-02-22 13:37:08.797	1.614874080131469	424	33.91235568276085	19.21700155356448	83.97345216683638	\N	Ăn ngon miệng	t	2026-04-07 03:59:41.043
244	1	8	DINNER	2026-01-25 14:07:16.44	1.885548261743209	808	58.07488646169085	16.40426987716592	48.08148067445184	\N	\N	f	2026-04-07 03:59:41.046
245	1	25	LUNCH	2026-01-07 15:20:46.154	1.190448193351179	619	8.809316630798723	9.642630366144546	57.73673737753216	\N	Ăn ngon miệng	f	2026-04-07 03:59:41.049
246	1	29	SNACK	2026-02-22 17:38:59.738	1.761292091756206	671	28.53293188645054	35.75422946265099	113.7794691274509	\N	\N	f	2026-04-07 03:59:41.051
247	1	3	SNACK	2026-02-20 12:58:23.539	1.178284302871715	631	32.16716146839783	22.74088704542411	22.74088704542411	\N	\N	f	2026-04-07 03:59:41.056
248	1	25	LUNCH	2026-03-25 08:25:55.584	0.7073602676779187	367	5.234465980816599	5.729618168191141	34.30697298237906	\N	\N	f	2026-04-07 03:59:41.062
249	1	8	SNACK	2026-02-09 15:56:19.851	1.665466202165258	714	51.29635902668996	14.48955595883774	42.46938815521408	\N	Ăn ngon miệng	f	2026-04-07 03:59:41.065
250	1	10	DINNER	2026-03-11 04:20:33.799	0.6110602783674559	211	6.904981145552252	4.338527976408937	17.78185410049297	\N	\N	t	2026-04-07 03:59:41.067
251	1	4	BREAKFAST	2026-03-01 00:30:25.387	1.351097833415939	420	42.15425240257731	23.91443165146213	81.06587000495637	\N	\N	t	2026-04-07 03:59:41.073
252	1	29	LUNCH	2026-02-05 00:30:44.073	1.004862959055013	382	16.27877993669121	20.39871806881677	64.91414715495384	\N	\N	f	2026-04-07 03:59:41.078
253	1	6	BREAKFAST	2026-01-19 14:07:06.903	1.000604708364136	450	19.111549929755	17.01028004219032	48.92957023900626	\N	Ăn ngon miệng	f	2026-04-07 03:59:41.083
254	1	27	BREAKFAST	2026-03-21 13:41:10.251	1.693706316313812	445	35.56783264259005	20.15510516413436	88.07272844831822	\N	\N	f	2026-04-07 03:59:41.086
255	1	22	BREAKFAST	2026-03-14 14:33:49.506	0.9890169480242005	476	16.81328811641141	19.38473218127433	36.59362707689542	\N	Ăn ngon miệng	t	2026-04-07 03:59:41.09
256	1	7	DINNER	2026-04-06 14:20:11.274	0.8274028505946822	447	17.54094043260726	5.212637958746498	41.37014252973411	\N	\N	f	2026-04-07 03:59:41.092
257	1	30	SNACK	2026-02-17 07:39:40.048	1.989297869844752	531	33.02234463942289	24.66729358607493	118.3632232557628	\N	\N	f	2026-04-07 03:59:41.094
258	1	14	SNACK	2026-03-12 15:57:41.71	1.326491017184444	343	36.08055566741689	31.70313531070822	74.15084786061044	\N	\N	f	2026-04-07 03:59:41.096
259	1	18	LUNCH	2026-02-20 12:24:04.736	0.8825800104270219	324	27.80127032845119	5.295480062562132	57.80899068296993	\N	\N	t	2026-04-07 03:59:41.098
260	1	26	LUNCH	2026-02-23 08:01:45.94	0.5615033993224408	180	9.208655748888027	5.390432633495431	28.18747064598653	\N	\N	f	2026-04-07 03:59:41.101
261	1	8	BREAKFAST	2026-04-09 05:00:00	1	429	30.8	8.7	25.5	\N	\N	f	2026-04-09 02:46:54.302
262	1	3	LUNCH	2026-04-09 05:00:00	1	536	27.3	19.3	19.3	\N	\N	f	2026-04-09 02:47:20.925
263	1	29	LUNCH	2026-04-09 05:00:00	1	381	16.2	20.3	64.6	\N	\N	f	2026-04-09 02:47:36.816
264	1	5	DINNER	2026-04-09 05:00:00	1	538	28.7	26.9	16.7	\N	\N	f	2026-04-09 02:47:58.76
265	16	8	BREAKFAST	2026-04-09 05:00:00	1	429	30.8	8.7	25.5	\N	\N	f	2026-04-09 03:15:33.372
266	16	3	LUNCH	2026-04-09 05:00:00	1	536	27.3	19.3	19.3	\N	\N	f	2026-04-09 03:15:41.425
267	16	29	LUNCH	2026-04-09 05:00:00	1	381	16.2	20.3	64.6	\N	\N	f	2026-04-09 03:15:48.703
268	16	15	DINNER	2026-04-09 05:00:00	1	460	34.5	12.4	21.2	\N	\N	f	2026-04-09 03:15:56.897
269	16	26	BREAKFAST	2026-04-13 01:00:00	1.5	482	24.6	14.4	75.3	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-13 03:05:50.727
270	16	17	LUNCH	2026-04-13 05:00:00	2.5	718	49	30	87.75	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-13 03:05:50.756
271	16	9	DINNER	2026-04-13 12:00:00	1.5	639	48.45	12.15	45	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-13 03:05:50.762
272	16	20	SNACK	2026-04-13 09:00:00	0.5	223	16.6	6.5	18.3	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-13 03:05:50.772
273	16	1	BREAKFAST	2026-04-14 01:00:00	1	517	26.2	18.4	51.8	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-14 01:53:01.202
274	16	15	LUNCH	2026-04-14 05:00:00	1.5	690	51.75	18.6	31.8	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-14 01:53:01.215
275	16	19	DINNER	2026-04-14 12:00:00	1.5	656	43.5	13.35	43.05	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-14 01:53:01.218
276	16	8	SNACK	2026-04-14 09:00:00	0.5	215	15.4	4.35	12.75	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-14 01:53:01.222
277	16	21	BREAKFAST	2026-04-15 01:00:00	1	539	31.5	13.7	42.9	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-15 08:42:29.567
278	16	24	LUNCH	2026-04-15 05:00:00	1.5	701	33.6	34.95	84.3	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-15 08:42:29.604
279	16	6	DINNER	2026-04-15 12:00:00	1.5	675	28.65	25.5	73.35	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-15 08:42:29.609
280	16	16	SNACK	2026-04-15 09:00:00	0.5	181	7.6	6.05	27.5	\N	Auto-applied from meal plan: Auto Plan 2026-04-13 - 2026-04-19	t	2026-04-15 08:42:29.616
281	16	7	BREAKFAST	2026-04-20 01:00:00	1	541	21.2	6.3	50	\N	Auto-applied from meal plan: Auto Plan 2026-04-15 - 2026-04-21	t	2026-04-20 02:00:15.506
282	16	23	LUNCH	2026-04-20 05:00:00	1.5	716	39.45	26.55	69.75	\N	Auto-applied from meal plan: Auto Plan 2026-04-15 - 2026-04-21	t	2026-04-20 02:00:15.518
283	16	9	DINNER	2026-04-20 12:00:00	1.5	639	48.45	12.15	45	\N	Auto-applied from meal plan: Auto Plan 2026-04-15 - 2026-04-21	t	2026-04-20 02:00:15.523
284	16	4	SNACK	2026-04-20 09:00:00	0.5	156	15.6	8.85	30	\N	Auto-applied from meal plan: Auto Plan 2026-04-15 - 2026-04-21	t	2026-04-20 02:00:15.528
285	16	11	BREAKFAST	2026-04-19 05:00:00	0.5	237	3.5	9.35	8.15	\N	\N	f	2026-04-20 06:23:10.932
286	16	3	LUNCH	2026-04-19 05:00:00	1	536	27.3	19.3	19.3	\N	\N	f	2026-04-20 06:23:36.812
287	16	29	LUNCH	2026-04-19 05:00:00	0.5	190	8.1	10.15	32.3	\N	\N	f	2026-04-20 06:24:01.536
288	16	25	DINNER	2026-04-19 05:00:00	0.5	260	3.7	4.05	24.25	\N	\N	f	2026-04-20 06:24:18.538
289	2	20	BREAKFAST	2026-04-20 01:00:00	1	446	33.2	13	36.6	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-20 08:30:30.503
290	2	9	LUNCH	2026-04-20 05:00:00	1	426	32.3	8.1	30	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-20 08:30:30.515
291	2	28	DINNER	2026-04-20 12:00:00	1	218	12.4	7.8	10.8	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-20 08:30:30.52
292	2	23	BREAKFAST	2026-04-21 01:00:00	1	477	26.3	17.7	46.5	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-21 02:06:55.167
293	2	15	LUNCH	2026-04-21 05:00:00	1	460	34.5	12.4	21.2	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-21 02:06:55.182
294	2	21	DINNER	2026-04-21 12:00:00	1	539	31.5	13.7	42.9	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-04-21 02:06:55.188
295	3	20	BREAKFAST	2026-04-21 01:00:00	0.5	223	16.6	6.5	18.3	\N	Auto-applied from meal plan: Auto Plan 2026-04-21 - 2026-04-27	t	2026-04-21 10:09:31.676
296	3	110	LUNCH	2026-04-21 05:00:00	0.5	146	15.6	2	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-04-21 - 2026-04-27	t	2026-04-21 10:09:31.687
297	3	54	DINNER	2026-04-21 12:00:00	0.5	160	13.2	2	12.2	\N	Auto-applied from meal plan: Auto Plan 2026-04-21 - 2026-04-27	t	2026-04-21 10:09:31.691
298	2	19	BREAKFAST	2026-05-07 01:00:00	1	437	29	8.9	28.7	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-05-07 02:28:18.254
299	2	9	LUNCH	2026-05-07 05:00:00	1	426	32.3	8.1	30	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-05-07 02:28:18.266
300	2	7	DINNER	2026-05-07 12:00:00	1	541	21.2	6.3	50	\N	Auto-applied from meal plan: Auto Plan 2026-04-20 - 2026-04-26	t	2026-05-07 02:28:18.269
301	2	55	BREAKFAST	2026-05-09 01:00:00	0.5	174	14.4	2.9	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.747
302	2	110	LUNCH	2026-05-09 05:00:00	0.75	219	23.4	3	22.2	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.766
303	2	15	LUNCH	2026-05-09 05:15:00	1	460	34.5	12.4	21.2	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.774
304	2	37	LUNCH	2026-05-09 05:30:00	0.5	65	1.35	0.4	24	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.781
305	2	88	LUNCH	2026-05-09 05:45:00	0.5	104	10.8	3.8	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.79
306	2	70	DINNER	2026-05-09 12:00:00	0.75	177	16.2	3	37.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.797
307	2	41	DINNER	2026-05-09 12:15:00	1	488	16.8	9.4	14	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.805
308	2	37	DINNER	2026-05-09 12:30:00	0.5	65	1.35	0.4	24	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.811
309	2	69	DINNER	2026-05-09 12:45:00	0.5	104	9.6	8.3	22.6	\N	Auto-applied from meal plan: Auto Plan 2026-05-09 - 2026-05-10	t	2026-05-09 08:02:45.817
310	2	55	BREAKFAST	2026-05-11 01:00:00	0.5	174	14.4	2.9	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.731
311	2	45	LUNCH	2026-05-11 05:00:00	0.75	450	19.8	12.45	26.1	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.773
312	2	118	LUNCH	2026-05-11 05:15:00	1	516	28.8	4	14	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.777
313	2	37	LUNCH	2026-05-11 05:30:00	0.5	65	1.35	0.4	24	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.783
314	2	88	LUNCH	2026-05-11 05:45:00	0.5	104	10.8	3.8	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.789
315	2	110	DINNER	2026-05-11 12:00:00	0.75	219	23.4	3	22.2	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.793
316	2	15	DINNER	2026-05-11 12:15:00	1	460	34.5	12.4	21.2	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.8
317	2	37	DINNER	2026-05-11 12:30:00	0.5	65	1.35	0.4	24	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.807
318	2	88	DINNER	2026-05-11 12:45:00	0.5	104	10.8	3.8	14.8	\N	Auto-applied from meal plan: Auto Plan 2026-05-11 - 2026-05-17	t	2026-05-11 06:20:45.813
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, "userId", title, message, type, "isRead", data, "createdAt") FROM stdin;
5	2	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	WARNING	t	\N	2026-04-01 05:52:27.967
8	3	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	f	\N	2026-01-12 20:04:51.003
9	3	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	f	\N	2026-01-11 14:40:29.181
10	3	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	INFO	f	\N	2026-01-19 03:50:29.691
11	3	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	SUCCESS	f	\N	2026-01-23 12:33:04.167
12	3	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	SUCCESS	f	\N	2026-03-14 11:22:41.696
13	4	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	f	\N	2026-01-08 13:49:22.513
14	4	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	INFO	t	\N	2026-03-25 08:49:05.121
15	4	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	ERROR	t	\N	2026-03-21 08:18:45.39
16	5	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	SUCCESS	f	\N	2026-02-15 17:11:32.31
17	5	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	t	\N	2026-01-23 18:24:05.628
18	5	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	INFO	f	\N	2026-03-19 15:51:16.69
19	5	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	WARNING	f	\N	2026-01-22 12:17:08.206
20	6	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	INFO	f	\N	2026-02-17 10:01:40.282
21	6	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	SUCCESS	f	\N	2026-01-10 12:42:14.71
22	6	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	WARNING	f	\N	2026-04-05 15:19:31.809
23	7	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	WARNING	f	\N	2026-02-03 18:27:32.742
24	7	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	f	\N	2026-03-21 18:20:03.706
25	7	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	WARNING	t	\N	2026-01-29 16:54:38.22
26	7	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	SUCCESS	f	\N	2026-01-12 20:39:44.898
27	7	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	ERROR	f	\N	2026-03-30 23:55:30.161
28	8	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	t	\N	2026-03-21 20:42:18.748
29	8	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	f	\N	2026-02-14 00:31:56.855
30	8	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	INFO	t	\N	2026-03-29 13:31:45.281
31	8	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	WARNING	f	\N	2026-02-01 01:52:18.799
32	8	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	ERROR	f	\N	2026-01-08 08:18:08.579
33	9	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	INFO	f	\N	2026-04-01 00:21:10.62
34	9	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	ERROR	t	\N	2026-03-30 17:40:06.84
35	9	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	ERROR	t	\N	2026-03-08 00:24:05.861
36	9	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	SUCCESS	t	\N	2026-02-14 01:27:16.087
37	10	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	f	\N	2026-02-10 13:08:02.132
38	10	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	SUCCESS	f	\N	2026-02-09 18:41:15.781
39	10	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	SUCCESS	f	\N	2026-01-23 09:21:17.8
41	10	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	ERROR	t	\N	2026-01-20 20:39:45.176
42	11	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	f	\N	2026-01-08 21:32:52.713
43	11	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	INFO	f	\N	2026-02-17 12:25:25.89
44	11	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	WARNING	f	\N	2026-03-09 02:41:09.338
45	11	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	INFO	t	\N	2026-02-25 06:07:28.493
46	11	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	WARNING	f	\N	2026-02-05 22:05:17.834
47	12	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	SUCCESS	f	\N	2026-03-19 07:55:22.993
48	12	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	t	\N	2026-02-21 05:21:30.769
49	12	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	ERROR	f	\N	2026-01-22 20:17:05.418
50	12	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	INFO	t	\N	2026-04-02 00:47:30.026
51	13	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	INFO	f	\N	2026-02-13 19:04:50.805
52	13	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	SUCCESS	t	\N	2026-01-18 22:58:41.864
53	13	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	SUCCESS	f	\N	2026-03-07 09:06:29.521
54	13	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	WARNING	t	\N	2026-03-06 04:18:24.133
55	13	Thông báo 5	Đây là thông báo số 5 dành cho bạn.	INFO	t	\N	2026-02-16 08:05:53.051
56	14	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	SUCCESS	t	\N	2026-03-15 07:11:17.854
57	14	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	ERROR	f	\N	2026-03-31 19:06:55.673
58	14	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	SUCCESS	t	\N	2026-03-29 01:45:18.931
59	15	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	ERROR	t	\N	2026-01-19 15:55:06.399
60	15	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	ERROR	f	\N	2026-02-03 07:03:31.449
61	15	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	SUCCESS	f	\N	2026-03-09 09:46:17.226
1	1	Thông báo 1	Đây là thông báo số 1 dành cho bạn.	INFO	t	\N	2026-02-22 22:54:04.753
3	1	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	INFO	t	\N	2026-01-28 06:33:41.651
2	1	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	t	\N	2026-01-13 20:41:30.111
64	4	ss	ss	WARNING	f	\N	2026-04-08 07:33:25.192
4	1	Thông báo 4	Đây là thông báo số 4 dành cho bạn.	INFO	t	\N	2026-03-27 11:13:45.55
78	1	ABC	ABC	INFO	t	\N	2026-04-08 07:35:45.942
6	2	Thông báo 2	Đây là thông báo số 2 dành cho bạn.	WARNING	t	\N	2026-01-17 21:49:05.524
77	1	Phản hồi đánh giá của bạn cho món Bún chả	Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng góp ý của bạn.	INFO	t	\N	2026-04-08 07:35:24.073
79	1	Phản hồi đánh giá của bạn cho món Cơm tấm	Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng góp ý của bạn.	INFO	t	\N	2026-04-08 07:39:28.709
80	1	Phản hồi đánh giá của bạn cho món Bún chả	Cảm ơn bạn đã đánh giá! Chúng tôi rất trân trọng góp ý của bạn.	INFO	t	\N	2026-04-08 07:40:59.102
82	16	Phan hoi danh gia cho mon Phở bò	Cam on ban da gui danh gia. Chung toi da ghi nhan va se tiep tuc cai tien.	INFO	t	\N	2026-04-20 03:28:41.317
7	2	Thông báo 3	Đây là thông báo số 3 dành cho bạn.	SUCCESS	t	\N	2026-02-16 14:54:07.998
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.password_reset_tokens (id, "userId", "tokenHash", "expiresAt", "usedAt", "requestedIp", "requestedUserAgent", "usedIp", "usedUserAgent", "createdAt") FROM stdin;
1	1	78b17ce9b606411431407e75a25301cce599ad33be2006c878696b13b4a3974b	2026-04-15 04:21:33.77	2026-04-15 04:09:07.014	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	2026-04-15 04:06:33.783
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_ingredients (id, "recipeId", name, amount, unit, notes, alternative, "isOptional", "order") FROM stdin;
61	21	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
62	21	Gia vị	1	bộ	\N	\N	f	2
63	21	Rau thơm	1	bó	\N	\N	f	3
64	22	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
65	22	Gia vị	1	bộ	\N	\N	f	2
66	22	Rau thơm	1	bó	\N	\N	f	3
67	23	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
68	23	Gia vị	1	bộ	\N	\N	f	2
69	23	Rau thơm	1	bó	\N	\N	f	3
70	24	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
71	24	Gia vị	1	bộ	\N	\N	f	2
72	24	Rau thơm	1	bó	\N	\N	f	3
73	25	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
74	25	Gia vị	1	bộ	\N	\N	f	2
75	25	Rau thơm	1	bó	\N	\N	f	3
76	26	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
77	26	Gia vị	1	bộ	\N	\N	f	2
78	26	Rau thơm	1	bó	\N	\N	f	3
79	27	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
80	27	Gia vị	1	bộ	\N	\N	f	2
81	27	Rau thơm	1	bó	\N	\N	f	3
82	28	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
83	28	Gia vị	1	bộ	\N	\N	f	2
84	28	Rau thơm	1	bó	\N	\N	f	3
85	29	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
86	29	Gia vị	1	bộ	\N	\N	f	2
87	29	Rau thơm	1	bó	\N	\N	f	3
91	30	Nguyên liệu chính	200	gram	tươi ngon	\N	f	1
92	30	Gia vị	1	bộ	\N	\N	f	2
93	30	Rau thơm	1	bó	\N	\N	f	3
107	2	Thịt nạc vai xay	100	g	tươi ngon	\N	f	1
108	2	Thịt ba chỉ	100	g	\N	\N	f	2
109	2	Hành tím / Hành khô	10	g	\N	\N	f	3
110	2	Tỏi (băm)	3	g		\N	f	4
111	2	Sả (băm)	3	củ		\N	f	5
112	2	Nước mắm	1	Thìa		\N	f	6
113	2	Đường	1	Thìa		\N	f	7
114	2	Dầu hào	1	Thìa		\N	f	8
115	2	Bún	200	g		\N	f	9
116	2	Rau sống	20	g		\N	f	10
117	1	Nước dùng xương bò (đã ninh sẵn)	300	ml	tươi ngon	\N	f	1
118	1	Hành tây	0.5	củ	\N	\N	f	2
119	1	Gừng	0.5	củ	\N	\N	f	3
120	1	Quế	1	Nhánh		\N	f	4
121	1	Hạt ngò	0.5	Thìa cà phê		\N	f	5
122	1	Muối	0.5	Thìa cà phê		\N	f	6
123	1	Đường phèn	1	Thìa cà phê		\N	f	7
124	1	Nước mắm	1	Thìa cà phê		\N	f	8
125	1	Thịt bò	80	g		\N	f	9
126	1	Bánh phở	40	g		\N	f	11
127	1	Hành lá + Giá đỗ + Chanh + Rau thơm	70	g		\N	f	11
135	3	Cơm trắng	800	g	\N	\N	f	1
136	3	Sườn non	600	g	\N	\N	f	2
137	3	Trứng gà	5	quả	\N	\N	f	3
138	3	Bì heo	200	g	\N	\N	f	4
139	3	Nước mắm	6	muỗng	\N	\N	f	5
140	3	Đường	4	muỗng	\N	\N	f	6
141	3	Tỏi, hành tím	1	ít	\N	\N	f	7
142	4	Bánh mì baguette	4	cái	\N	\N	f	1
143	4	Pate gan	100	gram	phết lên bánh	\N	f	2
144	4	Chả lụa	200	gram	thái lát mỏng	\N	f	3
145	4	Thịt nguội (jambon)	150	gram	thái lát	\N	f	4
146	4	Thịt nạc kho (tùy chọn)	100	gram	xé nhỏ	\N	f	5
147	4	Dưa leo	1	trái	thái lát	\N	f	6
148	4	Ngò rí, hành lá	1	bó	\N	\N	f	7
149	4	Đồ chua (cà rốt, củ cải)	100	gram	bào sợi ngâm giấm đường	\N	f	8
150	4	Nước sốt (mayonnaise, tương cà, ớt)	1	ít	\N	\N	f	9
151	5	Bánh tráng	20	cái	\N	\N	f	1
152	5	Tôm tươi	300	gram	luộc chín, bóc vỏ	\N	f	2
153	5	Thịt ba chỉ	200	gram	luộc chín, thái lát mỏng	\N	f	3
154	5	Bún tươi	200	gram	\N	\N	f	4
155	5	Xà lách, rau thơm	1	bó	\N	\N	f	5
156	5	Giá đỗ	100	gram	\N	\N	f	6
157	5	Hành lá	50	gram	\N	\N	f	7
158	5	Nước mắm chua ngọt hoặc tương đen	1	chén	\N	\N	f	8
159	6	Bún tươi (sợi to)	1.5	kg	\N	\N	f	1
160	6	Xương ống bò	1	kg	\N	\N	f	2
161	6	Thịt bò bắp	500	gram	\N	\N	f	3
162	6	Giò heo	1	cái	chặt khúc	\N	f	4
163	6	Mắm ruốc	3	muỗng canh	\N	\N	f	5
164	6	Sả	5	cây	đập dập	\N	f	6
165	6	Ớt tươi	3	trái	\N	\N	f	7
166	6	Hành tây	1	củ	\N	\N	f	8
167	6	Gừng	1	củ	nướng thơm	\N	f	9
168	6	Dầu điều	2	muỗng canh	\N	\N	f	10
169	6	Rau muống bào	1	bó	\N	\N	f	11
170	6	Hành lá, ngò gai	1	bó	\N	\N	f	12
171	7	Gạo tẻ	200	gram	\N	\N	f	1
172	7	Lòng non heo	300	gram	\N	\N	f	2
173	7	Tiết heo	200	gram	luộc chín	\N	f	3
174	7	Xương ống heo	500	gram	\N	\N	f	4
175	7	Hành tím	2	củ	băm nhỏ	\N	f	5
176	7	Gừng	1	củ	đập dập	\N	f	6
177	7	Hành lá, rau răm	1	bó	\N	\N	f	7
178	7	Tiêu, nước mắm	1	ít	\N	\N	f	8
179	8	Gạo nếp	500	gram	\N	\N	f	1
180	8	Đậu xanh không vỏ	150	gram	\N	\N	f	2
181	8	Hành khô	3	củ	thái lát mỏng	\N	f	3
182	8	Dầu ăn	3	muỗng canh	\N	\N	f	4
183	8	Muối	1	muỗng cà phê	\N	\N	f	5
184	8	Chả lụa (tùy chọn)	200	gram	thái lát	\N	f	6
185	9	Bột bánh xèo	300	gram	\N	\N	f	1
186	9	Nước cốt dừa	400	ml	\N	\N	f	2
187	9	Nước lọc	200	ml	\N	\N	f	3
188	9	Hành lá	50	gram	cắt nhỏ	\N	f	4
189	9	Tôm tươi	200	gram	bóc vỏ	\N	f	5
190	9	Thịt ba chỉ	200	gram	thái lát mỏng	\N	f	6
191	9	Giá đỗ	200	gram	\N	\N	f	7
192	9	Hành tây	1	củ	thái lát	\N	f	8
193	9	Nghệ tươi (hoặc bột nghệ)	1	muỗng cà phê	\N	\N	f	9
194	9	Dầu ăn	50	ml	\N	\N	f	10
195	9	Rau sống (xà lách, húng quế, tía tô)	1	bó	\N	\N	f	11
196	10	Xương ống heo	1	kg	\N	\N	f	1
197	10	Sườn non heo	500	gram	\N	\N	f	2
198	10	Hủ tiếu tươi (sợi nhỏ)	1	kg	\N	\N	f	3
199	10	Tôm tươi	200	gram	\N	\N	f	4
200	10	Thịt băm	200	gram	\N	\N	f	5
201	10	Gan heo	100	gram	\N	\N	f	6
202	10	Trứng cút	10	quả	\N	\N	f	7
203	10	Hành tím	3	củ	\N	\N	f	8
204	10	Hẹ	1	bó	\N	\N	f	9
205	10	Đường, muối, nước mắm, tiêu	1	bộ	\N	\N	f	10
206	11	Bột gạo	300	gram	\N	\N	f	1
207	11	Bột năng	50	gram	\N	\N	f	2
208	11	Nước lọc	800	ml	\N	\N	f	3
209	11	Thịt nạc vai băm	300	gram	\N	\N	f	4
210	11	Nấm mộc nhĩ	30	gram	ngâm nở, băm nhỏ	\N	f	5
211	11	Hành tím băm	2	củ	\N	\N	f	6
212	11	Chả lụa	200	gram	\N	\N	f	7
213	11	Hành lá, rau răm	1	bó	\N	\N	f	8
214	11	Dầu ăn	50	ml	\N	\N	f	9
215	12	Cua đồng	500	gram	giã hoặc xay	\N	f	1
216	12	Bún tươi	1	kg	\N	\N	f	2
217	12	Cà chua	3	quả	cắt múi cau	\N	f	3
218	12	Đậu phụ chiên	200	gram	\N	\N	f	4
219	12	Giò sống (hoặc chả cá)	150	gram	\N	\N	f	5
220	12	Mắm tôm	1	muỗng cà phê	\N	\N	f	6
221	12	Hành tím băm	2	củ	\N	\N	f	7
222	12	Rau muống bào	1	bó	\N	\N	f	8
223	12	Rau tía tô, kinh giới	1	bó	\N	\N	f	9
224	13	Mì Quảng tươi	1	kg	\N	\N	f	1
225	13	Tôm sú	300	gram	\N	\N	f	2
226	13	Thịt ba chỉ	300	gram	thái mỏng	\N	f	3
227	13	Xương heo	500	gram	\N	\N	f	4
228	13	Nghệ tươi	1	củ	giã nhuyễn	\N	f	5
229	13	Đậu phộng rang	100	gram	\N	\N	f	6
230	13	Bánh tráng mè	1	gói	\N	\N	f	7
231	13	Rau sống (xà lách, húng, giá)	1	bó	\N	\N	f	8
232	13	Hành lá, ngò	1	bó	\N	\N	f	9
233	14	Bột gạo	500	gram	\N	\N	f	1
234	14	Bột mì	100	gram	\N	\N	f	2
235	14	Tro tàu (nước tro)	1	muỗng cà phê	\N	\N	f	3
236	14	Thịt ba chỉ (làm xá xíu)	500	gram	\N	\N	f	4
237	14	Ngũ vị hương	1	gói	\N	\N	f	5
238	14	Nước mắm, đường, tỏi	1	bộ	\N	\N	f	6
239	14	Rau sống (xà lách, húng quế, giá)	1	bó	\N	\N	f	7
240	14	Hành phi	50	gram	\N	\N	f	8
241	15	Bánh canh sợi to (tươi hoặc khô)	1	kg	\N	\N	f	1
242	15	Xương ống heo	500	gram	\N	\N	f	2
243	15	Giò heo (hoặc cua đồng, tôm)	500	gram	\N	\N	f	3
244	15	Bột năng (hoặc bột sắn)	2	muỗng canh	\N	\N	f	4
245	15	Hành tím băm	2	củ	\N	\N	f	5
246	15	Hành lá, ngò	1	bó	\N	\N	f	6
247	16	Bánh tráng (bánh đa nem)	20	cái	\N	\N	f	1
248	16	Thịt nạc vai băm	300	gram	\N	\N	f	2
249	16	Tôm băm nhuyễn	100	gram	\N	\N	f	3
250	16	Miến dong	50	gram	ngâm nở, cắt khúc	\N	f	4
251	16	Nấm mộc nhĩ	30	gram	ngâm nở, băm nhỏ	\N	f	5
252	16	Cà rốt	1	củ	bào sợi	\N	f	6
253	16	Hành tím băm	2	củ	\N	\N	f	7
254	16	Trứng gà	1	quả	\N	\N	f	8
255	16	Dầu ăn	500	ml	để chiên	\N	f	9
256	17	Thịt bò (bắp hoặc gân)	800	gram	cắt khối	\N	f	1
257	17	Cà rốt	2	củ	cắt khúc	\N	f	2
258	17	Sả	3	cây	đập dập	\N	f	3
259	17	Hành tím, tỏi	1	ít	\N	\N	f	4
260	17	Bột cà ri	2	muỗng canh	\N	\N	f	5
261	17	Nước dừa tươi	500	ml	\N	\N	f	6
262	17	Nước mắm, đường, muối, tiêu	1	bộ	\N	\N	f	7
263	17	Bánh mì (hoặc bún, miến)	1	tùy chọn	\N	\N	f	8
264	18	Thịt gà (đùi hoặc phi lê)	700	gram	\N	\N	f	1
265	18	Khoai tây, cà rốt	300	gram	cắt miếng vừa	\N	f	2
266	18	Nước cốt dừa	400	ml	\N	\N	f	3
267	18	Bột cà ri	3	muỗng canh	\N	\N	f	4
268	18	Hành tây	1	củ	băm nhỏ	\N	f	5
269	18	Tỏi, sả	1	ít	\N	\N	f	6
270	18	Nước mắm, đường, muối	1	bộ	\N	\N	f	7
271	18	Bánh mì hoặc cơm	1	tùy chọn	\N	\N	f	8
272	19	Tôm sú	300	gram	\N	\N	f	1
273	19	Mực tươi	300	gram	cắt khoanh	\N	f	2
274	19	Nghêu	500	gram	\N	\N	f	3
275	19	Xương heo (hoặc tôm khô)	500	gram	\N	\N	f	4
276	19	Sả	5	cây	đập dập	\N	f	5
277	19	Lá chanh	10	lá	\N	\N	f	6
278	19	Me chua	50	gram	\N	\N	f	7
279	19	Ớt tươi, tỏi	1	ít	\N	\N	f	8
280	19	Rau các loại (bắp chuối, rau muống, nấm)	1	bó	\N	\N	f	9
281	19	Bún tươi (hoặc mì)	1	kg	\N	\N	f	10
282	20	Bột năng	300	gram	\N	\N	f	1
283	20	Tôm tươi	200	gram	bóc vỏ, băm nhỏ	\N	f	2
284	20	Thịt ba chỉ	150	gram	băm nhỏ	\N	f	3
285	20	Hành tím băm	2	củ	\N	\N	f	4
286	20	Nước mắm, tiêu, muối	1	bộ	\N	\N	f	5
287	20	Lá chuối (hoặc nilon)	1	gói	\N	\N	f	6
293	32	Pho ga	180	g	\N	\N	f	1
294	32	Toi	35	tep	\N	\N	f	2
295	32	Dau oliu	50	muong canh	\N	\N	f	3
296	32	Muoi	65	muong cafe	\N	\N	f	4
297	32	Tieu	20	muong cafe	\N	\N	f	5
308	35	Banh mi trung	180	g	\N	\N	f	1
309	35	Tieu	20	muong cafe	\N	\N	f	2
310	35	Nuoc mam	35	muong canh	\N	\N	f	3
311	35	Rau xanh tong hop	50	g	\N	\N	f	4
312	35	Ca rot	65	g	\N	\N	f	5
313	36	Banh mi ga nuong	180	g	\N	\N	f	1
314	36	Nuoc mam	35	muong canh	\N	\N	f	2
315	36	Rau xanh tong hop	50	g	\N	\N	f	3
316	36	Ca rot	65	g	\N	\N	f	4
317	36	Hanh la	20	g	\N	\N	f	5
323	38	Com ga luoc	180	g	\N	\N	f	1
324	38	Ca rot	65	g	\N	\N	f	2
325	38	Hanh la	20	g	\N	\N	f	3
326	38	Hanh tim	35	cu	\N	\N	f	4
327	38	Toi	50	tep	\N	\N	f	5
328	39	Com ga nuong	180	g	\N	\N	f	1
329	39	Hanh la	20	g	\N	\N	f	2
330	39	Hanh tim	35	cu	\N	\N	f	3
331	39	Toi	50	tep	\N	\N	f	4
332	39	Dau oliu	65	muong canh	\N	\N	f	5
333	40	Com bo xao	180	g	\N	\N	f	1
334	40	Hanh tim	35	cu	\N	\N	f	2
335	40	Toi	50	tep	\N	\N	f	3
336	40	Dau oliu	65	muong canh	\N	\N	f	4
337	40	Muoi	20	muong cafe	\N	\N	f	5
338	41	Canh chua ca	180	g	\N	\N	f	1
339	41	Toi	50	tep	\N	\N	f	2
340	41	Dau oliu	65	muong canh	\N	\N	f	3
341	41	Muoi	20	muong cafe	\N	\N	f	4
342	41	Tieu	35	muong cafe	\N	\N	f	5
343	42	Canh bi do	180	g	\N	\N	f	1
344	42	Dau oliu	65	muong canh	\N	\N	f	2
345	42	Muoi	20	muong cafe	\N	\N	f	3
346	42	Tieu	35	muong cafe	\N	\N	f	4
347	42	Nuoc mam	50	muong canh	\N	\N	f	5
348	43	Canh cai xanh	180	g	\N	\N	f	1
349	43	Muoi	20	muong cafe	\N	\N	f	2
350	43	Tieu	35	muong cafe	\N	\N	f	3
351	43	Nuoc mam	50	muong canh	\N	\N	f	4
352	43	Rau xanh tong hop	65	g	\N	\N	f	5
353	44	Ga ap chao	180	g	\N	\N	f	1
354	44	Tieu	35	muong cafe	\N	\N	f	2
355	44	Nuoc mam	50	muong canh	\N	\N	f	3
356	44	Rau xanh tong hop	65	g	\N	\N	f	4
357	44	Ca rot	20	g	\N	\N	f	5
358	45	Ga hap gung	180	g	\N	\N	f	1
359	45	Nuoc mam	50	muong canh	\N	\N	f	2
360	45	Rau xanh tong hop	65	g	\N	\N	f	3
361	45	Ca rot	20	g	\N	\N	f	4
362	45	Hanh la	35	g	\N	\N	f	5
363	46	Salad uc ga	180	g	\N	\N	f	1
364	46	Rau xanh tong hop	65	g	\N	\N	f	2
365	46	Ca rot	20	g	\N	\N	f	3
366	46	Hanh la	35	g	\N	\N	f	4
367	46	Hanh tim	50	cu	\N	\N	f	5
368	47	Salad ca ngu	180	g	\N	\N	f	1
369	47	Ca rot	20	g	\N	\N	f	2
370	47	Hanh la	35	g	\N	\N	f	3
371	47	Hanh tim	50	cu	\N	\N	f	4
372	47	Toi	65	tep	\N	\N	f	5
373	48	Yen mach sua chua	180	g	\N	\N	f	1
374	48	Hanh la	35	g	\N	\N	f	2
375	48	Hanh tim	50	cu	\N	\N	f	3
376	48	Toi	65	tep	\N	\N	f	4
377	48	Dau oliu	20	muong canh	\N	\N	f	5
378	49	Chao yach mach	180	g	\N	\N	f	1
379	49	Hanh tim	50	cu	\N	\N	f	2
380	49	Toi	65	tep	\N	\N	f	3
381	49	Dau oliu	20	muong canh	\N	\N	f	4
382	49	Muoi	35	muong cafe	\N	\N	f	5
383	50	Khoai lang luoc	180	g	\N	\N	f	1
384	50	Toi	65	tep	\N	\N	f	2
385	50	Dau oliu	20	muong canh	\N	\N	f	3
386	50	Muoi	35	muong cafe	\N	\N	f	4
387	50	Tieu	50	muong cafe	\N	\N	f	5
388	51	Khoai tay nuong	180	g	\N	\N	f	1
389	51	Dau oliu	20	muong canh	\N	\N	f	2
390	51	Muoi	35	muong cafe	\N	\N	f	3
391	51	Tieu	50	muong cafe	\N	\N	f	4
392	51	Nuoc mam	65	muong canh	\N	\N	f	5
393	52	Com gao lut ca hoi	180	g	\N	\N	f	1
394	52	Muoi	35	muong cafe	\N	\N	f	2
395	52	Tieu	50	muong cafe	\N	\N	f	3
396	52	Nuoc mam	65	muong canh	\N	\N	f	4
397	52	Rau xanh tong hop	20	g	\N	\N	f	5
398	53	Com gao lut uc ga	180	g	\N	\N	f	1
399	53	Tieu	50	muong cafe	\N	\N	f	2
400	53	Nuoc mam	65	muong canh	\N	\N	f	3
401	53	Rau xanh tong hop	20	g	\N	\N	f	4
402	53	Ca rot	35	g	\N	\N	f	5
403	54	Mien ga	180	g	\N	\N	f	1
404	54	Nuoc mam	65	muong canh	\N	\N	f	2
405	54	Rau xanh tong hop	20	g	\N	\N	f	3
406	54	Ca rot	35	g	\N	\N	f	4
407	54	Hanh la	50	g	\N	\N	f	5
408	55	Hu tieu nam vang	180	g	\N	\N	f	1
409	55	Rau xanh tong hop	20	g	\N	\N	f	2
410	55	Ca rot	35	g	\N	\N	f	3
411	55	Hanh la	50	g	\N	\N	f	4
412	55	Hanh tim	65	cu	\N	\N	f	5
418	57	Bun ca	180	g	\N	\N	f	1
419	57	Hanh la	50	g	\N	\N	f	2
420	57	Hanh tim	65	cu	\N	\N	f	3
421	57	Toi	20	tep	\N	\N	f	4
422	57	Dau oliu	35	muong canh	\N	\N	f	5
433	60	Mi xao hai san	180	g	\N	\N	f	1
434	60	Dau oliu	35	muong canh	\N	\N	f	2
435	60	Muoi	50	muong cafe	\N	\N	f	3
436	60	Tieu	65	muong cafe	\N	\N	f	4
437	60	Nuoc mam	20	muong canh	\N	\N	f	5
438	61	Ca thu kho	180	g	\N	\N	f	1
439	61	Muoi	50	muong cafe	\N	\N	f	2
440	61	Tieu	65	muong cafe	\N	\N	f	3
441	61	Nuoc mam	20	muong canh	\N	\N	f	4
442	61	Rau xanh tong hop	35	g	\N	\N	f	5
448	63	Tom hap	180	g	\N	\N	f	1
449	63	Nuoc mam	20	muong canh	\N	\N	f	2
450	63	Rau xanh tong hop	35	g	\N	\N	f	3
451	63	Ca rot	50	g	\N	\N	f	4
452	63	Hanh la	65	g	\N	\N	f	5
453	64	Tom xao bong cai	180	g	\N	\N	f	1
454	64	Rau xanh tong hop	35	g	\N	\N	f	2
455	64	Ca rot	50	g	\N	\N	f	3
456	64	Hanh la	65	g	\N	\N	f	4
457	64	Hanh tim	20	cu	\N	\N	f	5
458	65	Thit heo luoc	180	g	\N	\N	f	1
459	65	Ca rot	50	g	\N	\N	f	2
460	65	Hanh la	65	g	\N	\N	f	3
461	65	Hanh tim	20	cu	\N	\N	f	4
462	65	Toi	35	tep	\N	\N	f	5
463	66	Thit bo nuong	180	g	\N	\N	f	1
464	66	Hanh la	65	g	\N	\N	f	2
465	66	Hanh tim	20	cu	\N	\N	f	3
466	66	Toi	35	tep	\N	\N	f	4
467	66	Dau oliu	50	muong canh	\N	\N	f	5
468	67	Dau hu sot ca chua	180	g	\N	\N	f	1
469	67	Hanh tim	20	cu	\N	\N	f	2
470	67	Toi	35	tep	\N	\N	f	3
471	67	Dau oliu	50	muong canh	\N	\N	f	4
472	67	Muoi	65	muong cafe	\N	\N	f	5
473	68	Dau hu xao nam	180	g	\N	\N	f	1
474	68	Toi	35	tep	\N	\N	f	2
475	68	Dau oliu	50	muong canh	\N	\N	f	3
476	68	Muoi	65	muong cafe	\N	\N	f	4
477	68	Tieu	20	muong cafe	\N	\N	f	5
478	69	Rau muong xao toi	180	g	\N	\N	f	1
479	69	Dau oliu	50	muong canh	\N	\N	f	2
480	69	Muoi	65	muong cafe	\N	\N	f	3
481	69	Tieu	20	muong cafe	\N	\N	f	4
482	69	Nuoc mam	35	muong canh	\N	\N	f	5
483	70	Rau cai luoc	180	g	\N	\N	f	1
484	70	Muoi	65	muong cafe	\N	\N	f	2
485	70	Tieu	20	muong cafe	\N	\N	f	3
486	70	Nuoc mam	35	muong canh	\N	\N	f	4
487	70	Rau xanh tong hop	50	g	\N	\N	f	5
488	71	Bong cai hap	180	g	\N	\N	f	1
489	71	Tieu	20	muong cafe	\N	\N	f	2
490	71	Nuoc mam	35	muong canh	\N	\N	f	3
491	71	Rau xanh tong hop	50	g	\N	\N	f	4
492	71	Ca rot	65	g	\N	\N	f	5
493	72	Trung op la	180	g	\N	\N	f	1
494	72	Nuoc mam	35	muong canh	\N	\N	f	2
495	72	Rau xanh tong hop	50	g	\N	\N	f	3
496	72	Ca rot	65	g	\N	\N	f	4
497	72	Hanh la	20	g	\N	\N	f	5
498	73	Trung cuon rau	180	g	\N	\N	f	1
499	73	Rau xanh tong hop	50	g	\N	\N	f	2
500	73	Ca rot	65	g	\N	\N	f	3
501	73	Hanh la	20	g	\N	\N	f	4
502	73	Hanh tim	35	cu	\N	\N	f	5
503	74	Sua chua hat chia	180	g	\N	\N	f	1
504	74	Ca rot	65	g	\N	\N	f	2
505	74	Hanh la	20	g	\N	\N	f	3
506	74	Hanh tim	35	cu	\N	\N	f	4
507	74	Toi	50	tep	\N	\N	f	5
508	75	Sinh to bo	180	g	\N	\N	f	1
509	75	Hanh la	20	g	\N	\N	f	2
510	75	Hanh tim	35	cu	\N	\N	f	3
511	75	Toi	50	tep	\N	\N	f	4
512	75	Dau oliu	65	muong canh	\N	\N	f	5
513	76	Sinh to chuoi	180	g	\N	\N	f	1
514	76	Hanh tim	35	cu	\N	\N	f	2
515	76	Toi	50	tep	\N	\N	f	3
516	76	Dau oliu	65	muong canh	\N	\N	f	4
517	76	Muoi	20	muong cafe	\N	\N	f	5
518	77	Chao ga rau cu	180	g	\N	\N	f	1
519	77	Toi	50	tep	\N	\N	f	2
520	77	Dau oliu	65	muong canh	\N	\N	f	3
521	77	Muoi	20	muong cafe	\N	\N	f	4
522	77	Tieu	35	muong cafe	\N	\N	f	5
523	78	Sup bi do ga	180	g	\N	\N	f	1
524	78	Dau oliu	65	muong canh	\N	\N	f	2
525	78	Muoi	20	muong cafe	\N	\N	f	3
526	78	Tieu	35	muong cafe	\N	\N	f	4
527	78	Nuoc mam	50	muong canh	\N	\N	f	5
528	79	Sup rau cu bo	180	g	\N	\N	f	1
529	79	Muoi	20	muong cafe	\N	\N	f	2
530	79	Tieu	35	muong cafe	\N	\N	f	3
531	79	Nuoc mam	50	muong canh	\N	\N	f	4
532	79	Rau xanh tong hop	65	g	\N	\N	f	5
543	82	Goi cuon tom thit	180	g	\N	\N	f	1
544	82	Rau xanh tong hop	65	g	\N	\N	f	2
545	82	Ca rot	20	g	\N	\N	f	3
546	82	Hanh la	35	g	\N	\N	f	4
547	82	Hanh tim	50	cu	\N	\N	f	5
548	83	Goi ga bap cai	180	g	\N	\N	f	1
549	83	Ca rot	20	g	\N	\N	f	2
550	83	Hanh la	35	g	\N	\N	f	3
551	83	Hanh tim	50	cu	\N	\N	f	4
552	83	Toi	65	tep	\N	\N	f	5
553	84	Ca kho to	180	g	\N	\N	f	1
554	84	Hanh la	35	g	\N	\N	f	2
555	84	Hanh tim	50	cu	\N	\N	f	3
556	84	Toi	65	tep	\N	\N	f	4
557	84	Dau oliu	20	muong canh	\N	\N	f	5
558	85	Thit kho tieu	180	g	\N	\N	f	1
559	85	Hanh tim	50	cu	\N	\N	f	2
560	85	Toi	65	tep	\N	\N	f	3
561	85	Dau oliu	20	muong canh	\N	\N	f	4
562	85	Muoi	35	muong cafe	\N	\N	f	5
563	86	Bo luc lac	180	g	\N	\N	f	1
564	86	Toi	65	tep	\N	\N	f	2
565	86	Dau oliu	20	muong canh	\N	\N	f	3
566	86	Muoi	35	muong cafe	\N	\N	f	4
567	86	Tieu	50	muong cafe	\N	\N	f	5
568	87	Com chien duong chau	180	g	\N	\N	f	1
569	87	Dau oliu	20	muong canh	\N	\N	f	2
570	87	Muoi	35	muong cafe	\N	\N	f	3
571	87	Tieu	50	muong cafe	\N	\N	f	4
572	87	Nuoc mam	65	muong canh	\N	\N	f	5
573	88	Com chien ca man	180	g	\N	\N	f	1
574	88	Muoi	35	muong cafe	\N	\N	f	2
575	88	Tieu	50	muong cafe	\N	\N	f	3
576	88	Nuoc mam	65	muong canh	\N	\N	f	4
577	88	Rau xanh tong hop	20	g	\N	\N	f	5
588	91	Bun moc	180	g	\N	\N	f	1
589	91	Rau xanh tong hop	20	g	\N	\N	f	2
590	91	Ca rot	35	g	\N	\N	f	3
591	91	Hanh la	50	g	\N	\N	f	4
592	91	Hanh tim	65	cu	\N	\N	f	5
593	92	Bun ga nam	180	g	\N	\N	f	1
594	92	Ca rot	35	g	\N	\N	f	2
595	92	Hanh la	50	g	\N	\N	f	3
596	92	Hanh tim	65	cu	\N	\N	f	4
597	92	Toi	20	tep	\N	\N	f	5
598	93	Bun chay	180	g	\N	\N	f	1
599	93	Hanh la	50	g	\N	\N	f	2
600	93	Hanh tim	65	cu	\N	\N	f	3
601	93	Toi	20	tep	\N	\N	f	4
602	93	Dau oliu	35	muong canh	\N	\N	f	5
603	94	Com chay kho quet	180	g	\N	\N	f	1
604	94	Hanh tim	65	cu	\N	\N	f	2
605	94	Toi	20	tep	\N	\N	f	3
606	94	Dau oliu	35	muong canh	\N	\N	f	4
607	94	Muoi	50	muong cafe	\N	\N	f	5
608	95	Ca ngu kho dua	180	g	\N	\N	f	1
609	95	Toi	20	tep	\N	\N	f	2
610	95	Dau oliu	35	muong canh	\N	\N	f	3
611	95	Muoi	50	muong cafe	\N	\N	f	4
612	95	Tieu	65	muong cafe	\N	\N	f	5
613	96	Ga xao sa ot	180	g	\N	\N	f	1
614	96	Dau oliu	35	muong canh	\N	\N	f	2
615	96	Muoi	50	muong cafe	\N	\N	f	3
616	96	Tieu	65	muong cafe	\N	\N	f	4
617	96	Nuoc mam	20	muong canh	\N	\N	f	5
618	97	Bo xao can tay	180	g	\N	\N	f	1
619	97	Muoi	50	muong cafe	\N	\N	f	2
620	97	Tieu	65	muong cafe	\N	\N	f	3
621	97	Nuoc mam	20	muong canh	\N	\N	f	4
622	97	Rau xanh tong hop	35	g	\N	\N	f	5
623	98	Thit bam sot dau	180	g	\N	\N	f	1
624	98	Tieu	65	muong cafe	\N	\N	f	2
625	98	Nuoc mam	20	muong canh	\N	\N	f	3
626	98	Rau xanh tong hop	35	g	\N	\N	f	4
627	98	Ca rot	50	g	\N	\N	f	5
628	99	Lau nam chay	180	g	\N	\N	f	1
629	99	Nuoc mam	20	muong canh	\N	\N	f	2
630	99	Rau xanh tong hop	35	g	\N	\N	f	3
631	99	Ca rot	50	g	\N	\N	f	4
632	99	Hanh la	65	g	\N	\N	f	5
633	100	Lau ga la e	180	g	\N	\N	f	1
634	100	Rau xanh tong hop	35	g	\N	\N	f	2
635	100	Ca rot	50	g	\N	\N	f	3
636	100	Hanh la	65	g	\N	\N	f	4
637	100	Hanh tim	20	cu	\N	\N	f	5
638	101	Lau thai hai san	180	g	\N	\N	f	1
639	101	Ca rot	50	g	\N	\N	f	2
640	101	Hanh la	65	g	\N	\N	f	3
641	101	Hanh tim	20	cu	\N	\N	f	4
642	101	Toi	35	tep	\N	\N	f	5
643	102	Lau ca	180	g	\N	\N	f	1
644	102	Hanh la	65	g	\N	\N	f	2
645	102	Hanh tim	20	cu	\N	\N	f	3
646	102	Toi	35	tep	\N	\N	f	4
647	102	Dau oliu	50	muong canh	\N	\N	f	5
648	103	Muc hap gung	180	g	\N	\N	f	1
649	103	Hanh tim	20	cu	\N	\N	f	2
650	103	Toi	35	tep	\N	\N	f	3
651	103	Dau oliu	50	muong canh	\N	\N	f	4
652	103	Muoi	65	muong cafe	\N	\N	f	5
653	104	Muc xao can	180	g	\N	\N	f	1
654	104	Toi	35	tep	\N	\N	f	2
655	104	Dau oliu	50	muong canh	\N	\N	f	3
656	104	Muoi	65	muong cafe	\N	\N	f	4
657	104	Tieu	20	muong cafe	\N	\N	f	5
658	105	Tom rim	180	g	\N	\N	f	1
659	105	Dau oliu	50	muong canh	\N	\N	f	2
660	105	Muoi	65	muong cafe	\N	\N	f	3
661	105	Tieu	20	muong cafe	\N	\N	f	4
662	105	Nuoc mam	35	muong canh	\N	\N	f	5
663	106	Sup cua	180	g	\N	\N	f	1
664	106	Muoi	65	muong cafe	\N	\N	f	2
665	106	Tieu	20	muong cafe	\N	\N	f	3
666	106	Nuoc mam	35	muong canh	\N	\N	f	4
667	106	Rau xanh tong hop	50	g	\N	\N	f	5
668	107	Chao tom	180	g	\N	\N	f	1
669	107	Tieu	20	muong cafe	\N	\N	f	2
670	107	Nuoc mam	35	muong canh	\N	\N	f	3
671	107	Rau xanh tong hop	50	g	\N	\N	f	4
672	107	Ca rot	65	g	\N	\N	f	5
673	108	Chao ca hoi	180	g	\N	\N	f	1
674	108	Nuoc mam	35	muong canh	\N	\N	f	2
675	108	Rau xanh tong hop	50	g	\N	\N	f	3
676	108	Ca rot	65	g	\N	\N	f	4
677	108	Hanh la	20	g	\N	\N	f	5
678	109	Com rong bien ca hoi	180	g	\N	\N	f	1
679	109	Rau xanh tong hop	50	g	\N	\N	f	2
680	109	Ca rot	65	g	\N	\N	f	3
681	109	Hanh la	20	g	\N	\N	f	4
682	109	Hanh tim	35	cu	\N	\N	f	5
683	110	Com suon nuong mat ong	180	g	\N	\N	f	1
684	110	Ca rot	65	g	\N	\N	f	2
685	110	Hanh la	20	g	\N	\N	f	3
686	110	Hanh tim	35	cu	\N	\N	f	4
687	110	Toi	50	tep	\N	\N	f	5
688	111	Mi trung ga	180	g	\N	\N	f	1
689	111	Hanh la	20	g	\N	\N	f	2
690	111	Hanh tim	35	cu	\N	\N	f	3
691	111	Toi	50	tep	\N	\N	f	4
692	111	Dau oliu	65	muong canh	\N	\N	f	5
693	112	Mi xao bo	180	g	\N	\N	f	1
694	112	Hanh tim	35	cu	\N	\N	f	2
695	112	Toi	50	tep	\N	\N	f	3
696	112	Dau oliu	65	muong canh	\N	\N	f	4
697	112	Muoi	20	muong cafe	\N	\N	f	5
698	113	Pho xao bo	180	g	\N	\N	f	1
699	113	Toi	50	tep	\N	\N	f	2
700	113	Dau oliu	65	muong canh	\N	\N	f	3
701	113	Muoi	20	muong cafe	\N	\N	f	4
702	113	Tieu	35	muong cafe	\N	\N	f	5
703	114	Nui xao bo	180	g	\N	\N	f	1
704	114	Dau oliu	65	muong canh	\N	\N	f	2
705	114	Muoi	20	muong cafe	\N	\N	f	3
706	114	Tieu	35	muong cafe	\N	\N	f	4
707	114	Nuoc mam	50	muong canh	\N	\N	f	5
708	115	Banh da cua	180	g	\N	\N	f	1
709	115	Muoi	20	muong cafe	\N	\N	f	2
710	115	Tieu	35	muong cafe	\N	\N	f	3
711	115	Nuoc mam	50	muong canh	\N	\N	f	4
712	115	Rau xanh tong hop	65	g	\N	\N	f	5
713	116	Banh canh cua	180	g	\N	\N	f	1
714	116	Tieu	35	muong cafe	\N	\N	f	2
715	116	Nuoc mam	50	muong canh	\N	\N	f	3
716	116	Rau xanh tong hop	65	g	\N	\N	f	4
717	116	Ca rot	20	g	\N	\N	f	5
718	117	Banh canh gio heo	180	g	\N	\N	f	1
719	117	Nuoc mam	50	muong canh	\N	\N	f	2
720	117	Rau xanh tong hop	65	g	\N	\N	f	3
721	117	Ca rot	20	g	\N	\N	f	4
722	117	Hanh la	35	g	\N	\N	f	5
723	118	Banh canh ga	180	g	\N	\N	f	1
724	118	Rau xanh tong hop	65	g	\N	\N	f	2
725	118	Ca rot	20	g	\N	\N	f	3
726	118	Hanh la	35	g	\N	\N	f	4
727	118	Hanh tim	50	cu	\N	\N	f	5
728	119	Xoi ga	180	g	\N	\N	f	1
729	119	Ca rot	20	g	\N	\N	f	2
730	119	Hanh la	35	g	\N	\N	f	3
731	119	Hanh tim	50	cu	\N	\N	f	4
732	119	Toi	65	tep	\N	\N	f	5
733	120	Xoi dau xanh	180	g	\N	\N	f	1
734	120	Hanh la	35	g	\N	\N	f	2
735	120	Hanh tim	50	cu	\N	\N	f	3
736	120	Toi	65	tep	\N	\N	f	4
737	120	Dau oliu	20	muong canh	\N	\N	f	5
748	123	Bun moc suon	180	g	\N	\N	f	1
749	123	Dau oliu	20	muong canh	\N	\N	f	2
750	123	Muoi	35	muong cafe	\N	\N	f	3
751	123	Tieu	50	muong cafe	\N	\N	f	4
752	123	Nuoc mam	65	muong canh	\N	\N	f	5
753	124	Bun suon non	180	g	\N	\N	f	1
754	124	Muoi	35	muong cafe	\N	\N	f	2
755	124	Tieu	50	muong cafe	\N	\N	f	3
756	124	Nuoc mam	65	muong canh	\N	\N	f	4
757	124	Rau xanh tong hop	20	g	\N	\N	f	5
768	127	Com tom chien	180	g	\N	\N	f	1
769	127	Rau xanh tong hop	20	g	\N	\N	f	2
770	127	Ca rot	35	g	\N	\N	f	3
771	127	Hanh la	50	g	\N	\N	f	4
772	127	Hanh tim	65	cu	\N	\N	f	5
773	128	Com dau hu rau	180	g	\N	\N	f	1
774	128	Ca rot	35	g	\N	\N	f	2
775	128	Hanh la	50	g	\N	\N	f	3
776	128	Hanh tim	65	cu	\N	\N	f	4
777	128	Toi	20	tep	\N	\N	f	5
778	129	Com chay nam	180	g	\N	\N	f	1
779	129	Hanh la	50	g	\N	\N	f	2
780	129	Hanh tim	65	cu	\N	\N	f	3
781	129	Toi	20	tep	\N	\N	f	4
782	129	Dau oliu	35	muong canh	\N	\N	f	5
783	130	Com ga xoi mo	180	g	\N	\N	f	1
784	130	Hanh tim	65	cu	\N	\N	f	2
785	130	Toi	20	tep	\N	\N	f	3
786	130	Dau oliu	35	muong canh	\N	\N	f	4
787	130	Muoi	50	muong cafe	\N	\N	f	5
\.


--
-- Data for Name: recipe_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_steps (id, "recipeId", "stepNumber", description, timer, "imageUrl", tips, "order") FROM stdin;
212	32	1	So che nguyen lieu cho mon Pho ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
213	32	2	Nau/chao mon Pho ga o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
214	32	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
221	35	1	So che nguyen lieu cho mon Banh mi trung, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
222	35	2	Nau/chao mon Banh mi trung o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
223	35	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
224	36	1	So che nguyen lieu cho mon Banh mi ga nuong, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
225	36	2	Nau/chao mon Banh mi ga nuong o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
226	36	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
230	38	1	So che nguyen lieu cho mon Com ga luoc, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
231	38	2	Nau/chao mon Com ga luoc o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
232	38	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
233	39	1	So che nguyen lieu cho mon Com ga nuong, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
234	39	2	Nau/chao mon Com ga nuong o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
235	39	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
236	40	1	So che nguyen lieu cho mon Com bo xao, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
237	40	2	Nau/chao mon Com bo xao o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
238	40	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
239	41	1	So che nguyen lieu cho mon Canh chua ca, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
240	41	2	Nau/chao mon Canh chua ca o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
241	41	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
61	21	1	Sơ chế nguyên liệu.	\N	\N	\N	1
62	21	2	Nấu chín với lửa vừa.	600	\N	\N	2
63	21	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
64	22	1	Sơ chế nguyên liệu.	\N	\N	\N	1
65	22	2	Nấu chín với lửa vừa.	600	\N	\N	2
66	22	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
67	23	1	Sơ chế nguyên liệu.	\N	\N	\N	1
68	23	2	Nấu chín với lửa vừa.	600	\N	\N	2
69	23	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
70	24	1	Sơ chế nguyên liệu.	\N	\N	\N	1
71	24	2	Nấu chín với lửa vừa.	600	\N	\N	2
72	24	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
73	25	1	Sơ chế nguyên liệu.	\N	\N	\N	1
74	25	2	Nấu chín với lửa vừa.	600	\N	\N	2
75	25	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
76	26	1	Sơ chế nguyên liệu.	\N	\N	\N	1
77	26	2	Nấu chín với lửa vừa.	600	\N	\N	2
78	26	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
79	27	1	Sơ chế nguyên liệu.	\N	\N	\N	1
80	27	2	Nấu chín với lửa vừa.	600	\N	\N	2
81	27	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
82	28	1	Sơ chế nguyên liệu.	\N	\N	\N	1
83	28	2	Nấu chín với lửa vừa.	600	\N	\N	2
84	28	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
85	29	1	Sơ chế nguyên liệu.	\N	\N	\N	1
86	29	2	Nấu chín với lửa vừa.	600	\N	\N	2
87	29	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
91	30	1	Sơ chế nguyên liệu.	\N	\N	\N	1
92	30	2	Nấu chín với lửa vừa.	600	\N	\N	2
93	30	3	Trình bày ra đĩa và thưởng thức.	\N	\N	\N	3
103	2	1	Làm nước màu đường (caramel): Đun 20g đường với 0ml nước nóng đến khi chuyển màu cánh gián.	180	\N	\N	1
104	2	2	Ướp thịt:\n- Thịt xay + thịt ba chỉ thái miếng → trộn chung với hành tím, tỏi, sả, nước mắm, đường, dầu hào, tiêu.\n- Ướp ít nhất 2–4 tiếng (tốt nhất để qua đêm trong tủ lạnh).	7200	\N	\N	2
105	2	3	Nướng thịt:\n- Viên thịt xay thành chả viên vừa ăn.\n- Xếp thịt ba chỉ và chả viên lên vỉ nướng than hoặc nồi chiên không dầu (200°C khoảng 15–20 phút).\n- Nướng đến khi vàng giòn, thơm.	1080	\N	\N	3
106	2	4	Pha nước chấm: Nước mắm + đường + nước cốt chanh + tỏi ớt băm + chút giấm.	180	\N	\N	4
107	2	5	Chuẩn bị rau & bún: Luộc bún, rửa sạch rau sống.	300	\N	\N	5
108	2	6	Hoàn thiện: Xếp bún + rau + chả nướng vào tô, chan nước chấm.	240	\N	\N	6
109	1	1	Sơ chế gia vị: Rang sơ hành tây và gừng trên chảo nóng khoảng 2 phút cho thơm. Thái mỏng hành tây ăn kèm.	180	\N	\N	1
110	1	2	Hâm nước dùng: Đun sôi 300ml nước dùng xương bò, cho quế, hoa hồi, hạt ngò, hành tây rang, gừng rang vào. Nêm muối, đường phèn, nước mắm. Để sôi nhẹ 5 phút cho thấm gia vị.	300	\N	\N	2
111	1	3	Chuẩn bị bánh phở: Nếu dùng bánh phở khô: ngâm nước nóng 5 phút. Nếu dùng bánh phở tươi: trụng qua nước sôi 30 giây rồi vớt ra.	120	\N	\N	3
112	1	4	Thái thịt bò — \nThái thịt bò thật mỏng (càng mỏng càng ngon).	90	\N	\N	4
113	1	5	Trụng thịt bò -\nChần nhanh thịt bò tái trong nước dùng đang sôi khoảng 20–30 giây (tùy độ tái bạn muốn).	60	\N	\N	5
114	1	6	Hoàn thiện tô phở —\nXếp bánh phở vào tô, thêm thịt bò tái, gân bò (nếu có), hành lá, ngò gai, giá đỗ, hành tây thái mỏng.	150	\N	\N	6
115	1	7	Chan nước dùng & trình bày —  Chan nước dùng nóng vào tô. Thêm chanh, ớt, tương ớt tùy khẩu vị.	60	\N	\N	7
120	3	1	Ướp sườn với gia vị 2 tiếng.	7200	\N	\N	1
121	3	2	Chiên chả trứng.	\N	\N	\N	2
122	3	3	Nướng sườn.	1500	\N	\N	3
123	3	4	Xếp cơm, sườn, chả, bì, rau.	\N	\N	\N	4
124	4	1	Bánh mì nướng giòn trong lò hoặc chảo (2-3 phút).	180	\N	\N	1
125	4	2	Phết pate lên mặt trong bánh mì.	\N	\N	\N	2
126	4	3	Xếp chả lụa, thịt nguội, thịt kho, dưa leo, đồ chua, rau thơm.	\N	\N	\N	3
127	4	4	Rưới nước sốt (mayonnaise, tương cà, ớt) lên trên.	\N	\N	\N	4
128	4	5	Đậy nắp bánh và thưởng thức khi còn nóng.	\N	\N	\N	5
129	5	1	Luộc tôm và thịt ba chỉ cho chín. Thái thịt lát mỏng, tôm bóc vỏ.	900	\N	\N	1
130	5	2	Rửa sạch rau sống, giá đỗ, hành lá. Để ráo.	\N	\N	\N	2
131	5	3	Nhúng bánh tráng vào nước ấm cho mềm, trải lên thớt.	\N	\N	\N	3
132	5	4	Xếp lần lượt: bún, rau, giá, tôm, thịt, hành lá lên bánh tráng.	\N	\N	\N	4
133	5	5	Cuốn chặt tay, gấp hai đầu rồi cuộn tròn.	\N	\N	\N	5
134	5	6	Làm nước chấm: pha nước mắm, đường, nước lọc, tỏi, ớt. Hoặc dùng tương đen pha loãng.	300	\N	\N	6
135	6	1	Xương bò chần qua nước sôi, rửa sạch. Giò heo cạo lông, rửa sạch. Cho xương và giò vào nồi, đổ nước ngập, ninh 2-3 giờ.	10800	\N	\N	1
136	6	2	Thịt bò bắp ướp muối tiêu, cho vào nồi luộc chín, vớt ra thái lát mỏng.	1800	\N	\N	2
137	6	3	Lọc nước dùng qua rây. Cho sả, hành tây, gừng nướng vào nồi nước dùng, nêm mắm ruốc đã đánh tan, muối, đường.	900	\N	\N	3
138	6	4	Phi thơm dầu điều, cho vào nồi nước dùng để tạo màu đẹp.	\N	\N	\N	4
139	6	5	Trụng bún, xếp vào tô, xếp thịt bò, giò heo, rắc hành lá, ngò gai, rau muống bào, chan nước dùng nóng.	\N	\N	\N	5
140	7	1	Gạo vo sạch, ngâm 30 phút. Xương heo chần qua nước sôi, rửa sạch, ninh lấy nước dùng trong 1 giờ.	3600	\N	\N	1
141	7	2	Lòng non rửa sạch với muối và gừng, luộc chín, thái miếng vừa ăn.	900	\N	\N	2
142	7	3	Cho gạo vào nồi nước dùng, nấu nhừ thành cháo.	2700	\N	\N	3
143	7	4	Phi thơm hành tím, cho lòng non và tiết vào xào sơ, nêm gia vị.	300	\N	\N	4
144	7	5	Múc cháo ra tô, thêm lòng non, tiết, rắc hành lá, rau răm, tiêu.	\N	\N	\N	5
145	8	1	Gạo nếp vo sạch, ngâm nước ấm 4-6 tiếng. Đậu xanh ngâm riêng 2 tiếng.	14400	\N	\N	1
146	8	2	Đậu xanh vớt ra, trộn với chút muối, hấp chín (khoảng 20 phút).	1200	\N	\N	2
147	8	3	Gạo nếp vớt ra để ráo, trộn với 1 muỗng cà phê muối, 1 muỗng dầu ăn. Hấp chín (khoảng 30-40 phút).	2400	\N	\N	3
148	8	4	Hành khô thái lát, phi vàng giòn.	300	\N	\N	4
149	8	5	Xôi chín, xới tơi, cho đậu xanh đã hấp vào trộn đều. Rắc hành phi lên trên.	\N	\N	\N	5
150	8	6	Dọn xôi ra đĩa, ăn kèm chả lụa và hành phi.	\N	\N	\N	6
151	9	1	Pha bột: Trộn bột bánh xèo, nước cốt dừa, nước lọc, hành lá, bột nghệ, một chút muối. Để bột nghỉ 30 phút.	1800	\N	\N	1
152	9	2	Sơ chế nhân: Tôm bóc vỏ, thịt ba chỉ thái mỏng. Hành tây thái lát.	\N	\N	\N	2
153	9	3	Đổ bánh: Làm nóng chảo, quét dầu mỡ. Múc một muôi bột, dàn đều. Rắc tôm, thịt, hành tây, giá đỗ lên trên.	120	\N	\N	3
154	9	4	Đậy vung khoảng 1-2 phút cho bánh chín, gập đôi lại, để ráo dầu.	120	\N	\N	4
155	9	5	Làm lần lượt cho đến hết bột. Bánh xèo ăn kèm rau sống, chấm nước mắm chua ngọt pha sẵn.	\N	\N	\N	5
156	10	1	Xương heo và sườn chần qua nước sôi, rửa sạch. Cho vào nồi 3 lít nước, ninh 1.5-2 giờ.	7200	\N	\N	1
157	10	2	Tôm bóc vỏ, ướp chút tiêu. Thịt băm xào chín. Gan heo luộc chín, thái lát. Trứng cút luộc chín bóc vỏ.	\N	\N	\N	2
158	10	3	Lọc nước dùng qua rây, nêm nước mắm, đường, muối cho vừa ăn.	\N	\N	\N	3
159	10	4	Trụng hủ tiếu trong nước sôi khoảng 30 giây, xếp vào tô. Xếp tôm, thịt băm, gan, trứng cút, rắc hẹ và hành phi.	\N	\N	\N	4
160	10	5	Chan nước dùng nóng, rắc tiêu, dùng nóng.	\N	\N	\N	5
161	11	1	Pha bột: trộn bột gạo, bột năng, nước, muối, để nghỉ 30 phút.	1800	\N	\N	1
162	11	2	Xào nhân: phi thơm hành tím, cho thịt băm, nấm mộc nhĩ vào xào chín, nêm nếm.	600	\N	\N	2
163	11	3	Tráng bánh: dùng khăn mỏng trải bột, hấp cách thủy hoặc dùng chảo chống dính tráng mỏng.	\N	\N	\N	3
164	11	4	Cuốn bánh: trải bánh ra đĩa, cho nhân vào giữa, cuốn lại.	\N	\N	\N	4
165	11	5	Xếp bánh cuốn ra đĩa, thêm chả lụa, hành phi, rau răm, chấm nước mắm chua ngọt.	\N	\N	\N	5
166	12	1	Cua xay nhuyễn, lọc lấy nước riêu, bỏ xác.	600	\N	\N	1
167	12	2	Phi thơm hành tím, cho cà chua vào xào chín, nêm chút muối.	\N	\N	\N	2
168	12	3	Đổ nước riêu vào nồi, thêm nước lọc, đun sôi. Múc riêu từ từ để tạo riêu cua.	\N	\N	\N	3
169	12	4	Thả đậu phụ, giò sống vào nồi. Nêm mắm tôm, muối, đường, dấm (nếu muốn chua).	600	\N	\N	4
170	12	5	Trụng bún, xếp vào tô, chan nước dùng, rắc hành lá, rau thơm.	\N	\N	\N	5
171	13	1	Ninh xương heo lấy nước dùng khoảng 1.5 tiếng.	5400	\N	\N	1
172	13	2	Ướp tôm, thịt với nghệ, tiêu, nước mắm. Xào săn.	\N	\N	\N	2
173	13	3	Cho nước dùng vào nồi thịt tôm, nêm nếm, nấu thêm 15 phút.	900	\N	\N	3
174	13	4	Trụng mì, xếp ra tô, xếp tôm, thịt, rắc đậu phộng, hành phi, chan nước dùng (ít).	\N	\N	\N	4
175	13	5	Ăn kèm bánh tráng mè, rau sống.	\N	\N	\N	5
176	14	1	Trộn bột với tro tàu, nhào kỹ, cán mỏng, cắt sợi. Luộc chín mì, để ráo.	\N	\N	\N	1
177	14	2	Ướp thịt ba chỉ với ngũ vị hương, nước mắm, đường, tỏi, để 2 tiếng.	7200	\N	\N	2
178	14	3	Nướng thịt ở 180°C trong 30 phút, thái lát mỏng.	1800	\N	\N	3
179	14	4	Pha nước sốt: nước mắm, đường, tỏi, ớt, nước lọc.	\N	\N	\N	4
180	14	5	Xếp mì ra tô, xếp thịt xá xíu, rau sống, rắc hành phi, chan nước sốt.	\N	\N	\N	5
181	15	1	Ninh xương heo và giò heo 1.5 tiếng.	5400	\N	\N	1
182	15	2	Vớt giò heo ra, thái lát. Lọc nước dùng.	\N	\N	\N	2
183	15	3	Hòa tan bột năng với nước, đổ từ từ vào nồi nước dùng để tạo độ sánh.	\N	\N	\N	3
184	15	4	Trụng bánh canh, xếp vào tô, thêm giò heo, hành phi, chan nước dùng.	\N	\N	\N	4
185	16	1	Trộn nhân: thịt băm, tôm, miến, mộc nhĩ, cà rốt, hành tím, trứng, gia vị.	\N	\N	\N	1
186	16	2	Trải bánh tráng, cho nhân vào, cuốn chặt vừa phải, dùng nước dính mép.	\N	\N	\N	2
187	16	3	Đun nóng dầu, chiên chả giò lửa vừa đến khi vàng giòn.	600	\N	\N	3
188	16	4	Vớt ra để ráo dầu. Ăn kèm rau sống, nước mắm chua ngọt.	\N	\N	\N	4
189	17	1	Ướp thịt bò với tỏi, hành, bột cà ri, nước mắm, đường, tiêu, dầu ăn 1 tiếng.	3600	\N	\N	1
190	17	2	Phi thơm sả, hành, tỏi, cho thịt vào xào săn.	\N	\N	\N	2
191	17	3	Đổ nước dừa và nước lọc xâm xấp thịt, nêm nếm, nấu nhỏ lửa 1.5-2 tiếng (hoặc nồi áp suất 40 phút).	5400	\N	\N	3
192	17	4	Cho cà rốt vào nấu thêm 15 phút.	900	\N	\N	4
193	17	5	Múc bò kho ra tô, ăn kèm bánh mì, bún hoặc miến.	\N	\N	\N	5
194	18	1	Ướp gà với bột cà ri, nước mắm, đường, tỏi, sả băm 30 phút.	1800	\N	\N	1
195	18	2	Phi thơm hành tây, tỏi, sả, cho gà vào xào săn.	\N	\N	\N	2
196	18	3	Đổ nước ngập gà, nấu 20 phút.	1200	\N	\N	3
197	18	4	Thêm khoai tây, cà rốt, nước cốt dừa, nêm nếm, nấu thêm 15 phút.	900	\N	\N	4
198	18	5	Tắt bếp, rắc thêm tiêu, hành lá. Ăn kèm bánh mì hoặc cơm.	\N	\N	\N	5
199	19	1	Nấu nước dùng: ninh xương heo (hoặc tôm khô) lấy nước ngọt.	3600	\N	\N	1
200	19	2	Phi thơm sả, tỏi, cho vào nồi nước dùng, thêm lá chanh, me, ớt, nêm nước mắm, đường, muối.	\N	\N	\N	2
201	19	3	Đun sôi nước dùng, nêm nếm vị chua cay vừa ăn.	\N	\N	\N	3
202	19	4	Bày hải sản, rau ra đĩa. Mỗi lần nhúng lẩu, nhúng tôm, mực, nghêu chín tới.	\N	\N	\N	4
203	19	5	Ăn kèm bún hoặc mì, chấm với nước mắm pha ớt tỏi.	\N	\N	\N	5
204	20	1	Pha bột: trộn bột năng với nước sôi, nhồi thành khối dẻo.	600	\N	\N	1
205	20	2	Xào nhân: phi hành tím, cho tôm, thịt vào xào chín, nêm nước mắm, tiêu.	300	\N	\N	2
206	20	3	Viên bột, cán mỏng, cho nhân vào giữa, gấp đôi, ép kín.	\N	\N	\N	3
207	20	4	Luộc bánh trong nồi nước sôi, khi bánh nổi lên là chín.	600	\N	\N	4
208	20	5	Vớt bánh ra tô nước lạnh, sau đó xếp ra đĩa, chấm nước mắm chua ngọt.	\N	\N	\N	5
242	42	1	So che nguyen lieu cho mon Canh bi do, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
243	42	2	Nau/chao mon Canh bi do o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
244	42	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
245	43	1	So che nguyen lieu cho mon Canh cai xanh, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
246	43	2	Nau/chao mon Canh cai xanh o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
247	43	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
248	44	1	So che nguyen lieu cho mon Ga ap chao, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
249	44	2	Nau/chao mon Ga ap chao o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
250	44	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
251	45	1	So che nguyen lieu cho mon Ga hap gung, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
252	45	2	Nau/chao mon Ga hap gung o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
253	45	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
254	46	1	So che nguyen lieu cho mon Salad uc ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
255	46	2	Nau/chao mon Salad uc ga o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
256	46	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
257	47	1	So che nguyen lieu cho mon Salad ca ngu, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
258	47	2	Nau/chao mon Salad ca ngu o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
259	47	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
260	48	1	So che nguyen lieu cho mon Yen mach sua chua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
261	48	2	Nau/chao mon Yen mach sua chua o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
262	48	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
263	49	1	So che nguyen lieu cho mon Chao yach mach, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
264	49	2	Nau/chao mon Chao yach mach o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
265	49	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
266	50	1	So che nguyen lieu cho mon Khoai lang luoc, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
267	50	2	Nau/chao mon Khoai lang luoc o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
268	50	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
269	51	1	So che nguyen lieu cho mon Khoai tay nuong, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
270	51	2	Nau/chao mon Khoai tay nuong o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
271	51	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
272	52	1	So che nguyen lieu cho mon Com gao lut ca hoi, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
273	52	2	Nau/chao mon Com gao lut ca hoi o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
274	52	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
275	53	1	So che nguyen lieu cho mon Com gao lut uc ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
276	53	2	Nau/chao mon Com gao lut uc ga o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
277	53	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
278	54	1	So che nguyen lieu cho mon Mien ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
279	54	2	Nau/chao mon Mien ga o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
280	54	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
281	55	1	So che nguyen lieu cho mon Hu tieu nam vang, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
282	55	2	Nau/chao mon Hu tieu nam vang o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
283	55	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
287	57	1	So che nguyen lieu cho mon Bun ca, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
288	57	2	Nau/chao mon Bun ca o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
289	57	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
296	60	1	So che nguyen lieu cho mon Mi xao hai san, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
297	60	2	Nau/chao mon Mi xao hai san o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
298	60	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
299	61	1	So che nguyen lieu cho mon Ca thu kho, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
300	61	2	Nau/chao mon Ca thu kho o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
301	61	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
305	63	1	So che nguyen lieu cho mon Tom hap, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
306	63	2	Nau/chao mon Tom hap o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
307	63	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
308	64	1	So che nguyen lieu cho mon Tom xao bong cai, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
309	64	2	Nau/chao mon Tom xao bong cai o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
310	64	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
311	65	1	So che nguyen lieu cho mon Thit heo luoc, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
312	65	2	Nau/chao mon Thit heo luoc o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
313	65	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
314	66	1	So che nguyen lieu cho mon Thit bo nuong, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
315	66	2	Nau/chao mon Thit bo nuong o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
316	66	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
317	67	1	So che nguyen lieu cho mon Dau hu sot ca chua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
318	67	2	Nau/chao mon Dau hu sot ca chua o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
319	67	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
320	68	1	So che nguyen lieu cho mon Dau hu xao nam, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
321	68	2	Nau/chao mon Dau hu xao nam o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
322	68	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
323	69	1	So che nguyen lieu cho mon Rau muong xao toi, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
324	69	2	Nau/chao mon Rau muong xao toi o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
325	69	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
326	70	1	So che nguyen lieu cho mon Rau cai luoc, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
327	70	2	Nau/chao mon Rau cai luoc o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
328	70	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
329	71	1	So che nguyen lieu cho mon Bong cai hap, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
330	71	2	Nau/chao mon Bong cai hap o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
331	71	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
332	72	1	So che nguyen lieu cho mon Trung op la, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
333	72	2	Nau/chao mon Trung op la o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
334	72	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
335	73	1	So che nguyen lieu cho mon Trung cuon rau, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
336	73	2	Nau/chao mon Trung cuon rau o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
337	73	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
338	74	1	So che nguyen lieu cho mon Sua chua hat chia, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
339	74	2	Nau/chao mon Sua chua hat chia o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
340	74	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
341	75	1	So che nguyen lieu cho mon Sinh to bo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
342	75	2	Nau/chao mon Sinh to bo o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
343	75	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
344	76	1	So che nguyen lieu cho mon Sinh to chuoi, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
345	76	2	Nau/chao mon Sinh to chuoi o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
346	76	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
347	77	1	So che nguyen lieu cho mon Chao ga rau cu, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
348	77	2	Nau/chao mon Chao ga rau cu o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
349	77	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
448	110	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
350	78	1	So che nguyen lieu cho mon Sup bi do ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
351	78	2	Nau/chao mon Sup bi do ga o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
352	78	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
353	79	1	So che nguyen lieu cho mon Sup rau cu bo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
354	79	2	Nau/chao mon Sup rau cu bo o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
355	79	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
362	82	1	So che nguyen lieu cho mon Goi cuon tom thit, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
363	82	2	Nau/chao mon Goi cuon tom thit o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
364	82	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
365	83	1	So che nguyen lieu cho mon Goi ga bap cai, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
366	83	2	Nau/chao mon Goi ga bap cai o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
367	83	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
368	84	1	So che nguyen lieu cho mon Ca kho to, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
369	84	2	Nau/chao mon Ca kho to o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
370	84	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
371	85	1	So che nguyen lieu cho mon Thit kho tieu, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
372	85	2	Nau/chao mon Thit kho tieu o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
373	85	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
374	86	1	So che nguyen lieu cho mon Bo luc lac, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
375	86	2	Nau/chao mon Bo luc lac o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
376	86	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
377	87	1	So che nguyen lieu cho mon Com chien duong chau, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
378	87	2	Nau/chao mon Com chien duong chau o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
379	87	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
380	88	1	So che nguyen lieu cho mon Com chien ca man, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
381	88	2	Nau/chao mon Com chien ca man o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
382	88	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
389	91	1	So che nguyen lieu cho mon Bun moc, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
390	91	2	Nau/chao mon Bun moc o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
391	91	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
392	92	1	So che nguyen lieu cho mon Bun ga nam, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
393	92	2	Nau/chao mon Bun ga nam o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
394	92	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
395	93	1	So che nguyen lieu cho mon Bun chay, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
396	93	2	Nau/chao mon Bun chay o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
397	93	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
398	94	1	So che nguyen lieu cho mon Com chay kho quet, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
399	94	2	Nau/chao mon Com chay kho quet o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
400	94	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
401	95	1	So che nguyen lieu cho mon Ca ngu kho dua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
402	95	2	Nau/chao mon Ca ngu kho dua o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
403	95	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
404	96	1	So che nguyen lieu cho mon Ga xao sa ot, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
405	96	2	Nau/chao mon Ga xao sa ot o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
406	96	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
407	97	1	So che nguyen lieu cho mon Bo xao can tay, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
408	97	2	Nau/chao mon Bo xao can tay o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
409	97	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
410	98	1	So che nguyen lieu cho mon Thit bam sot dau, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
411	98	2	Nau/chao mon Thit bam sot dau o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
412	98	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
413	99	1	So che nguyen lieu cho mon Lau nam chay, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
414	99	2	Nau/chao mon Lau nam chay o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
415	99	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
416	100	1	So che nguyen lieu cho mon Lau ga la e, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
417	100	2	Nau/chao mon Lau ga la e o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
418	100	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
419	101	1	So che nguyen lieu cho mon Lau thai hai san, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
420	101	2	Nau/chao mon Lau thai hai san o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
421	101	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
422	102	1	So che nguyen lieu cho mon Lau ca, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
423	102	2	Nau/chao mon Lau ca o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
424	102	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
425	103	1	So che nguyen lieu cho mon Muc hap gung, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
426	103	2	Nau/chao mon Muc hap gung o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
427	103	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
428	104	1	So che nguyen lieu cho mon Muc xao can, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
429	104	2	Nau/chao mon Muc xao can o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
430	104	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
431	105	1	So che nguyen lieu cho mon Tom rim, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
432	105	2	Nau/chao mon Tom rim o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
433	105	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
434	106	1	So che nguyen lieu cho mon Sup cua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
435	106	2	Nau/chao mon Sup cua o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
436	106	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
437	107	1	So che nguyen lieu cho mon Chao tom, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
438	107	2	Nau/chao mon Chao tom o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
439	107	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
440	108	1	So che nguyen lieu cho mon Chao ca hoi, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
441	108	2	Nau/chao mon Chao ca hoi o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
442	108	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
443	109	1	So che nguyen lieu cho mon Com rong bien ca hoi, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
444	109	2	Nau/chao mon Com rong bien ca hoi o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
445	109	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
446	110	1	So che nguyen lieu cho mon Com suon nuong mat ong, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
447	110	2	Nau/chao mon Com suon nuong mat ong o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
449	111	1	So che nguyen lieu cho mon Mi trung ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
450	111	2	Nau/chao mon Mi trung ga o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
451	111	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
452	112	1	So che nguyen lieu cho mon Mi xao bo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
453	112	2	Nau/chao mon Mi xao bo o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
454	112	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
455	113	1	So che nguyen lieu cho mon Pho xao bo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
456	113	2	Nau/chao mon Pho xao bo o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
457	113	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
458	114	1	So che nguyen lieu cho mon Nui xao bo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
459	114	2	Nau/chao mon Nui xao bo o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
460	114	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
461	115	1	So che nguyen lieu cho mon Banh da cua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
462	115	2	Nau/chao mon Banh da cua o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
463	115	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
464	116	1	So che nguyen lieu cho mon Banh canh cua, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
465	116	2	Nau/chao mon Banh canh cua o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
466	116	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
467	117	1	So che nguyen lieu cho mon Banh canh gio heo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
468	117	2	Nau/chao mon Banh canh gio heo o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
469	117	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
470	118	1	So che nguyen lieu cho mon Banh canh ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
471	118	2	Nau/chao mon Banh canh ga o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
472	118	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
473	119	1	So che nguyen lieu cho mon Xoi ga, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
474	119	2	Nau/chao mon Xoi ga o lua vua trong 32 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
475	119	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
476	120	1	So che nguyen lieu cho mon Xoi dau xanh, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
477	120	2	Nau/chao mon Xoi dau xanh o lua vua trong 37 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
478	120	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
485	123	1	So che nguyen lieu cho mon Bun moc suon, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
486	123	2	Nau/chao mon Bun moc suon o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
487	123	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
488	124	1	So che nguyen lieu cho mon Bun suon non, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
489	124	2	Nau/chao mon Bun suon non o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
490	124	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
497	127	1	So che nguyen lieu cho mon Com tom chien, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
498	127	2	Nau/chao mon Com tom chien o lua vua trong 12 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
499	127	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
500	128	1	So che nguyen lieu cho mon Com dau hu rau, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
501	128	2	Nau/chao mon Com dau hu rau o lua vua trong 17 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
502	128	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
503	129	1	So che nguyen lieu cho mon Com chay nam, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
504	129	2	Nau/chao mon Com chay nam o lua vua trong 22 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
505	129	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
506	130	1	So che nguyen lieu cho mon Com ga xoi mo, rua sach va cat theo kich thuoc vua an.	\N	\N	Co the uop nhanh voi chut muoi tieu de mon dam vi hon.	1
507	130	2	Nau/chao mon Com ga xoi mo o lua vua trong 27 phut den khi chin deu.	\N	\N	Dieu chinh lua nho dan de giu do am va han che chay day.	2
508	130	3	Niem nem lai lan cuoi, bay ra dia va dung nong.	\N	\N	Tang rau xanh an kem de can bang dinh duong.	3
\.


--
-- Data for Name: recipe_tools; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipe_tools (id, "recipeId", name, "isRequired") FROM stdin;
165	32	Chao	t
166	32	Dao	t
167	32	Thot	f
174	35	Muoi xuc	t
175	35	Bat to	t
176	35	Vung noi	f
177	36	Bat to	t
178	36	Vung noi	t
179	36	Bep	f
183	38	Bep	t
184	38	Noi nau	t
185	38	Chao	f
186	39	Noi nau	t
187	39	Chao	t
188	39	Dao	f
189	40	Chao	t
190	40	Dao	t
191	40	Thot	f
192	41	Dao	t
193	41	Thot	t
194	41	Muoi xuc	f
195	42	Thot	t
196	42	Muoi xuc	t
197	42	Bat to	f
198	43	Muoi xuc	t
199	43	Bat to	t
200	43	Vung noi	f
201	44	Bat to	t
202	44	Vung noi	t
203	44	Bep	f
204	45	Vung noi	t
205	45	Bep	t
206	45	Noi nau	f
207	46	Bep	t
208	46	Noi nau	t
209	46	Chao	f
210	47	Noi nau	t
211	47	Chao	t
212	47	Dao	f
213	48	Chao	t
214	48	Dao	t
215	48	Thot	f
216	49	Dao	t
217	49	Thot	t
218	49	Muoi xuc	f
219	50	Thot	t
220	50	Muoi xuc	t
221	50	Bat to	f
61	21	Nồi	t
62	21	Dao	t
63	21	Thớt	t
64	22	Nồi	t
65	22	Dao	t
66	22	Thớt	t
67	23	Nồi	t
68	23	Dao	t
69	23	Thớt	t
70	24	Nồi	t
71	24	Dao	t
72	24	Thớt	t
73	25	Nồi	t
74	25	Dao	t
75	25	Thớt	t
76	26	Nồi	t
77	26	Dao	t
78	26	Thớt	t
79	27	Nồi	t
80	27	Dao	t
81	27	Thớt	t
82	28	Nồi	t
83	28	Dao	t
84	28	Thớt	t
85	29	Nồi	t
86	29	Dao	t
87	29	Thớt	t
222	51	Muoi xuc	t
223	51	Bat to	t
224	51	Vung noi	f
91	30	Nồi	t
92	30	Dao	t
93	30	Thớt	t
225	52	Bat to	t
226	52	Vung noi	t
227	52	Bep	f
228	53	Vung noi	t
229	53	Bep	t
230	53	Noi nau	f
100	2	Chảo / Vỉ nướng than hoặc nồi chiên không dầu	t
101	2	Dao, thớt, tô lớn ướp thịt	t
102	2	Thớt	t
103	1	Nồi	t
104	1	Dao	t
105	1	Thớt	t
106	1	Tô	t
107	1		t
231	54	Bep	t
232	54	Noi nau	t
110	3	Lò nướng	t
111	3	Chảo	t
112	4	Lò nướng hoặc chảo chống dính	t
113	4	Dao, thớt	t
114	5	Nồi luộc	t
115	5	Thớt, dao	t
116	5	Bát nước ấm	t
117	6	Nồi lớn (10 lít)	t
118	6	Rây lọc	t
119	6	Dao, thớt	t
120	7	Nồi lớn	t
121	7	Chảo	t
122	7	Dao, thớt	t
123	8	Xửng hấp hoặc nồi cơm điện	t
124	8	Chảo phi hành	t
125	8	Rổ, thau	t
126	9	Chảo chống dính (hoặc chảo gang)	t
127	9	Muôi múc bột	t
128	9	Đũa dài	t
129	9	Bát pha bột	t
130	10	Nồi lớn (5 lít)	t
131	10	Rây lọc	t
132	10	Nồi nhỏ trụng hủ tiếu	t
133	11	Khăn mỏng (hoặc khuôn tráng bánh cuốn)	t
134	11	Chảo chống dính	t
135	11	Xửng hấp	f
136	11	Dao, thớt	t
137	12	Nồi lớn	t
138	12	Rây lọc	t
139	12	Dao, thớt	t
140	13	Nồi nấu nước dùng	t
141	13	Chảo xào	t
142	13	Dao, thớt	t
143	14	Cối xay bột (hoặc máy cán mì)	t
144	14	Lò nướng	t
145	14	Nồi luộc	t
146	15	Nồi lớn	t
147	15	Rây lọc	t
148	15	Dao, thớt	t
149	16	Chảo sâu lòng (hoặc nồi chiên)	t
150	16	Đũa dài	t
151	16	Rổ để ráo dầu	t
152	17	Nồi áp suất hoặc nồi thường	t
153	17	Dao, thớt	t
154	18	Nồi	t
155	18	Dao, thớt	t
156	19	Nồi lẩu	t
157	19	Bếp từ hoặc bếp gas	t
158	19	Dao, thớt	t
159	20	Nồi luộc	t
160	20	Chảo xào	t
161	20	Màng bọc thực phẩm hoặc lá chuối	t
233	54	Chao	f
234	55	Noi nau	t
235	55	Chao	t
236	55	Dao	f
240	57	Dao	t
241	57	Thot	t
242	57	Muoi xuc	f
249	60	Bat to	t
250	60	Vung noi	t
251	60	Bep	f
252	61	Vung noi	t
253	61	Bep	t
254	61	Noi nau	f
258	63	Noi nau	t
259	63	Chao	t
260	63	Dao	f
261	64	Chao	t
262	64	Dao	t
263	64	Thot	f
264	65	Dao	t
265	65	Thot	t
266	65	Muoi xuc	f
267	66	Thot	t
268	66	Muoi xuc	t
269	66	Bat to	f
270	67	Muoi xuc	t
271	67	Bat to	t
272	67	Vung noi	f
273	68	Bat to	t
274	68	Vung noi	t
275	68	Bep	f
276	69	Vung noi	t
277	69	Bep	t
278	69	Noi nau	f
279	70	Bep	t
280	70	Noi nau	t
281	70	Chao	f
282	71	Noi nau	t
283	71	Chao	t
284	71	Dao	f
285	72	Chao	t
286	72	Dao	t
287	72	Thot	f
288	73	Dao	t
289	73	Thot	t
290	73	Muoi xuc	f
291	74	Thot	t
292	74	Muoi xuc	t
293	74	Bat to	f
294	75	Muoi xuc	t
295	75	Bat to	t
296	75	Vung noi	f
297	76	Bat to	t
298	76	Vung noi	t
299	76	Bep	f
300	77	Vung noi	t
301	77	Bep	t
302	77	Noi nau	f
303	78	Bep	t
304	78	Noi nau	t
305	78	Chao	f
306	79	Noi nau	t
307	79	Chao	t
308	79	Dao	f
315	82	Thot	t
316	82	Muoi xuc	t
317	82	Bat to	f
318	83	Muoi xuc	t
319	83	Bat to	t
320	83	Vung noi	f
321	84	Bat to	t
322	84	Vung noi	t
323	84	Bep	f
324	85	Vung noi	t
325	85	Bep	t
326	85	Noi nau	f
327	86	Bep	t
328	86	Noi nau	t
329	86	Chao	f
330	87	Noi nau	t
331	87	Chao	t
332	87	Dao	f
333	88	Chao	t
334	88	Dao	t
335	88	Thot	f
342	91	Muoi xuc	t
343	91	Bat to	t
344	91	Vung noi	f
345	92	Bat to	t
346	92	Vung noi	t
347	92	Bep	f
348	93	Vung noi	t
349	93	Bep	t
350	93	Noi nau	f
351	94	Bep	t
352	94	Noi nau	t
353	94	Chao	f
354	95	Noi nau	t
355	95	Chao	t
356	95	Dao	f
357	96	Chao	t
358	96	Dao	t
359	96	Thot	f
360	97	Dao	t
361	97	Thot	t
362	97	Muoi xuc	f
363	98	Thot	t
364	98	Muoi xuc	t
365	98	Bat to	f
366	99	Muoi xuc	t
367	99	Bat to	t
368	99	Vung noi	f
369	100	Bat to	t
370	100	Vung noi	t
371	100	Bep	f
372	101	Vung noi	t
373	101	Bep	t
374	101	Noi nau	f
375	102	Bep	t
376	102	Noi nau	t
377	102	Chao	f
378	103	Noi nau	t
379	103	Chao	t
380	103	Dao	f
381	104	Chao	t
382	104	Dao	t
383	104	Thot	f
384	105	Dao	t
385	105	Thot	t
386	105	Muoi xuc	f
387	106	Thot	t
388	106	Muoi xuc	t
389	106	Bat to	f
390	107	Muoi xuc	t
391	107	Bat to	t
392	107	Vung noi	f
393	108	Bat to	t
394	108	Vung noi	t
395	108	Bep	f
396	109	Vung noi	t
397	109	Bep	t
398	109	Noi nau	f
399	110	Bep	t
400	110	Noi nau	t
401	110	Chao	f
402	111	Noi nau	t
403	111	Chao	t
404	111	Dao	f
405	112	Chao	t
406	112	Dao	t
407	112	Thot	f
408	113	Dao	t
409	113	Thot	t
410	113	Muoi xuc	f
411	114	Thot	t
412	114	Muoi xuc	t
413	114	Bat to	f
414	115	Muoi xuc	t
415	115	Bat to	t
416	115	Vung noi	f
417	116	Bat to	t
418	116	Vung noi	t
419	116	Bep	f
420	117	Vung noi	t
421	117	Bep	t
422	117	Noi nau	f
423	118	Bep	t
424	118	Noi nau	t
425	118	Chao	f
426	119	Noi nau	t
427	119	Chao	t
428	119	Dao	f
429	120	Chao	t
430	120	Dao	t
431	120	Thot	f
438	123	Muoi xuc	t
439	123	Bat to	t
440	123	Vung noi	f
441	124	Bat to	t
442	124	Vung noi	t
443	124	Bep	f
450	127	Noi nau	t
451	127	Chao	t
452	127	Dao	f
453	128	Chao	t
454	128	Dao	t
455	128	Thot	f
456	129	Dao	t
457	129	Thot	t
458	129	Muoi xuc	f
459	130	Thot	t
460	130	Muoi xuc	t
461	130	Bat to	f
462	37	Vung noi	t
463	37	Bep	t
464	37	Noi nau	t
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, "foodId", title, summary, "prepTime", "cookTime", "totalTime", servings, difficulty, tips, "nutritionNotes", "videoUrl", "viewCount", "cookCount", "createdAt", "updatedAt") FROM stdin;
20	20	Cách làm Bánh bột lọc nhân tôm thịt	Bánh bột lọc trong dai, nhân tôm thịt đậm đà, chấm nước mắm chua ngọt.	30	20	50	4	EASY	Nhồi bột kỹ, gói bánh kín tránh hở nhân. Luộc bánh trong nước sôi đến khi nổi lên là chín.	Món ăn nhẹ, giàu đạm.	\N	22	0	2026-04-07 03:46:06.016	2026-04-21 06:11:55.624
6	6	Cách nấu Bún bò Huế chuẩn vị	Bún bò Huế với nước dùng đậm đà, thịt bò mềm, giò heo béo ngậy, sợi bún to dai.	45	120	165	6	HARD	Ninh xương bò và giò heo ít nhất 2 tiếng để nước dùng ngọt. Mắm ruốc nên đánh tan trước khi cho vào nồi.	Món ăn giàu đạm, canxi và năng lượng. Phù hợp với người cần bổ sung dinh dưỡng.	\N	25	0	2026-04-07 03:46:05.809	2026-04-20 09:52:39.516
22	22	Cách nấu Bánh ướt chuẩn vị	Hướng dẫn chi tiết nấu món Bánh ướt thơm ngon tại nhà.	17	71	88	2	EASY	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	8	0	2026-04-07 03:46:06.037	2026-04-21 09:51:17.702
39	39	Cong thuc Com ga nuong	Huong dan nau Com ga nuong don gian, de ap dung hang ngay.	20	22	42	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:38.996	2026-04-20 09:36:43.956
4	4	Cách làm Bánh mì Sài Gòn chuẩn vị	Bánh mì giòn tan, pate béo ngậy, chả lụa, thịt nguội, rau thơm, nước sốt đặc biệt.	20	10	30	4	EASY	Nướng bánh mì giòn trước khi xếp nhân. Có thể thêm sốt mayonnaise hoặc tương ớt.	Món ăn đường phố giàu năng lượng, cung cấp tinh bột, đạm và chất béo.	\N	11	0	2026-04-07 03:46:05.77	2026-04-20 09:52:04.24
23	23	Cách nấu Bánh hỏi chuẩn vị	Hướng dẫn chi tiết nấu món Bánh hỏi thơm ngon tại nhà.	45	89	134	4	MEDIUM	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	4	0	2026-04-07 03:46:06.05	2026-04-07 08:32:55.214
21	21	Cách nấu Bánh bèo chuẩn vị	Hướng dẫn chi tiết nấu món Bánh bèo thơm ngon tại nhà.	46	21	67	3	MEDIUM	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	2	0	2026-04-07 03:46:06.029	2026-04-07 08:27:15.234
19	19	Cách nấu Lẩu Thái chua cay hải sản	Lẩu Thái với nước dùng chua cay đặc trưng, hải sản tươi, rau các loại, ăn kèm bún hoặc mì.	40	40	80	6	HARD	Nước dùng ninh từ xương heo hoặc tôm. Sả, lá chanh, me tạo vị chua cay đặc trưng.	Món ăn đa dạng dinh dưỡng, ít béo.	\N	11	0	2026-04-07 03:46:06.004	2026-05-11 06:23:14.69
10	10	Cách nấu Hủ tiếu Nam Vang thơm ngon	Hủ tiếu nước trong, ngọt thanh từ xương, ăn kèm tôm, thịt, gan, trứng cút.	40	120	160	6	MEDIUM	Ninh xương ít nhất 1.5 tiếng để nước dùng ngọt. Hủ tiếu không nên trụng quá lâu sẽ bị nát.	Món ăn cung cấp năng lượng, giàu đạm và canxi.	\N	5	0	2026-04-07 03:46:05.888	2026-04-20 09:54:17.348
11	11	Cách làm Bánh cuốn nóng chả lụa	Bánh cuốn mỏng dẻo, nhân thịt băm nấm mộc nhĩ, ăn kèm chả lụa, nước chấm chua ngọt.	30	40	70	5	MEDIUM	Tráng bánh trên khăn mỏng, dùng khuôn tráng bánh cuốn chuyên dụng sẽ dễ dàng hơn.	Món ăn nhẹ, dễ tiêu, giàu đạm.	\N	7	0	2026-04-07 03:46:05.908	2026-04-20 09:54:31.339
16	16	Cách làm Chả giò (nem rán) giòn rụm	Chả giò với nhân thịt băm, miến, nấm mộc nhĩ, cà rốt, cuốn bánh tráng chiên vàng giòn.	45	20	65	6	EASY	Khi gói chả giò, không cuốn quá chặt để khi chiên bánh tráng không bị bể. Chiên ngập dầu, lửa vừa.	Món ăn nhiều dầu mỡ, nên ăn kèm rau sống và nước chấm chua ngọt để cân bằng.	\N	9	0	2026-04-07 03:46:05.973	2026-04-20 09:55:59.308
14	14	Cách làm Cao lầu Hội An chuẩn vị	Cao lầu với sợi mì dai, thịt xá xíu, nước sốt đậm đà, ăn kèm rau sống, giá, bánh tráng.	45	120	165	5	HARD	Tro tàu để tạo độ dai cho sợi mì. Nướng thịt xá xíu ướp ngũ vị hương.	Món ăn đặc sản Hội An, giàu năng lượng.	\N	5	0	2026-04-07 03:46:05.952	2026-04-20 09:55:28.931
12	12	Cách nấu Bún riêu cua đồng thơm ngon	Bún riêu với nước dùng chua thanh từ cà chua, riêu cua béo ngậy, ăn kèm rau muống chẻ, rau tía tô.	30	60	90	5	MEDIUM	Cua đồng xay nhuyễn, lọc lấy nước riêu. Nêm mắm tôm hoặc mắm ruốc để tăng hương vị.	Món ăn giàu canxi từ cua, tốt cho xương.	\N	9	0	2026-04-07 03:46:05.922	2026-04-20 09:54:43.321
7	7	Cách nấu Cháo lòng thơm ngon	Cháo lòng heo với nước dùng ngọt thanh, lòng non giòn, tiết luộc bùi.	30	60	90	4	MEDIUM	Gạo nấu cháo nên vo sạch, ngâm nước 30 phút trước khi nấu. Lòng non cần rửa sạch với muối và gừng để khử mùi.	Món ăn dễ tiêu, giàu sắt và protein. Thích hợp cho bữa sáng hoặc người ốm.	\N	11	0	2026-04-07 03:46:05.831	2026-05-09 07:47:26.532
9	9	Cách làm Bánh xèo giòn ngon chuẩn vị miền Tây	Bánh xèo vàng giòn, nhân tôm thịt đậm đà, ăn kèm rau sống và nước mắm chua ngọt.	30	30	60	4	MEDIUM	Bột bánh xèo nên để nghỉ 30 phút trước khi đổ. Dùng chảo chống dính, láng mỡ đều.	Món ăn cung cấp năng lượng vừa phải, giàu đạm từ tôm thịt. Có thể ăn kèm nhiều rau để cân bằng.	\N	2	0	2026-04-07 03:46:05.871	2026-04-08 09:05:25.214
3	3	Cách làm Cơm Tấm Sài Gòn chuẩn vị	Cơm tấm với sườn nướng thơm lừng, chả trứng, bì heo giòn tan.	40	35	75	4	MEDIUM	Ướp sườn ít nhất 2 tiếng.	Món giàu năng lượng.	\N	11	0	2026-04-07 03:46:05.758	2026-04-20 09:51:50.236
5	5	Cách làm Gỏi cuốn tôm thịt đơn giản	Gỏi cuốn tươi ngon, chấm nước mắm chua ngọt hoặc tương đen.	30	15	45	4	EASY	Nhúng bánh tráng vào nước ấm cho mềm, không nhúng lâu quá sẽ rách.	Món ăn nhẹ, ít calo, giàu chất xơ và protein.	\N	13	0	2026-04-07 03:46:05.789	2026-04-20 09:52:24.552
40	40	Cong thuc Com bo xao	Huong dan nau Com bo xao don gian, de ap dung hang ngay.	24	27	51	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.011	2026-04-20 09:38:09.64
28	28	Cách nấu Sữa chua chuẩn vị	Hướng dẫn chi tiết nấu món Sữa chua thơm ngon tại nhà.	45	62	107	4	MEDIUM	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	4	0	2026-04-07 03:46:06.115	2026-04-21 09:51:07.216
27	27	Cách nấu Chè chuẩn vị	Hướng dẫn chi tiết nấu món Chè thơm ngon tại nhà.	59	31	90	5	HARD	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	2	0	2026-04-07 03:46:06.098	2026-04-07 08:26:02.778
2	2	Cách nấu Bún chả chuẩn vị	Hướng dẫn chi tiết nấu món Bún chả thơm ngon tại nhà.	120	60	180	1	MEDIUM	- Chọn thịt có tỷ lệ nạc – mỡ cân bằng (20–30% mỡ) để chả không bị khô.\n- Nướng than sẽ thơm ngon nhất, nhưng nồi chiên không dầu cũng rất tiện và sạch.\n- Ướp thịt càng lâu càng ngon (tốt nhất để qua đêm).\n- Pha nước chấm phải vừa chua – ngọt – mặn – cay.\n- Thêm ít bột điều hoặc mật ong vào ướp thịt sẽ giúp chả có màu đẹp và thơm hơn.	- Món ăn giàu protein từ thịt heo, cung cấp năng lượng tốt cho hoạt động cả ngày.\n- Calo khá cao do phần thịt nướng và bún → phù hợp cho người tập gym hoặc lao động chân tay.\n- Có thể giảm calo bằng cách: giảm lượng thịt, tăng rau sống, dùng thịt nạc nhiều hơn.\n- Phù hợp với người ăn kiêng thấp carb nếu giảm bún và tăng rau + dưa chua.\n- Chứa nhiều natri từ nước mắm → người cao huyết áp nên ăn vừa phải.	\N	28	0	2026-04-07 03:46:05.748	2026-04-08 08:19:17.091
26	26	Cách nấu Nem chua chuẩn vị	Hướng dẫn chi tiết nấu món Nem chua thơm ngon tại nhà.	19	42	61	3	EASY	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	2	0	2026-04-07 03:46:06.084	2026-04-07 08:26:14.398
32	32	Cong thuc Pho ga	Huong dan nau Pho ga don gian, de ap dung hang ngay.	12	17	29	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	9	0	2026-04-20 08:43:38.898	2026-04-20 08:50:49.699
25	25	Cách nấu Bún đậu mắm tôm chuẩn vị	Hướng dẫn chi tiết nấu món Bún đậu mắm tôm thơm ngon tại nhà.	52	20	72	5	HARD	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	4	0	2026-04-07 03:46:06.072	2026-04-07 08:26:25.413
24	24	Cách nấu Bún mắm chuẩn vị	Hướng dẫn chi tiết nấu món Bún mắm thơm ngon tại nhà.	57	63	120	2	MEDIUM	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	2	0	2026-04-07 03:46:06.062	2026-04-07 08:26:42.397
30	30	Cách nấu Cà phê sữa đá chuẩn vị1	Hướng dẫn chi tiết nấu món Cà phê sữa đá thơm ngon tại nhà.	59	86	145	5	EASY	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Mon uong day dinh duong1	\N	123	0	2026-04-07 03:46:06.145	2026-04-15 09:08:48.296
15	15	Cách nấu Bánh canh cua hoặc giò heo	Bánh canh sợi to dai, nước dùng sánh, ăn kèm cua, tôm, thịt hoặc giò heo.	30	90	120	5	MEDIUM	Dùng bột năng hoặc bột sắn tạo độ sánh. Ninh xương heo lấy nước dùng ngọt.	Món ăn giàu năng lượng, thích hợp cho bữa sáng.	\N	21	0	2026-04-07 03:46:05.964	2026-05-09 08:22:08.745
38	38	Cong thuc Com ga luoc	Huong dan nau Com ga luoc don gian, de ap dung hang ngay.	16	17	33	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:38.986	2026-04-20 10:08:35.939
36	36	Cong thuc Banh mi ga nuong	Huong dan nau Banh mi ga nuong don gian, de ap dung hang ngay.	8	37	45	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:38.952	2026-04-20 09:33:09.888
18	18	Cách nấu Cà ri gà nước cốt dừa béo ngậy	Cà ri gà thơm lừng, thịt gà mềm, nước cốt dừa béo, ăn kèm bánh mì hoặc cơm nóng.	25	50	75	5	MEDIUM	Sử dụng nước cốt dừa tươi sẽ ngon hơn. Bột cà ri nên rang trước cho thơm.	Món giàu đạm, chất béo từ nước cốt dừa.	\N	12	0	2026-04-07 03:46:05.997	2026-04-20 09:56:32.14
35	35	Cong thuc Banh mi trung	Huong dan nau Banh mi trung don gian, de ap dung hang ngay.	24	32	56	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:38.94	2026-04-20 09:32:33.594
37	37	Cơm trắng	Huong dan nau Com.	12	12	24	1	EASY			\N	12	0	2026-04-20 08:43:38.973	2026-04-21 07:45:10.466
29	29	Cách nấu Trái cây dĩa chuẩn vị	Hướng dẫn chi tiết nấu món Trái cây dĩa thơm ngon tại nhà.	19	38	57	3	EASY	Nêm nếm gia vị vừa ăn, có thể điều chỉnh theo khẩu vị.	Món ăn giàu dinh dưỡng, cân bằng đạm, béo, bột.	\N	22	0	2026-04-07 03:46:06.131	2026-05-09 08:20:10.016
13	13	Cách nấu Mì Quảng gà (hoặc tôm thịt) chuẩn vị Quảng Nam	Mì Quảng với sợi mì vàng dai, nước dùng ít, đậm đà hương vị tôm, thịt, đậu phộng, bánh tráng mè.	35	50	85	6	MEDIUM	Mì Quảng ăn kèm bánh tráng mè, rau sống, chuối chát. Nước dùng sền sệt, không chan quá nhiều.	Món giàu năng lượng, phù hợp bữa chính.	\N	5	0	2026-04-07 03:46:05.936	2026-04-20 09:54:58.831
41	41	Cong thuc Canh chua ca	Huong dan nau Canh chua ca don gian, de ap dung hang ngay.	8	32	40	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.022	2026-04-20 09:38:45.138
42	42	Cong thuc Canh bi do	Huong dan nau Canh bi do don gian, de ap dung hang ngay.	12	37	49	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.032	2026-04-20 09:39:14.843
64	64	Cong thuc Tom xao bong cai	Huong dan nau Tom xao bong cai don gian, de ap dung hang ngay.	20	27	47	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.33	2026-04-20 09:41:26.596
61	61	Cong thuc Ca thu kho	Huong dan nau Ca thu kho don gian, de ap dung hang ngay.	8	12	20	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.297	2026-04-20 09:42:17.613
43	43	Cong thuc Canh cai xanh	Huong dan nau Canh cai xanh don gian, de ap dung hang ngay.	16	12	28	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.044	2026-04-20 09:39:32.844
66	66	Cong thuc Thit bo nuong	Huong dan nau Thit bo nuong don gian, de ap dung hang ngay.	8	37	45	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.353	2026-04-21 03:53:09.879
65	65	Cong thuc Thit heo luoc	Huong dan nau Thit heo luoc don gian, de ap dung hang ngay.	24	32	56	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	17	0	2026-04-20 08:43:39.342	2026-04-21 04:07:53.602
63	63	Cong thuc Tom hap	Huong dan nau Tom hap don gian, de ap dung hang ngay.	16	22	38	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.32	2026-04-20 09:41:51.97
60	60	Cong thuc Mi xao hai san	Huong dan nau Mi xao hai san don gian, de ap dung hang ngay.	24	37	61	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.286	2026-04-20 09:42:47.85
55	55	Cong thuc Hu tieu nam vang	Huong dan nau Hu tieu nam vang don gian, de ap dung hang ngay.	24	12	36	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.197	2026-04-20 09:43:56.407
53	53	Cong thuc Com gao lut uc ga	Huong dan nau Com gao lut uc ga don gian, de ap dung hang ngay.	16	32	48	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.171	2026-04-20 09:44:54.17
57	57	Cong thuc Bun ca	Huong dan nau Bun ca don gian, de ap dung hang ngay.	12	22	34	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.233	2026-04-20 09:43:22.924
51	51	Cong thuc Khoai tay nuong	Huong dan nau Khoai tay nuong don gian, de ap dung hang ngay.	8	22	30	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.137	2026-04-20 09:46:23.97
54	54	Cong thuc Mien ga	Huong dan nau Mien ga don gian, de ap dung hang ngay.	20	37	57	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.185	2026-04-20 09:44:20.008
49	49	Cong thuc Chao yach mach	Huong dan nau Chao yach mach don gian, de ap dung hang ngay.	20	12	32	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.11	2026-04-20 09:47:34.965
52	52	Cong thuc Com gao lut ca hoi	Huong dan nau Com gao lut ca hoi don gian, de ap dung hang ngay.	12	27	39	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.151	2026-04-20 09:45:36.647
47	47	Cong thuc Salad ca ngu	Huong dan nau Salad ca ngu don gian, de ap dung hang ngay.	12	32	44	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.09	2026-04-20 09:49:01.57
50	50	Cong thuc Khoai lang luoc	Huong dan nau Khoai lang luoc don gian, de ap dung hang ngay.	24	17	41	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.124	2026-04-20 09:46:56.53
48	48	Cong thuc Yen mach sua chua	Huong dan nau Yen mach sua chua don gian, de ap dung hang ngay.	16	37	53	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.101	2026-04-20 09:48:35.593
46	46	Cong thuc Salad uc ga	Huong dan nau Salad uc ga don gian, de ap dung hang ngay.	8	27	35	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.077	2026-04-20 09:49:50.403
45	45	Cong thuc Ga hap gung	Huong dan nau Ga hap gung don gian, de ap dung hang ngay.	24	22	46	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.067	2026-04-20 09:50:20.219
44	44	Cong thuc Ga ap chao	Huong dan nau Ga ap chao don gian, de ap dung hang ngay.	20	17	37	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.057	2026-04-20 09:50:53.451
67	67	Cong thuc Dau hu sot ca chua	Huong dan nau Dau hu sot ca chua don gian, de ap dung hang ngay.	12	12	24	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.371	2026-04-21 06:13:23.04
68	68	Cong thuc Dau hu xao nam	Huong dan nau Dau hu xao nam don gian, de ap dung hang ngay.	16	17	33	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.381	2026-04-21 06:28:45.648
95	95	Cong thuc Ca ngu kho dua	Huong dan nau Ca ngu kho dua don gian, de ap dung hang ngay.	24	32	56	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.838	2026-04-21 07:02:21.867
79	79	Cong thuc Sup rau cu bo	Huong dan nau Sup rau cu bo don gian, de ap dung hang ngay.	20	12	32	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	11	0	2026-04-20 08:43:39.57	2026-04-21 06:35:24.129
70	70	Cong thuc Rau cai luoc	Huong dan nau Rau cai luoc don gian, de ap dung hang ngay.	24	27	51	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.414	2026-04-21 06:29:45.993
71	71	Cong thuc Bong cai hap	Huong dan nau Bong cai hap don gian, de ap dung hang ngay.	8	32	40	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.429	2026-04-21 06:30:26.558
72	72	Cong thuc Trung op la	Huong dan nau Trung op la don gian, de ap dung hang ngay.	12	37	49	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.445	2026-04-21 06:30:51.937
73	73	Cong thuc Trung cuon rau	Huong dan nau Trung cuon rau don gian, de ap dung hang ngay.	16	12	28	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.46	2026-04-21 06:31:30.266
74	74	Cong thuc Sua chua hat chia	Huong dan nau Sua chua hat chia don gian, de ap dung hang ngay.	20	17	37	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	4	0	2026-04-20 08:43:39.48	2026-04-21 06:32:08.887
75	75	Cong thuc Sinh to bo	Huong dan nau Sinh to bo don gian, de ap dung hang ngay.	24	22	46	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.496	2026-04-21 06:32:43.924
76	76	Cong thuc Sinh to chuoi	Huong dan nau Sinh to chuoi don gian, de ap dung hang ngay.	8	27	35	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.519	2026-04-21 06:33:14.599
83	83	Cong thuc Goi ga bap cai	Huong dan nau Goi ga bap cai don gian, de ap dung hang ngay.	16	32	48	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.631	2026-04-21 06:37:15.464
85	85	Cong thuc Thit kho tieu	Huong dan nau Thit kho tieu don gian, de ap dung hang ngay.	24	12	36	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.668	2026-04-21 06:38:16.673
77	77	Cong thuc Chao ga rau cu	Huong dan nau Chao ga rau cu don gian, de ap dung hang ngay.	12	32	44	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.53	2026-04-21 06:33:53.079
82	82	Cong thuc Goi cuon tom thit	Huong dan nau Goi cuon tom thit don gian, de ap dung hang ngay.	12	27	39	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.619	2026-04-21 06:36:41.286
87	87	Cong thuc Com chien duong chau	Huong dan nau Com chien duong chau don gian, de ap dung hang ngay.	12	22	34	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.703	2026-04-21 06:39:35.97
84	84	Cong thuc Ca kho to	Huong dan nau Ca kho to don gian, de ap dung hang ngay.	20	37	57	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.642	2026-04-21 06:37:45.127
88	88	Cong thuc Com chien ca man	Huong dan nau Com chien ca man don gian, de ap dung hang ngay.	16	27	43	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.721	2026-04-21 06:40:08.914
86	86	Cong thuc Bo luc lac	Huong dan nau Bo luc lac don gian, de ap dung hang ngay.	8	17	25	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.69	2026-04-21 06:39:04.413
93	93	Cong thuc Bun chay	Huong dan nau Bun chay don gian, de ap dung hang ngay.	16	22	38	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.809	2026-04-21 07:03:24.716
91	91	Cong thuc Bun moc	Huong dan nau Bun moc don gian, de ap dung hang ngay.	8	12	20	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	4	0	2026-04-20 08:43:39.772	2026-04-21 06:40:38.918
96	96	Cong thuc Ga xao sa ot	Huong dan nau Ga xao sa ot don gian, de ap dung hang ngay.	8	37	45	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	4	0	2026-04-20 08:43:39.849	2026-04-21 07:01:50.916
94	94	Cong thuc Com chay kho quet	Huong dan nau Com chay kho quet don gian, de ap dung hang ngay.	20	27	47	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.822	2026-04-21 07:02:51.951
69	69	Cong thuc Rau muong xao toi	Huong dan nau Rau muong xao toi don gian, de ap dung hang ngay.	20	22	42	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.397	2026-04-21 09:51:39.875
92	92	Cong thuc Bun ga nam	Huong dan nau Bun ga nam don gian, de ap dung hang ngay.	12	17	29	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.798	2026-04-21 07:03:47.317
111	111	Cong thuc Mi trung ga	Huong dan nau Mi trung ga don gian, de ap dung hang ngay.	8	22	30	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.041	2026-04-21 06:54:33.307
102	102	Cong thuc Lau ca	Huong dan nau Lau ca don gian, de ap dung hang ngay.	12	37	49	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.931	2026-04-21 06:58:36.821
110	110	Cong thuc Com suon nuong mat ong	Huong dan nau Com suon nuong mat ong don gian, de ap dung hang ngay.	24	17	41	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:40.025	2026-04-21 07:39:51.467
109	109	Cong thuc Com rong bien ca hoi	Huong dan nau Com rong bien ca hoi don gian, de ap dung hang ngay.	20	12	32	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.016	2026-04-21 06:55:37.427
108	108	Cong thuc Chao ca hoi	Huong dan nau Chao ca hoi don gian, de ap dung hang ngay.	16	37	53	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.002	2026-04-21 06:55:59.718
107	107	Cong thuc Chao tom	Huong dan nau Chao tom don gian, de ap dung hang ngay.	12	32	44	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.989	2026-04-21 06:56:18.271
106	106	Cong thuc Sup cua	Huong dan nau Sup cua don gian, de ap dung hang ngay.	8	27	35	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.975	2026-04-21 06:56:42.85
105	105	Cong thuc Tom rim	Huong dan nau Tom rim don gian, de ap dung hang ngay.	24	22	46	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.965	2026-04-21 06:57:07.572
104	104	Cong thuc Muc xao can	Huong dan nau Muc xao can don gian, de ap dung hang ngay.	20	17	37	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.953	2026-04-21 06:57:36.047
103	103	Cong thuc Muc hap gung	Huong dan nau Muc hap gung don gian, de ap dung hang ngay.	16	12	28	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.941	2026-04-21 06:58:10.606
101	101	Cong thuc Lau thai hai san	Huong dan nau Lau thai hai san don gian, de ap dung hang ngay.	8	32	40	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.918	2026-04-21 06:58:56.474
100	100	Cong thuc Lau ga la e	Huong dan nau Lau ga la e don gian, de ap dung hang ngay.	24	27	51	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.907	2026-04-21 06:59:26.643
99	99	Cong thuc Lau nam chay	Huong dan nau Lau nam chay don gian, de ap dung hang ngay.	20	22	42	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.89	2026-04-21 06:59:46.941
98	98	Cong thuc Thit bam sot dau	Huong dan nau Thit bam sot dau don gian, de ap dung hang ngay.	16	17	33	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.876	2026-04-21 07:00:53.793
97	97	Cong thuc Bo xao can tay	Huong dan nau Bo xao can tay don gian, de ap dung hang ngay.	12	12	24	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:39.862	2026-04-21 07:01:24.407
112	112	Cong thuc Mi xao bo	Huong dan nau Mi xao bo don gian, de ap dung hang ngay.	12	27	39	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.058	2026-04-21 07:32:12.617
113	113	Cong thuc Pho xao bo	Huong dan nau Pho xao bo don gian, de ap dung hang ngay.	16	32	48	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.075	2026-04-21 07:32:34.319
114	114	Cong thuc Nui xao bo	Huong dan nau Nui xao bo don gian, de ap dung hang ngay.	20	37	57	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.09	2026-04-21 07:32:50.849
115	115	Cong thuc Banh da cua	Huong dan nau Banh da cua don gian, de ap dung hang ngay.	24	12	36	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.104	2026-04-21 07:33:23.042
116	116	Cong thuc Banh canh cua	Huong dan nau Banh canh cua don gian, de ap dung hang ngay.	8	17	25	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.118	2026-04-21 07:33:47.017
118	118	Cong thuc Banh canh ga	Huong dan nau Banh canh ga don gian, de ap dung hang ngay.	16	27	43	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.142	2026-04-21 07:34:29.669
119	119	Cong thuc Xoi ga	Huong dan nau Xoi ga don gian, de ap dung hang ngay.	20	32	52	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.156	2026-04-21 07:34:52.946
120	120	Cong thuc Xoi dau xanh	Huong dan nau Xoi dau xanh don gian, de ap dung hang ngay.	24	37	61	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.169	2026-04-21 07:35:37.66
123	123	Cong thuc Bun moc suon	Huong dan nau Bun moc suon don gian, de ap dung hang ngay.	16	22	38	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.215	2026-04-21 07:36:34.736
124	124	Cong thuc Bun suon non	Huong dan nau Bun suon non don gian, de ap dung hang ngay.	20	27	47	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.226	2026-04-21 07:36:53.611
1	1	Cách nấu Phở bò chuẩn vị	Hướng dẫn chi tiết nấu món Phở bò thơm ngon tại nhà.	20	45	65	1	MEDIUM	- Dùng nước dùng xương bò ninh sẵn sẽ tiết kiệm rất nhiều thời gian.\n- Thịt bò nên thái thật mỏng để tái nhanh và mềm.\n- Rang sơ hành tây và gừng trước khi cho vào nước dùng sẽ thơm hơn.\n- Phở ngon là nước dùng phải trong, thơm và ngọt tự nhiên.	- Món ăn giàu protein từ thịt bò, dễ tiêu hóa.\n- Calo vừa phải, phù hợp cho bữa chính.\nCó thể giảm calo bằng cách giảm lượng bánh phở và tăng rau thơm + giá đỗ.\n- Người bị gout nên hạn chế phần gân bò.	\N	95	0	2026-04-07 03:46:05.722	2026-05-09 08:20:41.448
127	127	Cong thuc Com tom chien	Huong dan nau Com tom chien don gian, de ap dung hang ngay.	12	12	24	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.266	2026-04-21 07:37:23.966
128	128	Cong thuc Com dau hu rau	Huong dan nau Com dau hu rau don gian, de ap dung hang ngay.	16	17	33	2	MEDIUM	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.277	2026-04-21 07:37:59.739
17	17	Cách nấu Bò kho thơm ngon đậm đà	Bò kho với thịt bò mềm, nước dùng sền sệt, thấm gia vị, ăn kèm bánh mì hoặc bún, miến.	30	90	120	5	MEDIUM	Ướp thịt bò ít nhất 1 tiếng. Dùng nồi áp suất để tiết kiệm thời gian.	Món giàu đạm và năng lượng, thích hợp cho bữa chính.	\N	25	0	2026-04-07 03:46:05.984	2026-04-21 02:49:52.561
78	78	Cong thuc Sup bi do ga	Huong dan nau Sup bi do ga don gian, de ap dung hang ngay.	16	37	53	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:39.549	2026-04-21 06:34:18.206
8	8	Cách làm Xôi xéo thơm ngon, béo bùi	Xôi xéo với đậu xanh bùi, hành phi giòn, thịt nạc băm hoặc chả lụa ăn kèm.	20	60	80	4	MEDIUM	Ngâm gạo nếp ít nhất 4 tiếng hoặc qua đêm. Đậu xanh nên ngâm riêng 2 tiếng. Xôi chín thì xới tơi để hạt không bị dính.	Xôi cung cấp nhiều năng lượng, đậu xanh giàu chất xơ và protein. Có thể ăn kèm chả lụa hoặc ruốc.	\N	11	0	2026-04-07 03:46:05.846	2026-04-20 09:53:08.735
117	117	Cong thuc Banh canh gio heo	Huong dan nau Banh canh gio heo don gian, de ap dung hang ngay.	12	22	34	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:40.133	2026-04-21 07:34:08.246
130	130	Cong thuc Com ga xoi mo	Huong dan nau Com ga xoi mo don gian, de ap dung hang ngay.	24	27	51	1	EASY	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	3	0	2026-04-20 08:43:40.319	2026-04-21 07:39:01.137
129	129	Cong thuc Com chay nam	Huong dan nau Com chay nam don gian, de ap dung hang ngay.	20	22	42	3	HARD	Dieu chinh gia vi theo khau vi va muc tieu dinh duong ca nhan.	Uu tien nguyen lieu tuoi, han che chien ngap dau.	\N	5	0	2026-04-20 08:43:40.302	2026-04-21 09:51:30.839
\.


--
-- Data for Name: recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendations (id, "userId", "foodId", reason, score, "isViewed", "isAccepted", "createdAt") FROM stdin;
61	3	128	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	197.09	f	\N	2026-04-21 09:50:15.666
1	16	14	chua an gan day	88.24	t	f	2026-04-09 09:54:19.533
2	16	4	chua an gan day	83.72	t	t	2026-04-09 09:54:19.533
10	16	2	chua an gan day	61.17	t	t	2026-04-09 09:54:19.533
8	16	27	chua an gan day	68.61	t	t	2026-04-09 09:54:19.533
3	16	20	chua an gan day	74.56	t	t	2026-04-09 09:54:19.533
11	16	14	chua an gan day	88.24	f	\N	2026-04-20 02:07:27.753
12	16	15	chua an gan day	74.75	f	\N	2026-04-20 02:07:27.753
13	16	20	chua an gan day	74.56	f	\N	2026-04-20 02:07:27.753
14	16	8	chua an gan day	72.55	f	\N	2026-04-20 02:07:27.753
15	16	18	chua an gan day	72.18	f	\N	2026-04-20 02:07:27.753
16	16	19	chua an gan day	69.49	f	\N	2026-04-20 02:07:27.753
17	16	27	chua an gan day	68.61	f	\N	2026-04-20 02:07:27.753
19	16	17	chua an gan day	66.9	f	\N	2026-04-20 02:07:27.753
20	16	2	chua an gan day	61.17	f	\N	2026-04-20 02:07:27.753
18	16	4	phu hop muc tieu hien tai	67.72	t	t	2026-04-20 02:07:27.753
62	3	70	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	178.96	f	\N	2026-04-21 09:50:15.666
63	3	110	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, uu tien luoc/hap/nuong	168.73	f	\N	2026-04-21 09:50:15.666
64	3	71	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	166.7	f	\N	2026-04-21 09:50:15.666
65	3	73	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	162.33	f	\N	2026-04-21 09:50:15.666
66	3	106	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	155.78	f	\N	2026-04-21 09:50:15.666
67	3	107	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	137.32	f	\N	2026-04-21 09:50:15.666
68	3	108	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	132.02	f	\N	2026-04-21 09:50:15.666
69	3	54	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	119.68	f	\N	2026-04-21 09:50:15.666
70	3	55	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	118.15	f	\N	2026-04-21 09:50:15.666
71	2	128	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	197.09	f	\N	2026-05-11 06:25:34.479
72	2	71	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	166.7	f	\N	2026-05-11 06:25:34.479
73	2	70	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	162.96	f	\N	2026-05-11 06:25:34.479
74	2	73	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	162.33	f	\N	2026-05-11 06:25:34.479
75	2	106	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, nhieu rau xanh	155.78	f	\N	2026-05-11 06:25:34.479
76	2	110	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, uu tien luoc/hap/nuong	152.73	f	\N	2026-05-11 06:25:34.479
77	2	107	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	137.32	f	\N	2026-05-11 06:25:34.479
78	2	108	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	132.02	f	\N	2026-05-11 06:25:34.479
79	2	14	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	127.49	f	\N	2026-05-11 06:25:34.479
80	2	54	khau phan de xuat 0.8x, khau phan nho hon muc binh thuong, muc calo hop ly cho giam can	119.68	f	\N	2026-05-11 06:25:34.479
\.


--
-- Data for Name: review_replies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.review_replies (id, "reviewId", "userId", content, "createdAt", "updatedAt") FROM stdin;
1	109	16	Ngonnn lam	2026-04-20 02:45:05.655	2026-04-20 02:45:05.655
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, "userId", "foodId", rating, comment, images, "helpfulCount", "createdAt", "updatedAt") FROM stdin;
1	2	10	4	Ngon, sẽ ủng hộ	{}	19	2026-04-07 04:00:08.544	2026-04-07 04:00:08.544
2	2	24	1	Có thể cải thiện	{}	5	2026-04-07 04:00:08.561	2026-04-07 04:00:08.561
3	2	29	2	Không thích lắm	{}	15	2026-04-07 04:00:08.565	2026-04-07 04:00:08.565
4	2	19	1	Có thể cải thiện	{}	11	2026-04-07 04:00:08.567	2026-04-07 04:00:08.567
5	2	12	3	Tạm được	{}	15	2026-04-07 04:00:08.57	2026-04-07 04:00:08.57
6	3	4	5	Tạm được	{}	19	2026-04-07 04:00:08.612	2026-04-07 04:00:08.612
7	3	26	1	Tuyệt vời!	{}	4	2026-04-07 04:00:08.615	2026-04-07 04:00:08.615
8	3	18	1	Không thích lắm	{}	14	2026-04-07 04:00:08.617	2026-04-07 04:00:08.617
9	3	9	1	Tuyệt vời!	{}	18	2026-04-07 04:00:08.619	2026-04-07 04:00:08.619
10	3	12	5	Ngon, sẽ ủng hộ	{}	0	2026-04-07 04:00:08.621	2026-04-07 04:00:08.621
11	3	28	1	Tuyệt vời!	{}	7	2026-04-07 04:00:08.623	2026-04-07 04:00:08.623
12	3	11	2	Không thích lắm	{}	4	2026-04-07 04:00:08.626	2026-04-07 04:00:08.626
13	3	21	5	Ngon, sẽ ủng hộ	{}	2	2026-04-07 04:00:08.628	2026-04-07 04:00:08.628
14	3	2	4	Không thích lắm	{}	5	2026-04-07 04:00:08.63	2026-04-07 04:00:08.63
15	3	15	1	Tạm được	{}	7	2026-04-07 04:00:08.632	2026-04-07 04:00:08.632
16	4	24	1	Tuyệt vời!	{}	10	2026-04-07 04:00:08.674	2026-04-07 04:00:08.674
17	4	14	2	Tuyệt vời!	{}	14	2026-04-07 04:00:08.677	2026-04-07 04:00:08.677
18	4	10	5	Không thích lắm	{}	13	2026-04-07 04:00:08.679	2026-04-07 04:00:08.679
19	4	6	3	Tuyệt vời!	{}	7	2026-04-07 04:00:08.681	2026-04-07 04:00:08.681
20	4	16	2	Tuyệt vời!	{}	16	2026-04-07 04:00:08.683	2026-04-07 04:00:08.683
21	4	1	5	Không thích lắm	{}	10	2026-04-07 04:00:08.685	2026-04-07 04:00:08.685
22	4	29	3	Có thể cải thiện	{}	5	2026-04-07 04:00:08.688	2026-04-07 04:00:08.688
23	4	22	2	Tạm được	{}	12	2026-04-07 04:00:08.69	2026-04-07 04:00:08.69
24	5	10	3	Tuyệt vời!	{}	8	2026-04-07 04:00:08.734	2026-04-07 04:00:08.734
25	5	18	1	Có thể cải thiện	{}	3	2026-04-07 04:00:08.737	2026-04-07 04:00:08.737
26	5	5	2	Ngon, sẽ ủng hộ	{}	3	2026-04-07 04:00:08.74	2026-04-07 04:00:08.74
27	5	13	2	Có thể cải thiện	{}	4	2026-04-07 04:00:08.743	2026-04-07 04:00:08.743
28	5	11	2	Không thích lắm	{}	2	2026-04-07 04:00:08.745	2026-04-07 04:00:08.745
29	5	23	2	Ngon, sẽ ủng hộ	{}	12	2026-04-07 04:00:08.747	2026-04-07 04:00:08.747
30	5	25	4	Ngon, sẽ ủng hộ	{}	15	2026-04-07 04:00:08.748	2026-04-07 04:00:08.748
31	5	17	1	Có thể cải thiện	{}	16	2026-04-07 04:00:08.75	2026-04-07 04:00:08.75
32	5	4	5	Ngon, sẽ ủng hộ	{}	11	2026-04-07 04:00:08.752	2026-04-07 04:00:08.752
33	6	27	3	Tạm được	{}	16	2026-04-07 04:00:08.776	2026-04-07 04:00:08.776
34	6	11	4	Có thể cải thiện	{}	4	2026-04-07 04:00:08.781	2026-04-07 04:00:08.781
35	6	2	5	Không thích lắm	{}	3	2026-04-07 04:00:08.783	2026-04-07 04:00:08.783
36	6	12	1	Có thể cải thiện	{}	6	2026-04-07 04:00:08.785	2026-04-07 04:00:08.785
37	6	5	3	Tuyệt vời!	{}	16	2026-04-07 04:00:08.787	2026-04-07 04:00:08.787
38	6	26	1	Không thích lắm	{}	8	2026-04-07 04:00:08.792	2026-04-07 04:00:08.792
39	6	21	2	Ngon, sẽ ủng hộ	{}	7	2026-04-07 04:00:08.795	2026-04-07 04:00:08.795
40	6	30	1	Ngon, sẽ ủng hộ	{}	13	2026-04-07 04:00:08.798	2026-04-07 04:00:08.798
41	6	16	4	Có thể cải thiện	{}	1	2026-04-07 04:00:08.801	2026-04-07 04:00:08.801
42	6	13	1	Có thể cải thiện	{}	4	2026-04-07 04:00:08.805	2026-04-07 04:00:08.805
43	7	27	2	Có thể cải thiện	{}	17	2026-04-07 04:00:08.847	2026-04-07 04:00:08.847
44	7	9	4	Ngon, sẽ ủng hộ	{}	19	2026-04-07 04:00:08.85	2026-04-07 04:00:08.85
45	7	14	2	Có thể cải thiện	{}	0	2026-04-07 04:00:08.853	2026-04-07 04:00:08.853
46	7	26	4	Không thích lắm	{}	7	2026-04-07 04:00:08.857	2026-04-07 04:00:08.857
47	7	12	3	Ngon, sẽ ủng hộ	{}	8	2026-04-07 04:00:08.859	2026-04-07 04:00:08.859
48	7	29	3	Tuyệt vời!	{}	19	2026-04-07 04:00:08.865	2026-04-07 04:00:08.865
49	8	17	4	Ngon, sẽ ủng hộ	{}	0	2026-04-07 04:00:08.92	2026-04-07 04:00:08.92
50	8	13	5	Có thể cải thiện	{}	15	2026-04-07 04:00:08.924	2026-04-07 04:00:08.924
51	8	12	4	Không thích lắm	{}	6	2026-04-07 04:00:08.926	2026-04-07 04:00:08.926
52	8	18	5	Ngon, sẽ ủng hộ	{}	1	2026-04-07 04:00:08.928	2026-04-07 04:00:08.928
53	8	14	2	Tuyệt vời!	{}	6	2026-04-07 04:00:08.931	2026-04-07 04:00:08.931
54	8	29	1	Ngon, sẽ ủng hộ	{}	9	2026-04-07 04:00:08.933	2026-04-07 04:00:08.933
55	8	8	4	Không thích lắm	{}	12	2026-04-07 04:00:08.936	2026-04-07 04:00:08.936
56	8	26	4	Tuyệt vời!	{}	5	2026-04-07 04:00:08.939	2026-04-07 04:00:08.939
57	8	1	5	Tuyệt vời!	{}	0	2026-04-07 04:00:08.942	2026-04-07 04:00:08.942
58	9	22	5	Tạm được	{}	6	2026-04-07 04:00:08.988	2026-04-07 04:00:08.988
59	9	12	2	Ngon, sẽ ủng hộ	{}	12	2026-04-07 04:00:08.991	2026-04-07 04:00:08.991
60	9	4	5	Tạm được	{}	1	2026-04-07 04:00:08.993	2026-04-07 04:00:08.993
61	9	23	4	Không thích lắm	{}	3	2026-04-07 04:00:08.995	2026-04-07 04:00:08.995
62	9	26	2	Tạm được	{}	14	2026-04-07 04:00:08.997	2026-04-07 04:00:08.997
63	10	3	3	Tạm được	{}	0	2026-04-07 04:00:09.055	2026-04-07 04:00:09.055
64	10	23	5	Tuyệt vời!	{}	13	2026-04-07 04:00:09.058	2026-04-07 04:00:09.058
65	10	6	4	Không thích lắm	{}	7	2026-04-07 04:00:09.061	2026-04-07 04:00:09.061
66	10	21	4	Ngon, sẽ ủng hộ	{}	15	2026-04-07 04:00:09.064	2026-04-07 04:00:09.064
67	10	15	5	Có thể cải thiện	{}	7	2026-04-07 04:00:09.066	2026-04-07 04:00:09.066
68	10	20	5	Có thể cải thiện	{}	3	2026-04-07 04:00:09.068	2026-04-07 04:00:09.068
69	11	27	2	Tạm được	{}	0	2026-04-07 04:00:09.128	2026-04-07 04:00:09.128
70	11	17	1	Không thích lắm	{}	1	2026-04-07 04:00:09.131	2026-04-07 04:00:09.131
71	11	9	5	Có thể cải thiện	{}	17	2026-04-07 04:00:09.133	2026-04-07 04:00:09.133
72	11	28	2	Không thích lắm	{}	12	2026-04-07 04:00:09.135	2026-04-07 04:00:09.135
73	11	30	4	Tuyệt vời!	{}	19	2026-04-07 04:00:09.139	2026-04-07 04:00:09.139
74	12	7	4	Tạm được	{}	5	2026-04-07 04:00:09.184	2026-04-07 04:00:09.184
75	12	10	5	Ngon, sẽ ủng hộ	{}	15	2026-04-07 04:00:09.187	2026-04-07 04:00:09.187
76	12	11	4	Tạm được	{}	7	2026-04-07 04:00:09.19	2026-04-07 04:00:09.19
77	12	9	2	Không thích lắm	{}	6	2026-04-07 04:00:09.192	2026-04-07 04:00:09.192
78	12	2	5	Không thích lắm	{}	18	2026-04-07 04:00:09.194	2026-04-07 04:00:09.194
79	12	5	1	Ngon, sẽ ủng hộ	{}	13	2026-04-07 04:00:09.197	2026-04-07 04:00:09.197
80	13	26	1	Tạm được	{}	17	2026-04-07 04:00:09.242	2026-04-07 04:00:09.242
81	13	24	3	Ngon, sẽ ủng hộ	{}	13	2026-04-07 04:00:09.245	2026-04-07 04:00:09.245
82	13	20	5	Ngon, sẽ ủng hộ	{}	6	2026-04-07 04:00:09.247	2026-04-07 04:00:09.247
83	13	11	2	Ngon, sẽ ủng hộ	{}	11	2026-04-07 04:00:09.249	2026-04-07 04:00:09.249
84	13	16	4	Không thích lắm	{}	14	2026-04-07 04:00:09.252	2026-04-07 04:00:09.252
85	13	30	2	Ngon, sẽ ủng hộ	{}	3	2026-04-07 04:00:09.255	2026-04-07 04:00:09.255
86	13	17	2	Ngon, sẽ ủng hộ	{}	16	2026-04-07 04:00:09.258	2026-04-07 04:00:09.258
87	14	16	4	Ngon, sẽ ủng hộ	{}	2	2026-04-07 04:00:09.292	2026-04-07 04:00:09.292
88	14	6	2	Không thích lắm	{}	18	2026-04-07 04:00:09.295	2026-04-07 04:00:09.295
89	14	30	5	Không thích lắm	{}	14	2026-04-07 04:00:09.298	2026-04-07 04:00:09.298
90	14	28	3	Tuyệt vời!	{}	11	2026-04-07 04:00:09.3	2026-04-07 04:00:09.3
91	14	8	3	Tuyệt vời!	{}	15	2026-04-07 04:00:09.303	2026-04-07 04:00:09.303
92	14	19	3	Tuyệt vời!	{}	13	2026-04-07 04:00:09.306	2026-04-07 04:00:09.306
93	14	23	1	Tạm được	{}	2	2026-04-07 04:00:09.311	2026-04-07 04:00:09.311
94	15	12	5	Ngon, sẽ ủng hộ	{}	15	2026-04-07 04:00:09.355	2026-04-07 04:00:09.355
95	15	24	5	Tạm được	{}	17	2026-04-07 04:00:09.358	2026-04-07 04:00:09.358
96	15	26	2	Tạm được	{}	17	2026-04-07 04:00:09.361	2026-04-07 04:00:09.361
97	15	15	5	Ngon, sẽ ủng hộ	{}	1	2026-04-07 04:00:09.363	2026-04-07 04:00:09.363
98	15	5	1	Tuyệt vời!	{}	13	2026-04-07 04:00:09.365	2026-04-07 04:00:09.365
99	15	25	1	Ngon, sẽ ủng hộ	{}	14	2026-04-07 04:00:09.367	2026-04-07 04:00:09.367
100	15	3	5	Không thích lắm	{}	16	2026-04-07 04:00:09.369	2026-04-07 04:00:09.369
101	15	4	4	Ngon, sẽ ủng hộ	{}	8	2026-04-07 04:00:09.373	2026-04-07 04:00:09.373
102	15	27	4	Tuyệt vời!	{}	3	2026-04-07 04:00:09.379	2026-04-07 04:00:09.379
103	1	30	3	Không thích lắm	{}	6	2026-04-07 04:00:09.423	2026-04-07 04:00:09.423
104	1	28	4	Ngon, sẽ ủng hộ	{}	6	2026-04-07 04:00:09.426	2026-04-07 04:00:09.426
105	1	19	5	Tạm được	{}	16	2026-04-07 04:00:09.428	2026-04-07 04:00:09.428
106	1	4	3	Ngon, sẽ ủng hộ	{}	5	2026-04-07 04:00:09.43	2026-04-07 04:00:09.43
107	1	10	3	Không thích lắm	{}	15	2026-04-07 04:00:09.433	2026-04-07 04:00:09.433
108	1	27	5	Có thể cải thiện	{}	5	2026-04-07 04:00:09.435	2026-04-07 04:00:09.435
109	1	1	1	Ngon, sẽ ủng hộ	{}	7	2026-04-07 04:00:09.44	2026-04-07 04:00:09.44
110	1	3	2	Tạm được	{}	2	2026-04-07 04:00:09.445	2026-04-07 04:00:09.445
111	1	2	4	Tuyệt vời!	{}	0	2026-04-07 04:00:09.447	2026-04-07 04:00:09.447
112	16	1	3	Tam on	{}	0	2026-04-20 02:51:53.793	2026-04-20 02:51:53.793
\.


--
-- Data for Name: scan_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.scan_history (id, "userId", "imageUrl", result, confidence, "isConfirmed", "createdAt") FROM stdin;
1	1	https://picsum.photos/seed/10/200/150	{"foodName": "Cà ri gà", "confidence": 0.9792917576547335}	0.8249946999744053	f	2026-02-03 04:05:35.17
2	1	https://picsum.photos/seed/11/200/150	{"foodName": "Cà ri gà", "confidence": 0.7667015224212199}	0.8200203149134205	f	2026-01-27 15:00:19.763
3	1	https://picsum.photos/seed/12/200/150	{"foodName": "Cà phê sữa đá", "confidence": 0.7287880835803804}	0.8435485018281415	t	2026-01-09 19:33:06.764
4	1	https://picsum.photos/seed/13/200/150	{"foodName": "Bún riêu", "confidence": 0.7030535725540145}	0.8215989665095361	f	2026-01-24 15:10:53.058
5	1	https://picsum.photos/seed/14/200/150	{"foodName": "Trái cây dĩa", "confidence": 0.7410921402982185}	0.9075886992966657	f	2026-03-26 13:10:12.545
6	1	https://picsum.photos/seed/15/200/150	{"foodName": "Bánh xèo", "confidence": 0.9816695130200528}	0.8764610995339367	t	2026-02-23 06:17:16.284
7	1	https://picsum.photos/seed/16/200/150	{"foodName": "Cao lầu", "confidence": 0.7722118117000784}	0.779478511570505	t	2026-03-18 08:34:37.329
8	1	https://picsum.photos/seed/17/200/150	{"foodName": "Cháo lòng", "confidence": 0.9628607983014507}	0.7047654606616159	t	2026-01-11 11:05:28.167
9	1	https://picsum.photos/seed/18/200/150	{"foodName": "Sữa chua", "confidence": 0.8372514496359458}	0.8270873982355155	f	2026-03-05 22:03:51.331
10	2	https://picsum.photos/seed/20/200/150	{"foodName": "Bún đậu mắm tôm", "confidence": 0.8135504588896205}	0.764992612989913	t	2026-02-15 04:41:22.857
11	2	https://picsum.photos/seed/21/200/150	{"foodName": "Bún mắm", "confidence": 0.8795564242804687}	0.7435559438903101	f	2026-03-16 12:58:10.38
12	2	https://picsum.photos/seed/22/200/150	{"foodName": "Chè", "confidence": 0.9660647023477935}	0.828206361189736	t	2026-03-28 14:52:21.28
13	2	https://picsum.photos/seed/23/200/150	{"foodName": "Bánh ướt", "confidence": 0.8161206182298387}	0.9051007218673515	f	2026-03-22 16:27:13.397
14	2	https://picsum.photos/seed/24/200/150	{"foodName": "Bánh canh", "confidence": 0.8872119940979357}	0.7076091436068676	t	2026-02-21 04:47:48.667
15	2	https://picsum.photos/seed/25/200/150	{"foodName": "Cháo lòng", "confidence": 0.8846918614302434}	0.8846175040014497	t	2026-03-19 10:04:09.471
16	2	https://picsum.photos/seed/26/200/150	{"foodName": "Chả giò", "confidence": 0.701174756741424}	0.9495993170439563	f	2026-01-28 08:29:07.752
17	2	https://picsum.photos/seed/27/200/150	{"foodName": "Bánh canh", "confidence": 0.7161818260845967}	0.9196722741422417	f	2026-03-12 18:08:59.736
18	3	https://picsum.photos/seed/30/200/150	{"foodName": "Gỏi cuốn", "confidence": 0.9275472486120333}	0.707528283985307	t	2026-02-18 14:46:54.985
19	3	https://picsum.photos/seed/31/200/150	{"foodName": "Chả giò", "confidence": 0.7517086253296625}	0.7894980955716638	f	2026-02-07 15:50:27.313
20	3	https://picsum.photos/seed/32/200/150	{"foodName": "Bún đậu mắm tôm", "confidence": 0.8740527290824384}	0.9616059377713242	t	2026-01-21 21:46:49.935
21	3	https://picsum.photos/seed/33/200/150	{"foodName": "Nem chua", "confidence": 0.8545220984899116}	0.7995774974314922	f	2026-03-16 17:25:03.78
22	3	https://picsum.photos/seed/34/200/150	{"foodName": "Trái cây dĩa", "confidence": 0.8757606463541215}	0.7609560973649533	t	2026-02-02 05:50:43.03
23	3	https://picsum.photos/seed/35/200/150	{"foodName": "Bò kho", "confidence": 0.7788701521613307}	0.7752496335547561	t	2026-02-15 03:38:03.815
24	3	https://picsum.photos/seed/36/200/150	{"foodName": "Cao lầu", "confidence": 0.9650220499654377}	0.8509060959797835	t	2026-01-08 12:49:17.163
25	3	https://picsum.photos/seed/37/200/150	{"foodName": "Nem chua", "confidence": 0.7498480352386336}	0.959582355134624	f	2026-02-17 03:43:36.948
26	3	https://picsum.photos/seed/38/200/150	{"foodName": "Trái cây dĩa", "confidence": 0.7402994684098131}	0.8695747596949653	t	2026-02-23 14:59:44.171
27	3	https://picsum.photos/seed/39/200/150	{"foodName": "Bánh mì", "confidence": 0.7113142856990295}	0.7680799667940177	t	2026-01-08 13:04:15.844
28	4	https://picsum.photos/seed/40/200/150	{"foodName": "Cao lầu", "confidence": 0.7719326991411865}	0.8422490781939639	t	2026-01-23 11:46:48.595
29	4	https://picsum.photos/seed/41/200/150	{"foodName": "Lẩu Thái", "confidence": 0.7431069101102132}	0.8138852643085996	f	2026-02-24 11:47:02.738
30	4	https://picsum.photos/seed/42/200/150	{"foodName": "Xôi xéo", "confidence": 0.8693339436923248}	0.7896083312678192	t	2026-01-09 23:26:10.47
31	4	https://picsum.photos/seed/43/200/150	{"foodName": "Xôi xéo", "confidence": 0.9582353692080517}	0.9778018054917217	f	2026-02-07 13:50:15.971
32	4	https://picsum.photos/seed/44/200/150	{"foodName": "Bánh xèo", "confidence": 0.7245843622656877}	0.733580909605318	f	2026-01-11 12:54:02.48
33	4	https://picsum.photos/seed/45/200/150	{"foodName": "Phở bò", "confidence": 0.7554071506136836}	0.749250105824494	t	2026-03-28 13:09:42.365
34	5	https://picsum.photos/seed/50/200/150	{"foodName": "Bánh mì", "confidence": 0.7607710850614344}	0.8692077732122246	t	2026-02-13 01:59:27.322
35	5	https://picsum.photos/seed/51/200/150	{"foodName": "Bánh bèo", "confidence": 0.9851358773572726}	0.8849624070847228	t	2026-03-19 06:32:41.127
36	5	https://picsum.photos/seed/52/200/150	{"foodName": "Bún đậu mắm tôm", "confidence": 0.8312239056971834}	0.7452734214727224	f	2026-02-14 22:41:51.687
37	5	https://picsum.photos/seed/53/200/150	{"foodName": "Bánh mì", "confidence": 0.7158996321309652}	0.7274895801637441	t	2026-02-23 11:55:09.226
38	5	https://picsum.photos/seed/54/200/150	{"foodName": "Bò kho", "confidence": 0.898807613000589}	0.8706995387883167	t	2026-02-07 03:21:37.292
39	5	https://picsum.photos/seed/55/200/150	{"foodName": "Phở bò", "confidence": 0.7771607215043538}	0.791514092270301	t	2026-01-12 11:39:01.477
40	5	https://picsum.photos/seed/56/200/150	{"foodName": "Bánh cuốn", "confidence": 0.7242064095536199}	0.8165030029816742	t	2026-01-16 22:53:28.32
41	5	https://picsum.photos/seed/57/200/150	{"foodName": "Chè", "confidence": 0.9220390024347158}	0.8797137035906377	t	2026-01-31 15:14:25.835
42	6	https://picsum.photos/seed/60/200/150	{"foodName": "Bánh canh", "confidence": 0.7836458029682317}	0.9365708162502674	t	2026-03-04 07:52:50.096
43	6	https://picsum.photos/seed/61/200/150	{"foodName": "Hủ tiếu", "confidence": 0.9816048944320959}	0.7146626637042777	t	2026-02-28 15:16:40.737
44	6	https://picsum.photos/seed/62/200/150	{"foodName": "Bánh bèo", "confidence": 0.8813851923854855}	0.8706715611095444	t	2026-01-23 08:42:52.497
45	6	https://picsum.photos/seed/63/200/150	{"foodName": "Bún đậu mắm tôm", "confidence": 0.7567905864717216}	0.8565664367562892	f	2026-03-17 05:48:00.6
46	6	https://picsum.photos/seed/64/200/150	{"foodName": "Bánh mì", "confidence": 0.9151312636753287}	0.9288005524185067	t	2026-02-25 20:33:58.557
47	6	https://picsum.photos/seed/65/200/150	{"foodName": "Bánh bột lọc", "confidence": 0.8536700062390656}	0.9300497113118568	t	2026-02-20 01:02:54.645
48	7	https://picsum.photos/seed/70/200/150	{"foodName": "Bò kho", "confidence": 0.8272764716937893}	0.7309484417381769	t	2026-01-28 13:47:59.094
49	7	https://picsum.photos/seed/71/200/150	{"foodName": "Xôi xéo", "confidence": 0.7153955421576724}	0.8817833420060515	t	2026-03-18 15:40:07.915
50	7	https://picsum.photos/seed/72/200/150	{"foodName": "Chè", "confidence": 0.9817997903836888}	0.8852716341326012	f	2026-03-14 23:15:49.886
51	7	https://picsum.photos/seed/73/200/150	{"foodName": "Cháo lòng", "confidence": 0.9584643494071465}	0.748187604828753	t	2026-03-16 10:19:14.538
52	7	https://picsum.photos/seed/74/200/150	{"foodName": "Bánh canh", "confidence": 0.9221511925725793}	0.9206338847730874	t	2026-03-12 06:34:32.239
53	7	https://picsum.photos/seed/75/200/150	{"foodName": "Bánh bèo", "confidence": 0.9253674552662431}	0.7554252357576493	f	2026-03-11 05:40:12.298
54	7	https://picsum.photos/seed/76/200/150	{"foodName": "Cháo lòng", "confidence": 0.9333109162732626}	0.9858924844405417	t	2026-03-19 10:55:56.904
55	7	https://picsum.photos/seed/77/200/150	{"foodName": "Cháo lòng", "confidence": 0.9274204827765122}	0.9176102195886638	t	2026-02-27 04:02:49.929
56	7	https://picsum.photos/seed/78/200/150	{"foodName": "Bánh ướt", "confidence": 0.8715435414107103}	0.8105122502380442	t	2026-02-11 08:47:08.657
57	7	https://picsum.photos/seed/79/200/150	{"foodName": "Bánh hỏi", "confidence": 0.9332898328161492}	0.7281953076776129	f	2026-03-09 20:20:51.072
58	8	https://picsum.photos/seed/80/200/150	{"foodName": "Bánh bèo", "confidence": 0.9498561608805002}	0.7201336434127238	f	2026-02-22 00:12:58.117
59	8	https://picsum.photos/seed/81/200/150	{"foodName": "Chè", "confidence": 0.9341610924647132}	0.7014047166197646	t	2026-03-05 15:30:34.516
60	8	https://picsum.photos/seed/82/200/150	{"foodName": "Sữa chua", "confidence": 0.9041019887722794}	0.8807530722506698	t	2026-03-01 06:19:44.364
61	8	https://picsum.photos/seed/83/200/150	{"foodName": "Cà phê sữa đá", "confidence": 0.8014327051611201}	0.9436779480434587	t	2026-03-28 14:06:20.896
62	8	https://picsum.photos/seed/84/200/150	{"foodName": "Lẩu Thái", "confidence": 0.8047757233063488}	0.7219661439107021	t	2026-03-27 04:14:53.395
63	8	https://picsum.photos/seed/85/200/150	{"foodName": "Lẩu Thái", "confidence": 0.9717027197789256}	0.8108647018005464	t	2026-01-27 04:23:41.372
64	8	https://picsum.photos/seed/86/200/150	{"foodName": "Bún bò Huế", "confidence": 0.8599543695260337}	0.9470865500017289	f	2026-02-10 12:48:36.231
65	8	https://picsum.photos/seed/87/200/150	{"foodName": "Bánh cuốn", "confidence": 0.8583699981975043}	0.8296388794859151	f	2026-02-19 22:23:14.634
66	9	https://picsum.photos/seed/90/200/150	{"foodName": "Cao lầu", "confidence": 0.9366376396535404}	0.7090006756819727	f	2026-01-19 06:42:30.658
67	9	https://picsum.photos/seed/91/200/150	{"foodName": "Bún bò Huế", "confidence": 0.9282325672634929}	0.8746001014318129	t	2026-01-12 13:24:36.437
68	9	https://picsum.photos/seed/92/200/150	{"foodName": "Cà phê sữa đá", "confidence": 0.9042887151585904}	0.8152864253977404	t	2026-03-07 11:00:18.896
69	9	https://picsum.photos/seed/93/200/150	{"foodName": "Xôi xéo", "confidence": 0.7425554801618464}	0.9398503586601168	t	2026-02-01 21:35:37.495
70	9	https://picsum.photos/seed/94/200/150	{"foodName": "Trái cây dĩa", "confidence": 0.7242448313058861}	0.8065265074690741	t	2026-03-06 15:26:34.901
71	9	https://picsum.photos/seed/95/200/150	{"foodName": "Bánh hỏi", "confidence": 0.8125608477885914}	0.8655755542405189	t	2026-04-04 09:22:25.887
72	9	https://picsum.photos/seed/96/200/150	{"foodName": "Sữa chua", "confidence": 0.9655066625392185}	0.9628130501705304	t	2026-02-18 20:43:53.284
73	10	https://picsum.photos/seed/100/200/150	{"foodName": "Bánh cuốn", "confidence": 0.8177193960965292}	0.8044679149942702	t	2026-02-13 07:47:55.393
74	10	https://picsum.photos/seed/101/200/150	{"foodName": "Phở bò", "confidence": 0.9312032234083347}	0.7332185589951333	t	2026-01-14 05:42:48.996
75	10	https://picsum.photos/seed/102/200/150	{"foodName": "Bánh bèo", "confidence": 0.7879767107943545}	0.7237038100755034	t	2026-02-10 13:07:23.978
76	10	https://picsum.photos/seed/103/200/150	{"foodName": "Chả giò", "confidence": 0.858619519875215}	0.775226532204174	t	2026-03-29 18:08:33.389
77	10	https://picsum.photos/seed/104/200/150	{"foodName": "Bún mắm", "confidence": 0.8459451515270314}	0.9392081346105314	f	2026-02-16 10:59:24.025
78	10	https://picsum.photos/seed/105/200/150	{"foodName": "Gỏi cuốn", "confidence": 0.7606900779866924}	0.7397061441723735	t	2026-01-22 22:14:33.307
79	10	https://picsum.photos/seed/106/200/150	{"foodName": "Bánh canh", "confidence": 0.9219620937794464}	0.7707966846969264	t	2026-02-11 15:15:41.187
80	10	https://picsum.photos/seed/107/200/150	{"foodName": "Phở bò", "confidence": 0.7043337960657927}	0.8338364472325313	t	2026-02-06 22:06:51.256
81	10	https://picsum.photos/seed/108/200/150	{"foodName": "Cháo lòng", "confidence": 0.7561747272779198}	0.7231413490347264	f	2026-02-09 18:11:24.757
82	10	https://picsum.photos/seed/109/200/150	{"foodName": "Bánh bèo", "confidence": 0.935233149629634}	0.8246538695184609	t	2026-02-16 00:05:14.96
83	11	https://picsum.photos/seed/110/200/150	{"foodName": "Chả giò", "confidence": 0.885103801734618}	0.7651378290953793	t	2026-02-27 15:43:55.504
84	11	https://picsum.photos/seed/111/200/150	{"foodName": "Mì Quảng", "confidence": 0.7147992975654469}	0.899030807461008	t	2026-02-06 08:04:43.343
85	11	https://picsum.photos/seed/112/200/150	{"foodName": "Cơm tấm", "confidence": 0.9398162687577933}	0.7515993847718085	t	2026-03-07 19:38:37.12
86	11	https://picsum.photos/seed/113/200/150	{"foodName": "Cà ri gà", "confidence": 0.9288798767496667}	0.8859273098525046	t	2026-02-18 05:10:10.209
87	11	https://picsum.photos/seed/114/200/150	{"foodName": "Bún bò Huế", "confidence": 0.7387355775196692}	0.8888070052777155	t	2026-01-31 10:46:21.399
88	11	https://picsum.photos/seed/115/200/150	{"foodName": "Cà phê sữa đá", "confidence": 0.921391985063061}	0.9691174814321197	t	2026-02-07 20:28:10.316
89	11	https://picsum.photos/seed/116/200/150	{"foodName": "Bánh hỏi", "confidence": 0.7442931061830136}	0.7561980052289639	t	2026-02-14 06:32:51.181
90	11	https://picsum.photos/seed/117/200/150	{"foodName": "Bún chả", "confidence": 0.7372974353527516}	0.8862283036798018	t	2026-01-20 19:39:42.079
91	11	https://picsum.photos/seed/118/200/150	{"foodName": "Bún đậu mắm tôm", "confidence": 0.9634586302451291}	0.701098388096795	t	2026-04-04 05:43:38.403
92	11	https://picsum.photos/seed/119/200/150	{"foodName": "Cháo lòng", "confidence": 0.7285439450882675}	0.8076590680011738	t	2026-02-05 10:32:43.18
93	12	https://picsum.photos/seed/120/200/150	{"foodName": "Bánh bột lọc", "confidence": 0.9445183929879437}	0.9780834657073865	t	2026-03-02 11:28:44.158
94	12	https://picsum.photos/seed/121/200/150	{"foodName": "Lẩu Thái", "confidence": 0.8303168046858117}	0.7181745734989736	t	2026-02-07 13:09:24.713
95	12	https://picsum.photos/seed/122/200/150	{"foodName": "Bún chả", "confidence": 0.9360087179913168}	0.8116416224815307	t	2026-02-28 00:16:48.924
96	12	https://picsum.photos/seed/123/200/150	{"foodName": "Cháo lòng", "confidence": 0.8948940511806662}	0.8823842715475521	t	2026-02-23 12:21:17.938
97	12	https://picsum.photos/seed/124/200/150	{"foodName": "Chả giò", "confidence": 0.9688428016056538}	0.7862330744509183	t	2026-02-26 14:27:54.271
98	13	https://picsum.photos/seed/130/200/150	{"foodName": "Cà ri gà", "confidence": 0.9127661758848712}	0.9868970684439057	t	2026-02-28 03:54:37.018
99	13	https://picsum.photos/seed/131/200/150	{"foodName": "Lẩu Thái", "confidence": 0.8572142583909836}	0.9781453599499257	t	2026-02-15 19:04:19.072
100	13	https://picsum.photos/seed/132/200/150	{"foodName": "Bánh bèo", "confidence": 0.8255133878133822}	0.7558345722948767	t	2026-01-29 04:46:42.338
101	13	https://picsum.photos/seed/133/200/150	{"foodName": "Chè", "confidence": 0.8586432319340362}	0.8447374034410645	t	2026-02-17 02:28:10.086
102	13	https://picsum.photos/seed/134/200/150	{"foodName": "Bánh mì", "confidence": 0.9058376759898478}	0.9017584473100914	t	2026-02-14 11:02:55.835
103	13	https://picsum.photos/seed/135/200/150	{"foodName": "Lẩu Thái", "confidence": 0.9376632575927039}	0.8457335881850802	f	2026-01-13 20:56:19.761
104	13	https://picsum.photos/seed/136/200/150	{"foodName": "Bánh bèo", "confidence": 0.9605216133258547}	0.7902233613084285	f	2026-03-27 00:54:13.272
105	14	https://picsum.photos/seed/140/200/150	{"foodName": "Bánh canh", "confidence": 0.7941868929889957}	0.7817015913896819	t	2026-03-17 03:55:25.125
106	14	https://picsum.photos/seed/141/200/150	{"foodName": "Gỏi cuốn", "confidence": 0.740483691960543}	0.8293688070143301	t	2026-02-05 02:51:11.059
107	14	https://picsum.photos/seed/142/200/150	{"foodName": "Sữa chua", "confidence": 0.9117874699997169}	0.7630520844665183	t	2026-02-17 08:05:39.379
108	14	https://picsum.photos/seed/143/200/150	{"foodName": "Phở bò", "confidence": 0.7860960050051636}	0.94937668885779	f	2026-03-08 15:12:01.666
109	14	https://picsum.photos/seed/144/200/150	{"foodName": "Bánh ướt", "confidence": 0.7631228075980039}	0.9453858397463775	f	2026-03-20 01:41:04.735
110	15	https://picsum.photos/seed/150/200/150	{"foodName": "Cháo lòng", "confidence": 0.8356871394548597}	0.8329006448055967	f	2026-03-01 14:48:24.079
111	15	https://picsum.photos/seed/151/200/150	{"foodName": "Bún mắm", "confidence": 0.9186954397678438}	0.7586825508619546	f	2026-03-11 19:12:08.493
112	15	https://picsum.photos/seed/152/200/150	{"foodName": "Nem chua", "confidence": 0.9759037857680357}	0.8091402101326296	f	2026-01-29 20:53:12.191
113	15	https://picsum.photos/seed/153/200/150	{"foodName": "Trái cây dĩa", "confidence": 0.8064967433886484}	0.9453008132897586	t	2026-03-13 11:54:55.791
114	15	https://picsum.photos/seed/154/200/150	{"foodName": "Chả giò", "confidence": 0.8476877235342125}	0.9889635703683757	t	2026-03-20 09:47:17.644
115	15	https://picsum.photos/seed/155/200/150	{"foodName": "Nem chua", "confidence": 0.8262561670805989}	0.7105617525034367	t	2026-02-08 12:45:40
116	16	/uploads/1775721625687-365774650.jpg	{"meta": {"aiError": null, "candidateNames": ["Unknown", "pho bo"], "suggestedFoodIds": [1, 17, 6]}, "prediction": {"data": {"food_name": "Unknown", "confidence": 86.21}, "message": "AI không nhận diện được món ăn này", "success": false}}	86.21	t	2026-04-09 08:00:29.672
117	16	/uploads/1775721668853-440675842.webp	{"meta": {"aiError": null, "candidateNames": ["Banh mi", "banh mi"], "suggestedFoodIds": [4, 15, 22, 20, 9, 21, 11, 23]}, "prediction": {"data": {"food_name": "Banh mi", "confidence": 100}, "message": "Đây là món Banh mi với độ tự tin 100.0%", "success": true}}	100	t	2026-04-09 08:01:09.397
118	16	/uploads/1776650489607-927890287.jpg	{"meta": {"aiError": null, "candidateNames": ["Bun thit nuong", "bun cha"], "suggestedFoodIds": [2, 6, 16, 24, 25, 12]}, "prediction": {"data": {"food_name": "Bun thit nuong", "confidence": 93.07}, "message": "Đây là món Bun thit nuong với độ tự tin 93.07%", "success": true}}	93.07	t	2026-04-20 02:01:32.659
119	16	/uploads/1776650570460-138081662.jpg	{"meta": {"aiError": null, "candidateNames": ["Banh cuon", "banh uot"], "suggestedFoodIds": [22, 11, 15, 20, 9, 4, 21, 23]}, "prediction": {"data": {"food_name": "Banh cuon", "confidence": 99.49}, "message": "Đây là món Banh cuon với độ tự tin 99.49%", "success": true}}	99.49	t	2026-04-20 02:02:50.615
120	2	/uploads/1776739907334-996160761.webp	{"meta": {"aiError": null, "candidateNames": ["Banh mi", "banh mi trung", "mi quang", "mi xao bo", "mi trung ga", "mi tom rau bo", "banh mi ga nuong", "banh mi nguyen cam"], "suggestedFoodIds": [112, 111, 4, 36, 35, 13, 79, 118, 114, 113, 60, 97]}, "prediction": {"data": {"food_name": "Banh mi", "confidence": 99.98}, "message": "Đây là món Banh mi với độ tự tin 99.98%", "success": true}}	99.98	t	2026-04-21 02:51:51.783
121	2	/uploads/1778314959434-681235720.jpg	{"meta": {"aiError": "timeout of 30000ms exceeded", "candidateNames": ["hu tieu"], "suggestedFoodIds": [10, 55, 128, 68, 67, 85, 29, 19, 15, 17, 6, 7]}, "prediction": {"status": "fallback", "message": "timeout of 30000ms exceeded"}}	0	f	2026-05-09 08:23:22.806
122	2	/uploads/1778480513273-756407708.jpg	{"meta": {"aiError": null, "candidateNames": ["Xoi xeo", "xoi xeo"], "suggestedFoodIds": [8, 130, 120, 119, 9, 19, 15, 17, 6, 7, 22, 2]}, "prediction": {"data": {"food_name": "Xoi xeo", "confidence": 99.64}, "message": "Đây là món Xoi xeo với độ tự tin 99.64%", "success": true}}	99.64	t	2026-05-11 06:21:58.41
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, key, value, "group", "createdAt", "updatedAt") FROM stdin;
1	dark_mode	light	general	2026-04-08 07:45:26.736	2026-04-08 07:45:29.753
43	active_user:1	1778482543738	runtime	2026-04-09 07:04:51.52	2026-05-11 06:55:43.739
1485	active_user:16	1778482553730	runtime	2026-05-11 06:39:46.177	2026-05-11 06:55:53.73
812	hydration:2026-04-20:2	{"dateKey":"2026-04-20","totalMl":750,"logs":[{"amountMl":250,"loggedAt":"2026-04-20T08:30:43.816Z"},{"amountMl":250,"loggedAt":"2026-04-20T08:30:43.973Z"},{"amountMl":250,"loggedAt":"2026-04-20T08:30:44.142Z"}]}	hydration	2026-04-20 08:30:43.822	2026-04-20 08:30:44.146
4	ai_min_confidence		general	2026-04-08 07:50:57.048	2026-04-08 07:51:06.268
21	auto_approve_reviews	false	general	2026-04-08 07:51:31.336	2026-04-08 07:51:31.799
409	chatbot_training_examples	[{"id":"ex-1","question":"Toi dang giam can, bua sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an uc ga + dua leo + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-2","question":"Toi dang giam can, bua sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-3","question":"Toi dang giam can, bua sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca thu + bi do + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-4","question":"Toi dang giam can, bua sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an bo nac + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-5","question":"Toi dang giam can, bua sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-6","question":"Toi dang giam can, bua sang co tom nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an tom + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-7","question":"Toi dang giam can, bua sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-8","question":"Toi dang giam can, bua sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + dau do voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-9","question":"Toi dang giam can, bua sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-10","question":"Toi dang giam can, bua sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-11","question":"Toi dang giam can, bua sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca basa + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-12","question":"Toi dang giam can, bua sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua sang","protein"]},{"id":"ex-13","question":"Toi dang giam can, bua trua co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-14","question":"Toi dang giam can, bua trua co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-15","question":"Toi dang giam can, bua trua co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-16","question":"Toi dang giam can, bua trua co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-17","question":"Toi dang giam can, bua trua co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-18","question":"Toi dang giam can, bua trua co tom nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-19","question":"Toi dang giam can, bua trua co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-20","question":"Toi dang giam can, bua trua co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-21","question":"Toi dang giam can, bua trua co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-22","question":"Toi dang giam can, bua trua co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-23","question":"Toi dang giam can, bua trua co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-24","question":"Toi dang giam can, bua trua co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua trua","protein"]},{"id":"ex-25","question":"Toi dang giam can, bua toi co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an uc ga + bi do + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-26","question":"Toi dang giam can, bua toi co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca hoi + nam + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-27","question":"Toi dang giam can, bua toi co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca thu + rau tron + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-28","question":"Toi dang giam can, bua toi co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-29","question":"Toi dang giam can, bua toi co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an trung ga + dua leo + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-30","question":"Toi dang giam can, bua toi co tom nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an tom + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-31","question":"Toi dang giam can, bua toi co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an dau hu + dua leo + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-32","question":"Toi dang giam can, bua toi co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-33","question":"Toi dang giam can, bua toi co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-34","question":"Toi dang giam can, bua toi co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-35","question":"Toi dang giam can, bua toi co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca basa + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-36","question":"Toi dang giam can, bua toi co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua toi","protein"]},{"id":"ex-37","question":"Toi dang giam can, bua phu sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an uc ga + dua leo + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-38","question":"Toi dang giam can, bua phu sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an ca hoi + rau bina + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-39","question":"Toi dang giam can, bua phu sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an ca thu + bi do + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-40","question":"Toi dang giam can, bua phu sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an bo nac + rau muong + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-41","question":"Toi dang giam can, bua phu sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an trung ga + rau cai xanh + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-42","question":"Toi dang giam can, bua phu sang co tom nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an tom + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-43","question":"Toi dang giam can, bua phu sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an dau hu + rau cai xanh + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-44","question":"Toi dang giam can, bua phu sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-45","question":"Toi dang giam can, bua phu sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an sua Hy Lap + bi do + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-46","question":"Toi dang giam can, bua phu sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an thit lon nac + rau tron + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-47","question":"Toi dang giam can, bua phu sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an ca basa + rau bina + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-48","question":"Toi dang giam can, bua phu sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an dau nanh + rau muong + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-49","question":"Toi dang giam can, bua phu chieu co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an uc ga + bi do + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-50","question":"Toi dang giam can, bua phu chieu co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an ca hoi + nam + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-51","question":"Toi dang giam can, bua phu chieu co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an ca thu + rau tron + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-52","question":"Toi dang giam can, bua phu chieu co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an bo nac + rau cai xanh + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-53","question":"Toi dang giam can, bua phu chieu co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an trung ga + dua leo + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-54","question":"Toi dang giam can, bua phu chieu co tom nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an tom + rau tron + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-55","question":"Toi dang giam can, bua phu chieu co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an dau hu + dua leo + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-56","question":"Toi dang giam can, bua phu chieu co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an sua chua khong duong + nam + dau do voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-57","question":"Toi dang giam can, bua phu chieu co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an sua Hy Lap + rau tron + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-58","question":"Toi dang giam can, bua phu chieu co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an thit lon nac + ca rot + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-59","question":"Toi dang giam can, bua phu chieu co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an ca basa + nam + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-60","question":"Toi dang giam can, bua phu chieu co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam can, bua phu chieu (giua chieu) co the an dau nanh + rau cai xanh + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay.","tags":["giam can","bua phu chieu","protein"]},{"id":"ex-61","question":"Toi dang tang co, bua sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an uc ga + dua leo + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-62","question":"Toi dang tang co, bua sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-63","question":"Toi dang tang co, bua sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an ca thu + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-64","question":"Toi dang tang co, bua sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an bo nac + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-65","question":"Toi dang tang co, bua sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + dau do voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-66","question":"Toi dang tang co, bua sang co tom nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an tom + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-67","question":"Toi dang tang co, bua sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-68","question":"Toi dang tang co, bua sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-69","question":"Toi dang tang co, bua sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-70","question":"Toi dang tang co, bua sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-71","question":"Toi dang tang co, bua sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an ca basa + rau bina + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-72","question":"Toi dang tang co, bua sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu tang co, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua sang","protein"]},{"id":"ex-73","question":"Toi dang tang co, bua trua co uc ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-74","question":"Toi dang tang co, bua trua co ca hoi nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-75","question":"Toi dang tang co, bua trua co ca thu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-76","question":"Toi dang tang co, bua trua co bo nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-77","question":"Toi dang tang co, bua trua co trung ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-78","question":"Toi dang tang co, bua trua co tom nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-79","question":"Toi dang tang co, bua trua co dau hu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-80","question":"Toi dang tang co, bua trua co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-81","question":"Toi dang tang co, bua trua co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-82","question":"Toi dang tang co, bua trua co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-83","question":"Toi dang tang co, bua trua co ca basa nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-84","question":"Toi dang tang co, bua trua co dau nanh nen sap xep the nao?","answer":"Voi muc tieu tang co, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua trua","protein"]},{"id":"ex-85","question":"Toi dang tang co, bua toi co uc ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an uc ga + bi do + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-86","question":"Toi dang tang co, bua toi co ca hoi nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an ca hoi + nam + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-87","question":"Toi dang tang co, bua toi co ca thu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an ca thu + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-88","question":"Toi dang tang co, bua toi co bo nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-89","question":"Toi dang tang co, bua toi co trung ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an trung ga + dua leo + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-90","question":"Toi dang tang co, bua toi co tom nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an tom + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-91","question":"Toi dang tang co, bua toi co dau hu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an dau hu + dua leo + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-92","question":"Toi dang tang co, bua toi co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-93","question":"Toi dang tang co, bua toi co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-94","question":"Toi dang tang co, bua toi co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-95","question":"Toi dang tang co, bua toi co ca basa nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an ca basa + nam + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-96","question":"Toi dang tang co, bua toi co dau nanh nen sap xep the nao?","answer":"Voi muc tieu tang co, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua toi","protein"]},{"id":"ex-97","question":"Toi dang tang co, bua phu sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an uc ga + dua leo + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-98","question":"Toi dang tang co, bua phu sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an ca hoi + rau bina + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-99","question":"Toi dang tang co, bua phu sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an ca thu + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-100","question":"Toi dang tang co, bua phu sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an bo nac + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-101","question":"Toi dang tang co, bua phu sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an trung ga + rau cai xanh + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-102","question":"Toi dang tang co, bua phu sang co tom nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an tom + bi do + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-103","question":"Toi dang tang co, bua phu sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an dau hu + rau cai xanh + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-104","question":"Toi dang tang co, bua phu sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-105","question":"Toi dang tang co, bua phu sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an sua Hy Lap + bi do + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-106","question":"Toi dang tang co, bua phu sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an thit lon nac + rau tron + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-107","question":"Toi dang tang co, bua phu sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an ca basa + rau bina + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-108","question":"Toi dang tang co, bua phu sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu sang (giua sang) co the an dau nanh + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu sang","protein"]},{"id":"ex-109","question":"Toi dang tang co, bua phu chieu co uc ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an uc ga + bi do + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-110","question":"Toi dang tang co, bua phu chieu co ca hoi nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an ca hoi + nam + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-111","question":"Toi dang tang co, bua phu chieu co ca thu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an ca thu + rau tron + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-112","question":"Toi dang tang co, bua phu chieu co bo nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-113","question":"Toi dang tang co, bua phu chieu co trung ga nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an trung ga + dua leo + dau do voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-114","question":"Toi dang tang co, bua phu chieu co tom nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an tom + rau tron + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-115","question":"Toi dang tang co, bua phu chieu co dau hu nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an dau hu + dua leo + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-116","question":"Toi dang tang co, bua phu chieu co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-117","question":"Toi dang tang co, bua phu chieu co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an sua Hy Lap + rau tron + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-118","question":"Toi dang tang co, bua phu chieu co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an thit lon nac + ca rot + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-119","question":"Toi dang tang co, bua phu chieu co ca basa nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an ca basa + nam + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-120","question":"Toi dang tang co, bua phu chieu co dau nanh nen sap xep the nao?","answer":"Voi muc tieu tang co, bua phu chieu (giua chieu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can du protein 1.6-2.2g/kg/ngay va chia deu 3-4 bua va bo sung carb hop ly quanh buoi tap de phuc hoi glycogen.","tags":["tang co","bua phu chieu","protein"]},{"id":"ex-121","question":"Toi dang duy tri can nang, bua sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an uc ga + dua leo + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-122","question":"Toi dang duy tri can nang, bua sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-123","question":"Toi dang duy tri can nang, bua sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an ca thu + bi do + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-124","question":"Toi dang duy tri can nang, bua sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an bo nac + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-125","question":"Toi dang duy tri can nang, bua sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-126","question":"Toi dang duy tri can nang, bua sang co tom nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an tom + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-127","question":"Toi dang duy tri can nang, bua sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-128","question":"Toi dang duy tri can nang, bua sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + dau do voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-129","question":"Toi dang duy tri can nang, bua sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-130","question":"Toi dang duy tri can nang, bua sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-131","question":"Toi dang duy tri can nang, bua sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an ca basa + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-132","question":"Toi dang duy tri can nang, bua sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua sang","protein"]},{"id":"ex-133","question":"Toi dang duy tri can nang, bua trua co uc ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-134","question":"Toi dang duy tri can nang, bua trua co ca hoi nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-135","question":"Toi dang duy tri can nang, bua trua co ca thu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-136","question":"Toi dang duy tri can nang, bua trua co bo nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-137","question":"Toi dang duy tri can nang, bua trua co trung ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-138","question":"Toi dang duy tri can nang, bua trua co tom nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-139","question":"Toi dang duy tri can nang, bua trua co dau hu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-140","question":"Toi dang duy tri can nang, bua trua co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-141","question":"Toi dang duy tri can nang, bua trua co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-142","question":"Toi dang duy tri can nang, bua trua co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-143","question":"Toi dang duy tri can nang, bua trua co ca basa nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-144","question":"Toi dang duy tri can nang, bua trua co dau nanh nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua trua","protein"]},{"id":"ex-145","question":"Toi dang duy tri can nang, bua toi co uc ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an uc ga + bi do + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-146","question":"Toi dang duy tri can nang, bua toi co ca hoi nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an ca hoi + nam + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-147","question":"Toi dang duy tri can nang, bua toi co ca thu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an ca thu + rau tron + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-148","question":"Toi dang duy tri can nang, bua toi co bo nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-149","question":"Toi dang duy tri can nang, bua toi co trung ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an trung ga + dua leo + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-150","question":"Toi dang duy tri can nang, bua toi co tom nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an tom + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-151","question":"Toi dang duy tri can nang, bua toi co dau hu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an dau hu + dua leo + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-152","question":"Toi dang duy tri can nang, bua toi co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-153","question":"Toi dang duy tri can nang, bua toi co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-154","question":"Toi dang duy tri can nang, bua toi co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-155","question":"Toi dang duy tri can nang, bua toi co ca basa nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an ca basa + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-156","question":"Toi dang duy tri can nang, bua toi co dau nanh nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua toi","protein"]},{"id":"ex-157","question":"Toi dang duy tri can nang, bua phu sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an uc ga + dua leo + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-158","question":"Toi dang duy tri can nang, bua phu sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an ca hoi + rau bina + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-159","question":"Toi dang duy tri can nang, bua phu sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an ca thu + bi do + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-160","question":"Toi dang duy tri can nang, bua phu sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an bo nac + rau muong + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-161","question":"Toi dang duy tri can nang, bua phu sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an trung ga + rau cai xanh + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-162","question":"Toi dang duy tri can nang, bua phu sang co tom nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an tom + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-163","question":"Toi dang duy tri can nang, bua phu sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an dau hu + rau cai xanh + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-164","question":"Toi dang duy tri can nang, bua phu sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-165","question":"Toi dang duy tri can nang, bua phu sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an sua Hy Lap + bi do + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-166","question":"Toi dang duy tri can nang, bua phu sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an thit lon nac + rau tron + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-167","question":"Toi dang duy tri can nang, bua phu sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an ca basa + rau bina + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-168","question":"Toi dang duy tri can nang, bua phu sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu sang (giua sang) co the an dau nanh + rau muong + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu sang","protein"]},{"id":"ex-169","question":"Toi dang duy tri can nang, bua phu chieu co uc ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an uc ga + bi do + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-170","question":"Toi dang duy tri can nang, bua phu chieu co ca hoi nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an ca hoi + nam + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-171","question":"Toi dang duy tri can nang, bua phu chieu co ca thu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an ca thu + rau tron + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-172","question":"Toi dang duy tri can nang, bua phu chieu co bo nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an bo nac + rau cai xanh + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-173","question":"Toi dang duy tri can nang, bua phu chieu co trung ga nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an trung ga + dua leo + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-174","question":"Toi dang duy tri can nang, bua phu chieu co tom nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an tom + rau tron + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-175","question":"Toi dang duy tri can nang, bua phu chieu co dau hu nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an dau hu + dua leo + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-176","question":"Toi dang duy tri can nang, bua phu chieu co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an sua chua khong duong + nam + dau do voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-177","question":"Toi dang duy tri can nang, bua phu chieu co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an sua Hy Lap + rau tron + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-178","question":"Toi dang duy tri can nang, bua phu chieu co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an thit lon nac + ca rot + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-179","question":"Toi dang duy tri can nang, bua phu chieu co ca basa nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an ca basa + nam + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-180","question":"Toi dang duy tri can nang, bua phu chieu co dau nanh nen sap xep the nao?","answer":"Voi muc tieu duy tri can nang, bua phu chieu (giua chieu) co the an dau nanh + rau cai xanh + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can giu tong nang luong can bang va uu tien thuc pham it che bien va giu khau phan on dinh, tranh an qua sat gio ngu.","tags":["duy tri can nang","bua phu chieu","protein"]},{"id":"ex-181","question":"Toi dang giam mo, bua sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an uc ga + dua leo + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-182","question":"Toi dang giam mo, bua sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-183","question":"Toi dang giam mo, bua sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an ca thu + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-184","question":"Toi dang giam mo, bua sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an bo nac + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-185","question":"Toi dang giam mo, bua sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + dau do voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-186","question":"Toi dang giam mo, bua sang co tom nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an tom + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-187","question":"Toi dang giam mo, bua sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-188","question":"Toi dang giam mo, bua sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-189","question":"Toi dang giam mo, bua sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-190","question":"Toi dang giam mo, bua sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-191","question":"Toi dang giam mo, bua sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an ca basa + rau bina + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-192","question":"Toi dang giam mo, bua sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua sang","protein"]},{"id":"ex-193","question":"Toi dang giam mo, bua trua co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-194","question":"Toi dang giam mo, bua trua co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-195","question":"Toi dang giam mo, bua trua co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-196","question":"Toi dang giam mo, bua trua co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-197","question":"Toi dang giam mo, bua trua co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-198","question":"Toi dang giam mo, bua trua co tom nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-199","question":"Toi dang giam mo, bua trua co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-200","question":"Toi dang giam mo, bua trua co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-201","question":"Toi dang giam mo, bua trua co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-202","question":"Toi dang giam mo, bua trua co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-203","question":"Toi dang giam mo, bua trua co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-204","question":"Toi dang giam mo, bua trua co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua trua","protein"]},{"id":"ex-205","question":"Toi dang giam mo, bua toi co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an uc ga + bi do + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-206","question":"Toi dang giam mo, bua toi co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an ca hoi + nam + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-207","question":"Toi dang giam mo, bua toi co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an ca thu + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-208","question":"Toi dang giam mo, bua toi co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-209","question":"Toi dang giam mo, bua toi co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an trung ga + dua leo + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-210","question":"Toi dang giam mo, bua toi co tom nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an tom + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-211","question":"Toi dang giam mo, bua toi co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an dau hu + dua leo + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-212","question":"Toi dang giam mo, bua toi co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-213","question":"Toi dang giam mo, bua toi co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-214","question":"Toi dang giam mo, bua toi co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-215","question":"Toi dang giam mo, bua toi co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an ca basa + nam + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-216","question":"Toi dang giam mo, bua toi co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua toi","protein"]},{"id":"ex-217","question":"Toi dang giam mo, bua phu sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an uc ga + dua leo + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-218","question":"Toi dang giam mo, bua phu sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an ca hoi + rau bina + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-219","question":"Toi dang giam mo, bua phu sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an ca thu + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-220","question":"Toi dang giam mo, bua phu sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an bo nac + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-221","question":"Toi dang giam mo, bua phu sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an trung ga + rau cai xanh + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-222","question":"Toi dang giam mo, bua phu sang co tom nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an tom + bi do + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-223","question":"Toi dang giam mo, bua phu sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an dau hu + rau cai xanh + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-224","question":"Toi dang giam mo, bua phu sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-225","question":"Toi dang giam mo, bua phu sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an sua Hy Lap + bi do + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-226","question":"Toi dang giam mo, bua phu sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an thit lon nac + rau tron + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-227","question":"Toi dang giam mo, bua phu sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an ca basa + rau bina + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-228","question":"Toi dang giam mo, bua phu sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu sang (giua sang) co the an dau nanh + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu sang","protein"]},{"id":"ex-229","question":"Toi dang giam mo, bua phu chieu co uc ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an uc ga + bi do + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-230","question":"Toi dang giam mo, bua phu chieu co ca hoi nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an ca hoi + nam + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-231","question":"Toi dang giam mo, bua phu chieu co ca thu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an ca thu + rau tron + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-232","question":"Toi dang giam mo, bua phu chieu co bo nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-233","question":"Toi dang giam mo, bua phu chieu co trung ga nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an trung ga + dua leo + dau do voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-234","question":"Toi dang giam mo, bua phu chieu co tom nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an tom + rau tron + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-235","question":"Toi dang giam mo, bua phu chieu co dau hu nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an dau hu + dua leo + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-236","question":"Toi dang giam mo, bua phu chieu co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-237","question":"Toi dang giam mo, bua phu chieu co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an sua Hy Lap + rau tron + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-238","question":"Toi dang giam mo, bua phu chieu co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an thit lon nac + ca rot + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-239","question":"Toi dang giam mo, bua phu chieu co ca basa nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an ca basa + nam + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-240","question":"Toi dang giam mo, bua phu chieu co dau nanh nen sap xep the nao?","answer":"Voi muc tieu giam mo, bua phu chieu (giua chieu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can duy tri tham hut nhe, tap suc manh va ngu du giac va giu chat luong carb cao, tang chat xo va giam do ngot.","tags":["giam mo","bua phu chieu","protein"]},{"id":"ex-241","question":"Toi dang on dinh duong huyet, bua sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an uc ga + dua leo + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-242","question":"Toi dang on dinh duong huyet, bua sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-243","question":"Toi dang on dinh duong huyet, bua sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an ca thu + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-244","question":"Toi dang on dinh duong huyet, bua sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an bo nac + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-245","question":"Toi dang on dinh duong huyet, bua sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + dau do voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-246","question":"Toi dang on dinh duong huyet, bua sang co tom nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an tom + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-247","question":"Toi dang on dinh duong huyet, bua sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-248","question":"Toi dang on dinh duong huyet, bua sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-249","question":"Toi dang on dinh duong huyet, bua sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-250","question":"Toi dang on dinh duong huyet, bua sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-251","question":"Toi dang on dinh duong huyet, bua sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an ca basa + rau bina + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-252","question":"Toi dang on dinh duong huyet, bua sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua sang","protein"]},{"id":"ex-253","question":"Toi dang on dinh duong huyet, bua trua co uc ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-254","question":"Toi dang on dinh duong huyet, bua trua co ca hoi nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-255","question":"Toi dang on dinh duong huyet, bua trua co ca thu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-256","question":"Toi dang on dinh duong huyet, bua trua co bo nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-257","question":"Toi dang on dinh duong huyet, bua trua co trung ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-258","question":"Toi dang on dinh duong huyet, bua trua co tom nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-259","question":"Toi dang on dinh duong huyet, bua trua co dau hu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-260","question":"Toi dang on dinh duong huyet, bua trua co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-261","question":"Toi dang on dinh duong huyet, bua trua co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-262","question":"Toi dang on dinh duong huyet, bua trua co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-263","question":"Toi dang on dinh duong huyet, bua trua co ca basa nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-264","question":"Toi dang on dinh duong huyet, bua trua co dau nanh nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua trua","protein"]},{"id":"ex-265","question":"Toi dang on dinh duong huyet, bua toi co uc ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an uc ga + bi do + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-266","question":"Toi dang on dinh duong huyet, bua toi co ca hoi nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an ca hoi + nam + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-267","question":"Toi dang on dinh duong huyet, bua toi co ca thu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an ca thu + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-268","question":"Toi dang on dinh duong huyet, bua toi co bo nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-269","question":"Toi dang on dinh duong huyet, bua toi co trung ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an trung ga + dua leo + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-270","question":"Toi dang on dinh duong huyet, bua toi co tom nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an tom + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-271","question":"Toi dang on dinh duong huyet, bua toi co dau hu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an dau hu + dua leo + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-272","question":"Toi dang on dinh duong huyet, bua toi co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-273","question":"Toi dang on dinh duong huyet, bua toi co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-274","question":"Toi dang on dinh duong huyet, bua toi co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-275","question":"Toi dang on dinh duong huyet, bua toi co ca basa nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an ca basa + nam + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-276","question":"Toi dang on dinh duong huyet, bua toi co dau nanh nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua toi","protein"]},{"id":"ex-277","question":"Toi dang on dinh duong huyet, bua phu sang co uc ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an uc ga + dua leo + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-278","question":"Toi dang on dinh duong huyet, bua phu sang co ca hoi nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an ca hoi + rau bina + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-279","question":"Toi dang on dinh duong huyet, bua phu sang co ca thu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an ca thu + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-280","question":"Toi dang on dinh duong huyet, bua phu sang co bo nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an bo nac + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-281","question":"Toi dang on dinh duong huyet, bua phu sang co trung ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an trung ga + rau cai xanh + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-282","question":"Toi dang on dinh duong huyet, bua phu sang co tom nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an tom + bi do + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-283","question":"Toi dang on dinh duong huyet, bua phu sang co dau hu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an dau hu + rau cai xanh + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-284","question":"Toi dang on dinh duong huyet, bua phu sang co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-285","question":"Toi dang on dinh duong huyet, bua phu sang co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an sua Hy Lap + bi do + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-286","question":"Toi dang on dinh duong huyet, bua phu sang co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an thit lon nac + rau tron + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-287","question":"Toi dang on dinh duong huyet, bua phu sang co ca basa nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an ca basa + rau bina + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-288","question":"Toi dang on dinh duong huyet, bua phu sang co dau nanh nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu sang (giua sang) co the an dau nanh + rau muong + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu sang","protein"]},{"id":"ex-289","question":"Toi dang on dinh duong huyet, bua phu chieu co uc ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an uc ga + bi do + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-290","question":"Toi dang on dinh duong huyet, bua phu chieu co ca hoi nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an ca hoi + nam + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-291","question":"Toi dang on dinh duong huyet, bua phu chieu co ca thu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an ca thu + rau tron + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-292","question":"Toi dang on dinh duong huyet, bua phu chieu co bo nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an bo nac + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-293","question":"Toi dang on dinh duong huyet, bua phu chieu co trung ga nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an trung ga + dua leo + dau do voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-294","question":"Toi dang on dinh duong huyet, bua phu chieu co tom nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an tom + rau tron + com gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-295","question":"Toi dang on dinh duong huyet, bua phu chieu co dau hu nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an dau hu + dua leo + khoai lang voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-296","question":"Toi dang on dinh duong huyet, bua phu chieu co sua chua khong duong nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an sua chua khong duong + nam + banh mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-297","question":"Toi dang on dinh duong huyet, bua phu chieu co sua Hy Lap nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an sua Hy Lap + rau tron + yach mach voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-298","question":"Toi dang on dinh duong huyet, bua phu chieu co thit lon nac nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an thit lon nac + ca rot + bun gao lut voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-299","question":"Toi dang on dinh duong huyet, bua phu chieu co ca basa nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an ca basa + nam + mi nguyen cam voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-300","question":"Toi dang on dinh duong huyet, bua phu chieu co dau nanh nen sap xep the nao?","answer":"Voi muc tieu on dinh duong huyet, bua phu chieu (giua chieu) co the an dau nanh + rau cai xanh + ngo luoc voi khau phan nho gon, tranh tang duong huyet dot ngot. Ban can chia bua deu, uu tien nguon carb hap thu cham va dam nac va han che do uong co duong va mon tinh bot tinh che.","tags":["on dinh duong huyet","bua phu chieu","protein"]},{"id":"ex-301","question":"Toi co cao huyet ap, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi com gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-302","question":"Toi co cao huyet ap, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi khoai lang can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-303","question":"Toi co cao huyet ap, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi banh mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-304","question":"Toi co cao huyet ap, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi yach mach can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-305","question":"Toi co cao huyet ap, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi bun gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop trung ga + rau xanh + mot it bo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-306","question":"Toi co cao huyet ap, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop tom + rau xanh + mot it hat oc cho; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-307","question":"Toi co cao huyet ap, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi ngo luoc can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau hu + rau xanh + mot it hat hanh nhan; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-308","question":"Toi co cao huyet ap, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua sang voi dau do can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat chia; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua sang","benh nen"]},{"id":"ex-309","question":"Toi co cao huyet ap, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi com gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-310","question":"Toi co cao huyet ap, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi khoai lang can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-311","question":"Toi co cao huyet ap, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi banh mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-312","question":"Toi co cao huyet ap, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi yach mach can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-313","question":"Toi co cao huyet ap, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi bun gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-314","question":"Toi co cao huyet ap, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-315","question":"Toi co cao huyet ap, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi ngo luoc can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-316","question":"Toi co cao huyet ap, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua trua voi dau do can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua trua","benh nen"]},{"id":"ex-317","question":"Toi co cao huyet ap, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi com gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-318","question":"Toi co cao huyet ap, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi khoai lang can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-319","question":"Toi co cao huyet ap, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi banh mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-320","question":"Toi co cao huyet ap, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi yach mach can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-321","question":"Toi co cao huyet ap, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi bun gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-322","question":"Toi co cao huyet ap, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-323","question":"Toi co cao huyet ap, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi ngo luoc can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-324","question":"Toi co cao huyet ap, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua toi voi dau do can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua toi","benh nen"]},{"id":"ex-325","question":"Toi co cao huyet ap, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi com gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-326","question":"Toi co cao huyet ap, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi khoai lang can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-327","question":"Toi co cao huyet ap, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi banh mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-328","question":"Toi co cao huyet ap, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi yach mach can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-329","question":"Toi co cao huyet ap, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi bun gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop trung ga + rau xanh + mot it hat lanh; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-330","question":"Toi co cao huyet ap, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop tom + rau xanh + mot it dau oliu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-331","question":"Toi co cao huyet ap, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi ngo luoc can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau hu + rau xanh + mot it hat dieu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-332","question":"Toi co cao huyet ap, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu sang voi dau do can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua chua khong duong + rau xanh + mot it ca beo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu sang","benh nen"]},{"id":"ex-333","question":"Toi co cao huyet ap, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi com gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat oc cho; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-334","question":"Toi co cao huyet ap, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi khoai lang can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop thit lon nac + rau xanh + mot it hat hanh nhan; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-335","question":"Toi co cao huyet ap, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi banh mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca basa + rau xanh + mot it hat chia; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-336","question":"Toi co cao huyet ap, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi yach mach can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop dau nanh + rau xanh + mot it hat lanh; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-337","question":"Toi co cao huyet ap, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi bun gao lut can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop uc ga + rau xanh + mot it dau oliu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-338","question":"Toi co cao huyet ap, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi mi nguyen cam can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca hoi + rau xanh + mot it hat dieu; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-339","question":"Toi co cao huyet ap, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi ngo luoc can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop ca thu + rau xanh + mot it ca beo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-340","question":"Toi co cao huyet ap, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co cao huyet ap, bua phu chieu voi dau do can theo huong giam muoi duoi 5g/ngay va tranh thuc pham dong hop. Ban co the ket hop bo nac + rau xanh + mot it bo; dong thoi tang rau xanh, kali tu trai cay va theo doi huyet ap dinh ky.","tags":["cao huyet ap","bua phu chieu","benh nen"]},{"id":"ex-341","question":"Toi co tieu duong type 2, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi com gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop thit lon nac + rau xanh + mot it hat lanh; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-342","question":"Toi co tieu duong type 2, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi khoai lang can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca basa + rau xanh + mot it dau oliu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-343","question":"Toi co tieu duong type 2, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi banh mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau nanh + rau xanh + mot it hat dieu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-344","question":"Toi co tieu duong type 2, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi yach mach can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop uc ga + rau xanh + mot it ca beo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-345","question":"Toi co tieu duong type 2, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi bun gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca hoi + rau xanh + mot it bo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-346","question":"Toi co tieu duong type 2, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca thu + rau xanh + mot it hat oc cho; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-347","question":"Toi co tieu duong type 2, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi ngo luoc can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop bo nac + rau xanh + mot it hat hanh nhan; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-348","question":"Toi co tieu duong type 2, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua sang voi dau do can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua sang","benh nen"]},{"id":"ex-349","question":"Toi co tieu duong type 2, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi com gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-350","question":"Toi co tieu duong type 2, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi khoai lang can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-351","question":"Toi co tieu duong type 2, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi banh mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-352","question":"Toi co tieu duong type 2, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi yach mach can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-353","question":"Toi co tieu duong type 2, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi bun gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-354","question":"Toi co tieu duong type 2, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-355","question":"Toi co tieu duong type 2, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi ngo luoc can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-356","question":"Toi co tieu duong type 2, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua trua voi dau do can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua trua","benh nen"]},{"id":"ex-357","question":"Toi co tieu duong type 2, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi com gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca hoi + rau xanh + mot it hat chia; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-358","question":"Toi co tieu duong type 2, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi khoai lang can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca thu + rau xanh + mot it hat lanh; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-359","question":"Toi co tieu duong type 2, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi banh mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop bo nac + rau xanh + mot it dau oliu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-360","question":"Toi co tieu duong type 2, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi yach mach can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop trung ga + rau xanh + mot it hat dieu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-361","question":"Toi co tieu duong type 2, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi bun gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop tom + rau xanh + mot it ca beo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-362","question":"Toi co tieu duong type 2, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau hu + rau xanh + mot it bo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-363","question":"Toi co tieu duong type 2, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi ngo luoc can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat oc cho; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-364","question":"Toi co tieu duong type 2, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua toi voi dau do can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat hanh nhan; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua toi","benh nen"]},{"id":"ex-365","question":"Toi co tieu duong type 2, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi com gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-366","question":"Toi co tieu duong type 2, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi khoai lang can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-367","question":"Toi co tieu duong type 2, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi banh mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-368","question":"Toi co tieu duong type 2, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi yach mach can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-369","question":"Toi co tieu duong type 2, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi bun gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca hoi + rau xanh + mot it hat lanh; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-370","question":"Toi co tieu duong type 2, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca thu + rau xanh + mot it dau oliu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-371","question":"Toi co tieu duong type 2, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi ngo luoc can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop bo nac + rau xanh + mot it hat dieu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-372","question":"Toi co tieu duong type 2, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu sang voi dau do can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop trung ga + rau xanh + mot it ca beo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu sang","benh nen"]},{"id":"ex-373","question":"Toi co tieu duong type 2, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi com gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop tom + rau xanh + mot it hat oc cho; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-374","question":"Toi co tieu duong type 2, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi khoai lang can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau hu + rau xanh + mot it hat hanh nhan; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-375","question":"Toi co tieu duong type 2, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi banh mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat chia; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-376","question":"Toi co tieu duong type 2, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi yach mach can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-377","question":"Toi co tieu duong type 2, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi bun gao lut can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-378","question":"Toi co tieu duong type 2, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi mi nguyen cam can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-379","question":"Toi co tieu duong type 2, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi ngo luoc can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-380","question":"Toi co tieu duong type 2, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co tieu duong type 2, bua phu chieu voi dau do can theo huong han che nuoc ngot va tinh bot tinh che. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi chia khau phan nho, uu tien carb hap thu cham va theo doi duong huyet.","tags":["tieu duong type 2","bua phu chieu","benh nen"]},{"id":"ex-381","question":"Toi co mo mau cao, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi com gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau hu + rau xanh + mot it hat lanh; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-382","question":"Toi co mo mau cao, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi khoai lang can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua chua khong duong + rau xanh + mot it dau oliu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-383","question":"Toi co mo mau cao, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi banh mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat dieu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-384","question":"Toi co mo mau cao, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi yach mach can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop thit lon nac + rau xanh + mot it ca beo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-385","question":"Toi co mo mau cao, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi bun gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca basa + rau xanh + mot it bo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-386","question":"Toi co mo mau cao, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau nanh + rau xanh + mot it hat oc cho; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-387","question":"Toi co mo mau cao, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi ngo luoc can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop uc ga + rau xanh + mot it hat hanh nhan; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-388","question":"Toi co mo mau cao, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua sang voi dau do can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca hoi + rau xanh + mot it hat chia; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua sang","benh nen"]},{"id":"ex-389","question":"Toi co mo mau cao, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi com gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca thu + rau xanh + mot it hat lanh; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-390","question":"Toi co mo mau cao, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi khoai lang can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop bo nac + rau xanh + mot it dau oliu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-391","question":"Toi co mo mau cao, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi banh mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop trung ga + rau xanh + mot it hat dieu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-392","question":"Toi co mo mau cao, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi yach mach can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop tom + rau xanh + mot it ca beo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-393","question":"Toi co mo mau cao, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi bun gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau hu + rau xanh + mot it bo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-394","question":"Toi co mo mau cao, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat oc cho; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-395","question":"Toi co mo mau cao, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi ngo luoc can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat hanh nhan; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-396","question":"Toi co mo mau cao, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua trua voi dau do can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop thit lon nac + rau xanh + mot it hat chia; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua trua","benh nen"]},{"id":"ex-397","question":"Toi co mo mau cao, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi com gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca basa + rau xanh + mot it hat chia; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-398","question":"Toi co mo mau cao, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi khoai lang can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau nanh + rau xanh + mot it hat lanh; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-399","question":"Toi co mo mau cao, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi banh mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop uc ga + rau xanh + mot it dau oliu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-400","question":"Toi co mo mau cao, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi yach mach can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca hoi + rau xanh + mot it hat dieu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-401","question":"Toi co mo mau cao, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi bun gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca thu + rau xanh + mot it ca beo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-402","question":"Toi co mo mau cao, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop bo nac + rau xanh + mot it bo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-403","question":"Toi co mo mau cao, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi ngo luoc can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop trung ga + rau xanh + mot it hat oc cho; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-404","question":"Toi co mo mau cao, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua toi voi dau do can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop tom + rau xanh + mot it hat hanh nhan; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua toi","benh nen"]},{"id":"ex-405","question":"Toi co mo mau cao, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi com gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau hu + rau xanh + mot it bo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-406","question":"Toi co mo mau cao, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi khoai lang can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat oc cho; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-407","question":"Toi co mo mau cao, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi banh mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat hanh nhan; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-408","question":"Toi co mo mau cao, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi yach mach can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop thit lon nac + rau xanh + mot it hat chia; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-409","question":"Toi co mo mau cao, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi bun gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca basa + rau xanh + mot it hat lanh; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-410","question":"Toi co mo mau cao, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau nanh + rau xanh + mot it dau oliu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-411","question":"Toi co mo mau cao, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi ngo luoc can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop uc ga + rau xanh + mot it hat dieu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-412","question":"Toi co mo mau cao, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu sang voi dau do can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca hoi + rau xanh + mot it ca beo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu sang","benh nen"]},{"id":"ex-413","question":"Toi co mo mau cao, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi com gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop ca thu + rau xanh + mot it hat oc cho; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-414","question":"Toi co mo mau cao, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi khoai lang can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop bo nac + rau xanh + mot it hat hanh nhan; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-415","question":"Toi co mo mau cao, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi banh mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-416","question":"Toi co mo mau cao, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi yach mach can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-417","question":"Toi co mo mau cao, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi bun gao lut can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-418","question":"Toi co mo mau cao, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi mi nguyen cam can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-419","question":"Toi co mo mau cao, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi ngo luoc can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-420","question":"Toi co mo mau cao, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co mo mau cao, bua phu chieu voi dau do can theo huong giam mo dong vat, noi tang va do chien ngap dau. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi uu tien ca, dau hat va chat xo hoa tan.","tags":["mo mau cao","bua phu chieu","benh nen"]},{"id":"ex-421","question":"Toi co gan nhiem mo, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi com gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-422","question":"Toi co gan nhiem mo, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi khoai lang can theo huong giam duong don va ruou bia. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-423","question":"Toi co gan nhiem mo, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi banh mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-424","question":"Toi co gan nhiem mo, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi yach mach can theo huong giam duong don va ruou bia. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-425","question":"Toi co gan nhiem mo, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi bun gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop trung ga + rau xanh + mot it bo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-426","question":"Toi co gan nhiem mo, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop tom + rau xanh + mot it hat oc cho; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-427","question":"Toi co gan nhiem mo, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi ngo luoc can theo huong giam duong don va ruou bia. Ban co the ket hop dau hu + rau xanh + mot it hat hanh nhan; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-428","question":"Toi co gan nhiem mo, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua sang voi dau do can theo huong giam duong don va ruou bia. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat chia; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua sang","benh nen"]},{"id":"ex-429","question":"Toi co gan nhiem mo, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi com gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-430","question":"Toi co gan nhiem mo, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi khoai lang can theo huong giam duong don va ruou bia. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-431","question":"Toi co gan nhiem mo, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi banh mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-432","question":"Toi co gan nhiem mo, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi yach mach can theo huong giam duong don va ruou bia. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-433","question":"Toi co gan nhiem mo, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi bun gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-434","question":"Toi co gan nhiem mo, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-435","question":"Toi co gan nhiem mo, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi ngo luoc can theo huong giam duong don va ruou bia. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-436","question":"Toi co gan nhiem mo, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua trua voi dau do can theo huong giam duong don va ruou bia. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua trua","benh nen"]},{"id":"ex-437","question":"Toi co gan nhiem mo, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi com gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-438","question":"Toi co gan nhiem mo, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi khoai lang can theo huong giam duong don va ruou bia. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-439","question":"Toi co gan nhiem mo, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi banh mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-440","question":"Toi co gan nhiem mo, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi yach mach can theo huong giam duong don va ruou bia. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-441","question":"Toi co gan nhiem mo, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi bun gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-442","question":"Toi co gan nhiem mo, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-443","question":"Toi co gan nhiem mo, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi ngo luoc can theo huong giam duong don va ruou bia. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-444","question":"Toi co gan nhiem mo, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua toi voi dau do can theo huong giam duong don va ruou bia. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua toi","benh nen"]},{"id":"ex-445","question":"Toi co gan nhiem mo, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi com gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-446","question":"Toi co gan nhiem mo, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi khoai lang can theo huong giam duong don va ruou bia. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-447","question":"Toi co gan nhiem mo, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi banh mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-448","question":"Toi co gan nhiem mo, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi yach mach can theo huong giam duong don va ruou bia. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-449","question":"Toi co gan nhiem mo, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi bun gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop trung ga + rau xanh + mot it hat lanh; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-450","question":"Toi co gan nhiem mo, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop tom + rau xanh + mot it dau oliu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-451","question":"Toi co gan nhiem mo, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi ngo luoc can theo huong giam duong don va ruou bia. Ban co the ket hop dau hu + rau xanh + mot it hat dieu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-452","question":"Toi co gan nhiem mo, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu sang voi dau do can theo huong giam duong don va ruou bia. Ban co the ket hop sua chua khong duong + rau xanh + mot it ca beo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu sang","benh nen"]},{"id":"ex-453","question":"Toi co gan nhiem mo, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi com gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat oc cho; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-454","question":"Toi co gan nhiem mo, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi khoai lang can theo huong giam duong don va ruou bia. Ban co the ket hop thit lon nac + rau xanh + mot it hat hanh nhan; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-455","question":"Toi co gan nhiem mo, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi banh mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca basa + rau xanh + mot it hat chia; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-456","question":"Toi co gan nhiem mo, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi yach mach can theo huong giam duong don va ruou bia. Ban co the ket hop dau nanh + rau xanh + mot it hat lanh; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-457","question":"Toi co gan nhiem mo, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi bun gao lut can theo huong giam duong don va ruou bia. Ban co the ket hop uc ga + rau xanh + mot it dau oliu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-458","question":"Toi co gan nhiem mo, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi mi nguyen cam can theo huong giam duong don va ruou bia. Ban co the ket hop ca hoi + rau xanh + mot it hat dieu; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-459","question":"Toi co gan nhiem mo, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi ngo luoc can theo huong giam duong don va ruou bia. Ban co the ket hop ca thu + rau xanh + mot it ca beo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-460","question":"Toi co gan nhiem mo, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co gan nhiem mo, bua phu chieu voi dau do can theo huong giam duong don va ruou bia. Ban co the ket hop bo nac + rau xanh + mot it bo; dong thoi kiem soat can nang, uu tien dam nac va rau xanh.","tags":["gan nhiem mo","bua phu chieu","benh nen"]},{"id":"ex-461","question":"Toi co gout, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi com gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-462","question":"Toi co gout, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi khoai lang can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-463","question":"Toi co gout, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi banh mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-464","question":"Toi co gout, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi yach mach can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-465","question":"Toi co gout, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi bun gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-466","question":"Toi co gout, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-467","question":"Toi co gout, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi ngo luoc can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-468","question":"Toi co gout, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co gout, bua sang voi dau do can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua sang","benh nen"]},{"id":"ex-469","question":"Toi co gout, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi com gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop trung ga + rau xanh + mot it hat lanh; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-470","question":"Toi co gout, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi khoai lang can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop tom + rau xanh + mot it dau oliu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-471","question":"Toi co gout, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi banh mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau hu + rau xanh + mot it hat dieu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-472","question":"Toi co gout, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi yach mach can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua chua khong duong + rau xanh + mot it ca beo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-473","question":"Toi co gout, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi bun gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua Hy Lap + rau xanh + mot it bo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-474","question":"Toi co gout, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-475","question":"Toi co gout, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi ngo luoc can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-476","question":"Toi co gout, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co gout, bua trua voi dau do can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua trua","benh nen"]},{"id":"ex-477","question":"Toi co gout, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi com gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-478","question":"Toi co gout, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi khoai lang can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca hoi + rau xanh + mot it hat lanh; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-479","question":"Toi co gout, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi banh mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca thu + rau xanh + mot it dau oliu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-480","question":"Toi co gout, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi yach mach can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop bo nac + rau xanh + mot it hat dieu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-481","question":"Toi co gout, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi bun gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop trung ga + rau xanh + mot it ca beo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-482","question":"Toi co gout, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop tom + rau xanh + mot it bo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-483","question":"Toi co gout, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi ngo luoc can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau hu + rau xanh + mot it hat oc cho; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-484","question":"Toi co gout, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co gout, bua toi voi dau do can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat hanh nhan; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua toi","benh nen"]},{"id":"ex-485","question":"Toi co gout, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi com gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua Hy Lap + rau xanh + mot it bo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-486","question":"Toi co gout, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi khoai lang can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-487","question":"Toi co gout, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi banh mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-488","question":"Toi co gout, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi yach mach can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-489","question":"Toi co gout, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi bun gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-490","question":"Toi co gout, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-491","question":"Toi co gout, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi ngo luoc can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-492","question":"Toi co gout, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co gout, bua phu sang voi dau do can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu sang","benh nen"]},{"id":"ex-493","question":"Toi co gout, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi com gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop trung ga + rau xanh + mot it hat oc cho; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-494","question":"Toi co gout, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi khoai lang can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop tom + rau xanh + mot it hat hanh nhan; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-495","question":"Toi co gout, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi banh mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau hu + rau xanh + mot it hat chia; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-496","question":"Toi co gout, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi yach mach can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat lanh; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-497","question":"Toi co gout, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi bun gao lut can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop sua Hy Lap + rau xanh + mot it dau oliu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-498","question":"Toi co gout, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi mi nguyen cam can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop thit lon nac + rau xanh + mot it hat dieu; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-499","question":"Toi co gout, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi ngo luoc can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop ca basa + rau xanh + mot it ca beo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-500","question":"Toi co gout, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co gout, bua phu chieu voi dau do can theo huong han che phu tang, hai san giau purin va bia ruou. Ban co the ket hop dau nanh + rau xanh + mot it bo; dong thoi uong du nuoc, uu tien dam it purin va theo doi acid uric.","tags":["gout","bua phu chieu","benh nen"]},{"id":"ex-501","question":"Toi co da day nhay cam, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi com gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau nanh + rau xanh + mot it hat lanh; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-502","question":"Toi co da day nhay cam, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi khoai lang can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop uc ga + rau xanh + mot it dau oliu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-503","question":"Toi co da day nhay cam, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi banh mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca hoi + rau xanh + mot it hat dieu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-504","question":"Toi co da day nhay cam, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi yach mach can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca thu + rau xanh + mot it ca beo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-505","question":"Toi co da day nhay cam, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi bun gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop bo nac + rau xanh + mot it bo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-506","question":"Toi co da day nhay cam, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop trung ga + rau xanh + mot it hat oc cho; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-507","question":"Toi co da day nhay cam, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi ngo luoc can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop tom + rau xanh + mot it hat hanh nhan; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-508","question":"Toi co da day nhay cam, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua sang voi dau do can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau hu + rau xanh + mot it hat chia; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua sang","benh nen"]},{"id":"ex-509","question":"Toi co da day nhay cam, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi com gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat lanh; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-510","question":"Toi co da day nhay cam, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi khoai lang can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua Hy Lap + rau xanh + mot it dau oliu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-511","question":"Toi co da day nhay cam, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi banh mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop thit lon nac + rau xanh + mot it hat dieu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-512","question":"Toi co da day nhay cam, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi yach mach can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca basa + rau xanh + mot it ca beo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-513","question":"Toi co da day nhay cam, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi bun gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau nanh + rau xanh + mot it bo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-514","question":"Toi co da day nhay cam, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop uc ga + rau xanh + mot it hat oc cho; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-515","question":"Toi co da day nhay cam, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi ngo luoc can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca hoi + rau xanh + mot it hat hanh nhan; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-516","question":"Toi co da day nhay cam, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua trua voi dau do can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca thu + rau xanh + mot it hat chia; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua trua","benh nen"]},{"id":"ex-517","question":"Toi co da day nhay cam, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi com gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-518","question":"Toi co da day nhay cam, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi khoai lang can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop trung ga + rau xanh + mot it hat lanh; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-519","question":"Toi co da day nhay cam, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi banh mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop tom + rau xanh + mot it dau oliu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-520","question":"Toi co da day nhay cam, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi yach mach can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau hu + rau xanh + mot it hat dieu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-521","question":"Toi co da day nhay cam, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi bun gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua chua khong duong + rau xanh + mot it ca beo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-522","question":"Toi co da day nhay cam, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua Hy Lap + rau xanh + mot it bo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-523","question":"Toi co da day nhay cam, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi ngo luoc can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-524","question":"Toi co da day nhay cam, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua toi voi dau do can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua toi","benh nen"]},{"id":"ex-525","question":"Toi co da day nhay cam, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi com gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau nanh + rau xanh + mot it bo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-526","question":"Toi co da day nhay cam, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi khoai lang can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop uc ga + rau xanh + mot it hat oc cho; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-527","question":"Toi co da day nhay cam, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi banh mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca hoi + rau xanh + mot it hat hanh nhan; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-528","question":"Toi co da day nhay cam, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi yach mach can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca thu + rau xanh + mot it hat chia; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-529","question":"Toi co da day nhay cam, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi bun gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop bo nac + rau xanh + mot it hat lanh; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-530","question":"Toi co da day nhay cam, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop trung ga + rau xanh + mot it dau oliu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-531","question":"Toi co da day nhay cam, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi ngo luoc can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop tom + rau xanh + mot it hat dieu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-532","question":"Toi co da day nhay cam, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu sang voi dau do can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau hu + rau xanh + mot it ca beo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu sang","benh nen"]},{"id":"ex-533","question":"Toi co da day nhay cam, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi com gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat oc cho; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-534","question":"Toi co da day nhay cam, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi khoai lang can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat hanh nhan; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-535","question":"Toi co da day nhay cam, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi banh mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop thit lon nac + rau xanh + mot it hat chia; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-536","question":"Toi co da day nhay cam, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi yach mach can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca basa + rau xanh + mot it hat lanh; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-537","question":"Toi co da day nhay cam, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi bun gao lut can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop dau nanh + rau xanh + mot it dau oliu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-538","question":"Toi co da day nhay cam, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi mi nguyen cam can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop uc ga + rau xanh + mot it hat dieu; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-539","question":"Toi co da day nhay cam, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi ngo luoc can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca hoi + rau xanh + mot it ca beo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-540","question":"Toi co da day nhay cam, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co da day nhay cam, bua phu chieu voi dau do can theo huong han che mon qua cay, qua chua va ca phe luc doi. Ban co the ket hop ca thu + rau xanh + mot it bo; dong thoi chia bua nho, an cham va dung gia vi nhe.","tags":["da day nhay cam","bua phu chieu","benh nen"]},{"id":"ex-541","question":"Toi co hoi chung ruot kich thich, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi com gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca hoi + rau xanh + mot it hat lanh; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-542","question":"Toi co hoi chung ruot kich thich, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi khoai lang can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca thu + rau xanh + mot it dau oliu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-543","question":"Toi co hoi chung ruot kich thich, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi banh mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop bo nac + rau xanh + mot it hat dieu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-544","question":"Toi co hoi chung ruot kich thich, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi yach mach can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop trung ga + rau xanh + mot it ca beo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-545","question":"Toi co hoi chung ruot kich thich, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi bun gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop tom + rau xanh + mot it bo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-546","question":"Toi co hoi chung ruot kich thich, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau hu + rau xanh + mot it hat oc cho; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-547","question":"Toi co hoi chung ruot kich thich, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi ngo luoc can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat hanh nhan; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-548","question":"Toi co hoi chung ruot kich thich, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua sang voi dau do can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat chia; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua sang","benh nen"]},{"id":"ex-549","question":"Toi co hoi chung ruot kich thich, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi com gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop thit lon nac + rau xanh + mot it hat lanh; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-550","question":"Toi co hoi chung ruot kich thich, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi khoai lang can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca basa + rau xanh + mot it dau oliu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-551","question":"Toi co hoi chung ruot kich thich, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi banh mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau nanh + rau xanh + mot it hat dieu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-552","question":"Toi co hoi chung ruot kich thich, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi yach mach can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop uc ga + rau xanh + mot it ca beo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-553","question":"Toi co hoi chung ruot kich thich, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi bun gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca hoi + rau xanh + mot it bo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-554","question":"Toi co hoi chung ruot kich thich, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca thu + rau xanh + mot it hat oc cho; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-555","question":"Toi co hoi chung ruot kich thich, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi ngo luoc can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop bo nac + rau xanh + mot it hat hanh nhan; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-556","question":"Toi co hoi chung ruot kich thich, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua trua voi dau do can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua trua","benh nen"]},{"id":"ex-557","question":"Toi co hoi chung ruot kich thich, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi com gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop tom + rau xanh + mot it hat chia; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-558","question":"Toi co hoi chung ruot kich thich, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi khoai lang can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau hu + rau xanh + mot it hat lanh; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-559","question":"Toi co hoi chung ruot kich thich, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi banh mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua chua khong duong + rau xanh + mot it dau oliu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-560","question":"Toi co hoi chung ruot kich thich, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi yach mach can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat dieu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-561","question":"Toi co hoi chung ruot kich thich, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi bun gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop thit lon nac + rau xanh + mot it ca beo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-562","question":"Toi co hoi chung ruot kich thich, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca basa + rau xanh + mot it bo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-563","question":"Toi co hoi chung ruot kich thich, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi ngo luoc can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau nanh + rau xanh + mot it hat oc cho; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-564","question":"Toi co hoi chung ruot kich thich, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua toi voi dau do can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop uc ga + rau xanh + mot it hat hanh nhan; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua toi","benh nen"]},{"id":"ex-565","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi com gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca hoi + rau xanh + mot it bo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-566","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi khoai lang can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca thu + rau xanh + mot it hat oc cho; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-567","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi banh mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop bo nac + rau xanh + mot it hat hanh nhan; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-568","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi yach mach can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-569","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi bun gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-570","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-571","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi ngo luoc can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-572","question":"Toi co hoi chung ruot kich thich, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu sang voi dau do can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu sang","benh nen"]},{"id":"ex-573","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi com gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-574","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi khoai lang can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-575","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi banh mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-576","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi yach mach can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-577","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi bun gao lut can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-578","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi mi nguyen cam can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-579","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi ngo luoc can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-580","question":"Toi co hoi chung ruot kich thich, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co hoi chung ruot kich thich, bua phu chieu voi dau do can theo huong theo doi nhom thuc pham de day hoi, can doi low-FODMAP neu can. Ban co the ket hop trung ga + rau xanh + mot it bo; dong thoi thu nhat ky an uong de xac dinh mon gay trieu chung.","tags":["hoi chung ruot kich thich","bua phu chieu","benh nen"]},{"id":"ex-581","question":"Toi co nguy co thieu mau, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi com gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop thit lon nac + rau xanh + mot it hat lanh; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-582","question":"Toi co nguy co thieu mau, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi khoai lang can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca basa + rau xanh + mot it dau oliu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-583","question":"Toi co nguy co thieu mau, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi banh mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau nanh + rau xanh + mot it hat dieu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-584","question":"Toi co nguy co thieu mau, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi yach mach can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop uc ga + rau xanh + mot it ca beo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-585","question":"Toi co nguy co thieu mau, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi bun gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca hoi + rau xanh + mot it bo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-586","question":"Toi co nguy co thieu mau, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca thu + rau xanh + mot it hat oc cho; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-587","question":"Toi co nguy co thieu mau, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi ngo luoc can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop bo nac + rau xanh + mot it hat hanh nhan; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-588","question":"Toi co nguy co thieu mau, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua sang voi dau do can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop trung ga + rau xanh + mot it hat chia; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua sang","benh nen"]},{"id":"ex-589","question":"Toi co nguy co thieu mau, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi com gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop tom + rau xanh + mot it hat lanh; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-590","question":"Toi co nguy co thieu mau, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi khoai lang can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau hu + rau xanh + mot it dau oliu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-591","question":"Toi co nguy co thieu mau, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi banh mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat dieu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-592","question":"Toi co nguy co thieu mau, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi yach mach can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua Hy Lap + rau xanh + mot it ca beo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-593","question":"Toi co nguy co thieu mau, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi bun gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-594","question":"Toi co nguy co thieu mau, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-595","question":"Toi co nguy co thieu mau, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi ngo luoc can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-596","question":"Toi co nguy co thieu mau, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua trua voi dau do can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua trua","benh nen"]},{"id":"ex-597","question":"Toi co nguy co thieu mau, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi com gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca hoi + rau xanh + mot it hat chia; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-598","question":"Toi co nguy co thieu mau, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi khoai lang can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca thu + rau xanh + mot it hat lanh; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-599","question":"Toi co nguy co thieu mau, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi banh mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop bo nac + rau xanh + mot it dau oliu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-600","question":"Toi co nguy co thieu mau, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi yach mach can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop trung ga + rau xanh + mot it hat dieu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-601","question":"Toi co nguy co thieu mau, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi bun gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop tom + rau xanh + mot it ca beo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-602","question":"Toi co nguy co thieu mau, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau hu + rau xanh + mot it bo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-603","question":"Toi co nguy co thieu mau, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi ngo luoc can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat oc cho; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-604","question":"Toi co nguy co thieu mau, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua toi voi dau do can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat hanh nhan; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua toi","benh nen"]},{"id":"ex-605","question":"Toi co nguy co thieu mau, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi com gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop thit lon nac + rau xanh + mot it bo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-606","question":"Toi co nguy co thieu mau, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi khoai lang can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca basa + rau xanh + mot it hat oc cho; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-607","question":"Toi co nguy co thieu mau, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi banh mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau nanh + rau xanh + mot it hat hanh nhan; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-608","question":"Toi co nguy co thieu mau, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi yach mach can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-609","question":"Toi co nguy co thieu mau, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi bun gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca hoi + rau xanh + mot it hat lanh; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-610","question":"Toi co nguy co thieu mau, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca thu + rau xanh + mot it dau oliu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-611","question":"Toi co nguy co thieu mau, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi ngo luoc can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop bo nac + rau xanh + mot it hat dieu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-612","question":"Toi co nguy co thieu mau, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu sang voi dau do can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop trung ga + rau xanh + mot it ca beo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu sang","benh nen"]},{"id":"ex-613","question":"Toi co nguy co thieu mau, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi com gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop tom + rau xanh + mot it hat oc cho; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-614","question":"Toi co nguy co thieu mau, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi khoai lang can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau hu + rau xanh + mot it hat hanh nhan; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-615","question":"Toi co nguy co thieu mau, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi banh mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat chia; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-616","question":"Toi co nguy co thieu mau, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi yach mach can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-617","question":"Toi co nguy co thieu mau, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi bun gao lut can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-618","question":"Toi co nguy co thieu mau, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi mi nguyen cam can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-619","question":"Toi co nguy co thieu mau, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi ngo luoc can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-620","question":"Toi co nguy co thieu mau, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co nguy co thieu mau, bua phu chieu voi dau do can theo huong khong bo bua va khong chi an tinh bot don thuan. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi ket hop sat tu thit nac/dau do voi vitamin C de tang hap thu.","tags":["nguy co thieu mau","bua phu chieu","benh nen"]},{"id":"ex-621","question":"Toi co benh than giai doan som, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi com gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat lanh; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-622","question":"Toi co benh than giai doan som, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi khoai lang can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua Hy Lap + rau xanh + mot it dau oliu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-623","question":"Toi co benh than giai doan som, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi banh mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop thit lon nac + rau xanh + mot it hat dieu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-624","question":"Toi co benh than giai doan som, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi yach mach can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca basa + rau xanh + mot it ca beo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-625","question":"Toi co benh than giai doan som, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi bun gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau nanh + rau xanh + mot it bo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-626","question":"Toi co benh than giai doan som, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop uc ga + rau xanh + mot it hat oc cho; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-627","question":"Toi co benh than giai doan som, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi ngo luoc can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca hoi + rau xanh + mot it hat hanh nhan; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-628","question":"Toi co benh than giai doan som, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua sang voi dau do can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca thu + rau xanh + mot it hat chia; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua sang","benh nen"]},{"id":"ex-629","question":"Toi co benh than giai doan som, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi com gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop bo nac + rau xanh + mot it hat lanh; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-630","question":"Toi co benh than giai doan som, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi khoai lang can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop trung ga + rau xanh + mot it dau oliu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-631","question":"Toi co benh than giai doan som, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi banh mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop tom + rau xanh + mot it hat dieu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-632","question":"Toi co benh than giai doan som, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi yach mach can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau hu + rau xanh + mot it ca beo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-633","question":"Toi co benh than giai doan som, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi bun gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua chua khong duong + rau xanh + mot it bo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-634","question":"Toi co benh than giai doan som, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat oc cho; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-635","question":"Toi co benh than giai doan som, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi ngo luoc can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop thit lon nac + rau xanh + mot it hat hanh nhan; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-636","question":"Toi co benh than giai doan som, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua trua voi dau do can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca basa + rau xanh + mot it hat chia; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua trua","benh nen"]},{"id":"ex-637","question":"Toi co benh than giai doan som, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi com gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-638","question":"Toi co benh than giai doan som, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi khoai lang can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-639","question":"Toi co benh than giai doan som, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi banh mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-640","question":"Toi co benh than giai doan som, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi yach mach can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-641","question":"Toi co benh than giai doan som, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi bun gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-642","question":"Toi co benh than giai doan som, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop trung ga + rau xanh + mot it bo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-643","question":"Toi co benh than giai doan som, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi ngo luoc can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop tom + rau xanh + mot it hat oc cho; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-644","question":"Toi co benh than giai doan som, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua toi voi dau do can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau hu + rau xanh + mot it hat hanh nhan; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua toi","benh nen"]},{"id":"ex-645","question":"Toi co benh than giai doan som, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi com gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua chua khong duong + rau xanh + mot it bo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-646","question":"Toi co benh than giai doan som, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi khoai lang can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat oc cho; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-647","question":"Toi co benh than giai doan som, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi banh mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop thit lon nac + rau xanh + mot it hat hanh nhan; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-648","question":"Toi co benh than giai doan som, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi yach mach can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca basa + rau xanh + mot it hat chia; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-649","question":"Toi co benh than giai doan som, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi bun gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau nanh + rau xanh + mot it hat lanh; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-650","question":"Toi co benh than giai doan som, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop uc ga + rau xanh + mot it dau oliu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-651","question":"Toi co benh than giai doan som, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi ngo luoc can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca hoi + rau xanh + mot it hat dieu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-652","question":"Toi co benh than giai doan som, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu sang voi dau do can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca thu + rau xanh + mot it ca beo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu sang","benh nen"]},{"id":"ex-653","question":"Toi co benh than giai doan som, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi com gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop bo nac + rau xanh + mot it hat oc cho; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-654","question":"Toi co benh than giai doan som, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi khoai lang can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop trung ga + rau xanh + mot it hat hanh nhan; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-655","question":"Toi co benh than giai doan som, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi banh mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop tom + rau xanh + mot it hat chia; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-656","question":"Toi co benh than giai doan som, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi yach mach can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop dau hu + rau xanh + mot it hat lanh; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-657","question":"Toi co benh than giai doan som, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi bun gao lut can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua chua khong duong + rau xanh + mot it dau oliu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-658","question":"Toi co benh than giai doan som, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi mi nguyen cam can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat dieu; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-659","question":"Toi co benh than giai doan som, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi ngo luoc can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop thit lon nac + rau xanh + mot it ca beo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-660","question":"Toi co benh than giai doan som, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co benh than giai doan som, bua phu chieu voi dau do can theo huong khong an qua man va khong tu y bo sung protein cao. Ban co the ket hop ca basa + rau xanh + mot it bo; dong thoi can bang dam theo huong dan bac si va theo doi xet nghiem dinh ky.","tags":["benh than giai doan som","bua phu chieu","benh nen"]},{"id":"ex-661","question":"Toi co suy giap, bua sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi com gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua Hy Lap + rau xanh + mot it hat lanh; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-662","question":"Toi co suy giap, bua sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi khoai lang can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop thit lon nac + rau xanh + mot it dau oliu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-663","question":"Toi co suy giap, bua sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi banh mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca basa + rau xanh + mot it hat dieu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-664","question":"Toi co suy giap, bua sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi yach mach can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau nanh + rau xanh + mot it ca beo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-665","question":"Toi co suy giap, bua sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi bun gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop uc ga + rau xanh + mot it bo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-666","question":"Toi co suy giap, bua sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca hoi + rau xanh + mot it hat oc cho; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-667","question":"Toi co suy giap, bua sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi ngo luoc can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca thu + rau xanh + mot it hat hanh nhan; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-668","question":"Toi co suy giap, bua sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co suy giap, bua sang voi dau do can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop bo nac + rau xanh + mot it hat chia; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua sang","benh nen"]},{"id":"ex-669","question":"Toi co suy giap, bua trua nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi com gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop trung ga + rau xanh + mot it hat lanh; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-670","question":"Toi co suy giap, bua trua nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi khoai lang can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop tom + rau xanh + mot it dau oliu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-671","question":"Toi co suy giap, bua trua nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi banh mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau hu + rau xanh + mot it hat dieu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-672","question":"Toi co suy giap, bua trua nen an yach mach ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi yach mach can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua chua khong duong + rau xanh + mot it ca beo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-673","question":"Toi co suy giap, bua trua nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi bun gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua Hy Lap + rau xanh + mot it bo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-674","question":"Toi co suy giap, bua trua nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-675","question":"Toi co suy giap, bua trua nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi ngo luoc can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-676","question":"Toi co suy giap, bua trua nen an dau do ra sao de an toan hon?","answer":"Neu ban co suy giap, bua trua voi dau do can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua trua","benh nen"]},{"id":"ex-677","question":"Toi co suy giap, bua toi nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi com gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop uc ga + rau xanh + mot it hat chia; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-678","question":"Toi co suy giap, bua toi nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi khoai lang can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca hoi + rau xanh + mot it hat lanh; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-679","question":"Toi co suy giap, bua toi nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi banh mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca thu + rau xanh + mot it dau oliu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-680","question":"Toi co suy giap, bua toi nen an yach mach ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi yach mach can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop bo nac + rau xanh + mot it hat dieu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-681","question":"Toi co suy giap, bua toi nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi bun gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop trung ga + rau xanh + mot it ca beo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-682","question":"Toi co suy giap, bua toi nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop tom + rau xanh + mot it bo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-683","question":"Toi co suy giap, bua toi nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi ngo luoc can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau hu + rau xanh + mot it hat oc cho; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-684","question":"Toi co suy giap, bua toi nen an dau do ra sao de an toan hon?","answer":"Neu ban co suy giap, bua toi voi dau do can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat hanh nhan; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua toi","benh nen"]},{"id":"ex-685","question":"Toi co suy giap, bua phu sang nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi com gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua Hy Lap + rau xanh + mot it bo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-686","question":"Toi co suy giap, bua phu sang nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi khoai lang can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop thit lon nac + rau xanh + mot it hat oc cho; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-687","question":"Toi co suy giap, bua phu sang nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi banh mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca basa + rau xanh + mot it hat hanh nhan; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-688","question":"Toi co suy giap, bua phu sang nen an yach mach ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi yach mach can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau nanh + rau xanh + mot it hat chia; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-689","question":"Toi co suy giap, bua phu sang nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi bun gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop uc ga + rau xanh + mot it hat lanh; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-690","question":"Toi co suy giap, bua phu sang nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca hoi + rau xanh + mot it dau oliu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-691","question":"Toi co suy giap, bua phu sang nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi ngo luoc can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca thu + rau xanh + mot it hat dieu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-692","question":"Toi co suy giap, bua phu sang nen an dau do ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu sang voi dau do can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop bo nac + rau xanh + mot it ca beo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu sang","benh nen"]},{"id":"ex-693","question":"Toi co suy giap, bua phu chieu nen an com gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi com gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop trung ga + rau xanh + mot it hat oc cho; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-694","question":"Toi co suy giap, bua phu chieu nen an khoai lang ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi khoai lang can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop tom + rau xanh + mot it hat hanh nhan; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-695","question":"Toi co suy giap, bua phu chieu nen an banh mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi banh mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau hu + rau xanh + mot it hat chia; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-696","question":"Toi co suy giap, bua phu chieu nen an yach mach ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi yach mach can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua chua khong duong + rau xanh + mot it hat lanh; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-697","question":"Toi co suy giap, bua phu chieu nen an bun gao lut ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi bun gao lut can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop sua Hy Lap + rau xanh + mot it dau oliu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-698","question":"Toi co suy giap, bua phu chieu nen an mi nguyen cam ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi mi nguyen cam can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop thit lon nac + rau xanh + mot it hat dieu; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-699","question":"Toi co suy giap, bua phu chieu nen an ngo luoc ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi ngo luoc can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop ca basa + rau xanh + mot it ca beo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-700","question":"Toi co suy giap, bua phu chieu nen an dau do ra sao de an toan hon?","answer":"Neu ban co suy giap, bua phu chieu voi dau do can theo huong duong nhieu va do an sieu che bien. Ban co the ket hop dau nanh + rau xanh + mot it bo; dong thoi giu lich an deu, du dam va vi chat theo tu van y te.","tags":["suy giap","bua phu chieu","benh nen"]},{"id":"ex-701","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop sua chua khong duong; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-702","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop sua Hy Lap; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-703","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop thit lon nac; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-704","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop ca basa; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-705","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop dau nanh; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-706","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop uc ga; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-707","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop ca hoi; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-708","question":"Trong ngay tap ta suc manh, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich tap ta suc manh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop ca thu; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","truoc tap","tap luyen"]},{"id":"ex-709","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop bo nac; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-710","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop trung ga; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-711","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop tom; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-712","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop dau hu; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-713","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop sua chua khong duong; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-714","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop sua Hy Lap; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-715","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop thit lon nac; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-716","question":"Trong ngay tap ta suc manh, sau tap toi nen an gi neu co dau do?","answer":"Voi lich tap ta suc manh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop ca basa; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","sau tap","tap luyen"]},{"id":"ex-717","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop dau nanh; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-718","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop uc ga; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-719","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop ca hoi; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-720","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop ca thu; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-721","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop bo nac; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-722","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop trung ga; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-723","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop tom; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-724","question":"Trong ngay tap ta suc manh, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich tap ta suc manh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop dau hu; dong thoi uu tien dam sau tap de phuc hoi co.","tags":["tap ta suc manh","ngay khong tap","tap luyen"]},{"id":"ex-725","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop dau nanh; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-726","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop uc ga; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-727","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop ca hoi; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-728","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop ca thu; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-729","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop bo nac; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-730","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop trung ga; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-731","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop tom; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-732","question":"Trong ngay chay bo, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich chay bo, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop dau hu; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","truoc tap","tap luyen"]},{"id":"ex-733","question":"Trong ngay chay bo, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop sua chua khong duong; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-734","question":"Trong ngay chay bo, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop sua Hy Lap; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-735","question":"Trong ngay chay bo, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop thit lon nac; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-736","question":"Trong ngay chay bo, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop ca basa; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-737","question":"Trong ngay chay bo, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop dau nanh; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-738","question":"Trong ngay chay bo, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop uc ga; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-739","question":"Trong ngay chay bo, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop ca hoi; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-740","question":"Trong ngay chay bo, sau tap toi nen an gi neu co dau do?","answer":"Voi lich chay bo, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop ca thu; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","sau tap","tap luyen"]},{"id":"ex-741","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop bo nac; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-742","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop trung ga; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-743","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop tom; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-744","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop dau hu; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-745","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop sua chua khong duong; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-746","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop sua Hy Lap; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-747","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop thit lon nac; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-748","question":"Trong ngay chay bo, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich chay bo, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop ca basa; dong thoi can bo sung nuoc va carb phu hop cuong do.","tags":["chay bo","ngay khong tap","tap luyen"]},{"id":"ex-749","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop ca basa; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-750","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop dau nanh; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-751","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop uc ga; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-752","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop ca hoi; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-753","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop ca thu; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-754","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop bo nac; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-755","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop trung ga; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-756","question":"Trong ngay dap xe, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich dap xe, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop tom; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","truoc tap","tap luyen"]},{"id":"ex-757","question":"Trong ngay dap xe, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop dau hu; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-758","question":"Trong ngay dap xe, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop sua chua khong duong; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-759","question":"Trong ngay dap xe, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop sua Hy Lap; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-760","question":"Trong ngay dap xe, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop thit lon nac; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-761","question":"Trong ngay dap xe, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop ca basa; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-762","question":"Trong ngay dap xe, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop dau nanh; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-763","question":"Trong ngay dap xe, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop uc ga; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-764","question":"Trong ngay dap xe, sau tap toi nen an gi neu co dau do?","answer":"Voi lich dap xe, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop ca hoi; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","sau tap","tap luyen"]},{"id":"ex-765","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop ca thu; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-766","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop bo nac; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-767","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop trung ga; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-768","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop tom; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-769","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop dau hu; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-770","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop sua chua khong duong; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-771","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop sua Hy Lap; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-772","question":"Trong ngay dap xe, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich dap xe, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop thit lon nac; dong thoi du nang luong truoc tap neu buoi tap dai.","tags":["dap xe","ngay khong tap","tap luyen"]},{"id":"ex-773","question":"Trong ngay boi, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop sua chua khong duong; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-774","question":"Trong ngay boi, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop sua Hy Lap; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-775","question":"Trong ngay boi, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop thit lon nac; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-776","question":"Trong ngay boi, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop ca basa; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-777","question":"Trong ngay boi, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop dau nanh; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-778","question":"Trong ngay boi, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop uc ga; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-779","question":"Trong ngay boi, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop ca hoi; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-780","question":"Trong ngay boi, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich boi, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop ca thu; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","truoc tap","tap luyen"]},{"id":"ex-781","question":"Trong ngay boi, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop bo nac; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-782","question":"Trong ngay boi, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop trung ga; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-783","question":"Trong ngay boi, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop tom; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-784","question":"Trong ngay boi, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop dau hu; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-785","question":"Trong ngay boi, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop sua chua khong duong; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-786","question":"Trong ngay boi, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop sua Hy Lap; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-787","question":"Trong ngay boi, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop thit lon nac; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-788","question":"Trong ngay boi, sau tap toi nen an gi neu co dau do?","answer":"Voi lich boi, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop ca basa; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","sau tap","tap luyen"]},{"id":"ex-789","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop dau nanh; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-790","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop uc ga; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-791","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop ca hoi; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-792","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop ca thu; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-793","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop bo nac; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-794","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop trung ga; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-795","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop tom; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-796","question":"Trong ngay boi, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich boi, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop dau hu; dong thoi an nhe truoc tap va bo sung protein sau tap.","tags":["boi","ngay khong tap","tap luyen"]},{"id":"ex-797","question":"Trong ngay yoga, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop sua Hy Lap; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-798","question":"Trong ngay yoga, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop thit lon nac; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-799","question":"Trong ngay yoga, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop ca basa; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-800","question":"Trong ngay yoga, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop dau nanh; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-801","question":"Trong ngay yoga, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop uc ga; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-802","question":"Trong ngay yoga, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop ca hoi; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-803","question":"Trong ngay yoga, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop ca thu; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-804","question":"Trong ngay yoga, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich yoga, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop bo nac; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","truoc tap","tap luyen"]},{"id":"ex-805","question":"Trong ngay yoga, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop trung ga; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-806","question":"Trong ngay yoga, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop tom; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-807","question":"Trong ngay yoga, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop dau hu; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-808","question":"Trong ngay yoga, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop sua chua khong duong; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-809","question":"Trong ngay yoga, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop sua Hy Lap; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-810","question":"Trong ngay yoga, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop thit lon nac; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-811","question":"Trong ngay yoga, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop ca basa; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-812","question":"Trong ngay yoga, sau tap toi nen an gi neu co dau do?","answer":"Voi lich yoga, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop dau nanh; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","sau tap","tap luyen"]},{"id":"ex-813","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop uc ga; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-814","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop ca hoi; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-815","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop ca thu; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-816","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop bo nac; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-817","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop trung ga; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-818","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop tom; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-819","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop dau hu; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-820","question":"Trong ngay yoga, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich yoga, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop sua chua khong duong; dong thoi giu bua nhe de tranh nang bung khi tap.","tags":["yoga","ngay khong tap","tap luyen"]},{"id":"ex-821","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop sua Hy Lap; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-822","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop thit lon nac; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-823","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop ca basa; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-824","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop dau nanh; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-825","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop uc ga; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-826","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop ca hoi; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-827","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop ca thu; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-828","question":"Trong ngay HIIT, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich HIIT, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop bo nac; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","truoc tap","tap luyen"]},{"id":"ex-829","question":"Trong ngay HIIT, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop trung ga; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-830","question":"Trong ngay HIIT, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop tom; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-831","question":"Trong ngay HIIT, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop dau hu; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-832","question":"Trong ngay HIIT, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop sua chua khong duong; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-833","question":"Trong ngay HIIT, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop sua Hy Lap; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-834","question":"Trong ngay HIIT, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop thit lon nac; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-835","question":"Trong ngay HIIT, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop ca basa; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-836","question":"Trong ngay HIIT, sau tap toi nen an gi neu co dau do?","answer":"Voi lich HIIT, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop dau nanh; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","sau tap","tap luyen"]},{"id":"ex-837","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop uc ga; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-838","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop ca hoi; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-839","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop ca thu; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-840","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop bo nac; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-841","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop trung ga; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-842","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop tom; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-843","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop dau hu; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-844","question":"Trong ngay HIIT, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich HIIT, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop sua chua khong duong; dong thoi uu tien phuc hoi voi protein + carb sau tap.","tags":["HIIT","ngay khong tap","tap luyen"]},{"id":"ex-845","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop bo nac; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-846","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop trung ga; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-847","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop tom; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-848","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop dau hu; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-849","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop sua chua khong duong; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-850","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop sua Hy Lap; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-851","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop thit lon nac; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-852","question":"Trong ngay di bo nhanh, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich di bo nhanh, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop ca basa; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","truoc tap","tap luyen"]},{"id":"ex-853","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop dau nanh; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-854","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop uc ga; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-855","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop ca hoi; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-856","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop ca thu; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-857","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop bo nac; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-858","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop trung ga; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-859","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop tom; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-860","question":"Trong ngay di bo nhanh, sau tap toi nen an gi neu co dau do?","answer":"Voi lich di bo nhanh, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop dau hu; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","sau tap","tap luyen"]},{"id":"ex-861","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop sua chua khong duong; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-862","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop sua Hy Lap; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-863","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop thit lon nac; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-864","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop ca basa; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-865","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop dau nanh; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-866","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop uc ga; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-867","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop ca hoi; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-868","question":"Trong ngay di bo nhanh, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich di bo nhanh, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop ca thu; dong thoi du nuoc va snack nhe neu tap lau.","tags":["di bo nhanh","ngay khong tap","tap luyen"]},{"id":"ex-869","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co com gao lut?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung com gao lut ket hop ca basa; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-870","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co khoai lang?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung khoai lang ket hop dau nanh; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-871","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung banh mi nguyen cam ket hop uc ga; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-872","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co yach mach?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung yach mach ket hop ca hoi; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-873","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co bun gao lut?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung bun gao lut ket hop ca thu; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-874","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung mi nguyen cam ket hop bo nac; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-875","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co ngo luoc?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung ngo luoc ket hop trung ga; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-876","question":"Trong ngay the thao doi khang, truoc tap toi nen an gi neu co dau do?","answer":"Voi lich the thao doi khang, giai doan truoc tap ban nen uu tien an truoc 60-120 phut, uu tien carb vua phai + it dam, han che chat beo cao. Co the dung dau do ket hop tom; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","truoc tap","tap luyen"]},{"id":"ex-877","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co com gao lut?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung com gao lut ket hop dau hu; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-878","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co khoai lang?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung khoai lang ket hop sua chua khong duong; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-879","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung banh mi nguyen cam ket hop sua Hy Lap; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-880","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co yach mach?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung yach mach ket hop thit lon nac; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-881","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co bun gao lut?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung bun gao lut ket hop ca basa; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-882","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung mi nguyen cam ket hop dau nanh; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-883","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co ngo luoc?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung ngo luoc ket hop uc ga; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-884","question":"Trong ngay the thao doi khang, sau tap toi nen an gi neu co dau do?","answer":"Voi lich the thao doi khang, giai doan sau tap ban nen uu tien bo sung trong 30-60 phut voi 25-35g protein va mot luong carb phu hop. Co the dung dau do ket hop ca hoi; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","sau tap","tap luyen"]},{"id":"ex-885","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co com gao lut?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung com gao lut ket hop ca thu; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-886","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co khoai lang?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung khoai lang ket hop bo nac; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-887","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co banh mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung banh mi nguyen cam ket hop trung ga; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-888","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co yach mach?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung yach mach ket hop tom; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-889","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co bun gao lut?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung bun gao lut ket hop dau hu; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-890","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co mi nguyen cam?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung mi nguyen cam ket hop sua chua khong duong; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-891","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co ngo luoc?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung ngo luoc ket hop sua Hy Lap; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-892","question":"Trong ngay the thao doi khang, ngay khong tap toi nen an gi neu co dau do?","answer":"Voi lich the thao doi khang, giai doan ngay khong tap ban nen uu tien giu protein deu ca ngay, dieu chinh carb theo muc van dong thuc te. Co the dung dau do ket hop thit lon nac; dong thoi chia nho bua an quanh lich tap thi dau.","tags":["the thao doi khang","ngay khong tap","tap luyen"]},{"id":"ex-893","question":"Toi hay an dem, can sua sao? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon. De phu hop muc tieu giam can, hay uu tien bua sang co ca basa + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_dem","giam can","hanh vi"]},{"id":"ex-894","question":"Toi hay an dem, can sua sao? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon. De phu hop muc tieu tang co, hay uu tien bua sang co dau nanh + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_dem","tang co","hanh vi"]},{"id":"ex-895","question":"Toi hay an dem, can sua sao? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co uc ga + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["an_dem","duy tri can nang","hanh vi"]},{"id":"ex-896","question":"Toi hay an dem, can sua sao? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon. De phu hop muc tieu giam mo, hay uu tien bua toi co ca hoi + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["an_dem","giam mo","hanh vi"]},{"id":"ex-897","question":"Toi hay an dem, can sua sao? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"dat gio dong bep co dinh, uu tien bua toi du dam va chat xo de giam doi muon. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co ca thu + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["an_dem","on dinh duong huyet","hanh vi"]},{"id":"ex-898","question":"Toi thuong bo bua sang, co sao khong? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay. De phu hop muc tieu giam can, hay uu tien bua sang co sua Hy Lap + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["bo_bua_sang","giam can","hanh vi"]},{"id":"ex-899","question":"Toi thuong bo bua sang, co sao khong? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay. De phu hop muc tieu tang co, hay uu tien bua sang co thit lon nac + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["bo_bua_sang","tang co","hanh vi"]},{"id":"ex-900","question":"Toi thuong bo bua sang, co sao khong? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co ca basa + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["bo_bua_sang","duy tri can nang","hanh vi"]},{"id":"ex-901","question":"Toi thuong bo bua sang, co sao khong? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay. De phu hop muc tieu giam mo, hay uu tien bua toi co dau nanh + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["bo_bua_sang","giam mo","hanh vi"]},{"id":"ex-902","question":"Toi thuong bo bua sang, co sao khong? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"thu bua sang nho gon nhung co dam de giam an bu vao cuoi ngay. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co uc ga + nam, va theo doi 7-14 ngay de dieu chinh.","tags":["bo_bua_sang","on dinh duong huyet","hanh vi"]},{"id":"ex-903","question":"Toi uong qua it nuoc, lam sao de duy tri? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat. De phu hop muc tieu giam can, hay uu tien bua sang co ca thu + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_it_nuoc","giam can","hanh vi"]},{"id":"ex-904","question":"Toi uong qua it nuoc, lam sao de duy tri? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat. De phu hop muc tieu tang co, hay uu tien bua sang co bo nac + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_it_nuoc","tang co","hanh vi"]},{"id":"ex-905","question":"Toi uong qua it nuoc, lam sao de duy tri? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co trung ga + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_it_nuoc","duy tri can nang","hanh vi"]},{"id":"ex-906","question":"Toi uong qua it nuoc, lam sao de duy tri? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat. De phu hop muc tieu giam mo, hay uu tien bua toi co tom + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_it_nuoc","giam mo","hanh vi"]},{"id":"ex-907","question":"Toi uong qua it nuoc, lam sao de duy tri? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"chia moc uong nuoc theo khung gio va dat binh nuoc trong tam mat. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co dau hu + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_it_nuoc","on dinh duong huyet","hanh vi"]},{"id":"ex-908","question":"Toi an qua nhanh, can dieu chinh the nao? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"an cham hon, dat thia xuong giua cac mieng va theo doi muc no. De phu hop muc tieu giam can, hay uu tien bua sang co bo nac + nam, va theo doi 7-14 ngay de dieu chinh.","tags":["an_nhanh","giam can","hanh vi"]},{"id":"ex-909","question":"Toi an qua nhanh, can dieu chinh the nao? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"an cham hon, dat thia xuong giua cac mieng va theo doi muc no. De phu hop muc tieu tang co, hay uu tien bua sang co trung ga + rau tron, va theo doi 7-14 ngay de dieu chinh.","tags":["an_nhanh","tang co","hanh vi"]},{"id":"ex-910","question":"Toi an qua nhanh, can dieu chinh the nao? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"an cham hon, dat thia xuong giua cac mieng va theo doi muc no. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co tom + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_nhanh","duy tri can nang","hanh vi"]},{"id":"ex-911","question":"Toi an qua nhanh, can dieu chinh the nao? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"an cham hon, dat thia xuong giua cac mieng va theo doi muc no. De phu hop muc tieu giam mo, hay uu tien bua toi co dau hu + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_nhanh","giam mo","hanh vi"]},{"id":"ex-912","question":"Toi an qua nhanh, can dieu chinh the nao? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"an cham hon, dat thia xuong giua cac mieng va theo doi muc no. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co sua chua khong duong + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["an_nhanh","on dinh duong huyet","hanh vi"]},{"id":"ex-913","question":"Toi rat them do ngot vao buoi chieu, xu ly sao? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"doi qua snack co dam + chat xo va chuan bi khau phan nho truoc. De phu hop muc tieu giam can, hay uu tien bua sang co ca hoi + rau tron, va theo doi 7-14 ngay de dieu chinh.","tags":["thich_do_ngot","giam can","hanh vi"]},{"id":"ex-914","question":"Toi rat them do ngot vao buoi chieu, xu ly sao? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"doi qua snack co dam + chat xo va chuan bi khau phan nho truoc. De phu hop muc tieu tang co, hay uu tien bua sang co ca thu + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["thich_do_ngot","tang co","hanh vi"]},{"id":"ex-915","question":"Toi rat them do ngot vao buoi chieu, xu ly sao? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"doi qua snack co dam + chat xo va chuan bi khau phan nho truoc. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co bo nac + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["thich_do_ngot","duy tri can nang","hanh vi"]},{"id":"ex-916","question":"Toi rat them do ngot vao buoi chieu, xu ly sao? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"doi qua snack co dam + chat xo va chuan bi khau phan nho truoc. De phu hop muc tieu giam mo, hay uu tien bua toi co trung ga + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["thich_do_ngot","giam mo","hanh vi"]},{"id":"ex-917","question":"Toi rat them do ngot vao buoi chieu, xu ly sao? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"doi qua snack co dam + chat xo va chuan bi khau phan nho truoc. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co tom + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["thich_do_ngot","on dinh duong huyet","hanh vi"]},{"id":"ex-918","question":"Toi ngu it, co anh huong den can nang khong? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat an uong. De phu hop muc tieu giam can, hay uu tien bua sang co ca thu + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["ngu_thieu","giam can","hanh vi"]},{"id":"ex-919","question":"Toi ngu it, co anh huong den can nang khong? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat an uong. De phu hop muc tieu tang co, hay uu tien bua sang co bo nac + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["ngu_thieu","tang co","hanh vi"]},{"id":"ex-920","question":"Toi ngu it, co anh huong den can nang khong? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat an uong. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co trung ga + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["ngu_thieu","duy tri can nang","hanh vi"]},{"id":"ex-921","question":"Toi ngu it, co anh huong den can nang khong? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat an uong. De phu hop muc tieu giam mo, hay uu tien bua toi co tom + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["ngu_thieu","giam mo","hanh vi"]},{"id":"ex-922","question":"Toi ngu it, co anh huong den can nang khong? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"ngu 7-8 gio giup on dinh hormon doi/no va ho tro kiem soat an uong. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co dau hu + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["ngu_thieu","on dinh duong huyet","hanh vi"]},{"id":"ex-923","question":"Toi thuong uong bia ruou cuoi tuan, can luu y gi? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo. De phu hop muc tieu giam can, hay uu tien bua sang co sua chua khong duong + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_ruou","giam can","hanh vi"]},{"id":"ex-924","question":"Toi thuong uong bia ruou cuoi tuan, can luu y gi? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo. De phu hop muc tieu tang co, hay uu tien bua sang co sua Hy Lap + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_ruou","tang co","hanh vi"]},{"id":"ex-925","question":"Toi thuong uong bia ruou cuoi tuan, can luu y gi? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co thit lon nac + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_ruou","duy tri can nang","hanh vi"]},{"id":"ex-926","question":"Toi thuong uong bia ruou cuoi tuan, can luu y gi? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo. De phu hop muc tieu giam mo, hay uu tien bua toi co ca basa + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_ruou","giam mo","hanh vi"]},{"id":"ex-927","question":"Toi thuong uong bia ruou cuoi tuan, can luu y gi? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"gioi han luong uong, bo sung nuoc va tranh an kem mon nhieu muoi/mo. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co dau nanh + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["uong_ruou","on dinh duong huyet","hanh vi"]},{"id":"ex-928","question":"Toi an hang quan nhieu, lam sao giu che do? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot. De phu hop muc tieu giam can, hay uu tien bua sang co tom + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_ngoai_nhieu","giam can","hanh vi"]},{"id":"ex-929","question":"Toi an hang quan nhieu, lam sao giu che do? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot. De phu hop muc tieu tang co, hay uu tien bua sang co dau hu + bong cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_ngoai_nhieu","tang co","hanh vi"]},{"id":"ex-930","question":"Toi an hang quan nhieu, lam sao giu che do? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co sua chua khong duong + ca rot, va theo doi 7-14 ngay de dieu chinh.","tags":["an_ngoai_nhieu","duy tri can nang","hanh vi"]},{"id":"ex-931","question":"Toi an hang quan nhieu, lam sao giu che do? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot. De phu hop muc tieu giam mo, hay uu tien bua toi co sua Hy Lap + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["an_ngoai_nhieu","giam mo","hanh vi"]},{"id":"ex-932","question":"Toi an hang quan nhieu, lam sao giu che do? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"uu tien mon hap/luoc, them rau, yeu cau giam sot va kiem soat khau phan tinh bot. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co thit lon nac + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["an_ngoai_nhieu","on dinh duong huyet","hanh vi"]},{"id":"ex-933","question":"Toi hay an theo cam xuc khi stress, co cach nao khong? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an. De phu hop muc tieu giam can, hay uu tien bua sang co ca thu + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["stress","giam can","hanh vi"]},{"id":"ex-934","question":"Toi hay an theo cam xuc khi stress, co cach nao khong? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an. De phu hop muc tieu tang co, hay uu tien bua sang co bo nac + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["stress","tang co","hanh vi"]},{"id":"ex-935","question":"Toi hay an theo cam xuc khi stress, co cach nao khong? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co trung ga + nam, va theo doi 7-14 ngay de dieu chinh.","tags":["stress","duy tri can nang","hanh vi"]},{"id":"ex-936","question":"Toi hay an theo cam xuc khi stress, co cach nao khong? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an. De phu hop muc tieu giam mo, hay uu tien bua toi co tom + rau tron, va theo doi 7-14 ngay de dieu chinh.","tags":["stress","giam mo","hanh vi"]},{"id":"ex-937","question":"Toi hay an theo cam xuc khi stress, co cach nao khong? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"dung 5 phut de tach cam xuc va con doi that, thu di bo ngan truoc khi quyet dinh an. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co dau hu + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["stress","on dinh duong huyet","hanh vi"]},{"id":"ex-938","question":"Toi khong duy tri duoc nhat ky an uong, lam sao de de hon? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan. De phu hop muc tieu giam can, hay uu tien bua sang co bo nac + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["khong_theo_doi","giam can","hanh vi"]},{"id":"ex-939","question":"Toi khong duy tri duoc nhat ky an uong, lam sao de de hon? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan. De phu hop muc tieu tang co, hay uu tien bua sang co trung ga + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["khong_theo_doi","tang co","hanh vi"]},{"id":"ex-940","question":"Toi khong duy tri duoc nhat ky an uong, lam sao de de hon? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co tom + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["khong_theo_doi","duy tri can nang","hanh vi"]},{"id":"ex-941","question":"Toi khong duy tri duoc nhat ky an uong, lam sao de de hon? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan. De phu hop muc tieu giam mo, hay uu tien bua toi co dau hu + nam, va theo doi 7-14 ngay de dieu chinh.","tags":["khong_theo_doi","giam mo","hanh vi"]},{"id":"ex-942","question":"Toi khong duy tri duoc nhat ky an uong, lam sao de de hon? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"ghi nhanh ngay sau bua an, bat dau tu 1-2 bua moi ngay roi nang dan. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co sua chua khong duong + rau tron, va theo doi 7-14 ngay de dieu chinh.","tags":["khong_theo_doi","on dinh duong huyet","hanh vi"]},{"id":"ex-943","question":"Toi co thoi quen an man, cach giam tu tu? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi. De phu hop muc tieu giam can, hay uu tien bua sang co uc ga + dua leo, va theo doi 7-14 ngay de dieu chinh.","tags":["an_man","giam can","hanh vi"]},{"id":"ex-944","question":"Toi co thoi quen an man, cach giam tu tu? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi. De phu hop muc tieu tang co, hay uu tien bua sang co ca hoi + ca chua, va theo doi 7-14 ngay de dieu chinh.","tags":["an_man","tang co","hanh vi"]},{"id":"ex-945","question":"Toi co thoi quen an man, cach giam tu tu? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co ca thu + rau bina, va theo doi 7-14 ngay de dieu chinh.","tags":["an_man","duy tri can nang","hanh vi"]},{"id":"ex-946","question":"Toi co thoi quen an man, cach giam tu tu? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi. De phu hop muc tieu giam mo, hay uu tien bua toi co bo nac + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["an_man","giam mo","hanh vi"]},{"id":"ex-947","question":"Toi co thoi quen an man, cach giam tu tu? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"giam dan gia vi man, su dung rau thom va gia vi tu nhien de tao vi. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co trung ga + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["an_man","on dinh duong huyet","hanh vi"]},{"id":"ex-948","question":"Toi an rat it rau, nen bat dau the nao? Neu muc tieu cua toi la giam can thi uu tien gi?","answer":"them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay. De phu hop muc tieu giam can, hay uu tien bua sang co sua Hy Lap + bi do, va theo doi 7-14 ngay de dieu chinh.","tags":["an_it_rau","giam can","hanh vi"]},{"id":"ex-949","question":"Toi an rat it rau, nen bat dau the nao? Neu muc tieu cua toi la tang co thi uu tien gi?","answer":"them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay. De phu hop muc tieu tang co, hay uu tien bua sang co thit lon nac + rau muong, va theo doi 7-14 ngay de dieu chinh.","tags":["an_it_rau","tang co","hanh vi"]},{"id":"ex-950","question":"Toi an rat it rau, nen bat dau the nao? Neu muc tieu cua toi la duy tri can nang thi uu tien gi?","answer":"them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay. De phu hop muc tieu duy tri can nang, hay uu tien bua trua co ca basa + nam, va theo doi 7-14 ngay de dieu chinh.","tags":["an_it_rau","duy tri can nang","hanh vi"]},{"id":"ex-951","question":"Toi an rat it rau, nen bat dau the nao? Neu muc tieu cua toi la giam mo thi uu tien gi?","answer":"them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay. De phu hop muc tieu giam mo, hay uu tien bua toi co dau nanh + rau tron, va theo doi 7-14 ngay de dieu chinh.","tags":["an_it_rau","giam mo","hanh vi"]},{"id":"ex-952","question":"Toi an rat it rau, nen bat dau the nao? Neu muc tieu cua toi la on dinh duong huyet thi uu tien gi?","answer":"them rau vao moi bua voi muc tieu toi thieu 2 nam tay rau moi ngay. De phu hop muc tieu on dinh duong huyet, hay uu tien bua sang co uc ga + rau cai xanh, va theo doi 7-14 ngay de dieu chinh.","tags":["an_it_rau","on dinh duong huyet","hanh vi"]},{"id":"ex-953","question":"Khi nao thi toi can di kham thay vi tiep tuc hoi chatbot?","answer":"Neu co dau nguc, kho tho, ngat, choang nang, non lien tuc, sot cao keo dai, hoac duong huyet/huyet ap bat thuong, can di kham ngay. Chatbot khong thay the chan doan y khoa.","tags":["an toan","canh bao y te"]},{"id":"ex-954","question":"Chatbot co the thay bac si de ke don khong?","answer":"Khong. Chatbot chi ho tro giao duc suc khoe va goi y dinh duong tong quat. Moi thuoc hoac dieu tri benh can do bac si quyet dinh.","tags":["an toan","gioi han"]},{"id":"ex-955","question":"Toi dang mang thai, co nen tu y an kieng theo chatbot?","answer":"Khong nen tu y an kieng muc qua chat trong thai ky. Can trao doi bac si/chan doan dinh duong de co phac do phu hop.","tags":["thai ky","an toan"]},{"id":"ex-956","question":"Toi co benh nen, chatbot tu van den muc nao?","answer":"Chatbot co the goi y nguyen tac an uong an toan, nhung van can bac si theo doi de ca nhan hoa theo xet nghiem va thuoc dang dung.","tags":["benh nen","an toan"]},{"id":"ex-957","question":"Toi dang giam can, bua sang co uc ga nen sap xep the nao? (phien ban mo rong 1)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an uc ga + dua leo + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-958","question":"Toi dang giam can, bua sang co ca hoi nen sap xep the nao? (phien ban mo rong 2)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca hoi + rau bina + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-959","question":"Toi dang giam can, bua sang co ca thu nen sap xep the nao? (phien ban mo rong 3)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca thu + bi do + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-960","question":"Toi dang giam can, bua sang co bo nac nen sap xep the nao? (phien ban mo rong 4)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an bo nac + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-961","question":"Toi dang giam can, bua sang co trung ga nen sap xep the nao? (phien ban mo rong 5)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an trung ga + rau cai xanh + bun gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-962","question":"Toi dang giam can, bua sang co tom nen sap xep the nao? (phien ban mo rong 6)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an tom + bi do + mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-963","question":"Toi dang giam can, bua sang co dau hu nen sap xep the nao? (phien ban mo rong 7)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an dau hu + rau cai xanh + ngo luoc voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-964","question":"Toi dang giam can, bua sang co sua chua khong duong nen sap xep the nao? (phien ban mo rong 8)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an sua chua khong duong + rau bina + dau do voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-965","question":"Toi dang giam can, bua sang co sua Hy Lap nen sap xep the nao? (phien ban mo rong 9)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an sua Hy Lap + bi do + com gao lut voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-966","question":"Toi dang giam can, bua sang co thit lon nac nen sap xep the nao? (phien ban mo rong 10)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an thit lon nac + rau tron + khoai lang voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-967","question":"Toi dang giam can, bua sang co ca basa nen sap xep the nao? (phien ban mo rong 11)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an ca basa + rau bina + banh mi nguyen cam voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-968","question":"Toi dang giam can, bua sang co dau nanh nen sap xep the nao? (phien ban mo rong 12)","answer":"Voi muc tieu giam can, bua sang (bat dau ngay moi) co the an dau nanh + rau muong + yach mach voi khau phan khoi luong vua du de tinh tao. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua sang","protein"]},{"id":"ex-969","question":"Toi dang giam can, bua trua co uc ga nen sap xep the nao? (phien ban mo rong 13)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an uc ga + rau bina + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-970","question":"Toi dang giam can, bua trua co ca hoi nen sap xep the nao? (phien ban mo rong 14)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca hoi + rau muong + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-971","question":"Toi dang giam can, bua trua co ca thu nen sap xep the nao? (phien ban mo rong 15)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca thu + nam + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-972","question":"Toi dang giam can, bua trua co bo nac nen sap xep the nao? (phien ban mo rong 16)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an bo nac + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-973","question":"Toi dang giam can, bua trua co trung ga nen sap xep the nao? (phien ban mo rong 17)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an trung ga + ca rot + com gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-974","question":"Toi dang giam can, bua trua co tom nen sap xep the nao? (phien ban mo rong 18)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an tom + nam + khoai lang voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-975","question":"Toi dang giam can, bua trua co dau hu nen sap xep the nao? (phien ban mo rong 19)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an dau hu + ca rot + banh mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-976","question":"Toi dang giam can, bua trua co sua chua khong duong nen sap xep the nao? (phien ban mo rong 20)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an sua chua khong duong + rau muong + yach mach voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-977","question":"Toi dang giam can, bua trua co sua Hy Lap nen sap xep the nao? (phien ban mo rong 21)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an sua Hy Lap + nam + bun gao lut voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-978","question":"Toi dang giam can, bua trua co thit lon nac nen sap xep the nao? (phien ban mo rong 22)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an thit lon nac + bong cai xanh + mi nguyen cam voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-979","question":"Toi dang giam can, bua trua co ca basa nen sap xep the nao? (phien ban mo rong 23)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an ca basa + rau muong + ngo luoc voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-980","question":"Toi dang giam can, bua trua co dau nanh nen sap xep the nao? (phien ban mo rong 24)","answer":"Voi muc tieu giam can, bua trua (duy tri nang luong buoi chieu) co the an dau nanh + rau tron + dau do voi khau phan day du dam, rau va tinh bot hop ly. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua trua","protein"]},{"id":"ex-981","question":"Toi dang giam can, bua toi co uc ga nen sap xep the nao? (phien ban mo rong 25)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an uc ga + bi do + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-982","question":"Toi dang giam can, bua toi co ca hoi nen sap xep the nao? (phien ban mo rong 26)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca hoi + nam + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-983","question":"Toi dang giam can, bua toi co ca thu nen sap xep the nao? (phien ban mo rong 27)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca thu + rau tron + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-984","question":"Toi dang giam can, bua toi co bo nac nen sap xep the nao? (phien ban mo rong 28)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an bo nac + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-985","question":"Toi dang giam can, bua toi co trung ga nen sap xep the nao? (phien ban mo rong 29)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an trung ga + dua leo + bun gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-986","question":"Toi dang giam can, bua toi co tom nen sap xep the nao? (phien ban mo rong 30)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an tom + rau tron + mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-987","question":"Toi dang giam can, bua toi co dau hu nen sap xep the nao? (phien ban mo rong 31)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an dau hu + dua leo + ngo luoc voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-988","question":"Toi dang giam can, bua toi co sua chua khong duong nen sap xep the nao? (phien ban mo rong 32)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an sua chua khong duong + nam + dau do voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-989","question":"Toi dang giam can, bua toi co sua Hy Lap nen sap xep the nao? (phien ban mo rong 33)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an sua Hy Lap + rau tron + com gao lut voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-990","question":"Toi dang giam can, bua toi co thit lon nac nen sap xep the nao? (phien ban mo rong 34)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an thit lon nac + ca rot + khoai lang voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-991","question":"Toi dang giam can, bua toi co ca basa nen sap xep the nao? (phien ban mo rong 35)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an ca basa + nam + banh mi nguyen cam voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-992","question":"Toi dang giam can, bua toi co dau nanh nen sap xep the nao? (phien ban mo rong 36)","answer":"Voi muc tieu giam can, bua toi (truoc gio ngu) co the an dau nanh + rau cai xanh + yach mach voi khau phan giam chat beo va tinh bot qua nhieu. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua toi","protein"]},{"id":"ex-993","question":"Toi dang giam can, bua phu sang co uc ga nen sap xep the nao? (phien ban mo rong 37)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an uc ga + dua leo + bun gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-994","question":"Toi dang giam can, bua phu sang co ca hoi nen sap xep the nao? (phien ban mo rong 38)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an ca hoi + rau bina + mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-995","question":"Toi dang giam can, bua phu sang co ca thu nen sap xep the nao? (phien ban mo rong 39)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an ca thu + bi do + ngo luoc voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-996","question":"Toi dang giam can, bua phu sang co bo nac nen sap xep the nao? (phien ban mo rong 40)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an bo nac + rau muong + dau do voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-997","question":"Toi dang giam can, bua phu sang co trung ga nen sap xep the nao? (phien ban mo rong 41)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an trung ga + rau cai xanh + com gao lut voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-998","question":"Toi dang giam can, bua phu sang co tom nen sap xep the nao? (phien ban mo rong 42)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an tom + bi do + khoai lang voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-999","question":"Toi dang giam can, bua phu sang co dau hu nen sap xep the nao? (phien ban mo rong 43)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an dau hu + rau cai xanh + banh mi nguyen cam voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]},{"id":"ex-1000","question":"Toi dang giam can, bua phu sang co sua chua khong duong nen sap xep the nao? (phien ban mo rong 44)","answer":"Voi muc tieu giam can, bua phu sang (giua sang) co the an sua chua khong duong + rau bina + yach mach voi khau phan nhe, de tieu va giau chat xo. Ban can giu tham hut 300-500 kcal/ngay, uu tien dam nac va rau xanh va kiem soat tinh bot vao bua toi va tang van dong hang ngay. Ban co the ca nhan hoa them theo can nang, lich tap va benh nen hien tai.","tags":["giam can","bua phu sang","protein"]}]	ai	2026-04-15 06:15:07.938	2026-04-15 09:12:13.241
1022	hydration:2026-04-21:2	{"dateKey":"2026-04-21","totalMl":1000,"logs":[{"amountMl":250,"loggedAt":"2026-04-21T02:07:05.108Z"},{"amountMl":250,"loggedAt":"2026-04-21T02:07:05.295Z"},{"amountMl":250,"loggedAt":"2026-04-21T02:07:05.453Z"},{"amountMl":250,"loggedAt":"2026-04-21T02:07:05.634Z"}]}	hydration	2026-04-21 02:07:05.112	2026-04-21 02:07:05.636
514	hydration:2026-04-20:16	{"dateKey":"2026-04-20","totalMl":1500,"logs":[{"amountMl":250,"loggedAt":"2026-04-20T02:06:00.391Z"},{"amountMl":250,"loggedAt":"2026-04-20T02:06:01.168Z"},{"amountMl":250,"loggedAt":"2026-04-20T06:24:44.568Z"},{"amountMl":250,"loggedAt":"2026-04-20T06:24:44.694Z"},{"amountMl":250,"loggedAt":"2026-04-20T06:24:44.890Z"},{"amountMl":250,"loggedAt":"2026-04-20T06:24:45.121Z"}]}	hydration	2026-04-20 02:06:00.399	2026-04-20 06:24:45.127
23	max_meals_per_day	5	general	2026-04-08 07:51:47.695	2026-04-08 07:51:53.848
1458	active_user:2	1778481398317	runtime	2026-05-11 06:20:05.446	2026-05-11 06:36:38.319
399	hydration:2026-04-15:16	{"dateKey":"2026-04-15","totalMl":250,"logs":[{"amountMl":250,"loggedAt":"2026-04-15T04:12:13.960Z"}]}	hydration	2026-04-15 04:12:13.967	2026-04-15 04:12:13.967
61	week_start_day	Monday	general	2026-04-09 07:17:04.231	2026-04-09 07:18:02.956
1435	hydration:2026-05-09:2	{"dateKey":"2026-05-09","totalMl":500,"logs":[{"amountMl":250,"loggedAt":"2026-05-09T08:02:50.785Z"},{"amountMl":250,"loggedAt":"2026-05-09T08:02:51.075Z"}]}	hydration	2026-05-09 08:02:50.791	2026-05-09 08:02:51.081
\.


--
-- Data for Name: user_goals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_goals (id, "userId", "goalType", "targetWeight", "targetCalories", "targetProtein", "targetFat", "targetCarbs", "startDate", "endDate", "isActive") FROM stdin;
1	1	MAINTENANCE	64.52020416048252	2396	172	46	226	2025-02-27 17:43:59.34	\N	t
2	2	WEIGHT_LOSS	77.66903404468427	2210	165	51	220	2025-01-22 14:31:46.39	\N	t
4	4	WEIGHT_GAIN	57.94027680151999	2033	170	64	257	2025-01-17 12:08:56.754	\N	t
5	5	MAINTENANCE	61.68307498841456	2341	153	68	278	2025-01-17 19:33:19.018	\N	t
6	6	MUSCLE_GAIN	58.89607415520113	2087	121	44	249	2025-01-25 20:57:35.178	\N	t
7	7	WEIGHT_GAIN	70.90011938214589	2189	164	49	259	2025-01-30 23:56:12.876	\N	t
8	8	WEIGHT_GAIN	52.76835386169032	2442	151	58	273	2025-02-07 01:05:31.042	\N	t
9	9	WEIGHT_GAIN	79.53671742924237	2303	168	54	231	2025-02-14 07:19:02.221	\N	t
10	10	WEIGHT_GAIN	76.43859779526659	2346	163	46	253	2025-02-19 04:40:13.477	\N	t
11	11	WEIGHT_GAIN	59.62369564054791	2160	167	43	241	2025-01-29 22:57:30.506	\N	t
12	12	WEIGHT_LOSS	62.57398778165526	1962	142	50	272	2025-02-21 14:29:49.078	\N	t
13	13	WEIGHT_LOSS	65.98260450747564	2029	175	61	217	2025-02-08 15:00:37.342	\N	t
14	14	MUSCLE_GAIN	73.67088510940616	1859	165	64	221	2025-02-24 16:10:04.901	\N	t
15	15	MUSCLE_GAIN	69.56009420210923	2281	173	45	224	2025-02-22 05:13:52.283	\N	t
16	16	MAINTENANCE	54	2000	150	55	250	2026-04-20 02:04:56.206	\N	t
3	3	WEIGHT_LOSS	66.21451449409406	2097	143	48	254	2025-02-18 05:53:54.048	\N	t
\.


--
-- Data for Name: user_health_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_health_metrics (id, "userId", weight, height, "bodyFat", "bloodPressure", "recordedAt") FROM stdin;
1	1	91.60429539636478	167.4073576373555	29.71440862732299	121/61	2025-07-30 23:52:34.196
2	1	95.8494306941956	180.7364481163611	27.41671315364503	120/64	2025-05-23 06:48:05.571
3	1	91.18221235008372	155.8803498057942	20.37494770817137	102/74	2025-11-21 00:43:03.555
4	1	48.46719352447107	177.8753903817283	27.76477159145089	112/72	2025-05-20 07:42:26.475
5	1	76.69798773914859	168.345363952061	21.24602654081763	114/60	2025-03-15 18:35:14.55
6	2	86.77081311174732	153.1688128146615	11.12433634985993	112/82	2025-12-31 23:01:34.474
7	2	85.49549499654245	166.7607455998827	29.68667072029695	109/82	2025-01-07 15:08:16.308
8	2	90.7110309376391	182.2110466881914	10.58882979139431	104/73	2025-08-11 20:44:40.701
9	2	74.64013384709574	167.360399311875	29.93637824207914	128/76	2025-12-11 03:15:16.661
10	2	90.18578097875682	175.0420656242225	27.58216279647319	114/78	2025-08-22 00:10:26.421
11	3	51.65746014522075	173.5293176425575	23.56174981213468	124/76	2025-06-01 18:20:31.939
12	3	69.32052269063762	187.1664466096059	16.99861320822974	118/85	2025-06-15 17:24:17.221
13	3	60.40442906059938	153.6317779978721	10.57868800959162	121/66	2025-09-25 14:55:25.839
14	4	91.37668037483385	155.937025031001	17.83030888159813	122/87	2025-12-31 14:37:20.449
15	4	68.99831347400857	181.5285082914856	25.99358658118284	126/87	2025-07-16 08:01:45.349
16	4	58.07397607042279	160.9137967990072	24.41599549279008	129/84	2025-04-08 00:02:22.566
17	4	47.68354688390905	183.7643570001685	21.00344025247531	101/80	2025-05-04 17:16:46.15
18	5	66.1673165033055	181.9466386625185	17.41296038096914	121/71	2026-02-04 12:07:15.001
19	5	75.10033322511404	153.836575920837	11.56504750832905	106/86	2025-07-30 23:18:39.369
20	5	85.83320363006185	183.0340580700546	16.90867711826975	100/61	2025-04-03 08:39:12.276
21	6	52.34429866072005	176.2837301747642	13.58034290184689	107/89	2025-11-11 05:36:08.324
22	6	81.3941496390614	153.9177184932221	25.38153518534572	118/60	2025-11-23 09:35:15.604
23	6	85.20818389458819	180.2078524103413	22.81217539263782	125/64	2025-03-11 15:30:42.491
24	7	90.35071278985396	163.4819536386726	21.68884769783534	125/68	2025-07-20 08:27:49.699
25	7	68.4264874187408	179.6571767245442	14.78442890545955	124/69	2025-10-18 09:51:59.321
26	7	63.00386920085033	177.3874014206697	18.17061085364209	116/86	2025-06-29 13:11:58.845
27	8	73.11160067776618	151.8184698561693	20.49449457960633	118/73	2026-01-10 09:07:33.363
28	8	51.98562543735993	153.9634035159402	24.10386932409454	109/85	2025-02-22 04:20:34.006
29	8	70.33966695537876	163.3105480273429	12.33839807274152	116/80	2025-11-02 17:37:51.951
30	9	66.75342067326355	175.4053616807002	12.17447485823907	126/64	2025-09-03 10:16:22.984
31	9	84.26838043348626	171.5435682137879	19.15795633681803	116/60	2025-03-08 23:33:49.622
32	9	80.75783064513536	153.7115506266618	22.32967894986454	102/60	2026-03-26 19:21:23.37
33	10	50.2037163861658	180.5584979367158	13.23662030300172	124/80	2026-01-29 08:46:25.855
34	10	85.04272882058581	156.0988344075447	29.19525005722125	124/75	2025-03-30 00:38:02.043
35	10	54.40018513541503	169.1883391504185	21.6030401507386	115/70	2025-02-17 14:26:54.138
36	10	87.11352212935616	151.2166874363937	15.75129399367772	105/62	2026-01-30 10:34:49.815
37	11	52.64438777942532	164.7064447802803	24.66718858306238	113/81	2025-11-11 19:25:26.668
38	11	91.90280605148047	174.2527624911813	12.82895659379734	128/66	2025-06-07 20:01:57.218
39	11	70.97562873327405	156.1673718437375	28.07676487598155	127/79	2025-02-27 00:51:43.227
40	11	59.34652417402182	157.4016449290466	18.05228958406955	108/85	2025-10-06 21:04:12.304
41	12	80.7015848097202	167.9121278962851	29.52345651958511	129/72	2025-10-29 11:46:15.049
42	12	81.5655656586031	176.1615641827664	15.90066975777511	120/81	2025-01-17 20:37:04.615
43	12	51.26402947595419	155.0536165563896	16.19037734623296	115/87	2026-03-22 03:52:47.315
44	12	86.67998165997975	183.209142119872	19.39947469952071	119/89	2025-05-13 00:32:27.784
45	12	72.42375952692127	173.8479456004875	12.32925648647048	125/60	2025-05-25 00:13:13.329
46	13	70.2472181441084	157.6599072652187	14.56896423354486	122/87	2026-01-18 07:27:48.121
47	13	58.64308963306458	181.93540170092	24.85534501989336	121/87	2025-09-06 05:51:53.268
48	13	47.53550381422206	165.2149385828664	17.03622624967156	106/74	2025-02-02 12:30:39.688
49	13	94.57011094542128	162.3435341277226	18.27351512040534	113/64	2025-03-10 02:27:41.671
50	13	61.32823810257175	154.3301508254855	26.87231183291214	111/73	2026-02-07 20:28:55.161
51	14	64.12828828468609	168.3577148010629	27.57418107731845	119/89	2025-07-29 06:10:25.646
52	14	50.17808039416937	159.2642085080246	19.15931782151013	127/73	2025-04-06 19:18:35.851
53	14	89.38921509758347	173.6227723394913	18.86009969617438	121/81	2025-03-22 05:24:55.186
54	14	72.47400284494731	159.3670816854435	15.01531366375488	124/72	2025-11-20 15:38:05.874
55	14	63.57139264897089	165.6071163368377	15.4054819106739	109/72	2026-03-30 04:02:04.679
56	15	48.35856841174588	173.6928421967088	10.13429784899784	114/68	2025-07-15 18:02:29.653
57	15	65.45804159769884	155.0404075481991	25.02764641429424	108/60	2025-07-26 21:47:34.509
58	15	58.16019122366605	164.3672803836466	26.40458277691614	110/60	2026-02-02 13:54:26.557
59	15	91.71647798840536	176.6730579639314	25.36147765250688	128/61	2026-03-25 01:43:53.725
60	15	57.55828716335353	172.3493542853255	18.8463086286035	110/75	2025-02-19 17:22:27.74
61	16	55	155	\N	\N	2026-04-20 02:04:56.192
62	3	87.54648937443974	159.2294728877467	\N	\N	2026-04-21 09:50:06.135
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_profiles (id, "userId", "fullName", avatar, gender, "dateOfBirth", height, weight, "activityLevel", "dietaryPref", allergies, "targetCalories", "targetProtein", "targetFat", "targetCarbs", "createdAt", "updatedAt") FROM stdin;
1	1	Hoang Thi	\N	FEMALE	1984-01-06 15:37:16.736	163.8796692042935	59.04139225890115	ACTIVE	{}	{peanut,seafood}	2220	155	61	258	2026-04-07 03:45:42.117	2026-04-07 03:45:42.117
2	2	Hoang Hang	\N	MALE	2002-04-17 14:28:36.122	168.178358967655	99.21978453011877	LIGHT	{}	{}	2452	161	57	231	2026-04-07 03:45:42.161	2026-04-07 03:45:42.161
4	4	Phan Bao	\N	MALE	2001-06-28 19:33:21.728	184.9283845294769	97.46569194951012	VERY_ACTIVE	{}	{peanut,seafood}	1859	173	44	230	2026-04-07 03:45:42.18	2026-04-07 03:45:42.18
5	5	Ho Duc	\N	FEMALE	1995-07-02 21:21:24.054	175.7943402975816	81.59026519541398	LIGHT	{}	{peanut,seafood}	2214	166	40	242	2026-04-07 03:45:42.189	2026-04-07 03:45:42.189
6	6	Nguyen Duc	\N	MALE	1988-07-19 07:44:25.187	153.6314254697124	54.50336376712088	MODERATE	{}	{}	1813	123	62	210	2026-04-07 03:45:42.207	2026-04-07 03:45:42.207
7	7	Ly Minh	\N	FEMALE	1990-05-22 21:21:14.216	185.5390913655061	78.67833193443904	MODERATE	{}	{}	1950	135	65	216	2026-04-07 03:45:42.224	2026-04-07 03:45:42.224
8	8	Hoang Minh	\N	MALE	2004-11-09 21:33:05.756	150.6951431069407	88.20906712362438	SEDENTARY	{}	{}	2093	148	41	272	2026-04-07 03:45:42.245	2026-04-07 03:45:42.245
9	9	Bui Tuan	\N	FEMALE	1985-08-31 13:02:40.479	160.876657874157	86.50376152651299	LIGHT	{}	{}	1920	136	63	230	2026-04-07 03:45:42.257	2026-04-07 03:45:42.257
10	10	Ly Bao	\N	MALE	1980-09-14 22:45:30.883	186.0568595520533	82.99923150889857	ACTIVE	{}	{}	2378	157	60	225	2026-04-07 03:45:42.277	2026-04-07 03:45:42.277
11	11	Ho Phuong	\N	FEMALE	1985-03-18 08:18:32.134	178.1125108608946	74.12221196458003	LIGHT	{}	{}	2409	156	56	249	2026-04-07 03:45:42.297	2026-04-07 03:45:42.297
12	12	Ho Thanh	\N	MALE	1992-06-09 06:32:16.211	186.6020677163347	61.03525794376051	MODERATE	{}	{peanut,seafood}	2153	127	67	274	2026-04-07 03:45:42.317	2026-04-07 03:45:42.317
13	13	Nguyen Thanh	\N	FEMALE	2004-07-12 05:52:45.756	180.2517821559122	82.97950443537394	SEDENTARY	{}	{peanut,seafood}	2380	136	62	251	2026-04-07 03:45:42.333	2026-04-07 03:45:42.333
14	14	Bui Hoa	\N	MALE	2001-12-04 17:48:54.601	154.1229236785892	53.83949345301962	MODERATE	{}	{}	2185	145	47	211	2026-04-07 03:45:42.349	2026-04-07 03:45:42.349
15	15	Dang Hang	\N	FEMALE	1994-12-17 07:23:40.759	154.8968099382772	96.64895061884066	LIGHT	{}	{"hai san"}	2405	175	43	260	2026-04-07 03:45:42.364	2026-04-07 04:07:36.299
17	16	Le Thi Man	\N	FEMALE	2004-10-28 00:00:00	155	55	LIGHT	{}	{}	2000	150	55	250	2026-04-09 02:43:52.655	2026-04-20 02:04:56.184
3	3	Pham Hang Ha	\N	FEMALE	1986-06-26 00:00:00	159.2294728877467	87.54648937443974	VERY_ACTIVE	{}	{}	2097	143	48	254	2026-04-07 03:45:42.169	2026-04-21 09:50:06.101
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, name, role, "isActive", "createdAt", "updatedAt", "passwordChangedAt") FROM stdin;
4	phan.bao4@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Phan Bao	USER	t	2026-04-07 03:45:42.18	2026-04-07 03:45:42.18	\N
6	nguyen.duc6@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Nguyen Duc	USER	t	2026-04-07 03:45:42.207	2026-04-07 03:45:42.207	\N
7	ly.minh7@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Ly Minh	USER	t	2026-04-07 03:45:42.224	2026-04-07 03:45:42.224	\N
8	hoang.minh8@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Hoang Minh	USER	t	2026-04-07 03:45:42.245	2026-04-07 03:45:42.245	\N
10	ly.bao10@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Ly Bao	USER	t	2026-04-07 03:45:42.277	2026-04-07 03:45:42.277	\N
11	ho.phuong11@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Ho Phuong	USER	t	2026-04-07 03:45:42.297	2026-04-07 03:45:42.297	\N
12	ho.thanh12@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Ho Thanh	USER	t	2026-04-07 03:45:42.317	2026-04-07 03:45:42.317	\N
13	nguyen.thanh13@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Nguyen Thanh	USER	t	2026-04-07 03:45:42.333	2026-04-07 03:45:42.333	\N
14	bui.hoa14@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Bui Hoa	USER	t	2026-04-07 03:45:42.349	2026-04-07 03:45:42.349	\N
5	ho.duc5@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Ho Duc	USER	t	2026-04-07 03:45:42.189	2026-04-07 04:04:31.894	\N
9	bui.tuan9@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Bui Tuan	USER	t	2026-04-07 03:45:42.257	2026-04-07 04:04:37.187	\N
15	dang.hang15@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Dang Hang	USER	t	2026-04-07 03:45:42.364	2026-04-07 04:05:28.672	\N
1	baonguyenphuoc832@gmail.com	$2a$10$ugJzAgThUxyCGeNcLeHWxuv1c0wbqpFTan17QLJI4mXbDkrN8D5pm	Nguyen Phuoc Bao	ADMIN	t	2026-04-07 03:45:42.117	2026-04-15 04:09:07.327	2026-04-15 04:09:07.014
16	manthile28@gmail.com	$2a$10$KE5y60pw1mbTUlTrr4mLzuG4/dhlrZTNnUsyTF37f5.PE7PnZLpMW	Le Thi Man	USER	t	2026-04-09 02:43:52.655	2026-04-20 02:04:56.172	\N
3	pham.hang3@example.com	$2a$10$voR7H8wo..jsuyNq/ZAAUei8D3GCZasureAnF/yJ8/2g0RIwn3Q.C	Pham Hang Ha	USER	t	2026-04-07 03:45:42.169	2026-04-21 09:50:06.053	\N
2	hoang.hang2@example.com	$2a$10$mIJIGS2l9x5qt94QHbXDe.E6zqYOyS.WAkPXK27KucOh3g2yT4rUy	Hoang Hang	MODERATOR	t	2026-04-07 03:45:42.161	2026-05-11 06:39:09.49	2026-05-11 06:39:09.482
\.


--
-- Data for Name: weekly_reports; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.weekly_reports (id, "userId", "weekStart", "weekEnd", "avgCalories", "avgProtein", "avgFat", "avgCarbs", "reportData", "createdAt") FROM stdin;
2	16	2026-04-11 17:00:00	2026-04-18 16:59:59.999	2079	125.6	66	197.9	{"daily": [{"day": "CN", "fat": 0, "date": "2026-04-12", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T2", "fat": 63.05, "date": "2026-04-13", "carbs": 226.35, "meals": 4, "protein": 138.65, "calories": 2062}, {"day": "T3", "fat": 54.7, "date": "2026-04-14", "carbs": 139.4, "meals": 4, "protein": 136.85, "calories": 2078}, {"day": "T4", "fat": 80.2, "date": "2026-04-15", "carbs": 228.05, "meals": 4, "protein": 101.35, "calories": 2096}, {"day": "T5", "fat": 0, "date": "2026-04-16", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T6", "fat": 0, "date": "2026-04-17", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T7", "fat": 0, "date": "2026-04-18", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}], "alerts": ["Rau xanh chua dat tan suat on dinh. Muc tieu toi thieu 2 bua co rau moi ngay."], "target": {"fat": 55, "carbs": 250, "protein": 150, "calories": 2100}, "totals": {"fat": 197.95, "carbs": 593.8, "meals": 12, "protein": 376.85, "calories": 6236, "activeDays": 3}, "average": {"fat": 66, "carbs": 197.9, "protein": 125.6, "calories": 2079}, "bestDay": {"day": "T4", "fat": 80.2, "date": "2026-04-15", "carbs": 228.05, "meals": 4, "protein": 101.35, "calories": 2096}, "worstDay": {"day": "CN", "fat": 0, "date": "2026-04-12", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, "hydration": {"days": 7, "avgMl": 36, "goalMl": 2200, "totalMl": 250}, "dailyHealth": [{"date": "2026-04-12", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan goi y chinh xac."]}, {"date": "2026-04-13", "grade": "A", "score": 96, "stats": {"meals": 4, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."], "mealScores": [{"grade": "A", "score": 100, "alerts": [], "mealId": 269, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 270, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 271, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 100, "alerts": [], "mealId": 272, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Khong co dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-04-14", "grade": "A", "score": 96, "stats": {"meals": 4, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."], "mealScores": [{"grade": "A", "score": 100, "alerts": [], "mealId": 273, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 274, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 275, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 100, "alerts": [], "mealId": 276, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Khong co dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-04-15", "grade": "A", "score": 96, "stats": {"meals": 4, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."], "mealScores": [{"grade": "A", "score": 100, "alerts": [], "mealId": 277, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 278, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 279, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong co dau hieu mon man cao."]}, {"grade": "A", "score": 100, "alerts": [], "mealId": 280, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Khong co dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-04-16", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan goi y chinh xac."]}, {"date": "2026-04-17", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan goi y chinh xac."]}, {"date": "2026-04-18", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan goi y chinh xac."]}], "generatedAt": "2026-04-15T08:52:26.418Z", "healthScore": 96, "recommendations": ["Tang nuoc uong: hien tai trung binh 36ml/ngay, muc tieu 2200ml."]}	2026-04-15 08:52:26.435
3	2	2026-04-18 17:00:00	2026-04-25 16:59:59.999	1283	85.1	36.4	94	{"daily": [{"day": "CN", "fat": 0, "date": "2026-04-19", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T2", "fat": 28.9, "date": "2026-04-20", "carbs": 77.39999999999999, "meals": 3, "protein": 77.9, "calories": 1090}, {"day": "T3", "fat": 43.8, "date": "2026-04-21", "carbs": 110.6, "meals": 3, "protein": 92.3, "calories": 1476}, {"day": "T4", "fat": 0, "date": "2026-04-22", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T5", "fat": 0, "date": "2026-04-23", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T6", "fat": 0, "date": "2026-04-24", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T7", "fat": 0, "date": "2026-04-25", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}], "alerts": [], "target": {"fat": 51, "carbs": 220, "protein": 165, "calories": 2001}, "totals": {"fat": 72.7, "carbs": 188, "meals": 6, "protein": 170.2, "calories": 2566, "activeDays": 2}, "average": {"fat": 36.4, "carbs": 94, "protein": 85.1, "calories": 1283}, "bestDay": {"day": "T3", "fat": 43.8, "date": "2026-04-21", "carbs": 110.6, "meals": 3, "protein": 92.3, "calories": 1476}, "worstDay": {"day": "CN", "fat": 0, "date": "2026-04-19", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, "hydration": {"days": 7, "avgMl": 250, "goalMl": 2200, "totalMl": 1750}, "dailyHealth": [{"date": "2026-04-19", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-04-20", "grade": "A", "score": 90, "stats": {"meals": 3, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."], "mealScores": [{"grade": "A", "score": 100, "alerts": [], "mealId": 289, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 90, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 290, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 24, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "B", "score": 79, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 291, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 132, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-04-21", "grade": "A", "score": 94, "stats": {"meals": 3, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."], "mealScores": [{"grade": "A", "score": 100, "alerts": [], "mealId": 292, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 293, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 294, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-04-22", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-04-23", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-04-24", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-04-25", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}], "generatedAt": "2026-04-21T04:01:44.114Z", "healthScore": 92, "recommendations": ["Tang nuoc uong: hien tai trung binh 250ml/ngay, muc tieu 2200ml."]}	2026-04-21 02:07:23.649
4	2	2026-05-09 17:00:00	2026-05-16 16:59:59.999	2157	145.2	43.2	175.9	{"daily": [{"day": "CN", "fat": 0, "date": "2026-05-10", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T2", "fat": 43.15, "date": "2026-05-11", "carbs": 175.9, "meals": 9, "protein": 145.2, "calories": 2157}, {"day": "T3", "fat": 0, "date": "2026-05-12", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T4", "fat": 0, "date": "2026-05-13", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T5", "fat": 0, "date": "2026-05-14", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T6", "fat": 0, "date": "2026-05-15", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, {"day": "T7", "fat": 0, "date": "2026-05-16", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}], "alerts": [], "target": {"fat": 51, "carbs": 220, "protein": 165, "calories": 2001}, "totals": {"fat": 43.15, "carbs": 175.9, "meals": 9, "protein": 145.2, "calories": 2157, "activeDays": 1}, "average": {"fat": 43.2, "carbs": 175.9, "protein": 145.2, "calories": 2157}, "bestDay": {"day": "T2", "fat": 43.15, "date": "2026-05-11", "carbs": 175.9, "meals": 9, "protein": 145.2, "calories": 2157}, "worstDay": {"day": "CN", "fat": 0, "date": "2026-05-10", "carbs": 0, "meals": 0, "protein": 0, "calories": 0}, "hydration": {"days": 7, "avgMl": 0, "goalMl": 2200, "totalMl": 0}, "dailyHealth": [{"date": "2026-05-10", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-05-11", "grade": "B", "score": 79, "stats": {"meals": 9, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Thieu rau xanh trong bua an.", "Luong calo bua an lech nhieu so voi khung de xuat.", "Ti le bua an co rau xanh thap hon muc khuyen nghi."], "highlights": ["Khong c? dau hieu mon man cao.", "Protein tot cho hoi phuc va co bap."], "mealScores": [{"grade": "A", "score": 94, "alerts": [], "mealId": 310, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 126, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 86, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 311, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 312, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "C", "score": 59, "alerts": ["Thieu rau xanh trong bua an.", "Luong calo bua an lech nhieu so voi khung de xuat."], "mealId": 313, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 385, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}, {"grade": "C", "score": 69, "alerts": ["Thieu rau xanh trong bua an.", "Luong calo bua an lech nhieu so voi khung de xuat."], "mealId": 314, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 346, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}, {"grade": "B", "score": 84, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 315, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 131, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "A", "score": 91, "alerts": ["Thieu rau xanh trong bua an."], "mealId": 316, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 0, "hasVegetable": false}, "positives": ["Protein tot cho hoi phuc va co bap.", "Khong c? dau hieu mon man cao."]}, {"grade": "C", "score": 64, "alerts": ["Thieu rau xanh trong bua an.", "Luong calo bua an lech nhieu so voi khung de xuat."], "mealId": 317, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 285, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}, {"grade": "B", "score": 74, "alerts": ["Thieu rau xanh trong bua an.", "Luong calo bua an lech nhieu so voi khung de xuat."], "mealId": 318, "signals": {"lateNight": false, "saltyRisk": false, "calorieDelta": 246, "hasVegetable": false}, "positives": ["Khong c? dau hieu mon man cao."]}], "recommendations": ["Them 1 phan rau/canh rau cho bua trua va bua toi."]}, {"date": "2026-05-12", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-05-13", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-05-14", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-05-15", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}, {"date": "2026-05-16", "grade": "D", "score": 0, "stats": {"meals": 0, "lateMeals": 0, "saltyMeals": 0, "veggieMeals": 0}, "alerts": ["Chua co du lieu bua an trong ngay."], "highlights": [], "mealScores": [], "recommendations": ["Hay bat dau ghi nhat ky it nhat 2 bua/ngay de nhan gui ? chinh xac."]}], "generatedAt": "2026-05-11T06:24:44.356Z", "healthScore": 79, "recommendations": ["Tang nuoc uong: hien tai trung binh 0ml/ngay, muc tieu 2200ml."]}	2026-05-11 06:24:44.363
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 449, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 201, true);


--
-- Name: chat_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.chat_sessions_id_seq', 45, true);


--
-- Name: daily_nutrition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_nutrition_id_seq', 255, true);


--
-- Name: favorites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.favorites_id_seq', 115, true);


--
-- Name: food_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.food_items_id_seq', 130, true);


--
-- Name: meal_plan_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meal_plan_details_id_seq', 302, true);


--
-- Name: meal_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meal_plans_id_seq', 14, true);


--
-- Name: meals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.meals_id_seq', 318, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 82, true);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 2, true);


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_ingredients_id_seq', 787, true);


--
-- Name: recipe_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_steps_id_seq', 508, true);


--
-- Name: recipe_tools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipe_tools_id_seq', 464, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipes_id_seq', 130, true);


--
-- Name: recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recommendations_id_seq', 80, true);


--
-- Name: review_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.review_replies_id_seq', 1, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reviews_id_seq', 112, true);


--
-- Name: scan_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.scan_history_id_seq', 122, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 1540, true);


--
-- Name: user_goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_goals_id_seq', 16, true);


--
-- Name: user_health_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_health_metrics_id_seq', 62, true);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 21, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


--
-- Name: weekly_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.weekly_reports_id_seq', 4, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: daily_nutrition daily_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition
    ADD CONSTRAINT daily_nutrition_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: food_items food_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_items
    ADD CONSTRAINT food_items_pkey PRIMARY KEY (id);


--
-- Name: meal_plan_details meal_plan_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_details
    ADD CONSTRAINT meal_plan_details_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipe_steps recipe_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT recipe_steps_pkey PRIMARY KEY (id);


--
-- Name: recipe_tools recipe_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_tools
    ADD CONSTRAINT recipe_tools_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recommendations recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT recommendations_pkey PRIMARY KEY (id);


--
-- Name: review_replies review_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT review_replies_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: scan_history scan_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_history
    ADD CONSTRAINT scan_history_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: user_goals user_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);


--
-- Name: user_health_metrics user_health_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_health_metrics
    ADD CONSTRAINT user_health_metrics_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_reports weekly_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT weekly_reports_pkey PRIMARY KEY (id);


--
-- Name: daily_nutrition_userId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "daily_nutrition_userId_date_key" ON public.daily_nutrition USING btree ("userId", date);


--
-- Name: favorites_userId_foodId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "favorites_userId_foodId_key" ON public.favorites USING btree ("userId", "foodId");


--
-- Name: food_items_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX food_items_name_key ON public.food_items USING btree (name);


--
-- Name: food_items_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX food_items_slug_key ON public.food_items USING btree (slug);


--
-- Name: password_reset_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_reset_tokens_expiresAt_idx" ON public.password_reset_tokens USING btree ("expiresAt");


--
-- Name: password_reset_tokens_tokenHash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON public.password_reset_tokens USING btree ("tokenHash");


--
-- Name: password_reset_tokens_userId_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "password_reset_tokens_userId_expiresAt_idx" ON public.password_reset_tokens USING btree ("userId", "expiresAt");


--
-- Name: recipes_foodId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "recipes_foodId_key" ON public.recipes USING btree ("foodId");


--
-- Name: review_replies_reviewId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_replies_reviewId_createdAt_idx" ON public.review_replies USING btree ("reviewId", "createdAt");


--
-- Name: review_replies_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "review_replies_userId_idx" ON public.review_replies USING btree ("userId");


--
-- Name: system_settings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);


--
-- Name: user_profiles_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "user_profiles_userId_key" ON public.user_profiles USING btree ("userId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_sessionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES public.chat_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: daily_nutrition daily_nutrition_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition
    ADD CONSTRAINT "daily_nutrition_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites favorites_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "favorites_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: favorites favorites_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meal_plan_details meal_plan_details_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_details
    ADD CONSTRAINT "meal_plan_details_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meal_plan_details meal_plan_details_mealPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_details
    ADD CONSTRAINT "meal_plan_details_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES public.meal_plans(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT "meal_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meals meals_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT "meals_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meals meals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT "meals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipe_steps recipe_steps_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_steps
    ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipe_tools recipe_tools_recipeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_tools
    ADD CONSTRAINT "recipe_tools_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipes recipes_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT "recipes_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recommendations recommendations_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT "recommendations_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recommendations recommendations_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendations
    ADD CONSTRAINT "recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_replies review_replies_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT "review_replies_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.reviews(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: review_replies review_replies_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_replies
    ADD CONSTRAINT "review_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_foodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES public.food_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: scan_history scan_history_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scan_history
    ADD CONSTRAINT "scan_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_goals user_goals_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT "user_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_health_metrics user_health_metrics_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_health_metrics
    ADD CONSTRAINT "user_health_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: weekly_reports weekly_reports_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_reports
    ADD CONSTRAINT "weekly_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict d8cNMOZD2OxcAYB1o9EaztHCbeyCaLbhZrg3Jn7heMWsdsBReLlKRzAqzVjJCGl

