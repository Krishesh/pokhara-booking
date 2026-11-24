// Hand-written types matching supabase/schema.sql. Keep in sync when the schema changes.

export type Activity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
};
