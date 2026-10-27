// Recorded from finney at block 9376750 by a one off read through preflight.core.chain. Offline demo only.
import type { LaunchPlan, SubnetCard, SubnetDetail } from "@/lib/types";

export const DEMO_SUBNETS: SubnetCard[] = [
  {
    "netuid": 1,
    "catalog": {
      "netuid": 1,
      "name": "Apex",
      "summary": "Competition platform where organizations post optimization problems with a benchmark and miners compete to submit the best algorithm",
      "capabilities": [
        "other"
      ],
      "operator": "Macrocosmos",
      "website": "https://apex.macrocosmos.ai",
      "github": "https://github.com/macrocosm-os/apex",
      "docs": "https://docs.macrocosmos.ai/subnets/readme.md",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://apex.macrocosmos.ai",
        "https://github.com/macrocosm-os/apex",
        "https://docs.macrocosmos.ai/llms.txt"
      ]
    },
    "live": {
      "netuid": 1,
      "name": "Apex",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 246,
      "validators": 10,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 99,
      "owner_coldkey": "5HCFWvRqzSHWRPecN7q8J6c7aKQnrCZTMHstPv39xL1wgDHh"
    },
    "health": {
      "netuid": 1,
      "score": 63,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 70,
          "weight": 0.4,
          "value": "7 of 10",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 3,
    "catalog": {
      "netuid": 3,
      "name": "Teutonic",
      "summary": "King-of-the-hill LLM pretraining competition; each winning MoE checkpoint is published to a public model bucket",
      "capabilities": [
        "training"
      ],
      "operator": null,
      "website": "https://www.teutonic.ai/",
      "github": "https://github.com/unarbos/teutonic",
      "docs": "https://teutonic.ai/llms.txt",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.teutonic.ai/",
        "https://teutonic.ai/llms.txt",
        "https://github.com/unarbos/teutonic"
      ]
    },
    "live": {
      "netuid": 3,
      "name": "Teutonic",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 252,
      "validators": 4,
      "max_uids": 256,
      "registration_cost_tao": 1.134600652,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5GsGUrd21bnkNxQsH2grv474y4gcDwCmp5xJ72KeokspZ2bg"
    },
    "health": {
      "netuid": 3,
      "score": 66,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 75,
          "weight": 0.4,
          "value": "3 of 4",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 2,
          "weight": 0.25,
          "value": "Gini 0.98",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 4,
    "catalog": {
      "netuid": 4,
      "name": "Targon",
      "summary": "Rent confidential GPU and CPU VMs, bare metal servers and sandboxes through a web console, CLI, SDK or REST API",
      "capabilities": [
        "compute",
        "security"
      ],
      "operator": "Manifold Labs, Inc.",
      "website": "https://targon.com",
      "github": "https://github.com/manifold-inc/targon",
      "docs": "https://docs.targon.com/",
      "api": "https://api.targon.com/tha/v3",
      "api_example": "curl -s https://api.targon.com/tha/v3/region",
      "api_needs_key": false,
      "sources": [
        "https://targon.com",
        "https://docs.targon.com/",
        "https://docs.targon.com/api/workloads",
        "https://github.com/manifold-inc/targon"
      ]
    },
    "live": {
      "netuid": 4,
      "name": "Targon",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 242,
      "validators": 14,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5CXGPMnq9RCCLUEvp9G2iUuabw69TSFM155UVS1S4Zmusaxv"
    },
    "health": {
      "netuid": 4,
      "score": 64,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 71,
          "weight": 0.4,
          "value": "10 of 14",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 5,
    "catalog": {
      "netuid": 5,
      "name": "Hone",
      "summary": "RLVR subnet where miners solve software engineering and terminal tasks that validators grade in isolated Docker sandboxes",
      "capabilities": [
        "training",
        "agents"
      ],
      "operator": null,
      "website": "https://honedashboard.com",
      "github": "https://github.com/hone-subnet-org/hone-subnet",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://honedashboard.com",
        "https://github.com/hone-subnet-org/hone-subnet"
      ]
    },
    "live": {
      "netuid": 5,
      "name": "Hone",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 245,
      "validators": 11,
      "max_uids": 256,
      "registration_cost_tao": 0.757685804,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5GurNtB3yQFCh6CSmfH7LrYJDsvzup4diHZiaYtKe274nrMX"
    },
    "health": {
      "netuid": 5,
      "score": 94,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 91,
          "weight": 0.4,
          "value": "10 of 11",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 90,
          "weight": 0.25,
          "value": "Gini 0.10",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 8,
    "catalog": {
      "netuid": 8,
      "name": "Vanta",
      "summary": "Trading signal network that scores miner positions on forex, crypto, equities and commodities and funds top traders",
      "capabilities": [
        "finance",
        "prediction"
      ],
      "operator": "Taoshi",
      "website": "https://www.vantanetwork.io/",
      "github": "https://github.com/taoshidev/vanta-network",
      "docs": "https://app.vantatrading.io/docs",
      "api": "https://app.vantatrading.io",
      "api_example": null,
      "api_needs_key": true,
      "sources": [
        "https://www.vantanetwork.io/",
        "https://github.com/taoshidev/vanta-network",
        "https://vantatrading.io",
        "https://app.vantatrading.io/docs"
      ]
    },
    "live": {
      "netuid": 8,
      "name": "Vanta",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 238,
      "validators": 18,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5F6tnxzAAxbhaWRmeUmB63JEM3VXBNSmqb3AwYJVDStQjw8y"
    },
    "health": {
      "netuid": 8,
      "score": 62,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 67,
          "weight": 0.4,
          "value": "12 of 18",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 9,
    "catalog": {
      "netuid": 9,
      "name": "iota",
      "summary": "Framework for pretraining LLMs across heterogeneous permissionless miners using data and pipeline parallelism",
      "capabilities": [
        "training"
      ],
      "operator": "Macrocosmos",
      "website": "https://iota.macrocosmos.ai/",
      "github": "https://github.com/macrocosm-os/iota",
      "docs": "https://docs.macrocosmos.ai",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://iota.macrocosmos.ai/",
        "https://github.com/macrocosm-os/iota"
      ]
    },
    "live": {
      "netuid": 9,
      "name": "iota",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 243,
      "validators": 13,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FsbubeciqtB5Nik3umL2iD4fG8FcC9GbT9nHJfXMj4mJJZ9"
    },
    "health": {
      "netuid": 9,
      "score": 69,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 85,
          "weight": 0.4,
          "value": "11 of 13",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 11,
    "catalog": {
      "netuid": 11,
      "name": "TrajectoryRL",
      "summary": "Competition for fusion policies that route agent requests across open-weight models on Engy; the winner is served as engy/auto",
      "capabilities": [
        "agents",
        "inference"
      ],
      "operator": null,
      "website": "https://trajrl.com",
      "github": "https://github.com/trajectoryRL/trajectoryRL",
      "docs": "https://trajrl.com/docs",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://trajrl.com",
        "https://trajrl.com/docs",
        "https://github.com/trajectoryRL/trajectoryRL"
      ]
    },
    "live": {
      "netuid": 11,
      "name": "TrajectoryRL",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 248,
      "validators": 8,
      "max_uids": 256,
      "registration_cost_tao": 0.033532271,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5D2Jhtbnm7iAdKfjRk6DisXBnr1MEsYat8kXqaPNrVqJP3uE"
    },
    "health": {
      "netuid": 11,
      "score": 65,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 75,
          "weight": 0.4,
          "value": "6 of 8",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 13,
    "catalog": {
      "netuid": 13,
      "name": "Data Universe",
      "summary": "Social media data from X, Reddit and YouTube via an on-demand API, scheduled dataset jobs and a dataset marketplace",
      "capabilities": [
        "data"
      ],
      "operator": "Macrocosmos",
      "website": "https://datauniverse.macrocosmos.ai/",
      "github": "https://github.com/macrocosm-os/data-universe",
      "docs": "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme.md",
      "api": "https://constellation.api.cloud.macrocosmos.ai",
      "api_example": null,
      "api_needs_key": true,
      "sources": [
        "https://datauniverse.macrocosmos.ai/",
        "https://github.com/macrocosm-os/data-universe",
        "https://docs.macrocosmos.ai/llms.txt",
        "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme.md",
        "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme/gravity.md"
      ]
    },
    "live": {
      "netuid": 13,
      "name": "Data Universe",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 247,
      "validators": 9,
      "max_uids": 256,
      "registration_cost_tao": 0.092484507,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5HBswBt1A9Ahx6U76abXXGd7VmabmCNBGhSK2vrP71GSxtgZ"
    },
    "health": {
      "netuid": 13,
      "score": 76,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 89,
          "weight": 0.4,
          "value": "8 of 9",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 23,
          "weight": 0.25,
          "value": "Gini 0.77",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 15,
    "catalog": {
      "netuid": 15,
      "name": "ORO",
      "summary": "Benchmark and competition for AI shopping agents run in sandboxed ORO Bench worlds, with a public leaderboard API",
      "capabilities": [
        "agents"
      ],
      "operator": "ORO AI",
      "website": "https://oroagents.com",
      "github": "https://github.com/ORO-AI/oro",
      "docs": "https://oroagents.com/docs",
      "api": "https://api.oroagents.com",
      "api_example": "curl -s \"https://api.oroagents.com/v1/public/leaderboard\"",
      "api_needs_key": false,
      "sources": [
        "https://oroagents.com",
        "https://oroagents.com/docs",
        "https://oroagents.com/docs/api",
        "https://github.com/ORO-AI/oro"
      ]
    },
    "live": {
      "netuid": 15,
      "name": "ORO",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 244,
      "validators": 12,
      "max_uids": 256,
      "registration_cost_tao": 0.394440027,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5EHdase3QHY1FSU2KoxzpbnkzGhxBZEVcWU85zyjrxG62KTK"
    },
    "health": {
      "netuid": 15,
      "score": 65,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 75,
          "weight": 0.4,
          "value": "9 of 12",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 17,
    "catalog": {
      "netuid": 17,
      "name": "404-GEN",
      "summary": "Text-to-3D generation (Gaussian splats and meshes) via a web app and Blender and Unity plugins; miners compete on 3D models",
      "capabilities": [
        "3d"
      ],
      "operator": null,
      "website": "https://www.404.xyz",
      "github": "https://github.com/404-Repo/404-gen-subnet",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.404.xyz",
        "https://www.404.xyz/about",
        "https://www.404.xyz/app",
        "https://www.404.xyz/plugin",
        "https://github.com/404-Repo/404-gen-subnet"
      ]
    },
    "live": {
      "netuid": 17,
      "name": "404-GEN",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 242,
      "validators": 14,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5E7a4a7QETrNjoZ2SbVSJMaavrQeyTEaHgjBPDUDxBKjUaMZ"
    },
    "health": {
      "netuid": 17,
      "score": 63,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 71,
          "weight": 0.4,
          "value": "10 of 14",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 19,
    "catalog": {
      "netuid": 19,
      "name": "blockmachine",
      "summary": "Verified RPC and archive nodes for Bittensor, Ethereum and other EVM chains, with free keyless public endpoints",
      "capabilities": [
        "data"
      ],
      "operator": null,
      "website": "https://blockmachine.io",
      "github": "https://github.com/taostat/blockmachine",
      "docs": "https://blockmachine.io/public-rpc-endpoints",
      "api": "https://rpc-eth.blockmachine.io",
      "api_example": "curl -X POST \"https://rpc-eth.blockmachine.io\" -H \"Content-Type: application/json\" -d '{\"jsonrpc\": \"2.0\", \"method\": \"eth_blockNumber\", \"params\": [], \"id\": 1}'",
      "api_needs_key": false,
      "sources": [
        "https://blockmachine.io",
        "https://blockmachine.io/public-rpc-endpoints",
        "https://github.com/taostat/blockmachine"
      ]
    },
    "live": {
      "netuid": 19,
      "name": "blockmachine",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 245,
      "validators": 11,
      "max_uids": 256,
      "registration_cost_tao": 0.999999999,
      "registration_allowed": true,
      "tempo": 7200,
      "owner_coldkey": "5FWh37LfVV5LE9dZA91STzbtebh6vxYa3MH71c621sYafo1L"
    },
    "health": {
      "netuid": 19,
      "score": 69,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 82,
          "weight": 0.4,
          "value": "9 of 11",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 3,
          "weight": 0.25,
          "value": "Gini 0.97",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 26,
    "catalog": null,
    "live": {
      "netuid": 26,
      "name": "Perturb",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 251,
      "validators": 5,
      "max_uids": 256,
      "registration_cost_tao": 0.1,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FsVAEPMpkAo3eP7xTNJYLyBndi2oT5GPxVPzFT1DzSD82qx"
    },
    "health": {
      "netuid": 26,
      "score": 51,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 40,
          "weight": 0.4,
          "value": "2 of 5",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 28,
    "catalog": {
      "netuid": 28,
      "name": "SayGM",
      "summary": "LLM gateway with OpenAI, Anthropic and Gemini compatible APIs for Claude, GPT, Gemini and open models, some served in TEEs",
      "capabilities": [
        "inference"
      ],
      "operator": "T34 Corporation FZCO",
      "website": "https://saygm.com/",
      "github": "https://github.com/taostat/gm-miner",
      "docs": "https://docs.saygm.com",
      "api": "https://api.saygm.com/v1",
      "api_example": "curl -fsSL \"https://api.saygm.com/v1/models?api_shape=chat.completions\"",
      "api_needs_key": false,
      "sources": [
        "https://saygm.com/",
        "https://docs.saygm.com",
        "https://docs.saygm.com/getting-started/quickstart/",
        "https://github.com/taostat/gm-miner"
      ]
    },
    "live": {
      "netuid": 28,
      "name": "SayGM",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 245,
      "validators": 11,
      "max_uids": 256,
      "registration_cost_tao": 0.10273862,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5CA6rwAytZvvyZhLYEzo79627QEV422Q8kD51DEnTaRQxm45"
    },
    "health": {
      "netuid": 28,
      "score": 73,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 82,
          "weight": 0.4,
          "value": "9 of 11",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 22,
          "weight": 0.25,
          "value": "Gini 0.78",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 34,
    "catalog": {
      "netuid": 34,
      "name": "Yugos",
      "summary": "OpenAI-compatible router API that picks the model, provider and effort for each request; miners compete on the router",
      "capabilities": [
        "inference"
      ],
      "operator": "BitMind Holdings Limited",
      "website": "https://yugos.ai",
      "github": "https://github.com/BitMind-AI/yugos",
      "docs": "https://yugos.ai/docs",
      "api": "https://api.yugos.ai/v1",
      "api_example": "curl -s https://api.yugos.ai/v1/catalog -H \"Authorization: Bearer $API_KEY\"",
      "api_needs_key": true,
      "sources": [
        "https://yugos.ai",
        "https://yugos.ai/docs",
        "https://github.com/BitMind-AI/yugos"
      ]
    },
    "live": {
      "netuid": 34,
      "name": "Yugos",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 250,
      "validators": 6,
      "max_uids": 256,
      "registration_cost_tao": 0.5,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5DthmKBR83sUdudSfgFnsxBkTYtYTFLJUgovNfb1TSKVLiTH"
    },
    "health": {
      "netuid": 34,
      "score": 68,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 83,
          "weight": 0.4,
          "value": "5 of 6",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 38,
    "catalog": {
      "netuid": 38,
      "name": "ChronoLLM",
      "summary": "LLMs trained only on data up to a cutoff year, for backtesting and quant research without lookahead bias",
      "capabilities": [
        "training",
        "finance"
      ],
      "operator": "Crunch (CrunchDAO)",
      "website": "https://chronollm.com/",
      "github": "https://github.com/chronollm/sn38",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://chronollm.crunchdao.com/",
        "https://chronollm.com/",
        "https://github.com/chronollm/sn38"
      ]
    },
    "live": {
      "netuid": 38,
      "name": "ChronoLLM",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 244,
      "validators": 12,
      "max_uids": 256,
      "registration_cost_tao": 0.74,
      "registration_allowed": true,
      "tempo": 1440,
      "owner_coldkey": "5GeWgtBAu2ezYo83sPM7VyEigAfEc3vnqqxRzbMXYVYwEV62"
    },
    "health": {
      "netuid": 38,
      "score": 48,
      "band": "at_risk",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 33,
          "weight": 0.4,
          "value": "4 of 12",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 44,
    "catalog": {
      "netuid": 44,
      "name": "Score",
      "summary": "Vision models that turn live video into structured data, starting with professional sports; miners compete on models",
      "capabilities": [
        "video"
      ],
      "operator": "Score",
      "website": "https://www.wearescore.com/",
      "github": "https://github.com/score-technologies/turbovision",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.wearescore.com/",
        "https://github.com/score-technologies/turbovision"
      ]
    },
    "live": {
      "netuid": 44,
      "name": "Score",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 241,
      "validators": 15,
      "max_uids": 256,
      "registration_cost_tao": 0.05,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5CaCekuxb9pKQyLoxh3jbkEXig8fxjkeS4AQ6UmZa12xfQ9H"
    },
    "health": {
      "netuid": 44,
      "score": 40,
      "band": "at_risk",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 13,
          "weight": 0.4,
          "value": "2 of 15",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 51,
    "catalog": {
      "netuid": 51,
      "name": "lium.io",
      "summary": "Hourly NVIDIA GPU rental marketplace with web, CLI, Python SDK and API access; nodes are checked by SN51 validators",
      "capabilities": [
        "compute"
      ],
      "operator": null,
      "website": "https://lium.io",
      "github": "https://github.com/Datura-ai/lium-io",
      "docs": "https://docs.lium.io",
      "api": "https://lium.io/api/public/v1",
      "api_example": "curl -sSL https://lium.io/api/public/v1/nodes",
      "api_needs_key": false,
      "sources": [
        "https://lium.io",
        "https://docs.lium.io/developers",
        "https://docs.lium.io/developers/public-nodes-feed",
        "https://github.com/Datura-ai/lium-io"
      ]
    },
    "live": {
      "netuid": 51,
      "name": "lium.io",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 245,
      "validators": 11,
      "max_uids": 256,
      "registration_cost_tao": 0.5,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FqACMtcegZxxopgu1g7TgyrnyD8skurr9QDPLPhxNQzsThe"
    },
    "health": {
      "netuid": 51,
      "score": 64,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 73,
          "weight": 0.4,
          "value": "8 of 11",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 53,
    "catalog": {
      "netuid": 53,
      "name": "engy",
      "summary": "OpenAI and Anthropic compatible inference for open models, with proofs that the pinned model weights actually ran",
      "capabilities": [
        "inference",
        "video"
      ],
      "operator": "hanlin.ai",
      "website": "https://engy.ai",
      "github": "https://github.com/hanlinai/engy",
      "docs": "https://engy.ai/docs",
      "api": "https://api.engy.ai/v1",
      "api_example": "curl -s https://api.engy.ai/v1/models",
      "api_needs_key": false,
      "sources": [
        "https://engy.ai",
        "https://engy.ai/docs",
        "https://engy.ai/docs/get-started/quickstart",
        "https://engy.ai/docs/api-reference",
        "https://github.com/hanlinai/engy"
      ]
    },
    "live": {
      "netuid": 53,
      "name": "engy",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 239,
      "validators": 17,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5H8SFVCxk52ag1YSC5bQw7B84NRNhAtYWAP81jEPfuJ3VL8Q"
    },
    "health": {
      "netuid": 53,
      "score": 67,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 76,
          "weight": 0.4,
          "value": "13 of 17",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 5,
          "weight": 0.25,
          "value": "Gini 0.95",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 54,
    "catalog": null,
    "live": {
      "netuid": 54,
      "name": "Yanez",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 247,
      "validators": 9,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FUfruyVDoDsCty1Sh7tCmHVdpoC3XV1nUZYjhcpfe31Defk"
    },
    "health": {
      "netuid": 54,
      "score": 72,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 89,
          "weight": 0.4,
          "value": "8 of 9",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 5,
          "weight": 0.25,
          "value": "Gini 0.95",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 56,
    "catalog": {
      "netuid": 56,
      "name": "Gradients",
      "summary": "AutoML training of text and image models through a web app and API; miners compete in open-source training tournaments",
      "capabilities": [
        "training"
      ],
      "operator": null,
      "website": "https://www.gradients.io/",
      "github": "https://github.com/gradients-ai/G.O.D",
      "docs": null,
      "api": "https://api.gradients.io/v1",
      "api_example": "curl --request POST --url https://api.gradients.io/v1/tasks/create --header \"Authorization: $API_KEY\" --header 'Content-Type: application/json' --data '{\"model_repo\": \"\", \"ds_repo\": \"\", \"instruction_col\": \"\", \"hours_to_complete\": 1}'",
      "api_needs_key": true,
      "sources": [
        "https://www.gradients.io/",
        "https://github.com/gradients-ai/G.O.D"
      ]
    },
    "live": {
      "netuid": 56,
      "name": "Gradients",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 241,
      "validators": 15,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5EJ1zbdwhumTRYFx3VCGnR6SW7CJWP28tEJCo2gw1dFbVL5g"
    },
    "health": {
      "netuid": 56,
      "score": 67,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 80,
          "weight": 0.4,
          "value": "12 of 15",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 61,
    "catalog": {
      "netuid": 61,
      "name": "RedTeam",
      "summary": "Cybersecurity programming challenges where miners submit code solutions scored daily for quality and originality",
      "capabilities": [
        "security"
      ],
      "operator": "Innerworks",
      "website": "https://www.theredteam.io/",
      "github": "https://github.com/RedTeamSubnet/RedTeam",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.theredteam.io/",
        "https://github.com/RedTeamSubnet/RedTeam"
      ]
    },
    "live": {
      "netuid": 61,
      "name": "RedTeam",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 244,
      "validators": 12,
      "max_uids": 256,
      "registration_cost_tao": 0.053089202,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5ECEsYL82fbXx9KfTZy7G2KXSurnScciJyAVMHZjekc8jUbn"
    },
    "health": {
      "netuid": 61,
      "score": 73,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 83,
          "weight": 0.4,
          "value": "10 of 12",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 18,
          "weight": 0.25,
          "value": "Gini 0.82",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 62,
    "catalog": {
      "netuid": 62,
      "name": "Ridges",
      "summary": "Software engineering agents: Ridgeline turns a GitHub issue into a pull request; miners compete to improve the agent",
      "capabilities": [
        "agents"
      ],
      "operator": null,
      "website": "https://www.ridges.ai/",
      "github": "https://github.com/ridgesai/ridges",
      "docs": "https://docs.ridges.ai",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://docs.ridges.ai",
        "https://docs.ridges.ai/llms.txt",
        "https://github.com/ridgesai/ridges"
      ]
    },
    "live": {
      "netuid": 62,
      "name": "Ridges",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 233,
      "validators": 23,
      "max_uids": 256,
      "registration_cost_tao": 0.000708528,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5DhsVYewpCdQQUenHU52k5Cys1WsTWTt5V5m84D3n4L8FWDS"
    },
    "health": {
      "netuid": 62,
      "score": 60,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 57,
          "weight": 0.4,
          "value": "13 of 23",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 8,
          "weight": 0.25,
          "value": "Gini 0.92",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 64,
    "catalog": {
      "netuid": 64,
      "name": "Chutes",
      "summary": "Serverless inference and deployment of open-source AI models on decentralized GPUs, with a REST API and SDK",
      "capabilities": [
        "inference",
        "compute"
      ],
      "operator": "Chutes Global Corp",
      "website": "https://chutes.ai",
      "github": "https://github.com/chutesai/chutes",
      "docs": "https://chutes.ai/docs",
      "api": "https://api.chutes.ai",
      "api_example": "curl -X GET \"https://api.chutes.ai/invocations/stats/llm\"",
      "api_needs_key": false,
      "sources": [
        "https://chutes.ai/docs",
        "https://chutes.ai/docs/api-reference/overview",
        "https://chutes.ai/docs/api-reference/authentication",
        "https://chutes.ai/docs/api-reference/invocations",
        "https://github.com/chutesai/chutes"
      ]
    },
    "live": {
      "netuid": 64,
      "name": "Chutes",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 239,
      "validators": 17,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FRYKhbmfXPDoHdUUDMx27E3HuMvAzwjzFMMq3rNurUhAyS9"
    },
    "health": {
      "netuid": 64,
      "score": 66,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 76,
          "weight": 0.4,
          "value": "13 of 17",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 4,
          "weight": 0.25,
          "value": "Gini 0.96",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 68,
    "catalog": {
      "netuid": 68,
      "name": "NOVA",
      "summary": "Open drug discovery competitions for small molecules, nanobodies and chemical search, scored by ML prediction models",
      "capabilities": [
        "science"
      ],
      "operator": "Metanova Labs",
      "website": "https://www.metanova-labs.ai",
      "github": "https://github.com/metanova-labs/nova",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.metanova-labs.ai",
        "https://www.metanova-labs.ai/nova",
        "https://github.com/metanova-labs/nova"
      ]
    },
    "live": {
      "netuid": 68,
      "name": "NOVA",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 57,
      "validators": 7,
      "max_uids": 64,
      "registration_cost_tao": 0.068956069,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5EcdJLAeYoxM3Tsf5VZ3NQPenPku218gqnjSoo3iJNy4V12V"
    },
    "health": {
      "netuid": 68,
      "score": 70,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 86,
          "weight": 0.4,
          "value": "6 of 7",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 2,
          "weight": 0.25,
          "value": "Gini 0.98",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 75,
    "catalog": {
      "netuid": 75,
      "name": "Hippius",
      "summary": "Decentralized cloud with S3-compatible storage, encrypted drive, CDN, model and container registry and confidential VMs",
      "capabilities": [
        "storage",
        "compute"
      ],
      "operator": null,
      "website": "https://hippius.com/",
      "github": "https://github.com/thenervelab/thebrain",
      "docs": "https://docs.hippius.com",
      "api": "https://s3.hippius.com",
      "api_example": "aws s3 presign s3://my-bucket/hello.txt --expires-in 86400 --endpoint-url https://s3.hippius.com",
      "api_needs_key": true,
      "sources": [
        "https://hippius.com/",
        "https://docs.hippius.com",
        "https://docs.hippius.com/storage/s3/advanced",
        "https://docs.hippius.com/blockchain/api",
        "https://github.com/thenervelab/thebrain"
      ]
    },
    "live": {
      "netuid": 75,
      "name": "Hippius",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 244,
      "validators": 12,
      "max_uids": 256,
      "registration_cost_tao": 0.999999999,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5DAQpczEK4vzBn1waHkC4BZGqGPZ1dwPxKVsj36JDofHAw3a"
    },
    "health": {
      "netuid": 75,
      "score": 72,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 92,
          "weight": 0.4,
          "value": "11 of 12",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 80,
    "catalog": {
      "netuid": 80,
      "name": "OpenRoboto",
      "summary": "Competition to improve robot VLA models in simulation and on real xArm robots, plus egocentric data collection",
      "capabilities": [
        "training",
        "data"
      ],
      "operator": null,
      "website": "https://www.openroboto.ai/",
      "github": "https://github.com/openroboto-ai/openroboto-subnet",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.openroboto.ai/",
        "https://github.com/openroboto-ai/openroboto-subnet"
      ]
    },
    "live": {
      "netuid": 80,
      "name": "OpenRoboto",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 242,
      "validators": 14,
      "max_uids": 256,
      "registration_cost_tao": 0.000522631,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5CG1eFiaZkWTCUEjD23i7Uiu6AjTkLkgkCu3EyXKFFAkkT2T"
    },
    "health": {
      "netuid": 80,
      "score": 61,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 64,
          "weight": 0.4,
          "value": "9 of 14",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 2,
          "weight": 0.25,
          "value": "Gini 0.98",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 83,
    "catalog": {
      "netuid": 83,
      "name": "CliqueAI",
      "summary": "Distributed solver network for the maximum clique graph problem; miners are scored on optimality and diversity",
      "capabilities": [
        "other"
      ],
      "operator": null,
      "website": "https://cliqueai.toptensor.ai/",
      "github": "https://github.com/toptensor/CliqueAI",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://cliqueai.toptensor.ai/",
        "https://github.com/toptensor/CliqueAI"
      ]
    },
    "live": {
      "netuid": 83,
      "name": "CliqueAI",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 248,
      "validators": 8,
      "max_uids": 256,
      "registration_cost_tao": 0.1,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5DqEjRLyNN8k3WbEXhA36tyGG4YpWyPEcVSTa47XxspNHhc3"
    },
    "health": {
      "netuid": 83,
      "score": 90,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 100,
          "weight": 0.4,
          "value": "8 of 8",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 58,
          "weight": 0.25,
          "value": "Gini 0.42",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 90,
    "catalog": {
      "netuid": 90,
      "name": "KubeTEE",
      "summary": "Confidential Kubernetes clusters running inference, retrieval, agents and batch jobs inside GPU TEEs on miner hardware",
      "capabilities": [
        "compute",
        "inference",
        "security"
      ],
      "operator": "KubeTEE AI",
      "website": "https://kubetee.ai",
      "github": "https://github.com/KubeTEE-AI/kubetee-subnet",
      "docs": null,
      "api": "https://llm.kubetee.ai",
      "api_example": "curl -s https://llm.kubetee.ai/v1/models -H \"Authorization: Bearer $API_KEY\"",
      "api_needs_key": true,
      "sources": [
        "https://kubetee.ai",
        "https://llm.kubetee.ai",
        "https://llm.kubetee.ai/openapi.json",
        "https://github.com/KubeTEE-AI/kubetee-subnet"
      ]
    },
    "live": {
      "netuid": 90,
      "name": "KubeTEE",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 122,
      "validators": 9,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5C9y6fnLPSzBeh1Np7f4DnGen42xV29nL9qZTDuwpVC4iTEE"
    },
    "health": {
      "netuid": 90,
      "score": 75,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 100,
          "weight": 0.4,
          "value": "9 of 9",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 92,
    "catalog": {
      "netuid": 92,
      "name": "REAX",
      "summary": "Verified inference for typed decision models that answer choice and score questions, sold through the Decision Models API",
      "capabilities": [
        "inference"
      ],
      "operator": "productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG",
      "website": "https://reax.co/",
      "github": "https://github.com/reaxlabs/reax-subnet",
      "docs": "https://reax.dev/",
      "api": "https://api.decisionmodels.io",
      "api_example": "curl https://api.decisionmodels.io/v1/systemone -H \"Authorization: Bearer $DECISIONMODELS_API_KEY\" -H \"Content-Type: application/json\" -H \"S1-Region: global\" -d '{\"model\": \"s1-fast\", \"state\": \"Mia owns a red bicycle.\", \"questions\": {\"color\": {\"type\": \"choice\", \"instructions\": \"Which color is the bicycle?\", \"criteria\": {\"red\": null, \"blue\": null}}}}'",
      "api_needs_key": true,
      "sources": [
        "https://reax.co/",
        "https://decisionmodels.io/",
        "https://github.com/reaxlabs/reax-subnet"
      ]
    },
    "live": {
      "netuid": 92,
      "name": "REAX",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 252,
      "validators": 4,
      "max_uids": 256,
      "registration_cost_tao": 0.633609535,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5GMxpAvB9iJkDtNDELhVn8GmbBz5XChnWcLaThWTJ38QmU6B"
    },
    "health": {
      "netuid": 92,
      "score": 72,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 75,
          "weight": 0.4,
          "value": "3 of 4",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 28,
          "weight": 0.25,
          "value": "Gini 0.72",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 93,
    "catalog": {
      "netuid": 93,
      "name": "Bitcast",
      "summary": "Pays creators on YouTube and X for content that meets brand briefs, scored on verified audience engagement",
      "capabilities": [
        "other"
      ],
      "operator": null,
      "website": "https://bitcast.network/",
      "github": "https://github.com/bitcast-network/bitcast",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://stats.bitcast.network/",
        "https://bitcast.network/",
        "https://github.com/bitcast-network/bitcast"
      ]
    },
    "live": {
      "netuid": 93,
      "name": "Bitcast",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 241,
      "validators": 15,
      "max_uids": 256,
      "registration_cost_tao": 0.005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5EbY1SebUuz189w1G96JN4mmHnShAECA6JefCRYhSLqyYg2c"
    },
    "health": {
      "netuid": 93,
      "score": 62,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 67,
          "weight": 0.4,
          "value": "10 of 15",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 97,
    "catalog": {
      "netuid": 97,
      "name": "Ingot",
      "summary": "Competition to quantize Qwen3.8-27B to ternary weights closest to the teacher; winning GGUF models go to Hugging Face",
      "capabilities": [
        "training"
      ],
      "operator": null,
      "website": "https://theingot.ai",
      "github": "https://github.com/DendriteLabs/ingot",
      "docs": "https://theingot.ai/llms.txt",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://theingot.ai",
        "https://theingot.ai/llms.txt",
        "https://github.com/DendriteLabs/ingot"
      ]
    },
    "live": {
      "netuid": 97,
      "name": "Ingot",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 252,
      "validators": 4,
      "max_uids": 256,
      "registration_cost_tao": 0.130086751,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5GnW8owmMGn83WqL9JNYytmw458UYrTT6Ra5fH8TTUkzEbTb"
    },
    "health": {
      "netuid": 97,
      "score": 66,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 75,
          "weight": 0.4,
          "value": "3 of 4",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 2,
          "weight": 0.25,
          "value": "Gini 0.98",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 107,
    "catalog": {
      "netuid": 107,
      "name": "Minos",
      "summary": "Genomic variant calling benchmark where miners tune variant callers on synthetic challenge genomes; keyless read-only MCP",
      "capabilities": [
        "science"
      ],
      "operator": null,
      "website": "https://theminos.ai",
      "github": "https://github.com/minos-protocol/minos_subnet",
      "docs": "https://docs.theminos.ai",
      "api": "https://mcp.theminos.ai",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://theminos.ai",
        "https://docs.theminos.ai",
        "https://mcp.theminos.ai/docs",
        "https://github.com/minos-protocol/minos_subnet"
      ]
    },
    "live": {
      "netuid": 107,
      "name": "Minos",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 92,
      "validators": 8,
      "max_uids": 100,
      "registration_cost_tao": 0.99,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5DA2vLrSXZxnT9G4Yrywx1Fpi4RXwMH1Ah7r8DTTWS7UZZBM"
    },
    "health": {
      "netuid": 107,
      "score": 76,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 100,
          "weight": 0.4,
          "value": "8 of 8",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 4,
          "weight": 0.25,
          "value": "Gini 0.96",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 110,
    "catalog": {
      "netuid": 110,
      "name": "Green Compute",
      "summary": "RTX 4090 GPU rental and OpenAI-compatible inference on hardware powered by renewable and biogas energy",
      "capabilities": [
        "compute",
        "inference"
      ],
      "operator": "Green Compute",
      "website": "https://www.green-compute.com/",
      "github": null,
      "docs": "https://www.green-compute.com/docs",
      "api": "https://api.green-compute.com",
      "api_example": "curl api.green-compute.com/platform/pricing",
      "api_needs_key": false,
      "sources": [
        "https://www.green-compute.com/",
        "https://www.green-compute.com/llms.txt"
      ]
    },
    "live": {
      "netuid": 110,
      "name": "Green Compute",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 241,
      "validators": 15,
      "max_uids": 256,
      "registration_cost_tao": 0.0005,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5D53sX6AwAzXUB24G85Ch35hYr5rCpXjYFWpFTe4uzBb75sL"
    },
    "health": {
      "netuid": 110,
      "score": 70,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 87,
          "weight": 0.4,
          "value": "13 of 15",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 112,
    "catalog": {
      "netuid": 112,
      "name": "THOR",
      "summary": "Labels first-person video of hands-on tasks into timed, captioned steps for robotics training data; network not live yet",
      "capabilities": [
        "data",
        "video"
      ],
      "operator": "THOR",
      "website": "https://thormachines.ai/",
      "github": "https://github.com/thorrobotics/thor-subnet",
      "docs": "https://thormachines.ai/docs",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://thormachines.ai/",
        "https://thormachines.ai/docs",
        "https://github.com/thorrobotics/thor-subnet"
      ]
    },
    "live": {
      "netuid": 112,
      "name": "THOR",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 247,
      "validators": 9,
      "max_uids": 256,
      "registration_cost_tao": 0.99,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5HDswRwsoc9xfzpQRD7PfEGESUmHhdFm9dNH8Y65K59vJEAm"
    },
    "health": {
      "netuid": 112,
      "score": 66,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 78,
          "weight": 0.4,
          "value": "7 of 9",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 0,
          "weight": 0.25,
          "value": "Gini 1.00",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 114,
    "catalog": {
      "netuid": 114,
      "name": "SOMA",
      "summary": "Context compression proxy between coding agents and LLMs that cuts tokens; miners compete on compression methods",
      "capabilities": [
        "agents",
        "inference"
      ],
      "operator": "Dendrite Quantum LTD",
      "website": "https://thesoma.ai",
      "github": "https://github.com/DendriteHQ/SOMA",
      "docs": "https://thesoma.ai/docs",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://thesoma.ai",
        "https://thesoma.ai/docs",
        "https://github.com/DendriteHQ/SOMA"
      ]
    },
    "live": {
      "netuid": 114,
      "name": "SOMA",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 247,
      "validators": 9,
      "max_uids": 256,
      "registration_cost_tao": 0.25,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5FHrQMjzzAhmL5zS9ys87ZrGCwG3vsVT9hXAUWZQ8SNdRqig"
    },
    "health": {
      "netuid": 114,
      "score": 71,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 89,
          "weight": 0.4,
          "value": "8 of 9",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 1,
          "weight": 0.25,
          "value": "Gini 0.99",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 120,
    "catalog": {
      "netuid": 120,
      "name": "Affine",
      "summary": "Distributed RL training loop: miners generate verified math reasoning attempts that train the next model checkpoint",
      "capabilities": [
        "training"
      ],
      "operator": null,
      "website": "https://www.affine.io",
      "github": "https://github.com/AffineFoundation/affine",
      "docs": "https://www.affine.io/llms.txt",
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.affine.io",
        "https://www.affine.io/llms.txt",
        "https://github.com/AffineFoundation/affine"
      ]
    },
    "live": {
      "netuid": 120,
      "name": "Affine",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 626,
      "validators": 1,
      "max_uids": 1000,
      "registration_cost_tao": 0.990604541,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5EfNFhH2s9hJoVuK8qkQRx8bkpNncRifhbCHBFKs6qKqknak"
    },
    "health": {
      "netuid": 120,
      "score": 78,
      "band": "healthy",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 100,
          "weight": 0.4,
          "value": "1 of 1",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 12,
          "weight": 0.25,
          "value": "Gini 0.88",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  },
  {
    "netuid": 124,
    "catalog": {
      "netuid": 124,
      "name": "Swarm",
      "summary": "Open benchmark for autonomous drone flight models on simulated missions such as search and rescue and interception",
      "capabilities": [
        "training",
        "other"
      ],
      "operator": "Swarm",
      "website": "https://www.swarm124.com",
      "github": "https://github.com/swarm-subnet/swarm",
      "docs": null,
      "api": "none",
      "api_example": null,
      "api_needs_key": false,
      "sources": [
        "https://www.swarm124.com",
        "https://www.swarm124.com/benchmark",
        "https://github.com/swarm-subnet/swarm"
      ]
    },
    "live": {
      "netuid": 124,
      "name": "Swarm",
      "symbol": null,
      "price_tao": null,
      "emission_share": null,
      "miners": 245,
      "validators": 11,
      "max_uids": 256,
      "registration_cost_tao": 0.609712695,
      "registration_allowed": true,
      "tempo": 360,
      "owner_coldkey": "5HKYqfJrUFKYPMRFZZ7kfhUNEyHUbY2ZyEjQqKJf2RKVpeXM"
    },
    "health": {
      "netuid": 124,
      "score": 73,
      "band": "watch",
      "factors": [
        {
          "id": "validators_active",
          "label": "Validators active this tempo",
          "score": 91,
          "weight": 0.4,
          "value": "10 of 11",
          "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
        },
        {
          "id": "incentive_spread",
          "label": "Miner incentive spread",
          "score": 7,
          "weight": 0.25,
          "value": "Gini 0.93",
          "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
        },
        {
          "id": "burn_ratio",
          "label": "Miner emission not burned",
          "score": 100,
          "weight": 0.2,
          "value": "0.0% burned",
          "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
        },
        {
          "id": "registration_open",
          "label": "Registration open",
          "score": 100,
          "weight": 0.15,
          "value": "open",
          "explanation": "Whether new miners can register right now"
        }
      ],
      "findings": []
    }
  }
];

export const DEMO_SUBNET_DETAILS: Record<number, SubnetDetail> = {
  "64": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 64,
      "catalog": {
        "netuid": 64,
        "name": "Chutes",
        "summary": "Serverless inference and deployment of open-source AI models on decentralized GPUs, with a REST API and SDK",
        "capabilities": [
          "inference",
          "compute"
        ],
        "operator": "Chutes Global Corp",
        "website": "https://chutes.ai",
        "github": "https://github.com/chutesai/chutes",
        "docs": "https://chutes.ai/docs",
        "api": "https://api.chutes.ai",
        "api_example": "curl -X GET \"https://api.chutes.ai/invocations/stats/llm\"",
        "api_needs_key": false,
        "sources": [
          "https://chutes.ai/docs",
          "https://chutes.ai/docs/api-reference/overview",
          "https://chutes.ai/docs/api-reference/authentication",
          "https://chutes.ai/docs/api-reference/invocations",
          "https://github.com/chutesai/chutes"
        ]
      },
      "live": {
        "netuid": 64,
        "name": "Chutes",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 239,
        "validators": 17,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FRYKhbmfXPDoHdUUDMx27E3HuMvAzwjzFMMq3rNurUhAyS9"
      },
      "health": {
        "netuid": 64,
        "score": 66,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 76,
            "weight": 0.4,
            "value": "13 of 17",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 4,
            "weight": 0.25,
            "value": "Gini 0.96",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "1": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 1,
      "catalog": {
        "netuid": 1,
        "name": "Apex",
        "summary": "Competition platform where organizations post optimization problems with a benchmark and miners compete to submit the best algorithm",
        "capabilities": [
          "other"
        ],
        "operator": "Macrocosmos",
        "website": "https://apex.macrocosmos.ai",
        "github": "https://github.com/macrocosm-os/apex",
        "docs": "https://docs.macrocosmos.ai/subnets/readme.md",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://apex.macrocosmos.ai",
          "https://github.com/macrocosm-os/apex",
          "https://docs.macrocosmos.ai/llms.txt"
        ]
      },
      "live": {
        "netuid": 1,
        "name": "Apex",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 246,
        "validators": 10,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 99,
        "owner_coldkey": "5HCFWvRqzSHWRPecN7q8J6c7aKQnrCZTMHstPv39xL1wgDHh"
      },
      "health": {
        "netuid": 1,
        "score": 63,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 70,
            "weight": 0.4,
            "value": "7 of 10",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "99",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "7200",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "2",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "112",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "21706",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "4950",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "128",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "10",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "4": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 4,
      "catalog": {
        "netuid": 4,
        "name": "Targon",
        "summary": "Rent confidential GPU and CPU VMs, bare metal servers and sandboxes through a web console, CLI, SDK or REST API",
        "capabilities": [
          "compute",
          "security"
        ],
        "operator": "Manifold Labs, Inc.",
        "website": "https://targon.com",
        "github": "https://github.com/manifold-inc/targon",
        "docs": "https://docs.targon.com/",
        "api": "https://api.targon.com/tha/v3",
        "api_example": "curl -s https://api.targon.com/tha/v3/region",
        "api_needs_key": false,
        "sources": [
          "https://targon.com",
          "https://docs.targon.com/",
          "https://docs.targon.com/api/workloads",
          "https://github.com/manifold-inc/targon"
        ]
      },
      "live": {
        "netuid": 4,
        "name": "Targon",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 242,
        "validators": 14,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5CXGPMnq9RCCLUEvp9G2iUuabw69TSFM155UVS1S4Zmusaxv"
      },
      "health": {
        "netuid": 4,
        "score": 64,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 71,
            "weight": 0.4,
            "value": "10 of 14",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "7520",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "70001",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "9": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 9,
      "catalog": {
        "netuid": 9,
        "name": "iota",
        "summary": "Framework for pretraining LLMs across heterogeneous permissionless miners using data and pipeline parallelism",
        "capabilities": [
          "training"
        ],
        "operator": "Macrocosmos",
        "website": "https://iota.macrocosmos.ai/",
        "github": "https://github.com/macrocosm-os/iota",
        "docs": "https://docs.macrocosmos.ai",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://iota.macrocosmos.ai/",
          "https://github.com/macrocosm-os/iota"
        ]
      },
      "live": {
        "netuid": 9,
        "name": "iota",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 243,
        "validators": 13,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FsbubeciqtB5Nik3umL2iD4fG8FcC9GbT9nHJfXMj4mJJZ9"
      },
      "health": {
        "netuid": 9,
        "score": 69,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 85,
            "weight": 0.4,
            "value": "11 of 13",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "4062",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "11": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 11,
      "catalog": {
        "netuid": 11,
        "name": "TrajectoryRL",
        "summary": "Competition for fusion policies that route agent requests across open-weight models on Engy; the winner is served as engy/auto",
        "capabilities": [
          "agents",
          "inference"
        ],
        "operator": null,
        "website": "https://trajrl.com",
        "github": "https://github.com/trajectoryRL/trajectoryRL",
        "docs": "https://trajrl.com/docs",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://trajrl.com",
          "https://trajrl.com/docs",
          "https://github.com/trajectoryRL/trajectoryRL"
        ]
      },
      "live": {
        "netuid": 11,
        "name": "TrajectoryRL",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 248,
        "validators": 8,
        "max_uids": 256,
        "registration_cost_tao": 0.033532271,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5D2Jhtbnm7iAdKfjRk6DisXBnr1MEsYat8kXqaPNrVqJP3uE"
      },
      "health": {
        "netuid": 11,
        "score": 65,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 75,
            "weight": 0.4,
            "value": "6 of 8",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "10800",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.02 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "10",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "13": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 13,
      "catalog": {
        "netuid": 13,
        "name": "Data Universe",
        "summary": "Social media data from X, Reddit and YouTube via an on-demand API, scheduled dataset jobs and a dataset marketplace",
        "capabilities": [
          "data"
        ],
        "operator": "Macrocosmos",
        "website": "https://datauniverse.macrocosmos.ai/",
        "github": "https://github.com/macrocosm-os/data-universe",
        "docs": "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme.md",
        "api": "https://constellation.api.cloud.macrocosmos.ai",
        "api_example": null,
        "api_needs_key": true,
        "sources": [
          "https://datauniverse.macrocosmos.ai/",
          "https://github.com/macrocosm-os/data-universe",
          "https://docs.macrocosmos.ai/llms.txt",
          "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme.md",
          "https://docs.macrocosmos.ai/subnets/subnet-13-data-universe/readme/gravity.md"
        ]
      },
      "live": {
        "netuid": 13,
        "name": "Data Universe",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 247,
        "validators": 9,
        "max_uids": 256,
        "registration_cost_tao": 0.092484507,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5HBswBt1A9Ahx6U76abXXGd7VmabmCNBGhSK2vrP71GSxtgZ"
      },
      "health": {
        "netuid": 13,
        "score": 76,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 89,
            "weight": 0.4,
            "value": "8 of 9",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 23,
            "weight": 0.25,
            "value": "Gini 0.77",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "12000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "50",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "1030",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "17": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 17,
      "catalog": {
        "netuid": 17,
        "name": "404-GEN",
        "summary": "Text-to-3D generation (Gaussian splats and meshes) via a web app and Blender and Unity plugins; miners compete on 3D models",
        "capabilities": [
          "3d"
        ],
        "operator": null,
        "website": "https://www.404.xyz",
        "github": "https://github.com/404-Repo/404-gen-subnet",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.404.xyz",
          "https://www.404.xyz/about",
          "https://www.404.xyz/app",
          "https://www.404.xyz/plugin",
          "https://github.com/404-Repo/404-gen-subnet"
        ]
      },
      "live": {
        "netuid": 17,
        "name": "404-GEN",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 242,
        "validators": 14,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5E7a4a7QETrNjoZ2SbVSJMaavrQeyTEaHgjBPDUDxBKjUaMZ"
      },
      "health": {
        "netuid": 17,
        "score": 63,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 71,
            "weight": 0.4,
            "value": "10 of 14",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "19": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 19,
      "catalog": {
        "netuid": 19,
        "name": "blockmachine",
        "summary": "Verified RPC and archive nodes for Bittensor, Ethereum and other EVM chains, with free keyless public endpoints",
        "capabilities": [
          "data"
        ],
        "operator": null,
        "website": "https://blockmachine.io",
        "github": "https://github.com/taostat/blockmachine",
        "docs": "https://blockmachine.io/public-rpc-endpoints",
        "api": "https://rpc-eth.blockmachine.io",
        "api_example": "curl -X POST \"https://rpc-eth.blockmachine.io\" -H \"Content-Type: application/json\" -d '{\"jsonrpc\": \"2.0\", \"method\": \"eth_blockNumber\", \"params\": [], \"id\": 1}'",
        "api_needs_key": false,
        "sources": [
          "https://blockmachine.io",
          "https://blockmachine.io/public-rpc-endpoints",
          "https://github.com/taostat/blockmachine"
        ]
      },
      "live": {
        "netuid": 19,
        "name": "blockmachine",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 245,
        "validators": 11,
        "max_uids": 256,
        "registration_cost_tao": 0.999999999,
        "registration_allowed": true,
        "tempo": 7200,
        "owner_coldkey": "5FWh37LfVV5LE9dZA91STzbtebh6vxYa3MH71c621sYafo1L"
      },
      "health": {
        "netuid": 19,
        "score": 69,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 82,
            "weight": 0.4,
            "value": "9 of 11",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 3,
            "weight": 0.25,
            "value": "Gini 0.97",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "7200",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "21600",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "60000",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "7200",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "26": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 26,
      "catalog": null,
      "live": {
        "netuid": 26,
        "name": "Perturb",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 251,
        "validators": 5,
        "max_uids": 256,
        "registration_cost_tao": 0.1,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FsVAEPMpkAo3eP7xTNJYLyBndi2oT5GPxVPzFT1DzSD82qx"
      },
      "health": {
        "netuid": 26,
        "score": 51,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 40,
            "weight": 0.4,
            "value": "2 of 5",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "2",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "3",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "34": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 34,
      "catalog": {
        "netuid": 34,
        "name": "Yugos",
        "summary": "OpenAI-compatible router API that picks the model, provider and effort for each request; miners compete on the router",
        "capabilities": [
          "inference"
        ],
        "operator": "BitMind Holdings Limited",
        "website": "https://yugos.ai",
        "github": "https://github.com/BitMind-AI/yugos",
        "docs": "https://yugos.ai/docs",
        "api": "https://api.yugos.ai/v1",
        "api_example": "curl -s https://api.yugos.ai/v1/catalog -H \"Authorization: Bearer $API_KEY\"",
        "api_needs_key": true,
        "sources": [
          "https://yugos.ai",
          "https://yugos.ai/docs",
          "https://github.com/BitMind-AI/yugos"
        ]
      },
      "live": {
        "netuid": 34,
        "name": "Yugos",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 250,
        "validators": 6,
        "max_uids": 256,
        "registration_cost_tao": 0.5,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5DthmKBR83sUdudSfgFnsxBkTYtYTFLJUgovNfb1TSKVLiTH"
      },
      "health": {
        "netuid": 34,
        "score": 68,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 83,
            "weight": 0.4,
            "value": "5 of 6",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.5 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "404020",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "51": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 51,
      "catalog": {
        "netuid": 51,
        "name": "lium.io",
        "summary": "Hourly NVIDIA GPU rental marketplace with web, CLI, Python SDK and API access; nodes are checked by SN51 validators",
        "capabilities": [
          "compute"
        ],
        "operator": null,
        "website": "https://lium.io",
        "github": "https://github.com/Datura-ai/lium-io",
        "docs": "https://docs.lium.io",
        "api": "https://lium.io/api/public/v1",
        "api_example": "curl -sSL https://lium.io/api/public/v1/nodes",
        "api_needs_key": false,
        "sources": [
          "https://lium.io",
          "https://docs.lium.io/developers",
          "https://docs.lium.io/developers/public-nodes-feed",
          "https://github.com/Datura-ai/lium-io"
        ]
      },
      "live": {
        "netuid": 51,
        "name": "lium.io",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 245,
        "validators": 11,
        "max_uids": 256,
        "registration_cost_tao": 0.5,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FqACMtcegZxxopgu1g7TgyrnyD8skurr9QDPLPhxNQzsThe"
      },
      "health": {
        "netuid": 51,
        "score": 64,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 73,
            "weight": 0.4,
            "value": "8 of 11",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.5 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "10 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "12000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "54": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 54,
      "catalog": null,
      "live": {
        "netuid": 54,
        "name": "Yanez",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 247,
        "validators": 9,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FUfruyVDoDsCty1Sh7tCmHVdpoC3XV1nUZYjhcpfe31Defk"
      },
      "health": {
        "netuid": 54,
        "score": 72,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 89,
            "weight": 0.4,
            "value": "8 of 9",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 5,
            "weight": 0.25,
            "value": "Gini 0.95",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "5",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "56": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 56,
      "catalog": {
        "netuid": 56,
        "name": "Gradients",
        "summary": "AutoML training of text and image models through a web app and API; miners compete in open-source training tournaments",
        "capabilities": [
          "training"
        ],
        "operator": null,
        "website": "https://www.gradients.io/",
        "github": "https://github.com/gradients-ai/G.O.D",
        "docs": null,
        "api": "https://api.gradients.io/v1",
        "api_example": "curl --request POST --url https://api.gradients.io/v1/tasks/create --header \"Authorization: $API_KEY\" --header 'Content-Type: application/json' --data '{\"model_repo\": \"\", \"ds_repo\": \"\", \"instruction_col\": \"\", \"hours_to_complete\": 1}'",
        "api_needs_key": true,
        "sources": [
          "https://www.gradients.io/",
          "https://github.com/gradients-ai/G.O.D"
        ]
      },
      "live": {
        "netuid": 56,
        "name": "Gradients",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 241,
        "validators": 15,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5EJ1zbdwhumTRYFx3VCGnR6SW7CJWP28tEJCo2gw1dFbVL5g"
      },
      "health": {
        "netuid": 56,
        "score": 67,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 80,
            "weight": 0.4,
            "value": "12 of 15",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "62": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 62,
      "catalog": {
        "netuid": 62,
        "name": "Ridges",
        "summary": "Software engineering agents: Ridgeline turns a GitHub issue into a pull request; miners compete to improve the agent",
        "capabilities": [
          "agents"
        ],
        "operator": null,
        "website": "https://www.ridges.ai/",
        "github": "https://github.com/ridgesai/ridges",
        "docs": "https://docs.ridges.ai",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://docs.ridges.ai",
          "https://docs.ridges.ai/llms.txt",
          "https://github.com/ridgesai/ridges"
        ]
      },
      "live": {
        "netuid": 62,
        "name": "Ridges",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 233,
        "validators": 23,
        "max_uids": 256,
        "registration_cost_tao": 0.000708528,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5DhsVYewpCdQQUenHU52k5Cys1WsTWTt5V5m84D3n4L8FWDS"
      },
      "health": {
        "netuid": 62,
        "score": 60,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 57,
            "weight": 0.4,
            "value": "13 of 23",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 8,
            "weight": 0.25,
            "value": "Gini 0.92",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "7400",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "6",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "8": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 8,
      "catalog": {
        "netuid": 8,
        "name": "Vanta",
        "summary": "Trading signal network that scores miner positions on forex, crypto, equities and commodities and funds top traders",
        "capabilities": [
          "finance",
          "prediction"
        ],
        "operator": "Taoshi",
        "website": "https://www.vantanetwork.io/",
        "github": "https://github.com/taoshidev/vanta-network",
        "docs": "https://app.vantatrading.io/docs",
        "api": "https://app.vantatrading.io",
        "api_example": null,
        "api_needs_key": true,
        "sources": [
          "https://www.vantanetwork.io/",
          "https://github.com/taoshidev/vanta-network",
          "https://vantatrading.io",
          "https://app.vantatrading.io/docs"
        ]
      },
      "live": {
        "netuid": 8,
        "name": "Vanta",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 238,
        "validators": 18,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5F6tnxzAAxbhaWRmeUmB63JEM3VXBNSmqb3AwYJVDStQjw8y"
      },
      "health": {
        "netuid": 8,
        "score": 62,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 67,
            "weight": 0.4,
            "value": "12 of 18",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "1200",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "199",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "3": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376750,
      "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 3,
      "catalog": {
        "netuid": 3,
        "name": "Teutonic",
        "summary": "King-of-the-hill LLM pretraining competition; each winning MoE checkpoint is published to a public model bucket",
        "capabilities": [
          "training"
        ],
        "operator": null,
        "website": "https://www.teutonic.ai/",
        "github": "https://github.com/unarbos/teutonic",
        "docs": "https://teutonic.ai/llms.txt",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.teutonic.ai/",
          "https://teutonic.ai/llms.txt",
          "https://github.com/unarbos/teutonic"
        ]
      },
      "live": {
        "netuid": 3,
        "name": "Teutonic",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 252,
        "validators": 4,
        "max_uids": 256,
        "registration_cost_tao": 1.134600652,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5GsGUrd21bnkNxQsH2grv474y4gcDwCmp5xJ72KeokspZ2bg"
      },
      "health": {
        "netuid": 3,
        "score": 66,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 75,
            "weight": 0.4,
            "value": "3 of 4",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 2,
            "weight": 0.25,
            "value": "Gini 0.98",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "10000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "2000",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "250",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "4",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "5": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 5,
      "catalog": {
        "netuid": 5,
        "name": "Hone",
        "summary": "RLVR subnet where miners solve software engineering and terminal tasks that validators grade in isolated Docker sandboxes",
        "capabilities": [
          "training",
          "agents"
        ],
        "operator": null,
        "website": "https://honedashboard.com",
        "github": "https://github.com/hone-subnet-org/hone-subnet",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://honedashboard.com",
          "https://github.com/hone-subnet-org/hone-subnet"
        ]
      },
      "live": {
        "netuid": 5,
        "name": "Hone",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 245,
        "validators": 11,
        "max_uids": 256,
        "registration_cost_tao": 0.757685804,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5GurNtB3yQFCh6CSmfH7LrYJDsvzup4diHZiaYtKe274nrMX"
      },
      "health": {
        "netuid": 5,
        "score": 94,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 91,
            "weight": 0.4,
            "value": "10 of 11",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 90,
            "weight": 0.25,
            "value": "Gini 0.10",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "10800",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "803",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "15": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 15,
      "catalog": {
        "netuid": 15,
        "name": "ORO",
        "summary": "Benchmark and competition for AI shopping agents run in sandboxed ORO Bench worlds, with a public leaderboard API",
        "capabilities": [
          "agents"
        ],
        "operator": "ORO AI",
        "website": "https://oroagents.com",
        "github": "https://github.com/ORO-AI/oro",
        "docs": "https://oroagents.com/docs",
        "api": "https://api.oroagents.com",
        "api_example": "curl -s \"https://api.oroagents.com/v1/public/leaderboard\"",
        "api_needs_key": false,
        "sources": [
          "https://oroagents.com",
          "https://oroagents.com/docs",
          "https://oroagents.com/docs/api",
          "https://github.com/ORO-AI/oro"
        ]
      },
      "live": {
        "netuid": 15,
        "name": "ORO",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 244,
        "validators": 12,
        "max_uids": 256,
        "registration_cost_tao": 0.394440027,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5EHdase3QHY1FSU2KoxzpbnkzGhxBZEVcWU85zyjrxG62KTK"
      },
      "health": {
        "netuid": 15,
        "score": 65,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 75,
            "weight": 0.4,
            "value": "9 of 12",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "3",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "true",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "28": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 28,
      "catalog": {
        "netuid": 28,
        "name": "SayGM",
        "summary": "LLM gateway with OpenAI, Anthropic and Gemini compatible APIs for Claude, GPT, Gemini and open models, some served in TEEs",
        "capabilities": [
          "inference"
        ],
        "operator": "T34 Corporation FZCO",
        "website": "https://saygm.com/",
        "github": "https://github.com/taostat/gm-miner",
        "docs": "https://docs.saygm.com",
        "api": "https://api.saygm.com/v1",
        "api_example": "curl -fsSL \"https://api.saygm.com/v1/models?api_shape=chat.completions\"",
        "api_needs_key": false,
        "sources": [
          "https://saygm.com/",
          "https://docs.saygm.com",
          "https://docs.saygm.com/getting-started/quickstart/",
          "https://github.com/taostat/gm-miner"
        ]
      },
      "live": {
        "netuid": 28,
        "name": "SayGM",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 245,
        "validators": 11,
        "max_uids": 256,
        "registration_cost_tao": 0.10273862,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5CA6rwAytZvvyZhLYEzo79627QEV422Q8kD51DEnTaRQxm45"
      },
      "health": {
        "netuid": 28,
        "score": 73,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 82,
            "weight": 0.4,
            "value": "9 of 11",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 22,
            "weight": 0.25,
            "value": "Gini 0.78",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "3600",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "1",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "360",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "38": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 38,
      "catalog": {
        "netuid": 38,
        "name": "ChronoLLM",
        "summary": "LLMs trained only on data up to a cutoff year, for backtesting and quant research without lookahead bias",
        "capabilities": [
          "training",
          "finance"
        ],
        "operator": "Crunch (CrunchDAO)",
        "website": "https://chronollm.com/",
        "github": "https://github.com/chronollm/sn38",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://chronollm.crunchdao.com/",
          "https://chronollm.com/",
          "https://github.com/chronollm/sn38"
        ]
      },
      "live": {
        "netuid": 38,
        "name": "ChronoLLM",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 244,
        "validators": 12,
        "max_uids": 256,
        "registration_cost_tao": 0.74,
        "registration_allowed": true,
        "tempo": 1440,
        "owner_coldkey": "5GeWgtBAu2ezYo83sPM7VyEigAfEc3vnqqxRzbMXYVYwEV62"
      },
      "health": {
        "netuid": 38,
        "score": 48,
        "band": "at_risk",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 33,
            "weight": 0.4,
            "value": "4 of 12",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "1440",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "50400",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.74 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "72000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "44": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 44,
      "catalog": {
        "netuid": 44,
        "name": "Score",
        "summary": "Vision models that turn live video into structured data, starting with professional sports; miners compete on models",
        "capabilities": [
          "video"
        ],
        "operator": "Score",
        "website": "https://www.wearescore.com/",
        "github": "https://github.com/score-technologies/turbovision",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.wearescore.com/",
          "https://github.com/score-technologies/turbovision"
        ]
      },
      "live": {
        "netuid": 44,
        "name": "Score",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 241,
        "validators": 15,
        "max_uids": 256,
        "registration_cost_tao": 0.05,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5CaCekuxb9pKQyLoxh3jbkEXig8fxjkeS4AQ6UmZa12xfQ9H"
      },
      "health": {
        "netuid": 44,
        "score": 40,
        "band": "at_risk",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 13,
            "weight": 0.4,
            "value": "2 of 15",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "7500",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.05 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "2027",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "2",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "53": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 53,
      "catalog": {
        "netuid": 53,
        "name": "engy",
        "summary": "OpenAI and Anthropic compatible inference for open models, with proofs that the pinned model weights actually ran",
        "capabilities": [
          "inference",
          "video"
        ],
        "operator": "hanlin.ai",
        "website": "https://engy.ai",
        "github": "https://github.com/hanlinai/engy",
        "docs": "https://engy.ai/docs",
        "api": "https://api.engy.ai/v1",
        "api_example": "curl -s https://api.engy.ai/v1/models",
        "api_needs_key": false,
        "sources": [
          "https://engy.ai",
          "https://engy.ai/docs",
          "https://engy.ai/docs/get-started/quickstart",
          "https://engy.ai/docs/api-reference",
          "https://github.com/hanlinai/engy"
        ]
      },
      "live": {
        "netuid": 53,
        "name": "engy",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 239,
        "validators": 17,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5H8SFVCxk52ag1YSC5bQw7B84NRNhAtYWAP81jEPfuJ3VL8Q"
      },
      "health": {
        "netuid": 53,
        "score": 67,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 76,
            "weight": 0.4,
            "value": "13 of 17",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 5,
            "weight": 0.25,
            "value": "Gini 0.95",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "1",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "61": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 61,
      "catalog": {
        "netuid": 61,
        "name": "RedTeam",
        "summary": "Cybersecurity programming challenges where miners submit code solutions scored daily for quality and originality",
        "capabilities": [
          "security"
        ],
        "operator": "Innerworks",
        "website": "https://www.theredteam.io/",
        "github": "https://github.com/RedTeamSubnet/RedTeam",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.theredteam.io/",
          "https://github.com/RedTeamSubnet/RedTeam"
        ]
      },
      "live": {
        "netuid": 61,
        "name": "RedTeam",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 244,
        "validators": 12,
        "max_uids": 256,
        "registration_cost_tao": 0.053089202,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5ECEsYL82fbXx9KfTZy7G2KXSurnScciJyAVMHZjekc8jUbn"
      },
      "health": {
        "netuid": 61,
        "score": 73,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 83,
            "weight": 0.4,
            "value": "10 of 12",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 18,
            "weight": 0.25,
            "value": "Gini 0.82",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "14400",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "68": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 68,
      "catalog": {
        "netuid": 68,
        "name": "NOVA",
        "summary": "Open drug discovery competitions for small molecules, nanobodies and chemical search, scored by ML prediction models",
        "capabilities": [
          "science"
        ],
        "operator": "Metanova Labs",
        "website": "https://www.metanova-labs.ai",
        "github": "https://github.com/metanova-labs/nova",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.metanova-labs.ai",
          "https://www.metanova-labs.ai/nova",
          "https://github.com/metanova-labs/nova"
        ]
      },
      "live": {
        "netuid": 68,
        "name": "NOVA",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 57,
        "validators": 7,
        "max_uids": 64,
        "registration_cost_tao": 0.068956069,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5EcdJLAeYoxM3Tsf5VZ3NQPenPku218gqnjSoo3iJNy4V12V"
      },
      "health": {
        "netuid": 68,
        "score": 70,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 86,
            "weight": 0.4,
            "value": "6 of 7",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 2,
            "weight": 0.25,
            "value": "Gini 0.98",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "64",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "75": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 75,
      "catalog": {
        "netuid": 75,
        "name": "Hippius",
        "summary": "Decentralized cloud with S3-compatible storage, encrypted drive, CDN, model and container registry and confidential VMs",
        "capabilities": [
          "storage",
          "compute"
        ],
        "operator": null,
        "website": "https://hippius.com/",
        "github": "https://github.com/thenervelab/thebrain",
        "docs": "https://docs.hippius.com",
        "api": "https://s3.hippius.com",
        "api_example": "aws s3 presign s3://my-bucket/hello.txt --expires-in 86400 --endpoint-url https://s3.hippius.com",
        "api_needs_key": true,
        "sources": [
          "https://hippius.com/",
          "https://docs.hippius.com",
          "https://docs.hippius.com/storage/s3/advanced",
          "https://docs.hippius.com/blockchain/api",
          "https://github.com/thenervelab/thebrain"
        ]
      },
      "live": {
        "netuid": 75,
        "name": "Hippius",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 244,
        "validators": 12,
        "max_uids": 256,
        "registration_cost_tao": 0.999999999,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5DAQpczEK4vzBn1waHkC4BZGqGPZ1dwPxKVsj36JDofHAw3a"
      },
      "health": {
        "netuid": 75,
        "score": 72,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 92,
            "weight": 0.4,
            "value": "11 of 12",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "80": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 80,
      "catalog": {
        "netuid": 80,
        "name": "OpenRoboto",
        "summary": "Competition to improve robot VLA models in simulation and on real xArm robots, plus egocentric data collection",
        "capabilities": [
          "training",
          "data"
        ],
        "operator": null,
        "website": "https://www.openroboto.ai/",
        "github": "https://github.com/openroboto-ai/openroboto-subnet",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.openroboto.ai/",
          "https://github.com/openroboto-ai/openroboto-subnet"
        ]
      },
      "live": {
        "netuid": 80,
        "name": "OpenRoboto",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 242,
        "validators": 14,
        "max_uids": 256,
        "registration_cost_tao": 0.000522631,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5CG1eFiaZkWTCUEjD23i7Uiu6AjTkLkgkCu3EyXKFFAkkT2T"
      },
      "health": {
        "netuid": 80,
        "score": 61,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 64,
            "weight": 0.4,
            "value": "9 of 14",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 2,
            "weight": 0.25,
            "value": "Gini 0.98",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "83": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 83,
      "catalog": {
        "netuid": 83,
        "name": "CliqueAI",
        "summary": "Distributed solver network for the maximum clique graph problem; miners are scored on optimality and diversity",
        "capabilities": [
          "other"
        ],
        "operator": null,
        "website": "https://cliqueai.toptensor.ai/",
        "github": "https://github.com/toptensor/CliqueAI",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://cliqueai.toptensor.ai/",
          "https://github.com/toptensor/CliqueAI"
        ]
      },
      "live": {
        "netuid": 83,
        "name": "CliqueAI",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 248,
        "validators": 8,
        "max_uids": 256,
        "registration_cost_tao": 0.1,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5DqEjRLyNN8k3WbEXhA36tyGG4YpWyPEcVSTa47XxspNHhc3"
      },
      "health": {
        "netuid": 83,
        "score": 90,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 100,
            "weight": 0.4,
            "value": "8 of 8",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 58,
            "weight": 0.25,
            "value": "Gini 0.42",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "6000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.1 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "1",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "90": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 90,
      "catalog": {
        "netuid": 90,
        "name": "KubeTEE",
        "summary": "Confidential Kubernetes clusters running inference, retrieval, agents and batch jobs inside GPU TEEs on miner hardware",
        "capabilities": [
          "compute",
          "inference",
          "security"
        ],
        "operator": "KubeTEE AI",
        "website": "https://kubetee.ai",
        "github": "https://github.com/KubeTEE-AI/kubetee-subnet",
        "docs": null,
        "api": "https://llm.kubetee.ai",
        "api_example": "curl -s https://llm.kubetee.ai/v1/models -H \"Authorization: Bearer $API_KEY\"",
        "api_needs_key": true,
        "sources": [
          "https://kubetee.ai",
          "https://llm.kubetee.ai",
          "https://llm.kubetee.ai/openapi.json",
          "https://github.com/KubeTEE-AI/kubetee-subnet"
        ]
      },
      "live": {
        "netuid": 90,
        "name": "KubeTEE",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 122,
        "validators": 9,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5C9y6fnLPSzBeh1Np7f4DnGen42xV29nL9qZTDuwpVC4iTEE"
      },
      "health": {
        "netuid": 90,
        "score": 75,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 100,
            "weight": 0.4,
            "value": "9 of 9",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "2",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "3",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "92": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 92,
      "catalog": {
        "netuid": 92,
        "name": "REAX",
        "summary": "Verified inference for typed decision models that answer choice and score questions, sold through the Decision Models API",
        "capabilities": [
          "inference"
        ],
        "operator": "productivity-boost.com Betriebs UG (haftungsbeschränkt) & Co. KG",
        "website": "https://reax.co/",
        "github": "https://github.com/reaxlabs/reax-subnet",
        "docs": "https://reax.dev/",
        "api": "https://api.decisionmodels.io",
        "api_example": "curl https://api.decisionmodels.io/v1/systemone -H \"Authorization: Bearer $DECISIONMODELS_API_KEY\" -H \"Content-Type: application/json\" -H \"S1-Region: global\" -d '{\"model\": \"s1-fast\", \"state\": \"Mia owns a red bicycle.\", \"questions\": {\"color\": {\"type\": \"choice\", \"instructions\": \"Which color is the bicycle?\", \"criteria\": {\"red\": null, \"blue\": null}}}}'",
        "api_needs_key": true,
        "sources": [
          "https://reax.co/",
          "https://decisionmodels.io/",
          "https://github.com/reaxlabs/reax-subnet"
        ]
      },
      "live": {
        "netuid": 92,
        "name": "REAX",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 252,
        "validators": 4,
        "max_uids": 256,
        "registration_cost_tao": 0.633609535,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5GMxpAvB9iJkDtNDELhVn8GmbBz5XChnWcLaThWTJ38QmU6B"
      },
      "health": {
        "netuid": 92,
        "score": 72,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 75,
            "weight": 0.4,
            "value": "3 of 4",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 28,
            "weight": 0.25,
            "value": "Gini 0.72",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "7200",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "2",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.5 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "5 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "3",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "93": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 93,
      "catalog": {
        "netuid": 93,
        "name": "Bitcast",
        "summary": "Pays creators on YouTube and X for content that meets brand briefs, scored on verified audience engagement",
        "capabilities": [
          "other"
        ],
        "operator": null,
        "website": "https://bitcast.network/",
        "github": "https://github.com/bitcast-network/bitcast",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://stats.bitcast.network/",
          "https://bitcast.network/",
          "https://github.com/bitcast-network/bitcast"
        ]
      },
      "live": {
        "netuid": 93,
        "name": "Bitcast",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 241,
        "validators": 15,
        "max_uids": 256,
        "registration_cost_tao": 0.005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5EbY1SebUuz189w1G96JN4mmHnShAECA6JefCRYhSLqyYg2c"
      },
      "health": {
        "netuid": 93,
        "score": 62,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 67,
            "weight": 0.4,
            "value": "10 of 15",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "50400",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "97": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 97,
      "catalog": {
        "netuid": 97,
        "name": "Ingot",
        "summary": "Competition to quantize Qwen3.8-27B to ternary weights closest to the teacher; winning GGUF models go to Hugging Face",
        "capabilities": [
          "training"
        ],
        "operator": null,
        "website": "https://theingot.ai",
        "github": "https://github.com/DendriteLabs/ingot",
        "docs": "https://theingot.ai/llms.txt",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://theingot.ai",
          "https://theingot.ai/llms.txt",
          "https://github.com/DendriteLabs/ingot"
        ]
      },
      "live": {
        "netuid": 97,
        "name": "Ingot",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 252,
        "validators": 4,
        "max_uids": 256,
        "registration_cost_tao": 0.130086751,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5GnW8owmMGn83WqL9JNYytmw458UYrTT6Ra5fH8TTUkzEbTb"
      },
      "health": {
        "netuid": 97,
        "score": 66,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 75,
            "weight": 0.4,
            "value": "3 of 4",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 2,
            "weight": 0.25,
            "value": "Gini 0.98",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.05 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "7200",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "107": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 107,
      "catalog": {
        "netuid": 107,
        "name": "Minos",
        "summary": "Genomic variant calling benchmark where miners tune variant callers on synthetic challenge genomes; keyless read-only MCP",
        "capabilities": [
          "science"
        ],
        "operator": null,
        "website": "https://theminos.ai",
        "github": "https://github.com/minos-protocol/minos_subnet",
        "docs": "https://docs.theminos.ai",
        "api": "https://mcp.theminos.ai",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://theminos.ai",
          "https://docs.theminos.ai",
          "https://mcp.theminos.ai/docs",
          "https://github.com/minos-protocol/minos_subnet"
        ]
      },
      "live": {
        "netuid": 107,
        "name": "Minos",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 92,
        "validators": 8,
        "max_uids": 100,
        "registration_cost_tao": 0.99,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5DA2vLrSXZxnT9G4Yrywx1Fpi4RXwMH1Ah7r8DTTWS7UZZBM"
      },
      "health": {
        "netuid": 107,
        "score": 76,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 100,
            "weight": 0.4,
            "value": "8 of 8",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 4,
            "weight": 0.25,
            "value": "Gini 0.96",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "14400",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "100",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.99 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "20",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "110": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 110,
      "catalog": {
        "netuid": 110,
        "name": "Green Compute",
        "summary": "RTX 4090 GPU rental and OpenAI-compatible inference on hardware powered by renewable and biogas energy",
        "capabilities": [
          "compute",
          "inference"
        ],
        "operator": "Green Compute",
        "website": "https://www.green-compute.com/",
        "github": null,
        "docs": "https://www.green-compute.com/docs",
        "api": "https://api.green-compute.com",
        "api_example": "curl api.green-compute.com/platform/pricing",
        "api_needs_key": false,
        "sources": [
          "https://www.green-compute.com/",
          "https://www.green-compute.com/llms.txt"
        ]
      },
      "live": {
        "netuid": 110,
        "name": "Green Compute",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 241,
        "validators": 15,
        "max_uids": 256,
        "registration_cost_tao": 0.0005,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5D53sX6AwAzXUB24G85Ch35hYr5rCpXjYFWpFTe4uzBb75sL"
      },
      "health": {
        "netuid": 110,
        "score": 70,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 87,
            "weight": 0.4,
            "value": "13 of 15",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.0005 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "112": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 112,
      "catalog": {
        "netuid": 112,
        "name": "THOR",
        "summary": "Labels first-person video of hands-on tasks into timed, captioned steps for robotics training data; network not live yet",
        "capabilities": [
          "data",
          "video"
        ],
        "operator": "THOR",
        "website": "https://thormachines.ai/",
        "github": "https://github.com/thorrobotics/thor-subnet",
        "docs": "https://thormachines.ai/docs",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://thormachines.ai/",
          "https://thormachines.ai/docs",
          "https://github.com/thorrobotics/thor-subnet"
        ]
      },
      "live": {
        "netuid": 112,
        "name": "THOR",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 247,
        "validators": 9,
        "max_uids": 256,
        "registration_cost_tao": 0.99,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5HDswRwsoc9xfzpQRD7PfEGESUmHhdFm9dNH8Y65K59vJEAm"
      },
      "health": {
        "netuid": 112,
        "score": 66,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 78,
            "weight": 0.4,
            "value": "7 of 9",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 0,
            "weight": 0.25,
            "value": "Gini 1.00",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.99 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "114": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 114,
      "catalog": {
        "netuid": 114,
        "name": "SOMA",
        "summary": "Context compression proxy between coding agents and LLMs that cuts tokens; miners compete on compression methods",
        "capabilities": [
          "agents",
          "inference"
        ],
        "operator": "Dendrite Quantum LTD",
        "website": "https://thesoma.ai",
        "github": "https://github.com/DendriteHQ/SOMA",
        "docs": "https://thesoma.ai/docs",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://thesoma.ai",
          "https://thesoma.ai/docs",
          "https://github.com/DendriteHQ/SOMA"
        ]
      },
      "live": {
        "netuid": 114,
        "name": "SOMA",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 247,
        "validators": 9,
        "max_uids": 256,
        "registration_cost_tao": 0.25,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5FHrQMjzzAhmL5zS9ys87ZrGCwG3vsVT9hXAUWZQ8SNdRqig"
      },
      "health": {
        "netuid": 114,
        "score": 71,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 89,
            "weight": 0.4,
            "value": "8 of 9",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 1,
            "weight": 0.25,
            "value": "Gini 0.99",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.25 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "false",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "120": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 120,
      "catalog": {
        "netuid": 120,
        "name": "Affine",
        "summary": "Distributed RL training loop: miners generate verified math reasoning attempts that train the next model checkpoint",
        "capabilities": [
          "training"
        ],
        "operator": null,
        "website": "https://www.affine.io",
        "github": "https://github.com/AffineFoundation/affine",
        "docs": "https://www.affine.io/llms.txt",
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.affine.io",
          "https://www.affine.io/llms.txt",
          "https://github.com/AffineFoundation/affine"
        ]
      },
      "live": {
        "netuid": 120,
        "name": "Affine",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 626,
        "validators": 1,
        "max_uids": 1000,
        "registration_cost_tao": 0.990604541,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5EfNFhH2s9hJoVuK8qkQRx8bkpNncRifhbCHBFKs6qKqknak"
      },
      "health": {
        "netuid": 120,
        "score": 78,
        "band": "healthy",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 100,
            "weight": 0.4,
            "value": "1 of 1",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 12,
            "weight": 0.25,
            "value": "Gini 0.88",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "1000",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.5 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "1",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  },
  "124": {
    "chain": {
      "network": "finney",
      "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
      "block": 9376795,
      "block_hash": "0x9610a8615d887788bb3481c35b3cbe6308b21031bbf9f6aa1c4d35b9e18edb58",
      "runtime_spec": 486
    },
    "card": {
      "netuid": 124,
      "catalog": {
        "netuid": 124,
        "name": "Swarm",
        "summary": "Open benchmark for autonomous drone flight models on simulated missions such as search and rescue and interception",
        "capabilities": [
          "training",
          "other"
        ],
        "operator": "Swarm",
        "website": "https://www.swarm124.com",
        "github": "https://github.com/swarm-subnet/swarm",
        "docs": null,
        "api": "none",
        "api_example": null,
        "api_needs_key": false,
        "sources": [
          "https://www.swarm124.com",
          "https://www.swarm124.com/benchmark",
          "https://github.com/swarm-subnet/swarm"
        ]
      },
      "live": {
        "netuid": 124,
        "name": "Swarm",
        "symbol": null,
        "price_tao": null,
        "emission_share": null,
        "miners": 245,
        "validators": 11,
        "max_uids": 256,
        "registration_cost_tao": 0.609712695,
        "registration_allowed": true,
        "tempo": 360,
        "owner_coldkey": "5HKYqfJrUFKYPMRFZZ7kfhUNEyHUbY2ZyEjQqKJf2RKVpeXM"
      },
      "health": {
        "netuid": 124,
        "score": 73,
        "band": "watch",
        "factors": [
          {
            "id": "validators_active",
            "label": "Validators active this tempo",
            "score": 91,
            "weight": 0.4,
            "value": "10 of 11",
            "explanation": "Share of permitted validators that set weights within one tempo; stale validators stop scoring miners"
          },
          {
            "id": "incentive_spread",
            "label": "Miner incentive spread",
            "score": 7,
            "weight": 0.25,
            "value": "Gini 0.93",
            "explanation": "How evenly incentive is spread across miners; a Gini near 1 means a few UIDs take almost everything"
          },
          {
            "id": "burn_ratio",
            "label": "Miner emission not burned",
            "score": 100,
            "weight": 0.2,
            "value": "0.0% burned",
            "explanation": "Share of miner emission that is burned or recycled instead of paid to miners"
          },
          {
            "id": "registration_open",
            "label": "Registration open",
            "score": 100,
            "weight": 0.15,
            "value": "open",
            "explanation": "Whether new miners can register right now"
          }
        ],
        "findings": []
      }
    },
    "hyperparams": [
      {
        "name": "tempo",
        "group": "Emissions",
        "value": "360",
        "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
        "range": "1 to 65535",
        "who": "root"
      },
      {
        "name": "immunity_period",
        "group": "Registration",
        "value": "5000",
        "meaning": "Blocks a new UID is protected from pruning after it registers",
        "range": "0 to 65535",
        "who": "owner"
      },
      {
        "name": "max_allowed_uids",
        "group": "Registration",
        "value": "256",
        "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
        "range": "up to 256",
        "who": "owner"
      },
      {
        "name": "registration_allowed",
        "group": "Registration",
        "value": "true",
        "meaning": "Whether burned registration is open",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "max_regs_per_block",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "target_regs_per_interval",
        "group": "Registration",
        "value": "1",
        "meaning": "Registrations per adjustment interval the burn price steers toward",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "adjustment_interval",
        "group": "Registration",
        "value": "360",
        "meaning": "Blocks between burn price adjustments",
        "range": "1 or more",
        "who": "root"
      },
      {
        "name": "min_burn",
        "group": "Registration",
        "value": "0.5 TAO",
        "meaning": "Floor of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "max_burn",
        "group": "Registration",
        "value": "100 TAO",
        "meaning": "Ceiling of the registration burn",
        "range": "owner set",
        "who": "owner"
      },
      {
        "name": "weights_rate_limit",
        "group": "Weights",
        "value": "100",
        "meaning": "Blocks a validator must wait between set_weights calls",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "min_allowed_weights",
        "group": "Weights",
        "value": "1",
        "meaning": "Fewest UIDs a weight vector may cover",
        "range": "0 to max UIDs",
        "who": "owner"
      },
      {
        "name": "max_weights_limit",
        "group": "Weights",
        "value": "1.0000",
        "meaning": "Largest share of total weight one UID may receive",
        "range": "0 to 1",
        "who": "owner"
      },
      {
        "name": "weights_version",
        "group": "Weights",
        "value": "0",
        "meaning": "Version key validators must send with weights; mismatches are rejected",
        "range": "any u64",
        "who": "owner"
      },
      {
        "name": "activity_cutoff",
        "group": "Weights",
        "value": "5000",
        "meaning": "Blocks without a weight update before a validator counts as inactive",
        "range": "1 or more",
        "who": "owner"
      },
      {
        "name": "kappa",
        "group": "Consensus",
        "value": "0.5000",
        "meaning": "Stake share that must agree for a weight to survive consensus clipping",
        "range": "0 to 1",
        "who": "root"
      },
      {
        "name": "max_validators",
        "group": "Consensus",
        "value": "64",
        "meaning": "Validator permits handed out by stake",
        "range": "1 to max UIDs",
        "who": "root"
      },
      {
        "name": "yuma_version",
        "group": "Consensus",
        "value": "2",
        "meaning": "Which Yuma consensus variant runs each epoch",
        "range": "2 or 3",
        "who": "owner"
      },
      {
        "name": "liquid_alpha_enabled",
        "group": "Consensus",
        "value": "false",
        "meaning": "Whether bonds move faster for validators that agree with consensus early",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "serving_rate_limit",
        "group": "Other",
        "value": "50",
        "meaning": "Blocks between serve_axon calls for one hotkey",
        "range": "0 or more",
        "who": "owner"
      },
      {
        "name": "commit_reveal_weights_enabled",
        "group": "Commit reveal",
        "value": "true",
        "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
        "range": "true or false",
        "who": "owner"
      },
      {
        "name": "commit_reveal_period",
        "group": "Commit reveal",
        "value": "1",
        "meaning": "Epochs between a commit and its reveal",
        "range": "1 or more",
        "who": "owner"
      }
    ]
  }
};

// Defaults are the live values of SN92, the most recently registered subnet in this recording
export const DEMO_PLAN: LaunchPlan = {
  "chain": {
    "network": "finney",
    "endpoint": "wss://entrypoint-finney.opentensor.ai:443",
    "block": 9376750,
    "block_hash": "0xa5077894691354a0956f128eec9aa077a84b13a094b33df4411990f2bc6efd86",
    "runtime_spec": 486
  },
  "lock_cost_tao": 352.09906748,
  "min_lock_tao": 1.0,
  "last_lock_tao": 224.64450562,
  "lock_reduction_interval": 57600,
  "rate_limit_blocks": 14400,
  "next_registration_block": 9378690,
  "subnet_count": 129,
  "subnet_limit": 128,
  "replaced_netuid": 16,
  "replaced_name": "Zero Hour",
  "network_immunity_blocks": 432000,
  "start_call_delay": 0,
  "timeline": [
    {
      "label": "Registration opens",
      "block": 9378690,
      "detail": "NetworkRateLimit is 14400 blocks and the last subnet registered at block 9,364,290"
    },
    {
      "label": "Register network",
      "block": 9378690,
      "detail": "Burns the lock cost and creates the subnet; you become owner"
    },
    {
      "label": "start_call allowed",
      "block": 9378690,
      "detail": "StartCallDelay is 0 blocks on this network, so start_call can follow immediately"
    },
    {
      "label": "First emissions",
      "block": 9379050,
      "detail": "Emissions begin at the first epoch after start_call, one tempo of 360 blocks later"
    },
    {
      "label": "Immunity ends",
      "block": 9810690,
      "detail": "NetworkImmunityPeriod is 432,000 blocks; after that the subnet can be replaced at the cap"
    }
  ],
  "defaults": [
    {
      "name": "tempo",
      "group": "Emissions",
      "value": "360",
      "meaning": "Blocks between epochs; emissions and consensus run once per tempo",
      "range": "1 to 65535",
      "who": "root"
    },
    {
      "name": "immunity_period",
      "group": "Registration",
      "value": "7200",
      "meaning": "Blocks a new UID is protected from pruning after it registers",
      "range": "0 to 65535",
      "who": "owner"
    },
    {
      "name": "max_allowed_uids",
      "group": "Registration",
      "value": "256",
      "meaning": "Seats on the subnet; once full, each registration prunes the lowest scoring UID",
      "range": "up to 256",
      "who": "owner"
    },
    {
      "name": "registration_allowed",
      "group": "Registration",
      "value": "true",
      "meaning": "Whether burned registration is open",
      "range": "true or false",
      "who": "owner"
    },
    {
      "name": "max_regs_per_block",
      "group": "Registration",
      "value": "1",
      "meaning": "Registrations accepted in a single block before TooManyRegistrationsThisBlock",
      "range": "1 or more",
      "who": "root"
    },
    {
      "name": "target_regs_per_interval",
      "group": "Registration",
      "value": "2",
      "meaning": "Registrations per adjustment interval the burn price steers toward",
      "range": "1 or more",
      "who": "owner"
    },
    {
      "name": "adjustment_interval",
      "group": "Registration",
      "value": "360",
      "meaning": "Blocks between burn price adjustments",
      "range": "1 or more",
      "who": "root"
    },
    {
      "name": "min_burn",
      "group": "Registration",
      "value": "0.5 TAO",
      "meaning": "Floor of the registration burn",
      "range": "owner set",
      "who": "owner"
    },
    {
      "name": "max_burn",
      "group": "Registration",
      "value": "5 TAO",
      "meaning": "Ceiling of the registration burn",
      "range": "owner set",
      "who": "owner"
    },
    {
      "name": "weights_rate_limit",
      "group": "Weights",
      "value": "100",
      "meaning": "Blocks a validator must wait between set_weights calls",
      "range": "0 or more",
      "who": "owner"
    },
    {
      "name": "min_allowed_weights",
      "group": "Weights",
      "value": "1",
      "meaning": "Fewest UIDs a weight vector may cover",
      "range": "0 to max UIDs",
      "who": "owner"
    },
    {
      "name": "max_weights_limit",
      "group": "Weights",
      "value": "1.0000",
      "meaning": "Largest share of total weight one UID may receive",
      "range": "0 to 1",
      "who": "owner"
    },
    {
      "name": "weights_version",
      "group": "Weights",
      "value": "0",
      "meaning": "Version key validators must send with weights; mismatches are rejected",
      "range": "any u64",
      "who": "owner"
    },
    {
      "name": "activity_cutoff",
      "group": "Weights",
      "value": "5000",
      "meaning": "Blocks without a weight update before a validator counts as inactive",
      "range": "1 or more",
      "who": "owner"
    },
    {
      "name": "kappa",
      "group": "Consensus",
      "value": "0.5000",
      "meaning": "Stake share that must agree for a weight to survive consensus clipping",
      "range": "0 to 1",
      "who": "root"
    },
    {
      "name": "max_validators",
      "group": "Consensus",
      "value": "64",
      "meaning": "Validator permits handed out by stake",
      "range": "1 to max UIDs",
      "who": "root"
    },
    {
      "name": "yuma_version",
      "group": "Consensus",
      "value": "3",
      "meaning": "Which Yuma consensus variant runs each epoch",
      "range": "2 or 3",
      "who": "owner"
    },
    {
      "name": "liquid_alpha_enabled",
      "group": "Consensus",
      "value": "false",
      "meaning": "Whether bonds move faster for validators that agree with consensus early",
      "range": "true or false",
      "who": "owner"
    },
    {
      "name": "serving_rate_limit",
      "group": "Other",
      "value": "50",
      "meaning": "Blocks between serve_axon calls for one hotkey",
      "range": "0 or more",
      "who": "owner"
    },
    {
      "name": "commit_reveal_weights_enabled",
      "group": "Commit reveal",
      "value": "true",
      "meaning": "Weights are committed encrypted and revealed later so they cannot be copied",
      "range": "true or false",
      "who": "owner"
    },
    {
      "name": "commit_reveal_period",
      "group": "Commit reveal",
      "value": "1",
      "meaning": "Epochs between a commit and its reveal",
      "range": "1 or more",
      "who": "owner"
    }
  ],
  "block_seconds": 12
};
