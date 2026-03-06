export type AtomCategory =
  | 'identity'
  | 'location'
  | 'creative-work'
  | 'media'
  | 'software'
  | 'blockchain'
  | 'abstract'
  | 'generic'
  | 'commerce'
  | 'social'
  | 'web';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'string[]' | 'boolean';
  required: boolean;
  description: string;
}

export interface AtomType {
  /** Canonical type name used in classification envelope `type` field */
  id: string;
  /** Human-readable label */
  label: string;
  /** Schema.org @type (null for blockchain types) */
  schemaOrgType: string | null;
  /** Plugin slug used in meta.pluginId */
  pluginId: string;
  category: AtomCategory;
  description: string;
  /** Minimal onchain identity fields — the "Atom Data" in the classification spec */
  onchainFields: SchemaField[];
  /** Offchain enrichment fields — attached via artifacts */
  enrichmentFields: SchemaField[];
}

export const ATOM_CATEGORIES: Record<AtomCategory, { label: string; color: string }> = {
  identity: { label: 'Identity', color: '#6366f1' },
  location: { label: 'Location', color: '#f59e0b' },
  'creative-work': { label: 'Creative Work', color: '#ec4899' },
  media: { label: 'Media', color: '#8b5cf6' },
  software: { label: 'Software', color: '#10b981' },
  blockchain: { label: 'Blockchain', color: '#3b82f6' },
  abstract: { label: 'Abstract', color: '#f97316' },
  generic: { label: 'Generic', color: '#6b7280' },
  commerce: { label: 'Commerce', color: '#14b8a6' },
  social: { label: 'Social', color: '#e879f9' },
  web: { label: 'Web', color: '#38bdf8' },
};

/**
 * All 36 atom types from the official intuition-data-structures repo.
 * Fields match the canonical classification schemas exactly.
 * @see https://github.com/0xIntuition/intuition-data-structures/tree/main/classifications
 */
