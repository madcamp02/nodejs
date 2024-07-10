### Outline

---

![다운로드.jpg](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/%25EB%258B%25A4%25EC%259A%25B4%25EB%25A1%259C%25EB%2593%259C.jpg)

찌삐찌삐 ☆*: .｡. o(≧▽≦)o .｡.:*☆

깃허브 마법사! ○( ＾皿＾)っ Hehehe…

허접한 너의 깃허브를 도와주겠다냥~~

（＾∀＾●）ﾉｼ 찌삐찌삐 

---

펫 깃켓은 사용자가 깃허브를 친숙하게 사용할수 있도록 돕습니다

### Team

---

[강지원](https://www.notion.so/80c097661e54455ea0c6f814cbe252db?pvs=21)


[박지은](https://www.notion.so/051da53833934d7086132ba53b4118cb?pvs=21)


[SadCamp](https://www.notion.so/SadCamp-cc25de5257fe4849be645a4c02e98353?pvs=21) 


### Tech Stack

---

**Front-end** : Flutter

**Back-end**: Node.js

**Database**: MySQL

**IDE**: Android Studio / Vscode

**SERVER PLATFORM**: Google Cloud

### About

---

### **Intro**

깃허브를 얼마나 알고 계신가요?

백업 용도로 깃허브를 사용하시는 당신을 위해 준비했습니다(본인 이야기)

### **이렇게 만들었어요🧐🧐**

# 제목 없음

## Users DB

| Name | Data Type |
| --- | --- |
| user_id | BIGINT AUTO_INCREMENT PRIMARY KEY |
| user_name | VARCHAR (255) NOT NULL |
| access_token | VARCHAR (255) NOT NULL |
| List<owner_id> | JSON |
| user_github_id | BIGINT |

## Owners DB — (User와 organization의 추상화 개념)

| Name | Data Type | description |
| --- | --- | --- |
| owner_id | BIGINT |  |
| is_organization | TINYINT (1) NOT NULL DEFAULT 0 | 0 / 1 |
| owner_name | VARCHAR (255) NOT NULL | “My Repos”(1) 이거나 organization_name(0) |
| List<repo_id> | JSON |  |
| owner_github_id | BIGINT | user_github_id(1) 이거나
organization_github_id (0) |

## Repositories DB — almost consistent (better in DB)

| Name | Data Type |
| --- | --- |
| repo_id | BIGINT AUTO_INCREMENT PRIMARY KEY |
| repo_name | VARCHAR (255) NOT NULL |
| repo_url | VARCHAR (255) NOT NULL |
| owner_github_id | BIGINT |
| repo_github_id | BIGINT |

## Milestones DB

| Name | Data Type |
| --- | --- |
| mlstn_id | BIGINT AUTO_INCREMENT PRIMARY KEY |
| mlstn_state | TINYINT (1) |
| mlstn_title | VARCHAR (255) NOT NULL |
| mlstn_due | DATE |
| mlstn_descr | VARCHAR (255) |
| repo_id | BIGINT |
| owner_github_id | BIGINT |
| repo_github_id | BIGINT |
| mlstn_github_id | BIGINT |

## Issues DB

| Name | Data Type |
| --- | --- |
| issue_id | BIGINT AUTO_INCREMENT PRIMARY KEY |
| issue_title | VARCHAR (255) NOT NULL |
| issue_state | TINYINT (1) |
| mlstn_id | BIGINT |
| List<label_id> | JSON |
| owner_github_id | BIGINT |
| repo_github_id | BIGINT |
| issue_github_id | BIGINT |

## Labels DB

| Name | Data Type |
| --- | --- |
| label_id | BIGINT |
| label_name | VARCHAR (50) |
| label_color | VARCHAR (7) |
| owner_github_id | BIGINT |
| repo_github_id | BIGINT |
| label_github_id | BIGINT |

## Commits DB

| Name | Data Type |  |
| --- | --- | --- |
| commit_id | BIGINT AUTO_INCREMENT PRIMARY KEY |  |
| ai_labeled | TINYINT (1) | whether ai has labeled related existing issues |
| commit_msg | TEXT |  |
| commit_date | DATETIME |  |
| commit_image | URI |  |
| til_id | BIGINT DEFAULT null |  |
| List<issue_id> | JSON |  |
| owner_github_id | BIGINT |  |
| repo_github_id | BIGINT |  |
| commit_github_id | BIGINT |  |

## TILs DB

| Name | Data Type |
| --- | --- |
| til_id | BIGINT AUTO_INCREMENT PRIMARY KEY |
| user_id | BIGINT |
| til_content | TEXT |
| commit_id | BIGINT |
| commit_msg | TEXT |
| commit_date | DATETIME |

[GitCat — API 명세서 (1)](https://www.notion.so/GitCat-API-1-42e96621e0f84264972d3c226f7a5310?pvs=21)

🤜  **GitCat — flow chart**

![Untitled](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Untitled.png)

![Untitled](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/467c59e6-04d9-4a67-a386-af2b7b6f26da.png)

### 😻이런 기능이 있어요!

### 1️⃣ 로그인

- GitHub OAuth를 통해 백엔드에서 accessToken을 저장하고 별도의 gitcatToken을 발급하여 유저에게 전달함으로써 더욱 안전하고 빠르게 로그인해요.
- 로그인 시 전체 권한을 요구하며, 이를 통해 모든 기능을 자유롭게 이용할 수 있어요.

![Login.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Login.png)

### 2️⃣ Repo Selection

로그인 후, Organization과 Repository를 선택해요. 

- 다양한 프로젝트 중에서 원하는 저장소를 쉽게 선택할 수 있어요.
- octokit의 `listRepos` 및 `getUserOrgs` 기능을 사용해요.

![Repo Selection.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Repo_Selection.png)

### 3️⃣ Home

선택한 Repository의 다양한 기능을 홈 화면에서 간편하게 이용할 수 있어요.

- **Milestones**: 프로젝트의 중요한 단계를 관리하고 추적할 수 있어요.
- **Commits**: 커밋 내역을 확인하고, 필요한 정보를 바로 찾을 수 있어요.
- **TILs (Today I Learned)**: 오늘 배운 내용을 기록하고 공유할 수 있어요.

![Home.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Home.png)

### 4️⃣ Milestones

내 Repository에 설정된 Milestones와 관련 이슈를 한 눈에 볼 수 있어요.

- **Milestone 확인 및 추가**:
    - 현재 진행 중인 Milestone을 확인하고 새로운 Milestone을 추가할 수 있어요.
    - octokit의 `listMilestones` 및 `createMilestone` 기능을 사용해요.
- **Issue 확인 및 추가**:
    - 각 Milestone에 연결된 이슈를 확인하고 필요 시 새로운 이슈를 추가할 수 있어요.
    - octokit의 `listIssues` 및 `createIssue` 기능을 사용해요.

![Milestones.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Milestones.png)

### 5️⃣ Commits

내 Repository에 작성한 Commit들과의 상호작용이 가능해요

- **전체 Commit과 label 보기**:
    - 모든 커밋 내역을 확인하고, 각 커밋에 부여된 라벨을 통해 분류할 수 있어요.
    - octokit의 `listCommits` 및 `listLabelsForRepo` 기능을 사용해요.

![Recent Commits.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Recent_Commits.png)

- **Commit 상세 항목 보기**:
    - 특정 커밋을 클릭하여 상세 정보를 확인할 수 있어요.
    - octokit의 `getCommit` 기능을 사용해요.

![Commit Detail.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/Commit_Detail.png)

### 6️⃣ TILs

내가 작성한 Commit에 TIL을 추가하고 한 눈에 볼 수 있어요

- **TIL 추가**:
    - 새로운 커밋을 작성할 때마다 TIL을 함께 기록하여, 배운 내용을 체계적으로 정리할 수 있어요
    - octokit의 `createCommitComment` 기능을 사용해요.
- **TIL 한 눈에 보기**:
    - 기록된 TIL을 한 눈에 확인할 수 있는 기능을 통해, 매일매일의 성장을 추적하고 복습할 수 있어요.
    - octokit의 `listCommitComments` 기능을 사용해요.

![My TILs.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20ed4ed0f26a3449d4a94556e60e6230f3/My_TILs.png)
