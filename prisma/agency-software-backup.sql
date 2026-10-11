--
-- PostgreSQL database dump
--

\restrict cfItQN1IN0511XdhQVtQjcFHX1K4O9E3C2U9XVrsT0RWRJbuKpYDbQ3LR7aHsHA

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'NEW',
    'CONTACTED',
    'PROPOSAL_SENT',
    'WON',
    'LOST'
);


--
-- Name: LeadType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadType" AS ENUM (
    'CONTACT',
    'INQUIRY',
    'AUDIT',
    'NEWSLETTER',
    'CONSULTATION'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EDITOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Application" (
    id text NOT NULL,
    "careerId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    resume text,
    cover text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Blog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Blog" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    thumbnail text,
    category text,
    tags text[] DEFAULT ARRAY[]::text[],
    published boolean DEFAULT true NOT NULL,
    "authorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Career; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Career" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    department text NOT NULL,
    location text NOT NULL,
    type text DEFAULT 'Full-time'::text NOT NULL,
    salary text,
    description text NOT NULL,
    requirements text[] DEFAULT ARRAY[]::text[],
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Lead; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Lead" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    service text,
    budget text,
    message text,
    "projectType" text,
    deadline text,
    requirements text,
    type public."LeadType" DEFAULT 'CONTACT'::public."LeadType" NOT NULL,
    status public."LeadStatus" DEFAULT 'NEW'::public."LeadStatus" NOT NULL,
    "assignedToId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Newsletter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Newsletter" (
    id text NOT NULL,
    email text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Portfolio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Portfolio" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDesc" text,
    thumbnail text NOT NULL,
    gallery text[] DEFAULT ARRAY[]::text[],
    technologies text[] DEFAULT ARRAY[]::text[],
    category text NOT NULL,
    "liveUrl" text,
    challenge text,
    solution text,
    results text,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Service" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    "shortDesc" text,
    icon text,
    image text,
    features text[] DEFAULT ARRAY[]::text[],
    process jsonb,
    pricing jsonb,
    faqs jsonb,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Settings" (
    id text DEFAULT 'default'::text NOT NULL,
    "companyName" text DEFAULT 'Nexus Digital'::text NOT NULL,
    tagline text,
    email text,
    phone text,
    address text,
    logo text,
    favicon text,
    "socialTwitter" text,
    "socialLinkedin" text,
    "socialInstagram" text,
    "socialFacebook" text,
    "socialYoutube" text,
    "calendlyUrl" text,
    "seoTitle" text,
    "seoDescription" text,
    "seoKeywords" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamMember" (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image text,
    linkedin text,
    twitter text,
    "order" integer DEFAULT 0 NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Testimonial; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Testimonial" (
    id text NOT NULL,
    "clientName" text NOT NULL,
    company text,
    role text,
    image text,
    rating integer DEFAULT 5 NOT NULL,
    review text NOT NULL,
    "videoUrl" text,
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'EDITOR'::public."Role" NOT NULL,
    avatar text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: Application; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Application" (id, "careerId", name, email, phone, resume, cover, "createdAt") FROM stdin;
\.


--
-- Data for Name: Blog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Blog" (id, title, slug, content, excerpt, thumbnail, category, tags, published, "authorId", "createdAt", "updatedAt") FROM stdin;
cmqa1k78t000lp89zt66miilg	10 Web Development Trends for 2025	web-development-trends-2025	<h2>The Future of Web Development</h2><p>The web development landscape is evolving rapidly. Here are the top trends to watch in 2025.</p><h3>1. AI-Powered Development</h3><p>AI tools are revolutionizing how we write code, debug, and optimize applications.</p><h3>2. Server Components</h3><p>React Server Components are changing how we think about rendering and performance.</p><h3>3. Edge Computing</h3><p>Deploying closer to users for faster response times and better experiences.</p>	Discover the latest trends shaping the future of web development.	https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80	Web Development	{trends,"web development",2025}	t	cmqa1k77h0000p89znj8dzlno	2026-06-11 22:00:34.733	2026-06-11 22:00:34.733
cmqa1k78x000np89zx699ko3q	How AI is Transforming Digital Marketing	ai-transforming-digital-marketing	<h2>AI in Marketing</h2><p>Artificial intelligence is no longer a futuristic concept—it's transforming marketing today.</p><p>From personalized content to predictive analytics, AI enables marketers to deliver better results with less effort.</p>	Learn how artificial intelligence is reshaping marketing strategies.	https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80	Digital Marketing	{AI,marketing,automation}	t	cmqa1k77h0000p89znj8dzlno	2026-06-11 22:00:34.737	2026-06-11 22:00:34.737
\.


--
-- Data for Name: Career; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Career" (id, title, slug, department, location, type, salary, description, requirements, published, "createdAt", "updatedAt") FROM stdin;
cmqa1k78y000op89zi158kzsp	Senior Full-Stack Developer	senior-fullstack-developer	Engineering	Remote	Full-time	$120,000 - $160,000	We're looking for an experienced full-stack developer to join our growing team. You'll work on challenging projects using Next.js, Node.js, and PostgreSQL.	{"5+ years experience","Next.js & React expertise","TypeScript proficiency","Strong communication skills"}	t	2026-06-11 22:00:34.739	2026-06-11 22:00:34.739
cmqa1k791000pp89zdq6rh3v6	UI/UX Designer	ui-ux-designer	Design	San Francisco, CA	Full-time	$90,000 - $130,000	Join our design team to create beautiful, user-centered digital experiences for clients across industries.	{"3+ years UI/UX experience","Figma proficiency","Portfolio required","Agency experience preferred"}	t	2026-06-11 22:00:34.742	2026-06-11 22:00:34.742
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lead" (id, name, email, phone, company, service, budget, message, "projectType", deadline, requirements, type, status, "assignedToId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Newsletter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Newsletter" (id, email, "createdAt") FROM stdin;
\.


--
-- Data for Name: Portfolio; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Portfolio" (id, title, slug, description, "shortDesc", thumbnail, gallery, technologies, category, "liveUrl", challenge, solution, results, featured, published, "createdAt", "updatedAt") FROM stdin;
cmqa1k7880007p89z5c06xvnc	TechCorp SaaS Platform	techcorp-saas	Built a comprehensive SaaS platform for TechCorp featuring real-time collaboration, analytics dashboards, and third-party integrations.	A modern SaaS dashboard for project management and team collaboration.	https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80	{https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80}	{Next.js,TypeScript,PostgreSQL,"Tailwind CSS"}	Web Development	https://example.com	TechCorp needed a scalable platform to manage 10,000+ users with real-time updates.	We built a Next.js application with WebSocket integration and optimized database queries.	150% increase in user engagement\n40% reduction in page load time\n99.9% uptime achieved	t	t	2026-06-11 22:00:34.713	2026-06-11 22:00:34.713
cmqa1k78c0008p89zc6eabhdq	GrowthHub Marketing Automation	growthhub-automation	Designed and implemented a complete marketing automation system for GrowthHub.	Automated marketing workflows saving 20+ hours per week.	https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80	{}	{Node.js,Zapier,HubSpot,Python}	Automation	\N	Manual marketing processes were consuming 25+ hours weekly.	Built custom automation pipelines integrating CRM, email, and social media platforms.	20+ hours saved per week\n3x email open rates\n50% faster lead response time	t	t	2026-06-11 22:00:34.717	2026-06-11 22:00:34.717
cmqa1k78e0009p89ziiueld8w	InnovateLab Brand Campaign	innovatelab-campaign	Executed a comprehensive digital marketing strategy for InnovateLab's product launch.	Full digital marketing campaign with 300% ROI.	https://images.unsplash.com/photo-1533750516457-a7f992012fec?w=800&q=80	{}	{"Google Ads","Meta Ads",SEO,Analytics}	Marketing	\N	\N	\N	300% ROI on ad spend\n200% increase in organic traffic\n50+ qualified leads per month	t	t	2026-06-11 22:00:34.719	2026-06-11 22:00:34.719
cmqa1k78g000ap89ztjkwb43b	CloudNine Product Videos	cloudnine-videos	Created a series of product demonstration videos for CloudNine's e-commerce platform.	Professional product demo videos for e-commerce launch.	https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80	{}	{"Premiere Pro","After Effects","DaVinci Resolve"}	Editing	\N	\N	\N	\N	f	t	2026-06-11 22:00:34.721	2026-06-11 22:00:34.721
\.


--
-- Data for Name: Service; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Service" (id, title, slug, description, "shortDesc", icon, image, features, process, pricing, faqs, "order", published, "createdAt", "updatedAt") FROM stdin;
cmqa1k77w0001p89zd1fg0fl5	Web Development	web-development	We build responsive, high-performance websites and web applications tailored to your business needs. From simple landing pages to complex SaaS platforms, our team delivers scalable solutions using Next.js, React, and modern backend technologies.	Custom websites and web applications built with cutting-edge technologies.	Globe	\N	{"Responsive Design","CMS Integration","E-commerce Solutions","Performance Optimization","SEO-Friendly Architecture","API Development"}	[{"step": "01", "title": "Discovery", "description": "Understanding your requirements and goals."}, {"step": "02", "title": "Design", "description": "Creating wireframes and visual designs."}, {"step": "03", "title": "Development", "description": "Building with clean, scalable code."}, {"step": "04", "title": "Launch", "description": "Deployment and post-launch support."}]	\N	[{"answer": "Typically 2-8 weeks depending on complexity.", "question": "How long does a website take?"}, {"answer": "Yes, we can set up and manage hosting on Vercel, AWS, or your preferred platform.", "question": "Do you provide hosting?"}]	1	t	2026-06-11 22:00:34.7	2026-06-11 22:00:34.7
cmqa1k7820002p89zfqjzfbdb	Automation	automation	Automate repetitive tasks, integrate systems, and boost productivity with our custom automation solutions. We build workflows that save time and reduce errors across your organization.	Streamline workflows with intelligent business automation solutions.	Bot	\N	{"Workflow Automation","CRM Integration","Email Automation","Data Pipeline","API Integrations","Custom Scripts"}	\N	\N	\N	2	t	2026-06-11 22:00:34.706	2026-06-11 22:00:34.706
cmqa1k7840003p89zvu2t759r	AI Integrations	ai-integrations	Integrate cutting-edge AI capabilities into your products and workflows. From chatbots to predictive analytics, we help you harness the power of artificial intelligence.	Leverage AI to transform your business processes and customer experience.	Brain	\N	{"AI Chatbots","Natural Language Processing","Predictive Analytics","Computer Vision","Custom ML Models","OpenAI Integration"}	\N	\N	\N	3	t	2026-06-11 22:00:34.708	2026-06-11 22:00:34.708
cmqa1k7850004p89z4wbpprl9	Video Editing	video-editing	Our video editing team creates compelling content that engages your audience. From YouTube videos to ad campaigns and motion graphics, we deliver polished results.	Professional video editing for YouTube, ads, and social media content.	Video	\N	{"YouTube Videos","Short-form Content","Ad Editing","Motion Graphics","Color Grading","Sound Design"}	\N	\N	\N	4	t	2026-06-11 22:00:34.709	2026-06-11 22:00:34.709
cmqa1k7860005p89zsgiiwifk	Photo Editing	photo-editing	Professional photo editing services for e-commerce, marketing, and creative projects. We enhance your visuals to make a lasting impression.	Expert retouching, product editing, and creative graphics.	Image	\N	{Retouching,"Product Editing","Background Removal","Thumbnail Design","Social Media Graphics","Batch Processing"}	\N	\N	\N	5	t	2026-06-11 22:00:34.71	2026-06-11 22:00:34.71
cmqa1k7870006p89z8zgzh4gu	Digital Marketing	digital-marketing	Grow your online presence with data-driven marketing strategies. Our team specializes in SEO, paid advertising, content marketing, and social media management.	SEO, PPC, and social media strategies that drive measurable results.	Megaphone	\N	{"SEO Optimization","PPC Campaigns","Social Media Marketing","Content Strategy","Analytics & Reporting","Email Marketing"}	\N	\N	\N	6	t	2026-06-11 22:00:34.711	2026-06-11 22:00:34.711
\.


--
-- Data for Name: Settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Settings" (id, "companyName", tagline, email, phone, address, logo, favicon, "socialTwitter", "socialLinkedin", "socialInstagram", "socialFacebook", "socialYoutube", "calendlyUrl", "seoTitle", "seoDescription", "seoKeywords", "updatedAt") FROM stdin;
default	Nexus Digital	Transforming Ideas Into Digital Excellence	hello@nexusdigital.com	+1 (555) 123-4567	123 Innovation Drive, San Francisco, CA 94105	\N	\N	\N	\N	\N	\N	\N	https://calendly.com	Nexus Digital | Full-Service Digital Agency	Web development, automation, AI integrations, and digital marketing agency.	digital agency, web development, automation, AI, marketing	2026-06-11 22:00:34.695
\.


--
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TeamMember" (id, name, role, bio, image, linkedin, twitter, "order", published, "createdAt", "updatedAt") FROM stdin;
cmqa1k78o000gp89zlta2h3yd	Alex Morgan	CEO & Founder	15+ years in digital innovation.	https://ui-avatars.com/api/?name=Alex+Morgan&size=200&background=7c3aed&color=fff	\N	\N	1	t	2026-06-11 22:00:34.729	2026-06-11 22:00:34.729
cmqa1k78q000hp89z79gl3xcg	Jordan Lee	Lead Developer	Full-stack expert specializing in Next.js.	https://ui-avatars.com/api/?name=Jordan+Lee&size=200&background=7c3aed&color=fff	\N	\N	2	t	2026-06-11 22:00:34.731	2026-06-11 22:00:34.731
cmqa1k78r000ip89zypwog847	Sam Taylor	Creative Director	Award-winning designer with a passion for UX.	https://ui-avatars.com/api/?name=Sam+Taylor&size=200&background=7c3aed&color=fff	\N	\N	3	t	2026-06-11 22:00:34.731	2026-06-11 22:00:34.731
cmqa1k78s000jp89z7q09qk88	Casey Kim	Marketing Head	Data-driven marketer with proven ROI results.	https://ui-avatars.com/api/?name=Casey+Kim&size=200&background=7c3aed&color=fff	\N	\N	4	t	2026-06-11 22:00:34.732	2026-06-11 22:00:34.732
\.


--
-- Data for Name: Testimonial; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Testimonial" (id, "clientName", company, role, image, rating, review, "videoUrl", featured, published, "createdAt", "updatedAt") FROM stdin;
cmqa1k78h000bp89zhy0oal78	Sarah Johnson	TechCorp	CEO	\N	5	Nexus Digital transformed our online presence completely. Their team delivered a stunning website that increased our conversions by 150%.	\N	t	t	2026-06-11 22:00:34.722	2026-06-11 22:00:34.722
cmqa1k78k000cp89z43tf57i0	Michael Chen	InnovateLab	Founder	\N	5	The automation solutions they built saved us 20+ hours per week. Professional, responsive, and truly understand business needs.	\N	t	t	2026-06-11 22:00:34.724	2026-06-11 22:00:34.724
cmqa1k78k000dp89zm4vdxdzu	Emily Rodriguez	GrowthHub	Marketing Director	\N	5	Outstanding digital marketing results. Our organic traffic tripled in 6 months. Highly recommend their SEO services.	\N	t	t	2026-06-11 22:00:34.725	2026-06-11 22:00:34.725
cmqa1k78m000ep89zgidixbof	David Park	DataFlow	CTO	\N	5	Exceptional technical expertise. They built our SaaS platform on time and under budget.	\N	f	t	2026-06-11 22:00:34.726	2026-06-11 22:00:34.726
cmqa1k78n000fp89z39wbe31z	Lisa Wang	CloudNine	Product Manager	\N	5	Their AI integration work was groundbreaking for our product. Highly recommended!	\N	f	t	2026-06-11 22:00:34.727	2026-06-11 22:00:34.727
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, password, role, avatar, "createdAt", "updatedAt") FROM stdin;
cmqa1k77h0000p89znj8dzlno	Admin User	admin@nexusdigital.com	$2b$12$tvjgv4FJ31ex7xDzFDu0leT.MVtnyNwRAbGLf6iP/2WeZ1m/fnQKu	ADMIN	\N	2026-06-11 22:00:34.685	2026-06-11 22:00:34.685
\.


