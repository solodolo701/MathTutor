// When Supabase isn't configured, the app runs on static in-memory demo
// data instead of hitting a database — lets a deployment be reviewed for
// content and UI/logic without any backend services set up.
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;
