export interface RepositoryResponse {
  repositoryName: string;
  repositoryUrl: string;
}

export interface GitInstallResponse {
  installationUrl: string;
}

export interface GithubCommitRequest {
  message: string;
  content: string;
  repo: string;
  branch?: string;
  sha?: string;
  committer?: {
    name?: string;
    email?: string;
  };
}

export interface CreateCommitRequest {
  message: string;
  tree: string;
  parents: string[];
  author?: {
    name: string;
    email: string;
  };
}

export interface CreateCommitResponse {
  sha: string;
  url: string;
}

export interface CreateRefRequest {
  ref: string;
  sha: string;
}