--
-- Name: Application Application_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_pkey" PRIMARY KEY (id);


--
-- Name: Blog Blog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_pkey" PRIMARY KEY (id);


--
-- Name: Career Career_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Career"
    ADD CONSTRAINT "Career_pkey" PRIMARY KEY (id);


--
-- Name: Lead Lead_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_pkey" PRIMARY KEY (id);


--
-- Name: Newsletter Newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Newsletter"
    ADD CONSTRAINT "Newsletter_pkey" PRIMARY KEY (id);


--
-- Name: Portfolio Portfolio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Portfolio"
    ADD CONSTRAINT "Portfolio_pkey" PRIMARY KEY (id);


--
-- Name: Service Service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Service"
    ADD CONSTRAINT "Service_pkey" PRIMARY KEY (id);


--
-- Name: Settings Settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Settings"
    ADD CONSTRAINT "Settings_pkey" PRIMARY KEY (id);


--
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- Name: Testimonial Testimonial_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Testimonial"
    ADD CONSTRAINT "Testimonial_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Blog_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Blog_slug_key" ON public."Blog" USING btree (slug);


--
-- Name: Career_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Career_slug_key" ON public."Career" USING btree (slug);


--
-- Name: Newsletter_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Newsletter_email_key" ON public."Newsletter" USING btree (email);


--
-- Name: Portfolio_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Portfolio_slug_key" ON public."Portfolio" USING btree (slug);


--
-- Name: Service_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Service_slug_key" ON public."Service" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Application Application_careerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Application"
    ADD CONSTRAINT "Application_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES public."Career"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Blog Blog_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Blog"
    ADD CONSTRAINT "Blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lead Lead_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Lead"
    ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict cfItQN1IN0511XdhQVtQjcFHX1K4O9E3C2U9XVrsT0RWRJbuKpYDbQ3LR7aHsHA

