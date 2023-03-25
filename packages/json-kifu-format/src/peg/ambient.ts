declare module "*.pegjs" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function parse(kifuString: string): any;
}
