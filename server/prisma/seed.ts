import { auth } from "../src/lib/auth.ts";
import { prisma } from "../src/lib/prisma.ts";
import { Role } from "core/constants/role.ts";
import { agentTicketStatuses } from "core/constants/ticket-status.ts";
import { ticketCategories } from "core/constants/ticket-category.ts";

async function seedAdmin() {
  const ctx = await auth.$context;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`User ${email} already exists, skipping`);
    return;
  }

  const user = await ctx.internalAdapter.createUser(
    {
      email,
      name: "Admin",
      emailVerified: true,
      role: Role.admin,
    },
    { method: "admin" },
  );

  const hashedPassword = await ctx.password.hash(password);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hashedPassword,
  });

  console.log(`Created admin user ${email}`);
}

const sampleTickets = [
  { subject: "Cannot log in", body: "I keep getting an invalid password error." },
  { subject: "Billing question", body: "Why was I charged twice this month?" },
  { subject: "Feature request", body: "Could you add a dark mode option?" },
  { subject: "App crashes on upload", body: "It crashes every time I upload a large file." },
  { subject: "Cannot reset password", body: "The reset link in the email never arrives." },
  { subject: "Export not working", body: "Clicking export to CSV does nothing." },
  { subject: "Slow performance", body: "The dashboard takes ages to load recently." },
  { subject: "Refund request", body: "Can I get a refund for last month's charge?" },
  { subject: "Incorrect invoice", body: "My invoice shows the wrong plan name." },
  { subject: "General question", body: "How do I change my account email address?" },
];

const firstNames = [
  "Alex", "Priya", "Tom", "Grace", "Marcus", "Sofia", "Liam", "Noor", "Diego", "Hana",
  "Jordan", "Freya", "Sam", "Mei", "Oscar",
];

const lastNames = [
  "Rivera", "Nair", "Becker", "Lin", "Webb", "Rossi", "Byrne", "Haddad", "Cruz", "Suzuki",
  "Park", "Nilsson", "Osei", "Fischer", "Doyle",
];

async function seedTickets(count: number) {
  const agents = await prisma.user.findMany({ where: { isDeleted: false } });

  const data = Array.from({ length: count }, (_, i) => {
    const sample = sampleTickets[i % sampleTickets.length]!;
    const firstName = firstNames[i % firstNames.length]!;
    const lastName = lastNames[(i * 7) % lastNames.length]!;
    const assignToAgent = agents.length > 0 && i % 3 !== 0;

    return {
      subject: `${sample.subject} (#${i + 1})`,
      body: sample.body,
      senderName: `${firstName} ${lastName}`,
      senderEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      status: agentTicketStatuses[i % agentTicketStatuses.length]!,
      category: i % 3 === 0 ? null : ticketCategories[i % ticketCategories.length]!,
      assignedToId: assignToAgent ? agents[i % agents.length]!.id : null,
    };
  });

  await prisma.ticket.createMany({ data });
  console.log(`Created ${count} test tickets`);
}

await seedAdmin();
await seedTickets(40);
