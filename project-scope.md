# AI-Powered Ticket Management System

##Problem

We recieve hunderes of support emails daily. Our agents manually read, classify and respond to each ticket. this is slow and leads to impersonal, canned responses.

##Solution

Build a teicket management system that uses AI to automatically classify, respond to and route support tickets. this will deliver faster and more personalised responses to students while freeing up agents for more complex issues.

the solution will always use British English and never use em dashes.

#Features

- receive support emails and create tickets
- auto-generate human friendly responses using a knowledge base
- ticket list with filtering and sorting
- ticket detail view
- ai powered ticket classification
- ai summaries
- ai suggested replies
- user management (admin only)
- dashboard to view and manage all tickets

#Ticket Statuses

- open
- resolved
- closed

#Ticket Categories

each ticket belongs to a single category:

- general question
- technical question
- refund request

#Users and Roles

- the system is deployed with a single admin account
- the admin can create additional agent accounts
- agents handle tickets day to day; only the admin manages users
- agents have no permissions beyond ticket handling

#AI Generated Replies

- the ai always drafts a reply; it is never sent to the student automatically
- an agent must review, optionally edit, and approve a reply before it is sent
- this applies to every ticket regardless of category or ai confidence