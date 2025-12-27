import { z } from 'zod';
export declare const createCollateralSchema: z.ZodObject<{
    loanApplicationId: z.ZodString;
    fundName: z.ZodString;
    fundType: z.ZodEnum<["EQUITY", "DEBT", "HYBRID"]>;
    isin: z.ZodString;
    folioNumber: z.ZodOptional<z.ZodString>;
    units: z.ZodNumber;
    nav: z.ZodNumber;
    registrar: z.ZodDefault<z.ZodEnum<["CAMS", "KFINTECH", "MFCENTRAL"]>>;
}, "strip", z.ZodTypeAny, {
    loanApplicationId: string;
    fundName: string;
    fundType: "EQUITY" | "DEBT" | "HYBRID";
    isin: string;
    units: number;
    nav: number;
    registrar: "CAMS" | "KFINTECH" | "MFCENTRAL";
    folioNumber?: string | undefined;
}, {
    loanApplicationId: string;
    fundName: string;
    fundType: "EQUITY" | "DEBT" | "HYBRID";
    isin: string;
    units: number;
    nav: number;
    folioNumber?: string | undefined;
    registrar?: "CAMS" | "KFINTECH" | "MFCENTRAL" | undefined;
}>;
export declare const updateNavSchema: z.ZodObject<{
    nav: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    nav: number;
}, {
    nav: number;
}>;
export type CreateCollateralInput = z.infer<typeof createCollateralSchema>;
export type UpdateNavInput = z.infer<typeof updateNavSchema>;
//# sourceMappingURL=collaterals.schema.d.ts.map