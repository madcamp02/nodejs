const { db } = require('../database/db');
const { model } = require('../database/model');
const dotenv = require('dotenv');
dotenv.config();

async function retrieveOwnersAndRepos(req, res) {
  try {
    console.log('retrieving...');
    const ownersRepos = [];
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
    
    // Fetch organizations the user is a part of
    const { data: organizations } = await octokit.orgs.listForAuthenticatedUser();
    console.log('organizations:', organizations);
    
    // Initialize owner_id_list if it's not already an array
    let owner_id_list = Array.isArray(user.owner_id_list) ? user.owner_id_list : [];
    
    // Fetch current owner list if owner_id_list is not empty
    let current_owner_list = [];
    if (owner_id_list.length > 0) {
      current_owner_list = await model.GetOwnerListByOwnerIdList(owner_id_list);
    }
    const current_owner_github_id_list = current_owner_list.map(owner => owner.owner_github_id);
    
    // Filter organizations to add new owners
    const to_add_owner_list = organizations.filter(organization => !current_owner_github_id_list.includes(organization.id));
    console.log('to_add_owner_list', to_add_owner_list);

    // Insert new owners into the database and update owner_id_list
    for (const to_add_owner of to_add_owner_list) {
      const [result] = await db.execute('INSERT INTO Owners (owner_github_id, owner_name, repo_id_list) VALUES (?, ?, ?)', [to_add_owner.id, to_add_owner.login, '[]']);
      owner_id_list.push(result.insertId);
    }
    
    // Update the user's owner_id_list in the database
    await db.execute('UPDATE Users SET owner_id_list = ? WHERE user_github_id = ?', [JSON.stringify(owner_id_list), user_github_id]);
    
    // Fetch repositories for each owner and insert new repositories if not present
    const placeholders = owner_id_list.map(() => '?').join(',');
    const query = `SELECT * FROM Owners WHERE owner_id IN (${placeholders})`;
    const [owner_list] = await db.execute(query, owner_id_list);
    
    console.log(`owner_list: ${owner_list}`);
    for (const owner of owner_list) {
      const ownerName = owner.owner_name;
      console.log(`Owner: ${ownerName}`);
      
      let repos;
      
      if(user_github_id != owner.owner_github_id){
        const { data: tmp} = await octokit.repos.listForOrg({
          org: ownerName,
          type: 'all'
        });
        repos = tmp;
      }else{
        const {data: tmp} = await octokit.repos.listForAuthenticatedUser();
        const userRepos = tmp.filter(repo => repo.owner.type !== 'Organization');
        repos = userRepos;
      }
      let current_repo_list = [];
      console.log('repo_id_list', owner.repo_id_list);
      let repo_id_list = Array.isArray(owner.repo_id_list) ? owner.repo_id_list : [];
      if (repo_id_list.length > 0) {
        current_repo_list = await model.GetRepoListByRepoIdList(repo_id_list);
      }
      const current_repo_github_id_list = current_repo_list.map(repo => repo.repo_github_id);
      
      console.log('repos:', repos);
      console.log('current_repo_id_list:', current_repo_github_id_list);
      const to_add_repo_list = repos.filter(repo => !current_repo_github_id_list.includes(repo.id));
    
      let repo_github_id_list = current_repo_github_id_list;
      for (const to_add_repo of to_add_repo_list) {
        const [result] = await db.execute('INSERT INTO Repositories (owner_github_id, repo_github_id, repo_name, repo_url) VALUES (?, ?, ?, ?)', [owner.owner_github_id, to_add_repo.id, to_add_repo.name, to_add_repo.html_url]);
        repo_github_id_list.push(result.insertId);
      }
    
      await db.execute('UPDATE Owners SET repo_id_list = ? WHERE owner_github_id = ?', [JSON.stringify(repo_github_id_list), owner.owner_github_id]);
      
      console.log('repo_github_id_list', repo_github_id_list);
      const updated_repo_list = await model.GetRepoListByRepoIdList(repo_github_id_list);
      ownersRepos.push({
        owner: owner,
        repoList: updated_repo_list
      });
    }

    console.log('ownersRepos', ownersRepos);
    res.status(200).json({ status: 'success', ownersRepos: ownersRepos });
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

module.exports = {
  retrieveOwnersAndRepos
};
