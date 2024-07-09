import { db } from '../database/db.js';
import { model } from '../database/model.js';
import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';
dotenv.config();

export async function fetchOwnersAndRepos(req, res) {
  try {
    const { user_id, gitcat_secret } = req.query;
    if(!user_id || !gitcat_secret) throw('user_id or gitcat_secret is not given');
    if(gitcat_secret != process.env.GITCAT_SECRET) throw('gitcat_secret does not match!');
    
    const user = await model.GetUserByUserId(user_id);
    console.log('USER', user);
    const octokit = new Octokit({
      auth: user.access_token
    })
    const ownersRepos = [];

    // Fetch the user's own repositories
    const { data: myRepos } = await octokit.repos.listForAuthenticatedUser();

    ownersRepos.push({
      owner_name: user.user_name,
      repositories: myRepos
    })

    const { data: organizations } = await octokit.orgs.listForAuthenticatedUser();
    console.log('organizations:', organizations);
    for(const org of organizations){
      const orgName = org.login;

      console.log(`Organization: ${orgName}`);

      const { data: repos } = await octokit.repos.listForOrg({
        org: orgName,
        type: 'all'
      })

      ownersRepos.push({
        owner_name: orgName,
        repositories: repos
      })
    }
    console.log(ownersRepos);
    return ownersRepos; // List of objects containing owner and repositories
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}
