/**
 * Intuition Ecosystem App Ontologies
 * Formal schema extensions for the 15 apps hosted under github.com/intuition-box
 * Compatible with ontology.intuition.box (Ontology explorer)
 */

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'string[]' | 'boolean';
  required: boolean;
  description: string;
}

export type AtomCategory =
  | 'identity'
  | 'self'
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

export interface AtomType {
  id: string;
  label: string;
  schemaOrgType: string | null;
  pluginId: string;
  category: AtomCategory;
  description: string;
  onchainFields: SchemaField[];
  enrichmentFields: SchemaField[];
  appSlug?: string;
}

export type PredicateSemanticGroup =
  | 'Identity & Trust'
  | 'Membership & Work'
  | 'Creation & Contribution'
  | 'Interests & Expertise'
  | 'Social & Endorsement'
  | 'Location & Events'
  | 'Commerce & Products'
  | 'Software & Tools'
  | 'Blockchain & Onchain'
  | 'Content & Media'
  | 'Taxonomy & Classification';

export type PredicateForm =
  | 'bare'
  | 'third-person-singular'
  | 'past'
  | 'phrase'
  | 'passive';

export interface PredicateRule {
  id: string;
  label: string;
  description: string;
  subjectTypes: string[];
  objectTypes: string[];
  group: PredicateSemanticGroup;
  priority: number;
  form: PredicateForm;
  appSlug?: string;
}

export interface ExampleClaim {
  subject: string;
  subjectType: string;
  predicateId: string;
  predicateLabel: string;
  object: string;
  objectType: string;
}

/**
 * Ecosystem Atom Types for the 15 Intuition-Box applications
 */
