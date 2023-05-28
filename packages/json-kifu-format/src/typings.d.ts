declare module "*.pegjs" {
    // TODO: correctly type this. Parsed results are JSONKifuFormat but with missing properties which depends on the source format.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function parse(kifuString: string): any;
}
