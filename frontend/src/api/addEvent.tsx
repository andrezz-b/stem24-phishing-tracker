import {axiosPrivate} from "@api/config/axios.ts";
import {IAddEvent} from "@/interfaces/PhishingEventIntefaces";

export const addEvent = async (data: IAddEvent) => {
    const response = await axiosPrivate.post("/", {
        ...data
    })
    return response
}
