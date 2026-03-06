export interface HierarchyNode {
  id: string;
  label: string;
  category: string;
  children?: HierarchyNode[];
}

/**
 * Atom type hierarchy based on Schema.org inheritance + protocol-specific extensions.
 * All 36 types from the official intuition-data-structures repo.
 * Used for the D3 radial tree visualization.
 * @see https://github.com/0xIntuition/intuition-data-structures/tree/main/classifications
 */
export const ATOM_HIERARCHY: HierarchyNode = {
  id: 'Thing',
  label: 'Thing',
  category: 'generic',
  children: [
    {
      id: 'Person',
      label: 'Person',
      category: 'identity',
    },
    {
      id: 'Organization',
      label: 'Organization',
      category: 'identity',
      children: [
        { id: 'LocalBusiness', label: 'Local Business', category: 'identity' },
        { id: 'MusicGroup', label: 'Music Group', category: 'creative-work' },
      ],
    },
    {
      id: 'Brand',
      label: 'Brand',
      category: 'identity',
    },
    {
      id: 'Place',
      label: 'Place',
      category: 'location',
    },
    {
      id: 'CreativeWork',
      label: 'Creative Work',
      category: 'creative-work',
      children: [
        { id: 'Article', label: 'Article', category: 'creative-work',
          children: [
            { id: 'NewsArticle', label: 'News Article', category: 'creative-work' },
            { id: 'SocialMediaPosting', label: 'Social Post', category: 'social' },
          ],
        },
        { id: 'Book', label: 'Book', category: 'creative-work' },
        { id: 'Movie', label: 'Movie', category: 'creative-work' },
        { id: 'TVSeries', label: 'TV Series', category: 'creative-work' },
        { id: 'MusicRecording', label: 'Music Track', category: 'creative-work' },
        { id: 'MusicAlbum', label: 'Music Album', category: 'creative-work' },
        { id: 'PodcastSeries', label: 'Podcast Series', category: 'creative-work' },
        { id: 'PodcastEpisode', label: 'Podcast Episode', category: 'creative-work' },
        { id: 'Comment', label: 'Comment', category: 'social' },
        { id: 'Review', label: 'Review', category: 'social' },
      ],
    },
    {
      id: 'MediaObject',
      label: 'Media Object',
      category: 'media',
      children: [
        { id: 'ImageObject', label: 'Image', category: 'media' },
        { id: 'VideoObject', label: 'Video', category: 'media' },
      ],
    },
    {
      id: 'Event',
      label: 'Event',
      category: 'creative-work',
    },
    {
      id: 'SoftwareSourceCode',
      label: 'Software',
      category: 'software',
      children: [
        { id: 'SoftwareApplication', label: 'Software App', category: 'software' },
        { id: 'MobileApplication', label: 'Mobile App', category: 'software' },
      ],
    },
    {
      id: 'Dataset',
      label: 'Dataset',
      category: 'software',
    },
    {
      id: 'WebSite',
      label: 'Website',
      category: 'web',
      children: [
        { id: 'WebPage', label: 'Web Page', category: 'web' },
      ],
    },
    {
      id: 'Commerce',
      label: 'Commerce',
      category: 'commerce',
      children: [
        { id: 'Product', label: 'Product', category: 'commerce' },
        { id: 'Service', label: 'Service', category: 'commerce' },
        { id: 'JobPosting', label: 'Job Posting', category: 'commerce' },
      ],
    },
    {
      id: 'AggregateRating',
      label: 'Aggregate Rating',
      category: 'social',
    },
    {
      id: 'DefinedTerm',
      label: 'Defined Term',
      category: 'abstract',
    },
    {
      id: 'BlockchainEntity',
      label: 'Blockchain',
      category: 'blockchain',
      children: [
        { id: 'EthereumAccount', label: 'ETH Account', category: 'blockchain' },
        { id: 'EthereumSmartContract', label: 'Smart Contract', category: 'blockchain' },
        { id: 'EthereumERC20', label: 'ERC-20 Token', category: 'blockchain' },
      ],
    },
  ],
};
