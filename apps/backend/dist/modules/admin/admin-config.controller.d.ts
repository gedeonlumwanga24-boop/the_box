import { AdminConfigService } from "./admin-config.service";
export declare class AdminConfigController {
    private readonly service;
    constructor(service: AdminConfigService);
    findAll(): Promise<Record<string, string>>;
    update(body: Record<string, string | null | undefined>): Promise<Record<string, string>>;
}
