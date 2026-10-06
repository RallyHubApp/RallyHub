export class CommunicationsRepositoryPort {
 async saveCampaign(){throw new Error("NOT_IMPLEMENTED")}
 async listRecipients(){throw new Error("NOT_IMPLEMENTED")}
 async appendDeliveryEvent(){throw new Error("NOT_IMPLEMENTED")}
}
export class DeliveryProviderPort {
 async health(){throw new Error("NOT_IMPLEMENTED")}
 async send(){throw new Error("NOT_IMPLEMENTED")}
}
export class ClockPort { now(){return new Date()} }
export function assertProvider(provider){if(!provider||typeof provider.send!=="function")throw new Error("COMM_PROVIDER_INVALID");return provider}
