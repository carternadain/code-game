import type { Realm } from '../types'

export const aws: Realm = {
  id: 'aws',
  name: 'Cloud Archipelago',
  topic: 'AWS & the Cloud',
  icon: '☁️',
  color: '#ff9900',
  when: 'Month 8',
  blurb: "The AWS services you'll actually touch, how IAM permissions really get evaluated, and serverless with Lambda.",
  lessons: [
    {
      id: 'aws-1',
      title: 'The Map: Core AWS Services',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: '200+ services, ~12 that matter first',
          eli5: 'AWS is a **giant hardware store you rent from by the minute**: computers (EC2/Lambda), storage lockers (S3), filing cabinets (RDS/DynamoDB), and security guards (IAM).',
          body: `
"The cloud" = renting someone else's computers by the second, through an API.

## Compute
- **EC2** — virtual machines. You manage the OS.
- **Lambda** — run a function on demand; no servers to manage; pay per invocation.
- **ECS / Fargate** — run Docker containers. **EKS** = managed Kubernetes.

## Storage & data
- **S3** — object storage: files, images, backups, static websites. Practically infinite.
- **RDS / Aurora** — managed Postgres/MySQL (backups, patching, replicas handled for you).
- **DynamoDB** — managed NoSQL key-value, single-digit-ms at any scale.
- **ElastiCache** — managed Redis.

## Networking & delivery
- **VPC** — your private network. Public subnets face the internet; private subnets (your DB!) don't.
- **ALB** — load balancer. **CloudFront** — CDN. **Route 53** — DNS. **API Gateway** — HTTP front door for Lambdas.

## Glue & ops
- **IAM** — who can do what. **SQS** — queues. **SNS / EventBridge** — pub/sub & events.
- **CloudWatch** — logs, metrics, alarms. **Secrets Manager** — API keys & passwords.

> Regions (us-east-1) are separate geographic areas; each has multiple **Availability Zones** (separate data centers). Run across 2+ AZs to survive one going down.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Users upload profile pictures. Where should they be stored?',
          options: ["On the EC2 instance's disk", 'In the RDS database as blobs', 'In S3, with the S3 key saved in the database', 'In Lambda'],
          answer: 2,
          explain:
            "Instance disks die with the instance and aren't shared between servers (remember: stateless!). Databases are expensive for big files. S3 + a DB pointer is the standard pattern, often with CloudFront in front.",
        },
        {
          kind: 'quiz',
          prompt: 'You need to run a nightly 5-minute cleanup job. Cheapest, least-maintenance option?',
          options: [
            'An EC2 instance running 24/7 with cron',
            'A Lambda triggered by an EventBridge schedule',
            'An EKS cluster',
            'A Fargate service with 3 replicas',
          ],
          answer: 1,
          explain:
            'You pay for ~5 minutes of compute per day and manage zero servers. (Lambda max runtime is 15 minutes — longer jobs go to Fargate/ECS tasks.)',
        },
      ],
    },
    {
      id: 'aws-2',
      title: 'IAM: Who Can Do What',
      minutes: 18,
      steps: [
        {
          kind: 'concept',
          title: 'Policies are JSON rules',
          eli5: 'IAM is a **bouncer with a guest list**. Not on the list = no entry. On the "banned" list = no entry, *even if* you\'re also on the guest list.',
          body: `
Every AWS API call is checked against **IAM policies** attached to the caller (a user, or a **role** that a Lambda/EC2 assumes).

\`\`\`
{
  "Statement": [
    { "Effect": "Allow", "Action": ["s3:GetObject", "s3:PutObject"], "Resource": "arn:aws:s3:::avatars/*" },
    { "Effect": "Deny",  "Action": "s3:*", "Resource": "arn:aws:s3:::avatars/admin/*" }
  ]
}
\`\`\`
## The evaluation rules
1. By default everything is **denied** (implicit deny).
2. If any statement **explicitly Denies** the request → **denied**. Deny always wins.
3. Otherwise, if any statement **Allows** it → allowed.
4. \`*\` is a wildcard: \`s3:*\` matches every S3 action.

**Least privilege**: grant only the actions and resources needed. \`"Action": "*", "Resource": "*"\` on an app's role is how breaches become disasters.
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write the IAM policy evaluator',
          instructions: `
Write \`isAllowed(policy, action, resource)\` implementing the rules above.

- \`policy.Statement\` is an array. \`Action\` and \`Resource\` can be a string **or** an array of strings.
- Patterns can contain \`*\` meaning "any characters" (write a helper \`matches(pattern, value)\`).
- Explicit Deny beats Allow. No match → \`false\`.
`,
          starter: `function matches(pattern, value) {\n  // turn 's3:Get*' into a check... (a RegExp is one way — escape the other characters!)\n}\n\nfunction isAllowed(policy, action, resource) {\n  \n}\n`,
          tests: `const policy = { Statement: [
  { Effect: 'Allow', Action: ['s3:GetObject', 's3:PutObject'], Resource: 'arn:aws:s3:::avatars/*' },
  { Effect: 'Deny', Action: 's3:*', Resource: 'arn:aws:s3:::avatars/admin/*' },
  { Effect: 'Allow', Action: 'dynamodb:Get*', Resource: '*' },
] }
test('wildcard matcher', () => { expect(matches('s3:*', 's3:GetObject')).toBe(true); expect(matches('s3:Get*', 's3:PutObject')).toBe(false) })
test('dots are literal, not regex', () => expect(matches('a.b', 'axb')).toBe(false))
test('allowed', () => expect(isAllowed(policy, 's3:GetObject', 'arn:aws:s3:::avatars/ada.png')).toBe(true))
test('explicit deny wins', () => expect(isAllowed(policy, 's3:GetObject', 'arn:aws:s3:::avatars/admin/secret.png')).toBe(false))
test('implicit deny', () => expect(isAllowed(policy, 's3:DeleteObject', 'arn:aws:s3:::avatars/ada.png')).toBe(false))
test('wildcard action', () => expect(isAllowed(policy, 'dynamodb:GetItem', 'arn:aws:dynamodb:us-east-1:1:table/heroes')).toBe(true))
test('empty policy denies', () => expect(isAllowed({ Statement: [] }, 's3:GetObject', 'x')).toBe(false))`,
          hint: "matches: new RegExp('^' + pattern.split('*').map(s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('.*') + '$').test(value). Normalize Action/Resource with [].concat(x).",
          solution: `function matches(pattern, value) {\n  const escaped = pattern.split('*').map((part) => part.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'))\n  return new RegExp('^' + escaped.join('.*') + '$').test(value)\n}\n\nfunction isAllowed(policy, action, resource) {\n  let allowed = false\n  for (const st of policy.Statement) {\n    const hit =\n      [].concat(st.Action).some((a) => matches(a, action)) &&\n      [].concat(st.Resource).some((r) => matches(r, resource))\n    if (!hit) continue\n    if (st.Effect === 'Deny') return false\n    if (st.Effect === 'Allow') allowed = true\n  }\n  return allowed\n}\n`,
        },
      ],
    },
    {
      id: 'aws-3',
      title: 'Serverless with Lambda',
      minutes: 15,
      steps: [
        {
          kind: 'concept',
          title: 'Just a function',
          eli5: "Lambda is a **light that only turns on when someone walks in** — you pay only while it's on, and AWS does all the wiring.",
          body: `
A Lambda is a function AWS calls with an **event** (an HTTP request from API Gateway, a new file in S3, a message from SQS, a schedule…):

\`\`\`
export const handler = async (event) => {
  const id = event.pathParameters?.id
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),   // body must be a STRING
  }
}
\`\`\`
## Things to know
- **Cold starts** — the first request after idle spins up a new container (100ms–1s+). Keep packages small; init clients *outside* the handler so warm invocations reuse them.
- **Stateless & ephemeral** — no local state between invocations you can rely on.
- **Scales automatically** — 1,000 concurrent requests → up to 1,000 instances. Which can melt your database (use RDS Proxy).
- **Limits** — 15 min max, memory 128MB–10GB (CPU scales with memory).
`,
        },
        {
          kind: 'code',
          lang: 'javascript',
          title: 'Write a Lambda handler',
          instructions: `
Write \`async function handler(event)\` for API Gateway that fetches a hero:
- \`event.pathParameters.id\` is the hero id (a **string**!). Look it up in \`HEROES\`.
- found → \`statusCode: 200\`, body = the hero as JSON
- not found → \`404\`, body \`{"error":"Hero not found"}\`
- missing id → \`400\`, body \`{"error":"id is required"}\`
- always include \`headers: { 'Content-Type': 'application/json' }\`
`,
          starter: `const HEROES = { 1: { id: 1, name: 'Ada' }, 2: { id: 2, name: 'Linus' } }\n\nasync function handler(event) {\n  \n}\n\nhandler({ pathParameters: { id: '1' } }).then(console.log)\n`,
          tests: `test('200 for an existing hero', async () => {
  const r = await handler({ pathParameters: { id: '2' } })
  expect(r.statusCode).toBe(200)
  expect(JSON.parse(r.body)).toEqual({ id: 2, name: 'Linus' })
  expect(r.headers['Content-Type']).toBe('application/json')
})
test('body is a string', async () => expect(typeof (await handler({ pathParameters: { id: '1' } })).body).toBe('string'))
test('404', async () => { const r = await handler({ pathParameters: { id: '99' } }); expect(r.statusCode).toBe(404); expect(JSON.parse(r.body)).toEqual({ error: 'Hero not found' }) })
test('400 when id missing', async () => expect((await handler({ pathParameters: null })).statusCode).toBe(400))`,
          hint: "const id = event.pathParameters?.id; const json = (statusCode, data) => ({ statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })",
          solution: `const HEROES = { 1: { id: 1, name: 'Ada' }, 2: { id: 2, name: 'Linus' } }\n\nconst json = (statusCode, data) => ({\n  statusCode,\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify(data),\n})\n\nasync function handler(event) {\n  const id = event.pathParameters?.id\n  if (!id) return json(400, { error: 'id is required' })\n  const hero = HEROES[id]\n  if (!hero) return json(404, { error: 'Hero not found' })\n  return json(200, hero)\n}\n`,
        },
      ],
    },
    {
      id: 'aws-4',
      title: 'BOSS: Architect a Real App',
      boss: true,
      minutes: 20,
      steps: [
        {
          kind: 'concept',
          title: 'A classic production setup',
          eli5: "It's a **castle**: CDN = drawbridge for visitors, load balancer = gate guards, app servers = workers inside, database = the vault deep in the private keep.",
          body: `
Your React + API + Postgres app on AWS:

\`\`\`
Users ─► Route 53 (DNS)
       ─► CloudFront (CDN) ─► S3 (built React files)
       ─► ALB (load balancer, HTTPS)
            ─► ECS Fargate tasks (your API, in 2+ AZs, private subnets)
                 ─► RDS Postgres (primary + standby, private subnet)
                 ─► ElastiCache Redis (cache, sessions)
                 ─► S3 (uploads)
                 ─► SQS ─► worker tasks (emails, image processing)
Secrets Manager (DB password) · CloudWatch (logs & alarms) · IAM roles per service
\`\`\`
Defined as code (CDK, Terraform), deployed by CI/CD — never by clicking around the console in prod.
`,
        },
        {
          kind: 'quiz',
          prompt: 'Where should the RDS database live?',
          options: [
            'A public subnet so the team can connect easily',
            "A private subnet, reachable only from the app's security group",
            'In S3',
            'Anywhere, as long as it has a strong password',
          ],
          answer: 1,
          explain:
            "Databases should never be reachable from the internet. Security groups act as firewalls: allow port 5432 only from the API's security group. Devs connect through a bastion/SSM tunnel.",
        },
        {
          kind: 'quiz',
          prompt: 'Your API needs the DB password. Best practice?',
          options: [
            'Hardcode it in the source',
            'Commit a .env file',
            "Store it in Secrets Manager; the task's IAM role is allowed to read it",
            'Put it in the Docker image',
          ],
          answer: 2,
          explain:
            'Secrets never go in code, Git, or images. The service gets an IAM role with permission to read just that secret, and you can rotate it without redeploying.',
        },
        {
          kind: 'quiz',
          prompt: 'One Availability Zone goes down. What keeps the app running?',
          options: [
            "Nothing, it's down",
            'Running app tasks in 2+ AZs behind the ALB, and RDS Multi-AZ failover',
            'CloudWatch alarms',
            'A bigger EC2 instance',
          ],
          answer: 1,
          explain:
            'The ALB stops sending traffic to the dead AZ, and RDS Multi-AZ promotes the standby in about a minute. Redundancy across AZs is the baseline for anything in production.',
        },
      ],
    },
  ],
  comingSoon: [
    'VPC networking: subnets, route tables, NAT',
    'S3 deep dive: presigned URLs, lifecycle rules',
    'DynamoDB single-table design',
    'Infrastructure as Code with CDK (TypeScript)',
    'Terraform basics',
    'CloudWatch: logs, metrics & alarms',
    "Cost control (don't get a $10k bill)",
    'AWS Cloud Practitioner → Solutions Architect Associate prep',
  ],
}