export const ATOM_TYPES: AtomType[] = [
  // ─── Identity ──────────────────────────────────────────────
  {
    id: 'Person',
    label: 'Person',
    schemaOrgType: 'Person',
    pluginId: 'person',
    category: 'identity',
    description: 'A human individual — developer, artist, founder, contributor.',
    onchainFields: [
      { name: 'givenName', type: 'string', required: true, description: 'First name' },
      { name: 'familyName', type: 'string', required: true, description: 'Last name' },
    ],
    enrichmentFields: [
      { name: 'country', type: 'string', required: false, description: 'Country of residence' },
      { name: 'language', type: 'string', required: false, description: 'Primary language' },
      { name: 'skills', type: 'string[]', required: false, description: 'Technical and professional skills' },
      { name: 'profession', type: 'string', required: false, description: 'Current role or title' },
      { name: 'avatar', type: 'string', required: false, description: 'Profile image URL' },
      { name: 'socialProfiles', type: 'string[]', required: false, description: 'Links to social accounts' },
    ],
  },
  {
    id: 'Organization',
    label: 'Organization',
    schemaOrgType: 'Organization',
    pluginId: 'company',
    category: 'identity',
    description: 'A company, DAO, foundation, team, or collective.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Organization name' },
      { name: 'url', type: 'string', required: false, description: 'Official website' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'industry', type: 'string', required: false, description: 'Primary industry or sector' },
      { name: 'employees', type: 'number', required: false, description: 'Approximate team size' },
      { name: 'founded', type: 'string', required: false, description: 'Year founded' },
      { name: 'location', type: 'string', required: false, description: 'Headquarters location' },
      { name: 'description', type: 'string', required: false, description: 'Mission statement or summary' },
      { name: 'logo', type: 'string', required: false, description: 'Logo image URL' },
    ],
  },
  {
    id: 'LocalBusiness',
    label: 'Local Business',
    schemaOrgType: 'LocalBusiness',
    pluginId: 'local-business',
    category: 'identity',
    description: 'A brick-and-mortar business with a physical location.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Business name' },
      { name: 'address', type: 'string', required: false, description: 'Physical address' },
      { name: 'telephone', type: 'string', required: false, description: 'Phone number' },
      { name: 'url', type: 'string', required: false, description: 'Website URL' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'openingHours', type: 'string', required: false, description: 'Opening hours' },
      { name: 'priceRange', type: 'string', required: false, description: 'Price range indicator' },
    ],
  },
  {
    id: 'Brand',
    label: 'Brand',
    schemaOrgType: 'Brand',
    pluginId: 'brand',
    category: 'identity',
    description: 'A brand identity — distinct from its parent company.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Brand name' },
      { name: 'url', type: 'string', required: false, description: 'Official brand website' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'logo', type: 'string', required: false, description: 'Brand logo URL' },
      { name: 'description', type: 'string', required: false, description: 'Brand description' },
    ],
  },

  // ─── Location ──────────────────────────────────────────────
  {
    id: 'Place',
    label: 'Place',
    schemaOrgType: 'Place',
    pluginId: 'location',
    category: 'location',
    description: 'A geographic location — city, venue, landmark.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Place name' },
      { name: 'address', type: 'string', required: false, description: 'Physical address' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'latitude', type: 'number', required: false, description: 'Geographic latitude' },
      { name: 'longitude', type: 'number', required: false, description: 'Geographic longitude' },
      { name: 'country', type: 'string', required: false, description: 'Country' },
      { name: 'description', type: 'string', required: false, description: 'Place description' },
    ],
  },

  // ─── Creative Works ────────────────────────────────────────
  {
    id: 'Article',
    label: 'Article',
    schemaOrgType: 'Article',
    pluginId: 'article',
    category: 'creative-work',
    description: 'A written piece — blog post, research paper, essay.',
    onchainFields: [
      { name: 'headline', type: 'string', required: true, description: 'Article headline' },
      { name: 'description', type: 'string', required: false, description: 'Article description/abstract' },
      { name: 'url', type: 'string', required: false, description: 'Article URL' },
    ],
    enrichmentFields: [
      { name: 'datePublished', type: 'string', required: false, description: 'Publication date' },
      { name: 'author', type: 'string', required: false, description: 'Author name' },
      { name: 'publisher', type: 'string', required: false, description: 'Publisher name' },
    ],
  },
  {
    id: 'NewsArticle',
    label: 'News Article',
    schemaOrgType: 'NewsArticle',
    pluginId: 'news-article',
    category: 'creative-work',
    description: 'A news story or journalistic report.',
    onchainFields: [
      { name: 'headline', type: 'string', required: true, description: 'Headline' },
      { name: 'datePublished', type: 'string', required: false, description: 'Publication date' },
      { name: 'url', type: 'string', required: false, description: 'Canonical article URL' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'author', type: 'string', required: false, description: 'Author name' },
      { name: 'publisher', type: 'string', required: false, description: 'Publisher name' },
      { name: 'description', type: 'string', required: false, description: 'Article summary' },
    ],
  },
  {
    id: 'Book',
    label: 'Book',
    schemaOrgType: 'Book',
    pluginId: 'book',
    category: 'creative-work',
    description: 'A published book or ebook.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Book title' },
      { name: 'author', type: 'string', required: false, description: 'Author name' },
      { name: 'isbn', type: 'string', required: false, description: 'ISBN identifier' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'datePublished', type: 'string', required: false, description: 'Publication date' },
      { name: 'publisher', type: 'string', required: false, description: 'Publisher' },
      { name: 'genre', type: 'string', required: false, description: 'Genre or category' },
    ],
  },
  {
    id: 'Movie',
    label: 'Movie',
    schemaOrgType: 'Movie',
    pluginId: 'movie',
    category: 'creative-work',
    description: 'A feature film or documentary.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Movie title' },
      { name: 'datePublished', type: 'string', required: false, description: 'Release date' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'director', type: 'string', required: false, description: 'Director name' },
      { name: 'genre', type: 'string', required: false, description: 'Genre' },
      { name: 'duration', type: 'string', required: false, description: 'Runtime' },
    ],
  },
  {
    id: 'TVSeries',
    label: 'TV Series',
    schemaOrgType: 'TVSeries',
    pluginId: 'tv-series',
    category: 'creative-work',
    description: 'A television series.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Series title' },
      { name: 'startDate', type: 'string', required: false, description: 'First air date' },
      { name: 'endDate', type: 'string', required: false, description: 'Last air date' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'numberOfSeasons', type: 'number', required: false, description: 'Number of seasons' },
      { name: 'genre', type: 'string', required: false, description: 'Genre' },
    ],
  },
  {
    id: 'MusicRecording',
    label: 'Music Recording',
    schemaOrgType: 'MusicRecording',
    pluginId: 'song',
    category: 'creative-work',
    description: 'A single track or song.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Track title' },
      { name: 'byArtist', type: 'string', required: false, description: 'Artist or band name' },
      { name: 'inAlbum', type: 'string', required: false, description: 'Album name' },
    ],
    enrichmentFields: [
      { name: 'duration', type: 'string', required: false, description: 'Track duration' },
      { name: 'genre', type: 'string', required: false, description: 'Music genre' },
    ],
  },
  {
    id: 'MusicAlbum',
    label: 'Music Album',
    schemaOrgType: 'MusicAlbum',
    pluginId: 'song',
    category: 'creative-work',
    description: 'A collection of music tracks.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Album title' },
      { name: 'byArtist', type: 'string', required: false, description: 'Artist or band name' },
    ],
    enrichmentFields: [
      { name: 'datePublished', type: 'string', required: false, description: 'Release date' },
      { name: 'numTracks', type: 'number', required: false, description: 'Number of tracks' },
      { name: 'genre', type: 'string', required: false, description: 'Music genre' },
    ],
  },
  {
    id: 'MusicGroup',
    label: 'Music Group',
    schemaOrgType: 'MusicGroup',
    pluginId: 'song',
    category: 'creative-work',
    description: 'A band, ensemble, or musical collective.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Group name' },
    ],
    enrichmentFields: [
      { name: 'genre', type: 'string', required: false, description: 'Music genre' },
      { name: 'foundingDate', type: 'string', required: false, description: 'Year formed' },
      { name: 'members', type: 'string[]', required: false, description: 'Band members' },
    ],
  },
  {
    id: 'PodcastSeries',
    label: 'Podcast Series',
    schemaOrgType: 'PodcastSeries',
    pluginId: 'podcast-series',
    category: 'creative-work',
    description: 'A podcast show or series.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Podcast series name' },
      { name: 'url', type: 'string', required: false, description: 'Canonical series URL' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Series description' },
      { name: 'author', type: 'string', required: false, description: 'Host or producer' },
    ],
  },
  {
    id: 'PodcastEpisode',
    label: 'Podcast Episode',
    schemaOrgType: 'PodcastEpisode',
    pluginId: 'podcast-episode',
    category: 'creative-work',
    description: 'A single podcast episode.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Episode name' },
      { name: 'url', type: 'string', required: false, description: 'Canonical episode URL' },
      { name: 'partOfSeries', type: 'string', required: false, description: 'Parent series name or URL' },
      { name: 'datePublished', type: 'string', required: false, description: 'Publish date' },
    ],
    enrichmentFields: [
      { name: 'duration', type: 'string', required: false, description: 'Episode duration' },
      { name: 'description', type: 'string', required: false, description: 'Episode description' },
    ],
  },
  {
    id: 'Event',
    label: 'Event',
    schemaOrgType: 'Event',
    pluginId: 'event',
    category: 'creative-work',
    description: 'A conference, meetup, hackathon, or gathering.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Event name' },
      { name: 'startDate', type: 'string', required: false, description: 'Start date' },
      { name: 'location', type: 'string', required: false, description: 'Event location' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'endDate', type: 'string', required: false, description: 'End date' },
      { name: 'description', type: 'string', required: false, description: 'Event description' },
    ],
  },

  // ─── Social ────────────────────────────────────────────────
  {
    id: 'SocialMediaPosting',
    label: 'Social Post',
    schemaOrgType: 'SocialMediaPosting',
    pluginId: 'article',
    category: 'social',
    description: 'A social media post — tweet, cast, toot.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Post title or author handle' },
      { name: 'text', type: 'string', required: true, description: 'Post content text' },
      { name: 'url', type: 'string', required: true, description: 'Post URL' },
    ],
    enrichmentFields: [
      { name: 'datePublished', type: 'string', required: false, description: 'Post date' },
      { name: 'author', type: 'string', required: false, description: 'Author name' },
    ],
  },
  {
    id: 'Comment',
    label: 'Comment',
    schemaOrgType: 'Comment',
    pluginId: 'comment',
    category: 'social',
    description: 'A reply or comment on another piece of content.',
    onchainFields: [
      { name: 'text', type: 'string', required: true, description: 'Comment text' },
      { name: 'about', type: 'string', required: false, description: 'Target identifier (what is being commented on)' },
      { name: 'dateCreated', type: 'string', required: false, description: 'Date created' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'author', type: 'string', required: false, description: 'Commenter name' },
    ],
  },
  {
    id: 'Review',
    label: 'Review',
    schemaOrgType: 'Review',
    pluginId: 'review',
    category: 'social',
    description: 'A review of a product, service, or creative work.',
    onchainFields: [
      { name: 'name', type: 'string', required: false, description: 'Review title' },
      { name: 'reviewBody', type: 'string', required: true, description: 'Review text' },
      { name: 'itemReviewed', type: 'string', required: false, description: 'Target of the review' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'ratingValue', type: 'number', required: false, description: 'Rating score' },
      { name: 'author', type: 'string', required: false, description: 'Reviewer name' },
    ],
  },
  {
    id: 'AggregateRating',
    label: 'Aggregate Rating',
    schemaOrgType: 'AggregateRating',
    pluginId: 'aggregate-rating',
    category: 'social',
    description: 'An aggregated rating across many reviews.',
    onchainFields: [
      { name: 'ratingValue', type: 'string', required: true, description: 'Average rating' },
      { name: 'reviewCount', type: 'string', required: true, description: 'Number of reviews' },
      { name: 'bestRating', type: 'string', required: false, description: 'Best possible rating' },
      { name: 'worstRating', type: 'string', required: false, description: 'Worst possible rating' },
    ],
    enrichmentFields: [],
  },

  // ─── Media ─────────────────────────────────────────────────
  {
    id: 'ImageObject',
    label: 'Image',
    schemaOrgType: 'ImageObject',
    pluginId: 'image',
    category: 'media',
    description: 'A photograph, illustration, or digital image.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Image title or filename' },
      { name: 'url', type: 'string', required: true, description: 'Image URL' },
      { name: 'caption', type: 'string', required: false, description: 'Image caption' },
      { name: 'keywords', type: 'string', required: false, description: 'Image keywords' },
    ],
    enrichmentFields: [
      { name: 'width', type: 'number', required: false, description: 'Width in pixels' },
      { name: 'height', type: 'number', required: false, description: 'Height in pixels' },
      { name: 'encodingFormat', type: 'string', required: false, description: 'File format (PNG, JPEG, etc.)' },
    ],
  },
  {
    id: 'VideoObject',
    label: 'Video',
    schemaOrgType: 'VideoObject',
    pluginId: 'video-object',
    category: 'media',
    description: 'A video file or stream.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Video title' },
      { name: 'description', type: 'string', required: false, description: 'Video description' },
      { name: 'contentUrl', type: 'string', required: false, description: 'Video content URL' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'duration', type: 'string', required: false, description: 'Video duration' },
      { name: 'uploadDate', type: 'string', required: false, description: 'Upload date' },
      { name: 'thumbnailUrl', type: 'string', required: false, description: 'Thumbnail URL' },
    ],
  },

  // ─── Software ──────────────────────────────────────────────
  {
    id: 'SoftwareSourceCode',
    label: 'Software',
    schemaOrgType: 'SoftwareSourceCode',
    pluginId: 'software',
    category: 'software',
    description: 'An open-source project, library, or codebase.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Project name' },
      { name: 'codeRepository', type: 'string', required: true, description: 'Repository URL' },
    ],
    enrichmentFields: [
      { name: 'programmingLanguage', type: 'string', required: false, description: 'Primary language' },
      { name: 'license', type: 'string', required: false, description: 'Software license' },
      { name: 'description', type: 'string', required: false, description: 'Project description' },
      { name: 'version', type: 'string', required: false, description: 'Latest version' },
    ],
  },
  {
    id: 'SoftwareApplication',
    label: 'Software App',
    schemaOrgType: 'SoftwareApplication',
    pluginId: 'software-application',
    category: 'software',
    description: 'A desktop or web application.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Application name' },
      { name: 'applicationCategory', type: 'string', required: false, description: 'App category' },
      { name: 'operatingSystem', type: 'string', required: false, description: 'Target OS' },
      { name: 'url', type: 'string', required: false, description: 'Canonical app URL' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'App description' },
      { name: 'softwareVersion', type: 'string', required: false, description: 'Current version' },
    ],
  },
  {
    id: 'MobileApplication',
    label: 'Mobile App',
    schemaOrgType: 'MobileApplication',
    pluginId: 'mobile-application',
    category: 'software',
    description: 'An iOS or Android application.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'App name' },
      { name: 'operatingSystem', type: 'string', required: false, description: 'iOS, Android, or both' },
      { name: 'applicationCategory', type: 'string', required: false, description: 'App category' },
      { name: 'downloadUrl', type: 'string', required: false, description: 'Store URL' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'App description' },
    ],
  },
  {
    id: 'Dataset',
    label: 'Dataset',
    schemaOrgType: 'Dataset',
    pluginId: 'dataset',
    category: 'software',
    description: 'A structured data collection or open dataset.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Dataset name' },
      { name: 'url', type: 'string', required: false, description: 'Canonical dataset URL' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Dataset description' },
      { name: 'license', type: 'string', required: false, description: 'Data license' },
    ],
  },

  // ─── Web ───────────────────────────────────────────────────
  {
    id: 'WebSite',
    label: 'Website',
    schemaOrgType: 'WebSite',
    pluginId: 'web-site',
    category: 'web',
    description: 'A website — top-level domain presence.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Site name' },
      { name: 'url', type: 'string', required: true, description: 'Canonical site URL' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Site description' },
      { name: 'publisher', type: 'string', required: false, description: 'Publisher or owner' },
    ],
  },
  {
    id: 'WebPage',
    label: 'Web Page',
    schemaOrgType: 'WebPage',
    pluginId: 'web-page',
    category: 'web',
    description: 'A specific page within a website.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Page title' },
      { name: 'url', type: 'string', required: true, description: 'Canonical page URL' },
      { name: 'isPartOf', type: 'string', required: false, description: 'Parent website name or URL' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Page description' },
    ],
  },

  // ─── Commerce ──────────────────────────────────────────────
  {
    id: 'Product',
    label: 'Product',
    schemaOrgType: 'Product',
    pluginId: 'product',
    category: 'commerce',
    description: 'A physical or digital product.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Product name' },
      { name: 'brand', type: 'string', required: false, description: 'Brand name' },
      { name: 'sku', type: 'string', required: false, description: 'SKU identifier' },
      { name: 'gtin', type: 'string', required: false, description: 'GTIN/barcode' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Product description' },
      { name: 'price', type: 'string', required: false, description: 'Price' },
    ],
  },
  {
    id: 'Service',
    label: 'Service',
    schemaOrgType: 'Service',
    pluginId: 'service',
    category: 'commerce',
    description: 'An offered service — SaaS, consulting, etc.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Service name' },
      { name: 'provider', type: 'string', required: false, description: 'Provider name' },
      { name: 'areaServed', type: 'string', required: false, description: 'Service area' },
      { name: 'sameAs', type: 'string[]', required: false, description: 'Canonical reference URLs' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Service description' },
    ],
  },
  {
    id: 'JobPosting',
    label: 'Job Posting',
    schemaOrgType: 'JobPosting',
    pluginId: 'job-posting',
    category: 'commerce',
    description: 'A job or role listing.',
    onchainFields: [
      { name: 'title', type: 'string', required: true, description: 'Job title' },
      { name: 'hiringOrganization', type: 'string', required: true, description: 'Organization name' },
      { name: 'jobLocation', type: 'string', required: false, description: 'Job location' },
      { name: 'datePosted', type: 'string', required: false, description: 'Date posted' },
      { name: 'url', type: 'string', required: false, description: 'Canonical job URL' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Job description' },
      { name: 'employmentType', type: 'string', required: false, description: 'Employment type' },
    ],
  },

  // ─── Blockchain ────────────────────────────────────────────
  {
    id: 'EthereumAccount',
    label: 'ETH Account',
    schemaOrgType: null,
    pluginId: 'ethereum-account',
    category: 'blockchain',
    description: 'An Ethereum EOA (externally owned account).',
    onchainFields: [
      { name: 'address', type: 'string', required: true, description: 'Ethereum address (0x...)' },
    ],
    enrichmentFields: [
      { name: 'ens', type: 'string', required: false, description: 'ENS domain name' },
      { name: 'label', type: 'string', required: false, description: 'Human-readable label' },
    ],
  },
  {
    id: 'EthereumSmartContract',
    label: 'Smart Contract',
    schemaOrgType: null,
    pluginId: 'ethereum-smart-contract',
    category: 'blockchain',
    description: 'A deployed Ethereum smart contract.',
    onchainFields: [
      { name: 'chainId', type: 'string', required: true, description: 'EVM chain ID' },
      { name: 'address', type: 'string', required: true, description: 'Contract address (0x...)' },
    ],
    enrichmentFields: [
      { name: 'name', type: 'string', required: false, description: 'Contract name' },
      { name: 'standard', type: 'string', required: false, description: 'Standard (ERC-721, ERC-1155, etc.)' },
      { name: 'verified', type: 'boolean', required: false, description: 'Source verified on explorer' },
    ],
  },
  {
    id: 'EthereumERC20',
    label: 'ERC-20 Token',
    schemaOrgType: null,
    pluginId: 'ethereum-smart-contract',
    category: 'blockchain',
    description: 'A fungible token following the ERC-20 standard.',
    onchainFields: [
      { name: 'address', type: 'string', required: true, description: 'Token contract address' },
      { name: 'chainId', type: 'string', required: true, description: 'EVM chain ID' },
      { name: 'name', type: 'string', required: true, description: 'Token name' },
      { name: 'symbol', type: 'string', required: true, description: 'Token ticker symbol' },
      { name: 'decimals', type: 'string', required: true, description: 'Token decimal places' },
    ],
    enrichmentFields: [
      { name: 'totalSupply', type: 'string', required: false, description: 'Total supply' },
      { name: 'logo', type: 'string', required: false, description: 'Token logo URL' },
    ],
  },

  // ─── Abstract ──────────────────────────────────────────────
  {
    id: 'DefinedTerm',
    label: 'Defined Term',
    schemaOrgType: 'DefinedTerm',
    pluginId: 'defined-term',
    category: 'abstract',
    description: 'A formally defined concept, keyword, or term.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Term name' },
      { name: 'description', type: 'string', required: true, description: 'Term definition' },
    ],
    enrichmentFields: [
      { name: 'broader', type: 'string', required: false, description: 'Parent concept' },
      { name: 'related', type: 'string[]', required: false, description: 'Related terms' },
    ],
  },

  // ─── Generic ───────────────────────────────────────────────
  {
    id: 'Thing',
    label: 'Thing',
    schemaOrgType: 'Thing',
    pluginId: 'thing',
    category: 'generic',
    description: 'A generic entity — use when no specific type fits.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Entity name' },
      { name: 'description', type: 'string', required: false, description: 'Description' },
    ],
    enrichmentFields: [],
  },
];