export const ECOSYSTEM_ATOM_TYPES: AtomType[] = [
  // ─── 1. Ontology Explorer ──────────────────────────────────
  {
    id: 'OntologySchema',
    label: 'Ontology Schema',
    schemaOrgType: 'DefinedTermSet',
    pluginId: 'ontology-schema',
    category: 'software',
    description: 'A formal schema package defining atom types and predicates for an ecosystem app.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Schema name' },
      { name: 'appSlug', type: 'string', required: true, description: 'Ecosystem app identifier' },
      { name: 'version', type: 'string', required: true, description: 'Semver version string' },
    ],
    enrichmentFields: [
      { name: 'documentationUrl', type: 'string', required: false, description: 'Link to schema docs' },
      { name: 'maintainerAddress', type: 'string', required: false, description: 'Maintainer wallet' },
    ],
    appSlug: 'Ontology',
  },
  {
    id: 'AtomTypeDefinition',
    label: 'Atom Type Definition',
    schemaOrgType: 'Class',
    pluginId: 'atom-type-definition',
    category: 'abstract',
    description: 'Specification of an allowed entity class in the knowledge graph.',
    onchainFields: [
      { name: 'typeId', type: 'string', required: true, description: 'Canonical type identifier' },
      { name: 'category', type: 'string', required: true, description: 'Taxonomic category' },
    ],
    enrichmentFields: [
      { name: 'schemaOrgMapping', type: 'string', required: false, description: 'Mapped Schema.org type' },
      { name: 'description', type: 'string', required: false, description: 'Human-readable description' },
    ],
    appSlug: 'Ontology',
  },
  {
    id: 'PredicateRule',
    label: 'Predicate Rule',
    schemaOrgType: 'Property',
    pluginId: 'predicate-rule',
    category: 'abstract',
    description: 'Specification of a valid predicate and its subject/object constraints.',
    onchainFields: [
      { name: 'predicateId', type: 'string', required: true, description: 'Predicate identifier' },
      { name: 'form', type: 'string', required: true, description: 'Grammatical form' },
    ],
    enrichmentFields: [
      { name: 'semanticGroup', type: 'string', required: false, description: 'Semantic group' },
    ],
    appSlug: 'Ontology',
  },

  // ─── 2. Atlas Community Platform ───────────────────────────
  {
    id: 'Community',
    label: 'Community',
    schemaOrgType: 'Organization',
    pluginId: 'atlas-community',
    category: 'identity',
    description: 'A collective or ecosystem organization with members, quests, and orbit tiers.',
    onchainFields: [
      { name: 'name', type: 'string', required: true, description: 'Community name' },
      { name: 'communitySlug', type: 'string', required: true, description: 'URL-friendly slug' },
    ],
    enrichmentFields: [
      { name: 'avatarUrl', type: 'string', required: false, description: 'Logo or badge image' },
      { name: 'description', type: 'string', required: false, description: 'Community mission statement' },
    ],
    appSlug: 'Atlas',
  },
  {
    id: 'OrbitLevel',
    label: 'Orbit Level',
    schemaOrgType: 'DefinedTerm',
    pluginId: 'atlas-orbit',
    category: 'abstract',
    description: 'Orbit tier indicating community closeness (1: Advocate, 2: Contributor, 3: Participant, 4: Explorer).',
    onchainFields: [
      { name: 'tierIndex', type: 'number', required: true, description: 'Ring index 1 to 4' },
      { name: 'tierName', type: 'string', required: true, description: 'Tier title' },
    ],
    enrichmentFields: [
      { name: 'minReach', type: 'number', required: false, description: 'Reach score threshold' },
      { name: 'minLove', type: 'number', required: false, description: 'Love score threshold' },
    ],
    appSlug: 'Atlas',
  },
  {
    id: 'CommunityQuest',
    label: 'Community Quest',
    schemaOrgType: 'Action',
    pluginId: 'atlas-quest',
    category: 'creative-work',
    description: 'A challenge, bounty, or quest issued by a community for members to complete.',
    onchainFields: [
      { name: 'questId', type: 'string', required: true, description: 'Unique quest identifier' },
      { name: 'rewardTrust', type: 'string', required: false, description: 'TRUST bounty amount' },
    ],
    enrichmentFields: [
      { name: 'title', type: 'string', required: false, description: 'Quest headline' },
      { name: 'deadline', type: 'string', required: false, description: 'ISO completion deadline' },
    ],
    appSlug: 'Atlas',
  },

  // ─── 3. Fee Proxy Template & Protocol MultiVault ───────────
  {
    id: 'MultiVault',
    label: 'MultiVault',
    schemaOrgType: null,
    pluginId: 'multivault',
    category: 'blockchain',
    description: 'First-class Intuition bonding curve contract managing FOR/AGAINST staking pools.',
    onchainFields: [
      { name: 'contractAddress', type: 'string', required: true, description: 'MultiVault deployment address' },
      { name: 'chainId', type: 'number', required: true, description: 'EVM Chain ID' },
      { name: 'totalStakedTrustWei', type: 'string', required: true, description: 'Cumulative TRUST bonded' },
    ],
    enrichmentFields: [
      { name: 'curveSlope', type: 'string', required: false, description: 'Bonding curve pricing formula' },
      { name: 'entryFeeBps', type: 'number', required: false, description: 'MultiVault protocol deposit fee' },
    ],
    appSlug: 'Fee-Proxy-Template',
  },
  {
    id: 'FeeProxyContract',
    label: 'Fee Proxy Contract',
    schemaOrgType: null,
    pluginId: 'fee-proxy',
    category: 'blockchain',
    description: 'Configurable proxy contract on Intuition MultiVault collecting deposit fees.',
    onchainFields: [
      { name: 'contractAddress', type: 'string', required: true, description: 'EVM deployment address' },
      { name: 'chainId', type: 'number', required: true, description: 'EVM chain ID' },
    ],
    enrichmentFields: [
      { name: 'sourceRepo', type: 'string', required: false, description: 'Contract GitHub source' },
    ],
    appSlug: 'Fee-Proxy-Template',
  },
  {
    id: 'FeeRecipient',
    label: 'Fee Recipient',
    schemaOrgType: null,
    pluginId: 'fee-recipient',
    category: 'identity',
    description: 'Target beneficiary account receiving collected fee revenues.',
    onchainFields: [
      { name: 'walletAddress', type: 'string', required: true, description: 'Beneficiary EVM address' },
    ],
    enrichmentFields: [
      { name: 'beneficiaryName', type: 'string', required: false, description: 'Name of beneficiary' },
    ],
    appSlug: 'Fee-Proxy-Template',
  },
  {
    id: 'FeeConfig',
    label: 'Fee Configuration',
    schemaOrgType: null,
    pluginId: 'fee-config',
    category: 'abstract',
    description: 'Deposit fee schedule including fixed fee and basis point percentage.',
    onchainFields: [
      { name: 'fixedFeeWei', type: 'string', required: true, description: 'Fixed deposit fee' },
      { name: 'percentageBps', type: 'number', required: true, description: 'Basis points (500 = 5%)' },
    ],
    enrichmentFields: [
      { name: 'effectiveDate', type: 'string', required: false, description: 'Active date' },
    ],
    appSlug: 'Fee-Proxy-Template',
  },

  // ─── 4. Sofia Fee Proxy Dashboard ──────────────────────────
  {
    id: 'SofiaFeeProxy',
    label: 'Sofia Fee Proxy',
    schemaOrgType: null,
    pluginId: 'sofia-fee-proxy',
    category: 'blockchain',
    description: 'Canonical Sofia fee proxy on Intuition Mainnet (0x26F81d723Ad1648194FAA4b7E235105Fd1212c6c).',
    onchainFields: [
      { name: 'contractAddress', type: 'string', required: true, description: 'Deployed contract address' },
      { name: 'chainId', type: 'number', required: true, description: 'Chain ID (1155)' },
    ],
    enrichmentFields: [
      { name: 'dashboardUrl', type: 'string', required: false, description: 'Analytics dashboard URL' },
    ],
    appSlug: 'Sofia-Fee-Proxy-Dashboard',
  },
  {
    id: 'ForwardedTransaction',
    label: 'Forwarded Tx',
    schemaOrgType: null,
    pluginId: 'forwarded-tx',
    category: 'blockchain',
    description: 'Forwarded deposit or createTriples transaction routed through the proxy.',
    onchainFields: [
      { name: 'txHash', type: 'string', required: true, description: 'EVM transaction hash' },
      { name: 'operation', type: 'string', required: true, description: 'createTriples or deposit' },
    ],
    enrichmentFields: [
      { name: 'feeAmountWei', type: 'string', required: false, description: 'Collected fee' },
    ],
    appSlug: 'Sofia-Fee-Proxy-Dashboard',
  },

  // ─── 5. Community Directory ────────────────────────────────
  {
    id: 'DirectoryProfile',
    label: 'Directory Profile',
    schemaOrgType: 'ProfilePage',
    pluginId: 'directory-profile',
    category: 'identity',
    description: 'Comprehensive public builder profile in the community directory.',
    onchainFields: [
      { name: 'handle', type: 'string', required: true, description: 'Unique username handle' },
      { name: 'walletAddress', type: 'string', required: true, description: 'Primary EVM wallet' },
    ],
    enrichmentFields: [
      { name: 'bio', type: 'string', required: false, description: 'Short professional bio' },
      { name: 'github', type: 'string', required: false, description: 'GitHub username' },
    ],
    appSlug: 'community-directory',
  },
  {
    id: 'BuilderBadge',
    label: 'Builder Badge',
    schemaOrgType: 'Award',
    pluginId: 'builder-badge',
    category: 'social',
    description: 'Verified onchain credential or community contribution honor.',
    onchainFields: [
      { name: 'badgeId', type: 'string', required: true, description: 'Badge identifier' },
      { name: 'issuerAddress', type: 'string', required: true, description: 'Issuer authority' },
    ],
    enrichmentFields: [
      { name: 'badgeTitle', type: 'string', required: false, description: 'Title of the badge' },
    ],
    appSlug: 'community-directory',
  },

  // ─── 6. Spread Trust ───────────────────────────────────────
  {
    id: 'TrustDispenser',
    label: 'Trust Dispenser',
    schemaOrgType: null,
    pluginId: 'trust-dispenser',
    category: 'software',
    description: 'Burner wallet or event faucet dispensing TRUST onboarding tokens.',
    onchainFields: [
      { name: 'dispenserAddress', type: 'string', required: true, description: 'Funding wallet' },
      { name: 'campaignId', type: 'string', required: true, description: 'Event campaign code' },
    ],
    enrichmentFields: [
      { name: 'operatorName', type: 'string', required: false, description: 'Booth or sponsor name' },
    ],
    appSlug: 'spread-trust',
  },
  {
    id: 'EventAttendee',
    label: 'Event Attendee',
    schemaOrgType: 'Person',
    pluginId: 'event-attendee',
    category: 'identity',
    description: 'An individual receiving onboarding gas or tokens at an event.',
    onchainFields: [
      { name: 'attendeeAddress', type: 'string', required: true, description: 'Attendee EVM wallet' },
    ],
    enrichmentFields: [
      { name: 'eventName', type: 'string', required: false, description: 'Event title' },
    ],
    appSlug: 'spread-trust',
  },
  {
    id: 'FaucetDrop',
    label: 'Faucet Drop',
    schemaOrgType: null,
    pluginId: 'faucet-drop',
    category: 'blockchain',
    description: 'Record of an onboarding gas or TRUST token transfer.',
    onchainFields: [
      { name: 'txHash', type: 'string', required: true, description: 'Transfer transaction hash' },
      { name: 'amountWei', type: 'string', required: true, description: 'Amount transferred' },
    ],
    enrichmentFields: [
      { name: 'recipientAddress', type: 'string', required: false, description: 'Attendee wallet' },
    ],
    appSlug: 'spread-trust',
  },

  // ─── 7. L3 Node ───────────────────────────────────────────
  {
    id: 'L3ReplicaNode',
    label: 'L3 Replica Node',
    schemaOrgType: null,
    pluginId: 'l3-node',
    category: 'software',
    description: 'Self-hosted Arbitrum Nitro node instance syncing Intuition L3.',
    onchainFields: [
      { name: 'nodeId', type: 'string', required: true, description: 'Node instance identifier' },
      { name: 'clientVersion', type: 'string', required: true, description: 'Nitro version' },
    ],
    enrichmentFields: [
      { name: 'syncStatus', type: 'string', required: false, description: 'Live sync state' },
    ],
    appSlug: 'l3-node',
  },
  {
    id: 'SequencerFeed',
    label: 'Sequencer Feed',
    schemaOrgType: null,
    pluginId: 'sequencer-feed',
    category: 'software',
    description: 'Live block and transaction stream from the L3 sequencer.',
    onchainFields: [
      { name: 'feedUrl', type: 'string', required: true, description: 'Feed websocket endpoint' },
      { name: 'expectedChainId', type: 'number', required: true, description: 'L3 chain ID' },
    ],
    enrichmentFields: [
      { name: 'provider', type: 'string', required: false, description: 'Sequencer operator' },
    ],
    appSlug: 'l3-node',
  },

  // ─── 8. RPC Gateway ───────────────────────────────────────
  {
    id: 'RpcGateway',
    label: 'RPC Gateway',
    schemaOrgType: null,
    pluginId: 'rpc-gateway',
    category: 'software',
    description: 'Nginx gateway managing rate limits, API keys, and endpoint routing.',
    onchainFields: [
      { name: 'gatewayDomain', type: 'string', required: true, description: 'Public RPC domain' },
    ],
    enrichmentFields: [
      { name: 'maxRps', type: 'number', required: false, description: 'Rate limit capacity' },
    ],
    appSlug: 'RPC',
  },
  {
    id: 'RpcEndpoint',
    label: 'RPC Endpoint',
    schemaOrgType: 'EntryPoint',
    pluginId: 'rpc-endpoint',
    category: 'web',
    description: 'Individual HTTP or WebSocket JSON-RPC connection interface.',
    onchainFields: [
      { name: 'endpointUrl', type: 'string', required: true, description: 'Access URL' },
      { name: 'protocolType', type: 'string', required: true, description: 'http or ws' },
    ],
    enrichmentFields: [
      { name: 'supportedMethods', type: 'string[]', required: false, description: 'RPC methods' },
    ],
    appSlug: 'RPC',
  },

  // ─── 9. MCP Inspector ─────────────────────────────────────
  {
    id: 'MCPServer',
    label: 'MCP Server',
    schemaOrgType: 'SoftwareApplication',
    pluginId: 'mcp-server',
    category: 'software',
    description: 'Model Context Protocol server bundle exposing tools for AI agents.',
    onchainFields: [
      { name: 'serverName', type: 'string', required: true, description: 'MCP server name' },
      { name: 'version', type: 'string', required: true, description: 'Package version' },
    ],
    enrichmentFields: [
      { name: 'npmPackage', type: 'string', required: false, description: 'NPM package name' },
    ],
    appSlug: 'mcp-inspector',
  },
  {
    id: 'MCPTool',
    label: 'MCP Tool',
    schemaOrgType: null,
    pluginId: 'mcp-tool',
    category: 'software',
    description: 'Executable tool exposed by an MCP server for LLMs.',
    onchainFields: [
      { name: 'toolName', type: 'string', required: true, description: 'Callable tool identifier' },
      { name: 'inputSchemaHash', type: 'string', required: true, description: 'Hash of parameters schema' },
    ],
    enrichmentFields: [
      { name: 'description', type: 'string', required: false, description: 'Tool prompt description' },
    ],
    appSlug: 'mcp-inspector',
  },

  // ─── 10. 9atunments ───────────────────────────────────────
  {
    id: 'AttunementRitual',
    label: 'Attunement Ritual',
    schemaOrgType: 'Event',
    pluginId: 'attunement-ritual',
    category: 'creative-work',
    description: 'Synchronized alignment ceremony or coherence ritual.',
    onchainFields: [
      { name: 'ritualId', type: 'string', required: true, description: 'Unique ritual identifier' },
      { name: 'ritualName', type: 'string', required: true, description: 'Ritual title' },
    ],
    enrichmentFields: [
      { name: 'cycleDuration', type: 'string', required: false, description: 'Session duration' },
    ],
    appSlug: '9atunments',
  },
  {
    id: 'AttunementFrequency',
    label: 'Harmonic Frequency',
    schemaOrgType: null,
    pluginId: 'attunement-frequency',
    category: 'abstract',
    description: 'Target vibrational frequency or thematic focus of an attunement.',
    onchainFields: [
      { name: 'frequencyHz', type: 'number', required: true, description: 'Frequency value' },
      { name: 'scaleName', type: 'string', required: true, description: 'Scale or mode name' },
    ],
    enrichmentFields: [
      { name: 'symbolicMeaning', type: 'string', required: false, description: 'Conceptual intent' },
    ],
    appSlug: '9atunments',
  },

  // ─── 11. AgentId ──────────────────────────────────────────
  {
    id: 'AIAgent',
    label: 'AI Agent',
    schemaOrgType: null,
    pluginId: 'ai-agent',
    category: 'identity',
    description: 'Autonomous AI agent registered in the decentralized trust registry.',
    onchainFields: [
      { name: 'agentUri', type: 'string', required: true, description: 'URI to IPFS registration' },
      { name: 'registryVersion', type: 'string', required: true, description: 'AgentID version' },
    ],
    enrichmentFields: [
      { name: 'name', type: 'string', required: false, description: 'Display name' },
      { name: 'developerAddress', type: 'string', required: false, description: 'Creator wallet' },
    ],
    appSlug: 'agentId',
  },
  {
    id: 'AgentCapability',
    label: 'Agent Capability',
    schemaOrgType: 'DefinedTerm',
    pluginId: 'agent-capability',
    category: 'abstract',
    description: 'Specific functional capability or skill delivered by an AI agent.',
    onchainFields: [
      { name: 'capabilityId', type: 'string', required: true, description: 'Capability identifier' },
      { name: 'category', type: 'string', required: true, description: 'Capability category' },
    ],
    enrichmentFields: [
      { name: 'specificationUrl', type: 'string', required: false, description: 'API documentation' },
    ],
    appSlug: 'agentId',
  },

  // ─── 12. Orbyt ────────────────────────────────────────────
  {
    id: 'SpatialCluster',
    label: 'Spatial Cluster',
    schemaOrgType: null,
    pluginId: 'spatial-cluster',
    category: 'abstract',
    description: 'Cohesive cluster of related entities in 3D knowledge space.',
    onchainFields: [
      { name: 'clusterId', type: 'string', required: true, description: 'Cluster identifier' },
      { name: 'coordinateDimension', type: 'number', required: true, description: 'Dimensions (3)' },
    ],
    enrichmentFields: [
      { name: 'name', type: 'string', required: false, description: 'Cluster theme title' },
    ],
    appSlug: 'orbyt',
  },
  {
    id: 'GravityWell',
    label: 'Gravity Well',
    schemaOrgType: null,
    pluginId: 'gravity-well',
    category: 'abstract',
    description: 'High-attraction node exerting gravitational pull on surrounding knowledge nodes.',
    onchainFields: [
      { name: 'wellId', type: 'string', required: true, description: 'Well identifier' },
      { name: 'attractionPower', type: 'number', required: true, description: 'Pull coefficient' },
    ],
    enrichmentFields: [
      { name: 'focalAtomId', type: 'string', required: false, description: 'Anchor atom ID' },
    ],
    appSlug: 'orbyt',
  },

  // ─── 13. Intuition Ideation ───────────────────────────────
  {
    id: 'IdeationProposal',
    label: 'Ideation Proposal',
    schemaOrgType: 'Proposal',
    pluginId: 'ideation-proposal',
    category: 'creative-work',
    description: 'Structured product or feature idea proposed for the Intuition ecosystem.',
    onchainFields: [
      { name: 'proposalId', type: 'string', required: true, description: 'Proposal slug' },
      { name: 'authorAddress', type: 'string', required: true, description: 'Proposer wallet' },
    ],
    enrichmentFields: [
      { name: 'title', type: 'string', required: false, description: 'Proposal title' },
      { name: 'githubPrUrl', type: 'string', required: false, description: 'Pull request link' },
    ],
    appSlug: 'Intuition-ideation-skill',
  },
  {
    id: 'ProblemStatement',
    label: 'Problem Statement',
    schemaOrgType: null,
    pluginId: 'problem-statement',
    category: 'abstract',
    description: 'Precise formulation of a user need or friction point being solved.',
    onchainFields: [
      { name: 'problemId', type: 'string', required: true, description: 'Problem identifier' },
      { name: 'severity', type: 'string', required: true, description: 'Low, Medium, High, Critical' },
    ],
    enrichmentFields: [
      { name: 'statement', type: 'string', required: false, description: 'Detailed problem text' },
    ],
    appSlug: 'Intuition-ideation-skill',
  },

  // ─── 14. Graph Visualizer ─────────────────────────────────
  {
    id: 'GraphLayout',
    label: 'Graph Layout',
    schemaOrgType: null,
    pluginId: 'graph-layout',
    category: 'software',
    description: 'Force simulation and styling parameters for rendering trust graphs.',
    onchainFields: [
      { name: 'layoutId', type: 'string', required: true, description: 'Layout identifier' },
      { name: 'engineType', type: 'string', required: true, description: 'd3-force or 3d-force' },
    ],
    enrichmentFields: [
      { name: 'springConstant', type: 'number', required: false, description: 'Link strength' },
    ],
    appSlug: 'Graph',
  },

  // ─── 15. Values Platform ──────────────────────────────────
  {
    id: 'OrganizationValue',
    label: 'Organization Value',
    schemaOrgType: 'DefinedTerm',
    pluginId: 'organization-value',
    category: 'abstract',
    description: 'Core organizational value or principle defined and voted on by community.',
    onchainFields: [
      { name: 'valueId', type: 'string', required: true, description: 'Value identifier' },
      { name: 'valueName', type: 'string', required: true, description: 'Value title' },
    ],
    enrichmentFields: [
      { name: 'definition', type: 'string', required: false, description: 'Philosophical meaning' },
    ],
    appSlug: 'Values',
  },
  {
    id: 'ValueProposal',
    label: 'Value Proposal',
    schemaOrgType: 'Proposal',
    pluginId: 'value-proposal',
    category: 'creative-work',
    description: 'Member submission proposing a new cultural value for community vote.',
    onchainFields: [
      { name: 'proposalId', type: 'string', required: true, description: 'Value proposal ID' },
      { name: 'proposerAddress', type: 'string', required: true, description: 'Proposer wallet' },
    ],
    enrichmentFields: [
      { name: 'motivation', type: 'string', required: false, description: 'Reason for proposal' },
    ],
    appSlug: 'Values',
  },
];

