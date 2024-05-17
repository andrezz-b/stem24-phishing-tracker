import z from "zod"
export const phishingEventSchema = z.object({
    name: z.string().min(2).max(50),
    brand: z.string().min(2).max(50),
    maliciousUrl: z.string().url(),
    domainRegistrationDate: z.string(),
    keyword:z.string(),
    status: z.enum(["todo", "in progress", "done"]),
    dnsRecords: z.array(z.string()),
})