export function getAtomType(id: string): AtomType | undefined {
  return ATOM_TYPES.find((t) => t.id === id);
}

export function getAtomTypesByCategory(category: AtomCategory): AtomType[] {
  return ATOM_TYPES.filter((t) => t.category === category);
}

/**
 * Constructs the JSON-LD "Atom Data" payload for a given type.
 * This is the minimal onchain identity object per the classification spec.
 */
export function buildAtomData(atomType: AtomType): Record<string, unknown> {
  if (atomType.schemaOrgType) {
    const data: Record<string, unknown> = {
      '@context': 'https://schema.org/',
      '@type': atomType.schemaOrgType,
    };
    for (const field of atomType.onchainFields) {
      data[field.name] = field.type === 'string[]' ? [`<${field.name}>`] : `<${field.name}>`;
    }
    return data;
  }
  // Blockchain types have no @context/@type
  const data: Record<string, unknown> = {};
  for (const field of atomType.onchainFields) {
    data[field.name] = `<${field.name}>`;
  }
  return data;
}

/**
 * Constructs the full classification envelope for a given type.
 */
export function buildClassificationEnvelope(atomType: AtomType): Record<string, unknown> {
  return {
    type: atomType.id,
    data: buildAtomData(atomType),
    meta: {
      pluginId: atomType.pluginId,
      provider: '<provider_name>',
      fetchedAt: '<iso_datetime>',
      sourceUrl: '<source_url>',
    },
  };
}