/**
 * Ecosystem Predicates for the 15 Intuition-Box applications
 */
export const ECOSYSTEM_PREDICATES: PredicateRule[] = [
  // ─── 1. Ontology ──────────────────────────────────────────
  {
    id: 'definesAtomType',
    label: 'defines atom type',
    description: 'Relates an ontology schema to the atom type definitions it introduces.',
    subjectTypes: ['OntologySchema'],
    objectTypes: ['AtomTypeDefinition'],
    group: 'Taxonomy & Classification',
    priority: 10,
    form: 'phrase',
    appSlug: 'Ontology',
  },
  {
    id: 'definesPredicate',
    label: 'defines predicate',
    description: 'Relates an ontology schema to the predicate rules it introduces.',
    subjectTypes: ['OntologySchema'],
    objectTypes: ['PredicateRule'],
    group: 'Taxonomy & Classification',
    priority: 11,
    form: 'phrase',
    appSlug: 'Ontology',
  },
  {
    id: 'allowsTriple',
    label: 'allows triple',
    description: 'Asserts that an atom type is permitted as subject for a predicate rule.',
    subjectTypes: ['AtomTypeDefinition'],
    objectTypes: ['PredicateRule'],
    group: 'Taxonomy & Classification',
    priority: 12,
    form: 'phrase',
    appSlug: 'Ontology',
  },

  // ─── 2. Atlas ─────────────────────────────────────────────
  {
    id: 'orbitsAt',
    label: 'orbits at',
    description: 'Specifies an identity\'s active orbit level within a community.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['OrbitLevel'],
    group: 'Social & Endorsement',
    priority: 15,
    form: 'phrase',
    appSlug: 'Atlas',
  },
  {
    id: 'completedQuest',
    label: 'completed quest',
    description: 'Records successful completion of a community quest by an identity.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['CommunityQuest'],
    group: 'Creation & Contribution',
    priority: 16,
    form: 'past',
    appSlug: 'Atlas',
  },

  // ─── 3. Fee Proxy Template ────────────────────────────────
  {
    id: 'proxiesFor',
    label: 'proxies for',
    description: 'Declares target MultiVault contract destination proxied by this contract.',
    subjectTypes: ['FeeProxyContract'],
    objectTypes: ['MultiVault'],
    group: 'Blockchain & Onchain',
    priority: 20,
    form: 'phrase',
    appSlug: 'Fee-Proxy-Template',
  },
  {
    id: 'routesFeeTo',
    label: 'routes fee to',
    description: 'Designates the beneficiary address receiving collected proxy fees.',
    subjectTypes: ['FeeProxyContract'],
    objectTypes: ['FeeRecipient'],
    group: 'Commerce & Products',
    priority: 21,
    form: 'phrase',
    appSlug: 'Fee-Proxy-Template',
  },
  {
    id: 'hasFeeConfig',
    label: 'has fee config',
    description: 'Associates a fee proxy contract with its active fee structure schedule.',
    subjectTypes: ['FeeProxyContract'],
    objectTypes: ['FeeConfig'],
    group: 'Commerce & Products',
    priority: 22,
    form: 'phrase',
    appSlug: 'Fee-Proxy-Template',
  },

  // ─── 4. Sofia Fee Proxy Dashboard ─────────────────────────
  {
    id: 'monitorsContract',
    label: 'monitors contract',
    description: 'Connects the Sofia dashboard to the underlying proxied contract.',
    subjectTypes: ['SofiaFeeProxy'],
    objectTypes: ['MultiVault'],
    group: 'Software & Tools',
    priority: 25,
    form: 'third-person-singular',
    appSlug: 'Sofia-Fee-Proxy-Dashboard',
  },
  {
    id: 'forwardedTransaction',
    label: 'forwarded transaction',
    description: 'Records an individual deposit or triple creation routed by the proxy.',
    subjectTypes: ['SofiaFeeProxy'],
    objectTypes: ['ForwardedTransaction'],
    group: 'Blockchain & Onchain',
    priority: 26,
    form: 'past',
    appSlug: 'Sofia-Fee-Proxy-Dashboard',
  },

  // ─── 5. Community Directory ───────────────────────────────
  {
    id: 'holdsBadge',
    label: 'holds badge',
    description: 'Attests that a community member has earned or been awarded a badge.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['BuilderBadge'],
    group: 'Social & Endorsement',
    priority: 30,
    form: 'third-person-singular',
    appSlug: 'community-directory',
  },

  // ─── 6. Spread Trust ──────────────────────────────────────
  {
    id: 'dispensedTrustTo',
    label: 'dispensed trust to',
    description: 'Records an onboarding gas or TRUST token transfer to an attendee.',
    subjectTypes: ['TrustDispenser'],
    objectTypes: ['EventAttendee', 'Person'],
    group: 'Blockchain & Onchain',
    priority: 35,
    form: 'past',
    appSlug: 'spread-trust',
  },

  // ─── 7. L3 Node ───────────────────────────────────────────
  {
    id: 'syncsL3Chain',
    label: 'syncs L3 chain',
    description: 'Asserts that a replica node tracks and syncs the target L3 network.',
    subjectTypes: ['L3ReplicaNode'],
    objectTypes: ['MultiVault'],
    group: 'Blockchain & Onchain',
    priority: 40,
    form: 'third-person-singular',
    appSlug: 'l3-node',
  },
  {
    id: 'verifiesSequencerBatches',
    label: 'verifies sequencer batches',
    description: 'Asserts that a validator or watchtower monitors sequencer block feeds.',
    subjectTypes: ['L3ReplicaNode'],
    objectTypes: ['SequencerFeed'],
    group: 'Blockchain & Onchain',
    priority: 41,
    form: 'third-person-singular',
    appSlug: 'l3-node',
  },

  // ─── 8. RPC Gateway ───────────────────────────────────────
  {
    id: 'exposesEndpoint',
    label: 'exposes endpoint',
    description: 'Connects an RPC gateway to an active HTTP or WebSocket interface.',
    subjectTypes: ['RpcGateway'],
    objectTypes: ['RpcEndpoint'],
    group: 'Software & Tools',
    priority: 45,
    form: 'third-person-singular',
    appSlug: 'RPC',
  },

  // ─── 9. MCP Inspector ─────────────────────────────────────
  {
    id: 'providesTool',
    label: 'provides tool',
    description: 'Lists an executable tool provided by an MCP server bundle.',
    subjectTypes: ['MCPServer'],
    objectTypes: ['MCPTool'],
    group: 'Software & Tools',
    priority: 50,
    form: 'third-person-singular',
    appSlug: 'mcp-inspector',
  },

  // ─── 10. 9atunments ───────────────────────────────────────
  {
    id: 'attunedTo',
    label: 'attuned to',
    description: 'Declares alignment with a harmonic frequency or ritual intention.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['AttunementFrequency'],
    group: 'Interests & Expertise',
    priority: 55,
    form: 'phrase',
    appSlug: '9atunments',
  },
  {
    id: 'participatedInRitual',
    label: 'participated in',
    description: 'Confirms active participation in an attunement ceremony.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['AttunementRitual'],
    group: 'Location & Events',
    priority: 56,
    form: 'past',
    appSlug: '9atunments',
  },

  // ─── 11. AgentId ──────────────────────────────────────────
  {
    id: 'hasCapability',
    label: 'has capability',
    description: 'Attests that an AI agent possesses and executes a specific capability.',
    subjectTypes: ['AIAgent'],
    objectTypes: ['AgentCapability'],
    group: 'Software & Tools',
    priority: 60,
    form: 'third-person-singular',
    appSlug: 'agentId',
  },

  // ─── 12. Orbyt ────────────────────────────────────────────
  {
    id: 'gravitatesTowards',
    label: 'gravitates towards',
    description: 'Specifies orbital attraction toward a central theme or gravity well.',
    subjectTypes: ['Person', 'AIAgent', 'Community'],
    objectTypes: ['GravityWell'],
    group: 'Social & Endorsement',
    priority: 65,
    form: 'third-person-singular',
    appSlug: 'orbyt',
  },

  // ─── 13. Intuition Ideation ───────────────────────────────
  {
    id: 'proposesIdea',
    label: 'proposes idea',
    description: 'Credits an identity with authoring an ecosystem idea proposal.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['IdeationProposal'],
    group: 'Creation & Contribution',
    priority: 70,
    form: 'third-person-singular',
    appSlug: 'Intuition-ideation-skill',
  },
  {
    id: 'addressesProblem',
    label: 'addresses problem',
    description: 'Connects an ideation proposal to the problem statement it solves.',
    subjectTypes: ['IdeationProposal'],
    objectTypes: ['ProblemStatement'],
    group: 'Taxonomy & Classification',
    priority: 71,
    form: 'third-person-singular',
    appSlug: 'Intuition-ideation-skill',
  },

  // ─── 14. Graph Visualizer ─────────────────────────────────
  {
    id: 'rendersAtomAsNode',
    label: 'renders atom',
    description: 'Maps an atom type to an interactive visual graph node.',
    subjectTypes: ['GraphLayout'],
    objectTypes: ['AtomTypeDefinition'],
    group: 'Software & Tools',
    priority: 75,
    form: 'third-person-singular',
    appSlug: 'Graph',
  },

  // ─── 15. Values Platform ──────────────────────────────────
  {
    id: 'embodiesValue',
    label: 'embodies value',
    description: 'Asserts that an organization formally commits to a core cultural value.',
    subjectTypes: ['Organization', 'Community'],
    objectTypes: ['OrganizationValue'],
    group: 'Interests & Expertise',
    priority: 80,
    form: 'third-person-singular',
    appSlug: 'Values',
  },
  {
    id: 'proposesValue',
    label: 'proposes value',
    description: 'Credits an identity with proposing a new value for community voting.',
    subjectTypes: ['Person', 'AIAgent'],
    objectTypes: ['ValueProposal'],
    group: 'Creation & Contribution',
    priority: 81,
    form: 'third-person-singular',
    appSlug: 'Values',
  },
];

