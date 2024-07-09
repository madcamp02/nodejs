import { db } from '../database/db.js';
import { model } from '../database/model.js';
import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv';
dotenv.config();

export async function retrieveOwnersAndRepos(req, res) {
  try {
    const { user_github_id, gitcat_secret } = req.query;
    if(!user_github_id || !gitcat_secret ) throw('user_github_id or gitcat_secret is not given');
    if(gitcat_secret != process.env.GITCAT_SECRET) throw('gitcat_secret does not match!');
    
    const user = await model.GetUserByUserGithubId(user_github_id);
    console.log('USER', user);
    if(user_name != user.user_name) throw('user_name mismatch'); // name change not considered

    const octokit = new Octokit({
      auth: user.access_token
    })

    const ownersRepos = [];
    const { data: myRepos } = await octokit.repos.listForAuthenticatedUser();
    // Fetch the user's own repositories

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

    res.json({status: 'success', ownersRepos: ownersRepos});
    // return ownersRepos; // List of objects containing owner and repositories
  } catch (error) {
    console.error('Error fetching owners and repos:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
}

// export async function fetchOwnersAndRepos(req, res) {
//   try {
//     const { user_id, user_name, gitcat_secret } = req.query;
//     if(!user_id || !gitcat_secret || !user_name) throw('user_id or gitcat_secret or user_name is not given');
//     if(gitcat_secret != process.env.GITCAT_SECRET) throw('gitcat_secret does not match!');
    
//     const user = await model.GetUserByUserId(user_id);
//     console.log('USER', user);
//     if(user_name != user.user_name) throw('user_name mismatch'); // name change not considered

//     const octokit = new Octokit({
//       auth: user.access_token
//     })

//     const owner_list = await model.GetOwnerListByOwnerIdList(JSON.parse(user.owner_id_list));
//     const { data: myRepos } = await octokit.repos.listForAuthenticatedUser();

//     user.owner_id_list
//     for (const myRepo of myRepos){
//       const [existingRepo] = await db.execute('SELECT 1 FROM Repositories WHERE owner_github_id = ? AND repo_github_id = ?', [user.user_github_id, myRepo.github_id]);
    
//       // If the repository does not exist, insert it
//       if (existingRepo.length === 0) {
//           await db.execute('INSERT INTO Repositories (repo_github_id, repo_name, repo_url, owner_github_id) VALUES (?, ?, ?, ?)', [repo.id, repo.name, repo.html_url, repo.owner.id]);
//       }
//     }










//     // Fetch the user's own repositories

//     ownersRepos.push({
//       owner_name: user.user_name,
//       repositories: myRepos
//     })

//     const { data: organizations } = await octokit.orgs.listForAuthenticatedUser();
//     console.log('organizations:', organizations);
//     for(const org of organizations){
//       const orgName = org.login;

//       console.log(`Organization: ${orgName}`);

//       const { data: repos } = await octokit.repos.listForOrg({
//         org: orgName,
//         type: 'all'
//       })

//       ownersRepos.push({
//         owner_name: orgName,
//         repositories: repos
//       })
//     }
//     console.log(ownersRepos);
//     return ownersRepos; // List of objects containing owner and repositories
//   } catch (error) {
//     console.error('Error fetching owners and repos:', error);
//     res.status(500).json({ status: 'error', message: error.message });
//   }
// }
