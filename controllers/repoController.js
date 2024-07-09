const { db } = require('../database/db');
const { model } = require('../database/model');
const dotenv = require('dotenv');
dotenv.config();

async function retrieveOwnersAndRepos(req, res) {
  try {
    console.log('retrieving...');
    const { user_github_id, gitcat_secret } = req.query;
    if (!user_github_id || !gitcat_secret) throw new Error('user_github_id or gitcat_secret is not given');
    if (gitcat_secret != process.env.GITCAT_SECRET) throw new Error('gitcat_secret does not match!');

    const user = await model.GetUserByUserGithubId(user_github_id);
    console.log('USER', user);

    // Dynamic import for @octokit/rest
    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({
      auth: user.access_token
    });

    const ownersRepos = [];
    const { data: myRepos } = await octokit.repos.listForAuthenticatedUser();
    // Fetch the user's own repositories

    ownersRepos.push({
      owner_name: user.user_name,
      repositories: myRepos
    });

    const { data: organizations } = await octokit.orgs.listForAuthenticatedUser();
    console.log('organizations:', organizations);
    for (const org of organizations) {
      const orgName = org.login;

      console.log(`Organization: ${orgName}`);

      const { data: repos } = await octokit.repos.listForOrg({
        org: orgName,
        type: 'all'
      });

      ownersRepos.push({
        owner_name: orgName,
        repositories: repos
      });
    }
    console.log(ownersRepos);
    res.status(200).json({ status: 'success', ownersRepos: ownersRepos });
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

module.exports = {
  retrieveOwnersAndRepos
};
