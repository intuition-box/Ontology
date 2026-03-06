export interface ExampleClaim {
  subject: string;
  subjectType: string;
  predicateId: string;
  predicateLabel: string;
  object: string;
  objectType: string;
}

/**
 * Example claims for common entity types.
 * 2-3 realistic claims per type to help users understand the system.
 */
export const EXAMPLE_CLAIMS: Record<string, ExampleClaim[]> = {
  Person: [
    { subject: 'Billy', subjectType: 'Person', predicateId: 'founderOf', predicateLabel: 'founderOf', object: 'Intuition Foundation', objectType: 'Organization' },
    { subject: 'Billy', subjectType: 'Person', predicateId: 'expertIn', predicateLabel: 'expertIn', object: 'Cryptography', objectType: 'DefinedTerm' },
    { subject: 'Alice Johnson', subjectType: 'Person', predicateId: 'trusts', predicateLabel: 'trusts', object: 'Bob Smith', objectType: 'Person' },
  ],
  Organization: [
    { subject: 'Intuition Foundation', subjectType: 'Organization', predicateId: 'develops', predicateLabel: 'develops', object: 'Intuition', objectType: 'SoftwareSourceCode' },
    { subject: 'Uniswap Labs', subjectType: 'Organization', predicateId: 'offers', predicateLabel: 'offers', object: 'Uniswap Protocol', objectType: 'Service' },
    { subject: 'ConsenSys', subjectType: 'Organization', predicateId: 'employs', predicateLabel: 'employs', object: 'Joseph Lubin', objectType: 'Person' },
  ],
  SoftwareSourceCode: [
    { subject: 'Uniswap v3', subjectType: 'SoftwareSourceCode', predicateId: 'createdBy', predicateLabel: 'createdBy', object: 'Uniswap Labs', objectType: 'Organization' },
    { subject: 'OpenZeppelin', subjectType: 'SoftwareSourceCode', predicateId: 'taggedWith', predicateLabel: 'taggedWith', object: 'Smart Contracts', objectType: 'DefinedTerm' },
    { subject: 'Hardhat', subjectType: 'SoftwareSourceCode', predicateId: 'alternativeTo', predicateLabel: 'alternativeTo', object: 'Foundry', objectType: 'SoftwareSourceCode' },
  ],
  DefinedTerm: [
    { subject: 'DeFi', subjectType: 'DefinedTerm', predicateId: 'relatedTo', predicateLabel: 'relatedTo', object: 'Smart Contracts', objectType: 'DefinedTerm' },
    { subject: 'Zero-Knowledge Proofs', subjectType: 'DefinedTerm', predicateId: 'subConceptOf', predicateLabel: 'subConceptOf', object: 'Cryptography', objectType: 'DefinedTerm' },
  ],
  Place: [
    { subject: 'ETHDenver Venue', subjectType: 'Place', predicateId: 'locatedIn', predicateLabel: 'locatedIn', object: 'Denver, CO', objectType: 'Place' },
  ],
  Product: [
    { subject: 'Ledger Nano X', subjectType: 'Product', predicateId: 'soldBy', predicateLabel: 'soldBy', object: 'Ledger', objectType: 'Organization' },
    { subject: 'MetaMask Snaps', subjectType: 'Product', predicateId: 'taggedWith', predicateLabel: 'taggedWith', object: 'Wallet', objectType: 'DefinedTerm' },
  ],
  Event: [
    { subject: 'ETHDenver 2024', subjectType: 'Event', predicateId: 'locatedIn', predicateLabel: 'locatedIn', object: 'Denver, CO', objectType: 'Place' },
    { subject: 'Devcon 7', subjectType: 'Event', predicateId: 'organizedEvent', predicateLabel: 'organizedEvent', object: 'Intuition Foundation', objectType: 'Organization' },
  ],
  Article: [
    { subject: 'Intuition Whitepaper', subjectType: 'Article', predicateId: 'authoredBy', predicateLabel: 'authoredBy', object: 'Billy', objectType: 'Person' },
    { subject: 'State of L2s Report', subjectType: 'Article', predicateId: 'about', predicateLabel: 'about', object: 'Layer 2 Scaling', objectType: 'DefinedTerm' },
  ],
  EthereumAccount: [
    { subject: 'intuitionbilly.eth', subjectType: 'EthereumAccount', predicateId: 'ownedBy', predicateLabel: 'ownedBy', object: 'Billy', objectType: 'Person' },
  ],
  EthereumSmartContract: [
    { subject: 'Uniswap V3 Router', subjectType: 'EthereumSmartContract', predicateId: 'deployedOn', predicateLabel: 'deployedOn', object: 'Intuition Mainnet', objectType: 'Thing' },
  ],
  EthereumERC20: [
    { subject: 'UNI Token', subjectType: 'EthereumERC20', predicateId: 'tokenOf', predicateLabel: 'tokenOf', object: 'Uniswap Labs', objectType: 'Organization' },
  ],
  WebSite: [
    { subject: 'Etherscan', subjectType: 'WebSite', predicateId: 'hostedBy', predicateLabel: 'hostedBy', object: 'Etherscan Inc.', objectType: 'Organization' },
  ],
  Brand: [
    { subject: 'MetaMask', subjectType: 'Brand', predicateId: 'brandOf', predicateLabel: 'brandOf', object: 'ConsenSys', objectType: 'Organization' },
  ],
  Service: [
    { subject: 'Alchemy API', subjectType: 'Service', predicateId: 'soldBy', predicateLabel: 'soldBy', object: 'Alchemy', objectType: 'Organization' },
  ],
  SoftwareApplication: [
    { subject: 'MetaMask Extension', subjectType: 'SoftwareApplication', predicateId: 'developedBy', predicateLabel: 'developedBy', object: 'ConsenSys', objectType: 'Organization' },
  ],
};
