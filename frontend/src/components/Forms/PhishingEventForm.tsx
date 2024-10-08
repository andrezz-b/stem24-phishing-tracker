import {phishingEventSchema} from "@/schemas/PhishingEventSchema.ts";
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import z from "zod"
import {Button} from "@/components/ui/button.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input"
import {
    Select, SelectContent, SelectGroup, SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {getDnsRecords} from "@api/whois.ts";
import {IWhoisRecords} from "@/types/WhoisRecords";
import { EventsService } from "@/api/events";

const PhishingEventForm = () => {
    const [dnsRecords, setDnsRecords] = useState<IWhoisRecords | undefined>()
    const form = useForm<z.infer<typeof phishingEventSchema>>({
        resolver: zodResolver(phishingEventSchema),
        defaultValues: {
            name: "",
            brand: "",
            maliciousUrl: "",
            keyword: "",
            status: "todo",
            dnsRecords: []
        }
    })
    const {setValue, getValues, watch} = form
    const {mutate: addPhishingEvent} = EventsService.useCreateEvent();

    const getDomainInfo = async () => {
        const domainRecords = await getDnsRecords(getValues("maliciousUrl"))
        const createdDate = domainRecords.WhoisRecord.createdDate ?? domainRecords.WhoisRecord.registryData.createdDate
        console.log(createdDate, createdDate.toString())
        setValue("domainRegistrationDate", createdDate.toString())
    }


    const onSubmit = (data: z.infer<typeof phishingEventSchema>) => {
        addPhishingEvent({
            Name: data.name,
            Brand: data.brand,
            Description: "",
            MalURL: data.maliciousUrl,
            MalDomainRegDate: new Date(data.domainRegistrationDate),
            DnsRecord: data.dnsRecords.join(","),
            Date: new Date(),
        }, {
            onSuccess: () => {
                form.reset()
            }
        })
    }


    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-8 w-40 my-0 min-w-72">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-col space-y-2">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Add name for this phishing event
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Affected brand</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    What brands have been affected by this phishing
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="keyword"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Keywords</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Add keywords about this event separated by space, matching keywords can be for
                                    example brand
                                    name, product name
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="maliciousUrl"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Malicious Url</FormLabel>
                                <FormControl>
                                    <>
                                        <Input {...field}  />
                                        <Button type="button" onClick={getDomainInfo}>Get domain info</Button>
                                    </>
                                </FormControl>
                                <FormDescription>
                                    How does malicious url looks like
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>Date of creation of malicious url</FormLabel>
                        <FormControl>
                            <>
                                <Input disabled value={(watch("domainRegistrationDate") ?? "").toString() ?? ""}/>
                            </>
                        </FormControl>
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="status"
                        render={({field}) => (
                            <FormItem className="flex flex-col justify-normal items-center">
                                <FormLabel>Event Status</FormLabel>
                                <FormControl>
                                    <Select
                                        {...field}
                                        onValueChange={(value: "todo" | "in progress" | "done") => setValue("status", value)}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Set event status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="todo">Todo</SelectItem>
                                                <SelectItem value="in progress">In Progress</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>
                                    Select current status of this event
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />


                    <Button type="submit">Add event</Button>
                </form>
            </Form>
        </div>
    )
};

export default PhishingEventForm;
