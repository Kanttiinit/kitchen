import { App } from 'octokit';
import { githubAppId, githubPrivateKey } from '../environment.ts';
import { decodeBase64 } from '@std/encoding/base64';

const OWNER = 'kanttiinit';
const REPO = 'kitchen';
const RESTAURANTS_PATH = 'data/restaurants.yml';
const BRANCH = 'deno-static-site';

const pem = new TextDecoder().decode(decodeBase64(githubPrivateKey || ''));
const app = new App({ appId: githubAppId || '', privateKey: pem });
const { data: installation } = await app.octokit.rest.apps.getRepoInstallation({
  owner: OWNER,
  repo: REPO,
});
const octokit = await app.getInstallationOctokit(installation.id);

export async function getLatestRestaurantsFile(): Promise<string> {
  const res = await octokit.rest.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: RESTAURANTS_PATH,
    ref: BRANCH,
    mediaType: { format: 'raw' },
  });
  return res.data;
}

export async function commitRestaurantsFile(contents: string, commitMessage: string) {
  await octokit.rest.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: RESTAURANTS_PATH,
    message: commitMessage,
    content: btoa(contents),
    branch: BRANCH,
  });
}