/**
 * Example Claims for each ecosystem application type
 */
export const ECOSYSTEM_EXAMPLE_CLAIMS: Record<string, ExampleClaim[]> = {
  OntologySchema: [
    {
      subject: 'AgentID Schema',
      subjectType: 'OntologySchema',
      predicateId: 'definesAtomType',
      predicateLabel: 'defines atom type',
      object: 'AIAgent',
      objectType: 'AtomTypeDefinition',
    },
    {
      subject: 'AgentID Schema',
      subjectType: 'OntologySchema',
      predicateId: 'definesPredicate',
      predicateLabel: 'defines predicate',
      object: 'hasCapability',
      objectType: 'PredicateRule',
    },
  ],
  Community: [
    {
      subject: 'Alice',
      subjectType: 'Person',
      predicateId: 'memberOf',
      predicateLabel: 'member of',
      object: 'Intuition Box DAO',
      objectType: 'Community',
    },
  ],
  OrbitLevel: [
    {
      subject: 'Alice',
      subjectType: 'Person',
      predicateId: 'orbitsAt',
      predicateLabel: 'orbits at',
      object: 'Advocate Ring',
      objectType: 'OrbitLevel',
    },
  ],
  FeeProxyContract: [
    {
      subject: 'Intuition Fee Proxy v1',
      subjectType: 'FeeProxyContract',
      predicateId: 'proxiesFor',
      predicateLabel: 'proxies for',
      object: 'Intuition MultiVault',
      objectType: 'MultiVault',
    },
    {
      subject: 'Intuition Fee Proxy v1',
      subjectType: 'FeeProxyContract',
      predicateId: 'routesFeeTo',
      predicateLabel: 'routes fee to',
      object: 'Treasury Beneficiary',
      objectType: 'FeeRecipient',
    },
  ],
  SofiaFeeProxy: [
    {
      subject: 'Sofia Mainnet Proxy',
      subjectType: 'SofiaFeeProxy',
      predicateId: 'monitorsContract',
      predicateLabel: 'monitors contract',
      object: 'Intuition MultiVault',
      objectType: 'MultiVault',
    },
  ],
  AIAgent: [
    {
      subject: 'Sofia Browser Agent',
      subjectType: 'AIAgent',
      predicateId: 'hasCapability',
      predicateLabel: 'has capability',
      object: 'Trust Scoring',
      objectType: 'AgentCapability',
    },
  ],
  MCPServer: [
    {
      subject: '@intuition-box/mcp-trust',
      subjectType: 'MCPServer',
      predicateId: 'providesTool',
      predicateLabel: 'provides tool',
      object: 'calculate_eigentrust',
      objectType: 'MCPTool',
    },
  ],
  AttunementRitual: [
    {
      subject: 'Solstice Ritual 2026',
      subjectType: 'AttunementRitual',
      predicateId: 'attunedTo',
      predicateLabel: 'attuned to',
      object: '432 Hz Solfeggio',
      objectType: 'AttunementFrequency',
    },
  ],
  IdeationProposal: [
    {
      subject: 'Zero-Knowledge Trust Claims',
      subjectType: 'IdeationProposal',
      predicateId: 'addressesProblem',
      predicateLabel: 'addresses problem',
      object: 'Sybil Resistance in Private Graph',
      objectType: 'ProblemStatement',
    },
  ],
  OrganizationValue: [
    {
      subject: 'Intuition Box DAO',
      subjectType: 'Community',
      predicateId: 'embodiesValue',
      predicateLabel: 'embodies value',
      object: 'Permissionless Knowledge Curation',
      objectType: 'OrganizationValue',
    },
  ],
};
